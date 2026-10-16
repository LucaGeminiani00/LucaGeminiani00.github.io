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

  /* ---------------- footer ---------------- */

  document.getElementById('year').textContent = new Date().getFullYear();
})();
