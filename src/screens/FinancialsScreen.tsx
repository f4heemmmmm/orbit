import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { X, TrendingUp, TrendingDown, Wallet } from 'lucide-react-native';
import CurrencyInput from 'react-native-currency-input';
import AddTransactionModal from '../components/AddTransactionModal';
import SwipeableTransactionItem from '../components/SwipeableTransactionItem';
import FloatingActionButton from '../components/FloatingActionButton';
import type { Transaction, TransactionData } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors, FONT_SIZES } from '../constants/theme';
import { formatRelativeDate } from '../utils/dateUtils';
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from '../services/transactionService';

type RootStackParamList = {
  MainTabs: undefined;
  ViewTransaction: {
    transaction: Transaction;
    onUpdate?: (id: string, data: TransactionData) => void;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function FinancialsScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [initModalVisible, setInitModalVisible] = useState(false);
  const [initAmount, setInitAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch transactions on mount
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await getTransactions();

      // Convert database format to app format
      const formattedTransactions: Transaction[] = data.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        amount: Number(t.amount),
        type: t.type,
        category: t.category,
        date: new Date(t.date).toISOString().split('T')[0],
      }));

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert('Error', 'Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const handleInitializeBalance = async (): Promise<void> => {
    if (!initAmount || initAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount.');
      return;
    }

    try {
      const newTransaction = await createTransaction({
        title: 'Initialization',
        description: 'Initial balance setup',
        amount: initAmount,
        type: 'income',
        category: 'Other',
        date: new Date().toISOString(),
      });

      if (newTransaction) {
        const formattedTransaction: Transaction = {
          id: newTransaction.id,
          title: newTransaction.title,
          description: newTransaction.description || '',
          amount: Number(newTransaction.amount),
          type: newTransaction.type,
          category: newTransaction.category,
          date: new Date(newTransaction.date).toISOString().split('T')[0],
        };
        setTransactions([formattedTransaction, ...transactions]);
        setInitModalVisible(false);
        setInitAmount(null);
      } else {
        Alert.alert('Error', 'Failed to initialize balance. Please try again.');
      }
    } catch (error) {
      console.error('Error initializing balance:', error);
      Alert.alert('Error', 'Failed to initialize balance. Please try again.');
    }
  };

  const handleAddTransaction = async (data: TransactionData): Promise<void> => {
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
        // Add to local state immediately for better UX
        const formattedTransaction: Transaction = {
          id: newTransaction.id,
          title: newTransaction.title,
          description: newTransaction.description || '',
          amount: Number(newTransaction.amount),
          type: newTransaction.type,
          category: newTransaction.category,
          date: new Date(newTransaction.date).toISOString().split('T')[0],
        };
        setTransactions([formattedTransaction, ...transactions]);
        setModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to add transaction. Please try again.');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
    }
  };

  const handleUpdateTransaction = async (id: string, data: TransactionData): Promise<void> => {
    try {
      const updatedTransaction = await updateTransaction(id, {
        title: data.title,
        description: data.description,
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: data.date.toISOString(),
      });

      if (updatedTransaction) {
        // Update local state immediately for better UX
        const formattedTransaction: Transaction = {
          id: updatedTransaction.id,
          title: updatedTransaction.title,
          description: updatedTransaction.description || '',
          amount: Number(updatedTransaction.amount),
          type: updatedTransaction.type,
          category: updatedTransaction.category,
          date: new Date(updatedTransaction.date).toISOString().split('T')[0],
        };
        setTransactions(transactions.map(t => (t.id === id ? formattedTransaction : t)));
      } else {
        Alert.alert('Error', 'Failed to update transaction. Please try again.');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      Alert.alert('Error', 'Failed to update transaction. Please try again.');
    }
  };

  const handleDeleteTransaction = async (id: string): Promise<void> => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const success = await deleteTransaction(id);
            if (success) {
              setTransactions(transactions.filter(t => t.id !== id));
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
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce<Record<string, Transaction[]>>(
    (groups, transaction) => {
      if (!groups[transaction.date]) {
        groups[transaction.date] = [];
      }
      groups[transaction.date].push(transaction);
      return groups;
    },
    {}
  );

  // Sort dates in descending order (most recent first)
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

  const renderTransaction = (item: Transaction): React.JSX.Element => {
    return (
      <SwipeableTransactionItem
        key={item.id}
        item={item}
        onPress={() =>
          navigation.navigate('ViewTransaction', {
            transaction: item,
            onUpdate: handleUpdateTransaction,
          })
        }
        onDelete={() => handleDeleteTransaction(item.id)}
      />
    );
  };

  // Calculate ratio for visual bar
  const totalFlow = totalIncome + totalExpenses;
  const incomeRatio = totalFlow > 0 ? (totalIncome / totalFlow) * 100 : 50;

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      {/* Compact Stats Bar */}
      <View className="p-4 pb-2">
        <TouchableOpacity
          className="rounded-2xl p-4"
          style={{ backgroundColor: COLORS.card }}
          onPress={() => {
            if (transactions.length === 0) {
              setInitModalVisible(true);
            }
          }}
          activeOpacity={transactions.length === 0 ? 0.7 : 1}
        >
          {/* Balance Header */}
          <View className="mb-4">
            <Text style={{ color: COLORS.text.muted }} className="text-xs mb-1">
              Total Balance
            </Text>
            <Text
              style={{ color: balance >= 0 ? COLORS.pastel.green : COLORS.pastel.red }}
              className="text-3xl font-bold"
            >
              ${Math.abs(balance).toFixed(2)}
            </Text>
          </View>

          {transactions.length === 0 ? (
            <Text style={{ color: COLORS.text.muted }} className="text-xs text-center">
              Tap to set initial balance
            </Text>
          ) : (
            <>
              {/* Income vs Expense Visual Bar */}
              <View className="flex-row h-2 rounded-full overflow-hidden mb-4">
                <View
                  className="h-full"
                  style={{
                    backgroundColor: COLORS.pastel.green,
                    width: `${incomeRatio}%`,
                  }}
                />
                <View
                  className="h-full"
                  style={{
                    backgroundColor: COLORS.pastel.red,
                    width: `${100 - incomeRatio}%`,
                  }}
                />
              </View>

              {/* Income & Expense Row */}
              <View className="flex-row items-center justify-between">
                {/* Income */}
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-9 h-9 rounded-full items-center justify-center"
                    style={{ backgroundColor: COLORS.pastel.green + '20' }}
                  >
                    <TrendingUp size={18} color={COLORS.pastel.green} />
                  </View>
                  <View className="ml-2">
                    <Text style={{ color: COLORS.pastel.green }} className="text-lg font-bold">
                      ${totalIncome.toFixed(2)}
                    </Text>
                    <Text style={{ color: COLORS.text.muted }} className="text-xs">
                      Income
                    </Text>
                  </View>
                </View>

                {/* Expenses */}
                <View className="flex-row items-center flex-1 justify-end">
                  <View className="mr-2 items-end">
                    <Text style={{ color: COLORS.pastel.red }} className="text-lg font-bold">
                      ${totalExpenses.toFixed(2)}
                    </Text>
                    <Text style={{ color: COLORS.text.muted }} className="text-xs">
                      Expenses
                    </Text>
                  </View>
                  <View
                    className="w-9 h-9 rounded-full items-center justify-center"
                    style={{ backgroundColor: COLORS.pastel.red + '20' }}
                  >
                    <TrendingDown size={18} color={COLORS.pastel.red} />
                  </View>
                </View>
              </View>
            </>
          )}
        </TouchableOpacity>
      </View>

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

      <FloatingActionButton onPress={() => setModalVisible(true)} />

      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleAddTransaction}
      />

      {/* Initialize Balance Modal */}
      <Modal
        visible={initModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setInitModalVisible(false);
          setInitAmount(null);
        }}
      >
        <TouchableOpacity
          className="flex-1 items-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', paddingTop: '60%' }}
          activeOpacity={1}
          onPress={() => {
            setInitModalVisible(false);
            setInitAmount(null);
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            className="w-[85%] rounded-2xl p-5"
            style={{ backgroundColor: COLORS.card }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text style={{ color: COLORS.text.primary }} className="text-xl font-bold">
                Set Initial Balance
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setInitModalVisible(false);
                  setInitAmount(null);
                }}
              >
                <X size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: COLORS.text.secondary }} className="text-base font-medium mb-2">
              Enter your current balance
            </Text>
            <View
              className="rounded-xl mb-4 p-4 flex-row items-center"
              style={{ backgroundColor: COLORS.surface }}
            >
              <Text style={{ color: COLORS.text.primary, fontSize: FONT_SIZES.base }}>$</Text>
              <CurrencyInput
                value={initAmount}
                onChangeValue={setInitAmount}
                prefix=""
                delimiter=","
                separator="."
                precision={2}
                minValue={0}
                maxValue={999999.99}
                keyboardType="number-pad"
                style={{
                  flex: 1,
                  marginLeft: 4,
                  color: COLORS.text.primary,
                  fontSize: FONT_SIZES.base,
                  includeFontPadding: false,
                  padding: 0,
                }}
                placeholder="0.00"
                placeholderTextColor={COLORS.text.muted}
                autoFocus
              />
            </View>

            <TouchableOpacity
              className="rounded-xl py-3 items-center"
              style={{ backgroundColor: COLORS.pastel.green }}
              onPress={handleInitializeBalance}
            >
              <Text style={{ color: COLORS.background }} className="text-base font-semibold">
                Initialize Balance
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
