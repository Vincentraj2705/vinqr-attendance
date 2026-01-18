// Local Storage wrapper for offline data persistence
const STORAGE_KEYS = {
  PARTICIPANTS: 'attendance_participants',
  ATTENDANCE: 'attendance_records',
  EVENT_NAME: 'current_event_name',
  EVENT_DATE: 'current_event_date',
  EVENT_ORGANISER: 'current_event_organiser',
  EVENT_LOCATION: 'current_event_location',
  EVENT_HISTORY: 'event_history'
};

// Get all participants
export const getParticipants = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading participants:', error);
    return [];
  }
};

// Save participants
export const saveParticipants = (participants) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
    return true;
  } catch (error) {
    console.error('Error saving participants:', error);
    return false;
  }
};

// Add a new participant
export const addParticipant = (participant) => {
  const participants = getParticipants();
  
  // Generate unique ID with timestamp + random suffix to avoid duplicates
  let uniqueId;
  do {
    uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  } while (participants.some(p => p.id === uniqueId));
  
  const newParticipant = {
    ...participant,
    id: uniqueId,
    createdAt: new Date().toISOString()
  };
  participants.push(newParticipant);
  saveParticipants(participants);
  return newParticipant;
};

// Update participant
export const updateParticipant = (id, updates) => {
  const participants = getParticipants();
  const index = participants.findIndex(p => p.id === id);
  if (index !== -1) {
    participants[index] = { ...participants[index], ...updates };
    saveParticipants(participants);
    return true;
  }
  return false;
};

// Delete participant
export const deleteParticipant = (id) => {
  const participants = getParticipants();
  const filtered = participants.filter(p => p.id !== id);
  saveParticipants(filtered);
  return true;
};

// Get attendance records
export const getAttendance = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading attendance:', error);
    return [];
  }
};

// Mark attendance
export const markAttendance = (participantId) => {
  const attendance = getAttendance();
  const existing = attendance.find(a => a.participantId === participantId);
  
  if (existing) {
    return { success: false, message: 'Already Marked! This person\'s attendance was already recorded.' };
  }
  
  const record = {
    participantId,
    timestamp: new Date().toISOString(),
    id: Date.now().toString()
  };
  
  attendance.push(record);
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  return { success: true, record };
};

// Clear attendance (for new event)
export const clearAttendance = () => {
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
  window.dispatchEvent(new Event('dataChanged'));
  return true;
};

// Get event name
export const getEventName = () => {
  return localStorage.getItem(STORAGE_KEYS.EVENT_NAME) || 'Current Event';
};

// Set event name
export const setEventName = (name) => {
  localStorage.setItem(STORAGE_KEYS.EVENT_NAME, name);
  return true;
};

// Get event date
export const getEventDate = () => {
  return localStorage.getItem(STORAGE_KEYS.EVENT_DATE) || '';
};

// Set event date
export const setEventDate = (date) => {
  localStorage.setItem(STORAGE_KEYS.EVENT_DATE, date);
  return true;
};

// Get event organiser
export const getEventOrganiser = () => {
  return localStorage.getItem(STORAGE_KEYS.EVENT_ORGANISER) || '';
};

// Set event organiser
export const setEventOrganiser = (organiser) => {
  localStorage.setItem(STORAGE_KEYS.EVENT_ORGANISER, organiser);
  return true;
};

// Get event location
export const getEventLocation = () => {
  return localStorage.getItem(STORAGE_KEYS.EVENT_LOCATION) || '';
};

// Set event location
export const setEventLocation = (location) => {
  localStorage.setItem(STORAGE_KEYS.EVENT_LOCATION, location);
  return true;
};

// Export data as JSON
export const exportData = () => {
  const participants = getParticipants();
  const attendance = getAttendance();
  const eventName = getEventName();
  const eventDate = getEventDate();
  const eventOrganiser = getEventOrganiser();
  const eventLocation = getEventLocation();
  
  return {
    eventName,
    eventDate,
    eventOrganiser,
    eventLocation,
    participants,
    attendance,
    exportedAt: new Date().toISOString()
  };
};

