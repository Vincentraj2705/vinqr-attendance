import React, { useState, useEffect, useRef } from 'react';
import { Plus, Download, UserPlus, Trash2, Edit2, X, Upload, Share2, CheckCircle, Search, ArrowDown } from 'lucide-react';
import QRCode from 'qrcode';
import * as XLSX from 'xlsx';
import { getParticipants, addParticipant, deleteParticipant, updateParticipant, getEventOrganiser } from '../storage';
import './ManageParticipants.css';

function ManageParticipants() {
  const [participants, setParticipants] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ teamId: '', name: '' });
  const [customFields, setCustomFields] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [sharedParticipants, setSharedParticipants] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollDown, setShowScrollDown] = useState(false);
  const participantsEndRef = useRef(null);

  useEffect(() => {
    loadParticipants();
    
    // Add scroll listener to show/hide button based on scroll position
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      // Show button if user has scrolled up from bottom (more than 300px from bottom)
      const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
      
      if (distanceFromBottom > 300 && participants.length > 0) {
        setShowScrollDown(true);
      } else {
        setShowScrollDown(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [participants]);

  const loadParticipants = () => {
    const data = getParticipants();
    setParticipants(data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Combine base formData with custom fields
    const fullData = { ...formData };
    customFields.forEach(field => {
      if (field.name.trim() && field.value.trim()) {
        fullData[field.name.trim()] = field.value.trim();
      }
    });

    // Check if at least one field has data
    const hasData = Object.values(fullData).some(v => v && v.trim());
    if (!hasData) return;

    if (editingId) {
      updateParticipant(editingId, fullData);
      setEditingId(null);
    } else {
      addParticipant(fullData);
    }

    setFormData({ teamId: '', name: '' });
    setCustomFields([]);
    setShowAddForm(false);
    loadParticipants();
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { name: '', value: '' }]);
  };

  const removeCustomField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateCustomField = (index, field, value) => {
    const updated = [...customFields];
    updated[index][field] = value;
    setCustomFields(updated);
  };

  const handleEdit = (participant) => {
    setFormData({ teamId: participant.teamId, name: participant.name });
    setEditingId(participant.id);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this participant?')) {
      deleteParticipant(id);
      loadParticipants();
    }
  };

  const downloadQR = async (participant) => {
    try {
      // Complex QR with full participant data for uniqueness
      const qrData = JSON.stringify({
        id: participant.id,
        timestamp: Date.now(),
        ...participant
      });
      
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, qrData, {
        width: 512,
        margin: 4,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Get first non-internal field for filename
      const nameField = Object.entries(participant)
        .find(([key]) => !['id', 'createdAt'].includes(key));
      const fileName = nameField ? nameField[1] : participant.id;

      const link = document.createElement('a');
      link.download = `QR_${fileName}.png`;
      link.href = canvas.toDataURL();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Revoke the object URL to free memory
      setTimeout(() => {
        URL.revokeObjectURL(link.href);
      }, 100);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code');
    }
  };

  const downloadAllQR = async () => {
    for (const participant of participants) {
      await downloadQR(participant);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    processExcelFile(file);
    e.target.value = '';
  };

  const processExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        if (jsonData.length === 0) {
          alert('Excel file is empty!');
          return;
        }

        let successCount = 0;
        let errorCount = 0;

        // Get all column headers from first row
        const headers = Object.keys(jsonData[0]);

        // Process each row
        jsonData.forEach(row => {
          try {
            // Build participant object with all columns
            const participantData = {};
            let hasData = false;

            headers.forEach(header => {
              const value = row[header];
              if (value !== undefined && value !== null && String(value).trim() !== '') {
                participantData[header] = String(value).trim();
                hasData = true;
              }
            });

            if (hasData) {
              addParticipant(participantData);
              successCount++;
            } else {
              errorCount++;
            }
          } catch (err) {
            errorCount++;
          }
        });

        loadParticipants();
        setShowScrollDown(true);
        alert(`Import complete!\nAdded: ${successCount} participants\nSkipped: ${errorCount} rows\n\nImported columns: ${headers.join(', ')}`);
      } catch (error) {
        alert('Error reading Excel file. Please ensure it has a header row with column names.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        processExcelFile(file);
      } else {
        alert('Please drop an Excel file (.xlsx or .xls)');
      }
    }
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ teamId: '', name: '' });
    setCustomFields([]);
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

  const toggleShared = (participantId) => {
    setSharedParticipants(prev => {
      const newSet = new Set([...prev]);
      if (newSet.has(participantId)) {
        newSet.delete(participantId);
      } else {
        newSet.add(participantId);
      }
      return newSet;
    });
  };

  const handleShare = async (participant) => {
    try {
      // Generate QR code as blob for sharing
      const qrData = JSON.stringify({
        id: participant.id,
        timestamp: Date.now(),
        ...participant
      });
      
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, qrData, {
        width: 512,
        margin: 4,
        errorCorrectionLevel: 'H'
      });

      // Get participant name for sharing
      const nameField = Object.entries(participant)
        .find(([key]) => !['id', 'createdAt'].includes(key));
      const participantName = nameField ? nameField[1] : 'Participant';

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `QR_${participantName}.png`, { type: 'image/png' });
        
        // Check if Web Share API is supported
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: `QR Code - ${participantName}`,
              text: `Attendance QR Code for ${participantName}`,
              files: [file]
            });
          } catch (err) {
            if (err.name !== 'AbortError') {
              showShareFallback(participant, canvas.toDataURL());
            }
          }
        } else {
          // Fallback for browsers that don't support Web Share API
          showShareFallback(participant, canvas.toDataURL());
        }
      });
    } catch (error) {
      console.error('Share error:', error);
      alert('Error generating QR code for sharing');
    }
  };

  const showShareFallback = (participant, qrDataUrl) => {
    const nameField = Object.entries(participant)
      .find(([key]) => !['id', 'createdAt'].includes(key));
    const participantName = nameField ? nameField[1] : 'Participant';
    
    // Get event organiser name or use VINQR as fallback
    const organiserName = getEventOrganiser() || 'VINQR';
    
    // Find email field in participant data (case-insensitive)
    const emailField = Object.entries(participant)
      .find(([key]) => key.toLowerCase().includes('email') || key.toLowerCase().includes('mail'));
    const recipientEmail = emailField ? emailField[1] : '';
    
    const subject = `QR Code for ${participantName}`;
    const body = `Hello!\n\nPlease find the QR code for ${participantName}.\n\nScan this QR code during the event to mark attendance.\n\nBest regards,\n${organiserName}\n\nusing VINQR system`;
    
    // Create modal with share options
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 1rem;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;
    
    content.innerHTML = `
      <h3 style="margin: 0 0 1rem; color: #447582; font-size: 1.5rem;">Share QR Code</h3>
      <img src="${qrDataUrl}" style="width: 100%; border-radius: 0.5rem; margin-bottom: 1.5rem; border: 2px solid #e5e7eb;" />
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <a id="emailBtn" href="mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}" 
           style="display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1.25rem; background: #447582; color: white; text-decoration: none; border-radius: 0.5rem; font-weight: 500; transition: all 0.2s;"
           onmouseover="this.style.background='#0D3E38'; this.style.transform='translateY(-2px)'"
           onmouseout="this.style.background='#447582'; this.style.transform='translateY(0)'">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m2 7 10 6 10-6"/>
          </svg>
          Email QR Code${recipientEmail ? ' to ' + recipientEmail : ''}
        </a>
        <a href="https://wa.me/?text=${encodeURIComponent(`QR Code for ${participantName}`)}" target="_blank"
           style="display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1.25rem; background: #25D366; color: white; text-decoration: none; border-radius: 0.5rem; font-weight: 500; transition: all 0.2s;"
           onmouseover="this.style.background='#128C7E'; this.style.transform='translateY(-2px)'"
           onmouseout="this.style.background='#25D366'; this.style.transform='translateY(0)'">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          WhatsApp
        </a>
        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                style="padding: 0.875rem 1.25rem; background: #f3f4f6; color: #374151; border: none; border-radius: 0.5rem; font-weight: 500; cursor: pointer; transition: all 0.2s;"
                onmouseover="this.style.background='#e5e7eb'"
                onmouseout="this.style.background='#f3f4f6'">
          Close
        </button>
      </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Add click handler to email button
    const emailBtn = content.querySelector('#emailBtn');
    if (emailBtn) {
      emailBtn.addEventListener('click', () => {
        setTimeout(() => cleanup(), 500);
      });
    }
    
    const cleanup = () => {
      if (modal.parentElement) {
        modal.remove();
      }
    };
    
    // Remove modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cleanup();
      }
    });
    
    // Close button cleanup
    const closeBtn = content.querySelector('button');
    if (closeBtn) {
      closeBtn.addEventListener('click', cleanup);
    }
  };

  const scrollToBottom = () => {
    participantsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="manage-participants">
      {showScrollDown && (
        <button className="scroll-to-bottom-btn" onClick={scrollToBottom}>
          <ArrowDown size={20} />
          <span>Scroll to View All</span>
        </button>
      )}
      
      <div className="section-header">
        <h2>Participants ({participants.length})</h2>
        <div className="header-actions">
          {participants.length > 0 && (
            <button className="btn-secondary" onClick={downloadAllQR}>
              <Download size={18} />
              Download All QR
            </button>
          )}
          <label className="btn-secondary" htmlFor="excel-upload-header">
            <Upload size={18} />
            Upload Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              style={{ display: 'none' }}
              id="excel-upload-header"
            />
          </label>
          <button className="btn-primary" onClick={() => setShowAddForm(true)}>
            <Plus size={18} />
            Add Participant
          </button>
        </div>
      </div>

      {/* Search Box */}
      {participants.length > 0 && (
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search participants by name, ID, or any field..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-main"
          />
          {searchQuery && (
            <button 
              className="clear-search" 
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}

      {showAddForm && (
        <div className="modal-overlay" onClick={cancelForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Participant' : 'Add Participant'}</h3>
              <button className="btn-icon" onClick={cancelForm}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="participant-form">
              <div className="form-group">
                <label>Team ID</label>
                <input
                  type="text"
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                  placeholder="e.g., T001"
                />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., John Doe"
                />
              </div>

              {customFields.map((field, index) => (
                <div key={index} className="custom-field-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Field Name</label>
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateCustomField(index, 'name', e.target.value)}
                      placeholder="e.g., Phone, Email"
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Value</label>
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                      placeholder="Enter value"
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-remove-field"
                    onClick={() => removeCustomField(index)}
                    title="Remove field"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn-add-field"
                onClick={addCustomField}
              >
                <Plus size={18} />
                Add Custom Field
              </button>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={cancelForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {participants.length === 0 ? (
        <div className="empty-state">
          <UserPlus size={64} />
          <h3>No Participants Yet</h3>
          <p>Add participants manually or upload an Excel file</p>
          <p className="excel-format-hint">
            Excel: First row = Column headers (e.g., Name, Phone, Email, etc.) | Rows below = Data
          </p>
        </div>
      ) : (
        <div className="participants-grid">
          {getFilteredParticipants().length === 0 ? (
            <div className="empty-state">
              <Search size={64} />
              <h3>No Results Found</h3>
              <p>No participants match your search query</p>
            </div>
          ) : (
            getFilteredParticipants().map(participant => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                isShared={sharedParticipants.has(participant.id)}
                onDownloadQR={downloadQR}
                onShare={handleShare}
                onToggleShared={toggleShared}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
          <div ref={participantsEndRef} />
        </div>
      )}

      {showScrollDown && (
        <button className="scroll-to-bottom-btn" onClick={scrollToBottom}>
          <ArrowDown size={24} />
        </button>
      )}
    </div>
  );
}

function ParticipantCard({ participant, isShared, onDownloadQR, onShare, onToggleShared, onEdit, onDelete }) {
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    generateQR();
  }, [participant]);

  const generateQR = async () => {
    try {
      // Complex QR with full participant data for uniqueness
      const qrData = JSON.stringify({
        id: participant.id,
        timestamp: Date.now(),
        ...participant
      });
      const url = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        errorCorrectionLevel: 'H'
      });
      
      // Add VINQR branding text in the center
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw QR code
        ctx.drawImage(img, 0, 0);
        
        // Add white background rectangle for text
        const textWidth = 80;
        const textHeight = 24;
        const x = (canvas.width - textWidth) / 2;
        const y = (canvas.height - textHeight) / 2;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(x, y, textWidth, textHeight);
        
        // Draw VINQR text
        ctx.fillStyle = '#447582';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('VINQR', canvas.width / 2, canvas.height / 2);
        
        setQrCode(canvas.toDataURL());
      };
      
      img.src = url;
    } catch (error) {
      console.error('QR generation error:', error);
    }
  };

  // Get all fields except internal ones
  const displayFields = Object.entries(participant).filter(
    ([key]) => !['id', 'createdAt'].includes(key)
  );

  return (
    <div className="participant-card">
      <div className="qr-container">
        {qrCode && <img src={qrCode} alt="QR Code" />}
        <div className="qr-id">ID: {participant.id}</div>
      </div>
      <div className="participant-info">
        {displayFields.map(([key, value]) => (
          <div key={key} className="info-row">
            <span className="info-label">{key}:</span>
            <span className="info-value">{value}</span>
          </div>
        ))}
      </div>
      <div className="card-actions">
        <button className="btn-icon" onClick={() => onDownloadQR(participant)} title="Download QR">
          <Download size={18} />
        </button>
        <div className="checkbox-wrapper" title="Mark as shared">
          <input
            type="checkbox"
            id={`shared-${participant.id}`}
            checked={isShared}
            onChange={(e) => {
              e.stopPropagation();
              onToggleShared(participant.id);
            }}
            onClick={(e) => e.stopPropagation()}
            className="shared-checkbox"
          />
          <label htmlFor={`shared-${participant.id}`} className="checkbox-label">Shared</label>
        </div>
        <button className="btn-icon btn-share" onClick={() => onShare(participant)} title="Share QR">
          <Share2 size={18} />
        </button>
        <button className="btn-icon" onClick={() => onEdit(participant)} title="Edit">
          <Edit2 size={18} />
        </button>
        <button className="btn-icon btn-danger" onClick={() => onDelete(participant.id)} title="Delete">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default ManageParticipants;
