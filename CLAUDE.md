# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LTI (Talent Tracking System) - A full-stack applicant tracking system with React frontend and Express/TypeScript backend using Prisma ORM with PostgreSQL.

## Common Commands

### Backend (from `backend/` directory)
```bash
npm run dev          # Start development server with hot reload (ts-node-dev)
npm run build        # Compile TypeScript to dist/
npm start            # Run production build
npm test             # Run Jest tests
npx prisma generate  # Generate Prisma client after schema changes
npx prisma migrate dev  # Apply database migrations
ts-node prisma/seed.ts  # Seed database with sample data
```

### Frontend (from `frontend/` directory)
```bash
npm start            # Start React dev server (port 3000)
npm run build        # Production build
npm test             # Run Jest tests
```

### Database (from root directory)
```bash
docker-compose up -d   # Start PostgreSQL container
docker-compose down    # Stop PostgreSQL container
```

## Architecture

### Backend Structure (Clean Architecture)
The backend follows a layered architecture pattern:

- **`presentation/controllers/`** - HTTP request handlers that delegate to services
- **`application/services/`** - Business logic orchestration (e.g., `candidateService.ts`)
- **`application/validator.ts`** - Input validation logic
- **`domain/models/`** - Domain entities with Prisma persistence (Active Record pattern). Models like `Candidate`, `Education`, `WorkExperience` contain both data and database operations (`save()`, `findOne()`)
- **`routes/`** - Express route definitions
- **`prisma/schema.prisma`** - Database schema definition

### Data Flow
1. Routes receive HTTP requests → 2. Controllers extract data and call services → 3. Services validate input and orchestrate domain models → 4. Domain models handle persistence via Prisma

### Key Domain Entities
The Prisma schema defines an ATS domain with:
- **Candidate** - Core entity with related Education, WorkExperience, Resume
- **Company** → Employee → Interview chain for interviewers
- **Position** → Application → Interview flow for job applications
- **InterviewFlow** → InterviewStep → InterviewType for configurable interview pipelines

### API Endpoints
- `POST /candidates` - Create candidate with nested education, work experience, and CV
- `GET /candidates/:id` - Retrieve candidate by ID
- `POST /upload` - File upload endpoint

### Ports
- Backend: `http://localhost:3010`
- Frontend: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
