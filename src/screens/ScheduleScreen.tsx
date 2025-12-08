import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface EventType {
  id: 'activity' | 'exam' | 'class' | 'other';
  label: string;
  icon: IoniconsName;
  color: string;
}

interface ScheduleEvent {
  id: string;
  title: string;
  type: 'activity' | 'exam' | 'class' | 'other';
  date: string;
  time: string;
  description: string;
}

const EVENT_TYPES: EventType[] = [
  { id: 'activity', label: 'Activity', icon: 'fitness', color: '#9B59B6' },
  { id: 'exam', label: 'Exam', icon: 'document-text', color: '#E74C3C' },
  { id: 'class', label: 'Class', icon: 'school', color: '#3498DB' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal', color: '#95A5A6' },
];

const INITIAL_EVENTS: ScheduleEvent[] = [
  { id: '1', title: 'Morning Yoga', type: 'activity', date: '2024-01-15', time: '07:00', description: 'Daily yoga session' },
  { id: '2', title: 'Math Final Exam', type: 'exam', date: '2024-01-15', time: '09:00', description: 'Chapter 1-10' },
  { id: '3', title: 'Physics Lecture', type: 'class', date: '2024-01-15', time: '11:00', description: 'Quantum mechanics intro' },
  { id: '4', title: 'Team Meeting', type: 'other', date: '2024-01-15', time: '14:00', description: 'Weekly sync' },
  { id: '5', title: 'Chemistry Lab', type: 'class', date: '2024-01-16', time: '10:00', description: 'Organic chemistry' },
  { id: '6', title: 'Basketball Practice', type: 'activity', date: '2024-01-16', time: '16:00', description: 'Team practice' },
  { id: '7', title: 'History Quiz', type: 'exam', date: '2024-01-17', time: '13:00', description: 'World War II' },
  { id: '8', title: 'Doctor Appointment', type: 'other', date: '2024-01-17', time: '15:30', description: 'Annual checkup' },
];

type FilterType = 'all' | 'activity' | 'exam' | 'class' | 'other';

export default function ScheduleScreen(): React.JSX.Element {
  const [events, setEvents] = useState<ScheduleEvent[]>(INITIAL_EVENTS);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedType, setSelectedType] = useState<'activity' | 'exam' | 'class' | 'other'>('other');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const addEvent = (): void => {
    if (!title.trim() || !date.trim() || !time.trim()) return;
    
    const newEvent: ScheduleEvent = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      type: selectedType,
      date: date.trim(),
      time: time.trim(),
    };
    
    setEvents([...events, newEvent].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    }));
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setSelectedType('other');
    setModalVisible(false);
  };

  const deleteEvent = (id: string): void => {
    setEvents(events.filter(event => event.id !== id));
  };

  const getTypeInfo = (typeId: string): EventType => {
    return EVENT_TYPES.find(t => t.id === typeId) || EVENT_TYPES[3];
  };

  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter(e => e.type === filterType);

  // Group events by date
  const groupedEvents = filteredEvents.reduce<Record<string, ScheduleEvent[]>>((groups, event) => {
    if (!groups[event.date]) {
      groups[event.date] = [];
    }
    groups[event.date].push(event);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedEvents).sort();

  const formatDate = (dateStr: string): string => {
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const renderEvent = (item: ScheduleEvent): React.JSX.Element => {
    const typeInfo = getTypeInfo(item.type);
    return (
      <View key={item.id} className="flex-row mb-3">
        <View className="w-12 pt-3">
          <Text className="text-sm font-semibold text-gray-600">{item.time}</Text>
        </View>
        <View 
          className="flex-1 bg-white rounded-xl p-3.5 shadow-sm"
          style={{ borderLeftWidth: 4, borderLeftColor: typeInfo.color }}
        >
          <View className="flex-row items-center">
            <View 
              className="w-9 h-9 rounded-full justify-center items-center"
              style={{ backgroundColor: typeInfo.color + '20' }}
            >
              <Ionicons name={typeInfo.icon} size={18} color={typeInfo.color} />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-base font-medium text-gray-800">{item.title}</Text>
              <Text className="text-xs text-gray-500 mt-0.5">{typeInfo.label}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteEvent(item.id)} className="p-1">
              <Ionicons name="close-circle" size={22} color="#CCC" />
            </TouchableOpacity>
          </View>
          {item.description ? (
            <Text className="text-sm text-gray-600 mt-2 ml-12">{item.description}</Text>
          ) : null}
        </View>
      </View>
    );
  };

  const typeCounts = EVENT_TYPES.reduce<Record<string, number>>((acc, type) => {
    acc[type.id] = events.filter(e => e.type === type.id).length;
    return acc;
  }, {});

  return (
    <View className="flex-1 bg-gray-100">
      {/* Type Stats */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="max-h-24">
        <View className="flex-row p-4 gap-3">
          {EVENT_TYPES.map(type => (
            <View
              key={type.id}
              className="bg-white rounded-2xl p-4 items-center min-w-[80px] shadow-md"
              style={{ borderWidth: 2, borderColor: type.color }}
            >
              <Ionicons name={type.icon} size={24} color={type.color} />
              <Text className="text-xl font-bold text-gray-800 mt-1">{typeCounts[type.id]}</Text>
              <Text className="text-xs text-gray-500 mt-0.5">{type.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="max-h-12 mb-2">
        <View className="flex-row px-4 gap-2">
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${filterType === 'all' ? 'bg-blue-500' : 'bg-white'}`}
            onPress={() => setFilterType('all')}
          >
            <Text className={`text-sm ${filterType === 'all' ? 'text-white font-semibold' : 'text-gray-600'}`}>
              All
            </Text>
          </TouchableOpacity>
          {EVENT_TYPES.map(type => (
            <TouchableOpacity
              key={type.id}
              className="px-4 py-2 rounded-full"
              style={{ backgroundColor: filterType === type.id ? type.color : '#fff' }}
              onPress={() => setFilterType(type.id)}
            >
              <Text className={`text-sm ${filterType === type.id ? 'text-white font-semibold' : 'text-gray-600'}`}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Events List */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {sortedDates.length === 0 ? (
          <View className="items-center justify-center pt-16">
            <Ionicons name="calendar-outline" size={48} color="#CCC" />
            <Text className="text-base text-gray-400 mt-3">No events scheduled</Text>
          </View>
        ) : (
          sortedDates.map(dateKey => (
            <View key={dateKey} className="mb-5">
              <Text className="text-base font-semibold text-gray-800 mb-3">{formatDate(dateKey)}</Text>
              {groupedEvents[dateKey].map(event => renderEvent(event))}
            </View>
          ))
        )}
        <View className="h-20" />
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        className="absolute right-5 bottom-5 w-14 h-14 rounded-full bg-blue-500 justify-center items-center shadow-lg"
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Add Event Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[85%]">
            <Text className="text-xl font-bold mb-5 text-center">New Event</Text>

            <TextInput
              className="bg-gray-100 rounded-xl p-4 text-base mb-3"
              placeholder="Event title"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              className="bg-gray-100 rounded-xl p-4 text-base mb-3"
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
            />

            <View className="flex-row gap-3">
              <TextInput
                className="flex-1 bg-gray-100 rounded-xl p-4 text-base mb-3"
                placeholder="Date (YYYY-MM-DD)"
                value={date}
                onChangeText={setDate}
              />
              <TextInput
                className="flex-1 bg-gray-100 rounded-xl p-4 text-base mb-3"
                placeholder="Time (HH:MM)"
                value={time}
                onChangeText={setTime}
              />
            </View>

            {/* Type Selection */}
            <Text className="text-sm font-medium text-gray-600 mb-2">Event Type</Text>
            <View className="flex-row flex-wrap gap-2.5 mb-5">
              {EVENT_TYPES.map(type => (
                <TouchableOpacity
                  key={type.id}
                  className="flex-row items-center px-3.5 py-2.5 rounded-xl"
                  style={{ backgroundColor: selectedType === type.id ? type.color : '#F5F6FA' }}
                  onPress={() => setSelectedType(type.id)}
                >
                  <Ionicons
                    name={type.icon}
                    size={20}
                    color={selectedType === type.id ? '#fff' : type.color}
                  />
                  <Text
                    className="text-sm font-medium ml-1.5"
                    style={{ color: selectedType === type.id ? '#fff' : '#666' }}
                  >
                    {type.label}
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
                onPress={addEvent}
              >
                <Text className="text-base font-semibold text-white">Add Event</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

