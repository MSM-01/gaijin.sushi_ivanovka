# GAIJIN SUSHI API

Node.js + Express + Prisma + PostgreSQL.

Follow the setup steps in [`../README.md`](../README.md) to create the database, apply migrations, seed the initial menu and create an administrator.

The public menu is served at `GET /api/menu`. Admin login uses a rate-limited endpoint and an HttpOnly, SameSite cookie; catalog write endpoints require an active session. Use HTTPS in production.

The GoPay and Paloma365 adapters intentionally fail closed until their official API contracts and credentials are provided. Do not mark orders paid from frontend redirects. Do not send orders to Paloma365 before server-side payment verification.
