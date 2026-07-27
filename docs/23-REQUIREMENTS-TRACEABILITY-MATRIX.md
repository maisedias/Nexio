# Nexio Requirements Traceability Matrix

Version: 1.0  
Status: Official  
Authority Level: Requirements Traceability, Verification and Evidence Mapping Standard  
Applies To: Product, Web, Android, Domain, Database, Local Storage, Synchronization, Security, Privacy, Accessibility, Providers, Analytics, Assistant, Advertising, Testing, Operations, Recovery, Support, Compliance, Documentation and AI-Assisted Engineering

---

# Purpose

This document defines the official Requirements Traceability Matrix architecture for Nexio.

It establishes how every material requirement should be connected to:

```text
Authoritative specification

Requirement identifier

Product capability

Architecture component

Repository implementation

Persistent-data structure

Migration

Test

Operational control

Monitoring

Support procedure

Compliance evidence

Owner

Release

Current status
```

The objective is to make every critical Nexio guarantee verifiable.

A requirement must not be considered implemented merely because:

- It exists in documentation.
- A file with a related name exists.
- A developer believes the behavior exists.
- A visual screen appears complete.
- One successful manual test occurred.
- An AI agent generated code.
- A release was approved by an application store.

A requirement is traceable only when Nexio can follow the chain:

```text
Requirement

↓

Design or architecture decision

↓

Implementation

↓

Verification

↓

Production evidence

↓

Operational ownership
```

---

# Traceability Goals

The Nexio traceability architecture should ensure:

```text
Every critical requirement has a stable identity.

Every requirement has an authoritative source.

Every requirement has an accountable owner.

Every implementation claim has repository evidence.

Every persistent-data requirement maps to migrations.

Every critical behavior maps to tests.

Every Production guarantee maps to monitoring or operational evidence.

Every public claim maps to actual implementation.

Every unresolved gap remains visible.

Every superseded requirement remains historically traceable.

Every AI-generated change can be reviewed against explicit requirements.
```

---

# Relationship with Other Documents

This document indexes and traces requirements from:

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
docs/22-IMPLEMENTATION-ROADMAP-AND-MIGRATION-PLAN.md
```

Responsibilities are divided as follows:

| Document | Responsibility |
|---|---|
| Documents `00–21` | Define Product, architecture and operational requirements |
| `22-IMPLEMENTATION-ROADMAP-AND-MIGRATION-PLAN.md` | Defines implementation sequence |
| `23-REQUIREMENTS-TRACEABILITY-MATRIX.md` | Connects each requirement to implementation and evidence |

This matrix does not redefine the requirements.

It identifies, organizes and verifies them.

---

# Current Repository Traceability Anchors

The current repository contains implementation and evidence candidates such as:

```text
app.js
index.html
styles.css
nexio-v2.css
i18n.js
supabase-config.js
supabase-schema.sql
mobile-capacitor.js
capacitor.config.ts
package.json
package-lock.json
vercel.json
PLAY_STORE_LISTING.md
politica-de-privacidade.html
excluir-conta.html

js/core/
js/ui/
css/
android/
android-web/
capacitor-overrides/
docs/
```

Potential traceability areas include:

| Repository area | Traceability responsibility |
|---|---|
| `js/core/` | Current financial and application behavior |
| `js/ui/` | Platform-specific interface behavior |
| `css/` | Responsive and presentation implementation |
| `supabase-schema.sql` | Current remote schema and policies |
| `supabase-config.js` | Provider configuration boundary |
| `android/` | Native Android implementation |
| `android-web/` | Android Web assets where active |
| `capacitor-overrides/` | Native customization |
| `package.json` | Build, dependency and script evidence |
| `docs/` | Requirements, decisions, runbooks and registries |
| Public HTML files | Privacy and deletion implementation claims |

These paths are candidates.

A path must be confirmed as active before it becomes implementation evidence.

---

# Traceability Constitutional Principles

## Every Material Requirement Needs a Stable Identifier

A requirement should be referenceable without copying its full wording.

Preferred:

```text
NEX-DATA-MONEY-001
```

Avoid relying only on:

```text
The third bullet in the Money section
```

---

## Requirement Identity Must Survive Document Reorganization

Moving a requirement to another heading must not create a new requirement identity when its meaning remains the same.

---

## Requirement Wording and Requirement Identity Are Distinct

The identifier remains stable.

The wording may evolve through governed versioning.

---

## Traceability Is Bidirectional

Nexio must support:

```text
Requirement → implementation and evidence
```

and:

```text
Implementation or test → governing requirement
```

A file or test without a requirement may indicate:

- Undocumented behavior
- Technical debt
- Obsolete code
- Missing specification
- Infrastructure work
- Experimental code

---

## Documentation Is Not Implementation Evidence

A requirement cannot use its own specification paragraph as proof of implementation.

---

## Implementation Is Not Verification

A function or class existing does not prove that it behaves correctly.

---

## Verification Is Not Production Evidence

A passing local test does not prove that the released Production artifact uses the tested code or configuration.

---

## Store Approval Is Not Product Verification

Application-store acceptance does not prove:

- Financial correctness
- Owner isolation
- Synchronization durability
- Deletion completeness
- Accessibility
- Provider behavior

---

## Public Claims Require Strong Traceability

Claims involving:

- Privacy
- Security
- Encryption
- Offline behavior
- Synchronization
- Account deletion
- Assistant behavior
- Advertising
- Financial calculations

must map to implementation, tests and current release evidence.

---

## Critical Requirements Require Multiple Evidence Types

A critical requirement should not rely only on one manual test.

Potential evidence combination:

```text
Implementation

+

Automated test

+

Production or release evidence

+

Operational monitoring
```

---

## Persistent-Data Requirements Require Migration Traceability

Any requirement changing:

- Database schema
- Local schema
- Money representation
- Owner relationships
- Synchronization protocol
- Deletion state
- Provider identity

must map to migration and compatibility evidence.

---

## Requirement Gaps Must Remain Visible

Missing implementation or missing tests must be recorded as gaps.

Do not mark them complete through optimistic interpretation.

---

## Partial Coverage Must Be Explicit

A requirement implemented only for Web but not Android is not globally complete.

---

## Platform Scope Must Be Explicit

Potential scopes:

```text
Shared

Web

Desktop

Tablet

Mobile Web

Android

Backend

Provider

Operational

Public Website
```

---

## Environment Scope Must Be Explicit

Potential environments:

```text
Development

Testing

Staging

Production

Android internal track

Android closed track

Android Production
```

---

## Requirement Status Must Reflect Actual State

A requirement should not be `verified` when:

- The test was not executed.
- The Production artifact was not checked.
- Migration remains incomplete.
- Only one platform was tested.
- A required provider remains unconfigured.

---

## Superseded Requirements Must Remain Traceable

A superseded requirement should identify:

- Replacement requirement
- Effective version
- Migration impact
- Historical releases
- Reason

---

## Traceability Must Be Reviewable by Someone Other Than the Author

A qualified reviewer should be able to follow the evidence without relying on private explanation.

---

## AI-Generated Traceability Must Be Verified

AI may propose mappings.

It must not invent:

- Files
- Test results
- Migrations
- Monitoring
- Release evidence
- Requirement completion

---

# Traceability Scope

Traceability should cover:

```text
Product requirements

Domain requirements

Data requirements

Security requirements

Privacy requirements

Accessibility requirements

Performance requirements

Reliability requirements

Offline and synchronization requirements

Platform requirements

Provider requirements

Testing requirements

Operational requirements

Recovery requirements

Support requirements

Compliance requirements

Documentation requirements

Governance requirements
```

---

# Requirement Taxonomy

Recommended top-level requirement classes:

```text
FOUNDATION

ARCHITECTURE

DESIGN

DESKTOP

TABLET

MOBILE

DATA

SECURITY

SYNC

TEST

OPERATIONS

CONTENT

AI

PRIVACY

ACCESSIBILITY

PERFORMANCE

ANALYTICS

INTEGRATION

RECOVERY

GOVERNANCE

SUPPORT

COMPLIANCE

ROADMAP
```

---

# Requirement Identifier Format

Recommended format:

```text
NEX-<DOMAIN>-<AREA>-<NUMBER>
```

Examples:

```text
NEX-DATA-MONEY-001

NEX-SEC-RLS-004

NEX-SYNC-QUEUE-012

NEX-A11Y-KEYBOARD-006

NEX-ANDROID-LIFECYCLE-009

NEX-PRIV-DELETE-015

NEX-AI-CONFIRM-008

NEX-COMP-STORE-021
```

---

# Identifier Components

## `NEX`

Product prefix.

## `<DOMAIN>`

Primary requirement family.

Examples:

```text
DATA

SEC

SYNC

UI

A11Y

ANDROID

PRIV

AI

OPS

COMP
```

## `<AREA>`

Specific capability.

Examples:

```text
MONEY

TRANSFER

RLS

QUEUE

OFFLINE

DIALOG

DELETE

EXPORT

ADS

BACKUP
```

## `<NUMBER>`

Stable sequence within the area.

Recommended:

```text
001

002

003
```

---

# Requirement Identifier Rules

Identifiers should:

- Be unique.
- Be stable.
- Avoid document-line numbers.
- Avoid release-version numbers.
- Avoid implementation file names.
- Avoid status indicators.
- Avoid reusing retired identifiers.

---

# Requirement Prefix Registry

Recommended file:

```text
docs/traceability/REQUIREMENT-PREFIX-REGISTRY.md
```

Potential contents:

| Prefix | Domain | Source documents |
|---|---|---|
| `NEX-FND` | Foundation | `00` |
| `NEX-ARCH` | Architecture | `01` |
| `NEX-DS` | Design System | `02` |
| `NEX-DESK` | Desktop | `03` |
| `NEX-TAB` | Tablet | `04` |
| `NEX-MOB` | Mobile | `05` |
| `NEX-DATA` | Data Model | `06` |
| `NEX-SEC` | Security | `07` |
| `NEX-SYNC` | Offline and Sync | `08` |
| `NEX-TEST` | Testing | `09` |
| `NEX-OPS` | Deployment and Operations | `10` |
| `NEX-CONTENT` | Internationalization and Content | `11` |
| `NEX-AI` | Assistant and AI | `12` |
| `NEX-PRIV` | Privacy and Governance | `13` |
| `NEX-A11Y` | Accessibility | `14` |
| `NEX-PERF` | Performance and Reliability | `15` |
| `NEX-AN` | Analytics and Experimentation | `16` |
| `NEX-INT` | APIs and Integrations | `17` |
| `NEX-REC` | Backup and Recovery | `18` |
| `NEX-GOV` | Engineering Governance | `19` |
| `NEX-SUP` | Support Operations | `20` |
| `NEX-COMP` | Compliance and Store | `21` |
| `NEX-ROAD` | Roadmap and Migration | `22` |

---

# Requirement Record Architecture

Every material requirement should have a structured record.

Recommended fields:

```text
requirement_id

title

requirement_statement

source_document

source_section

source_version

requirement_class

risk_level

priority

platform_scope

environment_scope

owner

status

implementation_references

data_references

migration_references

test_references

operational_references

support_references

compliance_references

release_references

evidence_level

notes

supersedes

superseded_by

last_reviewed
```

---

# Requirement Statement

The statement should use enforceable language.

Preferred:

```text
Every financial mutation must preserve a stable operation identifier across retries.
```

Avoid:

```text
Try to keep operation IDs stable.
```

---

# Requirement Title

A short human-readable summary.

Example:

```text
Stable operation identity
```

---

# Source Document

The authoritative specification.

Example:

```text
docs/08-OFFLINE-AND-SYNC.md
```

---

# Source Section

The nearest stable heading.

Example:

```text
Unknown Outcome Handling
```

Do not use only line numbers because line numbers change frequently.

---

# Source Version

The specification version containing the active wording.

---

# Requirement Class

Potential:

```text
functional

quality

security

privacy

accessibility

data

operational

compliance

governance

migration

documentation
```

---

# Risk Level

Recommended:

```text
critical

high

moderate

low
```

---

# Priority

Recommended:

```text
P0

P1

P2

P3

P4
```

Priority should align with the Implementation Roadmap.

---

# Platform Scope

Potential values:

```text
shared

web

desktop

tablet

mobile_web

android

backend

provider

public_site

operations
```

A requirement may have multiple values.

---

# Environment Scope

Potential values:

```text
all

development

testing

staging

production

android_internal

android_closed

android_production
```

---

# Requirement Owner

The role accountable for completion and continued validity.

Examples:

```text
Domain Owner

Security Owner

Android Owner

Privacy Owner

Accessibility Owner

Operations Owner
```

---

# Requirement Status Model

Recommended statuses:

```text
identified

specified

planned

in_progress

implemented

tested

verified

released

operationally_verified

partially_covered

blocked

deferred

not_applicable

superseded

retired
```

---

# `identified`

The requirement has been discovered but not fully specified.

---

# `specified`

The authoritative requirement wording exists.

---

# `planned`

Implementation is included in the approved roadmap.

---

# `in_progress`

Implementation or migration is active.

---

# `implemented`

The implementation exists.

This status does not claim that testing passed.

---

# `tested`

Required controlled tests were executed and passed in a non-Production environment.

---

# `verified`

Implementation, tests and required review evidence are complete for the declared scope.

---

# `released`

The requirement is included in the intended released artifact.

---

# `operationally_verified`

Production behavior, monitoring or operational evidence confirms the requirement.

---

# `partially_covered`

Only part of the required:

- Platform
- Environment
- Data class
- Provider
- Journey
- Failure state

is covered.

---

# `blocked`

A named blocker prevents progress.

---

# `deferred`

The requirement remains valid but is postponed through an approved roadmap decision.

---

# `not_applicable`

The requirement does not apply to the current Product scope.

This status requires a reason and approver.

---

# `superseded`

A newer requirement replaces it.

---

# `retired`

The capability or obligation no longer exists.

Historical traceability remains.

---

# Status Progression

Typical progression:

```text
identified

↓

specified

↓

planned

↓

in_progress

↓

implemented

↓

tested

↓

verified

↓

released

↓

operationally_verified
```

A requirement may move backward after:

- Regression
- Provider change
- Architecture change
- Incident
- Store declaration drift
- Failed audit
- New platform scope

---

# Status Evidence Rules

## `implemented`

Requires:

- Repository or configuration reference
- Responsible owner
- Applicable version

## `tested`

Requires:

- Test reference
- Execution result
- Environment
- Date or run reference

## `verified`

Requires:

- Required reviews
- Passing tests
- Migration verification where applicable
- Scope confirmation

## `released`

Requires:

- Release identifier
- Artifact or deployment reference
- Environment

## `operationally_verified`

Requires one or more:

- Production monitor
- Production audit
- Support evidence
- Recovery exercise
- Provider confirmation
- Compliance evidence

---

# Coverage Model

Requirement coverage should be evaluated across dimensions.

Recommended dimensions:

```text
Implementation coverage

Test coverage

Platform coverage

Environment coverage

Failure coverage

Migration coverage

Operational coverage

Documentation coverage

Support coverage

Compliance coverage
```

---

# Implementation Coverage

Possible values:

```text
none

partial

complete
```

---

# Test Coverage

Possible values:

```text
none

manual_only

automated_partial

automated_complete

automated_and_manual
```

---

# Platform Coverage

Example:

```text
Web: complete

Android: partial

Tablet: complete
```

The global requirement remains partial until every required platform passes.

---

# Environment Coverage

Example:

```text
Testing: verified

Staging: verified

Production: not verified
```

---

# Failure Coverage

A requirement may work only in the happy path.

Failure coverage should identify tested states such as:

```text
Offline

Timeout

Retry

Provider unavailable

Authentication expired

Process death

Low storage

Account switch

Migration interruption

Deletion failure
```

---

# Migration Coverage

Potential:

```text
not_required

planned

implemented

rehearsed

completed

reconciled
```

---

# Operational Coverage

Potential:

```text
none

manual_observation

monitoring

alerting

runbook

monitoring_alerting_and_runbook
```

---

# Documentation Coverage

Potential:

```text
specification_only

implementation_documented

support_documented

operationally_documented

complete
```

---

# Support Coverage

Potential:

```text
not_required

general_guidance

diagnostic_available

runbook_available

escalation_available

complete
```

---

# Compliance Coverage

Potential:

```text
not_applicable

internal_only

public_policy_updated

store_declaration_updated

evidence_archived

complete
```

---

# Traceability Evidence Architecture

Recommended evidence levels:

```text
E0 — No evidence

E1 — Specification evidence

E2 — Implementation evidence

E3 — Test evidence

E4 — Release evidence

E5 — Operational evidence
```

---

# E0 — No Evidence

The requirement is known but unsupported.

---

# E1 — Specification Evidence

Includes:

- Official requirement
- ADR
- Design record
- Migration plan

E1 does not prove implementation.

---

# E2 — Implementation Evidence

Includes:

- Source file
- Configuration
- Database migration
- Provider setting
- Public policy page

E2 does not prove correct behavior.

---

# E3 — Test Evidence

Includes:

- Automated test
- Manual test record
- Migration rehearsal
- Accessibility audit
- Security test
- Recovery exercise

---

# E4 — Release Evidence

Includes:

- Deployed revision
- Signed Android artifact
- Release record
- Feature Flag state
- Store submission
- Migration execution record

---

# E5 — Operational Evidence

Includes:

- Production monitoring
- Audit result
- Support trend
- Provider confirmation
- Recovery validation
- Incident follow-up
- Compliance verification

---

# Required Evidence by Risk

## Critical Requirement

Minimum target:

```text
E1 + E2 + E3 + E4 + E5
```

## High Requirement

Minimum target:

```text
E1 + E2 + E3 + E4
```

Operational evidence is strongly preferred.

## Moderate Requirement

Minimum target:

```text
E1 + E2 + E3
```

## Low Requirement

Minimum target:

```text
E1 + E2
```

Testing may still be required depending on the capability.

---

# Evidence Reference Types

Potential references:

```text
FILE

SYMBOL

MIGRATION

TEST

TEST_RUN

BUILD

RELEASE

MONITOR

ALERT

RUNBOOK

POLICY

STORE_DECLARATION

AUDIT

INCIDENT

PROVIDER_CONFIRMATION

SCREENSHOT

MANUAL_VERIFICATION
```

---

# File Reference

Example:

```text
FILE:js/domain/money.js
```

---

# Symbol Reference

Example:

```text
SYMBOL:js/application/transactions/create-transaction.js#createTransaction
```

Use only when the symbol is stable and verified.

---

# Migration Reference

Example:

```text
MIGRATION:supabase/migrations/0005_add_operation_ledger.sql
```

---

# Test Reference

Example:

```text
TEST:tests/unit/domain/money.test.js
```

---

# Test Run Reference

Example:

```text
TEST_RUN:ci/2026-07-25/main/1842
```

The exact format should match actual CI capability.

---

# Build Reference

Example:

```text
BUILD:web-production-2026.07.25.1
```

---

# Release Reference

Example:

```text
RELEASE:android-2.4.0-104
```

---

# Monitor Reference

Example:

```text
MONITOR:sync-unknown-outcome-rate
```

---

# Runbook Reference

Example:

```text
RUNBOOK:docs/runbooks/SYNC-UNKNOWN-OUTCOME.md
```

---

# Policy Reference

Example:

```text
POLICY:politica-de-privacidade.html#account-deletion
```

---

# Audit Reference

Example:

```text
AUDIT:2026-Q3-owner-isolation
```

---

# Evidence Integrity Rules

Evidence should:

- Exist.
- Be accessible to authorized reviewers.
- Identify applicable version.
- Identify environment.
- Identify execution result.
- Avoid real financial data where unnecessary.
- Avoid secrets.
- Remain immutable or versioned where appropriate.

---

# Evidence Expiration

Some evidence becomes stale after:

- Source changes
- Provider update
- Android target change
- Policy change
- Migration
- Model change
- Store declaration update
- Incident
- Architecture refactor

The matrix should identify evidence that requires renewal.

---

# Traceability Link Types

Recommended relationship types:

```text
implements

verifies

validates

migrates

monitors

alerts_on

documents

supports

declares

depends_on

supersedes

conflicts_with

blocks
```

---

# `implements`

A source or configuration artifact implements the requirement.

---

# `verifies`

A test verifies expected behavior.

---

# `validates`

A review, audit or reconciliation validates the result.

---

# `migrates`

A migration moves existing state into compliance.

---

# `monitors`

A Production monitor observes ongoing behavior.

---

# `alerts_on`

An alert detects potential violation.

---

# `documents`

A public or internal document explains the behavior.

---

# `supports`

A Support runbook or diagnostic helps resolve failure.

---

# `declares`

A policy or store submission publicly declares the behavior.

---

# `depends_on`

The requirement requires another requirement or capability.

---

# `supersedes`

A newer requirement replaces an older one.

---

# `conflicts_with`

A temporary conflict exists and requires resolution.

---

# `blocks`

The requirement prevents release or another milestone until satisfied.

---

# Bidirectional Traceability

Every reference should support navigation in both directions where practical.

Example:

```text
NEX-SYNC-QUEUE-001
  implements → js/application/sync/operation-processor.js
```

The implementation file or code comment may reference:

```text
Requirements:
- NEX-SYNC-QUEUE-001
- NEX-SYNC-RETRY-004
```

Code comments should not become excessive or replace readable design.

---

# Traceability Matrix Storage

Recommended structure:

```text
docs/traceability/
  README.md
  REQUIREMENT-PREFIX-REGISTRY.md
  REQUIREMENT-REGISTRY.md
  TRACEABILITY-MATRIX.md
  TRACEABILITY-GAPS.md
  COVERAGE-SUMMARY.md
```

As scale increases, a structured format may also be used:

```text
docs/traceability/requirements.yaml
```

or:

```text
docs/traceability/requirements.json
```

The chosen format must remain reviewable and version-controlled.

---

# Human-Readable and Machine-Readable Sources

Recommended model:

```text
Machine-readable requirement registry

↓

Generated or validated human-readable matrix
```

or:

```text
Human-readable authoritative matrix

+

Automated consistency checks
```

Do not maintain two independent uncontrolled sources.

---

# Requirement Registry Example

```yaml
- requirement_id: NEX-DATA-MONEY-001
  title: Exact financial value representation
  statement: >
    Financial values must use the approved exact Money representation
    and must not use floating-point persistence.
  source:
    document: docs/06-DATA-MODEL.md
    section: Money
    version: "1.0"
  class: data
  risk: critical
  priority: P1
  scope:
    platforms:
      - shared
      - backend
      - android
      - web
    environments:
      - all
  owner: Domain Owner
  status: planned
  evidence:
    implementation: []
    tests: []
    releases: []
```

This is an example structure, not proof that the file or requirement currently exists in the repository.

---

# Matrix Table Format

Recommended columns:

| Requirement ID | Requirement | Risk | Scope | Owner | Status | Implementation | Tests | Migration | Release | Operations | Gaps |
|---|---|---|---|---|---|---|---|---|---|---|---|

For large matrices, separate detailed records from summary views.

---

# Requirement Extraction Process

Requirements should be extracted systematically from documents `00–22`.

---

# Extraction Steps

```text
1. Read the official document.

2. Identify enforceable statements.

3. Separate requirements from explanation.

4. Separate requirements from examples.

5. Separate requirements from optional recommendations.

6. Assign stable identifiers.

7. Classify risk and scope.

8. Assign owner.

9. Identify dependencies.

10. Add initial status.

11. Map known implementation.

12. Record missing evidence.
```

---

# Enforceable Requirement Indicators

Common wording:

```text
must

must not

required

prohibited

only when

accepted only when

cannot

should not proceed until

release must stop when
```

---

# Recommendation Indicators

Common wording:

```text
recommended

preferred

potential

example

may

where appropriate
```

Recommendations may become requirements through a later decision.

Do not automatically classify every example as mandatory.

---

# Acceptance-Criteria Extraction

Acceptance-criteria checklists are high-value sources for requirement extraction.

Each independently testable criterion may receive its own requirement ID.

Closely related criteria may be grouped when they share:

- Same implementation
- Same test
- Same risk
- Same owner
- Same scope

Do not group unrelated obligations merely to reduce matrix size.

---

# Constitutional-Rule Extraction

Constitutional rules should become:

- High-level governing requirements
- Review gates
- Parent requirements

They should not replace detailed child requirements.

---

# Requirement Hierarchy

Recommended hierarchy:

```text
Principle

Control objective

Requirement

Sub-requirement

Verification criterion
```

---

# Principle

Example:

```text
Financial values must remain exact.
```

---

# Control Objective

Example:

```text
All persisted and calculated financial values use the canonical Money model.
```

---

# Requirement

Example:

```text
Transaction Amount persistence must not use floating-point storage.
```

---

# Sub-Requirement

Example:

```text
Import conversion must preserve the original decimal value exactly.
```

---

# Verification Criterion

Example:

```text
R$ 3.420,15 survives parse, persistence, synchronization and Export without change.
```

---

# Parent and Child Requirements

A parent requirement may be complete only when all mandatory child requirements are complete.

Example:

```text
NEX-DATA-MONEY-000
  ├─ NEX-DATA-MONEY-001 — Exact persistence
  ├─ NEX-DATA-MONEY-002 — Exact arithmetic
  ├─ NEX-DATA-MONEY-003 — Explicit Currency
  ├─ NEX-DATA-MONEY-004 — Exact Import
  └─ NEX-DATA-MONEY-005 — Exact Export
```

---

# Requirement Granularity

A requirement should be granular enough to:

- Assign an owner
- Implement
- Test
- Review
- Mark status

Avoid requirements that are too broad:

```text
The application must be secure.
```

Prefer:

```text
Every protected remote table must deny cross-owner Select, Insert, Update and Delete operations.
```

---

# Duplicate Requirement Handling

Requirements may appear in several documents.

Example:

- Owner isolation in Architecture
- Owner isolation in Security
- Owner isolation in Data Model
- Owner isolation in Synchronization

Do not create uncontrolled duplicates.

Use:

```text
One canonical requirement

+

Multiple source references
```

or parent-child relationships where meanings differ.

---

# Conflicting Requirement Handling

When two requirements conflict:

1. Record both.
2. Mark `conflicts_with`.
3. Identify authority.
4. Stop affected implementation where necessary.
5. Create ADR or governance decision.
6. Update the superseded requirement.
7. Preserve historical traceability.

---

# Requirement Dependency Model

Requirements may depend on other requirements.

Example:

```text
NEX-AI-CONFIRM-004

