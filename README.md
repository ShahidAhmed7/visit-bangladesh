# Visit Bangladesh

Full-stack platform (Express + MongoDB + React/Vite + Tailwind) for browsing spots, events, blogs, and managing guide applications.

## Quick Start (TL;DR)
1) **Clone & install**
   - `npm install` inside `backend`
   - `npm install` inside `frontend`
2) **Configure env (root `.env`, only place for secrets)**
   - `MONGO_URI=` your Mongo connection string
   - `JWT_SECRET=` strong secret
   - `JWT_EXPIRES_IN=` e.g. `1d`
   - `CLOUDINARY_URL=` `cloudinary://<api_key>:<api_secret>@<cloud_name>`
3) **Run dev servers**
   - Backend: `cd backend && npm run dev` (http://localhost:5000)
   - Frontend: `cd frontend && npm run dev` (http://localhost:5173)
4) **Smoke test**
   - `GET http://localhost:5000/health`
   - Open `http://localhost:5173`

## Prerequisites
- Node 18+ and npm
- MongoDB (local or Atlas URI)
- Cloudinary account (for event/blog images and CV uploads)

## Project Structure
- `backend/` — Express API, MongoDB models, multer + Cloudinary uploads (images + raw CVs)
- `frontend/` — React (Vite), Tailwind UI, pages for events/blogs/spots, profile/admin dashboards
- `shared env` — One root `.env` only; no frontend-specific dotenv files

## Environment Setup
1. Copy `.env.example` at the repo root to `.env`
2. Fill required keys:
   ```
   MONGO_URI=
   JWT_SECRET=
   JWT_EXPIRES_IN=1d
   CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
   ```
3. Start MongoDB or ensure your Atlas URI is reachable.

## Backend
- Install: `cd backend && npm install`
- Dev: `npm run dev`
- Prod: `npm start`
- Health: `GET /health`
- Docs: `GET /docs/swagger.json` (import into Swagger UI/Editor)
- Seeds: `npm run seed:spots`, `npm run seed:users` (uses data in `src/seed/`)
- Tests (node:test): `npm test`

### Key API Areas (prefix `/api`)
- Auth: `/auth/register`, `/auth/login`, `/auth/me`
- Spots: `/spots`, `/spots/:id` (public list/read; write requires JWT)
- Blogs: list/read public; create/edit/delete/like/comment require JWT
- Events: CRUD for admins/guides; list/filter public
- Guide Applications: users submit CV/experience; admins review/approve/reject

## Frontend
- Install: `cd frontend && npm install`
- Dev: `npm run dev` (Vite)
- Build: `npm run build`
- Stack: React, Vite, Tailwind, react-router, react-hot-toast
- API base: `VITE_API_URL` can be set at build time; defaults to `http://localhost:5000`

## Contribution Workflow
1. Create a feature branch.
2. Ensure root `.env` is populated; do not add other env files.
3. Run `npm run dev` in both `backend` and `frontend` for local testing.
4. Add/adjust tests where relevant (backend: `npm test`).
5. Run `npm run build` in `frontend` before PR to catch type/compile issues.
6. Submit PR with summary, testing notes, and any migration/seed steps.

## Notes on Uploads
- Images (events/blogs) use Cloudinary image storage.
- CV uploads use Cloudinary raw storage; ensure `CLOUDINARY_URL` is set or uploads will fail.

## Support
If something is unclear or fails to start:
- Check `.env` placement (root only).
- Verify MongoDB connectivity.
- Check `http://localhost:5000/health` and Vite console for API base URL mismatches.
