# Seerah Backend

Islamic education platform backend — Go + chi router + PostgreSQL

## Tech Stack

- **Language:** Go 1.22+
- **Router:** chi v5
- **Database:** PostgreSQL + GORM
- **Config:** Environment variables (.env)

## Project Structure

```
backend/
├── cmd/
│   └── api/
│       └── main.go          # Application entry point
├── internal/
│   ├── config/
│   │   └── config.go        # Configuration loader
│   ├── database/
│   │   └── database.go      # DB connection & migrations
│   ├── domain/
│   │   └── models.go        # GORM models (8 tables)
│   ├── handler/
│   │   └── health.go        # Health check endpoint
│   ├── service/             # Business logic (TBD)
│   └── repository/          # Data access (TBD)
├── pkg/                     # Shared utilities (TBD)
├── .env                     # Environment variables (gitignore)
├── .env.example             # Example env file
├── go.mod
└── go.sum
```

## Database Schema

8 tables:
1. `lecturers` — Lecturers/speakers
2. `categories` — Course categories (Құран, Ақида, Фиқһ)
3. `courses` — Video courses/series
4. `videos` — Individual video episodes
5. `users` — Platform users (anonymous with device_id for MVP)
6. `user_course_progress` — User progress tracking
7. `user_video_watched` — Watched videos tracking
8. `admins` — Admin users (JWT auth)

## Setup

### Prerequisites

- Go 1.22+
- PostgreSQL 14+

### Installation

```bash
# Install dependencies
go mod download

# Copy .env.example to .env and configure
cp .env.example .env

# Run the server
go run cmd/api/main.go
```

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "ok",
  "service": "seerah-backend"
}
```

### TODO: Add more endpoints
- Courses CRUD
- Videos CRUD
- Progress tracking
- Admin authentication

## Development

```bash
# Run with hot reload (optional)
go install github.com/cosmtrek/air@latest
air

# Build binary
go build -o seerah-backend cmd/api/main.go
```

## Deployment

### Railway

1. Create PostgreSQL database on Railway
2. Set environment variables in Railway dashboard
3. Deploy backend service

Environment variables:
- `SERVER_PORT`
- `DATABASE_URL` (Railway provides this)
- `JWT_SECRET`
- `CLOUDINARY_URL` (optional)

## License

MIT
