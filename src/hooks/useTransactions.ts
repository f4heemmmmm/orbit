/**
 * Custom hook for managing transactions
 * Handles loading, creating, updating, and deleting transactions
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import type { Transaction, TransactionData } from '../types';
import {
  getTransactions,
  createTransaction,
  deleteTransaction as deleteTransactionService,
  updateTransaction as updateTransactionService,
} from '../services/transactionService';
import { formatDatabaseTransaction } from '../utils/transactionUtils';

export interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  loadTransactions: () => Promise<void>;
  addTransaction: (data: TransactionData) => Promise<boolean>;
  updateTransaction: (id: string, data: TransactionData) => Promise<boolean>;
  deleteTransaction: (id: string) => void;
  initializeBalance: (amount: number) => Promise<boolean>;
}

export function useTransactions(): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await getTransactions();
      const formattedTransactions = data.map(formatDatabaseTransaction);
      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert('Error', 'Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const addTransaction = useCallback(async (data: TransactionData): Promise<boolean> => {
    try {
      const newTransaction = await createTransaction({
        title: data.title,
        description: data.description,
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: data.date.toISOString(),
      });

      if (newTransaction) {
        const formattedTransaction = formatDatabaseTransaction(newTransaction);
        setTransactions(prev => [formattedTransaction, ...prev]);
        return true;
      } else {
        Alert.alert('Error', 'Failed to add transaction. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
      return false;
    }
  }, []);

  const updateTransaction = useCallback(
    async (id: string, data: TransactionData): Promise<boolean> => {
      try {
        const updatedTransaction = await updateTransactionService(id, {
          title: data.title,
          description: data.description,
          amount: data.amount,
          type: data.type,
          category: data.category,
          date: data.date.toISOString(),
        });

        if (updatedTransaction) {
          const formattedTransaction = formatDatabaseTransaction(updatedTransaction);
          setTransactions(prev => prev.map(t => (t.id === id ? formattedTransaction : t)));
          return true;
        } else {
          Alert.alert('Error', 'Failed to update transaction. Please try again.');
          return false;
        }
      } catch (error) {
        console.error('Error updating transaction:', error);
        Alert.alert('Error', 'Failed to update transaction. Please try again.');
        return false;
      }
    },
    []
  );

  const deleteTransaction = useCallback((id: string): void => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const success = await deleteTransactionService(id);
            if (success) {
              setTransactions(prev => prev.filter(t => t.id !== id));
            } else {
              Alert.alert('Error', 'Failed to delete transaction. Please try again.');
            }
          } catch (error) {
            console.error('Error deleting transaction:', error);
            Alert.alert('Error', 'Failed to delete transaction. Please try again.');
          }
        },
      },
    ]);
  }, []);

  const initializeBalance = useCallback(async (amount: number): Promise<boolean> => {
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount.');
      return false;
    }

    try {
      const newTransaction = await createTransaction({
        title: 'Initialization',
        description: 'Initial balance setup',
        amount: amount,
        type: 'income',
        category: 'Other',
        date: new Date().toISOString(),
      });

      if (newTransaction) {
        const formattedTransaction = formatDatabaseTransaction(newTransaction);
        setTransactions(prev => [formattedTransaction, ...prev]);
        return true;
      } else {
        Alert.alert('Error', 'Failed to initialize balance. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Error initializing balance:', error);
      Alert.alert('Error', 'Failed to initialize balance. Please try again.');
      return false;
    }
  }, []);

  return {
    transactions,
    loading,
    loadTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    initializeBalance,
  };
}
