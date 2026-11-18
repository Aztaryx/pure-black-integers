const $ = s => document.querySelector(s), stage = $('#stage');
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
const EX = [
  { eq: ['5', '+', '(−3)'], p: [5], n: [3] },
  { eq: ['(−4)', '+', '3'], p: [3], n: [4] },
  { eq: ['(−4)', '+', '(−2)'], p: [], n: [4, 2] },
  { eq: ['3', '+', '2'], p: [3, 2], n: [] }
];

const chips = (count, red = false) =>
  Array.from({ length: count }, (_, i) => `<span class="chip-mini${red ? ' red' : ''}" style="--i:${i}">${red ? '−' : '+'}</span>`).join('');
const chipRow = (...parts) => `<div class="chip-row">${parts.join('<span class="chip-op">+</span>')}</div>`;
// tiles(word): tiles settle in. tiles(word, scrambled): tiles start in the scrambled order and slide into place.
const tiles = (w, from) => {
  const used = [];
  const dx = i => { if (!from) return 0; const j = [...from].findIndex((c, k) => c === w[i] && !used.includes(k)); used.push(j); return j - i };
  return `<div class="tiles${from ? ' slide' : ''}">${[...w].map((c, i) => `<span style="--i:${i};--dx:${dx(i)}">${c}</span>`).join('')}</div>`;
};
// Zero pair: click (or Enter/Space) to cancel it; click again to bring it back. data-auto plays it once on entry.
const zeroPair = (auto = false) =>
  `<div class="zero-pair" role="button" tabindex="0" aria-label="Zero pair. Activate to cancel the pair."${auto ? ' data-auto' : ''}><span class="chip-mini">+</span><span class="chip-mini red">−</span></div>`;
// numberLine(from, to, { shade: 'pos' | 'neg' | 'both', hop: [start, end] }): SVG number line.
// It does not call fmt() because BEATS is built before fmt is defined.
const numberLine = (a, b, o = {}) => {
  const f = n => (n < 0 ? '−' : '') + Math.abs(n), st = 60, pad = 40, W = (b - a) * st + pad * 2, y = 60, X = n => pad + (n - a) * st;
  const shade = (x1, x2, cls) => `<rect class="nl-shade ${cls}" x="${X(x1)}" y="${y - 9}" width="${X(x2) - X(x1)}" height="18" rx="9" style="transform-origin:${X(0)}px ${y}px"/>`;
  const hops = o.hops || (o.hop ? [o.hop] : []), extra = Math.max(0, hops.length - 1) * 12;
  let s = `<svg class="numline" viewBox="0 ${-extra} ${W} ${100 + extra}" role="img" aria-label="Number line from ${f(a)} to ${f(b)}">`;
  if (o.shade === 'pos' || o.shade === 'both') s += shade(0, b, 'pos');
  if (o.shade === 'neg' || o.shade === 'both') s += shade(a, 0, 'neg');
  s += `<line class="nl-axis" x1="${pad - 22}" y1="${y}" x2="${W - pad + 22}" y2="${y}"/><path class="nl-head" d="M${pad - 26} ${y} l12 -7 v14 z M${W - pad + 26} ${y} l-12 -7 v14 z"/>`;
  for (let n = a; n <= b; n++) s += `<line class="nl-tick" x1="${X(n)}" y1="${y - (n ? 9 : 14)}" x2="${X(n)}" y2="${y + (n ? 9 : 14)}"/><text class="nl-lbl${n ? '' : ' zero'}" x="${X(n)}" y="${y + 36}" text-anchor="middle">${f(n)}</text>`;
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
  return `<div class="dots${still ? ' still' : ''}" style="--c:${b}">${Array.from({ length: a * b }, (_, i) => `<i style="--row:${Math.floor(i / b)}"></i>`).join('')}</div>`;
};
const pips = (done, total) => `<div class="pips" role="img" aria-label="Drill ${done} of ${total}">${Array.from({ length: total }, (_, i) => `<i class="${i < done ? 'on' : ''}" style="--i:${i}"></i>`).join('')}</div>`;
const scoreboard = n => {
  const R = [['Round 1', 5], ['Round 2', -3]], t0 = n > 1 ? 5 : 0, t1 = n > 1 ? 2 : 5;
  return `<div class="board" role="img" aria-label="Team A scoreboard"><div class="board-h"><span>Team A</span></div>${R.slice(0, n).map(([l, p], i) => `<div class="board-row${i == n - 1 && n > 1 ? ' new' : ''}"><span>${l}</span><b class="${p > 0 ? 'pos' : 'neg'}">${p > 0 ? '+' : '−'}${Math.abs(p)}</b></div>`).join('')}<div class="board-t"><span>Total</span><b class="count" style="--from:${t0};--to:${t1}"></b></div></div>`;
};
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
const crossRow = (a, b, aRed) => {
  const m = Math.min(a, b), grp = (n, red) => Array.from({ length: n }, (_, i) => `<span class="chip-mini${red ? ' red' : ''} ${i < m ? 'x' : 'keep'}" style="--i:${i}">${red ? '−' : '+'}</span>`).join('');
  return chipRow(grp(a, aRed), grp(b, !aRed));
};
// iconSvg(name, cls): flat line icons on a 64x64 grid, one stroke weight. Objects and abstract shapes only: no faces, no people, no body parts.
// Names: sun desk thermo elevator coin ball check play think link share. cls may be 'blue' or 'red'.
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
  link: '<circle cx="22" cy="32" r="16"/><circle cx="42" cy="32" r="16"/>',
  share: '<path d="M12 8h40a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H32L20 54V42h-8a6 6 0 0 1-6-6V14a6 6 0 0 1 6-6z"/>'
};
const iconSvg = (name, cls = '') => `<svg class="icon${cls ? ' ' + cls : ''}" viewBox="0 0 64 64" aria-hidden="true">${ICONS[name] || ''}</svg>`;
// iconRow([[icon, label], ...]): bordered cards, each an icon over a caption.
const iconRow = items => `<div class="icon-row">${items.map(([n, l], i) => `<figure style="--i:${i}">${iconSvg(n)}<figcaption>${l}</figcaption></figure>`).join('')}</div>`;
// duo(textHtml, visualHtml): text left, graphic right in .deck-visual; stacks on narrow viewports.
const duo = (text, visual) => `<div class="duo"><div class="duo-text">${text}</div><div class="deck-visual">${visual}</div></div>`;
function runDemos(root) {
  if (reduce) return;
  root.querySelectorAll('[data-auto]').forEach(z => setTimeout(() => { if (z.isConnected) z.classList.add('cancel') }, 1500));
}
function flipChip(c) {
  if (c.classList.contains('flip')) return;
  c.classList.add('flip');
  setTimeout(() => { const r = c.classList.toggle('red'); c.textContent = r ? '−' : '+' }, reduce ? 0 : 250);
  setTimeout(() => c.classList.remove('flip'), reduce ? 0 : 500);
}
// Every deck slide shares one structure: a header (kicker + title) and an optional body.
const card = (kicker, title, body = '', q = false) =>
  `<article class="deck-card${body ? '' : ' solo'}"><header class="deck-head"><span class="kicker">${kicker}</span><h1${q ? ' class="q"' : ''}>${title}</h1></header>${body ? `<div class="deck-body">${body}</div>` : ''}</article>`;

