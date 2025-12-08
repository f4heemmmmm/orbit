import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface Category {
  id: string;
  name: string;
  icon: IoniconsName;
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

const CATEGORIES: Category[] = [
  { id: '1', name: 'Food', icon: 'fast-food', color: '#FF6B6B' },
  { id: '2', name: 'Transport', icon: 'car', color: '#4ECDC4' },
  { id: '3', name: 'Bills', icon: 'receipt', color: '#FFE66D' },
  { id: '4', name: 'Salary', icon: 'cash', color: '#95E1D3' },
  { id: '5', name: 'Shopping', icon: 'bag', color: '#DDA0DD' },
  { id: '6', name: 'Entertainment', icon: 'game-controller', color: '#98D8C8' },
  { id: '7', name: 'Health', icon: 'medical', color: '#F7DC6F' },
  { id: '8', name: 'Other', icon: 'ellipsis-horizontal', color: '#B0B0B0' },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Monthly Salary', amount: 5000, type: 'income', category: 'Salary', date: '2024-01-01' },
  { id: '2', title: 'Grocery Shopping', amount: 150, type: 'expense', category: 'Food', date: '2024-01-02' },
  { id: '3', title: 'Uber Ride', amount: 25, type: 'expense', category: 'Transport', date: '2024-01-03' },
  { id: '4', title: 'Electric Bill', amount: 80, type: 'expense', category: 'Bills', date: '2024-01-04' },
  { id: '5', title: 'Freelance Work', amount: 800, type: 'income', category: 'Salary', date: '2024-01-05' },
  { id: '6', title: 'Movie Tickets', amount: 30, type: 'expense', category: 'Entertainment', date: '2024-01-06' },
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

  const renderTransaction: ListRenderItem<Transaction> = ({ item }) => {
    const category = getCategoryInfo(item.category);
    return (
      <View className="flex-row items-center bg-white rounded-xl p-4 mb-2 shadow-sm">
        <View 
          className="w-11 h-11 rounded-full justify-center items-center"
          style={{ backgroundColor: category.color }}
        >
          <Ionicons name={category.icon} size={20} color="#fff" />
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-base font-medium text-gray-800">{item.title}</Text>
          <Text className="text-sm text-gray-500 mt-0.5">{item.category}</Text>
        </View>
        <Text className={item.type === 'income' ? 'text-base font-semibold text-green-600' : 'text-base font-semibold text-red-500'}>
          {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Summary Cards */}
      <View className="p-4">
        <View className="bg-white rounded-2xl p-5 shadow-md items-center mb-3">
          <Text className="text-sm text-gray-500 mb-1">Total Balance</Text>
          <Text className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            ${balance.toFixed(2)}
          </Text>
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1 bg-white rounded-2xl p-5 shadow-md items-center">
            <Ionicons name="arrow-up-circle" size={24} color="#27AE60" />
            <Text className="text-sm text-gray-500">Income</Text>
            <Text className="text-xl font-bold text-green-600">${totalIncome.toFixed(2)}</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-5 shadow-md items-center">
            <Ionicons name="arrow-down-circle" size={24} color="#E74C3C" />
            <Text className="text-sm text-gray-500">Expenses</Text>
            <Text className="text-xl font-bold text-red-500">${totalExpenses.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Transactions Header */}
      <View className="px-4 py-2">
        <Text className="text-lg font-semibold text-gray-800">Recent Transactions</Text>
      </View>
      
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      />

      {/* Add Button */}
      <TouchableOpacity
        className="absolute right-5 bottom-5 w-14 h-14 rounded-full bg-blue-500 justify-center items-center shadow-lg"
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Add Transaction Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <Text className="text-xl font-bold mb-5 text-center">Add Transaction</Text>

            <TextInput
              className="bg-gray-100 rounded-xl p-4 text-base mb-3"
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              className="bg-gray-100 rounded-xl p-4 text-base mb-3"
              placeholder="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            {/* Type Toggle */}
            <View className="flex-row mb-4 gap-3">
              <TouchableOpacity
                className={`flex-1 p-3 rounded-xl items-center ${type === 'expense' ? 'bg-red-500' : 'bg-gray-100'}`}
                onPress={() => setType('expense')}
              >
                <Text className={`text-base font-medium ${type === 'expense' ? 'text-white' : 'text-gray-600'}`}>
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 p-3 rounded-xl items-center ${type === 'income' ? 'bg-green-600' : 'bg-gray-100'}`}
                onPress={() => setType('income')}
              >
                <Text className={`text-base font-medium ${type === 'income' ? 'text-white' : 'text-gray-600'}`}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            {/* Category Selection */}
            <Text className="text-sm font-medium text-gray-600 mb-2">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  className="flex-row items-center px-4 py-2.5 rounded-full mr-2"
                  style={{ backgroundColor: selectedCategory === cat.name ? cat.color : '#F5F6FA' }}
                  onPress={() => setSelectedCategory(cat.name)}
                >
                  <Ionicons
                    name={cat.icon}
                    size={20}
                    color={selectedCategory === cat.name ? '#fff' : cat.color}
                  />
                  <Text
                    className="text-sm ml-1.5"
                    style={{ color: selectedCategory === cat.name ? '#fff' : '#666' }}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 p-4 rounded-xl bg-gray-100 items-center"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-base font-semibold text-gray-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 p-4 rounded-xl bg-blue-500 items-center"
                onPress={addTransaction}
              >
                <Text className="text-base font-semibold text-white">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

