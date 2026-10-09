# Aali AI — Resident Mobile Application (Flutter)

This directory contains Aali AI's Flutter Android resident and field-operations client. The Authority command room remains a web workspace.

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
- **Role workspaces on Android**:
  - Resident: mock NID format check and three-step SOS with a local outbox.
  - Responder: authenticated incident queue, deterministic evidence, duplicate review and acknowledgment of a boat recommendation. Acknowledgment does not dispatch a boat.
  - Volunteer: authenticated village water reading form. Readings are volunteer reports, not official gauge observations.
  - The selected mode is checked against the authenticated API role. The API remains authoritative for all permissions.
- Material 3 light theme with role-specific workspaces, accessible status/error feedback, loading/empty states and large-screen-friendly cards.

## API connection
- Android emulator default: `http://10.0.2.2:3001/api/v1`.
- Override for a physical test device or other host with `--dart-define=AALI_API_URL=http://<host-ip>:3001/api/v1` and make sure the development API is reachable from that device.
- Resident registration stores only a keyed hash of the mock NID at the API. Duplicate registration returns a conflict and is not treated as a successful login.
- SOS packets use the same CRC-16/CCITT-FALSE packet checksum as the API. The API revalidates the packet and compares its people/urgency fields before storing it.
- An Android Gradle scaffold is present in `android/`. Run `flutter pub get`, then `flutter run`. The app includes server settings shortcuts for emulator, USB/localhost and LAN. For a physical device, set a reachable API URL; API port `3001` is separate from MySQL port `3306`.

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

