/**
 * Advisory Engine
 * Provides intelligent warnings, recommendations, and build guidance
 * Based on real-world off-road and overland experience
 */

/**
 * Generate comprehensive advisory report
 * @param {Object} comparison - Tire comparison results
 * @param {string} intendedUse - Intended use case
 * @param {Object} vehicleInfo - Optional vehicle information
 * @returns {Object} Complete advisory report
 */
export function generateAdvisory(comparison, intendedUse = 'weekend_trail', vehicleInfo = {}) {
  const warnings = generateWarnings(comparison, intendedUse, vehicleInfo);
  const recommendations = generateRecommendations(comparison, intendedUse, vehicleInfo);
  const buildImpact = assessBuildImpact(comparison, intendedUse);
  const airDownGuidance = generateAirDownGuidance(comparison.new, intendedUse);
  const overlanding = generateOverlandingAdvice(comparison, intendedUse);

  return {
    severity: determineSeverity(warnings),
    warnings,
    recommendations,
    buildImpact,
    airDownGuidance,
    overlanding
  };
}

/**
 * Generate warnings based on tire changes
 */
function generateWarnings(comparison, intendedUse, vehicleInfo) {
  const warnings = {
    critical: [],
    important: [],
    advisory: []
  };

  const diameterPct = comparison.differences.diameter.percentage;
  const widthPct = comparison.differences.width.percentage;
  const diameterInches = comparison.differences.diameter.inches;
  const widthInches = comparison.differences.width.inches;

  // Critical warnings (safety and major mechanical issues)
  if (diameterPct > 15) {
    warnings.critical.push({
      category: 'Drivetrain',
      message: 'Diameter increase >15% is EXTREME',
      detail: 'Severe risk of transmission failure, U-joint damage, CV axle failure, and wheel bearing damage. Re-gearing is mandatory. Consider if this tire size is appropriate for your build budget.',
      action: 'Reconsider tire size or budget for comprehensive drivetrain upgrades'
    });
  }

  if (widthPct > 25 && vehicleInfo.suspensionType === 'ifs') {
    warnings.critical.push({
      category: 'Suspension',
      message: 'Significant width increase on IFS suspension',
      detail: 'Wide tires on independent front suspension create extreme CV axle angles and can cause binding, boot tearing, and premature failure. Upper control arm clearance may be insufficient.',
      action: 'Verify CV axle angles and consider UCA upgrades or narrower tire'
    });
  }

  // Important warnings (significant impact, not immediately dangerous)
  if (diameterPct > 10) {
    warnings.important.push({
      category: 'Drivetrain',
      message: 'Re-gearing strongly recommended',
      detail: `Diameter increase of ${diameterPct.toFixed(1)}% will noticeably reduce power, increase transmission heat, and cause excessive strain on drivetrain components.`,
      action: 'Budget for axle re-gearing to restore performance'
    });
  }

  if (diameterInches > 2) {
    warnings.important.push({
      category: 'Braking',
      message: 'Braking performance will be reduced',
      detail: 'Larger tire diameter increases rotational mass and reduces braking leverage. Brake pad wear will increase. Consider brake upgrades for heavy vehicles or frequent towing.',
      action: 'Upgrade brake pads, test stopping distances, consider bigger brake kit'
    });
  }

  if (widthInches > 2) {
    warnings.important.push({
      category: 'Clearance',
      message: 'Significant width increase',
      detail: 'Fender clearance will be tight or insufficient. Expect rubbing on frame, body mounts, or control arms during articulation and turning.',
      action: 'Plan for fender trimming, body mount chop, or wheel spacers'
    });
  }

  if (comparison.new.aspectRatio < 65 && intendedUse !== 'daily_driver') {
    warnings.important.push({
      category: 'Off-Road Capability',
      message: 'Low profile tire for off-road use',
      detail: 'Aspect ratio <65 provides less sidewall flex and cushioning. Increased risk of wheel damage on rocks and sharp impacts. Ride quality will be harsh off-road.',
      action: 'Consider higher aspect ratio tire for better off-road performance'
    });
  }

  // Advisory warnings (good to know, plan accordingly)
  if (diameterPct > 5) {
    warnings.advisory.push({
      category: 'Fuel Economy',
      message: 'Fuel economy will decrease',
      detail: `Larger tire diameter increases rotational mass and rolling resistance. Expect 1-3 MPG decrease depending on driving conditions and gearing.`,
      action: 'Factor increased fuel costs into build budget'
    });
  }

  if (comparison.speedometerError.ratio > 1.05) {
    const error = ((comparison.speedometerError.ratio - 1) * 100).toFixed(1);
    warnings.advisory.push({
      category: 'Speedometer',
      message: `Speedometer will read ${error}% slow`,
      detail: 'Your indicated speed will be lower than actual speed. This affects odometer accuracy and speeding tickets.',
      action: 'Recalibrate speedometer or use GPS for accurate speed'
    });
  }

  if (vehicleInfo.suspensionType === 'ifs' && diameterInches > 1.5) {
    warnings.advisory.push({
      category: 'Suspension',
      message: 'IFS suspension may need additional modifications',
      detail: 'Independent front suspension has limited clearance. May need diff drop, coil bucket trimming, or upper control arm adjustments.',
      action: 'Research IFS-specific clearancing for your vehicle platform'
    });
  }

  if (comparison.new.isLT === false && intendedUse !== 'daily_driver') {
    warnings.advisory.push({
      category: 'Load Rating',
      message: 'P-metric tire for off-road use',
      detail: 'P-metric tires have lower load ratings and weaker sidewalls than LT tires. Not ideal for heavy loads, armor, or rock crawling.',
      action: 'Consider LT-rated tires for serious off-road and overland use'
    });
  }

  return warnings;
}

