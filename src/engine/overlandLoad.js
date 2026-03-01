/**
 * Overland Load Multiplier Module
 *
 * PURPOSE: Adjust drivetrain stress, fuel economy, and performance calculations
 * based on expedition/overland loading scenarios.
 *
 * METHODOLOGY:
 * - Typical expedition load: 300-1500 lbs (gear, water, recovery equipment, armor)
 * - Load increases effective stress on drivetrain
 * - Load affects fuel economy, acceleration, braking
 * - Provides load-specific warnings and recommendations
 *
 * LOAD CATEGORIES:
 * - Light (0-300 lbs): Weekend trips, minimal gear
 * - Medium (300-700 lbs): Week-long trips, full camping gear
 * - Heavy (700-1200 lbs): Extended overlanding, full build
 * - Extreme (1200+ lbs): Expedition-spec, armor, massive water/fuel
 */

/**
 * Calculate overland load impact on existing analysis
 *
 * @param {object} baseAnalysis - Base tire comparison analysis
 * @param {number} expeditionLoad - Additional weight in lbs (0-2000)
 * @param {string} loadType - 'weekend', 'overland', 'expedition' (optional)
 * @returns {object} Load-adjusted analysis with multipliers
 */
export function calculateOverlandImpact(baseAnalysis, expeditionLoad = 0, loadType = 'overland') {
  if (expeditionLoad <= 0) {
    return {
      hasLoad: false,
      expeditionLoad: 0,
      adjustments: null
    };
  }

  // Categorize load
  const loadCategory = categorizeLoad(expeditionLoad);

  // Calculate load multipliers
  const multipliers = calculateLoadMultipliers(expeditionLoad, loadCategory);

  // Adjust stress score if available
  let adjustedStressScore = null;
  if (baseAnalysis.drivetrainStress) {
    adjustedStressScore = {
      base: baseAnalysis.drivetrainStress.score,
      adjusted: Math.min(100, Math.round(baseAnalysis.drivetrainStress.score * multipliers.stressMultiplier)),
      increase: Math.round((baseAnalysis.drivetrainStress.score * multipliers.stressMultiplier) - baseAnalysis.drivetrainStress.score),
      classification: getStressClassification(Math.round(baseAnalysis.drivetrainStress.score * multipliers.stressMultiplier))
    };
  }

  // Adjust fuel economy estimate
  const fuelEconomyImpact = calculateFuelEconomyImpact(
    baseAnalysis.differences.diameter.percentage,
    expeditionLoad,
    multipliers
  );

  // Generate load warnings
  const loadWarnings = generateLoadWarnings(expeditionLoad, loadCategory, baseAnalysis);

  // Braking distance impact
  const brakingImpact = calculateBrakingImpact(expeditionLoad, baseAnalysis);

  return {
    hasLoad: true,
    expeditionLoad,
    loadType,
    loadCategory,
    multipliers,
    adjustedStressScore,
    fuelEconomyImpact,
    brakingImpact,
    loadWarnings,
    summary: generateLoadSummary(expeditionLoad, loadCategory, multipliers, adjustedStressScore)
  };
}

/**
 * Categorize load by weight
 */
function categorizeLoad(weight) {
  if (weight < 300) {
    return {
      category: 'LIGHT',
      description: 'Weekend trip gear',
      examples: ['Basic camping gear', 'Recovery equipment', 'Cooler and supplies']
    };
  } else if (weight < 700) {
    return {
      category: 'MEDIUM',
      description: 'Week-long overland setup',
      examples: ['Full camping gear', 'Extra fuel/water (30-50 gal)', 'RTT or ground tent', 'Fridge']
    };
  } else if (weight < 1200) {
    return {
      category: 'HEAVY',
      description: 'Extended expedition build',
      examples: ['RTT + awning', 'Large water storage (50+ gal)', 'Dual battery system', 'Bumpers/sliders', 'Fridge/freezer']
    };
  } else {
    return {
      category: 'EXTREME',
      description: 'Full expedition spec',
      examples: ['Full armor (bumpers, sliders, skids)', 'Massive water/fuel (100+ gal)', 'Winch', 'RTT + kitchen setup', 'Dual spares']
    };
  }
}

/**
 * Calculate load multipliers for various metrics
 */
function calculateLoadMultipliers(load, loadCategory) {
  // Stress multiplier: load increases drivetrain stress
  // Base formula: 1 + (load / 4000) - represents % increase in effective vehicle weight
  const stressMultiplier = 1 + (load / 4000); // Max ~1.5x at 2000 lbs

  // Fuel economy multiplier
  // Larger tires + load = compounding effect
  // Formula: 1 + (load / 3000) - conservative estimate
  const fuelMultiplier = 1 + (load / 3000); // Max ~1.67x at 2000 lbs

  // Braking multiplier
  // Added weight increases braking distances
  const brakingMultiplier = 1 + (load / 5000); // Max ~1.4x at 2000 lbs

  // Suspension multiplier
  // Load affects suspension travel and clearance
  const suspensionMultiplier = load > 800 ? 1.2 : load > 400 ? 1.1 : 1.0;

  return {
    stressMultiplier,
    fuelMultiplier,
    brakingMultiplier,
    suspensionMultiplier,
    effectiveWeightIncrease: load
  };
}

