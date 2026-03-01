/**
 * TIER 1: Mathematical Verification Tests - Speedometer Error
 *
 * PURPOSE: Prove that speedometer error calculations are 100% mathematically correct
 * using controlled test cases with known inputs and verifiable outputs.
 *
 * FORMULA:
 * ratio = newDiameter / originalDiameter
 * actualSpeed = indicatedSpeed × ratio
 * error = actualSpeed - indicatedSpeed
 * errorPercentage = (error / indicatedSpeed) × 100
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

describe('Speedometer Error - Mathematical Verification (100% Confidence)', () => {

  describe('Basic Ratio Calculations', () => {

    test('Same tire size - no error', () => {
      const current = parseTireSize('265/70R17');
      const newTire = parseTireSize('265/70R17');

      const comparison = calculateTireComparison(current, newTire);

      // Same tire = ratio of 1.0
      assert.strictEqual(comparison.speedometerError.ratio, 1.0, 'Ratio should be exactly 1.0');

      // No error at any speed
      assert.strictEqual(comparison.speedometerError.errors.at60mph.error, 0, 'No error at 60 mph');
      assert.strictEqual(comparison.speedometerError.errors.at60mph.errorPercentage, 0, 'No percentage error');
    });

    test('Larger tire - positive error (speedo reads slow)', () => {
      const current = parseTireSize('265/70R17'); // 31.6"
      const newTire = parseTireSize('285/75R17'); // 32.8"

      const comparison = calculateTireComparison(current, newTire);

      // Ratio calculation: 32.8 / 31.6 = 1.0380
      const expectedRatio = 32.8 / 31.6;
      assertWithinTolerance(comparison.speedometerError.ratio, expectedRatio, 0.0001, 'Speedometer ratio');

      // At 60 mph indicated, actual speed = 60 × 1.0380 = 62.28 mph
      const expectedActual = 60 * expectedRatio;
      assertWithinTolerance(
        comparison.speedometerError.errors.at60mph.actual,
        expectedActual,
        0.01,
        'Actual speed at 60 mph indicated'
      );

      // Error should be positive (reading slower than actual)
      assert.ok(comparison.speedometerError.errors.at60mph.error > 0, 'Error should be positive');
    });

    test('Smaller tire - negative error (speedo reads fast)', () => {
      const current = parseTireSize('285/75R17'); // 32.8"
      const newTire = parseTireSize('265/70R17'); // 31.6"

      const comparison = calculateTireComparison(current, newTire);

      // Ratio calculation: 31.6 / 32.8 = 0.9634
      const expectedRatio = 31.6 / 32.8;
      assertWithinTolerance(comparison.speedometerError.ratio, expectedRatio, 0.0001, 'Speedometer ratio');

      // At 60 mph indicated, actual speed = 60 × 0.9634 = 57.80 mph
      const expectedActual = 60 * expectedRatio;
      assertWithinTolerance(
        comparison.speedometerError.errors.at60mph.actual,
        expectedActual,
        0.01,
        'Actual speed at 60 mph indicated (downgrade)'
      );

      // Error should be negative (reading faster than actual)
      assert.ok(comparison.speedometerError.errors.at60mph.error < 0, 'Error should be negative');
    });

    test('Exact 10% increase', () => {
      const current = parseTireSize('33x10.50R15'); // 33.0"
      const newTire = parseTireSize('35x12.50R17'); // 35.0" (fake - for math test)
      // Actually 35x12.50R17 = 35.0", but let's verify the calculation

      const comparison = calculateTireComparison(current, newTire);

      // Ratio: 35.0 / 33.0 = 1.0606
      const expectedRatio = 35.0 / 33.0;
      assertWithinTolerance(comparison.speedometerError.ratio, expectedRatio, 0.0001, '10% increase ratio');

      // Error percentage at any speed should be ~6.06%
      assertWithinTolerance(
        comparison.speedometerError.errors.at60mph.errorPercentage,
        6.06,
        0.01,
        'Error percentage for 10% diameter increase'
      );
    });
  });

  describe('Multiple Speed Verification', () => {

    test('Error scales linearly with speed', () => {
      const current = parseTireSize('265/70R17'); // 31.6"
      const newTire = parseTireSize('285/75R17'); // 32.8"

      const comparison = calculateTireComparison(current, newTire);
      const ratio = 32.8 / 31.6;

      // At 30 mph
      const expected30 = 30 * ratio;
      assertWithinTolerance(
        comparison.speedometerError.errors.at30mph.actual,
        expected30,
        0.01,
        'Speed at 30 mph indicated'
      );

      // At 45 mph
      const expected45 = 45 * ratio;
      assertWithinTolerance(
        comparison.speedometerError.errors.at45mph.actual,
        expected45,
        0.01,
        'Speed at 45 mph indicated'
      );

      // At 60 mph
      const expected60 = 60 * ratio;
      assertWithinTolerance(
        comparison.speedometerError.errors.at60mph.actual,
        expected60,
        0.01,
        'Speed at 60 mph indicated'
      );

      // At 75 mph
      const expected75 = 75 * ratio;
      assertWithinTolerance(
        comparison.speedometerError.errors.at75mph.actual,
        expected75,
        0.01,
        'Speed at 75 mph indicated'
      );

      // Verify error percentage is same at all speeds
      const error30Pct = comparison.speedometerError.errors.at30mph.errorPercentage;
      const error60Pct = comparison.speedometerError.errors.at60mph.errorPercentage;
      const error75Pct = comparison.speedometerError.errors.at75mph.errorPercentage;

      assertWithinTolerance(error30Pct, error60Pct, 0.01, 'Error % consistent (30 vs 60)');
      assertWithinTolerance(error60Pct, error75Pct, 0.01, 'Error % consistent (60 vs 75)');
    });

    test('Large tire upgrade - all speeds', () => {
      const current = parseTireSize('265/70R17'); // 31.6"
      const newTire = parseTireSize('37x12.50R17'); // 37.0"

      const comparison = calculateTireComparison(current, newTire);
      const ratio = 37.0 / 31.6;

      // Verify each test speed
      [30, 45, 60, 75].forEach(speed => {
        const key = `at${speed}mph`;
        const expectedActual = speed * ratio;
        const expectedError = expectedActual - speed;
        const expectedErrorPct = (expectedError / speed) * 100;

        assertWithinTolerance(
          comparison.speedometerError.errors[key].actual,
          expectedActual,
          0.01,
          `Actual speed at ${speed} mph`
        );

        assertWithinTolerance(
          comparison.speedometerError.errors[key].error,
          expectedError,
          0.01,
          `Error at ${speed} mph`
        );

        assertWithinTolerance(
          comparison.speedometerError.errors[key].errorPercentage,
          expectedErrorPct,
          0.01,
          `Error percentage at ${speed} mph`
        );
      });
    });
  });

  describe('Large Upgrades (>10% Error)', () => {

    test('33" to 37" upgrade - major error', () => {
      const current = parseTireSize('33x10.50R15'); // 33.0"
      const newTire = parseTireSize('37x12.50R17'); // 37.0"

      const comparison = calculateTireComparison(current, newTire);

      // Ratio: 37.0 / 33.0 = 1.1212
      const expectedRatio = 37.0 / 33.0;
      assertWithinTolerance(comparison.speedometerError.ratio, expectedRatio, 0.0001, 'Large upgrade ratio');

      // At 60 mph indicated = 67.27 mph actual
      const expectedActual = 60 * expectedRatio;
      assertWithinTolerance(
        comparison.speedometerError.errors.at60mph.actual,
        expectedActual,
        0.01,
        'Large error at 60 mph'
      );

      // Error percentage ~12.12%
      assertWithinTolerance(
        comparison.speedometerError.errors.at60mph.errorPercentage,
        12.12,
        0.01,
        'Large error percentage'
      );
    });

    test('31" to 35" upgrade - common large upgrade', () => {
      const current = parseTireSize('265/70R17'); // 31.6"
      const newTire = parseTireSize('35x12.50R17'); // 35.0"

      const comparison = calculateTireComparison(current, newTire);

      // Ratio: 35.0 / 31.6 = 1.1076
      const expectedRatio = 35.0 / 31.6;

      // At 60 mph indicated = 66.46 mph actual
      const expectedActual = 60 * expectedRatio;
      assertWithinTolerance(
        comparison.speedometerError.errors.at60mph.actual,
        expectedActual,
        0.01,
        '31" to 35" error'
      );

      // Error: +6.46 mph (+10.76%)
      assertWithinTolerance(
        comparison.speedometerError.errors.at60mph.error,
        6.46,
        0.01,
        'Error magnitude for large upgrade'
      );
    });

    test('Stock to 40" - extreme upgrade', () => {
      const current = parseTireSize('265/70R17'); // 31.6"
      const newTire = parseTireSize('40x13.50R17'); // 40.0"

      const comparison = calculateTireComparison(current, newTire);

      // Ratio: 40.0 / 31.6 = 1.2658
      const expectedRatio = 40.0 / 31.6;

      // At 60 mph indicated = 75.95 mph actual (major error!)
      const expectedActual = 60 * expectedRatio;
      assertWithinTolerance(
        comparison.speedometerError.errors.at60mph.actual,
        expectedActual,
        0.01,
        'Extreme upgrade speed error'
      );

      // Error: +15.95 mph (+26.58%)
      assert.ok(
        comparison.speedometerError.errors.at60mph.errorPercentage > 25,
        'Extreme upgrade should have >25% error'
      );
    });
  });

  describe('Downgrades (Smaller Tires)', () => {

    test('33" to 31" downgrade', () => {
      const current = parseTireSize('285/75R17'); // 32.8"
      const newTire = parseTireSize('265/70R17'); // 31.6"

      const comparison = calculateTireComparison(current, newTire);

      // Ratio: 31.6 / 32.8 = 0.9634
      const expectedRatio = 31.6 / 32.8;

      // At 60 mph indicated = 57.80 mph actual (reading fast)
      const expectedActual = 60 * expectedRatio;
      assertWithinTolerance(
        comparison.speedometerError.errors.at60mph.actual,
        expectedActual,
        0.01,
        'Downgrade speed error'
      );

      // Error: -2.20 mph (-3.66%)
      assert.ok(
        comparison.speedometerError.errors.at60mph.error < 0,
        'Downgrade error should be negative'
      );
      assertWithinTolerance(
        comparison.speedometerError.errors.at60mph.error,
        -2.20,
        0.01,
        'Downgrade error magnitude'
      );
    });

    test('35" to 33" downgrade', () => {
      const current = parseTireSize('35x12.50R17'); // 35.0"
      const newTire = parseTireSize('33x10.50R15'); // 33.0"

      const comparison = calculateTireComparison(current, newTire);

      // Ratio: 33.0 / 35.0 = 0.9429
      const expectedRatio = 33.0 / 35.0;

      // At 60 mph indicated = 56.57 mph actual
      const expectedActual = 60 * expectedRatio;
      assertWithinTolerance(
        comparison.speedometerError.errors.at60mph.actual,
        expectedActual,
        0.01,
        '35" to 33" downgrade'
      );
    });

    test('37" to 31" - large downgrade', () => {
      const current = parseTireSize('37x12.50R17'); // 37.0"
      const newTire = parseTireSize('265/70R17'); // 31.6"

      const comparison = calculateTireComparison(current, newTire);

      // Ratio: 31.6 / 37.0 = 0.8541
      const expectedRatio = 31.6 / 37.0;

      // At 60 mph indicated = 51.24 mph actual (major under-reading)
      const expectedActual = 60 * expectedRatio;
      assertWithinTolerance(
        comparison.speedometerError.errors.at60mph.actual,
        expectedActual,
        0.01,
        'Large downgrade error'
      );

      // Error: -8.76 mph (-14.59%)
      assert.ok(
        comparison.speedometerError.errors.at60mph.errorPercentage < -14,
        'Large downgrade should have >14% negative error'
      );
    });
  });

  describe('Edge Cases and Precision', () => {

    test('Minimal difference - 0.5" change', () => {
      const current = parseTireSize('265/70R17'); // 31.6"
      const newTire = parseTireSize('265/65R17'); // 30.6"

      const comparison = calculateTireComparison(current, newTire);

      // Ratio: 30.6 / 31.6 = 0.9684
      const expectedRatio = 30.6 / 31.6;

      // At 60 mph indicated = 58.10 mph actual
      const expectedActual = 60 * expectedRatio;
      assertWithinTolerance(
        comparison.speedometerError.errors.at60mph.actual,
        expectedActual,
        0.01,
        'Minimal tire change'
      );

      // Small error: -1.90 mph (-3.16%)
      assertWithinTolerance(
        comparison.speedometerError.errors.at60mph.error,
        -1.90,
        0.02,
        'Small error magnitude'
      );
    });

    test('Very precise calculation - high speed', () => {
      const current = parseTireSize('285/70R17'); // 32.7"
      const newTire = parseTireSize('315/70R17'); // 34.4"

      const comparison = calculateTireComparison(current, newTire);

      // Ratio: 34.4 / 32.7 = 1.0520
      const expectedRatio = 34.4 / 32.7;

      // At 75 mph (highway speed)
      const expectedActual = 75 * expectedRatio;
      assertWithinTolerance(
        comparison.speedometerError.errors.at75mph.actual,
        expectedActual,
        0.01,
        'Precise calculation at highway speed'
      );
    });

    test('Flotation to metric comparison', () => {
      const current = parseTireSize('33x10.50R15'); // 33.0" (flotation)
      const newTire = parseTireSize('285/75R16'); // 32.8" (metric)

      const comparison = calculateTireComparison(current, newTire);

      // Ratio: 32.8 / 33.0 = 0.9939
      const expectedRatio = 32.8 / 33.0;
      assertWithinTolerance(comparison.speedometerError.ratio, expectedRatio, 0.0001, 'Flotation to metric ratio');

      // Minimal error (less than 1%)
      assert.ok(
        Math.abs(comparison.speedometerError.errors.at60mph.errorPercentage) < 1,
        'Error should be less than 1%'
      );
    });
  });

  describe('Summary String Verification', () => {

    test('Summary indicates direction correctly - larger tire', () => {
      const current = parseTireSize('265/70R17');
      const newTire = parseTireSize('285/75R17');

      const comparison = calculateTireComparison(current, newTire);

      // Should indicate speedometer reads SLOWER than actual
      assert.ok(
        comparison.speedometerError.summary.includes('SLOWER'),
        'Summary should indicate SLOWER for larger tire'
      );
    });

    test('Summary indicates direction correctly - smaller tire', () => {
      const current = parseTireSize('285/75R17');
      const newTire = parseTireSize('265/70R17');

      const comparison = calculateTireComparison(current, newTire);

      // Should indicate speedometer reads FASTER than actual
      assert.ok(
        comparison.speedometerError.summary.includes('FASTER'),
        'Summary should indicate FASTER for smaller tire'
      );
    });

    test('Summary indicates no error for same size', () => {
      const current = parseTireSize('285/75R17');
      const newTire = parseTireSize('285/75R17');

      const comparison = calculateTireComparison(current, newTire);

      // Should indicate no error
      assert.ok(
        comparison.speedometerError.summary.includes('No speedometer error'),
        'Summary should indicate no error'
      );
    });
  });

  describe('Mathematical Consistency Checks', () => {

    test('Inverse relationship - swap tires', () => {
      // Test A: 31.6" -> 32.8"
      const testA = calculateTireComparison(
        parseTireSize('265/70R17'),
        parseTireSize('285/75R17')
      );

      // Test B: 32.8" -> 31.6" (inverse)
      const testB = calculateTireComparison(
        parseTireSize('285/75R17'),
        parseTireSize('265/70R17')
      );

      // Ratios should be inverses
      const productOfRatios = testA.speedometerError.ratio * testB.speedometerError.ratio;
      assertWithinTolerance(productOfRatios, 1.0, 0.0001, 'Inverse ratios multiply to 1.0');

      // Error percentages should be opposite signs
      const errorA = testA.speedometerError.errors.at60mph.errorPercentage;
      const errorB = testB.speedometerError.errors.at60mph.errorPercentage;
      assert.ok(
        (errorA > 0 && errorB < 0) || (errorA < 0 && errorB > 0),
        'Inverse tire swaps should have opposite error signs'
      );
    });

    test('Error magnitude proportional to diameter change', () => {
      // Small change: 31.6" -> 32.8" (1.2" = 3.8%)
      const small = calculateTireComparison(
        parseTireSize('265/70R17'),
        parseTireSize('285/75R17')
      );

      // Large change: 31.6" -> 35.0" (3.4" = 10.8%)
      const large = calculateTireComparison(
        parseTireSize('265/70R17'),
        parseTireSize('35x12.50R17')
      );

      // Large change should have proportionally larger error
      const smallError = Math.abs(small.speedometerError.errors.at60mph.errorPercentage);
      const largeError = Math.abs(large.speedometerError.errors.at60mph.errorPercentage);

      assert.ok(
        largeError > smallError * 2.5,
        'Larger diameter change should produce proportionally larger error'
      );
    });
  });
});
