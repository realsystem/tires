/**
 * Enhanced Clearance Probability Module
 *
 * PURPOSE: Predict likelihood of tire fitment issues based on suspension type,
 * lift height, and tire dimensions. Provides realistic probability assessments
 * and component-specific warnings.
 *
 * METHODOLOGY:
 * - Decision tree logic based on suspension type (IFS vs Solid Axle)
 * - Probability classification: LOW (<30%), MODERATE (30-70%), HIGH (>70%)
 * - Component-specific warnings (UCAs, wheel wells, fenders, brake lines)
 * - Lift requirement calculations
 *
 * SUSPENSION TYPES:
 * - IFS (Independent Front Suspension): Tacoma, 4Runner, FJ Cruiser, Tundra
 * - Solid Axle: Jeep Wrangler, Gladiator, older 4Runners, classic trucks
 */

/**
 * Calculate clearance probability and fitment analysis
 *
 * @param {object} params - Clearance analysis parameters
 * @param {string} params.suspensionType - 'ifs' or 'solid_axle'
 * @param {number} params.liftHeight - Current lift height in inches (0 for stock)
 * @param {number} params.diameterIncrease - Tire diameter increase in inches
 * @param {number} params.widthIncrease - Tire width increase in inches
 * @param {number} params.newDiameter - New tire diameter in inches
 * @param {number} params.newWidth - New tire width in inches (mm/25.4)
 * @param {string} params.vehicleType - Vehicle type for specific guidance (optional)
 * @returns {object} Clearance probability analysis
 */
export function calculateClearanceProbability(params) {
  const {
    suspensionType = 'ifs',
    liftHeight = 0,
    diameterIncrease,
    widthIncrease,
    newDiameter,
    newWidth,
    vehicleType = 'generic'
  } = params;

  // Decision tree based on suspension type
  const analysis = suspensionType === 'solid_axle'
    ? analyzeSolidAxleClearance(params)
    : analyzeIFSClearance(params);

  // Add component warnings
  const componentWarnings = generateComponentWarnings(analysis, params);

  // Calculate recommended lift (if needed)
  const liftRecommendation = calculateLiftRequirement(analysis, params);

  // Generate trimming assessment
  const trimmingAssessment = assessTrimmingRequirement(analysis, params);

  return {
    ...analysis,
    componentWarnings,
    liftRecommendation,
    trimmingAssessment,
    summary: generateClearanceSummary(analysis, params)
  };
}

/**
 * Analyze IFS (Independent Front Suspension) clearance
 * IFS vehicles are more restrictive due to upper control arms (UCAs)
 */
