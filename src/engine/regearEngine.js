/**
 * Re-Gear Recommendation Engine
 * Provides intelligent gearing recommendations based on tire size changes and intended use
 * Considers real-world off-road and overland scenarios
 */

// Common available gear ratios (sorted numerically)
const AVAILABLE_GEAR_RATIOS = [
  3.07, 3.21, 3.31, 3.42, 3.45, 3.55, 3.73, 3.909, 3.92, 4.10, 4.27, 4.30,
  4.56, 4.88, 5.13, 5.29, 5.38, 5.71, 5.86
];

// Vehicle use case profiles
const USE_CASE_PROFILES = {
  daily_driver: {
    name: 'Daily Driver',
    priority: 'fuel_economy',
    targetRPMAt65: 2200, // Lower RPM for highway comfort and economy
    description: 'Prioritizes fuel economy and highway driving comfort'
  },
  weekend_trail: {
    name: 'Weekend Trail',
    priority: 'balanced',
    targetRPMAt65: 2400,
    description: 'Balanced for street driving with weekend off-road capability'
  },
  rock_crawling: {
    name: 'Rock Crawling',
    priority: 'torque',
    targetRPMAt65: 2600,
    crawlRatioMin: 50, // Minimum crawl ratio for technical rock crawling
    description: 'Maximum low-end torque and crawl control'
  },
  overlanding: {
    name: 'Overlanding / Expedition',
    priority: 'power_band',
    targetRPMAt65: 2300,
    description: 'Maintains power band for loaded vehicle, long highway miles'
  },
  sand_desert: {
    name: 'Sand / Desert',
    priority: 'power',
    targetRPMAt65: 2500,
    description: 'Maintains power delivery for momentum-based terrain'
  },
  snow: {
    name: 'Snow',
    priority: 'balanced',
    targetRPMAt65: 2400,
    description: 'Balanced gearing for variable traction conditions'
  }
};

/**
 * Generate comprehensive re-gear recommendations
 * @param {Object} comparison - Tire comparison results
 * @param {number} currentGearRatio - Current axle gear ratio
 * @param {string} intendedUse - Intended use case key
 * @param {Object} drivetrain - Additional drivetrain specs
 * @returns {Object} Re-gear recommendations
 */
export function generateRegearRecommendations(comparison, currentGearRatio, intendedUse = 'balanced', drivetrain = {}) {
  const useCase = USE_CASE_PROFILES[intendedUse] || USE_CASE_PROFILES.weekend_trail;

  // Calculate what ratio would restore factory performance
  const restorationRatio = calculateRestorationRatio(
    comparison.current.diameter,
    comparison.new.diameter,
    currentGearRatio
  );

  // Calculate optimal ratio for use case
  const optimalRatio = calculateOptimalRatio(
    comparison,
    currentGearRatio,
    useCase,
    drivetrain
  );

  // Find closest available gear ratios
  const restorationOptions = findClosestGearRatios(restorationRatio, 2);
  const optimalOptions = findClosestGearRatios(optimalRatio, 2);

  // Determine if re-gearing is necessary
  const necessity = determineRegearNecessity(comparison, currentGearRatio);

  // Calculate performance impact for each option
  const recommendations = buildRecommendations(
    comparison,
    currentGearRatio,
    restorationOptions,
    optimalOptions,
    useCase,
    drivetrain
  );

  return {
    necessity,
    useCase: useCase.name,
    currentRatio: currentGearRatio,
    idealRatios: {
      restoration: restorationRatio,
      optimal: optimalRatio
    },
    recommendations,
    analysis: analyzeRegearImpact(comparison, currentGearRatio, recommendations[0]?.ratio)
  };
}

/**
 * Calculate gear ratio that restores factory effective ratio
 */
function calculateRestorationRatio(originalDiameter, newDiameter, currentRatio) {
  // New Ratio = Current Ratio × (New Diameter / Original Diameter)
  return currentRatio * (newDiameter / originalDiameter);
}

/**
 * Calculate optimal gear ratio based on use case
 */
