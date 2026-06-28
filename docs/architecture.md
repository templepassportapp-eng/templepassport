# Temple Passport — Architecture

This document captures all infrastructure and architectural decisions for the Temple Passport platform. It covers both the current low-cost phase and the target full-scale GCP architecture, including migration triggers for each upgrade.

---

## Guiding principles

- **Minimize ops burden** — prefer managed services when we have users to justify the cost; defer them when we don't
- **No premature scaling** — migrate each component only when a specific pain point is hit, not preemptively
- **Code stays the same** — infrastructure changes should require only config/environment variable changes, not application code rewrites
- **GCP-native** — all services run on GCP + Firebase; chosen for sustained cost advantage over AWS at both Phase 1 and Phase 2

---

## Why GCP over AWS

| Factor | AWS | GCP |
|---|---|---|
| Compute (Phase 1) | t3.micro ~$8/month | e2-micro ~$6/month (asia-south1) |
| Phone OTP auth | SNS SMS ~$0.02/msg | Firebase Auth **free** up to 10K/month |
| Push notifications | SNS Mobile Push ~$0.01/msg | Firebase Cloud Messaging (FCM) **free** |
| Container runtime (Phase 2) | ECS Fargate always-on ~$30/month | Cloud Run **scale-to-zero** ~$5–15/month |
| Database (Phase 2) | RDS t4g.micro ~$25/month | Cloud SQL ~$20/month |
| Registry | ECR ~$1/month | Artifact Registry ~$0.50/month |
| DNS | Route 53 $0.50/zone | Cloud DNS $0.20/zone |
| **Phase 1 total** | **~$11/month** | **~$6/month** |
| **Phase 2 total** | **~$100–115/month** | **~$60–75/month** |

The decisive Phase 2 advantage is Cloud Run's scale-to-zero billing. ECS Fargate runs 24/7 regardless of traffic; Cloud Run charges only for actual request-processing time. At early Phase 2 (50K DAU but uneven traffic), this alone saves $15–25/month.

---

## Two-phase architecture

### Phase 1 — Low-cost (current, < ~2,000 DAU)

**Target cost: ~$6/month** (GCP `asia-south1` Mumbai region)

Everything runs on a single GCE instance via Docker Compose. No managed database, cache, or container orchestration — those run as containers on the same host.

```
Internet
    │
Cloud CDN + Cloud Load Balancing (HTTPS, Google-managed SSL)
    │
GCE e2-micro  (~$6/month, asia-south1)
    ├── Spring Boot container   (port 8080)
    ├── PostgreSQL container    (port 5432, data on Persistent Disk 20GB)
    └── Redis container         (port 6379, in-memory only, 100MB cap)

Cloud Storage (GCS)             (photo storage, free tier 5GB)
Firebase Authentication         (phone OTP — free up to 10K verifications/month)
Firebase Cloud Messaging (FCM)  (push notifications — free)
Cloud DNS                       ($0.20/month)
Google-managed SSL              (free via Cloud Load Balancing)
Cloud Logging                   (free tier 50GB/month)
```

**Phase 1 cost breakdown:**

| Service | Cost |
|---|---|
| GCE e2-micro (asia-south1) | ~$6.10/month |
| Persistent Disk 20GB pd-standard | ~$0.80/month |
| Cloud Storage + CDN | ~$0–2/month (free tier) |
| Cloud DNS | $0.20/month |
| Firebase Auth (phone OTP) | $0 (< 10K/month) |
| Firebase Cloud Messaging | $0 (always free) |
| Cloud Logging | $0 (free tier) |
| **Total** | **~$7–9/month** |

> **Note**: If registrations exceed 10K/month, Firebase Auth charges $0.0055 per SMS verification (still cheaper than AWS SNS at $0.02/SMS in India).

---

### Phase 2 — Full scale (when justified by user growth)

**Target cost: ~$60–75/month** — adopted component-by-component as migration triggers are hit.

