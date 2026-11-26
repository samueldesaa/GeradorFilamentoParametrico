import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createTubeGeometry } from '../src/geometry/tube-mesh.js';
import { serializeBinarySTL } from '../src/export/stl.js';

const points = [{ x: -10, y: 0, z: 0 }, { x: 0, y: 10, z: 0 }, { x: 10, y: 0, z: 0 }];

describe('STL export', () => {
  it('serializes a non-empty binary STL in millimeter coordinates', async () => {
    const geometry = createTubeGeometry(points, 1.75);
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
    const { blob, triangleCount } = serializeBinarySTL(mesh);
    const data = new DataView(await blob.arrayBuffer());
    const triangles = data.getUint32(80, true);
    expect(blob.type).toBe('model/stl');
    expect(triangleCount).toBe(triangles);
    expect(triangles).toBeGreaterThan(0);
    expect(blob.size).toBe(84 + 50 * triangles);
    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox;
    expect(bounds.max.x - bounds.min.x).toBeGreaterThan(18);
    expect(bounds.max.x - bounds.min.x).toBeLessThan(25);
    geometry.dispose(); mesh.material.dispose();
  });
});
