import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { X, Calendar } from 'lucide-react-native';
import { TransactionData } from '../types';
import { TRANSACTION_CATEGORIES } from '../constants/categories';
import { COLORS } from '../constants/theme';
import { formatDateTime } from '../utils/dateUtils';

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
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date): void => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
      if (Platform.OS === 'android') {
        setShowTimePicker(true);
      }
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date): void => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      setDate(selectedTime);
    }
  };

  const handleAdd = (): void => {
    if (!title.trim() || !amount.trim()) return;
    onAdd({
      title: title.trim(),
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      category: selectedCategory,
      date,
    });
    setTitle('');
    setDescription('');
    setAmount('');
    setType('expense');
    setSelectedCategory('Other');
    setDate(new Date());
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableWithoutFeedback>
            <View className="rounded-t-3xl p-6 pt-8" style={{ backgroundColor: COLORS.card, height: '92%' }}>
              <View className="flex-row items-center justify-between mb-5">
                <Text style={{ color: COLORS.text.primary }} className="text-xl font-bold">
                  Add Transaction
                </Text>
                <TouchableOpacity
                  className="p-2"
                  onPress={onClose}
                >
                  <X size={24} color={COLORS.text.secondary} />
                </TouchableOpacity>
              </View>
              <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
                <TextInput
                  className="rounded-xl mb-3"
                  style={{
                    backgroundColor: COLORS.surface,
                    color: COLORS.text.primary,
                    paddingHorizontal: 16,
                    paddingVertical: 0,
                    height: 56,
                    fontSize: 16,
                    lineHeight: 20,
                    includeFontPadding: false,
                  }}
                  placeholder="Title"
                  placeholderTextColor={COLORS.text.muted}
                  value={title}
                  onChangeText={setTitle}
                />
                <TextInput
                  className="rounded-xl mb-3"
                  style={{
                    backgroundColor: COLORS.surface,
                    color: COLORS.text.primary,
                    paddingHorizontal: 16,
                    paddingVertical: 0,
                    height: 56,
                    fontSize: 16,
                    lineHeight: 20,
                    includeFontPadding: false,
                  }}
                  placeholder="Description (optional)"
                  placeholderTextColor={COLORS.text.muted}
                  value={description}
                  onChangeText={setDescription}
                />
                <TextInput
                  className="rounded-xl mb-3"
                  style={{
                    backgroundColor: COLORS.surface,
                    color: COLORS.text.primary,
                    paddingHorizontal: 16,
                    paddingVertical: 0,
                    height: 56,
                    fontSize: 16,
                    lineHeight: 20,
                    includeFontPadding: false,
                  }}
                  placeholder="Amount"
                  placeholderTextColor={COLORS.text.muted}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  className="rounded-xl p-4 mb-3 flex-row items-center"
                  style={{ backgroundColor: COLORS.surface }}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Calendar size={20} color={COLORS.text.secondary} />
                  <Text className="text-base ml-3" style={{ color: COLORS.text.primary }}>
                    {formatDateTime(date)}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode={Platform.OS === 'ios' ? 'datetime' : 'date'}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    themeVariant="dark"
                  />
                )}
                {showTimePicker && Platform.OS === 'android' && (
                  <DateTimePicker
                    value={date}
                    mode="time"
                    display="default"
                    onChange={onTimeChange}
                    themeVariant="dark"
                  />
                )}
                <View className="flex-row mb-4 gap-3">
                  <TouchableOpacity
                    className="flex-1 p-3 rounded-xl items-center"
                    style={{ backgroundColor: type === 'expense' ? COLORS.pastel.red : COLORS.surface }}
                    onPress={() => setType('expense')}
                  >
                    <Text style={{ color: type === 'expense' ? COLORS.background : COLORS.text.secondary }} className="text-base font-medium">
                      Expense
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 p-3 rounded-xl items-center"
                    style={{ backgroundColor: type === 'income' ? COLORS.pastel.green : COLORS.surface }}
                    onPress={() => setType('income')}
                  >
                    <Text style={{ color: type === 'income' ? COLORS.background : COLORS.text.secondary }} className="text-base font-medium">
                      Income
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ color: COLORS.text.secondary }} className="text-sm font-medium mb-2">Category</Text>
                <View className="flex-row flex-wrap mb-5 gap-2">
                  {TRANSACTION_CATEGORIES.map(cat => {
                    const CatIcon = cat.icon;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        className="flex-row items-center px-4 py-2.5 rounded-full"
                        style={{ backgroundColor: selectedCategory === cat.name ? cat.color : COLORS.surface }}
                        onPress={() => setSelectedCategory(cat.name)}
                      >
                        <CatIcon size={20} color={selectedCategory === cat.name ? COLORS.background : cat.color} />
                        <Text className="text-sm ml-1.5" style={{ color: selectedCategory === cat.name ? COLORS.background : COLORS.text.secondary }}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
              <View className="flex-row gap-3 pb-8">
                <TouchableOpacity className="flex-1 p-4 rounded-xl items-center" style={{ backgroundColor: COLORS.surface }} onPress={onClose}>
                  <Text style={{ color: COLORS.text.secondary }} className="text-base font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 p-4 rounded-xl items-center" style={{ backgroundColor: COLORS.pastel.blue }} onPress={handleAdd}>
                  <Text style={{ color: COLORS.background }} className="text-base font-semibold">Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}