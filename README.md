# ASAP - AI Smart Analysis Platform

ASAP is an AI-powered dataset analysis platform that lets users upload CSV datasets, automatically profile columns, detect missing values and outliers, generate adaptive charts, view insights, and export/share polished analysis reports.

## Live Demo

https://asap-ai-analysis-platform.vercel.app/

## Run

```bash
npm install
npm run build
node server.mjs
```

Open `http://127.0.0.1:4173/`.

## What Is Included

- Auth page with sign in/sign up tabs, validation, password visibility, strength meter, Google-style OAuth action, loading and shake states.
- Home page with sticky responsive nav, hero, dashboard mockup, stats, feature cards, timeline, demo modal, CTA, and footer.
- Upload flow with drag/drop validation, detected columns, multi-select tags, advanced options, and processing overlay.
- Results dashboard with AI insights, eight chart/report panels, sortable/searchable/paginated data table, model details, PDF export, and share modal.
- Generic CSV/TSV profiling for unknown datasets: delimiter detection, duplicate header normalization, numeric/date/category/boolean type detection, missing-value scoring, IQR outlier detection, adaptive charts, and highlighted preview cells.
- Branded 404, toast notifications, PWA manifest, service worker, responsive mobile/tablet/desktop layouts, reduced-motion support, and lazy-loaded PDF libraries.

The auth, analysis, and sharing flows are implemented as front-end interactions with realistic sample data. Production integrations such as Firebase Auth, Firestore, storage, FastAPI ML jobs, and OpenAI-generated insights can be attached behind the same UI routes.
