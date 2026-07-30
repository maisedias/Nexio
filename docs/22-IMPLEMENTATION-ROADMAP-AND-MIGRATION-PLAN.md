# Nexio Implementation Roadmap and Migration Plan

Version: 1.0  
Status: Official  
Authority Level: Implementation Sequencing, Migration and Delivery Planning Standard  
Applies To: Web, Android, Supabase, Local Storage, Synchronization, UI, Design System, Accessibility, Security, Privacy, Providers, Analytics, Assistant, Advertising, Testing, Deployment, Support, Compliance and Documentation

---

# Purpose

This document defines the official implementation roadmap and migration plan for Nexio.

It converts the architectural specifications in `docs/00` through `docs/21` into an ordered delivery program.

It establishes:

- Current-state assessment
- Target-state definition
- Implementation priorities
- Workstreams
- Dependencies
- Migration phases
- Milestones
- Release increments
- Repository changes
- Database changes
- Local-storage changes
- Android changes
- Provider changes
- Documentation changes
- Test requirements
- Rollback and recovery requirements
- Acceptance gates
- Ownership
- Evidence
- Technical-debt treatment
- AI-assisted implementation rules

The objective is to move Nexio from its current implementation toward the complete target architecture without:

```text
Breaking existing Web functionality

Corrupting financial data

Losing local pending operations

Breaking Android publication

Creating owner-isolation defects

Introducing inaccessible workflows

Creating undocumented provider behavior

Attempting a single uncontrolled rewrite
```

---

# Relationship with Other Documents

This roadmap operationalizes:

```text
docs/00-FOUNDATION.md
docs/01-ARCHITECTURE.md
docs/02-DESIGN-SYSTEM.md
docs/03-DESKTOP.md
docs/04-TABLET.md
docs/05-MOBILE.md
docs/06-DATA-MODEL.md
docs/07-SECURITY.md
docs/08-OFFLINE-AND-SYNC.md
docs/09-TESTING.md
docs/10-DEPLOYMENT-AND-OPERATIONS.md
docs/11-INTERNATIONALIZATION-AND-CONTENT.md
docs/12-ASSISTANT-AND-AI.md
docs/13-PRIVACY-AND-DATA-GOVERNANCE.md
docs/14-ACCESSIBILITY.md
docs/15-PERFORMANCE-AND-RELIABILITY.md
docs/16-ANALYTICS-AND-EXPERIMENTATION.md
docs/17-API-AND-INTEGRATIONS.md
docs/18-BACKUP-RESTORE-AND-DISASTER-RECOVERY.md
docs/19-ENGINEERING-GOVERNANCE-AND-CHANGE-MANAGEMENT.md
docs/20-SUPPORT-AND-USER-OPERATIONS.md
docs/21-COMPLIANCE-LEGAL-AND-STORE-READINESS.md
```

This roadmap does not replace those requirements.

It defines the order in which they should become enforceable in the repository and Product.

---

# Roadmap Authority

When implementation order is uncertain, use the following authority hierarchy:

```text
1. Financial correctness

2. Owner isolation and Security

3. Data durability and recovery

4. Existing Production continuity

5. Privacy and deletion

6. Accessibility

7. Synchronization reliability

8. Platform stability

9. Performance

10. New feature breadth

11. Visual polish
```

Visual redesign must not precede unresolved financial or owner-safety defects when the same resources are required.

---

# Current Repository Baseline

The known repository contains:

```text
.gitignore
README.md
LICENSE
package.json
package-lock.json
app.js
index.html
styles.css
nexio-v2.css
i18n.js
supabase-config.js
supabase-schema.sql
capacitor.config.ts
vercel.json
mobile-capacitor.js
PLAY_STORE_LISTING.md
CAPACITOR_ANDROID_BUILD.md
politica-de-privacidade.html
excluir-conta.html
android/
android-web/
capacitor-overrides/
css/
js/
docs/
```

Relevant modular areas include:

```text
js/core/categories.js
js/core/finance.js
js/core/goals.js
js/core/notifications.js
js/core/profiles.js
js/core/reports.js
js/core/storage.js
js/core/transactions.js
js/core/utils.js

js/ui/mobile.js
js/ui/shared-ui.js
js/ui/tablet.js
js/ui/desktop.js

css/mobile.css
css/tablet.css

docs/design-system/
```

---

# Current-State Characteristics

The current implementation appears to contain a combination of:

```text
Legacy root-level application logic

Newer modular JavaScript files

Multiple CSS generations

Web and Android-specific assets

Capacitor integration

Supabase configuration and schema

Documentation already describing a more mature target architecture
```

This creates a transitional architecture.

The roadmap must therefore support:

```text
Legacy behavior preservation

Incremental module extraction

Progressive UI migration

Schema compatibility

Android compatibility

Controlled removal of duplicate code
```

---

# Current-State Risks

Potential current-state risks to investigate before broad implementation include:

```text
Duplicated logic between app.js and js/core/

Duplicated responsive behavior between root CSS and css/

Unclear source of truth between styles.css and nexio-v2.css

Potential divergence between android-web/ and Web Production files

Direct provider or Supabase access from UI code

Incomplete owner scoping

Implicit local-storage schema

Insufficient operation identity for synchronization

Unclear migration history for supabase-schema.sql

Documentation ahead of implementation

Unverified Android permission and manifest state

Unverified Advertising configuration

Unverified Account deletion completeness
```

These are investigation targets, not confirmed defects.

---

# Baseline Assessment Requirement

Before modifying a subsystem, implementation must determine:

```text
Current files

Current runtime entry point

Current source of truth

Current data model

Current tests

Current Production behavior

Current Android behavior

Current provider behavior

Current documentation coverage
```

Do not redesign based only on file names.

---

# Target State

The target Nexio implementation should provide:

```text
Explicit Domain model

Exact Money handling

Explicit Currency

Owner-scoped persistent data

Durable local-first commands

Idempotent synchronization

Stable operation ledger

Versioned database migrations

Versioned local-storage migrations

Clear provider Adapters

Platform-specific UI shells

Shared Design System

Accessible interaction

Observable Production behavior

Functional deletion

Tested recovery

Governed releases
```

---

# Migration Philosophy

## Incremental Migration

Nexio should evolve through controlled increments.

Preferred:

```text
Existing safe behavior

↓

Characterization tests

↓

New contract

↓

Compatibility Adapter

↓

Incremental migration

↓

Validation

↓

Old path removal
```

Avoid:

```text
Delete existing application

↓

Rewrite everything

↓

Attempt first complete release
```

---

## Preserve Production Continuity

Each phase should leave Nexio in a deployable or recoverable state.

A branch that remains unusable for an extended period creates:

- Integration risk
- Migration drift
- Security-patch delay
- Android release difficulty
- Review overload

---

## Preserve Existing User Data

Migration must not assume that users can recreate:

- Accounts
- Transactions
- Categories
- Goals
- Preferences
- Pending operations
- Attachments

Persistent data requires explicit migration or compatibility.

---

## Preserve Operation Identity

Any financial operation moving between old and new systems must retain or receive a stable identity.

Do not:

- Create a second operation during migration
- Replay historical commands blindly
- Duplicate Transfers
- Assign new identities after timeout

---

## Preserve Owner Scope

Migration code must never merge data from:

- Different authenticated owners
- Previous sessions
- Browser profiles
- Android installations
- Test and Production environments

---

## Add Safety Before Complexity

Before introducing:

- Assistant actions
- Advanced Analytics
- Advertising personalization
- Additional providers
- Automated imports

implement:

- Owner boundaries
- Exact Money
- durable operations
- deletion
- recovery
- tests

---

## Contract Before Replacement

Before replacing an implementation, define the target contract.

Examples:

```text
TransactionRepository

SyncQueueRepository

Money

Currency

SupportDiagnosticsService

NotificationAdapter

AnalyticsAdapter

AssistantProvider
```

---

## Compatibility Has an Expiration

Compatibility code requires:

```text
Owner

Purpose

Start version

Removal condition

Expiration

Monitoring
```

---

## Derived Data Is Rebuildable

Prefer recomputing:

- Balances
- Report totals
- Goal progress
- Search indexes
- Cached charts

rather than treating legacy cached values as canonical.

---

## Migration Must Be Observable

Each migration should expose:

```text
Started

Progress

Completed

Failed

Paused

Rolled back

Requires review
```

---

## Migration Must Be Recoverable

For persistent changes, define:

- Backup
- Restore point
- Current-state preservation
- Resume
- Corrective migration
- Rollback limitations

---

# Roadmap Planning Principles

## Deliver Safety Foundations First

The first phases should establish:

```text
Repository truth

Financial invariants

Owner isolation

Migration infrastructure

Testing infrastructure

Deployment confidence
```

---

## Deliver Visible Improvements in Controlled Increments

Users should receive useful improvements throughout the roadmap.

Potential early visible improvements:

- Consistent navigation
- Correct responsive behavior
- Dark-theme fixes
- Better empty states
- Clear synchronization status
- Improved onboarding
- Accessible forms

These should ride on safe foundations.

---

## Avoid Parallel Changes to the Same Authority

Do not simultaneously rewrite:

- Transaction Domain logic in multiple branches
- Database and local schema independently
- Desktop and mobile navigation without shared contracts
- Synchronization protocol and operation identity in separate uncoordinated work

---

## Separate Canonical and Presentation Work

A visual change should not modify financial calculations.

A financial migration should not include an unrelated visual redesign.

---

## Measure Completion by Capability

A phase is complete when the capability works end to end.

Not merely when:

- A file was created
- A class exists
- A screen was styled
- A table was added
- Documentation was written

---

# Roadmap Governance Roles

Recommended roles:

```text
Roadmap Owner

Product Owner

Architecture Owner

Domain Owner

Data Owner

Security Owner

Privacy Owner

Accessibility Owner

Android Owner

Web Owner

Quality Owner

Operations Owner

Release Owner

Documentation Owner
```

One person may hold several roles, but each responsibility remains explicit.

---

# Roadmap Owner

Responsible for:

- Phase sequencing
- Dependency management
- Milestone status
- Scope protection
- Risk escalation
- Cross-workstream coordination
- Completion reporting

---

# Workstream Owner

Each workstream requires one owner responsible for:

- Backlog
- Design readiness
- Implementation
- Evidence
- Integration
- Cleanup
- Documentation

---

# Phase Approval

A phase should not begin broadly until:

- Prerequisites are met.
- Scope is defined.
- Owners are assigned.
- Acceptance criteria exist.
- Migration and rollback are understood.
- Required environments are available.

---

# Roadmap Statuses

Recommended status values:

```text
not_started

discovery

ready

in_progress

blocked

validation

rolling_out

completed

deferred

cancelled
```

---

# `not_started`

No active implementation.

---

# `discovery`

Current behavior, dependencies and risks are being investigated.

---

# `ready`

Requirements, owner, dependencies and acceptance criteria are available.

---

# `in_progress`

Implementation is active.

---

# `blocked`

A named dependency prevents progress.

Required:

```text
Blocker

Owner

Impact

Next action

Review date
```

---

# `validation`

Implementation exists and is under testing, review or controlled rollout.

---

# `rolling_out`

The phase is entering Production incrementally.

---

# `completed`

Acceptance criteria, cleanup and documentation are complete.

---

# `deferred`

Work remains valid but is intentionally postponed.

Reason and revisit condition are required.

---

# Roadmap Unit of Work

Recommended hierarchy:

```text
Program

Phase

Workstream

Milestone

Epic

Capability

Change

Task
```

---

# Program

The complete Nexio implementation effort.

---

# Phase

A major ordered delivery boundary.

Example:

```text
Phase 1 — Repository and Safety Baseline
```

---

# Workstream

A continuous area of responsibility.

Example:

```text
Data and Synchronization
```

---

# Milestone

A verifiable intermediate outcome.

Example:

```text
Every financial command has a stable operation ID.
```

---

# Epic

A group of related capabilities.

Example:

```text
Transaction lifecycle migration
```

---

# Capability

A user-visible or system-visible result.

Example:

```text
Create an Expense offline and synchronize it later without duplication.
```

---

# Change

A governed repository or configuration modification.

---

# Task

A bounded implementation action.

---

# Workstream Architecture

Recommended workstreams:

```text
WS-01 Repository and Build

WS-02 Domain and Financial Integrity

WS-03 Data Model and Database

WS-04 Local Storage and Synchronization

WS-05 Authentication and Owner Isolation

WS-06 Design System and Shared UI

WS-07 Desktop

WS-08 Tablet

WS-09 Mobile and Android

WS-10 Accessibility and Content

WS-11 Privacy, Deletion and Compliance

WS-12 Providers and Integrations

WS-13 Analytics and Experimentation

WS-14 Assistant and AI

WS-15 Advertising and Monetization

WS-16 Testing and Quality

WS-17 Deployment and Operations

WS-18 Backup and Recovery

WS-19 Support and Diagnostics

WS-20 Documentation and Governance
```

---

# WS-01 Repository and Build

Scope:

- Runtime entry points
- Module organization
- Build commands
- Environment configuration
- Dependency governance
- Android build
- Web deployment
- CI

Primary target:

```text
One explainable reproducible build system for Web and Android.
```

---

# WS-02 Domain and Financial Integrity

Scope:

- Money
- Currency
- Accounts
- Transactions
- Transfers
- Categories
- Goals
- Recurring rules
- Reports

Primary target:

```text
One canonical Domain interpretation independent of UI and provider.
```

---

# WS-03 Data Model and Database

Scope:

- Supabase/PostgreSQL schema
- Constraints
- RLS
- Functions
- Triggers
- Migration ledger
- Backfills
- Deletion ledger

Primary target:

```text
Versioned owner-safe canonical persistence.
```

---

# WS-04 Local Storage and Synchronization

Scope:

- Local schema
- Owner namespaces
- Operation queue
- Retry
- Idempotency
- Conflicts
- Checkpoints
- Offline states
- Recovery

Primary target:

```text
Confirmed local financial intent survives interruption and synchronizes without duplication.
```

---

# WS-05 Authentication and Owner Isolation

Scope:

- Sign-in
- Session
- Account switching
- Local owner boundaries
- RLS
- Realtime cleanup
- Provider identity reset
- Session revocation

Primary target:

```text
No state from one owner remains available to another owner.
```

---

# WS-06 Design System and Shared UI

Scope:

- Tokens
- Typography
- Colors
- Spacing
- Components
- Forms
- Dialogs
- Status states
- Theme
- Privacy mode

Primary target:

```text
One reusable accessible visual and interaction language.
```

---

# WS-07 Desktop

Scope:

- Desktop navigation
- Multi-column layouts
- Data tables
- Reports
- Productivity workflows
- Responsive transitions

Primary target:

```text
Efficient keyboard-friendly financial management on large screens.
```

---

# WS-08 Tablet

Scope:

- Intermediate navigation
- Split views
- Adaptive density
- Landscape and portrait
- Touch target balance

Primary target:

```text
A true adaptive experience rather than a stretched mobile layout.
```

---

# WS-09 Mobile and Android

Scope:

- Mobile navigation
- Compact layouts
- Android lifecycle
- Capacitor bridge
- Notifications
- File access
- Back behavior
- Deep links
- Play Store

Primary target:

```text
Reliable native-feeling Android operation with shared Domain behavior.
```

---

# WS-10 Accessibility and Content

Scope:

- Semantic structure
- Focus
- Keyboard
- Screen reader
- Large text
- Reduced motion
- Localization
- Error content
- Financial terminology

Primary target:

```text
Every critical journey remains perceivable, operable and understandable.
```

---

# WS-11 Privacy, Deletion and Compliance

Scope:

- Privacy settings
- Retention
- Account deletion
- Export
- Public policies
- Store declarations
- Consent or preference records
- Compliance evidence

Primary target:

```text
Public promises and Product behavior remain continuously aligned.
```

---

# WS-12 Providers and Integrations

Scope:

- Supabase
- Authentication provider
- Storage
- Notifications
- Import sources
- Export destinations
- Provider Adapters
- Webhooks
- Exit plans

Primary target:

```text
External providers remain replaceable, bounded and observable.
```

---

# WS-13 Analytics and Experimentation

Scope:

- Event registry
- Optionality
- Redaction
- Identity
- Experiment assignment
- Guardrails
- Dashboards

Primary target:

```text
Measurement without financial surveillance or hidden processing.
```

---

# WS-14 Assistant and AI

Scope:

- Assistant UI
- Context building
- Provider Adapter
- Structured output
- Proposals
- Confirmation
- History
- Safety
- Manual fallback

Primary target:

```text
Useful optional assistance without autonomous financial authority.
```

---

# WS-15 Advertising and Monetization

Scope:

- Advertising provider
- Placements
- Choice
- Publisher authorization
- Subscription planning
- Entitlements
- Store declarations

Primary target:

```text
Monetization that does not influence or obstruct financial functionality.
```

---

# WS-16 Testing and Quality

Scope:

- Static checks
- Unit tests
- Integration tests
- RLS tests
- Accessibility tests
- Android tests
- Migration tests
- Recovery tests
- CI gates

Primary target:

```text
Risk-based evidence for every critical Product guarantee.
```

---

# WS-17 Deployment and Operations

Scope:

- Environments
- CI/CD
- Feature Flags
- Monitoring
- Alerts
- Runbooks
- Releases
- Rollbacks
- Incident response

Primary target:

```text
Traceable controlled releases with measurable health and recovery.
```

---

# WS-18 Backup and Recovery

Scope:

- Database backups
- Attachment backups
- Restore
- Owner-level recovery
- Local recovery
- Disaster exercises
- Deletion reconciliation

Primary target:

```text
Verified recovery of the newest valid authorized state.
```

---

# WS-19 Support and Diagnostics

Scope:

- Support entry
- Safe diagnostics
- Error codes
- Case correlation
- User guidance
- Recovery escalation
- Knowledge Base

Primary target:

```text
Resolve problems without broad financial-data access.
```

---

# WS-20 Documentation and Governance

Scope:

- Specifications
- ADRs
- Migration notes
- Release records
- Registries
- Traceability
- AI implementation instructions

Primary target:

```text
Repository, behavior and documentation remain synchronized.
```

---

# Priority Classification

Recommended priority classes:

```text
P0 — Immediate safety

P1 — Required foundation

P2 — Core Product completion

P3 — Quality and growth

P4 — Optional expansion
```

---

# P0 — Immediate Safety

Includes credible issues involving:

- Cross-owner access
- Incorrect Money
- Duplicate financial mutation
- Data loss
- Broken Account deletion
- Public private-data access
- Exposed secrets
- Unrecoverable Production build

P0 work interrupts ordinary roadmap sequencing.

---

# P1 — Required Foundation

Includes:

- Repository baseline
- Domain invariants
- Owner isolation
- RLS
- Migration infrastructure
- Local durability
- Stable operation IDs
- Testing baseline
- Deployment traceability
- Backup readiness

---

# P2 — Core Product Completion

Includes:

- Transactions
- Transfers
- Accounts
- Goals
- Reports
- Responsive UI
- Android reliability
- Export
- Notifications
- Onboarding
- Accessibility completion

---

# P3 — Quality and Growth

Includes:

- Performance optimization
- Advanced Reports
- Support diagnostics
- Product Analytics
- Experiments
- Additional imports
- Provider expansion
- Refined onboarding

---

# P4 — Optional Expansion

Includes:

- Assistant mutation proposals
- Advanced AI features
- Personalized Advertising
- Subscription tiers
- Complex provider integrations
- Cross-platform expansion beyond current strategy

---

# Priority Rules

A P3 or P4 item must not displace unresolved P0 or required P1 work unless:

- The work directly funds or enables safety completion.
- A documented authority accepts the tradeoff.
- The safety risk remains controlled.

---

# Value and Risk Evaluation

Roadmap items should consider:

```text
User value

Financial-integrity impact

Security impact

Privacy impact

Accessibility impact

Reliability impact

Operational cost

Implementation complexity

Dependency count

Reversibility

Evidence availability
```

---

# Roadmap Dependency Types

Recommended:

```text
Technical dependency

Data dependency

Contract dependency

Provider dependency

Policy dependency

Store dependency

Operational dependency

Knowledge dependency
```

---

# Technical Dependency

Example:

```text
Mobile Transaction redesign depends on shared Transaction Form components.
```

---

# Data Dependency

Example:

```text
Reliable Reports depend on canonical Money and Transfer migration.
```

---

# Contract Dependency

Example:

```text
New synchronization implementation depends on stable operation and repository contracts.
```

---

# Provider Dependency

Example:

```text
Push Notifications depend on provider configuration and Android permission readiness.
```

