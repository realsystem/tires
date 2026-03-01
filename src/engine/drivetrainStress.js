/**
 * Drivetrain Stress Scoring Module
 *
 * PURPOSE: Calculate a 0-100 weighted score representing drivetrain stress from tire upgrades.
 * Higher scores indicate greater stress and stronger need for regearing.
 *
 * METHODOLOGY:
 * - Weighted formula combining multiple factors
 * - Diameter change: 30% (biggest factor in effective gearing)
 * - Weight change: 25% (rotational inertia impact)
 * - Gear ratio loss: 35% (torque multiplication loss)
 * - Vehicle weight: 10% (heavier vehicles handle upgrades better)
 *
 * SCORING:
 * - 0-30: LOW stress (regearing optional)
 * - 31-60: MODERATE stress (regearing recommended)
 * - 61-100: HIGH stress (regearing essential)
 */

/**
 * Calculate drivetrain stress score (0-100)
 *
 * @param {object} params - Analysis parameters
 * @param {number} params.diameterChangePct - Diameter change percentage
 * @param {number} params.weightChangePct - Weight change percentage (per tire)
 * @param {number} params.effectiveGearRatioChangePct - Effective gear ratio change percentage
 * @param {number} params.vehicleWeight - Vehicle curb weight in lbs (optional, default 4500)
 * @param {number} params.rotationalImpactFactor - Rotational physics impact factor (optional)
 * @param {string} params.intendedUse - Usage mode: daily_driver, weekend_trail, overland, rock_crawling (optional)
 * @returns {object} Stress analysis with score, classification, and recommendations
 */
export function calculateDrivetrainStress(params) {
  const {
    diameterChangePct,
    weightChangePct = 0,
    effectiveGearRatioChangePct = 0,
    vehicleWeight = 4500,
    rotationalImpactFactor = 0,
    intendedUse = 'weekend_trail'
  } = params;

  // Component scores (0-100 each)

  // 1. Diameter score (30% weight)
  // >10% diameter change = severe stress
  const diameterScore = Math.min(Math.abs(diameterChangePct) * 8, 100);

  // 2. Weight score (25% weight)
  // Use rotational impact if available (more accurate), otherwise weight change
  const weightMetric = rotationalImpactFactor !== 0
    ? Math.abs(rotationalImpactFactor)
    : Math.abs(weightChangePct);
  const weightScore = Math.min(weightMetric * 6, 100);

  // 3. Gear ratio loss score (35% weight)
  // Loss of effective gearing is most critical for performance
  const gearScore = Math.min(Math.abs(effectiveGearRatioChangePct) * 7, 100);

  // 4. Vehicle weight modifier (10% weight)
  // Heavier vehicles handle tire upgrades better (more torque, less % of total weight)
  // Reference: 4500 lbs = typical midsize truck/SUV
  // Lighter vehicle (3500 lbs) = worse, Heavier vehicle (6000 lbs) = better
  const vehicleWeightFactor = 4500 / vehicleWeight;
  const vehicleScore = Math.min((vehicleWeightFactor - 1) * 200 + 50, 100);

  // Weighted composite score
  const compositeScore = (
    diameterScore * 0.30 +
    weightScore * 0.25 +
    gearScore * 0.35 +
    vehicleScore * 0.10
  );

  // Apply usage mode bias
  const usageBiasedScore = applyUsageModeBias(compositeScore, intendedUse, params);

  // Final score (0-100)
  const finalScore = Math.round(Math.max(0, Math.min(100, usageBiasedScore)));

  // Classification
  let classification = 'LOW';
  let severity = 'minimal';
  let regearRecommendation = 'optional';

  if (finalScore >= 61) {
    classification = 'HIGH';
    severity = 'severe';
    regearRecommendation = 'essential';
  } else if (finalScore >= 31) {
    classification = 'MODERATE';
    severity = 'significant';
    regearRecommendation = 'recommended';
  }

  // Generate recommendations
  const recommendations = generateStressRecommendations(
    finalScore,
    classification,
    params
  );

  // Calculate suggested gear ratio improvement
  const suggestedGearIncrease = calculateSuggestedRegear(
    effectiveGearRatioChangePct,
    finalScore,
    params
  );

  return {
    score: finalScore,
    classification: classification,
    severity: severity,
    breakdown: {
      diameter: {
        score: Math.round(diameterScore),
        weight: '30%',
        contribution: Math.round(diameterScore * 0.30)
      },
      weight: {
        score: Math.round(weightScore),
        weight: '25%',
        contribution: Math.round(weightScore * 0.25)
      },
      gearing: {
        score: Math.round(gearScore),
        weight: '35%',
        contribution: Math.round(gearScore * 0.35)
      },
      vehicle: {
        score: Math.round(vehicleScore),
        weight: '10%',
        contribution: Math.round(vehicleScore * 0.10)
      }
    },
    regearing: {
      recommendation: regearRecommendation,
      urgency: finalScore >= 75 ? 'immediate' : finalScore >= 50 ? 'soon' : 'eventually',
      suggestedGearIncrease: suggestedGearIncrease,
      priority: finalScore >= 61 ? 'high' : finalScore >= 31 ? 'medium' : 'low'
    },
    recommendations: recommendations,
    summary: generateStressSummary(finalScore, classification, params)
  };
}

