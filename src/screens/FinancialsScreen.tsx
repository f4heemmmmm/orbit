import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera, Wallet, Plus, Users } from 'lucide-react-native';
import AddTransactionModal from '../components/AddTransactionModal';
import SwipeableTransactionItem from '../components/SwipeableTransactionItem';
import SplitBillWizard from '../components/splitBill/SplitBillWizard';
import SplitBillListItem from '../components/splitBill/SplitBillListItem';
import {
  BalanceCard,
  ScanOptionsModal,
  ScanningOverlay,
  InitializeBalanceModal,
} from '../components/financials';
import type { Transaction } from '../types';
import type { SplitBill } from '../types/splitBill';
import type { FinancialsStackParamList } from '../navigation/types';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../constants/theme';
import { formatRelativeDate } from '../utils/dateUtils';
import {
  groupTransactionsByDate,
  sortDatesDescending,
  calculateFinancialSummary,
} from '../utils/transactionUtils';
import { useTransactions, useReceiptScanner } from '../hooks';
import { getSplitBills } from '../services/splitBillService';

type NavigationProp = NativeStackNavigationProp<FinancialsStackParamList>;

type TabType = 'transactions' | 'splitBill';

const TABS: TabType[] = ['transactions', 'splitBill'];

const TAB_LABELS: Record<TabType, string> = {
  transactions: 'Transactions',
  splitBill: 'Split Bill',
};

