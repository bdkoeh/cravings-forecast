# Deployment

## Docker (recommended)

```bash
cp .env.example .env
# Edit .env with production secrets

docker compose up -d --build
```

The container runs on `127.0.0.1:8083` by default (see `docker-compose.yml`). Put a reverse proxy in front for HTTPS.

## Data

The SQLite database lives in `data/restaurants.db` and is mounted as a Docker volume. When redeploying:

- **Do not overwrite `data/`** — it contains your live restaurant data
- Back up `data/restaurants.db` before risky operations
- The database is auto-created on first run from `schema.sql` + `seed.sql`

## Manual Deploy

```bash
npm ci
npm run build
npm start
```
