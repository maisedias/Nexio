# Nexio Product Roadmap and Prioritization Specification

Version: 1.0  
Status: Official  
Authority Level: Product Strategy, Discovery, Prioritization and Roadmap Governance Standard  
Applies To: Product Strategy, Web, Android, Desktop, Tablet, Mobile, Onboarding, Accounts, Transactions, Transfers, Goals, Reports, Notifications, Imports, Exports, Assistant, Advertising, Subscriptions, Support, Privacy, Accessibility, Reliability and Regional Expansion

---

# Purpose

This document defines the official Product Roadmap and Prioritization architecture for Nexio.

It establishes how Nexio should:

- Define Product strategy
- Identify target users
- Understand user needs
- Frame Product problems
- Distinguish problems from requested features
- Define measurable Product outcomes
- Conduct Product discovery
- Evaluate opportunities
- Prioritize capabilities
- Define MVP scope
- Define release themes
- Separate Product roadmap from Engineering plan
- Manage the Product backlog
- Evaluate dependencies
- Balance user value and Product risk
- Govern experiments
- Introduce new Product capabilities
- Reject low-value or unsafe work
- Measure post-release outcomes
- Deprecate unsuccessful or obsolete capabilities
- Use AI in Product planning without fabricating evidence

The objective is to ensure that Nexio does not become:

```text
A collection of disconnected features

A list of stakeholder requests

A visual redesign without measurable value

A copy of competing financial applications

A backlog driven only by implementation convenience

A Product roadmap based only on deadlines

A Product whose growth work weakens financial trust
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
```

Responsibilities are divided as follows:

| Document | Responsibility |
|---|---|
| `00-FOUNDATION.md` | Defines Product trust principles |
| `06-DATA-MODEL.md` | Defines canonical financial meaning |
| `09-TESTING.md` | Defines verification strategy |
| `16-ANALYTICS-AND-EXPERIMENTATION.md` | Defines safe measurement and experiments |
| `19-ENGINEERING-GOVERNANCE-AND-CHANGE-MANAGEMENT.md` | Defines Engineering change governance |
| `22-IMPLEMENTATION-ROADMAP-AND-MIGRATION-PLAN.md` | Defines technical implementation sequence |
| `23-REQUIREMENTS-TRACEABILITY-MATRIX.md` | Connects requirements to implementation and evidence |
| `24-PRODUCT-ROADMAP-AND-PRIORITIZATION.md` | Defines why Product work is selected and which outcomes it should achieve |

The Product roadmap defines:

```text
Why

For whom

Which problem

Which outcome

Which priority
```

The Implementation roadmap defines:

```text
How

In which technical order

With which migration

With which tests

With which release controls
```

These documents must remain aligned but distinct.

---

# Product Roadmap Constitutional Principles

## Financial Trust Has Priority over Feature Growth

Nexio must not prioritize:

- Growth
- Engagement
- Advertising
- AI
- Visual novelty
- Additional integrations

over unresolved credible risks involving:

- Incorrect Amount
- Incorrect Currency
- Duplicate Transaction
- Broken Transfer
- Data loss
- Cross-owner access
- Broken Account deletion
- Unrecoverable state

---

## Product Strategy Must Begin with User Problems

The roadmap should begin with:

```text
User

Context

Need

Problem

Desired outcome
```

It should not begin with:

```text
Technology

SDK

Provider

Trend

Competitor feature

AI model

Advertising format
```

---

## A Requested Feature Is Not Automatically a Valid Product Problem

A request such as:

```text
Add a new chart.
```

should be translated into questions such as:

```text
Which decision is the user unable to make?

Which information is missing?

Which current Report is insufficient?

Which users experience this problem?

How frequently?

What measurable outcome should improve?
```

---

## Product Value Must Be Observable

Every material roadmap item should identify at least one observable outcome.

Examples:

```text
Users complete their first Transaction successfully.

Users understand whether data is synchronized.

Users resolve a Conflict without losing financial intent.

Users complete Account deletion without contacting Support.

Users identify monthly Expense categories correctly.
```

---

## Output Is Distinct from Outcome

Output:

```text
A new onboarding screen was released.
```

Outcome:

```text
More new users complete Account creation and record their first valid Transaction.
```

A release may produce output without improving the intended outcome.

---

## Activity Is Distinct from Progress

The following do not prove Product progress:

- Number of tickets closed
- Number of screens created
- Number of commits
- Number of meetings
- Number of AI prompts
- Number of experiments launched

Progress requires improved Product outcomes without unacceptable guardrail failure.

---

## Roadmap Dates Must Not Create False Certainty

Dates may be committed when:

- Scope is known.
- Dependencies are ready.
- Risks are understood.
- Required review is available.
- Delivery confidence is appropriate.

Discovery items should not receive false delivery precision.

---

## The Roadmap Must Remain Outcome-Oriented

Preferred roadmap item:

```text
Help new users understand and record their first complete financial entry.
```

Weak roadmap item:

```text
Build onboarding carousel.
```

The carousel may be one solution, not the outcome.

---

## Product Discovery Must Be Continuous

Discovery should occur:

- Before prioritization
- During solution design
- During implementation
- During rollout
- After release

Discovery is not a one-time phase at the beginning of the Product.

---

## Existing Evidence Must Be Preferred over Assumption

Evidence sources may include:

- User interviews
- Support cases
- Product Analytics
- Accessibility findings
- Store feedback
- Incident reports
- Search behavior
- Usability tests
- Recovery exercises
- Financial workflow failures

---

## Product Analytics Is Not the Only Evidence

Analytics may show:

```text
What happened
```

but may not explain:

```text
Why it happened

What the user expected

Whether the user understood the financial meaning

Whether Accessibility prevented completion
```

---

## Qualitative and Quantitative Evidence Must Be Combined

Preferred decision basis:

```text
Behavioral evidence

+

User explanation

+

Technical reality

+

Risk assessment
```

---

## User Value Must Not Override Safety Guardrails

A highly requested capability may still be rejected when it:

- Corrupts financial meaning
- Weakens owner isolation
- Requires excessive data
- Creates inaccessible critical journeys
- Cannot be recovered safely
- Violates public Product boundaries

---

## Product Scope Must Remain Coherent

Nexio should not add capabilities merely because they are adjacent to personal finance.

Every capability should support the Product's core value proposition.

---

## Core Financial Workflows Must Remain Available without Optional Providers

The following must not depend on optional:

- Advertising
- Product Analytics
- Assistant
- Marketing provider
- Experiment provider

Core workflows include:

```text
Authentication

Accounts

Transactions

Transfers

Goals

Reports

Export

Privacy controls

Account deletion

Support
```

---

## Product Decisions Must Include Accessibility

A Product opportunity is incomplete when it excludes:

- Keyboard users
- Screen-reader users
- Users with large text
- Users with reduced motion
- Users using narrow screens
- Users with cognitive or language barriers

---

## Product Decisions Must Include Failure States

A capability must be evaluated under:

- Offline state
- Timeout
- Provider outage
- Authentication expiration
- Account switch
- Partial data
- Empty data
- Conflict
- Recovery
- Account deletion

---

## Product Decisions Must Consider Existing Users and Data

A redesign or new capability must not assume:

- Empty Accounts
- New users only
- Perfect synchronization
- One Currency
- No archived records
- No pending operations
- No older Android version

---

## Product Roadmap Must Include Maintenance and Removal

The roadmap should include:

- Reliability
- Accessibility
- Technical debt
- Provider upgrades
- Policy updates
- Feature removal
- Legacy cleanup
- Recovery testing

A Product roadmap containing only new features is incomplete.

---

## Product Decisions Must Be Reversible Where Possible

Early solutions should favor:

- Feature Flags
- Controlled rollout
- Small cohorts
- Bounded experiments
- Replaceable providers
- Additive data changes

---

## Irreversible Decisions Require Enhanced Review

Examples:

- Permanent data deletion
- Money representation change
- Owner model change
- Subscription model
- Advertising personalization
- Public financial claim
- Region launch
- Provider lock-in

---

## Product Metrics Must Not Encourage Harm

Nexio must not optimize for:

- More Transactions created regardless of user intent
- More time spent in the application
- More Notifications opened
- More Assistant interactions
- More ad clicks

without considering user benefit and safety.

---

## Product Success Must Include Trust

Trust indicators may include:

- Accurate financial state
- Low duplicate rate
- Low unexplained discrepancy rate
- Successful recovery
- Accurate synchronization status
- Low Privacy complaint rate
- Successful deletion
- Accessible journey completion

---

## Public Promises Must Follow Current Capability

A Product roadmap must not be presented publicly as an existing feature list.

Future capabilities should not appear as available in:

- Store listings
- Screenshots
- Privacy Policy
- Help Center
- Marketing
- Subscription plans

before release and verification.

---

## AI May Support Product Work but Cannot Replace Evidence

AI may assist with:

- Organizing findings
- Summarizing interviews
- Detecting repeated themes
- Drafting opportunity statements
- Comparing options
- Preparing research plans

AI must not fabricate:

- User quotes
- Interview results
- Analytics
- Market demand
- Experiment results
- Delivery confidence

---

# Product Strategy Architecture

Product strategy should connect:

```text
Product vision

↓

Target audience

↓

User needs

↓

Strategic problems

↓

Product outcomes

↓

Roadmap opportunities

↓

Capabilities

↓

Releases

↓

Measured results
```

---

# Product Vision

The Product vision describes the long-term value Nexio intends to create.

Recommended conceptual vision:

```text
Nexio helps people understand, organize and control their personal financial records through a trustworthy, accessible and user-controlled experience.
```

This vision does not imply:

- Banking services
- Guaranteed savings
- Investment advice
- Credit services
- Automatic truth from external financial systems
- Professional accounting certification

---

# Product Mission

Recommended conceptual mission:

```text
Provide a reliable personal finance workspace where users can record, review, organize and export their financial information with clear control over data, synchronization and optional assistance.
```

---

# Product Promise

The Product promise should remain narrow and provable.

Recommended:

```text
Nexio helps users organize personal financial records and understand their available financial history.
```

Avoid:

```text
Nexio guarantees financial success.
```

---

# Product Positioning

Potential positioning:

```text
A personal financial organization application focused on user control, clear records, privacy and accessible cross-platform use.
```

---

# Strategic Differentiators

Potential Nexio differentiators:

```text
Financial-data trust

Clear offline and synchronization states

Accessible critical journeys

User-controlled privacy

Transparent Account deletion

Cross-platform consistency

Optional bounded Assistant

Explicit Currency handling

Recoverable financial intent
```

These differentiators must be supported by implementation before becoming public claims.

---

# Strategic Non-Goals

Unless separately approved, Nexio is not intended to become:

- A bank
- A digital wallet
- A payment processor
- A credit institution
- An investment platform
- A tax filing service
- A legal advice service
- An accounting certification platform
- A social financial network
- A marketplace for financial products

---

# Product Strategy Record

Recommended file:

```text
docs/product/PRODUCT-STRATEGY.md
```

Recommended fields:

```text
Vision

Mission

Target users

Core needs

Strategic problems

Differentiators

Non-goals

Product boundaries

Success outcomes

Trust guardrails

Review date

Owner
```

---

# Product Strategy Review

The strategy should be reviewed after:

- Major Product pivot
- New regulated capability
- New monetization model
- New target audience
- New region
- Material provider change
- Major incident
- Significant user evidence
- Assistant or AI expansion

---

# Target Audience Architecture

Nexio should define target audiences based on needs and context rather than vague demographic assumptions.

---

# Primary Audience

A potential primary audience may include people who:

- Want to record personal Income and Expenses
- Need a clearer view of Accounts and Transactions
- Want to organize financial history
- Need simple Goals and Reports
- Use Web or Android
- Prefer direct control over their data
- May use the application with intermittent connectivity

This remains a hypothesis until validated through Product research.

---

# Secondary Audiences

Potential secondary audiences may include:

- Users migrating from spreadsheets
- Users replacing paper notes
- Users managing multiple personal Accounts
- Users requiring accessible financial tools
- Users needing simple Export for personal review
- Users using several devices

---

# Excluded or Unsupported Audiences

Unless separately implemented and reviewed:

- Businesses requiring formal accounting
- Users requiring regulated banking
- Users requiring investment execution
- Users requiring tax certification
- Users requiring shared corporate ledgers
- Children or restricted-age audiences
- Users requiring high-frequency market data

---

# Audience Segment Record

Recommended fields:

```text
segment_id

name

context

needs

current_alternatives

pain_points

accessibility_considerations

privacy_considerations

platforms

evidence

confidence

owner
```

---

# Evidence Confidence

Recommended:

```text
hypothesis

emerging

supported

strongly_supported

invalidated
```

---

# `hypothesis`

Based primarily on internal assumption.

---

# `emerging`

Supported by limited qualitative or behavioral evidence.

---

# `supported`

Supported by repeated evidence from more than one source.

---

# `strongly_supported`

Supported by consistent quantitative and qualitative evidence.

---

# `invalidated`

Current evidence does not support the assumption.

---

# Persona Governance

Personas may be used only when based on evidence.

A persona should not become:

- A fictional biography
- A stereotype
- A demographic caricature
- A substitute for Accessibility testing
- A substitute for actual research

---

# Persona Record

Recommended:

```text
persona_id

evidence_source

financial_context

primary_jobs

current_workarounds

pain_points

decision_factors

trust_concerns

accessibility_needs

privacy_needs

confidence

last_reviewed
```

---

# Persona Example Structure

```text
Persona: Manual Organizer

Context:
Uses notes or spreadsheets to record personal financial activity.

Primary need:
Record and review Income and Expenses without creating a complex accounting system.

Current problem:
Information becomes fragmented, difficult to summarize and difficult to access across devices.

Trust concern:
Fear of losing records or seeing incorrect balances.

Accessibility consideration:
Needs clear forms, simple language and readable financial values.
```

This is a template, not validated user evidence.

---

# User Need Architecture

A user need should describe a durable need rather than a Product solution.

Preferred:

```text
I need to know whether my latest Expense was saved safely.
```

Weak:

```text
I need a green synchronization icon.
```

---

# User Need Record

Recommended fields:

```text
need_id

audience

context

need_statement

current_behavior

current_workaround

frequency

severity

evidence

confidence

related_problems

owner
```

---

# Jobs-to-Be-Done Structure

A Product need may use:

```text
When [context],

I want to [motivation],

so I can [desired outcome].
```

Example:

```text
When I record an Expense without internet access,

I want to know whether it was saved on my device,

so I can continue without creating the same Expense twice.
```

---

# Core User Jobs

Potential core jobs:

```text
Create a personal financial Account

Record Income

Record Expense

Move Money between Accounts

Review recent Transactions

Understand Account balance

Review monthly cash flow

Track a Goal

Correct a financial record

Export personal records

Understand synchronization state

Recover from an error

Control optional data processing

Delete the Nexio Account
```

---

# Functional Jobs

What the user is trying to accomplish.

Example:

```text
Record a Transaction.
```

---

# Emotional Jobs

How the user wants to feel.

Example:

```text
Feel confident that the Transaction was not lost or duplicated.
```

---

# Social Jobs

How the user may want to present or share an outcome.

Example:

```text
Export an organized record for personal review.
```

Social jobs should not imply that Nexio is intended for public financial sharing unless explicitly implemented.

---

# User Problem Architecture

A Product problem should describe:

```text
Who experiences the problem

In which context

What prevents success

Why it matters

Which evidence supports it
```

---

# Problem Statement Template

```text
[Audience] experiences [problem] when [context], which causes [impact].

Evidence:
[Evidence references]

Current workaround:
[Workaround]

Product consequence:
[Why Nexio should address it]
```

---

# Problem Example — Synchronization Uncertainty

```text
Users recording Transactions with unstable connectivity may not know whether a financial entry exists only on the device or has synchronized remotely, which can lead to repeated entries and loss of trust.
```

Potential evidence:

- Duplicate-related Support cases
- User interviews
- Pending-operation rates
- Timeout events
- Usability tests

---

# Problem Example — Mobile Form Friction

```text
Mobile users may abandon or incorrectly complete Transaction forms when Amount, Account, Category and Date controls do not fit narrow screens or preserve input during navigation.
```

---

# Problem Example — Account Deletion Confusion

```text
Users may not understand whether Account deletion is pending, completed or still processing provider cleanup, causing repeated Support contact and mistrust.
```

---

# Problem Quality Criteria

A valid problem should be:

- User-centered
- Specific
- Evidence-backed or clearly marked as hypothesis
- Independent from one solution
- Important enough to affect an outcome
- Within Product boundaries
- Measurable

---

# Problem Anti-Pattern — Solution Disguised as Problem

Weak:

```text
Users need an AI chatbot.
```

Better:

```text
Some users cannot interpret available Reports or find the correct manual workflow for common financial questions.
```

AI may be one possible solution.

---

# Problem Anti-Pattern — Stakeholder Preference

Weak:

```text
The Dashboard needs to look more modern.
```

Better:

```text
Users cannot identify the most important current financial state because the Dashboard hierarchy and information density obscure balances, recent activity and pending synchronization.
```

---

# Problem Anti-Pattern — Metric without User Meaning

Weak:

```text
Increase session duration.
```

Better:

```text
Increase successful completion of intended financial review without increasing confusion or unnecessary time in the application.
```

---

# Opportunity Architecture

An opportunity is a validated or plausible area where Product action may improve an outcome.

---

# Opportunity Record

Recommended fields:

```text
opportunity_id

title

related_problem

audience

expected_outcome

evidence

confidence

risk

strategic_alignment

dependencies

potential_solutions

owner

status
```

---

# Opportunity Status

Recommended:

```text
identified

researching

validated

prioritized

solution_discovery

planned

in_delivery

measuring

completed

deferred

rejected

invalidated
```

---

# Opportunity Types

Potential:

```text
User-value opportunity

Trust opportunity

Accessibility opportunity

Reliability opportunity

Growth opportunity

Monetization opportunity

Operational opportunity

Compliance opportunity

Maintenance opportunity
```

---

# User-Value Opportunity

Improves direct completion or understanding of a user job.

Example:

```text
Reduce friction when creating the first Transaction.
```

---

# Trust Opportunity

Improves confidence in Product state.

Example:

```text
Make local and remote Save states understandable.
```

---

# Accessibility Opportunity

Removes an Accessibility barrier.

Example:

```text
Make Transaction validation understandable to screen-reader users.
```

Accessibility barrier removal should not be treated as optional growth experimentation when it affects critical journeys.

---

# Reliability Opportunity

Reduces failure, loss or duplication.

Example:

```text
Reconcile unknown Transaction outcomes automatically.
```

---

# Growth Opportunity

Improves acquisition, activation, retention or referral without weakening trust.

Example:

```text
Improve successful onboarding completion.
```

---

# Monetization Opportunity

Creates sustainable revenue while preserving Product boundaries.

Example:

```text
Evaluate an optional paid tier for advanced Reports.
```

A monetization opportunity requires separate value, fairness, store and entitlement review.

---

# Operational Opportunity

Reduces Support or recovery cost while improving user outcomes.

Example:

```text
Provide safe synchronization diagnostics users can understand.
```

