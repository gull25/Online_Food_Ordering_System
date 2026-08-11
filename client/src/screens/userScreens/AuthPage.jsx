import React from 'react';

import Icon from '../../components/common/Icon';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthForm from './AuthForm';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  return (
    <main className="flex h-screen w-full flex-col md:flex-row bg-background text-on-background overflow-hidden">
      {/* Left Side: Visual Experience */}
      <section className="relative w-full h-1/3 md:w-1/2 md:h-full overflow-hidden">
        <img
          src="https://res.cloudinary.com/hheb1mcz/image/upload/v1786392552/menu/vcdagx2uwsbxkqmzu1tf.jpg"
          alt="Auth Background"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent"></div>

        {/* Back to Home Floating Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-margin_mobile left-margin_mobile md:top-margin_desktop md:left-margin_desktop z-20 flex items-center gap-2 px-4 py-2 bg-white/90 rounded-full shadow-md text-primary font-button text-button hover:bg-white transition-all transform active:scale-95"
        >
          <Icon name="arrow_back" />
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
      <section className="w-full h-2/3 md:w-1/2 md:h-full bg-surface-container-lowest overflow-y-auto px-margin_mobile py-stack_lg flex flex-col items-center justify-center">
        {message && (
          <div className="max-w-md w-full mb-6 p-4 bg-tertiary-container text-on-tertiary-container rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
            <Icon name="info" />
            <p className="font-body text-body font-medium">{message}</p>
          </div>
        )}
        <div className="w-full flex justify-center">
          <AuthForm />
        </div>
      </section>
    </main>
  );
};

export default AuthPage;
