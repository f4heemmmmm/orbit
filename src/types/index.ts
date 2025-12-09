import { LucideIcon } from 'lucide-react-native';

// Transaction Types
export interface Transaction {
  id: string;
  title: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

export interface TransactionData {
  title: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
}

export interface Category {
  id: string;
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

export type TaskFilterType = 'all' | 'pending' | 'completed';

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

