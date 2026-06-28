# ADR 002 — Firebase Authentication for phone OTP

**Status**: Accepted (replaces AWS Cognito)  
**Date**: 2026-06-28  
**Updated**: 2026-06-28 — switched from Cognito to Firebase Auth

## Context

The app's primary registration flow requires phone number verification via OTP — standard for Indian consumer apps. The current backend has a custom JWT that must be replaced with something production-ready. AWS Cognito was the original choice but is being replaced alongside the broader switch to GCP.

## Decision

Use Firebase Authentication for all auth: phone OTP, Firebase ID token issuance, and token refresh.

Spring Boot validates Firebase ID tokens using the Firebase Admin SDK (`FirebaseAuth.verifyIdToken()`). The mobile app uses `@react-native-firebase/auth` for the phone sign-in flow.

```
Mobile                          Firebase              Spring Boot
  │── initiatePhoneAuth ──────────▶ Auth
  │◀─ verificationId ─────────────  Auth
  │── confirmCode(verificationId) ─▶ Auth
  │◀─ Firebase ID Token ───────────  Auth
  │── API call (Bearer: id_token) ──────────────────────▶ FirebaseJwtFilter
  │                                                        verifyIdToken()
  │◀─ 200 + response ────────────────────────────────────  Controller
```

## Consequences

- **Positive**: Phone OTP free up to 10K verifications/month; $0.0055/SMS above that (vs AWS SNS $0.02/SMS in India — 3.6× cheaper)
- **Positive**: Firebase Admin SDK validates ID tokens locally using cached public keys — no network call per request
- **Positive**: Token refresh, revocation, and account management handled without custom code
- **Positive**: `@react-native-firebase/auth` is the most battle-tested phone auth library for React Native
- **Positive**: Same Firebase project used for FCM push notifications — one SDK, one credential
- **Negative**: Firebase stores auth state (phone, UID) separately from PostgreSQL `users` table — need to sync on first login (`firebase_uid` column links them)
- **Negative**: Firebase Admin SDK adds ~5MB to the backend JAR (acceptable)
- **Negative**: If we ever leave Firebase ecosystem, the JWT filter is the only Firebase-specific code in Spring Boot — easy to swap
