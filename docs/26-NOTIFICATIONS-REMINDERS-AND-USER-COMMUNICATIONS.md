# Nexio Notifications, Reminders and User Communications Specification

Version: 1.0  
Status: Official  
Authority Level: Notification, Reminder, Messaging and User Communication Standard  
Applies To: Web, Desktop, Tablet, Mobile Web, Android, Email, Push Notifications, In-Product Messages, Local Reminders, Synchronization Alerts, Security Communications, Privacy Communications, Account Deletion, Reports, Goals, Assistant, Advertising, Support, Incidents and Provider Communications

---

# Purpose

This document defines the official notification, reminder and user-communication architecture for Nexio.

It establishes how Nexio should:

- Create notifications
- Schedule reminders
- Deliver push messages
- Display in-Product messages
- Communicate security events
- Communicate synchronization states
- Communicate Account deletion progress
- Communicate provider failures
- Communicate Product incidents
- Communicate optional Product education
- Protect sensitive financial information
- Respect user preferences
- Request Notification permission contextually
- Support quiet hours
- Support channel-specific preferences
- Prevent duplicate messages
- Preserve owner isolation
- Handle offline delivery
- Handle retries and unknown delivery outcomes
- Support Android notification behavior
- Support Web notification behavior
- Support Accessibility
- Measure communication effectiveness safely
- Govern promotional communication
- Keep Advertising separate from Product messaging
- Use AI for drafting without allowing fabricated or manipulative communication

The objective is to ensure that every communication answers:

```text
Why is this message being sent?

Which Product event caused it?

Which owner should receive it?

Which channel is appropriate?

Which data may appear?

Which action is expected?

Can the user safely ignore or disable it?

What happens when delivery fails?
```

---

# Relationship with Other Documents

This document must be interpreted together with:

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
docs/23-REQUIREMENTS-TRACEABILITY-MATRIX.md
docs/24-PRODUCT-ROADMAP-AND-PRIORITIZATION.md
docs/25-ONBOARDING-HELP-AND-USER-EDUCATION.md
```

Responsibilities are divided as follows:

| Document | Responsibility |
|---|---|
| `07-SECURITY.md` | Defines security-event handling and secret protection |
| `08-OFFLINE-AND-SYNC.md` | Defines synchronization states and operation outcomes |
| `11-INTERNATIONALIZATION-AND-CONTENT.md` | Defines localized message content |
| `13-PRIVACY-AND-DATA-GOVERNANCE.md` | Defines communication data and preference governance |
| `14-ACCESSIBILITY.md` | Defines accessible announcements and interaction |
| `16-ANALYTICS-AND-EXPERIMENTATION.md` | Defines safe communication measurement |
| `17-API-AND-INTEGRATIONS.md` | Defines provider boundaries |
| `20-SUPPORT-AND-USER-OPERATIONS.md` | Defines Support communication |
| `21-COMPLIANCE-LEGAL-AND-STORE-READINESS.md` | Defines public and store communication obligations |
| `25-ONBOARDING-HELP-AND-USER-EDUCATION.md` | Defines educational messaging |
| `26-NOTIFICATIONS-REMINDERS-AND-USER-COMMUNICATIONS.md` | Defines communication triggers, channels, delivery, content and lifecycle |

This document does not redefine canonical financial or synchronization state.

Notifications must describe the state defined by the authoritative Domain and Application services.

---

# Communication Constitutional Principles

## Communication Must Reflect Canonical Product State

A Notification must not claim:

```text
Transaction completed

Transfer completed

Synchronization completed

Account deletion completed

Export delivered
```

unless the authoritative operation state supports that claim.

---

## Delivery Does Not Create Financial State

A Notification may inform the user about an operation.

It must not become the authority that creates, confirms or repairs:

- Transactions
- Transfers
- Accounts
- Goals
- Exports
- Account deletion

---

## Notifications Must Not Replace Product State

A user should be able to open Nexio and verify the same status communicated through the Notification.

---

## Financial Safety Has Priority over Engagement

Nexio must not send messages designed to increase:

- Application opens
- Session duration
- Transaction count
- Assistant use
- Advertisement interaction

at the expense of:

- User autonomy
- Financial accuracy
- Privacy
- Accessibility
- Calm communication
- Notification relevance

---

## Notifications Must Have a Defined Purpose

Every communication must belong to an approved purpose such as:

```text
Security

Authentication

Financial operation state

Synchronization

Recovery

Account deletion

User-created reminder

Goal reminder

Report availability

Product education

Service incident

Support

Administrative or legal communication

Optional Product update

Marketing
```

---

## Notification Permission Must Be Requested in Context

Android or browser Notification permission should be requested only after explaining:

- What messages may be sent
- Why they may be useful
- What may appear on the lock screen
- How to change the setting later
- That refusal does not block unrelated core features

---

## Notification Permission Is Not Marketing Consent

Operating-system Notification permission does not automatically authorize:

- Marketing
- Advertising personalization
- Optional Analytics
- Assistant history
- Third-party profiling

---

## Refusal Must Preserve Core Product Access

Refusing Notifications must not block:

- Authentication
- Accounts
- Transactions
- Transfers
- Goals
- Reports
- Export
- Privacy settings
- Account deletion
- Support

---

## Required and Optional Communications Must Be Distinguishable

Some communications may be necessary for:

- Security
- Account recovery
- Account deletion
- Legal obligations
- Material service incidents

Optional communications may include:

- Goal reminders
- Product tips
- Report reminders
- Feature announcements
- Marketing

---

## Required Communication Must Remain Minimal

Mandatory status does not permit unnecessary:

- Financial details
- Repeated messages
- Advertising
- Cross-promotion
- Profiling
- Engagement pressure

---

## Sensitive Financial Information Must Be Minimized

Notification content should not expose by default:

- Exact balance
- Exact Transaction Amount
- Transaction description
- Account name
- Goal name
- Attachment content
- Support-case content
- Assistant prompt

---

## Lock-Screen Content Must Be Conservative

Default lock-screen communication should prefer generic content.

Preferred:

```text
A Nexio record needs your attention.
```

Avoid by default:

```text
Your R$ 1.250,00 Expense at Mercado failed.
```

---

## Detailed Content Requires Explicit User Control

Where detailed Notification content is supported, the user should be able to select an appropriate privacy level.

---

## Owner Isolation Applies to Communication

A Notification must not reveal another owner's:

- Identity
- Account
- Transaction
- Goal
- Synchronization state
- Export
- Deletion state
- Support case

---

## Account Switching Must Reset Communication Context

After Account switching:

- Previous-owner device tokens must not remain associated incorrectly.
- Previous-owner local reminders must be isolated.
- Previous-owner Notification inbox must not remain visible.
- Deep links must reauthorize the active owner.

---

## Sign-Out Must Remove Sensitive Visibility

After Sign-out:

- Sensitive in-Product messages must be hidden.
- Push content should remain generic.
- Pending deep links must require Authentication.
- Owner-specific local reminders must not open protected content directly.

---

## Deleted Owners Must Not Receive Ordinary Product Messages

After Account deletion reaches the applicable restricted state:

- Ordinary Product notifications must stop.
- Marketing must stop.
- Optional reminders must stop.
- Only approved deletion, legal, Security or Support communications may continue where required.

---

## Notification Actions Must Be Safe

A Notification action may:

- Open Nexio
- Open a verified screen
- Dismiss
- Snooze a reminder
- Mark a user-created reminder complete

A Notification action must not directly:

- Create a financial Transaction
- Confirm a Transfer
- Delete financial data
- Resolve a Conflict
- Approve an Assistant proposal
- Complete Account deletion

without opening Nexio and applying the required Authentication and confirmation.

---

## Deep Links Must Reauthorize

Every Notification deep link must verify:

```text
Authentication

Current owner

Entity ownership

Entity existence

Current operation state

Feature availability

Platform support
```

---

## Notification Content Must Be Accessible

Communication must support:

- Clear title
- Clear purpose
- Understandable action
- Screen-reader reading
- Large text
- Non-color status meaning
- Reduced motion
- Logical focus after opening
- Equivalent in-Product status

---

## Communication Must Be Calm

Avoid:

- Shame
- Fear
- False urgency
- Excessive punctuation
- All caps
- Manipulative countdowns
- Financial judgment
- Pressure to open the application

---

## Reminder Language Must Be Neutral

Avoid:

```text
You failed to save enough again.
```

Prefer:

```text
Your Goal reminder is ready to review.
```

---

## Notifications Must Respect Time and Context

Communication should consider:

- User time zone
- Quiet hours
- Local calendar
- Owner preference
- Platform capability
- Message urgency
- Recent duplicate messages

---

## Urgency Must Be Evidence-Based

Urgent presentation should be reserved for:

- Credible security event
- Required Account action
- Material service incident
- Time-sensitive deletion or recovery state
- User-defined urgent reminder

---

## Marketing Must Never Masquerade as Security or Financial Status

Prohibited:

```text
Important Account alert
```

when the actual purpose is promotional.

---

## Advertising Must Remain Separate

A Product Notification must not:

- Contain disguised sponsored content
- Promote an advertiser as financial guidance
- Use exact financial context for targeting
- Place an Advertisement inside a Security or deletion message

---

## Assistant Output Is Not Automatically a Notification

Assistant-generated content may become a Notification only through an approved communication contract.

The model must not independently choose:

- Recipient
- Channel
- Timing
- Financial detail
- Urgency

---

## Notification Delivery Is Not Guaranteed

Content should not assume the operating system, browser, email provider or user device delivered the message.

Critical Product states must remain visible inside Nexio.

---

## Communication Failure Must Not Change Canonical State

Failure to deliver a Notification must not:

- Reverse a Transaction
- Cancel synchronization
- Cancel Account deletion
- Recreate a reminder
- Duplicate an operation

---

## Retries Must Be Idempotent

The same communication event must not create repeated messages without an approved repeat policy.

---

## Communication Identity Must Be Stable

Every material communication should have:

```text
communicationId

eventId

ownerId

messageType

channel

templateVersion
```

where applicable.

---

## User-Created Reminders Belong to the User

A reminder created by the user must retain:

- Owner
- Schedule
- Time zone
- Subject
- Recurrence
- Status
- Delivery preference

---

## Product Reminders Must Be Clearly Distinguished

A Product reminder should state whether it was:

```text
Created by you

Created from a Goal setting

Generated by Nexio Product behavior

Required for Security or Account status
```

---

## Communication Preferences Must Be Discoverable

Users should be able to find communication settings from:

```text
Settings

Notifications

Privacy

Relevant feature settings
```

---

## Preference Changes Must Take Effect Predictably

A user should understand whether a change applies:

- Immediately
- After synchronization
- On the current device only
- Across all devices
- To future messages only

---

## Withdrawal Must Stop Future Optional Communication

Disabling an optional category should:

- Stop future eligible sends
- Cancel unsent optional jobs where possible
- Update provider subscriptions
- Preserve required communications
- Record the preference change

---

## Communication History Must Be Controlled

When Nexio provides an in-Product Notification Center, it must define:

- Retention
- Owner scope
- Read state
- Deletion behavior
- Account deletion behavior
- Sensitive-content handling

---

## Messages Must Be Versioned

A communication should identify the template version used.

This supports:

- Audit
- Localization
- Incident review
- Content correction
- Experiment analysis

---

## AI-Generated Communication Requires Review

AI may draft message text.

It must not invent:

- Product state
- Amounts
- Deadlines
- Delivery guarantees
- Security incidents
- Deletion completion
- Provider status
- Legal requirements

---

# Communication Goals

Nexio communications should help users:

```text
Recognize important Product state

Return to a pending user-created task

Understand an error

Respond to a Security event

Understand synchronization

Track an Account deletion request

Access a completed Export

Review a Goal reminder

Find Support
```

---

# Communication Guardrails

Potential guardrails:

```text
Sensitive-data exposure

Cross-owner delivery

Duplicate message rate

False-completion message rate

Notification disablement rate

Complaint rate

Unsubscribe failure

Deep-link authorization failure

Accessibility failure

Delivery-provider failure

Quiet-hour violation

Deleted-owner message rate
```

---

# Communication Success Is Not Open Rate

A high open rate may result from:

- Fear
- Misleading urgency
- Ambiguous title
- Excessive repetition
- Accidental taps

Communication success should be based on:

```text
Correct user understanding

Successful safe task completion

Reduced duplicate action

Timely security response

Lower unresolved synchronization state

Successful preference control
```

---

# Communication Channel Architecture

Supported or potential channels:

```text
In-Product Notification Center

Inline Product status

Banner

Toast

Dialog

Android Push Notification

Web Push Notification

Local Device Notification

Email

Public Status Page

Support Message

Account Deletion Status Page
```

---

# Channel Selection Principles

Choose the least intrusive channel that satisfies the communication purpose.

---

# In-Product Status

Use for:

- Synchronization state
- Pending operation
- Conflict
- Local Save
- Current provider state
- Current form result

In-Product state is the preferred authority for Product status.

---

# Banner

Use for:

- Material temporary state
- Service degradation
- Required user action
- Cross-screen synchronization issue
- Privacy or policy update requiring attention

A banner should not obscure core navigation unnecessarily.

---

# Toast

Use for:

- Immediate transient confirmation
- Noncritical local result
- Short reversible action feedback

A Toast must not be the only location for:

- Error recovery
- Account deletion status
- Security event
- Unknown outcome
- Critical financial state

---

# Dialog

Use for:

- Required confirmation
- Material consequence
- Security action
- Destructive action
- Reauthentication
- Conflict review

A Dialog should not be used for routine marketing.

---

# Android Push Notification

Use for:

- Approved Security events
- User-created reminders
- Goal reminders
- Required Account status
- Completed Export
- Material synchronization attention
- Approved optional Product communication

---

# Web Push Notification

Use only when:

- Browser permission exists.
- The owner is authorized.
- The use case remains valuable outside the open application.
- Content privacy is appropriate.
- Service Worker behavior is verified.

---

# Local Device Notification

Use for:

- User-created reminders
- Device-local scheduled reminders
- Offline-capable reminders

Local Notification state must not falsely imply remote Product state.

---

# Email

Use for:

- Authentication and recovery
- Account Security
- Account deletion
- Required legal or administrative communication
- Export link where approved
- Optional Product communication where permitted

Email must not become the only access path for critical Product state when the user may not receive it.

---

# Public Status Page

Use for:

- Service incidents
- Provider disruption
- Recovery progress
- Resolved incident notice

The status page must avoid exposing owner-specific data.

---

# Support Message

Use when:

- A Support case exists.
- Identity and authorization requirements are satisfied.
- Case-specific action is required.
- Communication is recorded in the case.

---

# Account Deletion Status Page

Where implemented, it may communicate:

- Request received
- Processing
- Provider cleanup
- Backup retention
- Completed
- Failed retryable

It must not expose protected data through an unverified link.

---

# Channel Capability Matrix

| Capability | In-Product | Push | Email | Local Notification | Public Status |
|---|---:|---:|---:|---:|---:|
| Local Save state | Yes | Usually no | No | No | No |
| Synchronization pending | Yes | Optional | Usually no | Optional | No |
| Unknown outcome | Yes | Limited | Limited | No | No |
| Security alert | Yes | Yes | Yes | No | No |
| User reminder | Yes | Yes | Optional | Yes | No |
| Account deletion | Yes | Optional | Yes | No | No |
| Service incident | Yes | Optional | Optional | No | Yes |
| Marketing | Optional | Optional | Optional | No | No |
| Advertising | No disguised use | No disguised use | No disguised use | No | No |

---

# Communication Category Architecture

Recommended categories:

```text
security

authentication

financial_operation

synchronization

recovery

Account_deletion

user_reminder

Goal_reminder

Report

Export

Product_education

Product_update

service_incident

Support

Privacy

legal_or_administrative

marketing
```

---

# Security Communication

Examples:

- New sign-in
- Password changed
- Session revoked
- Suspicious activity
- Recovery started
- Authentication method changed

Security messages should remain enabled where required for Account protection.

---

# Authentication Communication

Examples:

- Verification link
- Password reset
- Magic link
- Authentication expiration requiring action

---

# Financial Operation Communication

Use conservatively.

Examples:

- Transaction requires review
- Transfer remains unresolved
- Import confirmation completed
- Export generated

Do not expose exact values by default.

---

# Synchronization Communication

Examples:

```text
Some changes need attention.

Sign in again to continue synchronization.

A Conflict is ready for review.

Nexio is checking an operation result.
```

---

# Recovery Communication

Examples:

- Local migration requires attention
- Restore completed
- Recovery step failed
- User action is required

---

# Account Deletion Communication

Examples:

- Request received
- Access restricted
- Provider cleanup pending
- Completed
- Additional action required

---

# User Reminder

Created directly by the user.

Examples:

- Review monthly records
- Add a recurring personal record manually
- Review an Export
- Check a Goal

---

# Goal Reminder

Associated with an approved Goal reminder setting.

It must not imply failure or financial judgment.

---

# Report Communication

Examples:

- Scheduled Report is ready
- Monthly summary is available

Do not include sensitive totals by default.

---

# Export Communication

Examples:

- Export is ready
- Export link is expiring
- Delivery failed
- External destination has not confirmed delivery

---

# Product Education Communication

Examples:

- New synchronization-state explanation
- First-use guidance
- Contextual Help

Should remain limited and dismissible.

---

# Product Update Communication

Examples:

- New supported capability
- Important behavior change
- Deprecated capability
- Android update requirement

---

# Service Incident Communication

Should distinguish:

```text
Investigating

Identified

Monitoring

Resolved
```

---

# Support Communication

Must remain case-bound and identity-aware.

---

# Privacy Communication

Examples:

- Preference changed
- Withdrawal processed
- Data Export available
- Privacy Policy material update

---

# Legal or Administrative Communication

Use only for approved obligations.

---

# Marketing Communication

Marketing must:

- Be optional where required
- Be clearly identified
- Avoid financial pressure
- Avoid sensitive profiling
- Provide unsubscribe
- Respect regional requirements

---

# Communication Priority Levels

Recommended:

```text
critical

high

normal

low
```

---

# Critical Communication

Use for:

- Confirmed Security compromise
- Required Account protection
- Critical deletion state
- Immediate owner-isolation concern
- Severe Product incident requiring user action

---

# High Communication

Use for:

- Unknown financial outcome requiring attention
- Authentication required to preserve synchronization
- Recovery failure
- Expiring sensitive Export
- Required migration action

---

# Normal Communication

Use for:

- User reminders
- Goal reminders
- Report availability
- Optional Product update

---

# Low Communication

Use for:

- Product tips
- Educational suggestions
- Nonurgent announcements

---

# Priority Does Not Override Privacy

A Critical message should still avoid unnecessary financial detail.

---

# Communication Event Architecture

Every material message should originate from a defined communication event.

Recommended event fields:

```text
eventId

eventType

ownerId

entityType

entityId

operationId

occurredAt

eventVersion

severity

requiredAction

privacyClassification

source
```

---

# Event Source

Potential:

```text
Domain

Application command

Synchronization engine

Authentication provider

Deletion coordinator

Export service

Support system

Operations incident system

User reminder scheduler
```

---

# Communication Event Prohibition

UI code should not independently invent authoritative communication events for remote financial completion.

---

# Communication Message Architecture

Recommended message fields:

```text
communicationId

eventId

ownerId

category

priority

channel

templateId

templateVersion

locale

privacyLevel

scheduledAt

expiresAt

deliveryState

deepLink

deduplicationKey

providerReference
```

---

# Communication Identifier

`communicationId` should remain stable for the message instance.

---

# Deduplication Key

Potential structure:

```text
ownerId

eventType

entityId

operationId

channel

templateVersion
```

The final key should match the actual communication semantics.

---

# Template Architecture

Every reusable communication should use an approved template.

Recommended fields:

```text
templateId

category

purpose

title

body

availableChannels

privacyLevels

locales

requiredVariables

forbiddenVariables

deepLinkType

expiration

owner

status

version
```

---

# Template Identifier

Recommended:

```text
NTF-<CATEGORY>-<NUMBER>
```

Examples:

```text
NTF-SEC-001

NTF-SYNC-004

NTF-DELETE-003

NTF-GOAL-002

NTF-EXPORT-005
```

---

# Template Status

Recommended:

```text
draft

review

approved

active

needs_update

deprecated

disabled

archived
```

---

# Template Variables

Approved variables may include:

```text
genericEntityType

status

expirationDate

SupportReference

deviceName where approved

platform

ProductVersion
```

Sensitive variables should be prohibited by default.

---

# Forbidden Default Variables

```text
Exact balance

Exact Transaction Amount

Transaction description

Full Account name

Goal name

Attachment name

Support-case body

Assistant prompt

Authentication token
```

---

# Communication Privacy Levels

Recommended:

```text
private_generic

limited

detailed
```

---

# `private_generic`

Example:

```text
Nexio needs your attention.
```

No owner-specific financial context.

---

# `limited`

Example:

```text
A Transaction needs review.
```

No exact Amount or user-entered description.

---

# `detailed`

May include approved contextual fields only after explicit user choice and platform review.

Example:

```text
A BRL Transaction in Conta principal needs review.
```

Even detailed mode should avoid:

- Exact balance
- Full description
- Credential data
- Sensitive Attachment content

---

# Default Privacy Level

Recommended default:

```text
private_generic
```

especially for lock-screen and push content.

---

# Notification Preview Settings

Potential settings:

```text
Hide all sensitive details

Show message type only

Show approved contextual details
```

---

# Notification Center Architecture

An in-Product Notification Center may display:

```text
Unread messages

Read messages

Required action

Category

Timestamp

Status

Related Product destination
```

---

# Notification Center Requirements

It must:

- Be owner-scoped.
- Use canonical state.
- Avoid duplicate entries.
- Support keyboard and screen reader.
- Distinguish unread from unresolved.
- Permit read-state management.
- Preserve required messages where needed.
- Respect retention.

---

# Read State versus Resolution State

These are distinct.

```text
Read:
The user viewed the message.

Resolved:
The underlying Product state no longer requires action.
```

Marking a message read must not resolve:

- Conflict
- Unknown outcome
- Account deletion failure
- Security event
- Recovery issue

---

# Notification Center Message States

Recommended:

```text
unread

read

action_required

resolved

expired

withdrawn

superseded
```

---

# `unread`

The user has not viewed the message.

---

# `read`

The user viewed the message.

---

# `action_required`

The underlying Product state still requires user action.

---

# `resolved`

The underlying Product state is resolved.

---

# `expired`

The communication is no longer actionable.

---

# `withdrawn`

The message was withdrawn because it was incorrect, unsafe or no longer applicable.

---

# `superseded`

A newer communication replaces it.

---

# Notification Center Retention

Retention should depend on category.

Potential:

```text
Security:
Longer approved period

Synchronization:
Until resolved plus bounded history

User reminders:
User-controlled or bounded

Product education:
Short

Marketing:
Short and optional

Account deletion:
According to deletion evidence and communication requirements
```

---

# Reminder Architecture

Reminder types:

```text
one_time

recurring

event_relative

user_defined

Goal_based

Report_based
```

---

# One-Time Reminder

Occurs once at a scheduled local Date and time.

---

# Recurring Reminder

Repeats according to a governed recurrence rule.

---

# Event-Relative Reminder

Occurs relative to a Product event.

Example:

```text
Remind the user to review an Export before its approved expiration.
```

---

# User-Defined Reminder

Created and controlled directly by the owner.

---

# Goal-Based Reminder

Associated with a Goal preference.

It should not infer the user's financial ability or judgment.

---

# Report-Based Reminder

May remind the user that a scheduled Report is available.

---

# Reminder Record

Recommended fields:

```text
reminderId

ownerId

type

subjectType

subjectId

title

schedule

timeZone

recurrence

channelPreferences

