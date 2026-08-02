# Smart College Hub

A modern full-stack college collaboration platform designed to streamline communication, academic collaboration, and coding activities within educational institutions. Built with **FastAPI**, **React**, **PostgreSQL**, and **Docker**, the platform follows a clean, modular architecture with secure JWT-based authentication and role-based authorization.

---

## Overview

Smart College Hub provides a centralized environment where students and faculty can collaborate, participate in coding challenges, share resources, and manage academic interactions. The project emphasizes scalability, maintainability, and a clear separation of concerns through layered backend architecture and a component-driven frontend.

---

## Core Features

- JWT Authentication with secure password hashing
- Role-Based Access Control (Student, Teacher, Admin)
- Student and faculty management
- Coding challenges and online submissions
- Automated leaderboard generation
- Collaboration spaces for project teams
- Study material and resource sharing
- Notice and event management
- Redis-powered token management
- RESTful API architecture
- Containerized development using Docker Compose

---

## Module Breakdown

| Module | Description |
|---------|-------------|
| Authentication | JWT login, registration, refresh tokens, authorization |
| User Management | User profiles, roles, permissions |
| Coding Challenges | Create, manage, and participate in programming challenges |
| Submissions | Code submission tracking and evaluation |
| Leaderboards | Ranking system based on challenge performance |
| Collaborations | Team creation, memberships, and collaboration management |
| Notices & Events | Campus announcements and event management |
| Study Materials | Share and organize academic resources |

---

# Backend

The backend follows a layered architecture that separates business logic from API endpoints and database operations.

### API Routers

- Define REST endpoints
- Handle request validation
- Delegate business logic to services

### Services

- Implement application logic
- Coordinate repositories
- Enforce business rules

### Repositories

- Encapsulate database operations
- Provide reusable CRUD methods
- Keep persistence logic isolated

### Schemas

- Request and response validation
- Serialization using **Pydantic v2**

### Models

- SQLModel entities
- Database relationships
- Table definitions

### Database

- PostgreSQL
- SQLModel + SQLAlchemy ORM
- AsyncPG for asynchronous database access
- Alembic for schema migrations

### Redis

Used for:

- Token management
- JWT blacklist
- Authentication-related caching

### Security

- JWT Authentication
- Passlib password hashing
- Role-Based Access Control
- Dependency-based authorization
- Protected API routes

---

# Frontend

The frontend is built with React and follows a modular structure focused on reusability and maintainability.

### Routed Pages

Organized using **TanStack Router** for type-safe routing.

### Shared Components

Reusable UI components including:

- Forms
- Navigation
- Layouts
- Cards
- Dialogs
- Tables

### Hooks

Custom React hooks manage:

- API requests
- Authentication state
- Query management
- Shared logic

### API Helpers

Centralized API utilities handle:

- Authentication
- Request configuration
- Error handling
- Token management

### Styling

- Tailwind CSS
- Radix UI components
- Responsive layouts
- Consistent design system

---

# Infrastructure

The project is fully containerized using **Docker Compose**.

Services include:

- Backend
- Frontend
- PostgreSQL
- Redis

Benefits:

- Consistent development environment
- Simplified onboarding
- Easy deployment
- Isolated service management

---

# Tech Stack

| Layer | Technology |
|--------|------------|
| Backend | FastAPI |
| ORM | SQLModel, SQLAlchemy |
| Validation | Pydantic v2 |
| Authentication | JWT, Passlib |
| Database | PostgreSQL |
| Database Driver | AsyncPG |
| Migrations | Alembic |
| Cache | Redis |
| Frontend | React, Vite |
| Routing | TanStack Router |
| Data Fetching | TanStack Query |
| Forms | React Hook Form |
| Validation | Zod |
| UI | Radix UI |
| Styling | Tailwind CSS |
| DevOps | Docker, Docker Compose |

---

# Project Structure

```text
Smart-College-Hub/
│
├── Backend/
│   └── app/
│       ├── api/              # API routers
│       ├── core/             # Configuration & security
│       ├── db/               # Database session & migrations
│       ├── dependencies/     # Shared dependencies
│       ├── models/           # SQLModel models
│       ├── repositories/     # Data access layer
│       ├── schemas/          # Pydantic schemas
│       ├── services/         # Business logic
│       └── utils/            # Utility functions
│
├── Frontend/
│   └── src/
│       ├── routes/           # Application pages
│       ├── components/       # Reusable UI components
│       └── lib/              # API helpers & shared utilities
│
├── docs/                     # Project documentation
│
├── docker-compose.yml
├── README.md
└── .env.example
```

---

# Architecture Overview

```text
Client (React)
	│
	▼
FastAPI Routers
	│
	▼
Service Layer
	│
	▼
Repository Layer
	│
	▼
PostgreSQL

	   │
	   ├── Redis
	   └── JWT Authentication
```

---

# Installation / Setup

### Clone the repository

```bash
git clone <repository-url>
cd Smart-College-Hub
```

### Configure environment variables

Copy the example environment files.

```bash
cp Backend/.env.example Backend/.env
cp Frontend/.env.example Frontend/.env
```

### Start the application

```bash
docker compose up --build
```

Backend:

```
http://localhost:8000
```

Frontend:

```
http://localhost:5173
```

---

# Environment Variables

Backend example:

```env
DATABASE_URL=
ALEMBIC_DATABASE_URL=
JWT_SECRET_KEY=
JWT_REFRESH_SECRET_KEY=
REDIS_URL=
ACCESS_TOKEN_EXPIRE_MINUTES=
REFRESH_TOKEN_EXPIRE_DAYS=
```

Frontend example:

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

# API Modules

| Module | Purpose |
|---------|---------|
| Auth | Authentication and authorization |
| Users | User management |
| Challenges | Coding challenge management |
| Submissions | Submission handling |
| Leaderboards | Rankings and scoring |
| Collaborations | Team collaboration |
| Notices | Campus announcements |
| Study Materials | Academic resource management |

---

# Testing

The project is designed with a layered architecture that supports isolated testing.

Recommended testing includes:

- API endpoint testing
- Service layer testing
- Repository integration testing
- Authentication and authorization validation
- Frontend component testing
- End-to-end workflow verification

---

# MCP Integration

> {
  "servers": {
    "LLMs Docs": {
      "type": "sse",
      "url": "https://gitmcp.io/Arjun-Bhattarai/"Smart-College-hub"
    }
  }
}
---

# Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

Please follow the existing project structure and coding conventions.

---

# License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.
