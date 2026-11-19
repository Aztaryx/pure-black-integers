const $ = s => document.querySelector(s), stage = $('#stage');
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
const EX = [
  { eq: ['5', '+', '(−3)'], p: [5], n: [3] },
  { eq: ['(−4)', '+', '3'], p: [3], n: [4] }
];

const chips = (count, red = false) =>
  Array.from({ length: count }, (_, i) => `<span class="chip-mini${red ? ' red' : ''}" style="--i:${i}"></span>`).join('');
const chipRow = (...parts) => `<div class="chip-row">${parts.join('<span class="chip-op">+</span>')}</div>`;
// tiles(word): tiles settle in. tiles(word, scrambled): tiles start in the scrambled order and slide into place.
const tiles = (w, from, attrs = '') => {
  const used = [];
  const dx = i => { if (!from) return 0; const j = [...from].findIndex((c, k) => c === w[i] && !used.includes(k)); used.push(j); return j - i };
  return `<div class="tiles${from ? ' slide' : ''}"${attrs ? ' ' + attrs : ''}>${[...w].map((c, i) => `<span style="--i:${i};--dx:${dx(i)}">${c}</span>`).join('')}</div>`;
};
// Zero pair: click (or Enter/Space) to cancel it; click again to bring it back. data-auto plays it once on entry.
const zeroPair = (auto = false) =>
  `<div class="zero-pair" role="button" tabindex="0" aria-label="Zero pair. Activate to cancel the pair."${auto ? ' data-auto' : ''}><span class="chip-mini"></span><span class="chip-mini red"></span></div>`;
