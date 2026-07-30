# Nexio Search, Filtering, Sorting, Pagination and Saved Views Specification

Version: 1.0  
Status: Official  
Authority Level: Platform Query, Data Discovery, Result Navigation and Saved-View Standard  
Applies To: Web Application, Android Application, Backend Services, APIs, Database, Search Indexes, Local Replicas, Transactions, Accounts, Transfers, Budgets, Goals, Recurring Transactions, Reports, Notifications, Imports, Exports, Reconciliation, Audit-Safe Metadata, Support Tools, Administrative Interfaces, Synchronization, Security, Privacy, Accessibility, Operations and Analytics

---

# Purpose

This specification defines the official Search, Filtering, Sorting, Pagination and Saved Views architecture for Nexio.

It establishes how Nexio must:

- Search canonical Owner Resources safely.
- Preserve Owner and Account isolation in every query.
- Apply field-level Authorization before returning results.
- Distinguish Search from Filtering.
- Distinguish exact matching from partial matching.
- Normalize text without changing canonical meaning.
- Handle accents and diacritics safely.
- Handle pt-BR text, dates and monetary formats.
- Search exact monetary values without floating-point ambiguity.
- Filter by currency explicitly.
- Filter by Account, Category, state, date, amount and relationship.
- Support AND, OR and NOT logic through bounded controlled contracts.
- Define null, missing, blank and zero semantics.
- Provide stable sorting.
- Provide deterministic pagination.
- Prevent duplicate or missing results between pages.
- Support incremental synchronization and local-replica queries.
- Support cursor-based pagination.
- Restrict offset pagination where correctness or scale requires cursors.
- Support result counts and facets safely.
- Support saved filters and saved views.
- Synchronize saved views across Android and Web.
- Preserve view versions and concurrent-edit protection.
- Define default views.
- Define personal, system and administrative views.
- Protect Search history and recent-query data.
- Prevent Search from exposing inaccessible Resources.
- Prevent result-count side channels.
- Prevent Search-index lag from being presented as canonical completeness.
- Provide freshness and partial-result disclosure.
- Support accessible query construction and result navigation.
- Support localized presentation without changing canonical query semantics.
- Support safe Export from a query result.
- Preserve query reproducibility.
- Support observability, testing, Incident response and governance.

This document applies to every Nexio component that discovers, locates, filters, sorts, groups, counts, paginates, saves, restores, exports or navigates collections of Resources.

---

# Constitutional Principle

Search does not grant access.

A Resource must not become visible merely because:

- Its identifier is known.
- Its text matches a Search term.
- A Search index contains it.
- It appears in a cached result.
- It was visible to the Owner previously.
- It appears in a saved view.
- It appears in a local replica.
- It was returned by an outdated cursor.
- It contributes to a result count.
- It matches a Category or Account name.
- Another Resource references it.
- An administrative Search form accepts its identifier.

Every query must answer:

```text
Who is performing the query?

Which canonical Owner scope applies?

Which Accounts and Resource Types are authorized?

Which fields may be searched?

Which fields may be returned?

Which Search, Filter and Sort policies apply?

Which locale, time zone and currency semantics apply?

Which data boundary or freshness state applies?

Which stable ordering applies?

Which pagination cursor applies?

Which Saved View or query version applies?

Which Evidence reconstructs the query behavior?
```

A query result is trustworthy only when Nexio can establish:

- Canonical scope.
- Authorization.
- field eligibility.
- deterministic query semantics.
- stable ordering.
- pagination integrity.
- freshness.
- safe result projection.

---

# Query Objectives

The Nexio query architecture shall provide:

```text
Owner Isolation

Account Isolation

Authorization Before Results

Deterministic Query Semantics

Exact Financial Meaning

Stable Ordering

Pagination Integrity

Bounded Complexity

Freshness Transparency

Cross-Platform Consistency

Accessible Discovery

Saved-View Reproducibility

Privacy-Safe History

Operational Observability
```

---

# Owner Isolation

Every query must be constrained to the canonical Owner unless an explicitly authorized administrative scope applies.

Owner scope must be applied to:

- Database queries.
- Search-index queries.
- facet queries.
- count queries.
- autocomplete queries.
- saved views.
- recent searches.
- cached query results.
- local replica queries.
- Export-from-view operations.
- Support queries.
- administrative queries.

Cross-Owner Search exposure is a Critical Security and Privacy Incident.

---

# Account Isolation

Account-scoped queries must validate that every requested Account belongs to the canonical Owner.

The backend must not trust Account identifiers supplied by:

- Query parameters.
- request bodies.
- saved views.
- deep links.
- local caches.
- browser storage.
- imported configuration.
- administrative templates.

---

# Authorization Before Results

Authorization must be applied before:

- Result retrieval.
- count calculation.
- facet calculation.
- autocomplete generation.
- grouping.
- aggregation.
- Export.
- saved-view execution.

Nexio must not retrieve unauthorized Resources and remove them only in the interface.

---

# Deterministic Query Semantics

The same:

```text
Canonical query

+

Owner scope

+

Authorization state

+

Data boundary

+

Policy versions
```

should produce the same logical result set.

Display order may change only when the selected Sort or canonical data changes.

---

# Exact Financial Meaning

Money queries must preserve:

- Exact decimal value.
- currency.
- sign.
- amount range.
- Transaction direction.
- Account currency.
- comparison semantics.

A Search for:

```text
R$ 1.250,45
```

must not be interpreted as:

```text
R$ 1,25

R$ 125.045,00

or

1.25045 units
```

---

# Stable Ordering

Every paginated query must have a deterministic total ordering.

A Sort using a nonunique field must include a stable tie-breaker.

Example:

```text
Primary:
effectiveDate descending

Secondary:
canonicalCreationSequence descending

Tertiary:
transactionId descending
```

---

# Pagination Integrity

Pagination must avoid:

- Duplicate results.
- missing results.
- cross-Owner cursor reuse.
- cursor tampering.
- Sort changes between pages.
- Filter changes between pages.
- stale page continuation without disclosure.
- unbounded page sizes.

---

# Bounded Complexity

Every query must have bounded:

- Search term length.
- token count.
- Filter count.
- nesting depth.
- OR branch count.
- Sort field count.
- page size.
- facet count.
- date range where required.
- aggregation scope.
- execution time.
- returned field count.

---

# Freshness Transparency

A result should identify whether it is:

```text
Current

NearCurrent

Stale

Partial

SearchIndexUpdating

LocalReplicaOnly

Offline

Unavailable
```

---

# Cross-Platform Consistency

Android and Web must use compatible meanings for:

- Search terms.
- Filter operators.
- date periods.
- amount ranges.
- currency.
- null values.
- Sort.
- pagination.
- saved views.
- query errors.
- result freshness.

---

# Accessible Discovery

Search and Filter capabilities must support:

- Keyboard operation.
- screen-reader labels.
- understandable field names.
- accessible chips.
- accessible date and amount controls.
- accessible Sort controls.
- result-count announcements.
- pagination announcements.
- error summaries.
- clear active-filter state.
- non-color-only status.
- text scaling.

---

# Saved-View Reproducibility

A Saved View must preserve:

- Resource Type.
- query schema version.
- Search terms.
- Filters.
- Sort.
- columns.
- grouping.
- visible fields.
- Account scope.
- period.
- currency scope.
- owner.
- version.
- created and updated times.

A Saved View does not preserve Authorization permanently.

Authorization must be revalidated whenever it executes.

---

# Privacy-Safe History

Search history may reveal:

- Account names.
- Transaction descriptions.
- people or organizations.
- financial concerns.
- categories.
- dispute terms.
- sensitive dates.
- private identifiers.

Search history must remain minimized, Owner-scoped and retention-governed.

---

# Scope

This specification governs:

- Global Search.
- Resource-specific Search.
- Transaction Search.
- Account Search.
- Transfer Search.
- Budget Search.
- Goal Search.
- Recurring Transaction Search.
- Notification Search.
- Import and Export history Search.
- Reconciliation Search.
- Report Search.
- Support-safe Search.
- Administrative Search.
- text Search.
- exact Search.
- prefix Search.
- substring Search.
- token Search.
- phrase Search.
- identifier Search.
- amount Search.
- date Search.
- Filter operators.
- Filter composition.
- Filter chips.
- Filter presets.
- relative periods.
- Sort.
- grouping.
- pagination.
- cursors.
- result counts.
- facets.
- autocomplete.
- suggestions.
- recent searches.
- Search history.
- Saved Views.
- default views.
- system views.
- view sharing where approved.
- query Export.
- query caching.
- local-replica Search.
- synchronization of saved views.
- query monitoring.
- query testing.
- query Incidents.
- query governance.

---

# Out of Scope

This document does not independently define:

- Canonical financial calculations.
- authentication.
- authorization Roles.
- general database replication.
- complete reporting aggregation.
- external internet Search.
- public Search-engine indexing.
- AI semantic search across unrestricted private data.
- unrestricted natural-language database queries.
- external banking Search.
- document-content Search inside arbitrary attachments.
- complete Audit Evidence Search.
- complete Support-case Search.

Those capabilities must integrate with this specification.

---

# Query Domains

Nexio query capabilities are organized into:

```text
Global Resource Search

Transaction Query

Account Query

Transfer Query

Budget Query

Goal Query

Recurring Transaction Query

Notification Query

Import and Export Query

Reconciliation Query

Report Query

Saved View Query

Local Replica Query

Support Query

Administrative Query
```

---

# Global Resource Search Domain

Global Search may locate approved Resource summaries across multiple Resource Types.

Potential Resource Types include:

- Accounts.
- Transactions.
- Transfers.
- Budgets.
- Goals.
- recurring Transactions.
- Reports.
- Notifications.
- Imports.
- Exports.

Global Search must not combine inaccessible Resource Types merely because they share text.

---

# Transaction Query Domain

Transaction querying may support:

- Description.
- exact Transaction identifier.
- Account.
- Category.
- type.
- direction.
- state.
- exact amount.
- amount range.
- currency.
- effective date.
- creation date.
- recurring relationship.
- Transfer relationship.
- Import lineage.
- reconciliation state.
- tags where supported.

---

# Account Query Domain

Account querying may support:

- Account name.
- Account Type.
- currency.
- state.
- created date.
- reconciliation state.
- safe external reference where approved.

Search must not expose complete sensitive Account identifiers unnecessarily.

---

# Transfer Query Domain

Transfer querying may support:

- Transfer identifier.
- source Account.
- destination Account.
- state.
- source amount.
- destination amount.
- currency.
- effective date.
- fee.
- reconciliation state.

A Transfer must remain one logical Resource.

---

# Budget Query Domain

Budget querying may support:

- Name.
- period.
- Category scope.
- Account scope.
- currency.
- amount.
- status.
- usage state.
- threshold state.

Derived usage filters must identify the Reporting or Calculation boundary used.

---

# Goal Query Domain

Goal querying may support:

- Name.
- target date.
- target amount.
- currency.
- state.
- progress range.
- completion state.
- contribution activity.

Derived progress filters must identify the Calculation version and data boundary.

---

# Recurring Transaction Query Domain

Recurring querying may support:

- Name.
- Account.
- Category.
- amount.
- currency.
- schedule.
- next occurrence.
- state.
- type.
- time zone.

---

# Notification Query Domain

Notification querying may support:

- Type.
- priority.
- read state.
- archive state.
- source Resource Type.
- created date.
- expiration.
- action availability.

Search must not expose Notification content beyond the active Privacy Projection.

---

# Import and Export Query Domain

Import and Export history querying may support:

- Job identifier.
- type.
- state.
- date.
- safe file name.
- Account scope.
- record count.
- format.
- expiration.

Search must not expose raw Source File contents or reusable download authority.

---

# Reconciliation Query Domain

Reconciliation querying may support:

- Account.
- period.
- state.
- difference status.
- unmatched count.
- completion date.
- reviewer where authorized.

---

# Report Query Domain

Report querying may support:

- Report Type.
- period.
- Account scope.
- currency.
- generated date.
- state.
- saved Report name.
- freshness.

---

# Saved View Query Domain

Saved View querying may support:

- Name.
- Resource Type.
- owner.
- state.
- created date.
- updated date.
- default state.
- system or personal origin.

---

# Local Replica Query Domain

Offline or local-replica queries may operate only over the active Owner partition.

They must identify:

- Replica freshness.
- pending local Resources.
- stale data.
- unavailable server-only fields.
- local-only Search limitations.

---

# Support Query Domain

Support queries must be:

- Case-scoped.
- capability-controlled.
- field-minimized.
- Owner-scoped.
- audited.
- free from unrestricted raw financial Search.

---

# Administrative Query Domain

Administrative Search requires exceptional authority.

Administrative querying must define:

- Purpose.
- population.
- fields.
- time range.
- result limits.
- Export restrictions.
- evidence.
- review.

---

# Core Query Principles

The Nexio Query architecture is governed by:

```text
Canonical Query Model

Explicit Resource Type

Owner-Bound Scope

Field Registry

Typed Operators

Explicit Currency

Explicit Time Zone

Stable Sort

Cursor Integrity

Versioned Saved Views

Result Projection

Freshness Disclosure

Query Reproducibility
```

---

# Canonical Query Model

Every client query should be normalized into one canonical backend query model.

Recommended structure:

```text
CanonicalQuery
 ├── queryId
 ├── querySchemaVersion
 ├── resourceType
 ├── ownerScope
 ├── accountScope
 ├── searchExpression
 ├── filters
 ├── sort
 ├── grouping
 ├── facets
 ├── resultProjection
 ├── pageRequest
 ├── locale
 ├── timeZone
 ├── currencyScope
 ├── dataBoundary
 ├── savedViewReference
 ├── clientContext
 └── requestedAt
```

---

# Query Identifier

Recommended format:

```text
qry_<sortable-unique-identifier>
```

A Query ID supports:

- tracing.
- diagnostics.
- safe Support reference.
- metrics.
- cancellation.
- Incident investigation.

It does not grant access.

---

# Query Schema Version

Recommended:

```text
querySchemaVersion:
1
```

Breaking query-contract changes require a new version.

---

# Resource Type

Every canonical query must identify one primary Resource Type.

Global Search may use a registered multi-Resource query Type with separate result projections.

---

# Owner Scope

The canonical Owner should normally be resolved from Authentication.

Client-provided Owner fields must be ignored or verified.

---

# Account Scope

Recommended representation:

```text
accountScope:
  mode: Selected
  accountIds:
    - acc_...
    - acc_...
```

Potential modes:

```text
AllAuthorized

Selected

None

DerivedFromResource
```

---

# Search Expression

A Search Expression represents text or identifier discovery.

Recommended structure:

```text
SearchExpression
 ├── rawInput
 ├── normalizedInput
 ├── searchMode
 ├── eligibleFields
 ├── tokens
 ├── phrase
 ├── exactIdentifierCandidate
 ├── locale
 └── normalizationVersion
```

---

# Filter Collection

Filters should use typed, structured expressions.

Recommended structure:

```text
FilterExpression
 ├── filterId
 ├── field
 ├── operator
 ├── value
 ├── values
 ├── lowerBound
 ├── upperBound
 ├── currency
 ├── timeZone
 ├── includeLower
 ├── includeUpper
 └── negated
```

---

# Sort Collection

Recommended structure:

```text
SortExpression
 ├── field
 ├── direction
 ├── nullPlacement
 ├── casePolicy
 └── tieBreaker
```

---

# Result Projection

Result Projection defines which fields may be returned.

Recommended structure:

```text
ResultProjection
 ├── projectionId
 ├── fields
 ├── summaryFields
 ├── relationshipFields
 ├── derivedFields
 ├── maskingPolicy
 └── projectionVersion
```

---

# Page Request

Recommended structure:

```text
PageRequest
 ├── paginationMode
 ├── pageSize
 ├── cursor
 ├── pageNumber
 ├── offset
 └── includeTotalCount
```

Cursor mode should be preferred for large or mutable datasets.

---

# Data Boundary

Potential boundaries include:

```text
CurrentCanonical

AsOfTimestamp

OwnerSynchronizationSequence

AccountFinancialSequence

ReportSnapshot

LocalReplicaBoundary
```

---

# Query Client Context

Potential safe fields include:

```text
platform

applicationVersion

clientInstanceId

locale

timeZone

offlineState

savedViewId

interactionSource
```

Client context supports behavior and diagnostics.

It does not grant authority.

---

# Query Field Registry

Every searchable, filterable, sortable, groupable or returnable field must be registered.

Recommended fields:

```text
queryFieldId

resourceType

canonicalField

displayNameKey

dataType

searchable

filterable

sortable

groupable

facetable

returnable

offlineEligible

supportedOperators

currencyBehavior

timeZoneBehavior

nullBehavior

classification

maskingPolicy

owner

version

status
```

---

# Query Field Identifier

Recommended format:

```text
QUERY-FIELD-<RESOURCE>-<NUMBER>
```

---

# Query Field Data Types

Recommended:

```text
Text

Keyword

Identifier

Boolean

Integer

Decimal

Money

Currency

Date

DateTime

Instant

Enum

Reference

ReferenceList

State

Percentage

Duration
```

---

# Searchable Field

A Searchable field may participate in text or exact Search.

---

# Filterable Field

A Filterable field may use registered typed operators.

---

# Sortable Field

A Sortable field has a defined stable ordering.

---

# Groupable Field

A Groupable field may define result groups.

---

# Facetable Field

A Facetable field may produce bounded distinct-value counts.

---

# Returnable Field

A Returnable field may appear in a result projection for an authorized Actor.

A field may be searchable but not returnable.

---

# Offline-Eligible Field

An Offline-Eligible field may be queried from the local replica.

---

# Field Classification

Potential classifications include:

```text
PublicProductMetadata

OwnerPrivate

Financial

SensitiveFinancial

SecuritySensitive

PrivacySensitive

SupportRestricted

AdministrativeRestricted
```

---

# Query Operator Registry

Every Filter operator must be registered by field Type.

Recommended operators include:

```text
Equals

NotEquals

In

NotIn

Contains

NotContains

StartsWith

EndsWith

MatchesPhrase

GreaterThan

GreaterThanOrEqual

LessThan

LessThanOrEqual

Between

IsNull

IsNotNull

IsEmpty

IsNotEmpty

Before

OnOrBefore

After

OnOrAfter

During

HasAny

HasAll

HasNone
```

---

# Operator Compatibility

Examples:

| Data Type | Approved Operators |
|---|---|
| Text | Equals, Contains, StartsWith, IsEmpty |
| Keyword | Equals, In, NotIn |
| Identifier | Equals, In |
| Money | Equals, GreaterThan, LessThan, Between |
| Currency | Equals, In |
| Date | Equals, Before, After, Between |
| Boolean | Equals |
| Enum | Equals, In, NotIn |
| Reference | Equals, In |
| ReferenceList | HasAny, HasAll, HasNone |

Unsupported combinations must be rejected.

---

# Search versus Filter

Search is generally used for:

- Human-entered text.
- identifiers.
- descriptions.
- names.
- approved keywords.

Filtering is used for:

- Exact state.
- exact Account.
- exact Category.
- exact currency.
- amount range.
- date range.
- boolean state.
- relationship.

A Search term must not be interpreted as an unrestricted database expression.

---

# Text Search Architecture

Text Search must define:

- Searchable fields.
- normalization.
- tokenization.
- accents.
- case.
- punctuation.
- minimum token length.
- maximum input length.
- prefix behavior.
- phrase behavior.
- ranking.
- language.
- fallback.
- result limits.

---

# Text Search Modes

Recommended:

```text
Automatic

Exact

Phrase

Prefix

Token

Identifier
```

---

# Automatic Search Mode

Automatic mode may detect:

- Exact Resource identifier.
- supported external identifier.
- quoted phrase.
- ordinary text tokens.
- monetary candidate.
- date candidate.

Detection must remain bounded and explainable.

---

# Exact Search Mode

Exact Search requires exact normalized field equality.

Example:

```text
Account name:
“Conta Principal”
```

Exact Search should not also return:

```text
“Conta Principal Reserva”
```

unless the Product clearly uses a different mode.

---

# Phrase Search Mode

A quoted phrase may preserve token order.

Example:

```text
"supermercado central"
```

---

# Prefix Search Mode

Prefix Search may support autocomplete.

Example:

```text
super
```

may match:

```text
Supermercado
```

Prefix Search must use bounded minimum lengths.

---

# Token Search Mode

Token Search may match normalized terms independently.

Example:

```text
mercado julho
```

may search both tokens under the registered operator.

---

# Identifier Search Mode

Identifier Search should use exact matching.

Partial identifier enumeration should generally be prohibited.

---

# Text Normalization

Text normalization may include:

- Case folding.
- approved Unicode normalization.
- outer whitespace trimming.
- repeated-whitespace reduction.
- punctuation policy.
- accent-insensitive Search projection.
- tokenization.
- stop-word policy where applicable.

Canonical stored text must remain unchanged.

---

# Case Sensitivity

Ordinary Owner Search should normally be case-insensitive.

Identifier and external-reference fields may remain case-sensitive according to contract.

---

# Accent and Diacritic Behavior

A Search for:

```text
alimentacao
```

may match:

```text
Alimentação
```

through a Search-only normalized projection.

The canonical Category name remains:

```text
Alimentação
```

---

# Accent-Sensitive Search

Accent-sensitive Search may be available only where field meaning requires it.

---

# Portuguese Text Search

pt-BR Search should support:

- Accented characters.
- cedilla.
- common word forms.
- punctuation.
- Account and Category names.
- Transaction descriptions.

Language support must not create uncontrolled stemming that changes financial meaning.

---

# Stemming

Stemming or morphological expansion may be used only through a registered Search policy.

It should not transform:

- identifiers.
- currencies.
- Account codes.
- exact Category keys.
- Resource states.

---

# Stop Words

Stop words may be ignored for free-text ranking.

They must not be ignored in exact or phrase Search.

---

# Minimum Token Length

Very short tokens may be rejected or limited to prevent:

- broad enumeration.
- high execution cost.
- low-quality results.
- result-count side channels.

---

# Maximum Search Length

Search input length must be bounded.

Oversized input should produce a controlled validation error.

---

# Search Special Characters

Special characters must remain inert input.

Search input must not become:

- SQL.
- regular expression.
- shell expression.
- script.
- Search-engine query-language injection.
- unrestricted wildcard expression.

---

# Wildcard Search

Owner-provided unrestricted wildcards should be prohibited.

Approved prefix behavior should use structured Search modes.

---

# Regular Expression Search

Owner-provided regular expressions should remain unsupported unless a separately governed administrative capability exists.

---

# Search Ranking

When relevance ranking is used, it should define:

- Exact-match weight.
- prefix-match weight.
- phrase weight.
- field weight.
- recency weight.
- state restrictions.
- tie-breakers.
- ranking version.

Ranking must not alter Authorization.

---

# Search Rank Explainability

The Product does not need to expose proprietary weights.

It should nevertheless avoid unexplained unstable ordering when the selected mode is `Relevance`.

---

# Search Result Rank Stability

For one data boundary and ranking version, pagination should use a stable rank and tie-breaker.

---

# Identifier Query Architecture

Identifier fields may include:

- Canonical Resource ID.
- safe external reference.
- Import Job ID.
- Export Job ID.
- operation reference.
- Transfer ID.
- reconciliation ID.

---

# Identifier Validation

Identifier Search should validate:

- Prefix.
- length.
- character set.
- Resource Type.
- Owner scope.
- access.

---

# Identifier Enumeration Prevention

The interface and API should not reveal whether an inaccessible identifier exists.

Recommended unauthorized behavior:

```text
Not found or unavailable
```

rather than:

```text
Resource exists but belongs to another Owner
```

---

# Exact Money Query Architecture

Money filters must use typed values.

Recommended structure:

```text
MoneyFilterValue
 ├── decimalValue
 ├── currency
 ├── signPolicy
 └── sourceLocale
```

---

# Money Query Example

Owner input:

```text
R$ 1.250,45
```

Normalized query:

```text
decimalValue:
"1250.45"

currency:
BRL
```

---

# Money Equality

Money equality requires:

```text
Exact decimal amount

+

Same currency
```

unless an approved cross-currency comparison explicitly applies.

---

# Money Range

Example:

```text
Minimum:
R$ 100,00

Maximum:
R$ 500,00

Currency:
BRL
```

Recommended normalized range:

```text
lowerBound:
"100.00"

upperBound:
"500.00"

currency:
BRL
```

---

# Currency-Omitted Money Filter

A money Filter without currency must:

- Inherit one explicitly selected Account currency under policy.
- apply separately to each selected currency.
- or require currency selection.

It must not compare BRL and USD as equivalent decimal units.

---

# Multi-Currency Money Filter

Potential model:

```text
BRL:
R$ 100,00 to R$ 500,00

USD:
USD 20.00 to USD 100.00
```

Each currency uses an independent range.

---

# Financial Direction Query

Nexio should distinguish:

```text
Income

Expense

Refund

Fee

Transfer

Adjustment
```

from signed amount.

A Filter should not accidentally double-apply direction and sign.

---

# Absolute Amount Query

An optional `absoluteAmount` field may support Search across positive and negative representations.

It must remain separate from canonical signed amount.

---

# Decimal Scale

Money query values must follow the supported currency scale and financial policy.

Excess precision must be rejected or normalized through an approved policy.

---

# Date Query Architecture

Date filters must define:

- Field.
- date Type.
- time zone.
- inclusive or exclusive boundary.
- relative or absolute period.
- locale input.
- canonical value.

---

# Date Types

Recommended:

```text
DateOnly

LocalDateTime

OffsetDateTime

Instant

YearMonth

Period
```

---

# Date-Only Query

Example Owner input:

```text
31/07/2026
```

Canonical:

```text
2026-07-31
```

The date must not change through time-zone conversion.

---

# Timestamp Query

A Timestamp query should resolve one exact instant or bounded period.

---

# Date Range

Recommended structure:

```text
DateRangeFilter
 ├── field
 ├── startDate
 ├── endDate
 ├── timeZone
 ├── includeStart
 ├── includeEnd
 └── boundaryPolicy
```

---

# Inclusive Date Period

For date-only Transactions:

```text
From:
2026-07-01

Through:
2026-07-31
```

Both calendar dates may be inclusive.

---

# Timestamp Period Conversion

A local calendar period should convert to an instant range using the selected time zone.

Example:

```text
Time zone:
America/Sao_Paulo

Local period:
31/07/2026
```

The backend should derive the correct start and end instants for that local date.

---

# Time-Zone Authority

Time zone should come from:

- Explicit query selection.
- Saved View.
- Owner reporting preference.
- Account policy where applicable.

The Device time zone must not override a saved reporting time zone silently.

---

# Relative Periods

Recommended relative periods include:

```text
Today

Yesterday

CurrentWeek

PreviousWeek

CurrentMonth

PreviousMonth

CurrentQuarter

PreviousQuarter

CurrentYear

PreviousYear

Last7Days

Last30Days

Last90Days

Custom
```

---

# Relative Period Resolution

Relative periods must resolve against:

- Server-trusted current time.
- selected time zone.
- registered calendar policy.
- query execution time or Saved View resolution policy.

---

# Relative Period Saved View

A Saved View containing:

```text
CurrentMonth
```

should resolve dynamically when executed.

It should not remain permanently fixed to the month in which it was created.

---

# Fixed Period Saved View

A Saved View may instead preserve:

```text
2026-07-01 through 2026-07-31
```

The distinction must be explicit.

---

# Week Start

Week-based periods must define the first day of the week.

For pt-BR Product behavior, Monday may be used according to the registered calendar policy.

---

# Daylight-Saving Boundaries

DateTime periods must handle:

- Missing local times.
- repeated local times.
- historical offset changes.
- time-zone database versions.

---

# Null and Empty Semantics

Nexio must distinguish:

```text
Missing field

Null

Empty string

Whitespace-only string

Zero

False

Empty collection
```

---

# IsNull

`IsNull` matches an explicitly null or absent nullable field according to the Resource schema.