depends_on

NEX-SYNC-IDEMPOTENCY-002
```

because confirmed Assistant actions require safe canonical command behavior.

---

# Release-Blocking Requirements

A requirement should be marked release-blocking when failure creates unacceptable:

- Financial risk
- Owner-isolation risk
- Security risk
- Privacy risk
- Data-loss risk
- Accessibility barrier
- Store-compliance failure
- Recovery failure

---

# Release Gate Mapping

Potential fields:

```text
release_blocking: true

release_gate:
  - web_production
  - android_production
```

---

# Traceability Gap Architecture

Every missing link should be recorded.

Recommended gap types:

```text
missing_requirement

missing_owner

missing_implementation

missing_test

missing_migration

missing_release_evidence

missing_monitoring

missing_support_runbook

missing_policy_update

missing_store_declaration

stale_evidence

scope_mismatch

conflicting_requirement
```

---

# Gap Record

Recommended fields:

```text
gap_id

requirement_id

gap_type

description

risk

owner

created_at

target_phase

target_milestone

blocker

status

resolution
```

---

# Gap Status

Recommended:

```text
open

planned

in_progress

blocked

resolved

accepted_with_exception

obsolete
```

---

# Critical Traceability Gap

Examples:

- Critical requirement has no implementation.
- Cross-owner control has no test.
- Money migration has no reconciliation.
- Deletion requirement has no provider cleanup.
- Released feature has no public-policy alignment.
- Android permission has no registry entry.

---

# Traceability Gap Register

Recommended file:

```text
docs/traceability/TRACEABILITY-GAPS.md
```

---

# Gap Prioritization

Prioritize gaps based on:

```text
Risk

Production exposure

Silent-failure potential

Number of dependent requirements

Platform scope

Migration state

Public-claim impact

Recoverability
```

---

# Traceability Reviews

Recommended review moments:

```text
Requirement creation

Architecture decision

Implementation planning

Pull Request review

Migration review

Release readiness

Post-release verification

Incident review

Audit

Provider change

Policy change
```

---

# Pull Request Traceability

Material Pull Requests should identify:

```text
Requirements implemented

Requirements affected

Requirements superseded

Tests added

Migrations added

Evidence produced

Remaining gaps
```

---

# Commit-Level Traceability

Commit messages may include requirement IDs when useful.

Example:

```text
fix(sync): preserve operation identity after timeout

Refs: NEX-SYNC-IDEMP-003
```

Do not require identifiers in every trivial formatting commit.

---

# Test Traceability

Tests should identify the requirements they verify.

Possible approaches:

```text
Test metadata

Test name

Nearby comment

Registry mapping
```

Example:

```javascript
// Requirements:
// - NEX-DATA-MONEY-001
// - NEX-DATA-MONEY-002
```

The test itself must remain readable.

---

# Migration Traceability

Every persistent migration should identify:

- Requirements implemented
- Requirements preserved
- Compatibility requirements
- Validation requirements
- Recovery requirements

---

# Release Traceability

Every release should record:

```text
Included requirements

Partially covered requirements

Feature Flag states

Migrations

Known gaps

Exceptions

Evidence

Rollback or recovery
```

---

# Incident Traceability

An incident should identify violated or at-risk requirements.

Example:

```text
Affected requirements:
- NEX-SEC-RLS-001
- NEX-DATA-OWNER-002
- NEX-SUP-SEVERITY-001
```

Corrective actions should map back to the same requirements.

---

# Audit Traceability

Audit findings should identify:

- Requirement
- Expected evidence
- Missing or failed evidence
- Affected release
- Corrective action
- Verification result

---

# Requirements Coverage Summary

Recommended summary views:

```text
Coverage by document

Coverage by risk

Coverage by platform

Coverage by status

Coverage by workstream

Coverage by release

Coverage by evidence level

Coverage by gap type
```

---

# Coverage by Risk

Example:

| Risk | Total | Verified | Released | Operationally verified | Gaps |
|---|---:|---:|---:|---:|---:|
| Critical | 0 | 0 | 0 | 0 | 0 |
| High | 0 | 0 | 0 | 0 | 0 |
| Moderate | 0 | 0 | 0 | 0 | 0 |
| Low | 0 | 0 | 0 | 0 | 0 |

Initial values should come from actual extraction.

Do not invent counts.

---

# Coverage by Document

Example:

| Document | Extracted requirements | Implemented | Tested | Released | Gaps |
|---|---:|---:|---:|---:|---:|
| `06-DATA-MODEL.md` | To extract | To verify | To verify | To verify | To identify |
| `07-SECURITY.md` | To extract | To verify | To verify | To verify | To identify |
| `08-OFFLINE-AND-SYNC.md` | To extract | To verify | To verify | To verify | To identify |

---

# Coverage by Platform

Example:

| Platform | Critical requirements | Verified | Partial | Missing |
|---|---:|---:|---:|---:|
| Web | To calculate | To calculate | To calculate | To calculate |
| Android | To calculate | To calculate | To calculate | To calculate |
| Backend | To calculate | To calculate | To calculate | To calculate |

---

# Coverage Integrity

Coverage percentages should not:

- Count specification-only requirements as implemented.
- Count manual plans as executed tests.
- Hide partial platform coverage.
- Ignore failure states.
- Ignore migration.
- Ignore Production configuration.
- Count superseded requirements as active.

---

# Traceability Automation

Automation may assist with:

```text
Identifier uniqueness

Broken reference detection

Missing owner detection

Missing source detection

Missing test mapping

Missing migration mapping

Stale file reference detection

Coverage summaries

Release requirement lists

Policy and store declaration comparison
```

---

# Automation Limitations

Automation cannot reliably determine alone:

- Whether behavior is financially correct.
- Whether a test is sufficient.
- Whether a public claim is legally adequate.
- Whether a migration preserves ambiguous data.
- Whether a requirement is truly not applicable.
- Whether an AI-generated mapping is factual.

---

# Traceability Validation Script

Potential future script:

```text
scripts/validate-traceability.js
```

Potential checks:

```text
Unique requirement IDs

Valid source documents

Valid status values

Valid risk values

Existing referenced files

Existing referenced tests

No released requirement without release reference

No critical verified requirement without test evidence

No superseded requirement without replacement

No blocked requirement without blocker
```

The script must validate repository reality rather than only YAML syntax.

---

# Source Reference Validation

A referenced source section should exist.

Because headings may change, validation may use:

- Stable heading slug
- Explicit anchor
- Requirement marker
- Source section ID

---

# Requirement Markers in Specifications

Future specifications may embed optional markers:

```markdown
<a id="NEX-DATA-MONEY-001"></a>
```

or:

```text
Requirement: NEX-DATA-MONEY-001
```

Existing documents do not need immediate mass editing before the registry exists.

---

# Traceability and AI Agents

AI agents should receive requirement IDs in bounded tasks.

Example:

```text
Implement:
- NEX-DATA-MONEY-001
- NEX-DATA-MONEY-002

Do not modify:
- NEX-SYNC-QUEUE-001
- NEX-PRIV-DELETE-004
```

---

# AI Traceability Responsibilities

AI-generated changes should state:

```text
Requirements addressed

Requirements affected indirectly

Files inspected

Files changed

Tests added

Tests executed

Migrations added

Evidence not available

Remaining gaps
```

---

# AI Traceability Prohibitions

AI must not:

- Mark a requirement implemented without inspecting code.
- Mark a test passed without executing it.
- Invent a file reference.
- Invent a migration reference.
- Invent a Production monitor.
- Infer release status from source presence.
- Mark a requirement not applicable without authority.
- remove traceability gaps to make coverage appear higher.
- merge distinct requirements solely for convenience.
- reuse a retired identifier.

---

# Traceability Ownership Model

Recommended roles:

```text
Traceability Owner

Document Owner

Requirement Owner

Implementation Owner

Quality Owner

Release Owner

Operations Owner

Audit Owner
```

---

# Traceability Owner

Responsible for:

- Registry structure
- Identifier governance
- Validation
- Coverage reporting
- Gap visibility
- Review cadence

---

# Document Owner

Responsible for:

- Source requirement accuracy
- Requirement changes
- Supersession
- Source version

---

# Requirement Owner

Responsible for:

- Implementation planning
- Evidence completeness
- Continued validity
- Gap resolution

---

# Quality Owner

Responsible for:

- Test sufficiency
- Test execution evidence
- Coverage integrity
- Regression mapping

---

# Release Owner

Responsible for:

- Release requirement list
- Artifact mapping
- Feature Flag state
- Known gaps
- Release evidence

---

# Operations Owner

Responsible for:

- Monitoring
- Alerts
- Runbooks
- Operational verification

---

# Audit Owner

Responsible for:

- Evidence review
- Findings
- Corrective actions
- Periodic traceability audit

---

# Traceability Review Cadence

Recommended:

```text
Per material Pull Request

Per migration

Per release

Monthly gap review

Quarterly critical-requirement review

After incidents

After provider changes

After major policy changes
```

Actual cadence may be adjusted to team size and release frequency.

---

# Traceability Baseline Creation

The initial matrix should be created incrementally.

Recommended order:

```text
1. Critical Foundation requirements

2. Data and Money requirements

3. Owner isolation and Security

4. Offline and synchronization

5. Database and local migration

6. Privacy and Account deletion

7. Android Production safety

8. Recovery

9. Accessibility

10. Compliance and store readiness

11. Remaining Product and quality requirements
```

---

# Initial Traceability Baseline Status

The first baseline should not pretend that all requirements are already mapped.

Acceptable initial states include:

```text
specified

implementation_to_verify

test_to_verify

gap_open
```

---

# Critical Traceability Baseline

Before major migration work, at minimum trace:

```text
Exact Money

Explicit Currency

Transaction identity

Transfer integrity

Owner isolation

RLS

Local owner namespace

Stable operation ID

Unknown outcome

Account switching

Account deletion

Backup deletion reconciliation

Android signing

Production artifact identity
```

---

# Traceability Change Governance

A requirement change should identify:

- Previous wording
- New wording
- Reason
- Risk change
- Scope change
- Implementation impact
- Test impact
- Migration impact
- Public disclosure impact
- Effective version

---

# Requirement Supersession Record

Recommended:

```text
old_requirement_id

new_requirement_id

reason

effective_version

affected_releases

migration_required

owner
```

---

# Requirement Retirement

A requirement may be retired when:

- Capability is removed.
- Provider is removed.
- Platform is no longer supported.
- Architecture eliminates the condition.
- A replacement requirement fully supersedes it.

Retirement should not erase historical evidence.

---

# Traceability Exception

A traceability exception may temporarily allow incomplete evidence.

Required:

```text
requirement_id

missing_evidence

reason

risk

owner

compensating_control

expiration

resolution_plan

approver
```

---

# Exception Prohibitions

An exception must not be used to:

- Hide a failed owner-isolation test.
- Release known incorrect Money behavior.
- Skip deletion verification.
- Claim a test passed without execution.
- claim Production monitoring exists when it does not.
- Mark a public policy accurate without implementation review.
- remove a Critical requirement from the release gate.

---

# Traceability Anti-Patterns

The following are prohibited:

## Requirement by File Name

Assuming `transactions.js` satisfies every Transaction requirement.

## Test Count as Coverage

Counting tests without mapping their behavior to requirements.

## Documentation Circular Evidence

Using the requirement document as proof of implementation.

## One Requirement for Everything

Creating an untestable requirement such as “Nexio must be secure and reliable.”

## Requirement per Sentence

Creating excessive identifiers for explanatory prose.

## Status Inflation

Marking requirements verified when only code exists.

## Platform Masking

Marking complete when Web passes but Android does not.

## Release by Assumption

Marking released because code exists in the main branch.

## Monitoring by Dashboard Name

Claiming operational coverage because a dashboard title exists.

## Migration without Requirement Link

Changing persistent data without identifying the governing requirement.

## Orphan Test

Maintaining critical tests with no known requirement or behavior owner.

## Orphan Implementation

Maintaining behavior that no specification authorizes.

## Hidden Gap

Leaving missing evidence only in private notes.

## Reused Identifier

Assigning a retired requirement ID to a new meaning.

## AI-Invented Evidence

Accepting fabricated file, test or release references.

---

# Part 1 Traceability Review Questions

Before registering a requirement, answer:

```text
Is this statement enforceable?

Is it a requirement or an example?

Which document is authoritative?

Which risk applies?

Which platforms apply?

Which owner is accountable?

Can it be tested independently?

Does it require migration?

Does it require Production evidence?

Does another requirement already cover it?
```

---

# Requirement Status Review Questions

```text
Does the implementation exist?

Was it inspected?

Was the required test executed?

Which environment was tested?

Which platforms passed?

Was the release artifact verified?

Does monitoring exist?

Is any required scope still missing?
```

---

# Evidence Review Questions

```text
Does the evidence exist?

Does it apply to the current version?

Does it apply to the correct environment?

Does it use synthetic or redacted data?

Does it prove the requirement rather than a nearby behavior?

Is the evidence stale after a later change?
```

---

# Coverage Review Questions

```text
Which platform is uncovered?

Which failure state is untested?

Which migration is unrehearsed?

Which provider is unverified?

Which public declaration is not mapped?

Which Production control is missing?
```

---

# Gap Review Questions

```text
Is the gap release-blocking?

Which user or data risk exists?

Which phase should resolve it?

Who owns the correction?

Which compensating control exists?

When does the gap expire?
```

---

# Automation Review Questions

```text
Does the validation check repository reality?

Can it detect missing files?

Can it detect missing tests?

Can it distinguish tested from released?

Can it avoid inventing completion?

Which decisions still require human review?
```

---

# Part 1 Acceptance Criteria

The Requirements Traceability Matrix foundation is accepted only when:

```text
□ Every material requirement can receive a stable identifier.

□ Requirement identifiers survive document reorganization.

□ Requirement identity remains distinct from wording.

□ Traceability is bidirectional.

□ Documentation is not treated as implementation evidence.

□ Implementation is not treated as verification.

□ Test success is not treated automatically as Production evidence.

□ Store approval is not treated as Product verification.

□ Public claims require strong traceability.

□ Critical requirements require multiple evidence types.

□ Persistent-data requirements map to migration evidence.

□ Missing links remain visible as gaps.

□ Partial platform coverage remains explicit.

□ Platform and environment scopes are recorded.

□ Requirement status reflects actual state.

□ Superseded requirements remain historically traceable.

□ Traceability can be reviewed by someone other than the author.

□ AI-generated mappings require verification.

□ Product, Domain, Security, Privacy, Accessibility and Operations requirements are covered.

□ Requirement taxonomies are defined.

□ Identifier format is defined.

□ Identifier prefixes are governed.

□ Requirement records contain source, risk, scope, owner and status.

□ Requirement wording is enforceable.

□ Risk and priority remain distinct.

□ Statuses from identified through operationally verified are defined.

□ Implemented does not imply tested.

□ Tested does not imply released.

□ Released does not imply operationally verified.

□ Partial coverage has its own status.

□ Not-applicable status requires justification.

□ Coverage dimensions include implementation, tests, platform, migration and operations.

□ Failure-state coverage is tracked.

□ Migration coverage is tracked.

□ Support and Compliance coverage are tracked.

□ Evidence levels E0 through E5 are defined.

□ Evidence requirements increase with risk.

□ File, test, migration, release and monitor references are distinguishable.

□ Evidence identifies version and environment.

□ Stale evidence is reviewed.

□ Traceability relationship types are defined.

□ Requirements can depend on other requirements.

□ Requirements can supersede other requirements.

□ Requirements can block release.

□ Traceability files have an explicit repository location.

□ Human-readable and machine-readable sources do not diverge.

□ Requirement extraction follows a governed process.

□ Examples are not automatically classified as requirements.

□ Acceptance criteria are high-value extraction sources.

□ Constitutional rules become parent controls.

□ Requirement hierarchy is supported.

□ Parent requirements depend on mandatory child requirements.

□ Requirement granularity supports implementation and testing.

□ Duplicate requirements are consolidated.

□ Conflicting requirements trigger governance decisions.

□ Release-blocking requirements are identifiable.

□ Traceability gaps have stable records.

□ Gap types are defined.

□ Critical gaps receive elevated priority.

□ Pull Requests identify affected requirements.

□ Tests can identify verified requirements.

□ Migrations identify governing requirements.

□ Releases identify included and partial requirements.

□ Incidents identify violated requirements.

□ Audits identify missing evidence.

□ Coverage summaries do not inflate completion.

□ Automation may validate identifiers and references.

□ Automation does not decide financial correctness independently.

□ Traceability validation checks actual repository references.

□ AI agents receive bounded requirement IDs.

□ AI agents report missing evidence honestly.

□ Traceability roles are defined.

□ Traceability reviews occur during changes and releases.

□ Initial baseline creation follows risk priority.

□ Critical Money, owner, synchronization, deletion and Android requirements are traced first.

□ Requirement changes record implementation and test impact.

□ Requirement retirement preserves history.

□ Traceability exceptions are narrow and expiring.

□ Part 1 traceability anti-patterns are prohibited.
```

---

# Traceability Constitutional Rule

Every Nexio requirement, implementation claim, test result, migration, release statement and operational guarantee must answer:

```text
Can a qualified reviewer follow a stable requirement identifier from its authoritative specification to the exact implementation, executed verification, released artifact and current operational evidence?
```

When the answer is uncertain, prefer the action that:

- Marks the requirement as incomplete.
- Records a traceability gap.
- Inspects the active implementation.
- Executes the missing test.
- Verifies the release artifact.
- Rehearses the migration.
- Adds Production monitoring.
- Updates the public declaration.
- Assigns an owner.
- Blocks release.
- Rejects the completion claim.

Traceability is not created by adding links to a document.

It is created when every important Product guarantee has a stable identity, an accountable owner, concrete implementation, executed verification and evidence appropriate to its risk.

---
---

# Domain Traceability Matrix Architecture

This section establishes the first detailed requirement matrices for Nexio.

The matrices begin with the highest-risk foundations:

```text
Foundation

Architecture

Money

Currency

Accounts

Transactions

Transfers

Database

Row-Level Security

Local Storage

Offline and Synchronization

Authentication

Owner Isolation
```

These records are initial authoritative traceability definitions.

Implementation, test and release references marked:

```text
To verify
```

must be replaced only after inspecting the active repository and executing the applicable verification.

No requirement in this section should be marked complete merely because a similarly named file exists.

---

# Matrix Status Convention

Initial matrix records may use:

```text
specified

planned

implementation_to_verify

test_to_verify

partially_covered

gap_open
```

Where the current repository has not yet been inspected against the requirement, use:

```text
implementation_to_verify
```

Do not use:

```text
implemented

tested

verified

released
```

without evidence required by Part 1.

---

# Matrix Reference Convention

Potential reference placeholders:

```text
IMPL: To verify

TEST: To create

MIGRATION: Not required

MONITOR: To define

RUNBOOK: To define

RELEASE: Not yet verified
```

These placeholders are not evidence.

They make missing evidence explicit.

---

# Foundation Requirements Matrix

Foundation requirements define Product-wide trust boundaries.

---

## Foundation Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-FND-TRUST-001` | Financial trust preservation | Critical | P0 | Shared | Specified |
| `NEX-FND-OWNER-001` | Owner boundaries are non-negotiable | Critical | P0 | Shared | Specified |
| `NEX-FND-DATA-001` | Existing valid user data must be preserved | Critical | P0 | Shared | Specified |
| `NEX-FND-EXACT-001` | Financial values must remain exact | Critical | P1 | Shared | Specified |
| `NEX-FND-STATE-001` | User-visible state must be truthful | High | P1 | Shared | Specified |
| `NEX-FND-OFFLINE-001` | Offline claims must match actual durability | High | P1 | Web, Android | Specified |
| `NEX-FND-ACCESS-001` | Critical journeys must remain accessible | High | P1 | All user interfaces | Specified |
| `NEX-FND-PRIV-001` | Data collection must remain purpose-limited | High | P1 | Shared | Specified |
| `NEX-FND-RECOVERY-001` | Critical state must be recoverable | Critical | P1 | Shared | Specified |
| `NEX-FND-AI-001` | AI must not hold autonomous financial authority | Critical | P1 | Assistant | Specified |
| `NEX-FND-CONTINUITY-001` | Migration must preserve Production continuity | High | P1 | Shared | Specified |
| `NEX-FND-EVIDENCE-001` | Critical guarantees require reproducible evidence | High | P1 | Operations | Specified |

---

## `NEX-FND-TRUST-001` — Financial Trust Preservation

### Requirement

```text
Every Nexio capability must preserve the user's ability to trust that financial records, totals, states and actions represent the actual canonical Product state.
```

### Risk

```text
Critical
```

### Priority

```text
P0
```

### Scope

```text
Shared

Web

Android

Backend

Providers

Operations
```

### Parent Requirements

```text
None
```

### Child Requirements

```text
NEX-DATA-MONEY-001

NEX-DATA-CURRENCY-001

NEX-TRAN-ID-001

NEX-TRANSFER-INTEGRITY-001

NEX-SYNC-IDEMPOTENCY-001

NEX-FND-STATE-001
```

### Expected Implementation Areas

```text
js/core/finance.js

js/core/transactions.js

js/core/reports.js

js/domain/

js/application/

supabase-schema.sql

supabase/migrations/

Local persistence implementation
```

### Required Tests

```text
Financial golden dataset

Transaction round-trip

Transfer integrity

Report reconciliation

Synchronization duplicate prevention

Cross-platform total parity
```

### Required Operational Evidence

```text
Financial command failure monitoring

Duplicate-operation monitoring

Reconciliation evidence

Incident runbook
```

### Initial Traceability

```text
IMPL: To verify

TEST: To create or verify

MIGRATION: Depends on current Money and Transaction representation

MONITOR: To define

STATUS: specified
```

---

## `NEX-FND-OWNER-001` — Owner Boundaries Are Non-Negotiable

### Requirement

```text
No owner may read, create, update, delete, synchronize, export, restore or receive another owner's protected data.
```

### Risk

```text
Critical
```

### Priority

```text
P0
```

### Scope

```text
Shared

Web

Android

Backend

Local Storage

Providers

Support

Recovery
```

### Child Requirements

```text
NEX-SEC-OWNER-001

NEX-SEC-RLS-001

NEX-LOCAL-OWNER-001

NEX-SYNC-OWNER-001

NEX-AUTH-SWITCH-001
```

### Required Tests

```text
Cross-owner Select denial

Cross-owner Insert denial

Cross-owner Update denial

Cross-owner Delete denial

Local namespace isolation

Account-switch cleanup

Export ownership

Attachment ownership

Backup restore ownership
```

### Release Gate

```text
Web Production

Android Production

Database migration

Recovery exercise
```

### Initial Traceability

```text
IMPL: To verify

TEST: P0 safety tests required

MIGRATION: May require owner-field backfill

MONITOR: Cross-owner access alert required

STATUS: specified
```

---

## `NEX-FND-DATA-001` — Preserve Existing Valid User Data

### Requirement

```text
Repository, schema, local-storage and synchronization migrations must preserve all valid existing user financial records and confirmed pending intent.
```

### Risk

```text
Critical
```

### Priority

```text
P0
```

### Scope

```text
Database

Local Storage

Synchronization

Android updates

Web updates

Recovery
```

### Required Evidence

```text
Legacy-data inventory

Migration dry run

Row-count reconciliation

Money reconciliation by Currency

Pending-operation reconciliation

Restore point

Post-migration validation
```

### Initial Traceability

```text
IMPL: To verify

TEST: Migration rehearsal required

MIGRATION: Required for every persistent-state change

STATUS: specified
```

---

## `NEX-FND-EXACT-001` — Exact Financial Values

### Requirement

```text
Financial values must preserve exact Amount and Currency semantics through input, persistence, calculation, synchronization, Import, Export and display.
```

### Child Requirements

```text
NEX-DATA-MONEY-001

NEX-DATA-MONEY-002

NEX-DATA-CURRENCY-001

NEX-DATA-CURRENCY-002
```

### Example Verification Values

```text
R$ 0,01

R$ 9,90

R$ 84,90

R$ 1.250,00

R$ 3.420,15

R$ 999.999,99
```

### Initial Traceability

```text
IMPL: To verify

TEST: Exact-value lifecycle tests required

STATUS: specified
```

---

## `NEX-FND-STATE-001` — Truthful User-Visible State

### Requirement

```text
Nexio must distinguish and communicate local, queued, synchronized, conflicted, failed, deleted and unknown-outcome states accurately.
```

### Expected UI States

```text
Saved locally

Waiting to synchronize

Synchronized

Conflict requires review

Authentication required

Unknown outcome under reconciliation

Deletion processing

Recovery mode
```

### Required Tests

```text
Offline Save

Remote timeout

Provider outage

Authentication expiration

Conflict

Deletion failure

Recovery
```

### Initial Traceability

```text
IMPL: To verify

TEST: To create

STATUS: specified
```

---

## `NEX-FND-OFFLINE-001` — Accurate Offline Durability

### Requirement

```text
Nexio must not communicate that data is safely synchronized when it exists only on the current device.
```

### Dependencies

```text
NEX-LOCAL-DURABILITY-001

NEX-SYNC-STATE-001

NEX-SYNC-PENDING-001
```

### Initial Traceability

```text
IMPL: To verify

TEST: Offline restart and reconnect tests required

STATUS: specified
```

---

## `NEX-FND-ACCESS-001` — Accessible Critical Journeys

### Requirement

```text
Authentication, Transaction management, Transfer review, Export, Account deletion, Privacy controls, Conflict review and Support must remain accessible.
```

### Scope

```text
Desktop

Tablet

Mobile Web

Android

Public Website
```

### Required Tests

```text
Keyboard

Screen reader

Large text

Focus management

Error summary

Touch targets

Mobile reflow
```

### Initial Traceability

```text
IMPL: To verify

TEST: Accessibility suite required

STATUS: specified
```

---

## `NEX-FND-PRIV-001` — Purpose-Limited Data Processing

### Requirement

```text
Nexio must collect, process, expose and retain only data required for the approved Product, Security, Support, Analytics, Advertising or legal purpose.
```

### Dependencies

