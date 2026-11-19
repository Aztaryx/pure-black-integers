/* Timer scene for beat 8.3a. Loaded after script.js; wraps renderDeck, deckNext and deckBack. Times below are elapsed seconds. */
(() => {
  const TOTAL = 300, LOCK = 120, BLACK = 141, VIDEO = 142, Z = 40, COLS = 24, ROWS = 14;
  let scene, tick = 0, t0 = 0, base = 0, running = false, played = false, locked = false, released = false, order = [], shown = 0;
  const el = (c, p, h) => { const e = document.createElement('div'); e.className = c; if (h) e.innerHTML = h; (p || scene).appendChild(e); return e };
  const fmt = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  const elapsed = () => base + (running ? (performance.now() - t0) / 1000 : 0);
  const clone = (p, html, w, h) => { const c = el('ts-clone', p, html); c.style.transform = `scale(${w / innerWidth},${h / innerHeight})`; c.style.transformOrigin = '0 0'; return c };
  const past = () => BEATS.slice(0, deckIndex).filter(b => b.html && !/timer/.test(b.html));

  function build() {
    const deck = document.getElementById('deck'), P = past();
    deck.classList.add('ts-on');
    scene = el('', deck); scene.id = 'ts'; scene.style.setProperty('--z', Z);
    const world = el('ts-world');
    // the slide we came from becomes the small window at the center
    const main = el('ts-win ts-main', world); const prev = P[P.length - 1];
    if (prev) clone(main, prev.html, innerWidth / Z, innerHeight / Z);
    // drifting windows; the big ones carry inverted past slides, the rest are plain
    for (let i = 0; i < 16; i++) {
      const big = i < 5, w = big ? 14 + Math.random() * 12 : .6 + Math.random() * 2, h = big ? 34 + Math.random() * 22 : 3 + Math.random() * 9;
      const win = el('ts-win' + (big ? '' : ' plain'), world);
      win.style.cssText += `left:${Math.random() * (100 - w)}vw;top:${Math.random() * (100 - h)}vh;width:${w}vw;height:${h}vh;--d:${28 + Math.random() * 30}s;--dl:${-Math.random() * 30}s`;
      if (big && P.length) { const c = clone(win, P[Math.floor(Math.random() * P.length)].html, innerWidth * .35, innerHeight * .35); c.style.left = -Math.random() * 40 + 'vw'; c.style.top = -Math.random() * 30 + 'vh' }
    }
    el('ts-black'); el('ts-time').textContent = fmt(TOTAL);
    const v = document.createElement('video'); v.src = 'test.mp4'; v.playsInline = true; v.preload = 'auto'; scene.appendChild(v);
    // the video stays on screen until it ends (its last frame is black); then the slide is released
    v.onended = () => { released = true; locked = false; scene.classList.remove('locked') };
    const ctl = el('ts-ctl', null, '<button data-a="back">Back</button><button data-a="start">Start</button><button data-a="pause">Pause</button><button data-a="reset">Reset</button><button data-a="next">Next</button>');
    ctl.onclick = e => { const a = e.target.dataset.a; if (!a || locked) return; if (a === 'start') start(); else if (a === 'pause') stop(); else if (a === 'reset') reset(); else if (a === 'next') orig.deckNext(); else orig.deckBack() };
    scene.onclick = e => e.stopPropagation();
    order = Array.from({ length: COLS * ROWS }, (_, i) => i).sort(() => Math.random() - .5);
    // zoom out: scale falls exponentially from Z to 1 (a long pull-back), then the timer appears
    if (!matchMedia('(prefers-reduced-motion:reduce)').matches) {
      const n = 48, kf = Array.from({ length: n + 1 }, (_, i) => { const t = i / n, e = 1 - Math.pow(1 - t, 2.2); return { transform: `scale(${Math.pow(Z, 1 - e).toFixed(4)})` } });
      world.animate(kf, { duration: 4200, easing: 'linear' });
      setTimeout(() => scene && scene.classList.add('in'), 2600);
    } else scene.classList.add('in');
  }
  function paint() {
    const e = elapsed(), left = Math.max(0, Math.ceil(TOTAL - e));
    scene.querySelector('.ts-time').textContent = left > 0 ? fmt(left) : 'Time\u2019s up!';
    if (e >= LOCK && !locked && !released) { locked = true; scene.classList.add('locked') }
    const want = Math.min(order.length, Math.floor(e / BLACK * order.length));
    while (shown < want) { const k = order[shown++], q = el('ts-sq'); q.style.cssText += `left:${(k % COLS) * 100 / COLS}vw;top:${Math.floor(k / COLS) * 100 / ROWS}vh;width:${100 / COLS + .1}vw;height:${100 / ROWS + .1}vh;animation-delay:${Math.random() * .2}s`; scene.insertBefore(q, scene.querySelector('.ts-black')) }
    if (e >= BLACK) scene.classList.add('black');
    if (e >= VIDEO && !played) { played = true; const v = scene.querySelector('video'); v.classList.add('on'); v.play().catch(() => {}) }
    if (left <= 0) stop();
  }
  function start() { if (running) return; running = true; t0 = performance.now(); tick = setInterval(paint, 200) }
  function stop() { if (!running) return; base = elapsed(); running = false; clearInterval(tick) }
  function reset() { stop(); base = 0; shown = 0; played = false; released = false; scene.classList.remove('black'); scene.querySelectorAll('.ts-sq').forEach(q => q.remove()); const v = scene.querySelector('video'); v.pause(); v.currentTime = 0; v.classList.remove('on'); paint() }
  function leave() { clearInterval(tick); running = false; base = 0; shown = 0; played = false; locked = false; released = false; if (scene) { const v = scene.querySelector('video'); v && v.pause(); scene.remove(); scene = null } document.getElementById('deck').classList.remove('ts-on') }

  const orig = { renderDeck, deckNext, deckBack };
  renderDeck = function (full) {
    leave(); orig.renderDeck(full);
    if (BEATS[deckIndex] && BEATS[deckIndex].beat === '8.3a') build();
  };
  deckNext = function () { if (!locked) orig.deckNext() };
  deckBack = function () { if (!locked) orig.deckBack() };
})();
