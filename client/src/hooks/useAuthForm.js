import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../features/auth/authSlice';
import authService from '../api/authApi';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  phone: z.string().optional(),
});

export const useAuthForm = () => {
  const [mode, setMode] = useState('login');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const { loading: isSubmitting, error: errorMsg } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isRegister = mode === 'register';

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

  const onSubmit = async (data) => {
    dispatch(loginStart());
    setSuccessMsg('');
    
    try {
      if (isRegister) {
        const response = await authService.register(data);
        dispatch(loginFailure(null)); // just to stop loading
        setSuccessMsg(response?.message || 'User is registered successfully!');
        reset();
      } else {
        // ── Real API login — role comes from the database ──────────────
        const response = await authService.login({ email: data.email, password: data.password });

        // Persist session
        localStorage.setItem('foodoraToken', response.token);
        localStorage.setItem('userInfo', JSON.stringify(response.user));

        // Update Redux — user.role is exactly what the DB returned
        dispatch(loginSuccess(response.user));
        setIsSuccess(true);

        // All users (customer + admin) land on the restaurant page.
        // If the user is admin, the Navbar will show "Admin Dashboard"
        // and they can navigate there whenever they choose.
        setTimeout(() => {
          navigate('/restaurant/bella-cucina');
        }, 1500);
      }
      
    } catch (error) {
      dispatch(loginFailure(error.response?.data?.message || 'Something went wrong'));
    }
  };

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
