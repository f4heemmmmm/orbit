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
  ScrollView,
} from 'react-native';
import { Circle, X, Sparkles, RotateCcw } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  getTasks,
  createTask,
  toggleTaskCompletion,
  deleteTask as deleteTaskService,
  updateTaskSortOrder,
  resetTaskSortOrder,
  hasCustomSortOrder,
} from '../services/taskService';
import { prioritizeTasks } from '../services/aiService';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../constants/theme';
import FloatingActionButton from '../components/FloatingActionButton';
import SwipeableTaskItem from '../components/SwipeableTaskItem';

interface Priority {
  id: 'low' | 'medium' | 'high';
  label: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

type RootStackParamList = {
  MainTabs: undefined;
  ViewTask: { task: Task; onToggle?: (id: string) => void };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const getPriorities = (colors: ReturnType<typeof getThemeColors>): Priority[] => [
  { id: 'low', label: 'Low', color: colors.pastel.green },
  { id: 'medium', label: 'Medium', color: colors.pastel.orange },
  { id: 'high', label: 'High', color: colors.pastel.red },
];

type FilterType = 'pending' | 'completed';

export default function TasksScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);
  const PRIORITIES = getPriorities(COLORS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<FilterType>('pending');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [prioritizing, setPrioritizing] = useState(false);
  const [hasSortOrder, setHasSortOrder] = useState(false);

  // Fetch tasks on mount
  useEffect(() => {
    loadTasks();
    checkSortOrder();
  }, []);

  const checkSortOrder = async (): Promise<void> => {
    const hasOrder = await hasCustomSortOrder();
    setHasSortOrder(hasOrder);
  };

  const loadTasks = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await getTasks();

      // Convert database format to app format
      const formattedTasks: Task[] = data.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        priority: t.priority,
        completed: t.completed,
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    try {
      setRefreshing(true);
      const data = await getTasks();

      // Convert database format to app format
      const formattedTasks: Task[] = data.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        priority: t.priority,
        completed: t.completed,
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error refreshing tasks:', error);
      Alert.alert('Error', 'Failed to refresh tasks. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const toggleTask = async (id: string): Promise<void> => {
    try {
      // Optimistically update UI
      setTasks(
        tasks.map(task => (task.id === id ? { ...task, completed: !task.completed } : task))
      );

      // Update in database
      const updatedTask = await toggleTaskCompletion(id);

      if (!updatedTask) {
        // Revert on failure
        setTasks(
          tasks.map(task => (task.id === id ? { ...task, completed: !task.completed } : task))
        );
        Alert.alert('Error', 'Failed to update task. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      // Revert on error
      setTasks(
        tasks.map(task => (task.id === id ? { ...task, completed: !task.completed } : task))
      );
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  const addTask = async (): Promise<void> => {
    if (!title.trim()) {
      return;
    }

    try {
      const newTask = await createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        completed: false,
      });

      if (newTask) {
        // Add to local state
        const formattedTask: Task = {
          id: newTask.id,
          title: newTask.title,
          description: newTask.description || '',
          priority: newTask.priority,
          completed: newTask.completed,
        };

        setTasks([formattedTask, ...tasks]);
        setTitle('');
        setDescription('');
        setPriority('medium');
        setModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to add task. Please try again.');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task. Please try again.');
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    try {
      // Optimistically update UI
      const previousTasks = [...tasks];
      setTasks(tasks.filter(task => task.id !== id));

      // Delete from database
      const success = await deleteTaskService(id);

      if (!success) {
        // Revert on failure
        setTasks(previousTasks);
        Alert.alert('Error', 'Failed to delete task. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task. Please try again.');
    }
  };

  const handlePrioritize = async (): Promise<void> => {
    const pendingTasks = tasks.filter(t => !t.completed);
    if (pendingTasks.length < 2) {
      Alert.alert('Not Enough Tasks', 'You need at least 2 pending tasks to prioritize.');
      return;
    }

    Alert.alert(
      'AI Prioritization',
      'This will use AI to analyze and reorder your tasks by urgency. Your task data will be sent to OpenAI for analysis. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Prioritize',
          onPress: async () => {
            try {
              setPrioritizing(true);

              const tasksForAI = tasks.map(t => ({
                id: t.id,
                title: t.title,
                description: t.description,
                priority: t.priority,
                completed: t.completed,
              }));

              const result = await prioritizeTasks(tasksForAI);

              if (!result.success) {
                Alert.alert('Error', result.error || 'Failed to prioritize tasks.');
                return;
              }

              if (result.orderedTaskIds.length === 0) {
                Alert.alert('No Tasks', 'No pending tasks to prioritize.');
                return;
              }

              // Update sort_order in database
              const updateSuccess = await updateTaskSortOrder(result.orderedTaskIds);

              if (!updateSuccess) {
                Alert.alert('Error', 'Failed to save new task order.');
                return;
              }

              // Reload tasks to get new order
              await loadTasks();
              setHasSortOrder(true);

              Alert.alert('Success', 'Tasks have been prioritized by AI!');
            } catch (error) {
              console.error('Error prioritizing tasks:', error);
              Alert.alert('Error', 'An unexpected error occurred.');
            } finally {
              setPrioritizing(false);
            }
          },
        },
      ]
    );
  };

  const handleRecover = async (): Promise<void> => {
    Alert.alert(
      'Restore Default Order',
      'This will reset all tasks to their original order (by creation date). Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            try {
              setPrioritizing(true);

              const success = await resetTaskSortOrder();

              if (!success) {
                Alert.alert('Error', 'Failed to reset task order.');
                return;
              }

              // Reload tasks to get default order
              await loadTasks();
              setHasSortOrder(false);

              Alert.alert('Success', 'Task order has been restored.');
            } catch (error) {
              console.error('Error resetting task order:', error);
              Alert.alert('Error', 'An unexpected error occurred.');
            } finally {
              setPrioritizing(false);
            }
          },
        },
      ]
    );
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') {
      return task.completed;
    }
    if (filter === 'pending') {
      return !task.completed;
    }
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;