/**
 * Generate recommendations
 */
function generateRecommendations(comparison, intendedUse, vehicleInfo) {
  const recommendations = [];

  const diameterPct = comparison.differences.diameter.percentage;
  const diameterInches = comparison.differences.diameter.inches;

  // Suspension recommendations
  if (diameterInches > 0.5) {
    const liftNeeded = comparison.clearance.estimatedLiftRequired;
    recommendations.push({
      category: 'Suspension',
      title: 'Suspension Lift',
      priority: liftNeeded > 2 ? 'high' : 'medium',
      items: [
        `Estimated ${liftNeeded}" lift needed for clearance`,
        'Consider adjustable control arms for proper alignment',
        'Extended brake lines may be required',
        liftNeeded > 2 ? 'Longer shocks required' : 'Stock shocks may work with lift spacers'
      ]
    });
  }

  // Wheel recommendations
  if (comparison.differences.width.inches > 1.5) {
    recommendations.push({
      category: 'Wheels',
      title: 'Wheel Offset & Backspacing',
      priority: 'high',
      items: [
        'Reduce wheel backspacing to push tires outward',
        'Typical: -12mm to +25mm offset for off-road builds',
        'Beadlock wheels recommended for <15 PSI airing down',
        'Verify wheel load rating matches or exceeds tire load rating'
      ]
    });
  }

  // Gearing recommendations
  if (diameterPct > 5 && comparison.drivetrainImpact) {
    const rpm = comparison.drivetrainImpact.rpm.new;
    recommendations.push({
      category: 'Drivetrain',
      title: 'Re-Gearing',
      priority: diameterPct > 10 ? 'critical' : 'high',
      items: [
        `Current: ${rpm.toFixed(0)} RPM at 65 mph with new tires`,
        'Re-gear both axles together for 4WD/AWD',
        'Install lockers at same time to save labor cost',
        'Speedometer recalibration required after re-gear'
      ]
    });
  }

  // Clearance modifications
  if (comparison.clearance.fenderClearance.concern) {
    recommendations.push({
      category: 'Clearance',
      title: 'Clearancing Modifications',
      priority: 'high',
      items: [
        'Fender trimming likely required (pinch weld, fender liner)',
        'Body mount chop (BMC) may be needed for full articulation',
        'Bump stop extensions to prevent tire contact',
        'Test fit and cycle suspension before finalizing'
      ]
    });
  }

  // Use-case specific recommendations
  if (intendedUse === 'rock_crawling') {
    recommendations.push({
      category: 'Rock Crawling',
      title: 'Technical Terrain Prep',
      priority: 'medium',
      items: [
        'Beadlock wheels critical for low PSI (5-8 PSI)',
        'Consider 8-ply or 10-ply sidewalls for durability',
        'Differential skid plates to protect from rocks',
        'Armor: sliders, front/rear bumpers with recovery points'
      ]
    });
  }

  if (intendedUse === 'overlanding') {
    recommendations.push({
      category: 'Overlanding',
      title: 'Expedition Build Considerations',
      priority: 'medium',
      items: [
        'Carry two full-size spares if possible',
        'Load range E tires for heavy gear loads',
        'Larger diameter improves ground clearance for ruts',
        'Balance and rotate frequently for even wear'
      ]
    });
  }

  return recommendations;
}

/**
 * Assess build impact across all systems
 */