const BEATS = [
  // PORTION 2: PRELIMINARIES & NUMERACY DRILLS
  { portion: 'Portion 2 — Preliminaries', beat: '2.1', html: card('Greeting', 'Good Morning!', '<p>Grade 7 – St. Joseph</p>') },
  { portion: 'Portion 2 — Preliminaries', beat: '2.2', html: card('Prayer', 'Let us pray.') },
  { portion: 'Portion 2 — Preliminaries', beat: '2.3', html: card('Classroom Management', 'MATH Rules') },
  { portion: 'Portion 2 — Preliminaries', beat: '2.4', html: card('MATH Rule 1 · M', 'Motivated', '<p>Always do your best in every Mathematics activity.</p>') },
  { portion: 'Portion 2 — Preliminaries', beat: '2.5', html: card('MATH Rule 2 · A', 'Active', '<p>Participate in class discussions and activities.</p>') },
  { portion: 'Portion 2 — Preliminaries', beat: '2.6', html: card('MATH Rule 3 · T', 'Teamwork', '<p>Cooperate and help your classmates.</p>') },
  { portion: 'Portion 2 — Preliminaries', beat: '2.7', html: card('MATH Rule 4 · H', 'Honest', '<p>Be truthful and do your own work.</p>') },
  { portion: 'Portion 2 — Preliminaries', beat: '2.8', html: card('Check-in', 'Attendance & MATHkamustahan', '<h2>How are you feeling today?</h2>') },
  { portion: 'Portion 2 — Warm-up', beat: '2.9', html: card('Activity 1', 'Numeracy Drills', '<p>Multiply as fast as you can.</p>') },
  ...[[5, 6], [7, 6], [11, 5], [8, 8], [10, 14]].flatMap(([r, c], k) => [
    { portion: 'Portion 2 — Warm-up', beat: `2.${10 + 2 * k}`, html: card(`Drill ${k + 1} of 5`, `${r} × ${c} = ?`, dots(r, c) + pips(k + 1, 5)) },
    { portion: 'Portion 2 — Warm-up', beat: `2.${11 + 2 * k}`, html: card(`Drill ${k + 1} of 5`, `${r} × ${c}`, dots(r, c, true) + `<h2 class="answer">${r * c}</h2>` + pips(k + 1, 5)) }
  ]),

  // PORTION 3: RECALL — UNSCRAMBLE ME!
  { portion: 'Portion 3 — Recall', beat: '3.1', html: card('Activity 2', 'Unscramble Me!', '<p>Rearrange the jumbled letters, then answer the question.</p>') },
  { portion: 'Portion 3 — Recall', beat: '3.2', html: card('Word 1 of 3', 'Unscramble the word', tiles('TERINGE')) },
  { portion: 'Portion 3 — Recall', beat: '3.3', html: card('Word 1 Revealed · Question', 'What are integers?', tiles('INTEGER', 'TERINGE') + numberLine(-5, 5, { shade: 'both' }), true) },
  { portion: 'Portion 3 — Recall', beat: '3.4', html: card('Word 2 of 3', 'Unscramble the word', tiles('POITVESI')) },
  { portion: 'Portion 3 — Recall', beat: '3.5', html: card('Word 2 Revealed · Question', 'Where can we find the positive integers on the number line?', tiles('POSITIVE', 'POITVESI') + numberLine(-5, 5, { shade: 'pos' }), true) },
  { portion: 'Portion 3 — Recall', beat: '3.6', html: card('Word 3 of 3', 'Unscramble the word', tiles('VANEGITE')) },
  { portion: 'Portion 3 — Recall', beat: '3.7', html: card('Word 3 Revealed · Question', 'Where can we find the negative integers on the number line?', tiles('NEGATIVE', 'VANEGITE') + numberLine(-5, 5, { shade: 'neg' }), true) },
  { portion: 'Portion 3 — Recall', beat: '3.8', html: card('Follow-up Question', 'Positive vs. Negative', '<h2>How do we distinguish positive integers from negative integers?</h2>') },

  // PORTION 4: SITUATIONAL ANALYSIS — THE SCORE BOARD
  { portion: 'Portion 4 — Situational Analysis', beat: '4.1', html: card('Activity 3 · The Score Board', 'Round 1', '<p>During a classroom quiz bee, Team A earned 5 points in the first round.</p><h2>+5 points</h2>' + scoreboard(1)) },
  { portion: 'Portion 4 — Situational Analysis', beat: '4.2', html: card('Activity 3 · The Score Board', 'Round 2', '<p>However, they received a 3-point deduction in the second round because of a rule violation.</p><h2>−3 points</h2>' + scoreboard(2)) },
  { portion: 'Portion 4 — Situational Analysis', beat: '4.3', html: card('Chip Representation', 'Gained vs. Deducted', '<p>Gained Points (+5)</p>' + chipRow(chips(5)) + '<p>Deduction Points (−3)</p>' + chipRow(chips(3, true))) },
  { portion: 'Portion 4 — Situational Analysis', beat: '4.4', html: card('Guide Question 1', 'What do the blue and red chips represent?', '', true) },
  { portion: 'Portion 4 — Situational Analysis', beat: '4.5', html: card('Guide Question 2', 'Why do you think Team A has two different kinds of chips?', '', true) },
  { portion: 'Portion 4 — Situational Analysis', beat: '4.6', html: card('Guide Question 3', 'In the context of integers for gained and deducted points, which one is positive and which one is negative?', '', true) },
  { portion: 'Portion 4 — Situational Analysis', beat: '4.7', html: card('Guide Question 4', 'How can we organize these chips to understand the team’s score?', '', true) },

  // PORTION 5: VOCABULARY UNLOCK
  { portion: 'Portion 5 — Vocabulary', beat: '5.1', html: card('Unlocking Vocabulary', 'Integers', '<p>Numbers that include positive whole numbers, negative whole numbers, and zero.</p><h2>…, −3, −2, −1, 0, 1, 2, 3, …</h2>' + numberLine(-5, 5)) },
  { portion: 'Portion 5 — Vocabulary', beat: '5.2', html: card('Unlocking Vocabulary', 'Integer Chips', '<p>Concrete models or counters used to represent integers.</p>' + chipRow(chips(1), chips(1, true)) + '<p>Blue = Positive (+1) · Red / Inversion Window = Negative (−1)</p>') },
  { portion: 'Portion 5 — Vocabulary', beat: '5.3', html: card('Unlocking Vocabulary', 'Zero Pair', '<p>A combination of one positive chip and one negative chip that cancel each other out.</p>' + zeroPair(true) + '<h2>(+1) + (−1) = <span class="lit">0</span></h2>') },

  // PORTION 6: THE INTERACTIVE CHIP MAT (#s2)
  { portion: 'Portion 6 — Chip Mat', beat: '6.1–6.4', mat: true },
  { portion: 'Portion 6 — Chip Mat', beat: '6.5', html: card('Cases 1 & 2', 'Same Signs', '<p>Both positive or both negative: combine all chips and count the total.</p><h2>Keep the sign!</h2><div class="split"><div><h3>3 + 2 = 5</h3>' + numberLine(-1, 6, { hop: [3, 5] }) + '</div><div><h3>(−4) + (−2) = −6</h3>' + numberLine(-7, 1, { hop: [-4, -6] }) + '</div></div>') },
  { portion: 'Portion 6 — Chip Mat', beat: '6.6', html: card('Case 3', 'Different Signs', '<p>Pair each positive chip with one negative chip to make zero pairs, remove them, and count what remains.</p>') },

  // PORTION 7: FAMILIARIZE — THINK-PAIR-SHARE
  { portion: 'Portion 7 — Familiarize', beat: '7.1', html: card('Think-Pair-Share', 'Think, Model, and Solve') },
  { portion: 'Portion 7 — Familiarize', beat: '7.2', html: card('Mechanics', 'How We Work', '<ol><li>Model and solve the problem independently using integer chips.</li><li>Pair up to compare representations and explain your solutions.</li><li>Selected pairs share with the class.</li></ol>') },
  { portion: 'Portion 7 — Familiarize', beat: '7.3', html: card('Problem 1', 'Laboratory Temperature', '<p>The temperature in a laboratory was −6°C in the morning. By noon, it increased by 4°C. What was the temperature at noon?</p>') },
  { portion: 'Portion 7 — Familiarize', beat: '7.4', html: card('Problem 1 Solution', '−2°C', '<div class="side"><div class="col">' + chipRow(chips(6, true), chips(4)) + '<h2>(−6) + 4 = −2</h2></div>' + thermo(-6, -2) + '</div>') },
  { portion: 'Portion 7 — Familiarize', beat: '7.5', html: card('Problem 2', 'The Elevator', '<p>An elevator is on the 2nd basement level (−2). It moves up 5 floors. On which floor does it stop?</p>') },
  { portion: 'Portion 7 — Familiarize', beat: '7.6', html: card('Problem 2 Solution', '3rd Floor', '<div class="side"><div class="col">' + chipRow(chips(2, true), chips(5)) + '<h2>(−2) + 5 = 3</h2></div>' + elevator(-2, 3) + '</div>') },

  // PORTION 8: DECIDE — CHIP IT, SOLVE IT!
  { portion: 'Portion 8 — Decide', beat: '8.1', html: card('Group Activity', 'Chip It, Solve It!') },
  { portion: 'Portion 8 — Decide', beat: '8.2', html: card('Mechanics', 'Work in 4 Groups', '<ul><li>Each group receives a problem suited to its level.</li><li>Represent and solve using colored integer chips.</li><li>Present your chip model and explain your process.</li></ul>') },
  { portion: 'Portion 8 — Decide', beat: '8.3', html: card('Grading Rubric', '25 Points', '<div class="grid-cards"><article>Accuracy — 5 pts</article><article>Use of Chips — 5 pts</article><article>Explanation — 5 pts</article><article>Teamwork — 5 pts</article><article>Presentation — 5 pts</article></div>') },
  { portion: 'Portion 8 — Decide', beat: '8.4', html: card('Group 1 · Simple Expressions', '4 + 3 = ?<br>(−7) + 3 = ?') },
  { portion: 'Portion 8 — Decide', beat: '8.5', html: card('Group 1 Check', 'Answers', '<h2 class="answer">7</h2><br><h2 class="answer">−4</h2>') },
  { portion: 'Portion 8 — Decide', beat: '8.6', html: card('Group 2 · Mathematical Phrases', 'Translate & Solve', '<p>“The sum of negative five and positive eight.”</p>') },
  { portion: 'Portion 8 — Decide', beat: '8.7', html: card('Group 2 Check', '(−5) + 8', '<h2 class="answer">3</h2>') },
  { portion: 'Portion 8 — Decide', beat: '8.8', html: card('Group 3 · Basic Word Problem', 'Mia’s Score', '<p>Mia starts with 12 points. She earns 8 points in Round 1, loses 15 points in Round 2, and earns 7 points in Round 3. How many points does Mia have at the end?</p>') },
  { portion: 'Portion 8 — Decide', beat: '8.9', html: card('Group 3 Check', '12 + 8 + (−15) + 7', '<h2 class="answer">12 points</h2>') },
  { portion: 'Portion 8 — Decide', beat: '8.10', html: card('Group 4 · Challenging Word Problem', 'Carlo’s Score', '<p>Carlo starts with 5 points. He loses 12 points in Round 1, earns 18 points in Round 2, loses 9 points in Round 3, and earns 7 points in the final round. What is Carlo’s final score?</p>') },
  { portion: 'Portion 8 — Decide', beat: '8.11', html: card('Group 4 Check', '5 + (−12) + 18 + (−9) + 7', '<h2 class="answer">9 points</h2>') },

  // PORTION 9: FORMATIVE ASSESSMENT
  { portion: 'Portion 9 — Assessment', beat: '9.1', html: card('Formative Assessment', 'Time to Test Your Understanding', '<p>Blue chips = +1 · Red chips = −1. Cross out opposite-color pairs (zero pairs), count the remaining chips, and write the sum.</p>') },
  { portion: 'Portion 9 — Assessment', beat: '9.2', html: card('Quiz Items', 'Answer All 5 Items', '<div class="quiz-grid"><article>1. (+5) + (+2)' + chipRow(chips(5), chips(2)) + '</article><article>2. (−5) + (−3)' + chipRow(chips(5, true), chips(3, true)) + '</article><article>3. (−2) + (+6)' + chipRow(chips(2, true), chips(6)) + '</article><article>4. (+4) + (−1)' + chipRow(chips(4), chips(1, true)) + '</article><article class="full">5. Traveler drove 7 km, then 2 km more, then went back 6 km. How far to return to start?' + chipRow(chips(7), chips(2), chips(6, true)) + '</article></div>') },
  { portion: 'Portion 9 — Assessment', beat: '9.3', html: card('Check · Item 1', '(+5) + (+2)', chipRow(chips(5), chips(2)) + '<h2 class="answer">7</h2>') },
  { portion: 'Portion 9 — Assessment', beat: '9.4', html: card('Check · Item 2', '(−5) + (−3)', chipRow(chips(5, true), chips(3, true)) + '<h2 class="answer">−8</h2>') },
  { portion: 'Portion 9 — Assessment', beat: '9.5', html: card('Check · Item 3', '(−2) + (+6)', crossRow(2, 6, true) + '<h2 class="answer">4</h2>') },
  { portion: 'Portion 9 — Assessment', beat: '9.6', html: card('Check · Item 4', '(+4) + (−1)', crossRow(4, 1, false) + '<h2 class="answer">3</h2>') },
  { portion: 'Portion 9 — Assessment', beat: '9.7', html: card('Check · Item 5', '(+7) + (+2) + (−6) = +3', chipRow(chips(7), chips(2), chips(6, true)) + numberLine(0, 10, { hops: [[0, 7], [7, 9], [9, 3]] }) + '<h2 class="answer">3 km back to start</h2>') },

  // PORTION 10: REFLECTION & EXTENDED LEARNING
  { portion: 'Portion 10 — Reflection', beat: '10.1', html: card('Everyday Situations', 'Where Do We Use Integers?', '<div class="grid-cards"><article>Attendance</article><article>Temperature Changes</article><article>Money Transactions</article><article>Basketball Scores</article></div>') },
  { portion: 'Portion 10 — Reflection', beat: '10.2', html: card('Reflective Question', 'How can we use the addition of integers to solve problems in our everyday situations?', '', true) },
  { portion: 'Portion 10 — Ways Forward', beat: '10.3', html: card('Explore Digital Learning Resources', 'Addition of Integers', '<p>Grade 7 MATATAG Educational Video</p><h2><a href="https://youtu.be/gLQoEzKKTyQ?si=Y_CoLReMDYs05oWk" target="_blank" rel="noopener">youtu.be/gLQoEzKKTyQ</a></h2>') },
  { portion: 'Portion 10 — Closing', beat: '10.4', html: card('Thank you!', 'Grade 7 – St. Joseph', '<p>Prepared by: Joshua Philip M. Aure</p>') }
];

