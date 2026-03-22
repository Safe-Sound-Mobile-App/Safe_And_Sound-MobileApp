# Safe & Sound Mobile App

A comprehensive mobile application for monitoring and managing elderly care, connecting caregivers with elders through real-time health monitoring, location tracking, and notification features.

## 📱 Overview

Safe & Sound is a React Native mobile application built with Expo that enables caregivers to monitor the health status and location of elders in real-time. The app provides two distinct user roles: **Caregiver** and **Elder**, each with tailored features and interfaces.

### Key Features

- **Real-time Health Monitoring**: Track vital signs (Heart Rate, SpO2) and movement status (Gyroscope) with live updates
- **Location Tracking**: Monitor elder location with GPS tracking and map visualization
- **Health Status Alerts**: Visual indicators for Normal, Warning, Danger, and Not Wearing statuses
- **Profile Management**: Comprehensive user profile management for both roles
- **Notification System**: Real-time notifications for important events

## 🛠️ Tech Stack

### Core Technologies
- **React Native**: 0.81.5
- **Expo**: ^54.0.10
- **TypeScript**: ^5.8.3
- **React**: 19.1.0

### Key Dependencies
- **Firebase Services**:
  - `@react-native-firebase/app`: ^23.8.6
  - `@react-native-firebase/auth`: ^23.8.6
  - `@react-native-firebase/firestore`: ^23.8.6
  - `@react-native-firebase/messaging`: ^23.8.6
  - `@react-native-firebase/storage`: ^23.8.6
  - `@react-native-firebase/crashlytics`: ^23.8.6
  - `@react-native-firebase/functions`: ^23.8.6

- **Navigation**: `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`
- **UI Components**: `expo-linear-gradient`, `react-native-chart-kit`, `@expo/vector-icons`
- **Location**: `expo-location`: ^18.0.7
- **Notifications**: `expo-notifications`: ~0.32.16
- **Utilities**: `expo-clipboard`, `@react-native-async-storage/async-storage`

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher (or yarn)
- **Expo CLI**: Install globally with `npm install -g expo-cli`
- **EAS CLI** (for building): `npm install -g eas-cli`
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Safe_And_Sound-MobileApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Place `google-services.json` in the root directory (Android)
   - Place `GoogleService-Info.plist` in the root directory (iOS)
   - Ensure Firebase project is properly configured in Firebase Console

4. **Configure Environment Variables**
   - Firebase configuration files should be present:
     - `google-services.json` (Android)
     - `GoogleService-Info.plist` (iOS)

## ⚙️ Configuration

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable the following services:
   - Authentication (Email/Password, Google Sign-In)
   - Cloud Firestore
   - Cloud Messaging (FCM)
   - Cloud Storage
   - Cloud Functions

3. Download configuration files:
   - Android: `google-services.json`
   - iOS: `GoogleService-Info.plist`

4. Place configuration files in the project root

### Firestore Rules

Deploy Firestore security rules:
```bash
firebase deploy --only firestore:rules
```

Rules are defined in `firestore.rules` and ensure:
- Only authenticated users can access data
- Caregivers can only view elders they have relationships with
- Health data and location data are protected by relationship checks

## 📁 Project Structure

```
Safe_And_Sound-MobileApp/
├── src/
│   ├── App.tsx                 # Root component with navigation setup
│   ├── config/
│   │   └── firebase.ts         # Firebase configuration
│   ├── services/
│   │   ├── firestore.ts        # Firestore database operations
│   │   ├── auth.ts             # Authentication services
│   │   ├── messaging.ts        # Push notification services
│   │   └── location.ts         # Location tracking services
│   ├── pages/
│   │   ├── Authentication/
│   │   │   ├── general/        # General auth pages (SignIn, SignUp, etc.)
│   │   │   ├── caregiver/     # Caregiver-specific auth pages
│   │   │   └── elder/         # Elder-specific auth pages
│   │   ├── Main/
│   │   │   ├── caregiver/     # Caregiver main pages
│   │   │   │   ├── caregiverHomePage.tsx
│   │   │   │   ├── caregiverElderInfo.tsx
│   │   │   │   ├── CaregiverChatPage.tsx
│   │   │   │   └── ...
│   │   │   └── elder/         # Elder main pages
│   │   │       ├── elderHomePage.tsx
│   │   │       ├── ElderChatPage.tsx
│   │   │       └── ...
│   │   └── Settings/          # Settings pages
│   ├── global_style/          # Global stylesheets
│   ├── navigation/            # Navigation components
│   ├── header/               # Header components
│   └── assets/               # Images, icons, fonts
├── android/                  # Android native code
├── firestore.rules          # Firestore security rules
├── firestore.indexes.json   # Firestore indexes
├── app.json                 # Expo configuration
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🎯 Features by Role

### Caregiver Features

- **Elder Dashboard**: View all assigned elders with health status cards
- **Real-time Health Monitoring**: 
  - Heart Rate (BPM)
  - SpO2 (%)
  - Gyroscope Status (Normal/Fall)
  - Health status indicators (Normal/Warning/Danger/Not Wearing)
- **Elder Detail Page**: 
  - Detailed health information
  - Location tracking with map preview
  - Copy coordinates functionality
- **Notifications**: View and manage all notifications
- **Profile Management**: Edit caregiver profile

### Elder Features

- **Caregiver List**: View all assigned caregivers
- **Location Tracking**: Automatic location tracking (requires permission)
- **Emergency Button**: Send emergency alerts to all caregivers
- **Notifications**: View relationship requests and notifications
- **Profile Management**: Edit elder profile

## 🔄 Real-time Data Updates

The app uses Firestore real-time listeners to automatically update:

- **Health Data**: Status, Heart Rate, SpO2, Gyroscope status
- **Location**: Current GPS coordinates
- **Notifications**: New alerts and messages

Updates occur automatically without requiring page refresh or navigation.

## 📊 Health Status System

### Status Types

1. **Normal** (สีขาว)
   - All vital signs within normal range
   - Card background: White (#ffffff)

2. **Warning** (สีเหลือง)
   - Some vital signs outside normal range
   - Card background: Light Yellow (#ffcf77)

3. **Danger** (สีแดง)
   - Critical vital signs detected
   - Card background: Light Red (#fca5a5)
   - Gyroscope shows "Fall"

4. **Not Wearing** (สีขาวจาง)
   - Device not being worn
   - Card background: Faded White (#f3f4f6)
   - All values display as "-"
   - Charts show axes only (no data)

### Data Sources

Health data is retrieved from Firebase `healthData` collection:
- `sensorPayload.health.status`: Overall health status
- `sensorPayload.vitals.heartRate`: Heart rate in BPM
- `sensorPayload.vitals.spo2`: SpO2 percentage
- `aiPrediction.status`: AI-predicted status (fallback)

## 🗺️ Location Tracking

- **Automatic Tracking**: Elders' locations are tracked automatically when permission is granted
- **Update Frequency**: Location updates every 30 seconds
- **Map Display**: Location preview with coordinates
- **External Maps**: Tap to open location in Google Maps

## 📈 Charts and Graphs

- **Data Points**: Displays 7 latest values for Heart Rate and SpO2
- **Real-time Updates**: Charts update automatically when new data arrives
- **Data Source**: `healthData/{elderId}/records` subcollection
- **Fallback**: Shows axes only when status is "Not Wearing" or no data available

## 🚦 Running the App

### Development Mode

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run on web
npm run web
```

