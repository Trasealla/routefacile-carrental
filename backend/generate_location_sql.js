// Script to generate SQL INSERT statements for locations and opening hours
// Usage: node generate_location_sql.js > insert_locations_stage.sql

const data = {
    "data": [
        // ... (all the location data from the user)
    ]
};

// Since the data is too large, I'll create a template function
// You should paste the JSON data here or load it from a file

function escapeSQL(str) {
    if (str === null || str === undefined) return 'NULL';
    return "'" + String(str).replace(/'/g, "''").replace(/\\/g, "\\\\") + "'";
}

function formatJSONForSQL(jsonArray) {
    return escapeSQL(JSON.stringify(jsonArray));
}

function formatDate(dateStr) {
    if (!dateStr) return 'NULL';
    return escapeSQL(dateStr.replace('T', ' ').replace('Z', ''));
}

function generateLocationSQL(locations) {
    let sql = `-- SQL Script to Insert Locations and Opening Hours into Stage Database
-- Generated automatically from API data
-- Total Locations: ${locations.length}

-- ============================================
-- INSERT LOCATIONS
-- ============================================

INSERT INTO \`locations\` (
    \`name_en\`, \`name_ae\`, \`address_en\`, \`address_ae\`, \`status\`, \`order\`, 
    \`buffer_hours\`, \`pickup\`, \`dropoff\`, \`is_virtual\`, \`recipients\`, 
    \`lat\`, \`long\`, \`contact_number\`, \`timing_detail_en\`, \`timing_detail_ae\`, 
    \`parking_charges\`, \`emirate_id\`, \`created_by\`, \`updated_by\`, \`deleted_by\`, 
    \`created_at\`, \`updated_at\`, \`deleted_at\`
) VALUES
`;

    const locationValues = locations.map((loc, index) => {
        const values = [
            escapeSQL(loc.name_en),
            escapeSQL(loc.name_ae),
            escapeSQL(loc.address_en),
            escapeSQL(loc.address_ae),
            loc.status,
            loc.order,
            loc.buffer_hours,
            loc.pickup,
            loc.dropoff,
            loc.is_virtual,
            formatJSONForSQL(loc.recipients),
            escapeSQL(loc.lat),
            escapeSQL(loc.long),
            escapeSQL(loc.contact_number),
            escapeSQL(loc.timing_detail_en),
            escapeSQL(loc.timing_detail_ae),
            loc.parking_charges,
            loc.emirate_id,
            loc.created_by,
            loc.updated_by || 'NULL',
            loc.deleted_by || 'NULL',
            formatDate(loc.created_at),
            formatDate(loc.updated_at),
            formatDate(loc.deleted_at)
        ];
        return `(${values.join(', ')})`;
    });

    sql += locationValues.join(',\n') + ';\n\n';

    // Generate opening hours SQL
    sql += `-- ============================================
-- INSERT LOCATION OPENING HOURS
-- ============================================
-- Note: Day mapping: 1=Sunday, 2=Monday, 3=Tuesday, 4=Wednesday, 5=Thursday, 6=Friday, 7=Saturday
-- Opening hours array order: [Sunday(shift1,shift2), Monday(shift1,shift2), ..., Saturday(shift1,shift2)]
-- Each location has 14 opening hours (7 days × 2 shifts)

INSERT INTO \`location_opening_hours\` (
    \`day\`, \`shift\`, \`from_hours\`, \`to_hours\`, \`is_closed\`, 
    \`location_id\`, \`created_by\`, \`updated_by\`, \`deleted_by\`, 
    \`created_at\`, \`updated_at\`, \`deleted_at\`
) VALUES
`;

    const openingHoursValues = [];
    
    locations.forEach((loc, locIndex) => {
        const locationId = loc.id; // Use original ID or generate new one
        const hours = loc.location_opening_hours || [];
        
        // Map array indices to days (0-1: Sunday, 2-3: Monday, etc.)
        hours.forEach((hour, hourIndex) => {
            const day = Math.floor(hourIndex / 2) + 1; // 1-7 for Sunday-Saturday
            const shift = (hourIndex % 2) + 1; // 1 or 2
            const isClosed = (hour.from_hours === 0 && hour.to_hours === 0) ? 1 : 0;
            
            const values = [
                day,
                hour.shift || shift,
                hour.from_hours,
                hour.to_hours,
                isClosed,
                locationId, // This will need to be updated after locations are inserted
                loc.created_by,
                loc.updated_by || 'NULL',
                loc.deleted_by || 'NULL',
                formatDate(loc.created_at),
                formatDate(loc.updated_at),
                formatDate(loc.deleted_at)
            ];
            
            openingHoursValues.push(`(${values.join(', ')})`);
        });
    });

    sql += openingHoursValues.join(',\n') + ';\n';

    return sql;
}

// If running as script, expect JSON input
if (require.main === module) {
    const fs = require('fs');
    const path = require('path');
    
    // Try to read from locations.json file or use provided data
    let locationsData;
    
    try {
        const jsonFile = path.join(__dirname, 'locations.json');
        if (fs.existsSync(jsonFile)) {
            locationsData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
        } else {
            console.error('Please create a locations.json file with the location data, or modify this script to include the data directly.');
            process.exit(1);
        }
    } catch (error) {
        console.error('Error reading locations.json:', error.message);
        process.exit(1);
    }
    
    const sql = generateLocationSQL(locationsData.data || locationsData);
    console.log(sql);
}

module.exports = { generateLocationSQL };



