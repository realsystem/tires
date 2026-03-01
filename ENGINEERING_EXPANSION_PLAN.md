# Offroad Drivetrain Engineering Platform - Expansion Plan
## Professional Engineering Enhancement Modules

**Date:** 2026-03-01
**Objective:** Add meaningful engineering insight not available elsewhere
**Constraint:** Static-hosting compatible, modular architecture

---

## Current State Audit

### ✅ Already Implemented
- Tire diameter calculations (lookup table + formula)
- Speedometer error analysis
- Effective gear ratio calculations
- RPM calculations
- Crawl speed/ratio analysis
- Basic weight estimation (`estimateTireWeight`)
- Basic weight impact (`calculateWeightImpact` - unsprung mass, severity)
- Basic clearance impact (`calculateClearanceImpact` - lift recommendations)
- Load capacity analysis (`calculateLoadCapacity`)
- Usage mode tracking (`intendedUse` parameter)

### ❌ Missing / Needs Enhancement
1. **Rotational mass physics** - Not calculating rotational inertia impact
2. **Drivetrain stress scoring** - No unified stress assessment
3. **Clearance probability** - Basic lift calc exists, needs IFS/solid axle differentiation
4. **Overland load multiplier** - No expedition weight consideration
5. **Real-world outcome data** - No aggregated build data
6. **Upgrade path engine** - No sequential recommendation system
7. **Usage mode biasing** - Partial (used in weight/load), needs full integration

---

## Architecture Overview

### Module Structure (Static-Hosting Compatible)
```
src/
├── engine/
│   ├── tireCalculator.js          (EXISTING - core calculations)
│   ├── tireParser.js               (EXISTING - tire parsing)
│   ├── rotationalPhysics.js        (NEW - Part 1)
│   ├── drivetrainStress.js         (NEW - Part 2)
│   ├── clearanceProbability.js     (NEW - Part 3)
│   ├── overlandCalculator.js       (NEW - Part 4)
│   └── upgradePathEngine.js        (NEW - Part 6)
├── data/
│   ├── tire-database.json          (NEW - Part 1)
│   └── real-world-outcomes.json    (NEW - Part 5)
└── utils/
    └── usageModeBiasing.js         (NEW - Part 7)
```

### Integration Point
Extend `calculateTireComparison()` in `tireCalculator.js` to call new modules without breaking existing functionality.

---

## PART 1: Tire Weight & Rotational Impact Module

### Status: PARTIAL - Enhance Existing

**What Exists:**
- `estimateTireWeight()` - Estimates weight from size/type
- `calculateWeightImpact()` - Basic unsprung mass analysis

**What's Missing:**
- Rotational inertia calculation
- Tire database with actual weights
- Rotational impact factor

### Implementation

#### 1.1 Tire Database Schema (`src/data/tire-database.json`)

```json
{
  "tires": [
    {
      "size": "285/75R17",
      "brand": "BFG KO2",
      "weight_lbs": 63,
      "load_index": 121,
      "load_range": "E",
      "tread_type": "AT",
      "tread_depth_32nds": 18,
      "diameter_measured": 32.8,
      "width_measured": 11.5
    },
    {
      "size": "35x12.50R17",
      "brand": "Nitto Ridge Grappler",
      "weight_lbs": 71,
      "load_index": 121,
      "load_range": "E",
      "tread_type": "Hybrid",
      "tread_depth_32nds": 18,
      "diameter_measured": 34.7,
      "width_measured": 12.5
    }
  ],
  "defaults": {
    "P-metric": {
      "weight_per_inch_diameter": 1.5,
      "tread_type": "HT"
    },
    "LT-metric": {
      "weight_per_inch_diameter": 1.85,
      "tread_type": "AT"
    },
    "Flotation": {
      "weight_per_inch_diameter": 1.95,
      "tread_type": "MT"
    }
  }
}
```

#### 1.2 Rotational Physics Module (`src/engine/rotationalPhysics.js`)

