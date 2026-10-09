# Aali AI — Resident Mobile Application (Flutter)

This directory contains the independent Flutter Android/iOS client for Aali AI residents.

## Features
- **Resident Onboarding & Mock NID Validation**:
  - Enforces 10 or 17 ASCII digits.
  - Rejects repetitive/identical digits.
  - Sends the mock NID only to the configured Aali API registration endpoint for server-side keyed hashing and uniqueness enforcement; the app does not retain it in its local outbox. This is not identity verification.
  - Explicit disclaimer: *"Demo NID format check — not identity verification."*
- **3-Step Accessible SOS Submission**:
  - People count slider, urgency flags (trapped, elderly, medical, child), village selection.
  - Compact ASCII Disaster Packet generation (`<60` chars).
- **Durable Local Outbox & Explicit SMS Handoff**:
  - API SOS submission with server acknowledgment and `clientReportId` idempotency.
  - Offline queue stored in SharedPreferences, with a user-triggered retry.
  - Explicit Android SMS Composer handoff (`sms:16604?body=...`).
  - The SMS composer opening is only a user handoff; it does not mean the SMS was sent or delivered.

## API connection
- Android emulator default: `http://10.0.2.2:3001/api/v1`.
- Override for a physical test device or other host with `--dart-define=AALI_API_URL=http://<host-ip>:3001/api/v1` and make sure the development API is reachable from that device.
- Resident registration stores only a keyed hash of the mock NID at the API. Duplicate registration returns a conflict and is not treated as a successful login.
- SOS packets use the same CRC-16/CCITT-FALSE packet checksum as the API. The API revalidates the packet and compares its people/urgency fields before storing it.
- This repository currently contains Flutter source and tests but no generated Android/iOS platform scaffold. Run `flutter create --platforms=android .` from this directory with Flutter installed before the first Android build, then verify network permission and local HTTP settings for your device.

## Prerequisites & Installation

To run this application, ensure Flutter is installed on your development machine:
1. Install Flutter SDK: [https://docs.flutter.dev/get-started/install](https://docs.flutter.dev/get-started/install)
2. Verify installation:
   ```bash
   flutter doctor
   ```
3. Fetch dependencies:
   ```bash
   cd apps/mobile
   flutter pub get
   ```
4. Run tests:
   ```bash
   flutter test
   ```
5. Run on Android emulator or connected device:
   ```bash
   flutter run
   ```

*Note: If testing without Flutter installed, use the authenticated **Resident Simulator** workspace in the web app. It shares the API registration, packet validation and SOS acknowledgment contract, with browser-specific queue and handoff behavior.*

