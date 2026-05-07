"""
Change logs and admin routes
"""
from flask import Blueprint, request
from schemas import ChangeLogResponse
from auth import token_required, admin_required, generate_response
from supabase_client import supabase_db

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/changes', methods=['GET'])
@admin_required
def get_all_changes(current_user_id):
    """Get all changes (admin only)"""
    try:
        result = supabase_db.supabase.table('change_logs')\
            .select('*')\
            .order('created_at', desc=True)\
            .execute()
        
        changes = result.data or []
        
        return generate_response(
            True,
            'Changes retrieved',
            {'changes': changes, 'count': len(changes)}
        )
    
    except Exception as e:
        return generate_response(False, f'Error: {str(e)}', status_code=500)

@admin_bp.route('/changes/user/<user_id>', methods=['GET'])
@admin_required
def get_user_changes(current_user_id, user_id):
    """Get changes by specific user (admin only)"""
    try:
        result = supabase_db.supabase.table('change_logs')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('created_at', desc=True)\
            .execute()
        
        changes = result.data or []
        
        return generate_response(
            True,
            'Changes retrieved',
            {'changes': changes, 'count': len(changes), 'user_id': user_id}
        )
    
    except Exception as e:
        return generate_response(False, f'Error: {str(e)}', status_code=500)

@admin_bp.route('/changes/family/<family_id>', methods=['GET'])
@admin_required
def get_family_changes(current_user_id, family_id):
    """Get changes for specific family member (admin only)"""
    try:
        result = supabase_db.supabase.table('change_logs')\
            .select('*')\
            .eq('family_member_id', family_id)\
            .order('created_at', desc=True)\
            .execute()
        
        changes = result.data or []
        
        return generate_response(
            True,
            'Changes retrieved',
            {'changes': changes, 'count': len(changes), 'family_id': family_id}
        )
    
    except Exception as e:
        return generate_response(False, f'Error: {str(e)}', status_code=500)

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users(current_user_id):
    """Get all users (admin only)"""
    try:
        result = supabase_db.supabase.table('users')\
            .select('id,email,family_name,created_at,is_admin')\
            .execute()
        
        users = result.data or []
        
        return generate_response(
            True,
            'Users retrieved',
            {'users': users, 'count': len(users)}
        )
    
    except Exception as e:
        return generate_response(False, f'Error: {str(e)}', status_code=500)

@admin_bp.route('/users/<user_id>/admin', methods=['PUT'])
@admin_required
def toggle_admin(current_user_id, user_id):
    """Toggle admin status for user (admin only)"""
    try:
        if user_id == current_user_id:
            return generate_response(False, 'Cannot change your own admin status', status_code=400)
        
        # Get current user
        result = supabase_db.query('users', {'id': user_id})
        user = result.data[0] if result.data else None
        
        if not user:
            return generate_response(False, 'User not found', status_code=404)
        
        # Toggle admin status
        new_status = not user.get('is_admin', False)
        
        supabase_db.update('users', {'is_admin': new_status}, {'id': user_id})
        
        return generate_response(
            True,
            f'Admin status set to {new_status}',
            {'user_id': user_id, 'is_admin': new_status}
        )
    
    except Exception as e:
        return generate_response(False, f'Error: {str(e)}', status_code=500)

@admin_bp.route('/statistics', methods=['GET'])
@admin_required
def get_statistics(current_user_id):
    """Get application statistics (admin only)"""
    try:
        users_result = supabase_db.supabase.table('users').select('id').execute()
        members_result = supabase_db.supabase.table('family_members').select('id').execute()
        changes_result = supabase_db.supabase.table('change_logs').select('id').execute()
        
        stats = {
            'total_users': len(users_result.data or []),
            'total_family_members': len(members_result.data or []),
            'total_changes': len(changes_result.data or []),
            'timestamp': __import__('datetime').datetime.utcnow().isoformat()
        }
        
        return generate_response(True, 'Statistics retrieved', stats)
    
    except Exception as e:
        return generate_response(False, f'Error: {str(e)}', status_code=500)
