# PennyPilot — System Architecture

## 1. Architecture Overview

PennyPilot follows a three-tier architecture:

- Presentation Layer: React frontend.
- Application Layer: Node.js and Express backend.
- Data Layer: PostgreSQL database.

The frontend communicates with the backend through REST APIs.
The backend validates requests, enforces authentication and
authorization, and communicates with PostgreSQL through Prisma.

## 2. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Backend | Node.js, Express |
| Validation | Zod |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | Server-side sessions |
| Testing | Vitest, Supertest |
| Containerization | Docker, Docker Compose |
| Cloud | AWS |

## 3. Main Application Modules

- Authentication and user management
- Dashboard and financial summaries
- Income and expense management
- Category management
- Monthly budgeting
- Transaction history and filtering

## 4. Database Entities

Initial database tables:

- Users
- Transactions
- Categories
- Budgets
- Sessions

Future expansion:

- Auth identities for OAuth integration.

## 5. Security Architecture

- Password hashing using Argon2id or bcrypt.
- HTTP-only session cookies.
- CSRF protection.
- Server-side input validation.
- User-level data isolation.
- Parameterized database operations through Prisma.
- Rate limiting on sensitive endpoints.
- HTTPS in production.
- Secrets stored outside source control.

## 6. Deployment Architecture

Local development:

- React frontend
- Express backend
- PostgreSQL database
- Docker Compose

Future AWS deployment:

- S3 and CloudFront for frontend hosting.
- ECS Fargate for backend hosting.
- Application Load Balancer for incoming traffic.
- RDS PostgreSQL for database hosting.
- Secrets Manager for application secrets.
- CloudWatch for logging and monitoring.

## 7. Development Strategy

Development will begin locally.
Cloud deployment will follow after the core application,
authentication, database and testing are functional.