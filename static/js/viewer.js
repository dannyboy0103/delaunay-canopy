// Delaunay Canopy project page. Three.js hero background + interactive 3D viewers.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

const ACCENT = 0x22d3ee;
const LAV = 0xf472b6;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reads the live accent colour so the hero follows the dark and light themes.
function themeAccent() {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  return new THREE.Color(v || '#22d3ee');
}
function isLightTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light';
}

/* ---------------- Procedural building fallbacks ---------------- */
// A simple hip-roof building used when a real model is unavailable.
function hipRoofVertices() {
  // base rectangle (y up), eave height 0.6, ridge height 1.2
  const w = 1.4, d = 1.0, h = 0.6, ridge = 1.2, ro = 0.5; // ridge offset from ends
  return {
    // corners: base 0-3, eave 4-7, ridge 8-9
    p: [
      [-w, 0, -d], [w, 0, -d], [w, 0, d], [-w, 0, d],           // ground
      [-w, h, -d], [w, h, -d], [w, h, d], [-w, h, d],           // eaves
      [-w + ro, ridge, 0], [w - ro, ridge, 0]                   // ridge ends
    ]
  };
}

function makeRoofWireframe() {
  const { p } = hipRoofVertices();
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],       // ground
    [0, 4], [1, 5], [2, 6], [3, 7],       // walls
    [4, 5], [5, 6], [6, 7], [7, 4],       // eaves
    [4, 8], [7, 8], [5, 9], [6, 9],       // hip edges
    [8, 9]                                // ridge
  ];
  const pos = [];
  edges.forEach(function (e) { pos.push.apply(pos, p[e[0]]); pos.push.apply(pos, p[e[1]]); });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: ACCENT }));
}

