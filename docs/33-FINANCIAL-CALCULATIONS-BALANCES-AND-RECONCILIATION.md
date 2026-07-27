# Nexio Financial Calculations, Balances and Reconciliation Specification

Version: 1.0  
Status: Official  
Authority Level: Platform Financial Integrity and Calculation Standard  
Applies To: Web Application, Android Application, Backend Services, APIs, Database, Storage, Imports, Exports, Transactions, Transfers, Accounts, Budgets, Goals, Recurring Transactions, Dashboards, Reports, Analytics, Synchronization, Offline Operations, Support, Audit and Financial Reconciliation

---

# Purpose

This specification defines the official Financial Calculations, Balances and Reconciliation architecture for Nexio.

It establishes how Nexio must:

- Represent monetary values safely.
- Calculate Account balances deterministically.
- Distinguish posted, pending, scheduled, projected and reconciled values.
- Process income, expenses, Transfers, adjustments, reversals and deletions.
- Apply decimal precision and rounding rules.
- Prevent floating-point calculation defects.
- Preserve financial state transitions.
- Reconstruct current and historical balances.
- Calculate budgets, goals, cash flow and financial summaries.
- Reconcile Nexio records with external statements and imported data.
- Detect missing, duplicated, inconsistent or unexplained financial Events.
- Support offline operations and synchronization without duplicating values.
- Preserve calculation versions and policy references.
- Provide safe correction procedures.
- Ensure that Android, Web, APIs, exports, reports and dashboards display consistent totals.
- Support Audit, investigation, Support and financial-integrity verification.

This document applies to every Nexio component that creates, modifies, aggregates, presents, imports, exports, synchronizes or reconciles monetary values.

---

# Constitutional Principle

Every monetary value presented by Nexio must be reproducible from canonical financial records and approved calculation rules.

A financial result must answer:

```text
Which canonical Resources contributed to the value?

Which monetary amounts were included?

Which amounts were excluded?

Which Account and Owner were affected?

Which Transaction states were considered?

Which currency was used?

Which decimal precision applied?

Which rounding policy applied?

Which calculation-policy version was used?

Which time zone and date boundaries applied?

Which Transfer treatment applied?

Which adjustment or reversal applied?

Which reconciliation state applied?

Which final result was produced?

Can the result be independently recalculated?
```

No financial value may depend on:

- Binary floating-point arithmetic.
- Client-only calculations as the authority.
- Unregistered rounding behavior.
- Untrusted display-formatted strings.
- Duplicate offline operations.
- Hidden database corrections.
- Mutable historical calculation rules.
- Undocumented currency conversions.
- Unreconciled state changes presented as verified balances.
- Aggregations that cannot identify their contributing records.

---

# Financial Integrity Objectives

The Nexio Financial architecture shall provide:

```text
Exact Monetary Representation

Deterministic Calculation

Stable Balance Semantics

Transfer Atomicity

Owner Isolation

Historical Reconstruction

Versioned Policies

Explicit Rounding

Currency Safety

Idempotent Mutation

Reconciliation

Correction Traceability

Cross-Platform Consistency

Auditability
```

---

# Exact Monetary Representation

Monetary values must use exact decimal or integer-minor-unit representations.

Approved internal representations may include:

```text
Fixed-precision decimal

Integer minor units

Currency-aware Money type
```

Binary floating-point values such as IEEE 754 `float` or `double` must not be used as the authoritative representation of financial amounts.

---

# Deterministic Calculation

Given the same:

```text
Financial Resources

Calculation-policy version

Currency rules

Date range

Time zone

Transaction states

Reconciliation filters
```

Nexio must produce the same result across:

- Backend.
- Database.
- Android.
- Web.
- Reports.
- Exports.
- Background jobs.
- Recalculation processes.

Client applications may calculate provisional display values.

The backend remains authoritative for persisted financial state.

---

# Stable Balance Semantics

Every balance label must have one stable meaning.

Examples include:

```text
Current Balance

Available Balance

Pending Balance

Projected Balance

Reconciled Balance

Opening Balance

Closing Balance
```

The same label must not represent different formulas on different screens or platforms.

---

# Transfer Atomicity

A Transfer represents one logical financial operation with two related Account effects.

A successful Transfer must not exist as:

```text
Debit without Credit

or

Credit without Debit
```

unless the Transfer explicitly remains in a non-final state and is excluded from final balances according to policy.

---

# Owner Isolation

Financial calculations must use only Resources authorized for the canonical Owner and Account scope.

A calculation must never include:

- Another Owner's Transaction.
- Another Owner's Account.
- Another Owner's Transfer side.
- Cached values from another Owner.
- Another Owner's imported data.
- Another Owner's reconciliation state.

Cross-Owner financial aggregation is a Critical Security, Privacy and Financial Integrity failure.

---

# Historical Reconstruction

Nexio must be able to reconstruct a balance for a historical point in time using:

- Opening state.
- Financial Events effective before or at the point.
- Approved Transaction states.
- Reversals.
- Adjustments.
- Transfer effects.
- Calculation-policy version.
- Currency policy.
- Time-zone boundaries.

The current mutable Resource state alone must not be the only source for historical reconstruction.

---

# Versioned Financial Policies

Material financial behavior must reference a versioned policy.

Examples include:

```text
Amount precision policy

Rounding policy

Balance inclusion policy

Transfer policy

Reconciliation policy

Budget allocation policy

Goal contribution policy

Cash-flow policy

Recurring-Transaction policy

Currency-conversion policy
```

Historical results must remain reproducible using the policy version active for the relevant operation or reporting period.

---

# Explicit Rounding

Every rounding operation must define:

- Input value.
- Precision.
- Rounding mode.
- Currency.
- Calculation stage.
- Policy version.
- Result.

Rounding must not occur implicitly through display formatting when the rounded value affects stored financial state.

---

# Currency Safety

Every monetary amount must identify its currency.

An amount without a currency must not be combined with other monetary values unless the applicable Resource contract defines one canonical currency.

---

# Idempotent Financial Mutation

Retries must not create duplicate:

- Transactions.
- Transfer sides.
- Adjustments.
- Goal contributions.
- Budget mutations.
- Recurring-Transaction instances.
- Reconciliation entries.
- Import rows.

Every material financial mutation must use stable operation identity.

---

# Reconciliation

Reconciliation establishes whether Nexio records correspond to an approved external or authoritative financial reference.

Reconciliation must distinguish:

```text
Matched

Partially Matched

Unmatched

Duplicated

Excluded

Disputed

Corrected

Reconciled
```

A visually similar Transaction is not automatically a reconciled Transaction.

---

# Correction Traceability

Financial corrections must not silently rewrite history.

Corrections should create:

- A new Resource version.
- An adjustment.
- A reversal.
- A correction Event.
- A relationship to the original record.
- An explanation.
- Audit Evidence.

---

# Cross-Platform Consistency

Android, Web, APIs, reports and exports must use the same canonical financial definitions.

Differences caused only by:

- Local formatting.
- Screen size.
- Theme.
- Chart presentation.
- Number abbreviation.

must not alter the underlying value.

---

# Scope

This specification governs:

- Money representation.
- Currency representation.
- Decimal precision.
- Rounding.
- Transactions.
- Income.
- Expenses.
- Transfers.
- Adjustments.
- Reversals.
- Deletions.
- Restorations.
- Recurring Transactions.
- Account balances.
- Available balances.
- Pending balances.
- Projected balances.
- Historical balances.
- Cash flow.
- Budgets.
- Goals.
- Financial summaries.
- Category totals.
- Period totals.
- Imports.
- Exports.
- Reconciliation.
- Financial snapshots.
- Offline mutations.
- Synchronization.
- Financial corrections.
- Financial Audit Evidence.
- Financial reports.
- Dashboard totals.
- Analytics values.

---

# Out of Scope

This specification does not independently define:

- Authentication.
- Authorization.
- Account ownership.
- Tax calculation.
- Investment valuation.
- Bank payment execution.
- Legal accounting standards.
- Foreign-exchange provider selection.
- Credit-risk models.
- Financial advice.
- Banking regulation compliance.

When these capabilities are introduced, they must integrate with this specification.

---

# Financial Domains

Nexio financial behavior is organized into:

```text
Money

Currency

Transaction

Transfer

Account

Balance

Cash Flow

Budget

Goal

Recurring Transaction

Import

Export

Reconciliation

Adjustment

Projection

Reporting

Financial Audit
```

---

# Money Domain

The Money domain defines:

- Amount representation.
- Currency.
- Precision.
- Scale.
- Sign.
- Comparison.
- Addition.
- Subtraction.
- Multiplication.
- Division.
- Allocation.
- Rounding.
- Serialization.
- Validation.
- Formatting.

---

# Currency Domain

The Currency domain defines:

- Currency code.
- Minor-unit precision.
- Formatting.
- Conversion eligibility.
- Exchange-rate source.
- Rate timestamp.
- Rate version.
- Conversion rounding.
- Unsupported currency behavior.

---

# Transaction Domain

The Transaction domain defines:

- Income.
- Expense.
- Initial balance.
- Adjustment.
- Refund.
- Reversal.
- Transfer side.
- Transaction state.
- Effective date.
- Posted date.
- Amount.
- Currency.
- Account.
- Category.
- Reconciliation state.

---

# Transfer Domain

The Transfer domain defines:

- Source Account.
- Destination Account.
- Debit side.
- Credit side.
- Transfer amount.
- Fees.
- Currency compatibility.
- Atomicity.
- Status.
- Failure.
- Reversal.
- Reconciliation.

---

# Account Domain

The Account domain defines:

- Account currency.
- Opening balance.
- Current balance.
- Available balance.
- Pending balance.
- Reconciled balance.
- Archived Account behavior.
- Closed Account behavior.
- Balance recalculation.
- Historical snapshots.

---

# Balance Domain

The Balance domain defines the formulas and inclusion rules for every balance type.

---

# Cash Flow Domain

The Cash Flow domain defines:

- Inflows.
- Outflows.
- Net cash flow.
- Opening balance.
- Closing balance.
- Period boundaries.
- Comparison periods.
- Scheduled projections.
- Transfer treatment.

---

# Budget Domain

The Budget domain defines:

- Budget amount.
- Consumed amount.
- Remaining amount.
- Percentage used.
- Period.
- Categories.
- Included Transaction states.
- Transfer exclusions.
- Adjustments.
- Overspending.

---

# Goal Domain

The Goal domain defines:

- Target amount.
- Contributions.
- Withdrawals.
- Current saved amount.
- Remaining amount.
- Progress percentage.
- Completion state.
- Adjustment reason.
- Goal history.

---

# Recurring Transaction Domain

The Recurring Transaction domain defines:

- Template.
- Schedule.
- Instance generation.
- Duplicate prevention.
- Skipped occurrences.
- Adjusted occurrences.
- Projected values.
- Posted values.
- Cancellation.
- End conditions.

---

# Import Domain

The Import domain defines:

- Source amount parsing.
- Currency parsing.
- Decimal separator.
- Date parsing.
- Duplicate detection.
- Preview totals.
- Accepted totals.
- Rejected totals.
- Imported Transaction identity.
- Reconciliation candidates.

---

# Export Domain

The Export domain defines:

- Exported amount precision.
- Currency representation.
- Date boundaries.
- Balance definitions.
- Financial totals.
- Calculation-policy references.
- Reproducibility.

---

# Reconciliation Domain

The Reconciliation domain defines:

- Statement or reference source.
- Reconciliation period.
- Opening reference balance.
- Closing reference balance.
- Matched Transactions.
- Unmatched Transactions.
- Adjustments.
- Difference.
- Completion.
- Reopening.
- Audit history.

---

# Adjustment Domain

The Adjustment domain defines controlled correction of financial state.

Adjustments must include:

- Amount.
- Currency.
- Account.
- Direction.
- Reason.
- Actor.
- Effective date.
- Approval where required.
- Relationship to reconciliation or correction.
- Audit Evidence.

---

# Projection Domain

The Projection domain defines values not yet confirmed as posted financial state.

Examples:

- Scheduled Transactions.
- Recurring Transaction forecasts.
- Expected income.
- Expected expense.
- Goal forecasts.
- Cash-flow forecasts.

Projected values must never be presented as posted balances.

---

# Reporting Domain

The Reporting domain defines financial aggregation for:

- Dashboards.
- Reports.
- Charts.
- Period summaries.
- Category summaries.
- Exported reports.
- Support views.
- Financial investigations.

---

# Financial Audit Domain

The Financial Audit domain defines Evidence required to prove:

- Value creation.
- Value modification.
- Value deletion.
- Balance change.
- Transfer completion.
- Reconciliation.
- Correction.
- Import.
- Export.
- Policy version.
- Calculation version.

---

# Core Financial Principles

The Nexio Financial architecture is governed by:

```text
Exactness

Determinism

Single Semantic Meaning

Atomicity

Idempotency

Versioning

Traceability

Reconstructability

Explicit State

Explicit Currency

Explicit Time

Owner Isolation

Controlled Correction
```

---

# Exactness

Financial calculations must preserve exact decimal meaning.

Example:

```text
R$ 0,10 + R$ 0,20 = R$ 0,30
```

This result must not become:

```text
R$ 0,30000000000000004
```

at any authoritative layer.

---

# Determinism

Financial calculations must not depend on:

- Iteration order where order should not matter.
- Locale-specific parsing without explicit locale.
- Database engine implicit rounding.
- Platform-specific floating-point behavior.
- Non-versioned exchange rates.
- Unstable date boundaries.
- Client clock.
- Random assignment.
- Mutable historical policy.

---

# Single Semantic Meaning

Every financial field must have one documented meaning.

Examples:

```text
amount

originalAmount

convertedAmount

feeAmount

netAmount

openingBalance

closingBalance

availableBalance

pendingAmount
```

The same field must not switch meaning based on interface context.

---

# Atomicity

A financial operation that requires multiple state changes must either:

```text
Complete all required changes

or

Complete none of them
```

Where full database atomicity is not possible across external systems, Nexio must use explicit intermediate states, reconciliation and compensation.

---

# Idempotency

The same logical operation must not alter financial state more than once.

Idempotency applies to:

- API Retries.
- Offline synchronization.
- Queue redelivery.
- Background-job Retry.
- Provider callback replay.
- Import Retry.
- Reconciliation completion Retry.
- Transfer Retry.

---

# Versioning

Financial Resources should use Resource versions or equivalent concurrency controls.

A stale mutation must not overwrite a newer financial state silently.

---

# Traceability

Every balance-affecting record must identify:

- Account.
- Owner.
- Operation.
- Event type.
- Effective date.
- Amount.
- Currency.
- State.
- Resource version.
- Creation time.
- Modification time.
- Actor.
- Audit reference.

---

# Reconstructability

Nexio must be able to reconstruct:

```text
Account balance

Period income

Period expense

Cash flow

Budget consumption

Goal progress

Reconciliation difference

Transfer state
```

from canonical records and versioned policies.

---

# Explicit State

Financial records must use controlled states.

A null or missing state must not be interpreted differently across components.

---

# Explicit Currency

Every Money value must use a valid currency code.

Recommended standard:

```text
ISO 4217 currency code
```

Examples:

```text
BRL

USD

EUR
```

---

# Explicit Time

Financial calculations must define:

- Effective date.
- Posted date.
- Created time.
- Updated time.
- Time zone.
- Period start.
- Period end.
- Inclusion boundary.

---

# Controlled Correction

A correction must preserve:

- Original value.
- Corrected value.
- Reason.
- Actor.
- Time.
- Relationship.
- Financial effect.
- Audit Evidence.

---

# Canonical Money Model

The recommended canonical Money model is:

```text
Money
 ├── amount
 ├── currency
 ├── precision
 └── roundingPolicyReference
```

A serialized Money value should use a decimal string or integer minor units.

---

# Decimal String Representation

Example:

```json
{
  "amount": "1250.45",
  "currency": "BRL"
}
```

The value must not be serialized as an imprecise binary floating-point number.

---

# Integer Minor-Unit Representation

Alternative example:

```json
{
  "minorUnits": 125045,
  "currency": "BRL",
  "minorUnitScale": 2
}
```

This represents:

```text
R$ 1.250,45
```

---

# Money Type Authority

All backend financial operations should use a shared Money type or shared financial library.

Individual services must not independently invent:

- Parsing rules.
- Rounding rules.
- Comparison rules.
- Allocation rules.
- Serialization rules.

---

# Amount Sign

Nexio should prefer positive canonical Transaction amounts combined with explicit Transaction direction or type.

Example:

```text
type = Expense

amount = R$ 120,00
```

rather than relying only on:

```text
amount = -R$ 120,00
```

The internal balance Event may still use signed deltas.

The selected model must remain consistent.

---

# Signed Financial Delta

A signed delta represents Account impact.

Examples:

```text
Income:
+R$ 500,00

Expense:
-R$ 120,00

Transfer source:
-R$ 200,00

Transfer destination:
+R$ 200,00
```

Signed deltas should be derived from canonical Transaction semantics.

---

# Zero Amount

Zero-value financial records should be restricted.

Potential valid uses include:

- Reconciliation marker.
- Imported informational record.
- Migration placeholder.
- Correction relationship.

Ordinary income, expense or Transfer records should generally require an amount greater than zero.

---

# Negative Input

Negative user input must not silently invert the Transaction type.

Example:

```text
Expense amount entered as -R$ 50,00
```

The system should reject or explicitly normalize according to a documented rule.

---

# Maximum Amount

Every monetary field must define a maximum supported amount.

The maximum must consider:

- Database precision.
- API serialization.
- Client parsing.
- Aggregation overflow.
- Export formatting.
- Chart scaling.
- Abuse prevention.

---

# Monetary Overflow

Overflow must:

- Stop the calculation.
- Return a controlled error.
- Preserve the original records.
- Avoid truncated or wrapped values.
- Generate an operational alert where material.

---

# Decimal Precision

Every monetary amount must define supported precision.

For BRL, ordinary stored Product amounts typically use:

```text
2 decimal places
```

Example:

```text
R$ 125,49
```

Higher precision may be required for:

- Exchange rates.
- Percentage calculations.
- Allocation intermediates.
- Interest calculations.
- Analytics comparisons.

Higher-precision intermediate values must be rounded only at the defined calculation stage.

---

# Currency Minor Units

Currency metadata should define:

```text
currencyCode

displayName

minorUnitScale

symbol

formattingLocale

status
```

---

# BRL Precision

For BRL:

```text
currencyCode = BRL

minorUnitScale = 2
```

Examples:

```text
R$ 10,00

R$ 10,50

R$ 10,99
```

---

# Internal Calculation Precision

Intermediate calculation precision may exceed display precision.

Example:

```text
Allocation calculation:
R$ 100,00 ÷ 3 = R$ 33,333333...
```

The final stored allocations must follow the approved Allocation and Rounding policy.

---

# Rounding Architecture

Rounding must be explicit and versioned.

Recommended rounding modes may include:

```text
Half Up

Half Even

Down

Up

Floor

Ceiling
```

Only approved modes may be used.

---

# Default Monetary Rounding

Unless a specific financial policy requires otherwise, ordinary Owner-entered BRL amounts should be validated at two decimal places rather than rounded from arbitrary additional precision.

Example:

```text
Entered:
R$ 10,999

Preferred behavior:
Reject and request correction
```

rather than silently saving:

```text
R$ 11,00
```

---

# Half-Up Rounding

Conceptual examples:

```text
R$ 10,994 → R$ 10,99

R$ 10,995 → R$ 11,00
```

when rounding to two decimal places with Half Up.

---

# Half-Even Rounding

Half Even may be used for specific regulated or statistical calculations.

Its use must be explicitly documented.

It must not be introduced implicitly by a programming language or database default.

---

# Rounding Stage

Possible rounding stages include:

```text
Input Validation

Per-Item Calculation

Allocation

Subtotal

Tax or Fee

Currency Conversion

Final Total

Display Only
```

The policy must specify where rounding occurs.

---

# Double Rounding

Double rounding should be avoided.

Example:

```text
High-precision value

↓

Rounded intermediate value

↓

Rounded final value
```

may produce a different result from rounding only at the approved final stage.

---

# Display Rounding

Display formatting may round visually.

Display rounding must not alter the stored authoritative amount.

Example:

```text
Stored exchange rate:
5.123456

Displayed:
5.1235
```

The stored rate remains unchanged.

---

# Allocation Rounding

When dividing a total into parts, the sum of allocated amounts must equal the original total.

Example:

```text
R$ 100,00 divided into 3 equal parts
```

A valid allocation may be:

```text
R$ 33,34

R$ 33,33

R$ 33,33
```

Total:

```text
R$ 100,00
```

---

# Remainder Distribution

Rounding remainders must be distributed deterministically.

Potential rules include:

```text
Largest remainder first

Stable item order

Explicit priority

Earliest due date

Lowest stable identifier
```

The selected rule must be versioned.

---

# Percentage Calculation

Percentage calculations should use high-precision intermediates.

Example:

```text
Budget:
R$ 1.000,00

Spent:
R$ 333,33

Usage:
33,333%
```

The interface may display:

```text
33,33%
```

while preserving the exact approved intermediate calculation.

---

# Percentage Boundaries

Percentage fields must define behavior for:

- Zero denominator.
- Negative denominator.
- Values above 100%.
- Values below 0%.
- Infinite or undefined results.

---

# Zero-Denominator Percentage

Example:

```text
Goal target:
R$ 0,00
```

Progress percentage must not divide by zero.

The result should be an explicit state such as:

```text
NotApplicable

or

Undefined
```

according to Product semantics.

---

# Currency Model

Every Account must identify its canonical currency.

Every Transaction must either:

- Use the Account currency.
- Or use an approved multi-currency model.

---

# Single-Currency Account

For a single-currency Account:

```text
Account currency = BRL

Transaction currency = BRL
```

A Transaction in another currency must be rejected or explicitly converted through an approved conversion workflow.

---

# Multi-Currency Transaction

A multi-currency Transaction may include:

```text
originalAmount

originalCurrency

exchangeRate

exchangeRateSource

exchangeRateTimestamp

convertedAmount

accountCurrency

conversionPolicyVersion
```

---

# Exchange Rate Precision

Exchange rates may require higher precision than monetary amounts.

Example:

```text
1 USD = 5.123456 BRL
```

The rate must not be rounded to Account currency precision before multiplication.

---

# Exchange Rate Authority

Exchange-rate data must identify:

- Provider.
- Rate type.
- Source currency.
- Target currency.
- Timestamp.
- Rate.
- Rate version.
- Verification result.

---

# Exchange Rate Types

Potential types include:

```text
Spot

Daily Reference

Manual

Provider Settlement

Historical

User Confirmed
```

---

# Manual Exchange Rate

A manually entered rate must identify:

- Actor.
- Purpose.
- Source and target currency.
- Effective date.
- Rate.
- Approval where required.
- Audit Evidence.

---

# Currency Conversion Formula

Conceptually:

```text
convertedAmount =
originalAmount × exchangeRate
```

The result must follow the approved conversion-rounding policy.

---

# Inverse Exchange Rate

Nexio should not assume that an inverse rate provided through division produces the same commercial result as a provider's direct rate.

The source and direction of the rate must remain explicit.

---

# Currency Conversion Difference

A conversion difference may result from:

- Rate movement.
- Provider spread.
- Fees.
- Rounding.
- Settlement rate.
- Manual correction.

Differences must not be hidden inside the Transaction amount without explanation.

---

# Transaction Model

A canonical Transaction should include:

```text
Transaction
 ├── transactionId
 ├── ownerId
 ├── accountId
 ├── transactionType
 ├── direction
 ├── amount
 ├── currency
 ├── effectiveDate
 ├── postedAt
 ├── state
 ├── categoryId
 ├── description
 ├── resourceVersion
 ├── operationId
 ├── reconciliationState
 ├── calculationPolicyVersion
 ├── createdAt
 ├── updatedAt
 └── auditReference
```

---

# Transaction Identifier

Recommended format:

```text
txn_<sortable-unique-identifier>
```

The identifier must never be reused.

---

# Transaction Types

Recommended canonical types include:

```text
Income

Expense

TransferDebit

TransferCredit

OpeningBalance

AdjustmentCredit

AdjustmentDebit

Refund

Reversal
```

---

# Income Transaction

An Income Transaction increases the Account balance.

Canonical signed delta:

```text
+amount
```

---

# Expense Transaction

An Expense Transaction decreases the Account balance.

Canonical signed delta:

```text
-amount
```

---

# Transfer-Debit Transaction

A Transfer Debit decreases the source Account.

It must reference the canonical Transfer.

---

# Transfer-Credit Transaction

A Transfer Credit increases the destination Account.

It must reference the same canonical Transfer.

---

# Opening-Balance Transaction

An Opening Balance establishes or migrates the Account's starting financial state.

It should be created only through an approved Account creation, import or migration workflow.

---

# Adjustment-Credit Transaction

An Adjustment Credit increases balance to correct or reconcile state.

It requires a reason and may require approval.

---

# Adjustment-Debit Transaction

An Adjustment Debit decreases balance to correct or reconcile state.

It requires a reason and may require approval.

---

# Refund Transaction

A Refund reverses or compensates for part or all of a prior Expense.

It should reference the original Transaction where known.

---

# Reversal Transaction

A Reversal neutralizes the financial effect of a prior Transaction.

It must reference the original Transaction.

---

# Transaction States

Recommended states include:

```text
Draft

Scheduled

Pending

Posted

Reconciled

Disputed

Reversed

Cancelled

Deleted
```

---

# Draft Transaction

A Draft has not been committed as financial state.

Draft Transactions must not affect authoritative balances.

---

# Scheduled Transaction

A Scheduled Transaction represents an expected future Event.

Scheduled Transactions may affect projected balances.

They must not affect posted balances.

---

# Pending Transaction

A Pending Transaction represents an initiated or expected financial Event not yet finalized.

Its inclusion in Available or Pending Balance must follow explicit policy.

---

# Posted Transaction

A Posted Transaction is committed financial state.

Posted Transactions affect Current Balance.

---

# Reconciled Transaction

A Reconciled Transaction is a Posted Transaction matched or accepted within a completed reconciliation.

It affects Current Balance and Reconciled Balance according to policy.

---

# Disputed Transaction

A Disputed Transaction remains financially posted unless an approved correction or reversal changes its financial effect.

Dispute state alone must not silently remove the Transaction from balance.

---

# Reversed Transaction

A Reversed Transaction has been neutralized through a linked Reversal.

Historical reports should preserve both the original and reversal effects.

---

# Cancelled Transaction

A Cancelled Transaction has no posted financial effect.

If the Transaction was previously Posted, cancellation alone is insufficient.

A reversal or correction is required.

---

# Deleted Transaction

Deletion behavior must be explicit.

Recommended policy:

```text
Draft, Scheduled or Pending Transactions:
May be soft-deleted without a financial reversal if no posted effect exists.

Posted or Reconciled Transactions:
Require reversal or controlled correction rather than silent financial deletion.
```

---

# Transaction Effective Date

`effectiveDate` represents the financial date used for period calculations.

It may differ from:

- Created date.
- Posted timestamp.
- Imported timestamp.
- Provider timestamp.

---

# Transaction Posted Time

`postedAt` represents when the Transaction became Posted financial state.

---

# Created Time

`createdAt` records when Nexio created the Resource.

It must not automatically determine the financial period.

---

# Backdated Transaction

A Transaction may have an effective date before its creation date.

Backdated Transactions must:

- Use a valid allowed period.
- Trigger recalculation of affected summaries.
- Be included in future reconciliation.
- Preserve creation and effective dates separately.
- Generate Audit Evidence.

---

# Future-Dated Transaction

A future-dated Transaction should normally be:

```text
Scheduled

or

Pending
```

It must not affect posted Current Balance before the applicable policy allows it.

---

# Transaction Direction

Direction should use a controlled value:

```text
Credit

Debit

Neutral
```

Neutral may apply only to non-balance-affecting financial records.

---

# Transaction Amount

A Transaction amount must:

- Be greater than zero for ordinary financial types.
- Match supported precision.
- Identify currency.
- Fit the supported maximum.
- Be immutable through silent normalization.
- Use exact decimal representation.

---

# Transaction Currency Validation

For a single-currency Account:

```text
transaction.currency must equal account.currency
```

unless an approved conversion record exists.

---

# Transaction Category

Category classification must not change the Transaction's financial direction unless an explicit Product operation changes the Transaction type.

Changing:

```text
Food → Transport
```

must not change the amount or debit effect.

---

# Transaction Description

Description is informational.

It must not be parsed as authoritative financial data.

---

# Transaction Resource Version

Every material update should increment `resourceVersion`.

A stale client update must be rejected with a controlled version-conflict result.

---

# Transaction Mutation

A mutation should identify:

```text
transactionId

expectedResourceVersion

operationId

changedFields

reason

Actor

Owner

effectiveAt
```

---

# Transaction Update Rules

Updates may affect:

- Amount.
- Effective date.
- Category.
- Description.
- Account.
- State.
- Reconciliation relationship.

Each field must define whether update is allowed for each Transaction state.

---

# Posted Amount Change

Changing the amount of a Posted Transaction is financially material.

Recommended approaches include:

```text
Create a new Resource version with explicit financial delta

or

Reverse the original Transaction and create a corrected Transaction
```

The selected approach must preserve reconstructability.

---

# Reconciled Transaction Update

A Reconciled Transaction should not be freely edited.

Potential behavior:

- Reopen reconciliation.
- Remove match.
- Create correction.
- Require reason.
- Recalculate reconciliation difference.
- Generate Audit Evidence.

---

# Account Change

Moving a Posted Transaction from one Account to another affects two Account balances.

The operation must be atomic or represented as a controlled correction with both effects.

---

# Transaction Deletion

Deletion must never create an unexplained balance change.

For a Posted Transaction, deletion should generally create:

```text
Original Transaction

+

Reversal or Adjustment

+

Deletion or archival marker
```

---

# Transaction Restoration

Restoring a deleted Draft may restore the Resource.

Restoring a financially reversed Posted Transaction requires a new financial operation.

The previous financial effect must not reappear automatically without authorization.

---

# Transfer Model

A canonical Transfer should include:

```text
Transfer
 ├── transferId
 ├── ownerId
 ├── sourceAccountId
 ├── destinationAccountId
 ├── sourceAmount
 ├── destinationAmount
 ├── sourceCurrency
 ├── destinationCurrency
 ├── exchangeRate
 ├── feeAmount
 ├── state
 ├── debitTransactionId
 ├── creditTransactionId
 ├── operationId
 ├── resourceVersion
 ├── effectiveDate
 ├── createdAt
 └── auditReference
```

---

# Transfer Identifier

Recommended format:

```text
trf_<sortable-unique-identifier>
```

---

# Same-Currency Transfer

For a same-currency Transfer without fees:

```text
sourceAmount = destinationAmount
```

Example:

```text
Source:
-R$ 200,00

Destination:
+R$ 200,00
```

---

# Transfer Fee

A fee should be represented explicitly.

Example:

```text
Transfer amount:
R$ 200,00

Fee:
R$ 5,00

Source Account impact:
-R$ 205,00

Destination Account impact:
+R$ 200,00
```

The fee may be represented as:

- A separate Expense Transaction.
- A defined Transfer fee component.
- A provider settlement component.

The selected model must remain reconstructable.

---

# Cross-Currency Transfer

A cross-currency Transfer must define:

```text
Source amount

Source currency

Destination amount

Destination currency

Exchange rate

Rate source

Rate timestamp

Conversion policy

Fee

Rounding
```

---

# Transfer States

Recommended states:

```text
Draft

Pending

Posted

PartiallyCompleted

Failed

Cancelled

Reversed

Reconciled
```

---

# Transfer Draft

No balance effect exists.

---

# Transfer Pending

The Transfer has not reached final posted state.

Pending balance behavior must be explicit.

---

# Transfer Posted

Both required Account effects completed successfully.

---

# Transfer Partially Completed

One or more required effects completed while others did not.

This state is exceptional and requires:

- Automatic compensation or reconciliation.
- Operational alert.
- Financial Incident review where material.
- Owner-safe status.
- No representation as completed.

---

# Transfer Failed

No successful final Transfer should be inferred.

Any partial financial effects must be compensated or explicitly represented.

---

# Transfer Cancelled

A non-posted Transfer may be cancelled.

A Posted Transfer requires reversal.

---

# Transfer Reversed

Both original Account effects must be neutralized according to policy.

---

# Transfer Reconciled

The Transfer sides are Posted and matched with the applicable reference records.

---

# Transfer Atomic Operation

For Accounts within the same transactional database, the recommended sequence is:

```text
Validate source and destination Accounts.

↓

Authenticate and Authorize Actor.

↓

Validate Owner scope.

↓

Validate currencies.

↓

Create Transfer.

↓

Create source debit.

↓

Create destination credit.

↓

Commit all records atomically.

↓

Create Audit outbox records.

↓

Return Posted result.
```

---

# Transfer Idempotency

A Transfer must use:

```text
operationId

idempotencyKeyReference
```

A Retry must return the existing operation result rather than creating another Transfer.

---

# Transfer Duplicate Detection

Potential duplicate signals include:

- Same operationId.
- Same idempotency key.
- Same source and destination Accounts.
- Same amount.
- Same effective date.
- Same Actor.
- Same client-generated intent reference.
- Narrow time proximity.

Similarity alone must not automatically delete legitimate repeated Transfers.

---

# Transfer Reversal

A Transfer reversal must create coordinated reverse effects.

Example:

```text
Original:
Source -R$ 200,00
Destination +R$ 200,00

Reversal:
Source +R$ 200,00
Destination -R$ 200,00
```

Fees may require separate treatment.

---

# Account Model

A financial Account should include:

```text
Account
 ├── accountId
 ├── ownerId
 ├── name
 ├── accountType
 ├── currency
 ├── openingBalance
 ├── openingBalanceDate
 ├── state
 ├── balancePolicyVersion
 ├── resourceVersion
 ├── createdAt
 └── archivedAt
```

---

# Account Types

Potential Account types include:

```text
Checking

Savings

Cash

Credit

Investment

DigitalWallet

Other
```

Each Account type may require distinct balance semantics.

Only implemented and tested semantics may be activated.

---

# Account Currency

The Account currency is immutable after financial activity begins unless an explicit currency-migration workflow exists.

Changing the Account currency label must not reinterpret historical amounts.

---

# Opening Balance

Opening Balance represents the Account's starting financial state.

It must identify:

- Amount.
- Currency.
- Effective date.
- Source.
- Actor.
- Operation.
- Audit Evidence.

---

# Opening Balance Update

Changing an opening balance after later Transactions exist is financially material.

Recommended behavior:

- Create an adjustment.
- Recalculate historical balances.
- Preserve previous opening balance.
- Require reason.
- Mark affected reconciliation periods.
- Generate Audit Evidence.

---

# Account States

Recommended states:

```text
Active

ReadOnly

Archived

Closed

UnderReconciliation

MigrationPending
```

---

# Active Account

Permits authorized financial operations.

---

# Read-Only Account

Allows approved reads but blocks new mutations.

---

# Archived Account

Remains available for historical reporting according to Product policy.

Archived Accounts should not accept ordinary new Transactions.

---

# Closed Account

Represents a completed Account lifecycle.

Closure must define:

- Final balance.
- Pending Transaction treatment.
- Reconciliation state.
- Export behavior.
- Retention.
- Restoration policy.

---

# Under-Reconciliation Account

The Account has an active reconciliation period.

Transaction-edit restrictions may apply.

---

# Migration-Pending Account

The Account is undergoing a controlled data or calculation migration.

Mutation behavior must be explicit.

---

# Balance Architecture

Nexio must define every balance through a formal formula.

Recommended balance types include:

```text
Opening Balance

Posted Current Balance

Available Balance

Pending Balance

Projected Balance

Reconciled Balance

Period Opening Balance

Period Closing Balance
```

---

# Posted Current Balance

Recommended conceptual formula:

```text
Posted Current Balance
=
Opening Balance

+

Posted Credit Deltas

-

Posted Debit Deltas

+

Posted Adjustments

+

Posted Reversals
```

The exact implementation should use signed deltas.

---

# Signed-Delta Balance Formula

```text
Current Balance
=
Opening Balance
+
Σ posted signed financial deltas
```

where:

```text
Income = positive delta

Expense = negative delta

Transfer Credit = positive delta

Transfer Debit = negative delta

Adjustment Credit = positive delta

Adjustment Debit = negative delta

Reversal = opposite of original effect
```

---

# Pending Balance

Pending Balance may represent the sum of pending effects.

Example:

```text
Pending Balance Impact
=
Σ pending signed financial deltas
```

The Product must state whether this value is displayed independently or incorporated into Available Balance.

---

# Available Balance

Potential formula:

```text
Available Balance
=
Posted Current Balance
+
Approved Pending Credits
+
Approved Pending Debits
```

Because pending debits are negative, they reduce availability.

The exact inclusion policy must be versioned.

---

# Projected Balance

Potential formula:

```text
Projected Balance
=
Posted Current Balance
+
Approved Pending Effects
+
Scheduled Future Effects
```

Projected Balance must identify the projection horizon.

---

# Reconciled Balance

Potential formula:

```text
Reconciled Balance
=
Opening Reconciled Balance
+
Σ reconciled signed financial deltas
```

The exact relationship with statement balances must follow the reconciliation policy.

---

# Period Opening Balance

The Period Opening Balance is the Account balance immediately before the period begins.

For a period:

```text
[start, end)
```

the opening balance is calculated using financial effects before `start`.

---

# Period Closing Balance

The Period Closing Balance is:

```text
Period Opening Balance
+
Period Net Posted Financial Delta
```

for the approved period boundary.

---

# Period Boundary

Recommended period semantics:

```text
Start inclusive

End exclusive
```

Example:

```text
July 2026

Start:
2026-07-01T00:00:00 in Account reporting time zone

End:
2026-08-01T00:00:00 in Account reporting time zone
```

---

# Reporting Time Zone

Every financial period must use a defined reporting time zone.

Potential choices include:

- Owner-selected time zone.
- Account-specific time zone.
- Canonical Product time zone.
- Provider statement time zone.

The selected value must remain explicit.

---

# Time-Zone Change

Changing the Owner time zone must not silently change historical Transaction effective dates.

It may change:

- Displayed timestamps.
- Future period boundaries.
- Scheduled execution times.

Historical reporting behavior requires a defined policy.

---

# Current Balance Inclusion Policy

Current Balance should generally include:

```text
Opening Balance

Posted Income

Posted Expense

Posted Transfer sides

Posted Adjustments

Posted Refunds

Posted Reversals
```

It should generally exclude:

```text
Draft

Scheduled

Cancelled

Deleted without financial effect

Failed

Unposted Pending
```

---

# Reversed Transaction Treatment

A reversed Transaction may remain in historical calculations together with its reversing Event.

The net current effect becomes zero where the full amount is reversed.

Example:

```text
Original Expense:
-R$ 80,00

Reversal:
+R$ 80,00

Net:
R$ 0,00
```

---

# Partial Refund

Example:

```text
Original Expense:
-R$ 100,00

Refund:
+R$ 30,00

Net:
-R$ 70,00
```

The Refund must reference the original Expense where known.

---

# Deleted Posted Transaction Treatment

A Posted Transaction must not simply disappear from historical calculations.

Its financial effect must be neutralized through a Reversal or approved adjustment.

---

# Archived Account Balance

Archiving an Account must not change its balance.

It changes availability and presentation, not historical financial state.

---

# Account Closure Balance

Account closure should record:

```text
Closing balance

Closing date

Pending Transaction treatment

Reconciliation state

Actor

Operation

Audit reference
```

---

# Balance Snapshot

A Balance Snapshot may improve performance.

Recommended structure:

```text
BalanceSnapshot
 ├── balanceSnapshotId
 ├── ownerId
 ├── accountId
 ├── balanceType
 ├── amount
 ├── currency
 ├── asOf
 ├── lastIncludedEventId
 ├── calculationPolicyVersion
 ├── sourceVersion
 ├── integrityHash
 └── createdAt
```

---

# Balance Snapshot Authority

A snapshot is a performance optimization and Evidence artifact.

It must remain reproducible from canonical financial Events.

The snapshot must not become an unexplained alternative financial authority.

---

# Snapshot Recalculation

A snapshot should be recalculated when:

- A backdated Transaction is created.
- A posted Transaction amount changes.
- A Transaction is reversed.
- An Account opening balance changes.
- A Transfer is corrected.
- A reconciliation creates an adjustment.
- A financial policy migration occurs.
- Integrity verification fails.

---

# Snapshot Invalidity

A snapshot is invalid when:

- It omits required Events.
- It includes another Owner.
- Its last Event reference is inconsistent.
- Its calculation-policy version is unsupported.
- Its integrity hash fails.
- A backdated mutation affects its period.
- Currency differs from the Account.

---

# Balance Cache

A balance cache may provide fast display values.

The cache key must include:

```text
ownerId

accountId

balanceType

currency

calculationPolicyVersion

financialDataVersion
```

---

# Cross-Owner Balance Cache

Caching one Owner's balance for another Owner is Critical.

The cache must not use only:

- Account display name.
- Screen route.
- Client installation.
- Generic dashboard key.

---

# Balance Recalculation

A recalculation operation should identify:

```text
recalculationId

ownerId

accountId

dateRange

reason

policyVersion

previousSnapshot

newSnapshot

difference

result

createdAt
```

---

# Balance Difference

A recalculation difference should be classified as:

```text
Expected

Correction

BackdatedMutation

PolicyMigration

SnapshotDefect

MissingEvent

DuplicateEvent

Unknown
```

---

# Unexplained Balance Difference

An unexplained difference requires:

- Preservation of current Evidence.
- Transaction inventory.
- Transfer verification.
- Duplicate detection.
- Snapshot verification.
- Policy verification.
- Reconciliation.
- Incident escalation where material.

---

# Initial Financial Acceptance Criteria

The initial Financial Calculations, Balances and Reconciliation architecture is accepted only when:

1. Monetary values use exact representation.

2. Binary floating-point values are not authoritative for money.

3. Every monetary amount identifies currency.

4. Every supported currency defines minor-unit precision.

5. BRL values use the approved two-decimal Product precision.

6. Higher-precision intermediates remain separate from stored monetary results.

7. Rounding policies are explicit.

8. Rounding modes are controlled.

9. Rounding stages are documented.

10. Display rounding does not alter stored values.

11. Allocation rounding preserves the original total.

12. Remainder distribution is deterministic.

13. Percentage calculations define zero-denominator behavior.

14. Monetary overflow is detected.

15. Monetary overflow does not truncate values silently.

16. Every Account identifies a currency.

17. Transaction currency matches Account currency unless approved conversion exists.

18. Currency conversions identify rate and source.

19. Currency conversions identify rate timestamp.

20. Currency conversions identify policy version.

21. Exchange rates use sufficient precision.

22. Every Transaction has a stable identifier.

23. Every Transaction identifies Owner and Account.

24. Every Transaction has an explicit type.

25. Every Transaction has an explicit direction.

26. Every Transaction has an exact amount.

27. Every Transaction identifies currency.

28. Every Transaction has an effective date.

29. Every Transaction has an explicit state.

30. Every posted Transaction affects balance through a signed delta.

31. Draft Transactions do not affect authoritative balance.

32. Scheduled Transactions do not affect posted Current Balance.

33. Pending Transaction treatment is explicitly defined.

34. Posted Transactions affect Current Balance.

35. Reconciled Transactions remain posted financial state.

36. Dispute state alone does not remove financial effect.

37. Reversed Transactions preserve original and reversal records.

38. Posted Transactions are not silently deleted.

39. Posted deletion requires reversal or controlled correction.

40. Transaction updates use Resource versions.

41. Stale Transaction updates are rejected.

42. Posted amount changes preserve financial history.

43. Moving a posted Transaction between Accounts updates both Accounts safely.

44. Reconciled Transaction edits require controlled behavior.

45. Every Transfer has a stable identifier.

46. Every Transfer identifies source and destination Accounts.

47. Every Transfer identifies Owner.

48. Transfer debit and credit sides share operation identity.

49. Same-currency Transfers preserve equal principal amounts.

50. Transfer fees are represented explicitly.

51. Cross-currency Transfers preserve source and destination values.

52. Cross-currency Transfers preserve rate and rounding policy.

53. Posted Transfers contain both required Account effects.

54. Partial Transfers are not presented as completed.

55. Transfer creation is atomic where supported.

56. Transfer Retries are idempotent.

57. Transfer duplicate detection exists.

58. Posted Transfers require coordinated reversal.

59. Every Account has a stable identifier.

60. Every Account identifies Owner.

61. Every Account identifies currency.

62. Opening Balance is explicit.

63. Opening Balance changes preserve history.

64. Account states are controlled.

65. Archiving an Account does not alter its balance.

66. Account closure records final financial state.

67. Every balance label has one stable meaning.

68. Current Balance has a formal formula.

69. Pending Balance has a formal formula.

70. Available Balance has a formal formula.

71. Projected Balance has a formal formula.

72. Reconciled Balance has a formal formula.

73. Period Opening Balance has a formal formula.

74. Period Closing Balance has a formal formula.

75. Period boundaries are explicit.

76. Reporting time zone is explicit.

77. Time-zone changes do not rewrite historical effective dates silently.

78. Current Balance includes only approved Transaction states.

79. Reversal treatment is explicit.

80. Partial refunds produce a reconstructable net effect.

81. Deleted posted Transactions remain historically explainable.

82. Balance Snapshots have stable identifiers.

83. Balance Snapshots identify Account and Owner.

84. Balance Snapshots identify balance type.

85. Balance Snapshots identify currency.

86. Balance Snapshots identify calculation-policy version.

87. Balance Snapshots identify the last included Event.

88. Balance Snapshots support integrity verification.

89. Balance Snapshots remain reproducible from canonical records.

90. Backdated mutations invalidate affected snapshots.

91. Balance caches include Owner scope.

92. Balance caches include financial-data version.

93. Balance caches do not leak across Owners.

94. Recalculation operations have stable identifiers.

95. Recalculation identifies previous and new results.

96. Recalculation differences are classified.

97. Unexplained balance differences trigger investigation.

98. Client calculations are provisional unless verified by the backend.

99. Android, Web, APIs and exports use the same financial semantics.

100. Every authoritative financial result can be independently recalculated.

---

# Foundational Financial Rule

A financial value is not correct merely because it appears reasonable on the screen.

It is correct only when Nexio can establish:

```text
The canonical monetary representation

The currency

The precision

The rounding policy

The included financial Resources

The excluded financial Resources

The Transaction states

The Transfer treatment

The period boundaries

The reporting time zone

The calculation-policy version

The resulting exact value

The Evidence required to reproduce it
```

When Nexio cannot explain or reproduce a monetary result, it must not present that result as verified financial state.

The system must preserve the contributing records, identify the uncertainty, recalculate through approved rules and initiate reconciliation or investigation according to risk.

# Calculation Engine Architecture

The Nexio Calculation Engine is the authoritative Platform capability responsible for producing reproducible financial results from canonical financial Resources and approved policy versions.

The Calculation Engine must not be implemented as unrelated formulas distributed independently across:

- Android.
- Web.
- Backend controllers.
- Database queries.
- Reports.
- Exports.
- Analytics.
- Background jobs.
- Support tools.

The recommended architecture is:

```text
Canonical Financial Resources

↓

Financial Policy Resolution

↓

Calculation Input Validation

↓

Currency and Precision Validation

↓

State and Period Filtering

↓

Signed Financial Delta Generation

↓

Deterministic Aggregation

↓

Rounding at Approved Stage

↓

Result Validation

↓

Calculation Result and Evidence

↓

Snapshot or Cache Update
```

---

# Calculation Engine Responsibilities

The Calculation Engine is responsible for:

- Resolving the applicable calculation-policy version.
- Validating Owner and Account scope.
- Validating currencies.
- Validating monetary precision.
- Selecting eligible financial Resources.
- Excluding ineligible Resource states.
- Applying Transaction direction.
- Applying Transfer semantics.
- Applying reversal and refund semantics.
- Applying period boundaries.
- Applying reporting time zones.
- Aggregating exact monetary values.
- Applying approved rounding.
- Producing calculation metadata.
- Detecting invalid or unexplained states.
- Supporting recalculation.
- Supporting reconciliation.
- Producing Financial Audit Evidence where required.

---

# Calculation Engine Non-Responsibilities

The Calculation Engine must not independently:

- Authenticate Actors.
- Grant Authorization.
- Resolve Owner identity from untrusted input.
- Modify financial Resources without an approved command.
- Invent missing Transactions.
- Correct inconsistent balances silently.
- Select arbitrary exchange rates.
- Rewrite historical policy versions.
- Convert a projected value into a Posted value.
- Treat a display string as an authoritative amount.
- Suppress unexplained differences.

---

# Calculation Input Contract

Every authoritative calculation request should define:

```text
calculationId

calculationType

ownerId

accountIds

currency

dateRange

reportingTimeZone

transactionStates

reconciliationStates

calculationPolicyVersion

financialDataVersion

requestedAt

requestSource
```

---

# Calculation Identifier

Recommended format:

```text
calc_<sortable-unique-identifier>
```

A calculation identifier should be used for:

- Material recalculation.
- Balance regeneration.
- Reconciliation.
- Financial report generation.
- Financial export.
- Migration comparison.
- Incident investigation.

Ordinary low-risk UI calculations may use request-level correlation without durable calculation records.

---

# Calculation Types

Recommended controlled values include:

```text
AccountCurrentBalance

AccountAvailableBalance

AccountPendingBalance

AccountProjectedBalance

AccountReconciledBalance

PeriodOpeningBalance

PeriodClosingBalance

PeriodIncome

PeriodExpense

NetCashFlow

BudgetConsumption

GoalProgress

CategoryTotal

TransferImpact

ReconciliationDifference

FinancialSnapshot

FinancialExportTotal

MigrationComparison
```

---

# Financial Policy Registry

Every material financial policy must exist in a Financial Policy Registry.

Recommended fields:

```text
financialPolicyId

policyKey

name

description

policyType

version

effectiveFrom

effectiveUntil

supportedCurrencies

supportedAccountTypes

calculationRules

roundingRules

inclusionRules

exclusionRules

timeZoneRules

migrationRules

owner

status

introducedAt

lastReviewed

nextReviewAt
```

---

# Financial Policy Identifier

Recommended format:

```text
FINANCIAL-POLICY-<DOMAIN>-<NUMBER>
```

Examples:

```text
FINANCIAL-POLICY-BALANCE-001

FINANCIAL-POLICY-ROUNDING-002

FINANCIAL-POLICY-RECONCILIATION-004

FINANCIAL-POLICY-BUDGET-003
```

---

# Financial Policy Key

Recommended format:

```text
financial.<domain>.<policy>
```

Examples:

```text
financial.balance.current

financial.rounding.brl

financial.reconciliation.standard

financial.budget.consumption
```

---

# Financial Policy States

Recommended states:

```text
Draft

Reviewing

Approved

Active

Limited

Deprecated

Retired

Archived
```

---

# Policy Resolution

A calculation must resolve one approved policy version.

Policy resolution may depend on:

- Calculation type.
- Account type.
- Currency.
- Effective date.
- Reporting period.
- Migration state.
- Environment.
- Product version.

Policy resolution must not depend on mutable UI state.

---

# Policy Effective Period

A Financial policy should define:

```text
effectiveFrom

effectiveUntil
```

Historical calculations must use the policy applicable to the relevant financial Event or approved reporting rule.

---

# Policy Version Preservation

When a policy changes:

- Preserve the previous version.
- Create a new version.
- Define the effective period.
- Define migration behavior.
- Define whether historical reports remain under the original policy.
- Define whether recalculation is required.
- Define expected differences.
- Preserve Audit Evidence.

---

# Calculation Policy Migration

A policy migration must distinguish:

```text
Prospective application

Historical recalculation

Display-only reinterpretation

Data correction

Financial migration
```

A new policy must not silently change historical balances unless the migration explicitly authorizes recalculation.

---

# Calculation Request Validation

Before calculation, validate:

```text
Owner exists.

Actor is authorized where applicable.

Accounts belong to the Owner.

Currencies are compatible.

Date range is valid.

Time zone is valid.

Transaction states are supported.

Policy version is approved.

Financial-data version is available.

Requested calculation type is supported.
```

---

# Invalid Calculation Input

Invalid input must produce a controlled error.

Examples:

```text
FINANCIAL_OWNER_SCOPE_MISMATCH

FINANCIAL_ACCOUNT_NOT_FOUND

FINANCIAL_CURRENCY_MISMATCH

FINANCIAL_POLICY_UNSUPPORTED

FINANCIAL_DATE_RANGE_INVALID

FINANCIAL_TIME_ZONE_INVALID

FINANCIAL_DATA_VERSION_CONFLICT

FINANCIAL_CALCULATION_OVERFLOW
```

---

# Calculation Data Version

A calculation should reference the financial-data version it used.

Potential representations include:

```text
Latest Resource version

Account financial sequence

Last included financial Event ID

Database transaction version

Balance snapshot source version
```

---

# Calculation Consistency Boundary

The Calculation Engine must define the state boundary used during calculation.

Potential strategies include:

- Database transaction snapshot.
- Repeatable-read transaction.
- Immutable Event sequence.
- Versioned financial snapshot.
- Explicit `asOf` boundary.

A calculation must not unknowingly combine records from materially different financial states.

---

# Calculation As-Of Time

An `asOf` value may define the latest financial Event eligible for inclusion.

Example:

```text
asOf = 2026-07-31T23:59:59.999Z
```

The calculation must still apply the approved reporting time-zone and effective-date rules.

---

# Calculation Output Contract

Recommended structure:

```text
FinancialCalculationResult
 ├── calculationId
 ├── calculationType
 ├── ownerId
 ├── accountIds
 ├── amount
 ├── currency
 ├── period
 ├── reportingTimeZone
 ├── includedRecordCount
 ├── excludedRecordCount
 ├── calculationPolicyVersion
 ├── financialDataVersion
 ├── lastIncludedEventId
 ├── resultState
 ├── warnings
 ├── calculatedAt
 └── integrityReference
```

---

# Calculation Result States

Recommended values:

```text
Succeeded

SucceededWithWarnings

Failed

Inconsistent

Incomplete

Overflow

Unsupported
```

---

# Succeeded Calculation

All required inputs were available, valid and consistent.

---

# Succeeded-With-Warnings Calculation

The result is usable, but one or more noncritical conditions exist.

Examples:

- Delayed projection data.
- Optional category missing.
- Nonmaterial description inconsistency.
- Unreconciled records included according to policy.

Warnings must not hide a material financial-integrity issue.

---

# Failed Calculation

The result could not be produced safely.

No previous or partial result should be presented as newly verified.

---

# Inconsistent Calculation

Canonical records conflict materially.

Examples:

- Transfer has only one Posted side.
- Currency differs from Account.
- Duplicate balance Event exists.
- Reversal exceeds original amount.
- Reconciliation references missing Transaction.

---

# Incomplete Calculation

Required records or data partitions are unavailable.

The result must not be presented as complete.

---

# Overflow Result

The supported numeric range was exceeded.

Nexio must not return a truncated amount.

---

# Unsupported Result

The requested combination of Account type, currency, policy or calculation type is not implemented.

---

# Calculation Warnings

Recommended warning codes include:

```text
UNRECONCILED_TRANSACTIONS_INCLUDED

PROJECTED_DATA_DELAYED

BACKDATED_MUTATION_DETECTED

BALANCE_SNAPSHOT_STALE

OPTIONAL_RATE_UNAVAILABLE

RECONCILIATION_REOPENED

PENDING_STATE_POLICY_APPLIED

HISTORICAL_POLICY_USED
```

---

# Precision Pipeline

The recommended precision pipeline is:

```text
Parse exact input

↓

Validate input scale

↓

Convert to canonical Money representation

↓

Perform high-precision intermediate calculation

↓

Apply approved rounding at the defined stage

↓

Validate final scale

↓

Persist exact result

↓

Format for display separately
```

---

# Input Parsing

Financial input parsing must define:

- Accepted decimal separator.
- Accepted grouping separator.
- Currency.
- Locale.
- Maximum length.
- Maximum scale.
- Negative-value behavior.
- Whitespace behavior.
- Invalid-character behavior.

---

# pt-BR Monetary Input

For a pt-BR interface, an Owner may enter:

```text
1.250,45
```

The interface may display:

```text
R$ 1.250,45
```

The canonical decimal value should be:

```text
1250.45
```

The formatted display string must not be stored as the authoritative numeric value.

---

# Ambiguous Input

Ambiguous input must not be guessed.

Example:

```text
1.000
```

Depending on locale, this may mean:

```text
One thousand

or

One with three decimal places
```

The active locale and field rules must determine interpretation explicitly.

---

# Input Normalization

Safe normalization may include:

- Removing approved grouping separators.
- Converting locale decimal separator to canonical separator.
- Trimming whitespace.
- Normalizing currency symbol separately.

Normalization must not:

- Change sign silently.
- Round excess decimal places silently.
- Infer missing currency incorrectly.
- Convert invalid text into zero.
- Remove meaningful digits.

---

# Amount Validation

A monetary input is valid only when:

```text
Currency is supported.

Amount syntax is valid.

Scale is allowed.

Value is within range.

Sign is allowed.

Transaction type is compatible.

Account currency is compatible.
```

---

# Canonical Aggregation

Financial aggregation must use exact addition of signed deltas.

Conceptually:

```text
total =
delta1
+
delta2
+
delta3
+
...
```

Aggregation must not:

- Parse formatted text repeatedly.
- Round after every addition unless policy requires it.
- Depend on database row order.
- Skip invalid records silently.
- Combine incompatible currencies.

---

# Aggregation Order

Exact decimal addition should be order-independent for supported precision.

Where allocation, weighted averaging or currency conversion introduces order-sensitive behavior, the order must be explicitly defined.

---

# Empty Aggregation

An empty valid aggregation should generally return:

```text
R$ 0,00
```

with:

```text
includedRecordCount = 0
```

It must remain distinguishable from:

- Calculation failure.
- Missing Account.
- Unavailable data.
- Unsupported policy.

---

# Null Monetary Values

Canonical financial amounts should not use null to represent zero.

Recommended distinction:

```text
R$ 0,00:
Known zero value.

null:
Value absent, unknown or not applicable.
```

---

# Financial Inclusion Matrix

Every balance and report type must define which Transaction states are included.

Example matrix:

| Transaction State | Current Balance | Available Balance | Projected Balance | Reconciled Balance |
|---|---:|---:|---:|---:|
| Draft | No | No | No | No |
| Scheduled | No | No | Yes | No |
| Pending | No | Policy-dependent | Yes | No |
| Posted | Yes | Yes | Yes | No |
| Reconciled | Yes | Yes | Yes | Yes |
| Disputed | Yes | Yes | Yes | Policy-dependent |
| Reversed | Through original and reversal | Through original and reversal | Through original and reversal | Through approved reconciliation policy |
| Cancelled | No | No | No | No |
| Deleted without posted effect | No | No | No | No |

The canonical Registry must contain the exact supported policy.

---

# Inclusion by Effective Date

A Transaction should be included in a reporting period when its approved financial date falls within the period boundary.

Recommended rule:

```text
periodStart <= effectiveDate < periodEnd
```

---

# Inclusion by Posted State

A Current Balance calculation should include only Transactions that reached an approved Posted-equivalent state.

---

# Inclusion by Reconciliation State

A Reconciled Balance should include only financial effects accepted by the applicable reconciliation policy.

---

# Inclusion by Account State

Archived or Closed Accounts may remain included in historical reports.

Account state affects future mutation, not necessarily historical aggregation.

---

# Financial Sequence

Accounts may maintain a monotonic financial sequence.

Recommended uses:

- Balance Snapshot validation.
- Event ordering.
- Duplicate detection.
- Recalculation boundaries.
- Synchronization.
- Financial Audit.

---

# Financial Sequence Rules

A sequence must:

- Be scoped to one Account or defined financial partition.
- Increase monotonically.
- Not be reused.
- Remain independent from display order.
- Preserve committed Event order.
- Detect gaps where required.

---

# Sequence Gap

A missing financial sequence value may indicate:

- Failed Event publication.
- Deleted record.
- Migration defect.
- Reserved but unused sequence.
- Transaction rollback.
- Data corruption.

The sequence design must document valid gap behavior.

---

# Calculation Snapshot

A Calculation Snapshot preserves a verified result and its calculation context.

Recommended structure:

```text
CalculationSnapshot
 ├── calculationSnapshotId
 ├── calculationType
 ├── ownerId
 ├── accountIds
 ├── result
 ├── currency
 ├── period
 ├── policyVersion
 ├── financialDataVersion
 ├── includedEventRange
 ├── contentHash
 ├── integrityState
 └── createdAt
```

---

# Calculation Snapshot Use

Calculation Snapshots may support:

- Dashboard performance.
- Historical reports.
- Export reproducibility.
- Reconciliation closure.
- Financial investigation.
- Migration comparison.
- Incident recovery.

---

# Snapshot Freshness

A snapshot must define whether it is:

```text
Current

Stale

Invalidated

Recalculating

VerificationFailed
```

---

# Snapshot Invalidation Triggers

Potential triggers include:

- Backdated Transaction.
- Posted amount correction.
- Transfer correction.
- Reversal.
- Reconciliation reopening.
- Opening Balance change.
- Currency-policy migration.
- Calculation-policy migration.
- Missing Event recovery.
- Duplicate Event correction.

---

# Snapshot Read Strategy

A read may use a snapshot only when:

- Snapshot scope matches.
- Snapshot policy version is supported.
- Snapshot data version is current enough.
- Integrity verification passes.
- No invalidation marker exists.
- Requested date boundary is compatible.

---

# Balance Engine Architecture

The Balance Engine is the Calculation Engine component responsible for Account-level balances.

Recommended flow:

```text
Resolve Account and Owner

↓

Resolve Account currency

↓

Resolve balance policy

↓

Resolve opening state

↓

Load eligible financial Events

↓

Validate financial sequence

↓

Generate signed deltas

↓

Aggregate exact values

↓

Apply approved rounding

↓

Compare available snapshot

↓

Return verified balance
```

---

# Opening-State Resolution

Opening state may originate from:

- Account opening balance.
- Migration snapshot.
- Statement opening balance.
- Approved reconciliation closure.
- Previous verified period snapshot.

The selected source must remain explicit.

---

# Balance Event

A Balance Event is a canonical financial effect.

Recommended fields:

```text
balanceEventId

ownerId

accountId

sourceResourceType

sourceResourceId

financialSequence

signedAmount

currency

effectiveDate

postedAt

state

operationId

policyVersion

createdAt
```

---

# Balance Event Identifier

Recommended format:

```text
bevt_<sortable-unique-identifier>
```

---

# Balance Event Authority

Balance Events may be derived from canonical Transactions, but their relationship must remain verifiable.

Nexio must not allow an unexplained Balance Event with no source Resource or approved adjustment authority.

---

# Balance Event Types

Recommended:

```text
OpeningCredit

OpeningDebit

IncomeCredit

ExpenseDebit

TransferCredit

TransferDebit

AdjustmentCredit

AdjustmentDebit

RefundCredit

ReversalCredit

ReversalDebit
```

---

# Balance Event State

Recommended:

```text
Pending

Posted

Reconciled

Reversed

Invalidated
```

---

# Balance Rebuild

A full Balance rebuild should:

```text
Load opening state.

↓

Load all eligible canonical financial Events.

↓

Validate sequence and currency.

↓

Recalculate signed deltas.

↓

Compare with current snapshot.

↓

Classify any difference.

↓

Persist a new verified snapshot.

↓

Preserve the prior snapshot.
```

---

# Incremental Balance Update

An incremental update may apply one or more new Events to the latest verified snapshot.

It is allowed only when:

- Event sequence is continuous.
- Snapshot integrity passes.
- No backdated mutation invalidates the period.
- Policy version remains compatible.
- Currency remains unchanged.

---

# Incremental Update Failure

If incremental validation fails, Nexio must perform a bounded or full rebuild rather than guessing the new balance.

---

# Balance Verification

Balance verification should compare:

```text
Recalculated balance

Current Balance Snapshot

Account displayed balance

Exported balance where applicable

Reconciliation closing balance
```

---

# Balance Verification Outcomes

Recommended:

```text
Matched

MatchedAfterExpectedAdjustment

Mismatch

Incomplete

Unverifiable
```

---

# Credit Account Semantics

Credit Accounts may require distinct semantics.

Potential values include:

```text
Outstanding Balance

Available Credit

Credit Limit

Pending Charges

Statement Balance
```

These values must not reuse ordinary Checking Account balance formulas without an approved policy.

---

# Credit Limit

A Credit Limit is not an Account balance.

Potential formula:

```text
Available Credit
=
Credit Limit
-
Posted Outstanding Balance
-
Approved Pending Charges
```

The exact policy must be separately registered.

---

# Cash Account Semantics

A Cash Account generally uses:

```text
Current Balance
=
Opening Balance
+
Posted signed deltas
```

Pending provider states may not apply.

---

# Investment Account Semantics

Investment valuation requires:

- Quantity.
- Asset price.
- Valuation timestamp.
- Provider.
- Currency.
- Exchange rate.
- Market-status policy.

Investment valuation must not be activated through ordinary cash-balance formulas.

---

# Cash Flow Architecture

Cash Flow measures financial movement within a period.

Recommended components:

```text
Cash Inflow

Cash Outflow

Net Cash Flow

Opening Balance

Closing Balance

Projected Inflow

Projected Outflow
```

---

# Cash Inflow

Cash Inflow generally includes approved Posted credit Transactions.

Potential included types:

- Income.
- Refund.
- Adjustment Credit.
- External Transfer Credit.

Internal Transfer treatment must be explicit.

---

# Cash Outflow

Cash Outflow generally includes approved Posted debit Transactions.

Potential included types:

- Expense.
- Adjustment Debit.
- External Transfer Debit.
- Transfer fee.

---

# Net Cash Flow

Conceptual formula:

```text
Net Cash Flow
=
Cash Inflow
-
Cash Outflow
```

---

# Internal Transfer Treatment

For an Owner-wide Cash Flow report across both Accounts, an internal Transfer should generally be excluded from net inflow and outflow because it does not change total Owner wealth.

Example:

```text
Account A:
-R$ 500,00

Account B:
+R$ 500,00
```

Owner-wide net effect:

```text
R$ 0,00
```

---

# Single-Account Transfer Treatment

For a single-Account report, Transfer effects may be displayed because they change that Account's balance.

The interface should label them as Transfers rather than income or expense.

---

# External Transfer Treatment

A Transfer involving an external destination or source may behave as an outflow or inflow according to the Product model.

The external boundary must be explicit.

---

# Period Income

Period Income should generally exclude:

- Internal Transfer Credits.
- Adjustment Credits that are not genuine income.
- Reversal Credits.
- Opening Balance.
- Loan principal movements where separately classified.

The exact policy must be registered.

---

# Period Expense

Period Expense should generally exclude:

- Internal Transfer Debits.
- Reversal Debits.
- Opening Balance.
- Adjustment Debits not classified as expense.
- Investment principal movement where separately classified.

---

# Gross and Net Values

Reports must distinguish:

```text
Gross Income

Gross Expense

Net Cash Flow

Net Financial Change
```

These values are not interchangeable.

---

# Cash Flow Period Comparison

A comparison should define:

- Current period.
- Previous period.
- Time zone.
- Inclusion states.
- Transfer treatment.
- Currency.
- Percentage-change rule.

---

# Percentage Change

Conceptual formula:

```text
Percentage Change
=
(Current - Previous)
÷
Absolute Previous
×
100
```

The exact policy must define behavior when the previous value is zero.

---

# Previous Value Zero

Potential result states include:

```text
NotApplicable

NewActivity

InfiniteIncreaseNotDisplayed
```

Nexio must not display a misleading finite percentage.

---

# Category Aggregation

Category totals should include only Transactions eligible under the report policy.

Recommended output:

```text
categoryId

amount

currency

transactionCount

percentageOfTotal

calculationPolicyVersion
```

---

# Uncategorized Transactions

Uncategorized Transactions must remain visible through an explicit category such as:

```text
Uncategorized
```

They must not disappear from totals.

---

# Category Reclassification

Changing a Transaction category should update affected category summaries without changing overall financial totals.

---

# Category Hierarchy

When categories have parent and child relationships, reports must define whether parent totals:

- Include direct Transactions only.
- Include all descendant Transactions.
- Display both separately.

Double counting is prohibited.

---

# Budget Architecture

A Budget defines an approved spending target for a period and scope.

Recommended structure:

```text
Budget
 ├── budgetId
 ├── ownerId
 ├── name
 ├── amount
 ├── currency
 ├── periodType
 ├── periodStart
 ├── periodEnd
 ├── categoryIds
 ├── accountIds
 ├── inclusionPolicyVersion
 ├── resourceVersion
 ├── state
 └── createdAt
```

---

# Budget Identifier

Recommended format:

```text
bdg_<sortable-unique-identifier>
```

---

# Budget States

Recommended:

```text
Draft

Active

Completed

Paused

Archived

Deleted
```

---

# Budget Amount

Budget amount must:

- Be greater than zero.
- Use exact monetary representation.
- Identify currency.
- Match supported scope currency.
- Use approved scale.

---

# Budget Consumption

Conceptual formula:

```text
Consumed Amount
=
Σ eligible Expense amounts
```

for the Budget's:

- Period.
- Categories.
- Accounts.
- Currency.
- State policy.

---

# Budget Remaining

```text
Remaining Amount
=
Budget Amount
-
Consumed Amount
```

Remaining Amount may become negative.

---

# Budget Overspending

```text
Overspending Amount
=
max(Consumed Amount - Budget Amount, R$ 0,00)
```

---

# Budget Usage Percentage

```text
Usage Percentage
=
Consumed Amount
÷
Budget Amount
×
100
```

A valid active Budget must not have a zero denominator.

---

# Budget Included Transactions

A Budget policy should define whether it includes:

- Posted Expenses.
- Reconciled Expenses.
- Pending Expenses.
- Scheduled Expenses.
- Refunds.
- Adjustments.
- Internal Transfers.
- Fees.
- Deleted or Reversed Transactions.

---

# Budget Refund Treatment

A Refund may reduce consumed amount when linked to an eligible Budget expense.

Example:

```text
Expense:
R$ 200,00

Refund:
R$ 50,00

Net Budget consumption:
R$ 150,00
```

The policy must prevent unrelated credits from reducing Budget consumption.

---

# Budget Reversal Treatment

A full reversal should neutralize the original Budget effect.

---

# Budget Transfer Treatment

Internal Transfers should generally not consume spending Budgets.

Transfer fees may consume a Budget when categorized as an eligible Expense.

---

# Budget Period Types

Potential types:

```text
Weekly

Monthly

Quarterly

Annual

Custom
```

Period generation must use the approved reporting time zone.

---

# Monthly Budget Boundary

Example for July 2026:

```text
Start:
2026-07-01T00:00:00 in reporting time zone

End:
2026-08-01T00:00:00 in reporting time zone
```

---

# Rolling Budget

A rolling Budget may use a moving window.

It must define:

- Window length.
- Evaluation time.
- Time zone.
- Inclusion boundary.
- Refresh behavior.

---

# Budget Currency Mismatch

Transactions in another currency must not be included unless the Budget explicitly supports conversion through an approved conversion policy.

---

# Budget Multi-Category Allocation

One Transaction should not be counted multiple times merely because multiple selected categories overlap through a hierarchy.

---

# Budget Snapshot

A Budget Snapshot may contain:

```text
budgetSnapshotId

budgetId

period

budgetAmount

consumedAmount

remainingAmount

overspendingAmount

usagePercentage

includedTransactionCount

financialDataVersion

policyVersion

createdAt
```

---

# Budget Update

Changing an active Budget amount should:

- Increment Resource version.
- Preserve previous amount.
- Recalculate remaining and percentage values.
- Preserve historical snapshots.
- Generate Audit Evidence.

---

# Budget Category Change

Changing category scope may change historical period consumption.

The Product must define whether the change:

- Applies prospectively.
- Recalculates the current period.
- Recalculates all historical periods.
- Creates a new Budget version.

---

# Goal Architecture

A Goal represents a target amount and its contribution history.

Recommended structure:

```text
Goal
 ├── goalId
 ├── ownerId
 ├── name
 ├── targetAmount
 ├── currency
 ├── targetDate
 ├── contributionPolicy
 ├── resourceVersion
 ├── state
 ├── createdAt
 └── completedAt
```

---

# Goal Identifier

Recommended format:

```text
goal_<sortable-unique-identifier>
```

---

# Goal States

Recommended:

```text
Draft

Active

Completed

Paused

Cancelled

Archived
```

---

# Goal Contribution

A Goal Contribution should include:

```text
goalContributionId

goalId

ownerId

amount

currency

direction

reason

sourceTransactionId

operationId

createdAt
```

---

# Goal Contribution Identifier

Recommended format:

```text
gcon_<sortable-unique-identifier>
```

---

# Goal Contribution Direction

Recommended values:

```text
Contribution

Withdrawal

AdjustmentCredit

AdjustmentDebit
```

---

# Goal Current Amount

Conceptual formula:

```text
Goal Current Amount
=
Σ contribution signed deltas
```

where:

```text
Contribution = positive

Withdrawal = negative

Adjustment Credit = positive

Adjustment Debit = negative
```

---

# Goal Remaining Amount

```text
Remaining Amount
=
max(Target Amount - Current Amount, R$ 0,00)
```

---

# Goal Excess Amount

```text
Excess Amount
=
max(Current Amount - Target Amount, R$ 0,00)
```

---

# Goal Progress Percentage

```text
Progress Percentage
=
Current Amount
÷
Target Amount
×
100
```

The Product may display values above 100% or cap the visual indicator while preserving the exact percentage.

---

# Goal Target Validation

Target Amount must be greater than zero.

A zero target must not enter the standard progress formula.

---

# Goal Withdrawal

A withdrawal must not silently produce a negative Goal Current Amount unless the policy explicitly permits it.

Potential behavior:

- Reject withdrawal above Current Amount.
- Allow negative state with warning.
- Require adjustment authority.

The selected policy must be explicit.

---

# Goal Completion

A Goal may become Completed when:

```text
Current Amount >= Target Amount
```

Completion may be automatic or require Owner confirmation.

The policy must remain explicit.

---

# Goal Reopening

A Completed Goal may reopen when:

- A withdrawal reduces the amount.
- Target Amount increases.
- A correction changes contributions.
- The Owner explicitly reopens it.

---

# Goal Amount Removal

Removing an amount from a Goal must create a withdrawal or adjustment Event with a reason.

It must not silently edit the aggregate Current Amount field.

---

# Goal and Account Relationship

A Goal may be:

- Informational only.
- Linked to one Account.
- Linked to specific Transactions.
- Backed by Transfer operations.

The Product must not imply that money is reserved when only an informational Goal exists.

---

# Recurring Transaction Architecture

A Recurring Transaction Template defines expected future Transaction generation.

Recommended structure:

```text
RecurringTransaction
 ├── recurringTransactionId
 ├── ownerId
 ├── accountId
 ├── transactionType
 ├── amount
 ├── currency
 ├── schedule
 ├── timeZone
 ├── startDate
 ├── endDate
 ├── nextOccurrence
 ├── generationPolicyVersion
 ├── state
 ├── resourceVersion
 └── createdAt
```

---

# Recurring Transaction Identifier

Recommended format:

```text
rtx_<sortable-unique-identifier>
```

---

# Recurring Transaction States

Recommended:

```text
Draft

Active

Paused

Completed

Cancelled

Archived
```

---

# Recurrence Schedule

Supported schedules may include:

```text
Daily

Weekly

Biweekly

Monthly

Quarterly

Annual

Custom Rule
```

Only tested schedules may be activated.

---

# Recurrence Time Zone

Schedule evaluation must use an explicit time zone.

Client local time must not silently redefine backend generation.

---

# Monthly Recurrence

A monthly recurrence must define behavior for dates that do not exist in every month.

Example:

```text
Day 31
```

Potential policies:

```text
Use last valid day of month

Skip the month

Move to next month

Require manual correction
```

---

# Leap-Year Behavior

Annual recurrence on February 29 must define non-leap-year behavior.

---

# Recurring Instance

Every generated instance should include:

```text
recurringInstanceId

recurringTransactionId

scheduledOccurrence

generatedTransactionId

generationOperationId

generationPolicyVersion

state

createdAt
```

---

# Recurring Instance Identifier

Recommended format:

```text
rti_<sortable-unique-identifier>
```

---

# Recurring Instance States

Recommended:

```text
Scheduled

Generated

Skipped

Failed

Cancelled

Adjusted
```

---

# Recurring Generation Idempotency

One schedule occurrence must produce at most one canonical generated Transaction.

The idempotency boundary should include:

```text
recurringTransactionId

scheduledOccurrence

generationPolicyVersion
```

---

# Recurring Retry

A Retry must preserve the same generation operation identity.

It must not generate another Transaction.

---

# Recurring Amount Update

Changing the Template amount should define whether it applies to:

- Future occurrences only.
- Current ungenerated occurrence.
- Existing Scheduled instances.
- Previously generated Transactions.

Previously Posted Transactions must not change automatically.

---

# Recurring Pause

Pausing should prevent new generation after the effective pause time.

Existing Posted instances remain unchanged.

---

# Recurring Resume

Resume behavior must define whether missed occurrences are:

```text
Generated retroactively

Skipped

Generated only after resume

Presented for Owner confirmation
```

---

# Recurring Skip

A skipped occurrence must remain represented as an explicit instance state.

The schedule must not simply advance without Evidence.

---

# Recurring Projection

Future eligible occurrences may contribute to Projected Balance and projected Cash Flow.

They must remain distinguishable from Posted Transactions.

---

# Projection Architecture

Projection estimates future financial state from approved non-posted Resources.

Potential sources include:

- Scheduled Transactions.
- Active recurring occurrences.
- Expected income.
- Expected expenses.
- Planned Goal contributions.
- Planned Transfers.

---

# Projection Horizon

Every projection must define a horizon.

Examples:

```text
Next 7 days

Next 30 days

End of current month

Custom date
```

---

# Projection Result

Recommended structure:

```text
ProjectionResult
 ├── projectionId
 ├── ownerId
 ├── accountIds
 ├── startingBalance
 ├── projectedCredits
 ├── projectedDebits
 ├── projectedClosingBalance
 ├── horizon
 ├── currency
 ├── policyVersion
 ├── sourceCount
 └── calculatedAt
```

---

# Projection Identifier

Recommended format:

```text
proj_<sortable-unique-identifier>
```

---

# Projection Confidence

Potential levels:

```text
ConfirmedScheduled

Expected

Estimated

Uncertain
```

Confidence must not alter the underlying monetary amount silently.

---

# Projection Exclusions

Projected calculations should exclude:

- Cancelled schedules.
- Paused recurrence outside policy.
- Unsupported currencies.
- Duplicate scheduled instances.
- Expired planned operations.
- Unverified imported projections.

---

# Projection and Current Balance

Projected Balance must never replace Current Balance.

Interfaces should label:

```text
Current Balance:
R$ 2.000,00

Projected Balance on 31 August:
R$ 1.450,00
```

---

# Import Calculation Architecture

Import processing must preserve exact source values and calculated results.

Recommended flow:

```text
Receive source file

↓

Generate source-file hash

↓

Detect format and locale

↓

Parse exact values

↓

Validate currency and scale

↓

Normalize into canonical candidates

↓

Detect duplicates

↓

Generate preview totals

↓

Owner confirms

↓

Create canonical Transactions

↓

Generate accepted and rejected totals

↓

Recalculate affected balances

↓

Produce Import Evidence
```

---

# Import Amount Parsing

The parser must define:

- Source locale.
- Decimal separator.
- Grouping separator.
- Currency symbol.
- Currency code.
- Negative-value notation.
- Parentheses behavior.
- Empty amount behavior.
- Invalid value behavior.

---

# Parentheses Negative Amount

Some statements may represent negative values as:

```text
(R$ 125,00)
```

The Import parser must support this only when the format definition explicitly permits it.

---

# Import Preview Total

Preview should display:

```text
Rows received

Rows valid

Rows invalid

Total credits

Total debits

Net effect

Currencies detected

Potential duplicates
```

Preview totals are provisional until confirmation and persistence complete.

---

# Import Accepted Total

After completion, Nexio should calculate accepted totals from successfully created canonical Transactions, not only from source rows.

---

# Import Rejected Total

Rejected totals should distinguish:

- Invalid amount.
- Unsupported currency.
- Invalid date.
- Duplicate.
- Missing Account.
- Owner cancellation.
- System failure.

---

# Import Partial Completion

A partially completed Import must identify:

```text
Accepted rows

Rejected rows

Unknown rows

Created Transactions

Balance recalculation state

Retry eligibility
```

It must not present the full source total as imported.

---

# Import Duplicate Detection

Potential duplicate signals include:

- External statement identifier.
- Source-file hash.
- Row hash.
- Account.
- Amount.
- Date.
- Description.
- Currency.
- Provider reference.
- Existing Transaction relationship.

---

# Import Row Hash

A normalized row hash may include:

```text
accountId

effectiveDate

amount

currency

normalizedDescription

externalReference

parserVersion
```

The normalization version must be preserved.

---

# Duplicate Candidate

A duplicate candidate is not automatically a confirmed duplicate.

The system should distinguish:

```text
Exact Duplicate

Probable Duplicate

Possible Duplicate

Not Duplicate
```

---

# Import Financial Equality

For a fully successful Import:

```text
Source accepted net total
=
Canonical created financial net total
```

after applying the approved normalization and conversion policy.

Any unexplained difference must block completion or mark the Import as inconsistent.

---

# Export Calculation Architecture

Financial Exports must use canonical calculation definitions.

An Export should preserve:

- Calculation type.
- Included Account scope.
- Included date range.
- Time zone.
- Transaction states.
- Reconciliation states.
- Currency.
- Policy version.
- Financial-data version.
- Generated totals.
- Content hash.

---

# Exported Monetary Value

Exports should use machine-safe canonical representation.

Example JSON:

```json
{
  "amount": "1250.45",
  "currency": "BRL"
}
```

Example pt-BR display report:

```text
R$ 1.250,45
```

---

# Export Decimal Separator

Machine-readable CSV should define its decimal and delimiter rules explicitly.

The Export must avoid ambiguous formatting.

---

# Export Reproducibility

A financial Export should be reproducible from:

```text
Export request

Financial-data version

Calculation-policy version

Date range

Time zone

Account scope

Transaction-state policy

Currency rules
```

---

# Report Architecture

Every financial report should define:

- Report type.
- Owner scope.
- Account scope.
- Period.
- Time zone.
- Currency.
- Included states.
- Transfer treatment.
- Reconciliation treatment.
- Policy version.
- Data version.
- Generated time.

---

# Dashboard Financial Values

Dashboard values should use the same Calculation Engine as detailed reports.

A Dashboard must not maintain separate hidden formulas.

---

# Chart Aggregation

Chart points must reconcile with report totals.

Example:

```text
Sum of monthly Expense chart points
=
Expense total for the same period and policy
```

unless the chart explicitly applies another grouping or filter.

---

# Number Abbreviation

A display may abbreviate:

```text
R$ 1.250.000,00

as

R$ 1,25 mi
```

The underlying exact value must remain available and unchanged.

---

# Reconciliation Architecture

Reconciliation compares Nexio financial records with an approved external or authoritative reference.

Recommended architecture:

```text
Create Reconciliation Session

↓

Define Account, Period and Currency

↓

Record Opening Reference Balance

↓

Import or Enter Reference Records

↓

Normalize Reference Records

↓

Generate Match Candidates

↓

Confirm Automatic and Manual Matches

↓

Identify Unmatched and Duplicate Records

↓

Apply Approved Adjustments

↓

Calculate Reconciliation Difference

↓

Verify Closing Reference Balance

↓

Complete Reconciliation

↓

Create Immutable Reconciliation Snapshot
```

---

# Reconciliation Session

Recommended structure:

```text
Reconciliation
 ├── reconciliationId
 ├── ownerId
 ├── accountId
 ├── currency
 ├── periodStart
 ├── periodEnd
 ├── reportingTimeZone
 ├── openingReferenceBalance
 ├── closingReferenceBalance
 ├── calculatedClosingBalance
 ├── difference
 ├── policyVersion
 ├── state
 ├── resourceVersion
 ├── createdBy
 ├── createdAt
 ├── completedAt
 └── auditReference
```

---

# Reconciliation Identifier

Recommended format:

```text
rec_<sortable-unique-identifier>
```

---

# Reconciliation States

Recommended:

```text
Draft

Preparing

Matching

Reviewing

DifferenceDetected

ReadyToComplete

Completed

Reopened

Cancelled

Failed
```

---

# Draft Reconciliation

The scope is being defined.

No Transactions are yet considered reconciled.

---

# Preparing Reconciliation

Reference data is being loaded, parsed or validated.

---

# Matching Reconciliation

Automatic or assisted match evaluation is active.

---

# Reviewing Reconciliation

The Owner or authorized Actor reviews:

- Matches.
- Unmatched records.
- Duplicates.
- Adjustments.
- Difference.

---

# Difference-Detected Reconciliation

The calculated financial state does not match the closing reference state within the approved policy.

---

# Ready-to-Complete Reconciliation

All required conditions are satisfied.

---

# Completed Reconciliation

The period was accepted and preserved through a Reconciliation Snapshot.

---

# Reopened Reconciliation

A previously completed period was reopened through an authorized operation.

Previous completion Evidence must remain preserved.

---

# Cancelled Reconciliation

The unfinished session was cancelled.

No completed reconciliation state should be inferred.

---

# Failed Reconciliation

A system or data defect prevented safe completion.

---

# Reconciliation Period

The period should use:

```text
Start inclusive

End exclusive
```

The reference statement period must be mapped explicitly to Nexio's time-zone boundaries.

---

# Opening Reference Balance

The opening reference balance represents the external or approved starting balance for the period.

It must identify:

- Amount.
- Currency.
- Source.
- Statement date.
- Actor.
- Evidence reference.

---

# Closing Reference Balance

The closing reference balance represents the external or approved ending balance for the period.

---

# Calculated Closing Balance

Conceptual formula:

```text
Calculated Closing Balance
=
Opening Reference Balance
+
Σ reconciled period signed deltas
+
Approved reconciliation adjustments
```

---

# Reconciliation Difference

```text
Difference
=
Closing Reference Balance
-
Calculated Closing Balance
```

---

# Reconciliation Completion Rule

For exact-currency Account reconciliation, completion should generally require:

```text
Difference = R$ 0,00
```

A nonzero tolerance must be explicitly approved and justified.

---

# Reconciliation Tolerance

Tolerance may be appropriate only for:

- Currency conversion.
- Provider settlement rounding.
- High-precision investment valuation.
- External systems with approved rounding behavior.

Ordinary BRL Account reconciliation should not use an unexplained tolerance merely to force completion.

---

# Reconciliation Reference Source

Potential sources include:

```text
Bank statement

Payment-provider statement

Cash count

Manual verified balance

Migration statement

Accounting export

Approved external API
```

---

# Reconciliation Reference Record

Recommended structure:

```text
ReconciliationReferenceRecord
 ├── referenceRecordId
 ├── reconciliationId
 ├── externalReference
 ├── effectiveDate
 ├── description
 ├── amount
 ├── currency
 ├── direction
 ├── sourceRow
 ├── sourceHash
 ├── state
 └── createdAt
```

---

# Reference Record Identifier

Recommended format:

```text
rref_<sortable-unique-identifier>
```

---

# Reference Record States

Recommended:

```text
Unmatched

Candidate

Matched

PartiallyMatched

Duplicate

Excluded

Disputed

Corrected
```

---

# Reconciliation Match

Recommended structure:

```text
ReconciliationMatch
 ├── reconciliationMatchId
 ├── reconciliationId
 ├── referenceRecordIds
 ├── transactionIds
 ├── matchType
 ├── confidence
 ├── amountDifference
 ├── dateDifference
 ├── createdBy
 ├── confirmedBy
 ├── state
 └── createdAt
```

---

# Reconciliation Match Identifier

Recommended format:

```text
rmatch_<sortable-unique-identifier>
```

---

# Match Types

Recommended:

```text
ExactOneToOne

ExactOneToMany

ExactManyToOne

Partial

Manual

Suggested

Adjustment
```

---

# Exact One-to-One Match

One Nexio Transaction matches one reference record.

Typical criteria:

```text
Same currency

Same signed amount

Compatible date

Compatible Account

No conflicting active match
```

---

# Exact One-to-Many Match

One reference record matches multiple Nexio Transactions.

Example:

```text
Reference debit:
R$ 150,00

Nexio Expenses:
R$ 100,00
+
R$ 50,00
```

The sum must match exactly under the approved policy.

---

# Exact Many-to-One Match

Multiple reference records match one Nexio Transaction.

Example:

```text
Reference credits:
R$ 30,00
+
R$ 70,00

Nexio Income:
R$ 100,00
```

---

# Partial Match

A partial match explains only part of the amount.

It must preserve the unmatched remainder.

---

# Manual Match

A manual match requires:

- Authorized Actor.
- Explicit selected records.
- Reason where non-exact.
- Amount verification.
- Date verification.
- Audit Evidence.

---

# Suggested Match

A Suggested Match is not final until accepted according to policy.

---

# Adjustment Match

An approved Adjustment explains a reconciliation difference.

The Adjustment remains a canonical financial Event.

---

# Match Confidence

Recommended levels:

```text
Exact

High

Medium

Low

ManualConfirmed
```

---

# Exact Match

All required deterministic fields match.

---

# High-Confidence Match

Most strong fields match, with a minor approved variation such as date proximity.

---

# Medium-Confidence Match

The records are plausible but require review.

---

# Low-Confidence Match

The suggestion is weak and should not be accepted automatically.

---

# Automatic Matching

Automatic matching should use controlled, versioned rules.

Potential factors include:

- Exact amount.
- Currency.
- Direction.
- Account.
- External identifier.
- Provider identifier.
- Effective date.
- Posted date.
- Normalized description.
- Check or reference number.
- Existing relationship.

---

# Automatic Match Policy

The Match Policy must define:

```text
Required fields

Optional fields

Date tolerance

Amount tolerance

Description normalization

One-to-many limits

Many-to-one limits

Duplicate behavior

Auto-confirm threshold

Manual-review threshold
```

---

# Amount Match

For ordinary same-currency BRL Transactions:

```text
Reference amount
=
Canonical Transaction amount
```

should generally be required for an exact match.

---

# Date Match

A date tolerance may account for:

- Posting delay.
- Weekend.
- Provider settlement.
- Time-zone conversion.

The tolerance must be bounded.

---

# Description Normalization

Description normalization may include:

- Case normalization.
- Whitespace normalization.
- Removal of approved punctuation.
- Known provider-prefix normalization.
- Accent normalization where appropriate.

Description similarity must not override amount, currency or Owner scope.

---

# Reference Identifier Match

A trusted external reference identifier is a strong match signal.

It must be:

- Source-scoped.
- Provider-scoped.
- Environment-scoped.
- Validated.
- Protected from replay.

---

# One-to-Many Search Limit

Combinatorial match search must use bounded limits.

The system must not attempt uncontrolled combinations across large Transaction sets.

---

# Match Uniqueness

A Transaction or reference record must not participate in conflicting active full matches.

---

# Match Conflict

A Match Conflict exists when:

- One Transaction is matched to multiple full reference records.
- One reference record is matched beyond its amount.
- Partial matches exceed the original amount.
- Currency differs.
- Owner or Account differs.
- Reconciliation periods conflict.

---

# Match Rejection

Rejected suggestions should remain available as non-authoritative analysis Evidence where useful.

---

# Manual Match Override

Overriding an automatic mismatch requires:

- Reason.
- Actor.
- Scope.
- Amount effect.
- Approval where required.
- Audit Evidence.

---

# Unmatched Nexio Transaction

A Nexio Transaction may remain unmatched because:

- It is absent from the statement.
- It falls outside the statement period.
- It is Pending.
- It is duplicated.
- It is incorrect.
- It belongs to another Account.
- Reference data is incomplete.

---

# Unmatched Reference Record

A reference record may remain unmatched because:

- The Transaction is missing from Nexio.
- Import failed.
- Date or amount differs.
- It represents a fee.
- It represents an external adjustment.
- It is duplicated.
- It belongs to another period.
- It is not a financial Transaction.

---

# Reconciliation Duplicate

A duplicate may exist in:

- Nexio Transactions.
- Reference records.
- Import rows.
- Provider callbacks.
- Reconciliation matches.

Duplicate classification is required before deletion or correction.

---

# Reconciliation Exclusion

A reference record may be excluded only through an approved reason.

Recommended reasons:

```text
OUTSIDE_PERIOD

NON_FINANCIAL_INFORMATION

DUPLICATE_REFERENCE

WRONG_ACCOUNT

PROVIDER_METADATA

AUTHORIZED_EXCEPTION
```

---

# Reconciliation Adjustment

An Adjustment should be used only when the difference represents a real approved financial correction.

It must not be used merely to make the difference equal zero without explanation.

---

# Adjustment Requirements

```text
□ Account is identified.

□ Owner is identified.

□ Amount is exact.

□ Currency matches.

□ Direction is explicit.

□ Effective date is defined.

□ Reason is defined.

□ Reconciliation is referenced.

□ Actor is identified.

□ Approval exists where required.

□ Audit Evidence exists.
```

---

# Adjustment Reason Codes

Recommended:

```text
MISSING_TRANSACTION

STATEMENT_FEE

CASH_COUNT_DIFFERENCE

OPENING_BALANCE_CORRECTION

PROVIDER_SETTLEMENT_DIFFERENCE

ROUNDING_DIFFERENCE_APPROVED

MIGRATION_CORRECTION

MANUAL_FINANCIAL_CORRECTION
```

---

# Unexplained Adjustment

`UNEXPLAINED_DIFFERENCE` should not be accepted as a normal permanent reason.

Material unexplained differences require investigation.

---

# Reconciliation Completion Preconditions

```text
□ Owner and Account are valid.

□ Currency matches.

□ Period is valid.

□ Opening reference balance exists.

□ Closing reference balance exists.

□ Reference source is identified.

□ All required records were loaded.

□ Match conflicts are resolved.

□ Duplicate records are classified.

□ Approved exclusions are recorded.

□ Adjustments are authorized.

□ Difference meets the approved completion rule.

□ Balance Snapshot is verified.

□ Audit Evidence is ready.
```

---

# Reconciliation Completion

Completion should:

- Mark approved Transactions as Reconciled.
- Preserve match records.
- Preserve unmatched approved exceptions.
- Preserve adjustments.
- Generate a Reconciliation Snapshot.
- Record closing values.
- Increment Account financial version where required.
- Generate Audit Evidence.
- Prevent silent editing.

---

# Reconciliation Snapshot

Recommended structure:

```text
ReconciliationSnapshot
 ├── reconciliationSnapshotId
 ├── reconciliationId
 ├── ownerId
 ├── accountId
 ├── period
 ├── currency
 ├── openingReferenceBalance
 ├── closingReferenceBalance
 ├── calculatedClosingBalance
 ├── difference
 ├── matchedAmount
 ├── unmatchedAmount
 ├── adjustmentAmount
 ├── policyVersion
 ├── financialDataVersion
 ├── contentHash
 ├── integrityState
 └── createdAt
```

---

# Reconciliation Snapshot Identifier

Recommended format:

```text
recsnap_<sortable-unique-identifier>
```

---

# Completed Reconciliation Immutability

A completed Reconciliation must not be silently edited.

Corrections require:

- Reopening.
- New Resource version.
- Reason.
- Authority.
- Recalculation.
- New completion snapshot.
- Preservation of the prior snapshot.

---

# Reconciliation Reopening

Reopening may be required when:

- A reconciled Transaction is corrected.
- A duplicate is discovered.
- A statement was incomplete.
- A backdated Transaction appears.
- An opening balance was incorrect.
- An Adjustment was invalid.
- A policy defect affected the result.

---

# Reopening Requirements

```text
□ Reconciliation exists.

□ Actor is authorized.

□ Reason is recorded.

□ Previous snapshot is preserved.

□ Affected Transactions are identified.

□ Affected reports are identified.

□ Recalculation is scheduled.

□ Audit Evidence is created.
```

---

# Reopened Transaction State

Transactions may move from Reconciled to Posted or a controlled `ReconciliationReview` state according to the policy.

The change must remain reconstructable.

---

# Consecutive Reconciliation Periods

For consecutive completed periods:

```text
Previous closing reference balance
=
Next opening reference balance
```

unless an explicit Account reset, migration or approved opening adjustment exists.

---

# Reconciliation Gap

A gap between completed periods should be visible.

Example:

```text
January completed

February not reconciled

March completed
```

March completion must define how February's unresolved state affects confidence.

---

# Reconciliation Overlap

Overlapping completed periods for the same Account should generally be prohibited unless the policy explicitly supports subperiod reconciliation.

---

# Reconciliation and Backdated Transactions

A backdated Transaction entering a completed period must:

- Identify affected Reconciliation.
- Mark the period for review.
- Invalidate or supersede affected snapshots.
- Recalculate difference.
- Preserve the original completion Evidence.
- Notify the Owner where appropriate.

---

# Reconciliation and Transfers

Both sides of an internal Transfer may be reconciled independently against their respective Account statements.

The canonical Transfer relationship must remain visible.

---

# Reconciliation and Currency Conversion

Cross-currency reconciliation must preserve:

- Source amount.
- Destination amount.
- Rate.
- Rate source.
- Settlement value.
- Fees.
- Rounding difference.
- Statement currency.

---

# Reconciliation and Pending Transactions

Pending Transactions should generally remain unreconciled until Posted.

The policy may allow statement-specific matching to a pending record, but final reconciliation state must remain explicit.

---

# Reconciliation Support View

Support may view safe information such as:

- Reconciliation state.
- Period.
- Difference status.
- Count of unmatched records.
- Safe error code.
- Reopen status.

Support must not perform unauthorized financial adjustments.

---

# Offline Financial Operations

Offline Android operations may create pending local financial intents.

They must not become authoritative financial state until synchronized and accepted by the backend.

---

# Offline Financial Intent

Recommended structure:

```text
OfflineFinancialIntent
 ├── offlineIntentId
 ├── ownerId
 ├── accountId
 ├── operationType
 ├── amount
 ├── currency
 ├── effectiveDate
 ├── clientCreatedAt
 ├── operationId
 ├── expectedResourceVersion
 ├── syncState
 └── clientVersion
```

---

# Offline Intent Identifier

Recommended format:

```text
ofin_<sortable-unique-identifier>
```

---

# Offline Financial States

Recommended:

```text
LocalPending

Syncing

Accepted

Rejected

Conflict

Duplicate

Cancelled
```

---

# Offline Amount Validation

The client should validate:

- Syntax.
- Scale.
- Currency.
- Basic range.

The backend must repeat authoritative validation.

---

# Offline Operation Identity

An offline mutation must create a stable operationId before Retry.

The same intent must preserve the same operationId across:

- App restart.
- Network Retry.
- Background Sync.
- Manual Retry.

---

# Offline Duplicate Prevention

The backend should use:

- operationId.
- idempotency key.
- Owner.
- Account.
- Resource identity.
- Expected Resource version.

---

# Offline Version Conflict

A version conflict may occur when the Resource changed on another Device.

The system must not silently overwrite the newer financial state.

---

# Offline Conflict Resolution

Potential outcomes include:

```text
Accept as new Transaction

Reject stale edit

Require Owner review

Merge non-financial fields only

Create corrected Transaction

Cancel local intent
```

Financial amounts must not be merged automatically without an approved rule.

---

# Offline Time

Client-created time is not necessarily authoritative.

The system should preserve:

```text
clientCreatedAt

serverReceivedAt

effectiveDate

postedAt
```

---

# Offline Future and Backdated Dates

The backend must validate effective dates independently from the client clock.

---

# Offline Projection

Unsynchronized local intents may appear in a local provisional projection.

They must be clearly labeled as:

```text
Pending synchronization
```

They must not alter the verified backend Current Balance.

---

# Synchronization Acceptance

After backend acceptance:

- Create or update canonical Resource.
- Assign server Resource version.
- Create Balance Event.
- Recalculate affected summaries.
- Return canonical result.
- Mark local intent Accepted.
- Preserve operation identity.

---

# Synchronization Rejection

A rejection should provide a safe reason code.

Examples:

```text
ACCOUNT_NOT_AVAILABLE

OWNER_SCOPE_INVALID

CURRENCY_MISMATCH

AMOUNT_INVALID

RESOURCE_VERSION_CONFLICT

DUPLICATE_OPERATION

FEATURE_DISABLED

RECONCILIATION_LOCKED
```