---

# Policy Dependency

Example:

```text
Optional Analytics rollout depends on Privacy Policy and choice workflow.
```

---

# Store Dependency

Example:

```text
Advertising release depends on current Google Play declarations and publisher authorization.
```

---

# Operational Dependency

Example:

```text
Staged release depends on monitoring and kill switches.
```

---

# Knowledge Dependency

Example:

```text
Support rollout depends on current troubleshooting and escalation documentation.
```

---

# Dependency Record

Recommended fields:

```text
dependency_id

source_item

required_item

dependency_type

owner

status

risk

resolution

target_date
```

---

# Critical Dependency Chain

The central Nexio dependency chain should be:

```text
Repository baseline

↓

Domain invariants

↓

Owner-safe persistence

↓

Stable local operations

↓

Idempotent synchronization

↓

Reliable UI workflows

↓

Advanced providers and automation
```

---

# UI Dependency Chain

```text
Design tokens

↓

Shared primitives

↓

Shared financial forms

↓

Platform navigation

↓

Feature screens

↓

Visual refinement
```

---

# Android Dependency Chain

```text
Stable Web entry

↓

Capacitor configuration

↓

Native lifecycle controls

↓

Local persistence

↓

Permission handling

↓

Notifications and file access

↓

Store release
```

---

# Compliance Dependency Chain

```text
Actual data flow

↓

Provider and permission inventories

↓

User choices

↓

Privacy and deletion implementation

↓

Public policies

↓

Store declarations

↓

Release evidence
```

---

# Migration Phase Architecture

Recommended high-level phases:

```text
Phase 0 — Discovery and Production Safety

Phase 1 — Repository, Build and Test Baseline

Phase 2 — Domain and Data Foundations

Phase 3 — Owner Isolation, Local Storage and Synchronization

Phase 4 — Shared Design System and Core UI Migration

Phase 5 — Desktop, Tablet and Mobile Completion

Phase 6 — Android Production Hardening

Phase 7 — Privacy, Deletion, Support and Compliance

Phase 8 — Providers, Analytics and Notifications

Phase 9 — Assistant and AI

Phase 10 — Advertising and Monetization

Phase 11 — Optimization, Recovery and Operational Maturity
```

Phases may overlap only when dependencies remain respected.

---

# Phase 0 — Discovery and Production Safety

Primary objective:

```text
Understand current Production behavior and contain urgent risk.
```

Required outcomes:

- Current runtime entry identified
- Current Web deployment identified
- Current Android artifact path identified
- Current Supabase project and schema identified
- Current owner model identified
- Current local storage identified
- Current provider list identified
- Current Production secrets reviewed
- P0 defects triaged
- Backup status reviewed
- Release baseline tagged

---

# Phase 0 Investigation Inventory

Review:

```text
app.js

index.html

styles.css

nexio-v2.css

js/core/

js/ui/

css/

supabase-schema.sql

supabase-config.js

mobile-capacitor.js

capacitor.config.ts

android/

android-web/

capacitor-overrides/

vercel.json

package.json
```

---

# Phase 0 Required Evidence

```text
Repository map

Runtime flow diagram

Environment inventory

Provider inventory

Permission inventory

Current schema snapshot

Current local-storage snapshot

Current release version

Current policy URLs

Known-risk register
```

---

# Phase 0 Exit Criteria

```text
□ Current Production source is known.

□ Current Android source is known.

□ Current data authority is known.

□ Current user-data locations are known.

□ Immediate P0 risks have owners.

□ A recoverable baseline exists.

□ No broad rewrite begins without this evidence.
```

---

# Phase 1 — Repository, Build and Test Baseline

Primary objective:

```text
Create a reproducible and reviewable engineering foundation.
```

Required outcomes:

- Documented development setup
- Defined runtime entry point
- Environment schema
- Reproducible Web build
- Reproducible Android build
- Dependency lock validation
- Static checks
- Initial automated test command
- CI baseline
- Release metadata
- Secret scanning

---

# Phase 1 Repository Targets

Potential target structure:

```text
src/
  domain/
  application/
  infrastructure/
  platform/
  ui/

public/

android/

docs/

tests/

scripts/
```

The actual migration should consider the current build system.

A directory rewrite is not required merely to imitate this example.

---

# Phase 1 Entry-Point Decision

The implementation must decide whether:

```text
app.js remains temporary entry point

or

a modular application bootstrap becomes the new entry point
```

The decision requires:

- Runtime verification
- Android compatibility
- Vercel compatibility
- Incremental migration plan
- Rollback

---

# Phase 1 Test Baseline

Minimum initial tests should cover:

```text
Money representation

Transaction validation

Transfer invariant

Owner namespace

Application startup

Critical route rendering

Production build

Android build configuration
```

---

# Phase 1 Exit Criteria

```text
□ A clean repository checkout can be built.

□ Web build is reproducible.

□ Android build is reproducible.

□ Environment variables are documented.

□ Secrets are absent from source.

□ Required checks run automatically.

□ Release artifact maps to a source revision.

□ Current behavior has initial characterization tests.
```

---

# Phase 2 — Domain and Data Foundations

Primary objective:

```text
Create one canonical financial model and versioned remote persistence.
```

Required outcomes:

- Money contract
- Currency contract
- Account contract
- Transaction contract
- Transfer contract
- Goal contract
- Category contract
- Domain validation
- Database migration structure
- RLS baseline
- Owner relationships
- Derived-data distinction
- Financial golden dataset

---

# Phase 2 Money Migration

Investigate current Amount representation.

Potential migration path:

```text
Current Amount representation

↓

Canonical minor-unit integer or approved decimal representation

↓

Conversion validation

↓

Database migration

↓

Local migration

↓

Report recalculation

↓

Legacy field removal
```

The exact representation must follow `docs/06-DATA-MODEL.md`.

---

# Phase 2 Transfer Migration

Verify whether Transfers are currently represented as:

- One logical entity
- Two linked Transactions
- Independent Transactions
- UI-only behavior

Define and migrate toward one canonical Domain relationship.

---

# Phase 2 Database Migration Structure

Recommended:

```text
supabase/
  migrations/
    <timestamp>_<description>.sql
```

or another ordered migration structure compatible with the selected tooling.

A single mutable `supabase-schema.sql` should not remain the only historical migration record.

---

# Phase 2 RLS Baseline

Required:

- Owner-column inventory
- RLS enabled on protected tables
- Select policy
- Insert policy
- Update policy
- Delete policy
- Cross-owner tests
- Administrative-path review

---

# Phase 2 Exit Criteria

```text
□ Money is exact.

□ Currency is explicit.

□ Transfers have a canonical model.

□ Owner relationships are explicit.

□ Database migrations are ordered.

□ Protected tables use verified RLS.

□ Golden financial tests pass.

□ Derived balances can be recomputed.

□ Existing data has a migration plan.
```

---

# Phase 3 — Owner Isolation, Local Storage and Synchronization

Primary objective:

```text
Preserve confirmed user intent locally and synchronize without duplication.
```

Required outcomes:

- Owner-scoped local namespace
- Versioned local schema
- Stable operation ID
- Atomic entity and queue commit
- Retry classification
- Unknown-outcome handling
- Checkpoint contract
- Conflict contract
- Account-switch cleanup
- Full-resynchronization recovery
- Remote rollback handling

---

# Phase 3 Local Storage Discovery

Identify current use of:

```text
localStorage

IndexedDB

Capacitor Preferences

SQLite

Filesystem

In-memory state

Service Worker cache
```

Classify each as:

```text
Canonical local

Pending operation

Preference

Derived cache

Temporary

Secret
```

---

# Phase 3 Operation Envelope

Target conceptual structure:

```typescript
interface OperationEnvelope<TPayload> {
  operationId: string;
  ownerId: string;
  entityType: string;
  entityId: string;
  operationType: string;
  payload: TPayload;
  createdAt: string;
  protocolVersion: number;
  dependencyIds: string[];
  attemptCount: number;
  state: string;
}
```

Exact implementation must follow the synchronization specification.

---

# Phase 3 Migration Compatibility

During migration:

- Existing local records must remain readable.
- New code must identify legacy records.
- Pending legacy commands require conversion or governed handling.
- Old and new queue formats must not both execute the same intent.
- Cleanup waits until reconciliation succeeds.

---

# Phase 3 Exit Criteria

```text
□ Every financial command has a stable operation ID.

□ Local Save is durable.

□ Queue creation is atomic with local mutation.

□ Owner namespaces are isolated.

□ Account switch clears previous-owner runtime state.

□ Unknown outcomes reconcile before retry.

□ Conflicts are explicit.

□ Full resynchronization preserves pending intent.

□ Local migration interruption is recoverable.

□ Offline status is truthful.
```

---

# Phase 4 — Shared Design System and Core UI Migration

Primary objective:

```text
Create shared accessible primitives and migrate core workflows without changing financial meaning.
```

Required outcomes:

- Token source of truth
- Theme contract
- Typography
- Spacing
- Buttons
- Inputs
- Selects
- Dialogs
- Toasts
- Status components
- Financial Amount component
- Currency component
- Date component
- Empty, loading and error states
- Privacy mode

---

# Phase 4 CSS Consolidation

Investigate the relationship among:

```text
styles.css

nexio-v2.css

css/mobile.css

css/tablet.css

docs/design-system/tokens.css
```

Migration should define:

```text
Current active rules

Target token layer

Shared component layer

Platform adaptation layer

Legacy compatibility layer

Removal order
```

---

# Phase 4 Component Migration Order

Recommended:

```text
1. Tokens

2. Typography and layout primitives

3. Buttons and Inputs

4. Form validation

5. Dialog and Sheet

6. Status and feedback

7. Financial display components

8. Navigation primitives

9. Feature screens
```

---

# Phase 4 Core Workflow Priority

Migrate first:

```text
Sign-in

Dashboard shell

Create Transaction

Edit Transaction

Create Transfer

Account selection

Synchronization status

Settings

Account deletion
```

---

# Phase 4 Exit Criteria

```text
□ Shared tokens are authoritative.

□ Core components are accessible.

□ Theme behavior is consistent.

□ Privacy mode applies before sensitive display.

□ Critical forms use shared validation.

□ Platform UI uses shared Domain contracts.

□ Legacy CSS removal plan exists.

□ Financial behavior remains unchanged or explicitly migrated.
```

---

# Phase 5 — Desktop, Tablet and Mobile Completion

Primary objective:

```text
Complete adaptive platform experiences over the shared foundation.
```

Subphases:

```text
5A Desktop

5B Tablet

5C Mobile Web
```

Android hardening remains in Phase 6.

---

# Phase 5A Desktop Priorities

```text
Navigation

Dashboard

Transaction table

Advanced filtering

Reports

Goals

Account management

Keyboard shortcuts where approved

Bulk review without unsafe bulk mutation
```

---

# Phase 5B Tablet Priorities

```text
Adaptive navigation

Split views

Landscape layout

Portrait layout

Touch density

Report readability

Form continuity during rotation
```

---

# Phase 5C Mobile Priorities

```text
Bottom or compact navigation

Transaction quick action

Mobile forms

Sheets and dialogs

Foldable responsiveness

Offline status

Touch targets

Compact Reports

Settings and deletion
```

---

# Phase 5 Exit Criteria

```text
□ Critical journeys work on Desktop.

□ Critical journeys work on Tablet.

□ Critical journeys work on Mobile.

□ Responsive transitions do not lose state.

□ Keyboard behavior works where relevant.

□ Touch targets meet requirements.

□ Large text remains usable.

□ Loading, partial, offline and error states are complete.

□ No platform has independent financial logic.
```

---

# Phase 6 — Android Production Hardening

Primary objective:

```text
Make the Android application stable, secure, publishable and supportable.
```

Required outcomes:

- Capacitor configuration validation
- MainActivity lifecycle behavior
- Process-death resilience
- Back-navigation behavior
- File picker
- Content URI handling
- Notification permission
- Deep links
- Secure storage
- Local migration recovery
- Play Store artifact validation
- Crash and ANR monitoring
- Staged rollout readiness

---

# Phase 6 Android Source-of-Truth Review

Determine the relationship among:

```text
Web root files

android-web/

Capacitor copy or sync process

capacitor-overrides/

android/app/src/main/

mobile-capacitor.js
```

The build must not depend on manual undocumented file copying.

---

# Phase 6 Exit Criteria

```text
□ Android build is reproducible.

□ Process death does not duplicate commands.

□ Local migration survives interruption.

□ Back behavior is consistent.

□ File selection handles temporary access.

□ Notification permission is contextual.

□ Deep links reauthorize owner access.

□ Secure-storage loss triggers safe reauthentication.

□ Final manifest is reviewed.

□ AAB is signed correctly.

□ Store rollout can be halted safely.
```

---

# Phase 7 — Privacy, Deletion, Support and Compliance

Primary objective:

```text
Make user rights and public declarations operationally true.
```

Required outcomes:

- Privacy preference registry
- Optional-processing gates
- Complete export
- Account deletion state machine
- Provider cleanup
- Backup deletion reconciliation
- Public Privacy Policy alignment
- Public deletion page alignment
- Safe Support diagnostics
- Store declarations
- Compliance evidence package

---

# Phase 7 Exit Criteria

```text
□ Optional processing is disabled before choice where required.

□ Withdrawal works offline and online.

□ Complete Export scope is accurate.

□ Account deletion is end to end.

□ Deleted owners cannot reactivate after restore.

□ Support does not require broad financial data.

□ Policy URLs work.

□ Store declarations match Production.

□ Permission and SDK inventories are current.

□ Compliance evidence is archived.
```

---

# Phase 8 — Providers, Analytics and Notifications

Primary objective:

```text
Add bounded optional integrations after safety and user-control foundations exist.
```

Recommended order:

```text
Provider Adapter contracts

↓

Notification provider

↓

Essential operational telemetry

↓

Optional Product Analytics

↓

Additional Import and Export providers
```

---

# Phase 8 Analytics Gate

Analytics should not begin until:

- Event registry exists.
- Financial payload prohibition is tested.
- Choice behavior is implemented.
- Identity reset works.
- Store declaration is updated.
- Privacy Policy is updated.
- Provider deletion is understood.

---

# Phase 8 Notification Gate

Notifications should not begin until:

- Stable Notification IDs exist.
- Privacy templates exist.
- Android permission flow works.
- Deep links reauthorize.
- Entity deletion cancels or redacts stale Notifications.
- Provider failure is nonblocking.

---

# Phase 8 Exit Criteria

```text
□ Providers use Adapters.

□ Provider errors map to canonical categories.

□ Notification IDs are stable.

□ Notification privacy is enforced.

□ Analytics events use allowlisted schemas.

□ Analytics withdrawal works.

□ Provider identities reset after Account switch.

□ Provider exit procedures exist.
```

---

# Phase 9 — Assistant and AI

Primary objective:

```text
Introduce optional bounded AI assistance over stable deterministic financial capabilities.
```

Recommended order:

```text
Read-only explanations

↓

Deterministic Report summarization

↓

Structured suggestions

↓

Draft proposals

↓

Confirmed Domain commands
```

---

# Phase 9 Entry Requirements

Do not begin mutation-capable Assistant work until:

```text
□ Transaction commands are idempotent.

□ Transfer commands are idempotent.

□ Owner isolation is verified.

□ Operation IDs are stable.

□ Confirmation UI is accessible.

□ Assistant context is minimized.

□ History choice works.

□ Provider failure has manual fallback.

□ Audit and Support paths exist.
```

---

# Phase 9 Exit Criteria

```text
□ Assistant context is owner-scoped.

□ Financial totals come from deterministic services.

□ Output schema is validated.

□ Proposals expire.

□ Confirmation is required.

□ Manual workflows remain available.

□ History withdrawal works.

□ Provider failure cannot mutate data.

□ Public disclosures are current.
```

---

# Phase 10 — Advertising and Monetization

Primary objective:

```text
Introduce monetization without influencing or obstructing financial functionality.
```

Recommended order:

```text
Publisher authorization readiness

↓

Advertising provider Adapter

↓

Non-sensitive placement

↓

Choice and regional controls

↓

Monitoring and kill switch

↓

Subscription architecture if pursued
```

---

# Phase 10 Entry Requirements

Advertising should not begin until:

```text
□ Privacy controls are functional.

□ Store declarations are current.

□ Financial context exclusion is tested.

□ Advertising kill switch exists.

□ Account deletion includes Advertising identity.

□ Support and compliance runbooks exist.

□ Placement does not obstruct protected actions.
```

---

# Phase 10 Exit Criteria

```text
□ Ads are clearly labeled.

□ Financial data is excluded.

□ Personalization follows approved choice.

□ Withdrawal works.

□ Ads do not influence Assistant or Reports.

□ Core Product works without ads.

□ Publisher authorization is valid.

□ Store declarations are current.

□ Monetization failures are isolated.
```

---

# Phase 11 — Optimization, Recovery and Operational Maturity

Primary objective:

```text
Strengthen performance, observability, recovery, supportability and long-term maintainability.
```

Required outcomes:

- Performance budgets
- Query optimization
- Bundle optimization
- Memory and lifecycle cleanup
- Recovery exercises
- Incident exercises
- Support quality program
- Compliance audits
- Dependency audit
- Documentation traceability
- Technical-debt reduction
- Provider exit exercises

---

# Phase 11 Exit Criteria

```text
□ Performance budgets are enforced.

□ Critical recovery exercises pass.

□ RPO and RTO are measured.

□ Support diagnostics are safe and useful.

□ Compliance audits are current.

□ Provider exits are rehearsed.

□ Stale flags are removed.

□ Expired exceptions are resolved.

□ Documentation traceability is complete.

□ Critical technical debt has owners and deadlines.
```

---

# Parallelization Rules

Work may run in parallel when:

- Interfaces are agreed.
- File ownership does not conflict.
- Migration order is explicit.
- Test environments are isolated.
- Shared Domain logic is not duplicated.

---

# Safe Parallelization Examples

```text
Design token implementation

and

Database migration discovery
```

```text
Accessibility audit

and

CI baseline setup
```

```text
Android permission inventory

and

Support Knowledge Base planning
```

---

# Unsafe Parallelization Examples

```text
Two independent Transaction model rewrites
```

```text
Two synchronization protocols
```

```text
Separate Desktop and Mobile financial calculations
```

```text
Account deletion implementation without provider and backup coordination
```

---

# Roadmap Scope Control

Every phase should maintain:

```text
Committed scope

Stretch scope

Deferred scope

Rejected scope
```

---

# Committed Scope

Required to complete the phase.

---

# Stretch Scope

May proceed only after committed scope is stable.

---

# Deferred Scope

Valid but intentionally postponed with reason.

---

# Rejected Scope

Incompatible, unnecessary or unsafe work.

---

# Roadmap Change Control

A phase change requires review when it:

- Adds a new provider
- Adds a new persistent data class
- Changes financial meaning
- Changes owner model
- Changes release sequence
- Removes a required safety milestone
- Moves P4 work before P1
- Changes regional or store scope

---

# Roadmap Decision Record

Recommended template:

```markdown
# Roadmap Decision

## Decision

What sequencing or scope decision is proposed?

## Current Phase

Which phase is affected?

## Reason

Why is the change needed?

## Dependencies

Which items move?

## Risk

Which financial, Security, Privacy, Accessibility, operational or store risks change?

## User Impact

Which user-facing delivery changes?

## Migration Impact

Which compatibility or data migration changes?

## Evidence

Which facts support the decision?

## Owner and Approvers

Who owns and approves the change?
```

---

# Milestone Architecture

A milestone must be:

- Verifiable
- Bounded
- Dependency-aware
- Owned
- Connected to tests
- Connected to release evidence

---

# Weak Milestone Examples

```text
Improve synchronization

Work on mobile

Fix database

Add AI
```

---

# Strong Milestone Examples

```text
Every Transaction mutation uses a stable operation ID.

Every protected Supabase table denies cross-owner access.

Every Android upgrade from local schema version 2 to 3 survives process termination.

Every Account deletion test prevents restoration from an older backup.
```

---

# Milestone Record

Recommended fields:

```text
milestone_id

phase

workstream

description

owner

dependencies

risk

acceptance_tests

documentation

release_target

status
```

---

# Roadmap Evidence

Each completed milestone should link to:

```text
Pull Requests

Tests

Migration records

Screenshots

Build artifacts

Release records

Monitoring

Documentation

Audit evidence
```

---

# Part 1 Roadmap Anti-Patterns

The following are prohibited:

## Big-Bang Rewrite

Replacing the entire Product before incremental validation.

