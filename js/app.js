(function () {
  'use strict';

  const D = window.PL_DATA;
  const app = document.getElementById('app');
  const KEY = 'polski-dom-v1';
  const GOAL_DAYS = 90;
  const PASS = 0.9;

  /* ---------- Dates ---------- */
  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function daysBetween(a, b) {
    return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
  }

  /* ---------- Saved progress (on this phone only) ---------- */
  function fresh() {
    return {
      v: 1, startDate: today(), lessonsDone: [], items: {}, lastLessonOn: null,
      testPassedOn: null, tests: [], listen: { r: 0, t: 0 }, speak: { r: 0, t: 0 },
      weak: null, weakOn: null, voice: null, sounds: {}
    };
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.v === 1) { s.sounds = s.sounds || {}; return s; }
    } catch (e) { /* storage blocked */ }
    return fresh();
  }
  let S = load();
  function store() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage blocked */ }
  }
  function save() {
    store();
    if (window.PLSync) window.PLSync.schedule();
  }
  function item(id) {
    if (!S.items[id]) S.items[id] = { learnedOn: null, errors: 0, seen: 0, right: 0, weak: false };
    return S.items[id];
  }

  /* ---------- Content index ---------- */
  const PHRASES = {};
  D.LESSONS.forEach(function (L, li) {
    L.no = li + 1;
    L.phrases.forEach(function (p, pi) {
      p.id = L.id + '.' + (pi + 1);
      p.lesson = L;
      PHRASES[p.id] = p;
    });
  });
  const ALL_IDS = Object.keys(PHRASES);

  const MARK = /\[\[([^|\]]+)\|([^|\]]+)(?:\|([^\]]+))?\]\]/g;
  function plain(pl) { return pl.replace(MARK, '$1'); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  // Arabic text with Polish words isolated so their punctuation stays in place.
  function mixed(s) {
    return esc(s).replace(/[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+(?:[ /]+[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+)*/g, '<bdi lang="pl">$&</bdi>');
  }
  function genderOf(lemmaId, g) {
    if (g) return g;
    const L = D.LEMMAS[lemmaId];
    return L && L.g ? L.g : 'x';
  }
  // Polish text with tappable, color-coded changing words.
  function rich(pl) {
    let out = '', last = 0, m;
    MARK.lastIndex = 0;
    while ((m = MARK.exec(pl))) {
      out += esc(pl.slice(last, m.index));
      const g = genderOf(m[2], m[3]);
      out += '<button type="button" class="w g-' + g + '" data-lemma="' + esc(m[2]) + '" data-form="' + esc(m[1]) + '">' + esc(m[1]) + '</button>';
      last = MARK.lastIndex;
    }
    return out + esc(pl.slice(last));
  }
  function tagged(pl) {
    const list = [];
    let m;
    MARK.lastIndex = 0;
    while ((m = MARK.exec(pl))) list.push({ surface: m[1], lemma: m[2], g: genderOf(m[2], m[3]), index: m.index, len: m[0].length });
    return list;
  }

  /* ---------- Small DOM helpers ---------- */
  function h(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function pct(r, t) { return t ? Math.round((r / t) * 100) : null; }

  const ICON = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    slow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4a8 8 0 1 0 8 8h-2a6 6 0 1 1-6-6V4zm-1 4v5l4 2.5.8-1.3-3.3-2V8z"/></svg>',
    mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-2.1a7 7 0 0 0 6-6.9z"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z"/></svg>',
    gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3h-4l-.4 2.9a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1L11 21h4l.4-2.9a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg>'
  };

  /* ---------- Flow control (leaving a lesson stops its loop) ---------- */
  let flow = { alive: true };
  function newFlow() { flow.alive = false; flow = { alive: true }; stopAudio(); return flow; }

  /* ---------- Polish voice (text to speech) ---------- */
  let plVoices = [];
  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    plVoices = speechSynthesis.getVoices().filter(function (v) { return /^pl/i.test(v.lang); });
  }
  if ('speechSynthesis' in window) {
    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
  }
  function pickVoice() {
    if (!plVoices.length) return null;
    return plVoices.find(function (v) { return v.voiceURI === S.voice; }) || plVoices[0];
  }
  // Speed starts slow and rises with each finished lesson, up to natural speed.
  function baseRate() { return Math.min(1, 0.7 + 0.03 * S.lessonsDone.length); }
  function stopAudio() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  function speak(text, rate) {
    return new Promise(function (res) {
      if (!('speechSynthesis' in window)) { res(); return; }
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(plain(text));
      u.lang = 'pl-PL';
      const v = pickVoice();
      if (v) u.voice = v;
      u.rate = rate || baseRate();
      let done = false;
      const end = function () { if (!done) { done = true; res(); } };
      u.onend = end; u.onerror = end;
      setTimeout(end, 12000);
      speechSynthesis.speak(u);
    });
  }
  function audioButtons(text) {
    const wrap = h('<div class="audio"><button type="button" class="btn ghost icon-btn" data-a="play">' + ICON.play + '<span>استمع</span></button><button type="button" class="btn ghost icon-btn" data-a="slow">' + ICON.slow + '<span>ببطء</span></button></div>');
    wrap.querySelector('[data-a=play]').onclick = function () { speak(text); };
    wrap.querySelector('[data-a=slow]').onclick = function () { speak(text, 0.5); };
    return wrap;
  }

  /* ---------- Speech recognition (needs internet) ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  function canListen() { return !!SR && navigator.onLine !== false; }
  function recognize() {
    return new Promise(function (res, rej) {
      let r;
      try { r = new SR(); } catch (e) { rej('unsupported'); return; }
      r.lang = 'pl-PL';
      r.interimResults = false;
      r.maxAlternatives = 5;
      let got = false;
      r.onresult = function (e) {
        got = true;
        const alts = [];
        for (let i = 0; i < e.results[0].length; i++) alts.push(e.results[0][i].transcript);
        res(alts);
      };
      r.onerror = function (e) { rej(e.error || 'error'); };
      r.onend = function () { if (!got) rej('no-speech'); };
      try { r.start(); } catch (e) { rej('busy'); }
    });
  }

  /* ---------- Comparing what was said ---------- */
  function norm(s) {
    return s.toLowerCase().replace(/[.,!?;:„”"“'’«»…()\-–—]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  // A microphone cannot tell these spellings apart, so they count as the same.
  function phon(w) { return w.replace(/rz/g, 'ż').replace(/ó/g, 'u').replace(/ch/g, 'h'); }
  // Marks which target words were heard, in order (longest common subsequence).
  function matchWords(target, heard) {
    const a = target.map(phon), b = heard.map(phon);
    const n = a.length, m = b.length;
    const dp = [];
    for (let i = 0; i <= n; i++) { dp.push(new Array(m + 1).fill(0)); }
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const ok = new Array(n).fill(false);
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) { ok[i] = true; i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
      else j++;
    }
    return ok;
  }
  function evaluate(targetText, alts) {
    const tokens = plain(targetText).split(/\s+/);
    const tw = tokens.map(norm);
    let best = null;
    alts.forEach(function (alt) {
      const hw = norm(alt).split(' ').filter(Boolean);
      const ok = matchWords(tw, hw);
      tw.forEach(function (w, k) { if (!w) ok[k] = true; });
      const score = ok.filter(Boolean).length / tw.length;
      if (!best || score > best.score) best = { alt: alt, ok: ok, score: score, heard: hw };
    });
    best.tokens = tokens;
    best.words = tw;
    best.pass = best.score === 1;
    return best;
  }

  /* ---------- Which sounds are going wrong ---------- */
  const FAMILY = { 'z': 'z', 'ż': 'z', 'ź': 'z', 'dz': 'dz', 'dż': 'dz', 'dź': 'dz', 's': 's', 'sz': 's', 'ś': 's', 'c': 'c', 'cz': 'c', 'ć': 'c', 'l': 'l', 'ł': 'l', 'ą': 'an', 'ę': 'an', 'i': 'iy', 'y': 'iy' };
  const NEAR = { z: 'dz', dz: 'z', s: 'c', c: 's' };
  const PATTERN_AT = 3; // repeated mistakes before a pronunciation lesson appears
  const RECOVERED_AT = 10; // correct uses in a row that clear it
  function soundUnits(w) {
    return phon(w).replace(/dzi(?=[aeouąę])/g, 'dź').replace(/si(?=[aeouąę])/g, 'ś').replace(/ci(?=[aeouąę])/g, 'ć').replace(/zi(?=[aeouąę])/g, 'ź').match(/dź|dż|dz|sz|cz|./g) || [];
  }
  function soundRec(f) {
    if (!S.sounds[f]) S.sounds[f] = { seen: 0, miss: 0, open: 0, run: 0 };
    return S.sounds[f];
  }
  function trackSounds(r) {
    const used = {};
    r.words.forEach(function (w, k) {
      const units = soundUnits(w);
      if (r.ok[k]) {
        units.forEach(function (u) {
          const f = FAMILY[u];
          if (!f) return;
          const rec = soundRec(f);
          rec.seen++; rec.run++;
          if (rec.run >= RECOVERED_AT) rec.open = 0;
        });
        return;
      }
      // Find the heard word closest to this one and compare them sound by sound.
      let bestDiff = null;
      r.heard.forEach(function (hw, i) {
        if (used[i]) return;
        const hu = soundUnits(hw);
        if (hu.length !== units.length) return;
        const diff = [];
        units.forEach(function (u, x) { if (u !== hu[x]) diff.push([u, hu[x]]); });
        if (diff.length && diff.length <= 2 && (!bestDiff || diff.length < bestDiff.diff.length)) bestDiff = { diff: diff, i: i };
      });
      if (!bestDiff) return;
      used[bestDiff.i] = true;
      bestDiff.diff.forEach(function (d) {
        const ft = FAMILY[d[0]], fh = FAMILY[d[1]];
        if (!ft || !(ft === fh || NEAR[ft] === fh)) return;
        const rec = soundRec(ft);
        rec.seen++; rec.miss++; rec.open++; rec.run = 0;
      });
    });
    store();
  }
  function soundPattern() {
    let best = null;
    (window.PL_SOUNDS || []).forEach(function (g) {
      const rec = g.family && S.sounds[g.family];
      if (rec && rec.open >= PATTERN_AT && (!best || rec.open > S.sounds[best.family].open)) best = g;
    });
    return best;
  }
  function diffHTML(res) {
    return res.tokens.map(function (t, k) { return '<span class="' + (res.ok[k] ? 'good' : 'bad') + '">' + esc(t) + '</span>'; }).join(' ');
  }

  /* ---------- Saying a sentence until it is right ----------
     opts.recall: hide the Polish (test from memory) and offer the Answer button; using it counts as wrong.
     opts.noEcho: the sentence is already on screen, so do not repeat it here.
     opts.tries: attempts that still count as correct.
     Resolves { correct } where correct = said right within opts.tries attempts. */
  function sayTask(box, phrase, opts) {
    opts = opts || {};
    const tries = opts.tries || 1;
    return new Promise(function (resolve) {
      let attempts = 0, failed = false, revealed = !opts.recall;
      const el = h('<div class="say"><div class="say-target"></div><button type="button" class="mic">' + ICON.mic + '<span>اضغط وتكلّم</span></button><p class="say-status" role="status"></p><div class="say-heard"></div><div class="say-actions"></div></div>');
      box.appendChild(el);
      const micBtn = el.querySelector('.mic');
      const status = el.querySelector('.say-status');
      const heard = el.querySelector('.say-heard');
      const actions = el.querySelector('.say-actions');
      const target = el.querySelector('.say-target');

      function showTarget() {
        if (!revealed || opts.noEcho) return;
        target.innerHTML = '<p class="pl small" dir="ltr" lang="pl">' + rich(phrase.pl) + '</p>';
      }
      showTarget();

      if (opts.recall) {
        const ab = h('<button type="button" class="btn ghost answer-btn">الجواب</button>');
        ab.onclick = function () {
          failed = true;
          revealed = true;
          ab.remove();
          showTarget();
          status.textContent = 'سيُحسب هذا السؤال خطأ. استمع وقلها حتى تقولها صحيحة.';
          speak(phrase.pl, 0.55);
        };
        el.insertBefore(ab, status);
      }

      function finish() {
        const ab = el.querySelector('.answer-btn');
        if (ab) ab.remove();
        micBtn.hidden = true;
        actions.innerHTML = '';
        const next = h('<button type="button" class="btn primary">التالي</button>');
        next.onclick = function () { el.classList.add('done'); resolve({ correct: !failed }); };
        actions.appendChild(next);
        next.focus();
      }
      function offerTiles(reason) {
        actions.innerHTML = '';
        if (reason) status.textContent = reason;
        const b = h('<button type="button" class="btn ghost">رتّب الكلمات بدلاً من ذلك</button>');
        b.onclick = function () {
          micBtn.hidden = true;
          actions.innerHTML = '';
          heard.innerHTML = '';
          status.textContent = '';
          tilesTask(el, phrase).then(function (r) {
            if (!r.firstTry) failed = true;
            finish();
          });
        };
        actions.appendChild(b);
      }

      if (!canListen()) {
        micBtn.hidden = true;
        offerTiles(!SR ? 'هذا المتصفح لا يدعم التعرف على الصوت.' : 'التحقق من النطق يحتاج إنترنت. رتّب الكلمات الآن.');
        return;
      }

      micBtn.onclick = function () {
        stopAudio();
        micBtn.disabled = true;
        micBtn.classList.add('listening');
        status.textContent = 'أستمع إليك… تكلّم الآن';
        recognize().then(function (alts) {
          micBtn.disabled = false;
          micBtn.classList.remove('listening');
          const r = evaluate(phrase.pl, alts);
          trackSounds(r);
          attempts++;
          heard.innerHTML = '<p class="heard-line">سمعتُ: <span dir="ltr" lang="pl">' + esc(r.alt) + '</span></p>';
          if (r.pass) {
            if (attempts > tries) failed = true;
            revealed = true;
            target.innerHTML = '<p class="pl small ok-line" dir="ltr" lang="pl">' + diffHTML(r) + '</p>';
            if (failed && opts.recall) status.textContent = 'نطق صحيح، لكن هذا السؤال يُحسب خطأ.';
            else status.textContent = attempts === 1 ? 'ممتاز! نطق صحيح.' : 'أحسنت! الآن صحيح.';
            el.classList.add('pass');
            finish();
          } else if (!revealed && attempts < tries) {
            // Testing from memory: one more try before the answer is shown.
            status.textContent = 'ليست صحيحة تماماً. فكّر وحاول مرة أخرى.';
            micBtn.querySelector('span').textContent = 'حاول مرة أخرى';
          } else {
            if (attempts >= tries) failed = true;
            revealed = true;
            target.innerHTML = '<p class="pl small" dir="ltr" lang="pl">' + diffHTML(r) + '</p>';
            status.textContent = 'الكلمات باللون الأحمر لم تكن صحيحة. استمع وأعِد حتى تقولها صحيحة.';
            micBtn.querySelector('span').textContent = 'حاول مرة أخرى';
            speak(phrase.pl, 0.55);
            if (attempts >= 3) offerTiles();
          }
        }).catch(function (err) {
          micBtn.disabled = false;
          micBtn.classList.remove('listening');
          if (err === 'no-speech' || err === 'aborted') {
            status.textContent = 'لم أسمع شيئاً. اضغط وتكلّم بوضوح.';
          } else if (err === 'not-allowed' || err === 'service-not-allowed') {
            offerTiles('اسمح باستخدام الميكروفون من إعدادات المتصفح، أو رتّب الكلمات.');
          } else if (err === 'network') {
            offerTiles('التحقق من النطق يحتاج إنترنت. رتّب الكلمات الآن.');
          } else {
            offerTiles('تعذّر تشغيل الميكروفون. رتّب الكلمات بدلاً من ذلك.');
          }
        });
      };
    });
  }

  /* ---------- Word tiles (works offline) ---------- */
  function tilesTask(box, phrase) {
    return new Promise(function (resolve) {
      const words = plain(phrase.pl).split(/\s+/);
      let order = shuffle(words.map(function (w, i) { return { w: w, i: i }; }));
      if (words.length > 1 && order.every(function (o, k) { return o.i === k; })) order = order.slice(1).concat(order[0]);
      let picked = [];
      let firstTry = true;
      const el = h('<div class="tiles"><p class="hint">اضغط على الكلمات بالترتيب الصحيح:</p><div class="tile-answer" dir="ltr" lang="pl"></div><div class="tile-pool" dir="ltr" lang="pl"></div><p class="say-status" role="status"></p><div class="say-actions"><button type="button" class="btn primary" data-a="check">تحقّق</button></div></div>');
      box.appendChild(el);
      const ans = el.querySelector('.tile-answer'), pool = el.querySelector('.tile-pool');
      const status = el.querySelector('.say-status');
      function draw() {
        ans.innerHTML = ''; pool.innerHTML = '';
        picked.forEach(function (o, k) {
          const b = h('<button type="button" class="tile on"></button>');
          b.textContent = o.w;
          b.onclick = function () { picked.splice(k, 1); draw(); };
          ans.appendChild(b);
        });
        order.forEach(function (o) {
          if (picked.indexOf(o) !== -1) return;
          const b = h('<button type="button" class="tile"></button>');
          b.textContent = o.w;
          b.onclick = function () { picked.push(o); draw(); };
          pool.appendChild(b);
        });
      }
      draw();
      el.querySelector('[data-a=check]').onclick = function () {
        const said = picked.map(function (o) { return o.w; }).join(' ');
        if (norm(said) === norm(plain(phrase.pl))) {
          status.textContent = firstTry ? 'صحيح!' : 'أحسنت! الآن صحيح.';
          el.classList.add('pass');
          speak(phrase.pl);
          resolve({ firstTry: firstTry });
        } else {
          firstTry = false;
          status.textContent = 'الترتيب غير صحيح. استمع وحاول مرة أخرى.';
          speak(phrase.pl, 0.55);
          picked = [];
          draw();
        }
      };
    });
  }

  /* ---------- Word-forms sheet ---------- */
  const sheet = document.getElementById('sheet');
  const sheetBody = document.getElementById('sheet-body');
  document.getElementById('sheet-close').onclick = closeSheet;
  sheet.addEventListener('click', function (e) { if (e.target === sheet) closeSheet(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) closeSheet(); });
  function closeSheet() { sheet.hidden = true; document.body.classList.remove('locked'); }

  const G_NAME = { m: 'مذكر', f: 'مؤنث', n: 'محايد', p: 'جمع', x: 'فعل' };
  function cell(form, current) {
    const forms = form.split(' / ');
    return forms.map(function (f) {
      const on = current && f.toLowerCase() === current.toLowerCase() ? ' current' : '';
      return '<button type="button" class="form' + on + '" data-say="' + esc(f) + '" dir="ltr" lang="pl">' + esc(f) + '</button>';
    }).join('<span class="sep">/</span>');
  }
  function casesTable(cols, current) {
    let t = '<div class="tbl-wrap"><table class="forms"><thead><tr><th>الحالة</th>';
    cols.forEach(function (c) { t += '<th class="g-' + c.g + '-h">' + c.label + '</th>'; });
    t += '</tr></thead><tbody>';
    D.CASES.forEach(function (cs, i) {
      t += '<tr><th scope="row"><span class="case-pl" dir="ltr" lang="pl">' + cs.pl + '</span><span class="case-ar">' + cs.ar + '</span><span class="case-frame" dir="ltr" lang="pl">' + esc(cs.frame) + '</span></th>';
      cols.forEach(function (c) { t += '<td>' + cell(c.forms[i], current) + '</td>'; });
      t += '</tr>';
    });
    return t + '</tbody></table></div>';
  }
  function openSheet(lemmaId, current) {
    const L = D.LEMMAS[lemmaId];
    if (!L) return;
    let html = '<div class="sheet-head"><p class="pl big" dir="ltr" lang="pl">' + esc(L.pl) + '</p><p class="meaning">' + esc(L.ar) + '</p>';
    if (L.pos === 'noun') {
      html += '<p class="chip g-' + L.g + '">اسم ' + G_NAME[L.g] + '</p></div>';
      html += '<h3>المفرد والجمع</h3><div class="pair"><div><span class="lbl">مفرد</span>' + cell(L.sg[0], current) + '</div><div><span class="lbl">جمع</span>' + cell(L.plur[0], current) + '</div></div>';
      html += '<h3>مع الأعداد</h3><p class="note">لا يوجد مثنى في البولندية، لكن العدد يغيّر شكل الكلمة.</p>';
      html += '<div class="pair"><div><span class="lbl">2 و 3 و 4</span>' + cell(L.num24, current) + '</div><div><span class="lbl">5 فما فوق</span>' + cell(L.num5, current) + '</div></div>';
      if (L.countNote) html += '<p class="note">' + mixed(L.countNote) + '</p>';
      html += '<h3>الحالات السبع</h3><p class="note">نهاية الكلمة تتغير حسب موقعها في الجملة. اضغط على أي شكل لتسمعه.</p>';
      html += casesTable([{ label: 'مفرد', g: L.g, forms: L.sg }, { label: 'جمع', g: 'p', forms: L.plur }], current);
    } else if (L.pos === 'adj') {
      html += '<p class="chip g-x">صفة: تتبع جنس وعدد الاسم</p></div>';
      html += '<h3>حسب الجنس والعدد</h3><div class="pair four">' +
        '<div><span class="lbl g-m-t">مذكر</span>' + cell(L.m[0], current) + '</div>' +
        '<div><span class="lbl g-f-t">مؤنث</span>' + cell(L.f[0], current) + '</div>' +
        '<div><span class="lbl g-n-t">محايد</span>' + cell(L.n[0], current) + '</div>' +
        '<div><span class="lbl g-p-t">جمع</span>' + cell(L.pv[0] + ' / ' + L.pn[0], current) + '</div></div>';
      html += '<p class="note">في الجمع: <b><bdi lang="pl">' + esc(L.pv[0]) + '</bdi></b> لمجموعة فيها رجال، و<b><bdi lang="pl">' + esc(L.pn[0]) + '</bdi></b> لغير ذلك.</p>';
      html += '<h3>الحالات السبع</h3><p class="note">' + mixed('في المذكر بحالة Biernik: الشكل الأول للأشياء، والثاني للرجال والحيوانات. اسحب الجدول جانباً لترى باقي الأعمدة.') + '</p>';
      html += casesTable([
        { label: 'مذكر', g: 'm', forms: L.m }, { label: 'مؤنث', g: 'f', forms: L.f }, { label: 'محايد', g: 'n', forms: L.n },
        { label: 'جمع (رجال)', g: 'p', forms: L.pv }, { label: 'جمع (غيرهم)', g: 'p', forms: L.pn }
      ], current);
    } else {
      html += '<p class="chip g-x">فعل</p></div>';
      html += '<h3>' + L.presLabel + '</h3>';
      if (L.presNote) html += '<p class="note">' + mixed(L.presNote) + '</p>';
      html += '<div class="tbl-wrap"><table class="forms"><tbody>';
      D.PERSONS.forEach(function (p, i) { html += '<tr><th scope="row" dir="ltr" lang="pl">' + p + '</th><td>' + cell(L.pres[i], current) + '</td></tr>'; });
      html += '</tbody></table></div>';
      const s = L.past, v = L.pastV;
      html += '<h3>الماضي: يتغير حسب جنس الفاعل</h3><p class="note">الرجل يقول عن نفسه ' + '<b dir="ltr" lang="pl">' + esc(s + 'em') + '</b>، والمرأة تقول <b dir="ltr" lang="pl">' + esc(s + 'am') + '</b>.</p>';
      html += '<div class="tbl-wrap"><table class="forms"><thead><tr><th></th><th class="g-m-h">مذكر</th><th class="g-f-h">مؤنث</th><th class="g-n-h">محايد</th></tr></thead><tbody>' +
        '<tr><th scope="row" dir="ltr" lang="pl">ja</th><td>' + cell(s + 'em', current) + '</td><td>' + cell(s + 'am', current) + '</td><td>—</td></tr>' +
        '<tr><th scope="row" dir="ltr" lang="pl">ty</th><td>' + cell(s + 'eś', current) + '</td><td>' + cell(s + 'aś', current) + '</td><td>—</td></tr>' +
        '<tr><th scope="row" dir="ltr" lang="pl">on / ona / ono</th><td>' + cell(s, current) + '</td><td>' + cell(s + 'a', current) + '</td><td>' + cell(s + 'o', current) + '</td></tr>' +
        '</tbody></table></div>';
      html += '<div class="tbl-wrap"><table class="forms"><thead><tr><th></th><th class="g-p-h">جمع (رجال)</th><th class="g-p-h">جمع (غيرهم)</th></tr></thead><tbody>' +
        '<tr><th scope="row" dir="ltr" lang="pl">my</th><td>' + cell(v + 'śmy', current) + '</td><td>' + cell(s + 'yśmy', current) + '</td></tr>' +
        '<tr><th scope="row" dir="ltr" lang="pl">wy</th><td>' + cell(v + 'ście', current) + '</td><td>' + cell(s + 'yście', current) + '</td></tr>' +
        '<tr><th scope="row" dir="ltr" lang="pl">oni / one</th><td>' + cell(v, current) + '</td><td>' + cell(s + 'y', current) + '</td></tr>' +
        '</tbody></table></div>';
    }
    sheetBody.innerHTML = html;
    sheet.hidden = false;
    document.body.classList.add('locked');
    sheetBody.scrollTop = 0;
    speak(current || L.pl);
  }
  document.addEventListener('click', function (e) {
    const w = e.target.closest('.w');
    if (w) { e.preventDefault(); openSheet(w.dataset.lemma, w.dataset.form); return; }
    const f = e.target.closest('[data-say]');
    if (f) speak(f.dataset.say);
  });

  /* ---------- Shared screen frame ---------- */
  function frame(title, onClose) {
    const s = h('<section class="screen"><header class="bar"><button type="button" class="icon-only" aria-label="خروج">' + ICON.close + '</button><div class="bar-title"></div><div class="bar-progress" aria-hidden="true"><span></span></div></header><div class="stage"></div></section>');
    s.querySelector('.bar-title').textContent = title;
    s.querySelector('.icon-only').onclick = onClose;
    app.innerHTML = '';
    app.appendChild(s);
    window.scrollTo(0, 0);
    return {
      fl: newFlow(),
      close: s.querySelector('.icon-only'),
      stage: s.querySelector('.stage'),
      progress: function (x) { s.querySelector('.bar-progress span').style.width = Math.round(x * 100) + '%'; },
      title: function (t) { s.querySelector('.bar-title').textContent = t; }
    };
  }
  function confirmLeave(F, msg) {
    return function () {
      if (F.stage.querySelector('.leave')) return;
      const box = h('<div class="leave" role="alertdialog"><p></p><div class="row"><button type="button" class="btn danger" data-a="y">نعم، اخرج</button><button type="button" class="btn ghost" data-a="n">أكمل</button></div></div>');
      box.querySelector('p').textContent = msg;
      box.querySelector('[data-a=y]').onclick = function () { newFlow(); home(); };
      box.querySelector('[data-a=n]').onclick = function () { box.remove(); };
      F.stage.prepend(box);
      window.scrollTo(0, 0);
    };
  }
  function translitFor(lessonNo) {
    if (lessonNo <= 5) return 'show';
    if (lessonNo <= 10) return 'button';
    return 'none';
  }
  function translitHTML(p) {
    const mode = translitFor(p.lesson.no);
    if (mode === 'show') return '<p class="tr">' + esc(p.tr) + '</p>';
    if (mode === 'button') return '<details class="tr-btn"><summary>أظهر النطق بالعربية</summary><p class="tr">' + esc(p.tr) + '</p></details>';
    return '';
  }
  function recordSpeak(id, correct) {
    S.speak.t++;
    if (correct) S.speak.r++;
    else item(id).errors++;
    save();
  }

  /* ---------- Phrase card: see, hear, say until right ---------- */
  async function phraseCard(F, p, label) {
    F.stage.innerHTML = '';
    const card = h('<article class="card phrase"><p class="eyebrow"></p><p class="pl big" dir="ltr" lang="pl"></p><p class="meaning"></p></article>');
    card.querySelector('.eyebrow').textContent = label;
    card.querySelector('.pl').innerHTML = rich(p.pl);
    card.querySelector('.meaning').textContent = p.ar;
    const tr = translitHTML(p);
    if (tr) card.appendChild(h('<div>' + tr + '</div>'));
    card.appendChild(audioButtons(p.pl));
    if (p.note) card.appendChild(h('<p class="note grammar">' + mixed(p.note) + '</p>'));
    F.stage.appendChild(card);
    if (tagged(p.pl).length) F.stage.appendChild(h('<p class="tip">الكلمات الملوّنة تتغير حسب الجنس والعدد. اضغط على أي منها لترى كل أشكالها.</p>'));
    const sayBox = h('<div class="card say-card"><p class="eyebrow">دورك: قلها بصوتك</p></div>');
    F.stage.appendChild(sayBox);
    speak(p.pl);
    const r = await sayTask(sayBox, p, { tries: 1, noEcho: true });
    if (!F.fl.alive) return;
    recordSpeak(p.id, r.correct);
  }

  /* ---------- Conversation ---------- */
  function meaningOptions(correct, pool, n) {
    const uniq = pool.filter(function (x, i) { return x !== correct && pool.indexOf(x) === i; });
    const others = shuffle(uniq).slice(0, n - 1);
    return shuffle([correct].concat(others));
  }
  function choiceTask(box, options, correct, polish) {
    return new Promise(function (resolve) {
      const el = h('<div class="choices"></div>');
      let first = true;
      options.forEach(function (o) {
        const b = h('<button type="button" class="choice"></button>');
        b.textContent = o;
        if (polish) { b.dir = 'ltr'; b.lang = 'pl'; b.classList.add('choice-pl'); }
        b.onclick = function () {
          if (el.classList.contains('answered')) return;
          if (o === correct) {
            b.classList.add('right');
            el.classList.add('answered');
            resolve({ firstTry: first });
          } else {
            first = false;
            b.classList.add('wrong');
            b.disabled = true;
          }
        };
        el.appendChild(b);
      });
      box.appendChild(el);
    });
  }
  function matchTask(box, pairs) {
    return new Promise(function (resolve) {
      let first = true, picked = null, left = pairs.length;
      const el = h('<div class="match"><div class="match-col" dir="ltr" lang="pl"></div><div class="match-col"></div></div>');
      shuffle(pairs).forEach(function (p) {
        const b = h('<button type="button" class="tile"></button>');
        b.textContent = plain(p.pl);
        b.onclick = function () {
          if (b.classList.contains('matched')) return;
          if (picked) picked.b.classList.remove('on');
          picked = { b: b, id: p.id };
          b.classList.add('on');
          speak(p.pl);
        };
        el.children[0].appendChild(b);
      });
      shuffle(pairs).forEach(function (p) {
        const b = h('<button type="button" class="tile tile-ar"></button>');
        b.textContent = p.ar;
        b.onclick = function () {
          if (!picked || b.classList.contains('matched')) return;
          if (picked.id === p.id) {
            picked.b.classList.remove('on');
            picked.b.classList.add('matched');
            b.classList.add('matched');
            picked = null;
            if (--left === 0) resolve({ firstTry: first });
          } else {
            first = false;
            b.classList.add('miss');
            setTimeout(function () { b.classList.remove('miss'); }, 600);
          }
        };
        el.children[1].appendChild(b);
      });
      box.appendChild(el);
    });
  }
  async function runDialog(F, L) {
    F.stage.innerHTML = '';
    F.stage.appendChild(h('<div class="scene"><p class="eyebrow">محادثة</p><p class="scene-title"></p><p class="note">استمع جيداً، ثم اختر المعنى وردّ بصوتك.</p></div>')).querySelector('.scene-title').textContent = 'مع ' + L.who.ar + ' (' + L.who.pl + ')';
    const chat = h('<div class="chat"></div>');
    F.stage.appendChild(chat);
    const charMeanings = L.dialog.filter(function (x) { return x.c; }).map(function (x) { return x.ar; });
    const pool = charMeanings.concat(ALL_IDS.map(function (id) { return PHRASES[id].ar; }));
    for (let i = 0; i < L.dialog.length; i++) {
      if (!F.fl.alive) return;
      F.progress(0.5 + 0.5 * (i / L.dialog.length));
      const line = L.dialog[i];
      if (line.c) {
        const b = h('<div class="bubble them"><p class="who"></p><p class="pl hidden-text" dir="ltr" lang="pl"></p><p class="meaning" hidden></p></div>');
        b.querySelector('.who').textContent = L.who.ar;
        b.querySelector('.pl').innerHTML = rich(line.c);
        b.querySelector('.meaning').textContent = line.ar;
        b.appendChild(audioButtons(line.c));
        chat.appendChild(b);
        const q = h('<div class="ask"><p class="eyebrow">ماذا قالت؟</p></div>');
        if (L.who.pl === 'Syn') q.querySelector('.eyebrow').textContent = 'ماذا قال؟';
        chat.appendChild(q);
        b.scrollIntoView({ block: 'start', behavior: 'smooth' });
        speak(line.c);
        const r = await choiceTask(q, meaningOptions(line.ar, pool, 3), line.ar);
        if (!F.fl.alive) return;
        S.listen.t++; if (r.firstTry) S.listen.r++; save();
        b.querySelector('.pl').classList.remove('hidden-text');
        b.querySelector('.meaning').hidden = false;
        q.remove();
      } else {
        const p = L.phrases[line.u];
        const b = h('<div class="bubble me"><p class="who">أنت</p><p class="prompt"></p></div>');
        b.querySelector('.prompt').textContent = 'قل: ' + p.ar;
        const tr = translitHTML(p);
        if (tr) b.appendChild(h('<div>' + tr + '</div>'));
        chat.appendChild(b);
        b.scrollIntoView({ block: 'start', behavior: 'smooth' });
        const r = await sayTask(b, p, { tries: 1 });
        if (!F.fl.alive) return;
        recordSpeak(p.id, r.correct);
      }
    }
  }

  async function runLesson(L, practice) {
    const F = frame(L.title, null);
    const fl = F.fl;
    F.close.onclick = confirmLeave(F, practice ? 'الخروج من التدريب؟' : 'الخروج من الدرس؟ لن يُحسب الدرس حتى تكمله.');
    for (let i = 0; i < L.phrases.length; i++) {
      F.progress(0.5 * (i / L.phrases.length));
      await phraseCard(F, L.phrases[i], 'جملة جديدة ' + (i + 1) + ' من ' + L.phrases.length);
      if (!fl.alive) return;
    }
    await runDialog(F, L);
    if (!fl.alive) return;
    F.progress(1);
    if (!practice) {
      const t = today();
      L.phrases.forEach(function (p) { const it = item(p.id); if (!it.learnedOn) it.learnedOn = t; });
      if (S.lessonsDone.indexOf(L.id) === -1) S.lessonsDone.push(L.id);
      S.lastLessonOn = t;
      save();
    }
    F.stage.innerHTML = '';
    const done = h('<div class="card result good"><p class="eyebrow">انتهى الدرس</p><h2></h2><p></p><button type="button" class="btn primary">العودة إلى الرئيسية</button></div>');
    done.querySelector('h2').textContent = practice ? 'أحسنت التدريب!' : 'أحسنت! تعلّمت ' + L.phrases.length + ' جمل جديدة.';
    done.querySelector('p').textContent = practice ? 'التدريب لا يغيّر موعد اختبارك.' : 'غداً عندما تفتح التطبيق ستبدأ باختبار على كل ما تعلّمته حتى اليوم، ومنه هذا الدرس.';
    done.querySelector('button').onclick = home;
    F.stage.appendChild(done);
  }

  /* ---------- Daily test ---------- */
  function testIds() {
    const t = today();
    return ALL_IDS.filter(function (id) { const it = S.items[id]; return it && it.learnedOn && it.learnedOn < t; });
  }
  function needsTest() { return testIds().length > 0 && S.testPassedOn !== today(); }
  /* Question types. Answers are by tapping or by voice; nothing is typed. */
  const REPLY = {};
  D.LESSONS.forEach(function (L) {
    L.dialog.forEach(function (d, i) {
      const prev = L.dialog[i - 1];
      if (d.u !== undefined && prev && prev.c) REPLY[L.phrases[d.u].id] = { c: prev.c, ar: prev.ar, who: L.who };
    });
  });
  const LISTENING = ['listen', 'heard', 'truefalse', 'reply', 'tilesHeard', 'minimal'];
  const SPOKEN = ['speak', 'replysay'];
  const SWAPS = [['ż', 'z'], ['sz', 's'], ['cz', 'c'], ['ł', 'l'], ['dz', 'z'], ['rz', 'z']];
  function clean(w) { return w.replace(/[.,!?…:;]/g, ''); }
  function wordsOf(p) { return plain(p.pl).split(/\s+/); }
  function minimalFor(p) {
    const list = shuffle(wordsOf(p).map(function (w) { return clean(w).toLowerCase(); })).filter(function (w) { return w.length >= 4 && !/[ptk]rz/.test(w); });
    for (let i = 0; i < list.length; i++) {
      for (let j = 0; j < SWAPS.length; j++) {
        if (list[i].indexOf(SWAPS[j][0]) !== -1) return { word: list[i], other: list[i].replace(SWAPS[j][0], SWAPS[j][1]) };
      }
    }
    return null;
  }
  function kindsFor(p) {
    const k = ['listen', 'speak', 'heard', 'truefalse', 'tilesHeard', 'tilesAr', 'match'];
    if (wordsOf(p).length >= 3) k.push('fill');
    if (REPLY[p.id]) k.push('reply', 'replysay');
    if (minimalFor(p)) k.push('minimal');
    return k;
  }
  // Never the same type twice in a row, never the way this sentence was last asked,
  // and never a way it was already answered wrongly until every type has been tried.
  function pickKind(p, prev) {
    const it = item(p.id);
    const all = kindsFor(p);
    let open = all.filter(function (k) { return (it.failedKinds || []).indexOf(k) === -1; });
    if (!open.length) { it.failedKinds = []; open = all; }
    let pool = open.filter(function (k) { return k !== prev && k !== it.lastKind; });
    if (!pool.length) pool = open.filter(function (k) { return k !== prev; });
    if (!pool.length) pool = open;
    // Speaking is the goal of the app, so it comes up more often.
    pool = pool.concat(pool.filter(function (k) { return SPOKEN.indexOf(k) !== -1; }));
    return pool[Math.floor(Math.random() * pool.length)];
  }
  function otherPhrases(p, n) {
    const learned = ALL_IDS.filter(function (id) { return id !== p.id && S.items[id] && S.items[id].learnedOn; });
    const rest = ALL_IDS.filter(function (id) { return id !== p.id && learned.indexOf(id) === -1; });
    return shuffle(learned).concat(shuffle(rest)).slice(0, n).map(function (id) { return PHRASES[id]; });
  }
  function similarPhrases(p, n) {
    const len = plain(p.pl).length;
    return ALL_IDS.filter(function (id) { return id !== p.id; }).map(function (id) { return PHRASES[id]; })
      .sort(function (a, b) { return Math.abs(plain(a.pl).length - len) - Math.abs(plain(b.pl).length - len); })
      .slice(0, n * 4).sort(function () { return Math.random() - 0.5; }).slice(0, n);
  }
  function revealPhrase(card, p) {
    card.appendChild(h('<p class="pl big reveal" dir="ltr" lang="pl">' + rich(p.pl) + '</p>'));
    card.appendChild(h('<p class="meaning"></p>')).textContent = p.ar;
  }
  function quoteLine(card, r) {
    const b = h('<div class="bubble them"><p class="who"></p></div>');
    b.querySelector('.who').textContent = r.who.ar;
    b.appendChild(audioButtons(r.c));
    card.appendChild(b);
    speak(r.c);
  }
  async function testQuestion(F, p, kind) {
    F.stage.innerHTML = '';
    const it = item(p.id);
    let correct = false;
    const card = h('<article class="card"></article>');
    F.stage.appendChild(card);
    function ask(t) { card.appendChild(h('<p class="eyebrow"></p>')).textContent = t; }
    function pl(list) { return shuffle(list.map(function (x) { return plain(x.pl); })); }

    if (kind === 'listen') {
      ask('استمع: ما معنى هذه الجملة؟');
      card.appendChild(audioButtons(p.pl));
      speak(p.pl);
      const r = await choiceTask(card, meaningOptions(p.ar, ALL_IDS.map(function (id) { return PHRASES[id].ar; }), 4), p.ar);
      if (!F.fl.alive) return false;
      correct = r.firstTry;
      card.appendChild(h('<p class="pl big reveal" dir="ltr" lang="pl">' + rich(p.pl) + '</p>'));
    } else if (kind === 'heard') {
      ask('ماذا سمعت؟');
      card.appendChild(audioButtons(p.pl));
      speak(p.pl);
      const r = await choiceTask(card, pl([p].concat(similarPhrases(p, 2))), plain(p.pl), true);
      if (!F.fl.alive) return false;
      correct = r.firstTry;
      card.appendChild(h('<p class="meaning"></p>')).textContent = p.ar;
    } else if (kind === 'truefalse') {
      const truth = Math.random() < 0.5;
      const shown = truth ? p.ar : otherPhrases(p, 1)[0].ar;
      ask('استمع: هل هذا هو المعنى؟');
      card.appendChild(audioButtons(p.pl));
      card.appendChild(h('<p class="meaning big-ar"></p>')).textContent = shown;
      speak(p.pl);
      const r = await choiceTask(card, ['صح', 'خطأ'], truth ? 'صح' : 'خطأ');
      if (!F.fl.alive) return false;
      correct = r.firstTry;
      revealPhrase(card, p);
    } else if (kind === 'reply' || kind === 'replysay') {
      const q = REPLY[p.id];
      ask(kind === 'reply' ? 'ماذا ترد؟' : 'رُدّ بصوتك');
      quoteLine(card, q);
      if (kind === 'reply') {
        const same = p.lesson.phrases.filter(function (x) { return x !== p; });
        const r = await choiceTask(card, pl([p].concat(shuffle(same).slice(0, 2))), plain(p.pl), true);
        if (!F.fl.alive) return false;
        correct = r.firstTry;
        card.appendChild(h('<p class="meaning"></p>')).textContent = q.ar + ' ← ' + p.ar;
      } else {
        card.appendChild(h('<p class="meaning big-ar"></p>')).textContent = 'قل: ' + p.ar;
        const r = await sayTask(card, p, { recall: true, tries: 2 });
        if (!F.fl.alive) return false;
        correct = r.correct;
      }
    } else if (kind === 'tilesHeard' || kind === 'tilesAr') {
      if (kind === 'tilesHeard') {
        ask('رتّب ما سمعت');
        card.appendChild(audioButtons(p.pl));
        speak(p.pl);
      } else {
        ask('رتّب الجملة البولندية');
        card.appendChild(h('<p class="meaning big-ar"></p>')).textContent = p.ar;
      }
      const r = await tilesTask(card, p);
      if (!F.fl.alive) return false;
      correct = r.firstTry;
      if (kind === 'tilesHeard') card.appendChild(h('<p class="meaning"></p>')).textContent = p.ar;
    } else if (kind === 'fill') {
      const words = wordsOf(p);
      const cand = words.map(function (w, i) { return i; }).filter(function (i) { return clean(words[i]).length >= 3; });
      const at = cand.length ? cand[Math.floor(Math.random() * cand.length)] : 0;
      const answer = clean(words[at]);
      const low = answer.toLowerCase();
      const seen = {};
      seen[low] = 1;
      const pool = [];
      shuffle(ALL_IDS).forEach(function (id) {
        wordsOf(PHRASES[id]).forEach(function (w) {
          const c = clean(w), k = c.toLowerCase();
          if (c.length >= 3 && !seen[k]) { seen[k] = 1; pool.push(c); }
        });
      });
      const cap = /^[A-ZĄĆĘŁŃÓŚŹŻ]/.test(answer);
      const opts = pool.slice(0, 2).map(function (w) { return cap ? w.charAt(0).toUpperCase() + w.slice(1) : w.toLowerCase(); });
      ask('أكمل الجملة');
      const line = h('<p class="pl big" dir="ltr" lang="pl"></p>');
      line.innerHTML = words.map(function (w, i) { return i === at ? '<span class="blank">؟</span>' + esc(w.slice(answer.length)) : esc(w); }).join(' ');
      card.appendChild(line);
      card.appendChild(h('<p class="meaning"></p>')).textContent = p.ar;
      const r = await choiceTask(card, shuffle([answer].concat(opts)), answer, true);
      if (!F.fl.alive) return false;
      correct = r.firstTry;
      line.innerHTML = rich(p.pl);
      speak(p.pl);
    } else if (kind === 'match') {
      ask('صِل كل جملة بمعناها');
      const r = await matchTask(card, [p].concat(otherPhrases(p, 3)));
      if (!F.fl.alive) return false;
      correct = r.firstTry;
    } else if (kind === 'minimal') {
      const m = minimalFor(p);
      ask('ميّز الكلمة: أيهما سمعت؟');
      card.appendChild(audioButtons(m.word));
      speak(m.word);
      const r = await choiceTask(card, shuffle([m.word, m.other]), m.word, true);
      if (!F.fl.alive) return false;
      correct = r.firstTry;
      revealPhrase(card, p);
    } else {
      ask('كيف تقول بالبولندية؟');
      card.appendChild(h('<p class="meaning big-ar"></p>')).textContent = p.ar;
      const r = await sayTask(card, p, { recall: true, tries: 2 });
      if (!F.fl.alive) return false;
      correct = r.correct;
    }

    if (LISTENING.indexOf(kind) !== -1) { S.listen.t++; if (correct) S.listen.r++; }
    if (SPOKEN.indexOf(kind) !== -1) { S.speak.t++; if (correct) S.speak.r++; }
    it.seen++;
    it.lastKind = kind;
    if (correct) { it.right++; it.failedKinds = []; }
    else {
      it.errors++;
      it.failedKinds = (it.failedKinds || []).concat(kind);
    }
    save();
    if (SPOKEN.indexOf(kind) === -1) {
      const fb = h('<div class="card say-card"><p class="eyebrow"></p></div>');
      fb.querySelector('.eyebrow').textContent = correct ? 'صحيح! والآن قلها بصوتك' : 'استمع إلى الجواب الصحيح وقله بصوتك';
      card.classList.add(correct ? 'was-right' : 'was-wrong');
      F.stage.appendChild(fb);
      if (correct) {
        const next = h('<div class="say-actions"><button type="button" class="btn primary">التالي</button><button type="button" class="btn ghost">قلها بصوتك</button></div>');
        fb.appendChild(next);
        await new Promise(function (res) {
          next.children[0].onclick = res;
          next.children[1].onclick = function () { next.remove(); sayTask(fb, p, { tries: 9 }).then(res); };
        });
      } else {
        await sayTask(fb, p, { tries: 9 });
      }
    }
    return correct;
  }
  async function runTest(ids, label) {
    const F = frame(label, null);
    const fl = F.fl;
    F.close.onclick = confirmLeave(F, 'الخروج من الاختبار؟ ستبدأه من جديد في المرة القادمة.');
    const order = shuffle(ids);
    const right = [], wrong = [];
    let prev = null;
    for (let i = 0; i < order.length; i++) {
      F.progress(i / order.length);
      F.title(label + ' · ' + (i + 1) + ' من ' + order.length);
      const p = PHRASES[order[i]];
      const kind = pickKind(p, prev);
      prev = kind;
      const ok = await testQuestion(F, p, kind);
      if (!fl.alive) return null;
      (ok ? right : wrong).push(p.id);
    }
    F.progress(1);
    return { F: F, right: right, wrong: wrong, score: right.length / order.length };
  }
  async function dailyTest() {
    const ids = testIds();
    const res = await runTest(ids, 'اختبار اليوم');
    if (!res) return;
    S.tests.push({ date: today(), score: Math.round(res.score * 100), total: ids.length, kind: 'full' });
    res.right.forEach(function (id) { item(id).weak = false; });
    res.wrong.forEach(function (id) { item(id).weak = true; });
    finishTest(res, ids.length);
  }
  async function retest() {
    const ids = S.weak.slice();
    const res = await runTest(ids, 'إعادة الاختبار');
    if (!res) return;
    S.tests.push({ date: today(), score: Math.round(res.score * 100), total: ids.length, kind: 'retest' });
    res.right.forEach(function (id) { item(id).weak = false; });
    res.wrong.forEach(function (id) { item(id).weak = true; });
    finishTest(res, ids.length);
  }
  function finishTest(res, total) {
    const passed = res.score >= PASS;
    if (passed) { S.testPassedOn = today(); S.weak = null; S.weakOn = null; }
    else { S.weak = res.wrong.slice(); S.weakOn = today(); }
    save();
    const F = res.F;
    F.stage.innerHTML = '';
    const scoreTxt = Math.round(res.score * 100) + '%';
    const card = h('<div class="card result ' + (passed ? 'good' : 'bad') + '"><p class="eyebrow">النتيجة</p><p class="score" dir="ltr"></p><p class="sub"></p><h2></h2><p class="txt"></p><button type="button" class="btn primary"></button></div>');
    card.querySelector('.score').textContent = scoreTxt;
    card.querySelector('.sub').textContent = res.right.length + ' صحيحة من ' + total + ' · المطلوب 90%';
    if (passed) {
      card.querySelector('h2').textContent = 'نجحت!';
      card.querySelector('.txt').textContent = res.wrong.length ? 'الجمل القليلة التي أخطأت فيها ستعود إليك في اختبار الغد.' : 'لم تخطئ في أي جملة. درس اليوم الجديد مفتوح الآن.';
      card.querySelector('button').textContent = 'إلى درس اليوم';
      card.querySelector('button').onclick = home;
    } else {
      card.querySelector('h2').textContent = 'لم تصل إلى 90% بعد';
      card.querySelector('.txt').textContent = 'سنعيد تعلّم ' + res.wrong.length + ' جمل كان فيها أخطاء، ثم تختبر فيها مرة أخرى. بعد النجاح يُفتح الدرس الجديد.';
      card.querySelector('button').textContent = 'أعد تعلّم الأجزاء الضعيفة';
      card.querySelector('button').onclick = reteach;
    }
    F.stage.appendChild(card);
  }
  async function reteach() {
    const F = frame('إعادة التعلّم', null);
    const fl = F.fl;
    F.close.onclick = confirmLeave(F, 'الخروج؟ ستكمل إعادة التعلّم في المرة القادمة.');
    const ids = S.weak.slice();
    for (let i = 0; i < ids.length; i++) {
      F.progress(i / ids.length);
      const p = PHRASES[ids[i]];
      await phraseCard(F, p, 'من درس: ' + p.lesson.title + ' · ' + (i + 1) + ' من ' + ids.length);
      if (!fl.alive) return;
    }
    F.progress(1);
    F.stage.innerHTML = '';
    const c = h('<div class="card result"><p class="eyebrow">انتهت المراجعة</p><h2>جاهز لإعادة الاختبار؟</h2><p>ستُختبر الآن في الجمل نفسها. تحتاج 90% لفتح الدرس الجديد.</p><button type="button" class="btn primary">ابدأ إعادة الاختبار</button></div>');
    c.querySelector('button').onclick = retest;
    F.stage.appendChild(c);
  }

  /* ---------- Home ---------- */
  function nextLesson() {
    return D.LESSONS.find(function (L) { return S.lessonsDone.indexOf(L.id) === -1; }) || null;
  }
  function stats() {
    const learned = ALL_IDS.filter(function (id) { return S.items[id] && S.items[id].learnedOn; });
    const mastered = learned.filter(function (id) { const it = S.items[id]; return it.right > 0 && !it.weak; });
    const lastTest = S.tests.length ? S.tests[S.tests.length - 1] : null;
    const day = daysBetween(S.startDate, today()) + 1;
    return {
      learned: learned.length, mastered: mastered.length, total: ALL_IDS.length,
      lastTest: lastTest, listen: pct(S.listen.r, S.listen.t), speak: pct(S.speak.r, S.speak.t),
      day: day, left: Math.max(0, GOAL_DAYS - day + 1)
    };
  }
  function home() {
    newFlow();
    closeSheet();
    const t = today();
    if (S.weak && S.weakOn !== t) { S.weak = null; S.weakOn = null; save(); }
    const st = stats();
    const L = nextLesson();
    const pattern = soundPattern();
    let cta = '';
    let ctaAction = null;
    if (S.weak && S.weak.length) {
      cta = '<p class="eyebrow">مطلوب قبل الدرس الجديد</p><h2>أكمل إعادة التعلّم</h2><p>' + S.weak.length + ' جمل تحتاج مراجعة، ثم إعادة اختبار.</p><button type="button" class="btn primary big-btn">أكمل</button>';
      ctaAction = reteach;
    } else if (needsTest()) {
      cta = '<p class="eyebrow">ابدأ يومك هنا</p><h2>اختبار اليوم</h2><p>' + testIds().length + ' جملة: كل ما تعلّمته حتى أمس. تحتاج 90% لفتح الدرس الجديد.</p><button type="button" class="btn primary big-btn">ابدأ الاختبار</button>';
      ctaAction = dailyTest;
    } else if (S.lastLessonOn === t) {
      cta = '<p class="eyebrow">انتهيت لهذا اليوم</p><h2>أحسنت!</h2><p>عُد غداً: سيبدأ يومك باختبار على كل ما تعلّمته. يمكنك التدرّب على الدروس السابقة من القائمة.</p>';
    } else if (L) {
      cta = '<p class="eyebrow">درس اليوم · ' + esc(L.unit) + '</p><h2>' + esc(L.title) + '</h2><p>' + esc(L.sub) + ' · ' + L.phrases.length + ' جمل ومحادثة</p><button type="button" class="btn primary big-btn">ابدأ الدرس</button>';
      ctaAction = function () { runLesson(L, false); };
    } else {
      cta = '<p class="eyebrow">أنهيت كل الدروس المتاحة</p><h2>رائع!</h2><p>دروس الحديث اليومي والتسوق والمواصلات قادمة. حتى ذلك الحين، اختبار كل يوم يحافظ على ما تعلّمته.</p>';
    }

    const lt = st.lastTest ? st.lastTest.score + '%' : '—';
    const html =
      '<section class="home">' +
      '<header class="home-head"><div><p class="brand" dir="ltr" lang="pl">Polski w domu</p><p class="brand-ar">البولندية في البيت</p><button type="button" class="cloud" data-a="cloud" hidden></button></div><button type="button" class="icon-only" data-a="settings" aria-label="الإعدادات">' + ICON.gear + '</button></header>' +
      '<div class="voice-warn" hidden></div>' +
      (pattern ? '<p class="sound-note">لديك درس نطق جديد: <bdi dir="ltr" lang="pl">' + esc(pattern.letters) + '</bdi></p>' : '') +
      '<div class="card cta">' + cta + '</div>' +
      '<div class="stats">' +
      stat(st.mastered + ' <small>من ' + st.learned + '</small>', 'جمل أتقنتها') +
      stat(lt, 'آخر اختبار') +
      stat(st.listen === null ? '—' : st.listen + '%', 'فهم الاستماع') +
      stat(st.speak === null ? '—' : st.speak + '%', 'دقة النطق') +
      '</div>' +
      '<div class="goal"><div class="goal-row"><span>اليوم ' + Math.min(st.day, GOAL_DAYS) + ' من ' + GOAL_DAYS + '</span><span>' + (st.left ? 'باقي ' + st.left + ' يوماً للهدف' : 'وصلت إلى موعد الهدف') + '</span></div><div class="meter"><span style="width:' + Math.min(100, Math.round((st.day / GOAL_DAYS) * 100)) + '%"></span></div><p class="note">سرعة الصوت الآن: ' + Math.round(baseRate() * 100) + '% من السرعة الطبيعية، وتزيد مع كل درس.</p></div>' +
      '<button type="button" class="letters-entry" data-a="letters"><span class="le-title">الحروف البولندية المتشابهة أو المتقاربة</span><span class="le-sub">شرح الفروق في النطق وتدريب عليها</span></button>' +
      '<h3 class="list-h">الدروس</h3><ol class="lessons"></ol>' +
      legend() +
      '</section>';
    app.innerHTML = html;
    window.scrollTo(0, 0);
    const ctaBtn = app.querySelector('.cta .btn');
    if (ctaBtn && ctaAction) ctaBtn.onclick = ctaAction;
    app.querySelector('[data-a=settings]').onclick = settings;
    app.querySelector('[data-a=cloud]').onclick = settings;
    app.querySelector('[data-a=letters]').onclick = lettersScreen;
    updateCloud();

    const list = app.querySelector('.lessons');
    // Shown only once the day's required test and lesson are finished.
    const mandatoryDone = !needsTest() && !(S.weak && S.weak.length) && (S.lastLessonOn === t || !L);
    if (pattern && mandatoryDone) {
      const li = h('<li class="lesson sound"><span class="num">!</span><div class="l-txt"><p class="l-title">درس نطق خاص بك</p><p class="l-sub" dir="ltr" lang="pl"></p></div></li>');
      li.querySelector('.l-sub').textContent = pattern.letters;
      const b = h('<button type="button" class="btn primary small">ابدأ</button>');
      b.onclick = function () { runSoundLesson(pattern); };
      li.appendChild(b);
      list.appendChild(li);
    }
    D.LESSONS.forEach(function (Ls) {
      const done = S.lessonsDone.indexOf(Ls.id) !== -1;
      const isNext = L && L.id === Ls.id;
      const li = h('<li class="lesson ' + (done ? 'done' : isNext ? 'next' : 'locked') + '"><span class="num">' + Ls.no + '</span><div class="l-txt"><p class="l-title"></p><p class="l-sub"></p></div></li>');
      li.querySelector('.l-title').textContent = Ls.title;
      li.querySelector('.l-sub').textContent = done ? 'مكتمل' : isNext ? 'التالي' : Ls.unit;
      if (done) {
        const b = h('<button type="button" class="btn ghost small">تدرّب</button>');
        b.onclick = function () { runLesson(Ls, true); };
        li.appendChild(b);
      }
      list.appendChild(li);
    });
    D.LATER.forEach(function (x) {
      const li = h('<li class="lesson later"><span class="num">·</span><div class="l-txt"><p class="l-title"></p><p class="l-sub"></p></div></li>');
      li.querySelector('.l-title').textContent = x.title;
      li.querySelector('.l-sub').textContent = 'قريباً · ' + x.sub;
      list.appendChild(li);
    });
    checkVoice();
  }
  function stat(v, label) {
    return '<div class="stat"><p class="v">' + v + '</p><p class="k">' + label + '</p></div>';
  }
  function legend() {
    return '<div class="legend"><p class="eyebrow">ألوان الكلمات</p><div class="legend-row">' +
      '<span class="w-sample g-m">مذكر</span><span class="w-sample g-f">مؤنث</span><span class="w-sample g-n">محايد</span><span class="w-sample g-p">جمع</span><span class="w-sample g-x">فعل</span>' +
      '</div></div>';
  }
  function checkVoice() {
    if (!('speechSynthesis' in window)) { showVoiceWarn('هذا المتصفح لا يدعم الصوت. افتح التطبيق في Chrome أو Safari.'); return; }
    setTimeout(function () {
      loadVoices();
      if (!plVoices.length) showVoiceWarn('لا يوجد صوت بولندي على هذا الجهاز بعد. افتح الإعدادات لترى طريقة تثبيته.');
    }, 1200);
  }
  function showVoiceWarn(msg) {
    const w = app.querySelector('.voice-warn');
    if (!w) return;
    w.textContent = msg;
    w.hidden = false;
  }

  /* ---------- Similar letters section ---------- */
  function soundAccuracy(g) {
    const rec = g.family && S.sounds[g.family];
    if (!rec || rec.seen < 5) return null;
    return Math.round(((rec.seen - rec.miss) / rec.seen) * 100);
  }
  function lettersScreen() {
    const F = frame('الحروف المتشابهة أو المتقاربة', home);
    F.stage.appendChild(h('<p class="note">هذا القسم للتدريب فقط، ولا يؤثر على اختباراتك. اضغط على أي كلمة لتسمعها.</p>'));
    const list = h('<div class="groups"></div>');
    window.PL_SOUNDS.forEach(function (g) {
      const acc = soundAccuracy(g);
      const b = h('<button type="button" class="group-row"><span class="g-letters" dir="ltr" lang="pl"></span><span class="g-title"></span></button>');
      b.querySelector('.g-letters').textContent = g.letters;
      b.querySelector('.g-title').textContent = g.title + (acc === null ? '' : ' · دقتك ' + acc + '%');
      b.onclick = function () { groupScreen(g); };
      list.appendChild(b);
    });
    F.stage.appendChild(list);
  }
  function sayWord(w) { return '<button type="button" class="form" data-say="' + esc(w) + '" dir="ltr" lang="pl">' + esc(w) + '</button>'; }
  function groupScreen(g) {
    const F = frame(g.title, lettersScreen);
    let v = '<p class="meaning">' + mixed(g.intro) + '</p>';
    g.cards.forEach(function (c) {
      v += '<article class="card sound-card"><div class="sound-head"><p class="pl big" dir="ltr" lang="pl">' + esc(c.letter) + '</p><p class="sound-ar">صوته: ' + esc(c.sound) + '</p></div>' +
        '<p>' + mixed(c.like) + '</p>' +
        '<p class="example">مثال: ' + sayWord(c.word) + ' (' + esc(c.ar) + ')</p>' +
        '<p class="tr">النطق التقريبي: ' + esc(c.tr) + '</p></article>';
    });
    v += '<div class="card"><h3>الفرق السمعي</h3><div class="tbl-wrap"><table class="forms"><thead><tr><th>الحرف</th><th>الصوت</th></tr></thead><tbody>' +
      g.cards.map(function (c) { return '<tr><th scope="row" dir="ltr" lang="pl">' + esc(c.letter) + '</th><td class="td-ar">' + esc(c.sound) + '</td></tr>'; }).join('') +
      '</tbody></table></div><p class="grammar note"><b>نقطة مهمة:</b> ' + mixed(g.point) + '</p></div>';
    v += '<div class="card"><h3>كلمات للتدريب</h3><ul class="word-list">' + g.words.map(function (w) {
      return '<li>' + sayWord(w.pl) + '<span class="w-ar">' + esc(w.ar) + '</span><span class="tr">' + esc(w.tr) + '</span></li>';
    }).join('') + '</ul>';
    if (g.pairs.length) {
      v += '<h3>كلمة واحدة تغيّر المعنى</h3><ul class="word-list">' + g.pairs.map(function (p) {
        return '<li>' + sayWord(p.a) + '<span class="w-ar">' + esc(p.aAr) + '</span></li><li>' + sayWord(p.b) + '<span class="w-ar">' + esc(p.bAr) + '</span></li>';
      }).join('') + '</ul>';
    }
    v += '<button type="button" class="btn primary" data-a="practice">تدرّب بصوتك</button></div>';
    F.stage.innerHTML = v;
    F.stage.querySelector('[data-a=practice]').onclick = function () {
      runWords(g.title, practiceList(g), function () { groupScreen(g); });
    };
  }
  function practiceList(g) {
    const list = g.cards.map(function (c) { return { pl: c.word, ar: c.ar, tr: c.tr }; }).concat(g.words);
    g.pairs.forEach(function (p) { list.push({ pl: p.a, ar: p.aAr, tr: '' }, { pl: p.b, ar: p.bAr, tr: '' }); });
    const seen = {};
    return list.filter(function (w) { if (seen[w.pl]) return false; seen[w.pl] = 1; return true; });
  }
  async function runWords(title, words, done) {
    const F = frame(title, null);
    const fl = F.fl;
    F.close.onclick = confirmLeave(F, 'الخروج من التدريب؟');
    for (let i = 0; i < words.length; i++) {
      F.progress(i / words.length);
      const w = words[i];
      F.stage.innerHTML = '';
      const card = h('<article class="card phrase"><p class="eyebrow"></p><p class="pl big" dir="ltr" lang="pl"></p><p class="meaning"></p></article>');
      card.querySelector('.eyebrow').textContent = 'كلمة ' + (i + 1) + ' من ' + words.length;
      card.querySelector('.pl').textContent = w.pl;
      card.querySelector('.meaning').textContent = w.ar;
      if (w.tr) card.appendChild(h('<p class="tr"></p>')).textContent = w.tr;
      card.appendChild(audioButtons(w.pl));
      F.stage.appendChild(card);
      const box = h('<div class="card say-card"><p class="eyebrow">قلها بصوتك</p></div>');
      F.stage.appendChild(box);
      speak(w.pl);
      await sayTask(box, { pl: w.pl, ar: w.ar }, { tries: 9, noEcho: true });
      if (!fl.alive) return;
    }
    F.progress(1);
    done(F);
  }
  // Built from the sound the learner keeps missing: words from their own sentences first.
  function wordsWithSound(g) {
    const found = [], seen = {};
    ALL_IDS.forEach(function (id) {
      if (!S.items[id] || !S.items[id].learnedOn) return;
      wordsOf(PHRASES[id]).forEach(function (raw) {
        const w = clean(raw).toLowerCase();
        if (seen[w] || w.length < 3) return;
        if (soundUnits(w).some(function (u) { return FAMILY[u] === g.family; })) {
          seen[w] = 1;
          found.push({ pl: w, ar: 'من جملة: ' + PHRASES[id].ar, tr: '' });
        }
      });
    });
    return shuffle(found).slice(0, 4);
  }
  function runSoundLesson(g) {
    const F = frame('درس نطق: ' + g.letters, home);
    let v = '<article class="card"><p class="eyebrow">لاحظت أن هذه الأصوات تختلط عليك</p><p class="pl big" dir="ltr" lang="pl">' + esc(g.letters) + '</p><p>' + mixed(g.intro) + '</p></article>';
    g.cards.forEach(function (c) {
      v += '<article class="card sound-card"><div class="sound-head"><p class="pl big" dir="ltr" lang="pl">' + esc(c.letter) + '</p><p class="sound-ar">صوته: ' + esc(c.sound) + '</p></div><p>' + mixed(c.like) + '</p><p class="example">مثال: ' + sayWord(c.word) + ' (' + esc(c.ar) + ')</p></article>';
    });
    v += '<p class="grammar note"><b>نقطة مهمة:</b> ' + mixed(g.point) + '</p><button type="button" class="btn primary big-btn" data-a="go">ابدأ التدريب</button>';
    F.stage.innerHTML = v;
    F.stage.querySelector('[data-a=go]').onclick = function () {
      const list = wordsWithSound(g).concat(practiceList(g)).slice(0, 10);
      runWords('درس نطق: ' + g.letters, list, function (Fd) {
        const rec = soundRec(g.family);
        rec.open = 0;
        rec.run = 0;
        save();
        Fd.stage.innerHTML = '';
        const c = h('<div class="card result good"><p class="eyebrow">انتهى درس النطق</p><h2>أحسنت!</h2><p>سيستمر التطبيق في متابعة هذه الأصوات أثناء تدريبك.</p><button type="button" class="btn primary">العودة إلى الرئيسية</button></div>');
        c.querySelector('button').onclick = home;
        Fd.stage.appendChild(c);
      });
    };
  }

  /* ---------- Settings ---------- */
  function settings() {
    const F = frame('الإعدادات', home);
    loadVoices();
    let v = '<div class="card"><h3>الصوت البولندي</h3>';
    if (plVoices.length) {
      v += '<label for="voice-select" class="lbl">اختر الصوت</label><select id="voice-select">' + plVoices.map(function (x) {
        return '<option value="' + esc(x.voiceURI) + '"' + (pickVoice() === x ? ' selected' : '') + '>' + esc(x.name) + '</option>';
      }).join('') + '</select><button type="button" class="btn ghost" data-a="test-voice">جرّب الصوت</button>';
    } else {
      v += '<p class="note">لم أجد صوتاً بولندياً على هذا الجهاز.</p>';
    }
    v += '<details><summary>طريقة تثبيت الصوت البولندي</summary>' +
      '<p><b>أندرويد:</b> الإعدادات ← الإدارة العامة (أو النظام) ← اللغة والإدخال ← تحويل النص إلى كلام ← محرك Google ← إعدادات ← تثبيت بيانات الصوت ← البولندية (Polski).</p>' +
      '<p><b>آيفون:</b> الإعدادات ← تسهيلات الاستخدام ← المحتوى المنطوق ← الأصوات ← البولندية ← اختر صوتاً مثل Zosia وحمّله.</p>' +
      '<p>بعد التثبيت أغلق التطبيق وافتحه من جديد.</p></details></div>';

    v += '<div class="card"><h3>الميكروفون</h3><p class="note">' +
      (SR ? 'التحقق من نطقك يعمل في هذا المتصفح، ويحتاج اتصالاً بالإنترنت. بدون إنترنت ترتّب الكلمات بدلاً من ذلك.' : 'هذا المتصفح لا يدعم التعرف على الصوت. ستتدرب بترتيب الكلمات. على أندرويد استخدم Chrome، وعلى آيفون استخدم Safari.') +
      '</p></div>';

    v += '<div class="card"><h3>ثبّت التطبيق على الشاشة الرئيسية</h3><button type="button" class="btn primary" data-a="install" hidden>ثبّت الآن</button>' +
      '<p><b>آيفون (Safari):</b> اضغط زر المشاركة ثم "إضافة إلى الشاشة الرئيسية".</p>' +
      '<p><b>أندرويد (Chrome):</b> اضغط ⋮ في الأعلى ثم "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".</p>' +
      '<p class="note">بعد التثبيت يعمل التطبيق بدون إنترنت، ما عدا التحقق من النطق.</p></div>';

    v = '<div class="card" id="sync-card"></div>' + v;

    v += '<div class="card"><h3>تقدمك</h3><p class="note">تقدمك محفوظ على هذا الجهاز' + (window.PLSync && PLSync.status().email ? '، ونسخة منه في السحابة' : ' فقط') + '. بدأت يوم <span dir="ltr">' + esc(S.startDate) + '</span>.</p><button type="button" class="btn danger" data-a="reset">ابدأ من الصفر</button><div class="reset-confirm" hidden><p>سيُحذف كل تقدمك وأخطاؤك ونتائج اختباراتك. هل أنت متأكد؟</p><div class="row"><button type="button" class="btn danger" data-a="reset-yes">نعم، احذف كل شيء</button><button type="button" class="btn ghost" data-a="reset-no">إلغاء</button></div></div></div>';

    F.stage.innerHTML = v;
    renderSync();
    const sel = F.stage.querySelector('#voice-select');
    if (sel) sel.onchange = function () { S.voice = sel.value; save(); speak('Dzień dobry, kochanie.'); };
    const tv = F.stage.querySelector('[data-a=test-voice]');
    if (tv) tv.onclick = function () { speak('Dzień dobry, kochanie. Jak się czujesz?'); };
    const inst = F.stage.querySelector('[data-a=install]');
    if (deferredInstall) {
      inst.hidden = false;
      inst.onclick = function () { deferredInstall.prompt(); deferredInstall = null; inst.hidden = true; };
    }
    const rc = F.stage.querySelector('.reset-confirm');
    F.stage.querySelector('[data-a=reset]').onclick = function () { rc.hidden = false; };
    F.stage.querySelector('[data-a=reset-no]').onclick = function () { rc.hidden = true; };
    F.stage.querySelector('[data-a=reset-yes]').onclick = function () {
      const voice = S.voice;
      S = fresh();
      S.voice = voice;
      S.resetAt = Date.now(); // tells the other devices to start from zero too
      save();
      home();
    };
  }

  /* ---------- Cloud backup (Supabase) ---------- */
  const CLOUD_TEXT = {
    synced: 'محفوظ في السحابة',
    syncing: 'جارٍ الحفظ في السحابة…',
    offline: 'بدون إنترنت: سيُحفظ عند الاتصال',
    error: 'تعذّر الحفظ في السحابة',
    'signed-out': 'سجّل الدخول لحفظ تقدمك في السحابة',
    recovery: 'اختر كلمة مرور جديدة'
  };
  function updateCloud() {
    const b = app.querySelector('[data-a=cloud]');
    if (!b) return;
    if (!window.PLSync || !PLSync.enabled) { b.hidden = true; return; }
    const st = PLSync.status();
    b.hidden = false;
    b.className = 'cloud is-' + st.state;
    b.textContent = CLOUD_TEXT[st.state] || '';
  }
  function when(iso) {
    try { return new Date(iso).toLocaleString('ar', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return iso; }
  }
  function renderSync() {
    const card = document.getElementById('sync-card');
    if (!card) return;
    if (!window.PLSync || !PLSync.enabled) {
      card.innerHTML = '<h3>النسخ الاحتياطي في السحابة</h3><p class="note">غير مفعّل في هذه النسخة من التطبيق. تقدمك محفوظ على هذا الجهاز فقط.</p>';
      return;
    }
    const st = PLSync.status();
    let html = '<h3>النسخ الاحتياطي في السحابة</h3>';
    if (st.recovery) {
      html += '<p class="note">اكتب كلمة مرور جديدة لحسابك.</p>' +
        '<label class="lbl" for="new-pass">كلمة المرور الجديدة</label><input id="new-pass" type="password" autocomplete="new-password" minlength="8" dir="ltr">' +
        '<button type="button" class="btn primary" data-a="save-pass">احفظ كلمة المرور</button>';
    } else if (st.email) {
      html += '<p>مسجّل الدخول بـ <bdi dir="ltr">' + esc(st.email) + '</bdi></p>' +
        '<p class="cloud-line is-' + st.state + '">' + esc(CLOUD_TEXT[st.state] || '') + '</p>' +
        (st.last ? '<p class="note">آخر حفظ: ' + esc(when(st.last)) + '</p>' : '') +
        (st.state === 'error' && st.error ? '<p class="note">' + esc(st.error) + '</p>' : '') +
        '<p class="note">افتح التطبيق على أي جهاز وسجّل الدخول بنفس الحساب لتكمل من حيث توقفت.</p>' +
        '<div class="row"><button type="button" class="btn primary" data-a="sync-now">احفظ الآن</button><button type="button" class="btn ghost" data-a="sign-out">تسجيل الخروج</button></div>';
    } else {
      html += '<p class="note">سجّل الدخول ليُحفظ تقدمك في السحابة، فلا يضيع إذا حذفت التطبيق، وتكمل من جهاز آخر.</p>' +
        '<form class="auth" novalidate>' +
        '<label class="lbl" for="sync-email">البريد الإلكتروني</label><input id="sync-email" type="email" autocomplete="email" inputmode="email" dir="ltr" required>' +
        '<label class="lbl" for="sync-pass">كلمة المرور (8 أحرف أو أكثر)</label><input id="sync-pass" type="password" autocomplete="current-password" minlength="8" dir="ltr" required>' +
        '<div class="row"><button type="submit" class="btn primary" data-a="sign-in">سجّل الدخول</button><button type="button" class="btn ghost" data-a="sign-up">أنشئ حساباً جديداً</button></div>' +
        '<button type="button" class="linkish" data-a="forgot">نسيت كلمة المرور؟</button>' +
        '</form>';
    }
    html += '<p class="auth-msg" role="status"></p>';
    card.innerHTML = html;
    const msg = card.querySelector('.auth-msg');
    function say(t, ok) { msg.textContent = t; msg.className = 'auth-msg' + (ok ? ' ok' : ' err'); }
    function busy(btn, on) { btn.disabled = on; }

    const form = card.querySelector('form.auth');
    if (form) {
      const email = card.querySelector('#sync-email'), pass = card.querySelector('#sync-pass');
      function valid(needPass) {
        if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) { say('اكتب بريداً إلكترونياً صحيحاً.'); email.focus(); return false; }
        if (needPass && pass.value.length < 8) { say('كلمة المرور يجب أن تكون 8 أحرف أو أكثر.'); pass.focus(); return false; }
        return true;
      }
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!valid(true)) return;
        const b = card.querySelector('[data-a=sign-in]');
        busy(b, true); say('جارٍ تسجيل الدخول…', true);
        const r = await PLSync.signIn(email.value.trim(), pass.value);
        busy(b, false);
        if (r.error) say(r.error);
      });
      card.querySelector('[data-a=sign-up]').onclick = async function () {
        if (!valid(true)) return;
        busy(this, true); say('جارٍ إنشاء الحساب…', true);
        const r = await PLSync.signUp(email.value.trim(), pass.value);
        busy(this, false);
        if (r.error) say(r.error);
        else if (r.confirm) say('تم إنشاء الحساب. افتح بريدك واضغط رابط التأكيد، ثم ارجع وسجّل الدخول.', true);
      };
      card.querySelector('[data-a=forgot]').onclick = async function () {
        if (!valid(false)) return;
        say('جارٍ الإرسال…', true);
        const r = await PLSync.resetPassword(email.value.trim());
        if (r.error) say(r.error);
        else say('أرسلنا رابطاً إلى بريدك. افتحه لتختار كلمة مرور جديدة.', true);
      };
    }
    const sp = card.querySelector('[data-a=save-pass]');
    if (sp) sp.onclick = async function () {
      const p = card.querySelector('#new-pass').value;
      if (p.length < 8) { say('كلمة المرور يجب أن تكون 8 أحرف أو أكثر.'); return; }
      busy(sp, true);
      const r = await PLSync.setNewPassword(p);
      busy(sp, false);
      if (r.error) say(r.error); else { renderSync(); PLSync.syncNow(); }
    };
    const sn = card.querySelector('[data-a=sync-now]');
    if (sn) sn.onclick = function () { PLSync.syncNow(); };
    const so = card.querySelector('[data-a=sign-out]');
    if (so) so.onclick = async function () { await PLSync.signOut(); renderSync(); };
  }
  if (window.PLSync) {
    PLSync.init({
      getState: function () { return S; },
      setState: function (merged) {
        const before = JSON.stringify(S);
        S = merged;
        store();
        if (JSON.stringify(S) !== before && app.querySelector('.home')) home();
      },
      onStatus: function () { updateCloud(); renderSync(); },
      onRecovery: settings
    });
  }

  /* ---------- Install and offline ---------- */
  let deferredInstall = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferredInstall = e; });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { /* offline cache unavailable */ }); });
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stopAudio(); });

  home();
})();
