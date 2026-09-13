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
const hero = document.querySelector('.hero');
const heroCard = document.querySelector('.hero .alert-card');
const sequence = document.querySelector('[data-sequence]');
const sequenceCards = [...document.querySelectorAll('.sequence-card')];
const sequenceWords = [...document.querySelectorAll('.sequence-type span')];
const sequenceIndex = document.querySelector('.sequence-index');
const cinematicViewport = window.matchMedia('(min-width: 901px) and (min-height: 760px)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
let pointer = { x: 0, y: 0 };
const revealTargets = [
  ...document.querySelectorAll(
    '.section-heading, .workflow li, .filter-list > div, .grade-feature, .context-features article, .plan, .getting-started, .method-layout > div, .faq-layout > div, .closing-inner',
  ),
];
let motionEnabled = false;
let manuallyPaused = false;
try {
  manuallyPaused = localStorage.getItem('insider-motion') === 'off';
} catch {
  /* Storage is optional. */
}
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
  const heroProgress = clamp(-hero.getBoundingClientRect().top / hero.offsetHeight);
  hero.style.setProperty('--hero-copy-y', `${heroProgress * -45}px`);
  hero.style.setProperty('--hero-card-y', `${heroProgress * 80}px`);
  hero.style.setProperty('--hero-card-rotate', `${heroProgress * 7}deg`);
  hero.style.setProperty('--hero-type-y', `${heroProgress * -140}px`);
  heroCard.style.setProperty('--tilt-x', `${pointer.y * -4}deg`);
  heroCard.style.setProperty('--tilt-y', `${pointer.x * 5}deg`);
  heroCard.style.setProperty('--light-x', `${50 + pointer.x * 35}%`);
  heroCard.style.setProperty('--light-y', `${50 + pointer.y * 35}%`);
  story.style.setProperty('--story-rotate', `${(active - 1) * -3}deg`);
  updateSequence();
}

function updateSequence() {
  if (!sequence) return;
  const rect = sequence.getBoundingClientRect();
  const p = cinematicViewport.matches
    ? clamp((89 - rect.top) / Math.max(1, rect.height - window.innerHeight + 89))
    : clamp((window.innerHeight * 0.5 - rect.top) / rect.height);
  const position = clamp(p * 2.6 - 0.2, 0, 2);
  sequence.style.setProperty('--sequence-progress', p);
  sequenceIndex.textContent = `0${Math.min(2, Math.round(position)) + 1} / 03`;
  sequenceWords.forEach((word, i) => {
    word.style.setProperty('--word-x', `${(p - 0.5) * (i % 2 ? -160 : 160)}px`);
    word.style.setProperty('--word-color', Math.round(position) === i ? '#456b36' : '#203025');
  });
  sequenceCards.forEach((card, i) => {
    if (cinematicViewport.matches) {
      const d = i - position;
      card.style.setProperty('--card-x', `${d * (d > 0 ? 180 : 330)}px`);
      card.style.setProperty('--card-y', `${d * 100}px`);
      card.style.setProperty('--card-angle', `${d * 17}deg`);
      card.style.setProperty('--card-scale', `${1 - Math.min(1.5, Math.abs(d)) * 0.1}`);
      card.style.setProperty('--card-opacity', `${clamp(1 - Math.abs(d) * 1.1)}`);
      card.style.zIndex = String(10 - Math.round(Math.abs(d) * 3));
    } else {
      // offsetTop is unaffected by transforms, so scrolling cannot create feedback jitter.
      const top = rect.top + card.offsetTop + card.parentElement.offsetTop;
      const middle = top + card.offsetHeight / 2;
      const d = clamp((middle - window.innerHeight / 2) / window.innerHeight, -1, 1);
      card.style.setProperty('--mobile-y', `${d * 35}px`);
      card.style.setProperty('--mobile-angle', `${d * 3}deg`);
      card.style.setProperty('--mobile-opacity', `${clamp(1.5 - Math.abs(d) * 1.3, 0.2, 1)}`);
    }
  });
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
    try {
      localStorage.setItem('insider-motion', manuallyPaused ? 'off' : 'on');
    } catch {
      /* Optional. */
    }
    setMotion(!motionEnabled);
  });
  reducedMotion.addEventListener('change', () => setMotion(!manuallyPaused));
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  heroCard.addEventListener(
    'pointermove',
    (event) => {
      if (!motionEnabled || !finePointer.matches) return;
      const bounds = heroCard.getBoundingClientRect();
      pointer = {
        x: clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1),
        y: clamp(((event.clientY - bounds.top) / bounds.height) * 2 - 1, -1, 1),
      };
      scheduleScroll();
    },
    { passive: true },
  );
  heroCard.addEventListener('pointerleave', () => {
    pointer = { x: 0, y: 0 };
    scheduleScroll();
  });
  // Keyboard focus always reveals its containing section immediately.
  document.addEventListener('focusin', (event) => {
    for (let element = event.target; element instanceof Element; element = element.parentElement) {
      element.classList.remove('is-outside');
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) scheduleScroll();
  });
  setMotion(!manuallyPaused);
}
