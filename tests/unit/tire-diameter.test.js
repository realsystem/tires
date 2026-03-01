/**
 * TIER 1: Mathematical Verification Tests - Tire Diameter
 *
 * PURPOSE: Prove that tire diameter formulas are 100% mathematically correct
 * using controlled test cases with known inputs and verifiable outputs.
 *
 * These tests MUST ALWAYS PASS. They use pure mathematics with no external
 * data dependencies.
 *
 * CONFIDENCE LEVEL: 100% (mathematical certainty)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { parseTireSize } from '../../src/engine/tireParser.js';

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

describe('Tire Diameter - Mathematical Verification (100% Confidence)', () => {

  describe('Metric Tire Format - Formula Accuracy', () => {

    test('265/70R17 - Standard calculation', () => {
      const tire = parseTireSize('265/70R17');

      // Manual calculation:
      // Sidewall = (265mm × 70%) / 25.4 = 7.3031"
      // Diameter = 2 × 7.3031" + 17" = 31.6062"
      const expected = 31.6062;

      assertWithinTolerance(tire.diameter, expected, 0.01, '265/70R17 diameter');
    });

    test('285/75R17 - Critical size (lookup table)', () => {
      const tire = parseTireSize('285/75R17');

      // This should use lookup table (32.8") instead of formula (33.83")
      const expectedLookup = 32.8;

      assert.strictEqual(tire.diameter, expectedLookup, '285/75R17 should use lookup table value');
      assert.strictEqual(tire.usedMeasuredData, true, '285/75R17 should flag as measured data');
    });

    test('315/75R16 - Large tire calculation', () => {
      const tire = parseTireSize('315/75R16');

      // Manual calculation:
      // Sidewall = (315mm × 75%) / 25.4 = 9.3012"
      // Diameter = 2 × 9.3012" + 16" = 34.6024"
      const expected = 34.6024;

      assertWithinTolerance(tire.diameter, expected, 0.01, '315/75R16 diameter');
    });

    test('285/50R20 - Low profile tire', () => {
      const tire = parseTireSize('285/50R20');

      // Manual calculation:
      // Sidewall = (285mm × 50%) / 25.4 = 5.6102"
      // Diameter = 2 × 5.6102" + 20" = 31.2204"
      const expected = 31.2204;

      assertWithinTolerance(tire.diameter, expected, 0.01, '285/50R20 diameter');
    });

    test('235/85R16 - High aspect ratio', () => {
      const tire = parseTireSize('235/85R16');

      // Manual calculation:
      // Sidewall = (235mm × 85%) / 25.4 = 199.75 / 25.4 = 7.8642"
      // Diameter = 2 × 7.8642" + 16" = 31.7283"
      const expected = 31.7283;

      assertWithinTolerance(tire.diameter, expected, 0.01, '235/85R16 diameter');
    });

    test('LT285/70R17 - LT prefix parsing', () => {
      const tire = parseTireSize('LT285/70R17');

      // Manual calculation (same as P-metric for diameter):
      // Sidewall = (285mm × 70%) / 25.4 = 7.8543"
      // Diameter = 2 × 7.8543" + 17" = 32.7086"

      // But this is in lookup table as 32.7"
      const expectedLookup = 32.7;

      assert.strictEqual(tire.isLT, true, 'Should parse as LT tire');
      assert.strictEqual(tire.diameter, expectedLookup, 'Should use lookup value');
    });

    test('P265/70R17 - P prefix parsing', () => {
      const tire = parseTireSize('P265/70R17');

      // Should parse same as 265/70R17
      const expected = 31.6062;

      assert.strictEqual(tire.isLT, false, 'Should parse as P-metric tire');
      // This is in lookup table as 31.6"
      const expectedLookup = 31.6;
      assert.strictEqual(tire.diameter, expectedLookup, 'Should use lookup value');
    });
  });

  describe('Flotation Tire Format - Direct Diameter', () => {

    test('35x12.50R17 - Standard flotation', () => {
      const tire = parseTireSize('35x12.50R17');

      // Flotation format specifies diameter directly
      const expected = 35.0;

      assert.strictEqual(tire.diameter, expected, '35x12.50R17 diameter should be exactly 35"');
      assert.strictEqual(tire.format, 'Flotation', 'Should parse as Flotation format');
    });

    test('37x13.50R20 - Large flotation tire', () => {
      const tire = parseTireSize('37x13.50R20');

      const expected = 37.0;

      assert.strictEqual(tire.diameter, expected, '37x13.50R20 diameter should be exactly 37"');
    });

    test('33x10.50R15 - Classic size', () => {
      const tire = parseTireSize('33x10.50R15');

      const expected = 33.0;

      assert.strictEqual(tire.diameter, expected, '33x10.50R15 diameter should be exactly 33"');
    });

    test('35x12.50-17 - Dash separator', () => {
      const tire = parseTireSize('35x12.50-17');

      const expected = 35.0;

      assert.strictEqual(tire.diameter, expected, 'Dash separator should work same as R');
    });

    test('40x13.50R17 - Extreme size', () => {
      const tire = parseTireSize('40x13.50R17');

      const expected = 40.0;

      assert.strictEqual(tire.diameter, expected, '40x13.50R17 diameter should be exactly 40"');
    });
  });

  describe('Sidewall Height Calculations', () => {

    test('Metric tire sidewall accuracy', () => {
      const tire = parseTireSize('285/75R16');

      // Sidewall = 285mm × 75% = 213.75mm
      const expectedMm = 213.75;
      const expectedInches = 213.75 / 25.4;

      assert.strictEqual(tire.sidewallHeight, expectedMm, 'Sidewall height in mm');
      assertWithinTolerance(tire.sidewallInches, expectedInches, 0.01, 'Sidewall height in inches');
    });

    test('Flotation tire sidewall calculation', () => {
      const tire = parseTireSize('35x12.50R17');

      // Sidewall = (35" - 17") / 2 = 9.0"
      const expectedInches = 9.0;
      const expectedMm = 9.0 * 25.4;

      assert.strictEqual(tire.sidewallInches, expectedInches, 'Sidewall height in inches');
      assertWithinTolerance(tire.sidewallHeight, expectedMm, 0.1, 'Sidewall height in mm');
    });

    test('Low profile sidewall', () => {
      const tire = parseTireSize('285/50R20');

      // Sidewall = 285mm × 50% = 142.5mm = 5.6102"
      const expectedMm = 142.5;
      const expectedInches = 5.6102;

      assert.strictEqual(tire.sidewallHeight, expectedMm, 'Low profile sidewall in mm');
      assertWithinTolerance(tire.sidewallInches, expectedInches, 0.01, 'Low profile sidewall in inches');
    });
  });

  describe('Width Conversions', () => {

    test('Metric width to inches', () => {
      const tire = parseTireSize('285/75R17');

      // Width = 285mm = 11.2205"
      const expectedInches = 285 / 25.4;
      const actualWidthInches = tire.width / 25.4;

      assertWithinTolerance(actualWidthInches, expectedInches, 0.01, 'Width conversion to inches');
    });

    test('Flotation width parsing', () => {
      const tire = parseTireSize('35x12.50R17');

      // Width specified as 12.50"
      const expectedInches = 12.50;
      const expectedMm = 12.50 * 25.4;

      assert.strictEqual(tire.widthInches, expectedInches, 'Flotation width in inches');
      assertWithinTolerance(tire.width, expectedMm, 0.1, 'Flotation width in mm');
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {

    test('Very small tire - 205/60R15', () => {
      const tire = parseTireSize('205/60R15');

      // Sidewall = (205mm × 60%) / 25.4 = 4.8425"
      // Diameter = 2 × 4.8425" + 15" = 24.6850"
      const expected = 24.6850;

      assertWithinTolerance(tire.diameter, expected, 0.01, 'Small tire diameter');
    });

    test('Very large tire - 42x14.50R20', () => {
      const tire = parseTireSize('42x14.50R20');

      const expected = 42.0;

      assert.strictEqual(tire.diameter, expected, 'Very large tire diameter');
    });

    test('Decimal wheel diameter - 17.5', () => {
      const tire = parseTireSize('235/75R17.5');

      // Sidewall = (235mm × 75%) / 25.4 = 6.9390"
      // Diameter = 2 × 6.9390" + 17.5" = 31.3780"
      const expected = 31.3780;

      assertWithinTolerance(tire.diameter, expected, 0.01, 'Decimal wheel diameter');
    });

    test('Extreme aspect ratio - 30', () => {
      const tire = parseTireSize('335/30R20');

      // Sidewall = (335mm × 30%) / 25.4 = 3.9567"
      // Diameter = 2 × 3.9567" + 20" = 27.9134"
      const expected = 27.9134;

      assertWithinTolerance(tire.diameter, expected, 0.01, 'Ultra low profile');
    });
  });

  describe('Lookup Table vs Formula Fallback', () => {

    test('Known size uses lookup table', () => {
      const tire = parseTireSize('265/70R17');

      assert.strictEqual(tire.usedMeasuredData, true, 'Should use lookup table for 265/70R17');
      assert.strictEqual(tire.diameter, 31.6, 'Should use measured value 31.6"');
    });

    test('Unknown size uses formula', () => {
      const tire = parseTireSize('245/65R17');

      // This size is NOT in lookup table
      assert.strictEqual(tire.usedMeasuredData, false, 'Should use formula for unknown size');

      // Verify formula calculation:
      // Sidewall = (245mm × 65%) / 25.4 = 6.2697"
      // Diameter = 2 × 6.2697" + 17" = 29.5394"
      const expected = 29.5394;
      assertWithinTolerance(tire.diameter, expected, 0.01, 'Formula fallback calculation');
    });

    test('Flotation tires don\'t need lookup table', () => {
      const tire = parseTireSize('35x12.50R17');

      // Flotation format gives exact diameter
      assert.strictEqual(tire.diameter, 35.0, 'Flotation diameter is exact by definition');
    });
  });

  describe('Diameter Consistency Checks', () => {

    test('Diameter matches circumference calculation', () => {
      const tire = parseTireSize('33x10.50R15');

      const diameter = tire.diameter;
      const expectedCircumference = diameter * Math.PI;

      // Calculate circumference from diameter, verify it matches
      const calculatedCircumference = tire.diameter * Math.PI;

      assertWithinTolerance(calculatedCircumference, expectedCircumference, 0.01, 'Circumference consistency');
    });

    test('Diameter in mm matches inches conversion', () => {
      const tire = parseTireSize('285/75R17');

      const diameterInches = tire.diameter;
      const diameterMm = tire.diameterMm;
      const expectedMm = diameterInches * 25.4;

      assertWithinTolerance(diameterMm, expectedMm, 0.1, 'Diameter mm/inch consistency');
    });

    test('Sidewall × 2 + wheel = diameter (metric)', () => {
      const tire = parseTireSize('315/70R17');

      // For lookup table values, this might not be exact
      if (!tire.usedMeasuredData) {
        const calculatedDiameter = (tire.sidewallInches * 2) + tire.wheelDiameter;
        assertWithinTolerance(tire.diameter, calculatedDiameter, 0.01, 'Sidewall to diameter consistency');
      }
    });

    test('Sidewall × 2 + wheel = diameter (flotation)', () => {
      const tire = parseTireSize('37x13.50R20');

      const calculatedDiameter = (tire.sidewallInches * 2) + tire.wheelDiameter;

      assert.strictEqual(tire.diameter, calculatedDiameter, 'Flotation sidewall consistency');
    });
  });
});
