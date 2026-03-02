/**
 * Rotational Physics Module
 *
 * PURPOSE: Calculate the impact of tire weight and diameter changes on rotational inertia
 * and vehicle dynamics. This is critical for understanding acceleration feel, braking
 * performance, and drivetrain stress.
 *
 * PHYSICS BACKGROUND:
 * - Rotational inertia: I = m × r²
 * - Doubling tire weight doubles inertia
 * - Doubling tire radius quadruples inertia
 * - Unsprung rotating mass requires ~1.5x more energy than static mass
 *
 * METHODOLOGY:
 * - Use TireRack measured weights where available (high confidence)
 * - Fall back to diameter-based estimates (low confidence)
 * - Calculate rotational impact factor: weighted average of weight and diameter changes
 * - Categorize impact: LOW (<5%), MODERATE (5-10%), HIGH (>10%)
 */

import tireDatabase from '../data/tire-database.json' with { type: 'json' };

/**
 * Get tire weight from database or estimate based on diameter
 *
 * @param {string} tireSize - Tire size string (e.g., "285/75R17")
 * @param {number} diameter - Tire diameter in inches
 * @returns {object} { weight_lbs, confidence, source }
 */
export function getTireWeight(tireSize, diameter) {
  // Check exact match in database
  if (tireDatabase.tires[tireSize]) {
    const data = tireDatabase.tires[tireSize];
    return {
      weight_lbs: data.weight_lbs,
      confidence: data.confidence,
      source: data.data_source,
      category: data.category
    };
  }

  // Fall back to diameter-based estimate
  const diameterRanges = tireDatabase.fallback_weights.diameter_based_estimates;
  let estimatedWeight = 50; // default fallback

  // Find appropriate range
  for (const [range, weight] of Object.entries(diameterRanges)) {
    if (range === '40+' && diameter >= 40) {
      estimatedWeight = weight;
      break;
    }

    const [min, max] = range.split('-').map(Number);
    if (diameter >= min && diameter < max) {
      estimatedWeight = weight;
      break;
    }
  }

  return {
    weight_lbs: estimatedWeight,
    confidence: 'low',
    source: 'diameter-based estimate',
    category: 'estimated',
    note: tireDatabase.fallback_weights.note
  };
}

/**
 * Calculate rotational impact of tire upgrade
 *
 * FORMULA:
 * - Weight impact: (newWeight - currentWeight) / currentWeight × 100
 * - Diameter impact: (newDiameter - currentDiameter) / currentDiameter × 100
 * - Rotational impact factor: (weightDeltaPct + diameterDeltaPct × 1.5) / 2
 *   (diameter weighted 1.5x because I = m × r², so radius has squared effect)
 *
 * @param {object} currentTire - Current tire object with { size, diameter, weight }
 * @param {object} newTire - New tire object with { size, diameter, weight }
 * @returns {object} Detailed rotational impact analysis
 */
