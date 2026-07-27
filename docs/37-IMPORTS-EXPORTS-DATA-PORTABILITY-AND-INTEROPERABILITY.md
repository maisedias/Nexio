# Nexio Imports, Exports, Data Portability and Interoperability Specification

Version: 1.0  
Status: Official  
Authority Level: Platform Data Ingestion, Data Extraction, Portability and Interoperability Standard  
Applies To: Web Application, Android Application, Backend Services, APIs, Database, Object Storage, Background Jobs, File Uploads, File Downloads, Transactions, Accounts, Categories, Budgets, Goals, Recurring Transactions, Reports, Reconciliation, Financial Calculations, Synchronization, Notifications, Audit, Security, Privacy, Accessibility, Operations, Support and External Data Providers

---

# Purpose

This specification defines the official Imports, Exports, Data Portability and Interoperability architecture for Nexio.

It establishes how Nexio must:

- Receive structured financial and Product data from approved sources.
- Validate uploaded files before processing.
- Protect Nexio from malicious, malformed or oversized files.
- Identify file format, encoding, locale and schema.
- Parse CSV, JSON, spreadsheet and future approved formats safely.
- Map external fields to canonical Nexio Resources.
- Preserve exact monetary values.
- Interpret pt-BR dates and decimal conventions safely.
- Detect ambiguous locale and currency representations.
- Detect duplicate records.
- Provide Import preview before canonical mutation.
- Require explicit confirmation where appropriate.
- Support partial acceptance without hiding rejected records.
- Preserve row-level validation results.
- Prevent Import Retry from creating duplicate financial Resources.
- Track Import progress and final state.
- Recalculate affected balances, budgets, goals and Reports.
- Generate secure, reproducible Exports.
- Preserve exact values across Export formats.
- Protect Exports from unauthorized download.
- Support privacy portability requests.
- Support Owner-controlled financial-data portability.
- Version Import and Export schemas.
- Preserve source lineage.
- Preserve canonical Owner and Account scope.
- Prevent cross-Owner Import and Export.
- Prevent spreadsheet formula injection.
- Prevent file-path, archive, XML and parser attacks.
- Define file retention and destruction.
- Support interrupted upload and large-file processing.
- Support accessible Import and Export workflows.
- Support Support, Audit and Incident investigation.
- Preserve compatibility with future approved external systems.
- Prevent imported or exported data from redefining canonical financial truth outside approved policies.

This document applies to every Nexio component that receives, stores, scans, parses, maps, validates, previews, confirms, imports, exports, downloads, shares, retries, reconciles, migrates or destroys structured data files and interoperability payloads.

---

# Constitutional Principle

An Import file is untrusted input.

An Export file is a sensitive derived artifact.

Neither becomes trustworthy merely because:

- The file extension is recognized.
- The file opens successfully.
- A parser returns rows.
- The values look reasonable.
- A spreadsheet application displays the content.
- The Owner uploaded the file.
- The file came from a known provider.
- The file was previously exported by Nexio.
- The file passed client-side validation.
- The file contains a familiar Account name.
- An external system reports successful transmission.

Every Import must answer:

```text
Who submitted the data?

Which canonical Owner will receive the imported Resources?

Which Accounts may be affected?

Which source and format produced the file?

Which schema and locale apply?

Which currency applies to every monetary value?

Which encoding and date conventions apply?

Which rows are valid, invalid, ambiguous, duplicated or excluded?

Which mapping policy was used?

Which canonical Resource will each accepted row create or update?

Which operation identity prevents duplicate application?

Which financial calculations must be recalculated?

Which Audit Evidence reconstructs the Import?
```

Every Export must answer:

```text
Who requested the Export?

Which canonical Owner owns the exported data?

Which Accounts and Resources are included?

Which period, filters, currency and policies apply?

Which Export schema and format were used?

Which exact values were included?

Which file-integrity controls apply?

Who may download the file?

When does download authority expire?

When must the file be destroyed?

Which Evidence reconstructs the Export lifecycle?
```

---

# Import and Export Objectives

The Nexio Import and Export architecture shall provide:

```text
Untrusted Input Containment

Canonical Owner Isolation

Exact Monetary Preservation

Explicit Currency

Explicit Locale

Schema Versioning

Deterministic Mapping

Row-Level Validation

Duplicate Prevention

Preview Before Mutation

Idempotent Commitment

Partial-State Transparency

Source Lineage

Secure Export Generation

Download Authorization

Reproducibility

Portability

Interoperability

Accessibility

Auditability

Lifecycle Governance
```

---

# Untrusted Input Containment

Every uploaded file, external payload and imported field must be treated as untrusted.

Untrusted content may contain:

- Malware.
- Formula injection.
- Invalid encoding.
- Embedded scripts.
- Oversized fields.
- Decompression bombs.
- Recursive archives.
- XML external entities.
- Path traversal strings.
- Invalid dates.
- Invalid decimal values.
- Hidden spreadsheet rows.
- Hidden columns.
- Duplicate records.
- Misleading headers.
- Another Owner's identifiers.
- Unsupported currencies.
- Extremely large numbers.
- Parser exploit payloads.
- Prompt-injection text.
- Social-engineering content.

---

# Canonical Owner Isolation

Every Import and Export operation must resolve the canonical Owner server-side.

The backend must not trust an Owner identifier contained in:

- Uploaded files.
- API payload fields.
- spreadsheet cells.
- JSON documents.
- CSV headers.
- URL parameters.
- file names.
- external provider metadata.
- saved Import profiles.
- client-side state.

Cross-Owner Import or Export is a Critical Security, Privacy and financial-integrity Incident.

---

# Exact Monetary Preservation

Imported and exported money must use approved exact decimal or integer minor-unit representation.

Binary floating-point must not become authoritative.

Example:

```text
Canonical amount:
"1250.45"

Currency:
"BRL"

pt-BR presentation:
R$ 1.250,45
```

The formatted pt-BR string is presentation.

The canonical exact value remains independent from display formatting.

---

# Explicit Currency

Every monetary Import row must resolve one supported currency through:

- File-level currency.
- Account-level currency.
- Row-level currency.
- approved mapping policy.
- explicit Owner confirmation.

Currency must not be guessed from amount punctuation alone.

---

# Explicit Locale

Locale affects:

- Decimal separator.
- Grouping separator.
- Date order.
- Date names.
- Character encoding.
- Boolean values.
- currency formatting.
- percentage formatting.

Locale inference must remain bounded and explainable.

Ambiguous locale must require review.

---

# Schema Versioning

Every supported Import and Export contract must have an explicit schema version.

A schema version must define:

- Fields.
- types.
- required values.
- optional values.
- field meaning.
- locale behavior.
- monetary representation.
- date representation.
- Resource mapping.
- compatibility.
- deprecation.

---

# Deterministic Mapping

The same approved source row, schema, mapping policy and canonical context should produce the same normalized Import record.

Mapping must not depend on:

- Device.
- browser.
- spreadsheet application.
- file display formatting.
- client time zone.
- uncontrolled AI interpretation.
- arbitrary column order when headers exist.
- current UI layout.

---

# Row-Level Validation

Each imported row or record must receive an explicit result.

Recommended results include:

```text
Accepted

AcceptedWithWarnings

Rejected

Ambiguous

Duplicate

Excluded

RequiresReview

Conflict
```

A file-level success state must not hide row-level rejection.

---

# Duplicate Prevention

The architecture must distinguish:

```text
Repeated upload of the same file

Retry of the same Import operation

Repeated row inside one file

Row previously imported

Equivalent but legitimate separate financial record

Same external provider record

Same recurring occurrence

Same Transfer representation
```

Matching amount and date alone is insufficient to declare a financial duplicate.

---

# Preview Before Mutation

Where material financial Resources will be created or changed, Nexio should provide a preview before canonical commitment.

The preview should identify:

- Valid records.
- invalid records.
- warnings.
- duplicate candidates.
- Account mapping.
- Category mapping.
- currency.
- dates.
- total financial effect.
- exclusions.
- conflicts.
- required Owner decisions.

---

# Idempotent Commitment

Confirming or retrying the same Import must not create duplicate canonical Resources.

Every commit-capable Import must have stable operation identity.

---

# Partial-State Transparency

An Import may complete partially.

The final state must distinguish:

```text
Completed

CompletedWithWarnings

PartiallyCompleted

Failed

Cancelled

Expired
```

`Completed` must not be used when required records failed.

---

# Source Lineage

Every accepted imported Resource should preserve appropriate source lineage.

Potential lineage includes:

- Import Job.
- source file.
- source row.
- external record identifier.
- schema version.
- mapping profile.
- normalized record hash.
- commit operation.
- Import time.

---

# Secure Export Generation

Exports must be generated in controlled backend or approved client environments.

Sensitive Exports should not rely on unrestricted client-side assembly from incomplete local replicas.

---

# Download Authorization

Possession of an Export identifier must not grant download access.

Download must validate:

- Authentication.
- canonical Owner.
- Export ownership.
- file state.
- expiration.
- download policy.
- applicable reauthentication.
- purpose-bound token.

---

# Reproducibility

A material Export should be reproducible or historically explainable through:

- source Report or Resource boundary.
- Account scope.
- period.
- filters.
- currencies.
- schema version.
- policy versions.
- financial-data version.
- generated time.

---

# Portability

Nexio should support Owner access to approved portable representations of their data.

Portability does not require Nexio to export:

- Secrets.
- internal Security controls.
- Provider credentials.
- proprietary detection Rules.
- another Owner's data.
- privileged Support notes.
- data prohibited from disclosure.
- data no longer retained.

---

# Interoperability

Interoperability contracts should use documented, versioned and stable formats.

Interoperability must not bypass:

- Authentication.
- Authorization.
- Owner isolation.
- financial validation.
- Privacy.
- Security.
- Audit.
- schema compatibility.

---

# Accessibility

Import and Export workflows must support:

- Keyboard operation.
- screen-reader labels.
- accessible file selection.
- understandable validation results.
- accessible mapping controls.
- row-level error navigation.
- accessible progress.
- text scaling.
- non-color-only status.
- accessible download state.
- accessible exported documents where supported.

---

# Auditability

Material Import and Export lifecycle Events must remain reconstructable.

---

# Scope

This specification governs:

- File uploads.
- resumable uploads.
- upload Sessions.
- file names.
- MIME Types.
- file signatures.
- object storage.
- malware scanning.
- content scanning.
- archive handling.
- compression.
- CSV parsing.
- JSON parsing.
- spreadsheet parsing.
- character encoding.
- locale detection.
- delimiter detection.
- decimal detection.
- date detection.
- schema detection.
- column mapping.
- field normalization.
- row validation.
- Account mapping.
- Category mapping.
- currency mapping.
- duplicate detection.
- Import preview.
- Import confirmation.
- Import commitment.
- partial Import.
- Import Retry.
- Import cancellation.
- Import expiration.
- Import history.
- Import file retention.
- Import lineage.
- Export requests.
- Export Jobs.
- Export formats.
- Export schema.
- Export generation.
- Export files.
- Export download.
- Export expiration.
- Export regeneration.
- Export sharing where approved.
- Privacy Exports.
- Support Exports.
- Audit Exports.
- API-based interoperability.
- external provider ingestion.
- data portability.
- schema migration.
- Import and Export monitoring.
- Import and Export Incidents.
- Import and Export Accessibility.

---

# Out of Scope

This document does not independently define:

- Authentication.
- Authorization.
- canonical financial formulas.
- external banking settlement.
- complete Open Finance integration.
- generic cloud-drive synchronization.
- email attachment delivery.
- public file sharing.
- permanent archival storage.
- external tax filing.
- complete legal-discovery production.
- complete backup and disaster-recovery architecture.

Those capabilities must integrate with this specification.

---

# Import Domains

Nexio Imports are organized into:

```text
Financial Transaction Import

Account Import

Category Import

Budget Import

Goal Import

Recurring Transaction Import

Reference Data Import

Configuration Import

Provider Data Import

Migration Import

Support-Assisted Import

Administrative Import
```

---

# Financial Transaction Import Domain

Financial Transaction Import governs:

- Income.
- Expense.
- Refund.
- Fee.
- Adjustment candidates.
- Transfer candidates.
- scheduled Transaction candidates.
- imported descriptions.
- categories.
- effective dates.
- exact amounts.
- currencies.
- Account mapping.
- duplicate detection.
- reconciliation interaction.

Imported Transactions must follow the Financial Calculations specification.

---

# Account Import Domain

Account Import may support:

- Account name.
- Account Type.
- currency.
- opening-balance proposal.
- external reference.
- archive state where approved.

Account ownership must always come from the authenticated Nexio context.

---

# Category Import Domain

Category Import may support:

- Category name.
- parent Category.
- type.
- icon reference.
- status.
- external reference.

Category identifiers and semantics must remain stable after commitment.

---

# Budget Import Domain

Budget Import may support:

- Budget name.
- amount.
- currency.
- period.
- Account scope.
- Category scope.
- start and end boundaries.

Imported Budget amounts must not be treated as spending records.

---

# Goal Import Domain

Goal Import may support:

- Goal name.
- target amount.
- currency.
- target date.
- initial Contribution candidates.
- state.

A Goal target and a Goal Contribution are different financial concepts.

---

# Recurring Transaction Import Domain

Recurring Transaction Import may support:

- recurrence name.
- amount.
- currency.
- schedule.
- time zone.
- start date.
- end date.
- next occurrence.
- Account.
- Category.
- state.

Import must not generate historical recurring instances unless explicitly approved.

---

# Reference Data Import Domain

Reference data may include:

- supported Category templates.
- currency metadata.
- Account Type metadata.
- locale metadata.
- provider mappings.

Reference data Import requires administrative authority.

---

# Configuration Import Domain

Configuration Import is restricted.

It must not allow uploaded files to set:

- Secrets.
- credentials.
- unrestricted Feature Flags.
- Authorization.
- Production Provider routes.
- Security policies.
- another environment's configuration.

---

# Provider Data Import Domain

Provider Data Import may receive data through:

- API.
- secure file transfer.
- Provider webhook.
- object-storage delivery.
- manual upload.
- scheduled integration.

Provider identity does not replace Nexio validation.

---

# Migration Import Domain

Migration Import supports:

- Legacy Nexio versions.
- approved external financial systems.
- data-model upgrades.
- organizational migrations.
- Account consolidation.
- historical data restoration.

Migration Imports require stricter governance and reconciliation.

---

# Support-Assisted Import Domain

Support-assisted Import may help an Owner complete a valid Import workflow.

Support must not:

- select another Owner.
- alter canonical amounts without Owner confirmation.
- bypass duplicate detection.
- bypass financial validation.
- upload unrestricted files to Production.
- manually mark invalid rows Accepted.
- suppress required Evidence.

---

# Administrative Import Domain

Administrative Import may affect multiple Resources or platform configuration.

It requires:

- exceptional authority.
- separation of duties.
- approved file source.
- test execution.
- preview.
- rollback or forward correction.
- Audit Evidence.
- operational monitoring.

---

# Export Domains

Nexio Exports are organized into:

```text
Owner Financial Export

Transaction Export

Account Export

Budget Export

Goal Export

Recurring Transaction Export

Report Export

Reconciliation Export

Privacy Export

Support Export

Audit Export

Administrative Export

Interoperability Export
```

---

# Owner Financial Export Domain

An Owner Financial Export may include approved:

- Accounts.
- Transactions.
- Transfers.
- Budgets.
- Goals.
- recurring Transactions.
- categories.
- reconciliation summaries.
- Report metadata.

The Export must remain Owner-scoped.

---

# Transaction Export Domain

Transaction Export may support:

- selected Accounts.
- selected period.
- states.
- categories.
- exact amount.
- currency.
- effective date.
- description.
- transfer relationship.
- recurring relationship.
- Import lineage where permitted.

---

# Account Export Domain

Account Export may include:

- Account identifier.
- Account name.
- Account Type.
- currency.
- state.
- opening-balance metadata.
- balance Snapshot metadata where approved.

---

# Budget Export Domain

Budget Export may include:

- Budget definition.
- period.
- amount.
- currency.
- scope.
- usage summary.
- status.
- policy versions.

---

# Goal Export Domain

Goal Export may include:

- Goal definition.
- target.
- currency.
- target date.
- contributions.
- withdrawals.
- progress.
- state.

---

# Recurring Transaction Export Domain

Recurring Export may include:

- Template.
- schedule.
- time zone.
- amount.
- currency.
- Account.
- Category.
- state.
- generated-instance references.

---

# Report Export Domain

Report Exports must comply with the Reporting specification.

---

# Reconciliation Export Domain

Reconciliation Exports may include:

- Account.
- period.
- statement records.
- matches.
- unmatched records.
- differences.
- adjustments.
- completion state.
- evidence references where permitted.

---

# Privacy Export Domain

A Privacy Export must follow the Privacy request workflow.

It may include broader personal-data categories than an ordinary financial Export.

---

# Support Export Domain

Support Exports must be:

- case-scoped.
- field-minimized.
- time-bounded.
- authorized.
- audited.
- destroyed according to policy.

---

# Audit Export Domain

Audit Exports require privileged authority and must preserve Evidence integrity.

---

# Administrative Export Domain

Administrative Export may include aggregate or operational information.

Cross-Owner raw financial data requires exceptional authority and minimization.

---

# Interoperability Export Domain

Interoperability Exports use registered external contracts.

They must preserve:

- schema version.
- field meaning.
- currency.
- date semantics.
- exact values.
- Resource identity.
- Owner authorization.
- delivery integrity.

---

# Core Import and Export Principles

The Nexio architecture is governed by:

```text
Untrusted Input

Canonical Authority

Owner Isolation

Account Validation

Exact Money

Explicit Currency

Explicit Locale

Versioned Schemas

Deterministic Normalization

Preview Before Commit

Idempotent Commit

Source Lineage

Secure Artifact Delivery

Bounded Retention

Reproducible Output
```

---

# Untrusted Input Principle

Every byte from an uploaded or external file is untrusted.

Validation must occur before:

- parsing where possible.
- object activation.
- preview.
- canonical mutation.
- external distribution.

---

# Canonical Authority Principle

Imported content becomes canonical only after:

- Authentication.
- Owner resolution.
- Account validation.
- schema validation.
- row validation.
- duplicate evaluation.
- required confirmation.
- canonical domain validation.
- atomic commitment.

---

# Owner-Isolation Principle

Every Import Job, source file, normalized row, preview, commit operation, Export Job and file must be bound to one canonical Owner unless an exceptional administrative policy explicitly defines another scope.

---

# Account-Validation Principle

An imported Account reference must resolve to an Account belonging to the canonical Owner.

An Export Account filter must resolve to an Account belonging to the canonical Owner.

---

# Exact-Money Principle

Money must be parsed and serialized without binary floating-point authority.

---

# Explicit-Currency Principle

Currency is mandatory for monetary meaning.

When the Account has one canonical currency, an imported row without currency may inherit it only through an approved explicit policy.

---

# Explicit-Locale Principle

Decimal and date interpretation must use one resolved locale policy.

A value such as:

```text
1.234
```

may mean:

```text
One thousand two hundred thirty-four

or

One and two hundred thirty-four thousandths
```

depending on locale and field meaning.

Nexio must not guess silently when ambiguity materially affects value.

---

# Versioned-Schema Principle

Import and Export schemas must be registered and versioned.

---

# Deterministic-Normalization Principle

Normalization must produce a structured canonical candidate before domain commitment.

---

# Preview-Before-Commit Principle

Material Imports should separate:

```text
File accepted for processing

File parsed

Rows normalized

Rows validated

Preview ready

Owner confirmed

Canonical commit executed
```

---

# Idempotent-Commit Principle

The same confirmed Import operation must not apply twice.

---

# Source-Lineage Principle

Accepted Resources should retain sufficient lineage to explain their external origin.

---

# Secure-Artifact-Delivery Principle

Exports must use expiring, authorized and purpose-bound delivery.

---

# Bounded-Retention Principle

Import source files, previews and Export files must have defined retention.

---

# Reproducible-Output Principle

Material Exports must preserve enough metadata to reproduce or explain their exact scope and values.

---

# Import Architecture

The recommended Import architecture is:

```text
Authenticated Import Request

↓

Canonical Owner Resolution

↓

Upload Session Creation

↓

File Upload to Quarantine Storage

↓

File Integrity and Security Validation

↓

Format, Encoding and Schema Detection

↓

Parsing

↓

Normalization

↓

Mapping

↓

Row-Level Validation

↓

Duplicate and Conflict Analysis

↓

Import Preview

↓

Owner Review and Confirmation

↓

Idempotent Canonical Commit

↓

Financial and Derived Recalculation

↓

Synchronization Publication

↓

Notification and Audit Evidence

↓

Source File Retention or Destruction
```

---

# Import Job

An Import Job represents one governed ingestion lifecycle.

Recommended structure:

```text
ImportJob
 ├── importJobId
 ├── operationId
 ├── ownerId
 ├── actorId
 ├── importType
 ├── sourceType
 ├── sourceFileId
 ├── uploadSessionId
 ├── sourceSchemaId
 ├── detectedFormat
 ├── detectedEncoding
 ├── detectedLocale
 ├── mappingProfileId
 ├── targetAccountIds
 ├── state
 ├── progress
 ├── totalRecordCount
 ├── acceptedRecordCount
 ├── warningRecordCount
 ├── rejectedRecordCount
 ├── duplicateRecordCount
 ├── conflictRecordCount
 ├── createdAt
 ├── confirmedAt
 ├── committedAt
 ├── completedAt
 ├── expiresAt
 └── auditReference
```

---

# Import Job Identifier

Recommended format:

```text
imp_<sortable-unique-identifier>
```

---

# Import Operation Identifier

Every commit-capable Import should have a stable:

```text
operationId
```

Recommended format:

```text
op_import_<sortable-unique-identifier>
```

---

# Import Job States

Recommended:

```text
Created

AwaitingUpload

Uploading

Uploaded

Scanning

Quarantined

RejectedFile

DetectingFormat

Parsing

Normalizing

MappingRequired

Validating

AnalyzingDuplicates

PreviewReady

AwaitingConfirmation

Committing

Recalculating

Completed

CompletedWithWarnings

PartiallyCompleted

FailedRetryable

FailedFinal

Cancelled

Expired

Invalidated
```

---

# Created State

The Import Job exists, but no file content has been accepted.

---

# Awaiting-Upload State

The upload Session is ready.

---

# Uploading State

File bytes are being transferred.

The file must not be parsed as complete.

---

# Uploaded State

The expected upload completed and basic file-integrity checks passed.

---

# Scanning State

The file is undergoing Security and content inspection.

---

# Quarantined State

The file cannot proceed until Security disposition or automated analysis completes.

---

# Rejected-File State

The entire file is rejected.

Potential reasons include:

- Malware.
- unsupported type.
- invalid signature.
- excessive size.
- archive bomb.
- encrypted unsupported document.
- parser policy violation.
- corrupt file.
- prohibited content.

---

# Detecting-Format State

Nexio is identifying:

- Container format.
- file signature.
- MIME Type.
- encoding.
- delimiter.
- locale candidates.
- schema candidates.

---

# Parsing State

The file is being transformed into raw structured records.

---

# Normalizing State

Raw values are converted into controlled normalized representations.

---

# Mapping-Required State

Automatic field mapping could not be established safely.

Owner or approved administrative mapping is required.

---

# Validating State

Normalized records are being validated against:

- Import schema.
- canonical domain rules.
- Account scope.
- currency.
- dates.
- financial policies.
- field limits.

---

# Analyzing-Duplicates State

Nexio is comparing records against:

- The same file.
- previous Imports.
- canonical Resources.
- external record identities.
- recurring occurrences.
- transfer relationships.

---

# Preview-Ready State

The Import preview is complete and stable for review.

---

# Awaiting-Confirmation State

The Import requires explicit confirmation.

---

# Committing State

Validated and confirmed records are being converted into canonical Resources.

---

# Recalculating State

Canonical commitment completed or partially completed, and affected derived financial state is being recalculated.

---

# Completed State

All required accepted records committed successfully and required finalization completed.

---

# Completed-With-Warnings State

All commit-eligible required records completed, but warnings remain.

---

# Partially-Completed State

Some records committed while others failed, conflicted or were excluded according to the approved partial-commit policy.

---

# Failed-Retryable State

A temporary failure permits bounded Retry using the same Import and operation identities.

---

# Failed-Final State

No automatic Retry is allowed.

---

# Cancelled State

The Import was cancelled before unsupported further processing.

Cancellation after partial canonical commitment must not imply rollback.

---

# Expired State

The Import review or confirmation window ended.

---

# Invalidated State

The source, mapping, Account scope, schema or policy changed and the previous preview can no longer be committed safely.

---

# Import Source Types

Recommended controlled values:

```text
OwnerUpload

ProviderAPI

ProviderFileDelivery

SecureTransfer

LegacyMigration

NexioExportReimport

SupportAssisted

Administrative
```

---

# Import Type Registry

Every Import Type must be registered.

Recommended fields:

```text
importTypeId

importTypeKey

name

description

targetResourceTypes

supportedSourceTypes

supportedFormats

supportedLocales

supportedCurrencies

maximumFileSize

maximumRecordCount

previewRequired

confirmationRequired

partialCommitAllowed

duplicatePolicyReference

mappingPolicyReference

retentionPolicyReference

owner

version

status
```

---

# Import Type Identifier

Recommended format:

```text
IMPORT-TYPE-<DOMAIN>-<NUMBER>
```

Examples:

```text
IMPORT-TYPE-TRANSACTION-001

IMPORT-TYPE-ACCOUNT-001

IMPORT-TYPE-RECURRING-002
```

---

# Import Type Key

Recommended format:

```text
import.<domain>.<name>
```

---

# Import Type States

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

# Import Type Activation Requirements

```text
□ Purpose is defined.

□ Target Resource Types are defined.

□ Source Types are defined.

□ Supported formats are defined.

□ File-size limit is defined.

□ Record-count limit is defined.

□ Supported locales are defined.

□ Currency behavior is defined.

□ Mapping behavior is defined.

□ validation behavior is defined.

□ duplicate behavior is defined.

□ preview behavior is defined.

□ confirmation behavior is defined.

□ partial-commit behavior is defined.

□ retention is defined.

□ Security review is complete.

□ Privacy review is complete.

□ Financial review is complete where applicable.

□ Accessibility requirements are defined.

□ test vectors exist.
```

---

# Upload Session

An Upload Session represents a bounded file-transfer authorization.

Recommended structure:

```text
ImportUploadSession
 ├── uploadSessionId
 ├── importJobId
 ├── ownerId
 ├── actorId
 ├── expectedFileName
 ├── expectedSize
 ├── expectedContentType
 ├── maximumSize
 ├── uploadMode
 ├── uploadTokenReference
 ├── uploadedPartCount
 ├── expectedPartCount
 ├── state
 ├── createdAt
 ├── expiresAt
 └── completedAt
```

---

# Upload Session Identifier

Recommended format:

```text
upl_<sortable-unique-identifier>
```

---

# Upload Session States

Recommended:

```text
Created

Active

Uploading

Completing

Completed

Aborted

Expired

Rejected

Invalidated
```

---

# Upload Authorization

Upload authorization must be:

- Owner-bound.
- Import Job-bound.
- environment-bound.
- size-bound.
- time-bound.
- object-bound.
- revocable.
- nonreusable where practical.

---

# Upload Modes

Potential modes include:

```text
SingleRequest

Multipart

Resumable
```

---

# Single-Request Upload

Appropriate for small files within bounded request limits.

---

# Multipart Upload

Appropriate for larger files.

Every part must preserve:

- Upload Session.
- part number.
- integrity.
- size.
- expiration.
- Owner scope.

---

# Resumable Upload

A resumable upload must support:

- Stable Upload Session identity.
- acknowledged byte or part boundary.
- integrity verification.
- expiration.
- cancellation.
- duplicate-part handling.
- final content verification.

---

# Upload Completion

Upload completion must validate:

- All required parts exist.
- expected size matches.
- content hash matches where required.
- no unexpected extra part exists.
- Upload Session remains valid.
- final object belongs to the Import Job.

---

# Source File

A Source File represents the quarantined uploaded object.

Recommended structure:

```text
ImportSourceFile
 ├── sourceFileId
 ├── importJobId
 ├── ownerId
 ├── objectStorageReference
 ├── originalFileName
 ├── safeDisplayFileName
 ├── declaredContentType
 ├── detectedContentType
 ├── fileSignature
 ├── sizeBytes
 ├── contentHash
 ├── encryptionState
 ├── scanState
 ├── quarantineState
 ├── retentionUntil
 ├── createdAt
 └── destroyedAt
```

---

# Source File Identifier

Recommended format:

```text
ifile_<sortable-unique-identifier>
```

---

# File Name Governance

The original file name is untrusted.

It must not be used directly as:

- Object-storage path.
- server file-system path.
- shell command.
- HTML.
- SQL.
- log field without escaping.
- download authorization.
- canonical Import identity.

---

# Safe Display File Name

A safe display name should:

- Remove path components.
- normalize Unicode where approved.
- limit length.
- escape control characters.
- preserve useful extension.
- prevent bidirectional text confusion where possible.

---

# File Extension

The file extension is a hint.

It is not authoritative.

---

# Declared Content Type

The client-provided MIME Type is untrusted.

---

# Detected Content Type

Detected Type should use:

- file signature.
- container inspection.
- parser validation.
- approved content-detection library.

---

# File Signature Mismatch

Example:

```text
File name:
transactions.csv

Detected content:
Executable binary
```

The file must be rejected or quarantined.

---

# File Content Hash

A cryptographic content hash may support:

- Integrity.
- repeated-upload detection.
- audit.
- storage deduplication.
- Incident investigation.

The content hash alone must not determine that two financial Imports should share the same canonical result without checking Owner and Import policy.

---

# Object Storage Quarantine

Uploaded files should enter quarantine storage before parsing.

Quarantine storage must:

- Be environment-scoped.
- Be access-controlled.
- Prevent public access.
- use server-generated object names.
- support expiration.
- support malware scanning.
- support deletion.
- avoid automatic execution.
- avoid serving active content inline.

---

# Quarantine Release

A file may leave quarantine only after required checks pass.

---

# File Security Validation

Required checks may include:

```text
Size validation

Content-Type validation

File-signature validation

Malware scan

Archive-depth validation

Compression-ratio validation

Encrypted-file policy

Parser preflight

Macro detection

Active-content detection

Formula detection

XML external-entity protection
```

---

# File-Size Limits

Limits should exist at:

- Request.
- Upload Session.
- Import Type.
- Owner period.
- environment.
- total records.
- uncompressed size.

---

# Decompression Bomb Protection

Archive and compressed-file processing must enforce:

- Maximum uncompressed size.
- Maximum compression ratio.
- Maximum entry count.
- Maximum nesting depth.
- Maximum file-name length.
- Maximum processing time.
- Maximum memory.

---

# Archive Entry Path Safety

Archive entries must not write outside the approved extraction directory.

Reject entries containing unsafe:

```text
../

absolute paths

drive prefixes

symbolic-link escapes
```

---

# Encrypted File Policy

Password-protected or encrypted files should be rejected unless a separately approved secure decryption workflow exists.

Passwords must not be sent through ordinary logs or Support notes.

---

# Spreadsheet Macro Policy

Macro-enabled spreadsheet formats should be rejected or processed only through a safe nonexecuting parser under an explicitly approved policy.

Nexio must never execute spreadsheet macros.

---

# XML External Entities

XML parsing must disable external entity resolution and unsafe document-type processing.

---

# Formula Injection

Spreadsheet-compatible Export or Import content may contain values beginning with:

```text
=

+

-

@
```

These values can become formulas when opened in spreadsheet software.

Nexio must apply approved formula-injection protections.

A legitimate negative number must remain distinguishable from a formula payload.

---

# File Scan Result

Recommended structure:

```text
FileScanResult
 ├── scanResultId
 ├── sourceFileId
 ├── scannerVersion
 ├── result
 ├── threatCategories
 ├── safeCodes
 ├── scannedAt
 └── expiresAt
```

---

# File Scan Result States

Recommended:

```text
Pending

Clean

Suspicious

Malicious

ScanFailedRetryable

ScanFailedFinal

Unsupported
```

---

# Scan Failure

A scan failure must not be interpreted as Clean.

---

# Parsing Architecture

Parsing transforms file content into raw records.

Recommended flow:

```text
Verify scan state.

↓

Resolve parser.

↓

Apply byte and row limits.

↓

Detect encoding.

↓

Decode safely.

↓

Detect container structure.

↓

Read headers and metadata.

↓

Parse bounded records.

↓

Preserve source positions.

↓

Produce raw record set.
```

