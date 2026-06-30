# Smart College Hub

Smart College Hub is a FastAPI backend for a campus collaboration and coding platform. It provides user authentication, JWT-based session handling, coding challenge management, submission tracking, and collaboration tools for students, teachers, and admins.

## Features

- User signup, login, logout, and profile access
- Access and refresh token support with JWT
- Redis-backed token blocklist for logout security
- Coding challenge creation, listing, submission, and leaderboard views
- Collaboration CRUD endpoints for shared study or project spaces
- Role-based access control for protected routes
- Async database access with SQLModel and Alembic migrations

## Tech Stack

- FastAPI
- SQLModel / SQLAlchemy asyncio
- Alembic
- PostgreSQL or another async-supported database via `DATABASE_URL`
- Redis for token revocation
- PyJWT and Passlib for authentication

## Project Structure

```text
app/
	main.py                 # FastAPI app entry point
	config.py               # Environment-based settings
	core/                   # Security and auth utilities
	db/                     # Database and Redis helpers
	dependencies/           # FastAPI dependencies and guards
	models/                 # SQLModel models
	repositories/           # Data access layer
	routes/                 # API routers
	schemas/                # Pydantic request/response models
	services/               # Business logic
	alembic/                # Database migration setup
tests/                    # Test suite
```

## Environment Variables

The application loads settings from `app/.env`.

Required variables:

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/smart_college_hub
ALEMBIC_DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/smart_college_hub
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
```

Optional Redis settings:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Local Setup

1. Create and activate a virtual environment.
2. Install the Python dependencies.
3. Add the environment variables in `app/.env`.
4. Run the database migrations.
5. Start the API server.

Example commands:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python -m uvicorn app.main:app --reload
```

## Running the API

When the server is running, open:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## API Overview

The main router groups are:

- `/auth` for signup, login, logout, and profile
- `/token` for refresh token exchange
- `/challenges` for challenge and submission workflows
- `/collaborations` for collaboration management

### Auth Routes

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/logout`
- `GET /auth/profile`

### Token Routes

- `GET /token/refresh`

### Challenge Routes

- `POST /challenges/`
- `GET /challenges/`
- `GET /challenges/leaderboard`
- `GET /challenges/my-submissions`
- `GET /challenges/users/{user_id}/submissions`
- `GET /challenges/{challenge_id}`
- `POST /challenges/{challenge_id}/submit`

### Collaboration Routes

- `POST /collaborations`
- `GET /collaborations`
- `GET /collaborations/{collaboration_id}`
- `PATCH /collaborations/{collaboration_id}`
- `DELETE /collaborations/{collaboration_id}`

## Notes

- The auth layer uses JWT access and refresh tokens.
- Logout adds the token JTI to a Redis blocklist.
- The database session is async, so the app should be run with an async-compatible database driver.
- Alembic is already configured under `app/alembic/` for schema changes.

## Contributing

1. Create a feature branch.
2. Make your changes.
3. Run the relevant tests and migrations.
4. Open a pull request with a clear summary of the change.
