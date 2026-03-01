/**
 * TIER 1: Mathematical Verification Tests - Effective Gear Ratio
 *
 * PURPOSE: Prove that effective gear ratio calculations are 100% mathematically correct
 * using controlled test cases with known inputs and verifiable outputs.
 *
 * FORMULA:
 * newEffectiveRatio = originalRatio × (originalDiameter / newDiameter)
 * change = newEffectiveRatio - originalRatio
 * changePercentage = (change / originalRatio) × 100
 *
 * THEORY:
 * Larger tires create a "taller" effective gear ratio (numerically lower),
 * which reduces acceleration and torque multiplication but lowers RPM.
 *
 * These tests MUST ALWAYS PASS. They use pure mathematics with no external
 * data dependencies.
 *
 * CONFIDENCE LEVEL: 100% (mathematical certainty)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { parseTireSize } from '../../src/engine/tireParser.js';
import { calculateTireComparison } from '../../src/engine/tireCalculator.js';

/**
 * Helper: Assert value is within tolerance
 */
function assertWithinTolerance(actual, expected, tolerance, message) {
  const diff = Math.abs(actual - expected);
  assert.ok(
    diff <= tolerance,
    `${message}: expected ${expected}, got ${actual}, diff ${diff.toFixed(4)} exceeds tolerance ${tolerance}`
  );
}