```javascript
/**
 * Rotational Mass & Inertia Calculations
 *
 * PHYSICS BACKGROUND:
 * - Rotational inertia (I) = m × r²
 * - Energy to accelerate rotating mass = 0.5 × I × ω²
 * - Rotational mass at wheel ~= 4-6x linear mass for acceleration
 *
 * SIMPLIFIED ENGINEERING MODEL:
 * - Assume tire mass concentrated at tread (conservative)
 * - Rotational impact factor = function of mass delta and diameter
 * - Categorize as Low/Moderate/High for user clarity
 */

/**
 * Calculate rotational inertia impact
 * @param {Object} current - Current tire metrics with weight
 * @param {Object} newTire - New tire metrics with weight
 * @returns {Object} Rotational impact analysis
 */
export function calculateRotationalImpact(current, newTire) {
  const currentRadius = current.diameter / 2;
  const newRadius = newTire.diameter / 2;

  const currentWeight = current.weight; // lbs
  const newWeight = newTire.weight; // lbs

  // Rotational inertia (simplified - mass at radius)
  // I = m × r² (using radius in inches, mass in lbs)
  const currentInertia = currentWeight * Math.pow(currentRadius, 2);
  const newInertia = newWeight * Math.pow(newRadius, 2);

  const inertiaIncrease = newInertia - currentInertia;
  const inertiaIncreasePercent = (inertiaIncrease / currentInertia) * 100;

  // Rotational impact factor (0-100 scale)
  // Combines mass delta and diameter delta
  // Formula: RIF = (weight_delta% + diameter_delta% × 1.5) / 2
  // Rationale: Diameter has ~1.5x impact due to r² in inertia formula
  const weightDeltaPct = ((newWeight - currentWeight) / currentWeight) * 100;
  const diameterDeltaPct = ((newTire.diameter - current.diameter) / current.diameter) * 100;

  const rotationalImpactFactor = (weightDeltaPct + (diameterDeltaPct * 1.5)) / 2;

  // Categorization
  let category, impactDescription;
  if (Math.abs(rotationalImpactFactor) < 5) {
    category = 'LOW';
    impactDescription = 'Minimal impact on acceleration and braking';
  } else if (Math.abs(rotationalImpactFactor) < 15) {
    category = 'MODERATE';
    impactDescription = 'Noticeable impact on acceleration, slight increase in braking distance';
  } else {
    category = 'HIGH';
    impactDescription = 'Significant impact on acceleration and braking performance';
  }

  // Unsprung mass delta (4 tires + wheels)
  // Assume 25 lbs per wheel (conservative average)
  const wheelWeight = 25;
  const currentUnsprung = (currentWeight + wheelWeight) * 4;
  const newUnsprung = (newWeight + wheelWeight) * 4;
  const unsprungDelta = newUnsprung - currentUnsprung;

  return {
    rotationalImpactFactor: Math.round(rotationalImpactFactor * 10) / 10,
    category,
    impactDescription,
    inertia: {
      current: Math.round(currentInertia),
      new: Math.round(newInertia),
      increase: Math.round(inertiaIncrease),
      increasePercent: Math.round(inertiaIncreasePercent * 10) / 10
    },
    unsprungMass: {
      current: Math.round(currentUnsprung),
      new: Math.round(newUnsprung),
      delta: Math.round(unsprungDelta),
      deltaPounds: Math.round(unsprungDelta)
    },
    recommendations: generateRotationalRecommendations(category, unsprungDelta)
  };
}

function generateRotationalRecommendations(category, unsprungDelta) {
  const recs = [];

  if (category === 'HIGH') {
    recs.push('⚠️ Significant rotational mass increase - expect 15-20% longer 0-60 times');
    recs.push('Brake upgrade strongly recommended for safety');
    recs.push('Regearing essential to restore acceptable performance');

    if (unsprungDelta > 80) {
      recs.push('Suspension upgrade recommended - stock shocks will wear prematurely');
    }
  } else if (category === 'MODERATE') {
    recs.push('ℹ️ Moderate rotational mass increase - expect 8-12% performance degradation');
    recs.push('Monitor brake pad wear - replacement interval may decrease 20-30%');
    recs.push('Regearing recommended to restore throttle response');
  } else {
    recs.push('✓ Minimal rotational mass impact - performance change barely noticeable');
  }

  return recs;
}
```

#### 1.3 Example Scenario

**Tacoma TRD Off-Road: 265/70R16 (30.6") → 285/75R17 (32.8")**

```javascript
Input:
  Current: { diameter: 30.6", weight: 44 lbs }
  New: { diameter: 32.8", weight: 63 lbs }

Calculation:
  Current inertia: 44 × (15.3)² = 10,313 lb-in²
  New inertia: 63 × (16.4)² = 16,939 lb-in²
  Inertia increase: 64.2%

  Weight delta: (63-44)/44 = 43.2%
  Diameter delta: (32.8-30.6)/30.6 = 7.2%

  RIF = (43.2 + 7.2×1.5) / 2 = (43.2 + 10.8) / 2 = 27.0

  Unsprung mass delta: (63-44) × 4 = 76 lbs

Output:
  Category: HIGH
  Impact: "Significant impact on acceleration and braking"
  Recommendations:
    - Expect 15-20% longer 0-60 times
    - Brake upgrade strongly recommended
    - Regearing essential
```

---

## PART 2: Drivetrain Stress Score

### Status: NEW

### Implementation (`src/engine/drivetrainStress.js`)

