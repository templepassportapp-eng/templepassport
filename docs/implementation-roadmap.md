# Temple Passport — Implementation Roadmap

Track progress here. Check off each item as it is merged and verified working.

> Architecture decisions live in [architecture.md](./architecture.md).
> ADRs (individual decision records) live in [adr/](./adr/).

**Last audited**: 2026-06-28  
**Overall backend coverage**: ~29% of target architecture  
- Auth: 20% (custom JWT only — Firebase Auth not yet integrated)
- Schema: 44% (8 of 18 tables — all social tables missing; admin/flag/affiliate/category tables added in V13–V15)
- API endpoints: 33% (10 of 30+ — missing all social/group/chat endpoints)
- Infrastructure: 20% (Flyway + docker-compose present; Redis, GCS, WebSocket all missing)

**Platform**: GCP (`asia-south1` Mumbai). Firebase Auth + FCM replace AWS Cognito + SNS.

---

## Phase 1 — Foundation (Low-cost single GCE)

Goal: Real backend replacing all mock data. Single GCE e2-micro, Docker Compose, ~$7–9/month.

---

### 1.1 GCP account & baseline setup
- [ ] Create GCP project, enable billing, set budget alert at $15/month
- [ ] Enable required APIs: Compute, Cloud Storage, Cloud DNS, Cloud CDN, Artifact Registry, Secret Manager, Firebase
- [ ] Create service account for CI (least-privilege: Artifact Registry writer, Storage admin, Compute SSH)
- [ ] Create Firebase project, link to GCP project
- [ ] Register domain, configure Cloud DNS zone
- [ ] Provision Google-managed SSL certificate for `api.templepassport.in` and `media.templepassport.in`
- [ ] Set primary region to `asia-south1` (Mumbai)

---

### 1.2 Auth — migrate from custom JWT to Firebase Authentication

**Current state**: Custom HMAC-SHA256 JWT in `JwtUtil.java`, secret hardcoded. Dev user seeded via `V3__dev_user.sql`. Admin JWT now uses a separate `generateAdminToken()` path.

- [ ] Enable Firebase Authentication in Firebase console (Phone provider)
- [ ] Add Firebase Admin SDK to `pom.xml`: `com.google.firebase:firebase-admin:9.x`
- [ ] Create GCP service account key for Firebase Admin SDK (store as Secret Manager secret)
- [ ] Initialize `FirebaseApp` in Spring Boot `@Configuration` bean using service account
- [ ] Create `FirebaseJwtFilter.java` (replaces `JwtAuthFilter.java`):
  - Extract `Authorization: Bearer <firebase-id-token>` header
  - Call `FirebaseAuth.getInstance().verifyIdToken(token)` — validates locally using cached public keys
  - Set `firebase_uid` in `SecurityContext` or request attribute
- [ ] Add `firebase_uid` column to `users` table (Flyway migration V16)
- [ ] Add `discoverable` boolean column to `users` table (default true, V16)
- [ ] Add `pilgrim_since` date and `path` varchar columns to `users` table (V16)
- [ ] Update `POST /api/auth/register` — on first Firebase login, create a `users` row linked by `firebase_uid`; on subsequent calls, return existing user
- [ ] Remove `POST /api/auth/send-otp` and `POST /api/auth/verify-otp` (Firebase handles this on the mobile side)
- [ ] Remove `V3__dev_user.sql` seed data (replace with a harmless comment to preserve migration sequence)
- [ ] Keep `JwtUtil.java` only for admin portal tokens (admin JWT path is separate from user auth)
- [ ] Mobile: add `@react-native-firebase/app` and `@react-native-firebase/auth`
- [ ] Mobile: replace `useAuth` OTP flow with Firebase phone auth:
  - `firebase.auth().signInWithPhoneNumber('+91...')` → verificationId
  - `firebase.auth().PhoneAuthProvider.credential(verificationId, code)` → credential
  - `firebase.auth().signInWithCredential(credential)` → user + ID token
- [ ] Mobile: pass Firebase ID token as `Authorization: Bearer` on all API calls (token auto-refreshes via Firebase SDK)
- [ ] Test: register via OTP on mobile → Firebase issues ID token → Spring validates → user row created → authenticated API call succeeds

---

### 1.3 PostgreSQL schema — missing social tables

**Current state**: V1–V15 applied. Tables: users, temples, check_ins, collections, collection_temples, user_achievements, achievements, otp_sessions (V1–V12) + admin_users, feature_flags, affiliates (V13) + pincode/blocked columns (V14) + temple_category_definitions/categories column (V15). All social feature tables missing.