## UI before Data Authority

Redesigning workflows without resolving canonical financial behavior.

## Documentation as Implementation

Marking a requirement complete because the specification exists.

## Phase without Exit Criteria

Beginning work without measurable completion.

## Dependency by Assumption

Assuming another workstream will provide an undefined interface.

## Parallel Sources of Truth

Allowing legacy and new implementations to mutate canonical state independently.

## Permanent Compatibility Layer

Leaving migration adapters indefinitely.

## Feature Priority over P0 Risk

Advancing optional features while credible owner or financial harm remains.

## Android as Final Copy Step

Treating Android as a simple packaging action after Web work.

## Policy after Release

Implementing data processing before public and store readiness.

## Analytics before Choice

Adding measurement before user-control infrastructure.

## AI before Idempotency

Allowing Assistant financial actions before stable command identity.

## Advertising before Privacy Controls

Initializing monetization before user choice and store alignment.

## Migration without Current-State Preservation

Overwriting user data without backup or extraction.

## Completed Phase with Open Unowned Cleanup

Closing a phase while compatibility, flags or migrations remain ownerless.

---

# Part 1 Roadmap Review Questions

Before starting a phase, answer:

```text
What current behavior is being replaced or extended?

Which source of truth currently exists?

Which target contract is required?

Which data must be preserved?

Which owner boundaries apply?

Which dependencies must complete first?

Which tests prove the milestone?

Which rollback or recovery exists?

Which documentation changes?

What removes the old path?
```

---

# Priority Review Questions

```text
Is this P0, P1, P2, P3 or P4?

Does a higher-priority unresolved risk exist?

Does this work enable a required dependency?

Can the scope be reduced?

Can the visible value be delivered safely in a smaller increment?
```

---

# Migration Review Questions

```text
Which legacy data exists?

Which legacy code writes it?

Can old and new versions coexist?

How are duplicate writes prevented?

How is the migration resumed?

How is success validated?

When is legacy state removed?
```

---

# Workstream Review Questions

```text
Who owns the workstream?

Which interfaces does it provide?

Which interfaces does it consume?

Which files are affected?

Which phase depends on it?

Which temporary compatibility is required?

Which evidence proves completion?
```

---

# Phase Review Questions

```text
Are prerequisites complete?

Are committed and stretch scopes separate?

Are owners available?

Are migration and rollback understood?

Can the Product remain deployable?

Does the phase leave unresolved temporary architecture?

Which gate authorizes completion?
```

---

# Part 1 Acceptance Criteria

The Implementation Roadmap foundation is accepted only when:

```text
□ The roadmap operationalizes documents 00 through 21.

□ Financial correctness has highest implementation priority.

□ Owner isolation and data durability precede optional expansion.

□ Current repository state is assessed before redesign.

□ Current Production behavior is treated as evidence.

□ Legacy and target architectures are explicitly distinguished.

□ Migration is incremental.

□ Existing Web functionality remains protected.

□ Existing Android publication remains protected.

□ Existing user data receives migration treatment.

□ Original operation identities remain stable.

□ Owner namespaces remain isolated.

□ Safety infrastructure precedes advanced providers.

□ Target contracts are defined before implementation replacement.

□ Compatibility code has owner and expiration.

□ Derived data can be rebuilt.

□ Migration status is observable.

□ Persistent migration has recovery.

□ Roadmap roles are defined.

□ Every phase has an owner.

□ Roadmap statuses are explicit.

□ Program, phase, workstream, milestone and task remain distinguishable.

□ Repository and Build has a dedicated workstream.

□ Domain and Financial Integrity has a dedicated workstream.

□ Data Model and Database has a dedicated workstream.

□ Local Storage and Synchronization has a dedicated workstream.

□ Authentication and Owner Isolation has a dedicated workstream.

□ Design System and platform UI have coordinated workstreams.

□ Accessibility and Content have a dedicated workstream.

□ Privacy, Deletion and Compliance have a dedicated workstream.

□ Providers, Analytics, Assistant and Advertising remain separate workstreams.

□ Testing, Operations, Recovery and Support remain first-class workstreams.

□ Documentation and Governance remain first-class work.

□ Priorities P0 through P4 are defined.

□ P0 interrupts ordinary roadmap sequencing.

□ P1 foundations precede P4 expansion.

□ Value and risk are evaluated together.

□ Dependencies are recorded explicitly.

□ The critical dependency chain begins with repository and Domain foundations.

□ UI migration begins with tokens and shared primitives.

□ Android hardening is not treated as a final packaging step.

□ Compliance depends on verified Product data flow.

□ Phase 0 creates a current-state baseline.

□ Phase 1 creates reproducible builds and tests.

□ Phase 2 creates canonical Domain and database foundations.

□ Phase 3 creates durable local operations and synchronization.

□ Phase 4 creates shared accessible UI foundations.

□ Phase 5 completes adaptive platform experiences.

□ Phase 6 hardens Android for Production.

□ Phase 7 makes Privacy, deletion and store declarations operationally true.

□ Phase 8 introduces bounded providers and Analytics.

□ Phase 9 introduces Assistant only after stable command infrastructure.

□ Phase 10 introduces Advertising only after Privacy and compliance controls.

□ Phase 11 completes operational and recovery maturity.

□ Parallel work requires stable interfaces.

□ Unsafe parallel sources of truth are prohibited.

□ Every phase separates committed, stretch and deferred scope.

□ Roadmap changes receive governed decisions.

□ Milestones are verifiable rather than vague.

□ Every milestone links to evidence.

□ Part 1 roadmap anti-patterns are prohibited.
```

---

# Roadmap Constitutional Rule

Every phase, workstream, milestone, migration and implementation change must answer:

```text
Does this sequence move Nexio toward the target architecture while preserving current valid user data, current owner boundaries, current Production continuity and a tested path to stop, roll back or recover?
```

When the answer is uncertain, prefer the plan that:

- Performs discovery first.
- Narrows the scope.
- Adds characterization tests.
- Defines the contract.
- Preserves legacy data.
- Uses a compatibility phase.
- Adds a migration ledger.
- Adds a backup.
- Uses a controlled rollout.
- Delays optional features.
- Keeps the old path read-only.
- Blocks the phase.
- Rejects the change.

A roadmap is not successful because it contains many tasks.

It is successful only when each completed phase leaves Nexio safer, more understandable, more testable and closer to the target architecture without invalidating existing user trust.

---
---

# Practical Delivery Architecture

This section translates the roadmap phases into concrete implementation packages.

Each implementation package should define:

```text
Current-state discovery

Target capability

Likely repository files

New files where required

Persistent-data impact

Compatibility strategy

Implementation order

Required tests

Visible user outcome

Operational evidence

Exit gate
```

File paths listed in this roadmap are expected areas of impact based on the current repository.

They are not authorization to modify every listed file.

Before implementation, verify:

- The file is active.
- The file is part of the current build.
- The behavior is not already implemented elsewhere.
- The Web and Android builds use the same source.
- The change does not create another source of truth.

---

# Repository Change Rules

## Preserve a Working Baseline

Before every major phase:

```text
1. Confirm the current Production revision.

2. Create or verify a release tag.

3. Run the current Web build.

4. Run the current Android build where applicable.

5. Capture current critical-journey behavior.

6. Confirm backup or recovery readiness.

7. Begin the migration in a separate governed change.
```

---

## Characterize Before Replacing

Before replacing legacy code, add tests or controlled observations for:

- Current input
- Current output
- Current stored state
- Current errors
- Current side effects
- Current Android behavior
- Current responsive behavior

Characterization tests should not preserve known incorrect behavior indefinitely.

Known defects must be documented separately.

---

## One Active Writer per Canonical Capability

During migration, one capability should have only one authoritative writer.

Examples:

```text
Only one Transaction command path may write canonical Transactions.

Only one Transfer command path may create linked financial effects.

Only one synchronization queue may send pending operations.

Only one Account deletion coordinator may advance deletion state.
```

A legacy reader may coexist temporarily with a new reader.

Two independent canonical writers should not coexist without a strict compatibility contract.

---

## Adapter-First Migration

When replacing a provider or persistence mechanism:

```text
Current callers

↓

Stable internal interface

↓

Legacy Adapter

↓

New Adapter

↓

Controlled caller migration

↓

Legacy Adapter removal
```

---

## Feature Flag Use

Use Feature Flags when:

- New and old behavior must coexist temporarily.
- Rollout needs to be staged.
- Provider behavior can be disabled.
- Android versions adopt at different rates.
- Recovery requires rapid containment.

Do not use Feature Flags to bypass:

- Authorization
- RLS
- Money validation
- Ownership
- Required deletion behavior

---

# Implementation Package Template

Every milestone should use a record similar to:

```markdown
# Implementation Package

## Identifier

PHASE-WORKSTREAM-SEQUENCE

## Capability

What end-to-end result will exist?

## Current State

What exists today?

## Target State

What must exist after implementation?

## Likely Files

Which existing files may be affected?

## New Files

Which new files or directories may be introduced?

## Data Impact

Which local or remote persistent data changes?

## Compatibility

How do existing users and versions remain safe?

## Implementation Order

Which steps must occur first?

## Tests

Which automated and manual tests prove completion?

## User Outcome

What visible improvement occurs?

## Rollback or Recovery

How is the change disabled, reversed or recovered?

## Exit Evidence

Which artifacts prove completion?

## Owner

Named responsible owner.
```

---

# Phase 0 Practical Plan — Discovery and Production Safety

## Objective

Establish a verified map of the current Product before architectural migration.

---

# Phase 0.1 — Runtime Entry-Point Discovery

## Investigate

```text
index.html

app.js

js/ui/shared-ui.js

js/ui/desktop.js

js/ui/tablet.js

js/ui/mobile.js

mobile-capacitor.js

android-web/index.html
```

Determine:

- Which scripts load in the Web application.
- Which scripts load in Android.
- Script order.
- Whether scripts use global variables.
- Whether duplicate functions exist.
- Whether `android-web/` is generated or maintained manually.
- Whether `app.js` remains the primary application controller.
- Whether platform modules are actually active.

---

## Deliverable

Create:

```text
docs/current-state/RUNTIME-MAP.md
```

Recommended contents:

```text
Web bootstrap

Android bootstrap

Global objects

Module dependencies

Event initialization

Platform detection

Build copy flow

Known duplicate logic
```

---

## Tests

```text
□ Web application starts from clean cache.

□ Android application starts from clean install.

□ Desktop navigation initializes once.

□ Mobile navigation initializes once.

□ No duplicate event binding is observed.

□ Active script order is recorded.
```

---

# Phase 0.2 — CSS Authority Discovery

## Investigate

```text
styles.css

nexio-v2.css

css/mobile.css

css/tablet.css

docs/design-system/tokens.css

android-web/styles.css
```

Determine:

- Which CSS files are loaded.
- Which order applies.
- Which selectors override others.
- Which styles are platform-specific.
- Which tokens are active.
- Which dark-theme rules conflict.
- Which responsive breakpoints overlap.
- Whether Android uses copied or independent CSS.

---

## Deliverable

Create:

```text
docs/current-state/CSS-CASCADE-MAP.md
```

Include:

- Load order
- Active breakpoint ranges
- Theme sources
- Duplicate component selectors
- High-specificity selectors
- Inline styles
- Legacy removal candidates

---

## Tests

Capture representative screenshots for:

```text
Desktop light

Desktop dark

Tablet portrait

Tablet landscape

Mobile narrow

Foldable compact

Android light

Android dark
```

Use synthetic values such as:

```text
R$ 1.250,00

R$ 84,90

R$ 3.420,15
```

---

# Phase 0.3 — Data Persistence Discovery

## Investigate

```text
js/core/storage.js

js/core/transactions.js

js/core/profiles.js

js/core/goals.js

supabase-config.js

supabase-schema.sql

app.js

mobile-capacitor.js
```

Search for use of:

```text
localStorage

sessionStorage

IndexedDB

SQLite

Capacitor Preferences

Filesystem

Supabase client

Direct fetch calls

In-memory global state
```

---

## Data Inventory Deliverable

Create:

```text
docs/current-state/DATA-LOCATION-INVENTORY.md
```

Recommended table:

| Data class | Current location | Owner scoped | Canonical | Migratable | Risk |
|---|---|---:|---:|---:|---|
| Profile | To verify | To verify | Yes | Yes | High |
| Accounts | To verify | To verify | Yes | Yes | Critical |
| Transactions | To verify | To verify | Yes | Yes | Critical |
| Preferences | To verify | To verify | Contextual | Yes | Moderate |
| Cached Reports | To verify | To verify | No | Rebuild | Low |
| Pending operations | To verify | To verify | Intent | Yes | Critical |

---

# Phase 0.4 — Supabase and Database Discovery

## Investigate

```text
supabase-schema.sql

supabase-config.js

js/core/

app.js
```

Determine:

- Active project environment
- Tables
- Columns
- Foreign keys
- Constraints
- Indexes
- RLS status
- Policies
- Functions
- Triggers
- Storage buckets
- Realtime subscriptions
- Authentication-to-Profile mapping
- Deletion behavior

---

## Deliverables

```text
docs/current-state/DATABASE-INVENTORY.md

docs/current-state/RLS-INVENTORY.md

docs/current-state/PROVIDER-INVENTORY.md
```

---

## Mandatory Safety Tests

Using synthetic owners A and B:

```text
□ Owner A cannot select Owner B Profile.

□ Owner A cannot select Owner B Accounts.

□ Owner A cannot insert rows for Owner B.

□ Owner A cannot update Owner B rows.

□ Owner A cannot delete Owner B rows.

□ Unauthenticated access is denied where required.

□ Storage objects cannot cross owner boundaries.
```

Any failure becomes P0.

---

# Phase 0.5 — Android Build Discovery

## Investigate

```text
capacitor.config.ts

CAPACITOR_ANDROID_BUILD.md

android/

android-web/

capacitor-overrides/android/

mobile-capacitor.js

package.json
```

Determine:

- Build command
- Web asset directory
- Capacitor sync process
- Native override process
- Application ID
- Version source
- Signing procedure
- Manifest merge
- MainActivity behavior
- Deep-link configuration
- Notification integration
- File-picker integration

---

## Deliverable

Create:

```text
docs/current-state/ANDROID-BUILD-MAP.md
```

---

# Phase 0.6 — Production Configuration Inventory

Create a registry for:

```text
Environment variables

Public Supabase configuration

Private server secrets

Vercel configuration

Android build variables

Advertising identifiers

Notification providers

Analytics providers

Assistant providers

Feature Flags
```

Never copy secret values into the document.

Record only:

```text
Name

Purpose

Environment

Owner

Secret or public

Rotation requirement

Current location
```

---

# Phase 0.7 — Immediate Safety Backlog

Create P0 records for confirmed:

- Exposed secret
- Cross-owner access
- Inexact Money
- Duplicate mutation
- Broken deletion
- Public Attachment
- Lost pending intent
- Unrecoverable Android signing state
- Missing Production backup

P0 corrections may occur before Phase 0 fully completes.

---

# Phase 0 Exit Package

Required artifacts:

```text
RUNTIME-MAP.md

CSS-CASCADE-MAP.md

DATA-LOCATION-INVENTORY.md

DATABASE-INVENTORY.md

RLS-INVENTORY.md

PROVIDER-INVENTORY.md

ANDROID-BUILD-MAP.md

CONFIGURATION-INVENTORY.md

CURRENT-RISK-REGISTER.md
```

---

# Phase 1 Practical Plan — Repository, Build and Test Baseline

## Objective

Create a reproducible engineering environment without changing canonical Product behavior.

---

# Phase 1.1 — Development Commands

Update or introduce controlled scripts in:

```text
package.json
```

Potential command categories:

```text
dev

build

test

test:unit

test:integration

test:accessibility

lint

format

check

android:sync

android:build

android:bundle
```

Use actual tools supported by the repository.

Do not invent commands that do not function.

---

# Phase 1.2 — Environment Schema

Introduce a versioned environment definition.

Potential new file:

```text
.env.example
```

It should include variable names only.

Potential groups:

```text
PUBLIC_SUPABASE_URL

PUBLIC_SUPABASE_ANON_KEY

APP_ENVIRONMENT

APP_RELEASE_ID

FEATURE_FLAG_ENDPOINT

ANALYTICS_ENABLED_DEFAULT

ASSISTANT_ENABLED_DEFAULT

ADVERTISING_ENABLED_DEFAULT
```

Names must match the actual implementation.

---

# Phase 1.3 — Application Bootstrap Boundary

Potential target files:

```text
js/bootstrap.js

js/application/app-context.js

js/platform/platform-detection.js
```

Possible transitional flow:

```text
index.html

↓

js/bootstrap.js

↓

Legacy app.js Adapter

↓

New application modules
```

The bootstrap should own:

- Environment validation
- Platform detection
- Authentication initialization
- Owner-context initialization
- Storage initialization
- UI shell initialization
- Error boundary
- Release metadata

---

# Phase 1.4 — Global Error Boundary

Create a controlled error boundary for:

- Startup failure
- Local migration failure
- Authentication initialization failure
- Unsupported browser
- Missing configuration
- Android bridge failure

Potential new module:

```text
js/application/startup-error-handler.js
```

It must not expose:

- Secrets
- Raw database errors
- Tokens
- Full financial payloads

---

# Phase 1.5 — Test Directory Baseline

Potential structure:

```text
tests/
  unit/
  integration/
  contract/
  accessibility/
  android/
  fixtures/
```

Initial fixtures should include:

```text
owner-a

owner-b

brl-account

usd-account

income-transaction

expense-transaction

transfer

deleted-transaction

pending-operation
```

---

# Phase 1.6 — Initial Characterization Tests

Likely affected modules:

```text
js/core/finance.js

js/core/transactions.js

js/core/reports.js

js/core/storage.js

app.js
```

Characterize:

- Amount parsing
- Amount formatting
- Transaction creation
- Balance calculation
- Transfer behavior
- Local persistence
- Current Report totals

---

# Phase 1.7 — CI Baseline

Potential checks:

```text
Dependency installation

Syntax or lint check

Unit tests

Build

Secret scan

Artifact existence

Documentation-link check
```

Do not require unstable checks until they are reliable.

Every temporarily nonblocking check requires:

- Owner
- Reason
- Deadline
- Promotion plan to required status

---

# Phase 1.8 — Release Metadata

Expose safe release information in:

- Application diagnostics
- Support diagnostics
- Build artifacts
- Release records

Potential fields:

```text
version

releaseId

sourceRevision

buildTime

environment

schemaVersion

localSchemaVersion

syncProtocolVersion
```

---

# Phase 1.9 — Dependency Baseline

Review:

```text
package.json

package-lock.json

android build dependencies
```

Create:

```text
docs/registries/DEPENDENCY-REGISTRY.md
```

Initial fields:

```text
Dependency

Version

Purpose

Runtime or development

Provider relationship

License

Owner

Replacement risk
```

---

# Phase 1 Exit Package

```text
□ Clean checkout builds Web.

□ Clean checkout builds Android.

□ Environment variables are validated.

□ Startup failures are user-safe.

□ Initial tests run through one command.

□ CI validates every Pull Request.

□ Release metadata is visible.

□ Dependencies are inventoried.

□ Current behavior is characterized before major migration.
```

---

# Phase 2 Practical Plan — Domain and Data Foundations

## Objective

Create a stable financial Domain independent from UI, local storage and Supabase.

---

# Phase 2.1 — Domain Directory

Potential target:

```text
js/domain/
```

Potential modules:

```text
money.js

currency.js

account.js

transaction.js

transfer.js

category.js

goal.js

recurring-rule.js

financial-period.js

domain-errors.js
```

Reuse or migrate existing logic from:

```text
js/core/finance.js

js/core/transactions.js

js/core/categories.js

js/core/goals.js

js/core/reports.js
```

---

# Phase 2.2 — Money Contract

The chosen Money representation must follow the Data Model specification.

Potential conceptual interface:

```typescript
interface Money {
  amountMinor: number;
  currency: string;
}
```

If supported values may exceed safe JavaScript integer bounds, use the approved alternative.

Do not convert current persisted values until:

- Existing representation is measured.
- Currency minor units are known.
- Conversion tests pass.
- Database migration is ready.
- Local migration is ready.
- Rollback or recovery exists.

---

# Money Migration Tests

Use synthetic cases:

```text
R$ 0,00

R$ 0,01

R$ 9,90

R$ 1.250,00

R$ 3.420,15

R$ 999.999,99

Negative Expense representation

Zero Amount rejection or approved behavior

Maximum supported value
```

