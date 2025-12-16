import React, { useState, useEffect } from 'react';
import {
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
  Platform,
} from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  type LucideIcon,
  Dumbbell,
  FileText,
  GraduationCap,
  MoreHorizontal,
  Calendar,
  X,
  Clock,
  Repeat,
} from 'lucide-react-native';
import {
  getScheduleEvents,
  createScheduleEvent,
  deleteScheduleEvent,
  createRecurringEvents,
  generateRecurringDates,
} from '../services/scheduleService';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../constants/theme';
import FloatingActionButton from '../components/FloatingActionButton';
import SwipeableScheduleItem from '../components/SwipeableScheduleItem';

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

const getEventTypes = (colors: ReturnType<typeof getThemeColors>): EventType[] => [
  { id: 'activity', label: 'Activity', icon: Dumbbell, color: colors.pastel.purple },
  { id: 'exam', label: 'Exam', icon: FileText, color: colors.pastel.red },
  { id: 'class', label: 'Class', icon: GraduationCap, color: colors.pastel.blue },
  { id: 'other', label: 'Other', icon: MoreHorizontal, color: colors.pastel.teal },
];

type FilterType = 'all' | 'activity' | 'exam' | 'class' | 'other';

export default function ScheduleScreen(): React.JSX.Element {
  const { themeMode } = useTheme();
  const COLORS = getThemeColors(themeMode);
  const EVENT_TYPES = getEventTypes(COLORS);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedType, setSelectedType] = useState<'activity' | 'exam' | 'class' | 'other'>(
    'other'
  );
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringEndDate, setRecurringEndDate] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  });
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await getScheduleEvents();

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

  const formatDateForDB = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatTimeForDB = (date: Date): string => {
    return date.toTimeString().slice(0, 5);
  };

  const addEvent = async (): Promise<void> => {
    if (!title.trim()) {
      return;
    }

    if (saving) {
      return;
    }

    try {
      setSaving(true);

      if (isRecurring) {
        // Validate end date is after start date
        if (recurringEndDate <= selectedDate) {
          Alert.alert('Invalid Date', 'End date must be after start date.');
          setSaving(false);
          return;
        }

        // Calculate how many events will be created
        const previewDates = generateRecurringDates(
          selectedDate,
          recurringEndDate,
          selectedDate.getDay()
        );

        if (previewDates.length === 0) {
          Alert.alert('No Events', 'No events would be created with the selected date range.');
          setSaving(false);
          return;
        }

        // Create recurring events
        const result = await createRecurringEvents(
          {
            title: title.trim(),
            description: description.trim(),
            type: selectedType,
            time: formatTimeForDB(selectedDate),
          },
          selectedDate,
          recurringEndDate
        );

        if (result.created.length > 0) {
          const formattedEvents: ScheduleEvent[] = result.created.map(e => ({
            id: e.id,
            title: e.title,
            description: e.description || '',
            type: e.type,
            date: e.date,
            time: e.time,
          }));

          const updatedEvents = [...events, ...formattedEvents].sort((a, b) => {
            if (a.date !== b.date) {
              return a.date.localeCompare(b.date);
            }
            return a.time.localeCompare(b.time);
          });

          setEvents(updatedEvents);

          if (result.failed > 0) {
            Alert.alert(
              'Partial Success',
              `Created ${result.created.length} events. ${result.failed} failed.`
            );
          }

          resetForm();
          setModalVisible(false);
        } else {
          Alert.alert('Error', 'Failed to create recurring events. Please try again.');
        }
      } else {
        // Single event creation
        const newEvent = await createScheduleEvent({
          title: title.trim(),
          description: description.trim(),
          type: selectedType,
          date: formatDateForDB(selectedDate),
          time: formatTimeForDB(selectedDate),
        });

        if (newEvent) {
          const formattedEvent: ScheduleEvent = {
            id: newEvent.id,
            title: newEvent.title,
            description: newEvent.description || '',
            type: newEvent.type,
            date: newEvent.date,
            time: newEvent.time,
          };

          const updatedEvents = [...events, formattedEvent].sort((a, b) => {
            if (a.date !== b.date) {
              return a.date.localeCompare(b.date);
            }
            return a.time.localeCompare(b.time);
          });

          setEvents(updatedEvents);
          resetForm();
          setModalVisible(false);
        } else {
          Alert.alert('Error', 'Failed to add event. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error adding event:', error);
      Alert.alert('Error', 'Failed to add event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = (): void => {
    setTitle('');
    setDescription('');
    setSelectedDate(new Date());
    setSelectedType('other');
    setIsRecurring(false);
    const defaultEndDate = new Date();
    defaultEndDate.setMonth(defaultEndDate.getMonth() + 1);
    setRecurringEndDate(defaultEndDate);
  };

  const deleteEvent = async (id: string): Promise<void> => {
    try {
      const previousEvents = [...events];
      setEvents(events.filter(event => event.id !== id));

      const success = await deleteScheduleEvent(id);

      if (!success) {
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

  const groupedEvents = filteredEvents.reduce<Record<string, ScheduleEvent[]>>((groups, event) => {
    if (!groups[event.date]) {
      groups[event.date] = [];
    }
    groups[event.date].push(event);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedEvents).sort();

  const formatDisplayDate = (dateStr: string): string => {
    const dateObj = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateObj.getTime() === today.getTime()) {
      return 'Today';
    } else if (dateObj.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    }
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPickerDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPickerTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const onDateChange = (event: DateTimePickerEvent, date?: Date): void => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
      if (Platform.OS === 'android') {
        setShowTimePicker(true);
      }
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, time?: Date): void => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (time) {
      setSelectedDate(time);
    }
  };

  const onEndDateChange = (event: DateTimePickerEvent, date?: Date): void => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }
    if (date) {
      setRecurringEndDate(date);
    }
  };

  const getDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getRecurringEventCount = (): number => {
    if (!isRecurring || recurringEndDate <= selectedDate) {
      return 0;
    }
    return generateRecurringDates(selectedDate, recurringEndDate, selectedDate.getDay()).length;
  };

  const typeCounts = EVENT_TYPES.reduce<Record<string, number>>((acc, type) => {
    acc[type.id] = events.filter(e => e.type === type.id).length;
    return acc;
  }, {});

  const filters: FilterType[] = ['all', 'activity', 'exam', 'class', 'other'];

  const getFilterLabel = (filter: FilterType): string => {
    if (filter === 'all') {
      return 'All';
    }
    return EVENT_TYPES.find(t => t.id === filter)?.label || filter;
  };

  const renderSectionHeader = (dateKey: string): React.JSX.Element => (
    <Text style={{ color: COLORS.text.secondary }} className="text-base font-semibold mb-2 mt-2">
      {formatDisplayDate(dateKey)}
    </Text>
  );

  const renderEventItem = (event: ScheduleEvent): React.JSX.Element => {
    const typeInfo = getTypeInfo(event.type);
    return (
      <SwipeableScheduleItem
        item={event}
        typeInfo={typeInfo}
        onDelete={() => deleteEvent(event.id)}
        onPress={() => {}}
      />
    );
  };

  type FlatListItem =
    | { type: 'header'; dateKey: string; id: string }
    | { type: 'event'; event: ScheduleEvent; id: string };

  const flatListData: FlatListItem[] = sortedDates.flatMap(dateKey => [
    { type: 'header' as const, dateKey, id: `header-${dateKey}` },
    ...groupedEvents[dateKey].map(event => ({ type: 'event' as const, event, id: event.id })),
  ]);

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      {/* Stats */}
      <View className="flex-row p-4 gap-3">
        <View
          className="flex-1 rounded-2xl p-4 items-center"
          style={{ backgroundColor: COLORS.card }}
        >
          <Text style={{ color: COLORS.pastel.blue }} className="text-3xl font-bold">
            {events.length}
          </Text>
          <Text style={{ color: COLORS.text.secondary }} className="text-xs mt-1">
            Total
          </Text>
        </View>
        <View
          className="flex-1 rounded-2xl p-4 items-center"
          style={{ backgroundColor: COLORS.card }}
        >
          <Text style={{ color: COLORS.pastel.purple }} className="text-3xl font-bold">
            {typeCounts['activity'] || 0}
          </Text>
          <Text style={{ color: COLORS.text.secondary }} className="text-xs mt-1">
            Activities
          </Text>
        </View>
        <View
          className="flex-1 rounded-2xl p-4 items-center"
          style={{ backgroundColor: COLORS.card }}
        >
          <Text style={{ color: COLORS.pastel.red }} className="text-3xl font-bold">
            {typeCounts['exam'] || 0}
          </Text>
          <Text style={{ color: COLORS.text.secondary }} className="text-xs mt-1">
            Exams
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-4 mb-3 gap-2">
        {filters.map(f => (
          <TouchableOpacity
            key={f}
            className="flex-1 py-2 rounded-full"
            style={{ backgroundColor: filterType === f ? COLORS.pastel.blue : COLORS.card }}
            onPress={() => setFilterType(f)}
          >
            <Text
              className="text-sm font-medium text-center"
              style={{ color: filterType === f ? COLORS.background : COLORS.text.secondary }}
              numberOfLines={1}
            >
              {getFilterLabel(f)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Events List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.pastel.blue} />
          <Text style={{ color: COLORS.text.muted }} className="text-base mt-3">
            Loading events...
          </Text>
        </View>
      ) : (
        <FlatList
          data={flatListData}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return renderSectionHeader(item.dateKey);
            }
            return renderEventItem(item.event);
          }}
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
              <Calendar size={48} color={COLORS.text.muted} />
              <Text style={{ color: COLORS.text.muted }} className="text-base mt-3">
                No events scheduled
              </Text>
              <Text style={{ color: COLORS.text.muted }} className="text-sm mt-1">
                Tap + to add your first event
              </Text>
            </View>
          }
          ListFooterComponent={<View className="h-20" />}
        />
      )}

      <FloatingActionButton onPress={() => setModalVisible(true)} />

      {/* Add Event Modal */}
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
                    New Event
                  </Text>
                  <TouchableOpacity
                    className="p-2"
                    onPress={() => {
                      setModalVisible(false);
                      resetForm();
                    }}
                  >
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
                    placeholder="Event title"
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
                    }}
                    placeholderTextColor={COLORS.text.muted}
                    placeholder="Add notes or details"
                    value={description}
                    onChangeText={setDescription}
                  />

                  <Text
                    style={{ color: COLORS.text.secondary }}
                    className="text-base font-medium mb-2"
                  >
                    Date & Time
                  </Text>
                  <View className="flex-row gap-3 mb-3">
                    <TouchableOpacity
                      className="flex-1 rounded-xl p-4 flex-row items-center"
                      style={{ backgroundColor: COLORS.surface }}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Calendar size={20} color={COLORS.text.secondary} />
                      <Text className="text-base ml-3" style={{ color: COLORS.text.primary }}>
                        {formatPickerDate(selectedDate)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row gap-3 mb-3">
                    <TouchableOpacity
                      className="flex-1 rounded-xl p-4 flex-row items-center"
                      style={{ backgroundColor: COLORS.surface }}
                      onPress={() => setShowTimePicker(true)}
                    >
                      <Clock size={20} color={COLORS.text.secondary} />
                      <Text className="text-base ml-3" style={{ color: COLORS.text.primary }}>
                        {formatPickerTime(selectedDate)}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {showDatePicker && (
                    <DateTimePicker
                      value={selectedDate}
                      mode={Platform.OS === 'ios' ? 'datetime' : 'date'}
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onDateChange}
                      themeVariant={themeMode}
                    />
                  )}
                  {showTimePicker && Platform.OS === 'android' && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="time"
                      display="default"
                      onChange={onTimeChange}
                      themeVariant={themeMode}
                    />
                  )}

                  {/* Recurring Event Toggle */}
                  <Text
                    style={{ color: COLORS.text.secondary }}
                    className="text-base font-medium mb-2"
                  >
                    Recurring Event
                  </Text>
                  <TouchableOpacity
                    className="rounded-xl p-4 flex-row items-center justify-between mb-3"
                    style={{ backgroundColor: COLORS.surface }}
                    onPress={() => setIsRecurring(!isRecurring)}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center">
                      <Repeat
                        size={20}
                        color={isRecurring ? COLORS.pastel.purple : COLORS.text.secondary}
                      />
                      <Text className="text-base ml-3" style={{ color: COLORS.text.primary }}>
                        Repeat every {getDayName(selectedDate)}
                      </Text>
                    </View>
                    <View
                      className="w-12 h-7 rounded-full justify-center"
                      style={{
                        backgroundColor: isRecurring ? COLORS.pastel.purple : COLORS.surface,
                        borderWidth: isRecurring ? 0 : 1,
                        borderColor: COLORS.text.muted,
                      }}
                    >
                      <View
                        className="w-5 h-5 rounded-full"
                        style={{
                          backgroundColor: isRecurring ? COLORS.background : COLORS.text.muted,
                          marginLeft: isRecurring ? 24 : 3,
                        }}
                      />
                    </View>
                  </TouchableOpacity>

                  {isRecurring && (
                    <>
                      <Text
                        style={{ color: COLORS.text.secondary }}
                        className="text-base font-medium mb-2"
                      >
                        Repeat Until
                      </Text>
                      <TouchableOpacity
                        className="rounded-xl p-4 flex-row items-center mb-3"
                        style={{ backgroundColor: COLORS.surface }}
                        onPress={() => setShowEndDatePicker(true)}
                      >
                        <Calendar size={20} color={COLORS.pastel.purple} />
                        <Text className="text-base ml-3" style={{ color: COLORS.text.primary }}>
                          {formatPickerDate(recurringEndDate)}
                        </Text>
                      </TouchableOpacity>

                      {showEndDatePicker && (
                        <DateTimePicker
                          value={recurringEndDate}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={onEndDateChange}
                          minimumDate={selectedDate}
                          themeVariant={themeMode}
                        />
                      )}

                      {getRecurringEventCount() > 0 && (
                        <View
                          className="rounded-xl p-3 mb-3 flex-row items-center"
                          style={{ backgroundColor: COLORS.pastel.purple + '20' }}
                        >
                          <Repeat size={16} color={COLORS.pastel.purple} />
                          <Text className="text-sm ml-2" style={{ color: COLORS.pastel.purple }}>
                            This will create {getRecurringEventCount()} events
                          </Text>
                        </View>
                      )}
                    </>
                  )}

                  <Text
                    style={{ color: COLORS.text.secondary }}
                    className="text-base font-medium mb-2"
                  >
                    Event Type
                  </Text>
                  <View className="flex-row flex-wrap gap-2 mb-4">
                    {EVENT_TYPES.map(type => {
                      const TypeIcon = type.icon;
                      return (
                        <TouchableOpacity
                          key={type.id}
                          className="flex-row items-center px-4 py-2.5 rounded-full"
                          style={{
                            backgroundColor: selectedType === type.id ? type.color : COLORS.surface,
                          }}
                          onPress={() => setSelectedType(type.id)}
                        >
                          <TypeIcon
                            size={18}
                            color={selectedType === type.id ? COLORS.background : type.color}
                          />
                          <Text
                            className="text-sm font-medium ml-2"
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
                </ScrollView>

                <View className="flex-row gap-3 pb-8">
                  <TouchableOpacity
                    className="flex-1 p-4 rounded-xl items-center"
                    style={{ backgroundColor: COLORS.surface, opacity: saving ? 0.5 : 1 }}
                    onPress={() => {
                      if (!saving) {
                        setModalVisible(false);
                        resetForm();
                      }
                    }}
                    disabled={saving}
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
                    style={{ backgroundColor: COLORS.pastel.blue, opacity: saving ? 0.7 : 1 }}
                    onPress={addEvent}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color={COLORS.background} />
                    ) : (
                      <Text
                        style={{ color: COLORS.background }}
                        className="text-base font-semibold"
                      >
                        {isRecurring ? `Add ${getRecurringEventCount() || ''} Events` : 'Add'}
                      </Text>
                    )}
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
