# VendorHub

A vendor and client management system built with Express, TypeScript, and SQLite.

## Tech Stack

- **Backend**: Express.js with TypeScript
- **Database**: SQLite (better-sqlite3)
- **Authentication**: Cookie-based sessions with bcrypt password hashing
- **View Engine**: EJS

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

The server will start at `http://localhost:1738`

## Features

- User registration with role selection (client/vendor)
- Secure password hashing with bcrypt
- Cookie-based session management
- Role-based routing (`/users/:id/client` and `/users/:id/vendor`)

## Project Structure

```
├── src/
│   ├── index.ts          # Main application entry
│   └── types/            # TypeScript type definitions
├── middleware/
│   └── sessioncheck.ts   # Session authentication middleware
├── db.ts                 # Database initialization
├── database.db           # SQLite database file
├── package.json
└── tsconfig.json
```

## API Endpoints

- `GET /` - Homepage
- `POST /` - Login
- `POST /signup` - User registration
- `GET /logout` - Logout and clear session
- `GET /users/:userid/client` - Client dashboard
- `GET /users/:userid/vendor` - Vendor dashboard
- `GET /api/dashboard/summary` - Dashboard data (requires user id query param)
