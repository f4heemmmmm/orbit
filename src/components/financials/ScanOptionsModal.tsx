/**
 * Scan Options Modal Component
 * Modal for selecting receipt scanning method (camera or gallery)
 */

import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Camera, Image as ImageIcon } from 'lucide-react-native';

interface ScanOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onScanWithCamera: () => void;
  onScanFromGallery: () => void;
  colors: {
    card: string;
    surface: string;
    pastel: {
      blue: string;
      purple: string;
    };
    text: {
      primary: string;
      muted: string;
    };
  };
}

export default function ScanOptionsModal({
  visible,
  onClose,
  onScanWithCamera,
  onScanFromGallery,
  colors,
}: ScanOptionsModalProps): React.JSX.Element {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1}>
          <View className="rounded-t-3xl p-6 pb-10" style={{ backgroundColor: colors.card }}>
            <Text
              style={{ color: colors.text.primary }}
              className="text-xl font-bold mb-4 text-center"
            >
              Scan Receipt
            </Text>
            <TouchableOpacity
              className="flex-row items-center p-4 rounded-xl mb-3"
              style={{ backgroundColor: colors.surface }}
              onPress={onScanWithCamera}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: colors.pastel.purple + '20' }}
              >
                <Camera size={24} color={colors.pastel.purple} />
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.text.primary }} className="text-base font-semibold">
                  Take Photo
                </Text>
                <Text style={{ color: colors.text.muted }} className="text-sm">
                  Capture receipt with camera
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center p-4 rounded-xl"
              style={{ backgroundColor: colors.surface }}
              onPress={onScanFromGallery}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: colors.pastel.blue + '20' }}
              >
                <ImageIcon size={24} color={colors.pastel.blue} />
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.text.primary }} className="text-base font-semibold">
                  Choose from Gallery
                </Text>
                <Text style={{ color: colors.text.muted }} className="text-sm">
                  Select existing photo
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
