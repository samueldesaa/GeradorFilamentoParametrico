export const FILAMENT_DIAMETER_MM = 1.75;
export const MAX_REQUEST_LENGTH_M = 200;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const point = (x, y, z = 0) => ({ x, y, z });
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

export function normalizeConfig(input) {
  const number = (value, fallback, min, max) => {
    const parsed = Number(value);
    return clamp(Number.isFinite(parsed) ? parsed : fallback, min, max);
  };
  return {
    shape: ['round', 'square', 'snake'].includes(input.shape) ? input.shape : 'round',
    requestedLengthM: number(input.requestedLengthM, 10, 0.1, MAX_REQUEST_LENGTH_M),
    bedW: number(input.bedW, 220, 50, 500),
    bedH: number(input.bedH, 220, 50, 500),
    diameter: FILAMENT_DIAMETER_MM,
    rounding: number(input.rounding, 55, 0, 100),
    gap: number(input.gap, 1.2, 0.2, 8),
    edgeMargin: number(input.edgeMargin, 0, 0, 50),
    centerOffsetM: number(input.centerOffsetM, 0, 0, MAX_REQUEST_LENGTH_M),
  };
}

function arcSpiral(config) {
  const { bedW, bedH, diameter, gap, rounding, shape } = config;
  const pitch = diameter + gap;
  const exponent = 2 + ((100 - rounding) / 100) * 6;
  const extentFactor = Math.pow(2, Math.max(0, 0.5 - 1 / exponent));
  const maxRadius = Math.max(0, Math.min(bedW, bedH) / 2 - diameter / 2 - config.edgeMargin);
  // For a square superellipse, the parameter radius must be expanded so its
  // cardinal points reach the usable bed edge after division by extentFactor.
  const maxAngle = Math.max(0, ((maxRadius * (shape === 'square' ? extentFactor : 1)) - diameter) * 2 * Math.PI / pitch);
  const maxSteps = 300_000;
  const steps = Math.max(32, Math.min(maxSteps, Math.ceil(maxAngle * maxRadius / 1.2)));
  const result = [];

  for (let i = 0; i <= steps; i++) {
    const angle = maxAngle * i / steps;
    const radius = diameter + pitch * angle / (2 * Math.PI);
    const c = Math.cos(angle), s = Math.sin(angle);
    if (shape === 'square') {
      const safeRadius = radius / extentFactor;
      result.push(point(
        safeRadius * Math.sign(c) * Math.pow(Math.abs(c), 2 / exponent),
        safeRadius * Math.sign(s) * Math.pow(Math.abs(s), 2 / exponent),
      ));
    } else {
      result.push(point(radius * c, radius * s));
    }
  }
  return result;
}

function serpentine(config) {
  const { bedW, bedH, diameter, gap, rounding } = config;
  const pitch = diameter + gap;
  const radius = Math.max(0.01, Math.min(pitch / 2, pitch * rounding / 200));
  const xEdge = bedW / 2 - diameter / 2 - config.edgeMargin;
  const yEdge = bedH / 2 - diameter / 2 - config.edgeMargin;
  const lanePitch = Math.min(pitch, Math.max(0, 2 * yEdge));
  const lanes = Math.max(1, Math.floor((2 * yEdge) / Math.max(lanePitch, 0.01)) + 1);
  const yStart = -((lanes - 1) * lanePitch) / 2;
  const runHalf = Math.max(0, xEdge - radius);
  const run = 2 * runHalf;
  const result = [];
  const addRunSamples = Math.max(1, Math.ceil(run / 1.2));
  const turnSamples = Math.max(8, Math.ceil(Math.PI * radius / 0.6));

  for (let lane = 0; lane < lanes; lane++) {
    const y = yStart + lane * lanePitch;
    const forward = lane % 2 === 0;
    const start = forward ? -runHalf : runHalf;
    const end = forward ? runHalf : -runHalf;
    for (let i = lane === 0 ? 0 : 1; i <= addRunSamples; i++) {
      const t = i / addRunSamples;
      result.push(point(start + (end - start) * t, y));
    }
    if (lane < lanes - 1 && radius > 0.01) {
      const cx = end;
      const sign = forward ? 1 : -1;
      for (let i = 1; i <= turnSamples; i++) {
        const t = i / turnSamples;
        const theta = Math.PI * t;
        result.push(point(cx + sign * radius * Math.sin(theta), y + radius * (1 - Math.cos(theta))));
      }
      // The semicircle advances by 2r; bridge the extra lane pitch with a tangent-free rounded curve if necessary.
      const nextY = yStart + (lane + 1) * lanePitch;
      const turnEnd = y + 2 * radius;
      const remainder = nextY - turnEnd;
      if (remainder > 0.01) {
        const samples = Math.max(2, Math.ceil(remainder / 0.6));
        for (let i = 1; i <= samples; i++) {
          const t = i / samples;
          const eased = t * t * (3 - 2 * t);
          result.push(point(end, turnEnd + remainder * eased));
        }
      }
    }
  }
  return result;
}

export function polylineLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += distance(points[i - 1], points[i]);
  return total;
}

function slicePath(points, startLengthMm, targetLengthMm) {
  const result = [];
  let traversed = 0;
  let remaining = targetLengthMm;
  for (let i = 1; i < points.length && remaining > 0; i++) {
    const previous = points[i - 1];
    const current = points[i];
    const segment = distance(previous, current);
    if (segment === 0) continue;
    const segmentStart = traversed;
    const segmentEnd = traversed + segment;
    traversed = segmentEnd;
    if (segmentEnd <= startLengthMm) continue;
    const tStart = Math.max(0, (startLengthMm - segmentStart) / segment);
    const available = segment * (1 - tStart);
    const tEnd = tStart + Math.min(available, remaining) / segment;
    if (!result.length) result.push(point(
      previous.x + (current.x - previous.x) * tStart,
      previous.y + (current.y - previous.y) * tStart,
      previous.z + (current.z - previous.z) * tStart,
    ));
    result.push(point(
      previous.x + (current.x - previous.x) * tEnd,
      previous.y + (current.y - previous.y) * tEnd,
      previous.z + (current.z - previous.z) * tEnd,
    ));
    remaining -= Math.min(available, remaining);
  }
  return result;
}

export function measurePath(points, config) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }
  const width = points.length ? maxX - minX + config.diameter : 0;
  const height = points.length ? maxY - minY + config.diameter : 0;
  const lengthMm = polylineLength(points);
  return {
    width, height, lengthMm, requestedLengthMm: config.requestedLengthM * 1000,
    fitsBed: width <= config.bedW + 0.05 && height <= config.bedH + 0.05,
    meetsRequestedLength: lengthMm >= config.requestedLengthM * 1000 - 1,
  };
}

export function generatePath(input) {
  const config = normalizeConfig(input);
  const requestedLengthMm = config.requestedLengthM * 1000;
  const base = config.shape === 'snake' ? serpentine(config) : arcSpiral(config);
  if (base.length < 2) throw new Error('A mesa não comporta um caminho imprimível para estes parâmetros.');
  const points = slicePath(base, config.centerOffsetM * 1000, requestedLengthMm);
  const metrics = measurePath(points, config);
  return { config, points, metrics };
}
