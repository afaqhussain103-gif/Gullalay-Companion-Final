# Gullalay's Companion — Claude Code Handoff

## What this is
A personal period-tracking Progressive Web App (PWA) built for Afaq's partner Gullalay (also called Lalay, Gul Jaane). It is deeply personal — blending cycle health tracking with Pashto cultural elements, romantic messages, and AI chat. Everything runs in a single `index.html` file.

---

## Repo & Deployment
- **GitHub:** `github.com/afaqhussain103-gif/Gullalay-Companion`
- **Live URL:** Netlify (auto-deploys on every GitHub push — no manual step needed)
- **Deploy flow:** Edit `index.html` → commit to GitHub → Netlify auto-deploys in ~60 seconds
- **All files at repo root** (no subfolders except icons/)

## File structure
```
Gullalay-Companion/
├── index.html          ← The entire app (1,592 lines, ~106KB)
├── manifest.json       ← PWA manifest (icons at root, NOT in icons/)
├── sw.js               ← Service worker (caches app, excludes API calls)
├── apple-touch-icon.png
├── icon-120.png
├── icon-152.png
├── icon-167.png
├── icon-180.png
├── icon-192.png
└── icon-512.png
```

---

## Tech Stack
- **React 18.2.0** via CDN (Babel standalone — no build step, no npm)
- **Single file app** — all CSS, JS, and JSX in `index.html`
- **No framework, no bundler** — just `<script type="text/babel">`
- **Google Fonts** — Playfair Display + Nunito loaded via CDN
- **AI:** Google Gemini 2.5 Flash (`gemini-2.5-flash:generateContent`)
- **Storage:** All localStorage, prefixed with `gc_` (except vault/notes/apology which use their own keys)

---

## Architecture — index.html

### Structure (top to bottom)
1. `<head>` — meta tags, Google Fonts, CSS animations + keyframes
2. CSS animations defined: `fadeUp`, `scaleIn`, `splashIn`, `flowerSpin`, `blink`, `heartbeat`, `shimmerSlide`, `floatUp`, `pulse3`
3. `<div id="root">` — React mounts here
4. `<script type="text/babel">` — entire app

### React Component Tree
```
App
├── ApologyPopup        (shows today only — 2026-02-25)
├── ApologyLetter       (full letter, shown after popup)
├── Splash              (Pashto poetry — shows every open)
├── Onboarding          (first-time setup)
└── Main UI
    ├── Header          (inline in App)
    ├── Tab content (switched by `tab` state)
    │   ├── home        → HomeTab content (inline)
    │   ├── calendar    → CalendarTab content (inline)
    │   ├── chat        → Chat + ApiKeyGuide (inline)
    │   ├── notes       → NotesTab component
    │   ├── vault       → VaultTab component
    │   └── settings    → Settings content (inline)
    └── Tab bar         (6 tabs, bottom nav)
```

### All Components/Functions
| Name | Purpose |
|------|---------|
| `useLS(key, default)` | Custom hook — localStorage state with JSON parse/stringify |
| `predict(logs)` | Cycle prediction using weighted average of past cycles |
| `ApiKeyGuide` | Step-by-step Gemini API key setup UI |
| `NotesTab` | Full notes keeper with color coding, search, 2-column layout |
| `VaultTab` | Password-protected photo vault (SHA-256 hashed password) |
| `ApologyPopup` | Today-only popup (2026-02-25) — spring pink theme |
| `ApologyLetter` | Letter cards shown after popup — spring pink theme |
| `Splash` | Pashto poetry splash screen — shows every open, tap to dismiss |
| `LoveCard` | Rotating love message on home, mood-aware |
| `useToast` | Toast notification system |
| `App` | Root component — all state lives here |

---

## State & localStorage Keys

### In App component (all via `useLS`)
| Key | Default | What |
|-----|---------|------|
| `gc_theme` | `'blossom'` | Active theme name |
| `gc_name` | `''` | Her name (onboarding) |
| `gc_periodLogs` | `{}` | `{ 'YYYY-MM-DD': true }` — period days |
| `gc_moodLogs` | `{}` | `{ 'YYYY-MM-DD': ['Happy','Calm'] }` |
| `gc_symptomLogs` | `{}` | `{ 'YYYY-MM-DD': ['Cramps'] }` |
| `gc_chatHistory` | `[]` | `[{role,content,ts}]` — last 100 msgs |
| `gc_geminiKey` | `''` | Gemini API key |
| `gc_onboarded` | `false` | Has seen onboarding |