```
Internet
    │
Cloud CDN (for API + media)
    │
Cloud Load Balancing (HTTPS)
    │
Cloud Run (Spring Boot, scales 0 → N instances on demand)
    │
    ├── Cloud SQL PostgreSQL (HA, automated backups)
    ├── Memorystore Redis (managed cache + WebSocket pub/sub relay)
    └── Pub/Sub → Cloud Functions (async jobs: feed, notifications)

Cloud Storage + Cloud CDN     (photos + media, immutable cache)
Cloud Functions               (image resizing on GCS upload)
Firebase Auth                 (unchanged — still free)
Firebase Cloud Messaging      (Android push — still free)
APNs direct                   (iOS push, via Spring Boot)
Artifact Registry             (Docker image registry)
Secret Manager                (credentials, API keys)
Cloud Monitoring + Logging    (metrics, dashboards, alerts)
Cloud Armor                   (rate limiting, DDoS protection)
```

**Phase 2 cost breakdown:**

| Service | Cost |
|---|---|
| Cloud Run (1 vCPU / 2GB, ~30% utilisation at 50K DAU) | ~$10–20/month |
| Cloud SQL PostgreSQL db-g1-small | ~$20–25/month |
| Memorystore Redis 1GB Basic | ~$18/month |
| Cloud Storage + Cloud CDN | ~$5–10/month |
| Pub/Sub + Cloud Functions | ~$0–3/month |
| Artifact Registry | ~$0.50/month |
| Secret Manager | ~$0.50/month |
| Firebase Auth + FCM | $0 |
| Cloud DNS | $0.20/month |
| **Total** | **~$55–77/month** |

---

## Migration triggers

Do not migrate preemptively. Each managed service is adopted only when the corresponding symptom appears.

| Symptom | Migration |
|---|---|
| GCE RAM consistently > 80%, app sluggish | Split PostgreSQL → Cloud SQL, Redis → Memorystore, Spring Boot → Cloud Run |
| Need zero-downtime deploys with multiple instances | Move to Cloud Run (handles this natively with revisions) |
| Chat messages query slow (> 100K records per group) | Migrate messages table → Firestore |
| Post/notification delivery delays (in-process async too slow) | Add Pub/Sub for feed invalidation and notification fan-out |
| PostgreSQL backup/restore causes anxiety | Migrate to Cloud SQL (automated backups + PITR built-in) |
| Single GCE has downtime that real users notice | Cloud Run with min-instances=1 + Cloud SQL HA |
| DDoS or scraping attempts | Add Cloud Armor on Load Balancer |

---

## Service decisions

### Compute — GCE e2-micro → Cloud Run

**Phase 1**: Single GCE e2-micro, Docker Compose manages all containers. Deployed via GitHub Actions: build JAR → build Docker image → push to Artifact Registry → SSH into GCE + `docker-compose pull && docker-compose up -d`.

**Phase 2**: Cloud Run service. Same Dockerfile, same Artifact Registry image. CI/CD deploys a new Cloud Run revision instead of SSH. Cloud Run handles HTTPS, load balancing, and autoscaling natively — no separate load balancer config needed.

**Why Cloud Run over GKE**: GKE (Kubernetes) adds ~$70/month for the control plane even at zero traffic. Cloud Run charges only per request-second. At Phase 2 scale, Cloud Run is the right fit.

**JVM tuning for e2-micro (1GB RAM)**:
```
JAVA_OPTS="-Xmx320m -Xms200m -XX:MaxMetaspaceSize=120m -XX:+UseG1GC"
```
Spring Boot ~330MB, PostgreSQL ~180MB, Redis ~60MB, OS+Docker ~200MB = ~770MB total. Workable with headroom for spikes.

### Database — PostgreSQL (self-hosted → Cloud SQL)

**Phase 1**: PostgreSQL 16 Alpine container on GCE. Data persisted to named Docker volume on Persistent Disk. Daily `pg_dump` backup to Cloud Storage via cron.

**Phase 2**: Cloud SQL for PostgreSQL. Connection string change only — no application code change. Cloud SQL Proxy handles IAM-based auth and encrypted connections without changing the JDBC URL pattern.

**Extensions in use**:
- `pg_trgm` — trigram similarity for fuzzy name search (replaces Elasticsearch at this scale)
- `uuid-ossp` — UUID generation

**Why not Firestore for everything**: PostgreSQL handles all relational data cleanly. Firestore is only considered for messages in Phase 2 due to its time-series access pattern and high write throughput — and only if PostgreSQL message queries show actual slowness.

### Cache — Redis (self-hosted → Memorystore)

