(function () {
  const IDS_KEY = 'gyp_tiebreaker_ids';
  const ANSWERS_KEY = 'gyp_tiebreaker_answers';
  const COUNT = 5;

  function pickRandomIds() {
    const pool = TIEBREAKER_QUESTIONS.map(q => q.id);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, COUNT);
  }

  function loadIds() {
    try {
      const raw = sessionStorage.getItem(IDS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === COUNT) return parsed;
      }
    } catch (e) { /* fall through */ }
    const fresh = pickRandomIds();
    sessionStorage.setItem(IDS_KEY, JSON.stringify(fresh));
    return fresh;
  }

  function load() {
    try {
      const raw = sessionStorage.getItem(ANSWERS_KEY);
      // sessionStorage round-trips undefined array slots as null via JSON — normalize back
      return raw ? JSON.parse(raw).map(a => (a === null ? undefined : a)) : new Array(COUNT).fill(undefined);
    } catch (e) {
      return new Array(COUNT).fill(undefined);
    }
  }

  function save() {
    sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
  }

  const ids = loadIds();
  const selected = ids.map(id => TIEBREAKER_QUESTIONS.find(q => q.id === id));
  let answers = load();
  let current = (() => {
    const idx = answers.findIndex(a => a === undefined);
    return idx === -1 ? 0 : idx;
  })();

  const els = {
    fill: document.getElementById('progress-fill'),
    count: document.getElementById('progress-count'),
    pct: document.getElementById('progress-pct'),
    category: document.getElementById('q-category'),
    text: document.getElementById('q-text'),
    yes: document.getElementById('btn-yes'),
    no: document.getElementById('btn-no'),
    unsure: document.getElementById('btn-unsure'),
    back: document.getElementById('back-btn'),
    skip: document.getElementById('skip-btn'),
  };

  function render() {
    const q = selected[current];
    els.category.textContent = q.category;
    els.text.textContent = q.text;
    els.count.textContent = `Question ${current + 1} of ${COUNT}`;
    const pct = Math.round((current / COUNT) * 100);
    els.pct.textContent = pct + '%';
    els.fill.style.width = pct + '%';

    [els.yes, els.no, els.unsure].forEach(b => b.classList.remove('picked'));
    const a = answers[current];
    if (a === 'yes') els.yes.classList.add('picked');
    if (a === 'no') els.no.classList.add('picked');
    if (a === 'unsure') els.unsure.classList.add('picked');

    els.back.style.visibility = current === 0 ? 'hidden' : 'visible';
  }

  function choose(val) {
    answers[current] = val;
    save();
    setTimeout(advance, 160);
  }

  function advance() {
    if (current < COUNT - 1) {
      current += 1;
      render();
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    } else {
      finish();
    }
  }

  function finish() {
    sessionStorage.setItem('gyp_tiebreaker_done', '1');
    window.location.href = 'results.html';
  }

  els.yes.addEventListener('click', () => choose('yes'));
  els.no.addEventListener('click', () => choose('no'));
  els.unsure.addEventListener('click', () => choose('unsure'));

  els.back.addEventListener('click', () => {
    if (current > 0) { current -= 1; render(); }
  });

  els.skip.addEventListener('click', () => advance());

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'y') choose('yes');
    else if (k === 'n') choose('no');
    else if (k === 'u') choose('unsure');
    else if (k === 'arrowleft') els.back.click();
    else if (k === 'arrowright' || k === 'enter') els.skip.click();
  });

  render();
})();
