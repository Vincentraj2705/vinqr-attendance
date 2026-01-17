import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Download, Clock, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getParticipants, getAttendance, getEventName, getEventDate, getEventOrganiser, getEventLocation } from '../storage';
import './AttendanceReport.css';

function AttendanceReport() {
  const [participants, setParticipants] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [filter, setFilter] = useState('all'); // all, present, absent

  useEffect(() => {
    loadData();
    
    // Listen for data changes
    const handleDataChange = () => {
      loadData();
    };
    
    window.addEventListener('dataChanged', handleDataChange);
    
    // Reload data every 2 seconds to catch changes
    const interval = setInterval(loadData, 2000);
    
    return () => {
      window.removeEventListener('dataChanged', handleDataChange);
      clearInterval(interval);
    };
  }, []);

  const loadData = () => {
    setParticipants(getParticipants());
    setAttendance(getAttendance());
  };

  const getPresentParticipants = () => {
    const attendanceIds = new Set(attendance.map(a => a.participantId));
    return participants.filter(p => attendanceIds.has(p.id));
  };

  const getAbsentParticipants = () => {
    const attendanceIds = new Set(attendance.map(a => a.participantId));
    return participants.filter(p => !attendanceIds.has(p.id));
  };

  const getFilteredParticipants = () => {
    if (filter === 'present') return getPresentParticipants();
    if (filter === 'absent') return getAbsentParticipants();
    return participants;
  };

  const getAttendanceTime = (participantId) => {
    const record = attendance.find(a => a.participantId === participantId);
    if (!record) return null;
    
    const date = new Date(record.timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isPresent = (participantId) => {
    return attendance.some(a => a.participantId === participantId);
  };

  const downloadReport = () => {
    const present = getPresentParticipants();
    const absent = getAbsentParticipants();
    
    let csv = 'Team ID,Name,Status,Time\n';
    
    present.forEach(p => {
      const time = getAttendanceTime(p.id);
      csv += `${p.teamId},"${p.name}",Present,${time}\n`;
    });
    
    absent.forEach(p => {
      csv += `${p.teamId},"${p.name}",Absent,-\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadExcelReport = () => {
    const present = getPresentParticipants();
    const absent = getAbsentParticipants();
    const eventName = getEventName();
    const eventDate = getEventDate();
    const eventOrganiser = getEventOrganiser();
    const eventLocation = getEventLocation();

    // Get all unique field names (exclude internal fields)
    const allFields = new Set();
    [...present, ...absent].forEach(p => {
      Object.keys(p).forEach(key => {
        if (!['id', 'createdAt'].includes(key)) {
          allFields.add(key);
        }
      });
    });

    const fieldNames = Array.from(allFields);
    const data = [];
    
    // Event Details Header
    data.push(['Event Name:', eventName]);
    if (eventDate) data.push(['Date:', new Date(eventDate).toLocaleDateString()]);
    if (eventOrganiser) data.push(['Organiser:', eventOrganiser]);
    if (eventLocation) data.push(['Location:', eventLocation]);
    data.push([]);
    
    // Column Header
    data.push([...fieldNames, 'Status']);

    // Present participants
    present.forEach(p => {
      const row = fieldNames.map(field => p[field] || '');
      row.push('Present');
      data.push(row);
    });

    // Absent participants
    absent.forEach(p => {
      const row = fieldNames.map(field => p[field] || '');
      row.push('Absent');
      data.push(row);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

    // Auto-size columns
    worksheet['!cols'] = fieldNames.map(() => ({ wch: 20 }));
    worksheet['!cols'].push({ wch: 12 }); // Status column

    XLSX.writeFile(workbook, `attendance_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const downloadPDFReport = () => {
    const present = getPresentParticipants();
    const absent = getAbsentParticipants();
    const eventName = getEventName();
    const eventDate = getEventDate();
    const eventOrganiser = getEventOrganiser();
    const eventLocation = getEventLocation();

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Attendance Report', 14, 20);
    
    // Event Details
    doc.setFontSize(11);
    let yPos = 30;
    doc.text(`Event: ${eventName}`, 14, yPos);
    if (eventDate) {
      yPos += 7;
      doc.text(`Date: ${new Date(eventDate).toLocaleDateString()}`, 14, yPos);
    }
    if (eventOrganiser) {
      yPos += 7;
      doc.text(`Organiser: ${eventOrganiser}`, 14, yPos);
    }
    if (eventLocation) {
      yPos += 7;
      doc.text(`Location: ${eventLocation}`, 14, yPos);
    }
    yPos += 10;

    // Statistics
    const totalCount = participants.length;
    const presentCount = getPresentParticipants().length;
    const absentCount = getAbsentParticipants().length;
    const attendanceRate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : '0';
    
    doc.setFontSize(12);
    doc.text(`Total: ${totalCount} | Present: ${presentCount} | Absent: ${absentCount} | Rate: ${attendanceRate}%`, 14, yPos);
    yPos += 10;

    // Get all unique field names
    const allFields = new Set();
    [...present, ...absent].forEach(p => {
      Object.keys(p).forEach(key => {
        if (!['id', 'createdAt'].includes(key)) {
          allFields.add(key);
        }
      });
    });

    const fieldNames = Array.from(allFields);
    const tableData = [];
    
    // Add present participants
    present.forEach(p => {
      const row = fieldNames.map(field => p[field] || '');
      row.push('Present');
      tableData.push(row);
    });

    // Add absent participants
    absent.forEach(p => {
      const row = fieldNames.map(field => p[field] || '');
      row.push('Absent');
      tableData.push(row);
    });

    // Generate table
    doc.autoTable({
      startY: yPos,
      head: [[...fieldNames, 'Status']],
      body: tableData,
      headStyles: { fillColor: [68, 117, 130] },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      styles: { fontSize: 9 },
      columnStyles: fieldNames.reduce((acc, _, idx) => {
        acc[idx] = { cellWidth: 'auto' };
        return acc;
      }, {})
    });

    doc.save(`attendance_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const filteredParticipants = getFilteredParticipants();
  const presentCount = getPresentParticipants().length;
  const absentCount = getAbsentParticipants().length;
  const totalCount = participants.length;
  const attendanceRate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0;

  return (
    <div className="attendance-report">
      <div className="section-header">
        <h2>Attendance Report</h2>
        {totalCount > 0 && (
          <div className="export-buttons">
            <button className="btn-export excel" onClick={downloadExcelReport} title="Download Excel">
              <FileSpreadsheet size={18} />
              Excel
            </button>
            <button className="btn-export pdf" onClick={downloadPDFReport} title="Download PDF">
              <FileText size={18} />
              PDF
            </button>
          </div>
        )}
      </div>

      {totalCount === 0 ? (
        <div className="empty-state">
          <Users size={64} />
          <h3>No Participants</h3>
          <p>Add participants first to track attendance</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-label">Total</div>
                <div className="stat-value">{totalCount}</div>
              </div>
            </div>

            <div className="stat-card present">
              <div className="stat-icon">
                <UserCheck size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-label">Present</div>
                <div className="stat-value">{presentCount}</div>
              </div>
            </div>

            <div className="stat-card absent">
              <div className="stat-icon">
                <UserX size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-label">Absent</div>
                <div className="stat-value">{absentCount}</div>
              </div>
            </div>

            <div className="stat-card rate">
              <div className="stat-icon">
                <Clock size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-label">Rate</div>
                <div className="stat-value">{attendanceRate}%</div>
              </div>
            </div>
          </div>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({totalCount})
            </button>
            <button
              className={`filter-tab ${filter === 'present' ? 'active' : ''}`}
              onClick={() => setFilter('present')}
            >
              Present ({presentCount})
            </button>
            <button
              className={`filter-tab ${filter === 'absent' ? 'active' : ''}`}
              onClick={() => setFilter('absent')}
            >
              Absent ({absentCount})
            </button>
          </div>

          <div className="participants-list">
            {filteredParticipants.length === 0 ? (
              <div className="empty-filter">
                <p>No participants in this category</p>
              </div>
            ) : (
              filteredParticipants.map(participant => {
                // Get display fields
                const displayFields = Object.entries(participant).filter(
                  ([key]) => !['id', 'createdAt'].includes(key)
                );
                const primaryField = displayFields[0] ? displayFields[0][1] : 'N/A';
                const secondaryField = displayFields[1] ? displayFields[1][1] : '';

                return (
                  <div key={participant.id} className="participant-row">
                    <div className="participant-basic">
                      <div className={`status-badge ${isPresent(participant.id) ? 'present' : 'absent'}`}>
                        {isPresent(participant.id) ? (
                          <UserCheck size={16} />
                        ) : (
                          <UserX size={16} />
                        )}
                      </div>
                      <div className="participant-details">
                        <div className="participant-name">{primaryField}</div>
                        {secondaryField && <div className="participant-team-id">{secondaryField}</div>}
                      </div>
                    </div>
                    <div className="participant-time">
                      {isPresent(participant.id) ? (
                        <>
                          <Clock size={14} />
                          <span>{getAttendanceTime(participant.id)}</span>
                        </>
                      ) : (
                        <span className="not-marked">Not marked</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AttendanceReport;
