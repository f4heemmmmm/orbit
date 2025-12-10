import {
  UtensilsCrossed,
  Car,
  Receipt,
  Banknote,
  ShoppingBag,
  Gamepad2,
  HeartPulse,
  MoreHorizontal,
  Dumbbell,
  FileText,
  GraduationCap,
} from 'lucide-react-native';
import type { Category, Priority, EventType } from '../types';
import { COLORS } from './theme';

/**
 * Transaction categories with icons and colors
 */
export const TRANSACTION_CATEGORIES: Category[] = [
  { id: 'Food', name: 'Food', icon: UtensilsCrossed, color: COLORS.category.food },
  { id: 'Transport', name: 'Transport', icon: Car, color: COLORS.category.transport },
  { id: 'Bills', name: 'Bills', icon: Receipt, color: COLORS.category.bills },
  { id: 'Salary', name: 'Salary', icon: Banknote, color: COLORS.category.salary },
  { id: 'Shopping', name: 'Shopping', icon: ShoppingBag, color: COLORS.category.shopping },
  {
    id: 'Entertainment',
    name: 'Entertainment',
    icon: Gamepad2,
    color: COLORS.category.entertainment,
  },
  { id: 'Health', name: 'Health', icon: HeartPulse, color: COLORS.category.health },
  { id: 'Other', name: 'Other', icon: MoreHorizontal, color: COLORS.category.other },
];

/**
 * Task priorities with labels and colors
 */
export const TASK_PRIORITIES: Priority[] = [
  { id: 'low', label: 'Low', color: COLORS.pastel.green },
  { id: 'medium', label: 'Medium', color: COLORS.pastel.orange },
  { id: 'high', label: 'High', color: COLORS.pastel.red },
];

/**
 * Schedule event types with icons and colors
 */
export const SCHEDULE_EVENT_TYPES: EventType[] = [
  { id: 'activity', label: 'Activity', icon: Dumbbell, color: COLORS.pastel.purple },
  { id: 'exam', label: 'Exam', icon: FileText, color: COLORS.pastel.red },
  { id: 'class', label: 'Class', icon: GraduationCap, color: COLORS.pastel.blue },
  { id: 'other', label: 'Other', icon: MoreHorizontal, color: COLORS.pastel.teal },
];
