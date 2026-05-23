# Project Context for AI Agents

## Overview
This project is a minimal, live-demo-ready full-stack application built for a "Live Audience Q&A / Interactive Voting Module" webinar demonstration.

It is designed to be deployed seamlessly on **Vercel**.

## Architecture & Stack
This is a **Single Repository (Integrated)** setup.

- **Frontend:** React scaffolded with Vite (TypeScript). Located in the `frontend/` directory.
- **Backend:** Express.js (TypeScript). Located in the `api/` directory.
- **Database:** PostgreSQL (specifically Vercel Postgres).
- **ORM:** Prisma (initialized at the project root).
- **Deployment:** Vercel.

## Key Configuration Details

### 1. Vercel Deployment
- Vercel acts as the host for both the static frontend and the backend API.
- The `vercel.json` file handles routing:
  - Requests to `/api/*` are routed to the Express backend in the `api/` directory (which Vercel wraps as serverless functions).
  - All other requests are routed to `index.html` (the frontend).
- The Vite build output is explicitly configured in `frontend/vite.config.ts` to output to the root `public/` directory (not `dist/`), as this is the default location Vercel checks for static assets in a general Node.js project.

### 2. Backend (Express as Serverless)
- The backend entry point is `api/index.ts`.
- **CRITICAL:** Notice that the Express app is *exported* (`export default app;`) at the bottom of the file. This is required for Vercel to convert the Express app into a serverless function. `app.listen()` is only called conditionally when running locally.

### 3. Local Development
- The root `package.json` manages scripts for the whole project.
- Running `npm run dev` in the root directory uses `concurrently` to start both the Vite dev server and the Express backend (via `tsx watch`).
- The Vite proxy in `frontend/vite.config.ts` routes `/api` requests to the local Express server (running on port 3001 by default).

### 4. Database (Prisma)
- The Prisma schema (`prisma/schema.prisma`) expects `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` environment variables. These are provided automatically by Vercel Postgres when the database is linked to the Vercel project.
- A dummy model `DemoItem` exists just to validate the schema syntax.

## Current State
- The UI currently consists of a simple landing page (`frontend/src/App.tsx`) stating:
  "Live Audience Q&A. The interactive voting module is currently offline. Awaiting live deployment..."
- The basic infrastructure (Frontend, API, DB connection) is fully set up and successfully deploying to Vercel. Ready for live feature development.