---

# Financial Concurrency

Financial mutations require concurrency control.

Potential mechanisms include:

- Optimistic Resource version.
- Database row lock.
- Serializable transaction.
- Account financial sequence.
- Idempotency record.
- Operation lock.

---

# Optimistic Concurrency

A mutation should include:

```text
expectedResourceVersion
```

A stale version must produce a conflict rather than silent overwrite.

---

# Account-Level Concurrency

Operations affecting Account balance may require Account-level sequencing or locking.

Examples:

- Transfer.
- Opening Balance correction.
- Reconciliation completion.
- Account closure.
- Bulk Import.
- Balance policy migration.

---

# Deadlock Handling

Database deadlock Retry must preserve operationId and idempotency.

It must not duplicate the financial mutation.

---

# Queue Redelivery

Background financial processing must assume at-least-once delivery unless stronger guarantees exist.

Consumers must remain idempotent.

---

# Financial Correction Architecture

Financial correction addresses incorrect canonical state while preserving history.

Recommended correction methods:

```text
Resource Version Correction

Reversal and Replacement

Adjustment

Reconciliation Adjustment

Migration Correction

Provider Compensation
```

---

# Resource Version Correction

Appropriate when preserving one logical Transaction with explicit version history.

The calculation layer must account for the active financial version correctly.

---

# Reversal and Replacement

Appropriate when the original Posted effect should be neutralized and replaced.

Example:

```text
Original Expense:
R$ 100,00

Reversal:
R$ 100,00 credit

Corrected Expense:
R$ 80,00 debit
```

Net correction:

```text
Original net:
-R$ 100,00

Corrected net:
-R$ 80,00
```

---

# Adjustment Correction

Appropriate when the current balance requires an explicit additional financial effect rather than replacement of one source Transaction.

---

# Migration Correction

Appropriate when a controlled migration produced or discovered a systematic financial difference.

It must identify:

- Migration.
- Affected Owners.
- Affected Accounts.
- Original policy.
- Correct policy.
- Difference.
- Correction operation.
- Verification.

---

# Provider Compensation

Appropriate when an external provider completed an effect that Nexio must represent or compensate.

Provider state must be independently verified.

---

# Correction Record

Recommended structure:

```text
FinancialCorrection
 ├── correctionId
 ├── ownerId
 ├── accountId
 ├── correctionType
 ├── originalResourceIds
 ├── resultingResourceIds
 ├── amountDifference
 ├── currency
 ├── reason
 ├── requestedBy
 ├── approvedBy
 ├── operationId
 ├── state
 ├── createdAt
 └── completedAt
```

---

# Correction Identifier

Recommended format:

```text
fcorr_<sortable-unique-identifier>
```

---

# Correction States

Recommended:

```text
Draft

Reviewing

Approved

Executing

Completed

Failed

Cancelled

Reversed
```

---

# Correction Approval

High-impact correction may require:

- Financial owner.
- Security review.
- Privacy review.
- Operations review.
- Incident reference.
- Owner communication.
- Reconciliation reopening.

---

# Correction Idempotency

A correction Retry must preserve the same operationId.

---

# Correction Verification

After correction:

- Recalculate Account balance.
- Recalculate affected periods.
- Recalculate Budgets.
- Recalculate Goals where linked.
- Recalculate reconciliation.
- Verify Transfers.
- Compare snapshots.
- Generate Audit Evidence.

---

# Financial Data Integrity Checks

Recommended checks include:

```text
Transaction currency matches Account.

Transaction amount scale is valid.

Posted Transaction has Balance Event.

Transfer has both sides.

Transfer sides share operationId.

Reversal references original Resource.

Refund does not exceed approved original amount.

Goal contributions sum correctly.

Budget totals reconcile with included Transactions.

Reconciliation difference is reproducible.

Snapshots match canonical Events.

Owner scope is consistent.
```

---

# Refund Limit

Total linked Refunds should not exceed the original eligible Expense unless policy explicitly allows an over-refund adjustment.

---

# Reversal Limit

A Transaction should not be reversed more than its remaining unreversed financial effect.

---

# Transfer Side Integrity

For same-currency principal without fees:

```text
Absolute source principal
=
Destination principal
```

---

# Financial Orphan Detection

Potential orphans include:

- Balance Event without source Transaction.
- Transfer Debit without Transfer.
- Transfer Credit without Transfer.
- Reversal without original Transaction.
- Goal contribution without Goal.
- Reconciliation Match without active records.
- Budget Snapshot without Budget.
- Imported Transaction without Import relationship where required.

---

# Financial Duplicate Detection

Potential duplicates include:

- Same operationId.
- Same idempotency key.
- Same external reference.
- Same recurring occurrence.
- Same Import row hash.
- Same provider callback.
- Same Balance Event sequence.
- Same correction execution.

---

# Financial Consistency States

Recommended:

```text
Consistent

ConsistentWithExpectedDifference

NeedsRecalculation

NeedsReconciliation

Inconsistent

IntegrityUnknown
```

---

# Consistent State

Canonical Events, snapshots and reported totals agree.

---

# Consistent-With-Expected-Difference

A documented policy migration, approved timing difference or known projection difference explains the variation.

---

# Needs-Recalculation

Canonical records appear valid, but derived summaries are stale.

---

# Needs-Reconciliation

Canonical records are internally valid, but external reference consistency has not been established.

---

# Inconsistent State

Canonical records conflict materially.

---

# Integrity-Unknown State

Required records or verification are unavailable.

---

# Financial Calculation Monitoring

Monitor:

```text
Calculation success

Calculation failure

Overflow

Currency mismatch

Policy mismatch

Snapshot mismatch

Balance difference

Transfer partial completion

Duplicate operation

Missing Balance Event

Reconciliation difference

Backdated mutation

Correction failure
```

---

# Calculation Metrics

Recommended:

```text
financial_calculation_success_rate

financial_calculation_latency

financial_calculation_failure_count

financial_calculation_overflow_count

financial_policy_resolution_failure_count

financial_currency_mismatch_count

financial_snapshot_stale_count

financial_snapshot_mismatch_count
```

---

# Balance Metrics

```text
balance_recalculation_count

balance_recalculation_difference_count

unexplained_balance_difference_count

balance_cache_owner_scope_violation_count

missing_balance_event_count

financial_sequence_gap_count
```

---

# Transfer Metrics

```text
transfer_success_rate

transfer_failure_rate

transfer_partial_completion_count

transfer_duplicate_attempt_count

transfer_compensation_count

transfer_reversal_failure_count
```

---

# Reconciliation Metrics

```text
reconciliation_started_count

reconciliation_completed_count

reconciliation_difference_count

reconciliation_reopened_count

unmatched_reference_record_count

unmatched_transaction_count

reconciliation_adjustment_count

reconciliation_completion_time
```

---

# Budget Metrics

```text
budget_calculation_failure_count

budget_snapshot_stale_count

budget_currency_mismatch_count

budget_overconsumption_count
```

---

# Goal Metrics

```text
goal_calculation_failure_count

goal_negative_balance_attempt_count

goal_contribution_duplicate_count

goal_snapshot_mismatch_count
```

---

# Recurring Transaction Metrics

```text
recurring_instance_generation_success_rate

recurring_instance_duplicate_count

recurring_instance_failure_count

recurring_instance_skipped_count

recurring_schedule_drift_count
```

---

# Import Financial Metrics

```text
import_amount_parse_failure_count

import_currency_mismatch_count

import_preview_canonical_difference_count

import_duplicate_candidate_count

import_partial_completion_count
```

---

# Critical Financial Alerts

Trigger immediately for:

```text
Cross-Owner financial calculation

Transfer Posted with one missing side

Unexplained Account balance mutation

Financial overflow in authoritative operation

Duplicate financial mutation

Posted Transaction missing required Balance Event

Unauthorized financial correction

Reconciliation completed with unexplained difference

Financial policy changed without approval

Snapshot marked verified despite failed integrity
```

---

# High Financial Alerts

Potential High alerts include:

```text
Repeated balance snapshot mismatch

Partial Transfer completion

Reconciliation difference after completion

Backdated mutation in completed reconciliation

Financial sequence gap

Migration comparison difference

Correction execution failure

Import accepted total mismatch
```

---

# Calculation and Reconciliation Acceptance Criteria

The Calculation Engine and Reconciliation architecture are accepted only when:

1. A shared authoritative Calculation Engine exists.

2. Android and Web do not define independent authoritative financial formulas.

3. Every material calculation has a controlled calculation type.

4. Every material calculation can identify its policy version.

5. Every material calculation can identify its financial-data version.

6. Every material calculation identifies Owner scope.

7. Every Account calculation identifies Account scope.

8. Every calculation validates currency.

9. Every calculation validates date range.

10. Every calculation validates reporting time zone.

11. Every calculation validates supported states.

12. Every calculation uses a consistent data boundary.

13. Every calculation result has an explicit state.

14. Failed calculations are not presented as verified values.

15. Inconsistent calculations preserve the inconsistency.

16. Incomplete calculations are not presented as complete.

17. Monetary overflow produces a controlled failure.

18. Calculation warnings use controlled codes.

19. Financial policies are registered.

20. Financial policies have stable identifiers.

21. Financial policies are versioned.

22. Historical policies remain readable.

23. Policy effective periods are explicit.

24. Policy migrations distinguish prospective and historical effects.

25. Input parsing uses explicit locale rules.

26. pt-BR monetary input is converted to canonical decimal representation.

27. Formatted monetary strings are not authoritative.

28. Ambiguous monetary input is not guessed.

29. Invalid input is not converted silently to zero.

30. Excess decimal places are not silently rounded unless policy explicitly allows it.

31. Canonical aggregation uses exact arithmetic.

32. Empty valid aggregation returns a known zero.

33. Empty valid aggregation remains distinct from failure.

34. Null remains distinct from zero.

35. Every calculation defines its inclusion matrix.

36. Every balance type defines included Transaction states.

37. Every report defines effective-date boundaries.

38. Every financial period defines time zone.

39. Financial sequence behavior is documented.

40. Sequence gaps are detectable where required.

41. Calculation Snapshots have stable identifiers.

42. Calculation Snapshots preserve policy version.

43. Calculation Snapshots preserve data version.

44. Calculation Snapshots preserve integrity metadata.

45. Stale snapshots are identifiable.

46. Invalid snapshots are not presented as current.

47. Snapshot invalidation triggers are defined.

48. Balance Events have stable identifiers.

49. Every Balance Event identifies source Resource.

50. Every Balance Event identifies Owner and Account.

51. Every Balance Event identifies signed amount and currency.

52. Balance Events use controlled states.

53. Balance Events cannot exist without approved source or adjustment authority.

54. Full Balance rebuild is deterministic.

55. Incremental Balance update validates sequence continuity.

56. Invalid incremental updates fall back to rebuild.

57. Balance verification compares canonical Events and snapshots.

58. Account-type-specific semantics are registered.

59. Credit Account values do not reuse ordinary cash formulas incorrectly.

60. Investment valuation is not activated without a separate approved model.

61. Cash Inflow is formally defined.

62. Cash Outflow is formally defined.

63. Net Cash Flow is formally defined.

64. Internal Transfers do not change Owner-wide net Cash Flow.

65. Single-Account Transfers remain visible as Transfers.

66. Income totals exclude internal Transfer Credits.

67. Expense totals exclude internal Transfer Debits.

68. Gross and net values remain distinguishable.

69. Period comparison defines zero-denominator behavior.

70. Category totals preserve overall financial totals.

71. Uncategorized Transactions remain visible.

72. Category reclassification does not alter overall amount.

73. Category hierarchies do not double count.

74. Every Budget has a stable identifier.

75. Every Budget identifies Owner.

76. Every Budget identifies currency.

77. Every Budget defines amount and period.

78. Budget consumption uses approved eligible Transactions.

79. Budget Remaining is reproducible.

80. Budget Overspending is reproducible.

81. Budget Usage Percentage is reproducible.

82. Budget denominator cannot be zero.

83. Refund treatment is explicit.

84. Reversal treatment is explicit.

85. Internal Transfers do not consume ordinary spending Budgets.

86. Budget currency mismatch is rejected or explicitly converted.

87. Budget category overlap does not double count.

88. Budget Snapshots preserve data and policy versions.

89. Budget updates preserve history.

90. Budget scope changes have explicit historical behavior.

91. Every Goal has a stable identifier.

92. Every Goal identifies Owner and currency.

93. Goal Target Amount is greater than zero.

94. Goal Current Amount is derived from contribution Events.

95. Goal Remaining Amount is reproducible.

96. Goal Excess Amount is reproducible.

97. Goal Progress Percentage is reproducible.

98. Goal withdrawals use explicit Events.

99. Goal amount removal does not edit aggregates silently.

100. Goal completion behavior is explicit.

101. Goal reopening behavior is explicit.

102. Informational Goals do not imply money is reserved physically.

103. Every Recurring Transaction has a stable identifier.

104. Every Recurring Transaction has an explicit schedule.

105. Every recurring schedule has an explicit time zone.

106. End-of-month behavior is defined.

107. Leap-year behavior is defined.

108. Every recurring occurrence has a stable instance identity.

109. One occurrence creates at most one canonical Transaction.

110. Recurring Retry is idempotent.

111. Template updates do not rewrite Posted instances.

112. Pause behavior is explicit.

113. Resume behavior is explicit.

114. Skipped occurrences remain represented.

115. Recurring projections remain distinct from Posted Transactions.

116. Every Projection has a defined horizon.

117. Projected values remain separate from Current Balance.

118. Projection confidence is explicit.

119. Cancelled and duplicated schedules are excluded.

120. Import source files receive hashes.

121. Import amount parsing is locale-aware.

122. Import parsing preserves exact amounts.

123. Import preview totals are provisional.

124. Import accepted totals use persisted canonical Transactions.

125. Import rejected totals are classified.

126. Partial Imports identify accepted and rejected rows.

127. Import duplicate detection is versioned.

128. Import row hashes preserve normalization version.

129. Duplicate candidates are not automatically deleted.

130. Successful Import financial totals equal canonical created totals.

131. Financial Exports use canonical financial definitions.

132. Exports preserve calculation-policy version.

133. Exports preserve financial-data version.

134. Exports define decimal and delimiter formats.

135. Exports remain reproducible.

136. Dashboard values use the shared Calculation Engine.

137. Chart points reconcile with report totals.

138. Number abbreviation does not change the underlying amount.

139. Every Reconciliation has a stable identifier.

140. Every Reconciliation identifies Owner and Account.

141. Every Reconciliation identifies currency.

142. Every Reconciliation defines period and time zone.

143. Reconciliation states are controlled.

144. Draft Reconciliation does not mark Transactions as Reconciled.

145. Completed Reconciliation preserves an immutable snapshot.

146. Opening Reference Balance is explicit.

147. Closing Reference Balance is explicit.

148. Calculated Closing Balance is reproducible.

149. Reconciliation Difference has a formal formula.

150. Ordinary BRL reconciliation requires exact approved equality.

151. Nonzero tolerance requires explicit justification.

152. Reference sources are identified.

153. Reference Records have stable identifiers.

154. Reconciliation Matches have stable identifiers.

155. Match types are controlled.

156. Exact one-to-one matching validates currency and amount.

157. One-to-many matching validates exact approved sum.

158. Many-to-one matching validates exact approved sum.

159. Partial matching preserves unmatched remainder.

160. Manual matching requires authority.

161. Suggested matches are not final automatically unless policy permits.

162. Automatic-match rules are versioned.

163. Amount tolerance is explicit.

164. Date tolerance is bounded.

165. Description similarity does not override currency or Owner scope.

166. Match combinations are computationally bounded.

167. Transactions cannot participate in conflicting full matches.

168. Match conflicts block completion.

169. Unmatched Nexio Transactions remain visible.

170. Unmatched reference records remain visible.

171. Reconciliation duplicates are classified.

172. Exclusions use approved reason codes.

173. Adjustments require exact amount and reason.

174. Adjustments cannot be used to hide unexplained differences.

175. Completion preconditions are validated.

176. Completed Reconciliation marks eligible Transactions correctly.

177. Completed Reconciliation preserves matches and exceptions.

178. Reconciliation Snapshots have stable identifiers.

179. Reconciliation Snapshots preserve data and policy versions.

180. Completed Reconciliations are not silently edited.

181. Reopening preserves the previous completion snapshot.

182. Reopening requires reason and authority.

183. Consecutive periods verify balance continuity.

184. Reconciliation gaps remain visible.

185. Unsupported overlapping periods are prohibited.

186. Backdated Transactions invalidate affected reconciliation state.

187. Both Transfer sides may reconcile independently while preserving Transfer identity.

188. Cross-currency reconciliation preserves rate and settlement data.

189. Pending Transactions do not become Reconciled silently.

190. Support cannot create unauthorized adjustments.

191. Offline financial intents remain provisional.

192. Offline intents use stable operation identity.

193. Offline Retry does not duplicate financial state.

194. Backend validation repeats client monetary validation.

195. Offline conflicts do not silently overwrite newer financial state.

196. Client and server timestamps remain distinct.

197. Unsynchronized local values do not alter verified Current Balance.

198. Synchronization acceptance returns canonical Resource version.

199. Synchronization rejection uses controlled reasons.

200. Financial mutations use concurrency control.

201. Database deadlock Retry preserves idempotency.

202. Queue redelivery does not duplicate financial mutations.

203. Financial corrections use governed methods.

204. Corrections preserve original Resources.

205. Reversal and Replacement preserve all financial effects.

206. Adjustments remain explicit financial Events.

207. Migration corrections identify affected scope.

208. Provider compensation requires verified provider state.

209. Financial Corrections have stable identifiers.

210. Correction approval reflects impact.

211. Correction Retry is idempotent.

212. Correction completion recalculates affected balances.

213. Correction completion recalculates affected Budgets.

214. Correction completion recalculates linked Goals.

215. Correction completion reevaluates reconciliation.

216. Transaction currency integrity is monitored.

217. Posted Transactions require Balance Events.

218. Posted Transfers require both sides.

219. Reversals reference original Resources.

220. Refunds do not exceed approved original value without explicit policy.

221. Goal contribution sums are verifiable.

222. Budget totals reconcile with eligible Transactions.

223. Reconciliation difference is independently reproducible.

224. Snapshots reconcile with canonical Events.

225. Financial orphan records are detectable.

226. Financial duplicates are detectable.

227. Financial consistency states are explicit.

228. Needs-Recalculation remains distinct from Inconsistent.

229. Needs-Reconciliation remains distinct from internal inconsistency.

230. Financial calculation monitoring is active.

231. Balance-difference monitoring is active.

232. Transfer partial-completion monitoring is active.

233. Reconciliation-difference monitoring is active.

234. Budget and Goal calculation monitoring is active.

235. Recurring generation monitoring is active.

236. Import financial equality is monitored.

237. Critical financial alerts are defined.

238. Cross-Owner financial calculation is treated as Critical.

239. One-sided Posted Transfer is treated as Critical.

240. Unexplained balance mutation is treated as Critical.

241. Duplicate financial mutation is treated as Critical.

242. Unauthorized financial correction is treated as Critical.

243. Reconciliation cannot complete with an unexplained difference.

244. Financial-policy changes require approval.

245. Verified snapshots cannot have failed integrity.

246. Backdated mutations in completed periods trigger review.

247. Financial migration differences block progression.

248. Every financial calculation remains traceable to canonical Resources.

249. Every financial result remains traceable to a policy version.

250. Every authoritative financial result can be independently reproduced.

---

# Calculation and Reconciliation Rule

A financial calculation is not trustworthy merely because the formula is mathematically valid.

It is trustworthy only when Nexio can establish:

```text
The canonical Owner and Account scope

The exact Money representation

The currency

The applicable Resource states

The effective-date boundaries

The reporting time zone

The signed financial deltas

The Transfer treatment

The refund and reversal treatment

The calculation-policy version

The financial-data version

The rounding stage

The resulting amount

The Evidence required to reproduce the result
```

A Reconciliation is not complete merely because an Actor selected a completion action.

It is complete only when:

```text
The reference source is identified.

The opening and closing reference balances are known.

The included Nexio Transactions are known.

The matched and unmatched records are known.

Duplicates and exclusions are classified.

Adjustments are authorized.

The calculated difference satisfies the approved policy.

The completion snapshot is preserved.

The result can be independently reconstructed.
```

When financial records are incomplete, duplicated, inconsistent, partially processed, unsupported, unreconciled or unverifiable, Nexio must preserve the original Resources and return an explicit uncertainty state.

Nexio must never invent a Transaction, suppress a difference, round an unexplained value, delete financial history or create an unauthorized Adjustment merely to make a total appear correct.


# Financial Governance Architecture

Financial calculations, balances, Transfers, adjustments, projections, Budgets, Goals, imports, exports and reconciliation are governed Platform capabilities.

They must not be treated as independent interface formulas or isolated database queries.

Governance applies to:

```text
Money representation

Currency metadata

Decimal precision

Rounding policies

Calculation policies

Balance formulas

Transaction states

Transfer semantics

Adjustment authority

Reversal behavior

Budget calculations

Goal calculations

Recurring Transaction generation

Projection formulas

Import totals

Export totals

Reconciliation rules

Financial snapshots

Financial caches

Correction workflows

Migration comparisons

Financial Audit Evidence
```

The governance lifecycle is:

```text
Financial Need Identified

↓

Canonical Financial Meaning Defined

↓

Policy and Formula Proposed

↓

Precision and Rounding Defined

↓

Security, Privacy and Financial Review

↓

Implementation

↓

Independent Verification

↓

Controlled Activation

↓

Monitoring

↓

Periodic Review

↓

Migration or Correction

↓

Retirement
```

---

# Financial Governance Objectives

The Nexio Financial governance program shall ensure:

```text
Every monetary field has one meaning.

Every balance has one documented formula.

Every calculation references an approved policy.

Every rounding operation is explicit.

Every balance-affecting operation is idempotent.

Every Transfer preserves both sides.

Every correction preserves history.

Every reconciliation difference is explainable.

Every financial snapshot is reproducible.

Every cross-platform value is consistent.

Every unexplained difference is investigated.
```

---

# Financial Governance Principles

The Financial governance model is based on:

```text
Exact Representation

Single Source of Financial Truth

Versioned Policies

Deterministic Formulas

Explicit State

Explicit Currency

Explicit Time Boundaries

Atomic Mutation

Idempotent Processing

Owner Isolation

Reconstructability

Controlled Correction

Independent Verification
```

---

# Single Source of Financial Truth

Canonical financial Resources and approved Balance Events are the authoritative source of financial state.

The following must not become independent financial authorities:

- Dashboard cards.
- Client caches.
- Chart datasets.
- Analytics aggregates.
- Export previews.
- Support summaries.
- Database materialized views.
- Balance snapshots.
- Provider dashboards.
- AI summaries.

Derived values must remain reproducible from canonical financial Resources.

---

# Financial Governance Roles

Recommended governance roles include:

```text
Financial Product Owner

Financial Domain Owner

Money and Precision Owner

Calculation Engine Owner

Balance Owner

Transaction Owner

Transfer Owner

Budget Owner

Goal Owner

Recurring Transaction Owner

Projection Owner

Import Financial Owner

Export Financial Owner

Reconciliation Owner

Financial Data Owner

Financial Audit Owner

Security Reviewer

Privacy Reviewer

Database Owner

Android Owner

Web Owner

Backend Owner

Operations Owner

Support Readiness Owner

Release Manager
```

One individual may hold multiple responsibilities.

The responsibilities must remain explicit.

---

# Financial Product Owner

The Financial Product Owner is responsible for:

- Owner-facing financial meaning.
- Balance labels.
- Dashboard totals.
- Cash Flow presentation.
- Budget semantics.
- Goal semantics.
- Reconciliation experience.
- Financial Help content.
- Product acceptance criteria.

---

# Financial Domain Owner

The Financial Domain Owner is responsible for:

- Canonical financial models.
- Financial invariants.
- Transaction states.
- Transfer semantics.
- Adjustment rules.
- Correction architecture.
- Policy Registry.
- Financial terminology.
- Final financial authority.

---

# Money and Precision Owner

The Money and Precision Owner is responsible for:

- Money representation.
- Decimal precision.
- Currency metadata.
- Rounding policies.
- Allocation rules.
- Overflow limits.
- Serialization.
- Cross-platform monetary consistency.

---

# Calculation Engine Owner

The Calculation Engine Owner is responsible for:

- Authoritative formulas.
- Calculation input contracts.
- Policy resolution.
- Deterministic aggregation.
- Calculation metadata.
- Recalculation.
- Snapshot generation.
- Calculation test coverage.

---

# Balance Owner

The Balance Owner is responsible for:

- Current Balance.
- Available Balance.
- Pending Balance.
- Projected Balance.
- Reconciled Balance.
- Historical balances.
- Balance Snapshots.
- Balance rebuild.
- Balance verification.

---

# Transaction Owner

The Transaction Owner is responsible for:

- Transaction types.
- Transaction states.
- Transaction mutation.
- Effective-date behavior.
- Posted-state behavior.
- Deletion.
- Restoration.
- Refunds.
- Reversals.

---

# Transfer Owner

The Transfer Owner is responsible for:

- Source and destination effects.
- Transfer atomicity.
- Transfer fees.
- Cross-currency behavior.
- Partial completion.
- Compensation.
- Reversal.
- Reconciliation.

