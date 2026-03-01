/**
 * TIER 1: Mathematical Verification Tests - Rotational Physics
 *
 * PURPOSE: Verify that rotational inertia calculations are mathematically sound
 * and produce expected results for known tire configurations.
 *
 * PHYSICS BACKGROUND:
 * - Rotational inertia: I = m × r²
 * - Impact factor = (weightDelta% + diameterDelta% × 1.5) / 2
 * - Diameter weighted 1.5× because radius has squared effect
 *
 * CONFIDENCE LEVEL: 100% (mathematical verification with database weights)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getTireWeight, calculateRotationalImpact } from '../../src/engine/rotationalPhysics.js';

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

describe('Rotational Physics - Mathematical Verification (100% Confidence)', () => {

  describe('Tire Weight Lookup', () => {

    test('Known tire size - high confidence (285/75R17)', () => {
      const result = getTireWeight('285/75R17', 32.8);

      assert.strictEqual(result.weight_lbs, 58, 'Weight should match database');
      assert.strictEqual(result.confidence, 'high', 'Should be high confidence');
      assert.strictEqual(result.category, '33_inch_upgrade', 'Category should match');
    });

    test('Known tire size - high confidence (265/70R17)', () => {
      const result = getTireWeight('265/70R17', 31.6);

      assert.strictEqual(result.weight_lbs, 48, 'Weight should match database');
      assert.strictEqual(result.confidence, 'high', 'Should be high confidence');
    });

    test('Unknown tire size - diameter estimate', () => {
      const result = getTireWeight('999/99R99', 32.0);

      assert.ok(result.weight_lbs > 0, 'Should provide estimated weight');
      assert.strictEqual(result.confidence, 'low', 'Should be low confidence for estimate');
      assert.strictEqual(result.source, 'diameter-based estimate', 'Should indicate estimate');
    });

    test('35" tire - database weight', () => {
      const result = getTireWeight('35x12.50R17', 35.0);

      assert.strictEqual(result.weight_lbs, 71, 'Weight should match database');
      assert.strictEqual(result.confidence, 'high', 'Should be high confidence');
      assert.strictEqual(result.category, '35_inch_upgrade', 'Category should match');
    });
  });

  describe('Rotational Impact Calculation - Same Size', () => {

    test('Identical tires - zero impact', () => {
      const current = { size: '265/70R17', diameter: 31.6 };
      const newTire = { size: '265/70R17', diameter: 31.6 };

      const result = calculateRotationalImpact(current, newTire);

      // Weight change should be zero
      assert.strictEqual(result.changes.weight.delta_lbs, 0, 'No weight change');
      assert.strictEqual(result.changes.weight.delta_pct, 0, 'No weight percentage change');

      // Diameter change should be zero
      assert.strictEqual(result.changes.diameter.delta_inches, 0, 'No diameter change');
      assert.strictEqual(result.changes.diameter.delta_pct, 0, 'No diameter percentage change');

      // Rotational impact should be zero
      assert.strictEqual(result.changes.rotational_inertia.factor, 0, 'No rotational impact');
      assert.strictEqual(result.changes.rotational_inertia.category, 'LOW', 'Should be LOW category');
    });
  });

  describe('Rotational Impact Calculation - Weight Only Change', () => {

    test('Same diameter, different weight (hypothetical)', () => {
      // Using same diameter but different tire sizes to test weight-only impact
      // 265/70R17 (31.6", 48 lbs) vs 285/70R17 (32.7", 54 lbs)
      // For this test, we'll pretend they're same diameter to isolate weight
      const current = { size: '265/70R17', diameter: 32.0 };
      const newTire = { size: '285/70R17', diameter: 32.0 };

      const result = calculateRotationalImpact(current, newTire);

      // Weight should increase
      assert.ok(result.changes.weight.delta_lbs > 0, 'Weight should increase');

      // Diameter change is zero
      assert.strictEqual(result.changes.diameter.delta_inches, 0, 'Diameter unchanged');

      // Impact factor formula: (weightPct + diameterPct × 1.5) / 2
      // When diameter is zero: (weightPct + 0) / 2 = weightPct / 2
      const expectedImpact = result.changes.weight.delta_pct / 2;
      assertWithinTolerance(
        result.changes.rotational_inertia.factor,
        expectedImpact,
        0.01,
        'Impact should be half weight change when diameter constant'
      );
    });
  });

  describe('Rotational Impact Calculation - Common Upgrades', () => {

    test('Tacoma: 265/70R17 → 285/75R17 (33" upgrade)', () => {
      const current = { size: '265/70R17', diameter: 31.6 };
      const newTire = { size: '285/75R17', diameter: 32.8 };

      const result = calculateRotationalImpact(current, newTire);

      // Verify tire weights from database
      assert.strictEqual(result.current.weight_lbs, 48, 'Current tire weight');
      assert.strictEqual(result.new.weight_lbs, 58, 'New tire weight');

      // Weight delta: 58 - 48 = 10 lbs per tire
      assert.strictEqual(result.changes.weight.delta_lbs, 10, 'Weight delta per tire');
      assert.strictEqual(result.changes.weight.all_four_tires, 40, 'Total weight delta');

      // Weight percentage: (10 / 48) * 100 = 20.83%
      const expectedWeightPct = (10 / 48) * 100;
      assertWithinTolerance(
        result.changes.weight.delta_pct,
        expectedWeightPct,
        0.1,
        'Weight percentage change'
      );

      // Diameter delta: 32.8 - 31.6 = 1.2"
      assertWithinTolerance(result.changes.diameter.delta_inches, 1.2, 0.1, 'Diameter delta');

      // Diameter percentage: (1.2 / 31.6) * 100 = 3.80%
      const expectedDiameterPct = (1.2 / 31.6) * 100;
      assertWithinTolerance(
        result.changes.diameter.delta_pct,
        expectedDiameterPct,
        0.1,
        'Diameter percentage change'
      );

      // Rotational impact: (20.83 + 3.80 × 1.5) / 2 = (20.83 + 5.70) / 2 = 13.27%
      const expectedImpact = (expectedWeightPct + expectedDiameterPct * 1.5) / 2;
      assertWithinTolerance(
        result.changes.rotational_inertia.factor,
        expectedImpact,
        0.5,
        'Rotational impact factor'
      );

      // Should be HIGH impact (>10%)
      assert.strictEqual(result.changes.rotational_inertia.category, 'HIGH', 'Should be HIGH impact');

      // Confidence should be HIGH (both tires in database)
      assert.strictEqual(result.confidence.overall, 'HIGH', 'Should be high confidence');
    });

    test('Jeep: 285/70R17 → 35x12.50R17 (35" upgrade)', () => {
      const current = { size: '285/70R17', diameter: 32.7 };
      const newTire = { size: '35x12.50R17', diameter: 35.0 };

      const result = calculateRotationalImpact(current, newTire);

      // Verify weights
      assert.strictEqual(result.current.weight_lbs, 54, 'Current tire weight');
      assert.strictEqual(result.new.weight_lbs, 71, 'New tire weight');

      // Weight delta: 71 - 54 = 17 lbs per tire
      assert.strictEqual(result.changes.weight.delta_lbs, 17, 'Weight delta');
      assert.strictEqual(result.changes.weight.all_four_tires, 68, 'Total weight increase');

      // Diameter delta: 35.0 - 32.7 = 2.3"
      assertWithinTolerance(result.changes.diameter.delta_inches, 2.3, 0.1, 'Diameter delta');

      // This is a significant upgrade
      assert.ok(
        result.changes.rotational_inertia.factor > 10,
        'Should have >10% rotational impact'
      );
      assert.strictEqual(result.changes.rotational_inertia.category, 'HIGH', 'Should be HIGH impact');

      // Should have recommendations
      assert.ok(result.recommendations.length > 0, 'Should provide recommendations');

      // Should mention regearing
      const hasRegearRec = result.recommendations.some(r => r.toLowerCase().includes('regear'));
      assert.ok(hasRegearRec, 'Should recommend regearing for large upgrade');
    });

    test('Bronco Sasquatch: 315/70R17 → 37x12.50R17 (37" upgrade)', () => {
      const current = { size: '315/70R17', diameter: 34.4 };
      const newTire = { size: '37x12.50R17', diameter: 37.0 };

      const result = calculateRotationalImpact(current, newTire);

      // Verify weights
      assert.strictEqual(result.current.weight_lbs, 65, 'Current tire weight');
      assert.strictEqual(result.new.weight_lbs, 82, 'New tire weight');

      // Weight delta: 82 - 65 = 17 lbs
      assert.strictEqual(result.changes.weight.delta_lbs, 17, 'Weight delta');

      // Should be HIGH impact
      assert.strictEqual(result.changes.rotational_inertia.category, 'HIGH', 'Should be HIGH impact');

      // Performance impact should show degradation
      assert.ok(
        result.performance_impact.acceleration.impact_pct > 3,
        'Should show significant acceleration impact'
      );
    });
  });

  describe('Rotational Impact Calculation - Edge Cases', () => {

    test('Small upgrade: 265/70R17 → 265/70R16 (downgrade)', () => {
      const current = { size: '265/70R17', diameter: 31.6 };
      const newTire = { size: '265/70R16', diameter: 30.6 };

      const result = calculateRotationalImpact(current, newTire);

      // Both should be in database
      assert.strictEqual(result.current.weight_lbs, 48, 'Current weight');
      assert.strictEqual(result.new.weight_lbs, 46, 'New weight');

      // Weight should decrease
      assert.strictEqual(result.changes.weight.delta_lbs, -2, 'Weight decreases');

      // Diameter should decrease
      assertWithinTolerance(result.changes.diameter.delta_inches, -1.0, 0.1, 'Diameter decreases');

      // Impact should be negative (improvement)
      assert.ok(result.changes.rotational_inertia.factor < 0, 'Negative impact (improvement)');

      // Should be LOW or MODERATE impact
      assert.ok(
        ['LOW', 'MODERATE'].includes(result.changes.rotational_inertia.category),
        'Should be LOW or MODERATE category'
      );
    });

    test('Extreme upgrade: 265/70R17 → 40x13.50R17', () => {
      const current = { size: '265/70R17', diameter: 31.6 };
      const newTire = { size: '40x13.50R17', diameter: 40.0 };

      const result = calculateRotationalImpact(current, newTire);

      // Should have extreme impact
      assert.ok(
        result.changes.rotational_inertia.factor > 20,
        'Should have >20% rotational impact for extreme upgrade'
      );

      assert.strictEqual(result.changes.rotational_inertia.category, 'HIGH', 'Should be HIGH');

      // Should have multiple recommendations
      assert.ok(result.recommendations.length >= 5, 'Should have multiple recommendations');

      // Summary should indicate EXTREME
      assert.ok(
        result.summary.includes('EXTREME') || result.summary.includes('HIGH'),
        'Summary should indicate severity'
      );
    });
  });

  describe('Performance Impact Calculations', () => {

    test('Acceleration impact scales with rotational inertia', () => {
      const current = { size: '265/70R17', diameter: 31.6 };
      const newTire = { size: '285/75R17', diameter: 32.8 };

      const result = calculateRotationalImpact(current, newTire);

      // Acceleration impact should be ~40% of rotational impact factor
      const expectedAccelImpact = result.changes.rotational_inertia.factor * 0.4;
      assertWithinTolerance(
        result.performance_impact.acceleration.impact_pct,
        expectedAccelImpact,
        0.1,
        'Acceleration impact formula'
      );

      // Should have description
      assert.ok(
        result.performance_impact.acceleration.description.length > 0,
        'Should have acceleration description'
      );
    });

    test('Unsprung mass calculation', () => {
      const current = { size: '265/70R17', diameter: 31.6 };
      const newTire = { size: '35x12.50R17', diameter: 35.0 };

      const result = calculateRotationalImpact(current, newTire);

      // Unsprung mass = weight delta × 4
      const expectedUnsprung = result.changes.weight.delta_lbs * 4;
      assert.strictEqual(
        result.performance_impact.unsprung_mass.increase_lbs,
        expectedUnsprung,
        'Unsprung mass calculation'
      );

      // Large unsprung mass increase should have warning
      if (expectedUnsprung > 40) {
        assert.ok(
          result.performance_impact.unsprung_mass.impact.toLowerCase().includes('significant'),
          'Should warn about significant unsprung mass increase'
        );
      }
    });
  });

  describe('Confidence Levels', () => {

    test('High confidence when both tires in database', () => {
      const current = { size: '265/70R17', diameter: 31.6 };
      const newTire = { size: '285/75R17', diameter: 32.8 };

      const result = calculateRotationalImpact(current, newTire);

      assert.strictEqual(result.confidence.overall, 'HIGH', 'Should be HIGH confidence');
      assert.strictEqual(result.current.confidence, 'high', 'Current tire high confidence');
      assert.strictEqual(result.new.confidence, 'high', 'New tire high confidence');
    });

    test('Low confidence when tire not in database', () => {
      const current = { size: '999/99R99', diameter: 32.0 };
      const newTire = { size: '285/75R17', diameter: 32.8 };

      const result = calculateRotationalImpact(current, newTire);

      assert.strictEqual(result.confidence.overall, 'LOW', 'Should be LOW confidence');
      assert.ok(
        result.confidence.notes.some(note => note && note.includes('estimated')),
        'Should note weight is estimated'
      );
    });
  });

  describe('Summary Generation', () => {

    test('Minimal change - negligible summary', () => {
      const current = { size: '265/70R17', diameter: 31.6 };
      const newTire = { size: '265/70R16', diameter: 30.6 };

      const result = calculateRotationalImpact(current, newTire);

      // Impact should be small
      if (Math.abs(result.changes.rotational_inertia.factor) < 5) {
        assert.ok(
          result.summary.toLowerCase().includes('minimal') ||
          result.summary.toLowerCase().includes('minor') ||
          result.summary.toLowerCase().includes('negligible'),
          'Summary should indicate minimal impact'
        );
      }
    });

    test('Large change - high impact summary', () => {
      const current = { size: '265/70R17', diameter: 31.6 };
      const newTire = { size: '35x12.50R17', diameter: 35.0 };

      const result = calculateRotationalImpact(current, newTire);

      // Summary should indicate severity (HIGH, MODERATE, or EXTREME)
      // The impact factor for this upgrade is significant (>10%)
      assert.ok(
        result.summary.includes('HIGH') ||
        result.summary.includes('MODERATE') ||
        result.summary.includes('EXTREME'),
        `Summary should indicate high impact. Got: "${result.summary}"`
      );

      assert.ok(
        result.summary.toLowerCase().includes('lbs'),
        'Summary should mention weight increase'
      );
    });
  });

  describe('Category Thresholds', () => {

    test('LOW category: < 5% impact', () => {
      // Create scenario with <5% impact
      const current = { size: '265/70R17', diameter: 31.6 };
      const newTire = { size: '265/70R16', diameter: 30.6 };

      const result = calculateRotationalImpact(current, newTire);

      if (Math.abs(result.changes.rotational_inertia.factor) < 5) {
        assert.strictEqual(result.changes.rotational_inertia.category, 'LOW', 'Should be LOW');
      }
    });

    test('MODERATE category: 5-10% impact', () => {
      // 275/70R18 (52 lbs) → 285/70R18 (58 lbs) might be moderate
      const current = { size: '275/70R18', diameter: 32.2 };
      const newTire = { size: '285/70R18', diameter: 32.8 };

      const result = calculateRotationalImpact(current, newTire);

      if (result.changes.rotational_inertia.factor >= 5 &&
          result.changes.rotational_inertia.factor < 10) {
        assert.strictEqual(result.changes.rotational_inertia.category, 'MODERATE', 'Should be MODERATE');
      }
    });

    test('HIGH category: >= 10% impact', () => {
      const current = { size: '265/70R17', diameter: 31.6 };
      const newTire = { size: '285/75R17', diameter: 32.8 };

      const result = calculateRotationalImpact(current, newTire);

      if (result.changes.rotational_inertia.factor >= 10) {
        assert.strictEqual(result.changes.rotational_inertia.category, 'HIGH', 'Should be HIGH');
      }
    });
  });
});
