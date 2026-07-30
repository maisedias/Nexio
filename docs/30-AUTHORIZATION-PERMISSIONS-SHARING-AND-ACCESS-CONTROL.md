# Nexio Authorization, Permissions, Sharing and Access Control Specification

Version: 1.0  
Status: Official  
Authority Level: Authorization, Permission, Resource Access, Sharing and Privileged-Access Standard  
Applies To: Web, Desktop, Tablet, Mobile Web, Android, Application Services, Domain Commands, Queries, Supabase, Database Policies, Row-Level Security, Storage, APIs, Background Jobs, Integrations, Support Tools, Administrative Tools, Imports, Exports, Notifications, Billing, Advertising, AI, Audit and Account Deletion

---

# Purpose

This document defines the official Authorization, Permissions, Sharing and Access Control architecture for Nexio.

It establishes how Nexio should:

- Authorize access to financial resources
- Distinguish Authentication from Authorization
- Resolve the current financial Owner
- Enforce Owner isolation
- Define actors
- Define roles
- Define permissions
- Define resource scopes
- Define policy decisions
- Apply deny-by-default behavior
- Validate commands
- Validate queries
- Validate storage access
- Validate file access
- Validate deep-linked resources
- Protect Imports and Exports
- Protect subscription and entitlement state
- Protect Notifications
- Protect Assistant context
- Protect Support and administrative tools
- Limit service-to-service access
- Limit provider access
- Limit background jobs
- Control temporary elevated access
- Audit privileged access
- Support emergency access safely
- Govern future resource sharing
- Prevent public-link leakage
- Prevent cross-owner access
- Prevent role escalation
- Prevent insecure direct object references
- Prevent UI-only access control
- Prevent stale permission use
- Prevent Support impersonation
- Preserve Account deletion and Privacy rights
- Use AI only for bounded policy-assistance tasks

The objective is to ensure that Authorization never becomes:

```text
A frontend visibility check

A role name without explicit permissions

A valid Session assumed to access every resource

An email match treated as ownership

A guessed resource identifier accepted by an API

A database query without Owner filtering

A Support shortcut into private financial records

A provider integration with unrestricted data access

A background job operating without an Actor

A public link without expiration or revocation

A temporary permission that never expires

A shared Device leaking another Owner's data

An AI decision granting access

An administrator bypass without audit

An emergency-access mechanism used for convenience
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
docs/26-NOTIFICATIONS-REMINDERS-AND-USER-COMMUNICATIONS.md
docs/27-IMPORT-EXPORT-AND-DATA-PORTABILITY.md
docs/28-MONETIZATION-SUBSCRIPTIONS-ADVERTISING-AND-ENTITLEMENTS.md
docs/29-IDENTITY-ACCOUNT-SESSION-AND-RECOVERY.md
```

Responsibilities are divided as follows:

| Document | Responsibility |
|---|---|
| `06-DATA-MODEL.md` | Defines canonical resources and Owner relationships |
| `07-SECURITY.md` | Defines security controls and threat response |
| `08-OFFLINE-AND-SYNC.md` | Defines offline Owner partitions and synchronization authority |
| `12-ASSISTANT-AND-AI.md` | Defines Assistant access boundaries |
| `13-PRIVACY-AND-DATA-GOVERNANCE.md` | Defines purpose, minimization and Privacy rights |
| `17-API-AND-INTEGRATIONS.md` | Defines integration Ports, Adapters and provider scopes |
| `20-SUPPORT-AND-USER-OPERATIONS.md` | Defines Support access and escalation |
| `27-IMPORT-EXPORT-AND-DATA-PORTABILITY.md` | Defines file ownership and data portability |
| `28-MONETIZATION-SUBSCRIPTIONS-ADVERTISING-AND-ENTITLEMENTS.md` | Defines capability entitlements and billing-related access |
| `29-IDENTITY-ACCOUNT-SESSION-AND-RECOVERY.md` | Defines authenticated Identity, Session, Device and Owner resolution |
| `30-AUTHORIZATION-PERMISSIONS-SHARING-AND-ACCESS-CONTROL.md` | Defines who may perform which action on which resource |

Authentication answers:

```text
Who established a valid identity and Session?
```

Authorization answers:

```text
May this Actor perform this action on this specific resource under the current Product state?
```

---

# Authorization Constitutional Principles

## Authentication Is Not Authorization

A valid Session does not automatically authorize access to:

- Every Account
- Every Transaction
- Every Goal
- Every Export
- Every Import
- Every attachment
- Every Notification
- Every purchase
- Every Support case
- Every administrative tool

Every protected action requires an Authorization decision.

---

## Owner Isolation Is the Default

The default individual Nexio model is:

```text
One financial Owner

↓

Only that Owner may access the Owner's financial resources
```

No resource is shared merely because:

- Two users have the same display name
- Two users use the same Device
- Two users use similar email addresses
- A Support Agent can locate both Accounts
- A provider returns the same commercial Product
- A resource identifier is known

---

## Deny by Default

When no explicit policy allows an action:

```text
Deny
```

Unknown, missing, stale or conflicting policy state must not become permission.

---

## Every Resource Has an Ownership Boundary

Every protected resource must identify one of:

```text
ownerId

AccountId

identityId

systemScope

publicScope
```

Owner-scoped Product resources should normally identify:

```text
ownerId
```

---

## Every Action Has an Actor

No protected operation should execute without a canonical Actor.

Actors may include:

```text
Authenticated Owner

System service

Background job

Support Agent

Security Operator

Provider Adapter

Migration process

Deletion coordinator
```

The Actor must be explicit.

---

## Every Access Decision Has a Purpose

Access should be limited to an approved purpose such as:

```text
Owner Product use

Synchronization

Import processing

Export generation

Security investigation

Support resolution

Account deletion

Provider verification

Backup and restoration
```

An Actor authorized for one purpose is not automatically authorized for another.

---

## Permission Is Action-Specific

Permission should distinguish actions such as:

```text
read

list

create

update

delete

export

share

restore

approve

revoke

administer
```

A `read` permission must not imply `update`.

An `update` permission must not imply `delete`.

---

## Resource Listing Is Protected

Authorization applies not only to opening one resource but also to:

- Listing resources
- Counting resources
- Searching resources
- Autocompleting names
- Showing totals
- Displaying existence
- Returning error differences

A user must not infer another Owner's resource existence.

---

## Server-Side Enforcement Is Required

UI hiding is useful for experience.

It is not sufficient for security.

Protected access must be enforced at the trusted Application, API, database or storage boundary.

---

## Database Enforcement Must Preserve Owner Scope

Where Row-Level Security or equivalent database policies are available, they should reinforce Owner isolation.

Database policy does not replace Application authorization.

Application authorization does not replace database policy where defense in depth is required.

---

## Resource Identifiers Are Not Authorization

Knowing:

```text
transactionId

goalId

exportId

filePath

notificationId
```

does not grant access.

Every identifier lookup must validate the resource's Owner or approved scope.

---

## Authorization Must Be Rechecked at Command Time

A permission displayed in the UI may change before execution.

Every protected command must re-evaluate Authorization immediately before committing state.

---

## Authorization Must Be Rechecked at Delivery Time

When delivering:

- Export files
- Notification actions
- Deep links
- Attachments
- Reports
- Provider callbacks

Nexio must recheck the current Actor, Owner and resource state.

---

## Authorization Must Survive Retries Safely

A retried operation must preserve:

```text
Actor

Owner

Resource

Action

Purpose

Original operation identity
```

A Retry must not run under a different Owner or elevated Actor.

---

## Authorization Must Be Owner-Safe Offline

Offline actions may rely on bounded prior Authorization.

They must:

- Remain Owner-scoped
- Preserve the original Actor
- Preserve the original Device
- Preserve operation identity
- Be reauthorized before synchronization
- Never migrate automatically to another Owner

---

## Session Change Invalidates Stale Authorization

After:

- Sign-out
- Owner switch
- Session revocation
- Security-version change
- Device revocation
- Account restriction
- Account deletion

prior Authorization decisions must no longer be used.

---

## Entitlement Is Not Resource Authorization

An entitlement may permit use of a Product capability.

It does not grant access to another Owner's resources.

Example:

```text
Premium entitlement:
May create an advanced Report

Resource Authorization:
May create the Report only for the current Owner
```

---

## Administrative Role Is Not Unlimited Access

Administrative functions must have explicit permissions and scopes.

Avoid universal:

```text
admin = true
```

as the sole Authorization model.

---

## Support Must Not Browse Financial Data by Default

Support access should prefer:

```text
Safe metadata

Diagnostic states

User-provided context

Explicit temporary elevated access where approved
```

Support must not receive full Transaction access merely because a case exists.

---

## Support Must Not Impersonate the Owner Invisibly

Any approved impersonation-like capability must:

- Be exceptional
- Be explicit
- Be time-bounded
- Be purpose-bounded
- Display a visible operator state
- Be audited
- Exclude prohibited actions
- End automatically

Default policy should prohibit ordinary impersonation.

---

## Emergency Access Must Be Exceptional

Break-glass access may exist only for severe operational or security needs.

It must require:

- Documented Incident or case
- Strong Authentication
- Explicit approval
- Narrow scope
- Short expiration
- Enhanced audit
- Post-use review

---

## Sharing Is Disabled by Default

The individual-owner Nexio model does not authorize general Account or financial-resource sharing.

Future sharing capabilities require:

- Explicit Product approval
- Resource-specific permissions
- Invitation lifecycle
- Revocation
- Audit
- Privacy review
- Accessibility review
- Account deletion behavior

---

## Public Sharing Is Prohibited by Default

Nexio must not expose financial resources through public unauthenticated links unless a separate approved specification authorizes it.

---

## Shared Links Must Not Be Permanent by Default

Any future approved share link should be:

- Purpose-bound
- Resource-bound
- Expiring
- Revocable
- Unpredictable
- Minimally scoped
- Audited

---

## Sharing Does Not Transfer Ownership

Granting access to a resource must not change:

```text
ownerId
```

Ownership transfer requires a separate governed capability.

---

## Shared Access Must Not Expand through Inheritance Accidentally

Permission on one resource must not silently grant access to:

- All Accounts
- All Transactions
- All Reports
- All attachments
- All future resources

Inheritance must be explicit.

---

## Access Revocation Must Propagate

Revocation should stop:

- New reads
- New writes
- Background synchronization
- Export downloads
- Share-link access
- Deep-link actions
- Cached privileged views where required

---

## Permission Changes Must Be Versioned

Authorization-sensitive changes should have a version or freshness boundary.

A stale Device or browser tab must not continue using superseded permissions.

---

## Access to Deleted Resources Is Denied

Deleted or deletion-pending resources should follow explicit lifecycle policy.

A stale link must not reopen deleted content.

---

## Account Deletion Overrides Ordinary Access

When Account deletion reaches the restricted or irreversible stage:

- Ordinary Owner access stops.
- Shared access stops.
- Support access is restricted.
- Background jobs use deletion-only purpose.
- Exports follow deletion policy.
- Providers receive only required deletion instructions.

---

## Privacy Rights Override Commercial Restrictions

Required Privacy actions such as Account deletion and eligible data Export must not be blocked by:

- Subscription state
- Advertising state
- Feature entitlement
- Paywall
- Support tier

Authorization must still confirm the correct Owner.

---

## Authorization Errors Must Avoid Resource Enumeration

Prefer:

```text
Nexio could not access this resource.
```

rather than revealing:

```text
This resource belongs to another user.
```

---

## Authorization Must Be Accessible

Denied states must:

- Explain the available next step
- Avoid color-only status
- Be announced to assistive technologies
- Preserve focus
- Avoid inaccessible modal loops

---

## Authorization Must Not Depend on Advertising

Ads must not:

- Grant access
- Extend access
- Bypass a denial
- Replace reauthentication
- Unlock Privacy rights

---

## AI Must Not Grant Access

AI may explain policies or identify missing checks.

AI must not:

- Add a permission
- Approve elevated access
- Select a privileged role
- Generate a valid share token
- Authorize Support access
- Override Owner isolation
- Decide emergency access

---

# Capability Scope

This document governs:

```text
Owner resource access

Application command authorization

Application query authorization

API authorization

Database Row-Level Security

Storage access

File access

Import access

Export access

Attachment access

Notification access

Deep-Link access

Assistant data access

Entitlement-gated actions

Support access

Security operations

Administrative tools

Background jobs

Provider integrations

Temporary access

Emergency access

Future sharing

Access revocation

Authorization audit
```

---

# Out-of-Scope Capabilities

Unless separately approved, this document does not authorize:

- Household shared Accounts
- Family financial access
- Employer-managed Accounts
- Corporate teams
- Delegated accountants
- Joint financial ownership
- Public financial profiles
- Anonymous file sharing
- Ownership transfer
- External write access
- Marketplace data access
- Open banking access
- Financial-advisor access

---

# Authorization Domain Model

Recommended canonical entities:

```text
Actor

Role

Permission

Resource

ResourceScope

Policy

AuthorizationRequest

AuthorizationDecision

AccessGrant

AccessRevocation

PrivilegedAccessRequest

ShareInvitation

ShareLink

AccessAuditEvent
```

Some entities may remain policy records rather than persistent runtime entities.

---

# Actor

An Actor represents the principal requesting or performing an action.

Recommended fields:

```text
actorId

actorType

identityId

AccountId

ownerId

sessionId

deviceId

serviceId

providerId

roleIds

state

securityVersion

createdAt
```

---

# Actor Types

Recommended:

```text
owner

system_service

background_job

Support_agent

Security_operator

Privacy_operator

billing_provider

Advertising_provider

Authentication_provider

migration_process

deletion_coordinator

anonymous
```

---

# Owner Actor

The authenticated Owner Actor should include:

```text
identityId

AccountId

ownerId

sessionId

deviceId

securityVersion
```

---

# System Service Actor

A system service should include:

```text
serviceId

servicePurpose

environment

credentialVersion

allowedScopes
```

---

# Background Job Actor

A background job should include:

```text
jobId

jobType

trigger

originalActorId where applicable

ownerId where applicable

purpose

createdAt
```

---

# Provider Actor

A provider Actor should be constrained to:

- One provider
- One integration purpose
- Approved data categories
- Approved operations
- Approved environment

---

# Anonymous Actor

The anonymous Actor should normally access only:

```text
Public Product shell

Public Help

Public legal documents

Authentication entry points

Account recovery request entry point
```

It must not access private financial resources.

---

# Actor State

Recommended:

```text
active

restricted

suspended

revoked

expired

unknown
```

---

# Role

A Role groups permissions for a defined operational responsibility.

Recommended fields:

```text
roleId

name

description

actorTypes

permissionIds

scopePolicy

status

version

owner

introducedAt
```

---

# Recommended Role Categories

Potential:

```text
financial_owner

system_sync_service

Import_processor

Export_processor

deletion_coordinator

Support_basic

Support_elevated

Security_operator

Privacy_operator

billing_verifier

provider_callback_processor

migration_operator
```

These names are illustrative.

Active roles require Registry approval.

---

# Role Principles

Roles should:

- Be narrow
- Be purpose-oriented
- Avoid overlapping unrestricted powers
- Avoid implicit permissions
- Be reviewable
- Be revocable
- Be versioned

---

# Role Status

Recommended:

```text
draft

approved

active

limited

deprecated

disabled

removed
```

---

# Permission

A Permission defines an approved action category.

Recommended fields:

```text
permissionId

resourceType

action

conditionPolicy

scopeType

riskLevel

requiresRecentAuthentication

audited

status

version

owner
```

---

# Permission Identifier

Recommended pattern:

```text
PERM-<RESOURCE>-<ACTION>
```

Examples:

```text
PERM-TRANSACTION-READ

PERM-TRANSACTION-CREATE

PERM-TRANSACTION-UPDATE

PERM-TRANSACTION-DELETE

PERM-EXPORT-CREATE

PERM-EXPORT-DOWNLOAD
```

---

# Permission Actions

Recommended:

```text
list

read

create

update

delete

restore

export

download

share

revoke

approve

administer

verify

process

synchronize
```

---

# Permission Risk Levels

Recommended:

```text
low

moderate

high

critical
```

Examples:

```text
Read public Help:
low

Read owner Transaction:
moderate

Delete owner Account:
critical

Grant privileged Support access:
critical
```

---

# Permission Conditions

Potential conditions:

```text
Actor is current Owner

Resource ownerId matches Actor ownerId

Session is active

Device is not revoked

Account is active

Recent reauthentication exists

Entitlement permits capability

Resource is not deleted

Purpose is approved

Grant has not expired

Provider event is authenticated
```

---

# Resource

A Resource is the protected object or collection being accessed.

---

# Resource Types

Potential:

```text
Account

Transaction

Transfer

Goal

Category

Report

Attachment

ImportBatch

ImportedRecord

ExportJob

ExportFile

Notification

CommunicationPreference

AssistantConversation

Subscription

Entitlement

Device

Session

SecurityEvent

SupportCase

DeletionOperation
```

---

# Resource Authorization Metadata

Recommended:

```text
resourceType

resourceId

ownerId

AccountId

state

sensitivity

createdAt

updatedAt

authorizationVersion
```

---

# Resource Sensitivity

Recommended:

```text
public

internal

owner_private

restricted

highly_restricted
```

---

# `public`

May be available without Authentication.

Examples:

- Public Privacy policy
- Public Help
- Public Product information

---

# `internal`

Operational information not containing Owner-private data.

---

# `owner_private`

Ordinary financial and Product data belonging to one Owner.

---

# `restricted`

Identity, Security, billing or Support information requiring additional controls.

---

# `highly_restricted`

Examples:

- Authentication tokens
- Recovery evidence
- Privileged-access records
- Provider credentials

---

# Resource Scope

A Resource Scope defines the boundary within which a permission applies.

---

# Scope Types

Recommended:

```text
self_owner

specific_resource

resource_collection

specific_Account

specific_device

specific_session

specific_case

specific_Incident

specific_provider

specific_environment

system_internal

public
```

---

# `self_owner`

The Actor may access only resources whose:

```text
resource.ownerId == actor.ownerId
```

---

# `specific_resource`

Access applies to one resource identifier only.

---

# `resource_collection`

Access applies to a bounded collection.

Examples:

```text
All Transactions of one Owner

All files in one Export job

All events in one Support case
```

---

# `specific_case`

Privileged access applies only to one Support or Security case.

---

# `specific_Incident`

Emergency access applies only to one Incident.

---

# `specific_provider`

Provider access applies only to resources required for that provider.

---

# `specific_environment`

Test actors must not access Production resources.

---

# Policy

A Policy defines the conditions under which an Authorization request is allowed or denied.

Recommended fields:

```text
policyId

name

description

actorTypes

resourceTypes

actions

conditions

effect

priority

status

version

owner

introducedAt

lastReviewed
```

---

# Policy Effects

Recommended:

```text
allow

deny
```

---

# Explicit Deny Precedence

Where policies conflict:

```text
Explicit deny should normally take precedence.
```

Exceptions require a documented policy-composition rule.

---

# Policy Status

Recommended:

```text
draft

approved

active

limited

deprecated

disabled

removed
```

---

# Policy Evaluation Inputs

Recommended:

```text
Actor

Action

Resource

Requested scope

Current time

Session state

Device state

Account state

Owner state

Resource state

Entitlement state

Purpose

Environment

Security version

Authorization version
```

---

# Authorization Request

Recommended fields:

```text
authorizationRequestId

actor

action

resourceType

resourceId

requestedScope

purpose

context

requestedAt

operationId
```

---

# Authorization Context

Potential:

```text
platform

applicationVersion

route

APIoperation

offlineState

DeepLinkId

SupportCaseId

incidentId

providerEventId

currentTime
```

---

# Authorization Decision

Recommended fields:

```text
authorizationDecisionId

authorizationRequestId

decision

reasonCode

matchedPolicies

effectiveScope

constraints

decisionVersion

decidedAt

expiresAt
```

---

# Authorization Decision States

Recommended:

```text
allow

deny

require_reauthentication

require_additional_approval

temporarily_unavailable

unknown
```

---

# `allow`

The action may proceed within the returned constraints.

---

# `deny`

The action must not proceed.

---

# `require_reauthentication`

The current Actor may qualify after recent Authentication.

---

# `require_additional_approval`

A privileged or emergency action requires another authority.

---

# `temporarily_unavailable`

The policy service cannot safely authorize the action now.

---

# `unknown`

The system cannot determine the correct decision.

Default result:

```text
Deny
```

---

# Authorization Reason Codes

Recommended:

```text
owner_match

public_resource

service_scope_valid

case_scope_valid

incident_scope_valid

not_authenticated

owner_mismatch

Account_restricted

Account_suspended

Account_deleted

session_expired

session_revoked

device_revoked

permission_missing

scope_exceeded

resource_deleted

reauthentication_required

entitlement_required

grant_expired

environment_mismatch

provider_scope_invalid

policy_unavailable

unknown
```

---

# Decision Constraints

An allow decision may include constraints such as:

```text
read_only

specific_fields

specific_Date_range

specific_resource

no_Export

no_delete

no_share

expiresAt

maximumRows

masked_fields
```

---

# Authorization Decision Freshness

A decision may expire when:

- Session expires
- Owner changes
- Security version changes
- Policy version changes
- Access Grant expires
- Resource state changes
- Account restriction changes
- Device is revoked

---

# Authorization Version

A version should change after material permission or policy changes.

Stale clients should re-evaluate before protected actions.

---

# Access Grant

An Access Grant is an explicit temporary or delegated permission.

General Owner use may derive from ownership policies rather than stored Grants.

Recommended fields:

```text
accessGrantId

granteeActorId

grantorActorId

resourceType

resourceId

permissionIds

scope

purpose

state

startsAt

expiresAt

createdAt

revokedAt

revocationReason

approvalReference
```

---

# Access Grant States

Recommended:

```text
pending

active

expired

revoked

cancelled

denied

unknown
```

---

# Access Grant Principles

Every Grant should be:

- Explicit
- Narrow
- Purpose-bound
- Time-bounded
- Revocable
- Auditable
- Nontransferable

---

# Access Grant Prohibition

Do not create:

```text
Permanent unrestricted Support access
```

or equivalent broad Grants.

---

# Access Revocation

Recommended fields:

```text
revocationId

accessGrantId

requestedBy

reason

requestedAt

completedAt

state
```

---

# Revocation States

Recommended:

```text
requested

processing

completed

partially_completed

failed_retryable

failed_final
```

---

# Revocation Effect

After revocation:

- New access is denied.
- Privileged UI closes.
- Background tasks stop.
- Downloads become inaccessible where possible.
- Cached privileged data is cleared according to policy.
- Audit records remain.

---

# Authorization Policy Composition

A request may involve several independent checks.

Recommended order:

```text
Validate Actor

↓

Validate Session and Device

↓

Validate Account lifecycle

↓

Resolve Resource

↓

Validate Owner relationship

↓

Validate permission

↓

Validate scope

↓

Validate purpose

↓

Validate entitlement where applicable

↓

Validate recent Authentication where applicable

↓

Apply explicit denies

↓

Return constrained decision
```

---

# Owner Authorization Policy

Core rule:

```text
Allow an authenticated Owner Actor to access an Owner-private resource only when:

actor.ownerId == resource.ownerId
```

Additional requirements may include:

```text
Session active

Device valid

Account active or permitted restricted state

Resource state permits action

Requested action permitted
```

---

# Owner Resource List Policy

A collection query should apply:

```text
WHERE owner_id = current_actor.owner_id
```

or the equivalent trusted filter.

Do not query all resources and filter only in the UI.

---

# Owner Resource Create Policy

Before create:

```text
Validate current Actor ownerId.

Assign ownerId from the trusted Actor context.

Ignore or reject client-supplied different ownerId.

Validate capability and limit.

Create resource.
```

---

# Client-Supplied Owner ID

The client should not control ownership assignment.

If the request includes `ownerId`, the trusted service must:

- Compare it to the current Actor
- Reject mismatch
- Prefer server-side assignment

---

# Owner Resource Update Policy

Before update:

```text
Load resource by identifier and Owner scope.

Validate current resource Owner.

Validate update permission.

Validate immutable ownership fields.

Apply change.
```

The update must not allow:

```text
ownerId change
```

unless a separately approved ownership-transfer capability exists.

---

# Owner Resource Delete Policy

Before delete:

- Validate current Owner
- Validate delete action
- Validate resource lifecycle
- Validate related financial invariants
- Require confirmation where appropriate
- Preserve audit evidence

---

# Resource Restore Policy

Restoring a deleted resource requires:

- Same Owner
- Restorable lifecycle state
- Restore permission
- Conflict validation
- Audit

---

# Collection Count Policy

Counts are protected.

A query such as:

```text
How many Goals exist?
```

must count only resources authorized for the Actor.

---

# Search Authorization Policy

Search results must be filtered before:

- Ranking
- Snippet generation
- Count generation
- Autocomplete
- AI context retrieval

---

# Authorization and Error Equivalence

To reduce enumeration, these conditions may return equivalent external responses:

```text
Resource does not exist

Resource exists for another Owner

Resource was deleted

Actor lacks permission
```

Internal logs should preserve the precise reason safely.

---

# Command Authorization Architecture

Every protected command should declare:

```text
Actor requirement

Resource type

Action

Scope

Purpose

Required Authentication strength

Required entitlement

Expected lifecycle states

Audit requirement
```

---

# Command Authorization Contract

Potential:

```typescript
interface AuthorizedCommand<TInput, TResult> {
  permissionId: string;
  resourceType: string;
  action: string;
  authorize(
    context: AuthorizationContext,
    input: TInput
  ): Promise<AuthorizationDecision>;
  execute(input: TInput): Promise<TResult>;
}
```

---

# Command Execution Rule

```text
No protected command executes before an allow decision.
```

---

# Query Authorization Architecture

Every protected query should define:

```text
Allowed Actor types

Owner filter

Field projection

Row limit

Sorting constraints

Purpose

Audit requirement
```

---

# Query Field Projection

A query may be allowed to access only selected fields.

Example Support-safe projection:

```text
Account state

Last synchronization state

Application version

Error category
```

without:

```text
Transaction descriptions

Exact balances

Goal names
```

---

# Field-Level Authorization

Field-level controls may be required for:

- Identity data
- Security events
- Billing references
- Support notes
- Provider metadata
- Recovery evidence

---

# Field Masking

Potential masked output:

```text
Email:
d***e@example.com

Provider purchase reference:
••••1234
```

Masking does not replace Authorization.

---

# Database Authorization Architecture

Database controls should reinforce Application authorization.

---

# Row-Level Security Principles

Where supported:

```text
□ Owner-private tables include owner_id.

□ Read policies validate current Actor owner.

□ Insert policies assign or validate owner.

□ Update policies prevent owner changes.

□ Delete policies validate owner.

□ Service roles are narrowly controlled.

□ Test and Production policies remain separated.
```

---

# Database Service Role Boundary

A service credential that bypasses Row-Level Security is highly privileged.

It must:

- Remain server-side
- Use least privilege
- Be purpose-bound
- Avoid ordinary Product requests
- Be audited
- Be rotated
- Have a kill switch

---

# Stored Procedure Authorization

Stored procedures or database functions must:

- Validate Actor context
- Validate Owner
- Validate resource state
- Avoid trusting arbitrary Owner IDs
- Avoid broad security-definer behavior
- Be tested for cross-owner access

---

# Database Trigger Boundary

Triggers may maintain invariants.

They should not infer the current Owner from unsafe global state.

---

# Storage Authorization Architecture

Protected files may include:

```text
Attachments

Import files

Export files

Report files

Support evidence

Deletion evidence
```

---

# Storage Object Metadata

Recommended:

```text
storageObjectId

ownerId

resourceType

resourceId

path

sensitivity

state

createdAt

expiresAt

authorizationVersion
```

---

# Storage Path Prohibition

Do not rely on a predictable storage path as authorization.

Example unsafe assumption:

```text
/exports/123.pdf
```

Knowing the path must not grant access.

---

# Protected File Download Flow

Recommended:

```text
Authenticate Actor

↓

Resolve file metadata

↓

Validate Owner or approved privileged scope

↓

Validate file state

↓

Validate expiration

↓

Create bounded delivery authorization

↓

Download through approved path

↓

Audit where required
```

---

# Signed Download Authorization

Where signed URLs are used, they should be:

- Short-lived
- Resource-specific
- Method-specific where possible
- Unpredictable
- Revocable where architecture permits
- Excluded from logs and Analytics

---

# Export Authorization

Export requires:

```text
Current authenticated Owner

Correct Owner scope

Approved Export permission

Current Account lifecycle

Recent Authentication where required

Export job ownership

Download reauthorization
```

---

# Export Download Recheck

Creating an Export does not permanently authorize every future download.

The download should validate:

- Current Owner
- Export state
- Expiration
- Account state
- Deletion state

---

# Import Authorization

Import requires:

- Current authenticated Owner
- Current Owner-specific import batch
- Approved file type
- Approved Import permission
- Confirmation before financial mutation
- Same Owner through the complete flow

---

# Import Batch Owner Binding

The Import batch `ownerId` must be assigned from the trusted Actor.

It must not change after upload.

---

# Attachment Authorization

Attachments must inherit or explicitly reference the Owner of the parent resource.

An attachment cannot be opened merely because its file identifier is known.

---

# Notification Authorization

Notification content and actions must validate:

```text
Recipient ownerId

Current authenticated Owner

Target resource ownership

Target resource state

Current action permission
```

---

# Notification Deep-Link Reauthorization

A Notification created for Owner A must not open Owner A content while Owner B is active.

---

# Assistant Authorization

The Assistant may receive only data authorized for:

```text
Current Owner

Current purpose

Current conversation scope

Approved data categories
```

---

# Assistant Context Retrieval

Before retrieving financial context:

```text
Validate current Session.

Validate current Owner.

Validate requested resource scope.

Apply Privacy choices.

Apply Assistant policy.

Retrieve only approved fields.
```

---

# Assistant Cross-Owner Prohibition

Conversation history or cached context from one Owner must not appear for another Owner.

---

# Entitlement-Gated Authorization

A protected action may require both:

```text
Resource Authorization

and

Capability entitlement
```

Example:

```text
Actor owns the data.

Premium entitlement permits the advanced action.
```

Both must pass.

---

# Entitlement Failure

When the Owner is authorized for the resource but lacks the capability:

```text
Owner access remains valid.

Only the Premium action is denied.
```

---

# Public Resource Policy

Public resources must be explicitly classified.

Default classification is not public.

Potential public resources:

```text
Public Help

Privacy policy

Terms

Store information

Public status page
```

---

# Public Resource Prohibition

Do not classify as public:

- Financial records
- Export files
- Import files
- Notifications
- Purchases
- Security events
- Support cases
- Account deletion state

---

# System Service Authorization

System services should use service identities with narrow permissions.

---

# Service Identity Record

Recommended fields:

```text
serviceId

name

purpose

environment

permissionIds

scopePolicy

credentialVersion

state

owner

lastReviewed
```

---

# Service State

Recommended:

```text
active

restricted

rotating

revoked

deprecated

removed
```

---

# Service Authorization Principles

A service should receive only the permissions needed for its function.

Examples:

```text
Export service:
Read authorized Owner data for one Export job

Notification service:
Read approved communication variables for one Owner event

Billing verifier:
Read purchase verification metadata

Deletion coordinator:
Process deletion-scoped resources
```

---

# Background Job Authorization

A background job should carry:

```text
Original Owner where applicable

Original purpose

Resource scope

Job identity

Expiration

Policy version
```

---

# Background Job Reauthorization

Before material execution, the job should recheck:

- Account state
- Owner state
- Resource state
- Grant expiration
- Deletion state
- Policy version

---

# Background Job after Account Deletion

Ordinary jobs should stop.

Only deletion, retention or required audit jobs may continue under explicit purpose.

---

# Provider Authorization

Provider Adapters should access only the minimum data required for the integration.

---

# Billing Provider Scope

Potentially allowed:

```text
Provider Product identifier

Purchase reference

Subscription state

Verification state
```

Not automatically allowed:

```text
Transactions

Balances

Goals

Reports
```

---

# Advertising Provider Scope

Advertising providers must not receive private financial records.

Authorization should allow only approved advertising-request fields.

---

# Authentication Provider Scope

Authentication providers may receive identity and Authentication data.

They must not receive ordinary financial records without separate approval.

---

# Provider Callback Authorization

Before applying a provider callback:

```text
Authenticate provider event.

Validate environment.

Validate provider scope.

Resolve related canonical resource.

Validate allowed transition.

Apply only the permitted fields.
```

---

# Support Access Architecture

Support access should use graduated levels.

---

# Support Access Levels

Recommended:

```text
Support_public

Support_basic

Support_diagnostic

Support_elevated

Support_emergency
```

---

# `Support_public`

Access only to public Help and generic procedures.

---

# `Support_basic`

Access to safe case metadata.

Potential:

```text
Case status

Application version

Platform

General error category

Account lifecycle category
```

---

# `Support_diagnostic`

May access bounded operational metadata.

Potential:

```text
Synchronization state

Import state

Export state

Purchase verification state

Session state category

Notification delivery category
```

---

# `Support_elevated`

Exceptional temporary access to specifically approved fields or resources.

Requires:

- Case
- Purpose
- Approval
- Expiration
- Audit
- User notice where required

---

# `Support_emergency`

Break-glass access for severe Incidents.

Requires enhanced controls.

---

# Support Prohibited Data by Default

Support should not access:

```text
Full Transaction history

Exact balances

Attachment contents

Recovery tokens

Session tokens

Passwords

Complete Export files

Another Owner's identity

AI conversation history
```

---

# Support Case Scope

Every privileged Support action should bind to:

```text
SupportCaseId

Owner

Resource types

Permission set

Purpose

Expiration
```

