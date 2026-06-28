# Handoff: Temple Passport — MVP Screens + Milestone Map

## Overview
Temple Passport is a pilgrimage companion: discover sacred sites across India, verify visits on
location, and collect them as **stamps in a digital passport**, with planning help and tasteful,
context-aware monetization (affiliate products, stay/travel booking) and a group-yatra expense
splitter layered on top.

This package covers the **Phase-0 MVP core loop** plus key Phase-1 screens and a 3D milestone map:

- Onboarding → Discovery (map / detail / search) → **Location-verified check-in → stamp reveal → passport**
- Postcards, home feed ("Light a lamp"), trip planner
- Booking (stay / journey), group yatra + split expenses
- Yatra statistics dashboard
- **My Journey timeline** — chronological yatra log; on-location check-ins are auto-added with a Verified seal, plus manual add (temple + check-in date)
- A 3D raised-relief **India milestone map** that plants a waving tricolor flag per completed milestone

Design language is **"Sindoor & Gold"** — deep maroon, vermilion, saffron, gold, cream, with
line-art temple glyphs and shape-coded passport stamps.

---

## About the Design Files
The files in this bundle (`*.dc.html`) are **design references created in HTML** — prototypes that
show the intended look, layout, copy, and motion. **They are not production code to copy directly.**

The target app is **React Native (Android-first, iOS later)** per the product spec. The task is to
**recreate these designs in the React Native codebase using its established patterns and libraries**
(navigation, styling system, SVG, animation). Where the codebase already has primitives (buttons,
list rows, sheets), use those and apply the visual tokens below. If a given primitive doesn't exist
yet, build it to match these specs.

Mock data in the prototypes (e.g. "4 / 12 Jyotirlingas", sample postcards, sample hotels) is
illustrative only — real data comes from the **Spring Boot + PostgreSQL/PostGIS** backend described
in the product spec (`temple`, `visit`, `affiliate_product`, etc.).

## Fidelity
**High-fidelity.** Final colors, typography, spacing, copy, and interactions are intended to be
matched closely. Recreate the UI pixel-faithfully using the codebase's libraries.

---

## Design Tokens

### Color
| Token | Hex | Use |
|---|---|---|
| `cream` | `#FBF4E6` | Primary screen background, surfaces |
| `cream-2` | `#F4EAD8` | Secondary background (feed, booking, stats, group) |
| `maroon` | `#6B1A2C` | Primary brand / buttons / headers / bottom nav active |
| `maroon-deep` | `#7A1F2B` | Avatars, hero illustration bg, deep stamps |
| `ink` | `#4A1220` | Primary heading text (on cream) |
| `vermilion` | `#C5341C` | Sindoor accent, primary action ("Light your stamp"), active chips |
| `vermilion-hi` | `#D14122` | Top of vermilion button gradient |
| `saffron` | `#E89B2C` | Saffron accent, flame fill |
| `gold` | `#C49A3A` | Gold stamps, progress fill (paired with `gold-light`) |
| `gold-light` | `#E8C46A` | Gold highlights, numbers on maroon, ribbons |
| `brown` | `#6B4A3A` / `#5A3A2E` | Body text on cream |
| `muted` | `#9A5A2A` | Captions, uppercase labels, placeholder hints |
| `green` | `#1F8A5B` | Success / "you're here" / owed balances / rating chip |
| `green-deep` | `#1F5E4A` | Vaishnava accent, member avatar |
| Stamp inks | `#C5341C` `#C49A3A` `#7A1F2B` `#E89B2C` | Per-temple stamp color (data-driven) |

**Indian flag (milestone map):** saffron `#FF9933`, white `#FFFFFF`, green `#138808`, Ashoka chakra navy `#122B7A`.
**Terrain (relief map):** ridge/mountain brown `#7A4A22`, river blue `#36647D`, extrusion slab `rgb(122,76,42)` (top) → `rgb(48,28,14)` (bottom).

