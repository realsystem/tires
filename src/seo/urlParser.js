/**
 * SEO URL Parser - Extracts calculator parameters from SEO-optimized URLs
 *
 * Supported URL patterns:
 * - /265-70r17-vs-285-75r17
 * - /265-70r17-vs-285-75r17-4-10-gears
 * - /tacoma-265-70r17-to-285-75r17
 * - /33-vs-35-tires
 * - /best-gears-for-35s
 * - /285-75r17-on-4-10-gears-tacoma
 */

const URL_PATTERNS = {
  // Standard tire-vs-tire: /265-70r17-vs-285-75r17
  tireVsTire: /^\/(\d+[-x]\d+[r]?\d+)-vs-(\d+[-x]\d+[r]?\d+)$/i,

  // Tire-vs-tire with gears: /265-70r17-vs-285-75r17-4-10-gears
  tireVsTireGear: /^\/(\d+[-x]\d+[r]?\d+)-vs-(\d+[-x]\d+[r]?\d+)-([\d-]+)-gears$/i,

  // Vehicle-specific: /tacoma-265-70r17-to-285-75r17
  vehicleTireToTire: /^\/(tacoma|fourrunner|4runner|jeep|bronco|ranger|f150|f250|colorado|silverado|sierra)-(\d+[-x]\d+[r]?\d+)-to-(\d+[-x]\d+[r]?\d+)$/i,

  // Vehicle with gears: /tacoma-265-70r17-to-285-75r17-3-73-gears
  vehicleTireToTireGear: /^\/(tacoma|fourrunner|4runner|jeep|bronco|ranger|f150|f250|colorado|silverado|sierra)-(\d+[-x]\d+[r]?\d+)-to-(\d+[-x]\d+[r]?\d+)-([\d-]+)-gears$/i,

  // Simplified comparison: /33-vs-35-tires
  simplifiedVs: /^\/(\d+)-vs-(\d+)-tires$/i,

  // Best gears for tire: /best-gears-for-35s or /best-gears-for-35s-tacoma
  bestGearsFor: /^\/best-gears-for-(\d+)s?(?:-(\w+))?$/i,

  // Tire on specific gears: /285-75r17-on-4-10-gears or /285-75r17-on-4-10-gears-tacoma
  tireOnGears: /^\/(\d+[-x]\d+[r]?\d+)-on-([\d-]+)-gears(?:-(\w+))?$/i,
};

/**
 * Normalize tire size from URL format to standard format
 * @param {string} urlTire - Tire in URL format (e.g., "265-70r17" or "35x12-50r17")
 * @returns {string} - Standard tire format (e.g., "265/70R17" or "35x12.50R17")
 */
