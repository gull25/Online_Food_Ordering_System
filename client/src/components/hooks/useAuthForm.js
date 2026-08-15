import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../redux/authSlice';
import authService from '../../api/authApi';
import { LOCAL_STORAGE_KEYS } from '../../constants/localStorageKeys';
import { APP_ROUTES } from '../../constants/appRoutes';
import { useApiAction } from '../../hooks/useApiAction';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  // No strength rules on the login form: they would reject a valid existing
  // password and advertise the policy to anyone probing the form.
  password: z.string().min(1, { message: 'Password is required' }),
});

/*
 * Mirrors the server's registration rules exactly (server/src/validations/
 * auth.validation.js). The client previously asked for 6 characters while the
 * server required 6 too -- but the server has since moved to 8 with a letter and
 * a digit, and a client that under-validates just turns a preventable mistake
 * into a round trip and a red banner.
 */
const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(128, { message: 'Password must be at most 128 characters' })
    .regex(/[a-zA-Z]/, { message: 'Password must contain a letter' })
    .regex(/\d/, { message: 'Password must contain a number' }),
  name: z.string().trim().min(2, { message: 'Name must be at least 2 characters' }),
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d[\d\s()-]{5,}$/, { message: 'Please enter a valid phone number' })
    .optional()
    .or(z.literal('')),
  role: z.enum(['customer', 'restaurant_admin', 'rider']).default('customer'),
});

export const useAuthForm = () => {
  const [mode, setMode] = useState('login');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const { error: errorMsg } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = mode === 'register';

  // Route guards redirect here with the page the user was actually after.
  // Honouring it means logging in resumes the journey instead of restarting it.
  const redirectTo = location.state?.from?.pathname || APP_ROUTES.HOME;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors
  } = useForm({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
    mode: 'onTouched'
  });

  const toggleMode = (newMode) => {
    setMode(newMode);
    dispatch(loginFailure(null)); // Clear global error
    setSuccessMsg('');
    reset();
    clearErrors();
  };

  const { execute: onSubmit, isSubmitting } = useApiAction(async (data) => {
    dispatch(loginStart());
    setSuccessMsg('');
    
    try {
      if (isRegister) {
        // An empty optional phone must not be sent as "" -- the server's schema
        // accepts the field as absent, not as a blank string.
        const payload = { ...data };
        if (!payload.phone) delete payload.phone;

        const response = await authService.register(payload);
        dispatch(loginFailure(null)); // just to stop loading
        setSuccessMsg(response?.message || 'Account created! You can log in now.');
        reset();
        // Drop the user straight onto the login tab — registering and then
        // hunting for the login toggle is a needless extra step.
        setTimeout(() => {
          setMode('login');
          setSuccessMsg('Account created! Please log in.');
        }, 1200);
      } else {
        // ── Real API login — role comes from the database ──────────────
        const response = await authService.login({ email: data.email, password: data.password });

        // Persist session
        localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, response.token);
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER_INFO, JSON.stringify(response.user));

        // Update Redux — user.role is exactly what the DB returned
        dispatch(loginSuccess(response.user));
        setIsSuccess(true);

        // Short beat so the success state registers visually, then route by
        // role. 1.5s read as the app hanging, so this is deliberately brief.
        setTimeout(() => {
          if (response.user.role === 'restaurant_admin' || response.user.role === 'admin') {
            navigate(APP_ROUTES.ADMIN_DASHBOARD, { replace: true });
          } else if (response.user.role === 'rider') {
            navigate(APP_ROUTES.RIDER_DASHBOARD, { replace: true });
          } else {
            navigate(redirectTo, { replace: true });
          }
        }, 650);
      }

    } catch (error) {
      dispatch(loginFailure(error.response?.data?.message || 'Something went wrong'));
    }
  });

  return {
    mode,
    isRegister,
    isSubmitting,
    isSuccess,
    errorMsg,
    successMsg,
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    toggleMode,
  };
};
