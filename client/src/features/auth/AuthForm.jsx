import React from 'react';
import { useAuthForm } from '../../hooks/useAuthForm';

const AuthForm = () => {
  const {
    mode,
    isRegister,
    isSubmitting,
    isSuccess,
    errorMsg,
    successMsg,
    formData,
    handleChange,
    handleSubmit,
    toggleMode,
  } = useAuthForm();

  const inputErrorClass = errorMsg 
    ? 'border-error focus:border-error focus:ring-error/20' 
    : 'border-outline-variant focus:border-primary focus:ring-primary/20';

  return (
    <div className="w-full max-w-[440px] flex flex-col items-center" id="auth-container">
      {/* Mobile Logo */}
      <div className="md:hidden mb-stack_lg flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
        <h2 className="font-h2-mobile text-h2-mobile text-primary font-extrabold tracking-tight">Foodora</h2>
      </div>

      {/* Form Header */}
      <div className="text-center mb-stack_lg w-full">
        <h2 className="font-h2 text-h2 md:text-h2 text-on-surface mb-2">
          {isRegister ? 'Join Foodora' : 'Welcome Back'}
        </h2>
        <p className="font-body text-body text-on-secondary-container">
          {isRegister ? 'Start your premium culinary journey today' : 'Enter your details to access your account'}
        </p>
      </div>

      {/* Auth Toggle */}
      <div className="w-full p-1 bg-surface-container-low rounded-xl mb-stack_md flex">
        <button
          type="button"
          onClick={() => toggleMode('login')}
          className={`flex-1 py-3 font-button text-button rounded-lg transition-all ${!isRegister ? 'bg-white shadow-sm text-primary font-bold' : 'text-secondary hover:text-on-surface'}`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => toggleMode('register')}
          className={`flex-1 py-3 font-button text-button rounded-lg transition-all ${isRegister ? 'bg-white shadow-sm text-primary font-bold' : 'text-secondary hover:text-on-surface'}`}
        >
          Register
        </button>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="w-full p-3 mb-4 bg-error-container text-on-error-container rounded-xl font-body text-small flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {errorMsg}
        </div>
      )}

      {/* Form Area */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-gutter">
        {/* Dynamic Fields for Register */}
        {isRegister && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-2">
              <label className="font-label text-label text-on-surface-variant uppercase tracking-wider">Full Name</label>
              <input name="name" value={formData.name} onChange={handleChange} className={`w-full h-[52px] px-4 rounded-xl border transition-all font-body outline-none focus:ring-2 ${inputErrorClass}`} placeholder="John Doe" type="text" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label text-label text-on-surface-variant uppercase tracking-wider">Phone Number</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className={`w-full h-[52px] px-4 rounded-xl border transition-all font-body outline-none focus:ring-2 ${inputErrorClass}`} placeholder="+1 (555) 000-0000" type="tel" />
            </div>
          </div>
        )}

        {/* Shared Fields */}
        <div className="flex flex-col gap-2">
          <label className="font-label text-label text-on-surface-variant uppercase tracking-wider">Email Address</label>
          <input name="email" value={formData.email} onChange={handleChange} className={`w-full h-[52px] px-4 rounded-xl border transition-all font-body outline-none focus:ring-2 ${inputErrorClass}`} placeholder="name@example.com" type="email" required />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="font-label text-label text-on-surface-variant uppercase tracking-wider">Password</label>
            {!isRegister && (
              <a className="text-small font-small text-primary hover:underline transition-all" href="#">Forgot Password?</a>
            )}
          </div>
          <div className="relative">
            <input name="password" value={formData.password} onChange={handleChange} className={`w-full h-[52px] px-4 rounded-xl border transition-all font-body outline-none focus:ring-2 ${inputErrorClass}`} placeholder="••••••••" type="password" required />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors" type="button">
              <span className="material-symbols-outlined">visibility</span>
            </button>
          </div>
        </div>

        {/* Primary CTA */}
        <button
          disabled={isSubmitting || isSuccess}
          className={`w-full h-[56px] font-button text-button rounded-xl shadow-lg transition-all duration-200 text-white flex items-center justify-center ${isSuccess ? 'bg-tertiary hover:bg-tertiary' : 'bg-primary-container hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98]'}`}
          type="submit"
        >
          {isSubmitting ? (
            <span className="inline-block animate-spin material-symbols-outlined">sync</span>
          ) : isSuccess ? (
            'Success!'
          ) : isRegister ? (
            'Create Account'
          ) : (
            'Login'
          )}
        </button>
      </form>

      {/* Success Popup at the bottom of the form */}
      {successMsg && (
        <div className="w-full p-3 mt-4 bg-tertiary/10 text-tertiary rounded-xl font-body text-small flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {successMsg}
        </div>
      )}

      {/* Divider */}
      <div className="w-full flex items-center gap-4 my-stack_lg">
        <div className="h-[1px] flex-1 bg-outline-variant"></div>
        <span className="font-label text-label text-on-secondary-container">OR CONTINUE WITH</span>
        <div className="h-[1px] flex-1 bg-outline-variant"></div>
      </div>

      {/* Social Logins */}
      <div className="w-full grid grid-cols-2 gap-4">
        <button type="button" className="flex items-center justify-center gap-3 h-[52px] border border-outline-variant rounded-xl hover:bg-surface-container-low transition-all active:scale-95">
          <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2H9vjr9Hodh9NfIZxq2c0g7CSBOWsRlB2yRAB-T_QLz4GK9BqudBWwT1OJZu9zUw3qSq1jxVnbjUcNN5RmdT3UYJu9CASXWuzfvOA65a_VIRGozBBLmVRU4v8imb-HbelgZXBV4ryhC5nHYmQNFUon9u6Jqk-YAk3mHahZT-MqHr_Mev05ow57GsXRAhsXlSu8JjqJftv9s0f3whL72n-AVu8f7c6mR7cHOydc9HOiSciGxXvUL84GA" />
          <span className="font-button text-button text-on-surface">Google</span>
        </button>
        <button type="button" className="flex items-center justify-center gap-3 h-[52px] border border-outline-variant rounded-xl hover:bg-surface-container-low transition-all active:scale-95">
          <span className="material-symbols-outlined text-[24px]">apps</span>
          <span className="font-button text-button text-on-surface">Apple</span>
        </button>
      </div>

      {/* Bottom Toggle Link */}
      <p className="mt-stack_lg font-body text-body text-on-secondary-container">
        <span>{isRegister ? 'Already have an account?' : "Don't have an account?"}</span>
        <button
          type="button"
          onClick={() => toggleMode(isRegister ? 'login' : 'register')}
          className="text-primary font-bold hover:underline ml-1"
        >
          {isRegister ? 'Login' : 'Create Account'}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;