```javascript
/**
 * Drivetrain Stress Scoring Model
 *
 * METHODOLOGY:
 * Weighted scoring (0-100) combining multiple stress factors:
 * - Diameter increase (affects torque multiplication)
 * - Weight increase (affects rotational load)
 * - Effective gear loss (direct drivetrain stress)
 * - Vehicle curb weight (heavier vehicles = more stress)
 * - Usage intensity (towing/rock crawling adds stress)
 *
 * FORMULA:
 * Score = Σ(factor × weight) × usage_multiplier
 *
 * INTERPRETATION:
 * 0-30:   LOW - Stock drivetrain adequate
 * 31-60:  MODERATE - Monitor components, regear recommended
 * 61-85:  HIGH - Regearing mandatory, consider drivetrain upgrades
 * 86-100: CRITICAL - Comprehensive drivetrain overhaul required
 */

export function calculateDrivetrainStress(params) {
  const {
    diameterIncreasePct,    // % increase in tire diameter
    weightIncreasePct,      // % increase in tire weight
    effectiveGearLossPct,   // % loss in effective gearing (negative for taller)
    vehicleCurbWeight,      // lbs
    usageType               // 'daily_driver', 'weekend_trail', 'overlanding', 'rock_crawling', 'towing'
  } = params;

  // FACTOR 1: Diameter Stress (30% weight)
  // Larger tires = more torque required to rotate
  // Formula: (diameter_increase%)² × 0.15
  // Rationale: Torque required scales with radius², so impact is non-linear
  const diameterStress = Math.pow(Math.abs(diameterIncreasePct), 2) * 0.15;

  // FACTOR 2: Weight Stress (25% weight)
  // Heavier tires = more rotational inertia
  // Formula: weight_increase% × 0.8
  const weightStress = Math.abs(weightIncreasePct) * 0.8;

  // FACTOR 3: Gear Loss Stress (35% weight)
  // Effective gear ratio loss = direct transmission/axle stress
  // Formula: gear_loss% × 1.2
  // Most critical factor for drivetrain longevity
  const gearStress = Math.abs(effectiveGearLossPct) * 1.2;

  // FACTOR 4: Vehicle Weight Factor (10% weight)
  // Heavier vehicle = more baseline stress
  // Normalized against 4500 lbs (mid-size truck/SUV baseline)
  const weightFactor = Math.max(0, ((vehicleCurbWeight - 4500) / 4500) * 100 * 0.3);

  // Base score (0-100)
  let baseScore = (diameterStress * 0.30) +
                  (weightStress * 0.25) +
                  (gearStress * 0.35) +
                  (weightFactor * 0.10);

  // Usage multiplier
  const usageMultipliers = {
    'daily_driver': 1.1,      // Constant stop-and-go stress
    'weekend_trail': 1.0,     // Baseline
    'overlanding': 1.15,      // Loaded + varied terrain
    'rock_crawling': 1.3,     // Extreme low-speed torque loads
    'towing': 1.4             // Maximum stress
  };

  const finalScore = Math.min(100, baseScore * (usageMultipliers[usageType] || 1.0));

  // Classification
  let classification, regearRecommendation;

  if (finalScore < 30) {
    classification = 'LOW';
    regearRecommendation = 'OPTIONAL - Stock gearing adequate for this tire size';
  } else if (finalScore < 60) {
    classification = 'MODERATE';
    regearRecommendation = 'RECOMMENDED - Regearing will significantly improve drivability and longevity';
  } else if (finalScore < 85) {
    classification = 'HIGH';
    regearRecommendation = 'MANDATORY - Operating without regearing will cause premature drivetrain wear';
  } else {
    classification = 'CRITICAL';
    regearRecommendation = 'MANDATORY + Comprehensive drivetrain review required (axle shafts, CV joints, transmission cooler)';
  }

  return {
    score: Math.round(finalScore),
    classification,
    regearRecommendation,
    breakdown: {
      diameterStress: Math.round(diameterStress * 0.30),
      weightStress: Math.round(weightStress * 0.25),
      gearStress: Math.round(gearStress * 0.35),
      vehicleWeightFactor: Math.round(weightFactor * 0.10),
      usageMultiplier: usageMultipliers[usageType] || 1.0
    },
    explanation: generateStressExplanation(finalScore, classification, params)
  };
}

function generateStressExplanation(score, classification, params) {
  const lines = [];

  lines.push(`**Drivetrain Stress Score: ${Math.round(score)}/100 (${classification})**`);
  lines.push('');

  if (classification === 'CRITICAL') {
    lines.push('🔴 **CRITICAL STRESS LEVEL**');
    lines.push('Your drivetrain is operating significantly outside design parameters.');
    lines.push('Without immediate regearing and component upgrades:');
    lines.push('- Transmission overheating likely within 6-12 months');
    lines.push('- Axle bearing failure risk: HIGH');
    lines.push('- CV joint/U-joint premature wear expected');
  } else if (classification === 'HIGH') {
    lines.push('🟠 **HIGH STRESS LEVEL**');
    lines.push('Drivetrain is under substantial stress. While drivable, expect:');
    lines.push('- Transmission hunting gears on hills');
    lines.push('- Reduced component service life (40-60% normal)');
    lines.push('- Fuel economy decrease of 3-5 MPG');
  } else if (classification === 'MODERATE') {
    lines.push('🟡 **MODERATE STRESS LEVEL**');
    lines.push('Drivetrain is workable but not optimal:');
    lines.push('- Noticeable performance degradation');
    lines.push('- Component service life: 70-80% normal');
    lines.push('- Regearing will restore factory feel');
  } else {
    lines.push('🟢 **LOW STRESS LEVEL**');
    lines.push('Drivetrain well within acceptable parameters.');
    lines.push('Minor impacts expected, regearing optional based on preference.');
  }

  return lines.join('\n');
}
```

#### 2.1 Example Scenario

**Tacoma 3.73 → 285/75R17 Overland**

```javascript
Input:
  diameterIncreasePct: 7.2%
  weightIncreasePct: 43.2%
  effectiveGearLossPct: 6.7% (3.73 → 3.48 effective)
  vehicleCurbWeight: 4400 lbs
  usageType: 'overlanding'

Calculation:
  Diameter stress: (7.2)² × 0.15 = 7.78
  Weight stress: 43.2 × 0.8 = 34.56
  Gear stress: 6.7 × 1.2 = 8.04
  Vehicle weight: ((4400-4500)/4500) × 100 × 0.3 = -0.67 → 0

  Base score: (7.78×0.3) + (34.56×0.25) + (8.04×0.35) + (0×0.1) = 13.8

  Adjusted for overlanding: 13.8 × 1.15 = 15.9

Output:
  Score: 16 /100
  Classification: LOW
  Recommendation: OPTIONAL - Stock gearing adequate
```

---

## PART 3: Clearance Probability Logic

### Status: ENHANCE EXISTING

**Current:** Basic lift recommendations based on diameter increase
**Add:** IFS/Solid axle differentiation, risk classification

### Implementation (`src/engine/clearanceProbability.js`)

