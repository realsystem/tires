/**
 * Upgrade Path Engine
 *
 * PURPOSE: Generate prioritized, sequential upgrade recommendations based on
 * tire size change, drivetrain stress, and intended use. Provides realistic
 * cost estimates and timeline guidance.
 *
 * METHODOLOGY:
 * - Rule-based prioritization system
 * - Safety-critical upgrades first (brakes, suspension)
 * - Performance restoration second (regearing)
 * - Protection third (armor, sliders)
 * - Considers budget levels: Budget, Mid-Range, Premium
 */

/**
 * Generate upgrade path recommendations
 *
 * @param {object} analysis - Complete tire analysis with stress scores
 * @param {string} budgetLevel - 'budget', 'mid_range', 'premium'
 * @param {string} timeline - 'immediate', 'phased', 'eventual'
 * @returns {object} Prioritized upgrade path
 */
export function generateUpgradePath(analysis, budgetLevel = 'mid_range', timeline = 'phased') {
  const upgrades = [];

  // Extract key metrics
  const stressScore = analysis.drivetrainStress?.score || 0;
  const diameterIncrease = Math.abs(analysis.differences.diameter.inches);
  const rotationalImpact = analysis.rotationalPhysics?.changes.rotational_inertia.factor || 0;
  const clearanceRisk = analysis.clearance?.probabilityAnalysis?.riskClass || 'LOW';

  // Priority 1: Safety-Critical (Always first)
  if (rotationalImpact > 10 || stressScore > 60) {
    upgrades.push({
      priority: 1,
      category: 'Safety',
      upgrade: 'Brake Upgrade',
      necessity: 'essential',
      reason: 'Larger/heavier tires significantly increase braking distances',
      cost: estimateCost('brakes', budgetLevel),
      timeline: 'before driving',
      options: getBrakeOptions(budgetLevel)
    });
  }

  // Priority 2: Suspension (if needed for clearance or load)
  if (clearanceRisk === 'HIGH' || clearanceRisk === 'MODERATE') {
    const liftNeeded = analysis.clearance?.probabilityAnalysis?.liftRecommendation?.recommended || 2;

    upgrades.push({
      priority: 2,
      category: 'Clearance',
      upgrade: `${liftNeeded}" Suspension Lift`,
      necessity: clearanceRisk === 'HIGH' ? 'essential' : 'recommended',
      reason: `${clearanceRisk} clearance risk - lift needed to prevent rubbing`,
      cost: estimateCost('lift', budgetLevel, liftNeeded),
      timeline: 'with tire install',
      options: getSuspensionOptions(budgetLevel, liftNeeded)
    });
  }

  // Priority 3: Regearing (performance restoration)
  if (stressScore >= 50) {
    const gearIncrease = analysis.drivetrainStress?.regearing?.suggestedGearIncrease?.percentIncrease || 10;

    upgrades.push({
      priority: 3,
      category: 'Performance',
      upgrade: 'Axle Regearing',
      necessity: stressScore >= 70 ? 'essential' : 'strongly recommended',
      reason: `${stressScore}/100 drivetrain stress - restore factory performance`,
      cost: estimateCost('regear', budgetLevel),
      timeline: 'within 3-6 months',
      options: getRegearOptions(budgetLevel, gearIncrease)
    });
  } else if (stressScore >= 35) {
    upgrades.push({
      priority: 4,
      category: 'Performance',
      upgrade: 'Axle Regearing',
      necessity: 'recommended',
      reason: 'Moderate drivetrain stress - regearing improves driveability',
      cost: estimateCost('regear', budgetLevel),
      timeline: 'eventual upgrade',
      options: getRegearOptions(budgetLevel, 8)
    });
  }

  // Priority 4: Wheels & Offset (if width increased significantly)
  if (analysis.differences.width.inches > 1.5) {
    upgrades.push({
      priority: clearanceRisk === 'HIGH' ? 2 : 5,
      category: 'Fitment',
      upgrade: 'Wheels with Proper Offset',
      necessity: clearanceRisk === 'HIGH' ? 'required' : 'recommended',
      reason: 'Wider tires require less backspacing to prevent rubbing',
      cost: estimateCost('wheels', budgetLevel),
      timeline: 'with tire install',
      options: getWheelOptions(budgetLevel)
    });
  }

  // Priority 5: Body/Fender Modifications (if needed)
  if (clearanceRisk === 'HIGH' || clearanceRisk === 'MODERATE') {
    const trimmingNeeded = analysis.clearance?.probabilityAnalysis?.trimmingAssessment?.extent || 'minor';

    if (trimmingNeeded !== 'none' && trimmingNeeded !== 'minimal') {
      upgrades.push({
        priority: 6,
        category: 'Fitment',
        upgrade: 'Fender/Body Trimming',
        necessity: trimmingNeeded === 'extensive' ? 'required' : 'likely needed',
        reason: `${trimmingNeeded} trimming for full articulation clearance`,
        cost: estimateCost('trimming', budgetLevel, trimmingNeeded),
        timeline: 'with tire install',
        options: getTrimmingOptions(trimmingNeeded)
      });
    }
  }

  // Priority 6: Protection (armor, sliders)
  if (diameterIncrease > 2) {
    upgrades.push({
      priority: 7,
      category: 'Protection',
      upgrade: 'Rock Sliders',
      necessity: 'recommended',
      reason: 'Larger tires for off-road use - protect rocker panels',
      cost: estimateCost('sliders', budgetLevel),
      timeline: 'next phase',
      options: getArmorOptions('sliders', budgetLevel)
    });
  }

  // Priority 7: Bumpers (if going full build)
  if (diameterIncrease > 3 && budgetLevel !== 'budget') {
    upgrades.push({
      priority: 8,
      category: 'Protection',
      upgrade: 'Aftermarket Bumpers',
      necessity: 'optional',
      reason: 'Improved approach/departure angles, winch mounting',
      cost: estimateCost('bumpers', budgetLevel),
      timeline: 'future upgrade',
      options: getArmorOptions('bumpers', budgetLevel)
    });
  }

  // Sort by priority
  upgrades.sort((a, b) => a.priority - b.priority);

  // Calculate totals
  const totalCost = upgrades.reduce((sum, u) => {
    const avg = (u.cost.min + u.cost.max) / 2;
    return sum + avg;
  }, 0);

  const essentialCost = upgrades
    .filter(u => u.necessity === 'essential' || u.necessity === 'required')
    .reduce((sum, u) => {
      const avg = (u.cost.min + u.cost.max) / 2;
      return sum + avg;
    }, 0);

  return {
    upgrades,
    summary: {
      totalUpgrades: upgrades.length,
      essentialUpgrades: upgrades.filter(u => u.necessity === 'essential' || u.necessity === 'required').length,
      estimatedCost: {
        essential: Math.round(essentialCost),
        total: Math.round(totalCost),
        range: {
          min: upgrades.reduce((sum, u) => sum + u.cost.min, 0),
          max: upgrades.reduce((sum, u) => sum + u.cost.max, 0)
        }
      }
    },
    timeline: generateTimeline(upgrades, timeline),
    budgetLevel
  };
}