---

# Opportunity Solution Separation

Each opportunity should support multiple possible solutions.

Example:

```text
Opportunity:
Users cannot understand whether a Transaction is synchronized.

Possible solutions:
- Clear status label
- Transaction-level state
- Sync Center
- Pending changes summary
- Improved error recovery
- Contextual education
```

Do not lock the opportunity to one interface prematurely.

---

# Product Outcome Architecture

An outcome describes an observable change in user behavior, user success or Product trust.

---

# Outcome Record

Recommended fields:

```text
outcome_id

title

audience

related_problem

baseline

target_direction

primary_metric

guardrail_metrics

evidence_source

measurement_window

owner

confidence

status
```

---

# Outcome Types

Potential:

```text
Acquisition

Activation

Core task success

Retention

Trust

Accessibility

Reliability

Privacy

Support

Monetization
```

---

# Acquisition Outcome

Example:

```text
More eligible users successfully reach the Nexio Product from the intended store or website.
```

Acquisition must not use misleading claims.

---

# Activation Outcome

Example:

```text
More new users create an Account and complete their first valid Transaction.
```

---

# Core Task Success Outcome

Example:

```text
Users complete Transaction creation successfully without duplicate submission or validation confusion.
```

---

# Retention Outcome

Example:

```text
Users return because their financial records remain useful and trustworthy.
```

Do not optimize retention through manipulative Notifications or forced optional processing.

---

# Trust Outcome

Example:

```text
Users can correctly identify whether a Transaction is local, pending or synchronized.
```

---

# Accessibility Outcome

Example:

```text
Keyboard and screen-reader users complete critical financial journeys with equivalent success.
```

---

# Reliability Outcome

Example:

```text
Fewer financial operations enter unresolved unknown-outcome state.
```

---

# Privacy Outcome

Example:

```text
Users successfully change optional data-processing preferences without Support assistance.
```

---

# Support Outcome

Example:

```text
Users resolve common synchronization problems without destructive troubleshooting.
```

---

# Monetization Outcome

Example:

```text
Eligible users choose a paid capability because it provides clear value, without reducing access to core privacy or deletion features.
```

---

# Outcome Metric Principles

A Product metric should be:

- Clearly defined
- Measurable
- Resistant to manipulation
- Connected to a user outcome
- Segmented appropriately
- Privacy-safe
- Accompanied by guardrails
- Reviewed for Accessibility impact

---

# Primary Metric

The main measure expected to move.

Example:

```text
First valid Transaction completion rate
```

---

# Guardrail Metric

A measure that must not degrade while pursuing the primary outcome.

Examples:

```text
Duplicate Transaction rate

Validation error abandonment

Accessibility completion rate

Crash rate

Account deletion success rate

Privacy complaint rate
```

---

# Counter Metric

A measure used to detect harmful optimization.

Example:

```text
Notification disablement rate
```

when optimizing Notification engagement.

---

# Diagnostic Metric

A supporting measure used to understand why an outcome changed.

Example:

```text
Percentage of Transaction forms failing because Currency is missing.
```

---

# Metric Definition Record

Recommended fields:

```text
metric_id

name

definition

numerator

denominator

inclusions

exclusions

data_source

privacy_classification

segmentation

owner

guardrail_relationship

review_date
```

---

# Metric Baseline

A target should not be defined without understanding the current baseline where practical.

When no reliable baseline exists:

```text
Baseline collection
```

should become the first milestone.

---

# Metric Target Direction

Early discovery may use:

```text
increase

decrease

maintain

establish_baseline
```

Avoid invented numeric targets without evidence.

---

# Metric Segmentation

Potential segmentation:

```text
Web versus Android

Desktop versus Mobile

New versus returning users

Online versus offline use

Assistive technology where ethically and safely measured

Region

Application version

Feature Flag cohort
```

Do not create sensitive or reidentifying segmentation without Privacy review.

---

# Product Guardrails

Product-level guardrails should include:

```text
Financial correctness

Owner isolation

Data loss

Duplicate operation rate

Accessibility

Privacy choice integrity

Account deletion

Crash and ANR

Synchronization health

Support escalation
```

---

# Guardrail Failure

A guardrail failure may:

- Stop an experiment
- Stop rollout
- Remove a capability
- Reopen discovery
- Reduce scope
- Trigger incident response
- Override primary metric improvement

---

# Product Discovery Architecture

Discovery should reduce uncertainty across:

```text
Value

Usability

Feasibility

Viability

Safety

Accessibility

Privacy

Compliance
```

---

# Value Risk

Question:

```text
Will the capability solve an important problem for the intended user?
```

---

# Usability Risk

Question:

```text
Can the intended user understand and complete the workflow?
```

---

# Feasibility Risk

Question:

```text
Can Nexio implement and operate the capability reliably?
```

---

# Viability Risk

Question:

```text
Does the capability fit Product strategy, support model, costs and distribution?
```

---

# Safety Risk

Question:

```text
Can the capability harm financial integrity, owner isolation, data durability or recovery?
```

---

# Accessibility Risk

Question:

```text
Can users with different access needs complete the capability successfully?
```

---

# Privacy Risk

Question:

```text
Does the capability require unnecessary data or weaken user control?
```

---

# Compliance Risk

Question:

```text
Does the capability change public claims, permissions, store declarations or legal boundaries?
```

---

# Discovery Evidence Types

Potential:

```text
User interview

Contextual inquiry

Usability test

Prototype test

Support analysis

Analytics analysis

Store review analysis

Accessibility audit

Incident analysis

Technical spike

Provider investigation

Competitive research

Survey
```

---

# Discovery Evidence Hierarchy

No single evidence type is universally superior.

The best evidence depends on the question.

Examples:

| Question | Useful evidence |
|---|---|
| Why do users abandon a form? | Usability test, interview, error analysis |
| How frequently does abandonment occur? | Product Analytics |
| Can Android preserve state after process death? | Technical test |
| Can screen-reader users understand a Conflict? | Accessibility usability test |
| Does a provider support deletion? | Provider contract and API test |
| Does a feature create Store risk? | Current Store policy review |

---

# User Interview Governance

Interviews should define:

```text
Research question

Target participant

Recruitment criteria

Consent

Recording state

Data minimization

Interview guide

Analysis method

Retention

Owner
```

---

# Interview Principles

Interviews should:

- Ask about real past behavior.
- Avoid leading the participant.
- Avoid presenting one solution as inevitable.
- Avoid requesting unnecessary financial values.
- Avoid collecting passwords or account credentials.
- Respect the participant's right to stop.

---

# Weak Interview Question

```text
Would you use an AI Assistant that automatically manages your finances?
```

---

# Stronger Interview Question

```text
Tell me about the last time you had difficulty understanding or updating your personal financial records.
```

---

# Interview Financial Data Minimization

Participants should not be encouraged to disclose:

- Exact bank balance
- Full Transaction history
- Account numbers
- Authentication credentials
- Sensitive Attachment contents

Synthetic examples should be used when possible.

---

# Usability Testing Architecture

A usability test should define:

```text
Journey

Participant profile

Prototype or build version

Task

Success criteria

Observed errors

Time only when meaningful

Accessibility needs

Data handling

Facilitator

Evidence
```

---

# Usability Task Example

```text
Record an Expense of R$ 84,90 in the appropriate Account and verify whether it has synchronized.
```

Use synthetic Accounts and values.

---

# Usability Success Criteria

Potential:

```text
Task completed

Correct Account selected

Correct Amount stored

Correct Currency preserved

User identifies final state accurately

No duplicate submission

No facilitator intervention
```

---

# Prototype Levels

Potential:

```text
Concept sketch

Low-fidelity flow

Interactive prototype

Development prototype

Production-like build

Controlled Production release
```

The level should match the uncertainty being tested.

---

# Prototype Limitation

A prototype may test:

- Comprehension
- Navigation
- Form organization
- Content
- Visual hierarchy

It cannot prove:

- Database correctness
- Synchronization durability
- Recovery
- RLS
- Android process-death behavior
- Provider deletion

---

# Technical Discovery

Technical discovery may investigate:

- Current repository behavior
- Provider capability
- Data migration
- Android lifecycle
- Performance
- Offline persistence
- Security
- Store constraints

---

# Technical Spike Record

Recommended:

```text
spike_id

question

scope

timebox

files_or_providers

prototype

findings

limitations

recommendation

evidence

owner
```

---

# Spike Principles

A technical spike should:

- Answer a specific question.
- Remain time-bounded.
- Avoid becoming hidden Production code.
- Document uncertainty.
- Identify cleanup.
- Avoid using real user financial data.

---

# Competitive Research

Competitive research may identify:

- Common user expectations
- Terminology
- Interaction patterns
- Market gaps
- Pricing patterns
- Accessibility practices
- Privacy practices

It must not justify blind copying.

---

# Competitive Research Questions

```text
Which user problem is being addressed?

How is financial meaning communicated?

How are offline states represented?

How is Account deletion handled?

Which capabilities are optional?

Which claims appear unsupported or risky?

Which Accessibility barriers exist?
```

---

# Competitive Copying Prohibition

Do not copy:

- Proprietary interface assets
- Policy text
- Trademarks
- Screenshots
- Code
- Unique copyrighted content
- Misleading Product claims

---

# Survey Governance

Surveys may help measure:

- Relative frequency
- Self-reported preference
- Satisfaction
- Problem prevalence

Surveys should not be the only evidence for complex workflow decisions.

---

# Survey Bias Review

Review:

- Leading wording
- Sample bias
- Nonresponse
- Ambiguous scale
- Forced choices
- Privacy-sensitive questions
- Unsupported generalization

---

# Support Evidence as Discovery Input

Support cases may reveal:

- Repeated confusion
- Reliability failures
- Missing recovery
- Accessibility barriers
- Deletion problems
- Provider issues

Support volume alone does not determine Product priority.

A low-volume Critical financial defect may outrank a high-volume cosmetic request.

---

# Incident Evidence as Product Input

Incidents should create Product opportunities when they reveal:

- Misleading state
- Unsafe confirmation
- Missing recovery
- Poor user communication
- Fragile provider dependency
- Confusing deletion state

---

# Store Feedback as Product Input

Store reviews may reveal:

- Android stability issues
- Onboarding friction
- Device compatibility
- Performance
- Missing expected capability
- Misleading listing claims

Store feedback must be verified and should not expose reviewer identity unnecessarily.

---

# Discovery Repository Structure

Recommended:

```text
docs/product/
  PRODUCT-STRATEGY.md
  AUDIENCE-SEGMENTS.md
  OPPORTUNITY-REGISTRY.md
  OUTCOME-REGISTRY.md
  ROADMAP.md
  PRIORITIZATION-LOG.md

docs/product/research/
  RESEARCH-REGISTRY.md
  INTERVIEW-GUIDES.md
  USABILITY-PLANS.md
  RESEARCH-FINDINGS.md
```

Sensitive raw research data should not be stored broadly in the repository.

---

# Research Registry

Recommended fields:

```text
research_id

title

research_question

method

participants

Product_version

date

owner

evidence_location

privacy_classification

findings

confidence

related_opportunities
```

---

# Research Finding Record

Recommended:

```text
finding_id

research_id

finding

evidence_count

affected_audience

confidence

limitations

related_problem

related_opportunity
```

---

# Research Confidence

Recommended:

```text
weak

moderate

strong

contradictory
```

---

# Contradictory Evidence

When evidence conflicts:

1. Preserve both findings.
2. Identify audience and context differences.
3. Investigate measurement quality.
4. Avoid averaging away meaningful differences.
5. Define additional research.
6. Delay irreversible decisions where necessary.

---

# Product Assumption Architecture

Every opportunity contains assumptions.

Potential categories:

```text
User assumption

Problem assumption

Value assumption

Usability assumption

Feasibility assumption

Viability assumption

Safety assumption

Growth assumption
```

---

# Assumption Record

Recommended fields:

```text
assumption_id

opportunity_id

statement

category

risk

evidence

confidence

test_method

result

status
```

---

# Assumption Status

Recommended:

```text
untested

testing

supported

partially_supported

rejected

obsolete
```

---

# Riskiest Assumption Test

Discovery should prioritize the assumption that could invalidate the opportunity most severely.

Example:

```text
Opportunity:
Add automatic recurring Transaction creation.

Riskiest assumption:
Users can understand and safely control automatic creation without causing duplicate financial records.
```

---

# Product Hypothesis Architecture

Recommended format:

```text
We believe that

[capability or change]

for

[target audience]

will improve

[desired outcome].

We will know this when

[primary metric]

changes without degrading

[guardrails].
```

---

# Hypothesis Example — Onboarding

```text
We believe that a guided first-Transaction flow for new users will improve successful activation.

We will know this when first valid Transaction completion increases without increasing duplicate entries, validation confusion or Accessibility failures.
```

---

# Hypothesis Example — Synchronization Status

```text
We believe that clearer local and remote Save states will improve user understanding and reduce repeated Transactions.

We will know this when state-identification success increases and duplicate-Transaction incidents decrease.
```

---

# Hypothesis Example — Assistant Explanation

```text
We believe that optional read-only explanations of deterministic Reports will help some users understand available financial information.

We will know this when Report comprehension improves without increasing incorrect advice interpretation, Privacy complaints or dependency on the Assistant for core workflows.
```

---

# Discovery Exit Criteria

Discovery should produce enough evidence to decide:

```text
Proceed

Proceed with reduced scope

Continue discovery

Run an experiment

Defer

Reject
```

Discovery is not required to eliminate all uncertainty.

It should reduce the highest-risk uncertainty to an acceptable level.

---

# Opportunity Decision Record

Recommended template:

```markdown
# Opportunity Decision

## Opportunity

Which user or Product opportunity is being evaluated?

## Audience

Who experiences it?

## Problem

Which problem is being addressed?

## Evidence

Which qualitative, quantitative, technical, Accessibility, Support or incident evidence exists?

## Desired Outcome

What should improve?

## Primary Metric

Which measure indicates success?

## Guardrails

Which measures must not degrade?

## Strategic Alignment

How does this support Nexio strategy?

## Risks

Which value, usability, feasibility, safety, Privacy, Accessibility and compliance risks exist?

## Dependencies

Which Product or technical capabilities are required?

## Decision

Proceed, continue discovery, defer or reject.

## Owner and Review Date

Who owns the opportunity and when is it reviewed?
```

---

# Product Discovery Status

Recommended:

```text
not_started

framing

researching

synthesizing

testing_solution

decision_ready

paused

completed
```

---

# Opportunity Confidence versus Priority

High confidence does not automatically mean high priority.

Example:

```text
A minor icon improvement may be strongly validated but low priority.
```

Low confidence does not automatically mean low priority.

Example:

```text
A suspected cross-owner risk may require immediate investigation despite uncertainty.
```

---

# Product Risk Architecture

Every material opportunity should assess:

```text
Financial risk

Owner-isolation risk

Data-loss risk

Privacy risk

Accessibility risk

Reliability risk

Compliance risk

Reputational risk

Provider risk

Migration risk
```

---

# Product Risk Levels

Recommended:

```text
Critical

High

Moderate

Low
```

---

# Critical Product Risk

Examples:

- Financial corruption
- Cross-owner data
- Duplicate Transfer
- Deleted Account restoration
- Advertising receiving exact financial data
- Assistant executing without confirmation

---

# High Product Risk

Examples:

- Misleading synchronization state
- Inaccessible Account deletion
- Provider lock-in
- Incomplete Export
- Android process-death duplication

---

# Product Risk Owner

Every Critical or High Product risk requires:

- Named owner
- Mitigation
- Detection
- Guardrail
- Escalation
- Decision authority

---

# Product Strategy Themes

Potential strategic themes for Nexio:

```text
Trustworthy Financial Records

Confident Daily Use

Clear Cross-Platform Experience

User-Controlled Privacy

Reliable Offline and Synchronization

Accessible Financial Understanding

Safe Optional Assistance

Sustainable Monetization
```

These themes should be reviewed and validated.

---

# Theme — Trustworthy Financial Records

Potential outcomes:

- Exact Money
- Explicit Currency
- Correct Transfers
- Correct Reports
- Low duplicate rate
- Recoverable state

---

# Theme — Confident Daily Use

Potential outcomes:

- Faster valid Transaction entry
- Better correction
- Clear status
- Better navigation
- Lower confusion

---

# Theme — Clear Cross-Platform Experience

Potential outcomes:

- Equivalent workflows on Web and Android
- Better foldable layout
- Safe rotation
- Consistent state
- Reliable updates

---

# Theme — User-Controlled Privacy

Potential outcomes:

- Findable settings
- Effective withdrawal
- Complete Export
- Functional deletion
- Accurate public disclosures

---

# Theme — Reliable Offline and Synchronization

Potential outcomes:

- Durable local Save
- Idempotent Sync
- Conflict resolution
- Recovery
- Honest state

---

# Theme — Accessible Financial Understanding

Potential outcomes:

- Screen-reader completion
- Large-text support
- Accessible charts
- Understandable Reports
- Clear content

---

# Theme — Safe Optional Assistance

Potential outcomes:

- Read-only explanations
- Structured proposals
- Confirmation
- Manual alternatives
- Minimal context

---

# Theme — Sustainable Monetization

Potential outcomes:

- Clear Product value
- Safe Advertising
- Fair subscriptions
- Core feature continuity
- Transparent entitlement

---

# Product Goal Architecture

Product goals should connect strategy themes to outcomes.

Recommended fields:

```text
goal_id

theme

goal_statement

time_horizon

audience

primary_outcome

guardrails

owner

confidence

status
```

---

# Product Goal Example

```text
Improve the reliability and understandability of Transaction creation across Web and Android.
```

Related outcomes:

- Higher valid completion
- Lower duplicate rate
- Better state-identification accuracy
- Lower Support escalation

---

# Goal versus Feature

Goal:

```text
Help users understand monthly spending.
```

Potential features:

- Category summary
- Cash-flow Report
- Accessible chart
- Text summary
- Filtered Export

A goal should not prescribe one solution before discovery.

---

# Product Objective Architecture

A Product objective should be:

- Outcome-focused
- Time-bounded where appropriate
- Measurable
- Connected to strategy
- Guardrail-aware
- Small enough to guide prioritization

---

# Objective Example

```text
Improve successful first-Transaction completion for new users while maintaining financial correctness, Accessibility and duplicate-operation guardrails.
```

---

# Key Result Principles

Key Results should measure outcome rather than task completion.

Weak:

```text
Release three onboarding screens.
```

Stronger:

```text
Increase the percentage of eligible new users who create their first valid Transaction without facilitator or Support assistance.
```

Numeric targets should be based on current reliable baselines.

---

# Product Initiative Architecture

An initiative is a coordinated set of opportunities and capabilities intended to improve an objective.

Example:

```text
First Financial Entry Initiative
```

Potential scope:

- Account creation
- First Transaction guidance
- Form validation
- Empty states
- Sync-state explanation
- Accessibility
- Help content

---

# Initiative Record

Recommended fields:

```text
initiative_id

title

objective

audience

opportunities

expected_outcomes

guardrails

dependencies

owner

roadmap_horizon

status
```

---

# Initiative Status

