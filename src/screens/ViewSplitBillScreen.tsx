/**
 * View Split Bill Screen
 * Displays details of a saved split bill
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Trash2,
  Share2,
  CheckCircle,
  Circle,
} from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../constants/theme';
import { formatRelativeDate } from '../utils/dateUtils';
import {
  getSplitBillWithDetails,
  deleteSplitBill,
  settleParticipant,
  unsettleParticipant,
  settleSplitBill,
} from '../services/splitBillService';
import type { SplitBillWithDetails, BillParticipant } from '../types/splitBill';

type RootStackParamList = {
  MainTabs: undefined;
  ViewSplitBill: { billId: string };
};

type ViewSplitBillRouteProp = RouteProp<RootStackParamList, 'ViewSplitBill'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Color palette for participants
const PARTICIPANT_COLORS = [
  '#a0c4ff',
  '#7dd3a8',
  '#ffd6a5',
  '#bdb2ff',
  '#ffc6ff',
  '#9bf6e3',
  '#ffadad',
  '#fdffb6',
];

export default function ViewSplitBillScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ViewSplitBillRouteProp>();
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SplitBillWithDetails | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadBillDetails = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const result = await getSplitBillWithDetails(route.params.billId);
      setData(result);
    } catch (error) {
      console.error('Error loading split bill:', error);
      Alert.alert('Error', 'Failed to load bill details.');
    } finally {
      setLoading(false);
    }
  }, [route.params.billId]);

  useEffect(() => {
    loadBillDetails();
  }, [loadBillDetails]);

  const getParticipantColor = (index: number): string => {
    return PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length];
  };

  const handleDelete = (): void => {
    Alert.alert('Delete Bill', 'Are you sure you want to delete this split bill?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const success = await deleteSplitBill(route.params.billId);
          if (success) {
            navigation.goBack();
          } else {
            Alert.alert('Error', 'Failed to delete the bill.');
          }
        },
      },
    ]);
  };

  const handleSettleParticipant = async (participant: BillParticipant): Promise<void> => {
    if (participant.isSettled) {
      // Unsettle - mark as unpaid
      Alert.alert('Mark as Unpaid', `Mark ${participant.name} as unpaid?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const success = await unsettleParticipant(route.params.billId, participant.id);
            if (success) {
              loadBillDetails();
            } else {
              Alert.alert('Error', 'Failed to update payment status.');
            }
          },
        },
      ]);
    } else {
      // Settle - mark as paid
      Alert.alert('Mark as Paid', `Mark ${participant.name} as paid?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const success = await settleParticipant(route.params.billId, participant.id);
            if (success) {
              loadBillDetails();
            } else {
              Alert.alert('Error', 'Failed to update payment status.');
            }
          },
        },
      ]);
    }
  };

  const handleSettleAll = async (): Promise<void> => {
    Alert.alert('Settle Bill', 'Mark this entire bill as settled?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Settle',
        onPress: async () => {
          const success = await settleSplitBill(route.params.billId);
          if (success) {
            loadBillDetails();
          } else {
            Alert.alert('Error', 'Failed to settle the bill.');
          }
        },
      },
    ]);
  };

  const handleShare = async (): Promise<void> => {
    if (!data) {
      return;
    }

    let message = `${data.bill.title}\n`;
    message += `Total: $${data.bill.totalAmount.toFixed(2)}\n\n`;

    data.participants.forEach(p => {
      message += `${p.name}: $${p.totalAmount.toFixed(2)}${p.isSettled ? ' (Paid)' : ''}\n`;
    });

    try {
      await Share.share({ message });
    } catch {
      // User cancelled
    }
  };

  const getParticipantItems = (participantId: string) => {
    if (!data) {
      return [];
    }

    const assignedItemIds = data.assignments
      .filter(a => a.participantId === participantId)
      .map(a => a.itemId);

    return data.items.filter(item => assignedItemIds.includes(item.id));
  };

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: COLORS.background, paddingTop: insets.top }}
      >
        <ActivityIndicator size="large" color={COLORS.pastel.blue} />
      </View>
    );
  }

  if (!data) {
    return (
      <View
        className="flex-1 items-center justify-center px-4"
        style={{ backgroundColor: COLORS.background, paddingTop: insets.top }}
      >
        <Text style={{ color: COLORS.text.muted }}>Bill not found</Text>
        <TouchableOpacity className="mt-4" onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.pastel.blue }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const allSettled = data.participants.every(p => p.isSettled);
  const isSettled = data.bill.status === 'settled' || allSettled;

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-3 border-b"
        style={{ borderBottomColor: COLORS.surface, paddingTop: insets.top + 12 }}
      >
        <TouchableOpacity
          className="p-1"
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text className="text-lg font-bold" style={{ color: COLORS.text.primary }}>
          Split Bill
        </Text>
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <TouchableOpacity onPress={handleShare}>
            <Share2 size={22} color={COLORS.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Trash2 size={22} color={COLORS.pastel.red} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Bill Info */}
        <View className="py-4">
          <Text className="text-2xl font-bold mb-1" style={{ color: COLORS.text.primary }}>
            {data.bill.title}
          </Text>
          <Text style={{ color: COLORS.text.muted }}>{formatRelativeDate(data.bill.date)}</Text>
          {isSettled && (
            <View
              className="flex-row items-center mt-2 px-3 py-1 rounded-full self-start"
              style={{ backgroundColor: COLORS.pastel.green + '20' }}
            >
              <CheckCircle size={14} color={COLORS.pastel.green} />
              <Text className="text-sm ml-1" style={{ color: COLORS.pastel.green }}>
                Settled
              </Text>
            </View>
          )}
        </View>

        {/* Total */}
        <View className="rounded-xl p-4 mb-4" style={{ backgroundColor: COLORS.card }}>
          <View className="flex-row justify-between items-center">
            <Text style={{ color: COLORS.text.secondary }}>Total Amount</Text>
            <Text className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
              ${data.bill.totalAmount.toFixed(2)}
            </Text>
          </View>
          {(data.bill.taxAmount > 0 || data.bill.serviceCharge > 0 || data.bill.tipAmount > 0) && (
            <View className="mt-3 pt-3 border-t" style={{ borderTopColor: COLORS.surface }}>
              <View className="flex-row justify-between">
                <Text className="text-sm" style={{ color: COLORS.text.muted }}>
                  Subtotal
                </Text>
                <Text className="text-sm" style={{ color: COLORS.text.muted }}>
                  ${data.bill.subtotal.toFixed(2)}
                </Text>
              </View>
              {data.bill.taxAmount > 0 && (
                <View className="flex-row justify-between mt-1">
                  <Text className="text-sm" style={{ color: COLORS.text.muted }}>
                    Tax
                  </Text>
                  <Text className="text-sm" style={{ color: COLORS.text.muted }}>
                    ${data.bill.taxAmount.toFixed(2)}
                  </Text>
                </View>
              )}
              {data.bill.serviceCharge > 0 && (
                <View className="flex-row justify-between mt-1">
                  <Text className="text-sm" style={{ color: COLORS.text.muted }}>
                    Service
                  </Text>
                  <Text className="text-sm" style={{ color: COLORS.text.muted }}>
                    ${data.bill.serviceCharge.toFixed(2)}
                  </Text>
                </View>
              )}
              {data.bill.tipAmount > 0 && (
                <View className="flex-row justify-between mt-1">
                  <Text className="text-sm" style={{ color: COLORS.text.muted }}>
                    Tip
                  </Text>
                  <Text className="text-sm" style={{ color: COLORS.text.muted }}>
                    ${data.bill.tipAmount.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Participants */}
        <Text className="text-sm mb-3" style={{ color: COLORS.text.secondary }}>
          Participants ({data.participants.length})
        </Text>

        {data.participants.map((participant, index) => {
          const isExpanded = expandedId === participant.id;
          const items = getParticipantItems(participant.id);

          return (
            <TouchableOpacity
              key={participant.id}
              className="rounded-xl mb-3 overflow-hidden"
              style={{ backgroundColor: COLORS.card }}
              onPress={() => setExpandedId(isExpanded ? null : participant.id)}
              activeOpacity={0.8}
            >
              {/* Header */}
              <View className="flex-row items-center p-4">
                <TouchableOpacity
                  className="mr-3"
                  onPress={() => handleSettleParticipant(participant)}
                >
                  {participant.isSettled ? (
                    <CheckCircle size={24} color={COLORS.pastel.green} />
                  ) : (
                    <Circle size={24} color={COLORS.text.muted} />
                  )}
                </TouchableOpacity>
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: getParticipantColor(index) }}
                >
                  <Text className="text-lg font-bold" style={{ color: COLORS.background }}>
                    {participant.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text
                    className="font-semibold"
                    style={{
                      color: COLORS.text.primary,
                      textDecorationLine: participant.isSettled ? 'line-through' : 'none',
                    }}
                  >
                    {participant.name}
                  </Text>
                  <Text className="text-xs" style={{ color: COLORS.text.muted }}>
                    {items.length} item(s)
                  </Text>
                </View>
                <View className="items-end mr-2">
                  <Text
                    className="text-xl font-bold"
                    style={{
                      color: participant.isSettled ? COLORS.text.muted : COLORS.pastel.green,
                    }}
                  >
                    ${participant.totalAmount.toFixed(2)}
                  </Text>
                </View>
                {isExpanded ? (
                  <ChevronUp size={20} color={COLORS.text.muted} />
                ) : (
                  <ChevronDown size={20} color={COLORS.text.muted} />
                )}
              </View>

              {/* Expanded Details */}
              {isExpanded && (
                <View
                  className="px-4 pb-4 pt-2 border-t"
                  style={{ borderTopColor: COLORS.surface }}
                >
                  {items.map(item => {
                    const assignment = data.assignments.find(
                      a => a.itemId === item.id && a.participantId === participant.id
                    );
                    return (
                      <View key={item.id} className="flex-row justify-between py-2">
                        <Text
                          className="flex-1 text-sm mr-2"
                          style={{ color: COLORS.text.primary }}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        <Text className="text-sm" style={{ color: COLORS.text.primary }}>
                          ${assignment?.shareAmount.toFixed(2) || item.totalPrice.toFixed(2)}
                        </Text>
                      </View>
                    );
                  })}

                  <View className="pt-2 mt-2 border-t" style={{ borderTopColor: COLORS.surface }}>
                    <View className="flex-row justify-between">
                      <Text className="text-sm" style={{ color: COLORS.text.muted }}>
                        Subtotal
                      </Text>
                      <Text className="text-sm" style={{ color: COLORS.text.muted }}>
                        ${participant.subtotal.toFixed(2)}
                      </Text>
                    </View>
                    {participant.taxShare > 0 && (
                      <View className="flex-row justify-between mt-1">
                        <Text className="text-sm" style={{ color: COLORS.text.muted }}>
                          Tax share
                        </Text>
                        <Text className="text-sm" style={{ color: COLORS.text.muted }}>
                          ${participant.taxShare.toFixed(2)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Settle All Button */}
        {!isSettled && (
          <TouchableOpacity
            className="rounded-xl py-4 items-center mb-4"
            style={{ backgroundColor: COLORS.pastel.green }}
            onPress={handleSettleAll}
          >
            <Text className="text-base font-semibold" style={{ color: COLORS.background }}>
              Mark All as Settled
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: Math.max(insets.bottom, 16) + 8 }} />
      </ScrollView>
    </View>
  );
}
