# Database Scripts

## Initialization

Before running the application for the first time, you need to initialize the database.

### Initialize Database

```bash
node scripts/init-db.js
```

This script creates:
- `db.sqlite3` database file
- `messages` table - stores contact form submissions
- `db_hits` table - tracks IP addresses for rate limiting
- Indexes for optimized queries

### Database Schema

#### messages table
Stores all contact form submissions.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| name | TEXT | Sender's name |
| email | TEXT | Sender's email |
| subject | TEXT | Message subject |
| text | TEXT | Message content |
| site_lang | TEXT | Language the form was submitted in |
| ip | TEXT | Sender's IP address |
| ts | TEXT | Timestamp (ISO format) |

#### db_hits table
Tracks requests per IP for rate limiting.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| ip | TEXT | Client IP address |
| ts | TEXT | Timestamp (milliseconds since epoch) |

### Notes

- The database file is not committed to the repository (see `.gitignore`)
- The application creates tables automatically on startup, but running this script ensures proper initialization
- Rate limiting is configured via the `MAX_DB_HITS` environment variable (default: 15 requests per hour per IP)