**Phase 1**: Redis 7 Alpine container on GCE. 100MB cap with `allkeys-lru` eviction. Cache only — no pub/sub in Phase 1 (single instance, one JVM).

**Phase 2**: Memorystore for Redis. Adds pub/sub relay so multiple Cloud Run instances can route WebSocket messages to the right connection. Spring's `MessageBrokerRegistry` supports this with a single config change.

**Cache TTLs**:

| Key pattern | TTL | Data |
|---|---|---|
| `feed:{userId}` | 90 seconds | Paginated feed |
| `profile:{userId}` | 5 minutes | User profile |
| `temple:{templeId}` | 24 hours | Temple details (rarely change) |
| `search:{query}` | 30 seconds | Search results |
| `group:members:{groupId}` | 2 minutes | Group membership list |

### Photo storage — Cloud Storage + Cloud CDN

**Both phases**: Client-side direct upload via GCS signed URLs. Spring Boot generates the signed URL (15-minute TTL) — the file never passes through the application server.

**Upload flow**:
1. App calls `POST /upload/presign` → Spring returns `{ url, key }`
2. App PUTs file directly to GCS signed URL
3. App calls `POST /posts` with the GCS `key` → Spring saves to PostgreSQL

**GCS bucket structure**:
```
temple-passport-media/
  users/{userId}/avatar/original.jpg
  posts/{postId}/{index}/original.jpg
```

**Image variants**: In Phase 1, Cloud CDN serves originals (mobile clients resize client-side via Expo Image). In Phase 2, a Cloud Function triggered on GCS upload pre-generates `thumb/` (150px) and `medium/` (720px) variants.

**Cloud CDN**: Sits in front of the GCS bucket. All media URLs use the CDN domain — bucket is not public. `Cache-Control: max-age=31536000, immutable` for post images (new posts get new keys, old ones never change).

### Authentication — Firebase Authentication

**Both phases**: Firebase Authentication handles registration, phone OTP (SMS), and JWT issuance. Spring Boot validates Firebase ID tokens using the Firebase Admin SDK — a single filter, no custom auth logic.

**Why Firebase Auth over Cognito**:
- Phone OTP is free up to 10K verifications/month (Cognito charges via SNS SMS at $0.02/SMS in India)
- Firebase Admin SDK validates ID tokens locally (no network round-trip per request)
- React Native SDK (`@react-native-firebase/auth`) is mature and well-documented for Indian phone auth flows
- No MAU charges on the free Spark plan

**Token validation in Spring Boot**:
```java
FirebaseToken decoded = FirebaseAuth.getInstance().verifyIdToken(idToken);
String uid = decoded.getUid();  // Firebase UID, stored as firebase_uid in users table
```

### Real-time chat — Spring WebSocket (STOMP)

**Phase 1**: Spring WebSocket with STOMP. Single GCE instance means all WebSocket connections are in the same JVM — no pub/sub relay needed. Messages saved to PostgreSQL.

**Phase 2**: Same WebSocket code. Memorystore Redis added as the STOMP message broker relay so multiple Cloud Run instances can share connections. One `application.yml` change enables this.

