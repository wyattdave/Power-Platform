import {
  initDataSources, createItem, listItems, getItem, updateItem, deleteItem
} from './codeapp.js';
import { IMAGE_ASSETS } from './config/image-assets.js';

// ── Dataverse config ───────────────────────────────────────────
const TASK_TABLE = 'tasks';
const TASK_KEY = 'activityid';
const CATEGORY_MARK = 'design-doc';
const DATA_FIELD = 'activityadditionalparams';
const DATA_LIMIT = 8192;

initDataSources({
  tasks: { tableId: '', version: '', primaryKey: TASK_KEY, dataSourceType: 'Dataverse', apis: {} }
});

// ── App state ──────────────────────────────────────────────────
const state = {
  docs: [],
  currentDocId: null,
  currentTitle: '',
  items: [],
  selectedId: null,
  tool: 'select',
  defaults: { stroke: '#1f2430', strokeWidth: 2, fill: '#ffffff', dashed: false, fontSize: 18, color: '#1f2430' },
  pendingArrow: null,
  drag: null,
  paletteImages: [],
  dirty: false,
};

const SVG_NS = 'http://www.w3.org/2000/svg';
const DEFAULT_FILL_COLOR = '#ffffff';
const $ = (id) => document.getElementById(id);
const uid = () => 'i' + Math.random().toString(36).slice(2, 10);

// ── Skeleton ───────────────────────────────────────────────────
const root = $('root');
root.innerHTML = `
  <div class="topbar">
    <span class="brand">Simple Design Doc</span>
    <input class="doc-title" id="docTitle" placeholder="Untitled design" />
    <button id="saveBtn" class="primary">Save</button>
    <button id="deleteDocBtn" class="danger">Delete</button>
    <span class="spacer"></span>
    <span class="status" id="status"></span>
  </div>
  <aside class="sidebar">
    <h3>Design Docs</h3>
    <div class="doc-list" id="docList"></div>
    <button class="new-btn" id="newBtn">+ New Design</button>
  </aside>
  <aside class="palette">
    <h3>Tools</h3>
    <div class="tool-grid" id="toolGrid"></div>
    <h3>Images</h3>
    <div class="img-grid" id="imgGrid"></div>
    <label class="upload-btn">+ Upload image<input id="imgUpload" type="file" accept="image/*" multiple hidden /></label>
  </aside>
  <div class="canvas-wrap" id="canvasWrap">
    <svg id="svg" xmlns="http://www.w3.org/2000/svg">
      <g id="layer-items"></g>
      <g id="layer-overlay"></g>
    </svg>
    <div class="style-bar" id="styleBar"></div>
    <div class="inspector hidden" id="inspector"></div>
    <div class="hint">Tip: Ctrl+click two items to connect them with an arrow. Drag images from the palette. Delete to remove selected. Double-click text to edit.</div>
    <div class="toast" id="toast"></div>
  </div>
`;

const svg = $('svg');
const layerItems = $('layer-items');
const layerOverlay = $('layer-overlay');
const inspector = $('inspector');
const styleBar = $('styleBar');
const docTitleInput = $('docTitle');
const statusEl = $('status');
const canvasWrap = $('canvasWrap');