```text
NEX-PRIV-PURPOSE-001

NEX-PRIV-RETENTION-001

NEX-COMP-DECLARATION-001
```

### Initial Traceability

```text
IMPL: To verify

POLICY: politica-de-privacidade.html — To verify

STORE_DECLARATION: To verify

STATUS: specified
```

---

## `NEX-FND-RECOVERY-001` — Recoverable Critical State

### Requirement

```text
Critical financial and owner state must have a tested recovery or forward-correction procedure appropriate to its failure mode.
```

### Required Evidence

```text
Backup

Recovery runbook

Restore exercise

Financial reconciliation

Deletion reconciliation
```

### Initial Traceability

```text
IMPL: To verify

TEST: Recovery exercises required

STATUS: specified
```

---

## `NEX-FND-AI-001` — No Autonomous Financial Authority

### Requirement

```text
AI and Assistant systems must not independently create, update, delete, transfer, restore or resolve financial state without a governed user-confirmed canonical command.
```

### Dependencies

```text
NEX-TRAN-COMMAND-001

NEX-SYNC-IDEMPOTENCY-001

NEX-AI-CONFIRM-001
```

### Initial Traceability

```text
IMPL: Future or to verify

TEST: Assistant action-boundary tests required

STATUS: specified
```

---

## `NEX-FND-CONTINUITY-001` — Production Continuity

### Requirement

```text
Implementation phases must preserve a deployable or recoverable Production state.
```

### Initial Traceability

```text
ROADMAP: docs/22-IMPLEMENTATION-ROADMAP-AND-MIGRATION-PLAN.md

IMPL: Process requirement

TEST: Build and release gates required

STATUS: specified
```

---

## `NEX-FND-EVIDENCE-001` — Reproducible Evidence

### Requirement

```text
Every Critical and High Product guarantee must map to evidence appropriate to its risk.
```

### Required Evidence Level

```text
Critical: E1 + E2 + E3 + E4 + E5

High: E1 + E2 + E3 + E4
```

### Initial Traceability

```text
IMPL: Traceability system planned

TEST: Validation script planned

STATUS: specified
```

---

# Architecture Requirements Matrix

Architecture requirements define authority and dependency boundaries.

---

## Architecture Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-ARCH-LAYER-001` | Domain independence | Critical | P1 | Shared | Specified |
| `NEX-ARCH-COMMAND-001` | Canonical Application commands | Critical | P1 | Shared | Specified |
| `NEX-ARCH-REPO-001` | Persistence behind repository interfaces | High | P1 | Shared | Specified |
| `NEX-ARCH-PROVIDER-001` | External providers behind Adapters | High | P1 | Shared | Specified |
| `NEX-ARCH-UI-001` | UI must not own financial truth | Critical | P1 | All UI | Specified |
| `NEX-ARCH-WRITER-001` | One canonical writer per capability | Critical | P0 | Shared | Specified |
| `NEX-ARCH-ERROR-001` | Canonical error taxonomy | High | P1 | Shared | Specified |
| `NEX-ARCH-CONFIG-001` | Environment configuration validation | High | P1 | Build, Runtime | Specified |
| `NEX-ARCH-PLATFORM-001` | Shared Domain across platforms | Critical | P1 | Web, Android | Specified |
| `NEX-ARCH-COMPAT-001` | Compatibility code must expire | Moderate | P2 | Migration | Specified |
| `NEX-ARCH-BOOT-001` | Controlled application bootstrap | High | P1 | Web, Android | Specified |
| `NEX-ARCH-OBS-001` | Architecture must expose safe operational state | High | P1 | Operations | Specified |

---

## `NEX-ARCH-LAYER-001` — Domain Independence

### Requirement

```text
Canonical Domain logic must not depend directly on UI, browser globals, Android bridge, Supabase client or external providers.
```

### Expected Target Areas

```text
js/domain/

js/application/

js/infrastructure/

js/ui/
```

### Current Candidates to Inspect

```text
js/core/finance.js

js/core/transactions.js

js/core/reports.js

app.js
```

### Required Tests

```text
Domain modules execute without DOM.

Domain modules execute without Supabase.

Domain modules execute without Capacitor.

Domain tests use deterministic fixtures.
```

### Initial Traceability

```text
IMPL: Current implementation to inspect

TEST: To create

STATUS: specified
```

---

## `NEX-ARCH-COMMAND-001` — Canonical Application Commands

### Requirement

```text
Every financial mutation must pass through one canonical Application command that enforces validation, owner scope, operation identity and persistence rules.
```

### Child Commands

```text
Create Transaction

Update Transaction

Delete Transaction

Create Transfer

Update Transfer

Delete or reverse Transfer

Create Goal contribution

Resolve Conflict
```

### Initial Traceability

```text
IMPL: To verify in app.js and js/core/

TEST: Command-level tests required

STATUS: specified
```

---

## `NEX-ARCH-REPO-001` — Repository Interfaces

### Requirement

```text
Application and Domain layers must access persistent state through explicit repository interfaces rather than direct storage-provider calls.
```

### Expected Interfaces

```text
AccountRepository

TransactionRepository

TransferRepository

GoalRepository

OperationRepository

ConflictRepository

PreferenceRepository
```

### Initial Traceability

```text
IMPL: To verify

GAP: Repository interfaces may not yet exist

STATUS: specified
```

---

## `NEX-ARCH-PROVIDER-001` — Provider Adapters

### Requirement

```text
Provider-specific SDKs, payloads, errors and authentication details must remain behind bounded Adapters.
```

### Provider Categories

```text
Supabase

Authentication

Attachment storage

Notifications

Analytics

Assistant

Advertising

Import providers

Export destinations
```

### Initial Traceability

```text
IMPL: supabase-config.js and provider usage to inspect

TEST: Provider contract tests required

STATUS: specified
```

---

## `NEX-ARCH-UI-001` — UI Is Not Financial Authority

### Requirement

```text
Desktop, Tablet, Mobile and Android UI code must not independently calculate, persist or reconcile canonical financial state.
```

### Current Areas to Inspect

```text
js/ui/desktop.js

js/ui/tablet.js

js/ui/mobile.js

js/ui/shared-ui.js

app.js
```

### Required Tests

```text
Cross-platform totals match.

Cross-platform commands produce the same operation.

UI formatting does not change persisted Amount.

UI does not call Supabase directly.
```

### Initial Traceability

```text
IMPL: To verify

STATUS: specified
```

---

## `NEX-ARCH-WRITER-001` — One Canonical Writer

### Requirement

```text
Only one authoritative implementation may write each canonical entity or process each canonical operation at a time.
```

### Prohibited Examples

```text
Legacy and new Transaction writers both active

Two synchronization queues

Two Account deletion coordinators

UI and backend independently creating Transfer counterparts
```

### Required Tests

```text
Single command path test

Duplicate event-binding test

Queue exclusivity test

Feature Flag writer-path test
```

### Initial Traceability

```text
IMPL: To inspect for duplicate write paths

TEST: To create

STATUS: specified
```

---

## `NEX-ARCH-ERROR-001` — Canonical Error Taxonomy

### Requirement

```text
Infrastructure and provider errors must be mapped into stable Product error categories before reaching UI, Support or Analytics.
```

### Expected Categories

```text
validation

authentication_required

authorization_denied

conflict

unavailable

timeout

rate_limited

unknown_outcome

storage_unavailable

migration_required

permanent_failure
```

### Initial Traceability

```text
IMPL: To verify

TEST: Error-mapping tests required

STATUS: specified
```

---

## `NEX-ARCH-CONFIG-001` — Environment Configuration Validation

### Requirement

```text
Application startup and builds must validate required environment configuration and fail safely when configuration is absent or invalid.
```

### Current Areas

```text
supabase-config.js

capacitor.config.ts

vercel.json

package.json

Android build configuration
```

### Required Tests

```text
Missing configuration

Wrong environment

Staging endpoint in Production

Invalid public key format

Startup failure redaction
```

---

## `NEX-ARCH-PLATFORM-001` — Shared Domain Across Platforms

### Requirement

```text
Web, Desktop, Tablet, Mobile Web and Android must use the same canonical Domain and Application contracts.
```

### Initial Traceability

```text
IMPL: To compare root, android-web and platform scripts

TEST: Cross-platform parity suite required

STATUS: specified
```

---

## `NEX-ARCH-COMPAT-001` — Expiring Compatibility

### Requirement

```text
Every compatibility Adapter, dual-read path, legacy CSS layer and migration Feature Flag must have an owner, removal condition and expiration.
```

### Expected Registry

```text
docs/registries/FEATURE-FLAG-REGISTRY.md

Temporary debt registry
```

---

## `NEX-ARCH-BOOT-001` — Controlled Bootstrap

### Requirement

```text
Application initialization must occur through one controlled bootstrap that validates configuration, establishes Authentication, opens owner storage and starts the correct platform shell once.
```

### Current Areas

```text
index.html

app.js

mobile-capacitor.js

js/ui/
```

### Required Tests

```text
Single initialization

Startup error

Account restoration

Android callback

Multiple tabs

Process recreation
```

---

## `NEX-ARCH-OBS-001` — Safe Operational State

### Requirement

```text
The architecture must expose safe release, schema, synchronization and provider-health metadata without exposing secrets or financial payloads.
```

### Expected Fields

```text
releaseId

sourceRevision

schemaVersion

localSchemaVersion

syncProtocolVersion

providerHealthCategory
```

---

# Money Requirements Matrix

Money requirements govern exact financial values.

---

## Money Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-DATA-MONEY-001` | Exact persisted representation | Critical | P0 | Shared | Specified |
| `NEX-DATA-MONEY-002` | Exact arithmetic | Critical | P0 | Shared | Specified |
| `NEX-DATA-MONEY-003` | Locale-independent serialization | Critical | P1 | Shared | Specified |
| `NEX-DATA-MONEY-004` | Locale-aware display | High | P1 | UI | Specified |
| `NEX-DATA-MONEY-005` | Exact Import conversion | Critical | P1 | Import | Specified |
| `NEX-DATA-MONEY-006` | Exact Export representation | Critical | P1 | Export | Specified |
| `NEX-DATA-MONEY-007` | Safe limits and overflow handling | High | P1 | Shared | Specified |
| `NEX-DATA-MONEY-008` | No symbol-only interpretation | High | P1 | Shared | Specified |
| `NEX-DATA-MONEY-009` | Derived totals preserve exactness | Critical | P1 | Reports | Specified |
| `NEX-DATA-MONEY-010` | Money migration reconciliation | Critical | P1 | Migration | Specified |

---

## `NEX-DATA-MONEY-001` — Exact Persisted Representation

### Requirement

```text
Canonical financial Amounts must use the approved exact persisted representation and must not use floating-point persistence.
```

### Current Implementation Candidates

```text
js/core/finance.js

js/core/transactions.js

supabase-schema.sql

Local storage records

Import parsing

Export generation
```

### Required Tests

```text
R$ 0,01 round trip

R$ 9,90 round trip

R$ 1.250,00 round trip

R$ 3.420,15 round trip

Negative value round trip

Maximum supported value

Database round trip

Local-storage round trip

Synchronization round trip
```

### Migration

```text
Required if current persistence uses binary floating point or ambiguous decimal text.
```

### Initial Traceability

```text
IMPL: To inspect

TEST: To create

MIGRATION: Discovery required

STATUS: specified
```

---

## `NEX-DATA-MONEY-002` — Exact Arithmetic

### Requirement

```text
Addition, subtraction, comparison, aggregation and reconciliation of Money must preserve exact value semantics.
```

### Prohibited

```text
0.1 + 0.2 style binary floating-point financial arithmetic

Implicit string concatenation

Uncontrolled rounding at intermediate steps
```

### Required Tests

```text
R$ 0,01 + R$ 0,02 = R$ 0,03

R$ 1.250,00 - R$ 84,90 = R$ 1.165,10

Aggregation of repeated cent values

Negative and positive reconciliation

Large list aggregation
```

---

## `NEX-DATA-MONEY-003` — Locale-Independent Serialization

### Requirement

```text
Persisted and synchronized Money must use a locale-independent representation.
```

### Prohibited Persisted Formats

```text
"R$ 1.250,00"

"1.250,00"

"1,250.00" without explicit schema
```

### Required Tests

```text
pt-BR display does not alter persisted value.

en-US display does not alter persisted value.

Synchronization across locale settings preserves the same Amount.
```

---

## `NEX-DATA-MONEY-004` — Locale-Aware Display

### Requirement

```text
Money must be formatted according to the active locale while preserving explicit Currency.
```

### pt-BR Examples

```text
BRL 125000 minor units → R$ 1.250,00

BRL 8490 minor units → R$ 84,90
```

### Required Tests

```text
Positive

Negative

Zero

Large value

Narrow mobile layout

Privacy masking

Screen reader announcement
```

---

## `NEX-DATA-MONEY-005` — Exact Import Conversion

### Requirement

```text
Import parsing must convert source Amounts into canonical Money without silent precision loss, separator ambiguity or sign reversal.
```

### Required Tests

```text
"1.250,00"

"1250,00"

"1250.00"

"-84,90"

"(84,90)"

Explicit Currency column

Missing Currency

Ambiguous separator
```

Ambiguous rows should require review rather than guesswork.

---

## `NEX-DATA-MONEY-006` — Exact Export Representation

### Requirement

```text
Exports must preserve canonical Amount and Currency unambiguously.
```

### Required Export Fields

Potential:

```text
amount

currency

formatted_amount
```

The canonical machine-readable Amount must remain distinct from localized display.

---

## `NEX-DATA-MONEY-007` — Safe Limits and Overflow

### Requirement

```text
Nexio must define and enforce maximum supported Money values and must reject or safely handle overflow.
```

### Required Tests

```text
Maximum accepted value

Value above maximum

Aggregate above maximum

Import overflow

Database constraint behavior

UI validation behavior
```

---

## `NEX-DATA-MONEY-008` — No Symbol-Only Interpretation

### Requirement

```text
The symbol R$, $, € or another symbol must not be the sole source of Currency identity.
```

### Required Tests

```text
USD and CAD both display symbol variants without collapsing identity.

BRL remains explicit as BRL in persistence.

Import with "$" but no code enters review.
```

---

## `NEX-DATA-MONEY-009` — Exact Derived Totals

### Requirement

```text
Balances, Reports, Goals and summaries must derive totals from canonical exact Money records.
```

### Required Tests

```text
Account balance

Income total

Expense total

Cash flow

Goal progress

Transfer exclusion or inclusion rules

Deleted Transaction exclusion

Pending-state treatment
```

---

## `NEX-DATA-MONEY-010` — Migration Reconciliation

### Requirement

```text
Any Money representation migration must reconcile record counts and totals separately for each Currency.
```

### Required Evidence

```text
Pre-migration totals by Currency

Post-migration totals by Currency

Rejected rows

Overflow rows

Ambiguous rows

Repair decisions
```

### Prohibited

```text
Combining BRL, USD and EUR into one migration total.
```

---

# Currency Requirements Matrix

---

## Currency Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-DATA-CURRENCY-001` | Explicit Currency code | Critical | P0 | Shared | Specified |
| `NEX-DATA-CURRENCY-002` | Currency validation | High | P1 | Shared | Specified |
| `NEX-DATA-CURRENCY-003` | Currency immutability rules | High | P1 | Accounts | Specified |
| `NEX-DATA-CURRENCY-004` | No implicit conversion | Critical | P1 | Reports, Transfers | Specified |
| `NEX-DATA-CURRENCY-005` | Minor-unit metadata | Critical | P1 | Shared | Specified |
| `NEX-DATA-CURRENCY-006` | Multi-Currency separation | Critical | P1 | Reports | Specified |
| `NEX-DATA-CURRENCY-007` | Currency-aware Import | High | P1 | Import | Specified |
| `NEX-DATA-CURRENCY-008` | Currency-aware Export | High | P1 | Export | Specified |

---

## `NEX-DATA-CURRENCY-001` — Explicit Currency Code

### Requirement

```text
Every canonical Money value and financial Account must identify Currency explicitly using an approved Currency code.
```

### Expected Example

```text
amountMinor: 125000

currency: "BRL"
```

### Initial Traceability

```text
IMPL: To inspect current Account and Transaction fields

TEST: To create

MIGRATION: May require Currency backfill

STATUS: specified
```

---

## `NEX-DATA-CURRENCY-002` — Currency Validation

### Requirement

```text
Currency codes must be normalized and validated against the approved Currency registry.
```

### Required Tests

```text
"brl" normalizes to "BRL" where input normalization is approved.

Unknown code is rejected.

Blank code is rejected.

Whitespace is rejected or normalized explicitly.
```

---

## `NEX-DATA-CURRENCY-003` — Account Currency Rules

### Requirement

```text
Changing an Account Currency must not silently reinterpret historical Amounts.
```

### Approved Strategies

Potential:

```text
Disallow Currency change after financial records exist.

Create a new Account.

Use an explicit governed conversion migration.
```

The Product decision must be explicit.

---

## `NEX-DATA-CURRENCY-004` — No Implicit Conversion

### Requirement

```text
Nexio must not convert between Currencies without an explicit approved rate, source, time and user-visible explanation.
```

### Initial Scope

If automatic conversion is not implemented:

```text
Multi-Currency values remain separated.
```

---

## `NEX-DATA-CURRENCY-005` — Minor-Unit Metadata

### Requirement

```text
Money parsing, validation and formatting must use the approved minor-unit behavior for each supported Currency.
```

### Required Tests

```text
Two-decimal Currency

Zero-decimal Currency where supported

Unsupported minor-unit precision

Import precision mismatch
```

---

## `NEX-DATA-CURRENCY-006` — Multi-Currency Separation

### Requirement

```text
Reports and balances must not aggregate unrelated Currencies into one total unless an approved conversion model is active.
```

### Required UI Behavior

```text
BRL total shown separately

USD total shown separately

No unlabeled combined total
```

---

## `NEX-DATA-CURRENCY-007` — Currency-Aware Import

### Requirement

```text
Imported rows must identify Currency explicitly or enter a governed review process.
```

---

## `NEX-DATA-CURRENCY-008` — Currency-Aware Export

### Requirement

```text
Every exported financial record must retain explicit Currency identity.
```

---

# Account Requirements Matrix

---

## Account Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-ACCOUNT-ID-001` | Stable Account identity | Critical | P1 | Shared | Specified |
| `NEX-ACCOUNT-OWNER-001` | Account owner binding | Critical | P0 | Shared | Specified |
| `NEX-ACCOUNT-CURRENCY-001` | Explicit Account Currency | Critical | P0 | Shared | Specified |
| `NEX-ACCOUNT-BALANCE-001` | Balance derived from canonical records | Critical | P1 | Shared | Specified |
| `NEX-ACCOUNT-ARCHIVE-001` | Archive preserves history | High | P1 | Shared | Specified |
| `NEX-ACCOUNT-DELETE-001` | Deletion follows governed lifecycle | High | P1 | Shared | Specified |
| `NEX-ACCOUNT-TYPE-001` | Valid Account type | Moderate | P2 | Shared | Specified |
| `NEX-ACCOUNT-DUP-001` | Duplicate Account handling | High | P2 | Shared | Specified |
| `NEX-ACCOUNT-VERSION-001` | Account version supports Conflict detection | High | P1 | Shared | Specified |
| `NEX-ACCOUNT-ACCESS-001` | Account access requires current owner authorization | Critical | P0 | Shared | Specified |

---

## `NEX-ACCOUNT-ID-001` — Stable Account Identity

### Requirement

```text
Every Account must have a stable opaque identifier that remains unchanged across synchronization, editing, export and migration.
```

### Required Tests

```text
Local creation

Remote synchronization

Application restart

Account rename

Account archive

Export

Migration
```

---

## `NEX-ACCOUNT-OWNER-001` — Account Owner Binding

### Requirement

```text
Every Account must belong unambiguously to one owner, and all access paths must enforce that relationship.
```

### Dependencies

```text
NEX-SEC-RLS-001

NEX-LOCAL-OWNER-001

NEX-AUTH-OWNER-001
```

---

## `NEX-ACCOUNT-CURRENCY-001` — Explicit Account Currency

### Requirement

```text
Every Account must have one explicit canonical Currency.
```

### Migration Requirement

Existing Accounts without Currency require:

```text
Deterministic backfill

or

User review

or

Quarantine
```

Do not infer Currency only from locale.

---

## `NEX-ACCOUNT-BALANCE-001` — Derived Balance

### Requirement

```text
Account balance must derive from approved canonical financial records and must not rely on an uncontrolled independently editable cached value.
```

### Required Tests

```text
Income

Expense

Transfer source

Transfer destination

Deleted Transaction

Pending local Transaction

Conflict

Multiple Currencies prohibited within one Account
```

---

## `NEX-ACCOUNT-ARCHIVE-001` — Archive Preserves History

### Requirement

```text
Archiving an Account must preserve its historical records and must not silently delete or exclude data from prior Reports without explicit Product rules.
```

---

## `NEX-ACCOUNT-DELETE-001` — Governed Account Deletion

### Requirement

```text
Deleting an individual financial Account must use an explicit governed lifecycle that addresses Transactions, Transfers, Goals, Attachments and Reports.
```

This requirement is distinct from deleting the complete Nexio owner Account.

---

## `NEX-ACCOUNT-TYPE-001` — Valid Account Type

### Requirement

```text
Account type must use an approved value and must not be inferred from presentation alone.
```

Potential values require Product approval.

---

## `NEX-ACCOUNT-DUP-001` — Duplicate Account Handling

### Requirement

```text
Potential duplicate Accounts must not be merged automatically without a governed preview and financial-impact review.
```

---

## `NEX-ACCOUNT-VERSION-001` — Account Version

### Requirement

```text
Account updates must support version-aware synchronization and Conflict detection.
```

---

## `NEX-ACCOUNT-ACCESS-001` — Current Owner Authorization

### Requirement

```text
Every Account read or mutation must authorize the currently authenticated owner and must not trust a client-supplied owner identifier alone.
```

---

# Transaction Requirements Matrix

---

## Transaction Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-TRAN-ID-001` | Stable Transaction identity | Critical | P0 | Shared | Specified |
| `NEX-TRAN-OWNER-001` | Transaction owner binding | Critical | P0 | Shared | Specified |
| `NEX-TRAN-COMMAND-001` | Canonical Transaction command | Critical | P0 | Shared | Specified |
| `NEX-TRAN-MONEY-001` | Exact Amount and Currency | Critical | P0 | Shared | Specified |
| `NEX-TRAN-TYPE-001` | Valid Transaction type | High | P1 | Shared | Specified |
| `NEX-TRAN-DATE-001` | Calendar Date semantics | High | P1 | Shared | Specified |
| `NEX-TRAN-ACCOUNT-001` | Valid Account relationship | Critical | P1 | Shared | Specified |
| `NEX-TRAN-CATEGORY-001` | Compatible Category relationship | High | P2 | Shared | Specified |
| `NEX-TRAN-VERSION-001` | Version-aware mutation | High | P1 | Shared | Specified |
| `NEX-TRAN-DELETE-001` | Governed deletion state | High | P1 | Shared | Specified |
| `NEX-TRAN-IDEMPOTENCY-001` | Idempotent Transaction mutation | Critical | P0 | Sync | Specified |
| `NEX-TRAN-UNKNOWN-001` | Unknown outcome reconciliation | Critical | P0 | Sync | Specified |
| `NEX-TRAN-DUP-001` | Duplicate detection before deletion | Critical | P1 | Shared | Specified |
| `NEX-TRAN-AUDIT-001` | Mutation traceability | High | P1 | Shared | Specified |

---

## `NEX-TRAN-ID-001` — Stable Transaction Identity

### Requirement

```text
Every canonical Transaction must have a stable opaque identifier that remains unchanged across local Save, synchronization, retry, editing, Export and migration.
```

---

## `NEX-TRAN-OWNER-001` — Transaction Owner Binding

### Requirement

```text
Every Transaction must belong to one owner through an explicit enforceable relationship.
```

### Required Tests

```text
Owner A cannot read Owner B Transaction.

Owner A cannot attach Transaction to Owner B Account.

Owner A cannot mutate Owner B Transaction.

Local Account switch hides previous-owner Transactions.
```

---

## `NEX-TRAN-COMMAND-001` — Canonical Transaction Command

### Requirement

```text
Create, update and delete operations must use one canonical Application command path.
```

### Current Areas to Inspect

```text
app.js

js/core/transactions.js

js/ui/
```

### Gap Candidate

```text
Direct UI mutation may exist and must be verified.
```

---

## `NEX-TRAN-MONEY-001` — Exact Amount and Currency

### Requirement

```text
Every Transaction must contain canonical exact Money with explicit Currency compatible with the selected Account.
```

---

## `NEX-TRAN-TYPE-001` — Valid Transaction Type

### Requirement

```text
Transaction type must use an approved Domain value and must be compatible with Category, Reports and Account effect.
```

Potential types:

```text
income

expense
```

Transfer must not be represented as an arbitrary unrelated type unless the canonical Transfer model explicitly defines it.

---

## `NEX-TRAN-DATE-001` — Calendar Date Semantics

### Requirement

```text
The user-selected financial Date must retain Calendar Date semantics and must not shift because of time-zone conversion.
```

### Required Tests

```text
Create Transaction near midnight

Different device time zone

Android restart

Export and reimport

Report period boundary
```

---

## `NEX-TRAN-ACCOUNT-001` — Valid Account Relationship

### Requirement

```text
A Transaction may reference only an existing authorized Account belonging to the same owner.
```

---

## `NEX-TRAN-CATEGORY-001` — Compatible Category

### Requirement

```text
A Transaction Category must belong to the same owner and be compatible with the Transaction type.
```

---

## `NEX-TRAN-VERSION-001` — Version-Aware Mutation

### Requirement

```text
Transaction updates must detect stale versions and must not silently overwrite a newer remote or local version.
```

---

## `NEX-TRAN-DELETE-001` — Governed Deletion State

### Requirement

```text
Transaction deletion must have an explicit state and must synchronize without allowing stale clients to recreate the deleted record silently.
```

Potential implementation:

```text
Tombstone or approved deletion ledger
```

The exact model must follow the Data and Sync specifications.

---

## `NEX-TRAN-IDEMPOTENCY-001` — Idempotent Mutation

### Requirement

```text
Repeating the same Transaction operation with the same operation identifier must not create a second canonical financial effect.
```