---

# IsEmpty

`IsEmpty` may match:

- Empty string.
- empty collection.

It must not automatically match zero or false.

---

# NotEquals and Null

The query contract must define whether:

```text
NotEquals:
Food
```

includes null values.

Recommended safer behavior:

```text
NotEquals does not include null unless explicitly requested.
```

---

# Collection Filters

For list or relationship fields, supported operators may include:

```text
HasAny

HasAll

HasNone
```

---

# HasAny

A Resource matches when at least one selected value exists.

---

# HasAll

A Resource matches when every selected value exists.

---

# HasNone

A Resource matches when none of the selected values exists.

Null and empty collection behavior must be explicit.

---

# Boolean Filter Composition

The query model may support controlled logical groups.

Recommended structure:

```text
FilterGroup
 ├── conjunction
 ├── expressions
 └── childGroups
```

Potential conjunctions:

```text
AND

OR
```

NOT should use explicit negation with bounded behavior.

---

# Default Filter Composition

When multiple ordinary Filter chips are selected, the Product should define whether they use:

- AND across fields.
- OR within one field.
- another explicit model.

Recommended:

```text
Different fields:
AND

Multiple values for one field:
OR
```

Example:

```text
Account:
Conta Principal OR Conta Reserva

AND

Category:
Alimentação OR Transporte

AND

State:
Posted
```

---

# Logical Nesting Limits

Logical groups must have bounded:

- Depth.
- child count.
- OR branch count.
- expression count.

---

# Filter Contradictions

The query engine should detect obvious contradictions where practical.

Example:

```text
State = Deleted

AND

State = Active
```

Potential result:

```text
Empty result with controlled explanation
```

---

# Filter Presets

Nexio may provide system presets such as:

```text
Recent Transactions

Uncategorized Expenses

Pending Transactions

Upcoming Recurring Transactions

Goals Near Target Date

Unread Notifications

Imports Requiring Review

Exports Ready to Download
```

Presets must be versioned system views.

---

# Sort Architecture

Sort must use registered Sortable fields.

---

# Sort Direction

Recommended:

```text
Ascending

Descending
```

---

# Null Placement

Recommended:

```text
First

Last

FieldDefault
```

---

# Case Policy

Text Sort may define:

```text
LocaleAwareCaseInsensitive

Binary

KeywordNormalized
```

---

# Locale-Aware Sorting

pt-BR display sorting may account for accents and language collation.

Canonical Resource identity remains unchanged.

---

# Financial Sort

Money Sort must define behavior across currencies.

Potential approved models:

```text
SingleCurrencyOnly

GroupByCurrencyThenAmount

ConvertedAmountUsingRegisteredReportPolicy
```

Ordinary queries must not compare BRL and USD amounts directly as equivalent values.

---

# Multi-Currency Sort

Recommended safe model:

```text
Primary:
currency ascending

Secondary:
amount descending

Tertiary:
resourceId ascending
```

---

# Date Sort

Date-only and Timestamp fields must not be mixed without explicit conversion semantics.

---

# Relevance Sort

Relevance Sort should be available only when a Search Expression exists.

---

# Default Sort

Every Resource Type must define one default stable Sort.

---

# Transaction Default Sort

Recommended:

```text
effectiveDate descending

then

canonicalCreationSequence descending

then

transactionId descending
```

---

# Stable Tie-Breaker

Every Sort must end with one unique or total-order tie-breaker.

Recommended:

```text
resourceId ascending
```

or a stable canonical sequence.

---

# Sort Mutation During Pagination

Changing Sort invalidates the existing cursor.

---

# Pagination Architecture

Supported pagination modes may include:

```text
Cursor

Offset

LocalWindow

Streaming
```

---

# Cursor Pagination

Cursor pagination is preferred for:

- Large mutable datasets.
- Search-index results.
- chronological feeds.
- financial records.
- Notifications.
- Import and Export history.

---

# Offset Pagination

Offset pagination may be allowed for:

- Small stable administrative tables.
- bounded reference data.
- static snapshots.
- local-only views.

It should not be the default for large mutable financial collections.

---

# Pagination Cursor

Recommended structure:

```text
QueryCursor
 ├── cursorId
 ├── ownerId
 ├── resourceType
 ├── queryHash
 ├── sortDefinition
 ├── lastSortValues
 ├── lastResourceId
 ├── dataBoundary
 ├── querySchemaVersion
 ├── issuedAt
 ├── expiresAt
 └── integrity
```

---

# Query Cursor Identifier

Recommended format:

```text
qcur_<sortable-unique-identifier>
```

---

# Cursor Properties

A query cursor must be:

- Owner-bound.
- Resource-Type-bound.
- query-bound.
- Filter-bound.
- Sort-bound.
- projection-bound where required.
- environment-bound.
- integrity-protected.
- expiring.
- nonauthoritative for access.

---

# Query Hash

The canonical Query hash should include:

```text
Resource Type

Owner-safe scope reference

Account scope

Search Expression

Filters

Sort

Grouping

Projection

Data boundary

Query schema version
```

---

# Cursor Reuse

A cursor must be rejected when reused with:

- Another Owner.
- another Resource Type.
- different Filters.
- different Sort.
- different projection where material.
- another environment.
- an incompatible schema version.

---

# Cursor Expiration

On expiration:

- Reexecute from the beginning.
- preserve the visible Filter state.
- disclose that the dataset may have changed.
- avoid silently continuing from an invalid position.

---

# Cursor and Authorization

A valid cursor does not grant access.

Authorization must be reevaluated for every page.

---

# Page Size

Page size must be bounded by Resource Type and platform.

Example controlled options:

```text
25

50

100
```

Larger sizes require explicit approval.

---

# Page Response

Recommended structure:

```text
QueryPage
 ├── queryId
 ├── resourceType
 ├── items
 ├── itemCount
 ├── nextCursor
 ├── previousCursor
 ├── hasMore
 ├── totalCount
 ├── totalCountState
 ├── facets
 ├── dataBoundary
 ├── freshness
 ├── warnings
 └── generatedAt
```

---

# Total Count State

Recommended:

```text
Exact

Estimated

Unavailable

Restricted

Calculating
```

---

# Exact Total Count

An exact count must use the same:

- Owner scope.
- Authorization.
- Filters.
- data boundary.
- Resource state.
- policy versions.

---

# Estimated Total Count

An estimated count must be labeled.

It must not be used as an exact financial total.

---

# Restricted Count

A count may be withheld when it creates:

- Privacy risk.
- enumeration risk.
- Security risk.
- excessive processing cost.

---

# Count Side-Channel Prevention

Unauthorized Resources must not influence:

- Total count.
- facet counts.
- page counts.
- autocomplete.
- empty-state differences.
- timing in a readily exploitable way.

---

# Mutable Dataset Pagination

When canonical data changes between pages, the query policy must define behavior.

Potential models include:

```text
SnapshotBound

BestEffortCurrent

SequenceBound
```

---

# Snapshot-Bound Pagination

All pages use one consistent data boundary.

Best for:

- Exports.
- financial reports.
- administrative review.
- repeatable investigation.

---

# Best-Effort-Current Pagination

Each page may use current data.

The interface should disclose that results may change.

Stable cursor logic should still minimize duplication and omission.

---

# Sequence-Bound Pagination

Pages use one synchronization or financial sequence boundary.

---

# Previous Page

Cursor pagination may support previous-page cursors.

The implementation must not rely on unbounded server-side Session memory unless governed.

---

# Infinite Scroll

Infinite scroll may use cursor pagination.

It must provide:

- Accessible position.
- loading announcement.
- retry.
- end-of-results announcement.
- alternative navigation where appropriate.
- preserved Filters.
- stable result order.

---

# Local Window Pagination

Local replicas may load a bounded window from the local database.

They must identify when additional server results may exist.

---

# Result Projection Architecture

Result projections should minimize fields.

---

# Transaction Summary Projection

Potential fields:

```text
transactionId

effectiveDate

description

amount

currency

direction

Account safe label

Category safe label

state

synchronization state
```

---

# Result Detail Projection

Full Resource detail should require:

- Resource-specific authorization.
- targeted read.
- current Resource state.
- field-level projection.

---

# Projection Expansion

Relationship expansion should be bounded.

Example:

```text
Transaction

+

Account safe summary

+

Category safe summary
```

The query must not recursively expand unrestricted relationships.

---

# Derived Fields

Derived result fields must identify:

- Calculation policy.
- data version.
- freshness.
- currency.
- partial state.

---

# Highlighting

Search result highlighting may show matched text.

Highlighting must:

- Escape HTML.
- avoid exposing hidden fields.
- preserve accents.
- remain accessible.
- not alter canonical content.

---

# Snippets

Search snippets must be generated only from authorized returnable fields.

---

# Redaction

A field may be Searchable through a safe index but returned in masked form.

Example:

```text
Searchable safe external reference

Returned:
••••1234
```

The design must be Security-reviewed to avoid confirmation side channels.

---

# Grouping Architecture

Grouping organizes results without changing canonical membership.

Potential groups include:

```text
Account

Category

Currency

State

Month

Resource Type
```

---

# Group Count

Group counts must follow the same Authorization and data boundary as results.

---

# Group Ordering

Group order must be explicit.

Example:

```text
Month descending

then

Transaction date descending
```

---

# Group Pagination

The contract must define whether pagination applies to:

- Groups.
- items.
- both through nested cursors.

---

# Grouped Financial Totals

Grouped totals are Reporting or Calculation results.

They must preserve:

- Exact money.
- currency.
- source boundary.
- contributing result scope.
- partial state.

Search grouping must not invent independent financial totals.

---

# Facet Architecture

Facets provide bounded distinct-value counts.

Potential facets include:

- Account.
- Category.
- state.
- type.
- currency.
- year.
- month.
- priority.
- Import state.
- Export format.

---

# Facet Request

Recommended structure:

```text
FacetRequest
 ├── field
 ├── maximumValues
 ├── sort
 ├── includeSelectedValues
 └── minimumCount
```

---

# Facet Response

Recommended structure:

```text
FacetResult
 ├── field
 ├── values
 ├── valueCounts
 ├── otherCount
 ├── missingCount
 ├── countState
 └── dataBoundary
```

---

# Facet Limits

Facet value counts must be bounded.

High-cardinality fields such as Transaction description should not be ordinary facets.

---

# Selected Facet Preservation

Selected values may remain visible even when outside the top facet values.

---

# Facet Count Semantics

The Product must define whether each facet count represents:

- Current full Filter set.
- Filter set excluding the facet's own selection.
- another registered model.

---

# Autocomplete Architecture

Autocomplete may suggest:

- Resource names.
- Category names.
- Account names.
- registered Search phrases.
- exact identifiers where authorized.
- system Filter presets.

---

# Autocomplete Request

Recommended structure:

```text
AutocompleteRequest
 ├── resourceType
 ├── field
 ├── prefix
 ├── accountScope
 ├── maximumSuggestions
 ├── locale
 └── clientContext
```

---

# Autocomplete Minimum Prefix

Minimum prefix length should be defined per field.

---

# Autocomplete Authorization

Suggestions must be Owner-scoped and Authorization-filtered before response.

---

# Autocomplete Privacy

Autocomplete must not reveal:

- Another Owner's data.
- deleted private Resources.
- previous Owner Search history.
- Support-restricted fields.
- complete sensitive identifiers.
- values from unauthorized Accounts.

---

# Autocomplete Ranking

Ranking may use:

- Prefix quality.
- recent Owner use.
- active Resource state.
- system priority.
- locale.

Search history use must follow consent and retention policy.

---

# Search Suggestions

Suggestions generated from Owner activity should remain distinct from system presets.

---

# Query Validation

Every query must pass validation before execution.

---

# Query Validation Layers

Recommended:

```text
Schema Validation

↓

Resource Type Validation

↓

Field Validation

↓

Operator Validation

↓

Value Validation

↓

Owner and Account Validation

↓

Authorization Validation

↓

Complexity Validation

↓

Pagination Validation

↓

Execution Planning
```

---

# Query Validation Result

Recommended structure:

```text
QueryValidationResult
 ├── queryId
 ├── valid
 ├── errors
 ├── warnings
 ├── normalizedQuery
 ├── complexityScore
 ├── requiredChanges
 └── validatedAt
```

---

# Query Error Registry

Recommended controlled codes include:

```text
QUERY_SCHEMA_UNSUPPORTED

QUERY_RESOURCE_TYPE_UNSUPPORTED

QUERY_FIELD_NOT_SEARCHABLE

QUERY_FIELD_NOT_FILTERABLE

QUERY_FIELD_NOT_SORTABLE

QUERY_OPERATOR_UNSUPPORTED

QUERY_VALUE_INVALID

QUERY_AMOUNT_INVALID

QUERY_CURRENCY_REQUIRED

QUERY_CURRENCY_UNSUPPORTED

QUERY_DATE_INVALID

QUERY_TIME_ZONE_INVALID

QUERY_ACCOUNT_NOT_OWNER

QUERY_SCOPE_UNAUTHORIZED

QUERY_TOO_COMPLEX

QUERY_TOO_MANY_FILTERS

QUERY_TOO_MANY_SORT_FIELDS

QUERY_PAGE_SIZE_EXCEEDED

QUERY_CURSOR_INVALID

QUERY_CURSOR_EXPIRED

QUERY_CURSOR_OWNER_MISMATCH

QUERY_CURSOR_QUERY_MISMATCH

QUERY_PROJECTION_UNAUTHORIZED

QUERY_SAVED_VIEW_STALE

QUERY_FEATURE_DISABLED
```

---

# Query Warning Registry

Potential warnings include:

```text
QUERY_RESULTS_STALE

QUERY_RESULTS_PARTIAL

QUERY_INDEX_UPDATING

QUERY_TOTAL_COUNT_ESTIMATED

QUERY_LOCAL_REPLICA_ONLY

QUERY_MULTI_CURRENCY_GROUPED

QUERY_RELATIVE_PERIOD_RESOLVED

QUERY_SAVED_VIEW_MIGRATED

QUERY_UNAVAILABLE_FIELDS_OMITTED
```

---

# Query Complexity

A Query Complexity score may consider:

- Search tokens.
- Filter count.
- logical depth.
- OR branches.
- selected Accounts.
- date-range duration.
- Sort fields.
- facets.
- grouping.
- projection size.
- expected result volume.
- high-cost fields.

---

# Query Complexity Response

An excessive query should:

- Be rejected.
- or require narrower scope.
- or become an asynchronous Report or Export Job.
- or use a specialized endpoint.

It must not create uncontrolled database load.

---

# Query Timeouts

Timeouts should produce:

```text
Controlled failure

or

Partial result only when explicitly supported
```

A timeout must not be presented as an empty complete result.

---

# Query Cancellation

Long-running query operations may support cancellation.

Cancellation does not imply backend transaction rollback when no mutation occurs.

---

# Query Result States

Recommended:

```text
Loading

Succeeded

SucceededWithWarnings

Empty

Partial

Stale

Offline

IndexUpdating

Unavailable

Failed

Cancelled
```

---

# Empty Result

An Empty result means:

```text
The query completed successfully under the disclosed scope and boundary and found no authorized matching Resources.
```

It must remain distinct from:

- Failure.
- partial result.
- unavailable index.
- no local data while offline.
- unauthorized query.

---

# Partial Result

A Partial result must identify:

- Missing Resource Types.
- unavailable fields.
- unavailable Accounts.
- timed-out partitions.
- index lag.
- local-only limitation.
- count uncertainty.

---

# Saved Views Architecture

A Saved View preserves reusable query and presentation state.

Recommended structure:

```text
SavedView
 ├── savedViewId
 ├── ownerId
 ├── resourceType
 ├── name
 ├── description
 ├── querySchemaVersion
 ├── searchExpression
 ├── filters
 ├── sort
 ├── grouping
 ├── facets
 ├── columns
 ├── resultProjection
 ├── accountScope
 ├── currencyScope
 ├── timeZone
 ├── datePolicy
 ├── viewType
 ├── isDefault
 ├── resourceVersion
 ├── state
 ├── createdAt
 ├── updatedAt
 └── lastUsedAt
```

---

# Saved View Identifier

Recommended format:

```text
view_<sortable-unique-identifier>
```

---

# Saved View Types

Recommended:

```text
Personal

System

Administrative

Shared
```

`Shared` should remain disabled until separately governed.

---

# Personal View

A Personal View belongs to one canonical Owner.

---

# System View

A System View is provided by Nexio.

The Owner may use it but not change its canonical definition.

A personal copy may be created where supported.

---

# Administrative View

An Administrative View requires controlled authority and must not become visible to ordinary Owners.

---

# Shared View

A Shared View requires a separately approved collaboration model defining:

- Recipients.
- fields.
- Account scope.
- Authorization.
- revocation.
- ownership.
- audit.
- Privacy.

---

# Saved View States

Recommended:

```text
Active

Stale

Invalidated

Deprecated

Archived

Deleted
```

---

# Saved View Resource Version

Saved Views must use optimistic concurrency control.

---

# Saved View Name

Names should be:

- Owner-scoped.
- length-limited.
- safe.
- accessible.
- free from script execution.
- nonunique unless Product policy requires uniqueness.

---

# Saved View Description

Descriptions are optional Owner text and must remain inert.

---

# Saved View Query Snapshot

A Saved View should preserve structured query state rather than only a generated URL.

---

# Saved View Date Policy

Potential values:

```text
Relative

Fixed

InheritedDefault
```

---

# Saved View Account Scope

Potential models include:

```text
FixedSelectedAccounts

AllCurrentlyAuthorizedAccounts

AccountSelectedAtExecution
```

---

# Fixed Selected Accounts

The Saved View references explicit Accounts.

If an Account is later unavailable:

- Omit it with warning.
- invalidate the view.
- or require review according to policy.

---

# All Currently Authorized Accounts

The Account population resolves dynamically at execution.

The interface should disclose this behavior.

---

# Account Selected at Execution

The Saved View preserves all other query components but requires current Account selection.

---

# Saved View Authorization

Executing a Saved View must revalidate:

- Owner.
- Accounts.
- fields.
- Filters.
- projection.
- Resource Type.
- Feature availability.
- query schema.
- current Authorization.

---

# Saved View Staleness

A Saved View becomes stale when:

- A field is removed.
- an operator is retired.
- a Category or Account reference disappears.
- a query schema changes.
- a Feature is disabled.
- a Sort field becomes unavailable.
- a projection field is restricted.
- a relative-period policy changes.

---

# Saved View Migration

A stale Saved View may be migrated when:

- Meaning remains equivalent.
- new fields and operators are compatible.
- Owner scope remains unchanged.
- Account scope remains safe.
- the migration is versioned.
- the Owner receives warning where material.

---

# Saved View Invalidation

A Saved View must be invalidated when safe equivalent execution is impossible.

---

# Saved View Default

One default view may exist per:

```text
Owner

+

Resource Type

+

Platform scope where explicitly required
```

Cross-platform defaults should normally remain synchronized.

---

# Default View Conflict

Concurrent attempts to set different default views should use Resource-version validation.

---

# Saved View Deletion

Deletion should remove the active view while preserving required historical metadata.

---

# Saved View Duplication

Duplicating a view creates a new View ID and independent Resource version.

---

# Saved View Synchronization

Saved Views must synchronize through the canonical synchronization architecture.

---

# Offline Saved View Use

A Saved View may execute against the local replica when:

- Resource Type is offline-eligible.
- fields are available locally.
- Filters are supported locally.
- Sort is supported locally.
- freshness is disclosed.

---

# Offline Saved View Limitation

A local Saved View may omit:

- Server-only fields.
- Resources not synchronized.
- current Report-derived values.
- newly authorized Accounts.
- recently deleted Resources not yet synchronized.

---

# Saved View Export

Exporting a Saved View result must create an Export Job.

The Export must:

- Revalidate the view.
- resolve current scope.
- identify source boundary.
- use an approved Export schema.
- not rely only on currently loaded pages.
- preserve exact result membership.

---

# Search History Architecture

Search history is optional Product data.

Recommended structure:

```text
SearchHistoryEntry
 ├── searchHistoryEntryId
 ├── ownerId
 ├── resourceType
 ├── normalizedSearchText
 ├── safeDisplayText
 ├── filterSummary
 ├── platform
 ├── createdAt
 ├── lastUsedAt
 ├── useCount
 ├── expiresAt
 └── state
```

---

# Search History Identifier

Recommended format:

```text
shist_<sortable-unique-identifier>
```

---

# Search History States

Recommended:

```text
Active

Expired

Deleted

Suppressed
```

---

# Search History Minimization

Search history should not preserve:

- Complete sensitive identifiers.
- raw unrestricted queries.
- another Owner's data.
- query results.
- exact private result counts.
- authentication tokens.
- Download URLs.
- hidden administrative Filters.

---

# Search History Retention

Retention must be bounded.

Owners should be able to clear personal Search history where supported.

---

# Incognito Search Mode

An optional mode may prevent persistence of Search history.

It does not bypass Audit requirements for privileged administrative actions.

---

# Recent Searches

Recent Search suggestions may use:

- Owner history.
- local recent history.
- system presets.

Their origin should remain distinguishable where useful.

---

# Search History Owner Switching

On Owner switching:

- Clear active previous Owner suggestions.
- close previous Owner query Sessions.
- isolate stored history.
- prevent previous Owner Search text from appearing.

---

# Query Caching Architecture

Query caching may improve performance.

It must preserve:

- Owner scope.
- Authorization version.
- query hash.
- projection.
- data boundary.
- freshness.
- expiration.
- invalidation.
- environment.

---

# Query Cache Key

Recommended conceptual key:

```text
environment

+

ownerId

+

authorizationScopeVersion

+

queryHash

+

projectionVersion

+

dataBoundary
```

---

# Query Cache Restrictions

Caches must not:

- Mix Owners.
- reuse administrative results for ordinary Owners.
- reuse broader projections for narrower Roles.
- survive Privacy deletion incorrectly.
- return expired download authority.
- present stale financial data as current.
- ignore Resource deletion.
- ignore Account-access changes.

---

# Query Cache Invalidation

Potential invalidation Events include:

- Resource create.
- Resource update.
- Resource delete.
- Account-access change.
- Authorization change.
- Owner switch.
- field-policy change.
- query schema change.
- Search-index rebuild.
- Privacy deletion.
- financial recalculation.
- saved-view change.

---

# Local Query Cache

Android and Web may maintain local result caches.

They remain subordinate to the Owner-scoped local replica and canonical backend.

---

# Search Index Architecture

Search indexes are derived query structures.

They must not become canonical Resource stores.

---

# Search Index Document

Recommended structure:

```text
SearchIndexDocument
 ├── indexDocumentId
 ├── ownerId
 ├── accountId
 ├── resourceType
 ├── resourceId
 ├── resourceVersion
 ├── indexSchemaVersion
 ├── searchableFields
 ├── filterFields
 ├── sortFields
 ├── projectionFields
 ├── synchronizationSequence
 ├── indexedAt
 └── deletionState
```

---

# Search Index Identifier

Recommended format:

```text
sidx_<sortable-unique-identifier>
```

---

# Search Index Authority

A Search index may identify candidate Resources.

The canonical backend must still enforce:

- Authentication.
- Authorization.
- Owner scope.
- Account scope.
- Resource state.
- returnable fields.

---

# Index Owner Partition

Every index document must preserve Owner scope.

---

# Index Account Scope

Account-scoped Resources must preserve Account identity.

---

# Index Resource Version

Index documents should preserve the canonical Resource version.

---

# Index Lag

Index lag must be measurable.

Potential state:

```text
Current

NearCurrent

Lagging

Rebuilding

Unavailable
```

---

# Index Deletion

Deleted or inaccessible Resources must be removed or Tombstoned in the index.

---

# Index Rebuild

A Search-index rebuild must:

- Preserve Owner isolation.
- use canonical sources.
- preserve Resource versions.
- preserve deletion state.
- validate counts.
- support dual-index cutover where appropriate.
- prevent mixed-schema result pages.

---

# Index Rebuild Result

Recommended structure:

```text
SearchIndexRebuild
 ├── rebuildId
 ├── indexType
 ├── sourceBoundary
 ├── schemaVersion
 ├── expectedDocumentCount
 ├── indexedDocumentCount
 ├── rejectedDocumentCount
 ├── ownerPartitionValidation
 ├── state
 ├── startedAt
 └── completedAt
```

---

# Index Rebuild Identifier

Recommended format:

```text
srebuild_<sortable-unique-identifier>
```

---

# Index Rebuild States

Recommended:

```text
Planned

Building

Validating

ReadyForCutover

Active

Failed

RolledBack

Retired
```

---

# Index Cutover

Cutover should preserve:

- Query schema compatibility.
- cursor compatibility or invalidation.
- Owner isolation.
- result-count validation.
- deletion state.
- rollback.

---

# Index Cursor Compatibility

A cursor from one index generation should not be applied to an incompatible generation.

---

# Search Index Failure

When the index is unavailable:

- Use approved canonical database fallback where safe.
- provide limited Search.
- disclose unavailable capabilities.
- avoid presenting an empty result as complete.
- preserve exact Filters.
- monitor recovery.

---

# Search Index Privacy

The index should include only fields required for approved query behavior.

---

# Search Index Encryption

Search indexes containing private financial data require approved protection at rest and in transit.

---

# Search Index Logging

Logs should avoid complete indexed private values.

Prefer:

```text
Query ID

Owner-safe reference

Resource Type

index generation

Search mode

token count

result count category

latency

safe error code
```

---

# Initial Search and Query Acceptance Criteria

The initial Search, Filtering, Sorting, Pagination and Saved Views architecture is accepted only when:

1. Every query is authenticated where private Resources are involved.

2. Every query resolves canonical Owner server-side.

3. Every query validates Account scope.

4. Search does not grant access.

5. Search-index membership does not grant access.

6. Saved View membership does not grant access.

7. Local-replica membership does not grant access.

8. Unauthorized Resources do not affect result counts.

9. Unauthorized Resources do not affect facet counts.

10. Unauthorized Resources do not appear in autocomplete.

11. Cross-Owner Search exposure is Critical.

12. Every canonical query has a stable Query ID.

13. Every canonical query identifies query-schema version.

14. Every canonical query identifies Resource Type.

15. Every canonical query identifies Account scope.

16. Every canonical query identifies Search Expression.

17. Every canonical query identifies Filters.

18. Every canonical query identifies Sort.

19. Every canonical query identifies result projection.

20. Every canonical query identifies pagination mode.

21. Every canonical query identifies locale.

22. Every canonical query identifies time zone where applicable.

23. Every canonical query identifies currency scope where applicable.

24. Every canonical query identifies data boundary.

25. Client context does not grant authority.

26. Every searchable field is registered.

27. Every filterable field is registered.

28. Every sortable field is registered.

29. Every groupable field is registered.

30. Every facetable field is registered.

31. Every returnable field is registered.

32. Every offline-eligible field is registered.

33. Query field classifications are documented.

34. Searchable does not automatically mean returnable.

35. Filterable does not automatically mean facetable.

36. Every operator is registered by data Type.

37. Unsupported field and operator combinations are rejected.

38. Search remains distinct from Filtering.

39. Exact Search remains distinct from partial Search.

40. Identifier Search uses exact matching.

41. Partial identifier enumeration is prohibited by default.

42. Text Search input length is bounded.

43. Search token count is bounded.

44. Special characters remain inert.

45. Search input cannot become SQL.

46. Search input cannot become unrestricted regular expressions.

47. Search input cannot become shell expressions.

48. Search input cannot become script.

49. Wildcard behavior is controlled.

50. Case behavior is documented.

51. accent behavior is documented.

52. Accent-insensitive Search does not change canonical text.

53. pt-BR text Search preserves accented canonical names.

54. Stemming is versioned where used.

55. Stemming does not alter identifiers.

56. Stop-word behavior is explicit.

57. Phrase Search preserves token order where supported.

58. Prefix Search uses bounded minimum length.

