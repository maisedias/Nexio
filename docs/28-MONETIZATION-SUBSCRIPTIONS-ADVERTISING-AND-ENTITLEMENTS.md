# Nexio Monetization, Subscriptions, Advertising and Entitlements Specification

Version: 1.0  
Status: Official  
Authority Level: Monetization, Billing, Advertising, Subscription and Entitlement Standard  
Applies To: Web, Desktop, Tablet, Mobile Web, Android, Google Play Billing, Advertising Providers, AdMob, Subscription Plans, Premium Capabilities, Trials, Promotions, Purchases, Refunds, Cancellations, Restore Purchases, Account Deletion, Privacy, Analytics, Support and Store Readiness

---

# Purpose

This document defines the official monetization architecture for Nexio.

It establishes how Nexio should:

- Offer free and paid Product capabilities
- Display Advertising
- Offer subscriptions
- Offer one-time purchases where approved
- Represent Product plans
- Represent store products
- Verify purchases
- Grant and revoke entitlements
- Restore purchases
- Handle pending purchases
- Handle billing grace periods
- Handle account hold
- Handle cancellation
- Handle expiration
- Handle refunds
- Handle chargebacks
- Handle promotional access
- Handle trials
- Handle provider outages
- Preserve access to user financial data
- Preserve owner isolation
- Respect Privacy choices
- Keep Advertising separate from financial guidance
- Support Account deletion
- Support Android and Web differences
- Support accessible purchase flows
- Support Support investigation
- Prevent duplicate billing
- Prevent false premium access
- Prevent false access revocation
- Prevent Product lock-in
- Measure monetization without exploiting financial behavior
- Use AI only for bounded assistance

The objective is to ensure that monetization never becomes:

```text
A financial-record access ransom

A hidden fee

A deceptive purchase flow

A disguised Advertisement

A reason to expose financial data

A reason to block Account deletion

A reason to lose Export access

A replacement for canonical purchase verification

A mechanism for financial profiling

A source of repeated billing

An inaccessible Product barrier

A provider-specific implementation that cannot be removed
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
```

Responsibilities are divided as follows:

| Document | Responsibility |
|---|---|
| `06-DATA-MODEL.md` | Defines owner and financial records |
| `07-SECURITY.md` | Defines purchase-token, provider and owner protection |
| `11-INTERNATIONALIZATION-AND-CONTENT.md` | Defines localized plan and price presentation |
| `13-PRIVACY-AND-DATA-GOVERNANCE.md` | Defines Advertising and billing-data governance |
| `14-ACCESSIBILITY.md` | Defines accessible purchase and Advertisement experiences |
| `16-ANALYTICS-AND-EXPERIMENTATION.md` | Defines monetization measurement and experiment boundaries |
| `17-API-AND-INTEGRATIONS.md` | Defines billing and Advertising provider Adapters |
| `20-SUPPORT-AND-USER-OPERATIONS.md` | Defines purchase and billing Support |
| `21-COMPLIANCE-LEGAL-AND-STORE-READINESS.md` | Defines store declarations and consumer-facing obligations |
| `26-NOTIFICATIONS-REMINDERS-AND-USER-COMMUNICATIONS.md` | Defines billing and subscription communications |
| `27-IMPORT-EXPORT-AND-DATA-PORTABILITY.md` | Defines continued data portability |
| `28-MONETIZATION-SUBSCRIPTIONS-ADVERTISING-AND-ENTITLEMENTS.md` | Defines monetization, billing, Advertising and access rights |

This document does not redefine store-provider billing rules.

It defines how Nexio safely interprets and applies verified provider state.

---

# Monetization Constitutional Principles

## Financial Data Belongs to the User

Monetization must not prevent an authenticated owner from:

- Viewing existing financial records
- Correcting invalid records
- Exporting personal records
- Accessing Privacy controls
- Deleting the Nexio Account
- Contacting Support
- Reviewing subscription state

A paid plan may govern advanced features.

It must not hold existing user data hostage.

---

## Core Financial Integrity Is Not a Premium Feature

The following must never become less correct for free users:

```text
Exact Money

Explicit Currency

Owner isolation

Canonical Transaction behavior

Transfer atomicity

Data durability

Security

Privacy

Accessibility

Account deletion

Export of user-owned records
```

---

## Monetization Must Be Transparent

Before purchase, Nexio should show:

```text
Product or plan name

Included capabilities

Excluded capabilities

Price from the authoritative store or provider

Billing period

Trial terms where applicable

Renewal behavior

Cancellation method

Access after cancellation

Refund authority

Provider identity

Regional limitations
```

---

## Store Price Is Authoritative

The displayed purchase price should come from the active billing provider when possible.

Nexio must not hardcode a price and claim it is current when the provider returns a different localized price.

---

## Currency Must Remain Explicit

A displayed price should use the store-provided localized representation and explicit billing context.

Synthetic Brazilian-price example:

```text
R$ 9,90 por mês
```

This is a learning example only.

It is not an approved Nexio price.

---

## Nexio Must Not Convert Store Prices

Nexio should display the price returned for the user's current store context.

It must not independently convert:

```text
R$ 9,90
```

into another Currency or claim exchange-rate equivalence.

---

## Purchase Initiation Is Not Purchase Completion

These states are distinct:

```text
Purchase screen opened

Purchase initiated

Provider UI opened

Purchase pending

Provider acknowledged

Purchase verified

Entitlement granted
```

---

## Provider Success Must Be Verified

Client-side purchase-success callbacks must not become the sole authority for premium access.

Verification should include an approved provider or backend trust path.

---

## Entitlements Are Canonical Access Rights

Nexio should grant Product access through a canonical entitlement model.

UI code must not determine premium access solely from:

- A local boolean
- A hidden setting
- A client callback
- A Product-screen route
- An Advertisement state
- A stale cached receipt

---

## Billing State and Entitlement State Are Distinct

Example:

```text
Subscription:
Cancelled

Entitlement:
Active until the paid period ends
```

Cancellation does not necessarily mean immediate access loss.

---

## Expiration Must Be Authoritative

Nexio should not revoke access merely because:

- The device is offline
- A provider request timed out
- A cached expiration could not be refreshed
- A Push Notification failed

---

## Access Must Degrade Safely

When billing verification is temporarily unavailable:

- Preserve verified cached entitlement for the approved bounded period.
- Avoid granting unverified permanent access.
- Avoid immediate destructive revocation.
- Keep user financial data accessible.
- Explain the verification state accurately.

---

## Billing Failures Must Not Delete Data

Expiration, cancellation, refund or billing failure must not delete:

- Accounts
- Transactions
- Transfers
- Goals
- Reports
- Attachments
- Exports
- Owner preferences

Feature access may change according to policy.

User records remain preserved.

---

## Downgrade Must Preserve Existing State

When a paid capability becomes unavailable:

- Preserve created data.
- Avoid destructive automatic conversion.
- Avoid silent deletion.
- Provide read-only access where appropriate.
- Explain which future actions are unavailable.
- Offer Export where relevant.

---

## Premium Data Must Remain Recoverable

Data created through a paid feature should not become permanently inaccessible after expiration.

Example:

```text
Advanced Report configuration:
May become read-only

Underlying Transactions:
Remain available
```

---

## Restore Purchases Must Be Available

Where the platform supports restorable purchases, Nexio should provide:

```text
Restore purchases
```

or the provider-appropriate equivalent.

The user should not be required to purchase again merely because:

- The application was reinstalled
- The device changed
- Local application data was cleared
- The owner signed in again

---

## Restore Does Not Change Ownership

A restored purchase must be linked only after:

- Provider verification
- Current owner authorization
- Store-account context validation
- Product-mapping validation

A purchase must not be silently attached to the wrong Nexio owner.

---

## Duplicate Purchase Prevention Is Required

Nexio should avoid offering the same active subscription repeatedly.

Before initiating a purchase:

- Read current entitlement.
- Read known provider state.
- Check pending purchase state.
- Check active replacement or upgrade path.
- Explain existing access.

---

## Pending Purchases Must Be Visible

A pending purchase must not be reported as:

```text
Premium active
```

until the provider and verification contract permit entitlement granting.

---

## Acknowledgment Must Be Governed

When a provider requires acknowledgment or consumption, the process must:

- Preserve purchase identity.
- Be idempotent.
- Be retryable.
- Avoid duplicate entitlement.
- Avoid loss after client interruption.

---

## Purchase Tokens Are Sensitive

Purchase tokens, receipts, order references and provider credentials must:

- Remain protected
- Avoid ordinary logs
- Avoid Analytics
- Avoid AI prompts
- Avoid user-facing raw display
- Be owner- and provider-scoped
- Be revocable or invalidated where applicable

---

## Store Account and Nexio Owner Are Distinct

The billing-provider account may not be identical to the Nexio owner identity.

Nexio must define how a verified purchase becomes associated with one Nexio owner.

---

## Account Switching Requires Entitlement Revalidation

After switching Nexio owners:

- Clear prior-owner entitlement state from memory.
- Load new-owner entitlements.
- Avoid showing prior-owner premium access.
- Revalidate pending purchase ownership.
- Revalidate Advertising state.

---

## Sign-Out Must Clear Premium Context

After Sign-out:

- Hide owner-specific plan status.
- Clear protected purchase details from memory.
- Require Authentication before purchase management.
- Avoid exposing purchase history to the next owner.

---

## Account Deletion Must Not Be Blocked by Subscription

An active subscription must not prevent Nexio Account deletion.

The user should receive clear information that:

```text
Deleting the Nexio Account may not automatically cancel a subscription managed by an external store.
```

The exact behavior must match the active provider and Product policy.

---

## Subscription Cancellation and Account Deletion Are Separate

Nexio must distinguish:

```text
Cancel subscription

Delete Nexio Account
```

Neither action should be described as automatically completing the other unless technically and contractually verified.

---

## Advertising Must Be Visually Distinct

Advertisements must be clearly recognizable as separate from:

- Financial records
- Reports
- Assistant answers
- Security alerts
- Synchronization warnings
- Account deletion
- Support messages
- Product recommendations

---

## Advertising Must Not Influence Product Truth

Advertising must not change:

- Balances
- Reports
- Transaction ordering
- Goal calculations
- Assistant factual output
- Error severity
- Support priority
- Account deletion access

---

## Advertising Must Not Use Exact Financial Content

Advertising requests and targeting must not include:

```text
Exact balances

Exact Transaction Amounts

Transaction descriptions

Account names

Goal names

Export content

Support-case content

Assistant prompts

Account deletion state
```

---

## Advertising Must Not Target Financial Vulnerability

Nexio must not target or personalize Advertising based on inferred:

- Debt
- Financial distress
- Low balance
- Overspending
- Salary
- Medical spending
- Legal spending
- Relationship status inferred from Transactions
- Other sensitive financial patterns

---

## Advertising Must Not Masquerade as Advice

An Advertisement must not be presented as:

- Nexio financial advice
- A required Account action
- A Security warning
- A synchronization correction
- A guaranteed financial result

---

## Ads Must Not Interrupt Critical Journeys

Advertisements must not appear inside or block:

- Authentication
- Password recovery
- Transaction confirmation
- Transfer confirmation
- Conflict resolution
- Import confirmation
- Export download
- Privacy controls
- Account deletion
- Security response
- Support escalation

---

## Ads Must Respect Layout and Accessibility

Advertising must:

- Be labeled
- Preserve focus order
- Avoid accidental taps
- Avoid layout shift
- Have sufficient separation
- Avoid color-only identification
- Avoid autoplaying disruptive media
- Respect reduced motion
- Avoid covering Product controls

---

## Ads Must Fail Closed

When the Advertising provider fails:

- Hide the Advertisement slot or show a neutral Product-safe fallback.
- Do not block core Product use.
- Do not retry aggressively.
- Do not display raw provider errors.
- Do not replace Product content with an empty broken frame.

---

## Ad Removal Must Be Deterministic

When an owner has an active ad-free entitlement:

- Ads should stop according to the approved propagation window.
- Existing ad containers should disappear safely.
- No hidden ad requests should continue unnecessarily.
- The state should apply across supported owner devices.

---

## Paid Access Must Not Remove Required Privacy Choices

A subscription must not:

- Force optional Analytics
- Force personalized Advertising
- Force Assistant history
- Remove Privacy settings
- Remove data Export
- Remove Account deletion

---

## Free Access Must Not Require Personalized Advertising

Where Advertising supports the free plan, the user should not be forced into personalized targeting when a nonpersonalized or otherwise compliant path is required and technically available.

---

## Promotional Claims Must Be Verifiable

Do not claim:

```text
Save more Money

Improve your financial health

Guaranteed control

Best finance application

Bank-level security
```

without approved evidence and appropriate qualification.

---

## Trials Must Be Explicit

Before starting a trial, display:

```text
Trial duration

Price after trial

Billing period after trial

Renewal behavior

Cancellation method

Eligibility limitations

Provider authority
```

---

## Trial Eligibility Must Be Provider-Verified

The UI should not promise a trial until the provider confirms the offer is eligible for the current store context.

---

## Trial Conversion Must Not Be Hidden

Do not conceal that a trial becomes a paid subscription where applicable.

---

## Promotions Must Not Alter Product Truth

A promotional plan may change access.

It must not change financial calculations, records or owner identity.

---

## Discounts Must Use Provider Authority

Displayed discount, introductory pricing and billing periods should derive from active provider data.

Nexio must not calculate or invent a discount percentage when the provider does not support the claim.

---

## Cancellation Must Be Easy to Find

Nexio should provide a clear route to:

```text
Manage subscription
```

or provider-appropriate management.

The route must not use deceptive navigation.

---

## Cancellation Must Not Use Dark Patterns

Prohibited:

- Hidden cancellation
- Repeated guilt messages
- Forced surveys
- Misleading button hierarchy
- False loss claims
- Artificial countdown
- Requiring unrelated Support contact

---

## Access after Cancellation Must Be Explained

Example:

```text
Your subscription is cancelled and remains active until the current paid period ends.
```

Use only when verified.

---

## Refund Authority Must Be Clear

Nexio should distinguish whether a refund is managed by:

- Google Play
- Another store
- Nexio
- A payment processor
- Support under an approved policy

---

## Refund Does Not Automatically Describe Entitlement Timing

The provider's refund state and Nexio entitlement revocation must be reconciled.

---

## Chargebacks Require Controlled Handling

A chargeback or payment reversal may affect entitlement.

It must not:

- Delete user data
- Expose payment details
- Block Privacy controls
- Block Account deletion
- Trigger abusive communication

---

## Monetization Must Remain Region-Aware

Plans, offers, taxes, availability and provider methods may vary by region.

Nexio should not promise global availability without verified support.

---

## Accessibility Must Not Be a Premium Upgrade

Accessibility support required for core Product use must remain available regardless of plan.

---

## Security Must Not Be a Premium Upgrade

Required Security controls must not depend on subscription level.

---

## Privacy Must Not Be a Premium Upgrade

Required Privacy rights and controls must remain available regardless of plan.

---

## Reliability Must Not Be Intentionally Reduced for Free Users

The free plan may include capability limits.

It must not intentionally introduce:

- Data corruption
- Weaker owner isolation
- Lower financial accuracy
- Unsafe synchronization
- Missing recovery
- Broken Account deletion

---

## Feature Limits Must Be Explicit

A free or paid plan may define limits such as:

```text
Number of advanced Reports

Number of active Goals

Attachment storage

Automation frequency

Assistant usage

Export format availability
```

Limits must be:

- Documented
- Measurable
- Owner-scoped
- Enforced consistently
- Safe at the boundary
- Non-destructive after downgrade

---

## Limits Must Not Silently Delete Excess State

When a user exceeds a lower-plan limit after downgrade:

- Preserve existing items.
- Mark excess items read-only or inactive where appropriate.
- Explain how new creation is limited.
- Avoid automatic deletion.

---

## Monetization Must Be Reversible

Nexio should be able to:

- Disable a plan
- Disable a product
- Disable a promotion
- Disable Advertising
- Disable a billing provider
- Revoke an unsafe template
- Roll back a paywall
- Preserve user data

---

## Monetization Experiments Must Be Bounded

Experiments may test:

- Plan presentation
- Neutral feature descriptions
- Offer ordering
- Pricing-page layout
- Advertisement placement outside critical journeys

Experiments must not vary:

- Financial correctness
- Privacy rights
- Account deletion access
- Security
- Accessibility
- Purchase verification
- Refund truth
- Cancellation accessibility

---

## AI Must Not Determine Financial Eligibility

AI must not independently decide:

- Which user should see a higher price
- Who is financially vulnerable
- Who should receive a discount
- Who can afford a subscription
- Which plan a user needs based on private Transactions

---

# Monetization Capability Scope

This document governs:

```text
Free plan

Paid subscription plans

Ad-supported access

Ad-free entitlement

Free trials

Introductory offers

Promotional entitlements

One-time purchases

Store-managed purchases

Web billing where separately approved

Purchase verification

Entitlement persistence

Restore purchases

Upgrade and downgrade

Cancellation

Expiration

Refund

Chargeback

Advertising requests

Advertisement placement

Advertising Privacy

Monetization Analytics

Support and Incident response
```

---

# Out-of-Scope Capabilities

Unless separately approved, this document does not authorize:

- Lending
- Credit decisions
- Insurance recommendations
- Investment sales
- Gambling
- Cryptocurrency sales
- Payment initiation
- Financial-product commissions based on private records
- Dynamic pricing based on financial behavior
- Selling financial data
- Sharing user Transactions with advertisers
- Unverified external checkout
- Direct handling of payment-card credentials by Nexio

---

# Monetization Model Architecture

Potential monetization models:

```text
free

ad_supported

freemium

subscription

one_time_purchase

provider_sponsored

enterprise

promotional
```

Only approved active models should appear in Product.

---

# Free Model

The free plan may provide:

- Core financial recording
- Basic Accounts
- Basic Transactions
- Basic Reports
- Privacy controls
- Export
- Account deletion
- Support access

Actual scope requires a Product decision.

---

# Ad-Supported Model

An ad-supported plan may display approved Advertising.

It must preserve:

- Core Product use
- Nonpersonalized path where required
- Critical-flow exclusion
- Ad labeling
- Privacy controls
- Ad-free entitlement behavior

---

# Freemium Model

Freemium provides core features without payment and reserves defined enhancements for paid access.

The boundary must be capability-based rather than safety-based.

---

# Subscription Model

A subscription grants access for an active governed period.

Potential periods:

```text
monthly

annual
```

Only provider-configured periods should be displayed.

---

# One-Time Purchase

A one-time purchase may grant:

```text
permanent capability

consumable quota

nonconsumable feature
```

The access semantics must be explicit.

---

# Provider-Sponsored Model

A provider may sponsor a capability.

This must not allow the provider to access private financial records beyond the approved contract.

---

# Promotional Entitlement

A promotional entitlement may be granted through:

- Approved campaign
- Support correction
- Partner program
- Migration
- Incident compensation
- Internal testing

Every grant requires:

- Reason
- Owner
- Scope
- Start
- Expiration
- Authority
- Audit

---

# Monetization Product Catalogue

Nexio should maintain a canonical catalogue independent from provider-specific product identifiers.

---

# Product Catalogue Record

Recommended fields:

```text
productId

displayName

productType

planId

billingPeriod

capabilities

limits

trialPolicy

offerPolicy

supportedPlatforms

supportedRegions

providers

entitlementIds

status

introducedAt

deprecatedAt

owner
```

---

# Product Identifier

Recommended:

```text
MON-PRODUCT-<NUMBER>
```

Example:

```text
MON-PRODUCT-001
```

---

# Product Types

Recommended:

```text
subscription

nonconsumable

consumable

promotional

internal
```

---

# Product Status

Recommended:

```text
draft

approved

active

limited

paused

deprecated

retired
```

---

# Plan Architecture

A plan groups Product capabilities and limits.

---

# Plan Record

Recommended fields:

```text
planId

name

tier

capabilities

limits

adPolicy

SupportLevel

ExportPolicy

AssistantPolicy

platforms

regions

status

version

owner
```

---

# Potential Plan Tiers

Synthetic structure:

```text
Free

Premium
```

Additional tiers require Product justification.

Avoid creating unnecessary complexity.

---

# Plan Capability Record

Potential:

```text
capabilityId

accessMode

limit

resetPeriod

overageBehavior

downgradeBehavior
```

---

# Access Modes

Recommended:

```text
enabled

disabled

limited

read_only

trial

promotional
```

---

# Limit Types

Potential:

```text
count

storage

frequency

duration

format

provider

history_window
```

---

# Limit Reset Period

Potential:

```text
none

daily

weekly

monthly

billing_period
```

The reset rule must be explicit.

---

# Limit Enforcement Boundary

Limits should be enforced by an Application or Entitlement service.

UI-only hiding is insufficient.

---

# Limit-Reached State

Example:

```text
You reached the current plan limit for this capability.

Existing records remain available.

Upgrade or remove an eligible item before creating another one.
```

Do not use fear or shame.

---

# Limit Unknown State

When entitlement or usage cannot be verified:

```text
Nexio is checking your current plan access.

Existing financial records remain available.
```

Avoid granting destructive commands based on uncertain limits.

---

# Entitlement Architecture

An entitlement represents one owner-scoped right to use a capability.

---

# Entitlement Record

Recommended fields:

```text
entitlementId

ownerId

capabilityId

sourceType

sourceId

providerId

providerProductId

purchaseReference

state

startsAt

endsAt

graceEndsAt

verifiedAt

verificationVersion

revokedAt

revocationReason

createdAt

updatedAt
```

---

# Entitlement Sources

Recommended:

```text
free_plan

subscription

one_time_purchase

trial

promotion

Support_grant

migration

internal_test
```

---

# Entitlement State

Recommended:

```text
inactive

pending

active

grace

on_hold

paused

expired

revoked

refunded

chargeback

unknown
```

---

# `inactive`

No active access exists.

---

# `pending`

Purchase or grant exists but is not yet fully verified or effective.

---

# `active`

The capability is currently available.

---

# `grace`

Temporary access continues during an approved billing-recovery period.

---

# `on_hold`

Billing requires action and access behavior follows the approved plan policy.

---

# `paused`

The provider or user paused the subscription where supported.

---

# `expired`

The active access period ended.

---

# `revoked`

Access was administratively or operationally removed through an approved authority.

---

# `refunded`

A provider-confirmed refund affects the purchase and associated access according to policy.

---

# `chargeback`

The payment was reversed or disputed.

---

# `unknown`

Nexio cannot currently establish the authoritative entitlement result.

---

# Entitlement State Precedence

When several entitlement sources grant the same capability, effective access should use an explicit precedence or union policy.

Potential:

```text
Any active valid entitlement grants access.
```

Revocation of one source must not remove access granted by another active source.

---

# Effective Entitlement

A derived effective entitlement may include:

```text
capabilityId

effectiveState

sources

effectiveStart

effectiveEnd

verificationFreshness

limitations
```

---

# Entitlement Evaluation

Before gated actions:

```text
Read current owner.

Read active entitlement records.

Validate capability.

Validate current time.

Validate provider state where required.

Apply grace or hold policy.

Apply plan limits.

Return an explicit access decision.
```

---

# Access Decision States

Recommended:

```text
allowed

allowed_limited

allowed_read_only

verification_pending

limit_reached

not_entitled

provider_unavailable

owner_invalid

capability_unavailable
```

---

# Entitlement Cache

A local cache may improve offline use.

It must include:

```text
ownerId

capabilityId

state

verifiedAt

validUntil

sourceVersion

signature or integrity evidence where applicable
```

---

# Cached Entitlement Rules

The cache must:

- Be owner-scoped.
- Expire.
- Be invalidated after Account switching.
- Be invalidated after Sign-out where appropriate.
- Not become permanent purchase authority.
- Be reconciled after reconnecting.

---

# Offline Premium Access

An approved offline policy should define:

```text
How long verified access remains valid offline

Which capabilities operate offline

Which provider actions require a connection

What happens after the cache expires
```

---

# Offline Access Expiration

When cached verification expires:

```text
Nexio needs to verify your subscription before enabling new premium actions.

Existing financial records remain available.
```

Read-only access may remain where appropriate.

---

# Store Product Mapping

Canonical Nexio products should map to provider products.

---

# Provider Product Mapping Record

Recommended fields:

```text
mappingId

providerId

platform

region

canonicalProductId

providerProductId

basePlanId

offerId

entitlementIds

status

introducedAt

deprecatedAt
```

---

# Google Play Mapping

Potential provider fields may include:

```text
productId

basePlanId

offerId
```

The exact implementation should follow the active billing integration.

---

# Provider Product Status

Recommended:

```text
configured

active

unavailable

misconfigured

deprecated

removed
```

---

# Missing Product Mapping

When no valid mapping exists:

```text
This plan is temporarily unavailable for purchase.

Existing entitlements remain unchanged.
```

Do not display a broken purchase button.

---

# Billing Provider Architecture

Every billing provider must remain behind an Adapter.

---

# Billing Provider Adapter Responsibilities

Potential operations:

```text
loadProducts

loadOffers

startPurchase

restorePurchases

queryPurchases

verifyPurchase

acknowledgePurchase

consumePurchase

openSubscriptionManagement

processProviderEvent

healthCheck
```

---

# Provider Adapter Prohibition

The Adapter must not:

- Directly modify financial records
- Select a Nexio owner implicitly
- Store raw secrets in ordinary logs
- Grant Product access without entitlement authority
- Display unverified prices
- Delete user data after expiration
- Control Account deletion access

---

# Billing Provider Registry

Recommended fields:

```text
providerId

name

platforms

regions

productTypes

Adapter

SDKs

APIversions

authentication

verificationMethod

webhooks

acknowledgmentPolicy

refundSignals

cancellationSignals

gracePolicy

holdPolicy

retention

deletionBehavior

killSwitch

exitPlan

owner

status
```

---

# Billing Provider Status

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

# Purchase Architecture

Every purchase attempt should have a stable identity.

---

# Purchase Attempt Record

Recommended fields:

```text
purchaseAttemptId

ownerId

providerId

canonicalProductId

providerProductId

basePlanId

offerId

platform

state

startedAt

updatedAt

providerReference

verificationState

acknowledgmentState

entitlementResult

failureCategory
```

---

# Purchase Attempt State

Recommended:

```text
created

Product_loading

ready

provider_opening

pending

purchased_unverified

verifying

verified

acknowledging

completed

cancelled

failed_retryable

failed_final

unknown_outcome
```

---

# `created`

A purchase attempt identity exists.

---

# `Product_loading`

The provider Product and current price are being loaded.

---

# `ready`

The current provider configuration and offer are eligible for display.

---

# `provider_opening`

The provider purchase interface is being opened.

---

# `pending`

The provider reports a purchase awaiting completion.

---

# `purchased_unverified`

The client received a purchase result that has not completed trusted verification.

---

# `verifying`

Nexio is checking purchase authenticity and Product mapping.

---

# `verified`

Purchase authenticity and mapping passed.

Entitlement may still require final acknowledgment or processing.

---

# `acknowledging`

Required provider acknowledgment is in progress.

---

# `completed`

The verified purchase produced the expected entitlement result.

---

# `cancelled`

The user or provider cancelled the flow without a completed purchase.

---

# `failed_retryable`

A temporary failure permits safe continuation.

---

# `failed_final`

The current attempt cannot continue.

---

# `unknown_outcome`

Nexio cannot determine whether the provider completed the purchase.

Do not initiate a second purchase automatically.

---

# Purchase Identity and Idempotency

The same provider purchase must not produce:

- Multiple entitlements
- Multiple owner links
- Multiple acknowledgment attempts with conflicting results
- Multiple Support corrections

---

# Provider Purchase Reference

A verified provider purchase reference should be unique within its provider scope.

---

# Purchase Verification Architecture

Verification should confirm:

```text
Provider

Application identity

Product identity

Purchase state

Purchase reference

Current validity

Acknowledgment requirement

Replacement or upgrade relationship

Refund or revocation state

Owner association
```

---

# Client-Only Verification Prohibition

A client callback alone is insufficient for durable premium authority where a more trusted verification path is available.

---

# Verification State

Recommended:

```text
not_started

pending

verified

invalid

revoked

expired

unknown
```

---

# Invalid Purchase

Potential reasons:

```text
Unknown Product

Wrong application

Invalid signature or token

Already linked incompatibly

Refunded

Cancelled before effectiveness

Test purchase outside approved environment

Malformed provider response
```

---

# Unknown Verification

When provider verification is unavailable:

```text
Nexio is checking the purchase.

Do not purchase the same plan again yet.
```

---

# Purchase Acknowledgment

When required, acknowledgment should occur only after valid purchase verification.

---

# Acknowledgment State

Recommended:

```text
not_required

pending

acknowledged

failed_retryable

failed_final

unknown
```

---

# Acknowledgment Retry

Retry should preserve:

```text
purchaseAttemptId

provider purchase reference

acknowledgment operation identity
```

---

# Acknowledgment Failure

A temporary acknowledgment failure should not create another purchase.

Operations and Support should receive a recoverable state.

---

# Restore Purchases Architecture

Restore should:

```text
Query current provider purchases

↓

Verify each purchase

↓

Map provider products

↓

Resolve current Nexio owner

↓

Detect existing entitlement links

↓

Create or update canonical entitlements

↓

Reconcile expiration, refund and cancellation

↓

Show a complete result summary
```

---

# Restore Result States

Potential:

```text
restored

already_active

pending

not_found

linked_to_current_owner

ownership_review_required

invalid

provider_unavailable
```

---

# No Purchases Found

```text
No eligible purchases were found for the current store account.

Your Nexio financial records were not changed.
```

---

# Existing Active Purchase

```text
Your current purchase is already active for this Nexio Account.
```

---

# Ownership Review

When a purchase may already be associated with another Nexio owner:

```text
Nexio could not attach this purchase automatically.

Review the Account and purchase ownership through the approved Support process.
```

Do not reveal another owner's identity.

---

# Subscription Architecture

A subscription represents provider-managed recurring billing linked to one canonical Product and entitlement set.

---

# Subscription Record

Recommended fields:

```text
subscriptionId

ownerId

providerId

canonicalProductId

providerProductId

basePlanId

offerId

purchaseReference

state

startedAt

currentPeriodStart

currentPeriodEnd

autoRenewState

cancelledAt

graceEndsAt

holdStartedAt

pausedUntil

verifiedAt

updatedAt
```

---

# Subscription State

Recommended:

```text
pending

active

cancelled_active

grace

on_hold

paused

expired

refunded

chargeback

revoked

unknown
```

---

# `pending`

The recurring purchase is not fully effective.

---

# `active`

Current verified paid access exists.

---

# `cancelled_active`

Renewal is cancelled, but the paid access period remains active.

---

# `grace`

The provider permits temporary access while billing recovery occurs.

---

# `on_hold`

Payment recovery requires action and access follows the approved policy.

---

# `paused`

The subscription is paused where supported.

---

# `expired`

The paid period ended.

---

# `refunded`

The provider confirmed a refund affecting the subscription.

---

# `chargeback`

A payment reversal or dispute affects access.

---

# `revoked`

The subscription was invalidated through an approved provider or administrative authority.

---

# `unknown`

The authoritative current state cannot be established.

---

# Auto-Renew State

Recommended:

```text
enabled

disabled

unknown

not_applicable
```

---

# Cancellation Date versus Expiration Date

These must remain distinct.

Example:

```text
Cancelled:
15/08/2026

Access until:
31/08/2026
```

Use actual provider values when presented.

---

# Grace Period Architecture

Grace behavior should derive from the provider and Product policy.

Potential access decision:

```text
Subscription state:
grace

Premium entitlement:
temporarily active
```

---

# Account Hold Architecture

During hold:

- Preserve user data.
- Explain billing action.
- Avoid repeated purchase prompts.
- Keep subscription management accessible.
- Apply Product capability policy without affecting core financial safety.

---

# Pause Architecture

Where supported:

- Record pause start and expected resume state.
- Explain access behavior.
- Reverify after the pause.
- Avoid deleting premium-created state.

---

# Expiration Architecture

Expiration should:

```text
Recalculate effective entitlements

↓

Stop new paid-only actions where applicable

↓

Preserve existing data

↓

Apply read-only or limit policy

↓

Remove ad-free access where applicable

↓

Update Product UI

↓

Provide subscription management and Export
```

---

# Refund Architecture

A refund event should:

- Verify provider authority.
- Identify the purchase.
- Recalculate entitlement.
- Preserve user data.
- Update plan status.
- Record the reason category where available.
- Avoid exposing payment details.

---

# Chargeback Architecture

A chargeback should:

- Be treated as a provider financial state.
- Not create a Nexio Transaction automatically.
- Not delete Product records.
- Not prevent Account deletion.
- Not trigger shaming communication.

---

# Upgrade and Downgrade Architecture

Plan transitions require explicit mapping.

---

# Plan Change Record

Recommended fields:

```text
planChangeId

ownerId

providerId

fromProductId

toProductId

changeType

effectivePolicy

providerReference

state

requestedAt

effectiveAt

completedAt
```