Add Flyway migrations:

- [ ] `V16__user_social_columns.sql` — add `firebase_uid`, `discoverable`, `pilgrim_since`, `path`, `device_token`, `device_platform` to `users`
- [ ] `V17__add_follows.sql` — `follows(follower_id, followee_id, created_at)`, unique constraint, indexes on both columns
- [ ] `V18__add_posts.sql` — `posts(id, author_id, type, temple_id, caption, media_keys text[], lamps_count int default 0, created_at)`; index on `(author_id, created_at DESC)`
- [ ] `V19__add_post_reactions.sql` — `post_reactions(post_id, user_id, type, created_at)`, primary key `(post_id, user_id)`
- [ ] `V20__add_comments.sql` — `comments(id, post_id, author_id, body, lights_count int default 0, created_at)`; index on `(post_id, created_at)`
- [ ] `V21__add_yatra_groups.sql` — `yatra_groups(id, name, label, created_by, created_at)`
- [ ] `V22__add_group_members.sql` — `group_members(group_id, user_id, status, joined_at)`, primary key `(group_id, user_id)`; status check `('pending','accepted','declined')`
- [ ] `V23__add_messages.sql` — `messages(id, group_id, sender_id, body, media_key, sent_at)`; index on `(group_id, sent_at DESC)`
- [ ] `V24__add_expenses.sql` — `expenses(id, group_id, paid_by, title, amount numeric, split_count int, created_at)`
- [ ] `V25__add_expense_splits.sql` — `expense_splits(id, expense_id, user_id, amount numeric, settled boolean default false)`
- [ ] `V26__add_pg_trgm.sql` — `CREATE EXTENSION IF NOT EXISTS pg_trgm; CREATE INDEX users_name_trgm ON users USING GIN(name gin_trgm_ops);`

---

### 1.4 Docker, GCE & deployment

**Current state**: `docker-compose.yml` exists with PostgreSQL + backend. Redis missing. No Artifact Registry / CI/CD.

- [ ] Add Redis service to `docker-compose.yml` (redis:7-alpine, `--maxmemory 100mb --maxmemory-policy allkeys-lru`)
- [ ] Add Redis dependency to `pom.xml`: `spring-boot-starter-data-redis`
- [ ] Add `@EnableCaching` + `RedisCacheConfiguration` bean in Spring Boot
- [ ] Write production `Dockerfile` (multi-stage: Maven build → Eclipse Temurin JRE 21 slim)
  - Set `JAVA_OPTS="-Xmx320m -Xms200m -XX:MaxMetaspaceSize=120m -XX:+UseG1GC"` for e2-micro (1GB RAM)
- [ ] Launch GCE e2-micro in `asia-south1`, Debian 12, 20GB pd-standard Persistent Disk
- [ ] Attach service account to GCE (permissions: Storage read/write, Artifact Registry read, Secret Manager read, Firebase Admin)
- [ ] Install Docker + Docker Compose on GCE
- [ ] Configure firewall rule: allow 443 from internet; block direct 5432/6379 from internet
- [ ] Configure Nginx as reverse proxy (443 → 8080, TLS via Google-managed SSL cert via Cloud Load Balancing)
- [ ] Reserve static external IP, associate with GCE
- [ ] Cloud DNS A record: `api.templepassport.in` → static IP
- [ ] Create `.env` file on GCE (DB credentials, Firebase service account path, GCS bucket name — not in repo)
- [ ] Run `docker-compose up -d`, verify Spring Boot + PostgreSQL + Redis all healthy
- [ ] Confirm Flyway runs all migrations on startup

---

### 1.5 CI/CD — GitHub Actions → Artifact Registry → GCE

- [ ] Create Artifact Registry repository: `asia-south1-docker.pkg.dev/{project}/temple-passport`
- [ ] Write `.github/workflows/deploy.yml`:
  - Trigger: push to `main`
  - Steps: `mvn package -DskipTests` → `docker build` → authenticate to Artifact Registry → push image → `gcloud compute ssh` → `docker-compose pull && up -d`
- [ ] Store GitHub Actions secrets: `GCP_PROJECT_ID`, `GCP_SA_KEY` (service account JSON), `GCE_INSTANCE_NAME`, `GCE_ZONE`
- [ ] Test: push a commit to `main`, verify new container running on GCE within 5 minutes

---

### 1.6 Cloud Storage + Cloud CDN — photo storage

**Current state**: Not implemented. No GCS SDK in `pom.xml`.

