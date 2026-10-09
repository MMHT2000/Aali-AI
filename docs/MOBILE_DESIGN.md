# Android app design and access model

## Design direction

The old mobile screen used a dark admin-console treatment for the resident SOS flow: multiple dark cards, tiny helper text and unrelated blackout controls above onboarding. The redesign uses a calm Material 3 light surface for resident and field tasks, reserving strong red/amber colors for urgency and simulation states. A constrained content column keeps forms and incident cards readable on large phones/tablets; input controls and cards wrap on compact screens.

Flutter's current guidance describes Material Design as the app's design system and calls for layouts to respond to screen size, orientation and available input modes. The app uses `ColorScheme.fromSeed`, Material 3 controls, clear cards, explicit loading/error/empty states and a maximum content width. See [Material Design for Flutter](https://docs.flutter.dev/ui/design/material), [adaptive and responsive design](https://docs.flutter.dev/ui/adaptive-responsive), and [Material 3 color roles](https://docs.flutter.dev/release/breaking-changes/new-color-scheme-roles).

## Android roles

- **Resident:** mock NID format check, accessible three-step SOS, local queued state and explicit SMS composer handoff.
- **Responder:** authenticated incident list, visible source/rule evidence, human duplicate review and acknowledgment of rescue suggestions. The app never dispatches a boat.
- **Volunteer:** authenticated village water-reading submission. The API labels it as volunteer evidence, not an official gauge observation.

Authority approvals, system administration and recovery coordination stay in their existing web workspaces. The Android role choice is a sign-in affordance only: the user role from `/auth/login` must match the selected mode, and the API role guard remains authoritative for every action.

## Operational wording and safety

- Mock NID is a format/uniqueness demo, not identity verification.
- A field reading is a volunteer report, not an official observation.
- Rescue recommendation acknowledgment does not dispatch an asset.
- An opened SMS composer is a user handoff, not proof the SMS was sent or delivered.
- Resident SOS data stays in the local outbox until API acknowledgment; blackout and D2C controls remain visibly simulated.