Verify:

- Parse
- Format
- Addition
- Subtraction
- Comparison
- Serialization
- Database round trip
- Export
- Import

---

# Phase 2.3 — Currency Contract

Create an allowlisted Currency value object or equivalent.

Required behaviors:

- Uppercase normalized code
- Explicit validation
- Minor-unit metadata
- Locale-independent persistence
- Locale-dependent formatting
- No inference from symbol alone

---

# Phase 2.4 — Transaction Contract

Canonical fields should follow `docs/06-DATA-MODEL.md`.

Potential responsibilities:

```text
Transaction identity

Owner

Account

Type

Money

Calendar Date

Category

Status

Notes

Creation and update metadata

Deletion state

Version
```

---

# Transaction Command Layer

Potential new modules:

```text
js/application/transactions/create-transaction.js

js/application/transactions/update-transaction.js

js/application/transactions/delete-transaction.js

js/application/transactions/get-transactions.js
```

UI should call Application commands rather than persistence directly.

---

# Phase 2.5 — Transfer Contract

Define whether a Transfer uses:

- One canonical Transfer entity with two effects
- A Transfer entity linked to two Transactions
- Another approved representation

The UI must not create two unrelated Transactions independently.

---

# Transfer Tests

```text
□ Source and destination differ.

□ Both Accounts belong to the correct owner.

□ Currency behavior is explicit.

□ Both effects commit atomically or reconcile as one operation.

□ Retry does not duplicate either side.

□ Edit preserves linkage.

□ Delete or reversal preserves both sides.

□ Reports exclude double counting where required.
```

---

# Phase 2.6 — Account Contract

Define:

- Account type
- Currency
- Status
- Archive behavior
- Balance derivation
- Deletion relationship
- Transfer eligibility

Cached balance must not become an uncontrolled second authority.

---

# Phase 2.7 — Category and Goal Contracts

Categories:

- Owner scoped
- Type compatible
- Merge governed
- Archive-safe

Goals:

- Explicit Currency
- Exact target Money
- Contribution identity
- Derived progress
- Completion state

---

# Phase 2.8 — Report Query Services

Move deterministic calculations into:

```text
js/application/reports/
```

Potential services:

```text
calculate-account-balance.js

calculate-period-summary.js

calculate-category-summary.js

calculate-goal-progress.js

calculate-cash-flow.js
```

Reports consume canonical records.

They do not write financial state.

---

# Phase 2.9 — Database Migration Infrastructure

Potential target:

```text
supabase/
  migrations/
```

Initial migrations should first capture current state rather than immediately rewrite everything.

Recommended sequence:

```text
0001_baseline_current_schema.sql

0002_add_schema_version_ledger.sql

0003_add_missing_owner_constraints.sql

0004_enable_or_correct_rls.sql

0005_add_operation_ledger.sql

0006_add_domain_constraints.sql
```

Actual numbering and content depend on discovered state.

---

# Phase 2.10 — Database Migration Ledger

Potential table:

```text
schema_migrations
```

Use the migration tooling's native ledger where available.

Do not create a duplicate ledger unnecessarily.

---

# Phase 2.11 — Owner Constraints

Every protected row should have an unambiguous owner relationship.

Potential actions:

- Add missing `owner_id`.
- Backfill through verified relationship.
- Add foreign key.
- Add non-null constraint after validation.
- Add index.
- Add RLS.
- Remove unsafe fallback owner behavior.

---

# Owner Backfill Procedure

```text
1. Identify rows without owner.

2. Determine whether ownership can be proven.

3. Quarantine ambiguous rows.

4. Backfill deterministic rows.

5. Validate counts.

6. Add constraint.

7. Add RLS.

8. Test cross-owner denial.
```

Never assign ambiguous financial data to the currently authenticated user merely because they are executing the migration.

---

# Phase 2.12 — Domain Constraint Migration

Potential database constraints:

- Valid Transaction type
- Valid Currency code
- Nonempty Account relationship
- Transfer source differs from destination
- Owner relationship consistency
- Version nonnegative
- Valid deletion state
- Stable operation ID uniqueness

---

# Phase 2.13 — Existing Data Audit

Before conversion, compute:

```text
Row counts

Null counts

Duplicate identifiers

Missing owners

Invalid currencies

Unexpected Amount precision

Broken Transfer links

Orphan Categories

Orphan Goals

Deleted-state inconsistencies
```

---

# Phase 2 Visible Deliverables

Users may receive:

- More consistent Amount formatting
- Correct multi-Currency labels
- Correct balance calculation
- Correct Transfer presentation
- More accurate Reports
- Clearer validation errors

Do not expose a new format before persisted migration and old-client compatibility are safe.

---

# Phase 2 Exit Gate

```text
□ Domain modules do not depend on UI.

□ Domain modules do not depend directly on Supabase.

□ Money and Currency contracts pass golden tests.

□ Transactions use one canonical validation path.

□ Transfers use one canonical relationship.

□ Reports use deterministic query services.

□ Database migrations are ordered.

□ Owner relationships are explicit.

□ RLS tests pass.

□ Existing data audit is complete.

□ Ambiguous data is quarantined rather than guessed.
```

---

# Phase 3 Practical Plan — Owner Isolation, Local Storage and Synchronization

## Objective

Build durable local-first behavior and safe synchronization.

---

# Phase 3.1 — Storage Interface

Introduce an internal contract.

Potential:

```typescript
interface LocalDatabase {
  open(ownerId: string): Promise<void>;
  close(): Promise<void>;
  transaction<T>(work: () => Promise<T>): Promise<T>;
  getEntity<T>(type: string, id: string): Promise<T | null>;
  putEntity<T>(type: string, entity: T): Promise<void>;
  deleteEntity(type: string, id: string): Promise<void>;
}
```

Exact implementation may use IndexedDB or another approved store.

---

# Phase 3.2 — Current Storage Adapter

Wrap existing storage before replacing it.

Potential:

```text
js/infrastructure/storage/legacy-storage-adapter.js
```

This allows Application services to stop calling storage globals directly.

---

# Phase 3.3 — Local Schema Version

Introduce:

```text
localSchemaVersion
```

Potential stores:

```text
metadata

profiles

accounts

transactions

transfers

categories

goals

operations

conflicts

checkpoints

preferences
```

Only create stores required by the approved architecture.

---

# Phase 3.4 — Owner Namespace

Possible strategies:

```text
Separate database per owner

or

Owner field and owner-bound repository

or

Hybrid approach
```

The selected strategy must guarantee that Account switching:

- Closes previous stores.
- Cancels requests.
- Clears in-memory state.
- Clears provider identity.
- Reopens only the new owner namespace.

---

# Phase 3.5 — Operation Ledger

Potential local operation fields:

```text
operationId

ownerId

entityType

entityId

operationType

payload

state

attemptCount

dependencyIds

createdAt

lastAttemptAt

remoteResult

protocolVersion
```

Potential remote ledger fields:

```text
operation_id

owner_id

operation_type

entity_type

entity_id

result_state

result_reference

created_at

completed_at
```

---

# Phase 3.6 — Atomic Local Commit

A financial command should commit in one local transaction:

```text
Canonical local entity change

+

Operation queue record

+

Relevant local metadata
```

The UI should show success only after this atomic commit succeeds.

---

# Phase 3.7 — Synchronization Engine Boundary

Potential target:

```text
js/application/sync/

js/infrastructure/sync/
```

Potential modules:

```text
sync-engine.js

operation-processor.js

retry-policy.js

conflict-detector.js

checkpoint-manager.js

full-resync.js

sync-status.js
```

---

# Phase 3.8 — Retry Policy

Classify:

```text
retryable

non_retryable

authentication_required

conflict

unknown_outcome

dependency_blocked

owner_mismatch
```

Use bounded backoff.

Do not retry permanent validation failures indefinitely.

---

# Phase 3.9 — Unknown Outcome

When a remote mutation times out:

```text
1. Keep the original operation ID.

2. Query or reconcile the remote operation ledger.

3. Do not create a replacement operation.

4. Resolve to completed, pending, failed or conflict.

5. Present accurate user status.
```

---

# Phase 3.10 — Conflict Store

Potential fields:

```text
conflictId

ownerId

entityType

entityId

localVersion

remoteVersion

fieldDifferences

createdAt

state

resolution
```

Do not store more financial content than needed for resolution.

---

# Phase 3.11 — Checkpoint Migration

Introduce explicit checkpoint version and owner.

Potential:

```text
ownerId

stream

cursor

protocolVersion

updatedAt
```

A checkpoint reset must preserve pending operations.

---

# Phase 3.12 — Local Migration from Legacy Storage

Potential sequence:

```text
1. Detect legacy version.

2. Open legacy store read-only.

3. Verify owner.

4. Copy canonical records.

5. Convert Amount and Currency.

6. Convert pending operations.

7. Validate counts and invariants.

8. Mark new store ready.

9. Keep legacy store for recovery window.

10. Remove legacy store later.
```

---

# Local Migration Failure States

```text
not_started

reading_legacy

copying

validating

ready

failed_retryable

failed_final

recovery_required
```

---

# Phase 3.13 — Account Switch Transaction

Account switching should use a coordinated sequence:

```text
Block new commands

↓

Flush current UI state

↓

Pause synchronization

↓

Cancel owner requests

↓

Close Realtime subscriptions

↓

Close local database

↓

Clear in-memory caches

↓

Reset providers

↓

Validate new owner

↓

Open new namespace

↓

Start synchronization

↓

Render new owner
```

---

# Phase 3.14 — Service Worker and Multi-Tab Coordination

For Web:

- One tab coordinates local migration.
- Tabs broadcast owner change.
- Old tabs stop writes.
- Service Worker does not cache private responses.
- Public asset cache remains separate from canonical data.

---

# Phase 3.15 — Offline UI States

Shared states:

```text
Online and synchronized

Online with pending changes

Offline with local Save available

Offline with local storage unavailable

Authentication required

Conflict requires review

Recovery mode
```

---

# Phase 3 Tests

Mandatory:

```text
Create Expense offline

Restart application

Verify Expense remains

Reconnect

Synchronize once

Verify no duplicate

Timeout remote response

Retry with same operation ID

Switch owner during pending request

Verify no state leakage

Interrupt local migration

Resume migration

Reset checkpoint

Preserve pending operation

Simulate remote rollback

Preserve newer local intent
```

---

# Phase 3 Visible Deliverables

Users receive:

- Honest synchronization status
- Durable offline Save
- Reduced duplicate risk
- Safer Account switching
- Conflict review
- Better recovery from connectivity failures

---

# Phase 3 Exit Gate

```text
□ Local canonical records are owner-scoped.

□ Local schema is versioned.

□ Legacy storage has a tested migration path.

□ Financial commands commit locally and queue atomically.

□ Operation identity remains stable.

□ Retry is bounded.

□ Unknown outcomes reconcile.

□ Conflicts are explicit.

□ Checkpoints are owner- and protocol-scoped.

□ Account switching is transactional.

□ Multi-tab migration is coordinated.

□ Service Worker does not become financial authority.

□ Full resynchronization preserves local intent.
```

---

# Phase 4 Practical Plan — Shared Design System and Core UI

## Objective

Consolidate interface architecture while preserving Domain behavior.

---

# Phase 4.1 — Token Authority

Potential authoritative file:

```text
docs/design-system/tokens.css
```

or a new runtime path such as:

```text
css/tokens.css
```

If the documentation file is not loaded by the application, create a runtime source and define generation or synchronization rules.

Token categories:

```text
Color

Typography

Spacing

Radius

Elevation

Motion

Breakpoints

Touch target

Focus
```

---

# Phase 4.2 — Legacy CSS Layering

Temporary load order may be:

```text
tokens.css

↓

components.css

↓

platform.css

↓

legacy-compatibility.css
```

Do not allow both `styles.css` and `nexio-v2.css` to remain uncontrolled authorities.

---

# Phase 4.3 — Shared Component Directory

Potential:

```text
js/ui/components/
css/components/
```

Initial components:

```text
Button

Icon Button

Text Input

Amount Input

Currency Select

Date Input

Select

Checkbox

Switch

Dialog

Bottom Sheet

Toast

Banner

Empty State

Loading State

Error State

Sync Status

Privacy Mask
```

---

# Phase 4.4 — Financial Form Components

Create shared behavior for:

- Amount entry
- Currency label
- Income or Expense type
- Account selection
- Category selection
- Calendar Date
- Validation
- Submission state
- Unknown outcome state

---

# Phase 4.5 — Navigation Shell

Separate:

```text
Shared route or view state

Desktop navigation rendering

Tablet navigation rendering

Mobile navigation rendering
```

A platform navigation component should not own canonical feature state.

---

# Phase 4.6 — Theme Migration

Verify:

- Light theme
- Dark theme
- System theme
- Contrast
- Card backgrounds
- Form fields
- Charts
- Disabled states
- Error states
- Android system-bar relationship

---

# Phase 4.7 — Privacy Mode

Privacy masking should apply before sensitive paint.

Potential masked elements:

- Balances
- Transaction values
- Goal values
- Report totals
- Notification previews

---

# Phase 4.8 — Core Screen Migration Order

Recommended:

```text
1. Sign-in and startup states

2. Application shell

3. Dashboard

4. Transaction form

5. Transaction list

6. Transfer form

7. Accounts

8. Goals

9. Reports

10. Settings

11. Account deletion
```

---

# Phase 4.9 — UI Compatibility Adapter

Legacy screens may consume new Application services through a temporary Adapter.

Do not allow new screens to call legacy global mutations directly.

---

# Phase 4 Tests

```text
Keyboard navigation

Screen-reader labels

Large text

Light and dark themes

Mobile and desktop rendering

Focus after Dialog close

Focus after validation error

Reduced motion

Privacy mode before rendering

Offline and pending states

Unknown financial outcome state
```

---

# Phase 4 Visible Deliverables

- Consistent appearance
- Improved dark theme
- Better forms
- Clearer errors
- Better mobile interaction
- Consistent synchronization messages
- Accessible focus and keyboard behavior

---

# Phase 4 Exit Gate

```text
□ Runtime tokens are authoritative.

□ Shared components are documented.

□ Shared financial forms use Application commands.

□ Theme behavior is consistent.

□ Privacy mode is effective before sensitive paint.

□ Platform shells do not duplicate Domain logic.

□ Critical screens use complete state models.

□ Legacy CSS has a removal registry.

□ Accessibility tests pass.
```

---

# Phase 5 Practical Plan — Desktop, Tablet and Mobile Completion

## Shared Rule

Each platform receives a different presentation but the same:

- Domain
- Application commands
- Repository interfaces
- Synchronization state
- Error taxonomy
- Privacy rules
- Accessibility requirements

---

# Phase 5A — Desktop Implementation Packages

## Desktop Shell

Likely affected:

```text
js/ui/desktop.js

js/ui/shared-ui.js

styles.css

nexio-v2.css

index.html
```

Target:

- Stable side navigation
- Main content landmark
- Keyboard navigation
- Responsive collapse
- Route-state preservation

---

## Desktop Dashboard

Target sections:

```text
Balance overview

Income and Expense summary

Cash-flow trend

Goals

Recent Transactions

Synchronization state

Action shortcuts
```

Requirements:

- Partial-data disclosure
- Multi-Currency separation
- Privacy mode
- Bounded rendering
- Empty states

---

## Desktop Transactions

Target:

- Search
- Filters
- Sorting
- Pagination or bounded virtualized rendering
- Edit
- Delete or reversal
- Transfer identification
- Pending and Conflict indicators

---

## Desktop Reports

Target:

- Period selection
- Account scope
- Currency scope
- Category summary
- Cash flow
- Export
- Data-coverage disclosure

---

# Phase 5B — Tablet Implementation Packages

Likely affected:

```text
js/ui/tablet.js

css/tablet.css

js/ui/shared-ui.js
```

Target behaviors:

- Adaptive rail or compact navigation
- Split list and detail where useful
- Portrait fallback
- Landscape productivity
- Rotation-state preservation
- Touch-friendly controls

---

# Tablet Rotation Test

During:

- Transaction form
- Filter selection
- Conflict review
- Export generation

rotation must not:

- Duplicate command
- Lose form data
- Reset owner
- Reopen destructive confirmation
- Lose current selection

---

# Phase 5C — Mobile Web Implementation Packages

Likely affected:

```text
js/ui/mobile.js

css/mobile.css

js/ui/shared-ui.js

index.html
```

Target:

- Compact navigation
- Primary quick action
- Full-screen or Sheet forms
- Safe back behavior
- Mobile Transaction list
- Foldable compatibility
- Large-text reflow
- Reachable controls

---

# Mobile Foldable Tests

Test widths representing:

- Narrow phone
- Standard phone
- Foldable compact pane
- Foldable expanded pane
- Small tablet boundary

Verify no duplicate navigation or clipped financial values.

---

# Phase 5 Cross-Platform Tests

```text
Same owner and data produce equivalent totals.

Same command produces same operation.

Same Conflict displays equivalent choices.

Same deletion state is communicated.

Same Currency is preserved.

Same error code maps to platform-appropriate content.

No platform contains independent balance calculation.
```

---

# Phase 5 Exit Gate

```text
□ Desktop critical journeys pass.

□ Tablet critical journeys pass.

□ Mobile critical journeys pass.

□ Platform transitions preserve state.

□ Responsive changes do not alter Domain behavior.

□ Multi-Currency display remains accurate.

□ Privacy mode works on every platform.

□ Accessibility works on every platform.

□ Platform-specific legacy UI has removal plans.
```

---

# Phase 6 Practical Plan — Android Production Hardening

## Objective

Make Android a governed platform rather than an unmanaged Web copy.

---

# Phase 6.1 — Build Source Consolidation

Determine whether Android assets should come from:

```text
Root Web build output

or

android-web/
```

Select one authoritative generation process.

Potential commands:

```text
Web build

↓

Capacitor copy or sync

↓

Native override application

↓

Gradle build

↓

Artifact verification
```

Manual file replacement should be removed.

---

# Phase 6.2 — Capacitor Configuration

Review:

```text
capacitor.config.ts
```

Validate:

- Application ID
- Application name
- Web directory
- Server configuration
- Android scheme
- Plugin configuration
- Cleartext traffic behavior
- Navigation allowlist

---

# Phase 6.3 — Native Override Governance

Review:

```text
capacitor-overrides/android/
```

For each override, record:

- Purpose
- Target native file
- Application method
- Version compatibility
- Test
- Removal condition

---

# Phase 6.4 — MainActivity Lifecycle

Review:

```text
MainActivity
```

Test:

- Fresh start
- Background and foreground
- Process death
- Configuration change
- Deep-link start
- Notification start
- Authentication callback
- Multiple callback delivery

---

# Phase 6.5 — Android Back Behavior

Define behavior for:

```text
Close Dialog

Close Sheet

Leave form with unsaved input

Navigate to previous view

Exit application

Return from external provider
```

Back must not:

- Submit a form
- Confirm deletion
- Duplicate operation
- Lose pending committed data
- Switch owner

---

# Phase 6.6 — File Selection

Use Android system file selection.

Requirements:

- MIME allowlist
- Size preflight
- Content URI handling
- Temporary permission
- Copy to controlled temporary storage only when required
- Cleanup
- Process-death recovery

---

# Phase 6.7 — Notifications

Implement:

- Contextual permission request
- Stable Notification ID
- Privacy-safe template
- Deep-link authorization
- Token reset after owner change
- Cancellation after entity deletion
- Provider failure behavior

---

# Phase 6.8 — Secure Storage

Store only appropriate secrets or session material.

Do not store:

- Entire financial database
- Plaintext provider secrets
- Complete exports
- Signing credentials

On Keystore invalidation:

- Preserve local canonical records.
- Require reauthentication.
- Require provider reconnection.
- Avoid weakening encryption.

---

# Phase 6.9 — Android Local Migration

Run the Phase 3 migration under:

```text
Application update

Process death

Low storage

Background interruption

Device restart
```

---

# Phase 6.10 — Final Manifest Review

Inspect the final merged manifest.

Review:

```text
Permissions

Exported components

Deep links

Providers

Receivers

Services

Backup configuration

Cleartext traffic

Network security configuration
```

---

# Phase 6.11 — AAB Verification

Before Play upload:

```text
□ Correct package name.

□ Correct version code.

□ Correct version name.

□ Correct signing.

□ Correct Production environment.

□ No staging URL.

□ No test key.

□ No debug mode.

□ Correct permissions.

□ Correct policy URLs.

□ Correct Advertising state.
```

---

# Phase 6 Visible Deliverables