Recommended:

```text
candidate

discovery

prioritized

planned

in_delivery

rolling_out

measuring

completed

deferred

cancelled
```

---

# Capability Architecture

A capability is a Product behavior users or systems can rely on.

Examples:

```text
Create a Transaction offline.

Export financial records.

Resolve a synchronization Conflict.

Delete the Nexio Account.

Receive a privacy-safe Notification.
```

---

# Capability Record

Recommended fields:

```text
capability_id

initiative

user_value

Product_behavior

requirements

platforms

dependencies

release_state

measurement

owner
```

---

# Feature Architecture

A feature is one implemented expression of a capability.

Example:

```text
Transaction status badge
```

may support the capability:

```text
Understand synchronization state.
```

---

# Product Backlog Architecture

The Product backlog should contain:

```text
Opportunities

Discovery work

Capabilities

Experiments

Maintenance

Accessibility remediation

Reliability work

Compliance work

Feature removal

Technical enablers with Product impact
```

---

# Backlog Item Record

Recommended fields:

```text
item_id

item_type

title

problem_or_requirement

audience

expected_outcome

evidence

confidence

risk

priority

dependencies

estimate

owner

status

roadmap_horizon
```

---

# Backlog Item Types

Recommended:

```text
opportunity

discovery

capability

experiment

defect

risk_reduction

accessibility

reliability

privacy

compliance

maintenance

deprecation
```

---

# Defect versus Opportunity

A defect means current behavior violates an existing requirement or expected behavior.

An opportunity means the current Product may be valid but can improve an outcome.

Do not hide Critical defects inside ordinary feature prioritization.

---

# Risk-Reduction Item

A risk-reduction item may not produce immediate visual value.

Examples:

- Operation ledger
- RLS tests
- Recovery exercise
- Provider kill switch
- Signing-key recovery

These items may still be high priority.

---

# Maintenance Item

Examples:

- Dependency update
- Android target update
- Provider API migration
- License correction
- Policy update
- Feature Flag removal

---

# Deprecation Item

Examples:

- Remove legacy CSS authority
- Remove old synchronization queue
- Remove obsolete provider
- Remove unsupported Report
- Remove expired experimental screen

---

# Backlog Status

Recommended:

```text
new

triage

needs_evidence

discovery

ready_for_prioritization

prioritized

planned

in_delivery

validation

released

measuring

completed

deferred

rejected

obsolete
```

---

# Backlog Triage

Every new item should answer:

```text
What type of item is this?

Which problem or requirement does it address?

Which users are affected?

Which evidence exists?

Which risk exists?

Is it duplicate?

Is it already represented by an opportunity?

Does it require immediate P0 handling?
```

---

# Product Intake Channels

Potential intake sources:

```text
User feedback

Support

Store reviews

Analytics

Accessibility audits

Security findings

Privacy requests

Compliance reviews

Engineering findings

Provider notices

Incidents

Leadership requests

Competitive research
```

---

# Stakeholder Request Governance

A stakeholder request should enter the same Product evaluation process.

Required translation:

```text
Requested solution

↓

Underlying need

↓

Affected audience

↓

Expected outcome

↓

Evidence

↓

Risk

↓

Priority
```

Position or authority alone should not convert an unvalidated request into a Product commitment, except for mandatory legal, Security or P0 work.

---

# User Feedback Record

Recommended fields:

```text
feedback_id

channel

date

audience

summary

original_language

related_problem

related_opportunity

severity

frequency_signal

privacy_classification

owner
```

---

# Feedback Privacy

Feedback records should avoid unnecessary:

- Exact financial values
- Full names
- Email addresses
- Account identifiers
- Attachment content
- Authentication details

---

# Feedback Volume

High volume may indicate importance but should be evaluated alongside:

- Severity
- Strategic alignment
- Workaround
- Accessibility
- Financial risk
- User reach
- Confidence

---

# Silent Problems

Some important problems produce little direct feedback.

Examples:

- Users abandoning before Support contact
- Screen-reader users unable to complete a form
- Users misunderstanding a Report
- Duplicate records users correct manually
- Privacy choices users cannot find

Discovery should investigate silent failure.

---

# Product Decision Principles

A Product decision should record:

```text
Problem

Evidence

Options

Tradeoffs

Risk

Dependencies

Decision

Rejected alternatives

Owner

Review trigger
```

---

# Decision Reversibility

Classify decisions:

```text
reversible

costly_to_reverse

difficult_to_reverse

effectively_irreversible
```

---

# Reversible Decision

Examples:

- Content variation
- Layout experiment
- Feature Flag default
- Optional empty-state illustration

---

# Costly-to-Reverse Decision

Examples:

- Provider integration
- Navigation model
- Subscription packaging
- Public API contract

---

# Difficult-to-Reverse Decision

Examples:

- Money representation
- Owner model
- Long-term data retention
- Regional legal structure

---

# Effectively Irreversible Decision

Examples:

- Permanent data deletion
- Public disclosure of private data
- Lost signing credential without recovery
- Unrecoverable migration

---

# Product Decision Record

Recommended:

```markdown
# Product Decision

## Problem

Which user or Product problem is being addressed?

## Evidence

What supports the problem?

## Options

Which solutions were considered?

## Expected Outcome

What should improve?

## Guardrails

What must not degrade?

## Risks

Which financial, Security, Privacy, Accessibility, reliability and compliance risks exist?

## Dependencies

Which capabilities are required?

## Reversibility

How difficult is reversal?

## Decision

What was selected?

## Rejected Alternatives

Why were they rejected?

## Owner

Who is accountable?

## Review Trigger

Which evidence or event should reopen the decision?
```

---

# Product Discovery Anti-Patterns

The following are prohibited:

## Feature-First Roadmap

Starting with a predetermined solution without a defined problem.

## Competitor Copying

Adding a capability only because another application has it.

## AI Trend Prioritization

Prioritizing AI because it is popular rather than because it solves a validated problem.

## Deadline-Only Strategy

Selecting work solely to fill a calendar release.

## Engagement at Any Cost

Optimizing sessions, clicks or Notifications without user-value guardrails.

## Revenue before Trust

Introducing monetization while Critical financial or owner risks remain.

## Survey as Final Truth

Treating stated preference as proof of actual behavior.

## Analytics as User Understanding

Assuming event data explains motivation or comprehension.

## Persona Fiction

Creating detailed unsupported biographies and treating them as evidence.

## One Interview as Market Validation

Generalizing from one participant without limitation.

## Support Volume as Sole Priority

Ignoring Critical low-volume defects.

## Prototype as Technical Proof

Treating a clickable prototype as evidence of persistence or Security.

## Roadmap as Promise List

Publishing speculative future work as committed capability.

## Metric without Definition

Using ambiguous measures such as “engagement” or “satisfaction” without calculation rules.

## Outcome without Guardrails

Improving a primary metric while financial or Accessibility harm increases.

## Discovery without Decision

Continuing research indefinitely without identifying the remaining uncertainty.

## Decision without Review Trigger

Treating a Product decision as permanent despite changed evidence.

---

# Part 1 Product Review Questions

Before accepting a Product strategy, answer:

```text
Which user value does Nexio provide?

Which audiences are intentionally served?

Which capabilities are outside Product boundaries?

Which differentiators are implemented rather than aspirational?

Which trust guarantees define the Product?

Which evidence supports the strategy?
```

---

# Audience Review Questions

```text
Which need defines the audience?

Which evidence supports the segment?

Which accessibility and privacy needs exist?

Which platforms are relevant?

Which assumptions remain?

Is the audience eligible under current policy?
```

---

# Problem Review Questions

```text
Who experiences the problem?

When does it occur?

What is the impact?

Which workaround exists?

Which evidence supports it?

Is the statement independent from one solution?

Is it within Nexio boundaries?
```

---

# Opportunity Review Questions

```text
Which problem does the opportunity address?

Which outcome should improve?

Which evidence exists?

Which risk exists?

Which dependencies exist?

Which alternative solutions remain possible?

What would invalidate the opportunity?
```

---

# Outcome Review Questions

```text
Is the outcome observable?

Does it represent user success?

Which primary metric applies?

Which guardrails apply?

Does the metric create harmful incentives?

Which baseline exists?

Which measurement window is appropriate?
```

---

# Discovery Review Questions

```text
Which uncertainty is being reduced?

Which evidence method fits the question?

Does the research request unnecessary financial data?

Does it include Accessibility?

Does it consider failure states?

Which decision will the research inform?
```

---

# Interview Review Questions

```text
Are questions based on real past behavior?

Is the guide neutral?

Are participants appropriate?

Is recording governed?

Are sensitive financial values minimized?

How will findings be synthesized?
```

---

# Usability Review Questions

```text
Does the task use synthetic data?

Does success include financial correctness?

Does success include final-state understanding?

Are assistive-technology users included where relevant?

Does the prototype level match the question?

Which technical guarantees remain untested?
```

---

# Metric Review Questions

```text
What exactly is counted?

Which population is included?

Which events are required?

Are financial payloads excluded?

Which guardrails apply?

Can the metric be manipulated?

Can it be segmented safely?
```

---

# Product Decision Review Questions

```text
Which options were considered?

Which evidence supports the selected option?

Which risks remain?

How reversible is the decision?

Which capability or provider dependency is introduced?

Which event should reopen the decision?
```

---

# Part 1 Acceptance Criteria

The Product Roadmap and Prioritization foundation is accepted only when:

```text
□ Product strategy remains distinct from the Engineering implementation plan.

□ Financial trust has priority over feature growth.

□ Product planning begins with user problems.

□ Requested features are translated into underlying needs and outcomes.

□ Product value is observable.

□ Outputs remain distinct from outcomes.

□ Activity remains distinct from progress.

□ Discovery work does not receive false delivery precision.

□ The roadmap remains outcome-oriented.

□ Product discovery is continuous.

□ Existing evidence is preferred over assumption.

□ Product Analytics is not treated as the only evidence.

□ Qualitative and quantitative evidence are combined.

□ User value cannot override financial, owner, Privacy or Accessibility guardrails.

□ Product scope remains coherent.

□ Core workflows remain independent from optional providers.

□ Accessibility is included in Product decisions.

□ Failure states are included in Product decisions.

□ Existing users and existing data are considered.

□ Maintenance, risk reduction and feature removal appear in the roadmap.

□ Reversible decisions are preferred during uncertainty.

□ Irreversible decisions receive enhanced review.

□ Product metrics do not encourage harmful engagement.

□ Trust is part of Product success.

□ Future roadmap items are not presented publicly as existing capabilities.

□ AI cannot fabricate Product evidence.

□ Product vision is defined.

□ Product mission is defined.

□ Product promise remains narrow and provable.

□ Product positioning does not imply regulated financial services.

□ Strategic differentiators require implementation evidence.

□ Strategic non-goals are explicit.

□ Product strategy has a versioned record.

□ Strategy changes trigger review.

□ Audiences are defined by need and context.

□ Primary and secondary audiences are distinguishable.

□ Unsupported audiences are explicit.

□ Audience segments have evidence and confidence.

□ Personas remain evidence-based.

□ Personas do not replace Accessibility research.

□ User needs remain independent from interface solutions.

□ Jobs-to-be-done may represent functional, emotional and social needs.

□ Core user jobs are identified.

□ Product problems identify audience, context, impact and evidence.

□ Solution-disguised-as-problem statements are rejected.

□ Stakeholder preferences are translated into user problems.

□ Opportunities have stable records.

□ Opportunities identify expected outcomes.

□ Opportunities support multiple potential solutions.

□ Accessibility, reliability, operational and compliance opportunities are first-class.

□ Monetization opportunities require separate trust and fairness review.

□ Outcomes describe observable changes in user success.

□ Acquisition, activation, trust, Accessibility, reliability and Privacy outcomes are supported.

□ Metrics have explicit definitions.

□ Metrics distinguish primary, guardrail, counter and diagnostic measures.

□ Baselines are established before unsupported targets.

□ Metric segmentation receives Privacy review.

□ Product guardrails include financial correctness and owner isolation.

□ Guardrail failure can stop experiments and rollouts.

□ Discovery evaluates value, usability, feasibility, viability, safety, Accessibility, Privacy and compliance.

□ Discovery methods match the question being investigated.

□ Interviews use real past behavior.

□ Interviews minimize sensitive financial data.

□ Usability tasks use synthetic data.

□ Usability success includes financial correctness and state understanding.

□ Prototypes do not claim to prove persistence or Security.

□ Technical spikes answer bounded questions.

□ Competitive research does not justify blind copying.

□ Surveys are reviewed for bias.

□ Support cases inform Product discovery.

□ Incidents inform Product opportunities.

□ Store feedback is verified before generalization.

□ Research artifacts have governed repository locations.

□ Sensitive raw research is not stored broadly.

□ Research findings include confidence and limitations.

□ Contradictory evidence remains visible.

□ Product assumptions have stable records.

□ The riskiest assumption is tested first.

□ Product hypotheses identify audience, outcome, metric and guardrails.

□ Discovery exits with an explicit decision.

□ Opportunity confidence remains distinct from priority.

□ Product risks include financial, owner, Privacy and Accessibility impact.

□ Critical and High Product risks have owners and controls.

□ Strategic Product themes are defined.

□ Themes connect to measurable outcomes.

□ Product goals remain distinct from features.

□ Objectives are outcome-focused.

□ Key Results measure behavior or success rather than tasks.

□ Initiatives connect opportunities to outcomes.

□ Capabilities describe reliable Product behavior.

□ Features remain implementations of capabilities.

□ The Product backlog supports opportunities, discovery, risks, maintenance and deprecation.

□ Critical defects are not hidden inside ordinary feature prioritization.

□ Risk-reduction work can receive high priority without visible novelty.

□ Product intake channels are defined.

□ Stakeholder requests use the same evaluation process.

□ User feedback is minimized and privacy-safe.

□ Silent problems are actively investigated.

□ Product decisions record options, tradeoffs and review triggers.

□ Decision reversibility is classified.

□ Part 1 Product anti-patterns are prohibited.
```

---

# Product Roadmap Constitutional Rule

Every Nexio Product opportunity, initiative, capability, experiment and roadmap commitment must answer:

```text
Which user or Product problem is being addressed, which evidence supports it, which outcome should improve, which guardrails must remain protected and why is this work more important than the alternatives?
```

When the answer is uncertain, prefer the action that:

- Returns to problem framing.
- Collects the missing evidence.
- Narrows the target audience.
- Tests the riskiest assumption.
- Uses a smaller reversible solution.
- Protects financial correctness.
- Protects owner isolation.
- Includes Accessibility.
- Adds Privacy review.
- Defines a measurable outcome.
- Adds guardrails.
- Delays commitment.
- Defers the opportunity.
- Rejects the feature.

A Product roadmap is not a list of everything Nexio could build.

It is a governed explanation of which user and Product outcomes matter most, which evidence supports them and which risks Nexio refuses to trade away.

---
---

# Product Prioritization Architecture

Product prioritization determines which validated problems, opportunities and capabilities should receive limited Nexio resources.

Prioritization must consider:

```text
User value

Financial trust

Owner safety

Data durability

Accessibility

Privacy

Reliability

Strategic alignment

Evidence confidence

Dependency enablement

Delivery effort

Operational cost

Reversibility

Product viability
```

No prioritization score may override a confirmed Critical financial, Security, Privacy, Accessibility, deletion or recovery requirement.

---

# Prioritization Objectives

The prioritization process should:

- Direct resources toward the most important outcomes.
- Preserve Product trust.
- Make tradeoffs visible.
- Prevent stakeholder position from becoming automatic priority.
- Prevent cosmetic work from displacing Critical risk.
- Distinguish mandatory work from discretionary Product work.
- Account for dependencies.
- Account for maintenance.
- Reserve capacity for discovery.
- Keep deferred opportunities visible.
- Make rejection an explicit valid decision.
- Prevent backlog size from becoming a measure of Product health.

---

# Prioritization Decision Order

When competing work exists, evaluate in this order:

```text
1. Immediate user or Product harm

2. Financial integrity

3. Owner isolation and Security

4. Data durability and recovery

5. Privacy and Account deletion

6. Accessibility blockers

7. Mandatory store or compliance work

8. Core Product task success

9. Reliability and Support burden

10. Strategic Product outcomes

11. Growth

12. Monetization

13. Visual refinement
```

This ordering does not mean visual refinement is unimportant.

It means visual refinement must not displace unresolved higher-order harm.

---

# Product Priority Classes

Recommended classes:

```text
P0 — Immediate Product safety

P1 — Trust and mandatory foundations

P2 — Core user outcome

P3 — Product quality and growth

P4 — Optional expansion
```

---

# P0 — Immediate Product Safety

P0 includes confirmed or credible imminent risk involving:

- Incorrect financial Amount
- Incorrect Currency
- Duplicate financial mutation
- Broken Transfer
- Cross-owner access
- Data loss
- Deleted Account reactivation
- Exposed private Attachment
- Compromised credential
- Inability to produce or recover the Production Android artifact

P0 work interrupts ordinary roadmap sequencing.

---

# P1 — Trust and Mandatory Foundations

P1 includes:

- Exact Money
- Explicit Currency
- Owner isolation
- Reliable synchronization
- Backup and recovery
- Functional Account deletion
- Critical Accessibility
- Required store changes
- Required provider migrations
- Security remediation
- Privacy controls
- Reproducible builds

---

# P2 — Core User Outcome

P2 includes capabilities that materially improve core jobs such as:

- Create and correct Transactions
- Manage Accounts
- Complete Transfers
- Understand Reports
- Track Goals
- Understand synchronization
- Export records
- Use Nexio across supported platforms

---

# P3 — Product Quality and Growth

P3 includes:

- Onboarding improvement
- Advanced Reports
- Product education
- Performance optimization
- Additional Import flows
- Better Notifications
- Product Analytics
- Support deflection
- Refined visual hierarchy
- Regional expansion discovery

---

# P4 — Optional Expansion

P4 includes:

- Advanced Assistant actions
- Additional AI capabilities
- Personalized Advertising
- Complex integrations
- Subscription expansion
- Additional platforms
- Experimental financial visualizations

---

# Mandatory versus Discretionary Work

Every roadmap item should be classified as:

```text
mandatory

risk_reduction

core_value

growth

monetization

maintenance

discovery

deprecation
```

---

# Mandatory Work

Mandatory work may arise from:

- P0 incident
- Security requirement
- Privacy requirement
- Accessibility blocker
- Store requirement
- Provider end of life
- License issue
- Data migration
- Recovery deficiency
- Contractual obligation
- Public-policy correction

Mandatory does not mean unplanned or exempt from quality review.

---

# Risk-Reduction Work

Risk-reduction work lowers probability or impact of Product harm.

Examples:

```text
Operation ledger

RLS tests

Backup restore exercise

Advertising kill switch

Signing-key recovery

Provider exit procedure
```

---

# Core-Value Work

Core-value work improves the Product's central user jobs.

Examples:

```text
Reliable Transaction creation

Clear Account balance

Correct Transfer handling

Useful Reports

Safe Export
```

---

# Growth Work

Growth work should improve:

- Appropriate acquisition
- Activation
- Retention through value
- Trustworthy referral
- Reengagement without manipulation

---

# Monetization Work

Monetization work should:

- Create clear user value.
- Avoid blocking Privacy or deletion.
- Preserve core Product continuity.
- Use accurate pricing.
- Avoid deceptive urgency.
- Avoid influencing financial calculations.
- Include Support and entitlement operations.

---

# Maintenance Work

Maintenance work includes:

- Dependency updates
- Android compatibility
- Provider migrations
- License correction
- Performance preservation
- Documentation updates
- Feature Flag cleanup
- Legacy removal
- Policy updates

Maintenance should remain visible in the Product roadmap when it affects user experience, risk or delivery capability.

---

# Discovery Work

Discovery reduces uncertainty before large commitment.

Examples:

```text
User research

Technical spike

Prototype test

Provider evaluation

Accessibility research

Pricing research

Regional readiness research
```

---

# Deprecation Work

Deprecation removes:

- Obsolete features
- Unsafe providers
- Duplicated workflows
- Legacy architecture
- Unused settings
- Misleading public claims
- Unsupported platforms

Removal should be planned as Product work rather than hidden Engineering cleanup.

---

# Priority Lanes

Recommended Product roadmap lanes:

```text
Safety and Trust

Core Experience

Accessibility and Inclusion

Reliability and Recovery

Privacy and Compliance

Platform Quality

Growth and Education

Assistant and Automation

Monetization

Maintenance and Deprecation
```

A roadmap view should avoid combining all work into one undifferentiated list.

---

# Prioritization Inputs

Every prioritized item should identify:

```text
Problem

Audience

Evidence

Expected outcome

Risk

Urgency

Strategic alignment

Dependencies

Effort

Confidence

Reversibility

Guardrails
```

---

# Prioritization Evidence Levels

Recommended:

```text
E0 — Assumption only

E1 — Weak evidence

E2 — Emerging evidence

E3 — Supported evidence

E4 — Strong evidence

E5 — Mandatory or incident-proven
```

---

# E0 — Assumption Only

No direct user or behavioral evidence.

The item may still receive discovery priority.

It should not receive a major delivery commitment solely on assumption.

---

# E1 — Weak Evidence

Examples:

- One internal opinion
- One unverified user report
- Competitor observation
- Small anecdotal signal

---

# E2 — Emerging Evidence

Examples:

- Repeated feedback from a small group
- Initial usability finding
- Limited Analytics signal
- Repeated Support theme

---

# E3 — Supported Evidence

Examples:

- Multiple evidence sources
- Repeated user behavior
- Consistent usability findings
- Reliable Analytics and qualitative agreement

---

# E4 — Strong Evidence

Examples:

- Large consistent pattern
- Strong repeated research
- Clear outcome impact
- Successful prior experiment
- Validated Accessibility need

---

# E5 — Mandatory or Incident-Proven

Examples:

- Confirmed data-loss incident
- Confirmed cross-owner issue
- Mandatory store correction
- Confirmed licensing conflict
- Provider retirement
- Verified deletion failure

---

# Evidence Confidence

Confidence should evaluate:

```text
Evidence quality

Evidence quantity

Audience match

Recency

Measurement reliability

Technical certainty

Solution uncertainty
```

---

# Evidence Recency

Older evidence may remain valid when:

- The user need is stable.
- The Product behavior has not materially changed.
- The platform context remains the same.

Evidence should be renewed when:

- UI changed.
- Platform changed.
- Provider changed.
- Target audience changed.
- Product behavior changed.
- A major incident occurred.

---

# Product Value Dimensions

Recommended value dimensions:

```text
User importance

Problem frequency

Task criticality

Reach

Trust impact

Accessibility impact

Support impact

Strategic alignment

Retention through value

Revenue value where applicable
```

---

# User Importance

Evaluate how strongly the problem affects the user's intended outcome.

Potential scale:

```text
0 — Negligible

1 — Minor inconvenience

2 — Noticeable friction

3 — Material task difficulty

4 — Prevents intended outcome

5 — Creates financial or trust harm
```

---

# Problem Frequency

Potential scale:

```text
0 — Rare or unknown

1 — Occasional

2 — Repeated for a limited segment

3 — Common within an important segment

4 — Common across major segments

5 — Present in nearly every core journey
```

Frequency must not override severity.

---

# Task Criticality

Potential:

```text
0 — Decorative

1 — Optional convenience

2 — Secondary workflow

3 — Important workflow

4 — Core financial workflow

5 — Safety, ownership or recovery workflow
```

---

# Reach

Reach should estimate the number or proportion of eligible users affected during the intended measurement window.

Use:

```text
Known

Estimated

Unknown
```

Do not invent precise reach when instrumentation or audience evidence does not exist.

---

# Trust Impact

Potential questions:

```text
Does the item improve confidence in financial accuracy?

Does it clarify synchronization?

Does it reduce duplicate risk?

Does it improve deletion transparency?

Does it improve recovery?

Does it reduce misleading state?
```

---

# Accessibility Impact

Evaluate whether the item:

- Removes a critical barrier
- Improves equivalent completion
- Improves comprehension
- Improves focus or navigation
- Improves large-text or reflow support
- Introduces a new barrier

A critical Accessibility remediation may be mandatory regardless of ordinary score.

---

# Support Impact

Evaluate:

- Support case volume
- Severity
- Time to resolution
- Destructive troubleshooting risk
- Need for agent access
- User ability to self-resolve
- Repeated escalation

---

# Strategic Alignment

Potential scale:

```text
0 — Outside strategy

1 — Weakly adjacent

2 — Supports one secondary theme

3 — Supports a current strategic theme

4 — Supports a primary Product objective

5 — Essential to Product promise
```

---

# Revenue Value

Revenue value applies only to monetization opportunities.

It must include:

- Expected user value
- Product fairness
- Store fees
- Provider cost
- Support cost
- Refund exposure
- Entitlement complexity
- Retention impact
- Trust impact

---

# Risk Dimensions

Recommended risk dimensions:

```text
Financial risk

Owner-isolation risk

Data-loss risk

Security risk

Privacy risk

Accessibility risk

Reliability risk

Compliance risk

Provider risk

Migration risk

Reputational risk
```

---

# Delivery Cost Dimensions

Recommended:

```text
Engineering effort

Design effort

Research effort

Testing effort

Migration effort

Android effort

Operations effort

Support effort

Compliance effort

Maintenance cost
```

---

# Cost of Delay

Cost of delay considers the impact of postponement.

Potential categories:

```text
immediate

time_sensitive

increasing

stable

declining
```

---

# Immediate Cost of Delay

Examples:

- P0 incident
- Broken Production release
- Store removal risk
- Provider shutdown
- Exposed secret
- Confirmed deletion failure

---

# Time-Sensitive Cost of Delay

Examples:

- Android compatibility deadline
- Provider API retirement
- Policy correction
- Subscription price change
- Regional launch dependency

---

# Increasing Cost of Delay

Examples:

- Technical debt affecting every release
- Growing duplicate-data problem
- Increasing Support volume
- Expanding legacy migration surface

---

# Stable Cost of Delay

The opportunity remains useful but does not become materially harder or more harmful soon.

---

# Declining Cost of Delay

The opportunity may become irrelevant because:

- Provider is being removed.
- Audience is shrinking.
- Replacement capability is planned.
- Market context changed.

---

# Dependency Enablement Value

A capability receives higher enabling value when it unlocks several later outcomes.

Examples:

```text
Canonical Transaction commands

Shared financial forms

Owner-scoped local persistence

Operation identity

Runtime Design tokens

Provider Adapter boundaries
```

---

# Reversibility

Recommended classification:

```text
highly_reversible

reversible

costly_to_reverse

difficult_to_reverse

effectively_irreversible
```

Early uncertain work should favor more reversible options.

---

# Product Prioritization Score

A structured score may support comparison.

Recommended conceptual model:

```text
Priority Value =
User Importance
+ Task Criticality
+ Trust Impact
+ Strategic Alignment
+ Dependency Enablement
+ Accessibility Impact
+ Cost of Delay

Adjusted by:

Evidence Confidence
Delivery Effort
Operational Cost
Migration Risk
Reversibility
```

This model is guidance.

It must not become an automatic authority.

---

# Simplified Opportunity Score

A smaller team may use:

```text
Opportunity Score =
Impact × Confidence
÷ Effort
```

with mandatory review of:

```text
Financial guardrails

Owner guardrails

Accessibility

Privacy

Compliance

Dependencies
```

---

# Why a Single Score Is Insufficient

Two items can have the same numeric score but differ materially.

Example:

```text
Item A:
Minor Dashboard visual improvement.

Item B:
Low-frequency but confirmed duplicate Transfer defect.
```

Item B may require immediate priority despite lower reach.

---

# Prioritization Vetoes

The following authorities may block or escalate work:

```text
Financial Integrity Veto

Security Veto

Privacy Veto

Accessibility Veto

Recovery Veto

Compliance Veto

Release Veto
```

A veto requires:

- Requirement or risk
- Evidence
- Scope
- Owner
- Resolution condition

A veto should not be used for personal preference.

---

# Prioritization Decision Types

Every evaluated opportunity should receive one:

```text
accept

accept_for_discovery

accept_with_reduced_scope

accept_as_experiment

defer

reject

merge

replace

mandatory
```

---

# `accept`

The opportunity is sufficiently understood and prioritized for planning.

---

# `accept_for_discovery`

The problem may be valuable, but uncertainty is too high for delivery commitment.

---

# `accept_with_reduced_scope`

A smaller, safer or more reversible version is prioritized.

---

# `accept_as_experiment`

A controlled test should determine whether broader investment is justified.

---

# `defer`

The opportunity remains valid but is not currently the best use of resources.

---

# `reject`

The opportunity should not proceed under the current Product strategy or evidence.

---

# `merge`

The opportunity duplicates or belongs within an existing initiative.

---

# `replace`

A different solution or opportunity addresses the same problem more effectively.

---

# `mandatory`

The work must proceed because of immediate safety, policy, provider, Security or Product continuity requirements.

---

# Acceptance Criteria for Product Opportunities

Accept an opportunity when:

- The problem is within Product boundaries.
- The affected audience is defined.
- Evidence is sufficient for the intended commitment.
- The desired outcome is measurable.
- Guardrails are defined.
- Dependencies are understood.
- Risk is acceptable or mitigated.
- Product strategy supports it.
- A smaller higher-value alternative is not clearly preferable.
- Required owners exist.

---

# Accept for Discovery Criteria

Use discovery when:

- The problem may be important.
- User evidence is limited.
- Solution assumptions are high.
- Technical feasibility is uncertain.
- Provider behavior is uncertain.
- Monetization value is uncertain.
- Regional or compliance impact is uncertain.

---

# Reduced-Scope Criteria

Reduce scope when:

- Full capability has excessive migration risk.
- A smaller vertical slice can test value.
- One platform can safely validate interaction without creating long-term divergence.
- Provider integration is not yet required.
- Automation can begin as read-only.
- Personalization can begin as contextual or disabled.
- Advanced filtering can begin with one high-value filter.

A reduced scope must not remove mandatory safety, Accessibility or Privacy behavior.

---

# Experiment Criteria

Use an experiment when:

- The capability is reversible.
- User risk is bounded.
- Guardrails are measurable.
- Cohort assignment is safe.
- Failure can be detected.
- The experiment does not alter canonical financial meaning.
- The experiment does not weaken owner isolation.
- The experiment does not hide Privacy or deletion controls.

---

# Deferral Criteria

Defer when:

- Strategic alignment is weak.
- Evidence is insufficient.
- Dependencies are not ready.
- Higher-risk work is unresolved.
- Required owners are unavailable.
- Delivery cost is currently disproportionate.
- The opportunity is valuable but not urgent.
- The Product lacks reliable measurement.
- A provider or platform decision is pending.

A deferred item should have:

```text
Reason

Review trigger

Review date or condition

Owner
```

---

# Rejection Criteria

Reject when:

- The capability is outside Product boundaries.
- The problem is unsupported by evidence.
- The solution introduces unacceptable risk.
- It depends on misleading Product claims.
- It requires unnecessary sensitive data.
- It weakens core functionality.
- It conflicts with Accessibility.
- It conflicts with Privacy or deletion.
- It duplicates a stronger initiative.
- It cannot be operated or supported sustainably.
- A cheaper or safer alternative solves the problem.
- Evidence invalidated the assumption.

---

# Rejection Is Not Failure

Explicit rejection:

- Protects Product coherence.
- Reduces backlog noise.
- Prevents repeated evaluation.
- Records learning.
- Preserves focus.

Rejected items may be reconsidered when evidence or Product strategy changes.

---

# Opportunity Decision Log

Recommended file:

```text
docs/product/PRIORITIZATION-LOG.md
```

Recommended fields:

```text
decision_id

opportunity_id

decision

date

evidence

score_or_assessment

guardrails

dependencies

reason

owner

review_trigger
```

---

# Prioritization Meeting Architecture

Recommended review levels:

```text
Continuous triage

Periodic opportunity review

Roadmap review

Release-scope review

Strategic review
```

---

# Continuous Triage

Purpose:

- Classify new intake.
- Identify P0 or P1.
- Remove duplicates.
- Route discovery.
- Identify missing evidence.
- Assign temporary owner.

---

# Opportunity Review

Purpose:

- Compare opportunities.
- Review evidence.
- Assess outcomes.
- Review guardrails.
- Decide accept, defer or reject.

---

# Roadmap Review

Purpose:

- Allocate outcomes to horizons.
- Review dependencies.
- Review Product balance.
- Review capacity and mandatory work.
- Review strategic alignment.

---

# Release-Scope Review

Purpose:

- Confirm complete vertical slices.
- Prevent unfinished journeys.
- Confirm guardrails.
- Confirm measurement.
- Confirm operational readiness.

---

# Strategic Review

Purpose:

- Revisit target audiences.
- Revisit Product boundaries.
- Revisit strategic themes.
- Revisit monetization.
- Revisit regions.
- Revisit Product promise.

---

# Prioritization Participants

Potential roles:

```text
Product Owner

Product Designer

Engineering Owner

Domain Owner

Quality Owner

Security Owner

Privacy Owner

Accessibility Owner

Android Owner

Operations Owner

Support Owner

Compliance Owner
```

Not every review requires every role.

Risk determines participation.

---

# Product Roadmap Horizons

Recommended horizons:

```text
Now

Next

Later

Explore

Not Planned
```

---

# `Now`

Contains:

- Active Product outcomes
- Current initiatives
- Mandatory work
- Committed release scope
- High-confidence dependencies

`Now` should remain limited.

---

# `Next`

Contains:

- Prioritized opportunities
- Sufficient evidence
- Known dependencies
- No final delivery commitment unless separately approved

---

# `Later`

Contains:

- Strategically aligned opportunities
- Lower confidence or urgency
- Greater dependency uncertainty

`Later` is directional, not a promise.

---

# `Explore`

Contains:

- Discovery questions
- High uncertainty
- New audiences
- New providers
- New business models
- New regional opportunities

---

# `Not Planned`

Contains:

- Rejected capabilities
- Out-of-boundary capabilities
- Replaced opportunities
- Explicit non-goals

This horizon prevents repeated ambiguity.

---

# Horizon Confidence

Every item should identify confidence:

```text
committed

high_confidence

medium_confidence

low_confidence

exploratory
```

---

# Roadmap Horizon Rules

## Now

Requires:

- Defined outcome
- Defined scope
- Dependencies ready
- Delivery owner
- Guardrails
- Implementation path
- Release criteria

## Next

Requires:

- Valid opportunity
- Evidence
- Strategic alignment
- Identified dependencies
- No unresolved P0 conflict

## Later

Requires:

- Strategic relevance
- Problem framing
- Owner
- Review trigger

## Explore

Requires:

- Research question
- Assumption
- Discovery owner
- Expected decision

---

# Roadmap Time Representation

Use time ranges carefully.

Potential:

```text
Current release cycle

Following release cycle

Current quarter

Future horizon
```

Do not publish exact dates for:

- Unbounded discovery
- Unknown migration
- Provider approval
- Store review
- Research recruitment
- High-risk recovery work

without appropriate confidence.

---

# Product Roadmap Item

Recommended fields:

```text
roadmap_item_id

title

type

theme

opportunity

outcome

audience

horizon

confidence

priority

dependencies

guardrails

owner

status

public_visibility
```

---

# Public versus Internal Roadmap

Internal roadmap may include:

- Risks
- Provider dependencies
- Compliance blockers
- Deferred work
- Technical enablers
- Uncertainty
- Rejected alternatives

Public roadmap should be more conservative.

It should avoid:

- Guaranteed dates without confidence
- Security-sensitive details
- Unreleased provider commitments
- Features still under discovery
- Misleading availability
- Store-policy assumptions

---

# Roadmap Themes

Recommended Product roadmap themes:

```text
Financial Trust

Daily Financial Organization

Cross-Platform Confidence

Privacy and User Control

Accessibility and Understanding

Reliability and Recovery

Optional Assistance

Sustainable Product
```

---

# Theme Balance

A healthy roadmap should not consist only of:

- Growth
- Visual redesign
- AI
- Advertising
- New providers

It should also include:

- Trust
- Reliability
- Accessibility
- Privacy
- Recovery
- Maintenance

---

# Roadmap Balance Review

Review the roadmap by:

```text
User outcomes

Risk reduction

New capabilities

Maintenance

Discovery

Accessibility

Privacy

Platform support

Monetization
```

---

# Capacity Allocation Architecture

Capacity planning should create room for:

```text
Mandatory and safety work

Core Product outcomes

Maintenance and reliability

Discovery

Accessibility

Product growth

Technical cleanup
```

Exact percentages should reflect current Product state.

Do not create permanent rigid allocations that prevent urgent work.

---

# Suggested Capacity Bands

A team may define adjustable bands such as:

```text
Safety, reliability and mandatory work

Core Product outcomes

Maintenance and debt reduction

Discovery and experimentation

Growth and monetization
```

The roadmap owner should explain material deviations.

---

# Capacity Protection

Capacity should be protected for:

- P0 interruption
- Provider emergency
- Android publication issue
- Store policy correction
- Critical Accessibility remediation
- Recovery failure
- Security response

---

# Capacity Anti-Pattern

Prohibited:

```text
Allocate all capacity to visible features while deferring migration, recovery, Accessibility and provider maintenance indefinitely.
```

---

# MVP Architecture

MVP means:

```text
Minimum Viable Product
```

For Nexio, an MVP must be:

- Financially correct
- Owner-safe
- Data-durable
- Accessible in critical journeys
- Supportable
- Recoverable
- Honest about limitations

Minimum does not mean unsafe or incomplete.

---

# MVP Purpose

An MVP should test whether Nexio can deliver its central Product promise to an intended audience.

It should not attempt to prove every future capability.

---

# MVP Product Question

A Nexio MVP should answer:

```text
Can the intended user reliably create, organize, review and preserve personal financial records through an understandable and trustworthy experience?
```

---

# Candidate MVP Capability Set

A candidate MVP may include:

```text
Authentication

One owner Profile

Personal financial Accounts

Income Transactions

Expense Transactions

Basic Transfers

Transaction history

Basic deterministic summaries

Local durability

Synchronization state

Basic Export

Privacy controls

Account deletion

Critical Support path
```

The actual MVP must be validated against current Product strategy and implementation state.

---

# MVP Mandatory Quality

Even an early MVP requires:

```text
Exact Money

Explicit Currency

Owner isolation

Idempotent mutation

Reliable local Save

Recoverable synchronization

Accessible critical forms

Protected Authentication

Functional deletion

Safe Production deployment
```

---

# MVP Optional Exclusions

A first MVP may exclude:

```text
Advanced AI actions

Personalized Advertising

Complex subscriptions

Advanced Import providers

Advanced charts

Multi-region launch

Complex Currency conversion

Advanced recurring automation

Extensive customization
```

---

# MVP Scope Record

Recommended fields:

```text
mvp_id

target_audience

Product_question

included_capabilities

excluded_capabilities

assumptions

primary_outcome

guardrails

platforms

release_plan

measurement_window

owner
```

---

# MVP Scope Test

Every included capability should be:

- Required to test the Product promise
- Complete enough for real use
- Safe
- Supportable
- Measurable

Every excluded capability should be:

- Nonessential to the current Product question
- Deferrable without misleading users
- Clearly absent from public claims

---

# Minimum Lovable Product

A later release may target a Minimum Lovable Product.

This should add:

- Clear visual hierarchy
- Thoughtful empty states
- Helpful content
- Smooth critical journeys
- Consistent themes
- Better onboarding

“Lovable” must not be used to justify delaying safety foundations.

---

# Minimum Marketable Product

A Minimum Marketable Product should additionally include:

- Accurate store listing
- Reliable publication
- Support readiness
- Policy readiness
- Public Product positioning
- Appropriate screenshots
- Measurement
- Operational monitoring

---

# Version Architecture

Product versions should communicate meaningful capability and compatibility.

Potential release classes:

```text
major

minor

patch

emergency
```

---

# Major Product Release

A major release may include:

- Significant navigation change
- Major Domain change
- Major synchronization change
- Major data migration
- New monetization model
- Major Product positioning change

A major release does not permit unsafe breaking changes.

---

# Minor Product Release

A minor release may include:

- New capability
- Significant workflow improvement
- New Report
- New optional provider
- New supported platform behavior

---

# Patch Release

A patch release may include:

- Defect correction
- Accessibility correction
- Reliability correction
- Content correction
- Security update
- Small performance improvement

---

# Emergency Release

An emergency release addresses:

- P0 financial defect
- Security incident
- Cross-owner defect
- Broken deletion
- Store-blocking issue
- Production startup failure

Emergency does not mean untested.

Testing scope may be narrowed to affected critical behavior, but evidence remains required.

---

# Product Version Record

Recommended fields:

```text
Product_version

release_id

release_class

theme

target_outcomes

included_capabilities

excluded_capabilities

migrations

platforms

guardrails

measurement

known_limitations

support_readiness

public_claims
```

---

# Release Theme Architecture

Every material release should have a concise theme connected to outcomes.

Examples:

```text
Reliable First Financial Entry

Clear Synchronization

Accessible Financial Review

Android Reliability

Privacy and User Control
```

---

# Weak Release Theme

```text
Version 3 Updates
```

---

# Stronger Release Theme

```text
Help users record and verify financial activity confidently across Web and Android.
```

---

# Release Theme Rules

A release theme should:

- Connect several coherent capabilities.
- Describe user or Product value.
- Avoid exaggerated claims.
- Avoid hiding mandatory risk work.
- Remain consistent with public notes.

---

# Vertical Slice Architecture

A vertical slice delivers one complete user outcome across necessary layers.

Example:

```text
Create Expense offline

includes:

UI

Domain validation

Local persistence

Operation queue

Synchronization

Status

Accessibility

Tests

Support guidance
```

---

# Horizontal Slice Risk

A horizontal slice such as:

```text
Build all database tables
```

may be necessary internally but does not create a complete user outcome.

Product releases should be organized around complete vertical slices where possible.

---

# Release Slice Criteria

A Product slice is complete when:

- The user journey works.
- Failure states work.
- Accessibility works.
- Data migration works.
- Support guidance exists.
- Monitoring exists.
- Public claims remain accurate.

---

# Platform Slice Strategy

Platform rollout options:

```text
Shared release

Web-first controlled validation

Android-first controlled validation

Feature-limited platform rollout
```

A platform-limited rollout must not create permanent Domain divergence.

---

# Web-First Validation

Web-first validation may be appropriate when:

- The capability is reversible.
- It does not change shared financial meaning independently.
- Android parity remains planned.
- User expectations are clear.
- Public claims state availability accurately.

---

# Android-First Validation

Android-first validation may be appropriate when:

- The problem is Android-specific.
- Lifecycle behavior is central.
- Store testing is required.
- Web behavior is unaffected.

---

# Platform Parity

Parity means equivalent Product outcome and financial meaning.

It does not require identical visual layout.

---

# Release Inclusion Criteria

Include a capability in a release when:

- It supports the release outcome.
- It is complete end to end.
- Dependencies are ready.
- Migration is ready.
- Tests pass.
- Guardrails are active.
- Support is ready.
- Public documentation is accurate.

---

# Release Exclusion Criteria

Exclude when:

- Only the happy path exists.
- Failure states are missing.
- Accessibility is incomplete.
- Migration is untested.
- Owner isolation is uncertain.
- Provider configuration is incomplete.
- Measurement is absent where required.
- Support cannot resolve expected failures.
- It does not support the release theme.

---

# Release Scope Freeze

A release may enter scope freeze when:

- Committed capabilities are defined.
- Dependencies are understood.
- Migration order is known.
- Critical risks have owners.
- Required reviewers are available.

After freeze, new work should enter only for:

- P0 or P1 defect
- Release blocker
- Mandatory store correction
- Security correction
- Critical Accessibility correction

---

# Scope Freeze Does Not Block Discovery

Discovery may continue for future horizons without expanding the current release.

---

# Backlog Hierarchy

Recommended:

```text
Strategic Theme

Objective

Initiative

Opportunity

Capability

Release Slice

Story or Task
```

---

# Strategic Theme

Defines a broad long-term direction.

---

# Objective

Defines a measurable Product outcome.

---

# Initiative

Coordinates related opportunities.

---

# Opportunity

Defines a problem area with potential value.

---

# Capability

Defines reliable Product behavior.

---

# Release Slice

Defines an end-to-end deliverable.

---

# Story or Task

Defines implementation work.

Product backlog should avoid being dominated by low-level tasks.

---

# Product Backlog Views

Recommended views:

```text
By strategic theme

By audience

By outcome

By priority

By horizon

By risk

By platform

By evidence confidence

By dependency

By status
```

---

# Backlog Readiness Levels

Recommended:

```text
untriaged

problem_framed

evidence_needed

discovery_ready

decision_ready

delivery_ready

release_ready
```

---

# `untriaged`

New item without classification.

---

# `problem_framed`

Audience, context and problem are defined.

---

# `evidence_needed`

Current evidence is insufficient.

---

# `discovery_ready`

Research question and assumptions are defined.

---

# `decision_ready`

Evidence supports accept, defer or reject decision.

---

# `delivery_ready`

Outcome, scope, dependencies, guardrails and requirements are defined.

---

# `release_ready`

Implementation, tests, migration, Support and operations are ready.

---

# Delivery-Ready Criteria

A Product item is delivery-ready only when:

```text
□ Problem is defined.

□ Audience is defined.

□ Outcome is defined.

□ Evidence is sufficient.

□ Priority is approved.

□ Scope is bounded.

□ Dependencies are ready.

□ Guardrails are defined.

□ Accessibility requirements are defined.

□ Privacy requirements are defined.

□ Failure states are defined.

□ Measurement is defined.

□ Product owner is assigned.
```

---

# Backlog Aging

Old backlog items should be reviewed for:

- Still-relevant problem
- Current evidence
- Product-boundary alignment
- Duplicate opportunity
- Provider change
- Audience change
- Strategy change
- Obsolete solution
- Changed effort

---

# Stale Backlog Item

An item becomes stale when:

- Evidence is outdated.
- The Product changed.
- The provider changed.
- The audience changed.
- The item has no owner.
- The problem is no longer observed.
- A stronger opportunity replaced it.

---

# Backlog Cleanup

Backlog cleanup should:

- Merge duplicates.
- Reject unsupported items.
- Archive obsolete items.
- Refresh evidence.
- Remove implementation-only tasks from Product views.
- Preserve significant historical decisions.

---

# Product Dependency Architecture

Product dependencies may include:

```text
Capability dependency

Data dependency

Platform dependency

Provider dependency

Policy dependency

Research dependency

Operational dependency

Support dependency

Market dependency
```

---

# Capability Dependency

Example:

```text
Assistant Transaction proposal

depends on

Canonical Transaction command and confirmation.
```

---

# Data Dependency

Example:

```text
Advanced spending Report

depends on

Exact Money, explicit Currency and complete Transaction history.
```

---

# Platform Dependency

Example:

```text
Notification deep links

depend on

Android lifecycle and owner reauthorization.
```

---

# Provider Dependency

Example:

```text
Cloud Attachment preview

depends on

Storage provider capability and deletion support.
```

---

# Policy Dependency

Example:

```text
Personalized Advertising

depends on

Valid choice, public disclosure and store declaration.
```

---

# Research Dependency

Example:

```text
New onboarding flow

depends on

Understanding why current activation fails.
```

---

# Operational Dependency

Example:

```text
Broad Assistant rollout

depends on

Provider monitoring and kill switch.
```

---

# Support Dependency

Example:

```text
New Import provider

depends on

Support diagnostics and error guidance.
```

---

# Dependency Record

Recommended fields:

```text
dependency_id

source_item

required_item

type

status

owner

risk

resolution_condition
```

---

# Dependency Status

Recommended:

```text
unknown

identified

not_ready

in_progress

ready

failed

removed
```

---

# Product Critical Path

The Product critical path should generally follow:

```text
Trust foundations

↓

Core financial capability

↓

Reliable persistence and synchronization

↓

Accessible platform experience

↓

Privacy and Support readiness

↓

Optional growth and monetization
```

---

# Dependency Bypass Prohibition

Do not bypass a hard dependency by:

- Duplicating Domain logic
- Creating a temporary unsafe writer
- Hiding the feature behind unclear wording
- Skipping migration
- Skipping Accessibility
- Skipping provider deletion
- Using manual Support as permanent control

---

# Product Sequencing Principles

Sequence work to:

- Resolve highest risk first.
- Establish reusable foundations.
- Deliver complete vertical slices.
- Preserve Production continuity.
- Measure outcomes early.
- Avoid provider lock-in.
- Preserve reversibility.

---

# Initiative Sequencing

An initiative may progress through:

```text
Problem framing

Discovery

Prototype

Technical validation

Prioritization

Delivery planning

Implementation

Controlled rollout

Measurement

Expansion or closure
```

---

# Initiative Entry Gate

Before entering delivery:

```text
□ Problem is validated enough.

□ Outcome is measurable.

□ Guardrails exist.

□ Dependencies are ready.

□ Solution risk is acceptable.

□ Accessibility is considered.

□ Privacy is considered.

□ Support and operations are considered.

□ Product owner is assigned.
```

---

# Initiative Exit Gate

An initiative exits only when:

- Intended outcome is measured.
- Guardrails are reviewed.
- Capability ownership transfers to operations.
- Support guidance exists.
- Remaining gaps are recorded.
- Follow-up decision is made.
- Unsuccessful work is removed or revised.

---

# Product Prioritization for Accessibility

Accessibility work should be classified as:

```text
critical blocker

material barrier

quality improvement

enhancement
```

---

# Critical Accessibility Blocker

Examples:

- Cannot complete Account deletion by keyboard
- Transaction form inaccessible to screen reader
- Large text hides confirmation action
- Error cannot be identified without color
- Focus is trapped incorrectly in destructive Dialog

Critical blockers may be P0 or P1.

---

# Accessibility Priority Rule

Low usage by measured assistive-technology signals does not justify leaving a critical barrier unresolved.

Instrumentation may undercount affected users.

---

# Product Prioritization for Privacy

Privacy work should be evaluated by:

- Data sensitivity
- Optionality
- User expectation
- Provider scope
- Retention
- Deletion
- Public claim
- Region
- Reversibility

---

# Privacy Priority Rule

An optional growth feature that requires new sensitive processing should not outrank missing withdrawal or deletion controls.

---

# Product Prioritization for Reliability

Reliability opportunities should consider:

```text
Failure frequency

Financial consequence

Silent-failure potential

Recoverability

Support burden

Platform scope
```

A rare silent financial corruption may outrank a frequent cosmetic error.

---

# Product Prioritization for Android

Android priority should include:

- Store availability
- Crash and ANR
- Process death
- Back behavior
- File handling
- Notification permission
- Deep links
- Signing
- Version compatibility
- Foldable devices

Android should not receive only post-Web adaptation effort.

---

# Product Prioritization for Web

Web priority should include:

- Browser compatibility
- Multi-tab behavior
- Service Worker
- Responsive behavior
- Keyboard navigation
- Public policy access
- Cache safety
- Deployment reliability

---

# Product Prioritization for Assistant

Assistant priority should progress through:

```text
Read-only explanation

Deterministic summary

Structured recommendation

Draft proposal

Confirmed command
```

Do not prioritize mutation before:

- Canonical commands
- Operation identity
- Confirmation
- Context minimization
- Manual fallback
- Provider controls

---

# Product Prioritization for Advertising

Advertising should not be prioritized before:

- Privacy controls
- Account deletion
- Store declarations
- Financial-context exclusion
- Placement governance
- Kill switch
- Support readiness

---

# Product Prioritization for Subscriptions

Subscription planning should answer:

```text
Which user value is paid?

Which core value remains available?

Which features are entitled?

How is pricing communicated?

How are purchases restored?

What happens after Account deletion?

What Support burden exists?

What store dependence exists?
```

---

# Fair Monetization Principles

Monetization must not place behind a paywall:

- Account deletion
- Privacy controls
- Security controls
- Access to required legal documents
- Ability to cancel
- Access to essential Support for billing
- Correction of Product-created financial errors

---

# Regional Prioritization

A new region requires:

- Audience evidence
- Language readiness
- Currency behavior
- Provider support
- Support readiness
- Policy readiness
- Store readiness
- Accessibility
- Operational capability

Download availability alone does not establish regional readiness.

---

# Region Opportunity Record

Recommended:

```text
region

audience

problem

language

Currency_behavior

providers

support

policy

store

expected_outcome

risk

priority

decision
```

---

# Feature Request Workflow

Every feature request should follow:

```text
Intake

↓

Triage

↓

Problem translation

↓

Evidence review

↓

Opportunity mapping

↓

Prioritization

↓

Decision

↓

Communication
```

---

# Feature Request Intake Record

Recommended fields:

```text
request_id

requester_type

requested_solution

underlying_need

affected_audience

evidence

urgency_claim

risk

related_opportunity

status
```

---

# Requester Types

Potential:

```text
user

Support

Product

Engineering

Security

Privacy

Accessibility

Compliance

Operations

leadership

provider
```

Requester type does not determine automatic priority.

---

# Urgency Validation

When a request is described as urgent, ask:

```text
Which harm exists now?

Which users are affected?

Which evidence confirms urgency?

Which deadline exists?

What happens if delayed?

Is this P0, mandatory or preference?
```

---

# Duplicate Request Handling

Repeated requests should:

- Link to one opportunity.
- Increase evidence count where valid.
- Preserve meaningful audience differences.
- Avoid creating multiple competing backlog items.

---

# Product Communication after Decision

Communicate:

- Decision
- Reason
- Current horizon
- Uncertainty
- Review trigger
- Alternative path where relevant

Avoid promising future inclusion merely to soften rejection.

---

# Prioritization Transparency

Internal stakeholders should understand:

- Why work was selected
- Why work was deferred
- Why work was rejected
- Which risk changed priority
- Which evidence is missing
- Which dependencies block progress

Transparency does not require publishing Security-sensitive details.

---

# Roadmap Change Governance

A roadmap change requires review when it:

- Moves an item into `Now`
- Removes committed scope
- Introduces a new provider
- Introduces a new data category
- Introduces monetization
- Changes target audience
- Changes Product boundary
- Adds a new region
- Changes critical platform scope
- Displaces mandatory risk work

---

# Roadmap Change Record

Recommended template:

```markdown
# Product Roadmap Change

## Change

What moves, enters or leaves the roadmap?

## Reason

Which new evidence, risk or dependency caused the change?

## Outcome Impact

Which intended outcome changes?

## Scope Impact

Which capability or release changes?

## Guardrail Impact

Which financial, owner, Privacy, Accessibility or reliability guardrail changes?

## Dependency Impact

Which other items move?

## Communication

Which internal or public communication changes?

## Owner and Approval

Who owns and approves the change?
```

---

# Product Priority Exceptions

An exception may temporarily advance lower-priority work when:

- It unlocks required funding.
- It resolves a critical provider dependency.
- It creates evidence needed for a larger decision.
- It is exceptionally low effort and high value.
- It must align with a fixed external event.

The exception must not weaken Critical guardrails.

---

# Exception Record

Required:

```text
item

normal_priority

exception_priority

reason

risk

compensating_control

owner

expiration

review
```

---

# Product Prioritization Anti-Patterns

The following are prohibited:

## Highest Score Wins Automatically

Using arithmetic without risk and dependency review.

## Reach Overrides Severity

Deferring a Critical low-frequency defect because fewer users report it.

## Effort Bias

Prioritizing only easy work to improve delivery statistics.

## Sunk-Cost Priority

Continuing work because significant time has already been spent.

## Executive Request as Evidence

Treating authority as proof of user value.

## Backlog Position as Commitment

Assuming an old high-position item remains strategically important.

## Now as Unlimited List

Placing many items in `Now` and removing the meaning of commitment.

## Later as Promise

Presenting directional items as guaranteed future releases.

## MVP as Unsafe Shortcut

Removing Security, owner, Accessibility, deletion or recovery requirements to reduce scope.

## Release Theme as Marketing Slogan

Using a theme unrelated to actual delivered user value.

## Platform Parity as Identical Layout

Forcing identical UI instead of equivalent outcome.

## Web-First Permanently

Leaving Android incomplete after temporary validation.

## AI before Core Reliability

Prioritizing Assistant capabilities before stable financial commands.

## Ads before User Control

Prioritizing Advertising before Privacy, deletion and kill-switch readiness.

## Monetization through Core Degradation

Making the free core Product intentionally unreliable.

## Accessibility as Optional Polish

Deferring critical barriers behind visual or growth work.

## Maintenance Hidden from Roadmap

Treating required provider and platform work as invisible spare-time activity.

## Deferred without Review Trigger

Allowing an item to remain indefinitely without a reason or review condition.

## Rejected without Evidence Record

Discarding an opportunity without recording why.

## Scope Freeze Bypass

Adding unrelated features during release stabilization.

---

# Part 2 Review Questions

## Priority Review

