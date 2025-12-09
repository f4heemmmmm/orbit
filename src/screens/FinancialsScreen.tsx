import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Plus, Wallet } from 'lucide-react-native';
import AddTransactionModal from '../components/AddTransactionModal';
import { Transaction, TransactionData, Category } from '../types';
import { TRANSACTION_CATEGORIES } from '../constants/categories';
import { COLORS } from '../constants/theme';
import { formatRelativeDate } from '../utils/dateUtils';
import { getTransactions, createTransaction } from '../services/transactionService';

export default function FinancialsScreen(): React.JSX.Element {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
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

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

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

  const getCategoryInfo = (categoryName: string): Category => {
    return TRANSACTION_CATEGORIES.find(c => c.name === categoryName) || TRANSACTION_CATEGORIES[7];
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
    const category = getCategoryInfo(item.category);
    const IconComponent = category.icon;
    return (
      <View key={item.id} className="flex-row items-center rounded-xl p-4 mb-3" style={{ backgroundColor: COLORS.card }}>
        <View
          className="w-11 h-11 rounded-full justify-center items-center"
          style={{ backgroundColor: category.color + '30' }}
        >
          <IconComponent size={20} color={category.color} />
        </View>
        <View className="flex-1 ml-3">
          <Text style={{ color: COLORS.text.primary }} className="text-base font-medium">{item.title}</Text>
          <Text style={{ color: COLORS.text.secondary }} className="text-sm mt-0.5">{item.category}</Text>
        </View>
        <Text style={{ color: item.type === 'income' ? COLORS.pastel.green : COLORS.pastel.red }} className="text-base font-semibold">
          {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      {/* Summary Cards */}
      <View className="p-4">
        <View className="rounded-2xl p-5 items-center mb-3" style={{ backgroundColor: COLORS.card }}>
          <Text style={{ color: COLORS.text.secondary }} className="text-sm mb-1">Total Balance</Text>
          <Text style={{ color: balance >= 0 ? COLORS.pastel.green : COLORS.pastel.red }} className="text-2xl font-bold">
            ${balance.toFixed(2)}
          </Text>
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1 rounded-2xl p-5 items-center" style={{ backgroundColor: COLORS.card }}>
            <Text style={{ color: COLORS.text.secondary }} className="text-sm">Income</Text>
            <Text style={{ color: COLORS.pastel.green }} className="text-xl font-bold">${totalIncome.toFixed(2)}</Text>
          </View>
          <View className="flex-1 rounded-2xl p-5 items-center" style={{ backgroundColor: COLORS.card }}>
            <Text style={{ color: COLORS.text.secondary }} className="text-sm">Expenses</Text>
            <Text style={{ color: COLORS.pastel.red }} className="text-xl font-bold">${totalExpenses.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Transactions Header */}
      <View className="px-4 py-2">
        <Text style={{ color: COLORS.text.primary }} className="text-lg font-semibold">Recent Transactions</Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
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
              <Text style={{ color: COLORS.text.secondary }} className="text-sm font-semibold mb-2">{formatRelativeDate(dateKey)}</Text>
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
    </View>
  );
}

