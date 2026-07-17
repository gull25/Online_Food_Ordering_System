import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TopNavBar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CartItem from '../../components/ui/CartItem/CartItem';

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
        <div className="flex items-center justify-center mb-stack_lg gap-4 md:gap-12">
          <div className="flex items-center gap-2 step-active">
            <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-small border-primary text-primary">
              1
            </span>
            <span className="font-label text-label hidden sm:inline text-primary">Details & Delivery</span>
          </div>
          <div className="h-px w-8 md:w-16 bg-outline-variant"></div>
          <div className="flex items-center gap-2 text-secondary">
            <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-small">
              2
            </span>
            <span className="font-label text-label hidden sm:inline">Payment Option</span>
          </div>
          <div className="h-px w-8 md:w-16 bg-outline-variant"></div>
          <div className="flex items-center gap-2 text-secondary opacity-50">
            <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-small">
              3
            </span>
            <span className="font-label text-label hidden sm:inline">Confirmation</span>
          </div>
        </div>

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
            <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant">
              <h2 className="font-h3 text-h3 mb-6 font-bold text-on-surface">Delivery Details</h2>
              <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-label text-label text-secondary">First Name *</label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest font-body"
                    placeholder="John"
                    type="text"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label text-label text-secondary">Last Name *</label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest font-body"
                    placeholder="Doe"
                    type="text"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-label text-label text-secondary">Phone Number *</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest font-body"
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label text-label text-secondary">City *</label>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest font-body"
                    placeholder="New York"
                    type="text"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label class="font-label text-label text-secondary">Street Address *</label>
                  <input
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest font-body"
                    placeholder="123 Gastronomy Lane"
                    type="text"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-label text-label text-secondary">Delivery Instructions (Optional)</label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest font-body"
                    placeholder="Apartment buzzer, gate code, etc."
                    rows="3"
                  ></textarea>
                </div>
              </form>

              {/* Delivery Preference */}
              <div className="mt-8">
                <h4 className="font-bold text-body mb-4 text-on-surface">Delivery Preference</h4>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setDeliveryPreference('meet')}
                    className={`flex items-center justify-center gap-3 p-4 border-2 rounded-xl transition-all ${
                      deliveryPreference === 'meet'
                        ? 'border-primary bg-primary-fixed text-on-primary-fixed-variant'
                        : 'border-outline-variant bg-surface-container-lowest text-secondary hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="material-symbols-outlined">door_front</span>
                    <span className="font-button text-sm font-semibold">Meet at door</span>
                  </button>
                  <button
                    onClick={() => setDeliveryPreference('leave')}
                    className={`flex items-center justify-center gap-3 p-4 border-2 rounded-xl transition-all ${
                      deliveryPreference === 'leave'
                        ? 'border-primary bg-primary-fixed text-on-primary-fixed-variant'
                        : 'border-outline-variant bg-surface-container-lowest text-secondary hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="material-symbols-outlined">package_2</span>
                    <span className="font-button text-sm font-semibold">Leave at door</span>
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary & Checkout Action */}
          <div className="lg:col-span-4 flex flex-col gap-stack_lg">
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant sticky top-24">
              <h2 className="font-h3 text-h3 mb-6 font-bold text-on-surface">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-body">
                  <span className="text-secondary">Subtotal</span>
                  <span className="text-on-surface">${subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-body text-tertiary font-medium">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-body">
                  <span className="text-secondary">Delivery Fee</span>
                  <span className="text-tertiary font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-body">
                  <span className="text-secondary">Service Fee</span>
                  <span className="text-on-surface">${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-body">
                  <span className="text-secondary">Tax (8.7%)</span>
                  <span className="text-on-surface">${tax.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo input code */}
              <div className="flex flex-col gap-2 mb-6">
                <div className="flex items-center gap-2 p-1 border border-outline-variant rounded-xl overflow-hidden bg-surface-container-low">
                  <input
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="flex-grow px-3 py-2 bg-transparent focus:outline-none font-label text-label outline-none font-body"
                    placeholder="Promo code (e.g. HELLO50)"
                    type="text"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-secondary text-on-secondary rounded-lg font-button text-small hover:bg-on-secondary-fixed-variant transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <span
                    className={`text-xs px-2 font-medium ${
                      discountPercent > 0 ? 'text-tertiary' : 'text-error'
                    }`}
                  >
                    {promoMessage}
                  </span>
                )}
              </div>

              <div className="border-t border-outline-variant pt-4 mb-8">
                <div className="flex justify-between items-baseline">
                  <span className="font-h3 text-h3 font-bold text-on-surface">Total</span>
                  <span className="text-primary-container font-h2 text-h2-mobile md:text-h2 font-extrabold">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment selection methods */}
              <div className="mb-8">
                <h4 className="font-bold text-body mb-4 text-on-surface">Payment Method</h4>
                <div className="space-y-3">
                  <label
                    onClick={() => setPaymentMethod('visa')}
                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'visa'
                        ? 'border-primary bg-surface-container-low'
                        : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary">credit_card</span>
                      <div>
                        <p className="font-bold text-small text-on-surface">Visa ending in 4421</p>
                        <p className="text-secondary text-[10px]">Exp 09/26</p>
                      </div>
                    </div>
                    <input
                      checked={paymentMethod === 'visa'}
                      onChange={() => setPaymentMethod('visa')}
                      className="w-5 h-5 text-primary border-outline focus:ring-primary accent-primary"
                      name="payment"
                      type="radio"
                    />
                  </label>

                  <label
                    onClick={() => setPaymentMethod('apple')}
                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'apple'
                        ? 'border-primary bg-surface-container-low'
                        : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        alt="Apple Pay"
                        className="h-4 w-auto"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLcq3l5FEeVSxHCZwmeMz0s37FxVe9xHLFxaIzyWsSFHgGrPR2xef9W-QEarzqGyduN06KkYhmXsEJJZhUycq_cLf4cfFgeLX7fLSQy4KS_CqaLtut6sSyAX4RglBHUX4PgGRj4XjISuEnULd4lgC9t5JrAEz61_ZlQZqD4o3cwf6BKOwgGjYyT3VgGePd37amYWvhoWmhgjMhwbHo-YKxA6ACvS7M4W5d9LPSTKaaQ2kqDjOVDvFQLQ"
                      />
                      <span className="font-bold text-small text-on-surface">Apple Pay</span>
                    </div>
                    <input
                      checked={paymentMethod === 'apple'}
                      onChange={() => setPaymentMethod('apple')}
                      className="w-5 h-5 text-primary border-outline focus:ring-primary accent-primary"
                      name="payment"
                      type="radio"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => alert('Adding new payment methods is coming soon!')}
                    className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-outline-variant rounded-xl text-secondary hover:text-primary hover:border-primary transition-all group"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    <span className="font-button text-small">Add New Method</span>
                  </button>
                </div>
              </div>

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