Translucent tints used throughout: `rgba(74,18,32,0.06–0.16)` for subtle fills/borders on cream.

### Typography
Two Google fonts. In RN, bundle these (e.g. `@expo-google-fonts/marcellus`, `.../mukta`) or add the TTFs.
- **Marcellus** (400 only) — display: temple names, screen titles, big numbers, button labels, stamp text. Classical inscriptional feel.
- **Mukta** (300/400/500/600/700) — body & UI: paragraphs, labels, captions, chips. Devanagari-capable (needed for Hindi + regional names).
- **monospace** (system) — only for placeholder/slot captions in mocks ("hypsometric map of India", "product"). Not for shipping copy.

Scale (px): status bar 13 · screen title 22–30 · big number 26–30 · section header 16 · body 13–15 · chip/caption 11–12.5 · micro 9–11 · stamp microtype 5–8. Headings use Marcellus; everything else Mukta. Letter-spacing: uppercase labels ~0.10–0.22em; Marcellus titles ~0.02–0.05em.

### Radius
Phone card `36`; sheets `26` (top corners); cards `14–18`; buttons `13–16`; chips/pills `20–30`; small tags/tiles `6–12`; circular avatars/rings `50%`.

### Shadow
- Phone card: `0 18px 50px rgba(74,18,32,0.20)`
- Content card: `0 6px 16–18px rgba(74,18,32,0.07–0.08)`
- FAB / search pill / bottom sheet: `0 6px 18px rgba(74,18,32,0.16–0.22)` (sheet uses `0 -10px 30px`)
- Sticky CTA fade: gradient `transparent → cream` over the bottom ~22%.

### Spacing
Screen horizontal padding `20–26`. Vertical rhythm: section gaps `14–20`, list/grid gaps `8–18`. Tap targets ≥ 44px. Status bar row `~38` tall.

### Signature elements
- **Shape-coded stamp** — category encodes the stamp outline: **circle = Jyotirlinga**, **oval = Shakti Peeth**, **rectangle = Char Dham**, **hexagon = Vishnu** (`clip-path: polygon(50% 0,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)`). New categories get a new shape. Build a single `Stamp` component parameterized by `{ shape, color, glyph, name, date, state: earned|empty }`. Stamp anatomy: outer solid ring (2–3px) + inner dashed ring (1px, opacity ~0.5) + line-art temple glyph + tiny category caption + name (Marcellus) + date.
- **Temple line-art glyph** — a simple shikhara icon, stroke = `currentColor`:
  `<svg viewBox="0 0 64 64" fill="none" stroke-width="2.4" stroke-linejoin="round"><line x1="32" y1="6" x2="32" y2="12"/><circle cx="32" cy="15" r="2.6"/><path d="M32 18 L45 46 L19 46 Z"/><rect x="15" y="46" width="34" height="7"/><path d="M28 53 L28 38 L36 38 L36 53"/></svg>`
  This is a **placeholder** — replace with the real per-temple line-art illustrations in production.
- **"Light a lamp" flame** (replaces a generic like): diya = gold ellipse base + saffron/vermilion teardrop flame. SVG: `<ellipse cx=12 cy=19.5 rx=7 ry=2.4 fill="#C49A3A"/><path d="M12 4 C 15.5 9.5,16 13,12 16 C 8 13,8.5 9.5,12 4 Z" fill="#E89B2C"/>`
- **Waving flag** (milestone map): tricolor cloth on a gold pole, `transform-origin:left center`, animated with a skew + clip-path flutter keyframe (see "Milestone map" below).

---

## Screens / Views