---

# Change Types

Recommended:

```text
upgrade

downgrade

replacement

crossgrade

cancel_and_repurchase
```

---

# Effective Policies

Potential:

```text
immediate

next_billing_period

provider_determined
```

Nexio must not promise timing the provider does not support.

---

# Upgrade

An upgrade may grant access immediately or according to the provider's rules.

The UI should show the provider-returned offer and effective behavior.

---

# Downgrade

A downgrade may take effect at the next billing period.

Existing premium data must remain preserved.

---

# Replacement Purchase

A new subscription may replace another provider purchase.

Nexio must link the relationship to prevent duplicate active entitlement interpretation.

---

# Trial Architecture

A trial is an entitlement associated with an eligible provider offer or approved Nexio promotion.

---

# Trial Record

Recommended fields:

```text
trialId

ownerId

source

ProductId

state

startsAt

endsAt

conversionProductId

providerEligibility

cancelledAt

convertedAt
```

---

# Trial State

Recommended:

```text
eligible

started

active

cancelled_active

converted

expired

revoked

unknown
```

---

# Trial Presentation

Before activation:

```text
Trial length

Price after trial

Billing period

Renewal behavior

Cancellation route

Offer eligibility
```

---

# Trial Reminder

Optional trial reminders must follow the Notifications specification.

They must avoid manipulative countdowns.

Preferred:

```text
Your trial is scheduled to end on the displayed Date.

Review your subscription through the store.
```

---

# Promotional Access Architecture

Promotional grants should use canonical entitlements.

---

# Promotion Record

Recommended fields:

```text
promotionId

campaignId

ownerId

ProductId

entitlementIds

startsAt

endsAt

grantReason

grantAuthority

state

createdAt

revokedAt
```

---

# Promotional State

Recommended:

```text
scheduled

active

expired

revoked

cancelled
```

---

# Support Promotional Grant

A Support-granted entitlement requires:

- Approved reason
- Named Agent
- Bounded duration
- Entitlement scope
- Audit
- Supervisor approval where required

---

# Permanent Manual Grant Prohibition

Permanent manual premium access should not be granted casually.

It requires a documented authority and lifecycle.

---

# Advertising Architecture

Advertising should be mediated through a canonical Advertising service and provider Adapter.

---

# Advertising Provider Responsibilities

Potential operations:

```text
initialize

loadAd

showAd

hideAd

destroyAd

updateConsentState

setPrivacyMode

healthCheck
```

---

# Advertising Service Responsibilities

The canonical service should:

```text
Evaluate owner entitlement

Evaluate plan ad policy

Evaluate Privacy choice

Evaluate region

Evaluate platform

Evaluate placement eligibility

Evaluate current Product journey

Select provider or suppress

Create a privacy-safe request

Return an explicit Ad state
```

---

# Ad Placement Registry

Every Advertisement placement should be registered.

---

# Placement Record

Recommended fields:

```text
placementId

screen

surface

format

supportedPlatforms

allowedPlans

excludedJourneys

minimumSpacing

refreshPolicy

privacyPolicy

AccessibilityRequirements

owner

status
```

---

# Placement Identifier

Recommended:

```text
AD-PLACEMENT-<NUMBER>
```

---

# Placement Status

Recommended:

```text
draft

approved

active

limited

paused

deprecated

removed
```

---

# Approved Ad Formats

Potential:

```text
banner

native

interstitial

rewarded
```

Each format requires separate Product approval.

---

# Banner Advertisement

May appear in approved noncritical surfaces.

It must not:

- Cover Product controls
- Cause repeated layout shifts
- Appear as a financial card
- Be inserted into Transaction history ambiguously

---

# Native Advertisement

A native Advertisement must remain explicitly labeled.

Its visual similarity to Product content must not create confusion.

---

# Interstitial Advertisement

Interstitials are highly disruptive.

They should not appear:

- On Product startup before access
- During financial entry
- After every Transaction
- Before Export
- Before Account deletion
- During error recovery

Any use requires enhanced review.

---

# Rewarded Advertisement

A rewarded Advertisement may grant an optional bounded noncritical benefit.

It must not be required for:

- Accessing financial data
- Correcting records
- Export
- Privacy
- Account deletion
- Security
- Accessibility

---

# Ad Eligibility Decision

Recommended states:

```text
eligible

suppressed_entitlement

suppressed_privacy

suppressed_critical_journey

suppressed_region

suppressed_platform

suppressed_provider

suppressed_frequency

suppressed_offline

unavailable
```

---

# Ad-Free Entitlement

An active ad-free entitlement should override eligible Advertisement placements.

---

# Ad-Free Verification Pending

When ad-free entitlement verification is temporarily unavailable:

```text
Prefer preserving the last verified ad-free state for the approved bounded period.
```

Avoid suddenly showing Ads because of a provider timeout.

---

# Advertising Consent and Privacy

Advertising preference should remain separate from:

- Push permission
- Product Analytics
- Assistant history
- Subscription purchase
- Terms acceptance

---

# Advertising Request Data

Allowed data should be minimized.

Potential:

```text
Application identifier

Placement identifier

Platform

Coarse region where required

Consent state

Nonfinancial contextual screen category where approved
```

---

# Prohibited Advertising Request Data

```text
Exact Amount

Balance

Transaction type derived from private records

Transaction description

Account name

Goal details

Report totals

Export metadata

Support content

Assistant prompt

Deletion state

Authentication identifier beyond provider-safe technical requirements
```

---

# Contextual Advertising Boundary

An Advertisement may be selected based on a broad nonfinancial Product surface only when approved.

Example:

```text
General Dashboard placement
```

It must not use the user's Dashboard values.

---

# Ad Refresh Architecture

Refresh should be bounded.

It must respect:

- Provider policy
- Visibility
- User interaction
- Battery and bandwidth
- Frequency limits
- Reduced motion
- Ad-free entitlement
- Privacy change
- Account switching

---

# Ad Viewability

Nexio should not repeatedly request or count Ads that are not meaningfully viewable.

---

# Ad Click Boundary

Advertisement clicks should:

- Be handled by the provider or approved browser path.
- Avoid transmitting Nexio financial context.
- Avoid modifying Product financial state.
- Return safely to Nexio.
- Avoid open redirects controlled by Nexio.

---

# Advertisement Failure State

Preferred behavior:

```text
Hide the unavailable Advertisement area.

Preserve the Product layout.

Do not show a raw provider error.
```

---

# Ad Provider Initialization

Initialization should occur only after:

- Configuration
- Applicable Privacy state
- Applicable entitlement state
- Platform support
- Provider availability

Do not initialize unnecessarily for ad-free owners when the architecture can avoid it.

---

# Advertising Provider Registry

Recommended fields:

```text
providerId

name

platforms

regions

formats

SDKs

APIversions

dataCategories

consentIntegration

childDirectedConfiguration

testMode

productionConfiguration

retention

subprocessors

killSwitch

exitPlan

owner

status
```

---

# Advertising Provider Status

Recommended:

```text
evaluating

approved

active

limited

degraded

paused

deprecated

removing

removed
```

---

# Advertising Test Mode

Development and testing must use provider-approved test configuration.

Do not generate invalid Production Advertisement traffic during development.

---

# Production Ad Configuration

Production identifiers and credentials must:

- Remain environment-specific.
- Avoid source-code exposure where possible.
- Be validated before release.
- Be removable through a kill switch.

---

# Monetization UI Architecture

Potential surfaces:

```text
Plan comparison

Upgrade screen

Current plan screen

Subscription management

Restore purchases

Billing status

Trial offer

Limit-reached screen

Ad-free explanation

Advertisement placement
```

---

# Plan Comparison Screen

Should show:

```text
Current plan

Available plans

Included capabilities

Limits

Advertising policy

Provider-localized price

Billing period

Trial or offer details

Manage or purchase action

Restore purchases

Terms and Privacy links
```

---

# Plan Comparison Prohibitions

Do not:

- Hide the free plan
- Fabricate discounts
- Use false countdowns
- Mark a plan as required without basis
- Preselect an expensive plan deceptively
- Hide billing period
- Hide renewal
- Hide cancellation route

---

# Current Plan Screen

Should display:

```text
Plan name

Entitlement state

Provider

Billing period

Current-period end where verified

Auto-renew state

Cancellation state

Manage subscription

Restore purchases

Purchase history Support path
```

---

# Current Plan Unknown State

```text
Nexio is checking your current plan.

Existing financial records remain available.
```

---

# Upgrade Screen

Before purchase, show:

```text
Selected plan

Capabilities

Limits

Advertisement behavior

Provider-localized price

Billing period

Offer details

Renewal behavior

Manage and cancellation information
```

---

# Purchase Button

Preferred:

```text
Subscribe through Google Play
```

or provider-appropriate explicit language.

Avoid:

```text
Continue
```

as the final purchase action.

---

# Restore Purchases Action

Recommended:

```text
Restore purchases
```

It should remain visible without requiring another purchase attempt.

---

# Manage Subscription Action

Recommended:

```text
Manage subscription
```

Open the approved provider destination.

---

# Billing Error Content

A billing error should explain:

```text
What happened

Whether a purchase completed

Whether premium access changed

Whether a Retry is safe

Where to manage the purchase

Where to obtain Support
```

---

# Billing Error — Provider Unavailable

```text
Purchases are temporarily unavailable

Nexio could not reach the billing provider.

Your current plan and financial records were not changed.
```

---

# Billing Error — Unknown Outcome

```text
Nexio is checking the purchase result

Do not purchase the same plan again yet.

Your current access remains unchanged until verification completes.
```

---

# Billing Error — Product Unavailable

```text
This plan is not currently available through your store.

Existing entitlements remain unchanged.
```

---

# Billing Error — Purchase Cancelled

```text
Purchase cancelled

No new subscription was activated through this attempt.
```

Use only when the provider confirms cancellation.

---

# Billing Error — Verification Failed

```text
Nexio could not verify this purchase

Premium access was not granted from this attempt.

Review your store purchase state or contact Support.
```

---

# Entitlement User Experience

Gated UI should distinguish:

```text
Premium capability

Plan limit

Verification pending

Provider unavailable

Read-only after downgrade

Unavailable capability
```

---

# Premium Capability Message

```text
This capability is included in the Premium plan.

Your existing Nexio financial records remain available.
```

---

# Read-Only Downgrade Message

```text
This configuration is now read-only under the current plan.

Your existing data has not been deleted.
```

---

# Plan Limit Message

```text
You reached the current plan limit.

Existing items remain available.

Review your plan or remove an eligible item before creating another one.
```

---

# Advertising Label

Recommended localized Product content should clearly identify:

```text
Advertisement

Sponsored
```

The exact displayed term should follow the approved locale glossary and provider requirements.

---

# Advertising Separation

Use visual and semantic separation such as:

- Label
- Container boundary
- Accessible role or text
- Spacing
- Nonfinancial placement
- Distinct actions

---

# Advertisement Accessibility

Required:

```text
□ Advertisement is identified to screen readers.

□ Product controls remain reachable.

□ Focus does not enter hidden Advertisement elements.

□ Advertisement close action is labeled where provided.

□ Content does not flash excessively.

□ Motion respects applicable settings.

□ The Advertisement does not trap keyboard focus.

□ Layout remains usable at large text sizes.
```

---

# Purchase Accessibility

Required:

```text
□ Plan names are headings or clearly grouped.

□ Prices include billing periods.

□ Trial terms are readable.

□ Purchase actions have explicit labels.

□ Restore purchases is accessible.

□ Manage subscription is accessible.

□ Loading and pending states are announced.

□ Errors receive focus or an accessible summary.

□ No plan distinction relies only on color.

□ Screen-reader users can compare capabilities.
```

---

# Monetization Privacy Architecture

Data categories may include:

```text
Plan state

Entitlement state

Provider Product

Purchase reference

Billing period

Trial state

Advertising preference

Ad-free state

Ad placement events

Support billing case
```

---

# Payment-Card Data

Nexio should not directly process or store full payment-card credentials unless a separately approved payment architecture exists.

Store-managed billing should remain within the provider flow.

---

# Purchase History Data

Purchase history should be:

- Owner-scoped
- Provider-scoped
- Purpose-limited
- Protected
- Retained according to policy
- Included in Account deletion analysis

---

# Advertising Identifiers

Advertising identifiers and provider identifiers should be:

- Minimized
- Classified
- Preference-aware
- Removed or reset after withdrawal where required
- Processed during Account deletion
- Excluded from financial Domain state

---

# Account Deletion Architecture

Account deletion should address:

```text
Active subscriptions

One-time purchases

Entitlements

Purchase-attempt history

Provider links

Advertising identifiers

Advertising preferences

Promotional grants

Trial state

Support billing cases

Required suppression or audit evidence
```

---

# Account Deletion Preconfirmation

Where an external subscription may remain:

```text
Your Nexio Account can be deleted.

An external store subscription may require separate cancellation through the store.
```

---

# Account Deletion with Active Entitlement

Deletion should:

- Restrict Product access.
- Stop Advertising.
- Stop marketing.
- Stop optional monetization communication.
- Remove owner-specific entitlements from active Product use.
- Preserve only required purchase evidence.
- Avoid creating another owner automatically.

---

# Recreated Nexio Account

A newly created owner should not automatically inherit a deleted owner's entitlement without an approved restore and ownership-association process.

---

# Monetization Security Architecture

Threats include:

```text
Fake purchase callback

Token theft

Receipt replay

Duplicate entitlement

Cross-owner purchase attachment

Client-side premium flag modification

Provider webhook forgery

Refund event loss

Acknowledgment failure

Product mapping manipulation

Ad SDK data leakage

Malicious ad deep link

Test Product in Production

Production Product in test environment
```

---

# Purchase Verification Security

Verification should validate:

- Provider authenticity
- Application or package identity
- Product mapping
- Purchase state
- Purchase uniqueness
- Current owner association
- Provider environment
- Revocation state

---

# Webhook Security

Provider events should verify:

```text
Signature

Timestamp

Replay protection

Provider identity

Environment

Purchase reference

Allowed state transition
```

---

# Webhook Idempotency

Repeated events must not:

- Create duplicate entitlements
- Revoke unrelated entitlements
- Reopen expired subscriptions
- Attach a purchase to another owner
- Trigger repeated Support actions

---

# Client Tampering Resistance

Premium access must not rely solely on:

```text
localStorage.premium = true
```

or equivalent client-editable state.

---

# Environment Separation

Test and Production should use separate:

- Product identifiers where applicable
- Provider configuration
- Webhooks
- Credentials
- Analytics
- Ad configuration
- Test owners

---

# Test Purchase Isolation

Test purchases must not:

- Create Production revenue reports
- Grant uncontrolled permanent access
- Trigger real marketing
- Pollute Production Analytics
- Affect other owners

---

# Advertising SDK Security

The SDK should receive only approved data.

It must not gain direct access to:

- Local financial database
- Authentication secrets
- Export files
- Attachment storage
- Assistant history
- Support cases

---

# Monetization Analytics Architecture

Potential events:

```text
plan_viewed

Product_loaded

purchase_started

purchase_pending

purchase_verified

purchase_completed

purchase_cancelled

purchase_failed

restore_started

restore_completed

subscription_state_changed

entitlement_granted

entitlement_revoked

limit_reached

ad_requested

ad_loaded

ad_displayed

ad_failed

ad_clicked

ad_suppressed
```

---

# Prohibited Monetization Analytics Fields

```text
Exact balance

Transaction Amount

Transaction description

Account name

Goal name

Salary inference

Debt inference

Export content

Support-case content

Purchase token

Raw order identifier

Advertising identifier where not approved
```

---

# Monetization Outcome Metrics

Potential:

```text
verified_purchase_completion_rate

restore_success_rate

duplicate_purchase_prevention_rate

entitlement_propagation_success_rate

false_entitlement_grant_count

false_entitlement_revocation_count

cancellation_management_success_rate

ad_free_propagation_success_rate

Advertising_privacy_violation_count

critical_journey_ad_exposure_count

paywall_accessibility_failure_rate
```

---

# Safety Metrics

Targets should be zero for:

```text
Cross-owner entitlement

Duplicate billing caused by Nexio

False purchase completion

False permanent premium grant

False access revocation

Data deletion after downgrade

Advertising with exact financial content

Advertisement inside Account deletion

Blocked Export due to subscription expiration

Blocked Account deletion due to active subscription
```

---

# Revenue Is Not the Only Success Measure

A monetization system should also measure:

- Trust
- Cancellation accessibility
- Restore reliability
- Billing Support burden
- Advertisement complaint rate
- Privacy-choice success
- Accessibility
- Downgrade safety
- Data portability

---

# Monetization Registry Architecture

Recommended files:

```text
docs/monetization/
  PRODUCT-CATALOGUE.md
  PLAN-REGISTRY.md
  ENTITLEMENT-REGISTRY.md
  BILLING-PROVIDER-REGISTRY.md
  PROVIDER-PRODUCT-MAPPING.md
  AD-PLACEMENT-REGISTRY.md
  AD-PROVIDER-REGISTRY.md
  MONETIZATION-ERROR-REGISTRY.md
  MONETIZATION-METRIC-REGISTRY.md
  MONETIZATION-INCIDENT-RUNBOOKS.md
```

---

# Entitlement Registry

Recommended fields:

```text
capabilityId

displayName

description

eligiblePlans

sourceTypes

offlinePolicy

downgradeBehavior

dataPreservationBehavior

owner

status
```

---

# Monetization Error Registry

Potential categories:

```text
Product_unavailable

offer_unavailable

provider_unavailable

purchase_cancelled

purchase_pending

purchase_unknown_outcome

verification_failed

invalid_purchase

acknowledgment_failed

restore_failed

ownership_review_required

subscription_unknown

entitlement_sync_failed

limit_reached

ad_provider_failed

ad_consent_missing

ad_placement_invalid

provider_configuration_error
```

---

# Error Severity

Recommended:

```text
informational

user_action

retryable

Support_required

Security_critical

Privacy_critical
```

---

# Part 1 Anti-Patterns

The following are prohibited:

## Data Hostage Paywall

Blocking access to existing financial records after expiration.

## Premium Financial Correctness

Providing less accurate Money or Currency handling to free users.

## Hardcoded Current Price

Displaying a static price as authoritative while the store returns another value.

## Currency Conversion by Nexio

Converting provider prices independently.

## Callback Equals Entitlement

Granting permanent access from a client purchase callback alone.

## Local Boolean Premium Authority

Using a user-editable client flag as canonical entitlement.

## Immediate Revocation on Network Failure

Removing verified access merely because provider verification timed out.

## Cancellation Equals Expiration

Removing access immediately when renewal was cancelled but the paid period remains active.

## Expiration Deletes Premium Data

Deleting Reports, Goals, Attachments or configurations after downgrade.

## Restore Hidden behind Purchase

Requiring a new purchase attempt before Restore is available.

## Purchase Linked by Email Guess

Attaching store purchases to a Nexio owner through an unverified identity assumption.

## Duplicate Purchase Prompt

Showing Subscribe while an equivalent purchase is active or pending.

## Raw Purchase Token Logging

Writing provider purchase credentials into ordinary logs or Analytics.

## Deletion Blocked by Subscription

Preventing Nexio Account deletion until external billing is cancelled.

## Cancellation Hidden in Support

Requiring Support contact when provider management can be linked directly.

## Trial Terms Hidden

Showing Free without the post-trial price and renewal behavior.

## Advertisement as Product Card

Making sponsored content visually indistinguishable from financial data.

## Advertisement in Critical Journey

Showing an Ad during Transaction, Transfer, Privacy, Security, Export or deletion flows.

## Financial-Behavior Ad Targeting

Using balances, Expenses, descriptions or Goals for Advertising.

## Ad Failure Blocks Product

Preventing Product use because an Advertisement did not load.

## Ad-Free Still Requests Ads

Continuing unnecessary Advertising requests after verified ad-free entitlement.

## Accessibility as Paid Feature

Restricting required accessible use to Premium.

## Security as Paid Feature

Restricting required Security protections to Premium.

## Hidden Limit Deletion

Deleting excess state when a lower plan limit applies.

## AI Pricing Based on Financial Vulnerability

Using private records to choose offers, prices or pressure.

## Revenue Metric without Guardrails

Optimizing purchases while ignoring false billing, Privacy, cancellation or Support harm.

---

# Part 1 Review Questions

## Product and Plan

```text
Which user need does the paid capability address?

Which capabilities remain free?

Which limits apply?

Does the plan affect safety or only capability?

What happens after downgrade?
```

---

## Price Presentation

```text
Which provider supplied the price?

Is the billing period visible?

Is Currency explicit?

Is the price current?

Are trial and introductory terms complete?
```

---

## Purchase Flow

```text
Which purchase-attempt identity applies?

Is the Product mapping valid?

Does the provider UI control payment details?

How is unknown outcome handled?

When is entitlement granted?
```

---

## Verification

```text
Which trusted authority verifies the purchase?

Is the application identity checked?

Is the Product identity checked?

Is the purchase unique?

Is the owner association verified?

Are refund and revocation states checked?
```

---

## Entitlement

```text
Which capability is granted?

Which source grants it?

When does access begin?

When does it end?

What offline policy applies?

What happens after provider failure?
```

---

## Restore

```text
Can the user restore without repurchasing?

Which provider account is queried?

How is the current Nexio owner verified?

What happens when the purchase is already linked?

What happens when ownership is uncertain?
```

---

## Subscription

```text
Is cancellation distinct from expiration?

Is auto-renew state known?

Which grace or hold behavior applies?

Does expiration preserve data?

Can the user manage the subscription directly?
```

---

## Trial

```text
Is the user eligible?

What is the trial duration?

What is the post-trial price?

Does it renew automatically?

How can it be cancelled?
```

---

## Advertising

```text
Is the placement registered?

Is the Advertisement clearly labeled?

Is the owner ad-free?

Does Privacy permit the request?

Is the current journey excluded?

Which data reaches the provider?
```

---

## Downgrade

```text
Which new actions become unavailable?

Which existing data remains readable?

Are excess items preserved?

Is Export still available?

Can the user delete the Account?
```

---

## Account Deletion

```text
Can deletion proceed with an active subscription?

Does the user understand external cancellation?

Are Ads and marketing stopped?

Which purchase evidence remains?

Can a new owner inherit access incorrectly?
```

---

## Accessibility

```text
Can a screen-reader user compare plans?

Are prices and billing periods announced together?

Is Restore reachable?

Is Manage subscription reachable?

Are Ads labeled semantically?

Can the purchase flow be completed without color-only cues?
```

---

## Privacy

```text
Which billing data is retained?

Which provider identifiers exist?

Does Advertising use financial data?

Can the user refuse personalized Advertising?

Does withdrawal stop eligible provider processing?
```

---

## Metrics

```text
Does the metric measure verified outcomes?

Could it encourage duplicate prompts?

Does it collect financial content?

Does it hide cancellation failure?

Which safety guardrails can stop rollout?
```

---

# Part 1 Acceptance Criteria

The monetization foundation is accepted only when:

```text
□ Existing financial data remains accessible after subscription expiration.

□ Core financial integrity is independent from plan level.

□ Security, Privacy and Accessibility are not premium-only.

□ Export remains available for user-owned records.

□ Account deletion remains available regardless of subscription.

□ Product and plan terms are transparent.

□ Provider-returned price is authoritative.

□ Store price Currency and billing period are visible.

□ Nexio does not independently convert store prices.

□ Purchase initiation remains distinct from completion.

□ Purchase verification precedes durable entitlement authority.

□ Client callbacks are not sole purchase authority.

□ Entitlements use a canonical owner-scoped model.

□ Billing state and entitlement state remain distinct.

□ Cancellation and expiration remain distinct.

□ Temporary provider failure does not cause immediate destructive revocation.

□ Billing failure never deletes financial records.

□ Downgrade preserves existing data.

□ Paid-feature data remains recoverable or readable.

□ Restore purchases is available where supported.

□ Restore does not require repurchase.

□ Restore validates current owner association.

□ Duplicate purchase prompts are prevented.

□ Pending purchases are visible.

□ Purchase acknowledgment is idempotent.

□ Purchase tokens and receipts are protected.

□ Store account and Nexio owner are treated as distinct identities.

□ Account switching revalidates entitlements.

□ Sign-out clears premium context.

□ Account deletion and subscription cancellation are separate actions.

□ Active subscriptions do not block Account deletion.

□ Advertisements are visually and semantically distinct.

□ Advertising cannot influence Product financial truth.

□ Advertising excludes exact financial content.

□ Advertising does not target inferred financial vulnerability.

□ Advertising does not masquerade as advice.

□ Advertisements are excluded from Critical journeys.

□ Advertising is accessible.

□ Advertisement provider failure does not block Product use.

□ Ad-free entitlement suppresses eligible Advertising.

□ Paid access does not force optional Privacy choices.

□ Free access does not require personalized Advertising where an approved alternative applies.

□ Promotional claims require evidence.

□ Trial duration and conversion terms are explicit.

□ Trial eligibility is provider-verified.

□ Trial conversion is not hidden.

□ Promotions use canonical entitlements.

□ Discounts derive from provider authority.

□ Subscription management is easy to find.

□ Cancellation avoids dark patterns.

□ Access after cancellation is explained accurately.

□ Refund authority is clear.

□ Refund state and entitlement state are reconciled.

□ Chargebacks do not delete Product data.

□ Monetization is region-aware.

□ Feature limits are explicit.

□ Limits are enforced beyond UI hiding.

□ Downgrade limits do not delete excess state.

□ Monetization capabilities can be disabled safely.

□ Monetization experiments preserve mandatory safety.

□ AI cannot choose pricing based on private financial records.

□ Monetization models are classified.

□ Unsupported financial-product monetization remains out of scope.

□ Product Catalogue entries have stable identifiers.

□ Product types and lifecycle states are defined.

□ Plans group explicit capabilities and limits.

□ Access modes are defined.

□ Limit types and reset periods are defined.

□ Limit-reached states are neutral and non-destructive.

□ Every entitlement is owner-scoped.

□ Entitlement sources are explicit.

□ Entitlement states are explicit.

□ Multiple entitlement sources are reconciled safely.

□ Effective entitlement is derived deterministically.

□ Access-decision states are explicit.

□ Entitlement caches are owner-scoped and expiring.

□ Offline premium policy is defined.

□ Cache expiration preserves existing financial records.

□ Canonical products map explicitly to provider products.

□ Missing provider mapping disables purchase safely.

□ Billing providers remain behind Adapters.

□ Provider-specific billing state does not become Domain state directly.

□ Every purchase attempt has a stable identity.

□ Purchase-attempt states are explicit.

□ Unknown purchase outcome prevents blind repurchase.

□ Provider purchase references are deduplicated.

□ Verification checks provider, application and Product identity.

□ Verification checks current purchase validity.

□ Invalid-purchase reasons are classified.

□ Unknown verification preserves current access safely.

□ Acknowledgment occurs after verification.

□ Acknowledgment Retry preserves identity.

□ Restore queries provider purchases safely.

□ Restore results are explicit.

□ Ownership uncertainty does not expose another owner.

□ Subscription records have explicit periods and renewal states.

□ Active, cancelled-active, grace, hold, paused and expired states are distinct.

□ Cancellation Date and access-end Date are distinct.

□ Grace and hold behavior follow approved policy.

□ Expiration recalculates entitlements without deleting data.

□ Refund and chargeback behavior preserves financial records.

□ Upgrade and downgrade transitions are mapped.

□ Plan-change timing reflects provider authority.

□ Replacement purchases do not create duplicate entitlement.

□ Trials have canonical state.

□ Trial reminders are nonmanipulative.

□ Promotional grants have reason, authority and expiration.

□ Permanent manual grants require exceptional authority.

□ Advertising uses a canonical service and provider Adapter.

□ Every Ad placement has a Registry entry.

□ Placement exclusions include Critical Product journeys.

□ Banner Ads do not resemble financial records.

□ Native Ads remain clearly labeled.

□ Interstitials require enhanced review.

□ Rewarded Ads cannot gate user-owned data or rights.

□ Ad eligibility states are explicit.

□ Ad-free verification failure preserves safe prior state temporarily.

□ Advertising preference remains separate from other permissions and choices.

□ Advertising request data is minimized.

□ Financial and sensitive fields are prohibited from ad requests.

□ Ad refresh is bounded.

□ Ad clicks do not alter financial state.

□ Advertising failures use neutral fallback.

□ Ad provider initialization respects entitlement and Privacy.

□ Advertising providers have Registry entries.

□ Development uses provider-approved test configuration.

□ Production Ad configuration is environment-specific.

□ Plan comparison presents capabilities, limits and billing terms.

□ Plan comparison avoids deceptive design.

□ Current plan state is owner-scoped.

□ Unknown plan state is represented honestly.

□ Final purchase actions use explicit provider language.

□ Restore purchases remains visible.

□ Manage subscription remains visible.

□ Billing errors state whether access changed.

□ Verification failures do not grant access.

□ Gated UI distinguishes entitlement, limit and provider states.

□ Downgrade read-only behavior is explicit.

□ Advertisement labels are accessible.

□ Purchase flows are accessible.

□ Payment-card credentials are not handled directly without separate approval.

□ Purchase history is purpose-limited.

□ Advertising identifiers are processed during deletion.

□ Account deletion stops Ads and optional monetization communication.

□ Recreated owners do not inherit deleted-owner access automatically.

□ Billing threats are documented.

□ Webhooks require authentication and replay protection.

□ Repeated provider events are idempotent.

□ Premium access does not rely on editable local flags.

□ Test and Production provider environments are separated.

□ Advertising SDKs cannot access financial databases directly.

□ Monetization Analytics uses approved event names.

□ Analytics excludes exact financial content and purchase secrets.

□ Safety metrics include false grants, false revocation and owner isolation.

□ Revenue is not the sole monetization outcome.

□ Monetization Registries are defined.

□ Billing and Advertising error categories are defined.

□ Part 1 monetization anti-patterns are prohibited.
```

---

# Monetization Constitutional Rule

Every Nexio plan, price, purchase attempt, subscription, entitlement, promotion, trial, Advertisement, paywall, plan limit and provider event must answer:

```text
Which authoritative Product and provider state justifies this access or message, which owner receives the benefit, which price and billing period were verified, which entitlement is created or removed, which financial and Privacy data remains protected, and how does Nexio preserve user records, Export, Accessibility and Account deletion when billing, Advertising, verification or provider delivery fails?
```

When the answer is uncertain, prefer the action that:

- Preserves existing financial records.
- Preserves the last safely verified access for a bounded period.
- Blocks a new purchase attempt.
- Reconciles the original purchase identity.
- Hides the Advertisement.
- Uses the free safe Product path.
- Removes financial data from provider requests.
- Keeps Restore available.
- Keeps subscription management available.
- Keeps Export available.
- Keeps Account deletion available.
- Disables the Product offer.
- Disables the provider.
- Requires Security and Privacy review.
- Blocks the release.

Monetization is not successful because a purchase screen opened, a provider returned a callback, an Advertisement loaded or revenue increased.

It is successful only when the correct owner receives the accurately described capability through verified billing authority while Nexio preserves financial trust, user control, Privacy, Accessibility, data portability and safe failure behavior.

---
---

# Practical Monetization and Entitlement Architecture

This section translates the monetization principles into operational Product flows.

It defines how Nexio should:

```text
Load provider products

Present current prices

Start an Android purchase

Process provider callbacks

Verify purchases

Acknowledge or consume purchases

Grant entitlements

Handle pending purchases

Restore purchases

Reconcile subscriptions

Start and end trials

Upgrade and downgrade plans

Handle cancellation

Handle grace and Account hold

Handle refund and chargeback

Propagate entitlements across devices

Enforce capability limits

Render paywalls

Suppress Advertising

Load and destroy Ads

Integrate an Advertising provider such as AdMob

Recover from provider, network and application failures
```

Every implementation must preserve:

```text
One current Nexio owner

One canonical Product mapping

One purchase-attempt identity

One provider purchase identity

One verified entitlement decision

One explicit billing state

Safe access to existing financial data

Safe Retry and reconciliation behavior
```

---

# Monetization Master Flow

Recommended high-level sequence:

```text
Open monetization surface

↓

Load current owner and entitlement state

↓

Load provider Product configuration

↓

Load current localized prices and offers

↓

Present verified plan information

↓

User explicitly initiates purchase

↓

Create stable purchase attempt

↓

Open provider purchase interface

↓

Receive provider result

↓

Classify cancelled, pending, purchased or unknown

↓

Verify purchase through trusted authority

↓

Acknowledge or consume where required

↓

Create or update canonical entitlement

↓

Propagate effective access

↓

Update Product surfaces and Advertising eligibility

↓

Monitor provider events and lifecycle changes

↓

Reconcile cancellation, refund, expiration and restoration
```

---

# Monetization Entry Points

Potential entry points:

```text
Settings

Current plan

Plan comparison

Premium capability gate

Limit-reached state

Advertisement-removal prompt

Onboarding optional step

Product update announcement

Subscription management

Restore purchases

Support recovery flow
```

