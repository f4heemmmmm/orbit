import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = [
  { id: '1', name: 'Food', icon: 'fast-food', color: '#FF6B6B' },
  { id: '2', name: 'Transport', icon: 'car', color: '#4ECDC4' },
  { id: '3', name: 'Bills', icon: 'receipt', color: '#FFE66D' },
  { id: '4', name: 'Salary', icon: 'cash', color: '#95E1D3' },
  { id: '5', name: 'Shopping', icon: 'bag', color: '#DDA0DD' },
  { id: '6', name: 'Entertainment', icon: 'game-controller', color: '#98D8C8' },
  { id: '7', name: 'Health', icon: 'medical', color: '#F7DC6F' },
  { id: '8', name: 'Other', icon: 'ellipsis-horizontal', color: '#B0B0B0' },
];

const INITIAL_TRANSACTIONS = [
  { id: '1', title: 'Monthly Salary', amount: 5000, type: 'income', category: 'Salary', date: '2024-01-01' },
  { id: '2', title: 'Grocery Shopping', amount: 150, type: 'expense', category: 'Food', date: '2024-01-02' },
  { id: '3', title: 'Uber Ride', amount: 25, type: 'expense', category: 'Transport', date: '2024-01-03' },
  { id: '4', title: 'Electric Bill', amount: 80, type: 'expense', category: 'Bills', date: '2024-01-04' },
  { id: '5', title: 'Freelance Work', amount: 800, type: 'income', category: 'Salary', date: '2024-01-05' },
  { id: '6', title: 'Movie Tickets', amount: 30, type: 'expense', category: 'Entertainment', date: '2024-01-06' },
];

export default function FinancialsScreen() {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [selectedCategory, setSelectedCategory] = useState('Other');

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const addTransaction = () => {
    if (!title.trim() || !amount.trim()) return;
    
    const newTransaction = {
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

  const getCategoryInfo = (categoryName) => {
    return CATEGORIES.find(c => c.name === categoryName) || CATEGORIES[7];
  };

  const renderTransaction = ({ item }) => {
    const category = getCategoryInfo(item.category);
    return (
      <View style={styles.transactionItem}>
        <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
          <Ionicons name={category.icon} size={20} color="#fff" />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>{item.title}</Text>
          <Text style={styles.transactionCategory}>{item.category}</Text>
        </View>
        <Text style={[
          styles.transactionAmount,
          { color: item.type === 'income' ? '#27AE60' : '#E74C3C' }
        ]}>
          {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, styles.balanceCard]}>
          <Text style={styles.summaryLabel}>Total Balance</Text>
          <Text style={[styles.summaryAmount, { color: balance >= 0 ? '#27AE60' : '#E74C3C' }]}>
            ${balance.toFixed(2)}
          </Text>
        </View>
        <View style={styles.rowCards}>
          <View style={[styles.summaryCard, styles.halfCard]}>
            <Ionicons name="arrow-up-circle" size={24} color="#27AE60" />
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryAmount, { color: '#27AE60' }]}>${totalIncome.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryCard, styles.halfCard]}>
            <Ionicons name="arrow-down-circle" size={24} color="#E74C3C" />
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryAmount, { color: '#E74C3C' }]}>${totalExpenses.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Transactions List */}
      <View style={styles.transactionsHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
      </View>
      
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        style={styles.transactionsList}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Add Transaction Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Transaction</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            {/* Type Toggle */}
            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
                onPress={() => setType('expense')}
              >
                <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, type === 'income' && styles.typeButtonActiveIncome]}
                onPress={() => setType('income')}
              >
                <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            {/* Category Selection */}
            <Text style={styles.categoryLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === cat.name && { backgroundColor: cat.color }
                  ]}
                  onPress={() => setSelectedCategory(cat.name)}
                >
                  <Ionicons
                    name={cat.icon}
                    size={20}
                    color={selectedCategory === cat.name ? '#fff' : cat.color}
                  />
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory === cat.name && { color: '#fff' }
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addTransaction}>
                <Text style={styles.saveButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  summaryContainer: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceCard: {
    alignItems: 'center',
    marginBottom: 12,
  },
  rowCards: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCard: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  transactionsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  transactionCategory: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  typeToggle: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#E74C3C',
  },
  typeButtonActiveIncome: {
    backgroundColor: '#27AE60',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F6FA',
    marginRight: 8,
    gap: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