### Account — sign-up, profile & language (auth flow, TP-FND-01/03/XCC-02)
- **Language selection:** title "Choose your language"; scrollable list of options as rows showing the **native script** (Marcellus) + Latin name (Mukta) with a radio on the right; selected row = 2px maroon border + filled check. Default English; Hindi guaranteed; architecture ready for regional languages (Marathi, Gujarati, Tamil, Telugu, Kannada, Bengali shown). "Continue" CTA.
- **Sign-up · mobile number:** brand glyph; "Enter your mobile number"; **`+91` country box + number field** (mobile is the primary identity); primary "Get OTP"; "or" divider; secondary "Continue with Google"; Terms/Privacy note. Phone is PII — store hashed/encrypted per spec.
- **OTP verification:** "Verify your number" + masked number with "Edit"; **6 single-digit boxes** (filled have value, active has caret + vermilion border, empty are muted); "Resend in 0:24" timer; "Verify & continue"; "Keep me signed in" (secure token in Android Keystore-backed storage). On success → profile setup (first run) or app.
- **Profile setup & edit:** "Set up your passport"; **circular avatar uploader** with camera badge (photo); fields **Full name**, **Date of birth** (calendar icon), **City** (location icon). Same screen serves first-run setup and later profile edits. "Save & continue". (Interests are picked separately in Onboarding 04.)

### Home & social feed
- **Home:** personalized landing. Greeting + avatar + notification bell; maroon **progress card** (Jyotirlinga ring 4/12 + "Next: Bhimashankar"); vermilion **"Check in & light a stamp"** CTA; **Near you** horizontal temple cards; a **Today / auspicious** panchang card; a **From your sangha** activity teaser; bottom tab bar (Home active).
- **Feed (Sangha):** header + compose (+); top **composer** row (avatar + "Share your darshan…" + camera → post a check-in with photo); post cards = author + **✓ checked-in** chip + temple + time, photo, caption, action row (**Light a diya** with count, comment count, share), and an inline comment preview + "View all N comments". Bottom tab bar (Feed active).
- **Post detail · comments:** full post (author, photo, caption, verified check-in), action row with primary **"Light a diya"**; **comment thread** (avatar, name, text, time, Reply, per-comment Light reaction); sticky **comment composer** (avatar + input + send). The diya is the brand's reaction primitive (one per user per item); comments + photos are user-generated — route through moderation before public display (TP-ADM-04).

> All screens are clean phone frames (no device bezel), `390 × 844` design size, cream background,
> with a minimal status bar row (time left, battery glyph right). Recreate at the device's logical
> width; values below scale proportionally.

### Onboarding (4 screens)
- **Purpose:** explain discover → verify → collect; request location permission *contextually* (not here); optional interest pick.
- **Layout:** centered illustration block, headline (Marcellus 30) + subhead (Mukta 15, `#6B4A3A`), bottom row = 4 progress dots (active dot is a 22×6 maroon pill) + "Next" pill button (maroon, radius 30) + centered "Skip".
- **01 Discover:** wordmark `तीर्थ · TEMPLE PASSPORT`; hypsometric India map placeholder (dashed border, diagonal-stripe fill, monospace caption) with category-colored marker dots. Copy: "Discover sacred sites across India".
- **02 Verify:** 750 m radius ring + center Jyotirlinga stamp + a maroon teardrop location pin. Copy: "Visit, then verify on location".
- **03 Collect:** three fanned circular stamps (rotated ∓13°). Copy: "Collect them in your passport".
- **04 Interests:** 2×2 selectable cards — **Shaiva** (selected: 2px maroon border + check), Vaishnava, Devi · Shakti, General — each with a simple glyph + label + sublabel. CTA "Begin your yatra" (maroon, radius 16).