function calculateOptimalRatio(comparison, currentRatio, useCase, drivetrain) {
  const { transmissionTopGear = 1.0 } = drivetrain;
  const targetRPM = useCase.targetRPMAt65;
  const testSpeed = 65; // mph
  const newDiameter = comparison.new.diameter;

  // Calculate ratio needed to achieve target RPM
  // Ratio = (RPM × Diameter) / (Speed × Trans Ratio × 336)
  const optimalRatio = (targetRPM * newDiameter) / (testSpeed * transmissionTopGear * 336);

  // For rock crawling, also consider crawl ratio requirements
  if (useCase.priority === 'torque' && useCase.crawlRatioMin) {
    const { transferCaseLowRatio = 2.5 } = drivetrain;
    const firstGearRatio = drivetrain.firstGearRatio || 4.0;

    // Calculate minimum axle ratio needed for crawl ratio
    // Crawl Ratio = Axle × Transfer Low × First Gear
    const minAxleRatio = useCase.crawlRatioMin / (transferCaseLowRatio * firstGearRatio);

    // Use higher of the two ratios
    return Math.max(optimalRatio, minAxleRatio);
  }

  return optimalRatio;
}

/**
 * Find closest available gear ratios
 */
function findClosestGearRatios(targetRatio, count = 2) {
  const sorted = AVAILABLE_GEAR_RATIOS.map(ratio => ({
    ratio,
    difference: Math.abs(ratio - targetRatio)
  })).sort((a, b) => a.difference - b.difference);

  return sorted.slice(0, count).map(item => item.ratio);
}

/**
 * Determine if re-gearing is necessary
 */
function determineRegearNecessity(comparison, currentRatio) {
  const diameterChangePct = comparison.differences.diameter.percentage;
  const effectiveRatioChangePct = comparison.drivetrainImpact?.effectiveGearRatio.changePercentage || 0;

  let level = 'optional';
  let reason = 'Tire size change is minimal';

  if (Math.abs(diameterChangePct) > 10) {
    level = 'strongly_recommended';
    reason = 'Diameter change >10% will significantly impact performance and drivetrain stress';
  } else if (Math.abs(diameterChangePct) > 5) {
    level = 'recommended';
    reason = 'Noticeable performance impact. Re-gearing will improve drivability';
  } else if (Math.abs(diameterChangePct) > 3) {
    level = 'consider';
    reason = 'Minor performance impact. Re-gearing depends on use case and budget';
  }

  return {
    level,
    reason,
    diameterChange: diameterChangePct,
    effectiveRatioChange: effectiveRatioChangePct
  };
}

/**
 * Build detailed recommendations
 */
function buildRecommendations(comparison, currentRatio, restorationOptions, optimalOptions, useCase, drivetrain) {
  const recommendations = [];
  const seenRatios = new Set();

  // Combine and deduplicate options
  const allOptions = [...new Set([...restorationOptions, ...optimalOptions])].sort((a, b) => b - a);

  allOptions.forEach(ratio => {
    if (seenRatios.has(ratio)) return;
    seenRatios.add(ratio);

    const impact = calculateRatioImpact(comparison, currentRatio, ratio, drivetrain);

    recommendations.push({
      ratio,
      type: restorationOptions.includes(ratio) ? 'restoration' : 'optimal',
      impact,
      verdict: generateVerdict(impact, useCase)
    });
  });

  return recommendations.sort((a, b) => {
    // Sort by suitability for use case
    if (a.verdict.score !== b.verdict.score) {
      return b.verdict.score - a.verdict.score;
    }
    return b.ratio - a.ratio;
  });
}

/**
 * Calculate impact of a specific gear ratio
 */
function calculateRatioImpact(comparison, currentRatio, newRatio, drivetrain) {
  const { transmissionTopGear = 1.0, transferCaseLowRatio = 2.5, firstGearRatio = 4.0 } = drivetrain;
  const testSpeed = 65;
  const newDiameter = comparison.new.diameter;

  // RPM at highway speed
  const rpm = (testSpeed * newRatio * transmissionTopGear * 336) / newDiameter;

  // Crawl ratio
  const crawlRatio = newRatio * transferCaseLowRatio * firstGearRatio;

  // Effective ratio vs original
  const originalEffectiveRatio = currentRatio;
  const newEffectiveRatio = newRatio * (comparison.current.diameter / newDiameter);
  const restorationPct = ((newEffectiveRatio - originalEffectiveRatio) / originalEffectiveRatio) * 100;

  // Performance characteristics
  const acceleration = restorationPct > 2 ? 'improved' : restorationPct < -2 ? 'reduced' : 'similar';
  const fuelEconomy = rpm < 2200 ? 'improved' : rpm > 2500 ? 'reduced' : 'similar';

  return {
    rpm: Math.round(rpm),
    crawlRatio: crawlRatio.toFixed(1),
    restorationPercentage: restorationPct,
    acceleration,
    fuelEconomy,
    highwayComfort: rpm < 2400 ? 'comfortable' : rpm < 2700 ? 'moderate' : 'high RPM'
  };
}