function analyzeIFSClearance(params) {
  const { liftHeight, diameterIncrease, widthIncrease, newDiameter } = params;

  let probability = 0;
  let riskClass = 'LOW';
  let primaryIssue = null;

  // IFS Decision Tree
  // Stock height (0" lift)
  if (liftHeight === 0) {
    if (diameterIncrease <= 1) {
      probability = 10; // Stock +1" usually fits
      riskClass = 'LOW';
    } else if (diameterIncrease <= 2) {
      probability = 45; // Stock +2" marginal
      riskClass = 'MODERATE';
      primaryIssue = 'UCA contact at full stuff';
    } else {
      probability = 85; // Stock +3"+ definitely rubs
      riskClass = 'HIGH';
      primaryIssue = 'UCA contact, fender liner contact';
    }
  }
  // 1-2" lift
  else if (liftHeight >= 1 && liftHeight < 2.5) {
    if (diameterIncrease <= 2) {
      probability = 15; // 2" lift + 2" tire usually fits
      riskClass = 'LOW';
    } else if (diameterIncrease <= 3) {
      probability = 50; // 2" lift + 3" tire marginal
      riskClass = 'MODERATE';
      primaryIssue = 'UCA contact at full compression';
    } else {
      probability = 80;
      riskClass = 'HIGH';
      primaryIssue = 'UCA contact, CMC removal required';
    }
  }
  // 2.5-3.5" lift
  else if (liftHeight >= 2.5 && liftHeight < 3.5) {
    if (diameterIncrease <= 3) {
      probability = 20; // 3" lift + 3" tire fits with minor trimming
      riskClass = 'LOW';
    } else if (diameterIncrease <= 4) {
      probability = 55; // 3" lift + 4" tire needs work
      riskClass = 'MODERATE';
      primaryIssue = 'CMC trimming, possible UCA contact';
    } else {
      probability = 75;
      riskClass = 'HIGH';
      primaryIssue = 'Extensive trimming, UCA spacers, wheel offset changes';
    }
  }
  // 3.5"+ lift
  else {
    if (diameterIncrease <= 4) {
      probability = 25;
      riskClass = 'LOW';
    } else if (diameterIncrease <= 5) {
      probability = 50;
      riskClass = 'MODERATE';
      primaryIssue = 'Significant trimming required';
    } else {
      probability = 70;
      riskClass = 'HIGH';
      primaryIssue = 'Major modifications required';
    }
  }

  // Width penalty for IFS (narrower wheel wells)
  if (widthIncrease > 1.5) {
    probability += 15; // Wide tires increase rub risk
    if (probability > 70) {
      riskClass = 'HIGH';
      primaryIssue = primaryIssue || 'Fender liner contact';
    }
  }

  // Large tires (37"+) on IFS always require significant work
  if (newDiameter >= 37) {
    probability = Math.max(probability, 65);
    riskClass = 'HIGH';
    primaryIssue = '37"+ tires require extensive modifications on IFS';
  }

  return {
    probability: Math.min(probability, 95), // Cap at 95%
    riskClass,
    primaryIssue,
    suspensionType: 'IFS',
    notes: [
      'IFS vehicles have more restrictive clearance due to upper control arms',
      'Full compression (stuffing suspension) is the critical measurement point',
      'Dynamic clearance (flexing off-road) requires more space than static'
    ]
  };
}

/**
 * Analyze Solid Axle clearance
 * Solid axle vehicles are more forgiving with clearance
 */
function analyzeSolidAxleClearance(params) {
  const { liftHeight, diameterIncrease, widthIncrease, newDiameter } = params;

  let probability = 0;
  let riskClass = 'LOW';
  let primaryIssue = null;

  // Solid Axle Decision Tree
  // Stock height
  if (liftHeight === 0) {
    if (diameterIncrease <= 1.5) {
      probability = 5; // Solid axle more forgiving
      riskClass = 'LOW';
    } else if (diameterIncrease <= 3) {
      probability = 35;
      riskClass = 'MODERATE';
      primaryIssue = 'Fender liner contact at full stuff';
    } else {
      probability = 75;
      riskClass = 'HIGH';
      primaryIssue = 'Fender contact, bump stops need trimming';
    }
  }
  // 1-2.5" lift
  else if (liftHeight >= 1 && liftHeight < 2.5) {
    if (diameterIncrease <= 3) {
      probability = 10;
      riskClass = 'LOW';
    } else if (diameterIncrease <= 4) {
      probability = 40;
      riskClass = 'MODERATE';
      primaryIssue = 'Minor fender trimming may be needed';
    } else {
      probability = 70;
      riskClass = 'HIGH';
      primaryIssue = 'Fender trimming required';
    }
  }
  // 2.5-3.5" lift
  else if (liftHeight >= 2.5 && liftHeight < 3.5) {
    if (diameterIncrease <= 4) {
      probability = 15;
      riskClass = 'LOW';
    } else if (diameterIncrease <= 5) {
      probability = 45;
      riskClass = 'MODERATE';
      primaryIssue = 'Fender trimming, possible flat fenders';
    } else {
      probability = 65;
      riskClass = 'HIGH';
      primaryIssue = 'Major trimming or flat fenders required';
    }
  }
  // 3.5"+ lift
  else {
    if (diameterIncrease <= 5) {
      probability = 20;
      riskClass = 'LOW';
    } else if (diameterIncrease <= 6) {
      probability = 40;
      riskClass = 'MODERATE';
      primaryIssue = 'Trimming likely needed';
    } else {
      probability = 60;
      riskClass = 'HIGH';
      primaryIssue = 'Flat fenders or major body modifications';
    }
  }

  // Width is less critical on solid axle (more wheel well space)
  if (widthIncrease > 2) {
    probability += 10;
    if (probability > 70) {
      riskClass = 'HIGH';
    }
  }

  // 40"+ tires always require work
  if (newDiameter >= 40) {
    probability = Math.max(probability, 60);
    riskClass = 'HIGH';
    primaryIssue = '40"+ tires require significant modifications';
  }

  return {
    probability: Math.min(probability, 90), // Cap at 90%
    riskClass,
    primaryIssue,
    suspensionType: 'Solid Axle',
    notes: [
      'Solid axle vehicles have more clearance flexibility than IFS',
      'Check clearance at full droop and full compression',
      'Wheel offset and backspacing significantly affect clearance'
    ]
  };
}