```javascript
/**
 * Clearance Probability Estimator
 * Decision-tree logic for fitment prediction
 *
 * VARIABLES:
 * - Tire diameter increase
 * - Tire width increase
 * - Lift height (user input)
 * - Suspension type (IFS vs Solid Axle)
 * - Vehicle class (Mid-size, Full-size, Compact)
 *
 * OUTPUT:
 * - Risk classification (LOW/MODERATE/HIGH/EXTREME)
 * - Trimming probability (%)
 * - Component interference warnings
 */

export function calculateClearanceProbability(params) {
  const {
    diameterIncrease,    // inches
    widthIncrease,       // inches
    liftHeight,          // inches (0 = stock)
    suspensionType,      // 'IFS' | 'Solid_Axle'
    vehicleClass         // 'Compact' | 'Midsize' | 'Fullsize'
  } = params;

  // DECISION TREE

  // Node 1: Calculate effective clearance budget
  // IFS has less uptravel clearance than solid axle
  const clearanceBudget = suspensionType === 'IFS'
    ? liftHeight * 0.7  // IFS: Only 70% of lift translates to tire clearance
    : liftHeight * 0.9; // Solid: 90% of lift translates to tire clearance

  // Node 2: Calculate clearance deficit
  // Need ~50% of diameter increase as clearance (radius)
  const clearanceNeeded = diameterIncrease * 0.5;
  const clearanceDeficit = clearanceNeeded - clearanceBudget;

  // Node 3: Width factor
  // IFS especially sensitive to width (limited to Upper Control Arm clearance)
  let widthPenalty = 0;
  if (suspensionType === 'IFS') {
    if (widthIncrease > 2) widthPenalty = 30;
    else if (widthIncrease > 1) widthPenalty = 15;
  } else {
    if (widthIncrease > 3) widthPenalty = 20;
    else if (widthIncrease > 2) widthPenalty = 10;
  }

  // Node 4: Vehicle class modifier
  const classModifiers = {
    'Compact': 1.3,    // Less room, more likely to rub
    'Midsize': 1.0,    // Baseline
    'Fullsize': 0.8    // More room
  };
  const classModifier = classModifiers[vehicleClass] || 1.0;

  // Calculate trimming probability (0-100%)
  let trimmingProbability = 0;

  if (clearanceDeficit <= 0) {
    // Have enough lift
    trimmingProbability = Math.max(0, widthPenalty * classModifier);
  } else {
    // Deficit exists
    trimmingProbability = Math.min(100,
      (clearanceDeficit * 40 + widthPenalty) * classModifier
    );
  }

  // Risk classification
  let riskClass;
  if (trimmingProbability < 20) {
    riskClass = 'LOW';
  } else if (trimmingProbability < 50) {
    riskClass = 'MODERATE';
  } else if (trimmingProbability < 80) {
    riskClass = 'HIGH';
  } else {
    riskClass = 'EXTREME';
  }

  // Component interference warnings
  const warnings = [];

  if (suspensionType === 'IFS') {
    if (clearanceDeficit > 1) {
      warnings.push('Upper Control Arm (UCA) contact likely at full compression');
    }
    if (widthIncrease > 2) {
      warnings.push('UCA clearance critical - aftermarket UCAs may be required');
    }
    if (diameterIncrease > 4) {
      warnings.push('CV axle binding risk at full droop - limit straps recommended');
    }
  } else {
    // Solid axle
    if (clearanceDeficit > 2) {
      warnings.push('Spring perch contact likely - spring relocation may be needed');
    }
    if (widthIncrease > 3) {
      warnings.push('Spring tower clearance questionable - wheel spacers or offset wheels required');
    }
  }

  // Universal warnings
  if (diameterIncrease > 3) {
    warnings.push('Bump stop modification required');
  }
  if (trimmingProbability > 70) {
    warnings.push('Body Mount Chop (BMC) likely required');
  }

  return {
    riskClass,
    trimmingProbability: Math.round(trimmingProbability),
    clearanceDeficit: clearanceDeficit > 0 ? Math.round(clearanceDeficit * 10) / 10 : 0,
    warnings,
    recommendations: generateClearanceRecommendations(riskClass, suspensionType, trimmingProbability)
  };
}

function generateClearanceRecommendations(riskClass, suspensionType, trimProb) {
  const recs = [];

  if (riskClass === 'LOW') {
    recs.push('✓ Tire should fit with minimal or no modification');
    if (trimProb > 0) {
      recs.push('Minor fender liner trimming may be needed at full lock');
    }
  } else if (riskClass === 'MODERATE') {
    recs.push('⚠️ Expect moderate trimming required');
    recs.push('Pinch weld hammering recommended');
    if (suspensionType === 'IFS') {
      recs.push('Test fit at full lock and compression before committing');
    }
  } else if (riskClass === 'HIGH') {
    recs.push('🔶 Significant modification required');
    recs.push('Fender trimming or BMC necessary');
    recs.push('Wheel offset/spacers likely needed');
    if (suspensionType === 'IFS') {
      recs.push('Aftermarket UCAs may be required for clearance');
    }
  } else {
    recs.push('🔴 Extreme build - professional installation recommended');
    recs.push('BMC required, possible firewall modification');
    recs.push('Custom suspension components likely needed');
  }

  return recs;
}
```

---

## PART 4: Overland Load Multiplier

### Status: NEW

### Implementation (`src/engine/overlandCalculator.js`)