### Required Tests

```text
Same create operation sent twice

Timeout followed by retry

Android process recreation

Multiple tab submission

Provider retry
```

---

## `NEX-TRAN-UNKNOWN-001` — Unknown Outcome Reconciliation

### Requirement

```text
A Transaction operation with an uncertain remote result must be reconciled using the original operation identity before any replacement action is allowed.
```

---

## `NEX-TRAN-DUP-001` — Duplicate Investigation

### Requirement

```text
Potential duplicate Transactions must be classified before deletion as repeated user action, synchronization replay, Import duplicate, Transfer counterpart or visual duplication.
```

---

## `NEX-TRAN-AUDIT-001` — Mutation Traceability

### Requirement

```text
Material Transaction mutations must retain sufficient metadata to identify operation, owner, state, version and outcome.
```

---

# Transfer Requirements Matrix

---

## Transfer Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-TRANSFER-ID-001` | Stable Transfer identity | Critical | P0 | Shared | Specified |
| `NEX-TRANSFER-OWNER-001` | Transfer owner binding | Critical | P0 | Shared | Specified |
| `NEX-TRANSFER-INTEGRITY-001` | One logical Transfer | Critical | P0 | Shared | Specified |
| `NEX-TRANSFER-ATOMIC-001` | Atomic or reconcilable effects | Critical | P0 | Shared | Specified |
| `NEX-TRANSFER-ACCOUNT-001` | Valid source and destination | Critical | P1 | Shared | Specified |
| `NEX-TRANSFER-CURRENCY-001` | Explicit Currency behavior | Critical | P1 | Shared | Specified |
| `NEX-TRANSFER-IDEMPOTENCY-001` | Idempotent Transfer operation | Critical | P0 | Sync | Specified |
| `NEX-TRANSFER-DELETE-001` | Linked deletion or reversal | Critical | P1 | Shared | Specified |
| `NEX-TRANSFER-REPORT-001` | Report double-count prevention | Critical | P1 | Reports | Specified |
| `NEX-TRANSFER-REPAIR-001` | Controlled incomplete-Transfer repair | Critical | P1 | Recovery | Specified |

---

## `NEX-TRANSFER-ID-001` — Stable Transfer Identity

### Requirement

```text
Every logical Transfer must have a stable identity linking all associated Account effects.
```

---

## `NEX-TRANSFER-OWNER-001` — Transfer Owner Binding

### Requirement

```text
The source Account, destination Account and Transfer must belong to the same authorized owner unless a future explicitly governed external-transfer capability defines otherwise.
```

---

## `NEX-TRANSFER-INTEGRITY-001` — One Logical Transfer

### Requirement

```text
A Transfer must be represented and processed as one logical Domain action rather than two unrelated manually created Transactions.
```

### Current Implementation

```text
To inspect in js/core/transactions.js, finance.js and app.js.
```

---

## `NEX-TRANSFER-ATOMIC-001` — Atomic or Reconcilable Effects

### Requirement

```text
The source and destination financial effects must commit atomically or remain linked through a recovery process that cannot leave an unexplained permanent one-sided Transfer.
```

### Required Tests

```text
Source succeeds, destination fails

Destination succeeds, source fails

Remote timeout

Retry

Process death

Database transaction failure
```

---

## `NEX-TRANSFER-ACCOUNT-001` — Valid Accounts

### Requirement

```text
Transfer source and destination must be distinct, valid and authorized Accounts.
```

---

## `NEX-TRANSFER-CURRENCY-001` — Explicit Currency Behavior

### Requirement

```text
Transfer Currency behavior must be explicit and must not infer an exchange rate.
```

Potential initial rule:

```text
Only same-Currency Accounts may participate in a direct Transfer.
```

A different rule requires a separate conversion model.

---

## `NEX-TRANSFER-IDEMPOTENCY-001` — Idempotent Transfer

### Requirement

```text
Repeating a Transfer operation with the same operation identifier must not duplicate either Account effect.
```

---

## `NEX-TRANSFER-DELETE-001` — Linked Deletion or Reversal

### Requirement

```text
Deletion, cancellation or reversal of a Transfer must preserve the relationship and financial integrity of both effects.
```

---

## `NEX-TRANSFER-REPORT-001` — Report Double-Count Prevention

### Requirement

```text
Reports must treat Transfers according to explicit Product rules and must not count internal movement as independent Income and Expense unless intentionally requested.
```

---

## `NEX-TRANSFER-REPAIR-001` — Controlled Repair

### Requirement

```text
An incomplete Transfer must be repaired through a governed idempotent repair operation with backup, validation and audit.
```

---

# Database Requirements Matrix

---

## Database Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-DB-MIG-001` | Ordered migration history | Critical | P1 | Backend | Specified |
| `NEX-DB-OWNER-001` | Explicit owner relationships | Critical | P0 | Backend | Specified |
| `NEX-DB-CONSTRAINT-001` | Domain constraints in persistence | High | P1 | Backend | Specified |
| `NEX-DB-FK-001` | Referential integrity | High | P1 | Backend | Specified |
| `NEX-DB-INDEX-001` | Required owner and query indexes | High | P1 | Backend | Specified |
| `NEX-DB-VERSION-001` | Entity version support | High | P1 | Backend | Specified |
| `NEX-DB-OP-001` | Remote operation ledger | Critical | P1 | Backend | Specified |
| `NEX-DB-DELETE-001` | Deletion state and authority | Critical | P1 | Backend | Specified |
| `NEX-DB-BACKFILL-001` | Deterministic backfills | Critical | P1 | Migration | Specified |
| `NEX-DB-RECON-001` | Migration reconciliation | Critical | P1 | Migration | Specified |
| `NEX-DB-BACKUP-001` | Backup before high-risk migration | Critical | P0 | Operations | Specified |
| `NEX-DB-ROLLFORWARD-001` | Corrective migration path | High | P1 | Operations | Specified |

---

## `NEX-DB-MIG-001` — Ordered Migration History

### Requirement

```text
Database evolution must use immutable ordered migrations rather than relying only on a mutable schema snapshot.
```

### Current Candidate

```text
supabase-schema.sql
```

### Target Candidate

```text
supabase/migrations/
```

### Initial Traceability

```text
IMPL: Current migration tooling to verify

GAP: Historical migrations may be missing

STATUS: specified
```

---

## `NEX-DB-OWNER-001` — Explicit Owner Relationships

### Requirement

```text
Every protected database row must have an explicit deterministic relationship to its owner.
```

### Required Migration Procedure

```text
Inventory missing owner relationships

Prove ownership

Quarantine ambiguous rows

Backfill valid rows

Add constraint

Add index

Apply RLS

Run cross-owner tests
```

---

## `NEX-DB-CONSTRAINT-001` — Domain Constraints

### Requirement

```text
The database must enforce critical Domain invariants that cannot safely rely only on client validation.
```

Potential constraints:

```text
Valid Currency

Valid Transaction type

Required Account relationship

Transfer source differs from destination

Stable operation identity uniqueness

Valid deletion state
```

---

## `NEX-DB-FK-001` — Referential Integrity

### Requirement

```text
Canonical relationships among owner, Account, Transaction, Transfer, Category, Goal and Attachment must use enforceable referential integrity where appropriate.
```

---

## `NEX-DB-INDEX-001` — Required Indexes

### Requirement

```text
Owner-scoped reads, synchronization queries, operation reconciliation and deletion jobs must have appropriate indexes supported by measured query behavior.
```

---

## `NEX-DB-VERSION-001` — Entity Versions

### Requirement

```text
Remote mutable entities must expose an approved version or concurrency mechanism for Conflict detection.
```

---

## `NEX-DB-OP-001` — Remote Operation Ledger

### Requirement

```text
The backend must support reconciliation of idempotent financial operations using stable operation identity.
```

### Required Constraint

Potential:

```text
Unique owner and operation ID
```

Exact key design requires implementation review.

---

## `NEX-DB-DELETE-001` — Deletion Authority

### Requirement

```text
Database and recovery systems must preserve deletion authority sufficiently to prevent deleted owners or entities from being silently reactivated.
```

---

## `NEX-DB-BACKFILL-001` — Deterministic Backfills

### Requirement

```text
Database backfills must derive values from provable relationships and must quarantine ambiguous data.
```

---

## `NEX-DB-RECON-001` — Migration Reconciliation

### Requirement

```text
High-risk migrations must reconcile row counts, owner counts, financial values by Currency, relationships and deletion state.
```

---

## `NEX-DB-BACKUP-001` — Backup Before Migration

### Requirement

```text
A verified backup or restore point must exist before every high-risk persistent-data migration.
```

---

## `NEX-DB-ROLLFORWARD-001` — Corrective Migration

### Requirement

```text
When destructive rollback is unsafe or impossible, the migration plan must define a tested forward-correction path.
```

---

# Row-Level Security Requirements Matrix

---

## RLS Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-SEC-RLS-001` | RLS on every protected table | Critical | P0 | Backend | Specified |
| `NEX-SEC-RLS-SELECT-001` | Cross-owner Select denial | Critical | P0 | Backend | Specified |
| `NEX-SEC-RLS-INSERT-001` | Cross-owner Insert denial | Critical | P0 | Backend | Specified |
| `NEX-SEC-RLS-UPDATE-001` | Cross-owner Update denial | Critical | P0 | Backend | Specified |
| `NEX-SEC-RLS-DELETE-001` | Cross-owner Delete denial | Critical | P0 | Backend | Specified |
| `NEX-SEC-RLS-STORAGE-001` | Storage object owner isolation | Critical | P0 | Provider | Specified |
| `NEX-SEC-RLS-FUNC-001` | Function and RPC authorization | Critical | P0 | Backend | Specified |
| `NEX-SEC-RLS-ADMIN-001` | Service-role access is bounded | Critical | P1 | Backend, Operations | Specified |
| `NEX-SEC-RLS-TEST-001` | Automated cross-owner tests | Critical | P0 | Testing | Specified |
| `NEX-SEC-RLS-MIG-001` | RLS preserved during migrations | Critical | P0 | Migration | Specified |

---

## `NEX-SEC-RLS-001` — RLS on Protected Tables

### Requirement

```text
Every protected Supabase or PostgreSQL table must have Row-Level Security enabled and reviewed.
```

### Current Evidence Candidate

```text
supabase-schema.sql
```

### Initial Traceability

```text
IMPL: To inspect table by table

TEST: To create automated RLS suite

STATUS: specified
```

---

## `NEX-SEC-RLS-SELECT-001` — Select Denial

### Requirement

```text
An authenticated owner must not select another owner's protected row.
```

---

## `NEX-SEC-RLS-INSERT-001` — Insert Denial

### Requirement

```text
An authenticated owner must not insert a protected row owned by another owner or attach a row to another owner's entity.
```

---

## `NEX-SEC-RLS-UPDATE-001` — Update Denial

### Requirement

```text
An authenticated owner must not update another owner's protected row or change ownership through an update.
```

---

## `NEX-SEC-RLS-DELETE-001` — Delete Denial

### Requirement

```text
An authenticated owner must not delete another owner's protected row.
```

---

## `NEX-SEC-RLS-STORAGE-001` — Storage Isolation

### Requirement

```text
Attachment and export storage paths, metadata and signed access must enforce owner isolation.
```

### Required Tests

```text
Wrong owner object read

Wrong owner signed URL generation

Path traversal

Metadata-owner mismatch

Deleted object access
```

---

## `NEX-SEC-RLS-FUNC-001` — RPC and Function Authorization

### Requirement

```text
Database functions and RPC endpoints must enforce owner authorization independently of client-supplied owner identifiers.
```

---

## `NEX-SEC-RLS-ADMIN-001` — Bounded Service-Role Access

### Requirement

```text
Service-role or elevated database access must remain limited to approved server-side operations and must not be exposed to client code.
```

### Current Area

```text
supabase-config.js

Environment configuration

Server functions if present
```

---

## `NEX-SEC-RLS-TEST-001` — Automated Cross-Owner Tests

### Requirement

```text
Every protected table, function and storage path must have automated positive and negative owner-access tests.
```

---

## `NEX-SEC-RLS-MIG-001` — RLS During Migration

### Requirement

```text
Migrations must not disable owner isolation globally for convenience.
```

Any exceptional elevated migration requires:

- Narrow execution
- Controlled credentials
- Audit
- Independent review
- Immediate policy validation

---

# Local Storage Requirements Matrix

---

## Local Storage Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-LOCAL-SCHEMA-001` | Versioned local schema | Critical | P1 | Web, Android | Specified |
| `NEX-LOCAL-OWNER-001` | Owner-scoped local namespace | Critical | P0 | Web, Android | Specified |
| `NEX-LOCAL-DURABILITY-001` | Confirmed local Save is durable | Critical | P0 | Web, Android | Specified |
| `NEX-LOCAL-ATOMIC-001` | Entity and queue atomicity | Critical | P0 | Web, Android | Specified |
| `NEX-LOCAL-MIG-001` | Resumable local migration | Critical | P1 | Web, Android | Specified |
| `NEX-LOCAL-LEGACY-001` | Legacy store preserved during validation | High | P1 | Migration | Specified |
| `NEX-LOCAL-SECRET-001` | Secrets separated from financial storage | Critical | P1 | Android, Web | Specified |
| `NEX-LOCAL-CACHE-001` | Cache is not canonical authority | High | P1 | Web, Android | Specified |
| `NEX-LOCAL-QUOTA-001` | Storage failure is explicit | High | P1 | Web, Android | Specified |
| `NEX-LOCAL-TAB-001` | Multi-tab write coordination | High | P1 | Web | Specified |
| `NEX-LOCAL-PROCESS-001` | Process-death resilience | Critical | P1 | Android | Specified |

---

## `NEX-LOCAL-SCHEMA-001` — Versioned Local Schema

### Requirement

```text
Canonical local persistence must expose an explicit schema version and ordered migration path.
```

### Current Areas to Inspect

```text
js/core/storage.js

app.js

mobile-capacitor.js

localStorage

IndexedDB

Capacitor Preferences

SQLite
```

---

## `NEX-LOCAL-OWNER-001` — Owner-Scoped Namespace

### Requirement

```text
Local financial records, pending operations, Conflicts and checkpoints must remain isolated by owner.
```

### Required Tests

```text
Owner A creates local data.

Owner A signs out.

Owner B signs in.

Owner B cannot read, search, synchronize or export Owner A data.
```

---

## `NEX-LOCAL-DURABILITY-001` — Durable Confirmed Save

### Requirement

```text
A UI success state for a local financial Save may appear only after the canonical local record has committed durably.
```

### Required Tests

```text
Application restart

Browser refresh

Android process death

Device restart where supported

Low-storage failure
```

---

## `NEX-LOCAL-ATOMIC-001` — Entity and Queue Atomicity

### Requirement

```text
A local financial mutation and its synchronization operation record must commit atomically.
```

### Failure Prevention

Avoid:

```text
Entity saved without queue

Queue created without entity

Success displayed before both commit
```

---

## `NEX-LOCAL-MIG-001` — Resumable Local Migration

### Requirement

```text
Local-schema migration must expose progress and resume safely after interruption.
```

### Required States

```text
not_started

reading_legacy

copying

validating

ready

failed_retryable

recovery_required
```

---

## `NEX-LOCAL-LEGACY-001` — Preserve Legacy Store

### Requirement

```text
Legacy local data must remain read-only and available during the migration validation window.
```

---

## `NEX-LOCAL-SECRET-001` — Secret Separation

### Requirement

```text
Authentication secrets and provider tokens must not be stored in the same uncontrolled financial store or in plaintext local storage.
```

---

## `NEX-LOCAL-CACHE-001` — Cache Is Not Authority

### Requirement

```text
Service Worker caches, rendered UI state and derived Report caches must not become canonical financial storage.
```

---

## `NEX-LOCAL-QUOTA-001` — Explicit Storage Failure

### Requirement

```text
When local storage is unavailable or full, Nexio must not display false Save success.
```

---

## `NEX-LOCAL-TAB-001` — Multi-Tab Coordination

### Requirement

```text
Multiple Web tabs must coordinate owner changes, migrations and canonical writes to prevent duplicate or stale operations.
```

---

## `NEX-LOCAL-PROCESS-001` — Android Process-Death Resilience

### Requirement

```text
Android process termination must not lose committed local financial intent or repeat an unconfirmed command.
```

---

# Offline and Synchronization Requirements Matrix

---

## Synchronization Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-SYNC-OPID-001` | Stable operation identifier | Critical | P0 | Shared | Specified |
| `NEX-SYNC-IDEMPOTENCY-001` | Idempotent remote processing | Critical | P0 | Shared | Specified |
| `NEX-SYNC-QUEUE-001` | Durable operation queue | Critical | P0 | Web, Android | Specified |
| `NEX-SYNC-STATE-001` | Explicit synchronization states | High | P1 | Shared | Specified |
| `NEX-SYNC-RETRY-001` | Bounded classified Retry | Critical | P1 | Shared | Specified |
| `NEX-SYNC-UNKNOWN-001` | Unknown outcome reconciliation | Critical | P0 | Shared | Specified |
| `NEX-SYNC-CONFLICT-001` | Explicit Conflict handling | Critical | P1 | Shared | Specified |
| `NEX-SYNC-CHECKPOINT-001` | Owner-scoped versioned checkpoint | High | P1 | Shared | Specified |
| `NEX-SYNC-FULL-001` | Full resynchronization preserves intent | Critical | P1 | Shared | Specified |
| `NEX-SYNC-ORDER-001` | Dependency ordering | Critical | P1 | Shared | Specified |
| `NEX-SYNC-OWNER-001` | Owner-safe synchronization | Critical | P0 | Shared | Specified |
| `NEX-SYNC-ROLLBACK-001` | Remote rollback recovery | Critical | P1 | Recovery | Specified |
| `NEX-SYNC-STATUS-001` | Truthful user status | High | P1 | UI | Specified |
| `NEX-SYNC-PROTOCOL-001` | Versioned synchronization protocol | High | P1 | Shared | Specified |

---

## `NEX-SYNC-OPID-001` — Stable Operation Identifier

### Requirement

```text
Every mutating financial intent must receive a stable operation identifier before remote processing.
```

### Required Persistence

```text
Local queue

Remote operation ledger

Support diagnostics where safe

Incident and recovery evidence
```

---

## `NEX-SYNC-IDEMPOTENCY-001` — Idempotent Processing

### Requirement

```text
The same owner and operation identifier must produce at most one canonical remote financial effect.
```

### Required Tests

```text
Duplicate network delivery

Timeout and retry

Application restart

Android callback replay

Multiple tab replay

Provider retry
```

---

## `NEX-SYNC-QUEUE-001` — Durable Queue

### Requirement

```text
Pending synchronization operations must survive application restart and must remain bound to the correct owner.
```

---

## `NEX-SYNC-STATE-001` — Explicit States

### Requirement

```text
Every queued operation must have an explicit governed state.
```

Potential states:

```text
queued

processing

completed

failed_retryable

failed_final

authentication_required

conflict

unknown_outcome

dependency_blocked
```

---

## `NEX-SYNC-RETRY-001` — Bounded Classified Retry

### Requirement

```text
Retry must be bounded, preserve operation identity and depend on the classified failure type.
```

### Prohibited

```text
Infinite Retry

New operation ID on Retry

Retry of permanent validation error

Retry after owner change without reauthorization
```

---

## `NEX-SYNC-UNKNOWN-001` — Unknown Outcome

### Requirement

```text
An uncertain remote mutation must enter unknown-outcome reconciliation and must not be recreated as a new command.
```

---

## `NEX-SYNC-CONFLICT-001` — Explicit Conflict Handling

### Requirement

```text
Concurrent incompatible changes must become explicit Conflicts rather than silent last-write-wins financial overwrites.
```

### Required Conflict Data

```text
Entity identity

Owner

Local version

Remote version

Field differences

Resolution state
```

---

## `NEX-SYNC-CHECKPOINT-001` — Owner-Scoped Checkpoint

### Requirement

```text
Synchronization checkpoints must identify owner, stream and protocol version.
```

---

## `NEX-SYNC-FULL-001` — Full Resynchronization

### Requirement

```text
A full resynchronization must preserve valid pending local intent and must not clear the queue as a generic repair.
```

---

## `NEX-SYNC-ORDER-001` — Dependency Ordering

### Requirement

```text
Operations with entity or command dependencies must synchronize in a safe order.
```

Examples:

```text
Create Account before Transaction referencing it.

Create Transaction before Attachment relationship.

Resolve Transfer dependencies as one logical operation.
```

---

## `NEX-SYNC-OWNER-001` — Owner-Safe Synchronization

### Requirement

```text
Synchronization must stop, cancel or isolate all prior-owner requests and state during Account switching.
```

---

## `NEX-SYNC-ROLLBACK-001` — Remote Rollback Recovery

### Requirement

```text
When remote state moves backward, Nexio must preserve newer valid local state and enter governed recovery synchronization.
```

---

## `NEX-SYNC-STATUS-001` — Truthful Status

### Requirement

```text
The UI must distinguish locally saved, remotely synchronized, pending, conflicted and unknown-outcome states.
```

---

## `NEX-SYNC-PROTOCOL-001` — Protocol Version

### Requirement

```text
Synchronization payloads, checkpoints and operations must identify a supported protocol version.
```

---

# Authentication Requirements Matrix

---

## Authentication Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-AUTH-IDENTITY-001` | Provider identity maps to one owner | Critical | P0 | Shared | Specified |
| `NEX-AUTH-SESSION-001` | Session validation | Critical | P0 | Shared | Specified |
| `NEX-AUTH-OWNER-001` | Current owner derived from trusted Authentication | Critical | P0 | Shared | Specified |
| `NEX-AUTH-SWITCH-001` | Transactional Account switching | Critical | P0 | Shared | Specified |
| `NEX-AUTH-SIGNOUT-001` | Sign-out preserves pending data safely | Critical | P1 | Shared | Specified |
| `NEX-AUTH-REAUTH-001` | Recent Authentication for protected actions | High | P1 | Shared | Specified |
| `NEX-AUTH-REVOKE-001` | Session revocation | High | P1 | Shared | Specified |
| `NEX-AUTH-SECRET-001` | Credentials and tokens remain protected | Critical | P0 | Shared | Specified |
| `NEX-AUTH-CALLBACK-001` | Authentication callback integrity | Critical | P1 | Web, Android | Specified |
| `NEX-AUTH-FAIL-001` | Authentication failure preserves local intent | Critical | P1 | Shared | Specified |
| `NEX-AUTH-DELETE-001` | Deleted owner cannot authenticate | Critical | P0 | Shared | Specified |
| `NEX-AUTH-RECOVERY-001` | Recovery does not bypass ownership | Critical | P0 | Shared | Specified |

---

## `NEX-AUTH-IDENTITY-001` — Provider Identity Mapping

### Requirement

```text
Each authenticated provider identity must map unambiguously to the correct Nexio owner.
```

### Required Tests

```text
Email sign-in

OAuth sign-in where present

Account recreation attempt

Provider identity change

Deleted Account

Mismatched Profile
```

---

## `NEX-AUTH-SESSION-001` — Session Validation

### Requirement

```text
Protected Product access and commands must require a valid current Authentication session.
```

---

## `NEX-AUTH-OWNER-001` — Trusted Current Owner

### Requirement

```text
Current owner identity must derive from trusted Authentication context rather than arbitrary client input.
```

---

## `NEX-AUTH-SWITCH-001` — Transactional Account Switching

### Requirement

```text
Changing the active owner must occur as a controlled transaction that closes prior-owner storage, requests, subscriptions, providers and UI state before opening the next owner.
```

### Required Sequence

```text
Block new commands

Pause Sync

Cancel requests

Close subscriptions

Close local store

Clear memory

Reset providers

Validate new owner

Open new store

Start Sync

Render
```

---

## `NEX-AUTH-SIGNOUT-001` — Safe Sign-Out

### Requirement

```text
Sign-out must preserve valid local pending intent while removing access to protected state from the signed-out interface.
```

The Product must define whether pending operations wait for reauthentication.

---

## `NEX-AUTH-REAUTH-001` — Recent Authentication

### Requirement

```text
Protected actions such as complete Export, Account deletion, session revocation and sensitive identity changes must require recent Authentication where defined.
```

---

## `NEX-AUTH-REVOKE-001` — Session Revocation

### Requirement

```text
Nexio must support revocation of active sessions after compromise, password change, Account deletion or approved Security action.
```

---

## `NEX-AUTH-SECRET-001` — Secret Protection

### Requirement

```text
Passwords, MFA codes, reset links, tokens, service-role credentials and signing secrets must never be logged, exposed to UI, stored in ordinary local storage or submitted to AI.
```

---

## `NEX-AUTH-CALLBACK-001` — Callback Integrity

### Requirement

```text
Web and Android Authentication callbacks must validate expected route, state and owner context and must not process the same callback as multiple financial or session actions.
```

---

## `NEX-AUTH-FAIL-001` — Authentication Failure

### Requirement

```text
Authentication expiration or provider failure must not delete local financial data or transform pending operations into duplicates.
```

---

## `NEX-AUTH-DELETE-001` — Deleted Owner Cannot Authenticate

### Requirement

```text
A completed or irreversibly processing Account deletion must prevent ordinary reauthentication and Account reactivation.
```

---

## `NEX-AUTH-RECOVERY-001` — Safe Recovery

### Requirement

```text
Authentication recovery must not bypass owner proof, MFA policy, deletion state or Security restrictions.
```

---

# Owner Isolation Requirements Matrix

Owner isolation spans Authentication, database, local storage, synchronization, providers, UI, Export, Attachments, Support and Recovery.

---