- More stable startup
- Better back navigation
- Reliable file selection
- Better Notification behavior
- Safer updates
- Fewer lifecycle-related duplicates
- More reliable Play Store releases

---

# Phase 6 Exit Gate

```text
□ Android build uses one authoritative Web artifact.

□ Native overrides are reproducible.

□ Lifecycle tests pass.

□ Back behavior is defined.

□ Content URI behavior is safe.

□ Notification permission is contextual.

□ Secure-storage recovery is safe.

□ Local migrations survive interruption.

□ Final manifest is approved.

□ AAB verification passes.

□ Staged rollout and halt procedures exist.
```

---

# Phase 7 Practical Plan — Privacy, Deletion, Support and Compliance

## Objective

Make privacy promises and store declarations technically true.

---

# Phase 7.1 — Preference Registry

Potential module:

```text
js/application/preferences/
```

Potential preference fields:

```text
analyticsEnabled

assistantHistoryEnabled

notificationPrivacyLevel

advertisingPersonalizationEnabled

privacyModeEnabled
```

Only include active approved preferences.

---

# Phase 7.2 — Optional Provider Initialization

Create initialization gates.

Conceptual:

```typescript
interface OptionalProviderGate {
  canInitialize(
    ownerId: string,
    capability: string
  ): Promise<boolean>;
}
```

Providers must not initialize from UI convenience alone.

---

# Phase 7.3 — Complete Export

Potential modules:

```text
js/application/export/

js/infrastructure/export/
```

Export contract should define:

- Owner
- Scope
- Format
- Generated time
- Currency representation
- Attachments
- Expiration
- Job identity
- Partial failure

---

# Phase 7.4 — Account Deletion Coordinator

Potential:

```text
js/application/account-deletion/
```

Possible modules:

```text
request-deletion.js

deletion-state-machine.js

revoke-sessions.js

delete-product-data.js

delete-attachments.js

delete-provider-identities.js

verify-deletion.js
```

Sensitive operations should be server-authoritative where required.

---

# Phase 7.5 — Deletion Ledger

Potential remote fields:

```text
deletionRequestId

ownerId

requestedAt

state

providerStates

backupAuthorityState

completedAt
```

The ledger must not become a hidden active Profile.

---

# Phase 7.6 — Public Policy Alignment

Review:

```text
politica-de-privacidade.html

excluir-conta.html

PLAY_STORE_LISTING.md
```

Verify against actual:

- Providers
- Data categories
- Retention
- User controls
- Advertising
- Analytics
- Assistant
- Account deletion
- Support contact

---

# Phase 7.7 — Safe Support Diagnostics

Potential:

```text
js/application/support/support-diagnostics-service.js
```

Allowed default fields:

- App version
- Platform
- Schema version
- Sync-state category
- Pending-operation count bucket
- Error codes
- Provider-health category

Excluded:

- Balances
- Transaction Amounts
- Descriptions
- Tokens
- Raw rows

---

# Phase 7.8 — Compliance Registries

Create:

```text
docs/registries/PROVIDER-REGISTRY.md

docs/registries/PERMISSION-REGISTRY.md

docs/registries/SDK-REGISTRY.md

docs/registries/CLAIM-REGISTRY.md

docs/registries/FEATURE-FLAG-REGISTRY.md

docs/registries/RETENTION-REGISTRY.md
```

---

# Phase 7 Tests

```text
Choice refused

Choice accepted

Choice withdrawn

Offline withdrawal

Account switch

Complete Export

Deletion from application

Deletion from public path

Provider cleanup failure

Backup restore after deletion

Support diagnostic preview

Policy URL accessibility

Store declaration comparison
```

---

# Phase 7 Visible Deliverables

- Clear privacy settings
- Functional Account deletion
- Better Export
- Safer Support diagnostics
- Accurate public policies
- Correct Play Store declarations

---

# Phase 7 Exit Gate

```text
□ Optional providers respect current preference.

□ Withdrawal stops future processing.

□ Export scope is accurate.

□ Account deletion is end to end.

□ Deletion survives backup recovery.

□ Support diagnostics are minimized.

□ Public policy pages match implementation.

□ Store declarations match the release.

□ Compliance registries are current.

□ Evidence is archived.
```

---

# Phase 8 Practical Plan — Providers, Analytics and Notifications

## Objective

Add external capabilities through controlled Adapters.

---

# Phase 8.1 — Provider Interface Directory

Potential:

```text
js/infrastructure/providers/
```

Potential interfaces:

```text
notification-provider.js

analytics-provider.js

attachment-storage-provider.js

export-provider.js

import-provider.js
```

---

# Phase 8.2 — Canonical Provider Errors

Map provider-specific errors into:

```text
unavailable

timeout

rate_limited

authentication_required

authorization_denied

invalid_request

conflict

unknown_outcome

permanent_failure
```

---

# Phase 8.3 — Notification Adapter

Potential modules:

```text
js/application/notifications/

js/infrastructure/providers/notifications/
```

Likely migration source:

```text
js/core/notifications.js
```

---

# Phase 8.4 — Analytics Registry and Adapter

Potential:

```text
js/application/analytics/

js/infrastructure/providers/analytics/
```

Event definitions should be centralized.

Example safe event:

```typescript
{
  eventName: "transaction_form_opened",
  properties: {
    platform: "android",
    entryPoint: "dashboard"
  }
}
```

Prohibited:

```typescript
{
  amount: 1250.00,
  description: "Rent",
  balance: 3420.15
}
```

---

# Phase 8.5 — Provider Identity Reset

On Account switch:

```text
Flush approved events

Stop current provider session

Clear previous owner identity

Apply new owner's preference

Initialize only approved provider state
```

---

# Phase 8.6 — Import Provider Expansion

Every new Import provider should first produce candidates.

Do not write canonical Transactions directly from unreviewed external data.

---

# Phase 8.7 — Export Destination Expansion

External delivery should separate:

```text
Export generated

Upload accepted

Provider processing

Delivery confirmed
```

---

# Phase 8 Tests

```text
Provider unavailable

Provider timeout

Rate limit

Choice refusal

Choice withdrawal

Account switch

Deletion

Offline queue

Unexpected provider response

Provider Adapter replacement
```

---

# Phase 8 Exit Gate

```text
□ Provider-specific types remain outside Domain.

□ Provider errors are normalized.

□ Notifications use stable identities.

□ Analytics uses an allowlisted registry.

□ Financial payloads are excluded.

□ Provider identity resets correctly.

□ Import providers produce reviewable candidates.

□ Export destinations report accurate states.

□ Provider kill switches exist where required.

□ Provider exit documentation exists.
```

---

# Phase 9 Practical Plan — Assistant and AI

## Objective

Introduce optional AI only after deterministic capabilities are stable.

---

# Phase 9.1 — Read-Only Assistant Shell

Potential modules:

```text
js/application/assistant/

js/infrastructure/providers/assistant/

js/ui/components/assistant/
```

Initial capabilities:

- Explain available Report
- Summarize current period
- Explain synchronization state
- Help navigate features

---

# Phase 9.2 — Context Builder

The context builder should request approved projections rather than raw database access.

Potential:

```text
build-account-summary-context.js

build-report-summary-context.js

build-goal-summary-context.js
```

---

# Phase 9.3 — Structured Output Validation

Every structured Assistant response should validate against a schema.

Invalid output must not enter Domain commands.

---

# Phase 9.4 — Proposal Store

Potential fields:

```text
proposalId

ownerId

proposalType

payload

sourceVersions

createdAt

expiresAt

state
```

---

# Phase 9.5 — Confirmation Boundary

The confirmation screen should show:

- Action type
- Account
- Amount
- Currency
- Date
- Category
- Consequences
- Current source data
- Expiration

Confirmation invokes the same Application command as manual UI.

---

# Phase 9.6 — Assistant History Preference

Implement:

- Disabled default where required
- Owner-scoped history
- Clear history
- Delete with Account
- Provider retention handling
- Manual fallback

---

# Phase 9.7 — Assistant Support Diagnostics

Record only:

- Capability ID
- Error category
- Proposal state
- Confirmation state
- Provider-health category

Avoid raw prompts by default.

---

# Phase 9 Tests

```text
Wrong owner context

Deleted entity

Stale proposal

Expired proposal

Provider timeout

Invalid structured output

History disabled

Account switch

Manual fallback

No confirmation

Repeated confirmation

Unknown command outcome
```

---

# Phase 9 Exit Gate

```text
□ Assistant is optional.

□ Context is minimized.

□ Deterministic services provide financial totals.

□ Structured output is validated.

□ Proposals are owner-scoped and expiring.

□ Confirmation is mandatory.

□ Application commands preserve operation identity.

□ History preference works.

□ Manual alternatives remain available.

□ Provider failure cannot mutate financial state.
```

---

# Phase 10 Practical Plan — Advertising and Monetization

## Objective

Introduce monetization without compromising financial trust.

---

# Phase 10.1 — Advertising Provider Adapter

Potential:

```text
js/infrastructure/providers/advertising/
```

The UI should request an approved placement, not call the Advertising SDK directly.

---

# Phase 10.2 — Placement Registry

Potential document:

```text
docs/registries/AD-PLACEMENT-REGISTRY.md
```

Fields:

```text
placementId

screen

format

eligibility

personalization

privacy restrictions

accessibility behavior

failure behavior

owner
```

---

# Phase 10.3 — Safe Initial Placement

The first placement should avoid:

- Transaction forms
- Transfer confirmation
- Account deletion
- Conflict Center
- Support
- Privacy settings
- Authentication
- Recovery

---

# Phase 10.4 — Advertising Choice Gate

Before personalized Advertising where applicable:

- Show accurate notice.
- Record choice.
- Apply regional and audience rules.
- Initialize provider only after gate.
- Support withdrawal.
- Support Account switch.
- Support deletion.

---

# Phase 10.5 — Publisher Authorization

Verify public authorization resource at the approved domain.

Monitor:

- HTTPS
- Content
- Publisher identifier
- Domain
- Provider recognition
- Unexpected changes

---

# Phase 10.6 — Advertising Kill Switch

The switch should:

- Stop requests.
- Collapse placements.
- Preserve layout.
- Preserve navigation.
- Preserve privacy settings.
- Be independently controlled.

---

# Phase 10.7 — Subscription Discovery

Do not implement subscriptions until Product decisions define:

- Plans
- Features
- Pricing source
- Billing periods
- Entitlements
- Advertising relationship
- Account deletion behavior
- Restore purchase

---

# Phase 10 Tests

```text
Advertising enabled

Advertising unavailable

Choice declined

Choice withdrawn

Offline

Account switch

Account deletion

Privacy mode

Screen reader

Kill switch

Prohibited placement absence
```

---

# Phase 10 Exit Gate

```text
□ Advertising uses an Adapter.

□ Placements are registered.

□ Protected workflows contain no ads.

□ Financial context is excluded.

□ Choice and withdrawal work.

□ Account switching resets Advertising identity.

□ Account deletion processes Advertising identity.

□ Kill switch works.

□ Publisher authorization is valid.

□ Core Product remains fully functional without ads.
```

---

# Phase 11 Practical Plan — Optimization, Recovery and Operational Maturity

## Objective

Move from functional completion to sustainable Production maturity.

---

# Phase 11.1 — Performance Budget Enforcement

Add budgets for:

- Startup
- Main-thread blocking
- Transaction-list rendering
- Report calculation
- Synchronization batch
- Memory
- Web bundle
- Android package

---

# Phase 11.2 — Query Optimization

Review:

- Transaction list queries
- Report aggregation
- Account balance derivation
- Synchronization Pull
- Deletion jobs
- Support diagnostics
- Provider cleanup

Use query-plan evidence.

---

# Phase 11.3 — Cache Review

Classify every cache:

```text
Public asset

Derived financial projection

Provider response

UI state

Authentication state

Sensitive temporary content
```

Define invalidation and deletion.

---

# Phase 11.4 — Backup Automation

Implement and verify:

- Database backup
- Attachment backup
- Backup catalog
- Encryption
- Retention
- Restore access
- Deletion reconciliation

---

# Phase 11.5 — Recovery Exercises

Required exercises:

```text
Owner-level restore

Single Transaction recovery

Bulk deletion recovery

Local database corruption

Synchronization queue recovery

Remote rollback

Attachment recovery

Android migration failure

Complete database restore
```

---

# Phase 11.6 — Operational Dashboards

Recommended dashboards:

```text
Authentication

Financial commands

Synchronization

Database

Android stability

Provider health

Deletion

Export

Support

Recovery

Compliance
```

---

# Phase 11.7 — Runbook Completion

Create or verify runbooks for:

```text
Authentication outage

Synchronization outage

Duplicate mutation

Database migration failure

Android crash release

Provider outage

Account deletion failure

Advertising incident

Assistant incident

Restore
```

---

# Phase 11.8 — Technical Debt Closure

Prioritize removal of:

- Legacy global writers
- Legacy CSS
- Old storage Adapter
- Old synchronization queue
- Expired Feature Flags
- Temporary dual reads
- Deprecated provider SDK
- Outdated public policies
- Unowned runbooks

---

# Phase 11.9 — Documentation Traceability

Every critical requirement should map to:

```text
Specification

Implementation

Test

Operational metric

Recovery procedure

Release evidence
```

This becomes the input for `docs/23-REQUIREMENTS-TRACEABILITY-MATRIX.md`.

---

# Phase 11 Exit Gate

```text
□ Performance budgets are enforced.

□ Critical queries are measured.

□ Caches have owners and invalidation.

□ Backups are automated and tested.

□ Recovery exercises pass.

□ Operational dashboards exist.

□ Critical runbooks are current.

□ Temporary migration architecture is removed.

□ Stale Feature Flags are removed.

□ Critical requirements have traceability.
```

---

# Database Migration Master Order

The exact migrations depend on discovery, but the safe conceptual order is:

```text
1. Capture current schema baseline.

2. Introduce migration tracking.

3. Add missing owner fields and relationships.

4. Backfill deterministic ownership.

5. Quarantine ambiguous rows.

6. Add owner indexes.

7. Enable or correct RLS.

8. Add stable operation ledger.

9. Add version fields.

10. Add new Domain fields additively.

11. Deploy compatible application readers.

12. Deploy compatible writers.

13. Backfill Money, Currency and Transfer data.

14. Validate financial invariants.

15. Stop legacy writes.

16. Remove legacy reads.

17. Apply destructive cleanup later.
```

---

# Database Migration Prohibitions

Do not:

- Drop legacy columns before compatibility ends.
- Infer owner from current session during bulk migration.
- Convert Amount with floating-point arithmetic.
- Disable RLS globally for convenience.
- Recreate operation IDs.
- Perform broad repair without backup.
- Mix unrelated schema redesigns in one migration.
- claim rollback when only restore exists.

---

# Local Storage Migration Master Order

```text
1. Detect current storage technologies.

2. Identify current owner namespace.

3. Add read-only legacy Adapter.

4. Introduce local schema version.

5. Create new owner-scoped database.

6. Copy canonical records.

7. Convert Money and Currency.

8. Convert pending operations.

9. Validate counts and relationships.

10. Switch new writes to the new store.

11. Keep legacy data during recovery window.

12. Confirm synchronization.

13. Remove legacy data later.
```

---

# JavaScript Migration Master Order

```text
1. Identify active global functions.

2. Add characterization tests.

3. Create Domain contracts.

4. Create Application commands.

5. Create infrastructure Adapters.

6. Route legacy UI through new commands.

7. Build new shared UI.

8. Migrate platform screens.

9. Remove direct provider access from UI.

10. Remove legacy global mutation paths.

11. Remove compatibility Adapter.
```

---

# CSS Migration Master Order

```text
1. Document active cascade.

2. Create runtime tokens.

3. Create shared component styles.

4. Add platform adaptation layers.

5. Move one component at a time.

6. Capture visual regression evidence.

7. Remove migrated legacy selectors.

8. Reduce specificity.

9. Remove redundant stylesheets.

10. Validate Android asset output.
```

---

# Android Migration Master Order

```text
1. Identify Web asset authority.

2. Automate asset build.

3. Automate Capacitor sync.

4. Apply versioned native overrides.

5. Validate lifecycle.

6. Validate local storage and migration.

7. Validate permissions.

8. Validate Notifications and deep links.

9. Validate signing.

10. Generate AAB.

11. Use internal testing.

12. Use controlled Production rollout.
```

---

# Visible Release Increment Strategy

The roadmap should not wait until all phases finish before users receive value.

Recommended release increments:

---

# Release Increment A — Safety Baseline

User-visible changes may be minimal.

Internal outcomes:

- Reproducible builds
- Initial tests
- P0 corrections
- Release metadata
- Backup verification

---

# Release Increment B — Financial Correctness

Visible outcomes:

- Correct Money formatting
- Explicit Currency
- Correct Transfer behavior
- More accurate Reports
- Better validation

---

# Release Increment C — Durable Offline and Sync

Visible outcomes:

- Saved locally status
- Pending synchronization status
- Conflict review
- Reduced duplicates
- Safer Account switching

---

# Release Increment D — UI Foundation

Visible outcomes:

- Consistent theme
- Better dark mode
- Better forms
- Better loading and error states
- Improved Accessibility

---

# Release Increment E — Adaptive Platforms

Visible outcomes:

- Improved Desktop
- Improved Tablet
- Improved Mobile
- Better foldable layout

---

# Release Increment F — Android Hardening

Visible outcomes:

- Better startup
- Better file selection
- Better Notifications
- Safer updates
- Better back behavior

---

# Release Increment G — Privacy and User Rights

Visible outcomes:

- Privacy controls
- Complete Export
- Functional Account deletion
- Better Support diagnostics
- Accurate public policies

---

# Release Increment H — Optional Providers

Visible outcomes:

- Notifications
- Approved Analytics
- Additional Import and Export capabilities

---

# Release Increment I — Assistant

Visible outcomes:

- Read-only summaries
- Explanations
- Reviewable proposals
- Confirmed optional actions

---

# Release Increment J — Monetization

Visible outcomes where approved:

- Safe Advertising
- Optional plans or subscription features

---

# Required Test Progression

## Phase 0

```text
Manual baseline

RLS safety checks

Build verification
```

## Phase 1

```text
Static checks

Characterization tests

Build tests

CI
```

## Phase 2

```text
Domain unit tests

Financial golden tests

Database integration tests

RLS tests
```

## Phase 3

```text
Local-storage tests

Synchronization integration tests

Failure injection

Multi-owner tests
```

## Phase 4

```text
Component tests

Accessibility tests

Visual regression

Theme tests
```

## Phase 5

```text
Cross-platform end-to-end tests

Responsive tests

Large-text tests
```

## Phase 6

```text
Android lifecycle tests

Permission tests

Deep-link tests

Upgrade tests

Artifact tests
```

## Phase 7

```text
Privacy-choice tests

Export tests

Deletion tests

Recovery-deletion tests

Support diagnostics tests
```

## Phase 8

```text
Provider contract tests

Notification tests

Analytics lifecycle tests

Provider failure tests
```

## Phase 9

```text
Assistant evaluation

Structured-output tests

Proposal and confirmation tests

Privacy tests
```

## Phase 10

```text
Advertising placement tests

Choice tests

Kill-switch tests

Store declaration tests
```

## Phase 11

```text
Performance tests

Recovery exercises

Operational exercises

Audit evidence
```

---

# Cross-Phase Release Gate

No phase may enter broad Production rollout when:

```text
A P0 defect remains unresolved.

Required migration evidence is missing.

Owner isolation is uncertain.

Financial reconciliation fails.

Rollback or recovery is absent.

Android artifact identity is uncertain.

Public policy materially conflicts with behavior.

A required provider kill switch is unavailable.

Critical Accessibility journeys are blocked.
```

---

# Cross-Phase Completion Gate

A phase is complete only when:

```text
□ Committed scope is delivered.

□ Acceptance criteria pass.

□ Persistent migrations complete.

□ Compatibility behavior is documented.

□ Rollback or recovery is validated.

□ Production evidence exists.

□ Documentation is updated.

□ Support is updated.

□ Monitoring is active.

□ Temporary code has an owner and expiration.

□ No unowned Critical or High follow-up remains.
```

---

# Part 2 Implementation Anti-Patterns

The following are prohibited:

## File-Name-Driven Rewrite

Assuming a file is legacy or active without runtime verification.

## New Directory as Completion

Creating architecture folders without routing real behavior through them.

## Duplicate Domain Logic

Keeping separate calculations in Desktop, Mobile and Reports.

## UI Direct to Supabase

