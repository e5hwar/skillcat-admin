# SkillCat Studio — Internal LMS Admin

The internal tool the SkillCat team uses to create content, run reviews, and manage platform access. Built as a
high-fidelity, fully navigable prototype of the functional spec (V1), with realistic seed data — EPA 608, NATE RTW,
OSHA 10 via ClickSafety, HVAC Trade School, B2B tenants, and more.

## Run it

```bash
npm install
npm run dev      # → http://localhost:5173
```

`npm run build` produces a static production bundle in `dist/`.

Everything runs on an in-memory mock store (`src/lib/seed.ts`) — no backend needed. Actions (approving proctoring
entries, scoring submissions, granting attempts, archiving, reordering…) mutate that store live, so flows are clickable
end-to-end. Press **⌘K** anywhere for the command palette.

## Screens ↔ spec map

| Area | Spec section | Highlights |
|---|---|---|
| Overview | — | Review-queue counts, top certifications, audit feed |
| Certifications | §7, §2 (visibility), §3 (paywalls), §9 (links), §18 (slugs) | Course/Lesson/Task tree, access restrictions (any/all), Force Order, OR-of-AND completion condition sets, trade/partnership/user-type visibility with live "who sees this" preview, free / non-consumable / consumable paywalls with per-platform pricing, content links with strength, archive-with-replacements, backup, delete guard |
| Tasks | §2–§6 | All 7 task types with type-specific forms; reuse ("used in N certifications") and global vs non-global hide behaviour; per-user management (grant attempts, reset cooldown, mark complete/incomplete) |
| Quiz editor | §4 | Sections with Required-To-Pass + per-section passing grades, static + random-pool questions, shuffle modes, variable cooldowns, auto additional attempts (EPA), time limit, in-quiz resources, proctoring toggle, review settings, per-attempt paywall ($60/$45), NATE flag + external IDs |
| Question Bank | §4.3.1 | Category/sub-category tree, statuses (active/draft/archived), versioning with retained versions, option grades −100…100%, matching with partial credit, combined feedback, randomise |
| Hands-On Reviews | §5 | Queue + review screen: media evidence, reviewer checklist, 10-point slider vs passing score, stale-instructions warning, preserved attempt history |
| Proctoring | §16 | Three queues (Proctored / ID Verification / ID Re-Uploads) + resolved; frame grid with AI flags, ID panel with confidence + name match, Previously Verified badge, Accept / Reject (templates + attach frames) / Request Reupload, integrity notes |
| Industries | §8 | Two-level taxonomy, display-order controls at every level, hide semantics, delete = tags removed only |
| Skills | §11 | Skills + Mastery Skills, any/all task criteria, archive warnings (mastery becomes unearnable), delete blocked while referenced, retroactive-award notes |
| Awards | §12 | Merit tiers, Card/Certificate appearances, reusable Designs with a drag-to-position field editor + live preview, public verification, delete vs archive semantics |
| Feedback Forms | §13 | Google-Forms-style builder (5 response types), mandatory flags, trigger mapping (one form per item), queueing rules, response viewer with version pinning, version history, duplication |
| Automations | §14 | Bulk question CSV upload (full pre-validation with row errors → preview → confirm) and two-sheet certification import (created Hidden) |
| Users | §4 (access states), §10 (path), §6 (ID) | Access states, scholarships, entitlements that survive state changes, Assigned vs Self-Added path, quiz state overrides, Support ID replacement (approve vs leave in review) |
| Companies | §1–2, §15 | Tiers, trades/partnerships, custom-content limits with over-limit flag, courtesy periods |
| Settings | §4.3, §16.3.1, §1 | Trial durations, Initial Tasks count, webcam frequency, NATE email templates, language fallback, offer-code tracking |

Every translatable field uses an EN/ES switcher: English required, missing Spanish warns (never blocks) and falls back
per field — exactly as §1 defines.

## Stack

React 18 + TypeScript + Vite, `react-router-dom` (hash routing), `lucide-react` icons, hand-rolled design system in
`src/styles/global.css` (Inter, light theme, Linear/Stripe-inspired density).
