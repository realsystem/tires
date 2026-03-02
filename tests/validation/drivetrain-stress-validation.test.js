/**
 * DRIVETRAIN STRESS VALIDATION TEST
 *
 * PURPOSE: Validate that DrivetrainStress calculation works for ALL tire size changes
 * and shows realistic stress scores
 *
 * USER REPORT:
 * - 1.2" diameter change shows 43/100 (MODERATE) - ✓ Shows
 * - 6" diameter change doesn't show at all - ✗ BUG
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { calculateTireComparison } from '../../src/engine/tireCalculator.js';

describe('DrivetrainStress - Visibility Across All Upgrades', () => {

  test('Small upgrade (1.2" diameter) - Should show MODERATE stress', () => {
    const current = { size: '265/70R17', diameter: 31.6 };
    const newTire = { size: '285/75R17', diameter: 32.8 };
    const drivetrain = {
      axleGearRatio: 3.909,
      transferCaseRatio: 2.566,
      transmissionFirstGear: 3.927,
      vehicleWeight: 4500
    };

    const result = calculateTireComparison(current, newTire, drivetrain, {}, 'weekend_trail');

    console.log('\n=== 1.2" UPGRADE TEST ===');
    console.log('Diameter change:', (newTire.diameter - current.diameter).toFixed(1) + '"');
    console.log('DrivetrainImpact exists?', !!result.drivetrainImpact);
    console.log('DrivetrainStress exists?', !!result.drivetrainStress);

    if (result.drivetrainStress) {
      console.log('✓ Stress Score:', result.drivetrainStress.score + '/100');
      console.log('✓ Classification:', result.drivetrainStress.classification);
    } else {
      console.log('✗ ERROR: DrivetrainStress is NULL');
    }

    assert.ok(result.drivetrainStress, 'DrivetrainStress MUST exist for 1.2" upgrade');
    assert.ok(result.drivetrainStress.score >= 30 && result.drivetrainStress.score <= 60,
      `Expected MODERATE (30-60), got ${result.drivetrainStress.score}`);
  });

  test('Medium upgrade (2.3" diameter) - Should show HIGH stress', () => {
    const current = { size: '285/70R17', diameter: 32.7 };
    const newTire = { size: '35x12.50R17', diameter: 35.0 };
    const drivetrain = {
      axleGearRatio: 4.10,
      transferCaseRatio: 2.72,
      transmissionFirstGear: 4.71,
      vehicleWeight: 4500
    };

    const result = calculateTireComparison(current, newTire, drivetrain, {}, 'daily_driver');

    console.log('\n=== 2.3" UPGRADE TEST ===');
    console.log('Diameter change:', (newTire.diameter - current.diameter).toFixed(1) + '"');
    console.log('DrivetrainImpact exists?', !!result.drivetrainImpact);
    console.log('DrivetrainStress exists?', !!result.drivetrainStress);

    if (result.drivetrainStress) {
      console.log('✓ Stress Score:', result.drivetrainStress.score + '/100');
      console.log('✓ Classification:', result.drivetrainStress.classification);
    } else {
      console.log('✗ ERROR: DrivetrainStress is NULL');
    }

    assert.ok(result.drivetrainStress, 'DrivetrainStress MUST exist for 2.3" upgrade');
    assert.ok(result.drivetrainStress.score >= 55,
      `Expected HIGH (>55), got ${result.drivetrainStress.score}`);
  });

  test('Large upgrade (5.4" diameter) - Should show CRITICAL stress', () => {
    const current = { size: '265/70R17', diameter: 31.6 };
    const newTire = { size: '37x12.50R17', diameter: 37.0 };
    const drivetrain = {
      axleGearRatio: 4.30,
      transferCaseRatio: 2.566,
      transmissionFirstGear: 3.927,
      vehicleWeight: 5000
    };

    const result = calculateTireComparison(current, newTire, drivetrain, {}, 'overland');

    console.log('\n=== 5.4" UPGRADE TEST (USER REPORTED BUG) ===');
    console.log('Diameter change:', (newTire.diameter - current.diameter).toFixed(1) + '"');
    console.log('DrivetrainImpact exists?', !!result.drivetrainImpact);

    if (result.drivetrainImpact) {
      console.log('✓ Effective Gear Ratio Change:', result.drivetrainImpact.effectiveGearRatio.changePercentage.toFixed(1) + '%');
    }

    console.log('DrivetrainStress exists?', !!result.drivetrainStress);

    if (result.drivetrainStress) {
      console.log('✓ Stress Score:', result.drivetrainStress.score + '/100');
      console.log('✓ Classification:', result.drivetrainStress.classification);
      console.log('✓ Regearing:', result.drivetrainStress.regearing.recommendation);
    } else {
      console.log('✗ ERROR: DrivetrainStress is NULL - THIS IS THE BUG!');
      console.log('RotationalPhysics exists?', !!result.rotationalPhysics);
      if (result.rotationalPhysics) {
        console.log('Rotational Impact:', result.rotationalPhysics.changes.rotational_inertia.factor.toFixed(1) + '%');
      }
    }

    assert.ok(result.drivetrainStress, 'DrivetrainStress MUST exist for 5.4" upgrade - THIS IS THE BUG');
    assert.ok(result.drivetrainStress.score >= 70,
      `Expected CRITICAL (>70), got ${result.drivetrainStress.score}`);
  });

  test('Extreme upgrade (10.4" diameter) - Should show MAXIMUM stress', () => {
    const current = { size: '265/70R17', diameter: 31.6 };
    const newTire = { size: '42x14.50R20', diameter: 42.0 };
    const drivetrain = {
      axleGearRatio: 3.73,
      transferCaseRatio: 2.566,
      transmissionFirstGear: 3.927,
      vehicleWeight: 4500
    };

    const result = calculateTireComparison(current, newTire, drivetrain, {}, 'daily_driver');

    console.log('\n=== 10.4" EXTREME UPGRADE TEST ===');
    console.log('Diameter change:', (newTire.diameter - current.diameter).toFixed(1) + '"');
    console.log('DrivetrainStress exists?', !!result.drivetrainStress);

    if (result.drivetrainStress) {
      console.log('✓ Stress Score:', result.drivetrainStress.score + '/100');
      assert.ok(result.drivetrainStress.score >= 85, 'Should show near-maximum stress');
    } else {
      console.log('✗ ERROR: DrivetrainStress is NULL for extreme upgrade');
    }

    assert.ok(result.drivetrainStress, 'DrivetrainStress MUST exist even for extreme upgrades');
  });

  test('No gear ratio provided - DrivetrainStress should be NULL', () => {
    const current = { size: '265/70R17', diameter: 31.6 };
    const newTire = { size: '285/75R17', diameter: 32.8 };
    const drivetrain = null; // No drivetrain data

    const result = calculateTireComparison(current, newTire, drivetrain, {}, 'weekend_trail');

    console.log('\n=== NO GEAR RATIO TEST ===');
    console.log('DrivetrainImpact exists?', !!result.drivetrainImpact);
    console.log('DrivetrainStress exists?', !!result.drivetrainStress);

    assert.strictEqual(result.drivetrainImpact, null, 'DrivetrainImpact should be null without gear ratio');
    assert.strictEqual(result.drivetrainStress, null, 'DrivetrainStress should be null without gear ratio');
  });
});

describe('DrivetrainStress - Realistic Score Validation', () => {

  test('Real-world scenario: Tacoma 33" upgrade should be MODERATE', () => {
    // Forum consensus: Most people run this without regearing initially
    // Stress should be MODERATE (30-60), not HIGH
    const current = { size: '265/70R17', diameter: 31.6 };
    const newTire = { size: '285/75R17', diameter: 32.8 };
    const drivetrain = {
      axleGearRatio: 3.909,
      vehicleWeight: 4500
    };

    const result = calculateTireComparison(current, newTire, drivetrain, {}, 'weekend_trail');

    console.log('\n=== TACOMA 33" REAL-WORLD VALIDATION ===');
    console.log('Stress Score:', result.drivetrainStress?.score);
    console.log('Classification:', result.drivetrainStress?.classification);
    console.log('Regearing:', result.drivetrainStress?.regearing.recommendation);

    // Real-world: Most run this without regearing, especially for off-road use
    assert.ok(result.drivetrainStress.score >= 30 && result.drivetrainStress.score <= 60,
      'Tacoma 33" upgrade should be MODERATE stress');
    assert.strictEqual(result.drivetrainStress.classification, 'MODERATE',
      'Should classify as MODERATE');
  });

  test('Real-world scenario: Jeep 35" upgrade should be HIGH', () => {
    // Forum consensus: Most people regear, especially for daily driving
    // Stress should be HIGH (60-100)
    const current = { size: '285/70R17', diameter: 32.7 };
    const newTire = { size: '35x12.50R17', diameter: 35.0 };
    const drivetrain = {
      axleGearRatio: 4.10,
      vehicleWeight: 4500
    };

    const result = calculateTireComparison(current, newTire, drivetrain, {}, 'daily_driver');

    console.log('\n=== JEEP 35" REAL-WORLD VALIDATION ===');
    console.log('Stress Score:', result.drivetrainStress?.score);
    console.log('Classification:', result.drivetrainStress?.classification);
    console.log('Regearing:', result.drivetrainStress?.regearing.recommendation);

    // Real-world: Most regear for daily driving
    assert.ok(result.drivetrainStress.score >= 60,
      'Jeep 35" upgrade with daily driving should be HIGH stress');
    assert.strictEqual(result.drivetrainStress.classification, 'HIGH',
      'Should classify as HIGH');
  });

  test('Stress score increases with diameter change', () => {
    const current = { size: '265/70R17', diameter: 31.6 };
    const drivetrain = {
      axleGearRatio: 3.909,
      vehicleWeight: 4500
    };

    // Test three progressively larger upgrades
    const upgrades = [
      { size: '275/70R17', diameter: 32.2, name: 'Small (0.6")' },
      { size: '285/75R17', diameter: 32.8, name: 'Medium (1.2")' },
      { size: '35x12.50R17', diameter: 35.0, name: 'Large (3.4")' }
    ];

    const scores = [];

    console.log('\n=== STRESS SCORE PROGRESSION ===');
    for (const upgrade of upgrades) {
      const result = calculateTireComparison(current, upgrade, drivetrain, {}, 'weekend_trail');
      const score = result.drivetrainStress?.score || 0;
      scores.push(score);
      console.log(`${upgrade.name}: ${score}/100`);
    }

    // Scores should increase monotonically
    assert.ok(scores[1] > scores[0], '1.2" should have higher stress than 0.6"');
    assert.ok(scores[2] > scores[1], '3.4" should have higher stress than 1.2"');
  });
});