```text
Which priority class applies?

Is the item mandatory or discretionary?

Which user problem does it solve?

Which evidence level exists?

Which risk exists?

Which higher-priority unresolved work exists?

Which dependency does it enable?
```

---

## Scoring Review

```text
Which value dimensions were assessed?

Which effort dimensions were included?

Was Accessibility included?

Was migration included?

Was Support included?

Can the score hide a Critical risk?

Which qualitative judgment remains necessary?
```

---

## Acceptance Review

```text
Is the problem within Product boundaries?

Is the audience defined?

Is the outcome measurable?

Are guardrails defined?

Are dependencies ready?

Is the solution sufficiently reversible?

Is there a smaller safer alternative?
```

---

## Deferral Review

```text
Why is the item not the best current priority?

Which condition should reopen it?

Does deferral increase risk or cost?

Who owns review?

Is the evidence likely to become stale?
```

---

## Rejection Review

```text
Is the problem unsupported?

Is the capability outside Product boundaries?

Does it create unacceptable risk?

Does another initiative solve it?

Does it require unnecessary sensitive data?

Which new evidence could change the decision?
```

---

## Horizon Review

```text
Is Now limited to active commitments?

Does Next have sufficient evidence?

Is Later clearly directional?

Does Explore have a research question?

Does Not Planned explain Product boundaries?
```

---

## MVP Review

```text
Which Product question does the MVP test?

Which audience does it serve?

Which capabilities are essential?

Which exclusions remain honest?

Does the MVP preserve Money, owner, Accessibility and deletion safety?

Can it be operated and supported?
```

---

## Release Review

```text
Which outcome unifies the release?

Are capabilities complete vertical slices?

Are failure states complete?

Are platforms represented accurately?

Are public claims current?

Which guardrails stop rollout?
```

---

## Backlog Review

```text
Does every item map to a problem or requirement?

Which items are stale?

Which items duplicate opportunities?

Which items lack evidence?

Which items lack owners?

Which items should be rejected or archived?
```

---

## Dependency Review

```text
Which hard dependencies exist?

Which dependencies are only assumptions?

Can sequencing reduce risk?

Would bypassing the dependency create duplicate authority?

Which dependency has the highest enabling value?
```

---

## Monetization Review

```text
Which clear user value is being monetized?

Which core controls remain free?

Does the model influence financial calculations?

Does Account deletion remain available?

How are entitlement and cancellation handled?

What happens when the provider fails?
```

---

# Part 2 Acceptance Criteria

The Product prioritization and roadmap structure is accepted only when:

```text
□ Product prioritization considers user value, trust, risk, evidence, effort and dependencies.

□ No score overrides a Critical financial or owner risk.

□ Priority decision order is explicit.

□ P0 through P4 Product priorities are defined.

□ Mandatory and discretionary work are distinguished.

□ Safety and trust work can interrupt ordinary sequencing.

□ Risk-reduction work is visible.

□ Core-value work is distinguished from growth.

□ Monetization work includes fairness and operational cost.

□ Maintenance work appears in the Product roadmap.

□ Discovery work reduces uncertainty.

□ Deprecation is treated as Product work.

□ Priority lanes prevent an undifferentiated backlog.

□ Every prioritized item defines problem, audience, evidence and outcome.

□ Evidence levels E0 through E5 are defined.

□ Assumption-only work does not receive unsupported delivery commitment.

□ Evidence confidence includes recency and audience fit.

□ Product value dimensions are defined.

□ User importance remains distinct from reach.

□ Task criticality is evaluated.

□ Trust impact is evaluated.

□ Accessibility impact is evaluated.

□ Support impact is evaluated.

□ Strategic alignment is evaluated.

□ Revenue value applies only to monetization opportunities.

□ Risk dimensions cover financial, owner, Privacy, Accessibility and recovery concerns.

□ Delivery cost includes testing, migration, Android, Operations and Support.

□ Cost of delay is evaluated.

□ Dependency enablement is evaluated.

□ Reversibility is classified.

□ Product scoring remains advisory.

□ A single numeric score is not authoritative.

□ Risk vetoes require evidence and resolution conditions.

□ Accept, discovery, reduced scope, experiment, defer and reject are distinct decisions.

□ Acceptance criteria for opportunities are defined.

□ Discovery is used when uncertainty is high.

□ Reduced scope cannot remove mandatory safety or Accessibility.

□ Experiments remain reversible and guardrail-bound.

□ Deferred items have reasons and review triggers.

□ Rejected items preserve decision history.

□ Rejection is recognized as a valid Product decision.

□ Prioritization decisions are logged.

□ Continuous triage is defined.

□ Opportunity, roadmap, release and strategic reviews are distinct.

□ Review participation depends on risk.

□ Roadmap horizons Now, Next, Later, Explore and Not Planned are defined.

□ Now remains limited to active work.

□ Next is prioritized but not automatically committed.

□ Later remains directional.

□ Explore defines research questions.

□ Not Planned clarifies Product boundaries.

□ Horizon confidence is explicit.

□ Roadmap timing avoids false precision.

□ Product roadmap items have structured records.

□ Public and internal roadmaps remain distinct.

□ Roadmap themes connect to Product outcomes.

□ Theme balance includes trust, Accessibility, Privacy and maintenance.

□ Capacity planning includes mandatory work, core outcomes, maintenance and discovery.

□ Capacity remains flexible for P0 interruption.

□ MVP means minimum viable, not minimum safe.

□ MVP preserves financial correctness.

□ MVP preserves owner isolation.

□ MVP preserves data durability.

□ MVP preserves critical Accessibility.

□ MVP includes functional deletion and Support readiness.

□ Candidate MVP capabilities are defined as a hypothesis.

□ MVP exclusions remain honest in public communication.

□ Minimum Lovable and Minimum Marketable Product remain distinct.

□ Product release classes are defined.

□ Emergency releases remain tested.

□ Product version records include outcomes and known limitations.

□ Releases use coherent Product themes.

□ Vertical slices include UI, Domain, persistence, failure states and tests.

□ Horizontal infrastructure work is not confused with user outcome.

□ Platform parity means equivalent Product outcome.

□ Platform-limited rollout does not create permanent Domain divergence.

□ Release inclusion and exclusion criteria are defined.

□ Scope freeze permits only justified release-critical additions.

□ Backlog hierarchy connects strategy to tasks.

□ Product backlog views support outcomes, risk and evidence.

□ Backlog readiness levels are defined.

□ Delivery-ready criteria include evidence, guardrails and Accessibility.

□ Stale backlog items are reviewed.

□ Backlog cleanup merges, rejects and archives appropriately.

□ Product dependency types are defined.

□ Dependencies have stable records and statuses.

□ Product critical path begins with trust foundations.

□ Hard dependencies cannot be bypassed through duplicated logic.

□ Product sequencing favors complete vertical slices.

□ Initiative entry and exit gates are defined.

□ Accessibility blockers receive appropriate priority regardless of measured volume.

□ Privacy withdrawal and deletion outrank optional growth processing.

□ Reliability priority considers silent financial harm.

□ Android prioritization includes lifecycle, signing and store readiness.

□ Web prioritization includes multi-tab, cache and keyboard behavior.

□ Assistant prioritization begins with read-only capabilities.

□ Assistant mutation waits for canonical commands and confirmation.

□ Advertising waits for Privacy, deletion, placement and kill-switch readiness.

□ Subscription planning defines user value and entitlement.

□ Core Privacy, deletion and Security controls are not paywalled.

□ Regional prioritization includes language, provider, policy and Support readiness.

□ Feature requests follow intake, problem translation and decision.

□ Requester authority does not determine automatic priority.

□ Urgency claims require evidence.

□ Duplicate requests map to one opportunity.

□ Decision communication avoids false promises.

□ Internal prioritization remains transparent.

□ Roadmap changes are governed.

□ Priority exceptions are narrow and expiring.

□ Part 2 Product prioritization anti-patterns are prohibited.
```

---

# Product Prioritization Constitutional Rule

Every priority, roadmap horizon, MVP decision, release scope, feature request and monetization proposal must answer:

```text
Does this work address an important evidenced problem, improve a measurable Product outcome, respect hard dependencies and preserve financial, owner, Privacy, Accessibility, reliability and recovery guardrails?
```

When the answer is uncertain, prefer the decision that:

- Classifies the item as discovery.
- Narrows the scope.
- Uses a reversible experiment.
- Protects a higher-priority risk.
- Establishes a baseline.
- Resolves a dependency.
- Defers the commitment.
- Rejects the solution.
- Removes the item from `Now`.
- Blocks the release.

Priority is not determined by who asks most loudly, which feature is easiest to build or which trend is most visible.

Priority is determined by the value and safety of the outcome, the quality of evidence, the cost of delay, the readiness of dependencies and the Product risks Nexio refuses to trade away.

---
---

# Product Experiment Governance

Experiments may help Nexio evaluate uncertain Product hypotheses before committing to broad implementation.

An experiment is not permission to weaken:

```text
Financial correctness

Owner isolation

Data durability

Privacy

Accessibility

Account deletion

Security

Recovery

Store compliance
```

Experiments must remain bounded, reversible and measurable.

---

# Experiment Purpose

A Product experiment should answer one defined question.

Examples:

```text
Does a guided first-Transaction flow improve activation?

Does clearer synchronization language improve user understanding?

Does a simplified Report improve category comprehension?

Does a contextual explanation reduce form abandonment?
```

Weak experiment purpose:

```text
See whether users like the new design.
```

---

# Experiment Eligibility

An opportunity is eligible for experimentation when:

- The Product problem is defined.
- The hypothesis is explicit.
- The change is reversible.
- The affected users can be identified safely.
- Guardrails are measurable.
- The change does not alter canonical financial meaning independently.
- Failure can be detected.
- The experiment can be stopped.
- The measurement does not require unnecessary sensitive data.

---

# Experiment Ineligibility

Do not experiment with whether Nexio should preserve:

- Exact Money
- Explicit Currency
- Owner isolation
- RLS
- Idempotency
- Account deletion
- Accessible critical journeys
- Authentication protection
- Backup integrity
- Recovery authority

These are requirements, not optional Product variants.

---

# Experiment Types

Recommended:

```text
Concept test

Usability experiment

Content experiment

Navigation experiment

Feature Flag experiment

Controlled cohort rollout

Provider evaluation

Pricing research

Operational experiment
```

---

# Concept Test

Used to evaluate whether users understand or value a proposed capability before implementation.

A concept test may use:

- Storyboard
- Description
- Low-fidelity prototype
- Synthetic example

It does not prove technical feasibility.

---

# Usability Experiment

Used to test whether users can complete a journey successfully.

Required success criteria may include:

```text
Correct Amount

Correct Currency

Correct Account

Correct final state

No duplicate submission

Accessible completion

No facilitator intervention
```

---

# Content Experiment

May compare:

- Labels
- Instructions
- Error wording
- Synchronization explanations
- Onboarding content

Content experimentation must not hide material limitations or weaken required disclosures.

---

# Navigation Experiment

May compare presentation models while preserving:

- Same financial behavior
- Same owner authorization
- Same Accessibility requirements
- Same Privacy controls
- Same deletion access

---

# Controlled Feature Experiment

A controlled feature experiment may use a Feature Flag and cohort assignment.

Required:

```text
Experiment ID

Eligibility

Assignment

Variant

Start

End

Primary metric

Guardrails

Kill switch

Owner
```

---

# Provider Evaluation

A provider evaluation may compare:

- Reliability
- Cost
- Regional support
- Accessibility
- Privacy controls
- Deletion
- SDK behavior
- Operational effort
- Exit capability

Synthetic data should be used during evaluation.

---

# Pricing Research

Pricing research may evaluate:

- Perceived value
- Plan clarity
- Billing period
- Trial comprehension
- Feature packaging
- Cancellation understanding

Do not represent hypothetical pricing as an active offer.

---

# Experiment Record

Recommended fields:

```text
experiment_id

title

opportunity_id

hypothesis

audience

eligibility

variants

assignment_method

primary_metric

guardrail_metrics

counter_metrics

start_condition

stop_condition

measurement_window

sample_limit

privacy_review

accessibility_review

technical_owner

Product_owner

status
```

---

# Experiment Status

Recommended:

```text
draft

review

approved

scheduled

running

paused

stopped

analyzing

concluded

invalid
```

---

# Experiment Assignment

Assignment must be:

- Stable for the intended duration
- Owner-safe
- Privacy-reviewed
- Reproducible
- Excluded from protected contexts where necessary
- Reset appropriately after Account deletion

---

# Assignment Unit

Potential units:

```text
Owner

Device

Session

Anonymous pre-Authentication visitor
```

The assignment unit must match the hypothesis.

Do not accidentally assign different financial behavior per session when consistency is required.

---

# Experiment Cohort Isolation

Cohort assignment must not:

- Mix owner data
- Expose another owner's variant state
- Persist after Account deletion without approved reason
- Become an Advertising profile
- Change canonical Money or ownership rules

---

# Experiment Exposure Event

An exposure event should occur only when the user actually experiences the variant.

Do not count assignment alone as exposure when:

- The screen was never opened.
- The component did not render.
- The user was ineligible.
- The capability failed to load.

---

# Experiment Metrics

Every experiment should define:

```text
Primary metric

Guardrail metric

Counter metric

Diagnostic metric
```

---

# Experiment Primary Metric

The primary metric should measure the intended user outcome.

Example:

```text
First valid Transaction completion rate
```

---

# Experiment Guardrails

Potential guardrails:

```text
Duplicate Transaction rate

Incorrect Amount rate

Synchronization failure

Crash rate

Accessibility completion

Privacy preference failure

Account deletion access

Support escalation
```

---

# Experiment Counter Metric

A counter metric detects undesirable behavior.

Example:

```text
Time spent increased because users became confused.
```

---

# Experiment Diagnostic Metrics

Potential:

- Form validation error
- Account-selection failure
- Currency-selection failure
- Back-navigation abandonment
- Offline-state abandonment

---

# Experiment Sample Governance

Sample size should reflect:

- Expected effect
- Baseline
- Variability
- Risk
- Eligible audience
- Measurement period

Do not fabricate statistical confidence when the sample is too small.

---

# Small-Sample Experiment

When the sample is small:

- Treat findings as directional.
- Combine qualitative evidence.
- Avoid broad Product claims.
- Avoid automatic expansion.
- Record limitations.

---

# Experiment Duration

Duration should be long enough to observe the intended behavior.

Avoid ending an experiment only because early results appear favorable.

Review:

- Weekday and weekend behavior
- New and returning users
- Web and Android
- Online and offline use
- Version adoption

---

# Experiment Stop Conditions

Stop immediately when:

- Financial correctness degrades.
- Owner isolation is uncertain.
- Data loss occurs.
- Duplicate operations increase materially.
- Critical Accessibility fails.
- Privacy choice is bypassed.
- Deletion access is blocked.
- Crash or ANR exceeds guardrail.
- Provider behavior becomes unsafe.
- Measurement is corrupted.

---

# Experiment Pause Conditions

Pause when:

- Instrumentation fails.
- Assignment fails.
- A concurrent release contaminates results.
- Provider outage affects one variant.
- Required owner is unavailable.
- Material incident occurs.

---

# Experiment Contamination

Potential contamination sources:

- Users switching variants
- Multiple devices
- Feature Flag drift
- Other overlapping experiments
- Provider changes
- UI release during experiment
- Incorrect exposure events
- Account switching

---

# Concurrent Experiment Governance

Concurrent experiments may run only when:

- Their interactions are understood.
- They do not modify the same critical journey incompatibly.
- Assignment is coordinated.
- Metrics can distinguish exposure.
- Guardrails remain interpretable.

---

# Experiment Exclusion Zones

Experiments should generally be prohibited in:

```text
Authentication security

Owner authorization

Account deletion access

Privacy withdrawal

Transfer atomicity

Financial Amount calculation

RLS

Backup recovery

Emergency Support
```

Presentation improvements may be tested only when the underlying required behavior remains unchanged.

---

# Experiment Analysis

Analysis should compare:

- Primary outcome
- Guardrails
- Counter metrics
- Audience segments
- Platform
- Version
- Exposure validity
- Qualitative findings
- Limitations

---

# Experiment Result Categories

Recommended:

```text
positive

negative

neutral

inconclusive

invalid
```

---

# `positive`

The intended outcome improved and guardrails remained acceptable.

---

# `negative`

The intended outcome did not improve or guardrails degraded.

---

# `neutral`

No meaningful difference was observed.

---

# `inconclusive`

Evidence is insufficient to determine direction.

---

# `invalid`

The experiment cannot support a conclusion because of:

- Instrumentation failure
- Assignment failure
- Contamination
- Provider incident
- Incorrect population
- Insufficient execution integrity

---

# Experiment Decision Types

After analysis, decide:

```text
expand

iterate

maintain_limited

retest

stop

remove

defer
```

---

# `expand`

Broaden rollout only when:

- Outcome improved.
- Guardrails passed.
- Technical behavior is stable.
- Accessibility passed.
- Support is ready.
- Operational cost is acceptable.

---

# `iterate`

Revise the solution while preserving the opportunity.

---

# `maintain_limited`

Keep the capability limited when:

- It benefits a narrow audience.
- Broader value is unproven.
- Operational cost remains high.
- Provider limitations exist.

---

# `retest`

Retest when:

- The hypothesis remains valuable.
- The previous test was inconclusive.
- A specific correctable limitation exists.

---

# `stop`

Stop when the solution is ineffective or unsafe.

---

# `remove`

Remove released experimental behavior that no longer provides justified value.

---

# Experiment Decision Record

Recommended:

```markdown
# Experiment Decision

## Experiment

[ID and title]

## Hypothesis

[Statement]

## Audience

[Eligible users]

## Primary Result

[Observed result]

## Guardrails

[Results]

## Accessibility

[Result]

## Privacy and Security

[Result]

## Limitations

[Known limitations]

## Decision

Expand, iterate, maintain limited, retest, stop or remove.

## Follow-Up

[Required actions]

## Owner

[Accountable owner]
```

---

# Experiment Data Retention

Experiment data must follow:

- Event Registry
- Retention Registry
- User choice
- Account deletion
- Provider deletion
- Research retention
- Data minimization

Experimental data must not receive indefinite retention because analysis is incomplete.

---

# Product Measurement after Release

Every material Product release should enter a measurement period.

Measurement should verify:

```text
Outcome

Guardrails

Reliability

Accessibility

Support impact

Operational impact

Unexpected behavior
```

---

# Post-Release Measurement Record

Recommended fields:

```text
release_id

initiative_id

expected_outcome

measurement_start

measurement_end

primary_metric

guardrail_metrics

support_signals

incident_signals

qualitative_feedback

result

decision

owner
```

---

# Measurement Windows

Potential:

```text
Immediate health window

Early outcome window

Adoption window

Long-term value window
```

---

# Immediate Health Window

Usually evaluates:

- Startup
- Crash
- ANR
- Error rate
- Migration
- Synchronization
- Provider health
- Account switching
- Owner isolation signals

---

# Early Outcome Window

Evaluates whether users can complete the intended journey.

Examples:

- First Transaction
- Conflict resolution
- Export
- Privacy preference
- Account deletion

