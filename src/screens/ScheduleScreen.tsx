import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import {
  Dumbbell,
  FileText,
  GraduationCap,
  MoreHorizontal,
  XCircle,
  Plus,
  Calendar,
  LucideIcon,
} from 'lucide-react-native';

interface EventType {
  id: 'activity' | 'exam' | 'class' | 'other';
  label: string;
  icon: LucideIcon;
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

// Pastel colors for dark mode
const EVENT_TYPES: EventType[] = [
  { id: 'activity', label: 'Activity', icon: Dumbbell, color: '#bdb2ff' },
  { id: 'exam', label: 'Exam', icon: FileText, color: '#f5a0a0' },
  { id: 'class', label: 'Class', icon: GraduationCap, color: '#a0c4ff' },
  { id: 'other', label: 'Other', icon: MoreHorizontal, color: '#9bf6e3' },
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
    const IconComponent = typeInfo.icon;
    return (
      <View key={item.id} className="flex-row mb-3">
        <View className="w-12 pt-3">
          <Text style={{ color: '#a0a0b0' }} className="text-sm font-semibold">{item.time}</Text>
        </View>
        <View
          className="flex-1 rounded-xl p-3.5"
          style={{ backgroundColor: '#1a1a2e', borderLeftWidth: 4, borderLeftColor: typeInfo.color }}
        >
          <View className="flex-row items-center">
            <View
              className="w-9 h-9 rounded-full justify-center items-center"
              style={{ backgroundColor: typeInfo.color + '25' }}
            >
              <IconComponent size={18} color={typeInfo.color} />
            </View>
            <View className="flex-1 ml-3">
              <Text style={{ color: '#e8e8e8' }} className="text-base font-medium">{item.title}</Text>
              <Text style={{ color: '#a0a0b0' }} className="text-xs mt-0.5">{typeInfo.label}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteEvent(item.id)} className="p-1">
              <XCircle size={22} color="#6b6b80" />
            </TouchableOpacity>
          </View>
          {item.description ? (
            <Text style={{ color: '#a0a0b0' }} className="text-sm mt-2 ml-12">{item.description}</Text>
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
    <View className="flex-1" style={{ backgroundColor: '#0f0f1a' }}>
      {/* Type Stats */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="max-h-24">
        <View className="flex-row p-4 gap-3">
          {EVENT_TYPES.map(type => {
            const TypeIcon = type.icon;
            return (
              <View
                key={type.id}
                className="rounded-2xl p-4 items-center min-w-[80px]"
                style={{ backgroundColor: '#1a1a2e', borderWidth: 2, borderColor: type.color }}
              >
                <TypeIcon size={24} color={type.color} />
                <Text style={{ color: '#e8e8e8' }} className="text-xl font-bold mt-1">{typeCounts[type.id]}</Text>
                <Text style={{ color: '#a0a0b0' }} className="text-xs mt-0.5">{type.label}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="max-h-12 mb-2">
        <View className="flex-row px-4 gap-2">
          <TouchableOpacity
            className="px-4 py-2 rounded-full"
            style={{ backgroundColor: filterType === 'all' ? '#a0c4ff' : '#1a1a2e' }}
            onPress={() => setFilterType('all')}
          >
            <Text
              className="text-sm font-medium"
              style={{ color: filterType === 'all' ? '#0f0f1a' : '#a0a0b0' }}
            >
              All
            </Text>
          </TouchableOpacity>
          {EVENT_TYPES.map(type => (
            <TouchableOpacity
              key={type.id}
              className="px-4 py-2 rounded-full"
              style={{ backgroundColor: filterType === type.id ? type.color : '#1a1a2e' }}
              onPress={() => setFilterType(type.id)}
            >
              <Text
                className="text-sm font-medium"
                style={{ color: filterType === type.id ? '#0f0f1a' : '#a0a0b0' }}
              >
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
            <Calendar size={48} color="#6b6b80" />
            <Text style={{ color: '#6b6b80' }} className="text-base mt-3">No events scheduled</Text>
          </View>
        ) : (
          sortedDates.map(dateKey => (
            <View key={dateKey} className="mb-5">
              <Text style={{ color: '#e8e8e8' }} className="text-base font-semibold mb-3">{formatDate(dateKey)}</Text>
              {groupedEvents[dateKey].map(event => renderEvent(event))}
            </View>
          ))
        )}
        <View className="h-20" />
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        className="absolute right-5 bottom-5 w-14 h-14 rounded-full justify-center items-center shadow-lg"
        style={{ backgroundColor: '#a0c4ff' }}
        onPress={() => setModalVisible(true)}
      >
        <Plus size={30} color="#0f0f1a" />
      </TouchableOpacity>

      {/* Add Event Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <View className="rounded-t-3xl p-6 max-h-[85%]" style={{ backgroundColor: '#1a1a2e' }}>
            <Text style={{ color: '#e8e8e8' }} className="text-xl font-bold mb-5 text-center">New Event</Text>

            <TextInput
              className="rounded-xl p-4 text-base mb-3"
              style={{ backgroundColor: '#252540', color: '#e8e8e8' }}
              placeholder="Event title"
              placeholderTextColor="#6b6b80"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              className="rounded-xl p-4 text-base mb-3"
              style={{ backgroundColor: '#252540', color: '#e8e8e8' }}
              placeholder="Description (optional)"
              placeholderTextColor="#6b6b80"
              value={description}
              onChangeText={setDescription}
            />

            <View className="flex-row gap-3">
              <TextInput
                className="flex-1 rounded-xl p-4 text-base mb-3"
                style={{ backgroundColor: '#252540', color: '#e8e8e8' }}
                placeholder="Date (YYYY-MM-DD)"
                placeholderTextColor="#6b6b80"
                value={date}
                onChangeText={setDate}
              />
              <TextInput
                className="flex-1 rounded-xl p-4 text-base mb-3"
                style={{ backgroundColor: '#252540', color: '#e8e8e8' }}
                placeholder="Time (HH:MM)"
                placeholderTextColor="#6b6b80"
                value={time}
                onChangeText={setTime}
              />
            </View>

            {/* Type Selection */}
            <Text style={{ color: '#a0a0b0' }} className="text-sm font-medium mb-2">Event Type</Text>
            <View className="flex-row flex-wrap gap-2.5 mb-5">
              {EVENT_TYPES.map(type => {
                const TypeIcon = type.icon;
                return (
                  <TouchableOpacity
                    key={type.id}
                    className="flex-row items-center px-3.5 py-2.5 rounded-xl"
                    style={{ backgroundColor: selectedType === type.id ? type.color : '#252540' }}
                    onPress={() => setSelectedType(type.id)}
                  >
                    <TypeIcon
                      size={20}
                      color={selectedType === type.id ? '#0f0f1a' : type.color}
                    />
                    <Text
                      className="text-sm font-medium ml-1.5"
                      style={{ color: selectedType === type.id ? '#0f0f1a' : '#a0a0b0' }}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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
                onPress={addEvent}
              >
                <Text style={{ color: '#0f0f1a' }} className="text-base font-semibold">Add Event</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

