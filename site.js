// Content stays visible without JavaScript. Motion is progressive enhancement.
const copyButton = document.querySelector('[data-copy]');
if (copyButton && navigator.clipboard?.writeText) {
  copyButton.hidden = false;
  copyButton.addEventListener('click', async () => {
    const status = document.querySelector('.copy-status');
    try {
      await navigator.clipboard.writeText(copyButton.dataset.copy);
      status.textContent = 'Copied. Paste it in Discord to subscribe.';
    } catch {
      status.textContent = 'Copy unavailable. Type /subscribe in Discord.';
    }
  });
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('.motion-toggle');
const story = document.querySelector('.signal-story');
const steps = [...document.querySelectorAll('.story-step')];
const progressBar = document.querySelector('.reading-progress');
const revealTargets = [
  ...document.querySelectorAll(
    '.section-heading, .workflow li, .filter-list > div, .grade-feature, .context-features article, .plan, .getting-started, .method-layout > div, .faq-layout > div, .closing-inner',
  ),
];
let motionEnabled = false;
let manuallyPaused = false;
let revealObserver;
let frame = 0;

function updateScroll() {
  frame = 0;
  if (!motionEnabled) return;
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
  progressBar.style.transform = `scaleX(${progress})`;
  const targetLine = window.innerHeight * 0.55;
  let active = 0;
  steps.forEach((step, index) => {
    if (step.getBoundingClientRect().top <= targetLine) active = index;
  });
  story.dataset.stage = String(active);
  steps.forEach((step, index) => step.classList.toggle('is-current', index === active));
  document.querySelector('.story-counter').textContent = `0${active + 1} — 03`;
  document.querySelector('.window-state').textContent = [
    'Incoming filings',
    'Filtering transactions',
    'Further alert checks',
  ][active];
}

function scheduleScroll() {
  if (motionEnabled && !frame) frame = requestAnimationFrame(updateScroll);
}

function setMotion(enabled) {
  motionEnabled = enabled && !reducedMotion.matches && 'IntersectionObserver' in window;
  document.documentElement.classList.toggle('motion-enabled', motionEnabled);
  motionButton.setAttribute('aria-pressed', String(motionEnabled));
  motionButton.textContent = motionEnabled ? 'Motion: on' : 'Motion: off';
  motionButton.disabled = reducedMotion.matches;
  motionButton.title = reducedMotion.matches
    ? 'Reduced motion is enabled in your device settings'
    : 'Toggle page animations';
  revealObserver?.disconnect();
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  revealTargets.forEach((target) => target.classList.remove('is-outside'));
  if (!motionEnabled) {
    progressBar.style.transform = 'scaleX(0)';
    story.dataset.stage = '0';
    document.querySelector('.window-state').textContent = 'Incoming filings';
    return;
  }
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Reveal on entry; only reset once fully outside the viewport.
        entry.target.classList.toggle('is-outside', !entry.isIntersecting);
      });
    },
    { threshold: 0, rootMargin: '0px 0px 0px 0px' },
  );
  revealTargets.forEach((target, index) => {
    target.classList.add('reveal');
    target.style.setProperty('--reveal-delay', `${Math.min(index % 3, 2) * 70}ms`);
    if (target.getBoundingClientRect().top >= window.innerHeight)
      target.classList.add('is-outside');
    revealObserver.observe(target);
  });
  updateScroll();
}

if (motionButton && story && progressBar) {
  motionButton.hidden = false;
  motionButton.addEventListener('click', () => {
    manuallyPaused = motionEnabled;
    setMotion(!motionEnabled);
  });
  reducedMotion.addEventListener('change', () => setMotion(!manuallyPaused));
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  // Keyboard focus always reveals its containing section immediately.
  document.addEventListener('focusin', (event) => {
    for (let element = event.target; element instanceof Element; element = element.parentElement) {
      element.classList.remove('is-outside');
    }
  });
  setMotion(true);
}
