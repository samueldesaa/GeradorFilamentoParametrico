import * as THREE from 'three';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';

export function serializeBinarySTL(mesh) {
  if (!mesh?.geometry) throw new Error('Gere um modelo 3D antes de exportar.');
  mesh.updateMatrixWorld(true);
  const exporter = new STLExporter();
  const bytes = exporter.parse(mesh, { binary: true });
  if (!(bytes instanceof DataView) || bytes.byteLength < 84) throw new Error('O exportador retornou um STL binário inválido.');
  const triangleCount = bytes.getUint32(80, true);
  if (!triangleCount || bytes.byteLength !== 84 + triangleCount * 50) throw new Error('O arquivo STL está vazio ou incompleto.');
  const blob = new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)], { type: 'model/stl' });
  return { blob, triangleCount };
}

export function downloadSTL(mesh, filename) {
  const { blob, triangleCount } = serializeBinarySTL(mesh);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { bytes: blob.size, filename, triangleCount };
}
