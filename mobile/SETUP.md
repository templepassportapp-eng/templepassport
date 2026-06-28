# Search & check-in slice — wiring it up

These files implement the first half of M1: search a temple, open it, and
check in (GPS-verified when you're close enough, self-reported otherwise).

## What's here

```
mobile/
├── App.tsx                       Navigation stack (Search → CheckIn)
└── src/
    ├── config.ts                 API base URL + dev user id
    ├── types.ts                  Temple / CheckIn types (mirror the backend)
    ├── theme.ts                  Colors + spacing
    ├── api/client.ts             searchTemples(), createCheckIn()
    ├── location/
    │   └── getCurrentPosition.ts Permission + one-shot GPS read
    ├── navigation/types.ts       Route params
    ├── components/
    │   ├── TempleListItem.tsx
    │   └── VerificationBadge.tsx
    └── screens/
        ├── SearchScreen.tsx      Debounced search against /api/temples/search
        └── CheckInScreen.tsx     GPS capture → POST /api/checkins → result
```

## Prerequisites

1. After `init`, install the deps from `mobile/README.md` (navigation, screens,
   safe-area, `react-native-geolocation-service`, `axios`).
2. **Android location permission** — add to
   `mobile/android/app/src/main/AndroidManifest.xml` inside `<manifest>`:

   ```xml
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
   ```

   (iOS: add `NSLocationWhenInUseUsageDescription` to `Info.plist`.)
3. Drop these files in (overwriting the generated `App.tsx`), then `npm start`
   and run on an Android emulator.

## Backend note

A new migration `V3__dev_user.sql` seeds a dev user whose id matches
`DEV_USER_ID` in `config.ts`, so check-ins succeed before Google OAuth exists.
Restart the backend so Flyway applies it.

## Try it

1. Search "Kedar" → tap Kedarnath Temple.
2. "Verify location & check in" — on an emulator, set the mock location near
   30.7346, 79.0669 first and it returns VERIFIED; anywhere else returns
   SELF_REPORTED. "Check in without location" is always self-reported.