### Building for Production

#### Android (EAS Build)

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Build Android APK/AAB
eas build --platform android --profile production
```

#### iOS (EAS Build)

```bash
# Build iOS app
eas build --platform ios --profile production
```

### Local Build

```bash
# Android
npm run android

# iOS (macOS only)
npm run ios
```

## 🔐 Authentication

The app supports multiple authentication methods:

- **Email/Password**: Traditional email-based authentication
- **Google Sign-In**: OAuth authentication via Google

Users can register and sign in as either:
- **Caregiver**: For monitoring and managing elders
- **Elder**: For health tracking and communication

## 📱 Permissions

### Required Permissions

- **Location** (Elder role):
  - `ACCESS_FINE_LOCATION`
  - `ACCESS_COARSE_LOCATION`
  - `ACCESS_BACKGROUND_LOCATION` (optional)

- **Notifications**: For push notifications
- **Storage**: For profile images and media

## 🗄️ Database Structure

### Firestore Collections

- **users**: User profiles (caregivers and elders)
- **elders**: Elder-specific data (health status, location)
- **caregivers**: Caregiver-specific data
- **relationships**: Links between caregivers and elders
- **healthData**: Health monitoring data
  - `healthData/{elderId}`: Latest health data document
  - `healthData/{elderId}/records`: Historical health records
- **locations**: Location tracking data
- **chats**: Chat rooms between caregivers and elders
- **notifications**: User notifications
- **emergencyAlerts**: Emergency alert records

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   - Ensure all dependencies are installed: `npm install`
   - Clear cache: `expo start -c`
   - Rebuild native code: `npx expo prebuild --clean`

2. **Firebase Connection Issues**
   - Verify `google-services.json` and `GoogleService-Info.plist` are present
   - Check Firebase project configuration
   - Ensure Firestore rules are deployed

3. **Location Not Working**
   - Check device location permissions in Settings
   - Ensure `expo-location` is properly configured
   - Rebuild app after adding location permissions

4. **Real-time Updates Not Working**
   - Check Firestore rules allow read access
   - Verify user authentication status
   - Check console for Firestore errors

5. **Push Notifications Not Showing (Cloud Log Shows Success)**
   - **Permission**: On Android 13+, ensure "Notifications" is allowed in app Settings. Open app → Settings → Notifications (or system Settings → Apps → Safe & Sound → Notifications) and enable.
   - **Battery / Doze**: Some manufacturers (Xiaomi, Huawei, Oppo, Samsung, etc.) restrict background apps. Disable "Battery optimization" or "Battery saver" for Safe & Sound so the system can deliver FCM.
   - **Token**: The app refreshes the FCM token when it comes to foreground. If you reinstalled the app or cleared data, open the app once and stay on a screen for a few seconds so the token is saved; then test push again.
   - **Multiple notifications**: Each notification is sent with a unique tag so they don’t collapse. If some still don’t appear, check device notification settings for the app (sound, pop-up, lock screen).

## 📝 Scripts

- `npm start`: Start Expo development server
- `npm run android`: Run on Android device/emulator
- `npm run ios`: Run on iOS device/simulator (macOS only)
- `npm run web`: Run in web browser

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Authors

Safe & Sound Development Team

## 📞 Support

For support and questions, please contact the development team.

---

## 🔄 Recent Updates

### Version 1.0.0

- ✅ Real-time health data monitoring from Firebase
- ✅ Location tracking for elders
- ✅ Health status system (Normal/Warning/Danger/Not Wearing)
- ✅ Real-time updates without page refresh
- ✅ Profile management for both roles

---

**Built with ❤️ using React Native and Expo**