### In components
| Key | Component | What |
|-----|-----------|------|
| `keeper_notes` | NotesTab | `[{id,title,body,color,createdAt,updatedAt}]` |
| `vault_hash` | VaultTab | SHA-256 hash of vault password |
| `vault_photos` | VaultTab | `[{id,src,name,addedAt,caption}]` (base64) |
| `gc_apology_seen` | App | Date string — prevents re-showing apology |

---

## Themes — 24 total

**Light themes:** blossom, sunset, ocean, snap, lavender, rosegold, matcha, blush, peach, coral, mint

**Dark themes:** midnight, galaxy, neon, cherry, gold, wine, arctic, ember, sakura, dusk, hotpink, thunder, sapphire

Each theme object has:
```js
{
  name: 'Blossom',
  icon: '🌸',
  dark: false,
  bg: 'linear-gradient(...)',   // page background
  card: 'rgba(...)',            // card background
  cardBorder: 'rgba(...)',      // card border
  primary: '#...',              // main accent color
  secondary: '#...',            // secondary accent
  text: '#...',                 // main text
  textSec: '#...',              // secondary text
  accent: '#...',               // highlight
  nav: 'rgba(...)',             // bottom nav bg
  navBorder: 'rgba(...)',
  tabActive: '#...',            // active tab color
  tabInactive: '#...',
  shadow: 'rgba(...)',
  glow: 'rgba(...)',
  periodDay: '#...',            // calendar period color
  fertileDay: '#...',           // calendar fertile window
  ovulationDay: '#...',         // calendar ovulation
  userBubble: 'linear-gradient(...)',  // chat bubble (user)
  aiBubble: 'rgba(...)',        // chat bubble (AI)
  hFont: "'Playfair Display', Georgia, serif",  // heading font
}
```

---

## Tab Bar — 6 tabs
```
Home 🏠 | Track 📅 | Wyar 💬 | Notes 📝 | Vault 🔐 | More ⚙️
```
State: `const [tab, setTab] = useState('home')`

---

## AI Chat — Wyar (Gemini 2.5 Flash)

**Endpoint:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={geminiKey}
```

**System prompt includes:**
- Her name, current cycle day, predicted next period
- Last 5 mood logs + symptom logs
- Instructions to be warm, caring, use nicknames occasionally

**Settings:**
- `temperature: 0.9`
- `maxOutputTokens: 500`
- Last 20 messages sent to API for context
- Full history (100 msgs) stored in localStorage

**API key setup:** User gets free key from `aistudio.google.com/apikey` — stored in `gc_geminiKey`

---

## Pashto Poetry Splash

- Shows **every time** the app opens (before main UI)
- Tap anywhere to dismiss
- 32 authentic lines from real poets: Rahman Baba, Ghani Khan, Hamza Baba, Fahad Zeb
- All addressed TO her using `ta/sta/janana`
- Format: `{ ps: "Roman Pashto line", en: "English translation", poet: "Poet Name" }`
- Selected randomly with `useMemo` (one per render)

---

## Love Messages System

Three arrays of mood-matched messages:
- `LOVE_EN` — 30 general romantic messages
- `LOVE_SAD` — 8 comforting messages (for sad/emotional/anxious/tired moods)
- `LOVE_PAIN` — 7 gentle messages (for nauseous/irritated moods)

`LoveCard` on home screen picks array based on her logged mood today.
Refresh button cycles to next message. Signed `— Afaq`.

---

## Nicknames
```js
const NICKNAMES = ["Gul Jaane","Lalay","Gudai","Zargo","Momal","Zama khesta Bachai","Ghate mekhe","Gul"]
```
`nick()` returns a random nickname. Used in post-save messages and AI system prompt.

---

## Post-Save Messages
After logging a period day: bilingual toast message using `nick()`, signed `— Afaq`.
12 messages in `SAVE_MESSAGES_FN` array (functions so they call `nick()` fresh each time).

---

## Apology Feature (Temporary — 2026-02-25 only)

**Logic:**
```js
const APOLOGY_DATE = '2026-02-25';
const [showApologyPopup, setShowApologyPopup] = useState(
  () => todayStr === APOLOGY_DATE && localStorage.getItem('gc_apology_seen') !== APOLOGY_DATE
);
```

**Render order:** Apology letter → Apology popup → Splash → Main app
(Letter and popup block Splash and main app while showing)

**Theme:** Soft spring pink — `#fff5f8` background, `#C2185B` / `#E91E8C` accents, white cards.

