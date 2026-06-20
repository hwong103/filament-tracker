# Filament Tracker

Lightweight inventory tracker for 3D printer filament. The Vite + React frontend and D1 API deploy together as one Cloudflare Worker.

## Structure
- `frontend/`: Vite + React app, built as Worker static assets
- `backend/`: Cloudflare Worker + D1 + migration + CSV import script

## Backend setup (Cloudflare)
1. Install dependencies:
   - `cd backend`
   - `npm install`
2. Create D1 database:
   - `npx wrangler d1 create filament-tracker`
3. Apply migrations:
   - `npx wrangler d1 migrations apply filament-tracker`
4. Set edit passcode:
   - `npx wrangler secret put EDIT_TOKEN`
5. Deploy the complete app (builds the frontend first):
   - `npm run deploy`

The Worker serves static assets directly and invokes the Worker only for `/api/*` requests. This keeps the frontend efficient on Cloudflare's free tier.

## Frontend setup
1. Install dependencies:
   - `cd frontend`
   - `npm install`
2. For a same-origin Cloudflare deployment, do not set `VITE_API_BASE`; the app uses `/api` on its own hostname.
3. Build:
   - `npm run build`
4. Publish from `backend/` with `npm run deploy`.

For GitHub Actions deployment, add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets, then run the **Deploy Filament Tracker to Cloudflare** workflow manually.

## CSV import from Google Sheets
1. Export your Google Sheet as CSV.
2. Generate SQL:
   - `cd backend`
   - `node scripts/csv_to_sql.mjs /path/to/filament.csv > /tmp/filaments.sql`
3. Import into D1:
   - `npx wrangler d1 execute filament-tracker --file /tmp/filaments.sql`

## Import from a local CSV file
1. Generate SQL from your existing file:
   - `cd backend`
   - `node scripts/csv_to_sql.mjs '/path/to/Filament Stock - Sheet1.csv' > seeds/filaments_from_sheet.sql`
2. Import that seed file:
   - `npx wrangler d1 execute filament-tracker --file seeds/filaments_from_sheet.sql`

## Local development
- Backend: `cd backend` then `npm run dev`
- Frontend: `cd frontend` then `npm run dev`

## Notes
- The app opens on an unlock screen. Inventory reads and edits require the
  shared passcode stored in `EDIT_TOKEN`.
- Low stock threshold is `0.25` spools in `frontend/src/lib/constants.ts`.
