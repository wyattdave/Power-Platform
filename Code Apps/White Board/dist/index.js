import { createItem, deleteItem, initDataSources, listItems, updateItem } from './codeapp.js';

const TASKS_TABLE = 'tasks';
const TASKS_PRIMARY_KEY = 'activityid';
const BOARD_CATEGORY = 'White Board';
const THICKNESS_PRESETS = [2, 4, 8, 12];
const FONT_SIZE_PRESETS = [22, 30, 42, 58];
const EMOJI_PRESETS = ['😀', '🚀', '💡', '🔥', '✅', '🎯', '🧠', '📌'];

const state = {
  tool: 'pen',
  color: '#1a1a1a',
  strokeWidth: THICKNESS_PRESETS[1],
  fontSize: FONT_SIZE_PRESETS[1],
  zoom: 1,
  boards: [],
  elements: [],
  currentBoard: {
    id: null,
    title: 'Untitled Board'
  },
  draftElement: null,
  pointerDown: false,
  dirty: false,
  statusTimer: null,
  lastEmoji: EMOJI_PRESETS[0],
  composer: {
    active: false,
    mode: 'text',
    resolve: null
  }
};

const refs = {};

function dsEntry(primaryKey) {
  return {
    tableId: '',
    version: '',
    primaryKey,
    dataSourceType: 'Dataverse',
    apis: {}
  };
}

function cacheDom() {
  refs.canvas = document.getElementById('drawing-canvas');
  refs.context = refs.canvas.getContext('2d');
  refs.boardContainer = document.getElementById('board-container');
  refs.savedBoardsList = document.getElementById('saved-boards-list');
  refs.zoomLevel = document.getElementById('zoom-level');
  refs.thicknessBtn = document.getElementById('thickness-btn');
  refs.fontSizeBtn = document.getElementById('font-size-btn');
  refs.statusPill = document.getElementById('status-pill');
  refs.saveBtn = document.getElementById('save-btn');
  refs.clearBtn = document.getElementById('clear-btn');
  refs.newBoardBtn = document.getElementById('new-board-btn');
  refs.zoomInBtn = document.getElementById('zoom-in');
  refs.zoomOutBtn = document.getElementById('zoom-out');
  refs.toolButtons = Array.from(document.querySelectorAll('[data-tool]'));
  refs.colorDots = Array.from(document.querySelectorAll('.color-dot'));
  refs.composerOverlay = document.getElementById('composer-overlay');
  refs.composerPanel = document.getElementById('composer-panel');
  refs.composerTitle = document.getElementById('composer-title');
  refs.composerSubtitle = document.getElementById('composer-subtitle');
  refs.composerHint = document.getElementById('composer-hint');
  refs.composerInput = document.getElementById('composer-input');
  refs.composerSubmit = document.getElementById('composer-submit');
  refs.composerCancel = document.getElementById('composer-cancel');
  refs.composerClose = document.getElementById('composer-close');
  refs.emojiPalette = document.getElementById('emoji-palette');
  refs.emojiChips = Array.from(document.querySelectorAll('[data-emoji]'));
}

function roundPoint(value) {
  return Math.round(value * 10) / 10;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatDate(value) {
  if (!value) return 'Not saved yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

function getPresetLabel(presets, value) {
  const index = presets.indexOf(value);
  return ['S', 'M', 'L', 'XL'][index] || 'M';
}

function showStatus(message, isError = false) {
  refs.statusPill.textContent = message;
  refs.statusPill.style.color = isError ? '#b42318' : 'var(--draw-color)';
  refs.statusPill.classList.add('visible');

  if (state.statusTimer) {
    window.clearTimeout(state.statusTimer);
  }

  state.statusTimer = window.setTimeout(() => {
    refs.statusPill.classList.remove('visible');
  }, 2200);
}

function markDirty() {
  state.dirty = true;
}

function resetBoard(title = 'Untitled Board') {
  state.elements = [];
  state.draftElement = null;
  state.currentBoard = {
    id: null,
    title
  };
  state.zoom = 1;
  state.dirty = false;
  syncZoomUi();
  renderBoardsList();
  renderCanvas();
}

function syncZoomUi() {
  refs.zoomLevel.textContent = `${Math.round(state.zoom * 100)}%`;
  refs.boardContainer.style.transform = `scale(${state.zoom})`;
}

function syncToolbarUi() {
  refs.toolButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.tool === state.tool);
  });

  refs.colorDots.forEach((dot) => {
    dot.classList.toggle('active', dot.dataset.color === state.color);
  });

  refs.thicknessBtn.textContent = `Size: ${getPresetLabel(THICKNESS_PRESETS, state.strokeWidth)}`;
  refs.fontSizeBtn.textContent = `Font: ${getPresetLabel(FONT_SIZE_PRESETS, state.fontSize)}`;

  refs.canvas.style.cursor = state.tool === 'eraser' ? 'not-allowed' : state.tool === 'text' ? 'text' : 'crosshair';
}

