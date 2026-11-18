const $ = s => document.querySelector(s), stage = $('#stage');
    const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const EX = [
      { eq: ['5', '+', '(−3)'], p: [5], n: [3] },
      { eq: ['(−4)', '+', '3'], p: [3], n: [4] },
      { eq: ['(−4)', '+', '(−2)'], p: [], n: [4, 2] },
      { eq: ['3', '+', '2'], p: [3, 2], n: [] }];
    const chipRow = (count, red = false) => '<div class="chip-row">' + Array.from({ length: count }, () => `<span class="chip-mini${red ? ' red' : ''}">${red ? '−' : '+'}</span>`).join('') + '</div>';
    const card = (kicker, title, body) => `<article class="deck-card"><span class="kicker">${kicker}</span><h1>${title}</h1>${body}</article>`;
    const BEATS = [
      { portion: 'Portion 2 — Preliminaries', beat: '2.1', html: card('Greeting', 'Good Morning!', '<p>Grade 7 – St. Joseph</p>') },
      { portion: 'Portion 2 — Preliminaries', beat: '2.2', html: card('Prayer', 'Let us pray.', '') },
      { portion: 'Portion 2 — Preliminaries', beat: '2.3', html: card('MATH Classroom Rules', 'MATH', '<p>Motivated · Active · Teamwork · Honest</p>') },
      { portion: 'Portion 2 — Preliminaries', beat: '2.4', html: card('M', 'Motivated', '<p>Always do your best in every Mathematics activity.</p>') },
      { portion: 'Portion 2 — Preliminaries', beat: '2.5', html: card('A', 'Active', '<p>Participate in class discussions and activities.</p>') },
      { portion: 'Portion 2 — Preliminaries', beat: '2.6', html: card('T', 'Teamwork', '<p>Cooperate and help your classmates.</p>') },
      { portion: 'Portion 2 — Preliminaries', beat: '2.7', html: card('H', 'Honest', '<p>Be truthful and do your own work.</p>') },
      { portion: 'Portion 2 — Preliminaries', beat: '2.8', html: card('Check-in', 'Attendance & MATHkamustahan', '<h2>How are you feeling today?</h2>') },
      { portion: 'Portion 2 — Warm-up', beat: '2.9', html: card('Activity 1', 'Numeracy Drills', '<p>Multiply. Click Next to reveal each answer.</p>') },
      { portion: 'Portion 2 — Warm-up', beat: '2.10', html: card('Drill 1', '3 × 4', '<h2 class="answer">12</h2>') },
      { portion: 'Portion 2 — Warm-up', beat: '2.11', html: card('Drill 2', '7 × 6', '<h2 class="answer">42</h2>') },
      { portion: 'Portion 2 — Warm-up', beat: '2.12', html: card('Drill 3', '9 × 8', '<h2 class="answer">72</h2>') },
      { portion: 'Portion 2 — Warm-up', beat: '2.13', html: card('Drill 4', '12 × 5', '<h2 class="answer">60</h2>') },
      { portion: 'Portion 2 — Warm-up', beat: '2.14', html: card('Drill 5', '15 × 6', '<h2 class="answer">90</h2>') },
      { portion: 'Portion 3 — Recall', beat: '3.1', html: card('Activity 2', 'Unscramble Me!', '<p>Rearrange the letters, then answer the question.</p>') },
      { portion: 'Portion 3 — Recall', beat: '3.2', html: card('Unscramble', 'T E R I N G E', '') },
      { portion: 'Portion 3 — Recall', beat: '3.3', html: card('Reveal', 'I N T E G E R', '<h2>What are integers?</h2>') },
      { portion: 'Portion 3 — Recall', beat: '3.4', html: card('Unscramble', 'P O I T V E S I', '') },
      { portion: 'Portion 3 — Recall', beat: '3.5', html: card('Reveal', 'P O S I T I V E', '<h2>Where can we find positive integers on the number line?</h2>') },
      { portion: 'Portion 3 — Recall', beat: '3.6', html: card('Unscramble', 'V A N E G I T E', '') },
      { portion: 'Portion 3 — Recall', beat: '3.7', html: card('Reveal', 'N E G A T I V E', '<h2>Where can we find negative integers on the number line?</h2>') },
      { portion: 'Portion 3 — Recall', beat: '3.8', html: card('Follow-up', 'Positive & Negative', '<h2>How do we distinguish positive integers from negative integers?</h2>') },
      { portion: 'Portion 4 — Situational Analysis', beat: '4.1', html: card('Activity 3 — The Score Board', 'Round 1', '<p>During a classroom quiz bee, Team A earned 5 points.</p><h2>+5</h2>') },
      { portion: 'Portion 4 — Situational Analysis', beat: '4.2', html: card('Round 2', 'A 3-point deduction', '<p>They received a 3-point deduction because of a rule violation.</p><h2>−3</h2>') },
      { portion: 'Portion 4 — Situational Analysis', beat: '4.3', html: card('Chip Visual', 'Gained vs. Deducted', chipRow(5) + chipRow(3, true)) },
      { portion: 'Portion 4 — Situational Analysis', beat: '4.4', html: card('Question 1', 'What do the blue and red chips represent?', '') },
      { portion: 'Portion 4 — Situational Analysis', beat: '4.5', html: card('Question 2', 'Why does Team A have two different kinds of chips?', '') },
      { portion: 'Portion 4 — Situational Analysis', beat: '4.6', html: card('Question 3', 'Which color is positive and which is negative?', '') },
      { portion: 'Portion 4 — Situational Analysis', beat: '4.7', html: card('Question 4', 'How can we organize these chips to understand the team’s score?', '') },
      { portion: 'Portion 5 — Vocabulary', beat: '5.1', html: card('Vocabulary', 'Integers', '<p>Positive whole numbers, negative whole numbers, and zero.</p><h2>…, −3, −2, −1, 0, 1, 2, 3, …</h2>') },
      { portion: 'Portion 5 — Vocabulary', beat: '5.2', html: card('Vocabulary', 'Integer Chips', '<p>Concrete models or counters used to represent integers.</p>' + chipRow(1) + chipRow(1, true)) },
      { portion: 'Portion 5 — Vocabulary', beat: '5.3', html: card('Vocabulary', 'Zero Pair', '<p>One positive chip and one negative chip cancel each other out.</p><h2>(+1) + (−1) = 0</h2>') },
      { portion: 'Portion 6 — Chip Mat', beat: '6.1–6.4', mat: true },
      { portion: 'Portion 6 — Chip Mat', beat: '6.5', html: card('Rule Check', 'Same Signs', '<p>No zero pairs. Combine all chips and keep the sign.</p><h2>Cases 1 & 2</h2>') },
      { portion: 'Portion 6 — Chip Mat', beat: '6.6', html: card('Rule Check', 'Different Signs', '<p>Pair up and cancel zero pairs, then count what remains.</p><h2>Case 3</h2>') },
      { portion: 'Portion 7 — Familiarize', beat: '7.1', html: card('Think, Model, and Solve', 'Think-Pair-Share', '') },
      { portion: 'Portion 7 — Familiarize', beat: '7.2', html: card('Problem 1', 'Temperature', '<p>The temperature in a laboratory was −6°C in the morning. By noon, it increased by 4°C. What was the temperature at noon?</p>') },
      { portion: 'Portion 7 — Familiarize', beat: '7.3', html: card('Problem 1 Solution', '−2°C', '<p>6 red + 4 blue → 4 zero pairs cancel → 2 red remain.</p><h2>(−6) + 4 = −2</h2>') },
      { portion: 'Portion 7 — Familiarize', beat: '7.4', html: card('Problem 2', 'Elevator', '<p>An elevator is on the 2nd basement level (−2). It moves up 5 floors. On which floor does it stop?</p>') },
      { portion: 'Portion 7 — Familiarize', beat: '7.5', html: card('Problem 2 Solution', '3rd Floor', '<p>2 red + 5 blue → 2 zero pairs cancel → 3 blue remain.</p><h2>(−2) + 5 = 3</h2>') },
      { portion: 'Portion 8 — Decide', beat: '8.1', html: card('Group Activity', 'Chip It, Solve It!', '') },
      { portion: 'Portion 8 — Decide', beat: '8.2', html: card('Mechanics', 'Work in 4 Groups', '<ul><li>Use task cards and colored chips.</li><li>Present your chip model.</li><li>Explain the process.</li></ul>') },
      { portion: 'Portion 8 — Decide', beat: '8.3', html: card('Grading Rubric', '25 Points', '<div class="grid-cards"><article>Accuracy — 5</article><article>Use of Chips — 5</article><article>Explanation — 5</article><article>Teamwork — 5</article><article>Presentation — 5</article></div>') },
      { portion: 'Portion 8 — Decide', beat: '8.4', html: card('Group 1', 'Simple Expressions', '<h2>4 + 3 = ?</h2><h2>(−7) + 3 = ?</h2>') },
      { portion: 'Portion 8 — Decide', beat: '8.5', html: card('Group 1 Check', 'Answers', '<h2>7 &nbsp; and &nbsp; −4</h2>') },
      { portion: 'Portion 8 — Decide', beat: '8.6', html: card('Group 2', 'Mathematical Phrase', '<p>Translate, then solve using chips:</p><h2>“The sum of negative five and positive eight.”</h2>') },
      { portion: 'Portion 8 — Decide', beat: '8.7', html: card('Group 2 Check', '(−5) + 8 = 3', '') },
      { portion: 'Portion 8 — Decide', beat: '8.8', html: card('Group 3', 'Basic Word Problem', '<p>Mia starts with 12 points. She earns 8, loses 15, and earns 7. How many points does she have?</p>') },
      { portion: 'Portion 8 — Decide', beat: '8.9', html: card('Group 3 Check', '12 points', '<h2>12 + 8 + (−15) + 7 = 12</h2>') },
      { portion: 'Portion 8 — Decide', beat: '8.10', html: card('Group 4', 'Challenging Word Problem', '<p>Carlo starts with 5. He loses 12, earns 18, loses 9, and earns 7. What is his final score?</p>') },
      { portion: 'Portion 8 — Decide', beat: '8.11', html: card('Group 4 Check', '9 points', '<h2>5 + (−12) + 18 + (−9) + 7 = 9</h2>') },
      { portion: 'Portion 9 — Assessment', beat: '9.1', html: card('Time to Test Your Understanding', 'Formative Assessment', '<p>Blue = +1 · Red = −1. Cross out zero pairs, count the remainder, and write the sum.</p>') },
      { portion: 'Portion 9 — Assessment', beat: '9.2', html: card('Quiz Display', 'Solve Four Items', '<div class="quiz-grid"><article>1. (+5) + (+2)</article><article>2. (−5) + (−3)</article><article>3. (−2) + (+6)</article><article>4. (+4) + (−1)</article></div><p>Optional traveler item: (+7) + (+2) + (−6)</p>') },
      { portion: 'Portion 9 — Assessment', beat: '9.3', html: card('Checking 1', '(+5) + (+2)', '<h2 class="answer">7</h2>') },
      { portion: 'Portion 9 — Assessment', beat: '9.4', html: card('Checking 2', '(−5) + (−3)', '<h2 class="answer">−8</h2>') },
      { portion: 'Portion 9 — Assessment', beat: '9.5', html: card('Checking 3', '(−2) + (+6)', '<h2 class="answer">4</h2>') },
      { portion: 'Portion 9 — Assessment', beat: '9.6', html: card('Checking 4', '(+4) + (−1)', '<h2 class="answer">3</h2><p>Traveler item: (+7) + (+2) + (−6) = 3 km</p>') },
      { portion: 'Portion 10 — Reflection', beat: '10.1', html: card('Real-Life Contexts', 'Where do integers appear?', '<div class="grid-cards"><article>Attendance</article><article>Temperature Changes</article><article>Money Transactions</article><article>Basketball Scores</article></div>') },
      { portion: 'Portion 10 — Reflection', beat: '10.2', html: card('Reflect', 'Everyday Situations', '<h2>How can we use the addition of integers to solve problems in our everyday situations?</h2>') },
      { portion: 'Portion 10 — Reflection', beat: '10.3', html: card('Digital Learning Resource', 'Addition of Integers', '<p>Explore: Grade 7 MATATAG</p><h2>youtu.be/gLQoEzKKTyQ</h2>') },
      { portion: 'Portion 10 — Closing', beat: '10.4', html: card('Thank you', 'Grade 7 – St. Joseph!', '<p>Joshua Philip M. Aure</p>') }
    ];
    const sum = a => a.reduce((x, y) => x + y, 0), fmt = n => (n < 0 ? '−' : '') + Math.abs(n);
    const X = (k, g) => .6 + k * 1.1 + g * .35, YS = .3, YM = 1.825;
    let st = { sl: 0, ex: 0, i: 0 }, M;

    /* ---------- opening: the star and the portal, drawn in code ---------- */
    const ic = $('#ic'), ix = ic.getContext('2d');
    const SL = [...Array(120)].map(() => ({ a: Math.random() * 6.283, r: .28 + Math.random() * .45, l: .06 + Math.random() * .22, o: .1 + Math.random() * .3, v: .02 + Math.random() * .06 }));
    let T0 = 0, done = true, opened = false;
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

        // Inversion windows of varied sizes flooding in from the very right (->) to the left
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

        // Multi-sized pixel death spreading from right to left (no chroma aberration borders)
        // 1. Dead pixel micro-clusters & single pixels
        const deadPixels = [];
        for (let i = 0; i < 400; i++) {
          const x = Math.random() * w;
          const rx = (w - x) / w; // 0 at far right, 1 at far left
          deadPixels.push({
            x,
            y: Math.random() * h,
            w: Math.random() < 0.6 ? 2 + Math.floor(Math.random() * 4) : 6 + Math.floor(Math.random() * 8),
            h: Math.random() < 0.6 ? 2 + Math.floor(Math.random() * 4) : 4 + Math.floor(Math.random() * 10),
            t: 0.08 + Math.pow(rx, 1.15) * 1.9 + (Math.random() - .5) * 0.2,
            col: Math.random() < 0.75 ? '#000' : '#fff'
          });
        }

        // 2. Dead scanline strips (horizontal & vertical lines)
        const deadStrips = [];
        for (let i = 0; i < 110; i++) {
          const x = Math.random() * w;
          const rx = (w - x) / w;
          const isHoriz = Math.random() < 0.7;
          deadStrips.push({
            x,
            y: Math.random() * h,
            w: isHoriz ? 30 + Math.random() * 260 : 2 + Math.random() * 5,
            h: isHoriz ? 1 + Math.random() * 4 : 25 + Math.random() * 160,
            t: 0.12 + Math.pow(rx, 1.15) * 1.85 + (Math.random() - .5) * 0.22,
            col: Math.random() < 0.7 ? '#000' : '#fff'
          });
        }

        // 3. Medium dead byte blocks & corruption chunks
        const deadBlocks = [];
        for (let i = 0; i < 75; i++) {
          const x = Math.random() * w;
          const rx = (w - x) / w;
          deadBlocks.push({
            x,
            y: Math.random() * h,
            w: 16 + Math.random() * 90,
            h: 8 + Math.random() * 55,
            t: 0.18 + Math.pow(rx, 1.15) * 1.8 + (Math.random() - .5) * 0.25,
            col: Math.random() < 0.8 ? '#000' : '#fff'
          });
        }

        // 4. Large necrotic consumption blocks
        const deadMacro = [];
        for (let i = 0; i < 22; i++) {
          const x = Math.random() * w;
          const rx = (w - x) / w;
          deadMacro.push({
            x,
            y: Math.random() * h,
            w: 90 + Math.random() * 320,
            h: 40 + Math.random() * 180,
            t: 0.35 + Math.pow(rx, 1.2) * 1.75 + (Math.random() - .5) * 0.25,
            col: Math.random() < 0.85 ? '#000' : '#fff'
          });
        }

        const t0 = performance.now();
        (function f(now) {
          const t = (now - t0) / 1000, g = Math.min(1, t / 1.6);
          if (t > 2.75) { black(); return cb() }
          requestAnimationFrame(f);

          // Subtle organic drift on the background paper
          const shake = g * g, drift = Math.sin(t * 3.7) * 5 * shake, sway = Math.sin(t * 2.3) * 2.5 * shake;
          ia.style.transform = `translate(${drift + (Math.random() - .5) * 3 * shake}px,${sway + (Math.random() - .5) * 2 * shake}px) skewX(${Math.sin(t * 5.1) * 1.5 * shake}deg)`;
          const caOff = Math.sin(t * 4.3) * (2 + 5 * g) + (Math.random() - .5) * 2 * g;
          $('#or').setAttribute('dx', -Math.abs(caOff)); $('#or').setAttribute('dy', Math.sin(t * 2.9) * 1.2 * g);
          $('#oc').setAttribute('dx', Math.abs(caOff)); $('#oc').setAttribute('dy', -Math.sin(t * 2.9) * 1.2 * g);

          // Clear canvas
          gx.clearRect(0, 0, w, h);

          // Front of the spreading necrosis wave
          const frontX = w * (1 - Math.min(1.1, Math.pow(t / 2.1, 1.15)));

          // Render pixel death (clean black & white, no chroma aberration borders!)
          deadPixels.forEach(p => {
            if (t >= p.t) {
              gx.fillStyle = p.col;
              gx.fillRect(p.x, p.y, p.w, p.h);
            }
          });

          deadStrips.forEach(s => {
            if (t >= s.t) {
              gx.fillStyle = s.col;
              gx.fillRect(s.x, s.y, s.w, s.h);
            }
          });

          deadBlocks.forEach(b => {
            if (t >= b.t) {
              const dt = t - b.t;
              const scale = Math.min(1, dt * 12);
              gx.fillStyle = b.col;
              gx.fillRect(b.x, b.y, b.w * scale, b.h * scale);
            }
          });

          deadMacro.forEach(m => {
            if (t >= m.t) {
              const dt = t - m.t;
              const scale = Math.min(1, dt * 8);
              gx.fillStyle = m.col;
              gx.fillRect(m.x, m.y, m.w * scale, m.h * scale);
            }
          });

          // High-frequency spreading pixel noise right at the wave front
          if (frontX > -50 && frontX < w + 50) {
            for (let i = 0; i < 35; i++) {
              const px = frontX + (Math.random() - .35) * 70;
              const py = Math.random() * h;
              const pw = Math.random() < 0.7 ? 2 + Math.random() * 4 : 10 + Math.random() * 40;
              const ph = Math.random() < 0.7 ? 2 + Math.random() * 4 : 1 + Math.random() * 3;
              gx.fillStyle = Math.random() < 0.6 ? '#000' : '#fff';
              gx.fillRect(px, py, pw, ph);
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
        // z: 0.1 (far background) to 1.0 (foreground)
        const z = 0.1 + Math.pow(Math.random(), 1.6) * 0.9;
        // Tinier, like tiny tiny:
        const width = (0.35 + Math.pow(z, 1.4) * 3.2).toFixed(2);  // ~0.45vw to 3.5vw
        const height = (0.8 + Math.pow(z, 1.4) * 8.5).toFixed(2);  // ~1.1vh to 9.3vh
        // Parallax: back (small z) moves noticeably SLOWER, front (large z) moves noticeably FASTER
        const dur = (44 - z * 30).toFixed(1); // z=0.1 -> ~41s, z=1 -> 14s

        // Weight off the center: keep the middle (32vw - 68vw) clear for the title
        const isLeft = Math.random() < 0.5;
        let x;
        if (isLeft) {
          x = (2 + Math.pow(Math.random(), 1.3) * 28).toFixed(1); // 2vw to ~30vw
        } else {
          x = (96 - Math.pow(Math.random(), 1.3) * 26 - parseFloat(width)).toFixed(1); // ~70vw to 96vw
        }

        w.style.left = `${x}vw`;
        w.style.width = `${width}vw`;
        w.style.height = `${height}vh`;
        w.style.zIndex = Math.round(z * 10);
        w.style.setProperty('--dur', `${dur}s`);

        w.addEventListener('animationend', () => w.remove());
        par.appendChild(w);
      }

      function startWinSpawner() {
        stopWinSpawner();
        if (reduce) return;
        // spawn an initial subtle window
        spawnWin();
        setTimeout(spawnWin, 1400);

        // continuous random spawner with LOWER spawn rate (every 2.2s - 4.8s)
        function loop() {
          if (st.sl !== 1) return;
          spawnWin();
          winTimer = setTimeout(loop, 2200 + Math.random() * 2600);
        }
        winTimer = setTimeout(loop, 2500);
      }

      function stopWinSpawner() {
        if (winTimer) {
          clearTimeout(winTimer);
          winTimer = null;
        }
      }

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
          R > 0 ? `Count what is left: ${R} blue chip${pl(R)}. Answer: ${R}.` : `Count what is left: ${-R} red chip${pl(-R)}. Answer: ${fmt(R)}.`][s]
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
        $('#nx').textContent = st.i < M.n - 1 ? 'Next' : st.ex < 3 ? 'Next example' : 'Last example';
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
        if (n == 2) {
          stopWinSpawner();
          par.innerHTML = '';
          $('#deck').classList.remove('on');
        } else if (n == 3) {
          stopWinSpawner();
          $('#s2').classList.remove('on');
          par.innerHTML = '';
        } else if (n == 1 && $('#s1').classList.contains('rev')) {
          startWinSpawner();
        }
      }
      let deckIndex = 0;
      function renderDeck() {
        const beat = BEATS[deckIndex];
        $('#portion').textContent = beat.portion;
        $('#beat').textContent = 'Beat ' + beat.beat;
        $('#deck-content').innerHTML = beat.html || '';
        $('#deck-next').textContent = deckIndex === BEATS.length - 1 ? 'Replay' : 'Next';
      }
      function openDeck(index) {
        deckIndex = index;
        wipe(() => { show(3); renderDeck(); });
      }
      function deckNext() {
        if (deckIndex < BEATS.length - 1) {
          deckIndex++;
          if (BEATS[deckIndex].mat) {
            wipe(() => { show(2); enter(0, 0); });
          } else {
            renderDeck();
          }
        } else {
          wipe(() => show(1));
        }
      }
      function deckBack() {
        if (deckIndex > 0) {
          deckIndex--;
          renderDeck();
        } else {
          wipe(() => show(1));
        }
      }
      function wipe(cb) { const w = $('#wipe'); w.classList.remove('go'); void w.offsetWidth; w.classList.add('go'); setTimeout(cb, reduce ? 0 : 650) }
      function next() {
        if (st.sl == 0) return begin();
        if (st.sl == 1) return openDeck(0);
        if (st.sl == 3) return deckNext();
        if (st.i < M.n - 1) { st.i++; render() } else if (st.ex < 3) enter(st.ex + 1, 0)
        else openDeck(deckIndex + 1);
      }
      function prev() {
        if (st.sl == 3) return deckBack();
        if (st.sl < 2) return;
        if (st.i > 0) { st.i--; render() } else if (st.ex > 0) { enter(st.ex - 1, EX[st.ex - 1].n.length ? 4 : 1) } else wipe(() => show(1))
      }

      EX.forEach((e, j) => { const b = document.createElement('button'); b.textContent = e.eq.join(' '); b.onclick = () => enter(j, 0); $('#tabs').appendChild(b) });
      $('#nx').onclick = next; $('#bk').onclick = prev; stage.onclick = next; $('#intro').onclick = begin;
      $('#deck-next').onclick = deckNext; $('#deck-back').onclick = deckBack;
      document.addEventListener('keydown', e => {
        if (e.key == 'f' || e.key == 'F') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); return }
        if (e.target.closest('button')) return;
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