### Passport home — 3 directions (pick one)
The namesake screen, presented as three concepts to choose from:
- **A — Passport book:** aged cream page, double-rule masthead "MY YATRA PASSPORT / Bearer · …", maroon progress ribbon "JYOTIRLINGAS 4/12", 3-col grid of stamps (earned = inked circular stamp; unearned = dashed empty circle with faint glyph) + name caption, "— 1 —" page footer.
- **B — Modern collection:** maroon hero with a **progress ring** (SVG, gold arc over faint track, "4 / of 12" centered) + title "Jyotirlinga Yatra" + "Next: Bhimashankar · 1.2 km" pill; set tabs (Jyotirlinga active / Char Dham / Shakti Peeth); same stamp grid; **bottom tab bar** (Home, Map, Passport[active], Feed, You).
- **C — Pilgrimage trail:** progress bar + vertical timeline; each visited temple is a small circular stamp node connected by a dotted gold line, with name/place/"Lamp lit · date"; ghost "Up next" node; CTA "Continue the yatra".
- **Recommendation:** B is the most reusable app shell (has the nav bar + ring). Confirm choice, then this style propagates to other tabs.

### Map view (Discovery)
- **Purpose:** spatial discovery (TP-CAT-04).
- **Layout:** full-bleed hypsometric map; floating search pill + filter FAB (top); legend chip (Visited = gold dot / To visit = outline dot); "near me" FAB (bottom-right); bottom **preview sheet** (drag handle, mini stamp, name, "Jyotirlinga · Maharashtra", "1.2 km away · trek required", "View" button).
- **Markers are shape-coded** by category (gold-filled = visited, cream+outline = unvisited). In production, fetch viewport temples via PostGIS `ST_DWithin`/bbox and cluster at low zoom.

### Temple detail
- **Purpose:** primary info surface + prime monetization surface.
- **Layout (scrolling, height grows beyond 844; sticky CTA pinned bottom):**
  - Hero (~206 tall): striped maroon panel + large line-art glyph; back button (top-left), **category badge** top-right (circular outline ring = Jyotirlinga, gold).
  - Title "Bhimashankar" (Marcellus 28) + "Lord Shiva · …, Maharashtra".
  - Attribute chips: `Jyotirlinga` (vermilion-tint), `trek required`, `forest`, `riverside`.
  - Description (Mukta 13).
  - Practical info rows (label left muted / value right bold): Hours, Dress code, Best season, Nearest town.
  - **Trek advisory** callout (saffron left-border, `rgba(232,155,44,0.12)` bg).
  - **Booking CTAs:** "Book your stay" (maroon, with "from ₹650 / night") + "Book your journey" (outline) → see Booking. Small affiliate note under.
  - **Yatra Essentials** (affiliate, 3 horizontal product cards: image placeholder, title, "View on Amazon ›") + **mandatory affiliate disclosure** line (must remain visible).
  - Sticky bottom bar: secondary location icon + primary "Check in to light your stamp" (maroon).

### Search & filter
- Search field (with clear ×) showing query "kedar"; horizontal filter chips (active "Jyotirlinga ×" vermilion, "Deity ▾", "State ▾", "Sort: Distance"); result rows = mini glyph + name (Marcellus) + alternate/transliterated names (e.g. `केदारनाथ`) + state + right-aligned distance + category tag. Demonstrates transliteration-aware search.

### Check-in loop (the core hook)
- **Out of range:** temple name; 750 m radius ring with a faint center stamp + a "You" pin **outside** the ring; headline "A little closer"; "You're 1.2 km away…"; **disabled** "Check in" (muted maroon); "accuracy ±8 m · verified on our servers".
- **In range:** green pulsing ring (animated, opacity/scale), full-color center stamp, "You" dot **inside**; primary **"Light your stamp"** button = vermilion gradient with flame icon + green-glow shadow; "±8 m · 120 m inside the 750 m radius ✓". *Server still validates `ST_DWithin` — client state is optimistic only.*
- **Stamp reveal (celebration):** dark maroon backdrop (`#3A0E18`) + gold ray burst (`repeating-conic-gradient`) + radial saffron glow; large gold medallion stamp (animated glow pulse) with maroon ring, glyph, "Bhimashankar", date; "Your fifth lamp is lit / 5 of 12 Jyotirlingas"; primary "Create a postcard" (cream button) + "Add to passport".

