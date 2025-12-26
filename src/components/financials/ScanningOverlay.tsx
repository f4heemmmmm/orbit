import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface ScanningOverlayProps {
  visible: boolean;
  colors: {
    card: string;
    pastel: {
      purple: string;
    };
    text: {
      primary: string;
      muted: string;
    };
  };
}

export default function ScanningOverlay({
  visible,
  colors,
}: ScanningOverlayProps): React.JSX.Element | null {
  if (!visible) {
    return null;
  }

  return (
    <View
      className="absolute inset-0 items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
    >
      <View className="rounded-2xl p-6 items-center" style={{ backgroundColor: colors.card }}>
        <ActivityIndicator size="large" color={colors.pastel.purple} />
        <Text style={{ color: colors.text.primary }} className="text-base font-semibold mt-4">
          Scanning Receipt...
        </Text>
        <Text style={{ color: colors.text.muted }} className="text-sm mt-1">
          AI is analyzing your receipt
        </Text>
      </View>
    </View>
  );
}
