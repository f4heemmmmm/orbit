import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ListRenderItem,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { CheckSquare, Square, Trash2, Plus } from 'lucide-react-native';
import { getTasks, createTask, toggleTaskCompletion, deleteTask as deleteTaskService } from '../services/taskService';

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

// Pastel colors for dark mode
const PRIORITIES: Priority[] = [
  { id: 'low', label: 'Low', color: '#7dd3a8' },
  { id: 'medium', label: 'Medium', color: '#ffd6a5' },
  { id: 'high', label: 'High', color: '#f5a0a0' },
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

  const toggleTask = async (id: string): Promise<void> => {
    try {
      // Optimistically update UI
      setTasks(tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ));

      // Update in database
      const updatedTask = await toggleTaskCompletion(id);

      if (!updatedTask) {
        // Revert on failure
        setTasks(tasks.map(task =>
          task.id === id ? { ...task, completed: !task.completed } : task
        ));
        Alert.alert('Error', 'Failed to update task. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      // Revert on error
      setTasks(tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ));
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  const addTask = async (): Promise<void> => {
    if (!title.trim()) return;

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
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;

  const renderTask: ListRenderItem<Task> = ({ item }) => {
    const priorityInfo = getPriorityInfo(item.priority);
    return (
      <View className="flex-row items-center rounded-xl p-4 mb-2" style={{ backgroundColor: '#1a1a2e' }}>
        <TouchableOpacity onPress={() => toggleTask(item.id)} className="mr-3">
          {item.completed ? (
            <CheckSquare size={26} color="#7dd3a8" />
          ) : (
            <Square size={26} color="#6b6b80" />
          )}
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            className="text-base font-medium"
            style={{ color: item.completed ? '#6b6b80' : '#e8e8e8', textDecorationLine: item.completed ? 'line-through' : 'none' }}
          >
            {item.title}
          </Text>
          {item.description ? (
            <Text style={{ color: '#a0a0b0' }} className="text-sm mt-1" numberOfLines={1}>
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
          <Trash2 size={20} color="#f5a0a0" />
        </TouchableOpacity>
      </View>
    );
  };

  const filters: FilterType[] = ['all', 'pending', 'completed'];

  return (
    <View className="flex-1" style={{ backgroundColor: '#0f0f1a' }}>
      {/* Stats */}
      <View className="flex-row p-4 gap-3">
        <View className="flex-1 rounded-2xl p-4 items-center" style={{ backgroundColor: '#1a1a2e' }}>
          <Text style={{ color: '#a0c4ff' }} className="text-3xl font-bold">{tasks.length}</Text>
          <Text style={{ color: '#a0a0b0' }} className="text-xs mt-1">Total</Text>
        </View>
        <View className="flex-1 rounded-2xl p-4 items-center" style={{ backgroundColor: '#1a1a2e' }}>
          <Text style={{ color: '#7dd3a8' }} className="text-3xl font-bold">{completedCount}</Text>
          <Text style={{ color: '#a0a0b0' }} className="text-xs mt-1">Completed</Text>
        </View>
        <View className="flex-1 rounded-2xl p-4 items-center" style={{ backgroundColor: '#1a1a2e' }}>
          <Text style={{ color: '#ffd6a5' }} className="text-3xl font-bold">{pendingCount}</Text>
          <Text style={{ color: '#a0a0b0' }} className="text-xs mt-1">Pending</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-4 mb-3 gap-2">
        {filters.map(f => (
          <TouchableOpacity
            key={f}
            className="px-4 py-2 rounded-full"
            style={{ backgroundColor: filter === f ? '#a0c4ff' : '#1a1a2e' }}
            onPress={() => setFilter(f)}
          >
            <Text
              className="text-sm font-medium"
              style={{ color: filter === f ? '#0f0f1a' : '#a0a0b0' }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tasks List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#a0c4ff" />
          <Text style={{ color: '#6b6b80' }} className="text-base mt-3">Loading tasks...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={item => item.id}
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center pt-16">
              <CheckSquare size={48} color="#6b6b80" />
              <Text style={{ color: '#6b6b80' }} className="text-base mt-3">No tasks found</Text>
              <Text style={{ color: '#6b6b80' }} className="text-sm mt-1">Tap + to add your first task</Text>
            </View>
          }
        />
      )}

      {/* Add Button */}
      <TouchableOpacity
        className="absolute right-5 bottom-5 w-14 h-14 rounded-full justify-center items-center shadow-lg"
        style={{ backgroundColor: '#a0c4ff' }}
        onPress={() => setModalVisible(true)}
      >
        <Plus size={30} color="#0f0f1a" />
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <TouchableWithoutFeedback>
              <View className="rounded-t-3xl p-6" style={{ backgroundColor: '#1a1a2e' }}>
                <Text style={{ color: '#e8e8e8' }} className="text-xl font-bold mb-5 text-center">New Task</Text>

            <TextInput
              className="rounded-xl text-base mb-3"
              style={{
                backgroundColor: '#252540',
                color: '#e8e8e8',
                paddingVertical: 16,
                paddingHorizontal: 16,
                height: 56,
                textAlignVertical: 'center',
              }}
              placeholder="Task title"
              placeholderTextColor="#6b6b80"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              className="rounded-xl text-base mb-3"
              style={{
                backgroundColor: '#252540',
                color: '#e8e8e8',
                paddingVertical: 16,
                paddingHorizontal: 16,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
              placeholder="Description (optional)"
              placeholderTextColor="#6b6b80"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            {/* Priority Selection */}
            <Text style={{ color: '#a0a0b0' }} className="text-sm font-medium mb-2">Priority</Text>
            <View className="flex-row gap-3 mb-5">
              {PRIORITIES.map(p => (
                <TouchableOpacity
                  key={p.id}
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{ backgroundColor: priority === p.id ? p.color : '#252540' }}
                  onPress={() => setPriority(p.id)}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: priority === p.id ? '#0f0f1a' : '#a0a0b0' }}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 p-4 rounded-xl items-center"
                style={{ backgroundColor: '#252540' }}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: '#a0a0b0' }} className="text-base font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 p-4 rounded-xl items-center"
                style={{ backgroundColor: '#a0c4ff' }}
                onPress={addTask}
              >
                <Text style={{ color: '#0f0f1a' }} className="text-base font-semibold">Add Task</Text>
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