59. relevance ranking has a version.

60. relevance ranking uses stable tie-breakers.

61. Ranking does not alter Authorization.

62. Identifier formats are validated.

63. Inaccessible identifiers do not reveal existence.

64. Money Filters use exact decimal values.

65. Money Filters use explicit currency.

66. Binary floating-point is not authoritative.

67. R$ 1.250,45 normalizes to exact BRL 1250.45 under confirmed pt-BR rules.

68. Money equality requires compatible currency.

69. Money ranges preserve inclusive and exclusive boundaries.

70. Multi-currency ranges remain separate.

71. BRL and USD values are not compared as equivalent units.

72. Financial direction remains distinct from sign.

73. Amount sign is not applied twice.

74. Excess monetary precision follows financial policy.

75. Date Filters identify date Type.

76. Date-only Filters remain calendar dates.

77. Timestamp Filters identify time zone or offset.

78. Device time zone does not override saved query time zone silently.

79. Relative periods resolve against server-trusted time.

80. Relative periods identify calendar policy.

81. Week start is defined.

82. Fixed periods remain distinct from relative periods.

83. Daylight-saving boundaries are tested.

84. Null remains distinct from empty.

85. Empty remains distinct from zero.

86. Empty remains distinct from false.

87. `NotEquals` null behavior is explicit.

88. collection operators are typed.

89. Filter logic depth is bounded.

90. OR branch count is bounded.

91. Filter count is bounded.

92. Different ordinary fields use explicit conjunction semantics.

93. Multiple values within one field use explicit disjunction semantics.

94. Obvious contradictory Filters produce controlled behavior.

95. System Filter presets are versioned.

96. Every Sort field is registered.

97. Sort direction is controlled.

98. Null placement is explicit.

99. text Sort collation is explicit.

100. financial Sort across currencies is explicit.

101. Multi-currency financial Sort does not compare incompatible units directly.

102. every Resource Type has a stable default Sort.

103. every Sort has a unique tie-breaker.

104. changing Sort invalidates the cursor.

105. Cursor pagination is preferred for large mutable datasets.

106. Offset pagination is restricted to approved cases.

107. Every query cursor has a stable identifier.

108. Query cursors are Owner-bound.

109. Query cursors are Resource-Type-bound.

110. Query cursors are query-bound.

111. Query cursors are Filter-bound.

112. Query cursors are Sort-bound.

113. Query cursors are environment-bound.

114. Query cursors are integrity-protected.

115. Query cursors expire.

116. Query cursors do not grant Authorization.

117. Cross-Owner cursor reuse is rejected.

118. Cursor reuse with different Filters is rejected.

119. Cursor reuse with different Sort is rejected.

120. Cursor reuse with incompatible query schema is rejected.

121. Page size is bounded.

122. Page responses identify item count.

123. Page responses identify `hasMore`.

124. Page responses identify freshness.

125. Page responses preserve data boundary.

126. Total counts identify whether they are Exact or Estimated.

127. Estimated counts are labeled.

128. Restricted counts do not create enumeration leaks.

129. Empty result remains distinct from failure.

130. Empty result remains distinct from partial result.

131. Timeout is not presented as empty complete result.

132. Mutable dataset pagination uses a registered consistency model.

133. Snapshot-bound pagination preserves one boundary.

134. Best-effort pagination discloses possible change.

135. Sequence-bound pagination preserves sequence scope.

136. Infinite scroll uses cursor pagination.

137. Infinite scroll announces loading accessibly.

138. Infinite scroll announces end of results.

139. local pagination discloses possible server-only results.

140. Result projections minimize fields.

141. Result projections enforce field-level Authorization.

142. Summary projection remains distinct from detail projection.

143. relationship expansion is bounded.

144. derived result fields identify calculation and freshness.

145. Search highlights escape HTML.

146. Search highlights expose only returnable fields.

147. Search snippets expose only returnable fields.

148. Group counts use the same Authorization as results.

149. Group counts use the same data boundary as results.

150. Grouped financial totals use approved Calculation or Reporting logic.

151. Facet fields are registered.

152. Facet value counts are bounded.

153. High-cardinality private text is not an ordinary facet.

154. Selected facet values can remain visible.

155. Facet count semantics are documented.

156. Autocomplete is Owner-scoped.

157. Autocomplete is Authorization-filtered.

158. Autocomplete minimum prefix length is defined.

159. Autocomplete does not expose previous Owner data.

160. Autocomplete does not expose deleted private Resources.

161. Autocomplete does not expose complete sensitive identifiers.

162. Query validation occurs before execution.

163. Query fields are validated.

164. Query operators are validated.

165. Query values are validated.

166. Query Owner and Account scope are validated.

167. Query complexity is validated.

168. Query pagination is validated.

169. Query errors use controlled codes.

170. Query warnings use controlled codes.

171. Excessive query complexity is rejected or redirected to an asynchronous capability.

172. Query timeouts use controlled failure or explicit partial state.

173. Query cancellation is controlled.

174. Query result states are controlled.

175. Partial results identify missing scope.

176. Stale results identify freshness.

177. Local-only results identify offline limitation.

178. Every Saved View has a stable identifier.

179. Every Saved View belongs to one canonical Owner or registered system scope.

180. Every Saved View identifies Resource Type.

181. Every Saved View identifies query-schema version.

182. Every Saved View preserves Filters.

183. Every Saved View preserves Sort.

184. Every Saved View preserves columns.

185. Every Saved View preserves Account scope behavior.

186. Every Saved View preserves time zone.

187. Every Saved View preserves date policy.

188. Personal and System Views remain distinct.

189. Shared Views remain disabled until separately governed.

190. Saved Views use Resource-version concurrency control.

191. Saved View execution revalidates Authorization.

192. Saved View execution revalidates Accounts.

193. Saved View execution revalidates fields.

194. Saved View execution revalidates operators.

195. Saved View execution revalidates Feature availability.

196. relative-period Saved Views resolve dynamically.

197. fixed-period Saved Views preserve fixed dates.

198. Saved View Account scope behavior is explicit.

199. unavailable fixed Accounts produce warning or invalidation.

200. stale Saved Views are detected.

201. compatible Saved Views may migrate through a versioned process.

202. incompatible Saved Views are invalidated.

203. one default view policy is defined.

204. default-view conflicts use Resource-version validation.

205. Saved View duplication creates a new View ID.

206. Saved View synchronization uses canonical synchronization.

207. Offline Saved View execution is limited to local eligible fields.

208. Offline Saved Views disclose freshness.

209. Export from Saved View creates an Export Job.

210. Export from Saved View does not export only loaded pages.

211. Search history is Owner-scoped.

212. Search history retention is bounded.

213. Search history does not preserve authentication tokens.

214. Search history does not preserve Export download URLs.

215. Search history does not preserve another Owner's data.

216. Owners may clear personal Search history where supported.

217. Owner switching clears previous Owner suggestions.

218. Query caches are Owner-bound.

219. Query caches are Authorization-version-bound.

220. Query caches are query-bound.

221. Query caches are projection-bound.

222. Query caches are data-boundary-aware.

223. Query caches do not mix administrative and Owner results.

224. Query caches respond to Privacy deletion.

225. Query caches respond to Account-access changes.

226. Search indexes remain derived structures.

227. Search index documents preserve Owner scope.

228. Search index documents preserve Account scope.

229. Search index documents preserve Resource identity.

230. Search index documents preserve Resource version.

231. Search index documents preserve index-schema version.

232. Search index documents preserve deletion state.

233. Search-index candidates undergo canonical Authorization.

234. Search-index lag is measurable.

235. Index lag is disclosed where material.

236. deleted Resources are removed or Tombstoned in the index.

237. index rebuilds use canonical sources.

238. index rebuilds preserve Owner isolation.

239. index rebuilds validate document counts.

240. index cutover preserves query compatibility.

241. incompatible index cursors are rejected.

242. index failure does not appear as an empty complete result.

243. index fallback behavior is registered.

244. Search indexes minimize private fields.

245. Search-index logs minimize private values.

246. every query lifecycle remains traceable through Query ID.

247. every result page remains traceable to its canonical query and cursor.

248. every Saved View remains traceable to its versioned query definition.

249. every Search-index result remains subordinate to canonical Authorization.

250. every Search, Filter, Sort and pagination lifecycle remains independently reconstructable.

---

# Foundational Search and Query Rule

A Search result is not authorized merely because it matches.

A Filter is not correct merely because it returns expected-looking records.

A Sort is not stable merely because the first page appears ordered.

A cursor is not valid merely because it can be decoded.

A result count is not safe merely because it does not display Resource details.

A Saved View is not permanently authorized merely because it was created by an authorized Owner.

A Search index is not canonical merely because it answers faster than the database.

A query lifecycle is trustworthy only when Nexio can establish:

```text
The authenticated Actor

The canonical Owner

The Account and Resource scope

The registered searchable and returnable fields

The typed Search and Filter operators

The exact monetary and currency semantics

The date and time-zone semantics

The stable total ordering

The cursor and data boundary

The result projection

The freshness state

The Saved View and query versions

The Authorization decision

The Evidence required to reconstruct the result
```

When Owner scope, Account scope, field eligibility, money, currency, time zone, data boundary, cursor integrity, index freshness, result projection or Saved View compatibility cannot be established, Nexio must prefer the action that:

- Rejects the query.
- narrows the scope.
- removes unauthorized fields.
- requires explicit currency.
- requires explicit date interpretation.
- invalidates the cursor.
- restarts pagination.
- marks results stale or partial.
- disables unavailable Search behavior.
- invalidates the Saved View.
- uses a canonical fallback.
- blocks Export.
- opens a Security, Privacy, financial-integrity or operational Incident.
- blocks the release.

Nexio must never:

- Search one Owner's Resources under another Owner.
- expose another Owner through counts or facets.
- trust an Account scope from the client.
- compare incompatible currencies as equal units.
- use binary floating-point for authoritative money Filters.
- allow unstable Sort without a tie-breaker.
- reuse a cursor for another query.
- present an index outage as an empty result.
- preserve previous Owner Search suggestions after switching.
- allow a Saved View to bypass current Authorization.
- export only currently loaded pages while claiming a complete query Export.
- allow unrestricted regular expressions or query-language injection.
- treat Search relevance as financial authority.


# Query Execution, Indexing and Cross-Platform Search Architecture

Query execution transforms a validated Canonical Query into an authorized, deterministic and freshness-aware result.

The recommended execution architecture is:

```text
Authenticated Query Request

↓

Canonical Owner Resolution

↓

Query Schema Validation

↓

Field and Operator Validation

↓

Account and Resource Scope Validation

↓

Authorization and Projection Resolution

↓

Query Normalization

↓

Complexity Evaluation

↓

Execution-Source Selection

↓

Database or Search-Index Planning

↓

Stable Ordering and Pagination Planning

↓

Bounded Execution

↓

Canonical Resource Revalidation

↓

Result Projection

↓

Count and Facet Calculation

↓

Freshness and Boundary Attribution

↓

Query Page Response
```

---

# Query Execution Coordinator

Every backend query should be managed by a governed Query Execution Coordinator.

The coordinator is responsible for:

- Resolving the canonical Owner.
- validating Account scope.
- validating Resource Type.
- validating searchable, filterable, sortable and returnable fields.
- validating operators.
- validating values.
- resolving query policy versions.
- resolving Authorization.
- selecting the execution source.
- enforcing query complexity.
- planning stable ordering.
- validating pagination cursors.
- enforcing timeouts.
- minimizing result fields.
- verifying canonical Resource access.
- assigning freshness and data boundaries.
- producing safe metrics and Evidence.

---

# Query Execution State

Recommended states:

```text
Received

Authenticating

Validating

Normalizing

Authorizing

Planning

Executing

Projecting

Counting

Finalizing

Completed

CompletedWithWarnings

PartiallyCompleted

Rejected

Failed

Cancelled
```

---

# Query Execution Record

Recommended structure:

```text
QueryExecution
 ├── queryExecutionId
 ├── queryId
 ├── ownerId
 ├── actorId
 ├── resourceType
 ├── querySchemaVersion
 ├── queryHash
 ├── executionSource
 ├── authorizationScopeVersion
 ├── dataBoundary
 ├── indexGeneration
 ├── executionPlanReference
 ├── resultCount
 ├── resultState
 ├── startedAt
 ├── completedAt
 ├── latency
 ├── safeErrorCode
 └── traceReference
```

---

# Query Execution Identifier

Recommended format:

```text
qexec_<sortable-unique-identifier>
```

---

# Query Normalization Architecture

Query normalization converts client query state into one canonical typed representation.

Recommended flow:

```text
Validate query schema.

↓

Resolve field aliases.

↓

Resolve operator aliases.

↓

Normalize text Search.

↓

Normalize identifiers.

↓

Normalize money.

↓

Normalize currencies.

↓

Normalize dates and time zones.

↓

Normalize logical groups.

↓

Normalize Sort.

↓

Normalize projection.

↓

Generate canonical query hash.
```

---

# Query Normalization Result

Recommended structure:

```text
QueryNormalizationResult
 ├── normalizationResultId
 ├── queryId
 ├── normalizedSearchExpression
 ├── normalizedFilters
 ├── normalizedSort
 ├── normalizedGrouping
 ├── normalizedProjection
 ├── queryHash
 ├── warnings
 ├── normalizationVersions
 └── normalizedAt
```

---

# Query Normalization Identifier

Recommended format:

```text
qnorm_<sortable-unique-identifier>
```

---

# Query Hash Stability

The same logical query should generate the same query hash under the same:

- Query schema version.
- normalization versions.
- Owner-safe scope.
- Account scope.
- Filter semantics.
- Sort semantics.
- projection.
- data-boundary policy.

Client formatting differences should not change the hash.

Examples:

```text
" Alimentação "

and

"alimentação"
```

may normalize to the same ordinary case-insensitive Search term.

---

# Query Hash Security

A query hash must not contain reversible private Search text when stored in ordinary telemetry.

Where query hash derivation uses private values, an approved keyed or nonreversible hashing strategy should be used.

---

# Query Planning Architecture

The Query Planner selects the safest approved execution method.

Potential execution sources include:

```text
Canonical Database

Search Index

Canonical Read Model

Report Snapshot

Local Replica

Hybrid Index and Database

Specialized Query Service
```

---

# Execution Source Selection

The planner should consider:

- Resource Type.
- Search Expression.
- Filters.
- Sort.
- projection.
- facets.
- count requirements.
- data-boundary requirements.
- Search-index freshness.
- query complexity.
- current availability.
- Authorization requirements.
- offline state.

---

# Canonical Database Execution

The canonical database may be preferred for:

- Exact identifier lookup.
- exact financial Filters.
- current Resource state.
- strict Authorization.
- small bounded Account queries.
- current-version conflict review.
- reconciliation-sensitive queries.
- Search-index fallback.

---

# Search Index Execution

The Search index may be preferred for:

- Free-text Search.
- prefix Search.
- phrase Search.
- relevance ranking.
- bounded facets.
- large Resource collections.

---

# Hybrid Index and Database Execution

A hybrid query may:

```text
Use the Search index to identify candidate Resource IDs.

↓

Retrieve candidate Resources from canonical storage.

↓

Revalidate Owner, Account and Authorization.

↓

Apply current Resource state.

↓

Apply final projection.

↓

Return results.
```

---

# Hybrid Candidate Limit

The number of candidate IDs retrieved from the index must be bounded.

A query requiring excessive candidate hydration should be:

- Narrowed.
- rejected.
- converted into an asynchronous Report.
- or handled through a specialized approved query.

---

# Candidate Revalidation

Canonical revalidation must verify:

- Resource still exists.
- Resource belongs to the Owner.
- Account remains authorized.
- Resource state remains eligible.
- Resource version remains compatible.
- returnable fields remain authorized.

---

# Candidate Removal

A Search-index candidate may be removed from the final result when:

- Deleted.
- archived and excluded.
- Owner scope changed.
- Account access changed.
- Authorization changed.
- canonical state no longer matches.
- Resource version is invalid.
- Privacy deletion occurred.

---

# Candidate Removal and Counts

Final result counts must be based on authorized eligible results.

Index candidate counts must not be presented as exact final counts when canonical revalidation removes Resources.

---

# Query Planner Record

Recommended structure:

```text
QueryExecutionPlan
 ├── queryExecutionPlanId
 ├── queryId
 ├── executionSource
 ├── databasePredicates
 ├── indexPredicates
 ├── canonicalRevalidationRequired
 ├── sortPlan
 ├── paginationPlan
 ├── countPlan
 ├── facetPlan
 ├── estimatedCost
 ├── complexityScore
 ├── timeoutPolicy
 ├── fallbackPolicy
 └── createdAt
```

---

# Query Execution Plan Identifier

Recommended format:

```text
qplan_<sortable-unique-identifier>
```

---

# Execution Plan Privacy

Execution Plans must not be exposed directly to ordinary Owners when they reveal:

- Database structure.
- Security predicates.
- index internals.
- hidden fields.
- authorization logic.
- other Owner partitions.

---

# Database Query Architecture

Database queries must use:

- Parameterized predicates.
- explicit Owner predicates.
- explicit Account predicates.
- approved fields.
- approved operators.
- bounded joins.
- stable Sort.
- bounded page size.
- query timeout.
- cancellation where supported.

---

# Parameterization

Owner-entered values must never be concatenated into raw SQL.

---

# Owner Predicate

Every private Resource query must include an enforceable canonical Owner predicate or an equivalent secure partition boundary.

---

# Account Predicate

When Account scope applies, every selected Account must be validated before entering the query plan.

---

# Database Join Governance

Joins must be registered or generated through approved relationships.

Unbounded arbitrary joins are prohibited.

---

# Relationship Query

A relationship query may filter:

```text
Transactions belonging to selected Accounts.

Goals with Contributions in a period.

Budgets covering selected Categories.

Notifications linked to one Resource Type.
```

Relationship access must preserve Owner scope on every joined Resource.

---

# Join Multiplication

The planner must avoid duplicate Resources caused by one-to-many joins.

Potential strategies include:

- `EXISTS`.
- distinct canonical identifiers.
- preaggregated relationship tables.
- bounded subqueries.

---

# Distinct and Pagination

Using `DISTINCT` with pagination must preserve stable ordering.

The planner must not apply pagination before deduplication when that would omit or duplicate logical Resources.

---

# Database Index Governance

Database indexes should support:

- Owner predicates.
- Account predicates.
- Resource state.
- common date Sort.
- exact identifiers.
- registered Filter combinations.
- stable cursor predicates.

Index creation must remain governed by Database Operations.

---

# Query Statistics

Database statistics should remain current enough to prevent unsafe execution plans.

---

# Query Timeout Policy

Timeouts may vary by query category.

Potential categories:

```text
InteractiveSimple

InteractiveSearch

InteractiveFacet

AdministrativeBounded

AsynchronousExport

AsynchronousReport
```

---

# Interactive Query Timeout

An interactive query should fail within a bounded interval rather than hold resources indefinitely.

---

# Timeout Result

A timeout must produce:

```text
Failed

or

Partial
```

only when partial execution is registered and disclosed.

It must not produce:

```text
Empty
```

---

# Query Cancellation Token

A request may use a cancellation reference.

Recommended structure:

```text
QueryCancellation
 ├── cancellationId
 ├── queryExecutionId
 ├── ownerId
 ├── actorId
 ├── requestedAt
 ├── completedAt
 └── result
```

---

# Database Result Stability

Stable cursor pagination should use predicates derived from the last returned Sort values.

Example descending Sort:

```text
effectiveDate < lastEffectiveDate

OR

(
  effectiveDate = lastEffectiveDate
  AND canonicalCreationSequence < lastCreationSequence
)

OR

(
  effectiveDate = lastEffectiveDate
  AND canonicalCreationSequence = lastCreationSequence
  AND transactionId < lastTransactionId
)
```

The exact comparison direction must match the selected Sort.

---

# Null Cursor Predicates

Null placement must be incorporated explicitly into cursor predicates.

---

# Search Index Execution Architecture

Search Index execution should preserve:

- Owner partition.
- Account Filter.
- Resource Type.
- searchable fields.
- filterable fields.
- Sort fields.
- index generation.
- Resource version.
- deletion state.
- data boundary.

---

# Search Index Query

Recommended conceptual structure:

```text
SearchIndexQuery
 ├── indexAlias
 ├── indexGeneration
 ├── ownerFilter
 ├── accountFilter
 ├── resourceTypeFilter
 ├── textQuery
 ├── typedFilters
 ├── sort
 ├── searchAfterValues
 ├── pageSize
 ├── projection
 ├── facetRequests
 └── timeout
```

---

# Search-After Pagination

Search-index pagination should use an approved search-after model when stable.

The cursor should preserve:

- Index generation.
- query hash.
- Sort values.
- Resource ID.
- data boundary.
- expiration.

---

# Index Generation

Every active Search index should have a generation identifier.

Recommended format:

```text
idxgen_<sortable-unique-identifier>
```

---

# Index Alias

A stable alias may point to the active generation.

Cursors must preserve the concrete generation or be invalidated at incompatible cutover.

---

# Index Generation State

Recommended:

```text
Building

Validating

Active

Draining

Failed

Retired
```

---

# Index Document Projection

The index should contain only fields required for:

- Search.
- Filtering.
- Sort.
- facets.
- safe snippets.
- canonical candidate lookup.

It should not duplicate unrestricted Resource detail.

---

# Index Tokenization

Tokenization policies should be versioned per field.

Potential policies include:

```text
pt-BR General Text

Exact Keyword

Normalized Identifier

Prefix Search

Phrase Search

Accent-Insensitive Projection
```

---

# Index Analyzer Version

Every indexed field should identify an analyzer or normalization version where applicable.

---

# Index Analyzer Migration

Changing tokenization or accent behavior requires:

- New index generation.
- shadow comparison.
- relevance review.
- result-set review.
- cursor cutover policy.
- rollback.

---

# Search Index Ranking

Potential ranking factors include:

```text
Exact normalized match

Exact phrase match

Prefix match

Field priority

Active Resource state

Recency

Owner usage signal
```

Owner usage signals must remain Privacy-governed.

---

# Ranking Tie-Breaker

Relevance rank must be followed by stable canonical tie-breakers.

Example:

```text
relevanceScore descending

then

resourceType ascending

then

resourceId ascending
```

---

# Score Precision

Search scores should not become financial or Product authority.

Small score changes may reorder equivalent relevance results.

---

# Search Index Update Architecture

Canonical changes should update the Search index through an idempotent publication path.

Recommended flow:

```text
Canonical Resource commits.

↓

Synchronization or Search outbox Event is created.

↓

Index worker reads the Event.

↓

Current canonical Resource is retrieved.

↓

Authorized index projection is produced.

↓

Index document is upserted or deleted.

↓

Index publication state is recorded.
```

---

# Search Index Update Record

Recommended structure:

```text
SearchIndexUpdate
 ├── indexUpdateId
 ├── resourceType
 ├── resourceId
 ├── ownerId
 ├── accountId
 ├── resourceVersion
 ├── synchronizationSequence
 ├── indexGeneration
 ├── operationType
 ├── state
 ├── attemptCount
 ├── createdAt
 └── completedAt
```

---

# Index Update Identifier

Recommended format:

```text
sidxupd_<sortable-unique-identifier>
```

---

# Index Update Operations

Recommended:

```text
Create

Upsert

Delete

Tombstone

Reindex
```

---

# Index Update Idempotency

Repeated delivery of one index update must not create duplicate logical documents.

---

# Out-of-Order Index Updates

An older Resource version must not overwrite a newer indexed version.

---

# Index Update Version Check

The index worker should compare:

```text
incomingResourceVersion

against

indexedResourceVersion
```

and reject stale publication.

---

# Deleted Resource Indexing

Deletion should produce:

- Document deletion.
- or an approved Tombstone document with no searchable private content.

---

# Index Update Retry

Retry must preserve:

- Resource identity.
- Resource version.
- index generation.
- operation Type.
- attempt count.
- final state.

---

# Index Dead-Letter Handling

Failed final index updates should enter a controlled repair process.

They must not remain unnoticed while results are presented as Current.

---

# Index Freshness Architecture

Recommended metadata:

```text
lastCanonicalSequenceAvailable

lastIndexedSequence

indexLagCount

indexLagDuration

indexState

rebuildState
```

---

# Index Freshness States

Recommended:

```text
Current

NearCurrent

Lagging

SeverelyLagging

Rebuilding

Unavailable

IntegrityFailed
```

---

# Query Freshness Attribution

A Search response should consider:

- Index state.
- index sequence.
- canonical revalidation.
- query data boundary.
- unavailable partitions.
- local-replica state.

---

# Current Search Result

A Search result may be labeled Current only when:

- Index freshness meets policy.
- canonical Authorization succeeds.
- canonical candidate state is verified where required.
- no required partition is unavailable.
- data boundary is valid.

---

# Lagging Search Result

A lagging index result should disclose that recent changes may be missing.

---

# Canonical Fallback

A canonical database fallback may be used when:

- Query fields support it.
- result volume is bounded.
- current Search is required.
- Security policy permits it.
- performance policy permits it.

---

# Fallback Limitations

Fallback may not support:

- relevance ranking.
- phrase Search.
- advanced token Search.
- large facets.
- full global Search.

The interface must disclose unavailable behavior.

---

# Index Integrity Verification

Index verification should compare:

- Owner document counts.
- Resource-Type counts.
- deletion counts.
- sampled Resource versions.
- Account distribution.
- canonical sequence.
- field projection.
- cross-Owner partition checks.

---

# Index Integrity State

Recommended:

```text
Verified

VerificationPending

Degraded

Failed

Rebuilding
```

---

# Index Integrity Failure

On integrity failure:

- Stop affected index queries.
- prevent Current labeling.
- use safe fallback where available.
- invalidate affected cursors.
- preserve Evidence.
- begin repair or rebuild.
- open an Incident where scope requires it.

---

# Index Rebuild Architecture

Recommended rebuild flow:

```text
Create new index generation.

↓

Load active schema and analyzers.

↓

Read canonical Resources at a controlled boundary.

↓

Generate Owner-scoped documents.

↓

Validate Resource versions and deletion state.

↓

Compare counts and samples.

↓

Run shadow queries.

↓

Approve cutover.

↓

Switch alias.

↓

Invalidate incompatible cursors.

↓

Monitor.

↓

Retire old generation.
```

---

# Rebuild Source Boundary

A rebuild must identify one canonical source boundary.

Changes after the initial boundary must be captured through:

- Incremental replay.
- dual publication.
- final catch-up.
- another approved model.

---

# Rebuild Owner Partition Verification

Verification should include:

```text
No document without Owner scope.

No document in the wrong Owner partition.

No Account outside the document Owner.

No duplicate logical Resource document.

No deleted Resource indexed as Active.

No unsupported private field indexed.
```

---

# Shadow Query

Shadow queries may compare old and new generations without returning the new result to the Owner.

Compare:

- Result membership.
- ranking.
- counts.
- facets.
- latency.
- authorization filtering.
- pt-BR accent behavior.
- money and date Filters.

---

# Shadow Query Privacy

Shadow execution must not create duplicate Search-history entries or Analytics Events.

---

# Index Cutover Gate

```text
□ Schema is active.

□ Analyzer versions are approved.

□ Owner partition verification passed.

□ Resource count verification passed.

□ deletion verification passed.

□ Resource-version samples passed.

□ shadow query differences are approved.

□ cursor policy is defined.

□ rollback is available.

□ monitoring is active.
```

---

# Index Rollback

Rollback should restore the previous active generation when safe.

Cursors issued against the failed generation should be invalidated.

---

# Index Retention

Retired index generations should be destroyed after:

- Rollback window.
- Incident needs.
- migration verification.
- Privacy requirements.
- storage policy.

---

# Cross-Platform Query Architecture

Android and Web must use the same canonical backend query contract.

Platform differences may exist in:

- Interface layout.
- local storage.
- offline behavior.
- interaction patterns.
- page size.
- presentation.
- background refresh.