---

# Support Access Grant Flow

Recommended:

```text
Agent opens case

↓

Requests bounded access

↓

Policy evaluates role and case

↓

Required approval occurs

↓

Time-bounded Grant is created

↓

Agent accesses approved fields

↓

Every access is audited

↓

Grant expires or is revoked

↓

Case review closes access
```

---

# Support Access User Consent

Some Support access may require explicit user authorization.

Consent must not replace internal least-privilege controls.

---

# Support Access Visibility

Where appropriate, the Product may show:

```text
Nexio Support access is active for case [reference].

Access expires at [Date and time].
```

The design requires Privacy and Security approval.

---

# Support Impersonation Prohibition

Default:

```text
Support may not act as the Owner inside the ordinary Product interface.
```

Any exceptional capability requires a separate approved design.

---

# Security Operator Access

Security Operators may need:

- Session metadata
- Device metadata
- Security events
- Provider event metadata
- Incident-scoped access

They do not automatically receive full financial-data access.

---

# Privacy Operator Access

Privacy Operators may need:

- Deletion state
- Export state
- Data-category inventory
- Retention state
- Provider-deletion status

They do not automatically receive ordinary Transaction access.

---

# Administrative Tool Authorization

Administrative tools must:

- Require strong Authentication
- Use narrow roles
- Validate every resource
- Prevent bulk access by default
- Audit searches and views
- Block copy or Export where not required
- Expire elevated Sessions
- Support emergency disablement

---

# Admin Search Protection

Searching by email, ownerId or case reference is itself privileged.

Search results must be:

- Scoped
- Minimal
- Audited
- Rate-limited
- Protected from bulk enumeration

---

# Bulk Access Prohibition

Bulk financial-data access requires separate approval and purpose.

Ordinary Support or administrative roles must not export all user financial records.

---

# Privileged Access Request

Recommended fields:

```text
privilegedAccessRequestId

requestingActorId

targetOwnerId

resourceTypes

permissionIds

purpose

caseId

incidentId

requestedDuration

state

requestedAt

approvedBy

expiresAt
```

---

# Privileged Access States

Recommended:

```text
draft

submitted

reviewing

approved

denied

active

expired

revoked

cancelled
```

---

# Privileged Access Approval

Approval should consider:

- Actor role
- Purpose
- Scope
- Data sensitivity
- Duration
- User notice
- Alternative lower-access methods
- Incident severity
- Regulatory requirements

---

# Separation of Duties

High-risk privileged actions may require different people for:

```text
Request

Approval

Execution

Review
```

---

# Break-Glass Access

Break-glass access should be reserved for:

- Active Security Incident
- Data-integrity Incident
- Critical deletion failure
- Critical provider failure
- Legal or compliance emergency under approved authority

---

# Break-Glass Requirements

```text
□ Strong Authentication

□ Current Incident identifier

□ Reason

□ Narrow resource scope

□ Narrow permission set

□ Short expiration

□ Independent approval where feasible

□ Real-time alert

□ Immutable audit

□ Post-use review
```

---

# Break-Glass Prohibitions

Do not use break-glass for:

- Convenience
- Faster Support response
- Product exploration
- Debugging ordinary UI
- Analytics
- Customer-success outreach
- Marketing

---

# Future Sharing Architecture

General financial-resource sharing is not active by default.

Any future implementation should use explicit Grants.

---

# Share Invitation

Recommended fields:

```text
shareInvitationId

ownerId

invitedIdentityReference

resourceType

resourceId

permissionIds

scope

state

createdAt

expiresAt

acceptedAt

revokedAt
```

---

# Invitation States

Recommended:

```text
created

sent

pending

accepted

declined

expired

revoked

cancelled
```

---

# Sharing Preconditions

```text
□ Resource is shareable.

□ Owner is authenticated.

□ Owner has share permission.

□ Recipient identity is resolved safely.

□ Permission set is explicit.

□ Scope is explicit.

□ Expiration is defined.

□ Revocation is available.

□ Privacy review passes.

□ Account deletion behavior is defined.
```

---

# Recipient Resolution

Do not grant access solely because a submitted email resembles another Account.

The recipient must accept through an approved Identity-bound flow.

---

# Sharing Permission Levels

Potential future levels:

```text
view

comment

edit_limited

manage
```

Actual levels require Product approval.

Avoid vague:

```text
full access
```

---

# Sharing Scope

Potential:

```text
One Report

One Goal

One Export

One Account subset

Date-bounded data
```

Sharing all financial data requires enhanced review.

---

# Sharing Acceptance

Before accepting:

- Authenticate recipient
- Validate invitation Identity
- Validate expiration
- Validate invitation state
- Explain scope
- Explain permissions
- Create Access Grant

---

# Sharing Revocation

Owner should be able to revoke active access.

Revocation must propagate to:

- Queries
- Downloads
- Cached privileged views
- Background work
- Deep links
- Future Exports

---

# Share Link Architecture

Unauthenticated share links remain prohibited by default.

If separately approved, a Share Link record should include:

```text
shareLinkId

ownerId

resourceType

resourceId

permissions

tokenHash

state

createdAt

expiresAt

revokedAt

maximumUses

useCount
```

---

# Share Token Security

Tokens should be:

- Random
- High entropy
- Stored as a protected hash where possible
- Expiring
- Revocable
- Resource-bound
- Excluded from logs
- Excluded from Analytics
- Excluded from AI prompts

---

# Share-Link Restrictions

A future link should not allow:

- Account-wide discovery
- Resource enumeration
- Editing without separate approval
- Credential or recovery access
- Subscription management
- Account deletion
- Sharing onward by default

---

# Sharing and Account Deletion

When Owner deletion begins:

- Invitations expire.
- Grants are revoked.
- Share links are disabled.
- Shared copies follow explicit ownership policy.
- Recipient access stops.

---

# Sharing and Resource Deletion

Deleting the source resource should revoke shared access unless a separate copy was intentionally created.

---

# Sharing and Export

Sharing a view does not automatically authorize Export.

Export permission should be explicit.

---

# Sharing and Notifications

Recipients should receive only approved sharing communications.

Notification content must avoid exposing financial details before acceptance.

---

# Authorization and Privacy

Authorization defines whether access is permitted.

Privacy defines whether the access is necessary and appropriate for the purpose.

Both must pass.

---

# Purpose Limitation

Even an Actor with technical permission should not access data outside the approved purpose.

Example:

```text
Support diagnostic permission

does not authorize

Product research
```

---

# Data Minimization in Authorized Responses

An allow decision should return only the fields required for the action.

---

# Authorization and Retention

Expired Grants and revoked roles should stop access.

Audit evidence may remain according to retention policy.

---

# Authorization and Account Deletion

Deletion processing may require system access after Owner access stops.

That access should use:

```text
deletion_coordinator

specific deletion purpose

specific Owner

specific data categories

bounded retention policy
```

---

# Authorization and Backup

Backup systems may process encrypted or protected data under:

```text
backup_service

system_internal scope
```

Restoration must re-establish Owner authorization before Product exposure.

---

# Authorization and Analytics

Analytics systems must not receive private financial records merely because Product code can read them.

Authorization for Product operation is not Authorization for Analytics.

---

# Authorization and AI

Assistant access must remain separate from broad Product access.

AI context retrieval requires its own purpose and field-level policy.

---

# Authorization Error Registry

Recommended categories:

```text
not_authenticated

session_expired

session_revoked

device_revoked

owner_unresolved

owner_mismatch

permission_missing

scope_exceeded

resource_unavailable

resource_deleted

Account_restricted

Account_suspended

Account_deleted

reauthentication_required

entitlement_required

grant_expired

grant_revoked

provider_scope_invalid

environment_mismatch

policy_unavailable

privileged_approval_required

sharing_disabled

unknown
```

---

# External Error Content

Preferred generic content:

```text
Nexio could not complete this action for the current Account.
```

When useful and safe:

```text
Sign in again.

Return to the correct Nexio Account.

Review your current plan.

Contact Support.
```

---

# Internal Error Detail

Internal logs may include the precise policy reason when safely protected.

They must not include:

- Session tokens
- Share tokens
- Passwords
- Recovery codes
- Another Owner's private data

---

# Authorization Audit Event

Recommended fields:

```text
accessAuditEventId

actorId

actorType

ownerId

resourceType

resourceId

action

purpose

decision

reasonCode

policyVersion

grantId

caseId

incidentId

sessionId

deviceId

occurredAt
```

---

# Audit Event Sensitivity

Audit records are restricted.

They may reveal:

- Resource identifiers
- Privileged Actor identity
- Support case relationship
- Access attempts
- Denials

---

# Audit Event Prohibition

Do not include entire resource payloads in Authorization audit events.

---

# Authorization Metrics

Potential:

```text
authorization_allow_rate

authorization_deny_rate

owner_mismatch_count

permission_missing_count

scope_exceeded_count

reauthentication_required_rate

stale_permission_rejection_count

Support_elevated_access_count

break_glass_access_count

sharing_grant_count

sharing_revocation_latency

policy_unavailable_count
```

---

# Safety Metrics

Targets should be zero for:

```text
Cross-owner resource access

UI-only protected authorization

Unauthorized Export download

Unauthorized attachment access

Unauthorized Support financial-data access

Share-token exposure

Expired Grant accepted

Revoked Grant accepted

Deleted-owner access

Provider access outside approved scope

AI-granted permission

Unlogged break-glass access
```

---

# Authorization Registry Architecture

Recommended files:

```text
docs/authorization/
  ACTOR-REGISTRY.md
  ROLE-REGISTRY.md
  PERMISSION-REGISTRY.md
  RESOURCE-REGISTRY.md
  POLICY-REGISTRY.md
  PRIVILEGED-ACCESS-POLICY.md
  SUPPORT-ACCESS-MATRIX.md
  SHARING-POLICY.md
  AUTHORIZATION-ERROR-REGISTRY.md
  AUTHORIZATION-METRIC-REGISTRY.md
  AUTHORIZATION-INCIDENT-RUNBOOKS.md
```

---

# Actor Registry

Recommended fields:

```text
actorType

description

identitySource

allowedRoles

defaultScopes

credentialModel

auditRequirement

status

owner
```

---

# Role Registry

Recommended fields:

```text
roleId

name

actorTypes

permissionIds

scopePolicy

approvalRequirement

maximumDuration

status

version

owner
```

---

# Permission Registry

Recommended fields:

```text
permissionId

resourceType

action

riskLevel

conditions

requiresRecentAuthentication

audited

status

version

owner
```

---

# Resource Registry

Recommended fields:

```text
resourceType

ownershipField

AccountField

sensitivity

shareable

exportable

deletable

restorable

fieldPolicies

status

owner
```

---

# Policy Registry

Recommended fields:

```text
policyId

actorTypes

resourceTypes

actions

conditions

effect

priority

status

version

owner

lastReviewed
```

---

# Support Access Matrix

Potential structure:

| Data Category | Basic Support | Diagnostic Support | Elevated Support |
|---|---:|---:|---:|
| Platform and version | Allowed | Allowed | Allowed |
| General error state | Allowed | Allowed | Allowed |
| Synchronization status | Limited | Allowed | Allowed |
| Purchase verification state | Limited | Allowed | Allowed |
| Exact Transaction values | Denied | Denied | Exceptional |
| Transaction descriptions | Denied | Denied | Exceptional |
| Session tokens | Denied | Denied | Denied |
| Recovery tokens | Denied | Denied | Denied |

---

# Part 1 Anti-Patterns

The following are prohibited:

## Authentication Equals Access

Allowing every valid Session to access every resource.

## Email-Based Ownership

Authorizing resources through email equality.

## UI-Only Authorization

Hiding a button while leaving the command callable.

## Client-Supplied Owner Authority

Accepting any `ownerId` supplied by the client.

## Resource ID Equals Permission

Returning a resource because the requester knows its ID.

## Query All, Filter Later

Loading all Owners' resources and filtering in the frontend.

## Count Leakage

Returning global counts or existence signals.

## Different Error for Another Owner

Revealing that the resource exists but belongs elsewhere.

## Role Name without Permission Registry

Using vague role checks such as `isAdmin`.

## Permanent Support Access

Allowing Support to browse private data indefinitely.

## Invisible Impersonation

Allowing an operator to use the Product as the user without visible state or audit.

## Break Glass for Convenience

Using emergency access for ordinary troubleshooting.

## Service Account with Universal Scope

Giving every system service complete database access.

## Background Job without Actor

Executing Owner operations without retained Actor and purpose.

## Provider with Financial Database Access

Allowing a billing, Authentication or Advertising provider to read financial records broadly.

## Signed URL as Permanent Permission

Using long-lived file links as durable access.

## Export Creation Equals Permanent Download

Allowing downloads after Owner or Account state changes without rechecking.

## Notification Link Bypasses Authorization

Opening resources directly from a Notification without Owner validation.

## Assistant Retrieves before Authorization

Searching all data and filtering after AI context generation.

## Entitlement Grants Cross-Owner Access

Treating Premium as permission to access another Owner.

## Revoked Grant Works from Cache

Allowing stale clients to continue privileged access.

## Resource Sharing by Email Alone

Granting access before recipient acceptance and Identity verification.

## Public Share by Default

Creating unauthenticated links automatically.

## Permanent Share Token

Using nonexpiring share credentials.

## Sharing Transfers Owner

Changing `ownerId` because another person receives access.

## Support Uses Financial Trivia as Permission

Using Transaction knowledge as authorization.

## AI Approves Access

Allowing AI to create roles, Grants or emergency access.

## Deletion Job Uses Ordinary User Session

Processing deletion with stale ordinary Owner authority.

## Test Actor Accesses Production

Allowing environment crossover.

## Audit Logs Store Full Financial Payload

Duplicating sensitive data into access logs.

---

# Part 1 Review Questions

## Actor

```text
Which canonical Actor requests this action?

Which Identity, Account, Owner, Session and Device support the Actor?

Is the Actor active?

Which purpose applies?

Which environment applies?
```

---

## Resource

```text
Which resource type is involved?

Which resource identifier applies?

Who owns the resource?

What is its sensitivity?

What lifecycle state applies?
```

---

## Permission

```text
Which permissionId permits the action?

Is the action read, create, update, delete, Export or share?

Does the Actor's role contain the permission?

Which conditions apply?

Is recent Authentication required?
```

---

## Scope

```text
Is access limited to self Owner?

Is access limited to one resource?

Is access limited to one case or Incident?

Does the requested collection exceed the approved scope?

Does the scope expire?
```

---

## Policy

```text
Which policies match?

Does an explicit deny apply?

Which policy version is current?

Could Account, Device or resource state invalidate the decision?

Is the result still fresh at execution time?
```

---

## Owner Isolation

```text
Does actor.ownerId equal resource.ownerId?

Is the Owner filter enforced before retrieval?

Can client input change ownership?

Can search, counts or errors reveal another Owner?
```

---

## Command

```text
Is Authorization checked immediately before execution?

Does Retry preserve Actor and Owner?

Can the command mutate ownerId?

Can a stale UI invoke the command?
```

---

## Query

```text
Is the Owner filter trusted?

Which fields are returned?

Are counts and search snippets scoped?

Can pagination cross Owner boundaries?

Are deleted resources excluded?
```

---

## Database

```text
Does Row-Level Security reinforce Owner isolation?

Can a service role bypass policy?

Are inserts assigned to the trusted Owner?

Can updates change owner_id?

Are stored procedures Owner-safe?
```

---

## Files

```text
Who owns the file?

Is the path predictable?

Is delivery authorization short-lived?

Is download reauthorized?

What happens after Account deletion or Grant revocation?
```

---

## Support

```text
Which Support role applies?

Which case justifies access?

Which fields are necessary?

Does access expire?

Is user notice required?

Is every access audited?
```

---

## Privileged Access

```text
Is lower-privilege access sufficient?

Who requested access?

Who approved it?

Which Owner and resources are in scope?

When does it expire?

How is it reviewed?
```

---

## Sharing

```text
Is sharing enabled for this resource?

Does the Owner have share permission?

Is the recipient Identity verified?

Which permissions are granted?

When does access expire?

How is it revoked?
```

---

## Offline

```text
Which prior Authorization permits the operation?

Which Owner partition contains it?

Will synchronization reauthorize it?

Can another Owner inherit it?

What happens after revocation or deletion?
```

---

## Account Deletion

```text
Which ordinary permissions stop?

Which deletion-only service permissions continue?

Are shared Grants revoked?

Are provider scopes minimized?

Can stale downloads or links continue?
```

---

## AI

```text
Is AI only explaining policy?

Is private context authorized before retrieval?

Could AI output be interpreted as an access approval?

Does human or system authority make the final decision?
```

---

# Part 1 Acceptance Criteria

The Authorization, Permissions, Sharing and Access Control foundation is accepted only when:

```text
□ Authentication and Authorization are separate controls.

□ Every protected action requires an Authorization decision.

□ Owner isolation is the default.

□ Deny-by-default behavior is explicit.

□ Unknown policy state denies access.

□ Every protected resource identifies an ownership or system scope.

□ Every protected operation has a canonical Actor.

□ Every privileged operation has an approved purpose.

□ Permissions are action-specific.

□ Read does not imply update.

□ Update does not imply delete.

□ Listing and counting are protected.

□ Search and autocomplete are protected.

□ Server-side Authorization is required.

□ Database enforcement reinforces Owner isolation where supported.

□ Resource identifiers do not grant access.

□ Authorization is rechecked at command execution.

□ Authorization is rechecked at file or Deep-Link delivery.

□ Retries preserve Actor, Owner, purpose and operation identity.

□ Offline Authorization remains Owner-scoped.

□ Offline operations are reauthorized before synchronization.

□ Session revocation invalidates stale Authorization.

□ Owner switching invalidates prior Authorization.

□ Device revocation invalidates prior Authorization.

□ Account deletion invalidates ordinary Authorization.

□ Entitlements remain separate from resource Authorization.

□ Administrative roles use explicit permissions.

□ Support cannot browse financial data by default.

□ Support impersonation is prohibited by default.

□ Emergency access is exceptional.

□ Emergency access is narrow and expiring.

□ Sharing is disabled by default.

□ Public sharing is prohibited by default.

□ Future share links require expiration and revocation.

□ Sharing does not change ownerId.

□ Permission inheritance is explicit.

□ Revocation propagates to new access and downloads.

□ Permission changes are versioned.

□ Deleted resources cannot be reopened through stale links.

□ Privacy rights are not blocked by commercial state.

□ Authorization errors avoid resource enumeration.

□ Denied states are accessible.

□ Advertising cannot grant access.

□ AI cannot grant or elevate access.

□ Actor entities are defined.

□ Actor types are explicit.

□ Owner Actors contain identityId, AccountId and ownerId.

□ System services use service identities.

□ Background jobs use explicit job Actors.

□ Provider Actors are narrowly scoped.

□ Anonymous Actors cannot access financial resources.

□ Actor states are explicit.

□ Roles are purpose-oriented.

□ Roles are versioned.

□ Roles avoid unrestricted implicit powers.

□ Role lifecycle states are defined.

□ Permissions have stable identifiers.

□ Permissions identify resource and action.

□ Permission risk levels are defined.

□ Permission conditions are explicit.

□ Resource types are registered.

□ Resource Authorization metadata includes ownerId where applicable.

□ Resource sensitivity is classified.

□ Scope types are defined.

□ Self-Owner scope validates Actor and resource Owner.

□ Case and Incident scopes are bounded.

□ Test and Production scopes are separated.

□ Policies are versioned.

□ Policy effects are explicit.

□ Explicit deny precedence is defined.

□ Policy evaluation inputs are complete.

□ Authorization requests have stable identities.

□ Authorization decisions have stable identities.

□ Authorization decisions contain reason codes.

□ Unknown decisions deny access.

□ Allow decisions may contain constraints.

□ Decision freshness is bounded.

□ Authorization versions invalidate stale clients.

□ Access Grants are explicit.

□ Access Grants are purpose-bound.

□ Access Grants are time-bounded.

□ Access Grants are revocable.

□ Access Grants are nontransferable.

□ Permanent unrestricted Support Grants are prohibited.

□ Access revocation has a durable state machine.

□ Revocation closes privileged UI.

□ Revocation stops background access.

□ Authorization policy composition order is defined.

□ Core Owner policy compares actor.ownerId and resource.ownerId.

□ Collection queries filter by trusted Owner scope.

□ Resource creation assigns Owner from trusted Actor context.

□ Client-supplied different ownerId is rejected.

□ Resource updates cannot change ownerId.

□ Resource deletion validates Owner and lifecycle.

□ Resource restoration validates the same Owner.

□ Collection counts are Owner-scoped.

□ Search filtering occurs before ranking and snippets.

□ Unauthorized and nonexistent resources may use equivalent external errors.

□ Protected commands declare Authorization requirements.

□ Protected commands cannot execute before allow.

□ Protected queries declare Owner filters and projections.

□ Field-level Authorization is available where required.

□ Field masking does not replace Authorization.

□ Owner-private database tables include owner_id.

□ Database read policies validate Owner.

□ Database insert policies assign or validate Owner.

□ Database update policies prevent ownership changes.

□ Database delete policies validate Owner.

□ Service-role credentials remain highly restricted.

□ Stored procedures validate Actor and Owner.

□ Storage objects include Owner metadata.

□ Predictable storage paths do not grant access.

□ File downloads require current Authorization.

□ Signed URLs are short-lived and resource-specific.

□ Export creation requires current Owner.

□ Export download is reauthorized.

□ Import batches are Owner-bound.

□ Import ownerId cannot change after creation.

□ Attachments inherit or reference parent Owner.

□ Notifications validate recipient Owner.

□ Notification actions reauthorize target resources.

□ Assistant context retrieval validates current Owner.

□ Assistant caches do not cross Owners.

□ Entitlement-gated actions require both entitlement and resource Authorization.

□ Missing entitlement does not remove Owner access to existing data.

□ Public resources are explicitly classified.

□ Financial resources are never public by default.

□ System services use narrow permissions.

□ System services identify purpose and environment.

□ Background jobs preserve original Owner where applicable.

□ Background jobs reauthorize before material execution.

□ Ordinary jobs stop after Account deletion.

□ Provider Adapters receive minimum required scope.

□ Billing providers cannot access financial records by default.

□ Advertising providers cannot access financial records.

□ Authentication providers cannot access financial records by default.

□ Provider callbacks validate provider and environment.

□ Provider callbacks apply only permitted fields.

□ Support access levels are defined.

□ Basic Support receives only safe metadata.

□ Diagnostic Support remains field-limited.

□ Elevated Support requires case, approval and expiration.

□ Emergency Support access requires break-glass controls.

□ Support does not receive passwords or tokens.

□ Support cases scope privileged access.

□ Support access is audited.

□ Support impersonation is prohibited by default.

□ Security Operators do not automatically receive financial data.

□ Privacy Operators do not automatically receive Transaction access.

□ Administrative tools require strong Authentication.

□ Administrative tools use narrow roles.

□ Administrative searches are audited.

□ Bulk access is prohibited by default.

□ Privileged-access requests have stable records.

□ Privileged-access states are explicit.

□ High-risk access supports separation of duties.

□ Break-glass access requires an Incident.

□ Break-glass access expires quickly.

□ Break-glass access creates enhanced audit.

□ Break-glass access cannot be used for convenience.

□ General financial sharing remains disabled until approved.

□ Future invitations are Identity-bound.

□ Invitation states are defined.

□ Recipient email alone does not grant access.

□ Sharing permissions are explicit.

□ Sharing scopes are explicit.

□ Sharing acceptance requires Authentication.

□ Sharing revocation propagates.

□ Unauthenticated share links remain prohibited by default.

□ Future share tokens are random and protected.

□ Share tokens are excluded from logs.

□ Share links cannot grant Account-management permissions.

□ Account deletion revokes invitations, Grants and links.

□ Resource deletion revokes related sharing.

□ Sharing view permission does not imply Export.

□ Sharing Notifications avoid premature financial disclosure.

□ Authorization and Privacy must both permit access.

□ Authorized responses return only necessary fields.

□ Revoked roles and expired Grants stop access.

□ Deletion coordinator access is purpose-specific.

□ Backup access remains system-scoped.

□ Product Authorization does not imply Analytics permission.

□ AI data retrieval requires separate purpose and field policy.

□ Authorization error categories are defined.

□ External errors avoid Owner enumeration.

□ Internal reasons remain protected.

□ Authorization audit events are canonical.

□ Audit events exclude full financial payloads.

□ Authorization safety metrics are defined.

□ Cross-owner access target is zero.

□ Unauthorized Export target is zero.

□ Unauthorized attachment access target is zero.

□ Unauthorized Support access target is zero.

□ Share-token exposure target is zero.

□ Expired or revoked Grant acceptance target is zero.

□ Provider out-of-scope access target is zero.

□ AI-granted permission target is zero.

□ Unlogged break-glass access target is zero.

□ Actor, Role, Permission, Resource and Policy Registries are defined.

□ Support Access Matrix is defined.

□ Part 1 Authorization anti-patterns are prohibited.
```

---

# Authorization, Permissions, Sharing and Access Control Constitutional Rule

Every Nexio command, query, API request, database operation, storage access, file download, Import, Export, Notification action, Assistant retrieval, background job, provider callback, Support view, privileged operation, emergency action, invitation, Grant and future share link must answer:

```text
Which canonical Actor is requesting which explicit action, which authenticated Identity, Account, Owner, Session, Device, role and purpose support that Actor, which specific resource and Owner scope are involved, which current policy and permission allow or deny the action, which constraints and expiration apply, and which immediate control prevents access when ownership, Session, Device, Account state, entitlement, provider scope, Grant or policy freshness is uncertain?
```

When the answer is uncertain, prefer the action that:

- Denies access.
- Hides the protected resource.
- Preserves the correct Owner partition.
- Requires reauthentication.
- Re-resolves the resource under Owner scope.
- Blocks the command.
- Blocks the query.
- Blocks the download.
- Stops synchronization.
- Expires or revokes the Grant.
- Stops privileged access.
- Disables the share link.
- Disables the provider scope.
- Disables the service credential.
- Requires independent approval.
- Escalates through Security, Privacy and Operations.
- Blocks the release.

Authorization is not complete because a user is signed in.

Authorization is not complete because the UI shows a button.

Authorization is not complete because a resource identifier is known.

Authorization is not complete because an Actor has an administrative title.

Authorization is complete only when the current Actor, action, resource, Owner, purpose, policy, scope, Session, Device and Account lifecycle all agree, and every denial, Retry, offline action, revocation, privileged access and future sharing flow remains Owner-safe, minimally scoped and auditable.

---
---

# Practical Authorization and Access-Control Architecture

This section translates the Authorization principles into enforceable Product and infrastructure flows.

It defines how Nexio should implement Authorization across:

```text
Application boot

Authenticated Session context

Commands

Queries

Repositories

APIs

Supabase

PostgreSQL Row-Level Security

Database functions

Storage buckets

Signed download links

Imports

Exports

Attachments

Notifications

Deep Links

Assistant context retrieval

Background jobs

Provider callbacks

Support tools

Administrative tools

Temporary access Grants

Emergency access

Future sharing

Offline synchronization

Access revocation

Policy failures
```

Every protected implementation must preserve:

```text
One canonical Actor

One authenticated Identity

One current Account

One current financial Owner

One Session

One Device

One explicit action

One protected resource or collection

One approved purpose

One current Authorization decision

One immutable operation identity
```

---

# End-to-End Authorization Flow

Recommended:

```text
Request begins

↓

Resolve Authentication context

↓

Resolve canonical Actor

↓

Resolve current Account and Owner

↓

Validate Session and Device

↓

Validate Account lifecycle

↓

Identify requested action

↓

Identify resource type and resource identifier

↓

Resolve resource under trusted Owner scope

↓

Load current policy and permission version

↓

Evaluate Owner, role, permission, scope and purpose

↓

Evaluate entitlement where required

↓

Evaluate recent Authentication where required

↓

Apply explicit deny rules

↓

Return constrained Authorization decision

↓

Execute command or query

↓

Persist result atomically

↓

Create audit evidence

↓

Return only approved fields
```

A protected resource must not be loaded broadly before Owner scope is established when doing so would expose another Owner's data.

---

# Authorization Enforcement Layers

Recommended defense-in-depth layers:

```text
Presentation layer

Application command and query layer

API boundary

Repository boundary

Database Row-Level Security

Storage access policy

Provider Adapter scope

Background-job scope

Audit and monitoring
```

No single layer should be treated as sufficient for every risk.

---

# Presentation-Layer Authorization

The presentation layer may:

- Hide unavailable actions
- Disable actions temporarily
- Explain permission requirements
- Route to reauthentication
- Route to plan management
- Show read-only state
- Close privileged views after revocation

The presentation layer must not become the trusted Authorization authority.

---

# Application-Layer Authorization

The Application layer should:

- Build the canonical Actor
- Identify the requested action
- Resolve the resource
- Evaluate policy
- Validate current state
- Invoke the Domain command only after an allow decision
- Preserve operation identity
- Return safe denial results

---

# API-Layer Authorization

The API layer should:

- Authenticate the request
- Reject malformed or unsupported credentials
- Resolve Session and Owner
- Validate route-level capability
- Reject environment mismatch
- Apply request-size and abuse controls
- Pass a trusted Actor context to the Application layer

It should not trust Owner, role or permission claims supplied arbitrarily in the request body.

---

# Repository-Layer Authorization

Repositories should expose Owner-safe operations.

Prefer:

```text
findTransactionForOwner(transactionId, ownerId)
```

over:

```text
findTransaction(transactionId)
```

for ordinary Owner-scoped Product commands.

---

# Database-Layer Authorization

Row-Level Security or equivalent controls should ensure that a compromised or defective client query cannot read or mutate another Owner's rows through ordinary authenticated access.

---

# Storage-Layer Authorization

Storage access should validate:

- Current Actor
- Owner relationship
- Parent resource
- File lifecycle
- Access expiration
- Current Account state

---

# Actor Context Construction

A trusted Actor context should be created from authenticated and server-resolved state.

Recommended fields:

```text
actorId

actorType

identityId

AccountId

ownerId

sessionId

deviceId

SecurityVersion

AccountState

ownerState

roleIds

permissionVersion

environment

AuthenticationStrength

reauthenticatedAt

requestId
```

---

# Actor Context Sources

Trusted sources may include:

```text
Validated Session authority

Canonical Identity repository

Canonical Account repository

Canonical Owner repository

Device registry

Role Assignment Registry

Service Identity Registry
```

Untrusted sources include:

```text
Request body ownerId

Query-string role

Client localStorage permission list

Visible email address

UI-selected Account name

Client-supplied isAdmin flag
```

---

# Owner Resolution Flow

Recommended:

```text
Validate Session.

↓

Read identityId from trusted Session context.

↓

Read current Account relationship.

↓

Read canonical ownerId.

↓

Validate Account and Owner states.

↓

Bind ownerId to the Actor context.

↓

Reject conflicting client Owner values.
```

---

# Owner Resolution Failure

Potential result:

```text
owner_unresolved
```

User-facing content:

```text
Nexio could not load the financial Owner for the current Account.

Protected financial data remains unavailable until the Account context is restored.
```

Do not create a replacement Owner automatically.

---

# Owner Context Version

A version should change after:

- Owner switch
- Sign-out
- Session refresh requiring new authority
- Account lifecycle change
- Permission change
- Device revocation
- Security-version change

Long-running UI, queries and jobs should compare the current context version before applying results.

---

# Stale Response Protection

When an asynchronous request returns:

```text
Compare response ownerContextVersion

with

Current active ownerContextVersion
```

If they differ:

```text
Discard the response.
```

Do not render Owner A data after switching to Owner B.

---

# Authorization Request Construction

Every protected action should construct:

```text
authorizationRequestId

actorId

action

resourceType

resourceId

requestedScope

purpose

operationId

policyVersionExpected

requestedAt
```

---

# Authorization Decision Contract

Potential TypeScript model:

```typescript
type AuthorizationDecision =
  | {
      state: "allow";
      decisionId: string;
      reasonCode: string;
      policyVersion: string;
      constraints: AuthorizationConstraints;
      expiresAt?: string;
    }
  | {
      state:
        | "deny"
        | "require_reauthentication"
        | "require_additional_approval"
        | "temporarily_unavailable"
        | "unknown";
      decisionId: string;
      reasonCode: string;
      policyVersion: string;
      safeUserAction?: string;
    };
```

---

# Authorization Constraints

Potential:

```typescript
interface AuthorizationConstraints {
  readOnly?: boolean;
  allowedFields?: string[];
  deniedFields?: string[];
  maximumRows?: number;
  maximumFileSize?: number;
  allowedDateRange?: {
    from?: string;
    to?: string;
  };
  allowedResourceIds?: string[];
  noExport?: boolean;
  noDownload?: boolean;
  noDelete?: boolean;
  noShare?: boolean;
}
```

---

# Decision Consumption Rule

The command or query must consume the returned constraints.

An `allow` decision without applied constraints is incomplete.

---

# Authorization Decision Caching

Caching may be used only when:

- Actor is unchanged
- Owner is unchanged
- Session is unchanged
- Security version is unchanged
- Policy version is unchanged
- Resource state is unchanged
- Decision expiration has not passed
- The action is safe to cache

High-risk decisions should normally be re-evaluated.

---

# Decisions That Should Not Be Broadly Cached

Examples:

```text
Delete Account

Download Export

Change email

Revoke all Sessions

Support elevated access

Break-glass access

Share-link creation

Resource ownership changes
```

---

# Decision Cache Key

Potential:

```text
actorId

ownerId

sessionId

SecurityVersion

permissionVersion

policyVersion

action

resourceType

resourceId

resourceAuthorizationVersion
```

