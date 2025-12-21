/**
 * Balance Card Component
 * Displays the financial summary with income, expenses, and balance
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import type { FinancialSummary } from '../../utils/transactionUtils';

interface BalanceCardProps {
  summary: FinancialSummary;
  hasTransactions: boolean;
  onInitializePress: () => void;
  colors: {
    card: string;
    pastel: {
      green: string;
      red: string;
    };
    text: {
      muted: string;
    };
  };
}

export default function BalanceCard({
  summary,
  hasTransactions,
  onInitializePress,
  colors,
}: BalanceCardProps): React.JSX.Element {
  const { totalIncome, totalExpenses, balance, incomeRatio } = summary;

  return (
    <View className="p-4 pb-2">
      <TouchableOpacity
        className="rounded-2xl p-4"
        style={{ backgroundColor: colors.card }}
        onPress={!hasTransactions ? onInitializePress : undefined}
        activeOpacity={!hasTransactions ? 0.7 : 1}
      >
        {/* Balance Header */}
        <View className="mb-4">
          <Text style={{ color: colors.text.muted }} className="text-xs mb-1">
            Total Balance
          </Text>
          <Text
            style={{ color: balance >= 0 ? colors.pastel.green : colors.pastel.red }}
            className="text-3xl font-bold"
          >
            ${Math.abs(balance).toFixed(2)}
          </Text>
        </View>

        {!hasTransactions ? (
          <Text style={{ color: colors.text.muted }} className="text-xs text-center">
            Tap to set initial balance
          </Text>
        ) : (
          <>
            {/* Income vs Expense Visual Bar */}
            <View className="flex-row h-2 rounded-full overflow-hidden mb-4">
              <View
                className="h-full"
                style={{
                  backgroundColor: colors.pastel.green,
                  width: `${incomeRatio}%`,
                }}
              />
              <View
                className="h-full"
                style={{
                  backgroundColor: colors.pastel.red,
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
                  style={{ backgroundColor: colors.pastel.green + '20' }}
                >
                  <TrendingUp size={18} color={colors.pastel.green} />
                </View>
                <View className="ml-2">
                  <Text style={{ color: colors.pastel.green }} className="text-lg font-bold">
                    ${totalIncome.toFixed(2)}
                  </Text>
                  <Text style={{ color: colors.text.muted }} className="text-xs">
                    Income
                  </Text>
                </View>
              </View>

              {/* Expenses */}
              <View className="flex-row items-center flex-1 justify-end">
                <View className="mr-2 items-end">
                  <Text style={{ color: colors.pastel.red }} className="text-lg font-bold">
                    ${totalExpenses.toFixed(2)}
                  </Text>
                  <Text style={{ color: colors.text.muted }} className="text-xs">
                    Expenses
                  </Text>
                </View>
                <View
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.pastel.red + '20' }}
                >
                  <TrendingDown size={18} color={colors.pastel.red} />
                </View>
              </View>
            </View>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