function makeRoofPoints() {
  // scatter points on roof faces + walls to mimic an airborne LiDAR scan
  const { p } = hipRoofVertices();
  const tris = [
    [4, 5, 8], [5, 9, 8], [5, 6, 9], [6, 7, 9], [7, 8, 9], [7, 4, 8], // roof faces (approx)
    [0, 1, 5], [0, 5, 4], [1, 2, 6], [1, 6, 5], [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7] // walls
  ];
  const pos = [], col = [];
  const c1 = new THREE.Color(ACCENT), c2 = new THREE.Color(LAV);
  const N = 9000;
  for (let i = 0; i < N; i++) {
    const t = tris[(Math.floor(i * 0.618034 * tris.length)) % tris.length];
    let a = Math.random(), b = Math.random();
    if (a + b > 1) { a = 1 - a; b = 1 - b; }
    const A = p[t[0]], B = p[t[1]], C = p[t[2]];
    const x = A[0] + a * (B[0] - A[0]) + b * (C[0] - A[0]);
    const y = A[1] + a * (B[1] - A[1]) + b * (C[1] - A[1]);
    const z = A[2] + a * (B[2] - A[2]) + b * (C[2] - A[2]);
    pos.push(x + (Math.random() - 0.5) * 0.02, y + (Math.random() - 0.5) * 0.02, z + (Math.random() - 0.5) * 0.02);
    const c = c1.clone().lerp(c2, Math.min(1, y / 1.2));
    col.push(c.r, c.g, c.b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return g;
}


/* ---------------- Hero background ---------------- */
// The hero shows one building as a pair. The input point cloud and the
// reconstructed wireframe occupy the same space, and the two cross-fade into
// each other while the pair keeps rotating.
const HERO = {
  // One cycle runs hold, fade in, both, fade out, and then the same in reverse.
  hold: 3.0,        // seconds a state is alone on screen
  fade: 0.8,        // seconds for one state to appear or disappear
  both: 1.0,        // seconds the point cloud and the wireframe coexist
  spin: 0.09,       // radians per second
  target: 2.4,      // the pair is normalised to this size in world units
  // Framing. The camera distance is solved from the swept volume of the
  // rotating pair, so the building fills the viewport at every aspect ratio.
  // fill is 1.0 for a tight fit at the widest rotation, above 1.0 to zoom in
  // further and let the silhouette run past the edges.
  fill: 1.12,
  elevation: 24,    // degrees above the horizon
  lookY: -0.12,     // fraction of target, negative lifts the building in frame
  pointSize: 0.030, // world units, tuned against the normalised size above
  pointOpacity: 0.95,
  lineWidth: 2.4,   // pixels
  lineOpacity: 1.0,
  // 'auto' is white on the dark theme and black on the light one. 'accent'
  // follows the --accent token. Any CSS colour pins it to that value.
  lineColor: 'auto',
  // 'height' paints a cyan to magenta ramp along the vertical axis, matching the
  // dihedral colour map of the paper. 'data' keeps the colours stored in the
  // PLY, 'accent' paints a flat accent colour.
  pointColor: 'height'
};

// Resolves HERO.lineColor against the theme that is active right now.
function heroLineColor() {
  if (HERO.lineColor === 'accent') return themeAccent();
  if (HERO.lineColor === 'auto') {
    return new THREE.Color(isLightTheme() ? '#000000' : '#ffffff');
  }
  return new THREE.Color(HERO.lineColor);
}

function loadPointsPly(url) {
  return new Promise(function (resolve, reject) {
    new PLYLoader().load(url, resolve, undefined, reject);
  });
}

// Returns a flat array of segment endpoints, two vertices per edge.
function loadEdgesObj(url) {
  return new Promise(function (resolve, reject) {
    new OBJLoader().load(url, function (root) {
      const pos = [];
      root.traverse(function (c) {
        if (!c.geometry) return;
        if (c.isLineSegments) {
          const a = c.geometry.getAttribute('position');
          for (let i = 0; i < a.count; i++) pos.push(a.getX(i), a.getY(i), a.getZ(i));
        } else if (c.isLine) {
          const a = c.geometry.getAttribute('position');
          for (let i = 0; i + 1 < a.count; i++) {
            pos.push(a.getX(i), a.getY(i), a.getZ(i));
            pos.push(a.getX(i + 1), a.getY(i + 1), a.getZ(i + 1));
          }
        } else if (c.isMesh) {
          const e = new THREE.EdgesGeometry(c.geometry, 1);
          const a = e.getAttribute('position');
          for (let i = 0; i < a.count; i++) pos.push(a.getX(i), a.getY(i), a.getZ(i));
          e.dispose();
        }
      });
      if (!pos.length) reject(new Error('no edges in ' + url));
      else resolve(pos);
    }, undefined, reject);
  });
}

function edgesFromFallbackRoof() {
  const g = makeRoofWireframe().geometry;
  return Array.from(g.getAttribute('position').array);
}

// Writes a colour attribute onto a point cloud. Airborne LiDAR colours are dark
// and desaturated, so the 'data' mode lifts them before they are drawn over a
// near black background.
function paintPoints(geometry, upAxis, mode) {
  const pos = geometry.getAttribute('position');
  const n = pos.count;
  const src = geometry.getAttribute('color');
  const col = new Float32Array(n * 3);

  if (mode === 'data' && src) {
    let mean = 0;
    for (let i = 0; i < n; i++) mean += (src.getX(i) + src.getY(i) + src.getZ(i)) / 3;
    mean /= Math.max(1, n);
    const boost = Math.min(2.6, 0.62 / Math.max(0.08, mean));
    for (let i = 0; i < n; i++) {
      col[i * 3] = Math.min(1, src.getX(i) * boost);
      col[i * 3 + 1] = Math.min(1, src.getY(i) * boost);
      col[i * 3 + 2] = Math.min(1, src.getZ(i) * boost);
    }
  } else if (mode === 'height') {
    const get = upAxis === 'z' ? pos.getZ.bind(pos) : pos.getY.bind(pos);
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < n; i++) { const v = get(i); if (v < lo) lo = v; if (v > hi) hi = v; }
    const span = Math.max(1e-6, hi - lo);
    const c1 = new THREE.Color(ACCENT), c2 = new THREE.Color(LAV), c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      c.copy(c1).lerp(c2, (get(i) - lo) / span);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
  } else {
    const c = new THREE.Color(ACCENT);
    for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(col, 3));
}

function buildHero(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 200);

  // Half extents of the cylinder swept by the pair as it rotates, in world
  // units. Filled in once the geometry is known.
  let sweepRadius = HERO.target * 0.5, sweepHeight = HERO.target * 0.5;

  function updateCamera() {
    const vFov = camera.fov * Math.PI / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    const el = HERO.elevation * Math.PI / 180;
    // Widest silhouette while spinning, and its projected height at this tilt.
    const halfW = sweepRadius;
    const halfH = sweepRadius * Math.sin(el) + (sweepHeight / 2) * Math.cos(el);
    // A building is wide and flat, so a tall viewport would leave it stranded in
    // the middle. On narrow screens the framing pushes in further and lets the
    // silhouette run past the left and right edges.
    const boost = camera.aspect < 1 ? Math.min(1.35, 1 / camera.aspect) : 1;
    const d = Math.max(halfW / Math.tan(hFov / 2), halfH / Math.tan(vFov / 2)) / (HERO.fill * boost);
    camera.position.set(0, d * Math.sin(el), d * Math.cos(el));
    camera.lookAt(0, HERO.lookY * HERO.target, 0);
  }

  const spinner = new THREE.Group();   // rotates about the vertical axis
  const scaler = new THREE.Group();    // uniform scale to the target size
  const pair = new THREE.Group();      // holds the two aligned states
  spinner.add(scaler); scaler.add(pair); scene.add(spinner);

  const upAxis = (canvas.getAttribute('data-hero-up') || 'z').toLowerCase();
  if (upAxis === 'z') pair.rotation.x = -Math.PI / 2;

  let points = null, lines = null, ready = false;

  const pointMat = new THREE.PointsMaterial({
    size: HERO.pointSize, sizeAttenuation: true, vertexColors: true,
    transparent: true, opacity: 0, depthWrite: false
  });
  const lineMat = new LineMaterial({
    color: heroLineColor(), linewidth: HERO.lineWidth,
    transparent: true, opacity: 0, dashed: false
  });

  function applyTheme() {
    const light = isLightTheme();
    lineMat.color.copy(heroLineColor());
    // With vertex colours the material colour acts as a multiplier, so the
    // cloud is dimmed rather than blown out on the light theme.
    pointMat.color.set(light ? 0x555555 : 0xffffff);
    // Additive blending gives the cloud its glow over the near black
    // background, but it would wash the points out on a white one.
    pointMat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
    pointMat.needsUpdate = true;
  }
  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-theme']
  });

  function assemble(geometry, edgePositions) {
    paintPoints(geometry, upAxis, HERO.pointColor);
    points = new THREE.Points(geometry, pointMat);

    const lg = new LineSegmentsGeometry();
    lg.setPositions(edgePositions);
    lines = new LineSegments2(lg, lineMat);
    lines.computeLineDistances();

    pair.add(points); pair.add(lines);

    // Centre and normalise the pair as a whole so both states stay registered.
    spinner.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(pair);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    pair.position.set(-center.x, -center.y, -center.z);
    const s = HERO.target / maxDim;
    scaler.scale.setScalar(s);

    // The pair spins about the vertical axis, so the silhouette can grow to the
    // footprint diagonal. Frame against that rather than the resting box.
    sweepRadius = 0.5 * Math.sqrt(size.x * size.x + size.z * size.z) * s;
    sweepHeight = size.y * s;
    updateCamera();
    ready = true;
  }

  const pcUrl = canvas.getAttribute('data-hero-pc');
  const wfUrl = canvas.getAttribute('data-hero-wf');
  const both = (pcUrl && wfUrl)
    ? Promise.all([loadPointsPly(pcUrl), loadEdgesObj(wfUrl)])
    : Promise.reject(new Error('hero pair not configured'));

  both.then(function (r) { assemble(r[0], r[1]); })
    .catch(function () { assemble(makeRoofPoints(), edgesFromFallbackRoof()); });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    lineMat.resolution.set(w, h);
    updateCamera();
  }
  window.addEventListener('resize', resize); resize();

  let visible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; },
      { threshold: 0 }).observe(canvas);
  }

  function smoothstep(x) { return x * x * (3 - 2 * x); }

  // The cycle as a list of segments, each holding a duration and the start and
  // end opacity of the point cloud and of the wireframe. The incoming state is
  // brought up before the outgoing one leaves, which gives a window where both
  // are fully visible.
  const timeline = [
    { d: HERO.hold, pc: [1, 1], wf: [0, 0] },  // point cloud alone
    { d: HERO.fade, pc: [1, 1], wf: [0, 1] },  // wireframe appears over it
    { d: HERO.both, pc: [1, 1], wf: [1, 1] },  // both
    { d: HERO.fade, pc: [1, 0], wf: [1, 1] },  // point cloud leaves
    { d: HERO.hold, pc: [0, 0], wf: [1, 1] },  // wireframe alone
    { d: HERO.fade, pc: [0, 1], wf: [1, 1] },  // point cloud returns over it
    { d: HERO.both, pc: [1, 1], wf: [1, 1] },  // both
    { d: HERO.fade, pc: [1, 1], wf: [1, 0] }   // wireframe leaves
  ];
  const cycleLength = timeline.reduce(function (a, s) { return a + s.d; }, 0);

  // Writes the current opacities of the two states into the materials.
  function applyTimeline(t) {
    let u = ((t % cycleLength) + cycleLength) % cycleLength;
    let seg = timeline[timeline.length - 1];
    for (let i = 0; i < timeline.length; i++) {
      if (u < timeline[i].d) { seg = timeline[i]; break; }
      u -= timeline[i].d;
    }
    const k = smoothstep(Math.min(1, u / seg.d));
    pointMat.opacity = (seg.pc[0] + (seg.pc[1] - seg.pc[0]) * k) * HERO.pointOpacity;
    lineMat.opacity = (seg.wf[0] + (seg.wf[1] - seg.wf[0]) * k) * HERO.lineOpacity;
  }

  const clock = new THREE.Clock();
  let t = 0;

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(0.05, clock.getDelta());
    if (!visible || !ready) return;

    if (reduceMotion) {
      // A single still composition, both states layered.
      pointMat.opacity = 0.35 * HERO.pointOpacity;
      lineMat.opacity = HERO.lineOpacity;
      points.visible = lines.visible = true;
    } else {
      t += dt;
      spinner.rotation.y = t * HERO.spin;
      applyTimeline(t);
      points.visible = pointMat.opacity > 0.01;
      lines.visible = lineMat.opacity > 0.01;
    }
    renderer.render(scene, camera);
  }
  animate();
}