---

# Cache Invalidation Triggers

Invalidate after:

- Sign-out
- Owner switch
- Session revocation
- Device revocation
- Security-version change
- Role change
- Grant creation
- Grant expiration
- Grant revocation
- Resource deletion
- Account restriction
- Account suspension
- Account deletion
- Policy deployment

---

# Command Authorization Pipeline

Recommended command flow:

```text
Receive command input

↓

Validate input shape

↓

Create or load operationId

↓

Resolve Actor

↓

Resolve target resource under trusted scope

↓

Build Authorization request

↓

Evaluate policy

↓

Return denial or reauthentication when required

↓

Validate Domain invariants

↓

Execute transaction

↓

Persist audit evidence

↓

Return approved result
```

---

# Command Definition

Potential:

```typescript
interface CommandDefinition<TInput> {
  commandName: string;
  permissionId: string;
  resourceType: string;
  action: string;
  purpose: string;
  requiresResourceLoad: boolean;
  requiresRecentAuthentication: boolean;
  requiredEntitlementId?: string;
  buildResourceReference(input: TInput): ResourceReference;
}
```

---

# Command Handler Example

```typescript
async function updateTransaction(
  actor: ActorContext,
  input: UpdateTransactionInput
): Promise<UpdateTransactionResult> {
  const operationId = input.operationId;

  const transaction = await transactionRepository.findForOwner({
    transactionId: input.transactionId,
    ownerId: actor.ownerId,
  });

  const decision = await authorizationService.evaluate({
    actor,
    action: "update",
    resourceType: "Transaction",
    resourceId: input.transactionId,
    purpose: "owner_product_use",
    operationId,
    resource: transaction,
  });

  if (decision.state !== "allow") {
    return mapAuthorizationFailure(decision);
  }

  return transactionService.updateAuthorized({
    actor,
    transaction,
    input,
    constraints: decision.constraints,
    operationId,
  });
}
```

---

# Resource-Not-Found versus Owner Mismatch

An Owner-safe repository may return:

```text
resource_unavailable
```

for both:

```text
Resource does not exist

Resource belongs to another Owner
```

The precise internal result may be audited securely.

---

# Command Reauthorization before Commit

For high-risk commands:

```text
Evaluate Authorization

↓

Load current resource version

↓

Prepare mutation

↓

Recheck critical policy inputs inside transaction

↓

Commit
```

This reduces time-of-check to time-of-use failures.

---

# Optimistic Concurrency and Authorization

A command may fail because:

- Resource changed
- Owner context changed
- Account state changed
- Permission changed
- Resource was deleted

Return a safe conflict or denial rather than applying stale authority.

---

# Command Retry

A Retry should preserve:

```text
operationId

actorId

ownerId

resourceId

action

purpose
```

Before Retry:

```text
Reauthenticate if required.

Re-evaluate Authorization.

Re-read the resource.

Reconcile prior operation result.
```

---

# Command Retry after Owner Switch

The operation must remain bound to its original Owner.

It must not run under the newly active Owner.

---

# Command Retry after Permission Revocation

The Retry must be denied.

An earlier allow decision does not create permanent authority.

---

# Query Authorization Pipeline

Recommended:

```text
Receive query

↓

Resolve Actor

↓

Identify resource collection

↓

Evaluate collection-level permission

↓

Build trusted Owner and scope predicates

↓

Apply row filters

↓

Apply field projection

↓

Apply ordering and pagination

↓

Execute bounded query

↓

Verify response ownerContextVersion

↓

Return approved result
```

---

# Query Definition

Potential:

```typescript
interface QueryDefinition {
  queryName: string;
  permissionId: string;
  resourceType: string;
  action: "list" | "read";
  purpose: string;
  maximumRows: number;
  allowedSortFields: string[];
  allowedFilterFields: string[];
  allowedProjection: string[];
}
```

---

# Query Predicate Construction

The Owner predicate should come from the trusted Actor:

```text
owner_id = actor.ownerId
```

The client may request additional filters such as:

```text
Date range

Category

Status

Search text
```

The client must not remove the Owner predicate.

---

# Pagination Authorization

Pagination cursors should be:

- Owner-scoped
- Query-scoped
- Tamper-resistant where appropriate
- Expiring where appropriate
- Invalid after policy or Owner changes

A cursor created for Owner A must not work for Owner B.

---

# Sorting Authorization

Only approved sort fields should be accepted.

Do not allow arbitrary expressions or provider-specific query fragments from clients.

---

# Search Authorization

Search should:

```text
Apply Owner filter first

↓

Apply lifecycle filters

↓

Apply field permissions

↓

Generate ranking

↓

Generate snippets

↓

Return counts
```

Do not generate snippets from unauthorized data.

---

# Autocomplete Authorization

Autocomplete may reveal:

- Account names
- Categories
- Payees
- Transaction descriptions
- Goal names

It must be Owner-scoped before suggestion generation.

---

# Aggregate Authorization

Aggregates such as:

```text
SUM

COUNT

AVERAGE

MIN

MAX
```

must run only across authorized records.

---

# Empty versus Unauthorized Collection

External behavior may return an empty result when no authorized records exist.

It must not reveal that inaccessible records exist.

---

# Field-Level Projection

Example Owner Transaction list projection:

```text
transactionId

Date

Amount

Currency

Category

status
```

A Support diagnostic projection may include:

```text
transactionId

syncState

validationState

createdAt
```

without:

```text
Amount

description

Account name
```

---

# Sensitive Field Categories

Potential:

```text
financial_amount

financial_description

identity_contact

billing_reference

Authentication_metadata

Security_metadata

provider_secret

recovery_evidence
```

---

# Repository Architecture

Recommended repository styles:

```text
Owner-scoped repositories

Privileged case-scoped repositories

System-purpose repositories

Deletion-scoped repositories
```

---

# Owner-Scoped Repository Example

```typescript
interface TransactionRepository {
  findForOwner(input: {
    transactionId: string;
    ownerId: string;
  }): Promise<Transaction | null>;

  listForOwner(input: {
    ownerId: string;
    filters: TransactionFilters;
    limit: number;
    cursor?: string;
  }): Promise<TransactionPage>;
}
```

---

# Privileged Repository Example

```typescript
interface SupportDiagnosticRepository {
  readSyncMetadata(input: {
    SupportCaseId: string;
    targetOwnerId: string;
    accessGrantId: string;
  }): Promise<SupportSyncDiagnostic>;
}
```

It should not expose general-purpose arbitrary queries.

---

# Service Repository Example

```typescript
interface ExportJobRepository {
  loadForExecution(input: {
    ExportJobId: string;
    serviceActorId: string;
    ownerId: string;
    purpose: "Export_generation";
  }): Promise<ExportJob | null>;
}
```

---

# Raw Repository Prohibition

Avoid exporting unrestricted functions such as:

```text
findAnyUserDataById

executeRawFinancialQuery

listAllTransactions

downloadAnyFile
```

into ordinary Product code.

---

# Supabase Authorization Architecture

Supabase access should use:

```text
Authenticated Session

Canonical Owner mapping

Application-layer Authorization

PostgreSQL Row-Level Security

Storage policies

Narrow server-side service credentials
```

---

# Supabase Identity versus Owner

The Authentication subject returned by Supabase or another provider should map explicitly to Nexio entities.

Potential model:

```text
auth subject

↓

identity record

↓

Nexio Account record

↓

financial Owner record
```

The Authentication subject ID should not automatically become the financial Owner ID unless that equivalence is deliberately guaranteed and documented.

---

# Example Identity Mapping Tables

Illustrative:

```text
identities

Accounts

owners

provider_identity_links
```

Potential relationships:

```text
provider_identity_links.provider_subject_id
    → identities.identity_id

Accounts.identity_id
    → identities.identity_id

owners.Account_id
    → Accounts.Account_id
```

---

# Owner Resolution Database Helper

A controlled helper may resolve the current Owner from the authenticated subject.

Illustrative SQL:

```sql
create or replace function app.current_owner_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select o.owner_id
  from public.provider_identity_links pil
  join public.identities i
    on i.identity_id = pil.identity_id
  join public.accounts a
    on a.identity_id = i.identity_id
  join public.owners o
    on o.account_id = a.account_id
  where pil.provider_subject_id = auth.uid()
    and pil.state = 'active'
    and i.status = 'active'
    and a.status in ('active', 'restricted')
    and o.status in ('active', 'restricted')
  limit 1;
$$;
```

This is an architectural example.

The final schema, function ownership, grants and search path require Security review.

---

# Security-Definer Function Caution

A security-definer function must:

- Use an explicit `search_path`
- Return only required values
- Avoid arbitrary SQL
- Validate current Authentication subject
- Have minimal execute grants
- Be covered by cross-Owner tests
- Avoid exposing service-role authority

---

# Direct Owner Claim Alternative

Where the Session includes a trusted Owner claim:

- The claim must be issued by trusted server authority.
- The claim must be invalidated after Owner or Account changes.
- RLS must validate the claim safely.
- Client code must not be able to forge it.
- Token refresh must update stale claims.

---

# Owner Claim Freshness

If Owner state changes after token issuance:

```text
Old claims may remain temporarily stale.
```

Critical commands should consult canonical Account and Owner state rather than relying solely on long-lived claims.

---

# Base Owner-Scoped Table Requirements

Each Owner-private table should normally include:

```text
owner_id

created_at

updated_at

state

authorization_version
```

where applicable.

---

# Example Transaction Read Policy

Illustrative:

```sql
create policy "owners read own transactions"
on public.transactions
for select
to authenticated
using (
  owner_id = app.current_owner_id()
  and state <> 'purged'
);
```

---

# Example Transaction Insert Policy

Illustrative:

```sql
create policy "owners create own transactions"
on public.transactions
for insert
to authenticated
with check (
  owner_id = app.current_owner_id()
);
```

The trusted Application service should preferably assign `owner_id`.

---

# Example Transaction Update Policy

Illustrative:

```sql
create policy "owners update own transactions"
on public.transactions
for update
to authenticated
using (
  owner_id = app.current_owner_id()
)
with check (
  owner_id = app.current_owner_id()
);
```

This prevents changing the row to another Owner through ordinary authenticated access.

---

# Example Transaction Delete Policy

Illustrative:

```sql
create policy "owners delete own transactions"
on public.transactions
for delete
to authenticated
using (
  owner_id = app.current_owner_id()
);
```

Domain rules may require soft deletion through a command rather than direct row deletion.

---

# RLS and Soft Deletion

When a resource uses soft deletion:

- Ordinary list policies should exclude deleted state.
- Restore commands should use explicit permission.
- Deleted-resource reads should follow lifecycle policy.
- Direct client updates to deletion fields should be prohibited where possible.

---

# RLS Policy for Child Resources

A child table may contain:

```text
attachment.parent_transaction_id
```

It should still include or reliably derive `owner_id`.

Prefer explicit Owner metadata when it strengthens enforcement and query safety.

---

# Child Ownership Consistency

Database constraints or triggers may ensure:

```text
attachment.owner_id = parent_resource.owner_id
```

The client must not set inconsistent ownership.

---

# Join Table Authorization

Join tables should identify the authorized relationship explicitly.

Example future sharing relation:

```text
resource_access_grants
```

RLS should check:

- Grant state
- Grantee identity
- Resource
- Permission
- Expiration
- Owner deletion state

---

# View Authorization

Database views must not accidentally bypass RLS or expose unrestricted rows.

Review:

```text
Invoker versus definer behavior

Underlying table policies

Owner predicates

Field projection

Aggregate leakage
```

---

# Materialized View Authorization

Materialized views may contain data from several Owners.

Direct authenticated access should be prohibited unless Owner isolation is explicitly enforced.

Prefer server-side bounded queries or Owner-partitioned materialization.

---

# RPC and Database Function Authorization

Database functions invoked by clients should:

```text
Validate auth subject

Resolve Owner

Validate permission

Validate resource ownership

Validate arguments

Avoid arbitrary Owner parameters

Return bounded fields
```

---

# Example Owner-Safe RPC Shape

```sql
select public.create_transaction(
  p_operation_id := :operation_id,
  p_date := :date,
  p_amount_minor := :amount_minor,
  p_currency := :currency,
  p_category_id := :category_id
);
```

The function resolves Owner internally.

Avoid:

```sql
p_owner_id := :client_supplied_owner_id
```

as authoritative input.

---

# Security-Definer RPC Requirements

```text
□ Explicit search path

□ Minimal grants

□ Input validation

□ Owner resolution

□ Permission validation

□ Idempotency

□ No dynamic SQL unless strictly controlled

□ Audit evidence

□ Cross-Owner tests
```

---

# Service Role Governance

Supabase service-role or equivalent privileged credentials may bypass RLS.

They must never be embedded in:

- Browser code
- Android application code
- Public JavaScript
- Source maps
- Client configuration
- User-visible logs

---

# Service Role Use Cases

Potential approved uses:

```text
Deletion coordinator

Verified provider callback processor

Controlled migration

Export generation

Backup restoration

Security Incident repair
```

Each use requires additional Application-level scope checks.

---

# Service Role Prohibition

A service role must not be used simply because an RLS policy is inconvenient.

---

# Serverless Function Authorization

A serverless or edge function should:

```text
Validate incoming Authentication.

Resolve Actor.

Validate environment.

Validate route permission.

Resolve Owner.

Execute narrowly scoped privileged work.

Avoid returning broad service-role data.
```

---

# Service-Role Query Scope

Even when using a service role, queries should include explicit scope:

```text
WHERE owner_id = target_owner_id
AND resource_id = target_resource_id
```

The bypass credential does not remove the need for least privilege.

---

# RLS Policy Deployment

Policy changes should be deployed with:

- Schema migration
- Policy-version update
- Automated cross-Owner tests
- Rollback or forward-fix plan
- Production verification
- Monitoring

---

# RLS Migration Safety

Before enabling a new policy:

```text
Inventory rows without owner_id.

Backfill ownership safely.

Validate no ambiguous rows.

Add constraints.

Test policies.

Enable RLS.

Verify ordinary and service paths.
```

---

# Missing Owner Rows

Rows with missing or ambiguous Owner should not become globally accessible.

Potential state:

```text
ownership_review_required
```

---

# RLS Disabled Table Detection

Production checks should identify Owner-private tables with RLS disabled or incomplete policies.

---

# RLS Policy Test Matrix

For each Owner-private table:

```text
Owner A read Owner A:
allow

Owner A read Owner B:
deny

Owner A insert Owner A:
allow where permitted

Owner A insert Owner B:
deny

Owner A update Owner A:
allow where permitted

Owner A change owner_id:
deny

Owner A delete Owner A:
allow only where permitted

Anonymous access:
deny
```

---

# Supabase Storage Authorization

Storage objects should use Owner-safe metadata and policies.

Potential object structure:

```text
bucket:
owner-private

path:
<ownerId>/<resourceType>/<resourceId>/<opaqueFileName>
```

The path is organizational.

It is not sufficient Authorization.

---

# Storage Metadata Table

Recommended fields:

```text
storageObjectId

bucketId

objectPath

ownerId

parentResourceType

parentResourceId

sensitivity

state

createdAt

expiresAt
```

---

# Storage Upload Flow

```text
Resolve Actor.

↓

Authorize upload action.

↓

Create canonical upload operation.

↓

Assign Owner metadata from trusted context.

↓

Issue bounded upload authority.

↓

Upload object.

↓

Validate object type and size.

↓

Finalize parent-resource association.

↓

Audit.
```

---

# Upload Authority

Where direct-to-storage upload is used, upload credentials should be:

- Short-lived
- Owner-scoped
- Path-scoped
- Size-bounded
- Content-type-bounded where possible
- Single-purpose

---

# Orphaned Upload

When upload succeeds but final association fails:

```text
Mark object orphaned.

Deny ordinary access.

Schedule bounded cleanup.

Do not expose it through predictable paths.
```

---

# Storage Download Flow

```text
Resolve Actor.

↓

Resolve storage metadata.

↓

Authorize parent resource read or download.

↓

Check object state.

↓

Issue short-lived download authority.

↓

Audit high-risk downloads where required.
```

---

# Storage Delete Flow

- Validate Owner or approved service scope.
- Validate parent resource state.
- Revoke active download authority where possible.
- Mark deletion state.
- Remove object.
- Preserve minimum audit evidence.

---

# Signed URL Governance

Signed URLs should contain only the necessary opaque authority.

They should not contain:

- Passwords
- Session tokens
- Recovery tokens
- Full financial descriptions
- Another Owner's identity

---

# Signed URL Expiration

Expiration should reflect:

- Resource sensitivity
- User action
- Platform behavior
- Download size
- Accessibility needs

Avoid unnecessarily long-lived URLs.

---

# Signed URL Reuse

Policy may define:

```text
single_use

bounded_multiple_use

time_bounded
```

Higher-sensitivity downloads should use narrower authority.

---

# Signed URL after Revocation

Where immediate cryptographic revocation is not possible:

- Use short expiration.
- Stop issuing new links.
- Revoke underlying object or access path where required.
- Record the residual exposure window.

---

# API Authorization Architecture

Every protected endpoint should declare:

```text
Authentication requirement

Permission ID

Resource type

Action

Purpose

Owner-resolution strategy

Recent-Authentication requirement

Entitlement requirement

Rate limit

Audit requirement
```

---

# API Route Registry

Recommended fields:

```text
routeId

method

path

permissionId

resourceType

action

purpose

actorTypes

OwnerResolution

requiresRecentAuthentication

requiredEntitlement

maximumPayload

rateLimitPolicy

auditPolicy

status

version
```

---

# API Middleware Flow

```text
Assign requestId.

↓

Validate environment and origin.

↓

Authenticate Session.

↓

Resolve Actor.

↓

Check route-level permission.

↓

Validate payload.

↓

Pass trusted Actor to handler.

↓

Handler resolves resource and performs full Authorization.
```

Route-level permission does not replace resource-level Authorization.

---

# API Request Body

Reject or ignore untrusted fields such as:

```text
role

isAdmin

permissionIds

ActorType

SupportAccessLevel

OwnerOverride
```

---

# API Identifier Validation

Resource identifiers should be:

- Correct format
- Bounded length
- Canonically parsed
- Non-executable
- Validated before use

Identifier validation does not grant access.

---

# API Batch Operations

Batch requests should authorize every item.

Potential responses:

```text
all_succeeded

partially_succeeded

all_denied

validation_failed
```

Do not authorize the batch merely because one resource belongs to the Owner.

---

# Batch Atomicity

For financial mutations, define whether the batch is:

```text
atomic

per_item_atomic

best_effort
```

Authorization outcomes must match the selected model.

---

# API Graph Traversal

When returning nested resources:

```text
Transaction

↓

Attachment

↓

Category

↓

Account
```

every nested relation must remain Owner-safe.

---

# API Include Expansion

Parameters such as:

```text
include=attachments,Account,history
```

must use an approved allowlist and separate field policies.

---

# API Error Status

Status behavior should avoid unnecessary resource enumeration.

Internal observability should preserve precise denial reasons.

---

# WebSocket and Realtime Authorization

Realtime subscriptions must:

- Authenticate the current Session.
- Bind to current Owner.
- Filter server-side.
- Stop after Session or Owner changes.
- Reauthorize after reconnect.
- Reject arbitrary channel names that expose other Owners.

---

# Realtime Channel Identity

Potential:

```text
owner:<ownerId>:transactions
```

The client must not gain access merely by constructing the channel name.

---

# Realtime Owner Switch

Before loading Owner B:

- Unsubscribe Owner A channels.
- Clear Owner A queued events.
- Increment Owner context version.
- Subscribe Owner B only after Authentication and Authorization.

---

# Realtime Event Revalidation

Events should include enough metadata to verify:

```text
ownerId

resourceType

resourceId

eventVersion
```

Discard mismatched Owner events.

---

# Resource-Specific Authorization

---

# Account Resource Authorization

The financial Account resource belongs to one Owner.

Potential permissions:

```text
PERM-ACCOUNT-LIST

PERM-ACCOUNT-READ

PERM-ACCOUNT-CREATE

PERM-ACCOUNT-UPDATE

PERM-ACCOUNT-ARCHIVE

PERM-ACCOUNT-DELETE
```

---

# Account Create

Assign `ownerId` from the current Actor.

Do not accept a different Owner from client input.

---

# Account Read

Allow only when:

```text
actor.ownerId == Account.ownerId
```

and the Account lifecycle permits read.

---

# Account Update

Ownership fields are immutable.

Sensitive account-level changes may require recent Authentication.

---

# Account Delete

Deletion must preserve financial invariants and related Transaction behavior.

Authorization does not replace Domain deletion rules.

---

# Transaction Authorization

Potential permissions:

```text
PERM-TRANSACTION-LIST

PERM-TRANSACTION-READ

PERM-TRANSACTION-CREATE

PERM-TRANSACTION-UPDATE

PERM-TRANSACTION-DELETE

PERM-TRANSACTION-RESTORE
```

---

# Transaction Create

Requirements:

```text
Current Owner

Active or permitted Account state

Valid target financial Account owned by same Owner

Valid Category owned by same Owner or system-approved

Capability and plan limit where applicable
```

---

# Transaction Update

Validate:

- Transaction Owner
- Related Account Owner
- Related Category scope
- Current lifecycle
- Financial invariants
- Operation version

---

# Transaction Delete

Authorization should distinguish:

```text
soft_delete

permanent_purge
```

Permanent purge may require a specialized service or retention policy.

---

# Transfer Authorization

A Transfer affects at least two Owner-scoped financial Accounts.

Both source and destination Accounts must belong to the same approved Owner under the individual-owner model.

---

# Transfer Create Flow

```text
Authorize create Transfer.

↓

Load source Account for Owner.

↓

Load destination Account for Owner.

↓

Validate both Owner relationships.

↓

Validate financial atomicity.

↓

Create both Transfer sides.
```

---

# Cross-Owner Transfer Prohibition

The internal Transfer feature must not become a cross-user money-transfer capability.

---

# Goal Authorization

Goals are Owner-private.

Potential permissions:

```text
list

read

create

update

archive

delete

restore
```

Premium entitlement may control advanced Goal capabilities.

It does not alter Owner access.

---

# Category Authorization

Categories may be:

```text
system_global

owner_private
```

System-global categories may be readable broadly.

Owner-private categories remain Owner-scoped.

---

# System Category Mutation

Ordinary Owners should not mutate canonical system-global categories.

They may create Owner-specific alternatives where Product policy permits.

---

# Report Authorization

Report generation requires:

- Owner read permission for source data
- Report capability entitlement where applicable
- Approved Date range
- Bounded row and computation scope
- Owner binding for generated artifacts

---

# Report Cache

A cached Report must remain Owner-scoped.

Cache keys should include:

```text
ownerId

Report definition

Date range

Currency scope

permissionVersion

dataVersion
```

---

# Report Download

Reauthorize current Owner and Report state before download.

---

# Attachment Authorization

Attachment read requires authorization to:

```text
Attachment

and

Parent resource
```

---

# Attachment Upload

The parent resource must already belong to the current Owner or be created atomically with the upload workflow.

---

# Import Authorization

Potential permissions:

```text
PERM-IMPORT-CREATE

PERM-IMPORT-UPLOAD

PERM-IMPORT-PREVIEW

PERM-IMPORT-CONFIRM

PERM-IMPORT-CANCEL

PERM-IMPORT-DELETE
```

---

# Import Create

The Import batch is bound to the current Owner at creation.

---

# Import Preview

Preview results must:

- Remain Owner-scoped
- Avoid applying mutations
- Avoid appearing in global caches
- Expire according to policy

---

# Import Confirmation

Before applying:

```text
Reauthenticate Session context.

Reauthorize Import batch.

Validate batch Owner.

Validate file state.

Validate preview version.

Validate current Product limits.

Apply owner-bound operations.
```

---

# Import after Owner Switch

The original Import batch must close or remain protected under Owner A.

Owner B cannot confirm it.

---

# Export Authorization

Potential permissions:

```text
PERM-EXPORT-CREATE

PERM-EXPORT-READ-STATUS

PERM-EXPORT-DOWNLOAD

PERM-EXPORT-CANCEL

PERM-EXPORT-DELETE
```

---

# Export Create

Potential requirements:

- Current Owner
- Active Session
- Recent Authentication for sensitive scopes
- Approved data categories
- Current Account lifecycle
- Explicit user request

---

# Export Job Binding

Recommended:

```text
ExportJobId

ownerId

requestingActorId

sessionId

deviceId

scope

createdAt

authorizationVersion
```

---

# Export Service Actor

The Export generator should receive:

```text
One Export job

One Owner

One approved data scope

One expiration

One output destination
```

---

# Export Job Reauthorization

Before execution:

- Check Account deletion state.
- Check job state.
- Check scope.
- Check current policy.
- Check that the job was not cancelled.

---

# Export Download

The authenticated Owner must reauthorize the specific Export file.

An email containing a link must not bypass Sign-in and Owner checks unless a separately approved secure delivery model exists.

---

# Export after Account Deletion Request

Policy should define whether:

- An already-created Export remains downloadable briefly
- New Exports are blocked
- The deletion coordinator waits for explicit completion
- The file is removed immediately

The behavior must be clear and time-bounded.

---

# Notification Authorization

Potential permissions:

```text
PERM-NOTIFICATION-LIST

PERM-NOTIFICATION-READ

PERM-NOTIFICATION-MARK-READ

PERM-NOTIFICATION-ACT

PERM-NOTIFICATION-DELETE
```

---

# Notification List

Return only Notifications whose:

```text
recipientOwnerId == actor.ownerId
```

---

# Notification Action

Before execution:

```text
Validate Notification recipient.

↓

Validate current Actor Owner.

↓

Resolve target resource.

↓

Authorize target action.

↓

Validate current resource state.

↓

Execute or show safe fallback.
```

---

# Notification Created before Permission Change

An old Notification does not preserve prior access.

The action must use the current policy.

---

# Notification Created before Owner Deletion

After deletion begins, ordinary Notification actions should be denied.

---

# Assistant Authorization Architecture

The Assistant should use an explicit context-access service.

---

# Assistant Context Request

Recommended fields:

```text
assistantContextRequestId

actorId

ownerId

conversationId

purpose

requestedResourceTypes

requestedFields

DateRange

maximumRecords

createdAt
```

---

# Assistant Context Flow

```text
Validate current Session.

↓

Validate current Owner.

↓

Validate Assistant capability and Privacy.

↓

Authorize requested resource types.

↓

Apply Owner filters.

↓

Apply field minimization.

↓

Apply record limits.

↓

Create bounded context package.

↓

Send only approved context to the model.
```

---

# Assistant Retrieval before Authorization

Prohibited:

```text
Search all Owners' data

↓

Send results to AI

↓

Ask AI to identify the current Owner's records
```

---

# Assistant Generated Actions

When AI proposes a financial command:

```text
AI proposes structured intent.

↓

Application validates intent.

↓

Current Actor authorizes resource and action.

↓

User confirms where required.

↓

Canonical command executes.
```

AI output is not permission.

---

# Assistant Conversation Ownership

Every Assistant conversation should identify:

```text
ownerId

AccountId

identityId where required

privacyState

authorizationVersion
```

---

# Assistant after Owner Switch

- Close or archive Owner A context.
- Clear model context.
- Clear retrieval cache.
- Start Owner B context only after authorization.
- Never summarize Owner A history for Owner B.

---

# Subscription and Entitlement Authorization

Potential resource permissions:

```text
PERM-SUBSCRIPTION-READ

PERM-SUBSCRIPTION-MANAGE

PERM-PURCHASE-RESTORE

PERM-ENTITLEMENT-READ
```

---

# Subscription Read

Only the associated Owner should access ordinary subscription state.

Support may access limited diagnostic state through a case-scoped Grant.

---

# Subscription Management

Requires:

- Current Owner
- Active or approved restricted Session
- Correct provider mapping
- Current purchase association
- Recent Authentication where required

---

# Entitlement Evaluation

Entitlement decisions should consume the current `ownerId`.

A valid entitlement for Owner A cannot be applied to Owner B's Actor context.

---

# Session and Device Authorization

Potential permissions:

```text
PERM-SESSION-LIST

PERM-SESSION-REVOKE

PERM-SESSION-REVOKE-ALL

PERM-DEVICE-LIST

PERM-DEVICE-REVOKE
```

---

# Session List

Current Owner may list only Sessions associated with the same canonical Identity and Account according to the Identity specification.

---

# Revoke Another Session

Authorization should verify:

- Same Identity or approved Account relationship
- Session is not outside scope
- Recent Authentication where required
- Current Actor remains active

---

# Account Deletion Authorization

Potential permission:

```text
PERM-ACCOUNT-DELETE-SELF
```

Requirements:

```text
Actor is the target Owner.

Session is active.

Recent reauthentication is valid.

Account lifecycle permits deletion request.

Deletion operation is explicit.
```

No subscription entitlement may block it.

---

# Background Job Authorization Architecture

Every background job should use an authorization envelope.

---

# Job Authorization Envelope

Recommended fields:

```text
jobId

jobType

serviceActorId

originalActorId

identityId where applicable

AccountId where applicable

ownerId

resourceType

resourceIds

permissionIds

purpose

policyVersion

createdAt

expiresAt

operationId
```

---

# Background Job Creation

The initiating command should:

- Authorize the Owner action.
- Create the job.
- Record original Actor and Owner.
- Limit resource scope.
- Set expiration.
- Set policy version.

---

# Background Job Execution

Before executing:

```text
Validate service Actor.

↓

Validate job state and expiration.

↓

Validate Owner and Account lifecycle.

↓

Validate resource state.

↓

Validate policy version.

↓

Validate permission scope.

↓

Execute bounded operation.

↓

Record result and audit.
```

---

# Job after Owner Sign-Out

Sign-out does not always cancel already-authorized background work.

The job policy should state whether it:

- Continues
- Pauses
- Requires reauthentication
- Cancels

Examples:

```text
Export generation:
May continue after local Sign-out if explicitly requested and still policy-valid

Owner interactive mutation:
Should normally stop
```

---

# Job after Account Restriction

Re-evaluate the restriction scope.

---

# Job after Account Deletion

Only jobs with approved deletion, retention or audit purpose may continue.

---

# Job Lease

A worker lease should not expand Authorization.

It only controls which worker executes the authorized job.

---

# Job Retry

A Retry preserves:

```text
jobId

ownerId

purpose

resource scope

operationId
```

Reauthorization occurs before material execution.

---

# Scheduled Jobs

Scheduled reminders, Reports or maintenance jobs should preserve:

- Owner
- Resource
- Schedule authority
- Current Account state
- Current entitlement where required
- Current permission policy

---

# Scheduled Job after Entitlement Expiration

An advanced Premium scheduled action may stop.

Existing data remains preserved.

---

# Provider Callback Authorization

Provider callbacks should be treated as external Actors.

---

# Provider Event Envelope

Recommended fields:

```text
providerEventId

providerId

environment

eventType

externalResourceReference

receivedAt

authenticatedAt

processingState

allowedPurpose
```

---

# Provider Callback Flow

```text
Receive event

↓

Validate provider Authentication

↓

Validate signature or authority

↓

Validate environment

↓

Validate event replay state

↓

Validate allowed event type

↓

Resolve canonical resource

↓

Validate provider scope

↓

Apply allowed transition only

↓

Audit

↓

Return provider-safe result
```

---

# Provider Scope Matrix

Potential:

| Provider | Allowed Scope | Prohibited Scope |
|---|---|---|
| Authentication provider | Identity and Session operations | Financial records |
| Billing provider | Purchase and subscription verification | Transactions and balances |
| Advertising provider | Approved Ad-request fields | Financial records and Assistant prompts |
| Email provider | Approved communication destination and content | General Product database |
| Crash provider | Minimized diagnostic data | Credentials and financial payloads |

---

# Provider Event Owner Resolution

The provider event may contain a purchase, Session or delivery reference.

Nexio resolves the canonical Owner internally.

The provider must not be trusted to assign arbitrary Owner IDs.

---

# Provider Event Unknown Owner

Potential:

```text
owner_resolution_required
```

Do not:

- Create a new Owner
- Attach to the current operator
- Apply another Owner's resource
- Expose the external reference publicly

---

# Support Authorization Implementation

Support tools should use a separate privileged interface and policy path.

---

# Support Session

Recommended fields:

```text
SupportSessionId

agentIdentityId

agentRoleIds

AuthenticationStrength

createdAt

expiresAt

SecurityVersion

deviceId

state
```

---

# Support Case Context

Every case should include:

```text
SupportCaseId

targetOwnerId

caseType

caseState

permittedDataCategories

currentAccessGrantIds

createdAt

closedAt
```

---

# Basic Support Flow

```text
Agent authenticates strongly.

↓

Agent opens Support case.

↓

Tool loads safe case metadata.

↓

Policy validates Support_basic role.

↓

Only approved fields are returned.

↓

Access is audited.
```

---

# Diagnostic Support Flow

```text
Case exists.

↓

Agent requests diagnostic view.

↓

Policy validates case purpose.

↓

Field-level scope is calculated.

↓

Diagnostic metadata is returned.

↓

No ordinary financial payload is returned.

↓

Access is audited.
```

---

# Elevated Support Flow

```text
Agent submits bounded request.

↓

Reason and necessary fields are stated.

↓

Lower-privilege alternatives are evaluated.

↓

Approver reviews.

↓

Time-bounded Access Grant is created.

↓

Agent enters visible elevated mode.

↓

Only approved Owner, resources and fields are accessible.

↓

Every view and action is audited.

↓

Grant expires automatically.
```

---

# Visible Elevated Mode

The tool should display:

```text
Elevated access active

Case:
[reference]

Target:
[masked Owner reference]

Scope:
[approved resources]

Expires:
[Date and time]
```

