# Universal Tournament Platform

A working MVP for organizing tournaments, starting with the right side of the supplied graph schema.

## Stack

- `frontend/`: Next.js App Router with TypeScript
- `backend/`: NestJS REST API using Express
- Neo4j: graph database, run locally with Docker Compose

## User path in this MVP

1. Create an account or sign in.
2. Land on the profile page; one account belongs to one email address.
3. Create an organization. Its creator becomes `OWNER` and can add organization admins by email.
4. Create tournaments inside the organization. Organization owners/admins can manage them; tournament admins can be assigned by an organization admin.
5. Add events to a tournament. The MVP currently supports Cricket and High Jump.
6. Edit event name, category, and description. Set ordered stages. Cricket can use group stage, round robin, knockout, qualifier, and final; High Jump supports qualifier and final.
7. For Cricket group stages, choose number of groups, participants per group, and how many advance. Groups are created with the stage. Rounds can be added to stages.

The profile shows organizations you administer. Organization pages show organization admins and tournaments. Tournament and event pages show tournament admins, events, and stage configuration.

## Start locally

Requirements: Node.js 24 (or a compatible version), npm, and Docker Desktop.

1. Copy `.env.example` to `.env` and set a private Neo4j password plus a unique `JWT_SECRET` with at least 32 characters.
2. Start Neo4j: `docker compose up -d neo4j`.
3. Install dependencies from the repository root: `npm install`.
4. Start the API in one terminal: `npm run dev:backend`.
5. Start the web app in another terminal: `npm run dev:frontend`.
6. Open http://localhost:3000 and sign up. The API runs at http://localhost:4000.

On startup the API creates the unique email/id constraints and seeds the Cricket and High Jump `Sport` nodes. The backend reads root `.env` when started from the workspace scripts. The frontend uses `NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:4000`.

## Backend API path

All endpoints below are prefixed with `/api`. Signup and login are public; the rest require `Authorization: Bearer <token>`.

| Step | Endpoints |
| --- | --- |
| Account | `POST /auth/signup`, `POST /auth/login`, `GET /auth/me` |
| Organization | `POST /organizations`, `GET /organizations/mine`, `GET /organizations/:id`, `POST /organizations/:id/admins` |
| Tournament | `POST /organizations/:id/tournaments`, `GET /tournaments/:id`, `POST /tournaments/:id/admins` |
| Sports pages | `GET /sports/:sportKey` (public Cricket or High Jump competition feed) |
| Event | `POST /tournaments/:id/events`, `GET /events/:id`, `PATCH /events/:id` |
| Stages and rounds | `POST /events/:id/stages`, `POST /stages/:id/rounds` |
| Health | `GET /health`, `GET /health/neo4j` |

The graph follows the right-side flow of the attached schema: `User ? Organization ? Tournament ? Event ? Stage ? Group/Round`, with `Sport` and event category connected to events. Organization and tournament admin permissions are stored as graph relationships. Neo4j operations use managed read/write transactions.

## Next backend steps

The current MVP saves organizations, tournaments, events, stages, groups, and rounds in Neo4j and connects those flows to the frontend. To complete the rest of the schema, continue in this order:

1. Add participant/person records and team/member management, with different enrollment rules for team Cricket and individual High Jump.
2. Add stage participants and group/round assignments; validate capacity and prevent duplicate enrollment.
3. Add match/attempt result entry and event, sport, and tournament points with configurable scoring rules.
4. Add standings, qualification/advancement between stages, audit history, and automated API/permission tests.
5. Before production, move browser-stored bearer tokens to secure HttpOnly cookies, add email verification/password recovery, rate limits, and deployment secrets.

Participant rosters, match results, and points are not implemented yet. The current localStorage JWT is for a development MVP only; do not deploy it as-is for a public service. Do not expose Neo4j credentials to the frontend.
## If signup cannot reach the API

The browser app, API, and Neo4j database are three separate processes. Start Neo4j first and confirm `.env` points to its Bolt address (default `bolt://localhost:7687`). Then run `npm run dev:backend` from either the repository root or the `backend/` folder, and run `npm run dev:frontend` in a second terminal from the repository root. Check `http://localhost:4000/api/health` for the API and `http://localhost:4000/api/health/neo4j` for the database connection. If port 4000 is closed, the API is not running. If `/api/health` is healthy but `/api/health/neo4j` returns an error, the API is running and the database is still unavailable. Signup and other database actions return a clear 503 message until Neo4j is started and the `.env` credentials match. The API retries its schema setup when a later database request comes in.