const MAT_IDX = BEATS.findIndex(b => b.mat);
const sum = a => a.reduce((x, y) => x + y, 0), fmt = n => (n < 0 ? '−' : '') + Math.abs(n);
const X = (k, g) => .6 + k * 1.1 + g * .35, YS = .3, YM = 1.825;
let st = { sl: 0, ex: 0, i: 0 }, M;

/* ---------- opening: the star and the portal, drawn in code ---------- */
const ic = $('#ic'), ix = ic.getContext('2d');
const SL = [...Array(120)].map(() => ({ a: Math.random() * 6.283, r: .28 + Math.random() * .45, l: .06 + Math.random() * .22, o: .1 + Math.random() * .3, v: .02 + Math.random() * .06 }));
let T0 = 0, done = true;
(() => {
  const g = document.createElement('canvas'); g.width = g.height = 160; const c = g.getContext('2d'), d = c.createImageData(160, 160);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255 }
  c.putImageData(d, 0, 0); $('#gr').style.backgroundImage = `url(${g.toDataURL()})`
})();
function rot(x, y, z, a, b, c) {
  const y1 = y * Math.cos(a) - z * Math.sin(a), z1 = y * Math.sin(a) + z * Math.cos(a), x2 = x * Math.cos(b) + z1 * Math.sin(b);
  return [x2 * Math.cos(c) - y1 * Math.sin(c), x2 * Math.sin(c) + y1 * Math.cos(c)]
}
function ring(a, b, c, R, lw, dash, al) {
  ix.beginPath(); for (let i = 0; i <= 96; i++) { const t = i / 96 * 6.2832, p = rot(Math.cos(t), Math.sin(t), 0, a, b, c); i ? ix.lineTo(p[0] * R, p[1] * R) : ix.moveTo(p[0] * R, p[1] * R) }
  ix.lineWidth = lw; ix.setLineDash(dash || []); ix.strokeStyle = `rgba(255,255,255,${al})`; ix.stroke()
}
function star(R) { ix.beginPath(); for (let i = 0; i <= 64; i++) { const t = i / 64 * 6.2832, x = R * Math.cos(t) ** 3, y = R * Math.sin(t) ** 3; i ? ix.lineTo(x, y) : ix.moveTo(x, y) } ix.closePath() }
function frame(now) {
  if (done) return;
  const t = (now - T0) / 1000, w = ic.width = innerWidth, h = ic.height = innerHeight;
  ix.clearRect(0, 0, w, h); ix.save(); ix.translate(w / 2, h / 2);
  const minD = Math.min(w, h);
  ix.fillStyle = '#fff'; star(minD * .12); ix.fill();
  ring(t * .7, t * .5, t * .3, minD * .2, 1.5, [4, 6], .7);
  ring(t * .4, -t * .6, t * .2, minD * .28, 2, [8, 8], .5);
  ring(-t * .5, t * .3, -t * .4, minD * .38, 1, [], .3);
  SL.forEach(s => {
    s.r += s.v * 0.02; if (s.r > 1) s.r -= .7;
    const r1 = s.r * minD * .5, r2 = (s.r + s.l) * minD * .5;
    ix.beginPath(); ix.lineWidth = 1.5; ix.strokeStyle = `rgba(255,255,255,${s.o})`;
    ix.moveTo(Math.cos(s.a) * r1, Math.sin(s.a) * r1); ix.lineTo(Math.cos(s.a) * r2, Math.sin(s.a) * r2); ix.stroke()
  });
  ix.restore();
  requestAnimationFrame(frame);
}

