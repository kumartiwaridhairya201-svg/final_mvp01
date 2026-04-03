# Notebook

This app is now split into a browser frontend and a small Node backend.

## Architecture

- `src/` contains the React + Vite frontend.
- `backend/` contains the Express API.
- Supabase auth still runs in the frontend so the browser owns the user session.
- The backend receives the user access token and performs mistake CRUD, storage uploads, and OpenRouter calls on behalf of that signed-in user.

## Environment

Set these variables in `.env`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `OPENROUTER_API_KEY`

Optional variables:

- `BACKEND_PORT` to change the API port. Defaults to `4000`.
- `VITE_API_BASE_URL` if your frontend should call a backend hosted on a different origin.
- `FRONTEND_ORIGIN` to restrict backend CORS to one or more comma-separated origins. Use your frontend origin such as `https://mymistakes.vercel.app`; paths and trailing slashes are normalized.

## Scripts

- `npm run dev` starts the frontend and backend together.
- `npm run dev:client` starts only Vite.
- `npm run dev:server` starts only the backend in watch mode.
- `npm run build` builds the frontend.
- `npm run start:server` runs the backend without watch mode.

## Request Flow

1. The frontend signs the user in with Supabase.
2. Frontend API helpers read the current access token from the Supabase session.
3. The backend validates that token with Supabase.
4. The backend performs the database, storage, and AI operations and returns JSON to the frontend.

## Deploying This Repo

You do not need to physically split the repo into separate top-level frontend and backend folders for deployment.

- Railway can deploy the backend from the repo root by running `npm run start:server`.
- Vercel can deploy the frontend from the same repo root by building the Vite app into `dist`.

### Railway backend

1. Create a new Railway project and connect this repository.
2. Keep the service root at the repository root.
3. Railway will detect `railway.json` and start the backend with `npm run start:server`.
4. Add these environment variables in Railway:
	- `SUPABASE_URL`
	- `SUPABASE_ANON_KEY`
	- `OPENROUTER_API_KEY`
	- `FRONTEND_ORIGIN`
5. After the first deploy, copy the generated Railway public URL.

### Vercel frontend

1. Create a new Vercel project and import the same repository.
2. Set the root directory to the repository root.
3. Vercel will use `vercel.json` to build the Vite app and rewrite SPA routes to `index.html`.
4. Add these environment variables in Vercel:
	- `VITE_SUPABASE_URL`
	- `VITE_SUPABASE_ANON_KEY`
	- `VITE_API_BASE_URL` set to your Railway backend URL, for example `https://your-app.up.railway.app/api`
5. Redeploy after the Railway URL is configured.

### Order of operations

1. Deploy Railway first.
2. Copy the Railway backend URL.
3. Add that Railway URL to Vercel as `VITE_API_BASE_URL`. Using either the root Railway URL or the full `/api` URL works, and including the `https://` prefix is recommended.
4. Add your final Vercel frontend URL back into Railway as `FRONTEND_ORIGIN` (for example `https://mymistakes.vercel.app`).
5. Redeploy both once after the URLs are finalized.