---

# Parser Registry

Every parser must be registered.

Recommended fields:

```text
parserId

parserKey

format

supportedVersions

supportedEncodings

maximumFileSize

maximumRecordCount

streamingSupport

formulaBehavior

hiddenContentBehavior

errorModel

owner

version

status
```

---

# Parser Identifier

Recommended format:

```text
PARSER-<FORMAT>-<NUMBER>
```

---

# Parser States

Recommended:

```text
Proposed

Testing

Active

Limited

Deprecated

Retired
```

---

# Parser Activation Requirements

```text
□ Format is defined.

□ supported versions are defined.

□ encoding behavior is defined.

□ byte limits are defined.

□ row limits are defined.

□ field limits are defined.

□ formula behavior is defined.

□ hidden content behavior is defined.

□ malformed-file behavior is defined.

□ Security testing is complete.

□ performance testing is complete.

□ fuzz testing is complete.
```

---

# Supported Initial Formats

Potential initial formats include:

```text
CSV

JSON

XLSX

Nexio Portable Package
```

Each format requires an active Parser and schema.

---

# CSV Import

CSV parsing must define:

- Encoding.
- delimiter.
- quote character.
- escape behavior.
- line endings.
- header presence.
- duplicate headers.
- empty records.
- embedded newlines.
- maximum columns.
- maximum field length.
- formula handling.
- locale.

---

# CSV Delimiter Detection

Potential delimiters include:

```text
,

;

tab
```

pt-BR financial CSV files commonly use semicolon when comma is the decimal separator.

Delimiter detection must not rely on one row only when ambiguity exists.

---

# CSV Header Handling

Headers should be:

- Trimmed according to policy.
- normalized for matching.
- preserved for Evidence.
- checked for duplicates.
- checked for empty names.
- length-limited.

---

# Duplicate CSV Headers

A file containing:

```text
date;amount;amount
```

must not map both fields silently.

It should require rejection or explicit mapping.

---

# CSV Row Position

Every row should preserve:

```text
physicalLineNumber

logicalRecordNumber
```

because quoted multiline fields may make them different.

---

# JSON Import

JSON parsing must define:

- Top-level object or array.
- maximum depth.
- maximum object count.
- maximum string length.
- number representation.
- duplicate-key behavior.
- unknown-field behavior.
- schema version.
- encoding.

---

# JSON Number Safety

Exact monetary values should be represented as strings or safe integer minor units according to the schema.

Example:

```json
{
  "amount": "1250.45",
  "currency": "BRL"
}
```

A JSON binary floating-point interpretation must not change the canonical value.

---

# Duplicate JSON Keys

Duplicate object keys must not be accepted silently.

---

# JSON Depth

Maximum nesting depth must be bounded.

---

# XLSX Import

Spreadsheet parsing must define:

- Worksheet selection.
- hidden worksheets.
- hidden rows.
- hidden columns.
- merged cells.
- formulas.
- cached formula values.
- cell types.
- date serials.
- number formats.
- locale.
- maximum dimensions.
- macros.
- external links.

---

# Worksheet Selection

Nexio should not silently import every worksheet.

The policy may use:

- Registered worksheet name.
- one detected table.
- Owner selection.
- Import schema metadata.

---

# Hidden Worksheet Policy

Hidden worksheets must not be imported silently.

---

# Formula Cell Policy

Formula cells should be:

- Rejected.
- treated as untrusted text.
- or read only through approved cached values.

Nexio must not evaluate formulas from uploaded spreadsheets.

---

# Spreadsheet Date Serial

Spreadsheet serial dates require explicit date-system handling.

The parser must account for:

- 1900 date system.
- 1904 date system.
- invalid serials.
- time fractions.
- time zone absence.

---

# Spreadsheet Number Format

Cell display formatting must not override the raw numeric value.

Currency identification must remain explicit.

---

# Nexio Portable Package

A Nexio Portable Package may contain:

```text
Manifest

Schema versions

Resource files

Integrity hashes

Owner-export metadata

Optional encrypted content

Signature metadata
```

A reimported package must still undergo Owner, schema and financial validation.

---

# Character Encoding

Supported encodings should be registered.

Potential support:

```text
UTF-8

UTF-8 with BOM

Selected legacy encodings through explicit policy
```

UTF-8 should be preferred.

---

# Encoding Detection

Encoding detection must:

- Use bounded analysis.
- reject invalid byte sequences where required.
- avoid silent character replacement that changes meaning.
- preserve original bytes for investigation during retention.

---

# Invalid Encoding

Invalid encoding must not result in:

- Corrupted Account names.
- changed decimal values.
- changed Category names.
- lost negative signs.
- hidden control characters.
- mistaken delimiters.

---

# Unicode Normalization

Text normalization may use an approved Unicode normalization form.

Normalization must not:

- Change exact identifiers unexpectedly.
- merge distinct external references.
- alter financial signs.
- remove meaningful characters silently.

---

# Control Characters

Unapproved control characters should be rejected or sanitized according to field policy.

---

# Locale Detection Architecture

Locale resolution may consider:

- Import Type.
- Owner-selected locale.
- Account locale.
- declared file metadata.
- registered source profile.
- delimiter.
- decimal samples.
- date samples.
- currency symbols.
- month names.

No single weak signal should determine material financial interpretation.

---

# Locale Resolution States

Recommended:

```text
Explicit

DetectedHighConfidence

DetectedLowConfidence

Ambiguous

Unsupported
```

---

# Ambiguous Locale Example

Input:

```text
Date:
03/04/2026

Amount:
1.234
```

Potential interpretations include:

```text
3 April 2026 and R$ 1.234,00

or

4 March 2026 and 1.234 currency units
```

Nexio must require an explicit resolution before commitment.

---

# pt-BR Import Conventions

A pt-BR Import profile may support:

```text
Date:
31/07/2026

Decimal:
1250,45

Grouped amount:
1.250,45

Currency:
BRL or R$
```

The normalized canonical amount becomes:

```text
"1250.45"
```

---

# Decimal Parsing

The parser must distinguish:

- Decimal separator.
- grouping separator.
- sign.
- currency symbol.
- surrounding whitespace.
- parentheses for negatives where supported.
- percentage.
- invalid multiple separators.
- scientific notation.

---

# Scientific Notation

Scientific notation should be rejected for ordinary Owner financial Import unless explicitly supported.

Example:

```text
1.25E3
```

must not become R$ 1.250,00 without an approved policy.

---

# Negative Amounts

Supported negative representations may include:

```text
-125,00

(125,00)
```

The Import schema must define whether negative values are allowed and how they map to Transaction direction.

---

# Sign and Direction

An Import must not represent the same financial direction twice.

Example ambiguous fields:

```text
type:
expense

amount:
-125.00
```

The schema must define whether this is valid or double-negated.

---

# Currency Symbol Parsing

A symbol such as:

```text
$
```

is ambiguous.

It must not resolve currency without an explicit source or mapping policy.

---

# Date Parsing

Date parsing must define:

- Accepted format.
- locale.
- calendar.
- time zone.
- date-only semantics.
- invalid dates.
- two-digit years.
- timestamps.
- daylight-saving behavior.

---

# Date-Only Financial Fields

A date-only field should remain a date.

It must not be converted through Device time zone in a way that changes the calendar date.

---

# Two-Digit Years

Two-digit years should be rejected by default.

Example:

```text
31/07/26
```

may be ambiguous.

---

# Timestamp Import

A timestamp must include or resolve:

- Time-zone offset.
- canonical instant.
- intended financial date where applicable.

---

# Schema Registry

Every Import and Export schema must exist in the Data Exchange Schema Registry.

Recommended fields:

```text
dataExchangeSchemaId

schemaKey

direction

format

resourceTypes

version

fieldDefinitions

localeRules

currencyRules

dateRules

identifierRules

compatibility

introducedAt

deprecatedAt

retiredAt

owner

status
```

---

# Data Exchange Schema Identifier

Recommended format:

```text
DXSCHEMA-<DIRECTION>-<DOMAIN>-<NUMBER>
```

Examples:

```text
DXSCHEMA-IMPORT-TRANSACTION-001

DXSCHEMA-EXPORT-OWNER-002
```

---

# Schema Key

Recommended format:

```text
data_exchange.<direction>.<domain>.<name>
```

---

# Schema Direction

Recommended:

```text
Import

Export

Bidirectional
```

---

# Field Definition

Recommended fields:

```text
fieldId

externalName

canonicalField

dataType

required

nullable

maximumLength

allowedValues

format

localeBehavior

currencyBehavior

normalization

validation

conflictBehavior

classification
```

---

# Import Schema Activation Requirements

```text
□ Target Resource Type is defined.

□ Every field has stable meaning.

□ Required fields are defined.

□ optional fields are defined.

□ unknown-field behavior is defined.

□ money representation is defined.

□ currency behavior is defined.

□ date behavior is defined.

□ locale behavior is defined.

□ identifier behavior is defined.

□ duplicate behavior is defined.

□ compatibility is defined.

□ Security review is complete.

□ Privacy review is complete.

□ financial review is complete.
```

---

# Export Schema Activation Requirements

```text
□ Source Resources are defined.

□ Owner scope is defined.

□ Account scope is defined.

□ exact money serialization is defined.

□ currency fields are defined.

□ date and time fields are defined.

□ nullable behavior is defined.

□ field classification is defined.

□ formula-injection behavior is defined.

□ compatibility is defined.

□ Accessibility requirements are defined.

□ retention is defined.
```

---

# Schema Compatibility

Recommended compatibility categories:

```text
BackwardCompatible

ForwardReadable

Breaking

Deprecated

Unsupported
```

---

# Breaking Import Schema Change

A breaking Import change requires:

- New schema version.
- new mapping review.
- test fixtures.
- Owner-facing guidance.
- migration profile.
- old-schema support window.
- rollback or rejection behavior.

---

# Breaking Export Schema Change

A breaking Export change requires:

- New schema version.
- compatibility documentation.
- consumer migration guidance.
- historical reader support where required.
- field-removal review.
- Privacy review.

---

# Mapping Architecture

Mapping connects external fields to canonical Nexio fields.

Recommended flow:

```text
Identify source schema.

↓

Resolve known mapping profile.

↓

Match required fields.

↓

Resolve Account and Category references.

↓

Resolve locale and currency.

↓

Normalize values.

↓

Validate mapping completeness.

↓

Generate mapping preview.
```

---

# Mapping Profile

Recommended structure:

```text
ImportMappingProfile
 ├── mappingProfileId
 ├── ownerId
 ├── importTypeId
 ├── sourceSchemaFingerprint
 ├── sourceFormat
 ├── sourceLocale
 ├── fieldMappings
 ├── constantMappings
 ├── transformationReferences
 ├── AccountMappingRules
 ├── CategoryMappingRules
 ├── currencyRules
 ├── dateRules
 ├── version
 ├── state
 ├── createdAt
 └── updatedAt
```

---

# Mapping Profile Identifier

Recommended format:

```text
imap_<sortable-unique-identifier>
```

---

# Mapping Profile Scope

A mapping profile may be:

```text
OwnerScoped

ProviderScoped

Administrative

SystemDefault
```

Owner-scoped profiles must never apply to another Owner.

---

# Mapping Profile States

Recommended:

```text
Draft

Validated

Active

Stale

Invalidated

Deprecated

Retired
```

---

# Mapping Fingerprint

A source schema fingerprint may include:

- normalized header names.
- column count.
- worksheet name.
- source schema version.
- provider identifier.
- field types.

It must not contain unrestricted private row values.

---

# Automatic Mapping

Automatic mapping may use:

- exact registered field names.
- approved aliases.
- known provider schema.
- saved Owner profile.
- deterministic normalized comparison.

---

# AI-Assisted Mapping

AI may suggest mappings.

AI suggestions must not become active without:

- schema validation.
- Owner or approved reviewer confirmation.
- field classification checks.
- financial-field safeguards.
- currency validation.
- Account validation.
- test preview.

AI must not infer another Owner's Account.

---

# Constant Mapping

A constant may be applied to all rows.

Examples:

```text
Account:
Main Checking Account

Currency:
BRL

Transaction Type:
Expense
```

The mapped Account must belong to the canonical Owner.

---

# Account Mapping

External Account references may map by:

- registered external identifier.
- explicit Owner selection.
- approved exact name match.
- provider relationship.

Name-only automatic Account matching should be treated cautiously.

---

# Category Mapping

External Category values may map to:

- Existing Nexio Category.
- New Category proposal.
- Uncategorized.
- Requires review.
- excluded row.

---

# Unknown Category

An unknown Category must not cause the amount to disappear.

Potential behavior:

- Map to `Uncategorized`.
- require Owner selection.
- propose a new Category.
- reject the row if policy requires Category.

---

# Mapping Invalidation

A mapping profile becomes stale or invalid when:

- Account was deleted.
- Account currency changed.
- Category was retired.
- source schema changed.
- required field disappeared.
- locale changed.
- Import Type changed.
- transformation version changed.

---

# Raw Import Record

A Raw Import Record preserves parser output before normalization.

Recommended structure:

```text
RawImportRecord
 ├── rawRecordId
 ├── importJobId
 ├── sourceFileId
 ├── worksheetReference
 ├── logicalRecordNumber
 ├── physicalLineNumber
 ├── rawFields
 ├── parserVersion
 ├── parsedAt
 └── contentHash
```

---

# Raw Import Record Identifier

Recommended format:

```text
iraw_<sortable-unique-identifier>
```

---

# Normalized Import Record

A Normalized Import Record uses controlled values.

Recommended structure:

```text
NormalizedImportRecord
 ├── normalizedRecordId
 ├── importJobId
 ├── rawRecordId
 ├── targetResourceType
 ├── externalRecordId
 ├── normalizedFields
 ├── amount
 ├── currency
 ├── effectiveDate
 ├── mappedAccountId
 ├── mappedCategoryId
 ├── normalizationWarnings
 ├── normalizedRecordHash
 ├── schemaVersion
 └── normalizedAt
```

---

# Normalized Record Identifier

Recommended format:

```text
inorm_<sortable-unique-identifier>
```

---

# Normalized Record Hash

The normalized record hash may support duplicate analysis.

It must include only the fields defined by the duplicate policy.

---

# Import Record Validation Result

Recommended structure:

```text
ImportRecordValidation
 ├── validationResultId
 ├── normalizedRecordId
 ├── resultState
 ├── errors
 ├── warnings
 ├── duplicateCandidates
 ├── conflictCandidates
 ├── ownerDecisionRequired
 ├── validatedAt
 └── policyVersions
```

---

# Validation Result Identifier

Recommended format:

```text
ival_<sortable-unique-identifier>
```

---

# Validation Result States

Recommended:

```text
Valid

ValidWithWarnings

Invalid

Ambiguous

DuplicateCandidate

ConflictCandidate

Excluded
```

---

# Validation Error Registry

Every validation error should use a controlled code.

Potential codes include:

```text
IMPORT_REQUIRED_FIELD_MISSING

IMPORT_FIELD_TOO_LONG

IMPORT_AMOUNT_INVALID

IMPORT_AMOUNT_ZERO_NOT_ALLOWED

IMPORT_AMOUNT_OUT_OF_RANGE

IMPORT_CURRENCY_MISSING

IMPORT_CURRENCY_UNSUPPORTED

IMPORT_CURRENCY_ACCOUNT_MISMATCH

IMPORT_DATE_INVALID

IMPORT_DATE_AMBIGUOUS

IMPORT_DATE_OUT_OF_RANGE

IMPORT_ACCOUNT_NOT_FOUND

IMPORT_ACCOUNT_NOT_OWNER

IMPORT_ACCOUNT_CLOSED

IMPORT_CATEGORY_INVALID

IMPORT_RESOURCE_STATE_INVALID

IMPORT_EXTERNAL_ID_DUPLICATE

IMPORT_SCHEMA_UNSUPPORTED

IMPORT_LOCALE_AMBIGUOUS

IMPORT_FORMULA_DETECTED

IMPORT_SECURITY_RESTRICTION
```

---

# Validation Warning Registry

Potential warning codes include:

```text
IMPORT_CATEGORY_DEFAULTED

IMPORT_DESCRIPTION_TRIMMED

IMPORT_DATE_NORMALIZED

IMPORT_DUPLICATE_POSSIBLE

IMPORT_ACCOUNT_NAME_MATCHED

IMPORT_CURRENCY_INHERITED

IMPORT_UNCATEGORIZED

IMPORT_HISTORICAL_DATE

IMPORT_DERIVED_RECALCULATION_REQUIRED
```

---

# Raw Error Protection

Raw parser, database or storage errors must not be shown directly to the Owner.

---

# Import Preview

An Import Preview represents the proposed canonical effect.

Recommended structure:

```text
ImportPreview
 ├── importPreviewId
 ├── importJobId
 ├── previewVersion
 ├── sourceFileHash
 ├── mappingProfileVersion
 ├── schemaVersion
 ├── ownerId
 ├── AccountScope
 ├── totalRecords
 ├── validRecords
 ├── warningRecords
 ├── rejectedRecords
 ├── duplicateCandidates
 ├── conflictCandidates
 ├── financialSummary
 ├── currencySummaries
 ├── requiredDecisions
 ├── generatedAt
 ├── expiresAt
 └── integrityReference
```

---

# Import Preview Identifier

Recommended format:

```text
iprv_<sortable-unique-identifier>
```

---

# Preview Version

A Preview version must change when:

- Mapping changes.
- locale changes.
- currency changes.
- Account mapping changes.
- Category mapping changes.
- duplicate decision changes.
- source data changes.
- validation policy changes.
- schema changes.

---

# Preview Expiration

Preview expiration protects against stale commitment.

On expiration:

- Do not commit.
- revalidate source file availability.
- regenerate validation.
- regenerate duplicate analysis.
- confirm Account state.
- create a new Preview version.

---

# Preview Financial Summary

A financial Transaction Import preview may show:

```text
Income:
R$ 3.500,00

Expenses:
R$ 1.250,45

Net imported impact:
R$ 2.249,55

Valid records:
42

Rejected records:
3

Possible duplicates:
2
```

The summary must use exact normalized records.

---

# Multi-Currency Preview

Currencies must be summarized separately unless an approved conversion policy applies.

Example:

```text
BRL:
Income R$ 3.500,00
Expenses R$ 1.250,45

USD:
Income USD 200.00
Expenses USD 50.00
```

Nexio must not combine these into one total silently.

---

# Preview Row Detail

The Owner should be able to review:

- Source row.
- normalized values.
- Account.
- Category.
- amount.
- currency.
- date.
- status.
- warnings.
- duplicate decision.
- exclusion decision.

---

# Preview Integrity

Commit must reference the exact Preview version confirmed by the Owner.

---

# Preview Mutation

Changing one decision should produce a new Preview version or a versioned Preview update.

---

# Import Confirmation

Confirmation should preserve:

```text
Import Job ID

Preview ID

Preview version

Owner ID

Actor ID

selected decisions

expected valid-record count

expected financial summary

confirmedAt

operationId
```

---

# Confirmation Authorization

Confirmation must revalidate:

- Authentication.
- canonical Owner.
- Account ownership.
- Import Job ownership.
- Preview state.
- Preview expiration.
- source-file integrity.
- mapping state.
- schema state.
- required reauthentication where applicable.

---

# Confirmation Drift

Commit must stop when the confirmed Preview no longer matches current:

- source file.
- mapping.
- Account state.
- schema.
- duplicate state.
- financial policy.
- Resource state.

---

# Import Commit Architecture

Recommended commit flow:

```text
Lock or claim Import operation.

↓

Validate idempotency.

↓

Validate confirmed Preview.

↓

Revalidate Owner and Account scope.

↓

Revalidate accepted records.

↓

Create canonical Resources in bounded transactions.

↓

Record Import lineage.

↓

Publish financial and synchronization Events.

↓

Record row-level commit results.

↓

Finalize Import state.

↓

Trigger recalculation.

↓

Generate Notification and Evidence.
```

---

# Import Commit Policy

Potential policies include:

```text
AtomicAllOrNothing

AtomicPerAccount

AtomicPerBatch

PartialPerRecord
```

The policy must be registered per Import Type.

---

# Atomic-All-or-Nothing Import

All accepted records commit or none commit.

Appropriate when records form one indivisible logical unit.

---

# Atomic-per-Account Import

Records are committed atomically within each Account partition.

---

# Atomic-per-Batch Import

Records are committed in bounded canonical batches.

The final state may become PartiallyCompleted.

---

# Partial-per-Record Import

Each record may commit independently.

This requires strong row-level result reporting.

---

# Import Commit Idempotency

Every canonical record created through an Import should reference:

- Import Job.
- normalized record.
- commit operation.
- external record identifier where available.

Retry must return prior row outcomes.

---

# Import Row Commit Result

Recommended structure:

```text
ImportRecordCommitResult
 ├── commitResultId
 ├── importJobId
 ├── normalizedRecordId
 ├── operationId
 ├── resultState
 ├── canonicalResourceType
 ├── canonicalResourceId
 ├── canonicalResourceVersion
 ├── synchronizationSequence
 ├── errorCode
 ├── committedAt
 └── auditReference
```

---

# Row Commit Result States

Recommended:

```text
Committed

CommittedWithWarnings

DuplicateExisting

RejectedAtCommit

ConflictedAtCommit

Skipped

RolledBack

Unknown
```

---

# Commit-Time Revalidation

A row valid during Preview may fail during commit because:

- Account closed.
- Category deleted.
- Resource changed.
- duplicate appeared.
- reconciliation completed.
- permission changed.
- Feature disabled.
- currency policy changed.
- Import expired.

The final state must preserve this difference.

---

# Unknown Commit Outcome

If the client loses connection after commit begins:

- Do not create a new Import Job.
- query Import operation status.
- retry using the same operation identity.
- return previous row results.
- avoid duplicate canonical Resources.

---

# Import Cancellation

Cancellation before canonical commit should stop future processing.

Cancellation during commitment must:

- stop only uncommitted work where safe.
- preserve committed records.
- preserve row results.
- avoid claiming full rollback.
- trigger recalculation for committed records.
- finalize as PartiallyCompleted or CancelledAfterPartialCommit according to the state model.

---

# Import Invalidity

An Import becomes invalid when:

- Source file changes.
- file hash changes.
- mapping becomes invalid.
- schema is retired.
- Account scope changes.
- Owner authorization ends.
- Preview expires.
- Security scan changes.
- source Provider is revoked.

---

# Import File Retention

Source-file retention must define:

- Quarantine retention.
- preview retention.
- completed Import retention.
- failed Import retention.
- malicious-file retention.
- Legal Hold.
- Privacy deletion.
- backup behavior.

---

# Malicious File Retention

Malicious files should generally be destroyed or isolated according to Security Incident policy.

They must not remain available to ordinary Support or Product users.

---

# Import File Destruction

Destruction should cover:

- Quarantine storage.
- processing copies.
- temporary extraction directories.
- parser caches.
- preview artifacts.
- search indexes.
- backups according to policy.

---

# Export Architecture

The recommended Export architecture is:

```text
Authenticated Export Request

↓

Canonical Owner Resolution

↓

Authorization and Scope Validation

↓

Export Type and Schema Resolution

↓

Source Data Boundary Resolution

↓

Background Export Job

↓

Canonical Data Retrieval

↓

Serialization and Formula Protection

↓

Integrity Manifest Generation

↓

Encrypted Object Storage

↓

Download Authorization Creation

↓

Owner Notification

↓

Authorized Download

↓

Expiration and Destruction
```

---

# Export Job

Recommended structure:

```text
ExportJob
 ├── exportJobId
 ├── operationId
 ├── ownerId
 ├── actorId
 ├── exportTypeId
 ├── exportSchemaId
 ├── format
 ├── AccountScope
 ├── ResourceScope
 ├── period
 ├── filters
 ├── currencyScope
 ├── sourceBoundary
 ├── state
 ├── progress
 ├── generatedRecordCount
 ├── fileId
 ├── requestedAt
 ├── startedAt
 ├── completedAt
 ├── expiresAt
 └── auditReference
```

---

# Export Job Identifier

Recommended format:

```text
exp_<sortable-unique-identifier>
```

---

# Export Operation Identifier

Recommended format:

```text
op_export_<sortable-unique-identifier>
```

---

# Export Job States

Recommended:

```text
Requested

Validating

Queued

PreparingData

Generating

Verifying

Ready

PartiallyReady

FailedRetryable

FailedFinal

Cancelled

Expired

Invalidated

Destroyed
```

---

# Requested State

The Export request exists but has not yet passed scope validation.

---

# Validating State

Nexio is validating:

- Authentication.
- Owner.
- Account scope.
- Resource scope.
- period.
- format.
- schema.
- size limits.
- Export authority.

---

# Queued State

The Export is waiting for background processing.

---

# Preparing-Data State

The canonical source boundary is being resolved.

---

# Generating State

The file is being serialized.

---

# Verifying State

Nexio is checking:

- Record count.
- summary equality.
- content hash.
- schema validity.
- currency.
- formula protection.
- file readability.
- accessibility where supported.

---

# Ready State

The Export file is available through approved authorization.

---

# Partially-Ready State

Only allowed when the Export Type explicitly supports partial output and the missing scope is disclosed.

---

# Failed-Retryable State

A temporary generation failure permits bounded Retry with the same operation identity.

---

# Failed-Final State

No automatic Retry is allowed.

---

# Expired State

Download authority ended.

---

# Invalidated State

The Export must no longer be delivered because:

- Security Incident.
- Privacy change.
- source scope invalid.
- wrong Owner risk.
- file-integrity failure.
- schema defect.
- incorrect financial result.

---

# Destroyed State

The generated file was removed according to retention policy.

Metadata may remain according to Audit policy.

---

# Export Type Registry

Every Export Type must be registered.

Recommended fields:

```text
exportTypeId

exportTypeKey

name

description

sourceResourceTypes

supportedFormats

supportedSchemas

maximumPeriod

maximumRecordCount

maximumFileSize

reauthenticationRequired

partialOutputAllowed

downloadPolicyReference

retentionPolicyReference

accessibilityRequirements

owner

version

status
```

---

# Export Type Identifier

Recommended format:

```text
EXPORT-TYPE-<DOMAIN>-<NUMBER>
```

---

# Export Type Key

Recommended format:

```text
export.<domain>.<name>
```

---

# Export Type Activation Requirements

```text
□ Purpose is defined.

□ Source Resources are defined.

□ Owner scope is defined.

□ Account scope is defined.

□ supported formats are defined.

□ schemas are defined.

□ maximum period is defined.

□ maximum record count is defined.

□ maximum file size is defined.

□ reauthentication behavior is defined.

□ partial-output behavior is defined.

□ download behavior is defined.

□ retention is defined.

□ Security review is complete.

□ Privacy review is complete.

□ financial review is complete where applicable.

□ Accessibility requirements are defined.
```

---

# Export Request

Recommended structure:

```text
ExportRequest
 ├── exportRequestId
 ├── operationId
 ├── exportTypeId
 ├── format
 ├── schemaVersion
 ├── AccountIds
 ├── ResourceFilters
 ├── period
 ├── currencyScope
 ├── locale
 ├── timeZone
 ├── requestedAt
 └── clientContext
```

---

# Export Request Identifier

Recommended format:

```text
exreq_<sortable-unique-identifier>
```

---

# Export Scope Validation

The backend must validate:

- Every Account belongs to Owner.
- Every Resource belongs to Owner.
- period is bounded.
- filters are allowed.
- requested fields are allowed.
- format is supported.
- schema version is active.
- currency behavior is supported.
- estimated size is within policy.

---

# Export Source Boundary

An Export must identify one canonical data boundary.

Potential boundaries include:

```text
Report Snapshot

Owner synchronization sequence

Account financial sequence

Server as-of time

Dataset version

Reconciliation Snapshot
```

---

# Export Snapshot Consistency

When the Export implies one coherent state, source data should use compatible boundaries.

---

# Export File

Recommended structure:

```text
ExportFile
 ├── exportFileId
 ├── exportJobId
 ├── ownerId
 ├── objectStorageReference
 ├── safeFileName
 ├── format
 ├── schemaVersion
 ├── contentType
 ├── encoding
 ├── sizeBytes
 ├── recordCount
 ├── contentHash
 ├── manifestReference
 ├── encryptionState
 ├── state
 ├── createdAt
 ├── expiresAt
 └── destroyedAt
```

---

# Export File Identifier

Recommended format:

```text
efile_<sortable-unique-identifier>
```

---

# Export File States

Recommended:

```text
Generating

Verifying

Ready

Invalidated

Expired

Destroyed

IntegrityFailed
```

---

# Export File Name

File names should be:

- Server-generated.
- safe.
- Owner-neutral where exposed externally.
- free from secrets.
- free from complete Account numbers.
- free from access tokens.
- localized where appropriate.
- length-limited.

Example:

```text
nexio-transacoes-2026-07.csv
```

---

# Export Formats

Potential supported formats include:

```text
CSV

JSON

XLSX

PDF

Nexio Portable Package
```

Each format must have an active schema and serializer.

---

# CSV Export

CSV Export must define:

- Encoding.
- delimiter.
- quote behavior.
- line endings.
- header names.
- decimal serialization.
- date serialization.
- formula-injection protection.
- null representation.
- multi-value representation.

---

# pt-BR CSV Export

A human-readable pt-BR CSV may use:

```text
Delimiter:
;

Decimal separator:
,

Date:
31/07/2026

Example row:
31/07/2026;Despesa;R$ 1.250,45
```

A machine-portable CSV may instead use locale-neutral canonical fields.

The Export schema must identify which model applies.

---

# Machine-Portable CSV

Recommended money fields:

```text
amount:
1250.45

currency:
BRL
```

Date:

```text
2026-07-31
```

---

# JSON Export

JSON Export should use:

- UTF-8.
- explicit schema version.
- exact money strings or safe minor units.
- ISO date or timestamp formats.
- explicit currencies.
- stable Resource identifiers.
- null semantics.
- controlled field order where useful but not semantically required.

---

# XLSX Export

XLSX Export should:

- preserve exact values.
- label currencies.
- avoid unsafe formulas.
- protect against formula injection.
- use accessible worksheet names.
- include schema or metadata worksheet where appropriate.
- avoid hidden critical data.
- avoid macros.
- avoid external links.
- remain readable without automatic calculation.

---

# PDF Export

PDF Export is primarily a presentation artifact.

It should preserve:

- Owner-safe title.
- scope.
- period.
- currency.
- generation time.
- page numbers.
- accessible reading order where supported.
- table headers.
- exact values.
- Report or Export identifier.
- stale or partial warnings.

PDF should not be the only portability format for structured data.

---

# Nexio Portable Package Export

A portable package may include:

```text
manifest.json

accounts.json

transactions.json

budgets.json

goals.json

recurring-transactions.json

categories.json

integrity-hashes.json
```

The package must not include secrets.

---

# Export Manifest

Recommended structure:

```text
ExportManifest
 ├── exportJobId
 ├── exportTypeId
 ├── schemaVersions
 ├── ownerScopeReference
 ├── AccountScope
 ├── period
 ├── currencyScope
 ├── sourceBoundary
 ├── files
 ├── recordCounts
 ├── contentHashes
 ├── generatedAt
 ├── expiresAt
 └── integrityVersion
```

---

# Export Verification

Verification should confirm:

```text
The file opens through the approved parser.

The schema is valid.

The record count matches generation results.

The content hash matches.

The Owner scope matches.

The Account scope matches.

Currency fields exist.

Exact amounts remain exact.

Date fields retain meaning.

Formula-injection protection is applied.

Summary totals reconcile where applicable.
```

---

# Export Summary and Detail Equality

For financial Exports:

```text
Approved aggregation of exported detail
=
Export summary
```

under the same scope and policy.

---

# Export Integrity Failure

On integrity failure:

- Mark the file `IntegrityFailed`.
- block download.
- preserve safe Evidence.
- regenerate through a new verified attempt.
- investigate systemic serializer defects.

---

# Export Download Authorization

Download authorization should use a purpose-bound short-lived reference.

Recommended structure:

```text
ExportDownloadAuthorization
 ├── downloadAuthorizationId
 ├── exportFileId
 ├── ownerId
 ├── actorId
 ├── purpose
 ├── maximumDownloads
 ├── downloadCount
 ├── reauthenticationState
 ├── issuedAt
 ├── expiresAt
 ├── revokedAt
 └── state
```

---

# Download Authorization Identifier

Recommended format:

```text
edl_<sortable-unique-identifier>
```

---

# Download Authorization States

Recommended:

```text
Active

Used

Exhausted

Expired

Revoked

Invalidated
```