Avoid ordinary Product styling that could hide the privileged state.

---

# Elevated Support Restrictions

Potential prohibitions:

```text
No password access

No Session-token access

No recovery-token access

No purchase-token access

No Account ownership change

No deletion cancellation

No arbitrary Export

No share creation

No AI access to unrestricted case data
```

---

# Support Action Confirmation

High-risk Support actions may require:

- Reauthentication
- Second approval
- Explicit reason
- User notification
- Post-action review

---

# Support Case Closure

Closing a case should:

- Revoke case-scoped Grants.
- Close privileged views.
- Stop background diagnostic jobs.
- Preserve audit evidence.
- Remove temporary downloaded data according to policy.

---

# Support Access after Account Deletion

Ordinary Support access should stop or become deletion-status-only.

Required retained case evidence should remain minimized.

---

# Privileged Access Implementation

Privileged access should use a dedicated coordinator.

---

# Privileged Access Request Flow

```text
Authenticate requester.

↓

Validate requester role.

↓

Collect target Owner and resource scope.

↓

Collect purpose and case or Incident.

↓

Calculate requested duration.

↓

Evaluate policy.

↓

Require approval.

↓

Create Access Grant.

↓

Notify monitoring.

↓

Activate bounded privileged Session.

```

---

# Grant Activation Preconditions

```text
Grant is approved.

Start time has arrived.

Expiration has not passed.

Requester is still active.

Requester role is still active.

Case or Incident is active.

Target Account state permits the purpose.

No explicit deny applies.
```

---

# Grant Use

Every privileged request should include or resolve:

```text
accessGrantId
```

The tool should verify the Grant on every protected action.

---

# Grant Scope Enforcement

A Grant for:

```text
ExportJobId = 123
```

must not access:

```text
All Exports of the Owner
```

unless explicitly granted.

---

# Grant Expiration

At expiration:

- Deny new access.
- Close privileged views.
- Stop privileged background jobs.
- Revoke temporary download links.
- Require a new request for continued access.

---

# Grant Revocation

Revocation should propagate immediately where technically possible.

---

# Break-Glass Implementation

Recommended:

```text
Severe Incident exists.

↓

Operator authenticates strongly.

↓

Operator selects break-glass.

↓

Incident and reason are required.

↓

Narrow target and permissions are required.

↓

Independent approval occurs where feasible.

↓

Short-lived Grant is issued.

↓

Security alert is sent.

↓

All access is audited in enhanced mode.

↓

Grant expires.

↓

Mandatory post-use review occurs.
```

---

# Break-Glass Technical Controls

```text
Short maximum duration

No silent renewal

No unrestricted bulk download

No share-link generation

No recovery-token viewing

No password viewing

No role management outside Incident scope

Real-time monitoring

Immutable audit
```

---

# Break-Glass Failure

If approval or audit infrastructure is unavailable:

```text
Deny access
```

unless a separately approved offline emergency procedure exists.

---

# Future Sharing Implementation

General sharing remains disabled until the Product activates it explicitly.

---

# Sharing Feature Flag

A future sharing capability should require:

```text
Product approval

Policy Registry activation

Resource Registry shareable = true

UI activation

API activation

Database policy activation

Notification activation

Support readiness
```

---

# Share Invitation Creation Flow

```text
Owner selects share action.

↓

Authorize share permission.

↓

Validate resource shareability.

↓

Collect recipient address or identifier.

↓

Create invitation without granting access.

↓

Send privacy-safe invitation.

↓

Wait for recipient acceptance.
```

---

# Invitation Privacy

The invitation should avoid revealing unnecessary financial details before recipient Authentication and acceptance.

---

# Invitation Acceptance Flow

```text
Recipient opens approved link.

↓

Recipient authenticates.

↓

Invitation identity is validated.

↓

Expiration and state are validated.

↓

Scope and permissions are displayed.

↓

Recipient accepts explicitly.

↓

Access Grant is created.

↓

Owner and recipient receive confirmation.
```

---

# Recipient Identity Mismatch

Do not grant access to whoever happens to be signed in.

The accepted Identity must satisfy the invitation policy.

---

# Share Grant Evaluation

After acceptance:

```text
Resource Owner policy

or

Active share Grant policy
```

may allow access.

The Grant must remain resource- and permission-specific.

---

# Shared Resource Query

A recipient query should use an explicit Grant join.

Do not change the resource `owner_id`.

---

# Shared Resource Mutation

When future editing is approved:

- Validate edit permission.
- Preserve original Owner.
- Record acting Actor.
- Record change history.
- Apply field limitations.
- Prevent access expansion.

---

# Shared Resource Audit

Audit should distinguish:

```text
Resource Owner

Acting recipient

Permission

Grant

Action

Date and time
```

---

# Sharing Revocation Flow

```text
Owner opens shared access list.

↓

Selects recipient or link.

↓

Confirms revocation.

↓

Grant becomes revoked.

↓

Recipient queries stop.

↓

Active download authority expires or is revoked.

↓

Background work stops.

↓

Notifications are sent where appropriate.
```

---

# Sharing after Recipient Account Deletion

The recipient's Grants should become unusable.

The source resource remains owned by the original Owner.

---

# Sharing after Owner Account Deletion

All Grants, invitations and links should be revoked.

---

# Share-Link Implementation Boundary

Unauthenticated links remain disabled by default.

When separately approved:

```text
Token validates the link

but

does not become an ordinary Nexio Session
```

The link may access only the exact approved resource and fields.

---

# Share-Link Request Flow

```text
Receive opaque token.

↓

Hash and compare securely.

↓

Validate link state.

↓

Validate expiration.

↓

Validate use limit.

↓

Validate resource state.

↓

Apply field projection.

↓

Record access.

↓

Return bounded view.
```

---

# Share-Link Enumeration Protection

Invalid, expired, revoked and unknown tokens should use equivalent external behavior where practical.

---

# Share-Link Download

A view link must not imply file-download permission.

Download requires a separately approved link permission.

---

# Offline Authorization Architecture

Offline actions rely on bounded cached Authorization and must be reauthorized before synchronization.

---

# Offline Authorization Record

Recommended fields:

```text
offlineAuthorizationId

ownerId

sessionId

deviceId

permissionId

resourceType

scope

policyVersion

SecurityVersion

verifiedAt

validUntil

state
```

---

# Offline Authorization States

Recommended:

```text
available

active

expired

revoked_pending_check

reauthorization_required

invalid
```

---

# Offline Read

Existing local Owner data may be read when:

- Offline Session is valid
- Device matches
- Owner partition matches
- Permission was previously established
- Resource is locally available
- Local policy permits read

---

# Offline Create

An offline create operation should:

- Assign Owner from local trusted context
- Preserve operationId
- Preserve Device
- Preserve policy version
- Avoid untrusted Owner input
- Remain pending synchronization

---

# Offline Update

The local resource must already belong to the current offline Owner.

---

# Offline Delete

Soft deletion may be queued.

Permanent purge should normally require online authority.

---

# Offline Privileged Access

Support, administrative and break-glass access should not operate offline unless a separate highly controlled design exists.

---

# Offline Sharing

Creating invitations, Grants or share links should require online authority.

---

# Synchronization Reauthorization

Before uploading each queued operation:

```text
Refresh Session.

↓

Resolve current Owner.

↓

Validate Device.

↓

Validate Account lifecycle.

↓

Re-evaluate permission.

↓

Validate resource ownership.

↓

Validate operation policy version.

↓

Reconcile prior server outcome.

↓

Apply or deny.
```

---

# Offline Permission Revocation

If permission was revoked while offline:

- Deny synchronization.
- Preserve the local operation for safe review where appropriate.
- Do not apply it under another Owner.
- Explain the denial.

---

# Offline Account Restriction

Apply current restriction before synchronizing.

---

# Offline Account Deletion

Do not synchronize ordinary operations into a deletion-pending or deleted Owner.

---

# Offline Resource Deleted Remotely

A local edit to a remotely deleted resource should enter conflict resolution.

Authorization does not imply automatic restoration.

---

# Revocation Propagation Architecture

Revocation events may include:

```text
Session revoked

Device revoked

Role removed

Permission removed

Grant revoked

Grant expired

Resource deleted

Share revoked

Account restricted

Account suspended

Account deletion started

Provider disabled
```

---

# Revocation Event Record

Recommended fields:

```text
revocationEventId

revocationType

targetActorId

targetOwnerId

targetResourceType

targetResourceId

grantId

effectiveAt

policyVersion

reason

createdAt
```

---

# Revocation Propagation Flow

```text
Persist canonical revocation.

↓

Increment relevant Authorization version.

↓

Invalidate decision caches.

↓

Notify active Application sessions.

↓

Stop realtime subscriptions.

↓

Stop background jobs.

↓

Close privileged views.

↓

Revoke temporary file authority.

↓

Reject subsequent requests.

↓

Audit completion.
```

---

# Revocation Client Event

Potential:

```text
authorization_context_changed
```

The client should:

- Stop protected commands
- Clear stale views
- Reload current policy
- Require reauthentication or return to a safe screen

---

# Revocation after Download

Once a file is downloaded to a user-controlled Device, Nexio may not be able to technically revoke the local copy.

The Product should:

- Minimize link lifetime
- Inform users of sensitive Export responsibilities
- Avoid unnecessary downloads
- Record access where appropriate

---

# Role Change Propagation

After an operator role is removed:

- Revoke privileged Sessions or require refresh.
- Invalidate Grants relying on that role.
- Close administrative tools.
- Stop privileged jobs.

---

# Policy Deployment Propagation

After policy deployment:

- Increment policy version.
- Invalidate incompatible decisions.
- Re-evaluate long-running jobs.
- Monitor denial and failure rates.
- Preserve rollback capability.

---

# Authorization Service Failure Architecture

The Authorization service may fail because of:

```text
Policy repository unavailable

Owner resolver unavailable

Session repository unavailable

Permission Registry unavailable

Database unavailable

Timeout

Version conflict

Malformed policy
```

---

# Fail-Closed Default

For protected resources:

```text
Deny or temporarily block.
```

Do not silently allow access from a stale broad fallback.

---

# Safe Degraded Access

Some low-risk local read operations may continue under bounded previously verified offline policy.

This exception must be explicit.

---

# Authorization Temporarily Unavailable Content

```text
Nexio could not verify access for this action right now.

Your existing financial records remain preserved.

Try again after the Account connection is restored.
```

---

# Policy Repository Failure

- Stop new privileged Grants.
- Stop sharing creation.
- Stop break-glass unless separate emergency authority exists.
- Preserve current ordinary Owner access only where safely enforceable through local and database controls.
- Alert Operations.

---

# Owner Resolver Failure

- Hide protected data.
- Stop commands and queries.
- Do not create a new Owner.
- Preserve local Owner partitions.
- Require repair or reauthentication.

---

# RLS Policy Failure

Potential cases:

```text
Policy denies all intended access

Policy unintentionally allows broad access

Policy syntax deployment failure

Policy version mismatch
```

A suspected broad-allow failure is Critical.

---

# RLS Fail-Safe Response

When broad access cannot be excluded:

- Disable affected API or client path.
- Revoke broad credentials.
- Stop synchronization.
- Preserve evidence.
- Run cross-Owner validation.

---

# Storage Policy Failure

If file ownership cannot be validated:

```text
Deny upload or download.
```

---

# Privileged Grant Service Failure

- Deny new elevated access.
- Preserve existing Grant state only until its original expiration.
- Do not extend automatically.
- Alert Security and Operations.

---

# Realtime Authorization Failure

- Disconnect the affected subscription.
- Clear pending events.
- Reauthenticate.
- Resubscribe only after Owner resolution.

---

# Access Denial User Experience

A denial should explain only what is safe and actionable.

Potential categories:

```text
Sign-in required

Session expired

Current Account unavailable

Resource unavailable

Recent Authentication required

Current plan does not include this action

Temporary access expired

Action unavailable during Account deletion
```

---

# Generic Resource Denial

```text
Nexio could not access this resource for the current Account.
```

---

# Reauthentication Denial

```text
Sign in again to continue with this sensitive action.
```

---

# Entitlement Denial

```text
Your current Account may access the existing data, but this action requires a different plan capability.
```

---

# Expired Grant Denial

```text
Temporary access to this resource expired.

Request new access through the approved process.
```

---

# Owner Switch Denial

```text
This action belongs to the previous Nexio Account context and cannot continue after switching Accounts.
```

---

# Account Deletion Denial

```text
Ordinary Product actions are unavailable while Account deletion is in progress.
```

---

# Accessibility of Denial States

Required:

```text
□ Error heading receives focus where appropriate.

□ Reason is announced.

□ Available next action is explicit.

□ The user can leave the denied screen.

□ No color-only meaning is used.

□ Reauthentication controls are keyboard accessible.

□ The resource is not visible behind the denial.
```

---

# Authorization Audit Implementation

Audit should focus on material decisions and privileged activity.

---

# Audit Categories

Potential:

```text
Owner access denial

Owner mismatch

Resource mutation

Export download

Support diagnostic access

Support elevated access

Break-glass access

Grant creation

Grant revocation

Share acceptance

Share revocation

Provider callback application

Service-role operation

Account deletion access
```

---

# Audit Correlation

Use:

```text
requestId

operationId

authorizationDecisionId

accessGrantId

SupportCaseId

incidentId

jobId

providerEventId
```

---

# Audit Payload Minimization

Record:

- Resource type
- Opaque resource ID
- Actor
- Action
- Purpose
- Decision
- Reason
- Policy version
- Time

Avoid full financial payloads.

---

# Authorization Testing Architecture

Required test categories:

```text
Actor resolution

Owner isolation

Role and permission

Policy evaluation

Command authorization

Query authorization

Database RLS

Storage

API

Realtime

Imports

Exports

Attachments

Notifications

Assistant

Entitlements

Jobs

Providers

Support

Privileged access

Break glass

Sharing

Offline

Revocation

Account deletion

Accessibility

Privacy

Security

Failure injection

Performance
```

---

# Actor Resolution Tests

```text
Valid Owner Actor

Missing Session

Expired Session

Revoked Session

Revoked Device

Restricted Account

Suspended Account

Deleted Account

Unknown Owner

Conflicting client ownerId

Service Actor

Provider Actor
```

---

# Owner-Isolation Tests

Use at least:

```text
Owner A

Owner B

Support Agent

System service
```

Verify every protected resource type.

---

# Owner Read Matrix

```text
Owner A reads Owner A:
allow

Owner A reads Owner B:
deny

Owner B reads Owner A:
deny

Anonymous reads Owner A:
deny

Support basic reads Owner A financial payload:
deny

Approved service reads bounded Owner A scope:
allow
```

---

# Owner Mutation Matrix

```text
Owner A updates Owner A:
allow where permitted

Owner A updates Owner B:
deny

Owner A changes Owner A resource ownerId to Owner B:
deny

Owner A deletes Owner B:
deny

Support basic mutates Owner A:
deny
```

---

# Command Tests

```text
Allow decision

Deny decision

Reauthentication required

Entitlement required

Permission revoked before execution

Resource deleted before execution

Owner switch during request

Duplicate Retry

Stale operation
```

---

# Query Tests

```text
Owner filtering

Count filtering

Search filtering

Snippet filtering

Pagination Owner binding

Cursor tampering

Sorting allowlist

Projection limits

Deleted-resource exclusion

Aggregate isolation
```

---

# RLS Tests

For every Owner-private table:

```text
Select own row

Select other Owner row

Insert own Owner

Insert other Owner

Update own row

Change ownership

Delete own row

Delete other Owner row

Anonymous request

Service-role bounded request
```

---

# RLS Function Tests

```text
Current Owner resolution

No authenticated subject

Suspended Account

Deleted Account

Conflicting provider links

Multiple active Owners unexpectedly

Search-path attack

Unauthorized function execution
```

---

# Database View Tests

```text
Underlying RLS preserved

No cross-Owner aggregate

No hidden field exposure

No service-definer bypass

Pagination isolated
```

---

# Storage Tests

```text
Upload own resource

Upload to another Owner path

Download own file

Download another Owner file

Predictable path access

Expired signed URL

Revoked Grant

Deleted parent resource

Owner switch while download loads

Orphaned upload
```

---

# API Tests

```text
Missing Authentication

Malformed Session

Client-supplied role

Client-supplied isAdmin

Client-supplied different ownerId

Wrong environment

Batch mixed Owners

Nested resource expansion

Oversized payload

Route permission missing
```

---

# Realtime Tests

```text
Subscribe own Owner channel

Subscribe another Owner channel

Owner switch

Session revocation

Reconnect

Stale event

Malformed channel

Deleted Account
```

---

# Import Tests

```text
Create Owner A batch

Owner B attempts preview

Owner B attempts confirmation

Owner switch during Import

Expired preview

Deleted batch

Restricted Account

Offline confirmation
```

---

# Export Tests

```text
Create own Export

Read another Owner Export status

Download own file

Download another Owner file

Expired file

Revoked Session

Owner switch

Account deletion started

Support basic download attempt
```

---

# Attachment Tests

```text
Own parent and own attachment

Other Owner parent

Attachment Owner mismatch

Deleted parent

Orphaned file

Signed URL expiration

Field projection
```

---

# Notification Tests

```text
Own Notification

Other Owner Notification

Target resource deleted

Permission revoked after notification creation

Owner switch

Deep-Link replay

Account deletion
```

---

# Assistant Tests

```text
Owner A context

Owner B context

Owner switch

Unauthorized resource request

Field minimization

Maximum record limit

Conversation cache clearing

AI-generated command reauthorization
```

---

# Entitlement Tests

```text
Owner authorized and entitled

Owner authorized but not entitled

Entitled Owner requests other Owner resource

Entitlement expires during command

Ad-free entitlement and resource access remain separate
```

---

# Background Job Tests

```text
Valid job envelope

Expired job

Owner deleted

Account restricted

Permission version changed

Resource deleted

Retry

Lease transfer

Different worker

Service Actor revoked
```

---

# Provider Tests

```text
Valid provider event

Invalid signature

Wrong environment

Replay

Unsupported event type

Unknown Owner

Provider scope exceeds policy

Provider attempts financial read

Callback repeated
```

---

# Support Tests

```text
Basic metadata

Diagnostic field projection

Exact Amount denied

Transaction description denied

Elevated request

Approval required

Grant expiration

Case closure

Other Owner case

Support Session revocation
```

---

# Break-Glass Tests

```text
No Incident

No approval

Wrong target

Excessive duration

Disallowed permission

Valid emergency access

Expiration

Post-use review

Audit failure
```

---

# Future Sharing Tests

```text
Sharing disabled

Resource not shareable

Invitation created

Wrong recipient identity

Expired invitation

Accepted invitation

Read-only Grant

Revocation

Owner deletion

Recipient deletion

Share-link token replay
```

---

# Offline Tests

```text
Valid cached permission

Expired offline permission

Permission revoked remotely

Session revoked remotely

Device revoked remotely

Owner switch

Different Owner Sign-in

Account restriction

Account deletion

Queued operation reauthorization
```

---

# Revocation Tests

```text
Role removed

Permission removed

Grant expired

Grant revoked

Session revoked

Device revoked

Resource deleted

Share revoked

Provider disabled

Policy version changed
```

---

# Account Deletion Tests

```text
Owner deletion request

Ordinary Owner access stops

Support access restricted

Background jobs stop

Deletion coordinator continues

Exports handled

Share Grants revoked

Signed URLs expire

Offline Device reconnects

Provider callbacks after deletion
```

---

# Security Tests

```text
Insecure direct object reference

Mass assignment of ownerId

Role parameter injection

JWT claim tampering

Service credential leakage

RLS bypass

Database-function abuse

Storage path guessing

Signed URL leakage

Share token leakage

Privilege escalation

Support impersonation

Cross-environment access
```

---

# Privacy Tests

```text
Field minimization

Support projections

Provider projections

Audit minimization

Assistant context scope

Analytics separation

Deletion-only access

Expired Grant retention
```

---

# Accessibility Tests

```text
Denied-state screen reader

Keyboard reauthentication

Read-only explanation

Expired Grant explanation

Support-elevated visual state

Sharing invitation scope

Revocation confirmation

Large-text permission table
```

---

# Failure-Injection Tests

Inject:

```text
Authorization service timeout

Owner resolver timeout

Policy repository outage

Session repository outage

RLS deployment failure

Storage policy failure

Decision-cache corruption

Realtime disconnect

Grant service outage

Audit service failure

Provider callback backlog

Account deletion during command
```

---

# Audit-Service Failure

For ordinary low-risk Owner reads, policy may permit operation with queued audit repair.

For privileged, break-glass or destructive access:

```text
Deny when required audit cannot be created.
```

The rule must be explicit.

---

# Authorization Performance Tests

Verify:

- Actor resolution latency
- Owner-safe list latency
- RLS query latency
- Policy-evaluation latency
- Decision-cache invalidation
- Owner switching
- Realtime subscription changes
- File authorization
- Export creation
- Privileged tool access

Performance optimization must not remove Owner predicates.

---

# Authorization Operational Monitoring

Monitor:

```text
Authorization allow rate

Authorization deny rate

Owner mismatch

Owner resolution failure

Permission missing

Scope exceeded

Policy unavailable

RLS denial rate

RLS unexpected allow signal

Storage denial

Signed URL generation

Support elevated access

Break-glass access

Grant expiration

Grant revocation

Sharing activity

Offline reauthorization failure

Provider scope rejection

Deleted-owner access attempt
```

---

# Critical Alerts

Trigger immediately for:

```text
Cross-Owner resource access

RLS broad-access failure

Service-role credential exposure

Unauthorized Export download

Unauthorized attachment download

Support unauthorized financial access

Break-glass access without audit

Share-token exposure

Revoked Grant accepted

Deleted Owner ordinary access

Provider reads outside approved scope

AI-triggered unauthorized command
```

---

# High Alerts

Potential:

```text
Owner mismatch spike

Policy service outage

RLS denial anomaly

Storage-policy failure

Grant revocation backlog

Session-revocation propagation failure

Support elevated-access anomaly

Offline unauthorized sync attempt

Provider-scope rejection spike
```

---

# Authorization Release Gates

Do not release when:

```text
Protected commands lack permission declarations.

Protected queries lack trusted Owner filters.

Client ownerId controls ownership.

Database RLS is missing on Owner-private tables.

RLS cross-Owner tests fail.

Service-role credentials appear in client code.

Storage downloads rely only on paths.

Export download lacks reauthorization.

Notification actions bypass resource Authorization.

Assistant retrieval occurs before Owner filtering.

Background jobs lack Actor and Owner envelopes.

Provider callbacks lack scope validation.

Support can access exact financial data by default.

Elevated Support access lacks expiration.

Break-glass access lacks audit.

Sharing activates without revocation.

Offline synchronization skips reauthorization.

Account deletion leaves ordinary access active.

Required Accessibility fails.
```

---

# Part 2 Anti-Patterns

The following are prohibited:

## Authorization Middleware Only

Assuming route middleware replaces resource-level checks.

## Repository Finds by ID Only

Loading Owner-private resources without Owner scope.

## RLS Only

Assuming database policy replaces Application command authorization.

## Application Only

Assuming Application checks make database policy unnecessary.

## Service Role for Convenience

Bypassing RLS for ordinary Product requests.

## Client Claims Are Trusted

Using client-supplied role, permission or Owner values.

## Cached Allow Forever

Reusing permission decisions after Session, role or policy changes.

## Query before Owner Resolution

Loading financial rows before establishing the current Owner.

## Search before Filtering

Generating snippets from all users' data.

## Global Aggregate

Calculating counts or totals across all Owners.

## Insecure Cursor

Allowing a pagination cursor to cross Owner boundaries.

## Batch Authorized Once

Applying one allow decision to mixed-Owner resources.

## Nested Resource Leak

Returning unauthorized related resources through API expansion.

## Realtime Channel Name as Permission

Allowing access because the client knows an Owner channel name.

## Child File without Parent Check

Opening an attachment without validating the parent resource.

## Long-Lived Export Link

Using permanent download links.

## Export Email Bypasses Sign-in

Allowing a link recipient to download Owner data without current Authorization.

## Import Confirmation after Owner Switch

Applying Owner A's Import under Owner B.

## Notification Preserves Old Permission

Executing an action because the Notification was valid when created.

## AI Filters after Retrieval

Sending unauthorized data to the model before Owner filtering.

## Premium Bypasses Owner Scope

Using entitlement as cross-Owner permission.

## Job Permission Frozen Forever

Running a delayed job without checking Account, Owner or policy state.

## Provider Event Assigns Owner

Trusting an external callback to choose canonical ownership.

## Support Tool Uses Production Service Role Broadly

Allowing unrestricted database browsing.

## Grant Stored Only in UI

Failing to enforce temporary access server-side.

## Grant Automatically Renews

Extending privileged access without a new approval.

## Case Closure Leaves Access Active

Failing to revoke case-scoped permissions.

## Break Glass without Incident

Using emergency roles for debugging.

## Invitation Grants before Acceptance

Giving access when the invitation is merely sent.

## Share Changes ownerId

Transferring ownership through a Grant.

## Revocation Updates Database Only

Leaving caches, jobs and signed URLs active.

## Offline Permission Never Expires

Allowing stale Authorization indefinitely.

## Audit Payload Contains Resource Content

Copying Transactions into access logs.

## Fail Open during Policy Outage

Allowing protected access because policy evaluation failed.

---

# Part 2 Review Questions

## Request Context

```text
Which Session initiated the request?

Which Device applies?

Which Identity, Account and Owner were resolved?

Which Owner-context version is current?

Could the response return after an Owner switch?
```

---

## Command Pipeline

```text
Which permission does the command require?

Which resource is loaded?

Was it loaded under Owner scope?

Was Authorization checked before commit?

Does Retry preserve the original Actor and Owner?
```

---

## Query Pipeline

```text
Which trusted Owner predicate applies?

Which fields are projected?

Are counts and snippets Owner-scoped?

Is pagination bound to the Owner?

Can a stale cursor reveal another Owner?
```

---

## Supabase

```text
How does auth subject map to identityId?

How does identityId map to AccountId?

How does AccountId map to ownerId?

Does RLS validate current Owner?

Can service-role access escape its intended scope?
```

---

## RLS

```text
Does the table contain owner_id?

Are SELECT, INSERT, UPDATE and DELETE covered?

Can owner_id change?

Can a database function bypass the policy?

Do cross-Owner tests pass?
```

---

## API

```text
Is the route registered?

Does middleware authenticate?

Does the handler authorize the resource?

Are client role and Owner fields rejected?

Can batch operations mix Owners?
```

---

## Storage

```text
Who owns the object?

Who owns the parent resource?

How is upload authority scoped?

How long does download authority last?

What happens after deletion or revocation?
```

---

## Import

```text
Which Owner created the batch?

Can the batch Owner change?

Is confirmation reauthorized?

What happens after Owner switching?

What happens after Account restriction?
```

---

## Export

```text
Which Owner requested the Export?

Which fields and Date ranges are approved?

Does the background job reauthorize?

Does download require current Owner access?

What happens after deletion begins?
```

---

## Notification

```text
Who is the recipient Owner?

Which resource does the action target?

Does current Authorization still allow the action?

Could another active Owner open it?

Is stale content suppressed?
```

---

## Assistant

```text
Was current Owner resolved first?

Which fields are authorized for AI context?

How many records are allowed?

Was context cleared after Owner switching?

Are AI-generated actions reauthorized?
```

---

## Background Job

```text
Which service Actor executes it?

Which original Owner and purpose are preserved?

Has the job expired?

Did Account or policy state change?

Can Retry duplicate a protected mutation?
```

---

## Provider

```text
Was the provider event authenticated?

Is environment correct?

Which canonical resource is affected?

Which fields may the provider change?

Can the event assign another Owner?
```

---

## Support

```text
Which Support level applies?

Which case is active?

Which fields are necessary?

Is temporary access approved?

When does access expire?

Is every view audited?
```

---

## Break Glass

```text
Which Incident justifies access?

Which lower-privilege alternatives failed?

Who approved it?

Which Owner and resources are in scope?

When does the Grant expire?

Is post-use review mandatory?
```

---

## Sharing

```text
Is sharing activated?

Is the resource shareable?

Did the recipient authenticate and accept?

Which permission was granted?

Can access be revoked immediately?

Does ownerId remain unchanged?
```

---

## Offline

```text
Which cached permission applies?

When does it expire?

Is the operation Owner-bound?

Will synchronization reauthorize it?

What happens after remote revocation?
```

---

## Revocation

```text
Which Grant, Session, role or resource changed?

Which Authorization version changed?

Were caches invalidated?

Were jobs and realtime subscriptions stopped?

Can old download links still work?
```

---

## Failure

```text
Does the system fail closed?

Which bounded local reads may continue?

Is protected data hidden?

Does the failure create a new Owner or broad fallback?

Which Operations alert applies?
```

---

# Part 2 Acceptance Criteria

The practical Authorization architecture is accepted only when:

