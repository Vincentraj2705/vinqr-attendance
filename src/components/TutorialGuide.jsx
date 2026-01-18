import React, { useState } from 'react';
import { X, BookOpen, Users, QrCode, ScanLine, FileSpreadsheet, Download, Upload, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import './TutorialGuide.css';

function TutorialGuide({ onClose }) {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview', icon: BookOpen },
    { id: 'manage', title: 'Manage Participants', icon: Users },
    { id: 'scan', title: 'Scan QR Codes', icon: ScanLine },
    { id: 'report', title: 'View Reports', icon: FileSpreadsheet },
    { id: 'settings', title: 'Settings & Backup', icon: Settings },
    { id: 'tips', title: 'Tips & Best Practices', icon: CheckCircle }
  ];

  return (
    <div className="tutorial-overlay" onClick={onClose}>
      <div className="tutorial-container" onClick={(e) => e.stopPropagation()}>
        <div className="tutorial-header">
          <div className="tutorial-title">
            <BookOpen size={24} />
            <h2>VINQR User Guide</h2>
          </div>
          <button className="tutorial-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="tutorial-body">
          <div className="tutorial-sidebar">
            {sections.map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  className={`tutorial-nav-btn ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon size={18} />
                  <span>{section.title}</span>
                </button>
              );
            })}
          </div>

          <div className="tutorial-content">
            {activeSection === 'overview' && (
              <div className="tutorial-section">
                <h3>Welcome to VINQR</h3>
                <p className="tutorial-intro">
                  VINQR is a powerful, offline-first QR code attendance tracking system designed for events, meetings, classes, and conferences. 
                  No internet required!
                </p>

                <div className="feature-grid">
                  <div className="feature-card">
                    <Users size={32} className="feature-icon" />
                    <h4>Manage Participants</h4>
                    <p>Add participants manually, import from Excel, or bulk upload with custom fields</p>
                  </div>
                  <div className="feature-card">
                    <QrCode size={32} className="feature-icon" />
                    <h4>Generate QR Codes</h4>
                    <p>Automatically create unique QR codes for each participant</p>
                  </div>
                  <div className="feature-card">
                    <ScanLine size={32} className="feature-icon" />
                    <h4>Scan Attendance</h4>
                    <p>Use your camera to scan QR codes and mark attendance instantly</p>
                  </div>
                  <div className="feature-card">
                    <FileSpreadsheet size={32} className="feature-icon" />
                    <h4>Export Reports</h4>
                    <p>Download attendance reports as Excel, PDF, or CSV files</p>
                  </div>
                </div>

                <div className="info-box">
                  <AlertCircle size={20} />
                  <div>
                    <strong>Works Completely Offline</strong>
                    <p>All data is stored locally on your device. No internet connection required!</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'manage' && (
              <div className="tutorial-section">
                <h3>Managing Participants</h3>
                
                <div className="tutorial-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Add Participants Manually</h4>
                    <p>Click the <strong>+ Add Participant</strong> button to open the form.</p>
                    <ul>
                      <li>Enter participant details (Team ID, Name, Email, etc.)</li>
                      <li>Add custom fields by clicking <strong>+ Add Custom Field</strong></li>
                      <li>Custom fields can be anything: Department, Phone, Student ID, etc.</li>
                      <li>Click <strong>Add Participant</strong> to save</li>
                    </ul>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Upload Excel File</h4>
                    <p>Click <strong>Upload Excel</strong> to bulk import participants.</p>
                    <ul>
                      <li>Excel file can have any columns you want</li>
                      <li>First row should contain column headers</li>
                      <li>All columns will be imported automatically</li>
                      <li>Common columns: Name, Team ID, Email, Phone, Department</li>
                    </ul>
                    <div className="tip-box">
                      <strong>💡 Tip:</strong> After uploading, scroll down using the arrow button to see all participants
                    </div>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Generate QR Codes</h4>
                    <p>Each participant automatically gets a unique QR code.</p>
                    <ul>
                      <li><strong>Download QR</strong>: Click the QR icon on any participant card</li>
                      <li><strong>Download All QR</strong>: Get all QR codes at once (downloads sequentially)</li>
                      <li>Share QR codes to participants via email, WhatsApp, or print them</li>
                      <li>Each QR code is unique and tied to that specific participant</li>
                    </ul>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Edit & Delete Participants</h4>
                    <ul>
                      <li><strong>Edit</strong>: Click the edit icon to modify participant details</li>
                      <li><strong>Delete</strong>: Click the trash icon to remove a participant</li>
                      <li><strong>Search</strong>: Use the search box to filter participants</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'scan' && (
              <div className="tutorial-section">
                <h3>Scanning QR Codes</h3>

                <div className="tutorial-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Start Camera Scanner</h4>
                    <ul>
                      <li>Go to the <strong>Scan QR</strong> tab</li>
                      <li>Click <strong>Start Scanning</strong></li>
                      <li>Allow camera permissions when prompted</li>
                      <li>Point camera at participant's QR code</li>
                    </ul>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Automatic Attendance Marking</h4>
                    <ul>
                      <li>Scanner automatically detects and reads QR codes</li>
                      <li>✅ Green notification = Attendance marked successfully</li>
                      <li>❌ Red notification = Already marked or not found</li>
                      <li>Audio feedback for success/failure</li>
                      <li>Scanner stops after each scan for confirmation</li>
                    </ul>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Manual Attendance Mode</h4>
                    <p>Switch to manual mode if camera scanning isn't working:</p>
                    <ul>
                      <li>Click <strong>Switch to Manual Mode</strong></li>
                      <li>Search for participant by name or Team ID</li>
                      <li>Click <strong>Mark Attendance</strong> button</li>
                      <li>Useful for backup or troubleshooting</li>
                    </ul>
                  </div>
                </div>

                <div className="info-box">
                  <AlertCircle size={20} />
                  <div>
                    <strong>Duplicate Prevention</strong>
                    <p>Each participant can only be marked once per event. Scanning again will show an "Already Marked" message.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'report' && (
              <div className="tutorial-section">
                <h3>Viewing & Exporting Reports</h3>

                <div className="tutorial-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>View Attendance Statistics</h4>
                    <p>Go to the <strong>Report</strong> tab to see:</p>
                    <ul>
                      <li>Total participants registered</li>
                      <li>Number of participants present</li>
                      <li>Number of participants absent</li>
                      <li>Real-time attendance percentage</li>
                    </ul>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Filter Attendance</h4>
                    <p>Use the filter buttons to view:</p>
                    <ul>
                      <li><strong>All</strong>: See everyone (present + absent)</li>
                      <li><strong>Present</strong>: Only those who attended</li>
                      <li><strong>Absent</strong>: Only those who didn't attend</li>
                    </ul>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Export Reports</h4>
                    <p>Download attendance data in multiple formats:</p>
                    <ul>
                      <li><strong>Excel (.xlsx)</strong>: Full data with all fields, formatted tables</li>
                      <li><strong>PDF</strong>: Professional report with event details and tables</li>
                      <li><strong>CSV</strong>: Simple format for basic spreadsheet programs</li>
                    </ul>
                    <div className="tip-box">
                      <strong>💡 Tip:</strong> Excel format includes the most detailed information including timestamps
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'settings' && (
              <div className="tutorial-section">
                <h3>Settings & Cross-Device Backup</h3>

                <div className="tutorial-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Event Details</h4>
                    <ul>
                      <li>Set <strong>Event Name</strong> (e.g., "Team Meeting Jan 2026")</li>
                      <li>Set <strong>Event Date</strong> using the date picker</li>
                      <li>Add <strong>Organiser Name</strong> (optional)</li>
                      <li>Add <strong>Location</strong> (optional)</li>
                      <li>These details appear in exported reports</li>
                    </ul>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Cross-Device Backup (JSON Export/Import)</h4>
                    <p><strong>Why is this important?</strong></p>
                    <p>When you generate QR codes on Phone 1, those QR codes won't work on Phone 2 by default. 
                    JSON backup solves this problem!</p>
                    
                    <div className="workflow-box">
                      <h5>📱 Phone 1 (QR Generator):</h5>
                      <ol>
                        <li>Import Excel and generate QR codes</li>
                        <li>Click <strong>Export Participants</strong> in Settings</li>
                        <li>Save the JSON file</li>
                        <li>Share QR codes to participants</li>
                        <li>Share JSON file to Phone 2</li>
                      </ol>
                    </div>

                    <div className="workflow-box">
                      <h5>📱 Phone 2 (Scanner):</h5>
                      <ol>
                        <li>Click <strong>Import Participants</strong> in Settings</li>
                        <li>Select the JSON file from Phone 1</li>
                        <li>Now scan QR codes - they will work! ✓</li>
                      </ol>
                    </div>

                    <div className="tip-box">
                      <strong>💡 Tip:</strong> JSON file preserves the exact participant IDs, making QR codes compatible across devices
                    </div>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Event Management</h4>
                    <ul>
                      <li><strong>Clear Attendance</strong>: Remove attendance records, keep participants</li>
                      <li><strong>Reset Event</strong>: Clear everything (saves current event to history)</li>
                      <li><strong>New Event</strong>: Start fresh event with history backup</li>
                      <li><strong>Event History</strong>: Access previously saved events</li>
                    </ul>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Full Backup & Restore</h4>
                    <ul>
                      <li><strong>Export Data</strong>: Complete backup (participants + attendance + settings)</li>
                      <li><strong>Import Data</strong>: Restore from backup</li>
                      <li>Useful for app reinstalls or data migration</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'tips' && (
              <div className="tutorial-section">
                <h3>Tips & Best Practices</h3>

                <div className="tips-grid">
                  <div className="tip-card">
                    <CheckCircle size={24} className="tip-icon" />
                    <h4>Prepare Your Excel File</h4>
                    <p>Include columns like: Team ID, Name, Email, Phone, Department. First row must be headers.</p>
                  </div>

                  <div className="tip-card">
                    <CheckCircle size={24} className="tip-icon" />
                    <h4>Generate QR Codes Early</h4>
                    <p>Create and distribute QR codes before the event. Participants can save them on their phones.</p>
                  </div>

                  <div className="tip-card">
                    <CheckCircle size={24} className="tip-icon" />
                    <h4>Test Scanner Before Event</h4>
                    <p>Test the QR scanner with a few sample codes to ensure camera permissions work.</p>
                  </div>

                  <div className="tip-card">
                    <CheckCircle size={24} className="tip-icon" />
                    <h4>Use JSON Backup for Multiple Devices</h4>
                    <p>Always export JSON after generating QR codes if you'll scan from different devices.</p>
                  </div>

                  <div className="tip-card">
                    <CheckCircle size={24} className="tip-icon" />
                    <h4>Regular Backups</h4>
                    <p>Export data regularly. App data is stored locally and can be lost if you clear browser data.</p>
                  </div>

                  <div className="tip-card">
                    <CheckCircle size={24} className="tip-icon" />
                    <h4>Good Lighting for Scanning</h4>
                    <p>Ensure adequate lighting when scanning QR codes for best results.</p>
                  </div>

                  <div className="tip-card">
                    <CheckCircle size={24} className="tip-icon" />
                    <h4>Limit to 300 Participants</h4>
                    <p>For optimal performance, keep participant count under 300 per event.</p>
                  </div>

                  <div className="tip-card">
                    <CheckCircle size={24} className="tip-icon" />
                    <h4>Manual Mode Fallback</h4>
                    <p>If QR scanning fails, use manual mode to mark attendance by searching names.</p>
                  </div>
                </div>

                <div className="info-box" style={{ marginTop: '2rem' }}>
                  <AlertCircle size={20} />
                  <div>
                    <strong>Need Help?</strong>
                    <p>Contact the developer through the Settings tab for support and feature requests.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="tutorial-footer">
          <div className="developer-info">
            <strong>Designed & Developed by Vincent Raj R</strong>
            <p>ECE Student | Kings Engineering College</p>
          </div>
          <button className="btn-got-it" onClick={onClose}>
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}

export default TutorialGuide;
