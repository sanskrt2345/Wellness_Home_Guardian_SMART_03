// Landing page behaviour: icons, nav, scroll reveal, counters, live stats
document.querySelectorAll('[data-i]').forEach(e => e.innerHTML = icons[e.dataset.i] || '');

// Authentication status
const authed =
  localStorage.getItem('whg_auth') === '1' ||
  sessionStorage.getItem('whg_auth') === '1';

// If user is logged in, navbar Login button becomes Dashboard
if (authed) {
  document.getElementById('loginLink').textContent = 'Dashboard';
  document.getElementById('loginLink').href = 'pages/dashboard.html';
}

// Start Assessment ALWAYS opens Login / Register first
['startLink', 'heroStart', 'finalStart'].forEach(id => {
  const a = document.getElementById(id);

  if (a) {
    a.href = 'pages/login.html';
    a.textContent =
      id === 'startLink'
        ? 'Start Assessment'
        : 'Start your assessment';
  }
});

// nav: shadow on scroll + mobile menu
const nav = document.getElementById('nav'),
      links = document.getElementById('links'),
      burger = document.getElementById('burger');

const onScroll = () =>
  nav.classList.toggle('stuck', scrollY > 20);

onScroll();

addEventListener('scroll', onScroll, { passive: true });

burger.onclick = () => {
  links.classList.toggle('open');
  burger.classList.toggle('open');
};

links.querySelectorAll('a').forEach(a =>
  a.onclick = () => {
    links.classList.remove('open');
    burger.classList.remove('open');
  }
);

// real numbers from the questionnaire
const scored = allQuestions().length;

document.getElementById('statSec').dataset.count = SECTIONS.length;
document.getElementById('statQ').dataset.count = scored;

document.getElementById('secList').innerHTML =
  SECTIONS.map(s =>
    `<li>${s.title}<span>${s.qs.length} questions</span></li>`
  ).join('');

// counters
function countUp(el, to, ms = 1000) {
  const t0 = performance.now();

  (function f(t) {
    const k = Math.min(1, (t - t0) / ms);

    el.textContent = Math.round(
      to * (1 - Math.pow(1 - k, 3))
    );

    if (k < 1) requestAnimationFrame(f);
  })(t0);
}

document.querySelectorAll('[data-count]').forEach(el => {
  const go = () =>
    setTimeout(
      () => countUp(el, +el.dataset.count),
      +(el.dataset.delay || 0)
    );

  if (el.dataset.delay) {
    go();
    return;
  }

  new IntersectionObserver((es, o) => {
    if (es[0].isIntersecting) {
      go();
      o.disconnect();
    }
  }, { threshold: .6 }).observe(el);
});

// scroll reveal
document
  .querySelectorAll('.dlist,.steps')
  .forEach(g =>
    g.querySelectorAll('.reveal')
      .forEach((el, i) =>
        el.style.setProperty('--rd', i * 90 + 'ms')
      )
  );

const io = new IntersectionObserver(
  es => es.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  }),
  { threshold: .2 }
);

document
  .querySelectorAll('.reveal')
  .forEach(el => io.observe(el));

const stepsIO = new IntersectionObserver(
  es => es.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      stepsIO.unobserve(e.target);
    }
  }),
  { threshold: .3 }
);

stepsIO.observe(document.querySelector('.steps'));