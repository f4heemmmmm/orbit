import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
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
  LucideIcon,
} from 'lucide-react-native';

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
}

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

export interface TransactionData {
  title: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (transaction: TransactionData) => void;
}

export default function AddTransactionModal({
  visible,
  onClose,
  onAdd,
}: AddTransactionModalProps): React.JSX.Element {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedCategory, setSelectedCategory] = useState('Other');

  const handleAdd = (): void => {
    if (!title.trim() || !amount.trim()) return;
    onAdd({
      title: title.trim(),
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      category: selectedCategory,
    });
    setTitle('');
    setDescription('');
    setAmount('');
    setType('expense');
    setSelectedCategory('Other');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <View className="rounded-t-3xl p-6 max-h-[80%]" style={{ backgroundColor: '#1a1a2e' }}>
          <Text style={{ color: '#e8e8e8' }} className="text-xl font-bold mb-5 text-center">
            Add Transaction
          </Text>
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
            placeholder="Description (optional)"
            placeholderTextColor="#6b6b80"
            value={description}
            onChangeText={setDescription}
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
                  <CatIcon size={20} color={selectedCategory === cat.name ? '#0f0f1a' : cat.color} />
                  <Text className="text-sm ml-1.5" style={{ color: selectedCategory === cat.name ? '#0f0f1a' : '#a0a0b0' }}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View className="flex-row gap-3">
            <TouchableOpacity className="flex-1 p-4 rounded-xl items-center" style={{ backgroundColor: '#252540' }} onPress={onClose}>
              <Text style={{ color: '#a0a0b0' }} className="text-base font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 p-4 rounded-xl items-center" style={{ backgroundColor: '#a0c4ff' }} onPress={handleAdd}>
              <Text style={{ color: '#0f0f1a' }} className="text-base font-semibold">Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}