Every entry point should use the same canonical Monetization Application service.

---

# Entry-Point Requirements

Before showing an offer:

```text
□ Current owner is known.

□ Current entitlement state is loaded or explicitly pending.

□ Platform is eligible.

□ Region is eligible.

□ Provider configuration is available.

□ Product mapping is active.

□ Current Product state does not prohibit purchase.

□ Account deletion is not in a restricted state.

□ The same equivalent purchase is not already active.

□ A pending equivalent purchase does not already exist.
```

---

# Product Catalogue Loading Flow

Recommended:

```text
Read canonical Product Catalogue

↓

Filter by platform

↓

Filter by region

↓

Filter by Product status

↓

Resolve billing provider mapping

↓

Request provider Product details

↓

Resolve offers and eligibility

↓

Compare provider response with expected mapping

↓

Create Product presentation model
```

---

# Product Loading States

Recommended:

```text
not_started

loading_catalogue

loading_provider_products

loaded

partially_loaded

unavailable

misconfigured

provider_unavailable

failed_retryable

failed_final
```

---

# `not_started`

No Product-loading operation has begun.

---

# `loading_catalogue`

Nexio is reading the canonical internal Product configuration.

---

# `loading_provider_products`

Nexio is requesting current provider products, prices and offers.

---

# `loaded`

All required Product details for the current surface are available.

---

# `partially_loaded`

Some products are available and others are not.

Unavailable products must not display stale hardcoded prices.

---

# `unavailable`

The selected Product is not available for the current platform, region or store context.

---

# `misconfigured`

Canonical Product mapping and provider configuration do not match.

---

# `provider_unavailable`

The billing provider could not return current Product information.

---

# `failed_retryable`

A temporary failure permits another safe Product-loading attempt.

---

# `failed_final`

The current Product cannot be offered until configuration or compatibility changes.

---

# Provider Product Query Contract

Potential request:

```text
providerId

platform

canonicalProductIds

providerProductIds

regionContext

storeAccountContext

ProductVersion
```

Potential response:

```text
providerProductId

title

description

localizedPrice

CurrencyCode where available

billingPeriod

basePlans

offers

trialEligibility

introductoryPricing

availability

providerMetadata
```

---

# Provider-Returned Price Authority

The Product presentation should use:

```text
Provider localized price

Provider billing period

Provider active offer

Provider trial or introductory details
```

Do not reconstruct a current price from:

- Documentation
- Previous screenshots
- Local constants
- Analytics
- Marketing copy
- Prior purchase history

---

# Generic Brazilian Price Learning Block

Synthetic example:

```text
Plan:
Premium

Price:
R$ 9,90 por mês

Billing provider:
Google Play

Renewal:
Renews monthly until cancelled
```

This is a generic `pt-BR` learning example.

It is not an approved Nexio Product price.

---

# Price Presentation Requirements

Display together:

```text
Localized price

Billing period

Trial terms where applicable

Introductory period where applicable

Renewal behavior

Provider identity
```

---

# Price Loading Failure

```text
Current price unavailable

Nexio could not load the current store price.

The plan cannot be purchased until the billing provider returns verified Product information.
```

Do not display a purchase action with an unverified price.

---

# Product Description Governance

The plan description should derive from the canonical Product Catalogue.

The provider Product title may be displayed where required.

Material capability claims must remain controlled by Nexio.

---

# Product Capability Comparison

Recommended structure:

```text
Capability

Free plan behavior

Premium plan behavior

Limit or availability

Downgrade behavior
```

---

# Plan Comparison Example

| Capability | Free | Premium |
|---|---|---|
| Core financial records | Available | Available |
| Exact Money and Currency | Available | Available |
| Account deletion | Available | Available |
| User-owned data Export | Available | Available |
| Advanced Reports | Defined free scope | Extended scope |
| Advertising | May appear under approved policy | Suppressed with active ad-free entitlement |

Actual plan capabilities require Product approval.

---

# Offer Architecture

Provider offers may include:

```text
Standard recurring price

Free trial

Introductory price

Discounted first periods

Upgrade offer

Win-back offer

Region-specific offer
```

Only provider-returned eligible offers should be presented.

---

# Offer Record

Potential presentation fields:

```text
canonicalProductId

providerProductId

basePlanId

offerId

offerType

localizedPrice

billingPeriod

trialDuration

introductoryDuration

renewalPrice

eligibility

providerTokenReference

expiresAt
```

Sensitive provider offer tokens should not be exposed in logs or Analytics.

---

# Offer Eligibility States

Recommended:

```text
eligible

ineligible

unknown

expired

not_supported

provider_unavailable
```

---

# Offer Unknown State

When eligibility is uncertain:

```text
This offer cannot be confirmed right now.

Review the standard available plan or try again later.
```

Do not promise trial access.

---

# Offer Expiration

An offer should be reloaded when:

- The provider marks it expired.
- The application resumes after a long interval.
- The store Account changes.
- The Product mapping changes.
- The purchase screen remains open beyond the approved validity period.

---

# Purchase Eligibility Flow

Before opening provider UI:

```text
Validate current owner.

↓

Refresh effective entitlement.

↓

Check equivalent active subscription.

↓

Check pending equivalent purchase.

↓

Check provider Product availability.

↓

Check selected offer eligibility.

↓

Check Account deletion state.

↓

Check platform billing availability.

↓

Create purchase attempt.
```

---

# Equivalent Active Product

When the owner already has equivalent access:

```text
This plan is already active for the current Nexio Account.
```

Actions:

```text
View current plan

Manage subscription
```

Do not show another ordinary Subscribe action.

---

# Equivalent Pending Product

```text
A purchase for this plan is still pending.

Review the current purchase state before trying again.
```

---

# Purchase Attempt Creation

Create `purchaseAttemptId` before invoking provider UI.

Potential input:

```text
ownerId

providerId

canonicalProductId

providerProductId

basePlanId

offerId

platform

ProductVersion

idempotencyKey
```

Potential output:

```text
purchaseAttemptId

eligibilityState

currentEntitlement

providerLaunchParameters

createdAt
```

---

# Purchase Attempt Idempotency

Repeated taps should not create several simultaneous attempts.

Controls may include:

```text
Disable the action after activation

Reuse active purchaseAttemptId

Debounce repeated input

Check active provider flow

Block equivalent concurrent attempt
```

---

# Final Purchase Confirmation Screen

Before launching provider UI, Nexio should show:

```text
Plan

Included capabilities

Current provider price

Billing period

Trial or offer terms

Renewal behavior

Provider identity

Manage and cancellation information
```

---

# Final Purchase Action

Preferred:

```text
Subscribe through Google Play
```

For one-time purchases:

```text
Purchase through Google Play
```

Avoid:

```text
Continue
```

as the only final action label.

---

# Android Billing Availability Flow

Recommended:

```text
Initialize billing Adapter

↓

Connect to provider service

↓

Check supported Product types

↓

Load provider Product details

↓

Validate current store context

↓

Mark Android billing available
```

---

# Android Billing States

Recommended:

```text
not_initialized

connecting

connected

disconnected

unsupported

degraded

configuration_error

temporarily_unavailable
```

---

# Billing Connection Loss

When connection is lost:

- Preserve the active purchase attempt.
- Do not assume failure immediately.
- Reconnect according to bounded policy.
- Query provider purchases after reconnection.
- Avoid launching another equivalent purchase flow.

---

# Android Purchase Flow

Recommended:

```text
User selects Subscribe

↓

Nexio creates purchaseAttemptId

↓

Nexio launches provider billing interface

↓

Android moves Nexio to background or overlay state

↓

Provider returns a callback or activity result

↓

Nexio persists the raw result category safely

↓

Nexio queries current purchases

↓

Nexio verifies the purchase

↓

Nexio acknowledges where required

↓

Nexio grants or updates entitlement

↓

Nexio refreshes Product access and Ads

↓

Nexio shows final verified state
```

---

# Android Purchase UI Opening

Opening provider UI should set:

```text
purchaseAttempt.state = provider_opening
```

It must not set:

```text
entitlement.state = active
```

---

# Android Application Backgrounding

While the provider interface is active:

- Preserve purchase-attempt identity.
- Avoid starting another flow.
- Avoid clearing the owner context.
- Handle process death.
- Avoid interpreting lifecycle pause as cancellation.

---

# Android Purchase Callback Categories

Potential provider outcomes:

```text
purchased

pending

cancelled

already_owned

item_unavailable

billing_unavailable

network_error

developer_error

service_disconnected

unknown
```

Provider-specific codes should be mapped through the Adapter.

---

# Purchase Callback Is Advisory

A callback should trigger:

```text
Provider purchase query

Trusted verification

Canonical entitlement update
```

It should not independently grant durable premium access.

---

# Android Purchased Callback

Recommended sequence:

```text
Record purchased_unverified state.

↓

Persist provider purchase reference securely.

↓

Begin verification.

↓

Prevent duplicate purchase UI.

↓

Show verification progress.
```

---

# Purchase Verification Progress

```text
Verifying purchase

Nexio is confirming the purchase with the billing provider.

Do not purchase the same plan again.
```

---

# Android Pending Purchase

When the provider reports pending:

```text
Purchase pending

The billing provider has not completed the purchase.

Premium access will begin only after verified completion.
```

Actions:

```text
View current plan

Close
```

Do not repeatedly prompt for another purchase.

---

# Pending Purchase State

Potential fields:

```text
purchaseAttemptId

providerPurchaseReference

providerProductId

pendingSince

lastCheckedAt

nextCheckAt

ownerId

state
```

---

# Pending Purchase Reconciliation

Recommended:

```text
Query provider purchases on application resume.

Query after billing reconnection.

Process verified provider event.

Apply bounded scheduled reconciliation.

Stop after final provider state.
```

---

# Pending Purchase Aging

When pending for an extended period:

```text
This purchase is still pending with the billing provider.

Nexio cannot complete or cancel the provider payment directly.

Review your store payment state or contact the billing provider.
```

---

# Pending Purchase Prohibition

Do not:

- Grant Premium permanently
- Create another equivalent purchase
- Mark purchase failed without evidence
- Delete the purchase attempt
- Ask the user to pay through another route immediately

---

# Android Purchase Cancelled

Use only when provider state supports cancellation:

```text
Purchase cancelled

No new subscription was activated through this attempt.

Your previous plan remains unchanged.
```

---

# User Closing Provider UI

Closing the provider UI may not always prove cancellation.

When result is uncertain:

```text
Nexio is checking whether the purchase completed.
```

---

# Already-Owned Result

When the provider reports equivalent ownership:

```text
This Product may already be associated with your store Account.

Nexio will verify and restore eligible access.
```

Automatically route into safe purchase query and verification rather than another purchase.

---

# Product Unavailable Result

```text
This plan is not currently available through Google Play.

Your existing access and financial records remain unchanged.
```

---

# Billing Unavailable Result

```text
Google Play billing is unavailable on this device right now.

Your current Nexio plan remains unchanged.
```

---

# Developer or Configuration Error

A provider developer error should:

- Block the affected Product.
- Create an Operations alert.
- Preserve the owner's current access.
- Avoid telling the user that payment failed through fault of their Account.
- Avoid raw provider-code display.

---

# Android Process Death during Purchase

On restart:

```text
Initialize Nexio.

↓

Restore current Authentication and owner.

↓

Read incomplete purchase attempts.

↓

Connect billing Adapter.

↓

Query active purchases.

↓

Match provider references to purchase attempts.

↓

Verify and acknowledge eligible purchases.

↓

Reconcile final entitlement.

↓

Show accurate result.
```

Do not launch provider UI automatically after restart.

---

# Android Rotation during Purchase

Rotation must not:

- Create another purchase attempt
- Relaunch provider UI
- Clear the current Product
- Grant premium early
- Lose pending verification

---

# Android Application Upgrade during Pending Purchase

After upgrade:

- Preserve purchase-attempt identity.
- Use compatible provider mapping.
- Query current purchases.
- Migrate state if required.
- Avoid duplicate entitlement.

---

# Purchase Verification Flow

Recommended:

```text
Receive provider purchase reference

↓

Validate current environment

↓

Validate provider

↓

Validate application or package identity

↓

Validate Product mapping

↓

Validate purchase state

↓

Validate purchase uniqueness

↓

Validate replacement relationship

↓

Validate refund or revocation status

↓

Resolve Nexio owner association

↓

Create verification result

↓

Proceed to acknowledgment and entitlement
```

---

# Purchase Verification Record

Recommended fields:

```text
verificationId

purchaseAttemptId

providerId

providerPurchaseReference

canonicalProductId

providerProductId

environment

state

verifiedAt

verificationVersion

failureCategory

ownerAssociationState

providerValidity
```

---

# Owner Association States

Recommended:

```text
unassigned

current_owner_verified

already_current_owner

ownership_review_required

conflicting_owner

deleted_owner_reference

invalid
```

---

# Current Owner Verification

A purchase may be associated with the current owner only through the approved ownership model.

Potential evidence:

```text
Purchase initiated while authenticated as the owner

Stable purchase attempt linked to current owner

Backend verification

No conflicting active owner association

Provider Product and environment match
```

---

# Cross-Owner Conflict

When a provider purchase is already linked to another owner:

```text
Nexio could not attach this purchase automatically.

Review purchase ownership through Support.
```

Do not reveal:

- Other owner name
- Other owner email
- Other owner plan history
- Other owner dates

---

# Deleted Owner Purchase Reference

A purchase previously associated with a deleted owner requires an approved reassociation policy.

It must not silently reactivate the deleted owner or transfer access automatically.

---

# Verification Failure Categories

Recommended:

```text
provider_unreachable

invalid_reference

wrong_application

wrong_environment

unknown_Product

Product_mapping_mismatch

purchase_not_completed

purchase_refunded

purchase_revoked

duplicate_reference

ownership_conflict

malformed_response

verification_timeout
```

---

# Verification Timeout

```text
Nexio could not confirm the purchase yet.

Do not purchase the same plan again.

Your current plan remains unchanged while verification continues.
```

---

# Verification Retry

Retry should preserve:

```text
verificationId

purchaseAttemptId

provider purchase reference

owner association
```

---

# Verification Idempotency

Repeated verification of the same provider reference should return the current canonical result.

It must not create another entitlement.

---

# Purchase Acknowledgment Flow

When the provider requires acknowledgment:

```text
Verify purchase

↓

Create acknowledgment operation

↓

Submit acknowledgment through Adapter

↓

Classify provider result

↓

Reconcile unknown outcome

↓

Record acknowledged state

↓

Finalize entitlement and purchase attempt
```

---

# Acknowledgment Operation Record

Potential fields:

```text
acknowledgmentId

purchaseAttemptId

providerPurchaseReference

state

attemptCount

lastAttemptAt

nextAttemptAt

providerResult

completedAt
```

---

# Acknowledgment States

```text
not_required

ready

sending

acknowledged

failed_retryable

failed_final

unknown_outcome
```

---

# Acknowledgment Unknown Outcome

After timeout:

```text
Do not send a new purchase.

Query provider state.

Retry only with the same acknowledgment identity when the provider contract permits.
```

---

# Entitlement Timing and Acknowledgment

The Product policy should define whether temporary access begins:

```text
After trusted purchase verification

or

Only after acknowledgment confirmation
```

The decision must account for provider requirements and risk.

---

# Acknowledgment Failure User Experience

```text
Your purchase was verified, but Nexio is completing a provider processing step.

Do not purchase the plan again.

Existing access remains according to the current verified state.
```

---

# Consumable Purchase Flow

Where consumables are approved:

```text
Verify purchase

↓

Grant bounded quota or benefit

↓

Persist grant identity

↓

Consume provider purchase

↓

Reconcile unknown outcome
```

A consumable must not be consumed before the benefit is durably recorded.

---

# Nonconsumable Purchase Flow

A verified nonconsumable purchase may create a persistent entitlement.

Restore should recover it after reinstall.

---

# Subscription Entitlement Grant Flow

Recommended:

```text
Purchase verified

↓

Subscription record created or updated

↓

Provider Product maps to entitlement set

↓

Effective start and end determined

↓

Canonical entitlements created or updated

↓

Entitlement cache refreshed

↓

Product capability service notified

↓

Advertising eligibility recalculated

↓

UI refreshed
```

---

# Entitlement Grant Idempotency

Potential uniqueness:

```text
providerId

providerPurchaseReference

capabilityId
```

Repeated events must update the same entitlement.

---

# Entitlement Activation Result

Potential:

```text
entitlement_active

entitlement_pending

entitlement_grace

entitlement_read_only

entitlement_not_granted

ownership_review_required
```

---

# Purchase Completion Screen

Show only after verification and required processing.

Recommended:

```text
Premium plan active

Your verified purchase is now associated with this Nexio Account.

Review your current plan and subscription management options.
```

---

# Purchase Completion Screen Actions

```text
View Premium features

View current plan

Manage subscription
```

---

# Purchase Completion Prohibitions

Do not claim:

```text
Payment permanently successful
```

when later provider events may change entitlement.

Prefer:

```text
Your Premium access is active.
```

based on the current verified state.

---

# Entitlement Propagation Architecture

Entitlement changes should propagate through:

```text
Canonical entitlement persistence

↓

Effective-access calculation

↓

Owner-scoped synchronization

↓

Local secure cache

↓

Feature-gate service

↓

UI state

↓

Advertising service

↓

Notification or communication service
```

---

# Propagation States

Recommended:

```text
persisted

sync_pending

sync_confirmed

cache_pending

cache_updated

Product_applied

partially_applied

failed_retryable

failed_final
```

---

# Immediate Current-Device Application

After canonical entitlement persistence:

- Update current-device access.
- Remove eligible Ads.
- Update plan UI.
- Preserve one owner context.
- Avoid waiting for a full application restart.

---

# Cross-Device Propagation

Other devices should receive the entitlement through owner-scoped synchronization.

They must revalidate:

- Owner
- Entitlement version
- Validity period
- Revocation
- Cache integrity

---

# Entitlement Propagation Failure

```text
Your purchase is verified, but Nexio could not update every Product surface yet.

Close and reopen the affected screen or wait for synchronization.

Do not purchase again.
```

Operations should retain a repairable propagation state.

---

# Ad-Free Propagation

When ad-free access becomes active:

```text
Stop new Ad requests.

Destroy or hide loaded Ad views safely.

Remove placement containers.

Update current owner cache.

Synchronize the entitlement.

Avoid layout shift.
```

---

# Ad-Free Propagation Failure

Prefer:

```text
Suppress Ads while verified ad-free access is known.
```

A temporary UI refresh failure must not cause new Ad requests.

---

# Entitlement Revocation Propagation

When access expires or is revoked:

```text
Recalculate effective entitlement.

↓

Check alternate entitlement sources.

↓

Apply feature downgrade policy.

↓

Preserve existing data.

↓

Stop new premium-only commands where applicable.

↓

Update Ads according to plan and Privacy.

↓

Update owner devices.
```

---

# Alternate Entitlement Source

Example:

```text
Subscription expired

Support promotional grant still active
```

Effective access remains active.

Do not revoke because one source ended.

---

# Entitlement Cache Refresh

Refresh triggers may include:

```text
Application start

Application resume

Owner switch

Purchase completion

Restore completion

Provider event

Subscription management return

Periodic bounded verification

Manual refresh
```

---

# Manual Plan Refresh

Provide:

```text
Refresh purchase status
```

where useful.

It should query and verify existing purchases, not create a new purchase.

---

# Restore Purchases Entry Flow

Recommended entry points:

```text
Plan comparison

Current plan

Billing error

Already-owned provider result

Settings

Support-guided recovery
```

---

# Restore Purchases Screen

Explain:

```text
Restore eligible purchases associated with the current store Account.

Nexio will verify purchases before applying access to the current Nexio Account.
```

Action:

```text
Restore purchases
```

---

# Restore Attempt Record

Recommended fields:

```text
restoreAttemptId

ownerId

providerId

platform

state

startedAt

completedAt

purchaseCount

restoredCount

pendingCount

conflictCount

invalidCount

failureCategory
```

---

# Restore States

```text
created

querying_provider

verifying

applying_entitlements

completed

partially_completed

provider_unavailable

failed_retryable

failed_final
```

---

# Restore Query Flow

```text
Validate owner.

↓

Connect billing provider.

↓

Query current owned Products.

↓

Collect purchase references.

↓

Deduplicate provider results.

↓

Verify each purchase.

↓

Resolve owner association.

↓

Acknowledge if required.

↓

Update subscriptions and entitlements.

↓

Recalculate access.

↓

Show result summary.
```

---

# Restore Result Summary

Example:

```text
Restore completed

Already active:
1

Restored:
1

Pending:
0

Needs Support review:
0

Invalid:
0
```

---

# Partial Restore

```text
Some purchases were restored

Restored:
1

Pending verification:
1

Needs ownership review:
1
```

Do not report full success.

---

# Restore No Result

```text
No eligible purchases were found for the current store Account.

Your Nexio financial records and current plan were not changed.
```

---

# Restore Provider Unavailable

```text
Restore is temporarily unavailable

Nexio could not query Google Play.

Your current verified access remains unchanged.
```

---

# Restore after Reinstall

On reinstall:

- Sign in to Nexio.
- Load current owner.
- Query provider purchases.
- Verify.
- Rebuild entitlements.
- Avoid relying on prior local premium flags.

---

# Restore after Device Change

A new device should:

- Authenticate the Nexio owner.
- Use the current store Account context.
- Query provider purchases.
- Resolve owner association.
- Restore eligible access.
- Avoid copying raw tokens from the old device.

---

# Restore after Local Data Clear

Clearing local application state should not require repurchase.

Canonical entitlements and verified provider state should support restoration.

---

# Subscription State Synchronization

Subscription state may change through:

```text
Provider query

Backend verification

Provider webhook or notification

Purchase flow

Restore flow

Subscription management return

Periodic reconciliation
```

---

# Subscription Reconciliation Flow

Recommended:

```text
Read known subscription.

↓

Query provider or verification authority.

↓

Validate current Product mapping.

↓

Classify state.

↓

Update current period.

↓

Update auto-renew state.

↓

Update cancellation, grace, hold or pause.

↓

Recalculate entitlement.

↓

Persist versioned result.

↓

Propagate access.
```

---

# Subscription State Version

Potential fields:

```text
subscriptionId

stateVersion

providerEventTime

verifiedAt

source

previousState

newState

reason
```

---

# State Transition Validation

Examples of valid transitions may include:

```text
pending → active

active → cancelled_active

active → grace

grace → active

grace → on_hold

cancelled_active → expired

active → refunded

active → chargeback

paused → active

unknown → active
```

The actual provider contract should define allowed transitions.

---

# Invalid State Transition

A conflicting provider event should:

- Be stored for investigation.
- Not overwrite a newer authoritative state blindly.
- Trigger reconciliation.
- Avoid immediate destructive access change.

---

# Provider Event Ordering

Provider events may arrive out of order.

Use:

- Provider event time
- Verification time
- State version
- Current provider query
- Transition rules

Do not apply events solely by arrival order.

---

# Subscription Active State

Effective access should use:

```text
Current verified paid period

Current Product mapping

Current owner association

No overriding refund, chargeback or revocation

Applicable alternate grants
```

---

# Cancelled-Active State

UI example:

```text
Subscription cancelled

Premium access remains active until 31/08/2026.
```

Use only verified provider Date.

---

# Auto-Renew Disabled

Auto-renew disabled does not necessarily remove current access.

---

# Subscription Management Flow

Recommended:

```text
Open current plan

↓

Select Manage subscription

↓

Validate provider and Product

↓

Open provider management destination

↓

User returns to Nexio

↓

Refresh provider purchase state

↓

Reconcile subscription and entitlement

↓

Show updated plan state
```

---

# Manage Subscription Failure

```text
Subscription management could not be opened

Review your Google Play subscriptions directly or try again later.

Your current Nexio plan remains unchanged.
```

---

# Cancellation Flow

Nexio may not directly cancel a store-managed subscription unless the provider supports an approved API and Product policy.

Default Product role:

```text
Explain

Link to provider management

Refresh state after return

Reconcile entitlement
```

---

# Cancellation Screen

Display:

```text
Current plan

Current period end

Auto-renew state

Provider

Manage subscription action

Account deletion distinction
```

---

# Cancellation Dark-Pattern Prohibitions

Do not:

- Hide Manage subscription
- Require a survey before opening provider management
- Use guilt language
- Show false data-loss claims
- Pretend Account deletion cancels billing
- Pretend cancellation deletes data

---

# Cancellation Return Flow

After returning:

```text
Query current provider state.

↓

Verify cancellation or unchanged state.

↓

Update subscription.

↓

Preserve access until verified end Date.

↓

Refresh UI.
```

---

# Cancellation Unknown Outcome

```text
Nexio could not confirm the subscription change yet.

Review the current state in Google Play or refresh again later.
```

---

# Cancellation Notification

Optional:

```text
Your Nexio subscription is cancelled and remains active until the displayed Date.
```

Use only verified provider data.

---

# Trial Eligibility Flow

Recommended:

```text
Load provider offers

↓

Identify trial offer

↓

Check provider eligibility

↓

Check current and historical Product restrictions

↓

Present exact terms

↓

Create purchase attempt

↓

Use normal provider purchase flow
```

---

# Trial Presentation Example

Synthetic:

```text
Free trial:
7 days

Then:
R$ 9,90 per month

Renewal:
Monthly until cancelled through Google Play
```

This is a generic example only.

---

# Trial Purchase Flow

A trial should still use:

- Stable purchase identity
- Provider UI
- Purchase verification
- Acknowledgment
- Subscription record
- Entitlement record

---

# Trial Active State

Display:

```text
Premium trial active

Trial ends:
[verified Date]

Price after trial:
[provider-localized price]

Manage subscription:
Google Play
```

---

# Trial Cancellation

A cancelled trial may remain active until its verified end Date.

---

# Trial Conversion

When provider state indicates conversion:

```text
trial.active → subscription.active
```

Do not create a separate duplicate entitlement if the same Product continues.

---

# Trial Expiration

When the trial ends without active paid access:

- Recalculate entitlements.
- Apply downgrade policy.
- Preserve data.
- Update Ads.
- Keep Export and deletion.
- Avoid shaming messages.

---

# Trial Reminder Architecture

Potential reminders:

```text
Trial started

Trial ending soon

Trial converted

Trial cancelled
```

They must use the Notifications specification.

---

# Trial Ending Reminder

Preferred:

```text
Your Nexio trial is scheduled to end on 31/08/2026.

Review the current subscription terms through Google Play.
```

Do not use:

```text
Act now or lose everything.
```

---

# Introductory Pricing Flow

Display:

```text
Introductory price

Introductory duration

Standard renewal price

Billing period

Eligibility

Provider
```

---

# Introductory Price Example

Synthetic:

```text
R$ 4,90 per month for the first 3 months

Then R$ 9,90 per month
```

This is a generic learning example only.

---

# Upgrade Architecture

An upgrade may involve:

```text
Provider replacement purchase

Immediate entitlement expansion

Proration or provider-defined billing adjustment

New current period

Old subscription replacement
```

Nexio should not calculate provider charges independently.

---

# Upgrade Eligibility Flow

```text
Read current subscription.

↓

Load eligible replacement offers.

↓

Validate target Product.

↓

Display provider-returned pricing and effective policy.

↓

Create plan-change record.

↓

Start purchase flow.

↓

Verify replacement relationship.

↓

Update subscription and entitlements.
```

---

# Upgrade Presentation

Display:

```text
Current plan

New plan

New capabilities

Provider-localized price

Effective timing

Provider-defined billing behavior

Manage subscription route
```

---

# Upgrade Unknown Pricing

When proration or billing adjustment cannot be known before provider UI:

```text
Google Play will show the final billing details before confirmation.
```

Do not invent a total.

---

# Upgrade Completion

After verification:

- Activate new capabilities according to provider state.
- Preserve old Product data.
- Link replaced purchase.
- Prevent simultaneous duplicate interpretation.
- Update plan UI.

---

# Upgrade Unknown Outcome

```text
Nexio is checking the plan change.

Do not start another upgrade or purchase yet.
```

---

# Downgrade Architecture

A downgrade may be provider-scheduled for the next period.

---

# Downgrade Flow

```text
Load current subscription.

↓

Load eligible lower plan.

↓

Display reduced future capabilities.

↓

Explain data preservation.

↓

Open provider management or replacement flow.

↓

Verify provider state.

↓

Record effective Date or provider-determined timing.

↓

Apply current access until the effective transition.
```

---

# Downgrade Presentation

Must explain:

```text
Which future capabilities change

Which limits change

When the change takes effect

Which existing data remains available

Which items may become read-only

Advertising behavior after the change
```

---

# Downgrade Data Preservation Example

```text
Existing advanced Report configurations will remain available for review.

Creating new advanced Reports may become unavailable after the downgrade takes effect.

Your Transactions and Accounts will not be deleted.
```

---

# Downgrade Excess-State Handling

When the lower plan supports fewer items:

```text
Preserve all existing items.

Allow viewing.

Prevent new creation beyond the current limit.

Define editing behavior.

Allow Export.

Allow user deletion.
```

---

# Downgrade Selection Policy

When some items must remain active and others read-only, the policy should be:

- Deterministic
- Visible
- User-controlled where possible
- Non-destructive
- Owner-scoped

---

# Plan Replacement Architecture

A provider may return a replacement relationship.

Record:

```text
oldPurchaseReference

newPurchaseReference

replacementType

effectiveAt

oldEntitlementEnd

newEntitlementStart
```

---

# Duplicate Active Subscription Prevention

When replacement is verified:

- Avoid counting both subscriptions as separate plan access.
- Preserve historical purchase records.
- Use effective entitlement union safely.
- Avoid showing two active renewal states incorrectly.

---

# Grace Period Flow

Recommended:

```text
Provider reports grace.

↓

Verify grace end.

↓

Set subscription.state = grace.

↓

Keep approved Premium access.

↓

Display billing-recovery state.

↓

Allow Manage subscription.

↓

Monitor recovery or transition.
```

---

# Grace Period UI

```text
Payment issue under review

Premium access is temporarily available during the provider grace period.

Review your payment method through Google Play.
```

Use only when verified.

---

# Grace Period End

Potential outcomes:

```text
Payment recovered → active

Not recovered → on_hold or expired

Provider state unknown → unknown
```

---

# Account Hold Flow

Recommended:

```text
Provider reports on hold.

↓

Verify state.

↓

Apply approved access policy.

↓

Preserve all data.

↓

Keep plan management available.

↓

Show neutral billing-action message.

↓

Monitor recovery.
```

---

# Account Hold UI

```text
Subscription payment requires attention

Review your payment method through Google Play.

Your Nexio financial records remain available.
```

---

# Hold Access Policy

Potential:

```text
Premium actions temporarily unavailable

Existing Premium-created data remains readable

Core Product remains available

Export and deletion remain available
```

Actual policy requires Product approval.

---

# Subscription Pause Flow

Where supported:

- Record pause period.
- Preserve data.
- Explain feature behavior.
- Revalidate at expected resume.
- Avoid repeated purchase prompts.

---

# Pause UI

```text
Subscription paused

Premium access follows the current Google Play pause terms.

Review the subscription to see the expected resume Date.
```

---

# Subscription Expiration Flow

```text
Verify current period ended.

↓

Confirm no alternate entitlement source.

↓

Set subscription expired.

↓

Recalculate effective entitlements.

↓

Apply downgrade policy.

↓

Preserve all Product data.

↓

Update Advertising eligibility.

↓

Update Product surfaces.

↓

Communicate where useful.
```

---

# Expiration UI

```text
Premium subscription expired

Existing Nexio data remains available.

Some Premium actions may now be limited under the current plan.
```

---

# Expiration Prohibitions

Do not:

- Delete premium-created data
- Hide Export
- Hide Account deletion
- Show a forced purchase modal on every screen
- Display Ads inside critical recovery paths
- Revoke required accessibility features

---

# Refund Flow

Recommended:

```text
Receive provider refund signal.

↓

Verify provider event.

↓

Identify purchase.

↓

Determine effective refund state.

↓

Update subscription or purchase.

↓

Recalculate entitlements.

↓

Preserve Product data.

↓

Update current plan.

↓

Record audit.
```

---

# Refund State Timing

The provider may define when access ends.

Nexio should apply verified provider state rather than an assumed immediate policy.

---

# Refund User Experience

```text
Purchase refunded

Premium access now follows the verified provider state.

Your existing Nexio financial records were not deleted.
```

---

# Refund Support Route

Explain the refund authority:

```text
Refund requests for this purchase are managed through Google Play.
```

when applicable.

---

# Chargeback Flow

Recommended:

```text
Receive provider reversal signal.

↓

Verify authenticity.

↓

Update purchase and subscription state.

↓

Recalculate entitlement.

↓

Preserve Product data.

↓

Limit new paid actions according to policy.

↓

Keep Account deletion and Export available.
```

---

# Chargeback Communication

Use neutral language.

Avoid:

```text
You committed fraud.
```

Preferred:

```text
The billing provider reported a payment reversal.

Review your current subscription state through Google Play.
```

---

# Provider Revocation Flow

A provider may revoke a purchase for reasons such as:

- Refund
- Chargeback
- Invalid purchase
- Administrative action
- Test environment cleanup

Every revocation should be verified and idempotent.

---

# Manual Entitlement Grant Flow

Potential authorities:

```text
Support correction

Incident compensation

Migration

Promotion

Internal test
```

---

# Manual Grant Record

Recommended fields:

```text
grantId

ownerId

capabilityIds

reasonCode

authority

approvedBy

startsAt

endsAt

state

createdAt

revokedAt

relatedCase
```

---

# Support Grant Flow

```text
Support case confirms eligibility.

↓

Agent requests grant.

↓

Required approval is completed.

↓

Canonical promotional entitlement is created.

↓

Access propagates.

↓

Expiration is scheduled.

↓

Audit evidence is retained.
```

---

# Support Grant Limits

Support must not directly edit:

```text
local premium flag

subscription provider state

purchase token

canonical store purchase
```

Support grants are separate entitlement sources.

---

# Promotion Flow

Recommended:

```text
Evaluate campaign eligibility.

↓

Confirm owner and region.

↓

Create bounded promotional grant.

↓

Apply capability access.

↓

Avoid changing provider billing.

↓

Expire or revoke according to campaign.
```

---

# Promotion and Subscription Overlap

If a promotion overlaps an active subscription:

- Preserve both sources.
- Effective access remains active.
- Expiring the promotion must not revoke subscription access.

---

# Entitlement Evaluation Service

Potential operation:

```text
EvaluateCapabilityAccess
```

Input:

```text
ownerId

capabilityId

requestedAction

usageContext

platform

currentTime
```

Output:

```text
decision

effectiveEntitlement

limit

usage

remaining

readOnlyReason

verificationFreshness

requiredAction
```

---

# Feature-Gate Architecture

Feature gates should use:

```text
Canonical capability identifier

Current owner

Effective entitlement decision

Current usage

Product availability

Platform support
```

---

# Feature-Gate Prohibition

Do not use only:

```text
element.classList.add("hidden")
```

to enforce premium access.

The underlying Application command must also validate entitlement and limits.

---

# Premium Command Boundary

Before a Premium-only command:

```text
Validate owner.

↓

Evaluate entitlement.

↓

Evaluate limit.

↓

Validate Product state.

↓

Execute canonical command.

↓

Record usage.
```

---

# Command Entitlement Race

The entitlement may change between UI display and command execution.

The Application service must recheck at execution time.

---

# Entitlement Unknown during Command

Potential:

```text
New Premium action:
Temporarily blocked pending verification

Existing data read:
Allowed

Core financial command:
Unaffected
```

---

# Usage and Limit Architecture

Every metered capability should have a stable usage rule.

---

# Usage Record

Recommended fields:

```text
ownerId

capabilityId

periodKey

usageCount

usageAmount

limit

updatedAt

sourceVersion
```

---

# Limit Evaluation States

```text
within_limit

approaching_limit

limit_reached

over_limit_preserved

usage_unknown

not_applicable
```

---

# Count Limit Example

Synthetic:

```text
Free plan:
3 active advanced Goals

Current active Goals:
3

Decision:
New Goal creation limited
```

Existing Goals remain available.

---

# Storage Limit Example

Potential:

```text
Attachment storage limit reached

Existing attachments remain available.

New uploads are unavailable until space is freed or the plan changes.
```

---

# Frequency Limit Example

```text
The current plan's Report-generation limit has been reached for this period.

Existing Reports remain available.
```

---

# Limit Usage Source

Usage must derive from canonical Product state.

Do not calculate limits from:

- UI card count only
- Analytics events
- Notification history
- Stale local cache
- Advertisement requests

---

# Limit Concurrency

Two devices may attempt the final available slot.

The Application service must enforce the limit atomically or through a safe concurrency strategy.

---

# Limit-Reached Race

One command may succeed.

The other should return:

```text
limit_reached
```

without partial state.

---

# Limit Reset

When a reset period applies:

- Use a defined time zone or provider period.
- Record period boundaries.
- Avoid device-clock manipulation.
- Reconcile across devices.

---

# Billing-Period Limit

A limit tied to billing period should use verified period boundaries.

---

# Downgrade Over-Limit State

When existing usage exceeds a lower-plan limit:

```text
over_limit_preserved
```

Potential behavior:

- Existing state readable
- Existing state editable under defined rules
- New creation blocked
- User deletion available
- Export available

---

# Usage Repair

If usage counters drift:

- Recalculate from canonical Product data.
- Avoid deleting Product entities.
- Preserve access while repair occurs where safe.
- Audit the correction.

---

# Paywall Architecture

Paywalls should explain a capability boundary.

They must not obscure user-owned data.

---

# Paywall Types

Recommended:

```text
soft_gate

hard_action_gate

limit_gate

read_only_gate

trial_offer

ad_free_offer

provider_unavailable_gate
```

---

# Soft Gate

Used for optional discovery.

The user may dismiss it and continue core Product use.

---

# Hard Action Gate

Blocks only the specific paid-only action.

It must preserve viewing and safe exit.

---

# Limit Gate

Shown after a canonical limit decision.

---

# Read-Only Gate

Explains why an existing Premium-created configuration can be viewed but not newly modified.

---

# Trial Offer Gate

Presents verified trial terms.

---

# Ad-Free Offer Gate

Explains that Premium removes eligible Advertising.

It must not imply that Privacy requires purchase.

---

# Provider-Unavailable Gate

```text
Premium purchase is temporarily unavailable.

Your current Product access and financial records remain unchanged.
```

---

# Paywall Content Structure

Recommended:

```text
Capability title

Why it is unavailable

Current plan

Premium behavior

Price and period if loaded

Data-preservation statement

Primary purchase or management action

Restore purchases

Not now

Help
```

---

# Paywall Primary Action

Use:

```text
View Premium plan

Subscribe through Google Play

Manage subscription
```

according to context.

---

# Paywall Secondary Action

Recommended:

```text
Not now
```

or:

```text
Return to [Product section]
```

---

# Paywall Data-Preservation Message

```text
Your existing Nexio financial records remain available regardless of this plan decision.
```

---

# Paywall Frequency Governance

Do not show a full paywall:

- On every application open
- After every Transaction
- Repeatedly after dismissal
- During Security or deletion
- During unresolved financial operations
- During provider outage

---

# Paywall Dismissal

Dismissal should be respected for the approved interval.

It must not disable future access to the upgrade screen when the user selects it manually.

---

# Paywall Accessibility

Required:

```text
□ Focus moves to the paywall heading.

□ Plan and price are announced together.

□ Close or Not now is reachable.

□ Restore purchases is reachable.

□ Content does not use color-only comparison.

□ Scrolling works at large text sizes.

□ Provider terms links are descriptive.

□ Screen-reader reading order is logical.
```

---

# Paywall Experiment Boundaries

Allowed:

- Heading order
- Neutral capability description
- Illustration presence
- Comparison layout

Prohibited:

- Hiding Not now
- Hiding billing period
- Hiding renewal
- Hiding Restore
- False urgency
- Defaulting to purchase without explicit action

---

# Advertising Master Flow

Recommended:

```text
Application opens or placement becomes visible

↓

Validate current owner

↓

Load effective plan and ad-free entitlement

↓

Load Advertising Privacy state

↓

Check region and age-related configuration where applicable

↓

Check placement Registry

↓

Check current Product journey

↓

Check frequency and viewability

↓

Initialize provider only when eligible

↓

Request privacy-safe Ad

↓

Render labeled Advertisement

↓

Track provider-safe state

↓

Destroy or hide when no longer eligible
```

---

# Advertising Eligibility Service

Potential operation:

```text
EvaluateAdPlacement
```

Input:

```text
ownerId

placementId

screen

journeyState

platform

region

privacyState

effectiveEntitlements

currentTime
```

Output:

```text
eligibilityState

providerId

AdFormat

privacyMode

suppressionReason

refreshPolicy
```

---

# Critical Journey Suppression

The following Product states should suppress Ads:

```text
Authentication

Password recovery

Account recovery

Transaction editing

Transaction confirmation

Transfer editing

Transfer confirmation

Unknown financial outcome

Conflict resolution

Import confirmation

Export preparation and download

Privacy settings

Account deletion

Security activity

Support escalation

Billing verification

Restore purchases
```

---

# Ad Placement Lifecycle

Recommended states:

```text
not_evaluated

suppressed

eligible

initializing_provider

loading

loaded

displayed

hidden

destroyed

failed_retryable

failed_final
```

---

# Ad Request Identity

Potential fields:

```text
adRequestId

ownerContextVersion

placementId

providerId

format

privacyMode

requestedAt

state

failureCategory
```

Do not include exact financial data.

---

# Ad Request Cancellation

Cancel or ignore result when:

- Owner switches
- Ad-free entitlement activates
- Privacy choice changes
- Placement leaves the screen
- Critical journey begins
- Application moves to an unsupported state
- Provider is disabled

---

# Stale Ad Callback

A provider may return an Ad after the owner or screen changes.

Before rendering:

```text
Revalidate owner.

Revalidate placement.

Revalidate ad-free entitlement.

Revalidate Privacy.

Revalidate journey state.
```

---

# Ad View Destruction

When a placement is no longer eligible:

- Remove the provider view.
- Release listener references.
- Stop refresh timers.
- Avoid memory leaks.
- Preserve Product layout.
- Avoid reporting a display after destruction.

---

# Banner Advertisement Flow

Recommended:

```text
Evaluate placement.

↓

Reserve stable optional layout space only when appropriate.

↓

Load Ad.

↓

Render Sponsored label.

↓

Expose accessible Advertisement boundary.

↓

Destroy when hidden or owner state changes.
```

---

# Banner Layout Shift Prevention

Potential:

- Use bounded placeholder only after eligibility.
- Collapse safely when no Ad loads.
- Avoid moving primary Product controls unexpectedly.
- Avoid placing banners between a label and its related field.

---

# Native Advertisement Flow

A native Ad must:

- Use provider-approved components.
- Display the required Advertisement label.
- Avoid Product financial-card styling.
- Avoid placement inside financial record lists where confusion is likely.
- Preserve accessible identification.

---

# Interstitial Advertisement Flow

Any approved interstitial should require:

```text
Noncritical context

User not editing financial data

No unresolved operation

No recent interstitial

Privacy eligibility

Plan eligibility

Provider availability
```

---

# Interstitial Prohibitions

Do not display immediately:

- After Save Transaction
- Before viewing a Report
- Before Export
- After a failed operation
- During application startup before user access
- When resuming from provider billing
- During Account deletion

---

# Rewarded Advertisement Flow

Potential:

```text
User voluntarily selects optional reward.

↓

Nexio explains reward and Ad behavior.

↓

Advertising eligibility is verified.

↓

Provider Ad is loaded.

↓

User chooses to view.

↓

Provider returns completion event.

↓

Nexio verifies reward criteria.

↓

Canonical bounded reward is granted.
```

---

# Rewarded Ad Prohibition

A rewarded Ad must not grant:

- Financial-record access
- Account deletion access
- Security features
- Required Accessibility
- Unlimited sensitive Export
- Currency conversion authority
- Canonical Money corrections

---

# Reward Identity

Every reward grant should have:

```text
rewardAttemptId

ownerId

placementId

providerAdReference

rewardType

state

grantedAt

expiration
```

---

# Reward Callback Idempotency

Repeated provider callbacks must not grant the reward twice.

---

# AdMob Adapter Architecture

An AdMob integration should remain behind the Advertising Provider Adapter.

Potential Adapter responsibilities:

```text
initializeSdk

configureRequest

loadBanner

loadNative

loadInterstitial

loadRewarded

showInterstitial

showRewarded

destroyPlacement

updateConsentState

setTestMode

healthCheck
```

---

# AdMob Initialization Preconditions

Before initialization:

```text
□ Active Production or test configuration exists.

□ Current platform supports the SDK.

□ Privacy state is known.

□ Required regional consent flow is complete where applicable.

□ Owner is not currently verified ad-free when initialization can be avoided.

□ Provider kill switch is not active.

□ Environment is correct.
```

---

# AdMob Test Environment

Development should use provider-approved test identifiers or test-device configuration.

Do not use Production Ads for ordinary development testing.

---

# AdMob Production Environment

Production should use:

- Production application identifier
- Production placement identifiers
- Approved consent configuration
- Approved child-directed or age configuration where applicable
- Provider monitoring
- Kill switch

Exact identifiers must remain outside public documentation and ordinary logs.

---

# AdMob Privacy Mode

The Adapter should accept a canonical Privacy decision such as:

```text
personalized_allowed

nonpersonalized_only

restricted_processing

no_request

unknown
```

Provider-specific request configuration remains inside the Adapter.

---

# Unknown Advertising Privacy State

When Privacy state is unknown:

```text
Suppress the Advertisement request.
```

Do not default silently to personalized Advertising.

---

# Privacy Choice Change during Loaded Ad

When the user withdraws optional Advertising processing:

- Stop future eligible requests.
- Destroy loaded Ad where required by policy.
- Update provider consent state.
- Clear eligible identifiers where required.
- Preserve the Product layout.
- Record preference propagation.

---

# Ad-Free Purchase during Loaded Ad

When Premium activates:

- Stop refresh.
- Hide or destroy current Ad.
- Remove containers.
- Prevent new requests.
- Update all active screens.
- Revalidate after application restart.

---

# Advertising Provider Failure

Failure categories may include:

```text
initialization_failed

configuration_error

network_error

no_fill

request_rejected

invalid_placement

consent_missing

sdk_unavailable

render_failure

unknown
```

---

# No-Fill Behavior

No-fill is not a Product error.

Behavior:

```text
Hide the Advertisement slot.

Preserve the Product interface.

Do not notify the user unnecessarily.
```

---

# Ad Network Error

Use bounded Retry only when:

- Placement remains visible
- Owner remains eligible
- Privacy permits
- Frequency policy permits
- Battery and bandwidth policy permits

---

# Ad Provider Configuration Error

- Disable the affected placement.
- Alert Operations.
- Preserve Product use.
- Avoid repeated requests.
- Do not show raw identifiers.

---

# Advertisement Click Return

When the user returns to Nexio:

- Restore the prior Product state safely.
- Revalidate the current owner.
- Do not alter financial state.
- Avoid showing another Ad immediately.
- Preserve focus where possible.

---

# Advertisement Accessibility Failure

If a provider Ad cannot meet required accessibility:

```text
Suppress the placement.
```

Revenue does not override required accessibility.

---

# Ad Placement Performance

Advertising should not:

- Block initial Product render
- Delay Transaction interaction
- Cause repeated layout shift
- Create long main-thread stalls
- Excessively consume battery
- Trigger repeated network activity in the background

---

# Advertising Offline Behavior

When offline:

- Do not show broken Ad frames.
- Do not repeatedly retry.
- Keep Product access.
- Apply ad-free entitlement normally.
- Show no replacement paywall unless user selected it.

---

# Advertising Account Switching Flow

Before activating the new owner:

```text
Destroy prior-owner Ad views.

Clear prior-owner ad-free state from memory.

Clear prior-owner Advertising Privacy state.

Load new-owner entitlements.

Load new-owner Privacy choices.

Reevaluate every placement.

Initialize or suppress provider.
```

---

# Advertising Sign-Out Flow

After Sign-out:

- Destroy owner-specific Ads.
- Stop requests.
- Clear owner-specific Advertising state.
- Avoid showing Ads on protected Authentication or recovery surfaces.
- Reinitialize only after a valid owner and Privacy state exist.

---

# Advertising Account Deletion Flow

When deletion begins:

- Stop Ad requests.
- Destroy current Ads.
- Stop Advertising Analytics.
- Remove or reset provider identifiers according to policy.
- Stop optional monetization messages.
- Preserve only required audit evidence.
- Do not show an ad-supported reactivation screen inside deletion.

---

# Advertising Frequency Architecture

Potential controls:

```text
Minimum interval between requests

Maximum impressions per session

Maximum interstitials per day

Maximum rewarded attempts

Placement-specific refresh interval

Post-click cooldown

Post-dismissal cooldown
```

---

# Frequency Source

Frequency should use canonical or reliable local state.

Avoid user-identifying financial context.

---

# Ad Frequency after Owner Switch

Frequency state should be owner-scoped where relevant.

Prior-owner exposure must not determine the new owner's eligibility incorrectly.

---

# Monetization Error Architecture

Every error should identify:

```text
Current purchase state

Current entitlement state

Whether user action is required

Whether Retry is safe

Whether another purchase should be avoided

Whether Support is required
```

---

# Purchase Error States

Recommended:

```text
Product_unavailable

offer_unavailable

billing_unavailable

purchase_cancelled

purchase_pending

purchase_unknown_outcome

verification_failed

acknowledgment_failed

already_owned

ownership_review_required

provider_configuration_error
```

---

# Entitlement Error States

Recommended:

```text
entitlement_sync_pending

entitlement_sync_failed

entitlement_cache_expired

entitlement_conflict

false_revocation_protection

unknown_access_state
```

---

# Advertising Error States

Recommended:

```text
ad_suppressed

ad_provider_unavailable

ad_consent_missing

ad_placement_invalid

ad_render_failed

ad_free_sync_pending
```

---

# Error Recovery — Purchase Unknown

```text
Open current plan.

Refresh purchase status.

Query provider purchases.

Verify original purchase reference.

Do not start another equivalent purchase.
```

---

# Error Recovery — Verification Failure

Potential actions:

```text
Retry verification

Restore purchases

Open provider purchase history

Contact Support
```

A new purchase should not be the default recovery.

---

# Error Recovery — Entitlement Not Applied

```text
Refresh Product access

Restore purchases

Reopen the affected screen

Contact Support with the purchase-attempt reference
```

Do not ask the user for the raw purchase token.

---

# Error Recovery — Ad-Free Not Applied

```text
Refresh current plan.

Verify the ad-free entitlement.

Suppress new Ads while the verified access is being applied.

Do not ask the user to repurchase.
```

---

# Billing Provider Outage Architecture

During provider outage:

```text
Disable new purchase initiation.

Preserve verified current access.

Keep current plan visible.

Keep Restore visible but indicate provider unavailability.

Keep subscription management link where independently available.

Keep financial records, Export and deletion available.
```

---

# Provider Outage Message

```text
Google Play billing is temporarily unavailable

New purchases and purchase restoration may be delayed.

Your current verified Nexio access and financial records remain available.
```

---

# Verification Service Outage

When Nexio's verification service is unavailable:

- Stop final entitlement grants from new unverified purchases.
- Preserve pending purchase references.
- Preserve current verified entitlements.
- Avoid duplicate purchase prompts.
- Reconcile after recovery.

---

# Entitlement Service Outage

When entitlement persistence fails after verified purchase:

- Preserve verification evidence.
- Mark propagation pending.
- Avoid asking the user to purchase again.
- Suppress Ads where safe when ad-free purchase is proven.
- Alert Operations.
- Repair idempotently.

---

# Advertising Provider Outage

- Hide Ads.
- Preserve Product use.
- Stop aggressive Retry.
- Keep Premium purchase separate.
- Avoid replacing Ads with misleading Product content.

---

# Store Product Misconfiguration

When Product mapping is wrong:

```text
Pause the affected Product.

Hide the purchase button.

Preserve active entitlements.

Alert Operations.

Correct configuration.

Revalidate before release.
```

---

# Product Removed from Store

Existing subscriptions and entitlements may require continued reconciliation.

Do not assume immediate expiration.

New purchase should be disabled.

---

# Application Package Mismatch

A purchase verified for another application identity must not grant access.

---

# Environment Mismatch

A test purchase must not grant uncontrolled Production access.

A Production purchase must not be processed through the test environment.

---

# Billing Retry Architecture

Retries should be:

- Idempotent
- Provider-aware
- State-aware
- Bounded
- Backed off
- Owner-scoped
- Purchase-reference-preserving

---

# Billing Retry Prohibitions

Do not Retry by creating a new purchase attempt when:

- Purchase is pending
- Purchase outcome is unknown
- Verification is pending
- Acknowledgment is pending
- Restore is processing
- Provider already reports owned

---

# Provider Query Retry

A purchase query may retry with the same reconciliation operation.

It must not modify the provider purchase.

---

# Verification Retry

Use the same provider purchase reference.

---

# Acknowledgment Retry

Use the same acknowledgment identity.

---

# Entitlement Propagation Retry

Use the same entitlement record and version.

---

# Restore Retry

Use the same restore attempt when the provider query did not produce a final result.

---

# Monetization Notification Flows

Potential messages:

```text
Purchase pending

Purchase verified

Premium active

Subscription cancelled

Trial ending

Payment requires attention

Subscription expired

Refund confirmed

Restore completed
```

All must comply with the Notifications specification.

---

# Purchase Notification Privacy

Do not include:

- Exact financial-record content
- Purchase token
- Full order identifier
- Payment-card details
- Another owner's plan state

---

# Purchase Completed Notification

```text
Your Nexio Premium access is active.
```

Use only after verified entitlement activation.

---

# Purchase Pending Notification

```text
Your Nexio purchase is still pending with the billing provider.
```

---

# Subscription Cancelled Notification

```text
Your Nexio subscription is cancelled and remains active until the verified end Date.
```

---

# Refund Notification

```text
The billing provider confirmed a refund.

Your Nexio Product access now follows the updated verified plan state.
```

---

# Monetization Support Diagnostics

Support should be able to inspect safe fields such as:

```text
purchaseAttemptId

providerId

canonicalProductId

providerProductId

purchaseState

verificationState

acknowledgmentState

subscriptionState

effectiveEntitlementState

restoreAttemptState

propagationState

ProductVersion

platform

lastVerifiedAt
```

---

# Support Diagnostic Prohibitions

Support should not receive by default:

```text
Raw purchase token

Full provider receipt

Payment-card data

Advertising identifier

Other-owner billing data

Exact private financial records

Provider credentials
```

---

# Support Purchase Recovery Flow

Recommended:

```text
Confirm current Nexio owner.

↓

Read purchase attempt.

↓

Read provider query state.

↓

Read verification state.

↓

Read acknowledgment state.

↓

Read entitlement state.

↓

Identify safe next action.

↓

Avoid repurchase until original state is reconciled.
```

---

# Support Scenario — Purchase Charged but Premium Missing

Expected steps:

```text
1. Do not ask the user to purchase again.

2. Identify the current Nexio owner.

3. Use Restore purchases.

4. Query and verify the provider purchase.

5. Check acknowledgment.

6. Check entitlement propagation.

7. Escalate ownership conflict without exposing another owner.
```

---

# Support Scenario — Purchase Pending

Expected:

```text
Explain that the billing provider has not completed the purchase.

Do not grant access manually unless an approved bounded Support grant applies.

Do not create a second purchase.
```

---

# Support Scenario — Ads after Premium Purchase

Expected:

```text
Verify purchase and ad-free entitlement.

Refresh entitlement propagation.

Suppress new Ad requests while verified ad-free access is being repaired.

Do not request another purchase.
```

---

# Support Scenario — Subscription Cancelled but Access Active

Expected:

```text
Explain that cancellation may stop renewal while access remains active until the verified current-period end.
```

---

# Support Scenario — Account Deletion with Active Subscription

Expected:

```text
Allow Nexio Account deletion.

Explain that Google Play subscription cancellation may require a separate store action.

Do not block deletion.
```

---

# Support Scenario — Purchase Linked Elsewhere

Expected:

```text
Escalate through the approved ownership-review process.

Do not reveal another owner.

Do not manually move the purchase without authority.
```

---

# Support Restore Macro

```text
Use Restore purchases while signed in to the intended Nexio Account.

Nexio will query the current store Account, verify eligible purchases and apply access only after ownership checks.
```

---

# Support Unknown Purchase Macro

```text
Nexio is checking the original purchase attempt.

Do not purchase the same plan again yet.

Your current financial records remain available.
```

---

# Support Ad-Free Macro

```text
Nexio is verifying the ad-free entitlement.

New Advertisement requests should remain suppressed while the verified access is applied.

Do not repurchase the plan.
```

---

# Monetization Testing Architecture

Required test categories:

```text
Catalogue

Product mapping

Price and offer

Purchase

Pending purchase

Verification

Acknowledgment

Restore

Subscription lifecycle

Trial

Upgrade

Downgrade

Cancellation

Grace

Hold

Refund

Chargeback

Entitlement

Offline access

Limits

Paywalls

Advertising

AdMob Adapter

Owner isolation

Accessibility

Privacy

Security

Account deletion

Failure recovery

Performance
```

---

# Product Catalogue Tests

```text
Active Product

Paused Product

Deprecated Product

Wrong platform

Wrong region

Missing provider mapping

Partial provider response

Provider Product removed

Stale cached Product
```

---

# Price Tests

```text
Provider-localized BRL price

Different provider Currency

Monthly billing period

Annual billing period

Trial offer

Introductory price

Expired offer

Unknown offer eligibility

Price-load failure
```

Do not convert provider prices.

---

# Purchase Tests

```text
Successful verified purchase

User cancellation

Pending purchase

Already owned

Product unavailable

Provider disconnected

Network timeout

Unknown outcome

Repeated button tap

Application backgrounding

Rotation

Process death

Application update
```

---

# Verification Tests

```text
Valid provider reference

Wrong application

Wrong environment

Unknown Product

Duplicate purchase reference

Refunded purchase

Revoked purchase

Malformed response

Provider timeout

Ownership conflict

Deleted-owner reference
```

---

# Acknowledgment Tests

```text
Not required

Successful acknowledgment

Temporary failure

Permanent failure

Unknown outcome

Repeated callback

Repeated Retry

Application process death
```

---

# Restore Tests

```text
No purchases

One active purchase

Several purchases

Pending purchase

Already current owner

Ownership conflict

Provider unavailable

Partial verification

Reinstall

New device

Local-data clear
```

---

# Subscription Lifecycle Tests

```text
pending → active

active → cancelled_active

cancelled_active → expired

active → grace

grace → active

grace → on_hold

on_hold → active

active → paused

paused → active

active → refunded

active → chargeback

out-of-order provider event

duplicate provider event
```

---

# Trial Tests

```text
Eligible trial

Ineligible trial

Trial started

Trial cancelled-active

Trial converted

Trial expired

Trial provider state unknown

Trial reminder
```

---

# Upgrade Tests

```text
Eligible replacement

Immediate upgrade

Provider-determined timing

Unknown proration

Replacement verification

Old purchase preserved historically

Duplicate entitlement prevention

Unknown outcome
```

---

# Downgrade Tests

```text
Next-period downgrade

Existing premium data preserved

Over-limit preserved state

Read-only behavior

Advertising reactivation

Cancellation of pending downgrade where supported

Unknown effective Date
```

---

# Cancellation Tests

```text
Manage subscription opens

Provider management unavailable

Cancellation confirmed

No cancellation change

Cancellation state unknown

Access remains to period end

Account deletion remains available
```

---

# Grace and Hold Tests

```text
Grace active

Grace recovery

Grace to hold

Hold access policy

Payment method action

Core financial data access

Export access

Deletion access
```

---

# Refund and Chargeback Tests

```text
Refund verified

Refund event repeated

Chargeback verified

Entitlement recalculation

Data preservation

Ad-free removal

Alternate promotional entitlement remains
```

---

# Entitlement Tests

```text
Single active source

Several active sources

One source expires

Promotion overlaps subscription

Owner switch

Sign-out

Offline cache valid

Offline cache expired

Propagation failure

False revocation protection
```

---

# Limit Tests

```text
Within limit

Final available slot

Concurrent final-slot requests

Limit reached

Over-limit after downgrade

Period reset

Counter repair

Offline usage

Cross-device usage
```

---

# Paywall Tests

```text
Soft gate

Hard action gate

Limit gate

Read-only gate

Trial offer

Provider unavailable

Dismissal

Large text

Keyboard

Screen reader

Repeated display suppression
```

---

# Advertising Eligibility Tests

```text
Free eligible owner

Premium ad-free owner

Ad-free verification pending

Privacy disallows request

Critical journey

Wrong platform

Provider disabled

Offline

Frequency limit

Account switching

Sign-out

Account deletion
```

---

# Banner Ad Tests

```text
Load success

No fill

Network error

Layout collapse

Large text

Screen reader label

Owner switch while loading

Premium activates while loaded

Privacy withdrawal while loaded
```

---

# Native Ad Tests

```text
Sponsored label

Visual separation

Screen-reader identification

Product-list confusion prevention

Provider render failure
```

---

# Interstitial Tests

```text
Approved noncritical context

Critical context suppression

Frequency cap

Application resume

Post-click cooldown

No repeated display after Save
```

---

# Rewarded Ad Tests

```text
Voluntary start

Provider completion

User closes early

Duplicate callback

Reward idempotency

Ad-free owner policy

Privacy withdrawal

Account switch
```

---

# AdMob Adapter Tests

```text
Test configuration

Production configuration

Wrong environment

Initialization after consent

Initialization suppressed for ad-free owner

No-fill

Network error

Invalid placement

SDK unavailable

Kill switch

Privacy-state update

Destroy lifecycle
```

---

# Owner-Isolation Tests

```text
Owner A purchase cannot grant Owner B access.

Owner A plan screen cannot show Owner B subscription.

Purchase reference conflict does not reveal Owner B.

Owner switch clears entitlement cache.

Owner switch destroys prior-owner Ads.

Deleted owner does not reactivate through Restore automatically.
```

---

# Accessibility Tests

```text
Plan comparison by screen reader

Price and billing period announcement

Trial terms

Purchase button

Restore purchases

Manage subscription

Pending state announcement

Error focus

Paywall dismissal

Advertisement label

Ad focus order

Large-text layout
```

---

# Privacy Tests

```text
No financial data in Ad request

No purchase token in Analytics

Advertising withdrawal

Nonpersonalized path where applicable

Ad identifier cleanup

Account deletion

Provider data retention

Support redaction
```

---

# Security Tests

```text
Fake purchase callback

Receipt replay

Token theft simulation

Webhook forgery

Webhook replay

Wrong Product mapping

Environment mismatch

Client premium-flag tampering

Provider SDK unauthorized data access

Malicious Ad deep link
```

---

# Account Deletion Tests

```text
Active subscription

Cancelled-active subscription

Pending purchase

Active trial

Promotional entitlement

Ad identifier

Restore after deletion

Recreated owner

External subscription remains

Ads stop during deletion
```

---

# Failure-Injection Tests

Inject:

```text
Billing disconnect

Product-query timeout

Purchase callback loss

Application process death

Verification service outage

Acknowledgment timeout

Entitlement database failure

Propagation failure

Provider event duplication

Provider event out of order

Ad network outage

Ad SDK crash

Privacy-state conflict
```

---

# Performance Tests

Verify:

- Product screen load
- Provider-query latency behavior
- Entitlement-evaluation latency
- Feature-gate latency
- Plan comparison rendering
- Ad load does not block core Product
- Advertisement cleanup
- Owner-switch cleanup
- Restore of several purchases

---

# Monetization Release Gates

Do not release billing when:

```text
Provider prices are hardcoded as current.

Product mapping is unverified.

Client callback grants durable access directly.

Purchase verification is missing.

Purchase identities are not stable.

Pending purchases can be repurchased blindly.

Acknowledgment Retry is not idempotent.

Restore purchases is unavailable.

Owner-association tests fail.

Cancellation and expiration are conflated.

Downgrade deletes Product data.

Account deletion is blocked by subscription.

Provider kill switch is missing.
```

---

# Advertising Release Gates

Do not release Advertising when:

```text
Financial data reaches the provider.

Ads appear in Critical journeys.

Ad-free entitlement does not suppress requests.

Privacy state is ignored.

Unknown Privacy defaults to personalized Advertising.

Advertisements are not labeled.

Accessibility tests fail.

Provider failure blocks Product use.

Account switching preserves prior-owner Ad state.

Account deletion continues Ad requests.

Production identifiers are used in ordinary development tests.

Kill switch is missing.
```

---

# Operational Monitoring

Monitor:

```text
Product-query success

Product-mapping mismatch

Purchase-attempt count

Pending-purchase age

Unknown-purchase outcomes

Verification failures

Acknowledgment failures

Restore failures

Subscription-state conflicts

Entitlement-propagation failures

False grant signals

False revocation signals

Duplicate purchase prevention

Limit-enforcement failures

Ad-free propagation

Ad request suppression

Advertising Privacy failures

Critical-journey Ad exposure

Provider health
```

---

# Critical Alerts

Trigger immediately for:

```text
Cross-owner entitlement

Duplicate charge caused by Nexio flow

False purchase completion

Purchase token exposure

Webhook authorization bypass

Premium access granted from invalid purchase

Valid entitlement revoked from provider timeout

Account deletion blocked by billing

Advertising request containing financial data

Advertisement displayed during Account deletion

Ad-free owner receiving systematic Ad requests
```

---

# High Alerts

Potential:

```text
Verification failure spike

Acknowledgment backlog

Pending purchase aging

Restore failure spike

Entitlement propagation backlog

Product mapping misconfiguration

Ad SDK initialization failure spike

Privacy suppression failure

Manage-subscription link failure
```

---

# Billing Runbooks

Required runbooks may include:

```text
Billing provider outage

Product mapping failure

Purchase unknown outcome

Pending purchase aging

Verification failure

Acknowledgment backlog

Restore failure

Cross-owner ownership conflict

False entitlement grant

False entitlement revocation

Subscription-event ordering issue

Account deletion with active billing
```

---

# Advertising Runbooks

Required:

```text
Ad provider outage

Financial-data leakage to provider

Ad-free suppression failure

Critical-journey Ad exposure

Consent-state failure

Invalid Production configuration

Mass Ad reload

Ad SDK crash

Provider kill switch

Ad identifier deletion failure
```

---

# Part 2 Anti-Patterns

The following are prohibited:

## Purchase Button before Price Load

Allowing purchase without verified provider Product information.

## New Attempt on Every Tap

Creating multiple purchase flows from repeated input.

## Provider UI Opened Means Purchased

Granting entitlement when the billing screen appears.

## Callback Means Verified

Trusting a client callback as durable authority.

## Pending Means Failed

Prompting immediate repurchase for a pending payment.

## Closed UI Means Cancelled

Assuming provider cancellation without reconciliation.

## Process Death Loses Purchase

Discarding the original attempt after Android process termination.

## Acknowledgment before Verification

Acknowledging an invalid or unmapped purchase.

## New Purchase to Repair Acknowledgment

Asking the user to pay again because acknowledgment failed.

## Restore without Owner Review

Attaching all store purchases automatically to any signed-in Nexio owner.

## Cancellation Revokes Immediately

Removing access before the verified paid period ends.

## Grace Treated as Expired

Removing access despite an active provider grace period.

## Refund Deletes Data

Deleting Product records after refund or chargeback.

## Upgrade Price Invented by Nexio

Calculating a store charge independently.

## Downgrade Deletes Excess Items

Removing Goals, Reports or Attachments automatically.

## UI-Only Premium Enforcement

Hiding controls without validating Application commands.

## Stale Cache Permanent Authority

Keeping Premium forever from an old local flag.

## Limit from Analytics

Using event counts instead of canonical Product data.

## Paywall in Security Flow

Interrupting Authentication, recovery or deletion with an offer.

## Paywall without Not Now

Preventing safe return to the core Product.

## Ad Loaded before Privacy Decision

Initializing personalized Advertising before applicable choice.

## Ad after Ad-Free Activation

Continuing requests or rendering stale callbacks.

## Ad Callback after Owner Switch

Rendering an Ad based on the prior owner's state.

## Interstitial after Every Save

Turning financial recording into an Advertising trigger.

## Rewarded Ad for User Data Access

Requiring Advertising to view or Export financial records.

## No-Fill as Product Error

Showing a broken Ad container or blocking Product use.

## AdMob Production Traffic in Development

Using live Ads during ordinary testing.

## Support Requests Purchase Token

Asking the user to send raw billing credentials.

## Revenue before Reconciliation

Counting an unverified callback as a completed subscription.

---

# Part 2 Review Questions

## Product Loading

```text
Is the Product active in the canonical Catalogue?

Does the provider mapping exist?

Did the provider return the current price?

Is the offer eligible?

Is the purchase action hidden when loading fails?
```

---

## Android Purchase

```text
Which purchaseAttemptId applies?

Can repeated taps create another flow?

What happens during process death?

Which provider callback category was returned?

Was the current purchase list queried?
```

---

## Purchase Verification

```text
Which provider authority verifies the purchase?

Does the Product and application identity match?

Is the purchase reference unique?

Is the current owner association valid?

Could the purchase be refunded or revoked?
```

---

## Acknowledgment

```text
Is acknowledgment required?

Was the purchase verified first?

Which acknowledgment identity applies?

Can timeout create a duplicate?

What happens when acknowledgment remains unknown?
```

---

## Pending Purchase

```text
Is the provider state truly pending?

Is Premium still inactive?

Is another purchase blocked?

How is reconciliation triggered?

When should Support become involved?
```

---

## Restore

```text
Which store Account is queried?

Which Nexio owner is current?

How are purchase references verified?

Could a purchase belong to another owner?

Does the summary distinguish restored, pending and conflicted results?
```

---

## Subscription

```text
Is the current period verified?

Is auto-renew known?

Is cancellation distinct from expiration?

Does grace or hold apply?

Which entitlement sources remain active?
```

---

## Trial

```text
Is trial eligibility provider-confirmed?

Are trial and post-trial prices displayed?

Is renewal visible?

Can the user manage or cancel through the provider?

What happens to data after expiration?
```

---

## Upgrade and Downgrade

```text
Does the provider define the effective timing?

Is pricing provider-returned?

Is replacement identity preserved?

Are old and new entitlements reconciled?

Does downgrade preserve existing data?
```

---

## Refund and Chargeback

```text
Is the provider event verified?

Which purchase is affected?

Does another entitlement still grant access?

Is Product data preserved?

Is Account deletion still available?
```

---

## Entitlement Propagation

```text
Was the canonical entitlement persisted?

Did the current device update?

Did Ads stop for ad-free access?

Did other devices receive the new version?

Can a propagation failure be repaired without repurchase?
```

---

## Limits

```text
Which canonical capability is limited?

Which canonical state defines usage?

Is enforcement atomic?

What happens after downgrade?

Are existing excess items preserved?
```

---

## Paywall

```text
Does the user understand the capability boundary?

Is the provider price current?

Is billing period visible?

Is Not now available?

Are Restore and Manage subscription available where relevant?
```

---

## Advertising

```text
Is the placement registered?

Is the owner ad-free?

Does Privacy permit the request?

Is the journey noncritical?

Which data is sent to the provider?

Can a stale callback render after Account switching?
```

---

## AdMob

```text
Is the environment test or Production?

Is SDK initialization necessary?

Is Privacy state known?

Are placement identifiers valid?

Does the kill switch work?

Can the SDK access financial data?
```

---

## Failure Recovery

```text
Does the original purchase identity remain available?

Is Retry safe?

Could another purchase duplicate billing?

Does current access remain stable?

Does the user know where to obtain Support?
```

---

# Part 2 Acceptance Criteria

The practical monetization architecture is accepted only when:

```text
□ Product Catalogue loading precedes purchase presentation.

□ Platform, region and Product status are validated.

□ Provider Product mapping is active.

□ Provider-localized prices are loaded before purchase.

□ Hardcoded fallback prices are not presented as current.

□ Billing periods are displayed.

□ Trial and introductory terms are displayed completely.

□ Offer eligibility is provider-verified.

□ Expired offers are reloaded.

□ Current owner is validated before purchase.

□ Active equivalent subscriptions prevent duplicate purchase prompts.

□ Pending equivalent purchases prevent blind repurchase.

□ Every purchase attempt has one stable identity.

□ Repeated taps do not create several provider flows.

□ The final purchase action names the provider.

□ Android billing availability is explicit.

□ Billing connection loss preserves the current attempt.

□ Opening provider UI does not grant entitlement.

□ Android backgrounding does not imply cancellation.

□ Provider callbacks are mapped through an Adapter.

□ Client callbacks trigger verification rather than access directly.

□ Purchased callbacks remain unverified until trusted validation.

□ Purchase verification progress is visible.

□ Pending purchases do not grant Premium prematurely.

□ Pending purchases block equivalent repurchase.

□ Pending purchases are reconciled on resume and reconnect.

□ Pending purchase aging is handled.

□ Closing provider UI is not assumed to be cancellation.

□ Already-owned results trigger restore or verification.

□ Provider configuration errors disable the affected Product.

□ Android process death supports purchase reconciliation.

□ Rotation does not relaunch purchase UI.

□ Application updates preserve pending purchase identity.

□ Verification checks provider and environment.

□ Verification checks application identity.

□ Verification checks canonical Product mapping.

□ Verification checks purchase state.

□ Verification checks uniqueness.

□ Verification checks refund and revocation.

□ Verification checks owner association.

□ Cross-owner conflicts reveal no other-owner data.

□ Deleted-owner references use an approved reassociation policy.

□ Verification failure categories are explicit.

□ Verification Retry preserves the same provider reference.

□ Verification is idempotent.

□ Acknowledgment occurs after verification.

□ Acknowledgment has a stable operation identity.

□ Acknowledgment timeout becomes unknown outcome.

□ Acknowledgment Retry does not create another purchase.

□ Consumable benefit is durable before provider consumption.

□ Nonconsumable purchases are restorable.

□ Subscription entitlements derive from verified Product mapping.

□ Entitlement grants are idempotent.

□ Purchase completion is shown only after verified access activation.

□ Entitlement propagation follows canonical persistence.

□ Current-device access updates without requiring restart.

□ Cross-device propagation remains owner-scoped.

□ Propagation failures do not require repurchase.

□ Ad-free activation stops new Ad requests.

□ Stale Ads are destroyed after ad-free activation.

□ Entitlement revocation checks alternate active sources.

□ Cache refresh occurs after material lifecycle events.

□ Manual purchase refresh does not create a purchase.

□ Restore purchases is available from relevant billing surfaces.

□ Restore clearly explains provider and owner verification.

□ Restore attempts have stable identities.

□ Provider purchases are deduplicated during Restore.

□ Restore verification uses the same trusted rules as purchase.

□ Restore summaries distinguish active, restored, pending and conflicted results.

□ No-purchase Restore does not change financial data.

□ Provider outage preserves current verified access.

□ Reinstall does not require repurchase.

□ Device change uses verification rather than token copying.

□ Local-data clearing does not destroy canonical access.

□ Subscription reconciliation supports provider queries and events.

□ Subscription state versions are recorded.

□ State transitions are validated.

□ Out-of-order provider events do not overwrite newer state blindly.

□ Active access uses current verified periods.

□ Cancelled-active preserves access through the verified period.

□ Auto-renew state remains distinct from access state.

□ Manage subscription uses the approved provider destination.

□ Management failure preserves current state.

□ Cancellation remains separate from Account deletion.

□ Cancellation avoids dark patterns.

□ Cancellation return triggers provider-state refresh.

□ Unknown cancellation state is represented honestly.

□ Trial eligibility is verified.

□ Trial terms display post-trial pricing.

□ Trial uses normal verified purchase architecture.

□ Trial cancellation does not necessarily end access immediately.

□ Trial conversion avoids duplicate entitlements.

□ Trial expiration preserves Product data.

□ Trial reminders are nonmanipulative.

□ Introductory pricing shows both introductory and renewal pricing.

□ Upgrade offers are provider-authoritative.

□ Nexio does not calculate provider proration.

□ Upgrade replacement relationships are preserved.

□ Unknown upgrade outcomes block repeated plan changes.

□ Downgrade timing follows provider state.

□ Downgrade explains future capability changes.

□ Downgrade preserves existing data.

□ Over-limit state after downgrade is non-destructive.

□ Plan replacement does not create duplicate active subscription interpretation.

□ Grace periods preserve approved temporary access.

□ Grace recovery and failure transitions are supported.

□ Account hold preserves financial records.

□ Account hold keeps subscription management available.

□ Pause behavior is represented where supported.

□ Expiration recalculates effective entitlements.

□ Expiration preserves Accounts, Transactions, Transfers and Exports.

□ Expiration never removes required Accessibility.

□ Refund events are provider-verified.

□ Refunds recalculate entitlements without deleting data.

□ Chargebacks use neutral language.

□ Chargebacks do not create Nexio financial Transactions automatically.

□ Manual grants use canonical entitlement records.

□ Support grants require reason and authority.

□ Manual grants do not modify provider purchase state.

□ Promotions are bounded and auditable.

□ Promotional overlap does not override valid subscription access incorrectly.

□ Feature gates use canonical capability decisions.

□ Application commands recheck entitlement.

□ UI hiding is not the only enforcement.

□ Entitlement uncertainty blocks only affected new Premium actions where appropriate.

□ Usage and limits use canonical Product state.

□ Concurrent final-slot commands are handled safely.

□ Limit resets use defined periods.

□ Over-limit preserved state supports viewing and Export.

□ Usage drift is repaired from canonical data.

□ Paywall types are classified.

□ Paywalls block only the relevant paid action.

□ Paywalls preserve user-owned data access.

□ Paywalls display provider price and billing period.

□ Paywalls keep Restore available where relevant.

□ Paywalls include a safe dismissal path.

□ Paywalls state that financial records remain available.

□ Paywall frequency is bounded.

□ Paywall Accessibility passes.

□ Advertising uses an eligibility service.

□ Ad eligibility checks owner, entitlement and Privacy.

□ Critical journeys suppress Advertising.

□ Ad requests have stable identities.

□ Stale Ad callbacks are revalidated.

□ Ads are destroyed after Account switching or entitlement change.

□ Banner Ads avoid disruptive layout shift.

□ Native Ads are labeled and distinct from Product content.

□ Interstitials are excluded from financial and recovery workflows.

□ Rewarded Ads remain voluntary.

□ Rewarded Ads cannot gate financial data or Privacy rights.

□ Reward grants are idempotent.

□ AdMob remains behind an Adapter.

□ AdMob initializes only after applicable Privacy and entitlement checks.

□ Development uses test Ad configuration.

□ Production configuration is environment-specific.

□ Unknown Advertising Privacy state suppresses requests.

□ Privacy withdrawal stops future eligible Ad requests.

□ Ad-free purchase suppresses loaded and future Ads.

□ Ad provider no-fill does not create Product errors.

□ Ad provider network failure does not block Product use.

□ Ad configuration failure disables the placement safely.

□ Ad clicks do not mutate financial state.

□ Inaccessible Ads are suppressed.

□ Advertising does not block Product performance.

□ Offline Advertising failure remains invisible to core Product use.

□ Owner switching resets all Advertising state.

□ Sign-out stops owner-specific Advertising.

□ Account deletion stops Advertising and identifiers.

□ Ad frequency limits are defined.

□ Monetization errors identify current purchase and entitlement state.

□ Purchase unknown outcome provides reconciliation rather than repurchase.

□ Verification failure offers Restore and Support.

□ Entitlement application failure does not require a new purchase.

□ Billing provider outage disables only new billing operations.

□ Verification outage preserves purchase evidence.

□ Entitlement service failure remains repairable.

□ Advertising provider outage hides Ads safely.

□ Product misconfiguration pauses affected purchase.

□ Removed store Products do not invalidate active access automatically.

□ Test and Production environments remain isolated.

□ Billing retries are bounded and idempotent.

□ Billing Retry never creates a new purchase for a pending or unknown result.

□ Purchase notifications reflect verified states.

□ Support diagnostics exclude raw purchase tokens.

□ Support recovery begins with the original purchase attempt.

□ Support does not recommend repurchase before reconciliation.

□ Support understands cancelled-active access.

□ Support allows Account deletion with active billing.

□ Testing covers Product, purchase, provider, subscription and Advertising lifecycle.

□ Android tests cover rotation, process death and application update.

□ Verification tests cover owner conflicts and environment mismatch.

□ Restore tests cover reinstall and device change.

□ Subscription tests cover out-of-order and duplicate provider events.

□ Limit tests cover concurrency.

□ Paywall tests cover Accessibility and dismissal.

□ Advertising tests cover owner changes and Privacy withdrawal.

□ AdMob tests cover test and Production separation.

□ Security tests cover callback forgery, replay and client tampering.

□ Account deletion tests cover active external subscriptions.

□ Failure injection covers billing, verification, entitlement and Ad providers.

□ Billing and Advertising release gates are defined.

□ Operational monitoring covers pending, unknown, failed and propagated states.

□ Critical alerts cover owner, purchase, deletion and Advertising Privacy failures.

□ Billing and Advertising runbooks are defined.

□ Part 2 monetization anti-patterns are prohibited.
```

---

# Part 2 Monetization Constitutional Rule

Every Android billing screen, Product query, offer, purchase attempt, provider callback, verification operation, acknowledgment, Restore, subscription transition, trial, plan change, entitlement update, limit decision, paywall and Advertisement request must answer:

```text
Does this flow preserve one verified Product, provider purchase identity and Nexio owner; distinguish purchase, billing and entitlement states; prevent duplicate billing and false access; preserve existing financial data through every downgrade or failure; and suppress Advertising whenever Privacy, entitlement, journey or platform state makes the request ineligible?
```

When the answer is uncertain, prefer the action that:

- Preserves the current verified entitlement.
- Blocks another purchase.
- Reconciles the original purchase attempt.
- Queries provider ownership.
- Keeps the purchase pending.
- Avoids acknowledgment duplication.
- Keeps financial records accessible.
- Keeps Export and Account deletion available.
- Preserves Premium-created data as read-only.
- Suppresses the paywall.
- Suppresses the Advertisement.
- Destroys the stale Ad view.
- Uses provider test configuration.
- Disables the Product mapping.
- Disables the billing or Advertising provider.
- Escalates to Support and Operations.
- Blocks the release.

A purchase is not complete because the provider interface opened or a client callback returned success.

A subscription is not inactive merely because renewal was cancelled.

An Advertisement is not eligible merely because the provider SDK can load one.

Monetization is complete only when verified provider state produces the correct owner-scoped entitlement, Product access propagates safely, user data remains protected and every billing or Advertising failure preserves financial trust and user control.

---
---

# Monetization Governance Architecture

Monetization is a governed Product capability.

It must receive the same control applied to:

```text
Financial integrity

Owner isolation

Authentication

Privacy

Accessibility

Data portability

Account deletion

Production reliability

Provider integrations

User communications
```

Governance must cover the complete lifecycle:

```text
Product strategy

↓

Canonical Product Catalogue

↓

Provider Product configuration

↓

Price and offer retrieval

↓

Purchase attempt

↓

Provider verification

↓

Acknowledgment or consumption

↓

Subscription reconciliation

↓

Entitlement calculation

↓

Capability access

↓

Advertising eligibility

↓

Measurement

↓

Audit

↓

Deprecation or removal
```

A plan is not active merely because it appears in the interface.

A purchase is not valid merely because a client callback exists.

An entitlement is not current merely because a local cache says `premium = true`.

A monetization capability is governed only when Nexio can prove:

```text
Which canonical Product was offered

Which provider Product was used

Which localized price was shown

Which owner initiated the purchase

Which provider purchase identity was verified

Which entitlement was granted

Which current period applies

Which limitations apply

Which Advertising behavior applies

Which recovery path exists

Which operational evidence supports the current state
```

---

# Monetization Governance Objectives

The governance model should ensure:

```text
Every plan has a stable identifier.

Every Product has a stable identifier.

Every provider Product mapping is versioned.

Every entitlement has a stable capability identifier.

Every purchase has one provider identity.

Every Product price is provider-authoritative.

Every trial and offer has explicit terms.

Every access decision is owner-scoped.

Every billing transition is reconciled.

Every downgrade preserves existing Product data.

Every Advertising placement is registered.

Every Advertising provider can be disabled.

Every store declaration matches actual Product behavior.

Every false grant or revocation can be detected.

Every unsafe Product, offer, placement or provider can be paused.

Every retired monetization capability is removed from Product, provider, Support and documentation.
```

---

# Monetization Authority Hierarchy

When monetization sources conflict, use the following authority order:

```text
Canonical Nexio Product and financial-safety requirements

↓

Security, Privacy, Accessibility and Compliance requirements

↓

Current authenticated owner

↓

Canonical Product Catalogue and Plan Registry

↓

Verified billing-provider state

↓

Canonical subscription and entitlement records

↓

Current capability-access decision

↓

Provider callback or local cached state

↓

Historical UI presentation
```

A provider callback does not override:

- Owner identity
- Product mapping
- Current verified refund state
- Account deletion restrictions
- Core Product rights

---

# Example Authority Conflict

```text
Client cache:
Premium active

Verified provider state:
Subscription expired

Active promotional entitlement:
Premium access active until 31/08/2026
```

Effective result:

```text
Premium remains active through the promotional entitlement.
```

The expired subscription does not remove access granted by another valid source.

---

# Monetization Governance Roles

Recommended roles:

```text
Monetization Product Owner

Commercial Catalogue Owner

Plan and Entitlement Owner

Billing Platform Owner

Advertising Platform Owner

Financial Reconciliation Owner

Security Reviewer

Privacy Reviewer

Accessibility Reviewer

Localization and Pricing Content Owner

Store Operations Owner

Provider Owner

Revenue Operations Owner

Support Knowledge Owner

Audit Owner

Incident Owner
```

One person may hold multiple roles.

Responsibilities must remain explicit.

---

# Monetization Product Owner

Responsible for:

- Monetization strategy
- Free and paid capability boundaries
- Product outcomes
- User-value justification
- Plan lifecycle
- Offer policy
- Downgrade behavior
- Experiment boundaries
- Product communication

---

# Commercial Catalogue Owner

Responsible for:

- Canonical Products
- Product identifiers
- Plan identifiers
- Product-to-provider mappings
- Billing periods
- Supported platforms
- Supported regions
- Catalogue status
- Deprecation

---

# Plan and Entitlement Owner

Responsible for:

- Capability identifiers
- Plan capability sets
- Limits
- Access modes
- Offline behavior
- Downgrade behavior
- Entitlement union rules
- Manual grants
- Promotional access

---

# Billing Platform Owner

Responsible for:

- Billing Adapter
- Product queries
- Purchase attempts
- Verification
- Acknowledgment
- Restore
- Subscription reconciliation
- Provider events
- Entitlement propagation

---

# Advertising Platform Owner

Responsible for:

- Advertising service
- Placement eligibility
- Provider Adapter
- Consent integration
- Ad-free suppression
- Placement lifecycle
- Provider failure handling
- Advertising kill switch

---

# Financial Reconciliation Owner

Responsible for:

- Purchase-state reconciliation
- Revenue-event reconciliation
- Refund and chargeback review
- Duplicate purchase detection
- Provider-versus-Nexio discrepancies
- Financial reporting evidence
- Unresolved purchase aging

This role does not edit user financial records.

---

# Security Reviewer

Responsible for:

- Purchase-token safety
- Callback authenticity
- Webhook replay protection
- Owner-association security
- Environment separation
- Provider credentials
- SDK access
- Malicious Ad links
- Cross-owner entitlement prevention

---

# Privacy Reviewer

Responsible for:

- Billing-data minimization
- Advertising request data
- Consent and preference behavior
- Purchase-history retention
- Account deletion
- Provider deletion
- Analytics restrictions
- Marketing separation

---

# Accessibility Reviewer

Responsible for:

- Plan comparison
- Price presentation
- Trial terms
- Purchase actions
- Restore
- Subscription management
- Paywalls
- Advertising labels
- Focus and keyboard behavior
- Large-text behavior

---

# Localization and Pricing Content Owner

Responsible for:

- Plan names
- Product descriptions
- Localized billing-period language
- Price-context wording
- Trial and renewal wording
- Regional terminology
- Provider-price display
- Store-listing consistency

---

# Store Operations Owner

Responsible for:

- Store Product setup
- Base plans
- Offers
- Regional availability
- Test products
- Production activation
- Store declarations
- Listing consistency
- Provider-console evidence

---

# Provider Owner

Responsible for:

- Provider contract
- SDK versions
- API versions
- Credentials
- Webhooks
- Rate limits
- Regional behavior
- Retention
- Deletion
- Kill switch
- Exit plan

---

# Revenue Operations Owner

Responsible for:

- Provider settlement comparison
- Purchase counts
- Refund counts
- Revenue-report consistency
- Test-purchase exclusion
- Currency and tax-report metadata
- Operational discrepancy review

Revenue Operations must not infer Product entitlement solely from settlement reports.

---

# Support Knowledge Owner

Responsible for:

- Billing Help content
- Restore guidance
- Subscription-management guidance
- Support macros
- Ownership-review process
- Safe diagnostics
- Agent training
- Escalation

---

# Audit Owner

Responsible for:

- Audit scope
- Audit schedule
- Findings
- Corrective actions
- Evidence
- Closure

---

# Incident Owner

Responsible for:

- Incident classification
- Containment
- Provider coordination
- Affected-owner analysis
- User communication
- Restoration
- Post-Incident review

---

# Monetization Responsibility Matrix

| Capability | Product | Billing | Entitlement | Security | Privacy | Accessibility | Store Ops | Operations |
|---|---|---|---|---|---|---|---|---|
| Product Catalogue | Required | Required | Required | As applicable | Required | Required | Required | Required |
| Provider Product mapping | Required | Required | Required | Required | Required | Required | Required | Required |
| Subscription purchase | Required | Required | Required | Required | Required | Required | Required | Required |
| Purchase verification | Required | Required | Required | Required | Required | As applicable | Required | Required |
| Restore purchases | Required | Required | Required | Required | Required | Required | Required | Required |
| Entitlement propagation | Required | Required | Required | Required | Required | Required | As applicable | Required |
| Upgrade and downgrade | Required | Required | Required | Required | Required | Required | Required | Required |
| Refund and chargeback | Required | Required | Required | Required | Required | As applicable | Required | Required |
| Advertising | Required | As applicable | Required | Required | Required | Required | As applicable | Required |
| Ad-free suppression | Required | As applicable | Required | Required | Required | Required | As applicable | Required |
| Account deletion | Required | Required | Required | Required | Required | Required | Required | Required |

---

# Product Catalogue Governance

The canonical Product Catalogue must remain independent from provider-specific configuration.

Provider consoles do not become the Product source of truth.

---

# Product Catalogue Registry

Recommended fields:

```text
canonicalProductId

ProductName

ProductType

planId

capabilityIds

limits

adPolicy

billingPeriods

trialPolicy

introductoryOfferPolicy

supportedPlatforms

supportedRegions

providerMappings

downgradeBehavior

dataPreservationBehavior

status

version

owner

introducedAt

lastReviewed

nextReview
```

---

# Canonical Product Identifier

Recommended pattern:

```text
MON-PRODUCT-<NUMBER>
```

Examples:

```text
MON-PRODUCT-001

MON-PRODUCT-002
```

The identifier must not be reused for an unrelated Product.

---

# Product Catalogue Version

The Catalogue should have a version whenever:

- Plan capabilities change
- Limits change
- Ad policy changes
- Billing periods change
- Product mapping changes
- Trial policy changes
- Downgrade behavior changes
- Supported region changes

---

# Product Lifecycle States

Recommended:

```text
draft

review

approved

configured

limited

active

paused

deprecated

retired

archived
```

---

# `draft`

Commercial intent exists.

The Product is not purchasable.

---

# `review`

Product, Security, Privacy, Accessibility, Store and Support review is active.

---

# `approved`

The canonical Product is approved.

Provider configuration may still be incomplete.

---

# `configured`

Required provider products, base plans and offers exist.

---

# `limited`

The Product is available only to a controlled platform, region or cohort.

---

# `active`

The Product may be offered generally within approved scope.

---

# `paused`

New purchase initiation is disabled temporarily.

Existing subscriptions remain governed.

---

# `deprecated`

New users should not purchase the Product.

Migration or replacement behavior exists.

---

# `retired`

No new purchase or renewal behavior is intended.

Existing data and historical billing records remain governed.

---

# `archived`

Historical specification only.

---

# Catalogue Approval Criteria

Before approval:

```text
□ Product purpose is defined.

□ Paid capability boundary is defined.

□ Free capability boundary is defined.

□ Financial-safety behavior is unchanged.

□ Existing-data behavior is defined.

□ Downgrade behavior is defined.

□ Export behavior is defined.

□ Account deletion behavior is defined.

□ Accessibility behavior is defined.

□ Privacy impact is defined.

□ Advertising impact is defined.

□ Provider strategy is defined.

□ Support impact is defined.

□ Exit plan exists.
```

---

# Catalogue Activation Criteria

Before activation:

```text
□ Canonical Product is approved.

□ Provider Product mapping is active.

□ Provider Product details load successfully.

□ Current localized prices load.

□ Trial or offer terms are verified.

□ Purchase flow passes.

□ Verification passes.

□ Acknowledgment passes where required.

□ Restore passes.

□ Entitlement propagation passes.

□ Downgrade passes.

□ Account deletion passes.

□ Store declarations are current.

□ Support guidance exists.

□ Kill switch works.
```

---

# Plan Registry Governance

Every plan should have a stable Registry record.

---

# Plan Registry Record

Recommended fields:

```text
planId

displayName

tier

version

capabilityIds

limits

adPolicy

offlinePolicy

SupportPolicy

ExportPolicy

AssistantPolicy

downgradePolicy

supportedPlatforms

supportedRegions

status

owner

introducedAt

lastReviewed
```

---

# Plan Identifier

Recommended pattern:

```text
MON-PLAN-<NUMBER>
```

---

# Plan Version Change

Increment the plan version when:

- Capability access changes
- A limit changes
- Advertising policy changes
- Offline behavior changes
- Downgrade behavior changes
- Export behavior changes
- Support scope changes

---

# Plan Capability Governance

Every plan capability should map to a canonical capability identifier.

---

# Capability Registry Record

Recommended fields:

```text
capabilityId

displayName

description

DomainOwner

eligiblePlans

accessModes

limitType

limitDefinition

offlinePolicy

downgradeBehavior

dataPreservationBehavior

SecurityClassification

PrivacyClassification

AccessibilityRequirement

status

version
```

---

# Capability Identifier

Recommended:

```text
ENT-CAPABILITY-<NUMBER>
```

---

# Capability Lifecycle

Recommended:

```text
draft

approved

active

limited

deprecated

removed
```

---

# Capability Access Boundary

A capability should describe one bounded Product right.

Examples:

```text
Create advanced Report

Use defined Assistant quota

Remove eligible Advertising

Use approved attachment storage

Create more active Goals
```

Avoid one broad entitlement such as:

```text
Everything premium
```

when independent lifecycle or downgrade behavior is required.

---

# Entitlement Governance

Entitlements must be canonical, owner-scoped and auditable.

---

# Entitlement Registry Record

Recommended fields:

```text
entitlementTypeId

capabilityId

eligibleSources

startPolicy

endPolicy

gracePolicy

offlinePolicy

revocationPolicy

downgradeBehavior

unionPolicy

owner

status

version
```

---

# Entitlement Union Governance

When multiple sources grant the same capability, define:

```text
union

priority

maximum_limit

minimum_restriction

source_specific
```

---

# Recommended Default

For simple enabled access:

```text
Any valid active entitlement grants the capability.
```

For numerical limits:

```text
Use the approved union policy rather than adding limits automatically.
```

---

# Entitlement Source Priority

Potential informational order:

```text
Permanent verified purchase

Active subscription

Active trial

Active promotion

Support correction

Free plan
```

Priority must not incorrectly revoke another valid source.

---

# Entitlement State Transition Governance

Allowed transitions should be registered.

Potential:

```text
pending → active

active → grace

active → expired

active → revoked

grace → active

grace → expired

unknown → active

unknown → inactive

refunded → inactive

chargeback → inactive
```

---

# Invalid Entitlement Transition

A transition such as:

```text
expired → active
```

requires a valid new source, Restore, renewal or correction.

It should not occur because a stale client cache reappeared.

---

# Product-to-Provider Mapping Governance

Each canonical Product requires a versioned provider mapping.

---

# Provider Product Mapping Record

Recommended fields:

```text
mappingId

mappingVersion

providerId

platform

region

canonicalProductId

providerProductId

basePlanId

offerTags

entitlementIds

replacementProducts

status

effectiveFrom

effectiveTo

owner

lastVerifiedAt
```

---

# Mapping Status

Recommended:

```text
draft

verified

active

limited

misconfigured

paused

deprecated

removed
```

---

# Mapping Verification

Verify:

```text
Provider Product exists.

Product type matches.

Base plan exists.

Billing period matches.

Offer tags are expected.

Region is active.

Price data is available.

Application identity matches.

Entitlement mapping is correct.

Replacement relationships are correct.
```

---

# Mapping Mismatch

Examples:

- Monthly Product mapped to annual base plan
- Premium Product mapped to a test Product
- Ad-free entitlement missing
- Wrong application package
- Deprecated provider Product still displayed

Response:

```text
Pause new purchase for the affected Product.

Preserve existing entitlements.

Alert Store Operations and Billing Operations.

Correct mapping.

Reverify before activation.
```

---

# Price Governance Architecture

The provider-returned localized price is the user-facing purchase authority.

---

# Price Presentation Record

Potential fields:

```text
providerId

canonicalProductId

providerProductId

basePlanId

offerId

localizedPrice

CurrencyCode

billingPeriod

trialDuration

introductoryPrice

introductoryDuration

renewalPrice

loadedAt

validUntil

storeContext

ProductVersion
```

---

# Price Freshness

Refresh pricing when:

- Purchase screen opens
- Application resumes after the approved interval
- Store Account changes
- Region changes
- Provider mapping changes
- Offer expires
- Billing connection reconnects
- User manually refreshes

---

# Stale Price

A stale cached price may be displayed only under an approved nonpurchase informational policy.

The final purchase action must use current provider data.

---

# Price Mismatch Detection

If:

