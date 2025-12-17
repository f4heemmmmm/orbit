/**
 * Split Bill Wizard Hook
 * Manages state for the multi-step split bill creation flow
 */

import { useState, useCallback } from 'react';
import type {
  SplitBillWizardState,
  WizardStep,
  ExtractedReceiptData,
  EditableBillItem,
  EditableParticipant,
  BillExtras,
} from '../types/splitBill';

/**
 * Generate a simple unique ID for temporary use in the wizard
 */
function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Initial wizard state
 */
function createInitialState(): SplitBillWizardState {
  return {
    step: 'scan',
    title: 'Receipt',
    editedItems: [],
    participants: [],
    assignments: {},
    extras: {
      taxAmount: 0,
      serviceCharge: 0,
      tipAmount: 0,
    },
  };
}

export interface UseSplitBillWizardReturn {
  // State
  state: SplitBillWizardState;

  // Navigation
  setStep: (step: WizardStep) => void;
  goToStep: (step: WizardStep) => void;
  canGoBack: boolean;
  goBack: () => void;

  // Receipt handling
  setImageUri: (uri: string) => void;
  setExtractedData: (data: ExtractedReceiptData) => void;
  setTitle: (title: string) => void;

  // Item management
  updateItem: (tempId: string, updates: Partial<EditableBillItem>) => void;
  addItem: () => string;
  removeItem: (tempId: string) => void;

  // Participant management
  addParticipant: (name: string) => string;
  removeParticipant: (tempId: string) => void;
  updateParticipantName: (tempId: string, name: string) => void;

  // Assignment management
  assignItemToParticipants: (itemTempId: string, participantTempIds: string[]) => void;
  toggleItemAssignment: (itemTempId: string, participantTempId: string) => void;
  getItemAssignees: (itemTempId: string) => string[];
  isItemAssigned: (itemTempId: string) => boolean;

  // Extras management
  updateExtras: (extras: Partial<BillExtras>) => void;

  // Utilities
  reset: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getUnassignedItemCount: () => number;
  areAllItemsAssigned: () => boolean;
}

