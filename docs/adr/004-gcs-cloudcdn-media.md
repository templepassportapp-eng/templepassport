# ADR 004 — Cloud Storage + Cloud CDN for media

**Status**: Accepted (replaces S3 + CloudFront)  
**Date**: 2026-06-28  
**Updated**: 2026-06-28 — switched from AWS S3/CloudFront to GCS/Cloud CDN

## Context

The app needs to store and serve user avatars and post photos fast to users across India. AWS S3 + CloudFront was the original choice; switching to GCP equivalents as part of the broader platform migration.

## Decision

Store all media in a private Cloud Storage (GCS) bucket. Serve via Cloud CDN. Use GCS signed URLs for client-side direct upload — photos never pass through the Spring Boot server.

Upload flow: mobile calls `POST /upload/presign` → Spring returns GCS signed URL (15-min TTL) → mobile PUTs file directly to GCS → mobile sends GCS key to `POST /posts`.

**Why the pattern is identical to S3**: GCS signed URLs use the same V4 signing mechanism as S3 presigned URLs. The Spring Boot code changes are minimal — swap `S3Presigner` for `Storage.signUrl()`.

## Consequences

- **Positive**: Photos never consume Spring Boot server bandwidth or memory
- **Positive**: Cloud CDN has a Mumbai POP — low latency for Indian users
- **Positive**: GCS free tier: 5GB storage, 5K Class A operations, 50K Class B operations/month — effectively free initially
- **Positive**: Immutable assets (images don't change once uploaded) get `Cache-Control: max-age=31536000, immutable` — near-zero origin hits after first load
- **Positive**: GCS has an S3-compatible XML API — if reverting to AWS, the client code change is minimal
- **Negative**: Two-step upload flow is slightly more complex than a single POST — mitigated by a clear `useUpload()` hook in the mobile app
