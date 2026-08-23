# ATS Resume Analyzer

A React/Vite frontend and Node/Express API for deterministic ATS resume analysis, optional Gemini insights, and persistent MongoDB-backed analysis history.

## Architecture

```
Vercel (React/Vite) -> Render (Express API) -> MongoDB Atlas
                                      |
                                      +-> Google Gemini API (optional)
```

The browser communicates only with the API. MongoDB and Gemini credentials remain server-side.

## Local development

Install dependencies separately for each application:

```bash
cd server
npm install

cd ../client
npm install
```

Copy the example environment files before starting the services. Do not commit populated `.env` files.

```bash
copy server\\.env.example server\\.env
copy client\\.env.example client\\.env
```

Start the backend with `npm start` from `server`, and the frontend with `npm run dev` from `client`.

## Environment variables

### Render backend

| Variable | Required | Notes |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string; keep secret. |
| `CLIENT_ORIGIN` | Yes in production | Exact Vercel production origin; no wildcard. |
| `NODE_ENV` | Yes in production | Set to `production`. |
| `PORT` | Platform-provided | Render assigns this automatically. |
| `GEMINI_API_KEY` | Optional | Enables Gemini insights; never expose it to the client. |
| `GEMINI_MODEL` | Optional | Defaults to `gemini-2.5-flash`. |
| `GEMINI_TIMEOUT_MS` | Optional | Defaults to `15000`; valid range is 1000–120000. |
| `RATE_LIMIT_WINDOW_MS` | Optional | Defaults to 15 minutes. |
| `RATE_LIMIT_MAX` | Optional | Defaults to 20 requests per window. |

### Vercel frontend

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes in production | HTTPS URL of the deployed Render API, without a trailing slash. |

`VITE_*` values are bundled into browser code. Never place MongoDB or Gemini secrets in frontend variables.

## Production deployment

1. In MongoDB Atlas, use the existing database, create a least-privilege application user if needed, and allow Render's outbound network according to its deployment configuration.
2. Create a Render Web Service with root directory `server`, build command `npm install`, and start command `npm start`.
3. Configure the Render environment variables above. After deployment, confirm `/health` and `/` over HTTPS.
4. Create a Vercel project with root directory `client`, build command `npm run build`, and output directory `dist`. Configure `VITE_API_BASE_URL` with the Render HTTPS URL.
5. Set Render `CLIENT_ORIGIN` to the exact Vercel production origin, redeploy the backend if needed, and verify the complete analysis flow.

`client/vercel.json` rewrites application routes to `index.html`, so direct visits to `/history` and `/analysis/:analysisId` are handled by React Router.

## Validation commands

```bash
cd server && npm test
cd client && npm run lint && npm run build && npm run test:dashboard
```

## Privacy and security

Uploaded files are processed locally by the API and cleaned up after analysis deletion. The API does not expose upload paths or extracted resume text through analysis retrieval/history responses. See [PRIVACY.md](PRIVACY.md) for the project privacy notes.