privacyLevel

enabled

lastTriggeredAt

nextTriggerAt

status

createdBy

createdAt

updatedAt
```

---

# Reminder Status

Recommended:

```text
active

paused

completed

expired

cancelled

invalid

delivery_blocked
```

---

# Reminder Time Zone

The reminder should store:

- Intended local time
- Time zone identifier
- Recurrence semantics

Avoid relying only on a fixed UTC offset for long-term recurring reminders.

---

# Daylight-Saving Behavior

Recurring reminders should preserve the intended local wall-clock time unless the user chooses an absolute instant model.

---

# Time-Zone Change

When device or owner time zone changes:

- Explain the effect where material.
- Recalculate future local reminders safely.
- Do not change past reminder history.
- Avoid duplicate triggers.

---

# Reminder Recurrence

Potential:

```text
daily

weekly

monthly

yearly

custom
```

Only supported recurrence should be shown.

---

# Monthly Reminder Semantics

For reminders scheduled on Dates such as the 29th, 30th or 31st, Nexio must define behavior for shorter months.

Potential approved models:

```text
Last valid day of the month

Skip the month

Ask the user
```

The behavior must be explicit.

---

# Reminder Completion

Completion means the reminder is acknowledged or the associated user task is marked complete.

It does not mean a financial operation occurred.

---

# Snooze

Snooze should:

- Preserve owner
- Preserve reminder identity
- Create one new trigger
- Avoid creating a duplicate recurring reminder
- Respect quiet hours

---

# Reminder Cancellation

Cancellation should stop future sends while preserving appropriate audit or user history.

---

# Goal Reminder Content

Preferred:

```text
Your Goal reminder is ready to review.
```

Avoid:

```text
You are behind on your R$ 5.000,00 Goal.
```

unless the user explicitly requested detailed Goal progress and the calculation is valid.

---

# Financial Review Reminder

Preferred:

```text
Review your monthly records in Nexio.
```

Avoid:

```text
You spent too much this month.
```

---

# Communication Preference Architecture

Recommended preference groups:

```text
security

authentication

synchronization

Account_deletion

user_reminders

Goal_reminders

Reports

Product_education

Product_updates

service_incidents

Support

marketing
```

---

# Preference Record

Recommended fields:

```text
ownerId

category

channel

enabled

privacyLevel

quietHours

frequencyLimit

updatedAt

source

version
```

---

# Preference Scope

A preference may be:

```text
owner_global

device_specific

channel_specific

feature_specific
```

The scope must be visible to the user.

---

# Owner-Global Preference

Applies across supported devices.

Example:

```text
Disable Goal reminder emails.
```

---

# Device-Specific Preference

Applies only to one device.

Example:

```text
Hide detailed lock-screen previews on this Android device.
```

---

# Channel-Specific Preference

Example:

```text
Enable email but disable Push for Product updates.
```

---

# Feature-Specific Preference

Example:

```text
Enable reminder for Goal A but not Goal B.
```

---

# Required Communication Preferences

Some categories may not support complete disablement where communication is necessary for:

- Security
- Account recovery
- Account deletion
- Legal obligation

The user interface should explain the reason and available channel controls.

---

# Optional Preference Default

Optional promotional or educational communication should default according to approved Privacy and regional requirements.

It must not be silently enabled through unrelated Product use.

---

# Preference Change Confirmation

Example:

```text
Goal reminders are now disabled.

This change applies to future reminders across your Nexio devices.
```

---

# Preference Save Failure

```text
We could not update this communication preference.

The previous setting remains active.
```

---

# Offline Preference Change

Where supported:

```text
Your preference was saved on this device.

Nexio will synchronize it when a connection is available.
```

Optional sending from the current device should stop immediately where technically possible.

---

# Quiet Hours Architecture

Quiet hours should support:

```text
Start time

End time

Time zone

Applicable categories

Critical override policy
```

---

# Quiet-Hour Default

No quiet-hour schedule should be invented without user choice, except for a documented conservative Product default where approved.

---

# Quiet-Hour Override

Only approved Critical communication may override quiet hours.

Examples:

- Security compromise
- Required Account-protection event

Goal, Report, education and marketing messages must not override quiet hours.

---

# Quiet-Hour Boundary

A reminder scheduled during quiet hours may:

```text
Move to quiet-hour end

Skip

Remain in the in-Product center only
```

The behavior must be defined per category.

---

# Frequency Governance

Frequency should be limited by:

```text
Category

Owner preference

Recent related message

Unresolved state

Channel

Product version

Quiet hours
```

---

# Frequency Cap

Potential controls:

```text
Maximum per day

Maximum per week

Minimum interval

One message per unresolved event

One Product tip per release
```

---

# Duplicate Suppression

Suppress when:

- Same event already produced an active message.
- Underlying state has not changed.
- A newer message supersedes the old one.
- The owner already completed the action.
- The reminder is paused.
- The user disabled the category.

---

# Communication Expiration

A message should expire when:

- The related action is no longer valid.
- The entity was deleted.
- The owner changed.
- The deep link no longer applies.
- The Export expired.
- A newer communication superseded it.
- The Product version no longer supports it.

---

# Expired Message Behavior

An expired push may still be visible in system history.

Opening it should:

- Authenticate.
- Revalidate state.
- Explain that the message is no longer current.
- Offer the relevant current destination.

---

# Communication Scheduling Architecture

Scheduling may occur:

```text
Locally on device

Remotely on Nexio backend

Through an approved provider
```

---

# Local Scheduling

Appropriate for:

- Device-specific user reminders
- Offline-capable reminders

Risks:

- Device time changes
- Reinstall
- Process restrictions
- Battery optimization
- Owner switching
- Device-only state

---

# Remote Scheduling

Appropriate for:

- Cross-device reminders
- Security messages
- Account deletion
- Export expiration
- Service incidents

Requires:

- Owner authorization
- Provider reliability
- Preference enforcement
- Time-zone handling
- Deduplication
- Deletion cleanup

---

# Hybrid Scheduling

A reminder may have remote authority with local delivery support.

The architecture must prevent:

- Duplicate local and remote messages
- Different reminder times
- Prior-owner delivery
- Delivery after cancellation

---

# Communication Delivery States

Recommended:

```text
created

eligible

suppressed

scheduled

queued

sent_to_provider

provider_accepted

delivered

opened

actioned

failed_retryable

failed_final

expired

cancelled

unknown_delivery
```

---

# `created`

Communication record exists.

---

# `eligible`

Preference, owner, timing and purpose checks pass.

---

# `suppressed`

The message will not be sent because of:

- Disabled preference
- Deduplication
- Quiet hours
- Ineligible owner
- Deleted owner
- Expired event
- Unsupported channel

---

# `scheduled`

The message has a future delivery time.

---

# `queued`

Ready for provider submission.

---

# `sent_to_provider`

The request was transmitted.

---

# `provider_accepted`

The provider accepted the request.

This does not prove device delivery.

---

# `delivered`

Delivery was confirmed where the provider supports reliable confirmation.

---

# `opened`

The user opened the message or destination.

This does not prove understanding or resolution.

---

# `actioned`

The intended safe Product action was completed.

---

# `failed_retryable`

A temporary failure occurred.

---

# `failed_final`

No further automatic delivery attempt should occur.

---

# `expired`

The communication is no longer valid.

---

# `cancelled`

The communication was deliberately stopped.

---

# `unknown_delivery`

The final delivery result cannot be confirmed.

Do not automatically create a new communication without deduplication review.

---

# Communication Retry Architecture

Retries must consider:

```text
Category

Urgency

Expiration

Provider response

Owner state

Preference state

Deduplication

Quiet hours

Attempt count
```

---

# Retry Prohibitions

Do not retry when:

- Owner deleted the Account.
- Preference was disabled.
- Message expired.
- Entity no longer exists.
- Permanent provider rejection occurred.
- Deep-link authorization is invalid.
- Message was superseded.
- Marketing unsubscribe occurred.

---

# Retry Identity

Retry must preserve the original:

```text
communicationId

eventId

deduplicationKey
```

---

# Unknown Delivery

Unknown delivery means Nexio cannot prove whether the provider or device delivered the message.

Response:

- Preserve communication identity.
- Check provider status where supported.
- Avoid immediate duplicate send.
- Keep canonical Product state available in-Product.
- Escalate only when the communication is Critical.

---

# Notification Permission Architecture

Permission states:

```text
not_requested

granted

denied

temporarily_denied

system_blocked

unsupported
```

---

# `not_requested`

The Product has not requested operating-system permission.

---

# `granted`

The system currently allows eligible Notifications.

---

# `denied`

The user refused permission.

---

# `temporarily_denied`

The platform permits another contextual request according to platform rules.

---

# `system_blocked`

The application cannot request again directly and should guide the user to system settings only when relevant.

---

# `unsupported`

The current platform or browser does not support the channel.

---

# Permission Request Entry Condition

Request only when:

- The user sees a clear benefit.
- The category is explained.
- The application is in an appropriate foreground context.
- No deceptive overlay exists.
- Platform rules allow the request.

---

# Permission Education Screen

Recommended structure:

```text
Title

Why Nexio may notify you

Examples of message categories

Lock-screen privacy note

Core-access assurance

Enable

Not now
```

---

# Permission Denial

After denial:

```text
Notifications remain disabled.

You can continue using Nexio and change this later in Settings.
```

Do not immediately repeat the request.

---

# System Settings Guidance

Only guide users to system settings when:

- They intentionally choose to enable Notifications later.
- A desired reminder cannot work without permission.
- The explanation remains platform-specific and current.

---

# Permission Revocation

When permission is revoked externally:

- Detect where possible.
- Update channel availability.
- Preserve in-Product communication.
- Avoid repeated provider sends to invalid tokens.
- Explain the state in Settings.

---

# Device Token Architecture

Push tokens must be:

- Bound to the correct owner and device context.
- Revoked after Sign-out where appropriate.
- Revalidated after Account switch.
- Removed after Account deletion.
- Protected from logs and AI.
- Updated after provider rotation.

---

# Token Record

Potential fields:

```text
tokenId

ownerId

deviceId

platform

provider

tokenReference

status

createdAt

lastValidatedAt

revokedAt

ProductVersion
```

The raw token should be handled as sensitive provider credential material.

---

# Token States

```text
active

invalid

revoked

expired

owner_changed

deletion_pending
```

---

# Multi-Device Communication

Nexio must define whether a message is:

```text
All-device

One-device

First-device-only

In-Product-only
```

---

# All-Device Message

Appropriate for:

- Security
- Account deletion
- Material owner status

It still requires deduplication and clear read-state semantics.

---

# One-Device Message

Appropriate for:

- Device-local reminder
- Device-specific permission state
- Android-only event

---

# First-Device-Only

May be used for low-priority reminders where duplicate device delivery would be disruptive.

The selection logic must be deterministic.

---

# Read Synchronization across Devices

When supported, read state may synchronize.

Resolution state must always derive from canonical Product state.

---

# Communication Content Architecture

Every message should include only what is needed.

Recommended structure:

```text
Title

State or purpose

Safe next action

Optional destination

Expiration where relevant
```

---

# Title Rules

Titles should:

- Identify Nexio or the relevant state.
- Remain concise.
- Avoid unsupported urgency.
- Avoid exact financial detail by default.
- Avoid ambiguous marketing language.

---

# Body Rules

The body should:

- Explain what happened.
- Explain what the user may need to do.
- Avoid exposing secrets.
- Avoid financial judgment.
- Avoid implying successful delivery or completion incorrectly.

---

# Action Label Rules

Preferred:

```text
Review Transaction

Open synchronization

Review Account deletion

Open Export

View Security activity
```

Avoid:

```text
Fix now
```

unless the required action is clear and genuinely urgent.

---

# Security Message Examples

## New Sign-In

```text
Title:
New Nexio sign-in

Body:
A new sign-in was detected. Review your Security activity if this was not you.
```

Do not include precise location unless verified and approved.

---

## Password Changed

```text
Title:
Nexio password changed

Body:
Your password was changed. Review your Account if you did not make this change.
```

---

## Session Revoked

```text
Title:
Nexio session ended

Body:
This device must sign in again before synchronization can continue.
```

---

# Synchronization Message Examples

## Authentication Required

```text
Title:
Sign in to continue synchronization

Body:
Pending Nexio changes remain stored for the current owner.
```

---

## Unknown Outcome

```text
Title:
A Nexio operation needs review

Body:
Nexio is checking whether the operation completed. Do not repeat the same action.
```

---

## Conflict

```text
Title:
A record has conflicting versions

Body:
Open Nexio to review the available versions.
```

---

# Export Message Examples

## Export Ready

```text
Title:
Your Nexio Export is ready

Body:
Open Nexio to access the approved Export securely.
```

Avoid attaching complete financial files directly without separate approval.

---

## Export Expiring

```text
Title:
Your Nexio Export link will expire

Body:
Open Nexio to review the current expiration information.
```

---

# Account Deletion Message Examples

## Request Received

```text
Title:
Nexio Account deletion requested

Body:
Access is being restricted and the approved deletion process has started.
```

---

## Additional Action Required

```text
Title:
Your deletion request needs attention

Body:
Open the approved Nexio deletion status to review the required action.
```

---

## Completed

```text
Title:
Nexio Account deletion completed

Body:
The approved deletion process has finished.
```

Use only after authoritative completion.

---

# Goal Reminder Examples

## Generic

```text
Title:
Goal reminder

Body:
Open Nexio to review your Goal.
```

---

## Limited Context

```text
Title:
Review your Nexio Goal

Body:
Your scheduled Goal reminder is ready.
```

---

# Report Reminder Example

```text
Title:
Your Nexio Report is ready

Body:
Review the available financial records for the selected period.
```

Do not include exact totals by default.

---

# Product Education Example

```text
Title:
Understand Nexio synchronization

Body:
Learn the difference between Saved locally and Synchronized.
```

---

# Marketing Message Example

```text
Title:
Explore a new Nexio feature

Body:
A new optional capability is available to review.
```

It must be clearly optional and preference-controlled.

---

# Financial Content Rules

Generic financial learning content may use BRL examples such as:

```text
R$ 84,90

R$ 1.250,00
```

A Notification should not use those exact examples as if they were the user's actual financial values.

---

# Financial Judgment Prohibition

Do not send:

```text
You spent too much.

Your balance is dangerously low.

You failed your financial plan.

You should invest now.
```

---

# Behavioral Manipulation Prohibition

Do not use:

```text
Only a few minutes left to protect your streak.

Open Nexio now or lose your progress.

You have ignored your finances for too long.
```

unless a real time-bound Product state exists and the wording accurately describes it.

---

# Notification Badge Architecture

Badges may indicate:

```text
Unread messages

Action-required messages
```

Do not combine them ambiguously.

---

# Badge Count

Preferred count meaning:

```text
Number of unread owner-scoped messages
```

or:

```text
Number of unresolved required actions
```

The selected meaning must remain consistent.

---

# Badge Privacy

Badge counts should not reveal financial categories.

---

# In-Product Banner Architecture

Banner types:

```text
informational

success

warning

error

offline

security

Privacy

incident
```

---

# Banner Persistence

A banner may remain until:

- State resolves
- User dismisses where permitted
- Message expires
- A newer banner supersedes it

Required-action banners should not be dismissible without preserving another access path.

---

# Banner Stacking

Limit simultaneous banners.

Priority order:

```text
Security

Owner isolation

Data recovery

Account deletion

Synchronization

Privacy

Service incident

Product information
```

---

# Toast Architecture

Toast duration must permit reading.

Provide:

- Accessible announcement
- Sufficient duration
- Persistent alternative for important state
- No critical action available only in the Toast

---

# Email Content Architecture

Email should include:

```text
Recognizable sender

Clear subject

Purpose

Safe next action

Security warning where appropriate

Support or public link

Preference or unsubscribe control where applicable
```

---

# Email Security

Email links should:

- Use approved HTTPS domains.
- Avoid exposing secrets in visible text.
- Expire where appropriate.
- Reauthorize protected actions.
- Resist open redirects.
- Avoid embedding owner data in predictable URLs.

---

# Email Unsubscribe

Optional communication should provide an accessible unsubscribe method.

Unsubscribe must:

- Apply predictably.
- Avoid requiring Sign-in where inappropriate.
- Preserve required Security and administrative communication.
- Confirm the updated preference.

---

# Email Reply Behavior

The Product should define whether replies are:

```text
Monitored

Not monitored

Converted into Support cases
```

Do not imply monitored Support when replies are discarded.

---

# Service Incident Communication

Incident communications should use approved states:

```text
investigating

identified

monitoring

resolved
```

---

# Incident Communication Principles

- State known facts.
- Avoid speculation.
- Avoid unsupported restoration time.
- Identify affected Product area.
- Identify safe user action.
- Update when material information changes.
- Close with verified resolution.

---

# Incident Message Example

```text
Title:
Nexio synchronization is delayed

Body:
Some remote changes may take longer to confirm. Locally saved records remain available on the current device. Do not repeat uncertain financial operations.
```

Use only when verified.

---

# Incident Resolution Message

```text
Title:
Nexio synchronization restored

Body:
Remote processing has returned to the approved operating state. Nexio is reconciling pending operations.
```

Do not say every user operation is complete automatically.

---

# Public Status versus Owner-Specific Communication

Public status:

```text
Some synchronization operations are delayed.
```

Owner-specific Product message:

```text
One of your operations remains pending.
```

Do not expose owner-specific state publicly.

---

# Localization Architecture

Each template must identify:

```text
sourceLocale

availableLocales

translationStatus

materialMeaningVersion

lastReviewed
```

---

# Locale-Specific Formatting

Communication should use:

- Local Date format
- Local time format
- Localized Product terms
- Correct Currency formatting when approved detail is shown

For `pt-BR`:

```text
15/08/2026

18:30

R$ 84,90
```

---

# Translation Material Equivalence

Translations must preserve:

- Urgency
- Required action
- Privacy limitation
- Security meaning
- Deletion state
- Financial meaning
- Optionality

---

# Accessibility Architecture

Communication accessibility includes:

```text
Message wording

Notification action labels

Screen-reader order

Deep-link destination

Focus management

Large-text layout

Color-independent status

Motion behavior

Haptic behavior where applicable
```

---

# Accessible Notification Titles

Titles should identify purpose without requiring the body.

Preferred:

```text
Nexio synchronization needs attention
```

Avoid:

```text
Attention
```

---

# Action Accessibility

Actions must:

- Have unique labels.
- Remain keyboard and screen-reader accessible.
- Avoid icon-only ambiguity.
- Open an accessible destination.
- Restore focus appropriately.

---

# Haptic Feedback

Haptic feedback should:

- Follow platform conventions.
- Avoid excessive repetition.
- Not become the only indication.
- Respect system settings.

---

# Sound

Notification sounds should:

- Respect system settings.
- Avoid custom alarming sounds for noncritical messages.
- Remain optional where supported.
- Not communicate meaning without text.

---

# Reduced Motion

Animated in-Product messages must respect reduced-motion preference.

---

# Cognitive Accessibility

Messages should:

- Use one primary purpose.
- Avoid multiple unrelated actions.
- Avoid vague urgency.
- Avoid long paragraphs.
- Use familiar Product terminology.
- Explain consequences clearly.

---

# Communication Data Classification

Potential classes:

```text
public

internal

owner_private

sensitive

security_sensitive
```

---

# Public

Suitable for public incident or Product availability communication.

---

# Internal

Operational metadata not shown to users.

---

# Owner Private

Owner-specific Product status without highly sensitive content.

---

# Sensitive

Financial context, deletion state, Support case or provider data requiring protection.

---

# Security Sensitive

Authentication, token, compromise or recovery information.

---

# Communication Data Minimization

Store only what is required for:

- Eligibility
- Delivery
- Deduplication
- Audit
- Preference enforcement
- Support
- Compliance

---

# Communication Logs

Logs may include:

```text
communicationId

templateId

category

channel

state

provider response category

attempt count

timestamps

releaseVersion
```

Logs should exclude:

- Full sensitive message body where possible
- Exact financial data
- Raw device token
- Authentication secret
- Complete email content
- User-entered financial description

---

# Communication Retention

Retention should be defined for:

```text
Delivery logs

Provider references

Notification Center history

Reminder history

Preference history

Unsubscribe evidence

Security communication

Deletion communication

Marketing communication
```

---

# Account Deletion Behavior

Deletion must address:

- Device tokens
- Reminder schedules
- Notification Center messages
- Optional communication preferences
- Marketing identifiers
- Provider delivery records
- Email suppression records where legally or operationally required
- Security evidence according to approved retention

---

# Preference History

Preference history may be retained when required to prove:

- User choice
- Withdrawal
- Unsubscribe
- Required communication scope

It must remain purpose-limited.

---

# Provider Architecture

Notification providers must remain behind Adapters.

Potential provider responsibilities:

```text
Push delivery

Email delivery

Local scheduling

Web Push subscription

Delivery callbacks

Token invalidation
```

---

# Provider Adapter Contract

Potential operations:

```text
registerDevice

revokeDevice

sendMessage

scheduleMessage

cancelMessage

validateToken

processDeliveryCallback

healthCheck
```

---

# Provider Data Rules

Send only:

- Approved channel destination
- Approved template output
- Required provider metadata
- Minimal correlation identifiers

---

# Provider Failure Taxonomy

Recommended:

```text
temporary_unavailable

rate_limited

invalid_destination

expired_token

rejected_content

authentication_failed

configuration_error

unknown_outcome

permanent_failure
```

---

# Provider Health

Provider health should not be inferred only from successful API acceptance.

Monitor:

- Submission success
- Rejection
- Invalid-token rate
- Delivery delay where measurable
- Callback failure
- Configuration errors
- Regional outage

---

# Provider Exit

Removing a provider should include:

- Stop new sends
- Cancel scheduled messages
- Revoke credentials
- Remove webhooks
- Remove SDK
- Remove permissions
- Migrate or invalidate tokens
- Update policies
- Update Store declarations
- Update Help and Support

---

# Communication Experiment Boundaries

Experiments may test:

- Neutral wording
- Timing within user-defined limits
- Channel preference presentation
- Help-link placement
- Reminder frequency options

Experiments must not test:

- Whether Security communication is sent
- Whether deletion status is accurate
- Whether exact financial data is exposed
- Whether owner authorization is required
- Whether unsubscribe works
- Whether critical Accessibility is provided

---

# Communication Analytics

Where approved, events may include:

```text
communication_created

communication_suppressed

communication_sent

communication_provider_accepted

communication_opened

communication_actioned

communication_failed

preference_changed

reminder_created

reminder_snoozed

reminder_cancelled
```

---

# Prohibited Analytics Fields

```text
Exact Amount

Balance

Transaction description

Account name

Goal name

Email body

Device token

Support-case content

Assistant prompt
```

---

# Open Rate Limitation

Open rate does not establish:

- Understanding
- Trust
- Resolution
- User value
- Financial correctness

---

# Communication Outcome Metrics

Potential:

```text
safe_action_completion_rate

unknown_operation_repeat_rate

security_response_rate

preference_change_success_rate

unsubscribe_success_rate

duplicate_message_rate

quiet_hour_violation_rate

cross_owner_delivery_rate

deleted_owner_delivery_rate

sensitive_preview_exposure_rate

notification_accessibility_failure_rate
```

---

# Cross-Owner Delivery Rate

Target:

```text
Zero
```

Any confirmed cross-owner delivery is a Security and Privacy incident.

---

# False Completion Rate

Measures communications that incorrectly claim a Product process completed.

Target:

```text
Zero
```

---

# Duplicate Message Rate

Tracks repeated messages for the same communication event outside the approved repeat policy.

---

# Quiet-Hour Violation Rate

Tracks nonapproved messages delivered during quiet hours.

---

# Notification Disablement Rate

May indicate:

- Excessive frequency
- Low relevance
- Privacy concerns
- Misleading content
- Poor timing

It should not be interpreted automatically as user disengagement.

---

# Communication Complaint Rate

Complaints should be categorized by:

```text
Too frequent

