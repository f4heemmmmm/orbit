import React, { useState } from 'react';
import { X } from 'lucide-react-native';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';

type PriorityLevel = 'low' | 'medium' | 'high';

interface Priority {
  id: PriorityLevel;
  label: string;
  color: string;
}

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (task: { title: string; description: string; priority: PriorityLevel }) => Promise<void>;
  colors: {
    card: string;
    surface: string;
    background: string;
    pastel: {
      blue: string;
      green: string;
      orange: string;
      red: string;
    };
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
  };
}

export default function AddTaskModal({
  visible,
  onClose,
  onAdd,
  colors,
}: AddTaskModalProps): React.JSX.Element {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');

  const priorities: Priority[] = [
    { id: 'low', label: 'Low', color: colors.pastel.green },
    { id: 'medium', label: 'Medium', color: colors.pastel.orange },
    { id: 'high', label: 'High', color: colors.pastel.red },
  ];

  const handleClose = (): void => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    onClose();
  };

  const handleAdd = async (): Promise<void> => {
    if (!title.trim()) {
      return;
    }

    await onAdd({
      title: title.trim(),
      description: description.trim(),
      priority,
    });

    setTitle('');
    setDescription('');
    setPriority('medium');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableWithoutFeedback>
            <View
              className="rounded-t-3xl p-6 pt-8"
              style={{ backgroundColor: colors.card, height: '92%' }}
            >
              <View className="flex-row items-center justify-between mb-5">
                <Text style={{ color: colors.text.primary }} className="text-xl font-bold">
                  Add Task
                </Text>
                <TouchableOpacity className="p-2" onPress={handleClose}>
                  <X size={24} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>
              <ScrollView
                className="flex-1"
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
              >
                <Text
                  style={{ color: colors.text.secondary }}
                  className="text-base font-medium mb-2"
                >
                  Title
                </Text>
                <TextInput
                  className="rounded-xl mb-3 p-4"
                  style={{
                    backgroundColor: colors.surface,
                    color: colors.text.primary,
                    fontSize: 16,
                    includeFontPadding: false,
                  }}
                  placeholderTextColor={colors.text.muted}
                  value={title}
                  onChangeText={setTitle}
                  autoFocus
                />

                <Text
                  style={{ color: colors.text.secondary }}
                  className="text-base font-medium mb-2"
                >
                  Description (optional)
                </Text>
                <TextInput
                  className="rounded-xl mb-3 p-4"
                  style={{
                    backgroundColor: colors.surface,
                    color: colors.text.primary,
                    fontSize: 16,
                    includeFontPadding: false,
                    minHeight: 100,
                    textAlignVertical: 'top',
                  }}
                  placeholderTextColor={colors.text.muted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                />

                <Text
                  style={{ color: colors.text.secondary }}
                  className="text-base font-medium mb-2"
                >
                  Priority
                </Text>
                <View className="flex-row mb-4 gap-3">
                  {priorities.map(p => (
                    <TouchableOpacity
                      key={p.id}
                      className="flex-1 p-3 rounded-xl items-center"
                      style={{
                        backgroundColor: priority === p.id ? p.color : colors.surface,
                      }}
                      onPress={() => setPriority(p.id)}
                    >
                      <Text
                        style={{
                          color: priority === p.id ? colors.background : colors.text.secondary,
                        }}
                        className="text-base font-medium"
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <View className="flex-row gap-3 pb-8">
                <TouchableOpacity
                  className="flex-1 p-4 rounded-xl items-center"
                  style={{ backgroundColor: colors.surface }}
                  onPress={handleClose}
                >
                  <Text
                    style={{ color: colors.text.secondary }}
                    className="text-base font-semibold"
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 p-4 rounded-xl items-center"
                  style={{ backgroundColor: colors.pastel.blue }}
                  onPress={handleAdd}
                >
                  <Text style={{ color: colors.background }} className="text-base font-semibold">
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