const iv = $('#iv'), gl = $('#gl'), ia = $('#ia'), gx = gl.getContext('2d'), I = $('#intro');
let phase = 0, vfail = false, playing = false, fbOn = false;
function black() { gl.width = innerWidth; gl.height = innerHeight; gx.fillStyle = '#000'; gx.fillRect(0, 0, gl.width, gl.height); gl.style.display = 'block' }
function glitch(cb) {
  const w = gl.width = innerWidth, h = gl.height = innerHeight;
  gl.style.display = 'block'; ia.style.filter = 'url(#ca)';
  const gw = $('#gw');
  if (gw) {
    gw.innerHTML = '';
    const gwinData = [
      { y: '0vh', h: '100vh', w: '5vw', tx: '-115vw', dur: 1.1, del: 0.02 },
      { y: '14vh', h: '42vh', w: '18vw', tx: '-100vw', dur: 1.25, del: 0.12 },
      { y: '65vh', h: '25vh', w: '35vw', tx: '-110vw', dur: 1.35, del: 0.22 },
      { y: '3vh', h: '18vh', w: '8vw', tx: '-90vw', dur: 1.05, del: 0.35 },
      { y: '30vh', h: '65vh', w: '12vw', tx: '-105vw', dur: 1.3, del: 0.48 },
      { y: '0vh', h: '100vh', w: '26vw', tx: '-120vw', dur: 1.45, del: 0.62 },
      { y: '22vh', h: '30vh', w: '6vw', tx: '-85vw', dur: 1.1, del: 0.78 },
      { y: '55vh', h: '40vh', w: '22vw', tx: '-105vw', dur: 1.3, del: 0.95 },
      { y: '8vh', h: '84vh', w: '4vw', tx: '-95vw', dur: 1.15, del: 1.12 },
      { y: '42vh', h: '16vh', w: '28vw', tx: '-100vw', dur: 1.2, del: 1.30 }
    ];
    gwinData.forEach(d => {
      const div = document.createElement('div');
      div.className = 'gwin';
      div.style.cssText = `--y:${d.y};--h:${d.h};--w:${d.w};--tx:${d.tx};--dur:${d.dur}s;--del:${d.del}s;`;
      gw.appendChild(div);
    });
  }
  const deadPixels = [];
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * w, rx = (w - x) / w;
    deadPixels.push({ x, y: Math.random() * h, w: Math.random() < 0.6 ? 2 + Math.floor(Math.random() * 4) : 6 + Math.floor(Math.random() * 8), h: Math.random() < 0.6 ? 2 + Math.floor(Math.random() * 4) : 4 + Math.floor(Math.random() * 10), t: 0.08 + Math.pow(rx, 1.15) * 1.9 + (Math.random() - .5) * 0.2, col: Math.random() < 0.75 ? '#000' : '#fff' });
  }
  const deadStrips = [];
  for (let i = 0; i < 110; i++) {
    const x = Math.random() * w, rx = (w - x) / w, isHoriz = Math.random() < 0.7;
    deadStrips.push({ x, y: Math.random() * h, w: isHoriz ? 30 + Math.random() * 260 : 2 + Math.random() * 5, h: isHoriz ? 1 + Math.random() * 4 : 25 + Math.random() * 160, t: 0.12 + Math.pow(rx, 1.15) * 1.85 + (Math.random() - .5) * 0.22, col: Math.random() < 0.7 ? '#000' : '#fff' });
  }
  const deadBlocks = [];
  for (let i = 0; i < 75; i++) {
    const x = Math.random() * w, rx = (w - x) / w;
    deadBlocks.push({ x, y: Math.random() * h, w: 16 + Math.random() * 90, h: 8 + Math.random() * 55, t: 0.18 + Math.pow(rx, 1.15) * 1.8 + (Math.random() - .5) * 0.25, col: Math.random() < 0.8 ? '#000' : '#fff' });
  }
  const deadMacro = [];
  for (let i = 0; i < 22; i++) {
    const x = Math.random() * w, rx = (w - x) / w;
    deadMacro.push({ x, y: Math.random() * h, w: 90 + Math.random() * 320, h: 40 + Math.random() * 180, t: 0.35 + Math.pow(rx, 1.2) * 1.75 + (Math.random() - .5) * 0.25, col: Math.random() < 0.85 ? '#000' : '#fff' });
  }
  const t0 = performance.now();
  (function f(now) {
    const t = (now - t0) / 1000, g = Math.min(1, t / 1.6);
    if (t > 2.75) { black(); return cb() }
    requestAnimationFrame(f);
    const shake = g * g, drift = Math.sin(t * 3.7) * 5 * shake, sway = Math.sin(t * 2.3) * 2.5 * shake;
    ia.style.transform = `translate(${drift + (Math.random() - .5) * 3 * shake}px,${sway + (Math.random() - .5) * 2 * shake}px) skewX(${Math.sin(t * 5.1) * 1.5 * shake}deg)`;
    const caOff = Math.sin(t * 4.3) * (2 + 5 * g) + (Math.random() - .5) * 2 * g;
    $('#or').setAttribute('dx', -Math.abs(caOff)); $('#or').setAttribute('dy', Math.sin(t * 2.9) * 1.2 * g);
    $('#oc').setAttribute('dx', Math.abs(caOff)); $('#oc').setAttribute('dy', -Math.sin(t * 2.9) * 1.2 * g);
    gx.clearRect(0, 0, w, h);
    const frontX = w * (1 - Math.min(1.1, Math.pow(t / 2.1, 1.15)));
    deadPixels.forEach(p => { if (t >= p.t) { gx.fillStyle = p.col; gx.fillRect(p.x, p.y, p.w, p.h) } });
    deadStrips.forEach(s => { if (t >= s.t) { gx.fillStyle = s.col; gx.fillRect(s.x, s.y, s.w, s.h) } });
    deadBlocks.forEach(b => { if (t >= b.t) { const scale = Math.min(1, (t - b.t) * 12); gx.fillStyle = b.col; gx.fillRect(b.x, b.y, b.w * scale, b.h * scale) } });
    deadMacro.forEach(m => { if (t >= m.t) { const scale = Math.min(1, (t - m.t) * 8); gx.fillStyle = m.col; gx.fillRect(m.x, m.y, m.w * scale, m.h * scale) } });
    if (frontX > -50 && frontX < w + 50) {
      for (let i = 0; i < 35; i++) {
        const px = frontX + (Math.random() - .35) * 70, py = Math.random() * h;
        const pw = Math.random() < 0.7 ? 2 + Math.random() * 4 : 10 + Math.random() * 40;
        const ph = Math.random() < 0.7 ? 2 + Math.random() * 4 : 1 + Math.random() * 3;
        gx.fillStyle = Math.random() < 0.6 ? '#000' : '#fff'; gx.fillRect(px, py, pw, ph);
      }
    }
  })(t0);
}
function fb() { if (fbOn) return; fbOn = true; I.classList.add('fb'); gl.style.display = ia.style.display = 'none'; T0 = performance.now(); done = false; requestAnimationFrame(frame); setTimeout(() => { if (phase == 2) reveal() }, 5200) }
function playV() {
  if (playing || fbOn) return; playing = true; I.classList.add('vid'); iv.currentTime = 0;
  iv.play().then(() => setTimeout(() => { gl.style.display = ia.style.display = 'none' }, 80)).catch(fb)
}
function startVid() {
  phase = 2; if (vfail) return fb();
  if (iv.readyState >= 2) playV(); else { iv.addEventListener('loadeddata', playV, { once: true }); setTimeout(() => { if (phase == 2 && !playing) fb() }, 3500) }
}
iv.addEventListener('error', () => { vfail = true; if (phase == 2 && !playing) fb() });
iv.addEventListener('ended', () => { if (phase == 2) reveal() });
function reveal() {
  if (phase == 3) return; phase = 3; const s = $('#s1'); s.classList.add('show'); show(1);
  setTimeout(() => { I.style.display = 'none'; iv.pause(); done = true; const gw = $('#gw'); if (gw) gw.innerHTML = ''; }, 400);
  setTimeout(() => s.classList.add('txt'), reduce ? 0 : 300);
  setTimeout(() => {
    s.classList.add('rev');
    document.body.classList.add('ready');
    setTimeout(startWinSpawner, reduce ? 0 : 3000);
  }, reduce ? 0 : 2200);
}
function begin() {
  if (phase == 0) { phase = 1; if (reduce) { black(); return startVid() } return glitch(startVid) }
  if (phase == 2) reveal()
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
  stage.querySelectorAll('.chip,.win2').forEach(e => e.remove());
  const ex = EX[i], P = sum(ex.p), N = sum(ex.n);
  M = { ex, P, N, m: Math.min(P, N), R: P - N, B: [], W: [], R2: [], n: N ? 5 : 2 };
  let k = 0; ex.p.forEach((n, g) => { for (let j = 0; j < n; j++)M.B.push({ e: mk('chip', '+'), k: k++, g }) });
  k = 0; ex.n.forEach((n, g) => { const e = mk('win2'); e.style.width = `calc(var(--u)*${n * 1.1 - .1})`; e.innerHTML = `<i>−${n}</i>`; M.W.push({ e, o: k, g }); k += n });
  for (let j = P; j < N; j++)M.R2.push({ e: mk('chip', '+'), k: j });
  document.querySelectorAll('#tabs button').forEach((b, j) => b.classList.toggle('on', j == i));
}
function cap(s) {
  const { P, N, m, R, ex } = M, d = N - P, pl = n => n > 1 ? 's' : '';
  if (!N) return s < 4 ? 'Blue chips are positive. Two groups: ' + ex.p.join(' and ') + '.' : 'No window needed. Count every blue chip: ' + R + '.';
  return [
    P ? `${P} blue chip${pl(P)} on the mat: +${P}.` : 'The mat is empty.',
    `The negative arrives as ${ex.n.length > 1 ? 'inversion windows' : 'an inversion window'}: ${N} cells, −${N}.`,
    !P ? `Windows invert the empty mat: ${N} red chips appear.` : d <= 0 ? 'Overlay it. Everything under the window inverts: blue becomes red.' : `Overlay it. ${P} chip${pl(P)} invert to red. The extra ${d === 1 ? 'cell is' : d + ' cells are'} over empty space, so ${d === 1 ? 'a red chip is' : 'red chips are'} born.`,
    m ? 'Inverted chips cancel their cells. These are zero pairs, and they fade away.' : 'The windows close. The red chips stay.',
    R > 0 ? `Count what is left: ${R} blue chip${pl(R)}. Answer: ${R}.` : `Count what is left: ${-R} red chip${pl(-R)}. Answer: ${fmt(R)}.`
  ][s];
}
function render(pre) {
  const { P, N, m, R } = M, s = pre ? -1 : (N ? st.i : (st.i ? 4 : 0));
  M.B.forEach(c => {
    const gone = N && s >= 3 && c.k < m, x = s >= 4 && c.k >= m ? X(c.k - m, 0) : X(c.k, c.g);
    c.e.textContent = N && s >= 2 && c.k < m ? '−' : '+'; c.e.classList.toggle('gone', !!gone);
    put(c.e, x + .1, YM + .1, s < 0 || gone ? 0 : 1, gone ? 1.5 : 1)
  });
  M.W.forEach(w => put(w.e, s >= 2 ? X(w.o, 0) : X(w.o, w.g), s >= 2 ? YM : YS, s >= 1 && s < 3 ? 1 : 0));
  M.R2.forEach(c => { const v = s >= 2, red = s >= 3; c.e.classList.toggle('r', red); c.e.textContent = red ? '−' : '+'; put(c.e, X(s >= 4 ? c.k - P : c.k, 0) + .1, YM + .1, v ? 1 : 0, v ? 1 : .3) });
  if (pre) return;
  $('#eq').innerHTML = M.ex.eq.join(' ') + ' = ' + (s >= 4 ? `<b>${fmt(R)}</b>` : '?');
  $('#cap').textContent = cap(s);
  armNudge($('#nx'));
  $('#nx').textContent = st.i < M.n - 1 ? 'Next' : st.ex < EX.length - 1 ? 'Next example' : 'Continue';
}
function enter(ex, i) {
  st.ex = ex; st.i = i; stage.classList.add('nt'); build(ex); render(true); void stage.offsetWidth; stage.classList.remove('nt');
  $('#eq').innerHTML = M.ex.eq.join(' ') + ' = ?';
  requestAnimationFrame(() => requestAnimationFrame(() => render()));
}
function show(n) {
  st.sl = n;
  $('#s2').classList.toggle('on', n == 2);
  $('#deck').classList.toggle('on', n == 3);
  if (n == 2 || n == 3) {
    stopWinSpawner();
    par.innerHTML = '';
  } else if (n == 1 && $('#s1').classList.contains('rev')) {
    startWinSpawner();
  }
}

