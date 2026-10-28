(() => {
'use strict';
const app = document.getElementById('app');
const back = document.getElementById('back');
const eyebrow = document.getElementById('eyebrow');
const toptitle = document.getElementById('toptitle');
let DAYS = [], VIDEOS = {};
let quiz = null; // laufender Quiz-Zustand

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const md = s => esc(s).replace(/\*(.+?)\*/g, '<i>$1</i>');
const pad = n => String(n).padStart(2, '0');
const dir = d => `files/tag${pad(d.nr)}/`;
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };

const ICON = {
  slides:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/></svg>',
  doc:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
  quiz:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17.5h.01"/></svg>',
  sun:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  task:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  key:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="4"/><path d="M10.8 12.2L20 3M16 7l3 3"/></svg>',
  play:'<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><path d="M10 8.5v7l6-3.5z" fill="currentColor"/></svg>',
  chev:'<svg class="chev" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>'
};

function header(eb, title, backHref) {
  eyebrow.textContent = eb; toptitle.textContent = title;
  if (backHref) { back.hidden = false; back.href = backHref; } else back.hidden = true;
  document.title = title === 'Personalwesen 2026' ? title : `${title} · Personalwesen 2026`;
}
function todayStr() { const t = new Date(); return `${pad(t.getDate())}.${pad(t.getMonth()+1)}.${t.getFullYear()}`; }

/* ---------- Startseite ---------- */
function viewHome() {
  quiz = null;
  header('Kurs', 'Personalwesen 2026');
  const today = todayStr();
  app.innerHTML = `
    <h1>Unterricht nach Tagen</h1>
    <p class="lead">Wähle einen Tag. Dort findest du Präsentation, Skript, Video, das Tagesquiz und die freiwilligen Aufgaben für den Nachmittag.</p>
    <ul class="days">${DAYS.map(d => `
      <li><a class="day${d.date === today ? ' today' : ''}" href="#/tag/${d.nr}">
        <span class="num">${d.nr}</span>
        <span><span class="day-meta">Tag ${d.nr} · ${d.date}${d.date === today ? '<span class="badge">Heute</span>' : ''}</span>
        <span class="day-title" style="display:block">${esc(d.title)}</span></span>
      </a></li>`).join('')}
    </ul>`;
}

/* ---------- Video ---------- */
function videoBlock(d) {
  const v = (VIDEOS[d.nr] || d.video || '').trim();
  if (!v) return `<div class="video"><div class="ph">${ICON.play}<div>Video folgt</div><small>Das Video zu Tag ${d.nr} wird hier bald eingestellt.</small></div></div>`;
  const yt = v.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  if (yt) return `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="Video Tag ${d.nr}" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>`;
  return `<div class="video"><video src="${esc(v)}" controls playsinline preload="metadata"></video></div>`;
}

/* ---------- Tagesseite ---------- */
function viewDay(d) {
  quiz = null;
  header(`Tag ${d.nr} · ${d.date}`, d.short, '#/');
  const tq = d.sets[0];
  app.innerHTML = `
    <h1>${esc(d.title)}</h1>
    <h2>Video</h2>
    ${videoBlock(d)}
    <h2>Unterlagen</h2>
    <div class="tiles">
      <a class="tile" href="${dir(d)}praesentation.pdf" target="_blank" rel="noopener">
        <span class="ic">${ICON.slides}</span><b>Präsentation</b><small>PDF öffnen</small></a>
      <a class="tile" href="${dir(d)}skript.pdf" target="_blank" rel="noopener">
        <span class="ic">${ICON.doc}</span><b>Skript</b><small>PDF öffnen</small></a>
      <a class="tile wide" href="#/tag/${d.nr}/quiz/${tq.id}">
        <span class="ic">${ICON.quiz}</span><span class="tx"><b>Quiz des Tages</b><small>${tq.questions.length} Fragen mit Lösungshinweisen</small></span>${ICON.chev}</a>
      <a class="tile wide pm" href="#/tag/${d.nr}/nachmittag">
        <span class="ic">${ICON.sun}</span><span class="tx"><b>Nachmittag (freiwillig)</b><small>Übungsquizze und Aufgabenbögen</small></span>${ICON.chev}</a>
    </div>`;
}

/* ---------- Nachmittag ---------- */
function viewPM(d) {
  quiz = null;
  header(`Tag ${d.nr} · Nachmittag`, 'Freiwillig üben', `#/tag/${d.nr}`);
  const qs = d.sets.slice(1);
  app.innerHTML = `
    <h1>Nachmittag (freiwillig)</h1>
    <p class="lead">${esc(d.title)}. Such dir aus, womit du weiterüben möchtest.</p>
    <h2>Freiwillige Quizze</h2>
    <div class="tiles">${qs.map(s => `
      <a class="tile wide" href="#/tag/${d.nr}/quiz/${s.id}">
        <span class="ic">${ICON.quiz}</span><span class="tx"><b>${esc(s.name)}</b><small>${s.questions.length} Fragen${s.id === 'u1' ? ', Wissen und Begriffe' : ', Fälle und Rechnungen'}</small></span>${ICON.chev}</a>`).join('')}
    </div>
    <h2>Aufgabenbögen</h2>
    <div class="tiles">
      ${[['1','Aufgabenbogen 1','Begriffe'],['2','Aufgabenbogen 2','Fälle']].map(([k,n,s]) => `
      <div class="tile wide" style="flex-direction:column;align-items:stretch;cursor:default">
        <div style="display:flex;gap:12px;align-items:center">
          <span class="ic">${ICON.task}</span><span class="tx"><b>${n}</b><small>${s}</small></span>
        </div>
        <div class="subrow">
          <a class="btn" style="flex:1;min-height:42px" href="${dir(d)}aufgabe${k}.pdf" target="_blank" rel="noopener">Aufgaben</a>
          <a class="btn ghost" style="flex:1;min-height:42px" href="${dir(d)}aufgabe${k}_loesung.pdf" target="_blank" rel="noopener">Lösung</a>
        </div>
      </div>`).join('')}
    </div>
    <p class="note">Tipp: Bearbeite zuerst die Aufgaben und öffne die Lösung erst danach.</p>`;
}

/* ---------- Quiz ---------- */
const nCorrect = q => q.options.filter(o => o.c).length;
function isRight(q, sel) {
  return q.options.every((o, i) => o.c === sel.has(i));
}

function viewQuizSetup(d, set) {
  const backTo = set.id === 'tag' ? `#/tag/${d.nr}` : `#/tag/${d.nr}/nachmittag`;
  header(`Tag ${d.nr} · ${set.name}`, d.short, backTo);
  let pref = {}; try { pref = JSON.parse(localStorage.getItem('pw-quiz-pref') || '{}'); } catch (e) {}
  const mode = pref.mode || 'slide', fb = pref.fb || 'now';
  app.innerHTML = `
    <h1>${esc(set.name)}</h1>
    <p class="lead">${esc(d.title)} · ${set.questions.length} Fragen</p>
    <form class="panel" id="setup">
      <fieldset class="opt-group"><legend>Ansicht</legend>
        <div class="seg">
          <label><input type="radio" name="mode" value="slide"${mode==='slide'?' checked':''}><b>Einzeln</b><small>Eine Frage pro Seite, zum Durchblättern</small></label>
          <label><input type="radio" name="mode" value="list"${mode==='list'?' checked':''}><b>Untereinander</b><small>Alle Fragen auf einer Seite</small></label>
        </div></fieldset>
      <fieldset class="opt-group"><legend>Feedback</legend>
        <div class="seg">
          <label><input type="radio" name="fb" value="now"${fb==='now'?' checked':''}><b>Sofort</b><small>Nach jeder Frage prüfen</small></label>
          <label><input type="radio" name="fb" value="end"${fb==='end'?' checked':''}><b>Am Ende</b><small>Erst alles beantworten, dann auswerten</small></label>
        </div></fieldset>
      <button class="btn full" type="submit">Quiz starten</button>
      <p class="note">Bei manchen Fragen sind mehrere Antworten richtig. Das steht dann direkt bei der Frage.</p>
    </form>`;
  document.getElementById('setup').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const p = { mode: f.get('mode'), fb: f.get('fb') };
    try { localStorage.setItem('pw-quiz-pref', JSON.stringify(p)); } catch (err) {}
    startQuiz(d, set, p, set.questions.map((_, i) => i));
  });
}