## Owner Isolation Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-SEC-OWNER-001` | Universal owner isolation | Critical | P0 | Shared | Specified |
| `NEX-SEC-OWNER-LOCAL-001` | Local data isolation | Critical | P0 | Web, Android | Specified |
| `NEX-SEC-OWNER-REMOTE-001` | Remote data isolation | Critical | P0 | Backend | Specified |
| `NEX-SEC-OWNER-MEMORY-001` | In-memory state isolation | Critical | P0 | Web, Android | Specified |
| `NEX-SEC-OWNER-SYNC-001` | Queue and checkpoint isolation | Critical | P0 | Sync | Specified |
| `NEX-SEC-OWNER-PROVIDER-001` | Provider identity isolation | Critical | P0 | Providers | Specified |
| `NEX-SEC-OWNER-EXPORT-001` | Export isolation | Critical | P0 | Export | Specified |
| `NEX-SEC-OWNER-ATTACH-001` | Attachment isolation | Critical | P0 | Storage | Specified |
| `NEX-SEC-OWNER-SUPPORT-001` | Support access isolation | Critical | P1 | Support | Specified |
| `NEX-SEC-OWNER-RECOVERY-001` | Recovery isolation | Critical | P0 | Recovery | Specified |
| `NEX-SEC-OWNER-CACHE-001` | Cache isolation | Critical | P1 | Web, Android | Specified |
| `NEX-SEC-OWNER-UI-001` | Previous-owner UI clearing | Critical | P0 | UI | Specified |

---

## `NEX-SEC-OWNER-001` — Universal Owner Isolation

### Requirement

```text
Every Product layer must enforce the same owner boundary.
```

### Child Layers

```text
Authentication

UI

Memory

Local storage

Database

Synchronization

Attachments

Exports

Providers

Support

Recovery
```

---

## `NEX-SEC-OWNER-LOCAL-001` — Local Isolation

### Requirement

```text
Local records must remain inaccessible outside the authenticated owner namespace.
```

---

## `NEX-SEC-OWNER-REMOTE-001` — Remote Isolation

### Requirement

```text
Remote rows, functions, Realtime subscriptions and storage objects must enforce owner authorization.
```

---

## `NEX-SEC-OWNER-MEMORY-001` — In-Memory Isolation

### Requirement

```text
Account switching and Sign-out must clear prior-owner application state, selectors, forms, cached projections and unresolved UI references.
```

---

## `NEX-SEC-OWNER-SYNC-001` — Queue Isolation

### Requirement

```text
Operations, Conflicts and checkpoints must remain owner-bound and must not continue processing after owner context changes without reauthorization.
```

---

## `NEX-SEC-OWNER-PROVIDER-001` — Provider Isolation

### Requirement

```text
Analytics, Notifications, Assistant, Advertising and other provider identities must reset or reinitialize according to the active owner and current preference.
```

---

## `NEX-SEC-OWNER-EXPORT-001` — Export Isolation

### Requirement

```text
An Export job must include only the authorized owner's selected scope.
```

### Required Tests

```text
Owner A cannot export Owner B data.

Account switch during Export does not change scope.

Expired Export remains inaccessible.

Provider delivery receives the same authorized scope.
```

---

## `NEX-SEC-OWNER-ATTACH-001` — Attachment Isolation

### Requirement

```text
Attachment metadata, object storage, signed access and parent relationships must remain bound to the correct owner.
```

---

## `NEX-SEC-OWNER-SUPPORT-001` — Support Isolation

### Requirement

```text
Support tools must use case-bound, role-bound and time-limited access and must not permit unrestricted owner browsing.
```

---

## `NEX-SEC-OWNER-RECOVERY-001` — Recovery Isolation

### Requirement

```text
Owner-level recovery must restore only the authorized owner's validated data and must deny cross-owner contamination.
```

---

## `NEX-SEC-OWNER-CACHE-001` — Cache Isolation

### Requirement

```text
Private responses, financial projections and owner-specific UI fragments must not remain in shared caches after Account switching or Sign-out.
```

---

## `NEX-SEC-OWNER-UI-001` — Previous-Owner UI Clearing

### Requirement

```text
No previous-owner Amount, Account name, Transaction, Goal, Notification or Attachment may remain visible after owner context changes.
```

---

# Initial Cross-Domain Dependency Matrix

| Requirement | Depends On |
|---|---|
| `NEX-ACCOUNT-BALANCE-001` | `NEX-DATA-MONEY-002`, `NEX-TRAN-MONEY-001`, `NEX-TRANSFER-REPORT-001` |
| `NEX-TRAN-IDEMPOTENCY-001` | `NEX-SYNC-OPID-001`, `NEX-DB-OP-001` |
| `NEX-TRANSFER-IDEMPOTENCY-001` | `NEX-SYNC-OPID-001`, `NEX-TRANSFER-INTEGRITY-001`, `NEX-DB-OP-001` |
| `NEX-SYNC-OWNER-001` | `NEX-AUTH-OWNER-001`, `NEX-LOCAL-OWNER-001`, `NEX-SEC-RLS-001` |
| `NEX-AUTH-SWITCH-001` | `NEX-LOCAL-OWNER-001`, `NEX-SYNC-OWNER-001`, `NEX-SEC-OWNER-PROVIDER-001` |
| `NEX-DB-OWNER-001` | `NEX-FND-OWNER-001` |
| `NEX-SEC-RLS-001` | `NEX-DB-OWNER-001` |
| `NEX-SYNC-FULL-001` | `NEX-SYNC-QUEUE-001`, `NEX-SYNC-CHECKPOINT-001`, `NEX-LOCAL-DURABILITY-001` |
| `NEX-TRAN-UNKNOWN-001` | `NEX-SYNC-UNKNOWN-001`, `NEX-DB-OP-001` |
| `NEX-SEC-OWNER-RECOVERY-001` | `NEX-DB-DELETE-001`, `NEX-FND-RECOVERY-001` |

---

# Initial Release-Blocking Requirements

The following requirements should block broad Production release when failed or unverified after the relevant implementation begins:

```text
NEX-FND-TRUST-001

NEX-FND-OWNER-001

NEX-FND-DATA-001

NEX-DATA-MONEY-001

NEX-DATA-MONEY-002

NEX-DATA-CURRENCY-001

NEX-ACCOUNT-OWNER-001

NEX-TRAN-ID-001

NEX-TRAN-OWNER-001

NEX-TRAN-IDEMPOTENCY-001

NEX-TRANSFER-INTEGRITY-001

NEX-TRANSFER-IDEMPOTENCY-001

NEX-DB-OWNER-001

NEX-DB-BACKUP-001

NEX-SEC-RLS-001

NEX-SEC-RLS-TEST-001

NEX-LOCAL-OWNER-001

NEX-LOCAL-DURABILITY-001

NEX-LOCAL-ATOMIC-001

NEX-SYNC-OPID-001

NEX-SYNC-IDEMPOTENCY-001

NEX-SYNC-UNKNOWN-001

NEX-SYNC-OWNER-001

NEX-AUTH-OWNER-001

NEX-AUTH-SWITCH-001

NEX-AUTH-DELETE-001

NEX-SEC-OWNER-001
```

The applicable release gate depends on scope.

---

# Initial Critical Verification Suite

The first Critical traceability baseline should create or map tests for:

```text
Exact Money lifecycle

Explicit Currency lifecycle

Account balance reconciliation

Transaction idempotency

Transfer integrity

Database owner isolation

Local owner isolation

Account switching

Offline durable Save

Unknown outcome

Full resynchronization

Deleted-owner reauthentication denial

Backup restore owner isolation
```

---

# Initial Implementation Inspection Map

The first repository inspection should examine:

```text
app.js

js/core/finance.js

js/core/transactions.js

js/core/storage.js

js/core/reports.js

js/core/profiles.js

js/core/goals.js

js/ui/shared-ui.js

js/ui/desktop.js

js/ui/tablet.js

js/ui/mobile.js

supabase-schema.sql

supabase-config.js

mobile-capacitor.js

capacitor.config.ts

android-web/

android/

capacitor-overrides/
```

For each file, record:

```text
Active in Web

Active in Android

Reads canonical state

Writes canonical state

Calculates financial values

Calls provider directly

Uses owner identity

Uses local persistence

Uses operation identity

Has tests
```

---

# Initial Traceability Gaps to Open

Unless evidence already exists after repository inspection, create gaps for:

```text
Missing canonical Money implementation

Missing explicit Currency field

Missing ordered database migrations

Missing automated RLS tests

Missing local schema version

Missing owner-scoped local namespace

Missing operation ledger

Missing unknown-outcome reconciliation

Missing Transfer integrity tests

Missing Account-switch isolation tests

Missing migration reconciliation

Missing Android process-death tests

Missing operational duplicate monitoring
```

Do not open a gap as a confirmed defect before inspection.

Use wording such as:

```text
Evidence not yet identified.
```

---

# Example Detailed Matrix Records

## Exact Money

| Field | Value |
|---|---|
| Requirement ID | `NEX-DATA-MONEY-001` |
| Source | `docs/06-DATA-MODEL.md` |
| Risk | Critical |
| Priority | P0 |
| Owner | Domain Owner |
| Platforms | Shared, Web, Android, Backend |
| Implementation | To verify |
| Migration | Discovery required |
| Automated test | To create or verify |
| Release evidence | Not available |
| Operational evidence | Not available |
| Gap | Exact persisted representation not yet proven |
| Status | Specified |

---

## Stable Operation Identity

| Field | Value |
|---|---|
| Requirement ID | `NEX-SYNC-OPID-001` |
| Source | `docs/08-OFFLINE-AND-SYNC.md` |
| Risk | Critical |
| Priority | P0 |
| Owner | Synchronization Owner |
| Platforms | Web, Android, Backend |
| Implementation | To verify |
| Migration | May require legacy operation conversion |
| Automated test | Duplicate delivery and timeout Retry required |
| Release evidence | Not available |
| Operational evidence | Duplicate-operation monitor required |
| Gap | Stable operation identity not yet proven |
| Status | Specified |

---

## Owner Isolation

| Field | Value |
|---|---|
| Requirement ID | `NEX-SEC-OWNER-001` |
| Source | `docs/07-SECURITY.md` |
| Risk | Critical |
| Priority | P0 |
| Owner | Security Owner |
| Platforms | All |
| Implementation | To verify |
| Migration | Owner backfill may be required |
| Automated test | Cross-owner suite required |
| Release evidence | Not available |
| Operational evidence | Security alert required |
| Gap | End-to-end owner isolation not yet proven |
| Status | Specified |

---

# Part 2 Matrix Review Questions

Before changing a Foundation requirement, answer:

```text
Which child requirements depend on it?

Does the change weaken Product trust?

Does it change a release gate?

Does it change evidence requirements?

Does it require migration?
```

---

# Money Review Questions

```text
Which persisted representation exists?

Does arithmetic use exact values?

Does Import preserve separators and signs?

Does Export preserve canonical Amount and Currency?

Does migration reconcile totals by Currency?

Does any UI calculate with floating point?
```

---

# Currency Review Questions

```text
Where is Currency stored?

Can an Account exist without Currency?

Is Currency inferred from locale or symbol?

Can Account Currency change after Transactions exist?

Are multi-Currency Reports separated?

Does Import require explicit Currency?
```

---

# Account Review Questions

```text
How is Account identity generated?

How is owner relationship enforced?

How is balance derived?

What happens when an Account is archived?

What happens to linked Transfers and Goals?

Does versioning support Conflict detection?
```

---

# Transaction Review Questions

```text
Which path creates a Transaction?

Does more than one writer exist?

When is the Transaction ID assigned?

When is the operation ID assigned?

How are Amount, Currency and Date stored?

How are stale updates detected?

How is deletion synchronized?

How are duplicates classified?
```

---

# Transfer Review Questions

```text
Is a Transfer one Domain entity?

How are both Account effects linked?

Can one side commit without the other?

How does Retry avoid duplication?

How does deletion affect both sides?

How do Reports prevent double counting?
```

---

# Database Review Questions

```text
Does ordered migration history exist?

Which protected tables lack owner relationships?

Which rows have ambiguous ownership?

Which constraints exist?

Which indexes support owner-scoped queries?

Does an operation ledger exist?

How is deletion authority preserved?
```

---

# RLS Review Questions

```text
Is RLS enabled on every protected table?

Can Owner A Select Owner B data?

Can Owner A Insert for Owner B?

Can Owner A change row ownership?

Can Owner A delete Owner B data?

Do RPC functions reauthorize?

Can the client access service-role credentials?
```

---

# Local Storage Review Questions

```text
Which storage technology is canonical?

Is the local schema versioned?

How is owner isolation implemented?

When does UI report Save success?

Are entity and queue commits atomic?

Can migration resume?

What happens when storage quota is exhausted?
```

---

# Synchronization Review Questions

```text
When is operation identity created?

Can Retry create a new identity?

Does the backend deduplicate operations?

How are unknown outcomes reconciled?

How are Conflicts represented?

How are checkpoints scoped?

Can full Sync erase pending intent?

What happens during Account switching?
```

---

# Authentication Review Questions

```text
How does provider identity map to owner?

How is current owner established?

How are sessions validated?

How does Sign-out treat pending local data?

Which actions require recent Authentication?

How are sessions revoked?

Can a deleted owner authenticate?
```

---

# Owner Isolation Review Questions

```text
Can prior-owner data remain in memory?

Can prior-owner records remain visible?

Can prior-owner queue operations continue?

Can provider identity remain active?

Can Export change scope after Account switch?

Can recovery restore another owner's data?

Can Support browse unrelated owners?
```

---

# Part 2 Anti-Patterns

The following are prohibited:

## Money Evidence by Formatter

Claiming exact Money because the UI displays `R$ 1.250,00`.

## Currency by Locale

Assuming every Brazilian user Account uses BRL.

## Balance as Stored Truth

Treating an editable cached balance as canonical without reconciliation.

## Transaction ID after Remote Success

Waiting for the provider to assign identity after an uncertain request.

## Two Independent Transfer Transactions

Representing a Transfer as unrelated Expense and Income records.

## RLS by Authentication Alone

Assuming valid Sign-in automatically prevents cross-owner database access.

## Owner Field without Policy

Adding `owner_id` without enforcing authorization.

## Local Isolation by Hidden UI

Keeping prior-owner data loaded but removing it visually.

## Queue Clear as Recovery

Deleting pending operations to make synchronization appear healthy.

## Retry with New Operation ID

Converting an uncertain outcome into a duplicate risk.

## Sign-Out by Data Deletion

Removing valid local pending records during ordinary Sign-out.

## Store File Name as Evidence

Assuming `storage.js` implements safe durable owner-scoped storage.

## Test Name as Evidence

Accepting a test without executing it or confirming its assertion.

## Partial Platform Completion Hidden

Marking a shared requirement complete after Web passes but Android remains unverified.

---

# Part 2 Acceptance Criteria

The first detailed traceability matrices are accepted only when:

```text
□ Foundation requirements have stable identifiers.

□ Foundation trust requirements map to child controls.

□ Financial trust is treated as Critical.

□ Owner isolation is treated as Critical.

□ Existing-data preservation is treated as Critical.

□ Truthful local and remote state is traceable.

□ Critical recovery has a requirement identity.

□ AI autonomy restrictions have a requirement identity.

□ Architecture requirements define Domain independence.

□ Canonical Application commands are required.

□ Repository interfaces are required.

□ Provider Adapters are required.

□ UI financial authority is prohibited.

□ One canonical writer is required.

□ Canonical error categories are required.

□ Environment validation is traceable.

□ Shared Domain across platforms is required.

□ Compatibility expiration is traceable.

□ Controlled bootstrap is traceable.

□ Exact Money persistence has a Critical requirement.

□ Exact Money arithmetic has a Critical requirement.

□ Money serialization is locale-independent.

□ Money display is locale-aware.

□ pt-BR examples use the correct BRL format.

□ Import preserves Money exactly.

□ Export preserves Money exactly.

□ Overflow handling is required.

□ Symbol-only Currency interpretation is prohibited.

□ Derived totals preserve exactness.

□ Money migrations reconcile by Currency.

□ Every Money value has explicit Currency.

□ Currency codes are validated.

□ Account Currency changes cannot reinterpret history silently.

□ Implicit conversion is prohibited.

□ Minor-unit behavior is traceable.

□ Multi-Currency totals remain separated.

□ Account identity is stable.

□ Accounts are owner-bound.

□ Accounts have explicit Currency.

□ Balance is derived from canonical records.

□ Archive preserves history.

□ Account deletion has a governed lifecycle.

□ Duplicate Account handling is governed.

□ Account versioning supports Conflicts.

□ Transaction identity is stable.

□ Transactions are owner-bound.

□ Transaction mutations use canonical commands.

□ Transaction Amount and Currency are exact.

□ Transaction Date retains Calendar Date semantics.

□ Account and Category relationships are validated.

□ Transaction updates are version-aware.

□ Transaction deletion has explicit state.

□ Transaction commands are idempotent.

□ Unknown Transaction outcomes are reconciled.

□ Potential duplicates are investigated before deletion.

□ Transfer identity is stable.

□ Transfers are one logical Domain action.

□ Both Transfer effects remain atomic or reconcilable.

□ Transfer Accounts are valid and distinct.

□ Transfer Currency behavior is explicit.

□ Transfer Retry is idempotent.

□ Transfer deletion or reversal preserves both sides.

□ Reports prevent Transfer double counting.

□ Incomplete Transfer repair is governed.

□ Database migration history is ordered.

□ Protected rows have explicit owner relationships.

□ Database Domain constraints are required.

□ Referential integrity is traceable.

□ Query indexes are traceable.

□ Entity version support is traceable.

□ A remote operation ledger is required.

□ Deletion authority is preserved.

□ Backfills are deterministic.

□ Database migrations reconcile state.

□ High-risk migrations require verified backups.

□ Corrective migrations are planned when rollback is unsafe.

□ RLS is required on protected tables.

□ Select, Insert, Update and Delete denial are separately traceable.

□ Storage object isolation is traceable.

□ RPC authorization is traceable.

□ Service-role access is bounded.

□ Automated RLS tests are required.

□ RLS remains active during migrations.

□ Local schema versioning is required.

□ Local owner namespaces are required.

□ Confirmed local Save must be durable.

□ Local entity and queue changes are atomic.

□ Local migrations are resumable.

□ Legacy storage remains during validation.

□ Secrets remain separate from financial storage.

□ Caches are not canonical authority.

□ Storage failure cannot produce false success.

□ Multi-tab coordination is traceable.

□ Android process-death resilience is traceable.

□ Stable operation identity is required.

□ Remote operation processing is idempotent.

□ The synchronization queue is durable.

□ Synchronization states are explicit.

□ Retry is bounded and classified.

□ Unknown outcomes are reconciled.

□ Conflicts are explicit.

□ Checkpoints are owner- and protocol-scoped.

□ Full resynchronization preserves pending intent.

□ Operation dependencies are ordered.

□ Synchronization is owner-safe.

□ Remote rollback recovery is defined.

□ User-visible synchronization status is truthful.

□ The synchronization protocol is versioned.

□ Authentication identity maps to one owner.

□ Sessions are validated.

□ Current owner comes from trusted Authentication.

□ Account switching is transactional.

□ Sign-out preserves valid pending data.

□ Protected actions can require recent Authentication.

□ Session revocation is traceable.

□ Authentication secrets remain protected.

□ Authentication callbacks are validated.

□ Authentication failure preserves local intent.

□ Deleted owners cannot authenticate.

□ Authentication recovery does not bypass ownership.

□ Owner isolation covers local, remote, memory, synchronization and providers.

□ Export isolation is traceable.

□ Attachment isolation is traceable.

□ Support access isolation is traceable.

□ Recovery isolation is traceable.

□ Cache isolation is traceable.

□ Previous-owner UI state is cleared.

□ Cross-domain dependencies are recorded.

□ Initial release-blocking requirements are identified.

□ The Critical verification suite is defined.

□ Repository inspection areas are listed.

□ Missing evidence is recorded as a gap rather than guessed.

□ Part 2 anti-patterns are prohibited.
```

---

# Part 2 Traceability Constitutional Rule

Every Money value, Currency, Account, Transaction, Transfer, database row, local record, synchronization operation and authenticated owner context must answer:

```text
Which stable requirement authorizes this behavior, which owner and financial invariants apply, which implementation is authoritative, which migration preserves existing state and which executed test proves the complete lifecycle?
```

When the answer is uncertain, prefer the action that:

- Marks the requirement as unverified.
- Inspects the active write path.
- Preserves exact Money.
- Requires explicit Currency.
- Quarantines ambiguous ownership.
- Keeps one canonical writer.
- Preserves operation identity.
- Stops Retry.
- Preserves local data.
- Executes cross-owner tests.
- Rehearses migration.
- Blocks release.

A financial or owner requirement is not complete because its happy path appears correct.

It is complete only when exact value, identity, ownership, persistence, synchronization, failure, migration and recovery behavior are all traceable to executed evidence.

---
---

# Remaining Domain Traceability Matrices

This section completes the first official Nexio Requirements Traceability Matrix baseline.

It covers:

```text
Design System

Desktop

Tablet

Mobile Web

Android

Accessibility

Performance and Reliability

Testing

Deployment and Operations

Internationalization and Content

Privacy and Data Governance

Account Deletion

Backup and Recovery

APIs and Integrations

Analytics and Experimentation

Assistant and AI

Advertising and Monetization

Support and User Operations

Compliance and Store Readiness

Engineering Governance

Implementation Roadmap
```

Implementation and evidence references must still be verified against the active repository.

The requirement identifiers in this section establish the intended traceability structure.

They do not claim that the corresponding implementation already exists.

---

# Design System Requirements Matrix

---

## Design System Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-DS-TOKEN-001` | One authoritative token system | High | P1 | All UI | Specified |
| `NEX-DS-COLOR-001` | Semantic color roles | High | P1 | All UI | Specified |
| `NEX-DS-THEME-001` | Consistent light and dark themes | High | P1 | All UI | Specified |
| `NEX-DS-TYPE-001` | Responsive typography | Moderate | P2 | All UI | Specified |
| `NEX-DS-SPACE-001` | Consistent spacing scale | Moderate | P2 | All UI | Specified |
| `NEX-DS-COMP-001` | Shared component authority | High | P1 | All UI | Specified |
| `NEX-DS-FORM-001` | Shared financial form behavior | Critical | P1 | All UI | Specified |
| `NEX-DS-STATE-001` | Complete component states | High | P1 | All UI | Specified |
| `NEX-DS-FOCUS-001` | Visible accessible focus | High | P1 | All UI | Specified |
| `NEX-DS-MOTION-001` | Reduced-motion compatibility | Moderate | P2 | All UI | Specified |
| `NEX-DS-PRIVACY-001` | Privacy masking before sensitive paint | Critical | P1 | All UI | Specified |
| `NEX-DS-LEGACY-001` | Controlled legacy-style removal | Moderate | P2 | Migration | Specified |

---

## `NEX-DS-TOKEN-001` — Authoritative Token System

### Requirement

```text
Nexio must use one authoritative runtime token system for colors, typography, spacing, radius, elevation, motion, focus and responsive behavior.
```

### Current Areas to Inspect

```text
styles.css

nexio-v2.css

css/mobile.css

css/tablet.css

docs/design-system/tokens.css
```

### Required Evidence

```text
Runtime token file

Token documentation

CSS load order

Visual regression evidence

Legacy-token removal plan
```

---

## `NEX-DS-COLOR-001` — Semantic Color Roles

### Requirement

```text
Interface colors must be assigned through semantic roles rather than feature-specific hardcoded values.
```

### Expected Roles

```text
surface

surface_elevated

text_primary

text_secondary

border

focus

success

warning

error

pending

offline

conflict

privacy_mask
```

---

## `NEX-DS-THEME-001` — Theme Consistency

### Requirement

```text
Light, dark and system themes must preserve contrast, hierarchy, component meaning and financial-state visibility.
```

### Required Tests

```text
Dashboard cards

Transaction list

Dialogs

Forms

Charts

Disabled controls

Errors

Pending states

Privacy masking

Android system-bar integration
```

---

## `NEX-DS-TYPE-001` — Responsive Typography

### Requirement

```text
Typography must remain readable, scalable and semantically consistent across Desktop, Tablet, Mobile Web and Android.
```

---

## `NEX-DS-SPACE-001` — Spacing Scale

### Requirement

```text
Component spacing must use an approved shared scale and must not depend on uncontrolled screen-specific values.
```

---

## `NEX-DS-COMP-001` — Shared Component Authority

### Requirement

```text
Critical controls must use shared components rather than independent platform implementations with divergent behavior.
```

### Critical Components

```text
Button

Icon Button

Text Input

Amount Input

Currency Select

Date Input

Account Select

Category Select

Dialog

Bottom Sheet

Toast

Banner

Empty State

Error State

Sync Status

Privacy Mask
```

---

## `NEX-DS-FORM-001` — Shared Financial Form Behavior

### Requirement

```text
Transaction, Transfer, Goal and Account forms must use shared validation, Money, Currency, Date, submission and unknown-outcome behavior.
```

### Required Tests

```text
BRL Amount such as R$ 1.250,00

Invalid Amount

Missing Currency

Invalid Account

Submission pending

Offline Save

Remote timeout

Repeated submission prevention
```

---

## `NEX-DS-STATE-001` — Complete Component States

### Requirement

```text
Every interactive component must define default, hover where applicable, focus, active, disabled, loading, error and success states.
```

---

## `NEX-DS-FOCUS-001` — Visible Focus

### Requirement

```text
Keyboard focus must remain visible and must not rely only on color differences that are difficult to perceive.
```

---

## `NEX-DS-MOTION-001` — Reduced Motion

### Requirement

```text
Nonessential animation must reduce or stop when the user requests reduced motion.
```

---

## `NEX-DS-PRIVACY-001` — Privacy Masking

### Requirement

```text
When Privacy mode is active, sensitive financial values must be masked before the first visible sensitive paint.
```

### Required Tests

```text
Cold startup

Route change

Account switch

Theme change

Android resume

Notification deep link
```

---

## `NEX-DS-LEGACY-001` — Legacy Style Removal

### Requirement

```text
Every migrated legacy stylesheet or selector must have a documented removal condition and must not remain a permanent second design authority.
```

---

# Desktop Requirements Matrix

---

## Desktop Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-DESK-SHELL-001` | Stable Desktop application shell | High | P2 | Desktop | Specified |
| `NEX-DESK-NAV-001` | Keyboard-accessible navigation | High | P1 | Desktop | Specified |
| `NEX-DESK-DASH-001` | Accurate Dashboard summaries | Critical | P1 | Desktop | Specified |
| `NEX-DESK-TRAN-001` | Productive Transaction management | High | P2 | Desktop | Specified |
| `NEX-DESK-REPORT-001` | Deterministic Report interface | High | P2 | Desktop | Specified |
| `NEX-DESK-FILTER-001` | Explicit filter scope | High | P2 | Desktop | Specified |
| `NEX-DESK-DENSITY-001` | Readable information density | Moderate | P2 | Desktop | Specified |
| `NEX-DESK-STATE-001` | Complete loading and failure states | High | P1 | Desktop | Specified |
| `NEX-DESK-PRIVACY-001` | Desktop Privacy mode | High | P1 | Desktop | Specified |
| `NEX-DESK-PARITY-001` | Desktop Domain parity | Critical | P1 | Desktop | Specified |

