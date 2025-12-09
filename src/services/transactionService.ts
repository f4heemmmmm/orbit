/**
 * Transaction Service
 * Handles all transaction-related database operations
 */

import { supabase } from '../lib/supabase';
import { getCurrentUserId } from './authService';
import { Database } from '../types/database';

type TransactionRow = Database['public']['Tables']['transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

/**
 * Fetch all transactions for the current user
 */
export async function getTransactions(): Promise<TransactionRow[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

/**
 * Create a new transaction
 */
export async function createTransaction(
  transaction: Omit<TransactionInsert, 'user_id' | 'id'>
): Promise<TransactionRow | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    return null;
  }
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(
  id: string,
  updates: TransactionUpdate
): Promise<TransactionRow | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId) // Ensure user owns this transaction
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating transaction:', error);
    return null;
  }
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('No user logged in');

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Ensure user owns this transaction

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }
}

/**
 * Get transactions by date range
 */
export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string
): Promise<TransactionRow[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching transactions by date range:', error);
    return [];
  }
}

/**
 * Get total balance (income - expenses)
 */
export async function getBalance(): Promise<number> {
  try {
    const transactions = await getTransactions();
    
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return income - expenses;
  } catch (error) {
    console.error('Error calculating balance:', error);
    return 0;
  }
}

