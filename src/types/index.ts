import type { LucideIcon } from 'lucide-react-native';

// Category type matching database schema
export type TransactionCategory =
  | 'Food'
  | 'Transport'
  | 'Bills'
  | 'Salary'
  | 'Shopping'
  | 'Entertainment'
  | 'Health'
  | 'Other';

// Transaction Types
export interface Transaction {
  id: string;
  title: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: TransactionCategory;
  date: string;
}

export interface TransactionData {
  title: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: TransactionCategory;
  date: Date;
}

export interface Category {
  id: TransactionCategory;
  name: string;
  icon: LucideIcon;
  color: string;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

export interface Priority {
  id: 'low' | 'medium' | 'high';
  label: string;
  color: string;
}

export type TaskFilterType = 'pending' | 'completed';

// Schedule Types
export interface ScheduleEvent {
  id: string;
  title: string;
  type: 'activity' | 'exam' | 'class' | 'other';
  date: string;
  time: string;
  description: string;
}

export interface EventType {
  id: 'activity' | 'exam' | 'class' | 'other';
  label: string;
  icon: LucideIcon;
  color: string;
}

export type ScheduleFilterType = 'all' | 'activity' | 'exam' | 'class' | 'other';