Irrelevant

Sensitive content exposed

Cannot unsubscribe

Misleading

Incorrect state

Accessibility problem

Wrong owner

Unexpected marketing
```

---

# Communication Registry Architecture

Recommended files:

```text
docs/communications/
  COMMUNICATION-CATEGORY-REGISTRY.md
  NOTIFICATION-TEMPLATE-REGISTRY.md
  REMINDER-REGISTRY.md
  CHANNEL-REGISTRY.md
  COMMUNICATION-PREFERENCE-REGISTRY.md
  PROVIDER-REGISTRY.md
  COMMUNICATION-METRIC-REGISTRY.md
  COMMUNICATION-INCIDENT-RUNBOOK.md
```

---

# Channel Registry

Recommended fields:

```text
channelId

name

platforms

provider

supportedCategories

privacyCapabilities

deliveryEvidence

permissionRequirement

owner

status
```

---

# Category Registry

Recommended fields:

```text
categoryId

purpose

requiredOrOptional

allowedChannels

defaultPriority

defaultPrivacyLevel

quietHourBehavior

retention

owner
```

---

# Template Registry

Recommended fields:

```text
templateId

category

purpose

channels

sourceLocale

locales

variables

forbiddenVariables

privacyLevels

deepLink

version

status

owner

lastReviewed
```

---

# Reminder Registry

Recommended fields:

```text
reminderType

creationAuthority

scheduleAuthority

supportedRecurrence

defaultChannel

privacyLevel

quietHourBehavior

owner
```

---

# Communication Preference Registry

Recommended fields:

```text
category

channel

default

requiredOrOptional

scope

withdrawalBehavior

synchronizationBehavior

regionalRules

owner
```

---

# Part 1 Anti-Patterns

The following are prohibited:

## Notification as Product Authority

Using message delivery to determine whether a Transaction or deletion completed.

## Permission before Explanation

Requesting Android or browser permission without contextual education.

## Permission Equals Marketing Consent

Treating system permission as authorization for promotional communication.

## Exact Balance on Lock Screen

Displaying sensitive financial totals by default.

## Previous-Owner Notification

Keeping a prior owner's token or message state active after Account switching.

## Deep Link without Reauthorization

Opening protected content directly from a stale Notification.

## Direct Financial Action from Notification

Creating, confirming or deleting financial state from a Notification action.

## Open Rate as Success

Treating taps as proof of user value.

## Marketing as Security Alert

Using misleading urgency or category disguise.

## Goal Shame

Using judgmental language about progress.

## Duplicate Send after Unknown Delivery

Creating a second message without preserving communication identity.

## Local Reminder as Remote Confirmation

Implying a locally triggered reminder proves backend state.

## Read Equals Resolved

Marking a Product issue resolved because the message was opened.

## Toast-Only Critical State

Displaying an unknown outcome or deletion failure only through a transient Toast.

## Quiet-Hour Bypass for Engagement

Treating Product tips as urgent.

## Optional Communication after Withdrawal

Continuing future sends after a valid preference change.

## Deleted-Owner Marketing

Sending ordinary Product or marketing messages after deletion restriction.

## Unbounded Retry

Repeatedly sending after provider failure.

## Device Token in Logs

Recording raw push tokens in ordinary logs.

## AI-Invented Urgency

Allowing generated text to create unsupported deadlines or Security claims.

## Currency Exposure without Need

Including exact BRL Amounts in generic push content.

## Advertisement inside Product Alert

Mixing sponsored content with synchronization, Security or deletion communication.

---

# Part 1 Review Questions

## Communication Purpose

```text
Why is this message needed?

Which Product event caused it?

Is the communication required or optional?

Could the same information remain in-Product only?

Which outcome should improve?
```

---

## Channel Review

```text
Which channel is least intrusive?

Does the user have permission?

Does the message need to reach the user outside Nexio?

Can the channel expose lock-screen content?

What happens when delivery fails?
```

---

## Privacy Review

```text
Which owner-specific information appears?

Is exact financial detail necessary?

What appears on a locked device?

Does the user control preview detail?

Does deletion stop future communication?
```

---

## Owner-Isolation Review

```text
How is the recipient owner verified?

How are device tokens bound?

What happens after Account switching?

What happens after Sign-out?

Can a stale deep link expose another owner?
```

---

## Permission Review

```text
Was the benefit explained?

Can the user choose Not now?

Does refusal preserve core access?

Can the setting be changed later?

Is the permission being confused with consent?
```

---

## Reminder Review

```text
Who created the reminder?

Which time zone applies?

How does recurrence behave?

What happens during quiet hours?

Can Snooze create duplicates?

Does completion imply financial action incorrectly?
```

---

## Content Review

```text
Does the title explain the purpose?

Is the wording calm?

Is Currency or Amount exposed unnecessarily?

Is the next action clear?

Does the message claim completion accurately?
```

---

## Delivery Review

```text
Which delivery states are supported?

Does provider acceptance prove delivery?

How is unknown delivery handled?

Are retries idempotent?

When does the message expire?
```

---

## Accessibility Review

```text
Does the title stand alone?

Are actions uniquely named?

Is meaning independent from color, sound or motion?

Does the destination restore focus?

Does large text remain usable?
```

---

## Preference Review

```text
Which categories can be disabled?

Which categories are required?

Does the scope apply across devices?

Does withdrawal cancel future optional sends?

Does offline preference change stop local sending?
```

---

## Provider Review

```text
Which data is sent?

How are tokens protected?

How are invalid destinations removed?

How does provider failure degrade?

How can the provider be disabled or removed?
```

---

## Measurement Review

```text
Is the metric connected to safe user success?

Can it encourage excessive messaging?

Does it collect sensitive financial data?

Are complaints and disablement interpreted correctly?

Do guardrails stop the campaign or rollout?
```

---

# Part 1 Acceptance Criteria

The Notifications, Reminders and User Communications foundation is accepted only when:

```text
□ Communication reflects canonical Product state.

□ Notification delivery does not create financial state.

□ In-Product status remains available.

□ Financial safety outranks engagement.

□ Every message has an approved purpose.

□ Notification permission is requested contextually.

□ Operating-system permission remains distinct from consent.

□ Permission refusal preserves core Product access.

□ Required and optional communications are distinguishable.

□ Required communication remains minimal.

□ Sensitive financial information is minimized.

□ Lock-screen content uses conservative defaults.

□ Detailed previews require user control.

□ Owner isolation applies to every channel.

□ Account switching resets communication context.

□ Sign-out removes sensitive visibility.

□ Deleted owners stop receiving ordinary Product communication.

□ Notification actions cannot bypass financial confirmation.

□ Deep links reauthorize owner access.

□ Communication is accessible.

□ Message tone remains calm and nonjudgmental.

□ Reminders avoid financial shame.

□ Quiet hours and time zones are supported.

□ Urgency is evidence-based.

□ Marketing cannot masquerade as Security.

□ Advertising remains separate from Product communication.

□ Assistant content requires a communication contract.

□ Delivery is not treated as guaranteed.

□ Communication failure cannot mutate Product state.

□ Communication retries are idempotent.

□ Communication identity is stable.

□ User-created reminders retain owner and schedule.

□ Product reminders identify their source.

□ Communication preferences are discoverable.

□ Preference scope is understandable.

□ Optional withdrawal stops future eligible sends.

□ Communication history has retention and owner controls.

□ Templates are versioned.

□ AI-generated communication requires review.

□ Communication outcomes and guardrails are defined.

□ Open rate is not the primary success definition.

□ Supported channels are classified.

□ In-Product state remains the preferred status authority.

□ Toasts do not carry Critical state exclusively.

□ Push use cases are bounded.

□ Local Notifications do not imply remote state.

□ Email use cases are governed.

□ Public status content excludes owner data.

□ Account deletion status access is protected.

□ Channel capabilities are documented.

□ Communication categories are defined.

□ Security and Authentication categories are distinct.

□ Financial-operation communication remains conservative.

□ Synchronization communication uses canonical states.

□ Account deletion communication uses authoritative states.

□ Marketing communication remains optional where required.

□ Communication priority levels are defined.

□ Priority does not override Privacy.

□ Communication events have stable fields.

□ UI does not invent remote completion events.

□ Message records have stable identifiers.

□ Deduplication keys are defined.

□ Templates have identifiers, versions and owners.

□ Forbidden template variables are explicit.

□ Privacy levels are defined.

□ Generic private content is the default.

□ Notification preview controls are supported where applicable.

□ Notification Center content is owner-scoped.

□ Read and resolution states remain distinct.

□ Notification Center states are defined.

□ Notification history retention depends on category.

□ Reminder types are defined.

□ Reminder schedules preserve time zones.

□ Daylight-saving behavior is defined.

□ Time-zone changes do not duplicate reminders.

□ Monthly recurrence edge cases are defined.

□ Reminder completion does not imply financial completion.

□ Snooze preserves reminder identity.

□ Goal reminders remain neutral.

□ Communication preference groups are defined.

□ Preference records identify category and channel.

□ Owner-global and device-specific settings are distinguishable.

□ Required communication limitations are explained.

□ Optional defaults follow approved Privacy requirements.

□ Preference Save failures preserve prior state.

□ Quiet-hour behavior is category-specific.

□ Only approved Critical communication may override quiet hours.

□ Frequency caps are supported.

□ Duplicate suppression considers unresolved events.

□ Messages expire when actions become invalid.

□ Expired deep links revalidate current state.

□ Local, remote and hybrid scheduling are distinguished.

□ Hybrid scheduling prevents duplicate delivery.

□ Delivery states are explicit.

□ Provider acceptance is not treated automatically as delivery.

□ Opened does not imply actioned.

□ Unknown delivery preserves communication identity.

□ Retry rules consider preference and owner state.

□ Retry stops after deletion, unsubscribe or expiration.

□ Permission states are explicit.

□ Permission requests have entry conditions.

□ Denial does not trigger immediate repeated prompts.

□ Revocation updates channel availability.

□ Push tokens are sensitive and owner-bound.

□ Tokens are revoked or revalidated after Account changes.

□ Multi-device message behavior is defined.

□ Message content follows title, purpose and safe-action rules.

□ Security examples avoid unsupported detail.

□ Synchronization examples prohibit repeating uncertain actions.

□ Export messages avoid sensitive file exposure.

□ Account deletion completion wording is authoritative.

□ Financial judgment is prohibited.

□ Manipulative engagement wording is prohibited.

□ Badge meaning is consistent.

□ Banner priority is defined.

□ Toast duration and persistent alternatives are accessible.

□ Email sender and purpose are clear.

□ Email links use approved secure destinations.

□ Optional email supports unsubscribe.

□ Incident communication uses approved states.

□ Incident communication avoids unsupported restoration times.

□ Public and owner-specific incident messages remain separate.

□ Templates support localization and material equivalence.

□ pt-BR content uses localized Date, time and Currency formatting.

□ Communication Accessibility includes destination behavior.

□ Sound, haptic and motion are not exclusive indicators.

□ Communication data classification is defined.

□ Communication logs exclude sensitive payloads.

□ Retention is defined by communication category.

□ Account deletion processes tokens, reminders and message history.

□ Providers remain behind Adapters.

□ Provider error taxonomy is defined.

□ Provider health includes more than API acceptance.

□ Provider exit includes token, SDK and policy cleanup.

□ Experiments cannot vary mandatory safety behavior.

□ Communication Analytics excludes exact financial data.

□ Cross-owner delivery target is zero.

□ False completion target is zero.

□ Complaint categories are defined.

□ Communication Registries are defined.

□ Part 1 communication anti-patterns are prohibited.
```

---

# Communication Constitutional Rule

Every Nexio Notification, reminder, email, banner, Toast, deep link, incident update and user communication must answer:

```text
Is this message based on authoritative Product state, addressed to the correct owner, delivered through the least intrusive approved channel, limited to necessary data, accessible, preference-aware, nonmanipulative and safe when delivery is delayed, duplicated, denied or never completed?
```

When the answer is uncertain, prefer the action that:

- Keeps the state in-Product.
- Suppresses the external message.
- Uses generic private content.
- Revalidates the owner.
- Revalidates the Product state.
- Preserves communication identity.
- Avoids Retry.
- Honors quiet hours.
- Honors withdrawal.
- Removes exact financial details.
- Removes urgency.
- Requires technical and Privacy review.
- Disables the provider.
- Blocks the communication.

A message is not successful because it was sent, delivered or opened.

It is successful only when it accurately communicates a real Product state, helps the correct user act safely and preserves financial trust, Privacy, Accessibility and user control.

---
---

# Practical Communication Delivery Architecture

This section translates the communication principles into operational Product flows.

It defines how Nexio should:

```text
Create a communication event

Evaluate recipient eligibility

Apply owner isolation

Read communication preferences

Select a channel

Apply privacy level

Render a template

Schedule or queue delivery

Send through a provider

Process provider responses

Deduplicate retries

Handle unknown delivery

Open safe deep links

Synchronize read and resolution state

Cancel obsolete communication

Measure the final Product outcome
```

The communication pipeline must remain separate from canonical financial mutation.

---

# End-to-End Communication Flow

Recommended sequence:

```text
Authoritative Product event

↓

Communication-policy evaluation

↓

Owner and recipient validation

↓

Category eligibility

↓

Preference evaluation

↓

Channel selection

↓

Privacy-level selection

↓

Template resolution

↓

Localization

↓

Deduplication

↓

Quiet-hour and frequency evaluation

↓

Scheduling or immediate queueing

↓

Provider Adapter

↓

Provider response classification

↓

Delivery-state update

↓

In-Product history update

↓

Safe deep-link action

↓

Canonical Product revalidation

↓

Resolution or expiration
```

---

# Communication Command Boundary

Communication creation should use an explicit Application command or service.

Potential:

```text
CreateCommunication

ScheduleReminder

CancelCommunication

ProcessCommunicationDelivery

OpenCommunicationDestination

MarkCommunicationRead

ResolveCommunicationFromProductState
```

UI code should not call a push or email provider directly.

---

# Communication Creation Contract

Potential input:

```text
eventId

eventType

ownerId

category

priority

entityType

entityId

operationId

requiredAction

allowedChannels

expiresAt

requestedLocale

source
```

---

# Communication Creation Output

Potential:

```text
communicationId

eligibilityState

selectedChannels

templateId

templateVersion

privacyLevel

scheduledAt

suppressionReason

deduplicationKey
```

---

# Communication Creation Validation

Before creating a communication:

```text
□ Event exists.

□ Event source is authoritative.

□ Owner exists.

□ Owner is eligible.

□ Category is registered.

□ Purpose is approved.

□ Required variables are available.

□ Forbidden variables are absent.

□ Event is not expired.

□ A valid template exists.

□ Applicable locale exists or safe fallback is defined.
```

---

# Communication Eligibility Architecture

Recommended eligibility states:

```text
eligible

suppressed_preference

suppressed_owner_state

suppressed_duplicate

suppressed_quiet_hours

suppressed_frequency

suppressed_expired

suppressed_unsupported_channel

suppressed_invalid_template

suppressed_missing_authority

requires_review
```

---

# Owner Eligibility Evaluation

Communication should be suppressed when:

- Owner does not exist.
- Owner is deleted or restricted for ordinary Product messaging.
- Owner relationship cannot be proven.
- Authentication identity no longer maps to the owner.
- Communication belongs to another owner.
- The target entity is no longer owner-authorized.
- The owner is under a state that prohibits the category.

---

# Deleted Owner Eligibility

After deletion restriction:

Allowed categories may include only:

```text
Account_deletion

required_security

required_legal_or_administrative

active_Support_case
```

Ordinary categories must be suppressed:

```text
Goal_reminder

Report

Product_education

Product_update

marketing

Assistant

Advertising
```

---

# Communication Policy Evaluation

Every event should resolve a policy containing:

```text
category

required_or_optional

allowed_channels

default_priority

default_privacy_level

preference_scope

quiet_hour_policy

frequency_policy

expiration_policy

deep_link_policy

retention_policy

deleted_owner_policy
```

---

# Policy Resolution Failure

When no valid policy exists:

```text
Do not send the external message.

Record the configuration gap.

Preserve the Product state in-Product.

Escalate when the category is Critical.
```

---

# Channel Selection Flow

Recommended order:

```text
1. Determine whether external communication is necessary.

2. Prefer in-Product state when the application is active.

3. Check approved channel availability.

4. Check owner preference.

5. Check device permission.

6. Check provider health.

7. Check content privacy.

8. Check urgency.

9. Select the least intrusive valid channel.

10. Record why other channels were not selected.
```

---

# External Communication Necessity

External communication may be unnecessary when:

- The user is actively viewing the relevant screen.
- The state is already clearly visible.
- No urgent action exists.
- The user recently acted.
- The message is duplicate education.
- The Product can safely wait until the next application open.

---

# Multi-Channel Delivery

A message may use more than one channel only when justified.

Examples:

```text
Security:
In-Product + Push + Email

Account deletion:
In-Product + Email

User-created reminder:
Local Notification + In-Product history
```

---

# Multi-Channel Duplication Control

When using multiple channels:

- Preserve one event identity.
- Use one communication group.
- Record each channel delivery separately.
- Avoid sending identical repeated content unnecessarily.
- Allow one channel action to resolve or supersede others.
- Preserve category-specific evidence.

---

# Communication Group Record

Potential:

```text
communicationGroupId

eventId

ownerId

category

channelCommunications

resolutionState

createdAt

resolvedAt
```

---

# Preference Evaluation Flow

Recommended:

```text
Read current owner-global preference.

Read current device-specific preference.

Read channel-specific preference.

Read feature-specific preference.

Read current permission state.

Read current Privacy level.

Apply required-category rules.

Apply regional rules.

Determine final eligibility.
```

---

# Preference Precedence

Recommended order:

```text
Mandatory Product or legal rule

↓

Owner-global category choice

↓

Channel-specific choice

↓

Feature-specific choice

↓

Device-specific capability or privacy choice

↓

Temporary session suppression
```

A lower-level setting must not re-enable a category disabled at a higher user-controlled scope.

---

# Preference Synchronization Architecture

Communication preferences should synchronize through canonical owner-scoped persistence.

Potential states:

```text
local_current

local_pending

remote_confirmed

conflict

authentication_required

failed
```

---

# Preference Local Save

After a successful local preference commit:

```text
The current device must honor the new preference immediately where technically possible.
```

For example:

```text
Disable Goal reminders
```

should stop local Goal-reminder scheduling immediately.

---

# Preference Remote Synchronization

Remote confirmation determines cross-device behavior.

While pending:

- Current device uses the new preference.
- Remote send systems should receive the change as soon as possible.
- UI should show the pending state when material.
- Previously queued optional messages should be cancelled where possible.

---

# Preference Conflict

Potential Conflict:

```text
Device A enables Product updates.

Device B disables Product updates before synchronization completes.
```

Conflict behavior must follow an explicit policy.

For optional communication, a safer temporary rule may be:

```text
Prefer disabled until resolved.
```

The final rule requires Product and Privacy approval.

---

# Communication Preference Confirmation

Example:

```text
Product update notifications are disabled on this device and waiting to synchronize across your Nexio Account.
```

---

# Preference Rollback Failure

When remote persistence fails permanently:

```text
Keep the safer local behavior.

Inform the user that cross-device synchronization did not complete.

Do not silently restore optional messaging.
```

---

# Android Push Notification Architecture

Android Push should use the approved provider through an Adapter.

The implementation must account for:

```text
Runtime Notification permission

Notification channels

Device token lifecycle

Application foreground and background state

Process death

Deep links

Back-stack behavior

Lock-screen privacy

Multiple owners

Application upgrade

Provider token rotation
```

---

# Android Notification Channel Architecture

Android notification channels may include:

```text
Security

Account and Authentication

Synchronization and Recovery

User Reminders

Goals and Reports

Product Updates

Marketing
```

Actual channel design should remain limited and understandable.

---

# Android Channel Importance

Potential mapping:

```text
Security:
High where justified

Synchronization and Recovery:
Default or High according to actual urgency

User Reminders:
Default

Goals and Reports:
Default or Low

Product Updates:
Low

Marketing:
Low
```

Do not classify Product education or marketing as high importance.

---

# Android Channel User Control

Android users may change channel behavior in system settings.

Nexio should:

- Detect current availability where possible.
- Explain channel state inside Settings.
- Avoid claiming a channel is enabled when system settings block it.
- Preserve in-Product communication.

---

# Android Permission Flow

Recommended sequence:

```text
User reaches a relevant Notification feature.

↓

Nexio explains purpose and privacy.

↓

User chooses Enable Notifications.

↓

System permission prompt appears.

↓

Result is stored as platform capability state.

↓

Category preferences remain separately controlled.
```

---

# Android Permission Request Example

```text
Receive Nexio reminders

Nexio can notify you about reminders you create and approved Account states.

Notification content may appear on your lock screen according to your device settings.

You can continue using Nexio without Notifications.
```

Actions:

```text
Enable Notifications

Not now
```

---

# Android Permission Denied

```text
Notifications remain disabled

You can continue using Nexio.

Enable them later in Nexio Settings or Android system settings.
```

---

# Android System-Blocked State

When the system blocks further prompts:

```text
Notifications are blocked in Android settings.

Open system settings only when you choose to enable them.
```

Do not repeatedly redirect without user intent.

---

# Android Device Token Registration

Recommended flow:

```text
Permission granted

↓

Provider token acquired

↓

Current Authentication verified

↓

Current owner verified

↓

Device record created or updated

↓

Token bound to owner and device

↓

Provider registration confirmed

↓

Channel becomes eligible
```

---

# Android Token Registration Failure

```text
Push Notifications are unavailable on this device right now.

In-Product messages remain available.

Nexio will not report Notification setup as complete.
```

---

# Android Token Rotation

When the provider rotates a token:

- Preserve the device identity.
- Replace the prior token reference.
- Invalidate the old token.
- Avoid duplicate active tokens.
- Preserve owner binding.
- Avoid logging either raw token.

---

# Android Account Switching Flow

Before opening the new owner:

```text
Pause Notification registration updates.

Revoke or detach prior-owner token association.

Cancel prior-owner local schedules.

Clear prior-owner Notification Center state from memory.

Validate new owner.

Bind token to the new owner only when policy permits.

Rebuild local reminders for the new owner.

Resume communication services.
```

---

# Android Sign-Out Flow

On Sign-out:

- Remove protected in-memory message content.
- Cancel prior-owner sensitive local Notifications where possible.
- Detach the device token from ordinary owner communication.
- Preserve generic Authentication or Security messages only where approved.
- Require Authentication on every deep link.

---

# Android Account Deletion Flow

When deletion starts:

- Stop ordinary categories.
- Cancel scheduled local reminders.
- Revoke ordinary push subscriptions.
- Retain only approved deletion or Security communication.
- Remove token association after the required final communication policy.
- Ensure deleted-owner messages cannot reappear after reinstall or token rotation.

---

# Android Foreground Notification Behavior

When Nexio is open on the relevant screen:

Potential behavior:

```text
Update in-Product state.

Avoid duplicate system Notification.

Optionally add the item to Notification Center.

Use an accessible banner only when action is required.
```

---

# Android Background Behavior

When Nexio is backgrounded:

- Use approved system Notification.
- Keep content generic according to privacy setting.
- Include a safe deep link.
- Preserve event identity.
- Respect category and quiet hours.

---

# Android Process Death

Notification opening after process death should:

```text
Start the application safely.

Initialize configuration.

Restore Authentication where valid.

Open the correct owner store.

Validate the message event.

