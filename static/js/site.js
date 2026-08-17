/* Delaunay Canopy project page. UI interactions. */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme toggle ---------- */
  function initTheme() {
    var root = document.documentElement;
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (e) {}
    root.setAttribute('data-theme', stored || 'dark');

    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    function icon() {
      var cur = root.getAttribute('data-theme');
      btn.innerHTML = '<span class="material-icons-outlined">' +
        (cur === 'dark' ? 'light_mode' : 'dark_mode') + '</span>';
    }
    icon();
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      icon();
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var targets = document.querySelectorAll('.reveal, .reveal-stagger, .section');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (t) { t.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* ---------- Magnetic buttons ---------- */
  function initMagnetic() {
    return; // magnetic-button effect disabled (remove this line to re-enable)
    if (reduceMotion) return;
    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
      btn.addEventListener('pointermove', function (ev) {
        var r = btn.getBoundingClientRect();
        var mx = ev.clientX - r.left - r.width / 2;
        var my = ev.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + mx * 0.18 + 'px,' + my * 0.28 + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- Before/after comparison sliders ---------- */
  function initCompare() {
    document.querySelectorAll('.compare-stage').forEach(function (stage) {
      // Graceful fallback if the paired images are not present yet.
      var imgs = stage.querySelectorAll('img[data-compare]');
      var replaced = false;
      function toPlaceholder() {
        if (replaced) return; replaced = true;
        var files = [];
        imgs.forEach(function (im) { files.push((im.getAttribute('src') || '').split('/').pop()); });
        var ph = document.createElement('div');
        ph.className = 'asset-placeholder';
        ph.textContent = 'comparison slider  (add ' + files.join(' + ') + ' to static/images/)';
        stage.parentNode.replaceChild(ph, stage);
      }
      var failed = false;
      imgs.forEach(function (im) {
        im.addEventListener('error', function () { failed = true; toPlaceholder(); });
        if (im.complete && im.naturalWidth === 0) { failed = true; }
      });
      if (failed) { toPlaceholder(); return; }

      var top = stage.querySelector('.compare-top');
      var divider = stage.querySelector('.compare-divider');
      var handle = stage.querySelector('.compare-handle');
      var pos = 50;
      function apply(p) {
        pos = Math.max(0, Math.min(100, p));
        top.style.clipPath = 'inset(0 ' + (100 - pos) + '% 0 0)';
        divider.style.left = pos + '%';
        handle.style.left = pos + '%';
        stage.setAttribute('aria-valuenow', Math.round(pos));
      }
      function fromEvent(ev) {
        var r = stage.getBoundingClientRect();
        apply(((ev.clientX - r.left) / r.width) * 100);
      }
      var dragging = false;
      stage.addEventListener('pointerdown', function (ev) {
        dragging = true; stage.classList.add('is-dragging');
        stage.setPointerCapture(ev.pointerId); fromEvent(ev);
      });
      stage.addEventListener('pointermove', function (ev) { if (dragging) fromEvent(ev); });
      stage.addEventListener('pointerup', function () { dragging = false; stage.classList.remove('is-dragging'); });
      stage.addEventListener('pointercancel', function () { dragging = false; stage.classList.remove('is-dragging'); });
      handle.setAttribute('tabindex', '0');
      handle.addEventListener('keydown', function (ev) {
        if (ev.key === 'ArrowLeft') { apply(pos - 3); ev.preventDefault(); }
        if (ev.key === 'ArrowRight') { apply(pos + 3); ev.preventDefault(); }
      });
      apply(50);
    });
  }

  /* ---------- Copy to clipboard ---------- */
  function initCopy() {
    document.querySelectorAll('[data-copy-target]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var el = document.querySelector(btn.getAttribute('data-copy-target'));
        if (!el) return;
        var text = el.innerText;
        var done = function () {
          var old = btn.textContent; btn.textContent = 'Copied';
          setTimeout(function () { btn.textContent = old; }, 1400);
        };
        if (navigator.clipboard) { navigator.clipboard.writeText(text).then(done, done); }
        else {
          var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta);
          ta.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); done();
        }
      });
    });
  }

  /* ---------- Quantitative bar charts ----------
     Four evaluation settings, each drawn as a grid of eight small charts. The
     first row holds the two distance metrics, the second the three corner
     metrics, the third the three wire metrics. Numbers are transcribed from the
     paper, Table 1, and the supplementary, Tables 1 and 2. */
  var QUANT = {
    groups: [
      { title: 'Distance', keys: ['WED', 'ACO'] },
      { title: 'Corner', keys: ['CP', 'CR', 'CF1'] },
      { title: 'Wire', keys: ['EP', 'ER', 'EF1'] }
    ],
    metrics: {
      WED: { label: 'WED', higher: false, digits: 3 },
      ACO: { label: 'ACO', higher: false, digits: 3 },
      CP:  { label: 'Corner Precision', higher: true, digits: 1 },
      CR:  { label: 'Corner Recall', higher: true, digits: 1 },
      CF1: { label: 'Corner F1', higher: true, digits: 1 },
      EP:  { label: 'Wire Precision', higher: true, digits: 1 },
      ER:  { label: 'Wire Recall', higher: true, digits: 1 },
      EF1: { label: 'Wire F1', higher: true, digits: 1 }
    },
    notes: {
      'Tallinn City': 'Building3D Tallinn city dataset, paper Table 1. MODEL* denotes a feature extractor inside the Point2Roof pipeline.',
      'Entry-Level': 'Building3D entry-level dataset, paper Table 1. MODEL* denotes a feature extractor inside the Point2Roof pipeline.',
      'Official Leaderboard': 'Official Building3D Tallinn city leaderboard protocol, supplementary Table 1. Baseline numbers come from the public leaderboard, which does not report WED. MODEL† denotes a backbone inside the standard Building3D architecture.',
      '5-Fold Cross-Validation': '5-fold cross-validation over the combined training and test sets, supplementary Table 2. MODEL* denotes a feature extractor inside the Point2Roof pipeline.'
    },
    data: {
      'Tallinn City': [
        { name: 'Building3D (PointNet)', WED: 0.264, ACO: 0.241, CP: 88.2, CR: 77.6, CF1: 82.6, EP: 80.4, ER: 71.9, EF1: 75.9 },
        { name: 'Point2Roof',            WED: 0.260, ACO: 0.236, CP: 89.3, CR: 78.5, CF1: 83.6, EP: 81.2, ER: 72.2, EF1: 76.4 },
        { name: 'PointTransformer*',     WED: 0.257, ACO: 0.238, CP: 89.7, CR: 79.1, CF1: 84.1, EP: 81.3, ER: 72.4, EF1: 76.6 },
        { name: 'PointMLP*',             WED: 0.255, ACO: 0.233, CP: 90.6, CR: 79.0, CF1: 84.4, EP: 81.6, ER: 72.8, EF1: 76.9 },
        { name: 'PointNeXt*',            WED: 0.256, ACO: 0.229, CP: 90.4, CR: 79.4, CF1: 84.5, EP: 82.0, ER: 73.9, EF1: 78.0 },
        { name: 'PointMeta*',            WED: 0.251, ACO: 0.225, CP: 90.6, CR: 79.8, CF1: 84.9, EP: 82.4, ER: 73.3, EF1: 77.6 },
        { name: 'BWFormer',              WED: 0.245, ACO: 0.213, CP: 91.4, CR: 80.1, CF1: 85.4, EP: 84.2, ER: 74.6, EF1: 79.1 },
        { name: 'Delaunay Canopy',       WED: 0.232, ACO: 0.194, CP: 94.5, CR: 82.8, CF1: 88.3, EP: 87.1, ER: 74.0, EF1: 80.0, ours: true }
      ],
      'Entry-Level': [
        { name: 'Building3D (PointNet)', WED: 0.262, ACO: 0.239, CP: 89.1, CR: 77.8, CF1: 83.1, EP: 80.7, ER: 72.7, EF1: 76.5 },
        { name: 'Point2Roof',            WED: 0.257, ACO: 0.238, CP: 89.5, CR: 78.1, CF1: 83.4, EP: 81.4, ER: 73.4, EF1: 77.2 },
        { name: 'PointTransformer*',     WED: 0.259, ACO: 0.233, CP: 89.7, CR: 79.4, CF1: 84.2, EP: 81.5, ER: 73.8, EF1: 77.5 },
        { name: 'PointMLP*',             WED: 0.255, ACO: 0.229, CP: 89.8, CR: 79.7, CF1: 84.4, EP: 81.4, ER: 74.1, EF1: 77.6 },
        { name: 'PointNeXt*',            WED: 0.255, ACO: 0.231, CP: 91.2, CR: 79.9, CF1: 85.2, EP: 82.7, ER: 74.5, EF1: 78.4 },
        { name: 'PointMeta*',            WED: 0.253, ACO: 0.222, CP: 90.9, CR: 80.9, CF1: 85.6, EP: 83.0, ER: 75.2, EF1: 78.9 },
        { name: 'BWFormer',              WED: 0.242, ACO: 0.201, CP: 92.4, CR: 82.8, CF1: 87.3, EP: 84.9, ER: 77.6, EF1: 81.1 },
        { name: 'Delaunay Canopy',       WED: 0.230, ACO: 0.190, CP: 95.1, CR: 85.7, CF1: 90.2, EP: 87.5, ER: 77.9, EF1: 82.4, ours: true }
      ],
      'Official Leaderboard': [
        { name: 'PointMAE†',             WED: null, ACO: 0.330, CP: 75.0, CR: 47.0, CF1: 58.0, EP: 52.0, ER: 12.0, EF1: 20.0 },
        { name: 'PointM2AE†',            WED: null, ACO: 0.320, CP: 79.0, CR: 58.0, CF1: 67.0, EP: 50.0, ER: 7.0,  EF1: 12.0 },
        { name: 'Point2Roof',            WED: null, ACO: 0.390, CP: 65.0, CR: 30.0, CF1: 41.0, EP: 66.0, ER: 8.0,  EF1: 14.0 },
        { name: 'Linear self-supervised',WED: null, ACO: 0.350, CP: 70.0, CR: 60.0, CF1: 65.0, EP: 67.0, ER: 16.0, EF1: 25.0 },
        { name: 'Supervised',            WED: null, ACO: 0.290, CP: 90.0, CR: 53.0, CF1: 66.0, EP: 88.0, ER: 23.0, EF1: 36.0 },
        { name: 'PBWR',                  WED: 0.271, ACO: 0.222, CP: 98.5, CR: 68.8, CF1: 81.0, EP: 94.3, ER: 65.4, EF1: 77.2 },
        { name: 'BWFormer',              WED: 0.238, ACO: 0.204, CP: 94.9, CR: 82.7, CF1: 88.4, EP: 85.5, ER: 74.1, EF1: 79.4 },
        { name: 'Delaunay Canopy',       WED: 0.225, ACO: 0.206, CP: 95.7, CR: 83.9, CF1: 89.4, EP: 87.6, ER: 75.4, EF1: 81.1, ours: true }
      ],
      '5-Fold Cross-Validation': [
        { name: 'Building3D (PointNet)', WED: 0.271, ACO: 0.245, CP: 87.8, CR: 77.9, CF1: 82.5, EP: 80.8, ER: 71.5, EF1: 75.9 },
        { name: 'Point2Roof',            WED: 0.265, ACO: 0.239, CP: 89.0, CR: 78.2, CF1: 83.3, EP: 81.5, ER: 71.8, EF1: 76.3 },
        { name: 'PointTransformer*',     WED: 0.260, ACO: 0.242, CP: 89.4, CR: 78.8, CF1: 83.8, EP: 81.7, ER: 72.0, EF1: 76.5 },
        { name: 'PointMLP*',             WED: 0.258, ACO: 0.236, CP: 90.3, CR: 79.3, CF1: 84.4, EP: 82.1, ER: 72.5, EF1: 77.0 },
        { name: 'PointNeXt*',            WED: 0.259, ACO: 0.232, CP: 90.7, CR: 79.7, CF1: 84.8, EP: 82.5, ER: 73.0, EF1: 77.5 },
        { name: 'PointMeta*',            WED: 0.254, ACO: 0.228, CP: 91.0, CR: 80.2, CF1: 85.3, EP: 82.9, ER: 73.5, EF1: 77.9 },
        { name: 'BWFormer',              WED: 0.248, ACO: 0.217, CP: 91.8, CR: 80.5, CF1: 85.8, EP: 84.5, ER: 74.3, EF1: 79.1 },
        { name: 'Delaunay Canopy',       WED: 0.250, ACO: 0.199, CP: 93.8, CR: 79.9, CF1: 86.2, EP: 86.8, ER: 74.5, EF1: 80.2, ours: true }
      ]
    }
  };

  function initQuant() {
    var root = document.getElementById('quant');
    if (!root) return;
    var panel = root.querySelector('#quant-panel');
    var noteEl = root.querySelector('#quant-note');
    var state = { dataset: 'Tallinn City' };

    function esc(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // How much of the track the weakest and the strongest value fill. Starting
    // the weakest well along the track is what opens up the middle, so scores
    // that differ by a point or two stop looking identical.
    var LO = 34, HI = 100;

    function chart(key, rows) {
      var md = QUANT.metrics[key];
      var scored = rows.filter(function (r) { return r[key] !== null && r[key] !== undefined; });
      if (!scored.length) return '';
      var vals = scored.map(function (r) { return r[key]; });
      var best = md.higher ? Math.max.apply(null, vals) : Math.min.apply(null, vals);
      var worst = md.higher ? Math.min.apply(null, vals) : Math.max.apply(null, vals);
      var span = best - worst;

      var body = rows.map(function (r) {
        var v = r[key];
        if (v === null || v === undefined) {
          return '<div class="qbar is-empty"><span class="qbar-name">' + esc(r.name) + '</span>' +
            '<span class="qbar-track"></span><span class="qbar-val">n/a</span></div>';
        }
        var cls = 'qbar' + (r.ours ? ' is-ours' : '') + (v === best ? ' is-best' : '');
        // The scale is zoomed to the values being compared rather than anchored
        // at zero, since these scores sit close together and a zero baseline
        // leaves every method looking alike. Bar length is therefore relative to
        // that window, not to the value itself, so both ends of the window are
        // printed under the panel. Longer always means better, whichever
        // direction the metric improves in.
        var w = span === 0 ? (LO + HI) / 2 : LO + ((v - worst) / span) * (HI - LO);
        return '<div class="' + cls + '">' +
          '<span class="qbar-name">' + esc(r.name) + '</span>' +
          '<span class="qbar-track"><span class="qbar-fill" data-w="' + w.toFixed(1) + '"></span></span>' +
          '<span class="qbar-val">' + v.toFixed(md.digits) + '</span></div>';
      }).join('');

      return '<div class="quant-card" data-metric="' + key + '">' +
        '<div class="quant-card-head"><span class="quant-card-title">' + esc(md.label) + '</span>' +
        '<span class="quant-card-dir">' + (md.higher ? 'higher is better' : 'lower is better') + '</span></div>' +
        body +
        '<div class="quant-axis"><span>' + worst.toFixed(md.digits) + '</span>' +
        '<span class="quant-axis-arrow">better</span>' +
        '<span>' + best.toFixed(md.digits) + '</span></div>' +
        '</div>';
    }

    function render() {
      var rows = QUANT.data[state.dataset];
      var html = '';
      QUANT.groups.forEach(function (g) {
        html += '<div class="quant-row quant-row-' + g.keys.length + '">' +
          g.keys.map(function (k) { return chart(k, rows); }).join('') + '</div>';
      });
      panel.innerHTML = html;
      requestAnimationFrame(function () {
        panel.querySelectorAll('.qbar-fill').forEach(function (f) {
          f.style.width = f.getAttribute('data-w') + '%';
        });
      });
      root.querySelectorAll('.quant-dataset').forEach(function (t) {
        t.classList.toggle('is-active', t.getAttribute('data-dataset') === state.dataset);
      });
      if (noteEl) noteEl.textContent = QUANT.notes[state.dataset] || '';
    }

    root.querySelectorAll('.quant-dataset').forEach(function (t) {
      t.addEventListener('click', function () {
        state.dataset = t.getAttribute('data-dataset');
        render();
      });
    });

    // Render (and animate) when the section first appears
    if (!reduceMotion && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { render(); io.disconnect(); }
      }, { threshold: 0.15 });
      io.observe(root);
    } else {
      render();
    }
  }

  /* ---------- Corner score sampling panels ----------
     A grid of panels, one per building and sampling method. Every panel keeps
     the input point cloud and the ground truth wireframe faintly visible, and
     cross-fades through the sampling steps, from the raw cloud down to the
     smallest budget, then loops back to the start. All panels run off one clock
     so the methods are always at the same step, which is the whole point of
     putting them side by side.

     A step is {file, label}. In file, {m} stands for the method key, so a step
     can either be shared by every method (pcd) or belong to one of them
     (cs500, fps500). */
  function initSampling() {
    document.querySelectorAll('.samp-viewer').forEach(function (root) {
      function attr(name, fallback) {
        try { return JSON.parse(root.getAttribute(name) || ''); } catch (e) { return fallback; }
      }
      var buildings = attr('data-buildings', []);
      var methods = attr('data-methods', []);
      var steps = attr('data-steps', []);
      if (!buildings.length || !methods.length || steps.length < 2) return;

      var dir = root.getAttribute('data-dir') || './static/images/';
      var hold = parseFloat(root.getAttribute('data-hold')) || 2.4;
      var fade = parseFloat(root.getAttribute('data-fade')) || 1.1;

      var grid = document.createElement('div');
      grid.className = 'samp-grid';
      grid.style.setProperty('--samp-cols', methods.length);
      root.appendChild(grid);

      var panels = [];
      var broken = false;

      buildings.forEach(function (b) {
        methods.forEach(function (m) {
          var cell = document.createElement('div');
          cell.className = 'samp-cell' + (m.accent ? ' is-ours' : '');

          // The point cloud sits in the flow and so gives the panel its shape,
          // which keeps every building at its own aspect ratio.
          var base = document.createElement('img');
          base.className = 'samp-base';
          base.src = dir + 'samp_' + b + '_pcd.png';
          base.alt = 'Input point cloud';
          cell.appendChild(base);

          var wf = document.createElement('img');
          wf.className = 'samp-layer samp-wf';
          wf.src = dir + 'samp_' + b + '_wf.png';
          wf.alt = 'Ground truth wireframe';
          cell.appendChild(wf);

          var layers = steps.map(function (s, i) {
            var im = document.createElement('img');
            im.className = 'samp-layer samp-step';
            im.src = dir + 'samp_' + b + '_' + s.file.replace('{m}', m.key) + '.png';
            im.alt = m.label + ', ' + s.label;
            im.style.opacity = i === 0 ? 1 : 0;
            cell.appendChild(im);
            return im;
          });

          [base, wf].concat(layers).forEach(function (im) {
            im.addEventListener('error', function () { broken = true; });
          });

          var label = document.createElement('span');
          label.className = 'samp-label';
          label.textContent = m.label;
          cell.appendChild(label);

          var kEl = document.createElement('span');
          kEl.className = 'samp-k';
          kEl.textContent = steps[0].label;
          cell.appendChild(kEl);

          grid.appendChild(cell);
          panels.push({ layers: layers, k: kEl });
        });
      });

      function setStep(a, b, t) {
        var label = steps[t < 0.5 ? a : b].label;
        panels.forEach(function (p) {
          p.layers.forEach(function (im, i) {
            im.style.opacity = i === a ? (1 - t) : (i === b ? t : 0);
          });
          // Guarded, since this runs every frame and the text rarely changes.
          if (p.shown !== label) { p.k.textContent = label; p.shown = label; }
        });
      }

      if (reduceMotion) {
        setStep(steps.length - 1, steps.length - 1, 0);
        return;
      }

      var visible = false;
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (e) { visible = e[0].isIntersecting; },
          { threshold: 0.05 }).observe(root);
      } else { visible = true; }

      // The loop only runs forwards, since sampling only ever removes points.
      // The last step folds back to the first, which reads as starting over
      // rather than as points growing back.
      var cycle = steps.length * (hold + fade);
      var start = null;

      function smoothstep(x) { return x * x * (3 - 2 * x); }

      function frame(now) {
        requestAnimationFrame(frame);
        if (!visible || broken) return;
        if (start === null) start = now;
        var u = ((now - start) / 1000) % cycle;
        var leg = Math.floor(u / (hold + fade));
        var within = u - leg * (hold + fade);
        setStep(leg, (leg + 1) % steps.length,
          within < hold ? 0 : smoothstep((within - hold) / fade));
      }
      requestAnimationFrame(frame);
    });
  }

  /* ---------- Missing figure placeholders ---------- */
  function initPlaceholders() {
    document.querySelectorAll('img[data-fig]').forEach(function (img) {
      img.addEventListener('error', function () {
        var file = (img.getAttribute('src') || '').split('/').pop();
        var ph = document.createElement('div');
        ph.className = 'asset-placeholder';
        ph.textContent = (img.getAttribute('alt') || 'Figure') + '  (add static/images/' + file + ')';
        img.replaceWith(ph);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initReveal();
    initMagnetic();
    initCompare();
    initCopy();
    initQuant();
    initSampling();
    initPlaceholders();
  });
})();
