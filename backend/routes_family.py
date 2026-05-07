"""
Family member routes
"""
from flask import Blueprint, request
from schemas import FamilyMemberCreate, FamilyMemberUpdate, FamilyMemberResponse
from auth import token_required, generate_response
from supabase_client import supabase_db, supabase_storage
from datetime import datetime
import uuid
import json

family_bp = Blueprint('family', __name__, url_prefix='/api/family')


def get_owned_member(owner_id, member_id):
    """Fetch a family member owned by the current user."""
    result = supabase_db.query('family_members', {'id': member_id, 'owner_id': owner_id})
    return result.data[0] if result.data else None


def validate_relation_ids(owner_id, relation_map, current_member_id=None):
    """Ensure relation ids belong to the current user's tree."""
    for field_name, relation_id in relation_map.items():
        if not relation_id:
            continue

        if current_member_id and relation_id == current_member_id:
            raise ValueError(f'{field_name.replace("_", " ").title()} cannot reference the same person')

        related_member = get_owned_member(owner_id, relation_id)
        if not related_member:
            raise ValueError(f'Invalid {field_name.replace("_", " ")} selected')


def sync_spouse_relationship(owner_id, member_id, new_spouse_id=None, old_spouse_id=None):
    """Keep spouse links in sync on both sides."""
    timestamp = datetime.utcnow().isoformat()

    if old_spouse_id and old_spouse_id != new_spouse_id:
        old_spouse = get_owned_member(owner_id, old_spouse_id)
        if old_spouse and old_spouse.get('spouse_id') == member_id:
            supabase_db.update(
                'family_members',
                {'spouse_id': None, 'updated_at': timestamp},
                {'id': old_spouse_id, 'owner_id': owner_id}
            )

    if not new_spouse_id:
        return

    new_spouse = get_owned_member(owner_id, new_spouse_id)
    if not new_spouse:
        return

    previous_spouse_id = new_spouse.get('spouse_id')
    if previous_spouse_id and previous_spouse_id != member_id:
        previous_spouse = get_owned_member(owner_id, previous_spouse_id)
        if previous_spouse and previous_spouse.get('spouse_id') == new_spouse_id:
            supabase_db.update(
                'family_members',
                {'spouse_id': None, 'updated_at': timestamp},
                {'id': previous_spouse_id, 'owner_id': owner_id}
            )

    supabase_db.update(
        'family_members',
        {'spouse_id': member_id, 'updated_at': timestamp},
        {'id': new_spouse_id, 'owner_id': owner_id}
    )


def update_member_children(owner_id, member, children_ids):
    """Assign the current member as parent for the selected children."""
    parent_field = 'father_id' if member.get('gender') == 'male' else 'mother_id'
    children_ids = children_ids or []

    if member['id'] in children_ids:
        raise ValueError('A family member cannot be their own child')

    all_members = supabase_db.query('family_members', {'owner_id': owner_id}).data or []
    member_lookup = {item['id']: item for item in all_members}

    for child_id in children_ids:
        if child_id not in member_lookup:
            raise ValueError('Invalid child selected')

    timestamp = datetime.utcnow().isoformat()
    existing_children = [item for item in all_members if item.get(parent_field) == member['id']]
    selected_children = set(children_ids)

    for child in existing_children:
        if child['id'] not in selected_children:
            supabase_db.update(
                'family_members',
                {parent_field: None, 'updated_at': timestamp},
                {'id': child['id'], 'owner_id': owner_id}
            )

    for child_id in selected_children:
        supabase_db.update(
            'family_members',
            {parent_field: member['id'], 'updated_at': timestamp},
            {'id': child_id, 'owner_id': owner_id}
        )


