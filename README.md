# Family Tree Application

A complete end-to-end family tree management application built with Python backend, React frontend, and Supabase integration. Perfect for recording and managing your family heritage!

## ✨ Features

- 🔐 **Email Authentication** - Secure login with email and password via Supabase
- 👨‍👩‍👧‍👦 **Hierarchical Family Tree** - Beautiful hierarchical visualization of family relationships
- 📸 **Photo Management** - Store and display family photos (PNG, JPG, GIF, WebP)
- 🗺️ **Location Autocomplete** - 28,000+ Indian cities/villages with intelligent search
- 👤 **Rich Profiles** - Detailed family member information with relationships
- 🏷️ **Gender Coding** - Blue for male, Pink for female with visual indicators
- 📊 **Life Timeline** - Track birth years and death years (shows as 1956-2019)
- 👥 **Relationship Management** - Add parents, spouses, and children
- 📝 **Change Tracking** - Complete audit trail of all modifications
- 📱 **Mobile Responsive** - Works perfectly on mobile browsers
- 👑 **Admin Dashboard** - Review user changes and manage application

## Project Structure

```
familytreeproject/
├── backend/              # Python Flask API
├── frontend/             # React application
├── data/                 # Shared data files
├── docs/                 # Documentation
├── .env.example          # Environment variables template
└── setup.sh              # Setup script
```

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- Supabase account
- Git

### Setup Instructions

1. **Clone and navigate to project:**
   ```bash
   cd familytreeproject
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment:**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials
   - Update API endpoints

5. **Run Backend:**
   ```bash
   cd backend
   source venv/bin/activate
   python main.py
   ```

6. **Run Frontend (in another terminal):**
   ```bash
   cd frontend
   npm start
   ```

The application will be available at `http://localhost:3000`

## Environment Variables

Create a `.env` file in the root directory:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
FLASK_ENV=development
FLASK_DEBUG=True
CORS_ORIGINS=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/familytree
```

## API Documentation

See [docs/API.md](docs/API.md) for complete API documentation.

## Database Schema

See [docs/SCHEMA.md](docs/SCHEMA.md) for database schema details.

## Features Implemented

- ✅ Email authentication
- ✅ User roles and permissions
- ✅ Family member CRUD operations
- ✅ Photo upload and storage
- ✅ Family relationship management
- ✅ Hierarchical tree visualization
- ✅ Change history tracking
- ✅ Admin dashboard
- ✅ Autocomplete for Indian locations
- ✅ Mobile responsive design

## Technology Stack

**Backend:**
- Flask
- SQLAlchemy
- Supabase (PostgreSQL)
- Python-Jose (JWT)
- Pillow (Image processing)

**Frontend:**
- React 18
- React Router
- Axios
- Tailwind CSS
- React Flow (Tree visualization)
- Zustand (State management)

**Database:**
- PostgreSQL (via Supabase)
- Supabase Storage (File uploads)

**Deployment:**
- Docker
- Docker Compose
- Heroku/Railway ready

## Support

For issues and questions, please check the documentation in the `docs` folder.

## License

MIT License

---

**Built for efficient family record management across India's diverse locations.**