> Note: Cloud Run requires the `--session-affinity` flag enabled for WebSocket connections to work correctly (routes a client's reconnect to the same instance where possible).

**Message persistence**: PostgreSQL in Phase 1, optionally Firestore in Phase 2 if message volume warrants it.

### User search

**Both phases (initially)**: PostgreSQL `pg_trgm` extension.

```sql
-- Phone search (exact)
SELECT * FROM users WHERE phone = $1 AND discoverable = true;

-- Name search (fuzzy, ranked by similarity)
SELECT *, similarity(name, $1) AS score
FROM users
WHERE name % $1 AND discoverable = true
ORDER BY score DESC
LIMIT 10;
```

**Phase 2 upgrade path** (if pg_trgm becomes too slow at > 500K users): Elasticsearch on GKE, or Vertex AI Search. Index synced via CDC on the PostgreSQL users table using Debezium.

### Async jobs — Spring @Async → Pub/Sub + Cloud Functions

**Phase 1**: In-process async via Spring `@Async`. Feed invalidation and push notifications run in a thread pool within the Spring Boot process.

**Phase 2**: Cloud Pub/Sub queue. `PostService` publishes a message; a Cloud Function subscriber handles fan-out. Application code change: swap `@Async` method body to publish a Pub/Sub message instead of executing inline.

### Push notifications — Firebase Cloud Messaging (FCM)

**Both phases**: Firebase Cloud Messaging (FCM) sends push notifications to Android and iOS directly from Spring Boot. FCM is completely free with no per-message charges.

```java
Message message = Message.builder()
    .setNotification(Notification.builder()
        .setTitle("New group invite")
        .setBody("Kavin invited you to Badrinath Yatra")
        .build())
    .setToken(deviceToken)
    .build();
FirebaseMessaging.getInstance().send(message);
```

Spring Boot uses the Firebase Admin SDK (already added for auth) — no additional dependency needed for FCM.

### CI/CD — GitHub Actions → Artifact Registry → GCE/Cloud Run

```
On push to main:
  1. mvn package -DskipTests
  2. docker build -t temple-passport .
  3. docker tag → asia-south1-docker.pkg.dev/{project}/temple-passport/api
  4. docker push → Artifact Registry
  5a. Phase 1: gcloud compute ssh → docker-compose pull + up -d
  5b. Phase 2: gcloud run deploy temple-passport --image=... --region=asia-south1
```

### Secrets management

**Phase 1**: `.env` file on GCE (not in repo). Loaded by Docker Compose via `env_file`.

**Phase 2**: GCP Secret Manager. Spring Boot uses `spring-cloud-gcp-starter-secretmanager` to inject secrets at startup. GCE/Cloud Run service account grants read access — no credentials stored on the host.

---

## Data model overview

### PostgreSQL tables (both phases)

```sql
users               (id, firebase_uid, name, phone, avatar_key, discoverable, pilgrim_since, path, created_at)
follows             (follower_id, followee_id, created_at)
temples             (id, name, city, state, categories text[], pincode, coordinates, description)
posts               (id, author_id, type, temple_id, caption, media_keys[], lamps_count, created_at)
post_reactions      (post_id, user_id, type, created_at)
comments            (id, post_id, author_id, body, lights_count, created_at)
yatra_groups        (id, name, label, created_by, created_at)
group_members       (group_id, user_id, status, joined_at)
messages            (id, group_id, sender_id, body, media_key, sent_at)   ← moves to Firestore in Phase 2 if needed
check_ins           (id, user_id, temple_id, checked_at, stamp_awarded)
collections         (id, name, type, temple_ids[])
user_collections    (user_id, collection_id, visited_count)
expenses            (id, group_id, paid_by, title, amount, split_count, created_at)
expense_splits      (expense_id, user_id, amount, settled)
admin_users         (id, username, password_hash, name, created_at)
feature_flags       (key, label, description, enabled, category, updated_at, updated_by)
affiliates          (id, name, type, description, website_url, commission_pct, enabled, created_at)
temple_category_definitions (key, label, color, is_custom, created_at)
```

### Firestore (Phase 2, messages only — if PostgreSQL messages become slow)

```
Collection: groups/{groupId}/messages
  Document ID: auto (ordered by timestamp)
  Fields: senderId, body, mediaKey, sentAt (Timestamp), readBy[]
  TTL: via Cloud Functions scheduled cleanup after 1 year
```

---

## Infrastructure as code

Target: **Terraform** — GCP's Terraform provider (`google` + `google-beta`) is first-class and production-proven. Terraform also keeps the IaC layer cloud-portable if ever needed.

```
infra/
  modules/
    gce/            (Phase 1 compute)
    cloud-run/      (Phase 2 compute)
    cloud-sql/      (Phase 2 database)
    memorystore/    (Phase 2 cache)
    gcs/            (storage, both phases)
    firebase/       (auth config)
  environments/
    phase1/
      main.tf
      variables.tf
    phase2/
      main.tf
      variables.tf
```

Phase 1 Terraform defines GCE instance, firewall rules, GCS bucket, Cloud DNS, Cloud CDN. Phase 2 adds Cloud Run service, Cloud SQL instance, Memorystore, Pub/Sub topics, Cloud Functions, Cloud Armor.

---

## Region

**Primary**: `asia-south1` (Mumbai) — lowest latency for Indian users, all required services available. Firebase Authentication and FCM have global infrastructure with no region selection needed.
