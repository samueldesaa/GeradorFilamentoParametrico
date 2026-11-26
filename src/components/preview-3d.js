import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createTubeGeometry } from '../geometry/tube-mesh.js';

export function create3DPreview(root) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--field').trim());
  const themeObserver = new MutationObserver(() => { scene.background.set(getComputedStyle(document.documentElement).getPropertyValue('--field').trim()); renderer.render(scene, camera); });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 10000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  root.replaceChildren(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xe7f2dc, 0x252c24, 2.1));
  const key = new THREE.DirectionalLight(0xffffff, 3); key.position.set(180, 220, 280); scene.add(key);
  const fill = new THREE.DirectionalLight(0xb8ef63, 1.1); fill.position.set(-180, -100, 100); scene.add(fill);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = .08;
  let mesh = null;

  const resize = () => {
    const width = Math.max(1, root.clientWidth), height = Math.max(1, root.clientHeight);
    camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height); renderer.render(scene, camera);
  };
  const observer = new ResizeObserver(resize); observer.observe(root); resize();
  controls.addEventListener('change', () => renderer.render(scene, camera));

  function setPath(points, config) {
    const geometry = createTubeGeometry(points, config.diameter);
    geometry.computeBoundingBox();
    const material = new THREE.MeshStandardMaterial({ color: 0xb8ef63, roughness: .42, metalness: .08 });
    const next = new THREE.Mesh(geometry, material);
    next.updateMatrixWorld(true);
    if (mesh) { scene.remove(mesh); mesh.geometry.dispose(); mesh.material.dispose(); }
    mesh = next; scene.add(mesh);
    const bounds = geometry.boundingBox || new THREE.Box3().setFromObject(mesh);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const extent = Math.max(size.x, size.y, size.z, 10);
    controls.target.copy(center);
    camera.position.set(center.x + extent * .8, center.y - extent * 1.4, center.z + extent * 1.2);
    camera.near = Math.max(.1, extent / 1000); camera.far = extent * 10; camera.updateProjectionMatrix();
    controls.update(); resize();
    return mesh;
  }

  function dispose() {
    themeObserver.disconnect(); observer.disconnect(); controls.dispose();
    if (mesh) { scene.remove(mesh); mesh.geometry.dispose(); mesh.material.dispose(); }
    renderer.dispose(); root.replaceChildren();
  }

  return { setPath, getMesh: () => mesh, resize, dispose };
}