### Postcard create / share
- **Create:** live postcard canvas (maroon frame, photo placeholder, corner glyph, "Bhimashankar / 27 JUNE 2026 · MAHARASHTRA", "@templepassport" watermark); note textarea (with caret); frame-color swatches (maroon[selected]/vermilion/gold/green); bottom "Add photo" + "Save & share".
- **Share:** dark backdrop, finished 4:5 postcard (cream, double-gold border, photo placeholder, glyph, name/date, watermark); "Sized 4:5 for Instagram & WhatsApp Status"; bottom sheet share targets (WhatsApp, Instagram, Status, More) + "Save to gallery".

### Home feed ("Light a lamp")
- Sticky header "Yatra" + avatar. Feed cards: avatar (colored initials) + "**Name** lit a stamp" + temple·place + time; postcard image (striped placeholder + faint glyph + "<Temple> postcard"); note; **Light-a-lamp** pill (flame icon + count, vermilion-tint) + "Light a lamp" label. One **curated** maroon card "Prepare for your next yatra / Kedarnath opens in 14 days" (single, tasteful). Feed is scrollable; mock shows 2 cards + curated.

### Yatra trip planner
- "Maharashtra Jyotirlinga Yatra · 3 temples · 4 days · dates"; route-map placeholder with colored stop dots; ordered stop rows (numbered maroon circle + name + place·tag + drag-handle dots) with leg distance under; "Add a temple" dashed row.
- Bottom: **"Book your stay near Bhimashankar"** booking card (maroon + gold bed icon + "12 stays from ₹650"); a **Group of 4 / Split expenses** entry (overlapping avatars) + compact "Checklist · 6".

### Booking — stay & journey (affiliate, TP-MON-03)
- **Stay near Mahakal:** header with temple context; hotel cards (photo placeholder, name, distance-to-temple, green rating chip with star, "from ₹X / night", "View on <merchant>" vermilion button); affiliate disclosure footer.
- **Book your journey:** From→To selector (Mumbai ⇄ Ujjain); mode chips (Train[active]/Flight/Cab); option cards (mode label, name, times, duration, "from ₹X", "View on <merchant>"); affiliate disclosure.
- All affiliate taps must route through a backend redirect (`/go/{productId}?ctx=…`) that injects the associate tag server-side and logs the click; deep-link into merchant app if installed.

### Group yatra · split expenses
- Maroon header: group name + member avatars (colored initials) + dashed "Invite".
- Balance summary card (overlapping the header): "Overall, you are owed **₹3,350**" (green Marcellus) + per-person lines (owed = green, you-owe = vermilion).
- "Shared expenses" list: payer avatar + title + "Who paid · split N ways" + amount.
- Bottom: "Add expense" (maroon) + "Settle up" (green outline).

### My Journey — timeline (TP-JRNY-01/02/03)
A chronological record of the pilgrim's yatra. The core distinction: visits the user **checked in to on location** are added **automatically** and carry a **Verified** seal (GPS-confirmed at the temple); visits the user **adds by hand** (a past trip logged after the fact) stay **unverified** until their next on-location visit.

- **Journey timeline (`30-journey-timeline.png`):** header "My Journey" + summary "5 temples · 4 verified · 1 added by you", a `+` button (top-right) and a small **legend** (Verified check-in / Added by you). Below, a vertical **dashed-gold spine** with entries grouped by **year divider** (2026, 2025…), newest first. Each entry = a **temple medallion node** on the spine + a card (temple name in Marcellus, "region · Jyotirlinga", date).
  - **Verified entry:** gold radial medallion (Jyotirlinga glyph) with a **green ✓ badge** bottom-right; card has a green pill **"Verified · lit on location ±8m"**.
  - **Manual entry:** **dashed** bronze medallion (no badge) + dashed card border; bronze pill **"Added by you · verify on next visit"**.
  - A bottom **fade + floating maroon "+ Add to journey"** button.
