// First Step for Wizard
import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeColors } from '../../../constants/theme';
import { Camera, Image as ImageIcon, FileText } from 'lucide-react-native';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import {
  captureReceiptImage,
  selectReceiptImage,
  extractReceiptLineItems,
} from '../../../services/splitBillReceiptService';
import type { UseSplitBillWizardReturn } from '../../../hooks/useSplitBillWizard';

interface ScanStepProps {
  wizard: UseSplitBillWizardReturn;
}

export default function ScanStep({ wizard }: ScanStepProps): React.JSX.Element {
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);
  const [processing, setProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');

  const handleCapture = async (useCamera: boolean): Promise<void> => {
    setProcessing(true);
    setProcessingMessage(useCamera ? 'Opening camera...' : 'Opening gallery...');

    try {
      const imageUri = useCamera ? await captureReceiptImage() : await selectReceiptImage();

      if (!imageUri) {
        setProcessing(false);
        return;
      }

      wizard.setImageUri(imageUri);
      setProcessingMessage('Analyzing receipt...');

      const result = await extractReceiptLineItems(imageUri);

      if (!result.success) {
        setProcessing(false);
        Alert.alert(
          'Scan Failed',
          result.error || 'Could not read the receipt. Try again or add items manually.',
          [
            { text: 'Try Again', style: 'cancel' },
            {
              text: 'Add Manually',
              onPress: () => {
                wizard.setTitle('Receipt');
                wizard.addItem();
                wizard.setStep('validate');
              },
            },
          ]
        );
        return;
      }

      if (result.data) {
        wizard.setExtractedData(result.data);

        const confidenceMessage =
          result.data.confidence === 'high'
            ? 'Receipt scanned successfully!'
            : result.data.confidence === 'medium'
              ? 'Receipt scanned. Please verify the details.'
              : 'Some details may be inaccurate. Please review carefully.';

        setProcessing(false);
        Alert.alert('Receipt Scanned', confidenceMessage, [
          {
            text: 'Review Items',
            onPress: () => wizard.setStep('validate'),
          },
        ]);
      }
    } catch {
      setProcessing(false);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const handleManualEntry = (): void => {
    wizard.setTitle('');
    wizard.addItem();
    wizard.setStep('validate');
  };

  return (
    <View className="flex-1">
      {processing ? (
        <View className="flex-1 items-center justify-center">
          <View
            className="rounded-2xl p-8 items-center"
            style={{ backgroundColor: COLORS.surface }}
          >
            <ActivityIndicator size="large" color={COLORS.pastel.purple} />
            <Text className="text-base font-semibold mt-4" style={{ color: COLORS.text.primary }}>
              {processingMessage}
            </Text>
            <Text className="text-sm mt-2" style={{ color: COLORS.text.muted }}>
              AI is analyzing your receipt
            </Text>
          </View>
        </View>
      ) : (
        <>
          <Text style={{ color: COLORS.text.secondary }} className="text-sm font-semibold mb-4">
            Select an option to get started
          </Text>

          <View style={{ gap: 12 }}>
            <TouchableOpacity
              className="flex-row items-center p-4 rounded-xl"
              style={{ backgroundColor: COLORS.surface }}
              onPress={() => handleCapture(true)}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: COLORS.pastel.purple + '20' }}
              >
                <Camera size={24} color={COLORS.pastel.purple} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold" style={{ color: COLORS.text.primary }}>
                  Take Photo of Receipt
                </Text>
                <Text className="text-xs" style={{ color: COLORS.text.muted }}>
                  Capture receipt with your camera
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-4 rounded-xl"
              style={{ backgroundColor: COLORS.surface }}
              onPress={() => handleCapture(false)}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: COLORS.pastel.blue + '20' }}
              >
                <ImageIcon size={24} color={COLORS.pastel.blue} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold" style={{ color: COLORS.text.primary }}>
                  Choose Receipt from Gallery
                </Text>
                <Text className="text-xs" style={{ color: COLORS.text.muted }}>
                  Select existing photo
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-4 rounded-xl"
              style={{ backgroundColor: COLORS.surface }}
              onPress={handleManualEntry}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: COLORS.pastel.orange + '20' }}
              >
                <FileText size={24} color={COLORS.pastel.orange} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold" style={{ color: COLORS.text.primary }}>
                  Enter Receipt Manually
                </Text>
                <Text className="text-xs" style={{ color: COLORS.text.muted }}>
                  Add items without scanning
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