```text
Marketing content:
R$ 9,90 por mês

Provider Product:
R$ 12,90 por mês
```

the provider price controls the purchase surface.

The outdated marketing content must be corrected.

Both values here are synthetic `pt-BR` examples.

---

# Price Currency Rule

Nexio must not convert provider prices.

Examples:

```text
Provider returns:
R$ 12,90

Display:
R$ 12,90
```

```text
Provider returns:
US$ 2.99

Display:
Provider-returned localized representation
```

Do not convert the amount to BRL unless the provider itself supplies the localized BRL price.

---

# Billing Period Governance

Billing periods should use provider-derived semantics.

Potential:

```text
P1M

P1Y
```

User-facing localized content may display:

```text
por mês

por ano
```

---

# Trial Term Governance

Every trial presentation should include:

```text
Trial duration

Post-trial price

Post-trial billing period

Auto-renew behavior

Cancellation route

Eligibility source
```

---

# Introductory Price Governance

Every introductory offer should identify:

```text
Introductory price

Number of periods

Period length

Standard renewal price

Standard renewal period

Eligibility
```

---

# Promotional Claim Review

Claims such as:

```text
Best value

Most popular

Save 50%
```

require evidence.

---

# Discount Percentage Calculation

Nexio may calculate a displayed discount only when:

- Source prices are current
- Billing periods are comparable
- Tax and regional behavior are considered
- The formula is approved
- Rounding is defined
- Store policy permits it

Otherwise, display provider terms without a calculated percentage.

---

# “Most Popular” Claim

Requires current evidence.

It must not be fabricated to pressure purchase.

---

# Billing Provider Governance

Every billing provider must exist in the Billing Provider Registry.

---

# Billing Provider Registry Record

Recommended fields:

```text
providerId

name

platforms

regions

ProductTypes

Adapter

SDKversions

APIversions

applicationIdentities

verificationMethod

serverNotifications

webhooks

acknowledgmentPolicy

consumptionPolicy

refundSignals

chargebackSignals

cancellationSignals

gracePolicy

holdPolicy

pausePolicy

retention

deletionBehavior

rateLimits

monitoring

killSwitch

exitPlan

owner

status

lastReviewed
```

---

# Provider Lifecycle

Recommended:

```text
evaluating

approved

configured

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
□ Product purpose is approved.

□ Supported platforms and regions are known.

□ Provider Product types are understood.

□ Verification path exists.

□ Application identity is validated.

□ Callback or event security is reviewed.

□ Acknowledgment and consumption behavior are defined.

□ Refund and chargeback signals are understood.

□ Grace, hold and pause are understood.

□ Retention is known.

□ Deletion behavior is known.

□ Rate limits are known.

□ Monitoring exists.

□ Kill switch exists.

□ Exit plan exists.
```

---

# Provider Adapter Governance

Provider-specific concepts must remain inside the Adapter.

Examples:

```text
Provider response codes

Provider token formats

Provider Product-detail objects

Provider purchase objects

Provider replacement parameters

Provider acknowledgment requests

Provider management URLs
```

Canonical Product services should use stable Nexio contracts.

---

# Provider SDK Governance

SDKs should be:

- Version-pinned
- Security-reviewed
- Privacy-reviewed
- License-reviewed
- Tested
- Replaceable
- Environment-separated

---

# Provider SDK Upgrade

Before release:

```text
Review API changes.

Review Product query changes.

Review purchase callback changes.

Review pending-purchase behavior.

Review acknowledgment behavior.

Review subscription replacement behavior.

Review Privacy changes.

Run lifecycle fixtures.

Run process-death tests.

Run owner-isolation tests.
```

---

# Provider Credential Governance

Credentials and keys should:

- Remain environment-specific
- Use least privilege
- Rotate
- Avoid client exposure where possible
- Avoid logs
- Avoid Analytics
- Avoid AI prompts
- Be revocable

---

# Provider Event Governance

Server notifications or webhooks should have:

```text
providerEventId

providerId

eventType

providerPurchaseReference

providerEventTime

receivedAt

verificationState

processingState

stateVersion

duplicateState
```

---

# Provider Event Processing States

Recommended:

```text
received

authenticating

authenticated

rejected

deduplicating

reconciling

applied

superseded

failed_retryable

failed_final
```

---

# Provider Event Authentication

Verify:

```text
Provider identity

Signature or token

Timestamp

Replay protection

Environment

Application identity

Allowed event type
```

---

# Provider Event Deduplication

Use a stable provider event identifier where available.

Repeated events must not:

- Create another entitlement
- Remove unrelated access
- Duplicate Support communication
- Reopen a resolved purchase
- Duplicate revenue records

---

# Out-of-Order Provider Event Governance

Example:

```text
Event received first:
Subscription expired

Later event received:
Subscription renewed

Provider event time indicates renewal occurred before expiration event.
```

The system must reconcile using current provider state and event versioning.

Arrival order is not sufficient.

---

# Provider Event Reconciliation

Every material event should trigger:

```text
Read current canonical subscription.

↓

Read current provider state where required.

↓

Validate Product mapping.

↓

Validate event ordering.

↓

Apply allowed transition.

↓

Recalculate entitlement.

↓

Propagate access.

↓

Record reconciliation evidence.
```

---

# Purchase Financial Reconciliation Architecture

Purchase and subscription reconciliation should compare:

```text
Nexio purchase attempts

Provider purchase records

Provider subscription state

Provider event history

Acknowledgment state

Canonical entitlement state

Revenue or settlement summaries

Refund and chargeback records
```

---

# Reconciliation Objectives

Detect:

```text
Charged but no entitlement

Entitlement without verified purchase

Duplicate purchase attempts

Duplicate provider references

Acknowledgment missing

Refund not applied

Chargeback not applied

Cancelled subscription still renewing

Expired subscription still active incorrectly

Valid subscription revoked incorrectly

Test purchase in Production reporting

Provider Product mapping mismatch
```

---

# Purchase Reconciliation Record

Recommended fields:

```text
reconciliationId

providerId

periodStart

periodEnd

ownerScope

purchaseAttemptCount

providerPurchaseCount

verifiedCount

entitlementCount

refundCount

chargebackCount

discrepancyCount

state

createdAt

completedAt

owner
```

---

# Reconciliation States

Recommended:

```text
scheduled

collecting

matching

review_required

repairing

completed

partially_completed

failed_retryable

failed_final
```

---

# Reconciliation Matching Keys

Potential:

```text
providerPurchaseReference

providerProductId

canonicalProductId

ownerId

purchaseAttemptId

subscriptionId

period

environment
```

---

# Reconciliation Discrepancy Categories

Recommended:

```text
purchase_without_attempt

attempt_without_purchase

verified_without_entitlement

entitlement_without_verification

acknowledgment_missing

owner_association_conflict

refund_not_applied

chargeback_not_applied

subscription_state_mismatch

Product_mapping_mismatch

environment_mismatch

duplicate_reference

unknown
```

---

# Purchase without Attempt

A provider purchase may exist without a current local attempt because of:

- Process death
- Reinstall
- Another device
- Provider callback loss
- Historical purchase

Response:

```text
Verify through Restore or reconciliation.

Do not classify as fraudulent automatically.
```

---

# Attempt without Provider Purchase

May represent:

- User cancellation
- Provider UI never completed
- Provider failure
- Unknown outcome

The attempt should reach a final classified state after reconciliation.

---

# Verified Purchase without Entitlement

This is a high-priority repair condition.

Response:

```text
Preserve verification evidence.

Create or repair the canonical entitlement idempotently.

Suppress duplicate purchase prompts.

Suppress Ads where the verified Product includes ad-free access.

Alert Operations if aging exceeds threshold.
```

---

# Entitlement without Verification

Potential causes:

- Manual promotion
- Support grant
- Migration
- Defect
- Tampering

The source must be identified.

Unexplained purchase-sourced entitlement is a Critical finding.

---

# Missing Acknowledgment

Response:

- Preserve purchase identity.
- Retry idempotently.
- Query provider state.
- Avoid repurchase.
- Alert before provider-defined deadline.

---

# Refund Not Applied

Response:

- Verify provider refund.
- Update purchase and subscription state.
- Recalculate entitlement.
- Preserve Product data.
- Record correction.

---

# Reconciliation Repair Governance

Automated repair may be allowed only when:

- The provider purchase is verified.
- Owner association is unambiguous.
- Product mapping is active.
- Repair is idempotent.
- No destructive user-data action occurs.
- Evidence is retained.

Otherwise:

```text
review_required
```

---

# Revenue Reconciliation

Revenue reporting and Product entitlement remain related but distinct.

Provider settlement may confirm financial settlement.

It does not independently define Product access timing.

---

# Revenue Reconciliation Fields

Potential:

```text
providerId

reportingPeriod

Currency

grossAmount

refundAmount

chargebackAmount

fees

taxes

netAmount

purchaseCount

refundCount

testPurchaseCount

unmatchedCount
```

These are business records.

They must not become Nexio user financial Transactions.

---

# Multi-Currency Revenue Reports

Provider revenue may use multiple Currencies.

Keep them separated unless an approved accounting conversion process exists.

Example:

```text
BRL:
R$ 1.250,00

USD:
US$ 120.00
```

Do not combine them directly.

The BRL value is a synthetic learning example.

---

# Test Purchase Exclusion

Test and license-tester purchases should be excluded from Production revenue reporting according to the provider contract.

They may remain in controlled operational logs.

---

# Revenue Discrepancy

Potential:

```text
Provider report:
100 purchases

Canonical verified purchases:
98

Difference:
2 requiring review
```

Do not automatically grant or revoke user access based only on aggregate reporting.

---

# Refund and Chargeback Governance

Refund and chargeback handling requires verified provider authority.

---

# Refund Record

Recommended fields:

```text
refundId

providerId

providerPurchaseReference

canonicalProductId

ownerId

state

effectiveAt

receivedAt

verifiedAt

entitlementImpact

reasonCategory

sourceEventId
```

---

# Chargeback Record

Recommended fields:

```text
chargebackId

providerId

providerPurchaseReference

canonicalProductId

ownerId

state

effectiveAt

receivedAt

verifiedAt

entitlementImpact

sourceEventId
```

---

# Refund Lifecycle

Recommended:

```text
reported

verifying

verified

applied

superseded

reversed

failed
```

---

# Chargeback Lifecycle

Recommended:

```text
reported

verifying

verified

applied

resolved

reversed

failed
```

---

# Refund Reversal

If the provider reverses a refund state:

- Verify the new state.
- Recalculate subscription and entitlement.
- Avoid duplicate entitlement creation.
- Preserve history.

---

# Entitlement Revocation Safety

Before revocation:

```text
Check alternate entitlement sources.

Check provider event ordering.

Check current paid period.

Check grace or hold policy.

Check promotion.

Check Support correction.

Check migration grants.
```

---

# False Revocation Protection

When state is uncertain:

```text
Use entitlement.unknown

Preserve current verified access for the approved bounded period

Block only new high-cost Premium actions where necessary

Preserve existing Product data

Start reconciliation
```

---

# False Grant Protection

When a purchase cannot be verified:

- Do not grant permanent entitlement.
- Keep the purchase attempt.
- Offer Restore or reconciliation.
- Preserve current access.
- Avoid another purchase prompt.

---

# Subscription Lifecycle Governance

Every subscription state transition should be governed by a transition Registry.

---

# Subscription Transition Registry

Recommended fields:

```text
fromState

toState

allowedSources

requiredEvidence

entitlementPolicy

communicationPolicy

SupportPolicy

owner
```

---

# Example Transition Rules

```text
pending → active:
Verified provider purchase

active → cancelled_active:
Verified auto-renew disabled while current period remains active

cancelled_active → expired:
Verified current period ended

active → grace:
Verified provider grace state

grace → active:
Payment recovered

grace → on_hold:
Provider hold state

active → refunded:
Verified refund

active → chargeback:
Verified payment reversal
```

---

# Subscription Unknown State

Use when:

- Provider unavailable
- Events conflict
- Current period missing
- Product mapping changed
- Owner association uncertain

Unknown must not be silently converted to expired.

---

# Subscription State Freshness

Every subscription record should include:

```text
lastVerifiedAt

verificationSource

verificationFreshness

nextVerificationAt
```

---

# Entitlement Offline Governance

Offline access policy should be capability-specific.

---

# Offline Entitlement Policy Record

Recommended fields:

```text
capabilityId

verifiedCacheDuration

offlineReadAllowed

offlineCreateAllowed

offlineHighCostActionAllowed

offlineAdvertisingPolicy

reconciliationRequirement
```

---

# Offline Read Access

Existing user-owned data should remain readable regardless of Premium verification where possible.

---

# Offline Premium Creation

New Premium-only actions may remain available during the approved verified cache window.

After expiration:

```text
verification_pending
```

---

# Offline Ad-Free Policy

If ad-free entitlement was recently verified:

```text
Preserve ad-free behavior while offline for the approved cache period.
```

Do not load Ads simply because billing verification is offline.

---

# Manual Grant Governance

Manual entitlements require a Grant Registry.

---

# Manual Grant Types

Recommended:

```text
Support_correction

Incident_compensation

migration

promotion

internal_test

partner
```

---

# Manual Grant Approval

Every grant should define:

```text
Reason

Capability scope

Start Date

End Date

Authority

Approver

Related case or Incident

Revocation behavior
```

---

# Support Grant Maximum

Support grants should have a configured maximum duration and capability scope.

Exceptions require elevated approval.

---

# Manual Grant Conflict

A manual grant must not change provider billing state.

It grants separate Product access.

---

# Grant Expiration

Expiration should:

- Recalculate effective entitlement.
- Preserve Product data.
- Check other sources.
- Avoid billing communication unless relevant.

---

# Advertising Governance Architecture

Advertising is governed separately from billing.

A user does not become eligible for personalized Advertising merely because they use the free plan.

---

# Advertising Placement Registry Governance

Every placement should include:

```text
placementId

screen

surface

format

purpose

allowedPlans

excludedStates

excludedJourneys

minimumDimensions

frequencyPolicy

refreshPolicy

PrivacyPolicy

AccessibilityRequirements

PerformanceBudget

providerMappings

status

version

owner
```

---

# Placement Lifecycle

Recommended:

```text
draft

review

approved

limited

active

paused

deprecated

removed
```

---

# Placement Approval Criteria

Before approval:

```text
□ Product purpose is defined.

□ Placement is outside Critical journeys.

□ Advertisement labeling is defined.

□ Privacy data is defined.

□ Ad-free behavior is defined.

□ Accessibility behavior is defined.

□ Performance budget is defined.

□ Failure behavior is defined.

□ Frequency is bounded.

□ Provider mapping exists.

□ Kill switch exists.
```

---

# Placement Activation Criteria

Before activation:

```text
□ Free-plan eligibility is verified.

□ Ad-free suppression passes.

□ Privacy-choice behavior passes.

□ Unknown Privacy suppresses requests.

□ Owner switching passes.

□ Sign-out passes.

□ Account deletion passes.

□ Accessibility passes.

□ Layout-shift budget passes.

□ Provider test configuration passes.

□ Production configuration is verified.
```

---

# Advertisement Content Boundary

Nexio should not approve Ad categories that conflict with Product safety, Store policy or user trust.

Potentially restricted categories require explicit policy review.

Advertising providers may have their own blocking controls.

---

# Advertising Category Review

The Product should define whether to block or limit categories involving:

- High-risk financial promises
- Predatory lending
- Gambling
- Unregulated investments
- Deceptive financial products
- Adult content
- Malware or surveillance
- Misleading health claims

The final policy must follow platform, provider, regional and Product requirements.

---

# Advertisement Review Limitation

Nexio may not control every individual provider creative in real time.

It should still maintain:

- Provider category controls
- Placement restrictions
- Reporting path
- Provider escalation
- Kill switch
- User feedback path

---

# Advertisement Reporting

Where provider capability exists, users may have access to:

```text
Hide this Ad

Not relevant

Report this Ad

About this Ad
```

The exact options depend on the platform.

---

# Advertising Personalization Governance

Potential canonical states:

```text
personalized_allowed

nonpersonalized_only

restricted_processing

no_Advertising

unknown
```

---

# Advertising State Precedence

Potential order:

```text
Legal or platform restriction

↓

User no-Advertising choice where available

↓

Ad-free entitlement

↓

User Advertising personalization choice

↓

Placement eligibility

↓

Provider availability
```

---

# Ad-Free Entitlement Precedence

An active ad-free entitlement suppresses eligible Ads regardless of Advertising personalization state.

---

# Unknown Advertising State

Default:

```text
No Ad request.
```

---

# Advertising Identifier Governance

Advertising identifiers should:

- Remain outside financial Domain state
- Be minimized
- Be reset or removed according to policy
- Avoid Support exposure
- Avoid AI prompts
- Be processed during Account deletion
- Be excluded from user financial Export unless required by Privacy scope

---

# Advertising Provider Governance

Every Advertising provider requires a Registry entry.

---

# Advertising Provider Registry Record

Recommended fields:

```text
providerId

name

platforms

regions

formats

SDKversions

APIversions

dataCategories

consentIntegration

personalizationModes

restrictedProcessingModes

childAndAgeConfiguration

testConfiguration

productionConfiguration

retention

deletionBehavior

subprocessors

categoryControls

reportingPath

monitoring

killSwitch

exitPlan

owner

status

lastReviewed
```

---

# Advertising Provider Approval Criteria

```text
□ Product purpose is approved.

□ Data categories are minimized.

□ Consent integration is understood.

□ Personalization modes are understood.

□ Restricted-processing behavior is understood.

□ Age-related settings are understood.

□ Test configuration exists.

□ Production configuration is separated.

□ Retention is known.

□ Deletion behavior is known.

□ Category controls exist where needed.

□ Reporting path exists.

□ Monitoring exists.

□ Kill switch exists.

□ Exit plan exists.
```

---

# Advertising Provider SDK Upgrade

Before release:

- Review Privacy behavior.
- Review consent APIs.
- Review initialization timing.
- Review identifier handling.
- Review rendering behavior.
- Review accessibility.
- Review background behavior.
- Run Ad-free suppression tests.
- Run Account-switch tests.
- Run deletion tests.

---

# Advertising Provider Removal

Complete removal includes:

```text
Stop new requests

Destroy active views

Disable placements

Remove SDK

Remove provider identifiers

Remove credentials and application IDs where applicable

Update consent flows

Update Privacy disclosures

Update Store declarations

Update Support

Archive operational evidence
```

---

# Store Readiness Architecture

Monetization must match the active store configuration and declarations.

---

# Store Readiness Areas

Recommended:

```text
Application identity

Billing-library compatibility

Product configuration

Base-plan configuration

Offer configuration

Regional availability

Price availability

Subscription-management route

Restore behavior

Privacy disclosures

Advertising disclosures

Data Safety declarations

Account deletion

Testing tracks

Release notes

Support contact
```

---

# Store Product Readiness Checklist

```text
□ Canonical Product exists.

□ Provider Product exists.

□ Product type matches.

□ Base plan exists.

□ Billing period matches.

□ Region is enabled.

□ Price is active.

□ Offer is valid.

□ Trial terms match Product content.

□ Entitlement mapping is correct.

□ Test purchase succeeds.

□ Production Product is not used in ordinary development.
```

---

# Store Subscription Readiness

Verify:

```text
Renewal behavior

Cancellation management

Grace configuration

Account hold

Pause where supported

Replacement behavior

Price change behavior

Offer eligibility

Refund authority
```

---

# Store Listing Consistency

Store listing, in-Product plan comparison and Help content must not materially conflict.

---

# Store Description Claims

Claims about Premium should match implemented capabilities.

Do not advertise:

- Unreleased features
- Unsupported platforms
- Unsupported trial
- Unsupported ad removal
- Guaranteed financial outcomes

---

# Store Price Screenshots

Screenshots showing prices can become stale.

Prefer screenshots that avoid hardcoded current price where appropriate.

Where price appears, maintain a review process.

---

# Store Data Safety and Advertising Declarations

Declarations must match:

- Billing SDK behavior
- Advertising SDK behavior
- Analytics
- Personalization
- Provider identifiers
- Data sharing
- Account deletion

---

# Store Account Deletion Readiness

Store-facing account-deletion information should:

- Link to the approved deletion path.
- Explain external subscription cancellation separately.
- Remain accessible.
- Match actual Product behavior.

---

# Billing Library Readiness

Before release:

```text
Supported billing-library version

Target SDK compatibility

Pending-purchase support

Product query support

Purchase callback support

Acknowledgment support

Restore support

Subscription replacement support

Process-death reconciliation
```

---

# Advertising Store Readiness

Verify:

```text
Advertising application identifier

Placement identifiers

Test configuration

Production configuration

Consent behavior

Age-related configuration

Ad labeling

Critical-journey exclusions

Ad-free entitlement

Privacy disclosures
```

---

# Release-Track Testing

Test monetization through:

```text
Internal test

Closed test

Open test where appropriate

Production staged rollout
```

Test purchases and provider behavior may differ by track.

---

# License Tester Governance

Test Accounts should:

- Be explicitly registered.
- Avoid real-user use.
- Avoid Production financial data.
- Be removed when no longer required.
- Be excluded from revenue metrics.

---

# Production Rollout

Recommended:

```text
Activate provider configuration

↓

Verify Product query

↓

Verify current price

↓

Verify purchase with controlled test

↓

Verify entitlement propagation

↓

Verify Restore

↓

Verify cancellation management

↓

Verify Ads and ad-free suppression

↓

Start limited rollout

↓

Monitor safety guardrails

↓

Expand
```

---

# Production Rollback

Rollback may include:

```text
Pause Product purchase

Pause offers

Disable purchase button

Preserve existing entitlements

Disable Advertising placement

Activate provider kill switch

Revert Product mapping

Use prior verified application release
```

Rollback must not revoke valid user access unnecessarily.

---

# Monetization Audit Architecture

Audits should evaluate:

```text
Catalogue

Provider Product mapping

Price presentation

Purchase identity

Verification

Acknowledgment

Restore

Subscription lifecycle

Entitlements

Limits

Downgrade

Advertising

Privacy

Accessibility

Store configuration

Account deletion

Support

Operational evidence
```

---

# Audit Types

Recommended:

```text
Catalogue audit

Price audit

Purchase audit

Verification audit

Acknowledgment audit

Restore audit

Subscription audit

Entitlement audit

Limit audit

Advertising audit

Provider audit

Store audit

Privacy audit

Accessibility audit

Account deletion audit

Revenue reconciliation audit

Operational audit

Incident audit
```

---

# Catalogue Audit

Verify:

```text
Active Products are intentional.

Plan capability sets are current.

Limits are current.

Downgrade behavior is documented.

Ad policy is accurate.

Provider mappings are active.

Deprecated Products are not offered incorrectly.
```

---

# Price Audit

Verify:

- Provider price is displayed.
- Billing period is visible.
- Trial terms are complete.
- Introductory price is accurate.
- Renewal price is visible.
- No stale hardcoded price is used.
- Regional availability is correct.

---

# Purchase Audit

Verify:

```text
Stable purchase attempts

Repeated-tap prevention

Pending-purchase handling

Unknown-outcome handling

Process-death recovery

Provider callback classification

No direct entitlement from callback
```

---

# Verification Audit

Verify:

- Provider authority
- Application identity
- Product identity
- Environment
- Purchase uniqueness
- Owner association
- Refund state
- Revocation state
- Idempotency

---

# Acknowledgment Audit

Verify:

```text
Only verified purchases are acknowledged.

Operation identity is stable.

Retry is bounded.

Unknown outcome is reconciled.

Provider deadline monitoring exists.
```

---

# Restore Audit

Verify:

- Restore is visible.
- Reinstall works.
- Device change works.
- Local-data clearing works.
- Ownership conflicts do not leak data.
- Partial Restore is reported honestly.
- No repurchase is required.

---

# Subscription Audit

Verify:

```text
Cancellation differs from expiration.

Grace is represented.

Hold is represented.

Pause is represented where supported.

Refund and chargeback are reconciled.

Out-of-order events are handled.

Alternate entitlement sources are respected.
```

---

# Entitlement Audit

Verify:

```text
Owner scope

Capability scope

Source

Start and end

Offline cache

Union policy

Propagation

Revocation

Manual grants

Deleted-owner behavior
```

---

# Limit Audit

Verify:

- Canonical usage source
- Atomic enforcement
- Period boundary
- Cross-device behavior
- Downgrade excess-state preservation
- Export availability
- No silent deletion

---

# Advertising Audit

Verify:

```text
Every placement is registered.

Ads are labeled.

Critical journeys suppress Ads.

Ad-free owners suppress requests.

Privacy choices are applied.

Unknown Privacy suppresses requests.

No financial data reaches provider.

Owner switching destroys stale Ads.

Account deletion stops Ads.

Provider test and Production configuration are separate.
```

---

# Provider Audit

Verify:

- Contract
- SDK
- API
- Credentials
- Webhooks
- Event authentication
- Rate limits
- Retention
- Deletion
- Kill switch
- Exit plan

---

# Store Audit

Verify:

```text
Store Products match mappings.

Prices load.

Offers are active.

Listing claims are accurate.

Data Safety declarations are accurate.

Account deletion path works.

Subscription management works.

Test configuration is isolated.
```

---

# Privacy Audit

Verify:

- Billing data minimization
- Advertising request fields
- Consent propagation
- Identifier deletion
- Analytics exclusion
- Provider retention
- Account deletion
- Marketing separation

---

# Accessibility Audit

Verify:

```text
Plan comparison

Price and period announcement

Trial terms

Purchase button

Restore

Manage subscription

Billing errors

Paywall dismissal

Advertisement labeling

Focus order

Large text

Keyboard use
```

---

# Revenue Reconciliation Audit

Verify:

- Provider reports
- Verified purchases
- Refunds
- Chargebacks
- Test-purchase exclusion
- Currency separation
- Unmatched records
- Repair evidence

---

# Account Deletion Audit

Verify:

```text
Deletion is not blocked.

Ads stop.

Marketing stops.

Active Product access is restricted.

External cancellation is explained.

Provider identifiers are processed.

Manual grants are processed.

Deleted owner cannot Restore automatically.

Required evidence is minimized.
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
Cross-owner entitlement

Duplicate billing caused by Nexio

Invalid purchase granted Premium

Valid purchase linked to wrong owner

Purchase token exposure

Account deletion blocked

Advertising contains exact financial data

Advertisement shown in Account deletion

Ad-free owner systematically receives Ads

Webhook authorization bypass
```

---

# High Finding Examples

```text
Restore unavailable

Pending purchase permits repurchase

Valid purchase lacks entitlement

Provider price mismatch

Cancellation and expiration confused

Downgrade deletes Product state

Privacy withdrawal not propagated

Store Product mapping incorrect
```

---

# Moderate Finding Examples

```text
Stale plan wording

Delayed review

Inconsistent Help content

Missing optional metric

Old Product screenshot
```

---

# Low Finding Examples

```text
Minor spacing

Nonmaterial wording inconsistency

Small metadata omission
```

---

# Audit Corrective Action

Every Critical or High finding requires:

```text
Containment

Named owner

Affected-owner analysis

Provider analysis

Correction

Verification

User communication decision

Release or deadline condition

Evidence

Closure approval
```

---

# Immediate Audit Containment Options

Potential:

```text
Pause Product

Pause offer

Disable purchase initiation

Pause verification result application

Disable provider event processing

Suppress paywall

Suppress Ads

Activate ad-provider kill switch

Preserve current verified access

Block Account reassociation

Escalate to Security and Privacy
```

---

# Monetization Observability Architecture

Observability should answer:

```text
Which Products are available?

Which prices loaded?

Which purchase attempts started?

Which purchases are pending?

Which purchases remain unknown?

Which provider purchases were verified?

Which acknowledgments are incomplete?

Which subscriptions changed state?

Which entitlements were granted or revoked?

Which propagation operations failed?

Which owners are over a plan limit?

Which Ads were suppressed?

Which Advertising requests violated policy?

Which provider or store configuration is degraded?

Which Account deletion workflows retain monetization state?
```

---

# Telemetry Layers

Recommended:

```text
Catalogue telemetry

Product-query telemetry

Price and offer telemetry

Purchase-attempt telemetry

Verification telemetry

Acknowledgment telemetry

Restore telemetry

Subscription telemetry

Entitlement telemetry

Limit telemetry

Paywall telemetry

Advertising telemetry

Provider telemetry

Store telemetry

Reconciliation telemetry

Account deletion telemetry
```

---

# Catalogue Telemetry

Track:

```text
CatalogueVersion

activeProductCount

pausedProductCount

mappingMismatchCount

regionUnavailableCount

platformUnavailableCount
```

---

# Product Query Telemetry

Track:

```text
providerId

canonicalProductId

queryState

duration

ProductAvailable

priceAvailable

offerCount

failureCategory
```

---

# Price Telemetry

Track:

```text
priceLoaded

billingPeriod

offerType

CurrencyCode

freshnessBucket

mismatchDetected
```

Do not log sensitive purchase tokens.

Provider-localized price may be recorded only under the approved business-data policy.

---

# Purchase Attempt Telemetry

Track:

```text
purchaseAttemptId

canonicalProductId

providerId

state

duration

pending

cancelled

unknownOutcome

failureCategory
```

---

# Verification Telemetry

Track:

```text
verificationState

failureCategory

environment

ProductMappingResult

ownerAssociationState

duration

RetryCount
```

---

# Acknowledgment Telemetry

Track:

```text
required

state

attemptCount

unknownOutcome

agingBucket

failureCategory
```

---

# Restore Telemetry

Track:

```text
restoreAttemptId

queryResultCount

verifiedCount

restoredCount

pendingCount

ownershipConflictCount

invalidCount

finalState
```

---

# Subscription Telemetry

Track:

```text
previousState

newState

stateSource

currentPeriodKnown

autoRenewKnown

outOfOrderEvent

reconciliationRequired
```

---

# Entitlement Telemetry

Track:

```text
capabilityId

sourceType

previousState

newState

propagationState

cacheState

alternateSourceCount
```

---

# Limit Telemetry

Track:

```text
capabilityId

decision

usageBucket

limitBucket

concurrencyConflict

overLimitPreserved

resetState
```

---

# Paywall Telemetry

Track:

```text
paywallType

capabilityId

shown

dismissed

purchaseSelected

restoreSelected

managementSelected

providerUnavailable
```

Do not treat exposure as user consent or purchase intent.

---

# Advertising Telemetry

Track:

```text
placementId

eligibilityState

suppressionReason

providerId

loadState

displayState

noFill

failureCategory

adFreeState

PrivacyMode
```

---

# Provider Telemetry

Track:

```text
connectionState

ProductQueryFailure

verificationFailure

eventAuthenticationFailure

eventReplayBlocked

rateLimit

SDKError

regionalFailure
```

---

# Reconciliation Telemetry

Track:

```text
reconciliationId

matchedCount

unmatchedCount

repairCount

manualReviewCount

refundMismatchCount

chargebackMismatchCount

environmentMismatchCount
```

---

# Privacy-Safe Telemetry

Do not log:

```text
Purchase token

Full receipt

Payment-card data

Exact private financial data

Transaction descriptions

Account names

Advertising creative content where not approved

Other-owner billing data

Provider credentials

Subscription-management authentication data
```

---

# Monetization SLO Architecture

Potential SLO categories:

```text
Product-query availability

Purchase-verification latency

Pending-purchase reconciliation

Acknowledgment completion

Restore availability

Entitlement propagation

Subscription reconciliation

Ad-free suppression

Advertising Privacy enforcement

Account deletion cleanup

Provider-event processing
```

---

# Product Query SLO

Potential objective:

```text
Eligible active Products return current provider information or a classified unavailable state within the approved operational window.
```

---

# Purchase Verification SLO

Potential objective:

```text
Provider purchases reaching verification enter a verified, invalid or classified unknown state within the approved window.
```

---

# Pending Purchase Reconciliation SLO

Potential objective:

```text
Pending purchases are rechecked according to the approved schedule until the provider returns a final state.
```

---

# Acknowledgment SLO

Potential objective:

```text
Verified purchases requiring acknowledgment reach acknowledged or classified failure before the provider-defined deadline.
```

---

# Restore SLO

Potential objective:

```text
Eligible Restore requests reach complete, partial or classified failure state within the approved window.
```

---

# Entitlement Propagation SLO

Potential objective:

```text
Verified entitlement changes reach current-device Product access and owner-scoped persistence within the approved propagation window.
```

---

# Ad-Free Suppression SLO

Potential objective:

```text
Verified ad-free access stops new eligible Advertising requests within the approved propagation window.
```

---

# Advertising Privacy SLO

Target:

```text
Zero Advertising requests when canonical Privacy state is no_request or unknown.
```

---

# Cross-Owner Entitlement SLO

Target:

```text
Zero.
```

---

# False Purchase Completion SLO

Target:

```text
Zero.
```

---

# Duplicate Billing SLO

Target:

```text
Zero Nexio-caused duplicate purchase flows for one unresolved equivalent purchase.
```

---

