import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 60); // 3 seconds total (60ms * 50 steps)

    // Hide splash after 3 seconds
    const timeout = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onFinish]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="splash-logo">
          <div className="splash-icon">
            <img src="/icon-512.svg" alt="VINQR Logo" />
          </div>
          <h1 className="splash-title">VINQR</h1>
          <p className="splash-subtitle">Attendance Tracker</p>
          <p className="splash-tagline">Scan QR codes to track attendance anywhere, even without internet</p>
        </div>
        
        <div className="loading-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
