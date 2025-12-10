import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  RefreshControl,
} from 'react-native';
import {
  type LucideIcon,
  Dumbbell,
  FileText,
  GraduationCap,
  MoreHorizontal,
  XCircle,
  Plus,
  Calendar,
} from 'lucide-react-native';
import {
  getScheduleEvents,
  createScheduleEvent,
  deleteScheduleEvent,
} from '../services/scheduleService';
import { COLORS } from '../constants/theme';

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
  { id: 'activity', label: 'Activity', icon: Dumbbell, color: COLORS.pastel.purple },
  { id: 'exam', label: 'Exam', icon: FileText, color: COLORS.pastel.red },
  { id: 'class', label: 'Class', icon: GraduationCap, color: COLORS.pastel.blue },
  { id: 'other', label: 'Other', icon: MoreHorizontal, color: COLORS.pastel.teal },
];

type FilterType = 'all' | 'activity' | 'exam' | 'class' | 'other';

export default function ScheduleScreen(): React.JSX.Element {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedType, setSelectedType] = useState<'activity' | 'exam' | 'class' | 'other'>(
    'other'
  );
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch events on mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await getScheduleEvents();

      // Convert database format to app format
      const formattedEvents: ScheduleEvent[] = data.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description || '',
        type: e.type,
        date: e.date,
        time: e.time,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Error', 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    try {
      setRefreshing(true);
      const data = await getScheduleEvents();

      // Convert database format to app format
      const formattedEvents: ScheduleEvent[] = data.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description || '',
        type: e.type,
        date: e.date,
        time: e.time,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error refreshing events:', error);
      Alert.alert('Error', 'Failed to refresh events. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const addEvent = async (): Promise<void> => {
    if (!title.trim() || !date.trim() || !time.trim()) {
      return;
    }

    try {
      const newEvent = await createScheduleEvent({
        title: title.trim(),
        description: description.trim(),
        type: selectedType,
        date: date.trim(),
        time: time.trim(),
      });

      if (newEvent) {
        // Add to local state
        const formattedEvent: ScheduleEvent = {
          id: newEvent.id,
          title: newEvent.title,
          description: newEvent.description || '',
          type: newEvent.type,
          date: newEvent.date,
          time: newEvent.time,
        };

        // Add and sort events
        const updatedEvents = [...events, formattedEvent].sort((a, b) => {
          if (a.date !== b.date) {
            return a.date.localeCompare(b.date);
          }
          return a.time.localeCompare(b.time);
        });

        setEvents(updatedEvents);
        setTitle('');
        setDescription('');
        setDate('');
        setTime('');
        setSelectedType('other');
        setModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to add event. Please try again.');
      }
    } catch (error) {
      console.error('Error adding event:', error);
      Alert.alert('Error', 'Failed to add event. Please try again.');
    }
  };

  const deleteEvent = async (id: string): Promise<void> => {
    try {
      // Optimistically update UI
      const previousEvents = [...events];
      setEvents(events.filter(event => event.id !== id));

      // Delete from database
      const success = await deleteScheduleEvent(id);

      if (!success) {
        // Revert on failure
        setEvents(previousEvents);
        Alert.alert('Error', 'Failed to delete event. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      Alert.alert('Error', 'Failed to delete event. Please try again.');
    }
  };

  const getTypeInfo = (typeId: string): EventType => {
    return EVENT_TYPES.find(t => t.id === typeId) || EVENT_TYPES[3];
  };

  const filteredEvents = filterType === 'all' ? events : events.filter(e => e.type === filterType);

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
          <Text style={{ color: COLORS.text.secondary }} className="text-sm font-semibold">
            {item.time}
          </Text>
        </View>
        <View
          className="flex-1 rounded-xl p-3.5"
          style={{
            backgroundColor: COLORS.card,
            borderLeftWidth: 4,
            borderLeftColor: typeInfo.color,
          }}
        >
          <View className="flex-row items-center">
            <View
              className="w-9 h-9 rounded-full justify-center items-center"
              style={{ backgroundColor: typeInfo.color + '25' }}
            >
              <IconComponent size={18} color={typeInfo.color} />
            </View>
            <View className="flex-1 ml-3">
              <Text style={{ color: COLORS.text.primary }} className="text-base font-medium">
                {item.title}
              </Text>
              <Text style={{ color: COLORS.text.secondary }} className="text-xs mt-0.5">
                {typeInfo.label}
              </Text>
            </View>
            <TouchableOpacity onPress={() => deleteEvent(item.id)} className="p-1">
              <XCircle size={22} color={COLORS.text.muted} />
            </TouchableOpacity>
          </View>
          {item.description ? (
            <Text style={{ color: COLORS.text.secondary }} className="text-sm mt-2 ml-12">
              {item.description}
            </Text>
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
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      {/* Type Stats */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="max-h-24">
        <View className="flex-row p-4 gap-3">
          {EVENT_TYPES.map(type => {
            const TypeIcon = type.icon;
            return (
              <View
                key={type.id}
                className="rounded-2xl p-4 items-center min-w-[80px]"
                style={{ backgroundColor: COLORS.card, borderWidth: 2, borderColor: type.color }}
              >
                <TypeIcon size={24} color={type.color} />
                <Text style={{ color: COLORS.text.primary }} className="text-xl font-bold mt-1">
                  {typeCounts[type.id]}
                </Text>
                <Text style={{ color: COLORS.text.secondary }} className="text-xs mt-0.5">
                  {type.label}
                </Text>
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
            style={{ backgroundColor: filterType === 'all' ? COLORS.pastel.blue : COLORS.card }}
            onPress={() => setFilterType('all')}
          >
            <Text
              className="text-sm font-medium"
              style={{ color: filterType === 'all' ? COLORS.background : COLORS.text.secondary }}
            >
              All
            </Text>
          </TouchableOpacity>
          {EVENT_TYPES.map(type => (
            <TouchableOpacity
              key={type.id}
              className="px-4 py-2 rounded-full"
              style={{ backgroundColor: filterType === type.id ? type.color : COLORS.card }}
              onPress={() => setFilterType(type.id)}
            >
              <Text
                className="text-sm font-medium"
                style={{
                  color: filterType === type.id ? COLORS.background : COLORS.text.secondary,
                }}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Events List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.pastel.blue} />
          <Text style={{ color: COLORS.text.muted }} className="text-base mt-3">
            Loading events...
          </Text>
        </View>
      ) : (
        <ScrollView
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
        >
          {sortedDates.length === 0 ? (
            <View className="items-center justify-center pt-16">
              <Calendar size={48} color={COLORS.text.muted} />
              <Text style={{ color: COLORS.text.muted }} className="text-base mt-3">
                No events scheduled
              </Text>
              <Text style={{ color: COLORS.text.muted }} className="text-sm mt-1">
                Tap + to add your first event
              </Text>
            </View>
          ) : (
            sortedDates.map(dateKey => (
              <View key={dateKey} className="mb-5">
                <Text
                  style={{ color: COLORS.text.primary }}
                  className="text-base font-semibold mb-3"
                >
                  {formatDate(dateKey)}
                </Text>
                {groupedEvents[dateKey].map(event => renderEvent(event))}
              </View>
            ))
          )}
          <View className="h-20" />
        </ScrollView>
      )}

      {/* Add Button */}
      <TouchableOpacity
        className="absolute right-5 bottom-5 w-14 h-14 rounded-full justify-center items-center shadow-lg"
        style={{ backgroundColor: COLORS.pastel.blue }}
        onPress={() => setModalVisible(true)}
      >
        <Plus size={30} color={COLORS.background} />
      </TouchableOpacity>

      {/* Add Event Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <TouchableWithoutFeedback>
              <View
                className="rounded-t-3xl p-6 max-h-[85%]"
                style={{ backgroundColor: COLORS.card }}
              >
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="on-drag"
                  showsVerticalScrollIndicator={false}
                >
                  <Text
                    style={{ color: COLORS.text.primary }}
                    className="text-xl font-bold mb-5 text-center"
                  >
                    New Event
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
                    placeholder="Event title"
                    placeholderTextColor={COLORS.text.muted}
                    value={title}
                    onChangeText={setTitle}
                  />

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
                    placeholder="Description (optional)"
                    placeholderTextColor={COLORS.text.muted}
                    value={description}
                    onChangeText={setDescription}
                  />

                  <View className="flex-row gap-3">
                    <TextInput
                      className="flex-1 rounded-xl mb-3"
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
                      placeholder="Date (YYYY-MM-DD)"
                      placeholderTextColor={COLORS.text.muted}
                      value={date}
                      onChangeText={setDate}
                    />
                    <TextInput
                      className="flex-1 rounded-xl mb-3"
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
                      placeholder="Time (HH:MM)"
                      placeholderTextColor={COLORS.text.muted}
                      value={time}
                      onChangeText={setTime}
                    />
                  </View>

                  {/* Type Selection */}
                  <Text
                    style={{ color: COLORS.text.secondary }}
                    className="text-sm font-medium mb-2"
                  >
                    Event Type
                  </Text>
                  <View className="flex-row flex-wrap gap-2.5 mb-5">
                    {EVENT_TYPES.map(type => {
                      const TypeIcon = type.icon;
                      return (
                        <TouchableOpacity
                          key={type.id}
                          className="flex-row items-center px-3.5 py-2.5 rounded-xl"
                          style={{
                            backgroundColor: selectedType === type.id ? type.color : COLORS.surface,
                          }}
                          onPress={() => setSelectedType(type.id)}
                        >
                          <TypeIcon
                            size={20}
                            color={selectedType === type.id ? COLORS.background : type.color}
                          />
                          <Text
                            className="text-sm font-medium ml-1.5"
                            style={{
                              color:
                                selectedType === type.id
                                  ? COLORS.background
                                  : COLORS.text.secondary,
                            }}
                          >
                            {type.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View className="flex-row gap-3 mt-4">
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
                      onPress={addEvent}
                    >
                      <Text
                        style={{ color: COLORS.background }}
                        className="text-base font-semibold"
                      >
                        Add Event
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