function resizeCanvas() {
  const width = refs.boardContainer.clientWidth;
  const height = refs.boardContainer.clientHeight;
  const dpr = window.devicePixelRatio || 1;

  refs.canvas.width = Math.floor(width * dpr);
  refs.canvas.height = Math.floor(height * dpr);
  refs.canvas.style.width = `${width}px`;
  refs.canvas.style.height = `${height}px`;

  refs.context.setTransform(dpr, 0, 0, dpr, 0, 0);
  renderCanvas();
}

function getCanvasPoint(event) {
  const rect = refs.canvas.getBoundingClientRect();
  const scaleX = refs.canvas.clientWidth / rect.width;
  const scaleY = refs.canvas.clientHeight / rect.height;

  return {
    x: roundPoint((event.clientX - rect.left) * scaleX),
    y: roundPoint((event.clientY - rect.top) * scaleY)
  };
}

function normalizeShape(element) {
  if (!element) return element;

  const normalized = { ...element };
  if (normalized.bw < 0) {
    normalized.x += normalized.bw;
    normalized.bw = Math.abs(normalized.bw);
  }

  if (normalized.bh < 0) {
    normalized.y += normalized.bh;
    normalized.bh = Math.abs(normalized.bh);
  }

  return normalized;
}

function drawPath(element) {
  const points = element.p || [];
  if (!points.length) return;

  refs.context.save();
  refs.context.beginPath();
  refs.context.strokeStyle = element.c;
  refs.context.lineWidth = element.w;
  refs.context.lineCap = 'round';
  refs.context.lineJoin = 'round';
  refs.context.moveTo(points[0][0], points[0][1]);

  for (let index = 1; index < points.length; index += 1) {
    refs.context.lineTo(points[index][0], points[index][1]);
  }

  refs.context.stroke();
  refs.context.restore();
}

function drawRect(element) {
  refs.context.save();
  refs.context.strokeStyle = element.c;
  refs.context.lineWidth = element.w;
  refs.context.strokeRect(element.x, element.y, element.bw, element.bh);
  refs.context.restore();
}

function drawCircle(element) {
  refs.context.save();
  refs.context.strokeStyle = element.c;
  refs.context.lineWidth = element.w;
  refs.context.beginPath();
  refs.context.ellipse(
    element.x + element.bw / 2,
    element.y + element.bh / 2,
    Math.abs(element.bw / 2),
    Math.abs(element.bh / 2),
    0,
    0,
    Math.PI * 2
  );
  refs.context.stroke();
  refs.context.restore();
}