// ── Tools ──────────────────────────────────────────────────────
const TOOLS = [
  { id: 'select',   label: 'Select',   icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3l14 8-6 2-2 6z"/></svg>' },
  { id: 'rect',     label: 'Rect',     icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="6" width="16" height="12"/></svg>' },
  { id: 'oval',     label: 'Oval',     icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="12" rx="9" ry="6"/></svg>' },
  { id: 'line',     label: 'Line',     icon: '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="4" y1="20" x2="20" y2="4"/></svg>' },
  { id: 'freehand', label: 'Pen',      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c4-2 6-8 10-10s5 4 8 2"/></svg>' },
  { id: 'text',     label: 'Text',     icon: '<svg viewBox="0 0 24 24" fill="currentColor"><text x="6" y="18" font-size="16" font-family="serif">T</text></svg>' },
  { id: 'arrow',    label: 'Arrow',    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="20" x2="18" y2="6"/><path d="M12 6h6v6"/></svg>' },
];
const toolGrid = $('toolGrid');
TOOLS.forEach((t) => {
  const b = document.createElement('button');
  b.className = 'tool-btn';
  b.dataset.tool = t.id;
  b.title = t.label;
  b.innerHTML = t.icon;
  b.addEventListener('click', () => setTool(t.id));
  toolGrid.appendChild(b);
});

function setTool(id) {
  state.tool = id;
  state.pendingArrow = null;
  document.querySelectorAll('.tool-btn').forEach((b) => b.classList.toggle('active', b.dataset.tool === id));
  svg.className.baseVal = '';
  if (id !== 'select') svg.classList.add('tool-' + id);
  if (id === 'arrow') svg.classList.add('arrow-pending');
}
setTool('select');

// ── Toast / status ─────────────────────────────────────────────
function toast(msg, isError) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.toggle('error', !!isError);
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2500);
}
function setStatus(s) { statusEl.textContent = s || ''; }
function markDirty() { state.dirty = true; setStatus('Unsaved changes'); }
function markClean() { state.dirty = false; setStatus('Saved'); }

// ── Image palette ──────────────────────────────────────────────
async function loadPaletteImages() {
  const images = IMAGE_ASSETS.map((asset) => ({ name: asset.name, url: asset.src }));
  if (!images.length) {
    toast('No bundled images were generated from dist/img.', true);
  }
  renderPaletteImages(images);
}

function renderPaletteImages(images) {
  const grid = $('imgGrid');
  grid.innerHTML = '';
  state.paletteImages = [];
  images.forEach(({ name, url }) => {
    state.paletteImages.push({ name, url });
    const cell = document.createElement('div');
    cell.className = 'img-thumb';
    cell.draggable = true;
    cell.title = name;
    cell.innerHTML = `<img src="${url}" alt="${escapeHtml(name)}" />`;
    cell.addEventListener('dragstart', (ev) => {
      ev.dataTransfer.setData('text/x-image-url', url);
      ev.dataTransfer.effectAllowed = 'copy';
    });
    grid.appendChild(cell);
  });
}

$('imgUpload').addEventListener('change', async (ev) => {
  const files = Array.from(ev.target.files || []);
  for (const f of files) {
    const dataUrl = await fileToDataUrl(f);
    const cell = document.createElement('div');
    cell.className = 'img-thumb';
    cell.draggable = true;
    cell.title = f.name + ' (uploaded)';
    cell.innerHTML = `<img src="${dataUrl}" alt="${escapeHtml(f.name)}" />`;
    cell.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/x-image-url', dataUrl);
      e.dataTransfer.effectAllowed = 'copy';
    });
    $('imgGrid').appendChild(cell);
    state.paletteImages.push({ name: f.name, url: dataUrl });
  }
  ev.target.value = '';
});

function fileToDataUrl(f) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(f);
  });
}

canvasWrap.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
canvasWrap.addEventListener('drop', (e) => {
  e.preventDefault();
  const url = e.dataTransfer.getData('text/x-image-url');
  if (!url) return;
  const pt = clientToSvg(e.clientX, e.clientY);
  const img = new Image();
  img.onload = () => {
    const maxW = 200;
    const ratio = img.width ? img.height / img.width : 1;
    const w = Math.min(maxW, img.width || maxW);
    const h = w * ratio;
    addItem({ id: uid(), type: 'image', x: pt.x - w / 2, y: pt.y - h / 2, w, h, src: url });
  };
  img.onerror = () => toast('Failed to load image', true);
  img.src = url;
});

// ── Item operations ────────────────────────────────────────────
function addItem(it) {
  state.items.push(it);
  render();
  selectItem(it.id);
  markDirty();
}

function updateItemModel(id, patch) {
  const it = state.items.find((x) => x.id === id);
  if (!it) return;
  Object.assign(it, patch);
  render();
  markDirty();
}

function removeItem(id) {
  state.items = state.items.filter((x) => x.id !== id && !(x.type === 'arrow' && (x.fromId === id || x.toId === id)));
  if (state.selectedId === id) state.selectedId = null;
  render();
  renderInspector();
  renderStyleBar();
  markDirty();
}

function getItemById(id) { return state.items.find((x) => x.id === id); }

// ── Geometry helpers ──────────────────────────────────────────
function clientToSvg(cx, cy) {
  const r = svg.getBoundingClientRect();
  return { x: cx - r.left, y: cy - r.top };
}

function bboxOf(it) { return { x: it.x, y: it.y, w: it.w, h: it.h }; }

function endpoints(it) {
  const x1 = it.flipX ? it.x + it.w : it.x;
  const y1 = it.flipY ? it.y + it.h : it.y;
  const x2 = it.flipX ? it.x : it.x + it.w;
  const y2 = it.flipY ? it.y : it.y + it.h;
  return { x1, y1, x2, y2 };
}