- [ ] Add GCS SDK to `pom.xml`: `com.google.cloud:google-cloud-storage`
- [ ] Create GCS bucket `temple-passport-media-prod` in `asia-south1` (uniform bucket-level access, no public ACLs)
- [ ] Create `GcsConfig.java` — `Storage` bean using GCE service account (Application Default Credentials — no key file in code)
- [ ] Implement `POST /upload/presign` — returns `{ url, key }`, 15-minute V4 signed URL for PUT
  - Key format: `posts/{postId}/{index}/original.jpg` or `users/{userId}/avatar/original.jpg`
  - Allowed content types: `image/jpeg`, `image/png`, `image/webp`
- [ ] Create Cloud CDN distribution backed by GCS bucket (using Cloud Load Balancing backend bucket)
- [ ] Cloud DNS CNAME: `media.templepassport.in` → CDN load balancer IP
- [ ] Set object metadata `Cache-Control: max-age=31536000, immutable` for all uploaded media
- [ ] Update mobile upload flow: call presign → PUT to GCS → send key in `POST /posts`
- [ ] Test: upload photo from mobile, serve via `https://media.templepassport.in/...`
- [ ] Set up daily PostgreSQL backup cron on GCE: `pg_dump | gzip | gsutil cp - gs://temple-passport-backups/$(date +%F).sql.gz`
- [ ] GCS lifecycle rule on backup bucket: delete objects older than 30 days

---

### 1.7 User & search endpoints

**Current state**: `GET /api/users/{id}/stats` exists. No full profile GET, no follow endpoints, no user search.

- [ ] `GET /api/users/{id}` — full profile (name, avatar, pilgrimSince, path, stats summary); Redis cache 5 min
- [ ] `PATCH /api/users/{id}` — update name, path, pilgrim_since, discoverable, avatar_key
- [ ] `POST /api/users/device-token` — save FCM device token for push notifications
- [ ] `POST /api/users/{id}/follow` — insert into `follows`, invalidate feed cache for follower
- [ ] `DELETE /api/users/{id}/follow` — delete from `follows`, invalidate cache
- [ ] `GET /api/users/{id}/followers` — paginated follower list
- [ ] `GET /api/users/{id}/following` — paginated following list
- [ ] `GET /api/users/search?phone={phone}` — exact match on `users.phone` where `discoverable = true`
- [ ] `GET /api/users/search?name={name}` — fuzzy via `pg_trgm`: `WHERE name % :name ORDER BY similarity DESC LIMIT 10`

---

### 1.8 Feed & posts endpoints

**Current state**: Not implemented.

- [ ] Create `Post`, `PostReaction`, `Comment` entities + repositories
- [ ] `POST /api/posts` — create post (type, temple_id, caption, media_keys[])
  - On create: async invalidate `feed:{followerId}` Redis keys for all followers via `@Async`
- [ ] `GET /api/feed` — paginated feed (cursor-based on `created_at`)
  - Posts from followed users + own posts, ordered by `created_at DESC`
  - Redis cache key: `feed:{userId}`, TTL 90 seconds
- [ ] `POST /api/posts/{id}/lamp` — toggle lamp reaction
- [ ] `GET /api/posts/{id}` — single post detail
- [ ] `POST /api/posts/{id}/comments` — add comment
- [ ] `GET /api/posts/{id}/comments` — paginated comments

---

### 1.9 Yatra groups endpoints

**Current state**: Not implemented.

- [ ] Create `YatraGroup`, `GroupMember`, `Expense`, `ExpenseSplit` entities + repositories
- [ ] `POST /api/groups` — create group (creator inserted as accepted member)
- [ ] `POST /api/groups/{id}/invites` — invite user IDs (insert as pending), send FCM notification to each
- [ ] `PATCH /api/groups/{id}/members/{userId}` — accept or decline invite
- [ ] `GET /api/groups/{id}` — group detail + member list with statuses
- [ ] `GET /api/users/{id}/groups` — groups where user is an accepted member
- [ ] `POST /api/groups/{id}/expenses` — add expense + auto-generate equal splits
- [ ] `GET /api/groups/{id}/expenses` — list expenses with per-member balance summary

---

### 1.10 Group chat — WebSocket (STOMP)

**Current state**: Not implemented. No WebSocket dependency.