```text
□ Every protected implementation constructs a canonical Actor.

□ Actor context derives from trusted Session and canonical repositories.

□ Client-supplied roles are not trusted.

□ Client-supplied permission lists are not trusted.

□ Client-supplied Owner overrides are rejected.

□ Owner resolution occurs before financial-data loading.

□ Owner-resolution failure hides protected data.

□ Owner-resolution failure does not create another Owner.

□ Owner context has a version.

□ Asynchronous responses validate Owner-context version.

□ Owner A responses are discarded after switching to Owner B.

□ Every protected action creates an Authorization request.

□ Authorization decisions include state and reason.

□ Unknown decisions deny access.

□ Allow decisions may contain constraints.

□ Commands apply decision constraints.

□ Queries apply decision constraints.

□ Authorization-decision caching is bounded.

□ Decision-cache keys include Actor, Owner and policy versions.

□ High-risk decisions are not broadly cached.

□ Cache invalidation occurs after Sign-out.

□ Cache invalidation occurs after Owner switching.

□ Cache invalidation occurs after Session revocation.

□ Cache invalidation occurs after Device revocation.

□ Cache invalidation occurs after role changes.

□ Cache invalidation occurs after Grant revocation.

□ Cache invalidation occurs after Account lifecycle changes.

□ Protected commands declare permission, resource, action and purpose.

□ Protected commands use stable operation identities.

□ Protected commands resolve resources under Owner scope.

□ Protected commands cannot execute before an allow decision.

□ High-risk commands recheck critical policy inputs before commit.

□ Authorization is re-evaluated on Retry.

□ Retry preserves original Actor and Owner.

□ Retry after Owner switching cannot run under the new Owner.

□ Retry after permission revocation is denied.

□ Protected queries declare Owner predicates.

□ Owner predicates come from trusted Actor context.

□ Clients cannot remove Owner predicates.

□ Pagination cursors are Owner-bound.

□ Pagination cursors are query-bound.

□ Pagination cursors cannot cross Owners.

□ Sorting uses an approved allowlist.

□ Search filters Owner before ranking.

□ Search filters Owner before snippet generation.

□ Autocomplete is Owner-scoped.

□ Aggregates are Owner-scoped.

□ Empty and unauthorized collections do not reveal inaccessible records.

□ Field-level projections are explicit.

□ Sensitive fields are classified.

□ Owner-scoped repositories are the ordinary default.

□ Privileged repositories require case or purpose scope.

□ Unrestricted raw financial repositories are not exposed broadly.

□ Authentication-provider subject maps explicitly to canonical Identity.

□ Canonical Identity maps explicitly to Account.

□ Account maps explicitly to financial Owner.

□ Supabase Authentication subject is not assumed to be ownerId without documented authority.

□ Owner-resolution database helpers are Security-reviewed.

□ Security-definer functions use explicit search paths.

□ Security-definer functions have minimal grants.

□ Trusted Owner claims are issued only by trusted authority.

□ Owner claims are refreshed after lifecycle changes.

□ Critical commands consult canonical Account state where needed.

□ Owner-private tables include owner_id.

□ Owner-private tables use Row-Level Security where supported.

□ SELECT policies validate Owner.

□ INSERT policies validate or assign Owner.

□ UPDATE policies prevent ownership changes.

□ DELETE policies validate Owner.

□ Soft-deleted resources follow explicit lifecycle policies.

□ Child resources preserve Owner consistency.

□ Join tables validate active Grants.

□ Database views preserve Owner isolation.

□ Materialized views do not expose cross-Owner data.

□ Client-invoked database functions validate Actor and Owner.

□ Client-invoked functions do not trust arbitrary Owner parameters.

□ Security-definer RPCs are idempotent where required.

□ Service-role credentials never appear in browser code.

□ Service-role credentials never appear in Android code.

□ Service-role credentials never appear in public configuration.

□ Service-role use is purpose-specific.

□ Service-role queries still include explicit Owner scope.

□ Serverless functions resolve trusted Actors.

□ Serverless functions do not return broad service-role results.

□ RLS deployments include policy-version changes.

□ RLS deployments include cross-Owner tests.

□ RLS migrations backfill ownership safely.

□ Ambiguous rows do not become public.

□ Production checks detect RLS-disabled Owner tables.

□ Every Owner-private table passes the read and mutation matrix.

□ Storage objects have canonical Owner metadata.

□ Storage paths are not Authorization.

□ Upload operations are Owner-authorized.

□ Upload authority is short-lived.

□ Upload authority is path- and size-bounded.

□ Orphaned uploads are inaccessible.

□ Download operations reauthorize the current Actor.

□ Download operations validate the parent resource.

□ Signed URLs are short-lived.

□ Signed URLs are resource-specific.

□ Signed URLs exclude Authentication secrets.

□ Signed URLs exclude financial descriptions.

□ Signed URLs stop being issued after revocation.

□ Protected API routes have Registry records.

□ API middleware authenticates and resolves Actor context.

□ API handlers still perform resource-level Authorization.

□ Request bodies cannot elevate roles.

□ Request bodies cannot override permissions.

□ Request bodies cannot choose another Owner.

□ Resource-identifier validation remains separate from Authorization.

□ Batch requests authorize every resource.

□ Mixed-Owner batch operations are denied or separated safely.

□ Nested API expansions apply Authorization to every relation.

□ Realtime subscriptions are Owner-scoped server-side.

□ Realtime channel names do not grant access.

□ Realtime subscriptions stop after Owner switching.

□ Realtime subscriptions stop after Session revocation.

□ Stale realtime events are discarded.

□ Financial Accounts remain Owner-scoped.

□ Account create assigns Owner from trusted context.

□ Account update cannot change ownership.

□ Transaction create validates all related Owner resources.

□ Transaction update validates current Owner.

□ Transaction delete follows lifecycle and financial invariants.

□ Transfers validate both financial Accounts.

□ Internal Transfers cannot become cross-Owner transfers.

□ Goals remain Owner-scoped.

□ Premium Goal capabilities do not change ownership.

□ System categories and Owner categories remain distinct.

□ Owners cannot mutate protected system categories.

□ Report source data is Owner-authorized.

□ Report caches include ownerId.

□ Report downloads are reauthorized.

□ Attachments validate both file and parent resource.

□ Import batches bind to one Owner.

□ Import ownerId cannot change.

□ Import preview is Owner-scoped.

□ Import confirmation is reauthorized.

□ Import confirmation validates preview version.

□ Owner B cannot confirm Owner A Import.

□ Export creation requires current Owner authority.

□ Export jobs retain requesting Owner and scope.

□ Export services receive one bounded Owner scope.

□ Export jobs recheck Account deletion state.

□ Export downloads require current Authorization.

□ Export links do not bypass Sign-in by default.

□ Export behavior during deletion is explicit.

□ Notification lists are recipient-Owner-scoped.

□ Notification actions reauthorize target resources.

□ Old Notifications do not preserve revoked permission.

□ Owner B cannot open Owner A Notification target.

□ Assistant context requests identify current Owner.

□ Assistant retrieval filters Owner before model access.

□ Assistant context uses field minimization.

□ Assistant context uses record limits.

□ Assistant context is cleared after Owner switching.

□ AI-generated commands undergo ordinary Authorization.

□ Subscription state is Owner-private.

□ Support receives only limited subscription diagnostics by default.

□ Entitlements remain Owner-scoped.

□ Entitlements cannot grant cross-Owner access.

□ Session-management actions validate same Identity and Account.

□ Device-management actions validate current Owner authority.

□ Account deletion Authorization confirms the target Owner.

□ Account deletion requires recent reauthentication.

□ Subscription state cannot block Account deletion.

□ Every background job has a service Actor.

□ Every background job has an Owner where applicable.

□ Every background job has a purpose.

□ Every background job has an expiration.

□ Background jobs reauthorize before material execution.

□ Background jobs stop after relevant revocation.

□ Ordinary background jobs stop after Account deletion.

□ Job Retry preserves job, Owner and operation identities.

□ Scheduled jobs recheck current Account state.

□ Scheduled Premium actions recheck entitlement.

□ Provider callbacks use external Actor identities.

□ Provider callbacks validate Authentication or signatures.

□ Provider callbacks validate environment.

□ Provider callbacks prevent replay.

□ Provider callbacks validate allowed event types.

□ Provider callbacks apply only allowed fields.

□ Provider callbacks cannot assign arbitrary Owner IDs.

□ Unknown provider ownership does not create a new Owner.

□ Support uses separate privileged tooling.

□ Support Sessions require strong Authentication.

□ Support cases identify the target Owner.

□ Basic Support receives only safe metadata.

□ Diagnostic Support receives field-limited metadata.

□ Elevated Support requires a request.

□ Elevated Support requires a purpose.

□ Elevated Support requires approval.

□ Elevated Support has a short expiration.

□ Elevated Support uses visible privileged mode.

□ Elevated Support cannot view passwords.

□ Elevated Support cannot view Session tokens.

□ Elevated Support cannot view recovery tokens.

□ Elevated Support cannot change Account ownership.

□ Support case closure revokes active Grants.

□ Support access after deletion becomes restricted.

□ Privileged-access requests have canonical records.

□ Grant activation validates requester role.

□ Grant activation validates case or Incident state.

□ Grant use is checked on every protected action.

□ Grants enforce specific resource scope.

□ Grant expiration closes privileged views.

□ Grant expiration stops privileged jobs.

□ Grant revocation propagates.

□ Break-glass access requires a severe Incident.

□ Break-glass access requires strong Authentication.

□ Break-glass access requires narrow permissions.

□ Break-glass access has a short duration.

□ Break-glass access creates real-time alerts.

□ Break-glass access creates enhanced audit.

□ Break-glass access cannot renew silently.

□ Break-glass access cannot be used for convenience.

□ General financial sharing remains disabled by default.

□ Sharing activation requires Product and policy approval.

□ Share invitations do not grant immediate access.

□ Share invitations minimize preacceptance financial content.

□ Invitation acceptance requires recipient Authentication.

□ Invitation acceptance validates the intended Identity.

□ Share Grants preserve original ownerId.

□ Shared-resource queries use explicit active Grants.

□ Shared-resource mutations record the acting recipient.

□ Sharing revocation stops new access.

□ Sharing revocation stops downloads where possible.

□ Recipient deletion invalidates recipient Grants.

□ Owner deletion revokes all sharing.

□ Unauthenticated share links remain disabled by default.

□ Future share tokens use high entropy.

□ Share tokens are stored safely.

□ Share tokens expire.

□ Share tokens are revocable.

□ Share tokens are excluded from logs.

□ Share tokens are excluded from Analytics.

□ Share links expose only approved fields.

□ Share-link view does not imply download.

□ Offline Authorization records are Owner-scoped.

□ Offline Authorization records are Device-scoped.

□ Offline Authorization expires.

□ Offline create assigns the trusted local Owner.

□ Offline update validates local resource Owner.

□ Offline permanent purge is restricted.

□ Offline privileged access is prohibited by default.

□ Offline sharing creation is prohibited.

□ Synchronization refreshes the Session first.

□ Synchronization resolves current Owner again.

□ Synchronization re-evaluates permission.

□ Synchronization validates resource ownership.

□ Synchronization checks policy version.

□ Remotely revoked permission blocks synchronization.

□ Different-Owner Sign-in cannot inherit pending operations.

□ Account restriction is checked before synchronization.

□ Account deletion blocks ordinary synchronization.

□ Remote resource deletion enters conflict handling.

□ Revocation events are canonical records.

□ Revocation increments relevant Authorization versions.

□ Revocation invalidates decision caches.

□ Revocation stops realtime subscriptions.

□ Revocation stops background jobs.

□ Revocation closes privileged views.

□ Revocation stops new download issuance.

□ Role removal revokes dependent privileged access.

□ Policy deployment invalidates incompatible decisions.

□ Protected Authorization failures fail closed.

□ Safe degraded local access requires explicit offline policy.

□ Policy-repository failure blocks new privileged Grants.

□ Policy-repository failure blocks sharing creation.

□ Owner-resolver failure hides protected data.

□ Suspected broad RLS access is treated as Critical.

□ Storage-policy uncertainty denies file access.

□ Privileged-Grant service failure does not extend Grants.

□ Realtime Authorization failure disconnects the subscription.

□ Denial content avoids resource enumeration.

□ Denial content provides safe next actions.

□ Denial screens are accessible.

□ Resource content is not visible behind denial states.

□ Material Authorization decisions create audit evidence.

□ Audit records include Actor, action, purpose and decision.

□ Audit records use correlation identifiers.

□ Audit records exclude complete financial payloads.

□ Testing covers Actor resolution.

□ Testing covers every Owner-private resource type.

□ Testing uses at least two different Owners.

□ Testing covers client Owner injection.

□ Testing covers client role injection.

□ Testing covers RLS cross-Owner access.

□ Testing covers database-function bypass.

□ Testing covers storage-path guessing.

□ Testing covers signed-link expiration.

□ Testing covers realtime Owner switching.

□ Testing covers Import ownership.

□ Testing covers Export reauthorization.

□ Testing covers Notification Deep Links.

□ Testing covers Assistant context clearing.

□ Testing covers job expiration and Retry.

□ Testing covers provider scope.

□ Testing covers Support field projection.

□ Testing covers elevated-Grant expiration.

□ Testing covers break-glass denial and approval.

□ Testing covers future sharing revocation.

□ Testing covers offline permission revocation.

□ Testing covers Account deletion.

□ Security tests cover insecure direct object references.

□ Security tests cover mass assignment.

□ Security tests cover service-role exposure.

□ Security tests cover privilege escalation.

□ Privacy tests cover field minimization.

□ Accessibility tests cover denial and reauthentication.

□ Failure injection covers policy, Owner, RLS and storage failures.

□ Performance improvements preserve Owner filters.

□ Operational monitoring covers Owner mismatches.

□ Operational monitoring covers policy failures.

□ Operational monitoring covers privileged access.

□ Critical Authorization alerts are defined.

□ Authorization release gates block unsafe access.

□ Part 2 Authorization anti-patterns are prohibited.
```

---

# Part 2 Authorization Constitutional Rule

Every Nexio Application command, query, Supabase request, Row-Level Security policy, database function, API handler, realtime subscription, file operation, Import, Export, Notification action, Assistant retrieval, background job, provider callback, Support view, temporary Grant, emergency operation and future sharing flow must answer:

```text
Does this implementation construct one trusted Actor and Owner context, resolve the protected resource inside that Owner scope, enforce one explicit permission and purpose at the Application and trusted data boundaries, apply current Session, Device, Account, entitlement, policy and Grant state, return only approved fields, preserve the original Actor through Retry and offline synchronization, and stop every cache, job, download, realtime channel or privileged view immediately when access is revoked or ownership becomes uncertain?
```

When the answer is uncertain, prefer the action that:

- Denies the command.
- Denies the query.
- Hides the resource.
- Applies the trusted Owner predicate.
- Requires reauthentication.
- Discards the stale response.
- Stops synchronization.
- Stops the background job.
- Disconnects the realtime channel.
- Blocks the file upload.
- Blocks the file download.
- Expires the signed URL.
- Revokes the Access Grant.
- Closes the Support view.
- Disables break-glass access.
- Rejects the provider callback.
- Disables the sharing flow.
- Preserves the correct Owner partition.
- Escalates through Security, Privacy and Operations.
- Blocks the release.

Authorization is not complete because route middleware succeeded.

Authorization is not complete because Row-Level Security exists.

Authorization is not complete because the Application checked a role.

Authorization is not complete because a signed URL was generated.

Authorization is complete only when Actor, Owner, resource, action, purpose, permission, scope, Session, Device, Account lifecycle, entitlement, policy version and revocation state agree at every trusted boundary, and no Retry, offline operation, provider event, privileged tool, background job or shared link can exceed that decision.

---
---

# Authorization Governance Architecture

Authorization, Permissions, Sharing and Access Control are governed Product capabilities.

They must receive the same control applied to:

```text
Financial integrity

Identity

Owner isolation

Security

Privacy

Accessibility

Offline synchronization

Data portability

Account deletion

Production reliability
```

Governance covers the complete lifecycle:

```text
Actor definition

↓

Role proposal

↓

Permission definition

↓

Resource classification

↓

Policy design

↓

Security and Privacy review

↓

Implementation

↓

Database and storage enforcement

↓

Production activation

↓

Access review

↓

Audit

↓

Revocation

↓

Migration

↓

Deprecation and removal
```

A role is not valid merely because it exists in code.

A permission is not active merely because a button is visible.

A policy is not effective merely because an API middleware references it.

An Access Grant is not current merely because a record says `active`.

A privileged Actor is not authorized merely because an administrative Session exists.

An Authorization capability is governed only when Nexio can prove:

```text
Which Actor performed the action

Which Identity, Account, Owner, Session and Device supported the Actor

Which role and permission applied

Which resource and resource Owner were involved

Which purpose and scope were approved

Which policy version produced the decision

Which constraints and expiration applied

Which trusted boundaries enforced the decision

Which audit evidence exists

Which revocation path stops future access
```

---

# Authorization Governance Objectives

The governance model should ensure:

```text
Every Actor type has a stable identifier.

Every Role has a stable identifier.

Every Permission has a stable identifier.

Every protected Resource type is registered.

Every Policy has a stable identifier and version.

Every privileged Access Grant is explicit.

Every elevated access period expires.

Every sharing relationship is revocable.

Every service identity has a narrow purpose.

Every provider scope is bounded.

Every background job retains Actor, Owner and purpose.

Every Row-Level Security policy is tested.

Every storage policy is tested.

Every privileged view is audited.

Every revocation propagates.

Every stale Authorization decision becomes unusable.

Every retired Role, Permission, Policy, Grant type or sharing mechanism is removed from active use.
```

---

# Authorization Authority Hierarchy

When Authorization sources conflict, use the following authority order:

```text
Canonical Owner and Resource ownership records

↓

Security, Privacy, Accessibility and Compliance requirements

↓

Current Identity, Account and Owner lifecycle state

↓

Current Session, Device and Security version

↓

Explicit deny policies

↓

Current Policy and Permission Registry

↓

Current active Access Grants

↓

Current entitlement where capability-gating applies

↓

Trusted database and storage enforcement

↓

Cached Authorization decision

↓

Client UI state
```

A cached allow decision does not override:

```text
Session revoked

Device revoked

Account suspended

Account deletion started

Grant expired

Policy changed

Resource deleted

Owner changed
```

---

# Authorization Conflict Example

```text
Cached decision:
allow Export download

Current Export:
expired

Current Account:
deletion_pending

Current Session:
active
```

Effective result:

```text
Deny ordinary download according to current deletion and Export policy.
```

The earlier allow decision is stale.

---

# Authorization Governance Roles

Recommended roles:

```text
Authorization Product Owner

Authorization Domain Owner

Policy Platform Owner

Resource Registry Owner

Identity and Owner Integration Owner

Database Security Owner

Storage Security Owner

API Security Owner

Privileged Access Owner

Support Access Owner

Sharing Product Owner

Service Identity Owner

Provider Scope Owner

Security Reviewer

Privacy Reviewer

Accessibility Reviewer

Operations Owner

Audit Owner

Incident Owner
```

One person may hold multiple roles.

The responsibilities remain explicit.

---

# Authorization Product Owner

Responsible for:

- Product access behavior
- Denied-state experience
- Read-only behavior
- Reauthentication routing
- Future sharing experience
- Revocation experience
- User-facing access explanations

---

# Authorization Domain Owner

Responsible for:

- Actor model
- Role model
- Permission model
- Resource scope model
- Policy model
- Authorization decisions
- Access Grants
- Revocation
- Authorization invariants

---

# Policy Platform Owner

Responsible for:

- Policy evaluation service
- Policy versioning
- Decision constraints
- Decision caching
- Cache invalidation
- Policy deployment
- Policy rollback

---

# Resource Registry Owner

Responsible for:

- Resource-type classification
- Ownership fields
- Sensitivity
- Shareability
- Exportability
- Deletability
- Restorability
- Field-level policies

---

# Identity and Owner Integration Owner

Responsible for:

- Actor construction
- Owner resolution
- Session integration
- Device integration
- Security-version integration
- Owner-context versioning
- Owner-switch invalidation

---

# Database Security Owner

Responsible for:

- Row-Level Security
- Database functions
- Security-definer functions
- Service-role use
- Ownership constraints
- Policy migrations
- Cross-Owner database tests

---

# Storage Security Owner

Responsible for:

- Storage metadata
- Upload authority
- Download authority
- Signed URLs
- File deletion
- Revocation limitations
- Storage policies

---

# API Security Owner

Responsible for:

- Route Registry
- Middleware
- Resource-level checks
- Batch authorization
- Realtime authorization
- Field projection
- Error behavior

---

# Privileged Access Owner

Responsible for:

- Temporary elevated access
- Approval workflows
- Separation of duties
- Break-glass access
- Grant expiration
- Privileged Session behavior
- Post-use review

---

# Support Access Owner

Responsible for:

- Support access levels
- Support Access Matrix
- Case-scoped permissions
- Diagnostic projections
- Elevated Support access
- Agent training
- Case-closure revocation

---

# Sharing Product Owner

Responsible for future:

- Shareable resources
- Invitation lifecycle
- Recipient acceptance
- Permission levels
- Revocation
- Share-link policy
- Sharing Help content

General financial sharing remains disabled until approved.

---

# Service Identity Owner

Responsible for:

- System-service Actors
- Service credentials
- Purpose scopes
- Credential rotation
- Background-job authorization
- Service removal

---

# Provider Scope Owner

Responsible for:

- Provider Actor definitions
- Provider data categories
- Provider callback permissions
- Provider environment separation
- Provider revocation
- Provider exit plans

---

# Security Reviewer

Responsible for:

- Least privilege
- Cross-Owner prevention
- Privilege escalation
- Token and credential exposure
- Insecure direct object references
- Service-role risks
- Break-glass security
- Share-token security

---

# Privacy Reviewer

Responsible for:

- Purpose limitation
- Field minimization
- Support access
- Provider access
- Sharing disclosure
- Audit retention
- Account deletion
- User notice

---

# Accessibility Reviewer

Responsible for:

- Denied states
- Read-only states
- Reauthentication flows
- Sharing permissions
- Access-revocation content
- Privileged-tool accessibility
- Account-deletion access

---

# Operations Owner

Responsible for:

- Policy-service health
- RLS health
- Storage-policy health
- Decision-cache health
- Grant-expiration jobs
- Revocation propagation
- Monitoring
- Alerts
- Incident response

---

# Audit Owner

Responsible for:

- Audit scope
- Review schedule
- Finding severity
- Corrective actions
- Evidence
- Closure

---

# Incident Owner

Responsible for:

- Incident classification
- Containment
- Affected Owner analysis
- Access revocation
- Service and provider containment
- Communication
- Post-Incident review

---

# Authorization Responsibility Matrix

| Capability | Product | Domain | Security | Privacy | Database | Operations | Support |
|---|---|---|---|---|---|---|---|
| Owner access | Required | Required | Required | Required | Required | Required | As applicable |
| Roles and permissions | Required | Required | Required | Required | Required | Required | Required |
| Policy evaluation | Required | Required | Required | Required | Required | Required | As applicable |
| RLS | As applicable | Required | Required | Required | Required | Required | As applicable |
| Storage access | Required | Required | Required | Required | Required | Required | As applicable |
| Privileged access | Required | Required | Required | Required | Required | Required | Required |
| Support access | Required | Required | Required | Required | As applicable | Required | Required |
| Break glass | Required | Required | Required | Required | Required | Required | Required |
| Future sharing | Required | Required | Required | Required | Required | Required | Required |
| Account deletion | Required | Required | Required | Required | Required | Required | Required |

---

# Actor Governance

Every Actor type must exist in the Actor Registry.

---

# Actor Registry Record

Recommended fields:

```text
actorTypeId

actorType

description

identitySource

credentialSource

requiredContext

allowedRoles

defaultScopes

forbiddenScopes

AuthenticationStrength

maximumSessionDuration

auditRequirement

status

version

owner

introducedAt

lastReviewed

nextReview
```

---

# Actor Type Identifier

Recommended pattern:

```text
ACTOR-TYPE-<NUMBER>
```

---

# Actor Lifecycle

Recommended:

```text
proposed

reviewing

approved

active

limited

restricted

deprecated

disabled

removed

archived
```

---

# Actor Activation Criteria

Before activation:

```text
□ Actor purpose is defined.

□ Identity source is defined.

□ Credential model is defined.

□ Required Owner context is defined.

□ Allowed Roles are defined.

□ Forbidden scopes are defined.

□ Maximum Session duration is defined.

□ Audit requirements are defined.

□ Revocation path exists.

□ Security review passes.

□ Privacy review passes.

□ Operational monitoring exists.
```

---

# Owner Actor Governance

The ordinary Owner Actor should remain the most common Product Actor.

Its default scope is:

```text
self_owner
```

It must not receive:

- Support permissions
- Administrative permissions
- Provider permissions
- Migration permissions
- Cross-Owner permissions

---

# Service Actor Governance

Every service Actor should have:

```text
One service identity

One environment

One approved purpose

One permission set

One scope policy

One credential version

One accountable owner
```

---

# Background Job Actor Governance

A job Actor must remain traceable to:

```text
jobId

jobType

serviceActor

original Actor where applicable

ownerId where applicable

purpose

resource scope

expiration
```

---

# Provider Actor Governance

A provider Actor should have no implicit permissions.

Every provider operation should map to an explicit permission.

---

# Anonymous Actor Governance

Anonymous access should be limited to registered public resources and Authentication entry points.

---

# Actor State Review

Actor states should be reviewed after:

- Credential compromise
- Role removal
- Provider disablement
- Service retirement
- Incident
- Account deletion
- Environment migration

---

# Role Governance

Every Role must exist in the Role Registry.

---

# Role Registry Record

Recommended fields:

```text
roleId

name

description

actorTypes

permissionIds

scopePolicy

purpose

riskLevel

approvalRequirement

maximumDuration

requiresStrongAuthentication

requiresCase

requiresIncident

status

version

owner

introducedAt

lastReviewed

nextReview
```

---

# Role Identifier

Recommended pattern:

```text
ROLE-<DOMAIN>-<NUMBER>
```

Examples:

```text
ROLE-OWNER-001

ROLE-SUPPORT-001

ROLE-SECURITY-001
```

---

# Role Lifecycle

Recommended:

```text
draft

reviewing

approved

active

limited

deprecated

disabled

removed

archived
```

---

# Role Design Principles

A Role should:

- Represent one operational responsibility.
- Contain the minimum Permissions required.
- Avoid unrelated Domain access.
- Avoid permanent elevation where temporary access is sufficient.
- Have a named owner.
- Have a review date.
- Be versioned.
- Be removable.

---

# Role Activation Criteria

```text
□ Business and Product purpose is defined.

□ Eligible Actor types are defined.

□ Permission set is explicit.

□ Scope policy is explicit.

□ Risk level is assigned.

□ Approval requirement is defined.

□ Maximum duration is defined where temporary.

□ Authentication strength is defined.

□ Audit policy is defined.

□ Separation-of-duties impact is reviewed.

□ Security and Privacy review passes.

```

---

# Broad Role Detection

Roles should be flagged when they:

- Contain unrelated resource types
- Include all actions on many resources
- Lack scope constraints
- Have no expiration
- Bypass RLS
- Permit unrestricted Export
- Permit ownership changes

---

# Administrative Role Governance

Avoid a universal Role such as:

```text
super_admin
```

When an exceptional broad operational Role exists, it must:

- Be unavailable for ordinary use
- Require strong Authentication
- Require Incident or approved operation
- Be short-lived
- Be audited
- Be reviewed after every use

---

# Role Assignment Governance

Role assignments should be canonical records.

Recommended fields:

```text
roleAssignmentId

actorId

roleId

scope

purpose

state

startsAt

expiresAt

assignedBy

approvedBy

caseId

incidentId

createdAt

revokedAt
```

---

# Role Assignment States

Recommended:

```text
pending

approved

active

expired

revoked

cancelled

denied

superseded
```

---

# Permanent Role Assignment Review

Long-lived internal Roles require periodic certification.

They must not remain active solely because no one requested removal.

---

# Role Assignment Revocation

Revocation should:

- Invalidate active privileged Sessions where required
- Invalidate dependent Access Grants
- Stop privileged jobs
- Close administrative tools
- Create audit evidence

---

# Permission Governance

Every Permission must exist in the Permission Registry.

---

# Permission Registry Record

Recommended fields:

```text
permissionId

resourceType

action

description

purposeCategories

allowedActorTypes

allowedRoles

scopeTypes

riskLevel

requiresRecentAuthentication

requiresStrongAuthentication

requiresAdditionalApproval

audited

status

version

owner

introducedAt

lastReviewed
```

---

# Permission Lifecycle

Recommended:

```text
draft

reviewing

approved

active

limited

deprecated

disabled

removed
```

---

# Permission Granularity

Permissions should be granular enough to distinguish:

```text
read

list

create

update

delete

restore

download

export

share

approve

revoke

administer
```

Avoid combining unrelated actions such as:

```text
manage_everything
```

---

# Permission Approval Criteria

```text
□ Resource type exists.

□ Action is explicit.

□ Purpose is defined.

□ Eligible Actor types are defined.

□ Allowed Roles are defined.

□ Scope types are defined.

□ Risk level is assigned.

□ Reauthentication requirement is defined.

□ Approval requirement is defined.

□ Audit requirement is defined.

□ Field constraints are defined where needed.

□ Revocation behavior is defined.
```

---

# Permission Deprecation

A deprecated Permission should:

- Stop new Role inclusion.
- Identify replacement Permissions.
- Identify affected Roles and Grants.
- Define migration.
- Define removal deadline.

---

# Resource Registry Governance

Every protected Resource type must exist in the Resource Registry.

---

# Resource Registry Record

Recommended fields:

```text
resourceType

description

ownershipField

AccountField

identityField

sensitivity

resourceStates

defaultActions

shareable

exportable

downloadable

deletable

restorable

fieldPolicies

parentResourceRules

childResourceRules

authorizationVersionField

status

version

owner

lastReviewed
```

---

# Resource Classification Review

Review when:

- New fields are added
- New attachments are added
- Sharing becomes possible
- Export scope changes
- Provider access changes
- AI context use changes
- Retention changes

---

# Ownership Field Requirement

An Owner-private resource should identify:

```text
ownerId
```

directly or through one reliable and enforceable relationship.

Direct Owner metadata is preferred when it improves enforcement and auditability.

---

# Resource Sensitivity Review

Potential changes:

```text
internal → owner_private

owner_private → restricted

restricted → highly_restricted
```

A lower classification requires explicit review.

---

# Field Policy Registry

Sensitive Resource fields should have policy records.

Recommended fields:

```text
resourceType

fieldName

sensitivity

allowedPermissions

maskingPolicy

ExportPolicy

SupportPolicy

ProviderPolicy

AssistantPolicy

auditPolicy

owner
```

---

# Parent and Child Resource Governance

A child Resource must not become less protected than its parent accidentally.

Examples:

```text
Transaction attachment

Report file

Export file

Import source file

Support evidence
```

---

# Policy Governance

Every active Policy must exist in the Policy Registry.

---

# Policy Registry Record

Recommended fields:

```text
policyId

name

description

actorTypes

resourceTypes

actions

conditions

effect

priority

compositionRule

constraintOutput

failureBehavior

status

version

owner

introducedAt

lastReviewed

nextReview
```

---

# Policy Identifier

Recommended pattern:

```text
POLICY-<DOMAIN>-<NUMBER>
```

---

# Policy Lifecycle

Recommended:

```text
draft

simulation

reviewing

approved

limited

active

paused

deprecated

disabled

removed

archived
```

---

# `simulation`

The Policy is evaluated against historical or synthetic requests without controlling Production access.

---

# Policy Approval Criteria

```text
□ Actor types are explicit.

□ Resources are explicit.

□ Actions are explicit.

□ Conditions are deterministic.

□ Effect is explicit.

□ Priority is explicit.

□ Composition behavior is explicit.

□ Failure behavior is fail-closed where required.

□ Constraints are defined.

□ Owner isolation is tested.

□ Privacy impact is reviewed.

□ Accessibility impact is reviewed.

□ Observability exists.

□ Rollback exists.
```

---

# Policy Versioning

Increment the Policy version when:

- Conditions change
- Effect changes
- Priority changes
- Constraints change
- Actor eligibility changes
- Resource scope changes
- Failure behavior changes

---

# Policy Deployment Flow

Recommended:

```text
Draft Policy

↓

Static validation

↓

Synthetic tests

↓

Cross-Owner tests

↓

Simulation

↓

Security and Privacy approval

↓

Limited deployment

↓

Observe decisions and guardrails

↓

Activate

↓

Review
```

---

# Policy Simulation

Simulation should compare:

```text
Current decision

Proposed decision

Actor type

Resource type

Owner relationship

Reason code

Potential access expansion

Potential access loss
```

Production Resource payloads should be minimized.

---

# Policy Expansion Review

Any Policy that increases access must identify:

- Newly eligible Actors
- Newly accessible Resources
- Newly allowed fields
- New purposes
- New duration
- New provider or service scope
- New Privacy impact

---

# Policy Reduction Review

Any Policy that removes access must identify:

- Affected Owners
- Affected operators
- Affected jobs
- Pending operations
- Support impact
- Recovery path
- Data-preservation behavior

---

# Explicit Deny Governance

Explicit deny Policies should be centrally visible.

Examples:

```text
Deny cross-Owner access

Deny deleted Account access

Deny revoked Device access

Deny expired Grant access

Deny test Actor in Production

Deny provider financial-data access
```

---

# Policy Composition Governance

The Registry should define composition such as:

```text
Explicit deny precedence

Required conditions combined with logical AND

Independent Grants combined through approved union rules

Field constraints combined through most restrictive result
```

---

# Most Restrictive Constraint

When two allow paths produce constraints:

```text
Allowed fields:
Intersection

Maximum rows:
Lowest maximum

Expiration:
Earliest expiration

Read-only:
True when either requires read-only
```

unless a documented composition rule states otherwise.

---

# Policy Failure Governance

Malformed, unavailable or conflicting Policy state should not produce broad access.

Default:

```text
deny

or

temporarily_unavailable
```

---

# Authorization Decision Governance

Authorization decisions should be traceable but minimally retained.

---

# Decision Record

Recommended fields:

```text
authorizationDecisionId

authorizationRequestId

actorId

ownerId

resourceType

resourceId

action

purpose

decision

reasonCode

policyIds

policyVersion

constraintsSummary

decidedAt

expiresAt
```

---

# Decision Retention

Not every ordinary read decision requires long-term individual retention.

Retention may depend on:

- Risk
- Resource sensitivity
- Privileged access
- Mutation
- Export or download
- Support access
- Incident
- Compliance need

---

# High-Risk Decision Audit

Always audit:

```text
Account deletion

Export download

Role assignment

Grant approval

Grant revocation

Support elevated access

Break-glass access

Provider scope override

Sharing creation

Sharing revocation

Security repair
```

---

# Access Grant Governance

Every temporary or delegated Grant should use the Access Grant Registry.

---

# Access Grant Registry Record

Recommended fields:

```text
grantTypeId

name

eligibleGrantors

eligibleGrantees

allowedPermissions

allowedScopeTypes

maximumDuration

requiresApproval

requiresCase

requiresIncident

userNoticePolicy

auditPolicy

revocationPolicy

status

version

owner
```

---

# Grant Types

Potential:

```text
Support_diagnostic

Support_elevated

Security_incident

Privacy_deletion

migration

temporary_service

future_share
```

---

# Grant Approval Criteria

```text
□ Grantee is active.

□ Grantor is authorized.

□ Purpose is explicit.

□ Resource scope is narrow.

□ Permission set is narrow.

□ Duration is within maximum.

□ Required case or Incident exists.

□ Required approval exists.

□ Lower-access alternatives were considered.

□ User notice policy is applied.

□ Audit is available.
```

---

# Grant Renewal

Grants should not renew automatically.

A continued need requires a new or explicitly reviewed extension.

---

# Grant Extension

An extension should create:

- New approval
- New expiration
- Updated purpose
- Audit record

---

# Grant Expiration Governance

Expiration should be enforced by:

- Policy evaluation
- Privileged UI
- Background-job control
- Download issuance
- Realtime access
- Decision-cache invalidation

---

# Grant Revocation Governance

Revocation should be available to:

- Authorized grantor
- Security
- Privacy
- Incident coordinator
- Automated expiration process

---

# Privileged Access Governance

Privileged access is any access beyond ordinary self-Owner use.

---

# Privileged Access Categories

Recommended:

```text
Support

Security

Privacy

Operations

Migration

Deletion

Provider repair

Break glass
```

---

# Privileged Access Principles

Every privileged operation should be:

- Individually attributable
- Strongly authenticated
- Purpose-bound
- Scope-bound
- Time-bounded
- Audited
- Revocable
- Reviewable

---

# Privileged Session Policy

A privileged Session should have:

```text
Shorter expiration

Stronger Authentication

Visible elevated state

No background persistence beyond policy

No silent renewal

Restricted download behavior

Enhanced audit
```

---

# Privileged Access Reauthentication

Recent strong Authentication should be required before:

- Activating elevated Support mode
- Approving Grants
- Using break glass
- Viewing highly restricted metadata
- Running ownership repairs
- Changing Authorization policy

---

# Privileged Access Field Minimization

An operator should see only the approved fields.

A broad Resource permission should not expose every field automatically.

---

# Privileged Download Governance

Downloading Owner-private data through privileged access should be prohibited by default.

Exceptions require:

- Explicit Permission
- Case or Incident
- Approval
- Expiration
- Secure storage
- Deletion deadline
- Audit

---

# Privileged Copy Governance

Copying sensitive fields from administrative tools should be limited where technically and operationally appropriate.

This does not replace operator training and audit.

---

# Separation of Duties Governance

High-risk capabilities may separate:

```text
Policy author

Policy approver

Policy deployer

Grant requester

Grant approver

Grant user

Audit reviewer
```

---

# Conflicting Duties

A person should not approve their own high-risk privileged request where separation is feasible.

---

# Break-Glass Governance

Break glass is a distinct emergency capability.

---

# Break-Glass Policy Record

Recommended fields:

```text
breakGlassPolicyId

eligibleRoles

eligibleIncidentSeverities

allowedPermissions

forbiddenPermissions

maximumDuration

approvalModel

auditRequirement

realTimeAlerting

postUseReviewDeadline

status

version

owner
```