export function calculateRotationalImpact(currentTire, newTire) {
  // Use provided weights (from tireCalculator) to ensure consistency
  // Fall back to database lookup only if weights not provided
  const currentWeight = currentTire.weight !== undefined
    ? {
        weight_lbs: currentTire.weight,
        confidence: currentTire.isEstimated ? 'low' : 'high',
        source: currentTire.isEstimated ? 'estimated from tire size' : 'user-provided'
      }
    : getTireWeight(currentTire.size, currentTire.diameter);
  const newWeight = newTire.weight !== undefined
    ? {
        weight_lbs: newTire.weight,
        confidence: newTire.isEstimated ? 'low' : 'high',
        source: newTire.isEstimated ? 'estimated from tire size' : 'user-provided'
      }
    : getTireWeight(newTire.size, newTire.diameter);

  // Calculate deltas
  const weightDelta = newWeight.weight_lbs - currentWeight.weight_lbs;
  const weightDeltaPct = (weightDelta / currentWeight.weight_lbs) * 100;

  const diameterDelta = newTire.diameter - currentTire.diameter;
  const diameterDeltaPct = (diameterDelta / currentTire.diameter) * 100;

  // Calculate rotational inertia change
  // Formula: I = m × r², so we weight diameter change 1.5x
  const rotationalImpactFactor = (weightDeltaPct + (diameterDeltaPct * 1.5)) / 2;

  // Categorize impact
  let category = 'LOW';
  let categoryDescription = 'Minimal impact on acceleration and braking';
  let recommendations = [];

  if (Math.abs(rotationalImpactFactor) >= 10) {
    category = 'HIGH';
    categoryDescription = 'Significant impact on vehicle dynamics';
    recommendations = [
      'Expect noticeable reduction in acceleration',
      'Braking distances may increase 5-10%',
      'Consider regearing to compensate for performance loss',
      'Upgraded brakes recommended for safety',
      'Transmission may hunt for gears more frequently'
    ];
  } else if (Math.abs(rotationalImpactFactor) >= 5) {
    category = 'MODERATE';
    categoryDescription = 'Noticeable impact on acceleration feel';
    recommendations = [
      'Slight reduction in acceleration performance',
      'Braking feel may be less responsive',
      'Monitor transmission behavior (may shift differently)',
      'Consider regearing if frequently towing or off-roading'
    ];
  } else {
    category = 'LOW';
    categoryDescription = 'Minimal impact on acceleration and braking';
    recommendations = [
      'Negligible change in daily driving performance',
      'No regearing required unless other factors dictate'
    ];
  }

  // Calculate approximate acceleration impact
  // Simplified model: 1% rotational inertia increase ≈ 0.3-0.5% slower 0-60 time
  // NEGATIVE value = degradation (slower acceleration)
  const accelImpactPct = -rotationalImpactFactor * 0.4;

  // Build detailed result
  return {
    current: {
      tire: currentTire.size,
      weight_lbs: currentWeight.weight_lbs,
      diameter_inches: currentTire.diameter,
      confidence: currentWeight.confidence
    },
    new: {
      tire: newTire.size,
      weight_lbs: newWeight.weight_lbs,
      diameter_inches: newTire.diameter,
      confidence: newWeight.confidence
    },
    changes: {
      weight: {
        delta_lbs: weightDelta,
        delta_pct: weightDeltaPct,
        per_tire: weightDelta,
        all_four_tires: weightDelta * 4
      },
      diameter: {
        delta_inches: diameterDelta,
        delta_pct: diameterDeltaPct
      },
      rotational_inertia: {
        factor: rotationalImpactFactor,
        category: category,
        description: categoryDescription
      }
    },
    performance_impact: {
      acceleration: {
        impact_pct: accelImpactPct,
        description: Math.abs(accelImpactPct) > 3
          ? accelImpactPct < 0
            ? `Approximately ${Math.abs(accelImpactPct).toFixed(1)}% slower acceleration (e.g., 8.0s 0-60 → ${(8.0 * (1 - accelImpactPct/100)).toFixed(1)}s)`
            : `Approximately ${Math.abs(accelImpactPct).toFixed(1)}% faster acceleration (e.g., 8.0s 0-60 → ${(8.0 * (1 - accelImpactPct/100)).toFixed(1)}s)`
          : 'Negligible change in acceleration times'
      },
      braking: {
        impact_pct: -rotationalImpactFactor * 0.3,
        description: Math.abs(rotationalImpactFactor) > 10
          ? 'Increased braking distances; brake upgrade recommended'
          : Math.abs(rotationalImpactFactor) > 5
          ? 'Slightly increased braking effort required'
          : 'No significant change in braking performance'
      },
      unsprung_mass: {
        increase_lbs: weightDelta * 4,
        impact: weightDelta * 4 > 40
          ? 'Significant increase in unsprung mass; ride quality may suffer'
          : weightDelta * 4 > 20
          ? 'Moderate increase in unsprung mass; suspension may feel slightly busier'
          : 'Minimal impact on ride quality'
      }
    },
    recommendations: recommendations,
    confidence: {
      overall: currentWeight.confidence === 'high' && newWeight.confidence === 'high'
        ? 'HIGH'
        : currentWeight.confidence === 'low' || newWeight.confidence === 'low'
        ? 'LOW'
        : 'MEDIUM',
      notes: [
        currentWeight.confidence === 'low' && `${currentTire.size} weight is estimated`,
        newWeight.confidence === 'low' && `${newTire.size} weight is estimated`,
        'Actual impact varies by driving style and vehicle weight',
        'Performance impact calculations are simplified models'
      ].filter(Boolean)
    },
    summary: generateRotationalSummary(rotationalImpactFactor, weightDelta, diameterDelta)
  };
}

/**
 * Generate human-readable summary of rotational impact
 */
function generateRotationalSummary(impactFactor, weightDelta, diameterDelta) {
  const absImpact = Math.abs(impactFactor);

  if (absImpact < 2) {
    return `Negligible rotational impact (${impactFactor.toFixed(1)}% change). Daily driving feel will be virtually identical.`;
  } else if (absImpact < 5) {
    return `Minor rotational impact (${impactFactor.toFixed(1)}% change). You may notice slightly less responsive acceleration, especially when loaded.`;
  } else if (absImpact < 10) {
    return `MODERATE rotational impact (${impactFactor.toFixed(1)}% change). Expect noticeable reduction in acceleration feel. Adding ${Math.abs(weightDelta * 4).toFixed(0)} lbs of rotating mass across all four corners.`;
  } else if (absImpact < 15) {
    return `HIGH rotational impact (${impactFactor.toFixed(1)}% change). Acceleration will feel significantly slower. Strongly consider regearing to compensate. Adding ${Math.abs(weightDelta * 4).toFixed(0)} lbs of rotating mass.`;
  } else {
    return `EXTREME rotational impact (${impactFactor.toFixed(1)}% change). Vehicle dynamics will change dramatically. Regearing is essential. Brake upgrades recommended. Adding ${Math.abs(weightDelta * 4).toFixed(0)} lbs of rotating mass.`;
  }
}

/**
 * Get all available tire sizes from database
 * (Useful for UI dropdowns, autocomplete, etc.)
 */
export function getAvailableTireSizes() {
  return Object.keys(tireDatabase.tires).sort();
}

/**
 * Get tire category information
 */
export function getTireCategory(tireSize) {
  const tire = tireDatabase.tires[tireSize];
  return tire ? tire.category : 'unknown';
}