/* ---------------- Multi pane 3D viewer ----------------
   Every pane is a viewport of one canvas seen through one camera. Doing it in a
   single WebGL context avoids one context per pane just to show the same
   building from the same angle. Cell frames, labels and wipe handles are plain
   DOM positioned over the canvas.

   A cell is one framed box. A cell holding two panes is a wipe cell, split by a
   divider the visitor can drag. The two panes of a wipe cell share the viewport
   and differ only in the scissor rectangle, so the projection is identical on
   both sides and the geometry lines up exactly across the seam.

   Two ways to feed it.
   data-cells. A list of cell shapes that repeats for every building, one row per
     building by default. This is what the qualitative sections use.
   data-panes. One cell per pane, shown for a single building at a time, with
     tabs underneath to switch buildings. */
const MULTI = {
  gap: 18,           // unpainted pixels between cells
  narrowBelow: 760,  // stage width in CSS pixels under which the grid narrows
  cellAspect: 1.1,   // width over height of one cell, drives the stage height
  target: 2.4,       // models are normalised to this size in world units
  fill: 1.0,         // 1.0 fits the bounding sphere at any orbit angle
  elevation: 22,     // degrees above the horizon at rest
  azimuth: 35,       // degrees around the vertical axis at rest
  spin: 0.55,        // auto-rotate speed passed to OrbitControls
  pointSize: 0.020,
  pointColor: 'height',
  lineWidth: 2.0,
  wipeMin: 0.04      // the divider never fully hides a side
};

