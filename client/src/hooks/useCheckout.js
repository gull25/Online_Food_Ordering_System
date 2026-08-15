import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart, removeFromCart, addToCart, removeItemCompletely } from '../redux/cartSlice';
import { createOrderThunk } from '../redux/orderSlice';
import { useApiAction } from './useApiAction';
import { calculateTotals, unitPrice } from '../helper/pricing';
import api from '../api/axios';

export const useCheckout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Read cart from Redux
  const cartItemsObj = useSelector((state) => state.cart.items);
  const cartRestaurantId = useSelector((state) => state.cart.restaurantId);

  // Convert { itemId: { item, quantity } } to an array for rendering
  const cartItems = useMemo(() => {
    return Object.values(cartItemsObj).map((cartItem) => ({
      ...cartItem.item,
      quantity: cartItem.quantity,
      cartItemId: cartItem.cartItemId,
    }));
  }, [cartItemsObj]);

  // State Management
  const [promoInput, setPromoInput] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [deliveryPreference, setDeliveryPreference] = useState('meet');
  const [formError, setFormError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [idempotencyKey] = useState(() =>
    self.crypto.randomUUID ? self.crypto.randomUUID() : Date.now().toString()
  );

  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentSuccessModalOpen, setPaymentSuccessModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [restaurantData, setRestaurantData] = useState(null);

  useEffect(() => {
    if (!cartRestaurantId) {
      setRestaurantData(null);
      return;
    }

    let cancelled = false;
    const fetchRestaurant = async () => {
      try {
        const { default: api } = await import('../api/axios');
        const res = await api.get(`/restaurants/${cartRestaurantId}`);
        if (!cancelled) setRestaurantData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch restaurant for checkout', err);
      }
    };
    fetchRestaurant();

    return () => {
      cancelled = true;
    };
  }, [cartRestaurantId]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    streetAddress: '',
    instructions: '',
  });

  // Event Handlers
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError('');
    setCurrentStep((step) => (step > 1 ? 1 : step));
  };

  const handleDeliveryPreferenceChange = (pref) => {
    setDeliveryPreference(pref);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setCurrentStep(2);
  };

  const updateQuantity = (cartItemId, delta) => {
    const cartItem = cartItems.find((i) => i.cartItemId === cartItemId);
    if (!cartItem) return;

    if (delta > 0) {
      dispatch(addToCart(cartItem));
    } else {
      dispatch(removeFromCart(cartItemId));
    }
  };

  const deleteItem = (cartItemId) => {
    dispatch(removeItemCompletely(cartItemId));
  };

  const handleApplyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    try {
      if (!cartRestaurantId) {
        setPromoMessage('Please add items to your cart first.');
        return;
      }
      setPromoMessage('Validating...');
      const { default: api } = await import('../api/axios');
      const response = await api.get(
        `/public/offers/validate/${code}?restaurantId=${cartRestaurantId}`
      );

      setDiscountPercent(response.data.data.discountPercentage);
      setPromoMessage(
        `Promo code ${code} applied! ${response.data.data.discountPercentage}% discount on subtotal.`
      );
    } catch (error) {
      setDiscountPercent(0);
      setPromoMessage(error.response?.data?.message || 'Invalid or expired Promo Code.');
    }
  };

  const { execute: handleSubmitOrder, isSubmitting } = useApiAction(async (e) => {
    e.preventDefault();

    const { firstName, lastName, phone, city, streetAddress } = formData;
    if (!firstName || !lastName || !phone || !city || !streetAddress) {
      setFormError('Please fill in all required delivery details.');
      return;
    }

    if (cartItems.length === 0) {
      setFormError('Your cart is empty. Please add items to checkout.');
      return;
    }

    const restaurantId = cartItems[0]?.restaurant?._id || cartItems[0]?.restaurant;

    const orderPayload = {
      restaurant: restaurantId,
      items: cartItems.map((item) => ({
        menuItem: item._id || item.id,
        quantity: item.quantity,
        ...(item.selectedSize ? { selectedSize: { name: item.selectedSize.name } } : {}),
        selectedAddOns: (item.selectedAddOns ?? []).map((addOn) => ({ name: addOn.name })),
      })),
      deliveryAddress: formData,
      paymentMethod,
      ...(promoInput.trim() ? { promoCode: promoInput.trim().toUpperCase() } : {}),
      idempotencyKey,
    };

    try {
      const resultAction = await dispatch(createOrderThunk(orderPayload)).unwrap();

      setCurrentStep(3);

      if (resultAction.paymentUrl) {
        dispatch(clearCart());
        window.location.href = resultAction.paymentUrl;
      } else if (resultAction.clientSecret) {
        setClientSecret(resultAction.clientSecret);
        setPendingOrderId(resultAction.order._id);
        setPaymentModalOpen(true);
      } else {
        dispatch(clearCart());
        navigate(`/track-order?orderId=${resultAction.order._id}`);
      }
    } catch (err) {
      setFormError(err || 'Failed to place order.');
    }
  });

  const handlePaymentSuccess = async () => {
    try {
      await api.post('/payments/verify-stripe', { orderId: pendingOrderId });
    } catch (err) {
      console.error('Failed to verify payment with backend:', err);
    }
    setPaymentModalOpen(false);
    setPaymentSuccessModalOpen(true);
  };

  const handleContinueAfterSuccess = () => {
    setPaymentSuccessModalOpen(false);
    dispatch(clearCart());
    navigate(`/track-order?orderId=${pendingOrderId}`);
  };

  const handlePaymentCancel = () => {
    setPaymentModalOpen(false);
    setFormError('Payment was cancelled. You can try again.');
  };

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0),
    [cartItems]
  );

  const { discountAmount, tax, serviceFee, deliveryFee, total } = useMemo(
    () =>
      calculateTotals({
        subtotal,
        discountPercent,
        deliveryFee: restaurantData?.deliveryFee || 0,
      }),
    [subtotal, discountPercent, restaurantData?.deliveryFee]
  );

  return {
    cartItems,
    formData,
    promoInput,
    setPromoInput,
    discountPercent,
    promoMessage,
    paymentMethod,
    setPaymentMethod,
    deliveryPreference,
    setDeliveryPreference,
    formError,
    currentStep,
    paymentModalOpen,
    paymentSuccessModalOpen,
    clientSecret,
    subtotal,
    discountAmount,
    tax,
    serviceFee,
    deliveryFee,
    total,
    handleInputChange,
    handleDeliveryPreferenceChange,
    handlePaymentMethodChange,
    updateQuantity,
    deleteItem,
    handleApplyPromo,
    handleSubmitOrder,
    isSubmitting,
    handlePaymentSuccess,
    handleContinueAfterSuccess,
    handlePaymentCancel,
  };
};