Allowing new UI components to bypass Application and Domain boundaries.

## Local Migration by Deletion

Removing old storage before validating new storage.

## New Queue beside Old Queue

Allowing two synchronization engines to execute the same command.

## Owner Backfill by Guess

Assigning ambiguous rows without evidence.

## Amount Conversion through Floating Point

Risking financial-value corruption.

## RLS Disabled during Migration

Removing owner protection for convenience.

## Android Manual Copy Dependency

Requiring undocumented human copying for every build.

## Policy Text before Technical Control

Publishing optionality or deletion claims that are not implemented.

## Analytics before Event Registry

Allowing arbitrary event fields.

## Assistant before Confirmation Infrastructure

Creating mutation-capable AI without stable proposals.

## Advertising in Protected Workflow

Placing ads near authentication, deletion or financial confirmation.

## Phase Closure with Legacy Writer

Calling migration complete while the old canonical writer remains active.

## Tests Added after Data Migration

Changing persistent financial data before verification exists.

## Rollback that Cannot Read New Data

Deploying a previous version incompatible with migrated state.

---

# Part 2 Review Questions

Before implementing a package, answer:

```text
Which current file executes this behavior?

Which current file stores this data?

Which target contract will own it?

Which compatibility Adapter is needed?

Which persistent data changes?

Which older clients remain?

Which operation identities remain stable?

Which tests fail before the change and pass after it?

Which visible user outcome results?

Which old path is removed?
```

---

# Repository File Review Questions

```text
Is the file active in Web?

Is the file active in Android?

Is it generated?

Is it copied manually?

Does another file define the same behavior?

Does changing it affect Production build?

Can the change be isolated?
```

---

# Database Review Questions

```text
Which rows are affected?

Which owners are affected?

How is ownership proven?

Is the migration additive?

Which lock occurs?

Which old clients remain compatible?

Which financial validation follows?

Which backup exists?
```

---

# Local Storage Review Questions

```text
Which local-only records exist?

Which pending operations exist?

Which owner namespace exists?

Can migration resume?

Can the old store remain read-only?

When is legacy data removed?

What happens after low storage or process death?
```

---

# UI Migration Review Questions

```text
Does the new UI use the existing Application command?

Does it introduce a new calculation?

Does it represent every state?

Does it preserve Accessibility?

Does it preserve platform behavior?

Does it work with pending synchronization?

Can legacy CSS be removed afterward?
```

---

# Android Review Questions

```text
Which Web artifact enters Android?

Which native override applies?

Does lifecycle interruption duplicate work?

Which permission is added?

Does denial preserve core functionality?

Can the previous Android version remain safe?

Does the AAB contain Production configuration?
```

---

# Provider Review Questions

```text
Which Adapter contains provider behavior?

Which data leaves Nexio?

Which preference applies?

Which identity applies?

What happens after Account switch?

What happens after deletion?

Which kill switch exists?
```

---

# Part 2 Acceptance Criteria

The practical implementation plan is accepted only when:

```text
□ Every phase has concrete implementation packages.

□ Listed file impacts require runtime verification.

□ A working baseline is preserved before major changes.

□ Characterization occurs before replacement.

□ Canonical capabilities have one active writer.

□ Providers and persistence use Adapter-first migration.

□ Feature Flags are used only for governed transition and rollout.

□ Phase 0 maps runtime entry points.

□ Phase 0 maps CSS authority.

□ Phase 0 inventories persistent data.

□ Phase 0 inventories Database and RLS.

□ Phase 0 inventories Android build behavior.

□ Phase 0 inventories Production configuration.

□ Confirmed urgent risks become P0 work.

□ Phase 1 defines reproducible development commands.

□ Phase 1 defines an environment schema.

□ Phase 1 creates a controlled bootstrap boundary.

□ Phase 1 creates safe startup errors.

□ Phase 1 establishes test directories and fixtures.

□ Phase 1 adds characterization tests.

□ Phase 1 establishes CI.

□ Phase 1 exposes safe release metadata.

□ Phase 1 inventories dependencies.

□ Phase 2 introduces UI-independent Domain modules.

□ Phase 2 defines exact Money.

□ Money migration includes parse, format, arithmetic and round-trip tests.

□ Phase 2 defines explicit Currency.

□ Phase 2 defines canonical Transaction commands.

□ Phase 2 defines canonical Transfer behavior.

□ Phase 2 defines Accounts, Categories and Goals.

□ Reports use deterministic query services.

□ Database history moves toward ordered migrations.

□ Owner fields are backfilled only when ownership is proven.

□ Ambiguous records are quarantined.

□ RLS is verified after owner migration.

□ Domain constraints are added after data validation.

□ Existing data is audited before conversion.

□ Phase 3 introduces a storage interface.

□ Existing storage is wrapped before replacement.

□ Local schema becomes versioned.

□ Local data becomes owner-scoped.

□ Operation ledgers are introduced.

□ Local entity changes and queue records commit atomically.

□ Synchronization has a bounded engine boundary.

□ Retry categories are explicit.

□ Unknown outcomes preserve original operation identity.

□ Conflicts are stored explicitly.

□ Checkpoints are owner- and protocol-scoped.

□ Legacy local data uses a resumable migration.

□ Account switching is transactional.

□ Multi-tab migration is coordinated.

□ Offline UI states are accurate.

□ Phase 4 establishes runtime token authority.

□ Legacy CSS load order is controlled.

□ Shared accessible components are introduced.

□ Financial forms are shared.

□ Platform navigation does not own Domain state.

□ Light and dark themes are tested.

□ Privacy mode masks before sensitive paint.

□ Core screens migrate in dependency order.

□ Phase 5 preserves one Domain across all platforms.

□ Desktop productivity workflows are completed.

□ Tablet uses adaptive layouts.

□ Mobile uses compact responsive layouts.

□ Foldable behavior is tested.

□ Cross-platform totals and commands remain equivalent.

□ Phase 6 chooses one Android Web-asset authority.

□ Capacitor sync becomes reproducible.

□ Native overrides are versioned.

□ MainActivity lifecycle behavior is tested.

□ Android Back behavior is defined.

□ File selection uses safe content URI behavior.

□ Notifications use stable identities.

□ Secure storage does not contain canonical financial data.

□ Android migrations survive interruption.

□ Final merged manifest is reviewed.

□ AAB verification is mandatory.

□ Phase 7 implements owner-scoped preferences.

□ Optional provider initialization is gated.

□ Complete Export is owner-safe.

□ Account deletion uses a coordinator and ledger.

□ Public policies are aligned with Product behavior.

□ Support diagnostics are minimized.

□ Compliance registries are introduced.

□ Phase 8 uses provider interfaces.

□ Provider errors are canonicalized.

□ Notifications migrate behind an Adapter.

□ Analytics events use a registry.

□ Provider identity resets after Account switch.

□ Imports remain candidate-based.

□ External Export delivery uses explicit states.

□ Phase 9 begins with read-only Assistant behavior.

□ Assistant context uses approved projections.

□ Structured output is validated.

□ Proposals are owner-scoped and expiring.

□ Confirmation invokes canonical Application commands.

□ Assistant history follows user preference.

□ Phase 10 introduces Advertising behind an Adapter.

□ Advertising placements are registered.

□ Initial ads avoid protected workflows.

□ Advertising choice is applied before applicable processing.

□ Publisher authorization is monitored.

□ Advertising has a kill switch.

□ Subscription implementation waits for defined Product rules.

□ Phase 11 enforces performance budgets.

□ Critical queries are reviewed with evidence.

□ Caches are classified.

□ Backups are automated.

□ Recovery exercises are performed.

□ Operational dashboards are created.

□ Critical runbooks are current.

□ Temporary architecture is removed.

□ Requirement traceability is prepared.

□ Database migration follows additive-first sequencing.

□ Local storage migration preserves the legacy store during validation.

□ JavaScript migration separates Domain, Application and infrastructure.

□ CSS migration removes selectors incrementally.

□ Android migration uses controlled build and rollout.

□ Users receive value through safe release increments.

□ Required tests become broader as phases progress.

□ Cross-phase release blockers are explicit.

□ Phase completion requires migration, evidence, documentation and cleanup.

□ Part 2 implementation anti-patterns are prohibited.
```

---

# Practical Implementation Constitutional Rule

Every file change, schema migration, local migration, UI replacement, Android modification, provider integration and release increment must answer:

```text
Which current behavior is being replaced, which valid user state is being preserved, which contract becomes authoritative, which tests prove the transition and which old path is removed after success?
```

When the answer is uncertain, prefer the implementation that:

- Reads the current code first.
- Adds characterization tests.
- Creates a stable interface.
- Wraps the legacy implementation.
- Uses additive schema changes.
- Preserves old local data.
- Keeps one canonical writer.
- Uses a Feature Flag.
- Uses a small rollout.
- Delays destructive cleanup.
- Adds a recovery point.
- Blocks the migration.
- Rejects the change.

Implementation progress is not measured by the number of files changed.

It is measured by the number of complete, tested and recoverable capabilities that have one clear authority and no uncontrolled legacy writer.

---
---

# Program Dependency Architecture

The implementation program must preserve a visible dependency model.

A work item should not enter implementation merely because it is desirable.

It should enter implementation when:

```text
Its prerequisites are complete.

Its interfaces are defined.

Its persistent-data impact is understood.

Its owner is available.

Its test strategy exists.

Its rollback or recovery path exists.
```

---

# Dependency Matrix

The following matrix describes the primary dependency relationships among the implementation phases.

| Phase | Depends On | Produces | Blocks |
|---|---|---|---|
| Phase 0 — Discovery and Safety | Current repository and Production access | Verified baseline and risk register | All broad migrations |
| Phase 1 — Repository, Build and Tests | Phase 0 baseline | Reproducible builds, CI and characterization tests | Safe Domain and platform migrations |
| Phase 2 — Domain and Data | Phases 0 and 1 | Canonical financial contracts and versioned database structure | Reliable synchronization, Reports and AI actions |
| Phase 3 — Local Storage and Sync | Phases 1 and 2 | Durable owner-scoped operations and synchronization | Safe offline UX, multi-device operation and AI mutations |
| Phase 4 — Design System and Core UI | Phase 1 and stable Application contracts | Shared accessible components and UI state models | Platform completion |
| Phase 5 — Desktop, Tablet and Mobile | Phases 3 and 4 | Complete adaptive user journeys | Android final hardening and broad rollout |
| Phase 6 — Android Hardening | Phases 1, 3, 4 and 5 | Reliable Android lifecycle and publishable artifact | Stable Google Play Production release |
| Phase 7 — Privacy, Deletion and Compliance | Phases 1, 2, 3 and provider inventory | Functional user rights and accurate declarations | Optional Analytics, AI history and Advertising |
| Phase 8 — Providers, Analytics and Notifications | Phases 3 and 7 | Governed external capabilities | Advanced automation and growth work |
| Phase 9 — Assistant and AI | Phases 2, 3, 4, 7 and 8 | Bounded optional AI assistance | AI action expansion |
| Phase 10 — Advertising and Monetization | Phases 6, 7 and provider governance | Safe monetization | Monetization scale |
| Phase 11 — Optimization and Maturity | All applicable prior phases | Operational maturity and legacy removal | Final program closure |

---

# Workstream Dependency Matrix

| Workstream | Primary Inputs | Primary Outputs |
|---|---|---|
| Repository and Build | Current repository, package configuration | Reproducible artifacts |
| Domain and Financial Integrity | Existing financial behavior | Canonical contracts |
| Data Model and Database | Domain contracts, schema inventory | Owner-safe persistence |
| Local Storage and Sync | Domain contracts, persistence interfaces | Durable operation processing |
| Authentication and Owner Isolation | Authentication provider, owner model | Safe owner lifecycle |
| Design System | Current CSS, accessibility rules | Shared primitives |
| Platform UI | Design System, Application services | Adaptive screens |
| Android | Web artifact, local storage, platform UI | Signed Production artifact |
| Privacy and Compliance | Data flows, providers, user controls | Accurate policy and store evidence |
| Providers | Stable Adapter contracts | Bounded external capabilities |
| Analytics | Privacy controls, event registry | Optional measurement |
| Assistant | Domain queries, command infrastructure | Optional AI assistance |
| Advertising | Privacy gates, store readiness | Safe ad delivery |
| Testing | Contracts and risk model | Release evidence |
| Operations | Artifacts, monitoring and runbooks | Controlled Production operation |
| Recovery | Backup sources and data model | Verified restore capability |
| Support | Diagnostics and error taxonomy | Safe user assistance |
| Documentation | All workstreams | Traceable authoritative knowledge |

---

# Hard Dependencies

A hard dependency blocks implementation.

Examples:

```text
Assistant Transaction proposals

require

Stable idempotent Transaction commands.
```

```text
Account deletion completion

requires

Provider deletion and backup-reconciliation behavior.
```

```text
Android Production rollout

requires

Reproducible signing and final manifest review.
```

---

# Soft Dependencies

A soft dependency improves delivery but may not block a bounded change.

Example:

```text
A visual empty-state improvement

may proceed before

complete Report performance optimization.
```

The change must still use current authoritative contracts.

---

# Circular Dependency Handling

When two work items depend on each other:

1. Identify the minimal interface needed by both.
2. Define the interface before either implementation.
3. Create synthetic or temporary test Adapters.
4. Implement one authoritative side first.
5. Integrate incrementally.
6. Remove temporary mocks after integration.

Do not solve circular dependencies by duplicating business logic.

---

# Dependency Readiness States

Recommended:

```text
unknown

identified

contract_pending

implementation_pending

available_for_testing

ready

obsolete
```

---

# Dependency Failure

When a dependency fails after rollout:

- Stop dependent expansion.
- Activate degraded behavior.
- Preserve user intent.
- Use Feature Flags where approved.
- Reclassify affected milestones.
- Update release and Support communication.
- Do not silently substitute an unsafe implementation.

---

# Program Delivery Waves

The phases should be delivered through waves rather than one long invisible implementation period.

A wave is a group of milestones that:

- Share a common Production outcome.
- Can be validated together.
- Leave Nexio deployable.
- Have an explicit entry and exit gate.
- Do not create an uncontrolled second architecture.

---

# Wave Model

Recommended waves:

```text
Wave 0 — Baseline and Containment

Wave 1 — Reproducible Engineering Foundation

Wave 2 — Financial Domain Authority

Wave 3 — Owner-Safe Persistence

Wave 4 — Durable Offline and Synchronization

Wave 5 — Shared Accessible Interface

Wave 6 — Adaptive Web Experience

Wave 7 — Android Production Readiness

Wave 8 — Privacy, Deletion and Compliance

Wave 9 — Providers and Optional Measurement

Wave 10 — Assistant and AI

Wave 11 — Advertising and Monetization

Wave 12 — Optimization, Recovery and Program Closure
```

---

# Wave 0 — Baseline and Containment

## Purpose

Understand the active Product and stop confirmed immediate risks.

## Included Milestones

```text
Runtime map

CSS map

Data-location inventory

Database and RLS inventory

Android build map

Provider inventory

Configuration inventory

Current risk register

Recoverable release baseline
```

## Entry Gate

```text
□ Repository is available.

□ Current deployment can be identified.

□ Current Android project can be inspected.

□ Current environment ownership is known.
```

## Exit Gate

```text
□ Active runtime is documented.

□ Canonical data locations are identified.

□ P0 findings have owners.

□ Current Production revision is recoverable.

□ Broad migration scope is evidence-based.
```

---

# Wave 1 — Reproducible Engineering Foundation

## Purpose

Ensure every later change can be built, tested and traced.

## Included Milestones

```text
Working package scripts

Environment schema

Controlled bootstrap

Initial characterization tests

CI baseline

Release metadata

Dependency registry

Secret scanning
```

## Visible User Impact

Minimal by design.

Potential visible improvements:

- Safer startup error
- Version information
- Reduced configuration failures

## Exit Gate

```text
□ Clean Web build passes.

□ Clean Android build passes.

□ Required tests run automatically.

□ Release artifacts map to source revision.

□ Current behavior has baseline tests.
```

---

# Wave 2 — Financial Domain Authority

## Purpose

Create one authoritative financial interpretation.

## Included Milestones

```text
Money

Currency

Accounts

Transactions

Transfers

Categories

Goals

Financial periods

Deterministic Reports

Golden dataset
```

## Visible User Impact

- Consistent Currency presentation
- More accurate balances
- Correct Transfer display
- Better validation
- More reliable Reports

## Exit Gate

```text
□ Exact Money tests pass.

□ Explicit Currency tests pass.

□ Transfer invariants pass.

□ Reports use canonical query services.

□ UI-specific financial calculations are identified for removal.
```

---

# Wave 3 — Owner-Safe Persistence

## Purpose

Create versioned, owner-bound remote and local persistence.

## Included Milestones

```text
Database migration history

Owner relationships

RLS

Local storage interface

Owner namespaces

Schema versions

Persistent entity repositories
```

## Exit Gate

```text
□ Cross-owner remote tests pass.

□ Cross-owner local tests pass.

□ Ambiguous records are quarantined.

□ Database and local schema versions are explicit.

□ Existing valid records remain readable.
```

---

# Wave 4 — Durable Offline and Synchronization

## Purpose

Preserve confirmed intent and prevent duplicate remote effects.

## Included Milestones

```text
Stable operation IDs

Atomic local Save and queue

Retry policy

Unknown-outcome reconciliation

Conflict Center

Checkpoints

Full resynchronization

Account-switch transaction

Multi-tab coordination
```

## Visible User Impact

- “Saved locally” state
- Pending synchronization indicators
- Conflict review
- Reduced duplicate risk
- Safer cross-device behavior

## Exit Gate

```text
□ Offline-created Transaction survives restart.

□ Reconnection synchronizes once.

□ Timeout retry preserves operation ID.

□ Account switch leaks no previous-owner state.

□ Full resynchronization preserves pending intent.
```

---

# Wave 5 — Shared Accessible Interface

## Purpose

Create the common visual and interaction foundation.

## Included Milestones

```text
Runtime tokens

Core components

Financial form components

Theme architecture

Privacy mode

Status components

Accessible Dialog and Sheet behavior

Content and error taxonomy
```

## Visible User Impact

- Consistent interface
- Improved dark theme
- Better form feedback
- Better keyboard and screen-reader behavior
- Clearer synchronization states

## Exit Gate

```text
□ Core components pass accessibility tests.

□ Theme behavior is consistent.

□ Financial forms call Application commands.

□ Privacy masking happens before sensitive display.

□ Legacy style removal is tracked.
```

---

# Wave 6 — Adaptive Web Experience

## Purpose

Complete Desktop, Tablet and Mobile Web journeys.

## Included Milestones

```text
Desktop shell and workflows

Tablet adaptive layouts

Mobile compact layouts

Foldable behavior

Reports

Goals

Settings

Deletion interface

Cross-platform parity tests
```

## Visible User Impact

A substantially improved Web Product across form factors.

## Exit Gate

```text
□ Critical journeys pass on Desktop.

□ Critical journeys pass on Tablet.

□ Critical journeys pass on Mobile.

□ Responsive transitions preserve state.

□ No platform owns separate Domain logic.
```

---

# Wave 7 — Android Production Readiness

## Purpose

Make Android reliable, reproducible and publishable.

## Included Milestones

```text
Authoritative Web asset output

Automated Capacitor synchronization

Lifecycle handling

Back navigation

File selection

Notifications

Deep links

Secure storage

Local migration recovery

Final manifest review

AAB verification
```

## Visible User Impact

- More reliable updates
- Better back behavior
- Better Notifications
- Safer file handling
- Fewer startup and lifecycle failures

## Exit Gate

```text
□ Internal Android testing passes.

□ Upgrade tests pass.

□ Process-death tests pass.

□ Signed AAB is verified.

□ Google Play rollout can be halted safely.
```

---

# Wave 8 — Privacy, Deletion and Compliance

## Purpose

Make user rights and public claims technically true.

## Included Milestones

```text
Preference registry

Optional provider gates

Complete Export

Account deletion coordinator

Provider cleanup

Backup deletion reconciliation

Safe Support diagnostics

Public policy alignment

Store declaration evidence
```

## Visible User Impact

- Functional Account deletion
- Better data Export
- Clearer privacy controls
- Improved Support diagnostics
- Accurate public information

## Exit Gate

```text
□ Optional refusal and withdrawal work.

□ Account deletion completes end to end.

□ Backup restore does not reactivate deleted owners.

□ Public policy pages match implementation.

□ Store declarations match the release.
```

---

# Wave 9 — Providers and Optional Measurement

## Purpose

