import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CheckCircle, XCircle, AlertCircle, Home, ScanLine, UserPlus, Search, ArrowDown } from 'lucide-react';
import { getParticipants, markAttendance, getAttendance } from '../storage';
import './ScanAttendance.css';

function ScanAttendance() {
  const [mode, setMode] = useState('qr'); // 'qr' or 'manual'
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [participants, setParticipants] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const participantsEndRef = useRef(null);

  useEffect(() => {
    loadData();
    
    const handleDataChange = () => {
      loadData();
    };
    
    // Add scroll listener to show button when scrolling
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollDown(true);
      }
    };
    
    window.addEventListener('dataChanged', handleDataChange);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      stopScanning();
      window.removeEventListener('dataChanged', handleDataChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const loadData = () => {
    setParticipants(getParticipants());
    setAttendance(getAttendance());
  };

  const isPresent = (participantId) => {
    return attendance.some(a => a.participantId === participantId);
  };

  const handleManualMark = (participant) => {
    const result = markAttendance(participant.id);
    
    if (result.success) {
      setScanResult({
        success: true,
        message: '✓ Attendance Marked',
        participant: participant
      });
      playSound(true);
      loadData();
      
      // Clear result after 2 seconds
      setTimeout(() => {
        setScanResult(null);
      }, 2000);
    } else {
      setScanResult({
        success: false,
        message: result.message,
        participant: participant
      });
      playSound(false);
      
      // Clear result after 2 seconds
      setTimeout(() => {
        setScanResult(null);
      }, 2000);
    }
  };

  const getFilteredParticipants = () => {
    if (!searchQuery.trim()) return participants;
    
    const query = searchQuery.toLowerCase();
    return participants.filter(participant => {
      return Object.entries(participant)
        .filter(([key]) => !['id', 'createdAt'].includes(key))
        .some(([_, value]) => 
          String(value).toLowerCase().includes(query)
        );
    });
  };

  const scrollToBottom = () => {
    participantsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollDown(false);
  };

  const switchMode = (newMode) => {
    if (isScanning) {
      stopScanning();
    }
    setScanResult(null);
    setSearchQuery('');
    setMode(newMode);
  };

  const startScanning = async () => {
    try {
      setError(null);
      setScanResult(null);

      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        onScanError
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Could not access camera. Please allow camera permissions.');
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const onScanSuccess = (decodedText) => {
    // Stop scanning immediately after successful scan
    stopScanning();
    
    try {
      // Parse QR data - should be JSON with participant info
      const data = JSON.parse(decodedText);
      const participantId = data.id;
      
      if (!participantId) {
        setScanResult({
          success: false,
          message: 'Invalid QR code - no ID found',
          data: null
        });
        playSound(false);
        return;
      }

      // Verify participant exists by ID with strict matching
      const participants = getParticipants();
      const participant = participants.find(p => p.id === participantId);
      
      if (!participant) {
        setScanResult({
          success: false,
          message: 'Participant not found in system',
          data: null
        });
        playSound(false);
        return;
      }

      // Mark attendance using the unique participant ID
      const result = markAttendance(participantId);
      
      if (result.success) {
        setScanResult({
          success: true,
          message: '✓ Attendance Marked',
          participant: participant
        });
        playSound(true);
        loadData();
        
        // Keep popup visible for 2 seconds
        setTimeout(() => {
          setScanResult(null);
        }, 2000);
      } else {
        setScanResult({
          success: false,
          message: 'Already Updated',
          participant: participant
        });
        playSound(false);
        
        // Keep popup visible for 2 seconds
        setTimeout(() => {
          setScanResult(null);
        }, 2000);
      }
    } catch (err) {
      setScanResult({
        success: false,
        message: 'Invalid QR code format',
        data: null
      });
      playSound(false);
    }
  };

  const onScanError = (errorMessage) => {
    // Ignore scan errors (happens frequently during normal scanning)
  };

  const playSound = (success) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (success) {
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } else {
      oscillator.frequency.value = 200;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

  const clearResult = () => {
    setScanResult(null);
  };

  const scanAnother = async () => {
    setScanResult(null);
    // Restart the scanner
    await startScanning();
  };

  const goBack = async () => {
    await stopScanning();
    setScanResult(null);
    // Navigate to home by triggering app state change
    window.dispatchEvent(new CustomEvent('navigateHome'));
  };

  return (
    <div className="scan-attendance">
      <div className="section-header">
        <h2>Mark Attendance</h2>
      </div>

      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button 
          className={`mode-btn ${mode === 'qr' ? 'active' : ''}`}
          onClick={() => switchMode('qr')}
        >
          <ScanLine size={18} />
          QR Scan
        </button>
        <button 
          className={`mode-btn ${mode === 'manual' ? 'active' : ''}`}
          onClick={() => switchMode('manual')}
        >
          <UserPlus size={18} />
          Manual
        </button>
      </div>

      {mode === 'qr' && (
        <>
          <div className="scanner-container">
            <div id="qr-reader" className={isScanning ? 'active' : ''}></div>

            {!isScanning && !scanResult && (
              <div className="scanner-placeholder">
                <Camera size={64} />
                <h3>Ready to Scan</h3>
                <p>Click the button below to start scanning QR codes</p>
              </div>
            )}

        {scanResult && (
          <div className={`scan-result ${scanResult.success ? 'success' : 'error'}`}>
            {scanResult.success ? (
              <CheckCircle size={48} />
            ) : (
              <XCircle size={48} />
            )}
            <h3>{scanResult.message}</h3>
            {scanResult.participant && (
              <div className="participant-details">
                {Object.entries(scanResult.participant)
                  .filter(([key]) => !['id', 'createdAt'].includes(key))
                  .map(([key, value]) => (
                    <div className="detail-row" key={key}>
                      <span className="label">{key}:</span>
                      <span className="value">{value}</span>
                    </div>
                  ))}
              </div>
            )}
            <div className="scan-result-actions">
              <button className="btn-secondary" onClick={goBack}>
                <Home size={18} />
                Go Back
              </button>
              <button className="btn-primary" onClick={scanAnother}>
                <ScanLine size={18} />
                Scan Another
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="scanner-controls">
        {!isScanning ? (
          <button className="btn-start-scan" onClick={startScanning}>
            <Camera size={20} />
            Start Scanning
          </button>
        ) : (
          <button className="btn-stop-scan" onClick={stopScanning}>
            Stop Scanning
          </button>
        )}
      </div>

          <div className="scan-info">
            <AlertCircle size={18} />
            <p>Position the QR code within the frame. The app works offline!</p>
          </div>
        </>
      )}

      {mode === 'manual' && (
        <>
          <div className="manual-container">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search by name, ID, or any field..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {scanResult && (
              <div className={`scan-result-compact ${scanResult.success ? 'success' : 'error'}`}>
                {scanResult.success ? (
                  <CheckCircle size={24} />
                ) : (
                  <XCircle size={24} />
                )}
                <span>{scanResult.message}</span>
              </div>
            )}

            <div className="participants-manual-list">
              {participants.length === 0 ? (
                <div className="empty-state">
                  <UserPlus size={48} />
                  <p>No participants added yet</p>
                </div>
              ) : getFilteredParticipants().length === 0 ? (
                <div className="empty-state">
                  <Search size={48} />
                  <p>No participants match your search</p>
                </div>
              ) : (
                getFilteredParticipants().map(participant => {
                  const present = isPresent(participant.id);
                  const displayFields = Object.entries(participant).filter(
                    ([key]) => !['id', 'createdAt'].includes(key)
                  );

                  return (
                    <div key={participant.id} className={`manual-participant-card ${present ? 'present' : ''}`}>
                      <div className="participant-info">
                        {displayFields.map(([key, value]) => (
                          <div key={key} className="field-row">
                            <span className="field-label">{key}:</span>
                            <span className="field-value">{value}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        className={`btn-mark ${present ? 'marked' : ''}`}
                        onClick={() => handleManualMark(participant)}
                        disabled={present}
                      >
                        {present ? (
                          <>
                            <CheckCircle size={18} />
                            Marked
                          </>
                        ) : (
                          <>
                            <UserPlus size={18} />
                            Mark Present
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
              <div ref={participantsEndRef} />
            </div>
          </div>

          <div className="scan-info">
            <AlertCircle size={18} />
            <p>Use this mode to manually mark attendance if camera is not available.</p>
          </div>
        </>
      )}

      {showScrollDown && (
        <button className="scroll-to-bottom-btn" onClick={scrollToBottom}>
          <ArrowDown size={24} />
          <span>Scroll to Bottom</span>
        </button>
      )}
    </div>
  );
}

export default ScanAttendance;