---

# Download Validation

Every download must validate:

- Authentication or approved token model.
- Owner.
- Export ownership.
- file state.
- expiration.
- maximum download count.
- reauthentication.
- authorization revocation.
- environment.

---

# Download URL Protection

Download URLs must not be:

- Permanent.
- reusable without policy.
- stored in ordinary logs.
- embedded in public pages.
- transferable as Authorization.
- valid after file invalidation.
- valid for another Owner.

---

# Export Reauthentication

Sensitive Exports may require recent Authentication or stronger Authentication.

---

# Export Download Evidence

Material downloads should preserve:

- Export file.
- Actor.
- Owner.
- time.
- safe network or Device metadata where approved.
- result.
- authorization reference.

---

# Export Expiration

On expiration:

- Download authorization stops.
- file state becomes Expired.
- storage deletion is scheduled.
- Notification action becomes unavailable.
- regeneration may remain available through a new Export operation.

---

# Export Regeneration

Regeneration must define whether it uses:

```text
Original source boundary

or

Current canonical data
```

A current-data regeneration creates a new Export identity.

---

# Export Sharing

Owner-to-third-party sharing should remain disabled unless a separately approved capability defines:

- Recipient.
- purpose.
- fields.
- expiration.
- revocation.
- download limits.
- Audit Evidence.
- Privacy obligations.

---

# Data Portability Architecture

Data portability should provide machine-readable, documented and Owner-scoped data.

---

# Portability Request

A portability request should identify:

```text
Owner

Requested data categories

Format

Period

Locale

Time zone

Delivery method

Authentication strength

Request time

Expiration
```

---

# Portability Data Categories

Potential categories include:

```text
Profile

Accounts

Transactions

Transfers

Budgets

Goals

Recurring Transactions

Categories

Notification preferences

Dashboard preferences

Import history

Export history

Reconciliation summaries
```

---

# Portability Exclusions

Potential exclusions include:

- Authentication secrets.
- passwords.
- encryption keys.
- Provider credentials.
- internal Security detection.
- another Owner's data.
- privileged Support data.
- internal risk models.
- deleted data no longer retained.
- legally restricted data.

---

# Interoperability Contract Registry

Every external interoperability contract should be registered.

Recommended fields:

```text
interoperabilityContractId

contractKey

externalSystem

direction

transport

authenticationModel

resourceTypes

schemaVersions

currencyModel

dateModel

identifierModel

idempotencyModel

errorModel

retryModel

securityClassification

privacyClassification

owner

version

status
```

---

# Interoperability Contract Identifier

Recommended format:

```text
INTEROP-<SYSTEM>-<NUMBER>
```

---

# Interoperability Directions

Recommended:

```text
Inbound

Outbound

Bidirectional
```

---

# Interoperability Transports

Potential transports include:

```text
HTTPS API

Webhook

Secure File Transfer

Object Storage Delivery

Manual File Exchange
```

---

# External Authentication

External systems must use approved Authentication.

An external system identifier does not grant Owner-level access.

---

# External Resource Identity

External record identifiers should be stored separately from canonical Nexio Resource identifiers.

---

# External Identifier Model

Recommended:

```text
ExternalResourceReference
 ├── externalReferenceId
 ├── externalSystemId
 ├── externalResourceType
 ├── externalResourceId
 ├── ownerId
 ├── canonicalResourceType
 ├── canonicalResourceId
 ├── firstSeenAt
 ├── lastSeenAt
 └── state
```

---

# External Identifier Uniqueness

Uniqueness scope must define:

```text
External system

+

external Resource Type

+

external Resource ID

+

Owner or Provider relationship
```

---

# External Retry

Inbound and outbound interoperability Retry must preserve stable operation identity.

---

# External Error Model

Raw external Provider errors must be normalized into controlled Nexio codes.

---

# Initial Import and Export Acceptance Criteria

The initial Imports, Exports, Data Portability and Interoperability architecture is accepted only when:

1. Every Import Type is registered.

2. Every Import Type has a stable identifier.

3. Every Import Type has a stable key.

4. Every Import Type has one defined purpose.

5. Every Import Type defines target Resource Types.

6. Every Import Type defines supported source Types.

7. Every Import Type defines supported formats.

8. Every Import Type defines supported locales.

9. Every Import Type defines currency behavior.

10. Every Import Type defines maximum file size.

11. Every Import Type defines maximum record count.

12. Every Import Type defines preview behavior.

13. Every Import Type defines confirmation behavior.

14. Every Import Type defines partial-commit behavior.

15. Every Import Type defines duplicate behavior.

16. Every Import Type defines retention.

17. Every Import Job has a stable identifier.

18. Every commit-capable Import has a stable operationId.

19. Every Import Job identifies the canonical Owner.

20. Account-scoped Imports identify target Accounts.

21. Every target Account is validated against the Owner.

22. Owner identifiers inside uploaded files are not trusted.

23. Account ownership cannot be assigned through uploaded content.

24. Import Job states are controlled.

25. Uploaded remains distinct from Parsed.

26. Parsed remains distinct from Validated.

27. Validated remains distinct from Committed.

28. PreviewReady remains distinct from Completed.

29. PartiallyCompleted remains distinct from Completed.

30. FailedRetryable remains distinct from FailedFinal.

31. Every upload uses a bounded Upload Session.

32. Upload Sessions are Owner-bound.

33. Upload Sessions are Import Job-bound.

34. Upload Sessions are environment-bound.

35. Upload Sessions expire.

36. Upload Sessions enforce file-size limits.

37. Resumable uploads preserve Session identity.

38. Multipart uploads validate every part.

39. Upload completion validates final size.

40. Upload completion validates integrity where required.

41. Every uploaded file enters quarantine.

42. Quarantine storage is not public.

43. Quarantine objects use server-generated names.

44. Original file names are treated as untrusted.

45. Original file names do not control storage paths.

46. File extensions are not authoritative.

47. client-provided MIME Types are not authoritative.

48. file signatures are validated.

49. extension and signature mismatch produces controlled rejection.

50. every source file has a content hash where required.

51. file-size limits exist before parsing.

52. uncompressed-size limits exist.

53. archive-entry limits exist.

54. archive nesting limits exist.

55. decompression ratios are bounded.

56. archive path traversal is prevented.

57. encrypted files follow an explicit policy.

58. spreadsheet macros are never executed.

59. XML external entities are disabled.

60. active content is rejected or safely ignored.

61. malware scan state is explicit.

62. scan failure is not interpreted as Clean.

63. malicious files do not enter ordinary parsing.

64. every active parser is registered.

65. every parser has a stable identifier.

66. every parser defines supported formats.

67. every parser defines size limits.

68. every parser defines record limits.

69. every parser defines malformed-file behavior.

70. parsers undergo Security testing.

71. parsers undergo fuzz testing.

72. CSV delimiter behavior is defined.

73. CSV quote behavior is defined.

74. CSV encoding behavior is defined.

75. CSV duplicate headers are rejected or explicitly mapped.

76. CSV logical and physical row positions are preserved.

77. JSON top-level structure is defined.

78. JSON nesting is bounded.

79. JSON duplicate keys are rejected.

80. JSON monetary values preserve exactness.

81. XLSX worksheet-selection behavior is explicit.

82. hidden worksheets are not imported silently.

83. hidden rows and columns follow explicit policy.

84. uploaded formulas are not executed.

85. spreadsheet date systems are handled explicitly.

86. spreadsheet display formatting does not override raw value meaning.

87. external spreadsheet links are not followed.

88. supported encodings are registered.

89. UTF-8 is preferred.

90. invalid encoding does not silently change financial meaning.

91. Unicode normalization follows an approved policy.

92. unapproved control characters are rejected or sanitized.

93. locale-resolution states are controlled.

94. explicit locale overrides weak detection.

95. ambiguous locale requires review.

96. decimal separators are resolved explicitly.

97. grouping separators are resolved explicitly.

98. currency is not guessed from punctuation alone.

99. ambiguous currency symbols require resolution.

100. scientific notation is rejected unless explicitly supported.

101. negative-value behavior is defined.

102. Transaction direction and amount sign cannot double-negate silently.

103. date formats are explicit.

104. date-only values remain calendar dates.

105. two-digit years are rejected by default.

106. timestamps resolve time zone.

107. every active Import schema is registered.

108. every active Export schema is registered.

109. schemas have stable identifiers.

110. schemas have explicit versions.

111. every schema field has stable meaning.

112. required fields are defined.

113. optional fields are defined.

114. unknown-field behavior is defined.

115. money representation is defined.

116. currency fields are defined.

117. date fields are defined.

118. identifier fields are defined.

119. breaking schema changes create new versions.

120. old schema retirement has a compatibility plan.

121. mapping profiles have stable identifiers.

122. Owner mapping profiles are Owner-scoped.

123. mapping profiles identify source schema.

124. mapping profiles identify locale.

125. mapping profiles identify currency Rules.

126. mapping profiles identify Account Rules.

127. mapping profiles identify Category Rules.

128. automatic mapping uses approved deterministic aliases.

129. AI mapping remains a suggestion.

130. AI mapping requires validation and confirmation.

131. AI cannot select another Owner's Account.

132. constant Account mapping validates Account ownership.

133. unknown Categories follow a registered policy.

134. stale mappings are invalidated.

135. raw Import records preserve source position.

136. normalized records preserve raw record relationships.

137. normalized monetary values are exact.

138. normalized monetary values identify currency.

139. normalized dates use controlled semantics.

140. normalized records identify mapped Account.

141. normalized records identify mapped Category where applicable.

142. validation results have stable identifiers.

143. validation errors use controlled codes.

144. validation warnings use controlled codes.

145. raw parser errors are not shown to Owners.

146. every row has an explicit validation outcome.

147. file-level success does not hide row failure.

148. duplicate candidates remain distinct from confirmed duplicates.

149. matching amount and date alone does not prove duplicate financial activity.

150. every Import Preview has a stable identifier.

151. every Preview has a version.

152. Preview versions change after mapping changes.

153. Preview versions change after locale changes.

154. Preview versions change after currency changes.

155. Preview versions change after duplicate decisions.

156. Preview expiration is defined.

157. expired Preview cannot be committed.

158. Preview summaries use exact normalized records.

159. multi-currency previews separate currencies.

160. Preview rows expose validation state accessibly.

161. Import confirmation references exact Preview version.

162. confirmation validates canonical Owner.

163. confirmation validates Import ownership.

164. confirmation validates Preview expiration.

165. confirmation validates source-file integrity.

166. confirmation validates Account state.

167. commit stops after Preview drift.

168. Import commit is idempotent.

169. Import commit preserves operation identity.

170. every committed row preserves source lineage.

171. every committed row preserves canonical Resource identity.

172. every committed row preserves Resource version.

173. every committed row preserves row-level result.

174. Import commit policies are registered.

175. AtomicAllOrNothing behavior is explicit.

176. AtomicPerAccount behavior is explicit.

177. AtomicPerBatch behavior is explicit.

178. PartialPerRecord behavior is explicit.

179. commit-time revalidation is required.

180. valid Preview rows may fail safely at commit.

181. unknown commit outcome uses status lookup or same-operation Retry.

182. unknown commit outcome does not create a new Import Job automatically.

183. cancellation does not claim rollback of committed rows.

184. partial cancellation preserves committed results.

185. affected financial state is recalculated after commitment.

186. synchronization changes are published after commitment.

187. Notifications describe partial completion accurately.

188. Import source-file retention is defined.

189. malicious-file retention follows Security policy.

190. Import file destruction covers temporary copies.

191. every Export Type is registered.

192. every Export Type has a stable identifier.

193. every Export Type has a stable key.

194. every Export Type defines source Resource Types.

195. every Export Type defines supported formats.

196. every Export Type defines supported schemas.

197. every Export Type defines maximum period.

198. every Export Type defines maximum record count.

199. every Export Type defines maximum file size.

200. every Export Type defines reauthentication behavior.

201. every Export Type defines retention.

202. every Export Job has a stable identifier.

203. every Export operation has a stable operationId.

204. every Export Job identifies canonical Owner.

205. Account-scoped Exports validate every Account.

206. Export filters are controlled.

207. Export source boundaries are explicit.

208. Export Job states are controlled.

209. Queued remains distinct from Ready.

210. Ready remains distinct from Downloaded.

211. Expired remains distinct from Destroyed.

212. Invalidated Exports cannot be downloaded.

213. every Export file has a stable identifier.

214. every Export file identifies schema version.

215. every Export file identifies content type.

216. every Export file identifies encoding.

217. every Export file identifies record count.

218. every Export file preserves a content hash where required.

219. Export file names contain no secrets.

220. Export file names contain no reusable Authorization.

221. CSV Export delimiter behavior is explicit.

222. CSV Export decimal behavior is explicit.

223. CSV Export date behavior is explicit.

224. CSV Export null behavior is explicit.

225. CSV Export protects against formula injection.

226. JSON Export uses exact monetary serialization.

227. JSON Export identifies currency explicitly.

228. JSON Export uses stable date formats.

229. XLSX Export contains no macros.

230. XLSX Export contains no unsafe external links.

231. XLSX Export protects against formula injection.

232. PDF Export preserves scope and currency.

233. PDF Export is not the only structured portability format.

234. portable packages include schema metadata.

235. portable packages include integrity metadata.

236. portable packages include no secrets.

237. Export manifests preserve scope.

238. Export manifests preserve source boundary.

239. Export manifests preserve record counts.

240. Export manifests preserve file hashes.

241. Export verification checks file readability.

242. Export verification checks schema validity.

243. Export verification checks Owner scope.

244. Export verification checks Account scope.

245. Export verification checks exact values.

246. Export verification checks currencies.

247. Export verification checks formula protection.

248. financial Export detail reconciles with summary.

249. integrity-failed Exports are blocked.

250. every download authorization has a stable identifier.

251. download authorization is Owner-bound.

252. download authorization is Export-bound.

253. download authorization expires.

254. download authorization is revocable.

255. download count is bounded where required.

256. every download revalidates file state.

257. every download revalidates Owner access.

258. download URLs are not permanent.

259. download URLs do not appear in ordinary logs.

260. download URLs do not grant authority to another Owner.

261. sensitive Exports may require reauthentication.

262. material downloads preserve Evidence.

263. expired Exports disable Notification actions.

264. regeneration creates a new Export identity when using current data.

265. Export sharing remains disabled until separately governed.

266. portability requests are Owner-scoped.

267. portability formats are machine-readable.

268. portability excludes secrets.

269. portability excludes another Owner's data.

270. interoperability contracts are registered.

271. interoperability contracts have stable identifiers.

272. interoperability contracts define direction.

273. interoperability contracts define transport.

274. interoperability contracts define Authentication.

275. interoperability contracts define Resources.

276. interoperability contracts define schemas.

277. interoperability contracts define currency behavior.

278. interoperability contracts define date behavior.

279. interoperability contracts define idempotency.

280. external identifiers remain distinct from canonical identifiers.

281. external Resource references are Owner-scoped.

282. external Retry preserves operation identity.

283. external errors are normalized.

284. Import and Export interfaces support keyboard operation.

285. Import progress is accessible.

286. row-level errors are accessible.

287. mapping controls are accessible.

288. Preview financial summaries preserve readable currency.

289. Export readiness is announced accessibly.

290. download expiration is communicated accessibly.

291. cross-Owner Import is Critical.

292. cross-Owner Export is Critical.

293. malware reaching parser execution is Critical.

294. duplicate committed financial Import caused by Retry has a zero target.

295. unauthorized Export download has a zero target.

296. formula-injection protection failure is monitored.

297. parser failures are monitored.

298. scan failures are monitored.

299. Preview and commit count differences are monitored.

300. Import partial completion is monitored.

301. Export integrity failure is monitored.

302. Export generation latency is monitored.

303. Export expiration and destruction are monitored.

304. every material Import lifecycle remains reconstructable.

305. every material Export lifecycle remains reconstructable.

---

# Foundational Import and Export Rule

A file is not valid merely because Nexio can read it.

A row is not valid merely because it contains an amount and date.

A duplicate is not proven merely because two records look similar.

A Preview is not a canonical mutation.

An Import is not complete merely because some records committed.

An Export is not safe merely because it was generated successfully.

A download link is not Authorization merely because it contains a random token.

An Import lifecycle is trustworthy only when Nexio can establish:

```text
The authenticated Actor

The canonical Owner

The Account and Resource scope

The source file and content hash

The Security scan state

The parser and parser version

The format, encoding, locale and schema

The mapping profile and version

The normalized values

The exact amount and currency

The validation result for every row

The duplicate and conflict decisions

The confirmed Preview version

The stable commit operation identity

The canonical Resource outcomes

The recalculation and synchronization outcomes

The Evidence required to reconstruct the lifecycle
```

An Export lifecycle is trustworthy only when Nexio can establish:

```text
The authenticated requester

The canonical Owner

The Account, Resource, period and filter scope

The source data boundary

The Export Type, format and schema version

The exact serialized values

The content hash and verification result

The storage and expiration policy

The download authorization

The download Evidence

The destruction state
```

When file safety, Owner scope, Account scope, locale, currency, schema, mapping, duplicate status, Preview integrity, operation identity, Export integrity or download authority cannot be established, Nexio must prefer the action that:

- Stops processing.
- preserves the source in quarantine.
- rejects ambiguous financial interpretation.
- requires explicit mapping.
- requires explicit locale selection.
- requires explicit currency selection.
- marks rows invalid or requiring review.
- prevents canonical commitment.
- prevents duplicate Retry.
- blocks Export download.
- revokes download authority.
- invalidates incorrect files.
- recalculates affected financial state.
- opens a Security, Privacy, financial-integrity or operational Incident.
- blocks the release.

Nexio must never:

- Trust an uploaded Owner identifier.
- map an Account outside the canonical Owner.
- execute uploaded formulas or macros.
- guess an ambiguous financial locale silently.
- combine incompatible currencies.
- treat binary floating-point as authoritative money.
- create duplicate financial Resources through Import Retry.
- hide rejected rows behind a successful file status.
- allow an expired Preview to commit.
- expose a permanent unrestricted Export URL.
- permit another Owner to download an Export.
- retain Import or Export files indefinitely without policy.
- allow AI to approve mappings or financial values independently.

# Import Processing, Mapping and Validation Architecture

Import processing transforms untrusted external bytes into controlled canonical Resource candidates.

The processing pipeline must preserve a strict separation between:

```text
Uploaded File

Parsed Record

Normalized Record

Mapped Candidate

Validated Candidate

Preview Decision

Committed Canonical Resource
```

No processing stage may treat the output of an earlier stage as canonically accepted data.

The recommended processing architecture is:

```text
Quarantined Source File

↓

Security Scan Verification

↓

Parser and Schema Resolution

↓

Encoding and Locale Resolution

↓

Bounded Parsing

↓

Raw Record Persistence

↓

Deterministic Normalization

↓

Field and Resource Mapping

↓

Structural Validation

↓

Domain Validation

↓

Financial Validation

↓

Relationship Validation

↓

Duplicate Analysis

↓

Conflict Analysis

↓

Preview Generation

↓

Owner or Approved Reviewer Decisions

↓

Commit Eligibility Evaluation
```

---

# Import Processing Coordinator

Every Import Job should be managed by a governed Import Processing Coordinator.

The coordinator is responsible for:

- Loading the canonical Import Job.
- Confirming canonical Owner scope.
- Confirming Source File scope.
- Confirming scan state.
- Resolving the approved Parser.
- Resolving the Import Schema.
- Resolving locale and currency policy.
- Applying processing limits.
- Tracking stage progress.
- Persisting stage checkpoints.
- Preventing duplicate stage execution.
- Handling bounded Retry.
- Detecting invalidation.
- Publishing safe progress.
- Producing processing Evidence.

---

# Processing Coordinator State

Recommended states:

```text
Idle

Preparing

ScanningRequired

ResolvingFormat

Parsing

Normalizing

Mapping

Validating

AnalyzingDuplicates

AnalyzingConflicts

GeneratingPreview

WaitingForDecision

CommitEligible

Blocked

Failed
```

---

# Processing Stage Record

Every material stage should have a stable record.

Recommended structure:

```text
ImportProcessingStage
 ├── processingStageId
 ├── importJobId
 ├── stageType
 ├── stageVersion
 ├── inputReference
 ├── inputHash
 ├── outputReference
 ├── outputHash
 ├── state
 ├── attemptNumber
 ├── startedAt
 ├── completedAt
 ├── safeErrorCode
 └── metrics
```

---

# Processing Stage Identifier

Recommended format:

```text
ipstage_<sortable-unique-identifier>
```

---

# Processing Stage Types

Recommended:

```text
SecurityScan

FormatDetection

EncodingDetection

LocaleResolution

Parsing

Normalization

Mapping

Validation

DuplicateAnalysis

ConflictAnalysis

PreviewGeneration

CommitPreparation
```

---

# Processing Stage States

Recommended:

```text
Pending

Running

Completed

CompletedWithWarnings

FailedRetryable

FailedFinal

Cancelled

Expired

Invalidated
```

---

# Stage Idempotency

Retrying one processing stage must not create duplicate:

- Raw Import Records.
- Normalized Import Records.
- Validation results.
- duplicate candidates.
- Preview records.
- canonical Resources.

Each stage should use a stable stage identity and input hash.

---

# Stage Input Integrity

Before reusing a completed stage result, Nexio must verify:

- Source File hash remains unchanged.
- Parser version remains compatible.
- Schema version remains active.
- Mapping profile version remains unchanged.
- locale policy remains unchanged.
- currency policy remains unchanged.
- Owner and Account scope remain valid.
- previous output integrity remains valid.

---

# Stage Invalidation

A completed stage must be invalidated when an upstream material input changes.

Example:

```text
Owner changes Account mapping.

↓

Mapping output becomes invalid.

↓

Validation output becomes invalid.

↓

Duplicate analysis becomes invalid.

↓

Preview becomes invalid.
```

Parsing may remain reusable when the Source File and Parser version remain unchanged.

---

# Stage Dependency Graph

Recommended dependency model:

```text
SecurityScan
    ↓
FormatDetection
    ↓
EncodingDetection
    ↓
Parsing
    ↓
Normalization
    ↓
Mapping
    ↓
Validation
    ↓
DuplicateAnalysis
    ↓
ConflictAnalysis
    ↓
PreviewGeneration
    ↓
CommitPreparation
```

Locale resolution may occur before or during normalization according to the Import Type.

---

# Format Detection Architecture

Format detection must combine multiple signals.

Potential signals include:

- File signature.
- container structure.
- declared MIME Type.
- extension.
- Parser preflight.
- worksheet metadata.
- JSON shape.
- CSV delimiter consistency.
- registered provider metadata.
- manifest.

---

# Format Detection Result

Recommended structure:

```text
ImportFormatDetectionResult
 ├── detectionResultId
 ├── sourceFileId
 ├── detectedFormat
 ├── detectedContainerVersion
 ├── confidence
 ├── candidateFormats
 ├── evidence
 ├── parserId
 ├── parserVersion
 ├── requiresReview
 └── detectedAt
```

---

# Format Detection Confidence

Recommended values:

```text
ExplicitVerified

High

Moderate

Low

Ambiguous

Unsupported
```

---

# Explicit-Verified Format

The format is declared through a registered manifest or Provider contract and independently verified against file content.

---

# Ambiguous Format

The file matches multiple incompatible interpretations.

The Import must not proceed to financial normalization without resolution.

---

# Unsupported Format

The Import Job must enter a controlled final or review state.

The system should not attempt an arbitrary generic parser.

---

# Parser Resolution

Parser resolution should use:

```text
Detected format

+

Container version

+

Import Type

+

Schema version

+

Provider contract

+

Security policy
```

---

# Parser Version Preservation

Every Raw Import Record must preserve the Parser version that produced it.

A Parser upgrade must not change historical interpretation silently.

---

# Parser Isolation

High-risk Parser execution should occur within an appropriately restricted processing environment.

Potential controls include:

- Bounded CPU.
- bounded memory.
- execution timeout.
- no unrestricted network access.
- read-only source input.
- isolated temporary storage.
- no shell execution.
- no macro execution.
- minimal system privileges.

---

# Streaming Parsing

Streaming parsing should be used when supported for large files.

Streaming must preserve:

- Record order.
- Source position.
- bounded memory.
- maximum record count.
- maximum field length.
- cancellation.
- progress.
- safe failure boundaries.

---

# Streaming Parser Checkpoint

A Parser checkpoint may preserve:

```text
sourceFileId

byteOffset

logicalRecordNumber

physicalLineNumber

parserStateVersion

contentHashPrefix

createdAt
```

Checkpoint resumption is allowed only when Parser semantics support deterministic continuation.

---

# Parser Resume Restrictions

Parser resumption must not occur when:

- File hash changed.
- Parser version changed incompatibly.
- encoding decision changed.
- delimiter decision changed.
- worksheet selection changed.
- schema changed.
- Source File expired.
- quarantine status changed.

---

# Parser Resource Limits

Every Parser must enforce:

```text
Maximum input bytes

Maximum uncompressed bytes

Maximum records

Maximum columns

Maximum field length

Maximum nesting depth

Maximum worksheets

Maximum merged-cell range

Maximum shared-string count

Maximum processing time

Maximum memory
```

---

# Parser Failure Classification

Recommended categories:

```text
MalformedInput

UnsupportedVersion

EncodingFailure

RecordLimitExceeded

FieldLimitExceeded

StructureLimitExceeded

SecurityViolation

ParserTimeout

ParserResourceExhaustion

InternalParserFailure
```

---

# Malformed Input

Malformed input should identify safe source location where possible.

Example:

```text
Record:
142

Field:
amount

Issue:
Unclosed quoted value
```

---

# Parser Timeout

A Parser timeout must not return a partial file as successfully parsed unless the Import Type explicitly supports partial parsing and exposes the limitation.

---

# Raw Record Persistence

Raw records should be persisted only when needed for:

- Preview.
- mapping.
- validation.
- Support investigation.
- row-level correction.
- Audit reconstruction.

Raw record retention must be bounded.

---

# Raw Field Model

Recommended structure:

```text
RawImportField
 ├── fieldPosition
 ├── sourceName
 ├── rawValue
 ├── detectedType
 ├── sourceFormatting
 ├── sourceLocation
 └── warnings
```

---

# Raw Value Size

Raw field values must be length-limited.

Oversized values must not be loaded into ordinary interface views or logs.

---

# Raw Value Classification

Raw fields should inherit or receive classification based on:

- Import Type.
- mapped canonical field.
- content analysis.
- Provider contract.
- Owner context.

---

# Raw Record Hash

A Raw Record hash may support:

- Stage idempotency.
- repeated-row detection.
- parser comparison.
- Evidence.

It must be scoped to the Import Job or Owner where required.

---

# Encoding Resolution Architecture

Encoding resolution should occur before semantic parsing.

Recommended flow:

```text
Check explicit schema or Provider encoding.

↓

Check byte-order mark.

↓

Validate UTF-8.

↓

Apply approved bounded detection if necessary.

↓

Reject unsupported or ambiguous encoding.

↓

Record resolved encoding and confidence.
```

---

# Encoding Resolution Result

Recommended structure:

```text
EncodingResolution
 ├── encodingResolutionId
 ├── sourceFileId
 ├── encoding
 ├── confidence
 ├── byteOrderMark
 ├── invalidSequenceCount
 ├── replacementCharacterCount
 ├── requiresReview
 └── resolvedAt
```

---

# Replacement Characters

Silent replacement using:

```text
�
```

must not be accepted when it may alter:

- Identifiers.
- Account names.
- Category names.
- descriptions used for duplicate detection.
- decimal signs.
- currency symbols.
- date text.

---

# Encoding Conflict

When declared and detected encodings conflict:

- Preserve both signals.
- Prefer independently verified content.
- require review where meaning may change.
- do not guess silently.

---

# Delimiter Resolution Architecture

CSV delimiter resolution should evaluate:

- Candidate delimiter count.
- consistency across sampled records.
- quote structure.
- header shape.
- expected schema column count.
- decimal separator interaction.
- multiline-field behavior.

---

# Delimiter Resolution Result

Recommended structure:

```text
DelimiterResolution
 ├── delimiterResolutionId
 ├── sourceFileId
 ├── delimiter
 ├── confidence
 ├── candidateDelimiters
 ├── sampledRecordCount
 ├── expectedColumnCount
 ├── inconsistentRecordCount
 └── requiresReview
```

---

# Delimiter and Decimal Interaction

Example pt-BR row:

```text
31/07/2026;Mercado;125,45;BRL
```

Recommended interpretation:

```text
Delimiter:
;

Amount:
R$ 125,45
```

A comma delimiter would incorrectly split the monetary value.

---

# Header Resolution

Header handling should identify:

- Header present.
- header absent.
- duplicate headers.
- blank headers.
- generated positional names.
- normalized aliases.
- unsupported extra fields.

---

# Headerless Files

A headerless file may proceed only when:

- The Import Type permits it.
- column order is explicitly registered.
- record width is stable.
- Owner or Provider context confirms the schema.

---

# Schema Detection Architecture

Schema detection may use:

- Explicit manifest.
- Provider contract.
- known header fingerprint.
- worksheet name.
- required-field presence.
- column type pattern.
- schema version field.
- Owner-selected Import Type.

---

# Schema Detection Result

Recommended structure:

```text
ImportSchemaDetectionResult
 ├── schemaDetectionResultId
 ├── sourceFileId
 ├── selectedSchemaId
 ├── selectedSchemaVersion
 ├── confidence
 ├── candidateSchemas
 ├── missingRequiredFields
 ├── unexpectedFields
 ├── requiresReview
 └── detectedAt
```

---

# Schema Ambiguity

When one file matches multiple schemas with different financial meaning, Nexio must require explicit selection.

---

# Schema Fingerprint

A schema fingerprint may contain:

```text
Normalized header sequence

Required-field set

Optional-field set

Data-type pattern

Worksheet reference

Provider reference

Manifest version
```

It should avoid private row values.

---

# Locale Resolution Architecture

Locale resolution must separate:

```text
Presentation locale

Source data locale

Owner Product locale

Account currency

Date format

Decimal format
```

These values may differ.

---

# Locale Resolution Inputs

Potential inputs include:

- Import Type default.
- Owner selection.
- Provider contract.
- schema definition.
- file metadata.
- delimiter.
- decimal samples.
- grouping samples.
- date samples.
- currency codes.
- currency symbols.
- month names.
- boolean values.

---

# Locale Resolution Result

Recommended structure:

```text
ImportLocaleResolution
 ├── localeResolutionId
 ├── importJobId
 ├── locale
 ├── decimalSeparator
 ├── groupingSeparator
 ├── dateFormats
 ├── timeZonePolicy
 ├── confidence
 ├── evidence
 ├── ambiguousFields
 ├── ownerConfirmed
 └── resolvedAt
```

---

# Locale Confidence

Recommended:

```text
ExplicitSchema

ExplicitOwner

VerifiedProvider

High

Moderate

Low

Ambiguous
```

---

# Locale Confirmation

When Owner confirmation is required, the interface should provide examples using actual bounded values.

Example:

```text
Source:
1.250,45

Interpret as:
R$ 1.250,45
```

The interface should not expose unrestricted file content unnecessarily.

---

# Locale Change

Changing locale after normalization invalidates:

- normalized monetary values.
- normalized dates.
- percentages.
- duplicate analysis.
- Preview.
- financial summary.

---

# Currency Resolution Architecture

Currency resolution should follow a controlled hierarchy.

Recommended precedence:

```text
Explicit row currency code

↓

Registered source schema currency

↓

Explicit file-level currency

↓

Mapped Account canonical currency

↓

Owner-confirmed Import policy
```

A symbol alone is insufficient when ambiguous.

---

# Currency Resolution Result

Recommended structure:

```text
ImportCurrencyResolution
 ├── currencyResolutionId
 ├── normalizedRecordId
 ├── resolvedCurrency
 ├── source
 ├── confidence
 ├── accountCurrency
 ├── mismatch
 ├── ownerDecisionRequired
 └── resolvedAt
```

---

# Currency Inheritance

A row may inherit mapped Account currency only when:

- The Import Type permits inheritance.
- The row contains no conflicting currency.
- The Account has one canonical currency.
- The Preview discloses inheritance.
- The validation result preserves a warning where required.

---

# Currency Mismatch

Example:

```text
Mapped Account currency:
BRL

Imported row currency:
USD
```

The row must not be converted or accepted silently.

Potential outcomes:

- Reject.
- map to another compatible Account.
- require review.
- use an approved multi-currency Account policy.

---

# Currency Conversion