---

## `NEX-DESK-SHELL-001` — Desktop Shell

### Requirement

```text
The Desktop interface must provide stable navigation, a main content landmark, route-state preservation and responsive collapse behavior.
```

---

## `NEX-DESK-NAV-001` — Keyboard Navigation

### Requirement

```text
All Desktop navigation and critical financial workflows must be operable by keyboard without requiring pointer interaction.
```

---

## `NEX-DESK-DASH-001` — Accurate Dashboard

### Requirement

```text
Desktop Dashboard values must come from canonical deterministic services and must expose Currency, scope, date range and synchronization limitations.
```

---

## `NEX-DESK-TRAN-001` — Transaction Management

### Requirement

```text
Desktop Transaction lists must support safe search, filtering, sorting, editing and deletion or reversal without bypassing canonical commands.
```

---

## `NEX-DESK-REPORT-001` — Report Interface

### Requirement

```text
Desktop Reports must display deterministic calculations and must not reinterpret financial values independently.
```

---

## `NEX-DESK-FILTER-001` — Filter Scope

### Requirement

```text
Account, Currency, Category and period filters must remain visible or readily discoverable and must be included in Export scope.
```

---

## `NEX-DESK-STATE-001` — Desktop States

### Requirement

```text
Desktop screens must distinguish empty, loading, partial, offline, pending, conflicted, error and recovery states.
```

---

## `NEX-DESK-PARITY-001` — Desktop Domain Parity

### Requirement

```text
Desktop must use the same canonical Money, Transaction, Transfer, Report and synchronization behavior as every other platform.
```

---

# Tablet Requirements Matrix

---

## Tablet Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-TAB-ADAPT-001` | True adaptive Tablet layout | High | P2 | Tablet | Specified |
| `NEX-TAB-NAV-001` | Adaptive Tablet navigation | Moderate | P2 | Tablet | Specified |
| `NEX-TAB-SPLIT-001` | Safe split-view behavior | High | P2 | Tablet | Specified |
| `NEX-TAB-ROTATE-001` | State preservation during rotation | Critical | P1 | Tablet, Android | Specified |
| `NEX-TAB-TOUCH-001` | Touch-target compliance | High | P1 | Tablet | Specified |
| `NEX-TAB-DENSITY-001` | Balanced density | Moderate | P2 | Tablet | Specified |
| `NEX-TAB-REPORT-001` | Tablet Report readability | High | P2 | Tablet | Specified |
| `NEX-TAB-PARITY-001` | Tablet Domain parity | Critical | P1 | Tablet | Specified |

---

## `NEX-TAB-ADAPT-001` — Adaptive Layout

### Requirement

```text
Tablet must use an adaptive layout designed for intermediate screen sizes rather than a stretched Mobile interface or reduced Desktop interface.
```

---

## `NEX-TAB-SPLIT-001` — Split View

### Requirement

```text
When list-and-detail split view is used, the selected record, owner context and pending form state must remain synchronized and owner-safe.
```

---

## `NEX-TAB-ROTATE-001` — Rotation Preservation

### Requirement

```text
Device rotation must not duplicate commands, lose committed local state, switch owners or bypass confirmation.
```

### Required Test Journeys

```text
Transaction form

Transfer confirmation

Conflict review

Export generation

Account deletion confirmation
```

---

## `NEX-TAB-PARITY-001` — Tablet Domain Parity

### Requirement

```text
Tablet must not implement separate financial calculations or persistence behavior.
```

---

# Mobile Web Requirements Matrix

---

## Mobile Web Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-MOB-NAV-001` | Compact Mobile navigation | High | P2 | Mobile Web | Specified |
| `NEX-MOB-ACTION-001` | Safe primary quick action | High | P2 | Mobile Web | Specified |
| `NEX-MOB-FORM-001` | Mobile financial forms | Critical | P1 | Mobile Web | Specified |
| `NEX-MOB-SHEET-001` | Accessible Sheet behavior | High | P1 | Mobile Web | Specified |
| `NEX-MOB-BACK-001` | Safe browser Back behavior | High | P1 | Mobile Web | Specified |
| `NEX-MOB-FOLD-001` | Foldable and compact-pane support | Moderate | P2 | Mobile Web | Specified |
| `NEX-MOB-REFLOW-001` | Large-text and narrow-width reflow | High | P1 | Mobile Web | Specified |
| `NEX-MOB-OFFLINE-001` | Visible Mobile offline state | High | P1 | Mobile Web | Specified |
| `NEX-MOB-PARITY-001` | Mobile Domain parity | Critical | P1 | Mobile Web | Specified |

---

## `NEX-MOB-FORM-001` — Mobile Financial Forms

### Requirement

```text
Mobile Transaction and Transfer forms must preserve exact Money, explicit Currency, accessible validation and idempotent submission behavior.
```

---

## `NEX-MOB-SHEET-001` — Accessible Sheet

### Requirement

```text
Mobile Sheets must trap focus appropriately, expose an accessible name, support Back or close behavior and restore focus after dismissal.
```

---

## `NEX-MOB-BACK-001` — Browser Back Safety

### Requirement

```text
Browser Back must not confirm financial actions, repeat submissions or discard committed local intent silently.
```

---

## `NEX-MOB-FOLD-001` — Foldable Support

### Requirement

```text
Mobile layouts must remain usable in narrow foldable panes and expanded foldable layouts without duplicate navigation or clipped financial values.
```

---

# Android Requirements Matrix

---

## Android Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-ANDROID-BUILD-001` | Reproducible Android build | Critical | P0 | Android | Specified |
| `NEX-ANDROID-ASSET-001` | One authoritative Web asset source | Critical | P1 | Android | Specified |
| `NEX-ANDROID-SIGN-001` | Protected signing identity | Critical | P0 | Android | Specified |
| `NEX-ANDROID-VERSION-001` | Unique version code | High | P1 | Android | Specified |
| `NEX-ANDROID-LIFECYCLE-001` | Lifecycle resilience | Critical | P1 | Android | Specified |
| `NEX-ANDROID-PROCESS-001` | Process-death safety | Critical | P0 | Android | Specified |
| `NEX-ANDROID-BACK-001` | Safe native Back behavior | High | P1 | Android | Specified |
| `NEX-ANDROID-FILE-001` | Scoped file access | High | P1 | Android | Specified |
| `NEX-ANDROID-NOTIFY-001` | Contextual Notification permission | High | P1 | Android | Specified |
| `NEX-ANDROID-DEEPLINK-001` | Authorized deep links | Critical | P1 | Android | Specified |
| `NEX-ANDROID-SECSTORE-001` | Safe secure-storage behavior | Critical | P1 | Android | Specified |
| `NEX-ANDROID-MANIFEST-001` | Final manifest review | Critical | P0 | Android | Specified |
| `NEX-ANDROID-AAB-001` | Verified Production AAB | Critical | P0 | Android | Specified |
| `NEX-ANDROID-ROLLOUT-001` | Controlled Google Play rollout | High | P1 | Android | Specified |

---

## `NEX-ANDROID-BUILD-001` — Reproducible Build

### Requirement

```text
A clean repository checkout must produce the intended Android artifact through documented commands without undocumented manual file replacement.
```

### Current Areas to Inspect

```text
capacitor.config.ts

CAPACITOR_ANDROID_BUILD.md

android/

android-web/

mobile-capacitor.js

capacitor-overrides/
```

---

## `NEX-ANDROID-ASSET-001` — Authoritative Web Assets

### Requirement

```text
Android must consume one authoritative generated Web artifact rather than an independently maintained divergent application copy.
```

---

## `NEX-ANDROID-SIGN-001` — Signing Identity

### Requirement

```text
Android signing credentials and upload-certificate relationships must remain protected, recoverable and excluded from source control.
```

---

## `NEX-ANDROID-LIFECYCLE-001` — Lifecycle Resilience

### Requirement

```text
Backgrounding, foregrounding, configuration change, deep-link launch and Activity recreation must preserve valid application state.
```

---

## `NEX-ANDROID-PROCESS-001` — Process-Death Safety

### Requirement

```text
Android process death must not lose committed local financial intent, repeat unknown operations or bypass owner reauthorization.
```

---

## `NEX-ANDROID-BACK-001` — Native Back Safety

### Requirement

```text
Android Back must close the most local transient layer first and must not confirm destructive or financial actions.
```

---

## `NEX-ANDROID-FILE-001` — Scoped File Access

### Requirement

```text
Android Imports and Attachments must prefer system-scoped file selection and must not request broad storage access without a separately approved necessity.
```

---

## `NEX-ANDROID-NOTIFY-001` — Notification Permission

### Requirement

```text
Notification permission must be requested in context and refusal must not block unrelated financial functionality.
```

---

## `NEX-ANDROID-DEEPLINK-001` — Deep-Link Authorization

### Requirement

```text
Every Android deep link must revalidate Authentication, owner scope, entity existence and current authorization.
```

---

## `NEX-ANDROID-SECSTORE-001` — Secure Storage

### Requirement

```text
Secure storage may contain approved session or secret material but must not become the canonical financial database.
```

---

## `NEX-ANDROID-MANIFEST-001` — Final Manifest Review

### Requirement

```text
The final merged Production manifest must be reviewed for permissions, exported components, providers, receivers, services, deep links, backup behavior and cleartext configuration.
```

---

## `NEX-ANDROID-AAB-001` — Verified AAB

### Requirement

```text
Every Production AAB must be verified for package name, version, signing, environment, permissions, SDKs and absence of test configuration.
```

---

# Accessibility Requirements Matrix

---

## Accessibility Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-A11Y-SEMANTIC-001` | Semantic interface structure | High | P1 | All UI | Specified |
| `NEX-A11Y-KEYBOARD-001` | Full keyboard operation | Critical | P1 | Web, Desktop | Specified |
| `NEX-A11Y-FOCUS-001` | Deterministic focus management | High | P1 | All UI | Specified |
| `NEX-A11Y-NAME-001` | Accessible names and descriptions | High | P1 | All UI | Specified |
| `NEX-A11Y-ERROR-001` | Accessible validation and errors | Critical | P1 | All UI | Specified |
| `NEX-A11Y-CONTRAST-001` | Sufficient contrast | High | P1 | All UI | Specified |
| `NEX-A11Y-TEXT-001` | Large-text support | Critical | P1 | All UI | Specified |
| `NEX-A11Y-REFLOW-001` | Narrow-width reflow | High | P1 | Web, Android | Specified |
| `NEX-A11Y-TOUCH-001` | Adequate touch targets | High | P1 | Mobile, Tablet, Android | Specified |
| `NEX-A11Y-MOTION-001` | Reduced-motion support | Moderate | P2 | All UI | Specified |
| `NEX-A11Y-CHART-001` | Text alternative for charts | High | P2 | Reports | Specified |
| `NEX-A11Y-STATUS-001` | Accessible asynchronous status | High | P1 | All UI | Specified |
| `NEX-A11Y-PUBLIC-001` | Accessible policy and deletion pages | Critical | P1 | Public Site | Specified |
| `NEX-A11Y-SUPPORT-001` | Accessible Support channel | Critical | P1 | Support | Specified |

---

## `NEX-A11Y-SEMANTIC-001` — Semantic Structure

### Requirement

```text
Pages and screens must use meaningful landmarks, headings, labels, controls and reading order.
```

---

## `NEX-A11Y-KEYBOARD-001` — Keyboard Operation

### Requirement

```text
Every critical Web workflow must be operable using only a keyboard.
```

### Critical Journeys

```text
Sign-in

Create Transaction

Create Transfer

Edit and delete

Resolve Conflict

Export

Privacy settings

Account deletion

Support
```

---

## `NEX-A11Y-FOCUS-001` — Focus Management

### Requirement

```text
Focus must move predictably after navigation, validation, Dialog opening, Dialog closing, deletion and asynchronous error.
```

---

## `NEX-A11Y-ERROR-001` — Accessible Errors

### Requirement

```text
Validation and system errors must identify the affected field or action and must not rely only on color.
```

---

## `NEX-A11Y-TEXT-001` — Large Text

### Requirement

```text
Critical journeys must remain usable with large text and operating-system font scaling.
```

---

## `NEX-A11Y-CHART-001` — Chart Alternatives

### Requirement

```text
Every financial chart must provide an accessible textual or tabular representation of the same meaningful data.
```

---

## `NEX-A11Y-STATUS-001` — Asynchronous Status

### Requirement

```text
Save, synchronization, Export, deletion and provider-status changes must be announced accessibly without excessive interruption.
```

---

## `NEX-A11Y-PUBLIC-001` — Public Pages

### Requirement

```text
Privacy Policy, Account deletion and Support pages must remain usable without Authentication through keyboard, screen reader, zoom and mobile reflow.
```

---

# Performance and Reliability Requirements Matrix

---

## Performance Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-PERF-BUDGET-001` | Performance budgets | High | P2 | Web, Android | Specified |
| `NEX-PERF-START-001` | Bounded startup | High | P2 | Web, Android | Specified |
| `NEX-PERF-LIST-001` | Bounded Transaction-list rendering | Moderate | P2 | All UI | Specified |
| `NEX-PERF-REPORT-001` | Bounded Report calculation | High | P2 | Shared | Specified |
| `NEX-PERF-SYNC-001` | Bounded synchronization batches | High | P1 | Shared | Specified |
| `NEX-PERF-MEM-001` | Memory and subscription cleanup | High | P2 | Web, Android | Specified |
| `NEX-PERF-CACHE-001` | Governed caching | High | P1 | Shared | Specified |
| `NEX-REL-ERROR-001` | Safe error boundaries | High | P1 | Shared | Specified |
| `NEX-REL-DEGRADE-001` | Graceful provider degradation | High | P1 | Shared | Specified |
| `NEX-REL-CIRCUIT-001` | Bounded failure amplification | High | P1 | Providers | Specified |
| `NEX-REL-SLO-001` | Defined service objectives | Moderate | P2 | Operations | Specified |
| `NEX-REL-ALERT-001` | Actionable reliability alerts | High | P1 | Operations | Specified |

---

## `NEX-PERF-BUDGET-001` — Performance Budgets

### Requirement

```text
Critical Web and Android journeys must have measurable performance budgets enforced through testing or release review.
```

---

## `NEX-PERF-REPORT-001` — Report Performance

### Requirement

```text
Report calculations must remain deterministic and bounded for the supported data volume.
```

---

## `NEX-PERF-SYNC-001` — Synchronization Batches

### Requirement

```text
Synchronization must use bounded batches, pagination or equivalent controls and must not block the application indefinitely.
```

---

## `NEX-PERF-MEM-001` — Cleanup

### Requirement

```text
Account switching, navigation and Android lifecycle changes must release obsolete subscriptions, listeners, timers and owner-specific memory.
```

---

## `NEX-REL-DEGRADE-001` — Graceful Degradation

### Requirement

```text
Failure of Analytics, Advertising, Notifications or Assistant must not prevent core financial workflows.
```

---

# Testing Requirements Matrix

---

## Testing Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-TEST-UNIT-001` | Domain unit tests | Critical | P1 | Shared | Specified |
| `NEX-TEST-GOLDEN-001` | Financial golden dataset | Critical | P0 | Shared | Specified |
| `NEX-TEST-INTEGRATION-001` | Persistence integration tests | Critical | P1 | Shared | Specified |
| `NEX-TEST-RLS-001` | Automated owner-isolation tests | Critical | P0 | Backend | Specified |
| `NEX-TEST-SYNC-001` | Synchronization failure tests | Critical | P0 | Shared | Specified |
| `NEX-TEST-MIG-001` | Migration rehearsal | Critical | P1 | Migration | Specified |
| `NEX-TEST-A11Y-001` | Accessibility test suite | High | P1 | All UI | Specified |
| `NEX-TEST-ANDROID-001` | Android lifecycle tests | Critical | P1 | Android | Specified |
| `NEX-TEST-E2E-001` | Critical journey end-to-end tests | High | P1 | Web, Android | Specified |
| `NEX-TEST-FAILURE-001` | Failure injection | Critical | P1 | Shared | Specified |
| `NEX-TEST-PRIV-001` | Privacy lifecycle tests | Critical | P1 | Shared | Specified |
| `NEX-TEST-RECOVERY-001` | Recovery exercises | Critical | P1 | Operations | Specified |
| `NEX-TEST-HONESTY-001` | Honest test-result reporting | Critical | P0 | Governance | Specified |

---

## `NEX-TEST-UNIT-001` — Domain Unit Tests

### Requirement

```text
Money, Currency, Transaction, Transfer, Account, Goal and Report Domain behavior must have deterministic unit tests.
```

---

## `NEX-TEST-GOLDEN-001` — Financial Golden Dataset

### Requirement

```text
Nexio must maintain a stable synthetic dataset that verifies balances, Transfers, Reports and multi-Currency separation.
```

### Example BRL Records

```text
Income: R$ 3.420,15

Expense: R$ 1.250,00

Expense: R$ 84,90

Expected BRL balance: R$ 2.085,25
```

No unrelated Currency should be added to the BRL total.

---

## `NEX-TEST-SYNC-001` — Synchronization Failure Tests

### Requirement

```text
Synchronization verification must include timeout, duplicate delivery, provider outage, Account switch, process interruption and unknown-outcome recovery.
```

---

## `NEX-TEST-MIG-001` — Migration Rehearsal

### Requirement

```text
High-risk database and local migrations must be rehearsed using representative synthetic data before Production execution.
```

---

## `NEX-TEST-HONESTY-001` — Test Honesty

### Requirement

```text
Documentation, Pull Requests and AI agents must distinguish tests written, executed, passed, failed, skipped and blocked.
```

---

# Deployment and Operations Requirements Matrix

---

## Operations Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-OPS-ENV-001` | Environment separation | Critical | P1 | Operations | Specified |
| `NEX-OPS-BUILD-001` | Artifact traceability | Critical | P1 | Web, Android | Specified |
| `NEX-OPS-CI-001` | Required CI gates | High | P1 | Engineering | Specified |
| `NEX-OPS-RELEASE-001` | Governed release record | High | P1 | Operations | Specified |
| `NEX-OPS-FLAG-001` | Feature Flag registry | High | P1 | Shared | Specified |
| `NEX-OPS-ROLLOUT-001` | Controlled rollout | High | P1 | Production | Specified |
| `NEX-OPS-ROLLBACK-001` | Rollback or recovery plan | Critical | P1 | Production | Specified |
| `NEX-OPS-MONITOR-001` | Critical monitoring | Critical | P1 | Production | Specified |
| `NEX-OPS-ALERT-001` | Actionable alerts | High | P1 | Production | Specified |
| `NEX-OPS-RUNBOOK-001` | Current runbooks | High | P1 | Operations | Specified |
| `NEX-OPS-INCIDENT-001` | Incident command | Critical | P1 | Operations | Specified |
| `NEX-OPS-SECRET-001` | Secret management | Critical | P0 | Operations | Specified |
| `NEX-OPS-STATUS-001` | Accurate service status | High | P2 | Public, Support | Specified |

---

## `NEX-OPS-ENV-001` — Environment Separation

### Requirement

```text
Development, testing, staging and Production configuration, credentials and data must remain explicitly separated.
```

---

## `NEX-OPS-BUILD-001` — Artifact Traceability

### Requirement

```text
Every deployed Web release and Android artifact must map to a source revision, configuration, schema version and release record.
```

---

## `NEX-OPS-FLAG-001` — Feature Flag Registry

### Requirement

```text
Every Feature Flag must have an owner, purpose, default, rollout, monitoring, expiration and removal plan.
```

---

## `NEX-OPS-ROLLBACK-001` — Rollback or Recovery

### Requirement

```text
Every material release must define whether it supports rollback, forward correction, restore or capability disablement.
```

---

## `NEX-OPS-MONITOR-001` — Critical Monitoring

### Requirement

```text
Production monitoring must cover Authentication, financial commands, synchronization, owner isolation signals, deletion, Android stability and critical providers.
```

---

# Internationalization and Content Requirements Matrix

---

## Content Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-CONTENT-I18N-001` | Centralized localized content | High | P2 | All UI | Specified |
| `NEX-CONTENT-LOCALE-001` | Locale-aware display | High | P1 | All UI | Specified |
| `NEX-CONTENT-DATE-001` | Calendar Date consistency | High | P1 | All UI | Specified |
| `NEX-CONTENT-MONEY-001` | Currency-aware financial language | Critical | P1 | All UI | Specified |
| `NEX-CONTENT-ERROR-001` | Actionable error language | High | P1 | All UI | Specified |
| `NEX-CONTENT-STATE-001` | Distinct state terminology | High | P1 | All UI | Specified |
| `NEX-CONTENT-LEGAL-001` | Material translation equivalence | Critical | P1 | Public Site | Specified |
| `NEX-CONTENT-A11Y-001` | Accessible and understandable content | High | P1 | All UI | Specified |
| `NEX-CONTENT-NOCLAIM-001` | No unsupported financial claims | Critical | P0 | Public Content | Specified |

---

## `NEX-CONTENT-LOCALE-001` — Locale-Aware Display

### Requirement

```text
Dates, numbers and Money must render according to the active locale without altering canonical persisted values.
```

For `pt-BR`, an example BRL value is:

```text
R$ 1.250,00
```

---

## `NEX-CONTENT-STATE-001` — State Terminology

### Requirement

```text
Saved locally, pending, synchronized, conflicted, failed and deleted states must use distinct consistent terminology.
```

---

## `NEX-CONTENT-LEGAL-001` — Translation Equivalence

### Requirement

```text
Translated Privacy, Terms, deletion and user-choice content must preserve equivalent material rights, limitations and obligations.
```

---

# Privacy and Data Governance Requirements Matrix

---

## Privacy Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-PRIV-INVENTORY-001` | Data Processing Inventory | Critical | P1 | Shared | Specified |
| `NEX-PRIV-PURPOSE-001` | Purpose limitation | Critical | P1 | Shared | Specified |
| `NEX-PRIV-MIN-001` | Data minimization | Critical | P1 | Shared | Specified |
| `NEX-PRIV-CHOICE-001` | Valid optional choice | Critical | P1 | Shared | Specified |
| `NEX-PRIV-WITHDRAW-001` | Effective withdrawal | Critical | P1 | Shared | Specified |
| `NEX-PRIV-RETENTION-001` | Retention registry | Critical | P1 | Shared | Specified |
| `NEX-PRIV-EXPORT-001` | Owner-safe data Export | Critical | P1 | Shared | Specified |
| `NEX-PRIV-CORRECT-001` | Auditable correction | High | P2 | Shared | Specified |
| `NEX-PRIV-PROVIDER-001` | Provider processing governance | Critical | P1 | Providers | Specified |
| `NEX-PRIV-AI-001` | AI data minimization | Critical | P1 | AI | Specified |
| `NEX-PRIV-SUPPORT-001` | Support evidence minimization | High | P1 | Support | Specified |
| `NEX-PRIV-AUDIT-001` | Privacy audit evidence | High | P1 | Operations | Specified |

---

## `NEX-PRIV-INVENTORY-001` — Data Processing Inventory

### Requirement

```text
Every collected, stored, derived, transmitted, logged, exported and deleted data category must appear in the governed Data Processing Inventory.
```

---

## `NEX-PRIV-CHOICE-001` — Optional Choice

### Requirement

```text
Optional processing must use clear, specific, accessible and recorded user control where required.
```

---

## `NEX-PRIV-WITHDRAW-001` — Withdrawal

### Requirement

```text
Withdrawal must stop future optional processing, clear or revalidate optional queues and reset provider identity where required.
```

### Required Tests

```text
Online withdrawal

Offline withdrawal

Restart

Account switch

Android reinstall

Provider outage
```

---

## `NEX-PRIV-EXPORT-001` — Owner-Safe Export

### Requirement

```text
Data Export must verify owner, preserve scope, expose explicit Currency and use protected temporary delivery.
```

---

# Account Deletion Requirements Matrix

---

## Account Deletion Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-PRIV-DELETE-001` | Public deletion entry path | Critical | P0 | Public, Product | Specified |
| `NEX-PRIV-DELETE-002` | Recent Authentication | Critical | P1 | Shared | Specified |
| `NEX-PRIV-DELETE-003` | Explicit deletion state machine | Critical | P1 | Shared | Specified |
| `NEX-PRIV-DELETE-004` | Session revocation | Critical | P1 | Authentication | Specified |
| `NEX-PRIV-DELETE-005` | Product-data deletion | Critical | P1 | Backend | Specified |
| `NEX-PRIV-DELETE-006` | Attachment deletion | Critical | P1 | Storage | Specified |
| `NEX-PRIV-DELETE-007` | Provider cleanup | Critical | P1 | Providers | Specified |
| `NEX-PRIV-DELETE-008` | Optional identity cleanup | Critical | P1 | Analytics, Ads, AI | Specified |
| `NEX-PRIV-DELETE-009` | Backup deletion authority | Critical | P0 | Recovery | Specified |
| `NEX-PRIV-DELETE-010` | No silent reactivation | Critical | P0 | Shared | Specified |
| `NEX-PRIV-DELETE-011` | Accurate completion status | Critical | P1 | Product, Support | Specified |
| `NEX-PRIV-DELETE-012` | Original request date preservation | High | P1 | Operations | Specified |
| `NEX-PRIV-DELETE-013` | Subscription distinction | High | P2 | Monetization | Specified |
| `NEX-PRIV-DELETE-014` | Deletion evidence ledger | Critical | P1 | Backend | Specified |

---

## `NEX-PRIV-DELETE-001` — Public Entry Path

### Requirement

```text
Users must be able to understand and start Account deletion through a public accessible path that does not require application installation.
```

### Current Candidate

```text
excluir-conta.html
```

---

## `NEX-PRIV-DELETE-003` — State Machine

### Requirement

```text
Account deletion must progress through explicit states and must not be represented as complete while required cleanup remains pending.
```

Potential states:

```text
confirmation_required

requested

access_restricted

processing_application_data

processing_attachments

processing_providers

backup_retention

completed

failed_retryable

legal_hold
```

---

## `NEX-PRIV-DELETE-009` — Backup Authority

### Requirement

```text
Backup restore must reapply active deletion authority and must not reactivate a deleted owner.
```

---

## `NEX-PRIV-DELETE-011` — Accurate Completion

### Requirement

```text
User and Support communication must distinguish processing, provider cleanup, backup retention and completed deletion.
```

---

# Backup and Recovery Requirements Matrix

---

## Recovery Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-REC-BACKUP-001` | Automated protected backups | Critical | P1 | Operations | Specified |
| `NEX-REC-CATALOG-001` | Backup catalog and integrity | High | P1 | Operations | Specified |
| `NEX-REC-RESTORE-001` | Tested restore procedure | Critical | P0 | Operations | Specified |
| `NEX-REC-OWNER-001` | Owner-isolated recovery | Critical | P0 | Recovery | Specified |
| `NEX-REC-FIN-001` | Financial reconciliation after restore | Critical | P0 | Recovery | Specified |
| `NEX-REC-DELETE-001` | Deletion reconciliation | Critical | P0 | Recovery | Specified |
| `NEX-REC-LOCAL-001` | Local corruption recovery | Critical | P1 | Web, Android | Specified |
| `NEX-REC-SYNC-001` | Queue and synchronization recovery | Critical | P1 | Shared | Specified |
| `NEX-REC-ATTACH-001` | Attachment recovery | High | P1 | Storage | Specified |
| `NEX-REC-RPO-001` | Defined recovery-point objective | High | P2 | Operations | Specified |
| `NEX-REC-RTO-001` | Defined recovery-time objective | High | P2 | Operations | Specified |
| `NEX-REC-EXERCISE-001` | Periodic recovery exercises | Critical | P1 | Operations | Specified |

---

## `NEX-REC-RESTORE-001` — Tested Restore

### Requirement

```text
A backup is not considered recoverable until a controlled restore has completed and the restored state has been validated.
```

---

## `NEX-REC-OWNER-001` — Owner-Isolated Recovery

### Requirement

```text
Owner-level recovery must restore only the intended owner's authorized data and must not contaminate another owner namespace.
```

---

## `NEX-REC-FIN-001` — Financial Reconciliation

### Requirement

```text
Every financial restore must reconcile Accounts, Transactions, Transfers, Currency totals, deletion state and pending operations.
```

---

## `NEX-REC-DELETE-001` — Deletion Reconciliation

### Requirement

```text
Recovery must preserve and reapply deletion ledgers before restored data becomes active.
```

---

# API and Integration Requirements Matrix

---

## Integration Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-INT-ADAPTER-001` | Provider Adapter boundary | High | P1 | Shared | Specified |
| `NEX-INT-AUTH-001` | Provider authentication protection | Critical | P1 | Providers | Specified |
| `NEX-INT-DATA-001` | Minimal provider payload | Critical | P1 | Providers | Specified |
| `NEX-INT-ERROR-001` | Canonical provider errors | High | P1 | Shared | Specified |
| `NEX-INT-TIMEOUT-001` | Explicit timeout handling | High | P1 | Providers | Specified |
| `NEX-INT-IDEMP-001` | Idempotent provider mutation | Critical | P1 | Providers | Specified |
| `NEX-INT-WEBHOOK-001` | Verified webhook processing | Critical | P1 | Backend | Specified |
| `NEX-INT-REVOKE-001` | Provider disconnection and revocation | Critical | P1 | Providers | Specified |
| `NEX-INT-EXIT-001` | Provider exit plan | High | P2 | Operations | Specified |
| `NEX-INT-INVENTORY-001` | Provider Registry | High | P1 | Governance | Specified |
| `NEX-INT-REGION-001` | Provider regional behavior | High | P2 | Compliance | Specified |
| `NEX-INT-DELETE-001` | Provider deletion behavior | Critical | P1 | Privacy | Specified |

---

## `NEX-INT-ADAPTER-001` — Adapter Boundary

### Requirement

```text
Provider-specific SDKs, payloads and response types must remain outside canonical Domain and UI contracts.
```

---

## `NEX-INT-DATA-001` — Minimal Payload

### Requirement

```text
Provider requests must contain only the minimum approved data required for the active capability.
```

---

## `NEX-INT-WEBHOOK-001` — Webhook Verification

### Requirement

```text
Inbound provider webhooks must verify authenticity, replay protection, scope and operation identity before processing.
```

---

## `NEX-INT-REVOKE-001` — Disconnection

### Requirement

```text
Provider disconnection must revoke tokens, remove subscriptions or webhooks, stop future processing and record completion.
```

---

# Analytics and Experimentation Requirements Matrix

---

## Analytics Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-AN-REGISTRY-001` | Allowlisted event registry | Critical | P1 | Analytics | Specified |
| `NEX-AN-MIN-001` | No raw financial payload | Critical | P0 | Analytics | Specified |
| `NEX-AN-CHOICE-001` | Optional initialization gate | Critical | P1 | Analytics | Specified |
| `NEX-AN-WITHDRAW-001` | Effective Analytics withdrawal | Critical | P1 | Analytics | Specified |
| `NEX-AN-IDENTITY-001` | Owner-safe identity lifecycle | Critical | P1 | Analytics | Specified |
| `NEX-AN-AUTOCAPTURE-001` | Controlled automatic capture | Critical | P1 | Analytics | Specified |
| `NEX-AN-RETENTION-001` | Analytics retention | High | P1 | Analytics | Specified |
| `NEX-AN-DELETE-001` | Analytics identity deletion | High | P1 | Privacy | Specified |
| `NEX-AN-EXPERIMENT-001` | Governed experiment assignment | High | P2 | Product | Specified |
| `NEX-AN-GUARDRAIL-001` | Financial and safety guardrails | Critical | P1 | Experimentation | Specified |
| `NEX-AN-NOGAMING-001` | Metrics must not distort safe behavior | High | P1 | Governance | Specified |
| `NEX-AN-FAIL-001` | Analytics failure is nonblocking | High | P1 | Shared | Specified |

---

## `NEX-AN-REGISTRY-001` — Event Registry

### Requirement

```text
Every Analytics event and field must be defined in an approved allowlisted registry before collection.
```

---

## `NEX-AN-MIN-001` — No Raw Financial Payload

### Requirement

```text
Product Analytics must not include exact balances, exact Transaction Amounts, Transaction descriptions, Account names, Goal names or Attachment contents.
```

---

## `NEX-AN-CHOICE-001` — Initialization Gate

### Requirement

```text
Optional Analytics SDKs must not initialize or create an identity before the approved user-choice gate.
```

---

## `NEX-AN-AUTOCAPTURE-001` — Auto-Capture Control

### Requirement

```text
Automatic screen, form, session-replay or text capture must remain disabled unless a separately reviewed safe subset is explicitly approved.
```

---

## `NEX-AN-GUARDRAIL-001` — Experiment Guardrails

### Requirement

```text
Experiments must not weaken financial correctness, owner isolation, Privacy, Accessibility, deletion, Security or Support access.
```

---

# Assistant and AI Requirements Matrix

---

## Assistant Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-AI-OPTIONAL-001` | Assistant is optional | High | P2 | AI | Specified |
| `NEX-AI-CONTEXT-001` | Owner-scoped minimized context | Critical | P1 | AI | Specified |
| `NEX-AI-DETERMINISTIC-001` | Deterministic financial totals | Critical | P1 | AI | Specified |
| `NEX-AI-SCHEMA-001` | Structured output validation | Critical | P1 | AI | Specified |
| `NEX-AI-PROPOSAL-001` | Reviewable expiring proposals | Critical | P1 | AI | Specified |
| `NEX-AI-CONFIRM-001` | Mandatory user confirmation | Critical | P0 | AI | Specified |
| `NEX-AI-COMMAND-001` | Canonical command execution | Critical | P1 | AI | Specified |
| `NEX-AI-HISTORY-001` | Owner-scoped history preference | High | P1 | AI | Specified |
| `NEX-AI-MANUAL-001` | Manual alternative | High | P1 | Product | Specified |
| `NEX-AI-PROVIDER-001` | Governed AI provider | Critical | P1 | Provider | Specified |
| `NEX-AI-PROMPT-001` | Prompt-injection resistance | Critical | P1 | AI | Specified |
| `NEX-AI-ADVICE-001` | No unsupported professional authority | Critical | P0 | AI, Content | Specified |
| `NEX-AI-FAIL-001` | Provider failure cannot mutate data | Critical | P0 | AI | Specified |
| `NEX-AI-AUDIT-001` | AI action traceability | High | P1 | AI | Specified |

---

## `NEX-AI-OPTIONAL-001` — Optional Assistant

### Requirement

```text
Core financial workflows must remain available without the Assistant.
```

---

## `NEX-AI-CONTEXT-001` — Context Minimization

### Requirement

```text
Assistant context must be owner-scoped, capability-scoped and limited to approved projections or records necessary for the user's request.
```

---

## `NEX-AI-DETERMINISTIC-001` — Deterministic Totals

### Requirement

```text
Financial totals shown or explained by the Assistant must originate from deterministic Nexio services rather than model arithmetic.
```

---

## `NEX-AI-PROPOSAL-001` — Proposals

### Requirement

```text
Assistant financial suggestions must become structured, reviewable, owner-bound and expiring proposals before any command is possible.
```

---

## `NEX-AI-CONFIRM-001` — Confirmation

### Requirement

```text
No Assistant proposal may alter financial state without explicit user confirmation through an accessible canonical confirmation interface.
```

---

## `NEX-AI-PROMPT-001` — Prompt Injection

### Requirement

```text
User text, imported files, Attachments and provider content must remain untrusted and must not alter AI tool authority or system policy.
```

---

## `NEX-AI-ADVICE-001` — Professional Boundary

### Requirement

```text
Assistant output must not be represented as guaranteed investment, tax, legal, accounting or regulated financial advice.
```

---

# Advertising and Monetization Requirements Matrix

---

## Advertising Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-ADS-ADAPTER-001` | Advertising Adapter | High | P2 | Advertising | Specified |
| `NEX-ADS-PLACEMENT-001` | Registered placements | High | P2 | UI | Specified |
| `NEX-ADS-SEPARATION-001` | Clear sponsored separation | Critical | P1 | UI | Specified |
| `NEX-ADS-FIN-001` | No financial context in ad requests | Critical | P0 | Advertising | Specified |
| `NEX-ADS-PROTECTED-001` | No ads in protected workflows | Critical | P0 | UI | Specified |
| `NEX-ADS-CHOICE-001` | Personalization choice | Critical | P1 | Advertising | Specified |
| `NEX-ADS-WITHDRAW-001` | Personalization withdrawal | Critical | P1 | Advertising | Specified |
| `NEX-ADS-IDENTITY-001` | Owner-safe ad identity | High | P1 | Advertising | Specified |
| `NEX-ADS-DELETE-001` | Advertising deletion handling | High | P1 | Privacy | Specified |
| `NEX-ADS-KILL-001` | Independent kill switch | Critical | P1 | Operations | Specified |
| `NEX-ADS-FAIL-001` | Core Product works without ads | Critical | P0 | Shared | Specified |
| `NEX-ADS-AUTHFILE-001` | Publisher authorization resource | High | P1 | Public Site | Specified |
| `NEX-SUB-PRICE-001` | Accurate subscription pricing | Critical | P1 | Monetization | Specified |
| `NEX-SUB-ENTITLE-001` | Verified entitlement | Critical | P1 | Monetization | Specified |
| `NEX-SUB-DELETE-001` | Subscription and deletion distinction | High | P1 | Monetization | Specified |

---

## `NEX-ADS-SEPARATION-001` — Sponsored Separation

### Requirement

```text
Advertising must remain clearly distinguishable from Nexio financial content, recommendations, Reports, Notifications, Support and Assistant output.
```

---

## `NEX-ADS-FIN-001` — No Financial Context

### Requirement

```text
Advertising requests must not include exact balances, Transaction Amounts, descriptions, Account names, Goal names, Assistant prompts or Support-case content.
```

---

## `NEX-ADS-PROTECTED-001` — Protected Workflows

### Requirement

```text
Advertising must not appear in or obstruct Authentication, Transaction confirmation, Transfer confirmation, Conflict resolution, Privacy settings, Account deletion, Recovery or Support.
```

---

## `NEX-ADS-KILL-001` — Kill Switch

### Requirement

```text
Nexio must be able to stop Advertising requests and safely collapse placements independently of core Product releases.
```

---

## `NEX-ADS-AUTHFILE-001` — Publisher Authorization

### Requirement

```text
When required, the public publisher-authorization resource must remain accessible through the approved HTTPS domain and contain the correct current provider entry.
```

---

## `NEX-SUB-PRICE-001` — Subscription Pricing

### Requirement

```text
Subscription price, Currency, billing period, trial and renewal language must match the active store configuration.
```

---

## `NEX-SUB-ENTITLE-001` — Entitlement Verification

### Requirement

```text
Paid entitlement must not rely solely on client-side state and must use the approved store or server verification model.
```

---

# Support and User Operations Requirements Matrix

---

## Support Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-SUP-CHANNEL-001` | Accessible Support channels | High | P1 | Support | Specified |
| `NEX-SUP-CASE-001` | Stable Support case identity | High | P1 | Support | Specified |
| `NEX-SUP-OWNER-001` | One active case owner | High | P1 | Support | Specified |
| `NEX-SUP-SEVERITY-001` | Risk-based severity | Critical | P1 | Support | Specified |
| `NEX-SUP-IDENTITY-001` | Proportional identity verification | Critical | P1 | Support | Specified |
| `NEX-SUP-NOSECRET-001` | Support never requests secrets | Critical | P0 | Support | Specified |
| `NEX-SUP-DIAG-001` | Minimized diagnostics | Critical | P1 | Support | Specified |
| `NEX-SUP-NODESTRUCT-001` | Non-destructive troubleshooting | Critical | P0 | Support | Specified |
| `NEX-SUP-UNKNOWN-001` | No blind retry of unknown operations | Critical | P0 | Support | Specified |
| `NEX-SUP-ACTION-001` | Audited assisted actions | Critical | P1 | Support | Specified |
| `NEX-SUP-ESCALATE-001` | Correct escalation | High | P1 | Support | Specified |
| `NEX-SUP-ACCESS-001` | Case-bound Support access | Critical | P1 | Support | Specified |
| `NEX-SUP-RETENTION-001` | Support evidence retention | High | P1 | Support | Specified |
| `NEX-SUP-AI-001` | Bounded AI assistance | Critical | P1 | Support AI | Specified |
| `NEX-SUP-QUALITY-001` | Support quality review | High | P2 | Support | Specified |

---

## `NEX-SUP-NOSECRET-001` — No Secret Requests

### Requirement

```text
Support must never request passwords, MFA codes, recovery codes, session tokens, private keys or signing credentials.
```

---

## `NEX-SUP-DIAG-001` — Minimized Diagnostics

### Requirement

```text
Default Support diagnostics must exclude balances, exact Amounts, Transaction descriptions, Authentication secrets and complete financial exports.
```

---

## `NEX-SUP-NODESTRUCT-001` — Non-Destructive Troubleshooting

### Requirement

```text
Support must not recommend clearing application data, deleting local storage, reinstalling or resetting synchronization before evaluating pending local financial intent.
```

---

## `NEX-SUP-UNKNOWN-001` — Unknown Operations

### Requirement

```text
Support must not instruct a user to repeat an uncertain Transaction or Transfer before operation reconciliation.
```

---

## `NEX-SUP-ACTION-001` — Assisted Actions

### Requirement

```text
Every assisted Production action must be case-bound, owner-bound, approved, audited and idempotent where applicable.
```

---

# Compliance and Store Readiness Requirements Matrix

---

## Compliance Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-COMP-POLICY-001` | Public policy matches behavior | Critical | P0 | Public, Product | Specified |
| `NEX-COMP-CLAIM-001` | Evidence-backed Product claims | Critical | P1 | Public Content | Specified |
| `NEX-COMP-FINBOUND-001` | Financial-service boundary | Critical | P0 | Public Content | Specified |
| `NEX-COMP-STORE-001` | Store listing accuracy | Critical | P1 | Google Play | Specified |
| `NEX-COMP-DATA-001` | Accurate store data declarations | Critical | P0 | Google Play | Specified |
| `NEX-COMP-DELETE-001` | Functional deletion URL | Critical | P0 | Public Site, Store | Specified |
| `NEX-COMP-PERM-001` | Permission Registry alignment | Critical | P0 | Android | Specified |
| `NEX-COMP-SDK-001` | SDK Registry alignment | Critical | P1 | Shared | Specified |
| `NEX-COMP-AUDIENCE-001` | Accurate intended audience | High | P1 | Product, Store | Specified |
| `NEX-COMP-ADS-001` | Accurate Advertising declaration | Critical | P1 | Store | Specified |
| `NEX-COMP-AI-001` | Accurate AI disclosure | High | P1 | Store, Public | Specified |
| `NEX-COMP-LICENSE-001` | Dependency and asset licensing | High | P1 | Distribution | Specified |
| `NEX-COMP-REGION-001` | Regional readiness | High | P2 | Distribution | Specified |
| `NEX-COMP-EVIDENCE-001` | Reproducible compliance evidence | High | P1 | Governance | Specified |
| `NEX-COMP-DRIFT-001` | Compliance drift detection | Critical | P1 | Operations | Specified |

---

## `NEX-COMP-POLICY-001` — Policy Accuracy

### Requirement

```text
Privacy Policy, Terms, deletion instructions and public disclosures must describe the current Product and provider behavior accurately.
```

### Current Candidates

```text
politica-de-privacidade.html

excluir-conta.html

PLAY_STORE_LISTING.md
```

---

## `NEX-COMP-FINBOUND-001` — Financial Boundary

### Requirement

```text
Nexio must not imply that it is a bank, payment institution, credit provider, investment provider or guaranteed professional financial adviser unless formally authorized and implemented.
```

---

## `NEX-COMP-DATA-001` — Store Data Declarations

### Requirement

```text
Application-store data declarations must map to current SDKs, permissions, providers, logs, Analytics, Advertising, Assistant and Support data flows.
```

---

## `NEX-COMP-PERM-001` — Permission Alignment

### Requirement

```text
Every permission present in the final Android artifact must have an approved Product purpose, Registry entry, user explanation and store-declaration mapping.
```

---

## `NEX-COMP-LICENSE-001` — Licensing

### Requirement

```text
Every distributed dependency, native library, font, icon, image and other asset must have known compatible usage rights.
```

---

## `NEX-COMP-DRIFT-001` — Drift Detection

### Requirement

```text
Nexio must detect and correct material differences among implementation, public policies, store declarations, permissions, SDKs and providers.
```

---

# Engineering Governance Requirements Matrix

---

## Governance Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-GOV-CHANGE-001` | Governed material changes | High | P1 | Engineering | Specified |
| `NEX-GOV-ADR-001` | Architecture Decision Records | Moderate | P2 | Engineering | Specified |
| `NEX-GOV-REVIEW-001` | Risk-based review | High | P1 | Engineering | Specified |
| `NEX-GOV-MIG-001` | Migration change governance | Critical | P1 | Engineering | Specified |
| `NEX-GOV-FLAG-001` | Feature Flag lifecycle | High | P1 | Engineering | Specified |
| `NEX-GOV-EXCEPTION-001` | Expiring exceptions | High | P1 | Governance | Specified |
| `NEX-GOV-DEPRECATE-001` | Governed deprecation | High | P2 | Engineering | Specified |
| `NEX-GOV-EMERGENCY-001` | Emergency change review | Critical | P1 | Operations | Specified |
| `NEX-GOV-AI-001` | Bounded AI engineering authority | Critical | P1 | AI Engineering | Specified |
| `NEX-GOV-DOC-001` | Documentation synchronized with behavior | High | P1 | Documentation | Specified |

---

## `NEX-GOV-CHANGE-001` — Material Change Governance

### Requirement

```text
Changes affecting financial meaning, persistent data, owner isolation, providers, permissions, Privacy, Accessibility or release behavior must use the approved change process.
```

---

## `NEX-GOV-EXCEPTION-001` — Exceptions

### Requirement

```text
Every exception must have an owner, risk, compensating control, expiration and permanent resolution plan.
```

---

## `NEX-GOV-AI-001` — AI Engineering Authority

### Requirement

```text
AI coding agents must operate within bounded tasks and must not invent repository state, schemas, APIs, test results or release evidence.
```

---

# Roadmap Requirements Matrix

---

## Roadmap Requirement Summary

| Requirement ID | Title | Risk | Priority | Scope | Initial Status |
|---|---|---|---|---|---|
| `NEX-ROAD-DISCOVERY-001` | Discovery before broad migration | Critical | P0 | Program | Specified |
| `NEX-ROAD-INCREMENT-001` | Incremental migration | Critical | P1 | Program | Specified |
| `NEX-ROAD-DATA-001` | Existing-data preservation | Critical | P0 | Program | Specified |
| `NEX-ROAD-WRITER-001` | One canonical writer during migration | Critical | P0 | Program | Specified |
| `NEX-ROAD-DEPEND-001` | Explicit dependencies | High | P1 | Program | Specified |
| `NEX-ROAD-GATE-001` | Phase entry and exit gates | High | P1 | Program | Specified |
| `NEX-ROAD-RISK-001` | Central risk register | High | P1 | Program | Specified |
| `NEX-ROAD-BLOCK-001` | Visible blocker management | Moderate | P2 | Program | Specified |
| `NEX-ROAD-REHEARSE-001` | High-risk migration rehearsal | Critical | P1 | Program | Specified |
| `NEX-ROAD-RECON-001` | Financial migration reconciliation | Critical | P0 | Program | Specified |
| `NEX-ROAD-CLEAN-001` | Temporary architecture removal | High | P1 | Program | Specified |
| `NEX-ROAD-AI-001` | AI milestone contracts | High | P1 | Program | Specified |

---

# Cross-Domain Dependency Matrix

| Requirement | Depends On |
|---|---|
| `NEX-DS-FORM-001` | `NEX-DATA-MONEY-001`, `NEX-DATA-CURRENCY-001`, `NEX-ARCH-COMMAND-001` |
| `NEX-DESK-DASH-001` | `NEX-ACCOUNT-BALANCE-001`, `NEX-DATA-CURRENCY-006`, `NEX-SYNC-STATUS-001` |
| `NEX-TAB-ROTATE-001` | `NEX-LOCAL-DURABILITY-001`, `NEX-SYNC-OPID-001` |
| `NEX-MOB-FORM-001` | `NEX-DS-FORM-001`, `NEX-TRAN-COMMAND-001` |
| `NEX-ANDROID-PROCESS-001` | `NEX-LOCAL-DURABILITY-001`, `NEX-SYNC-IDEMPOTENCY-001` |
| `NEX-ANDROID-DEEPLINK-001` | `NEX-AUTH-SESSION-001`, `NEX-SEC-OWNER-001` |
| `NEX-A11Y-ERROR-001` | `NEX-ARCH-ERROR-001`, `NEX-DS-FORM-001` |
| `NEX-PERF-REPORT-001` | `NEX-DATA-MONEY-009`, `NEX-ARCH-UI-001` |
| `NEX-TEST-GOLDEN-001` | `NEX-DATA-MONEY-001`, `NEX-DATA-CURRENCY-006`, `NEX-TRANSFER-REPORT-001` |
| `NEX-OPS-BUILD-001` | `NEX-ANDROID-BUILD-001`, `NEX-ARCH-CONFIG-001` |
| `NEX-PRIV-WITHDRAW-001` | `NEX-INT-ADAPTER-001`, `NEX-AN-CHOICE-001`, `NEX-ADS-CHOICE-001` |
| `NEX-PRIV-DELETE-009` | `NEX-REC-DELETE-001`, `NEX-DB-DELETE-001` |
| `NEX-AI-CONFIRM-001` | `NEX-ARCH-COMMAND-001`, `NEX-SYNC-IDEMPOTENCY-001`, `NEX-DS-FORM-001` |
| `NEX-ADS-PROTECTED-001` | `NEX-DS-COMP-001`, `NEX-COMP-ADS-001` |
| `NEX-SUP-NODESTRUCT-001` | `NEX-LOCAL-DURABILITY-001`, `NEX-SYNC-QUEUE-001` |
| `NEX-COMP-DATA-001` | `NEX-PRIV-INVENTORY-001`, `NEX-INT-INVENTORY-001`, `NEX-COMP-SDK-001` |
| `NEX-ROAD-RECON-001` | `NEX-DB-RECON-001`, `NEX-DATA-MONEY-010` |

---

# Expanded Release-Blocking Requirement Set

The following requirements should block the applicable release when failed:

---

## Financial and Owner Safety

```text
NEX-DATA-MONEY-001

NEX-DATA-MONEY-002

NEX-DATA-CURRENCY-001

NEX-ACCOUNT-OWNER-001

NEX-TRAN-OWNER-001

NEX-TRAN-IDEMPOTENCY-001

NEX-TRANSFER-INTEGRITY-001

NEX-TRANSFER-IDEMPOTENCY-001

NEX-SEC-RLS-001

NEX-LOCAL-OWNER-001

NEX-SYNC-OWNER-001

NEX-AUTH-OWNER-001

NEX-SEC-OWNER-001
```

---

## Data Durability and Recovery

```text
NEX-LOCAL-DURABILITY-001

NEX-LOCAL-ATOMIC-001

NEX-SYNC-UNKNOWN-001

NEX-DB-BACKUP-001

NEX-REC-RESTORE-001

NEX-REC-DELETE-001
```

---

## Android Production

```text
NEX-ANDROID-BUILD-001

NEX-ANDROID-SIGN-001

NEX-ANDROID-PROCESS-001

NEX-ANDROID-MANIFEST-001

NEX-ANDROID-AAB-001
```

---

## Privacy and Deletion

```text
NEX-PRIV-CHOICE-001

NEX-PRIV-WITHDRAW-001

NEX-PRIV-DELETE-001

NEX-PRIV-DELETE-009

NEX-PRIV-DELETE-010

NEX-COMP-DELETE-001
```

---

## Accessibility