**Content:** Afaq's apology in 5 cards — English + Roman Pashto mixed. Signed `— Afaq 💙`.

After either reading or skipping → `gc_apology_seen` = today's date → never shows again.

---

## Notes Keeper (NotesTab)

- Color-coded notes (7 colors: default, pink, purple, blue, green, yellow, orange)
- 2-column masonry layout
- Search across title + body
- Edit inline — tap any note to open editor
- Timestamps on every note (createdAt + updatedAt)
- Delete with confirm dialog
- Data: `keeper_notes` in localStorage

---

## Photo Vault (VaultTab)

- Password setup on first use (min 4 chars, confirmed)
- Password hashed with SHA-256 + salt (`'gullalay_vault_2024'`) — never stored plain
- Lock screen shows photo count
- Photo grid: 3 columns, tap to view full screen
- Full-screen viewer: caption input + date added + delete
- "Forgot password" → confirm → wipe all photos + reset
- "Change password" → re-setup flow
- Data: `vault_hash` + `vault_photos` in localStorage (photos stored as base64 data URLs)

---

## Cycle Prediction Logic (`predict` function)

```js
function predict(logs) {
  // logs = { 'YYYY-MM-DD': true }
  // Groups consecutive days into period "runs"
  // Calculates cycle lengths between run start dates
  // Weighted average (recent cycles weighted more)
  // Returns: { nextPeriod: Date, fertile: {start,end}, ovulation: Date, avg: number, cycles: [] }
}
```

---

## Calendar

- Month grid view
- Period days: logged by user (tap to toggle)
- Predicted days: shown in lighter shade
- Fertile window + ovulation shown
- Tap any day → log mood + symptoms for that day
- Moods: Happy 😊, Calm 😌, Sad 😢, Anxious 😰, Tired 😴, Irritated 😤, Emotional 🥺, Nauseous 🤢
- Symptoms: Cramps, Bloating, Headache, Back Pain, Breast Tenderness, Spotting, Heavy Flow, Light Flow, Fatigue, Mood Swings

---

## Service Worker (sw.js)

Caches: `/`, `/index.html`, `/manifest.json`, all icon files at root.

Does NOT cache:
- `generativelanguage.googleapis.com` (Gemini API)
- `api.anthropic.com`
- `fonts.googleapis.com`
- `fonts.gstatic.com`
- `cdnjs.cloudflare.com`

Cache name: `gullalay-companion-v3`

---

## Manifest (manifest.json)

Icons at **root level** (NOT in `icons/` subfolder — this was fixed after initial deploy issues):
```json
{ "src": "icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" }
```

---

## Known Issues / History

- **Icon paths** — manifest was originally pointing to `icons/icon-192.png` (subfolder). Fixed to root-level paths.
- **Gemini model** — `gemini-1.5-flash` was deprecated. Updated to `gemini-2.5-flash`.
- **Notch cutout** — iPhone 14 notch was cutting header. Fixed: safe-area fallback increased from `12px` to `44px`.
- **Netlify 404** — happened because files were in a subfolder. Fixed by setting Publish directory or moving to root.
- **AI name** — was "Layla", renamed to "Wyar" everywhere (tab label, welcome message, system prompt, API guide).

---

## Design Principles

1. **No build step** — everything must work as a single HTML file dropped into a browser
2. **Privacy first** — all data stays on device, no server
3. **Culturally authentic** — Pashto content uses real poetry from real poets, Roman script, correct grammar
4. **Mood-aware** — UI responds to her logged mood (love messages, AI tone)
5. **Romantic but functional** — not just a tracker, a companion
6. **iPhone-first** — safe area insets, standalone PWA mode, tap targets sized for mobile

---

## What Afaq may want to change next

- More Pashto content / poetry
- Additional themes
- Improvements to AI chat personality
- Vault enhancements
- Calendar improvements
- Anything UI/UX on specific tabs

When making changes: **edit `index.html` only** (plus `sw.js` if caching changes, `manifest.json` if PWA config changes). Commit to GitHub → Netlify auto-deploys.
