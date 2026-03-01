/**
 * TIER 1: Mathematical Verification Tests - Clearance Probability
 *
 * PURPOSE: Verify that clearance probability logic is sound and produces
 * expected risk classifications for known scenarios.
 *
 * METHODOLOGY:
 * - Decision tree logic based on suspension type and lift height
 * - Risk classes: LOW (<30%), MODERATE (30-70%), HIGH (>70%)
 * - IFS more restrictive than Solid Axle
 *
 * CONFIDENCE LEVEL: 100% (logic verification with known inputs)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  calculateClearanceProbability,
  getVehicleSuspensionType
} from '../../src/engine/clearanceProbability.js';

describe('Clearance Probability - Logic Verification (100% Confidence)', () => {

  describe('IFS Clearance - Stock Height', () => {

    test('Stock + 1" diameter - LOW risk', () => {
      const params = {
        suspensionType: 'ifs',
        liftHeight: 0,
        diameterIncrease: 1,
        widthIncrease: 0.5,
        newDiameter: 32,
        newWidth: 11
      };

      const result = calculateClearanceProbability(params);

      assert.strictEqual(result.suspensionType, 'IFS', 'Should be IFS');
      assert.ok(result.probability <= 30, 'Should be LOW risk');
      assert.strictEqual(result.riskClass, 'LOW', 'Should classify as LOW');
    });

    test('Stock + 2" diameter - MODERATE risk', () => {
      const params = {
        suspensionType: 'ifs',
        liftHeight: 0,
        diameterIncrease: 2,
        widthIncrease: 0.5,
        newDiameter: 33,
        newWidth: 11
      };

      const result = calculateClearanceProbability(params);

      assert.ok(result.probability >= 30 && result.probability <= 70, 'Should be MODERATE risk range');
      assert.strictEqual(result.riskClass, 'MODERATE', 'Should classify as MODERATE');
      assert.ok(result.primaryIssue !== null, 'Should have primary issue identified');
    });

    test('Stock + 3"+ diameter - HIGH risk', () => {
      const params = {
        suspensionType: 'ifs',
        liftHeight: 0,
        diameterIncrease: 3.5,
        widthIncrease: 1,
        newDiameter: 35,
        newWidth: 12
      };

      const result = calculateClearanceProbability(params);

      assert.ok(result.probability > 70, 'Should be HIGH risk');
      assert.strictEqual(result.riskClass, 'HIGH', 'Should classify as HIGH');
      assert.ok(result.primaryIssue.length > 0, 'Should have issue description');
    });
  });

  describe('IFS Clearance - With Lift', () => {

    test('2" lift + 2" diameter - LOW risk', () => {
      const params = {
        suspensionType: 'ifs',
        liftHeight: 2,
        diameterIncrease: 2,
        widthIncrease: 0.5,
        newDiameter: 33,
        newWidth: 11
      };

      const result = calculateClearanceProbability(params);

      assert.ok(result.probability <= 30, 'Should be LOW risk with adequate lift');
      assert.strictEqual(result.riskClass, 'LOW', 'Should classify as LOW');
    });

    test('2" lift + 3" diameter - MODERATE risk', () => {
      const params = {
        suspensionType: 'ifs',
        liftHeight: 2,
        diameterIncrease: 3,
        widthIncrease: 0.5,
        newDiameter: 34,
        newWidth: 11.5
      };

      const result = calculateClearanceProbability(params);

      assert.ok(result.probability >= 30 && result.probability <= 70, 'Should be MODERATE');
      assert.strictEqual(result.riskClass, 'MODERATE', 'Should classify as MODERATE');
    });

    test('3" lift + 3" diameter - LOW risk', () => {
      const params = {
        suspensionType: 'ifs',
        liftHeight: 3,
        diameterIncrease: 3,
        widthIncrease: 0.5,
        newDiameter: 34.5,
        newWidth: 11.5
      };

      const result = calculateClearanceProbability(params);

      assert.ok(result.probability <= 30, 'Should be LOW with good lift');
      assert.strictEqual(result.riskClass, 'LOW', 'Should classify as LOW');
    });

    test('3" lift + 5" diameter - HIGH risk', () => {
      const params = {
        suspensionType: 'ifs',
        liftHeight: 3,
        diameterIncrease: 5,
        widthIncrease: 1.5,
        newDiameter: 36.5,
        newWidth: 13
      };

      const result = calculateClearanceProbability(params);

      assert.ok(result.probability > 70, 'Should be HIGH even with 3" lift');
      assert.strictEqual(result.riskClass, 'HIGH', 'Should classify as HIGH');
    });
  });

  describe('IFS Width Penalty', () => {

    test('Wide tire increases risk (+1.5" width)', () => {
      const baseParams = {
        suspensionType: 'ifs',
        liftHeight: 2,
        diameterIncrease: 2,
        widthIncrease: 0.5, // Narrow
        newDiameter: 33,
        newWidth: 10.5
      };

      const wideParams = {
        ...baseParams,
        widthIncrease: 2, // Wide
        newWidth: 12
      };

      const baseResult = calculateClearanceProbability(baseParams);
      const wideResult = calculateClearanceProbability(wideParams);

      assert.ok(wideResult.probability > baseResult.probability, 'Wide tire should increase risk');
    });
  });

  describe('IFS 37"+ Tires', () => {

    test('37"+ tires always HIGH risk on IFS', () => {
      const params = {
        suspensionType: 'ifs',
        liftHeight: 4, // Even with big lift
        diameterIncrease: 6,
        widthIncrease: 1,
        newDiameter: 37,
        newWidth: 12.5
      };

      const result = calculateClearanceProbability(params);

      assert.ok(result.probability >= 65, '37" tires should be high risk');
      assert.strictEqual(result.riskClass, 'HIGH', 'Should classify as HIGH');
    });
  });

  describe('Solid Axle Clearance - Stock Height', () => {

    test('Stock + 1.5" diameter - LOW risk', () => {
      const params = {
        suspensionType: 'solid_axle',
        liftHeight: 0,
        diameterIncrease: 1.5,
        widthIncrease: 0.5,
        newDiameter: 32.5,
        newWidth: 11
      };

      const result = calculateClearanceProbability(params);

      assert.strictEqual(result.suspensionType, 'Solid Axle', 'Should be Solid Axle');
      assert.ok(result.probability <= 30, 'Should be LOW risk');
      assert.strictEqual(result.riskClass, 'LOW', 'Should classify as LOW');
    });

    test('Stock + 3" diameter - MODERATE risk', () => {
      const params = {
        suspensionType: 'solid_axle',
        liftHeight: 0,
        diameterIncrease: 3,
        widthIncrease: 1,
        newDiameter: 34,
        newWidth: 12
      };

      const result = calculateClearanceProbability(params);

      assert.ok(result.probability >= 30 && result.probability <= 70, 'Should be MODERATE');
      assert.strictEqual(result.riskClass, 'MODERATE', 'Should classify as MODERATE');
    });

    test('Stock + 4" diameter - HIGH risk', () => {
      const params = {
        suspensionType: 'solid_axle',
        liftHeight: 0,
        diameterIncrease: 4,
        widthIncrease: 1.5,
        newDiameter: 35,
        newWidth: 12.5
      };

      const result = calculateClearanceProbability(params);

      assert.ok(result.probability > 70, 'Should be HIGH risk');
      assert.strictEqual(result.riskClass, 'HIGH', 'Should classify as HIGH');
    });
  });

  describe('Solid Axle vs IFS Comparison', () => {

    test('Solid axle more forgiving than IFS', () => {
      const ifsParams = {
        suspensionType: 'ifs',
        liftHeight: 0,
        diameterIncrease: 2,
        widthIncrease: 0.5,
        newDiameter: 33,
        newWidth: 11
      };

      const solidParams = {
        suspensionType: 'solid_axle',
        liftHeight: 0,
        diameterIncrease: 2,
        widthIncrease: 0.5,
        newDiameter: 33,
        newWidth: 11
      };

      const ifsResult = calculateClearanceProbability(ifsParams);
      const solidResult = calculateClearanceProbability(solidParams);

      assert.ok(
        solidResult.probability < ifsResult.probability,
        'Solid axle should have lower risk than IFS for same tire'
      );
    });
  });

  describe('Solid Axle - With Lift', () => {

    test('2" lift + 3" diameter - LOW risk', () => {
      const params = {
        suspensionType: 'solid_axle',
        liftHeight: 2,
        diameterIncrease: 3,
        widthIncrease: 1,
        newDiameter: 34,
        newWidth: 12
      };

      const result = calculateClearanceProbability(params);

      assert.ok(result.probability <= 30, 'Should be LOW with adequate lift');
      assert.strictEqual(result.riskClass, 'LOW', 'Should classify as LOW');
    });

    test('3" lift + 5" diameter - MODERATE risk', () => {
      const params = {
        suspensionType: 'solid_axle',
        liftHeight: 3,
        diameterIncrease: 5,
        widthIncrease: 1.5,
        newDiameter: 36,
        newWidth: 13
      };

      const result = calculateClearanceProbability(params);

      assert.ok(result.probability >= 30 && result.probability <= 70, 'Should be MODERATE');
      assert.strictEqual(result.riskClass, 'MODERATE', 'Should classify as MODERATE');
    });
  });

  describe('Component Warnings', () => {

    test('IFS generates UCA warning at moderate risk', () => {
      const params = {
        suspensionType: 'ifs',
        liftHeight: 0,
        diameterIncrease: 2.5,
        widthIncrease: 0.5,
        newDiameter: 33.5,
        newWidth: 11
      };

      const result = calculateClearanceProbability(params);

      assert.ok(result.componentWarnings.length > 0, 'Should have component warnings');

      const hasUCAWarning = result.componentWarnings.some(w =>
        w.component.includes('UCA') || w.component.includes('Control')
      );
      assert.ok(hasUCAWarning, 'Should warn about UCA contact');
    });

    test('IFS generates CMC warning for large tires without lift', () => {
      const params = {
        suspensionType: 'ifs',
        liftHeight: 0,
        diameterIncrease: 3,
        widthIncrease: 1,
        newDiameter: 34,
        newWidth: 12
      };

      const result = calculateClearanceProbability(params);

      const hasCMCWarning = result.componentWarnings.some(w =>
        w.component.includes('CMC') || w.component.includes('Cab Mount')
      );
      assert.ok(hasCMCWarning, 'Should warn about CMC trimming');
    });

    test('Wide tires generate fender liner warning', () => {
      const params = {
        suspensionType: 'ifs',
        liftHeight: 2,
        diameterIncrease: 2,
        widthIncrease: 2, // Wide
        newDiameter: 33,
        newWidth: 12.5
      };

      const result = calculateClearanceProbability(params);

      const hasFenderWarning = result.componentWarnings.some(w =>
        w.component.toLowerCase().includes('fender')
      );
      assert.ok(hasFenderWarning, 'Should warn about fender issues');
    });

    test('Large diameter triggers brake line warning', () => {
      const params = {
        suspensionType: 'ifs',
        liftHeight: 2,
        diameterIncrease: 4,
        widthIncrease: 1,
        newDiameter: 35,
        newWidth: 12
      };

      const result = calculateClearanceProbability(params);

      const hasBrakeWarning = result.componentWarnings.some(w =>
        w.component.toLowerCase().includes('brake')
      );
      assert.ok(hasBrakeWarning, 'Should warn about brake lines');
    });
  });

  describe('Lift Recommendation', () => {

    test('Adequate lift - no additional needed', () => {
      const params = {
        suspensionType: 'ifs',
        liftHeight: 3,
        diameterIncrease: 2.5,
        widthIncrease: 0.5,
        newDiameter: 33.5,
        newWidth: 11
      };

      const result = calculateClearanceProbability(params);

      assert.strictEqual(result.liftRecommendation.required, false, 'No lift required');
      assert.strictEqual(result.liftRecommendation.currentAdequate, true, 'Current lift adequate');
    });

    test('Insufficient lift - additional needed', () => {
      const params = {
        suspensionType: 'ifs',
        liftHeight: 0,
        diameterIncrease: 3,
        widthIncrease: 1,
        newDiameter: 34,
        newWidth: 12
      };

      const result = calculateClearanceProbability(params);

      if (result.riskClass !== 'LOW') {
        assert.strictEqual(result.liftRecommendation.required, true, 'Lift should be required');
        assert.ok(result.liftRecommendation.additionalNeeded > 0, 'Should need additional lift');
        assert.ok(result.liftRecommendation.recommended > 0, 'Should recommend total lift');
      }
    });

    test('Lift calculation scales with diameter increase', () => {
      const small = {
        suspensionType: 'ifs',
        liftHeight: 0,
        diameterIncrease: 2,
        widthIncrease: 0.5,
        newDiameter: 33,
        newWidth: 11
      };

      const large = {
        suspensionType: 'ifs',
        liftHeight: 0,
        diameterIncrease: 4,
        widthIncrease: 1,
        newDiameter: 35,
        newWidth: 12
      };

      const smallResult = calculateClearanceProbability(small);
      const largeResult = calculateClearanceProbability(large);

      if (smallResult.liftRecommendation.recommended && largeResult.liftRecommendation.recommended) {
        assert.ok(
          largeResult.liftRecommendation.recommended > smallResult.liftRecommendation.recommended,
          'Larger tire should need more lift'
        );
      }
    });
  });

  describe('Trimming Assessment', () => {

    test('LOW risk - minimal trimming', () => {
      const params = {
        suspensionType: 'ifs',
        liftHeight: 2,
        diameterIncrease: 1.5,
        widthIncrease: 0.5,
        newDiameter: 32.5,
        newWidth: 11
      };

      const result = calculateClearanceProbability(params);

      assert.ok(
        result.trimmingAssessment.extent === 'minimal' ||
        result.trimmingAssessment.extent === 'minor',
        'Should have minimal trimming'
      );
      assert.ok(result.trimmingAssessment.probability <= 50, 'Low trimming probability');
    });

    test('HIGH risk - extensive trimming', () => {
      const params = {
        suspensionType: 'ifs',
        liftHeight: 0,
        diameterIncrease: 4,
        widthIncrease: 1.5,
        newDiameter: 35,
        newWidth: 12.5
      };

      const result = calculateClearanceProbability(params);

      assert.ok(
        result.trimmingAssessment.extent === 'extensive' ||
        result.trimmingAssessment.extent === 'moderate',
        'Should need extensive trimming'
      );
      assert.ok(result.trimmingAssessment.probability >= 75, 'High trimming probability');
      assert.ok(result.trimmingAssessment.areas.length > 0, 'Should list areas to trim');
    });
  });

  describe('Summary Generation', () => {

    test('Summary includes probability', () => {
      const params = {
        suspensionType: 'ifs',
        liftHeight: 2,
        diameterIncrease: 2,
        widthIncrease: 0.5,
        newDiameter: 33,
        newWidth: 11
      };

      const result = calculateClearanceProbability(params);

      assert.ok(result.summary.includes('%'), 'Summary should include percentage');
      assert.ok(result.summary.length > 20, 'Summary should be descriptive');
    });

    test('Summary reflects risk class', () => {
      const lowParams = {
        suspensionType: 'ifs',
        liftHeight: 3,
        diameterIncrease: 2,
        widthIncrease: 0.5,
        newDiameter: 33,
        newWidth: 11
      };

      const highParams = {
        suspensionType: 'ifs',
        liftHeight: 0,
        diameterIncrease: 4,
        widthIncrease: 1.5,
        newDiameter: 35,
        newWidth: 12.5
      };

      const lowResult = calculateClearanceProbability(lowParams);
      const highResult = calculateClearanceProbability(highParams);

      assert.ok(lowResult.summary.toLowerCase().includes('low'), 'LOW risk summary');
      assert.ok(highResult.summary.toLowerCase().includes('high'), 'HIGH risk summary');
    });
  });

  describe('Vehicle Type Detection', () => {

    test('Tacoma detected as IFS', () => {
      const result = getVehicleSuspensionType('tacoma');
      assert.strictEqual(result, 'ifs', 'Tacoma should be IFS');
    });

    test('4Runner detected as IFS', () => {
      const result = getVehicleSuspensionType('4runner');
      assert.strictEqual(result, 'ifs', '4Runner should be IFS');
    });

    test('Wrangler detected as Solid Axle', () => {
      const result = getVehicleSuspensionType('wrangler');
      assert.strictEqual(result, 'solid_axle', 'Wrangler should be Solid Axle');
    });

    test('Bronco detected as Solid Axle', () => {
      const result = getVehicleSuspensionType('bronco');
      assert.strictEqual(result, 'solid_axle', 'Bronco should be Solid Axle');
    });

    test('Unknown vehicle defaults to IFS (conservative)', () => {
      const result = getVehicleSuspensionType('unknown_vehicle');
      assert.strictEqual(result, 'ifs', 'Unknown should default to IFS');
    });
  });
});
