# Visit Bangladesh

Backend/Frontend for the Visit Bangladesh platform.

## Environment
1. Copy `.env.example` to `.env` at the repo root.
2. Set `MONGO_URI`, `JWT_SECRET`, and `JWT_EXPIRES_IN`. (Port defaults to 5000.)

All secrets must live only in the root `.env` (gitignored).

## Backend
- Start: `cd backend && npm run dev`
- Docs: `GET /docs/swagger.json` (import into Swagger UI/Editor for a UI view)
- Health: `GET /health`

## Tests
- Backend unit tests (node:test): `cd backend && npm test`

## APIs (summary)
- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- Spots (public): `/api/spots`, `/api/spots/:id`
- Blogs: list/read public; create/edit/delete/like/comment require JWT (`Authorization: Bearer <token>`)