Introduce external capabilities only through governed boundaries.

## Included Milestones

```text
Provider interfaces

Notification Adapter

Operational telemetry

Optional Product Analytics

Import providers

Export destinations

Provider identity reset

Provider kill switches
```

## Exit Gate

```text
□ Provider-specific behavior remains outside Domain.

□ Optional Analytics remains inactive before choice.

□ Notification privacy tests pass.

□ Account switching resets provider identity.

□ Provider failures preserve core functionality.
```

---

# Wave 10 — Assistant and AI

## Purpose

Introduce optional assistance over stable deterministic capabilities.

## Included Milestones

```text
Read-only Assistant

Context projections

Structured output

Proposal store

Confirmation boundary

History controls

Provider fallback

Assistant diagnostics
```

## Exit Gate

```text
□ Assistant totals come from deterministic services.

□ Context is owner-scoped and minimized.

□ Proposals expire.

□ Confirmation invokes canonical commands.

□ Provider failure cannot mutate financial data.

□ Manual alternatives remain available.
```

---

# Wave 11 — Advertising and Monetization

## Purpose

Introduce monetization without affecting financial trust.

## Included Milestones

```text
Advertising Adapter

Placement Registry

Choice gate

Publisher authorization

Kill switch

Safe initial placements

Subscription discovery or implementation where approved
```

## Exit Gate

```text
□ Protected workflows contain no Advertising.

□ Financial context does not enter ad requests.

□ Withdrawal works.

□ Account deletion handles Advertising identity.

□ Core Product works without Advertising.

□ Store declarations are current.
```

---

# Wave 12 — Optimization, Recovery and Program Closure

## Purpose

Remove temporary architecture and prove long-term operational maturity.

## Included Milestones

```text
Performance budgets

Query optimization

Cache review

Backup automation

Recovery exercises

Operational dashboards

Runbooks

Technical-debt closure

Provider exit exercises

Requirement traceability
```

## Exit Gate

```text
□ Critical recovery exercises pass.

□ Temporary canonical writers are removed.

□ Stale Feature Flags are removed.

□ Performance budgets are enforced.

□ Critical requirements are traceable.

□ Program closure criteria pass.
```

---

# Indicative Sequence versus Calendar Commitment

The wave order is authoritative.

Calendar duration is not fixed by this document.

Actual timing depends on:

- Team size
- Existing code quality
- Confirmed P0 findings
- Data volume
- Test coverage
- Provider constraints
- Google Play review
- Migration complexity
- Recovery readiness

Do not convert relative wave order into unsupported delivery promises.

---

# Release Cadence

A wave may contain multiple releases.

Recommended release pattern:

```text
Internal validation

↓

Staging validation

↓

Limited Production rollout

↓

Observation

↓

Broader rollout

↓

Wave completion
```

---

# Partial Wave Release

A partial wave release is permitted when:

- The released capability is complete end to end.
- It does not expose unfinished persistent migrations.
- It does not activate a second canonical writer.
- Monitoring and rollback exist.
- Remaining wave work is independently safe.

---

# Program Milestone Prioritization

Implementation priority should combine risk, dependency and user value.

Recommended dimensions:

```text
Safety urgency

Dependency enablement

User impact

Data integrity

Security impact

Privacy impact

Accessibility impact

Reliability impact

Operational impact

Effort

Uncertainty

Reversibility
```

---

# Priority Scoring Model

A simple internal scoring model may use:

```text
Priority Score =
Safety Urgency
+ Dependency Enablement
+ User Impact
+ Reliability Impact
- Effort
- Uncertainty
```

The exact numeric scale may be defined by the team.

The score must not override:

- P0 incidents
- Financial-integrity veto
- Security veto
- Privacy veto
- Accessibility release requirement
- Legal or store requirement
- Hard dependency

---

# Suggested Dimension Scale

Each positive dimension may use:

```text
0 — None

1 — Low

2 — Moderate

3 — High

4 — Critical
```

Effort and uncertainty may use the same scale as deductions.

---

# Safety Urgency

## 4 — Critical

Examples:

- Cross-owner data
- Financial corruption
- Duplicate Transfers
- Confirmed data loss
- Exposed secret
- Failed Account deletion

## 3 — High

Examples:

- Persistent synchronization blockage
- Serious Accessibility blocker
- Incomplete recovery
- Incorrect Report affecting user decisions

## 2 — Moderate

Examples:

- Significant but recoverable usability defect
- Provider degradation with workaround

## 1 — Low

Examples:

- Minor workflow friction
- Cosmetic inconsistency

---

# Dependency Enablement

A work item receives high dependency value when it unlocks many later capabilities.

Examples:

```text
Stable operation IDs

Shared Application command interfaces

Owner-safe local storage

Runtime Design tokens

Versioned migrations
```

---

# User Impact

Evaluate:

- Number of users
- Frequency of journey
- Severity of current pain
- Availability of workaround
- Financial significance
- Accessibility significance

Do not use exact user financial value as a prioritization dimension.

---

# Effort Estimation

Use relative estimates rather than unsupported exact-hour commitments.

Recommended sizes:

```text
XS

S

M

L

XL

Discovery required
```

---

# `XS`

Characteristics:

- One bounded file or configuration
- No persistent-data change
- Existing tests
- Low-risk rollback

---

# `S`

Characteristics:

- Small bounded capability
- Limited file set
- No complex migration
- Straightforward tests

---

# `M`

Characteristics:

- Multiple modules
- New interface or component
- Moderate integration
- Possible compatibility requirement

---

# `L`

Characteristics:

- Cross-layer capability
- Persistent data
- Provider or Android impact
- Significant testing

---

# `XL`

Characteristics:

- Multiple workstreams
- Complex migration
- High-risk Production rollout
- Recovery exercise
- Formal governance

An `XL` item should usually be decomposed.

---

# Discovery Required

Use this state when current behavior is not understood well enough for a credible estimate.

Do not force an estimate before discovery.

---

# Estimation Record

Recommended:

```text
estimate_size

confidence

assumptions

known_dependencies

unknowns

migration_scope

test_scope

review_scope
```

---

# Estimate Confidence

Recommended:

```text
low

moderate

high
```

Confidence should increase after:

- Runtime inspection
- Data profiling
- Interface definition
- Prototype
- Migration rehearsal
- Test design

---

# Estimation Anti-Patterns

Prohibited:

## False Precision

Assigning exact hours to poorly understood migrations.

## Ignoring Validation

Estimating implementation but excluding tests, documentation and rollout.

## Ignoring Existing Data

Estimating a schema change as only a SQL edit.

## Ignoring Android

Estimating a Web capability without lifecycle and store work.

## Ignoring Cleanup

Excluding legacy removal and Feature Flag removal.

## Compressing Risk

Reducing estimates by removing Security, Privacy or Accessibility review.

---

# Risk Management Architecture

The program must maintain a central risk register.

Potential file:

```text
docs/roadmap/RISK-REGISTER.md
```

---

# Risk Categories

Recommended:

```text
Financial integrity

Owner isolation

Data migration

Synchronization

Authentication

Android

Provider

Security

Privacy

Accessibility

Performance

Recovery

Store publication

Compliance

Licensing

Schedule

Knowledge concentration
```

---

# Risk Record

Recommended fields:

```text
risk_id

title

category

description

probability

impact

detectability

exposure

affected_phases

owner

mitigation

contingency

trigger

status

review_date
```

---

# Risk Probability

Recommended:

```text
unlikely

possible

likely

almost_certain
```

---

# Risk Impact

Recommended:

```text
low

moderate

high

critical
```

---

# Risk Detectability

Recommended:

```text
easy

moderate

difficult

silent
```

Silent risks deserve higher priority because they may remain unnoticed.

---

# Risk Exposure

A qualitative exposure may combine:

```text
Probability

×

Impact

×

Detection difficulty
```

Exact arithmetic is optional.

The classification and response are mandatory.

---

# Critical Program Risks

The roadmap should explicitly monitor:

```text
Incorrect legacy Money conversion

Ambiguous owner backfill

Duplicate operation processing

Lost local-only data

Old Android client incompatibility

RLS regression

Account-switch leakage

Backup restore reviving deleted Account

Provider SDK collecting before choice

Advertising entering protected workflow

Assistant proposal bypassing confirmation

Unrecoverable signing credential

Documentation diverging from implementation
```

---

# Financial Migration Risk

Controls:

- Golden dataset
- Dry run
- Row-count validation
- Exact arithmetic
- Backup
- Post-migration reconciliation
- Staged rollout
- Repair plan

---

# Owner Backfill Risk

Controls:

- Deterministic ownership proof
- Ambiguous-row quarantine
- Cross-owner tests
- Independent review
- No current-session inference
- Audit record

---

# Local Data Loss Risk

Controls:

- Legacy read-only preservation
- Export option
- Migration resume
- Process-death tests
- Low-storage tests
- Delayed cleanup

---

# Duplicate Synchronization Risk

Controls:

- Stable operation ID
- Remote operation ledger
- Unique constraint
- Unknown-outcome reconciliation
- Retry with same identity
- Duplicate detector

---

# Android Compatibility Risk

Controls:

- Version compatibility matrix
- Internal testing
- Staged rollout
- Server Feature Flags
- Old-client support window
- Kill switches
- Clear minimum-version policy

---

# Provider Drift Risk

Controls:

- Provider registry
- SDK review
- Network monitoring
- Configuration audits
- Contract owner
- Exit plan
- Provider kill switch

---

# Documentation Drift Risk

Controls:

- Documentation change requirement
- Traceability matrix
- Link validation
- Release review
- Periodic audit
- Named document owners

---

# Risk Response Strategies

Recommended:

```text
avoid

reduce

transfer

accept_with_controls

monitor

retire
```

---

# `avoid`

Do not implement the capability or design.

---

# `reduce`

Add controls that lower probability or impact.

---

# `transfer`

Use a governed provider or contractual allocation where appropriate.

Responsibility for Product behavior remains with Nexio.

---

# `accept_with_controls`

Accept temporarily with:

- Owner
- Monitoring
- Expiration
- Contingency
- Approval

---

# `monitor`

Used when no immediate action is justified but triggers are measurable.

---

# `retire`

The risk no longer applies because the affected capability or architecture was removed.

---

# Risk Escalation

Escalate when:

- Probability increases.
- Impact increases.
- Mitigation fails.
- Trigger occurs.
- Owner becomes unavailable.
- Risk becomes cross-phase.
- Risk affects Production users.
- Risk becomes silent or undetectable.

---

# Blocker Management

A blocker is a current condition preventing a milestone from progressing safely.

---

# Blocker Categories

```text
Missing decision

Missing owner

Missing access

Missing environment

Missing provider response

Missing test infrastructure

Unknown current behavior

Data ambiguity

Migration failure

Store restriction

Legal or policy review

Security concern

Resource conflict
```

---

# Blocker Record

Recommended:

```text
blocker_id

affected_item

category

description

owner

opened_at

impact

next_action

decision_needed

target_review

status
```

---

# Blocker States

```text
open

investigating

waiting_external

decision_required

mitigated

resolved

accepted_as_scope_change
```

---

# Blocker Aging

A blocker should not remain open without review.

Aging review should ask:

- Is the dependency still required?
- Can scope be reduced?
- Can a safe temporary Adapter be used?
- Is escalation required?
- Should the milestone be deferred?
- Has the risk changed?

---

# Missing Decision Blocker

When implementation is blocked by an unresolved Product or architecture choice:

- Stop speculative implementation.
- Document available options.
- Document tradeoffs.
- Name decision authority.
- Define decision deadline.
- Preserve existing behavior.

---

# External Provider Blocker

When waiting for a provider:

- Maintain manual or internal fallback where possible.
- Avoid coupling unrelated work.
- Record provider reference.
- Define timeout for reevaluation.
- Consider replacement or deferral.

---

# Data Ambiguity Blocker

When ownership or financial meaning cannot be proven:

- Quarantine the data.
- Do not guess.
- Create a recovery or user-review workflow.
- Escalate to Domain and Data authorities.

---

# Program Tracking Model

The program should maintain one authoritative delivery view.

Potential file:

```text
docs/roadmap/PROGRAM-STATUS.md
```

---

# Program Status Summary

Recommended fields:

```text
Current wave

Current release increment

Completed milestones

Active milestones

Blocked milestones

P0 risks

High risks

Active migrations

Active Feature Flags

Active exceptions

Upcoming release gate

Program health
```

---

# Program Health States

Recommended:

```text
green

yellow

red

paused
```

---

# `green`

- Critical dependencies are ready.
- No uncontained P0 risk exists.
- Milestones progress within expected uncertainty.
- Release gates remain credible.

---

# `yellow`

- Material risk or blocker exists.
- Work continues with active mitigation.
- Scope or release date may change.
- No uncontrolled Critical harm exists.

---

# `red`

- P0 risk exists.
- Critical migration failed.
- Owner isolation is uncertain.
- Financial integrity is uncertain.
- Release should stop.

---

# `paused`

- Program or wave is intentionally stopped.
- Current state is preserved.
- Restart criteria are defined.

---

# Milestone Status Report

Recommended:

```text
Milestone

Owner

Status

Estimate size

Confidence

Dependencies

Risk

Completed evidence

Next action

Target release
```

---

# Weekly Program Review

A recurring implementation review should examine:

```text
P0 and High risks

Current wave health

Blocked milestones

Migration results

Test failures

Release readiness

Documentation drift

Temporary compatibility

Feature Flag age

Support findings

Compliance findings
```

---

# Program Review Rules

The review should:

- Focus on evidence.
- Avoid individual blame.
- Update priorities when risk changes.
- Remove completed temporary work.
- Escalate unresolved decisions.
- Avoid treating activity as completion.

---

# Release Increment Review

Before each release increment, confirm:

```text
Included capabilities

Excluded capabilities

Migration order

Compatibility

Feature Flags

Monitoring

Support guidance

Public disclosure impact

Rollback or recovery

Observation period
```

---

# Program Dashboard

Recommended sections:

```text
Wave progress

Milestone progress

Risk heat map

Blocker list

Migration status

Test health

Release health

Android status

Privacy and deletion status

Provider status

Technical debt

Documentation traceability
```

---

# Program Metrics

Metrics should describe system delivery health.

Recommended:

```text
milestone_completion_rate

blocked_milestone_count

blocker_age

change_failure_rate

rollback_rate

migration_failure_rate

escaped_financial_defects

owner_isolation_failures

recovery_exercise_pass_rate

stale_feature_flag_count

expired_exception_count

documentation_drift_count
```

---

# Metric Governance

Do not use roadmap metrics to:

- Rank individual developers
- Encourage unsafe speed
- Hide defect discovery
- Discourage escalation
- Reduce test scope
- Reclassify risk dishonestly

---

# Scope Management

Every wave requires a scope ledger.

Potential fields:

```text
scope_item

classification

reason

owner

dependency

release_target

status
```

Classifications:

```text
committed

stretch

deferred

removed

added_by_incident

added_by_compliance
```

---

# Scope Addition

A scope item may be added during a wave when:

- It resolves a discovered P0 or P1 issue.
- It is required for migration safety.
- It is required for store or compliance approval.
- It replaces a blocked item with a safer bounded alternative.

The scope addition must identify what capacity or scope changes.

---

# Scope Removal

A committed item may be removed only when:

- It is no longer required.
- It is safely deferred.
- Its dependency disappeared.
- A safer design replaced it.
- A formal authority approves the change.

Do not remove required tests or migration validation to preserve a release date.

---

# Technical Debt during the Program

Migration work often creates temporary debt.

Temporary debt must be explicitly recorded.

Examples:

```text
Legacy read Adapter

Dual schema read

Legacy CSS compatibility layer

Old Android compatibility path

Temporary Feature Flag

Backfill verification script

Temporary provider bridge
```

---

# Temporary Debt Record

Required:

```text
debt_id

reason

introduced_by

owner

risk

removal_condition

expiration

status
```

---

# Temporary Debt Closure

A wave should not close with unowned temporary debt.

Some debt may remain after the wave only when:

- Removal depends on older client retirement.
- A monitoring window is required.
- A provider migration remains active.
- A valid exception exists.

---

# Feature Flag Roadmap Governance

Every migration Feature Flag requires:

```text
flag_name

owner

purpose

default

affected_versions

rollout

monitoring

kill_switch_behavior

expiration

removal_change
```

---

# Migration Flag Categories

```text
read_path

write_path

sync_protocol

ui_shell

provider

android

privacy

assistant

advertising
```

---

# Dual-Write Flag Prohibition

A Feature Flag should not create uncontrolled dual canonical writes.

When dual writing is exceptionally required:

- One write remains authoritative.
- Secondary write is validated.
- Divergence is monitored.
- Rollback behavior is defined.
- Duration is minimal.
- Independent approval is required.

---

# Compatibility Window Management

Compatibility windows should define:

```text
Oldest supported Web state

Oldest supported Android version

Supported local schema versions

Supported sync protocol versions

Supported database schema versions

Retirement date or condition
```

---

# Old Android Client Management

Because older Android versions may remain installed:

- Server contracts must remain compatible.
- Destructive schema changes must wait.
- Feature Flags may disable unsafe capabilities.
- Upgrade guidance must remain accurate.
- Minimum-version enforcement requires a separate decision.

---

# Compatibility Retirement

Before removing compatibility:

```text
□ Adoption threshold is met.

□ Unsupported versions are identified.

□ Data migrations are complete.

□ Support guidance exists.

□ Server traffic is monitored.

□ Rollback implications are understood.

□ Release authority approves.
```

---

# Migration Rehearsal Program

High-risk migrations should be rehearsed before Production.

---

# Rehearsal Environment

Use:

- Production-like schema
- Synthetic data
- Representative volume
- Multiple owners
- Invalid legacy rows
- Pending operations
- Deleted owners
- Attachments
- Older client versions where applicable

---

# Rehearsal Evidence

Record:

```text
Dataset

Migration version

Duration

Lock behavior

Row counts

Rejected rows

Financial validation

Owner validation

Rollback or restore result

Issues found

Corrective actions
```

---

# Data Reconciliation after Migration

Every financial migration should reconcile:

```text
Record counts

Owner counts

Account counts

Transaction counts

Transfer relationships

Currency distribution

Money totals by Currency

Deleted-state counts

Pending-operation counts

Conflict counts
```

Do not create unsafe aggregate totals across different Currencies.

---

# Reconciliation Failure

When reconciliation fails:

- Stop rollout.
- Preserve migrated and pre-migration state.
- Identify affected owners.
- Do not hide the difference through manual deletion.
- Use corrective migration or restore.
- Record incident or defect.

---

# Rollout Strategy by Risk

## Low-Risk UI Change

```text
Internal test

↓

Small Production release

↓

Visual monitoring

↓

Full rollout
```

## Moderate Application Change

```text
Internal test

↓

Staging

↓

Feature Flag

↓

Limited Production cohort

↓

Observation

↓

Expansion
```

## High-Risk Data or Sync Change

```text
Migration rehearsal

↓

Internal synthetic validation

↓

Staging migration

↓

Backup verification

↓

Small owner cohort where architecture supports it

↓

Financial reconciliation

↓

Expansion

↓

Compatibility cleanup
```

## Critical Change

Requires:

- Formal proposal
- Independent review
- Incident readiness
- Recovery exercise
- Named Release Owner
- Explicit go/no-go decision

---

# Go/No-Go Decision

Before a High or Critical rollout, answer:

```text
Are migrations rehearsed?

Are backups verified?

Are owner boundaries proven?

Are financial reconciliations defined?

Are dashboards active?

Are alerts active?

Is Support ready?

Is rollback or recovery ready?

Are responsible owners available?

Are public documents current?
```

---

# No-Go Conditions

The release must not proceed when:

```text
P0 defect remains unresolved.

Owner isolation test fails.

Financial golden test fails.

Migration reconciliation fails.

Backup cannot be restored.

Android signing identity is uncertain.

Deletion behavior is materially broken.

Public declarations are materially inaccurate.

Critical Accessibility journey is blocked.

Required reviewer is unavailable.
```

---

# Program Execution Checklist

## Before Beginning a Wave

```text
□ Entry criteria pass.

□ Wave owner is assigned.

□ Committed scope is defined.

□ Dependencies are ready.

□ Risks are registered.

□ Blockers are known.

□ Required environments exist.

□ Test plan exists.

□ Migration plan exists.

□ Rollback or recovery exists.

□ Support and documentation impact are identified.
```

---

## Before Beginning a Milestone