---

# Adoption Window

Evaluates whether eligible users use the capability meaningfully.

Adoption alone does not prove value.

---

# Long-Term Value Window

Evaluates:

- Continued usefulness
- Retention through value
- Support reduction
- Reliability
- Cost
- Trust
- Accessibility
- Maintenance burden

---

# Release Success Classification

Recommended:

```text
successful

partially_successful

neutral

unsuccessful

harmful

not_measurable
```

---

# `successful`

The outcome improved and guardrails remained acceptable.

---

# `partially_successful`

Some outcomes improved, but:

- One segment did not benefit.
- One platform remains partial.
- Operational cost is higher than expected.
- Additional iteration is required.

---

# `neutral`

No meaningful outcome improvement occurred and no material harm occurred.

---

# `unsuccessful`

The intended outcome did not improve sufficiently.

---

# `harmful`

Guardrails degraded or user harm increased.

A harmful release requires containment and review.

---

# `not_measurable`

Instrumentation, baseline or design cannot support a valid conclusion.

This result should not be converted into success through anecdote.

---

# Outcome Review

A post-release review should ask:

```text
Did the intended user outcome improve?

Did the intended audience receive value?

Did any segment experience harm?

Did financial correctness remain stable?

Did owner isolation remain stable?

Did Accessibility remain equivalent?

Did Support burden change?

Did provider or operational cost change?

Should the capability expand, iterate, remain, stop or be removed?
```

---

# Outcome Review Record

Recommended template:

```markdown
# Product Outcome Review

## Initiative

[Initiative]

## Release

[Release ID]

## Intended Outcome

[Outcome]

## Baseline

[Baseline or unavailable]

## Result

[Measured result]

## Guardrails

[Results]

## Audience Findings

[Segment findings]

## Accessibility Findings

[Findings]

## Support and Operations

[Findings]

## Limitations

[Limitations]

## Decision

[Expand, iterate, maintain, stop, remove or continue measuring]

## Follow-Up

[Actions]
```

---

# Outcome Review Timing

Review timing should reflect the capability.

Examples:

- Migration: immediate and short-term
- Onboarding: early activation window
- Reports: repeated-use window
- Subscription: billing-cycle window
- Recovery: exercise and incident window
- Account deletion: completion and aging window

---

# Decision after Release

Every material release should receive an explicit lifecycle decision:

```text
expand

maintain

iterate

limit

deprecate

remove

continue_measuring
```

---

# Expansion Governance

Expansion may include:

- More users
- More regions
- More platforms
- More capabilities
- More provider integration
- Higher automation

Expansion requires renewed review when scope changes.

---

# Expansion Criteria

Before expansion:

```text
□ Outcome improved.

□ Financial guardrails pass.

□ Owner-isolation guardrails pass.

□ Accessibility passes.

□ Privacy controls work.

□ Provider capacity is sufficient.

□ Support is prepared.

□ Monitoring is active.

□ Deletion behavior remains valid.

□ Public communication is accurate.
```

---

# Platform Expansion

Expanding from Web to Android or Android to Web requires:

- Equivalent Domain behavior
- Platform-specific usability testing
- Lifecycle testing
- Accessibility testing
- Store or deployment readiness
- Support guidance
- Outcome measurement

Do not assume interaction success transfers automatically between platforms.

---

# Regional Expansion

Before regional expansion:

- Language is complete.
- Currency behavior is defined.
- Providers support the region.
- Policies are reviewed.
- Support is available.
- Store declarations are current.
- Accessibility remains valid.
- Outcome measurement is possible.

---

# Provider Expansion

Before expanding provider scope:

- Purpose remains the same or is reapproved.
- Data categories remain minimized.
- Retention is understood.
- Deletion works.
- Regional behavior is known.
- Cost is acceptable.
- Exit remains possible.

---

# Automation Expansion

Automation should progress gradually:

```text
Suggestion

↓

Draft

↓

Proposal

↓

Confirmed command

↓

Bounded recurring automation
```

Each level requires additional:

- Safety
- Idempotency
- Confirmation
- Monitoring
- Recovery
- Support

---

# Rollback Architecture

Product rollback may mean:

```text
Disable capability

Revert UI

Restore prior configuration

Stop provider

Stop experiment

Revert release

Perform forward correction

Restore data
```

These are not interchangeable.

---

# Capability Disablement

Preferred for optional:

- Analytics
- Assistant
- Advertising
- Experiments
- Optional Notifications
- Provider integrations

Disablement should not block core Product workflows.

---

# UI Rollback

A prior UI may be restored only when it remains compatible with:

- Current schema
- Current Application contracts
- Current Privacy requirements
- Current Accessibility requirements

---

# Data Rollback

Data rollback is high risk.

Do not assume a schema or Money migration can be reversed safely.

Use:

- Backup restore
- Corrective migration
- Forward repair
- Compatibility read

as appropriate.

---

# Product Rollback Trigger

Potential triggers:

- Guardrail breach
- Critical usability failure
- Accessibility blocker
- Provider failure
- Migration failure
- Store issue
- Support overload
- Misleading Product state

---

# Rollback Decision Record

Recommended:

```text
release

capability

trigger

affected_users

guardrail

containment

rollback_type

data_impact

communication

recovery

owner
```

---

# Product Lifecycle Architecture

Every Product capability should move through a governed lifecycle.

Recommended:

```text
idea

opportunity

discovery

validated

prioritized

planned

in_delivery

released_limited

released_general

measuring

mature

maintenance

deprecated

removed
```

---

# `idea`

Untriaged suggestion or observation.

---

# `opportunity`

Problem and potential outcome are framed.

---

# `discovery`

Evidence and solutions are being investigated.

---

# `validated`

The opportunity has sufficient evidence for prioritization.

---

# `prioritized`

The opportunity has been selected relative to alternatives.

---

# `planned`

Scope, owner, dependencies and release intent exist.

---

# `in_delivery`

Implementation is active.

---

# `released_limited`

Capability is available to a controlled audience.

---

# `released_general`

Capability is broadly available within approved scope.

---

# `measuring`

Post-release outcome and guardrail evaluation is active.

---

# `mature`

Capability provides stable value with predictable operations.

---

# `maintenance`

Focus shifts toward reliability, compatibility and cost.

---

# `deprecated`

Users are informed that removal or replacement is planned.

---

# `removed`

Capability is unavailable and its dependencies, data, claims and Support paths are processed.

---

# Capability Owner

Every active capability requires an owner responsible for:

- Outcome
- Reliability
- Accessibility
- Privacy
- Support
- Measurement
- Maintenance
- Deprecation

---

# Capability Registry

Recommended file:

```text
docs/product/CAPABILITY-REGISTRY.md
```

Recommended fields:

```text
capability_id

name

Product_value

audience

owner

lifecycle_state

platforms

requirements

providers

data_categories

primary_metric

guardrails

support_path

deprecation_state
```

---

# Capability Health

Recommended health states:

```text
healthy

watch

degraded

at_risk

deprecated
```

---

# `healthy`

- Outcome remains valuable.
- Reliability is acceptable.
- Support cost is acceptable.
- Requirements remain satisfied.

---

# `watch`

- Trend requires observation.
- Provider or adoption concern exists.
- No immediate major harm.

---

# `degraded`

- Material reliability or usability problem exists.
- Workaround may exist.
- Correction is prioritized.

---

# `at_risk`

- Critical requirement may fail.
- Provider or platform viability is uncertain.
- Expansion stops.

---

# Capability Health Review

Review:

- Outcome trend
- Error rate
- Accessibility
- Privacy
- Support cases
- Provider status
- Cost
- Dependency status
- User feedback
- Strategic alignment

---

# Mature Capability Governance

A mature capability still requires:

- Regression testing
- Dependency maintenance
- Accessibility review
- Provider monitoring
- Policy accuracy
- Support ownership
- Deprecation readiness

---

# Feature Deprecation Architecture

Deprecation should occur when a capability:

- No longer solves an important problem.
- Has very low value and high cost.
- Has an unsafe provider.
- Conflicts with Product strategy.
- Has a better replacement.
- Creates unacceptable risk.
- Cannot remain compatible.
- Is unused and unmaintained.
- Requires unsupported public claims.

---

# Deprecation Decision Record

Recommended:

```markdown
# Product Deprecation Decision

## Capability

[Capability]

## Current State

[Lifecycle and platforms]

## Reason

[Value, cost, risk or replacement]

## Evidence

[Evidence]

## Affected Users

[Audience and volume where known]

## Data Impact

[Records, Export and retention]

## Provider Impact

[Provider shutdown or migration]

## Replacement

[Replacement or none]

## Communication

[User and Support plan]

## Timeline

[Stages and confidence]

## Removal Criteria

[Required completion]

## Owner

[Accountable owner]
```

---

# Deprecation Stages

Recommended:

```text
decision

internal_notice

public_notice

new_use_disabled

migration_available

read_only

removal

post_removal_support
```

---

# Internal Notice

Notify:

- Product
- Engineering
- Support
- Operations
- Privacy
- Compliance
- Accessibility
- Store Owner

---

# Public Notice

Required when removal materially affects existing users.

Notice should explain:

- What changes
- When
- Why
- Replacement
- Data impact
- Required user action
- Support path

---

# Disable New Use

Potential:

- Stop new connections
- Stop new subscriptions
- Stop new Automation
- Stop new Imports
- Stop new Account creation for a type

Existing state may remain temporarily supported.

---

# Migration Support

When replacement exists:

- Provide migration path.
- Preserve financial meaning.
- Preserve owner scope.
- Preserve exact Money and Currency.
- Validate counts.
- Provide Support guidance.

---

# Read-Only Stage

A capability may become read-only before removal.

Read-only state must be clearly communicated.

---

# Removal Criteria

Before removal:

```text
□ User notice completed.

□ Data Export or migration available where required.

□ Provider processing stopped.

□ Permissions removed.

□ SDK removed.

□ Public policies updated.

□ Store declarations updated.

□ Support runbook updated.

□ Feature Flags removed.

□ Monitoring updated.

□ Legacy data handled.
```

---

# Data after Feature Removal

Data may be:

```text
Migrated

Exported

Archived

Deleted

Retained under approved policy
```

The treatment must be explicit.

---

# Provider Removal

Provider removal should include:

- Stop initialization
- Stop requests
- Revoke credentials
- Remove webhooks
- Remove SDK
- Remove permissions
- Delete provider data where applicable
- Update policies
- Update store declarations
- Update Support

---

# Deprecated Feature Communication

Avoid:

```text
This feature will disappear soon.
```

Prefer:

```text
This feature will be retired on the approved date. Existing records remain available through [replacement or Export path]. No new records can be created after [date].
```

Only use a date when approved and reliable.

---

# Roadmap Communication Architecture

Roadmap communication should explain direction without creating false promises.

---

# Internal Roadmap Communication

May include:

- Priorities
- Dependencies
- Risks
- Uncertainty
- Deferred work
- Rejected work
- Provider issues
- Delivery confidence
- Tradeoffs

---

# Public Roadmap Communication

Should include only information appropriate for public commitment.

Potential:

- Current themes
- Recently delivered outcomes
- Areas being explored
- Confirmed planned capabilities
- Platform scope
- Known limitations

---

# Public Roadmap Rules

Public communication must:

- Distinguish available from planned.
- Distinguish planned from exploratory.
- Avoid guaranteed dates without confidence.
- Avoid Security-sensitive detail.
- Avoid provider commitments before approval.
- Avoid implying store approval.
- Avoid implying regulated financial capability.

---

# Roadmap Language

Recommended:

```text
Available

In controlled rollout

Planned

Under exploration

Not planned
```

Avoid ambiguous:

```text
Coming soon
```

unless a bounded approved delivery exists.

---

# Roadmap Change Communication

When priorities change, communicate:

- What changed
- Why
- Which outcome is affected
- Which risk or evidence changed
- Whether a public commitment changed
- Which alternative remains

---

# Delayed Roadmap Item

A delayed item should not be silently moved.

Record:

```text
Original horizon

New horizon

Reason

Dependency

Impact

Owner

Review condition
```

---

# Cancelled Roadmap Item

A cancelled item should explain:

- Why it was cancelled
- Whether the problem still exists
- Whether another solution replaces it
- Whether users are affected
- Whether public content changes

---

# Roadmap Review Cadence

Recommended:

```text
Continuous intake review

Monthly opportunity review

Release-cycle roadmap review

Quarterly strategy review

Annual Product-boundary review

Incident-driven review
```

Cadence may vary according to Product maturity.

---

# Product Portfolio Architecture

The Product portfolio includes all active:

```text
Themes

Objectives

Initiatives

Capabilities

Experiments

Maintenance

Deprecations

Mandatory work
```

---

# Portfolio Balance Dimensions

Review balance across:

```text
Financial trust

Core Product value

Accessibility

Privacy

Reliability

Platform quality

Growth

Monetization

Maintenance

Discovery
```

---

# Portfolio Health States

Recommended:

```text
healthy

imbalanced

overcommitted

blocked

at_risk
```

---

# `healthy`

- `Now` is limited.
- Mandatory work is funded.
- Core outcomes progress.
- Discovery continues.
- Maintenance and Accessibility are visible.

---

# `imbalanced`

Examples:

- Excessive AI work
- Excessive visual work
- No reliability capacity
- No discovery
- No Android investment
- No Accessibility work

---

# `overcommitted`

- Too many active initiatives
- Shared dependencies overloaded
- Release confidence low
- Product owners divided
- Scope changes frequent

---

# `blocked`

Critical external or internal dependency prevents progress.

---

# `at_risk`

Portfolio guardrails or Product promise may fail.

---

# Product Portfolio Metrics

Recommended:

```text
active_initiative_count

Now_item_count

initiative_completion_rate

outcome_success_rate

guardrail_failure_rate

experiment_inconclusive_rate

deprecation_completion_rate

mandatory_work_aging

accessibility_gap_aging

reliability_gap_aging

backlog_staleness

roadmap_change_rate
```

---

# Active Initiative Count

Measures concurrent Product commitments.

Too many active initiatives may indicate loss of focus.

---

# Now Item Count

`Now` should remain small enough to represent real active commitment.

---

# Initiative Completion Rate

Should count completion only after:

- Outcome review
- Guardrail review
- Operational handoff
- Remaining gaps recorded

---

# Outcome Success Rate

Measures the proportion of completed initiatives that improved their intended outcomes.

Do not use this metric to punish honest negative experiments.

---

# Guardrail Failure Rate

Tracks initiatives or experiments that triggered:

- Financial
- Owner
- Privacy
- Accessibility
- Reliability
- Deletion
- Recovery

guardrail failures.

---

# Inconclusive Experiment Rate

A high rate may indicate:

- Weak hypotheses
- Poor instrumentation
- Insufficient sample
- Excessive experiments
- Unclear primary metrics

---

# Deprecation Completion Rate

Tracks whether removed features also complete:

- Data handling
- Provider removal
- Policy update
- Support update
- SDK removal
- Permission removal

---

# Mandatory Work Aging

Measures how long mandatory safety, provider and compliance work remains unresolved.

---

# Accessibility Gap Aging

Tracks unresolved critical and material Accessibility barriers.

---

# Reliability Gap Aging

Tracks unresolved:

- Data loss
- Duplication
- Synchronization
- Recovery
- Android lifecycle

issues.

---

# Backlog Staleness

Potential definition:

```text
Percentage of active backlog items not reviewed within the approved review period.
```

---

# Roadmap Change Rate

Tracks material changes to `Now` and committed release scope.

A high change rate may indicate:

- Weak discovery
- Hidden dependencies
- Excessive interruption
- Poor scope control
- Volatile Product strategy

---

# Portfolio Metric Anti-Gaming

Do not optimize portfolio metrics by:

- Splitting or merging initiatives artificially
- Marking partial work complete
- Hiding mandatory work
- Avoiding experiments to reduce failure rate
- Removing gaps without correction
- Moving work out of `Now` before reporting
- Lowering guardrail sensitivity

---

# Product Review Dashboard

Recommended sections:

```text
Strategic themes

Current objectives

Now initiatives

Next opportunities

Mandatory work

Active experiments

Outcome reviews

Guardrail status

Capability health

Deprecations

Portfolio balance

Critical decisions
```

---

# Product Governance Roles

Recommended:

```text
Product Strategy Owner

Roadmap Owner

Opportunity Owner

Initiative Owner

Capability Owner

Experiment Owner

Research Owner

Analytics Owner

Accessibility Owner

Privacy Owner

Support Owner

Release Owner
```

One person may hold multiple roles.

Responsibilities remain distinct.

---

# Product Strategy Owner

Responsible for:

- Vision
- Product boundaries
- Strategic themes
- Audience decisions
- Strategic reviews

---

# Roadmap Owner

Responsible for:

- Horizons
- Prioritization
- Dependency visibility
- Roadmap communication
- Portfolio balance

---

# Opportunity Owner

Responsible for:

- Problem evidence
- Discovery
- Opportunity decision
- Outcome definition

---

# Initiative Owner

Responsible for:

- Delivery outcome
- Guardrails
- Cross-functional coordination
- Post-release review

---

# Capability Owner

Responsible for:

- Lifecycle health
- Maintenance
- Support
- Accessibility
- Deprecation

---

# Experiment Owner

Responsible for:

- Hypothesis
- Assignment
- Metrics
- Guardrails
- Analysis
- Decision

---

# Product Governance Reviews

Recommended:

```text
Opportunity review

Prioritization review

Experiment review

Release outcome review

Capability health review

Deprecation review

Portfolio review

Strategy review
```

---

# Opportunity Review Gate

```text
□ Problem is defined.

□ Audience is defined.

□ Evidence is summarized.

□ Confidence is recorded.

□ Outcome is proposed.

□ Risks are recorded.

□ Product boundary is respected.
```

---

# Prioritization Review Gate

```text
□ Priority class is assigned.

□ Mandatory status is verified.

□ Dependencies are identified.

□ Effort includes complete lifecycle.

□ Guardrails are defined.

□ Alternative opportunities are compared.

□ Decision is recorded.
```

---

# Experiment Review Gate

```text
□ Hypothesis is explicit.

□ Eligibility is defined.

□ Assignment is safe.

□ Primary metric is defined.

□ Guardrails are defined.

□ Stop conditions exist.

□ Accessibility review passes.

□ Privacy review passes.

□ Kill switch exists.
```

---

# Release Outcome Review Gate

```text
□ Intended outcome is measured.

□ Guardrails are reviewed.

□ Platform differences are reviewed.

□ Support impact is reviewed.

□ Accessibility result is reviewed.

□ Follow-up decision is recorded.
```

---

# Capability Health Review Gate

```text
□ Outcome remains relevant.

□ Reliability remains acceptable.

□ Accessibility remains acceptable.

□ Privacy remains accurate.

□ Provider remains suitable.

□ Support cost remains acceptable.

□ Public claims remain accurate.
```

---

# Deprecation Review Gate

```text
□ Reason is evidence-backed.

□ Affected users are identified.

□ Data treatment is defined.

□ Replacement is defined where applicable.

□ Communication exists.

□ Provider and SDK cleanup are planned.

□ Support is ready.
```