/**
 * Get stress classification from score
 */
function getStressClassification(score) {
  if (score >= 61) return 'HIGH';
  if (score >= 31) return 'MODERATE';
  return 'LOW';
}

/**
 * Calculate fuel economy impact
 */
function calculateFuelEconomyImpact(diameterChangePct, load, multipliers) {
  // Base impact from tire diameter
  // Rule of thumb: ~2% MPG loss per 1" diameter increase
  const baseMPGLoss = Math.abs(diameterChangePct) * 0.5; // Simplified: 1% loss per 2% diameter

  // Load compounds the impact
  const loadAdjustedMPGLoss = baseMPGLoss * multipliers.fuelMultiplier;

  // Additional load-only impact
  // ~1% MPG loss per 100 lbs of added weight (conservative)
  const loadOnlyImpact = (load / 100) * 0.5;

  const totalMPGLoss = loadAdjustedMPGLoss + loadOnlyImpact;

  return {
    baseMPGLoss: Math.round(baseMPGLoss * 10) / 10,
    loadImpact: Math.round(loadOnlyImpact * 10) / 10,
    totalMPGLoss: Math.round(totalMPGLoss * 10) / 10,
    description: totalMPGLoss > 15
      ? `Severe fuel economy impact: expect ${Math.round(totalMPGLoss)}%+ reduction`
      : totalMPGLoss > 10
      ? `Significant fuel economy impact: expect ${Math.round(totalMPGLoss)}% reduction`
      : totalMPGLoss > 5
      ? `Moderate fuel economy impact: expect ${Math.round(totalMPGLoss)}% reduction`
      : `Minor fuel economy impact: expect ${Math.round(totalMPGLoss)}% reduction`
  };
}

/**
 * Calculate braking distance impact
 */
function calculateBrakingImpact(load, baseAnalysis) {
  // Braking distance increases with load
  // Formula: Simplified physics (kinetic energy = 0.5 * m * v²)
  // Assume base vehicle weight of 4500 lbs
  const baseWeight = 4500;
  const loadedWeight = baseWeight + load;

  // Braking distance scales with weight (simplified)
  const brakingIncrease = ((loadedWeight - baseWeight) / baseWeight) * 100;

  // Also factor in tire size if rotational physics available
  let rotationalFactor = 0;
  if (baseAnalysis.rotationalPhysics) {
    rotationalFactor = baseAnalysis.rotationalPhysics.changes.rotational_inertia.factor * 0.3;
  }

  const totalBrakingIncrease = brakingIncrease + rotationalFactor;

  return {
    loadImpact: Math.round(brakingIncrease * 10) / 10,
    tireImpact: Math.round(rotationalFactor * 10) / 10,
    totalIncrease: Math.round(totalBrakingIncrease * 10) / 10,
    recommendation: totalBrakingIncrease > 15
      ? 'Brake upgrade essential for safe loaded operation'
      : totalBrakingIncrease > 10
      ? 'Brake upgrade strongly recommended'
      : totalBrakingIncrease > 5
      ? 'Monitor brake performance, consider upgrade'
      : 'Stock brakes adequate'
  };
}

/**
 * Generate load warnings
 */
function generateLoadWarnings(load, loadCategory, baseAnalysis) {
  const warnings = [];

  if (load > 800) {
    warnings.push({
      severity: 'high',
      component: 'Suspension',
      message: `${load} lbs exceeds most stock suspension capacity. Upgraded springs/shocks required.`
    });
  }

  if (load > 1000) {
    warnings.push({
      severity: 'high',
      component: 'Brakes',
      message: 'Heavy load requires brake upgrade for safe stopping distances.'
    });
  }

  if (load > 600 && baseAnalysis.differences.diameter.percentage > 5) {
    warnings.push({
      severity: 'moderate',
      component: 'Drivetrain',
      message: 'Large tires + heavy load = significant drivetrain stress. Regearing critical.'
    });
  }

  if (load > 1200) {
    warnings.push({
      severity: 'high',
      component: 'Tires',
      message: `Load capacity: Ensure tires are rated for this weight. Consider E-rated tires.`
    });
  }

  if (load > 500) {
    warnings.push({
      severity: 'moderate',
      component: 'Payload Capacity',
      message: 'Verify vehicle payload capacity rating. May exceed GVWR with passengers + gear.'
    });
  }

  return warnings;
}

/**
 * Generate load summary
 */
function generateLoadSummary(load, loadCategory, multipliers, adjustedStressScore) {
  const stressIncrease = adjustedStressScore
    ? `Drivetrain stress increased from ${adjustedStressScore.base} to ${adjustedStressScore.adjusted} (+${adjustedStressScore.increase} points, ${loadCategory.category} impact).`
    : '';

  return `${loadCategory.category} expedition load (${load} lbs): ${loadCategory.description}. ${stressIncrease} Fuel economy will be reduced by the combined weight of tires + load. Suspension and brakes require appropriate upgrades for safe operation.`;
}
