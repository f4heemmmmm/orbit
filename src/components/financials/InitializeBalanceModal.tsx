/**
 * Initialize Balance Modal Component
 * Modal for setting the initial balance when starting fresh
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { X } from 'lucide-react-native';
import CurrencyInput from 'react-native-currency-input';
import { FONT_SIZES } from '../../constants/theme';

interface InitializeBalanceModalProps {
  visible: boolean;
  onClose: () => void;
  onInitialize: (amount: number) => Promise<boolean>;
  colors: {
    card: string;
    surface: string;
    background: string;
    pastel: {
      green: string;
    };
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
  };
}

export default function InitializeBalanceModal({
  visible,
  onClose,
  onInitialize,
  colors,
}: InitializeBalanceModalProps): React.JSX.Element {
  const [initAmount, setInitAmount] = useState<number | null>(null);

  const handleClose = (): void => {
    onClose();
    setInitAmount(null);
  };

  const handleInitialize = async (): Promise<void> => {
    if (initAmount !== null && initAmount > 0) {
      const success = await onInitialize(initAmount);
      if (success) {
        handleClose();
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableOpacity
        className="flex-1 items-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', paddingTop: '60%' }}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="w-[85%] rounded-2xl p-5"
          style={{ backgroundColor: colors.card }}
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text style={{ color: colors.text.primary }} className="text-xl font-bold">
              Set Initial Balance
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <Text style={{ color: colors.text.secondary }} className="text-base font-medium mb-2">
            Enter your current balance
          </Text>
          <View
            className="rounded-xl mb-4 p-4 flex-row items-center"
            style={{ backgroundColor: colors.surface }}
          >
            <Text style={{ color: colors.text.primary, fontSize: FONT_SIZES.base }}>$</Text>
            <CurrencyInput
              value={initAmount}
              onChangeValue={setInitAmount}
              prefix=""
              delimiter=","
              separator="."
              precision={2}
              minValue={0}
              maxValue={999999.99}
              keyboardType="number-pad"
              style={{
                flex: 1,
                marginLeft: 4,
                color: colors.text.primary,
                fontSize: FONT_SIZES.base,
                includeFontPadding: false,
                padding: 0,
              }}
              placeholder="0.00"
              placeholderTextColor={colors.text.muted}
              autoFocus
            />
          </View>

          <TouchableOpacity
            className="rounded-xl py-3 items-center"
            style={{ backgroundColor: colors.pastel.green }}
            onPress={handleInitialize}
          >
            <Text style={{ color: colors.background }} className="text-base font-semibold">
              Initialize Balance
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
