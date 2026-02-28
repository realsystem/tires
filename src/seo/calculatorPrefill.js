/**
 * Calculator Prefill Engine - Auto-populates calculator from SEO URL
 *
 * On SEO landing pages, this automatically:
 * 1. Parses URL to extract tire sizes, gear ratios, vehicle info
 * 2. Prefills calculator form fields
 * 3. Auto-runs calculation after 300ms delay
 * 4. Scrolls to results
 * 5. Shows visual badge indicating pre-filled state
 */

import { parseURLForCalculator } from './urlParser';

/**
 * Initialize calculator from URL on page load
 * Call this from App.jsx's useEffect on mount
 *
 * @param {Function} setFormData - Form state setter from CalculatorForm
 * @param {Function} onCalculate - Calculate handler from App
 * @returns {Object|null} - Parsed params if URL matched, null otherwise
 */
export function initializeCalculatorFromURL(setFormData, onCalculate) {
  const params = parseURLForCalculator(window.location.pathname);

  if (!params) {
    return null;
  }

  // Prefill form data
  prefillCalculatorForm(params, setFormData);

  // Auto-run calculation after brief delay (allow form to update)
  setTimeout(() => {
    // Build form data object for calculation
    const calculationData = {
      currentTireSize: params.currentTire || '265/70R17',
      newTireSize: params.newTire || '285/75R17',
      axleGearRatio: params.gearRatio || '3.73',
      newAxleGearRatio: '',
      transmissionTopGear: '1.0',
      transferCaseRatio: '1.0',
      transferCaseLowRatio: '2.5',
      firstGearRatio: '4.0',
      intendedUse: params.focusGearing ? 'rock_crawling' : 'weekend_trail',
      suspensionType: 'ifs',
      vehicleCategory: params.vehicle || '',
    };

    // Trigger calculation
    onCalculate(calculationData);

    // Scroll to results after calculation
    setTimeout(() => {
      const resultsElement = document.querySelector('.results-container, #results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, 300);

  return params;
}

/**
 * Prefill calculator form fields from parsed URL params
 *
 * @param {Object} params - Parsed URL parameters
 * @param {Function} setFormData - Form state setter
 */
export function prefillCalculatorForm(params, setFormData) {
  setFormData(prevData => ({
    ...prevData,
    currentTireSize: params.currentTire || prevData.currentTireSize,
    newTireSize: params.newTire || prevData.newTireSize,
    axleGearRatio: params.gearRatio || prevData.axleGearRatio,
    vehicleCategory: params.vehicle || prevData.vehicleCategory,
    intendedUse: params.focusGearing ? 'rock_crawling' : prevData.intendedUse,
  }));
}

/**
 * Show visual indicator that calculator was pre-filled
 * Call this after prefill to show user a badge
 *
 * @param {Object} params - Parsed URL parameters
 * @returns {string} - Badge text to display
 */
export function getPrefilledBadgeText(params) {
  if (!params) return null;

  const { currentTire, newTire, vehicle } = params;

  if (vehicle && currentTire && newTire) {
    return `Pre-filled: ${vehicle.toUpperCase()} ${currentTire} → ${newTire}`;
  } else if (currentTire && newTire) {
    return `Pre-filled: ${currentTire} vs ${newTire}`;
  } else if (newTire) {
    return `Pre-filled: ${newTire}`;
  }

  return 'Pre-filled from URL';
}

/**
 * Get SEO metadata from URL params
 * Used for dynamic meta tag injection
 *
 * @param {Object} params - Parsed URL parameters
 * @returns {Object} - SEO metadata (title, description, h1)
 */
export function getSEOMetadata(params) {
  if (!params) return null;

  const { currentTire, newTire, gearRatio, vehicle } = params;

  let title, description, h1;

  if (vehicle && currentTire && newTire) {
    const vehName = vehicle.charAt(0).toUpperCase() + vehicle.slice(1);
    title = `${vehName}: ${currentTire} vs ${newTire} Tire Comparison${gearRatio ? ` with ${gearRatio} Gears` : ''}`;
    h1 = `${vehName} Tire Upgrade: ${currentTire} to ${newTire}`;
    description = `Complete engineering analysis for upgrading your ${vehName} from ${currentTire} to ${newTire} tires. Speedometer error, gear ratio impact, clearance requirements, and re-gear recommendations.`;
  } else if (currentTire && newTire) {
    title = `${currentTire} vs ${newTire} - Tire Comparison & Gear Ratio Calculator`;
    h1 = `${currentTire} vs ${newTire} Tire Comparison`;
    description = `Engineering-grade comparison of ${currentTire} vs ${newTire} tires. Diameter difference, speedometer error, RPM changes, gear ratio recommendations, and fitment analysis.`;
  } else if (newTire) {
    title = `${newTire} Tire Specs - Gear Ratio & Fitment Calculator`;
    h1 = `${newTire} Tire Analysis`;
    description = `Complete technical specifications for ${newTire} tires including diameter, circumference, speedometer impact, and optimal gear ratios for your build.`;
  }

  return { title, description, h1 };
}

/**
 * Check if we should show the prefilled badge
 * @returns {boolean}
 */
export function shouldShowPrefilledBadge() {
  return parseURLForCalculator(window.location.pathname) !== null;
}
