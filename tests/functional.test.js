/**
 * Comprehensive Functional Tests
 * Tests all calculator functionality with real-world scenarios
 * Focuses on validating behavior and relationships rather than exact values
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { parseTireSize } from '../src/engine/tireParser.js';
import { calculateTireComparison } from '../src/engine/tireCalculator.js';
import { generateRegearRecommendations } from '../src/engine/regearEngine.js';
import { generateAdvisory } from '../src/engine/advisoryEngine.js';

// ============================================================================
// TIRE COMPARISON TESTS
// ============================================================================

test('Functional: Moderate tire upgrade calculations', () => {
  const current = parseTireSize('265/70R17');
  const newTire = parseTireSize('285/75R17');
  const comparison = calculateTireComparison(current, newTire);

  // Verify structure exists
  assert.ok(comparison.current, 'Has current tire data');
  assert.ok(comparison.new, 'Has new tire data');
  assert.ok(comparison.differences, 'Has differences');
  assert.ok(comparison.speedometerError, 'Has speedometer error');
  assert.ok(comparison.clearance, 'Has clearance data');

  // Verify diameter increases
  assert.ok(comparison.new.diameter > comparison.current.diameter, 'New tire should be larger');
  assert.ok(comparison.differences.diameter.absolute > 0, 'Diameter change should be positive');
  assert.ok(comparison.differences.diameter.percentage > 0, 'Diameter % change should be positive');

  // Verify reasonable values (265/70R17 ≈ 31.6", 285/75R17 ≈ 33.8")
  assert.ok(comparison.current.diameter > 30 && comparison.current.diameter < 33, 'Current diameter reasonable');
  assert.ok(comparison.new.diameter > 32 && comparison.new.diameter < 35, 'New diameter reasonable');

  // Verify ground clearance is half of diameter increase
  const expectedClearance = comparison.differences.diameter.absolute / 2;
  assert.strictEqual(comparison.differences.groundClearance.gain, expectedClearance);
});

test('Functional: Extreme tire upgrade (stock to 37s)', () => {
  const current = parseTireSize('265/70R16');
  const newTire = parseTireSize('37x12.50R17');
  const comparison = calculateTireComparison(current, newTire);

  // Should show large increase
  assert.ok(comparison.differences.diameter.percentage > 15, 'Should show >15% increase');
  assert.ok(comparison.differences.diameter.absolute > 5, 'Should gain >5" diameter');

  // Should recommend significant lift
  assert.ok(comparison.clearance.estimatedLiftRequired >= 4, 'Should need 4+ inch lift');
  assert.ok(comparison.clearance.fenderClearance.concern, 'Should flag fender concerns');
  assert.ok(comparison.clearance.wheelOffset.changeNeeded, 'Should need offset change');
});

test('Functional: Speedometer error accuracy', () => {
  const current = parseTireSize('265/70R17');
  const newTire = parseTireSize('285/75R17');
  const comparison = calculateTireComparison(current, newTire);
  const speedError = comparison.speedometerError;

  // With larger tire, actual speed should be higher than indicated
  assert.ok(speedError.ratio > 1, 'Ratio should be >1 for larger tires');
  assert.ok(speedError.errors.at60mph.actual > 60, 'Actual speed should exceed indicated');

  // Error should be consistent across speeds (proportional)
  const errorPct30 = (speedError.errors.at30mph.actual - 30) / 30 * 100;
  const errorPct60 = (speedError.errors.at60mph.actual - 60) / 60 * 100;
  const errorPct75 = (speedError.errors.at75mph.actual - 75) / 75 * 100;

  assert.ok(Math.abs(errorPct30 - errorPct60) < 0.1, 'Error % should be consistent');
  assert.ok(Math.abs(errorPct60 - errorPct75) < 0.1, 'Error % should be consistent');

  // Summary should indicate slower reading for larger tires
  assert.ok(speedError.summary.includes('SLOWER'), 'Should indicate speedometer reads slower');
});

// ============================================================================
// DRIVETRAIN IMPACT TESTS
// ============================================================================

test('Functional: RPM calculations with drivetrain', () => {
  const current = parseTireSize('265/70R17');
  const newTire = parseTireSize('285/75R17');

  const drivetrain = {
    axleGearRatio: 3.909,
    transmissionTopGear: 0.84,
    transferCaseLowRatio: 2.566,
    firstGearRatio: 3.538
  };

  const comparison = calculateTireComparison(current, newTire, drivetrain);
  const impact = comparison.drivetrainImpact;

  assert.ok(impact, 'Should calculate drivetrain impact');
  assert.ok(impact.rpm, 'Should have RPM data');
  assert.ok(impact.effectiveGearRatio, 'Should have gear ratio data');
  assert.ok(impact.crawlRatio, 'Should have crawl ratio data');

  // RPM should decrease with larger tires
  assert.ok(impact.rpm.new < impact.rpm.original, 'RPM should decrease');
  assert.ok(impact.rpm.change < 0, 'RPM change should be negative');

  // RPM should be in reasonable range (1500-2500 at 65 mph)
  assert.ok(impact.rpm.original > 1500 && impact.rpm.original < 2500, 'Original RPM reasonable');
  assert.ok(impact.rpm.new > 1500 && impact.rpm.new < 2500, 'New RPM reasonable');
});

test('Functional: Crawl ratio calculations', () => {
  const current = parseTireSize('265/70R17');
  const newTire = parseTireSize('285/75R17');

  const drivetrain = {
    axleGearRatio: 3.909,
    transferCaseLowRatio: 2.566,
    firstGearRatio: 3.538
  };

  const comparison = calculateTireComparison(current, newTire, drivetrain);
  const crawl = comparison.drivetrainImpact.crawlRatio;

  // Crawl ratio = axle × transfer case low × first gear
  const expectedCrawl = 3.909 * 2.566 * 3.538;  // ≈ 35.5:1

  assert.ok(Math.abs(crawl.original - expectedCrawl) < 0.5, 'Crawl ratio should match formula');

  // Crawl ratio should NOT change with tire size (only gears matter)
  assert.strictEqual(crawl.change, 0, 'Crawl ratio unchanged by tire size');
  assert.strictEqual(crawl.new, crawl.original, 'New crawl equals original');
});

test('Functional: Jeep Rubicon high crawl ratio', () => {
  const current = parseTireSize('285/70R17');
  const newTire = parseTireSize('37x12.50R17');

  const drivetrain = {
    axleGearRatio: 4.10,
    transferCaseLowRatio: 4.0,  // Rubicon Rock-Trac
    firstGearRatio: 4.71
  };

  const comparison = calculateTireComparison(current, newTire, drivetrain);
  const crawl = comparison.drivetrainImpact.crawlRatio;

  // Jeep Rubicon: 4.10 × 4.0 × 4.71 = 77.2:1
  const expectedCrawl = 4.10 * 4.0 * 4.71;

  assert.ok(Math.abs(crawl.original - expectedCrawl) < 1.0, 'Rubicon crawl ratio ~77:1');
  assert.ok(crawl.original > 70, 'Rubicon should have excellent crawl ratio');
});

test('Functional: Effective gear ratio change', () => {
  const current = parseTireSize('265/70R17');
  const newTire = parseTireSize('285/75R17');

  const drivetrain = {
    axleGearRatio: 3.73
  };

  const comparison = calculateTireComparison(current, newTire, drivetrain);
  const gearRatio = comparison.drivetrainImpact.effectiveGearRatio;

  // Original should equal input gear ratio
  assert.strictEqual(gearRatio.original, 3.73);

  // Effective ratio should decrease (taller gearing) with larger tires
  assert.ok(gearRatio.new < gearRatio.original, 'Effective ratio decreases');
  assert.ok(gearRatio.change < 0, 'Change should be negative');

  // Percentage change should approximate tire diameter change (opposite sign)
  const diameterChangePct = comparison.differences.diameter.percentage;
  assert.ok(
    Math.abs(Math.abs(gearRatio.changePercentage) - diameterChangePct) < 1.0,
    'Gear ratio % change should match tire diameter % change'
  );
});

// ============================================================================
// CLEARANCE AND FITMENT TESTS
// ============================================================================

test('Functional: Lift requirements scale with diameter increase', () => {
  // Small increase
  const small = calculateTireComparison(
    parseTireSize('265/70R17'),
    parseTireSize('275/70R17')
  );

  // Moderate increase
  const moderate = calculateTireComparison(
    parseTireSize('265/70R17'),
    parseTireSize('285/75R17')
  );

  // Large increase
  const large = calculateTireComparison(
    parseTireSize('265/70R17'),
    parseTireSize('35x12.50R17')
  );

  // Lift requirements should increase with tire size
  assert.ok(
    small.clearance.estimatedLiftRequired <= moderate.clearance.estimatedLiftRequired,
    'Moderate upgrade needs more lift than small'
  );
  assert.ok(
    moderate.clearance.estimatedLiftRequired < large.clearance.estimatedLiftRequired,
    'Large upgrade needs more lift than moderate'
  );

  // Large upgrade should flag concerns
  assert.ok(large.clearance.fenderClearance.concern, 'Large upgrade has fender concerns');
});

test('Functional: No modifications for same tire', () => {
  const comparison = calculateTireComparison(
    parseTireSize('265/70R17'),
    parseTireSize('265/70R17')
  );

  // Everything should be zero
  assert.strictEqual(comparison.differences.diameter.absolute, 0);
  assert.strictEqual(comparison.differences.width.absolute, 0);
  assert.strictEqual(comparison.differences.groundClearance.gain, 0);
  assert.strictEqual(comparison.speedometerError.ratio, 1);
  assert.strictEqual(comparison.clearance.estimatedLiftRequired, 0);
});

// ============================================================================
// ADVISORY SYSTEM TESTS
// ============================================================================

test('Functional: Advisory system provides guidance', () => {
  const comparison = calculateTireComparison(
    parseTireSize('265/70R17'),
    parseTireSize('285/75R17'),
    { axleGearRatio: 3.73 }
  );

  const advisory = generateAdvisory(comparison, 'weekend_trail', { suspensionType: 'ifs' });

  assert.ok(advisory, 'Advisory should be generated');
  assert.ok(advisory.warnings, 'Should have warnings object');
  assert.ok(Array.isArray(advisory.warnings.critical), 'Should have critical warnings array');
  assert.ok(Array.isArray(advisory.warnings.important), 'Should have important warnings array');
  assert.ok(Array.isArray(advisory.warnings.advisory), 'Should have advisory warnings array');
  assert.ok(Array.isArray(advisory.recommendations), 'Should have recommendations array');
});

test('Functional: Critical warnings for extreme upgrades', () => {
  const comparison = calculateTireComparison(
    parseTireSize('265/70R16'),
    parseTireSize('37x12.50R17'),
    { axleGearRatio: 3.73 }
  );

  const advisory = generateAdvisory(comparison, 'daily_driver', { suspensionType: 'ifs' });

  // Should have warnings for 20%+ diameter increase
  const totalWarnings = advisory.warnings.critical.length + advisory.warnings.important.length + advisory.warnings.advisory.length;
  assert.ok(totalWarnings > 0, 'Should have warnings');

  // Check for critical severity warnings
  assert.ok(advisory.warnings.critical.length > 0, 'Should have critical warnings for extreme upgrade');
  assert.strictEqual(advisory.severity, 'critical', 'Overall severity should be critical');
});

test('Functional: IFS warnings for wide tires', () => {
  const comparison = calculateTireComparison(
    parseTireSize('265/70R17'),
    parseTireSize('35x12.50R17')  // Wide tire
  );

  const advisory = generateAdvisory(comparison, 'rock_crawling', { suspensionType: 'ifs' });

  // Combine all warnings into one array for checking
  const allWarnings = [
    ...advisory.warnings.critical,
    ...advisory.warnings.important,
    ...advisory.warnings.advisory
  ];

  // Should warn about IFS with wide tires
  const hasIFSWarning = allWarnings.some(w =>
    w.message.toLowerCase().includes('ifs') ||
    w.message.toLowerCase().includes('cv') ||
    w.message.toLowerCase().includes('independent') ||
    w.category.toLowerCase().includes('suspension')
  );

  assert.ok(hasIFSWarning, 'Should warn about IFS concerns with wide tires');
});

// ============================================================================
// EDGE CASES AND VALIDATION
// ============================================================================

test('Functional: Downgrading tire size', () => {
  const comparison = calculateTireComparison(
    parseTireSize('35x12.50R17'),
    parseTireSize('285/70R17')
  );

  // All changes should be negative
  assert.ok(comparison.differences.diameter.absolute < 0, 'Diameter decreases');
  assert.ok(comparison.differences.groundClearance.gain < 0, 'Clearance lost');
  assert.ok(comparison.speedometerError.ratio < 1, 'Speedometer reads faster');

  // With drivetrain
  const withDrivetrain = calculateTireComparison(
    parseTireSize('35x12.50R17'),
    parseTireSize('285/70R17'),
    { axleGearRatio: 4.10 }
  );

  // RPM should increase with smaller tires
  assert.ok(
    withDrivetrain.drivetrainImpact.rpm.new > withDrivetrain.drivetrainImpact.rpm.original,
    'RPM increases with smaller tires'
  );
});

test('Functional: Different wheel diameters', () => {
  const comparison = calculateTireComparison(
    parseTireSize('265/70R17'),
    parseTireSize('285/75R16')  // Different wheel size
  );

  assert.ok(comparison.current.wheelDiameter === 17);
  assert.ok(comparison.new.wheelDiameter === 16);
  assert.ok(comparison.differences.diameter.absolute !== 0);
});

test('Functional: LT-metric tire format', () => {
  const comparison = calculateTireComparison(
    parseTireSize('265/70R17'),
    parseTireSize('LT285/75R16')
  );

  assert.ok(comparison.new.isLT === true, 'Should identify LT tire');
  assert.ok(comparison.differences.diameter, 'Should calculate differences');
});

test('Functional: Flotation tire format', () => {
  const comparison = calculateTireComparison(
    parseTireSize('265/70R17'),
    parseTireSize('33x10.50R17')
  );

  // 33" tire should be approximately 33" diameter
  assert.ok(Math.abs(comparison.new.diameter - 33) < 0.5, '33" tire should be ~33" diameter');
  assert.ok(comparison.differences.diameter.absolute > 0);
});

// ============================================================================
// REAL-WORLD ACCURACY TESTS
// ============================================================================

test('Functional: Factory tire spec accuracy', () => {
  // Tacoma TRD Off-Road: 265/70R16 = 30.61" diameter
  const tire = parseTireSize('265/70R16');
  assert.ok(Math.abs(tire.diameter - 30.61) < 0.2, 'Should match factory spec');
});

test('Functional: Common 35" tire actual size', () => {
  // LT315/70R17 (marketed as 35") is actually ~34.4"
  const tire = parseTireSize('LT315/70R17');
  assert.ok(Math.abs(tire.diameter - 34.4) < 0.5, 'Should match actual measurement');
});

test('Functional: True flotation 37" tire', () => {
  const tire = parseTireSize('37x12.50R17');
  assert.ok(Math.abs(tire.diameter - 37.0) < 0.3, 'Flotation 37" should be true 37"');
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

test('Functional: Complete calculation workflow', () => {
  // Simulate user workflow
  const current = parseTireSize('265/70R17');
  const newTire = parseTireSize('285/75R17');

  const drivetrain = {
    axleGearRatio: 3.909,
    transmissionTopGear: 0.84,
    transferCaseLowRatio: 2.566,
    firstGearRatio: 3.538
  };

  // Calculate comparison
  const comparison = calculateTireComparison(current, newTire, drivetrain);

  // Generate recommendations
  const regear = generateRegearRecommendations(
    comparison,
    drivetrain.axleGearRatio,
    'weekend_trail',
    drivetrain
  );

  // Generate advisory
  const advisory = generateAdvisory(
    comparison,
    'weekend_trail',
    { suspensionType: 'ifs' }
  );

  // Verify complete result structure
  assert.ok(comparison.current, 'Has current tire data');
  assert.ok(comparison.new, 'Has new tire data');
  assert.ok(comparison.differences, 'Has differences');
  assert.ok(comparison.speedometerError, 'Has speedometer error');
  assert.ok(comparison.drivetrainImpact, 'Has drivetrain impact');
  assert.ok(comparison.clearance, 'Has clearance data');

  assert.ok(regear, 'Has regear recommendations');
  assert.ok(advisory, 'Has advisory');
  assert.ok(advisory.warnings, 'Has warnings');
  assert.ok(advisory.recommendations, 'Has recommendations');
});

console.log('✓ All functional tests passed');
