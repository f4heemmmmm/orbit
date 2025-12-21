/**
 * Utility functions for transaction operations
 */

import type { Transaction, TransactionCategory } from '../types';

/**
 * Database transaction format (as returned from Supabase)
 */
export interface DatabaseTransaction {
  id: string;
  title: string;
  description: string | null;
  amount: number | string;
  type: 'income' | 'expense';
  category: TransactionCategory;
  date: string;
}

/**
 * Converts a database transaction to the app Transaction format
 */
export function formatDatabaseTransaction(t: DatabaseTransaction): Transaction {
  return {
    id: t.id,
    title: t.title,
    description: t.description || '',
    amount: Number(t.amount),
    type: t.type,
    category: t.category,
    date: new Date(t.date).toISOString().split('T')[0],
  };
}

/**
 * Groups transactions by their date
 */
export function groupTransactionsByDate(
  transactions: Transaction[]
): Record<string, Transaction[]> {
  return transactions.reduce<Record<string, Transaction[]>>((groups, transaction) => {
    if (!groups[transaction.date]) {
      groups[transaction.date] = [];
    }
    groups[transaction.date].push(transaction);
    return groups;
  }, {});
}

/**
 * Sorts date keys in descending order (most recent first)
 */
export function sortDatesDescending(dates: string[]): string[] {
  return dates.sort((a, b) => b.localeCompare(a));
}

/**
 * Financial summary calculated from transactions
 */
export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  incomeRatio: number;
}

/**
 * Calculates financial summary from transactions
 */
export function calculateFinancialSummary(transactions: Transaction[]): FinancialSummary {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;
  const totalFlow = totalIncome + totalExpenses;
  const incomeRatio = totalFlow > 0 ? (totalIncome / totalFlow) * 100 : 50;

  return {
    totalIncome,
    totalExpenses,
    balance,
    incomeRatio,
  };
}