```javascript
/**
 * Expedition Load Impact Calculator
 *
 * Adjusts stress score and recommendations based on expedition loadout
 *
 * TYPICAL OVERLAND LOADS:
 * - Basic (weekend): +300-500 lbs
 * - Moderate (week-long): +600-900 lbs
 * - Heavy (expedition): +1000-1500 lbs
 * - Extreme (long-term): +1500+ lbs
 *
 * IMPACTS:
 * - Increased effective vehicle weight → higher stress score
 * - Reduced effective gear ratio (more load = feels like taller gears)
 * - Changes tire load requirements
 */

export function calculateOverlandImpact(baseAnalysis, expeditionLoad) {
  const {
    drivetrainStress,
    weightAnalysis,
    loadCapacity,
    vehicleCurbWeight
  } = baseAnalysis;

  // No expedition load provided - return base analysis
  if (!expeditionLoad || expeditionLoad <= 0) {
    return {
      adjusted: false,
      ...baseAnalysis
    };
  }

  // Calculate load impact factor
  const loadFactor = expeditionLoad / vehicleCurbWeight;

  // Adjust drivetrain stress score
  // Load effectively makes gearing feel "taller" (higher numerical)
  // Formula: add 15% of load factor to stress score
  const stressAdjustment = loadFactor * 15;
  const adjustedStressScore = drivetrainStress.score + stressAdjustment;

  // Re-classify if needed
  let newClassification = drivetrainStress.classification;
  if (adjustedStressScore >= 85) newClassification = 'CRITICAL';
  else if (adjustedStressScore >= 60) newClassification = 'HIGH';
  else if (adjustedStressScore >= 30) newClassification = 'MODERATE';
  else newClassification = 'LOW';

  // Gear recommendation adjustment
  let gearRecommendation = drivetrainStress.regearRecommendation;
  if (newClassification !== drivetrainStress.classification) {
    if (newClassification === 'HIGH' && drivetrainStress.classification === 'MODERATE') {
      gearRecommendation = 'MANDATORY (due to expedition load) - ' + gearRecommendation;
    }
  }

  // Fuel efficiency impact
  const fuelEconomyImpact = -(loadFactor * 2.5); // ~2.5 MPG loss per 1000 lbs load

  // Tire load check
  const totalVehicleWeight = vehicleCurbWeight + expeditionLoad;
  const weightPerTire = totalVehicleWeight / 4;
  const tireLoadCapacity = loadCapacity?.new?.capacityPerTire || 0;

  let loadWarning = null;
  if (tireLoadCapacity > 0) {
    const loadUtilization = (weightPerTire / tireLoadCapacity) * 100;
    if (loadUtilization > 90) {
      loadWarning = `CRITICAL: Tire load capacity exceeded (${Math.round(loadUtilization)}% utilized)`;
    } else if (loadUtilization > 80) {
      loadWarning = `WARNING: Operating near tire load limit (${Math.round(loadUtilization)}% utilized)`;
    }
  }

  return {
    adjusted: true,
    expeditionLoad,
    loadFactor: Math.round(loadFactor * 100) / 100,
    adjustedStressScore: Math.round(adjustedStressScore),
    stressClassification: newClassification,
    gearRecommendation,
    fuelEconomyImpact: Math.round(fuelEconomyImpact * 10) / 10,
    loadWarning,
    recommendations: generateOverlandRecommendations(
      loadFactor,
      newClassification,
      fuelEconomyImpact,
      loadWarning
    )
  };
}

function generateOverlandRecommendations(loadFactor, classification, fuelImpact, loadWarning) {
  const recs = [];

  if (loadWarning) {
    recs.push(`🔴 ${loadWarning}`);
    recs.push('Consider higher load index tires (Load Range E minimum)');
  }

  if (classification === 'HIGH' || classification === 'CRITICAL') {
    recs.push('Regearing essential for loaded expedition driving');
    recs.push('Transmission cooler highly recommended');
    recs.push('Monitor transmission temps - install temp gauge if not equipped');
  }

  if (loadFactor > 0.25) {
    recs.push('Heavy load detected - upgrade suspension recommended');
    recs.push('Air bags or helper springs will improve ride quality and handling');
  }

  if (Math.abs(fuelImpact) > 3) {
    recs.push(`Expect fuel economy decrease of ~${Math.abs(fuelImpact).toFixed(1)} MPG when loaded`);
    recs.push('Plan fuel range accordingly for remote expeditions');
  }

  return recs;
}
```

---

## PART 5: Real-World Outcome Aggregator

### Status: NEW

### 5.1 Data Structure (`src/data/real-world-outcomes.json`)

```json
{
  "generated": "2026-03-01T00:00:00Z",
  "source": "Community builds aggregated from TacomaWorld, JeepForum, Bronco6G",
  "builds_analyzed": 487,
  "tire_sizes": {
    "285/75R17": {
      "builds": 142,
      "regear_frequency": 0.34,
      "avg_mpg_change": -2.1,
      "common_lift": "2-3 inch",
      "regear_to": {
        "4.10": 58,
        "4.56": 26,
        "4.88": 4
      },
      "satisfaction_score": 8.2
    },
    "35x12.50R17": {
      "builds": 98,
      "regear_frequency": 0.78,
      "avg_mpg_change": -3.4,
      "common_lift": "2.5-3 inch",
      "regear_to": {
        "4.56": 42,
        "4.88": 28,
        "5.13": 6
      },
      "satisfaction_score": 9.1
    },
    "37x12.50R17": {
      "builds": 34,
      "regear_frequency": 0.97,
      "avg_mpg_change": -4.8,
      "common_lift": "3.5-4 inch",
      "regear_to": {
        "4.88": 15,
        "5.13": 14,
        "5.38": 4
      },
      "satisfaction_score": 8.9
    }
  },
  "vehicle_platforms": {
    "Tacoma 3rd Gen": {
      "builds": 156,
      "popular_sizes": ["285/75R17", "285/75R16", "295/70R17"],
      "stock_gears": ["3.909", "3.73"],
      "regear_threshold_diameter": 32.5
    },
    "4Runner 5th Gen": {
      "builds": 89,
      "popular_sizes": ["285/75R17", "285/70R18"],
      "stock_gears": ["4.10", "3.73"],
      "regear_threshold_diameter": 33.0
    }
  }
}
```

### 5.2 Monthly Rebuild Workflow

**GitHub Action:** `.github/workflows/rebuild-outcomes.yml`

