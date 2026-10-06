export function initScreenshotViewer() {
  const dialog = document.getElementById('screenshotViewer');
  const full = dialog.querySelector('img');
  const close = dialog.querySelector('button');

  document.addEventListener('click', event => {
    const shot = event.target.closest('button.shot');
    if (!shot || dialog.open) return;
    const preview = shot.querySelector('img');
    full.src = preview.currentSrc || preview.src;
    full.alt = preview.alt;
    dialog.showModal();
    document.body.classList.add('screenshot-open');
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('screenshot-open');
    full.removeAttribute('src');
    full.alt = '';
  });
}