function assessBuildImpact(comparison, intendedUse) {
  const diameterPct = comparison.differences.diameter.percentage;

  return {
    suspension: {
      impact: diameterPct > 5 ? 'high' : diameterPct > 2 ? 'medium' : 'low',
      description: comparison.clearance.liftRecommendation,
      modifications: diameterPct > 2 ? ['Lift kit', 'Extended brake lines', 'Bump stop extensions'] : ['May fit stock']
    },
    drivetrain: {
      impact: diameterPct > 10 ? 'critical' : diameterPct > 5 ? 'high' : 'medium',
      description: comparison.drivetrainImpact?.effectiveGearRatio.summary || 'Minimal impact',
      modifications: diameterPct > 5 ? ['Re-gearing required'] : ['Re-gearing optional but recommended']
    },
    steering: {
      impact: comparison.differences.width.percentage > 15 ? 'high' : 'medium',
      description: 'Heavier tires increase steering effort and wear',
      modifications: comparison.differences.width.percentage > 15
        ? ['Consider hydro assist steering', 'Heavy-duty tie rod', 'Steering stabilizer']
        : ['Monitor steering component wear']
    },
    brakes: {
      impact: diameterPct > 8 ? 'high' : diameterPct > 4 ? 'medium' : 'low',
      description: 'Larger diameter reduces braking leverage',
      modifications: diameterPct > 8
        ? ['Upgrade brake pads', 'Consider larger rotor kit']
        : ['Upgrade to performance brake pads']
    },
    fuelEconomy: {
      impact: diameterPct > 7 ? 'high' : diameterPct > 3 ? 'medium' : 'low',
      description: `Estimated ${Math.round(diameterPct / 3)}-${Math.round(diameterPct / 2)} MPG reduction`,
      note: 'Re-gearing helps but won\'t fully restore economy'
    }
  };
}

/**
 * Generate air-down guidance for off-road use
 */
function generateAirDownGuidance(newTire, intendedUse) {
  const baseStreetPSI = newTire.isLT ? 35 : 32;

  const guidance = {
    street: {
      psi: baseStreetPSI,
      description: 'Normal street driving'
    },
    dirt_road: {
      psi: baseStreetPSI - 5,
      description: 'Improved comfort on washboard and gravel roads',
      warning: null
    },
    trail: {
      psi: Math.round(baseStreetPSI * 0.65),
      description: 'General trail riding, moderate obstacles',
      warning: 'Monitor tire temperature on long trips'
    },
    rock: {
      psi: Math.round(baseStreetPSI * 0.45),
      description: 'Technical rock crawling, maximum traction',
      warning: 'Beadlock wheels strongly recommended. Risk of bead unseating without beadlocks.'
    },
    sand: {
      psi: Math.round(baseStreetPSI * 0.40),
      description: 'Soft sand, maximum flotation',
      warning: 'Re-inflate ASAP when back on hard surface. Sidewall heat buildup risk.'
    }
  };

  // Adjust for use case
  const notes = [];

  if (newTire.aspectRatio < 70) {
    notes.push('Lower aspect ratio tires are more vulnerable to rim damage at low PSI');
  }

  if (!newTire.isLT) {
    notes.push('P-metric tires have weaker sidewalls - avoid extremely low PSI');
  }

  if (intendedUse === 'overlanding') {
    notes.push('For overlanding: balance traction needs with sidewall durability. Higher PSI for loaded rigs.');
  }

  return {
    guidance,
    notes,
    general: [
      'Always air down all four tires evenly',
      'Carry quality tire pressure gauge and compressor',
      'Re-inflate before highway speeds',
      'Lower PSI = more puncture risk on sharp rocks'
    ]
  };
}

/**
 * Generate overlanding-specific advice
 */
function generateOverlandingAdvice(comparison, intendedUse) {
  if (intendedUse !== 'overlanding') return null;

  return {
    spareStrategy: {
      title: 'Spare Tire Strategy',
      advice: [
        'Ideal: Carry two full-size spares for remote expeditions',
        'Minimum: One matching spare with same size and load rating',
        'Consider spare tire carrier weight limits',
        'Verify spare clearance in stock location'
      ]
    },
    loadConsiderations: {
      title: 'Load & Weight Distribution',
      advice: [
        `Tire load rating: Verify ${comparison.new.isLT ? 'LT' : 'P-metric'} rating supports loaded vehicle weight`,
        'Larger tires add unsprung weight - affects handling',
        'Roof rack + RTT + gear: front suspension may need helper springs',
        'Weigh vehicle fully loaded to verify tire capacity'
      ]
    },
    longDistance: {
      title: 'Long-Distance Reliability',
      advice: [
        'Larger diameter = fewer rotations = potentially longer tire life',
        'Balance and rotate every 5k miles for even wear',
        'Carry tire repair kit: plugs, patches, CO2 cartridges',
        'Monitor tire pressure daily on long trips (TPMS recommended)'
      ]
    },
    fuelRange: {
      title: 'Fuel Range Impact',
      advice: [
        `Expect ~${Math.round(comparison.differences.diameter.percentage / 2.5)} MPG decrease`,
        'Larger tires reduce effective fuel range',
        'Plan fuel stops conservatively in remote areas',
        'Auxiliary fuel tank or jerry cans may be necessary'
      ]
    }
  };
}

/**
 * Determine overall severity level
 */
function determineSeverity(warnings) {
  if (warnings.critical.length > 0) return 'critical';
  if (warnings.important.length > 2) return 'high';
  if (warnings.important.length > 0) return 'medium';
  return 'low';
}
