# QUICK START GUIDE

Welcome! Here's everything you need to get your Family Tree Application running locally.

## 📋 System Requirements

- **Python 3.9 or higher** - Download from https://www.python.org/downloads/
- **Node.js 16 or higher** - Download from https://nodejs.org/
- **Supabase account** - Free at https://supabase.com
- **Git** (optional, for version control)

## 🚀 5-Minute Setup

### Step 1: Create Supabase Project (5 minutes)

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with email
4. Create a new project
5. Go to **Settings → API**
6. Copy these three values:
   ```
   - Project URL → SUPABASE_URL
   - anon public key → SUPABASE_KEY
   - service_role key → SUPABASE_SERVICE_ROLE_KEY
   ```

### Step 2: Setup Database

1. Open your Supabase project
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the entire SQL from `docs/SCHEMA.md`
5. Paste and run

This creates all required tables!

### Step 3: Configure Application

1. Open `.env.example`
2. Save as `.env` (same folder)
3. Replace with your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_KEY=your-anon-key
   ```

### Step 4: Run Setup Script

**Windows:**
```bash
setup.bat
```

**macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

This automatically:
- ✓ Creates Python virtual environment
- ✓ Installs Python packages
- ✓ Installs Node packages

### Step 5: Load Location Data

The application includes 28,000+ Indian cities and villages for autocomplete.

**Option A - Automatic (Recommended):**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python ../scripts/load_locations.py
```

**Option B - Manual in Supabase:**
1. Go to Supabase → SQL Editor
2. Run INSERT statements for each location in `scripts/load_locations.py`

### Step 6: Start Application

**Windows:**
```bash
run.bat
```

**macOS/Linux:**
```bash
chmod +x run.sh
./run.sh
```

This opens two windows:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

**Manual Start (separate terminals):**

Terminal 1 - Backend:
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python main.py
# Shows: Running on http://localhost:5000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
# Shows: Local: http://localhost:3000
```

### Step 7: Open Application

Open your browser to:
```
http://localhost:3000
```

## 📝 First Steps

1. **Sign Up**
   - Click "Create Account"
   - Enter Family Name, Email, Password
   - Click "Create Account"

2. **Add Family Members**
   - Click "Add Family Member"
   - Fill in name, gender, birth year
   - Select birth place (type "Mandsaur" to test)
   - Optionally upload photo
   - Click "Add Member"

3. **Build Your Tree**
   - Add more members (parents, children, spouses)
   - Click on members to view details
   - See hierarchical family tree

## 🛠️ Troubleshooting

### Port Already in Use

**Error:** "Port 5000 is already in use"

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -i :5000
kill -9 <PID>
```

### Python Not Found

**Error:** "python: command not found"

- Verify Python 3.9+ is installed: `python --version`
- On some systems: use `python3` instead of `python`
- Update your system PATH

### npm Not Found

**Error:** "npm: command not found"

- Verify Node.js 16+ is installed: `node --version`
- On macOS/Linux, may need to use `node` and install npm separately

### Supabase Connection Error

**Error:** "Failed to connect to Supabase"

1. Verify credentials in `.env`
2. Check Supabase project is active
3. Verify API keys are valid (not expired)
4. Check internet connection

### Database Errors

**Error:** "Table does not exist"

1. Verify all CREATE TABLE statements ran successfully
2. Check Supabase SQL Editor for errors
3. Look at the tables in Supabase Dashboard

## 📚 Documentation

- **[SETUP.md](docs/SETUP.md)** - Detailed setup guide
- **[API.md](docs/API.md)** - Complete API documentation
- **[SCHEMA.md](docs/SCHEMA.md)** - Database schema
- **[FEATURES.md](docs/FEATURES.md)** - Feature checklist

## 📂 Project Structure

```
familytreeproject/
├── backend/           # Python Flask API
├── frontend/          # React application
├── docs/              # Documentation
├── scripts/           # Utility scripts
├── .env.example       # Environment template
├── docker-compose.yml # Docker setup
├── setup.sh/bat       # Setup script
└── run.sh/bat         # Start script
```

## 🚢 Deployment

### Docker (Recommended)

```bash
# Make sure Docker is installed
docker-compose up
```

Access at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Production Deployment

See `docs/SETUP.md` for deployment to:
- Heroku
- Railway
- AWS
- Google Cloud
- Vercel (frontend)
- Netlify (frontend)

## ❓ FAQ

**Q: Can I use a different database?**
A: Currently uses Supabase/PostgreSQL. You can modify backend to use another database.

**Q: How many family members can I add?**
A: No hard limit! Supabase free tier supports thousands of records.

**Q: Is my data secure?**
A: Yes! All passwords hashed with bcrypt, JWT authentication, Supabase SSL/TLS.

**Q: Can I share my family tree?**
A: Yes (feature ready but can be extended). Share access is tracked in change logs.

**Q: How do I backup my data?**
A: Supabase provides automatic daily backups. Download manually from Supabase Dashboard.

**Q: Can I run on mobile?**
A: Yes! Fully responsive design works on all mobile browsers. No native app needed.

## 🤝 Support

- Check documentation in `docs/` folder
- Review API endpoints in `docs/API.md`
- Check database schema in `docs/SCHEMA.md`
- Review feature list in `docs/FEATURES.md`

## 🎉 You're All Set!

Your Family Tree application is ready to use!

Happy recording! 🌳

---

**Questions?** Check the documentation or the code comments for detailed explanations.

**Have feedback?** Consider adding features from `docs/FEATURES.md` "Future Enhancements".