---

# Product Readiness Checklist

Before moving an opportunity to delivery:

```text
□ User problem is explicit.

□ Audience is explicit.

□ Evidence confidence is recorded.

□ Product outcome is defined.

□ Primary metric is defined.

□ Guardrails are defined.

□ Product boundaries are respected.

□ Accessibility is included.

□ Privacy is included.

□ Failure states are included.

□ Dependencies are ready.

□ Scope is bounded.

□ Owner is assigned.
```

---

# Experiment Readiness Checklist

```text
□ Experiment ID exists.

□ Hypothesis exists.

□ Eligibility exists.

□ Variants are defined.

□ Assignment is stable.

□ Exposure is measurable.

□ Primary metric exists.

□ Guardrails exist.

□ Stop conditions exist.

□ Data collection is approved.

□ Accessibility review passes.

□ Kill switch works.

□ Analysis owner exists.
```

---

# Release Measurement Checklist

```text
□ Baseline exists or is explicitly unavailable.

□ Measurement window is defined.

□ Production event definitions are active.

□ Guardrail monitors are active.

□ Support signals are reviewed.

□ Platform segmentation is available.

□ Privacy-safe segmentation is used.

□ Outcome review date exists.

□ Decision owner exists.
```

---

# Expansion Checklist

```text
□ Intended outcome improved.

□ Financial guardrails passed.

□ Owner guardrails passed.

□ Accessibility passed.

□ Privacy passed.

□ Reliability passed.

□ Support is prepared.

□ Provider capacity is sufficient.

□ Monitoring is active.

□ Public communication is accurate.
```

---

# Rollback Checklist

```text
□ Rollback trigger is defined.

□ Capability can be disabled or reverted.

□ Data compatibility is understood.

□ Migration impact is understood.

□ Support is notified.

□ User communication is prepared.

□ Monitoring confirms containment.

□ Recovery or correction is planned.
```

---

# Deprecation Checklist

```text
□ Deprecation decision is approved.

□ User impact is known.

□ New use can be disabled.

□ Migration or Export exists where required.

□ Data treatment is defined.

□ Provider cleanup is planned.

□ SDK and permissions are removed.

□ Policies and store declarations are updated.

□ Support path exists.

□ Removal verification is scheduled.
```

---

# Portfolio Review Checklist

```text
□ `Now` remains limited.

□ Mandatory work is visible.

□ Core Product outcomes are funded.

□ Accessibility work is visible.

□ Reliability work is visible.

□ Privacy work is visible.

□ Discovery continues.

□ Maintenance is funded.

□ Monetization does not dominate trust work.

□ Active initiatives have owners.

□ Stale items are reviewed.
```

---

# Product Definition of Ready

A Product opportunity is ready for prioritization only when:

```text
□ Problem is defined.

□ Audience is defined.

□ Evidence exists or assumption is explicit.

□ Confidence is recorded.

□ Product outcome is defined.

□ Risk is assessed.

□ Product boundary is respected.

□ Opportunity owner is assigned.
```

---

# Product Definition of Ready for Delivery

A prioritized initiative is ready for delivery only when:

```text
□ Outcome is approved.

□ Scope is bounded.

□ Requirements are identified.

□ Dependencies are ready.

□ Guardrails are measurable.

□ Accessibility behavior is defined.

□ Privacy behavior is defined.

□ Failure states are defined.

□ Measurement is defined.

□ Support and Operations impact are known.

□ Product owner is assigned.

□ Implementation roadmap accepts the work.
```

---

# Product Definition of Released

A capability is released only when:

```text
□ Intended audience has access.

□ Platform scope is accurate.

□ Migration is complete.

□ Support is ready.

□ Public content is accurate.

□ Measurement is active.

□ Guardrails are monitored.

□ Release record exists.
```

---

# Product Definition of Successful

A released capability is successful only when:

```text
□ Intended Product outcome improves.

□ Financial guardrails remain acceptable.

□ Owner guardrails remain acceptable.

□ Accessibility remains acceptable.

□ Privacy remains acceptable.

□ Reliability remains acceptable.

□ Operational cost remains acceptable.

□ Support impact remains acceptable.

□ Result is documented.
```

---

# Product Definition of Mature

A capability is mature when:

```text
□ Outcome remains stable.

□ User expectations are understood.

□ Reliability is predictable.

□ Accessibility is maintained.

□ Privacy and public disclosures are current.

□ Support has established procedures.

□ Maintenance cost is understood.

□ Deprecation or replacement conditions are known.
```

---

# Product Definition of Removed

A capability is fully removed only when:

```text
□ User access is removed.

□ New processing is stopped.

□ Data is migrated, exported, retained or deleted as approved.

□ Provider processing is stopped.

□ SDK is removed.

□ Permissions are removed.

□ Feature Flags are removed.

□ Public claims are updated.

□ Store declarations are updated.

□ Support guidance is updated.

□ Monitoring confirms absence.
```

---

# AI Product Planning Contract

AI may assist with Product strategy, research synthesis, roadmap organization and prioritization.

AI remains a drafting and analytical aid.

It is not a source of user evidence.

---

# AI Required Product Context

Before producing Product recommendations, an AI agent should inspect:

```text
Product strategy

Current roadmap

Opportunity Registry

Outcome Registry

Research findings

Support trends

Analytics definitions

Incident findings

Accessibility findings

Current capabilities

Current Product boundaries

Implementation dependencies

Compliance constraints
```

---

# AI Product Planning Task Contract

Recommended fields:

```text
task_id

Product_question

authoritative_sources

audience

known_evidence

unknowns

allowed_inferences

forbidden_claims

expected_output

review_owner
```

---

# AI Allowed Product Uses

AI may assist with:

- Organizing feedback
- Grouping repeated themes
- Drafting problem statements
- Drafting research questions
- Comparing solution options
- Identifying dependencies
- Drafting outcome metrics
- Drafting guardrails
- Detecting backlog duplicates
- Summarizing experiment findings
- Drafting roadmap communication

---

# AI Forbidden Product Uses

AI must not:

- Invent user interviews.
- Invent quotations.
- Invent Analytics.
- Invent market size.
- Invent competitor capability.
- Invent delivery dates.
- Invent pricing demand.
- Invent experiment results.
- Invent baseline metrics.
- Present assumptions as evidence.
- Decide legal adequacy.
- Decide Accessibility completion without testing.
- Mark an initiative successful without measurement.
- prioritize solely from generated scoring.
- create public commitments without approval.

---

# AI Evidence Labeling

AI-generated Product analysis should label inputs as:

```text
verified_evidence

reported_evidence

inference

assumption

unknown
```

---

# `verified_evidence`

Evidence directly available in approved sources.

---

# `reported_evidence`

A finding reported by a source but not independently verified by the AI task.

---

# `inference`

A reasoned conclusion derived from evidence.

It must identify supporting evidence.

---

# `assumption`

A proposition requiring validation.

---

# `unknown`

Insufficient information.

---

# AI Research Synthesis Rules

When summarizing research, AI should:

- Preserve participant differences.
- Preserve contradictory findings.
- Avoid creating composite quotations.
- Avoid adding demographic detail.
- Avoid exposing financial data.
- Identify sample limitations.
- Separate observation from interpretation.

---

# AI Feedback Clustering Rules

AI may group feedback when:

- The underlying problem is genuinely similar.
- Audience differences remain visible.
- Severity differences remain visible.
- Critical outliers are not hidden by common themes.

---

# AI Prioritization Rules

AI may calculate an advisory score only when:

- Inputs are defined.
- Missing values remain missing.
- Risk vetoes are applied.
- Dependencies are reviewed.
- Human authority makes the decision.

---

# AI Roadmap Rules

AI-generated roadmap drafts must:

- Separate `Now`, `Next`, `Later`, `Explore` and `Not Planned`.
- Avoid invented dates.
- Show uncertainty.
- Preserve mandatory work.
- Include Accessibility, Privacy, reliability and maintenance.
- Avoid presenting exploratory work as committed.

---

# AI Experiment Rules

AI may help draft:

- Hypothesis
- Eligibility
- Metrics
- Guardrails
- Stop conditions
- Analysis structure

AI must not:

- Select unsafe assignment.
- Fabricate statistical significance.
- Expand an experiment automatically.
- ignore negative guardrails.
- infer value from clicks alone.

---

# AI Outcome Review Rules

AI may summarize:

- Metric movement
- Guardrail results
- Platform differences
- Support themes
- Qualitative findings

The final decision requires accountable Product review.

---

# AI Product Change Summary

Every AI-assisted Product plan should state:

```text
Problem addressed

Evidence used

Assumptions

Unknowns

Expected outcome

Guardrails

Dependencies

Alternatives

Recommended decision

Required human reviews
```

---

# AI Product Prompt Template

```text
You are supporting a bounded Nexio Product planning task.

Product question:
[QUESTION]

Target audience:
[AUDIENCE]

Authoritative sources:
[SOURCES]

Verified evidence:
[EVIDENCE]

Known constraints:
[CONSTRAINTS]

Product boundaries:
[BOUNDARIES]

Required guardrails:
[GUARDRAILS]

Dependencies:
[DEPENDENCIES]

Allowed output:
[OUTPUT]

Do not invent:
- User quotes
- Research findings
- Analytics
- Metrics
- Delivery dates
- Market demand
- Experiment results
- Pricing evidence

Separate:
- Verified evidence
- Inference
- Assumption
- Unknown

Include Accessibility, Privacy, financial trust, owner isolation, reliability and Support implications.
```

---

# Final Product Roadmap Acceptance Criteria

The Nexio Product Roadmap and Prioritization architecture is accepted only when:

1. Product strategy remains separate from technical implementation sequencing.

2. Product planning begins with user and Product problems.

3. Requested features are translated into underlying needs.

4. Every material opportunity identifies an audience.

5. Every material opportunity identifies evidence or explicit assumptions.

6. Every material opportunity defines an expected outcome.

7. Product outputs remain distinct from outcomes.

8. Product progress is not measured only through delivery activity.

9. Financial trust outranks optional growth.

10. Owner isolation outranks optional growth.

11. Data durability outranks optional providers.

12. Privacy and deletion outrank optional processing.

13. Critical Accessibility blockers outrank visual refinement.

14. Mandatory store and provider work remains visible.

15. Product strategy defines vision, mission, promise and boundaries.

16. Product positioning avoids unsupported regulated-financial claims.

17. Strategic differentiators require implementation evidence.

18. Target audiences are based on need and context.

19. Audience confidence is recorded.

20. Personas remain evidence-based.

21. User needs remain independent from Product solutions.

22. Core user jobs are defined.

23. Product problems identify context, impact and evidence.

24. Opportunities remain solution-independent.

25. Opportunities have stable lifecycle records.

26. Product outcomes are observable.

27. Product metrics have explicit definitions.

28. Primary and guardrail metrics are distinct.

29. Counter and diagnostic metrics are supported.

30. Numeric targets require reliable baselines.

31. Product metrics are privacy-safe.

32. Product metrics do not encourage harmful engagement.

33. Discovery evaluates value, usability, feasibility and viability.

34. Discovery includes financial safety.

35. Discovery includes owner isolation.

36. Discovery includes Accessibility.

37. Discovery includes Privacy.

38. Discovery includes compliance.

39. Research minimizes sensitive financial data.

40. Usability testing uses synthetic financial examples.

41. Prototype evidence is not treated as technical proof.

42. Technical spikes are bounded.

43. Competitive research does not justify copying.

44. Surveys are not treated as the only evidence.

45. Support, incident and Store feedback inform discovery.

46. Contradictory evidence remains visible.

47. Product assumptions are explicitly recorded.

48. Riskiest assumptions are tested early.

49. Hypotheses define outcome and guardrails.

50. Discovery ends with an explicit decision.

51. Product priority classes P0 through P4 are defined.

52. Mandatory and discretionary work remain distinguishable.

53. Risk-reduction work receives visible priority.

54. Maintenance and deprecation remain visible.

55. Evidence levels are defined.

56. Reach does not override Critical severity.

57. Accessibility impact is part of prioritization.

58. Support impact is part of prioritization.

59. Delivery cost includes testing and migration.

60. Delivery cost includes Android, Operations and Support.

61. Cost of delay is assessed.

62. Dependency enablement is assessed.

63. Reversibility is assessed.

64. Numeric scores remain advisory.

65. Financial, Security, Privacy and Accessibility vetoes are supported.

66. Accept, discover, experiment, defer and reject remain distinct.

67. Deferrals have review triggers.

68. Rejections preserve learning.

69. Product roadmap horizons are defined.

70. `Now` remains limited.

71. `Next` is not automatically committed.

72. `Later` is directional.

73. `Explore` contains research questions.

74. `Not Planned` clarifies Product boundaries.

75. Public roadmap language remains conservative.

76. MVP preserves financial correctness.

77. MVP preserves owner isolation.

78. MVP preserves data durability.

79. MVP preserves critical Accessibility.

80. MVP preserves Privacy and deletion.

81. MVP remains supportable and recoverable.

82. Product release classes are defined.

83. Emergency releases remain governed.

84. Release themes connect to outcomes.

85. Releases favor complete vertical slices.

86. Platform parity means equivalent financial outcome.

87. Platform-limited rollout does not create permanent Domain divergence.

88. Release inclusion requires complete failure states.

89. Release inclusion requires Accessibility.

90. Release inclusion requires Support and monitoring.

91. Backlog hierarchy connects strategy to delivery.

92. Backlog readiness states are defined.

93. Stale backlog items are reviewed.

94. Product dependencies are explicit.

95. Hard dependencies cannot be bypassed through duplicate authority.

96. Initiative entry and exit gates are defined.

97. Assistant work progresses from read-only toward confirmed action.

98. Advertising waits for Privacy and deletion readiness.

99. Subscription planning defines user value and entitlement.

100. Privacy, deletion and Security controls are not paywalled.

101. Regional expansion requires language, Currency, provider, Support and policy readiness.

102. Experiments have a defined Product question.

103. Experiments remain reversible.

104. Experiments define primary metrics and guardrails.

105. Experiments define stop conditions.

106. Experiments exclude mandatory financial and owner controls.

107. Experiment assignment remains owner-safe.

108. Experiment exposure is recorded accurately.

109. Concurrent experiments are governed.

110. Financial and deletion workflows remain experiment exclusion zones.

111. Experiment analysis includes qualitative and quantitative evidence.

112. Inconclusive results remain inconclusive.

113. Negative guardrails override positive primary metrics.

114. Experiment decisions are recorded.

115. Experiment data follows retention and deletion.

116. Every material release receives post-release measurement.

117. Measurement includes outcome and guardrails.

118. Releases receive an explicit success classification.

119. Outcome reviews include platform and audience differences.

120. Unmeasurable releases are not labeled successful.

121. Expansion requires outcome and guardrail evidence.

122. Platform expansion requires platform-specific validation.

123. Regional expansion requires renewed readiness.

124. Provider expansion requires renewed Privacy and deletion review.

125. Automation expands gradually.

126. Rollback types remain distinguishable.

127. Data rollback is not assumed safe.

128. Every capability has a lifecycle state.

129. Every active capability has an accountable owner.

130. Capability health is reviewed.

131. Mature capabilities remain maintained.

132. Deprecation is evidence-backed.

133. Deprecation includes user communication.

134. Deprecation includes data treatment.

135. Deprecation includes provider, SDK and permission cleanup.

136. Feature removal updates policies and Store declarations.

137. Roadmap communication distinguishes available, planned and exploratory.

138. Public roadmap communication avoids false promises.

139. Roadmap delays and cancellations are recorded.

140. Portfolio balance includes trust, Accessibility, Privacy and maintenance.

141. Portfolio health states are defined.

142. Portfolio metrics do not encourage status manipulation.

143. Product governance roles are defined.

144. Opportunity, experiment, outcome and lifecycle reviews are distinct.

145. Product Definition of Ready is defined.

146. Product Definition of Ready for Delivery is defined.

147. Product Definition of Released is defined.

148. Product Definition of Successful is outcome-based.

149. Product Definition of Mature is defined.

150. Product Definition of Removed includes complete cleanup.

151. AI may assist with Product synthesis.

152. AI is not a source of user evidence.

153. AI does not invent quotes, Analytics or research.

154. AI labels evidence, inference, assumption and unknown separately.

155. AI preserves contradictory findings.

156. AI prioritization remains advisory.

157. AI roadmap drafts avoid invented dates.

158. AI experiment analysis cannot fabricate significance.

159. AI outcome summaries require accountable review.

160. Every Product decision remains traceable to evidence, outcomes and guardrails.

---

# Product Roadmap and Prioritization Constitutional Rule

Every Nexio strategy, priority, opportunity, initiative, experiment, release, expansion, deprecation and roadmap communication must answer:

```text
Which important user or Product problem does this address, which evidence supports the decision, which measurable outcome should improve, which guardrails must remain protected and what should Nexio do when the outcome does not improve?
```

When the answer is uncertain, prefer the action that:

- Records the uncertainty.
- Continues discovery.
- Narrows the audience.
- Narrows the scope.
- Uses a reversible experiment.
- Defines a baseline.
- Adds guardrails.
- Protects financial correctness.
- Protects owner isolation.
- Protects Accessibility.
- Protects Privacy and deletion.
- Stops expansion.
- Rolls back the capability.
- Deprecates the feature.
- Rejects the Product claim.

A Product roadmap is not complete when a capability is released.

It is complete only when Nexio verifies whether the intended outcome improved, confirms that trust guardrails remained protected and makes an explicit decision to expand, maintain, revise or remove the capability.

---

# Final Authority

This document is the official Product Roadmap and Prioritization specification for Nexio.

All future:

- Product strategies
- Product visions
- Product missions
- Product boundaries
- Audience segments
- Personas
- User needs
- Jobs-to-be-done
- Product problems
- Opportunities
- Product outcomes
- Metrics
- Guardrails
- Research
- Interviews
- Usability tests
- Technical spikes
- Product assumptions
- Product hypotheses
- Product goals
- Objectives
- Initiatives
- Capabilities
- Feature requests
- Product backlogs
- Prioritization decisions
- Product scores
- Roadmap horizons
- MVP definitions
- Product versions
- Release themes
- Experiments
- Post-release reviews
- Expansion decisions
- Rollback decisions
- Capability health reviews
- Deprecations
- Product removals
- Public roadmap communication
- Portfolio reports
- AI-assisted Product planning

must comply with this specification.

Exceptions require a documented Product, Domain, Security, Privacy, Accessibility, Engineering, Android, Web, Operations, Support, Compliance, Research, Analytics or Release decision containing:

- Named owner
- Product problem
- Target audience
- Evidence
- Assumptions
- Expected outcome
- Metrics
- Guardrails
- Priority
- Dependencies
- Financial impact
- Owner-isolation impact
- Privacy impact
- Accessibility impact
- Reliability impact
- Operational impact
- Reversibility
- Expiration
- Review trigger
- Required approvers

Undocumented priorities, unsupported roadmap commitments, fabricated Product evidence, unmeasured success claims and permanent experimental behavior are considered Product, financial-integrity, Privacy, Accessibility, reliability, operational and governance debt.

---