function startQuiz(d, set, p, order) {
  quiz = { d, set, mode: p.mode, fb: p.fb, order, idx: 0,
    sel: order.map(() => new Set()), checked: order.map(() => false), done: false, filter: 'all' };
  renderQuiz();
}

function qCard(k) {
  const q = quiz.set.questions[quiz.order[k]];
  const sel = quiz.sel[k];
  const multi = nCorrect(q) > 1;
  const locked = quiz.checked[k] || quiz.done;
  const right = isRight(q, sel);
  const opts = q.options.map((o, i) => {
    let cls = 'o' + (multi ? ' multi' : '') + (sel.has(i) ? ' sel' : ''), tag = '';
    if (locked) {
      cls = 'o' + (multi ? ' multi' : '');
      if (sel.has(i) && o.c) { cls += ' right sel'; tag = 'richtig'; }
      else if (sel.has(i) && !o.c) { cls += ' wrong sel'; tag = 'falsch'; }
      else if (!sel.has(i) && o.c) { cls += ' missed'; tag = 'richtig'; }
    }
    return `<button type="button" class="${cls}" data-k="${k}" data-i="${i}"${locked ? ' disabled' : ''}><span class="box"></span><span>${md(o.t)}</span>${tag ? `<span class="tag">${tag}</span>` : ''}</button>`;
  }).join('');
  const fb = locked ? `<div class="fb ${right ? 'ok' : 'bad'}"><b>${right ? 'Richtig' : (sel.size ? 'Leider nicht ganz' : 'Nicht beantwortet')}</b><span><u>Lösungshinweis</u> ${md(q.expl)}</span></div>` : '';
  const act = (!locked && quiz.fb === 'now') ? `<div class="q-actions"><button type="button" class="btn full" data-check="${k}"${sel.size ? '' : ' disabled'}>Prüfen</button></div>` : '';
  return el(`<section class="q${locked ? ' locked' : ''}" id="q${k}">
    <div class="q-head"><span>Frage ${k + 1} von ${quiz.order.length}</span></div>
    <p class="q-text">${md(q.q)}</p>
    <div class="q-hint">${multi ? `Mehrere Antworten richtig (${nCorrect(q)})` : 'Eine Antwort richtig'}</div>
    <div class="opts">${opts}</div>${fb}${act}</section>`);
}

