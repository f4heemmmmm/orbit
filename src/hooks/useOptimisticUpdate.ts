import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

/**
 * Hook for optimistic UI updates with automatic rollback on failure
 * @param updateFn - Async function that performs the update
 * @param errorMessage - Error message to display on failure
 * @returns Function to perform optimistic update
 */
export function useOptimisticUpdate<T>(
  updateFn: (item: T) => Promise<T | null>,
  errorMessage: string = 'Failed to update. Please try again.'
) {
  const [isUpdating, setIsUpdating] = useState(false);

  const performUpdate = useCallback(
    async (
      items: T[],
      itemId: string | number,
      optimisticUpdate: (item: T) => T,
      setItems: (items: T[]) => void,
      getId: (item: T) => string | number
    ): Promise<boolean> => {
      setIsUpdating(true);

      // Store original state for rollback
      const originalItems = [...items];

      // Apply optimistic update
      const updatedItems = items.map(item =>
        getId(item) === itemId ? optimisticUpdate(item) : item
      );
      setItems(updatedItems);

      try {
        // Find the updated item
        const updatedItem = updatedItems.find(item => getId(item) === itemId);
        if (!updatedItem) {
          throw new Error('Item not found');
        }

        // Perform actual update
        const result = await updateFn(updatedItem);

        if (!result) {
          // Rollback on failure
          setItems(originalItems);
          Alert.alert('Error', errorMessage);
          return false;
        }

        return true;
      } catch (error) {
        console.error('Optimistic update error:', error);
        // Rollback on error
        setItems(originalItems);
        Alert.alert('Error', errorMessage);
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [updateFn, errorMessage]
  );

  return {
    performUpdate,
    isUpdating,
  };
}