// Same vocabulary as HERO.lineColor. 'auto' follows the theme, 'accent' follows
// the --accent token, anything else is taken as a CSS colour.
function resolveLineColor(spec) {
  if (spec === 'accent') return themeAccent();
  if (!spec || spec === 'auto') return new THREE.Color(isLightTheme() ? '#000000' : '#ffffff');
  return new THREE.Color(spec);
}

function parseJsonAttr(el, name, fallback) {
  try { return JSON.parse(el.getAttribute(name) || ''); } catch (e) { return fallback; }
}

function buildMultiViewer(root) {
  const items = parseJsonAttr(root, 'data-items', []);
  const cellSpecs = parseJsonAttr(root, 'data-cells', null);
  const legacyPanes = parseJsonAttr(root, 'data-panes', null);
  if (!items.length || (!cellSpecs && !legacyPanes)) return;

  // With data-cells the whole set of cells repeats for every building. With
  // data-panes only one building is on screen and the tabs switch it.
  const perSample = !!cellSpecs;
  const shapes = perSample ? cellSpecs : legacyPanes.map(function (p) { return [p]; });

  const upAxis = (root.getAttribute('data-up') || 'z').toLowerCase();
  const cellAspect = parseFloat(root.getAttribute('data-cell-aspect')) || MULTI.cellAspect;
  const cellCount = perSample ? items.length * shapes.length : shapes.length;
  const defaultCols = perSample ? shapes.length : shapes.length;
  const wideCols = Math.min(cellCount, parseInt(root.getAttribute('data-cols'), 10) || defaultCols);
  const narrowCols = Math.min(cellCount, parseInt(root.getAttribute('data-cols-narrow'), 10) || 1);

  const stage = document.createElement('div');
  stage.className = 'multi-stage';
  stage.innerHTML = '<div class="mv-note is-hidden"></div><div class="viewer-loader">loading</div>';
  const tabsEl = document.createElement('div');
  tabsEl.className = 'viewer-tabs';
  root.appendChild(stage);
  root.appendChild(tabsEl);

  const loader = stage.querySelector('.viewer-loader');
  const note = stage.querySelector('.mv-note');

  const canvas = document.createElement('canvas');
  stage.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.autoClear = false;
  renderer.setClearAlpha(0);

  const pointMat = new THREE.PointsMaterial({
    size: MULTI.pointSize, sizeAttenuation: true, vertexColors: true,
    transparent: true, opacity: 0.95, depthWrite: false
  });
  const lineMats = [];   // one per wireframe pane, kept for theme updates and resize

  function lineMatFor(spec) {
    const m = new LineMaterial({
      color: resolveLineColor(spec.color || (spec.accent ? 'accent' : 'auto')),
      linewidth: spec.accent ? MULTI.lineWidth + 0.4 : MULTI.lineWidth,
      transparent: true, opacity: 1
    });
    m.userData.spec = spec;
    lineMats.push(m);
    return m;
  }

  function applyTheme() {
    const light = isLightTheme();
    lineMats.forEach(function (m) {
      const spec = m.userData.spec;
      m.color.copy(resolveLineColor(spec.color || (spec.accent ? 'accent' : 'auto')));
    });
    pointMat.color.set(light ? 0x555555 : 0xffffff);
    pointMat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
    pointMat.needsUpdate = true;
  }

  // A slot is one scene, one pane of one cell. Holders keep the normalising
  // transform, so swapping buildings only replaces the geometry underneath.
  function makeSlot(spec) {
    const scene = new THREE.Scene();
    const scaler = new THREE.Group();
    const inner = new THREE.Group();
    if (upAxis === 'z') inner.rotation.x = -Math.PI / 2;
    scaler.add(inner); scene.add(scaler);
    return {
      spec: spec, scene: scene, scaler: scaler, inner: inner, content: null,
      mat: spec.kind === 'points' ? null : lineMatFor(spec)
    };
  }

  const cells = [];
  for (let i = 0; i < cellCount; i++) {
    const shape = shapes[perSample ? i % shapes.length : i];
    cells.push({
      itemIndex: perSample ? Math.floor(i / shapes.length) : 0,
      slots: shape.map(makeSlot),
      split: 0.5
    });
  }
  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-theme']
  });

  // Cell frames, pane names and, for two pane cells, the draggable divider.
  cells.forEach(function (cell, ci) {
    const frame = document.createElement('div');
    frame.className = 'mv-cell';
    if (cell.slots.length === 1 && cell.slots[0].spec.accent) frame.classList.add('is-ours');
    // A building may carry a caption, for instance the kind of case it stands
    // for. It is written once per building, on its first cell.
    const caption = perSample && ci % shapes.length === 0
      ? (items[cell.itemIndex].name || '') : '';
    if (caption) {
      const t = document.createElement('span');
      t.className = 'mv-title';
      t.textContent = caption;
      frame.appendChild(t);
    }
    stage.appendChild(frame);
    cell.frame = frame;

    // Each pane name lives in a clipping box that ends at the divider, so a name
    // disappears exactly as its side of the cell is covered up. The boxes sit on
    // the stage rather than inside the frame so their edges line up with the
    // divider to the pixel.
    cell.clips = cell.slots.map(function (slot, si) {
      const clip = document.createElement('div');
      clip.className = 'mv-clip ' + (si === 0 ? 'a' : 'b');
      const label = document.createElement('span');
      label.className = 'mv-label';
      label.textContent = slot.spec.label || '';
      if (slot.spec.accent) label.classList.add('is-ours');
      clip.appendChild(label);
      stage.appendChild(clip);
      return clip;
    });

    if (cell.slots.length < 2) return;

    const w = document.createElement('div');
    w.className = 'mv-wipe';
    w.innerHTML = '<span class="mv-handle"><i class="fas fa-left-right"></i></span>';
    stage.appendChild(w);
    cell.wipeEl = w;
    // The divider sits above the cell frame, so dragging it never reaches the
    // orbit controls listening underneath.
    w.addEventListener('pointerdown', function (e) {
      w.setPointerCapture(e.pointerId);
      w.classList.add('is-dragging');
      e.preventDefault();
    });
    w.addEventListener('pointermove', function (e) {
      if (!w.hasPointerCapture(e.pointerId)) return;
      const r = cell.rect;
      if (!r) return;
      const x = e.clientX - stage.getBoundingClientRect().left - r.left;
      cell.split = Math.min(1 - MULTI.wipeMin, Math.max(MULTI.wipeMin, x / r.width));
      positionCell(cell);
    });
    const release = function (e) {
      if (w.hasPointerCapture(e.pointerId)) w.releasePointerCapture(e.pointerId);
      w.classList.remove('is-dragging');
    };
    w.addEventListener('pointerup', release);
    w.addEventListener('pointercancel', release);
  });

  function positionCell(cell) {
    const r = cell.rect;
    if (!r) return;
    const two = cell.slots.length > 1;
    const cut = two ? r.width * cell.split : r.width;

    if (cell.wipeEl) {
      cell.wipeEl.style.left = (r.left + cut) + 'px';
      cell.wipeEl.style.top = r.top + 'px';
      cell.wipeEl.style.height = r.height + 'px';
    }
    const a = cell.clips[0].style;
    a.left = r.left + 'px'; a.top = r.top + 'px';
    a.width = cut + 'px'; a.height = r.height + 'px';
    if (two) {
      const b = cell.clips[1].style;
      b.left = (r.left + cut) + 'px'; b.top = r.top + 'px';
      b.width = (r.width - cut) + 'px'; b.height = r.height + 'px';
    }
  }

  /* ---- Rigs. One camera with its controls, shared by whichever cells should
     turn together. 'on' locks the whole stage to one viewpoint, which is what
     makes a side by side comparison honest. 'sample' gives each building its own
     viewpoint while its cells stay locked to each other. 'off' frees every cell. */
  const syncMode = root.getAttribute('data-sync') || 'on';

  function makeRig() {
    const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 400);
    return {
      camera: camera, controls: [], target: new THREE.Vector3(),
      userMoved: false, fitRadius: MULTI.target * 0.6
    };
  }

  function attachControls(rig, domElement) {
    const c = new OrbitControls(rig.camera, domElement);
    c.enableDamping = true; c.dampingFactor = 0.08;
    c.enablePan = false;
    // Every controller of a rig drives the same target, so they cannot disagree.
    c.target = rig.target;
    // Only the first one auto-rotates, otherwise the rig would spin once per
    // controller attached to it.
    c.autoRotate = !reduceMotion && rig.controls.length === 0;
    c.autoRotateSpeed = MULTI.spin;
    c.addEventListener('start', function () {
      rig.userMoved = true;
      rig.controls.forEach(function (o) { o.autoRotate = false; });
    });
    rig.controls.push(c);
    return c;
  }

  let rigs = [];
  if (syncMode === 'on') {
    const shared = makeRig();
    attachControls(shared, canvas);
    rigs = [shared];
    cells.forEach(function (cell) { cell.rig = shared; });
  } else {
    const byKey = {};
    cells.forEach(function (cell, i) {
      const key = syncMode === 'sample' ? 'i' + cell.itemIndex : 'c' + i;
      if (!byKey[key]) { byKey[key] = makeRig(); rigs.push(byKey[key]); }
      cell.rig = byKey[key];
      cell.frame.classList.add('is-interactive');
      attachControls(cell.rig, cell.frame);
    });
  }

  // Once the visitor has orbited, their viewpoint is theirs to keep, so the
  // resting pose is only imposed while they have not touched it.
  function placeCamera(rig) {
    if (rig.userMoved) { rig.controls.forEach(function (c) { c.update(); }); return; }
    const camera = rig.camera;
    const vFov = camera.fov * Math.PI / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    // The bounding sphere is the honest bound once the user is free to orbit.
    const d = rig.fitRadius / Math.sin(Math.min(vFov, hFov) / 2) / MULTI.fill;
    const el = MULTI.elevation * Math.PI / 180, az = MULTI.azimuth * Math.PI / 180;
    camera.position.set(
      d * Math.cos(el) * Math.sin(az), d * Math.sin(el), d * Math.cos(el) * Math.cos(az));
    rig.target.set(0, 0, 0);
    rig.controls.forEach(function (c) { c.update(); });
  }
  function placeCameras() { rigs.forEach(placeCamera); }

  function fillSlot(slot, payload) {
    if (slot.content) {
      slot.inner.remove(slot.content);
      if (slot.content.geometry) slot.content.geometry.dispose();
      slot.content = null;
    }
    let obj;
    if (slot.spec.kind === 'points') {
      paintPoints(payload, upAxis, MULTI.pointColor);
      obj = new THREE.Points(payload, pointMat);
    } else {
      const g = new LineSegmentsGeometry();
      g.setPositions(payload);
      obj = new LineSegments2(g, slot.mat);
      obj.computeLineDistances();
    }
    slot.inner.add(obj);
    slot.content = obj;
  }

  // Slots that must share a framing are normalised together, from the union of
  // everything in the group, so a corner in one pane sits exactly over its match
  // in the next.
  function normaliseGroup(slots) {
    const box = new THREE.Box3();
    slots.forEach(function (s) {
      s.inner.position.set(0, 0, 0);
      s.scaler.scale.setScalar(1);
      s.scaler.updateMatrixWorld(true);
      if (s.content) box.expandByObject(s.content);
    });
    if (box.isEmpty()) return MULTI.target * 0.6;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const s = MULTI.target / maxDim;
    slots.forEach(function (h) {
      h.inner.position.set(-center.x, -center.y, -center.z);
      h.scaler.scale.setScalar(s);
    });
    return 0.5 * Math.sqrt(size.x * size.x + size.y * size.y + size.z * size.z) * s;
  }

  function fetchSlot(slot, item) {
    const url = item[slot.spec.key];
    if (!url) return Promise.reject(new Error('missing ' + slot.spec.key));
    return slot.spec.kind === 'points' ? loadPointsPly(url) : loadEdgesObj(url);
  }

  function fallbackFor(slot) {
    return slot.spec.kind === 'points' ? makeRoofPoints() : edgesFromFallbackRoof();
  }

  // One group per building, holding every slot of every cell that belongs to it.
  // A group falls back as a unit, since mixing a real model with a stand in
  // would wreck the framing they share.
  function groupsFor(itemIndex) {
    if (!perSample) {
      const all = [];
      cells.forEach(function (cell) { all.push.apply(all, cell.slots); });
      return [{ slots: all, item: items[itemIndex], cells: cells }];
    }
    return items.map(function (item, ii) {
      const mine = cells.filter(function (c) { return c.itemIndex === ii; });
      const slots = [];
      mine.forEach(function (c) { slots.push.apply(slots, c.slots); });
      return { slots: slots, item: item, cells: mine };
    });
  }

  let token = 0;
  function load(itemIndex) {
    const mine = ++token;
    tabsEl.querySelectorAll('.viewer-tab').forEach(function (t, k) {
      t.classList.toggle('is-active', k === itemIndex);
    });
    loader.classList.remove('hidden');

    const groups = groupsFor(itemIndex);
    let missing = 0;

    Promise.all(groups.map(function (g) {
      return Promise.all(g.slots.map(function (s) { return fetchSlot(s, g.item); }))
        .then(function (data) { return { group: g, data: data, real: true }; })
        .catch(function () {
          return { group: g, data: g.slots.map(fallbackFor), real: false };
        });
    })).then(function (results) {
      if (mine !== token) return;
      let radius = 0;
      results.forEach(function (r) {
        if (!r.real) missing++;
        r.data.forEach(function (payload, i) { fillSlot(r.group.slots[i], payload); });
        const rad = normaliseGroup(r.group.slots);
        radius = Math.max(radius, rad);
        // A rig that only ever sees this building frames it exactly. A rig
        // shared with other buildings has to fit the widest of them.
        r.group.cells.forEach(function (c) {
          if (c.rig !== rigs[0] || syncMode !== 'on') c.rig.fitRadius = rad;
        });
      });
      if (syncMode === 'on') rigs[0].fitRadius = radius || MULTI.target * 0.6;
      placeCameras();
      loader.classList.add('hidden');
      note.textContent = missing === 0 ? ''
        : (missing === results.length ? 'placeholder geometry, awaiting data'
                                      : 'some panels show placeholder geometry');
      note.classList.toggle('is-hidden', missing === 0);
    });
  }

  if (!perSample && items.length > 1) {
    items.forEach(function (it, k) {
      const t = document.createElement('button');
      t.className = 'viewer-tab';
      t.textContent = it.name || ('Building ' + (k + 1));
      t.addEventListener('click', function () { load(k); });
      tabsEl.appendChild(t);
    });
  } else {
    tabsEl.style.display = 'none';
  }

  // Recomputed only when the stage actually changes size, since this runs in
  // the render loop.
  let cached = null;
  function layout() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return null;
    if (cached && cached.w === w && cached.h === h) return cached;

    const cols = w < MULTI.narrowBelow ? narrowCols : wideCols;
    const rows = Math.ceil(cellCount / cols);
    const cellW = (w - MULTI.gap * (cols - 1)) / cols;
    const cellH = (h - MULTI.gap * (rows - 1)) / rows;

    renderer.setSize(w, h, false);
    // Every cell is the same size, so one aspect ratio serves every rig.
    rigs.forEach(function (rig) {
      rig.camera.aspect = cellW / cellH;
      rig.camera.updateProjectionMatrix();
    });
    lineMats.forEach(function (m) { m.resolution.set(cellW, cellH); });

    cells.forEach(function (cell, i) {
      const c = i % cols, r = Math.floor(i / cols);
      const left = c * (cellW + MULTI.gap);
      const top = r * (cellH + MULTI.gap);
      cell.frame.style.left = left + 'px';
      cell.frame.style.top = top + 'px';
      cell.frame.style.width = cellW + 'px';
      cell.frame.style.height = cellH + 'px';
      cell.rect = { left: left, top: top, width: cellW, height: cellH };
      // Viewport coordinates start at the bottom left of the canvas.
      cell.viewport = [left, h - top - cellH, cellW, cellH];
      positionCell(cell);
    });

    cached = { w: w, h: h, cols: cols, rows: rows };
    return cached;
  }

  // The stage has no intrinsic height, so it is derived from the grid shape.
  function setStageAspect() {
    const probe = stage.clientWidth || root.clientWidth || window.innerWidth;
    const cols = probe < MULTI.narrowBelow ? narrowCols : wideCols;
    const rows = Math.ceil(cellCount / cols);
    stage.style.aspectRatio = (cols * cellAspect) + ' / ' + rows;
  }
  setStageAspect();

  let visible = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; },
      { threshold: 0.02 }).observe(stage);
  } else { visible = true; }
  window.addEventListener('resize', function () {
    setStageAspect(); cached = null; layout(); placeCameras();
  });

  function animate() {
    requestAnimationFrame(animate);
    if (!visible) return;
    const L = layout();
    if (!L) return;
    rigs.forEach(function (rig) {
      rig.controls.forEach(function (c) { c.update(); });
    });
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, L.w, L.h);
    renderer.clear();
    renderer.setScissorTest(true);

    cells.forEach(function (cell) {
      const v = cell.viewport;
      if (!v) return;
      const cam = cell.rig.camera;
      // The viewport is the whole cell for every pane in it. Only the scissor
      // rectangle differs, which is what makes the wipe seam exact.
      renderer.setViewport(v[0], v[1], v[2], v[3]);
      if (cell.slots.length === 1) {
        renderer.setScissor(v[0], v[1], v[2], v[3]);
        renderer.render(cell.slots[0].scene, cam);
        return;
      }
      const cut = Math.round(v[2] * cell.split);
      if (cut > 0) {
        renderer.setScissor(v[0], v[1], cut, v[3]);
        renderer.render(cell.slots[0].scene, cam);
      }
      if (v[2] - cut > 0) {
        renderer.setScissor(v[0] + cut, v[1], v[2] - cut, v[3]);
        renderer.render(cell.slots[1].scene, cam);
      }
    });
  }

  layout(); placeCameras(); load(0); animate();
}

/* ---------------- Boot ---------------- */
document.querySelectorAll(".multi-viewer").forEach(buildMultiViewer);
const heroCanvas = document.getElementById('hero-canvas');
if (heroCanvas) buildHero(heroCanvas);