describe('Effective Gear Ratio - Mathematical Verification (100% Confidence)', () => {

  describe('Basic Formula Verification', () => {

    test('Same tire size - no change', () => {
      const current = parseTireSize('265/70R17');
      const newTire = parseTireSize('265/70R17');

      const comparison = calculateTireComparison(current, newTire, {
        axleGearRatio: 3.909
      });

      // Same tire = no effective ratio change
      assert.strictEqual(
        comparison.drivetrainImpact.effectiveGearRatio.new,
        3.909,
        'Effective ratio should equal original'
      );
      assert.strictEqual(
        comparison.drivetrainImpact.effectiveGearRatio.change,
        0,
        'Change should be zero'
      );
      assert.strictEqual(
        comparison.drivetrainImpact.effectiveGearRatio.changePercentage,
        0,
        'Change percentage should be zero'
      );
    });

    test('Larger tire - lower effective ratio', () => {
      const current = parseTireSize('265/70R17'); // 31.6"
      const newTire = parseTireSize('285/75R17'); // 32.8"

      const comparison = calculateTireComparison(current, newTire, {
        axleGearRatio: 3.909
      });

      // newEffective = 3.909 × (31.6 / 32.8) = 3.909 × 0.9634 = 3.766
      const expectedEffective = 3.909 * (31.6 / 32.8);
      assertWithinTolerance(
        comparison.drivetrainImpact.effectiveGearRatio.new,
        expectedEffective,
        0.001,
        'Effective ratio for larger tire'
      );

      // Change should be negative (lower ratio)
      assert.ok(
        comparison.drivetrainImpact.effectiveGearRatio.change < 0,
        'Change should be negative for larger tire'
      );

      // Expected change: 3.766 - 3.909 = -0.143
      const expectedChange = expectedEffective - 3.909;
      assertWithinTolerance(
        comparison.drivetrainImpact.effectiveGearRatio.change,
        expectedChange,
        0.001,
        'Effective ratio change'
      );
    });

    test('Smaller tire - higher effective ratio', () => {
      const current = parseTireSize('285/75R17'); // 32.8"
      const newTire = parseTireSize('265/70R17'); // 31.6"

      const comparison = calculateTireComparison(current, newTire, {
        axleGearRatio: 3.909
      });

      // newEffective = 3.909 × (32.8 / 31.6) = 3.909 × 1.0380 = 4.057
      const expectedEffective = 3.909 * (32.8 / 31.6);
      assertWithinTolerance(
        comparison.drivetrainImpact.effectiveGearRatio.new,
        expectedEffective,
        0.001,
        'Effective ratio for smaller tire'
      );

      // Change should be positive (higher ratio)
      assert.ok(
        comparison.drivetrainImpact.effectiveGearRatio.change > 0,
        'Change should be positive for smaller tire'
      );
    });
  });

  describe('Common Real-World Scenarios', () => {

    test('Tacoma 3.909 gears with 33" tires', () => {
      const current = parseTireSize('265/70R16'); // 30.6"
      const newTire = parseTireSize('285/75R17'); // 32.8"

      const comparison = calculateTireComparison(current, newTire, {
        axleGearRatio: 3.909
      });

      // newEffective = 3.909 × (30.6 / 32.8) = 3.909 × 0.9329 = 3.647
      const expectedEffective = 3.909 * (30.6 / 32.8);
      assertWithinTolerance(
        comparison.drivetrainImpact.effectiveGearRatio.new,
        expectedEffective,
        0.001,
        'Tacoma 33" upgrade effective ratio'
      );

      // Change percentage: -6.71%
      const expectedChangePct = ((expectedEffective - 3.909) / 3.909) * 100;
      assertWithinTolerance(
        comparison.drivetrainImpact.effectiveGearRatio.changePercentage,
        expectedChangePct,
        0.01,
        'Tacoma 33" upgrade change percentage'
      );
    });

    test('Jeep Rubicon 4.10 gears with 35" tires', () => {
      const current = parseTireSize('285/70R17'); // 32.7"
      const newTire = parseTireSize('35x12.50R17'); // 35.0"

      const comparison = calculateTireComparison(current, newTire, {
        axleGearRatio: 4.10
      });

      // newEffective = 4.10 × (32.7 / 35.0) = 4.10 × 0.9343 = 3.831
      const expectedEffective = 4.10 * (32.7 / 35.0);
      assertWithinTolerance(
        comparison.drivetrainImpact.effectiveGearRatio.new,
        expectedEffective,
        0.001,
        'Jeep 35" upgrade effective ratio'
      );

      // Change: -0.269 (-6.56%)
      const expectedChange = expectedEffective - 4.10;
      assertWithinTolerance(
        comparison.drivetrainImpact.effectiveGearRatio.change,
        expectedChange,
        0.001,
        'Jeep 35" upgrade change'
      );
    });

    test('Bronco Sasquatch 4.70 gears with 37" tires', () => {
      const current = parseTireSize('315/70R17'); // 34.4"
      const newTire = parseTireSize('37x12.50R17'); // 37.0"

      const comparison = calculateTireComparison(current, newTire, {
        axleGearRatio: 4.70
      });

      // newEffective = 4.70 × (34.4 / 37.0) = 4.70 × 0.9297 = 4.370
      const expectedEffective = 4.70 * (34.4 / 37.0);
      assertWithinTolerance(
        comparison.drivetrainImpact.effectiveGearRatio.new,
        expectedEffective,
        0.001,
        'Bronco 37" upgrade effective ratio'
      );
    });

    test('4Runner 4.10 gears with 33" tires', () => {
      const current = parseTireSize('265/70R17'); // 31.6"
      const newTire = parseTireSize('285/75R17'); // 32.8"

      const comparison = calculateTireComparison(current, newTire, {
        axleGearRatio: 4.10
      });

      // newEffective = 4.10 × (31.6 / 32.8) = 4.10 × 0.9634 = 3.950
      const expectedEffective = 4.10 * (31.6 / 32.8);
      assertWithinTolerance(
        comparison.drivetrainImpact.effectiveGearRatio.new,
        expectedEffective,
        0.001,
        '4Runner 33" upgrade effective ratio'
      );

      // Change: -0.150 (-3.66%)
      const expectedChangePct = ((expectedEffective - 4.10) / 4.10) * 100;
      assertWithinTolerance(
        comparison.drivetrainImpact.effectiveGearRatio.changePercentage,
        expectedChangePct,
        0.01,
        '4Runner 33" upgrade change percentage'
      );
    });
  });

  describe('Extreme Changes (>10% Diameter)', () => {

    test('Stock to 37" - extreme upgrade', () => {
      const current = parseTireSize('265/70R17'); // 31.6"
      const newTire = parseTireSize('37x12.50R17'); // 37.0"

      const comparison = calculateTireComparison(current, newTire, {
        axleGearRatio: 4.10
      });

      // newEffective = 4.10 × (31.6 / 37.0) = 4.10 × 0.8541 = 3.502
      const expectedEffective = 4.10 * (31.6 / 37.0);
      assertWithinTolerance(
        comparison.drivetrainImpact.effectiveGearRatio.new,
        expectedEffective,
        0.001,
        'Extreme upgrade effective ratio'
      );

      // Change should be > -10%
      assert.ok(
        comparison.drivetrainImpact.effectiveGearRatio.changePercentage < -10,
        'Extreme upgrade should have >10% change'
      );

      // Expected change: -14.59%
      const expectedChangePct = ((expectedEffective - 4.10) / 4.10) * 100;
      assertWithinTolerance(
        comparison.drivetrainImpact.effectiveGearRatio.changePercentage,
        expectedChangePct,
        0.01,
        'Extreme upgrade change percentage'
      );
    });

    test('40" to 33" - extreme downgrade', () => {
      const current = parseTireSize('40x13.50R17'); // 40.0"
      const newTire = parseTireSize('33x10.50R15'); // 33.0"

      const comparison = calculateTireComparison(current, newTire, {
        axleGearRatio: 5.13
      });

      // newEffective = 5.13 × (40.0 / 33.0) = 5.13 × 1.2121 = 6.218
      const expectedEffective = 5.13 * (40.0 / 33.0);
      assertWithinTolerance(
        comparison.drivetrainImpact.effectiveGearRatio.new,
        expectedEffective,
        0.001,
        'Extreme downgrade effective ratio'
      );

      // Change should be > +20%
      assert.ok(
        comparison.drivetrainImpact.effectiveGearRatio.changePercentage > 20,
        'Extreme downgrade should have >20% change'
      );
    });
  });

  describe('Various Axle Ratios', () => {

    test('3.73 gears (common mid-ratio)', () => {
      const current = parseTireSize('265/70R17'); // 31.6"
      const newTire = parseTireSize('285/75R17'); // 32.8"

      const comparison = calculateTireComparison(current, newTire, {
        axleGearRatio: 3.73
      });

      // newEffective = 3.73 × (31.6 / 32.8) = 3.73 × 0.9634 = 3.593
      const expectedEffective = 3.73 * (31.6 / 32.8);
      assertWithinTolerance(
        comparison.drivetrainImpact.effectiveGearRatio.new,
        expectedEffective,
        0.001,
        '3.73 gear effective ratio'
      );
    });

    test('5.13 gears (low/crawl gears)', () => {
      const current = parseTireSize('35x12.50R17'); // 35.0"
      const newTire = parseTireSize('37x12.50R17'); // 37.0"

      const comparison = calculateTireComparison(current, newTire, {
        axleGearRatio: 5.13
      });

      // newEffective = 5.13 × (35.0 / 37.0) = 5.13 × 0.9459 = 4.853
      const expectedEffective = 5.13 * (35.0 / 37.0);
      assertWithinTolerance(
        comparison.drivetrainImpact.effectiveGearRatio.new,
        expectedEffective,
        0.001,
        '5.13 gear effective ratio'
      );
    });

    test('3.42 gears (highway gears)', () => {
      const current = parseTireSize('265/70R17'); // 31.6"
      const newTire = parseTireSize('285/75R17'); // 32.8"

      const comparison = calculateTireComparison(current, newTire, {
        axleGearRatio: 3.42
      });

      // newEffective = 3.42 × (31.6 / 32.8) = 3.42 × 0.9634 = 3.295
      const expectedEffective = 3.42 * (31.6 / 32.8);
      assertWithinTolerance(
        comparison.drivetrainImpact.effectiveGearRatio.new,
        expectedEffective,
        0.001,
        '3.42 gear effective ratio'
      );
    });
  });

  describe('Torque Multiplication Verification', () => {

    test('Effective ratio change equals torque change', () => {
      const current = parseTireSize('285/70R17'); // 32.7"
      const newTire = parseTireSize('35x12.50R17'); // 35.0"

      const comparison = calculateTireComparison(current, newTire, {
        axleGearRatio: 4.10
      });

      // If effective ratio drops 6.56%, wheel torque should drop 6.56%
      // (assuming constant engine torque)
      const originalRatio = 4.10;
      const newRatio = comparison.drivetrainImpact.effectiveGearRatio.new;
      const torqueMultiplierChange = (newRatio / originalRatio) - 1;
      const effectiveRatioChangePct = comparison.drivetrainImpact.effectiveGearRatio.changePercentage / 100;

      // These should be the same
      assertWithinTolerance(
        torqueMultiplierChange,
        effectiveRatioChangePct,
        0.0001,
        'Torque multiplier change matches effective ratio change'
      );
    });

    test('Double tire size change = double ratio change (approximately)', () => {
      // Small change: 31.6" -> 32.8" (1.2" increase)
      const small = calculateTireComparison(
        parseTireSize('265/70R17'),
        parseTireSize('285/75R17'),
        { axleGearRatio: 4.10 }
      );

      // Large change: 31.6" -> 34.4" (2.8" increase - ~2.33x larger)
      const large = calculateTireComparison(
        parseTireSize('265/70R17'),
        parseTireSize('315/70R17'),
        { axleGearRatio: 4.10 }
      );

      const smallChangePct = Math.abs(small.drivetrainImpact.effectiveGearRatio.changePercentage);
      const largeChangePct = Math.abs(large.drivetrainImpact.effectiveGearRatio.changePercentage);

      // Large change should be roughly 2.33x the small change
      const ratio = largeChangePct / smallChangePct;
      assertWithinTolerance(ratio, 2.33, 0.2, 'Change ratio proportional to diameter change');
    });
  });

  describe('Edge Cases', () => {

    test('Minimal tire change - 0.1" difference', () => {
      const current = parseTireSize('265/70R17'); // 31.6"
      const newTire = parseTireSize('275/65R18'); // 32.1" (0.5" difference)

      const comparison = calculateTireComparison(current, newTire, {
        axleGearRatio: 3.909
      });

      // newEffective = 3.909 × (31.6 / 32.1) = 3.909 × 0.9844 = 3.848
      const expectedEffective = 3.909 * (31.6 / 32.1);
      assertWithinTolerance(
        comparison.drivetrainImpact.effectiveGearRatio.new,
        expectedEffective,
        0.001,
        'Minimal change effective ratio'
      );

      // Change should be small (< 2%)
      assert.ok(
        Math.abs(comparison.drivetrainImpact.effectiveGearRatio.changePercentage) < 2,
        'Minimal tire change should have <2% ratio change'
      );
    });

    test('Decimal gear ratio - 4.56', () => {
      const current = parseTireSize('285/70R17'); // 32.7"
      const newTire = parseTireSize('35x12.50R17'); // 35.0"

      const comparison = calculateTireComparison(current, newTire, {
        axleGearRatio: 4.56
      });

      // newEffective = 4.56 × (32.7 / 35.0) = 4.56 × 0.9343 = 4.260
      const expectedEffective = 4.56 * (32.7 / 35.0);
      assertWithinTolerance(
        comparison.drivetrainImpact.effectiveGearRatio.new,
        expectedEffective,
        0.001,
        'Decimal gear ratio calculation'
      );
    });
  });

  describe('Summary String Verification', () => {

    test('Summary indicates lower gearing for larger tire (>5% change)', () => {
      const current = parseTireSize('265/70R17'); // 31.6"
      const newTire = parseTireSize('35x12.50R17'); // 35.0"

      const comparison = calculateTireComparison(current, newTire, {
        axleGearRatio: 4.10
      });

      // Change is -10.76%, should trigger LOWER message
      assert.ok(
        comparison.drivetrainImpact.effectiveGearRatio.summary.includes('LOWER'),
        'Summary should indicate LOWER gearing for >5% change'
      );
    });

    test('Summary indicates higher gearing for smaller tire (>5% change)', () => {
      const current = parseTireSize('35x12.50R17'); // 35.0"
      const newTire = parseTireSize('265/70R17'); // 31.6"

      const comparison = calculateTireComparison(current, newTire, {
        axleGearRatio: 4.10
      });

      // Change is +10.76%, should trigger HIGHER message
      assert.ok(
        comparison.drivetrainImpact.effectiveGearRatio.summary.includes('HIGHER'),
        'Summary should indicate HIGHER gearing for >5% change'
      );
    });

    test('Summary indicates minimal change for same size', () => {
      const current = parseTireSize('285/75R17');
      const newTire = parseTireSize('285/75R17');

      const comparison = calculateTireComparison(current, newTire, {
        axleGearRatio: 3.909
      });

      // Should indicate minimal change
      assert.ok(
        comparison.drivetrainImpact.effectiveGearRatio.summary.includes('Minimal'),
        'Summary should indicate minimal change'
      );
    });
  });
});
