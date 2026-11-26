import { describe, expect, it } from 'vitest';
import { generatePath } from '../src/geometry/paths.js';

const defaults = { shape: 'round', requestedLengthM: 10, bedW: 220, bedH: 220, rounding: 55, gap: 1.2 };

describe('generatePath', () => {
  it.each(['round', 'square', 'snake'])('creates a bounded %s path', shape => {
    const { points, metrics, config } = generatePath({ ...defaults, shape });
    expect(points.length).toBeGreaterThan(10);
    expect(metrics.fitsBed).toBe(true);
    expect(metrics.lengthMm).toBeLessThanOrEqual(config.requestedLengthM * 1000 + 2);
    expect(metrics.width).toBeLessThanOrEqual(config.bedW + 0.05);
    expect(metrics.height).toBeLessThanOrEqual(config.bedH + 0.05);
  });

  it('defaults to 10 metres and accepts requests through 200 metres', () => {
    const { config, metrics } = generatePath({ ...defaults, requestedLengthM: 200 });
    expect(config.requestedLengthM).toBe(200);
    expect(config.diameter).toBe(1.75);
    expect(metrics.meetsRequestedLength).toBe(false);
    expect(generatePath({ ...defaults, requestedLengthM: undefined }).config.requestedLengthM).toBe(10);
  });

  it('stays within the chosen edge margin and trims the requested start length', () => {
    const { points, config, metrics } = generatePath({ ...defaults, requestedLengthM: 2, centerOffsetM: 1, edgeMargin: 20 });
    expect(config.edgeMargin).toBe(20);
    expect(Math.max(...points.map(p => Math.abs(p.x)), ...points.map(p => Math.abs(p.y))) + config.diameter / 2).toBeLessThanOrEqual(110 - 20 + 0.05);
    expect(metrics.lengthMm).toBeCloseTo(2000, 0);
    expect(points[0].x).not.toBeCloseTo(0, 0);
  });

  it('defaults to zero edge margin and fills the circular bed to its usable limit', () => {
    const { points, config } = generatePath({ ...defaults, requestedLengthM: 200 });
    const outerRadius = Math.max(...points.map(point => Math.hypot(point.x, point.y))) + config.diameter / 2;
    expect(config.edgeMargin).toBe(0);
    expect(outerRadius).toBeGreaterThanOrEqual(Math.min(config.bedW, config.bedH) / 2 - 0.1);
  });

  it('clamps edge margin to 0–50 mm and center offset to nonnegative values', () => {
    const { config } = generatePath({ ...defaults, edgeMargin: 80, centerOffsetM: -1 });
    expect(config.edgeMargin).toBe(50);
    expect(config.centerOffsetM).toBe(0);
  });
});