- **Add to journey (`31-add-to-journey.png`):** sheet titled "Add to journey". **Select temple** field (tappable row with medallion + name + region + chevron) → opens the picker. **Check-in date** field (calendar icon + date + "Change") with an inline **mini month calendar** (selected day = maroon filled circle). A gold **info card** with a verified-seal icon explains: check in *on location* → auto-added + Verified; manual entries stay unverified until the next visit. Primary **"Add to journey"**.
- **Select temple (`32-select-temple.png`):** "Select temple" picker with a search field ("Search 12 Jyotirlingas…") and a scrollable radio list. Selected row = 2px maroon border + filled check. Temples **already in the journey** show their state inline instead of a radio (e.g. green ✓ medallion + **"Already in journey · verified"**) so a temple can't be double-added. Primary **"Choose {temple}"**.

**Behavior / data:** each journey entry = `{ templeId, date, source: 'checkin' | 'manual', verified: bool, geo? }`. `source:'checkin'` entries are created by the existing check-in loop (in-range → light stamp) and are always `verified:true` with the GPS fix; `source:'manual'` entries are `verified:false`. A later on-location check-in at a manually-added temple should **upgrade** that entry to verified (don't create a duplicate — match on `templeId`). Timeline sorts by `date` desc, grouped by year. Summary counts derive from the list.

### Yatra statistics
- Maroon header: profile (avatar, name, "Pilgrim since … · Shaiva path") + 3 big stats (temples visited / sets in progress / states covered, divider rules).
- **Diya tiles:** "Diyas you've lit" (86) + "Diyas received" (142), each with a flame icon; plus "km travelled" + "postcards made".
- **Collection by set:** rows with the **shape-coded** category badge (circle/rect/oval/hexagon outline in the set color) + label + "count / total" + progress bar in the set color.
- Milestone card: "3 more for the 10-temple badge" with a star icon.

### Milestone map (3D relief) — `India Milestone Map.dc.html`
- **Purpose:** celebratory milestone view — a stylized 3D raised-relief India that plants a **waving flag** on each completed milestone.
- **Construction (for RN, rebuild with `react-native-svg` + Reanimated):**
  - India silhouette = one polygon (see the `clip-path`/`<polygon>` in the file; ~31 points). **This is a recognizable stylized outline, not survey-accurate** — for production, prefer a real relief/DEM raster behind the flags, or a true map SDK for the actual discovery map.
  - **3D extrusion:** ~16 stacked copies of the silhouette, each translated down 1px, shading from `rgb(122,76,42)` → `rgb(48,28,14)`, behind a top surface — fakes a molded slab. Plus a blurred radial ground shadow.
  - **Terrain:** top surface = latitudinal hypsometric gradient (brown Himalaya → green plains → tan Deccan); snow gradient on the north edge; hillshade (light top-left, shadow bottom-right). Ridges (Himalaya arc, Western/Eastern Ghats, Aravalli) and rivers (Ganga, Yamuna, Brahmaputra, Narmada, Godavari, Krishna) are SVG strokes clipped to the silhouette.
  - **Markers:** 12 Jyotirlinga points by `%` coordinate. Completed → waving tricolor flag on a gold pole (chakra `repeating-conic-gradient` of 24 spokes on the large flag); pending → hollow teardrop pin. Optional name labels.
  - **Waving animation** (decorative, infinite): `@keyframes` toggling `transform: skewY(±2deg)` + a `clip-path` polygon flutter on the cloth, `transform-origin:left center`. In RN, drive with Reanimated `withRepeat(withTiming(...))` on a skew + a small horizontal scale.
- **Tweakable props:** `showLabels` (boolean), `flagStyle` ("National tricolor" | "Saffron pennant").

---

## Interactions & Behavior
- **Navigation:** Onboarding → Home (passport). Bottom tabs: Home, Map, Passport, Feed, You. Map marker → preview sheet → Temple detail. Detail "Check in" → in-range/out-of-range state → reveal → postcard/passport.
- **Location-verified check-in:** capture device coords + accuracy + timestamp; **send to server**, which validates `ST_DWithin(geom, point, COALESCE(verification_radius, 750))`. UI shows distance-remaining on failure ("You need to be closer…"), success animation on pass. One unique visit per (user, temple) for MVP. Never trust a client-side pass.
- **Stamp reveal:** play the glow/ray animation once on successful check-in; then route to postcard create or passport.
- **Light a lamp:** tap = flame animation, increment count, once per item; optional notification to recipient.
- **Affiliate taps:** always via backend redirect/tracking; show disclosure wherever links appear.
- **Animations/easing:** ring pulse ~2.4s ease-in-out; reveal glow ~2.6s; flag wave 1.5–2.2s ease-in-out; progress bars animate width on mount. Keep subtle; never animate over the sacred reveal except the intended glow.
- **Empty/error states:** passport empty state encourages first visit; out-of-range is a friendly refusal with distance; offline check-in (P1) queues locally and finalizes on sync (server re-validates).

## State Management
- **Auth/session:** phone+OTP (primary) / Google (secondary); persisted secure token; `user { id, phone, display_name, avatar_url, locale, interests[] }`.
- **Catalog:** `temple { id, name, alt_names[], deity, category, geom(lat,lng), address, state, description, illustration, tags[], verification_radius?, hours, dress_code, best_season, how_to_reach, nearest_town }`. Category ↔ stamp shape 1:1.
- **Passport:** `visit { user_id, temple_id, checked_in_at, lat, lng, accuracy_m, verification_method }`; derived set-progress (e.g. 4/12 Jyotirlingas), milestones, stamp records, postcards.
- **Map:** viewport bbox query state; visited vs unvisited marker sets; "near me" toggle (location permission).
- **Monetization:** `affiliate_product { id, title, image_url, merchant, category, applicable_tags[], affiliate_url, commission_rate, active }`; resolved by tag-join with the temple's tags (rank by commission × relevance, cap 3–5). Booking uses the same redirect/tracking; `affiliate_click` log.
- **Group:** group, members, `expense { payer, title, amount, split }`, derived balances.
- **Data fetching:** viewport-bounded + paginated lists; graceful degradation without location/network; low-bandwidth-optimized images.

## Assets
- **Fonts:** Marcellus (display), Mukta (body) — Google Fonts; bundle in the app.
- **Temple illustrations:** the line-art shikhara glyph in these mocks is a **placeholder**. Production needs real per-temple line-art (one primary illustration per temple record).
- **Maps:** mocks use striped hypsometric placeholders. Production: real map SDK for discovery (TP-CAT-04) and a real relief raster (optional) behind the milestone flags.
- **Icons:** all UI icons are simple CSS/SVG primitives (rings, teardrops, bars) — map to your icon system.
- **No third-party brand logos** beyond generic merchant-name CTAs; wire to real associate links server-side.

## Files
- `screens/` — **PNG screenshots of every screen** (01–25 app screens, 22–25 Account flow, 27–29 Home/Feed/Comments, **30–32 My Journey timeline**) plus `26-milestone-map.png` (the 3D relief map). Filenames match the screen names in this README; the small uppercase caption above each phone is that screen's label.
- `Temple Passport — Screens.dc.html` — all app screens (onboarding, passport ×3, discovery, check-in loop, postcards, feed, trip planner, booking, group, statistics, **My Journey timeline**) laid out on one canvas. Open in a browser to view; it is the visual reference, not shippable code.
- `India Milestone Map.dc.html` — the 3D relief milestone map with waving flags (tweakable: `showLabels`, `flagStyle`).

> Note: the `.dc.html` files are authored prototypes that render via an internal runtime; treat the
> rendered appearance + this README as the spec. If you want flat, openable copies (standalone HTML
> or PNG/PDF of each screen), ask and they can be exported.
