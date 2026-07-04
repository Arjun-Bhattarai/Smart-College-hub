# 🚀 Smart College Hub

**A full-stack coding challenge and collaboration platform built for college students.**

Smart College Hub helps students and teachers connect through coding challenges, project collaborations, and structured team building — backed by a scalable, production-grade FastAPI service and a modern React frontend.

<p align="left">
  <img src="https://img.shields.io/badge/FastAPI-async-009688?style=flat-square&logo=fastapi" />
  <img src="https://img.shields.io/badge/PostgreSQL-SQLModel-336791?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-token%20blocklist-DC382D?style=flat-square&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/React-Vite-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/license-MIT-informational?style=flat-square" />
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧭 Overview

Smart College Hub is designed to solve a simple problem: college students learning to code rarely have a single place to **practice, compete, and collaborate** with peers in a structured way. This platform brings coding challenges, leaderboards, and project/study-group formation together under one roof, with an authentication and authorization system solid enough to support real multi-role usage (students, teachers, and admins).

The backend is built with a clean layered architecture (Router → Service → Repository) so business logic stays decoupled from HTTP and database concerns — making the codebase easy to test, extend, and reason about.

---

## ✨ Features

### 🔐 Authentication & Security
- User registration and login
- JWT-based authentication (access + refresh tokens)
- Secure logout via Redis token blocklist
- Role-based access control (student, teacher, admin-ready)

### 💻 Coding Challenges
- Create and manage coding challenges
- Submit solutions
- View leaderboards
- Track personal submission history

### 🤝 Collaboration System
- Create collaboration groups (projects / study groups)
- Join and manage members
- Role-based group control (owner, member)
- Structured team formation for projects

### ⚙️ Backend Architecture
- Clean layered architecture (Router → Service → Repository)
- Async database access using SQLModel
- Alembic migrations for schema management
- Redis integration for token lifecycle management

---

## 🧱 Tech Stack

| Layer          | Technology              |
|----------------|-------------------------|
| API Framework  | FastAPI (async)         |
| ORM            | SQLModel / SQLAlchemy   |
| Database       | PostgreSQL              |
| Migrations     | Alembic                 |
| Caching/Tokens | Redis                   |
| Auth           | PyJWT, Passlib          |
| Frontend       | React + Vite + Tailwind |

---

## 🏗️ Architecture

```
Client (React)
     │
     ▼
 ┌─────────┐     ┌─────────┐     ┌────────────┐
 │ Router  │ --> │ Service │ --> │ Repository │ --> PostgreSQL
 └─────────┘     └─────────┘     └────────────┘
     │
     ▼
   Redis (token blocklist / caching)
```

Each layer has a single responsibility:
- **Router** — request/response handling, validation
- **Service** — business logic, orchestration
- **Repository** — database queries and persistence

---

## 📂 Project Structure

```
smart-college-hub/
├── app/
│   ├── api/            # Route definitions
│   ├── services/        # Business logic
│   ├── repositories/     # Database access layer
│   ├── models/           # SQLModel schemas
│   ├── core/             # Config, security, dependencies
│   └── main.py           # App entrypoint
├── alembic/               # Database migrations
├── frontend/              # React + Vite + Tailwind client
├── tests/                 # Test suite
├── .env.example
└── requirements.txt
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- PostgreSQL 14+
- Redis 6+
- Node.js 18+ (for the frontend)

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/<your-username>/smart-college-hub.git
cd smart-college-hub

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file based on `.env.example`:

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/smart_college_hub
REDIS_URL=redis://localhost:6379/0
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
```

---

## 📡 API Overview

| Endpoint                     | Method | Description                     |
|-------------------------------|--------|----------------------------------|
| `/auth/register`              | POST   | Register a new user             |
| `/auth/login`                 | POST   | Log in and receive tokens       |
| `/auth/logout`                | POST   | Revoke token via Redis blocklist|
| `/challenges`                 | GET    | List coding challenges          |
| `/challenges/{id}/submit`     | POST   | Submit a solution               |
| `/challenges/{id}/leaderboard`| GET    | View challenge leaderboard      |
| `/groups`                     | POST   | Create a collaboration group    |
| `/groups/{id}/join`           | POST   | Join a group                    |

Full interactive documentation is auto-generated by FastAPI at `/docs` (Swagger UI) and `/redoc`.

---

## 🗺️ Roadmap

- [ ] Real-time notifications (WebSockets)
- [ ] Challenge tags & difficulty-based filtering
- [ ] Admin dashboard for challenge moderation
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Docker Compose setup for one-command local dev

---

## 🤝 Contributing

Contributions are welcome. Please open an issue to discuss significant changes before submitting a pull request.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit using conventional commits (`feat:`, `fix:`, `docs:`)
4. Open a pull request

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
