# Nexio Reporting, Analytics, Dashboards and Insights Specification

Version: 1.0  
Status: Official  
Authority Level: Platform Reporting, Data Presentation and Decision-Support Standard  
Applies To: Web Application, Android Application, Backend Services, APIs, Database, Financial Calculation Engine, Dashboards, Reports, Charts, Exports, Analytics, Goals, Budgets, Cash Flow, Transactions, Accounts, Notifications, AI-Assisted Insights, Support, Audit, Privacy, Security and Operations

---

# Purpose

This specification defines the official Reporting, Analytics, Dashboards and Insights architecture for Nexio.

It establishes how Nexio must:

- Present financial information accurately.
- Generate reproducible Dashboards and Reports.
- Distinguish canonical financial results from presentation-only aggregations.
- Define reporting periods, filters, Account scopes and currencies.
- Preserve consistency between Dashboard cards, charts, detailed lists, Reports and Exports.
- Prevent double counting.
- Prevent cross-Owner data aggregation.
- Explain the origin of every material displayed value.
- Manage current, historical, pending, projected and reconciled values.
- Present empty, loading, unavailable, stale and error states correctly.
- Support Android, Web and responsive interfaces consistently.
- Protect sensitive financial and behavioral information.
- Govern Product Analytics independently from Owner financial reporting.
- Produce safe and explainable financial Insights.
- Control AI-assisted summaries and recommendations.
- Support Accessibility.
- Support investigation, Support and Audit reconstruction.
- Preserve calculation-policy and data-version references.
- Prevent misleading visualizations.
- Ensure that decisions based on Nexio data use trustworthy and clearly scoped information.

This document applies to every Nexio component that calculates, aggregates, filters, formats, visualizes, summarizes, compares, exports, interprets or explains Owner, Account, Transaction, Budget, Goal, Cash Flow, reconciliation or Product-usage information.

---

# Constitutional Principle

Every material value, total, chart, comparison, Report, Dashboard card or Insight presented by Nexio must be traceable to:

```text
A canonical Owner

A defined Account scope

A defined financial or analytical data source

A defined reporting period

A defined reporting time zone

A defined currency

A registered calculation or aggregation policy

A defined set of included records

A defined set of excluded records

A defined filter state

A financial-data or analytical-data version

A generation timestamp

A freshness state

An integrity and confidence state
```

A displayed result must answer:

```text
What does this value represent?

Which records contributed to it?

Which records were excluded?

Which Accounts were included?

Which period was evaluated?

Which time zone was applied?

Which currency was used?

Which Transaction states were included?

How were Transfers treated?

How were Refunds, Reversals and Adjustments treated?

Was the value calculated, cached, projected or estimated?

When was it generated?

Is it current, stale, partial or unavailable?

Can it be independently reproduced?
```

No Dashboard, Report, chart, Export, Analytics Event or AI-generated Insight may become an unexplained alternative source of financial truth.

---

# Reporting Objectives

The Nexio Reporting architecture shall provide:

```text
Accuracy

Reproducibility

Consistency

Explainability

Owner Isolation

Clear Scope

Explicit Time

Explicit Currency

Visual Integrity

Accessibility

Data Minimization

Freshness Transparency

Controlled Comparison

Safe Insights

Cross-Platform Consistency
```

---

# Accuracy

Every material displayed value must match the authoritative Calculation Engine result for the same:

- Owner.
- Account scope.
- Currency.
- Reporting period.
- Time zone.
- Transaction-state policy.
- Transfer policy.
- Reconciliation policy.
- Financial-data version.
- Calculation-policy version.

Presentation layers must not modify authoritative values through hidden arithmetic.

---

# Reproducibility

A material Report must be reproducible from:

```text
Report type

Owner scope

Account scope

Date range

Reporting time zone

Currency

Filters

Sort state where relevant

Included Resource states

Calculation-policy version

Financial-data version

Report schema version
```

---

# Consistency

The same financial question must produce the same result across:

- Dashboard.
- Detailed Report.
- Android.
- Web.
- Export.
- Support-safe view.
- Recalculation.
- Financial investigation.

Example:

```text
Dashboard Expense Total for July 2026

=

Expense Report Total for July 2026

=

Exported Expense Total for July 2026
```

when all scopes, policies and data versions are equal.

---

# Explainability

Nexio should allow an Owner or authorized reviewer to understand why a value appears.

A value explanation may include:

- Period.
- Account scope.
- Included Transaction types.
- Excluded states.
- Transfer treatment.
- Currency.
- Calculation time.
- Freshness.
- Link to contributing records.
- Comparison baseline.

---

# Owner Isolation

Reporting queries, caches, snapshots and visualizations must preserve Owner boundaries.

A Report must never include:

- Another Owner's Account.
- Another Owner's Transaction.
- Another Owner's Budget.
- Another Owner's Goal.
- Another Owner's Export.
- Another Owner's Analytics profile.
- Another Owner's cached Dashboard result.

Cross-Owner reporting exposure is a Critical Security, Privacy and Financial Integrity failure.

---

# Clear Scope

Every financial visualization must make its scope understandable.

Scope may include:

```text
All active Accounts

Selected Accounts

One Account

All categories

Selected categories

One Budget

One Goal

One reporting period

One reconciliation period
```

A value must not appear to represent all Accounts when it represents only one selected Account.

---

# Explicit Time

Every Report must define:

- Period start.
- Period end.
- Boundary semantics.
- Reporting time zone.
- Effective-date policy.
- Generation time.

---

# Explicit Currency

Every monetary Report must identify its currency.

Values in incompatible currencies must not be added together without an approved conversion policy.

---

# Visual Integrity

Visualizations must not exaggerate, hide or distort financial meaning.

This includes:

- Appropriate axes.
- Accurate labels.
- Consistent scales.
- Clear zero baselines where required.
- Visible missing data.
- Distinction between positive and negative values.
- Distinction between Posted and Projected values.
- Distinction between exact and estimated values.

---

# Accessibility

Reporting interfaces must be usable through:

- Keyboard navigation.
- Screen readers.
- Text scaling.
- High contrast.
- Reduced motion.
- Accessible tables.
- Textual chart alternatives.
- Programmatic labels.
- Announced status changes.

Color must not be the only means of communicating financial meaning.

---

# Data Minimization

Reports and Analytics must use only the information required for their purpose.

A Dashboard card showing a total does not require unrestricted access to all Transaction descriptions or Attachments.

---

# Freshness Transparency

Every material derived value should expose or internally preserve its freshness state.

Recommended states include:

```text
Current

NearCurrent

Stale

Recalculating

Partial

Unavailable

VerificationFailed
```

---

# Controlled Comparison

Comparisons must define:

- Current period.
- Baseline period.
- Equivalent duration.
- Equivalent scope.
- Equivalent currency.
- Equivalent calculation policy.
- Zero-baseline behavior.
- Missing-data behavior.

---

# Safe Insights

Insights must distinguish:

```text
Verified fact

Calculated trend

Statistical observation

Projection

Suggestion

AI-generated interpretation

Unknown
```

An Insight must not represent an estimate or suggestion as a confirmed financial fact.

---

# Scope

This specification governs:

- Home Dashboard.
- Financial overview.
- Account overview.
- Transaction summaries.
- Cash Flow Reports.
- Income Reports.
- Expense Reports.
- Category Reports.
- Budget Reports.
- Goal Reports.
- Recurring Transaction Reports.
- Reconciliation Reports.
- Import Reports.
- Export Reports.
- Historical Reports.
- Comparative Reports.
- Charts.
- Tables.
- Summary cards.
- Filters.
- Sorting.
- Pagination.
- Search.
- Report snapshots.
- Report caches.
- Product Analytics.
- Operational Analytics.
- Financial Insights.
- AI-assisted summaries.
- Notifications derived from reporting.
- Support-safe reporting.
- Audit and investigation reporting.

---

# Out of Scope

This document does not independently define:

- Canonical financial formulas.
- Authentication.
- Authorization.
- Financial mutation.
- Transaction persistence.
- Secret Management.
- Advertising analytics.
- Regulated financial advice.
- Tax reporting.
- Investment recommendations.
- External accounting certification.

Those capabilities must integrate with this specification.

---

# Reporting Domains

Nexio reporting is organized into:

```text
Dashboard

Account Reporting

Transaction Reporting

Cash Flow

Income

Expense

Category

Budget

Goal

Recurring Transaction

Projection

Reconciliation

Import

Export

Historical Reporting

Comparative Reporting

Product Analytics

Operational Analytics

Financial Insights

AI-Assisted Insights

Support Reporting

Audit Reporting
```

---

# Dashboard Domain

The Dashboard domain defines:

- Summary cards.
- Current balances.
- Income and Expense summaries.
- Cash Flow.
- Recent Transactions.
- Budget status.
- Goal progress.
- Notifications.
- Financial trends.
- Quick actions.
- Empty states.
- Loading states.
- Freshness.

---

# Account Reporting Domain

The Account Reporting domain defines:

- Current Balance.
- Available Balance.
- Pending Balance.
- Projected Balance.
- Account activity.
- Historical balance.
- Transfer activity.
- Reconciliation state.
- Account-specific charts.

---

# Transaction Reporting Domain

The Transaction Reporting domain defines:

- Transaction list.
- Transaction search.
- Transaction filters.
- Income and Expense grouping.
- Category grouping.
- Date grouping.
- Status grouping.
- Transaction totals.
- Pagination.
- Sorting.
- Export.

---

# Cash Flow Domain

The Cash Flow domain defines:

- Cash Inflow.
- Cash Outflow.
- Net Cash Flow.
- Opening Balance.
- Closing Balance.
- Period comparison.
- Account scope.
- Internal Transfer treatment.
- Projected Cash Flow.

---

# Income Domain

The Income domain defines:

- Total income.
- Income by period.
- Income by category.
- Income by Account.
- Recurring income.
- Expected income.
- Income comparison.
- Refund and Transfer exclusions.

---

# Expense Domain

The Expense domain defines:

- Total expenses.
- Expense by period.
- Expense by category.
- Expense by Account.
- Recurring expenses.
- Expected expenses.
- Expense comparison.
- Refund treatment.
- Transfer exclusions.
- Fee treatment.

---

# Category Domain

The Category domain defines:

- Category totals.
- Category hierarchy.
- Uncategorized values.
- Percentage of total.
- Category trend.
- Category comparison.
- Category reclassification effects.
- Double-counting prevention.

---

# Budget Reporting Domain

The Budget Reporting domain defines:

- Budget amount.
- Consumed amount.
- Remaining amount.
- Overspending amount.
- Usage percentage.
- Period.
- Category scope.
- Account scope.
- Included Transaction states.
- Budget history.
- Budget comparison.

---

# Goal Reporting Domain

The Goal Reporting domain defines:

- Target amount.
- Current amount.
- Remaining amount.
- Excess amount.
- Progress percentage.
- Contributions.
- Withdrawals.
- Target date.
- Completion state.
- Goal forecast.
- Goal history.

---

# Recurring Transaction Reporting Domain

The Recurring Transaction Reporting domain defines:

- Active recurrence templates.
- Upcoming occurrences.
- Generated instances.
- Skipped occurrences.
- Failed occurrences.
- Projected financial impact.
- Schedule state.
- Duplicate-generation warnings.

---

# Projection Reporting Domain

The Projection Reporting domain defines:

- Projection horizon.
- Starting balance.
- Expected credits.
- Expected debits.
- Projected closing balance.
- Included scheduled records.
- Included recurring occurrences.
- Confidence.
- Freshness.
- Assumptions.

---

# Reconciliation Reporting Domain

The Reconciliation Reporting domain defines:

- Reconciliation period.
- Opening Reference Balance.
- Closing Reference Balance.
- Calculated Closing Balance.
- Difference.
- Matched records.
- Unmatched records.
- Duplicates.
- Adjustments.
- Completion state.
- Reopening history.

---

# Import Reporting Domain

The Import Reporting domain defines:

- Source file.
- Rows received.
- Rows accepted.
- Rows rejected.
- Duplicate candidates.
- Total credits.
- Total debits.
- Net effect.
- Import state.
- Parser version.
- Balance recalculation state.

---

# Export Reporting Domain

The Export Reporting domain defines:

- Export scope.
- Export period.
- Export format.
- Generation state.
- File expiration.
- Download status.
- Record count.
- Financial totals.
- Policy version.
- Data version.

---

# Historical Reporting Domain

The Historical Reporting domain defines:

- Historical balances.
- Historical Transaction state.
- Historical Budget state.
- Historical Goal state.
- Historical reconciliation.
- Calculation-policy version.
- Data-version reconstruction.
- Corrections and Reversals.

---

# Comparative Reporting Domain

The Comparative Reporting domain defines:

- Current versus previous period.
- Month-over-month comparison.
- Year-over-year comparison.
- Account comparison.
- Category comparison.
- Budget comparison.
- Goal comparison.
- Percentage change.
- Absolute change.
- Baseline validation.

---

# Product Analytics Domain

The Product Analytics domain measures how Nexio capabilities are used.

Examples include:

- Screen views.
- Feature adoption.
- Workflow completion.
- Error frequency.
- Onboarding progress.
- Export initiation.
- Budget creation.
- Goal creation.
- Notification interaction.

Product Analytics must remain separate from canonical Owner financial Reports.

---

# Operational Analytics Domain

Operational Analytics measures Platform health and behavior.

Examples include:

- API latency.
- Background-job completion.
- Import processing time.
- Export processing time.
- Synchronization failures.
- Calculation failures.
- Cache freshness.
- Provider failures.

---

# Financial Insights Domain

Financial Insights interpret verified financial calculations.

Examples include:

- Expense increase.
- Income decrease.
- Budget risk.
- Goal progress.
- Recurring Expense concentration.
- Unusual period variation.
- Projected negative balance.

Insights must preserve their source calculation.

---

# AI-Assisted Insights Domain

AI-Assisted Insights may explain or summarize verified financial information.

AI must not independently become:

- A Calculation Engine.
- A financial authority.
- A correction authority.
- A reconciliation authority.
- A source of missing Transactions.
- A source of regulated financial advice.

---

# Support Reporting Domain

Support Reporting provides safe, case-scoped summaries.

It may include:

- Report state.
- Calculation state.
- Safe Account references.
- Period.
- Record-count buckets.
- Error identifiers.
- Recalculation status.
- Export status.
- Reconciliation status.

---

# Audit Reporting Domain

Audit Reporting supports:

- Financial reconstruction.
- Security investigation.
- Privacy review.
- Compliance review.
- Support escalation.
- Incident timelines.
- Evidence packages.

Audit Reports must remain distinct from ordinary Owner-facing Reports.

---

# Core Reporting Principles

The Nexio Reporting architecture is governed by:

```text
Canonical Source

Deterministic Aggregation

Scope Transparency

Filter Transparency

Time-Boundary Consistency

Currency Consistency

No Double Counting

Freshness Visibility

Exact Value Preservation

Visual Honesty

Accessible Presentation

Owner Isolation

Reproducibility

Controlled Interpretation
```

---

# Canonical Source

Every material reporting value must originate from:

- Canonical financial Resources.
- The authoritative Calculation Engine.
- Approved Reporting Snapshots.
- Approved Analytics datasets.
- Verified Provider data where explicitly required.

The interface must not invent or manually maintain independent totals.

---

# Deterministic Aggregation

Given the same source data, scope, filters and policy version, the same Report must produce the same result.

---

# Scope Transparency

Every Report should display or make available:

```text
Selected Accounts

Selected period

Selected categories

Selected Transaction states

Currency

Transfer treatment

Comparison baseline
```

---

# Filter Transparency

When filters are active, the interface must clearly identify them.

A user must be able to distinguish:

```text
Total for all records

from

Total for filtered records
```

---

# Time-Boundary Consistency

The same period definition must be shared across:

- Summary cards.
- Charts.
- Tables.
- Exports.
- Notifications.
- Insights.

---

# Currency Consistency

A Report must not display one currency symbol while aggregating values in another currency.

---

# No Double Counting

A financial Resource must not be counted more than once in the same aggregation unless the Report explicitly presents multiple non-additive dimensions.

---

# Freshness Visibility

A stale value must not be presented as current without an approved freshness policy.

---

# Exact Value Preservation

Charts and summaries may abbreviate values visually.

The exact authoritative value must remain available.

Example:

```text
Exact value:
R$ 1.250.000,00

Abbreviated display:
R$ 1,25 mi
```

The abbreviation must not replace the canonical value in exports or Accessibility text.

---

# Visual Honesty

Visual design must not:

- Hide negative values.
- Truncate important differences.
- Use misleading axis ranges.
- Imply certainty for projections.
- Represent missing data as zero.
- Represent partial data as complete.
- Use decorative proportions unrelated to actual values.

---

# Accessible Presentation

Every material chart must have an equivalent textual or tabular representation.

---

# Controlled Interpretation

Calculated facts and interpretations must remain distinguishable.

Example:

```text
Calculated fact:
Expenses were R$ 2.500,00 in July.

Comparison:
Expenses were R$ 500,00 higher than in June.

Interpretation:
The increase was concentrated in the Transport category.

Suggestion:
Review recurring Transport expenses.
```

---

# Canonical Report Model

A canonical Report should follow a shared model.

Recommended structure:

```text
Report
 ├── reportId
 ├── reportType
 ├── reportSchemaVersion
 ├── ownerId
 ├── accountScope
 ├── categoryScope
 ├── period
 ├── reportingTimeZone
 ├── currency
 ├── filters
 ├── sort
 ├── calculationPolicyVersion
 ├── reportingPolicyVersion
 ├── financialDataVersion
 ├── freshnessState
 ├── resultState
 ├── generatedAt
 ├── expiresAt
 ├── contentHash
 └── metadata
```

---

# Report Identifier

Every material generated Report should have a stable identifier.

Recommended format:

```text
rpt_<sortable-unique-identifier>
```

---

# Report Types

Recommended controlled Report types include:

```text
FinancialOverview

AccountSummary

TransactionSummary

IncomeSummary

ExpenseSummary

CashFlow

CategoryBreakdown

BudgetPerformance

GoalProgress

RecurringTransactionSummary

Projection

ReconciliationSummary

ImportSummary

ExportSummary

HistoricalBalance

PeriodComparison

FinancialInvestigation
```

---

# Report Schema Version

`reportSchemaVersion` identifies the structure of the Report result.

Report consumers must not assume that all historical Reports use the current schema.

---

# Reporting Policy Version

A Reporting policy defines:

- Scope behavior.
- Grouping.
- Sorting.
- Transfer presentation.
- Empty-state behavior.
- Comparison behavior.
- Visualization rules.
- Freshness rules.

It must not redefine canonical financial formulas.

---

# Report Owner Context

Every Owner-related Report must identify the canonical `ownerId`.

Owner identity must be resolved through trusted backend context.

It must not be accepted solely from:

- URL parameters.
- Client storage.
- Query strings.
- Android preferences.
- Report filter payloads.

---

# Report Account Scope

Recommended Account scopes include:

```text
AllEligibleAccounts

SelectedAccounts

SingleAccount
```

The resolved Account identifiers should be preserved in Report metadata.

---

# All-Eligible-Accounts Scope

This scope includes all Accounts that:

- Belong to the Owner.
- Are eligible under the Report policy.
- Match the selected Account-state policy.
- Match the selected currency policy.

Archived or Closed Account behavior must be explicit.

---

# Selected-Accounts Scope

The Report must validate that every selected Account belongs to the canonical Owner.

---

# Single-Account Scope

The Report should display the selected Account name, currency and state clearly.

---

# Category Scope

Category scope may include:

```text
AllCategories

SelectedCategories

SingleCategory

Uncategorized

CategorySubtree
```

---

# Category-Subtree Scope

A Category-subtree Report must define whether the parent total includes:

- Direct Transactions.
- Descendant Transactions.
- Both.

Double counting must be prevented.

---

# Report Period Model

Recommended structure:

```text
ReportPeriod
 ├── periodType
 ├── start
 ├── end
 ├── reportingTimeZone
 ├── startInclusive
 └── endExclusive
```

---

# Report Period Types

Potential values include:

```text
Today

CurrentWeek

CurrentMonth

CurrentQuarter

CurrentYear

PreviousWeek

PreviousMonth

PreviousQuarter

PreviousYear

Custom

AllTime
```

---

# Current-Month Period

For July 2026 in the reporting time zone:

```text
Start:
2026-07-01T00:00:00

End:
2026-08-01T00:00:00
```

Recommended semantics:

```text
Start inclusive

End exclusive
```

---

# All-Time Period

An All-Time Report must still define:

- Earliest eligible financial Event.
- `asOf` time.
- Account scope.
- Currency.
- Policy version.
- Data version.

---

# Custom Period

A custom period must validate:

- Start exists.
- End exists.
- Start is before End.
- Maximum range is respected.
- Time zone is valid.
- Data availability covers the period.

---

# Reporting Time Zone

The reporting time zone should use the approved Owner or Account reporting policy.

It must remain distinct from:

- Device time zone.
- Browser time zone.
- Server time zone.
- UTC.
- Provider statement time zone.

---

# Reporting Time-Zone Change

A time-zone change may affect future period boundaries and display timestamps.

It must not silently rewrite canonical Transaction effective dates.

Historical Reports must preserve the time-zone policy used during generation where required.

---

# Report Currency

A Report must identify one of:

```text
Single canonical currency

Converted reporting currency

Multi-currency separated result
```

---

# Single-Currency Report

All included values use the same currency.

---

# Converted Report

A converted Report must identify:

- Original currencies.
- Reporting currency.
- Exchange-rate source.
- Rate timestamp.
- Conversion-policy version.
- Rounding policy.
- Unavailable-rate behavior.

---

# Multi-Currency Separated Report

Values should be grouped by currency.

Example:

```text
BRL:
R$ 2.500,00

USD:
US$ 300,00
```

The values must not be added into one unsupported total.

---

# Report Filters

Potential filters include:

- Account.
- Category.
- Transaction type.
- Transaction state.
- Reconciliation state.
- Amount range.
- Effective-date range.
- Search text.
- Recurring state.
- Budget.
- Goal.
- Import source.
- Provider reference.

---

# Filter Identifier

Complex saved filters should have stable identifiers.

Recommended format:

```text
flt_<sortable-unique-identifier>
```

---

# Filter Validation

Filters must be validated for:

- Owner scope.
- Account scope.
- Supported fields.
- Allowed operators.
- Date range.
- Amount range.
- Currency.
- Query complexity.
- Result-size limits.

---

# Search Filter

Search may apply to approved fields such as:

- Description.
- Category label.
- Safe Transaction reference.
- Account label.
- Approved provider reference.

Search text must not become executable query syntax.

---

# Amount Filter

An amount filter must identify:

- Currency.
- Minimum.
- Maximum.
- Inclusive or exclusive boundaries.
- Whether absolute or signed amount is evaluated.

---

# Transaction-State Filter

The interface must explain whether a selected state affects totals.

Example:

```text
Showing Posted and Reconciled Transactions only.
```

---

# Reconciliation-State Filter

Filtering by reconciliation state must not change the canonical Transaction amount.

It changes Report inclusion only.

---

# Active Filter Presentation

Active filters should remain visible and removable.

The user should not need to infer filter state from missing records.

---

# Filter Reset

Reset must restore the documented default Report scope.

---

# Saved Filters

Saved filters should preserve:

- Owner.
- Report type.
- Filter schema version.
- Filter values.
- Sort.
- Created time.
- Updated time.
- Visibility.
- Default state.

Saved filters must not be shared across Owners accidentally.

---

# Report Sorting

Sorting may use:

- Effective date.
- Posted date.
- Created time.
- Amount.
- Category.
- Account.
- Description.
- State.

Sorting must not alter totals.

---

# Stable Sorting

Pagination requires stable sorting.

Recommended fallback:

```text
Primary selected sort

then

Stable Resource identifier
```

---

# Report Pagination

Pagination must not redefine the full Report total.

The interface must distinguish:

```text
Total records:
2.350

Visible records:
1–50
```

---

# Cursor Pagination

Cursor-based pagination is recommended for large or frequently changing financial datasets.

A cursor must preserve:

- Owner scope.
- Report scope.
- Sort.
- Data-version assumptions.
- Expiration.
- Integrity.

---

# Pagination Consistency

When data changes during pagination, Nexio should use:

- Snapshot data version.
- Stable `asOf` boundary.
- Versioned cursor.
- Explicit refresh behavior.

---

# Report Result State

Recommended values:

```text
Loading

Succeeded

SucceededWithWarnings

Empty

Partial

Stale

Recalculating

Unavailable

Failed

VerificationFailed
```

---

# Loading State

The interface must not display previous Owner data while a new Owner Report is loading.

---

# Succeeded State

The Report completed with all required data and validation.

---

# Succeeded-With-Warnings State

The Report is usable but has noncritical warnings.

Warnings must be visible where they affect interpretation.

---

# Empty State

An Empty state means the Report was calculated successfully and no eligible records exist.

It must remain distinct from:

- Failed.
- Unavailable.
- Loading.
- Filtered-to-zero.
- Account-not-selected.

---

# Filtered-Empty State

A filtered Report may contain no matching records while the unfiltered Report contains data.

The interface should explain:

```text
No records match the current filters.
```

---

# Partial State

A Partial Report is missing one or more required data sources or partitions.

It must not be presented as complete.

---

# Stale State

A Stale Report was generated from data older than the approved freshness window.

---

# Recalculating State

The current value is being regenerated after:

- Backdated Transaction.
- Correction.
- Reversal.
- Reconciliation reopening.
- Policy migration.
- Snapshot invalidation.

---

# Unavailable State

Required systems or data are temporarily unavailable.

A previous verified value may be displayed only when clearly identified as previous and stale.

---

# Failed State

The Report could not be generated safely.

The interface must not replace failure with zero values.

---

# Verification-Failed State

Integrity or reproducibility verification failed.

The result must not be represented as verified.

---

# Report Warnings

Recommended warning codes include:

```text
REPORT_DATA_STALE

REPORT_PARTIAL_DATA

REPORT_RECALCULATION_PENDING

REPORT_UNRECONCILED_VALUES_INCLUDED

REPORT_PROJECTED_VALUES_INCLUDED

REPORT_EXCHANGE_RATE_DELAYED

REPORT_FILTERED_RESULT

REPORT_HISTORICAL_POLICY_USED

REPORT_SNAPSHOT_INVALIDATED
```

---

# Report Freshness Model

Recommended fields:

```text
generatedAt

dataAsOf

financialDataVersion

cacheCreatedAt

cacheExpiresAt

freshnessState

refreshAvailable
```

---

# Current Report

A Current Report uses the latest accepted financial-data version within the approved freshness window.

---

# Near-Current Report

A Near-Current Report may lag slightly within an approved bounded period.

This state is suitable only when Product meaning remains safe.

---

# Stale Report

A Stale Report exceeds the approved age or data-version lag.

---

# Report Refresh

Refresh should:

- Preserve Owner scope.
- Preserve approved filters.
- Revalidate Authorization.
- Recalculate using current policy.
- Replace stale caches safely.
- Preserve previous Report metadata where required.

---

# Report Snapshot Architecture

A Report Snapshot preserves a generated result and its context.

Recommended structure:

```text
ReportSnapshot
 ├── reportSnapshotId
 ├── reportId
 ├── reportType
 ├── ownerId
 ├── accountScope
 ├── period
 ├── filters
 ├── currency
 ├── calculationPolicyVersion
 ├── reportingPolicyVersion
 ├── financialDataVersion
 ├── resultSummary
 ├── contentHash
 ├── integrityState
 └── createdAt
```

---

# Report Snapshot Identifier

Recommended format:

```text
rptsnap_<sortable-unique-identifier>
```

---

# Report Snapshot Use

Report Snapshots may support:

- Export reproducibility.
- Historical comparison.
- Reconciliation completion.
- Financial investigation.
- Support escalation.
- Notification generation.
- Migration comparison.
- Incident recovery.

---

# Report Snapshot Authority

A Report Snapshot is a derived artifact.

It remains subordinate to canonical financial Resources and the Calculation Engine.

---

# Snapshot Invalidation

A Report Snapshot should be invalidated when:

- Included Transaction changes.
- Backdated Transaction enters the period.
- Transfer is corrected.
- Refund or Reversal is created.
- Account scope changes.
- Financial policy changes.
- Reporting policy changes.
- Reconciliation reopens.
- Currency conversion data changes under an approved policy.
- Integrity verification fails.

---

# Historical Snapshot Preservation

Invalidating a snapshot must not erase it when required for Audit, Export or investigation history.

The previous snapshot should remain marked as superseded or invalidated.

---

# Report Cache Architecture

Caching may improve Report performance.

A Report cache key should include:

```text
ownerId

reportType

accountScopeHash

categoryScopeHash

period

reportingTimeZone

currency

filterHash

calculationPolicyVersion

reportingPolicyVersion

financialDataVersion
```

---

# Cache Owner Isolation

Owner identity must be a mandatory cache dimension for Owner-specific Reports.

---

# Cache Account Scope

Account selection must be represented in the cache key.

A cached all-Account Report must not be reused for a single-Account Report.

---

# Cache Filter Scope

Different filter sets must not share an incorrect cached result.

---

# Cache Freshness

Each Report type must define:

- Maximum age.
- Event-driven invalidation.
- Manual refresh.
- Stale-use behavior.
- Offline behavior.

---

# Cache Invalidation Events

Potential invalidation Events include:

```text
Transaction created

Transaction updated

Transaction reversed

Transfer completed

Transfer reversed

Account archived

Budget updated

Goal contribution added

Recurring instance generated

Import completed

Reconciliation reopened

Financial policy activated
```

---

# Cache Invalidation Failure

A failed invalidation should:

- Mark affected cache partitions stale where possible.
- Trigger monitoring.
- Prevent presentation as current.
- Schedule rebuild.
- Preserve Owner isolation.

---

# Dashboard Architecture

The Nexio Dashboard is a composed reporting interface.

It must not be a separate financial calculation authority.

Recommended structure:

```text
Dashboard
 ├── dashboardId
 ├── ownerId
 ├── accountScope
 ├── period
 ├── currency
 ├── summaryCards
 ├── charts
 ├── recentTransactions
 ├── budgets
 ├── goals
 ├── notifications
 ├── freshness
 └── generatedAt
```

---

# Dashboard Identifier

Recommended format:

```text
dash_<sortable-unique-identifier>
```

---

# Dashboard Default Scope

The default Dashboard scope must be documented.

Potential default:

```text
All active eligible Accounts

Current month

Owner reporting time zone

Account currency or approved reporting currency

Posted and Reconciled financial state
```

---

# Dashboard Scope Selector

When multiple Accounts exist, the Dashboard should provide a clear Account selector.

The selected scope must apply consistently to:

- Balance cards.
- Income.
- Expenses.
- Cash Flow.
- Charts.
- Recent Transactions.
- Budgets where compatible.
- Goals where compatible.

---

# Dashboard Period Selector

The selected period should apply consistently to period-based components.

Current Account Balance may remain an `asOf` value rather than a period total.

This distinction must be clear.

---

# Dashboard Balance Card

A Balance card should identify:

- Balance type.
- Account scope.
- Currency.
- `asOf` time.
- Freshness.
- Pending or Projected distinction where applicable.

---

# Dashboard Income Card

The Income card should identify:

- Reporting period.
- Included Transaction states.
- Transfer exclusions.
- Refund treatment.
- Currency.
- Comparison baseline where displayed.

---

# Dashboard Expense Card

The Expense card should identify:

- Reporting period.
- Included Transaction states.
- Transfer exclusions.
- Refund treatment.
- Fee treatment.
- Currency.
- Comparison baseline where displayed.

---

# Dashboard Net Cash Flow Card

Conceptual presentation:

```text
Net Cash Flow
=
Cash Inflow
-
Cash Outflow
```

The component should link to the detailed Cash Flow Report.

---

# Dashboard Comparison Indicator

A comparison indicator should show:

- Absolute change.
- Percentage change where defined.
- Baseline period.
- Direction.
- Zero-baseline handling.

---

# Dashboard Recent Transactions

Recent Transactions should define:

- Account scope.
- Eligible Transaction states.
- Sort order.
- Maximum count.
- Effective or posted date.
- Link to complete Transaction Report.

---

# Dashboard Budget Component

Budget cards should display:

- Budget name.
- Period.
- Budget amount.
- Consumed amount.
- Remaining amount.
- Usage percentage.
- Freshness.
- Warning state.

---

# Dashboard Goal Component

Goal cards should display:

- Goal name.
- Target amount.
- Current amount.
- Remaining amount.
- Progress percentage.
- Target date.
- Completion state.
- Freshness.

---

# Dashboard Projection Component

Projected values must be clearly labeled.

Recommended wording:

```text
Projected balance

Expected income

Expected expenses
```

They must not use the same visual label as Posted values.

---

# Dashboard Empty State

Dashboard empty states should distinguish:

```text
No Accounts created

No Transactions created

No activity in selected period

No Budget created

No Goal created

Data unavailable

Calculation failed
```

---

# Dashboard Loading State

Skeletons or loading indicators must not contain previous Owner financial values.

---

# Dashboard Error Isolation

One failed component should not necessarily prevent all other independently valid components from loading.

The Dashboard should identify which component is unavailable.

---

# Dashboard Refresh Consistency

A refresh should use a consistent Dashboard data boundary where feasible.

It should avoid combining:

- A new Balance.
- An old Expense total.
- An older chart.
- A different Account scope.

---

# Composite Dashboard Snapshot

A composite snapshot may preserve:

```text
component versions

financialDataVersion

generatedAt

accountScope

period

currency

freshness
```

---

# Dashboard Personalization

Permitted personalization may include:

- Component order.
- Component visibility.
- Default period.
- Default Account scope.
- Chart preference.

Personalization must not redefine financial formulas.

---

# Hidden Dashboard Components

Hiding a component affects presentation only.

It must not:

- Delete data.
- Disable financial processing.
- Alter calculations.
- Stop required Security or Privacy notifications.

---

# Responsive Dashboard

The Dashboard must support:

```text
Desktop

Tablet

Standard Android phone

Foldable phone

Narrow split-screen

Large text
```

Component order may change responsively.

Financial meaning must remain unchanged.

---

# Foldable Device Behavior

On foldable Devices, Dashboard components should avoid:

- Excessively wide cards.
- Truncated exact values.
- Hidden action controls.
- Incorrect two-column assumptions.
- Duplicate content during posture changes.

---

# Dashboard Theme Support

Light and Dark themes must preserve:

- Contrast.
- Positive and negative distinction.
- Focus visibility.
- Chart readability.
- Warning visibility.
- Disabled-state clarity.

White cards with unreadable text in Dark theme are prohibited.

---

# Initial Reporting Acceptance Criteria

The initial Reporting, Analytics, Dashboards and Insights architecture is accepted only when:

1. Every material Report has a stable type.

2. Every material generated Report has a stable identifier where required.

3. Every Report identifies the canonical Owner.

4. Every Account-scoped Report validates Account ownership.

5. Every Report defines its Account scope.

6. Every Report defines its period.

7. Every Report defines its reporting time zone.

8. Every monetary Report identifies currency.

9. Every Report identifies its calculation-policy version.

10. Every Report identifies its reporting-policy version.

11. Every material Report identifies its financial-data version.

12. Every Report records its generation time.

13. Every Report has an explicit result state.

14. Empty remains distinct from Failed.

15. Empty remains distinct from Unavailable.

16. Filtered-to-zero remains distinguishable from no data.

17. Partial Reports are not presented as complete.

18. Stale Reports are not presented as current without disclosure.

19. Verification-Failed Reports are not presented as verified.

20. Report warnings use controlled codes.

21. Reports use canonical financial Resources.

22. Reports use the authoritative Calculation Engine.

23. Dashboard cards do not define independent financial formulas.

24. Android and Web use the same reporting semantics.

25. Reports are reproducible.

26. Reports preserve exact monetary values.

27. Display abbreviations do not replace canonical values.

28. Financial values are not derived from formatted strings.

29. Report periods use explicit boundaries.

30. Start-inclusive and end-exclusive behavior is supported.

31. Time-zone changes do not rewrite historical financial dates silently.

32. All-Time Reports preserve an `asOf` boundary.

33. Custom periods validate start and end.

34. Excessive custom periods are bounded where required.

35. Single-currency Reports include only compatible values.

36. Converted Reports preserve exchange-rate metadata.

37. Multi-currency Reports separate incompatible currencies.

38. Filters are Owner-scoped.

39. Filters are Account-scoped.

40. Filter operators are controlled.

41. Search input cannot become executable query syntax.

42. Amount filters identify currency.

43. Active filters remain visible.

44. Filter reset restores documented defaults.

45. Saved filters do not leak across Owners.

46. Sorting does not alter totals.

47. Pagination does not redefine full-result totals.

48. Stable sorting supports consistent pagination.

49. Pagination cursors preserve Owner scope.

50. Pagination cursors preserve Report scope.

51. Report freshness metadata exists.

52. Refresh revalidates Authorization.

53. Report Snapshots have stable identifiers.

54. Report Snapshots preserve Owner scope.

55. Report Snapshots preserve period and currency.

56. Report Snapshots preserve policy versions.

57. Report Snapshots preserve financial-data version.

58. Report Snapshots support integrity verification.

59. Invalidated snapshots remain historically distinguishable.

60. Report caches include Owner identity.

61. Report caches include Account scope.

62. Report caches include filter scope.

63. Report caches include policy versions.

64. Report caches include financial-data version.

65. Cross-Owner Report cache reuse is Critical.

66. Cache freshness is defined.

67. Cache invalidation Events are defined.

68. Cache invalidation failure is detectable.

69. Stale caches are not presented as current.

70. Dashboard default scope is documented.

71. Dashboard Account selection applies consistently.

72. Dashboard period selection applies consistently.

73. Balance cards identify balance type.

74. Balance cards identify `asOf` time.

75. Income cards identify period.

76. Expense cards identify period.

77. Cash Flow uses the approved formula.

78. Comparison indicators identify the baseline.

79. Percentage comparisons define zero-baseline behavior.

80. Recent Transactions use a stable ordering.

81. Budget cards use canonical Budget calculations.

82. Goal cards use canonical Goal calculations.

83. Projected values are clearly labeled.

84. Dashboard empty states are specific.

85. Dashboard loading does not expose previous Owner data.

86. Component failures are isolated where safe.

87. Composite Dashboard data uses a consistent boundary where feasible.

88. Dashboard personalization does not alter formulas.

89. Hidden components do not delete or disable financial data.

90. Responsive layouts preserve financial meaning.

91. Foldable layouts preserve exact values and controls.

92. Light and Dark themes preserve readability.

93. Financial meaning is not communicated through color alone.

94. Reports expose textual equivalents for charts.

95. Owner isolation applies to every Report query.

96. Owner isolation applies to every Report Snapshot.

97. Owner isolation applies to every Report cache.

98. Owner isolation applies to every Exported Report.

99. Cross-Owner reporting exposure triggers Critical Incident response.

100. Every material displayed value can be independently traced and reproduced.

---

# Foundational Reporting Rule

A Report is not trustworthy merely because its totals appear consistent with the interface.

It is trustworthy only when Nexio can establish:

```text
The canonical Owner

The Account scope

The reporting period

The reporting time zone

The currency

The filters

The included and excluded Resource states

The calculation-policy version

The reporting-policy version

The financial-data version

The freshness state

The exact resulting values

The canonical records required to reproduce them
```

When a Report is stale, partial, inconsistent, unavailable, filtered, projected, estimated or unverifiable, Nexio must preserve and display that state explicitly.

Nexio must never replace an unavailable value with zero, combine incompatible currencies, reuse another Owner's cache, hide an active filter, suppress a financial difference or present an AI interpretation as authoritative financial truth.

# Visualization and Chart Architecture

Visualizations are presentation layers over canonical reporting results.

Charts must not become independent aggregation engines.

The recommended architecture is:

```text
Canonical Financial Resources

↓

Authoritative Calculation Engine

↓

Canonical Report Result

↓

Visualization Dataset Projection

↓

Visualization Validation

↓

Accessible Chart and Table Rendering

↓

Interaction and Drill-Down

↓

Audit and Analytics Evidence where required
```

---

# Visualization Responsibilities

The Visualization layer is responsible for:

- Selecting an appropriate visual representation.
- Preserving exact underlying values.
- Displaying labels and units.
- Communicating positive and negative values.
- Communicating missing and partial data.
- Communicating projections and uncertainty.
- Supporting filtering and selection.
- Supporting accessible alternatives.
- Supporting responsive layouts.
- Linking visual values to contributing records.
- Preserving Report scope and freshness.

---

# Visualization Non-Responsibilities

The Visualization layer must not independently:

- Recalculate authoritative financial totals.
- Change Transaction-state inclusion.
- Convert currencies without an approved policy.
- Remove outliers merely to improve appearance.
- Hide negative values.
- Convert missing data into zero.
- Change period boundaries.
- Infer another Owner's data.
- Treat projected values as Posted values.
- Apply undocumented rounding.
- Modify canonical financial Resources.

---

# Visualization Dataset

A Visualization Dataset should contain:

```text
visualizationDatasetId

reportId

reportSnapshotId

visualizationType

ownerId

accountScope

period

reportingTimeZone

currency

series

categories

exactValues

displayValues

unit

calculationPolicyVersion

reportingPolicyVersion

financialDataVersion

freshnessState

generatedAt
```

---

# Visualization Dataset Identifier

Recommended format:

```text
vds_<sortable-unique-identifier>
```

---

# Visualization Types

Recommended controlled visualization types include:

```text
LineChart

BarChart

GroupedBarChart

StackedBarChart

AreaChart

StackedAreaChart

DonutChart

PieChart

ProgressBar

GoalProgress

BudgetProgress

WaterfallChart

BalanceTrend

CashFlowChart

ComparisonChart

AccessibleDataTable
```

Only implemented and tested visualization types may be activated.

---

# Visualization Selection

The visualization type must match the analytical question.

Examples:

```text
Trend over time:
Line Chart

Comparison between categories:
Bar Chart

Composition of a bounded total:
Donut Chart

Cumulative movement from opening to closing balance:
Waterfall Chart

Budget progress:
Progress Bar

Exact record review:
Data Table
```

---

# Inappropriate Visualization

A visualization is inappropriate when it:

- Obscures exact comparison.
- Implies continuous data where only isolated observations exist.
- Uses area to exaggerate small differences.
- Creates unsupported proportions.
- Requires color alone to understand.
- Cannot display negative values correctly.
- Cannot distinguish incompatible currencies.
- Cannot represent missing periods honestly.

---

# Chart Identifier

Every material chart instance may have a stable identifier.

Recommended format:

```text
chart_<sortable-unique-identifier>
```

---

# Chart Model

Recommended structure:

```text
Chart
 ├── chartId
 ├── chartType
 ├── title
 ├── description
 ├── reportId
 ├── datasetId
 ├── xAxis
 ├── yAxis
 ├── series
 ├── legend
 ├── annotations
 ├── interactionModel
 ├── accessibilityModel
 ├── freshnessState
 └── generatedAt
```

---

# Chart Title

A chart title should explain the financial question.

Prefer:

```text
Expenses by Category — July 2026
```

Avoid:

```text
Overview
```

when the actual meaning is narrower.

---

# Chart Description

A chart description should explain:

- Period.
- Account scope.
- Currency.
- Included states.
- Transfer treatment where material.
- Projection state where applicable.

---

# Axis Architecture

Every quantitative chart axis must define:

```text
Axis label

Unit

Currency where applicable

Minimum

Maximum

Scale type

Tick interval

Formatting

Zero-baseline behavior
```

---

# Zero Baseline

Bar charts comparing financial magnitudes should generally begin at zero.

A truncated baseline may exaggerate differences.

If a nonzero baseline is necessary, it must be:

- Clearly visible.
- Explained.
- Accessible.
- Appropriate to the analytical purpose.

---

# Line Chart Baseline

Line charts may use a nonzero vertical range when showing variation.

The chart must still avoid misleading scale compression.

---

# Axis Scale Types

Approved scale types may include:

```text
Linear

Time

Categorical
```

Logarithmic scales should not be used for ordinary Owner financial reporting unless the use case is separately approved and explained.

---

# Axis Unit

Examples:

```text
BRL

Percentage

Transaction count

Days

Months
```

One axis must not silently combine incompatible units.

---

# Dual-Axis Chart

Dual-axis charts should be avoided because they can create misleading visual relationships.

When required, they must:

- Identify both units clearly.
- Use distinct accessible series markers.
- Explain that the scales differ.
- Avoid implying direct proportionality.
- Provide a tabular alternative.

---

# Currency Axis

A monetary axis must display or expose the currency.

Example:

```text
Amount (BRL)
```

A chart must not use `R$` when the underlying Report currency is not BRL.

---

# Exact Chart Values

The chart dataset must preserve exact values.

Formatting may produce:

```text
R$ 1,25 mil
```

while the tooltip or accessible table preserves:

```text
R$ 1.250,00
```

---

# Chart Value Rounding

Chart labels may use display rounding.

The displayed rounded labels must not be summed as the authoritative total.

---

# Chart Scale Consistency

Charts compared side by side should use consistent scales when visual comparison is intended.

Different scales must be disclosed.

---

# Time Axis

Time-series charts must define:

- Time zone.
- Granularity.
- Period boundary.
- Missing period behavior.
- Sort order.
- Partial-period behavior.

---

# Time Granularity

Potential granularities include:

```text
Day

Week

Month

Quarter

Year
```

Granularity changes must not change the underlying Report scope silently.

---

# Partial Current Period

A current incomplete month should be identified as partial when compared with complete prior months.

Potential labels include:

```text
Current month to date

Partial period
```

---

# Missing Time Periods

Missing periods must remain distinguishable from zero-value periods.

Example:

```text
No data available:
Missing

Confirmed no eligible Transactions:
R$ 0,00
```

---

# Time-Series Gap

A gap in data may be represented through:

- A visible break.
- A missing marker.
- A shaded unavailable region.
- An accessible annotation.

It must not be connected as though the value were known.

---

# Chart Series

Each chart series must define:

```text
seriesId

name

valueType

currency

calculationType

stateType

visualRole

accessibilityLabel
```

---

# Series Identifier

Recommended format:

```text
series_<stable-name-or-identifier>
```

---

# Series Consistency

The same conceptual series should use consistent naming across Nexio.

Examples:

```text
Income

Expenses

Net Cash Flow

Current Balance

Projected Balance
```

---

# Positive and Negative Values

Positive and negative values must be distinguishable through more than color.

Potential distinctions include:

- Plus or minus sign.
- Credit or Debit label.
- Upward or downward position.
- Pattern.
- Shape.
- Text label.
- Accessible description.

---

# Income and Expense Colors

Color may supplement meaning.

It must not become the sole indicator of:

```text
Income

Expense

Positive

Negative

Within Budget

Over Budget
```

---

# Color Governance

Chart colors must:

- Meet required contrast.
- Remain distinguishable in Light and Dark themes.
- Remain understandable for common color-vision differences.
- Support focus and hover.
- Avoid implying meaning that is not present.
- Remain consistent across related components.

---

# Theme Adaptation

Dark theme must not:

- Hide axis lines.
- Hide grid lines.
- Reduce label contrast.
- Make cards unreadable.
- Use indistinguishable series colors.
- Hide focus indicators.
- Convert warning text into low contrast.

---

# Series Pattern

Patterns, markers or line styles should be available when multiple series cannot be distinguished through color alone.

---

# Legend Architecture

A legend must identify every visible series.

The legend should support:

- Keyboard navigation where interactive.
- Screen-reader labels.
- Clear disabled state.
- Exact series names.
- Focus indicators.
- Non-color markers.

---

# Interactive Legend

An interactive legend may allow a series to be hidden.

Hiding a series must:

- Affect the visualization only.
- Not alter canonical Report totals.
- Remain visible as an active visual filter.
- Be announced accessibly.
- Be reversible.

---

# Tooltip Architecture

Tooltips may display:

- Exact value.
- Period or category.
- Currency.
- Series.
- Comparison.
- Record count.
- Projection or reconciliation state.

Tooltips must not be the only way to access material information.

---

# Tooltip Accessibility

Tooltip content should be available through:

- Keyboard focus.
- Screen-reader text.
- Data table.
- Accessible summary.

Hover-only information is insufficient.

---

# Chart Labels

Labels should avoid:

- Overlap.
- Truncation of material values.
- Ambiguous abbreviations.
- Unsupported decimal precision.
- Missing units.
- Hidden negative signs.

---

# Label Collision

When labels would overlap, Nexio may:

- Reduce label density.
- Rotate labels within accessible limits.
- Use scrolling.
- Use tooltips plus an accessible table.
- Show selected labels.
- Increase chart height.

It must not display unreadable overlapping labels.

---

# Abbreviated Labels

Approved abbreviations may include locale-appropriate forms such as:

```text
R$ 1,2 mil

R$ 2,5 mi
```

Exact values must remain available.

---

# Chart Annotation

Annotations may explain:

- Budget limit.
- Goal target.
- Reconciliation date.
- Policy change.
- Missing data.
- Partial period.
- Projection horizon.
- Significant correction.

---

# Annotation Authority

An annotation must distinguish:

```text
System Event

Owner note

Support note

AI-generated interpretation
```

---

# Missing Data Annotation

A chart with missing data should explicitly explain the unavailable period or source.

---

# Projection Visualization

Projected values must use a distinct visual style.

Potential distinctions include:

- Dashed line.
- Shaded future region.
- `Projected` label.
- Confidence label.
- Different marker.
- Accessible annotation.

---

# Projection Boundary

The point where verified Posted data ends and projection begins must be visible.

---

# Projection Confidence Display

Potential labels include:

```text
Confirmed Scheduled

Expected

Estimated

Uncertain
```

Confidence must not be represented only through opacity.

---

# Reconciled Value Visualization

Reconciled values may be marked distinctly from unreconciled Posted values.

The visualization must not imply that unreconciled values are invalid financial records.

---

# Pending Value Visualization

Pending values should be visually and textually distinct from Posted values.

---

# Stale Chart Visualization

A stale chart should display:

- Stale status.
- Data-as-of time.
- Refresh action where available.
- Reason where known.

---

# Partial Chart Visualization

A partial chart must identify:

- Missing series.
- Missing period.
- Missing source.
- Whether totals are affected.

---

# Empty Chart State

An empty chart must not show a misleading flat zero line unless zero is the verified result.

---

# Chart Error State

When chart rendering fails, Nexio should preserve:

- Report title.
- Scope.
- Safe error message.
- Retry action.
- Accessible text.
- Link to available table where possible.

---

# Line Chart Architecture

Line charts are appropriate for ordered time-series values.

They must define:

- Time granularity.
- Missing-value behavior.
- Marker behavior.
- Partial-period behavior.
- Projection boundary.
- Y-axis scale.

---

# Line Interpolation

Straight visual connections between data points must not imply that intermediate daily values are known when only monthly observations exist.

Where this matters, labels should clarify the granularity.

---

# Smoothed Lines

Smoothed curves may imply values that were not observed.

Smoothed lines should be avoided for exact financial time series unless explicitly approved.

---

# Balance Trend Chart

A Balance Trend chart should identify:

- Balance type.
- Account scope.
- Currency.
- Observation interval.
- `asOf` behavior.
- Corrections.
- Projection boundary where present.

---

# Bar Chart Architecture

Bar charts are appropriate for discrete comparisons such as:

- Category totals.
- Account totals.
- Period totals.
- Budget consumption.
- Income versus Expense.

---

# Grouped Bar Chart

Grouped bars may compare:

```text
Income and Expense by month

Current and previous period by category
```

All grouped series must use compatible units and scope.

---

# Stacked Bar Chart

Stacked bars may show composition.

The total height must equal the sum of components.

Stacking incompatible values is prohibited.

---

# Diverging Bar Chart

A diverging chart may represent credits and debits on opposite sides of zero.

Accessible text must identify direction.

---

# Area Chart Architecture

Area charts should be used carefully because visual area can exaggerate magnitude.

They may be appropriate for:

- Cumulative balance.
- Total projected range.
- Time-series composition.

---

# Stacked Area Chart

A stacked area chart must not combine:

- Positive and negative values ambiguously.
- Incompatible currencies.
- Posted and Projected values without distinction.
- Categories whose total is not meaningful.

---

# Pie and Donut Chart Architecture

Pie and Donut charts should be limited to small, bounded compositions.

Recommended maximum visible categories:

```text
5 to 7
```

Additional categories may be grouped as:

```text
Other
```

The underlying detail must remain accessible.

---

# Pie Chart Restrictions

Pie and Donut charts should not be used when:

- Values contain negatives.
- Categories overlap.
- The total is undefined.
- There are many similar categories.
- Exact comparison is important.
- Multiple currencies are present.
- Data is partial.

---

# Donut Center Value

A Donut chart center may show the exact total.

The total must reconcile with the segments.

---

# Other Category

An `Other` segment must link or expand to the contributing categories.

---

# Waterfall Chart Architecture

A Waterfall chart may explain how financial effects move from:

```text
Opening Balance

to

Closing Balance
```

Potential components include:

- Income.
- Expenses.
- Transfers.
- Adjustments.
- Refunds.
- Reversals.

---

# Waterfall Reconciliation

The final Waterfall value must equal the Report's calculated closing value.

---

# Progress Visualization Architecture

Progress visualizations may be used for:

- Budgets.
- Goals.
- Export generation.
- Import processing.
- Reconciliation completion.

Financial progress and processing progress must not be confused.

---

# Budget Progress Bar

A Budget progress visualization should include:

- Budget amount.
- Consumed amount.
- Remaining amount.
- Percentage.
- Overspending amount.
- Period.
- Currency.

