import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import {
  UtensilsCrossed,
  Car,
  Receipt,
  Banknote,
  ShoppingBag,
  Gamepad2,
  HeartPulse,
  MoreHorizontal,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  LucideIcon,
} from 'lucide-react-native';

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
}

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

// Pastel colors for dark mode
const CATEGORIES: Category[] = [
  { id: '1', name: 'Food', icon: UtensilsCrossed, color: '#ffadad' },
  { id: '2', name: 'Transport', icon: Car, color: '#9bf6e3' },
  { id: '3', name: 'Bills', icon: Receipt, color: '#fdffb6' },
  { id: '4', name: 'Salary', icon: Banknote, color: '#7dd3a8' },
  { id: '5', name: 'Shopping', icon: ShoppingBag, color: '#ffc6ff' },
  { id: '6', name: 'Entertainment', icon: Gamepad2, color: '#bdb2ff' },
  { id: '7', name: 'Health', icon: HeartPulse, color: '#ffd6a5' },
  { id: '8', name: 'Other', icon: MoreHorizontal, color: '#a0a0b0' },
];

// Helper to get date strings relative to today
const getDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Coffee', amount: 5.50, type: 'expense', category: 'Food', date: getDateString(0) },
  { id: '2', title: 'Grocery Shopping', amount: 150, type: 'expense', category: 'Food', date: getDateString(0) },
  { id: '3', title: 'Uber Ride', amount: 25, type: 'expense', category: 'Transport', date: getDateString(1) },
  { id: '4', title: 'Freelance Payment', amount: 800, type: 'income', category: 'Salary', date: getDateString(1) },
  { id: '5', title: 'Electric Bill', amount: 80, type: 'expense', category: 'Bills', date: getDateString(3) },
  { id: '6', title: 'Monthly Salary', amount: 5000, type: 'income', category: 'Salary', date: getDateString(5) },
  { id: '7', title: 'Movie Tickets', amount: 30, type: 'expense', category: 'Entertainment', date: getDateString(8) },
  { id: '8', title: 'Doctor Visit', amount: 120, type: 'expense', category: 'Health', date: getDateString(15) },
];

