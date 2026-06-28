# ADR 003 — PostgreSQL as primary datastore

**Status**: Accepted  
**Date**: 2026-06-28

## Context

The app has relational data (users, follows, posts, groups, expenses, temples, check-ins) and time-series data (chat messages). The original plan included DynamoDB for messages from day one; we are now on GCP where Firestore is the equivalent.

## Decision

Use PostgreSQL for all data in Phase 1, including messages. Firestore is deferred to Phase 2 and only adopted if message query performance becomes an actual problem.

Enable `pg_trgm` extension for fuzzy name search — eliminates the need for a separate search service at this scale.

**Phase 1**: PostgreSQL 16 Alpine container on GCE, data on Persistent Disk. Daily `pg_dump` backup to Cloud Storage via cron.

**Phase 2**: Cloud SQL for PostgreSQL. Same schema, same Flyway migrations. Connection string change only.

## Consequences

- **Positive**: One database to operate, back up, and reason about in Phase 1
- **Positive**: `pg_trgm` handles name search well up to ~500K users — no additional service needed
- **Positive**: Messages and relational data can be joined freely (e.g., get messages with sender profile in one query)
- **Positive**: Flyway migrations version-control the entire schema — reproducible on any environment
- **Positive**: Cloud SQL is a drop-in replacement — zero application code change when migrating
- **Negative**: PostgreSQL messages table will need migration to Firestore if a group exceeds ~100K messages — this is the explicit trigger
- **Negative**: Self-managed PostgreSQL in Phase 1 requires manual backup setup (cron + Cloud Storage)
