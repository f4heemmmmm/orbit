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
  Keyboard,
  TouchableWithoutFeedback,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CheckSquare, Square, Trash2, ShoppingBag } from 'lucide-react-native';
import {
  getGroceryItems,
  createGroceryItem,
  toggleGroceryItemCompletion,
  deleteGroceryItem,
} from '../services/groceryService';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../constants/theme';
import FloatingActionButton from '../components/FloatingActionButton';

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

  const toggleItem = async (id: string): Promise<void> => {
    try {
      // Optimistically update UI
      setItems(
        items.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
      );

      // Update in database
      const updatedItem = await toggleGroceryItemCompletion(id);

      if (!updatedItem) {
        // Revert on failure
        setItems(
          items.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
        );
        Alert.alert('Error', 'Failed to update item. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling item:', error);
      // Revert on error
      setItems(
        items.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
      );
      Alert.alert('Error', 'Failed to update item. Please try again.');
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

  const addItem = async (): Promise<void> => {
    if (!text.trim()) {
      return;
    }

    try {
      const newItem = await createGroceryItem({
        text: text.trim(),
        completed: false,
      });

      if (newItem) {
        const formattedItem: GroceryItem = {
          id: newItem.id,
          text: newItem.text,
          completed: newItem.completed,
        };

        setItems([formattedItem, ...items]);
        setText('');
        setModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to add item. Please try again.');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item. Please try again.');
    }
  };

  const renderItem: ListRenderItem<GroceryItem> = ({ item }) => {
    return (
      <View
        className="flex-row items-center rounded-xl p-4 mb-2"
        style={{ backgroundColor: COLORS.card }}
      >
        <TouchableOpacity onPress={() => toggleItem(item.id)} className="mr-3">
          {item.completed ? (
            <CheckSquare size={26} color={COLORS.pastel.green} />
          ) : (
            <Square size={26} color={COLORS.text.muted} />
          )}
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            style={{
              color: item.completed ? COLORS.text.muted : COLORS.text.primary,
              textDecorationLine: item.completed ? 'line-through' : 'none',
            }}
            className="text-base"
          >
            {item.text}
          </Text>
        </View>
        <TouchableOpacity onPress={() => deleteItem(item.id)} className="p-2">
          <Trash2 size={20} color={COLORS.pastel.red} />
        </TouchableOpacity>
      </View>
    );
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

      {/* Add Item Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
              <TouchableWithoutFeedback>
                <View className="rounded-t-3xl p-6" style={{ backgroundColor: COLORS.card }}>
                  <Text
                    style={{ color: COLORS.text.primary }}
                    className="text-xl font-bold mb-5 text-center"
                  >
                    New Grocery Item
                  </Text>

                  <Text
                    style={{ color: COLORS.text.secondary }}
                    className="text-base font-medium mb-2"
                  >
                    Item
                  </Text>
                  <TextInput
                    className="rounded-xl mb-5 p-4"
                    style={{
                      backgroundColor: COLORS.surface,
                      color: COLORS.text.primary,
                      fontSize: 16,
                      includeFontPadding: false,
                    }}
                    placeholderTextColor={COLORS.text.muted}
                    placeholder="e.g., Milk, Eggs, Bread"
                    value={text}
                    onChangeText={setText}
                    autoFocus
                  />

                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      className="flex-1 p-4 rounded-xl items-center"
                      style={{ backgroundColor: COLORS.surface }}
                      onPress={() => setModalVisible(false)}
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
                      style={{ backgroundColor: COLORS.pastel.blue }}
                      onPress={addItem}
                    >
                      <Text
                        style={{ color: COLORS.background }}
                        className="text-base font-semibold"
                      >
                        Add Item
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