function scoreOf() { return quiz.order.reduce((s, qi, k) => s + (isRight(quiz.set.questions[qi], quiz.sel[k]) ? 1 : 0), 0); }

function renderQuiz() {
  const { d, set } = quiz;
  const backTo = set.id === 'tag' ? `#/tag/${d.nr}` : `#/tag/${d.nr}/nachmittag`;
  header(`Tag ${d.nr} · ${set.name}`, d.short, backTo);
  if (quiz.done) return renderResult();
  const n = quiz.order.length;
  if (quiz.mode === 'list') {
    app.innerHTML = '';
    for (let k = 0; k < n; k++) app.appendChild(qCard(k));
    const end = el(`<div class="panel" style="margin-top:6px"><button class="btn full" id="finish">Auswerten</button><p class="note" id="openinfo"></p></div>`);
    app.appendChild(end);
    updateOpenInfo();
  } else {
    const k = quiz.idx;
    app.innerHTML = '';
    app.appendChild(el(`<div class="progress"><i style="width:${((k + 1) / n) * 100}%"></i></div>`));
    const det = el(`<details class="dotwrap"${quiz.dotsOpen ? ' open' : ''}><summary>Fragenübersicht</summary><div class="dots"></div></details>`);
    det.addEventListener('toggle', () => { quiz.dotsOpen = det.open; });
    const dots = det.querySelector('.dots');
    for (let j = 0; j < n; j++) {
      const q = set.questions[quiz.order[j]];
      let c = j === k ? 'cur' : '';
      if (quiz.checked[j]) c += isRight(q, quiz.sel[j]) ? ' r' : ' w';
      else if (quiz.sel[j].size) c += ' ans';
      dots.appendChild(el(`<button type="button" class="${c}" data-go="${j}">${j + 1}</button>`));
    }
    app.appendChild(det);
    app.appendChild(qCard(k));
    const last = k === n - 1;
    const nextLbl = last ? 'Auswerten' : 'Weiter';
    app.appendChild(el(`<div class="nav">
      <button class="btn ghost" data-prev ${k === 0 ? 'disabled' : ''}>Zurück</button>
      <button class="btn" data-next>${nextLbl}</button></div>`));
  }
}

