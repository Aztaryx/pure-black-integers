/* Timer scene for beat 8.3a. Loaded after script.js; wraps renderDeck, deckNext and deckBack. Times below are elapsed seconds. */
(() => {
  const TOTAL = 300, LOCK = 120, BLACK = 141, VIDEO = 142, Z = 10, COLS = 192, ROWS = 108;
  let scene, ctx, raf = 0, tick = 0, t0 = 0, base = 0, running = false, played = false, locked = false, released = false, leaving = false, order = [], shown = 0;
  const el = (c, p, h) => { const e = document.createElement('div'); e.className = c; if (h) e.innerHTML = h; (p || scene).appendChild(e); return e };
  const fmt = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  const elapsed = () => base + (running ? (performance.now() - t0) / 1000 : 0);
  const past = () => BEATS.slice(0, deckIndex).filter(b => b.html && !/timer/.test(b.html));

  const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
  // triple helix (barber-pole spiral): three strands 120 degrees apart, one turn per 4000 units (four screen heights), so the waves are very long and slow.
  // Segments facing us are thicker and darker, the ones behind fainter (the 3D look). It repeats every 4000 units so it can loop upward.
  const helix = () => { let o = ''; for (let k = 0; k < 3; k++) for (let y = 0; y < 5000; y += 20) { const ph = 2 * Math.PI * k / 3, z = (Math.cos(2 * Math.PI * (y + 10) / 4000 + ph) + 1) / 2, x1 = 150 + 120 * Math.sin(2 * Math.PI * y / 4000 + ph), x2 = 150 + 120 * Math.sin(2 * Math.PI * (y + 20) / 4000 + ph); o += `<line x1="${x1.toFixed(1)}" y1="${y}" x2="${x2.toFixed(1)}" y2="${y + 20}" stroke-width="${(.8 + 3.2 * z).toFixed(2)}" stroke-opacity="${(.12 + .7 * z).toFixed(2)}"/>` } return o };
  const prep = c => { c.querySelectorAll('[data-step]').forEach(e => e.classList.add('shown')); c.querySelectorAll('[data-hide]').forEach(e => e.classList.add('gone')); c.querySelectorAll('[data-on]').forEach(e => e.classList.add('on')) };
  const rnd = (a, b) => a + Math.random() * (b - a);

  function build() {
    const deck = document.getElementById('deck'), P = past();
    deck.classList.add('ts-on');
    scene = el('', deck); scene.id = 'ts'; scene.style.setProperty('--z', Z);
    const world = el('ts-world'); el('ts-grid', world);
    // a handful of earlier slides, not all: the one we came from plus four random ones
    const pool = P.length ? [P[P.length - 1], ...P.slice(0, -1).sort(() => Math.random() - .5).slice(0, 4)] : [];
    // the slide we came from collapses into the bottom-right corner
    const main = el('ts-win ts-main', world);
    if (pool.length) { const c = el('ts-clone', main, pool[0].html); c.style.transform = `scale(${1 / Z})`; prep(c) }
    // side windows (left and right edges) hold large crops of those slides, inverted; they drift and sway
    for (let i = 0; i < 8; i++) {
      const w = rnd(5, 13), h = rnd(10, 26), s = rnd(.55, .85), win = el('ts-win', world), left = i % 2 ? rnd(1, 18 - w) : rnd(82, 99 - w);
      win.style.cssText += `left:${left}vw;top:${rnd(-6, 106 - h)}vh;width:${w}vw;height:${h}vh;--a:${rnd(-12, -4)}vh;--b:${rnd(4, 12)}vh;--sx:${rnd(-.75, .75)}vw;--d:${rnd(12, 28)}s;--dl:${-rnd(0, 20)}s`;
      if (!pool.length) continue;
      const c = el('ts-clone', win, pool[i % pool.length].html); prep(c);
      c.style.transform = `scale(${s})`; c.style.left = -Math.random() * Math.random() * Math.max(0, 100 * s - w) + 'vw'; c.style.top = -Math.random() * Math.random() * Math.max(0, 100 * s - h) + 'vh';
    }
    // small empty windows, anywhere
    for (let i = 0; i < 14; i++) {
      const w = rnd(.6, 2.2), h = rnd(3, 11), win = el('ts-win', world);
      win.style.cssText += `left:${rnd(0, 100 - w)}vw;top:${rnd(-6, 106 - h)}vh;width:${w}vw;height:${h}vh;opacity:${rnd(.25, .9)};--a:${rnd(-10, -3)}vh;--b:${rnd(3, 10)}vh;--sx:${rnd(-1, 1)}vw;--d:${rnd(10, 24)}s;--dl:${-rnd(0, 20)}s`;
    }
    // a widely spaced, transparent barber-pole helix up the middle, moving upward
    scene.insertAdjacentHTML('beforeend', `<svg class="ts-waves" viewBox="0 0 300 1000" preserveAspectRatio="none" aria-hidden="true"><g style="animation-delay:-${Math.floor(Math.random() * 180)}s">${helix()}</g></svg>`);
    // the black bloom is drawn on a canvas of tiny cells
    const cv = document.createElement('canvas'); cv.className = 'ts-flood'; cv.width = innerWidth; cv.height = innerHeight; scene.appendChild(cv);
    ctx = cv.getContext('2d'); ctx.fillStyle = '#000';
    el('ts-black'); el('ts-time').textContent = fmt(TOTAL);
    const v = document.createElement('video'); v.src = 'test.mp4'; v.playsInline = true; v.preload = 'auto'; scene.appendChild(v);
    // the video stays on screen until it ends (its last frame is black); then the slide is released
    const release = () => { released = true; locked = false; scene.classList.remove('locked') };
    v.onended = release; v.onerror = release; // if the video is missing or fails, the slide is not left locked
    const ctl = el('ts-ctl', null, '<button data-a="back">Back</button><button data-a="start">Start</button><button data-a="pause">Pause</button><button data-a="reset">Reset</button><button data-a="next">Next</button>');
    ctl.onclick = e => { const a = e.target.dataset.a; if (!a || locked) return; if (a === 'start') start(); else if (a === 'pause') stop(); else if (a === 'reset') reset(); else if (a === 'next') go(1); else go(-1) };
    scene.onclick = e => e.stopPropagation();
    // bloom order: cells die by distance from the bottom center, with a ragged front
    const cx = COLS / 2, jit = Math.hypot(cx, ROWS) * .05;
    order = Array.from({ length: COLS * ROWS }, (_, i) => [i, Math.hypot(i % COLS + .5 - cx, Math.floor(i / COLS) + .5 - ROWS) + Math.random() * jit]).sort((a, b) => a[1] - b[1]).map(a => a[0]);
    // zoom out: the view pulls back about 10x with its origin at the bottom-right corner, swinging through a tilt on the way
    if (!reduced()) {
      const n = 60, kf = Array.from({ length: n + 1 }, (_, i) => { const t = i / n, e = 1 - Math.pow(1 - t, 2.2); return { transform: `rotate(${(-2 * Math.sin(Math.PI * e)).toFixed(2)}deg) scale(${Math.pow(Z, 1 - e).toFixed(4)})` } });
      world.animate(kf, { duration: 3800, easing: 'linear' });
      setTimeout(() => scene && scene.classList.add('in'), 2600);
    } else scene.classList.add('in');
  }
  // draw the cells that should be dead by now
  function sync() {
    if (!ctx) return;
    const e = elapsed(), want = Math.min(order.length, Math.floor(e / BLACK * order.length)), cv = ctx.canvas, cw = cv.width / COLS, ch = cv.height / ROWS;
    for (; shown < want; shown++) { const k = order[shown]; ctx.fillRect(Math.floor((k % COLS) * cw), Math.floor(Math.floor(k / COLS) * ch), Math.ceil(cw) + 1, Math.ceil(ch) + 1) }
  }
  const loop = () => { if (!running) { raf = 0; return } sync(); raf = requestAnimationFrame(loop) };
  function paint() {
    const e = elapsed(), left = Math.max(0, Math.ceil(TOTAL - e));
    scene.querySelector('.ts-time').textContent = left > 0 ? fmt(left) : 'Time\u2019s up!';
    if (e >= LOCK && !locked && !released) { locked = true; scene.classList.add('locked') }
    sync();
    if (e >= BLACK) scene.classList.add('black');
    if (e >= VIDEO && !played) { played = true; const v = scene.querySelector('video'); v.classList.add('on'); v.play().catch(() => {}) }
    if (left <= 0) stop();
  }
  function start() { if (running) return; running = true; t0 = performance.now(); tick = setInterval(paint, 200); raf = requestAnimationFrame(loop) }
  function stop() { if (!running) return; base = elapsed(); running = false; clearInterval(tick); cancelAnimationFrame(raf) }
  function reset() { stop(); base = 0; shown = 0; played = false; released = false; scene.classList.remove('black'); ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); const v = scene.querySelector('video'); v.pause(); v.currentTime = 0; v.classList.remove('on'); paint() }
  function leave() { clearInterval(tick); cancelAnimationFrame(raf); ctx = null; running = false; base = 0; shown = 0; played = false; locked = false; released = false; leaving = false; if (scene) { const v = scene.querySelector('video'); v && v.pause(); scene.remove(); scene = null } document.getElementById('deck').classList.remove('ts-on') }

  const orig = { renderDeck, deckNext, deckBack };
  renderDeck = function (full) {
    leave(); orig.renderDeck(full);
    if (BEATS[deckIndex] && BEATS[deckIndex].beat === '8.3a') build();
  };
  // After the video, leaving the slide dissolves the black scene to white (the paper behind it), then moves on.
  const go = dir => {
    if (leaving) return;
    const f = dir > 0 ? orig.deckNext : orig.deckBack;
    if (!(scene && released)) return f();
    leaving = true; scene.style.transition = 'opacity 1s ease'; scene.style.opacity = 0;
    setTimeout(f, matchMedia('(prefers-reduced-motion:reduce)').matches ? 0 : 1000);
  };
  deckNext = function () { if (!locked) go(1) };
  deckBack = function () { if (!locked) go(-1) };
})();