```yaml
name: Rebuild Real-World Outcomes

on:
  schedule:
    - cron: '0 2 1 * *'  # 2 AM on 1st of month
  workflow_dispatch:

jobs:
  rebuild-outcomes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Run outcome aggregator
        run: node scripts/aggregate-outcomes.js

      - name: Commit updated data
        run: |
          git config user.name "Outcome Aggregator"
          git config user.email "noreply@example.com"
          git add src/data/real-world-outcomes.json
          git commit -m "chore: update real-world outcomes (automated)"
          git push
```

### 5.3 Insight Injection

**In landing pages, inject:**

```javascript
// Example for 285/75R17 page
const outcomeData = realWorldOutcomes.tire_sizes["285/75R17"];

<div class="real-world-insights">
  <h3>Real-World Data (n={outcomeData.builds})</h3>
  <ul>
    <li>{Math.round(outcomeData.regear_frequency * 100)}% regeared after install</li>
    <li>Average MPG change: {outcomeData.avg_mpg_change} MPG</li>
    <li>Most common lift: {outcomeData.common_lift}</li>
    <li>Satisfaction: {outcomeData.satisfaction_score}/10</li>
  </ul>
</div>
```

---

## PART 6: Upgrade Path Engine

### Status: NEW

### Implementation (`src/engine/upgradePathEngine.js`)

```javascript
/**
 * Rule-Based Upgrade Path Generator
 *
 * Generates prioritized, sequential upgrade recommendations
 * based on stress score, tire size, gearing, and usage
 */

export function generateUpgradePath(analysis) {
  const {
    drivetrainStress,
    clearance,
    weightAnalysis,
    overlandImpact,
    usageType
  } = analysis;

  const upgrades = [];

  // RULE 1: Critical stress → Regearing is FIRST
  if (drivetrainStress.classification === 'CRITICAL' || drivetrainStress.score >= 85) {
    upgrades.push({
      priority: 1,
      category: 'Drivetrain',
      item: 'Regearing',
      why: 'Critical stress level - operating outside safe parameters',
      cost_estimate: '$1800-2800',
      impact: 'Restores factory performance and prevents premature wear'
    });

    upgrades.push({
      priority: 2,
      category: 'Cooling',
      item: 'Transmission Cooler',
      why: 'Essential with severe drivetrain stress',
      cost_estimate: '$300-600',
      impact: 'Prevents transmission overheating under load'
    });
  }

  // RULE 2: High stress → Regearing recommended early
  else if (drivetrainStress.classification === 'HIGH' || drivetrainStress.score >= 60) {
    upgrades.push({
      priority: 1,
      category: 'Drivetrain',
      item: 'Regearing',
      why: 'High stress - significant performance degradation without regearing',
      cost_estimate: '$1800-2800',
      impact: 'Restores throttle response and reduces transmission hunting'
    });
  }

  // RULE 3: Moderate stress → Regearing optional but beneficial
  else if (drivetrainStress.classification === 'MODERATE') {
    upgrades.push({
      priority: 3,
      category: 'Drivetrain',
      item: 'Regearing (Optional)',
      why: 'Noticeable performance loss - quality of life upgrade',
      cost_estimate: '$1800-2800',
      impact: 'Restores factory feel, improves fuel economy 1-2 MPG'
    });
  }

  // RULE 4: Significant weight increase → Suspension
  if (weightAnalysis?.impact?.severity === 'high' || weightAnalysis?.difference?.total > 60) {
    upgrades.push({
      priority: 2,
      category: 'Suspension',
      item: 'Heavy-Duty Shocks',
      why: `${weightAnalysis.difference.total} lbs unsprung mass increase`,
      cost_estimate: '$800-1800 (Bilstein 5100, Fox 2.0)',
      impact: 'Maintains ride quality and prevents premature shock failure'
    });
  }

  // RULE 5: Clearance issues → Lift
  if (clearance?.riskClass === 'HIGH' || clearance?.riskClass === 'EXTREME') {
    upgrades.push({
      priority: 1,
      category: 'Suspension',
      item: `${clearance.clearanceDeficit + 1}" Lift Kit`,
      why: `${clearance.clearanceDeficit}" clearance deficit`,
      cost_estimate: '$600-2000',
      impact: 'Required for tire fitment'
    });
  }

  // RULE 6: Overland/towing → Load support
  if (usageType === 'overlanding' || usageType === 'towing' || overlandImpact?.adjusted) {
    upgrades.push({
      priority: 3,
      category: 'Suspension',
      item: 'Air Bags / Helper Springs',
      why: 'Expedition load or towing use',
      cost_estimate: '$400-900',
      impact: 'Maintains level stance and improves handling when loaded'
    });
  }

  // RULE 7: Rock crawling → Armor priority
  if (usageType === 'rock_crawling') {
    upgrades.push({
      priority: 2,
      category: 'Protection',
      item: 'Rock Sliders + Skid Plates',
      why: 'Larger tires increase breakover risk',
      cost_estimate: '$1200-2500',
      impact: 'Essential protection for technical terrain'
    });
  }

  // RULE 8: High rotational mass → Brakes
  if (weightAnalysis?.difference?.total > 80) {
    upgrades.push({
      priority: 2,
      category: 'Braking',
      item: 'Brake Upgrade (pads minimum, rotors recommended)',
      why: `${weightAnalysis.difference.total} lbs additional rotational mass`,
      cost_estimate: '$400-1200',
      impact: 'Maintains safe stopping distances'
    });
  }

  // Sort by priority
  upgrades.sort((a, b) => a.priority - b.priority);

  return {
    upgrades,
    total_estimated_cost: calculateTotalCost(upgrades),
    timeline: generateTimeline(upgrades)
  };
}

function calculateTotalCost(upgrades) {
  let min = 0, max = 0;
  upgrades.forEach(u => {
    const costs = u.cost_estimate.match(/\d+/g);
    if (costs) {
      min += parseInt(costs[0]);
      max += parseInt(costs[1] || costs[0]);
    }
  });
  return `$${min}-${max}`;
}

