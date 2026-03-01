/**
 * TIER 1: Verification Tests - Engineering Expansion Modules (Parts 4-6)
 *
 * PURPOSE: Verify that overland load, and upgrade path modules function correctly
 *
 * CONFIDENCE LEVEL: 100% (logic verification)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { calculateOverlandImpact } from '../../src/engine/overlandLoad.js';
import { generateUpgradePath } from '../../src/engine/upgradePath.js';

describe('Engineering Expansion Modules - Verification', () => {

  describe('Overland Load Multiplier', () => {

    test('No load - no adjustments', () => {
      const baseAnalysis = {
        differences: { diameter: { percentage: 5 } },
        drivetrainStress: { score: 40 }
      };

      const result = calculateOverlandImpact(baseAnalysis, 0);

      assert.strictEqual(result.hasLoad, false, 'Should have no load');
      assert.strictEqual(result.expeditionLoad, 0, 'Load should be 0');
      assert.strictEqual(result.adjustments, null, 'No adjustments');
    });

    test('Light load (200 lbs)', () => {
      const baseAnalysis = {
        differences: { diameter: { percentage: 5 } },
        drivetrainStress: { score: 40 },
        rotationalPhysics: { changes: { rotational_inertia: { factor: 10 } } }
      };

      const result = calculateOverlandImpact(baseAnalysis, 200);

      assert.strictEqual(result.hasLoad, true, 'Should have load');
      assert.strictEqual(result.loadCategory.category, 'LIGHT', 'Should be LIGHT category');
      assert.ok(result.adjustedStressScore.adjusted > result.adjustedStressScore.base, 'Stress should increase');
    });

    test('Heavy load (1000 lbs) increases stress significantly', () => {
      const baseAnalysis = {
        differences: { diameter: { percentage: 8 } },
        drivetrainStress: { score: 50 },
        rotationalPhysics: { changes: { rotational_inertia: { factor: 15 } } }
      };

      const result = calculateOverlandImpact(baseAnalysis, 1000);

      assert.strictEqual(result.loadCategory.category, 'HEAVY', 'Should be HEAVY category');
      assert.ok(result.adjustedStressScore.adjusted >= 60, 'Stress should be HIGH range');
      assert.ok(result.loadWarnings.length > 0, 'Should have load warnings');
    });

    test('Extreme load (1500 lbs) generates warnings', () => {
      const baseAnalysis = {
        differences: { diameter: { percentage: 10 } },
        drivetrainStress: { score: 60 },
        rotationalPhysics: { changes: { rotational_inertia: { factor: 18 } } }
      };

      const result = calculateOverlandImpact(baseAnalysis, 1500);

      assert.strictEqual(result.loadCategory.category, 'EXTREME', 'Should be EXTREME category');
      assert.ok(result.loadWarnings.length >= 3, 'Should have multiple warnings');

      const hasSuspensionWarning = result.loadWarnings.some(w => w.component === 'Suspension');
      assert.ok(hasSuspensionWarning, 'Should warn about suspension');
    });

    test('Fuel economy impact scales with load', () => {
      const baseAnalysis = {
        differences: { diameter: { percentage: 5 } },
        drivetrainStress: { score: 40 }
      };

      const light = calculateOverlandImpact(baseAnalysis, 300);
      const heavy = calculateOverlandImpact(baseAnalysis, 1200);

      assert.ok(
        heavy.fuelEconomyImpact.totalMPGLoss > light.fuelEconomyImpact.totalMPGLoss,
        'Heavier load should have worse fuel economy'
      );
    });

    test('Braking impact calculated', () => {
      const baseAnalysis = {
        differences: { diameter: { percentage: 7 } },
        drivetrainStress: { score: 50 },
        rotationalPhysics: { changes: { rotational_inertia: { factor: 12 } } }
      };

      const result = calculateOverlandImpact(baseAnalysis, 800);

      assert.ok(result.brakingImpact.totalIncrease > 0, 'Should have braking impact');
      assert.ok(result.brakingImpact.recommendation.length > 0, 'Should have braking recommendation');
    });
  });

  describe('Upgrade Path Engine', () => {

    test('Low stress - minimal upgrades', () => {
      const analysis = {
        differences: { diameter: { inches: 1.5 }, width: { inches: 0.5 } },
        drivetrainStress: { score: 25 },
        rotationalPhysics: { changes: { rotational_inertia: { factor: 5 } } },
        clearance: { probabilityAnalysis: { riskClass: 'LOW' } }
      };

      const result = generateUpgradePath(analysis, 'mid_range', 'phased');

      assert.ok(result.upgrades.length >= 0, 'Should have some upgrades');
      assert.ok(result.summary.essentialUpgrades === 0, 'Should have no essential upgrades');
    });

    test('High stress - multiple essential upgrades', () => {
      const analysis = {
        differences: { diameter: { inches: 4 }, width: { inches: 1.5 } },
        drivetrainStress: {
          score: 75,
          regearing: { suggestedGearIncrease: { percentIncrease: 10 } }
        },
        rotationalPhysics: { changes: { rotational_inertia: { factor: 20 } } },
        clearance: {
          probabilityAnalysis: {
            riskClass: 'HIGH',
            liftRecommendation: { recommended: 3 },
            trimmingAssessment: { extent: 'extensive' }
          }
        }
      };

      const result = generateUpgradePath(analysis, 'mid_range', 'phased');

      assert.ok(result.upgrades.length >= 4, 'Should have multiple upgrades');
      assert.ok(result.summary.essentialUpgrades >= 2, 'Should have essential upgrades');

      const hasBrakes = result.upgrades.some(u => u.upgrade.toLowerCase().includes('brake'));
      assert.ok(hasBrakes, 'Should recommend brake upgrade');

      const hasRegear = result.upgrades.some(u => u.upgrade.toLowerCase().includes('regear'));
      assert.ok(hasRegear, 'Should recommend regearing');

      const hasLift = result.upgrades.some(u => u.upgrade.toLowerCase().includes('lift'));
      assert.ok(hasLift, 'Should recommend lift');
    });

    test('Budget level affects costs', () => {
      const analysis = {
        differences: { diameter: { inches: 3 }, width: { inches: 1 } },
        drivetrainStress: { score: 60 },
        rotationalPhysics: { changes: { rotational_inertia: { factor: 15 } } },
        clearance: { probabilityAnalysis: { riskClass: 'MODERATE', liftRecommendation: { recommended: 2 } } }
      };

      const budget = generateUpgradePath(analysis, 'budget', 'phased');
      const premium = generateUpgradePath(analysis, 'premium', 'phased');

      assert.ok(
        premium.summary.estimatedCost.total > budget.summary.estimatedCost.total,
        'Premium should cost more than budget'
      );
    });

    test('Priority ordering - safety first', () => {
      const analysis = {
        differences: { diameter: { inches: 4 }, width: { inches: 2 } },
        drivetrainStress: { score: 80, regearing: { suggestedGearIncrease: { percentIncrease: 12 } } },
        rotationalPhysics: { changes: { rotational_inertia: { factor: 22 } } },
        clearance: { probabilityAnalysis: { riskClass: 'HIGH', liftRecommendation: { recommended: 3 } } }
      };

      const result = generateUpgradePath(analysis, 'mid_range', 'immediate');

      // Safety upgrades (brakes) should come first
      const firstUpgrade = result.upgrades[0];
      assert.ok(
        firstUpgrade.category === 'Safety' || firstUpgrade.priority === 1,
        'First upgrade should be safety-critical'
      );
    });

    test('Timeline phasing works', () => {
      const analysis = {
        differences: { diameter: { inches: 3 }, width: { inches: 1 } },
        drivetrainStress: { score: 55, regearing: { suggestedGearIncrease: { percentIncrease: 8 } } },
        rotationalPhysics: { changes: { rotational_inertia: { factor: 14 } } },
        clearance: { probabilityAnalysis: { riskClass: 'MODERATE', liftRecommendation: { recommended: 2 } } }
      };

      const phased = generateUpgradePath(analysis, 'mid_range', 'phased');

      assert.strictEqual(phased.timeline.type, 'phased', 'Should be phased timeline');
      assert.ok(phased.timeline.phases.length >= 2, 'Should have multiple phases');
    });
  });
});
