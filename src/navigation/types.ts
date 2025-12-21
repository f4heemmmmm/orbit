/**
 * Navigation type definitions for the app
 */

import type { Transaction, TransactionData } from '../types';

export type RootTabParamList = {
  Financials: undefined;
  Tasks: undefined;
  Groceries: undefined;
  Schedule: undefined;
  Settings: undefined;
};

export type FinancialsStackParamList = {
  MainTabs: undefined;
  ViewTransaction: {
    transaction: Transaction;
    onUpdate?: (id: string, data: TransactionData) => void;
  };
  ViewSplitBill: {
    billId: string;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