def update_member_siblings(owner_id, member, sibling_ids):
    """Link siblings by syncing shared parents where possible."""
    sibling_ids = sibling_ids or []
    if not sibling_ids:
        return

    if member['id'] in sibling_ids:
        raise ValueError('A family member cannot be their own sibling')

    all_members = supabase_db.query('family_members', {'owner_id': owner_id}).data or []
    member_lookup = {item['id']: item for item in all_members}

    for sibling_id in sibling_ids:
        if sibling_id not in member_lookup:
            raise ValueError('Invalid sibling selected')

    resolved_father_id = member.get('father_id')
    resolved_mother_id = member.get('mother_id')

    for sibling_id in sibling_ids:
        sibling = member_lookup[sibling_id]

        sibling_father_id = sibling.get('father_id')
        sibling_mother_id = sibling.get('mother_id')

        if resolved_father_id and sibling_father_id and resolved_father_id != sibling_father_id:
            raise ValueError('Selected siblings have conflicting father relationships')
        if resolved_mother_id and sibling_mother_id and resolved_mother_id != sibling_mother_id:
            raise ValueError('Selected siblings have conflicting mother relationships')

        resolved_father_id = resolved_father_id or sibling_father_id
        resolved_mother_id = resolved_mother_id or sibling_mother_id

    if not resolved_father_id and not resolved_mother_id:
        raise ValueError('Link at least one parent first before connecting siblings')

    timestamp = datetime.utcnow().isoformat()
    current_updates = {'updated_at': timestamp}
    if resolved_father_id:
        current_updates['father_id'] = resolved_father_id
    if resolved_mother_id:
        current_updates['mother_id'] = resolved_mother_id

    supabase_db.update('family_members', current_updates, {'id': member['id'], 'owner_id': owner_id})

    for sibling_id in sibling_ids:
        sibling_updates = {'updated_at': timestamp}
        if resolved_father_id:
            sibling_updates['father_id'] = resolved_father_id
        if resolved_mother_id:
            sibling_updates['mother_id'] = resolved_mother_id
        supabase_db.update('family_members', sibling_updates, {'id': sibling_id, 'owner_id': owner_id})

@family_bp.route('/members', methods=['GET'])
@token_required
def get_family_members(current_user_id):
    """Get all family members for current user"""
    try:
        result = supabase_db.query('family_members', {'owner_id': current_user_id})
        members = result.data or []
        
        return generate_response(
            True,
            'Family members retrieved successfully',
            {'members': members, 'count': len(members)}
        )
    
    except Exception as e:
        return generate_response(False, f'Error: {str(e)}', status_code=500)

@family_bp.route('/members/<member_id>', methods=['GET'])
@token_required
def get_family_member(current_user_id, member_id):
    """Get specific family member"""
    try:
        result = supabase_db.query(
            'family_members',
            {'id': member_id, 'owner_id': current_user_id}
        )
        member = result.data[0] if result.data else None
        
        if not member:
            return generate_response(False, 'Family member not found', status_code=404)
        
        return generate_response(True, 'Family member retrieved', member)
    
    except Exception as e:
        return generate_response(False, f'Error: {str(e)}', status_code=500)