- [ ] Add `spring-boot-starter-websocket` to `pom.xml`
- [ ] Create `WebSocketConfig.java` — enable STOMP, register `/ws` endpoint, `/app` prefix, `/topic` broker
- [ ] Create `ChatController.java` — `@MessageMapping("/group/{groupId}/send")` → save to PostgreSQL → broadcast to `/topic/group/{groupId}`
- [ ] `GET /api/groups/{id}/messages?before={cursor}&limit=50` — paginated message history for initial load and reconnect catch-up
- [ ] Guard: only accepted group members can subscribe/send to a group's topic
- [ ] Mobile: connect to `wss://api.templepassport.in/ws` via `@stomp/stompjs`; subscribe to `/topic/group/{groupId}`
- [ ] Test: two devices in same group send messages in real time

---

### 1.11 Push notifications — Firebase Cloud Messaging (FCM)

- [ ] Firebase Admin SDK already added in 1.2 — FCM uses the same SDK, no new dependency
- [ ] Create `NotificationService.java` — calls `FirebaseMessaging.getInstance().send(message)` with device token
- [ ] Send FCM notification on:
  - New group invite received
  - New group chat message (when user not connected via WebSocket)
  - New comment on your post
  - Someone follows you
- [ ] Test: put app in background, trigger each notification type, verify received on device

---

### 1.12 Mobile — replace all mock data with real API

- [ ] Install TanStack Query: `@tanstack/react-query`, wrap app in `QueryClientProvider`
- [ ] Create `src/api/` module with typed fetch helpers (base URL from env, attach Firebase ID token as `Authorization: Bearer`)
- [ ] Replace all `MOCK_*` imports with `useQuery` / `useMutation` hooks per screen:
  - [ ] HomeScreen → `GET /api/users/{id}/stats`
  - [ ] FeedScreen → `GET /api/feed` (infinite scroll, cursor pagination)
  - [ ] PostCommentsScreen → `GET /api/posts/{id}` + `GET /api/posts/{id}/comments`
  - [ ] SearchScreen → `GET /api/users/search?phone=` and `GET /api/users/search?name=`
  - [ ] UserProfileScreen → `GET /api/users/{id}`
  - [ ] YatraGroupScreen → `GET /api/groups/{id}` + `GET /api/groups/{id}/expenses`
  - [ ] GroupChatScreen → `GET /api/groups/{id}/messages` + WebSocket STOMP
  - [ ] YouScreen → `GET /api/users/{id}/stats` + `GET /api/users/{id}/groups`
- [ ] Configure `staleTime` per query (feed: 60s, profile: 300s, temples: 86400s)
- [ ] Handle loading and error states on all screens

---

## Phase 2 — Scale (adopt managed GCP services as needed)

