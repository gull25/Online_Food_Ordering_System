import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import Icon from "../../common/Icon";
import Modal from "../../Modals/Modal";
import { useApiAction } from "../../../hooks/useApiAction";

const StripePaymentModal = ({ amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");

  const { execute: handleSubmit, isSubmitting: isProcessing } = useApiAction(
    async (event) => {
      event.preventDefault();
      if (!stripe || !elements) return;

      setError("");

      const { error: submitError } = await stripe.confirmPayment({
        elements,
        // Success is handled locally rather than via a redirect round trip.
        redirect: "if_required",
      });

      if (submitError) {
        setError(submitError.message);
      } else {
        onSuccess();
      }
    },
  );

  return (
    <Modal
      isOpen
      // Dismissing the backdrop mid-payment would abandon a card authorisation
      // that may already be in flight, so the only way out is the explicit
      // cancel control — and that is disabled while processing.
      closeOnBackdrop={false}
      onClose={isProcessing ? undefined : onCancel}
      title="Payment details"
      description="Complete your purchase securely via Stripe."
      size="md"
    >
      <div className="space-y-stack_md">
        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4">
          <span className="font-label text-label uppercase tracking-wide text-on-surface">
            Total to pay
          </span>
          <span className="font-h3 text-h3 font-bold text-primary">
            ${amount.toFixed(2)}
          </span>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-error-container p-3 font-body text-small text-on-error-container animate-in fade-in slide-in-from-top-1"
          >
            <Icon name="error" className="mt-0.5 shrink-0 text-[18px]" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-stack_md">
          <PaymentElement />

          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary font-button text-button text-on-primary shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <Icon name="progress_activity" className="animate-spin" />
                <span>Processing payment…</span>
              </>
            ) : (
              <>
                <Icon name="lock" />
                <span>Pay ${amount.toFixed(2)}</span>
              </>
            )}
          </button>

          <p className="flex items-center justify-center gap-1.5 font-body text-label text-secondary">
            <Icon name="verified_user" className="text-[14px]" />
            <span>Secured by Stripe</span>
          </p>
        </form>
      </div>
    </Modal>
  );
};

export default StripePaymentModal;
