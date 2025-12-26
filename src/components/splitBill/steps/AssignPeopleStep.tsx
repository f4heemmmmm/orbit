/**
 * Assign People Step
 * Third step - assign items to participants
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { UserPlus, X, Check, AlertCircle, Users } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeColors, FONT_SIZES } from '../../../constants/theme';
import { getRecentParticipants } from '../../../services/splitBillService';
import type { UseSplitBillWizardReturn } from '../../../hooks/useSplitBillWizard';
import type { EditableBillItem } from '../../../types/splitBill';

interface AssignPeopleStepProps {
  wizard: UseSplitBillWizardReturn;
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

export default function AssignPeopleStep({ wizard }: AssignPeopleStepProps): React.JSX.Element {
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);
  const [newName, setNewName] = useState('');
  const [recentNames, setRecentNames] = useState<string[]>([]);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EditableBillItem | null>(null);

  useEffect(() => {
    loadRecentParticipants();
  }, []);

  const loadRecentParticipants = async (): Promise<void> => {
    try {
      const names = await getRecentParticipants();
      setRecentNames(names);
    } catch {
      // Ignore errors for autocomplete
    }
  };

  const getParticipantColor = (index: number): string => {
    return PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length];
  };

  const handleAddParticipant = (): void => {
    const name = newName.trim();
    if (!name) {
      return;
    }

    // Check for duplicates
    if (wizard.state.participants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      Alert.alert('Duplicate', 'This person has already been added.');
      return;
    }

    wizard.addParticipant(name);
    setNewName('');
  };

  const handleRemoveParticipant = (tempId: string, name: string): void => {
    Alert.alert('Remove Person', `Remove ${name} from the split?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => wizard.removeParticipant(tempId),
      },
    ]);
  };

  const handleOpenAssignModal = (item: EditableBillItem): void => {
    setSelectedItem(item);
    setAssignModalVisible(true);
  };

  const handleNext = (): void => {
    if (wizard.state.participants.length === 0) {
      Alert.alert('No Participants', 'Please add at least one person.');
      return;
    }

    const unassignedCount = wizard.getUnassignedItemCount();
    if (unassignedCount > 0) {
      Alert.alert(
        'Unassigned Items',
        `${unassignedCount} item(s) are not assigned to anyone. Please assign all items.`
      );
      return;
    }

    wizard.setStep('review');
  };

  const filteredSuggestions = recentNames.filter(
    name =>
      name.toLowerCase().includes(newName.toLowerCase()) &&
      !wizard.state.participants.some(p => p.name.toLowerCase() === name.toLowerCase())
  );

  const unassignedCount = wizard.getUnassignedItemCount();

  return (
    <View className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Add Participant */}
        <View className="mb-3">
          <Text style={{ color: COLORS.text.secondary }} className="text-base font-medium mb-2">
            Add People
          </Text>
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <View
              className="flex-1 flex-row items-center rounded-xl p-4"
              style={{ backgroundColor: COLORS.surface }}
            >
              <TextInput
                className="flex-1"
                style={{
                  color: COLORS.text.primary,
                  fontSize: FONT_SIZES.base,
                  includeFontPadding: false,
                  padding: 0,
                }}
                value={newName}
                onChangeText={setNewName}
                placeholder="Enter name"
                placeholderTextColor={COLORS.text.muted}
                onSubmitEditing={handleAddParticipant}
                returnKeyType="done"
              />
            </View>
            <TouchableOpacity
              className="w-12 h-12 rounded-xl items-center justify-center"
              style={{ backgroundColor: COLORS.pastel.blue }}
              onPress={handleAddParticipant}
            >
              <UserPlus size={22} color={COLORS.background} />
            </TouchableOpacity>
          </View>

          {/* Suggestions */}
          {newName.length > 0 && filteredSuggestions.length > 0 && (
            <View className="flex-row flex-wrap mt-2" style={{ gap: 8 }}>
              {filteredSuggestions.slice(0, 5).map(name => (
                <TouchableOpacity
                  key={name}
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: COLORS.surface }}
                  onPress={() => {
                    setNewName(name);
                    handleAddParticipant();
                  }}
                >
                  <Text className="text-sm" style={{ color: COLORS.text.secondary }}>
                    {name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Participants List */}
        <View className="mb-3">
          <Text style={{ color: COLORS.text.secondary }} className="text-base font-medium mb-2">
            People ({wizard.state.participants.length})
          </Text>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {wizard.state.participants.map((participant, index) => (
              <View
                key={participant.tempId}
                className="flex-row items-center px-3 py-2 rounded-full"
                style={{ backgroundColor: getParticipantColor(index) + '30' }}
              >
                <View
                  className="w-6 h-6 rounded-full items-center justify-center mr-2"
                  style={{ backgroundColor: getParticipantColor(index) }}
                >
                  <Text className="text-xs font-bold" style={{ color: COLORS.background }}>
                    {participant.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text className="text-sm font-medium" style={{ color: COLORS.text.primary }}>
                  {participant.name}
                </Text>
                <TouchableOpacity
                  className="ml-2"
                  onPress={() => handleRemoveParticipant(participant.tempId, participant.name)}
                >
                  <X size={16} color={COLORS.text.muted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          {wizard.state.participants.length === 0 && (
            <Text className="text-sm py-4 text-center" style={{ color: COLORS.text.muted }}>
              Add people who will split this bill
            </Text>
          )}
        </View>

        {/* Items to Assign */}
        <View className="mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text style={{ color: COLORS.text.secondary }} className="text-base font-medium">
              Assign Items
            </Text>
            {unassignedCount > 0 && (
              <View className="flex-row items-center">
                <AlertCircle size={14} color={COLORS.pastel.orange} />
                <Text className="text-xs ml-1" style={{ color: COLORS.pastel.orange }}>
                  {unassignedCount} unassigned
                </Text>
              </View>
            )}
          </View>

          {wizard.state.editedItems.map(item => {
            const assignees = wizard.getItemAssignees(item.tempId);
            const isAssigned = assignees.length > 0;

            return (
              <TouchableOpacity
                key={item.tempId}
                className="rounded-xl p-3 mb-2"
                style={{
                  backgroundColor: COLORS.surface,
                  borderWidth: !isAssigned ? 1 : 0,
                  borderColor: COLORS.pastel.orange,
                }}
                onPress={() => handleOpenAssignModal(item)}
                disabled={wizard.state.participants.length === 0}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text
                    className="flex-1 font-medium"
                    style={{ color: COLORS.text.primary }}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text className="font-bold" style={{ color: COLORS.text.primary }}>
                    ${item.totalPrice.toFixed(2)}
                  </Text>
                </View>

                {isAssigned ? (
                  <View className="flex-row flex-wrap" style={{ gap: 4 }}>
                    {assignees.map(pId => {
                      const participant = wizard.state.participants.find(p => p.tempId === pId);
                      const pIndex = wizard.state.participants.findIndex(p => p.tempId === pId);
                      if (!participant) {
                        return null;
                      }

                      const share = item.totalPrice / assignees.length;

                      return (
                        <View
                          key={pId}
                          className="flex-row items-center px-2 py-1 rounded-full"
                          style={{ backgroundColor: getParticipantColor(pIndex) + '30' }}
                        >
                          <Text className="text-xs" style={{ color: COLORS.text.primary }}>
                            {participant.name}
                          </Text>
                          <Text className="text-xs ml-1" style={{ color: COLORS.text.muted }}>
                            ${share.toFixed(2)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <Users size={14} color={COLORS.text.muted} />
                    <Text className="text-xs ml-1" style={{ color: COLORS.text.muted }}>
                      Tap to assign
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Next Button */}
      <View className="flex-row gap-3 pb-8">
        <TouchableOpacity
          className="flex-1 p-4 rounded-xl items-center"
          style={{
            backgroundColor:
              wizard.state.participants.length > 0 && unassignedCount === 0
                ? COLORS.pastel.blue
                : COLORS.surface,
          }}
          onPress={handleNext}
          disabled={wizard.state.participants.length === 0}
        >
          <Text
            className="text-base font-semibold"
            style={{
              color:
                wizard.state.participants.length > 0 && unassignedCount === 0
                  ? COLORS.background
                  : COLORS.text.muted,
            }}
          >
            Next: Review Summary
          </Text>
        </TouchableOpacity>
      </View>

      {/* Assignment Modal */}
      <Modal
        visible={assignModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setAssignModalVisible(false)}>
          <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <TouchableWithoutFeedback>
              <View className="rounded-t-3xl p-6 pt-8" style={{ backgroundColor: COLORS.card }}>
                <View className="flex-row items-center justify-between mb-5">
                  <Text style={{ color: COLORS.text.primary }} className="text-xl font-bold">
                    Assign to
                  </Text>
                  <TouchableOpacity className="p-2" onPress={() => setAssignModalVisible(false)}>
                    <X size={24} color={COLORS.text.secondary} />
                  </TouchableOpacity>
                </View>

                {selectedItem && (
                  <Text
                    style={{ color: COLORS.text.secondary }}
                    className="text-base font-medium mb-4"
                  >
                    {selectedItem.name} - ${selectedItem.totalPrice.toFixed(2)}
                  </Text>
                )}

                {wizard.state.participants.map((participant, index) => {
                  const isSelected =
                    selectedItem &&
                    wizard.getItemAssignees(selectedItem.tempId).includes(participant.tempId);

                  return (
                    <TouchableOpacity
                      key={participant.tempId}
                      className="flex-row items-center p-4 rounded-xl mb-3"
                      style={{
                        backgroundColor: isSelected
                          ? getParticipantColor(index) + '30'
                          : COLORS.surface,
                      }}
                      onPress={() => {
                        if (selectedItem) {
                          wizard.toggleItemAssignment(selectedItem.tempId, participant.tempId);
                        }
                      }}
                    >
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: getParticipantColor(index) }}
                      >
                        <Text className="text-base font-bold" style={{ color: COLORS.background }}>
                          {participant.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text className="flex-1 font-semibold" style={{ color: COLORS.text.primary }}>
                        {participant.name}
                      </Text>
                      {isSelected && <Check size={20} color={COLORS.pastel.green} />}
                    </TouchableOpacity>
                  );
                })}

                <View className="flex-row gap-3 pt-4 pb-8">
                  <TouchableOpacity
                    className="flex-1 p-4 rounded-xl items-center"
                    style={{ backgroundColor: COLORS.pastel.blue }}
                    onPress={() => setAssignModalVisible(false)}
                  >
                    <Text style={{ color: COLORS.background }} className="text-base font-semibold">
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
