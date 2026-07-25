(function () {
  const RESULTS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzfglcUUs6PZUA0llkYU7cNWNH0JuVgOsH3IctRILZ4fgRdWEB7Fn26VAcjpJIXODCv-g/exec';
  const NOT_ENOUGH = 'Not enough responses yet to calculate this statistic.';

  const CATEGORY_LABELS = {
    economy: 'Economy',
    healthcare: 'Healthcare',
    immigration: 'Immigration',
    guns: 'Guns',
    abortion: 'Abortion',
    education: 'Education',
    energy: 'Energy',
    crime: 'Crime',
    foreignPolicy: 'Foreign Policy',
    elections: 'Elections',
  };
  const CATEGORY_ORDER = ['economy', 'healthcare', 'immigration', 'guns', 'abortion', 'education', 'energy', 'crime', 'foreignPolicy', 'elections'];
  const AGE_ORDER = ['Under 18', '18–24', '25–34', '35–44', '45–54', '55–64', '65+'];

  function barRow(label, r, m, d) {
    return `
      <div class="poll-row">
        <div class="q">${label}</div>
        <div class="bar-row">
          <div class="bar-label">Republican</div>
          <div class="bar-track"><div class="bar-fill r" style="width:${r}%;"></div></div>
          <div class="bar-pct">${r}%</div>
        </div>
        <div class="bar-row">
          <div class="bar-label">Mixed</div>
          <div class="bar-track"><div class="bar-fill m" style="width:${m}%;"></div></div>
          <div class="bar-pct">${m}%</div>
        </div>
        <div class="bar-row">
          <div class="bar-label">Democratic</div>
          <div class="bar-track"><div class="bar-fill d" style="width:${d}%;"></div></div>
          <div class="bar-pct">${d}%</div>
        </div>
      </div>`;
  }

  function insufficientNote(label) {
    return `<p style="font-size:12.5px;color:var(--slate);margin-bottom:14px;">${label ? `<strong>${label}:</strong> ` : ''}${NOT_ENOUGH}</p>`;
  }

  function renderOverall(overall) {
    const el = document.getElementById('overall-block');
    if (overall.insufficient) {
      el.innerHTML = insufficientNote();
      return;
    }
    el.innerHTML = barRow('', overall.rAvg, overall.mAvg, overall.dAvg) +
      `<p style="font-size:12.5px;color:var(--slate);">Based on ${overall.count.toLocaleString()} completed quiz${overall.count === 1 ? '' : 'zes'}.</p>`;
  }

  function renderCategoryList(byCategory) {
    const el = document.getElementById('category-list');
    el.innerHTML = CATEGORY_ORDER.map(key => {
      const c = byCategory[key];
      const label = CATEGORY_LABELS[key];
      if (!c || c.insufficient) return insufficientNote(label);
      return barRow(label, c.rPct, c.mPct, c.dPct);
    }).join('');
  }

  function renderRanked(containerId, keys, byCategory, emptyMessage) {
    const el = document.getElementById(containerId);
    const usable = keys.filter(k => byCategory[k] && !byCategory[k].insufficient);
    if (usable.length === 0) {
      el.innerHTML = insufficientNote();
      return;
    }
    el.innerHTML = usable.slice(0, 5).map(key => {
      const c = byCategory[key];
      return barRow(CATEGORY_LABELS[key], c.rPct, c.mPct, c.dPct);
    }).join('');
  }

  function renderGroupList(containerId, groupData, orderHint) {
    const el = document.getElementById(containerId);
    const keys = Object.keys(groupData);
    if (keys.length === 0) {
      el.innerHTML = insufficientNote();
      return;
    }
    keys.sort((a, b) => {
      if (orderHint) {
        const ai = orderHint.indexOf(a), bi = orderHint.indexOf(b);
        if (ai !== -1 && bi !== -1) return ai - bi;
      }
      return a.localeCompare(b);
    });
    el.innerHTML = keys.map(key => {
      const g = groupData[key];
      if (g.insufficient) return insufficientNote(key);
      return barRow(`${key} <span style="font-weight:400;color:var(--slate);">(${g.count})</span>`, g.rAvg, g.mAvg, g.dAvg);
    }).join('');
  }

  function renderTrends(trends) {
    const el = document.getElementById('trends-block');
    if (!trends || trends.length === 0) {
      el.innerHTML = insufficientNote();
      return;
    }
    const rows = trends.slice(-30).map(t => `<tr><td>${t.date}</td><td>${t.count}</td></tr>`).join('');
    el.innerHTML = `
      <table class="impact-table">
        <thead><tr><th>Date</th><th>Completions</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  fetch(RESULTS_ENDPOINT)
    .then(res => res.json())
    .then(data => {
      if (!data.ok) throw new Error(data.error || 'unknown error');
      renderOverall(data.overall);
      renderCategoryList(data.byCategory);
      renderRanked('most-divided-list', data.mostDivided, data.byCategory);
      renderRanked('strongest-r-list', data.strongestR, data.byCategory);
      renderRanked('strongest-d-list', data.strongestD, data.byCategory);
      renderGroupList('age-list', data.byAge, AGE_ORDER);
      renderGroupList('state-list', data.byState, null);
      renderTrends(data.trends);
    })
    .catch(() => {
      ['overall-block', 'category-list', 'most-divided-list', 'strongest-r-list', 'strongest-d-list', 'age-list', 'state-list', 'trends-block']
        .forEach(id => { document.getElementById(id).innerHTML = '<p style="font-size:12.5px;color:var(--slate);">Live results are temporarily unavailable.</p>'; });
    });
})();
