import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TopNavBar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CartItem from '../../components/ui/CartItem/CartItem';
import CheckoutProgress from './components/CheckoutProgress';
import DeliveryForm from './components/DeliveryForm';
import OrderSummary from './components/OrderSummary';
import PaymentMethods from './components/PaymentMethods';

import { useSelector, useDispatch } from 'react-redux';
import { clearCart, removeFromCart, addToCart } from '../../features/cart/cartSlice';
import { createOrderThunk } from '../../features/orders/orderSlice';
import StripePaymentModal from './components/StripePaymentModal';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Initialize Stripe outside component to avoid recreating the object on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Read cart from Redux
  const cartItemsObj = useSelector((state) => state.cart.items);
  // Convert { itemId: { item, quantity } } to an array for rendering
  const cartItems = useMemo(() => {
    return Object.values(cartItemsObj).map(cartItem => ({
      ...cartItem.item,
      quantity: cartItem.quantity
    }));
  }, [cartItemsObj]);

  // State Management
  const [promoInput, setPromoInput] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('visa');
  const [deliveryPreference, setDeliveryPreference] = useState('meet');
  const [formError, setFormError] = useState('');
  
  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [pendingOrderId, setPendingOrderId] = useState(null);

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
  };

  const updateQuantity = (id, delta) => {
    const cartItem = cartItems.find(i => (i.id || i._id) === id);
    if (!cartItem) return;
    
    if (delta > 0) {
      dispatch(addToCart(cartItem));
    } else {
      dispatch(removeFromCart(id));
    }
  };

  const deleteItem = (id) => {
    // Hack: Call removeFromCart multiple times or create a new action. 
    // Since we need to remove the whole item, let's just clear it from Redux.
    // Wait, removeFromCart handles full deletion if quantity reaches 1, 
    // but a proper deleteFromCart would be better. For now, we can loop or add a delete action later.
    // Let's just dispatch removeFromCart until quantity is 0
    const cartItem = cartItems.find(i => (i.id || i._id) === id);
    if (cartItem) {
        for(let i=0; i<cartItem.quantity; i++) {
           dispatch(removeFromCart(id));
        }
    }
  };

  const handleApplyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    try {
      // For legacy test codes, handle them locally if we want, or rely entirely on DB.
      // We rely entirely on the new DB API.
      // Note: we need to import api from '../../api/axios';
      // Wait, is 'api' imported in this file? I should check.
      // Assuming it's not imported since this is a new API call, I should add the import if needed.
      // Let's first try just fetch or axios directly if api is not imported. 
      // Actually, I can just use `fetch` or `axios` or Redux. I'll import `api` at the top of the file.
      // Let's replace the whole function.
      setPromoMessage('Validating...');
      const { default: api } = await import('../../api/axios');
      const response = await api.get(`/public/offers/validate/${code}`);
      
      setDiscountPercent(response.data.data.discountPercentage);
      setPromoMessage(`Promo code ${code} applied! ${response.data.data.discountPercentage}% discount on subtotal.`);
    } catch (error) {
      setDiscountPercent(0);
      setPromoMessage(error.response?.data?.message || 'Invalid or expired Promo Code.');
    }
  };

  const { loading: isSubmitting } = useSelector(state => state.orders);

  const handleSubmitOrder = async (e) => {
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
    const restaurantId = cartItems[0]?.restaurant || cartItems[0]?.restaurantId; // Depends on your MenuItem schema

    const orderPayload = {
        restaurant: restaurantId,
        items: cartItems.map(i => ({
            menuItem: i._id || i.id,
            name: i.name,
            quantity: i.quantity,
            price: i.price
        })),
        totalAmount: total, // Still sent but ignored by backend for security
        deliveryAddress: formData,
        paymentMethod,
        promoCode: promoInput.trim().toUpperCase()
    };

    try {
        const resultAction = await dispatch(createOrderThunk(orderPayload)).unwrap();
        
        if (resultAction.clientSecret) {
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
  };

  const handlePaymentSuccess = () => {
    setPaymentModalOpen(false);
    
    // In Stripe's redirect='if_required' flow, the webhook will still hit the backend asynchronously.
    // We just navigate to track order locally.
    dispatch(clearCart());
    navigate(`/track-order?orderId=${pendingOrderId}`);
  };

  const handlePaymentCancel = () => {
    setPaymentModalOpen(false);
    setFormError('Payment was cancelled. You can try again.');
  };

  // Computations
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const discountAmount = useMemo(() => {
    return subtotal * (discountPercent / 100);
  }, [subtotal, discountPercent]);

  const tax = useMemo(() => {
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    return taxableAmount * 0.087; // ~8.7% tax rate
  }, [subtotal, discountAmount]);

  const serviceFee = subtotal > 0 ? 2.50 : 0;
  const deliveryFee = 0;

  const total = useMemo(() => {
    const calculatedTotal = subtotal - discountAmount + tax + serviceFee + deliveryFee;
    return Math.max(0, calculatedTotal);
  }, [subtotal, discountAmount, tax, serviceFee]);

  return (
    <div className="bg-background text-on-background min-h-screen relative flex flex-col">
      <TopNavBar />

      <main className="pt-24 pb-16 px-margin_mobile md:px-margin_desktop max-w-container_max mx-auto flex-grow w-full">
        {/* Progress Indicator */}
        <CheckoutProgress />

        {formError && (
          <div className="max-w-4xl mx-auto p-4 mb-6 bg-error-container text-on-error-container rounded-xl font-body text-small flex items-center gap-2 shadow-sm animate-in fade-in">
            <span className="material-symbols-outlined">error</span>
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
                    <span className="material-symbols-outlined text-5xl text-on-surface-variant">
                      shopping_cart_off
                    </span>
                  </div>
                  <h3 className="text-h3 font-h3 mb-2 text-on-surface">Your Cart is Empty</h3>
                  <p className="text-body font-body text-secondary max-w-md mx-auto mb-6">Looks like you haven't added any delicious items to your cart yet.</p>
                  <Link to="/" className="px-6 h-12 bg-primary text-on-primary rounded-xl font-button text-button flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <span>Browse Restaurants</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.id}
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
              setDeliveryPreference={setDeliveryPreference}
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
                setPaymentMethod={setPaymentMethod}
              />

              {/* Submit Checkout Button */}
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className={`w-full h-14 bg-primary-container text-white font-button text-button rounded-xl shadow-lg shadow-primary-container/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span>{isSubmitting ? 'Placing Order...' : 'Place Order'}</span>
                {!isSubmitting && <span className="material-symbols-outlined">arrow_forward</span>}
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

      <Footer />

      {paymentModalOpen && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
          <StripePaymentModal 
            amount={total}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </Elements>
      )}
    </div>
  );
};

export default CheckoutPage;
