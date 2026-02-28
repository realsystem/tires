/**
 * Real-world gear ratio recommendation data
 * Based on manufacturer specs and community-verified builds
 */

import gearRatioCSV from '../data/gearRatioRecommendations.csv?raw';

let gearRatioDatabase = null;

/**
 * Parse CSV data into structured format
 */
function parseGearRatioCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      vehicleType: values[0],
      stockTireDiameter: parseFloat(values[1]),
      newTireDiameter: parseFloat(values[2]),
      stockGearRatio: parseFloat(values[3]),
      recommendedGearRatio: parseFloat(values[4]),
      useCase: values[5],
      notes: values[6]
    };
  });
}

/**
 * Initialize and cache the gear ratio database
 */
function getGearRatioDatabase() {
  if (!gearRatioDatabase) {
    gearRatioDatabase = parseGearRatioCSV(gearRatioCSV);
  }
  return gearRatioDatabase;
}

/**
 * Find real-world gear ratio recommendations for a specific scenario
 * @param {string} vehicleType - Vehicle make/model (e.g., "Jeep Wrangler", "Toyota Tacoma")
 * @param {number} stockDiameter - Current tire diameter
 * @param {number} newDiameter - New tire diameter
 * @param {number} currentGearRatio - Current axle gear ratio
 * @param {string} useCase - Intended use case
 * @returns {Array} Matching recommendations from real-world data
 */
export function findRealWorldRecommendations(vehicleType, stockDiameter, newDiameter, currentGearRatio, useCase = null) {
  const database = getGearRatioDatabase();

  // Tolerance for matching tire sizes (within 1 inch)
  const tireTolerance = 1.0;
  // Tolerance for matching gear ratios
  const gearTolerance = 0.15;

  const matches = database.filter(entry => {
    // Match vehicle type (case-insensitive, partial match)
    const vehicleMatch = !vehicleType ||
      entry.vehicleType.toLowerCase().includes(vehicleType.toLowerCase()) ||
      vehicleType.toLowerCase().includes(entry.vehicleType.toLowerCase());

    // Match stock tire diameter (within tolerance)
    const stockTireMatch = Math.abs(entry.stockTireDiameter - stockDiameter) <= tireTolerance;

    // Match new tire diameter (within tolerance)
    const newTireMatch = Math.abs(entry.newTireDiameter - newDiameter) <= tireTolerance;

    // Match stock gear ratio (within tolerance)
    const gearMatch = Math.abs(entry.stockGearRatio - currentGearRatio) <= gearTolerance;

    // Optional: match use case
    const useCaseMatch = !useCase ||
      entry.useCase.toLowerCase().includes(useCase.toLowerCase()) ||
      useCase.toLowerCase().includes(entry.useCase.toLowerCase());

    return vehicleMatch && stockTireMatch && newTireMatch && gearMatch;
  });

  return matches;
}

/**
 * Get popular gear ratios for a tire size range (even without exact vehicle match)
 * @param {number} newDiameter - New tire diameter
 * @param {string} useCase - Intended use case
 * @returns {Object} Popular gear ratios and their frequency
 */
export function getPopularGearRatiosForTireSize(newDiameter, useCase = null) {
  const database = getGearRatioDatabase();
  const tireTolerance = 1.5;

  const matches = database.filter(entry => {
    const tireMatch = Math.abs(entry.newTireDiameter - newDiameter) <= tireTolerance;
    const useCaseMatch = !useCase ||
      entry.useCase.toLowerCase().includes(useCase.toLowerCase()) ||
      useCase.toLowerCase().includes(entry.useCase.toLowerCase());
    return tireMatch && (useCase ? useCaseMatch : true);
  });

  // Count occurrences of each gear ratio
  const ratioFrequency = {};
  matches.forEach(entry => {
    const ratio = entry.recommendedGearRatio;
    if (!ratioFrequency[ratio]) {
      ratioFrequency[ratio] = {
        count: 0,
        ratio: ratio,
        useCases: new Set(),
        vehicles: new Set(),
        notes: []
      };
    }
    ratioFrequency[ratio].count++;
    ratioFrequency[ratio].useCases.add(entry.useCase);
    ratioFrequency[ratio].vehicles.add(entry.vehicleType);
    if (entry.notes) {
      ratioFrequency[ratio].notes.push(entry.notes);
    }
  });

  // Convert to array and sort by popularity
  return Object.values(ratioFrequency)
    .map(item => ({
      ratio: item.ratio,
      popularity: item.count,
      useCases: Array.from(item.useCases),
      vehicles: Array.from(item.vehicles),
      notes: [...new Set(item.notes)] // Deduplicate notes
    }))
    .sort((a, b) => b.popularity - a.popularity);
}

