import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, Download, Upload, AlertTriangle, Mail, MapPin, History, RotateCcw, Archive, Moon, Sun, Database, FileJson, BookOpen } from 'lucide-react';
import { 
  getEventName, 
  setEventName,
  getEventDate,
  setEventDate,
  getEventOrganiser,
  setEventOrganiser,
  getEventLocation,
  setEventLocation,
  clearAttendance, 
  clearAllData,
  exportData,
  importData,
  getEventHistory,
  saveCurrentEventToHistory,
  loadEventFromHistory,
  deleteEventFromHistory,
  exportParticipantsJSON,
  importParticipantsJSON
} from '../storage';
import TutorialGuide from './TutorialGuide';
import './EventSettings.css';

function EventSettings() {
  const [eventName, setEventNameState] = useState('');
  const [eventDate, setEventDateState] = useState('');
  const [eventOrganiser, setEventOrganiserState] = useState('');
  const [eventLocation, setEventLocationState] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showNewEventConfirm, setShowNewEventConfirm] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [showContact, setShowContact] = useState(false);
  const [eventHistory, setEventHistory] = useState([]);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    setEventNameState(getEventName());
    setEventDateState(getEventDate());
    setEventOrganiserState(getEventOrganiser());
    setEventLocationState(getEventLocation());
    loadHistory();
  }, []);

  const loadHistory = () => {
    setEventHistory(getEventHistory());
  };

  const handleSaveEventName = () => {
    if (eventName.trim()) {
      setEventName(eventName.trim());
      setEventDate(eventDate);
      setEventOrganiser(eventOrganiser);
      setEventLocation(eventLocation);
      alert('Event details saved!');
    }
  };

  const handleClearAttendance = () => {
    // Save current event to history before clearing
    saveCurrentEventToHistory();
    
    clearAttendance();
    
    // Set new event name if provided
    if (newEventName.trim()) {
      setEventName(newEventName.trim());
      setEventNameState(newEventName.trim());
    }
    
    setShowClearConfirm(false);
    setNewEventName('');
    loadHistory();
    alert('Event saved to history! Attendance cleared for new event.');
  };

  const handleResetAllData = () => {
    // Save current event to history before resetting
    saveCurrentEventToHistory();
    
    clearAllData();
    setShowResetConfirm(false);
    setShowNewEventConfirm(false);
    setEventNameState('Current Event');
    setEventDateState('');
    setEventLocationState('');
    loadHistory();
    alert('Current event saved to history and data cleared!');
  };

  const handleLoadEvent = (eventId) => {
    if (window.confirm('Load this event? Current data will be replaced.')) {
      if (loadEventFromHistory(eventId)) {
        setEventNameState(getEventName());
        setEventDateState(getEventDate());
        setEventLocationState(getEventLocation());
        alert('Event loaded successfully!');
      } else {
        alert('Failed to load event');
      }
    }
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Delete this event from history?')) {
      if (deleteEventFromHistory(eventId)) {
        loadHistory();
        alert('Event deleted from history');
      }
    }
  };

  const handleArchiveCurrentEvent = () => {
    if (saveCurrentEventToHistory()) {
      loadHistory();
      alert('Event archived to history!');
    } else {
      alert('No participants to archive');
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Delete all event history? This cannot be undone!')) {
      localStorage.removeItem('event_history');
      loadHistory();
      alert('Event history cleared!');
    }
  };

  const handleExportData = () => {
    const data = exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (importData(data)) {
          alert('Data imported successfully!');
          setEventNameState(getEventName());
        } else {
          alert('Failed to import data');
        }
      } catch (error) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportParticipantsJSON = () => {
    const data = exportParticipantsJSON();
    if (!data) {
      alert('No participants to export');
      return;
    }
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `participants_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
    alert('Participants exported! Share this file to use the same QR codes on other devices.');
  };

  const handleImportParticipantsJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const result = importParticipantsJSON(data);
        
        if (result.success) {
          alert(`Successfully imported ${result.count} participants!\n\nQR codes from the source device will now work on this device.`);
          loadHistory();
        } else {
          alert(`Import failed: ${result.message}`);
        }
      } catch (error) {
        alert('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="event-settings">
      <div className="section-header">
        <h2>Settings</h2>
        <div className="header-actions-settings">
          <button 
            className="btn-tutorial"
            onClick={() => setShowTutorial(true)}
            title="Tutorial Guide"
          >
            <BookOpen size={18} />
            Tutorial
          </button>
          <button 
            className="btn-new-event"
            onClick={() => setShowNewEventConfirm(true)}
            title="Start New Event"
          >
            + New Event
          </button>
        </div>
      </div>

      <div className="settings-section">
        <div className="setting-card">
          <div className="setting-header">
            <Calendar size={20} />
            <h3>Event Details</h3>
          </div>
          <p className="setting-description">
            Set details for your current event or session
          </p>
          <div className="setting-input-group" style={{ flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventNameState(e.target.value)}
              placeholder="Event Name (e.g., Team Meeting Jan 2026)"
              className="setting-input"
            />
            <div className="date-input-wrapper">
              <label htmlFor="event-date-input" className="date-input-label">
                Event Date
              </label>
              <input
                id="event-date-input"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDateState(e.target.value)}
                className="setting-input date-input"
              />
            </div>
            <input
              type="text"
              value={eventOrganiser}
              onChange={(e) => setEventOrganiserState(e.target.value)}
              placeholder="Event Organiser (Optional)"
              className="setting-input"
            />
            <input
              type="text"
              value={eventLocation}
              onChange={(e) => setEventLocationState(e.target.value)}
              placeholder="Location (Optional)"
              className="setting-input"
            />
            <button className="btn-primary" onClick={handleSaveEventName} style={{ width: '100%' }}>
              Save Event Details
            </button>
          </div>
        </div>

        <div className="setting-card">
          <div className="setting-header">
            <Trash2 size={20} />
            <h3>Clear Attendance</h3>
          </div>
          <p className="setting-description">
            Clear attendance records for a new event. Participants list will remain.
          </p>
          <button 
            className="btn-warning" 
            onClick={() => setShowClearConfirm(true)}
          >
            Clear Attendance
          </button>
        </div>

        <div className="setting-card danger-zone">
          <div className="setting-header">
            <AlertTriangle size={20} />
            <h3>Reset Current Event Data</h3>
          </div>
          <p className="setting-description">
            Clear all participants and attendance for current event. Event will be saved to history automatically.
          </p>
          <button 
            className="btn-danger" 
            onClick={() => setShowResetConfirm(true)}
          >
            Reset All Data of Current Event
          </button>
        </div>
      </div>

      {/* Clear Attendance Confirmation Modal */}
      {showClearConfirm && (
        <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon warning">
              <AlertTriangle size={32} />
            </div>
            <h3>Clear Attendance?</h3>
            <p>This will remove all attendance records but keep your participants list.</p>
            
            <div className="form-group" style={{ marginTop: '1rem', textAlign: 'left' }}>
              <label>New Event Name (Optional)</label>
              <input
                type="text"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="e.g., Team Meeting Feb 2026"
                className="setting-input"
                style={{ width: '100%' }}
              />
            </div>

            <div className="confirm-actions">
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowClearConfirm(false);
                  setNewEventName('');
                }}
              >
                Cancel
              </button>
              <button 
                className="btn-warning" 
                onClick={handleClearAttendance}
              >
                Clear Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset All Data Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon danger">
              <AlertTriangle size={32} />
            </div>
            <h3>Reset Current Event Data?</h3>
            <p>This will save current event to history and clear all participants and attendance to start fresh.</p>
            <div className="confirm-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-danger" 
                onClick={handleResetAllData}
              >
                Reset Current Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Event Confirmation Modal */}
      {showNewEventConfirm && (
        <div className="modal-overlay" onClick={() => setShowNewEventConfirm(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon warning">
              <AlertTriangle size={32} />
            </div>
            <h3>Start New Event?</h3>
            <p>This will save your current event to history and clear all data to start a new event.</p>
            <div className="confirm-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowNewEventConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleResetAllData}
              >
                Start New Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Event Confirmation Modal */}
      {showNewEventConfirm && (
        <div className="modal-overlay" onClick={() => setShowNewEventConfirm(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon warning">
              <AlertTriangle size={32} />
            </div>
            <h3>Start New Event?</h3>
            <p>This will save your current event to history and clear all data to start a new event.</p>
            <div className="confirm-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowNewEventConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleResetAllData}
              >
                Start New Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event History Section */}
      <div className="settings-section" style={{ marginTop: '2rem' }}>
        <div className="setting-card">
          <div className="setting-header">
            <History size={20} />
            <h3>Event History</h3>
          </div>
          <p className="setting-description">
            Last 5 events are saved automatically. Archive current event before starting a new one.
          </p>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button 
              className="btn-secondary" 
              onClick={handleArchiveCurrentEvent}
              style={{ flex: 1 }}
            >
              <Archive size={18} />
              Archive Current Event
            </button>
            {eventHistory.length > 0 && (
              <button 
                className="btn-danger" 
                onClick={handleClearAllHistory}
                style={{ flex: 1 }}
              >
                <Trash2 size={18} />
                Clear All History
              </button>
            )}
          </div>

          {eventHistory.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.875rem', padding: '1rem' }}>
              No event history yet. Clear attendance to save events.
            </p>
          ) : (
            <div className="event-history-list">
              {eventHistory.slice().reverse().map((event) => (
                <div key={event.id} className="history-item">
                  <div className="history-info">
                    <h4>{event.name}</h4>
                    <div className="history-details">
                      {event.date && (
                        <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                      )}
                      {event.location && (
                        <span>📍 {event.location}</span>
                      )}
                      <span>👥 {event.participants.length} participants</span>
                      <span>✓ {event.attendance.length} present</span>
                    </div>
                    <div className="history-meta">
                      Saved: {new Date(event.savedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="history-actions">
                    <button 
                      className="btn-icon btn-load" 
                      onClick={() => handleLoadEvent(event.id)}
                      title="Load Event"
                    >
                      <RotateCcw size={18} />
                    </button>
                    <button 
                      className="btn-icon btn-danger" 
                      onClick={() => handleDeleteEvent(event.id)}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* JSON Backup/Restore Section */}
      <div className="settings-section" style={{ marginTop: '1.5rem' }}>
        <div className="setting-card json-backup-card">
          <div className="setting-header">
            <Database size={20} />
            <h3>Cross-Device Backup</h3>
          </div>
          <p className="setting-description">
            Export participants as JSON to use the same QR codes across multiple devices. Import the JSON file on another phone to ensure QR codes work seamlessly!
          </p>
          
          <div className="json-backup-actions">
            <button 
              className="btn-json-export" 
              onClick={handleExportParticipantsJSON}
            >
              <FileJson size={18} />
              <div className="btn-text">
                <span className="btn-title">Export Participants</span>
                <span className="btn-subtitle">Save with IDs for other devices</span>
              </div>
            </button>
            
            <label className="btn-json-import" htmlFor="json-import-input">
              <Upload size={18} />
              <div className="btn-text">
                <span className="btn-title">Import Participants</span>
                <span className="btn-subtitle">Load from another device</span>
              </div>
            </label>
            <input
              type="file"
              id="json-import-input"
              accept=".json"
              onChange={handleImportParticipantsJSON}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>

      <div className="app-info">
        <h4>About This App</h4>
        <p>
          VINQR v1.0<br />
          Works completely offline with local storage.<br />
          Maximum recommended: 300 participants.
        </p>
      </div>

      {/* Developer Section */}
      <div className="developer-section">
        <div className="developer-credit">
          Designed and Developed by{' '}
          <a 
            href="https://www.linkedin.com/in/vincentrajr/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="developer-link"
          >
            VINCENT RAJ R
          </a>
        </div>
        <p className="developer-details">
          ECE Student | Kings Engineering College
        </p>
        <button 
          className="contact-developer-btn"
          onClick={() => setShowContact(!showContact)}
        >
          <Mail size={16} />
          Contact Developer
        </button>
        {showContact && (
          <div className="contact-info">
            <p>Send a mail here and we'll reach back to you:</p>
            <a href="mailto:joevinraj2705@gmail.com" className="email-link">
              joevinraj2705@gmail.com
            </a>
          </div>
        )}
      </div>

      {showTutorial && <TutorialGuide onClose={() => setShowTutorial(false)} />}
    </div>
  );
}

export default EventSettings;
