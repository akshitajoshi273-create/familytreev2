# Database Schema - Copy & Paste Ready SQL

## ⚠️ IMPORTANT: Copy ONLY the SQL code below (from line with first -- to the last line before this section ends)

**Do NOT copy any markdown text** - Only copy the raw SQL code between the lines marked START and END.

```
══════════════════ START - COPY FROM HERE ══════════════════

-- Users Table
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  family_name VARCHAR NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- Family Members Table
CREATE TABLE family_members (
  id VARCHAR PRIMARY KEY,
  owner_id VARCHAR NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR,
  gender VARCHAR NOT NULL,
  date_of_birth TIMESTAMP,
  birth_year INTEGER,
  birth_place VARCHAR,
  date_of_death TIMESTAMP,
  death_year INTEGER,
  status VARCHAR DEFAULT 'alive',
  photo_url VARCHAR,
  biography TEXT,
  father_id VARCHAR,
  mother_id VARCHAR,
  spouse_id VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (owner_id) REFERENCES users(id),
  FOREIGN KEY (father_id) REFERENCES family_members(id),
  FOREIGN KEY (mother_id) REFERENCES family_members(id),
  FOREIGN KEY (spouse_id) REFERENCES family_members(id)
);

CREATE INDEX idx_family_members_owner ON family_members(owner_id);
CREATE INDEX idx_family_members_father ON family_members(father_id);
CREATE INDEX idx_family_members_mother ON family_members(mother_id);

-- Locations Table
CREATE TABLE locations (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  state VARCHAR NOT NULL,
  district VARCHAR,
  latitude FLOAT,
  longitude FLOAT,
  location_type VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_locations_name ON locations(name);
CREATE INDEX idx_locations_state ON locations(state);
CREATE INDEX idx_locations_name_state ON locations(name, state);

-- Change Logs Table
CREATE TABLE change_logs (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  family_member_id VARCHAR NOT NULL,
  action VARCHAR NOT NULL,
  old_values JSON,
  new_values JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (family_member_id) REFERENCES family_members(id)
);

CREATE INDEX idx_change_logs_user ON change_logs(user_id);
CREATE INDEX idx_change_logs_family ON change_logs(family_member_id);
CREATE INDEX idx_change_logs_created ON change_logs(created_at);

-- Shared Access Table
CREATE TABLE shared_access (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  shared_with_email VARCHAR NOT NULL,
  permission VARCHAR DEFAULT 'view',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_shared_access_user ON shared_access(user_id);
CREATE INDEX idx_shared_access_email ON shared_access(shared_with_email);

══════════════════ END - COPY UP TO HERE ══════════════════
```

## Table Descriptions

### Users Table
- `id`: UUID, primary key
- `email`: User email address (unique)
- `password_hash`: Bcrypt hashed password
- `family_name`: Name of the family
- `is_admin`: Admin status
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### Family Members Table
- `id`: UUID, primary key
- `owner_id`: User ID (foreign key)
- `first_name`: Person's first name
- `last_name`: Person's last name (optional)
- `gender`: 'male' (blue) or 'female' (pink)
- `date_of_birth`: Full birth date
- `birth_year`: Birth year
- `birth_place`: Birth location (city/village name)
- `date_of_death`: Full death date
- `death_year`: Death year (if deceased)
- `status`: 'alive' or 'deceased'
- `photo_url`: URL to profile photo
- `biography`: Optional biographical information
- `father_id`: Reference to father (optional)
- `mother_id`: Reference to mother (optional)
- `spouse_id`: Reference to spouse (optional)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Locations Table
- `id`: UUID, primary key
- `name`: Location name (city/village)
- `state`: Indian state
- `district`: District (optional)
- `latitude`: Geographic latitude
- `longitude`: Geographic longitude
- `location_type`: 'city', 'village', or 'town'
- `created_at`: Creation timestamp
- **Contains:** 28,000+ Indian cities, villages and towns with coordinates

### Change Logs Table
- `id`: UUID, primary key
- `user_id`: User who made the change
- `family_member_id`: Family member that was changed
- `action`: 'create', 'update', or 'delete'
- `old_values`: JSON of previous values (for updates/deletes)
- `new_values`: JSON of new values (for creates/updates)
- `created_at`: Change timestamp

### Shared Access Table
- `id`: UUID, primary key
- `user_id`: Owner's user ID
- `shared_with_email`: Email of person with access
- `permission`: 'view', 'edit', or 'admin'
- `created_at`: Share creation timestamp

## Relationships

- Users → Family Members (1 to many)
- Users → Change Logs (1 to many)
- Users → Shared Access (1 to many)
- Family Members → Family Members (self-referencing for father, mother, spouse)

---

## Data Types

- **VARCHAR**: Text (variable length)
- **INTEGER**: Whole numbers
- **FLOAT**: Decimal numbers
- **TIMESTAMP**: Date and time
- **BOOLEAN**: True/False
- **JSON**: Structured data
- **TEXT**: Long text (up to 1GB)

---

## Indexes

Indexes are created for:
- `users.email`: Fast email lookups
- `family_members.owner_id`: Query members by user
- `family_members.father_id`: Query by parent relationships
- `family_members.mother_id`: Query by parent relationships
- `locations.name`: Fast location search
- `locations.state`: Filter by state
- `change_logs.user_id`: Audit trail by user
- `change_logs.family_member_id`: History for member
- `change_logs.created_at`: Timeline queries

---

## Storage

### Supabase Storage
Photos are stored in Supabase Storage buckets:
- **Bucket**: `photos`
- **Folder**: `family_photos/{user-id}/`
- **File naming**: UUID + extension
- **Max size**: 10MB per file
- **Supported formats**: PNG, JPG, GIF, WebP

---

## Backups

1. **Daily Backups**: Supabase provides automatic daily backups
2. **Point-in-time Recovery**: Up to 7 days available
3. **Custom Backups**: Use Supabase Dashboard to create manual backups
4. **Export Data**: Use `pg_dump` for PostgreSQL exports

```bash
pg_dump postgresql://user:password@your-db.supabase.co:5432/postgres > backup.sql
```

---

## Performance Considerations

1. **Indexing**: Key columns are indexed for rapid queries
2. **Pagination**: Use pagination for large result sets
3. **Query Optimization**: Avoid N+1 queries by batching
4. **Connection Pooling**: Use pgBouncer for connection management
5. **Caching**: Implement Redis for frequently accessed data

---

## Security

1. **Password**: Bcrypt hashed (cost factor 12)
2. **JWT Tokens**: Signed with HS256
3. **SSL/TLS**: All Supabase connections use SSL
4. **Row Level Security**: Can be enabled per table
5. **SQL Injection**: Parameterized queries prevent injection
6. **Data Encryption**: At rest and in transit

---

## Migrations

Set up migrations using Alembic:

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head

# Rollback migration
alembic downgrade -1
```