let deckIndex = 0;
function renderDeck() {
  const beat = BEATS[deckIndex];
  $('#deck-content').innerHTML = beat.html || '';
  runDemos($('#deck-content'));
  armNudge($('#deck-next'));
  $('#deck-next').textContent = deckIndex === BEATS.length - 1 ? 'Replay' : 'Next';
}
function openDeck(index) {
  deckIndex = index;
  wipe(() => { show(3); renderDeck() });
}
function enterMat(ex, i) {
  deckIndex = MAT_IDX;
  wipe(() => { show(2); enter(ex, i) });
}
function deckNext() {
  if (deckIndex < BEATS.length - 1) {
    deckIndex++;
    if (BEATS[deckIndex].mat) enterMat(0, 0);
    else renderDeck();
  } else {
    deckIndex = 0;
    wipe(() => show(1));
  }
}
function deckBack() {
  if (deckIndex > 0) {
    deckIndex--;
    if (BEATS[deckIndex].mat) {
      const last = EX.length - 1;
      enterMat(last, EX[last].n.length ? 4 : 1);
    } else {
      renderDeck();
    }
  } else {
    wipe(() => show(1));
  }
}
function wipe(cb) { const w = $('#wipe'); w.classList.remove('go'); void w.offsetWidth; w.classList.add('go'); setTimeout(cb, reduce ? 0 : 650) }
function next() {
  if (st.sl == 0) return begin();
  if (st.sl == 1) return openDeck(0);
  if (st.sl == 3) return deckNext();
  if (st.i < M.n - 1) { st.i++; render() }
  else if (st.ex < EX.length - 1) enter(st.ex + 1, 0);
  else openDeck(MAT_IDX + 1);
}
function prev() {
  if (st.sl == 3) return deckBack();
  if (st.sl < 2) return;
  if (st.i > 0) { st.i--; render() }
  else if (st.ex > 0) enter(st.ex - 1, EX[st.ex - 1].n.length ? 4 : 1);
  else openDeck(MAT_IDX - 1);
}

EX.forEach((e, j) => { const b = document.createElement('button'); b.textContent = e.eq.join(' '); b.onclick = () => enter(j, 0); $('#tabs').appendChild(b) });
$('#nx').onclick = next; $('#bk').onclick = prev; stage.onclick = next; $('#intro').onclick = begin;
$('#deck-next').onclick = deckNext; $('#deck-back').onclick = deckBack;
$('#deck-content').onclick = e => {
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