@family_bp.route('/members', methods=['POST'])
@token_required
def create_family_member(current_user_id):
    """Create new family member"""
    try:
        data = request.get_json()
        print(f'Received data from frontend: {data}')
        
        # Validate required fields
        if not data or not data.get('first_name'):
            return generate_response(False, 'First name is required', status_code=400)
        
        try:
            member_data = FamilyMemberCreate(**data)
        except Exception as e:
            error_msg = str(e)
            print(f'Validation error: {error_msg}')
            return generate_response(False, f'Validation error: {error_msg}', status_code=400)

        validate_relation_ids(
            current_user_id,
            {
                'father_id': member_data.father_id,
                'mother_id': member_data.mother_id,
                'spouse_id': member_data.spouse_id
            }
        )
        
        new_member = {
            'id': str(uuid.uuid4()),
            'owner_id': current_user_id,
            'first_name': member_data.first_name,
            'last_name': member_data.last_name,
            'gender': member_data.gender.value,
            'date_of_birth': member_data.date_of_birth,
            'birth_year': member_data.birth_year,
            'birth_place': member_data.birth_place,
            'status': member_data.status.value,
            'death_year': member_data.death_year,
            'biography': member_data.biography,
            'father_id': member_data.father_id,
            'mother_id': member_data.mother_id,
            'spouse_id': member_data.spouse_id,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Remove None values before sending to database
        new_member = {k: v for k, v in new_member.items() if v is not None}
        
        result = supabase_db.insert('family_members', new_member)
        member = result.data[0] if result.data else None
        
        if member:
            sync_spouse_relationship(
                current_user_id,
                member['id'],
                member.get('spouse_id')
            )
            # Log change
            log_change(current_user_id, member['id'], 'create', None, new_member)
            return generate_response(
                True,
                'Family member created',
                member,
                status_code=201
            )
        
        return generate_response(False, 'Error creating member', status_code=500)
    
    except ValueError as e:
        return generate_response(False, str(e), status_code=400)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return generate_response(False, f'Error: {str(e)}', status_code=500)

@family_bp.route('/members/<member_id>', methods=['PUT'])
@token_required
def update_family_member(current_user_id, member_id):
    """Update family member"""
    try:
        # Verify ownership
        result = supabase_db.query(
            'family_members',
            {'id': member_id, 'owner_id': current_user_id}
        )
        old_member = result.data[0] if result.data else None
        
        if not old_member:
            return generate_response(False, 'Family member not found', status_code=404)
        
        data = request.get_json()
        member_data = FamilyMemberUpdate(**data)

        relation_updates = {
            key: value
            for key, value in {
                'father_id': member_data.father_id,
                'mother_id': member_data.mother_id,
                'spouse_id': member_data.spouse_id
            }.items()
            if key in data
        }
        validate_relation_ids(current_user_id, relation_updates, member_id)
        
        update_data = {
            k: v.value if hasattr(v, 'value') else v
            for k, v in member_data.dict(exclude_unset=True).items()
        }
        update_data['updated_at'] = datetime.utcnow().isoformat()
        
        result = supabase_db.update(
            'family_members',
            update_data,
            {'id': member_id}
        )
        member = result.data[0] if result.data else old_member

        if 'spouse_id' in update_data:
            sync_spouse_relationship(
                current_user_id,
                member_id,
                update_data.get('spouse_id'),
                old_member.get('spouse_id')
            )
        
        # Log change
        log_change(current_user_id, member_id, 'update', old_member, update_data)
        
        return generate_response(True, 'Family member updated', member)
    
    except ValueError as e:
        return generate_response(False, str(e), status_code=400)
    except Exception as e:
        return generate_response(False, f'Error: {str(e)}', status_code=500)

@family_bp.route('/members/<member_id>', methods=['DELETE'])
@token_required
def delete_family_member(current_user_id, member_id):
    """Delete family member"""
    try:
        # Verify ownership
        result = supabase_db.query(
            'family_members',
            {'id': member_id, 'owner_id': current_user_id}
        )
        member = result.data[0] if result.data else None
        
        if not member:
            return generate_response(False, 'Family member not found', status_code=404)
        
        # Delete photo if exists
        if member.get('photo_url'):
            supabase_storage.delete_photo(member['photo_url'])
        
        supabase_db.delete('family_members', {'id': member_id})
        
        # Log change
        log_change(current_user_id, member_id, 'delete', member, None)
        
        return generate_response(True, 'Family member deleted')
    
    except Exception as e:
        return generate_response(False, f'Error: {str(e)}', status_code=500)

@family_bp.route('/members/<member_id>/photo', methods=['POST'])
@token_required
def upload_photo(current_user_id, member_id):
    """Upload photo for family member"""
    try:
        # Verify ownership
        result = supabase_db.query(
            'family_members',
            {'id': member_id, 'owner_id': current_user_id}
        )
        member = result.data[0] if result.data else None
        
        if not member:
            return generate_response(False, 'Family member not found', status_code=404)
        
        if 'file' not in request.files:
            return generate_response(False, 'No file provided', status_code=400)
        
        file = request.files['file']
        if file.filename == '':
            return generate_response(False, 'No file selected', status_code=400)
        
        print(f'Received file: {file.filename}')
        
        # Upload to Supabase Storage
        photo_url = supabase_storage.upload_photo(file)
        
        if photo_url:
            print(f'Upload successful, updating database')
            supabase_db.update(
                'family_members',
                {'photo_url': photo_url, 'updated_at': datetime.utcnow().isoformat()},
                {'id': member_id}
            )
            return generate_response(
                True,
                'Photo uploaded',
                {'photo_url': photo_url}
            )
        
        print(f'Upload failed - photo_url is None')
        return generate_response(False, 'Error uploading photo to storage', status_code=500)
    except Exception as e:
        print(f'Photo upload error: {str(e)}')
        import traceback
        traceback.print_exc()
        return generate_response(False, f'Upload error: {str(e)}', status_code=500)
    
    except Exception as e:
        return generate_response(False, f'Error: {str(e)}', status_code=500)

@family_bp.route('/members/<member_id>/children', methods=['PUT'])
@token_required
def update_children(current_user_id, member_id):
    """Assign children to a family member."""
    try:
        member = get_owned_member(current_user_id, member_id)
        if not member:
            return generate_response(False, 'Family member not found', status_code=404)

        data = request.get_json() or {}
        children_ids = data.get('children_ids', [])
        if not isinstance(children_ids, list):
            return generate_response(False, 'children_ids must be a list', status_code=400)

        update_member_children(current_user_id, member, children_ids)

        refreshed_members = supabase_db.query('family_members', {'owner_id': current_user_id}).data or []
        children = [
            item for item in refreshed_members
            if item.get('father_id') == member_id or item.get('mother_id') == member_id
        ]

        log_change(
            current_user_id,
            member_id,
            'update',
            None,
            {'children_ids': children_ids}
        )

        return generate_response(
            True,
            'Children updated',
            {'children': children, 'children_ids': [child['id'] for child in children]}
        )

    except ValueError as e:
        return generate_response(False, str(e), status_code=400)
    except Exception as e:
        return generate_response(False, f'Error: {str(e)}', status_code=500)


@family_bp.route('/members/<member_id>/siblings', methods=['PUT'])
@token_required
def update_siblings(current_user_id, member_id):
    """Assign siblings by syncing shared parent relationships."""
    try:
        member = get_owned_member(current_user_id, member_id)
        if not member:
            return generate_response(False, 'Family member not found', status_code=404)

        data = request.get_json() or {}
        sibling_ids = data.get('sibling_ids', [])
        if not isinstance(sibling_ids, list):
            return generate_response(False, 'sibling_ids must be a list', status_code=400)

        update_member_siblings(current_user_id, member, sibling_ids)

        refreshed_members = supabase_db.query('family_members', {'owner_id': current_user_id}).data or []
        refreshed_member = next((item for item in refreshed_members if item['id'] == member_id), None)
        siblings = []

        if refreshed_member:
            siblings = [
                item for item in refreshed_members
                if item['id'] != member_id and (
                    (refreshed_member.get('father_id') and item.get('father_id') == refreshed_member.get('father_id')) or
                    (refreshed_member.get('mother_id') and item.get('mother_id') == refreshed_member.get('mother_id'))
                )
            ]

        log_change(
            current_user_id,
            member_id,
            'update',
            None,
            {'sibling_ids': sibling_ids}
        )

        return generate_response(
            True,
            'Siblings updated',
            {'siblings': siblings, 'sibling_ids': [item['id'] for item in siblings]}
        )

    except ValueError as e:
        return generate_response(False, str(e), status_code=400)
    except Exception as e:
        return generate_response(False, f'Error: {str(e)}', status_code=500)

@family_bp.route('/tree', methods=['GET'])
@token_required
def get_family_tree(current_user_id):
    """Get hierarchical family tree"""
    try:
        result = supabase_db.query('family_members', {'owner_id': current_user_id})
        members = result.data or []
        
        # Find root members (no parents)
        roots = [m for m in members if not m.get('father_id') and not m.get('mother_id')]
        
        def build_tree(member):
            return {
                'id': member['id'],
                'name': f"{member['first_name']} {member.get('last_name', '')}".strip(),
                'gender': member['gender'],
                'birth_year': member.get('birth_year'),
                'death_year': member.get('death_year'),
                'photo_url': member.get('photo_url'),
                'status': member['status'],
                'children': [
                    build_tree(m) for m in members
                    if m.get('father_id') == member['id'] or m.get('mother_id') == member['id']
                ]
            }
        
        tree = [build_tree(root) for root in roots]
        
        return generate_response(
            True,
            'Family tree retrieved',
            {'tree': tree}
        )
    
    except Exception as e:
        return generate_response(False, f'Error: {str(e)}', status_code=500)

def log_change(user_id, member_id, action, old_values, new_values):
    """Log changes to change_logs table"""
    try:
        log_entry = {
            'id': str(uuid.uuid4()),
            'user_id': user_id,
            'family_member_id': member_id,
            'action': action,
            'old_values': json.dumps(old_values) if old_values else None,
            'new_values': json.dumps(new_values) if new_values else None,
            'created_at': datetime.utcnow().isoformat()
        }
        supabase_db.insert('change_logs', log_entry)
    except Exception as e:
        print(f'Error logging change: {str(e)}')