---

# Budget Owner

The Budget Owner is responsible for:

- Budget scope.
- Budget periods.
- Included Transaction states.
- Refund treatment.
- Transfer treatment.
- Budget progress.
- Budget Snapshot behavior.

---

# Goal Owner

The Goal Owner is responsible for:

- Goal targets.
- Contributions.
- Withdrawals.
- Goal progress.
- Goal completion.
- Goal reopening.
- Linked Account and Transaction behavior.

---

# Recurring Transaction Owner

The Recurring Transaction Owner is responsible for:

- Schedule semantics.
- Time zones.
- End-of-month behavior.
- Leap-year behavior.
- Generation idempotency.
- Pause and resume.
- Projection integration.

---

# Import Financial Owner

The Import Financial Owner is responsible for:

- Amount parsing.
- Locale parsing.
- Currency parsing.
- Preview totals.
- Accepted totals.
- Duplicate detection.
- Financial equality.
- Import reconciliation.

---

# Export Financial Owner

The Export Financial Owner is responsible for:

- Exported precision.
- Exported currencies.
- Export formulas.
- Date boundaries.
- Reproducibility.
- Policy and data-version references.

---

# Reconciliation Owner

The Reconciliation Owner is responsible for:

- Reconciliation states.
- Reference sources.
- Match rules.
- Difference formulas.
- Adjustments.
- Completion.
- Reopening.
- Reconciliation Snapshots.

---

# Financial Data Owner

The Financial Data Owner is responsible for:

- Canonical financial storage.
- Resource versions.
- Balance Events.
- Financial sequences.
- Snapshot integrity.
- Migration.
- Backup and restore.

---

# Financial Audit Owner

The Financial Audit Owner is responsible for:

- Financial Event Types.
- Financial Evidence.
- Calculation reconstruction.
- Correction Evidence.
- Reconciliation Evidence.
- Investigation support.
- Financial Incident Evidence.

---

# Financial Responsibility Matrix

| Capability | Product | Financial Domain | Security | Privacy | Database | Operations | Release |
|---|---|---|---|---|---|---|---|
| Money representation | Required | Required | As applicable | As applicable | Required | As applicable | Required |
| Balance formulas | Required | Required | Required | Required | Required | Required | Required |
| Transfer semantics | Required | Required | Required | Required | Required | Required | Required |
| Financial policies | Required | Required | Required | Required | Required | Required | Required |
| Reconciliation | Required | Required | Required | Required | Required | Required | Required |
| Corrections | Required | Required | Required | Required | Required | Required | Required |
| Snapshots | As applicable | Required | Required | Required | Required | Required | Required |
| Financial migrations | Required | Required | Required | Required | Required | Required | Required |

---

# Financial Policy Governance

Every material financial rule must exist in the Financial Policy Registry.

A financial policy must define:

```text
Stable policy identifier

Stable policy key

Purpose

Policy type

Version

Effective period

Supported currencies

Supported Account types

Included Resource states

Excluded Resource states

Formula

Precision

Rounding

Time-zone behavior

Migration behavior

Rollback behavior

Monitoring

Owner
```

---

# Financial Policy Types

Recommended policy types include:

```text
Money Representation

Currency Precision

Rounding

Balance Inclusion

Available Balance

Projection

Transfer

Refund

Reversal

Budget Consumption

Goal Progress

Recurring Generation

Import Parsing

Export Calculation

Reconciliation Matching

Reconciliation Completion

Financial Correction
```

---

# Policy Activation Requirements

```text
□ Policy identifier exists.

□ Policy key is stable.

□ Purpose is documented.

□ Formula is documented.

□ Input Resources are documented.

□ Included states are documented.

□ Excluded states are documented.

□ Currency behavior is documented.

□ Precision is documented.

□ Rounding is documented.

□ Time-zone behavior is documented.

□ Error behavior is documented.

□ Migration behavior is documented.

□ Monitoring exists.

□ Test vectors exist.

□ Required approvals are complete.
```

---

# Financial Formula Governance

Every financial formula must identify:

```text
Inputs

Input states

Input currencies

Signs

Operations

Intermediate precision

Rounding stage

Output precision

Output state

Error conditions
```

---

# Formula Identifier

Recommended format:

```text
FORMULA-<DOMAIN>-<NUMBER>
```

Examples:

```text
FORMULA-BALANCE-001

FORMULA-CASHFLOW-002

FORMULA-BUDGET-004

FORMULA-RECONCILIATION-003
```

---

# Formula Test Vector

Every material formula should have test vectors.

Example:

```text
Formula:
Current Balance

Opening Balance:
R$ 1.000,00

Income:
R$ 500,00

Expense:
R$ 120,00

Transfer Debit:
R$ 200,00

Transfer Credit:
R$ 100,00

Expected Current Balance:
R$ 1.280,00
```

---

# Boundary Test Vectors

Test vectors must include:

- Zero.
- Minimum value.
- Maximum supported value.
- One cent.
- Negative signed delta.
- Large aggregation.
- Empty aggregation.
- Reversal.
- Partial refund.
- Backdated Transaction.
- Future Transaction.
- Currency mismatch.
- Overflow.

---

# Rounding Governance

Every approved rounding policy should define:

```text
roundingPolicyId

currency

inputScale

intermediateScale

outputScale

roundingMode

roundingStage

allocationRule

remainderRule

effectiveFrom

version
```

---

# Rounding Policy Identifier

Recommended format:

```text
ROUNDING-<CURRENCY>-<NUMBER>
```

Example:

```text
ROUNDING-BRL-001
```

---

# Rounding Change Governance

Changing a rounding rule may affect:

- Balances.
- Budget progress.
- Goal progress.
- Currency conversion.
- Allocation.
- Reconciliation.
- Exports.
- Historical reports.

A rounding change requires:

- New policy version.
- Historical comparison.
- Impact analysis.
- Migration decision.
- Test vectors.
- Rollback.
- Audit Evidence.

---

# Financial State Governance

Canonical financial states must remain controlled.

Unknown custom states must not be introduced without policy approval.

---

# Transaction State Transition Matrix

A state-transition matrix should define approved transitions.

Example:

| Current State | Target State | Allowed |
|---|---|---:|
| Draft | Scheduled | Yes |
| Draft | Posted | Yes |
| Scheduled | Posted | Yes |
| Scheduled | Cancelled | Yes |
| Pending | Posted | Yes |
| Pending | Failed | Yes |
| Posted | Reconciled | Yes |
| Posted | Reversed | Through Reversal |
| Reconciled | Posted | Through Reconciliation Reopen |
| Posted | Cancelled | No |
| Reconciled | Deleted | No |

---

# Invalid State Transition

An invalid state transition must:

- Be rejected.
- Preserve current Resource state.
- Return a controlled error.
- Generate Security or operational Evidence where material.
- Avoid balance mutation.

---

# Financial Mutation Governance

Every balance-affecting mutation should have:

```text
operationId

idempotencyKeyReference

Actor

Owner

Account

Resource

Expected Resource version

Policy version

Exact monetary effect

Audit reference
```

---

# Financial Mutation Authority

A financial mutation must pass:

```text
Authentication

↓

Authorization

↓

Owner resolution

↓

Account validation

↓

Resource-version validation

↓

Financial-policy validation

↓

Money and currency validation

↓

Idempotency validation

↓

Atomic persistence

↓

Audit Evidence
```

---

# Financial Idempotency Registry

Material operations may use an Idempotency Registry.

Recommended fields:

```text
idempotencyRecordId

operationId

idempotencyKeyHash

ownerId

accountId

operationType

requestHash

state

resultResourceIds

createdAt

completedAt

expiresAt
```

---

# Idempotency States

Recommended:

```text
Received

Processing

Succeeded

FailedRetryable

FailedFinal

Conflict

Expired
```

---

# Idempotency Conflict

A conflict exists when the same idempotency key is reused with a materially different request.

The system must:

- Reject the new request.
- Preserve the original result.
- Record the conflict.
- Avoid duplicate financial mutation.

---

# Financial Locking Governance

Locking must be applied only at the necessary boundary.

Potential lock scopes include:

- Transaction.
- Account.
- Transfer.
- Reconciliation.
- Import.
- Financial migration.

Excessive global locking should be avoided.

---

# Account Financial Sequence Governance

An Account financial sequence may provide ordering and snapshot verification.

Sequence allocation must occur within the authoritative financial transaction where required.

---

# Transfer Governance

Every Transfer policy must define:

```text
Source Account eligibility

Destination Account eligibility

Owner relationship

Currency behavior

Fee behavior

Atomicity

Pending behavior

Failure behavior

Compensation

Reversal

Reconciliation

Audit Evidence
```

---

# Same-Owner Transfer

A same-Owner Transfer must preserve:

- Source Account ownership.
- Destination Account ownership.
- One logical operation.
- Two Account effects.
- Zero Owner-wide principal net effect.

---

# Cross-Owner Transfer

Cross-Owner Transfers must not be activated through ordinary internal Transfer logic unless a separately approved financial and Authorization model exists.

---

# Transfer Partial Completion Governance

A `PartiallyCompleted` Transfer is exceptional.

It requires:

- Immediate alert.
- Automatic bounded compensation where safe.
- Reconciliation.
- Owner-impact assessment.
- Incident classification.
- No completed status presentation.

---

# Transfer Compensation

Compensation should:

- Reference the original Transfer.
- Preserve original effects.
- Create explicit compensating effects.
- Use a stable compensation operationId.
- Remain idempotent.
- Generate Audit Evidence.

---

# Transfer Fee Governance

Transfer fees must not be hidden in the principal amount.

The model must identify:

```text
Principal

Fee

Source impact

Destination impact

Fee category

Fee provider

Currency
```

---

# Refund Governance

Refund rules must define:

- Eligible original Transaction types.
- Maximum refundable amount.
- Partial refund behavior.
- Multiple refund behavior.
- Currency.
- Effective date.
- Budget effect.
- Reconciliation effect.
- Reversal relationship.

---

# Refund Remaining Amount

Conceptual formula:

```text
Remaining Refundable Amount
=
Original Eligible Amount
-
Σ Posted Linked Refunds
```

---

# Over-Refund

An over-refund must be rejected unless an approved adjustment policy explicitly permits a greater credit.

---

# Reversal Governance

A Reversal must:

- Reference the original financial Resource.
- Use the opposite signed effect.
- Preserve currency.
- Preserve policy reference.
- Preserve Actor and reason.
- Prevent repeated excess reversal.
- Update affected snapshots.
- Update affected reconciliation.

---

# Partial Reversal

A partial Reversal may be supported only when the remaining unreversed amount is tracked exactly.

---

# Deletion Governance

Financial deletion must distinguish:

```text
Resource visibility removal

Financial-effect removal

Retention deletion
```

These are different operations.

---

# Visibility Removal

A Transaction may be hidden or archived from ordinary views while remaining financially and historically preserved.

---

# Financial-Effect Removal

A posted financial effect may be removed only through:

- Reversal.
- Adjustment.
- Controlled correction.
- Approved migration correction.

---

# Retention Deletion

Retention deletion must comply with:

- Financial Evidence policy.
- Audit policy.
- Legal Hold.
- Privacy policy.
- Backup policy.

---

# Reconciliation Governance

A completed reconciliation is a governed financial closure.

It must not become a casual UI state.

---

# Reconciliation Authority

Potential authorities include:

```text
Owner

Authorized delegated user

Financial Support specialist

Financial administrator
```

The exact Role must be defined.

---

# Reconciliation Match Rule Registry

Every automatic Match Rule should be registered.

Recommended fields:

```text
matchRuleId

name

version

requiredFields

optionalFields

amountTolerance

dateTolerance

descriptionNormalization

autoConfirmThreshold

manualReviewThreshold

supportedCurrencies

status

owner
```

---

# Match Rule Identifier

Recommended format:

```text
MATCH-RULE-<NUMBER>
```

---

# Automatic Match Safety

Automatic confirmation should be limited to high-confidence deterministic cases.

Low-confidence suggestions require review.

---

# Reconciliation Completion Authority

Completion should require:

- Authorized Actor.
- Completed match review.
- Zero or approved difference.
- Verified Account scope.
- Verified reference source.
- Snapshot generation.
- Audit Evidence.

---

# Reconciliation Reopen Authority

Reopening requires stronger control than creating a Draft reconciliation.

It may require:

- Reason.
- Reauthentication.
- Financial Role.
- Support or administrative case.
- Audit Evidence.

---

# Reconciliation Adjustment Governance

Adjustment use must be monitored because it can conceal missing or incorrect financial records.

High adjustment frequency should trigger review.

---

# Budget Governance

Budget formulas must remain stable across:

- Dashboard.
- Budget detail.
- Notifications.
- Reports.
- Exports.
- Android.
- Web.

---

# Budget Scope Governance

A Budget must define:

```text
Owner

Currency

Accounts

Categories

Period

Included states

Refund behavior

Transfer behavior

Adjustment behavior

Policy version
```

---

# Budget Overlap

Multiple Budgets may overlap.

The Product must define whether one Expense may count against multiple Budgets.

If allowed, each Budget total remains individually valid.

Owner-wide aggregate Budget reporting must avoid misleading double counting.

---

# Budget Historical Change

Changing a Budget scope or amount must define whether the change affects:

- Current period only.
- Future periods only.
- All historical periods.
- A new Budget version.

---

# Goal Governance

Goal aggregates must always be derived from contribution Events.

A stored `currentAmount` may be cached but must remain verifiable.

---

# Goal Adjustment Authority

Goal adjustments must require:

- Reason.
- Exact amount.
- Direction.
- Actor.
- Owner.
- Operation.
- Audit Evidence.

---

# Goal Linked-Transaction Governance

When Goal contributions are linked to financial Transactions:

- Relationship must be explicit.
- Deleting or reversing the Transaction must reevaluate the Goal.
- Goal deletion must not delete the financial Transaction automatically.
- Duplicate links must be prevented.

---

# Recurring Transaction Governance

Recurring generation is a financial automation capability.

It requires:

- Stable schedule.
- Explicit time zone.
- Idempotency.
- Owner scope.
- Account scope.
- Amount validation.
- Feature availability.
- Monitoring.
- Safe Retry.

---

# Recurring Schedule Change

Schedule changes must define:

- Effective occurrence.
- Existing Scheduled instances.
- Previously skipped occurrences.
- Previously generated Transactions.
- Projection recalculation.
- Audit Evidence.

---

# Recurring Missed Occurrence Governance

Missed occurrence behavior must not be inferred differently by Android and Backend.

One policy must control it.

---

# Projection Governance

Projected values are non-final.

Projection interfaces must visually and programmatically distinguish projections from Posted values.

---

# Projection Assumption Record

A material projection should identify:

```text
projectionPolicyVersion

includedScheduledRecords

includedRecurringInstances

excludedRecords

horizon

calculatedAt

confidence
```

---

# Projection Expiration

A Projection becomes stale when:

- New financial Events arrive.
- Schedule changes.
- Time horizon advances.
- Policy changes.
- Account state changes.
- Currency data expires.

---

# Import Financial Governance

Every Import parser and format must be registered.

---

# Import Format Registry

Recommended fields:

```text
importFormatId

name

provider

fileType

locale

decimalSeparator

groupingSeparator

dateFormats

negativeAmountRules

currencyRules

parserVersion

status

owner
```

---

# Import Parser Versioning

Parser changes may alter:

- Amount interpretation.
- Date interpretation.
- Sign.
- Description.
- Duplicate hashes.
- Reference extraction.

Every parser change requires regression comparison.

---

# Import Confirmation Governance

An Import confirmation should show:

- Account.
- Currency.
- Accepted rows.
- Rejected rows.
- Credits.
- Debits.
- Net effect.
- Duplicate candidates.
- Expected balance impact.

---

# Import Rollback Governance

Import rollback must define:

- Eligibility.
- Created Transactions.
- Reconciliation impact.
- Linked Resources.
- Posted-state handling.
- Reversal or deletion behavior.
- Audit Evidence.

Posted imported Transactions should not be silently deleted.

---

# Export Financial Governance

Every financial Export type must define:

```text
Export identifier

Calculation type

Date boundaries

Account scope

Currency

Included states

Policy version

Data version

Precision

Format

Integrity
```

---

# Export Preview

An Export preview is not the final Export Evidence.

The final Export totals must be generated from the same canonical data version as the exported records.

---

# Export Total Equality

For an Export containing detailed financial rows:

```text
Sum of exported signed deltas
=
Exported summary net total
```

according to the Export policy.

---

# Dashboard Governance

Dashboard financial values must be traceable to:

- Calculation type.
- Date range.
- Account scope.
- Currency.
- Policy version.
- Financial-data version.

---

# Dashboard Refresh

A Dashboard must not present stale cached values as current without an approved freshness policy.

---

# Dashboard Empty State

An empty financial Dashboard must distinguish:

```text
No financial records

No records in selected period

Data unavailable

Calculation failed

Account not selected
```

---

# Chart Governance

Charts must preserve the same exact underlying values as reports.

Visual interpolation, smoothing or abbreviation must not change financial meaning.

---

# Financial Search and Filtering

Filtering financial records must define whether summary totals represent:

```text
All records in the period

or

Only currently filtered records
```

The interface must not mix these meanings.

---

# Financial Sorting

Sorting changes display order only.

It must not alter totals.

---

# Financial Pagination

Pagination must not cause totals to represent only the visible page unless explicitly labeled.

---

# Financial Support Governance

Support must receive safe financial information appropriate to the case.

---

# Support Permissions

Potential Support capabilities include:

```text
FINANCIAL_VIEW_SAFE_SUMMARY

FINANCIAL_VIEW_TRANSACTION_HISTORY

FINANCIAL_VIEW_RECONCILIATION_STATUS

FINANCIAL_REQUEST_RECALCULATION

FINANCIAL_ESCALATE_CORRECTION
```

Ordinary Support must not receive unrestricted adjustment authority.

---

# Support Scenario — Balance Appears Incorrect

Expected behavior:

```text
Confirm Account and period.

Confirm Current, Available or Projected Balance label.

Confirm pending and scheduled records.

Confirm recent backdated changes.

Request approved recalculation where available.

Escalate unexplained differences.

Do not create an Adjustment merely to match the expected value.
```

---

# Support Scenario — Duplicate Transaction

Expected behavior:

- Identify both Transaction IDs safely.
- Compare operation IDs and source references.
- Avoid deleting Posted Transactions directly.
- Escalate for duplicate classification.
- Use approved reversal or correction process.

---

# Support Scenario — Transfer Missing on One Account

This may indicate partial Transfer completion.

Required behavior:

- Preserve Transfer ID.
- Preserve source and destination Account references.
- Avoid recreating the Transfer manually.
- Escalate immediately to Financial Operations.
- Do not mark the Transfer as completed.

---

# Support Scenario — Reconciliation Difference

Expected behavior:

- Confirm period.
- Confirm opening and closing reference balances.
- Confirm unmatched count.
- Avoid suggesting an unexplained adjustment.
- Escalate persistent difference.

---

# Support Scenario — Goal Amount Incorrect

Expected behavior:

- Review contribution and withdrawal Events.
- Confirm linked Transactions.
- Request recalculation.
- Avoid editing the Goal aggregate directly.
- Escalate orphan or duplicate contributions.

---

# Financial Access Governance

Financial data access must preserve:

- Authentication.
- Authorization.
- Owner isolation.
- Account scope.
- Purpose.
- Field minimization.
- Audit Evidence for privileged access.

---

# Financial Administrative Roles

Potential Roles include:

```text
FINANCIAL_POLICY_VIEWER

FINANCIAL_POLICY_EDITOR

FINANCIAL_POLICY_APPROVER

FINANCIAL_RECONCILIATION_SPECIALIST

FINANCIAL_CORRECTION_REQUESTER

FINANCIAL_CORRECTION_APPROVER

FINANCIAL_INVESTIGATOR

FINANCIAL_MIGRATION_OPERATOR
```

---

# Financial Policy Editor

May propose policy changes.

This Role must not automatically activate Production policy versions.

---

# Financial Policy Approver

May approve policy versions within assigned domains.

Approval does not grant permission to mutate Owner financial data.

---

# Financial Reconciliation Specialist

May investigate and support reconciliation according to assigned scope.

---

# Financial Correction Requester

May propose corrections.

The Role must not automatically approve or execute high-impact corrections.

---

# Financial Correction Approver

May approve defined correction types within bounded scope.

---

# Financial Investigator

May review financial Evidence for an authorized case.

---

# Financial Migration Operator

May execute approved migration plans.

The Role must not define the migration policy independently.

---

# Financial Access Review

Privileged financial Roles require periodic certification.

Review should verify:

- Actor remains active.
- Role remains necessary.
- Scope remains appropriate.
- Correction authority remains bounded.
- Environment access remains correct.
- Investigation access remains case-scoped.

---

# Financial Observability Architecture

Financial observability must detect both calculation failures and plausible but incorrect results.

---

# Monitoring Categories

Recommended categories include:

```text
Money validation

Currency consistency

Calculation success

Balance integrity

Transfer integrity

Transaction integrity

Budget integrity

Goal integrity

Recurring generation

Projection freshness

Import equality

Export equality

Reconciliation

Corrections

Snapshots

Caches

Financial migrations
```

---

# Money Validation Monitoring

Track:

```text
invalid_amount_count

invalid_scale_count

unsupported_currency_count

currency_mismatch_count

financial_overflow_count

negative_amount_rejection_count
```

---

# Transaction Integrity Monitoring

Track:

```text
posted_transaction_without_balance_event_count

invalid_transaction_state_transition_count

stale_transaction_update_count

posted_transaction_direct_delete_attempt_count

excess_refund_attempt_count

excess_reversal_attempt_count
```

---

# Transfer Integrity Monitoring

Track:

```text
transfer_missing_debit_count

transfer_missing_credit_count

transfer_amount_mismatch_count

transfer_currency_mismatch_count

transfer_partial_completion_count

transfer_compensation_failure_count
```

---

# Balance Integrity Monitoring

Track:

```text
balance_snapshot_mismatch_count

balance_rebuild_difference_count

unexplained_balance_difference_count

financial_sequence_gap_count

balance_cache_stale_count

cross_owner_balance_cache_violation_count
```

---

# Budget Integrity Monitoring

Track:

```text
budget_consumption_mismatch_count

budget_duplicate_counting_count

budget_currency_mismatch_count

budget_snapshot_invalid_count
```

---

# Goal Integrity Monitoring

Track:

```text
goal_contribution_sum_mismatch_count

goal_duplicate_contribution_count

goal_orphan_contribution_count

goal_negative_amount_violation_count
```

---

# Recurring Integrity Monitoring

Track:

```text
recurring_duplicate_generation_count

recurring_missed_occurrence_count

recurring_schedule_drift_count

recurring_generation_policy_mismatch_count
```

---

# Projection Monitoring

Track:

```text
projection_stale_count

projection_policy_mismatch_count

projection_duplicate_source_count

projection_current_balance_confusion_report_count
```

---

# Import Integrity Monitoring

Track:

```text
import_preview_total_mismatch_count

import_persisted_total_mismatch_count

import_duplicate_detection_failure_count

import_parser_regression_count

import_partial_completion_count
```

---

# Export Integrity Monitoring

Track:

```text
export_detail_summary_mismatch_count

export_policy_version_missing_count

export_data_version_missing_count

export_currency_format_error_count
```

---

# Reconciliation Monitoring

Track:

```text
reconciliation_difference_count

reconciliation_unexplained_adjustment_count

reconciliation_reopen_count

reconciliation_match_conflict_count

reconciliation_backdated_mutation_count

reconciliation_snapshot_mismatch_count
```

---

# Correction Monitoring

Track:

```text
financial_correction_request_count

financial_correction_failure_count

financial_correction_rollback_count

financial_correction_unapproved_count

financial_correction_reconciliation_impact_count
```

---

# Financial SLO Architecture

Potential SLO categories include:

```text
Calculation correctness

Calculation availability

Calculation latency

Balance freshness

Transfer completion

Recurring generation

Import completion

Export correctness

Reconciliation availability

Correction completion

Snapshot verification
```

---

# Calculation Correctness SLO

Target:

```text
Zero known authoritative financial calculations using unapproved formulas or imprecise monetary representation.
```

---

# Calculation Availability SLO

Potential objective:

```text
Authoritative financial calculations complete successfully within the approved availability target for supported inputs.
```

---

# Calculation Latency SLO

Potential objective:

```text
Common Account and Dashboard calculations complete within the approved latency target.
```

Performance must not weaken correctness.

---

# Balance Freshness SLO

Potential objective:

```text
Verified balance views reflect accepted financial mutations within the approved freshness window.
```

---

# Transfer Completion SLO

Potential objective:

```text
Internal same-database Transfers complete both required Account effects within one authoritative transaction.
```

Target:

```text
Zero Posted one-sided Transfers.
```

---

# Recurring Generation SLO

Potential objective:

```text
Eligible recurring occurrences generate one canonical Transaction within the approved execution window.
```

---

# Import Completion SLO

Potential objective:

```text
Confirmed Imports reach a final accepted, rejected or partial state within the approved processing window.
```

---

# Export Correctness SLO

Target:

```text
Exported detail rows and exported summary values remain mathematically consistent.
```

---

# Reconciliation Availability SLO

Potential objective:

```text
Authorized Owners can create, review and complete supported reconciliations within the operational availability target.
```

---

# Snapshot Verification SLO

Potential objective:

```text
Financial snapshots complete integrity and reproducibility verification within the approved period.
```

---

# Zero-Tolerance Financial Failures

Targets must be zero for:

```text
Cross-Owner financial aggregation

Binary floating-point authoritative money

One-sided Posted Transfer

Silent financial-history deletion

Duplicate balance-affecting mutation

Unauthorized financial correction

Reconciliation completion with unexplained difference

Snapshot marked verified after failed integrity

Unapproved financial-policy activation

Financial Export summary mismatch

Client-only authority for persisted balance
```

---

# Financial Error Budgets

Error budgets may apply to:

- Dashboard refresh latency.
- Noncritical chart delay.
- Projection freshness delay.
- Noncritical report generation delay.
- Temporary reconciliation suggestion delay.

They must not normalize:

```text
Incorrect balances

Cross-Owner inclusion

Duplicate Transactions

One-sided Transfers

Unexplained differences

Financial overflow

Unauthorized adjustments

Calculation-policy mismatch

Lost financial history
```

---

# Financial Alert Architecture

Alerts must identify:

- Environment.
- Owner scope where safe.
- Account scope where safe.
- Financial policy.
- Operation ID.
- Severity.
- Runbook.
- Responsible owner.

Alerts must not expose complete private financial details unnecessarily.

---

# Critical Financial Alerts

Trigger immediately for:

```text
Cross-Owner financial calculation

Posted Transfer missing one side

Duplicate financial mutation

Unexplained Account balance mutation

Unauthorized financial correction

Financial overflow in authoritative persistence

Financial policy changed without approval

Reconciliation completed with non-approved difference

Verified snapshot integrity failure

Financial data deleted outside approved policy
```

---

# High Financial Alerts

Potential High alerts include:

```text
Balance snapshot mismatch

Import accepted total mismatch

Export summary mismatch

Backdated mutation in completed reconciliation

Transfer compensation failure

Financial sequence gap

Migration financial difference

Recurring duplicate generation

Excess refund attempt pattern
```

---

# Moderate Financial Alerts

Potential Moderate alerts include:

```text
Projection stale beyond policy

Budget Snapshot stale

Goal recalculation delay

Reconciliation suggestion failure

Noncritical financial report delay
```

---

# Financial Incident Architecture

Financial Incidents may include:

```text
Incorrect balance

Cross-Owner calculation

Duplicate Transaction

One-sided Transfer

Incorrect rounding

Currency mismatch

Financial overflow

Missing Balance Event

Reconciliation defect

Import total mismatch

Export total mismatch

Unauthorized adjustment

Incorrect correction

Financial migration defect

Snapshot corruption

Recurring duplication
```

---

# Financial Incident Severity Factors

Evaluate:

```text
Number of Owners

Number of Accounts

Amount affected

Currency

Duration

Posted financial impact

Reconciliation impact

Export impact

Correction complexity

Security impact

Privacy impact

Audit completeness

Recoverability
```

---

# Financial Incident Response Sequence

```text
Detect

↓

Stop affected financial mutation

↓

Preserve canonical Resources

↓

Preserve operation and Audit Evidence

↓

Identify Owner and Account scope

↓

Identify affected policy version

↓

Recalculate independently

↓

Compare snapshots and Events

↓

Correct through governed operations

↓

Verify balances and reconciliation

↓

Communicate verified impact

↓

Review root cause
```

---

# Incorrect Balance Incident

Required response:

- Freeze direct manual edits.
- Preserve the displayed and calculated values.
- Identify Account and policy version.
- Run full deterministic recalculation.
- Compare Balance Events and Transactions.
- Check backdated mutations.
- Check duplicates.
- Check Transfers.
- Check corrections.
- Classify the difference.

---

# Cross-Owner Financial Incident

This is Critical.

Required response:

```text
Stop the affected calculation path.

Invalidate affected caches and snapshots.

Revoke affected Sessions where necessary.

Identify Owners and Accounts affected.

Preserve query and operation Evidence.

Correct Owner scoping.

Recalculate affected financial values.

Execute cross-Owner regression tests.

Notify Security and Privacy.
```

---

# Duplicate Transaction Incident

Required response:

- Identify duplicate classification.
- Preserve both records.
- Determine whether duplicate processing occurred.
- Avoid direct deletion of Posted effects.
- Reverse or correct the duplicate through approved operations.
- Recalculate balances.
- Review idempotency.

---

# One-Sided Transfer Incident

Required response:

```text
Stop Transfer completion reporting.

Preserve Transfer, debit and credit Evidence.

Identify which side exists.

Attempt approved compensation or completion.

Verify both Account balances.

Review transaction atomicity.

Open a Critical Incident when Posted state was exposed.
```

---

# Incorrect Rounding Incident

Required response:

- Identify affected policy version.
- Identify affected operations.
- Compare exact source values.
- Determine whether stored amounts or display values are affected.
- Create a corrected policy version.
- Recalculate or correct according to migration policy.
- Preserve historical results.

---

# Currency Mismatch Incident

Required response:

- Stop affected calculations.
- Identify Account and Transaction currencies.
- Preserve conversion metadata.
- Correct invalid records through approved correction.
- Recalculate.
- Review input validation.

---

# Financial Overflow Incident

Required response:

```text
Stop the operation.

Preserve source values.

Do not truncate.

Identify numeric boundary.

Review all related aggregations.

Increase supported precision only through governed migration.

Verify client and export compatibility.
```

---

# Missing Balance Event Incident

Required response:

- Preserve the source Transaction.
- Verify Transaction commit.
- Verify Audit outbox.
- Recreate the Balance Event only through a governed repair.
- Preserve repair Evidence.
- Recalculate Account state.
- Review capture guarantees.

---

# Reconciliation Defect Incident

Examples:

- Incorrect match.
- Duplicate match.
- Completed nonzero difference.
- Missing reference records.
- Incorrect opening balance.
- Backdated mutation not detected.

Required response:

- Reopen affected reconciliation.
- Preserve prior snapshot.
- Correct match or reference state.
- Recalculate.
- Generate a new completion snapshot.

---

# Import Total Mismatch Incident

Required response:

```text
Pause Import completion.

Preserve source file and hash.

Compare parser output with canonical Transactions.

Identify accepted and rejected rows.

Correct parser or persistence behavior.

Recalculate affected Accounts.

Prevent reuse of the defective parser version.
```

---

# Export Total Mismatch Incident

Required response:

- Revoke or expire affected Export where possible.
- Preserve Export file and hash.
- Compare detail rows with summary.
- Identify policy and data versions.
- Correct Export generation.
- Notify affected Owners where required.

---

# Unauthorized Adjustment Incident

Required response:

- Revoke adjustment authority.
- Preserve Adjustment Evidence.
- Identify affected Accounts.
- Reverse or correct the adjustment.
- Recalculate balances.
- Review access and approval controls.
- Notify Security and Financial governance.

---

# Financial Migration Incident

Required response:

- Stop migration.
- Preserve source and target states.
- Identify affected batch.
- Compare policy versions.
- Roll back or forward-correct.
- Verify balances and reconciliation.
- Review all previously completed batches.

---

# Financial Incident Record

Recommended fields:

```text
incidentId

category

severity

ownerScope

accountScope

resourceScope

currency

amountImpact

policyVersion

operationScope

detectedAt

containment

recalculationResult

correctionResult

reconciliationImpact

securityImpact

privacyImpact

rootCause

verification

closedAt
```

---

# Financial Incident Communication

Communication should explain:

```text
Which financial value or operation was affected

Which period was affected

Whether Transactions or balances changed

Whether any correction was applied

Whether Owner action is required

Whether exports or reports should be regenerated

Which verified state is now authoritative
```

Nexio must not communicate an estimated impact as a confirmed exact amount.

---

# Financial Testing Architecture

Financial behavior requires extensive automated and manual verification.

Recommended test categories include:

```text
Money representation

Precision

Rounding

Parsing

Transaction states

Transfer atomicity

Idempotency

Balance formulas

Historical reconstruction

Budget calculations

Goal calculations

Recurring generation

Projection

Import totals

Export totals

Reconciliation

Corrections

Offline synchronization

Concurrency

Migration

Owner isolation

Accessibility
```

---

# Unit Tests

Unit tests should cover:

- Money addition.
- Money subtraction.
- Comparison.
- Sign conversion.
- Scale validation.
- Rounding.
- Allocation.
- Percentage.
- Currency mismatch.
- Overflow.
- Empty aggregation.

---

# Golden Test Vectors

Golden test vectors should be shared across:

- Backend.
- Android.
- Web.
- Export generation.
- Reporting.
- Migration tools.

---

# Golden Test Example

```text
Inputs:

Opening Balance:
R$ 1.000,00

Posted Income:
R$ 500,00

Posted Expense:
R$ 250,00

Pending Expense:
R$ 100,00

Scheduled Income:
R$ 300,00

Expected:

Current Balance:
R$ 1.250,00

Pending Impact:
-R$ 100,00

Available Balance:
R$ 1.150,00

Projected Balance:
R$ 1.450,00
```

The exact Available Balance policy must be identified.

---

# Rounding Tests

Tests should include:

```text
R$ 10,994

R$ 10,995

R$ 10,996

R$ 0,005

R$ 999.999.999,995
```

according to the supported input and calculation policy.

---

# Allocation Tests

Verify:

```text
R$ 100,00 ÷ 3

R$ 0,01 ÷ 2

R$ 10,00 across 7 items

Negative signed allocation where supported
```

The allocated sum must equal the original total.

---

# Transaction State Tests

Verify every allowed and denied state transition.

---

# Posted Deletion Tests

Verify that a Posted Transaction cannot disappear from financial history through ordinary deletion.

---

# Refund Tests

Verify:

- Full refund.
- Partial refund.
- Multiple refunds.
- Refund equal to remaining amount.
- Over-refund rejection.
- Refund after reconciliation.
- Refund Budget effect.

---

# Reversal Tests

Verify:

- Full Reversal.
- Partial Reversal where supported.
- Repeated Reversal.
- Excess Reversal rejection.
- Reversal after reconciliation.
- Reversal Snapshot invalidation.

---

# Transfer Tests

Verify:

- Same-currency Transfer.
- Transfer fee.
- Cross-currency Transfer.
- Source failure.
- Destination failure.
- Transaction rollback.
- Duplicate Retry.
- Partial completion.
- Compensation.
- Reversal.
- Reconciliation of both sides.

---

# Balance Tests

Verify:

- Opening Balance only.
- Empty Account.
- Income.
- Expense.
- Transfer.
- Adjustment.
- Refund.
- Reversal.
- Pending.
- Scheduled.
- Backdated Transaction.
- Archived Account.
- Closed Account.
- Snapshot rebuild.
- Snapshot mismatch.

---

# Historical Balance Tests

Verify balances before and after:

- Backdated Transaction.
- Policy migration.
- Reversal.
- Opening Balance correction.
- Reconciliation reopening.

---

# Budget Tests

Verify:

- Expense inclusion.
- Refund reduction.
- Transfer exclusion.
- Fee inclusion.
- Category hierarchy.
- Multiple categories.
- Period boundary.
- Currency mismatch.
- Overspending.
- Amount update.

---

# Goal Tests

Verify:

- Contribution.
- Withdrawal.
- Completion.
- Excess amount.
- Reopening.
- Target change.
- Duplicate contribution.
- Linked Transaction reversal.
- Negative-result prevention.

---

# Recurring Tests

Verify:

- Daily.
- Weekly.
- Monthly.
- Day 31.
- February 29.
- Pause.
- Resume.
- Skip.
- Retry.
- Duplicate prevention.
- Time-zone transition.
- Template update.

---

# Projection Tests

Verify:

- Horizon.
- Scheduled inclusion.
- Pending inclusion.
- Recurring inclusion.
- Cancelled exclusion.
- Expiration.
- Current versus Projected labeling.

---

# Import Tests

Verify:

- pt-BR decimal parsing.
- Negative parentheses.
- Invalid amount.
- Unsupported currency.
- Duplicate row.
- Partial completion.
- Preview totals.
- Persisted totals.
- Parser version migration.
- Source-file hash.

---

# Export Tests

Verify:

- JSON decimal strings.
- CSV decimal separator.
- Summary/detail equality.
- Date boundaries.
- Policy version.
- Data version.
- Currency.
- Content hash.

---

# Reconciliation Tests

Verify:

- Exact one-to-one match.
- One-to-many match.
- Many-to-one match.
- Partial match.
- Duplicate match.
- Manual match.
- Exclusion.
- Adjustment.
- Zero difference.
- Nonzero difference.
- Completion.
- Reopening.
- Consecutive periods.
- Backdated Transaction.

---

# Idempotency Tests

Verify repeated:

- Transaction creation.
- Transfer creation.
- Import confirmation.
- Recurring generation.
- Reconciliation completion.
- Correction.
- Offline Sync.
- Queue delivery.

---

# Concurrency Tests

Verify:

- Concurrent Transaction edits.
- Concurrent Transfers.
- Reconciliation completion during Transaction edit.
- Import during Account closure.
- Snapshot rebuild during mutation.
- Deadlock Retry.

---

# Owner-Isolation Tests

Verify:

- Another Owner's Account cannot be included.
- Another Owner's Transaction cannot be aggregated.
- Another Owner's Balance Snapshot cannot be returned.
- Another Owner's Feature cache cannot affect calculation.
- Another Owner's Import cannot create Transactions.
- Another Owner's reconciliation cannot be opened.

---

# Property-Based Financial Tests

Potential invariants include:

```text
Current Balance equals Opening Balance plus eligible signed deltas.

Transfer principal net effect across same-Owner Accounts equals zero.

Allocation parts sum to the original total.

A full Reversal produces zero net effect with the original Transaction.

A full Refund cannot exceed the eligible original amount.

Budget usage derives only from eligible Transactions.

Goal Current Amount equals contribution signed deltas.

Completed exact-currency reconciliation has zero approved difference.
```

---

# Mutation Testing

Mutation testing may verify that financial tests fail when:

- A sign is inverted.
- A Transaction state is included incorrectly.
- Rounding mode changes.
- Transfer side is omitted.
- Owner filter is removed.
- Date boundary becomes inclusive at both ends.
- Currency validation is removed.

---

# Financial Performance Testing

Performance testing should cover:

- Large Transaction history.
- Multiple Accounts.
- Long historical reconstruction.
- Large Imports.
- Reconciliation matching.
- Snapshot rebuild.
- Dashboard aggregation.
- Export generation.

Performance optimizations must not weaken exactness or Owner isolation.

---

# Financial Accessibility Testing

Verify:

- Monetary values are announced correctly.
- Negative values are understandable.
- Credits and debits do not rely only on color.
- Balance types have clear labels.
- Projected values are identified.
- Reconciliation difference is announced.
- Tables are keyboard accessible.
- Charts have textual equivalents.
- Error messages identify affected fields.
- Large text does not hide exact amounts.

---

# Financial Migration Architecture

Financial migrations may affect:

```text
Money representation

Currency precision

Transaction schema

Balance Event schema

Financial sequence

Calculation policy

Rounding policy

Transfer model

Budget model

Goal model

Recurring model

Reconciliation model

Financial snapshots

Import parser

Export format
```

---

# Financial Migration Principles

Every financial migration must:

- Preserve exact amounts.
- Preserve currencies.
- Preserve Owner and Account scope.
- Preserve Resource identifiers where possible.
- Preserve operation identity.
- Preserve historical state.
- Preserve Audit Evidence.
- Preserve reconciliation.
- Be idempotent.
- Be independently verifiable.
- Support rollback or forward correction.

---

# Financial Migration Record

Recommended structure:

```text
FinancialMigration
 ├── migrationId
 ├── migrationType
 ├── sourceVersion
 ├── targetVersion
 ├── ownerScope
 ├── accountScope
 ├── policyVersion
 ├── state
 ├── batchSize
 ├── comparisonResult
 ├── startedAt
 ├── completedAt
 └── auditReference
```

---

# Financial Migration States

Recommended:

```text
Draft

Approved

Preparing

Running

Paused

ComparisonFailed

VerificationPending

Completed

RolledBack

ForwardCorrectionRequired

Failed
```

---

# Migration Preconditions

```text
□ Source data is inventoried.

□ Target schema is ready.

□ Money precision is compatible.

□ Currency metadata is valid.

□ Owner scope is verified.

□ Policy versions are defined.

□ Comparison formulas exist.

□ Rollback or forward correction exists.

□ Backups are verified.

□ Monitoring exists.

□ Reconciliation impact is defined.
```

---

# Financial Dual Write

Financial dual write is high risk.

It must define:

- Authoritative path.
- Idempotency.
- Ordering.
- Failure handling.
- Reconciliation.
- Comparison.
- Rollback.
- Duration.
- Retirement.

---

# Financial Shadow Calculation

A new Calculation Engine may run in shadow mode.

It should:

- Receive the same approved inputs.
- Produce no Owner-visible mutation.
- Compare exact results.
- Record policy versions.
- Classify differences.
- Block rollout on unexplained differences.

---

# Financial Comparison Outcomes

Recommended:

```text
ExactMatch

ExpectedPolicyDifference

ExpectedRoundingDifference

DataVersionDifference

MissingSourceRecord

DuplicateSourceRecord

OwnerScopeMismatch

UnexplainedDifference
```

---

# Migration Difference Threshold

For exact BRL balances, the normal unexplained difference threshold should be:

```text
R$ 0,00
```

A nonzero threshold requires explicit policy justification.

---

# Batch Migration

Batch migrations must preserve:

- Stable batch identity.
- Owner boundaries.
- Account boundaries.
- Retry identity.
- Comparison result.
- Completion Evidence.

---

# Migration Retry

A Retry must not:

- Duplicate Transactions.
- Duplicate Balance Events.
- Duplicate Goal contributions.
- Duplicate reconciliation matches.
- Change previous comparison results silently.

---

# Migration Rollback

Rollback must define:

- Data written by the migration.
- Resources modified.
- Snapshots created.
- Policy versions activated.
- Reconciliation changes.
- Audit Evidence.
- Compatibility with operations executed during migration.

---

# Forward Correction

When rollback is unsafe, Nexio must use a forward correction.

Forward correction must:

- Preserve defective state.
- Identify exact differences.
- Create explicit correction Events.
- Recalculate.
- Verify.
- Preserve migration Evidence.

---

# Financial Migration Completion

Completion requires:

```text
□ Every batch reached a final state.

□ No unexplained difference remains.

□ Owner scope is verified.

□ Account balances are verified.

□ Transfers are verified.

□ Budgets are verified where affected.

□ Goals are verified where affected.

□ Reconciliation is verified.

□ Exports remain compatible.

□ Rollback window is closed deliberately.

□ Old code paths are retired.
```

---

# Financial Backup and Restore

Financial backup must preserve:

- Transactions.
- Transfers.
- Accounts.
- Balance Events.
- Financial sequences.
- Budgets.
- Goals.
- Goal contributions.
- Recurring Transactions.
- Recurring instances.
- Imports.
- Reconciliation.
- Corrections.
- Financial policies.
- Snapshots.
- Audit Evidence.

---

# Financial Restore Verification

After restore, verify:

```text
Owner and Account counts

Transaction counts

Transfer pairs

Balance Event counts

Financial sequences

Account balances

Budget totals

Goal totals

Reconciliation Snapshots

Policy versions

Audit references
```

---

# Restore Recalculation

Restored Balance Snapshots should not be trusted blindly.

Nexio should perform:

- Integrity verification.
- Sample recalculation.
- Full recalculation for high-risk affected scope.
- Transfer verification.
- Reconciliation verification.

---

# Financial Disaster Recovery

Recovery priority should include:

```text
Canonical financial Resources

↓

Balance Events and financial sequences

↓

Financial policies

↓

Reconciliation

↓

Financial snapshots

↓

Budgets and Goals

↓

Projections and caches
```

---

# Financial Release Certification

Every release affecting financial behavior must declare:

```text
Financial policy versions

Money library version

Rounding policy versions

Transaction schema version

Transfer schema version

Balance formula versions

Reconciliation policy version

Import parser versions

Export calculation versions

Migration state

Rollback artifact
```

---

# Financial Release Gate

A release must not proceed when:

```text
Money representation is imprecise.

Rounding rules are undefined.

Balance formulas differ across components.

Transfer atomicity tests fail.

Owner-isolation tests fail.

Idempotency tests fail.

Reconciliation completion accepts unexplained differences.

Import accepted totals mismatch.

Export detail and summary totals mismatch.

Financial migration comparison fails.

Rollback is unavailable.

Critical Accessibility tests fail.
```

---

# Post-Release Financial Verification

Review:

```text
Calculation error rate

Balance differences

Transfer completion

Duplicate operations

Snapshot integrity

Import totals

Export totals

Reconciliation differences

Recurring generation

Correction activity

Owner complaints

Support cases
```

---

# Definition of Ready

A financial capability is ready when:

```text
□ Financial meaning is defined.

□ Canonical Resources are defined.

□ Currency is defined.

□ Precision is defined.

□ Formula is defined.

□ Rounding is defined.

□ Included states are defined.

□ Excluded states are defined.

□ Time boundaries are defined.

□ Policy version exists.

□ Idempotency is defined.

□ Correction behavior is defined.

□ Monitoring is defined.

□ Test vectors exist.
```

---

# Definition of Implemented

A financial capability is implemented when:

```text
□ Canonical model exists.

□ Authoritative backend behavior exists.

□ Exact Money type is used.

□ Validation exists.

□ Persistence exists.

□ Resource versioning exists.

□ Audit Events exist.

□ Monitoring hooks exist.
```

Implementation does not mean verified or releasable.

---

# Definition of Verified

A financial capability is verified when:

```text
□ Money tests pass.

□ Precision tests pass.

□ Rounding tests pass.

□ Formula test vectors pass.

□ Transaction-state tests pass.

□ Transfer atomicity tests pass.

□ Idempotency tests pass.

□ Balance reconstruction tests pass.

□ Reconciliation tests pass.

□ Migration comparison tests pass.

□ Owner-isolation tests pass.

□ Accessibility tests pass.
```

---

# Definition of Releasable

A financial capability is releasable when:

```text
□ Policies are approved.

□ Financial review is complete.

□ Security review is complete.

□ Privacy review is complete.

□ Accessibility review is complete.

□ Monitoring is active.

□ Critical alerts exist.

□ Runbooks exist.

□ Support guidance exists.

□ Rollback is verified.

□ Migration is verified where required.
```

---

# Definition of Operationally Verified

A financial capability is operationally verified when:

```text
□ Production calculations match approved formulas.

□ Balances remain reproducible.

□ Transfers remain complete.

□ Duplicate mutation rate is zero for committed operations.

□ Reconciliation differences are explainable.

□ Snapshots verify.

□ No Critical financial alert exists.
```

---

# AI Governance

AI may assist with financial analysis.

AI must not become an authoritative Calculation Engine.

---

# Allowed AI Uses

AI may assist with:

- Explaining financial summaries.
- Suggesting Transaction categories.
- Suggesting reconciliation matches.
- Detecting potential duplicates.
- Summarizing financial trends.
- Drafting investigation reports.
- Identifying anomalous differences.
- Drafting test cases.
- Comparing calculation outputs.

---

# Forbidden AI Uses

AI must not:

- Create authoritative balances independently.
- Change monetary values.
- Approve financial corrections.
- Create unexplained adjustments.
- Mark reconciliation complete.
- Select exchange rates without approved sources.
- Replace missing Transactions.
- Delete financial history.
- Override Owner isolation.
- Claim a financial result is verified without deterministic calculation.
- Present projections as Posted values.
- Suppress financial differences.

---

# AI Financial Explanations

AI-generated explanations must distinguish:

```text
Verified Posted Value

Pending Value

Scheduled Value

Projected Value

Reconciled Value

Estimate

Suggestion

Unknown
```

---

# AI Reconciliation Suggestions

AI may suggest matches.

A suggestion must not become final without:

- Approved deterministic validation.
- Owner or authorized review where required.
- Amount and currency verification.
- Conflict verification.
- Audit Evidence.

---

# AI Duplicate Detection

AI may identify probable duplicates.

It must not delete or reverse a Transaction automatically.

---

# AI Financial Advice Boundary

Nexio must not represent AI-generated observations as regulated financial advice unless a separately approved legal and Product model exists.

---

# Final Financial Checklists

---

# Money Checklist

```text
□ Exact representation is used.

□ Currency is explicit.

□ Scale is valid.

□ Maximum amount is defined.

□ Overflow is detected.

□ Sign behavior is defined.

□ Serialization is exact.

□ Display formatting is separate.
```

---

# Rounding Checklist

```text
□ Rounding policy ID exists.

□ Currency is defined.

□ Input scale is defined.

□ Intermediate scale is defined.

□ Output scale is defined.

□ Rounding mode is defined.

□ Rounding stage is defined.

□ Allocation rule is defined.

□ Remainder rule is defined.

□ Test vectors exist.
```

---

# Transaction Checklist

```text
□ Transaction ID exists.

□ Owner is identified.

□ Account is identified.

□ Type is explicit.

□ Direction is explicit.

□ Amount is exact.

□ Currency is explicit.

□ Effective date is defined.

□ State is explicit.

□ Resource version exists.

□ operationId exists.

□ Policy version exists.

□ Audit reference exists.
```