---

# Budget Progress Above 100 Percent

When consumption exceeds the Budget:

- Preserve the exact percentage.
- Identify overspending.
- Avoid clipping the meaning at 100%.
- Use text in addition to color.

---

# Goal Progress Visualization

A Goal progress visualization should include:

- Target amount.
- Current amount.
- Remaining amount.
- Excess amount where applicable.
- Target date.
- Completion state.

---

# Goal Progress Above 100 Percent

The visual fill may cap at the display boundary.

The exact percentage and excess amount must remain available.

---

# Gauge Restrictions

Circular gauges should be used sparingly.

They often:

- Consume excessive space.
- Reduce exact comparison.
- Depend heavily on color.
- Hide values above the maximum.

A labeled progress bar is generally preferred.

---

# Chart Interaction Architecture

Potential interactions include:

```text
Hover or Focus

Series Toggle

Zoom

Pan

Brush Selection

Point Selection

Drill-Down

Filter Application

Period Change
```

---

# Interaction State

Interactive state must remain:

- Visible.
- Keyboard accessible.
- Reversible.
- Owner-scoped.
- Distinguishable from canonical Report filters.

---

# Chart Zoom

Zooming changes the visible range.

It must not change the full Report total silently.

---

# Chart Drill-Down

Selecting a chart element may open a detailed Report.

The detailed Report must preserve:

- Owner.
- Account scope.
- Period.
- Currency.
- Category.
- Transaction states.
- Reporting policy.
- Financial-data version where applicable.

---

# Drill-Down Verification

The sum of the detailed records should reconcile with the selected chart value according to the same policy.

---

# Cross-Filtering

Selecting one visualization may filter another.

Active cross-filters must be visible.

---

# Chart Export

Exporting a chart may produce:

- Image.
- PDF.
- Data table.
- CSV.
- Report package.

The Export must preserve:

- Title.
- Scope.
- Period.
- Currency.
- Generation time.
- Freshness.
- Projection status.
- Source Report reference.

---

# Screenshot Limitation

A screenshot is a presentation artifact.

It is not a complete financial Report because it may omit:

- Scope.
- Filters.
- Exact values.
- Data version.
- Freshness.
- Accessibility data.
- Contributing records.

---

# Data Table Architecture

Every material chart should have an accessible Data Table or equivalent textual representation.

Recommended table metadata includes:

```text
tableId

reportId

ownerId

columns

rows

sort

filters

pagination

currency

period

resultState

generatedAt
```

---

# Data Table Identifier

Recommended format:

```text
tbl_<sortable-unique-identifier>
```

---

# Table Column Model

Each column should define:

```text
columnId

label

dataType

currency

sortability

filterability

alignment

accessibilityDescription
```

---

# Monetary Column Alignment

Monetary values should generally be right-aligned visually.

Screen readers must receive the complete value and currency.

---

# Date Column

A date column must identify whether it displays:

- Effective date.
- Posted date.
- Created time.
- Updated time.
- Scheduled date.

---

# Status Column

Status must use text.

Icons and colors may supplement it.

---

# Table Totals

A table total must state whether it represents:

```text
All matching records

Visible page

Selected rows

Current group
```

---

# Table Footer

A table footer may include:

- Record count.
- Total credits.
- Total debits.
- Net total.
- Current-page total.
- Full-result total.

These meanings must remain distinct.

---

# Table Grouping

Records may be grouped by:

- Date.
- Month.
- Category.
- Account.
- Transaction type.
- Reconciliation state.

Group totals must reconcile with the records in the group.

---

# Expandable Rows

Expandable rows may show:

- Description.
- Account.
- Category.
- State history.
- Reconciliation relationship.
- Import source.
- Transfer relationship.
- Audit-safe metadata.

Expansion must remain keyboard accessible.

---

# Table Selection

Selecting rows may support:

- Export.
- Categorization.
- Reconciliation.
- Comparison.
- Approved bulk actions.

Selection must not imply that the visible total has changed unless clearly indicated.

---

# Bulk Financial Actions

Bulk mutation actions require separate financial and Authorization controls.

A Report table selection is not sufficient authority.

---

# Virtualized Tables

Large tables may use virtualization.

Virtualization must preserve:

- Keyboard navigation.
- Screen-reader usability.
- Stable row identity.
- Correct total counts.
- Correct focus.
- No cross-Owner row reuse.

---

# Report Detail Architecture

A Report Detail view should explain how a summary value was produced.

Recommended sections include:

```text
Summary

Scope

Period

Currency

Filters

Included states

Excluded states

Calculation policy

Freshness

Visualization

Detailed records

Warnings

Export
```

---

# Value Explanation Panel

A material value may offer an explanation panel containing:

```text
Value label

Exact amount

Calculation type

Included Account count

Included Transaction count

Excluded Transaction count

Period

Time zone

Policy version

Data-as-of time

Refresh state
```

---

# Contributing Records

Where permitted, a value should link to its contributing records.

Record access must be reauthorized independently.

---

# Excluded Records Explanation

A Report may explain common exclusions such as:

- Draft Transactions.
- Scheduled Transactions.
- Internal Transfers.
- Cancelled records.
- Unsupported currencies.
- Transactions outside the period.

---

# Report Comparison Architecture

Comparative Reporting evaluates two or more equivalent scoped results.

Recommended model:

```text
ReportComparison
 ├── comparisonId
 ├── comparisonType
 ├── ownerId
 ├── currentReportId
 ├── baselineReportId
 ├── scopeCompatibility
 ├── absoluteDifference
 ├── percentageDifference
 ├── currency
 ├── resultState
 └── generatedAt
```

---

# Comparison Identifier

Recommended format:

```text
cmp_<sortable-unique-identifier>
```

---

# Comparison Types

Recommended:

```text
PreviousPeriod

PreviousMonth

PreviousQuarter

PreviousYear

YearOverYear

AccountToAccount

CategoryToCategory

BudgetToActual

TargetToActual

ForecastToActual
```

---

# Comparison Scope Compatibility

Before comparison, verify:

- Same Owner.
- Compatible Account scope.
- Same currency.
- Equivalent period duration where required.
- Same reporting time zone.
- Same calculation semantics.
- Compatible policy versions.
- Equivalent Transaction-state policy.

---

# Incompatible Comparison

A comparison must be rejected or clearly qualified when:

- Currencies differ without conversion.
- Period lengths differ unexpectedly.
- Account scopes differ.
- Policies are materially incompatible.
- One result is Posted and the other Projected.
- One result is partial.
- One result is verification-failed.

---

# Absolute Difference

Conceptual formula:

```text
Absolute Difference
=
Current Value
-
Baseline Value
```

The word `absolute` here describes the direct numeric difference.

It does not necessarily mean mathematical absolute value.

The label should avoid ambiguity.

---

# Magnitude Difference

When mathematical absolute value is intended:

```text
Magnitude Difference
=
abs(Current Value - Baseline Value)
```

---

# Percentage Difference

Recommended formula:

```text
Percentage Difference
=
(Current Value - Baseline Value)
÷
abs(Baseline Value)
×
100
```

The reporting policy must define the exact formula.

---

# Zero Baseline

When the baseline is zero, the percentage difference is undefined.

The interface may show:

```text
New activity

Not applicable

No percentage comparison
```

It must not display:

```text
0%

100%

∞%
```

without an explicitly approved and understandable policy.

---

# Negative Baseline

Comparisons involving negative balances or negative net Cash Flow require clear interpretation.

The interface should avoid simplistic `better` or `worse` labels unless Product semantics are defined.

---

# Partial-Period Comparison

A month-to-date value should preferably compare with the equivalent elapsed portion of the previous period.

Example:

```text
1–15 July

compared with

1–15 June
```

When comparing with a full prior month, the difference must be disclosed.

---

# Previous-Period Generation

Previous-period boundaries must be generated through the same reporting calendar and time zone.

---

# Leap-Year Comparison

Year-over-year comparisons involving February must define behavior for February 29.

---

# Comparison Policy Version

Material comparison behavior should use a versioned Reporting policy.

---

# Comparison Explanation

A comparison should state:

```text
Current period

Baseline period

Current value

Baseline value

Absolute difference

Percentage difference where defined

Account scope

Currency

Policy
```

---

# Trend Architecture

A Trend represents a pattern across multiple periods.

Trend types may include:

```text
Increasing

Decreasing

Stable

Volatile

InsufficientData

Mixed
```

---

# Trend Minimum Data

A Trend must define the minimum number of observations required.

Two isolated points may support a comparison.

They may not support a strong trend conclusion.

---

# Stable Trend

A `Stable` Trend requires a defined tolerance.

The tolerance must be:

- Versioned.
- Appropriate to the metric.
- Applied consistently.
- Explained where material.

---

# Volatility

Volatility should not be inferred from one unusual value alone.

The analytical method must be defined.

---

# Seasonality

Seasonality claims require sufficient historical periods.

AI must not infer reliable seasonality from inadequate data.

---

# Reporting Aggregation Architecture

Reporting aggregation groups canonical values without changing their meaning.

Potential dimensions include:

```text
Time

Account

Category

Transaction type

Transaction state

Reconciliation state

Budget

Goal

Provider

Import source
```

---

# Grouping Policy

Each grouping must define:

- Group key.
- Null behavior.
- Uncategorized behavior.
- Parent-child hierarchy behavior.
- Sort order.
- Maximum groups.
- `Other` behavior.
- Currency behavior.

---

# Group Key Stability

Groups should use stable canonical identifiers.

Display labels may change without changing historical group identity.

---

# Uncategorized Group

Records without a category should appear under a controlled `Uncategorized` group.

They must not disappear from the Report total.

---

# Unknown Group

`Unknown` should be used when the grouping value cannot be resolved.

It remains distinct from `Uncategorized`.

---

# Other Group

`Other` represents a deliberate aggregation of smaller groups.

The contributing groups must remain retrievable.

---

# Top-N Reporting

A Top-N Report must define:

- Ranking metric.
- Sort direction.
- Number of groups.
- Tie behavior.
- `Other` behavior.
- Period.
- Currency.

---

# Top-N Tie

When multiple groups share the cutoff value, the policy should define whether:

- All tied groups are included.
- Stable identifiers break the tie.
- The result exceeds N.
- The tied groups enter `Other`.

---

# Ranking Integrity

Ranking must use exact underlying values.

Rounded display labels must not determine order.

---

# Product Analytics Architecture

Product Analytics measures Product interaction and workflow behavior.

It must remain logically separate from Owner financial reporting.

Recommended architecture:

```text
Approved Analytics Event

↓

Client or Backend Event Generation

↓

Consent and Collection Validation

↓

Event Validation

↓

Pseudonymization or Identity Minimization

↓

Analytics Ingestion

↓

Quality Validation

↓

Approved Analytics Dataset

↓

Aggregation

↓

Product Dashboard or Experiment Analysis
```

---

# Product Analytics Objectives

Product Analytics may support:

- Product adoption.
- Workflow completion.
- Navigation improvement.
- Error reduction.
- Performance improvement.
- Accessibility improvement.
- Feature rollout.
- Experiment analysis.
- Support reduction.

---

# Product Analytics Non-Objectives

Product Analytics must not become:

- A canonical financial ledger.
- A source of Account balances.
- A source of Transaction truth.
- An Authorization system.
- A Security Evidence replacement.
- A mechanism to collect unnecessary private financial content.
- An unrestricted Owner behavior profile.

---

# Analytics Event Registry

Every Product Analytics Event must be registered.

Recommended fields:

```text
analyticsEventId

eventKey

name

description

domain

purpose

trigger

actorType

requiredFields

optionalFields

forbiddenFields

consentRequirement

retentionClass

samplingPolicy

owner

status

version

introducedAt

lastReviewed
```

---

# Analytics Event Identifier

Recommended format:

```text
ANALYTICS-<DOMAIN>-<NUMBER>
```

Examples:

```text
ANALYTICS-DASHBOARD-001

ANALYTICS-BUDGET-003

ANALYTICS-EXPORT-002
```

---

# Analytics Event Key

Recommended format:

```text
analytics.<domain>.<action>
```

Examples:

```text
analytics.dashboard.viewed

analytics.budget.created

analytics.goal.completed

analytics.export.requested
```

---

# Analytics Event Model

Recommended structure:

```text
AnalyticsEvent
 ├── analyticsEventInstanceId
 ├── eventKey
 ├── eventVersion
 ├── occurredAt
 ├── recordedAt
 ├── environment
 ├── platform
 ├── applicationVersion
 ├── pseudonymousSubject
 ├── sessionReference
 ├── featureContext
 ├── experimentContext
 ├── properties
 ├── consentState
 └── metadata
```

---

# Analytics Event Instance Identifier

Recommended format:

```text
aevt_<sortable-unique-identifier>
```

---

# Analytics Subject

Analytics should use the least identifying subject required.

Potential subjects include:

```text
Anonymous installation

Pseudonymous Owner reference

Session

Cohort

Aggregated population
```

---

# Analytics Owner Identifier

Canonical Owner IDs should not be sent to external Analytics providers unless explicitly approved and necessary.

A pseudonymous reference is preferred.

---

# Analytics Session

Analytics Session identity must not be confused with the Authentication Session.

---

# Analytics Properties

Properties must be:

- Registered.
- Typed.
- Purpose-limited.
- Minimized.
- Validated.
- Retention-governed.

---

# Forbidden Analytics Properties

Analytics Events must not contain:

```text
Passwords

Authentication tokens

Recovery codes

Private keys

Complete Transaction descriptions

Attachment contents

Complete Export contents

Full Account numbers

Unrestricted financial history

Precise sensitive location

Protected personal attributes

Raw Support conversations
```

---

# Financial Values in Analytics

Exact Owner financial values should not be collected in Product Analytics by default.

Where Product analysis requires financial magnitude, prefer approved buckets.

Example:

```text
amountBucket:
0_TO_100_BRL

100_TO_500_BRL

500_TO_1000_BRL

ABOVE_1000_BRL
```

The buckets must reflect legitimate purpose and Privacy review.

---

# Analytics Event Trigger

An Event trigger must define when the Event occurs.

Examples:

```text
Dashboard successfully rendered

Budget creation completed

Export request accepted

Goal reached

Report filter applied
```

---

# Attempt and Success Events

Analytics must distinguish:

```text
Action attempted

Action succeeded

Action failed

Action cancelled
```

---

# Analytics Event Duplication

Events may be duplicated because of:

- Client Retry.
- Offline replay.
- Queue redelivery.
- Page refresh.
- Application restart.

Deduplication behavior should use stable Event identity where appropriate.

---

# Analytics Event Ordering

Analytics ordering may be approximate.

It must not be used as authoritative financial ordering.

---

# Analytics Offline Collection

Android may queue Analytics Events offline.

Offline collection must:

- Preserve Event time.
- Preserve Event version.
- Preserve consent state.
- Respect expiration.
- Avoid duplicate delivery.
- Avoid cross-Owner queue reuse.
- Clear or partition data on Owner change.

---

# Analytics Consent

Where consent is required, collection must validate the applicable consent state.

A Feature Flag must not simulate consent.

---

# Analytics Opt-Out

Opt-out behavior should:

- Stop future nonessential collection.
- Clear pending nonessential Events where required.
- Preserve required Security or operational Evidence separately.
- Avoid breaking Product functionality unnecessarily.

---

# Analytics Environment Separation

Development, Test, Staging and Production Analytics must remain separated.

Synthetic test Events must not enter Production Product datasets.

---

# Analytics Schema Validation

Analytics ingestion must validate:

- Event key.
- Event version.
- Required properties.
- Property types.
- Forbidden fields.
- Environment.
- Platform.
- Consent state.
- Timestamp range.
- Payload size.

---

# Invalid Analytics Event

Invalid Events should be:

- Rejected.
- Quarantined.
- Counted.
- Investigated when patterns indicate a defect.

They must not silently change the Analytics schema.

---

# Analytics Schema Evolution

Schema changes should be:

- Versioned.
- Backward-readable.
- Documented.
- Compatible with historical analysis.
- Reviewed for Privacy impact.

---

# Analytics Dataset

An approved Analytics Dataset should identify:

```text
analyticsDatasetId

purpose

sourceEventVersions

environment

dateRange

population

dimensions

metrics

privacyClassification

retentionClass

createdAt

dataVersion
```

---

# Analytics Dataset Identifier

Recommended format:

```text
ads_<sortable-unique-identifier>
```

---

# Analytics Metric Registry

Every material Product metric should be registered.

Recommended fields:

```text
metricId

metricKey

name

description

numerator

denominator

eligibility

exclusions

aggregation

timeWindow

owner

version

status
```

---

# Analytics Metric Identifier

Recommended format:

```text
METRIC-<DOMAIN>-<NUMBER>
```

---

# Metric Example — Budget Adoption

```text
Eligible population:
Owners with at least one active Account

Numerator:
Owners who created at least one Budget

Denominator:
Eligible Owners

Time window:
Rolling 30 days
```

---

# Metric Denominator

The denominator must be explicit.

A percentage without a defined denominator is not a trustworthy metric.

---

# Unique User Metric

A unique-user metric must define:

- Identity boundary.
- Deduplication period.
- Anonymous behavior.
- Multiple Device behavior.
- Owner switching.
- Consent.

---

# Conversion Funnel

A Funnel should define ordered steps.

Example:

```text
Budget screen viewed

↓

Budget creation started

↓

Budget amount entered

↓

Budget creation completed
```

---

# Funnel Eligibility

The Funnel must define who was eligible to enter the first step.

---

# Funnel Step Ordering

Steps may be:

```text
Strictly ordered

Ordered with optional intermediate actions

Session-bound

Time-window-bound
```

---

# Funnel Completion Window

A Funnel must define the maximum completion period.

---

# Product Analytics Aggregation

Analytics aggregation may group by:

- Platform.
- Application version.
- Feature version.
- Experiment variant.
- Locale.
- Region at approved granularity.
- Subscription tier.
- Device class.
- Time period.

---

# Small Population Protection

Analytics interfaces should restrict or aggregate small population groups when reidentification risk exists.

---

# Analytics Comparison

Analytics comparisons must preserve:

- Equivalent population.
- Equivalent eligibility.
- Equivalent Event schema.
- Equivalent time window.
- Equivalent consent treatment.
- Equivalent data-quality state.

---

# Analytics Data Quality

Analytics quality dimensions include:

```text
Completeness

Validity

Timeliness

Uniqueness

Consistency

Consent Compliance

Schema Compliance

Population Stability
```

---

# Analytics Completeness

Measures whether expected Events were captured.

---

# Analytics Validity

Measures whether Events comply with the registered schema.

---

# Analytics Timeliness

Measures Event delay from occurrence to accepted ingestion.

---

# Analytics Uniqueness

Measures duplicate Event behavior.

---

# Analytics Consistency

Measures agreement between:

- Client Events.
- Backend Events.
- Product state.
- Experiment exposure.
- Feature evaluation.

---

# Analytics Data Loss

Analytics data loss may affect Product decisions.

It does not automatically affect canonical financial state.

The distinction must remain explicit.

---

# Operational Analytics Architecture

Operational Analytics supports Platform health.

Potential sources include:

- API metrics.
- Calculation metrics.
- Database metrics.
- Cache metrics.
- Background-job metrics.
- Provider metrics.
- Import metrics.
- Export metrics.
- Synchronization metrics.
- Security metrics.

---

# Operational Analytics Isolation

Operational datasets should avoid unnecessary Owner financial details.

---

# Operational Metric Model

Recommended fields:

```text
metricKey

service

environment

timestamp

value

unit

dimensions

aggregationWindow

dataQualityState
```

---

# Operational Dashboard

An Operational Dashboard may include:

```text
Report generation success

Calculation latency

Cache hit rate

Cache freshness

Import completion

Export completion

Insight generation

Analytics ingestion

Provider availability

Error rates
```

---

# Operational Dashboard Authority

Operational Dashboards support diagnosis.

They do not replace canonical Audit Evidence or financial records.

---

# Insights Architecture

An Insight is a structured interpretation derived from approved Report results.

Recommended architecture:

```text
Verified Report Result

↓

Insight Eligibility Evaluation

↓

Insight Rule or Approved Model

↓

Evidence and Confidence Validation

↓

Insight Generation

↓

Safety and Privacy Validation

↓

Owner Presentation

↓

Feedback and Expiration
```

---

# Insight Objectives

Insights may help Owners:

- Understand spending.
- Understand income changes.
- Track Budget risk.
- Track Goal progress.
- Identify recurring activity.
- Understand projection risk.
- Review unusual changes.
- Navigate to relevant records.

---

# Insight Non-Objectives

Insights must not:

- Modify financial state automatically.
- Create Transactions.
- Create financial corrections.
- Complete reconciliation.
- Hide uncertainty.
- Guarantee future outcomes.
- Provide regulated financial advice without separate approval.
- Shame or manipulate the Owner.
- Use another Owner's behavior as an identifiable comparison.

---

# Insight Model

Recommended structure:

```text
Insight
 ├── insightId
 ├── insightType
 ├── ownerId
 ├── accountScope
 ├── title
 ├── summary
 ├── sourceReportIds
 ├── sourceCalculationIds
 ├── period
 ├── currency
 ├── evidence
 ├── confidence
 ├── severity
 ├── freshnessState
 ├── generatedAt
 ├── expiresAt
 ├── state
 └── actionReferences
```

---

# Insight Identifier

Recommended format:

```text
ins_<sortable-unique-identifier>
```

---

# Insight Types

Recommended controlled types include:

```text
ExpenseIncrease

ExpenseDecrease

IncomeIncrease

IncomeDecrease

BudgetRisk

BudgetExceeded

GoalProgress

GoalReached

RecurringExpenseDetected

ProjectedNegativeBalance

UnusualCategoryChange

CashFlowImprovement

CashFlowDecline

ReconciliationReminder

DataQualityWarning
```

---

# Insight States

Recommended:

```text
Draft

Generated

Eligible

Displayed

Dismissed

ActedUpon

Expired

Superseded

Invalidated
```

---

# Insight Evidence

An Insight should preserve:

```text
Source Report

Source values

Baseline values

Difference

Policy versions

Data version

Rule or model version

Generation time
```

---

# Insight Confidence

Recommended levels:

```text
Confirmed

High

Medium

Low

InsufficientData
```

---

# Confirmed Insight

The Insight is based on deterministic verified values and an exact rule.

Example:

```text
Your Transport expenses exceeded the active Budget by R$ 150,00.
```

---

# High-Confidence Insight

The pattern is strongly supported but may include interpretation.

---

# Medium-Confidence Insight

The pattern is plausible and should use cautious language.

---

# Low-Confidence Insight

Low-confidence Insights should generally not be proactively displayed unless the Product purpose justifies it.

---

# Insufficient Data

Nexio should not generate a strong Insight when the required historical or comparison data is insufficient.

---

# Insight Severity

Recommended levels:

```text
Informational

Attention

Important

CriticalProductWarning
```

A Product Insight is not a Security Alert unless the Security architecture defines it as such.

---

# Insight Rule Registry

Rule-based Insights should use registered rules.

Recommended fields:

```text
insightRuleId

insightType

name

description

eligibility

inputReports

thresholds

minimumData

confidenceRule

expiration

owner

version

status
```

---

# Insight Rule Identifier

Recommended format:

```text
INSIGHT-RULE-<DOMAIN>-<NUMBER>
```

---

# Expense Increase Insight

A rule should define:

- Current period.
- Baseline period.
- Minimum amount.
- Minimum percentage.
- Category scope.
- Account scope.
- Exclusions.
- Partial-period behavior.
- Confidence.

---

# Budget Risk Insight

Potential rule:

```text
Consumed Amount

+

Projected Eligible Expenses

>

Budget Amount
```

The Insight must identify that projected values are included.

---

# Budget Exceeded Insight

A deterministic Budget Exceeded Insight may be generated when:

```text
Consumed Amount > Budget Amount
```

---

# Goal Progress Insight

A Goal Progress Insight may use:

- Current amount.
- Target amount.
- Recent contribution rate.
- Target date.
- Projection policy.

A predicted completion date is an estimate.

---

# Recurring Expense Insight

Recurring detection should define:

- Minimum occurrences.
- Amount similarity.
- Date pattern.
- Description normalization.
- Account.
- Currency.
- Confidence.
- False-positive handling.

---

# Projected Negative Balance Insight

The Insight must identify:

- Account.
- Projection horizon.
- Current balance.
- Included projected Transactions.
- Projected balance.
- Confidence.
- Data freshness.

It must not claim that the negative balance is certain.

---

# Insight Thresholds

Thresholds must be:

- Registered.
- Versioned.
- Appropriate to currency.
- Appropriate to report type.
- Tested.
- Explainable.

---

# Fixed Monetary Threshold

A fixed threshold must identify currency.

Example:

```text
R$ 100,00
```

It must not be reused for USD without an approved currency-specific policy.

---

# Percentage Threshold

A percentage threshold must define zero-baseline behavior.

---

# Dynamic Threshold

A dynamic threshold may use:

- Historical average.
- Median.
- Standard deviation.
- Interquartile range.
- Owner-defined Budget.
- Owner-defined Goal.

The method must be defined and versioned.

---

# Insight Suppression

An Insight may be suppressed when:

- Data is stale.
- Report is partial.
- Comparison is incompatible.
- Confidence is insufficient.
- The Owner dismissed a similar Insight recently.
- The Insight is superseded.
- The Feature is disabled.
- Required consent is absent.
- A Security or Privacy restriction applies.

---

# Insight Deduplication

Duplicate Insights should be prevented through a stable logical key.

Potential dimensions:

```text
ownerId

insightType

accountScope

period

category

ruleVersion

sourceDataVersion
```

---

# Insight Expiration

An Insight should expire when:

- The reporting period changes.
- Source data changes materially.
- The Report becomes stale.
- A correction invalidates the result.
- The Budget or Goal changes.
- The configured expiration passes.

---

# Insight Invalidation

Invalidated Insights must not remain visible as current.

Historical display or Audit Evidence may preserve the prior Insight with invalidation state.

---

# Insight Action

An Insight may link to:

- Filtered Transaction Report.
- Budget detail.
- Goal detail.
- Projection Report.
- Reconciliation.
- Recurring Transaction management.

The action must preserve Owner and Report scope.

---

# Insight Feedback

Owners may provide feedback such as:

```text
Helpful

Not Helpful

Not Relevant

Dismiss
```

Feedback may improve Product behavior.

It must not directly alter canonical financial values.

---

# Insight Language

Insight language must be:

- Clear.
- Neutral.
- Nonjudgmental.
- Accurate.
- Unambiguous.
- Appropriate to confidence.
- Free from unsupported guarantees.

---

# Prohibited Insight Language

Avoid unsupported language such as:

```text
You will run out of money.

This expense is irresponsible.

You must invest now.

Your finances are bad.

This will definitely happen.
```

---

# AI-Assisted Insights Architecture

AI may assist with explaining verified Reports.

Recommended architecture:

```text
Verified Report and Insight Inputs

↓

Allowed-Field Projection

↓

Privacy and Authorization Validation

↓

Prompt and Model Version Resolution

↓

AI Generation

↓

Structured Output Validation

↓

Financial Fact Verification

↓

Safety Review

↓

Owner Presentation
```

---

# AI Source Boundary

AI must receive only approved Report projections.

It should not receive unrestricted raw financial data when a summarized dataset is sufficient.

---

# AI Insight Input

Potential approved input includes:

```text
Report type

Period

Currency

Verified totals

Verified category summaries

Verified comparisons

Projection labels

Confidence

Data freshness

Policy references
```

---

# AI Insight Forbidden Input

AI should not receive:

- Passwords.
- Tokens.
- Attachments.
- Full Export files.
- Unnecessary Transaction descriptions.
- Another Owner's data.
- Internal Security detections.
- Unrestricted Support notes.
- Legal-Hold Evidence.

---

# AI Output Structure

AI-assisted output should use a structured contract.

Recommended fields:

```text
summary

verifiedFacts

interpretations

suggestions

warnings

sourceReferences

confidence

limitations
```

---

# Verified AI Fact

Every AI-stated financial fact must be checked against the structured input.

Example:

```text
AI statement:
Expenses were R$ 2.300,00.

Verified source value:
R$ 2.300,00.
```

---

# AI Arithmetic

AI must not be trusted to perform authoritative arithmetic.

All totals, differences and percentages must be supplied by or revalidated through the Calculation Engine.

---

# AI Hallucination Control

AI output must be rejected or corrected when it:

- Invents Transactions.
- Invents categories.
- Invents amounts.
- Invents dates.
- Invents future outcomes.
- Changes currency.
- Claims unavailable data exists.
- Treats projection as Posted state.
- Provides unsupported financial advice.

---

# AI Confidence

AI confidence must not replace financial Evidence.

---

# AI Insight Label

AI-assisted content should be identified where appropriate.

Example:

```text
AI-generated explanation based on your Nexio Report.
```

---

# AI Insight Regeneration

Regeneration must preserve:

- Same source data version where comparison is intended.
- Model version.
- Prompt version.
- Generation time.
- Output validation.

---

# AI Insight Expiration

AI-generated content expires when its source Report becomes invalidated or materially stale.

---

# AI Suggestions

AI may suggest:

- Reviewing a category.
- Creating a Budget.
- Reviewing recurring expenses.
- Checking upcoming Transactions.
- Opening a detailed Report.

It must not execute a financial mutation without separate Owner action and Authorization.

---

# AI Advice Boundary

AI-generated educational content must not be represented as individualized regulated financial advice unless a separately approved legal and Product architecture exists.

---

# Report-Derived Notifications

Reports and Insights may trigger Notifications.

Examples include:

```text
Budget exceeded

Goal reached

Projected negative balance

Reconciliation reminder

Recurring Transaction failure

Report ready

Export ready
```

---

# Notification Source Evidence

A Report-derived Notification should preserve:

```text
notificationId

sourceReportId

sourceInsightId

ruleVersion

ownerId

generatedAt

financialDataVersion
```

---

# Notification Freshness

A financial Notification should not be sent from an invalidated or excessively stale Report.

---

# Duplicate Notification Prevention

The same logical Report condition should not generate repeated excessive Notifications.

---

# Notification Deep Link

A deep link must reopen the correct:

- Owner.
- Report.
- Period.
- Account scope.
- Insight.
- Budget.
- Goal.

Authorization must be revalidated.

---

# Notification Privacy

Notification previews should minimize private financial details.

Lock-screen notifications should not expose exact values unless the Owner explicitly enables approved behavior.

---

# Support Reporting Architecture

Support Reporting is a limited projection of Reporting state.

It must not expose unrestricted financial data.

---

# Support Report Model

Potential fields include:

```text
supportReportReference

reportType

safeAccountReference

period

currency

resultState

freshnessState

recordCountBucket

warningCodes

recalculationState

safeErrorCode
```

---

# Support Access Scope

Support access should be:

- Case-scoped.
- Time-bounded.
- Owner-scoped.
- Field-minimized.
- Audited.

---

# Support Report Restrictions

Ordinary Support must not access:

- Another Owner's Reports.
- Full Analytics profiles.
- Internal Security Reports.
- Complete financial Exports.
- Unrestricted AI context.
- Financial correction authority.
- Raw provider credentials.

---

# Support Scenario — Dashboard Total Differs From Detail

Expected behavior:

```text
Confirm Account scope.

Confirm period.

Confirm filters.

Confirm currency.

Confirm Transaction states.

Confirm data freshness.

Confirm calculation and reporting-policy versions.

Request recalculation where available.

Escalate if equivalent scopes remain inconsistent.
```

---

# Support Scenario — Chart Appears Empty

Expected behavior:

- Confirm active filters.
- Confirm selected period.
- Confirm Account scope.
- Distinguish no data from unavailable data.
- Confirm chart and table state.
- Avoid claiming the value is zero without verified calculation.

---

# Support Scenario — Comparison Percentage Seems Wrong

Expected behavior:

- Confirm baseline period.
- Confirm baseline value.
- Confirm zero-baseline behavior.
- Confirm partial-period behavior.
- Confirm equivalent Account scope.
- Escalate incompatible comparison.

---

# Support Scenario — AI Insight Appears Incorrect

Expected behavior:

- Preserve Insight ID.
- Preserve source Report reference.
- Confirm source values.
- Mark the Insight for review.
- Do not alter canonical financial data.
- Escalate hallucinated amounts or unsupported advice.

---

# Audit Reporting Architecture

Audit Reports support controlled reconstruction.

Potential Report types include:

```text
Financial Calculation Reconstruction

Balance Reconstruction

Transfer Reconstruction

Export Reconstruction

Reconciliation Reconstruction

Insight Generation Reconstruction

Analytics Collection Review
```

---

# Audit Report Requirements

Audit Reports should preserve:

- Stable identifier.
- Purpose.
- Owner scope.
- Case scope.
- Source Evidence.
- Policy versions.
- Data versions.
- Generation time.
- Integrity.
- Access history.

---

# Audit Report Isolation

Audit Reports must not be exposed through ordinary Owner Reporting APIs unless a safe Owner-facing projection is explicitly designed.

---

# Reporting Export Architecture

A Report Export is a generated representation of a Report.

Recommended structure:

```text
ReportExport
 ├── reportExportId
 ├── reportId
 ├── reportSnapshotId
 ├── ownerId
 ├── format
 ├── period
 ├── currency
 ├── filters
 ├── recordCount
 ├── summaryValues
 ├── contentHash
 ├── generatedAt
 ├── expiresAt
 └── state
```

---

# Report Export Identifier

Recommended format:

```text
rex_<sortable-unique-identifier>
```

---

# Report Export Formats

Potential formats include:

```text
PDF

CSV

JSON

Spreadsheet

Image
```

Each format must preserve the appropriate exactness and metadata.

---

# PDF Report

A PDF Report should include:

- Title.
- Owner-safe scope.
- Period.
- Time zone.
- Currency.
- Filters.
- Exact summary values.
- Tables or charts.
- Freshness.
- Generation time.
- Page numbers where appropriate.
- Accessible document structure where supported.

---

# CSV Report

A CSV Report must define:

- Character encoding.
- Delimiter.
- Decimal separator.
- Date format.
- Currency representation.
- Header names.
- Newline behavior.
- Escaping.

---

# JSON Report

JSON should use machine-safe monetary values.

Example:

```json
{
  "amount": "1250.45",
  "currency": "BRL"
}
```

---

# Spreadsheet Report

Spreadsheet Exports should:

- Preserve exact decimal values.
- Use explicit currency columns.
- Avoid formulas that change meaning on open.
- Include metadata.
- Protect against formula injection.
- Preserve summary/detail equality.

---

# Spreadsheet Formula Injection

Text values beginning with spreadsheet formula prefixes must be escaped or handled safely.

Potential prefixes include:

```text
=

+

-

@
```

The protection must not corrupt legitimate financial values.

---

# Image Export

An image Export is presentation-only.

It should include enough scope metadata to avoid misleading reuse.

---

# Export Summary Equality

The Exported summary must reconcile with the detailed exported data according to the same Report policy.

---

# Export Snapshot Boundary

The Export should use one consistent Report Snapshot or financial-data boundary.

---

# Report Export Expiration

Generated Report files should expire according to policy.

Expiration must not delete the underlying canonical Report Evidence where retention requires it.

---

# Reporting Privacy Architecture

Reporting contains sensitive financial and behavioral information.

Privacy controls apply to:

- Report queries.
- Report caches.
- Report Snapshots.
- Chart datasets.
- Exports.
- Analytics Events.
- Insights.
- AI inputs.
- Support views.
- Notifications.

---

# Reporting Data Classification

Potential classifications include:

```text
Public

Internal

Owner Private

Financial Sensitive

Security Sensitive

Highly Restricted
```

Owner financial Reports should generally be classified as:

```text
Owner Private

or

Financial Sensitive
```

---

# Report Access

Every Report request must validate:

- Authentication.
- Owner.
- Account scope.
- Authorization.
- Report type.
- Field access.
- Export authority where applicable.

---

# Report URL Safety

Sensitive Report filters and identifiers should not be exposed unnecessarily in shareable URLs.

---

# Browser History

Report URLs must not include sensitive values such as:

- Exact balances.
- Transaction descriptions.
- Account numbers.
- Export tokens.
- AI prompt contents.

---

# Report Sharing

Report sharing requires a separately approved access model.

Ordinary copied URLs must not grant access to another Actor.

---

# Shared Report Scope

A shared Report must define:

- Owner.
- Recipient.
- Scope.
- Fields.
- Period.
- Expiration.
- Revocation.
- Download authority.
- Audit Evidence.

---

# Report Screenshot Privacy

Nexio cannot control every external screenshot.

The interface should minimize unnecessary private information and avoid showing unrelated Accounts.

---

# Reporting Security Architecture

Reporting Security must protect against:

- Cross-Owner query manipulation.
- Insecure filter injection.
- Cache poisoning.
- Cursor tampering.
- Export-token theft.
- Unauthorized broad queries.
- Analytics payload abuse.
- AI prompt injection through data fields.
- Report enumeration.
- Excessive resource consumption.

---

# Query Authorization

Authorization must occur before Report execution.

Filtering another Owner's records after retrieval is prohibited.

---

# Query Parameter Validation

Validate:

- Report type.
- Account IDs.
- Category IDs.
- Date range.
- Sort field.
- Sort direction.
- Filter operators.
- Pagination size.
- Cursor.
- Currency.
- Time zone.

---

# Report Query Complexity

Complex queries should have:

- Date-range limits.
- Group-count limits.
- Result-size limits.
- Execution timeout.
- Concurrency limits.
- Rate limits.

---

# Report Enumeration Protection

Stable identifiers must not permit unauthorized Report discovery.

---

# Export Token Security

Export download tokens must be:

- Short-lived.
- Purpose-bound.
- Owner-bound.
- Non-guessable.
- Revocable.
- Audited.
- Protected from logs.

---

# Analytics Abuse Protection

Analytics endpoints should validate:

- Payload size.
- Event count.
- Schema.
- Rate.
- Environment.
- Application version.
- Consent.
- Replay where required.

---

# AI Prompt Injection Protection

Transaction descriptions, categories and imported text must be treated as untrusted content.

They must not override AI system instructions.

---

# Reporting Accessibility Architecture

Accessibility is mandatory for Owner and administrative Reporting interfaces.

---

# Accessible Report Structure

A Report page should use:

- Logical headings.
- Clear landmarks.
- Accessible filter controls.
- Accessible status messages.
- Accessible tables.
- Descriptive chart labels.
- Keyboard-operable actions.
- Predictable focus order.

---

# Accessible Chart Summary

A chart should have a concise summary.

Example:

```text
Expenses increased from R$ 1.800,00 in June to R$ 2.300,00 in July. Transport was the largest category at R$ 900,00.
```

The summary must use verified values.

---

# Accessible Chart Table

A table alternative should expose:

- Series.
- Category or period.
- Exact value.
- Currency.
- State.
- Comparison where relevant.

---

# Screen-Reader Announcement

Dynamic Report updates should announce:

- Loading.
- Completion.
- Error.
- Filter applied.
- Filter removed.
- Period changed.
- Data stale.
- Recalculation completed.

---

# Keyboard Chart Navigation

Interactive chart points should support keyboard navigation where practical.

When not practical, an equivalent accessible table must provide the same information.

---

# Focus Management

After applying a filter, focus should move predictably to:

- Updated Report heading.
- Result summary.
- Validation error.

---

# Text Scaling

Exact financial values must remain readable at supported text scaling.

They must not be clipped or replaced with inaccessible ellipses.

---

# Horizontal Scrolling

Wide tables may use horizontal scrolling.

Column headers and row identity must remain understandable.

---

# Reduced Motion

Chart animations should respect reduced-motion preferences.

Animations must not be required to understand the data.

---

# Accessible Comparison

Up and down indicators must include text.

Examples:

```text
Increased by R$ 200,00

Decreased by 8%
```

---

# Accessible Empty State

The Empty state should explain:

- Why no data appears.
- Which scope is active.
- Which action is available.
- Whether filters are active.

---

# Reporting Observability Architecture

Reporting observability must cover:

```text
Report generation

Calculation integration

Cache behavior

Snapshot integrity

Visualization rendering

Filter behavior

Pagination

Exports

Analytics ingestion

Insight generation

AI generation

Owner isolation

Accessibility
```

---

# Report Generation Metrics

Recommended:

```text
report_generation_success_rate

report_generation_latency

report_generation_failure_count

report_partial_result_count

report_stale_result_count

report_verification_failure_count
```

---

# Dashboard Metrics

```text
dashboard_generation_success_rate

dashboard_component_failure_count

dashboard_mixed_data_version_count

dashboard_stale_component_count

dashboard_owner_scope_violation_count
```

---

# Chart Metrics

```text
chart_render_failure_count

chart_dataset_report_mismatch_count

chart_accessible_table_missing_count

chart_partial_data_count

chart_stale_data_count
```

---

# Table Metrics

```text
report_table_query_failure_count

report_pagination_cursor_failure_count

report_total_visible_page_confusion_count

report_virtualization_accessibility_failure_count
```

---

# Cache Metrics

```text
report_cache_hit_rate

report_cache_miss_rate

report_cache_stale_use_count

report_cache_invalidation_failure_count

report_cache_owner_scope_violation_count
```

---

# Comparison Metrics

```text
comparison_generation_failure_count

comparison_incompatible_scope_count

comparison_zero_baseline_count

comparison_partial_period_warning_count
```

---

# Analytics Metrics

```text
analytics_event_acceptance_rate

analytics_event_rejection_rate

analytics_event_duplicate_rate

analytics_event_delay

analytics_schema_violation_count

analytics_consent_violation_count

analytics_forbidden_field_count
```

---

# Insight Metrics

```text
insight_generation_success_rate

insight_generation_failure_count

insight_invalidated_count

insight_low_confidence_suppressed_count

insight_feedback_helpful_rate

insight_duplicate_count
```

---

# AI Insight Metrics

```text
ai_insight_generation_success_rate

ai_insight_validation_failure_count

ai_insight_financial_fact_mismatch_count

ai_insight_hallucination_count

ai_insight_expired_source_count

ai_insight_safety_rejection_count
```

---

# Export Metrics

```text
report_export_success_rate

report_export_failure_count

report_export_summary_mismatch_count

report_export_download_count

report_export_expiration_count

report_export_unauthorized_access_count
```

---

# Owner-Isolation Metrics

```text
cross_owner_report_query_count

cross_owner_report_cache_violation_count

cross_owner_snapshot_access_count

cross_owner_export_access_count

cross_owner_analytics_context_count
```

Targets must be zero.

---

# Reporting SLO Architecture

Potential SLO categories include:

```text
Report correctness

Report availability

Report latency

Dashboard consistency

Report freshness

Cache invalidation

Export correctness

Analytics ingestion

Insight generation

Accessibility
```

---

# Report Correctness SLO

Target:

```text
Every authoritative Report total matches the Calculation Engine for the same scope, policy and data version.
```

---

# Report Availability SLO

Potential objective:

```text
Supported Owner Reports generate successfully within the approved availability target.
```

---

# Report Latency SLO

Potential objective:

```text
Common Dashboard and Report requests complete within the approved latency target.
```

Performance optimizations must not weaken correctness.

---

# Dashboard Consistency SLO

Target:

```text
Dashboard components do not present incompatible Owner, Account, period, currency or financial-data scopes as one coherent snapshot.
```

---

# Report Freshness SLO

Potential objective:

```text
Accepted financial mutations appear in current Reports within the approved freshness window.
```

---

# Cache Invalidation SLO

Potential objective:

```text
Material Report cache entries are invalidated or marked stale within the approved window after relevant financial Events.
```

---

# Export Correctness SLO

Target:

```text
Report Export summary values equal the approved aggregation of exported detail records.
```

---

# Analytics Ingestion SLO

Potential objective:

```text
Valid consent-compliant Analytics Events enter approved datasets within the operational ingestion window.
```

---

# Insight Generation SLO

Potential objective:

```text
Eligible Insights are generated from current verified Reports within the approved window.
```

---

# Accessibility SLO

Target:

```text
Every material financial chart has an accessible equivalent.
```

---

# Zero-Tolerance Reporting Failures

Targets must be zero for:

```text
Cross-Owner Report access

Cross-Owner cache reuse

Cross-Owner Report Export

Dashboard value using an unapproved formula

Missing currency on authoritative monetary Report

Incompatible currency aggregation

Unavailable value represented as zero

Projected value represented as Posted

AI-invented financial amount displayed as fact

Report Export detail-summary mismatch

Financial meaning communicated only through color
```

---

# Reporting Error Budgets

Error budgets may apply to:

- Noncritical chart-rendering latency.
- Optional Insight delay.
- Low-risk Analytics delay.
- Noncritical dashboard-component delay.
- Export queue latency.

They must not normalize:

```text
Incorrect Report totals

Owner-isolation failure

Misleading financial state

Currency inconsistency

Missing Report scope

Export inconsistency

AI financial hallucination

Accessibility absence
```

---

# Reporting Alerts

Alerts should identify:

- Environment.
- Report type.
- Owner scope category.
- Account scope category.
- Policy version.
- Data version.
- Severity.
- Runbook.
- Responsible owner.

Private financial details should be minimized.

---

# Critical Reporting Alerts

Trigger immediately for:

```text
Cross-Owner Report result

Cross-Owner cache result

Cross-Owner Export access

Dashboard total inconsistent with Calculation Engine

Report marked verified after integrity failure

Projected values displayed as Posted values

AI-generated invented financial fact displayed

Incompatible currencies aggregated

Unavailable financial result replaced with zero
```

---

# High Reporting Alerts

Potential High alerts include:

```text
Report Export summary mismatch

Dashboard mixed financial-data versions

Persistent stale Balance Report

Chart dataset differs from Report total

Reconciliation Report differs from completion snapshot

Analytics consent violation

AI source Report expired during generation
```

---

# Moderate Reporting Alerts

Potential Moderate alerts include:

```text
Chart render failure

Accessible table missing

Comparison scope incompatibility

Report cache invalidation delay

Insight generation delay

Analytics schema rejection increase
```

---

# Visualization, Analytics and Insights Acceptance Criteria

The Visualization, Analytics and Insights architecture is accepted only when:

1. Every chart uses a canonical Report dataset.

2. Charts do not define independent authoritative financial formulas.

3. Every chart identifies its Report source.

4. Every chart identifies its scope.

5. Every monetary chart identifies currency.

6. Every time-series chart defines time zone.

7. Every time-series chart defines granularity.

8. Missing data remains distinct from zero.

9. Partial periods are identified.

10. Projected values are visually and textually distinct.

11. Pending values are visually and textually distinct.

12. Reconciled state is represented accurately.

13. Stale charts identify data age.

14. Partial charts identify missing data.

15. Chart failure does not display fabricated zero values.

16. Exact values remain available.

17. Display abbreviations do not become authoritative values.

18. Display rounding does not change Report totals.

19. Bar charts use honest baselines.

20. Nonzero baselines are disclosed.

21. Dual-axis charts are avoided or clearly explained.

22. Incompatible units are not combined on one axis silently.

23. Incompatible currencies are not combined.

24. Positive and negative values are not distinguished only by color.

25. Light and Dark themes preserve Chart readability.

26. Legends identify every visible series.

27. Interactive legends expose active visual filtering.

28. Tooltips are not the only source of material information.

29. Chart labels preserve signs and units.

30. Label collision does not produce unreadable content.

31. Annotations identify their source type.

32. Projection boundaries are visible.

33. Projection confidence is explicit.

34. Line charts do not invent unsupported intermediate data.

35. Smoothed lines do not distort exact financial trends.

36. Bar groups use compatible scope and units.

37. Stacked components reconcile with their total.

38. Pie and Donut charts are limited to appropriate compositions.

39. Pie and Donut charts do not display negative values.

40. `Other` groups remain explorable.

41. Waterfall closing values reconcile with the Report.

42. Budget progress preserves values above 100%.

43. Goal progress preserves exact excess values.

44. Gauge visualizations are not used where they obscure exact meaning.

45. Chart interactions are keyboard accessible where practical.

46. Zoom does not redefine full Report totals.

47. Drill-down preserves Owner scope.

48. Drill-down preserves Account scope.

49. Drill-down preserves period.

50. Drill-down preserves currency.

51. Drill-down detail reconciles with the selected chart value.

52. Cross-filters remain visible.

53. Chart Exports preserve scope and generation metadata.

54. Screenshots are not treated as complete financial Reports.

55. Every material chart has an accessible table or equivalent.

56. Data Tables have stable row identity.

57. Monetary columns preserve exact values.

58. Date columns identify date semantics.

59. Status columns use text.

60. Table totals identify their scope.

61. Group totals reconcile with group records.

62. Expandable rows are keyboard accessible.

63. Row selection does not grant financial mutation authority.

64. Virtualized tables preserve Accessibility.

65. Report detail views explain scope.

66. Report detail views explain included and excluded states.

67. Value explanations preserve policy and data versions.

68. Contributing-record access is reauthorized.

69. Every comparison has a stable identifier where required.

70. Every comparison defines current and baseline Reports.

71. Comparisons validate Owner equivalence.

72. Comparisons validate Account-scope compatibility.

73. Comparisons validate currency compatibility.

74. Comparisons validate period compatibility.

75. Comparisons validate policy compatibility.

76. Incompatible comparisons are rejected or qualified.

77. Difference formulas are documented.

78. Percentage formulas are documented.

79. Zero-baseline behavior is explicit.

80. Negative-baseline behavior is understandable.

81. Partial-period comparisons are disclosed.

82. Previous-period boundaries use the same reporting calendar.

83. Trends define minimum data requirements.

84. Stability tolerances are versioned.

85. Seasonality claims require sufficient data.

86. Aggregation groups use stable identifiers.

87. Uncategorized remains distinct from Unknown.

88. `Other` groups preserve contributing records.

89. Top-N ranking uses exact values.

90. Top-N tie behavior is defined.

91. Product Analytics remains separate from canonical financial reporting.

92. Product Analytics Events are registered.

93. Every Analytics Event has a stable key.

94. Every Analytics Event has a schema version.

95. Analytics Events define purpose.

96. Analytics Events define triggers.

97. Analytics properties are typed.

98. Analytics forbidden fields are defined.

99. Analytics excludes secrets.

100. Analytics excludes complete private financial content by default.

101. Exact financial values are not collected without approved purpose.

102. Financial Analytics buckets are registered and reviewed.

103. Analytics identity is minimized.

104. External Analytics avoids canonical Owner IDs by default.

105. Analytics Session remains distinct from Authentication Session.

106. Analytics attempt and success Events remain distinct.

107. Analytics duplicates are detectable.

108. Offline Analytics preserves Event and consent state.

109. Owner switching does not mix offline Analytics queues.

110. Consent is validated before nonessential collection.

111. Opt-out stops applicable future collection.

112. Test Analytics does not enter Production datasets.

113. Analytics ingestion validates schemas.

114. Invalid Analytics Events do not redefine schemas silently.

115. Analytics schemas are versioned.

116. Analytics datasets identify purpose.

117. Analytics datasets identify source Event versions.

118. Product metrics are registered.

119. Product metrics define numerator.

120. Product metrics define denominator.

121. Unique-user metrics define identity boundaries.

122. Funnels define eligibility.

123. Funnels define ordered steps.

124. Funnels define completion windows.

125. Small populations receive appropriate protection.

126. Analytics comparisons preserve equivalent populations.

127. Analytics quality is measured.

128. Analytics completeness is measurable.

129. Analytics validity is measurable.

130. Analytics timeliness is measurable.

131. Analytics uniqueness is measurable.

132. Analytics consent compliance is measurable.

133. Analytics data loss is not confused with financial-data loss.

134. Operational Analytics minimizes Owner financial details.

135. Operational Dashboards do not replace Audit Evidence.

136. Every material Insight has a stable identifier.

137. Every Insight identifies Owner scope.

138. Every Insight identifies source Reports.

139. Every Insight identifies source calculations where applicable.

140. Every Insight identifies currency.

141. Every Insight identifies generation time.

142. Every Insight identifies freshness.

143. Insight types are controlled.

144. Insight states are controlled.

145. Insight confidence is explicit.

146. Insufficient data suppresses strong conclusions.

147. Insight severity remains distinct from Security severity.

148. Rule-based Insights use registered Rules.

149. Insight Rules are versioned.

150. Insight thresholds are versioned.

151. Fixed monetary thresholds identify currency.

152. Percentage thresholds define zero-baseline behavior.

153. Dynamic thresholds define their analytical method.

154. Budget-risk Insights identify projected inclusion.

155. Projected-negative-balance Insights identify uncertainty.

156. Recurring-expense detection defines minimum occurrences.

157. Insight duplicates are prevented.

158. Insights expire when source data changes materially.

159. Invalidated Insights are not presented as current.

160. Insight actions preserve Report scope.

161. Insight feedback does not change financial state.

162. Insight language is neutral.

163. Insight language reflects confidence.

164. Insights do not guarantee future outcomes.

165. Insights do not shame Owners.

166. Insights do not become regulated financial advice without approval.

167. AI receives only approved Report projections.

168. AI does not receive another Owner's data.

169. AI does not receive unnecessary sensitive content.

170. AI outputs use a structured contract.

171. AI-stated financial facts are verified.

172. AI is not trusted for authoritative arithmetic.

173. AI cannot invent Transactions.

174. AI cannot invent amounts.

175. AI cannot invent dates.

176. AI cannot change currencies.

177. AI cannot present projections as Posted facts.

178. AI hallucinations are rejected or corrected.

179. AI-assisted content is labeled where appropriate.

180. AI output preserves source references.

181. AI output expires with its source Report.

182. AI suggestions require separate Owner action for mutations.

183. Report-derived Notifications preserve source references.

