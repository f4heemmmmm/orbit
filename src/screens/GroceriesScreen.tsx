import React, { useState, useEffect } from 'react';
import {
  type ListRenderItem,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { ShoppingBag, X, Trash2 } from 'lucide-react-native';
import {
  getGroceryItems,
  createGroceryItem,
  deleteGroceryItem,
  deleteAllGroceryItems,
} from '../services/groceryService';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../constants/theme';
import FloatingActionButton from '../components/FloatingActionButton';
import SwipeableGroceryItem from '../components/SwipeableGroceryItem';

interface GroceryItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function GroceriesScreen(): React.JSX.Element {
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch items on mount
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await getGroceryItems();

      // Convert database format to app format
      const formattedItems: GroceryItem[] = data.map(item => ({
        id: item.id,
        text: item.text,
        completed: item.completed,
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error('Error loading grocery items:', error);
      Alert.alert('Error', 'Failed to load grocery items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    try {
      setRefreshing(true);
      const data = await getGroceryItems();

      const formattedItems: GroceryItem[] = data.map(item => ({
        id: item.id,
        text: item.text,
        completed: item.completed,
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error('Error refreshing grocery items:', error);
      Alert.alert('Error', 'Failed to refresh grocery items. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const deleteItem = async (id: string): Promise<void> => {
    try {
      const success = await deleteGroceryItem(id);
      if (success) {
        setItems(items.filter(item => item.id !== id));
      } else {
        Alert.alert('Error', 'Failed to delete item. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert('Error', 'Failed to delete item. Please try again.');
    }
  };

  const deleteAllItems = async (): Promise<void> => {
    Alert.alert(
      'Delete All Groceries',
      'Are you sure you want to delete all grocery items? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteAllGroceryItems();
              if (success) {
                setItems([]);
              } else {
                Alert.alert('Error', 'Failed to delete items. Please try again.');
              }
            } catch (error) {
              console.error('Error deleting all items:', error);
              Alert.alert('Error', 'Failed to delete items. Please try again.');
            }
          },
        },
      ]
    );
  };

  const addItems = async (): Promise<void> => {
    // Prevent double submission
    if (saving) {
      return;
    }

    if (!text.trim()) {
      return;
    }

    // Split by newlines (handle both \n and \r\n), normalize whitespace, filter empty lines
    const itemTexts = text
      .split(/\r?\n/)
      .map(line => line.trim().replace(/\s+/g, ' ')) // Trim and collapse multiple spaces
      .filter(line => line.length > 0);

    if (itemTexts.length === 0) {
      return;
    }

    // Remove duplicates (case-insensitive comparison, keep first occurrence)
    const uniqueItemTexts = itemTexts.filter(
      (item, index, self) => self.findIndex(i => i.toLowerCase() === item.toLowerCase()) === index
    );

    try {
      setSaving(true);
      const newItems: GroceryItem[] = [];
      const failedItems: string[] = [];

      for (const itemText of uniqueItemTexts) {
        const newItem = await createGroceryItem({
          text: itemText,
          completed: false,
        });

        if (newItem) {
          newItems.push({
            id: newItem.id,
            text: newItem.text,
            completed: newItem.completed,
          });
        } else {
          failedItems.push(itemText);
        }
      }

      if (newItems.length > 0) {
        setItems([...newItems, ...items]);
      }

      if (failedItems.length > 0 && newItems.length > 0) {
        // Partial success
        Alert.alert(
          'Partial Success',
          `Added ${newItems.length} item(s), but failed to add: ${failedItems.join(', ')}`
        );
        setText(failedItems.join('\n')); // Keep failed items in input for retry
      } else if (failedItems.length > 0) {
        // Complete failure
        Alert.alert('Error', 'Failed to add items. Please try again.');
      } else {
        // Complete success
        setText('');
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Error adding items:', error);
      Alert.alert('Error', 'Failed to add items. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderItem: ListRenderItem<GroceryItem> = ({ item }) => {
    return <SwipeableGroceryItem item={item} onDelete={() => deleteItem(item.id)} />;
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      {/* Items List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.pastel.blue} />
          <Text style={{ color: COLORS.text.muted }} className="text-base mt-3">
            Loading items...
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.pastel.blue}
              colors={[COLORS.pastel.blue]}
            />
          }
          ListHeaderComponent={
            items.length > 0 ? (
              <TouchableOpacity
                className="flex-row items-center justify-center py-3 px-4 rounded-xl mb-4"
                style={{ backgroundColor: COLORS.pastel.red }}
                onPress={deleteAllItems}
              >
                <Trash2 size={18} color={COLORS.background} />
                <Text style={{ color: COLORS.background }} className="text-base font-semibold ml-2">
                  Delete All
                </Text>
              </TouchableOpacity>
            ) : null
          }
          ListEmptyComponent={
            <View className="items-center justify-center pt-16">
              <ShoppingBag size={48} color={COLORS.text.muted} />
              <Text style={{ color: COLORS.text.muted }} className="text-base mt-3">
                No items found
              </Text>
              <Text style={{ color: COLORS.text.muted }} className="text-sm mt-1">
                Tap + to add your first item
              </Text>
            </View>
          }
        />
      )}

      <FloatingActionButton onPress={() => setModalVisible(true)} />

      {/* Add Items Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <TouchableWithoutFeedback>
              <View
                className="rounded-t-3xl p-6 pt-8"
                style={{ backgroundColor: COLORS.card, height: '92%' }}
              >
                <View className="flex-row items-center justify-between mb-5">
                  <Text style={{ color: COLORS.text.primary }} className="text-xl font-bold">
                    Add Groceries
                  </Text>
                  <TouchableOpacity
                    className="p-2"
                    onPress={() => {
                      setModalVisible(false);
                      setText('');
                    }}
                  >
                    <X size={24} color={COLORS.text.secondary} />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  className="flex-1"
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="on-drag"
                >
                  <Text
                    style={{ color: COLORS.text.secondary }}
                    className="text-base font-medium mb-2"
                  >
                    Items
                  </Text>
                  <Text style={{ color: COLORS.text.muted }} className="text-sm mb-3">
                    Enter each item on a new line (press Enter after each)
                  </Text>
                  <TextInput
                    className="rounded-xl p-4"
                    style={{
                      backgroundColor: COLORS.surface,
                      color: COLORS.text.primary,
                      fontSize: 16,
                      includeFontPadding: false,
                      minHeight: 200,
                      textAlignVertical: 'top',
                      opacity: saving ? 0.5 : 1,
                    }}
                    placeholderTextColor={COLORS.text.muted}
                    placeholder={'Milk\nEggs\nBread\nButter'}
                    value={text}
                    onChangeText={setText}
                    multiline
                    autoFocus
                    editable={!saving}
                  />
                </ScrollView>
                <View className="flex-row gap-3 pb-8">
                  <TouchableOpacity
                    className="flex-1 p-4 rounded-xl items-center"
                    style={{ backgroundColor: COLORS.surface, opacity: saving ? 0.5 : 1 }}
                    onPress={() => {
                      if (!saving) {
                        setModalVisible(false);
                        setText('');
                      }
                    }}
                    disabled={saving}
                  >
                    <Text
                      style={{ color: COLORS.text.secondary }}
                      className="text-base font-semibold"
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 p-4 rounded-xl items-center"
                    style={{ backgroundColor: COLORS.pastel.blue, opacity: saving ? 0.7 : 1 }}
                    onPress={addItems}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color={COLORS.background} />
                    ) : (
                      <Text
                        style={{ color: COLORS.background }}
                        className="text-base font-semibold"
                      >
                        Save
                      </Text>
                    )}
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