// Import data from JSON
export const importData = (data) => {
  try {
    if (data.participants) saveParticipants(data.participants);
    if (data.eventName) setEventName(data.eventName);
    window.dispatchEvent(new Event('dataChanged'));
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// Clear all data
export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.PARTICIPANTS);
  localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
  localStorage.removeItem(STORAGE_KEYS.EVENT_NAME);
  localStorage.removeItem(STORAGE_KEYS.EVENT_DATE);
  localStorage.removeItem(STORAGE_KEYS.EVENT_LOCATION);
  window.dispatchEvent(new Event('dataChanged'));
  return true;
};

// Get event history (max 5 events)
export const getEventHistory = () => {
  try {
    const history = localStorage.getItem(STORAGE_KEYS.EVENT_HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting event history:', error);
    return [];
  }
};

// Save current event to history (FIFO - max 5)
export const saveCurrentEventToHistory = () => {
  try {
    const eventName = getEventName();
    const eventDate = getEventDate();
    const eventLocation = getEventLocation();
    const participants = getParticipants();
    const attendance = getAttendance();

    // Don't save if no participants
    if (participants.length === 0) return false;

    const eventSnapshot = {
      id: Date.now().toString(),
      name: eventName,
      date: eventDate,
      location: eventLocation,
      participants,
      attendance,
      savedAt: new Date().toISOString()
    };

    let history = getEventHistory();
    
    // Add new event at the end
    history.push(eventSnapshot);
    
    // Keep only last 5 events (FIFO - remove oldest if more than 5)
    if (history.length > 5) {
      history.shift(); // Remove first (oldest) event
    }

    localStorage.setItem(STORAGE_KEYS.EVENT_HISTORY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('Error saving event to history:', error);
    return false;
  }
};

// Load event from history
export const loadEventFromHistory = (eventId) => {
  try {
    const history = getEventHistory();
    const event = history.find(e => e.id === eventId);
    
    if (!event) return false;

    // Load event data
    saveParticipants(event.participants);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(event.attendance));
    setEventName(event.name);
    setEventDate(event.date);
    setEventLocation(event.location);
    
    window.dispatchEvent(new Event('dataChanged'));
    return true;
  } catch (error) {
    console.error('Error loading event from history:', error);
    return false;
  }
};

// Delete event from history
export const deleteEventFromHistory = (eventId) => {
  try {
    let history = getEventHistory();
    history = history.filter(e => e.id !== eventId);
    localStorage.setItem(STORAGE_KEYS.EVENT_HISTORY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('Error deleting event from history:', error);
    return false;
  }
};

// Export participants as JSON (preserves IDs for cross-device compatibility)
export const exportParticipantsJSON = () => {
  try {
    const participants = getParticipants();
    const eventName = getEventName();
    const eventDate = getEventDate();
    
    const exportData = {
      exportDate: new Date().toISOString(),
      eventName: eventName,
      eventDate: eventDate,
      participantCount: participants.length,
      participants: participants
    };
    
    return exportData;
  } catch (error) {
    console.error('Error exporting participants:', error);
    return null;
  }
};

// Import participants from JSON (preserves original IDs)
export const importParticipantsJSON = (jsonData) => {
  try {
    if (!jsonData || !jsonData.participants || !Array.isArray(jsonData.participants)) {
      return { success: false, message: 'Invalid JSON format' };
    }
    
    const participants = jsonData.participants;
    
    if (participants.length === 0) {
      return { success: false, message: 'No participants found in file' };
    }
    
    // Save participants with their original IDs
    saveParticipants(participants);
    
    window.dispatchEvent(new Event('dataChanged'));
    
    return { 
      success: true, 
      count: participants.length,
      eventName: jsonData.eventName || 'Imported Event'
    };
  } catch (error) {
    console.error('Error importing participants:', error);
    return { success: false, message: 'Error processing file' };
  }
};