They must not change logical query meaning.

---

# Shared Cross-Platform Query Contract

Both platforms should support equivalent concepts:

```text
Resource Type

Search Expression

Typed Filters

Sort

Account Scope

Date Policy

Currency Scope

Projection

Pagination Cursor

Saved View

Freshness

Warnings
```

---

# Platform Query Adapter

Each Platform may use an adapter that converts presentation state into the Canonical Query.

Recommended operations:

```text
buildCanonicalQuery()

validateLocalInput()

executeRemoteQuery()

executeLocalQuery()

applyQueryPage()

loadNextPage()

refreshQuery()

saveView()

updateView()

deleteView()

clearSearchHistory()
```

---

# Android Query Architecture

Recommended architecture:

```text
Android Search UI

↓

ViewModel

↓

Query State Reducer

↓

Canonical Query Adapter

↓

Owner-Scoped Repository

↓

Remote Query API or Local Database

↓

Paged Result Store

↓

Accessible Presentation
```

---

# Android Query State

Recommended structure:

```text
AndroidQueryState
 ├── ownerId
 ├── resourceType
 ├── searchText
 ├── activeFilters
 ├── sort
 ├── accountScope
 ├── currencyScope
 ├── datePolicy
 ├── currentCursor
 ├── loadedItems
 ├── resultState
 ├── freshness
 ├── warnings
 └── savedViewReference
```

---

# Android Process Recreation

Query state should survive ordinary Android process recreation where Product behavior requires it.

It must not restore another Owner's active query after Account switching.

---

# Android Query State Persistence

Potentially persistable state includes:

- Resource Type.
- Search text according to Privacy policy.
- Filters.
- Sort.
- selected Saved View.
- scroll position.
- page cursor where valid.

---

# Android Cursor Restoration

A persisted cursor should be revalidated before reuse.

It should be discarded when:

- Owner changed.
- Application version is incompatible.
- query changed.
- cursor expired.
- local data boundary changed.
- index generation changed incompatibly.

---

# Android Local Search

Android may query the Owner-scoped local database when offline.

The local engine must implement compatible semantics for supported fields.

---

# Android Local Query Capability Registry

Recommended fields:

```text
localQueryCapabilityId

resourceType

searchableFields

filterableFields

sortableFields

supportedOperators

maximumResultCount

savedViewSupport

owner

version
```

---

# Android Local Query Limitations

Potential limitations include:

- No relevance ranking.
- no server-only derived fields.
- no global cross-Resource Search.
- incomplete historical data.
- stale Categories.
- unavailable facets.
- limited count precision.

These limitations must be disclosed.

---

# Android Local Money Filter

Local money Filters must use the same exact representation as canonical data.

Example:

```text
Minimum:
R$ 100,00

Maximum:
R$ 500,00

Currency:
BRL
```

No floating-point comparison should become authoritative.

---

# Android Local Date Filter

Local date Filters must use the same date-only or instant semantics as the backend.

---

# Android Local Sort

Local Sort must include the same stable tie-breaker where possible.

---

# Android Paged Result Store

The result store should preserve:

- Query hash.
- cursor.
- loaded pages.
- freshness.
- Owner.
- Resource versions.
- invalidation state.

---

# Android Result Invalidation

Loaded pages should be invalidated when:

- Query changes.
- Owner changes.
- Account access changes.
- canonical synchronization applies relevant changes.
- Resource deletion occurs.
- Sort changes.
- Saved View changes.
- local database migration occurs.

---

# Android Search Debounce

Interactive text Search may use bounded debounce.

Debounce must not delay exact identifier Search excessively.

---

# Android Cancellation

A new Search may cancel the previous in-flight interactive query.

Cancellation must not affect another Owner query or background Export.

---

# Android Paging Retry

Retrying page load must reuse the same cursor and query.

---

# Android Accessibility

Android Search should support:

- Accessible Search field.
- clear-query action.
- Filter summary.
- active Filter announcements.
- Sort announcement.
- loading announcement.
- result-count announcement.
- end-of-list announcement.
- accessible empty state.
- accessible error recovery.

---

# Android Foldable Layout

On foldable Devices, query state and result membership must remain unchanged when layout mode changes.

Layout changes must not:

- Reset Filters.
- change Sort.
- execute a broader query.
- lose cursor.
- duplicate loaded pages.
- expose another Owner's cached state.

---

# Web Query Architecture

Recommended architecture:

```text
Web Search UI

↓

URL and Presentation State

↓

Canonical Query Adapter

↓

Owner-Scoped Query Store

↓

Remote Query API or IndexedDB

↓

Multi-Tab Coordination

↓

Accessible Result Presentation
```

---

# Web URL Query State

Approved query state may be represented in the URL.

The URL must not contain:

- Authentication tokens.
- Export download tokens.
- highly sensitive identifiers where avoidable.
- another Owner's data.
- unrestricted private Search history.
- raw administrative predicates.

---

# URL Query Version

A versioned compact query representation may use:

```text
qv=1
```

Breaking URL-query changes require migration or controlled reset.

---

# URL Account Scope

Account IDs in a URL are untrusted and must be revalidated by the backend.

---

# URL Saved View

A URL may reference:

```text
view=<savedViewId>
```

Executing the View still requires Owner and Authorization validation.

---

# Browser History

Navigation between query states may use browser history.

Back and forward navigation should restore:

- Search text.
- Filters.
- Sort.
- pagination position where safe.
- selected Saved View.

It must revalidate freshness and Authorization.

---

# Web Hard Reload

A hard reload should rebuild the canonical query from approved URL or stored state.

It must not submit a broader default query before Owner scope is established.

---

# Web Multi-Tab Query State

Multiple tabs may execute different queries safely.

Shared state may include:

- Saved View updates.
- default-view changes.
- Search-history deletion.
- Owner sign-out.
- Account-access changes.
- query-schema upgrade.

---

# Web Tab Owner Switch

Owner switching in one tab should cause other tabs to:

- Stop previous Owner queries.
- clear previous Owner result presentation.
- invalidate cursors.
- clear Search suggestions.
- require new Owner state.
- avoid retaining private result snippets.

---

# Web Local Query

IndexedDB Search may be used offline for registered fields.

The interface must disclose local-only scope.

---

# Web Local Search Index

A local lightweight index may be used.

It must remain:

- Owner-scoped.
- environment-scoped.
- rebuildable.
- encrypted or protected according to policy.
- subordinate to local canonical replicas.
- cleared or locked on sign-out.

---

# Web URL Privacy

Private Search terms in URLs may leak through:

- browser history.
- screenshots.
- referrer headers.
- shared links.
- logs.

Sensitive Search terms should remain in in-memory or protected state where practical.

---

# Referrer Protection

Pages containing private query state should use an approved referrer policy.

---

# Web Infinite Scroll

Infinite scroll must preserve:

- Query hash.
- cursor sequence.
- loading state.
- retry.
- accessible navigation.
- URL or scroll restoration where appropriate.

---

# Web Table Pagination

A table may use explicit Next and Previous controls.

Controls should announce:

- Current loaded range.
- whether more results exist.
- count state.
- active Sort.

---

# Web Accessibility

Web Search interfaces should support:

- Semantic Search landmark.
- labeled input.
- keyboard-accessible Filter controls.
- visible and screen-reader Filter summary.
- accessible table headers.
- `aria-sort` where appropriate.
- live loading announcements.
- focus management after errors.
- accessible pagination.

---

# Cross-Platform Saved View Architecture

Saved Views should be canonical backend Resources.

Android and Web may cache them locally.

---

# Saved View Service

Recommended operations:

```text
createSavedView()

readSavedView()

listSavedViews()

updateSavedView()

setDefaultSavedView()

archiveSavedView()

deleteSavedView()

duplicateSavedView()

migrateSavedView()

executeSavedView()
```

---

# Saved View Create Request

Recommended structure:

```text
CreateSavedViewRequest
 ├── operationId
 ├── name
 ├── description
 ├── resourceType
 ├── querySchemaVersion
 ├── queryDefinition
 ├── presentationDefinition
 ├── accountScopePolicy
 ├── datePolicy
 ├── currencyScope
 └── setAsDefault
```

---

# Saved View Update Request

Recommended structure:

```text
UpdateSavedViewRequest
 ├── operationId
 ├── savedViewId
 ├── expectedResourceVersion
 ├── name
 ├── description
 ├── queryDefinition
 ├── presentationDefinition
 ├── accountScopePolicy
 ├── datePolicy
 ├── currencyScope
 └── defaultState
```

---

# Saved View Mutation Idempotency

Creating or updating a Saved View must use stable operation identity when Retry is possible.

---

# Saved View Concurrent Update

When two clients update one View concurrently:

- Validate expected Resource version.
- reject stale update.
- preserve current canonical View.
- provide controlled conflict.
- allow reapply against current version.

---

# Saved View Conflict

Recommended conflict Types:

```text
ViewVersionConflict

ReferencedAccountUnavailable

ReferencedFieldRemoved

ReferencedOperatorRemoved

ProjectionRestricted

QuerySchemaUnsupported

DefaultViewConflict
```

---

# Saved View Conflict Resolution

Potential options include:

```text
ReloadCurrentView

CreateCopy

RemoveUnavailableField

ReplaceUnavailableAccount

ResetToSystemDefault

DeleteView
```

---

# Saved View Field Removal

When a field becomes unavailable:

- Remove it only through a versioned migration when meaning remains safe.
- otherwise mark the View Stale or Invalidated.
- disclose omitted fields.

---

# Saved View System Migration

A migration may:

- Rename a field alias.
- replace an equivalent operator.
- update query schema.
- add a stable tie-breaker.
- update default projection.

It must not:

- broaden Account scope.
- add sensitive fields.
- change currency semantics.
- change fixed periods into relative periods.
- remove financial restrictions silently.

---

# Saved View Migration Record

Recommended structure:

```text
SavedViewMigration
 ├── savedViewMigrationId
 ├── savedViewId
 ├── previousResourceVersion
 ├── previousQuerySchemaVersion
 ├── newQuerySchemaVersion
 ├── migrationPolicyId
 ├── changes
 ├── warnings
 ├── state
 ├── migratedAt
 └── integrityReference
```

---

# Saved View Migration Identifier

Recommended format:

```text
viewmig_<sortable-unique-identifier>
```

---

# Saved View Migration States

Recommended:

```text
Planned

Applied

AppliedWithWarnings

Failed

Rejected

RolledBack
```

---

# System View Architecture

System Views should use a separate Registry.

Recommended fields:

```text
systemViewId

systemViewKey

resourceType

queryDefinition

presentationDefinition

supportedPlatforms

localeSupport

minimumApplicationVersion

version

state

owner
```

---

# System View Identifier

Recommended format:

```text
sysview_<domain>_<number>
```

---

# System View Update

A System View update should preserve:

- Stable key.
- version.
- migration behavior.
- Owner personalization behavior.
- default assignment policy.

---

# Personal Copy of System View

Creating a personal copy produces:

- New personal View ID.
- current System View definition as the initial state.
- independent future updates.
- Owner-specific Resource version.

---

# Default View Resolution

Recommended precedence:

```text
Owner Personal Default

↓

Nexio System Default

↓

Resource-Type Built-In Fallback
```

---

# Default View Availability

A default View must not execute if:

- It references unauthorized Accounts.
- schema is unsupported.
- required Feature is disabled.
- fields are restricted.
- View is invalidated.

The Product should fall back safely and disclose the reason.

---

# Query Export Architecture

Exporting query results must use the governed Export architecture.

Recommended flow:

```text
Authenticated Export Request

↓

Canonical Query Reconstruction

↓

Saved View Resolution where applicable

↓

Owner and Account Revalidation

↓

Query Validation

↓

Source Boundary Selection

↓

Complete Result Membership Resolution

↓

Export Job Creation

↓

Schema Serialization

↓

Verification

↓

Authorized Download
```

---

# Query Export Request

Recommended structure:

```text
QueryExportRequest
 ├── operationId
 ├── queryDefinition
 ├── savedViewId
 ├── expectedSavedViewVersion
 ├── exportTypeId
 ├── exportSchemaId
 ├── format
 ├── sourceBoundaryPolicy
 └── requestedAt
```

---

# Loaded-Page Restriction

The Export must not infer complete membership from:

- currently loaded page.
- current mobile list window.
- local UI cache.
- Search suggestions.
- visible grouped section.

---

# Query Export Boundary

Potential policies include:

```text
SnapshotAtRequest

CurrentCanonicalAtGeneration

ReportSnapshot

OwnerSequenceAtRequest
```

The selected policy must be explicit.

---

# Query Export Revalidation

Before generation, Nexio must revalidate:

- Owner.
- Accounts.
- fields.
- Filters.
- Sort where output order matters.
- Resource Type.
- projection.
- Export schema.
- source boundary.

---

# Query Export Result Count

The Export Job should preserve:

- Expected query result count.
- exported record count.
- excluded record count.
- authorization changes.
- verification result.

---

# Query Export Drift

When current Authorization or Account scope changes during generation:

- Stop or exclude inaccessible Resources according to policy.
- disclose the change.
- avoid exporting stale broader access.
- invalidate the file when scope cannot be proven.

---

# Query Result Caching Architecture

Query caching may occur at:

```text
Backend Result Cache

Search Index Cache

Database Query Cache

Application Memory Cache

Android Local Cache

Web Local Cache
```

---

# Cache Authority

A cache may accelerate results.

It does not grant Authorization or freshness.

---

# Backend Cache Entry

Recommended structure:

```text
QueryCacheEntry
 ├── cacheEntryId
 ├── ownerScopeHash
 ├── authorizationScopeVersion
 ├── queryHash
 ├── projectionVersion
 ├── dataBoundary
 ├── resultReferences
 ├── countState
 ├── facets
 ├── createdAt
 ├── expiresAt
 ├── invalidationTags
 └── state
```

---

# Query Cache Entry Identifier

Recommended format:

```text
qcache_<sortable-unique-identifier>
```

---

# Cache Entry States

Recommended:

```text
Current

Stale

Invalidated

Expired

Rebuilding
```

---

# Cache Key Owner Protection

Owner identity should be represented through a safe nonambiguous partition key.

A cache key missing Owner scope is prohibited for private data.

---

# Authorization-Scope Version

The cache should include an Authorization version or equivalent boundary.

Changes to Account access or Role should invalidate incompatible entries.

---

# Projection-Specific Cache

A broader projection must not be reused for a narrower Actor unless fields are filtered and the cache design is explicitly secure.

Separate projection-specific entries are preferred.

---

# Query Cache Stampede Prevention

The cache may use:

- Request coalescing.
- bounded leases.
- background refresh.
- stale-while-revalidate for low-risk cases.
- jittered expiration.

---

# Financial Cache Restriction

Stale-while-revalidate should not label financial results Current when the canonical financial-data version changed.

---

# Negative Result Cache

Empty results may be cached only with:

- Owner scope.
- Authorization scope.
- query hash.
- short expiration.
- invalidation behavior.

---

# Cache Invalidation Tags

Potential tags include:

```text
owner:<id>

account:<id>

resourceType:<type>

resource:<id>

querySchema:<version>

projection:<version>

authorization:<version>

financialData:<version>
```

---

# Privacy Deletion Cache Invalidation

Privacy deletion must invalidate:

- backend query cache.
- Search-index documents.
- local caches.
- Search snippets.
- autocomplete values.
- Search history where required.

---

# Search History Synchronization

Search history may be:

```text
LocalOnly

CanonicalOwnerScoped

Disabled
```

The Product policy must identify the selected model.

---

# Local-Only Search History

Local-only history should be:

- Owner-partitioned.
- cleared on sign-out according to policy.
- protected.
- retention-bounded.
- not synchronized.

---

# Canonical Search History

Canonical history requires:

- explicit Product purpose.
- Owner control.
- retention.
- cross-platform synchronization.
- Privacy review.
- deletion.
- field minimization.

---

# Search History Canonicalization

Canonical history should store a safe normalized summary rather than unrestricted raw query state where possible.

---

# Search History Deduplication

Repeated equivalent Search may update:

- `lastUsedAt`.
- use count.
- ranking.

It should not create unlimited duplicate entries.

---

# Search History Clear Operation

Clearing history should:

- Remove canonical or local entries according to scope.
- invalidate suggestions.
- synchronize deletion where canonical.
- preserve only required Evidence.
- not clear Saved Views unless separately requested.

---

# Query Security Architecture

Query Security protects:

- Owner scope.
- Account scope.
- field access.
- cursor integrity.
- Saved Views.
- Search history.
- index documents.
- autocomplete.
- counts.
- facets.
- Support queries.
- administrative queries.
- query Export.

---

# Query API Security

Every private Query API should enforce:

- HTTPS.
- Authentication.
- canonical Owner resolution.
- Account validation.
- Resource-Type authorization.
- field authorization.
- operator allowlists.
- value validation.
- projection allowlists.
- cursor validation.
- page-size limits.
- complexity limits.
- rate limits.
- timeouts.
- safe logging.

---

# Query Rate Limits

Rate limits may apply to:

- Actor.
- Owner.
- Client Instance.
- Resource Type.
- Search mode.
- autocomplete.
- facet requests.
- Export-from-query requests.
- administrative queries.

---

# Search Abuse Patterns

Potential abuse includes:

```text
Identifier enumeration

Single-character broad Search

High-cardinality facet probing

Repeated count probing

Cross-Owner cursor replay

Oversized OR expressions

Rapid autocomplete probing

Sensitive description extraction

Timing-based existence probing

Administrative scope escalation
```

---

# Identifier Enumeration Control

Controls may include:

- Exact identifier format.
- minimum prefix prohibition.
- uniform unavailable responses.
- rate limits.
- result-field minimization.
- Audit monitoring.

---

# Count Probing Control

Counts may be:

- Withheld.
- estimated.
- bucketed.
- rate-limited.
- limited to ordinary Owner scope.

---

# Facet Probing Control

Sensitive or high-cardinality facets should remain unavailable.

---

# Query Timing Side Channels

The architecture should minimize exploitable timing differences between:

- nonexistent Resource.
- inaccessible Resource.
- deleted Resource.

Perfect timing equality may not be feasible.

High-risk identifier endpoints should use uniform controlled behavior.

---

# Saved View Security

Saved Views must not contain:

- Authentication tokens.
- download URLs.
- unrestricted SQL.
- scripts.
- another Owner's Account IDs.
- hidden administrative fields.
- secrets.

---

# Saved View Name Injection

View names and descriptions must remain inert text.

---

# Query Cursor Security

Cursors should be:

- Opaque.
- integrity-protected.
- expiring.
- Owner-bound.
- query-bound.
- environment-bound.
- nonenumerable.

---

# Query Cursor Logging

Raw cursors should not appear in ordinary logs.

Use a safe cursor reference or hash.

---

# Search Index Security

Search-index access should use:

- Private network paths where applicable.
- least-privilege credentials.
- environment isolation.
- encrypted transport.
- encrypted storage where required.
- field minimization.
- query restrictions.
- access logging.

---

# Index Credential Separation

Index workers, query services and administrative tools should use separate least-privilege credentials.

---

# Administrative Query Security

Administrative queries require:

- Explicit capability.
- purpose.
- bounded scope.
- short duration.
- field minimization.
- result limits.
- no unrestricted cross-Owner Export.
- Audit Evidence.

---

# Support Query Security

Support should use predefined safe query templates.

Ordinary Support must not submit unrestricted database predicates.

---

# Query Privacy Architecture

Query Privacy governs:

- Search terms.
- Filters.
- result snippets.
- Search history.
- autocomplete.
- Saved Views.
- query telemetry.
- Support access.
- administrative access.
- AI-assisted Search.

---

# Search-Term Classification

Search terms may contain:

- Merchant names.
- health-related spending.
- legal disputes.
- personal relationships.
- political organizations.
- religious organizations.
- salary terms.
- debt terms.
- Account identifiers.

They should be treated as Owner-private data.

---

# Query Telemetry Minimization

Preferred telemetry includes:

```text
Query ID

Resource Type

Search mode

token count

Filter count

Sort count

page size

result count category

latency

freshness state

safe error code
```

Avoid storing raw Search terms.

---

# Search-Term Analytics

Product Analytics should use:

- Aggregated categories.
- bounded safe classifications.
- opt-in policies where applicable.
- no unrestricted raw financial descriptions.

---

# Result Snippet Privacy

Snippets should show the minimum text required for recognition.

---

# Saved View Privacy

Saved Views may reveal ongoing financial interests.

They must remain Owner-scoped and deletion-enabled.

---

# Search History Privacy

Search history should be disabled by default when the Product lacks a clear purpose and Owner benefit.

---

# Privacy Request Handling

Privacy requests may require deletion or Export of:

- Saved Views.
- Search history.
- recent searches.
- personalization signals.
- query-derived preferences.

Ordinary query telemetry may remain only according to approved retention and minimization.

---

# Owner Deletion

Owner deletion must remove or irreversibly disassociate:

- Saved Views.
- Search history.
- local query caches.
- Search-index documents.
- autocomplete personalization.
- canonical private query state.

---

# Query Accessibility Architecture

Accessibility applies to:

- Search input.
- Search mode.
- Filter builder.
- Filter chips.
- Account selector.
- Category selector.
- date selector.
- money selector.
- currency selector.
- Sort.
- grouping.
- result table.
- result list.
- pagination.
- infinite scroll.
- Saved Views.
- error messages.
- loading states.
- empty states.
- stale-state warnings.

---

# Accessible Search Input

The Search input should have:

- Visible label or accessible name.
- purpose description where needed.
- clear-query control.
- keyboard focus.
- Search submission behavior.
- loading state.
- error association.

---

# Accessible Filter Builder

Every Filter should expose:

```text
Field

Operator

Value

Currency where applicable

Time zone where applicable

Remove action

Validation state
```

---

# Accessible Filter Chips

A chip such as:

```text
Account: Conta Principal
```

should announce:

```text
“Filter, Account equals Conta Principal. Remove filter.”
```

---

# Accessible Money Filter

Example:

```text
Minimum amount:
R$ 100,00

Maximum amount:
R$ 500,00

Currency:
Brazilian real
```

The interface must not rely only on the `R$` symbol when a screen reader requires clearer currency meaning.

---

# Accessible Date Filter

A date Filter should identify:

- Field.
- start date.
- end date.
- inclusive behavior.
- selected time zone for timestamp fields.

---

# Accessible Sort

Sort controls should announce:

```text
“Sorted by date, newest first.”
```

---

# Accessible Result Count

Examples:

```text
“42 results.”

“About 1,000 results.”

“Result count unavailable.”

“12 locally available results. More may be available when online.”
```

---

# Accessible Loading

Loading announcements should be concise and avoid repeated interruption.

---

# Accessible Empty State

An Empty state should explain:

- No authorized matches were found.
- active Filters.
- whether data is stale or offline.
- a safe action to broaden or clear Filters.

---

# Accessible Partial State

Example:

```text
“Some results are unavailable because Search is updating. Showing 18 verified results.”
```

---

# Accessible Pagination

Pagination controls should have descriptive labels:

```text
Next page

Previous page

Load more results
```

---

# Accessible Infinite Scroll

The Product should provide a non-infinite alternative where required for reliable navigation.

---

# Accessible Saved Views

Saved View actions should identify:

- View name.
- active state.
- default state.
- update conflict.
- delete action.
- duplicate action.

---

# Query Support Architecture

Support may access safe query diagnostics.

---

# Support Query View

Potential safe fields include:

```text
Query ID

Resource Type

Platform

Application version

Query schema version

Search mode

Filter count

Sort definition summary

pagination mode

cursor state category

execution source

freshness state

result state

safe error code

latency
```

---

# Support Restrictions

Ordinary Support must not access:

- Raw Search terms.
- complete result sets.
- another Owner's query state.
- unrestricted Saved View definitions.
- Search-index credentials.
- raw cursors.
- database query plans containing private data.
- administrative query templates.
- complete sensitive financial descriptions.

---

# Support Scenario — Missing Transaction

Expected behavior:

- Confirm Owner and Account.
- confirm active Filters.
- confirm date period.
- confirm currency.
- confirm Search text.
- confirm Transaction state.
- confirm local or remote mode.
- confirm Search freshness.
- request a targeted Resource refresh.
- avoid advising duplicate Transaction creation.

---

# Support Scenario — Duplicate Results

Expected behavior:

- Confirm Query ID.
- confirm cursor state.
- confirm Sort and tie-breaker.
- confirm Resource identifiers.
- confirm whether one logical Resource appears through multiple relationships.
- invalidate cursor where required.
- escalate pagination or deduplication defects.

---

# Support Scenario — Results Change Between Pages

Expected behavior:

- Confirm pagination consistency model.
- confirm whether canonical data changed.
- confirm cursor expiration.
- confirm index generation.
- explain BestEffortCurrent behavior where applicable.
- escalate SnapshotBound inconsistency.

---

# Support Scenario — Saved View No Longer Works

Expected behavior:

- Confirm View state.
- confirm query-schema version.
- confirm unavailable Accounts.
- confirm removed fields or operators.
- apply approved migration.
- create a copy where current View cannot be updated safely.

---

# Support Scenario — Wrong Currency Results

Required behavior:

- Confirm exact money Filter.
- confirm currency scope.
- confirm Account currencies.
- preserve Query ID and normalized query.
- stop incorrect Export.
- escalate financial query defect.

---

# Support Scenario — Previous Owner Search Appears

This is Critical.

Required behavior:

- Stop use of the affected client context.
- preserve safe platform and Application details.
- clear active previous Owner presentation.
- revoke or reset affected local query state.
- notify Security and Privacy.
- avoid asking the Owner to inspect more previous Owner data.

---

# Query Observability Architecture

Observability must cover:

```text
Validation

Normalization

Planning

Database execution

Search-index execution

Canonical revalidation

Pagination

Counts

Facets

Autocomplete

Saved Views

Query caching

Local Search

Android

Web

Security

Privacy

Owner isolation
```

---

# Query Request Metrics

Recommended:

```text
query_request_count

query_success_rate

query_failure_count

query_partial_count

query_empty_count

query_cancelled_count

query_latency
```

---

# Query Validation Metrics

```text
query_validation_failure_count

query_unsupported_field_count

query_unsupported_operator_count

query_invalid_money_count

query_currency_required_count

query_invalid_date_count

query_complexity_rejection_count
```

---

# Query Planning Metrics

```text
query_plan_database_count

query_plan_index_count

query_plan_hybrid_count

query_plan_fallback_count

query_plan_rejected_count

query_plan_latency
```

---

# Database Query Metrics

```text
database_query_count

database_query_latency

database_query_timeout_count

database_query_cancelled_count

database_query_row_count

database_query_full_scan_prevented_count
```

---

# Search Index Metrics

```text
search_index_query_count

search_index_query_latency

search_index_candidate_count

search_index_revalidation_removal_count

search_index_lag_duration

search_index_update_failure_count

search_index_stale_update_rejected_count

search_index_integrity_failure_count
```

---

# Pagination Metrics

```text
query_cursor_issue_count

query_cursor_validation_failure_count

query_cursor_expiration_count

query_cursor_owner_mismatch_count

query_cursor_query_mismatch_count

query_duplicate_page_result_count

query_missing_page_result_count
```

---

# Count and Facet Metrics

```text
query_exact_count_count

query_estimated_count_count

query_count_unavailable_count

query_facet_request_count

query_facet_latency

query_facet_limit_rejection_count
```

---

# Autocomplete Metrics

```text
autocomplete_request_count

autocomplete_success_rate

autocomplete_latency

autocomplete_rate_limit_count

autocomplete_owner_scope_failure_count
```

---

# Saved View Metrics

```text
saved_view_create_count

saved_view_update_count

saved_view_delete_count

saved_view_execution_count

saved_view_stale_count

saved_view_migration_count

saved_view_conflict_count

saved_view_default_conflict_count
```

---

# Query Cache Metrics

