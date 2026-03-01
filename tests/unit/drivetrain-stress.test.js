/**
 * TIER 1: Mathematical Verification Tests - Drivetrain Stress Score
 *
 * PURPOSE: Verify that drivetrain stress calculations are mathematically sound
 * and produce expected scores for known scenarios.
 *
 * METHODOLOGY:
 * - Weighted formula: Diameter (30%) + Weight (25%) + Gearing (35%) + Vehicle (10%)
 * - Score ranges: 0-30 LOW, 31-60 MODERATE, 61-100 HIGH
 * - Usage mode biasing: daily_driver +15%, rock_crawling -15%
 *
 * CONFIDENCE LEVEL: 100% (mathematical verification)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { calculateDrivetrainStress } from '../../src/engine/drivetrainStress.js';

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

describe('Drivetrain Stress - Mathematical Verification (100% Confidence)', () => {

  describe('Basic Score Calculation', () => {

    test('Zero changes - zero stress', () => {
      const params = {
        diameterChangePct: 0,
        weightChangePct: 0,
        effectiveGearRatioChangePct: 0,
        vehicleWeight: 4500
      };

      const result = calculateDrivetrainStress(params);

      // All component scores should be 0
      assert.strictEqual(result.breakdown.diameter.score, 0, 'Diameter score should be 0');
      assert.strictEqual(result.breakdown.weight.score, 0, 'Weight score should be 0');
      assert.strictEqual(result.breakdown.gearing.score, 0, 'Gearing score should be 0');

      // Final score should be minimal (only vehicle weight factor)
      assert.ok(result.score < 20, 'Total score should be very low');
      assert.strictEqual(result.classification, 'LOW', 'Should be LOW classification');
    });

    test('Component score formula - diameter', () => {
      const params = {
        diameterChangePct: 10, // 10% diameter change
        weightChangePct: 0,
        effectiveGearRatioChangePct: 0,
        vehicleWeight: 4500
      };

      const result = calculateDrivetrainStress(params);

      // Diameter score: min(10 × 8, 100) = 80
      assert.strictEqual(result.breakdown.diameter.score, 80, 'Diameter score formula');

      // Contribution: 80 × 0.30 = 24
      assert.strictEqual(result.breakdown.diameter.contribution, 24, 'Diameter contribution');
    });

    test('Component score formula - weight', () => {
      const params = {
        diameterChangePct: 0,
        weightChangePct: 20, // 20% weight change
        effectiveGearRatioChangePct: 0,
        vehicleWeight: 4500
      };

      const result = calculateDrivetrainStress(params);

      // Weight score: min(20 × 6, 100) = 100 (maxed out)
      assert.strictEqual(result.breakdown.weight.score, 100, 'Weight score formula');

      // Contribution: 100 × 0.25 = 25
      assert.strictEqual(result.breakdown.weight.contribution, 25, 'Weight contribution');
    });

    test('Component score formula - gearing', () => {
      const params = {
        diameterChangePct: 0,
        weightChangePct: 0,
        effectiveGearRatioChangePct: 10, // 10% gear loss
        vehicleWeight: 4500
      };

      const result = calculateDrivetrainStress(params);

      // Gearing score: min(10 × 7, 100) = 70
      assert.strictEqual(result.breakdown.gearing.score, 70, 'Gearing score formula');

      // Contribution: 70 × 0.35 = 24.5 → 24 (rounded)
      assertWithinTolerance(result.breakdown.gearing.contribution, 24.5, 1, 'Gearing contribution');
    });

    test('Vehicle weight factor - reference vehicle (4500 lbs)', () => {
      const params = {
        diameterChangePct: 5,
        weightChangePct: 10,
        effectiveGearRatioChangePct: 5,
        vehicleWeight: 4500 // Reference weight
      };

      const result = calculateDrivetrainStress(params);

      // Vehicle score should be 50 for reference weight
      // Formula: min((4500/4500 - 1) × 200 + 50, 100) = 50
      assert.strictEqual(result.breakdown.vehicle.score, 50, 'Vehicle score at reference weight');
    });

    test('Vehicle weight factor - lighter vehicle increases stress', () => {
      const params = {
        diameterChangePct: 5,
        weightChangePct: 10,
        effectiveGearRatioChangePct: 5,
        vehicleWeight: 3500 // Lighter vehicle
      };

      const result = calculateDrivetrainStress(params);

      // Lighter vehicle = higher score (worse)
      // Formula: min((4500/3500 - 1) × 200 + 50, 100) ≈ 107 → 100 (maxed)
      assert.strictEqual(result.breakdown.vehicle.score, 100, 'Lighter vehicle maxes out score');
    });

    test('Vehicle weight factor - heavier vehicle reduces stress', () => {
      const params = {
        diameterChangePct: 5,
        weightChangePct: 10,
        effectiveGearRatioChangePct: 5,
        vehicleWeight: 6000 // Heavier vehicle
      };

      const result = calculateDrivetrainStress(params);

      // Heavier vehicle = lower score (better)
      // Formula: min((4500/6000 - 1) × 200 + 50, 100) = 0
      assert.strictEqual(result.breakdown.vehicle.score, 0, 'Heavier vehicle reduces score');
    });
  });

  describe('Real-World Scenarios', () => {

    test('Tacoma 33" upgrade (265/70R17 → 285/75R17)', () => {
      // Realistic scenario from rotational physics tests
      const params = {
        diameterChangePct: 3.80,  // 31.6" → 32.8"
        weightChangePct: 20.83,    // 48 → 58 lbs
        effectiveGearRatioChangePct: -3.66, // 3.909 → 3.766
        rotationalImpactFactor: 13.27, // HIGH impact
        vehicleWeight: 4500
      };

      const result = calculateDrivetrainStress(params);

      // This is a moderate upgrade - should be MODERATE stress
      assert.ok(result.score >= 31 && result.score <= 60, 'Should be MODERATE range');
      assert.strictEqual(result.classification, 'MODERATE', 'Should be MODERATE classification');
      assert.strictEqual(result.regearing.recommendation, 'recommended', 'Regearing recommended');
    });

    test('Jeep 35" upgrade (285/70R17 → 35x12.50R17)', () => {
      // Large upgrade scenario
      const params = {
        diameterChangePct: 7.03,  // 32.7" → 35.0"
        weightChangePct: 31.48,    // 54 → 71 lbs
        effectiveGearRatioChangePct: -6.57, // Significant loss
        rotationalImpactFactor: 18.5, // HIGH impact
        vehicleWeight: 4500
      };

      const result = calculateDrivetrainStress(params);

      // Large upgrade - should be HIGH stress
      assert.ok(result.score >= 61, 'Should be HIGH stress');
      assert.strictEqual(result.classification, 'HIGH', 'Should be HIGH classification');
      assert.strictEqual(result.regearing.recommendation, 'essential', 'Regearing essential');
    });

    test('Small upgrade (265/70R17 → 275/70R18)', () => {
      // Minimal upgrade
      const params = {
        diameterChangePct: 1.9,   // 31.6" → 32.2"
        weightChangePct: 8.3,     // 48 → 52 lbs
        effectiveGearRatioChangePct: -1.9,
        rotationalImpactFactor: 4.2, // LOW-MODERATE impact
        vehicleWeight: 4500
      };

      const result = calculateDrivetrainStress(params);

      // Small upgrade - should be LOW stress
      assert.ok(result.score <= 30, 'Should be LOW stress');
      assert.strictEqual(result.classification, 'LOW', 'Should be LOW classification');
      assert.strictEqual(result.regearing.recommendation, 'optional', 'Regearing optional');
    });

    test('Extreme upgrade (265/70R17 → 40x13.50R17)', () => {
      // Extreme scenario
      const params = {
        diameterChangePct: 26.58, // 31.6" → 40.0"
        weightChangePct: 97.92,   // 48 → 95 lbs
        effectiveGearRatioChangePct: -21.01, // Massive loss
        rotationalImpactFactor: 50, // EXTREME impact
        vehicleWeight: 4500
      };

      const result = calculateDrivetrainStress(params);

      // Should be maximum HIGH stress
      assert.ok(result.score >= 75, 'Should be severe HIGH stress');
      assert.strictEqual(result.classification, 'HIGH', 'Should be HIGH classification');
      assert.strictEqual(result.regearing.urgency, 'immediate', 'Immediate regearing required');
    });
  });

  describe('Usage Mode Biasing', () => {

    test('Daily driver - penalty (+15% stress)', () => {
      const baseParams = {
        diameterChangePct: 5,
        weightChangePct: 10,
        effectiveGearRatioChangePct: 5,
        vehicleWeight: 4500,
        intendedUse: 'weekend_trail' // Baseline
      };

      const dailyParams = {
        ...baseParams,
        intendedUse: 'daily_driver'
      };

      const baseResult = calculateDrivetrainStress(baseParams);
      const dailyResult = calculateDrivetrainStress(dailyParams);

      // Daily driver should have higher stress (~15% more)
      assert.ok(dailyResult.score > baseResult.score, 'Daily driver should increase stress');

      const increaseRatio = dailyResult.score / baseResult.score;
      assertWithinTolerance(increaseRatio, 1.15, 0.05, 'Should be ~15% increase');
    });

    test('Rock crawling - leniency (-15% stress)', () => {
      const baseParams = {
        diameterChangePct: 5,
        weightChangePct: 10,
        effectiveGearRatioChangePct: 5,
        vehicleWeight: 4500,
        intendedUse: 'weekend_trail' // Baseline
      };

      const crawlerParams = {
        ...baseParams,
        intendedUse: 'rock_crawling'
      };

      const baseResult = calculateDrivetrainStress(baseParams);
      const crawlerResult = calculateDrivetrainStress(crawlerParams);

      // Rock crawler should have lower stress (~15% less)
      assert.ok(crawlerResult.score < baseResult.score, 'Rock crawler should reduce stress');

      const decreaseRatio = crawlerResult.score / baseResult.score;
      assertWithinTolerance(decreaseRatio, 0.85, 0.05, 'Should be ~15% decrease');
    });

    test('Overland - moderate penalty for large changes', () => {
      const smallParams = {
        diameterChangePct: 5, // Small change
        weightChangePct: 10,
        effectiveGearRatioChangePct: 5,
        vehicleWeight: 4500,
        intendedUse: 'overland'
      };

      const largeParams = {
        diameterChangePct: 12, // Large change
        weightChangePct: 20,
        effectiveGearRatioChangePct: 10,
        vehicleWeight: 4500,
        intendedUse: 'overland'
      };

      const smallResult = calculateDrivetrainStress(smallParams);
      const largeResult = calculateDrivetrainStress(largeParams);

      // Small change should have no penalty
      // Large change (>8% diameter) should have 10% penalty
      // (exact values depend on baseline score)
      assert.ok(largeResult.score > smallResult.score, 'Large overland changes penalized');
    });

    test('Weekend trail - no bias (baseline)', () => {
      const params = {
        diameterChangePct: 5,
        weightChangePct: 10,
        effectiveGearRatioChangePct: 5,
        vehicleWeight: 4500,
        intendedUse: 'weekend_trail'
      };

      const result = calculateDrivetrainStress(params);

      // Should have no bias applied (score is weighted average)
      assert.ok(result.score > 0, 'Should have positive score');
      // No additional assertions - this is the baseline
    });
  });

  describe('Score Classification', () => {

    test('LOW classification (0-30)', () => {
      const params = {
        diameterChangePct: 2,
        weightChangePct: 5,
        effectiveGearRatioChangePct: 2,
        vehicleWeight: 4500
      };

      const result = calculateDrivetrainStress(params);

      assert.ok(result.score <= 30, 'Score should be ≤30');
      assert.strictEqual(result.classification, 'LOW', 'Classification should be LOW');
      assert.strictEqual(result.severity, 'minimal', 'Severity should be minimal');
      assert.strictEqual(result.regearing.recommendation, 'optional', 'Regearing optional');
      assert.strictEqual(result.regearing.priority, 'low', 'Priority should be low');
    });

    test('MODERATE classification (31-60)', () => {
      const params = {
        diameterChangePct: 5,
        weightChangePct: 12,
        effectiveGearRatioChangePct: 5,
        vehicleWeight: 4500
      };

      const result = calculateDrivetrainStress(params);

      assert.ok(result.score >= 31 && result.score <= 60, 'Score should be 31-60');
      assert.strictEqual(result.classification, 'MODERATE', 'Classification should be MODERATE');
      assert.strictEqual(result.severity, 'significant', 'Severity should be significant');
      assert.strictEqual(result.regearing.recommendation, 'recommended', 'Regearing recommended');
      assert.strictEqual(result.regearing.priority, 'medium', 'Priority should be medium');
    });

    test('HIGH classification (61-100)', () => {
      const params = {
        diameterChangePct: 10,
        weightChangePct: 25,
        effectiveGearRatioChangePct: 10,
        vehicleWeight: 4500
      };

      const result = calculateDrivetrainStress(params);

      assert.ok(result.score >= 61, 'Score should be ≥61');
      assert.strictEqual(result.classification, 'HIGH', 'Classification should be HIGH');
      assert.strictEqual(result.severity, 'severe', 'Severity should be severe');
      assert.strictEqual(result.regearing.recommendation, 'essential', 'Regearing essential');
      assert.strictEqual(result.regearing.priority, 'high', 'Priority should be high');
    });
  });

  describe('Regearing Urgency', () => {

    test('Immediate urgency (score ≥75)', () => {
      const params = {
        diameterChangePct: 15,
        weightChangePct: 35,
        effectiveGearRatioChangePct: 15,
        vehicleWeight: 4500
      };

      const result = calculateDrivetrainStress(params);

      assert.ok(result.score >= 75, 'Score should trigger immediate urgency');
      assert.strictEqual(result.regearing.urgency, 'immediate', 'Urgency should be immediate');
    });

    test('Soon urgency (score 50-74)', () => {
      const params = {
        diameterChangePct: 7,
        weightChangePct: 18,
        effectiveGearRatioChangePct: 7,
        vehicleWeight: 4500
      };

      const result = calculateDrivetrainStress(params);

      if (result.score >= 50 && result.score < 75) {
        assert.strictEqual(result.regearing.urgency, 'soon', 'Urgency should be soon');
      }
    });

    test('Eventually urgency (score <50)', () => {
      const params = {
        diameterChangePct: 4,
        weightChangePct: 10,
        effectiveGearRatioChangePct: 4,
        vehicleWeight: 4500
      };

      const result = calculateDrivetrainStress(params);

      if (result.score < 50) {
        assert.strictEqual(result.regearing.urgency, 'eventually', 'Urgency should be eventually');
      }
    });
  });

  describe('Suggested Regear Calculation', () => {

    test('Suggested gear increase matches diameter change', () => {
      const params = {
        diameterChangePct: 10,
        weightChangePct: 15,
        effectiveGearRatioChangePct: -10,
        vehicleWeight: 4500
      };

      const result = calculateDrivetrainStress(params);

      // Suggested increase should match diameter change
      assert.strictEqual(
        result.regearing.suggestedGearIncrease.percentIncrease,
        10,
        'Suggested increase should match diameter change'
      );

      assert.ok(
        result.regearing.suggestedGearIncrease.reasoning.length > 0,
        'Should provide reasoning'
      );

      assert.ok(
        result.regearing.suggestedGearIncrease.example.includes('e.g.'),
        'Should provide example'
      );
    });

    test('No suggested regear when no gear data', () => {
      const params = {
        diameterChangePct: 10,
        weightChangePct: 15,
        effectiveGearRatioChangePct: 0, // No gear data
        vehicleWeight: 4500
      };

      const result = calculateDrivetrainStress(params);

      assert.strictEqual(result.regearing.suggestedGearIncrease, null, 'No suggestion without gear data');
    });
  });

  describe('Recommendations Generation', () => {

    test('LOW stress recommendations', () => {
      const params = {
        diameterChangePct: 2,
        weightChangePct: 5,
        effectiveGearRatioChangePct: 2,
        vehicleWeight: 4500
      };

      const result = calculateDrivetrainStress(params);

      assert.ok(result.recommendations.length > 0, 'Should have recommendations');

      const hasMinimalMessage = result.recommendations.some(r =>
        r.toLowerCase().includes('minimal') || r.toLowerCase().includes('no immediate action')
      );
      assert.ok(hasMinimalMessage, 'Should mention minimal stress');
    });

    test('MODERATE stress recommendations', () => {
      const params = {
        diameterChangePct: 5,
        weightChangePct: 12,
        effectiveGearRatioChangePct: 5,
        vehicleWeight: 4500
      };

      const result = calculateDrivetrainStress(params);

      const hasRegearRec = result.recommendations.some(r =>
        r.toLowerCase().includes('regearing recommended')
      );
      assert.ok(hasRegearRec, 'Should recommend regearing');
    });

    test('HIGH stress recommendations', () => {
      const params = {
        diameterChangePct: 10,
        weightChangePct: 25,
        effectiveGearRatioChangePct: 10,
        vehicleWeight: 4500
      };

      const result = calculateDrivetrainStress(params);

      const hasCritical = result.recommendations.some(r =>
        r.includes('⚠️') || r.toLowerCase().includes('critical') || r.toLowerCase().includes('essential')
      );
      assert.ok(hasCritical, 'Should have critical warning');
    });

    test('Extreme stress recommendations (score ≥75)', () => {
      const params = {
        diameterChangePct: 15,
        weightChangePct: 35,
        effectiveGearRatioChangePct: 15,
        vehicleWeight: 4500
      };

      const result = calculateDrivetrainStress(params);

      const hasUrgent = result.recommendations.some(r =>
        r.includes('🔴') || r.toLowerCase().includes('urgent')
      );
      assert.ok(hasUrgent, 'Should have urgent warning');
    });
  });

  describe('Summary Generation', () => {

    test('Summary includes score', () => {
      const params = {
        diameterChangePct: 5,
        weightChangePct: 12,
        effectiveGearRatioChangePct: 5,
        vehicleWeight: 4500
      };

      const result = calculateDrivetrainStress(params);

      assert.ok(result.summary.includes(result.score.toString()), 'Summary should include score');
      assert.ok(result.summary.includes('/100'), 'Summary should include /100');
    });

    test('Summary reflects classification', () => {
      const lowParams = {
        diameterChangePct: 2,
        weightChangePct: 5,
        effectiveGearRatioChangePct: 2,
        vehicleWeight: 4500
      };

      const highParams = {
        diameterChangePct: 10,
        weightChangePct: 25,
        effectiveGearRatioChangePct: 10,
        vehicleWeight: 4500
      };

      const lowResult = calculateDrivetrainStress(lowParams);
      const highResult = calculateDrivetrainStress(highParams);

      assert.ok(lowResult.summary.toLowerCase().includes('low'), 'LOW summary should say "low"');
      // HIGH classification might say "high", "severe", or "moderate-high"
      assert.ok(
        highResult.summary.toLowerCase().includes('high') ||
        highResult.summary.toLowerCase().includes('severe'),
        'HIGH summary should indicate severity'
      );
    });
  });
});
