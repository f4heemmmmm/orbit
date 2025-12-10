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
} from 'react-native';
import { CheckSquare, Square, Trash2, Plus } from 'lucide-react-native';
import {
  getTasks,
  createTask,
  toggleTaskCompletion,
  deleteTask as deleteTaskService,
} from '../services/taskService';
import { COLORS } from '../constants/theme';

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

const PRIORITIES: Priority[] = [
  { id: 'low', label: 'Low', color: COLORS.pastel.green },
  { id: 'medium', label: 'Medium', color: COLORS.pastel.orange },
  { id: 'high', label: 'High', color: COLORS.pastel.red },
];

type FilterType = 'all' | 'pending' | 'completed';

export default function TasksScreen(): React.JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

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

  const getPriorityInfo = (priorityId: string): Priority => {
    return PRIORITIES.find(p => p.id === priorityId) || PRIORITIES[1];
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

  const renderTask: ListRenderItem<Task> = ({ item }) => {
    const priorityInfo = getPriorityInfo(item.priority);
    return (
      <View
        className="flex-row items-center rounded-xl p-4 mb-2"
        style={{ backgroundColor: COLORS.card }}
      >
        <TouchableOpacity onPress={() => toggleTask(item.id)} className="mr-3">
          {item.completed ? (
            <CheckSquare size={26} color={COLORS.pastel.green} />
          ) : (
            <Square size={26} color={COLORS.text.muted} />
          )}
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            className="text-base font-medium"
            style={{
              color: item.completed ? COLORS.text.muted : COLORS.text.primary,
              textDecorationLine: item.completed ? 'line-through' : 'none',
            }}
          >
            {item.title}
          </Text>
          {item.description ? (
            <Text
              style={{ color: COLORS.text.secondary }}
              className="text-sm mt-1"
              numberOfLines={1}
            >
              {item.description}
            </Text>
          ) : null}
          <View
            className="flex-row items-center self-start px-2.5 py-1 rounded-xl mt-2"
            style={{ backgroundColor: priorityInfo.color + '25' }}
          >
            <View
              className="w-1.5 h-1.5 rounded-full mr-1.5"
              style={{ backgroundColor: priorityInfo.color }}
            />
            <Text className="text-xs font-medium" style={{ color: priorityInfo.color }}>
              {priorityInfo.label}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => deleteTask(item.id)} className="p-2">
          <Trash2 size={20} color={COLORS.pastel.red} />
        </TouchableOpacity>
      </View>
    );
  };

  const filters: FilterType[] = ['all', 'pending', 'completed'];

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
            className="px-4 py-2 rounded-full"
            style={{ backgroundColor: filter === f ? COLORS.pastel.blue : COLORS.card }}
            onPress={() => setFilter(f)}
          >
            <Text
              className="text-sm font-medium"
              style={{ color: filter === f ? COLORS.background : COLORS.text.secondary }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tasks List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.pastel.blue} />
          <Text style={{ color: COLORS.text.muted }} className="text-base mt-3">
            Loading tasks...
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
              <CheckSquare size={48} color={COLORS.text.muted} />
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

      {/* Add Button */}
      <TouchableOpacity
        className="absolute right-5 bottom-5 w-14 h-14 rounded-full justify-center items-center shadow-lg"
        style={{ backgroundColor: COLORS.pastel.blue }}
        onPress={() => setModalVisible(true)}
      >
        <Plus size={30} color={COLORS.background} />
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <TouchableWithoutFeedback>
              <View className="rounded-t-3xl p-6" style={{ backgroundColor: COLORS.card }}>
                <Text
                  style={{ color: COLORS.text.primary }}
                  className="text-xl font-bold mb-5 text-center"
                >
                  New Task
                </Text>

                <TextInput
                  className="rounded-xl mb-3"
                  style={{
                    backgroundColor: COLORS.surface,
                    color: COLORS.text.primary,
                    paddingHorizontal: 16,
                    paddingVertical: 0,
                    height: 56,
                    fontSize: 16,
                    lineHeight: 20,
                    includeFontPadding: false,
                  }}
                  placeholder="Task title"
                  placeholderTextColor={COLORS.text.muted}
                  value={title}
                  onChangeText={setTitle}
                />

                <TextInput
                  className="rounded-xl text-base mb-3"
                  style={{
                    backgroundColor: COLORS.surface,
                    color: COLORS.text.primary,
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    minHeight: 80,
                    textAlignVertical: 'top',
                  }}
                  placeholder="Description (optional)"
                  placeholderTextColor={COLORS.text.muted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                />

                {/* Priority Selection */}
                <Text style={{ color: COLORS.text.secondary }} className="text-sm font-medium mb-2">
                  Priority
                </Text>
                <View className="flex-row gap-3 mb-5">
                  {PRIORITIES.map(p => (
                    <TouchableOpacity
                      key={p.id}
                      className="flex-1 py-3 rounded-xl items-center"
                      style={{ backgroundColor: priority === p.id ? p.color : COLORS.surface }}
                      onPress={() => setPriority(p.id)}
                    >
                      <Text
                        className="text-sm font-medium"
                        style={{
                          color: priority === p.id ? COLORS.background : COLORS.text.secondary,
                        }}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

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
                    onPress={addTask}
                  >
                    <Text style={{ color: COLORS.background }} className="text-base font-semibold">
                      Add Task
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
