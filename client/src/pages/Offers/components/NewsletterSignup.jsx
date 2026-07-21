import React from 'react';

const NewsletterSignup = ({ newsletterSubscribed, handleNewsletterSubmit, newsletterEmail, setNewsletterEmail }) => {
  return (
    <section className="bg-inverse-surface rounded-[24px] p-8 md:p-16 text-center relative overflow-hidden shadow-lg">
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-tertiary/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>
      <div className="relative z-10 max-w-2xl mx-auto">
        <span className="material-symbols-outlined text-primary-fixed text-[48px] mb-4">
          mail
        </span>
        <h2 className="font-h2 text-h2-mobile md:text-h2 text-white mb-4">
          Never miss a tasty deal
        </h2>
        <p className="text-surface-variant/80 font-body text-body mb-8">
          Join 50,000+ foodies receiving the best weekly promotions directly in their inbox.
        </p>

        {newsletterSubscribed ? (
          <div className="bg-white/10 text-white p-6 rounded-xl border border-white/20 backdrop-blur-sm max-w-lg mx-auto flex items-center justify-center gap-3 animate-in fade-in zoom-in-95">
            <span className="material-symbols-outlined text-[32px] text-tertiary-fixed">
              check_circle
            </span>
            <div className="text-left">
              <h4 className="font-button text-button">Successfully Subscribed!</h4>
              <p className="text-small text-surface-variant/80">
                We've sent a welcome email to your inbox.
              </p>
            </div>
          </div>
        ) : (
          <form
            className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
            onSubmit={handleNewsletterSubmit}
          >
            <input
              className="flex-grow px-6 py-4 rounded-xl border-none focus:ring-2 focus:ring-primary bg-white/10 text-white placeholder-white/50 backdrop-blur-sm outline-none font-body text-body"
              placeholder="Enter your email address"
              required
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
            />
            <button
              className="bg-primary text-on-primary px-8 py-4 rounded-xl font-button text-button hover:opacity-90 active:scale-95 transition-all shadow-lg whitespace-nowrap"
              type="submit"
            >
              Subscribe Now
            </button>
          </form>
        )}

        <p className="mt-4 text-[12px] text-surface-variant/50">
          By subscribing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </section>
  );
};

export default NewsletterSignup;