/**
 * Generate verdict for a gear ratio based on use case
 */
function generateVerdict(impact, useCase) {
  let score = 50; // Base score
  let pros = [];
  let cons = [];
  let recommendation = '';

  // Score based on RPM target
  const rpmDiff = Math.abs(impact.rpm - useCase.targetRPMAt65);
  if (rpmDiff < 100) {
    score += 30;
    pros.push('Ideal RPM for intended use');
  } else if (rpmDiff < 200) {
    score += 20;
    pros.push('Good RPM range for intended use');
  } else if (rpmDiff > 400) {
    score -= 20;
    cons.push('RPM significantly off target');
  }

  // Use case specific scoring
  switch (useCase.priority) {
    case 'fuel_economy':
      if (impact.fuelEconomy === 'improved') {
        score += 20;
        pros.push('Better fuel economy');
      } else if (impact.fuelEconomy === 'reduced') {
        score -= 15;
        cons.push('Reduced fuel economy');
      }
      break;

    case 'torque':
      if (parseFloat(impact.crawlRatio) >= 50) {
        score += 25;
        pros.push('Excellent crawl ratio for technical terrain');
      } else if (parseFloat(impact.crawlRatio) < 40) {
        score -= 15;
        cons.push('Crawl ratio may be insufficient for difficult rock crawling');
      }
      break;

    case 'power':
      if (impact.acceleration === 'improved') {
        score += 20;
        pros.push('Improved acceleration and power delivery');
      } else if (impact.acceleration === 'reduced') {
        score -= 15;
        cons.push('Reduced acceleration');
      }
      break;

    case 'balanced':
      if (Math.abs(impact.restorationPercentage) < 5) {
        score += 20;
        pros.push('Well-balanced performance restoration');
      }
      break;
  }

  // Highway comfort
  if (impact.highwayComfort === 'comfortable') {
    pros.push('Comfortable highway cruising RPM');
  } else if (impact.highwayComfort === 'high RPM') {
    cons.push('High RPM on highway - may be loud and hurt fuel economy');
  }

  // Generate recommendation text
  if (score >= 80) {
    recommendation = 'Excellent choice for your use case';
  } else if (score >= 65) {
    recommendation = 'Good option for your use case';
  } else if (score >= 50) {
    recommendation = 'Acceptable but not ideal';
  } else {
    recommendation = 'Not recommended for your use case';
  }

  return {
    score,
    pros,
    cons,
    recommendation
  };
}

/**
 * Analyze overall re-gear impact
 */
function analyzeRegearImpact(comparison, currentRatio, recommendedRatio) {
  if (!recommendedRatio) return null;

  const costEstimate = {
    gears: { min: 800, max: 1500 },
    installation: { min: 600, max: 1200 },
    total: { min: 1400, max: 2700 }
  };

  const considerations = [
    'Re-gearing requires professional installation and setup',
    'Both front and rear axles should be re-geared together for 4WD/AWD vehicles',
    'Locker installation can be done simultaneously to save labor costs',
    'Gear ratio change may require speedometer recalibration'
  ];

  const benefits = [
    'Restores factory-like acceleration and power delivery',
    'Reduces transmission and engine strain',
    'Improves drivability with larger tires',
    'Can improve fuel economy compared to running tall tires with low gears'
  ];

  return {
    costEstimate,
    considerations,
    benefits,
    timeline: '1-2 days for professional installation'
  };
}

/**
 * Get all available gear ratios (for UI selection)
 */
export function getAvailableGearRatios() {
  return AVAILABLE_GEAR_RATIOS;
}

/**
 * Get all use case profiles (for UI selection)
 */
export function getUseCaseProfiles() {
  return USE_CASE_PROFILES;
}
