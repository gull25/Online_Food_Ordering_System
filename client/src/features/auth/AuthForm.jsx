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
    register,
    handleSubmit,
    errors,
    toggleMode,
  } = useAuthForm();

  const [showPassword, setShowPassword] = React.useState(false);

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

      {/* Error Message from Global State or Form Validation */}
      {(errorMsg || Object.keys(errors).length > 0) && (
        <div className="w-full p-3 mb-4 bg-error-container text-on-error-container rounded-xl font-body text-small flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {typeof errorMsg === 'string' && errorMsg ? errorMsg : Object.values(errors)[0]?.message || 'Please fix the errors below'}
        </div>
      )}

      {/* Form Area */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-gutter">
        {/* Dynamic Fields for Register */}
        {isRegister && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-2">
              <label className="font-label text-label text-on-surface-variant uppercase tracking-wider">Full Name</label>
              <input {...register('name')} className={`w-full h-[52px] px-4 rounded-xl border transition-all font-body outline-none focus:ring-2 ${errors.name ? 'border-error focus:border-error focus:ring-error/20' : inputErrorClass}`} placeholder="John Doe" type="text" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label text-label text-on-surface-variant uppercase tracking-wider">Phone Number</label>
              <input {...register('phone')} className={`w-full h-[52px] px-4 rounded-xl border transition-all font-body outline-none focus:ring-2 ${errors.phone ? 'border-error focus:border-error focus:ring-error/20' : inputErrorClass}`} placeholder="+1 (555) 000-0000" type="tel" />
            </div>
          </div>
        )}

        {/* Shared Fields */}
        <div className="flex flex-col gap-2">
          <label className="font-label text-label text-on-surface-variant uppercase tracking-wider">Email Address</label>
          <input {...register('email')} className={`w-full h-[52px] px-4 rounded-xl border transition-all font-body outline-none focus:ring-2 ${errors.email ? 'border-error focus:border-error focus:ring-error/20' : inputErrorClass}`} placeholder="name@example.com" type="email" required />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="font-label text-label text-on-surface-variant uppercase tracking-wider">Password</label>
            {!isRegister && (
              <a className="text-small font-small text-primary hover:underline transition-all" href="#">Forgot Password?</a>
            )}
          </div>
          <div className="relative">
            <input {...register('password')} className={`w-full h-[52px] px-4 rounded-xl border transition-all font-body outline-none focus:ring-2 ${errors.password ? 'border-error focus:border-error focus:ring-error/20' : inputErrorClass}`} placeholder="••••••••" type={showPassword ? "text" : "password"} required />
            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors" type="button">
              <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
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
