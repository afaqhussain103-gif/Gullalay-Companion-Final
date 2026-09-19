# Gullalay — handoff

A personal cycle-tracking PWA Afaq built for his partner Gullalay.
Private, offline-first, no server, no accounts.

> Read `DATA_CONTRACT.md` before touching storage. All her data lives in
> localStorage on one phone. There is no backup but the one she exports.

---

## Repo & deployment

- **Repo:** `github.com/afaqhussain103-gif/Gullalay-Companion-Final`  ← this one
- **Live:** https://gullalay.netlify.app
- **Deploy:** Netlify auto-builds on push to `main`. There is no build step —
  the files are served exactly as they are in the repo.

There is a second repo, `Gullalay-Companion`, which is **abandoned** (last real
commit 2026-02-23) and **not deployed**. An earlier version of this document
claimed it was the deploy source. It was wrong. Verified 2026-09-19 by diffing
the live HTML against both repos.

## Files

```
index.html     the whole app — markup, CSS design system, and logic
vendor.js      preact + preact/hooks + htm, vendored (16 KB)
sw.js          service worker, cache-name bump invalidates old builds
manifest.json  PWA manifest
icon-*.png     app icons incl. maskable variants
DATA_CONTRACT.md  storage keys and invariants — READ THIS
```

## Stack

**Preact + htm, no build step.** htm uses tagged template literals, which the
browser parses natively — there is no JSX and nothing to compile at runtime.

It previously ran React + Babel-standalone from a CDN, compiling 107 KB of JSX
in the browser on every launch: **2.9 MB of JavaScript (637 KB gzip) before
first paint**. That is now 16.6 KB raw / 6.7 KB gzip, served from the same
origin. That single change is most of why the app feels fast.

Libraries are vendored rather than loaded from a CDN, so the app has zero
third-party requests and works fully offline.

### Editing

Edit `index.html` directly — it is plain JS, no toolchain. To test locally you
need any static server (the app uses fetch + service worker, so `file://`
will not work).

To update the vendored libraries, re-download the UMD builds of
`preact`, `preact/hooks` and `htm` and concatenate them in that order.

## Design system

Tokens live in `:root` at the top of `index.html` and mirror iOS semantic
colours. Dark mode is handled two ways: `prefers-color-scheme` for Auto, and a
`data-appearance` attribute on `<html>` when the user forces light or dark.

- Type scale follows iOS (34/28/22/20/17/16/15/13/12)
- `--spring: cubic-bezier(.32,.72,0,1)` is the iOS sheet curve; use it for
  anything that should feel native
- Accent is a runtime CSS variable — the tint picker rewrites `--accent`
- Layout respects `env(safe-area-inset-*)`. **Every tab renders the header**,
  because the header carries the top inset; without it content slides under
  the Dynamic Island.

## Structure

```
App                  root, owns all cycle state
├── Home             cycle ring, quick log, note from Afaq, stats
├── Cycle            month calendar
├── Chat (Wyar)      Gemini 2.5 Flash
├── Notes            masonry note keeper
├── Vault            password-gated photos (SHA-256 + fixed salt)
├── Settings         appearance, accent, backup/restore, API key
└── DaySheet         flow / mood / symptoms / journal for one day
```

`predict()` groups logged period days into runs, measures the gaps between run
starts, and takes a recency-weighted average. Ovulation is assumed 14 days
before the next predicted start.

## History / gotchas

- **Icons** were referenced as `icons/icon-*.png` in the HTML but lived at the
  repo root, so all four 404'd in production and iOS silently fell back to
  `apple-touch-icon.png`. Paths are now correct and `icon-180.png` exists.
- **`gc_notes` vs `gc_keeper_notes`** are two different features — a per-day
  journal and the Notes tab. They are easy to confuse. Both are live.
- **Gemini model**: `gemini-1.5-flash` was deprecated; now `gemini-2.5-flash`.
- The **apology feature** was hardcoded to 2026-02-25 and could never fire
  again. Removed.
- The **Pashto poetry splash** was removed at Afaq's request. Her nicknames
  are still used in toasts and in Wyar's system prompt.

## Principles

1. Her data is irreplaceable. Never rename a storage key.
2. No build step — anyone should be able to edit one file and push.
3. Privacy: everything stays on the device. No analytics, no server, no CDN.
4. iPhone first. Test at 390×844 with safe-area insets.