/**
 * Apply usage mode bias to stress score
 * Different use cases tolerate different levels of stress
 */
function applyUsageModeBias(baseScore, intendedUse, params) {
  const { diameterChangePct } = params;

  switch (intendedUse) {
    case 'daily_driver':
      // Daily drivers need responsive power - penalize heavily
      return baseScore * 1.15; // +15% stress

    case 'rock_crawling':
      // Rock crawlers want low gearing anyway - less penalty
      // But diameter still matters for clearance
      return baseScore * 0.85; // -15% stress

    case 'overland':
      // Overlanders need reliability and fuel economy
      // Moderate penalty for large changes
      return diameterChangePct > 8 ? baseScore * 1.10 : baseScore * 1.0;

    case 'weekend_trail':
    default:
      // Balanced use - no bias
      return baseScore;
  }
}

/**
 * Generate recommendations based on stress score
 */
function generateStressRecommendations(score, classification, params) {
  const recommendations = [];
  const { diameterChangePct, effectiveGearRatioChangePct, intendedUse } = params;

  if (score < 31) {
    // LOW stress
    recommendations.push('Drivetrain stress is minimal - no immediate action required');
    recommendations.push('Vehicle will maintain close to stock performance characteristics');

    if (Math.abs(diameterChangePct) < 3) {
      recommendations.push('Tire size change is within acceptable tolerance for stock gearing');
    }
  } else if (score < 61) {
    // MODERATE stress
    recommendations.push('Drivetrain stress is noticeable - regearing recommended for best performance');
    recommendations.push('You may experience sluggish acceleration and transmission hunting');
    recommendations.push('Consider regearing if you frequently tow, off-road, or drive in mountains');

    if (intendedUse === 'daily_driver') {
      recommendations.push('Daily driving will feel less responsive - regearing strongly advised');
    }

    if (Math.abs(effectiveGearRatioChangePct) > 5) {
      recommendations.push('Effective gear ratio loss is significant enough to impact driveability');
    }
  } else {
    // HIGH stress
    recommendations.push('⚠️ CRITICAL: Drivetrain stress is severe - regearing is essential');
    recommendations.push('Expect dramatically reduced acceleration and potential transmission issues');
    recommendations.push('Engine will struggle to move vehicle efficiently, increasing wear');
    recommendations.push('Fuel economy will suffer significantly due to inefficient power delivery');

    if (score >= 75) {
      recommendations.push('🔴 URGENT: This upgrade should not be driven without regearing');
      recommendations.push('Transmission may overheat or fail prematurely under normal use');
    }

    if (intendedUse === 'daily_driver') {
      recommendations.push('Daily driving is not recommended without immediate regearing');
    }

    if (intendedUse === 'rock_crawling') {
      recommendations.push('Even for rock crawling, this stress level requires lower gearing');
    }
  }

  // Add transmission-specific warnings
  if (score >= 50) {
    recommendations.push('Monitor transmission temperatures - consider auxiliary cooler');
  }

  return recommendations;
}

