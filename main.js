/* ============================================================
   Luca Geminiani — site logic
   (publication data + rendering, filters, theme, name-denoise
   effect, scroll reveals)
   ============================================================ */

(function () {
  'use strict';

  const ME = 'Luca Geminiani';

  /* ---------------- publication data ----------------
     authors: '*' marks equal contribution. tags: first = first author */

  const PUBS = [
    {
      title: 'IQS-BO: In-Context Query Selection for Bayesian Optimisation',
      authors: 'Luca Geminiani, Nadja Klein',
      venue: 'Preprint', venueClass: 'preprint', year: 2026,
      arxiv: '2610.01269', tags: ['first'],
      abstract: 'TL;DR: A prior-data fitted network that learns where to query next by supervised learning on synthetic priors, proposing Bayesian optimisation queries in a single forward pass and matching or outperforming GP-based BO at a fraction of the cost.',
      bibtex: `@misc{geminiani2026iqsbo,
  title         = {{IQS-BO}: In-Context Query Selection for Bayesian Optimisation},
  author        = {Geminiani, Luca and Klein, Nadja},
  year          = {2026},
  eprint        = {2610.01269},
  archivePrefix = {arXiv},
  primaryClass  = {cs.LG},
  doi           = {10.48550/arXiv.2610.01269}
}`,
    },
    {
      title: 'Point Cloud Sequence Encoding for Material-conditioned Graph Network Simulators',
      authors: 'Philipp Dahlinger, Balázs Gyenes, Niklas Freymuth, Luca Geminiani, Tobias Würth, Johannes Mitsch, Nadja Klein, Luise Kärger, Gerhard Neumann',
      venue: 'NeurIPS', venueClass: 'neurips', year: 2026,
      arxiv: '2605.20978', tags: [],
      abstract: 'TL;DR: PEACH adapts graph network simulators to unseen material properties in-context from point cloud sequences, enabling zero-shot sim-to-real transfer without reconstructing a mesh.',
      bibtex: `@inproceedings{dahlinger2026point,
  title     = {Point Cloud Sequence Encoding for Material-conditioned
               Graph Network Simulators},
  author    = {Dahlinger, Philipp and Gyenes, Bal{\\'a}zs and Freymuth, Niklas
               and Geminiani, Luca and W{\\"u}rth, Tobias and Mitsch, Johannes
               and Klein, Nadja and K{\\"a}rger, Luise and Neumann, Gerhard},
  booktitle = {Advances in Neural Information Processing Systems},
  year      = {2026}
}`,
    },
  ];

  /* ---------------- render publications ---------------- */

  const pubList = document.getElementById('pub-list');

  // the publications block only exists on the home page
  if (pubList) {

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderAuthors(authors) {
    return authors.split(', ').map((a) => {
      const star = a.endsWith('*');
      const name = star ? a.slice(0, -1) : a;
      const html = escapeHtml(name) + (star ? '<sup>*</sup>' : '');
      return name === ME ? `<span class="me">${html}</span>` : html;
    }).join(', ');
  }

  function render() {
    const years = [...new Set(PUBS.map((p) => p.year))].sort((a, b) => b - a);
    let html = '';
    years.forEach((year) => {
      html += `<div class="pub-year-group" data-year="${year}"><h3 class="pub-year">${year}</h3>`;
      PUBS.filter((p) => p.year === year).forEach((p) => {
        const idx = PUBS.indexOf(p);
        const codeLink = p.code ? `<a class="pub-link" href="${p.code}" target="_blank" rel="noopener">code</a>` : '';
        html += `
        <article class="pub-card" data-tags="${p.tags.join(' ')}">
          <div class="pub-venue-col">
            <span class="venue-badge venue-${p.venueClass}">${p.venue}${p.venueClass !== 'preprint' ? ' ' + p.year : ''}</span>
          </div>
          <div>
            <h4 class="pub-title">${escapeHtml(p.title)}</h4>
            <p class="pub-authors">${renderAuthors(p.authors)}</p>
            <div class="pub-links">
              <a class="pub-link" href="https://arxiv.org/abs/${p.arxiv}" target="_blank" rel="noopener">arXiv</a>
              <a class="pub-link" href="https://arxiv.org/pdf/${p.arxiv}" target="_blank" rel="noopener">pdf</a>
              ${codeLink}
              <button class="pub-link abs-btn" data-idx="${idx}">abstract</button>
              <button class="pub-link bib-btn" data-idx="${idx}">bibtex</button>
            </div>
            <div class="pub-abstract">${escapeHtml(p.abstract)}</div>
          </div>
        </article>`;
      });
      html += '</div>';
    });
    pubList.innerHTML = html;
  }

  render();

  // abstract toggle + bibtex copy (event delegation)
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  pubList.addEventListener('click', (e) => {
    const absBtn = e.target.closest('.abs-btn');
    if (absBtn) {
      absBtn.closest('.pub-card').classList.toggle('open');
      return;
    }
    const bibBtn = e.target.closest('.bib-btn');
    if (bibBtn) {
      const text = PUBS[parseInt(bibBtn.dataset.idx)].bibtex;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          () => showToast('BibTeX copied to clipboard'),
          () => showToast('Could not copy — sorry!')
        );
      } else {
        showToast('Clipboard not available');
      }
    }
  });

  /* ---------------- filters ---------------- */

  const filterBar = document.getElementById('pub-filters');

  function applyFilter(f) {
    document.querySelectorAll('.pub-card').forEach((card) => {
      const show = f === 'all' || card.dataset.tags.split(' ').includes(f);
      card.classList.toggle('hidden', !show);
    });
    // hide year headings with no visible papers
    document.querySelectorAll('.pub-year-group').forEach((group) => {
      const any = group.querySelector('.pub-card:not(.hidden)');
      group.style.display = any ? '' : 'none';
    });
  }

  filterBar.addEventListener('click', (e) => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    filterBar.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    applyFilter(chip.dataset.filter);
  });

  const initialChip = filterBar.querySelector('.filter-chip.active');
  if (initialChip) applyFilter(initialChip.dataset.filter);

  } // end publications

  /* ---------------- "Outside the lab" dropdown ----------------
     The section is always on the page but starts collapsed. Clicking the
     heading toggles it; the nav link opens it and scrolls there. */

  const life = document.getElementById('life');
  const lifeToggle = document.getElementById('life-toggle');
  if (life && lifeToggle) {
    const setOpen = (open) => {
      life.classList.toggle('open', open);
      lifeToggle.setAttribute('aria-expanded', String(open));
    };
    lifeToggle.addEventListener('click', () => setOpen(!life.classList.contains('open')));
    document.querySelectorAll('a[href="#life"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        setOpen(true);
        life.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ---------------- photo galleries ----------------
     Missing photos are dropped; a gallery with no photos disappears
     together with its title. Clicking a photo opens the lightbox. */

  document.querySelectorAll('.gallery img').forEach((img) => {
    const drop = () => {
      const gallery = img.closest('.gallery');
      img.closest('figure').remove();
      if (!gallery.querySelector('figure')) {
        const title = gallery.previousElementSibling;
        if (title && title.classList.contains('gallery-title')) title.remove();
        gallery.remove();
      }
    };
    if (img.complete && img.naturalWidth === 0) drop();
    else img.addEventListener('error', drop);
  });

  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const big = lightbox.querySelector('img');
    const count = lightbox.querySelector('.lightbox-count');
    let photos = [];
    let cur = 0;

    const show = (i) => {
      cur = (i + photos.length) % photos.length;
      big.src = photos[cur].src;
      big.alt = photos[cur].alt;
      count.textContent = `${cur + 1} / ${photos.length}`;
    };
    const open = (img) => {
      photos = [...document.querySelectorAll('.gallery img')];
      show(photos.indexOf(img));
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      lightbox.hidden = true;
      big.src = '';
      document.body.style.overflow = '';
    };

    document.addEventListener('click', (e) => {
      const img = e.target.closest('.gallery img');
      if (img) { open(img); return; }
      if (lightbox.hidden || !e.target.closest('#lightbox')) return;
      if (e.target.closest('.lightbox-prev')) show(cur - 1);
      else if (e.target.closest('.lightbox-next') || e.target === big) show(cur + 1);
      else close();
    });

    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(cur - 1);
      else if (e.key === 'ArrowRight') show(cur + 1);
    });

    // swipe on touch screens
    let x0 = null;
    lightbox.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  /* ---------------- theme toggle ---------------- */

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------------- nav scrolled state ---------------- */

  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 12);
  }, { passive: true });

  /* ---------------- scroll reveals ---------------- */

  if ('IntersectionObserver' in window) {
    const ro = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          ro.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el) => ro.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
  }

  /* ---------------- name "denoising" effect ----------------
     The h1 starts as random math-y glyphs and settles into the
     actual name, character by character. */

  const nameEl = document.getElementById('hero-name');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (nameEl && !reducedMotion) {
    const target = nameEl.dataset.text || nameEl.textContent;
    const glyphs = '∂∇∫ΣΠΦΨΩαβγδθλμξπστφχψω0123456789';
    const t0 = performance.now();
    const totalMs = 1300;
    const lockAt = target.split('').map((_, i) => (i / target.length) * totalMs * 0.7 + 250);

    (function denoise(t) {
      const dt = t - t0;
      let out = '';
      let done = true;
      for (let i = 0; i < target.length; i++) {
        if (target[i] === ' ') { out += ' '; continue; }
        if (dt >= lockAt[i]) {
          out += target[i];
        } else {
          out += glyphs[Math.floor(Math.random() * glyphs.length)];
          done = false;
        }
      }
      nameEl.textContent = out;
      if (!done) requestAnimationFrame(denoise);
    })(t0);
  }

  /* ---------------- hero: Gaussian process band ----------------
     A GP posterior (mean, ±1σ/±2σ bands, a few posterior samples) runs
     Bayesian optimisation (Expected Improvement) on a hidden function drawn from the
     prior. Clicking queries f(x) there; hovering shows the predictive
     distribution at that x with its μ and σ. */

  const gpCanvas = document.getElementById('gp-canvas');
  if (gpCanvas && gpCanvas.getContext) {
    const ctx = gpCanvas.getContext('2d');
    const N = 100;          // grid points
    // narrow screens (phones) get fewer, more spread-out points and smoother curves
    const narrow = gpCanvas.clientWidth < 700;
    const LS = narrow ? 0.12 : 0.07;    // RBF lengthscale, x in [0, 1]
    const NOISE = 1e-3;     // observation noise variance
    const N_SAMPLES = 3;
    const STEPS = narrow ? 3 : 6;       // BO iterations per episode
    const N_INIT = narrow ? 2 : 3;      // random points at the start of an episode
    const MAX_OBS = narrow ? 8 : 20;    // start over once this many points are on screen
    const AFTER_CLICK = narrow ? 2 : 4; // BO steps guaranteed after a click
    const STEP_MS = narrow ? 1100 : 1700;
    const REVEAL_MS = narrow ? 2200 : 3200;  // how long the true f(x) is shown
    const CLICK_PAUSE_MS = narrow ? 1300 : 2000;
    // automatic points stay inside the visible part of the band (edges fade out)
    const X_MIN = 0.1, X_MAX = 0.9;
    const Y_RANGE = 2.6;
    const grid = Array.from({ length: N }, (_, i) => i / (N - 1));
    const kern = (a, b) => Math.exp(-0.5 * ((a - b) / LS) ** 2);
    const randn = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
    const canHover = window.matchMedia('(hover: hover)').matches;
    // touch devices always animate; elsewhere reduced motion gets a still plot
    const animate = !canHover || !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Cholesky; pivots that vanish are zeroed (low rank) instead of blowing up
    function chol(A, n) {
      const L = new Float64Array(n * n);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j <= i; j++) {
          let s = A[i * n + j];
          for (let k = 0; k < j; k++) s -= L[i * n + k] * L[j * n + k];
          if (i === j) L[i * n + i] = s > 1e-10 ? Math.sqrt(s) : 0;
          else L[i * n + j] = L[j * n + j] > 0 ? s / L[j * n + j] : 0;
        }
      }
      return L;
    }

    function posterior(X, Y) {
      const n = X.length;
      const mu = new Float64Array(N);
      const cov = new Float64Array(N * N);
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) cov[i * N + j] = kern(grid[i], grid[j]) + (i === j ? 1e-6 : 0);
      }
      if (n) {
        const K = new Float64Array(n * n);
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) K[i * n + j] = kern(X[i], X[j]) + (i === j ? NOISE : 0);
        }
        const Lk = chol(K, n);
        // V = Lk⁻¹ K(X, grid), w = Lk⁻¹ y  →  μ = Vᵀw,  Σ = K** − VᵀV
        const V = new Float64Array(n * N);
        for (let c = 0; c < N; c++) {
          for (let i = 0; i < n; i++) {
            let s = kern(X[i], grid[c]);
            for (let k = 0; k < i; k++) s -= Lk[i * n + k] * V[k * N + c];
            V[i * N + c] = s / Lk[i * n + i];
          }
        }
        const w = new Float64Array(n);
        for (let i = 0; i < n; i++) {
          let s = Y[i];
          for (let k = 0; k < i; k++) s -= Lk[i * n + k] * w[k];
          w[i] = s / Lk[i * n + i];
        }
        for (let a = 0; a < N; a++) {
          for (let i = 0; i < n; i++) mu[a] += V[i * N + a] * w[i];
          for (let b = 0; b <= a; b++) {
            let s = 0;
            for (let i = 0; i < n; i++) s += V[i * N + a] * V[i * N + b];
            cov[a * N + b] -= s;
            if (b !== a) cov[b * N + a] -= s;
          }
        }
      }
      const sd = new Float64Array(N);
      for (let i = 0; i < N; i++) sd[i] = Math.sqrt(Math.max(cov[i * N + i], 0));
      return { mu, sd, L: chol(cov, N) };
    }

    // hidden objective: random Fourier features ≈ a draw from the same RBF prior
    function drawObjective() {
      const M = 60;
      const om = [], ph = [], amp = [];
      for (let m = 0; m < M; m++) {
        om.push(randn() / LS);
        ph.push(Math.random() * 2 * Math.PI);
        amp.push(randn());
      }
      const c = Math.sqrt(2 / M);
      return (x) => {
        let s = 0;
        for (let m = 0; m < M; m++) s += amp[m] * Math.cos(om[m] * x + ph[m]);
        return Math.max(-Y_RANGE + 0.3, Math.min(Y_RANGE - 0.3, c * s));
      };
    }

    const copyState = (t) => ({ mu: t.mu.slice(), sd: t.sd.slice(), L: t.L.slice() });
    const z = Array.from({ length: N_SAMPLES }, () => Float64Array.from(grid, randn));

    let f, X, Y, target, disp, steps;
    let phase = 'run', phaseAt = 0, clock = 0, nextStep = 0, alpha = 1;
    let ripples = [];
    let mouseX = null;

    function observe(x) {
      const y = f(x) + 0.02 * randn();
      X.push(x);
      Y.push(y);
      target = posterior(X, Y);
      if (animate) ripples.push({ x, y, t0: clock });
      else disp = copyState(target);
    }

    function newEpisode(nInit) {
      f = drawObjective();
      X = [];
      Y = [];
      steps = 0;
      target = posterior(X, Y);
      for (let i = 0; i < nInit; i++) observe(X_MIN + (X_MAX - X_MIN) * (i + Math.random()) / nInit);
      disp = copyState(target);
      ripples = [];
    }

    // Expected Improvement over the best observation so far, maximised on the
    // grid. x values that already have an observation are skipped, so the
    // loop never stalls on one spot.
    const MIN_GAP = narrow ? 0.06 : 0.03;
    const XI = 0.01;  // small exploration margin
    const normPdf = (u) => Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
    function normCdf(u) {
      // Abramowitz–Stegun 7.1.26 approximation of erf
      const t = 1 / (1 + 0.3275911 * Math.abs(u) / Math.SQRT2);
      const erf = 1 - t * (0.254829592 + t * (-0.284496736 + t * (1.421413741
        + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-u * u / 2);
      return 0.5 * (1 + (u >= 0 ? erf : -erf));
    }
    function eiQuery(s) {
      const yBest = Y.length ? Math.max(...Y) : 0;
      let best = -1, bv = -Infinity;
      for (let i = 0; i < N; i++) {
        if (grid[i] < X_MIN || grid[i] > X_MAX) continue;
        if (X.some((x) => Math.abs(x - grid[i]) < MIN_GAP)) continue;
        const d = s.mu[i] - yBest - XI, sd = s.sd[i];
        const v = sd > 1e-9 ? d * normCdf(d / sd) + sd * normPdf(d / sd) : Math.max(d, 0);
        if (v > bv) { bv = v; best = i; }
      }
      return best < 0 ? null : grid[best];
    }

    const interp = (arr, x) => {
      const u = Math.max(0, Math.min(N - 1, x * (N - 1)));
      const i = Math.min(N - 2, Math.floor(u));
      return arr[i] + (arr[i + 1] - arr[i]) * (u - i);
    };

    function update(dt) {
      clock += dt;

      // ease the displayed posterior toward the current one
      const r = 1 - Math.exp(-dt / 220);
      for (let i = 0; i < N; i++) {
        disp.mu[i] += (target.mu[i] - disp.mu[i]) * r;
        disp.sd[i] += (target.sd[i] - disp.sd[i]) * r;
      }
      for (let i = 0; i < N * N; i++) disp.L[i] += (target.L[i] - disp.L[i]) * r;

      // posterior samples wiggle: z follows an Ornstein–Uhlenbeck process
      const rho = Math.exp(-dt / 2600);
      const kick = Math.sqrt(1 - rho * rho);
      z.forEach((zs) => { for (let i = 0; i < N; i++) zs[i] = rho * zs[i] + kick * randn(); });

      ripples = ripples.filter((p) => clock - p.t0 < 900);

      if (phase === 'run' && clock >= nextStep) {
        const xq = steps < STEPS ? eiQuery(target) : null;
        if (xq !== null) {
          observe(xq);
          steps++;
          nextStep = clock + STEP_MS;
        } else {
          phase = 'reveal';
          phaseAt = clock;
        }
      } else if (phase === 'reveal' && clock - phaseAt > REVEAL_MS) {
        phase = 'fade';
        phaseAt = clock;
      } else if (phase === 'fade') {
        alpha = Math.max(0, 1 - (clock - phaseAt) / 700);
        if (alpha === 0) {
          newEpisode(N_INIT);
          phase = 'in';
          phaseAt = clock;
        }
      } else if (phase === 'in') {
        alpha = Math.min(1, (clock - phaseAt) / 700);
        if (alpha === 1) {
          phase = 'run';
          nextStep = clock + 900;
        }
      }
    }

    let col = {};
    function readColors() {
      const cs = getComputedStyle(document.documentElement);
      const v = (name) => cs.getPropertyValue(name).trim();
      col = { a: v('--accent'), b: v('--accent-2'), muted: v('--text-muted'), bg: v('--bg') };
    }

    let dpr = 1, pad = 0;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      pad = parseFloat(getComputedStyle(gpCanvas).getPropertyValue('--gp-pad')) || 0;
      gpCanvas.width = Math.round(gpCanvas.clientWidth * dpr);
      gpCanvas.height = Math.round(gpCanvas.clientHeight * dpr);
    }

    function draw() {
      const W = gpCanvas.width / dpr;
      const H = gpCanvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (!W || !H) return;

      // plot inside the padding; curves may swing out into it
      const top = pad + (H - 2 * pad) * 0.06, bot = H - pad - (H - 2 * pad) * 0.06;
      const mid = (top + bot) / 2, yScale = (bot - top) / (2 * Y_RANGE);
      const px = (x) => x * W;
      const py = (y) => mid - y * yScale;
      const reveal = phase === 'reveal' ? Math.min(1, (clock - phaseAt) / 600) : (phase === 'fade' ? 1 : 0);
      const { mu, sd, L } = disp;

      const line = (yAt) => {
        ctx.beginPath();
        for (let i = 0; i < N; i++) ctx[i ? 'lineTo' : 'moveTo'](px(grid[i]), py(yAt(i)));
      };
      const band = (k, a) => {
        ctx.beginPath();
        for (let i = 0; i < N; i++) ctx[i ? 'lineTo' : 'moveTo'](px(grid[i]), py(mu[i] + k * sd[i]));
        for (let i = N - 1; i >= 0; i--) ctx.lineTo(px(grid[i]), py(mu[i] - k * sd[i]));
        ctx.closePath();
        ctx.globalAlpha = alpha * a;
        ctx.fillStyle = col.a;
        ctx.fill();
      };

      band(2, 0.12);
      band(1, 0.16);

      // posterior samples μ + L z
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = col.b;
      ctx.globalAlpha = alpha * 0.6;
      z.forEach((zs) => {
        line((i) => {
          let s = mu[i];
          for (let k = 0; k <= i; k++) s += L[i * N + k] * zs[k];
          return s;
        });
        ctx.stroke();
      });

      // posterior mean
      ctx.lineWidth = 2.8;
      ctx.strokeStyle = col.a;
      ctx.globalAlpha = alpha;
      line((i) => mu[i]);
      ctx.stroke();

      // true objective, revealed at the end of each episode
      if (reveal > 0) {
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = col.muted;
        ctx.globalAlpha = alpha * reveal * 0.8;
        line((i) => f(grid[i]));
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // observations; the incumbent (best so far) gets a ring
      let inc = 0;
      Y.forEach((y, i) => { if (y > Y[inc]) inc = i; });
      X.forEach((x, i) => {
        const fresh = ripples.find((p) => p.x === x);
        const grow = fresh ? Math.min(1, (clock - fresh.t0) / 250) : 1;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(px(x), py(Y[i]), 5.5 * grow, 0, 2 * Math.PI);
        ctx.fillStyle = col.bg;
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = col.a;
        ctx.stroke();
        if (i === inc) {
          ctx.beginPath();
          ctx.arc(px(x), py(Y[i]), 9, 0, 2 * Math.PI);
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = col.b;
          ctx.globalAlpha = alpha * 0.8;
          ctx.stroke();
        }
      });
      ripples.forEach((p) => {
        const t = (clock - p.t0) / 900;
        ctx.beginPath();
        ctx.arc(px(p.x), py(p.y), 5 + 26 * t, 0, 2 * Math.PI);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = col.a;
        ctx.globalAlpha = alpha * (1 - t) * 0.6;
        ctx.stroke();
      });

      // hover: predictive distribution p(f(x) | data) at the cursor
      if (mouseX !== null) {
        const m = interp(mu, mouseX), s = interp(sd, mouseX), x0 = px(mouseX);
        ctx.globalAlpha = 0.25;
        ctx.strokeStyle = col.muted;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x0, pad / 2);
        ctx.lineTo(x0, H - pad / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x0, py(m + 3 * s));
        for (let k = 0; k <= 40; k++) {
          const t = 3 - (6 * k) / 40;
          ctx.lineTo(x0 + 56 * Math.exp(-0.5 * t * t), py(m + t * s));
        }
        ctx.lineTo(x0, py(m - 3 * s));
        ctx.fillStyle = col.b;
        ctx.globalAlpha = 0.14;
        ctx.fill();
        ctx.strokeStyle = col.b;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        const label = `μ ${m.toFixed(2)}  σ ${s.toFixed(2)}`;
        const flip = x0 > W - 150;
        ctx.font = '12px "JetBrains Mono", ui-monospace, monospace';
        ctx.textAlign = flip ? 'right' : 'left';
        ctx.fillStyle = col.muted;
        ctx.globalAlpha = 0.9;
        ctx.fillText(label, x0 + (flip ? -10 : 10), Math.max(16, py(m + 3 * s) - 8));
        ctx.textAlign = 'left';
      }
      ctx.globalAlpha = 1;
    }

    // loop: runs only while the band is on screen; static under reduced motion
    let visible = true, raf = 0, last = 0;
    function frame(t) {
      raf = 0;
      if (animate) {
        update(last ? Math.min(t - last, 50) : 16);
        last = t;
      }
      draw();
      if (animate && visible) raf = requestAnimationFrame(frame);
      else last = 0;
    }
    const requestDraw = () => { if (!raf) raf = requestAnimationFrame(frame); };

    readColors();
    resize();
    newEpisode(animate ? N_INIT : 6);
    nextStep = 900;
    requestDraw();

    new MutationObserver(() => { readColors(); requestDraw(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    if ('ResizeObserver' in window) new ResizeObserver(() => { resize(); requestDraw(); }).observe(gpCanvas);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => {
        visible = en.isIntersecting;
        if (visible) requestDraw();
      }).observe(gpCanvas);
    }

    gpCanvas.addEventListener('click', (e) => {
      const r = gpCanvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      if (phase !== 'run' || X.length >= MAX_OBS) {
        newEpisode(0);
        phase = 'run';
        alpha = 1;
      }
      observe(x);
      if (!canHover) mouseX = x;  // touch: show μ, σ where you tapped
      steps = Math.min(steps, STEPS - AFTER_CLICK);  // BO keeps going for a while after a click
      nextStep = clock + CLICK_PAUSE_MS;
      requestDraw();
    });
    if (canHover) {
      gpCanvas.addEventListener('mousemove', (e) => {
        const r = gpCanvas.getBoundingClientRect();
        mouseX = (e.clientX - r.left) / r.width;
        requestDraw();
      });
      gpCanvas.addEventListener('mouseleave', () => { mouseX = null; requestDraw(); });
    }
  }

  /* ---------------- footer ---------------- */

  document.getElementById('year').textContent = new Date().getFullYear();
})();
