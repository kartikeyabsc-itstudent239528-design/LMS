# LMS Backend

This backend is built with Node.js, Express, and SQLite to support the LMS frontend.

## Setup

1. Open a terminal in `backend/`
2. Run `npm install`
3. Run `npm run dev`

The server listens on port `4000` by default.

## API Endpoints

- `POST /api/auth/login`
- `POST /api/auth/signup`
- `GET /api/auth/me`
- `GET /api/books`
- `GET /api/books/:id`
- `POST /api/books`
- `PUT /api/books/:id`
- `DELETE /api/books/:id`
- `GET /api/users`
- `GET /api/transactions`
- `GET /api/transactions/user/:userId`
- `POST /api/transactions/borrow`
- `POST /api/transactions/issue`
- `POST /api/transactions/return/:transactionId`

## Notes

- Authentication uses JWT with a default secret.
- Admin-only routes require a token for an admin user.
- The database file is created automatically in `backend/data/lms.db`.