Validate the current entity state.

Navigate only after authorization.

Display a safe fallback when the destination is stale.
```

---

# Android Notification Action Architecture

Potential approved actions:

```text
Open Nexio

Review

Snooze

Dismiss

Mark reminder complete
```

---

# Android Action Prohibitions

Do not allow direct:

```text
Save Transaction

Confirm Transfer

Delete Account

Resolve Conflict

Approve Assistant action

Restore record
```

from the system Notification.

---

# Android Back Stack

Opening a Notification should create a predictable Back path.

Potential:

```text
Notification destination

↓

Relevant Product section

↓

Dashboard
```

Avoid:

- Exiting unexpectedly
- Returning to another owner's state
- Reopening the same action repeatedly
- Creating duplicate Activity instances

---

# Android Lock-Screen Privacy

Default:

```text
private_generic
```

Potential message:

```text
Nexio needs your attention.
```

Detailed previews require explicit user control.

---

# Android Notification Icon and Branding

The Notification should use:

- Approved small icon
- Approved application name
- Platform-compatible presentation
- No misleading provider branding
- No Advertisement styling in Product alerts

---

# Android Notification Upgrade Testing

After application update, verify:

- Existing channel settings remain understandable.
- Token remains valid or rotates safely.
- Scheduled reminders remain correct.
- Owner isolation remains intact.
- Deep links target current routes.
- Removed categories stop sending.
- New permission behavior is accurate.

---

# Web Push Architecture

Web Push should remain optional and browser-dependent.

It requires:

```text
Secure HTTPS context

Supported browser

Service Worker

Push subscription

Current Authentication

Owner binding

Permission

Approved provider or Web Push service

Safe deep links
```

---

# Web Push Eligibility

Web Push should be unavailable when:

- Browser lacks support.
- Page is not in a secure context.
- Service Worker registration failed.
- Permission is denied.
- Owner is signed out.
- Subscription cannot be owner-bound.
- Provider configuration is invalid.

---

# Web Push Permission Flow

Recommended:

```text
User selects a Web Notification capability.

↓

Nexio explains use and privacy.

↓

User chooses Enable.

↓

Browser permission prompt appears.

↓

Subscription is created.

↓

Current owner is verified.

↓

Subscription is stored through the approved backend.
```

---

# Browser Permission Denial

```text
Browser Notifications remain disabled

You can continue using Nexio.

The browser may require you to change this permission through site settings.
```

---

# Service Worker Communication Boundary

The Service Worker may:

- Receive an approved payload.
- Render a privacy-safe Notification.
- Handle Notification clicks.
- Open or focus the approved Nexio origin.

It must not:

- Calculate financial totals.
- Read unrelated private cache data.
- Create financial state.
- Resolve owner authorization independently.
- Treat cached owner data as current authority.

---

# Web Push Subscription Record

Potential:

```text
subscriptionId

ownerId

browserInstallationId

endpointReference

keyReference

status

createdAt

lastValidatedAt

revokedAt

ProductVersion
```

Sensitive subscription material must remain protected.

---

# Web Sign-Out Handling

On Sign-out:

- Detach or revoke the owner subscription where appropriate.
- Clear protected in-memory content.
- Keep public Service Worker assets only.
- Require reauthentication on click.
- Avoid future owner-specific messages.

---

# Web Multi-Tab Coordination

Multiple tabs should coordinate:

- Permission state
- Owner change
- Preference change
- Read state
- Message opening
- Subscription refresh

Avoid duplicate prompts or duplicate subscription creation.

---

# Web Notification Click Flow

Recommended:

```text
Notification click

↓

Validate approved origin

↓

Focus existing Nexio tab or open a new tab

↓

Initialize application

↓

Authenticate

↓

Validate current owner

↓

Validate event and entity

↓

Navigate to current safe destination

↓

Mark opened

↓

Leave resolution to canonical Product state
```

---

# Browser Cache Safety

Web Push payloads and Notification data should not be stored in a shared cache containing unnecessary owner-sensitive details.

---

# Local Reminder Creation Flow

User-created local reminders should follow:

```text
Open reminder creation

↓

Choose purpose

↓

Enter a neutral title

↓

Choose Date and time

↓

Choose time zone behavior

↓

Choose recurrence

↓

Choose channel

↓

Choose privacy level

↓

Review

↓

Save canonical reminder

↓

Schedule local delivery

↓

Confirm state
```

---

# Reminder Creation Screen

Recommended title:

```text
Create reminder
```

---

# Reminder Purpose Selection

Potential:

```text
Review financial records

Review a Goal

Review a Report

Custom reminder
```

---

# Reminder Title Guidance

```text
Use a short title that is safe to display on your device.

Avoid entering passwords, Account numbers or sensitive financial details.
```

---

# Reminder Date and Time

The interface should show:

```text
Date

Time

Time zone

Recurrence
```

---

# Reminder Privacy Preview

Before Save:

```text
Preview what may appear in the Notification.
```

Example private preview:

```text
Nexio reminder

Open Nexio to review your scheduled task.
```

---

# Reminder Review Screen

Show:

```text
Title

Schedule

Time zone

Recurrence

Channel

Privacy level

Quiet-hour behavior
```

---

# Reminder Save Completion

Completion requires:

- Canonical reminder record committed.
- Owner binding confirmed.
- Schedule validated.
- Local or remote scheduler acknowledged according to architecture.
- The UI communicates whether delivery setup is complete.

---

# Reminder Saved Locally

```text
Reminder saved on this device

It will use this device's local Notification system.
```

---

# Reminder Synchronized

```text
Reminder synchronized

The reminder is available through the approved Nexio reminder service.
```

---

# Reminder Delivery Blocked

```text
Reminder created, but Notifications are disabled

Enable the approved channel or use the in-Product reminder list.
```

---

# Recurring Reminder Flow

A recurring reminder must define:

```text
Start

Recurrence

End or no end

Time zone

Short-month behavior

Quiet-hour behavior

Paused state

Next trigger
```

---

# Daily Reminder

Preserve the intended local time.

---

# Weekly Reminder

Store the intended weekday and local time.

---

# Monthly Reminder

The UI must explain the short-month policy.

Example:

```text
When a month does not have day 31, remind me on the last day of that month.
```

---

# Recurrence End Options

Potential:

```text
Never

On Date

After number of occurrences
```

Only show implemented options.

---

# Reminder Edit Flow

Editing should:

- Preserve reminder identity.
- Cancel the old future schedule safely.
- Create the new schedule once.
- Preserve history where appropriate.
- Avoid sending both old and new occurrences.

---

# Reminder Pause Flow

```text
Pause reminder
```

should stop future triggers while retaining the reminder definition.

---

# Reminder Resume Flow

On resume:

- Recalculate next valid trigger.
- Respect current time zone.
- Avoid sending missed occurrences automatically unless explicitly approved.
- Respect current quiet hours and preferences.

---

# Reminder Snooze Flow

Approved snooze options may include:

```text
Later today

Tomorrow

Custom
```

Snooze should create a bounded temporary trigger linked to the original reminder.

---

# Reminder Completion Flow

Marking complete may:

- Close the current occurrence.
- Preserve recurring schedule.
- Update in-Product history.

It must not create or modify a financial record.

---

# Missed Reminder Behavior

A missed reminder may be:

```text
shown in Notification Center

delivered when the device becomes available

skipped

marked missed
```

Behavior must be explicit by reminder type.

Do not send a burst of old reminders after a long offline period.

---

# Reminder Burst Suppression

After device restart or reconnection:

- Group similar missed reminders.
- Apply a maximum backlog.
- Suppress expired reminders.
- Preserve the latest useful reminder.
- Avoid multiple lock-screen interruptions.

---

# Goal Reminder Flow

Goal reminders should be configured from the Goal or communication settings.

Potential options:

```text
Weekly review

Monthly review

Custom Date

No reminder
```

---

# Goal Reminder Content

Default:

```text
Review your Nexio Goal
```

Body:

```text
Your scheduled Goal reminder is ready.
```

Do not reveal exact Goal values by default.

---

# Goal Reminder Deep Link

Opening should:

- Authenticate.
- Validate owner.
- Validate Goal existence.
- Open the current Goal.
- Display a fallback when the Goal was deleted or archived.

---

# Report Reminder Flow

Potential:

```text
Choose Report type

Choose schedule

Choose scope

Choose privacy level

Review

Save
```

A reminder that a Report is available must not claim the underlying data is complete when synchronization remains pending.

---

# Report Ready Message

```text
Your Nexio Report is ready to review

Available results reflect the records currently included in the selected scope.
```

---

# Notification Center Detailed Architecture

The Notification Center should provide:

```text
Owner-scoped message list

Category filters

Unread filter

Action-required filter

Timestamp

Current status

Safe destination

Read state

Resolution state

Expiration
```

---

# Notification Center Entry Point

Potential:

```text
Header Notification icon

Mobile navigation item

Settings and Notifications

Dashboard action-required card
```

---

# Notification Center Empty States

## True Empty

```text
No Notifications

Important Nexio messages and reminders will appear here.
```

---

## Filtered Empty

```text
No messages match this filter.
```

---

## Offline Partial

```text
Only locally available messages are shown.

Reconnect to retrieve current remote communication history.
```

---

## Error

```text
We could not load all messages.

Available local messages have not been deleted.
```

---

# Notification Center Sorting

Recommended:

```text
Action required first

Then priority

Then newest relevant event
```

Avoid allowing low-priority Product education to hide unresolved financial or Security state.

---

# Notification Center Grouping

Potential grouping:

```text
Today

Earlier

Security

Synchronization

Reminders

Product updates
```

Grouping must preserve action-required visibility.

---

# Message Detail View

Should show:

```text
Title

Full approved message

Category

Created time

Current Product status

Primary safe action

Help link

Dismiss or archive where applicable
```

---

# Notification Center Read Flow

A message becomes read when the user intentionally opens it or its detail.

Merely rendering a list item should not necessarily mark it read.

---

# Mark All as Read

Allowed only for read state.

It must not:

- Resolve actions
- Dismiss Security requirements
- Complete deletion
- Resolve Conflicts

---

# Notification Center Resolution Flow

Resolution should generally follow canonical Product state.

Examples:

```text
Conflict resolved by Conflict command

↓

Related communication becomes resolved
```

```text
Export expires

↓

Related communication becomes expired
```

---

# Notification Dismissal

Dismissal may be allowed for:

- Product tips
- Completed reminders
- Low-priority updates

Dismissal should not remove the underlying required Product state.

---

# Message Withdrawal

Nexio may withdraw a message when:

- Content was incorrect.
- State was misclassified.
- A security concern exists.
- A newer message supersedes it.
- The event was invalidated.

---

# Withdrawal Communication

When material:

```text
A previous Nexio message is no longer current.

Open Nexio to review the latest status.
```

---

# Deep-Link Architecture

Deep links may originate from:

```text
Push Notification

Email

Notification Center

Public Help

Account deletion status

Support message

Web link

Android App Link
```

---

# Deep-Link Contract

Potential fields:

```text
deepLinkType

targetRoute

entityType

entityId

eventId

ownerHint

expiresAt

requiredAuthenticationLevel

fallbackRoute

minimumProductVersion
```

---

# Owner Hint Is Not Authorization

A deep-link owner hint may help route selection.

It must not grant access.

Authorization must derive from current Authentication and owner state.

---

# Deep-Link Validation Flow

```text
Parse approved URL.

↓

Validate origin or App Link.

↓

Validate supported deep-link type.

↓

Validate expiration.

↓

Initialize Product.

↓

Validate Authentication.

↓

Validate current owner.

↓

Validate entity ownership.

↓

Validate entity existence.

↓

Validate current state.

↓

Validate feature availability.

↓

Navigate or use safe fallback.
```

---

# Deep-Link Expiration

Time-sensitive links may expire.

Examples:

- Authentication link
- Password reset
- Export link
- Account deletion verification
- Temporary Support action

---

# Stale Deep-Link Fallback

```text
This message is no longer current.

Open the related Nexio section to review the latest state.
```

---

# Deep Link to Deleted Entity

```text
This record is no longer available.
```

Provide current list or Help destination.

---

# Deep Link to Wrong Owner

```text
This item is not available for the current Nexio Account.
```

Do not reveal the other owner's identity or entity details.

---

# Deep Link Requiring Higher Authentication

```text
Confirm your identity to continue.
```

Examples:

- Account deletion
- Security settings
- Sensitive Export
- Session management

---

# Deep-Link Loop Prevention

Prevent:

- Reopening the same Notification repeatedly
- Authentication callback loops
- Android Back reopening the deep link
- Multiple-tab routing loops
- Repeated provider callback processing

---

# Communication Action Architecture

Action types:

```text
open

review

snooze

dismiss

mark_read

mark_reminder_complete

open_help

open_Support
```

---

# Action Validation

Before action execution:

```text
□ Communication exists.

□ Owner is current.

□ Communication is not expired.

□ Action is registered.

□ Product state still permits the action.

□ Required Authentication exists.

□ Action is idempotent where applicable.
```

---

# Open Action

Opens the current verified Product destination.

---

# Review Action

Opens a screen requiring user review.

It does not complete the underlying process.

---

# Snooze Action

Valid only for reminders supporting Snooze.

---

# Dismiss Action

Affects the communication presentation only unless the Product contract explicitly defines another behavior.

---

# Mark Reminder Complete

Affects reminder state only.

It must not alter a Goal Amount, Account balance or Transaction.

---

# Open Help Action

Opens current applicable Help content.

---

# Open Support Action

Opens the approved Support entry point, preserving safe context such as:

```text
communicationId

error category

approximate event time

Product version
```

Do not include financial payloads automatically.

---

# Communication Queue Architecture

External messages should use a durable queue when appropriate.

Potential queue record:

```text
queueItemId

communicationId

ownerId

channel

provider

state

attemptCount

nextAttemptAt

expiresAt

deduplicationKey

lastFailureCategory

createdAt

updatedAt
```

---

# Queue State Model

Recommended:

```text
pending

leased

sending

accepted

retry_wait

blocked_preference

blocked_owner

blocked_provider

expired

cancelled

failed_final

unknown_outcome
```

---

# Queue Leasing

Workers should lease items for bounded processing.

The lease prevents two workers from sending the same message simultaneously.

---

# Lease Expiration

When a worker fails:

- The lease expires.
- The same communication identity remains.
- The next worker reconciles provider state where possible.
- A new communication is not created.

---

# Queue Eligibility Recheck

Before every send attempt, recheck:

```text
Owner state

Preference

Permission

Expiration

Deduplication

Entity relevance

Provider availability

Quiet hours where applicable
```

---

# Queue Cancellation

Cancel queued optional messages when:

- Preference disabled
- Account deleted
- Reminder cancelled
- Event resolved
- Message expired
- Template withdrawn
- Provider disabled
- Product capability removed

---

# Queue Backpressure

When provider capacity is limited:

Priority order:

```text
Security

Account deletion

Recovery

Unknown financial outcome

Authentication

User-created reminders

Reports

Product education

Marketing
```

---

# Queue Overload Behavior

Under overload:

- Suppress low-priority messages.
- Preserve Critical communication.
- Avoid repeated retries.
- Expose provider degradation operationally.
- Preserve in-Product states.
- Avoid claiming successful external delivery.

---

# Deduplication Architecture

Deduplication should occur:

```text
Before record creation

Before queueing

Before provider submission

After provider timeout reconciliation

During multi-channel resolution
```

---

# Deduplication Scope

Potential key:

```text
ownerId

eventId

category

channel

templateVersion

repeatWindow
```

---

# Event-Level Deduplication

One Product event should normally produce one active communication per approved channel.

---

# State-Change Communication

A new message may be valid when the state materially changes.

Example:

```text
Deletion requested

↓

Provider cleanup pending

↓

Deletion completed
```

Each state uses a distinct event or state version.

---

# Reminder Recurrence Deduplication

Each occurrence should have:

```text
reminderId

occurrenceId

scheduledTime
```

Retry must preserve `occurrenceId`.

---

# Multi-Device Deduplication

When one event targets multiple devices, the Product should define whether:

- Every device receives it.
- Only one device receives it.
- The first opened device suppresses remaining eligible sends.
- Every device receives it, but read state synchronizes.

---

# Unknown Provider Result

After timeout:

```text
Do not create a second communication.

Record unknown_outcome.

Query provider status where supported.

Wait for callback where applicable.

Retry only under the approved idempotent provider contract.
```

---

# Retry Architecture

Potential retry schedule:

```text
Immediate bounded retry for transient connection failure

Short backoff

Longer backoff

Final failure or expiration
```

The exact schedule should depend on category and expiration.

---

# Retry Backoff

Recommended properties:

- Bounded
- Jittered
- Category-aware
- Provider-aware
- Expiration-aware
- Owner-aware

---

# Retry Attempt Review

Before each Retry:

```text
Is the communication still needed?

Is the owner still eligible?

Is the preference still enabled?

Is the channel still available?

Did the provider already accept it?

Has the message expired?

Has a newer message superseded it?
```

---

# Retry Failure Classification

## Temporary Unavailable

Retry according to backoff.

## Rate Limited

Respect provider limit and Retry guidance.

## Invalid Destination

Disable destination and stop Retry.

## Expired Token

Invalidate token and attempt re-registration separately.

## Rejected Content

Stop and open a template or provider defect.

## Authentication Failed

Stop provider sends and escalate configuration.

## Configuration Error

Stop the affected provider or channel.

## Unknown Outcome

Reconcile before Retry.

## Permanent Failure

Stop and preserve in-Product state.

---

# Communication Failure User Experience

External delivery failure should usually not produce another external message through the same failed channel.

Instead:

- Show in-Product status.
- Use an alternate approved channel only when justified.
- Preserve the communication history.
- Avoid repeated provider pressure.

---

# Failed User Reminder

In-Product example:

```text
Reminder delivery failed

The reminder remains visible in Nexio.

Review Notification permission and device settings.
```

---

# Failed Critical Communication

For a Critical category:

- Attempt approved alternate channel.
- Open operational alert.
- Preserve evidence.
- Maintain in-Product status.
- Escalate according to the runbook.

---

# Communication Resolution Architecture

A communication resolves when:

```text
The underlying Product state resolves

or

The user completes the approved reminder action

or

The communication expires or is superseded
```

---

# Financial-State Resolution

Example:

```text
Unknown Transaction outcome

↓

Remote operation reconciled

↓

Canonical Transaction state updated

↓

Communication marked resolved

↓

Optional resolution message created according to policy
```

---

# Resolution Message Governance

Do not send a resolution message for every low-value state change.

A resolution message is useful when:

- The prior state was Critical or High.
- The user was asked to wait.
- The operation was uncertain.
- The user needs confirmation before continuing.

---

# Unknown Transaction Resolution Example

```text
Title:
Transaction result confirmed

Body:
Nexio completed reconciliation. Open the Transaction to review its current state.
```

Avoid exposing exact Amount by default.

---

# Incomplete Transfer Resolution Example

```text
Title:
Transfer review completed

Body:
Nexio confirmed the current source and destination effects. Open the Transfer to review.
```

---

# Incident Communication Architecture

Incident communications may operate at:

```text
Public service level

Owner-specific Product level

Internal Support level

Internal Operations level
```

---

# Incident Trigger Sources

Potential:

- Monitoring
- Provider status
- Support trend
- Security detection
- Migration failure
- Synchronization degradation
- Android crash increase
- Public Help outage

---

# Incident Communication Eligibility

Notify users when:

- They are likely affected.
- Action is required.
- The state materially affects Product use.
- Communication reduces risk.
- The message is approved by incident command.

Avoid broad communication when no user action or useful awareness exists.

---

# Incident Communication States

```text
investigating

identified

mitigating

monitoring

resolved

post_incident_action_required
```

---

# Investigating Message

```text
Nexio is investigating delayed synchronization.

Locally saved records remain available on the current device.

Do not repeat operations with an uncertain result.
```

Use only when verified.

---

# Identified Message

```text
Nexio identified a problem affecting remote synchronization.

Pending local changes remain preserved.

A correction is in progress.
```

---

# Monitoring Message

```text
Remote synchronization has resumed.

Nexio is monitoring recovery and reconciling pending operations.
```

---

# Resolved Message

```text
The synchronization incident is resolved.

Open Nexio to review the current status of any previously pending operation.
```

---

# Post-Incident User Action

When users must verify records:

```text
Review Transactions created during the affected period.

Do not delete or recreate a record only because its status changed during recovery.
```

---

# Incident Notification Suppression

Avoid sending every incident-status update through Push.

Potential approach:

```text
Push:
Initial material alert and required user action

In-Product or status page:
Detailed ongoing updates

Push:
Final resolution only when useful
```

---

# Incident Communication Approval

Material incident messages require:

- Incident owner
- Product owner
- Operations review
- Security or Privacy review where relevant
- Content review
- Localization review where needed

---

# Incident Communication Correction

When an incident message is wrong:

- Withdraw or supersede it.
- Publish corrected facts.
- Notify Support.
- Preserve audit evidence.
- Assess whether users took harmful action.

---

# Security Communication Flow

Recommended sequence:

```text
Security event detected

↓

Event authenticity verified

↓

Owner identified

↓

Severity assigned

↓

Required channels selected

↓

Generic safe content rendered

↓

Push and/or email sent

↓

In-Product Security activity updated

↓

User opens verified Security destination

↓

Recent Authentication required where appropriate

↓

User reviews sessions or takes action
```

---

# Security Message Deep Link

Should lead to:

```text
Security activity

Active sessions

Password change

Account recovery

Support
```

depending on the event.

---

# Security Location Content

Do not state a precise location unless:

- Source is reliable.
- Precision is appropriate.
- Privacy review passes.
- The content clarifies uncertainty.

Potential:

```text
Approximate region
```

rather than a precise address.

---

# Authentication Email Flow

Authentication email should contain:

- Nexio identity
- Requested action
- Link expiration where applicable
- Warning not to share the link
- Support path
- No financial content

---

# Password Reset Email

```text
A password reset was requested for your Nexio Account.

Use the approved link to continue.

Do not forward or share this message.
```

---

# Magic Link Email

```text
Use this temporary link to sign in to Nexio.

Do not share the link.

If you did not request it, you can ignore this message and review your Account Security.
```

---

# Account Deletion Communication Flow

Recommended lifecycle:

```text
Deletion requested

↓

Access restricted

↓

Product data processing

↓

Attachment processing

↓

Provider cleanup

↓

Backup retention state

↓

Completed
```

Each transition must originate from the authoritative deletion coordinator.

---

# Deletion Request Received

Channels:

```text
In-Product

Email

Optional Push
```

Recommended content:

```text
Your Nexio Account deletion request was received.

Access is being restricted and processing has started.
```

---

# Deletion Additional Action Required

Example:

```text
Your deletion request needs additional confirmation.

Open the approved Nexio deletion status page to continue.
```

---

# Deletion Provider Cleanup Pending

```text
Nexio Product data processing is complete.

Approved provider cleanup is still in progress.
```

Use only when true.

---

# Deletion Backup Retention State

```text
Active Nexio Product data has been removed.

Protected backup copies may remain until the approved retention period expires.

They are not available for ordinary Product use.
```

---

# Deletion Completed

```text
Your Nexio Account deletion is complete.

The approved deletion process has finished.
```

Use only after the official completion condition.

---

# Deletion Failure

```text
Your deletion request remains active

One processing step requires another attempt.

Your Account remains restricted while Nexio continues the approved process.
```

---

# Deletion Communication Recipient

Deletion emails and status links must:

- Use the verified owner contact.
- Avoid exposing financial details.
- Expire where appropriate.
- Require reauthentication for protected details.
- Stop after the approved final state except for required records.

---

# Deletion and Subscription Message

When applicable:

```text
Deleting your Nexio Account does not automatically prove that an external store subscription was cancelled.

