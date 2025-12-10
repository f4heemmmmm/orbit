import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { ChevronLeft, Calendar, Tag, FileText, DollarSign, Edit } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Transaction, Category, TransactionData } from '../types';
import { TRANSACTION_CATEGORIES } from '../constants/categories';
import { COLORS } from '../constants/theme';
import { formatSimpleDate } from '../utils/dateUtils';
import EditTransactionModal from '../components/EditTransactionModal';

export type FinancialsStackParamList = {
  FinancialsList: undefined;
  ViewTransaction: { transaction: Transaction };
};

type RootStackParamList = {
  MainTabs: undefined;
  ViewTransaction: {
    transaction: Transaction;
    onUpdate?: (id: string, data: TransactionData) => void;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'ViewTransaction'>;

export default function ViewTransactionScreen({ navigation, route }: Props): React.JSX.Element {
  const { transaction, onUpdate } = route.params;
  const [editModalVisible, setEditModalVisible] = useState(false);

  const getCategoryInfo = (categoryName: string): Category => {
    return TRANSACTION_CATEGORIES.find(c => c.name === categoryName) || TRANSACTION_CATEGORIES[7];
  };

  const handleUpdate = (id: string, data: TransactionData): void => {
    if (onUpdate) {
      onUpdate(id, data);
    }
    setEditModalVisible(false);
    navigation.goBack();
  };

  const category = getCategoryInfo(transaction.category);
  const CategoryIcon = category.icon;
  const isIncome = transaction.type === 'income';

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Status bar background */}
      <SafeAreaView style={{ backgroundColor: COLORS.card }} />
      <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
        {/* Header */}
        <View
          className="flex-row items-center justify-center px-4 py-4"
          style={{ backgroundColor: COLORS.card }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} className="absolute left-4 p-2">
            <ChevronLeft size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={{ color: COLORS.text.primary }} className="text-xl font-bold">
            Transaction Details
          </Text>
          <TouchableOpacity
            onPress={() => setEditModalVisible(true)}
            className="absolute right-4 p-2"
          >
            <Edit size={24} color={COLORS.pastel.blue} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Amount Card */}
          <View
            className="mx-4 mt-4 rounded-2xl p-6 items-center"
            style={{ backgroundColor: COLORS.card }}
          >
            <Text
              className="text-4xl font-bold"
              style={{ color: isIncome ? COLORS.pastel.green : COLORS.pastel.red }}
            >
              {isIncome ? '+' : '-'}${transaction.amount.toFixed(2)}
            </Text>
            <View
              className="mt-3 px-4 py-1.5 rounded-full"
              style={{
                backgroundColor: (isIncome ? COLORS.pastel.green : COLORS.pastel.red) + '20',
              }}
            >
              <Text
                className="text-base font-medium"
                style={{ color: isIncome ? COLORS.pastel.green : COLORS.pastel.red }}
              >
                {isIncome ? 'Income' : 'Expense'}
              </Text>
            </View>
          </View>

          {/* Details Card */}
          <View className="mx-4 mt-4 rounded-2xl p-5" style={{ backgroundColor: COLORS.card }}>
            {/* Title */}
            <View className="flex-row items-center mb-5">
              <View
                className="w-11 h-11 rounded-full justify-center items-center"
                style={{ backgroundColor: COLORS.surface }}
              >
                <FileText size={20} color={COLORS.text.secondary} />
              </View>
              <View className="ml-4 flex-1">
                <Text style={{ color: COLORS.text.secondary }} className="text-sm">
                  Title
                </Text>
                <Text style={{ color: COLORS.text.primary }} className="text-lg font-medium mt-0.5">
                  {transaction.title}
                </Text>
              </View>
            </View>

            {/* Category */}
            <View className="flex-row items-center mb-5">
              <View
                className="w-11 h-11 rounded-full justify-center items-center"
                style={{ backgroundColor: category.color + '25' }}
              >
                <CategoryIcon size={20} color={category.color} />
              </View>
              <View className="ml-4 flex-1">
                <Text style={{ color: COLORS.text.secondary }} className="text-sm">
                  Category
                </Text>
                <Text style={{ color: COLORS.text.primary }} className="text-lg font-medium mt-0.5">
                  {transaction.category}
                </Text>
              </View>
            </View>

            {/* Date */}
            <View className="flex-row items-center mb-5">
              <View
                className="w-11 h-11 rounded-full justify-center items-center"
                style={{ backgroundColor: COLORS.pastel.blue + '25' }}
              >
                <Calendar size={20} color={COLORS.pastel.blue} />
              </View>
              <View className="ml-4 flex-1">
                <Text style={{ color: COLORS.text.secondary }} className="text-sm">
                  Date
                </Text>
                <Text style={{ color: COLORS.text.primary }} className="text-lg font-medium mt-0.5">
                  {formatSimpleDate(transaction.date)}
                </Text>
              </View>
            </View>

            {/* Amount */}
            <View className="flex-row items-center">
              <View
                className="w-11 h-11 rounded-full justify-center items-center"
                style={{ backgroundColor: COLORS.pastel.yellow + '25' }}
              >
                <DollarSign size={20} color={COLORS.pastel.yellow} />
              </View>
              <View className="ml-4 flex-1">
                <Text style={{ color: COLORS.text.secondary }} className="text-sm">
                  Amount
                </Text>
                <Text style={{ color: COLORS.text.primary }} className="text-lg font-medium mt-0.5">
                  ${transaction.amount.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Description Card (only if description exists) */}
          {transaction.description ? (
            <View className="mx-4 mt-4 rounded-2xl p-5" style={{ backgroundColor: COLORS.card }}>
              <View className="flex-row items-center mb-3">
                <View
                  className="w-11 h-11 rounded-full justify-center items-center"
                  style={{ backgroundColor: COLORS.pastel.purple + '25' }}
                >
                  <Tag size={20} color={COLORS.pastel.purple} />
                </View>
                <Text style={{ color: COLORS.text.secondary }} className="text-sm ml-4">
                  Description
                </Text>
              </View>
              <Text style={{ color: COLORS.text.primary }} className="text-base leading-6 ml-15">
                {transaction.description}
              </Text>
            </View>
          ) : null}

          {/* Bottom spacing */}
          <View className="h-8" />
        </ScrollView>

        <EditTransactionModal
          visible={editModalVisible}
          transaction={transaction}
          onClose={() => setEditModalVisible(false)}
          onUpdate={handleUpdate}
        />
      </View>
    </View>
  );
}
