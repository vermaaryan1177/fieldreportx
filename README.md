# FieldReportX
---

A mobile field inspection and reporting platform built with React Native and Expo.

---

## Getting Started
### Prerequisites
- Node.js 18+
- Expo Go app on your device, or Xcode/Android Studio for a simulator

### Install dependencies
```bash
npm install
```
### Set up environment variables
Create a `.env` file in the project root:

```env
EXPO_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
EXPO_PUBLIC_GROQ_API_KEY="your-groq-api-key"
```

### Start the app
```bash
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) or press `i` for iOS simulator / `a` for Android emulator.

> **Note:** Some features require a native development build (Google Mobile Ads, background tasks). Run `npx expo run:ios` or `npx expo run:android` to build a full development binary.

---

## Features
### Reports
- Create reports from system or custom templates
- Fill structured sections with typed fields
- Auto-save drafts at any point
- Submit, archive, and export reports as PDF
- Compare two reports side-by-side to track changes over time
- Completion scoring with section-level breakdowns
### Templates
- Browse a library of built-in system templates
- Build custom templates from scratch using a two-step wizard
- Add, remove, rename, and reorder sections
- Borrow sections from other templates (with multiple-copy support)
- Import templates from JSON or YAML files
### Field Types
- **Text** — keyboard input with optional voice dictation (Groq Whisper)
- **Number** — numeric input
- **Checkbox** — yes/no toggle
- **Select** — option list defined in the template
- **Photo** — camera or gallery, with freehand annotation, GPS tagging, and gyroscope metadata
- **Signature** — full-screen SVG signature pad
- **Route** — live GPS route tracker with map, speed stats, and manual stop markers
- **Accelerometer** — vibration sampling with RMS, peak, and average readings
- **Stopwatch** — multi-trial reaction time measurement
- **Timer** — session duration tracker
- **Joint Angle** — AI-assisted body joint angle measurement from a photo
### Organisations
- Create and manage organisations
- Invite members by email; accept or decline invites in-app
- Share reports and templates across the organisation
- Role-based access (Admin, Inspector, Viewer)
### Notifications
- In-app notification centre with unread/read tabs
- Organisation invite notifications with one-tap accept/decline
- New organisation template alerts
- Scheduled 2-hourly OS push reminder for in-progress reports
### Sensors & Hardware
- GPS location capture for photo geotagging and route tracking
- Accelerometer sampling for vibration analysis
- Gyroscope metadata on photos (pitch, roll, azimuth)
- Microphone recording with automatic speech-to-text transcription
### Background Tasks
- Automatic archiving of stale drafts (inactive for 7+ days)
- Background polling for new organisation templates
### Other
- Offline-first with SQLite local cache
- Sidebar with organisation switcher and notification badge
- Permissions onboarding screen on first launch
- Settings: data export, storage usage, sign out