```text
query_cache_hit_count

query_cache_miss_count

query_cache_stale_hit_count

query_cache_invalidation_count

query_cache_owner_scope_failure_count

query_cache_authorization_scope_failure_count
```

---

# Local Query Metrics

```text
local_query_count

local_query_success_rate

local_query_unsupported_filter_count

local_query_stale_result_count

local_query_replica_integrity_failure_count
```

---

# Android Query Metrics

```text
android_query_count

android_query_cancelled_on_new_search_count

android_query_cursor_restore_failure_count

android_query_owner_switch_cleanup_failure_count

android_query_paging_duplicate_count
```

---

# Web Query Metrics

```text
web_query_count

web_query_url_restore_failure_count

web_query_multitab_owner_switch_failure_count

web_query_history_privacy_failure_count

web_query_infinite_scroll_duplicate_count
```

---

# Owner-Isolation Metrics

Targets must be zero for:

```text
cross_owner_query_result_count

cross_owner_query_count_leak_count

cross_owner_facet_leak_count

cross_owner_autocomplete_leak_count

cross_owner_saved_view_access_count

cross_owner_query_cache_reuse_count

cross_owner_index_document_count

cross_owner_cursor_acceptance_count

cross_owner_local_query_exposure_count
```

---

# Query SLO Architecture

Potential SLO categories include:

```text
Interactive Query Latency

Autocomplete Latency

Pagination Continuation

Search Index Freshness

Saved View Availability

Query Export Creation

Owner Isolation

Query Correctness
```

---

# Interactive Query SLO

Potential objective:

```text
Validated bounded interactive queries complete with a successful, empty, partial or controlled failure state within the approved Resource-specific latency window.
```

---

# Autocomplete SLO

Potential objective:

```text
Authorized bounded autocomplete requests return approved suggestions within the interaction latency target.
```

---

# Pagination Continuation SLO

Potential objective:

```text
A valid cursor for an unchanged compatible query returns the next deterministic page within the approved latency window.
```

---

# Search Index Freshness SLO

Potential objective:

```text
Accepted canonical changes become searchable within the approved Resource-specific indexing window.
```

---

# Saved View Availability SLO

Potential objective:

```text
Active compatible Saved Views execute or produce a controlled migration or invalidation state within the approved window.
```

---

# Owner-Isolation SLO

Target:

```text
Zero cross-Owner query results, counts, facets, autocomplete values, Saved Views, cursor acceptance, cache reuse or index documents.
```

---

# Query Correctness SLO

Target:

```text
Zero incorrect exact-money, currency, Owner, Account or SnapshotBound query results caused by query execution defects.
```

---

# Zero-Tolerance Query Failures

Targets must be zero for:

```text
Cross-Owner Resource result

Cross-Owner count disclosure

Cross-Owner facet disclosure

Cross-Owner autocomplete disclosure

Cross-Owner Saved View access

Cross-Owner query cache reuse

Cross-Owner index document placement

Cross-Owner cursor acceptance

Incorrect exact-money comparison

Incorrect currency comparison

SnapshotBound page inconsistency

Unauthorized field returned

Search-index candidate bypassing canonical Authorization

Expired or invalid cursor broadening scope

Previous Owner Search state displayed after switching

Query Export containing unauthorized Resources
```

---

# Query Error Budgets

Error budgets may apply to:

- Optional relevance ranking delay.
- noncritical autocomplete delay.
- estimated total-count unavailability.
- optional facet delay.
- temporary Saved View recommendation delay.
- Search-index NearCurrent state.

They must not normalize:

```text
Owner-isolation failure

Account-isolation failure

Incorrect exact-money filtering

Incorrect currency filtering

Unauthorized field return

Pagination duplication in financial Exports

Snapshot inconsistency

Cross-Owner query caching

Search-history Privacy failure

Saved View Authorization bypass
```

---

# Query Incident Architecture

Query Incidents may include:

```text
Cross-Owner Search result

Cross-Owner count or facet leak

Unauthorized field projection

Incorrect amount Filter

Incorrect currency Filter

Incorrect date boundary

Duplicate paginated results

Missing paginated results

Snapshot inconsistency

Search-index stale overwrite

Deleted Resource still searchable

Saved View Authorization bypass

Previous Owner Search-history exposure

Query cache isolation failure

Autocomplete Privacy leak

Query Export scope defect
```

---

# Query Incident Severity Factors

Evaluate:

```text
Number of Owners

Number of exposed Resources

Financial impact

Security impact

Privacy impact

Result-field sensitivity

Export involvement

Duration

Platform scope

Index generation scope

Cache scope

Recoverability

Evidence completeness
```

---

# Cross-Owner Search Incident

This is Critical.

Required response:

```text
Stop the affected query path.

Disable affected index, cache or Saved View path.

Invalidate affected cursors.

Clear unsafe local and backend caches.

Identify source and exposed Owners.

Identify returned fields, counts, facets and snippets.

Preserve safe Query IDs and Evidence.

Correct Owner and Account predicates.

Rebuild affected Search indexes where required.

Notify Security and Privacy.

Execute cross-Owner regression tests.
```

---

# Incorrect Money Query Incident

Required response:

- Stop affected money Filter or Sort.
- preserve normalized query values.
- identify currency and locale.
- identify affected results and Exports.
- correct exact-decimal comparison.
- invalidate affected query caches.
- regenerate affected Exports.
- add pt-BR money regression tests.

---

# Incorrect Currency Query Incident

Required response:

- Stop affected multi-currency query.
- preserve currency scope.
- identify mixed-currency results.
- prevent further Export.
- correct currency predicates.
- invalidate caches and Saved Views where material.
- add currency-separation tests.

---

# Pagination Duplication Incident

Required response:

- Preserve Query ID and cursors.
- identify Sort and tie-breaker.
- identify canonical changes between pages.
- stop affected Export generation.
- invalidate affected cursors.
- correct cursor predicates.
- add concurrent-mutation pagination tests.

---

# Missing Pagination Result Incident

Required response:

- Preserve query and data boundary.
- inspect Sort values.
- inspect null placement.
- inspect cursor comparison operators.
- verify deduplication and joins.
- correct execution plan.
- rerun affected SnapshotBound Exports.

---

# Search Index Integrity Incident

Required response:

- Stop affected index generation.
- prevent Current labeling.
- switch to safe fallback where possible.
- identify missing, duplicated or cross-Owner documents.
- rebuild from canonical data.
- validate Resource versions.
- invalidate incompatible cursors.
- notify Security and Privacy where applicable.

---

# Deleted Resource Search Incident

Required response:

- Remove or Tombstone index document.
- identify deletion publication failure.
- invalidate query caches.
- inspect other deleted Resources.
- correct indexing pipeline.
- verify Privacy deletion propagation.

---

# Saved View Authorization Incident

Required response:

- Disable affected View execution.
- identify View owners.
- identify broader Account or field scope.
- invalidate cached results.
- correct execution-time Authorization.
- notify Security and Privacy.
- add stale-Authorization tests.

---

# Previous Owner Query-State Incident

Required response:

- Stop affected client version.
- clear active previous Owner query state.
- clear previous Owner Search suggestions.
- invalidate local cursors and caches.
- identify affected Owners and platforms.
- notify Security and Privacy.
- correct Owner-switch cleanup.

---

# Query Export Scope Incident

Required response:

- Invalidate Export file.
- revoke download authorization.
- identify whether the file was downloaded.
- preserve query, Saved View and source boundary.
- correct Export membership resolution.
- notify Security and Privacy.
- generate a corrected new Export after verification.

---

# Query Execution Acceptance Criteria

The Query Execution, Indexing and Cross-Platform Search architecture is accepted only when:

251. Every query execution has a stable execution identifier.

252. Every query execution references one canonical Query ID.

253. Every query execution identifies canonical Owner.

254. Every query execution identifies Resource Type.

255. Every query execution identifies query-schema version.

256. Every query execution identifies query hash.

257. Every query execution identifies execution source.

258. Every query execution identifies Authorization scope version.

259. Every query execution identifies data boundary.

260. Query execution states are controlled.

261. Query normalization occurs before execution.

262. Query normalization resolves field aliases deterministically.

263. Query normalization resolves operator aliases deterministically.

264. Query normalization preserves exact money.

265. Query normalization preserves currency.

266. Query normalization preserves date semantics.

267. Query normalization preserves time-zone semantics.

268. Equivalent logical queries produce stable hashes.

269. Query hashes do not expose raw private Search terms in telemetry.

270. Query planning occurs only after Authorization and scope validation.

271. Execution-source selection is governed.

272. Canonical database execution is available for approved exact queries.

273. Search-index execution is available only for registered fields.

274. Hybrid execution revalidates canonical Resources.

275. Hybrid execution bounds candidate hydration.

276. Index candidate membership does not grant access.

277. Canonical revalidation confirms Owner.

278. Canonical revalidation confirms Account scope.

279. Canonical revalidation confirms Resource state.

280. Canonical revalidation confirms returnable fields.

281. Removed candidates do not remain in exact final counts.

282. Query Execution Plans have stable identifiers.

283. Query Execution Plans preserve execution source.

284. Query Execution Plans preserve Sort.

285. Query Execution Plans preserve pagination model.

286. Query Execution Plans preserve timeout policy.

287. Query Execution Plans are not exposed unsafely to Owners.

288. Database queries use parameterized values.

289. Database queries enforce Owner predicates.

290. Database queries enforce Account predicates where applicable.

291. Database queries use approved relationships.

292. Database queries bound joins.

293. one-to-many joins do not duplicate logical Resources.

294. Deduplication occurs before pagination where required.

295. Database query timeouts are defined.

296. Query timeout is not presented as Empty.

297. Query cancellation is controlled.

298. Stable database cursor predicates match the selected Sort direction.

299. Null placement is reflected in cursor predicates.

300. Search-index queries enforce Owner scope.

301. Search-index queries enforce Account scope.

302. Search-index queries enforce Resource Type.

303. Search-index pagination preserves concrete generation where required.

304. Index generations have stable identifiers.

305. Index generation states are controlled.

306. Index documents contain only approved fields.

307. Index tokenization is versioned.

308. pt-BR accent-insensitive Search uses a Search-only projection.

309. canonical text remains unchanged by indexing normalization.

310. Ranking policies are versioned.

311. Ranking uses stable tie-breakers.

312. Ranking never alters Authorization.

313. canonical changes update the index through an idempotent path.

314. Search-index updates have stable identifiers.

315. Index update operations are controlled.

316. Duplicate index-update delivery is harmless.

317. stale index updates cannot overwrite newer Resource versions.

318. deleted Resources are removed or safely Tombstoned.

319. Index update Retry preserves Resource version.

320. failed final index updates enter a repair workflow.

321. Search-index freshness is measurable.

322. Search-index lag duration is measurable.

323. Query responses disclose material index lag.

324. Current Search state requires freshness-policy compliance.

325. Canonical fallback behavior is registered.

326. Fallback limitations are disclosed.

327. Index integrity verification checks Owner partitions.

328. Index integrity verification checks Resource counts.

329. Index integrity verification checks deletion state.

330. Index integrity verification checks Resource versions.

331. Index integrity failure stops Current labeling.

332. Index integrity failure invalidates affected cursors.

333. Index rebuilds use canonical data.

334. Index rebuilds identify a source boundary.

335. Index rebuilds preserve changes after the source boundary.

336. Index rebuilds verify no Ownerless documents.

337. Index rebuilds verify no cross-Owner Account relationships.

338. Index rebuilds verify no duplicate logical Resources.

339. Index rebuilds verify deleted Resources are not Active.

340. Shadow queries do not create Owner Search-history entries.

341. Index cutover has an approval gate.

342. Index cutover defines cursor compatibility.

343. Index cutover has rollback.

344. retired index generations are destroyed according to policy.

345. Android and Web use one canonical query contract.

346. Platform presentation differences do not change query semantics.

347. Android Query State identifies Owner.

348. Android Query State identifies query hash or equivalent state.

349. Android process recreation does not restore another Owner's query.

350. Persisted Android cursors are revalidated.

351. Android local Search uses the active Owner partition.

352. Android local query capabilities are registered.

353. Android local query limitations are disclosed.

354. Android local money Filters use exact values.

355. Android local money Filters preserve BRL currency where selected.

356. Android local date Filters preserve backend semantics.

357. Android local Sort uses stable tie-breakers.

358. Android paged result stores preserve Owner.

359. Android paged result stores preserve Resource versions.

360. Android loaded pages invalidate after Owner changes.

361. Android loaded pages invalidate after relevant synchronization changes.

362. Android text Search uses bounded debounce.

363. Android exact identifier Search is not delayed excessively by debounce.

364. Android page Retry reuses the same query and cursor.

365. Android Search states are accessible.

366. Android foldable layout changes do not broaden query scope.

367. Android foldable layout changes do not duplicate loaded pages.

368. Web query state may use a versioned URL representation.

369. URL Account identifiers remain untrusted.

370. URL Saved View references remain nonauthoritative.

371. Web URLs contain no Authentication tokens.

372. Web URLs contain no Export download tokens.

373. sensitive Search terms are excluded from URLs where practical.

374. Browser back and forward navigation revalidate Authorization.

375. Browser back and forward navigation revalidate freshness.

376. Web hard reload establishes Owner before private querying.

377. Web multi-tab behavior propagates Owner sign-out.

378. Web multi-tab behavior propagates Account-access changes.

379. Web Owner switching clears previous Owner result state.

380. Web Owner switching clears previous Owner Search suggestions.

381. Web local Search remains Owner-scoped.

382. Web local Search discloses local-only limitations.

383. Web local indexes remain subordinate to local replicas.

384. private query pages use approved referrer behavior.

385. Web infinite scroll preserves query hash.

386. Web infinite scroll preserves cursor sequence.

387. Web pagination is accessible.

388. Saved Views are canonical backend Resources.

389. Saved View creation uses stable operation identity where Retry is possible.

390. Saved View updates use expected Resource version.

391. stale Saved View updates do not overwrite current versions.

392. Saved View Conflict Types are controlled.

393. View-version Conflicts preserve current canonical View.

394. incompatible Account references produce warning or invalidation.

395. Saved View migrations have stable identifiers.

396. Saved View migrations preserve Owner.

397. Saved View migrations preserve Account-scope meaning.

398. Saved View migrations do not broaden field access.

399. Saved View migrations do not change currency semantics silently.

400. Saved View migrations do not change fixed periods into relative periods silently.

401. System Views are registered.

402. System Views have stable keys.

403. System View updates are versioned.

404. Personal copies of System Views receive new identifiers.

405. default-view resolution follows a documented precedence.

406. unavailable default Views use a safe fallback.

407. Query Export uses the governed Export architecture.

408. Query Export reconstructs the complete canonical query.

409. Query Export revalidates Saved View version.

410. Query Export revalidates Owner.

411. Query Export revalidates Accounts.

412. Query Export revalidates fields.

413. Query Export does not export only loaded pages.

414. Query Export identifies one source-boundary policy.

415. Query Export records expected and exported counts.

416. Authorization drift during Export cannot broaden scope.

417. Query cache entries have stable identifiers.

418. Query caches include Owner scope.

419. Query caches include Authorization scope.

420. Query caches include query hash.

421. Query caches include projection version.

422. Query caches include data boundary.

423. Query caches do not mix Owners.

424. Query caches do not mix administrative and Owner projections.

425. Query cache entries have controlled states.

426. Query cache invalidation responds to Resource change.

427. Query cache invalidation responds to Account-access change.

428. Query cache invalidation responds to Authorization change.

429. Query cache invalidation responds to Privacy deletion.

430. Financial query caches do not label changed data Current.

431. Empty-result caches are Owner-scoped.

432. Search-history storage mode is explicitly defined.

433. Local-only Search history remains Owner-partitioned.

434. Canonical Search history requires a Product purpose.

435. Canonical Search history supports deletion.

436. Search-history deduplication prevents unbounded duplicate entries.

437. Clearing Search history does not delete Saved Views automatically.

438. Query APIs use HTTPS.

439. Query APIs authenticate private requests.

440. Query APIs resolve Owner server-side.

441. Query APIs validate Account scope.

442. Query APIs enforce Resource-Type authorization.

443. Query APIs enforce field authorization.

444. Query APIs enforce operator allowlists.

445. Query APIs enforce projection allowlists.

446. Query APIs enforce cursor integrity.

447. Query APIs enforce page-size limits.

448. Query APIs enforce complexity limits.

449. Query APIs enforce rate limits.

450. Query APIs enforce timeouts.

451. identifier-enumeration controls are active.

452. count-probing controls are available.

453. facet-probing controls are active.

454. high-risk identifier endpoints use controlled unavailable behavior.

455. Saved Views contain no unrestricted query language.

456. Saved Views contain no secrets.

457. Saved View names and descriptions remain inert.

458. raw cursors are excluded from ordinary logs.

459. Search indexes use least-privilege access.

460. index credentials are separated by purpose.

461. administrative queries require explicit capabilities.

462. administrative queries are bounded.

463. Support queries use safe templates.

464. ordinary Support cannot issue unrestricted database predicates.

465. Search terms are treated as Owner-private data.

466. Query telemetry minimizes raw Search text.

467. Search-term Analytics does not ingest unrestricted financial descriptions.

468. result snippets use authorized fields only.

469. Saved Views remain Owner-scoped.

470. Search-history retention is bounded.

471. Privacy requests can address Saved Views and Search history.

472. Owner deletion removes private query state.

473. Search input is accessible.

474. Filter builders are accessible.

475. Filter chips are accessible.

476. money Filters announce currency accessibly.

477. date Filters announce boundaries accessibly.

478. Sort state is announced accessibly.

479. exact and estimated counts are distinguished accessibly.

480. local-only counts are distinguished accessibly.

481. partial-result warnings are announced accessibly.

482. pagination controls have descriptive labels.

483. infinite scroll has accessible loading behavior.

484. Saved View actions are accessible.

485. Support Query Views are field-minimized.

486. ordinary Support cannot view raw private Search terms.

487. Support missing-Transaction workflows confirm active Filters.

488. Support duplicate-result workflows preserve Query ID and cursor.

489. Support Saved View repair preserves View versions.

490. previous Owner query-state exposure is escalated as Critical.

491. Query request metrics are collected.

492. Query validation metrics are collected.

493. Query planning metrics are collected.

494. Database query metrics are collected.

495. Search-index metrics are collected.

496. pagination metrics are collected.

497. count and facet metrics are collected.

498. autocomplete metrics are collected.

499. Saved View metrics are collected.

500. query-cache metrics are collected.

501. local query metrics are collected.

502. Android query metrics are collected.

503. Web query metrics are collected.

504. Owner-isolation query metrics have a zero target.

505. Interactive Query SLOs are defined.

506. Autocomplete SLOs are defined.

507. pagination-continuation SLOs are defined.

508. Search-index freshness SLOs are defined.

509. Saved View availability SLOs are defined.

510. Owner-isolation failures are excluded from error budgets.

511. incorrect exact-money query results are excluded from error budgets.

512. incorrect currency query results are excluded from error budgets.

513. unauthorized field return is excluded from error budgets.

514. Query Incident categories are controlled.

515. Cross-Owner Search Incidents stop affected query paths.

516. money-query Incidents preserve normalized exact values.

517. pagination Incidents preserve Query IDs and cursors.

518. index-integrity Incidents trigger canonical rebuild or safe fallback.

519. Query Export scope Incidents revoke file authorization.

520. every query execution remains traceable to one normalized query, authorization decision, execution plan, data boundary and result projection.

---

# Query Execution, Indexing and Cross-Platform Search Rule

A Query Plan is not safe merely because it is efficient.

A Search-index result is not authorized merely because the index contains the Resource.

A local Search result is not complete merely because the local database returned every matching local row.

A Saved View is not valid merely because its JSON can still be parsed.

A query cache is not current merely because it has not expired.

A pagination cursor is not reusable merely because the next request uses the same Resource Type.

A Query Export is not complete merely because it contains every currently loaded result.

Query execution is trustworthy only when Nexio can establish:

```text
The authenticated Actor

The canonical Owner

The Account and Resource scope

The normalized Search and Filters

The exact money and currency semantics

The date and time-zone semantics

The registered fields and operators

The Authorization scope version

The execution source and plan

The Search-index generation and freshness

The stable Sort and cursor values

The canonical candidate revalidation

The result projection

The data boundary

The Saved View version

The cache scope

The Evidence required to reconstruct execution
```

When execution source, index integrity, Owner scope, Account scope, Authorization, exact amount, currency, cursor, Saved View version, data boundary, cache scope or projection cannot be established, Nexio must prefer the action that:

- Rejects the query.
- stops the affected Search path.
- invalidates the cursor.
- invalidates the Saved View.
- bypasses the unsafe cache.
- uses a canonical fallback.
- marks results stale or partial.
- blocks Query Export.
- clears previous Owner query state.
- rebuilds the Search index.
- revokes an incorrect Export.
- opens a Security, Privacy, financial-integrity or operational Incident.
- blocks the release.

Nexio must never:

- Return an index candidate without current Authorization.
- hydrate another Owner's Resource through an index identifier.
- cache private query results without Owner scope.
- reuse a broader projection for a narrower Actor unsafely.
- compare R$ values using binary floating-point.
- treat BRL and another currency as equal units.
- allow an older index update to overwrite a newer Resource version.
- apply a cursor to an incompatible index generation.
- restore a previous Owner's query after Account switching.
- migrate a Saved View by silently broadening Account or field scope.
- export only visible pages while claiming the entire query result.
- expose private Search terms through unrestricted telemetry.
- present an index integrity failure as an empty complete result.

# Search, Query and Saved View Governance Architecture

Search, Filtering, Sorting, Pagination, Saved Views, Search indexes, autocomplete, facets, query caches and query-derived Exports are governed Platform capabilities.

They must not be treated as:

- Generic database access.
- unrestricted Search-engine access.
- client-controlled Authorization.
- permanent query-language execution.
- unrestricted administrative reporting.
- raw SQL construction.
- public indexing.
- cross-Owner analytics.
- unrestricted AI database access.
- a substitute for canonical Resource APIs.

Governance applies to:

```text
Canonical Query Schemas

Query Fields

Query Operators

Search Modes

Text Normalization

Money Filters

Currency Filters

Date and Time-Zone Filters

Logical Filter Groups

Sort Policies

Pagination Policies

Query Cursors

Result Projections

Counts

Facets

Autocomplete

Saved Views

System Views

Search History

Query Caches

Search Indexes

Local Query Engines

Query Exports

Support Queries

Administrative Queries

Query Analytics

Query Evidence

Query Incidents
```

The governed lifecycle is:

```text
Discovery Need Identified

↓

Resource, Owner and Account Scope Defined

↓

Fields and Operators Registered

↓

Search, Filter, Sort and Pagination Semantics Defined

↓

Security, Privacy, Financial and Accessibility Review

↓

Implementation

↓

Automated and Manual Verification

↓

Controlled Activation

↓

Monitoring and Operational Review

↓

Schema or Index Migration

↓

Deprecation

↓

Retirement

↓

Historical Evidence Preservation
```

---

# Query Governance Objectives

The Nexio Query governance program shall ensure:

```text
Every query has one canonical Owner scope.

Every Account scope is authorized.

Every field is registered.

Every operator is typed.

Every money comparison is exact.

Every currency comparison is explicit.

Every date comparison has controlled semantics.

Every Sort is deterministic.

Every cursor is query-bound.

Every result projection is authorized.

Every count and facet is scope-safe.

Every Search index remains derived.

Every Saved View is versioned.

Every local query remains Owner-partitioned.

Every query Export reconstructs complete membership.

Every lifecycle remains independently reconstructable.
```

---

# Query Governance Principles

The governance model is based on:

```text
Search Does Not Grant Access

Canonical Owner Resolution

Account Validation

Field Allowlisting

Typed Operators

Exact Financial Meaning

Explicit Currency

Explicit Time Zone

Stable Total Ordering

Cursor Integrity

Projection Minimization

Freshness Transparency

Versioned Saved Views

Derived Index Authority

Bounded Complexity

Lifecycle Management
```

---

# Search-Does-Not-Grant-Access Governance

Every query execution path must preserve this invariant:

```text
Match

does not imply

Authorization
```

This applies to:

- Exact identifier Search.
- full-text Search.
- prefix Search.
- autocomplete.
- facets.
- counts.
- Search snippets.
- Saved Views.
- local caches.
- Search-index candidates.
- administrative Search.
- Support Search.

---

# Query Governance Roles

Recommended roles include:

```text
Query Product Owner

Query Domain Owner

Search Experience Owner

Query Schema Owner

Query Field Registry Owner

Query Operator Owner

Financial Query Owner

Pagination and Cursor Owner

Search Index Owner

Saved View Owner

Local Query Owner

Query Export Owner

Security Owner

Privacy Owner

Accessibility Owner

Database Performance Owner

Operations Owner

Support Query Owner

Audit and Evidence Owner

Migration Owner

Release Manager
```

One individual may hold multiple roles.

Responsibilities must remain explicit.

---

# Query Product Owner

The Query Product Owner is responsible for:

- Search experience.
- Filter experience.
- Sort experience.
- pagination experience.
- Saved View experience.
- empty states.
- partial states.
- stale-state communication.
- cross-platform behavior.
- Product acceptance.

---

# Query Domain Owner

The Query Domain Owner is responsible for:

- Canonical Query model.
- Query Schema Registry.
- query lifecycle.
- field and operator contracts.
- complexity policy.
- result states.
- query reproducibility.
- governance documentation.

---

# Search Experience Owner

The Search Experience Owner is responsible for:

- Search modes.
- text normalization.
- pt-BR Search behavior.
- accent behavior.
- phrase Search.
- prefix Search.
- ranking.
- autocomplete.
- Search suggestions.
- Search-history Product behavior.

---

# Query Schema Owner

The Query Schema Owner is responsible for:

- Query request schema.
- response schema.
- Filter expression schema.
- Sort schema.
- cursor schema.
- Saved View query schema.
- compatibility.
- deprecation.
- migration.

---

# Query Field Registry Owner

The Query Field Registry Owner is responsible for:

- Searchable fields.
- filterable fields.
- sortable fields.
- groupable fields.
- facetable fields.
- returnable fields.
- offline-eligible fields.
- classifications.
- masking policies.

---

# Query Operator Owner

The Query Operator Owner is responsible for:

- Operator definitions.
- type compatibility.
- null semantics.
- collection semantics.
- logical composition.
- complexity.
- operator testing.
- deprecation.

---

# Financial Query Owner

The Financial Query Owner is responsible for:

- Exact money parsing.
- currency requirements.
- amount comparison.
- sign and direction.
- multi-currency behavior.
- date-boundary financial meaning.
- grouped financial totals.
- financial-query testing.

---

# Pagination and Cursor Owner

The Pagination and Cursor Owner is responsible for:

- Cursor schema.
- cursor integrity.
- cursor expiration.
- stable Sort requirements.
- null placement.
- page-size limits.
- SnapshotBound behavior.
- pagination testing.
- cursor migration.

---

# Search Index Owner

The Search Index Owner is responsible for:

- Index schemas.
- analyzers.
- tokenization.
- index generations.
- update pipelines.
- Resource-version protection.
- deletion.
- rebuilds.
- cutover.
- index freshness.
- index retirement.

---

# Saved View Owner

The Saved View Owner is responsible for:

- Saved View schema.
- system views.
- default-view policy.
- concurrency.
- migration.
- invalidation.
- synchronization.
- Saved View deletion.
- sharing restrictions.

---

# Local Query Owner

The Local Query Owner is responsible for:

- Android local queries.
- Web local queries.
- offline field support.
- local Sort.
- local pagination.
- local freshness.
- Owner partitioning.
- local query testing.

---

# Query Export Owner

The Query Export Owner is responsible for:

- Complete result reconstruction.
- source boundary.
- Export schema.
- Saved View Export.
- result-count verification.
- Authorization drift.
- Export correction.

---

# Query Security Owner

