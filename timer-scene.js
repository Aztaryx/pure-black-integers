/* Timer scene for beat 8.3a. Loaded after script.js; wraps renderDeck, deckNext and deckBack. Times below are elapsed seconds. */
(() => {
  const TOTAL = 300, LOCK = 120, VIDEO = 142;
  let scene, worldEl, X, W = 0, H = 0, stars = [], spRaf = 0, built = 0, rm = false, lastTf = '', tick = 0, t0 = 0, base = 0, running = false, played = false, locked = false, released = false, leaving = false;
  const el = (c, p, h) => { const e = document.createElement('div'); e.className = c; if (h) e.innerHTML = h; (p || scene).appendChild(e); return e };
  const fmt = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  const elapsed = () => base + (running ? (performance.now() - t0) / 1000 : 0);
  const past = () => BEATS.slice(0, deckIndex).filter(b => b.html && !/timer/.test(b.html));

  const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
  const prep = c => { c.querySelectorAll('[data-step]').forEach(e => e.classList.add('shown')); c.querySelectorAll('[data-hide]').forEach(e => e.classList.add('gone')); c.querySelectorAll('[data-on]').forEach(e => e.classList.add('on')) };
  const rnd = (a, b) => a + Math.random() * (b - a);
  // triple helix (barber-pole spiral): three strands 120 degrees apart, one turn per 4000 units (four screen heights), so the waves are very long and slow.
  // Segments facing us are thicker and brighter, the ones behind fainter (the 3D look). It repeats every 4000 units so it can loop upward.
  const helix = () => { let o = ''; for (let k = 0; k < 3; k++) for (let y = 0; y < 5000; y += 20) { const ph = 2 * Math.PI * k / 3, z = (Math.cos(2 * Math.PI * (y + 10) / 4000 + ph) + 1) / 2, x1 = 150 + 120 * Math.sin(2 * Math.PI * y / 4000 + ph), x2 = 150 + 120 * Math.sin(2 * Math.PI * (y + 20) / 4000 + ph); o += `<line x1="${x1.toFixed(1)}" y1="${y}" x2="${x2.toFixed(1)}" y2="${y + 20}" stroke-width="${(.8 + 3.2 * z).toFixed(2)}" stroke-opacity="${(.12 + .7 * z).toFixed(2)}"/>` } return o };
  // The clock: each character that changes rolls up into place; the colon blinks while the timer runs.
  let clockStr = '';
  function clock(str, all) {
    const box = scene && scene.querySelector('.ts-time'); if (!box || (str === clockStr && !all)) return;
    const prev = clockStr; clockStr = str;
    box.innerHTML = [...str].map((c, i) => `<span class="${c === ':' ? 'colon' : 'dg'}${all || c !== prev[i] ? ' roll' : ''}"${all ? ` style="animation-delay:${i * 90}ms"` : ''}>${c}</span>`).join('');
  }

  // ---- space: the view keeps pulling back until the slide is a speck on a planet; once the timer runs we ascend through the void ----
  // Camera (JS, not CSS): the slide we came from pulls back about 80x while sliding onto the planet's top edge, so it ends as a speck on the planet.
  const TAU = Math.PI * 2, ZT = 7000, SF = .012, PR = .27, PCY = .6, PUP = 40;
  const dist = t => (t < 4 ? t * t / 8 : t - 2); // ascent distance in seconds of cruise: eases in over 4 s, then constant
  // Bodies we pass, in order. t: ascent second when the top edge enters; x: horizontal position; r: radius as a share of the short side; dur: seconds to cross.
  const BODIES = [
    { k: 'nebula', t: 38, x: .55, r: .6, dur: 80 },
    { k: 'moon', t: 8, x: .78, r: .085, dur: 17 },
    { k: 'comet', t: 22, x: .92, dur: 3.2 },
    { k: 'mars', t: 30, x: .2, r: .11, dur: 20 },
    { k: 'dance', t: 52, x: .98, r: .055, dur: 13 },
    { k: 'saturn', t: 72, x: .24, r: .14, dur: 28 },
    { k: 'black', t: 96, x: .72, r: .12, dur: 25 },
    { k: 'jupiter', t: 110, x: .3, r: .2, dur: 32 }
  ];
  // Stars: SN0 are there from the start; the rest appear one by one as we climb, faster and faster (the count grows with the square of the distance),
  // so by SDEND seconds of ascent there are SN1. Each star twinkles at its own rate.
  const SN0 = 110, SN1 = 1100, SDEND = 140;
  function spaceInit(cv) {
    X = cv.getContext('2d'); W = cv.width; H = cv.height;
    // three layers: far ones drift slowly, near ones faster (parallax); a few are blue or red
    const L = [[.6, 1, 14], [.9, 1.5, 32], [1.3, 2.1, 70]];
    stars = Array.from({ length: SN1 }, (_, i) => { const l = L[Math.random() < .55 ? 0 : Math.random() < .6 ? 1 : 2]; return { x: Math.random() * W, y: Math.random() * H, r: rnd(l[0], l[1]), a: rnd(.45, 1), v: l[2], w: rnd(.8, 3.4), p: rnd(0, TAU), k: rnd(.3, .75), b: i < SN0 ? 0 : SDEND * Math.sqrt((i - SN0) / (SN1 - SN0)), c: Math.random() < .08 ? (Math.random() < .5 ? '#7fa2ff' : '#ff8a8a') : '#fff' } });
  }
  function camera(ms) {
    if (rm) return { s: SF, u: 1, star: 1 };
    const t = Math.min(1, ms / ZT), e = t * t * (3 - 2 * t);
    return { s: Math.pow(SF, e), u: e, star: Math.min(1, e * 1.6) };
  }
  const disc = (x, y, r) => { X.beginPath(); X.arc(x, y, r, 0, TAU); X.fill() };
  const ball = (x, y, r, c0, c1, c2) => { const g = X.createRadialGradient(x - r * .4, y - r * .45, r * .1, x, y, r); g.addColorStop(0, c0); g.addColorStop(.65, c1); g.addColorStop(1, c2); X.fillStyle = g; disc(x, y, r) };
  const night = (x, y, r) => { const g = X.createRadialGradient(x - r * .5, y - r * .5, r * .45, x, y, r * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.62)'); X.fillStyle = g; disc(x, y, r) };
  const clipDisc = (x, y, r) => { X.save(); X.beginPath(); X.arc(x, y, r, 0, TAU); X.clip() };
  const bands = (x, y, r, cols) => { clipDisc(x, y, r); cols.forEach((c, i) => { X.fillStyle = c; X.fillRect(x - r, y + r * (-.95 + i * .26), 2 * r, r * .13) }); X.restore() };
  // ---- Earth: coarse real coastlines (lon, lat) painted on a 1024x512 map, then wrapped on a sphere centred over the Philippines and lit from the upper left ----
  const COAST = {
    eurasia: [[-9,37],[-9.5,43.5],[-1.5,43.5],[-4.5,48.5],[-1,50],[2,51],[5,53.5],[8.5,54],[8,57],[10.5,57.5],[12,54.5],[20,54.5],[22,57],[24,59.5],[30,60],[22,60.5],[21.5,65],[25,65.5],[17,62],[18.5,60],[16,56],[12.5,56],[10.5,59],[5.5,58.5],[5,62],[14,67.5],[22,70],[30,70.5],[40,67.5],[44,68.5],[60,69],[68,72.5],[80,73],[90,75.5],[105,77.5],[113,74],[130,71],[142,72.5],[160,69.5],[180,68],[180,65],[163,60],[156,51],[150,59],[142,59],[137,54],[141,52],[140,48],[133,43],[130,42.5],[129.5,36],[126.5,34.5],[126,38],[124.5,40],[121.5,39.5],[119,39],[122,37],[119.5,35],[121.5,32],[122,29.5],[120,26],[117,23],[110.5,21],[108,21.5],[106,19],[108.5,15],[109,12],[105,8.5],[104.5,10.5],[100.5,13.5],[99.5,10],[100.5,6.5],[103.5,1.5],[101,3],[98.5,8],[98.5,13.5],[97,17],[94.5,16],[94,19],[91.5,22.5],[88,21.5],[86.5,20],[80.5,15.5],[80,10],[77.5,8],[76,11],[73,17],[72.8,21],[68.5,23.5],[66.5,25.5],[61.5,25],[57,26.5],[56,27],[52,28],[50,30],[48,30],[50,26],[51.5,24.5],[56,24.5],[56.5,26],[59.5,22.5],[57.5,19],[52,16],[45,13],[43,13],[39,21],[35,28.5],[34,31],[36,36],[30,36.5],[27,37],[26.5,40],[23,36.5],[22,40],[19.5,42],[16,44],[13.5,45.5],[12.5,44],[18.5,40],[16,38],[15.7,38],[12.5,41.5],[10,44],[8,44],[3.5,43.3],[3,42],[0,39],[-2,36.8],[-5.5,36]],
    africa: [[-17,21],[-17,15],[-12,13],[-8,5],[-1,5],[9,4],[9,-1],[13,-6],[13,-12],[12,-18],[15,-27],[18,-34],[26,-34],[32,-28],[35,-22],[40,-16],[40,-10],[39,-5],[42,0],[51,12],[43,12],[37,20],[33,28],[32,31],[25,32],[20,31],[10,34],[10,37],[-2,35],[-9,31],[-13,27]],
    americas: [[-168,66],[-166,68.5],[-156,71.3],[-140,69.7],[-125,70],[-115,68.5],[-95,68],[-90,69],[-82,69.5],[-88,64],[-95,61.5],[-93,58],[-85,55.5],[-82,53],[-79,51.5],[-78,56],[-77,60],[-69,59],[-65,60.5],[-61.5,56],[-56,52],[-60,50],[-65,48.5],[-64,45.5],[-70,43.5],[-70,41.8],[-74,40.5],[-76,37],[-76,35],[-81,31.5],[-80,26.5],[-81.5,25.2],[-83,29],[-85,29.8],[-89,30.2],[-91,29],[-94,29.5],[-97.4,27],[-97.8,22],[-97,19],[-94.5,18.2],[-91,18.8],[-90.5,21],[-87,21.5],[-88,18],[-88.5,15.8],[-83.5,15],[-83.5,11],[-81.5,8.5],[-79,9.5],[-77.3,8.7],[-76,9.5],[-72,12],[-68,10.7],[-62,10.5],[-60,8.5],[-57,6],[-52,5],[-50,1.5],[-48,-1],[-44,-2.5],[-40,-3],[-35,-5],[-35,-9],[-39,-13.5],[-39,-18],[-41,-22],[-45,-23.5],[-48.5,-26],[-48.5,-28.5],[-53,-34],[-57,-34.8],[-58,-38],[-62,-39],[-65,-41],[-64,-43],[-66,-46],[-68,-50],[-68.5,-53],[-70,-54],[-74,-52],[-75,-46],[-73.5,-39],[-71.5,-30],[-70.5,-22],[-70,-18.5],[-76,-14],[-79,-8],[-81,-5],[-80,-1],[-80,1.5],[-78,2.5],[-77.5,6.5],[-79.5,8.5],[-83,8],[-86,11],[-88,13],[-92,14.5],[-95,16],[-98,16],[-103,18.5],[-105.5,20.5],[-105.5,23],[-109,25.5],[-112,28],[-114.7,31.7],[-117,32.5],[-120.5,34.5],[-124,40],[-124,46],[-125,49],[-130,54],[-133,57],[-138,59],[-146,61],[-152,59.5],[-158,56.5],[-164,54.5],[-157,58.5],[-162,60],[-165,62.5],[-161,64.5]],
    australia: [[114,-22],[114,-26],[115,-34],[118,-35],[123,-34],[129,-31.5],[135,-34.5],[138,-35],[140,-38],[146,-39],[150,-37],[153,-31],[153,-25],[146,-19],[145,-15],[142,-10.5],[141,-17],[136,-12],[131,-11.5],[126,-14],[122,-17],[117,-20.5]],
    newguinea: [[131,-1],[135,-3],[141,-2.5],[147,-6],[150,-10],[142,-9.5],[138,-8],[134,-4]],
    borneo: [[109,1.5],[110,-1.5],[111,-3],[114.5,-4],[116.5,-3],[117.5,0],[119,5],[117,7],[115,5],[111,2]],
    sumatra: [[95,5.5],[98,4],[104,-1],[106,-3],[105,-5.8],[102,-4],[98,0],[96,3]],
    java: [[105.5,-6.5],[108,-6],[114,-7],[114.5,-8.5],[109,-8],[106,-7.5]],
    sulawesi: [[119.5,-5],[120,0.5],[125,1.5],[123,-1],[122,-4.5],[121,-3],[120,-1]],
    luzon: [[119.8,16],[120.5,18.5],[122.2,18.4],[122.2,16.5],[121.6,14.5],[124,13],[123.5,12.5],[121,13.8],[120,14.2]],
    mindanao: [[122,7],[123.5,8.5],[125.5,9.8],[126.5,7],[126,6],[124,6],[122.5,6]],
    visayas: [[122,10],[123,11.5],[125,11],[125.3,9.8],[123.5,9.2]],
    palawan: [[117,8.5],[119.5,11.5],[119,11.8],[117,9]],
    taiwan: [[120,22],[122,25],[121.5,25.3],[120,23.5]],
    honshu: [[130.5,31],[132,34],[135,34],[140,35.5],[142,40],[141,41.5],[140,40],[137,37],[133,35.5],[130.5,33.5]],
    hokkaido: [[140,42],[145,43],[143,45],[141.5,45]],
    srilanka: [[79.8,6],[81.8,7.5],[80,9.8],[79.8,8]],
    madagascar: [[44,-25],[47,-25],[50,-15],[49.5,-12],[47,-15],[44,-20]],
    britain: [[-5,50],[1.5,51],[1.5,53],[-0.5,55],[-2,57.5],[-4,58.5],[-6,57],[-3,55],[-4.5,53.5],[-5,51.5]],
    ireland: [[-10,52],[-6,52],[-6,55],[-9,54.5]],
    iceland: [[-24,64],[-14,64.5],[-14,66],[-22,66.5]],
    cuba: [[-85,22],[-80,23],[-74,20],[-78,20],[-82,22.5]],
    nz: [[172.5,-34.5],[178,-38],[175,-41.5],[174,-39]],
    nz2: [[172,-41],[174,-41.5],[170,-46],[167,-46]]
  };
  const GREENLAND = [[-73,78],[-60,82],[-30,83.5],[-20,80],[-20,70],[-25,68],[-43,60],[-50,64],[-55,70],[-68,76]];
  const SEAS = [[[28,41.5],[41.5,41.3],[41.5,43.5],[37,45],[33,46],[30,45.5],[28.5,44]], [[47,45],[53,45],[53.5,40],[49,37],[49,40]]]; // Black Sea, Caspian
  const DESERTS = [[[-12,18],[35,18],[35,30],[10,32],[-12,28]], [[36,17],[55,17],[57,23],[52,28],[37,29]], [[90,38],[115,38],[115,46],[95,45]], [[124,-22],[142,-22],[140,-30],[125,-30]], [[15,-18],[25,-18],[25,-27],[15,-27]]];
  let earthImg = null;
  function makeEarth() {
    if (earthImg) return earthImg;
    const TW = 1024, TH = 512, t = document.createElement('canvas'); t.width = TW; t.height = TH;
    const g = t.getContext('2d'), P = pts => { g.beginPath(); pts.forEach(([lo, la], i) => { const x = (lo + 180) / 360 * TW, y = (90 - la) / 180 * TH; i ? g.lineTo(x, y) : g.moveTo(x, y) }); g.closePath() };
    let gr = g.createLinearGradient(0, 0, 0, TH); gr.addColorStop(0, '#0a2a5e'); gr.addColorStop(.5, '#0f4aa8'); gr.addColorStop(1, '#0a2a5e'); g.fillStyle = gr; g.fillRect(0, 0, TW, TH);
    g.strokeStyle = 'rgba(90,180,235,.45)'; g.lineWidth = 5; g.lineJoin = 'round'; Object.values(COAST).forEach(p => { P(p); g.stroke() }); // shallow water along the coasts
    gr = g.createLinearGradient(0, 0, 0, TH); [[0, '#e8eef2'], [.1, '#9aa58f'], [.22, '#5a7a4a'], [.34, '#4f8a3a'], [.5, '#2d7a34'], [.66, '#4f8a3a'], [.8, '#5b8a40'], [.92, '#aab59f'], [1, '#eef4f7']].forEach(([o, c]) => gr.addColorStop(o, c));
    g.fillStyle = gr; Object.values(COAST).forEach(p => { P(p); g.fill() });
    g.fillStyle = 'rgba(208,178,108,.8)'; DESERTS.forEach(p => { P(p); g.fill() });
    g.fillStyle = '#0d3f94'; SEAS.forEach(p => { P(p); g.fill() });
    g.fillStyle = '#eef4f7'; P(GREENLAND); g.fill(); g.fillRect(0, (90 + 68) / 180 * TH, TW, TH); // Greenland and Antarctica
    g.fillStyle = 'rgba(240,246,250,.9)'; g.fillRect(0, 0, TW, (90 - 82) / 180 * TH); // Arctic ice
    for (let i = 0; i < 90; i++) { // soft cloud banks
      const la = (Math.random() < .5 ? rnd(-12, 12) : rnd(25, 65) * (Math.random() < .5 ? 1 : -1)), x = Math.random() * TW, y = (90 - la) / 180 * TH, w = rnd(30, 120), c = g.createRadialGradient(x, y, 0, x, y, w);
      c.addColorStop(0, `rgba(255,255,255,${rnd(.3, .6).toFixed(2)})`); c.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = c; g.save(); g.translate(x, y); g.scale(1, rnd(.25, .45)); g.translate(-x, -y); g.beginPath(); g.arc(x, y, w, 0, TAU); g.fill(); g.restore();
    }
    const D = 512, out = document.createElement('canvas'); out.width = out.height = D;
    const oc = out.getContext('2d'), tex = g.getImageData(0, 0, TW, TH).data, img = oc.createImageData(D, D), px = img.data, f0 = 12 * Math.PI / 180, l0 = 118 * Math.PI / 180, sf = Math.sin(f0), cf = Math.cos(f0), Ll = Math.hypot(-.55, .5, .67);
    for (let j = 0; j < D; j++) for (let i = 0; i < D; i++) {
      const nx = (i + .5 - D / 2) / (D / 2), yu = -(j + .5 - D / 2) / (D / 2), rr = nx * nx + yu * yu; if (rr >= 1) continue;
      const z = Math.sqrt(1 - rr), phi = Math.asin(Math.max(-1, Math.min(1, z * sf + yu * cf))), lam = l0 + Math.atan2(nx, z * cf - yu * sf);
      let u = (lam / TAU + .5) % 1; if (u < 0) u += 1;
      const k = (Math.min(TH - 1, Math.floor((.5 - phi / Math.PI) * TH)) * TW + Math.min(TW - 1, Math.floor(u * TW))) * 4;
      const lit = Math.max(0, (-.55 * nx + .5 * yu + .67 * z) / Ll), sh = (.16 + .9 * Math.pow(lit, .85)) * (.55 + .45 * Math.pow(z, .35)), o = (j * D + i) * 4;
      px[o] = Math.min(255, tex[k] * sh); px[o + 1] = Math.min(255, tex[k + 1] * sh); px[o + 2] = Math.min(255, tex[k + 2] * sh); px[o + 3] = 255 * Math.min(1, (1 - Math.sqrt(rr)) * D / 2);
    }
    oc.putImageData(img, 0, 0); earthImg = out; return out;
  }
  function drawPlanet(cx, cy, R) {
    if (R < 2 || cx + R < 0 || cx - R > W || cy + R < 0 || cy - R > H) return;
    const g = X.createRadialGradient(cx, cy, R * .97, cx, cy, R * 1.09); g.addColorStop(0, 'rgba(120,180,255,.6)'); g.addColorStop(1, 'rgba(120,180,255,0)'); X.fillStyle = g; disc(cx, cy, R * 1.09); // atmosphere
    const img = makeEarth(), x0 = Math.max(0, cx - R), x1 = Math.min(W, cx + R), y0 = Math.max(0, cy - R), y1 = Math.min(H, cy + R), k = img.width / (2 * R);
    X.drawImage(img, (x0 - (cx - R)) * k, (y0 - (cy - R)) * k, (x1 - x0) * k, (y1 - y0) * k, x0, y0, x1 - x0, y1 - y0);
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
    } else if (b.k === 'dance') { // fire and ice: the two planets take turns as the pivot, each swinging 180 degrees round the other, so the pair walks across the sky
      const d = 2.5 * r, te = p * b.dur, n = Math.floor(te), a = Math.PI * (te - n), px = b.x * W - n * d, mov = [px + d * Math.cos(a), y - d * Math.sin(a)], T = performance.now() / 1000;
      const ice = n % 2 ? mov : [px, y], fire = n % 2 ? [px, y] : mov;
      X.save(); X.setLineDash([6, 9]); X.strokeStyle = 'rgba(255,255,255,.14)'; X.lineWidth = 2; X.beginPath(); X.arc(px, y, d, 0, TAU); X.stroke(); X.restore(); // the orbit
      X.save(); X.strokeStyle = n % 2 ? 'rgba(255,150,60,.5)' : 'rgba(120,220,255,.5)'; X.lineWidth = 4; X.lineCap = 'round'; X.beginPath(); X.arc(px, y, d, -Math.max(0, a - 1.7), -a, true); X.stroke(); X.restore(); // the mover's trail
      X.save(); X.strokeStyle = 'rgba(255,255,255,.55)'; X.lineWidth = 2; X.beginPath(); X.arc(px, y, r * 1.35, 0, TAU); X.stroke(); X.restore(); // ring on the pivot
      let g = X.createRadialGradient(ice[0], ice[1], r * .9, ice[0], ice[1], r * 1.7); g.addColorStop(0, 'rgba(140,225,255,.4)'); g.addColorStop(1, 'rgba(140,225,255,0)'); X.fillStyle = g; disc(ice[0], ice[1], r * 1.7);
      ball(ice[0], ice[1], r, '#f2fdff', '#69cdf7', '#0b4a7a'); clipDisc(ice[0], ice[1], r); X.strokeStyle = 'rgba(255,255,255,.65)'; X.lineWidth = 1.5;
      [[-.5, -.2, .4, .45], [.1, .3, .55, .1], [-.1, -.5, .3, -.2]].forEach(([a1, b1, c1, d1]) => { X.beginPath(); X.moveTo(ice[0] + a1 * r, ice[1] + b1 * r); X.lineTo(ice[0] + c1 * r, ice[1] + d1 * r); X.stroke() }); X.restore(); night(ice[0], ice[1], r);
      const fl = 1 + .12 * Math.sin(T * 9); g = X.createRadialGradient(fire[0], fire[1], r * .8, fire[0], fire[1], r * 1.9 * fl); g.addColorStop(0, 'rgba(255,140,40,.55)'); g.addColorStop(1, 'rgba(255,90,20,0)'); X.fillStyle = g; disc(fire[0], fire[1], r * 1.9 * fl);
      ball(fire[0], fire[1], r, '#fff3b0', '#ff7a1a', '#6d0b00'); clipDisc(fire[0], fire[1], r); X.strokeStyle = 'rgba(255,225,120,.7)'; X.lineWidth = 1.5;
      [[-.45, -.1, .1, .35], [.15, -.5, .4, .1], [-.2, .5, .5, .3]].forEach(([a1, b1, c1, d1]) => { X.beginPath(); X.moveTo(fire[0] + a1 * r, fire[1] + b1 * r); X.lineTo(fire[0] + c1 * r, fire[1] + d1 * r); X.stroke() }); X.restore(); night(fire[0], fire[1], r);
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
    const tf = `translate(${Tx.toFixed(2)}px,${Ty.toFixed(2)}px) scale(${c.s})`;
    if (tf !== lastTf) { lastTf = tf; worldEl.style.transform = tf }
    const dv = Math.min(1, Math.max(0, (c.u - .1) / .6)), f = dv * dv * (3 - 2 * dv); // the panel dissolves as it zooms out
    worldEl.style.opacity = (1 - f).toFixed(3); worldEl.style.visibility = f >= 1 ? 'hidden' : '';
    X.fillStyle = '#000'; X.fillRect(0, 0, W, H);
    if (c.star > 0) {
      const T = performance.now() / 1000;
      stars.forEach(s => {
        const age = D - s.b; if (!rm && age < 0) return;
        const tw = rm ? 1 : 1 - s.k * (.5 + .5 * Math.sin(T * s.w + s.p)), al = s.a * c.star * tw * (rm ? 1 : Math.min(1, age / 1.2)), y = (s.y + D * s.v) % H;
        X.globalAlpha = al; X.fillStyle = s.c; X.fillRect(s.x, y, s.r, s.r);
        if (!rm && s.r > 1.5 && tw > .85) { X.globalAlpha = al * .5; X.fillRect(s.x - s.r * 1.6, y + s.r * .4, s.r * 4.2, s.r * .25); X.fillRect(s.x + s.r * .4, y - s.r * 1.6, s.r * .25, s.r * 4.2) } // sparkle at the brightest moment
      });
      X.globalAlpha = 1;
    }
    if (c.u > 0) { const Rw = PR * H / SF; drawPlanet(W + Tx + c.s * (W / 2 - W), H + Ty + c.s * (H / 2 + Rw - H), Rw * c.s) }
    if (!rm && c.u >= 1) BODIES.forEach(b => drawBody(b, e, D));
  }

  function build() {
    const deck = document.getElementById('deck'), P = past();
    deck.classList.add('ts-on');
    scene = el('', deck); scene.id = 'ts';
    const sc = document.createElement('canvas'); sc.className = 'ts-space'; sc.width = innerWidth; sc.height = innerHeight; scene.appendChild(sc); spaceInit(sc);
    // the slide we came from (all its steps shown) pulls back and dissolves as it goes, revealing the planet behind it
    const world = el('ts-world'); worldEl = world;
    if (P.length) { const c = el('ts-clone', world, P[P.length - 1].html); prep(c) }
    scene.insertAdjacentHTML('beforeend', `<svg class="ts-waves" viewBox="0 0 300 1000" preserveAspectRatio="none" aria-hidden="true"><g style="animation-delay:-${Math.floor(Math.random() * 180)}s">${helix()}</g></svg>`);
    el('ts-time');
    const v = document.createElement('video'); v.src = 'test.mp4'; v.playsInline = true; v.preload = 'auto'; scene.appendChild(v);
    // the video stays on screen until it ends (its last frame is black); then the slide is released
    const release = () => { released = true; locked = false; scene.classList.remove('locked') };
    v.onended = release; v.onerror = release; // if the video is missing or fails, the slide is not left locked
    const ctl = el('ts-ctl', null, '<button data-a="back">Back</button><button data-a="start">Start</button><button data-a="pause">Pause</button><button data-a="reset">Reset</button><button data-a="next">Next</button>');
    ctl.onclick = e => { const a = e.target.dataset.a; if (!a || locked) return; if (a === 'start') start(); else if (a === 'pause') stop(); else if (a === 'reset') reset(); else if (a === 'next') go(1); else go(-1) };
    scene.onclick = e => e.stopPropagation();
    // the camera (frame) pulls back from the slide to the whole planet; the timer shows once the pull-back is under way
    rm = reduced(); built = performance.now(); lastTf = '';
    if (rm) { scene.classList.add('in'); clock(fmt(TOTAL)) } else setTimeout(() => { if (scene) { scene.classList.add('in'); clock(fmt(TOTAL), true) } }, 2600);
    spRaf = requestAnimationFrame(frame);
  }
  function paint() {
    const e = elapsed(), left = Math.max(0, Math.ceil(TOTAL - e));
    clock(left > 0 ? fmt(left) : 'Time\u2019s up!');
    if (e >= LOCK && !locked && !released) { locked = true; scene.classList.add('locked') }
    if (e >= VIDEO && !played) { played = true; const v = scene.querySelector('video'); v.classList.add('on'); v.play().catch(() => {}) }
    if (left <= 0) stop();
  }
  function start() { if (running) return; running = true; scene.classList.add('run'); t0 = performance.now(); tick = setInterval(paint, 200) }
  function stop() { if (!running) return; base = elapsed(); running = false; scene && scene.classList.remove('run'); clearInterval(tick) }
  function reset() { stop(); base = 0; played = false; released = false; const v = scene.querySelector('video'); v.pause(); v.currentTime = 0; v.classList.remove('on'); paint() }
  function leave() { clockStr = ''; clearInterval(tick); cancelAnimationFrame(spRaf); spRaf = 0; X = null; worldEl = null; running = false; base = 0; played = false; locked = false; released = false; leaving = false; if (scene) { const v = scene.querySelector('video'); v && v.pause(); scene.remove(); scene = null } document.getElementById('deck').classList.remove('ts-on') }

  const orig = { renderDeck, deckNext, deckBack };
  renderDeck = function (full) {
    leave(); orig.renderDeck(full);
    if (BEATS[deckIndex] && BEATS[deckIndex].beat === '8.3a') build();
  };
  // After the video, leaving the slide dissolves the scene to white (the paper behind it), then moves on.
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