Review your subscription through the store's approved controls.
```

---

# Deletion Recreated Account Prevention

A deletion message must not contain a call to action that silently creates a new owner.

---

# Export Communication Flow

Recommended:

```text
Export requested

↓

Scope recorded

↓

Export processing

↓

File generated

↓

Protected destination created

↓

Communication created

↓

User reauthenticates where required

↓

File accessed

↓

Link expires

↓

Communication expires
```

---

# Export Processing Message

Prefer in-Product:

```text
Your Export is being prepared.
```

External messaging is optional.

---

# Export Ready Message

```text
Your Nexio Export is ready.

Open Nexio to access it securely.
```

---

# Export Delivery Failure

```text
The Export was generated, but the external destination did not confirm delivery.

Open Nexio to review the current state.
```

---

# Export Expiration Warning

Send only when useful and preference-appropriate.

Do not include a direct unprotected file link.

---

# Support Communication Flow

Recommended:

```text
Support case created

↓

Identity level determined

↓

Case owner assigned

↓

Approved message prepared

↓

Channel selected

↓

Case-bound communication sent

↓

User response recorded

↓

Case state updated
```

---

# Support Communication Content

May include:

```text
Case reference

General issue category

Requested safe diagnostic

Next step

Response expectation without unsupported deadline
```

---

# Support Communication Prohibitions

Do not request:

```text
Password

MFA code

Recovery code

Session token

Complete financial Export

Full card number

Private key
```

---

# Support Communication Deep Link

Where implemented, open:

- Authenticated Support case
- Public safe contact page
- Approved secure response interface

Do not expose case content through predictable public URLs.

---

# Marketing Communication Flow

Optional marketing should require:

```text
Approved purpose

Valid regional basis

Eligible owner

Marketing preference enabled

Approved channel

Frequency limit

Unsubscribe

No sensitive financial targeting

No deleted-owner status
```

---

# Marketing Suppression

Suppress when:

- User unsubscribed.
- Account deletion started.
- Owner is inactive under the approved policy.
- Quiet hours apply.
- Frequency cap reached.
- Communication uses prohibited financial context.
- Store or regional rule prohibits it.

---

# Marketing Content Boundary

Allowed:

```text
A new optional Nexio feature is available.
```

Prohibited:

```text
Based on your recent Expenses, you need this premium plan.
```

---

# Product Update Communication Flow

Product updates may inform users about:

- New capability
- Material behavior change
- Deprecation
- Required Android update
- Policy change

---

# Required Update Communication

A required update message should explain:

```text
What changes

Why action is required

Which platform applies

What remains safe

What happens if delayed

Where to get Help
```

---

# Android Required Update Example

```text
A Nexio Android update is required to continue remote synchronization safely.

Locally saved records remain on this device.

Update through the approved application store before clearing application data.
```

Use only when verified.

---

# Deprecation Communication Flow

Recommended stages:

```text
Initial notice

Reminder

New-use disabled

Read-only

Removal

Post-removal Help
```

---

# Deprecation Message

```text
This Nexio capability will be retired.

Review the replacement or Export path before the approved removal date.
```

Only state a date when committed.

---

# Communication Testing Architecture

Required test categories:

```text
Unit

Template

Eligibility

Preference

Owner isolation

Scheduling

Deduplication

Retry

Provider integration

Deep link

Android lifecycle

Web Service Worker

Accessibility

Localization

Account deletion

Incident

Performance
```

---

# Communication Unit Tests

Verify:

- Category policy resolution
- Privacy-level selection
- Quiet-hour calculation
- Frequency cap
- Expiration
- Deduplication key
- Retry classification
- Reminder recurrence
- Time-zone behavior

---

# Template Tests

Verify:

```text
Required variables render.

Forbidden variables are rejected.

No secret appears.

No exact financial value appears by default.

Titles and actions are valid.

Every active locale exists.

Material meaning remains equivalent.
```

---

# Owner-Isolation Tests

```text
Owner A token cannot receive Owner B communication.

Owner A cannot open Owner B deep link.

Prior-owner Notification Center clears after switching.

Deleted owner stops ordinary messages.

Support case communication remains case-bound.
```

---

# Android Tests

```text
Permission not requested on first paint.

Permission explanation appears.

Denied permission preserves core access.

Granted permission registers correct owner token.

Token rotation does not duplicate.

Account switch detaches prior owner.

Sign-out protects content.

Process death opening works.

Back stack is correct.

Deep links reauthorize.

Local reminders preserve time zone.

Application upgrade preserves valid reminders.
```

---

# Web Push Tests

```text
Unsupported browser fallback

Denied permission

Service Worker registration failure

Owner-bound subscription

Multi-tab subscription coordination

Sign-out revocation

Stale Notification click

Wrong-owner deep link

Expired link

Offline open
```

---

# Reminder Tests

```text
One-time reminder

Daily recurrence

Weekly recurrence

Monthly day 31

Time-zone change

Daylight-saving transition

Pause and resume

Snooze

Cancellation

Missed occurrence

Burst suppression

Owner switch
```

---

# Queue Tests

```text
Two workers lease one item.

Lease expires safely.

Provider timeout creates unknown outcome.

Retry preserves communication identity.

Preference disables queued message.

Deletion cancels ordinary queue.

Expiration suppresses send.

Priority backpressure preserves Critical messages.
```

---

# Deduplication Tests

```text
Same event submitted twice

Provider callback repeated

Multi-tab creation

Android token rotation

Reminder Retry

Multi-channel communication

State transition creates a valid new message
```

---

# Deep-Link Tests

```text
Valid current owner

Signed-out owner

Wrong owner

Deleted entity

Expired message

Unsupported Product version

Higher Authentication required

Android process death

Web existing tab

Malformed URL

Open redirect attempt
```

---

# Account Deletion Communication Tests

```text
Request received

Access restricted

Provider cleanup pending

Backup retention

Completed

Failed retryable

Ordinary reminders cancelled

Marketing stopped

Device token removed

Stale deletion link handled safely
```

---

# Accessibility Tests

Verify:

- Title meaning without body
- Unique action labels
- Screen-reader order
- Large-text rendering
- Color-independent status
- Focus after deep-link opening
- Notification Center keyboard use
- Reduced motion
- Toast alternatives

---

# Localization Tests

For `pt-BR`, verify:

```text
Date:
15/08/2026

Time:
18:30

Generic BRL example:
R$ 84,90
```

Do not display generic US-dollar formatting in the `pt-BR` communication experience.

---

# Communication Performance Tests

Verify:

- Queue throughput
- Critical-priority latency
- Template rendering time
- Notification Center pagination
- Provider timeout handling
- Reminder rescheduling
- Account-switch cleanup

Performance tests must not use real user financial data.

---

# Communication Failure Injection

Inject:

```text
Provider outage

Rate limit

Invalid token

Email rejection

Service Worker failure

Database timeout

Preference conflict

Account switch during send

Deletion during queue processing

Clock change

Process death

Duplicate callback
```

---

# Release Gates

Do not release a communication capability when:

```text
Owner isolation is unverified.

Permission is requested without explanation.

Optional categories ignore preference.

Deleted owners receive ordinary messages.

Deep links bypass Authentication.

Unknown provider outcomes duplicate delivery.

Exact financial data appears by default.

Critical state exists only in a Toast.

Reminder recurrence is undefined.

Quiet hours are ignored.

Account deletion messages claim false completion.

Provider disablement is unavailable.

Accessibility critical tests fail.

Template localization changes material meaning.
```

---

# Operational Monitoring

Monitor:

```text
Queue depth

Critical-message age

Provider failure rate

Invalid-token rate

Duplicate-message rate

Unknown-delivery rate

Preference suppression rate

Quiet-hour violation

Cross-owner delivery signal

Deleted-owner delivery signal

Deep-link authorization failure

Template rendering failure

Notification Center load failure
```

---

# Critical Alerts

Alert immediately for:

```text
Confirmed cross-owner communication

Deleted-owner ordinary message

False Account-deletion completion

Sensitive financial preview exposure

Provider credentials exposed

Large-scale duplicate send

Security communication failure

Deep-link authorization bypass
```

---

# Runbooks

Required runbooks may include:

```text
Push provider outage

Email provider outage

Duplicate-send incident

Wrong-owner delivery

Sensitive-content exposure

Invalid-token surge

Account-deletion communication failure

Deep-link security incident

Reminder scheduling failure

Template withdrawal

Marketing unsubscribe failure
```

---

# Part 2 Anti-Patterns

The following are prohibited:

## Direct Provider Calls from UI

Bypassing canonical eligibility, preference and owner validation.

## Multi-Channel Spam

Sending the same noncritical message through every available channel.

## Preference Reenabled by Device Setting

Allowing a lower-level device setting to override owner-global withdrawal.

## Local Preference Ignored until Sync

Continuing optional local sends after the user disabled them.

## Android Token Shared between Owners

Retaining the same owner association after Account switching.

## Process-Death Deep-Link Bypass

Opening protected content before application and Authentication initialization.

## System Notification as Financial Confirmation

Treating provider display as evidence that a Transaction completed.

## Service Worker as Financial Domain

Calculating or mutating financial state in the Web Push worker.

## Reminder Completion as Transaction Creation

Turning reminder acknowledgement into a financial record.

## Recurring Reminder without Time-Zone Semantics

Using only a fixed offset for long-term scheduling.

## Missed-Reminder Burst

Sending every missed reminder after reconnection.

## Mark All as Resolved

Using read-state controls to clear unresolved Product issues.

## Owner Hint as Authorization

Trusting owner information embedded in a link.

## Recreating Communication after Timeout

Using a new message identity instead of reconciliation.

## Retry without Eligibility Recheck

Sending after preference withdrawal, deletion or expiration.

## Incident Update Flood

Sending every operational status transition through Push.

## Deletion Complete before Authority

Creating completion content before the coordinator confirms it.

## Unprotected Export Link

Sending direct sensitive-file access without authorization and expiration controls.

## Marketing Based on Financial Behavior

Using Accounts, balances, Transactions or Goals to pressure Product purchase.

## Support Case in Public URL

Exposing protected case content through predictable links.

## Required Update without Local-Data Warning

Telling users to reinstall or update without preserving pending local records.

## Template Change without Version

Losing the ability to identify which content was delivered.

---

# Part 2 Review Questions

## Creation Flow

```text
Which authoritative event created the communication?

Which owner owns the event?

Which policy applies?

Which variables are allowed?

Which expiration applies?
```

---

## Channel Selection

```text
Is an external channel necessary?

Which least intrusive channel works?

Is permission available?

Does the content fit lock-screen privacy?

Is multi-channel delivery justified?
```

---

## Android Push

```text
Which Android channel applies?

Was permission requested contextually?

How is the token owner-bound?

What happens after Account switch?

Does process-death opening reauthorize?

Does Back return safely?
```

---

## Web Push

```text
Is the context secure?

Does the browser support Push?

Is the Service Worker bounded?

How is the subscription owner-bound?

What happens after Sign-out?

How are multiple tabs coordinated?
```

---

## Reminder

```text
Who created the reminder?

Which time zone applies?

How does recurrence behave during short months?

What happens after Snooze?

Can missed reminders create a burst?

Does completion remain separate from financial action?
```

---

## Notification Center

```text
Is every message owner-scoped?

Are read and resolved separate?

Are required actions visible first?

Can low-priority content hide Security or recovery?

How does retention work?
```

---

## Deep Link

```text
Is the origin valid?

Is the link expired?

Which Authentication level applies?

Does the current owner own the entity?

What is the stale-link fallback?
```

---

## Queue and Retry

```text
Does the queue persist?

Can two workers send the same message?

Does Retry preserve identity?

Is eligibility rechecked?

Does provider timeout become unknown outcome?
```

---

## Incident Communication

```text
Which users are affected?

Does the message reduce risk?

Which facts are verified?

Which safe action is required?

Is Push necessary for every update?
```

---

## Account Deletion

```text
Which coordinator state triggered the message?

Are ordinary messages already stopped?

Does the content distinguish provider cleanup and backups?

Is completion authoritative?

Can a stale link recreate access?
```

---

## Testing

```text
Were owner-isolation tests executed?

Were process death and multi-tab behavior tested?

Were recurrence edge cases tested?

Were deduplication and unknown outcome tested?

Were Accessibility and localization tested?
```

---

# Part 2 Acceptance Criteria

The practical communication-delivery architecture is accepted only when:

```text
□ Communication creation follows an explicit Application boundary.

□ Every communication originates from an authoritative event.

□ Eligibility is evaluated before message creation and sending.

□ Deleted-owner eligibility is category-limited.

□ Missing policy suppresses external communication safely.

□ Channel selection prefers the least intrusive valid option.

□ Multi-channel delivery preserves one event identity.

□ Preference precedence is defined.

□ A lower-level setting cannot re-enable owner-global withdrawal.

□ Local preference changes apply immediately where possible.

□ Preference synchronization states are visible when material.

□ Optional preference Conflicts use a privacy-safe temporary behavior.

□ Android Push uses a provider Adapter.

□ Android notification channels are limited and understandable.

□ Marketing and education do not use high-importance channels.

□ Android permission follows Product explanation.

□ Permission denial preserves core access.

□ Android tokens are bound to one current owner context.

□ Token rotation does not create duplicate active records.

□ Account switching detaches prior-owner communication state.

□ Sign-out protects sensitive Notification content.

□ Account deletion cancels ordinary Android communication.

□ Foreground Android behavior avoids duplicate system messages.

□ Background Android messages use approved privacy levels.

□ Android process-death opening initializes the application safely.

□ Android Notification actions cannot mutate financial state directly.

□ Android Back-stack behavior is predictable.

□ Lock-screen privacy defaults to generic content.

□ Android upgrade tests include channels, tokens and reminders.

□ Web Push requires a secure supported context.

□ Web Push permission is contextual.

□ Service Worker authority is bounded.

□ Web Push subscriptions are owner-bound.

□ Sign-out revokes or detaches owner communication.

□ Multi-tab Web behavior avoids duplicate prompts and subscriptions.

□ Web Notification clicks reauthorize current state.

□ Local reminder creation defines purpose, time, recurrence and privacy.

□ Reminder titles discourage sensitive information.

□ Reminder Save completion distinguishes local and synchronized setup.

□ Recurring reminders define time-zone semantics.

□ Monthly recurrence edge cases are explicit.

□ Editing preserves reminder identity.

□ Pause and resume avoid missed-occurrence bursts.

□ Snooze creates one bounded linked trigger.

□ Reminder completion does not create financial state.

□ Missed reminders are bounded and grouped.

□ Goal reminders remain neutral.

□ Report reminders do not imply complete data incorrectly.

□ Notification Center is owner-scoped.

□ Notification Center supports category and action-required views.

□ Empty, filtered, offline and error states are distinct.

□ Action-required messages are prioritized.

□ Read state remains distinct from resolution.

□ Mark All as Read cannot resolve Product state.

□ Message dismissal does not remove required Product actions.

□ Message withdrawal is supported.

□ Deep links use structured contracts.

□ Owner hints do not authorize access.

□ Deep links validate origin, expiration, Authentication and owner.

□ Stale deep links use safe fallback.

□ Wrong-owner links reveal no protected information.

□ Higher-risk destinations require stronger Authentication.

□ Deep-link loops are prevented.

□ Communication actions are registered and validated.

□ Support actions include only safe context.

□ External communication uses a durable queue where appropriate.

□ Queue items have stable communication identity.

□ Worker leasing prevents simultaneous sends.

□ Lease expiration supports safe reconciliation.

□ Eligibility is rechecked before every send.

□ Queue cancellation handles withdrawal, deletion and expiration.

□ Backpressure preserves Critical communication.

□ Low-priority communication may be suppressed during overload.

□ Deduplication occurs at creation, queue and provider stages.

□ State transitions may create distinct valid messages.

□ Reminder occurrences have stable identities.

□ Multi-device deduplication behavior is explicit.

□ Provider timeout creates unknown delivery rather than duplicate messages.

□ Retry is bounded, jittered and category-aware.

□ Every Retry rechecks current need and eligibility.

□ Invalid destinations stop Retry.

□ Rejected content opens a defect.

□ Provider configuration failures stop affected sends.

□ External delivery failure preserves in-Product state.

□ Critical delivery failure supports approved alternate channels.

□ Communication resolution derives from Product state.

□ Resolution messages are limited to useful material states.

□ Incident communication distinguishes public and owner-specific scope.

□ Incident messages use approved lifecycle states.

□ Incident communication is sent only when useful to affected users.

□ Push is not used for every operational status change.

□ Incident messages require accountable approval.

□ Security communications use verified events.

□ Security links lead to current protected destinations.

□ Authentication emails contain no financial content.

□ Account deletion messages follow the authoritative deletion lifecycle.

□ Deletion communication stops ordinary messaging.

□ Provider cleanup and backup retention remain distinct.

□ Completed deletion language is used only at true completion.

□ Subscription behavior is distinguished where applicable.

□ Export communication uses protected Product access.

□ Export links expire and reauthorize.

□ Support communication remains case-bound.

□ Support communication never requests secrets.

□ Marketing requires preference, frequency and regional eligibility.

□ Marketing does not use financial behavior targeting.

□ Product-update messages explain required action and data safety.

□ Deprecation communication follows staged notice.

□ Communication tests cover unit, provider, platform and lifecycle behavior.

□ Template tests reject forbidden variables.

□ Owner-isolation tests cover tokens, messages and deep links.

□ Android tests cover permission, switch, process death and Back.

□ Web tests cover Service Worker, tabs and stale links.

□ Reminder tests cover recurrence, time zones and burst suppression.

□ Queue tests cover leasing, cancellation and overload.

□ Deduplication tests cover duplicate events and callbacks.

□ Deep-link tests cover wrong owner and expired state.

□ Deletion communication tests cover every authoritative state.

□ Accessibility tests cover titles, actions and destinations.

□ `pt-BR` localization uses `R$ 84,90`, localized Dates and 24-hour time where applicable.

□ Performance tests use synthetic data.

□ Failure injection covers provider, token, queue and deletion changes.

□ Release gates prevent unsafe communication launch.

□ Operational monitoring covers queue, provider and owner-safety signals.

□ Confirmed cross-owner communication triggers a Critical alert.

□ False deletion completion triggers a Critical alert.

□ Sensitive preview exposure triggers a Critical alert.

□ Communication incident runbooks are defined.

□ Part 2 communication anti-patterns are prohibited.
```

---

# Part 2 Communication Constitutional Rule

Every communication event, scheduled reminder, provider send, queue Retry, Notification action, deep link, incident message and Account deletion update must answer:

```text
Does this flow preserve one authoritative event and owner identity, apply the latest preferences and Product state, prevent duplicate delivery, expose only approved information, reauthorize every destination and remain safe when the device, provider, network or application process fails?
```

When the answer is uncertain, prefer the action that:

- Keeps the message in-Product.
- Suppresses the external send.
- Preserves the original communication identity.
- Rechecks owner eligibility.
- Rechecks preference.
- Rechecks expiration.
- Reconciles provider state.
- Avoids Retry.
- Cancels the queued message.
- Uses generic private content.
- Opens a safe fallback route.
- Escalates through Operations.
- Blocks the release.

Communication delivery is complete only when Nexio can prove that the correct approved message was processed for the correct owner through the correct channel without altering canonical financial state or bypassing current authorization.

---
---

# Communication Governance Architecture

Notifications, reminders, emails, banners, incident updates and other communications are Product capabilities.

They must be governed with the same rigor applied to:

```text
Financial commands

Owner isolation

Synchronization

Privacy

Accessibility

Account deletion

Recovery

Production releases
```

Communication governance should follow:

```text
Authoritative Product event

↓

Communication policy

↓

Approved template

↓

Owner and preference evaluation

↓

Channel and provider selection

↓

Delivery processing

↓

Current Product-state revalidation

↓

Measurement

↓

Audit

↓

Maintenance, correction or removal
```

A communication is not complete merely because text exists or a provider accepted a request.

It is complete only when:

```text
The purpose is approved.

The Product state is accurate.

The intended owner is eligible.

The selected channel is appropriate.

The content is privacy-safe.

The message is accessible.

Delivery behavior is governed.

Failure and Retry behavior are safe.

The communication remains traceable.
```

---

# Communication Governance Objectives

The governance model should ensure:

```text
Every communication category has an owner.

Every active template has a stable identifier.

Every material message maps to an authoritative Product event.

Every external channel has an approved purpose.

Every provider remains replaceable.

Every sensitive variable is prohibited by default.

Every optional category respects current user choice.

Every message is versioned.

Every translation preserves material meaning.

Every deep link reauthorizes the current owner.

Every Critical communication has operational monitoring.

Every incorrect message can be withdrawn.

Every retired communication is removed from Product, provider and Support systems.
```

---

# Governance Authority Hierarchy

When communication sources conflict, use the following authority order:

```text
Canonical Domain and Application state

↓

Security, Privacy, Accessibility and Compliance requirements

↓

Current owner and preference state

↓

Current communication policy

↓

Current active template

↓

Provider delivery result

↓

Historical message or cached content
```

A provider response must not override canonical Product state.

Example:

```text
Provider status:
Delivered

Canonical Product status:
Transfer still under reconciliation
```

The Notification may have been delivered.

The Transfer is not therefore complete.

---

# Communication Governance Roles

Recommended roles:

```text
Communication Product Owner

Communication Platform Owner

Template Content Owner

Financial Domain Reviewer

Security Reviewer

Privacy Reviewer

Accessibility Reviewer

Localization Owner

Provider Owner

Operations Owner

Support Knowledge Owner

Incident Communication Owner

Audit Owner
```

One person may hold multiple roles.

The responsibilities remain distinct.

---

# Communication Product Owner

Responsible for:

- Purpose
- Category
- User need
- Required versus optional classification
- Expected outcome
- Guardrails
- Product lifecycle
- Roadmap priority

---

# Communication Platform Owner

Responsible for:

- In-Product Notification Center
- Android Push
- Web Push
- Email integration
- Local scheduling
- Deep links
- Queue behavior
- Multi-device behavior

---

# Template Content Owner

Responsible for:

- Title
- Body
- Action labels
- Tone
- Clarity
- Version
- Review schedule
- Template retirement

---

# Financial Domain Reviewer

Responsible for confirming:

- Financial-state wording
- Money and Currency references
- Transaction wording
- Transfer wording
- Report wording
- Export wording
- Unknown-outcome guidance
- No unsupported financial advice

---

# Security Reviewer

Responsible for:

- Security event classification
- Authentication links
- Token safety
- Session communication
- Owner verification
- Deep-link authorization
- Incident communication
- Anti-phishing language

---

# Privacy Reviewer

Responsible for:

- Sensitive-data minimization
- Lock-screen privacy
- Preference enforcement
- Marketing optionality
- Communication retention
- Search and Analytics data
- Account deletion
- Provider processing

---

# Accessibility Reviewer

Responsible for:

- Message comprehension
- Action labels
- Notification Center interaction
- Focus behavior
- Large-text behavior
- Screen-reader behavior
- Color-independent status
- Sound and motion alternatives

---

# Localization Owner

Responsible for:

- Translation workflow
- Product terminology
- Date and time formatting
- Currency formatting
- Urgency equivalence
- Optionality equivalence
- Security and deletion meaning

---

# Provider Owner

Responsible for:

- Provider contract
- Credentials
- SDK
- API version
- Delivery callbacks
- Regional behavior
- Limits
- Cost
- Exit plan

---

# Operations Owner

Responsible for:

- Queues
- Monitoring
- Alerts
- Runbooks
- Provider health
- Capacity
- Incident response
- Recovery exercises

---

# Support Knowledge Owner

Responsible for:

- Support macros
- Help articles
- Escalation
- Agent training
- Communication troubleshooting
- User complaint classification

---

# Incident Communication Owner

Responsible for:

- Incident-message approval
- Update cadence
- Verified facts
- Channel selection
- Resolution communication
- Correction of inaccurate messages

---

# Communication Audit Owner

Responsible for:

- Audit schedule
- Audit scope
- Findings
- Corrective actions
- Evidence
- Closure verification

---

# Communication Responsibility Matrix

| Capability | Product | Platform | Content | Domain | Security | Privacy | Accessibility | Operations |
|---|---|---|---|---|---|---|---|---|
| Security alert | Required | Required | Required | As applicable | Required | Required | Required | Required |
| Transaction review | Required | Required | Required | Required | Required | Required | Required | Required |
| Transfer reconciliation | Required | Required | Required | Required | Required | Required | Required | Required |
| Synchronization alert | Required | Required | Required | Required | Required | Required | Required | Required |
| User reminder | Required | Required | Required | As applicable | As applicable | Required | Required | Required |
| Goal reminder | Required | Required | Required | Required | As applicable | Required | Required | Required |
| Export communication | Required | Required | Required | Required | Required | Required | Required | Required |
| Account deletion | Required | Required | Required | As applicable | Required | Required | Required | Required |
| Incident message | Required | Required | Required | As applicable | Required | Required | Required | Required |
| Product update | Required | Required | Required | As applicable | As applicable | Required | Required | Required |
| Marketing | Required | Required | Required | As applicable | As applicable | Required | Required | Required |

---

# Communication Classification

Every communication should be classified as:

```text
Critical

