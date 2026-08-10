import { useState, useCallback } from 'react';

/**
 * useApiAction
 * A custom hook to prevent duplicate API requests for single operations (e.g., forms, checkout).
 * 
 * @param {Function} actionFn The async function to execute.
 * @returns {Object} { execute, isSubmitting }
 */
export const useApiAction = (actionFn) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const execute = useCallback(async (...args) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      return await actionFn(...args);
    } finally {
      setIsSubmitting(false);
    }
  }, [actionFn, isSubmitting]);

  return { execute, isSubmitting };
};
