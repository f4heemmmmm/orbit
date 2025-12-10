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
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { X, Calendar } from 'lucide-react-native';
import type { TransactionData, TransactionCategory } from '../types';
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
  const [amountCents, setAmountCents] = useState(0);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory>('Other');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Format cents to dollar string (POS-style)
  const formatCentsToDollars = (cents: number): string => {
    const dollars = (cents / 100).toFixed(2);
    return dollars;
  };

  // Handle POS-style amount input (fills from cents)
  const handleAmountInput = (text: string): void => {
    // Remove any non-numeric characters
    const numericOnly = text.replace(/[^0-9]/g, '');
    // Convert to integer (cents)
    const cents = parseInt(numericOnly, 10) || 0;
    // Cap at reasonable max (999999.99)
    const cappedCents = Math.min(cents, 99999999);
    setAmountCents(cappedCents);
  };

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
    if (!title.trim() || amountCents <= 0) {
      return;
    }
    onAdd({
      title: title.trim(),
      description: description.trim(),
      amount: amountCents / 100,
      type,
      category: selectedCategory,
      date,
    });
    setTitle('');
    setDescription('');
    setAmountCents(0);
    setType('expense');
    setSelectedCategory('Other');
    setDate(new Date());
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableWithoutFeedback>
            <View
              className="rounded-t-3xl p-6 pt-8"
              style={{ backgroundColor: COLORS.card, height: '92%' }}
            >
              <View className="flex-row items-center justify-between mb-5">
                <Text style={{ color: COLORS.text.primary }} className="text-xl font-bold">
                  Add Transaction
                </Text>
                <TouchableOpacity className="p-2" onPress={onClose}>
                  <X size={24} color={COLORS.text.secondary} />
                </TouchableOpacity>
              </View>
              <ScrollView
                className="flex-1"
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
              >
                <Text
                  style={{ color: COLORS.text.secondary }}
                  className="text-base font-medium mb-2"
                >
                  Title
                </Text>
                <TextInput
                  className="rounded-xl mb-3 p-4"
                  style={{
                    backgroundColor: COLORS.surface,
                    color: COLORS.text.primary,
                    fontSize: 16,
                    includeFontPadding: false,
                  }}
                  placeholderTextColor={COLORS.text.muted}
                  value={title}
                  onChangeText={setTitle}
                  autoFocus
                />
                <Text
                  style={{ color: COLORS.text.secondary }}
                  className="text-base font-medium mb-2"
                >
                  Description (optional)
                </Text>
                <TextInput
                  className="rounded-xl mb-3 p-4"
                  style={{
                    backgroundColor: COLORS.surface,
                    color: COLORS.text.primary,
                    fontSize: 16,
                    includeFontPadding: false,
                  }}
                  placeholderTextColor={COLORS.text.muted}
                  value={description}
                  onChangeText={setDescription}
                />
                <Text
                  style={{ color: COLORS.text.secondary }}
                  className="text-base font-medium mb-2"
                >
                  Amount
                </Text>
                <View
                  className="rounded-xl mb-3 p-4 flex-row items-center"
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
                    value={amountCents === 0 ? '' : formatCentsToDollars(amountCents)}
                    onChangeText={handleAmountInput}
                    keyboardType="number-pad"
                    caretHidden={true}
                  />
                </View>
                <Text
                  style={{ color: COLORS.text.secondary }}
                  className="text-base font-medium mb-2"
                >
                  Date & Time
                </Text>
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
                <Text
                  style={{ color: COLORS.text.secondary }}
                  className="text-base font-medium mb-2"
                >
                  Type
                </Text>
                <View className="flex-row mb-4 gap-3">
                  <TouchableOpacity
                    className="flex-1 p-3 rounded-xl items-center"
                    style={{
                      backgroundColor: type === 'expense' ? COLORS.pastel.red : COLORS.surface,
                    }}
                    onPress={() => setType('expense')}
                  >
                    <Text
                      style={{
                        color: type === 'expense' ? COLORS.background : COLORS.text.secondary,
                      }}
                      className="text-base font-medium"
                    >
                      Expense
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 p-3 rounded-xl items-center"
                    style={{
                      backgroundColor: type === 'income' ? COLORS.pastel.green : COLORS.surface,
                    }}
                    onPress={() => setType('income')}
                  >
                    <Text
                      style={{
                        color: type === 'income' ? COLORS.background : COLORS.text.secondary,
                      }}
                      className="text-base font-medium"
                    >
                      Income
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text
                  style={{ color: COLORS.text.secondary }}
                  className="text-base font-medium mb-2"
                >
                  Category
                </Text>
                <View className="flex-row flex-wrap mb-5 gap-2">
                  {TRANSACTION_CATEGORIES.map(cat => {
                    const CatIcon = cat.icon;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        className="flex-row items-center px-4 py-2.5 rounded-full"
                        style={{
                          backgroundColor: selectedCategory === cat.id ? cat.color : COLORS.surface,
                        }}
                        onPress={() => setSelectedCategory(cat.id)}
                      >
                        <CatIcon
                          size={20}
                          color={selectedCategory === cat.id ? COLORS.background : cat.color}
                        />
                        <Text
                          className="text-sm ml-1.5"
                          style={{
                            color:
                              selectedCategory === cat.id
                                ? COLORS.background
                                : COLORS.text.secondary,
                          }}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
              <View className="flex-row gap-3 pb-8">
                <TouchableOpacity
                  className="flex-1 p-4 rounded-xl items-center"
                  style={{ backgroundColor: COLORS.surface }}
                  onPress={onClose}
                >
                  <Text
                    style={{ color: COLORS.text.secondary }}
                    className="text-base font-semibold"
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 p-4 rounded-xl items-center"
                  style={{ backgroundColor: COLORS.pastel.blue }}
                  onPress={handleAdd}
                >
                  <Text style={{ color: COLORS.background }} className="text-base font-semibold">
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
