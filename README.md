# 🚀 Smart College Hub

Smart College Hub is a **FastAPI-based backend platform** designed to improve collaboration and learning in college environments. It enables students and teachers to connect through coding challenges, project collaborations, and structured team building.

It provides a scalable backend architecture with authentication, real-time-ready design patterns, and modular services.

---

## ✨ Features

### 🔐 Authentication & Security
- User registration and login
- JWT-based authentication (access + refresh tokens)
- Secure logout with Redis token blocklist
- Role-based access control (student, teacher, admin ready)

### 💻 Coding Challenges
- Create and manage coding challenges
- Submit solutions
- View leaderboards
- Track personal submissions

### 🤝 Collaboration System
- Create collaboration groups (projects / study groups)
- Join and manage members
- Role-based group control (owner, member)
- Structured team formation for projects

### ⚙️ Backend Architecture
- Clean layered architecture (Router → Service → Repository)
- Async database support using SQLModel
- Alembic migrations for schema management
- Redis integration for token management

---

## 🧱 Tech Stack

- FastAPI
- SQLModel / SQLAlchemy (Async)
- PostgreSQL
- Alembic
- Redis
- PyJWT
- Passlib

---