184. Financial Notifications use current or approved data.

185. Duplicate Report Notifications are controlled.

186. Notification deep links revalidate Authorization.

187. Lock-screen Notifications minimize financial information.

188. Support Reporting is case-scoped.

189. Support Reporting is Owner-scoped.

190. Support Reporting is field-minimized.

191. Support cannot access unrestricted Analytics profiles.

192. Support cannot create financial corrections through Report views.

193. Dashboard-detail inconsistencies trigger escalation.

194. Empty charts are not described as zero without verification.

195. AI Insight defects preserve source references.

196. Audit Reports preserve policy and data versions.

197. Audit Reports remain distinct from ordinary Owner Reports.

198. Report Exports have stable identifiers.

199. Report Exports identify source Report and Snapshot.

200. PDF Reports preserve scope metadata.

201. CSV Reports define delimiter and decimal formats.

202. JSON Reports use exact monetary serialization.

203. Spreadsheet Reports protect against formula injection.

204. Image Exports are identified as presentation artifacts.

205. Export summaries reconcile with exported detail.

206. Report Exports use one consistent data boundary.

207. Report Export expiration is controlled.

208. Reporting data is classified.

209. Every Report request validates Authentication.

210. Every Report request validates Owner scope.

211. Every Account ID is verified against the Owner.

212. Report URLs avoid sensitive values.

213. Copied URLs do not grant Report authority.

214. Report sharing requires an explicit model.

215. Query Authorization occurs before data retrieval.

216. Filter injection is prevented.

217. Pagination cursors are integrity-protected.

218. Report enumeration is prevented.

219. Export tokens are short-lived and Owner-bound.

220. Analytics endpoints validate rate and payload size.

221. Untrusted financial text cannot override AI instructions.

222. Report pages use logical heading structure.

223. Report filters are keyboard accessible.

224. Dynamic Report states are announced.

225. Chart summaries use verified values.

226. Interactive charts have accessible alternatives.

227. Focus management is predictable.

228. Text scaling does not hide exact values.

229. Wide tables remain understandable.

230. Reduced-motion preferences are respected.

231. Comparison direction is available through text.

232. Empty states explain scope and filters.

233. Report generation is monitored.

234. Dashboard consistency is monitored.

235. Chart and Report mismatches are monitored.

236. Cache invalidation is monitored.

237. Comparison incompatibility is monitored.

238. Analytics quality is monitored.

239. Insight validity is monitored.

240. AI financial-fact mismatches are monitored.

241. Export summary equality is monitored.

242. Owner-isolation metrics have a zero target.

243. Reporting SLOs are defined.

244. Zero-tolerance Reporting failures are excluded from error budgets.

245. Critical Reporting alerts are defined.

246. Critical alerts connect to runbooks.

247. Private financial values are minimized in alerts.

248. Cross-Owner Reporting is treated as Critical.

249. AI-invented financial facts are treated as a material Product defect.

250. Every visualization, comparison, Analytics metric and Insight remains traceable to approved data, policy and scope.

---

# Visualization, Analytics and Insights Rule

A visualization is not trustworthy merely because its shape appears correct.

It is trustworthy only when Nexio can establish:

```text
The canonical Report source

The Owner and Account scope

The period and reporting time zone

The currency

The exact underlying values

The visualization transformation

The axis and scale behavior

The missing-data behavior

The projection and confidence state

The freshness state

The accessible equivalent

The drill-down relationship
```

An Analytics metric is not trustworthy merely because a dashboard displays a percentage.

It is trustworthy only when:

```text
The Event schema is registered.

The eligible population is defined.

The numerator is defined.

The denominator is defined.

The time window is defined.

The identity boundary is defined.

Consent requirements are satisfied.

Data quality is known.

The result can be reproduced.
```

An Insight is not trustworthy merely because its wording appears plausible.

It is trustworthy only when:

```text
Its source Reports are verified.

Its source values are exact.

Its Rule or model version is known.

Its confidence is explicit.

Its limitations are preserved.

Its language matches the Evidence.

Its source data remains current.
```

When a chart, metric or Insight is stale, partial, incompatible, inaccessible, unsupported, low-confidence or unverifiable, Nexio must preserve and communicate that state.

Nexio must never distort an axis, hide missing data, combine incompatible currencies, reuse another Owner's dataset, invent an Analytics denominator, display a projected value as Posted, or allow AI to create unsupported financial facts.

Every visualization and interpretation must remain subordinate to canonical financial Resources, approved Calculation results, versioned Reporting policies and verified Owner scope.


# Reporting Governance Architecture

Reporting, Analytics, Dashboards, Visualizations, Metrics and Insights are governed Platform capabilities.

They must not be treated as isolated interface components, unrestricted query tools or independent interpretations of financial state.

Governance applies to:

```text
Report definitions

Report schemas

Reporting policies

Calculation references

Dashboard compositions

Dashboard components

Visualization datasets

Charts

Tables

Filters

Saved filters

Comparisons

Report Snapshots

Report caches

Report Exports

Product Analytics Events

Analytics datasets

Analytics metrics

Funnels

Operational metrics

Insight Rules

Generated Insights

AI-assisted explanations

Report-derived Notifications

Support Reports

Audit Reports
```

The governance lifecycle is:

```text
Reporting Need Identified

↓

Canonical Question Defined

↓

Owner, Account and Data Scope Defined

↓

Calculation and Reporting Policies Defined

↓

Security, Privacy and Accessibility Review

↓

Report, Metric or Insight Registered

↓

Implementation

↓

Data and Formula Verification

↓

Production Activation

↓

Monitoring

↓

Periodic Review

↓

Migration or Correction

↓

Deprecation

↓

Retirement

↓

Historical Preservation
```

---

# Reporting Governance Objectives

The Nexio Reporting governance program shall ensure:

```text
Every material Report has one defined meaning.

Every displayed total has an authoritative source.

Every Report identifies Owner and Account scope.

Every Report identifies period, time zone and currency.

Every visualization preserves exact underlying values.

Every metric defines its numerator and denominator.

Every comparison defines a valid baseline.

Every Insight identifies its Evidence and confidence.

Every AI explanation is validated against verified data.

Every Export remains reproducible.

Every stale or partial state is disclosed.

Every cross-Owner result is prevented.

Every obsolete Report, Metric and Insight Rule is retired.
```

---

# Reporting Governance Principles

The Reporting governance model is based on:

```text
Canonical Source

Stable Semantic Meaning

Owner Isolation

Explicit Scope

Explicit Time

Explicit Currency

Versioned Policy

Data Lineage

Reproducibility

Freshness Transparency

Visual Integrity

Accessible Equivalence

Controlled Interpretation

Lifecycle Management
```

---

# Canonical Source Governance

Every material Report must identify its authoritative source.

Potential authoritative sources include:

```text
Financial Calculation Engine

Canonical financial Resources

Approved Financial Snapshot

Approved Reconciliation Snapshot

Approved Product Analytics Dataset

Approved Operational Metric Store

Verified Provider Dataset
```

The following are not canonical sources:

- Client-rendered card totals.
- Browser caches without verification.
- Android local summaries.
- Screenshots.
- AI-generated summaries.
- Support notes.
- Analytics Event counts used as financial records.
- Manually edited chart values.
- Unregistered spreadsheets.

---

# Stable Semantic Meaning Governance

A Report label must retain one stable meaning.

Examples:

```text
Current Balance

Available Balance

Total Income

Total Expenses

Net Cash Flow

Budget Consumed

Goal Progress

Reconciliation Difference
```

A label must not change formula based on:

- Device.
- Screen size.
- Theme.
- Application version.
- Report layout.
- User interface experiment.
- Chart type.
- Export format.

When semantic meaning changes, Nexio must create a new Reporting policy or Report version.

---

# Explicit Scope Governance

Every Report must define:

```text
Owner scope

Account scope

Resource scope

Category scope

Period

Time zone

Currency

Included states

Excluded states

Filters

Policy versions

Data version
```

Scope must not be inferred only from interface position.

---

# Reporting Governance Roles

Recommended roles include:

```text
Reporting Product Owner

Reporting Domain Owner

Dashboard Owner

Visualization Owner

Report Platform Owner

Financial Reporting Owner

Product Analytics Owner

Operational Analytics Owner

Metric Governance Owner

Insight Product Owner

Insight Rule Owner

AI Insight Owner

Report Export Owner

Reporting Data Owner

Reporting Privacy Owner

Reporting Security Owner

Accessibility Owner

Support Reporting Owner

Audit Reporting Owner

Operations Owner

Release Manager
```

One individual may hold multiple responsibilities.

Responsibilities must remain explicit.

---

# Reporting Product Owner

The Reporting Product Owner is responsible for:

- Owner-facing Report purpose.
- Report discoverability.
- Report terminology.
- Dashboard composition.
- Default periods.
- Filter behavior.
- Comparison presentation.
- Insight presentation.
- Help content.
- Product acceptance.

---

# Reporting Domain Owner

The Reporting Domain Owner is responsible for:

- Canonical Report model.
- Report Type Registry.
- Reporting policies.
- Report invariants.
- Report result states.
- Data lineage.
- Reproducibility.
- Reporting acceptance criteria.

---

# Dashboard Owner

The Dashboard Owner is responsible for:

- Dashboard default scope.
- Component composition.
- Component dependencies.
- Component freshness.
- Error isolation.
- Responsive behavior.
- Dashboard personalization.
- Dashboard consistency.

---

# Visualization Owner

The Visualization Owner is responsible for:

- Chart Type Registry.
- Axis standards.
- Color and pattern standards.
- Accessible chart equivalents.
- Visualization transformations.
- Drill-down behavior.
- Visual integrity.
- Theme compatibility.

---

# Report Platform Owner

The Report Platform Owner is responsible for:

- Report generation.
- Report APIs.
- Query execution.
- Pagination.
- Filtering.
- Sorting.
- Report Snapshots.
- Report caching.
- Report history.
- Report observability.

---

# Financial Reporting Owner

The Financial Reporting Owner is responsible for:

- Calculation Engine integration.
- Financial Report definitions.
- Transfer treatment.
- Refund and Reversal treatment.
- Balance Report consistency.
- Budget and Goal Reporting.
- Reconciliation Reporting.
- Financial Export equality.

---

# Product Analytics Owner

The Product Analytics Owner is responsible for:

- Analytics Event Registry.
- Product datasets.
- Feature-adoption metrics.
- Funnels.
- Experiment reporting.
- Analytics data quality.
- Analytics retention.
- Analytics documentation.

---

# Operational Analytics Owner

The Operational Analytics Owner is responsible for:

- Service metrics.
- Platform health Dashboards.
- Processing metrics.
- Error metrics.
- Provider metrics.
- Operational data quality.
- Operational alert integration.

---

# Metric Governance Owner

The Metric Governance Owner is responsible for:

- Metric Registry.
- Numerator definitions.
- Denominator definitions.
- Eligibility rules.
- Exclusion rules.
- Time windows.
- Metric versioning.
- Metric retirement.

---

# Insight Product Owner

The Insight Product Owner is responsible for:

- Insight catalog.
- Owner-facing language.
- Insight priority.
- Action references.
- Dismissal behavior.
- Notification integration.
- Insight retirement.

---

# Insight Rule Owner

The Insight Rule Owner is responsible for:

- Insight eligibility.
- Thresholds.
- Minimum data.
- Confidence.
- Suppression.
- Deduplication.
- Expiration.
- Test vectors.

---

# AI Insight Owner

The AI Insight Owner is responsible for:

- Approved AI capabilities.
- Prompt versions.
- Model references.
- Structured outputs.
- Financial-fact validation.
- Safety controls.
- AI evaluation.
- AI Incident response.

---

# Report Export Owner

The Report Export Owner is responsible for:

- Export formats.
- Export schemas.
- Exact value preservation.
- Summary and detail equality.
- File expiration.
- Content integrity.
- Download controls.
- Accessibility of exported Reports.

---

# Reporting Data Owner

The Reporting Data Owner is responsible for:

- Reporting datasets.
- Data contracts.
- Data versions.
- Report Snapshot persistence.
- Cache storage.
- Data lineage.
- Dataset migration.
- Backup and restore.

---

# Reporting Privacy Owner

The Reporting Privacy Owner is responsible for:

- Report data classification.
- Analytics consent.
- Data minimization.
- AI input restrictions.
- Report sharing.
- Support projections.
- Retention.
- Small-population protection.

---

# Reporting Security Owner

The Reporting Security Owner is responsible for:

- Report Authorization.
- Query validation.
- Cross-Owner prevention.
- Cache isolation.
- Export-token security.
- Report enumeration protection.
- Analytics endpoint security.
- AI prompt-injection controls.

---

# Accessibility Owner

The Accessibility Owner is responsible for:

- Accessible Report structure.
- Chart alternatives.
- Table usability.
- Keyboard navigation.
- Screen-reader behavior.
- Text scaling.
- Theme contrast.
- Reduced motion.
- Accessible Exports.

---

# Support Reporting Owner

The Support Reporting Owner is responsible for:

- Support-safe Report projections.
- Support permissions.
- Case-scoped access.
- Support diagnostic workflows.
- Escalation criteria.
- Support documentation.

---

# Audit Reporting Owner

The Audit Reporting Owner is responsible for:

- Investigation Reports.
- Report reconstruction.
- Report access Evidence.
- Report Export Evidence.
- Analytics collection review.
- Insight-generation reconstruction.
- Reporting Incident Evidence.

---

# Reporting Responsibility Matrix

| Capability | Product | Reporting | Financial | Security | Privacy | Accessibility | Operations |
|---|---|---|---|---|---|---|---|
| Report definition | Required | Required | As applicable | Required | Required | Required | As applicable |
| Dashboard composition | Required | Required | Required | Required | Required | Required | Required |
| Visualization | Required | Required | Required | As applicable | As applicable | Required | As applicable |
| Product Analytics | Required | Required | As applicable | Required | Required | Required | Required |
| Insight Rules | Required | Required | Required | Required | Required | Required | Required |
| AI explanations | Required | Required | Required | Required | Required | Required | Required |
| Report Export | Required | Required | Required | Required | Required | Required | Required |
| Support Reporting | Required | Required | Required | Required | Required | Required | Required |
| Audit Reporting | As applicable | Required | Required | Required | Required | As applicable | Required |

---

# Report Type Registry

Every material Report must exist in the Report Type Registry.

No Product screen, service, Background Job, Support tool or Export process may introduce a canonical Report type outside the Registry.

---

# Report Type Registry Record

Recommended fields:

```text
reportTypeId

reportTypeKey

name

description

domain

purpose

ownerScope

supportedAccountScopes

supportedPeriods

supportedCurrencies

inputResources

calculationType

calculationPolicyReference

reportingPolicyReference

includedStates

excludedStates

supportedFilters

supportedSorts

supportedVisualizations

freshnessPolicy

snapshotPolicy

cachePolicy

exportFormats

accessibilityRequirements

securityClassification

privacyClassification

owner

status

version

introducedAt

lastReviewed

nextReviewAt
```

---

# Report Type Identifier

Recommended format:

```text
REPORT-<DOMAIN>-<NUMBER>
```

Examples:

```text
REPORT-DASHBOARD-001

REPORT-CASHFLOW-004

REPORT-BUDGET-003

REPORT-RECONCILIATION-002
```

---

# Report Type Key

Recommended format:

```text
report.<domain>.<name>
```

Examples:

```text
report.dashboard.financial_overview

report.cashflow.monthly

report.budget.performance

report.goal.progress
```

---

# Report Type Activation Requirements

```text
□ Purpose is defined.

□ Owner scope is defined.

□ Account scope is defined.

□ Period model is defined.

□ Time-zone model is defined.

□ Currency behavior is defined.

□ Canonical calculation is defined.

□ Included states are defined.

□ Excluded states are defined.

□ Transfer treatment is defined.

□ Filter behavior is defined.

□ Sorting behavior is defined.

□ Freshness policy is defined.

□ Empty state is defined.

□ Partial state is defined.

□ Export behavior is defined.

□ Accessibility requirements are defined.

□ Security review is complete.

□ Privacy review is complete.

□ Test vectors exist.
```

---

# Report Status

Recommended lifecycle states:

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

# Draft Report

The Report is under design and must not be treated as Production authority.

---

# Reviewing Report

Financial, Reporting, Security, Privacy and Accessibility behavior is under review.

---

# Approved Report

The Report definition is approved but may not be active.

---

# Active Report

The Report is available for supported use.

---

# Limited Report

The Report is active only for a defined environment, platform, cohort or Product version.

---

# Deprecated Report

No new dependencies should be introduced.

A replacement and retirement plan must exist.

---

# Retired Report

Supported Product surfaces no longer generate the Report.

---

# Archived Report

Historical definitions and Report artifacts remain available according to retention policy.

---

# Reporting Policy Registry

Every material Reporting behavior must reference a versioned Reporting policy.

---

# Reporting Policy Record

Recommended fields:

```text
reportingPolicyId

policyKey

name

description

policyType

version

effectiveFrom

effectiveUntil

scopeRules

periodRules

timeZoneRules

currencyRules

filterRules

groupingRules

sortingRules

comparisonRules

visualizationRules

freshnessRules

emptyStateRules

partialStateRules

exportRules

accessibilityRules

migrationRules

owner

status
```

---

# Reporting Policy Identifier

Recommended format:

```text
REPORTING-POLICY-<DOMAIN>-<NUMBER>
```

---

# Reporting Policy Types

Recommended policy types include:

```text
Scope

Period

Currency

Grouping

Filtering

Sorting

Comparison

Dashboard Composition

Visualization

Freshness

Snapshot

Cache

Export

Insight

Analytics
```

---

# Reporting Policy Versioning

A Reporting policy change must create a new version when it changes:

- Report meaning.
- Scope.
- Period boundaries.
- Grouping.
- Comparison formula.
- Visualization interpretation.
- Freshness behavior.
- Export content.
- Insight eligibility.

---

# Historical Reporting Policy

Historical Reports must preserve or reconstruct the Reporting policy used at generation time where required.

---

# Report Schema Governance

Every Report schema must define:

```text
Stable field names

Field types

Required fields

Optional fields

Monetary value structure

Currency fields

Period fields

Scope fields

Freshness fields

Warning fields

Integrity fields

Schema version
```

---

# Report Schema Compatibility

Schema evolution should remain:

```text
Backward-readable

Versioned

Export-compatible

Snapshot-compatible

Support-compatible

Investigation-compatible
```

---

# Breaking Report Schema Change

A breaking change requires:

- New schema version.
- Compatible readers.
- Migration strategy.
- Export compatibility review.
- Snapshot compatibility review.
- API compatibility review.
- Android and Web compatibility review.
- Rollback or forward-correction strategy.

---

# Reporting Data Contract

Every Report-producing component must use a registered data contract.

Recommended fields:

```text
dataContractId

producer

consumer

reportType

schemaVersion

currencyModel

timeZoneModel

freshnessModel

errorModel

compatibilityRange

owner
```

---

# Data Contract Identifier

Recommended format:

```text
RDATA-CONTRACT-<NUMBER>
```

---

# Data Lineage Architecture

Every material Report should preserve data lineage.

Recommended lineage:

```text
Canonical Resource

↓

Financial Calculation

↓

Report Aggregation

↓

Report Snapshot

↓

Visualization Dataset

↓

Chart or Table

↓

Export, Insight or Notification
```

---

# Data Lineage Record

Recommended fields:

```text
lineageId

sourceResourceIds

sourceCalculationIds

sourceReportIds

sourceSnapshotIds

derivedArtifactId

transformationType

policyVersions

dataVersion

createdAt
```

---

# Report Provenance

A material Report should answer:

```text
Which service generated it?

Which code version generated it?

Which calculation policy was used?

Which Reporting policy was used?

Which source data version was used?

Which cache or snapshot was used?

Which environment generated it?

When was it generated?
```

---

# Report Integrity

Material Report Snapshots and Exports may use:

- Content hashes.
- Signed manifests.
- Immutable storage.
- Versioned identifiers.
- Source references.
- Integrity verification.

---

# Report Integrity States

Recommended:

```text
Unverified

Verified

VerificationPending

VerificationFailed

Superseded

Invalidated
```

---

# Report Verification

Verification may compare:

```text
Report summary values

Calculation Engine values

Detailed-record aggregation

Snapshot values

Export values

Chart datasets
```

---

# Report Summary and Detail Equality

For Reports containing detailed financial rows:

```text
Approved aggregation of detail rows
=
Report summary values
```

according to the same policy.

---

# Report Verification Failure

A verification failure must:

- Preserve the Report.
- Mark it VerificationFailed.
- Stop it from being presented as verified.
- Invalidate dependent Insights.
- Invalidate dependent Notifications.
- Trigger investigation where material.
- Preserve source references.

---

# Report Freshness Governance

Every Report type must have a Freshness policy.

---

# Freshness Policy Record

Recommended fields:

```text
freshnessPolicyId

reportType

maximumCurrentAge

nearCurrentAge

maximumStaleUseAge

eventInvalidationRules

manualRefreshAllowed

offlineUseAllowed

staleDisplayRules

owner
```

---

# Freshness States

Recommended:

```text
Current

NearCurrent

Stale

Expired

Recalculating

Partial

Unavailable

VerificationFailed
```

---

# Current-State Governance

A Report is Current only when:

- Its source data is within the approved data-version boundary.
- Its age is within the freshness window.
- No invalidation Event exists.
- Integrity verification passes where required.
- Policy versions remain supported.

---

# Stale-Use Governance

Stale Reports may be displayed only when:

- The stale-use policy permits it.
- The data-as-of time is visible.
- The Report is clearly marked stale.
- A refresh action is available where possible.
- No high-risk operation relies on it as current.

---

# Expired Report

An expired Report must not be presented as a current value.

---

# Freshness Invalidation Events

Potential Events include:

```text
Transaction created

Transaction updated

Transaction reversed

Transfer completed

Transfer corrected

Account state changed

Budget updated

Goal contribution changed

Recurring instance generated

Import completed

Reconciliation reopened

Financial policy activated

Reporting policy activated
```

---

# Report Snapshot Governance

Every Report Snapshot must define:

- Purpose.
- Scope.
- Source data version.
- Policy versions.
- Integrity.
- Retention.
- Invalidation behavior.
- Access.
- Export eligibility.

---

# Report Snapshot States

Recommended:

```text
Generating

Current

Stale

Superseded

Invalidated

VerificationFailed

Archived

Destroyed
```

---

# Snapshot Supersession

A new Snapshot may supersede an older Snapshot.

The older Snapshot must remain historically identifiable where retention requires it.

---

# Snapshot Destruction

Snapshot destruction must comply with:

- Report retention.
- Financial Evidence retention.
- Export retention.
- Legal Hold.
- Privacy requirements.
- Backup policy.

---

# Report Cache Governance

Caches are performance mechanisms.

They are not financial authorities.

---

# Cache Requirements

```text
□ Owner scope is part of the cache key.

□ Account scope is part of the cache key.

□ Period is part of the cache key.

□ Currency is part of the cache key.

□ Filters are represented.

□ Policy versions are represented.

□ Data version is represented.

□ Expiration is defined.

□ Invalidation is defined.

□ Encryption is applied where required.
```

---

# Cache Access Isolation

A cache lookup must never return data outside the authenticated Owner scope.

---

# Cache Invalidation Strategy

Potential strategies include:

```text
Event-driven invalidation

Versioned cache key

Time-based expiration

Manual invalidation

Full partition invalidation
```

Multiple strategies may be combined.

---

# Cache Stampede Protection

Report cache rebuilding should prevent uncontrolled concurrent regeneration.

Protection must preserve:

- Owner isolation.
- Correct data version.
- Correct policy version.
- Freshness status.
- Failure recovery.

---

# Stale-While-Revalidate

Stale-while-revalidate may be used only when:

- The Report type permits stale display.
- Stale state is visible.
- The previous value belongs to the same Owner and scope.
- No material mutation depends on the stale Report.
- The background refresh is monitored.

---

# Dashboard Composition Governance

Every Dashboard composition should be registered.

---

# Dashboard Composition Record

Recommended fields:

```text
dashboardCompositionId

name

platformScopes

applicationVersionRange

defaultAccountScope

defaultPeriod

componentIds

componentOrder

dependencyRules

freshnessRules

errorIsolationRules

accessibilityRequirements

owner

version

status
```

---

# Dashboard Component Registry

Each Dashboard component should define:

```text
componentId

componentType

sourceReportType

requiredScope

requiredCurrency

freshnessPolicy

emptyState

errorState

drillDownTarget

platformSupport

accessibilityModel

owner
```

---

# Dashboard Component Types

Recommended:

```text
BalanceCard

IncomeCard

ExpenseCard

NetCashFlowCard

ComparisonCard

RecentTransactionList

BudgetCard

GoalCard

ProjectionCard

InsightCard

NotificationCard

ChartComponent
```

---

# Dashboard Component Consistency

Components displayed together should use compatible:

- Owner scope.
- Account scope.
- Currency.
- Period.
- Data version.
- Policy version.
- Freshness state.

---

# Mixed Dashboard State

When components cannot share one data boundary, the interface must not imply that they form one exact snapshot without disclosure.

---

# Dashboard Critical Component

A Dashboard may identify critical components such as:

- Current Balance.
- Account availability.
- Security status.

Failure of a critical component may require a stronger Dashboard warning.

---

# Dashboard Optional Component

An optional Insight or chart may fail independently without hiding valid core financial values.

---

# Dashboard Component Retirement

Retiring a component requires:

- Removal from active compositions.
- Removal of unused queries.
- Removal of unused caches.
- Update to caches.
- Update to saved personalizations.
- Historical documentation.
- Analytics update.

---

# Visualization Governance Architecture

Every material visualization type must exist in the Visualization Registry.

---

# Visualization Registry Record

Recommended fields:

```text
visualizationTypeId

visualizationKey

name

purpose

supportedValueTypes

supportedCurrencyBehavior

supportsNegativeValues

supportsMissingValues

supportsProjectedValues

supportsPartialValues

maximumSeries

maximumCategories

axisRules

colorRules

patternRules

accessibilityRequirements

exportSupport

owner

status

version
```

---

# Visualization Activation Requirements

```text
□ Analytical purpose is defined.

□ Supported data types are defined.

□ Negative-value behavior is defined.

□ Missing-value behavior is defined.

□ Partial-data behavior is defined.

□ Projection behavior is defined.

□ Axis behavior is defined.

□ Color behavior is defined.

□ Theme behavior is defined.

□ Keyboard behavior is defined.

□ Screen-reader alternative exists.

□ Responsive behavior is tested.

□ Export behavior is tested.
```

---

# Visualization Transformation Governance

A Visualization transformation may:

- Group values.
- Reorder values.
- Abbreviate labels.
- Select Top-N.
- Produce `Other`.
- Generate display percentages.

It must not:

- Change canonical totals.
- Drop values without disclosure.
- Combine incompatible currencies.
- Treat missing as zero.
- Alter Transaction-state inclusion.
- Invent intermediate values.

