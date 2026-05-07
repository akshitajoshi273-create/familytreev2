"""
Locations (Indian cities/villages) routes
"""
from flask import Blueprint, request
from schemas import LocationCreate, LocationResponse
from auth import token_required, generate_response
from supabase_client import supabase_db
import uuid

locations_bp = Blueprint('locations', __name__, url_prefix='/api/locations')

@locations_bp.route('/search', methods=['GET'])
def search_locations():
    """Search for Indian locations by name"""
    try:
        query = request.args.get('q', '').strip()
        
        if len(query) < 2:
            return generate_response(False, 'Query must be at least 2 characters', status_code=400)
        
        # Search for locations matching the query
        result = supabase_db.supabase.table('locations')\
            .select('*')\
            .ilike('name', f'%{query}%')\
            .limit(10)\
            .execute()
        
        locations = result.data or []
        
        # Prioritize "Mandsaur" if it matches
        sorted_locations = sorted(
            locations,
            key=lambda x: (x['name'] != 'Mandsaur', x['name'].lower() != query.lower(), x['name'])
        )
        
        return generate_response(
            True,
            'Locations retrieved',
            {'locations': sorted_locations[:10]}
        )
    
    except Exception as e:
        return generate_response(False, f'Error: {str(e)}', status_code=500)

@locations_bp.route('/all', methods=['GET'])
def get_all_locations():
    """Get all locations (paginated)"""
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 50, type=int)
        offset = (page - 1) * limit
        
        result = supabase_db.supabase.table('locations')\
            .select('*')\
            .range(offset, offset + limit - 1)\
            .execute()
        
        locations = result.data or []
        
        return generate_response(
            True,
            'Locations retrieved',
            {'locations': locations, 'page': page, 'limit': limit}
        )
    
    except Exception as e:
        return generate_response(False, f'Error: {str(e)}', status_code=500)

@locations_bp.route('/by-state/<state>', methods=['GET'])
def get_locations_by_state(state):
    """Get locations by state"""
    try:
        result = supabase_db.supabase.table('locations')\
            .select('*')\
            .eq('state', state)\
            .execute()
        
        locations = result.data or []
        
        return generate_response(
            True,
            'Locations retrieved',
            {'locations': locations, 'state': state}
        )
    
    except Exception as e:
        return generate_response(False, f'Error: {str(e)}', status_code=500)

@locations_bp.route('/states', methods=['GET'])
def get_all_states():
    """Get list of all Indian states"""
    try:
        result = supabase_db.supabase.table('locations')\
            .select('state')\
            .execute()
        
        states = sorted(list(set([loc['state'] for loc in (result.data or [])])))
        
        return generate_response(
            True,
            'States retrieved',
            {'states': states, 'count': len(states)}
        )
    
    except Exception as e:
        return generate_response(False, f'Error: {str(e)}', status_code=500)