---

# Break-Glass Forbidden Permissions

Potential default prohibitions:

```text
Read passwords

Read Session tokens

Read recovery tokens

Change financial Owner

Merge Accounts

Disable Account deletion rights

Create permanent Roles

Create unrestricted share links

Export all Production data
```

---

# Break-Glass Use Review

Every use should be reviewed for:

- Necessity
- Scope
- Duration
- Resources viewed
- Actions taken
- Downloads
- Result
- Alternatives
- Corrective action

---

# Support Access Governance

Support access must follow the Support Access Matrix.

---

# Support Access Review

Review:

```text
Role

Case

Purpose

Fields viewed

Actions executed

Grant duration

Downloads

User notice

Case closure

Revocation
```

---

# Support Diagnostic Projection Governance

Diagnostic projections should be predefined.

Agents should not construct arbitrary database queries.

---

# Support Elevated Access Governance

Elevated Support access should be exceptional.

Potential purposes:

- Reconcile failed Import state
- Diagnose Export generation failure
- Review synchronization metadata
- Review billing verification state
- Review Session state category

It should not automatically include:

- Exact Transaction data
- Full Export contents
- Full attachment contents
- Recovery evidence
- Authentication secrets

---

# Support Case Closure Certification

Closing a case should certify:

```text
Temporary Grants revoked

Privileged views closed

Temporary files deleted

Background diagnostic jobs stopped

User communication completed where required

Audit complete
```

---

# Sharing Governance

General sharing remains disabled until a formal Product decision activates it.

---

# Sharing Capability Registry

Recommended fields:

```text
sharingCapabilityId

resourceType

allowedPermissionSets

recipientTypes

invitationRequired

AuthenticationRequired

maximumDuration

ExportAllowed

resharingAllowed

notificationPolicy

revocationPolicy

AccountDeletionPolicy

status

version

owner
```

---

# Sharing Activation Criteria

```text
□ Resource is classified shareable.

□ Owner sharing Permission exists.

□ Recipient acceptance exists.

□ Recipient identity binding exists.

□ Grant lifecycle exists.

□ Revocation exists.

□ Account deletion behavior exists.

□ Resource deletion behavior exists.

□ Notification content is Privacy-safe.

□ Support guidance exists.

□ Accessibility review passes.

□ Security and Privacy review passes.

□ Audit and monitoring exist.
```

---

# Sharing Permission Review

Avoid broad permission names.

Prefer explicit:

```text
view_Report

view_Goal

comment_on_Goal

edit_specific_fields
```

---

# Resharing Governance

Default:

```text
Recipients cannot reshare.
```

Any resharing capability requires separate approval.

---

# Sharing Expiration

Shared access should have an explicit expiration where practical.

Long-lived sharing requires periodic certification.

---

# Share-Link Governance

Unauthenticated Share Links remain prohibited by default.

Any approved implementation requires its own Risk Review.

---

# Share-Link Risk Review

Evaluate:

- Token exposure
- Browser history
- Referrer leakage
- Forwarding
- Search indexing
- Screenshots
- Download persistence
- Account deletion
- Resource deletion
- Revocation limitations

---

# Service Identity Governance

Every system service must exist in the Service Identity Registry.

---

# Service Identity Registry Record

Recommended fields:

```text
serviceId

name

purpose

environment

credentialType

credentialVersion

permissionIds

scopePolicy

dataCategories

maximumJobDuration

rotationPolicy

revocationPolicy

monitoring

status

owner

lastReviewed
```

---

# Service Credential Principles

Service credentials should be:

- Environment-specific
- Least-privileged
- Rotated
- Protected
- Revocable
- Excluded from clients
- Excluded from logs
- Excluded from AI prompts

---

# Service Identity Certification

Review periodically:

```text
Service still exists

Purpose still exists

Permissions remain necessary

Scope remains narrow

Credentials are current

Monitoring works

Owner remains accountable
```

---

# Background Job Governance

Every job type should exist in a Job Authorization Registry.

---

# Job Authorization Registry Record

Recommended fields:

```text
jobType

serviceId

allowedPermissions

requiredOwnerContext

allowedResourceTypes

purpose

maximumDuration

RetryPolicy

reauthorizationPolicy

AccountDeletionPolicy

auditPolicy

status

version

owner
```

---

# Job Type Activation Criteria

```text
□ Service Actor exists.

□ Purpose is explicit.

□ Owner behavior is explicit.

□ Resource scope is explicit.

□ Expiration is defined.

□ Retry preserves operation identity.

□ Reauthorization is defined.

□ Account deletion behavior is defined.

□ Monitoring exists.
```

---

# Provider Scope Governance

Every provider must have an explicit Authorization Scope Registry record.

---

# Provider Scope Registry Record

Recommended fields:

```text
providerId

providerType

environment

allowedEventTypes

allowedResourceTypes

allowedFields

allowedActions

forbiddenDataCategories

ownerResolutionMethod

credentialModel

revocationPolicy

monitoring

status

version

owner
```

---

# Provider Scope Principles

Providers should receive:

```text
Only necessary fields

Only necessary events

Only necessary environments

Only necessary time
```

---

# Provider Scope Review

Review after:

- SDK upgrade
- API change
- New Product capability
- New provider event
- New data field
- Privacy policy change
- Account deletion change

---

# Authorization Review Architecture

Authorization requires periodic access reviews.

---

# Review Types

Recommended:

```text
Actor review

Role review

Role-assignment review

Permission review

Resource classification review

Policy review

RLS review

Storage policy review

Service identity review

Provider scope review

Support access review

Privileged Grant review

Break-glass review

Sharing review

Deleted-access review
```

---

# Actor Review

Verify:

- Actor type still needed
- Identity source still valid
- Credential model current
- Allowed Roles current
- Revocation path works

---

# Role Review

Verify:

```text
Role purpose still exists.

Permission set remains minimal.

Scope remains correct.

Risk level remains accurate.

Assignments remain necessary.

Deprecated Permissions are removed.
```

---

# Role-Assignment Review

For every long-lived assignment:

```text
Is the Actor still active?

Is the Role still required?

Is the scope still appropriate?

Is the expiration correct?

Does the assignment conflict with separation of duties?
```

---

# Permission Review

Verify:

- Resource type still exists
- Action is still needed
- Eligible Actors remain correct
- Scope remains narrow
- Reauthentication requirement is correct
- Audit requirement is correct

---

# Resource Classification Review

Verify:

```text
Ownership field

Sensitivity

Field policies

Provider access

Support access

Assistant access

Export behavior

Sharing behavior

Deletion behavior
```

---

# Policy Review

Verify:

- Conditions match Product behavior
- Explicit deny rules remain current
- Policy priority is correct
- Constraints remain applied
- Simulation matches Production
- Failure behavior remains safe

---

# RLS Review

Verify:

```text
Owner-private tables have RLS.

Policies cover all actions.

Owner changes are blocked.

Functions do not bypass scope.

Service-role use is documented.

Cross-Owner tests pass.
```

---

# Storage Policy Review

Verify:

- Upload authority
- Download authority
- Metadata
- Parent relationship
- Expiration
- Revocation
- Orphan cleanup

---

# Privileged Access Review

Verify:

```text
Grants were necessary.

Scopes were narrow.

Durations were appropriate.

Downloads were justified.

Case or Incident existed.

Revocation completed.

Post-use review exists.
```

---

# Review Cadence

Recommended:

```text
Continuous Critical guardrail monitoring

Weekly privileged-Grant expiration review

Weekly Support elevated-access review

Monthly service identity review

Monthly provider scope review

Release-cycle Policy and RLS review

Quarterly Role and Role-assignment certification

Quarterly Resource and field classification review

Quarterly Privacy and Accessibility review

Annual break-glass design review

Incident-driven review
```

---

# Access Certification

Long-lived Role assignments and service scopes should require certification.

---

# Certification States

Recommended:

```text
pending

certified

change_required

revoked

expired

overdue
```

---

# Overdue Certification

An overdue high-risk assignment should:

- Trigger alert
- Restrict new privileged access where appropriate
- Require owner review
- Be revoked when policy requires

---

# Authorization Migration Architecture

Authorization migrations may affect:

```text
Actor types

Roles

Role assignments

Permissions

Resource ownership

Resource classification

Policies

RLS

Storage policies

Service identities

Provider scopes

Access Grants

Sharing records

Authorization versions
```

---

# Migration Principles

Every migration must:

- Preserve correct Owner relationships.
- Avoid broad temporary access.
- Deny ambiguous ownership.
- Be idempotent.
- Be auditable.
- Support rollback or forward correction.
- Preserve Account deletion state.
- Preserve Grant expiration and revocation.
- Preserve service and provider environment separation.

---

# Migration Types

Recommended:

```text
Actor migration

Role migration

Permission migration

Policy migration

Ownership backfill

RLS migration

Storage-policy migration

Service-identity migration

Provider-scope migration

Grant migration

Sharing migration

Authorization-version migration
```

---

# Role Migration

When splitting a broad Role:

```text
Inventory active assignments

↓

Map required responsibilities

↓

Create narrow Roles

↓

Assign replacements

↓

Verify permissions

↓

Revoke broad Role

↓

Invalidate privileged Sessions

↓

Audit
```

---

# Permission Migration

When replacing a Permission:

- Map every Role
- Map every Grant type
- Map every API route
- Map every command and query
- Map every database policy
- Map every test
- Remove the old Permission after verification

---

# Policy Migration

Recommended:

```text
Create new version

↓

Run static validation

↓

Run synthetic tests

↓

Run cross-Owner tests

↓

Simulate

↓

Deploy limited

↓

Monitor differences

↓

Activate

↓

Retire old version
```

---

# Ownership Backfill Migration

When legacy rows lack `ownerId`:

```text
Identify authoritative relationship.

↓

Classify unambiguous rows.

↓

Backfill Owner.

↓

Classify ambiguous rows as review-required.

↓

Add constraints.

↓

Enable policies.

↓

Verify counts and relationships.
```

---

# Ambiguous Ownership Migration

Ambiguous rows must not be assigned through:

- Display name
- Similar email
- Last active user
- Current operator
- AI inference

They require authoritative evidence or remain inaccessible.

---

# RLS Migration

Recommended:

```text
Inventory table and access paths

↓

Backfill owner_id

↓

Add Owner constraints

↓

Create policies

↓

Test ordinary Owner access

↓

Test cross-Owner denial

↓

Test service access

↓

Enable RLS

↓

Monitor

↓

Remove obsolete bypass paths
```

---

# Storage Policy Migration

Review:

- Existing paths
- Missing metadata
- Owner association
- Active signed URLs
- Orphan files
- Parent resources
- Account deletion state

---

# Service Identity Migration

When rotating or replacing a service identity:

```text
Create new service identity.

↓

Assign narrow permissions.

↓

Deploy dual-read or controlled overlap where required.

↓

Verify new credential.

↓

Move jobs.

↓

Revoke old credential.

↓

Remove old Role assignments.

↓

Audit.
```

---

# Provider Scope Migration

A provider scope expansion requires full Privacy and Security review.

A scope reduction should:

- Remove fields
- Remove events
- Remove credentials where possible
- Update provider configuration
- Update monitoring
- Verify Account deletion

---

# Access Grant Migration

Active Grants should preserve:

```text
Grantee

Target Owner

Resource scope

Permissions

Purpose

Original expiration

Revocation state
```

A migration must not extend expiration silently.

---

# Sharing Migration

Future sharing migrations must preserve:

- Original Owner
- Recipient Identity
- Permission set
- Resource scope
- Expiration
- Revocation
- Acceptance evidence

---

# Authorization-Version Migration

A version migration may force:

- Session refresh
- Policy re-evaluation
- Decision-cache invalidation
- Job reauthorization
- Realtime resubscription
- Privileged-view closure

---

# Migration Record

Recommended fields:

```text
migrationId

migrationType

fromVersion

toVersion

actorCount

roleCount

assignmentCount

permissionCount

policyCount

resourceCount

grantCount

serviceCount

providerCount

ambiguousOwnershipCount

crossOwnerFindingCount

startedAt

completedAt

state

verification

owner
```

---

# Migration States

Recommended:

```text
planned

ready

running

paused

partially_completed

completed

failed_retryable

failed_final

rolled_forward

rolled_back
```

---

# Migration Verification

Verify:

```text
Every Owner-private row has valid Owner scope.

No resource changed Owner unexpectedly.

No deleted Owner regained access.

No expired Grant became active.

No revoked Grant became active.

No Role gained unintended Permissions.

No service gained broader scope.

No provider gained broader scope.

Cross-Owner access count remains zero.
```

---

# Authorization Deprecation

A Role, Permission, Policy or Actor type may be deprecated because:

- Product capability removed
- Scope too broad
- Provider removed
- Better least-privilege model exists
- Security weakness
- Privacy concern
- Unsupported implementation

---

# Deprecation Record

Recommended fields:

```text
deprecationId

targetType

targetId

reason

affectedActors

affectedRoles

affectedRoutes

affectedJobs

replacement

migrationDeadline

disablementDate

removalDate

owner
```

---

# Removal Criteria

Before removal:

```text
□ New assignments are blocked.

□ New Grants are blocked.

□ Active assignments are migrated or revoked.

□ API routes are updated.

□ Commands and queries are updated.

□ RLS policies are updated.

□ Storage policies are updated.

□ Jobs are updated.

□ Providers are updated.

□ Support is updated.

□ Monitoring is updated.

□ Historical audit remains.
```

---

# Authorization Audit Architecture

Audits should evaluate:

```text
Actor integrity

Role design

Permission design

Resource ownership

Policy correctness

Command and query enforcement

Database RLS

Storage access

API access

Realtime access

Background jobs

Provider scope

Support access

Privileged Grants

Break glass

Sharing

Revocation

Account deletion

AI boundaries
```

---

# Audit Types

Recommended:

```text
Actor audit

Role audit

Role-assignment audit

Permission audit

Resource audit

Policy audit

Decision-cache audit

Command audit

Query audit

RLS audit

Database-function audit

Storage audit

API audit

Realtime audit

Job audit

Provider audit

Support audit

Privileged-access audit

Break-glass audit

Sharing audit

Revocation audit

Account-deletion audit

AI access audit

Operational audit

Incident audit
```

---

# Actor Audit

Verify:

- Actor exists
- Identity source valid
- Credential current
- State current
- Roles valid
- Environment correct
- Owner context correct

---

# Role Audit

Verify:

```text
Purpose

Permissions

Scope

Risk level

Assignments

Expiration

Review date

Separation of duties

Deprecated permissions
```

---

# Permission Audit

Verify:

- Action specificity
- Resource type
- Eligible Roles
- Conditions
- Scope
- Reauthentication
- Audit requirement
- Revocation behavior

---

# Resource Audit

Verify:

```text
Owner metadata

Sensitivity

Field policies

Parent and child relationships

Export behavior

Sharing behavior

Deletion behavior

Authorization version
```

---

# Policy Audit

Verify:

- Current version
- Conditions
- Explicit denies
- Priority
- Constraint composition
- Failure mode
- Simulation results
- Production behavior

---

# Decision-Cache Audit

Verify:

```text
Cache key completeness

Expiration

Invalidation triggers

Owner switch handling

Session revocation handling

Policy change handling

Grant revocation handling
```

---

# Command Audit

Verify:

- Permission declaration
- Trusted Actor
- Owner-scoped load
- Authorization before execution
- Recheck before commit where required
- Retry behavior
- Audit evidence

---

# Query Audit

Verify:

```text
Owner predicate

Field projection

Count isolation

Search isolation

Pagination isolation

Aggregate isolation

Deleted-state handling
```

---

# RLS Audit

Verify:

- RLS enabled
- Policies complete
- Owner changes blocked
- Anonymous denied
- Service-role use
- Function behavior
- Cross-Owner tests
- Production verification

---

# Storage Audit

Verify:

```text
Object metadata

Owner relationship

Upload authority

Download authority

Signed URL expiration

Revocation behavior

Orphan cleanup

Deletion
```

---

# API Audit

Verify:

- Route Registry
- Authentication
- Actor resolution
- Resource-level Authorization
- Client-claim rejection
- Batch behavior
- Nested expansion
- Error equivalence

---

# Realtime Audit

Verify:

```text
Owner-scoped channels

Server-side filtering

Reconnect reauthorization

Owner-switch cleanup

Revocation handling

Stale event rejection
```

---

# Background Job Audit

Verify:

- Service Actor
- Original Owner
- Purpose
- Resource scope
- Expiration
- Retry
- Reauthorization
- Account deletion behavior

---

# Provider Audit

Verify:

```text
Provider Actor

Environment

Allowed event types

Allowed fields

Owner resolution

Replay protection

Forbidden data categories

Revocation
```

---

# Support Audit

Verify:

- Support role
- Case
- Projection
- Grant
- Duration
- Actions
- Downloads
- Case closure
- Revocation

---

# Break-Glass Audit

Verify:

```text
Incident

Approval

Scope

Duration

Actions

Downloads

Real-time alert

Post-use review
```

---

# Sharing Audit

When sharing is active, verify:

- Resource shareability
- Invitation
- Recipient Identity
- Acceptance
- Permissions
- Expiration
- Revocation
- Owner preservation

---

# Revocation Audit

Verify:

```text
Canonical revocation

Authorization-version change

Cache invalidation

Session impact

Job impact

Realtime impact

Download impact

Privileged-view closure
```

---

# Account-Deletion Audit

Verify:

- Ordinary access stopped
- Shared Grants revoked
- Support access reduced
- Jobs stopped
- Deletion coordinator limited
- Providers minimized
- Files handled
- Offline access blocked after reconnect

---

# AI Access Audit

Verify:

```text
Owner filtering before retrieval

Field minimization

Purpose

Record limits

Conversation ownership

Owner-switch clearing

AI output reauthorization
```

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

# Critical Finding Examples

```text
Cross-Owner financial access

Broad RLS allow

Service-role credential in client

Unauthorized Export download

Unauthorized attachment access

Support unrestricted financial access

Break-glass without audit

Revoked Grant accepted

Deleted Owner ordinary access

Provider out-of-scope financial access

AI receives another Owner's context
```

---

# High Finding Examples

```text
Client-supplied ownerId accepted

Role escalation possible

Signed URL excessively long-lived

Background job lacks Owner scope

Support Grant lacks expiration

Policy outage fails open

Owner-switch cache not invalidated

Share token appears in logs
```

---

# Moderate Finding Examples

```text
Review overdue

Role description outdated

Noncritical diagnostic projection too broad

Missing optional metric

Stale Support documentation
```

---

# Low Finding Examples

```text
Minor naming inconsistency

Nonmaterial metadata omission

Small visual issue in denied state
```

---

# Audit Corrective Action

Every Critical or High finding requires:

```text
Immediate containment

Named owner

Affected Actor analysis

Affected Owner analysis

Affected Resource analysis

Role and Permission analysis

Policy analysis

Service and provider analysis

Correction

Verification

Communication decision

Deadline or release condition

Evidence

Closure approval
```

---

# Immediate Audit Containment Options

Potential:

```text
Disable API route

Disable command or query

Disable RLS bypass path

Revoke service credential

Revoke Role assignment

Revoke Access Grant

Disable Support elevated mode

Disable break glass

Disable provider callback

Disable sharing

Stop background jobs

Stop realtime subscriptions

Block file downloads

Require global reauthentication

Block release
```

---

# Authorization Observability Architecture

Observability should answer:

```text
Which Authorization decisions are denied?

Which Owner mismatches occur?

Which Policies are unavailable?

Which RLS policies are failing?

Which storage requests are denied?

Which service identities are active?

Which provider scopes are rejected?

Which Grants are active or overdue?

Which privileged views are open?

Which break-glass sessions are active?

Which revocations are incomplete?

Which deleted Owners attempt access?

Which AI context requests are denied?
```

---

# Telemetry Layers

Recommended:

```text
Actor-resolution telemetry

Role telemetry

Permission telemetry

Policy telemetry

Decision telemetry

Command telemetry

Query telemetry

RLS telemetry

Storage telemetry

API telemetry

Realtime telemetry

Job telemetry

Provider telemetry

Support telemetry

Privileged-access telemetry

Sharing telemetry

Revocation telemetry

Account-deletion telemetry

AI-context telemetry
```

---

# Actor-Resolution Telemetry

Track:

```text
actorType

resolutionState

IdentityState

AccountState

ownerState

sessionState

deviceState

environment

failureCategory
```

---

# Role Telemetry

Track:

```text
roleId

assignmentState

scopeType

expirationBucket

certificationState

revocationState
```

---

# Permission Telemetry

Track:

```text
permissionId

resourceType

action

decision

reasonCode

requiresReauthentication

requiresApproval
```

---

# Policy Telemetry

Track:

```text
policyId

policyVersion

evaluationState

matched

effect

duration

cacheUsed

failureCategory
```

---

# Authorization Decision Telemetry

Track:

```text
decision

reasonCode

actorType

resourceType

action

scopeType

constraintCategory

duration
```

Avoid high-cardinality private Resource identifiers in ordinary Analytics.

---

# Command Telemetry

Track:

```text
commandName

permissionId

authorizationState

resourceResolutionState

reauthorizationState

commitState

failureCategory
```

---

# Query Telemetry

Track:

```text
queryName

permissionId

OwnerFilterApplied

projectionId

rowCountBucket

paginationState

authorizationState

failureCategory
```

---

# RLS Telemetry

Track:

```text
tableName

operation

policyVersion

allowOrDeny

unexpectedAllowSignal

unexpectedDenySignal

functionPath

serviceRoleUsed
```

---

# Storage Telemetry

Track:

```text
operation

resourceType

authorizationState

signedAuthorityCreated

expirationBucket

orphanState

failureCategory
```

---

# API Telemetry

Track:

```text
routeId

method

AuthenticationState

actorResolutionState

routePermissionState

resourceAuthorizationState

rateLimitState

failureCategory
```

---

# Realtime Telemetry

Track:

```text
channelType

subscriptionState

OwnerContextVersion

reauthorizationState

staleEventDiscarded

revocationState
```

---

# Job Telemetry

Track:

```text
jobType

serviceId

OwnerContextPresent

authorizationState

policyVersionState

RetryCount

expirationState

failureCategory
```

---

# Provider Telemetry

Track:

```text
providerId

eventType

AuthenticationState

environmentState

scopeState

ownerResolutionState

replayState

failureCategory
```

---

# Support Telemetry

Track:

```text
SupportRole

caseType

accessLevel

projectionId

grantState

elevatedMode

actionCategory

failureCategory
```

---

# Privileged Access Telemetry

Track:

```text
grantType

purpose

scopeType

durationBucket

approvalState

activeState

revocationState

downloadAttempt
```

---

# Sharing Telemetry

When active:

```text
resourceType

invitationState

permissionSet

expirationBucket

acceptanceState

revocationState

linkState
```

---

# Revocation Telemetry

Track:

```text
revocationType

targetType

cacheInvalidationState

jobStopState

realtimeStopState

downloadStopState

completionState

duration
```

---

# AI Context Telemetry

Track:

```text
purpose

requestedResourceTypes

authorizedResourceTypes

projectionId

recordCountBucket

authorizationState

ownerSwitchClearState
```

Do not log the private model context itself.

---

# Privacy-Safe Authorization Telemetry

Do not log:

```text
Passwords

Session tokens

Recovery tokens

Share tokens

Service credentials

Provider credentials

Full financial payloads

Transaction descriptions

Attachment contents

Complete Export contents

Another Owner's identity
```

---

# Authorization SLO Architecture

Potential SLO categories:

```text
Owner-resolution availability

Policy-evaluation availability

Authorization latency

RLS correctness

Storage authorization

Revocation propagation

Grant expiration

Privileged-access closure

Realtime revocation

Background-job reauthorization

Account-deletion access removal
```

---

# Owner-Resolution SLO

Potential objective:

```text
Protected requests resolve one current canonical Owner or fail safely within the approved operational window.
```

---

# Policy-Evaluation SLO

Potential objective:

```text
Authorization requests reach allow, deny, reauthentication, approval-required or safe unavailable state within the approved window.
```

---

# Authorization-Latency SLO

Potential objective:

```text
Ordinary Owner Authorization completes within the approved latency budget without removing Owner or policy checks.
```

---

# RLS Correctness SLO

Target:

```text
Zero cross-Owner rows returned through ordinary authenticated access.
```

---

# Storage Authorization SLO

Potential objective:

```text
Protected file requests receive bounded authorization or denial within the approved window.
```

---

# Revocation Propagation SLO

Potential objective:

```text
Revoked Sessions, Grants, Roles and sharing relationships stop new protected access within the approved propagation window.
```

---

# Grant Expiration SLO

Target:

```text
Expired Grants are rejected at or before their expiration boundary.
```

---

# Privileged View Closure SLO

Potential objective:

```text
Privileged views close within the approved propagation window after Grant expiration or revocation.
```

---

# Realtime Revocation SLO

Potential objective:

```text
Revoked or switched Owner contexts stop receiving protected realtime events within the approved window.
```

---

# Background-Job Reauthorization SLO

Potential objective:

```text
Material background-job execution validates current Owner, Account, Resource, Policy and Grant state before processing.
```

---

# Account-Deletion Access Removal SLO

Potential objective:

```text
Ordinary Owner, shared and privileged access stop within the approved deletion transition window.
```

---

# Cross-Owner Access SLO

Target:

```text
Zero.
```

---

# Unauthorized Export SLO

Target:

```text
Zero.
```

---

# Unauthorized Support Access SLO

Target:

```text
Zero.
```

---

# Unlogged Break-Glass SLO

Target:

```text
Zero.
```

---

# Revoked Grant Acceptance SLO

Target:

```text
Zero.
```

---

# Provider Out-of-Scope Access SLO

Target:

```text
Zero.
```

---

# SLI Record

Recommended fields:

```text
sliId

name

definition

numerator

denominator

dataSource

scope

inclusions

exclusions

privacyClassification

owner
```

---

# SLO Record

Recommended fields:

```text
sloId

sliId

target

window

severity

alertPolicy

errorBudgetPolicy

owner

reviewDate
```

---

# Authorization Error Budgets

Error budgets may guide:

- Policy-service improvements
- Decision-cache optimization
- Role migration
- New sharing rollout
- Provider-scope rollout
- New administrative tools

They must not normalize:

```text
Cross-Owner access

RLS broad access

Credential exposure

Unauthorized Export

Unauthorized Support access

Revoked Grant acceptance

Deleted Owner access

Unlogged break glass

Required Accessibility failure
```

---

# Authorization Operational Dashboard

Recommended sections:

```text
Actor resolution

Owner resolution

Policy health

Authorization decisions

Owner mismatch

RLS health

Storage authorization

API authorization

Realtime authorization

Background-job authorization

Provider scopes

Support access

Active privileged Grants

Break-glass activity

Sharing

Revocation propagation

Account-deletion access

Critical guardrails
```

---

# Dashboard Segmentation

Potential:

```text
Platform

Application version

Actor type

Role

Permission

Resource type

Action

Policy version

Environment

Provider

Service

Grant type

Account lifecycle state
```

---

# Alert Architecture

Alerts should be:

- Actionable
- Severity-based
- Deduplicated
- Owner-assigned
- Connected to a runbook
- Free from secrets and financial payloads

---

# Critical Alerts

Trigger immediately for:

```text
Cross-Owner Resource access

RLS unexpected broad allow

Service credential exposure

Unauthorized Export download

Unauthorized attachment download

Support unrestricted financial access

Break glass without Incident or audit

Revoked Grant accepted

Deleted Owner ordinary access

Provider out-of-scope financial access

AI context contains another Owner's data
```

---

# High Alerts

Potential:

```text
Owner-resolution failure spike

Policy service outage

Decision-cache invalidation failure

RLS unexpected-deny spike

Storage-policy failure

Grant-expiration backlog

Revocation-propagation delay

Support elevated-access anomaly

Provider-scope rejection spike

Offline unauthorized synchronization attempt
```

---

# Moderate Alerts

Potential:

```text
Role certification overdue

Policy review overdue

Service identity review overdue

Noncritical denial increase

Sharing invitation delivery issue
```

---

# Authorization Incident Architecture

Incident types may include:

```text
Cross-Owner access

RLS broad access

Client Owner injection

Role escalation

Service credential exposure

Unauthorized file access

Unauthorized Export

Support access abuse

Break-glass abuse

Revoked Grant accepted

Share-token exposure

Provider out-of-scope access

Background-job scope failure

Realtime cross-Owner event

Offline unauthorized synchronization

Deleted Owner access

AI unauthorized context retrieval
```

---

# Incident Severity Factors

Evaluate:

```text
Financial-data exposure

Identity-data exposure

Number of Owners

Number of Resources

Actor type

Privilege level

Duration

Download or Export

Provider scope

Service scope

Revocation capability

Account deletion impact

Public exposure

Recoverability
```

---

# Authorization Incident Response Sequence

```text
Detect

↓

Classify

↓

Stop affected command, query, route, Policy or credential

↓

Revoke Sessions, Roles, Grants or service access

↓

Stop jobs, realtime channels and downloads

↓

Protect affected Owners

↓

Preserve evidence

↓

Correct ownership or Policy state

↓

Verify every trusted boundary

↓

Communicate verified facts

↓

Restore safely

↓

Review
```

---

# Incident Containment Options

Potential:

```text
Disable API route

Disable command

Disable query

Disable Policy version

Enable explicit deny

Disable affected RLS path

Revoke service credential

Revoke Role assignment

Revoke Access Grant

Close privileged Sessions

Disable break glass

Disable sharing

Stop provider callback

Stop background jobs

Disconnect realtime

Block file downloads

Require reauthentication
```

---

# Cross-Owner Access Incident

Immediate actions:

```text
Stop the affected access path.

Revoke affected Sessions.

Block affected Resource type if necessary.

Protect source and target Owner identities.

Identify read, write, Export, file and AI exposure.

Preserve request and decision evidence.

Correct Owner resolution and policies.

Run cross-Owner regression tests.
```

---

# RLS Broad-Access Incident

Immediate actions:

- Disable affected client or API path.
- Revoke broad service credentials if involved.
- Stop synchronization.
- Stop realtime subscriptions.
- Identify affected tables and operations.
- Compare Application and database logs.
- Deploy an explicit deny or safe corrected Policy.
- Verify all Owner pairs.

---

# Client Owner-Injection Incident

Examples:

- Request body changes `ownerId`
- Query parameter selects another Owner
- Client controls `isAdmin`

Response:

```text
Reject the field.

Stop affected endpoint.

Review mass-assignment behavior.

Review every related command and table.

Add negative tests.

Assess prior misuse.
```

---

# Role-Escalation Incident

Response:

- Revoke affected assignments.
- Revoke privileged Sessions.
- Invalidate Grants created through the Role.
- Review Role composition and assignment authority.
- Assess actions performed.
- Correct separation of duties.

---

# Service Credential Exposure Incident

Immediate actions:

```text
Revoke or rotate credential.

Stop affected service.

Identify scope and environment.

Review access logs.

Review generated Grants, files and jobs.

Remove secret from code, logs, Support and AI systems.

Deploy narrowed replacement credential.
```

---

# Unauthorized Export Incident

Response:

- Revoke download authority.
- Remove accessible file where possible.
- Stop Export route or service.
- Identify downloader and Owner.
- Assess local-download limitations.
- Notify Security and Privacy.
- Review signed-link expiration and reauthorization.

---

# Unauthorized Attachment Incident

Response:

- Revoke object access.
- Remove active signed URLs where possible.
- Correct parent-resource authorization.
- Review predictable paths.
- Assess file contents and recipients.

---

# Support Access Abuse Incident

Examples:

- Browsing unrelated Owners
- Reading exact financial data without Grant
- Continuing after case closure
- Downloading unauthorized files

Response:

```text
End Support Session.

Revoke Roles and Grants.

Preserve immutable audit.

Identify affected Owners and fields.

Restrict administrative tool.

Notify Security, Privacy and Support leadership.

Perform personnel and process review through approved channels.
```

---

# Break-Glass Abuse Incident

Response:

- End break-glass Session.
- Revoke elevated authority.
- Preserve complete audit.
- Review Incident legitimacy.
- Review approvals.
- Identify Resources viewed or changed.
- Disable break glass if controls are defective.

---

# Revoked Grant Accepted Incident

Response:

```text
Invalidate decision caches.

Close privileged views.

Stop dependent jobs.

Revoke temporary links.

Review policy and clock behavior.

Identify actions after revocation.
```

---

# Share-Token Exposure Incident

When future Share Links exist:

- Revoke affected links.
- Remove tokens from logs and Analytics.
- Review browser and referrer exposure.
- Identify access.
- Notify Owner where appropriate.
- Issue new link only after review.

---

# Provider Out-of-Scope Access Incident

Response:

- Stop provider integration.
- Revoke provider credentials.
- Disable callback application.
- Identify data fields and Owners.
- Review provider retention and deletion.
- Correct scope.
- Update Privacy assessment.

---

# Background-Job Scope Incident

Examples:

- Job runs for wrong Owner
- Job processes more Resources than allowed
- Job continues after deletion

Response:

```text
Stop job queue.

Revoke service Actor.

Identify affected jobs and Resources.

Reconcile operation outcomes.

Correct job envelope and reauthorization.

Prevent Retry until repaired.
```

---

# Realtime Cross-Owner Incident

Response:

- Disconnect affected channels.
- Revoke affected Sessions.
- Clear client event queues.
- Correct server-side filters.
- Test Owner switch and reconnect.
- Assess displayed data.

---

# Offline Unauthorized Synchronization Incident

Response:

```text
Stop synchronization.

Preserve local Owner partition.

Reject unauthorized operations.

Review Session, Device, Policy and Account state.

Do not attach operations to another Owner.

Correct reconnect reauthorization.
```

