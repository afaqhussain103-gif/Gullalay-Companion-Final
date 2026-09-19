# Data contract — DO NOT BREAK

All app data lives in `localStorage` on her device only. There is no server.
Same origin (gullalay.netlify.app) => data survives deploys and service-worker
updates. The ONLY way to lose it is renaming a key or writing an unreadable shape.

## Keys (exact strings — never rename)

| Key                | Shape                                        | Notes |
|--------------------|----------------------------------------------|-------|
| `gc_pLogs`         | `{ "YYYY-MM-DD": { flow: "medium" } }`        | Cycle history. Irreplaceable. |
| `gc_mLogs`         | `{ "YYYY-MM-DD": ["Happy","Calm"] }`          | Mood labels, must match MOODS[].label |
| `gc_sLogs`         | `{ "YYYY-MM-DD": ["Cramps"] }`                | Symptom strings |
| `gc_chat`          | `[{ role, content }]`                         | role = 'user' | 'ai' |
| `gc_keeper_notes`  | `[{ id,title,body,color,createdAt,updatedAt }]`| |
| `gc_vault_hash`    | hex string                                    | SHA-256(pw + salt) |
| `gc_vault_photos`  | `[{ id,src,name,addedAt,caption }]`           | src = base64 data URL |
| `gc_geminiKey`     | string                                        | |
| `gc_setup`         | boolean                                       | onboarding complete |
| `gc_theme`         | string (legacy)                               | old 24-theme name. Left untouched. |

New settings use NEW keys so legacy values are never clobbered:
`gc_appearance` ('auto'|'light'|'dark'), `gc_accent` (tint id).

## Invariants
1. Vault salt is `gullalay_vault_2024`. Changing it locks her out permanently.
2. Flow values counted as a period: anything except `none` and `discharge`.
   `predict()` depends on this exact rule.
3. All values are JSON.stringify'd. useLS auto-prefixes `gc_`.
4. Mood label strings are the join key between MOODS[] and gc_mLogs. Renaming a
   mood label orphans past logs.

## Backup
Settings > Data > Export writes a single JSON file containing every key above.
Import restores it. This is the only recovery path if storage is cleared.