---

# Transfer Checklist

```text
□ Transfer ID exists.

□ Owner is identified.

□ Source Account is valid.

□ Destination Account is valid.

□ Source amount is exact.

□ Destination amount is exact.

□ Currencies are valid.

□ Fee is explicit.

□ Debit side exists.

□ Credit side exists.

□ operationId is shared.

□ Atomicity is preserved.

□ Retry is idempotent.

□ Reversal behavior exists.
```

---

# Balance Checklist

```text
□ Balance type is defined.

□ Formula is documented.

□ Opening state is defined.

□ Included states are defined.

□ Excluded states are defined.

□ Transfer treatment is defined.

□ Refund treatment is defined.

□ Reversal treatment is defined.

□ Time boundary is defined.

□ Time zone is defined.

□ Policy version exists.

□ Result is reproducible.
```

---

# Budget Checklist

```text
□ Budget ID exists.

□ Owner is identified.

□ Currency is defined.

□ Amount is exact.

□ Period is defined.

□ Accounts are defined.

□ Categories are defined.

□ Included states are defined.

□ Refund behavior is defined.

□ Transfer behavior is defined.

□ Remaining formula is defined.

□ Usage percentage is defined.

□ Snapshot behavior exists.
```

---

# Goal Checklist

```text
□ Goal ID exists.

□ Owner is identified.

□ Target Amount is valid.

□ Currency is defined.

□ Contribution Events exist.

□ Withdrawal behavior is defined.

□ Progress formula is defined.

□ Remaining formula is defined.

□ Completion behavior is defined.

□ Reopening behavior is defined.

□ Linked-Transaction behavior is defined.
```

---

# Recurring Transaction Checklist

```text
□ Recurring ID exists.

□ Owner is identified.

□ Account is identified.

□ Amount is exact.

□ Currency is defined.

□ Schedule is defined.

□ Time zone is defined.

□ End-of-month behavior is defined.

□ Leap-year behavior is defined.

□ Instance identity is stable.

□ Generation is idempotent.

□ Pause and resume behavior are defined.
```

---

# Import Checklist

```text
□ Source-file hash exists.

□ Format is registered.

□ Parser version is known.

□ Locale is defined.

□ Decimal separator is defined.

□ Currency rules are defined.

□ Duplicate detection exists.

□ Preview totals exist.

□ Accepted totals use persisted Resources.

□ Rejected totals are classified.

□ Canonical equality is verified.
```

---

# Export Checklist

```text
□ Export ID exists.

□ Owner scope is defined.

□ Account scope is defined.

□ Date range is defined.

□ Time zone is defined.

□ Currency is defined.

□ Included states are defined.

□ Policy version is included.

□ Data version is included.

□ Detail and summary values reconcile.

□ Content hash exists.
```

---

# Reconciliation Checklist

```text
□ Reconciliation ID exists.

□ Owner is identified.

□ Account is identified.

□ Currency is defined.

□ Period is defined.

□ Opening Reference Balance exists.

□ Closing Reference Balance exists.

□ Reference source is identified.

□ Match rules are defined.

□ Unmatched records are visible.

□ Duplicates are classified.

□ Exclusions have reasons.

□ Adjustments are authorized.

□ Difference formula is correct.

□ Completion criteria pass.

□ Snapshot is preserved.
```

---

# Correction Checklist

```text
□ Correction ID exists.

□ Original Resources are identified.

□ Resulting Resources are identified.

□ Exact difference is known.

□ Currency is known.

□ Reason is defined.

□ Actor is identified.

□ Approval exists where required.

□ operationId exists.

□ Retry is idempotent.

□ Balance is recalculated.

□ Reconciliation is reevaluated.
```

---

# Offline Financial Checklist

```text
□ Offline intent ID exists.

□ operationId is stable.

□ Owner is identified.

□ Account is identified.

□ Amount is validated.

□ Currency is validated.

□ Client and server times are distinct.

□ Backend validation repeats.

□ Retry is idempotent.

□ Conflict behavior is defined.

□ Local values remain provisional.

□ Accepted result returns canonical version.
```

---

# Migration Checklist

```text
□ Migration ID exists.

□ Source version is known.

□ Target version is known.

□ Owner scope is explicit.

□ Account scope is explicit.

□ Exact comparison exists.

□ Rounding comparison exists.

□ Transfer comparison exists.

□ Reconciliation impact is defined.

□ Retry is idempotent.

□ Rollback or forward correction exists.

□ No unexplained difference remains.
```

---

# Incident Checklist

```text
□ Incident category is defined.

□ Severity is assigned.

□ Financial mutation is contained.

□ Canonical Resources are preserved.

□ Policy version is identified.

□ Owner scope is identified.

□ Account scope is identified.

□ Exact amount impact is verified.

□ Independent recalculation is completed.

□ Correction uses approved operations.

□ Reconciliation is reevaluated.

□ Communication uses verified values.
```

---

# Accessibility Checklist

```text
□ Monetary values are announced correctly.

□ Credits and debits are understandable without color.

□ Negative values are explicit.

□ Balance types have clear labels.

□ Pending and Projected values are distinguishable.

□ Reconciliation differences are announced.

□ Financial tables are keyboard accessible.

□ Charts have textual equivalents.

□ Exact values remain available at large text sizes.

□ Errors identify affected financial fields.
```

---

# Final Acceptance Criteria

The Nexio Financial Calculations, Balances and Reconciliation architecture is accepted only when:

1. Every monetary value uses exact representation.

2. Binary floating-point is not authoritative for financial state.

3. Every Money value identifies currency.

4. Every currency defines supported precision.

5. BRL Product amounts use the approved precision.

6. Intermediate calculation precision is explicit.

7. Display formatting remains separate from stored values.

8. Every rounding policy has a stable identifier.

9. Every rounding policy is versioned.

10. Every rounding stage is documented.

11. Allocation preserves the original total.

12. Remainder distribution is deterministic.

13. Overflow is detected.

14. Overflow never truncates silently.

15. Null remains distinct from zero.

16. Ambiguous monetary input is not guessed.

17. Invalid monetary input is rejected safely.

18. Every authoritative formula is registered.

19. Every formula identifies its inputs.

20. Every formula identifies included and excluded states.

21. Every formula identifies currency behavior.

22. Every formula identifies precision.

23. Every formula identifies rounding.

24. Every formula has test vectors.

25. Every financial policy has a stable identifier.

26. Every financial policy is versioned.

27. Historical policy versions remain readable.

28. Policy effective periods are explicit.

29. Policy migration behavior is explicit.

30. Client applications do not become financial authorities.

31. Dashboard formulas do not diverge from backend formulas.

32. Reports use the shared Calculation Engine.

33. Exports use the shared Calculation Engine.

34. Analytics does not redefine financial meaning.

35. Every Transaction has a stable identifier.

36. Every Transaction identifies Owner.

37. Every Transaction identifies Account.

38. Every Transaction identifies type.

39. Every Transaction identifies direction.

40. Every Transaction has an exact amount.

41. Every Transaction identifies currency.

42. Every Transaction has an effective date.

43. Every Transaction has an explicit state.

44. Every Transaction has a Resource version.

45. Every balance-affecting Transaction has operation identity.

46. Draft Transactions do not affect authoritative balance.

47. Scheduled Transactions do not affect Posted Current Balance.

48. Pending treatment is policy-defined.

49. Posted Transactions affect Current Balance.

50. Reconciled Transactions remain Posted financial state.

51. Disputed state does not silently remove financial effect.

52. Reversed Transactions preserve original and reversal records.

53. Cancelled Posted Transactions require financial correction.

54. Posted Transactions cannot be deleted silently.

55. Stale Transaction edits are rejected.

56. Posted amount changes preserve history.

57. Account changes update all affected balances safely.

58. Reconciled Transaction edits use controlled reopening or correction.

59. Refunds reference eligible original Transactions where possible.

60. Total Refunds do not exceed approved original amount without explicit authority.

61. Reversals reference original Resources.

62. Reversals do not exceed the remaining unreversed amount.

63. Every Transfer has a stable identifier.

64. Every Transfer identifies Owner.

65. Every Transfer identifies source Account.

66. Every Transfer identifies destination Account.

67. Transfer sides share operation identity.

68. Same-currency Transfer principal amounts reconcile.

69. Transfer fees are explicit.

70. Cross-currency Transfers preserve both monetary values.

71. Cross-currency Transfers preserve exchange-rate metadata.

72. Posted Transfers contain both required sides.

73. Partial Transfers are not presented as completed.

74. Internal Transfers are atomic where supported.

75. Transfer Retry is idempotent.

76. Transfer compensation is explicit.

77. Transfer reversal affects both sides.

78. Same-Owner internal Transfer principal has zero Owner-wide net effect.

79. Cross-Owner Transfer logic requires a separately approved model.

80. Every Account has a stable identifier.

81. Every Account identifies Owner.

82. Every Account identifies currency.

83. Account currency is not changed casually after financial activity.

84. Opening Balance is explicit.

85. Opening Balance changes preserve history.

86. Account states are controlled.

87. Archiving does not alter financial balance.

88. Closing records final financial state.

89. Every balance label has one meaning.

90. Current Balance has a formal formula.

91. Available Balance has a formal formula.

92. Pending Balance has a formal formula.

93. Projected Balance has a formal formula.

94. Reconciled Balance has a formal formula.

95. Period Opening Balance has a formal formula.

96. Period Closing Balance has a formal formula.

97. Period boundaries are explicit.

98. Reporting time zone is explicit.

99. Effective date remains distinct from creation time.

100. Backdated Transactions invalidate affected derived state.

101. Future-dated Transactions do not become Posted automatically without policy.

102. Balance Events have stable identifiers.

103. Balance Events identify source Resources.

104. Balance Events identify Owner and Account.

105. Balance Events identify signed amount and currency.

106. Financial sequences are monotonic where used.

107. Sequence gaps are detectable.

108. Balance rebuild is deterministic.

109. Incremental updates validate sequence continuity.

110. Invalid incremental updates trigger rebuild.

111. Balance Snapshots have stable identifiers.

112. Balance Snapshots identify policy and data versions.

113. Balance Snapshots identify the last included Event.

114. Balance Snapshots support integrity verification.

115. Balance Snapshots remain reproducible.

116. Stale snapshots are not presented as current.

117. Invalid snapshots are not presented as verified.

118. Balance caches include Owner scope.

119. Balance caches include Account scope.

120. Balance caches include financial-data version.

121. Cross-Owner Balance cache use is Critical.

122. Cash Inflow is formally defined.

123. Cash Outflow is formally defined.

124. Net Cash Flow is formally defined.

125. Internal Transfers do not inflate Owner-wide income or expense.

126. Single-Account Transfers remain visible as Transfers.

127. Gross and net values remain distinct.

128. Period comparison defines zero-denominator behavior.

129. Category totals include Uncategorized Transactions.

130. Category hierarchies do not double count.

131. Sorting does not change totals.

132. Pagination does not redefine full-result totals.

133. Filtering clearly identifies whether totals are filtered.

134. Every Budget has a stable identifier.

135. Every Budget identifies Owner.

136. Every Budget identifies currency.

137. Every Budget defines amount and period.

138. Budget consumption uses approved Transaction states.

139. Budget Remaining is reproducible.

140. Budget Overspending is reproducible.

141. Budget percentage uses a valid denominator.

142. Refund treatment is explicit.

143. Transfer treatment is explicit.

144. Budget scope overlap is documented.

145. Budget Snapshot behavior is defined.

146. Budget updates preserve prior values.

147. Every Goal has a stable identifier.

148. Every Goal identifies Owner.

149. Every Goal identifies currency.

150. Goal Target Amount is greater than zero.

151. Goal Current Amount derives from contribution Events.

152. Goal withdrawals use explicit Events.

153. Goal adjustments require reasons.

154. Goal progress is reproducible.

155. Goal completion behavior is explicit.

156. Goal reopening behavior is explicit.

157. Linked Transaction reversal reevaluates Goal state.

158. Informational Goals do not falsely imply reserved funds.

159. Every Recurring Transaction has a stable identifier.

160. Every recurring schedule has a time zone.

161. End-of-month behavior is defined.

162. Leap-year behavior is defined.

163. Every occurrence has a stable instance identifier.

164. Every occurrence creates at most one canonical Transaction.

165. Recurring Retry is idempotent.

166. Pause behavior is explicit.

167. Resume behavior is explicit.

168. Missed occurrence behavior is explicit.

169. Previously Posted instances do not change after Template updates.

170. Recurring projections remain distinct from Posted values.

171. Every Projection has a defined horizon.

172. Every Projection identifies policy and data sources.

173. Projection confidence is explicit.

174. Stale Projections are identifiable.

175. Projected Balance never replaces Current Balance.

176. Every Import format is registered.

177. Every Import parser is versioned.

178. Import amount parsing is locale-aware.

179. Import currency parsing is explicit.

180. Import preview totals are provisional.

181. Import accepted totals derive from persisted canonical Transactions.

182. Import rejected totals are classified.

183. Import duplicate candidates remain reviewable.

184. Import row hashes identify normalization version.

185. Successful Import totals reconcile with canonical created totals.

186. Import rollback preserves Posted financial history.

187. Every financial Export defines scope and period.

188. Every financial Export identifies policy version.

189. Every financial Export identifies data version.

190. Every financial Export uses exact monetary representation.

191. Export detail and summary values reconcile.

192. Export formatting rules are explicit.

193. Export content integrity is verifiable.

194. Every Reconciliation has a stable identifier.

195. Every Reconciliation identifies Owner and Account.

196. Every Reconciliation identifies currency.

197. Every Reconciliation defines period and time zone.

198. Reconciliation states are controlled.

199. Opening Reference Balance is explicit.

200. Closing Reference Balance is explicit.

201. Calculated Closing Balance is reproducible.

202. Reconciliation Difference has a formal formula.

203. Ordinary BRL reconciliation does not accept unexplained tolerance.

204. Reference sources are identifiable.

205. Reference Records have stable identifiers.

206. Reconciliation Matches have stable identifiers.

207. Match Rules are versioned.

208. Exact matches verify amount and currency.

209. One-to-many matches verify exact sum.

210. Many-to-one matches verify exact sum.

211. Partial matches preserve remaining amount.

212. Suggested matches remain non-final until accepted.

213. Manual matches require authority.

214. Match conflicts block completion.

215. Unmatched records remain visible.

216. Duplicate records are classified.

217. Exclusions require controlled reasons.

218. Adjustments require exact amount and reason.

219. Adjustments do not conceal unexplained differences.

220. Reconciliation completion validates every precondition.

221. Completed Reconciliations preserve immutable snapshots.

222. Completed Reconciliations are not silently edited.

223. Reopening preserves previous completion Evidence.

224. Reopening requires reason and authority.

225. Consecutive periods verify balance continuity.

226. Reconciliation gaps remain visible.

227. Backdated Transactions trigger completed-period review.

228. Transfer sides may reconcile independently while preserving Transfer identity.

229. Offline financial intents remain provisional.

230. Offline operations use stable operation identity.

231. Offline Retry does not duplicate financial state.

232. Backend validation repeats client validation.

233. Offline conflicts do not overwrite newer financial state silently.

234. Client-created time remains distinct from server-posted time.

235. Unsynchronized values do not alter verified backend Current Balance.

236. Financial mutations use concurrency control.

237. Stale Resource versions are rejected.

238. Database deadlock Retry preserves idempotency.

239. Queue redelivery does not duplicate financial mutation.

240. Every Financial Correction has a stable identifier.

241. Corrections preserve original Resources.

242. Corrections identify exact difference.

243. Corrections identify reason and Actor.

244. High-impact corrections require approval.

245. Correction Retry is idempotent.

246. Corrections recalculate affected balances.

247. Corrections reevaluate affected reconciliation.

248. Corrections reevaluate Budgets where applicable.

249. Corrections reevaluate Goals where applicable.

250. Unauthorized corrections are treated as Critical.

251. Financial orphan records are detectable.

252. Financial duplicate records are detectable.

253. Posted Transactions missing Balance Events are detectable.

254. One-sided Transfers are detectable.

255. Snapshot mismatches are detectable.

256. Financial consistency states are explicit.

257. Needs-Recalculation remains distinct from Inconsistent.

258. Needs-Reconciliation remains distinct from internal inconsistency.

259. Financial monitoring covers calculation failures.

260. Financial monitoring covers currency mismatches.

261. Financial monitoring covers Transfer integrity.

262. Financial monitoring covers Balance integrity.

263. Financial monitoring covers Budget integrity.

264. Financial monitoring covers Goal integrity.

265. Financial monitoring covers recurring generation.

266. Financial monitoring covers Import and Export equality.

267. Financial monitoring covers reconciliation.

268. Financial monitoring covers corrections.

269. Financial SLOs are defined.

270. Zero-tolerance financial failures are excluded from error budgets.

271. Critical financial alerts exist.

272. Alerts identify responsible owners and runbooks.

273. Alerts minimize private financial information.

274. Incorrect Balance Incidents trigger independent recalculation.

275. Cross-Owner financial Incidents trigger Security and Privacy response.

276. Duplicate Transactions are corrected through governed operations.

277. One-sided Transfers trigger containment and compensation review.

278. Incorrect rounding identifies affected policy versions.

279. Currency mismatches stop affected calculations.

280. Overflow never returns truncated authoritative values.

281. Missing Balance Events are repaired through governed workflows.

282. Reconciliation defects preserve previous snapshots.

283. Import total mismatches block safe completion.

284. Export total mismatches invalidate affected exports.

285. Financial migration defects stop rollout.

286. Financial Incident communication uses verified exact values.

287. Financial tests cover Money representation.

288. Financial tests cover precision and rounding.

289. Financial tests cover Transaction states.

290. Financial tests cover Transfer atomicity.

291. Financial tests cover idempotency.

292. Financial tests cover Balance formulas.

293. Financial tests cover historical reconstruction.

294. Financial tests cover Budgets and Goals.

295. Financial tests cover recurring generation.

296. Financial tests cover Import and Export equality.

297. Financial tests cover reconciliation.

298. Financial tests cover corrections.

299. Financial tests cover concurrency.

300. Financial tests cover Owner isolation.

301. Shared golden test vectors exist.

302. Property-based financial invariants are tested.

303. Mutation tests detect sign, state and Owner-filter defects.

304. Performance optimization does not weaken exactness.

305. Financial interfaces meet Accessibility requirements.

306. Credits and debits are not represented by color alone.

307. Pending and Projected values are clearly identified.

308. Financial charts have textual equivalents.

309. Financial migrations preserve exact amounts.

310. Financial migrations preserve currencies.

311. Financial migrations preserve Owner and Account scope.

312. Financial migrations preserve identifiers where possible.

313. Financial migrations preserve historical state.

314. Financial migrations preserve Audit Evidence.

315. Financial migrations are idempotent.

316. Financial migration comparisons use exact approved formulas.

317. Unexplained migration differences block completion.

318. Financial migration rollback or forward correction exists.

319. Financial backups preserve canonical Resources.

320. Financial backups preserve Balance Events and sequences.

321. Financial backups preserve policies and reconciliation.

322. Restored financial state is recalculated and verified.

323. Financial releases declare policy and schema versions.

324. Unsafe financial changes block release.

325. Post-release financial verification is required.

326. Support cannot directly edit verified balances.

327. Support cannot create unexplained adjustments.

328. Support escalates one-sided Transfers.

329. Support escalates unexplained reconciliation differences.

330. Privileged financial Roles are reviewed periodically.

331. Financial access remains Owner- and Account-scoped.

332. AI may assist with financial explanation and suggestions.

333. AI cannot become the authoritative Calculation Engine.

334. AI cannot approve corrections.

335. AI cannot complete reconciliation.

336. AI cannot delete financial history.

337. AI cannot suppress differences.

338. AI cannot present Projection as Posted state.

339. AI-generated financial explanations identify value state.

340. Every material financial value remains reproducible from canonical Resources and approved policies.

---

# Financial Calculations, Balances and Reconciliation Constitutional Rule

Every Nexio financial amount, Transaction, Transfer, Account balance, Budget total, Goal total, recurring occurrence, projection, Import total, Export total, reconciliation result, adjustment, correction and financial snapshot must answer:

```text
Which canonical Owner and Account does the value belong to?

Which exact monetary representation is used?

Which currency and precision apply?

Which financial Resources contribute to the value?

Which Resource states are included?

Which Resource states are excluded?

Which signed financial effects apply?

Which effective dates and reporting time zone apply?

Which Transfer, Refund, Reversal and Adjustment rules apply?

Which financial-policy and rounding-policy versions apply?

Which financial-data version was calculated?

Which operationId and Resource versions produced the state?

Which exact result was generated?

Which Evidence independently reproduces the result?
```

When the answer is uncertain, Nexio must prefer the action that:

- Stops further affected financial mutation.
- Preserves original financial Resources.
- Preserves exact monetary values.
- Preserves operation identity.
- Preserves Audit Evidence.
- Rejects ambiguous input.
- Rejects unsupported currency combinations.
- Prevents duplicate processing.
- Prevents one-sided Transfers.
- Invalidates unreliable snapshots.
- Recalculates through approved policies.
- Reopens affected reconciliation.
- Requires controlled correction.
- Escalates unexplained differences.
- Blocks the release.

A displayed amount is not authoritative merely because it appears in the interface.

A cached balance is not authoritative merely because it was previously correct.

A snapshot is not authoritative merely because it exists.

A reconciliation is not complete merely because it was marked complete.

A financial correction is not valid merely because the final balance matches an expected amount.

Financial state is authoritative only when it is produced from exact canonical Resources, valid Owner and Account scope, approved Transaction states, versioned calculation and rounding policies, deterministic formulas, idempotent operations, complete Transfer effects, controlled corrections and independently verifiable Evidence.

Nexio must never invent a Transaction, silently delete a Posted effect, hide a reconciliation difference, truncate an overflow, use another Owner's financial Resource, alter historical policy meaning or create an unexplained Adjustment merely to make a value appear correct.

---

# Final Authority

This document is the official Financial Calculations, Balances and Reconciliation specification for Nexio.

All future:

- Money types.
- Monetary fields.
- Decimal representations.
- Currency metadata.
- Precision rules.
- Scale rules.
- Rounding policies.
- Allocation policies.
- Percentage calculations.
- Financial formulas.
- Financial policies.
- Calculation Engines.
- Balance Engines.
- Transactions.
- Transaction types.
- Transaction states.
- Transaction mutations.
- Income.
- Expenses.
- Transfers.
- Transfer fees.
- Cross-currency Transfers.
- Refunds.
- Reversals.
- Adjustments.
- Financial Corrections.
- Accounts.
- Opening Balances.
- Current Balances.
- Available Balances.
- Pending Balances.
- Projected Balances.
- Reconciled Balances.
- Historical Balances.
- Balance Events.
- Financial sequences.
- Balance Snapshots.
- Balance caches.
- Cash Flow.
- Period income.
- Period expenses.
- Category totals.
- Budgets.
- Budget Snapshots.
- Goals.
- Goal contributions.
- Goal withdrawals.
- Recurring Transactions.
- Recurring instances.
- Financial projections.
- Import amount parsing.
- Import financial previews.
- Import accepted totals.
- Import duplicate detection.
- Export financial totals.
- Financial dashboards.
- Financial reports.
- Financial charts.
- Reconciliation sessions.
- Reconciliation Reference Records.
- Reconciliation Matches.
- Match Rules.
- Reconciliation adjustments.
- Reconciliation Snapshots.
- Reconciliation reopening.
- Offline financial intents.
- Financial synchronization.
- Financial idempotency.
- Financial concurrency.
- Financial monitoring.
- Financial SLOs.
- Financial metrics.
- Financial alerts.
- Financial Incidents.
- Financial migrations.
- Financial backups.
- Financial restores.
- Financial release certification.
- Financial Support workflows.
- AI-assisted financial workflows.

must comply with this specification.

Exceptions require a documented Product, Financial, Money, Calculation, Balance, Transaction, Transfer, Budget, Goal, Recurring Transaction, Import, Export, Reconciliation, Security, Privacy, Legal, Compliance, Accessibility, Database, Storage, Android, Web, Backend, Operations, Support, Data, AI or Release decision containing:

- Financial policy identifier.
- Formula identifier.
- Purpose.
- Canonical Resources.
- Owner scope.
- Account scope.
- Currency.
- Precision.
- Scale.
- Rounding mode.
- Rounding stage.
- Included states.
- Excluded states.
- Time boundaries.
- Reporting time zone.
- Transfer behavior.
- Refund behavior.
- Reversal behavior.
- Adjustment behavior.
- Idempotency.
- Concurrency.
- Calculation-policy version.
- Financial-data version.
- Migration behavior.
- Reconciliation impact.
- Security impact.
- Privacy impact.
- Accessibility impact.
- Monitoring.
- Alerts.
- Rollback.
- Correction.
- Required approvers.

Imprecise Money representation, undocumented formulas, inconsistent balance meanings, client-only financial authority, silent rounding, one-sided Transfers, duplicate financial mutations, direct deletion of Posted history, unexplained adjustments, unsupported reconciliation tolerance, cross-Owner financial aggregation, unverifiable snapshots, unapproved policy changes, inconsistent exports, missing migration comparisons and unsupported AI financial claims are considered Product, financial-integrity, Security, Privacy, Accessibility, operational, Support and governance debt.

---