function clipToShapeEdge(shape, toward) {
  const b = bboxOf(shape);
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const dx = toward.x - cx;
  const dy = toward.y - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  if (shape.type === 'oval') {
    const rx = Math.max(1, b.w / 2);
    const ry = Math.max(1, b.h / 2);
    const t = 1 / Math.sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry));
    return { x: cx + dx * t, y: cy + dy * t };
  }
  const halfW = Math.max(1, b.w / 2);
  const halfH = Math.max(1, b.h / 2);
  const tx = dx === 0 ? Infinity : halfW / Math.abs(dx);
  const ty = dy === 0 ? Infinity : halfH / Math.abs(dy);
  const t = Math.min(tx, ty);
  return { x: cx + dx * t, y: cy + dy * t };
}

function hitTest(pt) {
  for (let i = state.items.length - 1; i >= 0; i--) {
    const it = state.items[i];
    if (it.type === 'line' || it.type === 'arrow') {
      const p = it.type === 'arrow' ? arrowPoints(it) : endpoints(it);
      if (pointNearLine(pt, p, 6)) return it;
    } else {
      const b = bboxOf(it);
      if (pt.x >= b.x && pt.x <= b.x + b.w && pt.y >= b.y && pt.y <= b.y + b.h) return it;
    }
  }
  return null;
}

function pointNearLine(p, l, tol) {
  const A = p.x - l.x1, B = p.y - l.y1, C = l.x2 - l.x1, D = l.y2 - l.y1;
  const len2 = C * C + D * D || 1;
  let t = (A * C + B * D) / len2;
  t = Math.max(0, Math.min(1, t));
  const x = l.x1 + t * C, y = l.y1 + t * D;
  const dx = p.x - x, dy = p.y - y;
  return Math.sqrt(dx * dx + dy * dy) <= tol;
}

function arrowPoints(it) {
  let p1, p2;
  if (it.fromId && it.toId) {
    const a = getItemById(it.fromId), b = getItemById(it.toId);
    if (!a || !b) return { x1: it.x, y1: it.y, x2: it.x + it.w, y2: it.y + it.h };
    p1 = clipToShapeEdge(a, { x: b.x + b.w / 2, y: b.y + b.h / 2 });
    p2 = clipToShapeEdge(b, { x: a.x + a.w / 2, y: a.y + a.h / 2 });
  } else if (it.fromId) {
    const a = getItemById(it.fromId);
    p2 = { x: it.x2, y: it.y2 };
    p1 = a ? clipToShapeEdge(a, p2) : { x: it.x1, y: it.y1 };
  } else if (it.toId) {
    const b = getItemById(it.toId);
    p1 = { x: it.x1, y: it.y1 };
    p2 = b ? clipToShapeEdge(b, p1) : { x: it.x2, y: it.y2 };
  } else {
    p1 = { x: it.x1, y: it.y1 };
    p2 = { x: it.x2, y: it.y2 };
  }
  return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
}

// ── Rendering ──────────────────────────────────────────────────
function render() {
  while (layerItems.firstChild) layerItems.removeChild(layerItems.firstChild);
  state.items.forEach((it) => {
    const el = renderItem(it);
    if (el) {
      el.dataset.id = it.id;
      layerItems.appendChild(el);
    }
  });
  renderOverlay();
}

function attrs(el, o) { for (const k in o) el.setAttribute(k, o[k]); }

function isNoFill(value) {
  return value === 'none' || value === 'transparent';
}

function normalizePickerColor(value, fallback = DEFAULT_FILL_COLOR) {
  return /^#[0-9a-f]{6}$/i.test(value || '') ? value : fallback;
}

function getFillPickerValue(target) {
  const defaultFill = normalizePickerColor(state.defaults.fill, DEFAULT_FILL_COLOR);
  return normalizePickerColor(target.fill, defaultFill);
}

function getShapeFill(value) {
  return isNoFill(value) ? 'none' : normalizePickerColor(value, DEFAULT_FILL_COLOR);
}

function dashStr(it) {
  return it.dashed ? (Math.max(1, it.strokeWidth) * 3) + ' ' + (Math.max(1, it.strokeWidth) * 2) : 'none';
}

