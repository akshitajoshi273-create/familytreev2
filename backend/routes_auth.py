"""
Authentication routes
"""
from flask import Blueprint, request
from schemas import UserRegister, UserLogin, UserResponse
from auth import hash_password, verify_password, create_token, generate_response, token_required
from supabase_client import supabase_db
import uuid

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        user_data = UserRegister(**data)
        
        # Check if user already exists
        existing = supabase_db.query('users', {'email': user_data.email})
        if existing.data:
            return generate_response(False, 'Email already registered', status_code=400)
        
        # Create user
        new_user = {
            'id': str(uuid.uuid4()),
            'email': user_data.email,
            'password_hash': hash_password(user_data.password),
            'family_name': user_data.family_name,
            'is_admin': False
        }
        
        result = supabase_db.insert('users', new_user)
        user = result.data[0] if result.data else None
        
        if user:
            token = create_token(user['id'], user['email'])
            return generate_response(
                True, 
                'User registered successfully',
                {'token': token, 'user': UserResponse(**user).dict()},
                status_code=201
            )
        
        return generate_response(False, 'Error creating user', status_code=500)
    
    except ValueError as e:
        return generate_response(False, str(e), status_code=400)
    except Exception as e:
        return generate_response(False, f'Error: {str(e)}', status_code=500)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        user_data = UserLogin(**data)
        
        # Get user from database
        result = supabase_db.query('users', {'email': user_data.email})
        user = result.data[0] if result.data else None
        
        if not user or not verify_password(user_data.password, user['password_hash']):
            return generate_response(False, 'Invalid email or password', status_code=401)
        
        token = create_token(user['id'], user['email'], user.get('is_admin', False))
        
        return generate_response(
            True,
            'Login successful',
            {'token': token, 'user': UserResponse(**user).dict()}
        )
    
    except ValueError as e:
        return generate_response(False, str(e), status_code=400)
    except Exception as e:
        return generate_response(False, f'Error: {str(e)}', status_code=500)

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user_id):
    """Get current user info"""
    try:
        result = supabase_db.query('users', {'id': current_user_id})
        user = result.data[0] if result.data else None
        
        if not user:
            return generate_response(False, 'User not found', status_code=404)
        
        return generate_response(
            True,
            'User retrieved successfully',
            UserResponse(**user).dict()
        )
    
    except Exception as e:
        return generate_response(False, f'Error: {str(e)}', status_code=500)