/**
 * Estimate costs based on upgrade type and budget level
 */
function estimateCost(upgradeType, budgetLevel, param = null) {
  const costs = {
    brakes: {
      budget: { min: 300, max: 600 },
      mid_range: { min: 600, max: 1200 },
      premium: { min: 1200, max: 2500 }
    },
    lift: {
      budget: { min: 400, max: 800 },
      mid_range: { min: 1200, max: 2500 },
      premium: { min: 3000, max: 6000 }
    },
    regear: {
      budget: { min: 1800, max: 2400 },
      mid_range: { min: 2400, max: 3200 },
      premium: { min: 3200, max: 4500 }
    },
    wheels: {
      budget: { min: 600, max: 1000 },
      mid_range: { min: 1200, max: 2000 },
      premium: { min: 2500, max: 5000 }
    },
    trimming: {
      budget: { min: 0, max: 200 },
      mid_range: { min: 200, max: 500 },
      premium: { min: 500, max: 1200 }
    },
    sliders: {
      budget: { min: 400, max: 800 },
      mid_range: { min: 800, max: 1500 },
      premium: { min: 1500, max: 3000 }
    },
    bumpers: {
      budget: { min: 600, max: 1200 },
      mid_range: { min: 1500, max: 3000 },
      premium: { min: 3000, max: 6000 }
    }
  };

  // Adjust lift cost based on height
  if (upgradeType === 'lift' && param) {
    const heightMultiplier = param > 3 ? 1.5 : param > 2 ? 1.2 : 1.0;
    const base = costs.lift[budgetLevel];
    return {
      min: Math.round(base.min * heightMultiplier),
      max: Math.round(base.max * heightMultiplier)
    };
  }

  return costs[upgradeType]?.[budgetLevel] || { min: 500, max: 1500 };
}

/**
 * Get brake options by budget level
 */
function getBrakeOptions(budgetLevel) {
  const options = {
    budget: ['Upgraded brake pads/rotors', 'Stainless steel brake lines'],
    mid_range: ['Big brake kit (front)', 'Performance pads/rotors (all)', 'Braided lines'],
    premium: ['Full big brake kit (front/rear)', 'Multi-piston calipers', 'Slotted rotors', 'Track-spec pads']
  };
  return options[budgetLevel];
}