---

# Deleted Owner Access Incident

Response:

- Revoke all related Sessions and Devices.
- Stop ordinary APIs, jobs and links.
- Disable recovery or sharing paths causing access.
- Preserve deletion evidence.
- Verify provider and offline behavior.
- Correct lifecycle enforcement.

---

# AI Unauthorized Context Incident

Response:

```text
Stop Assistant retrieval.

Clear affected model context and caches.

Identify Owners and fields.

Review retrieval authorization order.

Remove data from logs and evaluation systems where possible.

Notify Security and Privacy.

Require Owner-isolation regression tests.
```

---

# Incident User Communication

Potential structure:

```text
What access capability was affected

Whether financial data may have been viewed or changed

Whether an Export or file may have been downloaded

Whether Sessions or sharing access were revoked

Whether the user must Sign in again

Which action is recommended

Where to obtain Support
```

Do not expose another Owner's identity.

---

# Revocation Communication

Potential:

```text
Nexio ended temporary access to a protected resource.

Your underlying financial records were not deleted.
```

---

# Cross-Owner Incident Communication

Any communication must be based on verified Incident scope.

It must not identify another affected Owner.

---

# Post-Incident Review

Review:

```text
Actor construction

Owner resolution

Role and Permission

Policy version

Decision cache

Command or query

RLS

Storage

API

Realtime

Jobs

Provider scope

Support access

Privileged Grant

Sharing

Account deletion

Monitoring

Corrective action
```

---

# Authorization Incident Record

Recommended fields:

```text
incidentId

detectedAt

severity

actorScope

ownerScope

resourceScope

roleIds

permissionIds

policyIds

serviceIds

providerIds

grantIds

financialDataImpact

downloadImpact

privacyImpact

deletionImpact

containment

communication

rootCause

correction

verification

closedAt
```

---

# Platform Readiness Architecture

Authorization behavior must be verified across Android, Web, backend, database and provider environments.

---

# Android Authorization Readiness

Verify:

```text
Owner context loads before protected data.

Owner switch invalidates Activities and caches.

Deep Links reauthorize Resources.

Notification actions reauthorize Resources.

Offline operations preserve Owner.

Revocation closes protected views.

Signed file access expires.

Client code contains no service credentials.
```

---

# Web Authorization Readiness

Verify:

```text
Tabs coordinate Owner context.

Browser history does not restore unauthorized data.

Service Worker caches remain Owner-safe.

Realtime subscriptions stop after Owner switch.

Deep Links reauthorize.

Signed URLs are removed from visible navigation where appropriate.

Client code contains no privileged credentials.
```

---

# Backend Authorization Readiness

Verify:

```text
Every route is registered.

Every command declares Permission.

Every query declares Owner scope.

Provider callbacks validate scope.

Jobs use authorization envelopes.

Privileged tools use separate policies.

Policy rollback exists.
```

---

# Database Readiness

Verify:

```text
RLS enabled

Policies complete

Functions reviewed

Service roles restricted

Ownership constraints active

Cross-Owner tests passing

Production verification complete
```

---

# Storage Readiness

Verify:

```text
Buckets classified

Metadata complete

Upload authority bounded

Download authority bounded

Orphan cleanup active

Signed-link expiration active

Deletion behavior verified
```

---

# Environment Separation

Separate:

- Test and Production service identities
- Test and Production Roles
- Provider credentials
- Policies where environment-specific
- Storage buckets
- Share links
- Support tools
- Audit destinations

---

# Production Rollout

Recommended:

```text
Verify Registries

↓

Verify Actor and Owner resolution

↓

Verify command and query policies

↓

Verify RLS

↓

Verify storage

↓

Verify jobs and providers

↓

Verify Support and privileged access

↓

Start limited rollout

↓

Monitor Critical guardrails

↓

Expand
```

---

# Production Rollback

Rollback may include:

```text
Enable explicit deny

Disable route

Disable Policy version

Revoke service credential

Revoke Role assignment

Revoke Grants

Disable sharing

Stop provider callback

Stop jobs

Use prior verified application release
```

Rollback must not create broad temporary access.

---

# Support Governance Architecture

Support must understand that Authentication does not authorize arbitrary financial-data access.

---

# Support Training Objectives

Agents should understand:

```text
Identity versus Actor

Owner versus Account

Role versus Permission

Permission versus Resource scope

Ordinary Owner access versus Support access

Diagnostic metadata versus financial content

Case scope versus Account-wide scope

Temporary Grant versus permanent Role

Sign-out versus access revocation

Account deletion versus Support access
```

---

# Support Training Module — Safe Metadata

Agents may use approved metadata such as:

```text
Application version

Platform

General failure category

Synchronization state

Export state

Import state

Session state category
```

They should not infer permission to read private financial content.

---

# Support Training Module — Resource Access Denial

Agents should not tell the user:

```text
The resource belongs to another person.
```

Preferred:

```text
Nexio could not access the resource for the current Account.
```

---

# Support Training Module — Elevated Access

Agents should understand:

- A case is required.
- Access must be requested.
- Approval may be required.
- Access expires.
- Every view is audited.
- Case closure revokes access.

---

# Support Training Module — Exact Financial Data

Exact Amounts, descriptions, attachments and Exports remain denied by default.

A Support case does not automatically authorize them.

---

# Support Training Module — Owner Switching

Any prior-Owner data after an Account switch is a Critical Incident.

---

# Support Training Module — Share Access

When future sharing exists, Support should distinguish:

```text
Resource Owner

Recipient

Invitation

Active Grant

Revocation

Ownership transfer
```

Sharing never changes the original Owner.

---

# Support Training Module — Account Deletion

Support access must reduce when deletion begins.

Support cannot reactivate ordinary access.

---

# Support Scenario — User Cannot Open Export

Expected sequence:

```text
Verify current Account.

Verify Export job state.

Verify expiration.

Verify current Session.

Do not generate a public permanent link.

Do not download the file through an unrestricted Support tool.
```

---

# Support Scenario — User Receives Resource-Unavailable Message

Expected:

```text
Confirm current Account and Session.

Avoid confirming whether another Owner has the resource.

Review safe error metadata.

Escalate only through approved access.
```

---

# Support Scenario — Support Needs More Data

Expected:

```text
Use the predefined diagnostic projection first.

Request bounded elevated access only when necessary.

Do not ask for passwords, tokens or complete financial Exports through ordinary channels.
```

---

# Support Scenario — Temporary Access Expired

Expected:

```text
The prior Grant cannot be reused.

A new request and approval are required if access remains necessary.
```

---

# Support Scenario — Wrong Owner Data Appears

This is a Critical Security and Privacy Incident.

Required:

- Tell the user to stop using the affected view.
- Preserve Product version and Device information.
- Escalate immediately.
- Avoid additional real financial testing.
- Do not request another Owner's details.

---

# Support Authorization Macro

```text
Nexio Support can review approved diagnostic information for your case.

Support does not need your password, verification code, recovery link or Session token.
```

---

# Support Temporary Access Macro

```text
Temporary Support access is limited to the approved case, resources and time period.

It ends automatically or when the case is closed.
```

---

# Support Resource-Unavailable Macro

```text
Nexio could not access this resource for the current Account.

Review the active Account and try again without sharing Authentication secrets.
```

---

# Support Escalation Categories

Recommended:

```text
owner_resolution

owner_mismatch

permission_missing

scope_exceeded

policy_unavailable

RLS_failure

storage_authorization

Export_authorization

attachment_authorization

notification_authorization

Assistant_authorization

job_authorization

provider_scope

Support_elevated_access

break_glass

sharing

revocation

deleted_owner_access

accessibility
```

---

# Authorization Experiment Governance

Authorization experiments must preserve Security, Privacy and Accessibility.

---

# Allowed Experiments

Potential:

```text
Denied-state wording

Read-only-state layout

Reauthentication explanation

Permission-table presentation

Sharing-scope explanation

Temporary-access status presentation
```

---

# Prohibited Experiments

Do not experiment with:

```text
Owner matching

RLS enforcement

Permission validity

Grant expiration

Grant revocation

Break-glass approval

Support field scope

Deleted Owner access

Provider scope

Required Accessibility

Account deletion access
```

---

# Authorization Experiment Guardrails

Required:

```text
Cross-Owner access

Owner mismatch

Unauthorized Export

Unauthorized file access

Support access

Grant expiration

Revocation propagation

Policy failure

Accessibility completion

Account deletion
```

---

# Sharing Experiment Guardrails

When sharing exists:

```text
Recipient mismatch

Permission misunderstanding

Revocation latency

Unexpected Export

Resharing

Account deletion

User complaint rate
```

---

# Experiment Stop Conditions

Stop immediately when:

- Cross-Owner signals appear.
- Revoked access remains active.
- Support scope expands unexpectedly.
- Resource existence leaks.
- RLS behavior changes unexpectedly.
- Accessibility degrades.
- Account deletion is blocked.
- Sharing scope is misunderstood.

---

# Authorization Metrics Architecture

Recommended groups:

```text
Safety

Actor resolution

Role and assignment

Permission

Policy

Commands and queries

RLS

Storage

API and realtime

Jobs

Providers

Support

Privileged access

Sharing

Revocation

Account deletion

Accessibility

Privacy
```

---

# Safety Metrics

```text
cross_owner_access_count

RLS_broad_allow_count

service_credential_exposure_count

unauthorized_Export_count

unauthorized_attachment_count

unauthorized_Support_access_count

unlogged_break_glass_count

revoked_Grant_acceptance_count

deleted_owner_access_count

provider_out_of_scope_count

AI_cross_owner_context_count
```

Targets should be zero.

---

# Actor-Resolution Metrics

```text
actor_resolution_success_rate

owner_resolution_failure_rate

session_state_conflict_rate

device_state_conflict_rate

environment_mismatch_rate
```

---

# Role Metrics

```text
active_role_count

broad_role_finding_count

overdue_role_certification_count

expired_assignment_active_count

role_revocation_latency
```

---

# Permission Metrics

```text
active_permission_count

unused_permission_count

deprecated_permission_assignment_count

high_risk_permission_count

permission_missing_rate
```

---

# Policy Metrics

```text
policy_evaluation_success_rate

policy_evaluation_latency

policy_unavailable_rate

policy_simulation_difference_rate

explicit_deny_rate

stale_policy_decision_rejection_rate
```

---

# Command and Query Metrics

```text
command_authorization_deny_rate

query_authorization_deny_rate

owner_filter_missing_count

stale_response_discard_count

pagination_owner_mismatch_count

field_projection_violation_count
```

---

# RLS Metrics

```text
RLS_enabled_table_rate

RLS_policy_coverage_rate

RLS_cross_owner_test_failure_count

RLS_unexpected_allow_count

RLS_unexpected_deny_rate

service_role_use_count
```

---

# Storage Metrics

```text
storage_upload_authorization_rate

storage_download_authorization_rate

signed_URL_expiration_rate

orphan_file_count

unauthorized_path_attempt_count

revoked_download_attempt_count
```

---

# API and Realtime Metrics

```text
route_registry_coverage_rate

client_owner_override_rejection_count

client_role_injection_rejection_count

batch_mixed_owner_rejection_count

realtime_stale_event_discard_count

realtime_revocation_latency
```

---

# Job Metrics

```text
job_authorization_failure_rate

job_expiration_rejection_count

job_owner_context_missing_count

job_policy_version_mismatch_count

job_after_deletion_block_count
```

---

# Provider Metrics

```text
provider_scope_allow_rate

provider_scope_rejection_rate

provider_unknown_owner_count

provider_replay_rejection_count

provider_environment_mismatch_count
```

---

# Support Metrics

```text
Support_basic_access_count

Support_diagnostic_access_count

Support_elevated_access_count

Support_Grant_expiration_failure_count

Support_case_closure_revocation_failure_count

Support_field_scope_violation_count
```

---

# Privileged Access Metrics

```text
privileged_request_count

privileged_approval_rate

privileged_duration_bucket

privileged_Grant_overdue_count

break_glass_use_count

break_glass_review_overdue_count
```

---

# Sharing Metrics

When active:

```text
sharing_invitation_count

sharing_acceptance_rate

recipient_mismatch_count

active_share_Grant_count

share_revocation_latency

share_link_exposure_count
```

---

# Revocation Metrics

```text
revocation_completion_rate

decision_cache_invalidation_latency

job_revocation_latency

privileged_view_closure_latency

signed_authority_stop_latency
```

---

# Account-Deletion Metrics

```text
ordinary_access_after_deletion_count

shared_access_after_deletion_count

Support_access_after_deletion_count

job_after_deletion_count

provider_access_after_deletion_count
```

---

# Accessibility Metrics

```text
denied_state_screen_reader_completion

reauthentication_keyboard_completion

read_only_explanation_failure_rate

sharing_scope_accessibility_failure_rate

privileged_tool_accessibility_failure_rate
```

---

# Privacy Metrics

```text
Support_projection_violation_count

provider_field_scope_violation_count

audit_payload_violation_count

AI_context_minimization_failure_count

expired_Grant_retention_violation_count
```

---

# Metric Anti-Gaming

Do not improve Authorization metrics by:

- Hiding denial events
- Treating unavailable Policy as allow
- Removing RLS tests
- Excluding Support views from audit
- Extending Grants
- Weakening Owner filters
- Ignoring failed revocations
- Disabling account-deletion paths
- Classifying private Resources as public
- Sending broad context to AI before filtering

---

# Authorization Review Cadence

Recommended:

```text
Continuous Critical guardrail monitoring

Weekly active privileged-Grant review

Weekly break-glass review when used

Monthly service and provider scope review

Release-cycle Policy, API and RLS review

Quarterly Role and assignment certification

Quarterly Resource and field review

Quarterly Support access review

Quarterly Privacy and Accessibility review

Annual sharing and break-glass architecture review

Incident-driven review
```

---

# Authorization Portfolio Health

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

- Owner resolution works.
- Policies evaluate.
- RLS passes.
- Grants expire.
- Revocation propagates.
- No Critical guardrail failure exists.

---

# Watch

- Policy latency rising
- Role certification approaching
- Revocation latency rising
- Service review overdue
- Support elevated-access volume rising

---

# Degraded

- Some protected actions are unavailable.
- Fail-closed behavior preserves Owner isolation.
- Correction is active.

---

# At Risk

- Owner resolution uncertain
- RLS correctness uncertain
- Service credential exposure risk
- Revocation unreliable
- Privileged access control uncertain

---

# Paused

A Role, Policy, route, provider scope, sharing capability or privileged-access mechanism is intentionally disabled.

---

# Authorization Change Management

A material Authorization change should identify:

```text
Actors

Roles

Permissions

Resources

Policies

Constraints

RLS

Storage

APIs

Realtime

Jobs

Providers

Support

Privileged access

Sharing

Offline behavior

Account deletion

Migration

Rollback
```

---

# Material Authorization Changes

Examples:

- New Role
- New Permission
- New Resource type
- New Policy
- Broader Policy
- RLS change
- New service credential
- New provider scope
- New Support projection
- New privileged-access type
- New sharing capability
- New Share Link
- New background job
- Authorization cache change

---

# Authorization Change Record

Recommended:

```markdown
# Authorization Change

## Purpose

Which Product or operational need requires the change?

## Actor and Owner

Which Actors and Owner contexts are affected?

## Roles and Permissions

Which stable identifiers change?

## Resources

Which Resources, fields and sensitivities are affected?

## Policy

Which Policy version and composition change?

## Trusted Boundaries

Which Application, API, database and storage checks change?

## Privileged Access

Which Support, Security, Privacy or Operations access changes?

## Sharing

Does the change enable or expand sharing?

## Offline and Jobs

How are cached decisions and delayed operations reauthorized?

## Account Deletion

How does deletion stop access?

## Security and Privacy

Which threats and data categories are affected?

## Accessibility

Which denied, read-only or approval states were tested?

## Migration

How are active assignments, Grants and Resources handled?

## Operations

Which metrics, alerts and runbooks change?

## Rollback

How can access be restricted safely?
```

---

# Pull Request Contract

Material Pull Requests should include:

```markdown
## Requirements

- NEX-...

## Actors and Roles

- ACTOR-TYPE-...
- ROLE-...

## Permissions

- PERM-...

## Resources

Resource ownership and field-policy changes

## Policies

- POLICY-...
- Version and composition

## Owner Isolation

Application, API, RLS, storage and realtime evidence

## Privileged Access

Support, Grants and break-glass impact

## Jobs and Providers

Service and provider scopes

## Offline and Revocation

Stale decision and synchronization behavior

## Privacy and Accessibility

Field minimization and user-state evidence

## Migration and Rollback

Existing assignments, Resources and Grants

## Remaining Gaps

Unresolved risks
```

---

# Definition of Ready

An Authorization capability is ready for planning when:

```text
□ Product purpose is defined.

□ Actor types are defined.

□ Resource ownership is defined.

□ Permission is defined.

□ Scope is defined.

□ Policy is defined.

□ Trusted enforcement boundaries are defined.

□ Revocation is defined.

□ Account deletion behavior is defined.

□ Security impact is defined.

□ Privacy impact is defined.

□ Accessibility flow is defined.

□ Owners are assigned.
```

---

# Definition of Implemented

A capability is implemented when:

```text
□ Registry entries exist.

□ Application checks exist.

□ API checks exist.

□ Repository checks exist.

□ Database or storage checks exist where required.

□ Error taxonomy exists.

□ Telemetry hooks exist.

□ Revocation path exists.
```

Implementation does not mean verified or releasable.

---

# Definition of Verified

A capability is verified when:

```text
□ Actor-resolution tests pass.

□ Owner-isolation tests pass.

□ Command tests pass.

□ Query tests pass.

□ RLS tests pass.

□ Storage tests pass.

□ API tests pass.

□ Realtime tests pass.

□ Job tests pass.

□ Provider tests pass.

□ Privileged-access tests pass.

□ Revocation tests pass.

□ Account-deletion tests pass.

□ Privacy tests pass.

□ Accessibility tests pass.
```

---

# Definition of Releasable

A capability is releasable when:

```text
□ Roles and Permissions are approved.

□ Policies are active.

□ RLS and storage policies are active.

□ Service and provider scopes are approved.

□ Security review is complete.

□ Privacy review is complete.

□ Accessibility review is complete.

□ Monitoring and alerts are active.

□ Support guidance exists.

□ Runbooks exist.

□ Migration and rollback exist.

□ Kill switches work.
```

---

# Definition of Released

A capability is released when:

```text
□ Approved Actors can use it.

□ Active Role, Permission and Policy versions are recorded.

□ Production Owner isolation is verified.

□ Revocation monitoring is active.

□ Support is ready.

□ Release evidence exists.
```

---

# Definition of Operationally Verified

A capability is operationally verified when:

```text
□ Production Owner resolution succeeds.

□ Policies evaluate safely.

□ RLS preserves Owner isolation.

□ Grants expire.

□ Revocation propagates.

□ Privileged access remains bounded.

□ Account deletion removes ordinary access.

□ No Critical guardrail failure exists.
```

---

# Definition of Current

An Authorization capability is current when:

```text
□ Actors remain valid.

□ Roles remain necessary.

□ Permissions remain minimal.

□ Policies remain accurate.

□ Resource classifications remain accurate.

□ RLS and storage policies remain current.

□ Service and provider scopes remain current.

□ Support and sharing policies remain current.

□ Reviews are not overdue.
```

---

# Definition of Deprecated

An Authorization capability is deprecated when:

```text
□ New use is discouraged or blocked.

□ Replacement exists where required.

□ Active assignments and Grants are identified.

□ Migration exists.

□ Disablement and removal dates are defined.
```

---

# Definition of Removed

An Authorization capability is fully removed only when:

```text
□ New assignments are impossible.

□ New Grants are impossible.

□ Existing assignments are migrated or revoked.

□ Active Sessions are invalidated where required.

□ Commands and queries are updated.

□ API routes are updated.

□ RLS and storage policies are updated.

□ Jobs and providers are updated.

□ Support tools are updated.

□ Sharing paths are updated.

□ Monitoring is retired.

□ Historical audit remains preserved.
```

---

# AI Governance Architecture

AI may assist with bounded Authorization analysis and documentation.

AI must not become the authority for:

```text
Actor identity

Owner resolution

Role assignment

Permission creation

Authorization decision

Access Grant approval

Support elevation

Break-glass access

Share-token creation

Resource ownership

Account deletion access
```

---

# AI Required Context

Before assisting, AI should receive:

```text
Task purpose

Actor type

Resource type

Requested action

Permission identifier

Policy identifier and version

Known Owner relationship category

Allowed fields

Prohibited fields

Current decision category where already verified

Required human or system review
```

---

# Allowed AI Uses

AI may assist with:

- Drafting Policy documentation
- Reviewing permission naming
- Detecting broad Roles
- Detecting missing Owner checks
- Drafting test matrices
- Reviewing denied-state wording
- Summarizing audit findings
- Drafting Incident communication
- Comparing Registry versions
- Detecting potential dark patterns in sharing

---

# Forbidden AI Uses

AI must not:

- Grant access.
- Assign a Role.
- Approve an Access Grant.
- Approve break glass.
- Select the rightful Owner.
- Change `ownerId`.
- Generate a valid share token.
- Generate a service credential.
- Disable RLS.
- Override an explicit deny.
- Create unrestricted Support access.
- Determine resource ownership from names or emails.
- Execute financial commands without ordinary Authorization.
- Claim revocation completed without evidence.

---

# AI Authorization Terminology Rules

AI-generated content should distinguish:

```text
Authentication

Actor

Owner

Role

Permission

Policy

Resource

Scope

Access Grant

Authorization decision

Entitlement
```

---

# AI Policy Review Rules

AI may identify:

- Missing conditions
- Missing explicit deny
- Overbroad scope
- Missing expiration
- Missing audit
- Missing revocation

A human or trusted system remains the final authority.

---

# AI Owner-Isolation Rules

AI must not infer ownership from:

- Email similarity
- Display name
- Device
- Transaction content
- Support conversation
- Uploaded documents
- Writing style

---

# AI Support Rules

AI may explain the approved Support access process.

It must not:

- Approve elevation
- Request passwords or tokens
- Reveal another Owner
- Suggest unrestricted database access
- Suggest using a service role for convenience

---

# AI Incident-Drafting Rules

AI may draft communication only from verified Incident facts.

It must not:

- Invent affected Owner count
- Invent viewed Resources
- Claim an Export was not downloaded
- Claim Grants were revoked
- Claim no Privacy impact
- Identify another Owner

---

# AI Output Labels

AI output should distinguish:

```text
verified_Authorization_fact

verified_policy_fact

verified_Incident_fact

draft_policy

draft_wording

suggestion

inference

requires_verification

unknown
```

---

# AI Authorization Prompt Template

```text
You are assisting with a bounded Nexio Authorization task.

Task:
[TASK]

Actor type:
[ACTOR TYPE]

Resource type:
[RESOURCE TYPE]

Requested action:
[ACTION]

Permission:
[PERMISSION ID]

Policy:
[POLICY ID AND VERSION]

Owner relationship:
[VERIFIED RELATIONSHIP OR UNKNOWN]

Purpose:
[PURPOSE]

Allowed fields:
[FIELDS]

Forbidden fields:
[FIELDS]

Verified facts:
[FACTS]

Do not:
- Grant access
- Assign Roles
- Approve Grants
- Approve break glass
- Select an Owner
- Change ownership
- Generate tokens or credentials
- Disable RLS
- Override explicit deny
- Use names, emails or financial content as ownership proof
- Claim revocation or access completion without evidence

Separate verified facts, policy facts, suggestions, assumptions and unknowns.
```

---

# AI Review Questions

Before accepting AI-generated Authorization work:

```text
Does it identify the Actor, action, Resource and scope?

Does it preserve Owner isolation?

Does it distinguish entitlement from Resource Authorization?

Does it avoid broad Roles?

Does it include expiration and revocation?

Does it avoid secret generation?

Does it preserve Account deletion?

Was Security, Privacy, Accessibility or Operations review completed?
```

---

# AI Test Honesty

AI must distinguish:

```text
Role registered

Permission registered

Policy deployed

Application check implemented

RLS implemented

Storage policy implemented

Cross-Owner test passed

Grant created

Grant revoked

Revocation propagated

Not tested

Unknown
```

---

# Final Governance Checklists

---

# New Actor Type Checklist

```text
□ Actor Type ID exists.

□ Purpose is defined.

□ Identity source is defined.

□ Credential model is defined.

□ Required context is defined.

□ Allowed Roles are defined.

□ Forbidden scopes are defined.

□ Maximum Session duration is defined.

□ Audit requirement is defined.

□ Revocation path exists.

□ Security and Privacy review passes.
```

---

# New Role Checklist

```text
□ Role ID exists.

□ Purpose is defined.

□ Eligible Actor types are defined.

□ Permissions are explicit.

□ Scope is explicit.

□ Risk level is assigned.

□ Approval is defined.

□ Maximum duration is defined.

□ Strong Authentication is defined.

□ Separation of duties is reviewed.

□ Review date is defined.

□ Revocation path exists.
```

---

# New Permission Checklist

```text
□ Permission ID exists.

□ Resource type is registered.

□ Action is explicit.

□ Purpose categories are defined.

□ Actor types are defined.

□ Roles are defined.

□ Scope types are defined.

□ Risk level is assigned.

□ Reauthentication is defined.

□ Approval is defined.

□ Audit is defined.

□ Revocation behavior is defined.
```

---

# Resource Checklist

```text
□ Resource type is registered.

□ Owner field is defined.

□ Account or Identity relationship is defined.

□ Sensitivity is classified.

□ Lifecycle states are defined.

□ Field policies are defined.

□ Parent and child rules are defined.

□ Export behavior is defined.

□ Sharing behavior is defined.

□ Deletion behavior is defined.

□ Authorization version is supported.
```

---

# Policy Checklist

```text
□ Policy ID exists.

□ Version exists.

□ Actor types are explicit.

□ Resources are explicit.

□ Actions are explicit.

□ Conditions are deterministic.

□ Effect is explicit.

□ Priority is explicit.

□ Composition is explicit.

□ Constraints are explicit.

□ Failure behavior is fail-safe.

□ Cross-Owner tests pass.

□ Simulation is reviewed.

□ Rollback exists.
```

---

# Command Checklist

```text
□ Command declares Permission.

□ Command declares Resource.

□ Command declares action.

□ Command declares purpose.

□ Actor is trusted.

□ Owner is resolved first.

□ Resource is loaded under Owner scope.

□ Authorization occurs before execution.

□ Constraints are applied.

□ High-risk state is rechecked before commit.

□ Retry preserves Actor and Owner.

□ Audit is created where required.
```

---

# Query Checklist

```text
□ Query declares Permission.

□ Owner predicate is trusted.

□ Projection is explicit.

□ Maximum rows are defined.

□ Pagination is Owner-bound.

□ Sorting is allowlisted.

□ Search filters before ranking.

□ Counts are Owner-scoped.

□ Aggregates are Owner-scoped.

□ Deleted Resources are handled.
```

---

# RLS Checklist

```text
□ Owner-private table has owner_id.

□ RLS is enabled.

□ SELECT policy exists.

□ INSERT policy exists.

□ UPDATE policy exists.

□ DELETE policy exists.

□ owner_id cannot change.

□ Anonymous access is denied.

□ Functions validate Owner.

□ Security-definer functions are restricted.

□ Service-role use is documented.

□ Cross-Owner tests pass.
```

---

# Storage Checklist

```text
□ Object metadata exists.

□ Owner relationship exists.

□ Parent Resource exists.

□ Upload requires Authorization.

□ Upload authority is short-lived.

□ Download requires reauthorization.

□ Signed authority is short-lived.

□ Orphans are inaccessible.

□ Revocation behavior is defined.

□ Deletion behavior is defined.
```

---

# API Checklist

```text
□ Route is registered.

□ Authentication requirement is defined.

□ Permission is defined.

□ Resource type is defined.

□ Owner resolution is defined.

□ Resource-level Authorization exists.

□ Client role claims are rejected.

□ Client Owner overrides are rejected.

□ Batch items are individually authorized.

□ Nested expansions are constrained.

□ Error behavior avoids enumeration.
```

---

# Realtime Checklist

```text
□ Session is validated.

□ Owner is bound server-side.

□ Channel names do not grant access.

□ Reconnect reauthorizes.

□ Owner switch unsubscribes old channels.

□ Revocation disconnects.

□ Stale events are discarded.

□ Deleted Owners cannot subscribe.
```

---

# Background Job Checklist

```text
□ Job type is registered.

□ Service Actor exists.

□ Original Actor is retained where applicable.

□ Owner is retained where applicable.

□ Resource scope is explicit.

□ Purpose is explicit.

□ Expiration is defined.

□ Policy version is retained.

□ Reauthorization occurs.

□ Retry preserves operation identity.

□ Account deletion behavior is defined.
```

---

# Provider Scope Checklist

```text
□ Provider is registered.

□ Environment is explicit.

□ Allowed event types are defined.

□ Allowed Resources are defined.

□ Allowed fields are defined.

□ Forbidden data categories are defined.

□ Owner resolution is internal.

□ Replay protection exists.

□ Revocation path exists.

□ Monitoring exists.
```

---

# Support Access Checklist

```text
□ Support role is active.

□ Case exists.

□ Target Owner is explicit.

□ Data projection is predefined.

□ Purpose is explicit.

□ Elevated access is requested separately.

□ Approval is recorded.

□ Expiration is defined.

□ Visible elevated mode exists.

□ Every view is audited.

□ Downloads are denied by default.

□ Case closure revokes access.
```

---

# Privileged Grant Checklist

```text
□ Grant type is registered.

□ Grantee is active.

□ Grantor is authorized.

□ Target Owner is explicit.

□ Resource scope is narrow.

□ Permissions are narrow.

□ Purpose is explicit.

□ Case or Incident exists where required.

□ Approval exists.

□ Expiration is within maximum.

□ Renewal is not automatic.

□ Revocation is available.

□ Audit is available.
```

---

# Break-Glass Checklist

```text
□ Severe Incident exists.

□ Operator uses strong Authentication.

□ Reason is recorded.

□ Owner and Resource scope are narrow.

□ Permissions are narrow.

□ Forbidden Permissions remain blocked.

□ Duration is short.

□ Approval exists where feasible.

□ Real-time alert is sent.

□ Audit is immutable.

□ Post-use review is scheduled.
```

---

# Sharing Checklist

```text
□ Sharing capability is active.

□ Resource is shareable.

□ Owner has share Permission.

□ Invitation is created before access.

□ Recipient authenticates.

□ Recipient Identity matches policy.

□ Scope is displayed.

□ Permission set is explicit.

□ Expiration is defined.

□ ownerId remains unchanged.

□ Revocation exists.

□ Account deletion behavior exists.

□ Resharing is blocked by default.

```

---

# Share-Link Checklist

When separately approved:

```text
□ Link type is registered.

□ Resource is explicitly eligible.

□ Token has high entropy.

□ Token is protected at rest.

□ Token expires.

□ Link is revocable.

□ Fields are minimized.

□ View does not imply download.

□ Token is excluded from logs.

□ Token is excluded from Analytics.

□ Account deletion disables the link.
```

---

# Offline Authorization Checklist

```text
□ Prior online Authorization exists.

□ Owner is explicit.

□ Device is explicit.

□ Permission is explicit.

□ Scope is explicit.

□ Policy version is explicit.

□ Security version is explicit.

□ Expiration is enforced.

□ Local operations preserve operationId.

□ Synchronization reauthorizes.

□ Revoked access blocks synchronization.

□ Different Owner cannot inherit operations.
```

---

# Revocation Checklist

```text
□ Canonical revocation is persisted.

□ Authorization version changes.

□ Decision caches are invalidated.

□ Sessions are affected where required.

□ Realtime subscriptions stop.

□ Background jobs stop.

□ Privileged views close.

□ New signed URLs stop.

□ Sharing stops.

□ Completion is audited.
```

---

# Migration Checklist

```text
□ Migration ID exists.

□ Owner relationships are preserved.

□ Ambiguous ownership is denied.

□ Role assignments are mapped.

□ Permissions are mapped.

□ Policies are versioned.

□ RLS changes are tested.

□ Storage changes are tested.

□ Service scopes remain narrow.

□ Provider scopes remain narrow.

□ Grant expiration is preserved.

□ Revocation states are preserved.

□ Account deletion states are preserved.

□ Idempotency exists.

□ Rollback or forward correction exists.
```

---

# Audit Checklist

```text
□ Audit type is defined.

□ Actor scope is defined.

□ Owner scope is defined.

□ Resource scope is defined.

□ Policy version is known.

□ Privileged access is reviewed.

□ RLS is reviewed.

□ Storage is reviewed.

□ Jobs and providers are reviewed.

□ Findings have severity.

□ Corrective actions have owners.

□ Closure requires verification.
```

---

# Incident Checklist

```text
□ Incident category is defined.

□ Severity is assigned.

□ Actor scope is known.

□ Owner scope is known.

□ Resource scope is known.

□ Role and Permission scope is known.

□ Policy version is known.

□ Sessions can be revoked.

□ Roles and Grants can be revoked.

□ Service credentials can be revoked.

□ Providers can be stopped.

□ Jobs and realtime can be stopped.

□ Downloads can be blocked.

□ Support is notified.

□ User communication uses verified facts.

□ Post-Incident review is scheduled.
```

---

# Privacy Checklist

```text
□ Purpose is explicit.

□ Fields are minimized.

□ Support projections are bounded.

□ Provider projections are bounded.

□ Audit payloads are minimized.

□ AI context is Owner-filtered.

□ Sharing disclosure is clear.

□ Account deletion stops ordinary access.

□ Retention is defined.

```

---

# Accessibility Checklist