/**
 * Generate component-specific warnings
 */
function generateComponentWarnings(analysis, params) {
  const { suspensionType, probability, riskClass } = analysis;
  const { diameterIncrease, widthIncrease, liftHeight } = params;
  const warnings = [];

  // IFS-specific warnings
  if (suspensionType === 'IFS') {
    if (probability > 40) {
      warnings.push({
        component: 'Upper Control Arms (UCAs)',
        risk: riskClass,
        description: 'Tire may contact UCA at full compression. Consider aftermarket UCAs with more clearance.',
        severity: probability > 70 ? 'critical' : 'moderate'
      });
    }

    if (diameterIncrease > 2 && liftHeight < 2) {
      warnings.push({
        component: 'Cab Mount Chop (CMC)',
        risk: 'MODERATE',
        description: 'CMC trimming likely required for adequate turning radius without rubbing.',
        severity: 'moderate'
      });
    }

    if (widthIncrease > 1.5) {
      warnings.push({
        component: 'Fender Liners',
        risk: 'MODERATE',
        description: 'Fender liner trimming or removal may be necessary.',
        severity: 'minor'
      });
    }
  }

  // Solid axle warnings
  if (suspensionType === 'Solid Axle') {
    if (probability > 50) {
      warnings.push({
        component: 'Fender Wells',
        risk: riskClass,
        description: 'Fender trimming or flat fenders may be required.',
        severity: probability > 70 ? 'moderate' : 'minor'
      });
    }

    if (diameterIncrease > 4) {
      warnings.push({
        component: 'Bump Stops',
        risk: 'MODERATE',
        description: 'Bump stop trimming or relocation may be needed.',
        severity: 'minor'
      });
    }
  }

  // Universal warnings
  if (widthIncrease > 2) {
    warnings.push({
      component: 'Mud Flaps',
      risk: 'LOW',
      description: 'Mud flaps will likely need to be removed or relocated.',
      severity: 'minor'
    });
  }

  if (diameterIncrease > 3 && liftHeight < 3) {
    warnings.push({
      component: 'Brake Lines',
      risk: 'MODERATE',
      description: 'Extended brake lines may be required for adequate flex.',
      severity: 'moderate'
    });
  }

  if (diameterIncrease > 5) {
    warnings.push({
      component: 'Speedometer/ABS',
      risk: 'LOW',
      description: 'Speedometer recalibration required. ABS/traction control may behave differently.',
      severity: 'minor'
    });
  }

  return warnings;
}

/**
 * Calculate recommended lift height
 */
