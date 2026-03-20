// tests/unit/game.test.js
import { calculateScore, calculateLevel, calculateGravityInterval } from '../../src/game.js';

describe('calculateScore', () => {
  test('1 line × level 1 = 100', () => {
    expect(calculateScore(1, 1)).toBe(100);
  });

  test('2 lines × level 1 = 300', () => {
    expect(calculateScore(2, 1)).toBe(300);
  });

  test('3 lines × level 1 = 500', () => {
    expect(calculateScore(3, 1)).toBe(500);
  });

  test('4 lines × level 1 = 800', () => {
    expect(calculateScore(4, 1)).toBe(800);
  });

  test('1 line × level 3 = 300', () => {
    expect(calculateScore(1, 3)).toBe(300);
  });

  test('2 lines × level 3 = 900', () => {
    expect(calculateScore(2, 3)).toBe(900);
  });

  test('3 lines × level 3 = 1500', () => {
    expect(calculateScore(3, 3)).toBe(1500);
  });

  test('4 lines × level 3 = 2400', () => {
    expect(calculateScore(4, 3)).toBe(2400);
  });

  test('0 lines = 0', () => {
    expect(calculateScore(0, 5)).toBe(0);
  });
});

describe('calculateLevel', () => {
  test('0 lines → level 1', () => {
    expect(calculateLevel(0)).toBe(1);
  });

  test('9 lines → level 1', () => {
    expect(calculateLevel(9)).toBe(1);
  });

  test('10 lines → level 2', () => {
    expect(calculateLevel(10)).toBe(2);
  });

  test('19 lines → level 2', () => {
    expect(calculateLevel(19)).toBe(2);
  });

  test('20 lines → level 3', () => {
    expect(calculateLevel(20)).toBe(3);
  });

  test('99 lines → level 10', () => {
    expect(calculateLevel(99)).toBe(10);
  });

  test('100 lines → level 11', () => {
    expect(calculateLevel(100)).toBe(11);
  });
});

describe('calculateGravityInterval', () => {
  test('level 1 = 800ms', () => {
    expect(calculateGravityInterval(1)).toBeCloseTo(800, 0);
  });

  test('level 2 ≈ 727ms (800 / 1.1)', () => {
    expect(calculateGravityInterval(2)).toBeCloseTo(800 / 1.1, 0);
  });

  test('level 10 ≤ ~350ms', () => {
    const interval = calculateGravityInterval(10);
    expect(interval).toBeLessThanOrEqual(350);
    expect(interval).toBeGreaterThan(50);
  });

  test('matches formula Math.max(50, 800 / 1.1^(level-1))', () => {
    for (let level = 1; level <= 20; level++) {
      const expected = Math.max(50, 800 / Math.pow(1.1, level - 1));
      expect(calculateGravityInterval(level)).toBeCloseTo(expected, 5);
    }
  });

  test('high levels are clamped to minimum 50ms', () => {
    expect(calculateGravityInterval(50)).toBe(50);
    expect(calculateGravityInterval(100)).toBe(50);
  });
});