  const handleViewTask = (task: Task): void => {
    navigation.navigate('ViewTask', {
      task,
      onToggle: toggleTask,
    });
  };

  const renderTask: ListRenderItem<Task> = ({ item }) => {
    return (
      <SwipeableTaskItem
        item={item}
        onToggle={() => toggleTask(item.id)}
        onDelete={() => deleteTask(item.id)}
        onPress={() => handleViewTask(item)}
      />
    );
  };

  const filters: FilterType[] = ['pending', 'completed'];

  const getFilterLabel = (filterType: FilterType): string => {
    return filterType === 'pending' ? 'To-do' : 'Completed';
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      {/* Stats */}
      <View className="flex-row p-4 gap-3">
        <View
          className="flex-1 rounded-2xl p-4 items-center"
          style={{ backgroundColor: COLORS.card }}
        >
          <Text style={{ color: COLORS.pastel.blue }} className="text-3xl font-bold">
            {tasks.length}
          </Text>
          <Text style={{ color: COLORS.text.secondary }} className="text-xs mt-1">
            Total
          </Text>
        </View>
        <View
          className="flex-1 rounded-2xl p-4 items-center"
          style={{ backgroundColor: COLORS.card }}
        >
          <Text style={{ color: COLORS.pastel.green }} className="text-3xl font-bold">
            {completedCount}
          </Text>
          <Text style={{ color: COLORS.text.secondary }} className="text-xs mt-1">
            Completed
          </Text>
        </View>
        <View
          className="flex-1 rounded-2xl p-4 items-center"
          style={{ backgroundColor: COLORS.card }}
        >
          <Text style={{ color: COLORS.pastel.orange }} className="text-3xl font-bold">
            {pendingCount}
          </Text>
          <Text style={{ color: COLORS.text.secondary }} className="text-xs mt-1">
            Pending
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-4 mb-3 gap-2">
        {filters.map(f => (
          <TouchableOpacity
            key={f}
            className="flex-1 py-2 rounded-full"
            style={{ backgroundColor: filter === f ? COLORS.pastel.blue : COLORS.card }}
            onPress={() => setFilter(f)}
          >
            <Text
              className="text-sm font-medium text-center"
              style={{ color: filter === f ? COLORS.background : COLORS.text.secondary }}
            >
              {getFilterLabel(f)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* AI Prioritization Buttons */}
      <View className="flex-row px-4 mb-3 gap-2">
        <TouchableOpacity
          className="flex-1 py-2.5 rounded-xl flex-row items-center justify-center"
          style={{
            backgroundColor: COLORS.pastel.purple,
            opacity: prioritizing ? 0.7 : 1,
          }}
          onPress={handlePrioritize}
          disabled={prioritizing}
        >
          {prioritizing ? (
            <ActivityIndicator size="small" color={COLORS.background} />
          ) : (
            <>
              <Sparkles size={16} color={COLORS.background} />
              <Text className="text-sm font-semibold ml-1.5" style={{ color: COLORS.background }}>
                Prioritize
              </Text>
            </>
          )}
        </TouchableOpacity>
        {hasSortOrder && (
          <TouchableOpacity
            className="py-2.5 px-4 rounded-xl flex-row items-center justify-center"
            style={{
              backgroundColor: COLORS.card,
              opacity: prioritizing ? 0.7 : 1,
            }}
            onPress={handleRecover}
            disabled={prioritizing}
          >
            <RotateCcw size={16} color={COLORS.text.secondary} />
            <Text className="text-sm font-medium ml-1.5" style={{ color: COLORS.text.secondary }}>
              Reset
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tasks List */}
      {loading || prioritizing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.pastel.blue} />
          <Text style={{ color: COLORS.text.muted }} className="text-base mt-3">
            {prioritizing ? 'Processing...' : 'Loading tasks...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={item => item.id}
          className="flex-1 px-4"
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
              <Circle size={48} color={COLORS.text.muted} />
              <Text style={{ color: COLORS.text.muted }} className="text-base mt-3">
                No tasks found
              </Text>
              <Text style={{ color: COLORS.text.muted }} className="text-sm mt-1">
                Tap + to add your first task
              </Text>
            </View>
          }
        />
      )}

      <FloatingActionButton onPress={() => setModalVisible(true)} />

      {/* Add Task Modal */}
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
                    Add Task
                  </Text>
                  <TouchableOpacity className="p-2" onPress={() => setModalVisible(false)}>
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
                    Title
                  </Text>
                  <TextInput
                    className="rounded-xl mb-3 p-4"
                    style={{
                      backgroundColor: COLORS.surface,
                      color: COLORS.text.primary,
                      fontSize: 16,
                      includeFontPadding: false,
                    }}
                    placeholderTextColor={COLORS.text.muted}
                    value={title}
                    onChangeText={setTitle}
                    autoFocus
                  />

                  <Text
                    style={{ color: COLORS.text.secondary }}
                    className="text-base font-medium mb-2"
                  >
                    Description (optional)
                  </Text>
                  <TextInput
                    className="rounded-xl mb-3 p-4"
                    style={{
                      backgroundColor: COLORS.surface,
                      color: COLORS.text.primary,
                      fontSize: 16,
                      includeFontPadding: false,
                      minHeight: 100,
                      textAlignVertical: 'top',
                    }}
                    placeholderTextColor={COLORS.text.muted}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                  />

                  <Text
                    style={{ color: COLORS.text.secondary }}
                    className="text-base font-medium mb-2"
                  >
                    Priority
                  </Text>
                  <View className="flex-row mb-4 gap-3">
                    {PRIORITIES.map(p => (
                      <TouchableOpacity
                        key={p.id}
                        className="flex-1 p-3 rounded-xl items-center"
                        style={{
                          backgroundColor: priority === p.id ? p.color : COLORS.surface,
                        }}
                        onPress={() => setPriority(p.id)}
                      >
                        <Text
                          style={{
                            color: priority === p.id ? COLORS.background : COLORS.text.secondary,
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
                    onPress={addTask}
                  >
                    <Text style={{ color: COLORS.background }} className="text-base font-semibold">
                      Add
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