```text
NEX-A11Y-KEYBOARD-001

NEX-A11Y-ERROR-001

NEX-A11Y-TEXT-001

NEX-A11Y-PUBLIC-001

NEX-A11Y-SUPPORT-001
```

---

## Providers, AI and Advertising

```text
NEX-AN-MIN-001

NEX-AI-CONFIRM-001

NEX-AI-FAIL-001

NEX-ADS-FIN-001

NEX-ADS-PROTECTED-001

NEX-ADS-FAIL-001
```

---

## Compliance

```text
NEX-COMP-POLICY-001

NEX-COMP-FINBOUND-001

NEX-COMP-DATA-001

NEX-COMP-PERM-001
```

---

# Required Verification Suites by Release Type

---

## Web Production Verification

```text
Financial golden dataset

Owner-isolation tests

Offline Save and restart

Synchronization duplicate prevention

Account-switch isolation

Keyboard and screen-reader critical journeys

Privacy choice and withdrawal

Account deletion

Policy URL availability

Production configuration verification
```

---

## Android Production Verification

```text
All applicable Web shared tests

Android clean install

Android upgrade

Process death

Back behavior

Deep links

Notification permission

File access

Secure-storage invalidation

Final manifest review

AAB identity verification

Google Play policy alignment
```

---

## Database Migration Verification

```text
Backup verification

Migration rehearsal

Owner backfill validation

RLS validation

Financial totals by Currency

Transfer relationship validation

Deletion-state validation

Operation-ledger validation

Corrective migration readiness
```

---

## Assistant Release Verification

```text
Owner-scoped context

Context minimization

Deterministic totals

Structured output validation

Proposal expiration

Mandatory confirmation

Canonical command execution

History preference

Prompt-injection tests

Provider failure
```

---

## Advertising Release Verification

```text
Placement Registry

Protected-workflow absence

Financial-context exclusion

Choice and withdrawal

Owner identity reset

Deletion behavior

Kill switch

Publisher authorization

Store declaration
```

---

# Initial Evidence Mapping Targets

The first repository implementation review should attempt to map:

---

## UI and Design

```text
styles.css

nexio-v2.css

css/mobile.css

css/tablet.css

docs/design-system/tokens.css

js/ui/shared-ui.js

js/ui/desktop.js

js/ui/tablet.js

js/ui/mobile.js
```

---

## Android

```text
capacitor.config.ts

mobile-capacitor.js

android/

android-web/

capacitor-overrides/

CAPACITOR_ANDROID_BUILD.md
```

---

## Privacy and Compliance

```text
politica-de-privacidade.html

excluir-conta.html

PLAY_STORE_LISTING.md

supabase-config.js

package.json

AndroidManifest.xml
```

---

## Operations

```text
package.json

vercel.json

README.md

Build documentation

CI configuration if present

Release records if present
```

---

## Providers

```text
supabase-config.js

package.json

package-lock.json

Android dependencies

Provider initialization code
```

---

# Traceability Gap Baseline for Remaining Domains

Unless implementation evidence is identified, initial gaps should include:

```text
Runtime Design token authority not proven

Shared component authority not proven

Dark-theme contrast not verified

Privacy masking before sensitive paint not verified

Cross-platform Domain parity not verified

Tablet rotation safety not verified

Mobile foldable behavior not verified

Android reproducible asset pipeline not verified

Android process-death safety not verified

Final merged manifest inventory not verified

Accessibility critical-journey coverage not verified

Performance budgets not defined

Financial golden dataset not identified

Migration rehearsal evidence not identified

Production artifact traceability not identified

Feature Flag Registry not identified

Data Processing Inventory not identified

Withdrawal lifecycle not verified

Complete Account deletion not verified

Backup deletion reconciliation not verified

Provider Registry not identified

Analytics event Registry not identified

AI confirmation boundary not verified

Advertising protected-workflow exclusion not verified

Support diagnostic minimization not verified

Store data declarations not mapped to current SDKs

License inventory not identified

Regional readiness not verified
```

Use:

```text
Evidence not yet identified.
```

until repository review establishes the actual state.

---

# Coverage Summary Structure

Recommended generated or maintained views:

---

## Coverage by Domain

| Domain | Requirements | Implemented | Tested | Released | Operationally Verified | Gaps |
|---|---:|---:|---:|---:|---:|---:|
| Design System | To calculate | To verify | To verify | To verify | To verify | To identify |
| Desktop | To calculate | To verify | To verify | To verify | To verify | To identify |
| Tablet | To calculate | To verify | To verify | To verify | To verify | To identify |
| Mobile Web | To calculate | To verify | To verify | To verify | To verify | To identify |
| Android | To calculate | To verify | To verify | To verify | To verify | To identify |
| Accessibility | To calculate | To verify | To verify | To verify | To verify | To identify |
| Privacy | To calculate | To verify | To verify | To verify | To verify | To identify |
| Recovery | To calculate | To verify | To verify | To verify | To verify | To identify |
| Compliance | To calculate | To verify | To verify | To verify | To verify | To identify |

Do not invent totals before the machine-readable Registry exists.

---

## Coverage by Evidence Level

| Evidence Level | Meaning | Current Count |
|---|---|---:|
| E0 | No evidence | To calculate |
| E1 | Specification | To calculate |
| E2 | Implementation | To calculate |
| E3 | Test | To calculate |
| E4 | Release | To calculate |
| E5 | Operational | To calculate |

---

## Coverage by Platform

| Platform | Critical Requirements | Verified | Partial | Missing |
|---|---:|---:|---:|---:|
| Shared | To calculate | To calculate | To calculate | To calculate |
| Web | To calculate | To calculate | To calculate | To calculate |
| Android | To calculate | To calculate | To calculate | To calculate |
| Backend | To calculate | To calculate | To calculate | To calculate |
| Public Site | To calculate | To calculate | To calculate | To calculate |
| Operations | To calculate | To calculate | To calculate | To calculate |

---

# Traceability Implementation Order

The practical creation of the matrix should proceed in this order:

```text
1. Create requirement prefix Registry.

2. Create machine-readable requirement schema.

3. Register Critical Foundation requirements.

4. Register Money and Currency requirements.

5. Register owner-isolation and RLS requirements.

6. Register local-storage and synchronization requirements.

7. Register Account deletion and recovery requirements.

8. Register Android Production requirements.

9. Register Accessibility requirements.

10. Register Compliance and store requirements.

11. Register remaining Product and quality requirements.

12. Inspect active repository implementation.

13. Add implementation references.

14. Map or create tests.

15. Add migration references.

16. Add release references.

17. Add operational evidence.

18. Generate gap and coverage summaries.
```

---

# Recommended Machine-Readable Schema

Potential:

```yaml
requirement_id: string
title: string
statement: string

source:
  document: string
  section: string
  version: string

classification:
  class: string
  risk: string
  priority: string

scope:
  platforms: []
  environments: []

ownership:
  requirement_owner: string
  implementation_owner: string
  verification_owner: string

status:
  current: string
  last_reviewed: string

relationships:
  parents: []
  children: []
  depends_on: []
  blocks: []
  supersedes: []
  superseded_by: []

evidence:
  implementation: []
  migrations: []
  tests: []
  test_runs: []
  releases: []
  monitoring: []
  alerts: []
  runbooks: []
  policies: []
  store_declarations: []
  audits: []

coverage:
  implementation: string
  testing: string
  migration: string
  operations: string
  support: string
  compliance: string

gaps: []
```

---

# Traceability Validation Rules

A future validation tool should reject or report:

```text
Duplicate requirement ID

Unknown prefix

Missing source document

Missing source section

Invalid risk

Invalid priority

Invalid status

Critical requirement without owner

Verified requirement without test evidence

Released requirement without release evidence

Operationally verified requirement without operational evidence

Superseded requirement without replacement

Blocked requirement without blocker

Not-applicable requirement without justification

File reference that does not exist

Test reference that does not exist

Migration reference that does not exist

Policy reference that does not exist

Requirement dependency cycle without approved explanation
```

---

# Pull Request Traceability Contract

Material Pull Requests should include:

```markdown
## Requirements

Implemented:
- NEX-...

Affected:
- NEX-...

Superseded:
- None

## Evidence

Implementation:
- FILE:...

Tests added:
- TEST:...

Tests executed:
- [command and result]

Migrations:
- None

Release impact:
- Web / Android / Backend / None

Remaining gaps:
- GAP-...
```

---

# Release Traceability Contract

Every release record should identify:

```text
Release ID

Source revision

Artifact

Included requirements

Partially covered requirements

Known gaps

Feature Flag states

Database migrations

Local migrations

Provider changes

Policy changes

Store declaration changes

Tests executed

Rollback or recovery plan

Operational monitors
```

---

# Audit Traceability Contract

Every audit should identify:

```text
Audit scope

Requirement IDs

Expected evidence

Evidence inspected

Findings

Affected versions

Corrective actions

Owners

Verification results
```

---

# AI Traceability Contract

AI agents may assist with:

- Requirement extraction
- Duplicate detection
- Initial file-reference suggestions
- Missing-link detection
- Coverage report generation
- Pull Request mapping

AI agents must not independently decide:

- Requirement completion
- Test sufficiency
- Production verification
- Financial correctness
- Legal adequacy
- Store-declaration accuracy
- Not-applicable status

---

# AI Traceability Task Template

```text
You are mapping a bounded set of Nexio requirements.

Requirements:
[REQUIREMENT IDS]

Authoritative documents:
[DOCUMENTS]

Repository files to inspect:
[FILES]

Allowed outputs:
- Verified source mappings
- Verified implementation references
- Existing test references
- Explicit gaps

Forbidden outputs:
- Invented files
- Invented tests
- Invented migrations
- Invented release evidence
- Unsupported completion status

For each requirement, report:
1. Source section.
2. Active implementation reference or “not identified.”
3. Test reference or “not identified.”
4. Migration reference or “not required/not identified.”
5. Release evidence or “not identified.”
6. Current justified status.
7. Remaining gap.
```

---

# Part 3 Anti-Patterns

The following are prohibited:

## Design Token by Documentation Only

Claiming one token system because `tokens.css` exists in `docs/`.

## Responsive Screenshot as Domain Parity

Assuming Desktop and Mobile use the same calculations because they look similar.

## Android Build by Local Memory

Claiming reproducibility because one computer can currently generate an AAB.

## Accessibility by Visual Inspection

Claiming accessibility without keyboard, screen-reader and large-text verification.

## Performance by Subjective Speed

Marking performance complete because the application “feels fast.”

## Backup by Scheduled Job

Claiming recovery because a backup job runs without a tested restore.

## Privacy by Policy Text

Claiming withdrawal or deletion works because public wording exists.

## Analytics by Anonymous Name

Assuming an Analytics event is safe because it does not contain an email address.

## AI by Read-Only UI

Assuming the Assistant has no mutation authority without inspecting its tool and command access.

## Advertising by Non-Personalized Label

Assuming financial data is not transmitted because ads are described as non-personalized.

## Support by Friendly Response

Claiming safe Support without identity, data-access and troubleshooting controls.

## Compliance by Store Approval

Treating application-store approval as continuing evidence of accurate declarations.

## Requirement Completion by Child Count

Marking a parent complete when one or more mandatory children remain partial.

## Evidence without Version

Using a test or screenshot that cannot be tied to the current release.

## Operational Evidence by Empty Dashboard

Claiming monitoring because a dashboard exists without validated data and alerts.

---

# Part 3 Review Questions

## Design and Platform

```text
Which runtime token file is authoritative?

Which components are shared?

Does every platform call the same Application command?

Are light and dark themes tested?

Does rotation or Back behavior repeat commands?

Does Android use the same generated Product artifact?
```

---

## Accessibility

```text
Can every critical journey be completed by keyboard?

Does focus move correctly?

Are errors announced?

Does large text preserve actions and Amount visibility?

Do charts have equivalent text?

Are public policy pages accessible?
```

---

## Performance and Reliability

```text
Which budgets exist?

Which data volumes are supported?

Are synchronization batches bounded?

Are subscriptions and listeners cleaned after owner change?

Which optional providers degrade safely?
```

---

## Testing

```text
Which Critical requirements have automated tests?

Which failure states are tested?

Which migrations are rehearsed?

Which Android lifecycle states are tested?

Which tests were actually executed?
```

---

## Privacy and Deletion

```text
Which data categories exist?

Which processing is optional?

Does withdrawal stop provider delivery?

Does deletion clean Product, Attachments and providers?

Can a backup restore reactivate the owner?

Which state qualifies as completed?
```

---

## Recovery

```text
Which backups exist?

Has a restore been executed?

Were Money and Currency reconciled?

Was owner isolation validated?

Was deletion authority reapplied?

Which RPO and RTO are measured?
```

---

## Providers and Analytics

```text
Which Provider Registry entry applies?

Which data leaves Nexio?

Which user choice applies?

What happens after Account switch?

What happens after deletion?

Can the provider be disabled independently?
```

---

## Assistant

```text
Which context enters the model?

Where do totals originate?

Can the model call financial commands?

How are proposals validated and expired?

Which confirmation is required?

What happens after provider failure?
```

---

## Advertising

```text
Which placements exist?

Are protected workflows free of ads?

Does exact financial context leave Nexio?

How does withdrawal work?

Does Account deletion remove the association?

Does the kill switch work?
```

---

## Support

```text
Which identity level applies?

Which diagnostics are visible?

Can an Agent access unrelated owners?

Can Support mutate financial state?

Are destructive troubleshooting steps blocked?

Is every assisted action audited?
```

---

## Compliance

```text
Does the Privacy Policy match current Product behavior?

Does the store listing match the current release?

Does the Data declaration match current SDKs?

Does the final manifest match the Permission Registry?

Are Product claims supported by evidence?

Are distributed assets licensed?
```

---

# Part 3 Acceptance Criteria

The remaining detailed traceability matrices are accepted only when:

```text
□ Design System requirements have stable identifiers.

□ Runtime token authority is traceable.

□ Semantic color and theme requirements are traceable.

□ Shared component authority is traceable.

□ Shared financial forms depend on canonical Domain requirements.

□ Privacy masking before sensitive paint is traceable.

□ Legacy style removal is traceable.

□ Desktop shell, navigation, Dashboard and Reports are traceable.

□ Desktop financial values depend on deterministic services.

□ Tablet adaptive behavior is traceable.

□ Tablet rotation safety is release-relevant.

□ Mobile navigation and form behavior are traceable.

□ Mobile Back behavior cannot trigger unsafe actions.

□ Foldable and narrow-pane behavior are traceable.

□ Android reproducible builds are Critical requirements.

□ Android uses one authoritative Web artifact.

□ Signing identity is traceable.

□ Android lifecycle and process death are independently traceable.

□ Android Back behavior is traceable.

□ Android file access is scoped.

□ Notification permission is contextual.

□ Deep links reauthorize owner access.

□ Secure storage is not canonical financial storage.

□ Final manifest review is Critical.

□ Production AAB verification is Critical.

□ Accessibility requirements cover semantics, keyboard, focus and errors.

□ Large-text and reflow requirements are traceable.

□ Charts require equivalent accessible information.

□ Public policies and Support channels require Accessibility coverage.

□ Performance budgets are traceable.

□ Startup, list and Report performance are distinguishable.

□ Synchronization batches are bounded.

□ Memory and subscription cleanup are traceable.

□ Optional-provider degradation is traceable.

□ Domain unit testing is required.

□ A financial golden dataset is required.

□ RLS and synchronization failure tests are Critical.

□ Migration rehearsals are required.

□ Android lifecycle testing is required.

□ Test-result honesty is a Critical governance requirement.

□ Environment separation is traceable.

□ Build artifacts map to source revision and configuration.

□ CI gates are traceable.

□ Feature Flags require lifecycle governance.

□ Rollout, rollback and monitoring requirements are traceable.

□ Secret management remains Critical.

□ Internationalized financial display preserves canonical values.

□ State language remains consistent.

□ Legal translations preserve equivalent meaning.

□ Unsupported financial claims are prohibited.

□ Data Processing Inventory is required.

□ Purpose limitation and minimization are traceable.

□ Optional choice and withdrawal are independently traceable.

□ Retention is governed through a Registry.

□ Data Export is owner-safe.

□ Provider processing is traceable.

□ AI and Support data minimization are traceable.

□ Public Account deletion has a stable requirement.

□ Deletion uses recent Authentication.

□ Deletion has an explicit state machine.

□ Sessions, Product data, Attachments and providers are covered.

□ Optional provider identities are covered.

□ Backup deletion authority is Critical.

□ Deleted owners cannot reactivate.

□ Completion status remains accurate.

□ Deletion evidence has a ledger.

□ Automated protected backups are traceable.

□ Backup catalogs and integrity are traceable.

□ Restore testing is Critical.

□ Recovery is owner-isolated.

□ Financial and deletion reconciliation are required.

□ Local, synchronization and Attachment recovery are traceable.

□ Recovery exercises are required.

□ Provider Adapters are required.

□ Provider payload minimization is required.

□ Provider timeout and idempotency are traceable.

□ Webhooks require verification.

□ Provider revocation and exit are traceable.

□ Provider regional behavior is traceable.

□ Analytics requires an allowlisted Registry.

□ Raw financial payloads are prohibited.

□ Analytics initialization and withdrawal are traceable.

□ Analytics identity resets after Account switching.

□ Auto-capture requires separate approval.

□ Experiment guardrails protect financial and safety requirements.

□ Analytics failure cannot block core workflows.

□ Assistant optionality is traceable.

□ Assistant context is owner-scoped and minimized.

□ Assistant totals are deterministic.

□ Structured output validation is required.

□ Proposals are reviewable and expiring.

□ Confirmation is Critical and release-blocking.

□ Assistant commands use canonical Application commands.

□ Manual workflows remain available.

□ Prompt-injection resistance is required.

□ Assistant professional-authority claims are prohibited.

□ Provider failure cannot mutate financial state.

□ Advertising uses an Adapter.

□ Advertising placements use a Registry.

□ Sponsored content remains separate.

□ Financial context is prohibited in ad requests.

□ Protected workflows remain free of Advertising.

□ Personalization choice and withdrawal are traceable.

□ Advertising identity is owner-safe.

□ Advertising deletion behavior is traceable.

□ An independent Advertising kill switch is required.

□ Core Product works without Advertising.

□ Publisher authorization is traceable where applicable.

□ Subscription pricing and entitlement are traceable.

□ Support channels are accessible.

□ Support cases have stable identity and ownership.

□ Support severity and identity verification are traceable.

□ Support never requests secrets.

□ Support diagnostics are minimized.

□ Destructive troubleshooting is prohibited.

□ Unknown financial operations are not repeated blindly.

□ Assisted actions are audited.

□ Support access is case-bound.

□ Support AI remains bounded.

□ Public policies must match behavior.

□ Product claims require evidence.

□ Financial-service boundaries are traceable.

□ Store listing and Data declarations are traceable.

□ Deletion URL functionality is Critical.

□ Permission and SDK Registries are required.

□ Intended audience and Advertising declarations are traceable.

□ AI disclosure is traceable.

□ Dependency and asset licensing are traceable.

□ Regional readiness is traceable.

□ Compliance evidence and drift detection are required.

□ Material changes use Engineering Governance.

□ Exceptions expire.

□ AI engineering authority is bounded.

□ Documentation remains synchronized with behavior.

□ Roadmap discovery and incremental migration are requirements.

□ Existing-data preservation is Critical.

□ One canonical writer during migration is Critical.

□ Dependencies and phase gates are traceable.

□ Risks and blockers remain visible.

□ High-risk migrations are rehearsed.

□ Financial migrations reconcile.

□ Temporary architecture is removed.

□ Cross-domain dependencies are recorded.

□ Release-blocking requirement groups are defined.

□ Verification suites are defined by release type.

□ Initial evidence-mapping repository paths are identified.

□ Missing evidence becomes a visible gap.

□ Coverage views avoid invented counts.

□ Traceability implementation order is defined.

□ Machine-readable schema requirements are defined.

□ Validation rules detect invalid or unsupported status claims.

□ Pull Request, Release and Audit contracts are defined.

□ AI Traceability tasks remain bounded and factual.

□ Part 3 anti-patterns are prohibited.
```

---

# Final Traceability Acceptance Criteria

The complete Nexio Requirements Traceability Matrix is accepted only when:

1. Every material Product guarantee has a stable requirement identifier.

2. Requirement identifiers remain stable across document restructuring.

3. Every active requirement has an authoritative source.

4. Every Critical requirement has an accountable owner.

5. Every requirement has an explicit risk and priority.

6. Platform and environment scopes are recorded.

7. Parent and child relationships are explicit.

8. Requirement dependencies are explicit.

9. Release-blocking requirements are identifiable.

10. Implementation references point to active repository artifacts.

11. File names alone are not accepted as evidence.

12. Persistent-data requirements map to migrations.

13. High-risk migrations map to rehearsal evidence.

14. Money migrations reconcile totals separately by Currency.

15. Owner-isolation requirements map to positive and negative tests.

16. Synchronization requirements map to duplicate, timeout and unknown-outcome tests.

17. Android requirements map to build, lifecycle and artifact evidence.

18. Accessibility requirements map to executed journey tests.

19. Privacy requirements map to provider and lifecycle evidence.

20. Deletion requirements map to Product, provider, Attachment and backup evidence.

21. Recovery requirements map to executed restore exercises.

22. Analytics requirements map to the active Event Registry.

23. Assistant requirements map to context, schema and confirmation evidence.

24. Advertising requirements map to placement, payload and kill-switch evidence.

25. Support requirements map to access, diagnostic and assisted-action controls.

26. Compliance requirements map to active public and store declarations.

27. Testing evidence identifies environment and execution result.

28. Release evidence identifies the actual artifact.

29. Operational evidence identifies active monitors, alerts or runbooks.

30. Superseded requirements retain historical traceability.

31. Retired requirements are not reused for new meanings.

32. Missing implementation becomes a visible gap.

33. Missing tests become a visible gap.

34. Missing migration evidence becomes a visible gap.

35. Missing release evidence becomes a visible gap.

36. Missing operational coverage becomes a visible gap.

37. Partial platform coverage is never marked complete.

38. `implemented` does not imply `tested`.

39. `tested` does not imply `released`.

40. `released` does not imply `operationally_verified`.

41. `not_applicable` requires justification and approval.

42. Critical requirements target evidence levels E1 through E5.

43. High requirements target at least E1 through E4.

44. Evidence is versioned or tied to a version.

45. Evidence is protected and redacted appropriately.

46. Evidence is renewed after material changes.

47. Pull Requests identify requirements affected.

48. Tests identify requirements verified.

49. Migrations identify requirements implemented and preserved.

50. Releases identify included, partial and deferred requirements.

51. Incidents identify violated or threatened requirements.

52. Audits identify expected and missing evidence.

53. Coverage summaries do not inflate completion.

54. Coverage counts are generated from actual Registry records.

55. A machine-readable Registry or controlled authoritative matrix exists.

56. Human-readable and machine-readable views do not diverge.

57. Validation checks identifier uniqueness.

58. Validation checks referenced file existence.

59. Validation checks referenced test existence.

60. Validation checks referenced migration existence.

61. Validation prevents verified Critical requirements without tests.

62. Validation prevents released requirements without release evidence.

63. Validation prevents operational status without operational evidence.

64. Requirement changes record implementation and test impact.

65. Requirement conflicts trigger a documented decision.

66. Requirement exceptions are narrow and expiring.

67. Traceability reviews occur during planning, implementation and release.

68. Critical financial requirements are traced first.

69. Critical owner-isolation requirements are traced first.

70. Critical synchronization requirements are traced first.

71. Critical deletion and recovery requirements are traced first.

72. Critical Android publication requirements are traced first.

73. Design System requirements map to runtime implementation.

74. Platform UI requirements map to shared Domain authority.

75. Accessibility requirements map to critical user journeys.

76. Performance requirements map to measurable budgets.

77. Operational requirements map to monitors and runbooks.

78. Provider requirements map to active configuration.

79. Compliance requirements map to active Store submissions.

80. Licensing requirements map to distributed artifacts.

81. AI-generated mappings remain suggestions until verified.

82. AI agents cannot invent completion evidence.

83. AI agents distinguish tests written from tests executed.

84. AI agents report unresolved gaps.

85. AI agents remain bounded to explicit requirement sets.

86. A qualified reviewer can reproduce the complete traceability chain.

---

# Requirements Traceability Constitutional Rule

Every Nexio requirement and every claim that a capability is implemented, tested, released or operationally valid must answer:

```text
Which stable requirement defines the obligation, which active implementation satisfies it, which executed verification proves it, which released artifact contains it and which current operational evidence shows that it remains true?
```

When the answer is uncertain, prefer the action that:

- Keeps the requirement incomplete.
- Records a gap.
- Verifies the active source file.
- Verifies the active migration.
- Executes the missing test.
- Inspects the released artifact.
- Adds monitoring.
- Updates the policy or Store declaration.
- Assigns an owner.
- Reopens the requirement.
- Blocks release.
- Rejects the completion claim.

Traceability does not exist because requirements, files and tests are listed in the same document.

It exists only when the links among them are factual, current, reproducible and strong enough for the risk of the Product guarantee.

---

# Final Authority

This document is the official Requirements Traceability Matrix specification for Nexio.

All future:

- Requirement identifiers
- Requirement registries
- Requirement-status changes
- Requirement dependencies
- Parent and child requirement relationships
- Implementation mappings
- Migration mappings
- Test mappings
- Release mappings
- Operational mappings
- Public-policy mappings
- Store-declaration mappings
- Traceability gaps
- Coverage summaries
- Pull Request requirement references
- Release requirement lists
- Incident requirement references
- Audit requirement references
- AI-generated traceability mappings
- Requirement retirement
- Requirement supersession
- Traceability exceptions

must comply with this specification.

Exceptions require a documented Product, Architecture, Domain, Data, Security, Privacy, Accessibility, Android, Web, Quality, Operations, Recovery, Support, Compliance, Documentation or Release decision containing:

- Requirement identifier
- Authoritative source
- Missing or conflicting link
- Current status
- Risk
- Platform scope
- Environment scope
- Owner
- Compensating control
- Required evidence
- Expiration
- Resolution plan
- Required approvers

Undocumented completion claims, fabricated evidence, hidden gaps and unsupported status inflation are considered Product, financial-integrity, Security, Privacy, Accessibility, reliability, operational and governance debt.

---