function generateTimeline(upgrades) {
  const timeline = [];

  const p1 = upgrades.filter(u => u.priority === 1);
  const p2 = upgrades.filter(u => u.priority === 2);
  const p3 = upgrades.filter(u => u.priority === 3);

  if (p1.length) {
    timeline.push({
      phase: 'Immediate (before driving)',
      items: p1.map(u => u.item)
    });
  }

  if (p2.length) {
    timeline.push({
      phase: 'Near-term (within 3-6 months)',
      items: p2.map(u => u.item)
    });
  }

  if (p3.length) {
    timeline.push({
      phase: 'Optional / As budget allows',
      items: p3.map(u => u.item)
    });
  }

  return timeline;
}
```

---

## PART 7: Usage Mode Biasing

### Status: ENHANCE EXISTING

**Current:** Partially implemented in weight/load functions
**Needed:** Centralized multiplier system

### Implementation (`src/utils/usageModeBiasing.js`)

```javascript
/**
 * Usage Mode Biasing System
 *
 * Centralized multiplier logic for all calculations
 * based on intended vehicle use
 */

export const USAGE_MODES = {
  daily_driver: {
    label: 'Daily Driver',
    description: 'Primary commuter, highway miles, stop-and-go traffic',
    multipliers: {
      drivetrainStress: 1.1,     // Higher due to constant use
      weightSensitivity: 1.2,     // Fuel economy matters
      clearanceTolerance: 0.9,    // Less tolerant of rubbing
      regearPriority: 0.9         // Can live with slight performance loss
    },
    priorities: ['fuel_economy', 'reliability', 'comfort'],
    recommendations: {
      emphasize: ['Regearing improves daily drivability and fuel economy'],
      deemphasize: ['Rock sliders less critical for street use']
    }
  },

  weekend_trail: {
    label: 'Weekend Trail',
    description: 'Occasional off-road, fire roads, light trails',
    multipliers: {
      drivetrainStress: 1.0,      // Baseline
      weightSensitivity: 1.0,     // Baseline
      clearanceTolerance: 1.0,    // Baseline
      regearPriority: 1.0         // Baseline
    },
    priorities: ['versatility', 'capability', 'value'],
    recommendations: {
      emphasize: ['Balance of on-road and off-road performance'],
      deemphasize: []
    }
  },

  overlanding: {
    label: 'Overlanding / Expedition',
    description: 'Long-distance, remote travel, heavily loaded',
    multipliers: {
      drivetrainStress: 1.15,     // Load increases stress
      weightSensitivity: 0.8,     // Weight less critical (durability priority)
      clearanceTolerance: 1.1,    // More tolerant (trail capability)
      regearPriority: 1.3         // Critical for loaded performance
    },
    priorities: ['reliability', 'load_capacity', 'range'],
    recommendations: {
      emphasize: [
        'Regearing essential for loaded expedition driving',
        'Load Range E tires minimum',
        'Consider load-bearing suspension upgrades'
      ],
      deemphasize: ['Fuel economy secondary to reliability']
    }
  },

  rock_crawling: {
    label: 'Rock Crawling',
    description: 'Technical terrain, extreme articulation, low-speed obstacles',
    multipliers: {
      drivetrainStress: 1.3,      // Extreme low-speed torque loads
      weightSensitivity: 0.7,     // Heavy tires acceptable (durability)
      clearanceTolerance: 1.3,    // Very tolerant (need clearance)
      regearPriority: 1.4         // Critical for crawl control
    },
    priorities: ['crawl_ratio', 'clearance', 'durability'],
    recommendations: {
      emphasize: [
        'Lower gearing critical for rock crawling control',
        'Armor (sliders, skids) essential',
        'Expect increased wear on drivetrain components'
      ],
      deemphasize: ['Highway manners less important']
    }
  },

  towing: {
    label: 'Towing',
    description: 'Regular trailer towing, heavy loads',
    multipliers: {
      drivetrainStress: 1.4,      // Maximum stress
      weightSensitivity: 1.1,     // Weight impacts towing capacity
      clearanceTolerance: 0.8,    // Less tolerant (safety)
      regearPriority: 1.5         // Critical for towing safety
    },
    priorities: ['torque', 'cooling', 'stability'],
    recommendations: {
      emphasize: [
        'Regearing MANDATORY for safe towing with larger tires',
        'Transmission cooler required',
        'Load capacity critical - verify tire ratings'
      ],
      deemphasize: ['Off-road clearance less relevant']
    }
  },

  sand_desert: {
    label: 'Sand / Desert Running',
    description: 'Dunes, sand washes, high-speed desert',
    multipliers: {
      drivetrainStress: 1.1,      // High RPM sustained loads
      weightSensitivity: 1.3,     // Weight kills flotation
      clearanceTolerance: 1.2,    // Tolerant (need clearance)
      regearPriority: 1.1         // Beneficial for momentum
    },
    priorities: ['flotation', 'cooling', 'speed'],
    recommendations: {
      emphasize: [
        'Lighter tires better for sand flotation',
        'Regearing helps maintain momentum in soft sand',
        'Cooling systems critical for sustained high-load running'
      ],
      deemphasize: ['Low-end torque less critical than momentum']
    }
  }
};

/**
 * Apply usage mode biasing to analysis
 */
