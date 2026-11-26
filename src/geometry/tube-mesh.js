import * as THREE from 'three';
import { FILAMENT_DIAMETER_MM } from './paths.js';

export function createTubeGeometry(pathPoints, diameterMm = FILAMENT_DIAMETER_MM) {
  if (!Array.isArray(pathPoints) || pathPoints.length < 2) throw new Error('O caminho precisa de pelo menos dois pontos.');
  const vectors = pathPoints.map(({ x, y, z = 0 }) => new THREE.Vector3(x, y, z));
  const curve = new THREE.CatmullRomCurve3(vectors, false, 'centripetal', 0.25);
  const length = curve.getLength();
  const tubularSegments = Math.max(64, Math.min(60000, Math.ceil(length * 1.5)));
  return new THREE.TubeGeometry(curve, tubularSegments, diameterMm / 2, 10, false);
}
