# ADR 005 — Spring WebSocket (STOMP) for group chat

**Status**: Accepted  
**Date**: 2026-06-28

## Context

Group chat requires real-time message delivery. Options considered: Firebase Realtime Database, Firestore real-time listeners, Spring WebSocket + STOMP.

## Decision

Use Spring Boot's built-in WebSocket support with STOMP protocol.

- **Phase 1** (single GCE): all connections are in the same JVM — no pub/sub relay needed. Messages saved to PostgreSQL.
- **Phase 2** (multiple Cloud Run instances): Memorystore Redis added as the STOMP message broker relay — one config change in `MessageBrokerRegistry`. Cloud Run's `--session-affinity` flag routes reconnects to the same instance where possible.

Messages are persisted to PostgreSQL synchronously on receipt, before broadcasting to subscribers.

## Consequences

- **Positive**: Spring Boot ships with WebSocket + STOMP — no additional service or SDK in Phase 1
- **Positive**: Phase 2 scaling requires only a Redis relay config change, not an architecture change
- **Positive**: Firebase Admin SDK (already present for auth + FCM) is not needed for chat — keeps the chat path fully self-contained
- **Positive**: Message history is queryable via standard SQL (join with users, filter by group, cursor paginate)
- **Negative**: Firebase Realtime Database would handle offline sync and conflict resolution automatically, but adds vendor lock-in and cost above free tier limits
- **Negative**: Cloud Run WebSocket requires `--session-affinity` for correct sticky routing in Phase 2 — without it, reconnects may land on a different instance and miss in-flight messages until Redis relay delivers them
- **Negative**: WebSocket connections are stateful — horizontal scaling in Phase 2 requires the Memorystore relay (planned and documented)
