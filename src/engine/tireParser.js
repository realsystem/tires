/**
 * Tire Size Parser
 * Handles P-metric, LT-metric, and Flotation tire size formats
 * Built for off-road and overland tire calculations
 */

/**
 * Parse tire size string into normalized format
 * Supports:
 * - P-metric: 265/70R17, P265/70R17
 * - LT-metric: LT285/75R16, LT315/70R17
 * - Flotation: 35x12.50R17, 37x13.50R17, 33x10.50-15
 *
 * @param {string} sizeString - Tire size string
 * @returns {Object} Parsed tire dimensions
 */
export function parseTireSize(sizeString) {
  if (!sizeString || typeof sizeString !== 'string') {
    throw new Error('Invalid tire size string');
  }

  const normalized = sizeString.trim().toUpperCase();

  // Try flotation format first: 35x12.50R17 or 35x12.50-15
  const flotationMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*X\s*(\d+(?:\.\d+)?)(?:R|-)(\d+(?:\.\d+)?)/);
  if (flotationMatch) {
    return parseFlotationSize(flotationMatch);
  }

  // Try P-metric or LT-metric: 265/70R17, P265/70R17, LT285/75R16
  const metricMatch = normalized.match(/^(?:P|LT)?(\d+)\/(\d+)R(\d+(?:\.\d+)?)/);
  if (metricMatch) {
    return parseMetricSize(metricMatch, normalized.startsWith('LT'));
  }

  throw new Error(`Unable to parse tire size: ${sizeString}. Supported formats: 265/70R17, LT285/75R16, 35x12.50R17`);
}

/**
 * Parse metric tire size (P-metric, LT-metric)
 */
function parseMetricSize(match, isLT) {
  const width = parseInt(match[1], 10); // Section width in mm
  const aspectRatio = parseInt(match[2], 10); // Aspect ratio percentage
  const wheelDiameter = parseFloat(match[3]); // Wheel diameter in inches

  // Calculate sidewall height in mm
  const sidewallMm = (width * aspectRatio) / 100;

  // Calculate overall diameter in inches
  // Formula: ((Width × Aspect Ratio × 2) / 25.4) + Wheel Diameter
  const diameterInches = ((width * aspectRatio * 2) / 100 / 25.4) + wheelDiameter;

  return {
    format: isLT ? 'LT-metric' : 'P-metric',
    width: width, // mm
    aspectRatio: aspectRatio, // percentage
    wheelDiameter: wheelDiameter, // inches
    sidewallHeight: sidewallMm, // mm
    sidewallInches: sidewallMm / 25.4,
    diameter: diameterInches, // inches
    diameterMm: diameterInches * 25.4,
    isLT: isLT,
    raw: match[0]
  };
}

/**
 * Parse flotation tire size
 */
function parseFlotationSize(match) {
  const diameterInches = parseFloat(match[1]); // Overall diameter
  const widthInches = parseFloat(match[2]); // Section width
  const wheelDiameter = parseFloat(match[3]); // Wheel diameter

  // Calculate sidewall height
  const sidewallInches = (diameterInches - wheelDiameter) / 2;

  // Calculate aspect ratio equivalent
  const widthMm = widthInches * 25.4;
  const aspectRatio = Math.round((sidewallInches * 25.4 / widthMm) * 100);

  return {
    format: 'Flotation',
    width: widthMm, // mm (converted from inches)
    widthInches: widthInches,
    aspectRatio: aspectRatio, // calculated equivalent
    wheelDiameter: wheelDiameter, // inches
    sidewallHeight: sidewallInches * 25.4, // mm
    sidewallInches: sidewallInches,
    diameter: diameterInches, // inches (direct from flotation format)
    diameterMm: diameterInches * 25.4,
    isLT: true, // Flotation sizes are typically LT equivalent
    raw: match[0]
  };
}

/**
 * Calculate tire circumference
 * @param {number} diameter - Tire diameter in inches
 * @returns {number} Circumference in inches
 */
export function calculateCircumference(diameter) {
  return diameter * Math.PI;
}

/**
 * Calculate revolutions per mile
 * @param {number} circumference - Tire circumference in inches
 * @returns {number} Revolutions per mile
 */
export function calculateRevolutionsPerMile(circumference) {
  // 1 mile = 63,360 inches
  return 63360 / circumference;
}

/**
 * Validate tire size compatibility
 * Provides warnings for dangerous combinations but never blocks calculations
 * Users should be able to see results even for extreme changes
 */
export function validateTireCompatibility(currentTire, newTire) {
  const warnings = [];

  // Check diameter increase
  const diameterDiff = newTire.diameter - currentTire.diameter;
  const diameterPctChange = (diameterDiff / currentTire.diameter) * 100;

  if (diameterPctChange > 15) {
    warnings.push({
      severity: 'critical',
      message: 'Diameter increase >15% is EXTREME',
      detail: 'Serious drivetrain damage likely without significant modifications. Re-gearing is mandatory. Transmission, CV axles, and wheel bearings will be severely stressed.'
    });
  } else if (diameterPctChange > 10) {
    warnings.push({
      severity: 'important',
      message: 'Diameter increase >10%',
      detail: 'Re-gearing strongly recommended to avoid drivetrain strain and poor performance.'
    });
  }

  if (diameterPctChange < -10) {
    warnings.push({
      severity: 'important',
      message: 'Diameter decrease >10%',
      detail: 'Significant reduction in ground clearance and off-road capability. Consider if this is intentional.'
    });
  }

  // Check width increase
  const widthDiff = newTire.width - currentTire.width;
  const widthPctChange = (widthDiff / currentTire.width) * 100;

  if (widthPctChange > 20) {
    warnings.push({
      severity: 'important',
      message: 'Significant width increase',
      detail: 'Verify fender clearance and consider wheel offset changes. Rubbing likely at full lock or articulation.'
    });
  }

  // Check wheel diameter change
  if (newTire.wheelDiameter !== currentTire.wheelDiameter) {
    warnings.push({
      severity: 'info',
      message: 'Wheel diameter change',
      detail: 'Different wheels required. Ensure new wheels fit your vehicle (bolt pattern, hub bore, load rating).'
    });
  }

  // Check aspect ratio drop (low profile on offroad)
  if (newTire.aspectRatio < 60 && currentTire.aspectRatio >= 60) {
    warnings.push({
      severity: 'advisory',
      message: 'Low profile tire for off-road',
      detail: 'Tires with aspect ratio <60 are vulnerable to sidewall damage and wheel damage on rocks and sharp impacts.'
    });
  }

  // Always return valid - never block calculations
  // Let users see the numbers even for extreme changes
  return {
    isValid: true,
    warnings
  };
}

/**
 * Format tire size for display
 */
export function formatTireSize(tire) {
  if (tire.format === 'Flotation') {
    return `${tire.diameter.toFixed(1)}x${tire.widthInches.toFixed(2)}R${tire.wheelDiameter}`;
  }

  const prefix = tire.isLT ? 'LT' : '';
  return `${prefix}${Math.round(tire.width)}/${tire.aspectRatio}R${tire.wheelDiameter}`;
}
