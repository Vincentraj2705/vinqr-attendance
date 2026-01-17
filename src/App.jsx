import React, { useState, useEffect } from 'react';
import { Users, QrCode, ClipboardList, Settings, Wifi, WifiOff } from 'lucide-react';
import SplashScreen from './components/SplashScreen';
import ManageParticipants from './components/ManageParticipants';
import ScanAttendance from './components/ScanAttendance';
import AttendanceReport from './components/AttendanceReport';
import EventSettings from './components/EventSettings';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('manage');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleNavigateHome = () => setActiveTab('manage');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('navigateHome', handleNavigateHome);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('navigateHome', handleNavigateHome);
    };
  }, []);

  const tabs = [
    { id: 'manage', label: 'Manage', icon: Users },
    { id: 'scan', label: 'Scan QR', icon: QrCode },
    { id: 'report', label: 'Report', icon: ClipboardList },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <img src="/icon-512.svg" alt="VINQR" className="header-icon" />
          <h1 className="app-title">VINQR</h1>
        </div>
      </header>

      <main className="app-content">
        {activeTab === 'manage' && <ManageParticipants />}
        {activeTab === 'scan' && <ScanAttendance />}
        {activeTab === 'report' && <AttendanceReport />}
        {activeTab === 'settings' && <EventSettings />}
      </main>

      <nav className="app-nav">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={24} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default App;
