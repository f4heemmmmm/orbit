/**
 * Split Bill Wizard
 * Main modal container for the multi-step split bill creation flow
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { X, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeColors } from '../../constants/theme';
import { useSplitBillWizard } from '../../hooks/useSplitBillWizard';
import { createSplitBill } from '../../services/splitBillService';
import { uploadReceiptImage } from '../../services/storageService';
import type { WizardStep } from '../../types/splitBill';

import ScanStep from './steps/ScanStep';
import ValidateItemsStep from './steps/ValidateItemsStep';
import AssignPeopleStep from './steps/AssignPeopleStep';
import ReviewStep from './steps/ReviewStep';

interface SplitBillWizardProps {
  visible: boolean;
  onClose: (saved: boolean) => void;
}

const STEP_TITLES: Record<WizardStep, string> = {
  scan: 'Scan Receipt',
  validate: 'Review Items',
  assign: 'Assign People',
  review: 'Summary',
};

export default function SplitBillWizard({
  visible,
  onClose,
}: SplitBillWizardProps): React.JSX.Element {
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);
  const wizard = useSplitBillWizard();
  const [saving, setSaving] = useState(false);

  const handleClose = (): void => {
    if (wizard.state.step !== 'scan') {
      Alert.alert(
        'Discard Changes?',
        'Are you sure you want to close? Your progress will be lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              wizard.reset();
              onClose(false);
            },
          },
        ]
      );
    } else {
      wizard.reset();
      onClose(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!wizard.areAllItemsAssigned()) {
      Alert.alert('Unassigned Items', 'Please assign all items to at least one person.');
      return;
    }

    if (wizard.state.participants.length === 0) {
      Alert.alert('No Participants', 'Please add at least one person.');
      return;
    }

    setSaving(true);

    try {
      // Upload image to Supabase Storage if available
      let receiptImageUrl: string | undefined;
      if (wizard.state.imageUri) {
        const uploadedUrl = await uploadReceiptImage(wizard.state.imageUri);
        if (uploadedUrl) {
          receiptImageUrl = uploadedUrl;
        }
      }

      const bill = await createSplitBill({
        title: wizard.state.title,
        items: wizard.state.editedItems,
        participants: wizard.state.participants,
        assignments: wizard.state.assignments,
        extras: wizard.state.extras,
        receiptImageUrl,
      });

      if (bill) {
        wizard.reset();
        onClose(true);
      } else {
        Alert.alert('Error', 'Failed to save the split bill. Please try again.');
      }
    } catch (error) {
      console.error('Error saving split bill:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const renderStep = (): React.JSX.Element => {
    switch (wizard.state.step) {
      case 'scan':
        return <ScanStep wizard={wizard} />;
      case 'validate':
        return <ValidateItemsStep wizard={wizard} />;
      case 'assign':
        return <AssignPeopleStep wizard={wizard} />;
      case 'review':
        return <ReviewStep wizard={wizard} onSave={handleSave} saving={saving} />;
      default:
        return <ScanStep wizard={wizard} />;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableWithoutFeedback>
            <View
              className="rounded-t-3xl p-6 pt-8"
              style={{ backgroundColor: COLORS.card, height: '92%' }}
            >
              {/* Header */}
              <View className="flex-row items-center justify-between mb-5">
                <View className="flex-row items-center flex-1">
                  {wizard.canGoBack ? (
                    <TouchableOpacity className="mr-3 p-1" onPress={wizard.goBack}>
                      <ChevronLeft size={24} color={COLORS.text.primary} />
                    </TouchableOpacity>
                  ) : null}
                  <Text style={{ color: COLORS.text.primary }} className="text-xl font-bold">
                    {STEP_TITLES[wizard.state.step]}
                  </Text>
                </View>
                <TouchableOpacity className="p-2" onPress={handleClose}>
                  <X size={24} color={COLORS.text.secondary} />
                </TouchableOpacity>
              </View>

              {/* Step Indicator */}
              <View className="flex-row mb-4" style={{ gap: 4 }}>
                {(['scan', 'validate', 'assign', 'review'] as WizardStep[]).map((step, index) => {
                  const currentIndex = ['scan', 'validate', 'assign', 'review'].indexOf(
                    wizard.state.step
                  );
                  const isActive = index <= currentIndex;
                  return (
                    <View
                      key={step}
                      className="flex-1 h-1 rounded-full"
                      style={{
                        backgroundColor: isActive ? COLORS.pastel.blue : COLORS.surface,
                      }}
                    />
                  );
                })}
              </View>

              {/* Content */}
              <View className="flex-1">{renderStep()}</View>

              {/* Saving Overlay */}
              {saving && (
                <View
                  className="absolute inset-0 items-center justify-center"
                  style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                  <View
                    className="rounded-2xl p-6 items-center"
                    style={{ backgroundColor: COLORS.surface }}
                  >
                    <ActivityIndicator size="large" color={COLORS.pastel.blue} />
                    <Text
                      className="text-base font-semibold mt-4"
                      style={{ color: COLORS.text.primary }}
                    >
                      Saving...
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