function renderItem(it) {
  switch (it.type) {
    case 'rect': {
      const el = document.createElementNS(SVG_NS, 'rect');
      attrs(el, {
        x: it.x, y: it.y, width: Math.max(1, it.w), height: Math.max(1, it.h),
        fill: getShapeFill(it.fill), stroke: it.stroke, 'stroke-width': it.strokeWidth, 'stroke-dasharray': dashStr(it)
      });
      return el;
    }
    case 'oval': {
      const el = document.createElementNS(SVG_NS, 'ellipse');
      attrs(el, {
        cx: it.x + it.w / 2, cy: it.y + it.h / 2,
        rx: Math.max(1, it.w / 2), ry: Math.max(1, it.h / 2),
        fill: getShapeFill(it.fill), stroke: it.stroke, 'stroke-width': it.strokeWidth, 'stroke-dasharray': dashStr(it)
      });
      return el;
    }
    case 'line': {
      const p = endpoints(it);
      const el = document.createElementNS(SVG_NS, 'line');
      attrs(el, {
        x1: p.x1, y1: p.y1, x2: p.x2, y2: p.y2,
        stroke: it.stroke, 'stroke-width': it.strokeWidth, 'stroke-linecap': 'round',
        'stroke-dasharray': dashStr(it)
      });
      return el;
    }
    case 'freehand': {
      const g = document.createElementNS(SVG_NS, 'g');
      const pts = it.points || [];
      if (!pts.length) return g;
      const bw = it.bw || it.w || 1, bh = it.bh || it.h || 1;
      const sx = it.w / Math.max(1, bw);
      const sy = it.h / Math.max(1, bh);
      const d = pts.map((p, i) => {
        const X = it.x + p.x * sx, Y = it.y + p.y * sy;
        return (i === 0 ? 'M' : 'L') + X + ' ' + Y;
      }).join(' ');
      const path = document.createElementNS(SVG_NS, 'path');
      attrs(path, {
        d, fill: 'none', stroke: it.stroke, 'stroke-width': it.strokeWidth,
        'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': dashStr(it)
      });
      g.appendChild(path);
      return g;
    }
    case 'text': {
      const el = document.createElementNS(SVG_NS, 'text');
      attrs(el, {
        x: it.x, y: it.y + it.fontSize, 'font-size': it.fontSize, fill: it.color,
        'font-family': '-apple-system, "Segoe UI", Roboto, sans-serif'
      });
      el.textContent = it.text || 'Text';
      setTimeout(() => {
        try {
          const bb = el.getBBox();
          if (bb.width && (Math.abs(bb.width - it.w) > 1 || Math.abs(bb.height - it.h) > 1)) {
            it.w = bb.width; it.h = bb.height;
            if (state.selectedId === it.id) renderOverlay();
          }
        } catch (e) {}
      }, 0);
      return el;
    }
    case 'image': {
      const el = document.createElementNS(SVG_NS, 'image');
      attrs(el, { x: it.x, y: it.y, width: Math.max(1, it.w), height: Math.max(1, it.h), preserveAspectRatio: 'none' });
      el.setAttributeNS('http://www.w3.org/1999/xlink', 'href', it.src);
      el.setAttribute('href', it.src);
      return el;
    }
    case 'arrow': {
      const g = document.createElementNS(SVG_NS, 'g');
      const ap = arrowPoints(it);
      // sync bbox so selection & inspector reflect actual line
      it.x = Math.min(ap.x1, ap.x2); it.y = Math.min(ap.y1, ap.y2);
      it.w = Math.max(1, Math.abs(ap.x2 - ap.x1)); it.h = Math.max(1, Math.abs(ap.y2 - ap.y1));
      const line = document.createElementNS(SVG_NS, 'line');
      attrs(line, {
        x1: ap.x1, y1: ap.y1, x2: ap.x2, y2: ap.y2,
        stroke: it.stroke, 'stroke-width': it.strokeWidth, 'stroke-linecap': 'round',
        'stroke-dasharray': dashStr(it)
      });
      g.appendChild(line);
      const ang = Math.atan2(ap.y2 - ap.y1, ap.x2 - ap.x1);
      const sz = 8 + it.strokeWidth * 1.5;
      const lx = ap.x2 - sz * Math.cos(ang - Math.PI / 7);
      const ly = ap.y2 - sz * Math.sin(ang - Math.PI / 7);
      const rx = ap.x2 - sz * Math.cos(ang + Math.PI / 7);
      const ry = ap.y2 - sz * Math.sin(ang + Math.PI / 7);
      const head = document.createElementNS(SVG_NS, 'polygon');
      attrs(head, { points: `${ap.x2},${ap.y2} ${lx},${ly} ${rx},${ry}`, fill: it.stroke });
      g.appendChild(head);
      return g;
    }
  }
}