export default function FinancialsScreen(): React.JSX.Element {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedCategory, setSelectedCategory] = useState('Other');

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const addTransaction = (): void => {
    if (!title.trim() || !amount.trim()) return;
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      title: title.trim(),
      amount: parseFloat(amount),
      type,
      category: selectedCategory,
      date: new Date().toISOString().split('T')[0],
    };
    
    setTransactions([newTransaction, ...transactions]);
    setTitle('');
    setAmount('');
    setType('expense');
    setSelectedCategory('Other');
    setModalVisible(false);
  };

  const getCategoryInfo = (categoryName: string): Category => {
    return CATEGORIES.find(c => c.name === categoryName) || CATEGORIES[7];
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

  const formatDate = (dateStr: string): string => {
    // Parse the date string (YYYY-MM-DD format)
    const [year, month, day] = dateStr.split('-').map(Number);
    const inputDate = new Date(year, month - 1, day);

    // Get today's date at midnight for comparison
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get the start of the current week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    // Get the start of last week
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    // Compare dates
    const inputTime = inputDate.getTime();
    const todayTime = today.getTime();
    const yesterdayTime = yesterday.getTime();

    if (inputTime === todayTime) {
      return 'Today';
    }

    if (inputTime === yesterdayTime) {
      return 'Yesterday';
    }

    // Check if within current week (but not today or yesterday)
    if (inputTime >= startOfWeek.getTime() && inputTime < todayTime) {
      return inputDate.toLocaleDateString('en-US', { weekday: 'long' });
    }

    // Check if within last week
    if (inputTime >= startOfLastWeek.getTime() && inputTime < startOfWeek.getTime()) {
      return 'Last ' + inputDate.toLocaleDateString('en-US', { weekday: 'long' });
    }

    // Check if same year
    if (inputDate.getFullYear() === now.getFullYear()) {
      return inputDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }

    // Different year - include the year
    return inputDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderTransaction = (item: Transaction): React.JSX.Element => {
    const category = getCategoryInfo(item.category);
    const IconComponent = category.icon;
    return (
      <View key={item.id} className="flex-row items-center rounded-xl p-4 mb-2" style={{ backgroundColor: '#1a1a2e' }}>
        <View
          className="w-11 h-11 rounded-full justify-center items-center"
          style={{ backgroundColor: category.color + '30' }}
        >
          <IconComponent size={20} color={category.color} />
        </View>
        <View className="flex-1 ml-3">
          <Text style={{ color: '#e8e8e8' }} className="text-base font-medium">{item.title}</Text>
          <Text style={{ color: '#a0a0b0' }} className="text-sm mt-0.5">{item.category}</Text>
        </View>
        <Text style={{ color: item.type === 'income' ? '#7dd3a8' : '#f5a0a0' }} className="text-base font-semibold">
          {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#0f0f1a' }}>
      {/* Summary Cards */}
      <View className="p-4">
        <View className="rounded-2xl p-5 items-center mb-3" style={{ backgroundColor: '#1a1a2e' }}>
          <Text style={{ color: '#a0a0b0' }} className="text-sm mb-1">Total Balance</Text>
          <Text style={{ color: balance >= 0 ? '#7dd3a8' : '#f5a0a0' }} className="text-2xl font-bold">
            ${balance.toFixed(2)}
          </Text>
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1 rounded-2xl p-5 items-center" style={{ backgroundColor: '#1a1a2e' }}>
            <Text style={{ color: '#a0a0b0' }} className="text-sm">Income</Text>
            <Text style={{ color: '#7dd3a8' }} className="text-xl font-bold">${totalIncome.toFixed(2)}</Text>
          </View>
          <View className="flex-1 rounded-2xl p-5 items-center" style={{ backgroundColor: '#1a1a2e' }}>
            <Text style={{ color: '#a0a0b0' }} className="text-sm">Expenses</Text>
            <Text style={{ color: '#f5a0a0' }} className="text-xl font-bold">${totalExpenses.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Transactions Header */}
      <View className="px-4 py-2">
        <Text style={{ color: '#e8e8e8' }} className="text-lg font-semibold">Recent Transactions</Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {sortedDates.length === 0 ? (
          <View className="items-center justify-center pt-16">
            <Wallet size={48} color="#6b6b80" />
            <Text style={{ color: '#6b6b80' }} className="text-base mt-3">No transactions yet</Text>
          </View>
        ) : (
          sortedDates.map(dateKey => (
            <View key={dateKey} className="mb-4">
              <Text style={{ color: '#a0a0b0' }} className="text-sm font-semibold mb-2">{formatDate(dateKey)}</Text>
              {groupedTransactions[dateKey].map(transaction => renderTransaction(transaction))}
            </View>
          ))
        )}
        <View className="h-20" />
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        className="absolute right-5 bottom-5 w-12 h-12 rounded-full justify-center items-center shadow-lg"
        style={{ backgroundColor: '#a0c4ff' }}
        onPress={() => setModalVisible(true)}
      >
        <Plus size={25} color="#0f0f1a" />
      </TouchableOpacity>

      {/* Add Transaction Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <View className="rounded-t-3xl p-6 max-h-[80%]" style={{ backgroundColor: '#1a1a2e' }}>
            <Text style={{ color: '#e8e8e8' }} className="text-xl font-bold mb-5 text-center">Add Transaction</Text>

            <TextInput
              className="rounded-xl p-4 text-base mb-3"
              style={{ backgroundColor: '#252540', color: '#e8e8e8' }}
              placeholder="Title"
              placeholderTextColor="#6b6b80"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              className="rounded-xl p-4 text-base mb-3"
              style={{ backgroundColor: '#252540', color: '#e8e8e8' }}
              placeholder="Amount"
              placeholderTextColor="#6b6b80"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            {/* Type Toggle */}
            <View className="flex-row mb-4 gap-3">
              <TouchableOpacity
                className="flex-1 p-3 rounded-xl items-center"
                style={{ backgroundColor: type === 'expense' ? '#f5a0a0' : '#252540' }}
                onPress={() => setType('expense')}
              >
                <Text style={{ color: type === 'expense' ? '#0f0f1a' : '#a0a0b0' }} className="text-base font-medium">
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 p-3 rounded-xl items-center"
                style={{ backgroundColor: type === 'income' ? '#7dd3a8' : '#252540' }}
                onPress={() => setType('income')}
              >
                <Text style={{ color: type === 'income' ? '#0f0f1a' : '#a0a0b0' }} className="text-base font-medium">
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            {/* Category Selection */}
            <Text style={{ color: '#a0a0b0' }} className="text-sm font-medium mb-2">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
              {CATEGORIES.map(cat => {
                const CatIcon = cat.icon;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    className="flex-row items-center px-4 py-2.5 rounded-full mr-2"
                    style={{ backgroundColor: selectedCategory === cat.name ? cat.color : '#252540' }}
                    onPress={() => setSelectedCategory(cat.name)}
                  >
                    <CatIcon
                      size={20}
                      color={selectedCategory === cat.name ? '#0f0f1a' : cat.color}
                    />
                    <Text
                      className="text-sm ml-1.5"
                      style={{ color: selectedCategory === cat.name ? '#0f0f1a' : '#a0a0b0' }}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 p-4 rounded-xl items-center"
                style={{ backgroundColor: '#252540' }}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: '#a0a0b0' }} className="text-base font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 p-4 rounded-xl items-center"
                style={{ backgroundColor: '#a0c4ff' }}
                onPress={addTransaction}
              >
                <Text style={{ color: '#0f0f1a' }} className="text-base font-semibold">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

