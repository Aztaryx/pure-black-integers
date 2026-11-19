/* Timer scene for beat 8.3a. Loaded after script.js; wraps renderDeck, deckNext and deckBack. Times below are elapsed seconds. */
(() => {
  const TOTAL = 300, LOCK = 120, BLACK = 141, VIDEO = 142, Z = 10, COLS = 192, ROWS = 108;
  let scene, worldEl, X, W = 0, H = 0, stars = [], spRaf = 0, built = 0, rm = false, lastTf = '', ctx, raf = 0, tick = 0, t0 = 0, base = 0, running = false, played = false, locked = false, released = false, leaving = false, order = [], shown = 0;
  const el = (c, p, h) => { const e = document.createElement('div'); e.className = c; if (h) e.innerHTML = h; (p || scene).appendChild(e); return e };
  const fmt = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  const elapsed = () => base + (running ? (performance.now() - t0) / 1000 : 0);
  const past = () => BEATS.slice(0, deckIndex).filter(b => b.html && !/timer/.test(b.html));

  const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
  const prep = c => { c.querySelectorAll('[data-step]').forEach(e => e.classList.add('shown')); c.querySelectorAll('[data-hide]').forEach(e => e.classList.add('gone')); c.querySelectorAll('[data-on]').forEach(e => e.classList.add('on')) };
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ---- space: the view keeps pulling back until the slide is a speck on a planet; once the timer runs we ascend through the void ----
  // Camera (JS, not CSS): phase 1 is the 10x pull-back; phase 2 zooms out about 80x more while sliding the field onto the planet's top edge.
  const TAU = Math.PI * 2, Z1 = 3800, Z2 = 4600, SF = .012, PR = .27, PCY = .6, PUP = 40;
  const dist = t => (t < 4 ? t * t / 8 : t - 2); // ascent distance in seconds of cruise: eases in over 4 s, then constant
  // Bodies we pass, in order. t: ascent second when the top edge enters; x: horizontal position; r: radius as a share of the short side; dur: seconds to cross.
  const BODIES = [
    { k: 'nebula', t: 38, x: .55, r: .6, dur: 80 },
    { k: 'moon', t: 8, x: .78, r: .085, dur: 17 },
    { k: 'comet', t: 22, x: .92, dur: 3.2 },
    { k: 'mars', t: 30, x: .2, r: .11, dur: 20 },
    { k: 'twins', t: 52, x: .64, r: .06, dur: 23 },
    { k: 'saturn', t: 72, x: .24, r: .14, dur: 28 },
    { k: 'black', t: 96, x: .72, r: .12, dur: 25 },
    { k: 'jupiter', t: 110, x: .3, r: .2, dur: 32 }
  ];
  const LAND = [[-.35, -.25, .22, .12, .5], [.2, -.1, .3, .14, -.3], [-.05, .3, .2, .1, .2], [.4, .35, .14, .08, .8], [-.5, .2, .1, .07, 0], [.1, -.55, .16, .06, .1]];
  function spaceInit(cv) {
    X = cv.getContext('2d'); W = cv.width; H = cv.height;
    // three layers of stars: far ones drift slowly, near ones faster (parallax); a few are blue or red
    stars = [[150, .6, 1, 14], [90, .9, 1.5, 32], [50, 1.3, 2.1, 70]].flatMap(([n, r0, r1, v]) => Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: rnd(r0, r1), a: rnd(.35, 1), v, c: Math.random() < .08 ? (Math.random() < .5 ? '#7fa2ff' : '#ff8a8a') : '#fff' })));
  }
  function camera(ms) {
    if (rm) return { s: SF, u: 1, rot: 0, star: 1 };
    if (ms < Z1) { const t = ms / Z1, e = 1 - Math.pow(1 - t, 2.2); return { s: Math.pow(Z, 1 - e), u: 0, rot: -2 * Math.sin(Math.PI * e), star: 0 } }
    const t = Math.min(1, (ms - Z1) / Z2), e = t * t * (3 - 2 * t);
    return { s: Math.pow(SF, e), u: e, rot: 0, star: e };
  }
  const disc = (x, y, r) => { X.beginPath(); X.arc(x, y, r, 0, TAU); X.fill() };
  const ball = (x, y, r, c0, c1, c2) => { const g = X.createRadialGradient(x - r * .4, y - r * .45, r * .1, x, y, r); g.addColorStop(0, c0); g.addColorStop(.65, c1); g.addColorStop(1, c2); X.fillStyle = g; disc(x, y, r) };
  const night = (x, y, r) => { const g = X.createRadialGradient(x - r * .5, y - r * .5, r * .45, x, y, r * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.62)'); X.fillStyle = g; disc(x, y, r) };
  const clipDisc = (x, y, r) => { X.save(); X.beginPath(); X.arc(x, y, r, 0, TAU); X.clip() };
  const bands = (x, y, r, cols) => { clipDisc(x, y, r); cols.forEach((c, i) => { X.fillStyle = c; X.fillRect(x - r, y + r * (-.95 + i * .26), 2 * r, r * .13) }); X.restore() };
  function drawPlanet(cx, cy, R) {
    if (R < 2 || cx + R < 0 || cx - R > W || cy + R < 0 || cy - R > H) return;
    let g = X.createRadialGradient(cx, cy, R * .97, cx, cy, R * 1.08); g.addColorStop(0, 'rgba(120,170,255,.55)'); g.addColorStop(1, 'rgba(120,170,255,0)'); X.fillStyle = g; disc(cx, cy, R * 1.08);
    ball(cx, cy, R, '#5f8dff', '#1f4fe0', '#06143d');
    clipDisc(cx, cy, R); X.fillStyle = 'rgba(255,255,255,.88)';
    LAND.forEach(([a, b, w, h, rot]) => { X.beginPath(); X.ellipse(cx + a * R, cy + b * R, w * R, h * R, rot, 0, TAU); X.fill() });
    X.restore(); night(cx, cy, R);
  }
  function drawBody(b, e, D) {
    const m = Math.min(W, H);
    if (b.k === 'comet') { // linear in elapsed time, streaking down and to the left
      const p = (e - b.t) / b.dur; if (p < 0 || p > 1) return;
      const x = b.x * W - p * .5 * W, y = -40 + p * (H + 80), vx = -.5 * W, vy = H + 80, vl = Math.hypot(vx, vy), tx = x - vx / vl * 260, ty = y - vy / vl * 260;
      const g = X.createLinearGradient(x, y, tx, ty); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      X.strokeStyle = g; X.lineWidth = 3; X.lineCap = 'round'; X.beginPath(); X.moveTo(x, y); X.lineTo(tx, ty); X.stroke();
      X.fillStyle = '#fff'; disc(x, y, 4); return;
    }
    const r = b.r * m, p = (D - (b.t - 2)) / b.dur; if (p < 0 || p > 1) return;
    const x = b.x * W, y = -r + p * (H + 2 * r);
    if (b.k === 'nebula') {
      let g = X.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(60,90,255,.16)'); g.addColorStop(1, 'rgba(60,90,255,0)'); X.fillStyle = g; disc(x, y, r);
      g = X.createRadialGradient(x - r * .5, y + r * .3, 0, x - r * .5, y + r * .3, r * .7); g.addColorStop(0, 'rgba(255,60,80,.11)'); g.addColorStop(1, 'rgba(255,60,80,0)'); X.fillStyle = g; disc(x - r * .5, y + r * .3, r * .7);
    } else if (b.k === 'moon') {
      ball(x, y, r, '#f0f0f0', '#a0a0a0', '#3c3c3c'); clipDisc(x, y, r); X.fillStyle = 'rgba(60,60,60,.35)';
      [[-.3, -.2, .18], [.25, .1, .22], [-.1, .45, .14], [.4, -.35, .12], [-.5, .3, .1], [.05, -.5, .09]].forEach(([a, c, q]) => disc(x + a * r, y + c * r, q * r)); X.restore(); night(x, y, r);
    } else if (b.k === 'mars') {
      ball(x, y, r, '#ffa070', '#c1440e', '#2e0e03'); clipDisc(x, y, r); X.fillStyle = 'rgba(255,255,255,.85)'; X.beginPath(); X.ellipse(x - r * .1, y - r * .86, r * .36, r * .13, 0, 0, TAU); X.fill();
      X.fillStyle = 'rgba(90,25,5,.35)'; [[-.3, .1, .3, .12], [.3, .35, .25, .1], [.1, -.3, .2, .08]].forEach(([a, c, w, h]) => { X.beginPath(); X.ellipse(x + a * r, y + c * r, w * r, h * r, .3, 0, TAU); X.fill() }); X.restore(); night(x, y, r);
    } else if (b.k === 'twins') { // a blue and a red world circling each other: a zero pair
      const a = e * .5, ox = Math.cos(a) * r * 1.25, oy = Math.sin(a) * r * .45, pair = [[x + ox, y + oy, '#a8c0ff', '#2f6bff', '#071a66'], [x - ox, y - oy, '#ffa8a8', '#e03a3a', '#5a0a0a']];
      if (oy > 0) pair.reverse(); pair.forEach(([px, py, c0, c1, c2]) => { ball(px, py, r, c0, c1, c2); night(px, py, r) });
    } else if (b.k === 'saturn') {
      const ring = back => { X.save(); X.translate(x, y); X.rotate(-.4); X.scale(1, .32); [[1.5, .1, 'rgba(235,215,165,.85)'], [1.78, .14, 'rgba(205,185,135,.7)'], [2.05, .08, 'rgba(235,215,165,.55)']].forEach(([k, w, c]) => { X.strokeStyle = c; X.lineWidth = w * r; X.beginPath(); X.arc(0, 0, k * r, back ? Math.PI : 0, back ? TAU : Math.PI); X.stroke() }); X.restore() };
      ring(true); ball(x, y, r, '#f6e6bd', '#cfa968', '#3a2a10'); bands(x, y, r, ['rgba(160,110,50,.25)', 'rgba(255,240,200,.22)', 'rgba(160,110,50,.25)', 'rgba(255,240,200,.2)', 'rgba(160,110,50,.22)']); night(x, y, r); ring(false);
    } else if (b.k === 'black') { // "pure black": a black world with a white rim and a thin tilted ring
      X.save(); X.shadowColor = 'rgba(255,255,255,.85)'; X.shadowBlur = r * .45; X.fillStyle = '#000'; disc(x, y, r); X.restore();
      X.fillStyle = '#000'; disc(x, y, r); X.strokeStyle = 'rgba(255,255,255,.9)'; X.lineWidth = 2; X.beginPath(); X.arc(x, y, r, 0, TAU); X.stroke();
      X.save(); X.translate(x, y); X.rotate(.35); X.scale(1, .22); [[1.7, .7], [2.05, .35]].forEach(([k, a]) => { X.strokeStyle = `rgba(255,255,255,${a})`; X.lineWidth = 2; X.beginPath(); X.arc(0, 0, k * r, 0, TAU); X.stroke() }); X.restore();
    } else if (b.k === 'jupiter') {
      ball(x, y, r, '#f6dcb4', '#c98b4a', '#2e1707'); bands(x, y, r, ['rgba(120,70,30,.3)', 'rgba(255,235,200,.25)', 'rgba(150,80,30,.35)', 'rgba(255,235,200,.22)', 'rgba(120,70,30,.3)', 'rgba(255,235,200,.2)', 'rgba(140,80,30,.3)']);
      clipDisc(x, y, r); X.fillStyle = '#b9381e'; X.beginPath(); X.ellipse(x + r * .32, y + r * .27, r * .2, r * .11, 0, 0, TAU); X.fill(); X.restore(); night(x, y, r);
    }
  }
  function frame() {
    spRaf = 0; if (!scene || !X) return;
    spRaf = requestAnimationFrame(frame);
    const c = camera(performance.now() - built), e = elapsed(), D = dist(e), shift = D * PUP;
    const Tx = c.u * (W / 2 - W + c.s * W / 2), Ty = c.u * ((PCY - PR) * H - H + c.s * H / 2) + shift;
    const tf = `translate(${Tx.toFixed(2)}px,${Ty.toFixed(2)}px) rotate(${c.rot.toFixed(3)}deg) scale(${c.s})`;
    if (tf !== lastTf) { lastTf = tf; worldEl.style.transform = tf }
    X.fillStyle = '#000'; X.fillRect(0, 0, W, H);
    if (c.star > 0) { stars.forEach(s => { X.globalAlpha = s.a * c.star; X.fillStyle = s.c; X.fillRect(s.x, (s.y + D * s.v) % H, s.r, s.r) }); X.globalAlpha = 1 }
    if (c.u > 0) { const Rw = PR * H / SF; drawPlanet(W + Tx + c.s * (W / 2 - W), H + Ty + c.s * (H / 2 + Rw - H), Rw * c.s) }
    if (!rm && c.u >= 1) BODIES.forEach(b => drawBody(b, e, D));
  }

  function build() {
    const deck = document.getElementById('deck'), P = past();
    deck.classList.add('ts-on');
    scene = el('', deck); scene.id = 'ts'; scene.style.setProperty('--z', Z);
    const sc = document.createElement('canvas'); sc.className = 'ts-space'; sc.width = innerWidth; sc.height = innerHeight; scene.appendChild(sc); spaceInit(sc);
    const world = el('ts-world'); worldEl = world; el('ts-grid', world);
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
    // the camera (frame) pulls back from the slide, to the whole field, to the whole planet; the timer shows once the field is in view
    rm = reduced(); built = performance.now(); lastTf = '';
    if (rm) scene.classList.add('in'); else setTimeout(() => scene && scene.classList.add('in'), 2600);
    spRaf = requestAnimationFrame(frame);
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
  function leave() { clearInterval(tick); cancelAnimationFrame(raf); cancelAnimationFrame(spRaf); spRaf = 0; X = null; worldEl = null; ctx = null; running = false; base = 0; shown = 0; played = false; locked = false; released = false; leaving = false; if (scene) { const v = scene.querySelector('video'); v && v.pause(); scene.remove(); scene = null } document.getElementById('deck').classList.remove('ts-on') }

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
