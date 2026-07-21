import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../api/authApi';

export const useAuthForm = () => {
  const [mode, setMode] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const isRegister = mode === 'register';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg(''); // Clear error on typing
    if (successMsg) setSuccessMsg(''); // Clear success on typing
  };

  const toggleMode = (newMode) => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      if (isRegister) {
        const data = await authService.register(formData);
        setIsSubmitting(false);
        setSuccessMsg(data.message || 'User is registered successfully!');
        setFormData({ name: '', phone: '', email: '', password: '' }); // Reset form
      } else {
        // MOCK LOGIN FOR UI TESTING
        const data = {
          token: 'mock-jwt-token',
          user: { name: 'Alex', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80' }
        };

        // Save Token
        localStorage.setItem('foodoraToken', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data.user));
        
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/restaurant/bella-cucina');
        }, 1500);
      }
      
    } catch (error) {
      setIsSubmitting(false);
      setErrorMsg(error.response?.data?.message || 'Something went wrong');
    }
  };

  return {
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
  };
};
