# Vite + Express + Prisma Demo Setup Design (Vercel Ready)

## Goal
Set up a minimal, live-demo-ready full-stack application using Vite (React), Express, and Prisma ORM connecting to Vercel Postgres. The setup will use a single repository structure and be configured for seamless deployment to Vercel (using Vercel Serverless Functions for the Express backend).

## Architecture & Stack
- **Frontend:** React (scaffolded via Vite)
- **Backend:** Express.js (Deployed as a Vercel Serverless Function)
- **Language:** TypeScript (for both frontend and backend)
- **Database:** Vercel Postgres
- **ORM:** Prisma
- **Structure:** Single Repository (Integrated)

## Components

1.  **Project Scaffold:**
    -   Root package.json to manage all dependencies and deployment scripts.
    -   rontend/ directory created via Vite (React + TS).
    -   pi/ directory (Standard Vercel convention) for the Express backend.

2.  **Backend (Express in pi/):**
    -   Minimal Express server (pi/index.ts).
    -   Configured to export the app instead of just listening, allowing Vercel to wrap it as a serverless function.
    -   A simple /api/hello health check endpoint.

3.  **Database & ORM (Prisma):**
    -   Prisma initialized at the root level.
    -   schema.prisma configured for PostgreSQL.
    -   A minimal starting model (e.g., DemoItem) to validate syntax.
    -   Prisma Client generated and used within the Express routes.

4.  **Development Workflow:**
    -   Use concurrently to run both the Vite dev server and the Express server locally via a single 
pm run dev command.
    -   Vite proxy configured to route /api requests to the local Express backend during development.

5.  **Vercel Deployment Configuration (ercel.json):**
    -   Configure ewrites to ensure any traffic hitting /api/* is routed to the Express serverless function (pi/index.ts).
    -   Configure the frontend build output directory.

6.  **Environment Variables:**
    -   Root .env file for database credentials (POSTGRES_PRISMA_URL and POSTGRES_URL_NON_POOLING).

7.  **Initial UI:**
    -   The landing page will display:
        -   Heading: "Live Audience Q&A"
        -   Body text: "The interactive voting module is currently offline."
        -   Sub-text: "Awaiting live deployment..."
