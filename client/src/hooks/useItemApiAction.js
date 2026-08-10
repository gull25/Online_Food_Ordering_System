import { useState, useCallback, useRef } from 'react';

/**
 * useItemApiAction
 * A custom hook to prevent duplicate API requests for list-based operations (e.g., deleting a specific row).
 * 
 * @param {Function} actionFn The async function to execute. The first argument MUST be the unique item ID.
 * @returns {Object} { execute, isSubmitting }
 */
export const useItemApiAction = (actionFn) => {
  const [submittingIds, setSubmittingIds] = useState(new Set());
  
  // Use a ref to ensure the execute function has the latest submittingIds state immediately
  // preventing a race condition where multiple rapid clicks read the same previous state.
  const activeIdsRef = useRef(new Set());

  const execute = useCallback(async (id, ...args) => {
    if (activeIdsRef.current.has(id)) return;

    activeIdsRef.current.add(id);
    setSubmittingIds(new Set(activeIdsRef.current));
    
    try {
      return await actionFn(id, ...args);
    } finally {
      activeIdsRef.current.delete(id);
      setSubmittingIds(new Set(activeIdsRef.current));
    }
  }, [actionFn]);

  const isSubmitting = useCallback((id) => submittingIds.has(id), [submittingIds]);

  return { execute, isSubmitting };
};
