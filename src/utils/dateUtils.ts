/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Get a date string relative to today
 * @param daysAgo - Number of days in the past
 * @returns ISO date string (YYYY-MM-DD)
 */
export const getDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

/**
 * Format a date string to a human-readable format
 * Shows "Today", "Yesterday", day of week, or full date
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Formatted date string
 */
export const formatRelativeDate = (dateStr: string): string => {
  // Parse the date string (YYYY-MM-DD format)
  const [year, month, day] = dateStr.split('-').map(Number);
  const inputDate = new Date(year, month - 1, day);

  // Get today's date at midnight for comparison
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Get the start of the current week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  // Get the start of last week
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  // Compare dates
  const inputTime = inputDate.getTime();
  const todayTime = today.getTime();
  const yesterdayTime = yesterday.getTime();

  if (inputTime === todayTime) {
    return 'Today';
  }

  if (inputTime === yesterdayTime) {
    return 'Yesterday';
  }

  // Check if within current week (but not today or yesterday)
  if (inputTime >= startOfWeek.getTime() && inputTime < todayTime) {
    return inputDate.toLocaleDateString('en-US', { weekday: 'long' });
  }

  // Check if within last week
  if (inputTime >= startOfLastWeek.getTime() && inputTime < startOfWeek.getTime()) {
    return 'Last ' + inputDate.toLocaleDateString('en-US', { weekday: 'long' });
  }

  // Check if same year
  if (inputDate.getFullYear() === now.getFullYear()) {
    return inputDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }

  // Different year - include the year
  return inputDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format a date string to a simple readable format
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "Monday, Jan 15")
 */
export const formatSimpleDate = (dateStr: string): string => {
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

/**
 * Format a Date object to a readable date and time string
 * @param date - Date object
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};