export default function FinancialsScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('transactions');

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [initModalVisible, setInitModalVisible] = useState(false);

  // Split bill state
  const [splitBills, setSplitBills] = useState<SplitBill[]>([]);
  const [splitBillsLoading, setSplitBillsLoading] = useState(true);
  const [wizardVisible, setWizardVisible] = useState(false);

  // Hooks
  const {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    initializeBalance,
  } = useTransactions();

  const {
    scanning,
    scanOptionsVisible,
    initialTransactionData,
    openScanOptions,
    closeScanOptions,
    handleScanReceipt,
    clearInitialData,
  } = useReceiptScanner();

  // Computed values
  const financialSummary = useMemo(() => calculateFinancialSummary(transactions), [transactions]);

  const groupedTransactions = useMemo(() => groupTransactionsByDate(transactions), [transactions]);

  const sortedDates = useMemo(
    () => sortDatesDescending(Object.keys(groupedTransactions)),
    [groupedTransactions]
  );

  // Split bill handlers
  const loadSplitBills = useCallback(async (): Promise<void> => {
    try {
      setSplitBillsLoading(true);
      const bills = await getSplitBills();
      setSplitBills(bills);
    } catch (error) {
      console.error('Error loading split bills:', error);
    } finally {
      setSplitBillsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'splitBill') {
        loadSplitBills();
      }
    }, [activeTab, loadSplitBills])
  );

  useEffect(() => {
    if (activeTab === 'splitBill') {
      loadSplitBills();
    }
  }, [activeTab, loadSplitBills]);

  // Modal handlers
  const handleOpenAddModal = (): void => {
    clearInitialData();
    setModalVisible(true);
  };

  const handleCloseAddModal = (): void => {
    setModalVisible(false);
    clearInitialData();
  };

  const handleWizardClose = (saved: boolean): void => {
    setWizardVisible(false);
    if (saved) {
      loadSplitBills();
    }
  };

  const handleInitializeBalance = async (amount: number): Promise<boolean> => {
    return initializeBalance(amount);
  };

  // Render transaction item
  const renderTransaction = (item: Transaction): React.JSX.Element => (
    <SwipeableTransactionItem
      key={item.id}
      item={item}
      onPress={() =>
        navigation.navigate('ViewTransaction', {
          transaction: item,
          onUpdate: updateTransaction,
        })
      }
      onDelete={() => deleteTransaction(item.id)}
    />
  );

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      {/* Balance Card */}
      <BalanceCard
        summary={financialSummary}
        hasTransactions={transactions.length > 0}
        onInitializePress={() => setInitModalVisible(true)}
        colors={COLORS}
      />

      {/* Tab Selector */}
      <View className="flex-row px-4 mb-3" style={{ gap: 8 }}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            className="flex-1 py-2 rounded-full"
            style={{ backgroundColor: activeTab === tab ? COLORS.pastel.blue : COLORS.card }}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              className="text-sm font-medium text-center"
              style={{ color: activeTab === tab ? COLORS.background : COLORS.text.secondary }}
            >
              {TAB_LABELS[tab]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'transactions' ? (
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          {loading ? (
            <View className="items-center justify-center pt-16">
              <ActivityIndicator size="large" color={COLORS.pastel.blue} />
              <Text style={{ color: COLORS.text.muted }} className="text-base mt-3">
                Loading transactions...
              </Text>
            </View>
          ) : sortedDates.length === 0 ? (
            <View className="items-center justify-center pt-16">
              <Wallet size={48} color={COLORS.text.muted} />
              <Text style={{ color: COLORS.text.muted }} className="text-base mt-3">
                No transactions yet
              </Text>
              <Text style={{ color: COLORS.text.muted }} className="text-sm mt-1">
                Tap + to add your first transaction
              </Text>
            </View>
          ) : (
            sortedDates.map(dateKey => (
              <View key={dateKey} className="mb-4">
                <Text
                  style={{ color: COLORS.text.secondary }}
                  className="text-base font-semibold mb-2"
                >
                  {formatRelativeDate(dateKey)}
                </Text>
                {groupedTransactions[dateKey].map(transaction => renderTransaction(transaction))}
              </View>
            ))
          )}
          <View className="h-20" />
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          {splitBillsLoading ? (
            <View className="items-center justify-center pt-16">
              <ActivityIndicator size="large" color={COLORS.pastel.orange} />
              <Text style={{ color: COLORS.text.muted }} className="text-base mt-3">
                Loading split bills...
              </Text>
            </View>
          ) : splitBills.length === 0 ? (
            <View className="items-center justify-center pt-16">
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: COLORS.pastel.orange + '20' }}
              >
                <Users size={40} color={COLORS.pastel.orange} />
              </View>
              <Text style={{ color: COLORS.text.primary }} className="text-xl font-bold mb-2">
                No Split Bills
              </Text>
              <Text style={{ color: COLORS.text.muted }} className="text-base text-center px-8">
                Tap + to split a bill with friends and family
              </Text>
            </View>
          ) : (
            splitBills.map(bill => (
              <SplitBillListItem
                key={bill.id}
                bill={bill}
                onPress={() => navigation.navigate('ViewSplitBill', { billId: bill.id })}
              />
            ))
          )}
          <View className="h-20" />
        </ScrollView>
      )}

      {/* Action Buttons - Transactions Tab */}
      {activeTab === 'transactions' && (
        <View className="absolute bottom-5 right-5 flex-row items-center" style={{ gap: 12 }}>
          <TouchableOpacity
            className="w-14 h-14 rounded-full items-center justify-center shadow-lg"
            style={{ backgroundColor: COLORS.pastel.purple }}
            onPress={openScanOptions}
            disabled={scanning}
            activeOpacity={0.8}
          >
            <Camera size={26} color={COLORS.background} />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-14 h-14 rounded-full items-center justify-center shadow-lg"
            style={{ backgroundColor: COLORS.pastel.blue }}
            onPress={handleOpenAddModal}
            activeOpacity={0.8}
          >
            <Plus size={30} color={COLORS.background} />
          </TouchableOpacity>
        </View>
      )}

      {/* Action Button - Split Bill Tab */}
      {activeTab === 'splitBill' && (
        <View className="absolute bottom-5 right-5">
          <TouchableOpacity
            className="w-14 h-14 rounded-full items-center justify-center shadow-lg"
            style={{ backgroundColor: COLORS.pastel.orange }}
            onPress={() => setWizardVisible(true)}
            activeOpacity={0.8}
          >
            <Plus size={30} color={COLORS.background} />
          </TouchableOpacity>
        </View>
      )}

      {/* Modals */}
      <AddTransactionModal
        visible={modalVisible}
        onClose={handleCloseAddModal}
        onAdd={addTransaction}
        initialData={initialTransactionData}
      />

      <SplitBillWizard visible={wizardVisible} onClose={handleWizardClose} />

      <ScanOptionsModal
        visible={scanOptionsVisible}
        onClose={closeScanOptions}
        onScanWithCamera={() => handleScanReceipt(true, () => setModalVisible(true))}
        onScanFromGallery={() => handleScanReceipt(false, () => setModalVisible(true))}
        colors={COLORS}
      />

      <ScanningOverlay visible={scanning} colors={COLORS} />

      <InitializeBalanceModal
        visible={initModalVisible}
        onClose={() => setInitModalVisible(false)}
        onInitialize={handleInitializeBalance}
        colors={COLORS}
      />
    </View>
  );
}