Import-time currency conversion is prohibited unless a separately approved policy defines:

- Exchange-rate source.
- rate time.
- source currency.
- target currency.
- rounding.
- fees.
- original amount retention.
- converted amount retention.
- Owner confirmation.
- Audit Evidence.

---

# Normalization Architecture

Normalization converts raw values into controlled typed candidates.

Recommended pipeline:

```text
Raw field

↓

Whitespace and control-character policy

↓

Unicode policy

↓

Type-specific parsing

↓

Locale-specific parsing

↓

Canonical formatting

↓

Range validation

↓

Normalization warnings

↓

Normalized typed value
```

---

# Normalization Registry

Every field normalization Rule should be registered.

Recommended fields:

```text
normalizationRuleId

canonicalField

inputTypes

localeBehavior

transformation

lossless

warnings

rejectionConditions

owner

version

status
```

---

# Normalization Identifier

Recommended format:

```text
NORMALIZATION-<DOMAIN>-<NUMBER>
```

---

# Lossless Normalization

A lossless normalization changes representation without changing meaning.

Examples:

```text
"  Mercado  "
→
"Mercado"
```

```text
"1250,45" under confirmed pt-BR
→
"1250.45"
```

---

# Lossy Normalization

A lossy transformation removes or changes information.

Examples:

- Truncating descriptions.
- dropping time from a timestamp.
- converting currency.
- replacing unknown characters.
- rounding excessive decimal precision.
- removing leading zeros from external identifiers.

Lossy normalization requires explicit policy and warning or rejection.

---

# Text Normalization

Text normalization may include:

- Approved Unicode normalization.
- outer whitespace trimming.
- line-ending normalization.
- control-character removal.
- maximum length.
- safe display escaping.

It must not remove meaningful internal spacing or punctuation without policy.

---

# Identifier Normalization

External identifiers should usually be treated as strings.

Example:

```text
External identifier:
00012345
```

must not become:

```text
12345
```

unless the external contract defines numerical identity.

---

# Boolean Normalization

Supported values must be schema-defined.

Potential pt-BR values:

```text
sim

não

verdadeiro

falso
```

Ambiguous values must not be inferred.

---

# Percentage Normalization

The schema must distinguish:

```text
10

10%

0.10
```

These values may represent different inputs.

---

# Money Normalization

Money normalization must preserve:

```text
Sign

Exact decimal digits

Currency

Scale

Source representation

Normalization policy
```

---

# Money Normalization Result

Recommended structure:

```text
NormalizedMoney
 ├── decimalValue
 ├── currency
 ├── sourceValue
 ├── sourceScale
 ├── canonicalScale
 ├── roundingApplied
 ├── roundingPolicyId
 └── warnings
```

---

# Excess Monetary Precision

Example:

```text
Source:
R$ 125,456
```

For a BRL field requiring two decimal places, the Import policy must define:

```text
Reject

or

Require review

or

Apply approved rounding
```

Silent truncation is prohibited.

---

# Zero Amount

Zero-value acceptance must be defined by Resource Type.

A zero Transaction may be rejected while a zero Budget baseline may have different semantics.

---

# Monetary Range

Every monetary field should define:

- Minimum.
- maximum.
- permitted sign.
- scale.
- currency.
- overflow behavior.

---

# Parentheses for Negative Values

Where supported:

```text
(R$ 125,00)
```

normalizes to:

```text
-R$ 125,00
```

The Preview must show the resulting direction clearly.

---

# Date Normalization Architecture

Date normalization must distinguish:

```text
DateOnly

LocalDateTime

OffsetDateTime

Instant

Period

YearMonth
```

---

# Date-Only Normalization

Example:

```text
Source:
31/07/2026

Canonical:
2026-07-31
```

No time-zone shift should change the date.

---

# Timestamp Normalization

Example:

```text
Source:
2026-07-31T18:30:00-03:00

Canonical instant:
2026-07-31T21:30:00Z

Original offset:
-03:00
```

---

# Invalid Date

Examples:

```text
31/02/2026

29/02/2025
```

must be rejected.

---

# Date Range Validation

Financial Import Types should define permissible historical and future ranges.

---

# Time Zone Resolution

A timestamp without offset may require:

- Provider time zone.
- Account time zone.
- explicit Owner selection.
- rejection.

The Device time zone must not be assumed silently for server-side Import processing.

---

# Description Normalization

Descriptions should preserve Owner meaning while enforcing:

- Maximum length.
- safe text.
- control-character policy.
- formula-injection safety for later Export.
- search normalization where applicable.

---

# Category Name Normalization

Category names should preserve:

- Accents.
- meaningful punctuation.
- parent relationship.
- stable identity.

Normalization must not merge distinct Categories unexpectedly.

---

# Mapping Engine Architecture

The Mapping Engine transforms normalized external fields into canonical Resource candidates.

Recommended architecture:

```text
Normalized Record

↓

Schema Field Resolution

↓

Mapping Profile Resolution

↓

Constant and Derived Mapping

↓

Account Mapping

↓

Category Mapping

↓

Resource Relationship Mapping

↓

Canonical Candidate Construction

↓

Mapping Validation

↓

Mapping Result
```

---

# Mapping Result

Recommended structure:

```text
ImportMappingResult
 ├── mappingResultId
 ├── normalizedRecordId
 ├── mappingProfileId
 ├── mappingProfileVersion
 ├── targetResourceType
 ├── mappedFields
 ├── unmappedRequiredFields
 ├── unmappedOptionalFields
 ├── mappingWarnings
 ├── accountMapping
 ├── categoryMapping
 ├── relationshipMappings
 ├── state
 └── mappedAt
```

---

# Mapping Result States

Recommended:

```text
Mapped

MappedWithWarnings

RequiresOwnerMapping

RequiresAdministrativeMapping

InvalidMapping

Excluded
```

---

# Field Mapping Types

Recommended:

```text
Direct

Alias

Constant

Lookup

Transformation

Concatenation

Split

Conditional

DerivedReference

Ignored
```

---

# Direct Mapping

Example:

```text
External field:
amount

Canonical field:
amount
```

---

# Alias Mapping

Example:

```text
External field:
valor

Canonical field:
amount
```

The alias must be registered.

---

# Constant Mapping

Example:

```text
Every row:
currency = BRL
```

This is allowed only under an approved explicit policy.

---

# Lookup Mapping

Example:

```text
External Account code:
CC-01

Mapped Nexio Account:
acc_...
```

---

# Transformation Mapping

Example:

```text
External type:
D

Canonical Transaction direction:
Expense
```

The transformation must be deterministic and versioned.

---

# Conditional Mapping

Example:

```text
If external type = "ESTORNO"
then canonical Transaction type = Refund
```

---

# Ignored Field

Ignored fields should be disclosed when they may contain meaningful source data.

---

# Mapping Transformation Registry

Every transformation should define:

```text
transformationId

inputFields

outputField

logic

supportedSchemas

lossless

warnings

securityClassification

financialClassification

owner

version
```

---

# Arbitrary Code Restriction

Mapping transformations must not execute unrestricted Owner-provided code.

---

# Account Mapping Architecture

Account mapping should use a controlled Account Resolver.

Recommended flow:

```text
Check explicit canonical Account selection.

↓

Check registered external Account reference.

↓

Check validated Provider relationship.

↓

Check exact approved mapping profile.

↓

Require Owner review when unresolved.
```

---

# Account Mapping Result

Recommended structure:

```text
AccountMappingResult
 ├── sourceAccountReference
 ├── mappedAccountId
 ├── matchType
 ├── confidence
 ├── currencyCompatible
 ├── accountState
 ├── ownerValidated
 ├── requiresReview
 └── warnings
```

---

# Account Match Types

Recommended:

```text
ExplicitOwnerSelection

ExternalReference

ProviderRelationship

SavedMappingProfile

ExactApprovedAlias

NoMatch

AmbiguousMatch
```

---

# Account Name Matching

Name matching alone must not select an Account when multiple Accounts share the same or similar names.

---

# Closed Account Mapping

Importing into a Closed or Restricted Account requires explicit policy.

Ordinary Transaction Import should reject or require review.

---

# Account Currency Validation

The mapped Account currency must be checked against the resolved row currency.

---

# Category Mapping Architecture

Category mapping may use:

- canonical Category identifier.
- external Category reference.
- exact registered alias.
- saved Owner mapping.
- explicit Owner selection.
- controlled default.
- new Category proposal.

---

# Category Mapping Result

Recommended structure:

```text
CategoryMappingResult
 ├── sourceCategoryReference
 ├── mappedCategoryId
 ├── matchType
 ├── confidence
 ├── categoryState
 ├── ownerValidated
 ├── newCategoryProposal
 ├── requiresReview
 └── warnings
```

---

# Category Creation Proposal

A new Category proposal must remain separate from canonical Category creation until confirmed.

---

# Parent Category Mapping

Parent-child relationships must be validated for:

- Owner.
- cycle prevention.
- Category type.
- active state.
- maximum hierarchy depth.

---

# Transfer Candidate Recognition

An Import may contain two records that represent one Transfer.

Transfer recognition must be governed.

Potential signals include:

- Same external Transfer identifier.
- source and destination Account references.
- matching principal amount.
- compatible dates.
- opposite directions.
- Provider relationship.
- registered source schema.

---

# Transfer Candidate

Recommended structure:

```text
ImportTransferCandidate
 ├── transferCandidateId
 ├── importJobId
 ├── sourceRecordIds
 ├── sourceAccountId
 ├── destinationAccountId
 ├── sourceAmount
 ├── destinationAmount
 ├── currencies
 ├── externalTransferReference
 ├── confidence
 ├── state
 └── requiredDecision
```

---

# Transfer Recognition Restrictions

Two Transactions must not be merged into a Transfer solely because:

- Amounts match.
- dates match.
- descriptions are similar.

---

# Cross-Currency Transfer Candidate

A cross-currency Transfer requires explicit source and destination amounts and approved exchange-rate semantics.

---

# Transfer Candidate Decision

Potential decisions:

```text
CreateTransfer

KeepIndependentTransactions

ExcludeOneDuplicateSide

RequiresReview
```

---

# Recurring Pattern Recognition

An Import may suggest a recurring pattern.

Recognition may use:

- external recurring identifier.
- registered recurrence metadata.
- repeated date interval.
- stable amount.
- stable Account.
- stable description.

A suggested pattern must not automatically create a Recurring Transaction unless the Import Type explicitly permits it and confirmation exists.

---

# Validation Architecture

Validation occurs in multiple layers.

Recommended order:

```text
File Validation

↓

Parser Validation

↓

Schema Validation

↓

Field Validation

↓

Record Validation

↓

Relationship Validation

↓

Owner and Account Validation

↓

Financial Validation

↓

Domain State Validation

↓

Duplicate Analysis

↓

Conflict Analysis

↓

Commit-Time Revalidation
```

---

# Validation Severity

Recommended:

```text
Informational

Warning

Error

Critical
```

---

# Informational Validation

Provides context without affecting eligibility.

---

# Warning Validation

The record may remain eligible but requires disclosure.

---

# Error Validation

The record is not commit-eligible under the current state.

---

# Critical Validation

The issue may indicate Security, Privacy or cross-Owner risk.

The entire Import Job may require containment.

---

# Validation Rule Registry

Every validation Rule should be registered.

Recommended fields:

```text
validationRuleId

ruleKey

importTypes

resourceTypes

fieldScope

severity

logicVersion

errorCode

warningCode

ownerDecisionAllowed

administrativeOverrideAllowed

owner

status

version
```

---

# Validation Rule Identifier

Recommended format:

```text
IMPORT-VALIDATION-<DOMAIN>-<NUMBER>
```

---

# Structural Validation

Structural validation checks:

- Required fields.
- field count.
- data type.
- length.
- nesting.
- supported values.
- null behavior.
- duplicate headers.
- unknown fields.

---

# Field Validation

Field validation checks:

- Money.
- currency.
- date.
- time.
- Account reference.
- Category reference.
- description.
- external identifier.
- recurrence.
- Resource state.

---

# Record Validation

Record validation checks whether the complete field combination forms a valid candidate.

Example:

```text
Transaction Type:
Expense

Amount:
R$ 125,00

Account:
Main Account

Date:
31/07/2026
```

---

# Relationship Validation

Relationship validation checks:

- Account belongs to Owner.
- Category belongs to Owner.
- Goal belongs to Owner.
- Budget references valid Categories.
- Transfer Accounts are distinct where required.
- recurring Template references exist.
- imported parent Resources are available.
- external relationships are unique.

---

# Financial Validation

Financial validation must use canonical financial policy.

It should validate:

- Exact amount.
- currency.
- sign.
- Transaction direction.
- Account currency.
- effective date.
- Transfer atomicity.
- Goal Contribution semantics.
- Budget semantics.
- reconciliation restrictions.
- allowed Transaction state.
- maximum value.
- decimal scale.

---

# Financial Validation Result

Recommended structure:

```text
FinancialImportValidation
 ├── normalizedRecordId
 ├── amountValid
 ├── currencyValid
 ├── signValid
 ├── AccountCompatible
 ├── reconciliationCompatible
 ├── transactionStateValid
 ├── policyVersions
 ├── errors
 ├── warnings
 └── validatedAt
```

---

# Financial Rule Version

Every financial validation result should preserve the relevant policy version.

---

# Reconciliation-Aware Validation

When an imported record affects a reconciled period:

Potential outcomes include:

```text
Reject

RequiresReconciliationReopen

RequiresAdjustmentWorkflow

RequiresAdministrativeReview
```

Ordinary Import must not silently alter completed reconciliation.

---

# Opening Balance Import

An opening-balance candidate is not an ordinary Income Transaction unless the financial policy defines that representation.

---

# Adjustment Import

An Adjustment must follow the controlled Adjustment model.

An Import file must not create privileged corrections merely by using a label such as:

```text
adjustment
```

---

# Goal Import Validation

Goal records should distinguish:

- Target amount.
- current derived progress.
- Contribution.
- withdrawal.
- opening Goal state.

Imported current progress must not override canonical Contribution Events without a migration policy.

---

# Budget Import Validation

Budget records should distinguish:

- Budget amount.
- consumed amount.
- remaining amount.
- period.
- scope.

Consumed and remaining values are ordinarily derived and should not be imported as canonical Budget mutations.

---

# Recurring Transaction Validation

Recurring records should validate:

- Schedule syntax.
- time zone.
- start date.
- end date.
- next occurrence.
- amount.
- currency.
- Account.
- duplicate Template.
- generated historical instances.

---

# Domain State Validation

The backend must check current canonical state.

Potential invalid states include:

- Account Closed.
- Goal Deleted.
- Budget Archived.
- Category Retired.
- recurring Template Paused.
- reconciliation Completed.
- Owner Restricted.
- Feature Disabled.

---

# Validation Overrides

Validation overrides are exceptional.

An override must define:

- Validation Rule.
- Record scope.
- reason.
- Actor.
- authority.
- resulting risk.
- financial impact.
- expiration.
- Audit Evidence.

---

# Owner Override

An Owner may resolve only decisions explicitly permitted by the Import Type.

Examples:

- Select Account.
- select Category.
- choose locale.
- choose duplicate handling.
- exclude a row.

An Owner must not override:

- Cross-Owner validation.
- unsupported currency.
- malicious-file detection.
- privileged reconciliation restriction.
- Security restriction.
- canonical ownership.

---

# Administrative Override

Administrative override must remain controlled and should produce a new review state.

It must not silently change the original validation result.

---

# Record Eligibility

A record may be commit-eligible only when:

```text
Parsing succeeded.

Normalization succeeded.

Mapping is complete.

Required fields are valid.

Owner and Account scope are valid.

Currency is resolved.

Financial validation passes.

No unresolved Critical issue exists.

Duplicate policy permits commitment.

Conflict policy permits commitment.

Required Owner decisions are complete.
```

---

# Record Eligibility Result

Recommended structure:

```text
ImportRecordEligibility
 ├── normalizedRecordId
 ├── eligible
 ├── eligibilityState
 ├── blockingErrors
 ├── warnings
 ├── duplicateDecision
 ├── conflictDecision
 ├── requiredOwnerDecisions
 ├── policyVersions
 └── evaluatedAt
```

---

# Eligibility States

Recommended:

```text
Eligible

EligibleWithWarnings

Ineligible

RequiresOwnerDecision

RequiresAdministrativeReview

Excluded

Invalidated
```

---

# Duplicate Detection Architecture

Duplicate detection must use multiple controlled layers.

Recommended order:

```text
Operation Duplicate

↓

Source File Duplicate

↓

Source Record Duplicate

↓

External Identifier Duplicate

↓

Import Lineage Duplicate

↓

Recurring Occurrence Duplicate

↓

Transfer Duplicate

↓

Canonical Similarity Candidate
```

---

# Duplicate Analysis Record

Recommended structure:

```text
ImportDuplicateAnalysis
 ├── duplicateAnalysisId
 ├── normalizedRecordId
 ├── duplicateType
 ├── candidateResourceIds
 ├── candidateImportRecordIds
 ├── confidence
 ├── evidence
 ├── recommendedDecision
 ├── finalDecision
 ├── decidedBy
 └── decidedAt
```

---

# Duplicate Analysis Identifier

Recommended format:

```text
idup_<sortable-unique-identifier>
```

---

# Duplicate Types

Recommended:

```text
SameOperation

SameSourceFile

SameSourceRecord

SameExternalIdentifier

SameImportLineage

SameRecurringOccurrence

SameTransferOperation

ExactCanonicalMatch

ProbableCanonicalMatch

PossibleCanonicalMatch

NotDuplicate
```

---

# Same-Operation Duplicate

The same Import commit operation was already processed.

The original result must be returned.

---

# Same-Source-File Duplicate

The same content hash was uploaded again by the same Owner.

This may indicate:

- Intentional reprocessing.
- accidental repeated upload.
- different mapping requirement.
- malicious replay.

The file may still require review because the Owner could legitimately reuse it under a different Import Type.

---

# Same-Source-Record Duplicate

The same normalized row appears multiple times in one file.

The policy must distinguish:

- Accidental duplicate row.
- legitimate repeated financial activity.
- repeated external identifier.
- repeated header.
- repeated Transfer side.

---

# Same-External-Identifier Duplicate

A unique external record identifier already maps to a canonical Resource.

This is a strong duplicate signal within the registered external-system scope.

---

# Same-Recurring-Occurrence Duplicate

A recurring occurrence identity already exists.

The imported candidate should ordinarily map to the existing occurrence or be rejected as duplicate.

---

# Same-Transfer-Operation Duplicate

A Transfer operation identity already exists.

The Import must not create another pair of financial effects.

---

# Exact Canonical Match

All fields defined by the exact-match policy are equal.

Even then, the system should consider whether repeated identical purchases are legitimate.

---

# Probable Canonical Match

Strong similarity exists but not enough for automatic suppression.

---

# Possible Canonical Match

Weak similarity should produce a review suggestion, not automatic duplicate classification.

---

# Duplicate Confidence

Recommended:

```text
Certain

High

Moderate

Low

None
```

---

# Duplicate Evidence

Potential evidence includes:

- Stable operationId.
- external identifier.
- Import lineage.
- recurring occurrence identifier.
- Transfer identifier.
- exact normalized field match.
- date proximity.
- amount equality.
- Account equality.
- description similarity.

---

# Duplicate Decision

Recommended values:

```text
UseExisting

SkipImportedRecord

CreateNewResource

MergeLineage

LinkToExisting

RequiresReview

NotDuplicate
```

---

# Use-Existing Decision

The Import row maps to an existing canonical Resource without creating another financial effect.

---

# Merge-Lineage Decision

Additional source lineage may be attached to an existing Resource when policy permits.

---

# Create-New-Resource Decision

The Owner or deterministic policy concludes that the record represents separate legitimate activity.

---

# Duplicate Decision Evidence

A material duplicate decision should preserve:

- Candidate record.
- canonical candidate.
- evidence.
- confidence.
- policy version.
- Actor or automated Rule.
- final decision.

---

# Duplicate Policy Registry

Recommended fields:

```text
duplicatePolicyId

importTypeId

resourceType

exactKeyFields

externalIdentityFields

similarityFields

automaticSkipThreshold

automaticLinkThreshold

ownerReviewThreshold

financialRestrictions

owner

version

status
```

---

# Similarity Restrictions

Similarity models must not use another Owner's financial data.

---

# AI-Assisted Duplicate Review

AI may explain or rank duplicate candidates using approved minimized fields.

AI must not automatically delete, merge or suppress financial records unless a deterministic registered Rule independently confirms the decision.

---

# Duplicate Import Retry

Import Retry must not rerun duplicate classification in a way that changes already committed row outcomes without explicit revalidation.

---

# Conflict Analysis Architecture

An Import Conflict exists when the proposed candidate cannot be committed safely because of current canonical state.

Potential causes include:

- Existing Resource version changed.
- Account state changed.
- Category was deleted.
- reconciliation completed.
- external identifier maps inconsistently.
- Provider relationship changed.
- Resource already updated through another Import.
- Owner permission changed.

---

# Import Conflict Record

Recommended structure:

```text
ImportConflict
 ├── importConflictId
 ├── importJobId
 ├── normalizedRecordId
 ├── conflictType
 ├── canonicalResourceReference
 ├── expectedState
 ├── currentState
 ├── resolutionOptions
 ├── policyVersion
 ├── state
 ├── detectedAt
 ├── resolvedAt
 └── resolutionEvidence
```

---

# Import Conflict Identifier

Recommended format:

```text
iconf_<sortable-unique-identifier>
```

---

# Import Conflict Types

Recommended:

```text
ResourceVersionChanged

ResourceDeleted

ResourceArchived

AccountClosed

CurrencyChanged

CategoryDeleted

ReconciliationLocked

ExternalIdentifierCollision

MappingInvalidated

PermissionChanged

SchemaChanged

FinancialPolicyChanged
```

---

# Import Conflict States

Recommended:

```text
Detected

RequiresOwnerReview

RequiresAdministrativeReview

Resolved

Rejected

Expired

Invalidated
```

---

# Conflict versus Validation Error

A validation error may exist before any canonical competing state is considered.

A Conflict usually depends on current canonical state or another operation.

---

# Conflict Resolution Options

Potential options include:

```text
Remap

Exclude

UseExisting

CreateNew

RegeneratePreview

RequestReconciliationWorkflow

AdministrativeReview
```

---

# Conflict Revalidation

Conflict resolution must revalidate current canonical state immediately before commit.

---

# Import Preview Architecture

The Preview is a governed, versioned representation of proposed effects.

It is not merely a visual table.

The Preview should contain:

- Source information.
- Parser and schema information.
- locale and currency decisions.
- mapping decisions.
- record states.
- duplicate decisions.
- conflict decisions.
- financial summaries.
- affected Accounts.
- derived recalculation impact.
- warnings.
- expiration.
- integrity reference.

---

# Preview Dataset

Recommended structure:

```text
ImportPreviewDataset
 ├── previewDatasetId
 ├── importPreviewId
 ├── eligibleRecordIds
 ├── warningRecordIds
 ├── rejectedRecordIds
 ├── duplicateRecordIds
 ├── excludedRecordIds
 ├── conflictRecordIds
 ├── AccountSummaries
 ├── currencySummaries
 ├── CategorySummaries
 ├── dateRange
 └── contentHash
```

---

# Preview Dataset Identifier

Recommended format:

```text
ipdata_<sortable-unique-identifier>
```

---

# Preview Pagination

Large Previews should use stable pagination.

Pagination must preserve:

- Preview version.
- row state filter.
- sort.
- source order.
- Owner scope.
- cursor integrity.
- bounded page size.

---

# Preview Sorting

Recommended default:

```text
Source order ascending
```

Alternative sorting may be available without changing the confirmed underlying row set.

---

# Preview Filtering

Potential filters:

```text
Valid

Warnings

Rejected

Possible duplicates

Conflicts

Excluded

Account

Currency

Category

Date range
```

---

# Preview Summary Equality

The Preview summary must equal the approved aggregation of its included record set.

---

# Preview Decision Model

Owner decisions should be represented as versioned data.

Recommended structure:

```text
ImportPreviewDecision
 ├── decisionId
 ├── importPreviewId
 ├── normalizedRecordId
 ├── decisionType
 ├── selectedValue
 ├── actorId
 ├── expectedPreviewVersion
 ├── createdAt
 └── state
```

---

# Preview Decision Identifier

Recommended format:

```text
ipdec_<sortable-unique-identifier>
```

---

# Preview Decision Types

Recommended:

```text
SelectAccount

SelectCategory

SelectLocale

SelectCurrency

ExcludeRecord

IncludeRecord

UseExistingDuplicate

CreateSeparateRecord

ConfirmTransferPair

RejectTransferPair

AcceptWarning

RequestNewCategory
```

---

# Decision Version Conflict

A decision against a stale Preview version must be rejected or reapplied through a new Preview.

---

# Bulk Preview Decision

Bulk actions may apply to:

- Category mapping.
- Account mapping.
- duplicate handling.
- exclusion.
- warning acceptance.

Bulk actions must show their affected record count before confirmation.

---

# Bulk Decision Safety

A bulk decision must not apply across incompatible:

- Owners.
- Accounts.
- currencies.
- Resource Types.
- conflict Types.
- Preview versions.

---

# Preview Accessibility

The Preview interface should provide:

- Table headers.
- row status text.
- filter labels.
- error summaries.
- direct navigation to invalid rows.
- accessible Account and Category selectors.
- exact currency announcements.
- bulk-action confirmation.
- progress announcements.
- keyboard support.

---

# Preview Financial Summary Example

```text
Import Preview

Account:
Conta Principal

Currency:
BRL

Income:
R$ 4.500,00

Expenses:
R$ 2.175,40

Net impact:
R$ 2.324,60

Eligible records:
58

Warnings:
4

Rejected:
2

Possible duplicates:
3
```

---

# Preview Warning Acceptance

Accepting a warning does not override an Error.

---

# Preview Expiration Warning

The Owner should be warned before Preview expiration where useful.

---

# Import Commitment Architecture

Commitment converts eligible candidates into canonical Resources.

The commitment system should use:

- Stable Import operation identity.
- stable row operation identity.
- bounded canonical transactions.
- idempotency records.
- current Owner and Account validation.
- commit-time revalidation.
- lineage persistence.
- row-result persistence.
- synchronization publication.
- recalculation coordination.

---

# Row Operation Identifier

Each commit-eligible row should have a stable operation identity.

Recommended format:

```text
op_import_row_<sortable-unique-identifier>
```

---

# Row Idempotency Key

A row idempotency key should be scoped by:

```text
Owner

+

Import Job

+

Normalized Record

+

Commit version
```

---

# Import Commit Session

Recommended structure:

```text
ImportCommitSession
 ├── commitSessionId
 ├── importJobId
 ├── operationId
 ├── confirmedPreviewId
 ├── confirmedPreviewVersion
 ├── commitPolicy
 ├── totalEligibleRecords
 ├── committedRecords
 ├── rejectedRecords
 ├── duplicateRecords
 ├── conflictedRecords
 ├── state
 ├── startedAt
 ├── completedAt
 └── checkpoint
```

---

# Commit Session Identifier

Recommended format:

```text
icmt_<sortable-unique-identifier>
```

---

# Commit Session States

Recommended:

```text
Created

Validating

Committing

Paused

RetryScheduled

Recalculating

Completed

PartiallyCompleted

Failed

CancelledAfterPartialCommit
```

---

# Commit Claim

Only one active commit worker should claim one Import commit Session at a time.

Backend idempotency must remain effective if lease coordination fails.

---

# Commit Batch

Recommended structure:

```text
ImportCommitBatch
 ├── commitBatchId
 ├── commitSessionId
 ├── AccountScope
 ├── startingRecordPosition
 ├── endingRecordPosition
 ├── expectedRecordCount
 ├── state
 ├── attemptNumber
 ├── startedAt
 └── completedAt
```

---

# Commit Batch Identifier

Recommended format:

```text
icbatch_<sortable-unique-identifier>
```

---

# Commit Batch Size

Batch size should be bounded based on:

- Resource Type.
- database transaction capacity.
- financial atomicity.
- Account scope.
- Event publication.
- Retry cost.
- lock duration.

---

# Commit Transaction Boundary

The transaction should include, where applicable:

```text
Canonical Resource creation or update

+

Resource version

+

Import lineage

+

Idempotency record

+

Financial Event

+

Synchronization outbox Event

+

Audit Evidence reference
```

---

# Import Lineage Record

Recommended structure:

```text
ImportLineage
 ├── importLineageId
 ├── importJobId
 ├── sourceFileId
 ├── rawRecordId
 ├── normalizedRecordId
 ├── externalSystemId
 ├── externalRecordId
 ├── canonicalResourceType
 ├── canonicalResourceId
 ├── canonicalResourceVersion
 ├── rowOperationId
 ├── committedAt
 └── state
```

---

# Import Lineage Identifier

Recommended format:

```text
ilin_<sortable-unique-identifier>
```

---

# Lineage States

Recommended:

```text
Active

Superseded

Corrected

Reversed

Deleted

Invalidated
```

---

# Import Lineage Update

A later correction must not rewrite original lineage.

It should add a correction or supersession relationship.

---

# Import Commit Retry

A Retry should:

- Use the same commit Session.
- use the same Import operationId.
- use the same row operation IDs.
- load prior row results.
- skip already committed rows.
- revalidate uncommitted rows.
- preserve Preview confirmation boundary.
- detect invalidation.
- stop after expiration or final failure.

---

# Commit Checkpoint

A checkpoint may preserve:

```text
lastCompletedBatch

lastCompletedRecordPosition

committedCount

rejectedCount

duplicateCount

conflictedCount

updatedAt
```

---

# Commit Checkpoint Authority

A checkpoint is operational metadata.

Canonical row-result and idempotency records remain authoritative.

---

# Partial Commit

When partial commitment is allowed, the final result must identify:

- Committed records.
- failed records.
- skipped duplicates.
- unresolved Conflicts.
- recalculation status.
- corrective actions.

---

# Atomic Import Failure

For an AtomicAllOrNothing Import, any required row failure should roll back the canonical transaction.

No partial successful state should remain.

---

# Batch Failure

For AtomicPerBatch:

- Completed batches remain committed.
- failed batch may retry.
- later batches may pause.
- final state remains Partial until complete or final failure.
- committed rows must not be recreated.

---

# Commit-Time Duplicate

A duplicate may appear after Preview because another operation committed equivalent external identity.

The commit should return:

```text
DuplicateExisting
```

and identify the original canonical Resource safely.

---

# Commit-Time Conflict

A Resource may become conflicting after Preview.

The row should not overwrite current canonical state.

---

# Commit Cancellation

Cancellation while no batch is active may stop future work.

If a batch is active:

- Allow the bounded transaction to finish or roll back.
- do not terminate in a way that leaves uncertain financial state.
- mark subsequent batches cancelled.
- preserve final row outcomes.

---

# Import Rollback

An ordinary Import rollback should not delete historical canonical effects silently.

Possible models include:

```text
Atomic transaction rollback before commitment

Governed reversal after commitment

Correction Import

Administrative migration correction
```

---

# Governed Import Reversal

A committed Import reversal must:

- Identify original Import.
- identify affected canonical Resources.
- determine whether Resources changed after Import.
- respect reconciliation.
- create reversal or deletion operations according to Resource state.
- recalculate affected financial state.
- preserve original lineage.
- preserve reversal Evidence.

---

# Import Reversal Restrictions

A reversal must not automatically remove:

- A Transaction later reconciled.
- A Resource modified manually.
- A Transfer partially corrected.
- A Goal Contribution followed by withdrawals.
- A Budget used by later planning.
- A Category used by unrelated Resources.

---

# Import Correction

A correction may use:

- New Import Job.
- original Import reference.
- corrected source file.
- changed-row mapping.
- differential preview.
- governed commit.

---

# Differential Import

A differential Import should identify:

```text
New records

Changed records

Removed source records

Unchanged records

Conflicting canonical changes
```

Removed source records must not automatically delete canonical Resources without an approved synchronization contract.

---

# Import Recalculation Architecture

After financial commitment, Nexio should identify affected derived domains.

Potential effects include:

```text
Account balances

Cash flow

Budgets

Goals

Recurring patterns

Reports

Insights

Reconciliation

Dashboard summaries

Notifications
```

---

# Recalculation Plan

Recommended structure:

```text
ImportRecalculationPlan
 ├── recalculationPlanId
 ├── importJobId
 ├── affectedAccountIds
 ├── affectedPeriods
 ├── affectedCurrencies
 ├── calculationTypes
 ├── financialDataVersion
 ├── state
 ├── startedAt
 └── completedAt
```