/**
 * Get vehicle-specific examples for display
 * @param {number} newDiameter - New tire diameter
 * @returns {Array} Example configurations from the database
 */
export function getVehicleExamples(newDiameter) {
  const database = getGearRatioDatabase();
  const tireTolerance = 1.0;

  const matches = database.filter(entry =>
    Math.abs(entry.newTireDiameter - newDiameter) <= tireTolerance
  );

  // Group by vehicle type and get representative examples
  const byVehicle = {};
  matches.forEach(entry => {
    const key = entry.vehicleType;
    if (!byVehicle[key]) {
      byVehicle[key] = [];
    }
    byVehicle[key].push(entry);
  });

  // Return 1-2 examples per vehicle type, prioritizing popular choices
  return Object.entries(byVehicle).flatMap(([vehicle, entries]) => {
    // Sort by use case variety
    const sorted = entries.sort((a, b) => {
      const scoreA = a.useCase.toLowerCase().includes('daily') ? 2 :
                     a.useCase.toLowerCase().includes('mixed') ? 1.5 : 1;
      const scoreB = b.useCase.toLowerCase().includes('daily') ? 2 :
                     b.useCase.toLowerCase().includes('mixed') ? 1.5 : 1;
      return scoreB - scoreA;
    });
    return sorted.slice(0, 2);
  }).slice(0, 6); // Limit to 6 total examples
}

/**
 * Enhance calculated recommendations with real-world data
 * @param {Array} calculatedRecommendations - Recommendations from calculation
 * @param {Object} params - Search parameters (vehicleType, diameters, etc.)
 * @returns {Array} Enhanced recommendations
 */
export function enhanceRecommendationsWithRealWorldData(calculatedRecommendations, params) {
  const { vehicleType, stockDiameter, newDiameter, currentGearRatio, useCase } = params;

  // Find real-world matches
  const realWorldMatches = findRealWorldRecommendations(
    vehicleType,
    stockDiameter,
    newDiameter,
    currentGearRatio,
    useCase
  );

  // Get popular ratios for this tire size
  const popularRatios = getPopularGearRatiosForTireSize(newDiameter, useCase);

  // Enhance each calculated recommendation
  return calculatedRecommendations.map(rec => {
    // Check if this ratio has real-world validation
    const realWorldMatch = realWorldMatches.find(
      match => Math.abs(match.recommendedGearRatio - rec.ratio) < 0.1
    );

    const popularMatch = popularRatios.find(
      popular => Math.abs(popular.ratio - rec.ratio) < 0.1
    );

    const enhanced = { ...rec };

    if (realWorldMatch) {
      enhanced.realWorldValidation = {
        validated: true,
        source: `${realWorldMatch.vehicleType}`,
        useCase: realWorldMatch.useCase,
        notes: realWorldMatch.notes
      };
      // Boost score for real-world validated ratios
      if (enhanced.verdict) {
        enhanced.verdict.score += 10;
        enhanced.verdict.pros.unshift(`Proven choice for ${realWorldMatch.vehicleType}`);
      }
    }

    if (popularMatch && popularMatch.popularity >= 2) {
      enhanced.popularity = {
        rank: popularRatios.indexOf(popularMatch) + 1,
        count: popularMatch.popularity,
        vehicles: popularMatch.vehicles
      };
      // Boost score for popular ratios
      if (enhanced.verdict) {
        enhanced.verdict.score += 5;
        enhanced.verdict.pros.push(`Popular choice (${popularMatch.popularity} similar builds)`);
      }
    }

    return enhanced;
  });
}

/**
 * Get all available vehicle types from the database
 * @returns {Array} Sorted list of vehicle types
 */
export function getAvailableVehicleTypes() {
  const database = getGearRatioDatabase();
  const types = [...new Set(database.map(entry => entry.vehicleType))];
  return types.sort();
}