Adopt each item only when the corresponding migration trigger is hit (see [architecture.md](./architecture.md#migration-triggers)).

### 2.1 Split PostgreSQL → Cloud SQL
- [ ] Create Cloud SQL for PostgreSQL instance (db-g1-small, `asia-south1`, single zone initially)
- [ ] Run Flyway migrations against Cloud SQL via Cloud SQL Proxy
- [ ] Update `SPRING_DATASOURCE_URL` to Cloud SQL private IP (via VPC connector)
- [ ] Migrate existing data: `pg_dump | psql` into Cloud SQL
- [ ] Enable automated backups + PITR (7-day retention)
- [ ] Upgrade to HA when uptime SLA is needed

### 2.2 Split Redis → Memorystore
- [ ] Create Memorystore for Redis (1GB Basic tier, `asia-south1`)
- [ ] Update `SPRING_REDIS_HOST` to Memorystore private IP
- [ ] Enable Redis pub/sub relay in Spring `MessageBrokerRegistry` for multi-instance WebSocket scaling

### 2.3 Spring Boot → Cloud Run
- [ ] Create Cloud Run service (same Docker image from Artifact Registry)
- [ ] Enable `--session-affinity` flag (required for WebSocket sticky routing)
- [ ] Set min-instances=1 to avoid cold start latency for API endpoints
- [ ] Configure VPC connector to reach Cloud SQL + Memorystore on private network
- [ ] Update GitHub Actions: replace SSH deploy with `gcloud run deploy --image=...`
- [ ] Configure autoscaling (max-instances=10, concurrency=80)
- [ ] Update Cloud DNS to point to Cloud Run URL instead of GCE static IP

### 2.4 Async jobs → Pub/Sub + Cloud Functions
- [ ] Create Pub/Sub topics: `feed-invalidation`, `push-notifications`
- [ ] Cloud Function for feed invalidation (reads followee list, DEL Redis keys)
- [ ] Cloud Function for push notification fan-out
- [ ] Update Spring Boot: swap `@Async` method bodies to Pub/Sub `publisher.publish()`

### 2.5 Messages → Firestore (if PostgreSQL messages become slow)
- [ ] Create Firestore database in `asia-south1`
- [ ] Migrate existing messages from PostgreSQL → Firestore
- [ ] Update message service to use Firestore client
- [ ] Drop PostgreSQL `messages` table

### 2.6 Image processing Cloud Function
- [ ] Cloud Function triggered on GCS `ObjectFinalized` event for `posts/*` and `users/*/avatar/*`
- [ ] Resize to `thumb/` (150px) and `medium/` (720px) variants, write back to GCS
- [ ] Update mobile to request size-specific variants via CDN URL path

### 2.7 Search → Elasticsearch on GKE (if pg_trgm becomes slow at > 500K users)
- [ ] Deploy Elasticsearch on GKE Autopilot (or evaluate Vertex AI Search)
- [ ] Sync `users` table → Elasticsearch index via Debezium CDC
- [ ] Update `GET /users/search?name=` to query Elasticsearch
- [ ] Keep phone search on PostgreSQL

### 2.8 Secrets → Secret Manager
- [ ] Migrate `.env` values to GCP Secret Manager
- [ ] Add `spring-cloud-gcp-starter-secretmanager` dependency
- [ ] Update Cloud Run service to inject secrets via Secret Manager (environment variable bindings)
- [ ] Remove `.env` file from GCE / Cloud Run

### 2.9 Infrastructure as code — Terraform
- [ ] Initialise Terraform workspace in `infra/` directory
- [ ] `infra/environments/phase1/` — GCE, Persistent Disk, GCS bucket, Cloud DNS, Cloud CDN, Firebase config
- [ ] `infra/environments/phase2/` — Cloud Run, Cloud SQL, Memorystore, Pub/Sub, Cloud Functions, Cloud Armor
- [ ] `terraform plan` matches current live state before making changes
- [ ] All future infra changes via Terraform only (no manual console changes)

### 2.10 Hardening
- [ ] Cloud Armor policy on Load Balancer: rate limit 100 req/5min per IP, OWASP managed rules
- [ ] Cloud Monitoring alerts: CPU > 80%, DB connections > 80%, 5xx rate > 1%, p95 latency > 2s
- [ ] Cloud SQL HA replica enabled
- [ ] Memorystore replica enabled
- [ ] Cloud Monitoring dashboard: req/sec, p95 latency, DB connections, cache hit rate, WebSocket connections, FCM delivery rate

---

## Done

_Items move here once merged, tested, and verified working._

- [x] Mobile screens: Home, Feed, Post Comments, User Profile, Yatra Group (mock data)
- [x] Mobile screens: Search by phone number (mock data)
- [x] Mobile screens: Group Chat, Group Invites, My Groups in YouScreen (mock data)
- [x] Architecture decision: GCP two-phase approach documented (switched from AWS)
- [x] Architecture decision: Firebase Auth replaces Cognito; FCM replaces SNS Push
- [x] Architecture decision: Cloud Storage + CDN replaces S3 + CloudFront
- [x] Architecture decision: Cloud Run replaces ECS Fargate; Memorystore replaces ElastiCache
- [x] Architecture decision: PostgreSQL + Redis + GCS + Firebase Auth + WebSocket STOMP
- [x] Backend: temple search (`GET /api/temples/search`)
- [x] Backend: temple detail (`GET /api/temples/{id}`)
- [x] Backend: check-in creation with GPS verification (`POST /api/checkins`)
- [x] Backend: user stats (`GET /api/users/{id}/stats`)
- [x] Backend: user achievements and collections
- [x] Backend: Flyway migrations V1–V15 (schema-first, ddl-auto: validate)
- [x] Backend: docker-compose with PostgreSQL
- [x] Backend: phone OTP auth (custom JWT — will be replaced by Firebase Auth in 1.2)
- [x] Backend: admin portal API (feature flags, affiliates, temples, users, admin auth with BCrypt + JWT)
- [x] Backend: AdminJwtFilter (protects /api/admin/** with 8-hour admin tokens)
- [x] Backend: temple multi-category support (V15, StringListConverter, temple_category_definitions)
- [x] Admin portal: Login, Dashboard, Users, Temples, Affiliates, Feature Flags pages (mock data + dev bypass)
- [x] Admin portal: create test users without OTP
- [x] Admin portal: temple multi-category select + custom category creation
- [x] Admin portal: feature flags grouped by category with confirmation toggle