// numberLine(from, to, { shade: 'pos' | 'neg' | 'both', hop: [start, end] }): SVG number line.
// It does not call fmt() because BEATS is built before fmt is defined.
const numberLine = (a, b, o = {}) => {
  const f = n => (n < 0 ? '−' : '') + Math.abs(n), st = 60, pad = 40, W = (b - a) * st + pad * 2, y = 60, X = n => pad + (n - a) * st;
  const shade = (x1, x2, cls) => `<rect class="nl-shade ${cls}" x="${X(x1)}" y="${y - 9}" width="${X(x2) - X(x1)}" height="18" rx="9" style="transform-origin:${X(0)}px ${y}px"/>`;
  // The negative side (a < 0) is marked red: its axis segment (up to halfway between -1 and 0), arrowhead, ticks and labels. Zero stays black.
  const wx = Math.min(X(0) - st / 2, W - pad + 30), hasNeg = a < 0, hops = o.hops || (o.hop ? [o.hop] : []), extra = Math.max(0, hops.length - 1) * 12;
  let s = `<svg class="numline" viewBox="0 ${-extra} ${W} ${112 + extra}" role="img" aria-label="Number line from ${f(a)} to ${f(b)}">`;
  if (o.shade === 'pos' || o.shade === 'both') s += shade(0, b, 'pos');
  if (o.shade === 'neg' || o.shade === 'both') s += shade(a, 0, 'neg');
  const ax = (x1, x2, ng) => `<line class="nl-axis${ng ? ' ng' : ''}" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/>`;
  s += hasNeg ? ax(pad - 22, wx, true) + ax(wx, W - pad + 22, false) : ax(pad - 22, W - pad + 22, false);
  s += `<path class="nl-head${hasNeg ? ' ng' : ''}" d="M${pad - 26} ${y} l12 -7 v14 z"/><path class="nl-head" d="M${W - pad + 26} ${y} l-12 -7 v14 z"/>`;
  for (let n = a; n <= b; n++) s += `<line class="nl-tick${n < 0 ? ' ng' : ''}" x1="${X(n)}" y1="${y - (n ? 9 : 14)}" x2="${X(n)}" y2="${y + (n ? 9 : 14)}"/><text class="nl-lbl${n ? '' : ' zero'}${n < 0 ? ' ng' : ''}" x="${X(n)}" y="${y + 36}" text-anchor="middle">${f(n)}</text>`;
  hops.forEach(([h1, h2], i) => {
    const x1 = X(h1), x2 = X(h2), ay = y - 14, lift = Math.min(34, Math.abs(x2 - x1) * .4) + 8 + i * 12, cx = (x1 + x2) / 2, cy = ay - lift * 2;
    const ang = Math.atan2(ay - cy, x2 - cx) * 180 / Math.PI, back = h2 < h1 ? ' back' : '', d = 1.1 + i;
    s += `<path class="nl-hop${back}" pathLength="1" style="animation-delay:${d}s" d="M${x1} ${ay} Q${cx} ${cy} ${x2} ${ay}"/><path class="nl-arrow${back}" style="animation-delay:${d + .85}s" d="M0 0 l-13 -8 v16 z" transform="translate(${x2} ${ay}) rotate(${ang})"/>`;
  });
  if (hops.length) { const s1 = hops[0][0], e2 = hops[hops.length - 1][1]; s += `<circle class="nl-dot ${s1 < 0 ? 'n' : 'a'}" cx="${X(s1)}" cy="${y}" r="9"/><circle class="nl-dot e" cx="${X(e2)}" cy="${y}" r="9"/>`; }
  return s + '</svg>';
};
// Drill arrays (smaller factor = rows), pip strip, and the Team A scoreboard with a counting total.
const dots = (r, c, still = false) => {
  const [a, b] = r < c ? [r, c] : [c, r];
  return `<div class="dots${still ? ' still' : ''}" style="--c:${b};--r:${a}">${Array.from({ length: a * b }, (_, i) => `<i style="--row:${Math.floor(i / b)}"></i>`).join('')}</div>`;
};
const pips = (done, total) => `<div class="pips" role="img" aria-label="Drill ${done} of ${total}">${Array.from({ length: total }, (_, i) => `<i class="${i < done ? 'on' : ''}" style="--i:${i}"></i>`).join('')}</div>`;
// One Team A board for the merged 4.1-4.3 slide: Round 2 and the second total appear on tap 1 (data-step), the first total hides then.
const scoreboard = () => `<div class="board" role="img" aria-label="Team A scoreboard: round 1 plus 5, round 2 minus 3, total 2"><div class="board-h"><span>Team A</span></div><div class="board-row"><span>Round 1</span><b class="pos">+5</b></div><div class="board-row new" data-step="1"><span>Round 2</span><b class="neg">−3</b></div><div class="board-t"><span>Total</span><span class="stack"><b class="count" data-hide="1" style="--from:0;--to:5"></b><b class="count" data-step="1" style="--from:5;--to:2"></b></span></div></div>`;
let nudgeT;
function armNudge(btn) {
  clearTimeout(nudgeT); document.querySelectorAll('.nudge').forEach(b => b.classList.remove('nudge'));
  if (!reduce) nudgeT = setTimeout(() => btn.classList.add('nudge'), 8000);
}
// Thermometer (mercury rises from t0 to t1), elevator (car rides from floor f0 to f1) and crossed zero pairs.
const sgn = n => (n < 0 ? '−' : '') + Math.abs(n);
const thermo = (t0, t1) => {
  const Y = t => 20 + (4 - t) * 28, base = 370, s0 = ((base - Y(t0)) / (base - Y(t1))).toFixed(3);
  let s = `<svg class="thermo" viewBox="0 0 220 410" role="img" aria-label="Thermometer rising from ${sgn(t0)} to ${sgn(t1)} degrees Celsius"><rect class="th-tube" x="60" y="14" width="40" height="${base - 14}" rx="20"/><circle class="th-tube" cx="80" cy="${base}" r="30"/><circle class="th-hg" cx="80" cy="${base}" r="22"/><rect class="th-merc" x="70" y="${Y(t1)}" width="20" height="${base - Y(t1)}" style="transform-origin:80px ${base}px"/>`;
  for (let t = -8; t <= 4; t += 2) s += `<line class="th-tick" x1="104" y1="${Y(t)}" x2="116" y2="${Y(t)}"/><text class="th-lbl" x="122" y="${Y(t) + 5}">${sgn(t)}</text>`;
  return s + `<text class="th-end" x="52" y="${Y(t1) + 8}" text-anchor="end">${sgn(t1)}°C</text></svg>`;
};
const elevator = (f0, f1) => {
  const lo = -2, hi = 3, H = 54, Y = n => 20 + (hi - n) * H, T = 20 + (hi - lo + 1) * H;
  let s = `<svg class="elevator" viewBox="0 0 270 ${T + 20}" role="img" aria-label="Elevator moving from floor ${sgn(f0)} to floor ${sgn(f1)}"><rect class="el-shaft" x="90" y="20" width="90" height="${T - 20}"/>`;
  for (let n = hi; n >= lo; n--) s += `<line class="el-floor" x1="40" y1="${Y(n) + H}" x2="230" y2="${Y(n) + H}"/><text class="el-lbl" x="76" y="${Y(n) + H / 2 + 6}" text-anchor="end">${sgn(n)}</text>`;
  s += `<g class="el-car" style="--dy:${Y(f0) - Y(f1)}px"><rect x="98" y="${Y(f1) + 6}" width="74" height="${H - 12}" rx="6"/></g>`;
  return s + `<text class="el-lbl" x="196" y="${(Y(f0) + Y(f1)) / 2 + H / 2 + 6}">${f1 > f0 ? '+' : ''}${f1 - f0} floors</text></svg>`;
};
const crossRow = (a, b, aRed, on = 1) => {
  const m = Math.min(a, b), grp = (n, red) => Array.from({ length: n }, (_, i) => `<span class="chip-mini${red ? ' red' : ''} ${i < m ? 'x' : 'keep'}" style="--i:${i}"></span>`).join('');
  return chipRow(grp(a, aRed), grp(b, !aRed)).replace('class="chip-row"', `class="chip-row" data-on="${on}"`);
};
// iconSvg(name, cls): flat icons on a 64x64 grid, one stroke weight. Objects and abstract shapes only: no faces, no body parts.
// The one people shape allowed is `pair`: two faceless default-avatar silhouettes side by side.
// Names: sun desk thermo elevator coin ball check play think pair share. cls may be 'blue' or 'red'.
const ICONS = {
  sun: '<circle cx="32" cy="32" r="10"/><path d="M32 6v8M32 50v8M6 32h8M50 32h8M13.6 13.6l5.7 5.7M44.7 44.7l5.7 5.7M13.6 50.4l5.7-5.7M44.7 19.3l5.7-5.7"/>',
  desk: '<path d="M8 32h48M14 32v22M50 32v22"/><rect x="22" y="18" width="20" height="14" rx="2"/>',
  thermo: '<rect x="26" y="6" width="12" height="36" rx="6"/><circle cx="32" cy="48" r="9"/><path d="M32 20v28M42 16h6M42 26h6M42 36h6"/>',
  elevator: '<rect x="12" y="6" width="40" height="52" rx="3"/><path d="M32 6v52M17 28l5-7 5 7M37 36l5 7 5-7"/>',
  coin: '<circle cx="32" cy="32" r="24"/><circle cx="32" cy="32" r="17"/><path d="M28 20v24M28 20h8a6 6 0 0 1 0 12h-8M24 25h16M24 29h16"/>',
  ball: '<circle cx="32" cy="32" r="24"/><path d="M32 8v48M8 32h48M15 15c9 9 9 25 0 34M49 15c-9 9-9 25 0 34"/>',
  check: '<circle cx="32" cy="32" r="24"/><path d="M21 33l8 8 15-17"/>',
  play: '<rect x="6" y="14" width="52" height="36" rx="8"/><path d="M27 24l14 8-14 8z"/>',
  think: '<ellipse cx="32" cy="22" rx="22" ry="14"/><circle cx="16" cy="43" r="4"/><circle cx="9" cy="53" r="2.5"/>',
  pair: '<g fill="#111"><circle cx="18" cy="22" r="8"/><path d="M5 54v-3a13 13 0 0 1 26 0v3z"/><circle cx="46" cy="22" r="8"/><path d="M33 54v-3a13 13 0 0 1 26 0v3z"/></g>',
  share: '<path d="M12 8h40a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H32L20 54V42h-8a6 6 0 0 1-6-6V14a6 6 0 0 1 6-6z"/>'
};
const iconSvg = (name, cls = '') => `<svg class="icon${cls ? ' ' + cls : ''}" viewBox="0 0 64 64" aria-hidden="true">${ICONS[name] || ''}</svg>`;
// iconRow([[icon, label], ...]): bordered cards, each an icon over a caption.
const iconRow = items => `<div class="icon-row">${items.map(([n, l], i) => `<figure style="--i:${i}">${iconSvg(n)}<figcaption>${l}</figcaption></figure>`).join('')}</div>`;
// duo(textHtml, visualHtml): text left, graphic right in .deck-visual; stacks on narrow viewports.
const duo = (text, visual) => `<div class="duo"><div class="duo-text">${text}</div><div class="deck-visual">${visual}</div></div>`;
// rules(items): the MATH rules in one slide. Each [letter, word, text] row appears on its own tap (data-step 1, 2, ...).
const rules = items => `<div class="rules">${items.map(([l, w, t], i) => `<div class="rule" data-step="${i + 1}"><b aria-hidden="true">${l}</b><div><h2>${w}</h2><p>${t}</p></div></div>`).join('')}</div>`;
// badges(n): numbered group badges (blue, red, black, white).
const badges = n => `<div class="badges" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<span style="--i:${i}">${i + 1}</span>`).join('')}</div>`;
const labelled = (...items) => `<div class="labelled">${items.map(([cls, t]) => `<figure><span class="chip-mini ${cls}"></span><figcaption>${t}</figcaption></figure>`).join('')}</div>`;
// ---- negative numbers are color-coded: every −digits in slide text is wrapped in .neg (red, like the red chips) ----
const NEG_SPLIT = /(−\d+(?:[.,]\d+)?(?:°[CF])?)/, NEG_HIT = /−\d/;
function negify(root) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), hits = [];
  while (w.nextNode()) { const n = w.currentNode; if (NEG_HIT.test(n.nodeValue) && !n.parentElement.closest('svg,.neg,a,button,script,style')) hits.push(n) }
  hits.forEach(n => {
    const f = document.createDocumentFragment();
    n.nodeValue.split(NEG_SPLIT).forEach((part, i) => {
      if (!part) return;
      if (i % 2) { const e = document.createElement('span'); e.className = 'neg'; e.textContent = part; f.appendChild(e) }
      else f.appendChild(document.createTextNode(part));
    });
    n.replaceWith(f);
  });
}
// ---- titles that change on a tap are retyped: the old text is erased, the new text typed, caret following ----
function textNodes(el) { const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), a = []; while (w.nextNode()) a.push(w.currentNode); return a }
function showChars(nodes, full, k) { nodes.forEach((n, i) => { n.nodeValue = full[i].slice(0, Math.max(0, Math.min(full[i].length, k))); k -= full[i].length }) }
const spanVisible = e => !e.classList.contains('gone') && !(e.hasAttribute('data-step') && !e.classList.contains('shown'));
function retype(h1, from, to, wait = 0) {
  if (h1._done) h1._done();
  const fN = textNodes(from), fF = fN.map(n => n.nodeValue), tN = textNodes(to), tF = tN.map(n => n.nodeValue);
  const fL = fF.join('').length, tL = tF.join('').length;
  let timer = 0, k = fL;
  const done = () => {
    clearTimeout(timer); showChars(fN, fF, fL); showChars(tN, tF, tL);
    from.style.visibility = to.style.visibility = ''; from.classList.remove('caret'); to.classList.remove('caret'); h1._done = null;
  };
  h1._done = done;
  if (reduce || !(fL + tL)) return done();
  from.style.visibility = 'visible'; to.style.visibility = 'hidden';
  const eStep = Math.max(2, Math.ceil(fL / 14)), tStep = Math.max(1, Math.ceil(tL / 40));
  const type = () => {
    if (!h1.isConnected) return;
    k += tStep; showChars(tN, tF, k);
    timer = setTimeout(k < tL ? type : done, k < tL ? 34 : 500);
  };
  const erase = () => {
    if (!h1.isConnected) return;
    k -= eStep; showChars(fN, fF, k);
    if (k > 0) { timer = setTimeout(erase, 22); return }
    showChars(fN, fF, 0); from.style.visibility = 'hidden'; from.classList.remove('caret');
    showChars(tN, tF, 0); k = 0; to.style.visibility = 'visible'; to.classList.add('caret');
    timer = setTimeout(type, 160);
  };
  // wait: hold the old title (no caret) first, for example until the tiles finish unscrambling
  timer = setTimeout(() => { from.classList.add('caret'); erase() }, 90 + wait);
}
// ---- ribbon of drifting windows in the right margin of every deck slide ----
let ribbonT = 0;
function addRibbonWin(delay) {
  const box = $('#deck-ribbon'), w = document.createElement('div'), z = Math.random();
  const width = (0.7 + z * 2.1).toFixed(2), left = (0.4 + Math.random() * (5.2 - width)).toFixed(2);
  w.className = 'rw'; w.style.left = left + 'vw'; w.style.width = width + 'vw'; w.style.height = (10 + z * 30).toFixed(0) + 'vh';
  w.style.setProperty('--dur', (46 - z * 18).toFixed(1) + 's'); w.style.setProperty('--delay', delay + 's');
  w.addEventListener('animationend', () => w.remove());
  box.appendChild(w);
}
function startRibbon() {
  const box = $('#deck-ribbon');
  if (reduce) {
    if (!box.children.length) [[1.1, 12], [2.2, 58], [1.6, 84]].forEach(([wd, ty]) => { const w = document.createElement('div'); w.className = 'rw still'; w.style.cssText = `left:${(5.4 - wd) * (ty % 7) / 7 + .3}vw;width:${wd}vw;height:${14 + ty % 17}vh;--ty:${ty - 10}vh`; box.appendChild(w) });
    return;
  }
  if (ribbonT) return;
  addRibbonWin(-18); addRibbonWin(-6);
  const loop = () => {
    if (!$('#deck').classList.contains('on')) { ribbonT = 0; return }
    addRibbonWin(0); ribbonT = setTimeout(loop, 5000 + Math.random() * 5000);
  };
  ribbonT = setTimeout(loop, 6000);
}
function runDemos(root) {
  if (reduce) return;
  root.querySelectorAll('[data-auto]').forEach(z => setTimeout(() => { if (z.isConnected) z.classList.add('cancel') }, 1500));
}
function flipChip(c) {
  if (c.classList.contains('flip')) return;
  c.classList.add('flip');
  setTimeout(() => c.classList.toggle('red'), reduce ? 0 : 250);
  setTimeout(() => c.classList.remove('flip'), reduce ? 0 : 500);
}
// Every deck slide shares one structure: a header (kicker + title) and an optional body.
// Worked-example row: equation, chips, and the answer, which stamps in on tap n.
const exRow = (eq, chipHtml, ans, n) => `<div class="ex"><h2>${eq}</h2>${chipHtml}<h2 class="answer" data-step="${n}">${ans}</h2></div>`;
// Grading rubric from the lesson plan (5, 4, 3 and 2 points; 25 points in total).
const RUBRIC = [
  ['Accuracy', 'Correct answer with 0 errors.', '1 minor error in computation or signs.', '2 errors in computation or signs.', '3 or more errors, resulting in an incorrect answer.'],
  ['Use of Chips', 'Correctly represented all integers using chips with 0 errors.', '1 incorrect chip or representation.', '2 incorrect chips or representations.', '3 or more incorrect chips or representations.'],
  ['Explanation', 'Explained all steps clearly with 0 missing steps.', '1 step was missing or insufficiently explained.', '2 steps were missing or insufficiently explained.', '3 or more steps were missing, making the solution difficult to understand.'],
  ['Teamwork', '100% of members actively participated.', '75–99% of members actively participated.', '50–74% of members actively participated.', 'Below 50% of members actively participated.'],
  ['Presentation', 'Presented all parts clearly with 0 presentation issues.', '1 issue in clarity, voice, or organization.', '2 issues in clarity, voice, or organization.', '3 or more issues in clarity, voice, or organization.']
];
const rubric = () => `<table class="rubric"><thead><tr><th>Criteria</th><th>5 Points</th><th>4 Points</th><th>3 Points</th><th>2 Points</th></tr></thead><tbody>${RUBRIC.map(r => `<tr><th scope="row">${r[0]}</th>${r.slice(1).map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody><tfoot><tr><th scope="row">Total</th><td colspan="4">25 points</td></tr></tfoot></table>`;
// Group-work timer, started by hand (Start, Pause, Reset). It stops when the slide changes.
const fmtTime = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
const timerHtml = secs => `<div class="timer" data-secs="${secs}"><div class="t-disp" role="timer">${fmtTime(secs)}</div><div class="t-btns"><button data-act="start">Start</button><button data-act="pause">Pause</button><button data-act="reset">Reset</button></div></div>`;
// Click-order reveals. step(n, html) appears on the n-th tap; hideAt(n, html) disappears on the n-th tap.
// Both keep their space, so the layout never jumps. Any element can also carry data-step / data-hide directly.
const step = (n, html) => `<div class="step" data-step="${n}">${html}</div>`;
const hideAt = (n, html) => `<div class="step-out" data-hide="${n}">${html}</div>`;
// o: { center } centers the slide; { big } enlarges the asset; { swap } stacks the title's step variants in one spot.
const card = (kicker, title, body = '', q = false, o = {}) => {
  const hc = [q && 'q', o.swap && 'swap'].filter(Boolean).join(' ');
  return `<article class="deck-card${body ? '' : ' solo'}${o.center ? ' center' : ''}${o.big ? ' big' : ''}"><header class="deck-head">${kicker ? `<span class="kicker">${kicker}</span>` : ''}<h1${hc ? ` class="${hc}"` : ''}${o.delay ? ` data-delay="${o.delay}"` : ''}>${title}</h1></header>${body ? `<div class="deck-body">${body}</div>` : ''}</article>`;
};

const BEATS = [
  // PORTION 2: PRELIMINARIES & NUMERACY DRILLS
  { portion: 'Portion 2 — Preliminaries', beat: '2.1', html: card('', 'Prayer', '', false, { center: true }) },
  { portion: 'Portion 2 — Preliminaries', beat: '2.2', html: card('Greeting', 'Good Morning!', '<p>Grade 7 – St. Joseph</p><div class="head-icons">' + iconSvg('sun') + iconSvg('desk') + '</div>') },
  { portion: 'Portion 2 — Preliminaries', beat: '2.3–2.7', html: card('Classroom Management', 'MATH Rules', rules([
    ['M', 'Motivated', 'Always do your best in every Mathematics activity.'],
    ['A', 'Active', 'Participate in class discussions and activities.'],
    ['T', 'Teamwork', 'Cooperate and help your classmates.'],
    ['H', 'Honest', 'Be truthful and do your own work.']
  ])) },
  { portion: 'Portion 2 — Preliminaries', beat: '2.8', html: card('Check-in', 'Attendance & MATHkamustahan', '<h2>How are you feeling today?</h2><div class="head-icons">' + iconSvg('check', 'blue') + '</div>') },
  { portion: 'Portion 2 — Warm-up', beat: '2.9', html: card('Activity 1', 'Numeracy Drills', '<p>Multiply as fast as you can.</p>') },
  ...[[5, 6], [7, 6], [11, 5], [8, 8], [10, 14]].map(([r, c], k) => ({
    portion: 'Portion 2 — Warm-up', beat: `2.${10 + 2 * k}–2.${11 + 2 * k}`,
    html: card(`Drill ${k + 1} of 5`, `${r} × ${c} = ?`, `<div class="drill">${dots(r, c)}<div class="drill-side"><h2 class="answer" data-step="1">${r * c}</h2>${pips(k + 1, 5)}</div></div>`, false, { big: true })
  })),

  // PORTION 3: RECALL — UNSCRAMBLE ME!
  { portion: 'Portion 3 — Recall', beat: '3.1', html: card('Activity 2', 'Unscramble Me!', '<p>Rearrange the jumbled letters, then answer the question.</p>') },
  ...[['TERINGE', 'INTEGER', 'What are integers?', 'both'], ['POITVESI', 'POSITIVE', 'Where can we find the positive integers on the number line?', 'pos'], ['VANEGITE', 'NEGATIVE', 'Where can we find the negative integers on the number line?', 'neg']].map(([scr, word, q, shade], k) => ({
    portion: 'Portion 3 — Recall', beat: `3.${2 + 2 * k}–3.${3 + 2 * k}`,
    html: card(`Word ${k + 1} of 3`, `<span data-hide="1">Unscramble the word</span><span data-step="1">${q}</span>`,
      `<div class="stack">${tiles(scr, '', 'data-hide="1"')}${tiles(word, scr, 'data-step="1"')}</div>` + step(2, numberLine(-5, 5, { shade })), true, { swap: true, delay: 100 + (word.length - 1) * 60 + 900 + 600 })
  })),
  { portion: 'Portion 3 — Recall', beat: '3.8', html: card('Follow-up Question', 'Positive vs. Negative', '<h2>How do we distinguish positive integers from negative integers?</h2>') },

  // PORTION 4: SITUATIONAL ANALYSIS — THE SCORE BOARD
  { portion: 'Portion 4 — Situational Analysis', beat: '4.1–4.3', html: card('Activity 3 · The Score Board',
    '<span data-hide="1">Round 1</span><span data-step="1" data-hide="2">Round 2</span><span data-step="2">Gained vs. Deducted</span>',
    duo('<div class="stack">' +
      '<div class="blk" data-hide="1"><p>During a classroom quiz bee, Team A earned 5 points in the first round.</p><h2>+5 points</h2></div>' +
      '<div class="blk" data-step="1" data-hide="2"><p>However, they received a 3-point deduction in the second round because of a rule violation.</p><h2>−3 points</h2></div>' +
      '<div class="blk" data-step="2"><p>Gained Points (+5)</p>' + chipRow(chips(5)) + '<p>Deduction Points (−3)</p>' + chipRow(chips(3, true)) + '</div></div>',
      scoreboard()), false, { swap: true, big: true, delay: 900 }) },
  { portion: 'Portion 4 — Situational Analysis', beat: '4.4', html: card('Guide Question 1', 'What do the blue and red chips represent?', '', true) },
  { portion: 'Portion 4 — Situational Analysis', beat: '4.5', html: card('Guide Question 2', 'Why do you think Team A has two different kinds of chips?', '', true) },
  { portion: 'Portion 4 — Situational Analysis', beat: '4.6', html: card('Guide Question 3', 'In the context of integers for gained and deducted points, which one is positive and which one is negative?', '', true) },
  { portion: 'Portion 4 — Situational Analysis', beat: '4.7', html: card('Guide Question 4', 'How can we organize these chips to understand the team’s score?', '', true) },
  { portion: 'Title', beat: 'Title', title: true },

  // PORTION 5: VOCABULARY UNLOCK
  { portion: 'Portion 5 — Vocabulary', beat: '5.1', html: card('Unlocking Vocabulary', 'Integers', '<p>Numbers that include positive whole numbers, negative whole numbers, and zero.</p><h2>…, −3, −2, −1, 0, 1, 2, 3, …</h2>' + numberLine(-5, 5)) },
  { portion: 'Portion 5 — Vocabulary', beat: '5.2', html: card('Unlocking Vocabulary', 'Integer Chips', '<p>Concrete models or counters used to represent integers.</p>' + labelled(['', '+1'], ['red', '−1']) + '<p>Blue = Positive (+1) · Red = Negative (−1)</p>') },
  { portion: 'Portion 5 — Vocabulary', beat: '5.3', html: card('Unlocking Vocabulary', 'Zero Pair', '<p>A combination of one positive chip and one negative chip that cancel each other out.</p>' + zeroPair(true) + '<h2>(+1) + (−1) = <span class="lit">0</span></h2>') },

  { portion: 'Portion 6 — Chip Mat', beat: '6.5', html: card('Cases 1 & 2', 'Same Signs', '<p>Both positive or both negative: combine all chips and count the total.</p>') },
  { portion: 'Portion 6 — Chip Mat', beat: '6.5a', html: card('Case 1 · Examples', 'Both Positive', '<div class="ex-list">' + exRow('3 + 2 =', chipRow(chips(3), chips(2)), '5', 1) + exRow('5 + 2 =', chipRow(chips(5), chips(2)), '7', 2) + '</div>', false, { big: true }) },
  { portion: 'Portion 6 — Chip Mat', beat: '6.5b', html: card('Case 2 · Examples', 'Both Negative', '<div class="ex-list">' + exRow('(−4) + (−2) =', chipRow(chips(4, true), chips(2, true)), '−6', 1) + exRow('(−3) + (−1) =', chipRow(chips(3, true), chips(1, true)), '−4', 2) + '</div>', false, { big: true }) },
  // PORTION 6: THE INTERACTIVE CHIP MAT (#s2)
  { portion: 'Portion 6 — Chip Mat', beat: '6.1–6.4', mat: true },
  { portion: 'Portion 6 — Chip Mat', beat: '6.6', html: card('Case 3', 'Different Signs', '<p>Pair each positive chip with one negative chip to make zero pairs, remove them, and count what remains.</p>') },
  { portion: 'Portion 6 — Chip Mat', beat: '6.6a', html: card('Case 3 · Examples', 'Different Signs', '<div class="ex-list">' + exRow('4 + (−2) =', crossRow(4, 2, false, 1), '2', 2) + exRow('(−4) + 3 =', crossRow(4, 3, true, 3), '−1', 4) + '</div>', false, { big: true }) },

  // PORTION 7: FAMILIARIZE — THINK-PAIR-SHARE
  { portion: 'Portion 7 — Familiarize', beat: '7.1', html: card('Think-Pair-Share', 'Think, Model, and Solve', iconRow([['think', 'Think'], ['pair', 'Pair'], ['share', 'Share']])) },
  { portion: 'Portion 7 — Familiarize', beat: '7.2', html: card('Mechanics', 'How We Work', '<ol><li>Model and solve the problem independently using integer chips.</li><li>Pair up to compare representations and explain your solutions.</li><li>Selected pairs share with the class.</li></ol>' + iconRow([['think', 'Think'], ['pair', 'Pair'], ['share', 'Share']])) },
  { portion: 'Portion 7 — Familiarize', beat: '7.3–7.4', html: card('Problem 1',
    '<span data-hide="1">Laboratory Temperature</span><span data-step="1">−2°C</span>',
    duo('<p>The temperature in a laboratory was −6°C in the morning. By noon, it increased by 4°C. What was the temperature at noon?</p>' +
      '<div class="blk" data-step="1">' + chipRow(chips(6, true), chips(4)) + '<h2>(−6) + 4 = −2</h2></div>', step(2, thermo(-6, -2))), false, { swap: true, big: true, delay: 1000 }) },
  { portion: 'Portion 7 — Familiarize', beat: '7.5–7.6', html: card('Problem 2',
    '<span data-hide="1">The Elevator</span><span data-step="1">3rd Floor</span>',
    duo('<p>An elevator is on the 2nd basement level (−2). It moves up 5 floors. On which floor does it stop?</p>' +
      '<div class="blk" data-step="1">' + chipRow(chips(2, true), chips(5)) + '<h2>(−2) + 5 = 3</h2></div>', step(2, elevator(-2, 3))), false, { swap: true, big: true, delay: 1000 }) },

  // PORTION 8: DECIDE — CHIP IT, SOLVE IT!
  { portion: 'Portion 8 — Decide', beat: '8.1', html: card('Group Activity', 'Chip It, Solve It!') },
  { portion: 'Portion 8 — Decide', beat: '8.2', html: card('Mechanics', 'Work in 4 Groups', badges(4) + '<ul><li>Each group receives a problem suited to its level.</li><li>Represent and solve using colored integer chips.</li><li>Present your chip model and explain your process.</li></ul>') },
  { portion: 'Portion 8 — Decide', beat: '8.3', html: card('Grading Rubric', '25 Points', rubric(), true) },
  { portion: 'Portion 8 — Decide', beat: '8.3a', html: card('Group Activity', '5 Minutes', timerHtml(300)) },
  { portion: 'Portion 8 — Decide', beat: '8.4–8.5', html: card('Group 1 · Simple Expressions',
    '<span data-hide="1">4 + 3 = ?<br>(−7) + 3 = ?</span><span data-step="1">4 + 3 = <b class="ans">7</b><br>(−7) + 3 = <b class="ans">−4</b></span>', '', false, { swap: true }) },
  { portion: 'Portion 8 — Decide', beat: '8.6–8.7', html: card('Group 2 · Mathematical Phrases',
    '<span data-hide="1">Translate &amp; Solve</span><span data-step="1">(−5) + 8</span>',
    '<p>“The sum of negative five and positive eight.”</p><h2 class="answer" data-step="1">3</h2>', false, { swap: true, big: true }) },
  { portion: 'Portion 8 — Decide', beat: '8.8–8.9', html: card('Group 3 · Basic Word Problem',
    '<span data-hide="1">Mia’s Score</span><span data-step="1">12 + 8 + (−15) + 7</span>',
    '<p>Mia starts with 12 points. She earns 8 points in Round 1, loses 15 points in Round 2, and earns 7 points in Round 3. How many points does Mia have at the end?</p><h2 class="answer" data-step="1">12 points</h2>', false, { swap: true, big: true }) },
  { portion: 'Portion 8 — Decide', beat: '8.10–8.11', html: card('Group 4 · Challenging Word Problem',
    '<span data-hide="1">Carlo’s Score</span><span data-step="1">5 + (−12) + 18 + (−9) + 7</span>',
    '<p>Carlo starts with 5 points. He loses 12 points in Round 1, earns 18 points in Round 2, loses 9 points in Round 3, and earns 7 points in the final round. What is Carlo’s final score?</p><h2 class="answer" data-step="1">9 points</h2>', false, { swap: true, big: true }) },

  // PORTION 9: FORMATIVE ASSESSMENT
  { portion: 'Portion 9 — Assessment', beat: '9.1', html: card('Formative Assessment', 'Time to Test Your Understanding', '<p>Blue chips = +1 · Red chips = −1. Cross out opposite-color pairs (zero pairs), count the remaining chips, and write the sum.</p>') },
  { portion: 'Portion 9 — Assessment', beat: '9.2–9.3', html: card('Quiz · Item 1 of 5', '(+5) + (+2)', chipRow(chips(5), chips(2)) + '<h2 class="answer" data-step="1">7</h2>', false, { big: true }) },
  { portion: 'Portion 9 — Assessment', beat: '9.4', html: card('Quiz · Item 2 of 5', '(−5) + (−3)', chipRow(chips(5, true), chips(3, true)) + '<h2 class="answer" data-step="1">−8</h2>', false, { big: true }) },
  { portion: 'Portion 9 — Assessment', beat: '9.5', html: card('Quiz · Item 3 of 5', '(−2) + (+6)', crossRow(2, 6, true) + '<h2 class="answer" data-step="2">4</h2>', false, { big: true }) },
  { portion: 'Portion 9 — Assessment', beat: '9.6', html: card('Quiz · Item 4 of 5', '(+4) + (−1)', crossRow(4, 1, false) + '<h2 class="answer" data-step="2">3</h2>', false, { big: true }) },
  { portion: 'Portion 9 — Assessment', beat: '9.7', html: card('Quiz · Item 5 of 5',
    '<span data-hide="2">(+7) + (+2) + (−6) = ?</span><span data-step="2">(+7) + (+2) + (−6) = +3</span>',
    '<p>Traveler drove 7 km, then 2 km more, then went back 6 km. How far to return to start?</p>' + chipRow(chips(7), chips(2), chips(6, true)) +
    '<div class="step cap-680" data-step="1">' + numberLine(0, 10, { hops: [[0, 7], [7, 9], [9, 3]] }) + '</div><h2 class="answer" data-step="2">3 km back to start</h2>', false, { swap: true }) },

  // PORTION 10: REFLECTION & EXTENDED LEARNING
  { portion: 'Portion 10 — Reflection', beat: '10.1', html: card('Everyday Situations', 'Where Do We Use Integers?', '<div class="grid-cards"><article>' + iconSvg('check', 'blue') + 'Attendance</article><article>' + iconSvg('thermo', 'red') + 'Temperature Changes</article><article>' + iconSvg('coin') + 'Money Transactions</article><article>' + iconSvg('ball', 'blue') + 'Basketball Scores</article></div>') },
  { portion: 'Portion 10 — Reflection', beat: '10.2', html: card('Reflective Question', 'How can we use the addition of integers to solve problems in our everyday situations?', '', true) },
  { portion: 'Portion 10 — Ways Forward', beat: '10.3', html: card('Explore Digital Learning Resources', 'Addition of Integers', '<div class="head-icons">' + iconSvg('play', 'red') + '</div><p>Grade 7 MATATAG Educational Video</p><h2><a href="https://youtu.be/gLQoEzKKTyQ?si=Y_CoLReMDYs05oWk" target="_blank" rel="noopener">youtu.be/gLQoEzKKTyQ</a></h2>') },
  { portion: 'Portion 10 — Closing', beat: '10.4', html: card('Thank you!', 'Grade 7 – St. Joseph', '<p>Prepared by: Joshua Philip M. Aure</p>' + chipRow(chips(3), chips(3, true)) + '<a class="thumb" href="https://youtu.be/gLQoEzKKTyQ" target="_blank" rel="noopener"><img src="https://img.youtube.com/vi/gLQoEzKKTyQ/hqdefault.jpg" alt="Grade 7 MATATAG Educational Video: Addition of Integers"></a>') }
];

const MAT_IDX = BEATS.findIndex(b => b.mat), TITLE_IDX = BEATS.findIndex(b => b.title);
const sum = a => a.reduce((x, y) => x + y, 0), fmt = n => (n < 0 ? '−' : '') + Math.abs(n);
const X = (k, g) => .6 + k * 1.1 + g * .35, YS = .3, YM = 1.825;
let st = { sl: 3, ex: 0, i: 0 }, M;

/* ---------- title slide: a deck beat between Guide Question 4 and the vocabulary ---------- */
let titleT1 = 0, titleT2 = 0, titleT3 = 0;
function showTitle() {
  const s = $('#s1');
  clearTimeout(titleT1); clearTimeout(titleT2); clearTimeout(titleT3);
  show(1);
  s.classList.add('reset'); s.classList.remove('show', 'txt', 'rev'); void s.offsetWidth;
  s.classList.remove('reset'); s.classList.add('show');
  titleT1 = setTimeout(() => s.classList.add('txt'), reduce ? 0 : 300);
  titleT2 = setTimeout(() => { s.classList.add('rev'); titleT3 = setTimeout(startWinSpawner, reduce ? 0 : 3000) }, reduce ? 0 : 2200);
}

/* ---------- dynamic parallax inversion window spawner ---------- */
const par = $('.par');
let winTimer = null;
function spawnWin() {
  if (st.sl !== 1 || !$('#s1').classList.contains('rev') || reduce) return;
  const w = document.createElement('div');
  w.className = 'win';
  const z = 0.1 + Math.pow(Math.random(), 1.6) * 0.9;
  const width = (0.35 + Math.pow(z, 1.4) * 3.2).toFixed(2);
  const height = (0.8 + Math.pow(z, 1.4) * 8.5).toFixed(2);
  const dur = (44 - z * 30).toFixed(1);
  const isLeft = Math.random() < 0.5;
  const x = isLeft
    ? (2 + Math.pow(Math.random(), 1.3) * 28).toFixed(1)
    : (96 - Math.pow(Math.random(), 1.3) * 26 - parseFloat(width)).toFixed(1);
  w.style.left = `${x}vw`; w.style.width = `${width}vw`; w.style.height = `${height}vh`;
  w.style.zIndex = Math.round(z * 10); w.style.setProperty('--dur', `${dur}s`);
  w.addEventListener('animationend', () => w.remove());
  par.appendChild(w);
}
function startWinSpawner() {
  stopWinSpawner();
  if (reduce) return;
  spawnWin(); setTimeout(spawnWin, 1400);
  function loop() { if (st.sl !== 1) return; spawnWin(); winTimer = setTimeout(loop, 2200 + Math.random() * 2600) }
  winTimer = setTimeout(loop, 2500);
}
function stopWinSpawner() { if (winTimer) { clearTimeout(winTimer); winTimer = null } }

/* ---------- chip mat: real inversion windows ---------- */
function mk(c, t, p) { const e = document.createElement('div'); e.className = c; if (t != null) e.textContent = t; (p || stage).appendChild(e); return e }
function put(e, x, y, o, s) { e.style.setProperty('--x', x); e.style.setProperty('--y', y); e.style.opacity = o; e.style.setProperty('--s', s || 1) }
function build(i) {
  stage.querySelectorAll('.chip,.win2,.dust').forEach(e => e.remove());
  const ex = EX[i], P = sum(ex.p), N = sum(ex.n);
  M = { ex, P, N, m: Math.min(P, N), R: P - N, B: [], W: [], R2: [], n: N ? 5 : 2, last: -1 };
  let k = 0; ex.p.forEach((n, g) => { for (let j = 0; j < n; j++)M.B.push({ e: mk('chip'), k: k++, g }) });
  // each overlay carries its negative as red chips (one per cell) inside the inversion window
  k = 0; ex.n.forEach((n, g) => { const e = mk('win2'); e.style.width = `calc(var(--u)*${n * 1.1 - .1})`; e.innerHTML = `<i>−${n}</i>` + Array.from({ length: n }, (_, j) => `<b style="--j:${j}"></b>`).join(''); M.W.push({ e, o: k, g }); k += n });
  for (let j = P; j < N; j++)M.R2.push({ e: mk('chip r'), k: j });
  document.querySelectorAll('#tabs button').forEach((b, j) => b.classList.toggle('on', j == i));
}
function cap(s) {
  const { P, N, m, R, ex } = M, d = N - P, pl = n => n > 1 ? 's' : '';
  if (!N) return s < 4 ? 'Blue chips are positive. Two groups: ' + ex.p.join(' and ') + '.' : 'No overlay needed. Count every blue chip: ' + R + '.';
  return [
    P ? `${P} blue chip${pl(P)} on the mat: +${P}.` : 'The mat is empty.',
    `The negative arrives as ${ex.n.length > 1 ? 'overlays' : 'an overlay'}: ${N} red chip${pl(N)}, −${N}.`,
    !P ? `The overlay lands on the empty mat: ${N} red chip${pl(N)}.` : d <= 0 ? 'Overlay it. Everything under the overlay flips: blue becomes red.' : `Overlay it. ${P} chip${pl(P)} invert to red. The extra ${d === 1 ? 'chip is' : d + ' chips are'} over empty space, so ${d === 1 ? 'a red chip is' : 'red chips are'} born.`,
    m ? 'Inverted chips cancel their red partners. These are zero pairs, and they turn to dust.' : 'The overlays glitch away. The red chips stay.',
    R > 0 ? `Count what is left: ${R} blue chip${pl(R)}. Answer: ${R}.` : `Count what is left: ${-R} red chip${pl(-R)}. Answer: ${fmt(R)}.`
  ][s];
}
// Zero pairs turn to dust: the chip blurs away while a burst of specks (red, and the black of the window cell) drifts off it.
function dust(x, y, k) {
  const d = mk('dust'), rnd = (a, b) => a + Math.random() * (b - a);
  d.style.setProperty('--x', x); d.style.setProperty('--y', y);
  for (let j = 0; j < 24; j++) {
    const p = document.createElement('i'), a = rnd(0, 6.283), r = Math.sqrt(Math.random()) * 45;
    p.style.cssText = `--px:${(50 + Math.cos(a) * r).toFixed(1)}%;--py:${(50 + Math.sin(a) * r).toFixed(1)}%;--sz:${rnd(.04, .1).toFixed(3)};--dx:${(rnd(.1, .8) + Math.cos(a) * .15).toFixed(2)};--dy:${(rnd(-.7, .1) + Math.sin(a) * .15).toFixed(2)};--d:${(.3 + k * .07 + rnd(0, .25)).toFixed(2)}s;--t:${rnd(.9, 1.5).toFixed(2)}s;--c:${j % 3 ? 'var(--r)' : '#111'}`;
    d.appendChild(p);
  }
  setTimeout(() => d.remove(), 2400);
}
function render(pre) {
  const { P, N, m, R } = M, s = pre ? -1 : (N ? st.i : (st.i ? 4 : 0));
  // Only the forward step from the overlay (2) to the cancel (3) plays the glitch, dust and spawn; any other jump just shows the state.
  const fresh = !pre && !reduce && M.last === 2 && s === 3;
  if (!pre) M.last = s;
  if (s < 3) stage.querySelectorAll('.dust').forEach(d => d.remove());
  M.B.forEach(c => {
    const gone = N && s >= 3 && c.k < m, x = s >= 4 && c.k >= m ? X(c.k - m, 0) : X(c.k, c.g), was = c.e.classList.contains('gone');
    c.e.classList.toggle('gone', !!gone);
    if (fresh && gone && !was) dust(x + .1, YM + .1, c.k);
    put(c.e, x + .1, YM + .1, s < 0 || gone ? 0 : 1, gone ? 1.12 : 1)
  });
  M.W.forEach(w => { w.e.classList.toggle('out', fresh); put(w.e, s >= 2 ? X(w.o, 0) : X(w.o, w.g), s >= 2 ? YM : YS, s >= 1 && s < 3 ? 1 : 0) });
  M.R2.forEach(c => { const v = s >= 3; c.e.classList.toggle('spawn', fresh); put(c.e, X(s >= 4 ? c.k - P : c.k, 0) + .1, YM + .1, v ? 1 : 0, v ? 1 : .3) });
  if (pre) return;
  $('#eq').innerHTML = M.ex.eq.join(' ') + ' = ' + (s >= 4 ? `<b>${fmt(R)}</b>` : '?');
  $('#cap').textContent = cap(s);
  armNudge($('#nx'));
  $('#nx').textContent = st.i < M.n - 1 ? 'Next' : st.ex < EX.length - 1 ? 'Next example' : 'Continue';
}
// Moving to another example on the chip mat uses the same dissolve as a wipe: every element fades out (background stays),
// the next example is built while nothing is visible, then everything fades in, so nothing snaps. Taps meanwhile are ignored.
let exBusy = false;
function goEx(ex, i) {
  if (exBusy) return;
  exBusy = true;
  dissolve(350, () => { enter(ex, i); fadeIn($('#s2')); exBusy = false });
}
function enter(ex, i) {
  st.ex = ex; st.i = i; stage.classList.add('nt'); build(ex); render(true); void stage.offsetWidth; stage.classList.remove('nt');
  $('#eq').innerHTML = M.ex.eq.join(' ') + ' = ?';
  requestAnimationFrame(() => requestAnimationFrame(() => render()));
}
// The header rule draws once per entry into the deck (load, wipe in, replay); later slides keep it static.
let ruleSeen = false;
function show(n) {
  st.sl = n;
  if (n != 3) ruleSeen = false;
  $('#s2').classList.toggle('on', n == 2);
  $('#deck').classList.toggle('on', n == 3);
  if (n != 3) timerStop();
  if (n != 1) {
    clearTimeout(titleT1); clearTimeout(titleT2); clearTimeout(titleT3);
    $('#s1').classList.remove('show', 'txt', 'rev');
    stopWinSpawner();
    par.innerHTML = '';
  }
}

let deckIndex = 0, deckStep = 0, deckStepMax = 0, timerId = 0, timerLeft = 0;
function timerStop() { clearInterval(timerId); timerId = 0 }
function timerAct(btn) {
  const root = btn.closest('.timer'), disp = root.querySelector('.t-disp'), total = +root.dataset.secs, act = btn.dataset.act;
  const paint = () => { disp.textContent = timerLeft > 0 ? fmtTime(timerLeft) : 'Time’s up!'; root.classList.toggle('done', timerLeft <= 0) };
  if (act === 'start') {
    if (timerId) return btn.blur();
    if (timerLeft <= 0) timerLeft = total;
    const end = performance.now() + timerLeft * 1000;
    root.classList.add('run');
    timerId = setInterval(() => { timerLeft = Math.max(0, Math.ceil((end - performance.now()) / 1000)); paint(); if (timerLeft <= 0) { timerStop(); root.classList.remove('run') } }, 200);
  } else if (act === 'pause') { timerStop(); root.classList.remove('run') }
  else { timerStop(); timerLeft = total; root.classList.remove('run'); paint() }
  btn.blur();
}
// Reveal state: elements with data-step <= deckStep get .shown; elements with data-hide <= deckStep get .gone.
function applySteps(animate = false, dir = 1) {
  const root = $('#deck-content'), swaps = [...root.querySelectorAll('h1.swap')];
  const before = swaps.map(h => [...h.children].find(spanVisible));
  root.querySelectorAll('[data-step]').forEach(e => e.classList.toggle('shown', +e.dataset.step <= deckStep));
  root.querySelectorAll('[data-hide]').forEach(e => e.classList.toggle('gone', +e.dataset.hide <= deckStep));
  root.querySelectorAll('[data-on]').forEach(e => e.classList.toggle('on', +e.dataset.on <= deckStep));
  if (animate) swaps.forEach((h, i) => { const now = [...h.children].find(spanVisible); if (before[i] && now && now !== before[i]) retype(h, before[i], now, dir > 0 ? +(h.dataset.delay || 0) : 0) });
}
function deckLabel() {
  $('#deck-next').textContent = deckIndex === BEATS.length - 1 && deckStep >= deckStepMax ? 'Replay' : 'Next';
}
// full = true shows every step at once (arriving with Back).
function renderDeck(full = false) {
  const beat = BEATS[deckIndex], root = $('#deck-content');
  root.innerHTML = beat.html || '';
  $('#deck').classList.toggle('rule-seen', ruleSeen); ruleSeen = true;
  fadeIn(root);
  negify(root);
  timerStop(); const tm = root.querySelector('.timer'); timerLeft = tm ? +tm.dataset.secs : 0;
  deckStepMax = Math.max(0, ...[...root.querySelectorAll('[data-step],[data-on],[data-hide]')].map(e => Math.max(...['step', 'on', 'hide'].map(k => +(e.dataset[k] ?? 0)))));
  deckStep = full ? deckStepMax : 0;
  applySteps();
  startRibbon();
  runDemos(root);
  armNudge($('#deck-next'));
  deckLabel();
}
function openDeck(index, full = false) {
  deckIndex = index; ruleSeen = false;
  wipe(() => { show(3); renderDeck(full) });
}
function enterMat(ex, i) {
  deckIndex = MAT_IDX;
  wipe(() => { show(2); enter(ex, i); fadeIn($('#s2')) });
}
function openTitle() { deckIndex = TITLE_IDX; wipe(showTitle) }
function deckNext() {
  flushSwap();
  if (deckStep < deckStepMax) { deckStep++; applySteps(true, 1); armNudge($('#deck-next')); return deckLabel() }
  if (deckIndex < BEATS.length - 1) {
    deckIndex++;
    if (BEATS[deckIndex].mat) enterMat(0, 0);
    else if (BEATS[deckIndex].title) openTitle();
    else swapDeck();
  } else openDeck(0);
}
function deckBack() {
  flushSwap();
  if (deckStep > 0) { deckStep--; applySteps(true, -1); armNudge($('#deck-next')); return deckLabel() }
  if (deckIndex > 0) {
    deckIndex--;
    if (BEATS[deckIndex].mat) {
      const last = EX.length - 1;
      enterMat(last, EX[last].n.length ? 4 : 1);
    } else if (BEATS[deckIndex].title) {
      openTitle();
    } else {
      swapDeck(true);
    }
  }
}
// Every wipe (the window sweep) dissolves all elements of the slide on screen, background excepted, then runs cb.
const SLIDE_EL = { 1: '#s1', 2: '#s2', 3: '#deck' };
function dissolve(ms, then) {
  const el = $(SLIDE_EL[st.sl]);
  if (reduce || !el) return setTimeout(then, 0);
  el.style.setProperty('--dis', ms + 'ms'); el.classList.add('dissolve');
  setTimeout(() => { el.classList.remove('dissolve'); then() }, ms);
}
function fadeIn(el) { el.classList.remove('fade-in'); if (!reduce) { void el.offsetWidth; el.classList.add('fade-in') } }
function wipe(cb) { const w = $('#wipe'); w.classList.remove('go'); void w.offsetWidth; w.classList.add('go'); dissolve(600, cb) }
// Plain next/previous slide: a fast dissolve of the old slide, then the new one fades in. A tap during the dissolve finishes it at once.
let swapPending = null;
function flushSwap() { if (swapPending) swapPending() }
function swapDeck(full) {
  flushSwap();
  if (reduce) return renderDeck(full);
  const el = $('#deck'); let t;
  const run = () => { clearTimeout(t); swapPending = null; el.classList.remove('dissolve'); renderDeck(full) };
  swapPending = run; el.style.setProperty('--dis', '170ms'); el.classList.add('dissolve'); t = setTimeout(run, 170);
}
function next() {
  if (st.sl == 1) return openDeck(TITLE_IDX + 1);
  if (st.sl == 3) return deckNext();
  if (st.i < M.n - 1) { st.i++; render() }
  else if (st.ex < EX.length - 1) goEx(st.ex + 1, 0);
  else openDeck(MAT_IDX + 1);
}
function prev() {
  if (st.sl == 3) return deckBack();
  if (st.sl == 1) return openDeck(TITLE_IDX - 1, true);
  if (st.sl < 2) return;
  if (st.i > 0) { st.i--; render() }
  else if (st.ex > 0) goEx(st.ex - 1, EX[st.ex - 1].n.length ? 4 : 1);
  else openDeck(MAT_IDX - 1, true);
}

EX.forEach((e, j) => { const b = document.createElement('button'); b.textContent = e.eq.join(' '); b.onclick = () => goEx(j, 0); $('#tabs').appendChild(b) });
$('#nx').onclick = next; $('#bk').onclick = prev; stage.onclick = next; $('#s1').onclick = next;
$('#deck-next').onclick = deckNext; $('#deck-back').onclick = deckBack;
$('#deck-content').onclick = e => {
  const tmr = e.target.closest('.timer');
  if (tmr) { const tb = e.target.closest('button'); if (tb) timerAct(tb); return }
  const z = e.target.closest('.zero-pair');
  if (z) return z.classList.toggle('cancel');
  const c = e.target.closest('.chip-mini');
  if (c) return flipChip(c);
  if (!e.target.closest('a,button')) deckNext();
};
$('#deck-content').addEventListener('keydown', e => {
  const z = e.target.closest('.zero-pair');
  if (z && (e.key == 'Enter' || e.key == ' ')) { e.preventDefault(); e.stopPropagation(); z.classList.toggle('cancel') }
});

document.addEventListener('keydown', e => {
  if (e.key == 'f' || e.key == 'F') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); return }
  if (e.target.closest('button,a')) return;
  if (['ArrowRight', ' ', 'Enter', 'PageDown'].includes(e.key)) { e.preventDefault(); next() }
  if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); prev() }
});
if (!reduce) addEventListener('pointermove', e => { const s = $('#s1').style; s.setProperty('--px', e.clientX / innerWidth - .5); s.setProperty('--py', e.clientY / innerHeight - .5) });