The Query Security Owner is responsible for:

- Owner isolation.
- Account isolation.
- cursor integrity.
- field Authorization.
- count side channels.
- identifier enumeration.
- Search-index credentials.
- Support and administrative query controls.
- cross-Owner Incident response.

---

# Query Privacy Owner

The Query Privacy Owner is responsible for:

- Search-term classification.
- Search history.
- Saved View privacy.
- autocomplete personalization.
- query telemetry.
- local cache retention.
- Privacy deletion.
- Owner deletion.

---

# Query Accessibility Owner

The Query Accessibility Owner is responsible for:

- Search labels.
- Filter-builder accessibility.
- Sort accessibility.
- result-count announcements.
- pagination.
- infinite scroll.
- Saved Views.
- stale and partial states.
- error recovery.

---

# Database Performance Owner

The Database Performance Owner is responsible for:

- Query plans.
- indexes.
- statistics.
- timeouts.
- join limits.
- full-scan prevention.
- concurrency.
- query performance testing.

---

# Query Operations Owner

The Query Operations Owner is responsible for:

- Query services.
- Search indexes.
- index queues.
- cache health.
- SLOs.
- alerts.
- runbooks.
- operational Incidents.
- capacity.

---

# Support Query Owner

The Support Query Owner is responsible for:

- Safe query diagnostics.
- predefined Support templates.
- query troubleshooting.
- field minimization.
- escalation.
- Support training.

---

# Audit and Evidence Owner

The Audit and Evidence Owner is responsible for:

- Query lifecycle Evidence.
- administrative query Evidence.
- Saved View change Evidence.
- index migration Evidence.
- query Export Evidence.
- Incident Evidence.
- retention.

---

# Query Responsibility Matrix

| Capability | Product | Domain | Financial | Security | Privacy | Accessibility | Operations |
|---|---|---|---|---|---|---|---|
| Text Search | Required | Required | As applicable | Required | Required | Required | Required |
| Money Filters | Required | Required | Required | Required | Required | Required | Required |
| Sorting | Required | Required | Required where applicable | Required | As applicable | Required | Required |
| Pagination | Required | Required | Required | Required | As applicable | Required | Required |
| Saved Views | Required | Required | As applicable | Required | Required | Required | Required |
| Search Index | As applicable | Required | As applicable | Required | Required | As applicable | Required |
| Query Export | Required | Required | Required | Required | Required | Required | Required |
| Administrative Query | Required | Required | Required where applicable | Required | Required | As applicable | Required |

---

# Query Schema Registry

Every Production Canonical Query schema must exist in the Query Schema Registry.

Recommended fields:

```text
querySchemaId

querySchemaKey

version

supportedResourceTypes

searchExpressionVersion

filterExpressionVersion

sortExpressionVersion

paginationVersion

projectionVersion

savedViewCompatibility

minimumApplicationVersions

introducedAt

deprecatedAt

retiredAt

owner

status
```

---

# Query Schema Identifier

Recommended format:

```text
QUERY-SCHEMA-<NUMBER>
```

---

# Query Schema Status

Recommended:

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

# Query Schema Activation Requirements

```text
□ Resource Types are defined.

□ Search Expression schema is defined.

□ Filter schema is defined.

□ Sort schema is defined.

□ pagination schema is defined.

□ projection schema is defined.

□ cursor behavior is defined.

□ null semantics are defined.

□ money semantics are defined.

□ currency semantics are defined.

□ date semantics are defined.

□ compatibility is defined.

□ Security review is complete.

□ Privacy review is complete.

□ Financial review is complete.

□ Accessibility requirements are defined.

□ test vectors exist.
```

---

# Query Schema Compatibility

Recommended categories:

```text
FullyCompatible

BackwardCompatible

ForwardReadable

MigrationRequired

Unsupported
```

---

# Query Schema Breaking Change

A new schema version is required when changing:

- Operator meaning.
- null behavior.
- money representation.
- currency inheritance.
- date-boundary behavior.
- Sort comparison.
- cursor interpretation.
- Saved View meaning.
- projection Authorization.
- Filter composition.

---

# Query Field Governance

Every field must remain governed through the Query Field Registry.

A database column must not become queryable merely because it exists.

---

# Query Field Activation Requirements

```text
□ Resource Type is defined.

□ Canonical field is defined.

□ data Type is defined.

□ Search eligibility is defined.

□ Filter eligibility is defined.

□ Sort eligibility is defined.

□ group eligibility is defined.

□ facet eligibility is defined.

□ return eligibility is defined.

□ offline eligibility is defined.

□ operators are defined.

□ null behavior is defined.

□ currency behavior is defined.

□ time-zone behavior is defined.

□ classification is defined.

□ masking policy is defined.

```

---

# Query Field Semantic Stability

A field must not change meaning within one active field version.

Example:

```text
transaction.amount
```

must not change from:

```text
Signed exact canonical amount
```

to:

```text
Absolute display amount
```

without a new version and migration.

---

# Searchable-but-Not-Returnable Field

A field may support Search without direct return only after Security and Privacy review.

Potential example:

```text
Masked external reference
```

The response must not confirm inaccessible values through unsafe snippets or counts.

---

# Returnable-but-Not-Searchable Field

A field may be shown in authorized results without entering Search.

---

# Sortable Field Governance

A Sortable field must define:

- Comparison Type.
- collation.
- null placement.
- currency behavior.
- tie-breaker.
- index support.
- local-query support.
- compatibility.

---

# Facetable Field Governance

A Facetable field must define:

- Maximum distinct values.
- count semantics.
- missing-value semantics.
- selected-value behavior.
- Privacy risk.
- index support.
- fallback behavior.

---

# Query Operator Governance

Every Operator must exist in the Query Operator Registry.

Recommended fields:

```text
queryOperatorId

operatorKey

supportedDataTypes

valueCardinality

nullBehavior

collectionBehavior

negationBehavior

complexityWeight

databaseImplementation

indexImplementation

localImplementation

owner

version

status
```

---

# Query Operator Identifier

Recommended format:

```text
QUERY-OPERATOR-<NUMBER>
```

---

# Query Operator Activation Requirements

```text
□ Meaning is defined.

□ supported data Types are defined.

□ value cardinality is defined.

□ null behavior is defined.

□ empty behavior is defined.

□ negation behavior is defined.

□ database behavior is defined.

□ Search-index behavior is defined.

□ Android local behavior is defined where supported.

□ Web local behavior is defined where supported.

□ complexity cost is defined.

□ test vectors exist.
```

---

# Operator Semantic Equivalence

Database, Search-index and local implementations must preserve equivalent logical meaning.

A field may be marked unsupported locally when equivalent behavior cannot be guaranteed.

---

# Null-Semantics Governance

The Query Schema must define:

```text
Null

Missing

Empty Text

Empty Collection

Zero

False
```

for every applicable Operator.

---

# `NotEquals` Governance

Recommended invariant:

```text
NotEquals(value)
```

does not include null or missing values unless the query explicitly requests them.

---

# Negation Governance

Negation must not produce an unbounded complement across unauthorized or unscoped data.

Every negated query remains inside:

- Canonical Owner.
- authorized Accounts.
- Resource Type.
- approved state population.

---

# Logical Group Governance

Logical groups must define:

- Maximum depth.
- maximum expressions.
- maximum child groups.
- maximum OR branches.
- allowed negation.
- complexity weight.

---

# Contradiction Governance

Contradictory Filters may be:

- Rejected.
- normalized to a controlled Empty result.
- or flagged with a warning.

The behavior must be deterministic.

---

# Search Mode Registry

Every Search mode should be registered.

Recommended fields:

```text
searchModeId

searchModeKey

eligibleFieldTypes

tokenizationPolicy

minimumLength

maximumLength

rankingPolicy

prefixPolicy

phrasePolicy

identifierBehavior

owner

version

status
```

---

# Search Mode Identifier

Recommended format:

```text
SEARCH-MODE-<NUMBER>
```

---

# Search Mode Activation Requirements

```text
□ Eligible fields are defined.

□ normalization is defined.

□ tokenization is defined.

□ minimum input length is defined.

□ maximum input length is defined.

□ ranking is defined.

□ tie-breakers are defined.

□ identifier behavior is defined.

□ Privacy review is complete.

□ Security review is complete.

□ Accessibility behavior is defined.
```

---

# Text Normalization Governance

Every text normalization policy must be versioned.

Recommended fields:

```text
textNormalizationPolicyId

locale

unicodeNormalization

casePolicy

accentPolicy

whitespacePolicy

punctuationPolicy

tokenizationPolicy

stopWordPolicy

stemmingPolicy

owner

version
```

---

# Canonical Text Protection

Search normalization must not rewrite canonical stored text.

---

# Accent Governance

Accent-insensitive Search may use a derived normalized projection.

A query for:

```text
transporte publico
```

may match:

```text
Transporte público
```

without changing the canonical description.

---

# Stemming Governance

Stemming requires:

- Field allowlist.
- language.
- version.
- test corpus.
- ranking review.
- false-match monitoring.
- rollback.

---

# Identifier Search Governance

Identifier Search should remain exact and nonenumerable.

Prefix identifier Search requires exceptional approval.

---

# Financial Query Governance

Financial query semantics must remain aligned with the Financial Calculations specification.

---

# Money Field Registry

Every Money query field should define:

```text
Canonical decimal field

Currency field

Scale policy

Sign meaning

Direction relationship

Minimum

Maximum

Multi-currency behavior

Sort behavior

Grouping behavior
```

---

# Generic pt-BR Money Example

Owner input:

```text
R$ 1.250,45
```

Canonical query value:

```text
amount:
"1250.45"

currency:
"BRL"
```

The query must not become:

```text
"1.25045"

or

"125045"
```

---

# Money Comparison Governance

Money comparison must use:

```text
Exact amount

+

Compatible currency
```

---

# Currency-Omission Governance

A query omitting currency may proceed only when:

- One selected Account currency resolves deterministically.
- one registered Resource scope has one currency.
- or the interface explicitly applies separate comparisons per currency.

---

# Multi-Currency Governance

Multi-currency queries must define whether they:

```text
Separate currencies

Group by currency

Require one currency

or

Use an approved converted Reporting field
```

Ordinary canonical amounts must not be compared across currencies as equivalent units.

---

# Converted Financial Query

Filtering by a converted amount requires:

- Registered conversion policy.
- rate source.
- rate time.
- target currency.
- rounding.
- source amount preservation.
- derived-field freshness.
- Reporting or Calculation boundary.

---

# Financial Sort Governance

Financial Sort across currencies must use one approved strategy.

Safe default:

```text
Currency

then

Exact amount

then

Resource ID
```

---

# Financial Grouping Governance

Grouped financial totals must use canonical Calculation or Reporting services.

The query engine must not invent totals by summing incomplete projected pages.

---

# Date and Time-Zone Governance

Every date-capable field must define:

- Temporal Type.
- input formats.
- output format.
- time-zone behavior.
- relative-period behavior.
- inclusivity.
- calendar policy.
- local-query support.

---

# Relative Period Registry

Recommended fields:

```text
relativePeriodId

relativePeriodKey

calendarPolicy

timeZonePolicy

startBoundary

endBoundary

inclusivePolicy

owner

version

status
```

---

# Relative Period Resolution Evidence

A material query may preserve:

```text
Relative period:
CurrentMonth

Resolved start:
2026-07-01

Resolved end:
2026-07-31

Time zone:
America/Sao_Paulo

Resolved at:
...
```

---

# Time-Zone Database Governance

Time-zone database versions should be governed where historical Timestamp behavior may change.

---

# Sort Policy Registry

Every default or complex Sort should be registered.

Recommended fields:

```text
sortPolicyId

resourceType

sortKey

fields

directions

nullPlacement

collation

currencyBehavior

tieBreaker

databaseSupport

indexSupport

localSupport

owner

version

status
```

---

# Sort Policy Activation Requirements

```text
□ Resource Type is defined.

□ fields are registered.

□ direction is defined.

□ null placement is defined.

□ collation is defined.

□ currency behavior is defined.

□ unique tie-breaker exists.

□ database implementation exists.

□ index implementation exists where required.

□ local implementation exists where supported.

□ cursor predicates are tested.
```

---

# Default Sort Governance

Every collection must have one registered default Sort.

---

# Sort Stability Governance

A Sort is acceptable only when it creates a deterministic total order.

---

# Pagination Policy Registry

Recommended fields:

```text
paginationPolicyId

resourceType

supportedModes

defaultMode

allowedPageSizes

maximumPageSize

consistencyModel

cursorPolicyReference

countPolicy

previousPageSupport

owner

version

status
```

---

# Pagination Consistency Models

Recommended:

```text
SnapshotBound

SequenceBound

BestEffortCurrent

StaticDataset
```

---

# SnapshotBound Governance

SnapshotBound pagination is required when:

- Export membership must remain exact.
- administrative review requires repeatability.
- financial reconciliation depends on fixed membership.
- investigation requires reproducible pages.

---

# BestEffortCurrent Governance

BestEffortCurrent may be used for:

- ordinary feeds.
- recent Notifications.
- interactive Resource lists.

The interface must disclose possible changes when material.

---

# Cursor Policy Registry

Recommended fields:

```text
queryCursorPolicyId

resourceType

paginationMode

maximumAge

integrityMethod

ownerBinding

queryBinding

sortBinding

projectionBinding

dataBoundaryBinding

indexGenerationBinding

renewalPolicy

owner

version
```

---

# Cursor Activation Requirements

```text
□ Owner binding exists.

□ Resource Type binding exists.

□ query hash binding exists.

□ Sort binding exists.

□ last Sort values are defined.

□ tie-breaker is included.

□ data boundary is included.

□ expiration is defined.

□ integrity protection exists.

□ incompatible reuse is rejected.

□ raw cursor logging is prohibited.
```

---

# Cursor Renewal Governance

Cursor renewal must not:

- Skip records.
- repeat previously returned Resources unexpectedly.
- broaden scope.
- change Sort.
- change projection.
- change data boundary silently.

---

# Count Policy Registry

Every Resource Type should define Count behavior.

Recommended:

```text
Exact

Estimated

Restricted

Unavailable

Asynchronous
```

---

# Exact Count Governance

Exact counts must use the same logical membership and Authorization as results.

---

# Estimated Count Governance

Estimates must:

- Be labeled.
- identify approximation state.
- not be used as financial totals.
- not appear in Audit Evidence as exact values.

---

# Count Privacy Governance

Counts may be restricted when they reveal:

- Another Owner's Resource existence.
- restricted administrative population.
- sensitive Category membership.
- high-risk Support information.

---

# Facet Policy Registry

Recommended fields:

```text
facetPolicyId

resourceType

field

maximumValues

sort

countSemantics

missingValueBehavior

selectedValueBehavior

privacyRisk

owner

version

status
```

---

# Autocomplete Policy Registry

Recommended fields:

```text
autocompletePolicyId

resourceType

field

minimumPrefixLength

maximumSuggestions

rankingPolicy

historyUse

maskingPolicy

rateLimitPolicy

owner

version

status
```

---

# Autocomplete Governance

Autocomplete must not become:

- Identifier enumeration.
- cross-Owner value discovery.
- Search-history leakage.
- deleted Resource discovery.
- unrestricted private description extraction.

---

# Result Projection Governance

Every projection must exist in the Result Projection Registry.

Recommended fields:

```text
resultProjectionId

projectionKey

resourceType

fields

relationshipFields

derivedFields

requiredCapabilities

maskingPolicy

minimumApplicationVersion

owner

version

status
```

---

# Projection Activation Requirements

```text
□ Resource Type is defined.

□ fields are registered and returnable.

□ relationship fields are bounded.

□ derived fields identify policy and freshness.

□ required capabilities are defined.

□ masking is defined.

□ Android support is defined.

□ Web support is defined.

□ Accessibility labels are defined.
```

---

# Projection Authority

Projection selection must occur after Authorization.

The client may request an approved projection key.

It must not submit unrestricted database field names.

---

# Projection Downgrade

When one field becomes unavailable, Nexio may:

- Return a safe reduced projection with warning.
- reject the query.
- invalidate a Saved View.

The policy must be explicit.

---

# Saved View Governance Architecture

Saved Views are governed canonical Owner Resources.

---

# Saved View Registry

Recommended governance fields:

```text
savedViewPolicyId

resourceType

allowedSearchModes

allowedFields

allowedOperators

allowedSortPolicies

allowedProjections

accountScopeModels

datePolicyModels

defaultViewRules

sharingAllowed

retentionPolicy

owner

version

status
```

---

# Saved View Creation Requirements

```text
□ Owner is resolved.

□ Resource Type is authorized.

□ Query schema is supported.

□ fields are active.

□ operators are active.

□ Sort is stable.

□ projection is authorized.

□ Account scope model is defined.

□ date policy is defined.

□ currency scope is valid.

□ name is safe.

□ operationId exists where Retry is possible.
```

---

# Saved View Execution Governance

Every execution must revalidate:

- Owner.
- Account scope.
- Resource Type.
- Search mode.
- fields.
- operators.
- Sort.
- projection.
- Feature availability.
- current Authorization.
- schema compatibility.

---

# Saved View Migration Policy Registry

Recommended fields:

```text
savedViewMigrationPolicyId

fromQuerySchemaVersion

toQuerySchemaVersion

fieldMappings

operatorMappings

sortMappings

projectionMappings

semanticEquivalence

ownerWarningRequired

automaticAllowed

owner

version

status
```

---

# Automatic Saved View Migration

Automatic migration is allowed only when semantic equivalence is proven.

---

# Saved View Migration Prohibitions

Automatic migration must not:

- Broaden Account scope.
- add newly sensitive fields.
- change fixed periods to relative periods.
- change relative periods to fixed periods.
- remove currency restrictions.
- replace exact money with converted money.
- remove financial state Filters.
- enable sharing.
- change Owner.

---

# Saved View Retention

Deleted Saved Views may retain:

- Safe identifier.
- Owner reference.
- deletion time.
- schema version.
- minimal Audit Evidence.

The active query definition should be removed according to policy.

---

# System View Governance

System Views must be:

- Registered.
- versioned.
- Resource-Type-specific.
- localization-aware.
- application-version-aware.
- testable.
- nonauthoritative for access.

---

# Default View Governance

Default-view assignment must use:

- Canonical Owner.
- Resource Type.
- Resource version.
- stable operation identity.
- conflict detection.

---

# Saved View Sharing Governance

Sharing remains disabled unless a separate collaboration specification defines:

- Sender.
- recipient.
- Account scope.
- fields.
- current Authorization.
- revocation.
- synchronization.
- Audit.
- Privacy.
- expiration.

---

# Search History Governance

Search history requires a registered Product purpose.

---

# Search History Policy Registry

Recommended fields:

```text
searchHistoryPolicyId

storageMode

resourceTypes

maximumEntries

retention

rawTextAllowed

normalization

personalizationUse

clearBehavior

ownerSwitchBehavior

privacyExportBehavior

owner

version

status
```

---

# Search History Activation Requirements

```text
□ Product purpose is documented.

□ Owner benefit is documented.

□ storage mode is defined.

□ maximum entries are defined.

□ retention is defined.

□ raw Search-term behavior is defined.

□ Owner clear control exists where applicable.

□ Owner switching is safe.

□ Privacy Export behavior is defined.

□ Privacy deletion behavior is defined.
```

---

# Search History Suppression

History should be suppressed for:

- Security-sensitive identifier Search.
- privileged administrative Search.
- Support queries.
- Privacy request queries.
- Incognito Search.
- queries containing download tokens.
- queries containing Authentication secrets.

---

# Query Cache Governance

Every query cache implementation must be registered.

Recommended fields:

```text
queryCacheImplementationId

cacheLayer

resourceTypes

ownerPartitionModel

authorizationVersionModel

queryHashModel

projectionModel

dataBoundaryModel

expiration

invalidationEvents

staleBehavior

encryption

owner

version

status
```

---

# Query Cache Activation Requirements

```text
□ Owner partition exists.

□ Authorization boundary exists.

□ query hash exists.

□ projection is included.

□ data boundary is included.

□ expiration is defined.

□ invalidation exists.

□ Privacy deletion exists.

□ Account-access invalidation exists.

□ stale financial behavior is defined.

□ cross-Owner tests pass.
```

---

# Search Index Governance Architecture

Every Search-index implementation and generation must be registered.

---

# Search Index Registry

Recommended fields:

```text
searchIndexId

indexKey

resourceTypes

schemaVersion

analyzerVersions

ownerPartitionModel

accountPartitionModel

documentProjection

updatePolicy

freshnessPolicy

rebuildPolicy

retentionPolicy

credentialPolicy

owner

status
```

---

# Search Index Generation Registry

Recommended fields:

```text
indexGenerationId

searchIndexId

schemaVersion

analyzerVersions

sourceBoundary

buildStartedAt

buildCompletedAt

validationState

cutoverState

retirementState

owner

status
```

---

# Index Activation Requirements

```text
□ Index schema is registered.

□ Owner partition is implemented.

□ Account scope is implemented.

□ document projection is minimized.

□ Resource version is preserved.

□ deletion behavior exists.

□ update idempotency exists.

□ stale-update protection exists.

□ freshness is monitored.

□ rebuild exists.

□ cutover exists.

□ rollback exists.

□ credentials use least privilege.

□ integrity tests pass.
```

---

# Search Analyzer Governance

Every analyzer must define:

- Locale.
- Unicode normalization.
- case behavior.
- accent behavior.
- tokenization.
- prefix behavior.
- phrase behavior.
- stop words.
- stemming.
- version.

---

# Index Field Governance

An indexed field must be independently approved.

A returnable field is not automatically indexable.

---

# Index Update Governance

Every canonical update path must preserve:

```text
Resource ID

Owner ID

Account ID where applicable

Resource version

Index generation

Operation Type

Synchronization sequence

Final state
```

---

# Index Rebuild Governance

Index rebuilds require:

- Source boundary.
- current canonical readers.
- Owner-partition verification.
- field-projection verification.
- deletion verification.
- Resource-version verification.
- shadow queries.
- cutover gate.
- rollback.

---

# Local Query Governance

Every local query engine must be registered per Platform.

---

# Local Query Implementation Registry

Recommended fields:

```text
localQueryImplementationId

platform

storageTechnology

resourceTypes

querySchemaVersion

supportedFields

supportedOperators

supportedSortPolicies

supportedPagination

freshnessModel

ownerPartitionModel

owner

version

status
```

---

# Local Query Activation Requirements

```text
□ Owner partition is verified.

□ Resource Types are defined.

□ fields are defined.

□ operators are defined.

□ exact money support is verified.

□ date behavior is verified.

□ Sort stability is verified.

□ local freshness is disclosed.

□ unsupported behavior is blocked.

□ Owner-switch cleanup exists.

□ sign-out cleanup exists.

□ Accessibility is verified.
```

---

# Local Query Semantic Downgrade

A local query must not approximate unsupported semantics silently.

Example:

- A server phrase Search must not become an uncontrolled substring Search locally.
- A server accent policy must not change without warning.
- A Money comparison must not use floating-point approximation.
- A SnapshotBound query must not claim equivalent local completeness.

---

# Query Export Governance

Every Query Export must reference:

- Canonical Query.
- Saved View version where applicable.
- Owner.
- Accounts.
- fields.
- source boundary.
- Export Type.
- Export schema.
- expected result count.
- exported result count.
- verification state.

---

# Query Export Membership Governance

Complete Export membership must be resolved independently from loaded interface pages.

---

# Query Export Sort Governance

The Export should preserve the registered Sort when order is meaningful.

---

# Query Export Drift Governance

Authorization or Account changes during generation must never broaden output.

---

# Support Query Governance

Support queries must use registered safe templates.

---

# Support Query Template Registry

Recommended fields:

```text
supportQueryTemplateId

purpose

resourceType

allowedFields

allowedFilters

allowedSort

maximumPeriod

maximumResults

requiredCaseReference

requiredCapability

owner

version

status
```

---

# Support Query Activation Requirements

```text
□ Purpose is defined.

□ Case reference is required.

□ Owner scope is required.

□ fields are minimized.

□ Filters are bounded.

□ period is bounded.

□ result count is bounded.

□ Export is disabled or separately controlled.

□ Audit exists.

□ Support guidance exists.
```

---

# Administrative Query Governance

Administrative queries are high risk.

They require:

- Explicit purpose.
- exceptional capability.
- bounded Owner population.
- bounded Resource scope.
- field minimization.
- short retention.
- query Evidence.
- no unrestricted query language.
- no unrestricted Export.
- review.

---

# Administrative Query Session

Recommended structure:

```text
AdministrativeQuerySession
 ├── administrativeQuerySessionId
 ├── actorId
 ├── purpose
 ├── caseOrIncidentReference
 ├── authorizedPopulation
 ├── allowedFields
 ├── expiresAt
 ├── state
 ├── createdAt
 └── completedAt
```

---

# Administrative Query Session Identifier

Recommended format:

```text
aqs_<sortable-unique-identifier>
```

---

# Administrative Query Session States

Recommended:

```text
Requested

Approved

Active

Expired

Revoked

Completed

Rejected
```

---

# Administrative Query Separation of Duties

For high-risk cross-Owner administrative querying, separate:

```text
Requester

Approver

Executor

Reviewer

Export approver
```

---

# Query Security Governance

Security must govern:

- Query APIs.
- Search-index access.
- cursor generation.
- query caches.
- Saved Views.
- Search history.
- Support templates.
- administrative Sessions.
- query Exports.
- local replicas.

---

# Query Capabilities

Potential capabilities include:

```text
QUERY_OWNER_RESOURCE

QUERY_ADVANCED_FILTER

QUERY_SAVED_VIEW_MANAGE

QUERY_HISTORY_MANAGE

QUERY_EXPORT

QUERY_SUPPORT_SAFE

QUERY_ADMIN_BOUNDED

QUERY_INDEX_ADMIN

QUERY_SCHEMA_ADMIN

QUERY_INCIDENT_VIEW
```

---

# Query Authorization Order

Recommended:

```text
Authenticate Actor

↓

Resolve canonical Owner

↓

Validate Resource Type

↓

Validate Account scope

↓

Validate field access

↓

Validate operators and values

↓

Validate projection

↓

Validate cursor

↓

Execute bounded query
```

---

# Query Input Security

All query values must be treated as data.

They must never become:

- Raw SQL.
- raw Search-engine query language.
- script.
- shell command.
- template code.
- unrestricted regular expression.
- database function name.
- field name outside the Registry.

---

# Query Side-Channel Governance

Security review must address:

- Result counts.
- facet counts.
- autocomplete.
- response differences.
- error codes.
- timing.
- cursor acceptance.
- Search suggestions.
- Saved View errors.

---

# Query Privacy Governance

Privacy must govern:

- Search text.
- Filters.
- Saved Views.
- Search history.
- autocomplete personalization.
- query caches.
- local state.
- telemetry.
- Support diagnostics.
- AI use.

---

# Query Retention Policy

A Query Retention Policy should define:

```text
Raw Search terms

Normalized Search terms

Query execution metadata

Saved Views

Search history

Autocomplete personalization

Query cache

Administrative query Evidence

Support query Evidence
```

---

# Raw Search-Term Retention

Raw Search terms should not be retained by default in ordinary telemetry.

---

# Query Evidence Minimization

Evidence may preserve:

- Query ID.
- query hash.
- Resource Type.
- policy versions.
- field IDs.
- operator IDs.
- result state.
- safe count category.
- actor and purpose for privileged queries.

It should avoid complete financial descriptions.

---

# Privacy Deletion Propagation

Privacy deletion may require removing:

- Saved Views.
- Search history.
- autocomplete personalization.
- query caches.
- Search-index documents.
- local query state.
- query-derived recommendations.

---

# Query Accessibility Governance

Accessibility requirements must be part of field, operator, projection and view Registries.

---

# Accessible Field Names

Every query field should have localized accessible display text.

Internal names such as:

```text
transaction_effective_date
```

must not be the only Owner-facing label.