function renderOverlay() {
  while (layerOverlay.firstChild) layerOverlay.removeChild(layerOverlay.firstChild);
  const it = getItemById(state.selectedId);
  if (!it) return;
  const b = bboxOf(it);
  const pad = 4;
  const box = document.createElementNS(SVG_NS, 'rect');
  attrs(box, { class: 'sel-box', x: b.x - pad, y: b.y - pad, width: b.w + 2 * pad, height: b.h + 2 * pad });
  layerOverlay.appendChild(box);
  const HS = 8;
  const handles = [
    ['nw', b.x, b.y], ['n', b.x + b.w / 2, b.y], ['ne', b.x + b.w, b.y],
    ['w', b.x, b.y + b.h / 2], ['e', b.x + b.w, b.y + b.h / 2],
    ['sw', b.x, b.y + b.h], ['s', b.x + b.w / 2, b.y + b.h], ['se', b.x + b.w, b.y + b.h],
  ];
  handles.forEach(([dir, hx, hy]) => {
    const h = document.createElementNS(SVG_NS, 'rect');
    attrs(h, { class: 'sel-handle ' + dir, x: hx - HS / 2, y: hy - HS / 2, width: HS, height: HS });
    h.dataset.handle = dir;
    layerOverlay.appendChild(h);
  });
}

function selectItem(id) {
  state.selectedId = id;
  renderOverlay();
  renderInspector();
  renderStyleBar();
}

// ── Inspector ──────────────────────────────────────────────────
function renderInspector() {
  const it = getItemById(state.selectedId);
  if (!it) { inspector.classList.add('hidden'); inspector.innerHTML = ''; return; }
  inspector.classList.remove('hidden');
  inspector.innerHTML = `
    <div class="field"><label>X</label><input type="number" data-k="x" value="${Math.round(it.x)}"/></div>
    <div class="field"><label>Y</label><input type="number" data-k="y" value="${Math.round(it.y)}"/></div>
    <div class="field"><label>W</label><input type="number" data-k="w" value="${Math.round(it.w)}"/></div>
    <div class="field"><label>H</label><input type="number" data-k="h" value="${Math.round(it.h)}"/></div>
  `;
  inspector.querySelectorAll('input').forEach((inp) => {
    inp.addEventListener('input', () => {
      const v = parseFloat(inp.value);
      if (isNaN(v)) return;
      const k = inp.dataset.k;
      const patch = { [k]: v };
      if ((k === 'w' || k === 'h') && patch[k] < 1) patch[k] = 1;
      updateItemModel(it.id, patch);
    });
  });
}

// ── Style bar ──────────────────────────────────────────────────
function renderStyleBar() {
  const it = getItemById(state.selectedId);
  const target = it || state.defaults;
  const isText = it && it.type === 'text';
  const isImage = it && it.type === 'image';
  const hasFill = it && (it.type === 'rect' || it.type === 'oval');
  const fillDisabled = isNoFill(target.fill);
  const fillPickerValue = getFillPickerValue(target);

  let html = '';
  if (!it) html += `<label style="color:var(--text-dim)">Defaults for new shapes:</label>`;
  if (isText) {
    html += `
      <label>Text color <input type="color" data-style="color" value="${target.color}"/></label>
      <label>Font size <input type="number" min="6" max="200" data-style="fontSize" value="${target.fontSize}"/></label>
    `;
  } else if (isImage) {
    html += `<label style="color:var(--text-dim)">Image — drag handles to resize</label>`;
  } else {
    html += `
      <label>Stroke <input type="color" data-style="stroke" value="${target.stroke}"/></label>
      <label>Width <input type="number" min="0" max="40" data-style="strokeWidth" value="${target.strokeWidth}"/></label>
      ${hasFill || !it ? `<label>Fill <input type="color" data-style="fill" value="${fillPickerValue}" ${fillDisabled ? 'disabled' : ''}/></label>
      <label>No fill <input type="checkbox" data-style="fillNone" ${fillDisabled ? 'checked' : ''}/></label>` : ''}
      <label>Dashed <input type="checkbox" data-style="dashed" ${target.dashed ? 'checked' : ''}/></label>
    `;
  }
  if (it) html += `<button class="del-btn" id="delBtn">Delete</button>`;
  styleBar.innerHTML = html;
  styleBar.querySelectorAll('[data-style]').forEach((inp) => {
    inp.addEventListener('input', () => {
      const k = inp.dataset.style;
      let patch;
      if (k === 'fillNone') {
        const fillInput = styleBar.querySelector('[data-style="fill"]');
        const fallbackFill = fillInput ? normalizePickerColor(fillInput.value, fillPickerValue) : fillPickerValue;
        if (fillInput) fillInput.disabled = inp.checked;
        patch = { fill: inp.checked ? 'none' : fallbackFill };
      } else {
        let v;
        if (inp.type === 'checkbox') v = inp.checked;
        else if (inp.type === 'number') v = parseFloat(inp.value) || 0;
        else v = inp.value;
        if (k === 'fill') v = normalizePickerColor(v, fillPickerValue);
        patch = { [k]: v };
      }
      if (it) updateItemModel(it.id, patch);
      else Object.assign(state.defaults, patch);
    });
  });
  const del = $('delBtn');
  if (del) del.addEventListener('click', () => { if (state.selectedId) removeItem(state.selectedId); });
}
renderStyleBar();

