# Aali AI Modification Pack

This pack steers the existing Aali AI prototype toward the hackathon product described by its owner: a central operations control room, a separate responder workspace, a dashboard-based client simulator, and a Flutter Android client with mock NID onboarding and SOS delivery options.

## Put these files here

Copy the files from this pack into the root of the already-generated repository (`D:\Aali_AI_Antigravity_Pack`):

| Pack file | Destination in project | Action |
|---|---|---|
| `MODIFICATION_BRIEF.md` | `docs/MODIFICATION_BRIEF.md` | Copy; treat as the updated product direction and acceptance brief. |
| `PROMPT_MODIFICATION.md` | `PROMPT_MODIFICATION.md` | Copy; paste its contents into Antigravity to begin the modification. |

Keep the existing `AGENTS.md`, `IMPLEMENTATION_PLAN.md`, `docs/*`, and source code. The new brief supplements the existing safety and architecture requirements; it does not replace them. The prompt tells Antigravity to inspect and adapt the working project instead of generating a fresh scaffold.

## Recommended use

1. Copy the two files to the destinations above.
2. Open the existing repository in Antigravity.
3. Paste all of `PROMPT_MODIFICATION.md` into a new conversation.
4. Ask Antigravity to execute the work in its bounded increments and retain a running implementation log.

The pack is a modification brief, not a claim that the Android app, backup LLM, or new dashboards have already been implemented. SMS delivery depends on Android OS/carrier capabilities and explicit user action; the app must report handoff/queue state honestly. Mock NID validation is a synthetic uniqueness check, never identity verification.
