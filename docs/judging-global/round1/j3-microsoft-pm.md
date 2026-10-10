# Round 1 scorecard: J3 (Microsoft-style Product Manager)

Judge: Public sector, enterprise readiness, procurement and compliance specialist.
Sources used: `apps/api/src/common/auth/*`, `apps/api/src/modules/audit/*`, `apps/api/src/authorization.e2e.spec.ts`, `docs/SECURITY_PRIVACY.md`
I did not read any other judge's file: yes
Words: keep under 900.

| ID | Criterion | Score /10 | Evidence | Biggest defect | Fix worth at least 2 points |
|---|---|---|---|---|---|
| MS1 | Buyer and procurement path | 5 | Named buyers: Ministry of Disaster Management (MoDMR), BTRC, BDRCS, Upazila administration | Lacks procurement budget codes and tender classification | Map exact Bangladesh Public Procurement Rules (PPR) line item and DDM budget codes |
| MS2 | Enterprise readiness | 7 | Comprehensive RBAC (AUTHORITY, RESPONDER, VOLUNTEER, RESIDENT); immutable audit log entity | No multi-tenant data isolation by district/upazila in DB schema | Add tenant/district partitioning column across all incident and audit tables |
| MS3 | Compliance and privacy by design | 7 | Keyed NID masking, phone number log redaction, synthetic fixture guarantees | Lacks formal GDPR / Bangladesh Cyber Security Act data retention policy | Add automated TTL/purge policy for citizen PII after 90-day recovery cycle |
| MS4 | Integration and interoperability | 7 | REST API with OpenAPI/Swagger docs (`/api/docs`); BMD CAP RSS feed ingest service | Closed export format; lacks Common Alerting Protocol (CAP) 1.2 XML output | Expose compliant CAP 1.2 XML alert feed endpoint for national relay |
| MS5 | Reliability and operations | 8 | MariaDB persistence with TypeORM migrations; 311 req/s benchmark; graceful DB retry loop | Single database instance; lacks documented multi-region failover plan | Document high-availability MySQL replication and read-replica architecture |
| MS6 | Total cost of ownership | 6 | Open-source stack (Node/React/MariaDB); $0.0002 per SOS AI inference; commodity servers | Annual infrastructure, SMS gateway, and 24/7 staff support costs unmodeled | Provide 3-year TCO model covering SMS volume tariffs and hosting |
| MS7 | Admin and operations UX | 7 | Full role management, situation overview, duplicate merge/split review, boat assignment review | Lacks system configuration UI to adjust sensor alert thresholds without code | Provide an Authority-only Admin Settings screen for river danger levels |
| MS8 | Change management | 6 | Role-specific views for Field Responders and Volunteer Scouts align with real SOPs | No institutional training manual or tabletop simulation curriculum | Create standard operating procedure (SOP) quick-reference cards for control room operators |

**Sum of 8: 53 / 80. Judge total (sum × 1.25): 66.25 / 100**

## Brutal verdict
Aali AI is unusually well-engineered for an emergency hackathon prototype. The role-based access control is real, enforced by NestJS guards (`RolesGuard`) and verified by dedicated E2E tests, rather than mocked in the UI. The immutable audit trail logs every critical action (`APPROVE_WARNING`, `BOAT_DISPATCH_PROPOSAL_ACCEPTED`, `RECORD_AID_DELIVERY`). What prevents this from signing an enterprise government contract tomorrow is the lack of multi-district tenant isolation and formal public sector procurement modeling.

## The one thing that would make me vote against this
Selling a life-critical system without a strict audit trail and role boundaries. Aali AI satisfies this: operators cannot perform actions without authenticated audit logging.

## What is genuinely strong
The audit logging subsystem (`AuditService` and `AuditLog` entity). Every merge, split, dispatch approval, and relief distribution is written to an immutable log with actor ID, timestamp, and before/after diffs.

## Three hard questions for the finals hot seat
1. Who signs the purchase order in Bangladesh—the Deputy Commissioner (DC), the Ministry of Disaster Management, or the BTRC?
2. If two adjacent districts (Feni and Noakhali) deploy Aali simultaneously, how do you prevent responders in Feni from seeing private citizen data in Noakhali?
3. What is the total operating cost per district per year, including commercial SMS short-code charges?

## Would I advance this to the finals? Win a category? Win the grand prize?
- Advance to finals: **Yes**. Exceptional operational maturity and RBAC discipline.
- Win a category (Best Enterprise / Public Sector): **Yes**. Solid audit and role control foundations.
- Win grand prize: **No**. Needs multi-tenancy and institutional procurement packaging.

## What would make this 100/100 from my seat
1. Multi-tenant database architecture supporting isolated district domains (+10 pts).
2. Two-way Common Alerting Protocol (CAP) 1.2 XML export endpoint (+10 pts).
3. Authority threshold configuration console to calibrate river alert parameters (+10 pts).

