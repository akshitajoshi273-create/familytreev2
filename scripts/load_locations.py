"""
Script to load Indian locations into the locations table.

Supports:
1. Built-in seed data for common places and all districts of
   Madhya Pradesh, Maharashtra, and Uttarakhand.
2. Optional CSV import for full town/village datasets, filtered to the
   three supported states.
"""
import argparse
import csv
import os
import sys
import uuid
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from supabase_client import supabase_db

TARGET_STATES = {'Madhya Pradesh', 'Maharashtra', 'Uttarakhand'}

STATE_DISTRICTS = {
    'Madhya Pradesh': [
        'Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani',
        'Betul', 'Bhind', 'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara', 'Damoh',
        'Datia', 'Dewas', 'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda', 'Indore',
        'Jabalpur', 'Jhabua', 'Katni', 'Khandwa', 'Khargone', 'Maihar', 'Mandla',
        'Mandsaur', 'Morena', 'Narmadapuram', 'Narsinghpur', 'Neemuch', 'Niwari',
        'Panna', 'Pandhurna', 'Raisen', 'Rajgarh', 'Ratlam', 'Rewa', 'Sagar',
        'Satna', 'Sehore', 'Seoni', 'Shahdol', 'Shajapur', 'Sheopur', 'Shivpuri',
        'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain', 'Umaria', 'Vidisha'
    ],
    'Maharashtra': [
        'Ahmednagar', 'Akola', 'Amravati', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur',
        'Chhatrapati Sambhajinagar', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli',
        'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban',
        'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Dharashiv', 'Palghar', 'Parbhani',
        'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur',
        'Thane', 'Wardha', 'Washim', 'Yavatmal'
    ],
    'Uttarakhand': [
        'Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Haridwar',
        'Nainital', 'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal',
        'Udham Singh Nagar', 'Uttarkashi'
    ]
}

BUILTIN_LOCATIONS = [
    {'name': 'Mandsaur', 'state': 'Madhya Pradesh', 'district': 'Mandsaur', 'location_type': 'city'},
    {'name': 'Indore', 'state': 'Madhya Pradesh', 'district': 'Indore', 'location_type': 'city'},
    {'name': 'Bhopal', 'state': 'Madhya Pradesh', 'district': 'Bhopal', 'location_type': 'city'},
    {'name': 'Gwalior', 'state': 'Madhya Pradesh', 'district': 'Gwalior', 'location_type': 'city'},
    {'name': 'Jabalpur', 'state': 'Madhya Pradesh', 'district': 'Jabalpur', 'location_type': 'city'},
    {'name': 'Ujjain', 'state': 'Madhya Pradesh', 'district': 'Ujjain', 'location_type': 'city'},
    {'name': 'Sagar', 'state': 'Madhya Pradesh', 'district': 'Sagar', 'location_type': 'city'},
    {'name': 'Satna', 'state': 'Madhya Pradesh', 'district': 'Satna', 'location_type': 'city'},
    {'name': 'Ratlam', 'state': 'Madhya Pradesh', 'district': 'Ratlam', 'location_type': 'city'},
    {'name': 'Rewa', 'state': 'Madhya Pradesh', 'district': 'Rewa', 'location_type': 'city'},
    {'name': 'Dewas', 'state': 'Madhya Pradesh', 'district': 'Dewas', 'location_type': 'city'},
    {'name': 'Chhindwara', 'state': 'Madhya Pradesh', 'district': 'Chhindwara', 'location_type': 'city'},
    {'name': 'Neemuch', 'state': 'Madhya Pradesh', 'district': 'Neemuch', 'location_type': 'town'},
    {'name': 'Sehore', 'state': 'Madhya Pradesh', 'district': 'Sehore', 'location_type': 'town'},
    {'name': 'Shivpuri', 'state': 'Madhya Pradesh', 'district': 'Shivpuri', 'location_type': 'town'},
    {'name': 'Khargone', 'state': 'Madhya Pradesh', 'district': 'Khargone', 'location_type': 'town'},
    {'name': 'Mumbai', 'state': 'Maharashtra', 'district': 'Mumbai City', 'location_type': 'city'},
    {'name': 'Navi Mumbai', 'state': 'Maharashtra', 'district': 'Thane', 'location_type': 'city'},
    {'name': 'Pune', 'state': 'Maharashtra', 'district': 'Pune', 'location_type': 'city'},
    {'name': 'Nagpur', 'state': 'Maharashtra', 'district': 'Nagpur', 'location_type': 'city'},
    {'name': 'Thane', 'state': 'Maharashtra', 'district': 'Thane', 'location_type': 'city'},
    {'name': 'Nashik', 'state': 'Maharashtra', 'district': 'Nashik', 'location_type': 'city'},
    {'name': 'Kolhapur', 'state': 'Maharashtra', 'district': 'Kolhapur', 'location_type': 'city'},
    {'name': 'Solapur', 'state': 'Maharashtra', 'district': 'Solapur', 'location_type': 'city'},
    {'name': 'Amravati', 'state': 'Maharashtra', 'district': 'Amravati', 'location_type': 'city'},
    {'name': 'Sangli', 'state': 'Maharashtra', 'district': 'Sangli', 'location_type': 'city'},
    {'name': 'Satara', 'state': 'Maharashtra', 'district': 'Satara', 'location_type': 'town'},
    {'name': 'Latur', 'state': 'Maharashtra', 'district': 'Latur', 'location_type': 'town'},
    {'name': 'Jalgaon', 'state': 'Maharashtra', 'district': 'Jalgaon', 'location_type': 'town'},
    {'name': 'Chandrapur', 'state': 'Maharashtra', 'district': 'Chandrapur', 'location_type': 'town'},
    {'name': 'Dehradun', 'state': 'Uttarakhand', 'district': 'Dehradun', 'location_type': 'city'},
    {'name': 'Haridwar', 'state': 'Uttarakhand', 'district': 'Haridwar', 'location_type': 'city'},
    {'name': 'Haldwani', 'state': 'Uttarakhand', 'district': 'Nainital', 'location_type': 'city'},
    {'name': 'Roorkee', 'state': 'Uttarakhand', 'district': 'Haridwar', 'location_type': 'city'},
    {'name': 'Rishikesh', 'state': 'Uttarakhand', 'district': 'Dehradun', 'location_type': 'city'},
    {'name': 'Kashipur', 'state': 'Uttarakhand', 'district': 'Udham Singh Nagar', 'location_type': 'town'},
    {'name': 'Rudrapur', 'state': 'Uttarakhand', 'district': 'Udham Singh Nagar', 'location_type': 'town'},
    {'name': 'Pithoragarh', 'state': 'Uttarakhand', 'district': 'Pithoragarh', 'location_type': 'town'},
    {'name': 'Almora', 'state': 'Uttarakhand', 'district': 'Almora', 'location_type': 'town'},
    {'name': 'Uttarkashi', 'state': 'Uttarakhand', 'district': 'Uttarkashi', 'location_type': 'town'},
]


