# VINQR - Attendance Tracker

A Progressive Web App (PWA) for managing attendance using QR codes. Works completely offline!

## Features

✅ **Participant Management**
- Add participants with Team ID and Name
- Auto-generate unique QR code for each participant
- Download individual or bulk QR codes
- Edit and delete participants

✅ **QR Code Scanning**
- Real-time QR code scanning using device camera
- Works offline (no internet required)
- Audio feedback on successful scan
- Instant attendance marking

✅ **Attendance Reports**
- Real-time attendance statistics
- Filter by All/Present/Absent
- View attendance time for each participant
- Export reports as CSV

✅ **Event Management**
- Set custom event names
- Clear attendance for new events
- Backup/restore data as JSON
- Reset all data option

✅ **Offline Capable**
- Works without internet connection
- Data stored locally in browser
- Perfect for areas with limited connectivity
- Install as app on mobile devices

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Usage

### 1. Add Participants
- Go to "Manage" tab
- Click "Add Participant"
- Enter Team ID and Name
- QR code is automatically generated

### 2. Download QR Codes
- Click download icon on individual participant cards
- Or use "Download All QR" to get all codes at once
- Send QR codes to participants via email/WhatsApp

### 3. Mark Attendance
- Go to "Scan QR" tab
- Click "Start Scanning"
- Point camera at participant's QR code
- Attendance is marked instantly (works offline!)

### 4. View Reports
- Go to "Report" tab
- See real-time statistics
- Filter by present/absent
- Download CSV report

### 5. Manage Events
- Go to "Settings" tab
- Set event name
- Clear attendance for new event
- Backup/restore data

## Technology Stack

- **React** - UI framework
- **Vite** - Build tool
- **html5-qrcode** - QR code scanning
- **qrcode** - QR code generation
- **PWA** - Offline support
- **LocalStorage** - Data persistence

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari (iOS 11.3+)
- Any modern browser with camera access

## Data Storage

All data is stored locally in your browser's localStorage:
- Participants list
- Attendance records
- Event settings

**Note:** Maximum recommended participants: 300

## Security & Privacy

- No data sent to any server
- Everything runs locally on your device
- No user tracking or analytics
- Your data stays on your device

## Offline Usage

The app works completely offline:
1. Load the app once while online
2. Install as PWA (Add to Home Screen)
3. Use anywhere without internet
4. Perfect for remote locations or offline events

## Export/Import Data

- **Export:** Backup your data as JSON file
- **Import:** Restore participants from backup
- Useful for transferring data between devices

## Troubleshooting

**Camera not working?**
- Allow camera permissions in browser
- Ensure HTTPS (required for camera access)
- Try different browser

**QR code not scanning?**
- Ensure good lighting
- Hold camera steady
- Make sure QR code is not damaged

**Data disappeared?**
- Check if localStorage is cleared
- Import from backup file if available
- Data persists unless manually cleared

## License

MIT License - Free to use and modify

## Support

For issues or questions, create an issue in the repository.

---

Built with ❤️ for seamless offline attendance tracking
