# JOXIQ AI Cross-Platform Mobile Application (React Native & Expo)

This folder contains the complete, production-ready React Native Expo source code for the **JOXIQ AI** mobile application supporting **Android, iOS, and Tablets**.

## Architecture & Integration
- **Shared Firebase Project**: Connects to the exact same Firebase Authentication and Firestore database as the JOXIQ AI Web application (`joxiq-ai`).
- **Unified Accounts**: Users can sign up on web and log in on mobile (or vice versa) with instant profile and chat history synchronization.
- **Features Included**:
  - ChatGPT-like real-time chat interface
  - Email/password authentication with persistent login sessions (`AsyncStorage`)
  - Dark/Light theme switching
  - Settings, Voice Reading (TTS) simulation, and Live Search toggles
  - Subscription management & payment-ready structure

---

## Getting Started

1. **Prerequisites**: Install [Node.js](https://nodejs.org/) and [Expo CLI](https://docs.expo.dev/get-started/installation/).
2. **Navigate to the mobile app folder**:
   ```bash
   cd mobile-app
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Run the development server**:
   ```bash
   npx expo start
   ```
   - Scan the QR code with **Expo Go** on your Android or iOS device, or press `a` for Android Emulator / `i` for iOS Simulator.

---

## Publishing to Google Play Store & Apple App Store

This project is fully prepared for cloud compilation and store deployment using **EAS Build** (Expo Application Services):

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```
2. **Login to Expo**:
   ```bash
   eas login
   ```
3. **Configure EAS Build**:
   ```bash
   eas build:configure
   ```
4. **Build for Android (Google Play Store AAB)**:
   ```bash
   eas build --platform android --profile production
   ```
5. **Build for iOS (Apple App Store IPA)**:
   ```bash
   eas build --platform ios --profile production
   ```
