import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Wallet, X } from 'lucide-react-native';
import AddTransactionModal from '../components/AddTransactionModal';
import SwipeableTransactionItem from '../components/SwipeableTransactionItem';
import { Transaction, TransactionData } from '../types';
import { COLORS } from '../constants/theme';
import { formatRelativeDate } from '../utils/dateUtils';
import { getTransactions, createTransaction, deleteTransaction, updateTransaction } from '../services/transactionService';

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [initModalVisible, setInitModalVisible] = useState(false);
  const [initAmountCents, setInitAmountCents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = async (): Promise<void> => {
    try {
      setRefreshing(true);
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
      console.error('Error refreshing transactions:', error);
      Alert.alert('Error', 'Failed to refresh transactions. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Format cents to dollar string (POS-style)
  const formatCentsToDollars = (cents: number): string => {
    const dollars = (cents / 100).toFixed(2);
    return dollars;
  };

  // Handle POS-style amount input (fills from cents)
  const handleAmountInput = (text: string, setCents: (cents: number) => void): void => {
    // Remove any non-numeric characters
    const numericOnly = text.replace(/[^0-9]/g, '');
    // Convert to integer (cents)
    const cents = parseInt(numericOnly, 10) || 0;
    // Cap at reasonable max (999999.99)
    const cappedCents = Math.min(cents, 99999999);
    setCents(cappedCents);
  };

  const handleInitializeBalance = async (): Promise<void> => {
    if (initAmountCents <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount.');
      return;
    }

    const amount = initAmountCents / 100;

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
        setInitAmountCents(0);
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
        setTransactions(transactions.map(t => t.id === id ? formattedTransaction : t));
      } else {
        Alert.alert('Error', 'Failed to update transaction. Please try again.');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      Alert.alert('Error', 'Failed to update transaction. Please try again.');
    }
  };

  const handleDeleteTransaction = async (id: string): Promise<void> => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
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
      ]
    );
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce<Record<string, Transaction[]>>((groups, transaction) => {
    if (!groups[transaction.date]) {
      groups[transaction.date] = [];
    }
    groups[transaction.date].push(transaction);
    return groups;
  }, {});

  // Sort dates in descending order (most recent first)
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

  const renderTransaction = (item: Transaction): React.JSX.Element => {
    return (
      <SwipeableTransactionItem
        key={item.id}
        item={item}
        onPress={() => navigation.navigate('ViewTransaction', {
          transaction: item,
          onUpdate: handleUpdateTransaction,
        })}
        onDelete={() => handleDeleteTransaction(item.id)}
      />
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      {/* Summary Cards */}
      <View className="p-4">
        <TouchableOpacity
          className="rounded-2xl p-5 items-center mb-3"
          style={{ backgroundColor: COLORS.card }}
          onPress={() => {
            if (transactions.length === 0) {
              setInitModalVisible(true);
            }
          }}
          activeOpacity={transactions.length === 0 ? 0.7 : 1}
        >
          <Text style={{ color: COLORS.text.secondary }} className="text-base mb-1">Total Balance</Text>
          <Text style={{ color: balance >= 0 ? COLORS.pastel.green : COLORS.pastel.red }} className="text-2xl font-bold">
            ${balance.toFixed(2)}
          </Text>
          {transactions.length === 0 && (
            <Text style={{ color: COLORS.text.muted }} className="text-xs mt-1">Tap to set initial balance</Text>
          )}
        </TouchableOpacity>
        <View className="flex-row gap-3">
          <View className="flex-1 rounded-2xl p-5 items-center" style={{ backgroundColor: COLORS.card }}>
            <Text style={{ color: COLORS.text.secondary }} className="text-base">Income</Text>
            <Text style={{ color: COLORS.pastel.green }} className="text-xl font-bold">${totalIncome.toFixed(2)}</Text>
          </View>
          <View className="flex-1 rounded-2xl p-5 items-center" style={{ backgroundColor: COLORS.card }}>
            <Text style={{ color: COLORS.text.secondary }} className="text-base">Expenses</Text>
            <Text style={{ color: COLORS.pastel.red }} className="text-xl font-bold">${totalExpenses.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.pastel.blue}
            colors={[COLORS.pastel.blue]}
          />
        }
      >
        {loading ? (
          <View className="items-center justify-center pt-16">
            <ActivityIndicator size="large" color={COLORS.pastel.blue} />
            <Text style={{ color: COLORS.text.muted }} className="text-base mt-3">Loading transactions...</Text>
          </View>
        ) : sortedDates.length === 0 ? (
          <View className="items-center justify-center pt-16">
            <Wallet size={48} color={COLORS.text.muted} />
            <Text style={{ color: COLORS.text.muted }} className="text-base mt-3">No transactions yet</Text>
            <Text style={{ color: COLORS.text.muted }} className="text-sm mt-1">Tap + to add your first transaction</Text>
          </View>
        ) : (
          sortedDates.map(dateKey => (
            <View key={dateKey} className="mb-4">
              <Text style={{ color: COLORS.text.secondary }} className="text-base font-semibold mb-2">{formatRelativeDate(dateKey)}</Text>
              {groupedTransactions[dateKey].map(transaction => renderTransaction(transaction))}
            </View>
          ))
        )}
        <View className="h-20" />
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        className="absolute right-5 bottom-5 w-12 h-12 rounded-full justify-center items-center shadow-lg"
        style={{ backgroundColor: COLORS.pastel.blue }}
        onPress={() => setModalVisible(true)}
      >
        <Plus size={25} color={COLORS.background} />
      </TouchableOpacity>

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
          setInitAmountCents(0);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View className="w-[85%] rounded-2xl p-5" style={{ backgroundColor: COLORS.card }}>
              <View className="flex-row justify-between items-center mb-4">
                <Text style={{ color: COLORS.text.primary }} className="text-xl font-bold">Set Initial Balance</Text>
                <TouchableOpacity
                  onPress={() => {
                    setInitModalVisible(false);
                    setInitAmountCents(0);
                  }}
                >
                  <X size={24} color={COLORS.text.secondary} />
                </TouchableOpacity>
              </View>

              <Text style={{ color: COLORS.text.secondary }} className="text-base font-medium mb-2">Enter your current balance</Text>
              <View
                className="rounded-xl mb-4 p-4 flex-row items-center"
                style={{ backgroundColor: COLORS.surface }}
              >
                <Text style={{ color: COLORS.text.primary, fontSize: 16 }}>$</Text>
                <TextInput
                  className="flex-1 ml-1"
                  style={{
                    color: COLORS.text.primary,
                    fontSize: 16,
                    includeFontPadding: false,
                    padding: 0,
                  }}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.text.muted}
                  keyboardType="number-pad"
                  value={initAmountCents === 0 ? '' : formatCentsToDollars(initAmountCents)}
                  onChangeText={(text) => handleAmountInput(text, setInitAmountCents)}
                  autoFocus
                  caretHidden={true}
                />
              </View>

              <TouchableOpacity
                className="rounded-xl py-3 items-center"
                style={{ backgroundColor: COLORS.pastel.green }}
                onPress={handleInitializeBalance}
              >
                <Text style={{ color: COLORS.background }} className="text-base font-semibold">Initialize Balance</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

