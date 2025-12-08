import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EVENT_TYPES = [
  { id: 'activity', label: 'Activity', icon: 'fitness', color: '#9B59B6' },
  { id: 'exam', label: 'Exam', icon: 'document-text', color: '#E74C3C' },
  { id: 'class', label: 'Class', icon: 'school', color: '#3498DB' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal', color: '#95A5A6' },
];

const INITIAL_EVENTS = [
  { id: '1', title: 'Morning Yoga', type: 'activity', date: '2024-01-15', time: '07:00', description: 'Daily yoga session' },
  { id: '2', title: 'Math Final Exam', type: 'exam', date: '2024-01-15', time: '09:00', description: 'Chapter 1-10' },
  { id: '3', title: 'Physics Lecture', type: 'class', date: '2024-01-15', time: '11:00', description: 'Quantum mechanics intro' },
  { id: '4', title: 'Team Meeting', type: 'other', date: '2024-01-15', time: '14:00', description: 'Weekly sync' },
  { id: '5', title: 'Chemistry Lab', type: 'class', date: '2024-01-16', time: '10:00', description: 'Organic chemistry' },
  { id: '6', title: 'Basketball Practice', type: 'activity', date: '2024-01-16', time: '16:00', description: 'Team practice' },
  { id: '7', title: 'History Quiz', type: 'exam', date: '2024-01-17', time: '13:00', description: 'World War II' },
  { id: '8', title: 'Doctor Appointment', type: 'other', date: '2024-01-17', time: '15:30', description: 'Annual checkup' },
];

export default function ScheduleScreen() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedType, setSelectedType] = useState('other');
  const [filterType, setFilterType] = useState('all');

  const addEvent = () => {
    if (!title.trim() || !date.trim() || !time.trim()) return;
    
    const newEvent = {
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

  const deleteEvent = (id) => {
    setEvents(events.filter(event => event.id !== id));
  };

  const getTypeInfo = (typeId) => {
    return EVENT_TYPES.find(t => t.id === typeId) || EVENT_TYPES[3];
  };

  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter(e => e.type === filterType);

  // Group events by date
  const groupedEvents = filteredEvents.reduce((groups, event) => {
    if (!groups[event.date]) {
      groups[event.date] = [];
    }
    groups[event.date].push(event);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedEvents).sort();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const renderEvent = (item) => {
    const typeInfo = getTypeInfo(item.type);
    return (
      <View key={item.id} style={styles.eventItem}>
        <View style={styles.timeContainer}>
          <Text style={styles.eventTime}>{item.time}</Text>
        </View>
        <View style={[styles.eventCard, { borderLeftColor: typeInfo.color }]}>
          <View style={styles.eventHeader}>
            <View style={[styles.typeIcon, { backgroundColor: typeInfo.color + '20' }]}>
              <Ionicons name={typeInfo.icon} size={18} color={typeInfo.color} />
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventType}>{typeInfo.label}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteEvent(item.id)} style={styles.deleteButton}>
              <Ionicons name="close-circle" size={22} color="#CCC" />
            </TouchableOpacity>
          </View>
          {item.description ? (
            <Text style={styles.eventDescription}>{item.description}</Text>
          ) : null}
        </View>
      </View>
    );
  };

  const typeCounts = EVENT_TYPES.reduce((acc, type) => {
    acc[type.id] = events.filter(e => e.type === type.id).length;
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      {/* Type Stats */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
        <View style={styles.statsContainer}>
          {EVENT_TYPES.map(type => (
            <View key={type.id} style={[styles.statCard, { borderColor: type.color }]}>
              <Ionicons name={type.icon} size={24} color={type.color} />
              <Text style={styles.statNumber}>{typeCounts[type.id]}</Text>
              <Text style={styles.statLabel}>{type.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {EVENT_TYPES.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.filterButton,
                filterType === type.id && { backgroundColor: type.color }
              ]}
              onPress={() => setFilterType(type.id)}
            >
              <Text style={[
                styles.filterText,
                filterType === type.id && styles.filterTextActive
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Events List */}
      <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
        {sortedDates.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No events scheduled</Text>
          </View>
        ) : (
          sortedDates.map(date => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{formatDate(date)}</Text>
              {groupedEvents[date].map(event => renderEvent(event))}
            </View>
          ))
        )}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Add Event Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Event</Text>

            <TextInput
              style={styles.input}
              placeholder="Event title"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Date (YYYY-MM-DD)"
                value={date}
                onChangeText={setDate}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Time (HH:MM)"
                value={time}
                onChangeText={setTime}
              />
            </View>

            {/* Type Selection */}
            <Text style={styles.typeLabel}>Event Type</Text>
            <View style={styles.typeButtons}>
              {EVENT_TYPES.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    selectedType === type.id && { backgroundColor: type.color }
                  ]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <Ionicons
                    name={type.icon}
                    size={20}
                    color={selectedType === type.id ? '#fff' : type.color}
                  />
                  <Text style={[
                    styles.typeButtonText,
                    selectedType === type.id && { color: '#fff' }
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addEvent}>
                <Text style={styles.saveButtonText}>Add Event</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  statsScroll: {
    maxHeight: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  filterScroll: {
    maxHeight: 50,
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  eventsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  eventItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timeContainer: {
    width: 50,
    paddingTop: 12,
  },
  eventTime: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  eventCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfo: {
    flex: 1,
    marginLeft: 12,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  eventType: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
  },
  eventDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    marginLeft: 48,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F5F6FA',
    gap: 6,
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