```text
□ Current behavior is understood.

□ Active files are identified.

□ Target contract is defined.

□ Owner is assigned.

□ Estimate and confidence are recorded.

□ Persistent-data impact is known.

□ Older-client impact is known.

□ Acceptance tests are defined.

□ Old-path removal condition is defined.
```

---

## During Implementation

```text
□ Scope remains bounded.

□ One canonical writer is preserved.

□ Tests are added with implementation.

□ Financial values remain exact.

□ Currency remains explicit.

□ Owner boundaries remain enforced.

□ Temporary compatibility is recorded.

□ Documentation is updated continuously.

□ Feature Flags are registered.

□ New risks are escalated.
```

---

## Before Merge

```text
□ Pull Request explains purpose and risk.

□ Required reviewers approve.

□ Automated tests pass.

□ Migration review passes.

□ Accessibility review passes.

□ Security and Privacy review pass where required.

□ Android impact is verified.

□ Documentation is updated.

□ Rollback or recovery is credible.
```

---

## Before Release

```text
□ Artifact is traceable.

□ Environment is correct.

□ Migrations are ordered.

□ Backups are verified.

□ Feature Flag defaults are safe.

□ Monitoring is active.

□ Support guidance is ready.

□ Public declarations are current.

□ Release Owner is available.

□ Halt conditions are explicit.
```

---

## During Rollout

```text
□ Guardrails are monitored.

□ Financial reconciliation runs.

□ Owner-isolation alerts remain clear.

□ Error rates remain within limits.

□ Support case patterns are reviewed.

□ Provider behavior remains correct.

□ Rollout expansion is deliberate.

□ No material unresolved anomaly exists.
```

---

## After Rollout

```text
□ Observation window passes.

□ User-visible behavior is verified.

□ Migration state is complete.

□ Pending backfills are tracked.

□ Temporary evidence is protected.

□ Support guidance is updated.

□ Release record is closed.

□ Cleanup milestone is scheduled.
```

---

## Before Closing a Wave

```text
□ All committed milestones are complete or formally deferred.

□ Persistent migrations are complete.

□ Legacy writers are removed or separately governed.

□ Temporary debt has owners and expiration.

□ Feature Flags have removal plans.

□ Documentation reflects current behavior.

□ Support and runbooks are current.

□ Acceptance evidence is linked.

□ Next-wave dependencies are ready.
```

---

# Program Definition of Ready

An implementation milestone is ready only when:

```text
□ User or system outcome is defined.

□ Current-state evidence exists.

□ Priority is assigned.

□ Dependencies are identified.

□ Owner is assigned.

□ Target contract is defined.

□ Persistent-data impact is understood.

□ Owner-isolation impact is understood.

□ Financial impact is understood.

□ Accessibility impact is understood.

□ Android impact is understood.

□ Privacy and compliance impact is understood.

□ Tests are defined.

□ Migration is defined.

□ Rollback or recovery is defined.

□ Old-path removal is defined.
```

---

# Program Definition of Implemented

A milestone is implemented when:

```text
□ Code or configuration exists.

□ Required tests pass locally.

□ Documentation is updated.

□ Compatibility behavior exists.

□ No uncontrolled secondary writer exists.
```

Implementation alone does not mean released or completed.

---

# Program Definition of Releasable

A milestone is releasable when:

```text
□ Required CI passes.

□ Required reviews pass.

□ Migration rehearsal passes where applicable.

□ Monitoring exists.

□ Support is ready.

□ Public declarations are current.

□ Rollback or recovery is validated.

□ Release Owner accepts responsibility.
```

---

# Program Definition of Released

A milestone is released when:

```text
□ Correct artifact reaches the intended environment.

□ Migration reaches its intended state.

□ Feature Flag state is recorded.

□ Monitoring confirms expected startup and operation.

□ Release record is created.
```

---

# Program Definition of Done

A milestone is done only when:

```text
□ Production behavior is verified.

□ Acceptance criteria pass.

□ Financial reconciliation passes.

□ Owner-isolation validation passes.

□ Migration and backfill complete.

□ Support documentation is current.

□ Public documentation is current.

□ Monitoring window passes.

□ Temporary compatibility is removed or separately owned.

□ Remaining debt has an owner and deadline.

□ Evidence is linked.

□ No unowned High or Critical follow-up remains.
```

---

# Program Completion Criteria

The implementation program is complete only when:

```text
□ One canonical financial Domain exists.

□ One authoritative Application command path exists per mutation.

□ Exact Money is enforced.

□ Currency is explicit.

□ Owner isolation passes locally and remotely.

□ Local financial intent is durable.

□ Synchronization is idempotent.

□ Unknown outcomes reconcile.

□ Database migrations are versioned.

□ Local migrations are versioned and recoverable.

□ Shared UI components are authoritative.

□ Desktop, Tablet and Mobile use the same Domain.

□ Android build and signing are reproducible.

□ Account deletion works end to end.

□ Backup restoration respects deletion.

□ Public policies match implementation.

□ Store declarations match the released artifact.

□ Providers use bounded Adapters.

□ Analytics is optional and minimized where defined.

□ Assistant remains optional and confirmation-bound.

□ Advertising remains separate from financial behavior.

□ Backups and recovery exercises pass.

□ Support diagnostics are safe.

□ Critical operational dashboards and runbooks exist.

□ Legacy canonical writers are removed.

□ Stale Feature Flags are removed.

□ Expired exceptions are resolved.

□ Critical requirements have traceability.
```

---

# Program Closure Review

The final closure review should include:

```text
Product

Architecture

Domain

Data

Security

Privacy

Accessibility

Android

Web

Quality

Operations

Recovery

Support

Compliance

Documentation
```

---

# Program Closure Evidence Package

Recommended contents:

```text
Final repository map

Final architecture diagram

Final schema and migration history

Final local-schema history

Financial golden-test results

RLS and owner-isolation results

Synchronization failure-test results

Android release evidence

Privacy and deletion test evidence

Backup and recovery exercise results

Provider Registry

Permission Registry

SDK Registry

Feature Flag Registry

Technical-debt status

Requirement Traceability Matrix

Final release record
```

---

# Residual Work after Program Closure

Program closure does not mean Product development stops.

Residual work may include:

- New features
- Provider expansion
- UI refinements
- Performance improvements
- Additional Reports
- Regional expansion
- Subscription development

Residual work must use the completed governance and architecture.

---

# AI Agent Implementation Governance

AI coding agents may assist with the roadmap but must operate through bounded implementation packages.

---

# AI Agent Required Context

Before changing code, the AI agent must inspect:

```text
Relevant official specification documents

Current repository structure

Current active entry points

Relevant current source files

Relevant tests

Current package versions

Current database schema and migration state

Current local schema version

Current Feature Flags

Current platform configuration
```

---

# AI Agent Task Contract

Every AI implementation task should define:

```text
task_id

roadmap_phase

workstream

milestone

requested_capability

allowed_files

read_only_reference_files

forbidden_scope

required_tests

migration_impact

documentation_impact

rollback_expectation
```

---

# AI Agent Scope Rules

An AI agent should:

- Change only required files.
- Avoid unrelated cleanup.
- Avoid replacing architecture without approval.
- Avoid adding dependencies unless explicitly approved.
- Preserve current public behavior outside scope.
- Preserve current valid data.
- Preserve operation identity.
- Preserve owner scope.
- Update tests.
- Update documentation.

---

# AI Agent Discovery Requirement

When current behavior is uncertain, the AI agent must:

1. Inspect the current implementation.
2. Identify the active call path.
3. Identify the current source of truth.
4. Report uncertainty.
5. Avoid speculative replacement.

---

# AI Agent Planning Output

Before a High-risk implementation, the AI agent should produce a bounded plan containing:

```text
Files to inspect

Files likely to change

Current behavior

Target behavior

Persistent-data impact

Compatibility

Tests

Rollback or recovery

Old-path removal
```

---

# AI Agent Domain Rules

AI-generated financial code must:

- Use canonical Money.
- Use explicit Currency.
- Use canonical Transaction and Transfer commands.
- Avoid UI-level balance calculations.
- Avoid floating-point persistence.
- Preserve signs and minor units.
- Include boundary tests.

---

# AI Agent Data Rules

AI-generated persistence changes must:

- Use versioned migrations.
- Preserve owner relationships.
- Preserve deletion state.
- Avoid guessing ownership.
- Use additive-first migration.
- Include reconciliation.
- Include restore or corrective migration planning.

---

# AI Agent Synchronization Rules

AI-generated synchronization changes must:

- Preserve operation ID.
- Use bounded Retry.
- Handle unknown outcome.
- Preserve dependency order.
- Preserve owner scope.
- Avoid queue clearing.
- Include interruption tests.
- Include duplicate-prevention tests.

---

# AI Agent UI Rules

AI-generated UI must:

- Use shared components.
- Use Application services.
- Avoid direct persistence access.
- Include loading, empty, offline, error and partial states.
- Support keyboard.
- Support screen readers.
- Support large text.
- Respect Privacy mode.
- Avoid creating platform-specific financial logic.

---

# AI Agent Android Rules

AI-generated Android changes must:

- Inspect the actual Capacitor and native build path.
- Avoid undocumented manual copy steps.
- Review final manifest impact.
- Preserve lifecycle safety.
- Preserve process-death behavior.
- Preserve old-client compatibility.
- Avoid embedding secrets.
- Include artifact verification steps.

---

# AI Agent Privacy and Compliance Rules

AI-generated provider or telemetry changes must:

- Identify data categories.
- Identify purpose.
- Identify optionality.
- Identify user choice.
- Identify retention.
- Identify deletion.
- Identify public policy impact.
- Identify store declaration impact.

---

# AI Agent Test Honesty

The AI agent must distinguish:

```text
Test written

Test executed

Test passed

Test not executed

Test blocked
```

It must not claim execution without evidence.

---

# AI Agent Migration Honesty

The AI agent must not claim:

```text
Rollback supported
```

when only backup restoration or forward correction is possible.

---

# AI Agent Change Summary

Every AI-generated change should summarize:

```text
What changed

Why it changed

Which files changed

Which contracts changed

Which tests were added

Which tests were executed

Which migration applies

Which compatibility remains

Which cleanup remains
```

---

# AI Agent Forbidden Behaviors

AI agents must not:

- Rewrite the complete application in one task.
- Invent repository files.
- Invent package APIs.
- Invent database columns.
- Invent provider contracts.
- Create a second canonical Transaction path.
- Create a second synchronization queue.
- Disable RLS.
- Assign ambiguous owner data.
- Use floating-point financial persistence.
- Clear legacy local data before validation.
- Repeat unknown financial operations.
- Add an SDK without governance.
- Add Advertising in protected workflows.
- Give AI autonomous financial authority.
- Publish policy text without review.
- Claim Production success without deployment evidence.
- Delete compatibility code before adoption criteria pass.

---

# AI Agent Review Questions

Before accepting AI-generated implementation:

```text
Did the agent inspect the active code path?

Did it remain inside scope?

Did it preserve one canonical writer?

Did it preserve Money and Currency?

Did it preserve owner isolation?

Did it preserve operation identity?

Did it add the required tests?

Did it actually execute the claimed tests?

Did it update migrations safely?

Did it update documentation?

Did it identify cleanup?

Can the change be stopped, rolled back or recovered?
```

---

# AI Agent Roadmap Prompt Template

```text
You are implementing a bounded Nexio roadmap milestone.

Roadmap phase:
[PHASE]

Workstream:
[WORKSTREAM]

Milestone:
[MILESTONE]

Required capability:
[CAPABILITY]

Authoritative specifications:
[DOCUMENTS]

Files to inspect first:
[FILES]

Allowed files to change:
[FILES]

Forbidden scope:
[SCOPE]

Current behavior to preserve:
[BEHAVIOR]

Target behavior:
[BEHAVIOR]

Persistent-data impact:
[IMPACT]

Owner-isolation requirements:
[REQUIREMENTS]

Money and Currency requirements:
[REQUIREMENTS]

Offline and synchronization requirements:
[REQUIREMENTS]

Accessibility requirements:
[REQUIREMENTS]

Android requirements:
[REQUIREMENTS]

Privacy and compliance requirements:
[REQUIREMENTS]

Required tests:
[TESTS]

Migration and compatibility:
[MIGRATION]

Rollback or recovery:
[PLAN]

Before editing, inspect the actual implementation and report any conflict between this task and repository reality.

Do not invent files, APIs, schemas, commands, dependencies or test results.
```

---

# Final Roadmap Acceptance Criteria

The Nexio Implementation Roadmap and Migration Plan is accepted only when:

1. The current repository is investigated before broad migration.

2. The current Production implementation remains a source of evidence.

3. The roadmap preserves valid existing Web behavior.

4. The roadmap preserves valid existing Android behavior.

5. Existing user financial data receives an explicit migration path.

6. Owner isolation has higher priority than optional features.

7. Financial correctness has higher priority than visual polish.

8. Data durability has higher priority than provider expansion.

9. The program uses incremental migration rather than a big-bang rewrite.

10. Every canonical capability has one authoritative writer.

11. Compatibility code has an owner and expiration.

12. Derived data remains rebuildable.

13. Persistent migrations remain observable.

14. Persistent migrations remain resumable or recoverable.

15. The program uses explicit phases.

16. The program uses explicit workstreams.

17. The program uses explicit milestones.

18. Every milestone has a named owner.

19. Every milestone has dependencies.

20. Every milestone has acceptance tests.

21. Every milestone has release evidence.

22. P0 work interrupts ordinary roadmap sequencing.

23. P1 foundations precede P4 expansion.

24. Runtime entry points are mapped.

25. CSS authority is mapped.

26. Data locations are inventoried.

27. Database and RLS state are inventoried.

28. Android build behavior is mapped.

29. Provider and configuration state are inventoried.

30. Reproducible Web builds exist before broad migration.

31. Reproducible Android builds exist before broad migration.

32. CI exists before persistent-data restructuring.

33. Current behavior receives characterization tests.

34. Exact Money has one canonical contract.

35. Currency remains explicit.

36. Transactions use one canonical command path.

37. Transfers use one canonical relationship.

38. Reports use deterministic query services.

39. Database migration history is ordered.

40. Ambiguous ownership is quarantined rather than guessed.

41. Protected remote tables use verified RLS.

42. Local storage uses an explicit interface.

43. Local schema versions are tracked.

44. Local data is owner-scoped.

45. Local mutations and queue records commit atomically.

46. Financial operations use stable operation IDs.

47. Retry is bounded.

48. Unknown outcomes are reconciled before repetition.

49. Conflicts are explicit.

50. Checkpoints are owner- and protocol-scoped.

51. Legacy local storage remains available during validation.

52. Account switching is transactional.

53. Multi-tab migration is coordinated.

54. Shared runtime tokens become authoritative.

55. Shared components become accessible.

56. Financial forms use Application commands.

57. Privacy mode masks sensitive values before display.

58. Desktop, Tablet and Mobile share the same Domain.

59. Responsive transitions preserve state.

60. Android uses one authoritative Web artifact.

61. Capacitor synchronization is reproducible.

62. Android lifecycle interruption does not duplicate commands.

63. Android permission behavior is contextual.

64. Final Android manifests are reviewed.

65. AAB verification is required.

66. Optional provider initialization uses user and environment gates.

67. Complete Export is owner-safe.

68. Account deletion uses a state machine and ledger.

69. Account deletion includes provider cleanup.

70. Backup recovery respects deletion authority.

71. Support diagnostics minimize financial content.

72. Public policies match implementation.

73. Store declarations match the released artifact.

74. Providers use replaceable Adapters.

75. Provider errors map to canonical categories.

76. Analytics uses an allowlisted event registry.

77. Analytics excludes raw financial payloads.

78. Provider identity resets after Account switch.

79. Imports produce reviewable candidates.

80. Assistant begins with read-only behavior.

81. Assistant totals come from deterministic services.

82. Assistant structured output is validated.

83. Assistant proposals are owner-scoped and expiring.

84. Assistant financial actions require confirmation.

85. Advertising uses an Adapter.

86. Advertising placements are registered.

87. Advertising avoids protected workflows.

88. Financial context remains outside Advertising requests.

89. Advertising has a kill switch.

90. Core Product remains functional without Advertising.

91. Performance budgets are enforced.

92. Backups are automated.

93. Recovery exercises are performed.

94. Operational dashboards exist.

95. Critical runbooks are current.

96. Temporary canonical writers are removed.

97. Stale Feature Flags are removed.

98. Expired exceptions are resolved.

99. The program uses dependency matrices.

100. The program uses ordered delivery waves.

101. Calendar estimates remain separate from dependency order.

102. Estimates include testing, migration, documentation and rollout.

103. Unknown work is marked discovery required.

104. A central risk register exists.

105. Silent financial and owner risks receive elevated priority.

106. Every material risk has an owner.

107. Every blocker has a next action.

108. Data ambiguity blocks unsafe migration.

109. Program health uses evidence-based states.

110. Scope changes remain governed.

111. Temporary debt has removal conditions.

112. Compatibility windows are explicit.

113. Old Android clients are considered before destructive changes.

114. High-risk migrations are rehearsed.

115. Financial migrations use reconciliation.

116. Reconciliation does not combine unrelated Currencies.

117. Rollout strategy matches risk.

118. P0 and owner-isolation failures are no-go conditions.

119. Every wave has entry and exit criteria.

120. Every release increment leaves Nexio deployable or recoverable.

121. Phase completion requires Production evidence.

122. Program completion requires one canonical financial architecture.

123. Program completion requires durable local intent.

124. Program completion requires idempotent synchronization.

125. Program completion requires functional deletion.

126. Program completion requires reproducible Android publication.

127. Program completion requires tested recovery.

128. Program completion requires legacy writer removal.

129. Critical requirements receive traceability.

130. AI agents operate through bounded milestone contracts.

131. AI agents inspect actual repository state.

132. AI agents do not invent files, APIs or schemas.

133. AI agents preserve Money, Currency and owner isolation.

134. AI agents distinguish written tests from executed tests.

135. AI agents identify migrations, compatibility and cleanup.

136. AI agents cannot replace accountable review.

137. Final closure uses a cross-functional review.

138. Final closure preserves a complete evidence package.

139. Residual Product work uses the completed architecture.

140. Every completed milestone leaves Nexio safer and more understandable.

---

# Implementation Roadmap Constitutional Rule

Every roadmap decision, estimate, milestone, migration, release wave and AI-assisted change must answer:

```text
Does this work have the right prerequisites, preserve valid existing user state, establish one clear authority, provide verifiable evidence and leave Nexio deployable, stoppable and recoverable?
```

When the answer is uncertain, prefer the decision that:

- Returns to discovery.
- Corrects a P0 risk.
- Defines the missing contract.
- Narrows the milestone.
- Increases estimate uncertainty.
- Preserves the legacy state.
- Keeps one writer.
- Adds a migration rehearsal.
- Adds financial reconciliation.
- Adds an owner-isolation test.
- Uses a limited rollout.
- Delays optional capability.
- Pauses the wave.
- Blocks release.
- Rejects the change.

A roadmap is not complete when every planned task is marked closed.

It is complete when Nexio has one coherent architecture, valid user data has survived the transition, temporary authorities have been removed, critical recovery has been proven and every major Product guarantee can be traced to implementation and evidence.

---

# Final Authority

This document is the official Implementation Roadmap and Migration Plan for Nexio.

All future:

- Implementation phases
- Workstreams
- Delivery waves
- Milestones
- Repository restructuring
- Domain migrations
- Database migrations
- Local-storage migrations
- Synchronization migrations
- UI migrations
- Android migrations
- Provider introductions
- Analytics introductions
- Assistant introductions
- Advertising introductions
- Compatibility windows
- Feature Flags
- Migration rehearsals
- Risk registers
- Blocker records
- Program status reports
- Release increments
- Program completion reviews
- AI-assisted implementation tasks

must comply with this specification.

Exceptions require a documented Product, Architecture, Domain, Data, Security, Privacy, Accessibility, Android, Web, Quality, Operations, Recovery, Support, Compliance or Release decision containing:

- Named owner
- Affected phase
- Affected workstream
- Affected milestone
- Current state
- Target state
- Dependency impact
- Financial impact
- Owner-isolation impact
- Persistent-data impact
- Compatibility impact
- Android impact
- Privacy and compliance impact
- Risk
- Compensating controls
- Tests
- Monitoring
- Rollback or recovery
- Expiration
- Cleanup plan
- Required approvers

Undocumented sequencing changes, migration shortcuts and permanent compatibility layers are considered architecture, financial-integrity, Security, Privacy, Accessibility, reliability, recovery and operational debt.

---