# Aali AI — Resident Mobile Application (Flutter)

This directory contains the independent Flutter Android/iOS client for Aali AI residents.

## Features
- **Resident Onboarding & Mock NID Validation**:
  - Enforces 10 or 17 ASCII digits.
  - Rejects repetitive/identical digits.
  - SHA-256 hashed identifiers without transmitting plaintext NIDs.
  - Explicit disclaimer: *"Demo NID format check — not identity verification."*
- **3-Step Accessible SOS Submission**:
  - People count slider, urgency flags (trapped, elderly, medical, child), village selection.
  - Compact ASCII Disaster Packet generation (`<60` chars).
- **Durable Local Outbox & Explicit SMS Handoff**:
  - Offline queueing.
  - Explicit Android SMS Composer handoff (`sms:16604?body=...`).
  - No false claims of delivery until server/gateway acknowledgment.

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

*Note: If testing on an environment without local Flutter SDK binaries installed in PATH, use the in-dashboard **Resident Client Simulator** at `/simulator` in the Web app, which executes the exact same NID validation, packet encoding, and offline handoff logic.*

