(function () {
  const STORAGE_KEY = 'gyp_answers';
  const SUBMITTED_KEY = 'gyp_submitted';
  const RESULTS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwtLk8j3xLFFwM5vubRUz-q3M2lYOvz6dfE4QiyKRP7ODspAjPyVafNFRqf_vFPRSBXYA/exec';

  const CATEGORY_KEYS = ['economy', 'healthcare', 'immigration', 'guns', 'abortion', 'education', 'energy', 'crime', 'foreignPolicy', 'elections'];

  function loadProfile() {
    try {
      const raw = sessionStorage.getItem('gyp_profile');
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  function computeCategoryLeans(decisive) {
    const weights = {};
    CATEGORY_KEYS.forEach(k => { weights[k] = { r: 0, d: 0 }; });

    decisive.forEach(d => {
      const bucket = CATEGORY_LEAN_MAP[d.q.category];
      if (!bucket) return;
      weights[bucket][d.matched === 'R' ? 'r' : 'd'] += d.q.weight;
    });

    const leans = {};
    CATEGORY_KEYS.forEach(k => {
      const { r, d } = weights[k];
      leans[k] = r === 0 && d === 0 ? 'N/A' : r === d ? 'Mixed' : r > d ? 'Republican' : 'Democratic';
    });
    return leans;
  }

  function submitResult(rPct, dPct, mPct, decisive) {
    if (sessionStorage.getItem(SUBMITTED_KEY)) return;
    sessionStorage.setItem(SUBMITTED_KEY, '1');

    const profile = loadProfile();
    const leans = computeCategoryLeans(decisive);

    fetch(RESULTS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        email: profile.email || '',
        firstName: profile.name || '',
        marketingOptIn: !!profile.marketing,
        ageRange: profile.age || '',
        state: profile.state || '',
        rPct, dPct, mPct,
        economyLean: leans.economy,
        healthcareLean: leans.healthcare,
        immigrationLean: leans.immigration,
        gunsLean: leans.guns,
        abortionLean: leans.abortion,
        educationLean: leans.education,
        energyLean: leans.energy,
        crimeLean: leans.crime,
        foreignPolicyLean: leans.foreignPolicy,
        electionsLean: leans.elections,
      }),
    }).catch(() => { /* best-effort; don't block the results page on this */ });
  }

  const PLATFORMS = {
    R: {
      name: "Republican",
      summary: "The Republican platform generally emphasizes lower taxes, reduced federal regulation, a strong national defense, stricter immigration enforcement, and leaving many social and economic decisions to states and the private sector rather than the federal government.",
    },
    D: {
      name: "Democratic",
      summary: "The Democratic platform generally emphasizes expanding access to healthcare and education, using federal policy to reduce economic inequality, stronger environmental regulation, and expanding federal protections around civil rights and reproductive rights.",
    },
  };

  function loadAnswers() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      // sessionStorage round-trips undefined array slots as null via JSON — normalize back
      return raw ? JSON.parse(raw).map(a => (a === null ? undefined : a)) : [];
    } catch (e) { return []; }
  }

  function scoreFromAnswers(questionList, answers) {
    let rScore = 0, dScore = 0, mScore = 0;
    const decisive = []; // { q, answer, matched: 'R'|'D' }
    questionList.forEach((q, i) => {
      const a = answers[i];
      if (a === undefined) return;
      if (a === 'unsure') { mScore += q.weight; return; }
      if (a === q.rAnswer) { rScore += q.weight; decisive.push({ q, answer: a, matched: 'R' }); }
      else { dScore += q.weight; decisive.push({ q, answer: a, matched: 'D' }); }
    });
    return { rScore, dScore, mScore, decisive };
  }

  function toPct(rScore, dScore, mScore) {
    const total = rScore + dScore + mScore;
    if (total === 0) return { rPct: 0, dPct: 0, mPct: 100 };
    let rPct = Math.round((rScore / total) * 100);
    let dPct = Math.round((dScore / total) * 100);
    let mPct = 100 - rPct - dPct;
    if (mPct < 0) mPct = 0; // guard against rounding edge cases
    return { rPct, dPct, mPct };
  }

  function tiebreakerCompleted() {
    return sessionStorage.getItem('gyp_tiebreaker_done') === '1';
  }

  function computeTiebreaker() {
    let ids, tbAnswers;
    try { ids = JSON.parse(sessionStorage.getItem('gyp_tiebreaker_ids') || 'null'); } catch (e) { ids = null; }
    try {
      const raw = JSON.parse(sessionStorage.getItem('gyp_tiebreaker_answers') || 'null');
      tbAnswers = raw ? raw.map(a => (a === null ? undefined : a)) : null;
    } catch (e) { tbAnswers = null; }
    if (!ids || !tbAnswers) return { rScore: 0, dScore: 0, mScore: 0, decisive: [] };
    const qs = ids.map(id => TIEBREAKER_QUESTIONS.find(q => q.id === id)).filter(Boolean);
    return scoreFromAnswers(qs, tbAnswers);
  }

  function compute() {
    const main = scoreFromAnswers(QUESTIONS, loadAnswers());
    let rScore = main.rScore, dScore = main.dScore, mScore = main.mScore;
    let decisive = main.decisive.slice();

    if (tiebreakerCompleted()) {
      const tb = computeTiebreaker();
      rScore += tb.rScore; dScore += tb.dScore; mScore += tb.mScore;
      decisive = decisive.concat(tb.decisive);
    }

    const { rPct, dPct, mPct } = toPct(rScore, dScore, mScore);
    return { rPct, dPct, mPct, decisive, answeredCount: decisive.length };
  }

  function headlineFor(rPct, dPct) {
    const diff = rPct - dPct;
    if (Math.abs(diff) < 8) {
      return { title: "You're a balanced, centrist mix", sub: "Your answers split fairly evenly across both platforms — you don't fit neatly into either box.", lean: null };
    }
    if (diff > 0) {
      return { title: `You lean ${PLATFORMS.R.name}`, sub: "Your answers most closely track the Republican policy platform.", lean: 'R' };
    }
    return { title: `You lean ${PLATFORMS.D.name}`, sub: "Your answers most closely track the Democratic policy platform.", lean: 'D' };
  }

  function render() {
    const { rPct, dPct, mPct, decisive } = compute();

    if (decisive.length > 0) submitResult(rPct, dPct, mPct, decisive);

    document.getElementById('pct-r').textContent = rPct + '%';
    document.getElementById('pct-m').textContent = mPct + '%';
    document.getElementById('pct-d').textContent = dPct + '%';

    document.getElementById('seg-r').style.width = rPct + '%';
    document.getElementById('seg-m').style.width = mPct + '%';
    document.getElementById('seg-d').style.width = dPct + '%';

    const pinPos = rPct + (mPct / 2);
    document.getElementById('meter-pin').style.left = pinPos + '%';

    const head = headlineFor(rPct, dPct);
    document.getElementById('headline').textContent = head.title;
    document.getElementById('subhead').textContent = head.sub;

    // Top contributors: highest-weight decisive answers, top 6
    const sorted = [...decisive].sort((a, b) => b.q.weight - a.q.weight).slice(0, 6);
    const driverList = document.getElementById('driver-list');
    driverList.innerHTML = '';
    sorted.forEach(d => {
      const li = document.createElement('li');
      li.className = d.matched === 'R' ? 'r' : 'd';
      const tag = document.createElement('div');
      tag.className = 'tag';
      tag.textContent = `Pulled toward ${d.matched === 'R' ? 'Republican' : 'Democratic'} · ${d.q.category}`;
      const body = document.createElement('div');
      body.textContent = `"${d.q.text}" — you answered ${d.answer === 'yes' ? 'Yes' : 'No'}.`;
      li.appendChild(tag);
      li.appendChild(body);
      driverList.appendChild(li);
    });
    if (sorted.length === 0) {
      driverList.innerHTML = '<li>Answer a few more questions to see what shaped your result.</li>';
    }

    // Platform snapshot
    const platformContainer = document.getElementById('platform-container');
    platformContainer.innerHTML = '';
    const heading = document.getElementById('platform-heading');
    if (head.lean) {
      heading.textContent = `${PLATFORMS[head.lean].name} platform, in brief`;
      platformContainer.appendChild(platformCard(head.lean));
    } else {
      heading.textContent = 'Both platforms, in brief';
      platformContainer.appendChild(platformCard('R'));
      const spacer = document.createElement('div'); spacer.style.height = '10px';
      platformContainer.appendChild(spacer);
      platformContainer.appendChild(platformCard('D'));
    }

    // Benefits & tradeoffs — per-question, for the top drivers
    const tradeoffGrid = document.getElementById('tradeoff-grid');
    tradeoffGrid.innerHTML = '';
    sorted.forEach(d => {
      const card = document.createElement('div');
      card.className = 'tradeoff-card';
      card.innerHTML = `
        <h3>${d.q.category}</h3>
        <p class="q-explain">${d.q.explanation}</p>
        <p><span class="benefit">Potential benefit:</span> ${d.q.benefit}</p>
        <p><span class="tradeoff">Tradeoff:</span> ${d.q.tradeoff}</p>
      `;
      tradeoffGrid.appendChild(card);
    });
    if (tradeoffGrid.children.length === 0) {
      tradeoffGrid.innerHTML = '<p>No decisive answers yet to summarize.</p>';
    }

    // Full breakdown — every decisively-answered question, neutral explanation + benefit/tradeoff
    const breakdownList = document.getElementById('breakdown-list');
    if (breakdownList) {
      breakdownList.innerHTML = '';
      const allDecisive = [...decisive].sort((a, b) => a.q.category.localeCompare(b.q.category));
      allDecisive.forEach(d => {
        const item = document.createElement('div');
        item.className = 'breakdown-item';
        item.innerHTML = `
          <div class="breakdown-head">
            <span class="tag">${d.q.category}</span>
            <span class="breakdown-answer">You answered ${d.answer === 'yes' ? 'Yes' : 'No'}</span>
          </div>
          <p class="breakdown-q">${d.q.text}</p>
          <p class="q-explain">${d.q.explanation}</p>
          <p><span class="benefit">Potential benefit:</span> ${d.q.benefit}</p>
          <p><span class="tradeoff">Tradeoff:</span> ${d.q.tradeoff}</p>
          <p class="breakdown-impact"><strong>Taxes:</strong> ${d.q.impact.taxes} &nbsp;·&nbsp; <strong>Spending:</strong> ${d.q.impact.spending} &nbsp;·&nbsp; <strong>Debt:</strong> ${d.q.impact.debt}</p>
        `;
        breakdownList.appendChild(item);
      });
      if (breakdownList.children.length === 0) {
        breakdownList.innerHTML = '<p>No decisive answers yet.</p>';
      }
    }

    // Fiscal impact table
    const impactBody = document.getElementById('impact-body');
    impactBody.innerHTML = '';
    sorted.forEach(d => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${d.q.category}</td>
        <td>${d.q.impact.taxes}</td>
        <td>${d.q.impact.spending}</td>
        <td>${d.q.impact.debt}</td>
      `;
      impactBody.appendChild(tr);
    });
    if (impactBody.children.length === 0) {
      impactBody.innerHTML = '<tr><td colspan="4">No decisive answers yet.</td></tr>';
    }
  }

  function platformCard(lean) {
    const div = document.createElement('div');
    div.className = 'platform-card';
    div.innerHTML = `<h3 style="font-size:16px;margin-bottom:8px;">${PLATFORMS[lean].name}</h3><p>${PLATFORMS[lean].summary}</p>`;
    return div;
  }

  const retakeBtn = document.getElementById('retake-btn');
  if (retakeBtn) {
    retakeBtn.addEventListener('click', () => {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem('gyp_order');
      sessionStorage.removeItem('gyp_tiebreaker_ids');
      sessionStorage.removeItem('gyp_tiebreaker_answers');
      sessionStorage.removeItem('gyp_tiebreaker_done');
      sessionStorage.removeItem(SUBMITTED_KEY);
    });
  }

  const breakdownToggle = document.getElementById('breakdown-toggle');
  const breakdownPanel = document.getElementById('breakdown-panel');
  if (breakdownToggle && breakdownPanel) {
    breakdownToggle.addEventListener('click', () => {
      const isHidden = breakdownPanel.hasAttribute('hidden');
      if (isHidden) {
        breakdownPanel.removeAttribute('hidden');
        breakdownToggle.classList.add('open');
      } else {
        breakdownPanel.setAttribute('hidden', '');
        breakdownToggle.classList.remove('open');
      }
    });
  }

  function showFullResults() {
    document.getElementById('confidence-gate').hidden = true;
    document.getElementById('full-results').hidden = false;
    render();
  }

  function showConfidenceGate(preliminary) {
    const gateEl = document.getElementById('confidence-gate');
    gateEl.hidden = false;

    const bothUnder50 = preliminary.rPct < 50 && preliminary.dPct < 50;
    const top = Math.max(preliminary.rPct, preliminary.dPct);

    document.getElementById('gate-headline').textContent = bothUnder50
      ? 'Your views are closely split between both major party platforms.'
      : 'Your result is close';
    document.getElementById('gate-subhead').textContent = bothUnder50
      ? "Neither platform stands out clearly yet. Answer 5 more high-impact questions to sharpen your result, or see it now."
      : `You're currently at ${top}% toward one side — 5 more high-impact questions can sharpen that before we call it.`;

    document.getElementById('gate-skip-btn').addEventListener('click', showFullResults, { once: true });
  }

  function init() {
    const preliminary = compute();
    const top = Math.max(preliminary.rPct, preliminary.dPct);
    const needsGate = !tiebreakerCompleted() && preliminary.decisive.length > 0 && top < 60;

    if (needsGate) {
      showConfidenceGate(preliminary);
    } else {
      showFullResults();
    }
  }

  init();
})();

