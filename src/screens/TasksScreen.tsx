// Main Task Dashboard - Orbit Task Page
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../constants/theme';
import { prioritizeTasks } from '../services/aiService';
import { useNavigation } from '@react-navigation/native';
import SwipeableTaskItem from '../components/SwipeableTaskItem';
import FloatingActionButton from '../components/FloatingActionButton';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { Sparkles, RotateCcw, Trash2 } from 'lucide-react-native';
import {
  type ListRenderItem,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  getTasks,
  createTask,
  toggleTaskCompletion,
  deleteTask as deleteTaskService,
  updateTaskSortOrder,
  resetTaskSortOrder,
  hasCustomSortOrder,
  deleteAllCompletedTasks,
} from '../services/taskService';
import {
  TaskProgressCard,
  TaskFilterTabs,
  AddTaskModal,
  TaskEmptyState,
  type FilterType,
} from '../components/tasks';

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

export default function TasksScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState<FilterType>('pending');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [prioritizing, setPrioritizing] = useState(false);
  const [hasSortOrder, setHasSortOrder] = useState(false);

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
      setTasks(
        tasks.map(task => (task.id === id ? { ...task, completed: !task.completed } : task))
      );

      const updatedTask = await toggleTaskCompletion(id);

      if (!updatedTask) {
        setTasks(
          tasks.map(task => (task.id === id ? { ...task, completed: !task.completed } : task))
        );
        Alert.alert('Error', 'Failed to update task. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      setTasks(
        tasks.map(task => (task.id === id ? { ...task, completed: !task.completed } : task))
      );
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  const addTask = async (taskData: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }): Promise<void> => {
    try {
      const newTask = await createTask({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        completed: false,
      });

      if (newTask) {
        const formattedTask: Task = {
          id: newTask.id,
          title: newTask.title,
          description: newTask.description || '',
          priority: newTask.priority,
          completed: newTask.completed,
        };

        setTasks([formattedTask, ...tasks]);
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
      const previousTasks = [...tasks];
      setTasks(tasks.filter(task => task.id !== id));

      const success = await deleteTaskService(id);

      if (!success) {
        setTasks(previousTasks);
        Alert.alert('Error', 'Failed to delete task. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task. Please try again.');
    }
  };

  const deleteAllCompleted = async (): Promise<void> => {
    Alert.alert(
      'Delete All Your Completed Tasks',
      'Are you sure you want to delete all completed tasks? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteAllCompletedTasks();
              if (success) {
                setTasks(tasks.filter(task => !task.completed));
              } else {
                Alert.alert('Error', 'Failed to delete tasks. Please try again.');
              }
            } catch (error) {
              console.error('Error deleting all completed tasks:', error);
              Alert.alert('Error', 'Failed to delete tasks. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handlePrioritize = useCallback(async (): Promise<void> => {
    const pendingTasks = tasks.filter(t => !t.completed);
    if (pendingTasks.length < 2) {
      Alert.alert('Not Enough Tasks', 'You need at least 2 pending tasks to prioritize.');
      return;
    }

    Alert.alert(
      'AI Prioritization',
      'This will use AI to analyze and reorder your tasks by urgency. Continue?',
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

              const updateSuccess = await updateTaskSortOrder(result.orderedTaskIds);

              if (!updateSuccess) {
                Alert.alert('Error', 'Failed to save new task order.');
                return;
              }

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
  }, [tasks]);

  const handleRecover = useCallback(async (): Promise<void> => {
    Alert.alert(
      'Restore Default Order',
      'This will reset all tasks to their original order. Continue?',
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
  }, []);

  useLayoutEffect(() => {
    const pendingTasks = tasks.filter(t => !t.completed);
    const canPrioritize = pendingTasks.length >= 2 && !prioritizing && !loading;

    navigation.setOptions({
      headerRight: () => (
        <View className="flex-row items-center mr-2">
          {hasSortOrder && (
            <TouchableOpacity
              className="p-2 mr-1"
              onPress={handleRecover}
              disabled={prioritizing}
              style={{ opacity: prioritizing ? 0.5 : 1 }}
            >
              <RotateCcw size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="flex-row items-center py-1.5 px-3 rounded-full"
            style={{
              backgroundColor: canPrioritize ? COLORS.pastel.purple : COLORS.surface,
              opacity: canPrioritize ? 1 : 0.5,
            }}
            onPress={handlePrioritize}
            disabled={!canPrioritize}
          >
            {prioritizing ? (
              <ActivityIndicator size="small" color={COLORS.background} />
            ) : (
              <>
                <Sparkles size={14} color={canPrioritize ? COLORS.background : COLORS.text.muted} />
                <Text
                  className="text-xs font-semibold ml-1"
                  style={{ color: canPrioritize ? COLORS.background : COLORS.text.muted }}
                >
                  Prioritize
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ),
    });
  }, [
    navigation,
    tasks,
    prioritizing,
    loading,
    hasSortOrder,
    COLORS,
    handlePrioritize,
    handleRecover,
  ]);

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

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      <TaskProgressCard
        completedCount={completedCount}
        pendingCount={pendingCount}
        totalCount={tasks.length}
        colors={COLORS}
      />

      <TaskFilterTabs activeFilter={filter} onFilterChange={setFilter} colors={COLORS} />

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
          ListEmptyComponent={<TaskEmptyState colors={COLORS} />}
        />
      )}

      {filter === 'completed' && completedCount > 0 && (
        <TouchableOpacity
          className="absolute bottom-5 left-5 w-14 h-14 rounded-full items-center justify-center shadow-lg"
          style={{ backgroundColor: COLORS.pastel.red }}
          onPress={deleteAllCompleted}
          activeOpacity={0.8}
        >
          <Trash2 size={24} color={COLORS.background} />
        </TouchableOpacity>
      )}

      <FloatingActionButton onPress={() => setModalVisible(true)} />

      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={addTask}
        colors={COLORS}
      />
    </View>
  );
}
