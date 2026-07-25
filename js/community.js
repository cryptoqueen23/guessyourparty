(function () {
  // Placeholder data only — swap this module for a fetch against a published
  // Google Sheet (or the embed slot on the page) once live results exist.

  const DIVISIVE = [
    { q: "Abortion access should be protected as a legal right nationwide.", r: 41, m: 12, d: 47 },
    { q: "Gun ownership rights should face minimal government restriction.", r: 44, m: 14, d: 42 },
    { q: "The government should offer a public health insurance option available to everyone.", r: 33, m: 15, d: 52 },
    { q: "Undocumented immigrants without a criminal record should have a path to citizenship.", r: 30, m: 18, d: 52 },
  ];

  const AGE = [
    { label: "18–24", r: 29, m: 22, d: 49 },
    { label: "25–34", r: 34, m: 24, d: 42 },
    { label: "35–44", r: 39, m: 23, d: 38 },
    { label: "45–54", r: 43, m: 22, d: 35 },
    { label: "55–64", r: 47, m: 21, d: 32 },
    { label: "65+", r: 51, m: 19, d: 30 },
  ];

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

  document.getElementById('divisive-list').innerHTML =
    DIVISIVE.map(item => barRow(item.q, item.r, item.m, item.d)).join('');

  document.getElementById('age-list').innerHTML =
    AGE.map(item => barRow(item.label, item.r, item.m, item.d)).join('');
})();