function calculateLiftRequirement(analysis, params) {
  const { suspensionType, probability, riskClass } = analysis;
  const { diameterIncrease, liftHeight } = params;

  if (riskClass === 'LOW') {
    return {
      required: false,
      currentAdequate: true,
      message: 'Current lift is adequate for this tire size'
    };
  }

  // Rule of thumb: need ~0.75-1" lift per 1" diameter increase
  const multiplier = suspensionType === 'IFS' ? 0.85 : 0.75;
  const idealLift = diameterIncrease * multiplier;
  const additionalLiftNeeded = Math.max(0, idealLift - liftHeight);

  if (additionalLiftNeeded < 0.5) {
    return {
      required: false,
      currentAdequate: true,
      message: `Current ${liftHeight}" lift is sufficient with minor trimming`
    };
  }

  return {
    required: true,
    currentAdequate: false,
    additionalNeeded: Math.ceil(additionalLiftNeeded * 2) / 2, // Round to nearest 0.5"
    recommended: Math.ceil(idealLift * 2) / 2,
    message: `Recommend ${Math.ceil(idealLift * 2) / 2}" total lift for proper clearance`
  };
}

/**
 * Assess trimming requirements
 */
function assessTrimmingRequirement(analysis, params) {
  const { probability, riskClass, suspensionType } = analysis;
  const { diameterIncrease } = params;

  let trimmingProbability = 0;
  let extent = 'none';

  if (probability < 30) {
    trimmingProbability = 10;
    extent = 'minimal';
  } else if (probability < 50) {
    trimmingProbability = 50;
    extent = 'minor';
  } else if (probability < 70) {
    trimmingProbability = 75;
    extent = 'moderate';
  } else {
    trimmingProbability = 90;
    extent = 'extensive';
  }

  const areas = [];
  if (suspensionType === 'IFS' && diameterIncrease > 2) {
    areas.push('Cab mount chop (CMC)');
  }
  if (probability > 40) {
    areas.push('Fender liners');
  }
  if (probability > 60) {
    areas.push('Inner fender wells');
  }
  if (probability > 70) {
    areas.push('Pinch welds', 'Bump stops');
  }

  return {
    probability: trimmingProbability,
    extent,
    areas,
    message: extent === 'none'
      ? 'No trimming required'
      : `${extent.charAt(0).toUpperCase() + extent.slice(1)} trimming likely needed`
  };
}

/**
 * Generate clearance summary
 */
function generateClearanceSummary(analysis, params) {
  const { probability, riskClass, primaryIssue, suspensionType } = analysis;
  const { liftHeight, diameterIncrease } = params;

  if (riskClass === 'LOW') {
    return `Low clearance risk (${probability}% chance of rubbing). This tire size should fit with ${liftHeight > 0 ? 'your current lift' : 'minimal or no modifications'}.`;
  } else if (riskClass === 'MODERATE') {
    return `Moderate clearance risk (${probability}% chance of rubbing). ${primaryIssue || 'Some modifications may be required'}. Expect minor trimming or small lift addition.`;
  } else {
    return `High clearance risk (${probability}% chance of rubbing). ${primaryIssue || 'Significant modifications required'}. ${suspensionType === 'IFS' ? 'IFS clearance is challenging with this tire size.' : 'Plan for extensive trimming or additional lift.'}`;
  }
}

/**
 * Get vehicle-specific suspension type
 * Helper function for common vehicles
 */
export function getVehicleSuspensionType(vehicleType) {
  const ifsVehicles = [
    'tacoma', '4runner', 'fj_cruiser', 'tundra', 'sequoia',
    'frontier', 'xterra', 'colorado', 'canyon'
  ];

  const solidAxleVehicles = [
    'wrangler', 'gladiator', 'bronco', 'defender',
    '4runner_pre_2003', 'landcruiser_70', 'g_wagon'
  ];

  const normalized = vehicleType.toLowerCase().replace(/\s+/g, '_');

  if (ifsVehicles.some(v => normalized.includes(v))) {
    return 'ifs';
  }

  if (solidAxleVehicles.some(v => normalized.includes(v))) {
    return 'solid_axle';
  }

  // Default to IFS (more conservative)
  return 'ifs';
}
