/**
 * Vehicle-specific configuration data
 * Maps vehicle categories to their appropriate suspension types, trim levels, and gear ratios
 */

// Initialize empty database - will be populated if CSV loads successfully
let vehicleConfigDatabase = [];

/**
 * Parse CSV data into structured format
 */
function parseVehicleConfigCSV(csvText) {
  if (!csvText || csvText.trim() === '') {
    return [];
  }

  try {
    const lines = csvText.trim().split('\n');
    return lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        category: values[0],
        suspensionType: values[1],
        trimLevels: values[2].replace(/"/g, '').split(','),
        availableGearRatios: values[3].replace(/"/g, '').split(',').map(r => parseFloat(r)),
        notes: values[4] ? values[4].replace(/"/g, '') : ''
      };
    });
  } catch (error) {
    console.warn('Failed to parse vehicle configuration CSV:', error);
    return [];
  }
}

/**
 * Get the vehicle configuration database
 */
function getVehicleConfigDatabase() {
  return vehicleConfigDatabase;
}

// Try to load CSV data if in browser/Vite environment
if (typeof window !== 'undefined') {
  import('../data/vehicle-configurations.csv?raw')
    .then(module => {
      vehicleConfigDatabase = parseVehicleConfigCSV(module.default);
    })
    .catch(() => {
      // Import failed - keep empty database
      vehicleConfigDatabase = [];
    });
} else {
  // Node.js environment - use empty database for tests
  vehicleConfigDatabase = [];
}

/**
 * Get configuration for a specific vehicle category
 * @param {string} category - Vehicle category (tacoma, jeep, bronco, etc.)
 * @returns {Object|null} Configuration object or null if not found
 */
export function getVehicleConfig(category) {
  const database = getVehicleConfigDatabase();
  return database.find(config => config.category === category) || null;
}

/**
 * Get suspension type for a vehicle category
 * @param {string} category - Vehicle category
 * @returns {string} Suspension type ('ifs', 'solid_axle', 'independent_all')
 */
export function getSuspensionType(category) {
  const config = getVehicleConfig(category);
  return config ? config.suspensionType : 'ifs'; // Default to IFS if not found
}

/**
 * Get available gear ratios for a vehicle category
 * @param {string} category - Vehicle category
 * @returns {Array<number>} Array of available gear ratios
 */
export function getAvailableGearRatiosForVehicle(category) {
  const config = getVehicleConfig(category);
  return config ? config.availableGearRatios : [];
}

/**
 * Get trim levels for a vehicle category
 * @param {string} category - Vehicle category
 * @returns {Array<string>} Array of trim level names
 */
export function getTrimLevels(category) {
  const config = getVehicleConfig(category);
  return config ? config.trimLevels : [];
}

/**
 * Get suspension type display name
 * @param {string} type - Suspension type code
 * @returns {string} Human-readable name
 */
export function getSuspensionTypeLabel(type) {
  const labels = {
    'ifs': 'IFS (Independent Front, Solid Rear)',
    'solid_axle': 'Solid Axle (Front & Rear)',
    'independent_all': 'Independent (Front & Rear + Air)',
    'irs': 'IRS (Independent Rear Suspension)'
  };
  return labels[type] || type;
}

/**
 * Get all suspension types with labels
 * @returns {Array<Object>} Array of {value, label} objects
 */
export function getAllSuspensionTypes() {
  return [
    { value: 'ifs', label: 'IFS (Independent Front, Solid Rear)' },
    { value: 'solid_axle', label: 'Solid Axle (Front & Rear)' },
    { value: 'independent_all', label: 'Independent (Front & Rear + Air)' }
  ];
}
