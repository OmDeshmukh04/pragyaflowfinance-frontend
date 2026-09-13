# pragyaflowfinance-frontend

Workflow: branch → pull request → merge after **Frontend CI** passes (lint, typecheck, unit tests, build, Playwright).

`contracts/generated-openapi.json` is a copy of the backend's frozen contract; refresh it from the backend repo, then run `npm run generate:api`.

---

# PragyaFlow Finance frontend

Original, local-only product preview. React + TypeScript + Vite. **Not a live
reconciliation service.** PostgreSQL, actual API integration, customer uploads,
exports, identity and AI remain disconnected. The backend release gate is still
blocked; see `../docs/evidence/ASTRA-REVIEW.md` and ADR-011.

## Run locally

Requires Node 24 (tested: 24.15.0) and npm. From this folder:

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:5173 for the product homepage, or
http://127.0.0.1:5173/app/overview for the workspace. Vite uses a strict port to
avoid silently serving a different project. No Docker, database, or API keys.

## What works in the preview

- Overview with fixture-derived record counts and exact per-source INR totals.
- Sample-import dialog, editable field mapping and deterministic sample validation.
- Fixed workflow setup and sample results, search, status filters and pagination.
- Raw reference/amount/date/row evidence; exact-pair proposals and independent demo approval.
- In-memory activity, settings and explicit capability boundaries.
- Responsive navigation, native dialog with focus trap/return, reduced motion,
  table-only scrolling, visible demo labels and accessible states.
- Original narrated video on the homepage, playback controls, WebVTT captions,
  and transcript. It records this preview; it is not evidence of live processing.

All 20 synthetic source records are accounted for: 10 bank + 10 ledger records,
8 exact pairs (16 records), 1 amount-difference item (2 records), and 2 missing
counterpart items (2 records). The 11 comparison rows are **not** 11 source records.
Rows, proposals, and demo roles reset on refresh. No local-storage persistence or
external requests are used for financial data. Client role switching is not auth.

## Verification

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm audit
npm run generate:api
```

Browser tests use installed Chrome, desktop 1440, wide 1920, and mobile 390.
Artifacts (ignored by git) are in `artifacts/`. No PostgreSQL-backed E2E has run.
`src/api/schema.d.ts` is generated from the actual backend contract; the isolated
read-client boundary is tested with fake HTTP responses and **not** connected to
the UI. A same-origin authenticated `/api` proxy is a future integration task.
Do not replace unsupported endpoints with fake success responses.

## Rebuild the original narrated walkthrough

Uses the installed Windows speech voice (Microsoft Zira Desktop, if available)
at normal rate 0. It needs no provider, billing account or network speech service.

```powershell
# Start npm run dev separately first.
powershell.exe -NoProfile -File scripts/narrate.ps1
npm run record:demo
```

`scripts/walkthrough.json` contains the narration; `record-demo.mjs` records real
clicks in a fresh synthetic browser session, synchronizes PCM narration, encodes
Opus audio, and produces `public/media/workflow-demo.webm`, the poster and captions.
FFmpeg is development tooling only, not shipped in the browser bundle. Narration
intermediates and recording timelines remain in ignored `artifacts/`.

The homepage is intentionally **noindex** until real capabilities, hosting URL
and release claims are approved. Production needs SPA history fallback, security
headers, private authenticated APIs, and the outstanding backend controls.

## Brand and licensing

The original PragyaFlow logo/mark were copied from the owner's marketing project,
without changing that project. Website palette: navy `#07182f`, blue `#086bff`,
blue–teal trademark finish; pale neutral working surfaces. Inter is locally served
under SIL OFL, and Lucide icons use ISC. Licenses are included in `public/licenses`.
No competitor screenshots, videos, customer logos, testimonials or data are used.

## Next phase: AI-assisted reconciliation

The founder wants unfamiliar/complex-file interpretation, proposed mappings and
matching policies, and eventually a direct AI-mode reconciliation journey.
Gemini is the proposed first provider, **not configured or evaluated**. See
`../docs/decisions/ADR-012-ai-next-phase-intent.md` before implementing that layer.