// ── Mouse interactions ─────────────────────────────────────────
svg.addEventListener('mousedown', (ev) => {
  if (ev.button !== 0) return;
  const pt = clientToSvg(ev.clientX, ev.clientY);

  // Ctrl+click (or arrow tool) → start/finish an anchored arrow
  if (ev.ctrlKey || ev.metaKey || state.tool === 'arrow') {
    const hit = hitTest(pt);
    if (!state.pendingArrow) {
      if (hit && hit.type !== 'line' && hit.type !== 'arrow' && hit.type !== 'freehand') {
        state.pendingArrow = { fromId: hit.id };
        toast('Arrow start set — click target item to connect');
      } else if (hit) {
        toast('Pick a shape, image, or text as the arrow source', true);
      }
      return;
    } else {
      const d = { ...state.defaults };
      let arrow;
      if (hit && hit.id !== state.pendingArrow.fromId && hit.type !== 'line' && hit.type !== 'arrow' && hit.type !== 'freehand') {
        arrow = {
          id: uid(), type: 'arrow',
          fromId: state.pendingArrow.fromId, toId: hit.id,
          x: 0, y: 0, w: 1, h: 1,
          stroke: d.stroke, strokeWidth: d.strokeWidth, dashed: d.dashed
        };
      } else {
        // end at clicked empty point
        arrow = {
          id: uid(), type: 'arrow',
          fromId: state.pendingArrow.fromId,
          x2: pt.x, y2: pt.y,
          x: 0, y: 0, w: 1, h: 1,
          stroke: d.stroke, strokeWidth: d.strokeWidth, dashed: d.dashed
        };
      }
      state.pendingArrow = null;
      addItem(arrow);
      if (state.tool === 'arrow') setTool('select');
      return;
    }
  }

  // overlay handle?
  if (ev.target && ev.target.dataset && ev.target.dataset.handle) {
    const it = getItemById(state.selectedId);
    if (it) {
      state.drag = { mode: 'resize', id: it.id, handle: ev.target.dataset.handle, start: pt, orig: { x: it.x, y: it.y, w: it.w, h: it.h } };
      return;
    }
  }

  // tool draw?
  if (state.tool !== 'select') {
    const d = { ...state.defaults };
    if (state.tool === 'rect' || state.tool === 'oval') {
      const it = { id: uid(), type: state.tool, x: pt.x, y: pt.y, w: 1, h: 1, ...d };
      state.items.push(it);
      state.selectedId = it.id;
      state.drag = { mode: 'create-bbox', id: it.id, start: pt };
      render();
    } else if (state.tool === 'line') {
      const it = { id: uid(), type: 'line', x: pt.x, y: pt.y, w: 1, h: 1, flipX: false, flipY: false, ...d };
      state.items.push(it);
      state.selectedId = it.id;
      state.drag = { mode: 'create-line', id: it.id, start: pt };
      render();
    } else if (state.tool === 'freehand') {
      const it = { id: uid(), type: 'freehand', x: pt.x, y: pt.y, w: 1, h: 1, bw: 1, bh: 1, points: [{ x: 0, y: 0 }], ...d };
      state.items.push(it);
      state.selectedId = it.id;
      state.drag = { mode: 'create-freehand', id: it.id, start: pt, raw: [{ x: pt.x, y: pt.y }] };
      render();
    } else if (state.tool === 'text') {
      const it = {
        id: uid(), type: 'text', x: pt.x, y: pt.y, w: 80, h: d.fontSize + 4,
        text: 'Text', fontSize: d.fontSize, color: d.color
      };
      addItem(it);
      setTool('select');
      setTimeout(() => beginTextEdit(it.id), 0);
    }
    markDirty();
    return;
  }

  // select tool
  const hit = hitTest(pt);
  if (hit) {
    selectItem(hit.id);
    state.drag = { mode: 'move', id: hit.id, start: pt, orig: { x: hit.x, y: hit.y } };
  } else {
    selectItem(null);
  }
});