/**
 * Calculate suggested gear ratio increase
 * Returns percentage increase needed to restore factory performance
 */
function calculateSuggestedRegear(effectiveGearRatioChangePct, stressScore, params) {
  if (!effectiveGearRatioChangePct || effectiveGearRatioChangePct === 0) {
    return null;
  }

  // To restore factory effective ratio, need to increase by the diameter change
  const { diameterChangePct } = params;

  // Suggested increase percentage
  // Example: 10% larger tires need ~10% numerically higher gears (3.73 → 4.10)
  const suggestedIncreasePct = Math.abs(diameterChangePct);

  return {
    percentIncrease: Math.round(suggestedIncreasePct * 10) / 10,
    reasoning: 'Increase gear ratio to compensate for larger tire diameter',
    example: suggestedIncreasePct > 8
      ? 'e.g., 3.73 → 4.30 or 4.10 → 4.56'
      : 'e.g., 3.73 → 4.10 or 4.10 → 4.30'
  };
}

/**
 * Generate human-readable summary
 */
function generateStressSummary(score, classification, params) {
  const { diameterChangePct, intendedUse } = params;

  if (score < 20) {
    return `Drivetrain stress is negligible (${score}/100). This tire upgrade will have minimal impact on performance and no regearing is necessary.`;
  } else if (score < 31) {
    return `Drivetrain stress is LOW (${score}/100). Performance impact will be minor. Regearing is optional and only recommended for maximum performance.`;
  } else if (score < 50) {
    return `Drivetrain stress is MODERATE (${score}/100). You'll notice reduced acceleration and possible transmission hunting. Regearing is recommended${intendedUse === 'daily_driver' ? ', especially for daily driving' : ' for best performance'}.`;
  } else if (score < 61) {
    return `Drivetrain stress is MODERATE-HIGH (${score}/100). Expect noticeably sluggish performance and increased transmission wear. Regearing is strongly recommended.`;
  } else if (score < 75) {
    return `Drivetrain stress is HIGH (${score}/100). Performance will suffer significantly without regearing. Engine will struggle, fuel economy will drop, and transmission may overheat. Regearing is essential.`;
  } else {
    return `⚠️ CRITICAL: Drivetrain stress is SEVERE (${score}/100). This ${Math.abs(diameterChangePct).toFixed(1)}% tire upgrade creates dangerous stress levels. DO NOT drive without regearing - transmission failure is likely.`;
  }
}

/**
 * Calculate stress score from comparison object
 * Convenience wrapper for main calculator
 */
export function calculateStressFromComparison(comparison, vehicleWeight = 4500, intendedUse = 'weekend_trail') {
  if (!comparison.drivetrainImpact) {
    // No drivetrain data - can't calculate full stress score
    return null;
  }

  const params = {
    diameterChangePct: comparison.differences.diameter.percentage,
    weightChangePct: comparison.rotationalPhysics
      ? comparison.rotationalPhysics.changes.weight.delta_pct
      : 0,
    effectiveGearRatioChangePct: comparison.drivetrainImpact.effectiveGearRatio.changePercentage,
    vehicleWeight: vehicleWeight,
    rotationalImpactFactor: comparison.rotationalPhysics
      ? comparison.rotationalPhysics.changes.rotational_inertia.factor
      : 0,
    intendedUse: intendedUse
  };

  return calculateDrivetrainStress(params);
}