High

Normal

Low

Temporary

Historical
```

---

# Critical Communication

Incorrect or failed delivery could create:

- Security harm
- Owner exposure
- Financial duplication
- Data loss
- Broken Account deletion
- Failure to recover
- Legal or administrative harm

Examples:

```text
Confirmed Security compromise

Cross-owner communication warning

Account deletion additional action

Unknown Transfer outcome

Critical service incident requiring user action
```

---

# High Communication

Examples:

- Authentication required for pending synchronization
- Export expiration requiring user action
- Recovery failure
- Required Android update
- Material Privacy preference failure

---

# Normal Communication

Examples:

- User-created reminder
- Goal reminder
- Report availability
- Product update
- Noncritical Support reply

---

# Low Communication

Examples:

- Product education
- Optional tips
- Marketing
- Feature discovery

---

# Temporary Communication

Used for:

- Active provider outage
- Incident
- Temporary migration limitation
- Staged rollout
- Temporary Support workaround

Temporary messages require:

```text
Owner

Start condition

Expiration

Removal trigger

Replacement guidance
```

---

# Historical Communication

Historical templates or messages exist for:

- Audit
- Incident review
- Legal evidence
- Prior release reconstruction
- Support history

They must not remain eligible for current delivery.

---

# Template Governance Architecture

Every reusable message should exist in the governed Template Registry.

A template must not be considered active merely because text exists in application code.

---

# Template Registry Record

Recommended fields:

```text
templateId

templateVersion

category

classification

purpose

requiredOrOptional

eventTypes

channels

sourceLocale

availableLocales

defaultPrivacyLevel

supportedPrivacyLevels

title

body

actions

requiredVariables

optionalVariables

forbiddenVariables

deepLinkType

expirationPolicy

frequencyPolicy

quietHourPolicy

owner

reviewers

status

createdAt

lastReviewed

nextReview

releaseIntroduced

releaseDeprecated
```

---

# Template Source of Truth

Recommended:

```text
Version-controlled Template Registry

↓

Validated message-rendering build

↓

Provider-ready rendered payload
```

Avoid uncontrolled independent copies in:

- Android native resources
- JavaScript strings
- Email provider console
- Support macros
- Public status tool
- Marketing platform
- AI prompt
- Documentation

Platform-specific rendering may differ, but material meaning must trace to the same approved template version.

---

# Template Identifier Stability

A `templateId` must not be reused for a materially different purpose.

Example:

```text
NTF-SYNC-004
```

must not change from:

```text
Authentication required to continue synchronization
```

to:

```text
Monthly Report is ready
```

A new purpose requires a new identifier.

---

# Template Versioning

Increment template version when changing:

- Material meaning
- Required action
- Privacy level
- Urgency
- Deep link
- Required variables
- Optionality
- Account deletion state
- Security guidance

Minor punctuation or nonmaterial layout changes may follow a documented smaller revision policy.

---

# Template Lifecycle

Recommended states:

```text
proposed

draft

technical_review

domain_review

security_review

privacy_review

accessibility_review

localization

release_validation

approved

active

paused

needs_update

withdrawn

deprecated

archived
```

---

# `proposed`

Purpose and Product event are identified.

---

# `draft`

Source-language content exists.

---

# `technical_review`

Event, channel and deep-link behavior are verified.

---

# `domain_review`

Financial meaning is verified.

---

# `security_review`

Authentication, owner and sensitive-action behavior are verified.

---

# `privacy_review`

Data minimization, optionality and retention are verified.

---

# `accessibility_review`

Comprehension and interaction are verified.

---

# `localization`

Translated variants are prepared and reviewed.

---

# `release_validation`

Template is tested against the target release.

---

# `approved`

Reviews pass but the template is not yet eligible for Production sends.

---

# `active`

The template may be used by approved events.

---

# `paused`

Temporary send disablement without retirement.

---

# `needs_update`

Known Product or content mismatch exists.

---

# `withdrawn`

The message must no longer be shown or sent because it is inaccurate or unsafe.

---

# `deprecated`

The related capability or communication is being retired.

---

# `archived`

Historical evidence only.

---

# Template Readiness

A template is ready for review only when:

```text
□ Purpose is defined.

□ Event source is defined.

□ Owner eligibility is defined.

□ Channel scope is defined.

□ Required action is defined.

□ Privacy level is defined.

□ Forbidden variables are defined.

□ Expiration is defined.

□ Deep-link behavior is defined.

□ Content owner is assigned.
```

---

# Template Activation Readiness

A template may become active only when:

```text
□ Authoritative event was verified.

□ Product-state wording is accurate.

□ Owner-isolation behavior was tested.

□ Financial meaning was reviewed.

□ Security review passed where applicable.

□ Privacy review passed.

□ Accessibility review passed.

□ Required locales exist.

□ Deep links were tested.

□ Provider rendering was tested.

□ Monitoring exists.

□ Rollback or withdrawal is possible.
```

---

# Template Variable Governance

Template variables should be classified as:

```text
public_safe

owner_contextual

sensitive

security_sensitive

forbidden
```

---

# Public-Safe Variable

Examples:

```text
Product name

Generic status

Platform name

Public incident state
```

---

# Owner-Contextual Variable

Examples:

```text
Generic entity type

Reminder category

Approved device name

Current Product version
```

Use only after owner eligibility.

---

# Sensitive Variable

Examples:

```text
Financial Account name

Goal name

Export reference

Support reference
```

Should normally remain out of Push previews.

---

# Security-Sensitive Variable

Examples:

```text
Authentication token

Reset secret

Raw device token

Session identifier

Recovery code
```

Must never be inserted into ordinary message content or logs.

---

# Forbidden Variable

Default prohibited variables include:

```text
Exact Account balance

Exact Transaction Amount

Transaction description

Card number

Bank Account number

Password

MFA code

Session token

Complete Support case

Complete Assistant prompt

Attachment content
```

---

# Variable Validation

Message rendering must fail safely when:

- A required variable is missing.
- A forbidden variable is present.
- A value exceeds approved length.
- A variable contains unsafe markup.
- A locale-specific format cannot be produced.
- The owner relationship is missing.

---

# Rendering Failure

When rendering fails:

```text
Do not send a partially rendered message.

Do not expose raw template syntax.

Record a template-rendering error.

Preserve the in-Product Product state.

Escalate if the communication is Critical.
```

---

# Communication Content Style Guide

Every message should be:

- Accurate
- Calm
- Direct
- Specific
- Brief
- Nonjudgmental
- Accessible
- Actionable where action exists
- Honest about uncertainty

---

# Title Style

Recommended:

```text
Nexio synchronization needs attention

Your Nexio Export is ready

Review your Account Security

Your Goal reminder is ready
```

Avoid:

```text
URGENT!!!

Important!!!

Click now

You have failed
```

---

# Body Style

Preferred structure:

```text
What happened

What remains safe

What the user should do

What the user should avoid where relevant
```

---

# Unknown-Outcome Content Pattern

```text
Nexio is checking whether the operation completed.

Do not repeat the same financial action while reconciliation is in progress.
```

---

# Local-Preservation Content Pattern

```text
Pending records remain stored on this device.

Do not clear application data before reviewing synchronization status.
```

---

# Security Content Pattern

```text
A Security event was detected.

Review your Nexio Security activity if you did not perform this action.
```

---

# Optional Reminder Content Pattern

```text
Your scheduled Nexio reminder is ready.

Open Nexio when convenient.
```

---

# Financial Example Governance

Generic communication-learning examples for `pt-BR` should use Brazilian reais consistently.

Example:

```text
Generic Amount:
R$ 84,90

Generic larger Amount:
R$ 1.250,00
```

These values must be described as synthetic examples.

They must not be presented as actual user records.

---

# Money and Currency Content Rule

When a communication must mention Currency:

Preferred:

```text
A BRL Transaction needs review.
```

Avoid:

```text
A $ Transaction needs review.
```

A Currency symbol alone should not be used when identity is material.

---

# Communication Length Governance

Channel limits should be documented.

Potential constraints:

```text
Android title limit

Android body practical limit

Web Push title limit

Email subject limit

SMS limit if ever approved

In-Product card limit
```

Content should be tested for truncation.

Critical meaning must appear before likely truncation.

---

# Truncation Safety

A truncated message must not change:

- Urgency
- Required action
- Negative meaning
- Account deletion state
- Security meaning

Example unsafe truncation:

```text
Your Account deletion is not complete...
```

rendered as:

```text
Your Account deletion is...
```

Templates should be designed to avoid this ambiguity.

---

# Action Label Governance

Action labels should use explicit verbs.

Preferred:

```text
Review Security

Open synchronization

Review deletion status

Open Export

Snooze reminder
```

Avoid:

```text
OK

Go

Continue

Fix
```

when the action consequence is material.

---

# Communication Localization Governance

Every active template should have:

```text
sourceLocale

translationVersion

materialMeaningVersion

localeOwner

lastReviewed

fallbackPolicy
```

---

# Locale Fallback

Fallback must not silently deliver a language the user cannot reasonably understand for a Critical action when an approved alternative exists.

Potential fallback order:

```text
Owner locale

↓

Supported regional parent locale

↓

Approved Product default locale

↓

In-Product generic safe message
```

---

# `pt-BR` Communication Requirements

For Brazilian Portuguese:

```text
Date:
15/08/2026

Time:
18:30

Currency:
R$ 84,90

Larger Currency value:
R$ 1.250,00
```

The localized application should use consistent terminology for:

```text
Conta

Transação

Receita

Despesa

Transferência

Meta

Relatório

Salvo localmente

Aguardando sincronização

Sincronizado

Conflito

Exclusão de conta
```

The final Portuguese Product terminology should follow the approved locale glossary.

---

# Translation Review

Verify that translations preserve:

- Required versus optional meaning
- Urgency
- Negation
- Uncertainty
- Product state
- Financial meaning
- Security warning
- Deletion state
- Privacy choice
- Quiet-hour behavior

---

# Translation Anti-Pattern

Source:

```text
Do not repeat the Transaction.
```

Incorrect translation meaning:

```text
Try the Transaction again.
```

Material translations require review beyond literal word matching.

---

# Communication Accessibility Governance

Accessibility must apply to:

```text
Push message content

Notification actions

Notification Center

Permission education

Communication settings

Reminder forms

Email

Incident banners

Deep-link destination

Support communication
```

---

# Notification Center Accessibility

Required:

```text
□ Notification Center has a clear heading.

□ List semantics are correct.

□ Unread state has a nonvisual label.

□ Action-required state has a nonvisual label.

□ Read and resolution states are distinguishable.

□ Filters are keyboard accessible.

□ Focus returns predictably.

□ Large text reflows.

□ Screen-reader users can identify timestamp and category.

□ Mark All as Read does not obscure unresolved state.
```

---

# Push Accessibility

The message should:

- Use a meaningful title.
- Avoid unexplained abbreviation.
- Avoid emoji-only meaning.
- Avoid punctuation-based urgency.
- Use unique action names.
- Open an accessible destination.

---

# Email Accessibility

Email should include:

- Semantic heading structure
- Descriptive links
- Sufficient contrast
- Text alternative for meaningful images
- Responsive layout
- No image-only action
- Plain-text fallback where appropriate

---

# Communication Comprehension Testing

Critical messages should be tested for comprehension.

---

# Comprehension Test Questions

Potential:

```text
What happened?

Does this message mean the Transaction is complete?

What should you do next?

What should you avoid?

Which Account is affected?

Is the message optional or required?

Can you disable this category?
```

---

# Unknown-Outcome Comprehension Test

Message:

```text
Nexio is checking whether the operation completed.

Do not repeat the same action.
```

Expected understanding:

```text
The final result is uncertain.

The user should not create another Transaction or Transfer.
```

---

# Account Deletion Comprehension Test

Verify users distinguish:

```text
Deletion requested

Processing

Provider cleanup

Backup retention

Completed
```

---

# Security Comprehension Test

Verify users understand:

- Whether action is required
- Where to review activity
- That Support will not request passwords
- That the message may be ignored only when the user recognizes the action

---

# Reminder Comprehension Test

Verify users understand:

```text
The reminder is not proof that a financial task was completed.

Marking the reminder complete does not create a Transaction.
```

---

# Communication Audit Architecture

Communication audits should evaluate:

```text
Purpose

Product-state accuracy

Owner isolation

Preference enforcement

Privacy

Accessibility

Localization

Provider configuration

Delivery behavior

Retry behavior

Retention

Support alignment

Incident readiness

Evidence
```

---

# Audit Types

Recommended:

```text
Template audit

Channel audit

Provider audit

Preference audit

Owner-isolation audit

Deep-link audit

Reminder audit

Account deletion audit

Marketing audit

Localization audit

Accessibility audit

Operational audit

Incident audit
```

---

# Template Audit

Verify:

```text
Active template exists in Registry.

Purpose remains valid.

Event mapping is current.

Variables are approved.

Forbidden variables are rejected.

Version is current.

Owner exists.

Locales are current.

Deep link is valid.

Expiration is current.
```

---

# Channel Audit

Verify:

- Approved categories
- Permission behavior
- Privacy capability
- Platform behavior
- Provider
- Fallback
- Unsubscribe or disablement
- Delivery evidence limitations

---

# Provider Audit

Verify:

- Contract
- Credentials
- SDK version
- Webhook authentication
- Callback processing
- Retention
- Regions
- Subprocessors
- Deletion behavior
- Exit plan
- Cost and limits
- Monitoring

---

# Preference Audit

Verify:

```text
Optional categories can be disabled.

Owner-global preference overrides device reenablement.

Offline change applies locally.

Cross-device synchronization works.

Queued messages are cancelled.

Unsubscribe works.

Deleted owners stop ordinary messages.
```

---

# Owner-Isolation Audit

Verify:

```text
Push token owner binding

Web subscription owner binding

Notification Center owner scope

Local reminder owner scope

Deep-link owner reauthorization

Support case owner scope

Account-switch cleanup

Deletion cleanup
```

---

# Deep-Link Audit

Verify:

- Approved origin
- Expiration
- Authentication
- Owner
- Entity ownership
- Current state
- Minimum version
- Fallback
- Open-redirect resistance
- Loop prevention

---

# Reminder Audit

Verify:

- Owner
- Time zone
- Recurrence
- Short-month behavior
- Quiet hours
- Snooze
- Cancellation
- Missed reminders
- Burst suppression
- Owner switching
- Deletion cleanup

---

# Account Deletion Communication Audit

Verify:

```text
Ordinary communication stops after restriction.

Deletion states match the coordinator.

Provider cleanup is not called complete prematurely.

Backup retention is explained accurately.

Subscription distinction is accurate.

Completion message has authoritative evidence.

Device tokens and reminders are cleaned.
```

---

# Marketing Audit

Verify:

- Valid optional basis
- Preference enabled
- Unsubscribe
- Frequency cap
- No sensitive financial targeting
- No Security disguise
- No deleted-owner recipient
- Accurate Product claim
- Appropriate region

---

# Audit Finding Severity

Recommended:

```text
Critical

High

Moderate

Low

Observation
```

---

# Critical Communication Finding

Examples:

- Message delivered to wrong owner
- Deleted owner receives marketing
- Account deletion falsely reported complete
- Exact balance exposed on lock screen
- Deep link bypasses Authentication
- Security email contains unsafe token
- Provider Retry creates mass duplicates
- Withdrawal ignored

---

# High Communication Finding

Examples:

- Unknown outcome message encourages Retry
- Required alert blocked by incorrect preference logic
- Critical message inaccessible
- Provider callbacks not authenticated
- Deep link points to obsolete unsafe flow
- Quiet hours ignored broadly

---

# Moderate Finding

Examples:

- Outdated Product label
- Missing platform metadata
- Inconsistent reminder wording
- Missing search synonym
- Delayed template review

---

# Low Finding

Examples:

- Minor punctuation
- Nonmaterial formatting issue
- Small spacing inconsistency

---

# Audit Corrective Action

Every Critical or High finding requires:

```text
Containment

Owner

Correction

User-impact assessment

Verification

Release or deadline condition

Evidence

Closure approval
```

---

# Template Withdrawal Architecture

A template should be withdrawn when:

- Product state changed.
- Content is inaccurate.
- Security issue exists.
- Privacy risk exists.
- Deep link is unsafe.
- Provider rejects the content.
- Capability is removed.
- Translation changes material meaning.

---

# Withdrawal Actions

```text
Disable future sends.

Cancel eligible queued messages.

Stop provider campaign or schedule.

Withdraw or supersede in-Product messages where possible.

Remove template from Assistant retrieval.

Update Support macros.

Publish corrected guidance where necessary.

Preserve audit evidence.
```

---

# Previously Delivered Incorrect Message

When an incorrect message may cause harm:

```text
Send a correction only through approved channels.

State which previous message is no longer current.

State the correct Product status.

State what the user should do.

State what the user should not repeat.
```

---

# Communication Observability Architecture

Observability should answer:

```text
Which events generated communication?

Which messages were eligible?

Which messages were suppressed?

Which providers accepted them?

Which final delivery states are known?

Which messages failed?

Which owners or channels are affected?

Which templates are producing errors?

Which preferences are not being honored?

Which queues are aging?

Which incidents require action?
```

---

# Communication Telemetry Layers

Recommended:

```text
Event generation telemetry

Policy evaluation telemetry

Queue telemetry

Provider telemetry

Delivery callback telemetry

Deep-link telemetry

Preference telemetry

Notification Center telemetry

Reminder scheduler telemetry

Incident telemetry
```

---

# Event Generation Telemetry

Track:

```text
eventType

eventVersion

category

source

createdAt

communicationCreated

suppressionCategory
```

Do not include financial payload.

---

# Policy Evaluation Telemetry

Track:

```text
Policy found

Preference applied

Privacy level selected

Channel eligibility

Quiet-hour result

Frequency result

Expiration result
```

---

# Queue Telemetry

Track:

```text
Queue depth

Age of oldest item

Critical queue age

Lease failures

Retry count

Unknown outcome count

Expired count

Cancellation count
```

---

# Provider Telemetry

Track:

```text
Submission count

Acceptance rate

Temporary failure rate

Permanent rejection rate

Rate-limit rate

Invalid destination rate

Callback delay

Authentication failure

Regional failure
```

---

# Deep-Link Telemetry

Track:

```text
Open attempts

Authentication required

Wrong-owner rejection

Expired link

Missing entity

Unsupported version

Successful safe navigation

Authorization failure
```

Do not log protected entity content.

---

# Preference Telemetry

Track:

```text
Preference change requested

Local Save result

Remote synchronization result

Queued-message cancellation

Unsubscribe result

Conflict result
```

---

# Reminder Scheduler Telemetry

Track:

```text
Scheduled occurrence

Delivered occurrence

Suppressed occurrence

Missed occurrence

Snoozed occurrence

Cancelled occurrence

Duplicate occurrence prevented

Time-zone recalculation
```

---

# Notification Center Telemetry

Track:

```text
List load success

Unread count

Action-required count

Message opened

Help opened

Safe action completed

Load failure
```

Opening alone is not resolution.

---

# Privacy-Safe Logging

Logs should prefer identifiers and categories.

Example:

```text
communicationId: com_123

templateId: NTF-SYNC-004

category: synchronization

state: provider_accepted
```

Avoid:

```text
body: Your R$ 1.250,00 Transaction at Mercado failed.
```

---

# Communication SLO Architecture

Service-level objectives should be defined for eligible communication capabilities.

SLOs must distinguish:

```text
Product event generation

Queue processing

Provider submission

Provider acceptance

Device or recipient delivery

User action
```

Nexio controls some stages more directly than others.

---

# Potential SLO Categories

```text
Critical communication eligibility evaluation

Critical queue latency

Preference propagation

Unsubscribe effectiveness

Deleted-owner suppression

Deep-link authorization

Notification Center availability

Reminder scheduling accuracy

Provider Adapter availability

Template rendering success
```

---

# Critical Eligibility SLO

Potential objective:

```text
Eligible Critical events are evaluated and either queued or safely suppressed within the approved operational window.
```

The exact numeric target should be defined from Product need and operational capability.

Do not invent a numeric target without evidence.

---

# Queue Latency SLO

Potential objective:

```text
Critical eligible messages remain below the approved queue-age threshold.
```

---

# Preference Propagation SLO

Potential objective:

```text
Optional communication withdrawal stops current-device sending immediately where possible and reaches remote sending systems within the approved propagation window.
```

---

# Unsubscribe SLO

Potential objective:

```text
Valid marketing unsubscribe requests prevent future eligible marketing sends within the approved processing window.
```

---

# Deleted-Owner Suppression SLO

Target:

```text
Zero ordinary communication after the authoritative restricted deletion state.
```

---

# Cross-Owner Delivery SLO

Target:

```text
Zero.
```

---

# False Completion SLO

Target:

```text
Zero communications that claim Transaction, Transfer, Export or Account deletion completion without authoritative evidence.
```

---

# Deep-Link Authorization SLO

Target:

```text
All protected deep links require current Authentication and owner authorization.
```

---

# Reminder Scheduling Accuracy

Potential objective:

```text
Eligible reminders trigger according to their defined local-time and recurrence semantics within the approved platform tolerance.
```

---

# Notification Center Availability

Potential objective:

```text
The in-Product Notification Center remains available independently from optional external-provider delivery.
```

---

# SLI Definition Record

Recommended fields:

```text
sliId

name

definition

numerator

denominator

inclusions

exclusions

dataSource

privacyClassification

owner

reviewDate
```

---

# SLO Record

Recommended fields:

```text
sloId

sliId

target

window

scope

severity

owner

alertPolicy

errorBudgetPolicy

reviewDate
```

---

# Communication Error Budget

Error budgets may guide:

- Provider expansion
- New channel rollout
- Marketing volume
- Reminder frequency
- Platform rollout
- Release continuation

Critical owner or Privacy failures should not be normalized through an error budget.

---

# Nonbudgetable Failures

The following should remain zero-tolerance:

```text
Cross-owner delivery

Credential exposure

False Account deletion completion

Deep-link authorization bypass

Optional communication after valid withdrawal beyond approved processing

Financial command executed from unauthorized Notification action
```

---

# Communication Operational Dashboard

Recommended sections:

```text
Queue health

Critical-message age

Provider health

