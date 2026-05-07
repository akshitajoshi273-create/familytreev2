# Setup and Installation Guide

## Prerequisites

Before starting, ensure you have:
- **Python 3.9+** installed
- **Node.js 16+** installed
- **Supabase account** (free tier available at https://supabase.com)
- **Git** (optional, for version control)

## Getting Started

### 1. Clone or Download Project

```bash
cd familytreeproject
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env`:

**On Windows:**
```bash
copy .env.example .env
```

**On macOS/Linux:**
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
FLASK_ENV=development
FLASK_DEBUG=True

# Get these from Supabase Dashboard
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Frontend
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_KEY=your-anon-key
```

### 3. Setup Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the project to initialize (5-10 minutes)
3. Go to Project Settings → API
4. Copy:
   - Project URL → `SUPABASE_URL`
   - anon/public key → `SUPABASE_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Create Database Tables

Run the SQL commands from `docs/SCHEMA.md` in Supabase SQL Editor:

1. Open your Supabase project
2. Go to SQL Editor
3. Create a new query
4. Copy and run the CREATE TABLE commands
5. Create indexes
6. Create locations data (see below)

### 5A. Quick Setup (Automated)

**On macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**On Windows:**
```bash
setup.bat
```

### 5B. Manual Setup

#### Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

cd ..
```

#### Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

cd ..
```

### 6. Load Indian Locations Data

The locations table needs to be pre-populated with Indian cities and villages.

Download the CSV file from this link or create it:
- File: `data/indian_locations.csv`
- Contains: 28,000+ Indian cities and villages with coordinates

Run this in Supabase SQL Editor or use the Python script:

```bash
python scripts/load_locations.py
```

Or upload CSV directly in Supabase:
1. Go to locations table
2. Click "Import data"
3. Select CSV file
4. Map columns and import

### 7. Start the Application

#### Option A: Automated (Recommended)

**On macOS/Linux:**
```bash
chmod +x run.sh
./run.sh
```

**On Windows:**
```bash
run.bat
```

#### Option B: Manual - Run Backend

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

Backend runs on: `http://localhost:5000`

#### Option C: Manual - Run Frontend (in new terminal)

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:3000`

### 8. Access the Application

Open your browser and go to:
```
http://localhost:3000
```

## First Steps

1. **Register Account**
   - Enter Family Name, Email, and Password
   - Click "Create Account"

2. **Add Family Members**
   - Click "Add Family Member"
   - Enter name, gender, birth year
   - Select birth place (search from 28,000+ Indian locations)
   - Upload optional photo
   - Click "Add Member"

3. **Build Family Tree**
   - Create parent and child relationships
   - Add spouse information
   - Mark deceased members with year of death
   - View hierarchical family tree

4. **Admin Access** (if admin)
   - View all users
   - Review change history
   - View application statistics

## Development

### Project Structure

```
familytreeproject/
├── backend/                 # Python Flask API
│   ├── main.py             # Flask app entry
│   ├── models.py           # Database models
│   ├── config.py           # Configuration
│   ├── auth.py             # Authentication
│   ├── routes_*.py         # API routes
│   ├── requirements.txt    # Python dependencies
│   └── uploads/            # User uploads
├── frontend/               # React application
│   ├── index.html          # HTML entry
│   ├── src/
│   │   ├── main.jsx        # React entry
│   │   ├── App.jsx         # Main component
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── store.js        # Zustand stores
│   │   └── api.js          # API client
│   ├── package.json        # Node dependencies
│   └── vite.config.js      # Vite config
├── data/                   # Data files
├── docs/                   # Documentation
├── .env.example            # Environment template
└── README.md              # Project readme
```

### Development Tools

**Backend:**
```bash
# Check Python version
python --version

# Install new package
pip install package-name

# Create requirements snapshot
pip freeze > requirements.txt
```

**Frontend:**
```bash
# Check Node version
node --version

# Install new package
npm install package-name

# Build for production
npm run build
```

## Troubleshooting

### Port Already in Use

**Backend (5000):**
```bash
# Find process using port
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process (replace PID)
kill -9 PID  # macOS/Linux
taskkill /PID PID /F  # Windows
```

**Frontend (3000):**
```bash
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

### Python Virtual Environment Issues

```bash
# Recreate virtual environment
rm -rf backend/venv  # macOS/Linux
rmdir /s backend\venv  # Windows

# Create new
python -m venv backend/venv

# Reactivate and install
cd backend
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Node Modules Issues

```bash
# Clear and reinstall
rm -rf frontend/node_modules frontend/package-lock.json
npm install
```

### Supabase Connection Issues

1. Verify credentials in `.env`
2. Check Supabase project is running
3. Verify network connectivity
4. Check API keys are valid (they might be expired)

### Database Issues

1. Verify tables are created
2. Check indexes exist
3. Verify locations data is populated
4. Check for constraint violations

## Docker Deployment

### Build Images

```bash
# Build backend
docker build -f Dockerfile.backend -t family-tree-backend .

# Build frontend
docker build -f Dockerfile.frontend -t family-tree-frontend .
```

### Run with Docker Compose

```bash
# Update .env with Supabase credentials first
docker-compose up
```

Access at:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## Production Deployment

### Environment Setup

Set environment variables in production:

```env
FLASK_ENV=production
DEBUG=False
SECRET_KEY=<very-long-random-string>
JWT_SECRET_KEY=<very-long-random-string>
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-key>
```

### Backend Deployment

```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn --bind 0.0.0.0:5000 --workers 4 main:create_app()
```

### Frontend Deployment

```bash
# Build for production
npm run build

# Serves dist/ folder
npm run preview
```

### Hosting Options

**Backend:**
- Heroku
- Railway
- Vercel (with serverless)
- AWS EC2/Elastic Beanstalk
- Google Cloud Run
- DigitalOcean App Platform

**Frontend:**
- Vercel (recommended)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Google Firebase Hosting
- Heroku

## Support

For issues or questions:
1. Check logs in terminal
2. Review documentation in `docs/` folder
3. Check API documentation in `docs/API.md`
4. Check database schema in `docs/SCHEMA.md`

## License

MIT License - Feel free to use and modify