/* ---------- idle world: axis and sine waves ---------- */
const cv = $('#wave'), cx = cv.getContext('2d');
function draw(t) {
  const dpr = devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
  if (cv.width !== Math.round(w * dpr)) { cv.width = w * dpr; cv.height = h * dpr }
  cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, w, h);
  const y0 = h * .5; cx.fillStyle = '#000'; cx.strokeStyle = '#000'; cx.lineWidth = 2;
  cx.beginPath(); cx.moveTo(0, y0); cx.lineTo(w - 14, y0); cx.stroke();
  cx.beginPath(); cx.moveTo(w - 4, y0); cx.lineTo(w - 22, y0 - 8); cx.lineTo(w - 22, y0 + 8); cx.fill();
  [[.3, 1, 0], [.2, 1.6, 1.7]].forEach(([a, f, p], n) => {
    cx.strokeStyle = `rgba(0,0,0,${n ? .3 : .6})`; cx.lineWidth = n ? 1.5 : 2; cx.beginPath();
    for (let x = 0; x <= w; x += 6) { const y = y0 - Math.sin(x / w * Math.PI * 3 * f + p + t / 1800 * (n ? -1 : 1)) * h * a * .4; x ? cx.lineTo(x, y) : cx.moveTo(x, y) }
    cx.stroke()
  })
}
function loop(t) { if (st.sl < 2) draw(t); requestAnimationFrame(loop) }
reduce ? (draw(0), addEventListener('resize', () => draw(0))) : requestAnimationFrame(loop);

/* ---------- start: the deck opens at the first slide (Prayer) ---------- */
show(3); renderDeck();
