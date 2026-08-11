import React, { useEffect, useState } from 'react';
import Icon from '../../../../components/common/Icon';
import { useNavigate } from 'react-router-dom';
import api from '../../../../api/axios';
import { toast } from 'react-hot-toast';

const StripeReturnPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying your Stripe account...');
  const [error, setError] = useState(false);

  useEffect(() => {
    const verifyStripe = async () => {
      try {
        const res = await api.get('/stripe/verify');
        if (res.data.isComplete) {
          setStatus('Account successfully linked! Redirecting to dashboard...');
          toast.success('Stripe Connect onboarding complete!');
          setTimeout(() => navigate('/admin'), 2000);
        } else {
          setError(true);
          setStatus('Onboarding incomplete. Please try again.');
          toast.error('Stripe onboarding was not completed.');
        }
      } catch (err) {
        setError(true);
        setStatus('Failed to verify Stripe account. Please contact support.');
      }
    };
    verifyStripe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-surface-container-lowest p-10 rounded-3xl border border-outline-variant/30 shadow-xl max-w-md w-full">
        <Icon name={error ? 'error' : 'sync'} className={`text-6xl mb-6 ${error ? 'text-error' : 'text-primary animate-pulse'}`} />
        <h1 className="text-h2 font-h2 text-on-surface mb-4">Stripe Connect</h1>
        <p className="text-body font-body text-secondary mb-8">{status}</p>

        {error && (
          <button
            onClick={() => navigate('/admin/my-restaurant')}
            className="w-full py-3 bg-surface-container-highest text-on-surface rounded-xl font-button hover:bg-surface-variant transition-colors"
          >
            Return to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default StripeReturnPage;
