# Railway Deployment

This project should be deployed as two Railway services:

1. `backend` - Flask API
2. `frontend` - React/Vite app

The app also depends on Supabase for database tables and file storage.

## Backend Service

Create a Railway service from the GitHub repo and set the root directory to:

```text
backend
```

Build command:

```bash
pip install -r requirements.txt
```

Start command:

```bash
gunicorn --bind 0.0.0.0:$PORT "main:create_app()"
```

Backend variables:

```text
FLASK_ENV=production
SECRET_KEY=replace-with-a-strong-secret
JWT_SECRET_KEY=replace-with-a-different-strong-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-publishable-or-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_STORAGE_BUCKET=familytreebucket
CORS_ORIGINS=https://your-frontend-service.up.railway.app
```

## Frontend Service

Create a second Railway service from the same GitHub repo and set the root directory to:

```text
frontend
```

Build command:

```bash
npm ci && npm run build
```

Start command:

```bash
npm run preview -- --host 0.0.0.0 --port $PORT
```

Frontend variables:

```text
VITE_API_URL=https://your-backend-service.up.railway.app/api
```

`VITE_API_URL` must be set before the frontend build runs. Vite embeds this value into the production build.

## Supabase Requirements

Required database tables:

- `users`
- `family_members`
- `locations`
- `change_logs`
- `shared_access`

Required storage bucket:

```text
familytreebucket
```

After creating the tables, load location data:

```bash
python scripts/load_locations.py
```

Run that command locally with your Supabase variables configured, or from any environment that has access to the same Supabase project.

## Common Railway Issue

If the frontend shows register/login failures and Railway logs show requests going only to the frontend service, check `VITE_API_URL`.

Wrong production value:

```text
VITE_API_URL=/api
```

Correct production value:

```text
VITE_API_URL=https://your-backend-service.up.railway.app/api
```

Also make sure the backend has:

```text
CORS_ORIGINS=https://your-frontend-service.up.railway.app
```