---

# Visualization Transformation Record

Recommended fields:

```text
visualizationTransformationId

sourceReportId

transformationType

grouping

sorting

topN

otherBehavior

displayPrecision

outputDatasetId

policyVersion

createdAt
```

---

# Chart Style Governance

Chart style standards should define:

- Typography.
- Axis label size.
- Gridline behavior.
- Marker size.
- Line thickness.
- Focus state.
- Selected state.
- Theme adaptation.
- Color contrast.
- Pattern alternatives.

---

# Color Semantic Registry

If colors have semantic meaning, that meaning must be registered.

Examples may include:

```text
Income

Expense

Warning

Critical

Projected

Reconciled

Pending
```

Text and shape alternatives remain required.

---

# Visualization Review

Visualization reviews should verify:

- Exact-value preservation.
- Honest scale.
- Missing-data behavior.
- Currency.
- Projection distinction.
- Theme support.
- Responsive behavior.
- Accessibility.
- Drill-down consistency.

---

# Report Query Governance

Report queries are privileged data operations.

---

# Query Requirements

Every Report query should define:

```text
Report type

Canonical Owner

Account scope

Date range

Currency

Filters

Sorting

Pagination

Policy versions

Authorization context
```

---

# Query Authorization Order

Recommended sequence:

```text
Authenticate Actor

↓

Resolve canonical Owner

↓

Authorize Report type

↓

Validate Account ownership

↓

Validate field access

↓

Validate filters and range

↓

Execute Owner-scoped query

↓

Generate Report
```

---

# Owner Filtering

Owner filtering must occur inside the authoritative query boundary.

Retrieving broad data and filtering by Owner afterward is prohibited.

---

# Query Complexity Governance

Each Report type should define:

- Maximum date range.
- Maximum Account count.
- Maximum Category count.
- Maximum groups.
- Maximum page size.
- Maximum Export size.
- Timeout.
- Concurrency limit.
- Rate limit.

---

# Expensive Report

A large or computationally expensive Report may use a Background Job.

The job must preserve:

- Owner scope.
- Report request.
- Policy versions.
- Data boundary.
- Progress.
- Final state.
- Expiration.
- Audit Evidence.

---

# Report Job States

Recommended:

```text
Queued

Preparing

Calculating

Rendering

Completed

PartiallyCompleted

Failed

Cancelled

Expired
```

---

# Report Job Retry

A Retry must preserve stable operation identity and must not create duplicate final Exports.

---

# Filter Governance

Every supported filter should exist in a Filter Registry.

---

# Filter Registry Record

Recommended fields:

```text
filterTypeId

filterKey

name

reportTypes

valueType

allowedOperators

ownerScopeRequired

accountScopeRequired

currencyRequired

maximumValues

securityClassification

owner

version

status
```

---

# Filter Operators

Recommended controlled operators include:

```text
Equals

NotEquals

In

NotIn

GreaterThan

GreaterThanOrEqual

LessThan

LessThanOrEqual

Between

Contains

StartsWith

IsNull

IsNotNull
```

---

# Filter Injection Protection

Filter values must be treated as data.

They must not become executable:

- SQL.
- Search syntax.
- Template code.
- Spreadsheet formulas.
- AI instructions.
- Script content.

---

# Saved Filter Governance

Saved filters must be:

- Owner-scoped.
- Report-type-scoped.
- Versioned.
- Validated.
- Revocable.
- Migratable.
- Deletable according to policy.

---

# Saved Default Filter

A default saved filter must not prevent the Owner from understanding that a nonstandard scope is active.

---

# Sorting Governance

Sort fields and directions must be controlled.

Arbitrary database column names must not be accepted from clients.

---

# Pagination Governance

Pagination must preserve:

- Stable sort.
- Owner scope.
- Filter scope.
- Snapshot or data boundary.
- Cursor integrity.
- Expiration.
- Page-size limits.

---

# Comparison Governance

Every material comparison type should exist in the Comparison Registry.

---

# Comparison Registry Record

Recommended fields:

```text
comparisonTypeId

comparisonKey

name

supportedReportTypes

baselineRule

scopeCompatibilityRules

periodCompatibilityRules

currencyCompatibilityRules

policyCompatibilityRules

differenceFormula

percentageFormula

zeroBaselineBehavior

partialPeriodBehavior

owner

version

status
```

---

# Comparison Activation Requirements

```text
□ Current Report is defined.

□ Baseline Report is defined.

□ Scope compatibility is defined.

□ Period compatibility is defined.

□ Currency compatibility is defined.

□ Policy compatibility is defined.

□ Difference formula is defined.

□ Zero-baseline behavior is defined.

□ Negative-baseline behavior is defined.

□ Partial-period behavior is defined.

□ Accessible wording is defined.
```

---

# Comparison Misleading State

A comparison must be blocked or qualified when equivalence cannot be established.

---

# Comparison Policy Migration

Changing the comparison formula requires:

- New version.
- Historical comparison analysis.
- Dashboard review.
- Insight review.
- Notification review.
- Export review.
- Owner-facing wording review.

---

# Product Analytics Governance

Product Analytics must have explicit purpose and controlled collection.

---

# Analytics Governance Objectives

The Product Analytics program shall ensure:

```text
Every Event is registered.

Every property has a purpose.

Every metric is reproducible.

Every denominator is explicit.

Every consent requirement is enforced.

Every dataset has a defined population.

Every experiment exposure is valid.

Every small population is protected.

Every deprecated Event is retired safely.
```

---

# Analytics Event Activation Requirements

```text
□ Event purpose is defined.

□ Trigger is defined.

□ Required fields are defined.

□ Optional fields are defined.

□ Forbidden fields are defined.

□ Identity strategy is defined.

□ Consent requirement is defined.

□ Retention is defined.

□ Sampling is defined.

□ Environment behavior is defined.

□ Data-quality monitoring exists.

□ Privacy review is complete.
```

---

# Analytics Event Property Registry

Recommended fields:

```text
propertyId

propertyKey

eventTypes

valueType

allowedValues

purpose

classification

required

searchable

retentionClass

owner
```

---

# Analytics Property Minimization

An Analytics Event must not collect a value merely because it is available.

---

# Analytics Identity Governance

Identity strategies may include:

```text
Anonymous installation

Pseudonymous Owner

Pseudonymous Account

Session

Aggregated cohort
```

The minimum sufficient identity must be selected.

---

# Analytics Identity Rotation

Pseudonymous identifiers may require rotation according to Privacy policy.

Rotation must preserve only the continuity needed for the approved purpose.

---

# Analytics Sampling Governance

Sampling must define:

```text
Sampling rate

Sampling key

Environment

Event types

Population impact

Metric correction method

Review date
```

---

# Analytics Sampling Stability

Sampling should use a stable key where repeated inclusion consistency is needed.

---

# Analytics Metric Governance

Every material Product metric must exist in the Metric Registry.

---

# Metric Registry Record

Recommended fields:

```text
metricId

metricKey

name

description

metricType

purpose

eligiblePopulation

numerator

denominator

exclusions

aggregation

timeWindow

dimensions

sourceEvents

sourceDatasets

dataQualityRequirements

privacyClassification

owner

version

status

introducedAt

lastReviewed
```

---

# Metric Types

Recommended:

```text
Count

UniqueCount

Rate

Ratio

Percentage

Average

Median

Percentile

Duration

FunnelConversion

Retention

Adoption

ErrorRate
```

---

# Metric Activation Requirements

```text
□ Purpose is defined.

□ Eligible population is defined.

□ Numerator is defined.

□ Denominator is defined where applicable.

□ Exclusions are defined.

□ Time window is defined.

□ Identity boundary is defined.

□ Data sources are defined.

□ Data-quality requirements are defined.

□ Privacy classification is defined.

□ Test queries exist.

□ Owner is assigned.
```

---

# Metric Versioning

A Metric requires a new version when changing:

- Eligibility.
- Numerator.
- Denominator.
- Exclusions.
- Identity boundary.
- Time window.
- Source Events.
- Aggregation.
- Sampling correction.

---

# Metric Historical Comparability

Metrics from incompatible versions must not be compared as though they share identical meaning.

---

# Metric Certification

A Metric may be classified as:

```text
Draft

Experimental

Certified

Deprecated

Retired
```

Only Certified Metrics should support major Product or Business decisions without qualification.

---

# Analytics Funnel Governance

Every Funnel should define:

```text
Funnel ID

Purpose

Eligible population

Steps

Step order

Optional steps

Completion window

Identity boundary

Exclusions

Version

Owner
```

---

# Funnel Step Registry

Each step should reference a registered Analytics Event or verified backend state.

---

# Funnel Integrity

A Funnel must not improve artificially by:

- Removing failed attempts.
- Changing eligibility after observation.
- Ignoring missing Events.
- Counting repeated completion incorrectly.
- Mixing incompatible Event versions.

---

# Product Analytics Dashboard Governance

Analytics Dashboards should display:

- Metric version.
- Date range.
- Population.
- Data quality.
- Sampling.
- Consent scope.
- Last refresh.

---

# Analytics Small-Population Governance

Small groups may require:

- Suppression.
- Aggregation.
- Minimum thresholds.
- Broader time windows.
- Restricted access.

---

# Analytics Data Export

Product Analytics Exports require:

- Purpose.
- Dataset scope.
- Field minimization.
- Population protection.
- Authorization.
- Retention.
- Audit Evidence.

---

# Operational Analytics Governance

Operational Analytics must preserve the distinction between:

```text
Operational metric

Audit Evidence

Financial truth

Owner-facing Report
```

---

# Operational Metric Registry

Recommended fields:

```text
operationalMetricId

metricKey

service

purpose

unit

aggregation

dimensions

environmentScopes

alertingUse

retention

owner

version
```

---

# Operational Metric Cardinality

Metric dimensions must be bounded.

Unbounded dimensions such as raw Transaction IDs or complete descriptions should not be used in general metric labels.

---

# Operational Metric Privacy

Owner identifiers and private financial details should be excluded unless a narrowly approved diagnostic purpose exists.

---

# Insight Governance Architecture

Every material Insight type and Rule must be registered.

---

# Insight Type Registry

Recommended fields:

```text
insightTypeId

insightTypeKey

name

description

purpose

sourceReportTypes

supportedCurrencies

supportedScopes

confidenceModel

severityModel

allowedActions

notificationEligibility

expirationPolicy

owner

status

version
```

---

# Insight Rule Activation Requirements

```text
□ Insight purpose is defined.

□ Source Reports are defined.

□ Eligibility is defined.

□ Minimum data is defined.

□ Thresholds are defined.

□ Currency behavior is defined.

□ Comparison behavior is defined.

□ Confidence is defined.

□ Suppression is defined.

□ Deduplication is defined.

□ Expiration is defined.

□ Owner-facing wording is approved.

□ Security review is complete.

□ Privacy review is complete.

□ Accessibility review is complete.

□ Test vectors exist.
```

---

# Insight Rule Test Vector

Example:

```text
Insight:
Budget Exceeded

Budget Amount:
R$ 1.000,00

Consumed Amount:
R$ 1.150,00

Expected Insight:
Budget exceeded by R$ 150,00

Confidence:
Confirmed
```

---

# Insight Threshold Governance

Threshold changes require:

- New Rule version.
- Historical simulation.
- Notification-volume analysis.
- False-positive review.
- Currency review.
- Owner-experience review.
- Rollback.

---

# Insight Priority Governance

Multiple Insights may compete for limited interface space.

Priority may consider:

- Severity.
- Freshness.
- Confidence.
- Owner actionability.
- Duplication.
- Recent dismissal.
- Notification state.

Priority must not change the underlying Insight facts.

---

# Insight Suppression Governance

Suppression reasons should be controlled.

Recommended:

```text
INSUFFICIENT_DATA

STALE_SOURCE

PARTIAL_SOURCE

INCOMPATIBLE_COMPARISON

LOW_CONFIDENCE

DUPLICATE_INSIGHT

RECENTLY_DISMISSED

FEATURE_DISABLED

CONSENT_REQUIRED

SECURITY_RESTRICTION

PRIVACY_RESTRICTION
```

---

# Insight State Transition Matrix

Example:

| Current State | Target State | Allowed |
|---|---|---:|
| Generated | Eligible | Yes |
| Eligible | Displayed | Yes |
| Displayed | Dismissed | Yes |
| Displayed | ActedUpon | Yes |
| Displayed | Expired | Yes |
| Displayed | Invalidated | Yes |
| Dismissed | Displayed | Policy-dependent |
| Invalidated | Displayed | No |

---

# Insight Invalidity

An Insight becomes invalid when:

- Source Report is invalidated.
- Source calculation changes materially.
- Owner or Account scope changes.
- Currency changes.
- Policy version becomes unsupported.
- A correction alters the source values.
- AI validation fails.

---

# AI Insight Governance

AI-assisted Reporting requires heightened governance.

---

# AI Insight Registry

Recommended fields:

```text
aiInsightCapabilityId

name

purpose

sourceReportTypes

allowedInputFields

forbiddenInputFields

promptReference

modelReference

outputSchema

validationRules

humanConfirmationRequirements

privacyClassification

securityClassification

owner

version

status
```

---

# AI Prompt Governance

Prompts must be:

- Versioned.
- Access-controlled.
- Environment-scoped.
- Tested.
- Reviewed.
- Protected from client modification.
- Audited when changed.

---

# AI Model Governance

Model changes require:

- Quality evaluation.
- Financial-fact evaluation.
- Hallucination evaluation.
- Privacy review.
- Security review.
- Cost review.
- Latency review.
- Accessibility review.
- Rollback.

---

# AI Input Projection Governance

The AI input should contain only approved structured fields.

A summarized category dataset is preferred over complete Transaction histories when sufficient.

---

# AI Output Validation

Validation must verify:

```text
Output schema

Currency consistency

Amount consistency

Date consistency

Source references

Projection labeling

Confidence

Prohibited advice

Unsupported claims

Sensitive-data leakage
```

---

# AI Financial Fact Verification

Every AI-generated exact amount, date, percentage or financial comparison must match an approved structured source value.

---

# AI Unsupported Statement

An unsupported statement must be:

- Removed.
- Replaced with verified wording.
- Marked as uncertain where appropriate.
- Logged as a validation failure.
- Included in model-quality review.

---

# AI Human Confirmation

Human confirmation may be required before:

- Publishing administrative AI Reports.
- Sending high-impact AI-generated Notifications.
- Acting on AI-generated correction suggestions.
- Presenting sensitive conclusions.
- Exporting AI-generated investigation summaries.

---

# AI Insight Feedback Governance

Feedback may support quality improvement.

It must not expose unnecessary private financial content to external providers.

---

# Report-Derived Notification Governance

Every Report-derived Notification Rule should be registered.

---

# Notification Rule Record

Recommended fields:

```text
notificationRuleId

sourceReportType

sourceInsightType

eligibility

threshold

deduplicationWindow

cooldown

channelEligibility

privacyPreviewPolicy

expiration

owner

version

status
```

---

# Notification Rule Activation Requirements

```text
□ Source Report is verified.

□ Source Insight is valid where applicable.

□ Threshold is defined.

□ Currency behavior is defined.

□ Freshness requirement is defined.

□ Deduplication is defined.

□ Cooldown is defined.

□ Preview privacy is defined.

□ Deep link is defined.

□ Accessibility wording is approved.
```

---

# Notification Invalidation

A queued Notification should be cancelled or reevaluated when the source Report or Insight becomes invalid before delivery.

---

# Report Export Governance

Report Exports are sensitive derived artifacts.

---

# Export Approval Model

Ordinary Owner Exports may use Owner Authorization.

Administrative, Support, Audit or cross-Account Exports may require stronger approval.

---

# Export Requirements

```text
□ Owner is identified.

□ Account scope is validated.

□ Report type is approved.

□ Period is bounded.

□ Currency is identified.

□ Filters are preserved.

□ Policy versions are preserved.

□ Data version is preserved.

□ Summary and detail reconcile.

□ Content hash exists.

□ Download is authorized.

□ Expiration is defined.

□ Access is audited where required.
```

---

# Export Format Registry

Every supported Export format should define:

```text
formatId

name

mimeType

encoding

decimalFormat

dateFormat

currencyFormat

formulaInjectionProtection

accessibilitySupport

maximumSize

owner

version
```

---

# Export Compatibility

Historical Export schemas should remain interpretable.

Breaking changes require a new Export schema version.

---

# Export Regeneration

Regeneration should define whether it uses:

```text
Original Report Snapshot

or

Current source data
```

The interface must identify the selected behavior.

---

# Original-Snapshot Regeneration

Produces the same historical Report context where possible.

---

# Current-Data Regeneration

Produces a new Report from current canonical state.

It must receive a new Report and Export identity.

---

# Reporting Privacy Governance

Reporting Privacy must address:

- Owner financial data.
- Account identifiers.
- Transaction descriptions.
- Analytics identity.
- Insight content.
- AI context.
- Exports.
- Notifications.
- Support views.
- Shared Reports.

---

# Report Field Classification

Every Report field should define:

```text
fieldName

classification

purpose

ownerVisible

supportVisible

analyticsVisible

AIVisible

exportable

shareable

retentionClass
```

---

# Financial Description Minimization

Transaction descriptions should not be included in summary Reports, Analytics or AI inputs unless necessary.

---

# Report Sharing Governance

Shared Report capability requires:

- Explicit recipient.
- Explicit scope.
- Expiration.
- Revocation.
- Field minimization.
- Download policy.
- Access Evidence.
- No inherited authority from copied URLs.

---

# Report Link Governance

Links must not contain:

- Download tokens in logs.
- Exact financial values.
- Complete filter payloads when sensitive.
- Another Owner's identifiers.
- Secret references.

---

# Privacy Request Reporting

Privacy Exports and access Reports must use separately approved policies.

They must not be limited by ordinary Product Analytics opt-out.

---

# Analytics Consent Governance

Analytics consent must remain independent from:

- Authentication.
- Feature availability.
- Security logging.
- Financial reporting.
- Required operational telemetry.

---

# AI Provider Disclosure

When AI providers process Owner information, applicable disclosure and consent requirements must be satisfied.

---

# Reporting Security Governance

Reporting Security must prevent unauthorized access, manipulation and resource abuse.

---

# Reporting Access Roles

Potential Roles include:

```text
REPORT_VIEW_SELF

REPORT_EXPORT_SELF

REPORT_SUPPORT_SAFE

REPORT_FINANCIAL_INVESTIGATOR

REPORT_PRIVACY_REVIEWER

REPORT_SECURITY_REVIEWER

REPORT_ANALYTICS_VIEWER

REPORT_ANALYTICS_ADMIN

REPORT_AUDIT_REVIEWER
```

---

# Owner Report Access

Owners may access Reports for their own authorized Accounts and Resources.

---

# Support Report Access

Support access must be:

- Case-scoped.
- Time-bounded.
- Field-limited.
- Audited.
- Revocable.

---

# Analytics Viewer Access

Analytics access must be limited to approved datasets and populations.

It does not grant access to raw Owner financial histories.

---

# Report Export Access

Export authority must be separate from ordinary Report view authority when risk requires it.

---

# Broad Reporting Access

Broad cross-Owner reporting requires exceptional authority and must use aggregated or minimized datasets where possible.

---

# Query Security Tests

Tests must verify:

- Owner filter cannot be removed.
- Account IDs are validated.
- Date ranges are bounded.
- Sort fields are controlled.
- Filter operators are controlled.
- Cursor tampering fails.
- Export tokens cannot be reused improperly.
- Report IDs cannot be enumerated.
- Cache keys preserve scope.

---

# AI Prompt Injection Governance

Untrusted Report content must be isolated from system instructions.

Potential untrusted fields include:

- Transaction description.
- Imported memo.
- Category name.
- Owner note.
- Provider description.
- Support-provided text.

---

# Prompt Injection Response

AI output must be rejected when untrusted content attempts to:

- Override system rules.
- Request secret data.
- Request another Owner's data.
- Alter financial values.
- Bypass output schema.
- Produce unsafe advice.

---

# Reporting Accessibility Governance

Accessibility requirements apply to every supported Report and Dashboard.

---

# Accessibility Standards

Every Report should provide:

```text
Logical heading hierarchy

Programmatic labels

Keyboard access

Visible focus

Screen-reader status

Text scaling

High contrast

Color-independent meaning

Accessible charts

Accessible tables

Reduced-motion support

Accessible errors
```

---

# Accessibility Review Gate

A material Report or chart must not reach General Availability when:

- Exact values are clipped.
- Charts lack alternatives.
- Filters are not keyboard accessible.
- Status depends only on color.
- Dynamic updates are not announced.
- Theme contrast fails.
- Comparison direction is inaccessible.
- Tables cannot be navigated.

---

# Accessible Export Governance

Where supported, PDF and spreadsheet Reports should preserve:

- Headings.
- Table structure.
- Reading order.
- Alternative chart explanations.
- Page titles.
- Language metadata.
- Exact values.

---

# Reporting Support Governance

Support must understand Reporting semantics.

---

# Support Training Objectives

Support Agents must distinguish:

```text
Current Balance

Available Balance

Pending Balance

Projected Balance

Posted Transaction

Reconciled Transaction

Filtered Report

Partial Report

Stale Report

Failed Report

AI Insight
```

---

# Support Restrictions

Support must not:

- Alter Report totals.
- Modify cached values.
- Change financial policy.
- Mark a failed Report as verified.
- Change an AI Insight into a canonical fact.
- Generate cross-Owner Exports.
- Create unexplained corrections.
- Bypass Report Authorization.

---

# Support Scenario — Stale Dashboard

Expected behavior:

- Confirm data-as-of time.
- Confirm refresh state.
- Confirm recent financial mutations.
- Request approved recalculation.
- Avoid presenting stale value as current.
- Escalate persistent invalidation failure.

---

# Support Scenario — Export Does Not Match Screen

Expected behavior:

```text
Confirm Report type.

Confirm Account scope.

Confirm period.

Confirm filters.

Confirm currency.

Confirm Report Snapshot.

Confirm Export generation time.

Confirm policy and data versions.

Escalate equivalent-scope mismatches.
```

---

# Support Scenario — Another Owner's Data Appears

This is Critical.

Required behavior:

- Stop further navigation.
- Preserve safe screen and version details.
- Do not request another Owner's identity.
- Escalate immediately.
- Avoid creating additional Exports or screenshots.
- Follow Security and Privacy Incident procedures.

---

# Reporting Observability Governance

Observability must detect:

```text
Incorrect results

Missing results

Stale results

Partial results

Cross-Owner results

Cache defects

Snapshot defects

Visualization mismatch

Export mismatch

Analytics-quality defects

Insight defects

AI validation defects

Accessibility defects
```

---

# Reporting Monitoring Categories

Recommended:

```text
Report Generation

Calculation Integration

Scope Validation

Freshness

Snapshot Integrity

Cache Integrity

Visualization

Tables

Comparisons

Exports

Analytics

Insights

AI

Notifications

Accessibility
```

---

# Report Generation Monitoring

Track:

```text
Requests

Successes

Failures

Partial results

Stale results

Verification failures

Timeouts

Cancellations
```

---

# Report Scope Monitoring

Track:

```text
Owner-scope validation failures

Account-scope validation failures

Unsupported currency combinations

Invalid period requests

Invalid filters

Invalid pagination cursors
```

---

# Dashboard Consistency Monitoring

Track:

```text
Mixed Owner scope

Mixed Account scope

Mixed period

Mixed currency

Mixed policy versions

Mixed financial-data versions

Component freshness differences
```

---

# Visualization Monitoring

Track:

```text
Dataset mismatch

Rendering failure

Missing axis unit

Missing currency

Missing accessible equivalent

Projection-label failure

Theme contrast failure
```

---

# Export Monitoring

Track:

```text
Generation failure

Summary-detail mismatch

Unauthorized download

Expired-token use

Content-hash failure

Formula-injection prevention failure

Accessibility failure
```

---

# Analytics Monitoring

Track:

```text
Event rejection

Forbidden fields

Consent violations

Duplicate Events

Missing expected Events

Schema-version drift

Sampling drift

Dataset delay

Metric inconsistency
```

---

# Insight Monitoring

Track:

```text
Rule-evaluation failures

Invalid source Reports

Duplicate Insights

Expired Insights displayed

Incorrect thresholds

Low-confidence exposure

Invalid actions

Notification duplication
```

---

# AI Monitoring

Track:

```text
Structured-output failure

Financial-fact mismatch

Currency mismatch

Date mismatch

Hallucination

Unsafe advice

Sensitive-data leakage

Prompt injection

Expired source use
```

---

# Reporting SLO Architecture

Potential SLO categories include:

```text
Report correctness

Report availability

Report latency

Report freshness

Dashboard consistency

Snapshot verification

Cache invalidation

Visualization accessibility

Export correctness

Analytics quality

Insight correctness

AI fact validation
```

---

# Report Correctness SLO

Target:

```text
Every verified Report matches the authoritative Calculation Engine and approved aggregation policy for the same scope and data version.
```

---

# Report Availability SLO

Potential objective:

```text
Supported Report requests reach a valid final state within the approved availability target.
```

---

# Report Freshness SLO

Potential objective:

```text
Accepted financial mutations become visible in current Reports within the approved freshness window.
```

---

# Dashboard Consistency SLO

Target:

```text
Zero Dashboard compositions presenting incompatible Owner or currency scopes as one unified financial state.
```

---

# Snapshot Verification SLO

Potential objective:

```text
Material Report Snapshots complete integrity verification within the approved period.
```

---

# Cache Invalidation SLO

Potential objective:

```text
Affected Report caches are invalidated or marked stale within the approved window after material financial Events.
```

---

# Visualization Accessibility SLO

Target:

```text
Every material chart has an accurate accessible equivalent.
```

---

# Analytics Quality SLO

Potential objectives include:

```text
Registered Event acceptance

Schema validity

Consent compliance

Duplicate control

Dataset freshness
```

---

# Insight Correctness SLO

Target:

```text
Every displayed deterministic Insight matches its verified source Reports and registered Rule.
```

---

# AI Fact Validation SLO

Target:

```text
Zero unvalidated AI-generated financial facts displayed as verified facts.
```

---

# Zero-Tolerance Reporting Failures

Targets must be zero for:

```text
Cross-Owner Report result

Cross-Owner cache reuse

Cross-Owner Snapshot access

Cross-Owner Export access

Unapproved financial formula in a Report

Incompatible currency aggregation

Unavailable value displayed as zero

Projected value displayed as Posted

Report marked verified after integrity failure

AI-invented financial amount displayed as fact

Analytics consent violation

Financial meaning communicated only through color
```

---

# Reporting Error Budgets

Error budgets may apply to:

- Optional chart latency.
- Noncritical Analytics delay.
- Optional Insight generation delay.
- Background Export delay.
- Noncritical Dashboard component delay.

They must not normalize:

```text
Incorrect financial values

Owner-isolation failure

Currency inconsistency

Stale values presented as current

Misleading visualization

Export mismatch

AI hallucinated financial facts

Missing Accessibility
```

---

# Reporting Incident Architecture

Reporting Incidents may include:

```text
Incorrect Report total

Cross-Owner Report exposure

Dashboard scope inconsistency

Stale Report presented as current

Report Snapshot corruption

Cache contamination

Visualization distortion

Export mismatch

Analytics consent failure

Metric-definition defect

Insight-rule defect

AI hallucination

Notification based on invalid Report

Accessibility failure
```

---

# Reporting Incident Severity Factors

Evaluate:

```text
Number of Owners

Financial sensitivity

Amount represented

Duration

Export or download

Cross-Owner scope

Notification distribution

AI involvement

Privacy impact

Security impact

Accessibility impact

Decision impact

Recoverability
```

---

# Reporting Incident Response Sequence

```text
Detect

↓

Stop affected Report, Export, Insight or Notification

↓

Preserve source data and Report metadata

↓

Identify Owner and Account scope

↓

Identify policy and data versions

↓

Verify Calculation Engine results

↓

Invalidate caches and Snapshots

↓

Correct Report or visualization logic

↓

Regenerate affected artifacts

↓

Verify Accessibility and Owner isolation

↓

Communicate verified impact

↓

Review root cause
```

---

# Incorrect Report Total Incident

Required response:

- Preserve Report and source references.
- Identify scope, filters and policies.
- Recalculate independently.
- Compare summary and detail.
- Check cache and Snapshot.
- Check currency.
- Check Transaction-state inclusion.
- Correct the Reporting layer.
- Invalidate dependent Insights and Exports.

---

# Cross-Owner Report Incident

This is Critical.

Required response:

```text
Stop affected query path.

Invalidate affected caches and Snapshots.

Revoke active Report and Export access where necessary.

Identify Owners and Accounts affected.

Identify viewed, exported or shared data.

Preserve query and access Evidence.

Correct Owner scoping.

Execute cross-Owner regression tests.

Notify Security and Privacy.
```

---

# Dashboard Scope Incident

Examples include:

- Balance from all Accounts with expenses from one Account.
- BRL Balance with USD Expense chart.
- Current period card with previous-period chart.
- New Owner Balance with previous Owner Transactions.

Required response:

- Stop composite presentation.
- Identify affected components.
- Invalidate Dashboard cache.
- Correct scope propagation.
- Add composition-consistency tests.

---

# Stale Report Incident

Required response:

- Identify failed invalidation.
- Mark affected Reports stale.
- Regenerate.
- Review cache Events.
- Review Background Jobs.
- Identify decisions or Notifications based on stale data.

---

# Snapshot Corruption Incident

Required response:

- Preserve corrupted Snapshot.
- Verify source Reports and canonical data.
- Recalculate.
- Compare content hash.
- Replace through a new Snapshot.
- Preserve correction Evidence.

---

# Cache Contamination Incident

Potential causes include:

- Missing Owner key.
- Missing Account scope.
- Missing filter hash.
- Owner-switch failure.
- Incorrect shared cache partition.

Required response:

- Disable affected cache.
- Clear affected partitions.
- Preserve key metadata.
- Correct cache design.
- Review exposure scope.
- Execute isolation tests.

---

# Visualization Distortion Incident

Examples include:

- Wrong axis.
- Missing negative sign.
- Hidden missing data.
- Incorrect series mapping.
- Wrong currency label.
- Projection shown as actual.

Required response:

- Remove or disable affected visualization.
- Preserve source Dataset.
- Provide a correct table alternative.
- Correct rendering.
- Review similar chart types.

---

# Export Mismatch Incident

Required response:

- Revoke affected download links.
- Preserve Export and content hash.
- Compare detail and summary.
- Identify source Snapshot.
- Regenerate correctly.
- Notify affected Owners where required.

---

# Analytics Consent Incident

Required response:

- Stop affected collection.
- Identify Event types.
- Identify affected population.
- Remove or restrict affected data where required.
- Correct consent evaluation.
- Review provider delivery.
- Notify Privacy and Security.

---

# Metric Definition Incident

Examples:

- Wrong denominator.
- Wrong eligibility.
- Mixed Event versions.
- Sampling not reflected.
- Incompatible periods compared.

Required response:

- Mark Metric uncertified.
- Stop dependent decisions where necessary.
- Preserve prior results.
- Correct Metric version.
- Recalculate.
- Communicate limitations.

---

# Insight Rule Incident

Examples:

- Wrong threshold.
- Wrong currency.
- Duplicate Insight flood.
- Stale source.
- Invalid comparison.

Required response:

- Disable affected Rule.
- Invalidate active Insights.
- Stop queued Notifications.
- Correct Rule version.
- Regenerate only after verification.

---

# AI Hallucination Incident

Examples:

- Invented Transaction.
- Invented amount.
- Invented date.
- Wrong currency.
- Unsupported advice.
- Another Owner's data.

Required response:

```text
Stop affected AI capability.

Preserve prompt, model and source Report references.

Remove invalid output.

Identify exposed Owners.

Review structured-output validation.

Review prompt-injection protections.

Correct the capability before reactivation.
```

---

# Accessibility Incident

Examples:

- Chart inaccessible.
- Financial meaning depends only on color.
- Exact amounts clipped.
- Filter unusable by keyboard.
- Dynamic state not announced.

Required response:

- Provide an accessible alternative.
- Disable inaccessible interaction where necessary.
- Correct the component.
- Test across supported platforms.
- Review related components.

---

# Reporting Incident Record

Recommended fields:

```text
incidentId

category

severity

ownerScope

accountScope

reportScope

exportScope

analyticsScope

insightScope

aiScope

policyVersions

dataVersions

detectedAt

containment

correction

regeneration

securityImpact

privacyImpact

accessibilityImpact

rootCause

verification

closedAt
```

---

# Reporting Testing Architecture

Reporting behavior requires shared automated and manual verification.

Recommended test categories include:

```text
Report Scope

Owner Isolation

Account Isolation

Period Boundaries

Time Zones

Currencies

Filters

Sorting

Pagination

Freshness

Snapshots

Caches

Dashboards

Visualizations

Tables

Comparisons

Exports

Analytics

Metrics

Funnels

Insights

AI

Notifications

Accessibility

Performance

Migration
```

---

# Report Scope Tests

Verify:

- All Accounts.
- Selected Accounts.
- Single Account.
- Archived Account behavior.
- Closed Account behavior.
- Category scope.
- Empty scope.
- Unsupported scope.

---

# Owner-Isolation Tests

Verify:

- Another Owner's Report cannot be requested.
- Another Owner's Account cannot be selected.
- Another Owner's Snapshot cannot be read.
- Another Owner's cache cannot be reused.
- Another Owner's Export cannot be downloaded.
- Another Owner's Insight cannot be returned.
- Another Owner's Analytics profile cannot be accessed.

---

# Period Tests

Verify:

- Current day.
- Current week.
- Current month.
- Previous month.
- Quarter.
- Year.
- Custom period.
- All Time.
- Leap year.
- Month boundary.
- Daylight-saving transition where applicable.

---

# Time-Zone Tests

Verify equivalent UTC Events across different reporting time zones.

---

# Currency Tests

Verify:

- BRL-only Report.
- Different Account currencies.
- Multi-currency separated Report.
- Approved conversion.
- Missing rate.
- Expired rate.
- Wrong currency label.
- Currency mismatch rejection.

---

# Filter Tests

Verify:

- Account.
- Category.
- State.
- Amount.
- Date.
- Search.
- Combined filters.
- Invalid operator.
- Unauthorized identifier.
- Empty result.
- Reset.
- Saved filter.

---

# Sorting Tests

Verify stable ordering with equal values and concurrent changes.

---

# Pagination Tests

Verify:

- Stable cursor.
- Cursor expiration.
- Cursor tampering.
- Data-version change.
- No duplicate rows.
- No missing rows.
- Correct total count.
- Owner switching.

---

# Freshness Tests

Verify:

- Current.
- NearCurrent.
- Stale.
- Expired.
- Recalculating.
- Invalidated.
- Refresh.
- Failed invalidation.

---

# Snapshot Tests

Verify:

- Creation.
- Integrity.
- Supersession.
- Invalidation.
- Historical access.
- Destruction.
- Owner isolation.

---

# Cache Tests

Verify:

- Owner key.
- Account key.
- Period key.
- Currency key.
- Filter key.
- Policy key.
- Data-version key.
- Invalidation.
- Stale-while-revalidate.
- Cache stampede.
- Owner switching.

---

# Dashboard Tests

Verify:

- Default scope.
- Account selector.
- Period selector.
- Mixed component failure.
- Freshness differences.
- Owner switching.
- Responsive layout.
- Foldable layout.
- Light theme.
- Dark theme.
- Personalization.
- Empty states.

---

# Visualization Tests

Verify:

- Exact values.
- Axis labels.
- Currency.
- Negative values.
- Missing values.
- Partial periods.
- Projection.
- Pending state.
- Reconciled state.
- Stale state.
- Theme contrast.
- Keyboard access.
- Accessible table.
- Drill-down equality.

---

# Table Tests

Verify:

- Column labels.
- Monetary precision.
- Date semantics.
- Status text.
- Pagination.
- Sorting.
- Group totals.
- Visible-page total.
- Full-result total.
- Virtualization.
- Keyboard navigation.

---

# Comparison Tests

Verify:

- Previous period.
- Year over year.
- Zero baseline.
- Negative baseline.
- Partial period.
- Currency mismatch.
- Scope mismatch.
- Policy mismatch.
- Missing baseline.
- Leap year.

---

# Export Tests

Verify:

- PDF.
- CSV.
- JSON.
- Spreadsheet.
- Image.
- Content hash.
- Summary-detail equality.
- Expiration.
- Authorization.
- Formula-injection protection.
- Accessibility metadata.

---

# Analytics Event Tests

Verify:

- Registered Event.
- Required fields.
- Forbidden fields.
- Consent.
- Environment.
- Version.
- Duplicate delivery.
- Offline queue.
- Owner switching.
- Opt-out.

---

# Metric Tests

Verify:

- Eligibility.
- Numerator.
- Denominator.
- Exclusions.
- Identity boundary.
- Time window.
- Sampling.
- Data quality.
- Version compatibility.

---

# Funnel Tests

Verify:

- Step ordering.
- Optional steps.
- Repeated steps.
- Session boundaries.
- Completion window.
- Missing Event.
- Duplicate Event.
- Eligibility.

---

# Insight Rule Tests

Verify:

- Eligibility.
- Threshold.
- Currency.
- Baseline.
- Minimum data.
- Confidence.
- Suppression.
- Deduplication.
- Expiration.
- Invalidation.
- Action link.
- Notification behavior.

---

# AI Insight Tests

Verify:

- Output schema.
- Exact amount validation.
- Percentage validation.
- Date validation.
- Currency validation.
- Projection labeling.
- Another Owner's data rejection.
- Prompt injection.
- Unsupported advice.
- Expired source.
- Hallucinated Transaction.
- Sensitive-data leakage.

---

# Notification Tests

Verify:

- Source validity.
- Freshness.
- Deduplication.
- Cooldown.
- Deep link.
- Owner scope.
- Lock-screen Privacy.
- Cancellation after invalidation.

---

# Accessibility Tests

Verify:

- Heading order.
- Keyboard filters.
- Focus management.
- Screen-reader announcements.
- Text scaling.
- Chart alternatives.
- Table navigation.
- Color independence.
- Reduced motion.
- Theme contrast.
- Export accessibility.

---

# Reporting Property-Based Tests

Potential invariants include:

```text
A Report never contains another Owner's Resource.

A Chart total equals its source Report total.

A filtered detail sum equals the filtered summary under the same policy.

A Report Export summary equals exported detail aggregation.

A zero-data Report remains distinct from a failed Report.

A projected value is never labeled as Posted.

A Report cache key changes when Owner, Account, period, currency, filters, policy or data version changes.

An AI exact financial fact equals a structured source value.
```

---

# Reporting Mutation Tests

Mutation testing should verify that tests fail when:

- Owner filter is removed.
- Currency label changes.
- Negative sign is removed.
- Missing data becomes zero.
- Cache Owner key is removed.
- Comparison denominator changes.
- Projection label is removed.
- Export summary uses another scope.
- AI fact validation is bypassed.

---

# Reporting Performance Tests

Performance testing should cover:

- Large Transaction history.
- Many Accounts.
- Long custom periods.
- Many categories.
- Concurrent Dashboard requests.
- Large Exports.
- Large Product Analytics datasets.
- Insight-generation batches.
- Cache cold starts.
- Snapshot rebuild.

Performance improvements must not weaken correctness, Privacy or Accessibility.

---

# Reporting Migration Architecture

Reporting migrations may affect:

```text
Report schemas

Reporting policies

Dashboard compositions

Chart datasets

Visualization types

Filter schemas

Comparison formulas

Snapshot formats

Cache keys

Export schemas

Analytics Event schemas

Metric definitions

Insight Rules

AI prompts

AI models
```

---

# Reporting Migration Principles

Every Reporting migration must:

- Preserve Report meaning.
- Preserve Owner scope.
- Preserve Account scope.
- Preserve currencies.
- Preserve periods.
- Preserve policy versions.
- Preserve historical Snapshots where required.
- Preserve Export interpretability.
- Preserve Analytics Event meaning.
- Preserve Insight provenance.
- Be idempotent.
- Be verifiable.
- Support rollback or forward correction.

---

# Report Schema Migration

Recommended sequence:

```text
Register new schema version.

↓

Deploy compatible readers.

↓

Deploy new writer.

↓

Verify Reports.

↓

Verify Exports.

↓

Verify Android and Web.

↓

Retire old writer.

↓

Preserve historical reader.
```

---

# Dashboard Composition Migration

A composition migration must preserve:

- Owner personalizations.
- Supported components.
- Responsive behavior.
- Default scope.
- Accessibility.
- Feature Flag behavior.

---

# Cache-Key Migration

A cache-key migration must prevent reuse of incompatible old entries.

Potential strategy:

```text
Introduce new key version.

↓

Stop writes to old key.

↓

Invalidate old partitions.

↓

Verify new key isolation.

↓

Retire old cache entries.
```

---

# Snapshot Migration

Snapshot migration must preserve:

- Snapshot identifier.
- Source Report.
- Owner.
- Scope.
- Period.
- Currency.
- Policy versions.
- Data version.
- Integrity metadata.

---

# Analytics Schema Migration

Analytics schema migration must preserve historical interpretation.

Events of different versions must remain distinguishable.

---

# Metric Migration

A Metric-definition change must create a new Metric version.

Historical results should identify the version used.

---

# Insight Rule Migration

Changing Rule thresholds or logic must:

- Create a new version.
- Invalidate incompatible pending Insights.
- Reevaluate queued Notifications.
- Preserve historical Insight provenance.
- Compare false-positive behavior.

---

# AI Prompt Migration

Prompt migration must preserve:

- Prompt version.
- Model version.
- Evaluation results.
- Rollback.
- Generated-output provenance.

---

# Reporting Migration Verification

Verify:

```text
No Report changed Owner scope.

No Account scope changed unexpectedly.

No currency changed unexpectedly.

No period boundary changed unexpectedly.

No Report total changed without approved policy reason.

No Snapshot became unverifiable.

No Export became uninterpretable.

No Analytics Event lost its version.

No Metric changed meaning silently.

No Insight lost its source references.

No Accessibility regression was introduced.
```

---

# Reporting Deprecation

A Report, Metric, Visualization or Insight Rule may be deprecated.

---

# Deprecation Requirements

```text
□ Replacement is defined.

□ New dependencies are blocked.

□ Active consumers are inventoried.

□ Historical data remains readable.

□ Export impact is reviewed.

□ Analytics impact is reviewed.

□ Support guidance is updated.

□ Retirement date is defined.
```

---

# Report Retirement

Retirement is complete only when:

- Active Product surfaces no longer generate the Report.
- APIs no longer create new instances.
- Background Jobs are removed.
- Caches are removed.
- Saved filters are migrated or retired.
- Exports use the replacement.
- Historical Reports remain interpretable.
- Documentation is updated.

---

# Metric Retirement

A retired Metric must remain historically identifiable.

Dashboards and decisions must move to an approved replacement.

---

# Insight Rule Retirement

Retirement should:

- Stop new Insight generation.
- Stop queued Notifications.
- Preserve historical Insights.
- Remove unused code.
- Remove obsolete thresholds.
- Update Support guidance.

---

# Analytics Event Retirement

Retired Analytics Events must:

- Stop new generation.
- Remain readable historically.
- Be removed from current Metric dependencies.
- Preserve retention behavior.
- Preserve schema documentation.

---

# Reporting Disaster Recovery

Reporting recovery must preserve:

- Report Type Registry.
- Reporting Policy Registry.
- Report schemas.
- Report Snapshots.
- Dashboard compositions.
- Visualization definitions.
- Export metadata.
- Analytics Event Registry.
- Metric Registry.
- Insight Rules.
- AI configuration.
- Audit Evidence.

---

# Recovery Priority

Recommended sequence:

```text
Canonical financial data and Calculation Engine

↓

Report definitions and policies

↓

Report generation

↓

Current Report Snapshots

↓

Dashboard composition

↓

Exports

↓

Product Analytics

↓

Insights

↓

Optional AI explanations
```

---

# Report Recovery Verification

Verify:

- Owner isolation.
- Account scope.
- Currency.
- Policy versions.
- Data versions.
- Snapshot hashes.
- Export links.
- Cache isolation.
- Accessibility.

---

# Reporting Release Certification

Every release affecting Reporting must declare:

```text
Report schema versions

Reporting policy versions

Dashboard composition versions

Visualization versions

Filter schema versions

Comparison policy versions

Export schema versions

Analytics Event versions

Metric versions

Insight Rule versions

AI prompt versions

AI model references

Migration state

Rollback artifact
```

---

# Reporting Release Gate

A release must not proceed when:

```text
Report totals differ from the Calculation Engine.

Owner-isolation tests fail.

Account-scope tests fail.

Currency behavior is undefined.

Report freshness is undefined.

Dashboard components use incompatible scopes.

Charts lack accessible equivalents.

Exports fail summary-detail equality.

Analytics consent validation fails.

Metrics lack numerator or denominator.

Insight Rules lack source Reports.

AI exact facts are not validated.

Rollback is unavailable.
```

---

# Post-Release Reporting Verification

Review:

```text
Report success rate

Report correctness

Dashboard consistency

Cache isolation

Snapshot integrity

Visualization failures

Export equality

Analytics quality

Insight validity

AI validation

Accessibility

Owner complaints

Support cases
```

---

# Definition of Ready

A Reporting capability is ready when:

```text
□ Purpose is defined.

□ Report or Metric identity exists.

□ Owner scope is defined.

□ Account scope is defined.

□ Period is defined.

□ Time zone is defined.

□ Currency behavior is defined.

□ Canonical source is defined.

□ Calculation reference is defined.

□ Reporting policy is defined.

□ Freshness is defined.

□ Empty and error states are defined.

□ Accessibility requirements are defined.

□ Monitoring is defined.

□ Test vectors exist.
```

---

# Definition of Implemented

A Reporting capability is implemented when:

```text
□ Registry record exists.

□ Schema exists.

□ Backend query exists.

□ Authorization exists.

□ Owner isolation exists.

□ Versioning exists.

□ Result states exist.

□ Monitoring hooks exist.
```

Implementation does not mean verified or releasable.

---

# Definition of Verified

A Reporting capability is verified when:

```text
□ Scope tests pass.

□ Owner-isolation tests pass.

□ Account-isolation tests pass.

□ Currency tests pass.

□ Period tests pass.

□ Filter tests pass.

□ Freshness tests pass.

□ Snapshot tests pass.

□ Cache tests pass.

□ Visualization tests pass.

□ Export tests pass.

□ Accessibility tests pass.
```

---

# Definition of Releasable

A Reporting capability is releasable when:

```text
□ Product approval is complete.

□ Reporting approval is complete.

□ Financial approval is complete where applicable.

□ Security review is complete.

□ Privacy review is complete.

□ Accessibility review is complete.

□ Monitoring is active.

□ Alerts exist.

□ Runbooks exist.

□ Support guidance exists.

□ Rollback is verified.
```

---

# Definition of Operationally Verified

A Reporting capability is operationally verified when:

```text
□ Production Reports match approved calculations.

□ Dashboard scopes remain consistent.

□ Caches remain Owner-isolated.

□ Snapshots verify.

□ Exports reconcile.

□ Analytics quality is acceptable.

□ Insights use valid sources.

□ AI facts validate.

□ No Critical Reporting alert exists.
```

---

# AI Governance

AI may assist with Reporting design, analysis and explanation.

AI must not become a Reporting authority.

---

# Allowed AI Uses

AI may assist with:

- Drafting Report definitions.
- Drafting chart descriptions.
- Drafting accessible chart summaries.
- Drafting Metric documentation.
- Detecting Report inconsistencies.
- Suggesting Insight Rules.
- Drafting test cases.
- Summarizing verified Reports.
- Identifying potential Analytics-quality issues.
- Drafting Incident reports.

---

# Forbidden AI Uses

AI must not:

- Create authoritative financial totals.
- Change Report scope.
- Add another Owner's data.
- Invent Metric denominators.
- Approve Metrics.
- Certify data quality.
- Alter financial policies.
- Mark Snapshots verified.
- Approve Report Exports.
- Invent Transactions or amounts.
- Present projections as Posted values.
- Bypass Accessibility requirements.
- Claim validation passed without executed tests.

---

# AI-Generated Report Design

AI-generated Report designs must be reviewed for:

- Canonical source.
- Scope.
- Currency.
- Period.
- Calculation reference.
- Freshness.
- Privacy.
- Security.
- Accessibility.
- Reproducibility.

---

# Final Reporting Checklists

---

# Report Definition Checklist

```text
□ Report Type ID exists.

□ Report key is stable.

□ Purpose is defined.

□ Owner scope is defined.

□ Account scope is defined.

□ Period is defined.

□ Time zone is defined.

□ Currency behavior is defined.

□ Canonical source is defined.

□ Calculation type is defined.

□ Calculation policy is defined.

□ Reporting policy is defined.

□ Included states are defined.

□ Excluded states are defined.

□ Filters are defined.

□ Freshness is defined.

□ Empty state is defined.

□ Partial state is defined.

□ Accessibility requirements exist.
```

---

# Report Request Checklist

```text
□ Actor is authenticated.

□ Canonical Owner is resolved.

□ Report type is authorized.

□ Account IDs belong to the Owner.

□ Date range is valid.

□ Time zone is valid.

□ Currency is supported.

□ Filters are validated.

□ Sort is validated.

□ Page size is bounded.

□ Policy versions are supported.

□ Query is Owner-scoped.
```

---

# Dashboard Checklist

```text
□ Dashboard ID exists.

□ Owner scope is consistent.

□ Account scope is consistent.

□ Currency is consistent.

□ Period is consistent.

□ Component policy versions are compatible.

□ Financial-data versions are compatible.

□ Critical component behavior is defined.

□ Empty states are specific.

□ Loading does not expose previous Owner data.

□ Responsive behavior is tested.

□ Dark theme is readable.

□ Accessibility passes.
```

---

# Visualization Checklist

```text
□ Chart type is appropriate.

□ Source Report exists.

□ Exact values are preserved.

□ Currency is visible.

□ Axis units are defined.

□ Baseline is honest.

□ Negative values are explicit.

□ Missing data is explicit.

□ Partial periods are explicit.

□ Projection is distinct.

□ Stale state is visible.

□ Theme support passes.

□ Accessible table exists.

□ Drill-down reconciles.
```

---

# Table Checklist

```text
□ Table ID exists.

□ Columns have stable IDs.

□ Monetary columns preserve exact values.

□ Date semantics are identified.

□ Status uses text.

□ Sort is stable.

□ Pagination is stable.

□ Totals identify scope.

□ Group totals reconcile.

□ Keyboard navigation works.

□ Screen-reader navigation works.
```

---

# Filter Checklist

```text
□ Filter type is registered.

□ Operators are controlled.

□ Values are typed.

□ Owner scope is validated.

□ Account scope is validated.

□ Currency is defined where required.

□ Maximum values are bounded.

□ Active state is visible.

□ Reset behavior is defined.

□ Saved filters remain Owner-scoped.
```

---

# Comparison Checklist

```text
□ Comparison ID exists.

□ Current Report exists.

□ Baseline Report exists.

□ Owner scopes match.

□ Account scopes are compatible.

□ Currencies are compatible.

□ Periods are compatible.

□ Policies are compatible.

□ Difference formula is defined.

□ Percentage formula is defined.

□ Zero-baseline behavior is defined.

□ Partial-period behavior is disclosed.
```

---

# Snapshot Checklist

```text
□ Snapshot ID exists.

□ Report ID exists.

□ Owner is identified.

□ Account scope is preserved.

□ Period is preserved.

□ Currency is preserved.

□ Policy versions are preserved.

□ Data version is preserved.

□ Content hash exists.

□ Integrity state exists.

□ Invalidation behavior exists.

□ Retention is defined.
```

---

# Cache Checklist

```text
□ Owner is in the cache key.

□ Account scope is in the cache key.

□ Period is in the cache key.

□ Currency is in the cache key.

□ Filters are in the cache key.

□ Policy versions are in the cache key.

□ Data version is in the cache key.

□ Expiration is defined.

□ Invalidation is defined.

□ Stale behavior is defined.

□ Owner switching is tested.
```

---

# Analytics Event Checklist

```text
□ Event ID exists.

□ Event key is stable.

□ Purpose is defined.

□ Trigger is defined.

□ Version exists.

□ Required fields are defined.

□ Optional fields are defined.

□ Forbidden fields are defined.

□ Identity is minimized.

□ Consent is defined.

□ Retention is defined.

□ Environment is defined.

□ Data-quality monitoring exists.
```

---

# Metric Checklist

```text
□ Metric ID exists.

□ Metric key is stable.

□ Purpose is defined.

□ Eligible population is defined.

□ Numerator is defined.

□ Denominator is defined where applicable.

□ Exclusions are defined.

□ Time window is defined.

□ Identity boundary is defined.

□ Source Events are defined.

□ Data-quality requirements are defined.

□ Version exists.

□ Owner is assigned.
```

---

# Insight Checklist

```text
□ Insight ID exists.

□ Insight type is registered.

□ Owner is identified.

□ Account scope is defined.

□ Source Reports exist.

□ Source calculations exist where applicable.

□ Currency is defined.

□ Eligibility is defined.

□ Threshold is defined.

□ Minimum data is defined.

□ Confidence is defined.

□ Suppression is defined.

□ Deduplication is defined.

□ Expiration is defined.

□ Action preserves scope.
```

---

# AI Insight Checklist