function updateOpenInfo() {
  const info = document.getElementById('openinfo'); if (!info) return;
  const open = quiz.sel.filter(s => !s.size).length;
  info.textContent = open ? `Noch ${open} Fragen ohne Antwort.` : 'Alle Fragen beantwortet.';
}

function replaceCard(k) {
  const old = document.getElementById('q' + k);
  if (old) old.replaceWith(qCard(k));
  if (quiz.mode === 'slide') renderQuiz();
  updateOpenInfo();
}

function renderResult() {
  const n = quiz.order.length, s = scoreOf(), pct = Math.round(s / n * 100);
  const wrong = quiz.order.map((_, k) => k).filter(k => !isRight(quiz.set.questions[quiz.order[k]], quiz.sel[k]));
  const msg = pct >= 90 ? 'Sehr stark.' : pct >= 70 ? 'Gut gemacht.' : pct >= 50 ? 'Solide Basis, schau dir die Lösungshinweise an.' : 'Lies die Lösungshinweise und versuch es nochmal.';
  app.innerHTML = '';
  app.appendChild(el(`<div class="panel score"><div class="big">${s} / ${n}</div><p>${pct} Prozent richtig. ${msg}</p>
    <div class="subrow" style="margin-top:14px">
      <button class="btn" style="flex:1" data-again>Nochmal</button>
      ${wrong.length ? `<button class="btn ghost" style="flex:1" data-wrong>Nur falsche (${wrong.length})</button>` : ''}
    </div></div>`));
  app.appendChild(el(`<div class="filter"><button data-f="all" class="${quiz.filter==='all'?'on':''}">Alle Fragen</button><button data-f="wrong" class="${quiz.filter==='wrong'?'on':''}">Nur falsche</button></div>`));
  const ks = quiz.filter === 'wrong' ? wrong : quiz.order.map((_, k) => k);
  ks.forEach(k => app.appendChild(qCard(k)));
  if (!ks.length) app.appendChild(el(`<p class="lead">Keine falschen Antworten. Klasse.</p>`));
  const src = quiz.d.quellen || [];
  if (src.length) app.appendChild(el(`<details class="panel" style="margin-top:12px"><summary><b>Quellen</b></summary><ul class="quellen">${src.map(x => `<li>${md(x)}</li>`).join('')}</ul></details>`));
  window.scrollTo(0, 0);
}

function finish() {
  quiz.done = true;
  renderQuiz();
}

app.addEventListener('click', e => {
  if (!quiz) return;
  const o = e.target.closest('.o');
  if (o && !o.disabled) {
    const k = +o.dataset.k, i = +o.dataset.i;
    const q = quiz.set.questions[quiz.order[k]], sel = quiz.sel[k];
    if (nCorrect(q) > 1) { sel.has(i) ? sel.delete(i) : sel.add(i); }
    else { sel.clear(); sel.add(i); }
    replaceCard(k); return;
  }
  const ck = e.target.closest('[data-check]');
  if (ck) { const k = +ck.dataset.check; quiz.checked[k] = true; replaceCard(k); return; }
  const go = e.target.closest('[data-go]');
  if (go) { quiz.idx = +go.dataset.go; renderQuiz(); return; }
  if (e.target.closest('[data-prev]')) { quiz.idx = Math.max(0, quiz.idx - 1); renderQuiz(); window.scrollTo(0,0); return; }
  if (e.target.closest('[data-next]')) {
    if (quiz.idx === quiz.order.length - 1) {
      const open = quiz.sel.filter(s => !s.size).length;
      if (open && !confirmInline(open)) return;
      finish();
    } else { quiz.idx++; renderQuiz(); window.scrollTo(0,0); }
    return;
  }
  if (e.target.closest('#finish')) {
    const open = quiz.sel.filter(s => !s.size).length;
    if (open && !confirmInline(open)) return;
    finish(); return;
  }
  const f = e.target.closest('[data-f]');
  if (f) { quiz.filter = f.dataset.f; renderResult(); return; }
  if (e.target.closest('[data-again]')) { startQuiz(quiz.d, quiz.set, quiz, quiz.set.questions.map((_, i) => i)); window.scrollTo(0,0); return; }
  if (e.target.closest('[data-wrong]')) {
    const wrongQ = quiz.order.filter((qi, k) => !isRight(quiz.set.questions[qi], quiz.sel[k]));
    startQuiz(quiz.d, quiz.set, quiz, wrongQ); window.scrollTo(0,0); return;
  }
});

