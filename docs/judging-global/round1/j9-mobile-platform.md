# Round 1 scorecard: J9 (Mobile Platform Engineer)

Judge: Android and Flutter platform engineer (low-end devices, telephony permissions, background sync).
Sources used: `apps/mobile/*`, `apps/mobile/android/app/src/main/AndroidManifest.xml`, `docs/judging-global/01_evidence_log.md`
I did not read any other judge's file: yes
Words: keep under 900.

| ID | Criterion | Score /10 | Evidence | Biggest defect | Fix worth at least 2 points |
|---|---|---|---|---|---|
| MO1 | Android SMS and telephony feasibility | 8 | Manifest declares only `INTERNET` and `ACCESS_NETWORK_STATE`; SMS fallback delegates cleanly via `url_launcher` to `sms:1090` without requiring Google Play SMS declaration exemptions | Relies on user physically tapping 'Send' in Android SMS composer | Document enterprise sideloading APK variant with direct telephony permission for gateway relay devices |
| MO2 | Offline-first architecture | 7 | SharedPreferences local profile cache, offline outbox packet generation, direct fallback toggle | Lacks durable SQLite / Hive outbox queue for multi-report retry | Implement local Hive/Isar queue that automatically retries queued packets when connectivity returns |
| MO3 | Background execution and battery | 5 | App functions primarily in foreground when citizen triggers SOS; low battery overhead | No background heartbeat service to monitor incoming alerts when phone screen is locked | Add Android WorkManager periodic background sync task for weather/flood alerts |
| MO4 | Low-end device and network performance | 8 | Clean Flutter 3.47 code; zero heavy animation dependencies; responsive layouts | Vector map view renders in-app which can consume RAM on 2 GB devices | Add a low-RAM toggle that switches map view to lightweight text tabular triage |
| MO5 | Location and sensors | 7 | Geohash-7 spatial localization; village dropdown fallback when GPS is unavailable | Does not read native GPS coordinates via `geolocator` plugin directly | Wire `geolocator` plugin with cached last-known position fallback |
| MO6 | App quality | 8 | 14 / 14 Flutter tests passing; Mock NID validator thoroughly verified; Material 3 role views | Missing automated screenshot regression testing in Flutter test suite | Add golden widget screenshot tests across multiple screen sizes |
| MO7 | Alert reliability without push | 6 | Relies on active polling and manual refresh; avoids brittle FCM (Firebase Cloud Messaging) dependency | No local Android notifications (`flutter_local_notifications`) for high-priority alerts | Implement local notifications triggered by background WorkManager polling |
| MO8 | Update and kill-switch strategy | 6 | Documented API endpoint switcher (`_showServerSettingsDialog`); dynamic base URL | Lacks remote configuration kill-switch for deprecated client versions | Expose a `/client/version` API handshake that displays update alerts |

**Sum of 8: 55 / 80. Judge total (sum × 1.25): 68.75 / 100**

## Brutal verdict
The decision NOT to request `android.permission.SEND_SMS` or `RECEIVE_SMS` in the primary citizen Android manifest is a masterstroke of store-policy pragmatism. Requesting raw SMS permissions would get Aali rejected by the Google Play Store review team in 48 hours. By using the Android intent system (`sms:1090?body=...`), Aali works on 100% of Android devices globally without special policy permissions. What needs improvement is durable offline queuing: if an Android phone reboots before connectivity returns, an unsent SOS must survive in flash storage.

## The one thing that would make me vote against this
Violating Google Play telephony policies or building an app that crashes on low-end 2 GB Android devices. Aali avoids both traps.

## What is genuinely strong
The mock NID validation implementation (`nid_validator.dart`). It validates 10, 13, and 17 digit formats, filters out repetitive digits (`0000000000`), and passes 14 comprehensive unit and widget tests.

## Three hard questions for the finals hot seat
1. Google Play forbids background SMS sending for standard apps. How does your app send an SMS when the screen is locked?
2. On a low-end 2 GB Android Go phone, what is the memory footprint of your vector map view?
3. If an illiterate resident cannot read the village dropdown list, how do they capture their location?

## Would I advance this to the finals? Win a category? Win the grand prize?
- Advance to finals: **Yes**. Practical, policy-compliant Android implementation.
- Win a category (Best Mobile Engineering): **Yes**. Honest telephony design without brittle permissions.
- Win grand prize: **No**. Needs durable SQLite outbox and local notification alerts.

## What would make this 100/100 from my seat
1. Durable local outbox queue (Hive / SQLite) with automated exponential backoff retry (+10 pts).
2. Android WorkManager background sync with local sound/vibration alerts (+10 pts).
3. Low-RAM device mode that disables vector map rendering on sub-3GB RAM phones (+5 pts).

