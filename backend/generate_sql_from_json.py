#!/usr/bin/env python3
"""
Script to generate SQL INSERT statements for locations and opening hours
from JSON data.

Usage:
    python generate_sql_from_json.py < input.json > output.sql
    OR
    python generate_sql_from_json.py --file locations.json > output.sql
"""

import json
import sys
import argparse
from datetime import datetime

def escape_sql(value):
    """Escape SQL string values"""
    if value is None:
        return 'NULL'
    if isinstance(value, (int, float, bool)):
        return str(value)
    # Escape single quotes and backslashes
    return "'" + str(value).replace("'", "''").replace("\\", "\\\\") + "'"

def format_json_for_sql(data):
    """Format JSON array for SQL"""
    return escape_sql(json.dumps(data, ensure_ascii=False))

def format_date(date_str):
    """Format date string for SQL"""
    if not date_str:
        return 'NULL'
    # Convert ISO format to SQL datetime format
    try:
        dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return escape_sql(dt.strftime('%Y-%m-%d %H:%M:%S'))
    except:
        return escape_sql(date_str.replace('T', ' ').replace('Z', ''))

def generate_sql(locations_data):
    """Generate SQL INSERT statements"""
    
    locations = locations_data.get('data', locations_data) if isinstance(locations_data, dict) else locations_data
    
    sql_parts = []
    
    # Header
    sql_parts.append("""-- SQL Script to Insert Locations and Opening Hours into Stage Database
-- Generated automatically from JSON data
-- Total Locations: {}

-- ============================================
-- INSERT LOCATIONS
-- ============================================

INSERT INTO `locations` (
    `name_en`, `name_ae`, `address_en`, `address_ae`, `status`, `order`, 
    `buffer_hours`, `pickup`, `dropoff`, `is_virtual`, `recipients`, 
    `lat`, `long`, `contact_number`, `timing_detail_en`, `timing_detail_ae`, 
    `parking_charges`, `emirate_id`, `created_by`, `updated_by`, `deleted_by`, 
    `created_at`, `updated_at`, `deleted_at`
) VALUES
""".format(len(locations)))
    
    # Location values
    location_values = []
    for loc in locations:
        values = [
            escape_sql(loc.get('name_en', '')),
            escape_sql(loc.get('name_ae', '')),
            escape_sql(loc.get('address_en', '')),
            escape_sql(loc.get('address_ae', '')),
            loc.get('status', 0),
            loc.get('order', 0),
            loc.get('buffer_hours', 0),
            loc.get('pickup', 0),
            loc.get('dropoff', 0),
            loc.get('is_virtual', 0),
            format_json_for_sql(loc.get('recipients', [])),
            escape_sql(loc.get('lat', '0')),
            escape_sql(loc.get('long', '0')),
            escape_sql(loc.get('contact_number', '')),
            escape_sql(loc.get('timing_detail_en', '')),
            escape_sql(loc.get('timing_detail_ae', '')),
            loc.get('parking_charges', 0),
            loc.get('emirate_id', 0),
            loc.get('created_by', 1),
            loc.get('updated_by') if loc.get('updated_by') else 'NULL',
            'NULL' if not loc.get('deleted_by') else loc.get('deleted_by'),
            format_date(loc.get('created_at')),
            format_date(loc.get('updated_at')),
            'NULL' if not loc.get('deleted_at') else format_date(loc.get('deleted_at'))
        ]
        location_values.append("({})".format(', '.join(str(v) for v in values)))
    
    sql_parts.append(',\n'.join(location_values) + ';\n\n')
    
    # Opening hours section
    sql_parts.append("""-- ============================================
-- INSERT LOCATION OPENING HOURS
-- ============================================
-- Note: Day mapping: 1=Sunday, 2=Monday, 3=Tuesday, 4=Wednesday, 5=Thursday, 6=Friday, 7=Saturday
-- Opening hours array order: [Sunday(shift1,shift2), Monday(shift1,shift2), ..., Saturday(shift1,shift2)]
-- IMPORTANT: Replace @LOCATION_ID_PLACEHOLDER with actual location IDs after inserting locations
-- You can use: SET @location_id = LAST_INSERT_ID(); after each location insert

INSERT INTO `location_opening_hours` (
    `day`, `shift`, `from_hours`, `to_hours`, `is_closed`, 
    `location_id`, `created_by`, `updated_by`, `deleted_by`, 
    `created_at`, `updated_at`, `deleted_at`
) VALUES
""")
    
    # Opening hours values
    opening_hours_values = []
    for loc in locations:
        location_id = loc.get('id', 0)  # Use original ID
        hours = loc.get('location_opening_hours', [])
        
        # Map array indices to days (0-1: Sunday, 2-3: Monday, etc.)
        for hour_index, hour in enumerate(hours):
            day = (hour_index // 2) + 1  # 1-7 for Sunday-Saturday
            shift = (hour_index % 2) + 1  # 1 or 2
            from_hours = hour.get('from_hours', 0)
            to_hours = hour.get('to_hours', 0)
            is_closed = 1 if (from_hours == 0 and to_hours == 0) else 0
            
            values = [
                day,
                hour.get('shift', shift),
                from_hours,
                to_hours,
                is_closed,
                location_id,  # Will need to be updated
                loc.get('created_by', 1),
                loc.get('updated_by') if loc.get('updated_by') else 'NULL',
                'NULL' if not loc.get('deleted_by') else loc.get('deleted_by'),
                format_date(loc.get('created_at')),
                format_date(loc.get('updated_at')),
                'NULL' if not loc.get('deleted_at') else format_date(loc.get('deleted_at'))
            ]
            opening_hours_values.append("({})".format(', '.join(str(v) for v in values)))
    
    sql_parts.append(',\n'.join(opening_hours_values) + ';\n')
    
    return ''.join(sql_parts)

def main():
    parser = argparse.ArgumentParser(description='Generate SQL from JSON location data')
    parser.add_argument('--file', '-f', help='Input JSON file (default: stdin)')
    parser.add_argument('--preserve-ids', action='store_true', 
                       help='Preserve original location IDs in opening hours')
    
    args = parser.parse_args()
    
    # Read JSON data
    if args.file:
        with open(args.file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        data = json.load(sys.stdin)
    
    # Generate SQL
    sql = generate_sql(data)
    print(sql)

if __name__ == '__main__':
    main()