Template rendering

Preference propagation

Unsubscribe health

Deleted-owner suppression

Owner-isolation signals

Deep-link failures

Reminder scheduler

Notification Center availability

Incident status
```

---

# Dashboard Segmentation

Potential:

```text
Channel

Provider

Platform

Application version

Region

Category

Template version

Priority
```

Do not expose user financial content.

---

# Communication Alert Architecture

Alerts should be:

- Actionable
- Severity-based
- Deduplicated
- Routed to an owner
- Connected to a runbook
- Free from sensitive payloads

---

# Critical Alerts

Trigger for:

```text
Confirmed cross-owner delivery

Deleted-owner ordinary send

False completion message

Sensitive financial detail in generic Push

Authentication bypass from deep link

Provider credentials invalid across Production

Mass duplicate send

Unsubscribe enforcement failure

Account deletion communication failure
```

---

# High Alerts

Potential:

```text
Critical queue age above threshold

Provider rejection spike

Invalid token spike

Preference propagation delay

Notification Center outage

Reminder scheduler failure

Template-rendering spike

Web Push subscription failure
```

---

# Moderate Alerts

Potential:

```text
Low-priority queue growth

Localized-template fallback increase

Article or Help-link failure

Noncritical provider degradation
```

---

# Alert Deduplication

Repeated alerts for the same provider or template incident should group under one incident where appropriate.

---

# Communication Incident Architecture

Communication incidents may include:

```text
Wrong recipient

Wrong owner

Sensitive-content exposure

Duplicate send

Missing Critical send

False Product state

Broken unsubscribe

Broken preference

Provider outage

Deep-link Security failure

Account deletion communication failure

Reminder scheduling failure

Incorrect translation

Marketing policy violation
```

---

# Incident Severity Factors

Evaluate:

```text
Financial impact

Owner exposure

Security impact

Privacy impact

Accessibility impact

Number of recipients

Duration

Message category

User action caused

Recoverability

Public impact
```

---

# Communication Incident Response

Recommended sequence:

```text
Detect

↓

Classify

↓

Stop or contain sends

↓

Protect affected owners

↓

Withdraw template or provider

↓

Correct Product state where needed

↓

Notify Support and Operations

↓

Assess user communication need

↓

Restore safe capability

↓

Verify

↓

Review
```

---

# Send Containment Options

Potential:

```text
Disable template

Disable category

Disable provider

Pause queue

Cancel scheduled messages

Remove deep link

Force private-generic rendering

Disable detailed previews

Stop marketing

Stop affected region

Switch to in-Product-only communication
```

---

# Wrong-Owner Incident

Immediate actions:

```text
Stop affected channel.

Revoke affected tokens or subscriptions.

Identify scope without exposing further data.

Protect affected owners.

Disable affected deep links.

Notify Security and Privacy owners.

Assess required user communication.

Correct owner-binding logic.

Execute negative owner tests before restart.
```

---

# Sensitive Preview Exposure

Immediate actions:

- Force generic private content.
- Withdraw detailed template.
- Pause detailed-preview capability.
- Assess screenshots or reports.
- Identify affected platform versions.
- Notify Privacy and Security.
- Update public or Support guidance where required.

---

# Duplicate-Send Incident

Immediate actions:

- Pause affected queue or campaign.
- Preserve communication identity.
- Stop automatic Retry.
- Identify duplicate cause.
- Suppress future duplicates.
- Determine whether users may take repeated action.
- Publish correction when necessary.

---

# Missing Critical Communication

Response:

- Confirm canonical Product state remains visible.
- Evaluate alternate approved channel.
- Alert Operations.
- Correct provider or queue issue.
- Avoid assuming the user received the message.
- Preserve incident evidence.

---

# False Completion Incident

Examples:

```text
Deletion completed

Transfer completed

Export delivered
```

when not authoritative.

Response:

```text
Withdraw or supersede the message.

State the accurate current status.

Tell users what not to repeat.

Review whether users took harmful action.

Block the template until corrected.
```

---

# Broken Unsubscribe Incident

Response:

- Stop affected optional campaign.
- Apply suppression directly.
- Preserve unsubscribe evidence.
- Fix preference propagation.
- Assess recipients.
- Review provider configuration.
- Verify before restart.

---

# Incident User Communication

Communicate only verified facts.

Potential structure:

```text
What message was affected

What the accurate Product state is

What the user should do

What the user should not repeat

Whether private information was exposed

Where to obtain Support
```

---

# Post-Incident Review

Review:

```text
Event source

Policy

Template

Owner binding

Preference handling

Provider

Queue

Retry

Deep link

Monitoring

Support response

User impact

Corrective action
```

---

# Communication Incident Record

Recommended fields:

```text
incidentId

detectedAt

category

severity

channels

providers

templates

affectedScope

ownerImpact

privacyImpact

ProductStateImpact

containment

userCommunication

rootCause

correctiveActions

verification

closedAt
```

---

# Provider Governance Architecture

Every communication provider should have a governed Registry entry.

---

# Provider Registry Record

Recommended fields:

```text
providerId

name

capabilities

channels

regions

dataCategories

credentialOwner

Adapter

SDKs

APIversion

webhooks

authentication

retention

deletionBehavior

subprocessors

availabilityDependency

rateLimits

costModel

monitoring

killSwitch

exitPlan

owner

status

lastReviewed
```

---

# Provider Status

Recommended:

```text
evaluating

approved

active

degraded

paused

deprecated

removing

removed
```

---

# Provider Approval Criteria

Before activation:

```text
□ Purpose is approved.

□ Data categories are minimized.

□ Contract is reviewed.

□ Regions are known.

□ Security model is reviewed.

□ Callback authentication is verified.

□ Retention is understood.

□ Deletion behavior is understood.

□ Accessibility impact is reviewed.

□ Operational monitoring exists.

□ Rate limits are understood.

□ Cost is understood.

□ Kill switch exists.

□ Exit plan exists.
```

---

# Provider Adapter Requirement

Product and UI code should depend on a canonical communication Adapter.

Provider-specific:

- Payloads
- Error codes
- Token formats
- Callback formats
- SDK objects

must remain outside Product Domain contracts.

---

# Provider Authentication

Provider credentials should:

- Remain outside client code where possible.
- Use least privilege.
- Rotate.
- Avoid logs.
- Avoid AI prompts.
- Be revocable.
- Be environment-specific.

---

# Provider Webhook Governance

Callbacks should verify:

```text
Signature

Timestamp

Replay protection

Provider identity

Environment

Communication reference

Allowed event type
```

---

# Callback Idempotency

Repeated provider callbacks must not:

- Duplicate Notification Center entries
- Duplicate resolution messages
- Reopen resolved state incorrectly
- Create another communication

---

# Provider Rate Limits

The system should:

- Monitor current usage.
- Apply queue backpressure.
- Preserve Critical priority.
- Suppress low-priority sends.
- Avoid unbounded Retry.
- Alert before sustained exhaustion.

---

# Provider Cost Governance

Track cost by:

```text
Channel

Category

Region

Provider

Message count

Data size where relevant
```

Cost optimization must not weaken Critical communication or Privacy.

---

# Provider Degradation

When a provider degrades:

```text
Preserve in-Product messages.

Pause low-priority external communication.

Use alternate approved channel only when justified.

Avoid repeated Retry.

Communicate incident only when useful.
```

---

# Provider Kill Switch

A provider kill switch should:

- Stop new requests.
- Pause or reroute queues according to policy.
- Preserve message records.
- Avoid marking messages delivered.
- Be auditable.
- Be testable.

---

# Provider Migration

Migration should include:

```text
New provider evaluation

Adapter compatibility

Token or subscription migration

Template compatibility

Callback compatibility

Parallel testing

Deduplication across providers

Controlled rollout

Old provider shutdown

Credential revocation

Policy and Store updates
```

---

# Provider Migration Duplication Risk

During parallel operation:

```text
One communication must have one active delivery authority per channel.
```

Do not allow both providers to send the same message unless explicitly part of a controlled test with safe deduplication.

---

# Provider Removal

Complete removal includes:

```text
No new requests

No scheduled messages

No active tokens where applicable

No active webhooks

Credentials revoked

SDK removed

Permissions removed

Policies updated

Store declarations updated

Support updated

Monitoring removed or archived

Evidence preserved
```

---

# Reminder Scheduler Governance

The reminder scheduler is a communication provider or platform capability and requires separate governance.

---

# Scheduler Responsibilities

```text
Calculate next occurrence

Respect time zone

Respect recurrence

Respect quiet hours

Avoid duplication

Handle missed occurrences

Handle device restart

Handle owner switching

Handle cancellation

Handle deletion
```

---

# Scheduler Authority

The scheduler may trigger reminder communication.

It must not create:

- Transaction
- Transfer
- Goal contribution
- Account balance change

---

# Scheduler Audit

Verify:

- Time-zone rules
- Daylight-saving behavior
- Month-end behavior
- Device clock changes
- Recurrence identity
- Missed-reminder suppression
- Deletion cleanup

---

# Notification Center Governance

The Notification Center is a Product capability and requires:

- Product owner
- Data owner
- Retention
- Accessibility
- Search or filter behavior
- Recovery
- Migration
- Account deletion behavior

---

# Notification Center Persistent Data

Potential records:

```text
communicationId

ownerId

category

templateId

templateVersion

createdAt

readAt

resolutionState

resolvedAt

expiresAt

entityReference

privacyClassification
```

Avoid storing a full sensitive rendered body when it can be reconstructed safely from the template and approved variables.

---

# Notification Center Migration

Migrations must preserve:

- Owner
- Message identity
- Read state
- Resolution state
- Expiration
- Category
- Current deep-link safety

Do not migrate stale deep links without revalidation.

---

# Notification Center Recovery

Recovery should:

- Restore owner isolation.
- Recalculate current resolution from canonical state.
- Expire invalid messages.
- Preserve required Security evidence.
- Avoid restoring deleted-owner ordinary messages.

---

# Communication Retention Governance

Retention should be category-specific.

---

# Potential Retention Classes

```text
ephemeral

short

standard

extended

required_record
```

---

# Ephemeral

Examples:

- Toast
- Temporary Product tip
- Low-value local banner

---

# Short

Examples:

- Completed user reminder
- Product update
- Optional education

---

# Standard

Examples:

- Synchronization state history
- Export readiness
- Support communication

---

# Extended

Examples:

- Security activity
- Account deletion communication
- Preference change evidence

---

# Required Record

Used only for approved legal, Security, Privacy or audit evidence.

---

# Retention Expiration

On expiration:

- Remove or anonymize message content as approved.
- Remove unnecessary provider references.
- Preserve only required evidence.
- Update Notification Center.
- Respect Account deletion authority.

---

# Communication Data Export

Where applicable, user data Export may include:

- Communication preferences
- User-created reminders
- Notification Center history
- Marketing preference
- Relevant Account deletion communication history

It should avoid:

- Raw device tokens
- Internal provider credentials
- Security-sensitive operational logs
- Other owners' data

---

# Account Deletion Communication Data

Deletion should process:

```text
Push tokens

Web subscriptions

Local reminder schedules

Remote reminders

Notification Center messages

Optional communication preferences

Marketing profiles

Provider identifiers

Assistant communication context

Article or message feedback associations
```

Required suppression or audit records may remain under approved purpose and retention.

---

# Communication Support Architecture

Support should be able to determine:

```text
Whether the communication event exists

Which template version applied

Which channel was selected

Whether the message was suppressed

Which provider state is known

Whether the deep link is expired

Whether the owner preference applies

Whether the underlying Product state remains unresolved
```

Support should not require access to exact financial content.

---

# Support Diagnostic View

Potential safe fields:

```text
communicationId

category

templateId

templateVersion

channel

deliveryState

suppressionReason

attemptCount

eventTime

ProductVersion

providerFailureCategory

deepLinkState
```

---

# Support Diagnostic Prohibitions

Do not expose by default:

- Raw device token
- Authentication token
- Full message body containing sensitive variables
- Exact financial Amount
- Transaction description
- Another owner's communication
- Provider credential

---

# Communication Support Training

Support Agents should understand:

```text
Notification permission

Preference versus permission

Push versus in-Product state

Provider acceptance versus delivery

Read versus resolved

Unknown delivery

Unknown financial outcome

Deep-link reauthorization

Reminder recurrence

Account deletion communication
```

---

# Support Training Module — Permission versus Preference

Agents should explain:

```text
Android or browser permission controls whether the platform may show Notifications.

Nexio preferences control which eligible categories Nexio attempts to send.

Both may affect delivery.
```

---

# Support Training Module — Provider Acceptance

Agents should understand:

```text
Provider accepted
```

does not necessarily mean:

```text
The device displayed the Notification.
```

---

# Support Training Module — Missing Notification

Safe steps:

```text
1. Verify the current Product state inside Nexio.

2. Check category preference.

3. Check operating-system permission.

4. Check device or browser registration.

5. Check provider status.

6. Avoid recreating the financial event.
```

---

# Support Training Module — Duplicate Notification

Agents should:

- Identify the communication ID where available.
- Check whether one Product event created multiple sends.
- Avoid telling the user to repeat or reverse the financial operation.
- Escalate large-scale duplication.
- Explain that duplicate messages do not necessarily mean duplicate Transactions.

---

# Support Training Module — Wrong Owner

Any wrong-owner message is a Security and Privacy escalation.

Agents must not:

- Ask the recipient to open the protected content.
- Reveal the intended owner.
- Attempt informal reassignment.
- Dismiss it as a cosmetic issue.

---

# Support Training Module — Account Deletion

Agents should distinguish:

```text
Message delivery

Deletion request

Access restriction

Product data processing

Provider cleanup

Backup retention

Completion
```

An email delivery failure does not cancel the deletion request.

---

# Support Macro — Notification Missing

```text
First open Nexio and check the current Product status.

A missing Push Notification does not mean the underlying Transaction, reminder or deletion request failed.

Review Notification permission and communication preferences separately.
```

---

# Support Macro — Duplicate Notification

```text
A duplicate message does not automatically mean a duplicate financial record exists.

Do not create, delete or reverse a Transaction based only on the repeated Notification.

Open Nexio and review the current canonical record.
```

---

# Support Macro — Wrong Owner

```text
Do not open or interact with the protected destination.

This issue requires immediate Security and Privacy review.

Do not send screenshots containing private financial information unless the approved secure process requires them.
```

---

# Support Escalation Categories

Recommended:

```text
communication_missing

communication_duplicate

wrong_owner

sensitive_preview

permission_issue

preference_issue

unsubscribe_issue

deep_link_issue

reminder_schedule_issue

provider_failure

false_state

deletion_communication_issue

accessibility_issue
```

---

# Communication Experiment Governance

Communication experiments must follow the Product experimentation specification.

---

# Allowed Communication Experiments

Potential:

```text
Neutral title variation

Help-link placement

Reminder timing within the user's approved window

Preference-screen organization

Private-generic wording comprehension
```

---

# Prohibited Communication Experiments

Do not experiment with:

```text
Owner authorization

Security-event delivery requirement

Account deletion state accuracy

Sensitive financial exposure

Unsubscribe effectiveness

Required Accessibility

Marketing disguised as Product status

False urgency

Unknown-outcome Retry guidance
```

---

# Experiment Guardrails

Required:

```text
Complaint rate

Disablement rate

Unsubscribe success

Sensitive exposure

Wrong-owner signal

Duplicate-message rate

Quiet-hour violation

Safe action completion

Accessibility completion
```

---

# Experiment Stop Conditions

Stop when:

- Sensitive content exposure increases.
- Complaint rate indicates harm.
- Unsubscribe fails.
- Duplicate messages increase.
- Quiet hours are violated.
- Accessibility degrades.
- Product state is misunderstood.
- Users repeat uncertain financial actions.

---

# Communication Metrics Architecture

Recommended metric groups:

```text
Safety

Eligibility

Delivery

Preference

Reminder

User outcome

Accessibility

Provider

Operations

Content quality
```

---

# Safety Metrics

```text
cross_owner_delivery_count

deleted_owner_ordinary_send_count

false_completion_count

sensitive_preview_exposure_count

deep_link_authorization_bypass_count

unauthorized_action_count
```

Targets for these should be zero.

---

# Eligibility Metrics

```text
eligible_message_count

suppressed_preference_count

suppressed_owner_state_count

suppressed_duplicate_count

suppressed_expired_count

suppressed_quiet_hours_count

suppressed_frequency_count
```

---

# Delivery Metrics

```text
queued_count

provider_submission_count

provider_acceptance_count

delivery_confirmed_count

unknown_delivery_count

failed_retryable_count

failed_final_count
```

---

# Preference Metrics

```text
preference_change_success_rate

preference_sync_failure_rate

unsubscribe_success_rate

queued_cancellation_success_rate

optional_send_after_withdrawal_count
```

---

# Reminder Metrics

```text
reminder_creation_success_rate

reminder_schedule_accuracy

duplicate_occurrence_count

missed_occurrence_count

burst_suppression_count

snooze_success_rate

cancel_success_rate
```

---

# User-Outcome Metrics

```text
safe_action_completion_rate

unknown_operation_repeat_rate

security_review_completion_rate

deletion_action_completion_rate

Support_escalation_after_message_rate
```

---

# Accessibility Metrics

```text
notification_center_keyboard_completion

screen_reader_action_completion

large_text_failure_rate

communication_accessibility_complaint_rate

focus_failure_rate
```

---

# Provider Metrics

```text
provider_availability

invalid_destination_rate

rate_limit_rate

callback_failure_rate

callback_delay

authentication_failure_rate

regional_failure_rate
```

---

# Content Quality Metrics

```text
template_error_rate

translation_fallback_rate

message_comprehension_rate

incorrect_state_complaint_rate

template_staleness_rate
```

---

# Metric Anti-Gaming

Do not improve communication metrics by:

- Hiding required messages
- Removing Support access
- Marking messages delivered without evidence
- Treating provider acceptance as device delivery
- Treating open as resolution
- Suppressing complaints
- Disabling guardrails
- Sending fewer Security alerts than required
- Removing users from denominators without justification

---

# Communication Review Cadence

Recommended:

```text
Continuous operational review

Weekly provider and queue review

Release-cycle template review

Monthly communication portfolio review

Quarterly preference and Privacy review

Periodic Accessibility review

Annual provider exit and contract review

Incident-driven review
```

Exact cadence should reflect Product maturity and risk.

---

# Communication Portfolio Review

Review active:

```text
Categories

Templates

Channels

Providers

Reminders

Experiments

Temporary messages

Deprecated messages

Metrics

Incidents
```

---

# Communication Portfolio Health

Recommended states:

```text
healthy

watch

degraded

at_risk

paused
```

---

# Healthy

- Critical queues operate normally.
- Preferences are honored.
- No owner-isolation issue exists.
- Providers operate within approved range.
- Templates are current.
- Support can diagnose failures.

---

# Watch

- Provider trend requires observation.
- Template review is approaching.
- Invalid-token rate is increasing.
- Low-priority queue is growing.

---

# Degraded

- One channel is materially failing.
- Alternate in-Product state remains available.
- User impact exists.
- Correction is active.

---

# At Risk

- Critical communication may fail.
- Owner isolation is uncertain.
- Account deletion communication is unreliable.
- Provider contract or credential is unstable.

---

# Paused

Affected communication category, channel or provider is intentionally disabled.

---

# Communication Change Management

A material communication change should identify:

```text
Affected categories

Affected templates

Affected channels

Affected providers

Affected owner states

Preference impact

Privacy impact

Accessibility impact

Deep-link impact

Support impact

Release impact

Rollback
```

---

# Material Communication Changes

Examples:

- New Push provider
- New Android channel
- New email category
- New marketing purpose
- New detailed preview
- New deep-link type
- New reminder recurrence
- New Account deletion state
- New communication data field

---

# Communication Change Record

Recommended:

```markdown
# Communication Change

## Purpose

What communication capability is changing?

## Product Event

Which authoritative event applies?

## Audience and Owner Scope

Which owners are eligible?

## Categories and Channels

Which categories and channels change?

## Templates

Which template IDs and versions change?

## Preferences

How do current choices apply?

## Privacy

Which data may appear or leave Nexio?

## Accessibility

Which message and destination checks apply?

## Providers

Which provider or Adapter changes?

## Delivery and Retry

How do delivery, unknown outcome and Retry behave?

## Account Deletion

How is deleted-owner behavior affected?

## Support and Operations

Which diagnostics, alerts and runbooks change?

## Rollback

How can the capability be disabled safely?
```

---

# Communication Pull Request Contract

Material Pull Requests should include:

```markdown
## Communication Requirements

- NEX-...

## Events

Which authoritative events are used?

## Templates

- NTF-...

## Channels

Android Push / Web Push / Email / In-Product / Local

## Owner Isolation

How is recipient ownership enforced?

## Preferences

Which preferences are evaluated?

## Sensitive Data

Which variables are allowed and prohibited?

## Deep Links

Which destinations are supported?

## Retry and Deduplication

How is one communication identity preserved?

## Tests

Which owner, provider, platform, Accessibility and failure tests were executed?

## Operations

Which metrics, alerts and runbooks exist?

## Remaining Gaps

Which risks remain?
```

---

# Communication Definition of Ready

A capability is ready for delivery planning only when:

```text
□ Purpose is defined.

□ Product event is authoritative.

□ Owner scope is defined.

□ Category is registered.

□ Required or optional status is defined.

□ Channels are defined.

□ Privacy level is defined.

□ Preferences are defined.

□ Deep-link behavior is defined.

□ Failure behavior is defined.

□ Owner is assigned.
```

---

# Communication Definition of Implemented

A capability is implemented when:

```text
□ Event mapping exists.

□ Policy exists.

□ Template exists.

□ Adapter integration exists.

□ Queue or scheduler exists where needed.

□ Preference evaluation exists.

□ Deep link exists where needed.

□ Monitoring hooks exist.
```

Implementation does not mean verified, released or delivered.

---

# Communication Definition of Verified

A capability is verified when:

```text
□ Product-state wording is correct.

□ Owner-isolation tests pass.

□ Preference tests pass.

□ Privacy tests pass.

□ Accessibility tests pass.

□ Localization tests pass.

□ Queue and Retry tests pass.

□ Provider tests pass.

□ Deep-link tests pass.

□ Account deletion behavior passes.
```

---

# Communication Definition of Releasable

A capability is releasable when:

```text
□ Required templates are active.

□ Provider configuration is Production-ready.

□ Credentials are protected.

□ Kill switch works.

□ Monitoring and alerts are active.

□ Support guidance exists.

□ Runbooks exist.

□ Store and policy declarations are current.

□ Rollback is defined.
```

---

# Communication Definition of Released

A capability is released when:

```text
□ Approved owners can receive it.

□ Channel scope is accurate.

□ Product version is active.

□ Template version is recorded.

□ Provider is active.

□ Operational monitoring confirms processing.

□ Release record exists.
```

---

# Communication Definition of Operationally Verified

A capability is operationally verified when:

```text
□ Production event generation is observed.

□ Eligibility and suppression behave correctly.

□ Queue health is acceptable.

□ Provider processing is observed.

□ Owner isolation remains intact.

□ Preference changes are honored.

□ Deep links reauthorize.

□ No Critical guardrail failure exists.
```

---

# Communication Definition of Current

A communication capability is current when:

```text
□ Product event remains valid.

□ Template remains accurate.

□ Provider remains approved.

□ Locales remain current.

□ Preference logic remains correct.

□ Deep links remain valid.

□ Support and runbooks remain current.

□ Review date has not expired.
```

---

# Communication Definition of Removed

A capability is fully removed only when:

```text
□ Events no longer create it.

□ Templates are inactive.

□ Queued messages are cancelled.

□ Scheduled messages are cancelled.

□ Provider configuration is removed.

