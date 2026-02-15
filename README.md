# Filament Tracker

Lightweight inventory tracker for 3D printer filament. Frontend is a static Vite + React app, backend is a Cloudflare Worker with a D1 database.

## Structure
- `frontend/`: Vite + React app (GitHub Pages)
- `backend/`: Cloudflare Worker + D1 + migration + CSV import script

## Backend setup (Cloudflare)
1. Install dependencies:
   - `cd backend`
   - `npm install`
2. Create D1 database:
   - `npx wrangler d1 create filament-tracker`
3. Update `backend/wrangler.toml`:
   - Set `database_id`
   - Set `ALLOWED_ORIGINS` to your GitHub Pages domain
4. Apply migrations:
   - `npx wrangler d1 migrations apply filament-tracker`
5. Set edit passcode:
   - `npx wrangler secret put EDIT_TOKEN`
6. Deploy Worker:
   - `npx wrangler deploy`

## Frontend setup (GitHub Pages)
1. Install dependencies:
   - `cd frontend`
   - `npm install`
2. Set API URL (local `.env` or CI):
   - `VITE_API_BASE=https://<your-worker>.workers.dev`
3. Set base path:
   - `BASE_PATH=/your-repo-name/`
4. Build:
   - `npm run build`
5. Publish:
   - Use the included GitHub Actions workflow at `.github/workflows/deploy-pages.yml`
   - Add repository secret `VITE_API_BASE` with your Worker URL

## CSV import from Google Sheets
1. Export your Google Sheet as CSV.
2. Generate SQL:
   - `cd backend`
   - `node scripts/csv_to_sql.mjs /path/to/filament.csv > /tmp/filaments.sql`
3. Import into D1:
   - `npx wrangler d1 execute filament-tracker --file /tmp/filaments.sql`

## Import using your current local CSV
1. Generate SQL from your existing file:
   - `cd /Users/henrywong/Documents/Personal\ Dev/Filament\ Tracker/backend`
   - `node scripts/csv_to_sql.mjs '/Users/henrywong/Downloads/Filament Stock - Sheet1.csv' > seeds/filaments_from_sheet.sql`
2. Import that seed file:
   - `npx wrangler d1 execute filament-tracker --file seeds/filaments_from_sheet.sql`

## Local development
- Backend: `cd backend` then `npm run dev`
- Frontend: `cd frontend` then `npm run dev`

## Notes
- Public read access is enabled.
- Edits require the shared passcode stored in `EDIT_TOKEN`.
- Low stock threshold is `0.25` spools in `frontend/src/App.tsx`.