---

# Recalculation Plan Identifier

Recommended format:

```text
ircalc_<sortable-unique-identifier>
```

---

# Recalculation States

Recommended:

```text
Pending

Running

Completed

CompletedWithWarnings

FailedRetryable

FailedFinal

Invalidated
```

---

# Commit versus Recalculation State

A committed Transaction remains canonical even when derived recalculation is pending.

The Product should distinguish:

```text
Import committed

Derived balances recalculating
```

---

# Recalculation Failure

A recalculation failure must not cause committed rows to be imported again.

It should trigger recalculation Retry using a separate operation identity.

---

# Synchronization Publication

Committed imported Resources must publish synchronization changes through the canonical synchronization architecture.

---

# Import Completion Notification

Notification wording must reflect:

- Final Import state.
- committed count.
- rejected count.
- duplicate count.
- conflict count.
- recalculation state.
- available next action.

---

# Import History Architecture

Owners should be able to review approved Import history.

Potential fields include:

- Import date.
- source file safe name.
- Import Type.
- mapped Accounts.
- final state.
- committed count.
- warning count.
- rejected count.
- duplicate count.
- conflict count.
- financial summary.
- retention state.

---

# Import History Restrictions

Import history must not expose:

- Raw malware.
- another Owner's source file.
- unsafe source values.
- permanent download authority.
- unrestricted parser diagnostics.
- privileged override notes.

---

# Import Source Reuse

An Owner may choose to create a new Import Job using a retained clean Source File.

The new Job must:

- Have a new Import Job ID.
- preserve Source File relationship.
- use a new operationId.
- rerun current validation.
- resolve current Accounts.
- produce a new Preview.
- prevent duplicate canonical commitment.

---

# External Provider Import Architecture

Provider Imports may use direct structured payloads rather than files.

The same principles apply:

```text
Provider Authentication

↓

Contract Resolution

↓

Owner Relationship Resolution

↓

Payload Validation

↓

Normalization

↓

Mapping

↓

Duplicate Detection

↓

Canonical Commit

↓

Lineage and Evidence
```

---

# Provider Import Request

Recommended structure:

```text
ProviderImportRequest
 ├── providerRequestId
 ├── interoperabilityContractId
 ├── providerId
 ├── providerOperationId
 ├── externalOwnerReference
 ├── payloadSchemaVersion
 ├── payload
 ├── signatureMetadata
 ├── sentAt
 └── receivedAt
```

---

# Provider Request Authentication

Provider requests must validate:

- Provider identity.
- signature or credential.
- environment.
- timestamp.
- replay protection.
- contract version.
- payload size.
- Owner relationship.

---

# Provider Replay Protection

The same Provider operation identity must not create duplicate canonical Resources.

---

# Provider Owner Relationship

An external Owner reference must map through a verified Nexio relationship.

It must not directly select an arbitrary canonical Owner.

---

# Provider Payload Schema

Provider payloads must use an active Interoperability Contract and schema version.

---

# Provider Partial Delivery

A Provider may send:

- One record per request.
- bounded batch.
- file reference.
- event stream.

The selected model must define ordering and idempotency.

---

# Provider Ordering

Provider sequence may support gap detection.

Provider ordering must not replace canonical Nexio Resource versioning.

---

# Provider Correction Event

A Provider correction should reference the original external record.

Nexio must decide whether to:

- Update an eligible canonical draft.
- create a correction.
- create a reversal.
- require review.
- reject.

---

# Provider Deletion Event

An external deletion must not automatically delete canonical financial Resources without an approved contract and current-state validation.

---

# Interoperability Inbound Status

Recommended states:

```text
Received

Authenticated

Validated

Normalized

Accepted

PartiallyAccepted

Rejected

Duplicate

Conflicted

RetryableFailure
```

---

# Export Processing Architecture

Export processing transforms canonical data into a verified external artifact.

The recommended pipeline is:

```text
Validated Export Request

↓

Canonical Source Boundary

↓

Dataset Query Plan

↓

Owner-Scoped Data Retrieval

↓

Canonical Projection

↓

Schema Serialization

↓

Formula and Content Safety

↓

Artifact Assembly

↓

Integrity Verification

↓

Secure Storage

↓

Download Authorization

↓

Expiration and Destruction
```

---

# Export Processing Coordinator

The Export Processing Coordinator is responsible for:

- Resolving Export Type.
- resolving Export Schema.
- validating scope.
- resolving source boundary.
- planning canonical reads.
- tracking progress.
- applying size limits.
- generating the artifact.
- verifying exactness.
- persisting integrity metadata.
- storing securely.
- notifying the Owner.
- scheduling expiration and destruction.

---

# Export Processing Stage

Recommended structure:

```text
ExportProcessingStage
 ├── processingStageId
 ├── exportJobId
 ├── stageType
 ├── stageVersion
 ├── inputBoundary
 ├── outputReference
 ├── state
 ├── attemptNumber
 ├── startedAt
 ├── completedAt
 ├── safeErrorCode
 └── metrics
```

---

# Export Processing Stage Types

Recommended:

```text
ScopeValidation

BoundaryResolution

DataRetrieval

Projection

Serialization

ArtifactAssembly

Verification

Storage

AuthorizationCreation

Destruction
```

---

# Export Query Plan

Recommended structure:

```text
ExportQueryPlan
 ├── queryPlanId
 ├── exportJobId
 ├── sourceResourceTypes
 ├── AccountScope
 ├── period
 ├── filters
 ├── fieldProjection
 ├── sourceBoundary
 ├── expectedRecordCount
 ├── expectedSize
 ├── partitionPlan
 └── createdAt
```

---

# Export Query Plan Identifier

Recommended format:

```text
explan_<sortable-unique-identifier>
```

---

# Export Query Restrictions

Export queries must:

- Include Owner predicates.
- include Account predicates where applicable.
- use bounded periods.
- use registered filters.
- exclude unauthorized fields.
- preserve source boundary.
- use stable ordering.
- enforce maximum size.

---

# Export Estimated Size

Before generation, Nexio should estimate:

- Record count.
- raw data size.
- serialized size.
- compression size.
- processing time.

The system may reject or partition Exports exceeding policy.

---

# Export Partitioning

Large Exports may be partitioned by:

- Resource Type.
- Account.
- year.
- month.
- file-size boundary.

Partitioning must preserve one manifest and one authorized Export lifecycle.

---

# Export Dataset

Recommended structure:

```text
ExportDataset
 ├── exportDatasetId
 ├── exportJobId
 ├── sourceBoundary
 ├── partitionReferences
 ├── recordCounts
 ├── AccountCounts
 ├── currencyCounts
 ├── financialSummaries
 ├── contentHash
 └── generatedAt
```

---

# Export Dataset Identifier

Recommended format:

```text
exdata_<sortable-unique-identifier>
```

---

# Canonical Export Projection

The Export Projection defines which canonical fields enter the external schema.

It must not expose server-only fields accidentally.

---

# Export Field Projection Registry

Recommended fields:

```text
exportProjectionId

exportTypeId

schemaId

sourceField

externalField

classification

formattingPolicy

nullPolicy

formulaProtection

maskingPolicy

owner

version
```

---

# Export Monetary Serialization

Every monetary field should use one of:

```text
Exact decimal string

Integer minor units with explicit scale

Human-readable localized string plus canonical amount
```

The schema must define the selected model.

---

# Localized Export Money

A human-readable pt-BR Export may show:

```text
R$ 1.250,45
```

A machine-readable field should preserve:

```text
amount:
"1250.45"

currency:
"BRL"
```

---

# Export Negative Values

Negative values must remain unambiguous.

Example:

```text
amount:
"-125.00"

currency:
"BRL"
```

Human-readable:

```text
-R$ 125,00
```

---

# Export Date Serialization

Recommended machine-readable values:

```text
Date:
2026-07-31

Timestamp:
2026-07-31T21:30:00Z
```

Localized presentation may be additional.

---

# Export Identifier Serialization

Canonical Resource identifiers should remain strings.

Leading zeros and prefixes must be preserved.

---

# Export Null Semantics

The schema must distinguish:

```text
Missing

Null

Empty string

Zero

False
```

---

# Export Description Safety

Owner-entered text must be escaped according to the target format.

---

# Spreadsheet Formula Injection Protection

For CSV and XLSX exports, text values that could be interpreted as formulas must use an approved protection strategy.

Potential strategies include:

- Explicit text cell type.
- safe prefix.
- escaping.
- schema-specific neutralization.

The strategy must preserve legitimate negative monetary numbers as numeric values.

---

# Formula Protection Example

Untrusted description:

```text
=HYPERLINK(...)
```

must be exported as safe text, not an executable formula.

---

# CSV Formula Protection

CSV has no strong cell typing.

The serializer must protect risky text fields.

Numeric money fields should remain numeric or canonical strings according to schema.

---

# XLSX Cell Types

XLSX generation should set explicit cell Types:

```text
Text

Number

Date

Boolean
```

Untrusted text must never become a formula cell.

---

# Export Ordering

Exports should define stable ordering.

Potential Transaction order:

```text
Effective date ascending

then

Canonical creation sequence ascending

then

Transaction identifier ascending
```

---

# Export Pagination and Streaming

Large Exports should stream or page canonical reads without losing snapshot consistency.

---

# Export Read Checkpoint

A generation checkpoint may preserve:

```text
sourcePartition

lastStableSortKey

recordCountGenerated

contentHashState

currentFilePart

updatedAt
```

---

# Export Retry

Retry must:

- Use the same Export Job and operationId.
- preserve source boundary.
- avoid creating multiple active artifacts.
- reuse completed safe partitions where verified.
- regenerate invalid partitions.
- preserve final integrity verification.

---

# Export Unknown Outcome

If artifact generation completed but the coordinator lost status:

- Check object storage.
- verify content hash.
- verify manifest.
- finalize the same Export Job.
- do not create another Export automatically.

---

# Export Verification Architecture

Verification should include:

```text
Schema validation

Record-count validation

Owner-scope validation

Account-scope validation

Monetary exactness validation

Currency validation

Date validation

Summary-detail reconciliation

Formula-protection validation

Artifact readability

Content-hash validation

Manifest validation
```

---

# Export Verification Record

Recommended structure:

```text
ExportVerification
 ├── exportVerificationId
 ├── exportJobId
 ├── exportFileId
 ├── schemaValid
 ├── recordCountValid
 ├── scopeValid
 ├── moneyValid
 ├── currencyValid
 ├── dateValid
 ├── formulaProtectionValid
 ├── integrityValid
 ├── errors
 ├── warnings
 ├── verifiedAt
 └── verifierVersion
```

---

# Export Verification Identifier

Recommended format:

```text
exver_<sortable-unique-identifier>
```

---

# Export Verification Failure

Any failure affecting:

- Owner scope.
- Account scope.
- exact money.
- currency.
- file integrity.
- unsafe formula execution.
- unauthorized fields.

must block download.

---

# Export Round-Trip Testing

Where an Export format is intended for reimport, round-trip tests should verify:

```text
Canonical Resource

↓

Export

↓

Import normalization

↓

Equivalent canonical candidate
```

Round-trip equivalence does not require preserving every internal server-only field.

---

# Export Storage Architecture

Generated files should use secure object storage.

Required properties include:

- Private access.
- Owner-scoped metadata.
- environment isolation.
- encryption at rest.
- content hash.
- lifecycle expiration.
- deletion support.
- no public listing.
- no predictable authorization.

---

# Export Storage Object Name

Object names should be server-generated and free from:

- Owner email.
- complete Account number.
- Authentication token.
- original sensitive file name.
- sequential guessable identifiers where unsafe.

---

# Export Encryption

Highly sensitive Exports may require additional object or package encryption.

The key-delivery model must be separately governed.

---

# Export Download Session

A Download Session may support large or resumable downloads.

Recommended structure:

```text
ExportDownloadSession
 ├── downloadSessionId
 ├── exportFileId
 ├── ownerId
 ├── actorId
 ├── authorizationId
 ├── byteRangePolicy
 ├── downloadedBytes
 ├── state
 ├── startedAt
 ├── expiresAt
 └── completedAt
```

---

# Download Session Identifier

Recommended format:

```text
eds_<sortable-unique-identifier>
```

---

# Download Session States

Recommended:

```text
Created

Active

Paused

Completed

Expired

Revoked

Failed
```

---

# Range Requests

Range downloads may be supported when:

- Authorization remains valid.
- file integrity is preserved.
- range limits are enforced.
- download Session is bounded.
- another Owner cannot reuse the Session.

---

# Download Completion

Download completion may be recorded when all required bytes were transferred.

This does not prove the Owner opened or understood the file.

---

# Export File Invalidity

A Ready Export should be invalidated when:

- Wrong Owner scope is suspected.
- wrong Account scope is detected.
- financial values are incorrect.
- schema is defective.
- file integrity fails.
- unsafe formula content exists.
- Security or Privacy Incident requires containment.

---

# Export Revocation

Revocation should:

- Disable active download authorizations.
- stop new Sessions.
- terminate active Sessions where possible.
- remove Notification actions.
- preserve Evidence.
- schedule file destruction.

---

# Export Destruction Architecture

Destruction should cover:

- Primary object.
- temporary generation files.
- partition artifacts.
- preview files.
- delivery caches.
- content-distribution caches where used.
- search indexes.
- backups according to policy.

---

# Export Destruction Record

Recommended structure:

```text
ExportDestruction
 ├── destructionId
 ├── exportFileId
 ├── reason
 ├── scheduledAt
 ├── startedAt
 ├── completedAt
 ├── storageLocations
 ├── result
 └── auditReference
```

---

# Export Destruction Identifier

Recommended format:

```text
exdst_<sortable-unique-identifier>
```

---

# Destruction States

Recommended:

```text
Scheduled

Running

Completed

CompletedWithExceptions

FailedRetryable

FailedFinal

LegalHold
```

---

# Legal Hold

An Export file under Legal Hold must not remain ordinarily downloadable unless separately authorized.

---

# Privacy Portability Architecture

Privacy portability requests may require broader data assembly than ordinary Product Exports.

Recommended flow:

```text
Verified Privacy Request

↓

Identity and scope validation

↓

Data-category inventory

↓

Source-system collection

↓

Privacy review and exclusions

↓

Portable package generation

↓

Integrity verification

↓

Secure delivery

↓

Expiration and destruction
```

---

# Privacy Portability Manifest

Potential sections include:

```text
Profile data

Financial data

Preference data

Import history

Export history

Security-safe Session metadata

Privacy request history

Support-case data where applicable
```

---

# Privacy Portability Completeness

The package should disclose:

- Included categories.
- excluded categories.
- unavailable categories.
- retention limitations.
- Device-only unsynchronized-data limitation.
- generation time.

---

# Device-Only Data Limitation

Nexio cannot export offline data never synchronized to the backend.

The Product should explain this clearly.

---

# Privacy Export Reauthentication

Privacy Exports should require verified identity and may require stronger Authentication.

---

# Privacy Export Delivery

Delivery must use:

- Secure authenticated download.
- short expiration.
- revocation.
- limited download count where appropriate.
- Audit Evidence.

---

# API Export Architecture

Approved external consumers may request structured data through APIs.

API exports must use:

- Registered Interoperability Contract.
- scoped Authentication.
- Owner authorization.
- field projection.
- pagination.
- rate limits.
- idempotency where applicable.
- Audit.
- schema version.

---

# API Pagination

API pagination must preserve:

- Owner scope.
- filters.
- stable sort.
- snapshot or sequence boundary.
- cursor integrity.
- page-size limit.

---

# API Export Cursor

An API Export cursor does not grant access independently.

---

# API Field Selection

Consumer-selected fields must be limited to an approved allowlist.

---

# API Bulk Export

Large API Exports may become asynchronous Export Jobs rather than unbounded synchronous responses.

---

# Outbound Interoperability Architecture

Outbound interoperability sends approved Nexio data to an external system.

Recommended flow:

```text
Canonical Event or Export Request

↓

External Relationship Resolution

↓

Contract and Schema Resolution

↓

Owner Authorization

↓

External Payload Projection

↓

Idempotent Delivery

↓

External Response Normalization

↓

Retry or Finalization

↓

Lineage and Evidence
```

---

# Outbound Interoperability Operation

Recommended structure:

```text
OutboundInteropOperation
 ├── outboundOperationId
 ├── interoperabilityContractId
 ├── ownerId
 ├── externalRelationshipId
 ├── sourceResourceReferences
 ├── sourceVersions
 ├── externalSchemaVersion
 ├── payloadHash
 ├── providerOperationId
 ├── state
 ├── attemptCount
 ├── createdAt
 └── completedAt
```

---

# Outbound Interoperability States

Recommended:

```text
Created

Validated

Queued

Sending

AcceptedExternal

DeliveredExternal

RetryScheduled

FailedFinal

Cancelled

Expired

Conflicted
```

---

# External Acceptance

External acceptance does not prove the external system applied the data correctly.

---

# Outbound Idempotency

The same outbound logical operation must preserve one stable external idempotency identity.

---

# External Conflict

An external system may reject because its Resource changed.

Nexio must not overwrite external state blindly without contract policy.

---

# Interoperability Reconciliation

Nexio may reconcile:

- Outbound operations.
- external acknowledgements.
- external Resources.
- missing callbacks.
- duplicate delivery.
- failed updates.

---

# Interoperability Reconciliation Record

Recommended structure:

```text
InteropReconciliation
 ├── reconciliationId
 ├── interoperabilityContractId
 ├── period
 ├── nexioOperationCount
 ├── externalOperationCount
 ├── matchedCount
 ├── missingExternalCount
 ├── unexpectedExternalCount
 ├── conflicts
 ├── corrections
 └── completedAt
```

---

# Import and Export Security Architecture

Security controls must protect:

- Upload Sessions.
- Source Files.
- parser environments.
- mapping profiles.
- normalized records.
- Preview decisions.
- commit operations.
- Export Jobs.
- Export files.
- download authorizations.
- external contracts.
- Provider credentials.
- Support tools.

---

# Upload Abuse Prevention

Controls should detect:

```text
Excessive upload creation

Oversized files

Repeated malware upload

Archive bombs

Parser-exhaustion attempts

Repeated invalid schemas

Cross-Owner Account references

Upload-token replay

Unexpected file-format switching
```

---

# Upload Rate Limits

Rate limits should apply to:

- Actor.
- Owner.
- IP or Device where approved.
- Import Type.
- total bytes.
- active Upload Sessions.
- parser jobs.
- failed scans.

---

# Import Resource Exhaustion

Processing must limit:

- concurrent Jobs.
- records.
- parsing memory.
- normalization memory.
- Preview size.
- duplicate-comparison scope.
- retained Source Files.

---

# Export Abuse Prevention

Controls should detect:

- Excessive Export requests.
- repeated large Exports.
- broad Account selection.
- repeated download authorization creation.
- download-token probing.
- unusual download regions or Devices.
- high-volume administrative Exports.
- attempted cross-Owner scope.

---

# Export Rate Limits

Rate limits should apply to:

- Owner.
- Actor.
- Export Type.
- time period.
- total records.
- total generated bytes.
- concurrent Jobs.
- active downloads.

---

# Parser Supply-Chain Security

Parser dependencies should be:

- Inventoried.
- version-pinned where appropriate.
- vulnerability-monitored.
- updated through controlled release.
- fuzz-tested.
- isolated.
- replaceable.

---

# Serializer Supply-Chain Security

Export libraries should receive equivalent review.

---

# Formula-Injection Security Testing

Tests should include text beginning with:

```text
=

+

-

@

tab

carriage return
```

Numeric negative values must remain correctly represented.

---

# Malicious Content in Descriptions

An imported description may contain:

- HTML.
- JavaScript.
- spreadsheet formula text.
- SQL-like text.
- shell-like text.
- prompt injection.

It must remain inert data.

---

# AI Prompt-Injection Protection

Imported text must not be inserted into an AI prompt as trusted instruction.

AI-assisted mapping or review must isolate source data from system instructions and validate output.

---

# Import and Export Privacy Architecture

Privacy controls should govern:

- Source File contents.
- Raw records.
- normalized records.
- mapping profiles.
- Preview data.
- Export files.
- download Evidence.
- external-system processing.
- retention.
- deletion.
- Support access.

---

# Raw Record Privacy

Raw records may contain more information than Nexio will import.

They should receive shorter retention where possible.

---

# Mapping Profile Privacy

Owner mapping profiles may reveal:

- Account names.
- external provider names.
- Category relationships.
- file structure.

They must remain Owner-scoped.

---

# Export Data Minimization

An Export should include only fields required by the requested Export Type and schema.

---

# Support Import Access

Support may view:

- Import state.
- safe file metadata.
- Parser state.
- row counts.
- controlled error codes.
- mapping status.
- Preview state.
- commit status.
- safe Account labels.

Ordinary Support should not access complete raw files without exceptional approval.

---

# Support Export Access

Support may view:

- Export state.
- safe scope.
- file size.
- expiration.
- download state.
- safe error codes.

Support should not download Owner Exports routinely.

---

# Administrative Access

Privileged access to Source Files or Exports requires:

- Case or Incident scope.
- explicit capability.
- reason.
- time-bound access.
- logging.
- field minimization.
- retention.

---

# Import and Export Accessibility Architecture

Accessibility applies to:

- File selection.
- drag and drop.
- upload progress.
- scanning state.
- mapping.
- locale selection.
- currency selection.
- Preview.
- row validation.
- duplicate review.
- conflict review.
- commit progress.
- Export request.
- Export progress.
- download.
- expiration.

---

# Accessible File Selection

The interface should provide an accessible file-input control even when drag and drop exists.

---

# Accessible Upload Progress

Progress should expose:

- File name.
- bytes or percentage.
- current stage.
- cancellation availability.
- completion or failure.

---

# Accessible Mapping Interface

Mapping controls should include:

- Source-column label.
- example values.
- target-field label.
- required state.
- validation error.
- selected Account or Category.
- keyboard operation.

---

# Accessible Row Error Summary

An error summary should provide:

- Number of affected rows.
- error categories.
- links or controls to navigate to rows.
- readable source position.
- corrective guidance.

---

# Accessible Duplicate Review

Duplicate candidates should explain:

- Imported candidate.
- existing Resource.
- evidence.
- available decision.
- financial consequence.

---

# Accessible Export Status

Examples:

```text
“Your Export is being prepared.”

“Your Export is ready and expires on 2 August 2026 at 18:30.”

“Your Export could not be generated. No file was created.”
```

---

# Import and Export Support Architecture

Support workflows must avoid creating duplicate or unauthorized financial effects.

---

# Support Scenario — File Rejected

Expected behavior:

- Confirm safe file metadata.
- confirm controlled rejection code.
- explain supported format or limit.
- do not request malware through ordinary email.
- do not advise renaming extension to bypass validation.
- escalate incorrect detection.

---

# Support Scenario — Amounts Imported Incorrectly

Required behavior:

- Preserve Import Job.
- preserve Preview version.
- identify locale and decimal policy.
- identify exact normalized values.
- stop further commitment if active.
- invalidate incorrect Preview.
- escalate committed financial defects.
- do not edit canonical values manually through Support tools.

---

# Support Scenario — Duplicate Transactions

Expected behavior:

- Identify Import Job and row results.
- identify operation IDs.
- identify duplicate decisions.
- distinguish repeated upload from legitimate repeated activity.
- avoid deleting financial Resources without correction workflow.
- escalate idempotency defects.

---

# Support Scenario — Import Stuck in Processing

Expected behavior:

- Confirm processing stage.
- confirm attempt count.
- confirm Source File retention.
- confirm safe error code.
- request bounded Retry if eligible.
- avoid creating a new Import Job unless status is final and duplication risk is understood.

---

# Support Scenario — Export Not Downloadable

Expected behavior:

- Confirm Export state.
- confirm expiration.
- confirm current Owner.
- confirm reauthentication requirement.
- confirm file integrity state.
- regenerate through a new Export operation where appropriate.
- do not extend an expired raw link manually.

---

# Support Scenario — Wrong Data in Export

Required behavior:

- Revoke download authority.
- invalidate the Export.
- preserve source boundary and schema.
- identify affected fields.
- escalate financial, Privacy or cross-Owner risk.
- generate a corrected new Export only after verification.

---

# Support Scenario — Another Owner's Data Appears

This is Critical.

Required behavior:

- Revoke affected download and Import access.
- stop the affected workflow.
- preserve safe Evidence.
- identify recipient and source Owners.
- notify Security and Privacy immediately.
- do not ask the Owner to continue inspecting the file.

---

# Import and Export Observability Architecture

Observability must cover:

```text
Uploads

Scanning

Parsing

Normalization

Mapping

Validation

Duplicate analysis

Conflict analysis

Preview

Commit

Recalculation

Export generation

Verification

Downloads

Expiration

Destruction

Interoperability

Owner isolation
```

---

# Upload Metrics

Recommended:

```text
import_upload_session_count

import_upload_success_rate

import_upload_failure_count

import_upload_expired_count

import_uploaded_bytes

import_upload_size_rejection_count

import_upload_replay_block_count
```

---

# Scan Metrics

```text
import_scan_count

import_scan_clean_count

import_scan_suspicious_count

import_scan_malicious_count

import_scan_failure_count

import_scan_latency
```

---

# Parser Metrics

```text
import_parse_job_count

import_parse_success_rate

import_parse_failure_count

import_parse_latency

import_parser_timeout_count

import_record_limit_rejection_count

import_field_limit_rejection_count
```

---

# Normalization Metrics

```text
import_normalized_record_count

import_normalization_warning_count

import_locale_ambiguous_count

import_currency_ambiguous_count

import_decimal_rejection_count

import_date_rejection_count
```

---

# Mapping Metrics

```text
import_mapping_success_rate

import_mapping_owner_review_count

import_mapping_admin_review_count

import_account_mapping_ambiguous_count

import_category_mapping_unresolved_count

import_mapping_profile_invalidated_count
```

---

# Validation Metrics

```text
import_record_valid_count

import_record_warning_count

import_record_rejected_count

import_financial_validation_failure_count

import_cross_owner_validation_failure_count

import_reconciliation_lock_count
```

---

# Duplicate Metrics

```text
import_duplicate_candidate_count

import_duplicate_confirmed_count

import_duplicate_false_positive_count

import_same_operation_duplicate_count

import_external_id_duplicate_count

import_duplicate_committed_financial_count
```

The target for duplicate committed financial effect caused by Retry is zero.

---

# Conflict Metrics

```text
import_conflict_count

import_conflict_owner_review_count

import_conflict_admin_review_count

import_conflict_resolution_latency

import_commit_time_conflict_count
```

---

# Preview Metrics

```text
import_preview_generated_count

import_preview_invalidated_count

import_preview_expired_count

import_preview_confirmation_count

import_preview_count_drift_count

import_preview_financial_summary_mismatch_count
```

---

# Commit Metrics

```text
import_commit_session_count

import_commit_success_rate

import_commit_partial_count

import_commit_failure_count

import_committed_record_count

import_commit_retry_count

import_unknown_outcome_resolution_count
```

---

# Recalculation Metrics

```text
import_recalculation_count

import_recalculation_success_rate

import_recalculation_failure_count

import_recalculation_latency

import_balance_stale_after_import_count
```

---

# Export Metrics

```text
export_job_count

export_generation_success_rate

export_generation_failure_count

export_generation_latency

export_record_count

export_generated_bytes

export_integrity_failure_count

export_scope_validation_failure_count
```

---

# Download Metrics

```text
export_download_authorization_count

export_download_success_count

export_download_failure_count

export_download_expired_count

export_download_revoked_count

export_cross_owner_download_attempt_count
```

---

# Destruction Metrics

```text
export_destruction_scheduled_count

export_destruction_success_rate

export_destruction_failure_count

export_expired_file_retained_count

import_source_destruction_failure_count
```

---

# Interoperability Metrics

```text
interop_inbound_request_count

interop_inbound_acceptance_rate

interop_inbound_duplicate_count

interop_outbound_operation_count

interop_outbound_success_rate

interop_outbound_retry_count

interop_reconciliation_difference_count
```

---

# Owner-Isolation Metrics

Targets must be zero for:

```text
cross_owner_import_account_mapping_count

cross_owner_import_commit_count

cross_owner_import_preview_exposure_count

cross_owner_export_generation_count

cross_owner_export_download_count

cross_owner_mapping_profile_use_count

cross_owner_external_reference_mapping_count
```

---

# Import and Export SLO Architecture

Potential SLO categories include:

```text
Upload completion

Security scanning

Parsing

Preview generation

Commit completion

Recalculation

Export generation

Export readiness

Download authorization

Artifact destruction

Interoperability delivery
```

---

# Upload Completion SLO

Potential objective:

```text
Valid bounded uploads complete or enter a controlled failure state within the approved file-size-specific window.
```

---

# Security Scan SLO

Potential objective:

```text
Uploaded files receive a final scan or controlled quarantine state within the approved window.
```

---

# Preview Generation SLO

Potential objective:

```text
Supported clean Imports produce a Preview or controlled mapping requirement within the approved record-count-specific window.
```

---

# Import Commit SLO

Potential objective:

```text
Confirmed eligible Imports reach Completed, PartiallyCompleted or controlled failure within the approved batch and record-count window.
```

---

# Recalculation SLO

Potential objective:

```text
Affected balances and derived financial views return to verified current state within the approved post-Import recalculation window.
```

---

# Export Generation SLO

Potential objective:

```text
Valid bounded Export requests produce a verified Ready file or controlled failure within the approved scope-specific window.
```

---

# Artifact Destruction SLO

Potential objective:

```text
Expired Import and Export artifacts are destroyed within the approved retention-completion window unless Legal Hold applies.
```

---

# Owner-Isolation SLO

Target:

```text
Zero cross-Owner Import mapping, commitment, Preview exposure, Export generation or download.
```

---

# Zero-Tolerance Import and Export Failures

Targets must be zero for:

```text
Cross-Owner Import commitment

Cross-Owner Export generation

Cross-Owner Export download

Malware executed during processing

Uploaded macro executed

XML external entity accessed

Archive path traversal succeeded

Duplicate committed financial effect caused by Retry

Ambiguous locale committed without resolution

Ambiguous currency committed without resolution

Incorrect financial sign committed silently

Expired Preview committed

Unauthorized permanent Export URL

Integrity-failed Export downloaded

AI-approved financial mapping without required validation
```

---

# Import and Export Error Budgets

Error budgets may apply to:

- Optional Preview rendering delay.
- noncritical Category suggestion delay.
- low-priority Export queue delay.
- optional Download progress telemetry delay.
- noncritical Provider acknowledgement delay.

They must not normalize:

```text
Wrong Owner

Wrong Account

Wrong currency

Wrong amount

Duplicate financial effect

Malware execution

Unauthorized download

Formula injection

Preview integrity failure

Source-lineage loss

Expired artifact retention beyond policy

Privacy deletion failure
```

---

# Import Processing and Export Reliability Acceptance Criteria

The Import Processing, Mapping, Validation and Export Reliability architecture is accepted only when:

306. Every material Import processing stage has a stable identity.

307. Import processing stages preserve input and output integrity references.

308. Stage Retry is idempotent.

309. Upstream material changes invalidate dependent stages.

310. File-format detection uses more than the file extension.

311. File-format detection preserves confidence.

312. Ambiguous format requires review or rejection.

313. Unsupported formats do not use arbitrary generic parsing.

314. Parser resolution is versioned.

315. Raw records preserve Parser version.

316. High-risk Parser execution is isolated.

317. Parser CPU is bounded.

318. Parser memory is bounded.

319. Parser execution time is bounded.

320. Parser network access is restricted where required.

321. Streaming parsing preserves record order.

322. Streaming parsing enforces record limits.

323. Parser checkpoints are integrity-bound.

324. Parser resumption validates file and Parser compatibility.

325. Parser failures use controlled categories.

326. Parser timeout is not reported as complete success.

327. Raw records are retained only according to policy.

328. Raw fields are size-limited.

329. Raw values are excluded from ordinary logs.

330. Encoding resolution is explicit.

331. UTF-8 validation occurs before semantic parsing where applicable.

332. Invalid encoding does not silently alter financial meaning.

333. Replacement characters are detected.

334. Declared and detected encoding conflicts are controlled.

335. CSV delimiter resolution evaluates multiple records.

336. CSV delimiter resolution accounts for decimal separators.

337. Headerless files require an explicit schema.

338. Duplicate headers are rejected or resolved explicitly.

339. Schema detection preserves confidence.

340. Ambiguous schema requires explicit resolution.

341. Schema fingerprints avoid private row content.

342. Source locale remains distinct from Product locale.

343. Locale resolution preserves decimal Rules.

