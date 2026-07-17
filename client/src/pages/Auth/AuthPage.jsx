import React from 'react';
import '../../assets/styles/AuthPage.css';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../../features/auth/AuthForm';

const AuthPage = () => {
  const navigate = useNavigate();

  return (
    <main className="flex h-screen w-full flex-col md:flex-row bg-background text-on-background overflow-hidden">
      {/* Left Side: Visual Experience */}
      <section className="relative w-full h-1/3 md:w-1/2 md:h-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDHSsSQEVX1ARAbX1SPpxNyr1-DRdX4zu7fgDe5UqxTmkmKqVT4yc63ioD6v-MS8Y7VsinGE7Y4xaeQRfWX2XoG11ipmZQdXcN8K2ybKHxi6YR2xmx_T5T0Y2awvHWTi2ruN_mkv2QkTcBWZIq5FCbEhzcvjSadnJNWPcSJCy9YkwDCBcwViVF1wWwvu-ZO8ebn5pXlHJFexap2DmkituBTqr2hryoCbdUfGTv55lQG-pgHXEZ5WBFT3Q')" }}
        >
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent"></div>
        </div>
        
        {/* Back to Home Floating Button */}
        <button 
          onClick={() => navigate('/')}
          className="absolute top-margin_mobile left-margin_mobile md:top-margin_desktop md:left-margin_desktop z-20 flex items-center gap-2 px-4 py-2 bg-white/90 rounded-full shadow-md text-primary font-button text-button hover:bg-white transition-all transform active:scale-95"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Back to Home</span>
        </button>

        {/* Brand Logo Overlay (Desktop) */}
        <div className="hidden md:flex absolute bottom-margin_desktop left-margin_desktop flex-col gap-2 z-10">
          <h1 className="font-h1 text-h1 text-white drop-shadow-lg">Foodora</h1>
          <p className="font-body text-body text-white/90 max-w-sm drop-shadow-md">
            Elevate your dining experience with the finest restaurants delivered to your doorstep.
          </p>
        </div>
      </section>

      {/* Right Side: Authentication Shell */}
      <section className="w-full h-2/3 md:w-1/2 md:h-full bg-surface-container-lowest overflow-y-auto px-margin_mobile py-stack_lg flex">
        <div className="m-auto w-full flex justify-center">
          <AuthForm />
        </div>
      </section>
    </main>
  );
};

export default AuthPage;