```text
□ AI capability is registered.

□ Source Reports are verified.

□ Allowed fields are defined.

□ Forbidden fields are defined.

□ Prompt version is known.

□ Model reference is known.

□ Output schema is defined.

□ Exact facts are validated.

□ Currency is validated.

□ Dates are validated.

□ Projection labeling is validated.

□ Unsupported advice is blocked.

□ Prompt injection is tested.

□ Source expiration is enforced.
```

---

# Export Checklist

```text
□ Export ID exists.

□ Source Report exists.

□ Source Snapshot exists where required.

□ Owner is identified.

□ Account scope is validated.

□ Period is preserved.

□ Currency is preserved.

□ Filters are preserved.

□ Policy versions are preserved.

□ Data version is preserved.

□ Summary and detail reconcile.

□ Content hash exists.

□ Download expires.

□ Authorization is revalidated.
```

---

# Incident Checklist

```text
□ Incident category is defined.

□ Severity is assigned.

□ Affected Report is preserved.

□ Source data is preserved.

□ Owner scope is identified.

□ Account scope is identified.

□ Policy versions are identified.

□ Data versions are identified.

□ Caches are invalidated.

□ Snapshots are invalidated where required.

□ Dependent Insights are invalidated.

□ Dependent Notifications are stopped.

□ Correction is verified.

□ Communication uses verified facts.
```

---

# Accessibility Checklist

```text
□ Page headings are logical.

□ Filters are keyboard accessible.

□ Focus order is predictable.

□ Dynamic states are announced.

□ Charts have textual equivalents.

□ Tables are navigable.

□ Exact amounts remain visible.

□ Negative values are explicit.

□ Status is not color-only.

□ Themes meet contrast requirements.

□ Reduced motion is respected.

□ Exports preserve accessible structure where supported.
```

---

# Final Acceptance Criteria

The Nexio Reporting, Analytics, Dashboards and Insights architecture is accepted only when:

1. Every material Report has a stable registered type.

2. Every material generated Report has a stable identifier where required.

3. Every Report has a stable semantic meaning.

4. Every Report identifies the canonical Owner.

5. Every Account-scoped Report validates Account ownership.

6. Every Report defines Account scope.

7. Every Report defines Resource scope.

8. Every Report defines Category scope where applicable.

9. Every Report defines its period.

10. Every Report defines its reporting time zone.

11. Every monetary Report defines currency.

12. Every Report identifies its calculation type.

13. Every Report identifies its calculation-policy version.

14. Every Report identifies its Reporting-policy version.

15. Every Report identifies its financial-data version where applicable.

16. Every Report identifies its schema version.

17. Every Report records generation time.

18. Every Report records data-as-of time where applicable.

19. Every Report has an explicit result state.

20. Loading remains distinct from Empty.

21. Empty remains distinct from Failed.

22. Empty remains distinct from Unavailable.

23. Filtered Empty remains distinguishable from no financial data.

24. Partial Reports are not presented as complete.

25. Stale Reports are not presented as current without disclosure.

26. Expired Reports are not presented as current.

27. Verification-Failed Reports are not presented as verified.

28. Report warnings use controlled codes.

29. Reports use canonical Resources.

30. Financial Reports use the authoritative Calculation Engine.

31. Dashboard cards do not define independent financial formulas.

32. Charts do not define independent financial formulas.

33. Support views do not define independent financial formulas.

34. AI does not define independent financial formulas.

35. Reports remain reproducible.

36. Report provenance is preserved.

37. Report lineage is preserved.

38. Report schemas are versioned.

39. Historical Report schemas remain readable.

40. Breaking schema changes have compatibility plans.

41. Reporting policies are registered.

42. Reporting policies have stable identifiers.

43. Reporting policies are versioned.

44. Historical Reporting policies remain interpretable.

45. Report labels retain stable meaning.

46. Changed semantic meaning creates a new policy or Report version.

47. Exact monetary values remain preserved.

48. Display formatting remains separate from canonical values.

49. Display abbreviations do not replace exact values.

50. Display rounding does not change Report totals.

51. Every Report period uses explicit boundaries.

52. Start-inclusive and end-exclusive behavior is supported.

53. All-Time Reports preserve an `asOf` boundary.

54. Custom periods validate start and end.

55. Reporting time zones are explicit.

56. Device time zone does not silently redefine backend reporting periods.

57. Historical effective dates are not rewritten by time-zone changes.

58. Single-currency Reports include compatible values only.

59. Converted Reports identify exchange-rate metadata.

60. Multi-currency Reports separate unsupported currencies.

61. Incompatible currencies are not aggregated silently.

62. Every Report request authenticates the Actor.

63. Every Report request resolves the canonical Owner.

64. Every Report request validates Authorization.

65. Every selected Account belongs to the Owner.

66. Owner filtering occurs inside the authoritative query boundary.

67. Broad retrieval followed by client Owner filtering is prohibited.

68. Report types are authorized independently.

69. Report fields are minimized according to purpose.

70. Report query ranges are bounded.

71. Report query complexity is bounded.

72. Report query concurrency is bounded.

73. Report query timeouts are defined.

74. Expensive Reports use governed Background Jobs where required.

75. Report Jobs have stable operation identity.

76. Report Job Retry does not create duplicate final Exports.

77. Filters are registered.

78. Filter operators are controlled.

79. Filter values are typed.

80. Search text is treated as data.

81. Filter injection is prevented.

82. Amount filters identify currency.

83. Active filters are visible.

84. Filter reset restores documented defaults.

85. Saved filters are Owner-scoped.

86. Saved filters are Report-type-scoped.

87. Saved filters are versioned.

88. Saved filters do not leak across Owners.

89. Sorting does not alter Report totals.

90. Sort fields are controlled.

91. Stable sorting supports pagination.

92. Pagination does not redefine full-result totals.

93. Pagination cursors preserve Owner scope.

94. Pagination cursors preserve Account scope.

95. Pagination cursors preserve filters.

96. Pagination cursors preserve sort.

97. Pagination cursors preserve the data boundary.

98. Pagination cursors are integrity-protected.

99. Pagination cursors expire.

100. Report Snapshots have stable identifiers.

101. Report Snapshots identify source Reports.

102. Report Snapshots identify Owner scope.

103. Report Snapshots identify Account scope.

104. Report Snapshots identify period.

105. Report Snapshots identify currency.

106. Report Snapshots identify policy versions.

107. Report Snapshots identify data versions.

108. Report Snapshots support integrity verification.

109. Invalid Snapshots are not presented as current.

110. Verification-Failed Snapshots are not presented as verified.

111. Superseded Snapshots remain historically identifiable.

112. Snapshot retention is governed.

113. Legal Holds apply to Snapshots where required.

114. Report caches are performance mechanisms only.

115. Report caches include Owner identity.

116. Report caches include Account scope.

117. Report caches include period.

118. Report caches include currency.

119. Report caches include filter scope.

120. Report caches include policy versions.

121. Report caches include data version.

122. Cross-Owner cache reuse is Critical.

123. Cache expiration is defined.

124. Cache invalidation Events are defined.

125. Cache invalidation failure is detectable.

126. Stale caches are not presented as current without disclosure.

127. Stale-while-revalidate remains Owner-scoped.

128. Owner switching clears or isolates Report state.

129. Dashboard compositions are registered.

130. Dashboard components are registered.

131. Dashboard default scope is defined.

132. Dashboard Account selection applies consistently.

133. Dashboard period selection applies consistently.

134. Dashboard currency applies consistently.

135. Dashboard components identify source Report types.

136. Dashboard components use compatible policy versions.

137. Dashboard components use compatible data versions where required.

138. Mixed component state is disclosed.

139. Critical component failure is handled explicitly.

140. Optional component failure does not fabricate financial values.

141. Dashboard loading does not expose previous Owner data.

142. Dashboard empty states are specific.

143. Dashboard personalization does not alter formulas.

144. Hidden components do not delete data.

145. Responsive layout does not change financial meaning.

146. Foldable layouts preserve exact values.

147. Light theme remains readable.

148. Dark theme remains readable.

149. Visualization types are registered.

150. Visualization purpose is defined.

151. Visualization transformations are documented.

152. Visualizations preserve exact underlying values.

153. Visualizations identify source Reports.

154. Visualizations identify scope.

155. Monetary visualizations identify currency.

156. Time-series visualizations identify time zone.

157. Time-series visualizations identify granularity.

158. Missing data remains distinct from zero.

159. Partial periods are identified.

160. Projection boundaries are visible.

161. Pending values are distinct from Posted values.

162. Reconciled values are represented accurately.

163. Stale visualizations disclose data age.

164. Partial visualizations disclose missing data.

165. Visualization failure does not display fabricated zero values.

166. Bar-chart baselines are honest.

167. Nonzero baselines are disclosed.

168. Dual-axis charts are avoided or explained.

169. Incompatible units are not combined silently.

170. Positive and negative values are not distinguished only by color.

171. Chart colors meet contrast requirements.

172. Chart semantics have text or pattern alternatives.

173. Legends identify every visible series.

174. Interactive legends expose active visual filtering.

175. Tooltips are not the only access to material data.

176. Labels preserve units and signs.

177. Projection confidence is explicit.

178. Smoothed lines do not invent unsupported financial observations.

179. Stacked components reconcile with their total.

180. Pie and Donut charts are used only for valid bounded compositions.

181. Negative values are not shown in Pie or Donut charts.

182. `Other` groups remain explorable.

183. Waterfall closing values reconcile with the Report.

184. Budget progress preserves overspending meaning.

185. Goal progress preserves excess values.

186. Chart interactions are keyboard accessible where practical.

187. Every material chart has an accessible equivalent.

188. Drill-down preserves Owner scope.

189. Drill-down preserves Account scope.

190. Drill-down preserves period.

191. Drill-down preserves currency.

192. Drill-down preserves filters.

193. Drill-down detail reconciles with the selected chart value.

194. Cross-filters remain visible.

195. Chart Exports preserve scope metadata.

196. Screenshots are not treated as complete Reports.

197. Data Tables have stable identities.

198. Table columns have stable identities.

199. Monetary columns preserve exact values.

200. Date columns identify date semantics.

201. Status columns use text.

202. Table totals identify scope.

203. Group totals reconcile.

204. Virtualized tables preserve Accessibility.

205. Row selection does not grant mutation authority.

206. Comparison types are registered.

207. Comparisons identify current and baseline Reports.

208. Comparisons verify equivalent Owner scope.

209. Comparisons verify Account compatibility.

210. Comparisons verify period compatibility.

211. Comparisons verify currency compatibility.

212. Comparisons verify policy compatibility.

213. Incompatible comparisons are blocked or qualified.

214. Difference formulas are documented.

215. Percentage formulas are documented.

216. Zero-baseline behavior is explicit.

217. Negative-baseline behavior is understandable.

218. Partial-period comparison is disclosed.

219. Trend conclusions define minimum data.

220. Stable Trend tolerance is versioned.

221. Seasonality claims require sufficient history.

222. Reporting groups use stable identifiers.

223. Uncategorized remains distinct from Unknown.

224. `Other` preserves contributing groups.

225. Top-N ranking uses exact values.

226. Top-N tie behavior is defined.

227. Product Analytics remains separate from financial truth.

228. Every Analytics Event is registered.

229. Every Analytics Event has a stable key.

230. Every Analytics Event has a version.

231. Every Analytics Event has a purpose.

232. Every Analytics Event has a defined trigger.

233. Every Analytics property is typed.

234. Analytics required fields are defined.

235. Analytics optional fields are defined.

236. Analytics forbidden fields are defined.

237. Analytics excludes secrets.

238. Analytics excludes unrestricted private financial content.

239. Exact financial values are not collected without approved purpose.

240. Analytics financial buckets are registered.

241. Analytics identity is minimized.

242. External Analytics avoids canonical Owner IDs by default.

243. Analytics Sessions remain distinct from Authentication Sessions.

244. Attempt, success, failure and cancellation Events remain distinct.

245. Analytics duplicates are detectable.

246. Offline Analytics preserves Event time.

247. Offline Analytics preserves consent state.

248. Owner switching does not mix Analytics queues.

249. Consent is validated before nonessential collection.

250. Opt-out stops applicable collection.

251. Non-Production Analytics remains separated from Production.

252. Analytics ingestion validates Event schemas.

253. Invalid Events do not redefine schemas silently.

254. Analytics schema evolution is versioned.

255. Analytics datasets identify purpose.

256. Analytics datasets identify source Event versions.

257. Analytics datasets identify population.

258. Analytics datasets identify data version.

259. Analytics Metrics are registered.

260. Every Metric has a stable identifier.

261. Every Metric has a stable key.

262. Every Metric defines its purpose.

263. Every Metric defines eligible population.

264. Every Metric defines numerator.

265. Every Metric defines denominator where applicable.

266. Every Metric defines exclusions.

267. Every Metric defines time window.

268. Every Metric defines identity boundary.

269. Every Metric defines data sources.

270. Every Metric defines quality requirements.

271. Metric versions remain distinguishable.

272. Incompatible Metric versions are not compared as identical.

273. Certified Metrics are distinguishable from experimental Metrics.

274. Funnels define eligibility.

275. Funnels define steps.

276. Funnels define ordering.

277. Funnels define completion windows.

278. Funnels control duplicate steps.

279. Small populations receive protection.

280. Analytics sampling is documented.

281. Analytics sampling uses stable methods where required.

282. Operational Analytics minimizes Owner details.

283. Operational metrics are registered.

284. Operational metrics use bounded dimensions.

285. Operational Dashboards do not replace Audit Evidence.

286. Insight types are registered.

287. Insight Rules are registered.

288. Insight Rules are versioned.

289. Every Insight identifies Owner scope.

290. Every Insight identifies Account scope where applicable.

291. Every Insight identifies source Reports.

292. Every Insight identifies source calculations where applicable.

293. Every Insight identifies currency.

294. Every Insight identifies data freshness.

295. Every Insight identifies generation time.

296. Insight eligibility is explicit.

297. Insight minimum data is explicit.

298. Insight thresholds are explicit.

299. Monetary thresholds identify currency.

300. Percentage thresholds define zero-baseline behavior.

301. Dynamic thresholds define their method.

302. Insight confidence is explicit.

303. Insufficient data prevents strong conclusions.

304. Insight suppression reasons are controlled.

305. Duplicate Insights are prevented.

306. Insight expiration is defined.

307. Invalid Insights are not presented as current.

308. Insight actions preserve Report scope.

309. Insight language remains neutral.

310. Insight language reflects confidence.

311. Insights do not guarantee future outcomes.

312. Insights do not shame Owners.

313. Insights do not become regulated financial advice without approval.

314. AI Reporting capabilities are registered.

315. AI input fields are approved.

316. AI forbidden fields are defined.

317. AI prompts are versioned.

318. AI models are governed.

319. AI outputs use structured schemas.

320. AI exact financial facts are validated.

321. AI percentages are validated.

322. AI dates are validated.

323. AI currencies are validated.

324. AI projection labeling is validated.

325. AI cannot invent Transactions.

326. AI cannot invent amounts.

327. AI cannot invent dates.

328. AI cannot change currencies.

329. AI cannot present Projection as Posted fact.

330. AI cannot use another Owner's data.

331. AI prompt injection is tested.

332. AI sensitive-data leakage is prevented.

333. AI unsupported advice is blocked.

334. AI output expires with source Reports.

335. AI suggestions require separate Owner action for mutations.

336. Report-derived Notification Rules are registered.

337. Notification Rules identify source Reports or Insights.

338. Notifications require valid fresh source data.

339. Duplicate financial Notifications are controlled.

340. Notification cooldown is defined.

341. Notification previews minimize financial information.

342. Notification deep links preserve Owner scope.

343. Notification deep links revalidate Authorization.

344. Queued Notifications are cancelled when source data becomes invalid.

345. Report Exports have stable identifiers.

346. Report Exports identify source Reports.

347. Report Exports identify source Snapshots where required.

348. Report Exports preserve Owner scope.

349. Report Exports preserve Account scope.

350. Report Exports preserve period.

351. Report Exports preserve currency.

352. Report Exports preserve filters.

353. Report Exports preserve policy versions.

354. Report Exports preserve data versions.

355. Report Export summary and detail reconcile.

356. Report Exports preserve content hashes.

357. Report download authority expires.

358. Export tokens are Owner-bound.

359. Export tokens are revocable.

360. Export tokens are protected from logs.

361. PDF Reports preserve scope metadata.

362. CSV Reports define delimiter and decimal rules.

363. JSON Reports use exact monetary serialization.

364. Spreadsheet Exports protect against formula injection.

365. Image Exports are identified as presentation artifacts.

366. Export regeneration behavior is explicit.

367. Reporting data is classified.

368. Report field access is defined.

369. Report URLs minimize sensitive information.

370. Copied Report URLs do not grant authority.

371. Report sharing requires explicit access control.

372. Shared Reports define recipient and expiration.

373. Support Reporting is case-scoped.

374. Support Reporting is Owner-scoped.

375. Support Reporting is field-minimized.

376. Support cannot alter Report totals.

377. Support cannot change financial policies.

378. Support cannot mark failed Reports as verified.

379. Support cannot create cross-Owner Exports.

380. Support escalates equivalent-scope Report mismatches.

381. Reporting Security validates query parameters.

382. Reporting Security prevents Report enumeration.

383. Reporting Security protects pagination cursors.

384. Reporting Security protects Export tokens.

385. Reporting Security bounds resource consumption.

386. Accessibility requirements apply to every Report.

387. Report pages use logical headings.

388. Report filters are keyboard accessible.

389. Dynamic states are announced.

390. Exact values remain visible at supported text scaling.

391. Status does not depend only on color.

392. Charts have accessible alternatives.

393. Tables remain keyboard and screen-reader accessible.

394. Reduced-motion preferences are respected.

395. Light and Dark themes preserve contrast.

396. Accessible Export structure is provided where supported.

397. Report generation is monitored.

398. Report correctness is monitored.

399. Report freshness is monitored.

400. Dashboard consistency is monitored.

401. Snapshot integrity is monitored.

402. Cache isolation is monitored.

403. Visualization mismatches are monitored.

404. Export equality is monitored.

405. Analytics quality is monitored.

406. Insight validity is monitored.

407. AI fact validation is monitored.

408. Accessibility defects are monitored.

409. Reporting SLOs are defined.

410. Zero-tolerance failures are excluded from error budgets.

411. Critical Reporting alerts are defined.

412. Alerts identify responsible owners.

413. Alerts connect to runbooks.

414. Alerts minimize private financial values.

415. Incorrect Report totals trigger independent verification.

416. Cross-Owner Reporting is treated as Critical.

417. Dashboard scope inconsistency triggers containment.

418. Stale Reports trigger invalidation review.

419. Snapshot corruption preserves the original Snapshot.

420. Cache contamination disables affected cache paths.

421. Visualization distortion removes misleading presentation.

422. Export mismatch revokes affected files where possible.

423. Analytics consent failure stops affected collection.

424. Metric-definition defects invalidate affected decisions.

425. Insight-rule defects invalidate affected Insights.

426. AI hallucinations remove affected output.

427. Accessibility Incidents provide alternatives immediately.

428. Reporting migrations preserve Report meaning.

429. Reporting migrations preserve Owner scope.

430. Reporting migrations preserve Account scope.

431. Reporting migrations preserve currency.

432. Reporting migrations preserve periods.

433. Reporting migrations preserve policy versions.

434. Reporting migrations preserve historical Snapshots.

435. Reporting migrations preserve Export interpretability.

436. Analytics migrations preserve Event versions.

437. Metric migrations create new versions.

438. Insight migrations preserve source references.

439. AI migrations preserve prompt and model provenance.

440. Migration verification detects unexplained Report changes.

441. Deprecated Reports block new dependencies.

442. Retired Reports stop new generation.

443. Historical Reports remain interpretable.

444. Retired Metrics remain historically identifiable.

445. Retired Insight Rules stop new Notifications.

446. Reporting disaster recovery preserves Registries and policies.

447. Reporting recovery verifies Owner isolation.

448. Reporting recovery verifies Snapshot integrity.

449. Reporting releases declare schema and policy versions.

450. Unsafe Reporting changes block release.

451. Post-release Reporting verification is required.

452. AI may assist with design and explanation.

453. AI cannot become a Reporting authority.

454. AI cannot approve Metrics or Reports.

455. AI cannot certify data quality.

456. AI cannot claim test success without executed tests.

457. Every material displayed value remains traceable to canonical data.

458. Every material Report remains reproducible from approved policies.

459. Every material Analytics metric remains reproducible from registered Events and population rules.

460. Every material Insight remains traceable to verified Reports and controlled interpretation.

---

# Reporting, Analytics, Dashboards and Insights Constitutional Rule

Every Nexio Report, Dashboard card, chart, table, comparison, Metric, Funnel, Export, Insight, AI explanation and Report-derived Notification must answer:

```text
Which canonical Owner does this result belong to?

Which Accounts and Resources are included?

Which period and reporting time zone apply?

Which currency applies?

Which filters and grouping rules apply?

Which Resource states are included?

Which Resource states are excluded?

Which Calculation policy produced the financial values?

Which Reporting policy produced the presentation?

Which data version and Report schema version were used?

When was the result generated?

Is the result current, stale, partial, projected, estimated or verification-failed?

Which source Records, Reports, Snapshots and datasets reproduce the result?

Which authorization permits the Actor to view, export or share it?
```

When the answer is uncertain, Nexio must prefer the action that:

- Stops the affected Report or Export.
- Preserves canonical source data.
- Preserves Report metadata.
- Invalidates unsafe caches.
- Invalidates unreliable Snapshots.
- Marks stale data as stale.
- Marks partial data as partial.
- Separates missing data from zero.
- Separates Projected values from Posted values.
- Blocks incompatible currency aggregation.
- Blocks cross-Owner access.
- Removes unsupported Insights.
- Stops invalid Notifications.
- Rejects AI hallucinations.
- Provides an accessible alternative.
- Recalculates through approved policies.
- Escalates the inconsistency.
- Blocks the release.

A Dashboard is not trustworthy merely because its cards load successfully.

A chart is not trustworthy merely because its shape appears plausible.

A Metric is not trustworthy merely because it contains a percentage.

An Insight is not trustworthy merely because its wording sounds helpful.

An AI explanation is not trustworthy merely because it is fluent.

A Report is authoritative only when it is generated from canonical Resources and approved Calculation results, scoped to the correct Owner and Accounts, bound to an explicit period, time zone, currency, policy and data version, presented without distortion, available through an accessible equivalent and reproducible through preserved lineage and Evidence.

Product Analytics may describe Product behavior.

It must not redefine financial truth.

Insights may interpret verified results.

They must not modify financial state or hide uncertainty.

AI may explain approved data.

It must not invent facts, replace calculations or become a source of financial authority.

Nexio must never reuse another Owner's Report cache, combine incompatible currencies, replace unavailable values with zero, hide an active filter, distort a chart scale, invent a Metric denominator, present a Projection as Posted, or display an AI-generated amount that was not validated against canonical data.

---

# Final Authority

This document is the official Reporting, Analytics, Dashboards and Insights specification for Nexio.

All future:

- Report Type Registries.
- Reporting Policy Registries.
- Report schemas.
- Report APIs.
- Report queries.
- Report Jobs.
- Report result states.
- Report warnings.
- Report freshness.
- Report Snapshots.
- Report caches.
- Report lineage.
- Report integrity.
- Dashboard compositions.
- Dashboard components.
- Balance cards.
- Income cards.
- Expense cards.
- Cash Flow cards.
- Comparison cards.
- Recent Transaction lists.
- Budget cards.
- Goal cards.
- Projection cards.
- Insight cards.
- Financial overview Reports.
- Account Reports.
- Transaction Reports.
- Cash Flow Reports.
- Income Reports.
- Expense Reports.
- Category Reports.
- Budget Reports.
- Goal Reports.
- Recurring Transaction Reports.
- Projection Reports.
- Reconciliation Reports.
- Import Reports.
- Export Reports.
- Historical Reports.
- Comparative Reports.
- Charts.
- Line charts.
- Bar charts.
- Stacked charts.
- Area charts.
- Donut charts.
- Pie charts.
- Waterfall charts.
- Progress bars.
- Accessible Data Tables.
- Chart datasets.
- Visualization transformations.
- Chart axes.
- Chart legends.
- Chart tooltips.
- Chart annotations.
- Chart drill-down.
- Chart Export.
- Filters.
- Saved filters.
- Sorting.
- Pagination.
- Search.
- Comparison policies.
- Trend analysis.
- Grouping.
- Top-N Reports.
- Product Analytics Events.
- Analytics Event schemas.
- Analytics properties.
- Analytics datasets.
- Analytics metrics.
- Funnels.
- Sampling.
- Product Analytics Dashboards.
- Operational metrics.
- Operational Dashboards.
- Insight Types.
- Insight Rules.
- Insight thresholds.
- Insight confidence.
- Insight suppression.
- Insight expiration.
- AI-assisted Insights.
- AI Reporting prompts.
- AI Reporting models.
- AI output validation.
- Report-derived Notifications.
- Report Exports.
- PDF Reports.
- CSV Reports.
- JSON Reports.
- Spreadsheet Reports.
- Image Reports.
- Shared Reports.
- Support Reports.
- Audit Reports.
- Reporting monitoring.
- Reporting SLOs.
- Reporting metrics.
- Reporting alerts.
- Reporting Incidents.
- Reporting migrations.
- Reporting deprecations.
- Reporting retirement.
- Reporting disaster recovery.
- Reporting release certification.
- AI-assisted Reporting workflows.

must comply with this specification.

Exceptions require a documented Product, Reporting, Dashboard, Visualization, Financial, Analytics, Metric, Insight, AI, Security, Privacy, Legal, Compliance, Accessibility, Database, Storage, Android, Web, Backend, Operations, Support, Data or Release decision containing:

- Report Type identifier.
- Report key.
- Purpose.
- Owner scope.
- Account scope.
- Resource scope.
- Category scope.
- Period.
- Reporting time zone.
- Currency.
- Included states.
- Excluded states.
- Filters.
- Sorting.
- Pagination.
- Calculation policy.
- Reporting policy.
- Data version.
- Schema version.
- Freshness policy.
- Snapshot policy.
- Cache policy.
- Visualization rules.
- Comparison rules.
- Export behavior.
- Analytics purpose.
- Metric numerator.
- Metric denominator.
- Insight source.
- Insight confidence.
- AI source fields.
- Security impact.
- Privacy impact.
- Accessibility impact.
- Monitoring.
- Alerts.
- Migration.
- Rollback.
- Retirement.
- Compensating controls.
- Required approvers.

Unregistered Reports, unexplained totals, inconsistent Dashboard scopes, cross-Owner caches, hidden filters, incompatible currency aggregation, stale values presented as current, missing chart alternatives, misleading axes, undefined Metric denominators, uncontrolled Analytics collection, unsupported Insight conclusions, unvalidated AI financial facts, inconsistent Report Exports, inaccessible Reporting interfaces and unsupported Reporting claims are considered Product, financial-integrity, Security, Privacy, Accessibility, operational, Support and governance debt.

---