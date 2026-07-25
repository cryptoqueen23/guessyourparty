(function () {
  const STORAGE_KEY = 'gyp_answers';
  const ORDER_KEY = 'gyp_order';
  const total = QUESTIONS.length;

  // answers[i] = 'yes' | 'no' | 'unsure' | undefined, indexed by QUESTIONS' original order
  let answers = load();
  let order = loadOrder();
  let current = firstUnanswered();

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

  function shuffledIndices() {
    const arr = Array.from({ length: total }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function loadOrder() {
    try {
      const raw = sessionStorage.getItem(ORDER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === total) return parsed;
      }
    } catch (e) { /* fall through to reshuffle */ }
    const fresh = shuffledIndices();
    sessionStorage.setItem(ORDER_KEY, JSON.stringify(fresh));
    return fresh;
  }

  function load() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      // sessionStorage round-trips undefined array slots as null via JSON — normalize back
      return raw ? JSON.parse(raw).map(a => (a === null ? undefined : a)) : new Array(total).fill(undefined);
    } catch (e) {
      return new Array(total).fill(undefined);
    }
  }

  function save() {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }

  function firstUnanswered() {
    const idx = order.findIndex(qi => answers[qi] === undefined);
    return idx === -1 ? 0 : idx;
  }

  function render() {
    const q = QUESTIONS[order[current]];
    els.category.textContent = q.category;
    els.text.textContent = q.text;
    els.count.textContent = `Question ${current + 1} of ${total}`;
    const pct = Math.round(((current) / total) * 100);
    els.pct.textContent = pct + '%';
    els.fill.style.width = pct + '%';

    [els.yes, els.no, els.unsure].forEach(b => b.classList.remove('picked'));
    const a = answers[order[current]];
    if (a === 'yes') els.yes.classList.add('picked');
    if (a === 'no') els.no.classList.add('picked');
    if (a === 'unsure') els.unsure.classList.add('picked');

    els.back.style.visibility = current === 0 ? 'hidden' : 'visible';
    els.skip.textContent = current === total - 1 ? 'Skip →' : 'Skip →';
  }

  function choose(val) {
    answers[order[current]] = val;
    save();
    setTimeout(advance, 160);
  }

  function advance() {
    if (current < total - 1) {
      current += 1;
      render();
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    } else {
      finish();
    }
  }

  function finish() {
    const answeredCount = answers.filter(a => a !== undefined).length;
    if (answeredCount === 0) return;
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