□ Tokens or subscriptions are migrated or revoked.

□ SDK and permissions are removed where applicable.

□ Deep links are removed or redirected.

□ Support macros are updated.

□ Policies and Store declarations are updated.

□ Metrics and alerts are retired.

□ Historical evidence remains preserved.
```

---

# AI Communication Governance

AI may assist with drafting, localization support, classification, audit preparation and content analysis.

AI must not become the authority for:

```text
Product event truth

Owner eligibility

Recipient selection

Channel selection

Urgency

Financial state

Security incident state

Account deletion completion

Delivery evidence
```

---

# AI Required Context

Before drafting or reviewing a communication, an AI system should receive:

```text
Communication purpose

Authoritative Product event

Category

Owner scope

Allowed channels

Privacy level

Required variables

Forbidden variables

Current template

Current locale glossary

Deep-link behavior

Expiration

Support guidance

Applicable requirements
```

---

# AI Allowed Communication Uses

AI may assist with:

- Drafting neutral message text
- Plain-language revision
- Translation draft
- Detecting inconsistent terminology
- Comparing template versions
- Generating comprehension questions
- Detecting potentially manipulative wording
- Detecting unsupported urgency
- Grouping complaint themes
- Drafting incident-message structure

---

# AI Forbidden Communication Uses

AI must not:

- Invent an event.
- Invent a Security incident.
- Invent a deadline.
- Invent an Amount.
- Invent a balance.
- Invent deletion completion.
- Invent provider delivery.
- Select an owner.
- Select a recipient.
- Send a message autonomously.
- Reenable a disabled category.
- Generate marketing from financial behavior.
- Create direct financial actions.
- Claim testing or delivery without evidence.

---

# AI Communication Evidence Labels

AI output should distinguish:

```text
verified_state

approved_template_content

draft_wording

inference

requires_verification

unknown
```

---

# AI Template Drafting Rules

AI drafts should:

- Use only approved variables.
- Avoid exact financial data by default.
- Preserve uncertainty.
- Preserve optionality.
- Preserve required action.
- Use calm language.
- Avoid shame.
- Avoid false urgency.
- Include a safe next action.
- Respect channel length.

---

# AI `pt-BR` Example Rule

When an AI draft needs a generic Brazilian Currency example, use:

```text
R$ 84,90
```

or:

```text
R$ 1.250,00
```

and clearly identify the value as a synthetic BRL example.

Do not convert user-provided values.

---

# AI Incident-Drafting Rules

AI may prepare a draft structure from verified incident facts.

It must not:

- Add a restoration estimate.
- Claim a root cause before confirmation.
- Expand affected scope.
- Minimize owner or Privacy risk.
- State that all records are reconciled without evidence.

---

# AI Marketing Rules

AI-generated marketing communication must not use:

- Transaction behavior
- Account balance
- Goal progress
- Support history
- Assistant prompt
- Privacy request
- Deletion state

as persuasive targeting context.

---

# AI Support-Communication Rules

AI may draft Support responses using:

- Approved case category
- Approved Help article
- Current communication state
- Safe diagnostics

It must not request secrets or full financial records.

---

# AI Communication Prompt Template

```text
You are drafting a bounded Nexio communication.

Communication purpose:
[PURPOSE]

Authoritative Product event:
[EVENT]

Event state:
[STATE]

Owner eligibility:
[ELIGIBILITY RULE]

Category:
[CATEGORY]

Required or optional:
[CLASSIFICATION]

Channel:
[CHANNEL]

Privacy level:
[PRIVACY LEVEL]

Allowed variables:
[ALLOWED VARIABLES]

Forbidden variables:
[FORBIDDEN VARIABLES]

Required action:
[ACTION]

Deep-link destination:
[DESTINATION]

Expiration:
[EXPIRATION]

Locale:
[LOCALE]

Current Product terminology:
[TERMINOLOGY]

Support guidance:
[SUPPORT]

Do not invent:
- Product state
- Financial Amounts
- Security incidents
- Deadlines
- Provider delivery
- Deletion completion
- User identity
- Available features

Use calm, direct and nonjudgmental language.

Preserve uncertainty when the Product state is uncertain.

Do not expose sensitive financial information.
```

---

# AI Communication Review Questions

Before approving AI-generated communication:

```text
Is the Product event real?

Is the owner scope correct?

Does the message state the current status accurately?

Does it imply completion incorrectly?

Does it include forbidden data?

Is urgency justified?

Does it respect optionality?

Is the action safe?

Does the deep link reauthorize?

Was Accessibility reviewed?

Was localization reviewed?
```

---

# AI Test Honesty

AI must distinguish:

```text
Draft created

Template reviewed

Template activated

Test written

Test executed

Provider accepted

Delivery confirmed

Message opened

Product state resolved

Unknown
```

These states must not be merged.

---

# Final Communication Checklists

---

# New Communication Category Checklist

```text
□ Purpose is defined.

□ Product event is defined.

□ Required or optional status is defined.

□ Owner eligibility is defined.

□ Allowed channels are defined.

□ Default privacy level is defined.

□ Preference behavior is defined.

□ Quiet-hour behavior is defined.

□ Frequency policy is defined.

□ Expiration is defined.

□ Retention is defined.

□ Deleted-owner behavior is defined.

□ Category owner exists.
```

---

# New Template Checklist

```text
□ Template ID exists.

□ Template version exists.

□ Purpose matches the category.

□ Product-state wording is verified.

□ Required variables are defined.

□ Forbidden variables are defined.

□ Generic privacy-safe content exists.

□ Actions are explicit.

□ Deep link is safe.

□ Expiration is defined.

□ Accessibility review passes.

□ Localization review passes.

□ Content owner exists.

□ Review date exists.
```

---

# Android Push Checklist

```text
□ Notification permission is contextual.

□ Denial preserves core access.

□ Android channel is appropriate.

□ Importance is appropriate.

□ Token is owner-bound.

□ Token is protected.

□ Account switching detaches prior owner.

□ Sign-out protects content.

□ Account deletion cancels ordinary sends.

□ Foreground duplication is prevented.

□ Process-death opening is safe.

□ Back stack is safe.

□ Lock-screen privacy defaults are conservative.

□ Upgrade behavior is tested.
```

---

# Web Push Checklist

```text
□ HTTPS context exists.

□ Browser support is detected.

□ Service Worker is bounded.

□ Permission is contextual.

□ Subscription is owner-bound.

□ Multi-tab coordination exists.

□ Sign-out revokes or detaches subscription.

□ Notification click reauthorizes.

□ Stale links use fallback.

□ Cached content is minimized.
```

---

# Reminder Checklist

```text
□ Reminder has an owner.

□ Purpose is clear.

□ Schedule is valid.

□ Time zone is explicit.

□ Recurrence is explicit.

□ Short-month behavior is explicit.

□ Quiet hours apply.

□ Privacy preview is shown.

□ Snooze preserves identity.

□ Edit cancels prior future schedule.

□ Missed reminders are bounded.

□ Completion does not create financial state.

□ Account deletion removes future reminders.
```

---

# Notification Center Checklist

```text
□ Messages are owner-scoped.

□ Unread and unresolved are distinct.

□ Required actions are prioritized.

□ Filters are accessible.

□ Read state synchronizes safely where applicable.

□ Resolution derives from Product state.

□ Retention is defined.

□ Account deletion behavior is defined.

□ Migration is defined.

□ Recovery is defined.

□ Empty and error states are accurate.
```

---

# Deep-Link Checklist

```text
□ Origin is approved.

□ Type is registered.

□ Expiration is validated.

□ Authentication is validated.

□ Current owner is validated.

□ Entity ownership is validated.

□ Current state is validated.

□ Minimum version is validated.

□ Safe fallback exists.

□ Open redirects are blocked.

□ Loops are prevented.

□ Protected content is not embedded in the URL.
```

---

# Queue and Retry Checklist

```text
□ Queue is durable where required.

□ Communication identity is stable.

□ Worker leasing exists.

□ Eligibility is rechecked.

□ Preference is rechecked.

□ Owner state is rechecked.

□ Expiration is rechecked.

□ Provider acceptance is reconciled.

□ Retry is bounded.

□ Backoff is jittered.

□ Unknown outcome does not create a new message.

□ Deletion and withdrawal cancel queued messages.

□ Backpressure preserves Critical priority.
```

---

# Privacy Checklist

```text
□ Exact financial values are excluded by default.

□ Lock-screen content is generic by default.

□ Detailed previews require user control.

□ Owner switching resets context.

□ Sign-out hides sensitive content.

□ Deleted owners stop ordinary communication.

□ Optional withdrawal stops future sends.

□ Logs exclude sensitive payloads.

□ Retention is category-specific.

□ Providers receive minimum data.

□ Marketing avoids financial targeting.
```

---

# Accessibility Checklist

```text
□ Message title communicates purpose.

□ Action labels are unique.

□ Meaning does not depend on color.

□ Meaning does not depend on sound.

□ Meaning does not depend on motion.

□ Notification Center works by keyboard.

□ Screen-reader order is logical.

□ Large text reflows.

□ Email has semantic structure.

□ Deep-link destination restores focus.

□ Critical content passed comprehension review.
```

---

# Account Deletion Communication Checklist

```text
□ Request state is authoritative.

□ Access-restricted state is authoritative.

□ Product-data processing is accurate.

□ Provider cleanup is distinct.

□ Backup retention is distinct.

□ Completed state has official evidence.

□ Ordinary reminders stop.

□ Marketing stops.

□ Tokens and subscriptions are processed.

□ Subscription distinction is accurate.

□ Stale links cannot recreate access.

□ Support guidance is current.
```

---

# Provider Checklist

```text
□ Provider is registered.

□ Adapter exists.

□ Credentials are protected.

□ API and SDK versions are current.

□ Webhook authentication exists.

□ Callback idempotency exists.

□ Rate limits are known.

□ Regions are known.

□ Retention is known.

□ Deletion behavior is known.

□ Monitoring exists.

□ Kill switch works.

□ Exit plan exists.
```

---

# Incident Checklist

```text
□ Incident category is defined.

□ Severity is defined.

□ Sends can be contained.

□ Affected templates can be withdrawn.

□ Provider can be paused.

□ User impact can be assessed.

□ Support is notified.

□ Corrective communication is possible.

□ Evidence is preserved.

□ Post-incident review is scheduled.
```

---

# Support Training Checklist

```text
□ Agents distinguish permission from preference.

□ Agents distinguish provider acceptance from delivery.

□ Agents distinguish read from resolved.

□ Agents preserve unknown financial operation identity.

□ Agents do not recommend repeated financial action.

□ Agents do not request secrets.

□ Agents escalate wrong-owner communication.

□ Agents understand reminder recurrence.

□ Agents understand deletion communication states.

□ Agents use current templates and Help content.
```

---

# Communication Release Gate

A release must not proceed when:

```text
Owner isolation is unverified.

Optional preference enforcement is unverified.

Account deletion communication is inaccurate.

Deep links bypass Authentication.

Exact financial content appears in generic previews.

Unknown provider outcomes create duplicate messages.

Critical state is available only through external delivery.

Provider kill switch is unavailable.

Required templates are not localized.

Accessibility critical tests fail.

Deleted-owner suppression is unverified.

Support and incident runbooks are missing.
```

---

# Post-Release Communication Review

After release, review:

```text
Event-generation accuracy

Eligibility and suppression

Queue health

Provider health

Preference propagation

Owner-isolation signals

Deep-link failures

Reminder scheduling

Notification Center behavior

User complaints

Accessibility findings

Account deletion messages

Template drift

Support escalations
```

---

# Final Acceptance Criteria

The Nexio Notifications, Reminders and User Communications architecture is accepted only when:

1. Communications remain separate from canonical financial mutation.

2. Every material communication originates from an authoritative Product event.

3. Communication policy is evaluated before sending.

4. Every category has a stable Registry entry.

5. Every active template has a stable identifier.

6. Template identifiers are not reused for unrelated purposes.

7. Material template changes create a new version.

8. Every template has an accountable owner.

9. Every template defines required and forbidden variables.

10. Exact financial data is forbidden by default.

11. Lock-screen content defaults to generic private content.

12. Detailed previews require explicit user control.

13. Communication content uses calm nonjudgmental language.

14. Communication does not use shame or fear.

15. Urgency is evidence-based.

16. Marketing cannot masquerade as Security.

17. Advertising remains separate from Product status.

18. Generic `pt-BR` examples use BRL consistently.

19. Generic BRL examples remain synthetic.

20. User-provided Currency values are not converted by communication systems.

21. Product-state wording receives technical review.

22. Financial-state wording receives Domain review.

23. Security messages receive Security review.

24. Optional communication receives Privacy review.

25. Critical messages receive Accessibility review.

26. Localizations preserve material meaning.

27. Negation and uncertainty remain correct in translation.

28. Template rendering fails safely.

29. Partially rendered messages are not sent.

30. Communication titles remain meaningful when truncated.

31. Action labels describe the real action.

32. Communication length is channel-aware.

33. Every external channel has an approved purpose.

34. In-Product state remains the primary Product-status authority.

35. External delivery is never assumed.

36. Provider acceptance is not device delivery.

37. Message open is not Product resolution.

38. Read state remains distinct from resolution state.

39. Notification Center remains owner-scoped.

40. Notification Center prioritizes action-required states.

41. Notification Center supports keyboard and screen reader.

42. Notification Center retention is governed.

43. Notification Center migrations preserve owner isolation.

44. Notification Center recovery recalculates current state.

45. Communication eligibility checks owner state.

46. Deleted owners stop receiving ordinary communication.

47. Account switching resets communication context.

48. Sign-out protects sensitive content.

49. Push tokens remain owner-bound.

50. Web subscriptions remain owner-bound.

51. Raw provider tokens are treated as sensitive.

52. Device-token rotation prevents duplicates.

53. Multi-device behavior is explicit.

54. Deep links never trust owner hints as authorization.

55. Deep links validate origin.

56. Deep links validate expiration.

57. Deep links validate Authentication.

58. Deep links validate current owner.

59. Deep links validate entity ownership.

60. Deep links validate current Product state.

61. Deep links have safe fallbacks.

62. Deep-link loops are prevented.

63. Notification actions cannot execute unauthorized financial commands.

64. Reminder completion does not create a Transaction.

65. Reminder identity remains stable.

66. Reminder time zone is explicit.

67. Daylight-saving behavior is defined.

68. Short-month recurrence behavior is defined.

69. Snooze does not duplicate recurrence.

70. Missed reminders are bounded.

71. Reminder bursts are suppressed.

72. Owner switching cancels prior-owner local schedules.

73. Account deletion cancels ordinary reminders.

74. Communication preferences are owner-scoped.

75. Owner-global withdrawal cannot be overridden by device settings.

76. Local optional sending stops immediately after local withdrawal where possible.

77. Remote preference synchronization is governed.

78. Preference Conflicts use an approved safe rule.

79. Queued optional messages are cancelled after withdrawal.

80. Unsubscribe is accessible.

81. Unsubscribe evidence is retained only for approved purpose.

82. Quiet hours are supported.

83. Low-priority communication does not override quiet hours.

84. Frequency caps are category-specific.

85. Deduplication occurs before provider submission.

86. Communication retries preserve the same identity.

87. Provider timeout becomes unknown delivery.

88. Unknown delivery does not create a new communication automatically.

89. Retry rechecks owner state.

90. Retry rechecks preference.

91. Retry rechecks expiration.

92. Retry rechecks Product relevance.

93. Queue workers use safe leasing.

94. Queue backpressure protects Critical communication.

95. Low-priority communication may be suppressed during overload.

96. Queue cancellation handles deletion and withdrawal.

97. Every provider remains behind an Adapter.

98. Provider-specific payloads remain outside Product contracts.

99. Provider credentials are environment-specific.

100. Provider credentials are protected and rotatable.

101. Provider callbacks are authenticated.

102. Provider callbacks are replay-protected.

103. Provider callbacks are idempotent.

104. Provider rate limits are monitored.

105. Provider costs are monitored without weakening safety.

106. Provider health is not inferred only from API acceptance.

107. Every provider has a kill switch.

108. Every provider has an exit plan.

109. Provider migration prevents duplicate delivery.

110. Provider removal includes credentials, SDKs and webhooks.

111. Provider removal updates policies and Store declarations.

112. Communication logs minimize message bodies.

113. Communication logs exclude exact financial values.

114. Communication logs exclude raw tokens.

115. Communication retention is category-specific.

116. Communication Export excludes secrets and other owners' data.

117. Account deletion processes tokens and subscriptions.

118. Account deletion processes local and remote reminders.

119. Account deletion processes Notification Center history.

120. Account deletion stops marketing.

121. Account deletion completion messages require authoritative evidence.

122. Provider cleanup and backup retention are distinct deletion states.

123. Subscription cancellation remains distinct from Account deletion where applicable.

124. Wrong-owner communication is a Security and Privacy incident.

125. Cross-owner delivery target is zero.

126. Deleted-owner ordinary-send target is zero.

127. False-completion target is zero.

128. Deep-link authorization bypass target is zero.

129. Sensitive-preview exposure target is zero.

130. Communication telemetry is privacy-safe.

131. Event-generation telemetry excludes financial payload.

132. Queue telemetry measures age and Retry.

133. Provider telemetry measures failure categories.

134. Deep-link telemetry records authorization outcomes safely.

135. Preference telemetry measures synchronization and withdrawal.

136. Reminder telemetry measures recurrence and duplication.

137. Notification Center telemetry does not treat open as resolution.

138. Communication SLOs distinguish Product and provider stages.

139. Critical queue latency has an approved objective.

140. Preference propagation has an approved objective.

141. Unsubscribe effectiveness has an approved objective.

142. Reminder scheduling accuracy has an approved objective.

143. Notification Center availability is monitored.

144. Nonbudgetable owner and Privacy failures remain zero-tolerance.

145. Communication dashboards include owner-safety signals.

146. Critical alerts are connected to runbooks.

147. Alerts avoid sensitive payloads.

148. Communication incident categories are defined.

149. Communication incidents support immediate send containment.

150. Templates can be withdrawn.

151. Categories can be paused.

152. Providers can be disabled.

153. Detailed previews can be disabled.

154. Wrong-owner incidents trigger immediate containment.

155. Duplicate-send incidents stop automatic Retry.

156. False-completion incidents require corrected communication.

157. Broken-unsubscribe incidents stop affected campaigns.

158. Incident user communication uses verified facts.

159. Post-incident reviews examine event, policy, provider and queue behavior.

160. Communication audits cover templates, channels and providers.

161. Communication audits cover owner isolation.

162. Communication audits cover preferences.

163. Communication audits cover deep links.

164. Communication audits cover reminder scheduling.

165. Communication audits cover Account deletion.

166. Communication audits cover marketing.

167. Critical audit findings require containment.

168. Previously delivered unsafe messages may require correction.

169. Communication experiments remain bounded.

170. Experiments cannot vary owner authorization.

171. Experiments cannot vary deletion accuracy.

172. Experiments cannot vary unsubscribe effectiveness.

173. Experiments include safety guardrails.

174. Experiments stop after harmful comprehension or behavior.

175. Support can inspect safe communication diagnostics.

176. Support cannot access other-owner communication.

177. Support diagnostics exclude exact financial data.

178. Support understands permission versus preference.

179. Support understands acceptance versus delivery.

180. Support understands read versus resolved.

181. Support does not tell users to recreate financial operations because of a missing Notification.

182. Support escalates wrong-owner delivery immediately.

183. Support training includes Account deletion states.

184. Communication change records identify owner and Privacy impact.

185. Pull Requests identify events, templates and channels.

186. Communication Definition of Ready is defined.

187. Communication Definition of Implemented is defined.

188. Communication Definition of Verified is defined.

189. Communication Definition of Releasable is defined.

190. Communication Definition of Released is defined.

191. Communication Definition of Operationally Verified is defined.

192. Communication Definition of Current is defined.

193. Communication Definition of Removed is defined.

194. AI may assist with communication drafting.

195. AI is not event-state authority.

196. AI is not recipient-selection authority.

197. AI is not urgency authority.

198. AI cannot invent Security events.

199. AI cannot invent Product completion.

200. AI cannot invent provider delivery.

201. AI cannot send messages autonomously.

202. AI-generated templates use only approved variables.

203. AI-generated communication avoids sensitive financial details.

204. AI preserves uncertainty.

205. AI-generated marketing cannot use private financial behavior.

206. AI incident drafts require verified facts.

207. AI distinguishes drafting from testing and delivery.

208. Release gates block unsafe communication capability.

209. Post-release communication review is required.

210. Every communication remains traceable from Product event to operational result.

---

# Notifications, Reminders and User Communications Constitutional Rule

Every Nexio communication category, template, reminder, message, queue item, provider request, deep link, preference, incident update and AI-generated draft must answer:

```text
Which authoritative Product event justifies this communication, which owner is eligible, which current preference applies, which minimum data is necessary, which channel is appropriate, which safe action is available and how does Nexio remain correct when the message is suppressed, delayed, duplicated, mistranslated, delivered to no device or opened after the Product state has changed?
```

When the answer is uncertain, prefer the action that:

- Keeps the Product state in Nexio.
- Suppresses external delivery.
- Uses generic private content.
- Revalidates the current owner.
- Revalidates preferences.
- Revalidates the Product event.
- Preserves communication identity.
- Avoids Retry.
- Cancels queued optional messages.
- Disables the template.
- Disables the provider.
- Removes unsupported urgency.
- Removes sensitive financial details.
- Requires Accessibility and Privacy review.
- Escalates through Operations.
- Blocks release.

Communication is not successful because it reached a provider, appeared on a device or produced an application open.

It is successful only when the correct eligible owner receives an accurate, accessible, privacy-safe and nonmanipulative explanation of a real Product state and can take a safe action without creating financial, owner, Security, deletion or recovery risk.

---

# Final Authority

This document is the official Notifications, Reminders and User Communications specification for Nexio.

All future:

- In-Product notifications
- Notification Center messages
- Android Push Notifications
- Web Push Notifications
- Local Notifications
- Email communications
- Security communications
- Authentication communications
- Synchronization alerts
- Financial-operation messages
- Recovery messages
- Account deletion messages
- User-created reminders
- Goal reminders
- Report reminders
- Export messages
- Product education
- Product updates
- Service-incident messages
- Support communications
- Privacy communications
- Marketing communications
- Communication categories
- Communication policies
- Notification templates
- Reminder schedules
- Quiet hours
- Frequency limits
- Device tokens
- Web Push subscriptions
- Communication queues
- Retry policies
- Deduplication
- Delivery callbacks
- Deep links
- Communication preferences
- Provider integrations
- Communication metrics
- Communication SLOs
- Communication audits
- Communication incidents
- Support macros
- Support training
- AI-assisted communication

must comply with this specification.

Exceptions require a documented Product, Domain, Security, Privacy, Accessibility, Android, Web, Operations, Support, Compliance, Content, Localization, Provider or Release decision containing:

- Communication identifier
- Template identifier and version
- Named owner
- Product event
- Owner eligibility
- Category
- Required or optional status
- Channel
- Provider
- Privacy level
- Allowed variables
- Prohibited variables
- Preference behavior
- Quiet-hour behavior
- Frequency behavior
- Deep-link behavior
- Financial impact
- Owner-isolation impact
- Privacy impact
- Accessibility impact
- Account deletion impact
- Delivery and Retry behavior
- Monitoring
- Expiration
- Compensating control
- Resolution plan
- Required approvers

Undocumented communication events, unsupported urgency, sensitive financial previews, stale templates, wrong-owner delivery, optional messaging after withdrawal, fabricated AI communication and false Product-completion messages are considered Product, financial-integrity, Security, Privacy, Accessibility, reliability, Support, operational and governance debt.

---