344. Locale resolution preserves date Rules.

345. Locale changes invalidate financial normalization.

346. Currency resolution follows a controlled hierarchy.

347. Row-level currency overrides are schema-controlled.

348. Account-currency inheritance is explicit.

349. Currency mismatch is not converted silently.

350. Import-time currency conversion remains separately governed.

351. Normalization Rules are registered.

352. Normalization distinguishes lossless and lossy transformations.

353. Lossy transformations produce warning or rejection.

354. Text normalization preserves meaningful characters.

355. External identifiers remain strings unless explicitly numerical.

356. Leading zeros in identifiers are preserved.

357. Boolean values follow schema-defined representations.

358. Percentage semantics are explicit.

359. Money normalization preserves exact decimal value.

360. Money normalization preserves currency.

361. Excess monetary precision follows an explicit policy.

362. Monetary truncation is prohibited.

363. Zero-amount behavior is Resource-specific.

364. Monetary ranges are bounded.

365. Negative-value representations are controlled.

366. Date normalization distinguishes date and timestamp.

367. Date-only values do not shift through time zones.

368. Invalid calendar dates are rejected.

369. Financial date ranges are validated.

370. Timestamp time zones are explicit.

371. Mapping results have stable identifiers.

372. Mapping profiles are versioned.

373. Field mappings use controlled Types.

374. Mapping transformations are registered.

375. Mapping transformations are deterministic.

376. Mapping does not execute unrestricted uploaded code.

377. Account mapping uses canonical Owner validation.

378. Account name similarity alone does not select an ambiguous Account.

379. Closed Account mapping follows explicit policy.

380. Account currency is validated.

381. Category mapping remains Owner-scoped.

382. Category creation proposals remain provisional.

383. Parent Category cycles are prevented.

384. Transfer recognition uses registered evidence.

385. Matching amounts alone do not create a Transfer.

386. Cross-currency Transfer candidates require explicit semantics.

387. Recurring pattern recognition remains a proposal unless approved.

388. Validation Rules are registered.

389. Validation Rules have stable codes.

390. Validation severity is controlled.

391. Structural validation occurs before domain commitment.

392. Field validation covers money, currency and dates.

393. Relationship validation confirms Owner scope.

394. Relationship validation confirms Account scope.

395. Financial validation uses canonical financial policy versions.

396. Reconciliation-aware validation exists.

397. Opening balances are not misclassified as ordinary Income automatically.

398. Privileged Adjustments cannot be created from labels alone.

399. Goal targets remain distinct from Contributions.

400. Budget amounts remain distinct from consumed values.

401. Recurring schedules are validated.

402. Domain state is revalidated.

403. Owner overrides are limited to approved decisions.

404. Owner overrides cannot bypass cross-Owner protection.

405. Owner overrides cannot bypass malicious-file rejection.

406. Administrative overrides preserve original validation results.

407. Record eligibility requires complete mapping.

408. Record eligibility requires resolved currency.

409. Record eligibility requires valid Owner and Account scope.

410. Record eligibility excludes unresolved Critical issues.

411. Duplicate analysis has stable identifiers.

412. Duplicate Types are controlled.

413. Same-operation duplicate returns original outcome.

414. Same-file detection does not automatically imply same canonical result.

415. Repeated rows are evaluated through domain policy.

416. External identifiers provide scoped duplicate evidence.

417. Recurring occurrence identity prevents duplicate generation.

418. Transfer identity prevents duplicate financial effects.

419. Matching amount and date alone do not confirm a duplicate.

420. Duplicate confidence is explicit.

421. Duplicate decisions are preserved.

422. AI duplicate assistance cannot independently delete or suppress financial records.

423. Import Conflicts have stable identifiers.

424. Import Conflict Types are controlled.

425. Conflict remains distinct from validation failure.

426. Conflicts preserve current canonical state.

427. Conflict resolution is revalidated before commit.

428. Import Previews preserve parser and schema versions.

429. Import Previews preserve locale and currency decisions.

430. Import Previews preserve mapping-profile version.

431. Preview datasets have stable integrity references.

432. Preview pagination preserves Preview version.

433. Preview filtering does not change confirmed record membership silently.

434. Preview summaries equal the included record set.

435. Preview decisions are versioned.

436. Stale Preview decisions are rejected.

437. Bulk decisions disclose affected record counts.

438. Bulk decisions cannot cross incompatible currencies.

439. Bulk decisions cannot cross incompatible Accounts without policy.

440. Preview interfaces are keyboard accessible.

441. Preview row states are screen-reader accessible.

442. Every commit-eligible row has a stable operationId.

443. Row idempotency is Owner-scoped.

444. Row idempotency is Import-scoped.

445. Commit Sessions have stable identifiers.

446. Commit Sessions reference exact confirmed Preview versions.

447. Commit workers use controlled claims or leases.

448. Backend idempotency remains effective after lease failure.

449. Commit batches are bounded.

450. Canonical commit transactions preserve Import lineage.

451. Canonical commit transactions preserve idempotency records.

452. Canonical commit transactions publish synchronization changes safely.

453. Import lineage has stable identifiers.

454. Import lineage preserves Source File.

455. Import lineage preserves source row.

456. Import lineage preserves canonical Resource identity.

457. Corrections do not rewrite original lineage.

458. Import Retry uses the same operationId.

459. Import Retry uses the same row operation IDs.

460. Import Retry skips already committed rows safely.

461. Import Retry revalidates uncommitted rows.

462. Commit checkpoints do not replace canonical row results.

463. Partial completion identifies every uncommitted row.

464. Atomic Import failure leaves no partial canonical effect.

465. Batch failure preserves completed batches without duplication.

466. Commit-time duplicates do not create new Resources.

467. Commit-time Conflicts do not overwrite canonical state.

468. Cancellation does not leave unknown batch state.

469. Committed Import effects are not deleted silently as rollback.

470. Import reversal uses governed financial operations.

471. Reconciled Resources are not deleted automatically during reversal.

472. Differential Imports identify new, changed and removed source records.

473. Source-row removal does not automatically delete canonical Resources.

474. Recalculation plans have stable identifiers.

475. Import recalculation identifies affected Accounts.

476. Import recalculation identifies affected periods.

477. Import recalculation identifies affected currencies.

478. Committed Resources remain distinct from recalculation state.

479. Recalculation Retry does not repeat Import commitment.

480. Imported Resources publish synchronization changes.

481. Import Notifications describe partial completion accurately.

482. Import history remains Owner-scoped.

483. Import history does not expose malicious file contents.

484. Source File reuse creates a new Import Job and Preview.

485. Provider Imports use registered Interoperability Contracts.

486. Provider requests are authenticated.

487. Provider requests use replay protection.

488. External Owner references map through verified relationships.

489. Provider correction Events reference original external Resources.

490. Provider deletions do not delete canonical financial Resources blindly.

491. Export processing stages have stable identities.

492. Export processing stages preserve source boundary.

493. Export query plans are Owner-scoped.

494. Export query plans are Account-scoped where applicable.

495. Export queries enforce bounded periods.

496. Export queries use stable ordering.

497. Export size is estimated before unbounded processing.

498. Large Exports use governed partitioning.

499. Export partitions share one manifest.

500. Export canonical projections expose approved fields only.

501. Export money uses exact serialization.

502. Export currency is explicit.

503. Human-readable pt-BR values remain presentation fields.

504. Machine-readable amounts remain locale-neutral where specified.

505. Negative Export values remain unambiguous.

506. Export dates use controlled serialization.

507. Export identifiers remain strings.

508. Export null semantics are explicit.

509. Untrusted descriptions are escaped.

510. Spreadsheet formula injection is neutralized.

511. Legitimate negative numbers remain numeric.

512. XLSX cells use explicit Types.

513. Export ordering is documented.

514. Large Export streaming preserves snapshot consistency.

515. Export generation checkpoints preserve source boundary.

516. Export Retry uses the same Export Job.

517. Export Retry does not create multiple active artifacts.

518. Unknown Export outcome checks storage and integrity before regeneration.

519. Export verification has a stable record.

520. Export verification checks schema.

521. Export verification checks record count.

522. Export verification checks Owner scope.

523. Export verification checks Account scope.

524. Export verification checks exact monetary values.

525. Export verification checks currencies.

526. Export verification checks dates.

527. Export verification checks formula safety.

528. Export verification checks content hash.

529. Any scope or money verification failure blocks download.

530. Reimport-capable formats have round-trip tests.

531. Export storage is private.

532. Export storage is environment-scoped.

533. Export storage uses approved encryption.

534. Export object names contain no secrets.

535. Download Sessions have stable identifiers.

536. Download Sessions remain Owner-bound.

537. Range downloads preserve Authorization.

538. Download completion does not imply file comprehension.

539. Incorrect Ready Exports can be invalidated.

540. Export revocation disables active authorizations.

541. Export revocation removes Notification actions.

542. Export destruction has a stable record.

543. Export destruction covers temporary artifacts.

544. Legal Hold blocks ordinary destruction but not access controls.

545. Privacy portability uses verified requests.

546. Privacy portability identifies included categories.

547. Privacy portability identifies exclusions.

548. Privacy portability discloses unsynchronized Device-only limitations.

549. Privacy Exports use strong secure delivery.

550. API Exports use registered contracts.

551. API pagination preserves snapshot scope.

552. API cursors do not grant independent access.

553. API field selection uses allowlists.

554. Large API Exports become asynchronous where required.

555. Outbound interoperability resolves external relationships.

556. Outbound interoperability uses field-minimized projections.

557. Outbound interoperability preserves idempotency.

558. External acceptance remains distinct from external application.

559. External Conflicts do not trigger blind overwrite.

560. Interoperability reconciliation exists.

561. Upload abuse controls are active.

562. Upload byte rates are limited.

563. Parser concurrency is limited.

564. Repeated malware upload is detectable.

565. Archive-bomb attempts are detectable.

566. Export abuse controls are active.

567. Large Export rates are limited.

568. Repeated download-token probing is detectable.

569. Parser dependencies are inventoried.

570. Parser vulnerabilities are monitored.

571. Serializer dependencies are inventoried.

572. Formula-injection tests exist.

573. Imported descriptions remain inert data.

574. Imported prompt-injection text is not trusted by AI systems.

575. Raw-record retention is bounded.

576. Mapping profiles remain Owner-scoped.

577. Export data is minimized.

578. Support Import access is field-minimized.

579. Support Export access is field-minimized.

580. Privileged Source File access is audited.

581. File selection is accessible.

582. Upload progress is accessible.

583. Mapping controls are accessible.

584. Row-error summaries are accessible.

585. Duplicate review is accessible.

586. Conflict review is accessible.

587. Export status is accessible.

588. Download expiration is accessible.

589. Support does not advise bypassing file validation.

590. Support preserves locale and Preview Evidence for amount defects.

591. Support does not recreate unknown-outcome Imports blindly.

592. Support revokes incorrect Exports.

593. Cross-Owner data appearance is escalated immediately.

594. Upload metrics are collected.

595. scan metrics are collected.

596. Parser metrics are collected.

597. normalization metrics are collected.

598. mapping metrics are collected.

599. validation metrics are collected.

600. duplicate metrics are collected.

601. conflict metrics are collected.

602. Preview metrics are collected.

603. commit metrics are collected.

604. recalculation metrics are collected.

605. Export-generation metrics are collected.

606. download metrics are collected.

607. destruction metrics are collected.

608. interoperability metrics are collected.

609. Owner-isolation metrics have a zero target.

610. Import and Export SLOs are defined.

611. Security scanning has an SLO.

612. Preview generation has an SLO.

613. Import commitment has an SLO.

614. Export generation has an SLO.

615. artifact destruction has an SLO.

616. Cross-Owner Import and Export failures are excluded from error budgets.

617. Duplicate committed financial effects are excluded from error budgets.

618. Unauthorized downloads are excluded from error budgets.

619. Every imported canonical Resource remains traceable to its source and operation.

620. Every generated Export remains traceable to its source boundary, schema and download authority.

---

# Import Processing, Mapping, Validation and Export Reliability Rule

An Import processing stage is not successful merely because it produced output.

A mapping is not correct merely because every source column received a destination.

A row is not valid merely because every individual field parsed.

A duplicate is not confirmed merely because two records look similar.

A Preview is not safe to commit merely because the Owner opened it.

A commit is not complete merely because one batch succeeded.

An Export is not correct merely because a serializer produced a file.

An external delivery is not complete merely because another API accepted a payload.

Import and Export reliability requires Nexio to establish:

```text
The canonical Owner

The Account and Resource scope

The Source File or external payload identity

The Parser and schema versions

The encoding, locale and currency decisions

The deterministic normalized values

The mapping profile and transformation versions

The validation results

The duplicate and Conflict decisions

The exact Preview version confirmed

The stable Import and row operation identities

The canonical commit results

The Import lineage

The recalculation and synchronization results

The Export source boundary

The Export schema and exact serialization

The file-integrity result

The authorized delivery state

The expiration and destruction state
```

When any required identity, scope, value, decision, policy or integrity result is uncertain, Nexio must prefer the action that:

- Stops processing.
- preserves the Source File in quarantine.
- invalidates dependent stages.
- requires explicit locale or currency resolution.
- requires explicit Account mapping.
- excludes or rejects unsafe records.
- preserves duplicate uncertainty.
- preserves Conflict state.
- invalidates the Preview.
- prevents canonical commitment.
- resolves unknown outcomes through the same operation identity.
- blocks incorrect Export download.
- revokes download authority.
- destroys unsafe artifacts.
- opens a Security, Privacy, financial-integrity or operational Incident.
- blocks the release.

Nexio must never:

- Let a Parser redefine canonical financial meaning.
- infer another Owner's Account.
- accept ambiguous money silently.
- merge potential duplicates without registered policy.
- overwrite canonical financial state from stale Import data.
- change operation identity during Retry.
- repeat committed rows after partial failure.
- hide failed rows behind a successful Import status.
- calculate canonical totals from an incomplete Export dataset.
- release an Export before scope and integrity verification.
- allow an external Provider acknowledgement to replace canonical Nexio Evidence.
- allow AI to approve mappings, duplicates, financial values or commitment independently.
# Import and Export Governance Architecture

Imports, Exports, data-portability packages, external interoperability contracts, uploaded files, generated artifacts, mapping profiles, validation Rules and download authorizations are governed Platform capabilities.

They must not be treated as:

- Generic file-upload utilities.
- unrestricted spreadsheet processors.
- temporary background scripts.
- direct database loaders.
- unrestricted data-download endpoints.
- permanent public file-sharing mechanisms.
- external Provider authority.
- client-controlled financial migration tools.
- AI-controlled mapping systems.

Governance applies to:

```text
Import Types

Export Types

Data Exchange Schemas

Parsers

Serializers

Upload Sessions

Download Sessions

Source Files

Export Files

Quarantine Storage

Object Storage

Mapping Profiles

Normalization Rules

Validation Rules

Duplicate Policies

Conflict Policies

Import Previews

Commit Policies

Import Lineage

Recalculation Plans

Portability Requests

Interoperability Contracts

External Resource References

Provider Connections

Retention Policies

Destruction Policies

Support Access

Administrative Imports

Administrative Exports

Migration Imports

Privacy Exports

Audit Exports

Import and Export Incidents
```

The governed lifecycle is:

```text
Business or Portability Need Identified

↓

Purpose and Canonical Scope Defined

↓

Import, Export or Interoperability Type Registered

↓

Schema and Format Defined

↓

Parser, Serializer and Mapping Policies Defined

↓

Financial, Security, Privacy and Accessibility Review

↓

Implementation

↓

Automated and Manual Verification

↓

Controlled Activation

↓

Monitoring

↓

Periodic Review

↓

Correction or Migration

↓

Deprecation

↓

Retirement

↓

Historical Evidence Preservation
```

---

# Governance Objectives

The Nexio Import and Export governance program shall ensure:

```text
Every Import has one approved purpose.

Every Export has one approved purpose.

Every file belongs to one canonical Owner scope.

Every Account reference is validated.

Every monetary value remains exact.

Every currency remains explicit.

Every schema is versioned.

Every Parser and Serializer is registered.

Every mapping is deterministic or explicitly reviewed.

Every row has a final controlled result.

Every duplicate decision is explainable.

Every Conflict follows a registered policy.

Every Import commit remains idempotent.

Every Export remains scope-verifiable.

Every download authority expires.

Every file has a retention and destruction policy.

Every external contract remains replaceable and auditable.

Every lifecycle remains reconstructable.
```

---

# Governance Principles

The governance model is based on:

```text
Purpose Limitation

Canonical Owner Authority

Account Scope Validation

Untrusted Input Containment

Exact Financial Meaning

Explicit Currency and Locale

Versioned Contracts

Deterministic Transformation

Preview Before Commitment

Idempotent Canonical Mutation

Secure Artifact Delivery

Data Minimization

Bounded Retention

Separation of Duties

Reproducible Evidence

Lifecycle Management
```

---

# Purpose Limitation Governance

An Import, Export or Interoperability Type must be used only for its registered purpose.

A Transaction Import must not be reused silently as:

- A privileged Adjustment loader.
- Account ownership migration.
- reconciliation override.
- configuration loader.
- Security-control update.
- cross-Owner migration tool.

A standard Owner Export must not be reused silently as:

- An Audit Export.
- legal-discovery package.
- administrative cross-Owner dataset.
- external Provider bulk feed.
- public file-sharing artifact.

Purpose changes require:

- New Type or Type version.
- schema review.
- field review.
- financial review.
- Security review.
- Privacy review.
- retention review.
- Support review.
- test updates.

---

# Canonical Scope Governance

Every operation must define:

```text
Canonical Owner

Actor

Account scope

Resource scope

Period

Currency scope

Data boundary

Environment

Purpose

Authority
```

Scope must be resolved server-side.

---

# Governance Roles

Recommended governance roles include:

```text
Data Exchange Product Owner

Import Domain Owner

Export Domain Owner

Data Portability Owner

Interoperability Owner

Schema Registry Owner

Parser Owner

Serializer Owner

Mapping Policy Owner

Validation Policy Owner

Duplicate Policy Owner

Conflict Policy Owner

Financial Import Owner

Financial Export Owner

Security Owner

Privacy Owner

Accessibility Owner

Object Storage Owner

Operations Owner

Support Workflow Owner

Audit and Evidence Owner

Migration Owner

Release Manager
```

One individual may hold multiple roles.

Responsibilities must remain explicit.

---

# Data Exchange Product Owner

The Data Exchange Product Owner is responsible for:

- Owner-facing Import workflow.
- Owner-facing Export workflow.
- supported formats.
- mapping experience.
- Preview experience.
- duplicate-review experience.
- conflict-review experience.
- progress states.
- file-retention communication.
- Product acceptance.

---

# Import Domain Owner

The Import Domain Owner is responsible for:

- Import Type Registry.
- Import Job lifecycle.
- upload architecture.
- parsing workflow.
- normalization architecture.
- mapping architecture.
- validation architecture.
- Preview architecture.
- commit architecture.
- Import history.
- Import retirement.

---

# Export Domain Owner

The Export Domain Owner is responsible for:

- Export Type Registry.
- Export Job lifecycle.
- source-boundary behavior.
- Export projections.
- serialization.
- verification.
- download authorization.
- expiration.
- destruction.
- Export retirement.

---

# Data Portability Owner

The Data Portability Owner is responsible for:

- Owner portability requests.
- Privacy portability packages.
- data-category inventory.
- portability exclusions.
- machine-readable formats.
- secure delivery.
- portability completeness.
- portability retention.

---

# Interoperability Owner

The Interoperability Owner is responsible for:

- Interoperability Contract Registry.
- Provider relationships.
- external Authentication.
- external schemas.
- inbound and outbound idempotency.
- Provider correction Events.
- external reconciliation.
- contract migration.
- Provider retirement.

---

# Schema Registry Owner

The Schema Registry Owner is responsible for:

- Import schemas.
- Export schemas.
- bidirectional schemas.
- field definitions.
- semantic versioning.
- compatibility.
- deprecation.
- test fixtures.
- schema documentation.

---

# Parser Owner

The Parser Owner is responsible for:

- Parser Registry.
- supported formats.
- parsing limits.
- Security isolation.
- fuzz testing.
- malformed-file behavior.
- dependency management.
- Parser migration.
- Parser retirement.

---

# Serializer Owner

The Serializer Owner is responsible for:

- Export format generation.
- formula-injection protection.
- exact monetary serialization.
- date serialization.
- file integrity.
- Accessibility where supported.
- dependency management.
- serializer migration.
- serializer retirement.

---

# Mapping Policy Owner

The Mapping Policy Owner is responsible for:

- Mapping Profile Registry.
- field aliases.
- Account mapping.
- Category mapping.
- transformation Rules.
- saved mapping profiles.
- mapping invalidation.
- AI-assisted mapping controls.

---

# Validation Policy Owner

The Validation Policy Owner is responsible for:

- Validation Rule Registry.
- error codes.
- warning codes.
- structural validation.
- relationship validation.
- commit-time revalidation.
- override policy.
- validation monitoring.

---

# Duplicate Policy Owner

The Duplicate Policy Owner is responsible for:

- Duplicate Policy Registry.
- duplicate Type definitions.
- exact-match fields.
- external-identity handling.
- similarity thresholds.
- Owner decisions.
- financial restrictions.
- false-positive monitoring.

---

# Conflict Policy Owner

The Conflict Policy Owner is responsible for:

- Import Conflict Types.
- resolution options.
- current-state validation.
- Owner review.
- administrative review.
- conflict expiration.
- conflict Evidence.

---

# Financial Import Owner

The Financial Import Owner is responsible for:

- Exact amount parsing.
- currency validation.
- Transaction direction.
- Account compatibility.
- Transfer recognition.
- Budget and Goal semantics.
- reconciliation restrictions.
- financial duplicate prevention.
- post-Import recalculation.

---

# Financial Export Owner

The Financial Export Owner is responsible for:

- Exact amount serialization.
- currency representation.
- summary-detail equality.
- source boundaries.
- financial schema.
- financial PDF accuracy.
- round-trip verification.
- Export correction.

---

# Security Owner

The Import and Export Security Owner is responsible for:

- File quarantine.
- malware scanning.
- Parser isolation.
- archive protection.
- XML protection.
- macro protection.
- formula-injection protection.
- upload and download authorization.
- external Provider Authentication.
- abuse prevention.
- Security Incident response.

---

# Privacy Owner

The Import and Export Privacy Owner is responsible for:

- Data minimization.
- Source File retention.
- Raw Record retention.
- Export field minimization.
- Privacy portability.
- local and object-storage deletion.
- Provider data processing.
- Support access.
- Privacy Incident response.

---

# Accessibility Owner

The Accessibility Owner is responsible for:

- Accessible file selection.
- accessible progress.
- accessible mapping.
- accessible validation results.
- duplicate and Conflict review.
- accessible Export status.
- accessible PDF or document output where supported.
- keyboard and screen-reader testing.

---

# Object Storage Owner

The Object Storage Owner is responsible for:

- Quarantine storage.
- Export storage.
- encryption.
- environment isolation.
- lifecycle policies.
- object integrity.
- secure deletion.
- storage migration.
- backup behavior.

---

# Operations Owner

The Operations Owner is responsible for:

- Upload capacity.
- scan capacity.
- Parser workers.
- commit workers.
- Export workers.
- queues.
- Retry.
- storage health.
- destruction Jobs.
- SLOs.
- operational runbooks.
- Incident coordination.

---

# Support Workflow Owner

The Support Workflow Owner is responsible for:

- Safe Import diagnostics.
- safe Export diagnostics.
- Support permissions.
- support repair procedures.
- Import and Export escalation.
- Support training.
- evidence-preserving workflows.

---

# Audit and Evidence Owner

The Audit and Evidence Owner is responsible for:

- Import lifecycle Evidence.
- Export lifecycle Evidence.
- Preview-confirmation Evidence.
- duplicate-decision Evidence.
- override Evidence.
- download Evidence.
- destruction Evidence.
- Incident Evidence.
- evidence retention.

---

# Governance Responsibility Matrix

| Capability | Product | Domain | Financial | Security | Privacy | Accessibility | Operations |
|---|---|---|---|---|---|---|---|
| Import Type | Required | Required | Required where applicable | Required | Required | Required | Required |
| Export Type | Required | Required | Required where applicable | Required | Required | Required | Required |
| Schema | Required | Required | Required where applicable | Required | Required | As applicable | Required |
| Parser | As applicable | Required | As applicable | Required | Required | As applicable | Required |
| Mapping | Required | Required | Required where applicable | Required | Required | Required | Required |
| Validation | Required | Required | Required where applicable | Required | Required | Required | Required |
| Download | Required | Required | As applicable | Required | Required | Required | Required |
| Interoperability | Required | Required | Required where applicable | Required | Required | As applicable | Required |
| Migration | Required | Required | Required | Required | Required | Required | Required |

---

# Import Type Governance

Every Production Import must reference an active registered Import Type.

A Type must define:

```text
Purpose

Source Types

Target Resource Types

Supported formats

Supported schemas

Supported locales

Supported currencies

File limits

Record limits

Preview policy

Confirmation policy

Partial-commit policy

Duplicate policy

Conflict policy

Retention policy

Owner

Version
```

---

# Import Type Semantic Versioning

A new Import Type version is required when changing:

- Purpose.
- target Resource meaning.
- monetary interpretation.
- Account mapping behavior.
- duplicate behavior.
- commit policy.
- reconciliation behavior.
- required confirmation.
- Source File retention.
- Owner-visible final-state meaning.

---

# Import Type Review Frequency

Active Import Types should be reviewed periodically for:

- Usage.
- failure rates.
- duplicate rates.
- unsupported file patterns.
- stale schemas.
- Security findings.
- financial defects.
- Support volume.
- Privacy impact.
- accessibility defects.

---

# Export Type Governance

Every Production Export must reference an active registered Export Type.

An Export Type must define:

```text
Purpose

Source Resource Types

Owner and Account scope

Supported formats

Supported schemas

Source boundary

Maximum period

Maximum record count

Maximum file size

Reauthentication

Download policy

Retention

Destruction

Accessibility

Owner

Version
```

---

# Export Type Semantic Versioning

A new Export Type version is required when changing:

- Purpose.
- data categories.
- scope.
- field classification.
- source boundary.
- financial meaning.
- download behavior.
- reauthentication.
- retention.
- destruction.
- external compatibility.

---

# Schema Governance

Data Exchange Schemas are controlled contracts.

They must not be modified directly in Production without versioned review.

---

# Schema Ownership

Every schema must have one accountable owner and at least one approved technical reviewer.

---

# Schema Field Removal

Removing a field requires:

- Consumer inventory.
- compatibility review.
- migration period.
- documentation.
- test fixture update.
- external-system coordination where applicable.
- historical-reader review.

---

# Schema Field Addition

An added field must define:

- Required or optional.
- default or null behavior.
- classification.
- Import behavior.
- Export behavior.
- old-client behavior.
- external-consumer behavior.

---

# Schema Field Meaning Change

Changing field meaning requires a new schema version.

A field named:

```text
amount
```

must not change from:

```text
Signed exact amount
```

to:

```text
Absolute amount with separate direction
```

within the same schema version.

---

# Schema Currency Governance

Every monetary field must either:

- Include currency.
- inherit currency through one explicit registered Rule.
- be prohibited when currency is unresolved.

---

# Schema Locale Governance

A schema must identify whether values are:

```text
Locale-neutral

Source-locale formatted

Owner-locale formatted

Provider-defined
```

---

# Schema Date Governance

A schema must distinguish:

```text
Date-only

Local date and time

Offset date and time

UTC instant

Period

Year and month
```

---

# Schema Identifier Governance

External identifiers and canonical identifiers must remain distinct fields.

---

# Parser Governance

Parsers are high-risk Security components.

Every Parser release must declare:

- Parser version.
- dependency versions.
- supported formats.
- resource limits.
- known limitations.
- Security test result.
- fuzz-test result.
- performance result.
- rollback version.

---

# Parser Change Review

A Parser change requires review when it changes:

- Number parsing.
- date parsing.
- formula behavior.
- hidden-content behavior.
- encoding behavior.
- worksheet selection.
- duplicate-key behavior.
- malformed-file tolerance.
- limits.
- external-link handling.

---

# Parser Compatibility

A new Parser version must not reinterpret historical Source Files silently.

Historical Import Evidence should retain the original Parser version.

---

# Parser Disablement

A Parser must be disabled when:

- A critical vulnerability is discovered.
- malicious content can execute.
- exact values change unexpectedly.
- malformed files bypass limits.
- hidden data imports silently.
- formula handling becomes unsafe.
- Owner scope may be affected indirectly.

---

# Serializer Governance

Serializers must preserve:

- Schema meaning.
- exact money.
- currency.
- date semantics.
- null semantics.
- field classification.
- formula safety.
- file integrity.

---

# Serializer Versioning

Every generated Export should preserve the Serializer version.

---

# Serializer Disablement

A Serializer must be disabled when:

- It produces incorrect amounts.
- it omits currency.
- it changes date meaning.
- it exports unauthorized fields.
- formula-injection protection fails.
- files cannot be verified.
- files expose another Owner's data.

---

# Mapping Governance

Every mapping transformation must be:

- Registered.
- versioned.
- deterministic.
- typed.
- scope-aware.
- Security-reviewed where dynamic.
- financially reviewed where monetary.
- reversible or explainable.

---

# Mapping Profile Approval

System-default and Provider mapping profiles require formal approval.

Owner-scoped profiles may be activated through validated Owner confirmation.

---

# Mapping Profile Portability

Owner mapping profiles should not be reused by:

- Another Owner.
- another environment.
- another incompatible Import Type.
- another source schema.
- another Account currency.

---

# Mapping Override Governance

An override must not bypass:

- Owner validation.
- Account ownership.
- currency compatibility.
- malicious-file rejection.
- schema incompatibility.
- Security restrictions.

---

# Normalization Governance

Normalization Rules must define whether transformation is:

```text
Lossless

LossyWithWarning

LossyWithConfirmation

Prohibited
```

---

# Financial Normalization Governance

Financial normalization must define:

- Decimal separator.
- grouping separator.
- sign.
- scale.
- maximum precision.
- rounding policy.
- currency.
- range.
- zero behavior.
- overflow behavior.

---

# Generic Monetary Example

For a confirmed pt-BR source:

```text
Source:
R$ 1.250,45

Canonical amount:
"1250.45"

Currency:
BRL
```

The canonical amount must not become:

```text
"1.25045"

or

"125045"
```

through locale confusion.

---

# Validation Governance

Every validation Rule must have:

```text
Stable identifier

Stable error or warning code

Applicable Import Types

Applicable Resource Types

Severity

Logic version

Override behavior

Owner

Status
```

---

# Validation Rule Change

Changing a Rule may invalidate:

- Existing Preview.
- mapping decision.
- duplicate analysis.
- Conflict analysis.
- commit eligibility.

---

# Validation Override Separation

The Actor who defines a high-risk validation override should not be the only Actor approving and executing it.

---

# Duplicate Governance

Duplicate policies must distinguish:

```text
Certain identity duplicate

Strong external identity duplicate

Probable duplicate

Possible duplicate

Legitimate repeated activity
```

---

# Automatic Duplicate Suppression Governance

Automatic suppression is allowed only when:

- Stable identity evidence exists.
- Owner scope is verified.
- Account scope is verified.
- currency is compatible.
- financial effect is known.
- policy version is active.
- false-positive risk is acceptable.

---

# Similarity-Based Duplicate Governance

Similarity may recommend review.

It must not independently suppress legitimate repeated transactions.

---

# Duplicate Policy Review

Monitor:

- False positives.
- false negatives.
- repeated Provider records.
- Import Retry behavior.
- Owner reversals.
- Support complaints.
- financial corrections.

---

# Conflict Governance

Import Conflicts must be resolved through registered options.

A Conflict must not be hidden by:

- Automatically changing Account.
- silently changing currency.
- removing a row.
- overwriting canonical state.
- recreating a deleted Resource.
- bypassing reconciliation.

---

# Preview Governance

A Preview is a controlled decision artifact.

Every Preview must preserve:

```text
Source File hash

Parser version

Schema version

Locale decision

Currency decision

Mapping version

Validation policy versions

Duplicate policy version

Conflict policy version

Record set

Financial summaries

Expiration

Integrity reference
```

---

# Preview Approval

Confirmation must be performed by:

- The canonical Owner.
- an authorized member with sufficient scope.
- an approved administrative Actor under exceptional policy.

---

# Preview Separation of Duties

For high-impact administrative Imports, separate:

```text
Uploader

Mapper

Reviewer

Approver

Commit executor

Monitor
```

---

# Preview Regeneration

A Preview must be regenerated after:

- Source File change.
- Parser change affecting meaning.
- schema change.
- locale change.
- currency change.
- Account mapping change.
- validation Rule change.
- duplicate decision change.
- Conflict resolution.
- expiration.

---

# Commit Governance

Every canonical Import commit must:

- Reference one confirmed Preview.
- preserve stable operationId.
- preserve row operation IDs.
- validate Owner and Account scope.
- validate current canonical state.
- preserve lineage.
- preserve row results.
- publish synchronization changes.
- trigger required recalculation.
- produce Evidence.

---

# Commit Authority

Commit authority must be defined by Import Type.

Potential authority levels include:

```text
Owner

Authorized Member

Support-Assisted Owner

Administrative Reviewer

Migration Operator
```

---

# Administrative Import Governance

Administrative Imports are high risk.

They require:

- Approved source.
- controlled environment.
- test execution.
- synthetic or masked preflight.
- exact recipient scope.
- separation of duties.
- Preview.
- financial reconciliation.
- monitoring.
- rollback or forward correction.
- post-commit certification.

---

# Migration Import Governance

Migration Imports must additionally define:

- Legacy source authority.
- Resource identity mapping.
- Owner identity mapping.
- Account mapping.
- historical currency.
- historical time zone.
- opening balances.
- duplicate overlap with current data.
- reconciliation strategy.
- cutover boundary.
- rollback or forward correction.
- migration Evidence.

---

# Export Governance

Every Export must:

- Use one active Export Type.
- use one active schema.
- use a verified source boundary.
- preserve canonical Owner.
- preserve Account scope.
- minimize fields.
- verify exact values.
- verify file integrity.
- use expiring authorization.
- follow destruction policy.

---

# Export Source Boundary Governance

An Export must not combine:

- Current Transactions.
- stale Account summaries.
- an older Budget Snapshot.
- a newer Goal Snapshot.

into one coherent-looking file without explicit partial or boundary disclosure.

---

# Export Verification Governance

The Actor or process verifying an Export should be independent from raw serialization logic where practical.

---

# Export Download Governance

Download authority must define:

- Eligible Actor.
- Owner.
- file.
- expiration.
- maximum downloads.
- reauthentication.
- revocation.
- environment.
- logging.
- rate limits.

---

# Export Sharing Governance

External sharing requires a separate Sharing capability.

An ordinary Export download authorization must not be used as a shareable public link.

---

# Data Portability Governance

Portability workflows must identify:

- Request authority.
- requested categories.
- included data.
- excluded data.
- unavailable data.
- source systems.
- schema.
- file count.
- expiration.
- secure delivery.
- destruction.

---

# Privacy Portability Governance

Privacy portability must coordinate with:

- Identity verification.
- Privacy request state.
- legal timelines.
- data inventory.
- deletion requests.
- Legal Hold.
- third-party data.
- Device-only data limitations.

---

# Interoperability Governance

Every external system integration must have:

```text
Registered Provider or system

Contract owner

Authentication model

Authorization model

Owner relationship model

Schema versions

Identifier model

Currency model

Date model

Idempotency model

Retry model

Error model

Retention model

Incident contact

Retirement plan
```

---

# External Provider Governance

A known Provider remains untrusted for canonical financial meaning until Nexio validation completes.

---

# External Contract Change

A Provider contract change requires:

- New contract or schema version.
- backward compatibility review.
- test payloads.
- idempotency review.
- correction Event review.
- Security review.
- Privacy review.
- rollout plan.
- rollback.

---

# External Relationship Revocation

When an Owner revokes an external relationship:

- Stop future inbound operations.
- stop outbound operations.
- revoke credentials or tokens.
- invalidate pending Jobs.
- preserve accepted canonical Resources.
- preserve lineage.
- update Support state.
- schedule Provider data deletion where applicable.

---

# File Retention Governance

Every file category must have a Retention Policy.

Potential categories include:

```text
Clean Import Source File

Rejected Import Source File

Malicious Source File

Raw Parser Output

Normalized Records

Import Preview

Completed Import Evidence

Export Artifact

Privacy Export

Support Export

Administrative Export

Temporary Processing File
```

---

# Retention Policy Record

Recommended fields:

```text
dataExchangeRetentionPolicyId

artifactType

state

minimumRetention

maximumRetention

legalHoldBehavior

privacyDeletionBehavior

backupBehavior

destructionMethod

owner

version

status
```

---

# Retention Minimization

Raw uploaded content should generally have shorter retention than canonical imported Resources and Import Evidence.

---

# Retention Extension

Retention extension requires:

- Reason.
- authority.
- new expiration.
- Privacy review.
- Security review where applicable.
- Audit Evidence.

---

# Destruction Governance

Destruction must be:

- Scheduled.
- idempotent.
- verifiable.
- storage-aware.
- backup-aware.
- Legal-Hold-aware.
- observable.

---

# Destruction Verification

A destruction result should identify:

```text
Primary object removed

Temporary files removed

Derived caches removed

Download authorizations revoked

Search indexes cleared

Backup lifecycle scheduled

Exceptions
```

---

# Security Governance

Security controls must govern:

- File upload.
- quarantine.
- scan.
- Parser.
- serializer.
- mapping.
- commit.
- storage.
- download.
- external transport.
- administrative access.
- Support access.

---

# Security Capabilities

Potential administrative capabilities include:

```text
IMPORT_TYPE_VIEW

IMPORT_TYPE_EDIT

IMPORT_SCHEMA_EDIT

IMPORT_PARSER_ACTIVATE

IMPORT_MAPPING_APPROVE

IMPORT_OVERRIDE_REQUEST

IMPORT_OVERRIDE_APPROVE

IMPORT_ADMIN_COMMIT

EXPORT_TYPE_EDIT

EXPORT_SCHEMA_EDIT

EXPORT_INVALIDATE

EXPORT_DOWNLOAD_PRIVILEGED

PORTABILITY_REQUEST_PROCESS

INTEROP_CONTRACT_EDIT

ARTIFACT_RETENTION_OVERRIDE

DATA_EXCHANGE_INCIDENT_VIEW
```

---

# Separation of Duties

A single Actor should not normally:

- Upload an administrative file.
- define its mapping.
- approve its Preview.
- execute commitment.
- certify results.

A single Actor should not normally:

- Request a cross-Owner administrative Export.
- approve it.
- generate it.
- download it.
- certify destruction.

---

# Upload Token Security

Upload tokens must be:

- Short-lived.
- object-bound.
- Import-bound.
- Owner-bound.
- size-bound.
- nonenumerable.
- revocable.

---

# Download Token Security

Download tokens must be:

- Short-lived.
- Export-bound.
- Owner-bound.
- purpose-bound.
- revocable.
- excluded from logs.
- protected from referrer leakage.
- invalid after file invalidation.

---

# Object Storage Access

Application servers and workers should use least-privilege object access.

A Parser worker should not have unrestricted access to all Export files.

An Export worker should not have unrestricted access to unrelated Import quarantine objects.

---

# Antivirus and Scanner Governance

Scanner configuration and engine versions must be inventoried.

A scanner update should be tested for:

- false positives.
- false negatives.
- supported formats.
- performance.
- quarantine behavior.
- failure handling.

---

# Formula-Injection Governance

Formula protection must be part of:

- Export schema.
- Serializer implementation.
- validation.
- testing.
- Incident response.

---

# Privacy Governance

Privacy controls must govern:

- Uploaded content.
- raw fields.
- mapping data.
- Preview content.
- Export fields.
- download metadata.
- Provider processing.
- retention.
- destruction.
- Support access.
- AI use.

---

# Field Classification Registry

Every imported or exported field should identify:

```text
Classification

Purpose

Owner visibility

Support visibility

Provider visibility

Export eligibility

Import eligibility

Retention

Masking

Encryption
```

---

# Raw File Access

Ordinary Product and Support interfaces should not provide unrestricted raw Source File download.

---

# Export Field Minimization

A requested format must not automatically include every database column.

---

# External Provider Privacy Review

Every external interoperability Provider requires review of:

- Data categories.
- processing region.
- retention.
- subprocessors.
- Security controls.
- deletion.
- Incident notification.
- tracking.
- contractual safeguards.

---

# AI Governance

AI may assist with limited Import, Export and interoperability tasks.

---

# Allowed AI Uses

AI may assist with:

- Suggesting field mappings.
- explaining validation errors.
- ranking duplicate candidates.
- drafting schema documentation.
- generating test cases.
- detecting unusual headers.
- drafting accessible error messages.
- summarizing safe Import results.
- analyzing minimized operational metrics.

---

# Forbidden AI Uses

AI must not:

- Resolve canonical Owner.
- choose another Owner's Account.
- approve currency.
- invent exchange rates.
- create authoritative monetary values.
- decide reconciliation overrides.
- suppress financial duplicates independently.
- commit imported Resources.
- approve administrative Imports.
- authorize Export download.
- choose Export fields outside the schema.
- certify file integrity.
- approve Privacy Export completeness.
- approve external contract changes independently.
- claim tests passed without execution.

---

# AI Mapping Governance

AI mapping suggestions must provide:

- Suggested source field.
- suggested canonical field.
- confidence.
- explanation.
- detected risks.
- required confirmation.

---

# AI Duplicate Governance

AI may rank possible duplicates.

A deterministic policy or human decision must establish the final financial outcome.

---

# AI Prompt Safety

Untrusted file content must be isolated from:

- System instructions.
- tool authority.
- credential context.
- unrestricted database access.
- external network actions.

---

# Accessibility Governance

Accessibility requirements apply throughout the lifecycle.

---

# Accessible Import States

Every state should have understandable text.

Examples:

```text
Your file is being checked for safety.

Your file is ready for review.

Three rows need attention.

The Import completed with two rejected rows.

The Import could not be completed. No financial records were added.
```

---

# Accessible Validation

Validation messages should identify:

- Row or record.
- field.
- problem.
- expected format.
- financial consequence.
- available correction.

---

# Accessible Financial Example

```text
Row 12

Imported amount:
R$ 1.250,45

Issue:
The Account uses USD.

Action:
Select a BRL Account or exclude this row.
```

---

# Accessible Export Files

Where the format supports Accessibility, generated documents should include:

- Language metadata.
- logical headings.
- table headers.
- reading order.
- meaningful file title.
- page numbers.
- currency labels.
- alternative text where relevant.

---

# Support Governance

Support access must remain case-scoped and minimized.

---

# Support Capabilities

Potential safe capabilities include:

```text
IMPORT_STATUS_VIEW_SAFE

IMPORT_STAGE_VIEW_SAFE

IMPORT_PREVIEW_COUNT_VIEW

IMPORT_RETRY_REQUEST

IMPORT_ESCALATE_FINANCIAL_DEFECT

EXPORT_STATUS_VIEW_SAFE

EXPORT_INVALIDATION_REQUEST

EXPORT_REGENERATION_REQUEST

DATA_EXCHANGE_INCIDENT_REPORT
```

---

# Support-Prohibited Actions

Support must not:

- Change the canonical Owner.
- map another Owner's Account.
- alter exact imported amounts.
- bypass file scanning.
- mark invalid rows committed.
- change row operation IDs.
- recreate unknown-outcome Imports blindly.
- extend download tokens manually.
- download complete Owner Exports routinely.
- delete canonical financial Resources directly.

---

# Support Import Retry

Support may request Retry only when:

- The Import remains valid.
- Source File remains available and clean.
- operation identity is preserved.
- Preview remains valid where required.
- duplicate risk is controlled.
- the failure is Retryable.
- the action is audited.

---

# Support Export Regeneration

Regeneration must create or use an approved new Export operation and must clarify whether it uses:

- Original source boundary.
- current canonical data.

---

# Audit Governance

Material Events should include:

```text
Import Type activated

Export Type activated

Schema activated

Parser activated

Serializer activated

Mapping profile approved

Validation override approved

Administrative Import approved

Import commit started

Import partially completed

Export generated

Export invalidated

Export downloaded

Retention extended

Artifact destroyed

Provider contract changed

Cross-Owner attempt detected

Data Exchange Incident opened
```

---

# Data Exchange Evidence Record

Recommended structure:

```text
dataExchangeEvidenceId

eventType

importJobId

exportJobId

interoperabilityOperationId

ownerScope

accountScope

actorReference

sourceFileReference

schemaVersion

parserVersion

serializerVersion

mappingVersion

policyVersions

operationId

previousState

newState

reason

occurredAt

integrityReference
```

---

# Evidence Minimization

Evidence must preserve proof without storing unrestricted Source File or Export contents unnecessarily.

---

# Operations Governance

Operations must maintain:

- Capacity plans.
- worker pools.
- scan capacity.
- Parser isolation.
- commit queues.
- Export queues.
- storage capacity.
- expiration Jobs.
- destruction Jobs.
- Provider health.
- SLOs.
- alerts.
- runbooks.
- Incident response.

---

# Required Operational Runbooks

Required runbooks should include:

```text
Upload Failure

Malware Detection

Parser Failure

Parser Resource Exhaustion

Locale Misinterpretation

Currency Misinterpretation

Duplicate Financial Import

Import Commit Unknown Outcome

Import Partial Completion

Recalculation Failure

Export Integrity Failure

Unauthorized Download Attempt

Cross-Owner Export

Formula-Injection Defect

Storage Expiration Failure

Artifact Destruction Failure

Provider Contract Failure

Privacy Export Failure
```

---

# Incident Architecture

Import and Export Incidents may include:

```text
Cross-Owner Import

Cross-Owner Export

Incorrect Account mapping

Incorrect currency interpretation

Incorrect decimal interpretation

Incorrect date interpretation

Duplicate committed financial record

Malware execution

Parser escape

Archive traversal

Formula injection

Unauthorized Export download

Wrong Export field scope

Incorrect financial Export

Expired Preview commitment

Source lineage loss

Retention failure

Destruction failure

Provider replay defect

Privacy portability defect

Administrative misuse

AI mapping defect
```

---

# Incident Severity Factors

Evaluate:

```text
Number of Owners

Financial amount

Cross-Owner exposure

Security impact

Privacy impact

Number of committed Resources

Number of downloaded files

Provider scope

Duration

Retention state

Reversibility

Reconciliation impact

Evidence completeness
```

---

# Critical Incidents

Examples include:

```text
Cross-Owner Import commitment

Cross-Owner Export generation

Cross-Owner Export download

Malware or macro execution

Unauthorized administrative Import

Duplicate committed financial effects caused by idempotency failure

Export containing another Owner's data

AI-invented monetary value committed

Permanent unrestricted Export URL exposing sensitive data
```

---

# Incident Response Sequence

```text
Detect

↓

Stop affected Import, Export, Parser, Serializer or Provider path

↓

Preserve Evidence

↓

Identify Owner, Account, file, Job and operation scope

↓

Identify canonical Resources created or changed

↓

Identify generated and downloaded artifacts

↓

Revoke unsafe authorization

↓

Quarantine or destroy unsafe files

↓

Correct canonical financial state through governed operations

↓

Recalculate affected domains

↓

Correct schema, mapping, Parser or Serializer

↓

Verify Owner isolation and exact values

↓

Communicate verified impact where required

↓

Review root cause
```

---

# Cross-Owner Import Incident

Required response:

```text
Stop the Import path.

Block the affected Import Type or mapping.

Identify source and affected Owners.

Identify committed Resources.

Preserve Import lineage and operation IDs.

Prevent further synchronization publication where possible.

Correct canonical Resources through governed financial procedures.

Invalidate affected Reports and balances.

Notify Security and Privacy.

Execute cross-Owner regression tests.
```

---

# Cross-Owner Export Incident

Required response:

- Invalidate the Export.
- revoke every download authorization.
- terminate active Download Sessions where possible.
- identify source and recipient Owners.
- determine whether the file was downloaded.
- preserve download Evidence.
- destroy or quarantine affected artifacts.
- notify Security and Privacy.
- correct Export scope logic.

---

# Incorrect Decimal or Locale Incident

Required response:

- Stop affected schema or mapping profile.
- preserve Source File and Preview Evidence.
- identify normalized and committed amounts.
- compare source representation with canonical values.
- block further commitment.
- correct committed financial Resources through governed operations.
- regenerate balances and Reports.
- update locale test fixtures.

---

# Incorrect Currency Incident

Required response:

- Stop affected Import Type or mapping.
- identify affected Accounts and Resources.
- prevent automatic conversion.
- preserve original and committed currencies.
- correct through financial correction workflow.
- invalidate affected Exports and Reports.
- add currency-mismatch tests.

---

# Duplicate Financial Import Incident

Required response:

- Stop affected commit Retry path.
- identify Import and row operation IDs.
- identify duplicate canonical Resources.
- preserve idempotency and lineage.
- prevent further retries.
- apply governed reversal or correction.
- recalculate financial state.
- add duplicate-replay tests.

---

# Malware Execution Incident

Required response:

- Isolate affected workers.
- stop Parser service.
- revoke affected credentials.
- preserve safe forensic Evidence.
- identify Source Files and Owners.
- inspect network and storage access.
- rotate secrets where required.
- patch or replace Parser.
- notify Security.
- verify no canonical or Export contamination.

---

# Formula-Injection Incident

Required response:

- Invalidate affected Export files.
- revoke download authority.
- identify downloaded files.
- disable affected Serializer version.
- correct formula-neutralization logic.
- regenerate safe Exports.
- notify Security and affected Owners where required.

---

# Unknown Import Commit Outcome Incident

Required response:

- Stop creation of replacement Import Jobs.
- query operation and row status.
- inspect idempotency records.
- identify committed and uncommitted rows.
- resume with the same identities.
- preserve partial state.
- correct operational tooling.

---

# Export Integrity Incident

Required response:

- Block download.
- invalidate file.
- preserve Serializer and schema versions.
- identify scope and exactness defect.
- regenerate only after correction.
- verify summary-detail equality.
- inspect other files from the same Serializer version.

---

# Retention Failure Incident

Required response:

- Identify retained artifacts.
- stop new retention extension.
- revoke download access.
- execute destruction.
- inspect backup lifecycle.
- notify Privacy and Security where required.
- correct lifecycle policy.

---

# Privacy Portability Incident

Required response:

- Stop package delivery.
- identify omitted or incorrect categories.
- verify Owner scope.
- revoke download access.
- correct data inventory.
- regenerate under the same verified request where allowed.
- preserve Privacy request Evidence.

---

# Incident Closure

Closure requires:

```text
□ Unsafe processing paths are disabled or corrected.

□ affected Jobs and files are identified.

□ unauthorized download authority is revoked.

□ canonical financial corrections are complete.

□ balances and Reports are recalculated.

□ affected schemas and policies are versioned.

□ regression tests pass.

□ monitoring is updated.

□ Owner communication is complete where required.

□ root cause is documented.

□ follow-up actions have owners.
```

---

# Testing Governance

Testing must cover:

```text
Upload

Quarantine

Scanning

Format detection

Encoding

Locale

Currency

Parsers

Schemas

Normalization

Mapping

Validation

Duplicates

Conflicts

Preview

Commit

Recalculation

Export generation

Serialization

Verification

Download

Retention

Destruction

Interoperability

Owner isolation

Financial integrity

Security

Privacy

Accessibility

Migration

Recovery
```

---

# File Upload Tests

Verify:

- Valid file.
- oversized file.
- zero-byte file.
- interrupted upload.
- duplicate part.
- wrong part order.
- expired Session.
- wrong Owner.
- wrong Import Job.
- replayed upload token.
- content-hash mismatch.

---

# Security Scan Tests

Verify:

- Clean file.
- malicious file.
- suspicious file.
- scan timeout.
- scanner unavailable.
- false-positive review.
- encrypted file.
- unsupported archive.
- quarantine release.

---

# Archive Tests

Verify:

- Safe archive.
- excessive nesting.
- high compression ratio.
- excessive entries.
- path traversal.
- absolute path.
- symbolic-link escape.
- oversized uncompressed content.

---

# Parser Fuzz Tests

Fuzz testing should cover:

- Invalid bytes.
- malformed structures.
- large fields.
- deep nesting.
- duplicate keys.
- broken quotes.
- invalid date serials.
- corrupted worksheet relationships.
- circular references.
- hidden formulas.
- invalid shared strings.

---

# CSV Tests

Verify:

- Comma delimiter.
- semicolon delimiter.
- tab delimiter.
- pt-BR decimals.
- quoted delimiter.
- multiline value.
- duplicate header.
- blank header.
- headerless schema.
- BOM.
- invalid encoding.
- line-ending variants.
- formula text.

---

# JSON Tests

Verify:

- Exact amount string.
- unsafe numeric amount.
- duplicate keys.
- excessive depth.
- unknown fields.
- null semantics.
- array and object shape.
- invalid Unicode.
- unsupported schema.

---

# XLSX Tests

Verify:

- Multiple worksheets.
- hidden worksheet.
- hidden row.
- hidden column.
- formula cell.
- cached formula value.
- macro-enabled workbook.
- external link.
- merged cell.
- 1900 date system.
- 1904 date system.
- oversized worksheet.
- text-formatted numbers.

---

# Locale Tests

Verify:

- Explicit pt-BR.
- explicit en-US.
- ambiguous decimal.
- ambiguous date.
- mismatched delimiter.
- grouping separator.
- currency symbol ambiguity.
- Owner confirmation.
- locale change after Preview.

---

# pt-BR Monetary Test Vectors

```text
Input:
1.250,45

Expected canonical:
"1250.45"

Currency:
BRL
```

```text
Input:
-125,00

Expected canonical:
"-125.00"

Currency:
BRL
```

```text
Input:
(R$ 89,90)

Expected canonical:
"-89.90"

Currency:
BRL
```

---

# Money Tests

Verify:

- Zero.
- positive.
- negative.
- maximum value.
- excessive precision.
- grouping.
- invalid multiple separators.
- scientific notation.
- currency mismatch.
- double-negation.
- overflow.
- rounding policy.

---

# Date Tests

Verify:

- Valid leap day.
- invalid leap day.
- invalid month.
- two-digit year.
- date-only.
- timestamp with offset.
- timestamp without offset.
- daylight-saving boundary.
- spreadsheet serial.
- future range.
- historical range.

---

# Mapping Tests

Verify:

- Direct mapping.
- alias.
- constant.
- lookup.
- transformation.
- Account mapping.
- ambiguous Account.
- closed Account.
- Category mapping.
- missing Category.
- stale mapping.
- cross-Owner mapping.
- AI suggestion rejection.

---

# Validation Tests

Verify:

- Missing required field.
- invalid amount.
- unsupported currency.
- invalid Account.
- invalid Category.
- closed Account.
- reconciliation lock.
- invalid Resource state.
- excessive length.
- forbidden field.
- Feature disabled.
- stale policy version.

---

# Duplicate Tests

Verify:

- Same operation.
- same file.
- same row.
- same external ID.
- same recurring occurrence.
- same Transfer.
- exact canonical candidate.
- probable candidate.
- legitimate repeated purchase.
- cross-Owner exclusion.
- Import Retry.

---

# Conflict Tests

Verify:

- Account closed after Preview.
- Category deleted after Preview.
- reconciliation completed.
- permission revoked.
- external identifier collision.
- schema retired.
- financial policy changed.
- mapping invalidated.
- Conflict resolution revalidation.

---

# Preview Tests

Verify:

- Summary equality.
- multi-currency separation.
- stable pagination.
- filtering.
- bulk decision.
- stale Preview version.
- expiration.
- invalidation.
- accessible row errors.
- accessible financial summaries.

---

# Commit Tests

Verify:

- Atomic success.
- Atomic rollback.
- per-Account commit.
- per-batch partial success.
- row-level partial success.
- Retry.
- unknown outcome.
- worker redelivery.
- duplicate row operation.
- commit-time Conflict.
- cancellation.
- recalculation failure.

---

# Reversal and Correction Tests

Verify:

- Unmodified imported Transaction.
- reconciled Transaction.
- manually modified Transaction.
- Transfer.
- Goal Contribution.
- Budget.
- differential Import.
- lineage preservation.
- Report invalidation.

---

# Export Tests

Verify:

- Owner scope.
- Account scope.
- period.
- filters.
- source boundary.
- exact money.
- currency.
- dates.
- null semantics.
- stable ordering.
- partitioning.
- large file.
- Retry.
- integrity verification.

---

# Formula-Injection Export Tests

Verify text values beginning with:

```text
=

+

-

@

tab

carriage return
```

Also verify that:

```text
-R$ 125,00
```

or canonical:

```text
-125.00
```

remains a valid negative monetary value rather than unsafe text execution.

---

# Download Tests

Verify:

- Valid authorization.
- expired authorization.
- revoked authorization.
- wrong Owner.
- wrong environment.
- exhausted download count.
- reauthentication required.
- invalidated file.
- range request.
- active Session revocation.
- URL logging prevention.

---

# Retention Tests

Verify:

- Source File expiration.
- Export expiration.
- malicious-file policy.
- Legal Hold.
- destruction Retry.
- backup lifecycle.
- temporary-file cleanup.
- search-index cleanup.
- revoked authorization.

---

# Interoperability Tests

Verify:

- Provider Authentication.
- signature.
- replay.
- wrong environment.
- schema version.
- external Owner relationship.
- inbound duplicate.
- outbound idempotency.
- correction Event.
- deletion Event.
- Provider outage.
- reconciliation.

---

# Owner-Isolation Tests

Verify:

- Another Owner's Account cannot be mapped.
- another Owner's Preview cannot be viewed.
- another Owner's Source File cannot be read.
- another Owner's Import cannot be committed.
- another Owner's Export cannot be generated.
- another Owner's Export cannot be downloaded.
- another Owner's mapping profile cannot be used.
- another Owner's external relationship cannot be used.

---

# Property-Based Tests

Potential invariants include:

```text
One row operationId produces at most one canonical financial effect.

Every committed imported Resource belongs to the Import Owner.

Every Export record belongs to the Export Owner and approved scope.

Every exact imported amount equals the committed canonical amount.

Every exact exported amount equals its canonical source amount.

A Preview cannot commit after expiration or material invalidation.

A malicious or unscanned file cannot enter canonical commitment.

An invalidated Export cannot be downloaded.

A destroyed artifact cannot retain active download authorization.

A duplicate external identity cannot create multiple canonical effects under one registered identity scope.
```

---

# Mutation Tests

Mutation testing should verify tests fail when:

- Owner validation is removed.
- Account validation is removed.
- scan verification is bypassed.
- locale confirmation is removed.
- currency validation is removed.
- operationId changes during Retry.
- Preview expiration is ignored.
- formula protection is removed.
- download expiration is removed.
- Export scope filter is removed.
- Tombstone or lineage is removed.
- AI suggestion becomes automatic commitment.

---

# Performance Tests

Performance testing should cover:

- Maximum file size.
- maximum row count.
- large CSV.
- large XLSX.
- many validation errors.
- many duplicate candidates.
- many Accounts.
- large Preview.
- large Export.
- partitioned Export.
- concurrent Jobs.
- scanner delay.
- object-storage latency.
- destruction backlog.

Performance optimization must not weaken:

- Owner isolation.
- exactness.
- scanning.
- validation.
- idempotency.
- Preview integrity.
- file verification.
- download authorization.

---

# Chaos Tests

Potential scenarios include:

```text
Upload interrupted

Scanner unavailable

Parser worker killed

Database failover during Import commit

Object storage timeout

Queue redelivery

Connection lost after row commit

Recalculation service unavailable

Export worker killed

Download authorization service unavailable

Destruction worker failure

Provider callback duplicated

Provider request delivered out of order
```

---

# Migration Architecture

Migrations may affect:

```text
Import Type versions

Export Type versions

Schemas

Parsers

Serializers

Mapping Profiles

Normalization Rules

Validation Rules

Duplicate Policies

Conflict Policies

Import Job schema

Export Job schema

Source File storage

Export File storage

Operation identities

Lineage schema

Interoperability contracts

Retention policies

Encryption
```

---

# Migration Principles

Every migration must:

- Preserve Owner scope.
- preserve Account scope.
- preserve Resource identity.
- preserve exact monetary values.
- preserve currencies.
- preserve dates.
- preserve operation IDs.
- preserve Preview state.
- preserve row results.
- preserve Import lineage.
- preserve Export source boundaries.
- preserve download revocation.
- preserve retention.
- preserve Evidence.
- be idempotent.
- be verifiable.
- support rollback or forward correction.

---

# Schema Migration

Recommended sequence:

```text
Register new schema.

↓

Deploy readers supporting old and new versions.

↓

Deploy new Parser or Serializer behavior.

↓

Update mapping and validation policies.

↓

Run compatibility fixtures.

↓

Activate for limited traffic.

↓

Monitor.

↓

Deprecate old schema.

↓

Retire after compatibility window.
```

---

# Parser Migration

A Parser migration must compare:

- Row counts.
- field values.
- exact amounts.
- dates.
- encoding.
- hidden content.
- formulas.
- error classifications.
- performance.

---

# Parser Shadow Mode

Shadow parsing may process clean retained test files using both Parser versions without committing Resources.

Differences must be reviewed before activation.

---

# Serializer Migration

A Serializer migration should compare:

- Schema validity.
- record counts.
- exact money.
- currencies.
- dates.
- file hashes.
- formula safety.
- file readability.
- Accessibility.

---

# Mapping Profile Migration

Mapping migration must preserve:

- Owner.
- source fingerprint.
- field mapping.
- Account mapping.
- Category mapping.
- currency Rules.
- transformation versions.
- status.

Stale profiles should be invalidated rather than applied incorrectly.

---

# Import Job Migration

In-progress Import Jobs require explicit handling.

Potential outcomes:

```text
Continue on old processing version

Migrate to new version

Invalidate Preview and regenerate

Cancel safely
```

---

# Export Job Migration

In-progress Export Jobs must preserve:

- source boundary.
- schema version.
- operationId.
- file state.
- verification state.
- authorization state.

---

# Storage Migration

Moving files between storage systems must preserve:

- Owner metadata.
- environment.
- content hash.
- encryption.
- expiration.
- access control.
- destruction schedule.
- Legal Hold.
- download invalidation.

---

# Encryption Migration

Encryption migration must define:

- Old-key access.
- new-key creation.
- re-encryption.
- interruption recovery.
- rollback.
- key destruction.
- audit.
- Owner and environment partitioning.

---

# Interoperability Contract Migration

A contract migration must preserve:

- Provider identity.
- Owner relationship.
- external identifiers.
- operation identity.
- schema meaning.
- correction behavior.
- Retry.
- reconciliation.
- old-version support window.

---

# Migration Verification

Verify:

```text
No Owner changed.

No Account scope changed.

No exact amount changed.

No currency changed.

No date meaning changed.

No operationId changed.

No Import lineage disappeared.

No Preview became commit-eligible incorrectly.

No Export source boundary changed.

No download authorization became broader.

No retention expiration changed without authority.

No formula protection regressed.

No Accessibility regression occurred.
```

---

# Migration Rollback

Rollback must define:

- Old schema compatibility.
- in-progress Jobs.
- newly committed Resources.
- generated Export files.
- active download authorizations.
- new operation records.
- storage location.
- Provider contract version.
- Evidence.

---

# Backup and Recovery

Backend backup and recovery should preserve:

- Import and Export Registries.
- schemas.
- mapping profiles.
- Validation Rules.
- duplicate policies.
- Conflict policies.
- Import Jobs.
- row results.
- operation identities.
- Import lineage.
- Export Jobs.
- file metadata.
- source boundaries.
- download authorization states.
- retention schedules.
- destruction states.
- Interoperability contracts.
- Evidence.

---

# File Recovery

Recovering metadata does not automatically justify restoring expired or destroyed files.

File restoration must respect:

- Expiration.
- Privacy deletion.
- Legal Hold.
- destruction policy.
- Security invalidation.
- download revocation.

---

# Import Recovery

After recovery:

- Confirm operation IDs.
- confirm committed row outcomes.
- confirm idempotency records.
- confirm canonical Resources.
- confirm synchronization publication.
- avoid reapplying accepted rows.
- regenerate Previews only when valid.
- preserve partial-state truth.

---

# Export Recovery

After recovery:

- Verify source boundaries.
- verify file integrity.
- revalidate expiration.
- revalidate Owner scope.
- revalidate download authority.
- block unknown or unverified files.
- regenerate through a new operation where required.

---

# Disaster-Recovery Priority

Recommended order:

```text
Canonical financial Resources and idempotency

↓

Owner and Account relationships

↓

Import lineage and row results

↓

Schemas and policies

↓

Synchronization publication

↓

Export metadata and revocation state

↓

Verified artifact availability

↓

Optional historical Source Files
```