window.addEventListener('mousemove', (ev) => {
  if (!state.drag) return;
  const pt = clientToSvg(ev.clientX, ev.clientY);
  const d = state.drag;
  const it = getItemById(d.id);
  if (!it) { state.drag = null; return; }

  if (d.mode === 'move') {
    it.x = d.orig.x + (pt.x - d.start.x);
    it.y = d.orig.y + (pt.y - d.start.y);
    render();
    renderInspector();
  } else if (d.mode === 'resize') {
    const h = d.handle;
    let nx = d.orig.x, ny = d.orig.y, nw = d.orig.w, nh = d.orig.h;
    const dx = pt.x - d.start.x, dy = pt.y - d.start.y;
    if (h.includes('w')) { nx = d.orig.x + dx; nw = d.orig.w - dx; }
    if (h.includes('e')) { nw = d.orig.w + dx; }
    if (h.includes('n')) { ny = d.orig.y + dy; nh = d.orig.h - dy; }
    if (h.includes('s')) { nh = d.orig.h + dy; }
    if (nw < 1) nw = 1;
    if (nh < 1) nh = 1;
    it.x = nx; it.y = ny; it.w = nw; it.h = nh;
    render();
    renderInspector();
  } else if (d.mode === 'create-bbox') {
    it.x = Math.min(d.start.x, pt.x);
    it.y = Math.min(d.start.y, pt.y);
    it.w = Math.max(1, Math.abs(pt.x - d.start.x));
    it.h = Math.max(1, Math.abs(pt.y - d.start.y));
    render();
  } else if (d.mode === 'create-line') {
    it.x = Math.min(d.start.x, pt.x);
    it.y = Math.min(d.start.y, pt.y);
    it.w = Math.max(1, Math.abs(pt.x - d.start.x));
    it.h = Math.max(1, Math.abs(pt.y - d.start.y));
    it.flipX = pt.x < d.start.x;
    it.flipY = pt.y < d.start.y;
    render();
  } else if (d.mode === 'create-freehand') {
    d.raw.push({ x: pt.x, y: pt.y });
    const minX = Math.min(...d.raw.map((p) => p.x));
    const minY = Math.min(...d.raw.map((p) => p.y));
    const maxX = Math.max(...d.raw.map((p) => p.x));
    const maxY = Math.max(...d.raw.map((p) => p.y));
    it.x = minX; it.y = minY;
    it.w = Math.max(1, maxX - minX); it.h = Math.max(1, maxY - minY);
    it.bw = it.w; it.bh = it.h;
    it.points = d.raw.map((p) => ({ x: p.x - minX, y: p.y - minY }));
    render();
  }
});

window.addEventListener('mouseup', () => {
  if (state.drag) {
    state.drag = null;
    renderInspector();
    renderStyleBar();
    renderOverlay();
    markDirty();
  }
});

svg.addEventListener('dblclick', (ev) => {
  const pt = clientToSvg(ev.clientX, ev.clientY);
  const hit = hitTest(pt);
  if (hit && hit.type === 'text') beginTextEdit(hit.id);
});

function beginTextEdit(id) {
  const it = getItemById(id);
  if (!it) return;
  const rect = svg.getBoundingClientRect();
  const wrapRect = canvasWrap.getBoundingClientRect();
  const left = (rect.left - wrapRect.left) + it.x;
  const top = (rect.top - wrapRect.top) + it.y;
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.className = 'text-edit';
  inp.value = it.text || '';
  inp.style.left = left + 'px';
  inp.style.top = top + 'px';
  inp.style.fontSize = it.fontSize + 'px';
  inp.style.color = it.color;
  inp.style.minWidth = Math.max(40, it.w) + 'px';
  canvasWrap.appendChild(inp);
  inp.focus();
  inp.select();
  const finish = () => {
    it.text = inp.value || ' ';
    inp.remove();
    render();
    renderOverlay();
    markDirty();
  };
  inp.addEventListener('blur', finish, { once: true });
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') inp.blur(); if (e.key === 'Escape') { inp.value = it.text; inp.blur(); } });
}