export function useSplitBillWizard(): UseSplitBillWizardReturn {
  const [state, setState] = useState<SplitBillWizardState>(createInitialState);

  // ============================================
  // NAVIGATION
  // ============================================

  const setStep = useCallback((step: WizardStep) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  const goToStep = useCallback((step: WizardStep) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  const stepOrder: WizardStep[] = ['scan', 'validate', 'assign', 'review'];

  const canGoBack = state.step !== 'scan';

  const goBack = useCallback(() => {
    setState(prev => {
      const currentIndex = stepOrder.indexOf(prev.step);
      if (currentIndex > 0) {
        return { ...prev, step: stepOrder[currentIndex - 1] };
      }
      return prev;
    });
  }, []);

  // ============================================
  // RECEIPT HANDLING
  // ============================================

  const setImageUri = useCallback((imageUri: string) => {
    setState(prev => ({ ...prev, imageUri }));
  }, []);

  const setTitle = useCallback((title: string) => {
    setState(prev => ({ ...prev, title }));
  }, []);

  const setExtractedData = useCallback((data: ExtractedReceiptData) => {
    // Convert extracted items to editable items with temp IDs
    const editedItems: EditableBillItem[] = data.items.map(item => ({
      tempId: generateTempId(),
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      isEdited: false,
      confidence: item.confidence,
    }));

    setState(prev => ({
      ...prev,
      title: data.title || prev.title,
      extractedData: data,
      editedItems,
      extras: {
        taxAmount: data.taxAmount,
        serviceCharge: data.serviceCharge,
        tipAmount: data.tipAmount,
      },
    }));
  }, []);

  // ============================================
  // ITEM MANAGEMENT
  // ============================================

  const updateItem = useCallback((tempId: string, updates: Partial<EditableBillItem>) => {
    setState(prev => ({
      ...prev,
      editedItems: prev.editedItems.map(item => {
        if (item.tempId !== tempId) {
          return item;
        }

        const updated = { ...item, ...updates, isEdited: true };

        // Recalculate total price if quantity or unit price changed
        if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
          const qty = updates.quantity ?? item.quantity;
          const price = updates.unitPrice ?? item.unitPrice;
          updated.totalPrice = Math.round(qty * price * 100) / 100;
        }

        return updated;
      }),
    }));
  }, []);

  const addItem = useCallback((): string => {
    const newItem: EditableBillItem = {
      tempId: generateTempId(),
      name: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      isEdited: true,
    };

    setState(prev => ({
      ...prev,
      editedItems: [...prev.editedItems, newItem],
    }));

    return newItem.tempId;
  }, []);

  const removeItem = useCallback((tempId: string) => {
    setState(prev => {
      // Remove from items
      const editedItems = prev.editedItems.filter(i => i.tempId !== tempId);

      // Remove from assignments
      const assignments = { ...prev.assignments };
      delete assignments[tempId];

      return { ...prev, editedItems, assignments };
    });
  }, []);

  // ============================================
  // PARTICIPANT MANAGEMENT
  // ============================================

  const addParticipant = useCallback((name: string): string => {
    const newParticipant: EditableParticipant = {
      tempId: generateTempId(),
      name: name.trim(),
    };

    setState(prev => ({
      ...prev,
      participants: [...prev.participants, newParticipant],
    }));

    return newParticipant.tempId;
  }, []);

  const removeParticipant = useCallback((tempId: string) => {
    setState(prev => {
      // Remove from participants
      const participants = prev.participants.filter(p => p.tempId !== tempId);

      // Remove from all assignments
      const assignments: Record<string, string[]> = {};
      for (const [itemId, participantIds] of Object.entries(prev.assignments)) {
        const filtered = participantIds.filter(id => id !== tempId);
        if (filtered.length > 0) {
          assignments[itemId] = filtered;
        }
      }

      return { ...prev, participants, assignments };
    });
  }, []);

  const updateParticipantName = useCallback((tempId: string, name: string) => {
    setState(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.tempId === tempId ? { ...p, name: name.trim() } : p
      ),
    }));
  }, []);

  // ============================================
  // ASSIGNMENT MANAGEMENT
  // ============================================

  const assignItemToParticipants = useCallback(
    (itemTempId: string, participantTempIds: string[]) => {
      setState(prev => {
        const assignments = { ...prev.assignments };
        if (participantTempIds.length > 0) {
          assignments[itemTempId] = [...participantTempIds];
        } else {
          delete assignments[itemTempId];
        }
        return { ...prev, assignments };
      });
    },
    []
  );

  const toggleItemAssignment = useCallback((itemTempId: string, participantTempId: string) => {
    setState(prev => {
      const assignments = { ...prev.assignments };
      const current = assignments[itemTempId] || [];

      if (current.includes(participantTempId)) {
        // Remove assignment
        const filtered = current.filter(id => id !== participantTempId);
        if (filtered.length > 0) {
          assignments[itemTempId] = filtered;
        } else {
          delete assignments[itemTempId];
        }
      } else {
        // Add assignment
        assignments[itemTempId] = [...current, participantTempId];
      }

      return { ...prev, assignments };
    });
  }, []);

  const getItemAssignees = useCallback(
    (itemTempId: string): string[] => {
      return state.assignments[itemTempId] || [];
    },
    [state.assignments]
  );

  const isItemAssigned = useCallback(
    (itemTempId: string): boolean => {
      const assignees = state.assignments[itemTempId];
      return !!assignees && assignees.length > 0;
    },
    [state.assignments]
  );

  // ============================================
  // EXTRAS MANAGEMENT
  // ============================================

  const updateExtras = useCallback((extras: Partial<BillExtras>) => {
    setState(prev => ({
      ...prev,
      extras: { ...prev.extras, ...extras },
    }));
  }, []);

  // ============================================
  // UTILITIES
  // ============================================

  const reset = useCallback(() => {
    setState(createInitialState());
  }, []);

  const getSubtotal = useCallback((): number => {
    return state.editedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [state.editedItems]);

  const getTotal = useCallback((): number => {
    const subtotal = state.editedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    return subtotal + state.extras.taxAmount + state.extras.serviceCharge + state.extras.tipAmount;
  }, [state.editedItems, state.extras]);

  const getUnassignedItemCount = useCallback((): number => {
    return state.editedItems.filter(item => {
      const assignees = state.assignments[item.tempId];
      return !assignees || assignees.length === 0;
    }).length;
  }, [state.editedItems, state.assignments]);

  const areAllItemsAssigned = useCallback((): boolean => {
    return state.editedItems.every(item => {
      const assignees = state.assignments[item.tempId];
      return assignees && assignees.length > 0;
    });
  }, [state.editedItems, state.assignments]);

  return {
    state,
    setStep,
    goToStep,
    canGoBack,
    goBack,
    setImageUri,
    setExtractedData,
    setTitle,
    updateItem,
    addItem,
    removeItem,
    addParticipant,
    removeParticipant,
    updateParticipantName,
    assignItemToParticipants,
    toggleItemAssignment,
    getItemAssignees,
    isItemAssigned,
    updateExtras,
    reset,
    getSubtotal,
    getTotal,
    getUnassignedItemCount,
    areAllItemsAssigned,
  };
}