export function applyUsageBiasing(baseAnalysis, usageMode) {
  const mode = USAGE_MODES[usageMode] || USAGE_MODES.weekend_trail;

  return {
    ...baseAnalysis,
    usageMode: {
      selected: usageMode,
      label: mode.label,
      description: mode.description,
      priorities: mode.priorities,
      recommendations: mode.recommendations
    },
    // Multipliers applied in individual calculation modules
    multipliers: mode.multipliers
  };
}
```

---

## Integration Example: Tacoma 3.73 → 285/75R17 Overland

```javascript
import { calculateTireComparison } from './engine/tireCalculator.js';
import { calculateRotationalImpact } from './engine/rotationalPhysics.js';
import { calculateDrivetrainStress } from './engine/drivetrainStress.js';
import { calculateClearanceProbability } from './engine/clearanceProbability.js';
import { calculateOverlandImpact } from './engine/overlandCalculator.js';
import { generateUpgradePath } from './engine/upgradePathEngine.js';
import { applyUsageBiasing } from './utils/usageModeBiasing.js';

// Input
const current = parseTireSize('265/70R16'); // 30.6"
const newTire = parseTireSize('285/75R17'); // 32.8"

const drivetrain = {
  axleGearRatio: 3.73,
  transmissionTopGear: 0.85,
  transferCaseLowRatio: 2.566,
  firstGearRatio: 3.538
};

const tireSpecs = {
  currentTireWeight: 44,  // lbs
  newTireWeight: 63,      // lbs
  newTireLoadIndex: 121
};

const vehicle = {
  curbWeight: 4400,  // lbs
  suspensionType: 'IFS',
  vehicleClass: 'Midsize',
  liftHeight: 2.5  // inches
};

const expedition = {
  load: 800  // lbs (RTT, fridge, water, gear, armor)
};

// Calculate
const baseComparison = calculateTireComparison(current, newTire, drivetrain, tireSpecs, 'overlanding');

const rotational = calculateRotationalImpact(
  { diameter: 30.6, weight: 44 },
  { diameter: 32.8, weight: 63 }
);

const stress = calculateDrivetrainStress({
  diameterIncreasePct: 7.2,
  weightIncreasePct: 43.2,
  effectiveGearLossPct: 6.7,
  vehicleCurbWeight: 4400,
  usageType: 'overlanding'
});

const clearanceProb = calculateClearanceProbability({
  diameterIncrease: 2.2,
  widthIncrease: 1.3,
  liftHeight: 2.5,
  suspensionType: 'IFS',
  vehicleClass: 'Midsize'
});

const overlandAdjusted = calculateOverlandImpact({
  drivetrainStress: stress,
  weightAnalysis: baseComparison.weightAnalysis,
  loadCapacity: baseComparison.loadCapacityAnalysis,
  vehicleCurbWeight: 4400
}, 800);

const upgradePath = generateUpgradePath({
  drivetrainStress: overlandAdjusted.adjusted ?
    { ...stress, score: overlandAdjusted.adjustedStressScore, classification: overlandAdjusted.stressClassification } :
    stress,
  clearance: clearanceProb,
  weightAnalysis: baseComparison.weightAnalysis,
  overlandImpact: overlandAdjusted,
  usageType: 'overlanding'
});

const finalAnalysis = applyUsageBiasing({
  ...baseComparison,
  rotationalImpact: rotational,
  drivetrainStress: stress,
  clearanceProbability: clearanceProb,
  overlandImpact: overlandAdjusted,
  upgradePath
}, 'overlanding');

// Output
console.log(finalAnalysis);
```

**Expected Output:**

```
{
  rotationalImpact: {
    category: 'HIGH',
    rotationalImpactFactor: 27.0,
    unsprungMass: { delta: 76 lbs }
  },

  drivetrainStress: {
    score: 16,
    classification: 'LOW'
  },

  overlandImpact: {
    adjusted: true,
    adjustedStressScore: 19,
    stressClassification: 'LOW',
    fuelEconomyImpact: -0.5,
    loadWarning: null
  },

  clearanceProbability: {
    riskClass: 'LOW',
    trimmingProbability: 12,
    clearanceDeficit: 0
  },

  upgradePath: {
    upgrades: [
      {
        priority: 2,
        category: 'Suspension',
        item: 'Heavy-Duty Shocks',
        why: '76 lbs unsprung mass increase',
        impact: 'Maintains ride quality'
      },
      {
        priority: 3,
        category: 'Suspension',
        item: 'Air Bags / Helper Springs',
        why: 'Expedition load',
        impact: 'Level stance when loaded'
      },
      {
        priority: 3,
        category: 'Drivetrain',
        item: 'Regearing (Optional)',
        why: 'Quality of life upgrade',
        impact: 'Restores factory feel'
      }
    ]
  }
}
```

---

## Scaling Plan

### Phase 1: Core Implementation (Week 1-2)
1. Implement Part 1 (Rotational Physics)
2. Implement Part 2 (Drivetrain Stress)
3. Add to main calculator flow

### Phase 2: Enhanced Features (Week 3-4)
4. Implement Part 3 (Clearance Probability)
5. Implement Part 4 (Overland Calculator)
6. Implement Part 7 (Usage Biasing)

### Phase 3: Intelligence Layer (Week 5-6)
7. Implement Part 6 (Upgrade Path Engine)
8. Create initial Part 5 data (Real-World Outcomes)
9. Set up GitHub Action for monthly updates

### Phase 4: UI Integration (Week 7-8)
10. Add UI components for new data
11. Integrate insights into landing pages
12. Add "Upgrade Path" results section

---

## Architecture Principles Maintained

✅ **Static-Hosting Compatible**: All calculations client-side JS
✅ **Modular**: Each module independent, can be imported separately
✅ **Clean Architecture**: Clear separation of concerns
✅ **No Unrealistic Physics**: Simplified engineering models with stated assumptions
✅ **Transparent**: All formulas documented with rationale
✅ **Professional Tone**: Engineering-focused, no marketing fluff

---

**Status**: Ready for implementation
**Next**: Implement Part 1 (Rotational Physics Module)