// Statt Browser-Dialog: einmal Hinweis zeigen, zweiter Klick wertet aus
let warned = false;
function confirmInline(open) {
  if (warned) { warned = false; return true; }
  warned = true;
  const box = el(`<div class="fb bad" id="warn"><b>${open} Fragen sind noch offen</b><span>Tippe nochmal auf Auswerten, wenn du trotzdem fertig bist.</span></div>`);
  document.getElementById('warn')?.remove();
  const target = document.querySelector('.nav') || document.getElementById('finish')?.parentElement;
  target?.parentElement.insertBefore(box, target);
  box.scrollIntoView({ block: 'center', behavior: 'smooth' });
  setTimeout(() => { warned = false; }, 6000);
  return false;
}

/* ---------- Router ---------- */
function route() {
  const h = location.hash.replace(/^#\/?/, '').split('/');
  if (h[0] === 'tag') {
    const d = DAYS.find(x => x.nr === +h[1]);
    if (!d) return viewHome();
    if (h[2] === 'nachmittag') return viewPM(d);
    if (h[2] === 'quiz') {
      const set = d.sets.find(s => s.id === h[3]);
      if (set) return viewQuizSetup(d, set);
    }
    return viewDay(d);
  }
  viewHome();
}
window.addEventListener('hashchange', () => { if (!(hasAccess() || sessionOk)) return viewGate(route); route(); window.scrollTo(0, 0); app.focus({ preventScroll: true }); });

/* ---------- Zugangscode ---------- */
const CODE_HASH = '7444ca32f9d9c8abf59398f3943c949bea29b4892645a67650280f0771a6c351';
const KEY = 'pw-zugang';
async function sha(t) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t.trim().toLowerCase()));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
function hasAccess() { try { return localStorage.getItem(KEY) === CODE_HASH; } catch (e) { return sessionOk; } }
let sessionOk = false;
const logoutBtn = document.getElementById('logout');
function setLogout() { logoutBtn.hidden = !(hasAccess() || sessionOk); }
logoutBtn.addEventListener('click', () => {
  sessionOk = false; quiz = null;
  try { localStorage.removeItem(KEY); } catch (e) {}
  if (location.hash && location.hash !== '#/') history.replaceState(null, '', location.pathname + location.search);
  viewGate(route); window.scrollTo(0, 0);
});
function viewGate(onOk) {
  logoutBtn.hidden = true;
  header('Kurs', 'Personalwesen 2026');
  app.innerHTML = `
    <form class="panel gate" id="gate" autocomplete="off">
      <div class="gate-ic">${ICON.key}</div>
      <h1>Zugang zum Kurs</h1>
      <p class="lead">Bitte gib den Zugangscode ein, den du im Unterricht bekommen hast.</p>
      <label class="fld"><span>Zugangscode</span>
        <input id="code" type="password" inputmode="text" autocapitalize="off" autocorrect="off" spellcheck="false" required></label>
      <div class="fb bad" id="gerr" hidden><b>Code stimmt nicht</b><span>Bitte prüfe die Schreibweise und versuche es nochmal.</span></div>
      <button class="btn full" type="submit">Weiter</button>
    </form>`;
  const inp = document.getElementById('code'); inp.focus();
  document.getElementById('gate').addEventListener('submit', async e => {
    e.preventDefault();
    if (await sha(inp.value) === CODE_HASH) {
      sessionOk = true;
      try { localStorage.setItem(KEY, CODE_HASH); } catch (err) {}
      setLogout(); onOk();
    } else { document.getElementById('gerr').hidden = false; inp.select(); }
  });
}

Promise.all([
  fetch('data/days.json').then(r => r.json()),
  fetch('data/videos.json').then(r => r.ok ? r.json() : {}).catch(() => ({}))
]).then(([days, vids]) => { DAYS = days; VIDEOS = vids || {}; if (hasAccess() || sessionOk) { setLogout(); route(); } else viewGate(route); })
  .catch(() => { app.innerHTML = '<p class="lead">Die Kursdaten konnten nicht geladen werden. Bitte Seite neu laden.</p>'; });
})();
