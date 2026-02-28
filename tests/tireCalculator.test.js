/**
 * Tests for Tire Calculator
 * Validates comparison calculations and accuracy
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { parseTireSize } from '../src/engine/tireParser.js';
import { calculateTireComparison } from '../src/engine/tireCalculator.js';

test('Basic tire comparison - 265/70R17 to 285/75R17', () => {
  const current = parseTireSize('265/70R17');
  const newTire = parseTireSize('285/75R17');

  const comparison = calculateTireComparison(current, newTire);

  // Verify structure
  assert.ok(comparison.current);
  assert.ok(comparison.new);
  assert.ok(comparison.differences);
  assert.ok(comparison.speedometerError);

  // Diameter should increase
  assert.ok(comparison.differences.diameter.absolute > 0);
  assert.ok(comparison.differences.diameter.percentage > 0);

  // Width should increase
  assert.ok(comparison.differences.width.absolute > 0);

  // Ground clearance should be half of diameter increase
  assert.strictEqual(
    comparison.differences.groundClearance.gain,
    comparison.differences.diameter.absolute / 2
  );
});

test('Speedometer error calculation', () => {
  const current = parseTireSize('265/70R17');
  const newTire = parseTireSize('285/75R17');

  const comparison = calculateTireComparison(current, newTire);
  const speedError = comparison.speedometerError;

  // With larger tire, actual speed should be higher than indicated
  assert.ok(speedError.ratio > 1);

  // Check that actual speeds are higher
  assert.ok(speedError.errors.at60mph.actual > 60);

  // Error percentage should be consistent
  const expectedErrorPct = (speedError.ratio - 1) * 100;
  assert.ok(Math.abs(speedError.errors.at60mph.errorPercentage - expectedErrorPct) < 0.1);
});

test('Drivetrain impact calculation', () => {
  const current = parseTireSize('265/70R17');
  const newTire = parseTireSize('285/75R17');

  const drivetrain = {
    axleGearRatio: 3.73,
    transmissionTopGear: 1.0,
    transferCaseRatio: 1.0,
    transferCaseLowRatio: 2.5,
    firstGearRatio: 4.0
  };

  const comparison = calculateTireComparison(current, newTire, drivetrain);
  const impact = comparison.drivetrainImpact;

  assert.ok(impact);
  assert.ok(impact.effectiveGearRatio);
  assert.ok(impact.rpm);
  assert.ok(impact.crawlRatio);

  // Effective ratio should decrease (become numerically lower) with larger tires
  assert.ok(impact.effectiveGearRatio.new < impact.effectiveGearRatio.original);

  // RPM should decrease with larger tires
  assert.ok(impact.rpm.new < impact.rpm.original);

  // Crawl ratio calculations
  assert.ok(impact.crawlRatio.original > 0);
  assert.ok(impact.crawlRatio.new > 0);
});

test('Same tire size comparison', () => {
  const current = parseTireSize('265/70R17');
  const newTire = parseTireSize('265/70R17');

  const comparison = calculateTireComparison(current, newTire);

  // All differences should be zero
  assert.strictEqual(comparison.differences.diameter.absolute, 0);
  assert.strictEqual(comparison.differences.width.absolute, 0);
  assert.strictEqual(comparison.differences.groundClearance.gain, 0);

  // Speedometer ratio should be 1
  assert.strictEqual(comparison.speedometerError.ratio, 1);
});

test('Flotation to metric comparison', () => {
  const current = parseTireSize('265/70R17');
  const newTire = parseTireSize('35x12.50R17');

  const comparison = calculateTireComparison(current, newTire);

  // 35" tire should be significantly larger than 265/70R17 (~31.6")
  assert.ok(comparison.differences.diameter.absolute > 3);
  assert.ok(comparison.differences.diameter.percentage > 10);
});

test('Clearance impact assessment', () => {
  const current = parseTireSize('265/70R17');
  const newTire = parseTireSize('285/75R17');

  const comparison = calculateTireComparison(current, newTire);
  const clearance = comparison.clearance;

  assert.ok(clearance.groundClearanceGain > 0);
  assert.ok(clearance.estimatedLiftRequired >= 0);
  assert.ok(clearance.liftRecommendation);
  assert.ok(clearance.fenderClearance);
  assert.ok(clearance.wheelOffset);
});

test('Large tire upgrade', () => {
  const current = parseTireSize('265/70R17'); // ~31.6"
  const newTire = parseTireSize('37x12.50R17'); // 37"

  const comparison = calculateTireComparison(current, newTire);

  // Should show significant changes
  assert.ok(comparison.differences.diameter.percentage > 15);

  // Should recommend lift
  assert.ok(comparison.clearance.estimatedLiftRequired > 0);

  // Should show fender clearance concern
  assert.ok(comparison.clearance.fenderClearance.concern);
});

test('Smaller tire downgrade', () => {
  const current = parseTireSize('285/75R17');
  const newTire = parseTireSize('265/70R17');

  const comparison = calculateTireComparison(current, newTire);

  // Diameter should decrease
  assert.ok(comparison.differences.diameter.absolute < 0);
  assert.ok(comparison.differences.diameter.percentage < 0);

  // Ground clearance should be lost
  assert.ok(comparison.differences.groundClearance.gain < 0);

  // Speedometer should read faster
  assert.ok(comparison.speedometerError.ratio < 1);
});

console.log('✓ All tire calculator tests passed');
