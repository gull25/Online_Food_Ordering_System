import React from 'react';
import Icon from '../../components/common/Icon';
import { useNavigate, Link } from 'react-router-dom';

import CartItem from '../../components/ui/CartItem';
import CheckoutProgress from '../../components/homeScreen/checkoutComponents/CheckoutProgress';
import DeliveryForm from '../../components/homeScreen/checkoutComponents/DeliveryForm';
import OrderSummary from '../../components/homeScreen/checkoutComponents/OrderSummary';
import PaymentMethods from '../../components/homeScreen/checkoutComponents/PaymentMethods';
import StripePaymentModal from '../../components/homeScreen/checkoutComponents/StripePaymentModal';
import EmptyCartState from '../../components/homeScreen/checkoutComponents/EmptyCartState';
import PaymentSuccessModal from '../../components/homeScreen/checkoutComponents/PaymentSuccessModal';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCheckout } from '../../hooks/useCheckout';
import { useTheme } from '../../contexts/ThemeContext';

// Initialize Stripe outside component to avoid recreating the object on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutPage = () => {
  const { theme } = useTheme();
  const {
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
  } = useCheckout();

  return (
    <div className="bg-background text-on-background min-h-screen relative flex flex-col">
      <main id="main-content" tabIndex={-1} className="pt-24 pb-16 px-margin_mobile md:px-margin_desktop max-w-container_max mx-auto flex-grow w-full">
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
                <EmptyCartState />
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

      
      {paymentModalOpen && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: theme === 'dark' ? 'night' : 'stripe' } }}>
          <StripePaymentModal
            amount={total}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </Elements>
      )}

      {paymentSuccessModalOpen && (
        <PaymentSuccessModal handleContinueAfterSuccess={handleContinueAfterSuccess} />
      )}
    </div>
  );
};

export default CheckoutPage;