```text
□ Denied states are announced.

□ Reauthentication is keyboard accessible.

□ Read-only state is understandable.

□ Temporary-access expiration is understandable.

□ Sharing scope is accessible.

□ Revocation confirmation is accessible.

□ Privileged-tool state is visible.

□ Account deletion remains accessible.
```

---

# Support Training Checklist

```text
□ Agents distinguish Actor, Owner, Role and Permission.

□ Agents understand case scope.

□ Agents understand field projections.

□ Agents understand temporary Grants.

□ Agents understand Grant expiration.

□ Agents understand that Support cannot impersonate by default.

□ Agents never request passwords or tokens.

□ Agents do not use financial details as Authorization.

□ Agents escalate cross-Owner access immediately.

□ Agents close cases only after access revocation.
```

---

# Authorization Release Gate

An Authorization release must not proceed when:

```text
Actor context is untrusted.

Owner resolution is ambiguous.

Client ownerId controls ownership.

Roles use broad implicit authority.

Permissions are undocumented.

Policies fail open.

Protected commands lack checks.

Protected queries lack Owner predicates.

RLS is missing or unverified.

Service-role credentials appear in client code.

Storage relies on paths alone.

Export download lacks reauthorization.

Realtime channels are not Owner-scoped.

Jobs lack Actor, Owner or purpose.

Providers can exceed approved scope.

Support can browse financial data by default.

Privileged Grants lack expiration.

Break glass lacks Incident or audit.

Sharing lacks acceptance or revocation.

Offline synchronization skips reauthorization.

Account deletion leaves ordinary access active.

AI receives data before Owner filtering.

Required Accessibility fails.
```

---

# Post-Release Review

After release, review:

```text
Owner resolution

Authorization decisions

Owner mismatch

Role assignments

Policy behavior

RLS

Storage

API and realtime

Jobs

Provider scopes

Support access

Privileged Grants

Break glass

Sharing

Revocation

Account deletion

Critical guardrails
```

---

# Final Acceptance Criteria

The Nexio Authorization, Permissions, Sharing and Access Control architecture is accepted only when:

1. Authentication and Authorization remain separate.

2. Every protected operation has a canonical Actor.

3. Every ordinary Owner Actor resolves one Identity.

4. Every ordinary Owner Actor resolves one Account.

5. Every ordinary Owner Actor resolves one financial Owner.

6. Every protected operation identifies one explicit action.

7. Every protected operation identifies one Resource or collection.

8. Every protected operation identifies one approved purpose.

9. Every protected operation receives an Authorization decision.

10. Unknown decisions deny access.

11. Missing Policy denies access.

12. Conflicting Policy does not produce broad access.

13. Explicit denies take precedence according to approved composition.

14. Owner isolation is the default.

15. `actor.ownerId` must match `resource.ownerId` for ordinary self-Owner access.

16. Email equality does not authorize Resource access.

17. Display-name equality does not authorize Resource access.

18. Resource identifiers do not authorize access.

19. Client-supplied Owner values do not control ownership.

20. Client-supplied Roles are not trusted.

21. Client-supplied Permissions are not trusted.

22. Client-supplied administrative flags are not trusted.

23. Every protected Resource has ownership or system scope.

24. Every Owner-private Resource is classified.

25. Every Owner-private Resource has an ownership field or enforceable relationship.

26. Resource sensitivity is explicit.

27. Field sensitivity is explicit where required.

28. Parent and child Resource ownership remains consistent.

29. A child Resource cannot become less protected accidentally.

30. Actors have stable type identifiers.

31. Actor types have lifecycle states.

32. Every active Actor type has an accountable owner.

33. Owner Actors remain self-Owner scoped.

34. Service Actors remain purpose-scoped.

35. Provider Actors remain provider-scoped.

36. Background jobs retain Actor and purpose.

37. Anonymous Actors cannot access financial Resources.

38. Roles have stable identifiers.

39. Roles are purpose-oriented.

40. Roles contain explicit Permissions.

41. Roles use explicit scope policies.

42. Roles have risk levels.

43. High-risk Roles require strong Authentication.

44. Temporary Roles expire.

45. Long-lived Role assignments are certified periodically.

46. Overdue high-risk assignments trigger review.

47. Role removal revokes dependent access.

48. Broad Roles are detected and reviewed.

49. Universal administrative authority is prohibited by default.

50. Permissions have stable identifiers.

51. Permissions identify one Resource type.

52. Permissions identify one action.

53. Read does not imply update.

54. Update does not imply delete.

55. View does not imply Export.

56. Sharing does not imply download.

57. Entitlement does not imply cross-Owner access.

58. Permission risk levels are defined.

59. Reauthentication requirements are defined.

60. Approval requirements are defined.

61. Audit requirements are defined.

62. Permission deprecation includes migration.

63. Policies have stable identifiers.

64. Policies are versioned.

65. Policy conditions are deterministic.

66. Policy effects are explicit.

67. Policy priority is explicit.

68. Policy composition is explicit.

69. Policy constraints are explicit.

70. Policy failure behavior is fail-safe.

71. Policies pass static validation.

72. Policies pass synthetic tests.

73. Policies pass cross-Owner tests.

74. Access-expanding Policies receive Security and Privacy review.

75. Policy simulation precedes material activation.

76. Policy deployment supports rollback.

77. Policy changes invalidate stale decisions.

78. Most-restrictive constraints are applied where required.

79. Authorization decisions have stable identifiers.

80. Decisions identify matched Policies.

81. Decisions identify Policy version.

82. Decisions identify reason codes.

83. Decisions identify constraints.

84. Decision freshness is bounded.

85. Decision caches include Actor.

86. Decision caches include Owner.

87. Decision caches include Session.

88. Decision caches include Security version.

89. Decision caches include Policy version.

90. Decision caches include Resource authorization version.

91. Decision caches invalidate after Sign-out.

92. Decision caches invalidate after Owner switch.

93. Decision caches invalidate after Session revocation.

94. Decision caches invalidate after Device revocation.

95. Decision caches invalidate after Role change.

96. Decision caches invalidate after Grant revocation.

97. Decision caches invalidate after Account lifecycle changes.

98. High-risk decisions are re-evaluated.

99. Protected commands declare required Permissions.

100. Protected commands declare Resource type.

101. Protected commands declare action.

102. Protected commands declare purpose.

103. Protected commands construct trusted Actor context.

104. Protected commands resolve Owner before Resource access.

105. Protected commands load Resources under Owner scope.

106. Protected commands cannot execute before allow.

107. Protected commands apply returned constraints.

108. High-risk commands recheck critical state before commit.

109. Commands prevent ownership-field mutation.

110. Commands preserve operation identity during Retry.

111. Retry preserves original Actor.

112. Retry preserves original Owner.

113. Retry preserves original Resource.

114. Retry preserves original purpose.

115. Retry after Owner switch cannot run under the new Owner.

116. Retry after revocation is denied.

117. Protected queries declare Permissions.

118. Protected queries use trusted Owner predicates.

119. Client filters cannot remove Owner predicates.

120. Queries apply field projection.

121. Queries apply row limits.

122. Queries apply approved sorting.

123. Pagination is Owner-bound.

124. Pagination is query-bound.

125. Cursors cannot cross Owners.

126. Search filters before ranking.

127. Search filters before snippet generation.

128. Autocomplete is Owner-scoped.

129. Counts are Owner-scoped.

130. Aggregates are Owner-scoped.

131. Unauthorized Resource existence is not exposed unnecessarily.

132. Asynchronous responses carry Owner-context freshness.

133. Owner A responses are discarded after switching to Owner B.

134. Realtime subscriptions are Owner-scoped server-side.

135. Realtime channel names do not grant access.

136. Owner switching unsubscribes prior channels.

137. Session revocation disconnects realtime access.

138. Reconnect reauthorizes subscriptions.

139. Stale realtime events are discarded.

140. Owner-private repositories use Owner-safe methods.

141. Privileged repositories require case or purpose scope.

142. Unrestricted raw financial repositories are prohibited in ordinary Product code.

143. API routes have Registry records.

144. API middleware authenticates requests.

145. API middleware resolves trusted Actors.

146. API handlers perform Resource-level Authorization.

147. Route-level Permission does not replace Resource-level Authorization.

148. Batch requests authorize every Resource.

149. Mixed-Owner batches cannot receive one broad allow decision.

150. Nested Resource expansions are separately authorized.

151. API errors avoid Resource enumeration.

152. Supabase Authentication subject maps explicitly to canonical Identity.

153. Canonical Identity maps explicitly to Account.

154. Account maps explicitly to Owner.

155. Provider subject does not automatically become ownerId without documented authority.

156. Owner-resolution helpers are Security-reviewed.

157. Security-definer functions use explicit search paths.

158. Security-definer functions have minimal execute grants.

159. Security-definer functions return only required data.

160. Trusted Owner claims cannot be forged by clients.

161. Owner claims are refreshed after lifecycle changes.

162. Critical commands consult canonical Account state where needed.

163. Owner-private tables include `owner_id`.

164. Owner-private tables use RLS where supported.

165. RLS SELECT policies validate Owner.

166. RLS INSERT policies assign or validate Owner.

167. RLS UPDATE policies prevent Owner changes.

168. RLS DELETE policies validate Owner.

169. Anonymous database access to Owner-private rows is denied.

170. Soft-deleted Resources follow explicit policies.

171. Child ownership consistency is enforced.

172. Join tables validate active Grants.

173. Database views preserve underlying isolation.

174. Materialized views do not expose cross-Owner data directly.

175. Client-invoked database functions validate Actor.

176. Client-invoked database functions validate Owner.

177. Client-invoked database functions do not trust arbitrary Owner parameters.

178. Security-definer RPCs have minimal grants.

179. Security-definer RPCs are idempotent where required.

180. RLS policy deployments include migration records.

181. RLS policy deployments include cross-Owner tests.

182. RLS-disabled Owner-private tables are detected.

183. Rows with ambiguous ownership remain inaccessible.

184. Ownership migration does not use AI inference.

185. Ownership migration does not use display-name matching.

186. Ownership migration does not use email similarity alone.

187. Service-role credentials remain server-side.

188. Service-role credentials never appear in browser code.

189. Service-role credentials never appear in Android code.

190. Service-role credentials never appear in source maps.

191. Service-role use is purpose-specific.

192. Service-role queries retain explicit Owner scope.

193. Service-role use is audited.

194. Service-role credentials rotate.

195. Service-role credentials can be revoked.

196. Service identities have stable identifiers.

197. Service identities identify environment.

198. Service identities identify purpose.

199. Service identities have narrow Permissions.

200. Service identities have accountable owners.

201. Service identities are reviewed periodically.

202. Retired services lose credentials and Roles.

203. Protected storage objects have canonical metadata.

204. Storage metadata identifies Owner.

205. Storage metadata identifies parent Resource.

206. Predictable paths do not grant access.

207. Upload requires current Authorization.

208. Upload authority is short-lived.

209. Upload authority is Owner-scoped.

210. Upload authority is path-scoped.

211. Upload authority is size-bounded.

212. Orphaned uploads are inaccessible.

213. Download requires current Authorization.

214. Download validates the parent Resource.

215. Download validates Account lifecycle.

216. Signed URLs are short-lived.

217. Signed URLs are Resource-specific.

218. Signed URLs exclude Session tokens.

219. Signed URLs exclude recovery tokens.

220. Signed URLs exclude private financial descriptions.

221. New signed URLs stop after revocation.

222. Residual signed-link exposure windows are documented.

223. File deletion validates Owner or approved service scope.

224. Export creation requires current Owner authority.

225. Export jobs preserve Owner.

226. Export jobs preserve requesting Actor.

227. Export jobs preserve scope.

228. Export jobs preserve authorization version.

229. Export services receive one bounded job scope.

230. Export generation rechecks Account state.

231. Export generation rechecks cancellation.

232. Export download is reauthorized.

233. Export download validates expiration.

234. Export email links do not bypass Authentication by default.

235. Account deletion behavior for Exports is explicit.

236. Import batches bind to one Owner.

237. Import batch Owner cannot change.

238. Import preview is Owner-scoped.

239. Import confirmation is reauthorized.

240. Import confirmation validates preview version.

241. Owner B cannot confirm Owner A's Import.

242. Attachments validate file and parent Resource.

243. Attachment ownership remains consistent with the parent.

244. Notification lists are recipient-Owner scoped.

245. Notification actions reauthorize the target Resource.

246. Old Notifications do not preserve old Permissions.

247. Owner B cannot act through Owner A's Notification.

248. Assistant context retrieval resolves current Owner first.

249. Assistant retrieval applies Owner filtering before model access.

250. Assistant retrieval applies field minimization.

251. Assistant retrieval applies record limits.

252. Assistant conversations are Owner-scoped.

253. Owner switching clears prior Assistant context.

254. AI-generated actions undergo ordinary Authorization.

255. AI cannot grant Resource access.

256. AI cannot assign Roles.

257. AI cannot approve Grants.

258. AI cannot approve break glass.

259. AI cannot determine ownership from content.

260. Entitlements remain separate from Resource Authorization.

261. Premium access cannot bypass Owner scope.

262. Missing entitlement denies only the gated capability.

263. Existing Owner data remains accessible according to ordinary policy.

264. Session-list access validates current Identity and Account.

265. Device-revocation access validates current authority.

266. Account deletion requires self-Owner Authorization.

267. Account deletion requires recent reauthentication.

268. Subscription state cannot block Account deletion.

269. Background-job types are registered.

270. Every job has a service Actor.

271. Every job has a purpose.

272. Every job has an expiration.

273. Every Owner-specific job retains ownerId.

274. Jobs retain original Actor where applicable.

275. Jobs retain Resource scope.

276. Jobs retain Policy version.

277. Jobs reauthorize before material execution.

278. Job Retry preserves operation identity.

279. Job Retry does not expand Resource scope.

280. Ordinary jobs stop after Account deletion.

281. Scheduled Premium jobs recheck entitlement.

282. Provider scopes have Registry records.

283. Provider environments are explicit.

284. Provider event types are allowlisted.

285. Provider Resources are allowlisted.

286. Provider fields are allowlisted.

287. Provider forbidden data categories are explicit.

288. Provider callbacks authenticate the provider.

289. Provider callbacks validate environment.

290. Provider callbacks prevent replay.

291. Provider callbacks resolve Owner internally.

292. Provider callbacks cannot assign arbitrary Owner IDs.

293. Unknown provider ownership does not create a new Owner.

294. Billing providers do not receive Transactions or balances by default.

295. Advertising providers do not receive financial records.

296. Authentication providers do not receive ordinary financial records.

297. Provider credentials can be revoked.

298. Provider scopes are reviewed after material changes.

299. Support access levels are defined.

300. Basic Support receives only safe metadata.

301. Diagnostic Support uses predefined projections.

302. Support does not receive arbitrary database-query capability.

303. Exact financial data is denied by default.

304. Transaction descriptions are denied by default.

305. Attachment contents are denied by default.

306. Complete Export contents are denied by default.

307. Authentication secrets are always denied to Support.

308. Support cases identify target Owner.

309. Support cases identify purpose.

310. Elevated Support access requires a request.

311. Elevated Support access requires approval where defined.

312. Elevated Support access is time-bounded.

313. Elevated Support access is Resource-scoped.

314. Elevated Support access is field-scoped.

315. Elevated Support mode is visibly identified.

316. Every elevated Support view is audited.

317. Support case closure revokes Grants.

318. Support case closure closes privileged views.

319. Support case closure stops diagnostic jobs.

320. Support case closure removes temporary files according to policy.

321. Support impersonation is prohibited by default.

322. Privileged-access requests have stable identifiers.

323. Privileged access requires strong Authentication.

324. Privileged access is purpose-bound.

325. Privileged access is scope-bound.

326. Privileged access is time-bounded.

327. Privileged access is revocable.

328. Privileged access is audited.

329. Privileged downloads are denied by default.

330. Privileged download exceptions require explicit approval.

331. High-risk access supports separation of duties.

332. Actors do not approve their own high-risk requests where separation is feasible.

333. Break-glass policy is registered.

334. Break glass requires an active severe Incident.

335. Break glass requires strong Authentication.

336. Break glass requires narrow Resource scope.

337. Break glass requires narrow Permissions.

338. Break glass has a short maximum duration.

339. Break glass does not renew silently.

340. Break glass triggers real-time alerts.

341. Break glass creates immutable audit.

342. Break glass receives mandatory post-use review.

343. Break glass cannot expose passwords.

344. Break glass cannot expose Session tokens.

345. Break glass cannot change financial ownership.

346. Break glass cannot disable Account deletion rights.

347. General financial sharing remains disabled by default.

348. Sharing capabilities have Registry records before activation.

349. Shareable Resources are explicitly classified.

350. Owners require share Permission.

351. Invitations do not grant immediate access.

352. Invitations are Identity-bound.

353. Invitations expire.

354. Recipients authenticate before acceptance.

355. Recipients explicitly accept the scope.

356. Sharing creates explicit Access Grants.

357. Sharing never changes ownerId.

358. Shared queries use active Grants.

359. Shared mutations record the acting recipient.

360. Shared access is revocable.

361. Revocation stops future queries.

362. Revocation stops future downloads where possible.

363. Recipients cannot reshare by default.

364. Owner deletion revokes sharing.

365. Recipient deletion invalidates recipient Grants.

366. Resource deletion revokes related sharing.

367. View permission does not imply Export.

368. Unauthenticated Share Links remain prohibited by default.

369. Any future Share Link uses a high-entropy token.

370. Share tokens are protected at rest.

371. Share tokens expire.

372. Share tokens are revocable.

373. Share tokens are excluded from logs.

374. Share tokens are excluded from Analytics.

375. Share links expose only approved fields.

376. Share-link view does not imply download.

377. Offline Authorization is previously established.

378. Offline Authorization is Owner-scoped.

379. Offline Authorization is Device-scoped.

380. Offline Authorization is Permission-scoped.

381. Offline Authorization expires.

382. Offline operations preserve operationId.

383. Offline operations preserve ownerId.

384. Offline operations preserve Device identity.

385. Offline privileged access is prohibited by default.

386. Offline sharing creation is prohibited.

387. Synchronization refreshes Session authority.

388. Synchronization resolves current Owner.

389. Synchronization validates Device.

390. Synchronization validates Account lifecycle.

391. Synchronization re-evaluates Permission.

392. Synchronization validates Resource ownership.

393. Synchronization validates Policy version.

394. Remotely revoked access blocks synchronization.

395. Different Owner Sign-in cannot inherit pending operations.

396. Deleted Owners cannot receive queued operations.

397. Revocation events are canonical records.

398. Revocation changes Authorization versions.

399. Revocation invalidates decision caches.

400. Revocation stops realtime subscriptions.

401. Revocation stops dependent jobs.

402. Revocation closes privileged views.

403. Revocation stops new signed-link issuance.

404. Revocation stops sharing.

405. Revocation completion is audited.

406. Role removal revokes dependent Grants.

407. Policy deployment invalidates incompatible decisions.

408. Authorization service failures fail closed.

409. Safe degraded access is explicitly bounded.

410. Policy-repository failure blocks new privileged access.

411. Policy-repository failure blocks new sharing.

412. Owner-resolver failure hides protected Resources.

413. Owner-resolver failure does not create a replacement Owner.

414. Suspected broad RLS access is Critical.

415. Storage-policy uncertainty denies file access.

416. Grant-service failure does not extend Grants.

417. Realtime Authorization failure disconnects access.

418. Denied states avoid Resource enumeration.

419. Denied states explain safe next actions.

420. Denied states are accessible.

421. Protected content is not visible behind denial.

422. Material decisions create audit evidence.

423. Audit evidence identifies Actor.

424. Audit evidence identifies action.

425. Audit evidence identifies Resource type.

426. Audit evidence identifies purpose.

427. Audit evidence identifies decision.

428. Audit evidence identifies Policy version.

429. Audit evidence excludes full financial payloads.

430. Authorization audits are defined.

431. Actor audits are defined.

432. Role audits are defined.

433. Permission audits are defined.

434. Resource audits are defined.

435. Policy audits are defined.

436. Decision-cache audits are defined.

437. Command audits are defined.

438. Query audits are defined.

439. RLS audits are defined.

440. Storage audits are defined.

441. API audits are defined.

442. Realtime audits are defined.

443. Job audits are defined.

444. Provider audits are defined.

445. Support audits are defined.

446. Privileged-access audits are defined.

447. Break-glass audits are defined.

448. Sharing audits are defined.

449. Revocation audits are defined.

450. Account-deletion audits are defined.

451. AI-access audits are defined.

452. Critical findings require immediate containment.

453. Critical findings require affected-Owner analysis.

454. Critical findings require Resource and field analysis.

455. Critical findings require verification before closure.

456. Periodic Actor reviews are defined.

457. Periodic Role reviews are defined.

458. Periodic assignment certifications are defined.

459. Periodic Permission reviews are defined.

460. Periodic Resource reviews are defined.

461. Periodic Policy reviews are defined.

462. Periodic RLS reviews are defined.

463. Periodic service reviews are defined.

464. Periodic provider reviews are defined.

465. Periodic Support access reviews are defined.

466. Overdue high-risk certification triggers action.

467. Authorization migrations preserve Owner relationships.

468. Authorization migrations deny ambiguous ownership.

469. Authorization migrations preserve Grant expiration.

470. Authorization migrations preserve revocation state.

471. Authorization migrations preserve Account deletion state.

472. Role migrations remove broad obsolete Roles.

473. Permission migrations update every dependent Role and route.

474. Policy migrations use simulation and limited rollout.

475. Ownership backfills use authoritative relationships.

476. RLS migrations include rollback or forward correction.

477. Service migrations revoke old credentials.

478. Provider-scope migrations do not expand silently.

479. Grant migrations do not extend access silently.

480. Sharing migrations preserve Owner and recipient identity.

481. Authorization-version migrations invalidate stale access.

482. Deprecated capabilities block new use.

483. Removed capabilities remove assignments, Grants, routes and policies.

484. Observability covers Actor and Owner resolution.

485. Observability covers Policies and decisions.

486. Observability covers RLS.

487. Observability covers storage.

488. Observability covers API and realtime.

489. Observability covers jobs and providers.

490. Observability covers Support and privileged access.

491. Observability covers sharing.

492. Observability covers revocation.

493. Observability covers Account deletion.

494. Telemetry excludes credentials.

495. Telemetry excludes tokens.

496. Telemetry excludes complete financial payloads.

497. Telemetry excludes complete Export contents.

498. Owner-resolution SLOs are defined.

499. Policy-evaluation SLOs are defined.

500. Authorization-latency SLOs are defined.

501. RLS correctness SLOs are defined.

502. Storage Authorization SLOs are defined.

503. Revocation-propagation SLOs are defined.

504. Grant-expiration SLOs are defined.

505. Privileged-view closure SLOs are defined.

506. Realtime-revocation SLOs are defined.

507. Job-reauthorization SLOs are defined.

508. Account-deletion access-removal SLOs are defined.

509. Cross-Owner access target is zero.

510. Unauthorized Export target is zero.

511. Unauthorized Support access target is zero.

512. Unlogged break-glass target is zero.

513. Revoked Grant acceptance target is zero.

514. Provider out-of-scope access target is zero.

515. Zero-tolerance failures are excluded from error-budget normalization.

516. Operational dashboards include Critical guardrails.

517. Critical alerts connect to runbooks.

518. Alerts contain no credentials or financial payloads.

519. Authorization Incident categories are defined.

520. Routes and Policies can be disabled during Incidents.

521. Roles and Grants can be revoked during Incidents.

522. Service credentials can be revoked during Incidents.

523. Jobs and realtime can be stopped during Incidents.

524. File downloads can be blocked during Incidents.

525. Cross-Owner Incidents protect all Owner identities.

526. RLS Incidents trigger complete cross-Owner validation.

527. Service credential Incidents rotate credentials.

528. Support-abuse Incidents preserve immutable audit.

529. Revoked-Grant Incidents invalidate caches.

530. Provider-scope Incidents stop the provider.

531. AI-context Incidents clear unauthorized context.

532. Incident communication uses verified facts.

533. Post-Incident review examines every trusted boundary.

534. Android Authorization readiness is defined.

535. Web Authorization readiness is defined.

536. Backend readiness is defined.

537. Database readiness is defined.

538. Storage readiness is defined.

539. Test and Production Authorization are separated.

540. Production rollout uses limited activation and monitoring.

541. Rollback never creates broad temporary access.

542. Support training distinguishes Actor, Owner, Role and Permission.

543. Support training distinguishes metadata and financial content.

544. Support never uses financial knowledge as Authorization.

545. Support never requests passwords or tokens.

546. Support escalates cross-Owner exposure immediately.

547. Support closes cases only after temporary access ends.

548. Authorization experiments preserve Owner matching.

549. Authorization experiments preserve RLS.

550. Authorization experiments preserve Grant expiration.

551. Authorization experiments preserve revocation.

552. Authorization experiments preserve Account deletion.

553. Authorization experiments preserve required Accessibility.

554. Experiment guardrails can stop rollout.

555. Authorization safety metrics are defined.

556. Actor-resolution metrics are defined.

557. Role metrics are defined.

558. Permission metrics are defined.

559. Policy metrics are defined.

560. Command and query metrics are defined.

561. RLS metrics are defined.

562. Storage metrics are defined.

563. API and realtime metrics are defined.

564. Job metrics are defined.

565. Provider metrics are defined.

566. Support metrics are defined.

567. Privileged-access metrics are defined.

568. Sharing metrics are defined.

569. Revocation metrics are defined.

570. Account-deletion metrics are defined.

571. Accessibility metrics are defined.

572. Privacy metrics are defined.

573. Metrics cannot improve by weakening Owner isolation.

574. Metrics cannot improve by failing open.

575. Metrics cannot improve by hiding privileged access.

576. Metrics cannot improve by extending Grants.

577. Metrics cannot improve by ignoring failed revocations.

578. Review cadence covers privileged Grants.

579. Review cadence covers service identities.

580. Review cadence covers provider scopes.

581. Review cadence covers Role certification.

582. Review cadence covers Policy and RLS.

583. Portfolio health states are defined.

584. Material changes identify Actors, Roles and Permissions.

585. Material changes identify Resources and Policies.

586. Material changes identify database and storage impact.

587. Material changes identify privileged-access impact.

588. Material changes identify sharing impact.

589. Material changes identify migration and rollback.

590. Pull Requests identify stable Registry IDs.

591. Pull Requests include Owner-isolation evidence.

592. Pull Requests include RLS and storage evidence.

593. Pull Requests include revocation behavior.

594. Pull Requests include Account-deletion impact.

595. Definition of Ready is defined.

596. Definition of Implemented is defined.

597. Definition of Verified is defined.

598. Definition of Releasable is defined.

599. Definition of Released is defined.

600. Definition of Operationally Verified is defined.

601. Definition of Current is defined.

602. Definition of Deprecated is defined.

603. Definition of Removed is defined.

604. AI may assist with bounded Policy drafting.

605. AI may assist with broad-Role detection.

606. AI may assist with missing Owner-check detection.

607. AI may assist with test drafting.

608. AI is not Actor authority.

609. AI is not Owner authority.

610. AI is not Role-assignment authority.

611. AI is not Permission authority.

612. AI is not Authorization-decision authority.

613. AI is not Grant-approval authority.

614. AI is not break-glass authority.

615. AI is not Resource-ownership authority.

616. AI never generates valid share tokens.

617. AI never generates service credentials.

618. AI never disables RLS.

619. AI never overrides explicit deny.

620. AI never uses email or financial content as ownership proof.

621. AI-generated Incident content requires verified facts.

622. New Actor types require governance checklists.

623. New Roles require governance checklists.

624. New Permissions require governance checklists.

625. New Resources require governance checklists.

626. New Policies require governance checklists.

627. New RLS policies require cross-Owner tests.

628. New storage policies require file-access tests.

629. New service identities require least-privilege review.

630. New provider scopes require Privacy and Security review.

631. New privileged-access types require expiration and audit.

632. New sharing capabilities require acceptance and revocation.

633. Release gates block unsafe Authorization.

634. Post-release review is required.

635. Every protected command remains traceable from Actor to decision and mutation.

636. Every protected query remains traceable from Actor to Owner predicate and projection.

637. Every privileged access remains traceable from request to approval, use and revocation.

638. Every share relationship remains traceable from Owner invitation to recipient acceptance and revocation.

639. Every Account deletion remains traceable to removal of ordinary, shared and privileged access.

---

# Authorization, Permissions, Sharing and Access Control Constitutional Rule

Every Nexio Actor, Role, Role assignment, Permission, Resource, Policy, Authorization decision, Access Grant, privileged Session, Support view, background job, provider event, database Policy, storage operation, invitation, sharing relationship and revocation must answer:

```text
Which canonical Actor, authenticated Identity, Account, financial Owner, Session, Device, Role and purpose authorize this exact action; which Resource, fields and Owner scope are involved; which current Permission, Policy version, entitlement, Grant, approval and expiration apply; which Application, API, database, storage and operational controls enforce the same result; which audit evidence proves the decision; and which immediate revocation prevents further access when any ownership, Session, Device, Account, Policy, provider, service, Grant or Resource state becomes uncertain?
```

When the answer is uncertain, prefer the action that:

- Denies access.
- Hides the Resource.
- Applies the trusted Owner scope.
- Requires reauthentication.
- Applies explicit deny.
- Discards stale responses.
- Invalidates cached decisions.
- Revokes the Role assignment.
- Revokes the Access Grant.
- Revokes the Session.
- Revokes the Device.
- Stops the background job.
- Disconnects realtime access.
- Blocks upload and download.
- Stops provider callbacks.
- Closes privileged views.
- Disables sharing.
- Preserves the correct Owner partition.
- Escalates through Security, Privacy and Operations.
- Blocks the release.

Authorization is not complete because an Actor is authenticated.

Authorization is not complete because a Role name appears in a token.

Authorization is not complete because an API route is protected.

Authorization is not complete because Row-Level Security exists.

Authorization is not complete because a file link was signed.

Authorization is not complete because Support has an open case.

Authorization is not complete because AI suggested that access is reasonable.

Authorization is complete only when Actor, Identity, Account, Owner, Session, Device, Role, Permission, Resource, purpose, Policy, scope, entitlement, Grant, expiration, Account lifecycle and revocation state agree at every trusted boundary, and no Retry, cache, offline operation, background job, provider event, privileged tool, Export, file or sharing mechanism can exceed that decision.

---

# Final Authority

This document is the official Authorization, Permissions, Sharing and Access Control specification for Nexio.

All future:

- Actor types
- Owner Actors
- Service Actors
- Background-job Actors
- Provider Actors
- Anonymous Actors
- Roles
- Role assignments
- Permissions
- Resource types
- Resource classifications
- Field-level policies
- Authorization Policies
- Explicit deny Policies
- Policy composition
- Authorization requests
- Authorization decisions
- Decision caching
- Decision-cache invalidation
- Application commands
- Application queries
- Owner-scoped repositories
- API routes
- API middleware
- Batch APIs
- Nested API expansions
- Realtime subscriptions
- Supabase integration
- PostgreSQL Row-Level Security
- Database views
- Materialized views
- Database functions
- Security-definer functions
- Service-role access
- Serverless functions
- Storage buckets
- Storage metadata
- Upload authority
- Download authority
- Signed URLs
- Attachments
- Import access
- Export access
- Report access
- Notification actions
- Deep Links
- Assistant context retrieval
- AI-generated Product actions
- Subscription access
- Entitlement-gated actions
- Session management permissions
- Device management permissions
- Account deletion access
- Background jobs
- Scheduled jobs
- Provider callbacks
- Provider scope
- Support access
- Support diagnostic projections
- Support elevated access
- Administrative tools
- Privileged-access requests
- Temporary Access Grants
- Separation of duties
- Break-glass access
- Sharing invitations
- Shared Resource access
- Share links
- Sharing revocation
- Offline Authorization
- Synchronization reauthorization
- Role revocation
- Permission revocation
- Grant revocation
- Policy migration
- Ownership backfill
- RLS migration
- Storage-policy migration
- Service-identity migration
- Provider-scope migration
- Sharing migration
- Authorization audits
- Authorization observability
- Authorization SLOs
- Authorization Incidents
- Authorization Support
- Authorization experiments
- Authorization Analytics
- AI-assisted Authorization workflows

must comply with this specification.

Exceptions require a documented Product, Authorization, Identity, Domain, Security, Privacy, Accessibility, Database, Storage, API, Android, Web, Operations, Support, Compliance, Provider, Sharing, Data, AI or Release decision containing:

- Actor type
- Identity and Account context
- Financial Owner impact
- Role identifiers
- Permission identifiers
- Resource types
- Ownership fields
- Field-level scope
- Purpose
- Policy identifiers and versions
- Explicit deny behavior
- Decision constraints
- Session behavior
- Device behavior
- Entitlement behavior
- Access Grant behavior
- Approval
- Expiration
- Revocation
- RLS impact
- Storage impact
- API impact
- Realtime impact
- Background-job impact
- Provider impact
- Support impact
- Sharing impact
- Offline impact
- Account-deletion impact
- Privacy impact
- Accessibility impact
- Audit
- Monitoring
- Migration
- Rollback
- Compensating controls
- Required approvers

Undocumented Actors, broad Roles, implicit Permissions, missing Owner predicates, client-controlled ownership, untested RLS, unrestricted service credentials, permanent file links, unbounded Support access, invisible impersonation, unaudited break glass, nonexpiring Grants, email-based sharing, stale offline Permissions, provider scope expansion, blocked revocation, deleted-Owner access and AI-approved access decisions are considered Product, financial-integrity, Security, Privacy, Accessibility, reliability, Support, operational and governance debt.

---