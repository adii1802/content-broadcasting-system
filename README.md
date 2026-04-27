# Content Broadcasting System

A Node.js backend system for managing and broadcasting digital content across school screens. Teachers can upload content, principals can review and approve it, and the system automatically rotates and broadcasts approved content based on schedules.

## Tech Stack
- **Node.js + Express**: Core application framework.
- **PostgreSQL**: Relational database for storing users and content metadata.
- **pg**: PostgreSQL client for Node.js.
- **Multer**: Handling multipart/form-data for file uploads.
- **JWT & bcrypt**: Authentication and password hashing.
- **node-cache & express-rate-limit**: Performance and security scaling for public APIs.

## Setup Instructions

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and configure your database credentials:
   ```bash
   cp .env.example .env
   ```
   *Make sure you have a PostgreSQL instance running and matching the credentials in `.env`.*

3. **Run the Seed Script:**
   This will initialize the database tables and create two default users (a principal and a teacher):
   ```bash
   node seed.js
   ```

4. **Start the Server:**
   ```bash
   node app.js
   ```
   The server will run on the specified PORT (default `3000`).

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register a new user (principal/teacher) |
| POST | `/api/auth/login` | None | Login and receive a JWT |
| POST | `/api/content/upload` | Teacher | Upload content (requires `title`, `subject`, `file`) |
| GET | `/api/content/my` | Teacher | Get all content uploaded by the logged-in teacher |
| GET | `/api/content/all` | Principal | Get all uploaded content (supports `?status=pending`) |
| GET | `/api/content/pending` | Principal | Get all pending content |
| POST | `/api/content/:id/approve` | Principal | Approve a piece of content |
| POST | `/api/content/:id/reject` | Principal | Reject content (requires `{ reason: "..." }`) |
| GET | `/api/content/live/:teacherId` | None | Public broadcast endpoint, returns active rotating content |

## Assumptions Made
1. **Rotation Calculation:** For calculating the active slot, the "epoch" is assumed to be the earliest `start_time` of the active group of content. If rotation duration is null, it defaults to 5 minutes.
2. **Missing Dates:** If `start_time` or `end_time` are not provided or are null, the content is considered ineligible for live broadcast.
3. **Database Timezones:** It is assumed the Node.js server and PostgreSQL instance are operating in the same timezone for `NOW()` comparisons.
4. **Caching:** The live endpoint is cached for 30 seconds globally to reduce database load.
