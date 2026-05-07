"""
Authentication and authorization utilities
"""
import bcrypt
from functools import wraps
from flask import request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
import uuid

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hash_value: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hash_value.encode('utf-8'))

def create_token(user_id: str, email: str, is_admin: bool = False) -> str:
    """Create JWT token"""
    return create_access_token(
        identity=user_id,
        additional_claims={
            'email': email,
            'is_admin': is_admin,
            'type': 'access'
        }
    )

def token_required(f):
    """Decorator for routes that require authentication"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        return f(current_user_id, *args, **kwargs)
    return decorated_function

def admin_required(f):
    """Decorator for routes that require admin"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        claims = get_jwt_claims()
        if not claims.get('is_admin', False):
            return jsonify({'error': 'Admin access required'}), 403
        return f(current_user_id, *args, **kwargs)
    return decorated_function

def generate_response(success: bool, message: str, data: dict = None, status_code: int = 200):
    """Generate standardized API response"""
    response = {
        'success': success,
        'message': message,
        'timestamp': datetime.utcnow().isoformat()
    }
    if data is not None:
        response['data'] = data
    return jsonify(response), status_code