/**
 * Get suspension options
 */
function getSuspensionOptions(budgetLevel, height) {
  const options = {
    budget: ['Spacer lift + shocks', 'Budget coilover kit'],
    mid_range: ['Quality coilover system', 'Adjustable shocks', 'UCAs if needed'],
    premium: ['Premium coilover system', 'Adjustable everything', 'Long-travel kit', 'Custom tuning']
  };
  return options[budgetLevel];
}

/**
 * Get regear options
 */
function getRegearOptions(budgetLevel, gearIncrease) {
  const options = {
    budget: [`Stock ratio + ${gearIncrease}% (both axles)`, 'Basic install kit'],
    mid_range: ['Quality gear set', 'Master install kit', 'New carrier if needed', 'Pro installation'],
    premium: ['Premium gear set', 'ARB/Eaton lockers', 'Chromoly shafts', 'Full diff rebuild']
  };
  return options[budgetLevel];
}

/**
 * Get wheel options
 */
function getWheelOptions(budgetLevel) {
  const options = {
    budget: ['Method, Pro Comp, or similar', '17" standard beadlock-capable'],
    mid_range: ['Method Race Wheels', 'KMC', 'Fuel Off-Road', 'True beadlock option'],
    premium: ['Method Race Wheels (beadlock)', 'Walker Evans', 'KMC Machete', 'Custom powder coat']
  };
  return options[budgetLevel];
}

/**
 * Get trimming options
 */
function getTrimmingOptions(extent) {
  if (extent === 'extensive') {
    return ['Flat fenders', 'Body mount chop (CMC)', 'Pinch weld modification', 'Inner fender removal'];
  } else if (extent === 'moderate') {
    return ['CMC (cab mount chop)', 'Fender liner trimming', 'Pinch weld hammering'];
  } else {
    return ['Fender liner trimming', 'Minor plastic removal'];
  }
}

/**
 * Get armor options
 */
function getArmorOptions(type, budgetLevel) {
  if (type === 'sliders') {
    const options = {
      budget: ['Bolt-on tube sliders', 'Basic protection'],
      mid_range: ['Weld-on sliders', 'Step integration', 'DOM tubing'],
      premium: ['Custom-fab sliders', 'Integrated steps', 'Powder-coated', 'Strategic plating']
    };
    return options[budgetLevel];
  } else if (type === 'bumpers') {
    const options = {
      budget: ['Bolt-on steel bumper (front)', 'Basic winch mount'],
      mid_range: ['Quality bumper set (F/R)', 'Winch mount', 'D-ring mounts', 'Integrated lighting'],
      premium: ['Custom-fab bumpers', 'Integrated lights/winch', 'Strategic approach angles', 'Powder-coated']
    };
    return options[budgetLevel];
  }
  return [];
}

/**
 * Generate timeline based on upgrade priority
 */
function generateTimeline(upgrades, timelineType) {
  if (timelineType === 'immediate') {
    return {
      type: 'immediate',
      description: 'All essential upgrades before driving',
      phases: [
        {
          phase: 'Before First Drive',
          upgrades: upgrades.filter(u => u.necessity === 'essential' || u.necessity === 'required').map(u => u.upgrade)
        }
      ]
    };
  } else if (timelineType === 'phased') {
    return {
      type: 'phased',
      description: 'Spread upgrades over 6-12 months',
      phases: [
        {
          phase: 'Phase 1 (With Tire Install)',
          upgrades: upgrades.filter(u => u.timeline === 'with tire install' || u.timeline === 'before driving').map(u => u.upgrade)
        },
        {
          phase: 'Phase 2 (0-6 months)',
          upgrades: upgrades.filter(u => u.timeline === 'within 3-6 months').map(u => u.upgrade)
        },
        {
          phase: 'Phase 3 (6-12+ months)',
          upgrades: upgrades.filter(u => u.timeline === 'next phase' || u.timeline === 'future upgrade' || u.timeline === 'eventual upgrade').map(u => u.upgrade)
        }
      ]
    };
  } else {
    return {
      type: 'eventual',
      description: 'Upgrade as budget allows',
      phases: [
        {
          phase: 'Essential First',
          upgrades: upgrades.filter(u => u.necessity === 'essential').map(u => u.upgrade)
        },
        {
          phase: 'Performance Next',
          upgrades: upgrades.filter(u => u.category === 'Performance').map(u => u.upgrade)
        },
        {
          phase: 'Protection Later',
          upgrades: upgrades.filter(u => u.category === 'Protection').map(u => u.upgrade)
        }
      ]
    };
  }
}