# Account Deletion Availability SLO

Target:

```text
Account deletion remains available regardless of active external subscription state.
```

---

# Export Availability SLO

Target:

```text
User-owned data Export remains available regardless of entitlement expiration.
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

PrivacyClassification

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

# Monetization Error Budgets

Error budgets may guide:

- New Product rollout
- Offer expansion
- New provider rollout
- Advertising placement expansion
- SDK upgrade
- Regional rollout

They must not normalize:

```text
Cross-owner access

Duplicate billing

False purchase completion

Purchase-token exposure

Account deletion blocking

Financial-data Advertising leakage

Required Accessibility failures
```

---

# Operational Dashboard

Recommended sections:

```text
Catalogue health

Provider Product health

Price and offer health

Purchase attempts

Pending purchases

Unknown outcomes

Verification health

Acknowledgment backlog

Restore health

Subscription transitions

Entitlement propagation

Limit enforcement

Ad-free suppression

Advertising Privacy

Provider events

Revenue reconciliation

Account deletion cleanup

Critical guardrails
```

---

# Dashboard Segmentation

Potential:

```text
Platform

Application version

Provider

Canonical Product

Provider Product

Base plan

Offer

Region

Environment

Subscription state

Entitlement state

Placement

Advertising provider
```

---

# Alert Architecture

Alerts should be:

- Actionable
- Severity-based
- Deduplicated
- Owner-assigned
- Connected to a runbook
- Free from payment secrets and private financial content

---

# Critical Alerts

Trigger immediately for:

```text
Cross-owner entitlement

Invalid purchase granted access

Duplicate purchase flow causing duplicate charge

Purchase token exposure

Webhook authorization bypass

Valid entitlement revoked from provider timeout

Account deletion blocked by billing

Export blocked by entitlement expiration

Advertising request containing financial data

Advertisement shown during deletion or Security flow

Ad-free owner receiving systematic Ad requests
```

---

# High Alerts

Potential:

```text
Product mapping mismatch

Price load failure spike

Verification backlog

Acknowledgment aging

Restore failure spike

Entitlement propagation backlog

Subscription-state conflict

Refund mismatch

Chargeback mismatch

Advertising Privacy suppression failure

Provider event-processing failure
```

---

# Moderate Alerts

Potential:

```text
Offer eligibility decline

Paywall rendering failure

Noncritical Ad provider degradation

Store-listing review overdue

Plan content drift
```

---

# Monetization Incident Architecture

Incident types may include:

```text
Cross-owner purchase association

Duplicate billing

Invalid entitlement grant

False entitlement revocation

Purchase-token exposure

Provider verification outage

Acknowledgment failure

Restore outage

Subscription-state corruption

Refund mismatch

Chargeback mismatch

Product mapping error

Price presentation error

Advertising Privacy leak

Critical-journey Advertisement

Ad-free suppression failure

Account deletion billing block

Store configuration incident
```

---

# Incident Severity Factors

Evaluate:

```text
Financial charge impact

Owner exposure

Security impact

Privacy impact

Access loss

Data-access impact

Account deletion impact

Number of owners

Number of purchases

Duration

Provider scope

Regional scope

Recoverability

Public impact
```

---

# Incident Response Sequence

```text
Detect

↓

Classify

↓

Contain Product, provider, offer, entitlement or placement

↓

Protect affected owners

↓

Preserve valid access where safe

↓

Stop duplicate purchase or Advertising activity

↓

Reconcile provider and canonical state

↓

Correct entitlement or subscription

↓

Communicate verified facts

↓

Restore capability

↓

Verify

↓

Review
```

---

# Incident Containment Options

Potential:

```text
Pause new purchase

Pause Product

Pause offer

Disable provider mapping

Disable verification application

Stop acknowledgment retries

Pause Restore

Freeze destructive entitlement revocation

Suppress paywalls

Suppress Ads

Activate provider kill switch

Revoke unsafe Advertising identifiers

Preserve current verified entitlements
```

---

# Cross-Owner Purchase Incident

Immediate actions:

```text
Stop affected association path.

Block affected purchase from further reassignment.

Protect both owner contexts.

Do not reveal owner identities.

Review purchase-attempt and provider evidence.

Correct entitlement idempotently.

Notify Security and Privacy.

Review whether financial or plan information was exposed.
```

---

# Duplicate Billing Incident

Immediate actions:

- Stop equivalent purchase initiation.
- Identify purchase attempts and provider purchases.
- Preserve provider references.
- Stop automated acknowledgment duplication.
- Identify affected owners.
- Provide Support guidance.
- Coordinate provider refund path where applicable.
- Correct repeated-entry cause.

---

# Invalid Entitlement Grant Incident

Examples:

- Test purchase grants Production access
- Wrong Product grants Premium
- Fake callback grants access
- Revoked purchase remains active

Response:

```text
Stop affected grant path.

Identify affected entitlements.

Preserve user Product data.

Recalculate from verified sources.

Avoid broad revocation before owner-safe reconciliation.

Patch verification or mapping.
```

---

# False Entitlement Revocation Incident

Response:

- Freeze further revocations from the affected path.
- Restore last verified access where evidence supports it.
- Suppress Ads for verified ad-free owners.
- Identify affected Product actions.
- Avoid requesting repurchase.
- Repair reconciliation logic.

---

# Purchase-Token Exposure Incident

Immediate actions:

```text
Stop logging or exposure path.

Restrict access to affected records.

Rotate or revoke credentials where applicable.

Assess provider purchase-token risk.

Notify Security and Privacy.

Remove tokens from logs, Analytics, Support and AI systems.

Review affected owner scope.
```

---

# Price Presentation Incident

Example:

```text
Nexio displayed R$ 9,90, but the provider purchase screen displayed R$ 12,90.
```

Both values are synthetic examples.

Response:

- Remove stale price.
- Disable purchase until current provider price loads.
- Correct marketing or cached content.
- Assess whether users were misled.
- Preserve provider purchase authority.

---

# Verification Outage Incident

- Stop granting new unverified access.
- Preserve pending purchase identities.
- Preserve current verified entitlements.
- Block duplicate purchases.
- Repair after service recovery.
- Communicate only when user action is useful.

---

# Acknowledgment Incident

Potential risk:

- Provider may reverse or refund unacknowledged purchases.

Response:

```text
Identify verified unacknowledged purchases.

Prioritize before provider deadline.

Retry idempotently.

Query provider state.

Do not create new purchases.

Escalate aging items.
```

---

# Restore Outage Incident

- Keep Restore visible with accurate unavailability state.
- Preserve current access.
- Avoid repurchase as recovery.
- Repair provider query or ownership resolution.
- Notify Support.

---

# Subscription-State Corruption Incident

Examples:

- Cancelled-active treated as expired
- Grace treated as inactive
- Refund ignored
- Out-of-order event overwrites renewal

Response:

```text
Pause destructive entitlement changes.

Query current provider state.

Rebuild subscription version history.

Recalculate access.

Restore or revoke only with verified evidence.
```

---

# Advertising Privacy Incident

Examples:

- Financial data included in Ad request
- Personalized request sent after withdrawal
- Unknown consent defaults to personalized
- Ad identifier retained after deletion

Response:

```text
Stop affected Advertising provider or placement.

Suppress all affected requests.

Remove prohibited fields.

Process identifier cleanup.

Notify Security and Privacy.

Assess provider-held data.

Update disclosures where required.
```

---

# Critical-Journey Advertisement Incident

Response:

- Disable affected placement.
- Identify Product journeys and versions.
- Verify no financial operation was interrupted.
- Update placement exclusions.
- Run regression tests before reactivation.

---

# Ad-Free Suppression Incident

Response:

```text
Suppress Ads through canonical emergency control.

Identify verified ad-free owners.

Stop new requests.

Destroy active views.

Repair entitlement propagation.

Do not ask users to repurchase.
```

---

# Account Deletion Billing Incident

Examples:

- Deletion blocked by active subscription
- Ads continue during deletion
- Purchase history recreates owner
- Restore reactivates deleted owner automatically

Response:

- Remove billing block.
- Continue deletion coordinator.
- Stop Ads and optional communication.
- Preserve only required purchase evidence.
- Correct Restore and reassociation policy.

---

# Incident User Communication

Communicate only verified information.

Potential structure:

```text
What monetization capability was affected

Whether a charge may have occurred

Whether Product access changed

Whether financial records remain safe

What the user should do

What the user should not purchase again

Where to manage the subscription

Where to obtain Support
```

---

# Duplicate Billing Communication

Potential:

```text
Nexio identified a possible duplicate purchase flow.

Do not purchase the same plan again.

Your financial records remain available while the billing state is reviewed.
```

---

# False Revocation Communication

Potential:

```text
Nexio is correcting a subscription-access issue.

Do not repurchase the plan.

Your existing financial records remain available.
```

---

# Post-Incident Review

Review:

```text
Catalogue

Provider Product mapping

Price

Purchase attempt

Provider callback

Verification

Acknowledgment

Restore

Subscription state

Entitlement

Advertising

Privacy

Store configuration

Monitoring

Support response

User impact

Corrective action
```

---

# Incident Record

Recommended fields:

```text
incidentId

detectedAt

severity

providerIds

canonicalProductIds

providerProductIds

applicationVersions

regions

ownerScope

purchaseScope

subscriptionScope

entitlementScope

AdvertisingScope

financialChargeImpact

PrivacyImpact

accessImpact

containment

userCommunication

rootCause

correctiveActions

verification

closedAt
```

---

# Support Governance Architecture

Support must diagnose monetization without requesting payment credentials or private financial data.

---

# Safe Support Diagnostic Fields

Potential:

```text
purchaseAttemptId

restoreAttemptId

providerId

canonicalProductId

providerProductId

basePlanId

offerId

purchaseState

verificationState

acknowledgmentState

subscriptionState

currentPeriodEnd

autoRenewState

effectiveEntitlementState

entitlementSources

propagationState

ProductVersion

platform

lastVerifiedAt

failureCategory
```

---

# Support Diagnostic Prohibitions

Do not expose by default:

```text
Raw purchase token

Full provider receipt

Payment-card details

Provider credentials

Another owner's billing data

Advertising identifier

Exact private financial records

Transaction descriptions

Complete revenue reports
```

---

# Support Training Objectives

Agents should understand:

```text
Product versus provider Product

Purchase attempt versus completed purchase

Provider callback versus verification

Verification versus acknowledgment

Billing state versus entitlement

Cancellation versus expiration

Pending purchase

Grace and hold

Restore purchases

Owner-association conflicts

Refund and chargeback

Ad-free propagation

Account deletion distinction
```

---

# Support Training Module — Current Price

Agents should not quote an old fixed price as current.

They should direct the user to the provider-loaded Product screen.

---

# Support Training Module — Charged but Access Missing

Required sequence:

```text
1. Do not request another purchase.

2. Confirm the current Nexio owner.

3. Identify the purchase attempt.

4. Use Restore purchases.

5. Check provider verification.

6. Check acknowledgment.

7. Check entitlement propagation.

8. Escalate ownership conflict safely.
```

---

# Support Training Module — Pending Purchase

Agents should explain:

```text
The billing provider has not completed the purchase.

Nexio cannot grant permanent access until verified completion.

The user should not purchase the same plan again.
```

---

# Support Training Module — Cancellation

Agents should explain:

```text
Cancelling renewal may leave Premium active until the verified current-period end.
```

They should not promise immediate cancellation of store billing through Nexio.

---

# Support Training Module — Refund

Agents should:

- Identify refund authority.
- Check verified provider state.
- Explain access behavior.
- Confirm Product data remains preserved.
- Avoid promising a refund Nexio cannot authorize.

---

# Support Training Module — Duplicate Billing

Agents should:

- Identify all purchase attempts.
- Avoid asking for raw tokens.
- Preserve provider references internally.
- Direct refund requests through approved provider path.
- Escalate duplicate-flow incidents.

---

# Support Training Module — Ads after Premium

Agents should:

```text
Verify ad-free entitlement.

Check propagation.

Stop new requests through the approved repair path.

Do not request another purchase.
```

---

# Support Training Module — Account Deletion

Agents should distinguish:

```text
Delete Nexio Account

Cancel external store subscription
```

Deletion must proceed independently.

---

# Support Scenario — Store Price Different

Prompt:

```text
The Nexio screen showed one price and Google Play showed another.
```

Expected guidance:

```text
The provider purchase screen controls the final current store price.

Do not complete the purchase based on stale Nexio content.

Escalate the Product-price mismatch.
```

---

# Support Scenario — Restore Shows Ownership Review

Expected:

```text
Do not reveal another owner.

Do not manually move the purchase.

Use the approved ownership-verification process.
```

---

# Support Scenario — Subscription Cancelled but Ads Returned Early

Expected:

```text
Check the verified current-period end.

If ad-free entitlement remains active, suppress Ads and repair entitlement propagation.

Do not ask the user to resubscribe.
```

---

# Support Scenario — Refund Requested

Expected:

```text
Explain whether Google Play or another provider controls the refund.

Review current provider state.

Do not claim entitlement timing before verification.
```

---

# Support Macro — Purchase Pending

```text
Your purchase is still pending with the billing provider.

Do not purchase the same plan again.

Nexio will apply access only after verified completion.
```

---

# Support Macro — Restore

```text
Use Restore purchases while signed in to the intended Nexio Account.

Nexio will verify eligible store purchases and apply access only after ownership checks.
```

---

# Support Macro — Cancellation

```text
Cancellation may stop future renewal while Premium access remains active until the verified end of the current paid period.
```

---

# Support Macro — Account Deletion

```text
You may delete your Nexio Account even when an external subscription is active.

Store-managed subscription cancellation may require a separate action through the store.
```

---

# Support Escalation Categories

Recommended:

```text
Product_price_mismatch

Product_unavailable

purchase_pending

purchase_unknown

verification_failure

acknowledgment_failure

restore_failure

ownership_conflict

cross_owner_entitlement

entitlement_not_applied

false_revocation

duplicate_billing

cancellation_state

refund_state

chargeback_state

ad_free_failure

Advertising_Privacy

Account_deletion_billing

accessibility
```

---

# Store and Support Knowledge Synchronization

When Product or provider configuration changes:

```text
Update Product Catalogue.

Update plan comparison.

Update Help content.

Update Support macros.

Update store listing where needed.

Update screenshots where needed.

Update runbooks.

Brief Support before activation.
```

---

# Monetization Experiment Governance

Experiments must comply with the Analytics and Product experimentation specification.

---

# Allowed Experiments

Potential:

```text
Plan-comparison layout

Neutral capability wording

Paywall illustration

Feature-order presentation

Restore-link placement

Noncritical Advertising placement

Neutral trial-term layout
```

---

# Prohibited Experiments

Do not experiment with:

```text
Purchase verification

Owner association

Acknowledgment requirements

Restore availability

Cancellation accessibility

Account deletion access

Data Export access

Security

Privacy rights

Required Accessibility

Unknown purchase Retry guidance

Financial-data Advertising use

False urgency
```

---

# Pricing Experiment Governance

Dynamic or segmented pricing may be controlled by provider offers.

Nexio must not independently select higher prices based on private financial behavior.

---

# Prohibited Pricing Inputs

Do not use:

```text
Account balance

Salary

Expense history

Debt inference

Goal progress

Transaction descriptions

Support history

Assistant prompts

Account deletion intent
```

to determine price or offer pressure.

---

# Offer Experiment Guardrails

Required:

```text
Price accuracy

Billing-period visibility

Trial-term visibility

Cancellation accessibility

Restore accessibility

Duplicate-purchase rate

Complaint rate

Refund rate

Accessibility completion

Account deletion availability
```

---

# Advertising Experiment Guardrails

Required:

```text
Critical-journey exposure

Ad-free request rate

Privacy suppression failure

Layout shift

Accessibility complaints

Accidental-tap signal

Product performance

User complaint rate
```

---

# Experiment Stop Conditions

Stop immediately when:

- Price meaning is misunderstood.
- Trial conversion is misunderstood.
- Duplicate purchase attempts increase.
- Restore use decreases because it is hidden.
- Cancellation becomes harder.
- Accessibility degrades.
- Ads enter Critical journeys.
- Privacy suppression fails.
- Financial-data exposure occurs.

---

# Monetization Metrics Architecture

Recommended groups:

```text
Safety

Catalogue

Purchase

Verification

Restore

Subscription

Entitlement

Limits

Advertising

Privacy

Accessibility

Support

Revenue reconciliation

Store readiness
```

---

# Safety Metrics

```text
cross_owner_entitlement_count

duplicate_billing_count

false_purchase_completion_count

invalid_purchase_grant_count

false_revocation_count

purchase_token_exposure_count

Account_deletion_block_count

Export_block_after_expiration_count

financial_data_ad_request_count

critical_journey_ad_count
```

Targets should be zero.

---

# Catalogue Metrics

```text
active_Product_count

mapping_mismatch_rate

Product_query_success_rate

price_load_success_rate

offer_eligibility_unknown_rate

paused_Product_count
```

---

# Purchase Metrics

```text
purchase_attempt_rate

purchase_pending_rate

purchase_cancelled_rate

purchase_unknown_outcome_rate

repeated_tap_prevention_rate

already_owned_recovery_rate
```

---

# Verification Metrics

```text
verification_success_rate

verification_failure_rate

verification_timeout_rate

owner_conflict_rate

environment_mismatch_rate

invalid_purchase_rate
```

---

# Acknowledgment Metrics

```text
acknowledgment_success_rate

acknowledgment_retry_rate

acknowledgment_unknown_rate

acknowledgment_deadline_risk_count
```

---

# Restore Metrics

```text
restore_success_rate

restore_partial_rate

restore_no_purchase_rate

restore_provider_failure_rate

restore_ownership_conflict_rate
```

---

# Subscription Metrics

```text
active_subscription_count

cancelled_active_count

grace_count

hold_count

paused_count

expired_count

refund_count

chargeback_count

state_conflict_count
```

---

# Entitlement Metrics

```text
entitlement_grant_success_rate

entitlement_propagation_failure_rate

ad_free_propagation_failure_rate

alternate_source_preservation_rate

manual_grant_count

expired_manual_grant_count
```

---

# Limit Metrics

```text
limit_reached_rate

concurrency_limit_conflict_rate

over_limit_preserved_count

usage_repair_count

limit_reset_failure_rate
```

---

# Advertising Metrics

```text
ad_eligibility_rate

ad_suppression_entitlement_rate

ad_suppression_Privacy_rate

ad_suppression_critical_journey_rate

ad_load_success_rate

no_fill_rate

ad_render_failure_rate

ad_free_request_violation_count
```

---

# Privacy Metrics

```text
Advertising_withdrawal_propagation_rate

unknown_Privacy_request_count

Advertising_identifier_deletion_failure_count

billing_data_retention_violation_count
```

---

# Accessibility Metrics

```text
plan_comparison_screen_reader_completion

purchase_flow_keyboard_completion

restore_accessibility_failure_rate

paywall_dismissal_failure_rate

Advertisement_label_failure_rate

large_text_failure_rate
```

---

# Support Metrics

```text
billing_case_rate

charged_without_access_case_rate

repurchase_prevention_success_rate

restore_resolution_rate

ownership_escalation_rate

duplicate_billing_case_rate

ad_free_case_rate
```

---

# Revenue Reconciliation Metrics

```text
provider_purchase_match_rate

unmatched_purchase_count

refund_mismatch_count

chargeback_mismatch_count

test_purchase_exclusion_failure_count

entitlement_without_purchase_count
```

---

# Store Readiness Metrics

```text
Product_configuration_failure_count

offer_configuration_failure_count

listing_drift_count

Data_Safety_drift_count

Account_deletion_link_failure_count

test_track_purchase_failure_rate
```

---

# Metric Anti-Gaming

Do not improve monetization metrics by:

- Hiding Restore
- Treating pending as completed
- Counting provider UI open as purchase
- Counting callback as verified revenue
- Suppressing billing complaints
- Making cancellation harder
- Excluding failed purchases without justification
- Showing more Ads in Critical journeys
- Weakening Privacy suppression
- Removing free access to user-owned data

---

# Monetization Review Cadence

Recommended:

```text
Continuous operational review

Weekly pending-purchase and acknowledgment review

Weekly Advertising Privacy review

Release-cycle Catalogue and mapping review

Monthly Provider and Store review

Monthly revenue reconciliation review

Quarterly Privacy and Accessibility review

Annual provider-exit review

Incident-driven review
```

---

# Monetization Portfolio Health

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

- Products load.
- Prices are current.
- Purchases verify.
- Restore works.
- Entitlements propagate.
- Ads respect Privacy.
- No Critical guardrail failure exists.

---

# Watch

- Verification latency rising
- Acknowledgment backlog growing
- Offer eligibility changing
- Ad provider no-fill increasing
- Store review approaching

---

# Degraded

- New purchases fail materially.
- Existing access remains safe.
- Restore may be limited.
- Ads are suppressed.
- Correction is active.

---

# At Risk

- Owner association uncertain
- Valid access may be revoked incorrectly
- Purchase-token exposure risk
- Account deletion behavior unreliable
- Advertising Privacy uncertain

---

# Paused

A Product, offer, provider, placement or purchase path is intentionally disabled.

---

# Change Management

A material monetization change should identify:

```text
Canonical Products

Plans

Capabilities

Limits

Provider Product mappings

Prices and offers

Purchase flow

Verification

Acknowledgment

Restore

Subscription transitions

Entitlements

Advertising

Privacy

Accessibility

Store declarations

Account deletion

Migration

Rollback
```

---

# Material Changes

Examples:

- New plan
- New subscription Product
- New billing period
- New provider
- New trial
- New introductory offer
- New ad-free entitlement
- New limit
- New Advertising placement
- New Ad provider
- Billing SDK upgrade
- Product mapping change
- Refund-policy change

---

# Monetization Change Record

Recommended:

```markdown
# Monetization Change

## Purpose

Which Product and business problem does this solve?

## Products and Plans

Which canonical identifiers and versions change?

## Provider Configuration

Which provider Products, base plans and offers change?

## Price Presentation

How are current provider prices and terms displayed?

## Purchase and Verification

Which purchase, verification and acknowledgment flows change?

## Entitlements

Which capabilities and limits change?

## Downgrade

How is existing Product data preserved?

## Advertising

Which placements, data and Privacy behavior change?

## Accessibility

Which purchase, paywall and Ad journeys were tested?

## Store Readiness

Which listing, billing and disclosure changes are required?

## Account Deletion

How is external billing distinguished?

## Operations

Which metrics, alerts and runbooks change?

## Rollback

How can purchase or Advertising be stopped safely?
```

---

# Pull Request Contract

Material Pull Requests should include:

```markdown
## Requirements

- NEX-...

## Products and Plans

- MON-PRODUCT-...
- MON-PLAN-...
- ENT-CAPABILITY-...

## Provider Mapping

Provider Product, base plan and offer mappings

## Purchase Flow

Attempt, verification, acknowledgment and Restore behavior

## Subscription Lifecycle

Cancellation, grace, hold, expiration, refund and chargeback

## Entitlements

Grant, propagation, union and downgrade behavior

## Advertising

Placements, Privacy, ad-free suppression and provider configuration

## Store Readiness

Provider console, listing and disclosure changes

## Tests

Owner, process-death, duplicate, Privacy and Accessibility tests

## Operations

Metrics, alerts, reconciliation and runbooks

## Remaining Gaps

Unresolved risks
```

---

# Definition of Ready

A monetization capability is ready for planning when:

```text
□ Product purpose is defined.

□ Free and paid boundaries are defined.

□ Canonical Product exists.

□ Plan exists.

□ Capability identifiers exist.

□ Provider strategy exists.

□ Downgrade behavior is defined.

□ Privacy impact is defined.

□ Accessibility flow is defined.

□ Store impact is defined.

□ Account deletion behavior is defined.

□ Owners are assigned.
```

---

# Definition of Implemented

A capability is implemented when:

```text
□ Catalogue entry exists.

□ Provider mapping exists.

□ Product loading exists.

□ Purchase or Advertising flow exists.

□ Entitlement evaluation exists.

□ Error states exist.

□ Telemetry hooks exist.

□ Kill switch exists.
```

Implementation does not mean verified, releasable or Production-safe.

---

# Definition of Verified

A capability is verified when:

```text
□ Provider Product query passes.

□ Current price loads.

□ Purchase lifecycle passes.

□ Verification passes.

□ Acknowledgment passes where required.

□ Restore passes.

□ Subscription lifecycle passes.

□ Entitlement propagation passes.

□ Downgrade preserves data.

□ Owner isolation passes.

□ Privacy passes.

□ Accessibility passes.

□ Account deletion passes.
```

---

# Definition of Releasable

A capability is releasable when:

```text
□ Catalogue and mappings are active.

□ Provider configuration is Production-ready.

□ Test and Production environments are separated.

□ Store declarations are current.

□ Monitoring and alerts are active.

□ Reconciliation exists.

□ Support guidance exists.

□ Runbooks exist.

□ Rollback is defined.

□ Kill switches work.
```

---

# Definition of Released

A capability is released when:

```text
□ Approved owners can access it.

□ Current provider prices load.

□ Purchase or Advertising scope matches the release.

□ Active versions are recorded.

□ Production monitoring observes expected states.

□ Support is ready.

□ Release evidence exists.
```

---

# Definition of Operationally Verified

A capability is operationally verified when:

```text
□ Production Product queries succeed.

□ Purchases verify.

□ Acknowledgments complete.

□ Restore works.

□ Subscription events reconcile.

□ Entitlements propagate.

□ Ads respect Privacy and ad-free access.

□ No Critical guardrail failure exists.

□ Support can diagnose common issues.
```

---

# Definition of Current

A monetization capability is current when:

```text
□ Catalogue is current.

□ Provider mapping is current.

□ Provider SDK is supported.

□ Prices and offers load.

□ Subscription rules remain accurate.

□ Store declarations remain accurate.

□ Privacy and Accessibility reviews are current.

□ Support and runbooks are current.

□ Review date has not expired.
```

---

# Definition of Deprecated

A Product or capability is deprecated when:

```text
□ New purchase is discouraged or blocked.

□ Existing entitlement behavior is defined.

□ Migration or replacement exists where required.

□ User communication exists.

□ Removal conditions are defined.
```

---

# Definition of Removed

A monetization capability is fully removed only when:

```text
□ New purchase is impossible.

□ Provider Product is deactivated or retired appropriately.

□ Provider mappings are removed.

□ Purchase UI is removed.

□ Paywalls are removed.

□ Entitlements are migrated or preserved as required.

□ Advertising placements are removed.

□ SDKs and credentials are removed where possible.

□ Store listing is updated.

□ Privacy declarations are updated.

□ Support content is updated.

□ Monitoring is retired.

□ Historical evidence remains preserved.
```

---

# AI Governance Architecture

AI may assist with bounded monetization work.

AI must not become the authority for:

```text
Current price

Offer eligibility

Purchase verification

Owner association

Subscription state

Refund authority

Entitlement grant

Entitlement revocation

Advertising Privacy

Account deletion

Revenue settlement
```

---

# AI Required Context

Before assisting, AI should receive:

```text
Task purpose

Canonical Product identifier

Plan identifier

Capability identifiers

Provider identifier

Provider Product mapping

Verified provider state

Current entitlement state

Current Privacy state

Current store context

Allowed claims

Prohibited claims

Current locale glossary

Required review
```

---

# Allowed AI Uses

AI may assist with:

- Drafting neutral plan descriptions
- Comparing plan capability tables
- Drafting Help content
- Summarizing provider errors
- Drafting Support macros
- Detecting dark-pattern language
- Detecting missing renewal wording
- Detecting inconsistent plan terminology
- Drafting test cases
- Drafting Incident-message structure
- Reviewing Advertising copy separation

---

# Forbidden AI Uses

AI must not:

- Invent a current price.
- Invent a discount.
- Invent trial eligibility.
- Invent a billing period.
- Invent purchase completion.
- Invent subscription cancellation.
- Invent a refund.
- Grant an entitlement.
- Revoke an entitlement.
- Associate a purchase with an owner.
- Choose a price based on private financial records.
- Personalize Ads from private financial data.
- Mark revenue reconciled without evidence.
- Send billing communication autonomously.

---

# AI Plan-Description Rules

AI-generated descriptions should:

- Match active capability identifiers.
- Avoid unsupported benefits.
- Avoid guaranteed financial outcomes.
- Avoid fear or shame.
- Explain data preservation.
- Explain billing period only from provider evidence.
- Avoid presenting a synthetic price as current.

---

# AI Generic Price Example Rule

When a generic `pt-BR` learning example is necessary, use a clearly synthetic amount such as:

```text
R$ 9,90 por mês
```

The content must state that it is an example and not a current Nexio price.

---

# AI Purchase-Support Rules

AI may explain:

```text
Pending

Verification required

Restore

Cancellation versus expiration

Provider management
```

It must not request:

- Purchase tokens
- Payment-card details
- Full receipts in an unapproved channel
- Another owner's information

---

# AI Advertising Rules

AI may assist with:

- Label wording
- Placement explanation
- Privacy-safe content review
- Category-policy review

AI must not use:

- Balances
- Transactions
- Goals
- Salary inference
- Debt inference
- Assistant prompts
- Support cases

for Advertising targeting.

---

# AI Incident-Drafting Rules

AI may draft only from verified Incident facts.

It must not:

- Invent affected-owner count.
- Invent charge amounts.
- Claim a refund was issued.
- Claim access is restored.
- Claim no Privacy impact without evidence.
- Add an unsupported resolution estimate.

---

# AI Output Labels

AI output should distinguish:

```text
verified_provider_fact

canonical_Product_fact

draft_wording

suggestion

inference

requires_verification

unknown
```

---

# AI Monetization Prompt Template

```text
You are assisting with a bounded Nexio monetization task.

Task:
[TASK]

Canonical Product:
[PRODUCT ID]

Plan:
[PLAN ID]

Capabilities:
[CAPABILITY IDS]

Provider:
[PROVIDER]

Provider Product mapping:
[MAPPING]

Verified provider state:
[STATE]

Verified current price:
[PRICE OR UNKNOWN]

Billing period:
[PERIOD OR UNKNOWN]

Offer eligibility:
[ELIGIBILITY]

Current owner-safe entitlement state:
[ENTITLEMENT STATE]

Advertising Privacy state:
[PRIVACY STATE]

Allowed claims:
[CLAIMS]

Forbidden claims:
[FORBIDDEN CLAIMS]

Locale:
[LOCALE]

Do not:
- Invent prices
- Invent discounts
- Invent trials
- Invent purchase completion
- Grant or revoke access
- Choose an owner
- Use financial records for pricing or Advertising
- Claim provider delivery or settlement without evidence
- Hide renewal, cancellation, Restore or Account deletion

Separate verified facts, suggestions, assumptions and unknowns.
```

---

# AI Review Questions

Before accepting AI-generated monetization content:

```text
Is the Product active?

Is the current price provider-verified?

Is the billing period correct?

Are trial and renewal terms complete?

Are claims supported?

Does the content avoid dark patterns?

Does it preserve Restore?

Does it preserve Account deletion?

Does it avoid private financial targeting?

Was Product, Privacy, Accessibility and Store review completed?
```

---

# AI Test Honesty

AI must distinguish:

```text
Product configured

Provider Product loaded

Purchase initiated

Provider callback received

Purchase verified

Acknowledgment completed

Entitlement granted

Entitlement propagated

Restore completed

Subscription reconciled

Ad loaded

Ad displayed

Not tested

Unknown
```

---

# Final Governance Checklists

---

# New Product Checklist

```text
□ Canonical Product ID exists.

□ Product purpose is defined.

□ Product type is defined.

□ Plan is defined.

□ Capabilities are defined.

□ Limits are defined.

□ Free behavior is defined.

□ Paid behavior is defined.

□ Ad policy is defined.

□ Trial policy is defined.

□ Downgrade behavior is defined.

□ Existing-data preservation is defined.

□ Export remains available.

□ Account deletion remains available.

□ Owner exists.
```

---

# Provider Product Mapping Checklist

```text
□ Mapping ID and version exist.

□ Provider is approved.

□ Platform is correct.

□ Region is correct.

□ Provider Product exists.

□ Product type matches.

□ Base plan exists.

□ Billing period matches.

□ Offer mapping is correct.

□ Entitlements are correct.

□ Replacement relationships are correct.

□ Application identity matches.

□ Test environment is separated.

□ Last verification is recorded.
```

---

# Price and Offer Checklist

```text
□ Price comes from provider.

□ Currency presentation comes from provider.

□ Billing period is visible.

□ Trial duration is visible.

□ Post-trial price is visible.

□ Renewal behavior is visible.

□ Introductory duration is visible.

□ Standard renewal price is visible.

□ Offer eligibility is verified.

□ No stale hardcoded current price appears.

□ No unsupported discount percentage appears.
```

---

# Purchase Checklist

```text
□ Current owner is validated.

□ Equivalent active Product is checked.

□ Equivalent pending purchase is checked.

□ Purchase attempt ID is stable.

