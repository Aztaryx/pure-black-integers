/* Timer scene for beat 8.3a. Loaded after script.js; wraps renderDeck, deckNext and deckBack. Times below are elapsed seconds. */
(() => {
  const TOTAL = 300, LOCK = 120, BLACK = 141, VIDEO = 142, COLS = 32, ROWS = 18;
  let scene, tick = 0, t0 = 0, base = 0, running = false, played = false, locked = false, released = false, order = [], shown = 0;
  const el = (c, p, h) => { const e = document.createElement('div'); e.className = c; if (h) e.innerHTML = h; (p || scene).appendChild(e); return e };
  const fmt = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  const elapsed = () => base + (running ? (performance.now() - t0) / 1000 : 0);
  const past = () => BEATS.slice(0, deckIndex).filter(b => b.html && !/timer/.test(b.html));

  function build() {
    const deck = document.getElementById('deck'), P = past();
    deck.classList.add('ts-on');
    scene = el('', deck); scene.id = 'ts';
    const world = el('ts-world');
    // every window shows an earlier slide, inverted: the slide we came from first, the rest shuffled
    const pool = P.slice(0, -1).sort(() => Math.random() - .5); if (P.length) pool.unshift(P[P.length - 1]);
    // windows are weighted to the two sides (the middle stays free for the timer) and keep drifting and swaying
    for (let i = 0; i < 12; i++) {
      const w = 8 + Math.random() * 18, h = 14 + Math.random() * 34, s = Math.max(w, h) / 100 + .04 + Math.random() * .12;
      const win = el('ts-win', world), left = i % 2 ? 1 + Math.random() * (32 - w) : 67 + Math.random() * (32 - w);
      win.style.cssText += `left:${left}vw;top:${-6 + Math.random() * (112 - h)}vh;width:${w}vw;height:${h}vh;--a:${-4 - Math.random() * 8}vh;--b:${4 + Math.random() * 8}vh;--sx:${(Math.random() - .5) * 3}vw;--d:${12 + Math.random() * 16}s;--dl:${-Math.random() * 20}s`;
      if (!pool.length) continue;
      const c = el('ts-clone', win, pool[i % pool.length].html);
      c.style.transform = `scale(${s})`; c.style.left = -Math.random() * Math.random() * Math.max(0, 100 * s - w) + 'vw'; c.style.top = -Math.random() * Math.random() * Math.max(0, 100 * s - h) + 'vh';
      c.querySelectorAll('[data-step]').forEach(e => e.classList.add('shown')); c.querySelectorAll('[data-hide]').forEach(e => e.classList.add('gone')); c.querySelectorAll('[data-on]').forEach(e => e.classList.add('on'));
    }
    el('ts-black'); el('ts-time').textContent = fmt(TOTAL);
    const v = document.createElement('video'); v.src = 'test.mp4'; v.playsInline = true; v.preload = 'auto'; scene.appendChild(v);
    // the video stays on screen until it ends (its last frame is black); then the slide is released
    v.onended = () => { released = true; locked = false; scene.classList.remove('locked') };
    const ctl = el('ts-ctl', null, '<button data-a="back">Back</button><button data-a="start">Start</button><button data-a="pause">Pause</button><button data-a="reset">Reset</button><button data-a="next">Next</button>');
    ctl.onclick = e => { const a = e.target.dataset.a; if (!a || locked) return; if (a === 'start') start(); else if (a === 'pause') stop(); else if (a === 'reset') reset(); else if (a === 'next') orig.deckNext(); else orig.deckBack() };
    scene.onclick = e => e.stopPropagation();
    // the black flood: cells die one by one from the bottom row up, with a ragged front (about 3 rows deep)
    order = Array.from({ length: COLS * ROWS }, (_, i) => [i, ROWS - 1 - Math.floor(i / COLS) + Math.random() * 3]).sort((a, b) => a[1] - b[1]).map(a => a[0]);
    scene.classList.add('in');
  }
  function paint() {
    const e = elapsed(), left = Math.max(0, Math.ceil(TOTAL - e));
    scene.querySelector('.ts-time').textContent = left > 0 ? fmt(left) : 'Time\u2019s up!';
    if (e >= LOCK && !locked && !released) { locked = true; scene.classList.add('locked') }
    const want = Math.min(order.length, Math.floor(e / BLACK * order.length));
    while (shown < want) { const k = order[shown++], q = el('ts-sq'); q.style.cssText += `left:${(k % COLS) * 100 / COLS}vw;top:${Math.floor(k / COLS) * 100 / ROWS}vh;width:${100 / COLS + .1}vw;height:${100 / ROWS + .1}vh;`; scene.insertBefore(q, scene.querySelector('.ts-black')) }
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
