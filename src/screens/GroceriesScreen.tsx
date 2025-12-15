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
} from 'react-native';
import { ShoppingBag, X } from 'lucide-react-native';
import { getGroceryItems, createGroceryItem, deleteGroceryItem } from '../services/groceryService';
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
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalVisible(false);
          setText('');
        }}
      >
        <TouchableOpacity
          className="flex-1 items-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', paddingTop: '60%' }}
          activeOpacity={1}
          onPress={() => {
            setModalVisible(false);
            setText('');
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            className="w-[85%] rounded-2xl p-5"
            style={{ backgroundColor: COLORS.card }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text style={{ color: COLORS.text.primary }} className="text-xl font-bold">
                Add Grocery Item
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setText('');
                }}
              >
                <X size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: COLORS.text.secondary }} className="text-base font-medium mb-2">
              Item name
            </Text>
            <TextInput
              className="rounded-xl mb-4 p-4"
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

            <TouchableOpacity
              className="rounded-xl py-3 items-center"
              style={{ backgroundColor: COLORS.pastel.blue }}
              onPress={addItem}
            >
              <Text style={{ color: COLORS.background }} className="text-base font-semibold">
                Add Item
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
