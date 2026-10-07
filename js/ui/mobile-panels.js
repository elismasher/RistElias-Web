// Native page scrolling drives the text; there is no independently scrollable pane.
export function initMobilePanels(state) {
  const panels = state.overlays.filter(overlay => overlay.kind === 'panel').map(({ el }) => ({
    el, section: el.closest('.ch'), copy: el.querySelector('.panel-copy'),
    content: el.querySelector('.panel-content'), travel: 0,
  }));
  let frame = null;
  function update() {
    frame = null;
    const mobile = document.body.classList.contains('mobile');
    // Read all geometry before writing, including after language/accordion changes.
    const layout = panels.map(panel => ({
      panel, travel: mobile ? Math.max(0, panel.content.scrollHeight - panel.copy.clientHeight) : 0,
    }));
    for (const { panel, travel } of layout) {
      panel.travel = travel;
      panel.section.style.setProperty('--mobile-travel', `${travel}px`);
      for (const hotspot of panel.el.querySelectorAll('.hs')) hotspot.tabIndex = mobile ? 0 : -1;
    }
    const offsets = panels.map(panel => Math.min(panel.travel, Math.max(0, -panel.section.getBoundingClientRect().top)));
    panels.forEach((panel, index) => {
      panel.content.style.transform = mobile ? `translateY(${-offsets[index]}px)` : '';
    });
  }
  function schedule() {
    if (frame === null) frame = requestAnimationFrame(update);
  }
  const observer = new ResizeObserver(schedule);
  for (const panel of panels) {
    observer.observe(panel.content);
    observer.observe(panel.copy);
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  schedule();
}