export function normalizeTireSize(urlTire) {
  if (!urlTire) return null;

  // Handle flotation format: 35x12-50r17 -> 35x12.50R17
  if (urlTire.includes('x')) {
    const parts = urlTire.split('x');
    if (parts.length === 2) {
      const diameter = parts[0];
      const rest = parts[1].replace(/-/g, '.').toUpperCase();
      return `${diameter}x${rest}`;
    }
  }

  // Handle metric format: 265-70r17 -> 265/70R17
  const normalized = urlTire
    .replace(/-/g, '/')
    .replace(/r/i, 'R')
    .replace(/\//g, (match, offset) => offset === urlTire.indexOf('-') ? '/' : match);

  // Fix double slashes and ensure single slash before aspect ratio
  return normalized.replace(/(\d+)\/(\d+)\/([rR]\d+)/, '$1/$2$3');
}

/**
 * Normalize gear ratio from URL format to decimal
 * @param {string} urlGear - Gear in URL format (e.g., "4-10" or "3-73")
 * @returns {string} - Decimal gear ratio (e.g., "4.10" or "3.73")
 */
export function normalizeGearRatio(urlGear) {
  if (!urlGear) return null;
  return urlGear.replace(/-/g, '.');
}

/**
 * Convert diameter shorthand to full tire size
 * @param {string} diameter - Diameter like "33" or "35"
 * @returns {string} - Common tire size for that diameter
 */
function diameterToTireSize(diameter) {
  const commonSizes = {
    '31': '265/70R17',
    '32': '275/70R17',
    '33': '285/75R17',
    '34': '285/75R18',
    '35': '35x12.50R17',
    '37': '37x12.50R17',
    '40': '40x13.50R17',
  };
  return commonSizes[diameter] || `${diameter}x12.50R17`;
}

/**
 * Parse URL pathname and extract calculator parameters
 * @param {string} pathname - URL pathname (e.g., "/265-70r17-vs-285-75r17")
 * @returns {Object|null} - Calculator parameters or null if no match
 */
export function parseURLForCalculator(pathname) {
  if (!pathname || pathname === '/') return null;

  // Remove trailing slash
  const cleanPath = pathname.replace(/\/$/, '');

  // Try each pattern
  for (const [patternName, regex] of Object.entries(URL_PATTERNS)) {
    const match = cleanPath.match(regex);
    if (match) {
      return parseMatch(patternName, match);
    }
  }

  return null;
}

/**
 * Parse regex match into calculator parameters
 */
function parseMatch(patternName, match) {
  switch (patternName) {
    case 'tireVsTire':
      return {
        currentTire: normalizeTireSize(match[1]),
        newTire: normalizeTireSize(match[2]),
      };

    case 'tireVsTireGear':
      return {
        currentTire: normalizeTireSize(match[1]),
        newTire: normalizeTireSize(match[2]),
        gearRatio: normalizeGearRatio(match[3]),
      };

    case 'vehicleTireToTire':
      return {
        currentTire: normalizeTireSize(match[2]),
        newTire: normalizeTireSize(match[3]),
        vehicle: match[1].toLowerCase(),
      };

    case 'vehicleTireToTireGear':
      return {
        currentTire: normalizeTireSize(match[2]),
        newTire: normalizeTireSize(match[3]),
        gearRatio: normalizeGearRatio(match[4]),
        vehicle: match[1].toLowerCase(),
      };

    case 'simplifiedVs':
      return {
        currentTire: diameterToTireSize(match[1]),
        newTire: diameterToTireSize(match[2]),
      };

    case 'bestGearsFor':
      return {
        newTire: diameterToTireSize(match[1]),
        vehicle: match[2] ? match[2].toLowerCase() : null,
        focusGearing: true,
      };

    case 'tireOnGears':
      return {
        newTire: normalizeTireSize(match[1]),
        gearRatio: normalizeGearRatio(match[2]),
        vehicle: match[3] ? match[3].toLowerCase() : null,
      };

    default:
      return null;
  }
}

/**
 * Generate SEO URL from calculator parameters
 * @param {Object} params - Calculator parameters
 * @returns {string} - SEO-friendly URL
 */
export function generateSEOUrl(params) {
  const { currentTire, newTire, gearRatio, vehicle } = params;

  // Convert tire to URL format
  const toUrlFormat = (tire) => {
    if (!tire) return '';
    return tire
      .toLowerCase()
      .replace(/\//g, '-')
      .replace(/r/gi, 'r')
      .replace(/\./g, '-');
  };

  // Convert gear to URL format
  const gearUrl = gearRatio ? gearRatio.replace(/\./g, '-') : '';

  // Build URL
  let url = '';

  if (vehicle && currentTire && newTire) {
    url = `/${vehicle}-${toUrlFormat(currentTire)}-to-${toUrlFormat(newTire)}`;
    if (gearUrl) url += `-${gearUrl}-gears`;
  } else if (currentTire && newTire) {
    url = `/${toUrlFormat(currentTire)}-vs-${toUrlFormat(newTire)}`;
    if (gearUrl) url += `-${gearUrl}-gears`;
  } else if (newTire) {
    url = `/${toUrlFormat(newTire)}`;
    if (gearUrl) url += `-on-${gearUrl}-gears`;
    if (vehicle) url += `-${vehicle}`;
  }

  return url || '/';
}

/**
 * Check if current URL is an SEO landing page
 * @returns {boolean}
 */
export function isSEOLandingPage() {
  return parseURLForCalculator(window.location.pathname) !== null;
}
