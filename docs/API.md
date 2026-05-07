# API Documentation

## Overview
Family Tree API provides endpoints for managing family members, authentication, and admin operations.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "family_name": "Smith"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "family_name": "Smith",
      "is_admin": false,
      "created_at": "2024-01-15T10:30:00"
    }
  }
}
```

### Login
**POST** `/auth/login`

Get authentication token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "user": { ... }
  }
}
```

### Get Current User
**GET** `/auth/me`

Get current authenticated user info.

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": { ... user data ... }
}
```

---

## Family Member Endpoints

### Get All Family Members
**GET** `/family/members`

Get all family members for current user.

**Response:**
```json
{
  "success": true,
  "message": "Family members retrieved successfully",
  "data": {
    "members": [ ... ],
    "count": 5
  }
}
```

### Get Specific Family Member
**GET** `/family/members/{memberId}`

Get details of specific family member.

**Response:**
```json
{
  "success": true,
  "message": "Family member retrieved",
  "data": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Smith",
    "gender": "male",
    "birth_year": 1990,
    "birth_place": "Mandsaur",
    "status": "alive",
    "photo_url": "https://...",
    "biography": "...",
    "father_id": null,
    "mother_id": null,
    "spouse_id": null
  }
}
```

### Create Family Member
**POST** `/family/members`

Add a new family member.

**Request:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "gender": "male",
  "birth_year": 1990,
  "birth_place": "Mandsaur",
  "status": "alive",
  "biography": "Optional biography"
}
```

**Response:** Returns created member data

### Update Family Member
**PUT** `/family/members/{memberId}`

Update family member information.

**Request:**
```json
{
  "biography": "Updated biography",
  "status": "deceased",
  "death_year": 2023
}
```

**Response:** Returns updated member data

### Delete Family Member
**DELETE** `/family/members/{memberId}`

Delete a family member.

**Response:**
```json
{
  "success": true,
  "message": "Family member deleted"
}
```

### Upload Photo
**POST** `/family/members/{memberId}/photo`

Upload a photo for family member.

**Request:** (multipart/form-data)
- file: Image file (PNG, JPG, GIF, WebP, max 10MB)

**Response:**
```json
{
  "success": true,
  "message": "Photo uploaded",
  "data": {
    "photo_url": "https://..."
  }
}
```

### Get Family Tree
**GET** `/family/tree`

Get hierarchical family tree structure.

**Response:**
```json
{
  "success": true,
  "message": "Family tree retrieved",
  "data": {
    "tree": [
      {
        "id": "uuid",
        "name": "John Smith",
        "gender": "male",
        "birth_year": 1965,
        "death_year": null,
        "status": "alive",
        "photo_url": "...",
        "children": [
          {
            "id": "uuid",
            "name": "Jane Smith",
            "gender": "female",
            ...
          }
        ]
      }
    ]
  }
}
```

---

## Location Endpoints

### Search Locations
**GET** `/locations/search?q={query}`

Search for Indian cities/villages by name.

**Parameters:**
- `q` (required): Search query, minimum 2 characters

**Response:**
```json
{
  "success": true,
  "message": "Locations retrieved",
  "data": {
    "locations": [
      {
        "id": "uuid",
        "name": "Mandsaur",
        "state": "Madhya Pradesh",
        "district": "Mandsaur",
        "location_type": "city"
      }
    ]
  }
}
```

### Get All Locations
**GET** `/locations/all?page=1&limit=50`

Get paginated list of all locations.

**Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 50)

### Get Locations by State
**GET** `/locations/by-state/{state}`

Get all locations in a state.

**Parameters:**
- `state`: State name

### Get All States
**GET** `/locations/states`

Get list of all Indian states.

---

## Admin Endpoints

### Get All Changes
**GET** `/admin/changes`

Get all changes made to family tree (admin only).

**Response:**
```json
{
  "success": true,
  "message": "Changes retrieved",
  "data": {
    "changes": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "family_member_id": "uuid",
        "action": "create|update|delete",
        "old_values": { ... },
        "new_values": { ... },
        "created_at": "2024-01-15T10:30:00"
      }
    ],
    "count": 10
  }
}
```

### Get User Changes
**GET** `/admin/changes/user/{userId}`

Get changes made by specific user.

### Get Family Changes
**GET** `/admin/changes/family/{familyId}`

Get changes for specific family member.

### Get All Users
**GET** `/admin/users`

Get list of all users (admin only).

### Toggle Admin Status
**PUT** `/admin/users/{userId}/admin`

Toggle admin status for a user (admin only).

### Get Statistics
**GET** `/admin/statistics`

Get application statistics (admin only).

**Response:**
```json
{
  "success": true,
  "message": "Statistics retrieved",
  "data": {
    "total_users": 10,
    "total_family_members": 150,
    "total_changes": 500,
    "timestamp": "2024-01-15T10:30:00"
  }
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2024-01-15T10:30:00"
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Rate Limiting
No rate limiting implemented in development environment. 
Recommended to add rate limiting for production deployment.

---

## Pagination
Paginated endpoints support:
- `page`: Page number (1-indexed)
- `limit`: Results per page (default 50, max 100)

---

## Timestamps
All timestamps are in ISO 8601 format (UTC):
```
2024-01-15T10:30:00.000Z
```

---

## Examples

### Create Family Member with Relationships
```bash
curl -X POST http://localhost:5000/api/family/members \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "gender": "female",
    "birth_year": 1995,
    "birth_place": "Mandsaur",
    "father_id": "parent-uuid",
    "mother_id": "parent-uuid"
  }'
```

### Search for Locations
```bash
curl http://localhost:5000/api/locations/search?q=mandsaur
```

### Get Change History
```bash
curl -X GET http://localhost:5000/api/admin/changes \
  -H "Authorization: Bearer <token>"
```
