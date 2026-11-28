export function create2DPreview({ canvas, wrap }) {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Seu navegador não disponibilizou o canvas 2D.');
  let zoomFactor = 1;

  function draw(points, config, metrics) {
    const rect = wrap.getBoundingClientRect();
    const width = Math.max(1, rect.width), height = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0); context.clearRect(0, 0, width, height);
    const padding = 48;
    const scale = Math.min((width - padding * 2) / config.bedW, (height - padding * 2) / config.bedH) * zoomFactor;
    context.save(); context.translate(width / 2, height / 2); context.scale(scale, -scale);
    const isLight = document.documentElement.dataset.theme === 'light';
    context.strokeStyle = isLight ? '#465746' : '#829382'; context.lineWidth = 1.5 / scale; context.setLineDash([4 / scale, 3 / scale]);
    context.strokeRect(-config.bedW / 2, -config.bedH / 2, config.bedW, config.bedH); context.setLineDash([]);
    const fmt = value => Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
    const widthLabel = `${fmt(config.bedW)} mm`;
    const heightLabel = `${fmt(config.bedH)} mm`;
    const centerX = width / 2, centerY = height / 2;
    const bedPixelWidth = config.bedW * scale, bedPixelHeight = config.bedH * scale;
    const left = centerX - bedPixelWidth / 2, right = centerX + bedPixelWidth / 2;
    const top = centerY - bedPixelHeight / 2, bottom = centerY + bedPixelHeight / 2;
    const dimensionEls = {
      bedTopLeft: [widthLabel, centerX, top - 8, 'center', 'bottom'],
      bedTopRight: [heightLabel, right + 10, centerY, 'left', 'middle'],
    };
    for (const [id, [label, x, y, align, baseline]] of Object.entries(dimensionEls)) {
      const el = document.getElementById(id); el.textContent = label;
      el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.right = 'auto'; el.style.bottom = 'auto';
      el.style.transform = `translate(${align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0'}, ${baseline === 'middle' ? '-50%' : baseline === 'bottom' ? '-100%' : '0'})`;
    }
    if (points.length > 1) {
      context.lineCap = 'round'; context.lineJoin = 'round'; context.beginPath(); context.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) context.lineTo(points[i].x, points[i].y);
      context.strokeStyle = isLight ? '#dce5d6' : '#111612'; context.lineWidth = (config.diameter + 1.5) / scale; context.stroke();
      context.strokeStyle = isLight ? '#315d21' : '#b8ef63'; context.lineWidth = config.diameter / scale; context.stroke();
      for (const [point, color] of [[points[0], isLight ? '#182319' : '#f1f2e9'], [points.at(-1), isLight ? '#315d21' : '#b8ef63']]) {
        context.fillStyle = color; context.beginPath(); context.arc(point.x, point.y, Math.max(config.diameter * .8, 1.5), 0, Math.PI * 2); context.fill();
      }
    }
    context.restore();
    // Dimension rulers: width above the bed and depth on its left edge.
    context.save();
    context.strokeStyle = isLight ? '#465746' : '#829382';
    context.lineWidth = 1;
    context.setLineDash([]);
    const rulerY = top - 5;
    context.beginPath(); context.moveTo(left, rulerY); context.lineTo(right, rulerY);
    context.moveTo(left, rulerY - 4); context.lineTo(left, rulerY + 4);
    context.moveTo(right, rulerY - 4); context.lineTo(right, rulerY + 4);
    const rulerX = right + 5;
    context.moveTo(rulerX, top); context.lineTo(rulerX, bottom);
    context.moveTo(rulerX - 4, top); context.lineTo(rulerX + 4, top);
    context.moveTo(rulerX - 4, bottom); context.lineTo(rulerX + 4, bottom);
    context.stroke(); context.restore();
    document.getElementById('plateLabel').textContent = `${fmt(config.bedW)} × ${fmt(config.bedH)} mm`;
    document.getElementById('pathLength').textContent = `${fmt(metrics.lengthMm / 1000)} m`;
    document.getElementById('footprint').textContent = `${fmt(metrics.width)} × ${fmt(metrics.height)} mm`;
    document.getElementById('roundingOut').textContent = `${config.rounding}%`;
    const notice = document.getElementById('notice');
    const partial = !metrics.meetsRequestedLength;
    notice.classList.toggle('visible', partial);
    notice.textContent = partial
      ? `Esta configuração comporta ${fmt(metrics.lengthMm / 1000)} m dos ${fmt(config.requestedLengthM)} m pedidos. O comprimento máximo depende da mesa, do formato e do espaçamento.`
      : '';
    document.getElementById('buildBtn').disabled = partial || !metrics.fitsBed;
    document.getElementById('previewError').classList.remove('visible');
  }

  function showError(error) {
    document.getElementById('previewError').classList.add('visible');
    document.getElementById('previewErrorText').textContent = error.message || 'Confira os parâmetros e tente novamente.';
  }

  function setZoom(factor) {
    zoomFactor = Math.max(0.5, Math.min(4, factor));
  }
  function getZoom() { return zoomFactor; }

  return { draw, showError, setZoom, getZoom };
}
