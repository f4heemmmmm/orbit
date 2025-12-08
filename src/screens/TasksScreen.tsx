import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  { id: 'low', label: 'Low', color: '#27AE60' },
  { id: 'medium', label: 'Medium', color: '#F39C12' },
  { id: 'high', label: 'High', color: '#E74C3C' },
];

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Complete project proposal', description: 'Write and submit the Q1 project proposal', priority: 'high', completed: false },
  { id: '2', title: 'Review code changes', description: 'Review PRs from the team', priority: 'medium', completed: true },
  { id: '3', title: 'Update documentation', description: 'Update API docs with new endpoints', priority: 'low', completed: false },
  { id: '4', title: 'Team standup', description: 'Daily standup meeting at 9 AM', priority: 'medium', completed: true },
  { id: '5', title: 'Fix login bug', description: 'Users cannot login with special characters', priority: 'high', completed: false },
  { id: '6', title: 'Organize files', description: 'Clean up project folder structure', priority: 'low', completed: false },
];

type FilterType = 'all' | 'pending' | 'completed';

export default function TasksScreen(): React.JSX.Element {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<FilterType>('all');

  const toggleTask = (id: string): void => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = (): void => {
    if (!title.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      priority,
      completed: false,
    };
    
    setTasks([newTask, ...tasks]);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setModalVisible(false);
  };

  const deleteTask = (id: string): void => {
    setTasks(tasks.filter(task => task.id !== id));
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
      <View className="flex-row items-center bg-white rounded-xl p-4 mb-2 shadow-sm">
        <TouchableOpacity onPress={() => toggleTask(item.id)} className="mr-3">
          <Ionicons
            name={item.completed ? 'checkbox' : 'square-outline'}
            size={26}
            color={item.completed ? '#27AE60' : '#CCC'}
          />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className={`text-base font-medium ${item.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {item.title}
          </Text>
          {item.description ? (
            <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
              {item.description}
            </Text>
          ) : null}
          <View 
            className="flex-row items-center self-start px-2.5 py-1 rounded-xl mt-2"
            style={{ backgroundColor: priorityInfo.color + '20' }}
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
          <Ionicons name="trash-outline" size={20} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    );
  };

  const filters: FilterType[] = ['all', 'pending', 'completed'];

  return (
    <View className="flex-1 bg-gray-100">
      {/* Stats */}
      <View className="flex-row p-4 gap-3">
        <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-md">
          <Text className="text-3xl font-bold text-gray-800">{tasks.length}</Text>
          <Text className="text-xs text-gray-500 mt-1">Total</Text>
        </View>
        <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-md">
          <Text className="text-3xl font-bold text-green-600">{completedCount}</Text>
          <Text className="text-xs text-gray-500 mt-1">Completed</Text>
        </View>
        <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-md">
          <Text className="text-3xl font-bold text-yellow-500">{pendingCount}</Text>
          <Text className="text-xs text-gray-500 mt-1">Pending</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-4 mb-3 gap-2">
        {filters.map(f => (
          <TouchableOpacity
            key={f}
            className={`px-4 py-2 rounded-full ${filter === f ? 'bg-blue-500' : 'bg-white'}`}
            onPress={() => setFilter(f)}
          >
            <Text className={`text-sm ${filter === f ? 'text-white font-semibold' : 'text-gray-600'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={item => item.id}
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center pt-16">
            <Ionicons name="checkbox-outline" size={48} color="#CCC" />
            <Text className="text-base text-gray-400 mt-3">No tasks found</Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity
        className="absolute right-5 bottom-5 w-14 h-14 rounded-full bg-blue-500 justify-center items-center shadow-lg"
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold mb-5 text-center">New Task</Text>

            <TextInput
              className="bg-gray-100 rounded-xl p-4 text-base mb-3"
              placeholder="Task title"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              className="bg-gray-100 rounded-xl p-4 text-base mb-3 min-h-[80px]"
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={{ textAlignVertical: 'top' }}
            />

            {/* Priority Selection */}
            <Text className="text-sm font-medium text-gray-600 mb-2">Priority</Text>
            <View className="flex-row gap-3 mb-5">
              {PRIORITIES.map(p => (
                <TouchableOpacity
                  key={p.id}
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{ backgroundColor: priority === p.id ? p.color : '#F5F6FA' }}
                  onPress={() => setPriority(p.id)}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: priority === p.id ? '#fff' : '#666' }}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 p-4 rounded-xl bg-gray-100 items-center"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-base font-semibold text-gray-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 p-4 rounded-xl bg-blue-500 items-center"
                onPress={addTask}
              >
                <Text className="text-base font-semibold text-white">Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