function getCanvasFont(element, isEmoji = false) {
  const size = Math.max(12, Number(element.s) || state.fontSize);
  if (isEmoji) {
    return `${size}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
  }

  return `${size}px "Comic Sans MS", "Marker Felt", cursive`;
}

function drawTextLike(element, isEmoji = false) {
  refs.context.save();
  refs.context.translate(element.x, element.y);
  refs.context.rotate(element.r || 0);
  refs.context.fillStyle = element.c;
  refs.context.textBaseline = 'top';
  refs.context.font = getCanvasFont(element, isEmoji);
  refs.context.fillText(element.v, 0, 0);
  refs.context.restore();

  if (!isEmoji) {
    refs.context.save();
    refs.context.strokeStyle = 'rgba(0,0,0,0.04)';
    refs.context.lineWidth = 1;
    refs.context.beginPath();
    refs.context.moveTo(element.x - 4, element.y + element.s + 2);
    refs.context.lineTo(element.x + refs.context.measureText(element.v).width + 4, element.y + element.s + 1);
    refs.context.stroke();
    refs.context.restore();
  }
}

function drawElement(element) {
  if (element.k === 'path') {
    drawPath(element);
    return;
  }

  if (element.k === 'rect') {
    drawRect(element);
    return;
  }

  if (element.k === 'circle') {
    drawCircle(element);
    return;
  }

  if (element.k === 'text') {
    drawTextLike(element, false);
    return;
  }

  if (element.k === 'emoji') {
    drawTextLike(element, true);
  }
}

function renderCanvas() {
  refs.context.clearRect(0, 0, refs.canvas.clientWidth, refs.canvas.clientHeight);
  state.elements.forEach(drawElement);
  if (state.draftElement) {
    drawElement(state.draftElement.k === 'rect' || state.draftElement.k === 'circle'
      ? normalizeShape(state.draftElement)
      : state.draftElement);
  }
}

function renderBoardsList() {
  if (!state.boards.length) {
    refs.savedBoardsList.innerHTML = '<li class="empty-state sketch-box">Saved boards will appear here after the first task save.</li>';
    return;
  }

  refs.savedBoardsList.innerHTML = state.boards.map((board) => {
    const activeClass = board.id === state.currentBoard.id ? ' active' : '';
    return `
      <li class="task-item sketch-box${activeClass}" data-board-id="${board.id}">
        <button class="delete-btn" type="button" data-delete-id="${board.id}" aria-label="Delete ${escapeHtml(board.title)}">✕</button>
        <strong class="task-title">${escapeHtml(board.title)}</strong>
        <small class="task-meta">${escapeHtml(formatDate(board.modifiedOn || board.createdOn))}</small>
      </li>
    `;
  }).join('');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function makeRotation(seed) {
  return (((seed % 7) - 3) * Math.PI) / 180;
}

function focusComposerField() {
  window.requestAnimationFrame(() => {
    refs.composerInput.focus();
    refs.composerInput.select();
  });
}

function resolveComposer(value) {
  const resolver = state.composer.resolve;
  state.composer.active = false;
  state.composer.resolve = null;
  refs.composerOverlay.classList.remove('visible');
  refs.composerOverlay.setAttribute('aria-hidden', 'true');
  refs.composerInput.value = '';
  if (resolver) {
    resolver(value);
  }
}

function submitComposer() {
  const value = refs.composerInput.value.trim();
  if (!value) {
    resolveComposer(null);
    return;
  }

  if (state.composer.mode === 'emoji') {
    state.lastEmoji = value;
  }

  resolveComposer(value);
}

function openComposer(mode, options = {}) {
  if (state.composer.active) {
    resolveComposer(null);
  }

  state.composer.active = true;
  state.composer.mode = mode;
  refs.composerPanel.dataset.mode = mode;
  refs.composerTitle.textContent = options.title || 'Add a note';
  refs.composerSubtitle.textContent = options.subtitle || '';
  refs.composerHint.textContent = options.hint || 'Press Enter to place it, or Escape to cancel.';
  refs.composerSubmit.textContent = options.submitLabel || 'Add to board';
  refs.composerInput.placeholder = options.placeholder || '';
  refs.composerInput.maxLength = String(options.maxLength || 200);
  refs.composerInput.rows = mode === 'text' ? 4 : 2;
  refs.composerInput.value = options.initialValue || '';
  refs.composerOverlay.classList.add('visible');
  refs.composerOverlay.setAttribute('aria-hidden', 'false');
  focusComposerField();

  return new Promise((resolve) => {
    state.composer.resolve = resolve;
  });
}

function createTextElement(point, value, kind) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  return {
    k: kind,
    c: state.color,
    s: state.fontSize,
    v: trimmed,
    x: point.x,
    y: point.y,
    r: makeRotation(trimmed.length + point.x + point.y)
  };
}

async function requestTextValue(kind) {
  if (kind === 'emoji') {
    return openComposer('emoji', {
      title: 'Add an emoji',
      subtitle: 'Pick one from the palette or paste any emoji you want to drop on the board.',
      hint: 'Tap a chip, press Enter to place it, or Escape to cancel.',
      submitLabel: 'Place emoji',
      initialValue: state.lastEmoji,
      placeholder: '😀',
      maxLength: 16
    });
  }

  return openComposer('text', {
    title: 'Add handwriting text',
    subtitle: 'Write a note and it will be placed on the board using the current color and font size.',
    hint: 'Press Enter to place it. Use Shift+Enter for a new line.',
    submitLabel: 'Place text',
    initialValue: 'Brainstorm here',
    placeholder: 'Write your note',
    maxLength: 200
  });
}

async function addTextualElement(point, kind) {
  const value = await requestTextValue(kind);
  if (!value) return;

  const element = createTextElement(point, value, kind);
  if (!element) return;

  state.elements.push(element);
  markDirty();
  renderCanvas();
}

function hitTestPath(element, point) {
  const threshold = Math.max(element.w + 6, 10);
  return (element.p || []).some(([x, y]) => Math.hypot(x - point.x, y - point.y) <= threshold);
}

function hitTestTextLike(element, point) {
  refs.context.save();
  refs.context.font = getCanvasFont(element, element.k === 'emoji');
  const width = refs.context.measureText(element.v).width;
  refs.context.restore();

  return point.x >= element.x - 6
    && point.x <= element.x + width + 6
    && point.y >= element.y - 6
    && point.y <= element.y + element.s + 6;
}

function hitTest(element, point) {
  if (element.k === 'path') return hitTestPath(element, point);
  if (element.k === 'rect' || element.k === 'circle') {
    return point.x >= element.x - 8
      && point.x <= element.x + element.bw + 8
      && point.y >= element.y - 8
      && point.y <= element.y + element.bh + 8;
  }
  if (element.k === 'text' || element.k === 'emoji') return hitTestTextLike(element, point);
  return false;
}

function eraseAt(point) {
  for (let index = state.elements.length - 1; index >= 0; index -= 1) {
    if (hitTest(state.elements[index], point)) {
      state.elements.splice(index, 1);
      markDirty();
      renderCanvas();
      return true;
    }
  }

  return false;
}

function onPointerDown(event) {
  const point = getCanvasPoint(event);
  refs.canvas.setPointerCapture(event.pointerId);

  if (state.tool === 'text' || state.tool === 'emoji') {
    addTextualElement(point, state.tool);
    return;
  }

  if (state.tool === 'eraser') {
    eraseAt(point);
    return;
  }

  state.pointerDown = true;

  if (state.tool === 'pen') {
    state.draftElement = {
      k: 'path',
      c: state.color,
      w: state.strokeWidth,
      p: [[point.x, point.y]]
    };
  }

  if (state.tool === 'rect' || state.tool === 'circle') {
    state.draftElement = {
      k: state.tool,
      c: state.color,
      w: state.strokeWidth,
      x: point.x,
      y: point.y,
      bw: 0,
      bh: 0
    };
  }

  renderCanvas();
}

function onPointerMove(event) {
  if (!state.pointerDown || !state.draftElement) return;

  const point = getCanvasPoint(event);

  if (state.draftElement.k === 'path') {
    const lastPoint = state.draftElement.p[state.draftElement.p.length - 1];
    if (Math.hypot(lastPoint[0] - point.x, lastPoint[1] - point.y) >= 1.5) {
      state.draftElement.p.push([point.x, point.y]);
    }
  }

  if (state.draftElement.k === 'rect' || state.draftElement.k === 'circle') {
    state.draftElement.bw = roundPoint(point.x - state.draftElement.x);
    state.draftElement.bh = roundPoint(point.y - state.draftElement.y);
  }

  renderCanvas();
}

function onPointerUp() {
  if (!state.pointerDown || !state.draftElement) {
    state.pointerDown = false;
    return;
  }

  let finalized = state.draftElement;
  if (finalized.k === 'rect' || finalized.k === 'circle') {
    finalized = normalizeShape(finalized);
    if (finalized.bw < 4 || finalized.bh < 4) {
      state.draftElement = null;
      state.pointerDown = false;
      renderCanvas();
      return;
    }
  }

  if (finalized.k === 'path' && finalized.p.length < 2) {
    state.draftElement = null;
    state.pointerDown = false;
    renderCanvas();
    return;
  }

  state.elements.push(finalized);
  state.draftElement = null;
  state.pointerDown = false;
  markDirty();
  renderCanvas();
}

function cyclePreset(currentValue, presets) {
  const currentIndex = presets.indexOf(currentValue);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % presets.length;
  return presets[nextIndex];
}

function setZoom(nextZoom) {
  state.zoom = clamp(roundPoint(nextZoom), 0.5, 2.5);
  syncZoomUi();
}

function serializeBoard() {
  return JSON.stringify({
    v: 1,
    z: state.zoom,
    e: state.elements,
    t: state.currentBoard.title
  });
}

function deserializeBoard(payload) {
  if (!payload) {
    return { elements: [], zoom: 1, title: 'Untitled Board' };
  }

  const parsed = JSON.parse(payload);
  return {
    elements: Array.isArray(parsed.e) ? parsed.e : [],
    zoom: typeof parsed.z === 'number' ? clamp(parsed.z, 0.5, 2.5) : 1,
    title: typeof parsed.t === 'string' && parsed.t.trim() ? parsed.t.trim() : 'Untitled Board'
  };
}

function buildBoardSummary() {
  const counts = state.elements.reduce((accumulator, element) => {
    accumulator[element.k] = (accumulator[element.k] || 0) + 1;
    return accumulator;
  }, {});

  const parts = [];
  if (counts.path) parts.push(`${counts.path} strokes`);
  if (counts.rect || counts.circle) parts.push(`${(counts.rect || 0) + (counts.circle || 0)} shapes`);
  if (counts.text) parts.push(`${counts.text} notes`);
  if (counts.emoji) parts.push(`${counts.emoji} emojis`);
  return parts.join(' • ') || 'Blank board';
}

function extractRecordId(result) {
  if (!result || typeof result !== 'object') return null;
  return result.activityid || result.id || result.ActivityId || result.recordId || null;
}

async function ensureBoardTitle() {
  if (state.currentBoard.title && state.currentBoard.title !== 'Untitled Board') {
    return state.currentBoard.title;
  }

  const proposed = `White Board ${new Date().toLocaleDateString()}`;
  const title = await openComposer('title', {
    title: 'Name this board',
    subtitle: 'This title is saved to the task subject field.',
    hint: 'Press Enter to save or Escape to cancel.',
    submitLabel: 'Use title',
    initialValue: proposed,
    placeholder: 'White Board title',
    maxLength: 200
  });
  if (!title || !title.trim()) {
    showStatus('Save cancelled', true);
    return null;
  }

  state.currentBoard.title = title.trim().slice(0, 200);
  return state.currentBoard.title;
}

async function loadBoards(preferredId = null) {
  const response = await listItems(TASKS_TABLE, TASKS_PRIMARY_KEY, {
    filter: `category eq '${BOARD_CATEGORY}'`,
    select: ['activityid', 'subject', 'activityadditionalparams', 'description', 'modifiedon', 'createdon'],
    orderBy: ['modifiedon desc'],
    top: 50
  });

  state.boards = (response.entities || []).map((entity) => ({
    id: entity.activityid,
    title: entity.subject || 'Untitled Board',
    payload: entity.activityadditionalparams || '',
    description: entity.description || '',
    modifiedOn: entity.modifiedon || '',
    createdOn: entity.createdon || ''
  }));

  if (!state.currentBoard.id && preferredId) {
    const matchingBoard = state.boards.find((board) => board.id === preferredId)
      || state.boards.find((board) => board.title === state.currentBoard.title);
    if (matchingBoard) {
      state.currentBoard.id = matchingBoard.id;
    }
  }

  renderBoardsList();
}

async function saveBoard() {
  try {
    const title = await ensureBoardTitle();
    if (!title) return;

    const payload = serializeBoard();
    if (payload.length > 7900) {
      throw new Error('This board is too large for the selected task field. Try simplifying the sketch before saving.');
    }

    const record = {
      subject: title,
      category: BOARD_CATEGORY,
      description: buildBoardSummary(),
      activityadditionalparams: payload
    };

    if (state.currentBoard.id) {
      await updateItem(TASKS_TABLE, TASKS_PRIMARY_KEY, state.currentBoard.id, record);
    } else {
      const created = await createItem(TASKS_TABLE, TASKS_PRIMARY_KEY, record);
      state.currentBoard.id = extractRecordId(created);
    }

    state.dirty = false;
    await loadBoards(state.currentBoard.id);
    showStatus('Board saved to task');
  } catch (error) {
    showStatus(error.message || 'Unable to save board', true);
  }
}

function loadBoardById(boardId) {
  const board = state.boards.find((item) => item.id === boardId);
  if (!board) return;

  try {
    const parsed = deserializeBoard(board.payload);
    state.currentBoard = {
      id: board.id,
      title: board.title
    };
    state.elements = parsed.elements;
    state.zoom = parsed.zoom;
    state.dirty = false;
    syncZoomUi();
    renderBoardsList();
    renderCanvas();
    showStatus(`Loaded ${board.title}`);
  } catch (error) {
    showStatus('The selected board could not be loaded', true);
  }
}

async function deleteBoardById(boardId) {
  const board = state.boards.find((item) => item.id === boardId);
  if (!board) return;

  const shouldDelete = window.confirm(`Delete ${board.title}?`);
  if (!shouldDelete) return;

  try {
    await deleteItem(TASKS_TABLE, TASKS_PRIMARY_KEY, boardId);
    if (state.currentBoard.id === boardId) {
      resetBoard();
    }
    await loadBoards();
    showStatus('Board deleted');
  } catch (error) {
    showStatus(error.message || 'Unable to delete board', true);
  }
}

function maybeConfirmDiscard() {
  if (!state.dirty || !state.elements.length) return true;
  return window.confirm('Discard unsaved whiteboard changes?');
}

function bindEvents() {
  refs.toolButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.tool = button.dataset.tool;
      syncToolbarUi();
    });
  });

  refs.colorDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      state.color = dot.dataset.color;
      syncToolbarUi();
    });
  });

  refs.thicknessBtn.addEventListener('click', () => {
    state.strokeWidth = cyclePreset(state.strokeWidth, THICKNESS_PRESETS);
    syncToolbarUi();
  });

  refs.fontSizeBtn.addEventListener('click', () => {
    state.fontSize = cyclePreset(state.fontSize, FONT_SIZE_PRESETS);
    syncToolbarUi();
  });

  refs.zoomInBtn.addEventListener('click', () => setZoom(state.zoom + 0.25));
  refs.zoomOutBtn.addEventListener('click', () => setZoom(state.zoom - 0.25));
  refs.saveBtn.addEventListener('click', saveBoard);

  refs.clearBtn.addEventListener('click', () => {
    if (!state.elements.length) return;
    const confirmed = window.confirm('Clear the current board?');
    if (!confirmed) return;
    state.elements = [];
    state.draftElement = null;
    markDirty();
    renderCanvas();
  });

  refs.newBoardBtn.addEventListener('click', () => {
    if (!maybeConfirmDiscard()) return;
    resetBoard();
    showStatus('New board ready');
  });

  refs.savedBoardsList.addEventListener('click', (event) => {
    const deleteTarget = event.target.closest('[data-delete-id]');
    if (deleteTarget) {
      event.stopPropagation();
      deleteBoardById(deleteTarget.dataset.deleteId);
      return;
    }

    const boardTarget = event.target.closest('[data-board-id]');
    if (!boardTarget) return;
    if (!maybeConfirmDiscard()) return;
    loadBoardById(boardTarget.dataset.boardId);
  });

  refs.canvas.addEventListener('pointerdown', onPointerDown);
  refs.canvas.addEventListener('pointermove', onPointerMove);
  refs.canvas.addEventListener('pointerup', onPointerUp);
  refs.canvas.addEventListener('pointercancel', onPointerUp);
  refs.canvas.addEventListener('pointerleave', onPointerUp);

  refs.composerSubmit.addEventListener('click', submitComposer);
  refs.composerCancel.addEventListener('click', () => resolveComposer(null));
  refs.composerClose.addEventListener('click', () => resolveComposer(null));
  refs.composerOverlay.addEventListener('click', (event) => {
    if (event.target === refs.composerOverlay) {
      resolveComposer(null);
    }
  });
  refs.composerInput.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      resolveComposer(null);
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitComposer();
    }
  });
  refs.emojiChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      refs.composerInput.value = chip.dataset.emoji;
      submitComposer();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (state.composer.active) {
      if (event.key === 'Escape') {
        event.preventDefault();
        resolveComposer(null);
      }
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      saveBoard();
    }
  });

  window.addEventListener('resize', resizeCanvas);
}

async function boot() {
  cacheDom();
  bindEvents();
  initDataSources({
    tasks: dsEntry(TASKS_PRIMARY_KEY)
  });
  syncToolbarUi();
  syncZoomUi();
  resizeCanvas();
  await loadBoards();
  renderBoardsList();
  renderCanvas();
}

boot().catch((error) => {
  console.error(error);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding:24px;font-family:'Comic Sans MS',cursive;">${escapeHtml(error.message || 'Unable to start the whiteboard app.')}</div>`;
  }
});