□ Repeated taps are blocked.

□ Final action names the provider.

□ Provider UI opening does not grant access.

□ Callback is treated as advisory.

□ Process death is handled.

□ Unknown outcome blocks repurchase.

□ Current financial records remain available.
```

---

# Verification Checklist

```text
□ Provider identity is verified.

□ Application identity is verified.

□ Environment is verified.

□ Provider Product is verified.

□ Canonical Product mapping is verified.

□ Purchase state is verified.

□ Purchase uniqueness is verified.

□ Owner association is verified.

□ Refund state is checked.

□ Revocation state is checked.

□ Result is idempotent.

□ Cross-owner conflicts reveal no other-owner data.
```

---

# Acknowledgment Checklist

```text
□ Purchase is verified first.

□ Acknowledgment is required by provider.

□ Operation identity is stable.

□ Retry is bounded.

□ Timeout becomes unknown outcome.

□ Provider state is queried before duplicate Retry.

□ Deadline monitoring exists.

□ Repurchase is never used as repair.
```

---

# Restore Checklist

```text
□ Restore is visible.

□ Current owner is authenticated.

□ Current store Account is queried.

□ Provider purchases are deduplicated.

□ Every purchase is verified.

□ Owner association is checked.

□ Existing access is recognized.

□ Pending results remain pending.

□ Partial results are visible.

□ No-purchase result changes no financial data.

□ Reinstall is supported.

□ Device change is supported.

□ Local-data clearing is supported.
```

---

# Subscription Checklist

```text
□ State is versioned.

□ Current period is known where available.

□ Auto-renew state is distinct.

□ Cancellation is distinct from expiration.

□ Grace behavior is defined.

□ Hold behavior is defined.

□ Pause behavior is defined where supported.

□ Refund behavior is defined.

□ Chargeback behavior is defined.

□ Out-of-order events are reconciled.

□ Alternate entitlement sources are checked.
```

---

# Entitlement Checklist

```text
□ Entitlement is owner-scoped.

□ Capability is explicit.

□ Source is explicit.

□ Start is explicit.

□ End is explicit.

□ Offline policy is explicit.

□ Union policy is explicit.

□ Propagation is versioned.

□ Cache is expiring.

□ Downgrade behavior preserves data.

□ Revocation checks alternate sources.

□ Manual grants are auditable.
```

---

# Limit Checklist

```text
□ Limit is capability-specific.

□ Limit type is defined.

□ Reset period is defined.

□ Usage derives from canonical Product state.

□ Enforcement occurs in Application services.

□ Concurrency is handled.

□ Existing excess state is preserved.

□ Export remains available.

□ User deletion remains available.

□ Counter repair is possible.
```

---

# Paywall Checklist

```text
□ Capability boundary is accurate.

□ Current plan is shown.

□ Current provider price is shown where available.

□ Billing period is shown.

□ Trial terms are complete.

□ Restore is available where relevant.

□ Manage subscription is available where relevant.

□ Not now or safe exit exists.

□ User-owned data remains accessible.

□ Frequency is bounded.

□ Accessibility passes.

□ No dark pattern exists.
```

---

# Advertising Placement Checklist

```text
□ Placement ID exists.

□ Placement is outside Critical journeys.

□ Eligible plans are defined.

□ Ad-free suppression is defined.

□ Privacy behavior is defined.

□ Unknown Privacy suppresses requests.

□ Advertisement label is visible and accessible.

□ Frequency is bounded.

□ Layout shift is bounded.

□ Owner switching is handled.

□ Sign-out is handled.

□ Account deletion is handled.

□ Provider kill switch exists.
```

---

# Advertising Provider Checklist

```text
□ Provider is registered.

□ Purpose is approved.

□ Data categories are minimized.

□ Consent integration is defined.

□ Personalization modes are defined.

□ Test configuration exists.

□ Production configuration is separate.

□ Retention is known.

□ Deletion behavior is known.

□ Category controls are configured.

□ Monitoring exists.

□ Kill switch works.

□ Exit plan exists.
```

---

# Store Readiness Checklist

```text
□ Application identity is correct.

□ Billing-library version is supported.

□ Provider Products are active.

□ Base plans are active.

□ Offers are active.

□ Regions are correct.

□ Prices load.

□ Trial terms match Product content.

□ Restore works.

□ Subscription management works.

□ Data Safety declarations are accurate.

□ Advertising declarations are accurate.

□ Account deletion path works.

□ Listing claims match Product behavior.

□ Test and Production environments are separate.
```

---

# Privacy Checklist

```text
□ Purchase tokens are protected.

□ Full receipts are minimized.

□ Billing data retention is defined.

□ Advertising requests exclude financial data.

□ Unknown Privacy suppresses Ads.

□ Withdrawal stops eligible requests.

□ Ad identifiers are processed during deletion.

□ Analytics excludes purchase secrets.

□ Marketing remains separate.

□ Account deletion is not blocked.
```

---

# Accessibility Checklist

```text
□ Plan comparison works with screen readers.

□ Prices and periods are announced together.

□ Trial terms are readable.

□ Purchase actions are explicit.

□ Restore is reachable.

□ Manage subscription is reachable.

□ Pending state is announced.

□ Error summary receives focus.

□ Paywalls have a safe exit.

□ Ads are semantically labeled.

□ Keyboard focus is not trapped.

□ Large text reflows.
```

---

# Reconciliation Checklist

```text
□ Purchase attempts are collected.

□ Provider purchases are collected.

□ Subscription states are collected.

□ Acknowledgments are collected.

□ Entitlements are collected.

□ Refunds are collected.

□ Chargebacks are collected.

□ Test purchases are identified.

□ Matching keys are stable.

□ Discrepancies are classified.

□ Automated repair is bounded.

□ Manual review exists.

□ Evidence is preserved.
```

---

# Account Deletion Checklist

```text
□ Deletion is available with active subscription.

□ External cancellation is explained separately.

□ Ads stop.

□ Marketing stops.

□ Optional monetization communication stops.

□ Owner-specific entitlements leave active use.

□ Provider identifiers are processed.

□ Manual grants are processed.

□ Restore cannot recreate the deleted owner automatically.

□ Required evidence is minimized.

□ Export remains available before final deletion according to policy.
```

---

# Incident Checklist

```text
□ Incident category is defined.

□ Severity is assigned.

□ Products and mappings are known.

□ Provider scope is known.

□ Owner scope is known.

□ Purchase scope is known.

□ Entitlement scope is known.

□ Purchase initiation can be stopped.

□ Destructive revocation can be frozen.

□ Ads can be suppressed.

□ Provider kill switches work.

□ Reconciliation exists.

□ Support is notified.

□ User communication uses verified facts.

□ Post-Incident review is scheduled.
```

---

# Support Training Checklist

```text
□ Agents understand provider price authority.

□ Agents understand callback versus verification.

□ Agents understand verification versus acknowledgment.

□ Agents understand purchase versus entitlement.

□ Agents understand pending purchases.

□ Agents understand cancellation versus expiration.

□ Agents understand grace and hold.

□ Agents understand Restore.

□ Agents understand ownership conflicts.

□ Agents understand refund authority.

□ Agents understand ad-free propagation.

□ Agents never request raw purchase tokens.

□ Agents do not recommend repurchase before reconciliation.

□ Agents allow Account deletion with active billing.
```

---

# Monetization Release Gate

A monetization release must not proceed when:

```text
Canonical Product is missing.

Provider mapping is unverified.

Current price does not load.

Billing period is hidden.

Trial terms are incomplete.

Client callback grants access directly.

Purchase verification is missing.

Acknowledgment is non-idempotent.

Pending purchases can be duplicated.

Restore is unavailable.

Owner-association tests fail.

Cancellation and expiration are conflated.

Downgrade deletes Product data.

Export is blocked by expiration.

Account deletion is blocked.

Advertising uses financial data.

Ads appear in Critical journeys.

Unknown Privacy permits Ad requests.

Ad-free suppression fails.

Required Accessibility fails.

Provider kill switches are missing.

Support and Incident runbooks are missing.
```

---

# Post-Release Review

After release, review:

```text
Product-query success

Price and offer accuracy

Purchase attempts

Pending purchases

Unknown outcomes

Verification

Acknowledgment

Restore

Subscription transitions

Entitlement propagation

Downgrade behavior

Limit enforcement

Ad-free suppression

Advertising Privacy

Provider health

Store drift

Support cases

Revenue reconciliation

Account deletion
```

---

# Final Acceptance Criteria

The Nexio Monetization, Subscriptions, Advertising and Entitlements architecture is accepted only when:

1. Monetization never blocks access to existing user-owned financial records.

2. Monetization never weakens exact Money behavior.

3. Monetization never weakens Currency handling.

4. Monetization never weakens owner isolation.

5. Monetization never weakens Security.

6. Monetization never weakens Privacy.

7. Monetization never weakens Accessibility.

8. Monetization never blocks user-owned data Export.

9. Monetization never blocks Account deletion.

10. Every canonical Product has a stable identifier.

11. Every plan has a stable identifier.

12. Every capability has a stable identifier.

13. Every Product Catalogue change is versioned.

14. Every plan capability change is versioned.

15. Every provider Product mapping is versioned.

16. Product identifiers are not reused for unrelated purposes.

17. Paid and free capability boundaries are explicit.

18. Safety is not treated as a paid capability.

19. Downgrade behavior is defined before Product activation.

20. Existing Product data is preserved after downgrade.

21. Premium-created data remains readable or recoverable.

22. Product limits do not silently delete excess state.

23. Product limits are enforced by Application services.

24. Limit usage derives from canonical Product state.

25. Limit concurrency is handled.

26. Every Product has an accountable owner.

27. Every plan has an accountable owner.

28. Every entitlement capability has an accountable owner.

29. Every provider has an accountable owner.

30. Every Advertising placement has an accountable owner.

31. Product lifecycle states are defined.

32. Plan lifecycle states are defined.

33. Capability lifecycle states are defined.

34. Provider lifecycle states are defined.

35. Advertising placement lifecycle states are defined.

36. Products can be paused without revoking valid access.

37. Offers can be paused independently.

38. Providers can be disabled independently.

39. Advertising placements can be disabled independently.

40. Every Product has an exit plan.

41. Every provider has an exit plan.

42. Every Advertising provider has an exit plan.

43. Provider Product existence is verified.

44. Provider Product type is verified.

45. Base-plan existence is verified.

46. Billing period is verified.

47. Region availability is verified.

48. Application identity is verified.

49. Provider Product mapping determines entitlement scope explicitly.

50. Missing or invalid mapping disables new purchase safely.

51. Existing entitlements survive temporary mapping failure.

52. Provider-returned localized price is purchase authority.

53. Nexio does not independently convert provider prices.

54. Billing period appears with price.

55. Trial duration appears before purchase.

56. Post-trial price appears before purchase.

57. Trial renewal behavior appears before purchase.

58. Introductory duration appears before purchase.

59. Standard renewal price appears before purchase.

60. Offer eligibility is provider-verified.

61. Stale prices cannot initiate purchase.

62. Marketing content cannot override provider price.

63. Unsupported discounts are not invented.

64. “Most popular” claims require evidence.

65. Every purchase attempt has a stable identity.

66. Repeated taps cannot create concurrent equivalent purchase attempts.

67. Provider UI opening is not purchase completion.

68. Client callback is not durable entitlement authority.

69. Pending purchases remain pending.

70. Pending purchases prevent equivalent repurchase.

71. Unknown outcomes prevent equivalent repurchase.

72. Provider purchase references are deduplicated.

73. Android process death supports reconciliation.

74. Rotation does not relaunch the purchase flow.

75. Application upgrades preserve pending purchase identity.

76. Purchase verification validates provider identity.

77. Purchase verification validates application identity.

78. Purchase verification validates environment.

79. Purchase verification validates Product identity.

80. Purchase verification validates canonical mapping.

81. Purchase verification validates purchase state.

82. Purchase verification validates uniqueness.

83. Purchase verification checks refund state.

84. Purchase verification checks revocation state.

85. Purchase verification checks owner association.

86. Verification is idempotent.

87. Invalid purchases cannot grant Product access.

88. Cross-owner purchase conflicts reveal no other-owner information.

89. Deleted-owner purchase references require an approved reassociation policy.

90. Unknown verification preserves current access safely.

91. Acknowledgment occurs only after verification.

92. Acknowledgment operations have stable identity.

93. Acknowledgment Retry is bounded.

94. Acknowledgment timeout becomes unknown outcome.

95. Missing acknowledgment does not trigger repurchase.

96. Consumable benefit is durable before provider consumption.

97. Nonconsumable purchases are restorable.

98. Restore purchases is visible.

99. Restore does not require repurchase.

100. Restore queries the current provider context.

101. Restore verifies every purchase.

102. Restore validates owner association.

103. Restore distinguishes active, restored, pending and conflicted states.

104. Partial Restore is reported honestly.

105. Reinstall supports Restore.

106. Device change supports Restore.

107. Local-data clearing supports Restore.

108. Restore ownership conflicts reveal no other-owner data.

109. Billing state and entitlement state remain distinct.

110. Cancellation remains distinct from expiration.

111. Auto-renew state remains distinct from active access.

112. Cancelled-active state preserves access to the verified period end.

113. Grace state is represented explicitly.

114. Account hold is represented explicitly.

115. Pause state is represented where supported.

116. Unknown subscription state is not treated as expired automatically.

117. Subscription transitions are versioned.

118. Subscription events are authenticated.

119. Subscription events are replay-protected.

120. Subscription events are idempotent.

121. Out-of-order events are reconciled.

122. Current provider state can supersede stale event arrival order.

123. Subscription management is easy to find.

124. Cancellation uses the approved provider path.

125. Cancellation avoids dark patterns.

126. Cancellation does not claim data deletion.

127. Account deletion does not claim subscription cancellation.

128. Trial eligibility is verified.

129. Trial purchase uses normal verification.

130. Trial conversion does not duplicate entitlements.

131. Trial expiration preserves Product data.

132. Trial reminders avoid manipulative countdowns.

133. Upgrade pricing remains provider-authoritative.

134. Nexio does not invent proration.

135. Upgrade replacement relationships are recorded.

136. Unknown upgrade outcomes block repeated plan changes.

137. Downgrade timing follows provider authority.

138. Downgrade preserves existing data.

139. Downgrade keeps Export available.

140. Downgrade keeps Account deletion available.

141. Excess items are not automatically deleted.

142. Read-only behavior is explicit.

143. Refund events require provider verification.

144. Chargeback events require provider verification.

145. Refunds do not delete Product data.

146. Chargebacks do not delete Product data.

147. Refunds and chargebacks recalculate entitlement.

148. Refund and chargeback communications remain neutral.

149. Manual grants use canonical entitlement records.

150. Manual grants do not alter provider billing state.

151. Support grants require reason and authority.

152. Support grants are bounded.

153. Promotions are owner-scoped.

154. Promotions have start and end Dates.

155. Promotion expiration checks alternate access sources.

156. Multiple entitlement sources are reconciled through explicit union rules.

157. Expiration of one source does not revoke another source.

158. Entitlements are owner-scoped.

159. Entitlements identify capability.

160. Entitlements identify source.

161. Entitlements identify start and end.

162. Entitlement caches are owner-scoped.

163. Entitlement caches expire.

164. Account switching invalidates prior-owner cache.

165. Sign-out clears owner-specific monetization state.

166. Offline entitlement policy is capability-specific.

167. Offline cache failure does not delete user data.

168. Ad-free access is preserved offline for the approved verified period.

169. Current-device entitlement propagation occurs without unnecessary restart.

170. Cross-device propagation remains owner-scoped.

171. Propagation failure does not require repurchase.

172. Ad-free propagation stops new Advertising requests.

173. Loaded Ads are destroyed after ad-free activation.

174. False entitlement revocation protection exists.

175. False entitlement grant protection exists.

176. Product limits use canonical usage.

177. Product limits are applied atomically where required.

178. Plan reset periods are explicit.

179. Billing-period limits use verified period boundaries.

180. Over-limit downgrade state preserves existing items.

181. Usage drift can be repaired.

182. Paywalls explain one bounded capability.

183. Paywalls do not block user-owned data.

184. Paywalls display current provider price where available.

185. Paywalls display billing period.

186. Paywalls display trial terms.

187. Paywalls provide Restore where relevant.

188. Paywalls provide Manage subscription where relevant.

189. Paywalls provide a safe exit.

190. Paywall frequency is bounded.

191. Paywalls are excluded from Critical journeys.

192. Paywalls pass Accessibility review.

193. Advertising is governed separately from billing.

194. Free-plan use does not automatically authorize personalized Advertising.

195. Every Advertisement placement is registered.

196. Every placement defines eligible plans.

197. Every placement defines excluded journeys.

198. Every placement defines Privacy policy.

199. Every placement defines Accessibility requirements.

200. Every placement defines frequency policy.

201. Every placement defines performance limits.

202. Ads are clearly labeled.

203. Ads remain visually separate from financial records.

204. Ads never influence Product calculations.

205. Ads never influence Assistant factual output.

206. Ads never alter Support priority.

207. Ads never alter Account deletion.

208. Advertising requests exclude exact balances.

209. Advertising requests exclude Transaction Amounts.

210. Advertising requests exclude Transaction descriptions.

211. Advertising requests exclude Account names.

212. Advertising requests exclude Goal details.

213. Advertising requests exclude Report totals.

214. Advertising requests exclude Export content.

215. Advertising requests exclude Support content.

216. Advertising requests exclude Assistant prompts.

217. Advertising does not target inferred financial distress.

218. Advertising does not target inferred debt.

219. Advertising does not target salary.

220. Advertising does not target medical or legal spending.

221. Advertising does not masquerade as financial advice.

222. Advertising does not masquerade as Security.

223. Advertising does not appear during Authentication.

224. Advertising does not appear during recovery.

225. Advertising does not appear during Transaction confirmation.

226. Advertising does not appear during Transfer confirmation.

227. Advertising does not appear during unknown financial outcomes.

228. Advertising does not appear during Import confirmation.

229. Advertising does not appear during Export download.

230. Advertising does not appear during Privacy controls.

231. Advertising does not appear during Account deletion.

232. Advertising does not appear during Support escalation.

233. Unknown Advertising Privacy suppresses requests.

234. Advertising withdrawal stops future eligible requests.

235. Ad-free entitlement suppresses eligible requests.

236. Stale Ad callbacks are revalidated.

237. Account switching destroys prior-owner Ads.

238. Sign-out stops owner-specific Ads.

239. Account deletion stops Ads.

240. Ad provider failure does not block Product use.

241. No-fill does not become a Product error.

242. Ad views are destroyed safely.

243. Ads do not trap keyboard focus.

244. Ads do not create excessive layout shift.

245. Ads do not block initial Product render.

246. Development uses provider-approved test Ads.

247. Production Ad configuration is environment-specific.

248. Advertising provider SDK access is bounded.

249. Advertising identifiers remain outside financial Domain state.

250. Advertising identifiers are processed during deletion.

251. Billing providers have Registry records.

252. Advertising providers have Registry records.

253. Provider SDK versions are pinned.

254. Provider SDK upgrades receive review.

255. Provider credentials are protected.

256. Provider callbacks are authenticated.

257. Provider callbacks are replay-protected.

258. Provider callbacks are idempotent.

259. Provider rate limits are known.

260. Provider retention is known.

261. Provider deletion behavior is known.

262. Every provider has a kill switch.

263. Every provider has an exit plan.

264. Provider removal includes SDKs, credentials and webhooks.

265. Provider removal updates Privacy disclosures.

266. Provider removal updates Store declarations.

267. Product and provider mappings are auditable.

268. Prices and offers are auditable.

269. Purchase attempts are auditable.

270. Verification is auditable.

271. Acknowledgment is auditable.

272. Restore is auditable.

273. Subscription transitions are auditable.

274. Entitlements are auditable.

275. Manual grants are auditable.

276. Advertising placements are auditable.

277. Purchase reconciliation is defined.

278. Reconciliation compares attempts and provider purchases.

279. Reconciliation compares purchases and entitlements.

280. Reconciliation compares refunds and chargebacks.

281. Reconciliation identifies test purchases.

282. Reconciliation classifies discrepancies.

283. Automated repair is bounded.

284. Uncertain ownership requires review.

285. Revenue reporting remains distinct from Product entitlement.

286. Revenue reports keep Currencies separated.

287. Provider settlement does not create user financial Transactions.

288. Test purchases are excluded from Production revenue metrics.

289. Catalogue audits are defined.

290. Price audits are defined.

291. Purchase audits are defined.

292. Verification audits are defined.

293. Acknowledgment audits are defined.

294. Restore audits are defined.

295. Subscription audits are defined.

296. Entitlement audits are defined.

297. Limit audits are defined.

298. Advertising audits are defined.

299. Provider audits are defined.

300. Store audits are defined.

301. Privacy audits are defined.

302. Accessibility audits are defined.

303. Account deletion audits are defined.

304. Revenue reconciliation audits are defined.

305. Critical findings require immediate containment.

306. Critical findings require affected-owner analysis.

307. Critical findings require verification before closure.

308. Observability covers Product-query health.

309. Observability covers current price availability.

310. Observability covers pending purchases.

311. Observability covers unknown purchase outcomes.

312. Observability covers verification.

313. Observability covers acknowledgment.

314. Observability covers Restore.

315. Observability covers subscription transitions.

316. Observability covers entitlement propagation.

317. Observability covers ad-free suppression.

318. Observability covers Advertising Privacy.

319. Observability covers provider events.

320. Observability covers Account deletion cleanup.

321. Telemetry excludes purchase tokens.

322. Telemetry excludes payment-card data.

323. Telemetry excludes private financial records.

324. Telemetry excludes provider credentials.

325. Product-query SLOs are defined.

326. Purchase-verification SLOs are defined.

327. Pending-purchase reconciliation SLOs are defined.

328. Acknowledgment SLOs are defined.

329. Restore SLOs are defined.

330. Entitlement-propagation SLOs are defined.

331. Ad-free suppression SLOs are defined.

332. Advertising Privacy SLOs are defined.

333. Cross-owner entitlement target is zero.

334. False purchase completion target is zero.

335. Nexio-caused duplicate billing target is zero.

336. Account deletion remains available as an objective.

337. User-owned data Export remains available as an objective.

338. Zero-tolerance failures are excluded from error-budget normalization.

339. Operational dashboards include owner-safety guardrails.

340. Critical alerts connect to runbooks.

341. Alerts exclude payment secrets.

342. Incident categories are defined.

343. Products can be paused during Incidents.

344. Offers can be paused during Incidents.

345. Purchase initiation can be disabled during Incidents.

346. Destructive entitlement revocation can be frozen.

347. Ads can be suppressed globally.

348. Provider kill switches can be activated.

349. Cross-owner Incidents protect all owner identities.

350. Duplicate-billing Incidents preserve purchase references.

351. Invalid-grant Incidents preserve Product data.

352. False-revocation Incidents avoid repurchase.

353. Purchase-token Incidents remove secrets from logs and AI systems.

354. Price Incidents disable stale purchase surfaces.

355. Verification Incidents preserve pending purchase identities.

356. Acknowledgment Incidents prioritize provider deadlines.

357. Restore Incidents do not redirect users to repurchase.

358. Subscription-state Incidents query current provider authority.

359. Advertising Privacy Incidents stop provider requests.

360. Account deletion billing Incidents remove the blocking condition.

361. Incident user communication uses verified facts.

362. Post-Incident reviews examine Catalogue and provider mappings.

363. Support diagnostics exclude raw purchase tokens.

364. Support diagnostics exclude payment-card data.

365. Support diagnostics exclude other-owner information.

366. Support understands current provider-price authority.

367. Support understands callback versus verification.

368. Support understands verification versus acknowledgment.

369. Support understands purchase versus entitlement.

370. Support understands pending purchases.

371. Support understands cancellation versus expiration.

372. Support understands grace and hold.

373. Support understands Restore.

374. Support understands ownership conflicts.

375. Support understands refund authority.

376. Support understands ad-free propagation.

377. Support does not recommend repurchase before reconciliation.

378. Support allows Account deletion with active billing.

379. Store Products match canonical mappings.

380. Store base plans match billing periods.

381. Store offers match Product content.

382. Store regions are verified.

383. Store prices load before purchase.

384. Store listing claims match implemented Product behavior.

385. Store Data Safety declarations match provider behavior.

386. Store Advertising declarations match Product behavior.

387. Store Account deletion information is current.

388. Test and Production environments are separated.

389. Test purchases do not pollute Production revenue metrics.

390. Production rollout uses staged monitoring.

391. Production rollback preserves valid existing entitlements.

392. Monetization experiments preserve owner isolation.

393. Monetization experiments preserve purchase verification.

394. Monetization experiments preserve Restore.

395. Monetization experiments preserve cancellation accessibility.

396. Monetization experiments preserve Account deletion.

397. Monetization experiments preserve Export.

398. Monetization experiments preserve required Accessibility.

399. Pricing experiments do not use private financial behavior.

400. Advertising experiments preserve Privacy suppression.

401. Experiment guardrails can stop rollout.

402. Safety metrics are defined.

403. Catalogue metrics are defined.

404. Purchase metrics are defined.

405. Verification metrics are defined.

406. Acknowledgment metrics are defined.

407. Restore metrics are defined.

408. Subscription metrics are defined.

409. Entitlement metrics are defined.

410. Limit metrics are defined.

411. Advertising metrics are defined.

412. Privacy metrics are defined.

413. Accessibility metrics are defined.

414. Support metrics are defined.

415. Revenue reconciliation metrics are defined.

416. Store readiness metrics are defined.

417. Metrics cannot treat provider UI opening as purchase.

418. Metrics cannot treat callbacks as verified revenue.

419. Metrics cannot hide billing complaints.

420. Metrics cannot improve by making cancellation harder.

421. Review cadence covers Catalogue and providers.

422. Review cadence covers pending purchases.

423. Review cadence covers acknowledgment.

424. Review cadence covers Advertising Privacy.

425. Review cadence covers revenue reconciliation.

426. Portfolio health states are defined.

427. Material changes include Product and provider impact.

428. Material changes include downgrade impact.

429. Material changes include Privacy and Accessibility impact.

430. Material changes include Store declarations.

431. Material changes include rollback.

432. Pull Requests identify canonical Product IDs.

433. Pull Requests identify plan and capability IDs.

434. Pull Requests identify provider mappings.

435. Pull Requests identify purchase lifecycle changes.

436. Pull Requests identify Advertising placement changes.

437. Definition of Ready is defined.

438. Definition of Implemented is defined.

439. Definition of Verified is defined.

440. Definition of Releasable is defined.

441. Definition of Released is defined.

442. Definition of Operationally Verified is defined.

443. Definition of Current is defined.

444. Definition of Deprecated is defined.

445. Definition of Removed is defined.

446. AI may assist with bounded monetization drafting.

447. AI may assist with dark-pattern detection.

448. AI may assist with Help and Support content.

449. AI is not current-price authority.

450. AI is not offer-eligibility authority.

451. AI is not purchase-verification authority.

452. AI is not owner-association authority.

453. AI is not subscription-state authority.

454. AI is not refund authority.

455. AI is not entitlement-grant authority.

456. AI is not entitlement-revocation authority.

457. AI is not Advertising-Privacy authority.

458. AI does not invent current prices.

459. AI does not invent discounts.

460. AI does not invent trial eligibility.

461. AI does not invent purchase completion.

462. AI does not select prices from private financial behavior.

463. AI does not target Ads from private financial behavior.

464. AI-generated Product claims require review.

465. AI-generated Incident content uses verified facts.

466. AI distinguishes purchase initiation, verification and entitlement.

467. New Products require governance checklists.

468. New provider mappings require governance checklists.

469. New purchases require verification checklists.

470. New Advertising placements require Privacy and Accessibility checklists.

471. Store readiness checklists are required.

472. Account deletion checklists are required.

473. Release gates block unsafe monetization.

474. Post-release review is required.

475. Every purchase remains traceable from Product presentation to verified entitlement.

476. Every subscription remains traceable through current provider state.

477. Every entitlement remains traceable to an approved source.

478. Every Advertisement remains traceable to an approved placement, Privacy state and provider request.

---

# Monetization, Subscriptions, Advertising and Entitlements Constitutional Rule

Every Nexio Product, plan, price, offer, purchase attempt, provider callback, verification result, acknowledgment, Restore, subscription transition, entitlement, capability limit, paywall, Advertisement, provider event and AI-assisted draft must answer:

```text
Which canonical Product and provider configuration authorize this flow, which current localized price and billing terms were verified, which authenticated owner initiated or receives the access, which purchase identity and provider state support the entitlement, which existing Product data remains preserved, which Privacy and Accessibility protections apply, and how does Nexio prevent duplicate billing, false access, false revocation, financial-data Advertising, Store inconsistency or blocked Account deletion when any provider, network, application or reconciliation step fails?
```

When the answer is uncertain, prefer the action that:

- Preserves existing financial records.
- Preserves the last safely verified entitlement for a bounded period.
- Blocks another equivalent purchase.
- Reconciles the original purchase identity.
- Keeps a purchase pending.
- Avoids acknowledgment duplication.
- Keeps Restore available.
- Keeps subscription management available.
- Keeps Export available.
- Keeps Account deletion available.
- Keeps Premium-created data readable.
- Suppresses the paywall.
- Suppresses Advertising.
- Destroys stale Ad views.
- Removes private financial data from provider requests.
- Pauses the Product or offer.
- Activates the provider kill switch.
- Requires Security, Privacy, Accessibility and Store review.
- Escalates through Support and Operations.
- Blocks the release.

A Product is not valid because it exists in a provider console.

A price is not current because it appears in documentation.

A purchase is not complete because a provider interface opened.

A subscription is not expired because auto-renew was disabled.

An entitlement is not valid because a local flag is true.

An Advertisement is not eligible because the provider can load it.

Monetization is complete only when a verified provider purchase or approved grant produces the correct owner-scoped entitlement, access propagates safely, existing Product data remains protected, Advertising respects Privacy and ad-free access, and Store, Support, operational and Account deletion behavior remain accurate.

---

# Final Authority

This document is the official Monetization, Subscriptions, Advertising and Entitlements specification for Nexio.

All future:

- Free plans
- Ad-supported plans
- Premium plans
- Subscription Products
- One-time purchases
- Trials
- Introductory offers
- Promotions
- Support grants
- Incident compensation
- Product Catalogues
- Plan Registries
- Capability Registries
- Entitlement Registries
- Provider Product mappings
- Prices
- Billing periods
- Upgrade offers
- Downgrade offers
- Purchase attempts
- Android billing flows
- Provider callbacks
- Purchase verification
- Purchase acknowledgment
- Consumable processing
- Restore purchases
- Subscription reconciliation
- Cancellation
- Grace periods
- Account hold
- Subscription pause
- Expiration
- Refunds
- Chargebacks
- Purchase reassociation
- Entitlement propagation
- Offline Premium access
- Product limits
- Limit resets
- Paywalls
- Plan comparison
- Current-plan screens
- Subscription-management links
- Advertising services
- AdMob integration
- Advertising placements
- Banner Ads
- Native Ads
- Interstitial Ads
- Rewarded Ads
- Ad-free access
- Advertising Privacy
- Advertising identifiers
- Billing providers
- Advertising providers
- Provider SDKs
- Provider events
- Store Product configuration
- Store listings
- Data Safety declarations
- Advertising declarations
- Account deletion disclosures
- Purchase reconciliation
- Revenue reconciliation
- Monetization audits
- Monetization observability
- Monetization SLOs
- Monetization Incidents
- Billing Support
- Advertising Support
- Monetization experiments
- Monetization Analytics
- AI-assisted monetization workflows

must comply with this specification.

Exceptions require a documented Product, Commercial, Domain, Billing, Entitlement, Security, Privacy, Accessibility, Android, Web, Operations, Support, Compliance, Store, Provider, Advertising, Localization, Revenue or Release decision containing:

- Canonical Product identifier
- Plan identifier
- Capability identifiers
- Provider identifier
- Provider Product identifier
- Base plan
- Offer identifier
- Supported platform
- Supported regions
- Provider price authority
- Billing period
- Trial and renewal behavior
- Purchase-verification behavior
- Acknowledgment behavior
- Restore behavior
- Owner-association behavior
- Subscription lifecycle
- Entitlement behavior
- Offline behavior
- Downgrade behavior
- Data-preservation behavior
- Advertising behavior
- Privacy impact
- Accessibility impact
- Store impact
- Account deletion impact
- Reconciliation
- Monitoring
- Kill switch
- Expiration
- Compensating control
- Correction or removal plan
- Required approvers

Undocumented Products, unverified mappings, stale prices, hidden billing terms, callback-based premium grants, duplicate purchase flows, inaccessible Restore, destructive downgrade, financial-data Advertising, misleading paywalls, blocked Account deletion, unaudited manual grants and fabricated AI monetization claims are considered Product, financial-integrity, Security, Privacy, Accessibility, consumer-trust, reliability, Support, Store, operational and governance debt.

---