---

# Disaster-Recovery Gate

Before resuming Import commitment or Export download:

```text
□ Canonical Owner relationships are verified.

□ Account ownership is verified.

□ idempotency records are available.

□ Import row outcomes are verified.

□ financial Resources are reconciled.

□ schemas are active.

□ Parser and Serializer versions are approved.

□ file integrity is verified.

□ download revocation state is available.

□ monitoring is active.
```

---

# Release Certification

Every release affecting data exchange must declare:

```text
Import Type versions

Export Type versions

Schema versions

Parser versions

Serializer versions

Mapping versions

Normalization versions

Validation versions

Duplicate policy versions

Conflict policy versions

Import Job schema version

Export Job schema version

Object Storage configuration version

Retention policy versions

Interoperability Contract versions

Migration state

Rollback artifact
```

---

# Release Gate

A release must not proceed when:

```text
Owner-isolation tests fail.

Account-isolation tests fail.

Exact-money tests fail.

Currency tests fail.

Locale tests fail.

Parser Security tests fail.

Formula-protection tests fail.

Preview-integrity tests fail.

Import idempotency tests fail.

Export scope tests fail.

Download authorization tests fail.

Retention or destruction tests fail.

Privacy portability tests fail.

Accessibility tests fail.

Rollback or safe forward correction is unavailable.
```

---

# Post-Release Verification

Review:

```text
Upload success

Scan health

Parser failures

Locale ambiguity

Currency mismatch

Mapping ambiguity

Validation failures

Duplicate rates

Preview invalidation

Import partial completion

Commit Retry

Recalculation health

Export integrity

Download failures

Cross-Owner metrics

Destruction backlog

Provider reconciliation

Support cases
```

---

# Deprecation Governance

Import Types, Export Types, schemas, Parsers, Serializers, mapping profiles and contracts may be deprecated.

---

# Deprecation Requirements

```text
□ Replacement is defined.

□ Active dependencies are inventoried.

□ in-progress Jobs are identified.

□ mapping compatibility is reviewed.

□ financial compatibility is reviewed.

□ external consumers are notified.

□ retention impact is reviewed.

□ Support guidance is updated.

□ retirement date is defined.

□ historical Evidence remains readable.
```

---

# Import Type Retirement

An Import Type is retired only when:

- No new Jobs can be created.
- in-progress Jobs are completed, migrated or cancelled.
- retained Previews cannot commit.
- mappings are retired or migrated.
- Support guidance is updated.
- historical Import history remains interpretable.

---

# Export Type Retirement

An Export Type is retired only when:

- No new Jobs can be created.
- active Jobs are completed or cancelled.
- existing files follow original expiration.
- active authorizations are honored or revoked through policy.
- historical metadata remains readable.

---

# Schema Retirement

Historical records must preserve the retired schema version.

---

# Parser Retirement

A retired Parser must not process new Source Files.

Historical Evidence must preserve its version.

---

# Serializer Retirement

A retired Serializer must not generate new files.

Existing verified files may remain downloadable until expiration unless invalidated.

---

# Contract Retirement

An external contract is retired when:

- Credentials are revoked.
- inbound traffic is rejected safely.
- outbound traffic stops.
- pending operations are resolved.
- Provider reconciliation completes.
- Owner relationships are updated.
- retention and deletion obligations are addressed.

---

# Definition of Ready

A data-exchange capability is ready when:

```text
□ Purpose is defined.

□ canonical Owner scope is defined.

□ Account scope is defined.

□ Import or Export Type is registered.

□ schema is registered.

□ format is defined.

□ Parser or Serializer is defined.

□ exact-money behavior is defined.

□ currency behavior is defined.

□ locale behavior is defined.

□ mapping is defined.

□ validation is defined.

□ duplicate behavior is defined.

□ Conflict behavior is defined.

□ Preview behavior is defined.

□ commit or generation behavior is defined.

□ retention is defined.

□ destruction is defined.

□ Security requirements are defined.

□ Privacy requirements are defined.

□ Accessibility requirements are defined.

□ monitoring is defined.

□ test fixtures exist.
```

---

# Definition of Implemented

A capability is implemented when:

```text
□ Registry records exist.

□ schemas exist.

□ Parser or Serializer exists.

□ Owner and Account validation exists.

□ stage orchestration exists.

□ operation identity exists.

□ row or record results exist.

□ Preview or source-boundary behavior exists.

□ file integrity exists.

□ monitoring hooks exist.
```

Implementation does not mean verified or releasable.

---

# Definition of Verified

A capability is verified when:

```text
□ Upload tests pass.

□ scan tests pass.

□ Parser tests pass.

□ locale tests pass.

□ currency tests pass.

□ exact-money tests pass.

□ mapping tests pass.

□ validation tests pass.

□ duplicate tests pass.

□ Conflict tests pass.

□ Preview tests pass.

□ commit tests pass.

□ Export tests pass.

□ download tests pass.

□ retention tests pass.

□ Owner-isolation tests pass.

□ Security tests pass.

□ Privacy tests pass.

□ Accessibility tests pass.
```

---

# Definition of Releasable

A capability is releasable when:

```text
□ Product approval is complete.

□ Domain approval is complete.

□ Financial review is complete where applicable.

□ Security review is complete.

□ Privacy review is complete.

□ Accessibility review is complete.

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

A capability is operationally verified when:

```text
□ Production Jobs complete correctly.

□ exact monetary values remain correct.

□ duplicate financial effects remain zero.

□ Export integrity remains healthy.

□ download authorization remains secure.

□ retention and destruction remain current.

□ Provider contracts remain reconciled.

□ Owner-isolation metrics remain zero.

□ no Critical data-exchange alert exists.
```

---

# Final Import Checklist

```text
□ Import Type is active.

□ Import Job ID exists.

□ operationId exists.

□ canonical Owner is verified.

□ Accounts belong to Owner.

□ Upload Session is valid.

□ Source File is quarantined.

□ file hash is preserved.

□ Security scan is complete.

□ Parser is active.

□ Parser version is preserved.

□ schema is active.

□ encoding is resolved.

□ locale is resolved.

□ currency is resolved.

□ mapping is complete.

□ exact amounts are valid.

□ dates are valid.

□ duplicate analysis is complete.

□ Conflict analysis is complete.

□ Preview version is current.

□ confirmation is valid.

□ commit policy is known.

□ row operation IDs exist.

□ lineage is preserved.

□ recalculation is planned.

□ retention is scheduled.
```

---

# Final Export Checklist

```text
□ Export Type is active.

□ Export Job ID exists.

□ operationId exists.

□ canonical Owner is verified.

□ Accounts belong to Owner.

□ Resource scope is authorized.

□ period is valid.

□ filters are registered.

□ source boundary is explicit.

□ schema is active.

□ Serializer is active.

□ exact money is preserved.

□ currency is explicit.

□ dates are correct.

□ formula protection is active.

□ record count is verified.

□ summary equality is verified.

□ content hash is verified.

□ file state is Ready.

□ download authorization is valid.

□ expiration is scheduled.

□ destruction is scheduled.
```

---

# Final Schema Checklist

```text
□ Schema ID exists.

□ schema version exists.

□ direction is defined.

□ format is defined.

□ Resource Types are defined.

□ field meanings are stable.

□ required fields are defined.

□ optional fields are defined.

□ null semantics are defined.

□ money representation is defined.

□ currency is defined.

□ dates are defined.

□ identifiers are defined.

□ locale behavior is defined.

□ classification is defined.

□ compatibility is defined.

□ deprecation is defined.
```

---

# Final Parser Checklist

```text
□ Parser is registered.

□ supported format is defined.

□ version is defined.

□ byte limit exists.

□ record limit exists.

□ field limit exists.

□ depth limit exists.

□ timeout exists.

□ memory limit exists.

□ network access is restricted.

□ formulas are not executed.

□ macros are not executed.

□ external entities are disabled.

□ Security tests pass.

□ fuzz tests pass.

□ rollback version exists.
```

---

# Final Mapping Checklist

```text
□ Mapping profile ID exists.

□ Owner scope is valid.

□ source fingerprint is valid.

□ schema version matches.

□ field mappings are complete.

□ transformations are registered.

□ Account mapping is valid.

□ Account currency is compatible.

□ Category mapping is valid.

□ unresolved fields are visible.

□ lossy transformations are disclosed.

□ AI suggestions are confirmed.

□ mapping version is preserved.
```

---

# Final Validation Checklist

```text
□ Validation Rules are active.

□ error codes are controlled.

□ warning codes are controlled.

□ structural validation passes.

□ field validation passes.

□ relationship validation passes.

□ Owner validation passes.

□ Account validation passes.

□ financial validation passes.

□ reconciliation restrictions pass.

□ duplicate policy is applied.

□ Conflict policy is applied.

□ overrides are authorized.

□ commit-time revalidation exists.
```

---

# Final Security Checklist

```text
□ Upload authorization is bounded.

□ Source File is private.

□ quarantine is enforced.

□ malware scanning is complete.

□ archives are bounded.

□ path traversal is blocked.

□ macros are not executed.

□ formulas are inert.

□ XML external entities are disabled.

□ Parser is isolated.

□ object storage is encrypted.

□ download authority is expiring.

□ download tokens are excluded from logs.

□ Provider Authentication is verified.

□ abuse rate limits are active.

□ cross-Owner tests pass.
```

---

# Final Privacy Checklist

```text
□ Source File retention is defined.

□ Raw Record retention is defined.

□ Preview retention is defined.

□ Export retention is defined.

□ field minimization is applied.

□ Support access is minimized.

□ Provider processing is reviewed.

□ Privacy deletion behavior is defined.

□ Legal Hold behavior is defined.

□ destruction is verifiable.

□ Device-only data limitations are disclosed.

□ portability exclusions are documented.
```

---

# Final Accessibility Checklist

```text
□ File selection is accessible.

□ upload progress is announced.

□ scan state is announced.

□ mapping controls have labels.

□ validation errors are navigable.

□ row status does not rely only on color.

□ duplicate review is understandable.

□ Conflict review is understandable.

□ exact monetary values are readable.

□ currency is announced.

□ Preview summaries are accessible.

□ commit progress is announced.

□ Export status is announced.

□ expiration is communicated.

□ generated documents are accessible where supported.
```

---

# Final Incident Checklist

```text
□ Incident category is defined.

□ severity is assigned.

□ affected Jobs are identified.

□ affected Owners are identified.

□ affected Accounts are identified.

□ Source Files are contained.

□ Export files are invalidated where required.

□ download authority is revoked.

□ operation IDs are preserved.

□ lineage is preserved.

□ canonical financial effects are verified.

□ correction or reversal is complete.

□ recalculation is complete.

□ regression tests pass.

□ root cause is documented.
```

---

# Final Acceptance Criteria

The Nexio Imports, Exports, Data Portability and Interoperability architecture is accepted only when:

621. Import and Export governance roles are documented.

622. Every governed capability has an accountable owner.

623. Every Production Import uses a registered Import Type.

624. Every Production Export uses a registered Export Type.

625. Every external integration uses a registered Interoperability Contract.

626. Every Import Type has one approved purpose.

627. Every Export Type has one approved purpose.

628. Import Types cannot be repurposed silently.

629. Export Types cannot be repurposed silently.

630. Semantic changes create new Type versions.

631. Canonical Owner scope is resolved server-side.

632. Account scope is validated server-side.

633. Uploaded Owner identifiers are never authoritative.

634. Uploaded Account ownership is never authoritative.

635. Every Import Type defines supported formats.

636. Every Import Type defines schemas.

637. Every Import Type defines locales.

638. Every Import Type defines currency behavior.

639. Every Import Type defines file limits.

640. Every Import Type defines record limits.

641. Every Import Type defines Preview behavior.

642. Every Import Type defines commit policy.

643. Every Import Type defines duplicate policy.

644. Every Import Type defines Conflict policy.

645. Every Import Type defines retention.

646. Every Export Type defines source Resources.

647. Every Export Type defines Account scope.

648. Every Export Type defines formats.

649. Every Export Type defines schemas.

650. Every Export Type defines source-boundary behavior.

651. Every Export Type defines maximum period.

652. Every Export Type defines maximum record count.

653. Every Export Type defines download policy.

654. Every Export Type defines retention.

655. Every Export Type defines destruction.

656. Every schema is registered.

657. Every schema has a stable identifier.

658. Every schema has an explicit version.

659. Every field has stable meaning.

660. Required fields are explicit.

661. optional fields are explicit.

662. unknown-field behavior is explicit.

663. null semantics are explicit.

664. monetary representation is explicit.

665. currency behavior is explicit.

666. date semantics are explicit.

667. identifier semantics are explicit.

668. locale behavior is explicit.

669. breaking changes create new schema versions.

670. field removals have compatibility plans.

671. field additions define old-consumer behavior.

672. field meaning cannot change inside one schema version.

673. external identifiers remain distinct from canonical identifiers.

674. Every Parser is registered.

675. Every Parser has an explicit version.

676. Parser dependencies are inventoried.

677. Parser limits are documented.

678. Parser network access is restricted where required.

679. Parser execution is isolated where required.

680. Parser changes affecting financial meaning require review.

681. Parser changes affecting formulas require review.

682. Parser changes affecting hidden content require review.

683. Parser changes affecting encoding require review.

684. Parser changes affecting dates require review.

685. Historical Imports preserve Parser versions.

686. Critical Parser vulnerabilities disable the affected Parser.

687. Every Serializer is registered.

688. Every Serializer has an explicit version.

689. Serializer dependencies are inventoried.

690. Serializers preserve exact money.

691. Serializers preserve currency.

692. Serializers preserve date meaning.

693. Serializers preserve null semantics.

694. Serializers preserve field classification.

695. Serializers protect against formula injection.

696. Incorrect Serializer versions can be disabled.

697. Every mapping transformation is registered.

698. Mapping transformations are versioned.

699. Mapping transformations are deterministic.

700. Mapping transformations are typed.

701. Mapping transformations cannot execute unrestricted code.

702. Owner mapping profiles remain Owner-scoped.

703. mapping profiles remain schema-scoped.

704. mapping profiles remain environment-scoped where required.

705. mapping profiles remain Account-compatible.

706. invalid mappings are invalidated.

707. Account mapping validates Owner.

708. Account mapping validates Account state.

709. Account mapping validates currency.

710. Category mapping validates Owner.

711. Category mapping prevents hierarchy cycles.

712. AI mapping remains advisory.

713. AI mapping requires confirmation.

714. AI cannot choose another Owner's Account.

715. Normalization Rules are registered.

716. Normalization distinguishes lossless and lossy transformation.

717. Lossy normalization is disclosed.

718. Silent monetary truncation is prohibited.

719. Exact amount is preserved through normalization.

720. Currency is preserved through normalization.

721. sign is preserved through normalization.

722. decimal scale behavior is explicit.

723. Rounding uses an approved policy.

724. Scientific notation is prohibited unless explicitly supported.

725. External identifiers preserve leading zeros.

726. Date-only values remain calendar dates.

727. Timestamps preserve offset or resolved time zone.

728. Device time zone is not assumed silently.

729. Every Validation Rule is registered.

730. Validation Rules have stable codes.

731. Validation Rule severity is explicit.

732. Validation overrides are governed.

733. Owner overrides cannot bypass Owner isolation.

734. Owner overrides cannot bypass Account ownership.

735. Owner overrides cannot bypass malicious-file rejection.

736. Owner overrides cannot bypass unsupported currency.

737. Administrative overrides preserve original results.

738. Validation changes invalidate affected Previews.

739. Financial validation preserves policy versions.

740. Reconciliation restrictions are validated.

741. Budget derived values are not imported as canonical definitions improperly.

742. Goal progress is not imported as canonical Contributions improperly.

743. opening balances follow a registered financial model.

744. privileged Adjustments require explicit authority.

745. Duplicate policies are registered.

746. duplicate Types are controlled.

747. stable identity duplicates are distinguished from similarity.

748. matching amount and date alone does not prove duplicate activity.

749. similarity produces review rather than automatic suppression by default.

750. automatic duplicate suppression requires strong registered evidence.

751. duplicate decisions preserve Evidence.

752. false-positive duplicate rates are monitored.

753. Import Conflicts are registered.

754. Import Conflict Types are controlled.

755. Conflicts remain distinct from validation failures.

756. Conflicts preserve current canonical state.

757. Conflicts cannot be resolved by silent overwrite.

758. Conflict resolution is revalidated before commitment.

759. Every Preview preserves Source File hash.

760. Every Preview preserves Parser version.

761. Every Preview preserves schema version.

762. Every Preview preserves locale decision.

763. Every Preview preserves currency decision.

764. Every Preview preserves mapping version.

765. Every Preview preserves policy versions.

766. Every Preview preserves exact record membership.

767. Every Preview preserves financial summaries.

768. Every Preview has expiration.

769. Expired Previews cannot commit.

770. Material changes regenerate the Preview.

771. High-impact administrative Previews use separation of duties.

772. Every canonical Import commit references a confirmed Preview where required.

773. Every Import commit preserves one stable operationId.

774. Every row preserves one stable row operationId.

775. Import Retry preserves operation identities.

776. Import Retry does not recreate committed rows.

777. Import commit validates current Owner.

778. Import commit validates current Account state.

779. Import commit validates current schema.

780. Import commit validates current financial policy.

781. Import commit preserves row-level results.

782. Import commit preserves Import lineage.

783. Import lineage preserves source record identity.

784. Import lineage preserves canonical Resource identity.

785. Import lineage preserves Resource version.

786. Corrections do not rewrite historical lineage.

787. Partial Imports preserve committed and uncommitted truth.

788. Cancellation does not claim rollback of committed data.

789. Unknown commit outcomes use status lookup or same-operation Retry.

790. Administrative Imports require approved source.

791. Administrative Imports require test execution.

792. Administrative Imports require Preview.

793. Administrative Imports require monitoring.

794. Administrative Imports require rollback or forward correction.

795. Migration Imports define legacy identity mapping.

796. Migration Imports define cutover boundary.

797. Migration Imports define duplicate overlap behavior.

798. Migration Imports define reconciliation behavior.

799. Every Export uses one active schema.

800. Every Export uses one explicit source boundary.

801. Composite Exports use compatible boundaries.

802. Export projections contain approved fields only.

803. Export files preserve exact monetary values.

804. Export files preserve currency.

805. Export files preserve date meaning.

806. Export files preserve stable identifiers.

807. Export summaries reconcile with Export details.

808. Export verification is independent from file-generation assumptions.

809. Export integrity failures block download.

810. Export scope failures block download.

811. Export amount failures block download.

812. Export currency failures block download.

813. Download authorization is Owner-bound.

814. Download authorization is file-bound.

815. Download authorization is purpose-bound.

816. Download authorization expires.

817. Download authorization is revocable.

818. Download authorization is environment-bound.

819. Download tokens are excluded from ordinary logs.

820. Invalidated Exports cannot be downloaded.

821. Expired Exports cannot be downloaded.

822. Export sharing remains separately governed.

823. Ordinary download URLs are not public links.

824. Data portability is Owner-scoped.

825. Portability packages identify included categories.

826. Portability packages identify exclusions.

827. Portability packages identify unavailable categories.

828. Portability packages disclose Device-only unsynchronized-data limitations.

829. Privacy portability requires verified identity.

830. Privacy portability uses secure delivery.

831. Every external integration has a Contract owner.

832. Every external integration defines Authentication.

833. Every external integration defines Owner relationship.

834. Every external integration defines schema versions.

835. Every external integration defines currency semantics.

836. Every external integration defines date semantics.

837. Every external integration defines identifier semantics.

838. Every external integration defines idempotency.

839. Every external integration defines Retry.

840. Every external integration defines error behavior.

841. External Providers cannot select arbitrary Nexio Owners.

842. Provider correction Events reference original external records.

843. Provider deletion Events do not delete canonical financial data blindly.

844. External relationship revocation stops future data exchange.

845. File retention policies are registered.

846. Raw Source File retention is bounded.

847. Raw Record retention is bounded.

848. Export retention is bounded.

849. retention extension requires authority.

850. destruction is scheduled.

851. destruction is idempotent.

852. destruction is verifiable.

853. destruction revokes active authorization.

854. Legal Hold behavior is explicit.

855. Security capabilities are access-controlled.

856. Administrative Import authority is separated.

857. Administrative Export authority is separated.

858. Upload tokens are short-lived.

859. Upload tokens are object-bound.

860. Upload tokens are size-bound.

861. Download tokens are short-lived.

862. Download tokens prevent referrer leakage where applicable.

863. Object storage uses least privilege.

864. Parser workers cannot access unrelated Export files.

865. Export workers cannot access unrelated quarantine objects.

866. Scanner versions are inventoried.

867. scanner failures do not become Clean results.

868. Formula protection is governed.

869. field classifications are registered.

870. Raw File access is restricted.

871. Exports minimize fields.

872. external Provider Privacy reviews are complete.

873. AI capabilities are registered.

874. AI cannot resolve canonical Owner.

875. AI cannot approve Account mapping.

876. AI cannot invent currency.

877. AI cannot invent monetary values.

878. AI cannot approve reconciliation override.

879. AI cannot suppress financial duplicates independently.

880. AI cannot commit imported Resources.

881. AI cannot authorize Export download.

882. AI cannot certify file integrity.

883. AI cannot certify Privacy Export completeness.

884. untrusted file content is isolated from AI authority.

885. Import states are accessible.

886. Export states are accessible.

887. mapping controls are accessible.

888. validation messages are accessible.

889. duplicate review is accessible.

890. Conflict review is accessible.

891. exact amounts preserve accessible currency labels.

892. generated documents are accessible where supported.

893. Support access is case-scoped.

894. Support access is Owner-scoped.

895. Support cannot alter canonical Owner.

896. Support cannot alter exact amounts directly.

897. Support cannot bypass scanning.

898. Support cannot change operation IDs.

899. Support cannot recreate unknown outcomes blindly.

900. Support cannot extend expired links manually.

901. Audit Evidence preserves Type versions.

902. Audit Evidence preserves schema versions.

903. Audit Evidence preserves Parser and Serializer versions.

904. Audit Evidence preserves mapping versions.

905. Audit Evidence preserves operation IDs.

906. Audit Evidence preserves source and result references.

907. Audit Evidence minimizes file contents.

908. Operations maintains upload runbooks.

909. Operations maintains malware runbooks.

910. Operations maintains Parser-failure runbooks.

911. Operations maintains duplicate-financial-Import runbooks.

912. Operations maintains Export-integrity runbooks.

913. Operations maintains unauthorized-download runbooks.

914. Critical Incident categories are defined.

915. Cross-Owner Import is Critical.

916. Cross-Owner Export is Critical.

917. Malware execution is Critical.

918. unauthorized administrative Import is Critical.

919. duplicate committed financial effect is Critical.

920. another Owner's data in Export is Critical.

921. AI-invented committed monetary value is Critical.

922. Incident containment stops affected Jobs.

923. Incident containment revokes download authorization.

924. Incident containment preserves operation IDs.

925. Incident containment preserves Import lineage.

926. financial corrections use governed operations.

927. affected balances and Reports are recalculated.

928. Upload tests exist.

929. scanning tests exist.

930. archive tests exist.

931. Parser fuzz tests exist.

932. CSV tests exist.

933. JSON tests exist.

934. XLSX tests exist.

935. locale tests exist.

936. pt-BR money test vectors exist.

937. currency tests exist.

938. date tests exist.

939. mapping tests exist.

940. validation tests exist.

941. duplicate tests exist.

942. Conflict tests exist.

943. Preview tests exist.

944. commit tests exist.

945. reversal and correction tests exist.

946. Export tests exist.

947. formula-injection tests exist.

948. download tests exist.

949. retention tests exist.

950. interoperability tests exist.

951. Owner-isolation tests exist.

952. property-based invariants are tested.

953. mutation tests detect removed Owner validation.

954. mutation tests detect removed Account validation.

955. mutation tests detect bypassed scan validation.

956. mutation tests detect changed operation identity.

957. mutation tests detect ignored Preview expiration.

958. mutation tests detect removed formula protection.

959. performance tests cover maximum file sizes.

960. performance tests cover maximum record counts.

961. performance tests cover large Previews.

962. performance tests cover large Exports.

963. chaos tests cover unknown commit outcomes.

964. migrations preserve Owner scope.

965. migrations preserve Account scope.

966. migrations preserve exact money.

967. migrations preserve currency.

968. migrations preserve dates.

969. migrations preserve operation IDs.

970. migrations preserve Import lineage.

971. migrations preserve Export source boundaries.

972. migrations preserve revocation state.

973. Parser migrations compare exact outputs.

974. Serializer migrations compare exact outputs.

975. mapping migrations invalidate unsafe profiles.

976. storage migrations preserve content hashes.

977. encryption migrations preserve Owner isolation.

978. Interoperability migrations preserve external identity.

979. migration rollback prevents duplicate commitment.

980. backup recovery preserves idempotency records.

981. backup recovery preserves row outcomes.

982. backup recovery preserves lineage.

983. backup recovery preserves Export revocation.

984. restored expired files do not become downloadable automatically.

985. disaster recovery verifies canonical financial state.

986. disaster recovery verifies file integrity.

987. disaster recovery verifies download revocation.

988. releases declare Import Type versions.

989. releases declare Export Type versions.

990. releases declare schema versions.

991. releases declare Parser versions.

992. releases declare Serializer versions.

993. releases declare mapping versions.

994. releases declare policy versions.

995. releases declare storage and retention changes.

996. unsafe data-exchange changes block release.

997. post-release verification reviews cross-Owner metrics.

998. post-release verification reviews duplicate financial effects.

999. post-release verification reviews Export integrity.

1000. post-release verification reviews destruction backlog.

1001. deprecated Types block new dependencies.

1002. retired Import Types prevent new Jobs.

1003. retired Export Types prevent new Jobs.

1004. retired schemas remain historically interpretable.

1005. retired Parsers process no new files.

1006. retired Serializers generate no new files.

1007. retired external contracts reject new traffic safely.

1008. every imported canonical Resource remains traceable to one source and operation.

1009. every Export remains traceable to one verified source boundary.

1010. every Import, Export and interoperability lifecycle remains independently reconstructable.

---

# Imports, Exports, Data Portability and Interoperability Constitutional Rule

Every Nexio Import, Export, portability package, Provider payload, mapping decision, duplicate decision, commit operation, generated file, download authorization and destruction Event must answer:

```text
Which approved purpose applies?

Which authenticated Actor initiated or approved the operation?

Which canonical Owner owns the source and result?

Which Accounts and Resources are in scope?

Which Source File, external payload or canonical boundary applies?

Which format, schema, Parser or Serializer versions apply?

Which encoding, locale, date and currency Rules apply?

Which exact monetary values apply?

Which mapping, normalization and validation policies apply?

Which duplicate and Conflict decisions apply?

Which Preview version was confirmed?

Which stable operation identities prevent duplication?

Which canonical Resources were created or changed?

Which Import lineage preserves origin?

Which Export verification proves scope and integrity?

Which download authorization applies?

When does access expire?

When must the artifact be destroyed?

Which Evidence independently reconstructs the lifecycle?
```

When any answer is uncertain, Nexio must prefer the action that:

- Stops processing.
- preserves untrusted input in quarantine.
- rejects ambiguous locale.
- rejects ambiguous currency.
- rejects unsafe Account mapping.
- invalidates the Preview.
- prevents canonical commitment.
- preserves duplicate uncertainty.
- preserves Conflict state.
- resolves unknown outcomes through the same operation identity.
- blocks Export download.
- revokes authorization.
- invalidates incorrect artifacts.
- destroys unsafe files.
- preserves canonical financial Evidence.
- opens a Security, Privacy, financial-integrity or operational Incident.
- blocks the release.

A file is not trustworthy merely because its extension is approved.

A row is not valid merely because its fields parsed.

A mapping is not correct merely because every source field has a destination.

A duplicate is not proven merely because amount and date match.

A Preview is not canonical merely because it was displayed.

An Import is not complete merely because one batch committed.

An Export is not correct merely because a file was generated.

A download URL is not authorization merely because it is difficult to guess.

An external Provider acknowledgement is not canonical Nexio Evidence.

A data-exchange lifecycle is trustworthy only when it preserves canonical Owner and Account scope, exact financial meaning, explicit currency and locale, versioned schemas, controlled parsing, deterministic mapping, row-level validation, governed duplicate and Conflict decisions, Preview integrity, idempotent commitment, source lineage, secure Export verification, expiring delivery authority, bounded retention and reproducible Evidence.

Nexio must never:

- Import one Owner's data into another Owner.
- export one Owner's data to another Owner.
- trust uploaded ownership fields.
- execute uploaded macros or formulas.
- allow archive traversal or external XML entities.
- guess ambiguous pt-BR or other locale values silently.
- convert currency without an approved policy.
- use binary floating-point as authoritative money.
- commit the same imported financial effect twice.
- hide rejected rows behind a successful Job state.
- commit an expired or invalidated Preview.
- export unauthorized fields.
- release an integrity-failed file.
- create permanent unrestricted download URLs.
- retain files indefinitely without policy.
- permit AI to approve canonical mappings, values, duplicates, commitments or downloads independently.

---

# Final Authority

This document is the official Imports, Exports, Data Portability and Interoperability specification for Nexio.

All future:

- Import Types.
- Export Types.
- Data Exchange Schemas.
- Import Jobs.
- Export Jobs.
- Upload Sessions.
- Download Sessions.
- Source Files.
- Export Files.
- quarantine storage.
- object storage.
- multipart uploads.
- resumable uploads.
- malware scanning.
- file-signature detection.
- MIME detection.
- archive extraction.
- compression handling.
- CSV parsing.
- JSON parsing.
- XLSX parsing.
- portable-package parsing.
- Parser Registries.
- Parser sandboxes.
- encoding detection.
- delimiter detection.
- locale detection.
- decimal parsing.
- currency parsing.
- date parsing.
- spreadsheet date handling.
- formula handling.
- hidden worksheet handling.
- Mapping Profiles.
- mapping transformations.
- Account mapping.
- Category mapping.
- Transfer recognition.
- recurring-pattern recognition.
- normalization Rules.
- Validation Rules.
- duplicate policies.
- duplicate decisions.
- Import Conflicts.
- Import Previews.
- Preview decisions.
- Import confirmations.
- Import commit Sessions.
- Import row operations.
- Import batches.
- Import lineage.
- Import reversals.
- differential Imports.
- Import recalculation.
- Import history.
- Provider Imports.
- migration Imports.
- administrative Imports.
- Support-assisted Imports.
- Export query plans.
- Export datasets.
- Export projections.
- CSV Exports.
- JSON Exports.
- XLSX Exports.
- PDF Exports.
- portable packages.
- Export manifests.
- Export verification.
- Export storage.
- Export download authorizations.
- Export Download Sessions.
- Export invalidation.
- Export revocation.
- Export destruction.
- Owner financial portability.
- Privacy portability.
- API Exports.
- external Provider imports.
- outbound interoperability.
- external Resource references.
- Provider correction Events.
- interoperability reconciliation.
- Import and Export metrics.
- Import and Export SLOs.
- Import and Export alerts.
- Import and Export Incidents.
- Import and Export migrations.
- Import and Export backup and recovery.
- Import and Export disaster recovery.
- Import and Export release certification.
- Import and Export Support workflows.
- AI-assisted mapping.
- AI-assisted duplicate review.
- AI-assisted schema documentation.

must comply with this specification.

Exceptions require a documented Product, Import, Export, Financial, Security, Privacy, Accessibility, Backend, API, Database, Storage, Parser, Serializer, Provider, Operations, Support, Audit, Migration or Release decision containing:

- Import or Export Type identifier.
- purpose.
- canonical Owner scope.
- Account scope.
- Resource scope.
- source Type.
- format.
- schema identifier and version.
- Parser or Serializer version.
- encoding.
- locale.
- currency behavior.
- exact-money representation.
- mapping policy.
- validation policy.
- duplicate policy.
- Conflict policy.
- Preview policy.
- commit policy.
- operation identity.
- idempotency behavior.
- lineage behavior.
- source boundary.
- Export verification.
- download policy.
- retention.
- destruction.
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

Unregistered Import Types, unregistered Export Types, unversioned schemas, unsafe Parsers, uncontrolled mapping, ambiguous locale, ambiguous currency, inaccurate financial values, duplicate commitment, missing lineage, unsafe formula handling, unauthorized Export scope, permanent download links, excessive retention, inaccessible workflows and unsupported AI decisions are considered Product, financial-integrity, Security, Privacy, Accessibility, operational, Support and governance debt.

---