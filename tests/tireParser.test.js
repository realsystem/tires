/**
 * Tests for Tire Parser
 * Validates P-metric, LT-metric, and Flotation tire size parsing
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { parseTireSize, calculateCircumference, calculateRevolutionsPerMile } from '../src/engine/tireParser.js';

test('Parse P-metric tire size', () => {
  const tire = parseTireSize('265/70R17');

  assert.strictEqual(tire.format, 'P-metric');
  assert.strictEqual(tire.width, 265);
  assert.strictEqual(tire.aspectRatio, 70);
  assert.strictEqual(tire.wheelDiameter, 17);
  assert.strictEqual(tire.isLT, false);

  // Diameter calculation: ((265 * 70 * 2) / 100 / 25.4) + 17 = 31.6 inches
  assert.ok(Math.abs(tire.diameter - 31.6) < 0.1, `Expected diameter ~31.6, got ${tire.diameter}`);
});

test('Parse LT-metric tire size', () => {
  const tire = parseTireSize('LT285/75R16');

  assert.strictEqual(tire.format, 'LT-metric');
  assert.strictEqual(tire.width, 285);
  assert.strictEqual(tire.aspectRatio, 75);
  assert.strictEqual(tire.wheelDiameter, 16);
  assert.strictEqual(tire.isLT, true);

  // Diameter calculation: ((285 * 75 * 2) / 100 / 25.4) + 16 = 32.8 inches
  assert.ok(Math.abs(tire.diameter - 32.8) < 0.1, `Expected diameter ~32.8, got ${tire.diameter}`);
});

test('Parse Flotation tire size - 35x12.50R17', () => {
  const tire = parseTireSize('35x12.50R17');

  assert.strictEqual(tire.format, 'Flotation');
  assert.strictEqual(tire.diameter, 35);
  assert.strictEqual(tire.widthInches, 12.50);
  assert.strictEqual(tire.wheelDiameter, 17);
  assert.strictEqual(tire.isLT, true);

  // Sidewall calculation: (35 - 17) / 2 = 9 inches
  assert.strictEqual(tire.sidewallInches, 9);
});

test('Parse Flotation tire size - 33x10.50R15', () => {
  const tire = parseTireSize('33x10.50R15');

  assert.strictEqual(tire.format, 'Flotation');
  assert.strictEqual(tire.diameter, 33);
  assert.strictEqual(tire.widthInches, 10.50);
  assert.strictEqual(tire.wheelDiameter, 15);
});

test('Parse tire size with P prefix', () => {
  const tire = parseTireSize('P265/70R17');

  assert.strictEqual(tire.format, 'P-metric');
  assert.strictEqual(tire.width, 265);
});

test('Calculate circumference', () => {
  const diameter = 32; // inches
  const circumference = calculateCircumference(diameter);

  // Circumference = π * diameter = 3.14159 * 32 ≈ 100.53 inches
  assert.ok(Math.abs(circumference - 100.53) < 0.1);
});

test('Calculate revolutions per mile', () => {
  const circumference = 100; // inches
  const revs = calculateRevolutionsPerMile(circumference);

  // Revs/mile = 63,360 / 100 = 633.6
  assert.ok(Math.abs(revs - 633.6) < 0.1);
});

test('Invalid tire size throws error', () => {
  assert.throws(() => {
    parseTireSize('invalid');
  });

  assert.throws(() => {
    parseTireSize('');
  });

  assert.throws(() => {
    parseTireSize(null);
  });
});

test('Case insensitive parsing', () => {
  const tire1 = parseTireSize('265/70r17');
  const tire2 = parseTireSize('265/70R17');

  assert.strictEqual(tire1.diameter, tire2.diameter);
});

test('Flotation with dash separator', () => {
  const tire = parseTireSize('33x10.50-15');

  assert.strictEqual(tire.format, 'Flotation');
  assert.strictEqual(tire.diameter, 33);
  assert.strictEqual(tire.wheelDiameter, 15);
});

console.log('✓ All tire parser tests passed');
