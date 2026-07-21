import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TopNavBar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CartItem from '../../components/ui/CartItem/CartItem';
import CheckoutProgress from './components/CheckoutProgress';
import DeliveryForm from './components/DeliveryForm';
import OrderSummary from './components/OrderSummary';
import PaymentMethods from './components/PaymentMethods';

const INITIAL_CART = [
  {
    id: 'truffle-pizza',
    name: 'Truffle Margherita Pizza',
    description: 'Traditional wood-fired crust, extra truffle oil',
    price: 24.00,
    quantity: 1,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_mtpk3c8CjM4DIdrJsfRD6y8IK5hXdqUg6jx2jB3qFByY3FF64XLXjqdTknP9EoT2DS8IsGN9msWUlzSIOJLNvFwu4iQ1CGMtH6gAEcpTp9BRyzWdN69Ezj6oX_PF9d_bS4tL8u7H6WYPa9T80EvozPnZQYUluqfrJkG_i94ZoNz60NH2OMBJt6Povq_H-Om8KvbMh_zQbI1jt9c3VBFaw4DIWyVvR-LGE_BPJWOsKxHYGxENOd6i8w',
  },
  {
    id: 'mushroom-risotto',
    name: 'Wild Mushroom Risotto',
    description: 'Carnaroli rice, seasonal mushrooms, parmesan',
    price: 19.00, // $38.00 total for 2 items in initial mockup
    quantity: 2,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCn8USwOiO0Az5jeLZZm1emlU5-1MCxrhoe4P8BIzqV5GFyX82-K95SAabnmqLu5cLPRhQg1UY3__wY06g_9uIP3gCobSKk5QW4J_x-Uktne15LTwhrTRxdzP3bFwOGdbsgTj99jnlRRh61dlSRJr8zPxhNpHqCeO7qwUQLEU_6S7zCmq46gRvbPBeF1WRVMK7MXLcpCN8gO_Eyi_leHnVL2p2ZJbJgFH1f3CVmSKXYKIxTpMR4f8I1Iw',
  },
];

const CheckoutPage = () => {
  const navigate = useNavigate();

  // State Management
  const [cartItems, setCartItems] = useState(INITIAL_CART);
  const [promoInput, setPromoInput] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('visa');
  const [deliveryPreference, setDeliveryPreference] = useState('meet');
  const [formError, setFormError] = useState('');

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
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const deleteItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (code === 'HELLO50') {
      setDiscountPercent(50);
      setPromoMessage('Promo code HELLO50 applied! 50% discount on subtotal.');
    } else if (code === 'FLASH80') {
      setDiscountPercent(80);
      setPromoMessage('Promo code FLASH80 applied! 80% discount on subtotal.');
    } else {
      setDiscountPercent(0);
      setPromoMessage('Invalid Promo Code.');
    }
  };

  const handleSubmitOrder = (e) => {
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

    // Simulate placing the order and navigate directly to Track Order page!
    navigate('/track-order');
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
                <div className="py-8 text-center">
                  <span className="material-symbols-outlined text-4xl text-on-secondary-container mb-2">
                    shopping_cart_off
                  </span>
                  <p className="text-secondary font-body">Your checkout cart is empty.</p>
                  <Link to="/" className="text-primary font-button hover:underline mt-2 inline-block">
                    Add delicious food
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
                className="w-full h-14 bg-primary-container text-white font-button text-button rounded-xl shadow-lg shadow-primary-container/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Place Order</span>
                <span className="material-symbols-outlined">arrow_forward</span>
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
    </div>
  );
};

export default CheckoutPage;
