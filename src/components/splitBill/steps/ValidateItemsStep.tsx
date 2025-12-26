/**
 * Validate Items Step
 * Second step - review and edit extracted line items or manually enter receipt items
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Keyboard } from 'react-native';
import { Plus, AlertCircle } from 'lucide-react-native';
import CurrencyInput from 'react-native-currency-input';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeColors, FONT_SIZES } from '../../../constants/theme';
import SwipeableBillItem from '../SwipeableBillItem';
import type { UseSplitBillWizardReturn } from '../../../hooks/useSplitBillWizard';

interface ValidateItemsStepProps {
  wizard: UseSplitBillWizardReturn;
}

export default function ValidateItemsStep({ wizard }: ValidateItemsStepProps): React.JSX.Element {
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleAddItem = useCallback((): void => {
    const tempId = wizard.addItem();
    setEditingItemId(tempId);
    // Scroll to bottom after adding item to show new item
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [wizard]);

  const handleDeleteItem = useCallback(
    (tempId: string): void => {
      wizard.removeItem(tempId);
    },
    [wizard]
  );

  // Check if an item can be deleted
  // - Must have 2+ items in the list
  // - Item must have some content (name, quantity > 1, or price > 0)
  const canDeleteItem = useCallback(
    (item: { name: string; quantity: number; unitPrice: number }): boolean => {
      const hasMultipleItems = wizard.state.editedItems.length > 1;
      const hasContent = item.name.trim() !== '' || item.quantity > 1 || item.unitPrice > 0;
      return hasMultipleItems && hasContent;
    },
    [wizard.state.editedItems.length]
  );

  const handleNext = (): void => {
    // Dismiss keyboard first
    Keyboard.dismiss();

    // Validate title
    if (!wizard.state.title.trim()) {
      Alert.alert('Missing Title', 'Please enter a name for this bill.');
      return;
    }

    // Validate items
    const validItems = wizard.state.editedItems.filter(
      item => item.name.trim() && item.totalPrice > 0
    );

    if (validItems.length === 0) {
      Alert.alert('No Valid Items', 'Please add at least one item with a name and price.');
      return;
    }

    // Remove invalid items
    const invalidItems = wizard.state.editedItems.filter(
      item => !item.name.trim() || item.totalPrice <= 0
    );

    if (invalidItems.length > 0) {
      Alert.alert(
        'Invalid Items',
        `${invalidItems.length} item(s) are missing name or price. Remove them?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove & Continue',
            onPress: () => {
              invalidItems.forEach(item => wizard.removeItem(item.tempId));
              wizard.setStep('assign');
            },
          },
        ]
      );
      return;
    }

    wizard.setStep('assign');
  };

  const subtotal = wizard.getSubtotal();
  const total = wizard.getTotal();

  return (
    <View className="flex-1">
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* RECEIPT TITLE */}
        <View className="mb-3">
          <Text style={{ color: COLORS.text.secondary }} className="text-base font-medium mb-2">
            Receipt Title
          </Text>
          <TextInput
            className="rounded-xl p-4"
            style={{
              backgroundColor: COLORS.surface,
              color: COLORS.text.primary,
              fontSize: FONT_SIZES.base,
              includeFontPadding: false,
            }}
            value={wizard.state.title}
            onChangeText={wizard.setTitle}
            placeholder="e.g., Dinner at Restaurant"
            placeholderTextColor={COLORS.text.muted}
          />
        </View>

        {/* LIST OF ITEMS */}
        <View className="mb-3">
          <Text style={{ color: COLORS.text.secondary }} className="text-base font-medium mb-2">
            Items | {wizard.state.editedItems.length}
          </Text>

          {wizard.state.editedItems.map(item => (
            <SwipeableBillItem
              key={item.tempId}
              onDelete={() => handleDeleteItem(item.tempId)}
              enabled={canDeleteItem(item)}
            >
              <View className="p-3">
                <View className="flex-row items-start">
                  <View className="flex-1 mr-2">
                    <TextInput
                      className="mb-2"
                      style={{
                        color: COLORS.text.primary,
                        fontSize: FONT_SIZES.base,
                        padding: 0,
                      }}
                      value={item.name}
                      onChangeText={name => wizard.updateItem(item.tempId, { name })}
                      placeholder="Item name"
                      placeholderTextColor={COLORS.text.muted}
                      autoFocus={editingItemId === item.tempId && !item.name}
                      returnKeyType="next"
                    />
                    <View className="flex-row items-center flex-wrap">
                      <Text className="text-sm mr-2" style={{ color: COLORS.text.muted }}>
                        Qty:
                      </Text>
                      <TextInput
                        className="w-12 text-center"
                        style={{
                          color: COLORS.text.primary,
                          fontSize: FONT_SIZES.sm,
                          backgroundColor: COLORS.card,
                          borderRadius: 6,
                          paddingVertical: 4,
                        }}
                        value={String(item.quantity)}
                        onChangeText={text => {
                          const qty = parseInt(text) || 1;
                          wizard.updateItem(item.tempId, { quantity: Math.max(1, qty) });
                        }}
                        keyboardType="number-pad"
                        selectTextOnFocus
                      />
                      <Text className="text-sm mx-2" style={{ color: COLORS.text.muted }}>
                        @
                      </Text>
                      <View
                        className="flex-row items-center px-2 rounded-md"
                        style={{ backgroundColor: COLORS.card }}
                      >
                        <Text style={{ color: COLORS.text.primary, fontSize: FONT_SIZES.sm }}>
                          $
                        </Text>
                        <CurrencyInput
                          value={item.unitPrice}
                          onChangeValue={value => {
                            wizard.updateItem(item.tempId, {
                              unitPrice: value || 0,
                            });
                          }}
                          prefix=""
                          delimiter=","
                          separator="."
                          precision={2}
                          minValue={0}
                          keyboardType="number-pad"
                          style={{
                            color: COLORS.text.primary,
                            fontSize: FONT_SIZES.sm,
                            paddingVertical: 4,
                            minWidth: 50,
                          }}
                          placeholder="0.00"
                          placeholderTextColor={COLORS.text.muted}
                        />
                      </View>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-lg font-bold" style={{ color: COLORS.text.primary }}>
                      ${item.totalPrice.toFixed(2)}
                    </Text>
                  </View>
                </View>
                {item.confidence === 'low' && (
                  <View
                    className="flex-row items-center mt-2 pt-2 border-t"
                    style={{ borderTopColor: COLORS.card }}
                  >
                    <AlertCircle size={14} color={COLORS.pastel.orange} />
                    <Text className="text-xs ml-1" style={{ color: COLORS.pastel.orange }}>
                      Low confidence - please verify
                    </Text>
                  </View>
                )}
              </View>
            </SwipeableBillItem>
          ))}

          <TouchableOpacity
            className="flex-row items-center justify-center py-3 rounded-xl border-2 border-dashed"
            style={{ borderColor: COLORS.text.muted }}
            onPress={handleAddItem}
          >
            <Plus size={20} color={COLORS.text.muted} />
            <Text className="text-sm ml-2" style={{ color: COLORS.text.muted }}>
              Add Item
            </Text>
          </TouchableOpacity>
        </View>

        {/* Extras */}
        <View className="mb-3">
          <Text style={{ color: COLORS.text.secondary }} className="text-base font-medium mb-2">
            Additional Charges
          </Text>

          <View className="rounded-xl p-4" style={{ backgroundColor: COLORS.surface }}>
            {/* Tax */}
            <View className="flex-row items-center justify-between mb-3">
              <Text style={{ color: COLORS.text.secondary }}>Tax</Text>
              <View
                className="flex-row items-center px-3 py-2 rounded-lg"
                style={{ backgroundColor: COLORS.card }}
              >
                <Text style={{ color: COLORS.text.primary, fontSize: FONT_SIZES.base }}>$</Text>
                <CurrencyInput
                  value={wizard.state.extras.taxAmount}
                  onChangeValue={value => wizard.updateExtras({ taxAmount: value || 0 })}
                  prefix=""
                  delimiter=","
                  separator="."
                  precision={2}
                  minValue={0}
                  keyboardType="number-pad"
                  style={{
                    color: COLORS.text.primary,
                    fontSize: FONT_SIZES.base,
                    marginLeft: 4,
                    minWidth: 60,
                  }}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.text.muted}
                />
              </View>
            </View>

            {/* Service Charge */}
            <View className="flex-row items-center justify-between mb-3">
              <Text style={{ color: COLORS.text.secondary }}>Service Charge</Text>
              <View
                className="flex-row items-center px-3 py-2 rounded-lg"
                style={{ backgroundColor: COLORS.card }}
              >
                <Text style={{ color: COLORS.text.primary, fontSize: FONT_SIZES.base }}>$</Text>
                <CurrencyInput
                  value={wizard.state.extras.serviceCharge}
                  onChangeValue={value => wizard.updateExtras({ serviceCharge: value || 0 })}
                  prefix=""
                  delimiter=","
                  separator="."
                  precision={2}
                  minValue={0}
                  keyboardType="number-pad"
                  style={{
                    color: COLORS.text.primary,
                    fontSize: FONT_SIZES.base,
                    marginLeft: 4,
                    minWidth: 60,
                  }}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.text.muted}
                />
              </View>
            </View>

            {/* Tip */}
            <View className="flex-row items-center justify-between">
              <Text style={{ color: COLORS.text.secondary }}>Tip</Text>
              <View
                className="flex-row items-center px-3 py-2 rounded-lg"
                style={{ backgroundColor: COLORS.card }}
              >
                <Text style={{ color: COLORS.text.primary, fontSize: FONT_SIZES.base }}>$</Text>
                <CurrencyInput
                  value={wizard.state.extras.tipAmount}
                  onChangeValue={value => wizard.updateExtras({ tipAmount: value || 0 })}
                  prefix=""
                  delimiter=","
                  separator="."
                  precision={2}
                  minValue={0}
                  keyboardType="number-pad"
                  style={{
                    color: COLORS.text.primary,
                    fontSize: FONT_SIZES.base,
                    marginLeft: 4,
                    minWidth: 60,
                  }}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.text.muted}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Totals */}
        <View className="mb-5">
          <View className="rounded-xl p-4" style={{ backgroundColor: COLORS.surface }}>
            <View className="flex-row justify-between mb-2">
              <Text style={{ color: COLORS.text.secondary }}>Subtotal</Text>
              <Text style={{ color: COLORS.text.primary }}>${subtotal.toFixed(2)}</Text>
            </View>
            <View
              className="flex-row justify-between pt-2 border-t"
              style={{ borderTopColor: COLORS.card }}
            >
              <Text className="font-bold" style={{ color: COLORS.text.primary }}>
                Total
              </Text>
              <Text className="font-bold text-lg" style={{ color: COLORS.pastel.green }}>
                ${total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Next Button */}
      <View className="flex-row gap-3 pb-8">
        <TouchableOpacity
          className="flex-1 p-4 rounded-xl items-center"
          style={{ backgroundColor: COLORS.pastel.blue }}
          onPress={handleNext}
        >
          <Text style={{ color: COLORS.background }} className="text-base font-semibold">
            Next: Assign People
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