window.addEventListener('keydown', (ev) => {
  if (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
  if ((ev.key === 'Delete' || ev.key === 'Backspace') && state.selectedId) {
    ev.preventDefault();
    removeItem(state.selectedId);
  }
  if (ev.key === 'Escape') {
    state.pendingArrow = null;
    selectItem(null);
  }
});

// ── Persistence ───────────────────────────────────────────────
async function loadDocs() {
  try {
    setStatus('Loading…');
    const res = await listItems(TASK_TABLE, TASK_KEY, {
      filter: `category eq '${CATEGORY_MARK}'`,
      select: ['activityid', 'subject'],
      orderBy: 'subject asc',
      top: 200
    });
    state.docs = (res.entities || []).map((r) => ({ id: r.activityid, subject: r.subject || '(untitled)' }));
    renderDocList();
    setStatus('');
  } catch (e) {
    console.error(e);
    toast('Failed to load designs: ' + (e.message || e), true);
    setStatus('');
  }
}

function renderDocList() {
  const list = $('docList');
  list.innerHTML = '';
  if (!state.docs.length) {
    const empty = document.createElement('div');
    empty.style.cssText = 'padding:10px;color:#7a8299;font-size:12px;';
    empty.textContent = 'No designs yet. Click + New Design.';
    list.appendChild(empty);
    return;
  }
  state.docs.forEach((d) => {
    const row = document.createElement('div');
    row.className = 'doc-item' + (d.id === state.currentDocId ? ' active' : '');
    row.innerHTML = `<span>${escapeHtml(d.subject)}</span><button class="doc-del" title="Delete">×</button>`;
    row.addEventListener('click', (ev) => {
      if (ev.target.classList.contains('doc-del')) return;
      openDoc(d.id);
    });
    row.querySelector('.doc-del').addEventListener('click', async (ev) => {
      ev.stopPropagation();
      if (!confirm(`Delete design "${d.subject}"?`)) return;
      await deleteDoc(d.id);
    });
    list.appendChild(row);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function getDocTitleValue() {
  return (docTitleInput.value || '').trim() || 'Untitled design';
}

function resetCurrentDoc() {
  state.currentDocId = null;
  state.currentTitle = '';
  state.items = [];
  state.selectedId = null;
  docTitleInput.value = '';
  render();
  renderInspector();
  renderStyleBar();
  renderDocList();
}

async function openDoc(id) {
  try {
    setStatus('Loading…');
    const rec = await getItem(TASK_TABLE, TASK_KEY, id, [TASK_KEY, 'subject', DATA_FIELD]);
    state.currentDocId = id;
    state.currentTitle = rec.subject || '';
    docTitleInput.value = state.currentTitle;
    let items = [];
    try {
      const raw = rec[DATA_FIELD];
      if (raw) { const j = JSON.parse(raw); if (Array.isArray(j.items)) items = j.items; }
    } catch (e) {}
    state.items = items;
    state.selectedId = null;
    render();
    renderInspector();
    renderStyleBar();
    renderDocList();
    markClean();
    setStatus('');
  } catch (e) {
    console.error(e);
    toast('Failed to open design', true);
    setStatus('');
  }
}

function newDoc() {
  resetCurrentDoc();
  setStatus('New design');
}

async function saveCurrent() {
  const payload = JSON.stringify({ v: 1, items: state.items });
  if (payload.length > DATA_LIMIT) {
    toast(`Save blocked: payload is ${payload.length} chars, max ${DATA_LIMIT}. Remove uploaded images or items.`, true);
    return;
  }
  try {
    setStatus('Saving…');
    const title = getDocTitleValue();
    if (!state.currentDocId) {
      const rec = await createItem(TASK_TABLE, TASK_KEY, {
        subject: title,
        category: CATEGORY_MARK,
        [DATA_FIELD]: payload
      });
      state.currentDocId = rec.activityid || rec[TASK_KEY] || (rec.data && rec.data.activityid) || null;
      state.currentTitle = title;
      docTitleInput.value = title;
      await loadDocs();
    } else {
      await updateItem(TASK_TABLE, TASK_KEY, state.currentDocId, {
        subject: title,
        category: CATEGORY_MARK,
        [DATA_FIELD]: payload
      });
      state.currentTitle = title;
      const d = state.docs.find((x) => x.id === state.currentDocId);
      if (d) d.subject = state.currentTitle;
    }
    renderDocList();
    markClean();
  } catch (e) {
    console.error(e);
    toast('Save failed: ' + (e.message || e), true);
    setStatus('');
  }
}

async function deleteDoc(id) {
  try {
    setStatus('Deleting…');
    await deleteItem(TASK_TABLE, TASK_KEY, id);
    if (state.currentDocId === id) {
      resetCurrentDoc();
    }
    await loadDocs();
    setStatus('');
  } catch (e) {
    console.error(e);
    toast('Delete failed', true);
    setStatus('');
  }
}

$('saveBtn').addEventListener('click', saveCurrent);
$('newBtn').addEventListener('click', newDoc);
$('deleteDocBtn').addEventListener('click', async () => {
  if (!state.currentDocId) return;
  if (!confirm('Delete this design?')) return;
  await deleteDoc(state.currentDocId);
});
docTitleInput.addEventListener('input', () => { markDirty(); });

// ── Boot ───────────────────────────────────────────────────────
async function boot() {
  await loadPaletteImages();
  await loadDocs();
}
boot();