---

# Accessible Operator Names

Operators should use understandable language.

Examples:

```text
Equals

Does not equal

Contains

Is before

Is after

Is between

Is empty
```

---

# Accessible Logical Groups

Advanced AND and OR groups should expose:

- Group meaning.
- nested structure.
- add condition.
- remove condition.
- conjunction choice.
- validation.

---

# Accessible Saved View Conflict

Example:

```text
“This view was changed on another device. Reload the current version or save your changes as a new view.”
```

---

# Accessible Cursor Expiration

Example:

```text
“Results changed while this page was open. The list has been refreshed from the beginning.”
```

---

# Query Audit Evidence

Material Events may include:

```text
Query schema activated

Query field activated

Operator activated

Sort policy changed

Cursor policy changed

Saved View migrated

System View changed

Search index cut over

Search index rolled back

Administrative query approved

Query Export requested

Cross-Owner query attempt detected

Query Incident opened
```

---

# Query Evidence Record

Recommended structure:

```text
queryEvidenceId

eventType

queryId

queryExecutionId

savedViewId

indexGenerationId

ownerScope

accountScope

actorReference

querySchemaVersion

fieldReferences

operatorReferences

sortPolicyReference

cursorPolicyReference

projectionReference

dataBoundary

previousState

newState

reason

occurredAt

integrityReference
```

---

# Query Observability Governance

Observability must detect:

```text
Validation failure

Query timeout

Full-scan risk

Index lag

Index integrity failure

Cursor invalidity

Pagination duplication

Pagination omission

Count mismatch

Facet leak

Autocomplete leak

Saved View conflict

Cache isolation failure

Local query inconsistency

Query Export drift

Cross-Owner exposure
```

---

# Required Query Alerts

Recommended levels:

```text
Informational

Moderate

High

Critical
```

---

# Critical Query Alerts

Trigger immediately for:

```text
Cross-Owner query result

Cross-Owner count or facet disclosure

Cross-Owner autocomplete disclosure

Cross-Owner Saved View access

Cross-Owner cache reuse

Cross-Owner index document

Unauthorized field return

Query Export containing unauthorized data

Previous Owner query state displayed
```

---

# High Query Alerts

Potential High alerts include:

```text
Incorrect exact-money comparison

Incorrect currency comparison

SnapshotBound pagination inconsistency

Search-index integrity failure

Deleted Resource still searchable

Saved View Authorization bypass

Persistent pagination duplication

Administrative query-scope violation
```

---

# Moderate Query Alerts

Potential Moderate alerts include:

```text
Autocomplete latency degradation

Estimated count unavailable

NearCurrent Search-index lag

Saved View migration warning

Optional facet failure

Local Search unavailable
```

---

# Query SLO Governance

SLOs should be defined by Resource Type and query category.

---

# Core Query SLOs

Potential SLOs include:

```text
Interactive Search latency

Exact identifier lookup

Money Filter correctness

Pagination continuation

Index freshness

Autocomplete latency

Saved View execution

Query Export creation

Query cache correctness

Owner isolation
```

---

# Money Filter Correctness SLO

Target:

```text
Zero incorrect exact-money or currency membership caused by query execution defects.
```

---

# Pagination Correctness SLO

Target:

```text
Zero duplicate or omitted Resources within one SnapshotBound query caused by cursor defects.
```

---

# Search Index Integrity SLO

Target:

```text
An index with failed integrity never serves results as Current.
```

---

# Saved View Correctness SLO

Target:

```text
A Saved View never broadens current Owner, Account, field or Authorization scope.
```

---

# Query Incident Architecture

Query Incidents must preserve:

- Query ID.
- query hash.
- schema version.
- field and operator references.
- Owner and Account scope.
- execution source.
- index generation.
- cursor-safe reference.
- data boundary.
- result projection.
- affected Exports.

---

# Query Incident Response Sequence

```text
Detect

↓

Stop affected query, index, cache, cursor or Saved View path

↓

Preserve Query and execution Evidence

↓

Identify affected Owners, Accounts and Resource Types

↓

Identify returned fields, counts, facets and autocomplete values

↓

Invalidate unsafe cursors and caches

↓

Disable affected index generation where required

↓

Revoke affected Query Exports

↓

Correct field, operator, Sort, cursor or Authorization logic

↓

Rebuild indexes where required

↓

Verify exact money, currency and pagination behavior

↓

Communicate verified impact

↓

Review root cause
```

---

# Cross-Owner Query Incident

Required response:

- Stop the affected query path.
- invalidate affected cursors.
- clear affected caches.
- disable affected Saved Views or index generation.
- identify exposed Owners.
- identify returned Resources and fields.
- identify counts, facets or snippets disclosed.
- revoke affected Exports.
- notify Security and Privacy.
- execute cross-Owner regression tests.

---

# Incorrect Exact-Money Incident

Required response:

- Stop affected Money field or Operator.
- preserve normalized decimal values.
- preserve currency.
- identify affected query results.
- identify affected Saved Views.
- invalidate query caches.
- revoke affected Exports.
- correct exact comparison.
- add pt-BR test vectors.

---

# Incorrect Date-Boundary Incident

Required response:

- Preserve date Type.
- preserve selected time zone.
- identify relative-period resolution.
- identify affected Resources and Exports.
- correct inclusivity or time-zone conversion.
- invalidate affected caches.
- add daylight-saving and date-only tests.

---

# Cursor Integrity Incident

Required response:

- Reject affected cursors.
- identify cursor-policy version.
- identify query scope.
- invalidate raw cursor family where required.
- restart pagination safely.
- verify no cross-Owner acceptance.
- correct signing or serialization.
- add cursor-tampering tests.

---

# Search Index Cross-Owner Incident

Required response:

- Stop affected index generation.
- identify incorrectly partitioned documents.
- prevent fallback from using unsafe IDs.
- rebuild from canonical Owner-scoped data.
- validate every Owner partition.
- notify Security and Privacy.
- preserve cutover and generation Evidence.

---

# Saved View Migration Incident

Required response:

- Stop migration policy.
- identify migrated Views.
- restore previous definitions where possible.
- invalidate broadened Views.
- preserve View versions.
- correct migration.
- notify Owners when material.

---

# Query Cache Isolation Incident

Required response:

- Disable affected cache layer.
- clear unsafe entries.
- identify source and recipient Owners.
- verify underlying query APIs.
- correct cache key.
- notify Security and Privacy.
- add cache-partition tests.

---

# Query Testing Governance

Testing must cover:

```text
Query Schemas

Fields

Operators

Text Search

Identifiers

Money

Currency

Dates

Time Zones

Nulls

Logical Groups

Sort

Pagination

Cursors

Counts

Facets

Autocomplete

Projections

Saved Views

Search History

Caching

Indexes

Android

Web

Local Search

Query Export

Security

Privacy

Accessibility

Migration

Recovery
```

---

# Query Schema Tests

Verify:

- Supported schema.
- unsupported schema.
- backward compatibility.
- malformed Filter expression.
- malformed Sort.
- malformed projection.
- malformed page request.
- Saved View compatibility.

---

# Field Registry Tests

Verify:

- Searchable field.
- nonsearchable field.
- filterable field.
- nonfilterable field.
- sortable field.
- nonsortable field.
- returnable field.
- restricted field.
- offline-eligible field.
- retired field.

---

# Operator Tests

Verify:

- Supported Type.
- unsupported Type.
- null.
- empty.
- zero.
- false.
- list semantics.
- negation.
- boundary inclusion.
- invalid cardinality.

---

# Text Search Tests

Verify:

- Exact.
- phrase.
- prefix.
- token.
- accent-insensitive.
- case-insensitive.
- punctuation.
- multiple whitespace.
- minimum length.
- maximum length.
- wildcard text.
- script-like text.
- SQL-like text.
- prompt-injection text.

---

# pt-BR Search Tests

Verify:

```text
“alimentacao”
matches
“Alimentação”
```

where accent-insensitive Search is configured.

Verify:

```text
“São Paulo”
```

preserves canonical accents in results.

---

# Identifier Tests

Verify:

- Valid identifier.
- invalid prefix.
- excessive length.
- inaccessible identifier.
- another Owner's identifier.
- deleted Resource.
- partial prefix.
- enumeration resistance.

---

# Exact Money Tests

Verify:

```text
Owner input:
R$ 1.250,45

Canonical:
"1250.45"

Currency:
BRL
```

Also verify:

- R$ 0,00.
- R$ 0,01.
- negative value.
- maximum value.
- excessive precision.
- invalid grouping.
- scientific notation.
- missing currency.
- different currency.
- absolute amount.
- direction and sign.

---

# Money Range Tests

Verify:

- Inclusive lower.
- exclusive lower.
- inclusive upper.
- exclusive upper.
- equal boundaries.
- reversed boundaries.
- multi-currency separation.
- Account currency inheritance.
- closed Account.

---

# Date Tests

Verify:

- Date-only equality.
- inclusive date range.
- timestamp instant.
- offset handling.
- relative Today.
- CurrentMonth.
- previous month.
- leap day.
- invalid date.
- week start.
- daylight-saving transition.
- fixed Saved View period.
- relative Saved View period.

---

# Null Tests

Verify:

- Null.
- missing.
- empty text.
- whitespace-only text.
- empty collection.
- zero.
- false.
- NotEquals with null.
- IsEmpty.
- IsNotEmpty.

---

# Logical Group Tests

Verify:

- AND.
- OR.
- nested AND and OR.
- negation.
- maximum depth.
- maximum expressions.
- contradiction.
- broad complement prevention.

---

# Sort Tests

Verify:

- Ascending.
- descending.
- null first.
- null last.
- locale-aware text.
- exact Money.
- multi-currency.
- date-only.
- Timestamp.
- stable tie-breaker.
- duplicate primary values.

---

# Cursor Tests

Verify:

- Valid cursor.
- expired cursor.
- modified cursor.
- wrong Owner.
- wrong query.
- wrong Sort.
- wrong projection.
- wrong environment.
- wrong index generation.
- incompatible schema.
- changed Authorization.
- changed Account access.

---

# Pagination Tests

Verify:

- First page.
- middle page.
- final page.
- page-size limit.
- duplicate primary Sort values.
- null Sort values.
- concurrent insertion.
- concurrent update.
- concurrent deletion.
- SnapshotBound.
- SequenceBound.
- BestEffortCurrent.
- previous page.
- infinite scroll.

---

# Count Tests

Verify:

- Exact.
- estimated.
- unavailable.
- restricted.
- unauthorized Resource exclusion.
- canonical revalidation removal.
- timeout.
- stale index.

---

# Facet Tests

Verify:

- Account.
- Category.
- state.
- currency.
- missing value.
- selected value outside top results.
- maximum facet count.
- sensitive field rejection.
- another Owner's value exclusion.

---

# Autocomplete Tests

Verify:

- Minimum prefix.
- authorized Account.
- unauthorized Account.
- deleted Resource.
- previous Owner history.
- complete sensitive identifier.
- rate limit.
- accent behavior.
- system preset.
- Owner history suppression.

---

# Projection Tests

Verify:

- Summary projection.
- detail projection.
- unauthorized field.
- masked field.
- derived field.
- relationship expansion.
- unsupported projection.
- stale Saved View projection.

---

# Saved View Tests

Verify:

- Create.
- update.
- duplicate.
- delete.
- set default.
- concurrent update.
- stale Resource version.
- field removal.
- operator removal.
- Account deletion.
- Authorization change.
- schema migration.
- fixed period.
- relative period.
- offline execution.
- Query Export.

---

# Search History Tests

Verify:

- Disabled mode.
- local-only mode.
- canonical mode.
- entry limit.
- expiration.
- clear.
- Owner switching.
- Incognito Search.
- sensitive Search suppression.
- Privacy Export.
- Owner deletion.

---

# Query Cache Tests

Verify:

- Hit.
- miss.
- expiration.
- stale state.
- Owner partition.
- Authorization version.
- projection.
- Account-access invalidation.
- Privacy deletion.
- negative result.
- financial-data change.
- cache stampede.

---

# Search Index Tests

Verify:

- Create document.
- update document.
- delete document.
- stale update rejection.
- duplicate Event.
- Owner partition.
- Account partition.
- Resource version.
- index lag.
- index outage.
- integrity failure.
- rebuild.
- cutover.
- rollback.
- retired generation.

---

# Android Query Tests

Verify:

- Process recreation.
- Owner switching.
- sign-out.
- local Search.
- offline Saved View.
- cursor restoration.
- foldable layout.
- Search debounce.
- paging Retry.
- synchronization invalidation.
- Accessibility.

---

# Web Query Tests

Verify:

- URL query restoration.
- URL privacy.
- hard reload.
- browser back and forward.
- multi-tab Owner switching.
- IndexedDB local Search.
- infinite scroll.
- table pagination.
- referrer policy.
- Accessibility.

---

# Query Export Tests

Verify:

- Complete membership.
- loaded-page exclusion.
- Saved View version.
- Owner.
- Accounts.
- source boundary.
- exact result count.
- Authorization drift.
- invalidated query.
- revoked Export.
- SnapshotBound consistency.

---

# Security Tests

Verify:

- SQL injection.
- Search-engine query-language injection.
- script injection.
- unrestricted regex.
- identifier enumeration.
- count probing.
- facet probing.
- cursor tampering.
- cross-Owner Saved View.
- cross-Owner cache.
- cross-Owner index.
- Support-template restriction.
- administrative capability.

---

# Privacy Tests

Verify:

- Raw Search-term telemetry minimization.
- Search-history retention.
- previous Owner suggestions.
- Saved View deletion.
- Owner deletion.
- autocomplete personalization deletion.
- query-cache deletion.
- Search-index deletion.
- Privacy Export.

---

# Accessibility Tests

Verify:

- Search label.
- Filter labels.
- Filter-chip removal.
- logical-group navigation.
- Money currency announcement.
- date-boundary announcement.
- Sort announcement.
- result count.
- partial warning.
- empty state.
- pagination.
- infinite-scroll alternative.
- Saved View conflict.
- cursor expiration.

---

# Property-Based Query Tests

Potential invariants include:

```text
Every returned Resource belongs to the canonical Owner.

Every returned Account-scoped Resource belongs to an authorized Account.

Every exact Money match has equal exact amount and compatible currency.

One SnapshotBound cursor sequence never duplicates or omits a stable Resource.

A cursor cannot broaden query membership.

A Saved View cannot broaden current Authorization.

An index candidate cannot bypass canonical field projection.

A query cache entry cannot be used by another Owner.

A deleted Resource cannot remain searchable after deletion propagation completes.

A complete Query Export equals the authorized canonical query membership.
```

---

# Mutation Testing

Mutation testing should verify tests fail when:

- Owner predicate is removed.
- Account predicate is removed.
- field Authorization is removed.
- exact decimal comparison is replaced with floating-point.
- currency comparison is removed.
- tie-breaker is removed.
- cursor query binding is removed.
- cursor Owner binding is removed.
- index Resource-version check is removed.
- Saved View execution-time Authorization is removed.
- cache Owner key is removed.
- loaded-page Export restriction is removed.

---

# Query Performance Tests

Performance testing should cover:

- Large Transaction history.
- many Accounts.
- many Filters.
- maximum OR branches.
- exact Money range.
- long date period.
- relevance Search.
- large facet set.
- deep pagination.
- index fallback.
- many Saved Views.
- concurrent autocomplete.
- large local replica.
- Query Export.

Performance optimization must not weaken:

- Owner isolation.
- exact Money.
- currency.
- stable Sort.
- cursor integrity.
- projection Authorization.
- index revalidation.
- Saved View Authorization.

---

# Query Chaos Tests

Potential scenarios include:

```text
Database timeout

Search index unavailable

Index update queue delayed

Index worker duplicated

Index cutover during query

Cache unavailable

Cursor service unavailable

Authorization changes between pages

Account access revoked during Export

Client process killed during paging

Web tab restored from browser cache

Saved View updated concurrently
```

---

# Query Migration Architecture

Migrations may affect:

```text
Query schemas

Fields

Operators

Search modes

Text analyzers

Sort policies

Pagination policies

Cursor formats

Result projections

Saved Views

System Views

Search history

Query caches

Search indexes

Local query schemas

Support templates

Administrative query policies
```

---

# Query Migration Principles

Every migration must:

- Preserve Owner scope.
- preserve Account scope.
- preserve field meaning.
- preserve exact Money.
- preserve currency.
- preserve date semantics.
- preserve Sort meaning.
- preserve cursor safety.
- preserve Saved View identity.
- preserve Authorization.
- preserve projection restrictions.
- preserve Search history privacy.
- preserve Audit Evidence.
- be idempotent.
- be verifiable.
- support rollback or safe invalidation.

---

# Query Schema Migration

Recommended sequence:

```text
Register new Query Schema.

↓

Deploy backend readers supporting old and new schemas.

↓

Deploy client adapters.

↓

Migrate compatible Saved Views.

↓

Invalidate incompatible cursors.

↓

Monitor.

↓

Deprecate old schema.

↓

Retire after compatibility window.
```

---

# Query Field Migration

A field migration must define:

- Old field.
- new field.
- semantic equivalence.
- operator compatibility.
- Sort compatibility.
- projection behavior.
- Saved View behavior.
- local query behavior.
- index behavior.

---

# Query Operator Migration

Changing an Operator requires:

- New version.
- database implementation review.
- Search-index implementation review.
- local implementation review.
- null-semantics review.
- Saved View migration.
- test updates.

---

# Search Analyzer Migration

Recommended:

```text
Create new index generation.

↓

Apply new analyzer versions.

↓

Reindex canonical data.

↓

Run shadow queries.

↓

Review ranking and membership differences.

↓

Cut over.

↓

Invalidate incompatible cursors.

↓

Monitor and retain rollback.
```

---

# Sort Policy Migration

Changing Sort requires:

- New policy version.
- cursor incompatibility review.
- Saved View migration.
- pagination tests.
- Query Export ordering review.

---

# Cursor Migration

A cursor format migration should:

- Version new cursors.
- validate old cursors during transition.
- reject unsafe conversion.
- preserve Owner binding.
- preserve query hash.
- preserve Sort values.
- provide restart behavior.

---

# Saved View Migration

Saved View migration must preserve:

```text
Saved View ID

Owner

Resource Type

Name

Account-scope model

Date policy

Currency scope

Equivalent Filters

Equivalent Sort

Equivalent projection

Resource version history
```

---

# Saved View Invalidation Migration

When equivalence cannot be proven:

- Mark View Stale or Invalidated.
- explain the incompatible component.
- provide safe correction options.
- preserve original historical definition.

---

# Search History Migration

Search-history migration must preserve:

- Owner scope.
- retention.
- suppression.
- clear state.
- Privacy deletion.
- storage mode.

---

# Query Cache Migration

A cache-schema migration should invalidate incompatible entries rather than reinterpret them.

---

# Search Index Migration

Search-index migration must preserve:

- Owner partition.
- Account partition.
- Resource ID.
- Resource version.
- deletion state.
- field projection.
- analyzer version.
- freshness.
- rollback.

---

# Local Query Migration

Local database and query-schema migrations must preserve:

- Owner partition.
- exact Money.
- currency.
- dates.
- Saved Views.
- query-state privacy.
- safe fallback.

---

# Support Template Migration

Support templates require review when:

- Fields change.
- scope changes.
- maximum period changes.
- capabilities change.
- Privacy classifications change.

---

# Query Migration Verification

Verify:

```text
No Owner scope broadened.

No Account scope broadened.

No field became searchable unexpectedly.

No field became returnable unexpectedly.

No exact amount changed.

No currency behavior changed silently.

No date boundary changed silently.

No Sort became unstable.

No cursor broadened membership.

No Saved View broadened access.

No query cache crossed Owner scope.

No Search-index document changed Owner.

No Accessibility regression occurred.
```

---

# Query Migration Rollback

Rollback must define:

- Supported old query schemas.
- Saved View compatibility.
- active cursors.
- index generation.
- cache invalidation.
- local client behavior.
- newly generated Query Exports.
- migration Evidence.

---

# Query Deprecation Governance

Query schemas, fields, operators, Search modes, Sort policies, cursor formats, projections, Saved Views and index generations may be deprecated.

---

# Deprecation Requirements

```text
□ Replacement is defined.

□ active Saved Views are inventoried.

□ active client versions are inventoried.

□ cursor compatibility is reviewed.

□ Search-index compatibility is reviewed.

□ Query Export impact is reviewed.

□ local-query impact is reviewed.

□ Support templates are updated.

□ retirement date is defined.

□ historical Evidence remains interpretable.
```

---

# Field Retirement

A retired field must:

- Reject new query use.
- migrate or invalidate Saved Views.
- be removed from new index generations.
- remain historically interpretable.
- be removed from autocomplete.
- be removed from system views.

---

# Operator Retirement

A retired Operator must reject new queries and migrate or invalidate Saved Views.

---

# Cursor Format Retirement

Old cursor formats must stop after:

- Client support window.
- cursor expiration.
- migration.
- Security review.

---

# Search Index Generation Retirement

A generation may retire after:

- Cutover stability.
- rollback window.
- Incident review.
- cursor expiration.
- Privacy requirements.
- storage destruction.

---

# System View Retirement

A retired System View should:

- Stop default assignment.
- preserve existing personal copies.
- migrate active defaults.
- provide a safe fallback.

---

# Query Backup and Recovery

Backend backup and recovery should preserve:

- Query Registries.
- field Registries.
- operator Registries.
- Sort policies.
- pagination policies.
- cursor policies.
- Saved Views.
- System Views.
- Search-history data where canonical.
- administrative query Sessions.
- Query Evidence.
- index metadata.
- index generation state.
- cache configuration.

Search indexes themselves may be rebuilt from canonical data unless policy requires backup.

---

# Query Recovery Priority

Recommended sequence:

```text
Owner and Account Authorization

↓

Query Schemas and Field Registries

↓

Saved Views and System Views

↓

Canonical Database Query Paths

↓

Cursor Services

↓

Search Index Rebuild

↓

Query Caches

↓

Autocomplete Personalization
```

---

# Search Index Recovery

After recovery:

- Verify source boundary.
- verify Owner partitions.
- verify Account partitions.
- verify Resource versions.
- verify deletions.
- verify analyzer versions.
- run shadow queries.
- activate only after validation.

---

# Saved View Recovery

Recovered Saved Views must revalidate current:

- Owner.
- Accounts.
- fields.
- operators.
- Sort.
- projection.
- Authorization.
- query schema.

---

# Cursor Recovery

Cursors may be invalidated after recovery when:

- Data boundary cannot be proven.
- index generation changed.
- signing keys changed.
- query schema changed.
- Sort policy changed.

---

# Query Disaster-Recovery Gate

Before reopening query services:

```text
□ Owner resolution is verified.

□ Account Authorization is verified.

□ Query Registries are available.

□ field and operator policies are available.

□ exact Money comparisons are verified.

□ currency behavior is verified.

□ canonical database queries are safe.

□ cursor integrity is verified.

□ Saved Views are revalidated.

□ Search indexes are verified or disabled.

□ monitoring is active.
```

---

# Query Release Certification

Every release affecting querying must declare:

```text
Query schema versions

Query field versions

Operator versions

Search mode versions

Normalization versions

Sort policy versions

Pagination policy versions

Cursor versions

Projection versions

Saved View schema versions

System View versions

Search-history policy versions

Cache implementation versions

Search-index schema versions

Analyzer versions

Index generation

Local query versions

Migration state

Rollback artifact
```

---

# Query Release Gate

A release must not proceed when:

```text
Owner-isolation tests fail.

Account-isolation tests fail.

Field-Authorization tests fail.

Exact-Money tests fail.

Currency tests fail.

Date-boundary tests fail.

Sort-stability tests fail.

Cursor-integrity tests fail.

SnapshotBound tests fail.

Saved View Authorization tests fail.

Cache-partition tests fail.

Search-index partition tests fail.

Query Export membership tests fail.

Privacy tests fail.

Accessibility tests fail.

Rollback or safe invalidation is unavailable.
```

---

# Post-Release Query Verification

Review:

```text
Query success

Validation failures

Money and currency errors

Database timeouts

Search-index lag

Index update failures

Cursor invalidity

Pagination duplication

Pagination omission

Facet errors

Autocomplete errors

Saved View conflicts

Cache isolation

Local query failures

Query Export verification

Cross-Owner metrics

Support cases
```

---

# Definition of Ready

A query capability is ready when:

```text
□ Purpose is defined.

□ Resource Type is defined.

□ Owner scope is defined.

□ Account scope is defined.

□ Query schema is defined.

□ fields are registered.

□ operators are registered.

□ money behavior is defined.

□ currency behavior is defined.

□ date behavior is defined.

□ Sort is defined.

□ pagination is defined.

□ cursor behavior is defined.

□ projection is defined.

□ freshness is defined.

□ Security requirements are defined.

□ Privacy requirements are defined.

□ Accessibility requirements are defined.

□ monitoring is defined.

□ test vectors exist.
```

---

# Definition of Implemented

A query capability is implemented when:

```text
□ Registry records exist.

□ client query adapters exist.

□ backend validation exists.

□ Owner and Account validation exists.

□ execution planning exists.

□ stable Sort exists.

□ pagination exists.

□ result projection exists.

□ monitoring hooks exist.
```

Implementation does not mean verified or releasable.

---

# Definition of Verified

A query capability is verified when:

```text
□ Query schema tests pass.

□ field tests pass.

□ operator tests pass.

□ text Search tests pass.

□ exact-Money tests pass.

□ currency tests pass.

□ date tests pass.

□ Sort tests pass.

□ cursor tests pass.

□ pagination tests pass.

□ count and facet tests pass.

□ Saved View tests pass.

□ cache tests pass.

□ Search-index tests pass.

□ Android and Web tests pass.

□ Security tests pass.

□ Privacy tests pass.

□ Accessibility tests pass.
```

---

# Definition of Releasable

A query capability is releasable when:

```text
□ Product approval is complete.

□ Query Domain approval is complete.

□ Financial review is complete where applicable.

□ Security review is complete.

□ Privacy review is complete.

□ Accessibility review is complete.

□ Database review is complete.

□ Operations review is complete.

□ monitoring is active.

□ alerts exist.

□ runbooks exist.

□ Support guidance exists.

□ migration is verified.

□ rollback is verified.
```

---

# Definition of Operationally Verified

A query capability is operationally verified when:

```text
□ Production queries complete correctly.

□ exact Money results remain correct.

□ currency separation remains correct.

□ pagination remains deterministic.

□ Search-index freshness remains within policy.

□ Saved Views execute safely.

□ cache isolation remains correct.

□ Query Exports verify complete membership.

□ Owner-isolation metrics remain zero.

□ no Critical query alert exists.
```

---

# AI Governance

AI may assist with limited query-related tasks.

AI must not become an unrestricted query authority.

---

# Allowed AI Uses

AI may assist with:

- Explaining Filters.
- suggesting Filter combinations.
- translating natural language into a proposed structured query.
- suggesting Saved View names.
- drafting query documentation.
- generating test cases.
- analyzing minimized query metrics.
- explaining query errors.
- suggesting index optimizations for review.
- summarizing safe result metadata.

---

# Natural-Language Query Assistance

AI may produce a proposed Canonical Query.

The proposal must pass:

- Query-schema validation.
- field allowlisting.
- operator validation.
- Owner and Account validation.
- exact Money normalization.
- currency validation.
- date and time-zone validation.
- complexity limits.
- projection Authorization.

---

# AI Query Confirmation

Before executing a material AI-generated financial query, the Product should show the interpreted structure.

Example:

```text
Account:
Conta Principal

Period:
1 July 2026 through 31 July 2026

Transaction direction:
Expense

Minimum amount:
R$ 100,00

Currency:
BRL
```

---

# Forbidden AI Uses

AI must not:

- Assign canonical Owner.
- select another Owner's Account.
- invent query fields.
- bypass field Authorization.
- invent currency.
- convert currency without an approved policy.
- create unrestricted SQL.
- create unrestricted Search-engine syntax.
- grant administrative scope.
- authorize result projection.
- certify complete query membership.
- certify Search-index integrity.
- approve Query Export.
- claim tests passed without execution.

---

# AI Semantic Search Governance

Semantic Search remains disabled until a separate approved design defines:

- Embedding fields.
- Owner partitioning.
- Account partitioning.
- vector-store security.
- exact deletion.
- Privacy retention.
- ranking semantics.
- canonical revalidation.
- result projection.
- prompt-injection protection.
- query Evidence.

---

# Final Query Checklist

```text
□ Query ID exists.

□ Query schema is active.

□ canonical Owner is verified.

□ Account scope is verified.

□ Resource Type is authorized.

□ fields are registered.

□ operators are registered.

□ Search mode is active.

□ money values are exact.

□ currency is explicit.

□ dates are valid.

□ time zone is valid.

□ Sort is stable.

□ tie-breaker exists.

□ pagination policy is active.

□ cursor is valid.

□ projection is authorized.

□ complexity is bounded.

□ freshness is known.

□ result state is controlled.
```

---

# Final Search Index Checklist

```text
□ Index ID exists.

□ generation ID exists.

□ schema is active.

□ analyzers are versioned.

□ Owner partition exists.

□ Account partition exists.

□ document projection is minimized.

□ Resource version is preserved.

□ update idempotency exists.

□ stale updates are rejected.

□ deletion is propagated.

□ freshness is monitored.

□ integrity is verified.

□ rebuild exists.

□ cutover exists.

□ rollback exists.

□ credentials use least privilege.
```

---

# Final Cursor Checklist

```text
□ Cursor policy is active.

□ Owner binding exists.

□ Resource Type binding exists.

□ query hash binding exists.

□ Sort binding exists.

□ projection binding exists where required.

□ data boundary is preserved.

□ index generation is preserved where required.

□ last Sort values exist.

□ unique tie-breaker exists.

□ expiration exists.

□ integrity protection exists.

□ raw cursor logging is prohibited.
```

---

# Final Saved View Checklist

```text
□ Saved View ID exists.

□ canonical Owner is verified.

□ Resource Type is valid.

□ Query schema is supported.

□ fields are active.

□ operators are active.

□ Sort is stable.

□ projection is authorized.

□ Account-scope model is defined.

□ date policy is defined.

□ currency scope is valid.

□ Resource version exists.

□ current Authorization is revalidated.

□ migration state is known.

□ default state is consistent.

□ synchronization is enabled.
```

---

# Final Financial Query Checklist

```text
□ Exact decimal representation is used.

□ Currency is explicit.

□ Account currency is compatible.

□ sign semantics are correct.

□ direction semantics are correct.

□ amount precision is valid.

□ minimum and maximum boundaries are valid.

□ multi-currency behavior is explicit.

□ Sort does not compare incompatible units directly.

□ grouped totals use approved financial calculations.

□ Query Export preserves exact values.
```

---

# Final Security Checklist

```text
□ HTTPS is enforced.

□ Authentication is required.

□ canonical Owner is resolved server-side.

□ Accounts are validated.

□ fields use allowlists.

□ operators use allowlists.

□ projections use allowlists.

□ query complexity is bounded.

□ cursors are integrity-protected.

□ identifier enumeration is controlled.

□ count probing is controlled.

□ facet probing is controlled.

□ index credentials use least privilege.

□ Support queries use templates.

□ administrative queries require capabilities.

□ cross-Owner tests pass.
```

---

# Final Privacy Checklist

```text
□ Search terms are classified as private.

□ raw Search-term telemetry is minimized.

□ Search history has a purpose.

□ Search-history retention is bounded.

□ Saved Views are Owner-scoped.

□ query caches are Owner-scoped.

□ autocomplete personalization is controlled.

□ Owner switching clears previous suggestions.

□ Privacy deletion propagates.

□ Owner deletion clears private query state.

□ Support diagnostics are minimized.

□ AI query assistance uses minimized data.
```

---

# Final Accessibility Checklist

```text
□ Search input has an accessible name.

□ Search mode is understandable.

□ Filter fields are labeled.

□ Operators are understandable.

□ Filter chips are removable by keyboard.

□ Money Filters announce currency.

□ Date Filters announce boundaries.

□ logical groups are navigable.

□ Sort state is announced.

□ result counts identify exact or estimated state.

□ stale and partial warnings are announced.

□ pagination controls are descriptive.

□ infinite scroll has accessible behavior.

□ Saved View conflicts are understandable.

□ cursor-expiration recovery is understandable.
```

---

# Final Incident Checklist

```text
□ Incident category is defined.

□ severity is assigned.

□ Query IDs are preserved.

□ affected Owners are identified.

□ affected Accounts are identified.

□ affected fields are identified.

□ execution source is identified.

□ index generation is identified.

□ unsafe cursors are invalidated.

□ unsafe caches are cleared.

□ unsafe Saved Views are disabled.

□ affected Exports are revoked.

□ exact Money and currency are reverified.

□ regression tests pass.

□ root cause is documented.
```

---

# Final Acceptance Criteria

The Nexio Search, Filtering, Sorting, Pagination and Saved Views architecture is accepted only when:

521. Query governance roles are documented.

522. Every governed query capability has an accountable owner.

523. Every Production query uses an active Query Schema.

524. Every Query Schema has a stable identifier.

525. Every Query Schema has an explicit version.

526. Query Schema compatibility is documented.

527. Breaking query changes create new schema versions.

528. Every searchable field is registered.

529. Every filterable field is registered.

530. Every sortable field is registered.

531. Every groupable field is registered.

532. Every facetable field is registered.

533. Every returnable field is registered.

534. Every offline-eligible field is registered.

535. Database columns are not queryable automatically.

536. Searchable fields do not become returnable automatically.

537. Returnable fields do not become searchable automatically.

538. Every query field has a stable Type.

539. Every query field defines null behavior.

540. Every query field defines currency behavior where applicable.

541. Every query field defines time-zone behavior where applicable.

542. Every query field defines classification.

543. Every query field defines masking behavior.

544. Field meaning cannot change silently within one version.

545. Every Operator is registered.

546. Every Operator has a stable identifier.

547. Every Operator defines supported data Types.

548. Every Operator defines value cardinality.

549. Every Operator defines null behavior.

550. Every Operator defines negation behavior.

551. Every Operator defines complexity weight.

552. Database and Search-index Operator behavior remains equivalent.

553. Local Operator behavior remains equivalent or unsupported explicitly.

554. `NotEquals` null behavior is explicit.

555. Negated queries remain inside canonical Owner scope.

556. Negated queries remain inside authorized Account scope.

557. Logical Filter depth is bounded.

558. Logical expression count is bounded.

559. OR branch count is bounded.

560. Contradictory Filter behavior is deterministic.

561. Every Search mode is registered.

562. Every Search mode defines eligible fields.

563. Every Search mode defines normalization.

564. Every Search mode defines minimum and maximum length.

565. Every Search mode defines ranking.

566. Every Search mode defines tie-breakers.

567. Every text-normalization policy is versioned.

568. Search normalization does not rewrite canonical text.

569. Accent-insensitive Search uses derived projections.

570. pt-BR accents remain preserved in canonical results.

571. Stemming uses a field allowlist.

572. Stemming does not apply to identifiers.

573. Identifier Search remains exact by default.

574. Partial identifier enumeration remains prohibited by default.

575. Every Money query field identifies its currency field.

576. Every Money query field identifies scale policy.

577. Every Money query field identifies sign meaning.

578. Every Money comparison uses exact decimal values.

579. Every Money comparison validates compatible currency.

580. R$ 1.250,45 normalizes to exact BRL 1250.45 under confirmed pt-BR rules.

581. Binary floating-point is not authoritative for Money querying.

582. Currency omission follows an explicit policy.

583. Multi-currency query behavior is explicit.

584. Ordinary queries do not compare BRL and other currencies as equal units.

585. Converted financial queries use registered conversion policies.

586. Financial Sort across currencies uses an approved strategy.

587. Grouped financial totals use approved Calculation or Reporting logic.

588. Every date field defines temporal Type.

589. Every date field defines time-zone behavior.

590. Every relative period is registered.

591. Relative-period resolution uses server-trusted time.

592. Relative-period resolution preserves selected time zone.

593. Fixed and relative Saved View periods remain distinct.

594. Date-only values do not shift through time zones.

595. Time-zone database behavior is governed.

596. Every Sort policy is registered.

597. Every Sort policy has a stable identifier.

598. Every Sort policy defines fields and directions.

599. Every Sort policy defines null placement.

600. Every Sort policy defines collation.

601. Every Sort policy defines currency behavior.

602. Every Sort policy has a unique tie-breaker.

603. Every Resource Type has a default Sort.

604. Every pagination policy is registered.

605. Every pagination policy defines supported modes.

606. Every pagination policy defines page sizes.

607. Every pagination policy defines consistency model.

608. SnapshotBound pagination is used for reproducible Export membership.

609. BestEffortCurrent pagination discloses mutable results.

610. Every cursor policy is registered.

611. Every cursor policy binds Owner.

612. Every cursor policy binds Resource Type.

613. Every cursor policy binds query hash.

614. Every cursor policy binds Sort.

615. Every cursor policy binds data boundary.

616. Every cursor policy defines expiration.

617. Every cursor policy uses integrity protection.

618. Cursor renewal does not broaden scope.

619. Cursor renewal does not skip changes silently.

620. Raw cursors are excluded from ordinary logs.

621. Every Count policy is registered.

622. Exact counts use the same Authorization as results.

623. Exact counts use the same data boundary as results.

624. Estimated counts are labeled.

625. Estimated counts are not used as financial totals.

626. Restricted counts do not create existence leaks.

627. Every Facet policy is registered.

628. Every Facet policy defines maximum values.

629. Every Facet policy defines count semantics.

630. Sensitive high-cardinality fields are excluded from ordinary facets.

631. Every Autocomplete policy is registered.

632. Autocomplete policies define minimum prefix length.

633. Autocomplete policies define maximum suggestions.

634. Autocomplete policies define masking.

635. Autocomplete does not expose another Owner's values.

636. Autocomplete does not expose deleted private Resources.

637. Autocomplete does not expose complete sensitive identifiers.

638. Every Result Projection is registered.

639. Every Result Projection uses returnable fields only.

640. Every Result Projection defines required capabilities.

641. Every Result Projection defines masking.

642. Relationship expansion remains bounded.

643. Derived fields identify Calculation or Reporting policy.

644. Projection selection occurs after Authorization.

645. Clients cannot request unrestricted database fields.

646. Projection downgrade behavior is controlled.

647. Saved View governance policies are registered.

648. Saved View creation validates Owner.

649. Saved View creation validates Resource Type.

650. Saved View creation validates fields.

651. Saved View creation validates operators.

652. Saved View creation validates stable Sort.

653. Saved View creation validates projection.

654. Saved View execution revalidates current Owner.

655. Saved View execution revalidates current Accounts.

656. Saved View execution revalidates current fields.

657. Saved View execution revalidates current operators.

658. Saved View execution revalidates current projection.

659. Saved View execution revalidates current Authorization.

660. Saved View migration policies are registered.

661. Automatic Saved View migration requires semantic equivalence.

662. Automatic migration cannot broaden Account scope.

663. Automatic migration cannot broaden field scope.

664. Automatic migration cannot remove currency restrictions.

665. Automatic migration cannot change fixed periods to relative periods silently.

666. Automatic migration cannot change exact Money into converted Money silently.

667. incompatible Saved Views become Stale or Invalidated.

668. Saved View deletion follows retention policy.

669. System Views are registered.

670. System Views are versioned.

671. default-view assignment uses optimistic concurrency.

672. Saved View sharing remains disabled until separately governed.

673. Search-history policies are registered.

674. Search history has a documented Product purpose.

675. Search-history storage mode is explicit.

676. Search-history maximum entries are bounded.

677. Search-history retention is bounded.

678. Search history can be cleared where supported.

679. sensitive Search categories can be suppressed.

680. previous Owner Search history is never shown after switching.

681. Query cache implementations are registered.

682. Query caches preserve Owner partitioning.

683. Query caches preserve Authorization scope.

684. Query caches preserve query hash.

685. Query caches preserve projection.

686. Query caches preserve data boundary.

687. Query caches expire.

688. Query caches respond to Resource changes.

689. Query caches respond to Account-access changes.

690. Query caches respond to Authorization changes.

691. Query caches respond to Privacy deletion.

692. financial cache state is not labeled Current after financial-data change.

693. Search-index implementations are registered.

694. Search-index generations are registered.

695. Index schemas are versioned.

696. analyzer versions are preserved.

697. index documents preserve Owner.

698. index documents preserve Account where applicable.

699. index documents preserve Resource identity.

700. index documents preserve Resource version.

701. index documents preserve deletion state.

702. index documents contain approved fields only.

703. index updates are idempotent.

704. stale index updates cannot overwrite newer versions.

705. index freshness is monitored.

706. index integrity is monitored.

707. index integrity failure prevents Current results.

708. index rebuilds use canonical sources.

709. index rebuilds preserve changes after the source boundary.

710. index rebuilds verify Owner partitions.

711. index rebuilds verify Account partitions.

712. index rebuilds verify deletion state.

713. index rebuilds verify Resource versions.

714. index cutover uses a controlled gate.

715. index cutover defines cursor behavior.

716. index cutover has rollback.

717. retired index generations are destroyed according to policy.

718. Local Query implementations are registered.

719. Local Query implementations identify Platform.

720. Local Query implementations identify storage technology.

721. Local Query implementations identify supported fields.

722. Local Query implementations identify supported operators.

723. Local Query implementations preserve exact Money.

724. Local Query implementations preserve currency.

725. Local Query implementations preserve date semantics.

726. Local Query implementations preserve stable Sort.

727. Local Query implementations preserve Owner partitioning.

728. unsupported local semantics are blocked rather than approximated silently.

729. local query freshness is disclosed.

730. Query Export governance policies are active.

731. Query Exports reference one Canonical Query.

732. Query Exports reference Saved View version where applicable.

733. Query Exports validate current Owner.

734. Query Exports validate current Accounts.

735. Query Exports validate current fields and projection.

736. Query Exports identify source boundary.

737. Query Exports resolve complete membership independently from loaded pages.

738. Query Exports preserve expected result count.

739. Query Exports preserve exported result count.

740. Authorization drift never broadens Query Export output.

741. Support query templates are registered.

742. Support query templates require a case reference.

743. Support query templates define bounded fields.

744. Support query templates define bounded periods.

745. Support query templates define result limits.

746. Ordinary Support cannot submit unrestricted database predicates.

747. Administrative Query Sessions have stable identifiers.

748. Administrative Query Sessions require explicit purpose.

749. Administrative Query Sessions define authorized population.

750. Administrative Query Sessions expire.

751. High-risk administrative queries use separation of duties.

752. Query APIs use HTTPS.

753. Query APIs authenticate private requests.

754. Query APIs resolve Owner server-side.

755. Query APIs validate Account scope.

756. Query APIs validate field access.

757. Query APIs validate operators.

758. Query APIs validate values.

759. Query APIs validate projections.

760. Query APIs validate cursor integrity.

761. Query APIs enforce page-size limits.

762. Query APIs enforce complexity limits.

763. Query APIs enforce rate limits.

764. Query APIs enforce timeouts.

765. Query input never becomes raw SQL.

766. Query input never becomes unrestricted Search-engine syntax.

767. Query input never becomes unrestricted regular expressions.

768. Query side channels are reviewed.

769. Query retention policies are registered.

770. Raw Search terms are excluded from ordinary telemetry by default.

771. Query Evidence minimizes private values.

772. Privacy deletion removes Saved Views where required.

773. Privacy deletion removes Search history where required.

774. Privacy deletion invalidates query caches.

775. Privacy deletion removes Search-index documents.

776. Privacy deletion removes autocomplete personalization.

777. accessible field names are localized.

778. accessible Operator names are understandable.

779. advanced logical groups are keyboard accessible.

780. Saved View conflicts are accessible.

781. cursor expiration is explained accessibly.

782. query Audit Events are defined.

783. query Evidence preserves schema versions.

784. query Evidence preserves field and Operator references.

785. query Evidence preserves data boundary.

786. query Evidence preserves projection.

787. Critical Query alerts are defined.

788. Cross-Owner query results are Critical.

789. Cross-Owner counts or facets are Critical.

790. Cross-Owner autocomplete values are Critical.

791. Cross-Owner cache reuse is Critical.

792. Cross-Owner index documents are Critical.

793. Unauthorized Query Export is Critical.

794. incorrect exact-Money query behavior is High or Critical according to impact.

795. SnapshotBound pagination inconsistency is High.

796. Query SLOs are defined.

797. exact-Money correctness has a zero-error target.

798. pagination correctness has a zero-error target for SnapshotBound queries.

799. Search-index integrity has an SLO.

800. Saved View correctness has a zero-broadening target.

801. Query Incident categories are controlled.

802. Query Incident response preserves Query IDs.

803. Query Incident response preserves schema versions.

804. Query Incident response preserves index generations.

805. Query Incident response invalidates unsafe cursors.

806. Query Incident response clears unsafe caches.

807. Query Incident response revokes unsafe Exports.

808. Query Schema tests exist.

809. Query field tests exist.

810. Query Operator tests exist.

811. text Search tests exist.

812. pt-BR accent tests exist.

813. identifier-enumeration tests exist.

814. exact-Money tests exist.

815. Money range tests exist.

816. currency-separation tests exist.

817. date and time-zone tests exist.

818. null-semantics tests exist.

819. logical-group tests exist.

820. Sort-stability tests exist.

821. cursor tests exist.

822. pagination tests exist.

823. count tests exist.

824. facet tests exist.

825. autocomplete tests exist.

826. projection tests exist.

827. Saved View tests exist.

828. Search-history tests exist.

829. query-cache tests exist.

830. Search-index tests exist.

831. Android query tests exist.

832. Web query tests exist.

833. Query Export tests exist.

834. Security tests exist.

835. Privacy tests exist.

836. Accessibility tests exist.

837. Property-based query invariants are tested.

838. Mutation tests detect removed Owner predicates.

839. Mutation tests detect removed Account predicates.

840. Mutation tests detect removed field Authorization.

841. Mutation tests detect floating-point Money comparisons.

842. Mutation tests detect removed currency comparisons.

843. Mutation tests detect removed Sort tie-breakers.

844. Mutation tests detect removed cursor query binding.

845. Mutation tests detect removed cursor Owner binding.

846. Mutation tests detect removed index Resource-version checks.

847. Mutation tests detect removed Saved View execution-time Authorization.

848. Mutation tests detect removed cache Owner partitioning.

849. Performance tests cover large financial datasets.

850. Performance tests cover complex bounded Filters.

851. Performance tests cover deep cursor pagination.

852. Performance tests cover index fallback.

853. Performance tests cover large local replicas.

854. Chaos tests cover index outages.

855. Chaos tests cover Authorization changes between pages.

856. Chaos tests cover index cutover during active queries.

857. Query migrations preserve Owner scope.

858. Query migrations preserve Account scope.

859. Query migrations preserve field meaning.

860. Query migrations preserve exact Money.

861. Query migrations preserve currency.

862. Query migrations preserve date semantics.

863. Query migrations preserve stable Sort.

864. Query migrations preserve Saved View identity.

865. Query migrations preserve projection restrictions.

866. incompatible cursors are invalidated safely.

867. Search Analyzer migrations use new index generations.

868. Search Analyzer migrations use shadow queries.

869. Saved View migrations preserve equivalent meaning.

870. Query cache migrations invalidate incompatible entries.

871. Search-index migrations preserve deletion state.

872. Local Query migrations preserve Owner partitioning.

873. Query migration verification detects broadened scope.

874. Query migration rollback is defined.

875. deprecated query components block new dependencies.

876. retired fields reject new queries.

877. retired Operators reject new queries.

878. retired cursor formats expire safely.

879. retired index generations stop serving queries.

880. backup recovery preserves Saved Views.

881. backup recovery preserves Query Registries.

882. backup recovery revalidates Saved View Authorization.

883. Search indexes are rebuilt or verified after recovery.

884. cursors are invalidated when recovery boundaries are uncertain.

885. disaster recovery verifies exact Money behavior.

886. disaster recovery verifies currency behavior.

887. disaster recovery verifies Owner isolation.

888. releases declare Query Schema versions.

889. releases declare field and Operator versions.

890. releases declare Sort and pagination versions.

891. releases declare cursor versions.

892. releases declare Saved View schema versions.

893. releases declare Search-index and analyzer versions.

894. releases declare migration state.

895. unsafe query changes block release.

896. post-release verification reviews pagination duplication.

897. post-release verification reviews pagination omission.

898. post-release verification reviews Search-index lag.

899. post-release verification reviews Saved View conflicts.

900. post-release verification reviews cross-Owner metrics.

901. AI query assistance remains advisory.

902. AI-generated queries pass the same validation as manual queries.

903. AI cannot assign canonical Owner.

904. AI cannot choose another Owner's Account.

905. AI cannot invent currency.

906. AI cannot bypass field Authorization.

907. AI cannot execute unrestricted SQL.

908. AI cannot authorize administrative query scope.

909. AI cannot certify complete query membership.

910. AI cannot certify Search-index integrity.

911. semantic Search remains disabled until separately governed.

912. every query remains traceable to one canonical normalized query.

913. every result page remains traceable to one stable Sort and cursor boundary.

914. every Saved View remains traceable to one Owner and versioned definition.

915. every Search-index result remains subordinate to canonical Authorization.

916. every Query Export remains traceable to one verified complete query membership.

917. every Search, Filter, Sort, pagination and Saved View lifecycle remains independently reconstructable.

---

# Search, Filtering, Sorting, Pagination and Saved Views Constitutional Rule

Every Nexio Search, Filter, Sort, result count, facet, autocomplete suggestion, query cursor, Saved View, Search-index result, local query and Query Export must answer:

```text
Which authenticated Actor initiated the query?

Which canonical Owner owns the Resources?

Which Accounts and Resource Types are authorized?

Which Query Schema applies?

Which registered fields and Operators apply?

Which Search mode and normalization versions apply?

Which exact monetary values and currencies apply?

Which dates, periods and time zones apply?

Which Sort policy and unique tie-breaker apply?

Which pagination consistency model applies?

Which cursor and data boundary apply?

Which result projection is authorized?

Which Search-index generation or canonical source applies?

Which freshness state applies?

Which Saved View and Resource version apply?

Which Evidence independently reconstructs the lifecycle?
```

When any answer is uncertain, Nexio must prefer the action that:

- Rejects the query.
- narrows the scope.
- removes unauthorized fields.
- requires explicit currency.
- requires explicit time-zone or date interpretation.
- invalidates the cursor.
- restarts pagination.
- marks results stale or partial.
- bypasses unsafe caches.
- disables an unsafe index generation.
- invalidates an incompatible Saved View.
- blocks Query Export.
- clears previous Owner query state.
- opens a Security, Privacy, financial-integrity or operational Incident.
- blocks the release.

A Resource is not authorized merely because it matches a Search term.

A count is not safe merely because it reveals no Resource fields.

A Sort is not stable merely because one page looks ordered.

A cursor is not valid merely because it is syntactically correct.

A Search index is not canonical merely because it contains a document.

A Saved View is not permanently authorized merely because it was valid when created.

A local query is not complete merely because every local record was searched.

A Query Export is not complete merely because every loaded page was included.

A query lifecycle is trustworthy only when it preserves canonical Owner and Account scope, field allowlisting, typed Operators, exact financial meaning, explicit currency, controlled dates and time zones, deterministic total ordering, cursor integrity, authorized result projection, Search-index subordination, Saved View versioning, freshness transparency and reproducible Evidence.

Nexio must never:

- Return one Owner's Resource to another Owner.
- expose another Owner through counts, facets or autocomplete.
- trust Account scope supplied by the client.
- allow a query field outside the Registry.
- compare exact Money through binary floating-point.
- compare incompatible currencies as equivalent units.
- paginate without a deterministic tie-breaker.
- reuse a cursor for another query.
- allow an index candidate to bypass canonical Authorization.
- allow an older index update to overwrite a newer Resource version.
- allow a Saved View to bypass current Authorization.
- reuse private query caches across Owners.
- display previous Owner Search history or suggestions after switching.
- export only loaded pages while claiming complete query membership.
- allow AI to execute unrestricted query languages or assign canonical scope.

---

# Final Authority

This document is the official Search, Filtering, Sorting, Pagination and Saved Views specification for Nexio.

All future:

- Global Search.
- Resource Search.
- Transaction Search.
- Account Search.
- Transfer Search.
- Budget Search.
- Goal Search.
- Recurring Transaction Search.
- Notification Search.
- Import and Export history Search.
- Reconciliation Search.
- Report Search.
- text Search.
- exact Search.
- phrase Search.
- prefix Search.
- token Search.
- identifier Search.
- accent-insensitive Search.
- pt-BR Search.
- Search ranking.
- Search normalization.
- Search analyzers.
- Search indexes.
- Search-index documents.
- Search-index update workers.
- Search-index generations.
- Search-index rebuilds.
- Search-index cutovers.
- Search-index rollbacks.
- Search-index freshness.
- Search-index integrity.
- query schemas.
- Query Field Registries.
- Query Operator Registries.
- Search Mode Registries.
- text-normalization policies.
- money Filters.
- currency Filters.
- date Filters.
- time-zone Filters.
- relative periods.
- null Filters.
- collection Filters.
- logical Filter groups.
- Filter presets.
- Sort policies.
- default Sorts.
- multi-currency Sorts.
- pagination policies.
- cursor pagination.
- offset pagination.
- SnapshotBound pagination.
- SequenceBound pagination.
- BestEffortCurrent pagination.
- query cursors.
- page-size policies.
- counts.
- estimated counts.
- facets.
- autocomplete.
- Search suggestions.
- result projections.
- relationship expansions.
- result highlighting.
- snippets.
- grouping.
- grouped financial totals.
- Saved Views.
- System Views.
- default views.
- Saved View migrations.
- Saved View synchronization.
- Saved View conflicts.
- Search history.
- recent searches.
- Incognito Search.
- query caches.
- Android local Search.
- Web local Search.
- local query indexes.
- browser URL query state.
- multi-tab query coordination.
- query Exports.
- Support query templates.
- administrative query Sessions.
- query telemetry.
- query metrics.
- query SLOs.
- query alerts.
- query Incidents.
- query migrations.
- query backup and recovery.
- query disaster recovery.
- query release certification.
- AI-assisted query construction.
- future semantic Search.

must comply with this specification.

Exceptions require a documented Product, Query, Search, Financial, Security, Privacy, Accessibility, Android, Web, Backend, API, Database, Search Index, Operations, Support, Audit, Migration or Release decision containing:

- Query Schema identifier and version.
- Resource Type.
- canonical Owner scope.
- Account scope.
- field identifiers.
- Operator identifiers.
- Search mode.
- normalization policy.
- exact-Money behavior.
- currency behavior.
- date and time-zone behavior.
- Sort policy.
- pagination policy.
- cursor policy.
- result projection.
- count policy.
- facet policy.
- autocomplete policy.
- Search-index generation.
- Saved View behavior.
- cache behavior.
- local-query behavior.
- Query Export behavior.
- Security impact.
- Privacy impact.
- financial impact.
- Accessibility impact.
- monitoring.
- alerts.
- Incident response.
- migration.
- rollback.
- retirement.
- compensating controls.
- required approvers.

Unregistered query fields, untyped Operators, ambiguous Money or currency behavior, unstable Sort, unsafe cursors, cross-Owner Search exposure, unauthorized counts or facets, stale index results presented as Current, Saved View Authorization bypass, cross-Owner caches, incomplete Query Exports, inaccessible query interfaces and unsupported AI query authority are considered Product, financial-integrity, Security, Privacy, Accessibility, operational, Support and governance debt.

---