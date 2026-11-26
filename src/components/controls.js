export function initControls(onChange) {
  const $ = id => document.getElementById(id);
  const form = $('settingsForm');
  const shapeButtons = [...document.querySelectorAll('.profile')];
  let shape = 'round';

  const read = () => ({
    shape,
    requestedLengthM: Number($('length').value),
    bedW: Number($('bedW').value),
    bedH: Number($('bedH').value),
    rounding: Number($('rounding').value),
    gap: Number($('spacing').value),
    edgeMargin: Number($('edgeMargin').value),
    centerOffsetM: Number($('centerOffset').value),
  });

  shapeButtons.forEach(button => button.addEventListener('click', () => {
    shape = button.dataset.shape;
    shapeButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    onChange(read());
  }));
  form.addEventListener('input', () => onChange(read()));
  form.addEventListener('submit', event => event.preventDefault());
  return { read };
}
