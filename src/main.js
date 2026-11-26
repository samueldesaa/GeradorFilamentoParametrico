import './styles.css';
import { initControls } from './components/controls.js';
import { create2DPreview } from './components/preview-2d.js';
import { create3DPreview } from './components/preview-3d.js';
import { generatePath } from './geometry/paths.js';
import { downloadSTL } from './export/stl.js';

const $ = id => document.getElementById(id);
const preview2D = create2DPreview({ canvas: $('previewCanvas'), wrap: $('canvasWrap') });
const controls = initControls(updatePreview);
let currentModel = null;
let currentSignature = '';
let currentModelLengthM = 0;
let modelIsStale = true;
let viewer = null;
let debounceTimer = 0;
let showing3D = false;

function signature(config) { return JSON.stringify(config); }
function formatMeters(value) { return Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 }); }
function updatePreview(config = controls.read()) {
  $('roundingOut').textContent = `${config.rounding}%`;
  modelIsStale = !!currentModel && signature(config) !== currentSignature;
  $('downloadBtn').disabled = !currentModel || modelIsStale;
  $('previewError').classList.remove('visible');
  window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    try {
      const result = generatePath(config);
      preview2D.draw(result.points, result.config, result.metrics);
      $('buildBtn').disabled = !result.metrics.meetsRequestedLength || !result.metrics.fitsBed;
      $('previewCanvas').dataset.state = 'ready';
    } catch (error) {
      preview2D.showError(error);
      $('buildBtn').disabled = true;
    }
  }, 80);
}
function show2D() {
  showing3D = false;
  $('previewCanvas').hidden = false;
  $('three-root').hidden = true;
  $('previewTitle').textContent = 'Caminho 2D';
  $('backBtn').hidden = true;
  $('downloadBtn').hidden = true;
  $('buildBtn').hidden = false;
  $('settingsForm').hidden = false;
  window.dispatchEvent(new Event('resize'));
  updatePreview();
  $('buildBtn').focus();
}
function show3D() {
  showing3D = true;
  $('previewCanvas').hidden = true;
  $('three-root').hidden = false;
  $('previewTitle').textContent = 'Pré-visualização 3D';
  $('backBtn').hidden = false;
  $('downloadBtn').hidden = false;
  $('buildBtn').hidden = true;
  $('settingsForm').hidden = true;
  window.dispatchEvent(new Event('resize'));
  $('backBtn').focus();
}
function generateModel() {
  const button = $('buildBtn');
  button.disabled = true;
  $('notice').classList.remove('visible');
  try {
    const config = controls.read();
    const result = generatePath(config);
    if (!result.metrics.fitsBed) throw new Error('O caminho não cabe na mesa. Ajuste os parâmetros.');
    if (!result.metrics.meetsRequestedLength) throw new Error(`Esta configuração comporta ${formatMeters(result.metrics.lengthMm / 1000)} m. Ajuste o comprimento ou a mesa.`);
    if (!viewer) viewer = create3DPreview($('three-root'));
    currentModel = viewer.setPath(result.points, result.config);
    currentModelLengthM = result.metrics.lengthMm / 1000;
    currentSignature = signature(config);
    modelIsStale = false;
    show3D();
  } catch (error) {
    $('notice').textContent = error.message || 'Não foi possível gerar a pré-visualização.';
    $('notice').classList.add('visible');
  } finally {
    button.disabled = false;
  }
}
function exportModel() {
  if (!currentModel || modelIsStale) {
    $('notice').textContent = 'Volte aos parâmetros e gere uma pré-visualização atualizada antes de exportar.';
    $('notice').classList.add('visible');
    return;
  }
  try {
    const config = controls.read();
    const filename = `filamento-${config.shape}-${currentModelLengthM.toString().replace('.', '-')}-m.stl`;
    downloadSTL(currentModel, filename);
    $('notice').textContent = 'STL exportado.';
    $('notice').classList.add('visible');
  } catch (error) {
    $('notice').textContent = `Falha na exportação STL: ${error.message}`;
    $('notice').classList.add('visible');
  }
}

$('buildBtn').addEventListener('click', generateModel);
$('downloadBtn').addEventListener('click', exportModel);
$('backBtn').addEventListener('click', show2D);
$('themeToggle').addEventListener('click', event => {
  const light = document.documentElement.dataset.theme !== 'light';
  document.documentElement.dataset.theme = light ? 'light' : 'dark';
  event.currentTarget.textContent = light ? 'Tema escuro' : 'Tema claro';
  event.currentTarget.setAttribute('aria-pressed', String(light));
  try { localStorage.setItem('gerador-tema', light ? 'light' : 'dark'); } catch {}
  updatePreview();
});
function setFontSize(delta) {
  const current = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  const next = Math.max(16, Math.min(24, current + delta));
  document.documentElement.style.setProperty('--page-size', `${next}px`);
  try { localStorage.setItem('gerador-fonte', String(next)); } catch {}
}
$('fontUp').addEventListener('click', () => setFontSize(1));
$('fontDown').addEventListener('click', () => setFontSize(-1));
$('settingsForm').addEventListener('input', () => { if (showing3D) show2D(); });
try {
  const savedTheme = localStorage.getItem('gerador-tema');
  if (savedTheme === 'light') { document.documentElement.dataset.theme = 'light'; $('themeToggle').textContent = 'Tema escuro'; $('themeToggle').setAttribute('aria-pressed', 'true'); }
  const savedSize = Number(localStorage.getItem('gerador-fonte'));
  if (savedSize >= 16 && savedSize <= 24) document.documentElement.style.setProperty('--page-size', `${savedSize}px`);
} catch {}
updatePreview();
