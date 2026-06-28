# ADR 001 — Two-phase GCP architecture

**Status**: Accepted (supersedes original AWS plan)
**Date**: 2026-06-28  
**Updated**: 2026-06-28 — migrated from AWS to GCP

## Context

Temple Passport needs a backend that is production-ready but cost-effective during the early months when user volume will be low. A full managed-service setup costs ~$60–80/month regardless of traffic. That cost is not justified before meaningful user growth.

AWS was the original target. After cost analysis, GCP offers meaningful advantages at both phases:
- Firebase Authentication is free for phone OTP (saves ~$0.02/SMS × all registrations vs AWS SNS)
- Firebase Cloud Messaging is permanently free (vs SNS Mobile Push per-message charges)
- Cloud Run bills per request-second with scale-to-zero (vs ECS Fargate always-on ~$30/month)
- Phase 1 compute is ~25% cheaper in Mumbai (asia-south1)

Since Phase 2 services (ECS/EKS, Cognito, RDS, ElastiCache, SQS, Lambda) had not yet been built when this decision was made, switching cost was ~2–3 weeks — well within the payback period.

## Decision

Adopt a two-phase GCP architecture:

**Phase 1 (now)**: Single GCE e2-micro running Spring Boot + PostgreSQL + Redis via Docker Compose. Cost: ~$7–9/month. Firebase Auth and FCM are used from day one (both free).

**Phase 2 (when triggered)**: Migrate individual components to GCP managed services as specific pain points arise. Cloud Run, Cloud SQL, Memorystore. Each migration is a config/env var change — no application code rewrites.

## Consequences

- **Positive**: ~$4–5/month saved vs AWS at Phase 1; ~$25–40/month saved at Phase 2 (primarily Cloud Run vs ECS Fargate)
- **Positive**: Firebase Auth and FCM are free permanently — eliminates per-SMS and per-push costs
- **Positive**: Cloud Run scale-to-zero means Phase 2 cost scales with actual traffic, not reserved capacity
- **Positive**: Terraform IaC keeps the infrastructure layer cloud-portable
- **Positive**: Migration path clearly defined component-by-component, reversible
- **Negative**: Single GCE is a single point of failure — acceptable until real users depend on uptime
- **Negative**: Manual PostgreSQL backup in Phase 1 (mitigated by daily pg_dump cron to Cloud Storage)
- **Negative**: Cloud Run requires `--session-affinity` flag for WebSocket sticky routing in Phase 2
