/**
 * Review Step
 * Final step - summary of splits and save
 */

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp, Edit2 } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeColors } from '../../../constants/theme';
import { calculateParticipantSummaries } from '../../../services/splitBillService';
import type { UseSplitBillWizardReturn } from '../../../hooks/useSplitBillWizard';
import type { ParticipantSummary } from '../../../types/splitBill';

interface ReviewStepProps {
  wizard: UseSplitBillWizardReturn;
  onSave: () => Promise<void>;
  saving: boolean;
}

// Simple color palette for participant chips
const PARTICIPANT_COLORS = [
  '#a0c4ff', // blue
  '#7dd3a8', // green
  '#ffd6a5', // orange
  '#bdb2ff', // purple
  '#ffc6ff', // pink
  '#9bf6e3', // teal
  '#ffadad', // coral
  '#fdffb6', // yellow
];

export default function ReviewStep({ wizard, onSave, saving }: ReviewStepProps): React.JSX.Element {
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const summaries = useMemo<ParticipantSummary[]>(() => {
    return calculateParticipantSummaries(
      wizard.state.editedItems,
      wizard.state.participants,
      wizard.state.assignments,
      wizard.state.extras
    );
  }, [
    wizard.state.editedItems,
    wizard.state.participants,
    wizard.state.assignments,
    wizard.state.extras,
  ]);

  const getParticipantColor = (index: number): string => {
    return PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length];
  };

  const total = wizard.getTotal();

  return (
    <View className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Bill Title */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm" style={{ color: COLORS.text.muted }}>
                Bill
              </Text>
              <Text className="text-xl font-bold" style={{ color: COLORS.text.primary }}>
                {wizard.state.title}
              </Text>
            </View>
            <TouchableOpacity
              className="flex-row items-center px-3 py-2 rounded-lg"
              style={{ backgroundColor: COLORS.surface }}
              onPress={() => wizard.setStep('validate')}
            >
              <Edit2 size={14} color={COLORS.text.secondary} />
              <Text className="text-sm ml-1" style={{ color: COLORS.text.secondary }}>
                Edit
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Per-Person Summary */}
        <View className="mb-4">
          <Text style={{ color: COLORS.text.secondary }} className="text-base font-medium mb-3">
            Each Person Owes
          </Text>

          {summaries.map((summary, index) => {
            const isExpanded = expandedId === summary.participant.tempId;

            return (
              <TouchableOpacity
                key={summary.participant.tempId}
                className="rounded-xl mb-3 overflow-hidden"
                style={{ backgroundColor: COLORS.surface }}
                onPress={() => setExpandedId(isExpanded ? null : summary.participant.tempId)}
                activeOpacity={0.8}
              >
                {/* Header */}
                <View className="flex-row items-center p-4">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: getParticipantColor(index) }}
                  >
                    <Text className="text-lg font-bold" style={{ color: COLORS.background }}>
                      {summary.participant.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold" style={{ color: COLORS.text.primary }}>
                      {summary.participant.name}
                    </Text>
                    <Text className="text-xs" style={{ color: COLORS.text.muted }}>
                      {summary.itemBreakdown.length} item(s)
                    </Text>
                  </View>
                  <View className="items-end mr-2">
                    <Text className="text-xl font-bold" style={{ color: COLORS.pastel.green }}>
                      ${summary.totalAmount.toFixed(2)}
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
                  <View className="px-4 pb-4 pt-2 border-t" style={{ borderTopColor: COLORS.card }}>
                    {/* Items */}
                    {summary.itemBreakdown.map(({ item, shareAmount, sharePercentage }) => (
                      <View key={item.tempId} className="flex-row justify-between py-2">
                        <View className="flex-1 mr-2">
                          <Text
                            className="text-sm"
                            style={{ color: COLORS.text.primary }}
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                          {sharePercentage < 100 && (
                            <Text className="text-xs" style={{ color: COLORS.text.muted }}>
                              ({sharePercentage.toFixed(0)}% of ${item.totalPrice.toFixed(2)})
                            </Text>
                          )}
                        </View>
                        <Text className="text-sm" style={{ color: COLORS.text.primary }}>
                          ${shareAmount.toFixed(2)}
                        </Text>
                      </View>
                    ))}

                    {/* Subtotal */}
                    <View
                      className="flex-row justify-between py-2 mt-2 border-t"
                      style={{ borderTopColor: COLORS.card }}
                    >
                      <Text className="text-sm" style={{ color: COLORS.text.secondary }}>
                        Items Subtotal
                      </Text>
                      <Text className="text-sm" style={{ color: COLORS.text.primary }}>
                        ${summary.itemsSubtotal.toFixed(2)}
                      </Text>
                    </View>

                    {/* Extras */}
                    {summary.taxShare > 0 && (
                      <View className="flex-row justify-between py-1">
                        <Text className="text-sm" style={{ color: COLORS.text.muted }}>
                          Tax share
                        </Text>
                        <Text className="text-sm" style={{ color: COLORS.text.muted }}>
                          ${summary.taxShare.toFixed(2)}
                        </Text>
                      </View>
                    )}
                    {summary.serviceShare > 0 && (
                      <View className="flex-row justify-between py-1">
                        <Text className="text-sm" style={{ color: COLORS.text.muted }}>
                          Service share
                        </Text>
                        <Text className="text-sm" style={{ color: COLORS.text.muted }}>
                          ${summary.serviceShare.toFixed(2)}
                        </Text>
                      </View>
                    )}
                    {summary.tipShare > 0 && (
                      <View className="flex-row justify-between py-1">
                        <Text className="text-sm" style={{ color: COLORS.text.muted }}>
                          Tip share
                        </Text>
                        <Text className="text-sm" style={{ color: COLORS.text.muted }}>
                          ${summary.tipShare.toFixed(2)}
                        </Text>
                      </View>
                    )}

                    {/* Total */}
                    <View
                      className="flex-row justify-between py-2 mt-2 border-t"
                      style={{ borderTopColor: COLORS.card }}
                    >
                      <Text className="font-bold" style={{ color: COLORS.text.primary }}>
                        Total
                      </Text>
                      <Text className="font-bold" style={{ color: COLORS.pastel.green }}>
                        ${summary.totalAmount.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bill Total */}
        <View className="mb-5">
          <View className="rounded-xl p-4" style={{ backgroundColor: COLORS.surface }}>
            <View className="flex-row justify-between items-center">
              <Text className="font-bold" style={{ color: COLORS.text.primary }}>
                Bill Total
              </Text>
              <Text className="text-xl font-bold" style={{ color: COLORS.text.primary }}>
                ${total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Edit Links */}
        <View className="flex-row justify-center mb-4" style={{ gap: 16 }}>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => wizard.setStep('validate')}
          >
            <Edit2 size={14} color={COLORS.text.muted} />
            <Text className="text-sm ml-1" style={{ color: COLORS.text.muted }}>
              Edit Items
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => wizard.setStep('assign')}
          >
            <Edit2 size={14} color={COLORS.text.muted} />
            <Text className="text-sm ml-1" style={{ color: COLORS.text.muted }}>
              Edit Assignments
            </Text>
          </TouchableOpacity>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Save Button */}
      <View className="flex-row gap-3 pb-8">
        <TouchableOpacity
          className="flex-1 p-4 rounded-xl items-center"
          style={{ backgroundColor: COLORS.pastel.green }}
          onPress={onSave}
          disabled={saving}
        >
          <Text style={{ color: COLORS.background }} className="text-base font-semibold">
            {saving ? 'Saving...' : 'Save Split Bill'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