def build_district_seed_rows():
    rows = []
    for state, districts in STATE_DISTRICTS.items():
        for district in districts:
            rows.append({
                'name': district,
                'state': state,
                'district': district,
                'location_type': 'district'
            })
    return rows


def normalize_record(name, state, district=None, location_type='village', latitude=None, longitude=None):
    return {
        'id': str(uuid.uuid4()),
        'name': name.strip(),
        'state': state.strip(),
        'district': (district or name).strip(),
        'latitude': latitude,
        'longitude': longitude,
        'location_type': location_type,
        'created_at': datetime.utcnow().isoformat()
    }


def seed_builtin_locations():
    records = []
    for row in BUILTIN_LOCATIONS + build_district_seed_rows():
        records.append(
            normalize_record(
                row['name'],
                row['state'],
                district=row.get('district'),
                location_type=row.get('location_type', 'city'),
                latitude=row.get('latitude'),
                longitude=row.get('longitude')
            )
        )
    return records


def detect_column(row, candidates):
    lower_map = {key.lower(): key for key in row.keys()}
    for candidate in candidates:
        if candidate.lower() in lower_map:
            return lower_map[candidate.lower()]
    return None


def import_locations_from_csv(csv_path, allowed_states=None):
    allowed_states = allowed_states or TARGET_STATES
    inserted = 0
    seen = set()

    with open(csv_path, 'r', encoding='utf-8-sig', newline='') as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            state_col = detect_column(row, ['state', 'state_name'])
            district_col = detect_column(row, ['district', 'district_name'])
            name_col = detect_column(row, ['village', 'village_name', 'town_name', 'city_name', 'name'])
            type_col = detect_column(row, ['location_type', 'type', 'entity_type', 'level'])

            if not state_col or not district_col or not name_col:
                raise ValueError('CSV must contain state, district, and place-name columns')

            state = (row.get(state_col) or '').strip()
            district = (row.get(district_col) or '').strip()
            name = (row.get(name_col) or '').strip()
            location_type = (row.get(type_col) or 'village').strip().lower()

            if not state or not district or not name or state not in allowed_states:
                continue

            dedupe_key = (name.lower(), state.lower(), district.lower(), location_type)
            if dedupe_key in seen:
                continue
            seen.add(dedupe_key)

            supabase_db.insert(
                'locations',
                normalize_record(name, state, district=district, location_type=location_type)
            )
            inserted += 1

    return inserted


def load_builtin_locations():
    print('Loading built-in location seed data...')
    inserted = 0
    seen = set()

    for record in seed_builtin_locations():
        dedupe_key = (
            record['name'].lower(),
            record['state'].lower(),
            record['district'].lower(),
            record['location_type']
        )
        if dedupe_key in seen:
            continue
        seen.add(dedupe_key)
        supabase_db.insert('locations', record)
        inserted += 1

    print(f'Inserted {inserted} built-in seed locations.')
    return inserted


def main():
    parser = argparse.ArgumentParser(description='Load Indian locations into Supabase.')
    parser.add_argument('--csv', help='Optional CSV path containing full location rows')
    args = parser.parse_args()

    try:
        load_builtin_locations()

        if args.csv:
            print(f'Importing full location dataset from {args.csv}...')
            inserted = import_locations_from_csv(args.csv)
            print(f'Inserted {inserted} CSV locations for {", ".join(sorted(TARGET_STATES))}.')

        print('Location loading completed successfully.')
    except Exception as exc:
        print(f'Error loading locations: {exc}')
        raise


if __name__ == '__main__':
    main()
