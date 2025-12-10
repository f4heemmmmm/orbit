import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

interface FloatingActionButtonProps {
  onPress: () => void;
}

export default function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  return (
    <TouchableOpacity
      className="absolute right-5 bottom-5 w-14 h-14 rounded-full shadow-lg"
      style={{ backgroundColor: COLORS.pastel.blue }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex-1 justify-center items-center">
        <Plus size={30} color={COLORS.background} />
      </View>
    </TouchableOpacity>
  );
}
