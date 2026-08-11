import React, { useState, useMemo } from 'react';
import Icon from '../../components/common/Icon';
import { useNavigate, Link } from 'react-router-dom';
import TopNavBar from '../../components/layout/Navbar';
import HomeFooter from '../../components/homeScreen/homeScreenComponents/HomeFooter';
import CartItem from '../../components/ui/CartItem/CartItem';
import CheckoutProgress from '../../components/homeScreen/checkoutComponents/CheckoutProgress';
import DeliveryForm from '../../components/homeScreen/checkoutComponents/DeliveryForm';
import OrderSummary from '../../components/homeScreen/checkoutComponents/OrderSummary';
import PaymentMethods from '../../components/homeScreen/checkoutComponents/PaymentMethods';

import { useSelector, useDispatch } from 'react-redux';
import { clearCart, removeFromCart, addToCart, removeItemCompletely } from '../../redux/cartSlice';
import { createOrderThunk } from '../../redux/orderSlice';
import StripePaymentModal from '../../components/homeScreen/checkoutComponents/StripePaymentModal';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import api from '../../api/axios';
import { useApiAction } from '../../hooks/useApiAction';

// Initialize Stripe outside component to avoid recreating the object on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Read cart from Redux
  const cartItemsObj = useSelector((state) => state.cart.items);
  const cartRestaurantId = useSelector((state) => state.cart.restaurantId);
  // Convert { itemId: { item, quantity } } to an array for rendering
  const cartItems = useMemo(() => {
    return Object.values(cartItemsObj).map(cartItem => ({
      ...cartItem.item,
      quantity: cartItem.quantity,
      cartItemId: cartItem.cartItemId
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
  const [idempotencyKey] = useState(() => self.crypto.randomUUID ? self.crypto.randomUUID() : Date.now().toString());

  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentSuccessModalOpen, setPaymentSuccessModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [restaurantData, setRestaurantData] = useState(null);

  // Keyed on the restaurant id rather than the cart array: the previous version
  // re-fetched the restaurant every time a quantity changed, purely to read a
  // delivery fee that cannot change between those renders.
  React.useEffect(() => {
    if (!cartRestaurantId) {
      setRestaurantData(null);
      return;
    }

    let cancelled = false;
    const fetchRestaurant = async () => {
      try {
        const { default: api } = await import('../../api/axios');
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
    // Only step backwards if the user has moved past the details step —
    // this previously reset the progress indicator to 1 on every keystroke,
    // so the indicator jumped backwards while typing an address.
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
    const cartItem = cartItems.find(i => i.cartItemId === cartItemId);
    if (!cartItem) return;

    if (delta > 0) {
      dispatch(addToCart(cartItem));
    } else {
      dispatch(removeFromCart(cartItemId));
    }
  };

  /**
   * Removes a line in one action.
   *
   * This used to dispatch `removeFromCart` once per unit in a loop, so deleting
   * a quantity-8 line fired eight store updates and eight re-renders of the
   * whole checkout.
   */
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
      const { default: api } = await import('../../api/axios');
      const response = await api.get(`/public/offers/validate/${code}?restaurantId=${cartRestaurantId}`);

      setDiscountPercent(response.data.data.discountPercentage);
      setPromoMessage(`Promo code ${code} applied! ${response.data.data.discountPercentage}% discount on subtotal.`);
    } catch (error) {
      setDiscountPercent(0);
      setPromoMessage(error.response?.data?.message || 'Invalid or expired Promo Code.');
    }
  };

  const { execute: handleSubmitOrder, isSubmitting } = useApiAction(async (e) => {
    e.preventDefault();

    // Basic address form validation
    const { firstName, lastName, phone, city, streetAddress } = formData;
    if (!firstName || !lastName || !phone || !city || !streetAddress) {
      setFormError('Please fill in all required delivery details.');
      return;
    }

    if (cartItems.length === 0) {
      setFormError('Your cart is empty. Please add items to checkout.');
      return;
    }

    // We assume all cart items are from the same restaurant in this UI flow.
    const restaurantId = cartItems[0]?.restaurant?._id || cartItems[0]?.restaurant;

    const orderPayload = {
      restaurant: restaurantId,
      items: cartItems.map(i => ({
        menuItem: i._id || i.id,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        selectedSize: i.selectedSize,
        selectedAddOns: i.selectedAddOns
      })),
      totalAmount: total, // Still sent but ignored by backend for security
      deliveryAddress: formData,
      paymentMethod,
      promoCode: promoInput.trim().toUpperCase(),
      idempotencyKey
    };

    try {
      const resultAction = await dispatch(createOrderThunk(orderPayload)).unwrap();

      setCurrentStep(3);

      if (resultAction.paymentUrl) {
        // Redirect to Easypaisa or JazzCash
        dispatch(clearCart());
        window.location.href = resultAction.paymentUrl;
      } else if (resultAction.clientSecret) {
        // Open the Stripe modal
        setClientSecret(resultAction.clientSecret);
        setPendingOrderId(resultAction.order._id);
        setPaymentModalOpen(true);
      } else {
        // Cash on delivery or fully discounted
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

  // Computations
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const itemPrice = item.price + (item.selectedSize?.additionalPrice || 0) + (item.selectedAddOns?.reduce((s, a) => s + a.price, 0) || 0);
      return sum + itemPrice * item.quantity;
    }, 0);
  }, [cartItems]);

  const discountAmount = useMemo(() => {
    return subtotal * (discountPercent / 100);
  }, [subtotal, discountPercent]);

  const tax = useMemo(() => {
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    return taxableAmount * 0.087; // ~8.7% tax rate
  }, [subtotal, discountAmount]);

  const serviceFee = subtotal > 0 ? 2.50 : 0;

  // Dynamic Delivery Fee
  const deliveryFee = restaurantData?.deliveryFee || 0;

  const total = useMemo(() => {
    const calculatedTotal = subtotal - discountAmount + tax + serviceFee + deliveryFee;
    return Math.max(0, calculatedTotal);
  }, [subtotal, discountAmount, tax, serviceFee, deliveryFee]);

  return (
    <div className="bg-background text-on-background min-h-screen relative flex flex-col">
      <TopNavBar />

      <main className="pt-24 pb-16 px-margin_mobile md:px-margin_desktop max-w-container_max mx-auto flex-grow w-full">
        {/* Progress Indicator */}
        <CheckoutProgress currentStep={currentStep} />

        {formError && (
          <div className="max-w-4xl mx-auto p-4 mb-6 bg-error-container text-on-error-container rounded-xl font-body text-small flex items-center gap-2 shadow-sm animate-in fade-in">
            <Icon name="error" />
            <span>{formError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">

          {/* Left Column: Cart items and forms */}
          <div className="lg:col-span-8 flex flex-col gap-stack_lg">

            {/* Cart Items Section */}
            <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant">
              <h2 className="font-h3 text-h3 mb-6 font-bold text-on-surface">Review Your Order</h2>

              {cartItems.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center bg-surface-container-lowest rounded-xl">
                  <div className="w-24 h-24 bg-surface-variant rounded-full flex items-center justify-center mb-6">
                    <Icon name="shopping_cart_off" className="text-5xl text-on-surface-variant" />
                  </div>
                  <h3 className="text-h3 font-h3 mb-2 text-on-surface">Your Cart is Empty</h3>
                  <p className="text-body font-body text-secondary max-w-md mx-auto mb-6">Looks like you haven't added any delicious items to your cart yet.</p>
                  <Link to="/" className="px-6 h-12 bg-primary text-on-primary rounded-xl font-button text-button flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <span>Browse Restaurants</span>
                    <Icon name="arrow_forward" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.cartItemId}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onDelete={deleteItem}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Delivery Details Section */}
            <DeliveryForm
              formData={formData}
              handleInputChange={handleInputChange}
              handleSubmitOrder={handleSubmitOrder}
              deliveryPreference={deliveryPreference}
              setDeliveryPreference={handleDeliveryPreferenceChange}
            />
          </div>

          {/* Right Column: Order Summary & Checkout Action */}
          <div className="lg:col-span-4 flex flex-col gap-stack_lg">
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant sticky top-24">
              <h2 className="font-h3 text-h3 mb-6 font-bold text-on-surface">Order Summary</h2>

              <OrderSummary
                subtotal={subtotal}
                discountAmount={discountAmount}
                discountPercent={discountPercent}
                serviceFee={serviceFee}
                deliveryFee={deliveryFee}
                tax={tax}
                total={total}
                promoInput={promoInput}
                setPromoInput={setPromoInput}
                handleApplyPromo={handleApplyPromo}
                promoMessage={promoMessage}
              />

              {/* Payment selection methods */}
              <PaymentMethods
                paymentMethod={paymentMethod}
                setPaymentMethod={handlePaymentMethodChange}
              />

              {/* Submit Checkout Button */}
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className={`w-full h-14 bg-primary text-on-primary font-button text-button rounded-xl shadow-lg shadow-primary-container/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span>{isSubmitting ? 'Placing Order...' : 'Place Order'}</span>
                {!isSubmitting && <Icon name="arrow_forward" />}
              </button>

              <p className="text-center text-secondary text-[12px] mt-4 px-4">
                By placing your order, you agree to Foodora's{' '}
                <a className="underline hover:text-primary" href="#">
                  Terms of Service
                </a>
                .
              </p>
            </div>
          </div>

        </div>
      </main>

      <HomeFooter />

      {paymentModalOpen && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
          <StripePaymentModal
            amount={total}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </Elements>
      )}

      {paymentSuccessModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-6">
              <Icon name="check_circle" className="text-5xl" />
            </div>
            <h2 className="font-h3 text-h3 font-bold text-on-surface mb-2">Payment Successful!</h2>
            <p className="font-body text-body text-secondary mb-8">
              Your order has been securely placed and payment is confirmed.
            </p>
            <button
              onClick={handleContinueAfterSuccess}
              className="w-full h-14 bg-primary text-on-primary font-button text-button rounded-xl hover:opacity-90 transition-opacity shadow-lg"
            >
              Track Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
