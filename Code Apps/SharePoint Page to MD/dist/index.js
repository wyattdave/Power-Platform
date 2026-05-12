import { enableDebugger } from './codeapp.js';
import {
  getItems,
  listTables,
  createFile,
  sendHttpRequest,
} from './connectors/sharepoint.js';

// ── Config ───────────────────────────────────────────────
const DEFAULT_SITE_URL = 'https://37wcqv.sharepoint.com/';
const MD_FOLDER_NAME = 'md'; // subfolder inside the doc library

// Resolved at runtime by initSite()
let activeSiteUrl = '';
let activeSiteOrigin = '';
let activeSiteRelative = '';
let activeMdFolderRelative = '';
let activeMdFolderServerRelative = '';

// Strategy that worked for reading pages / files
let fnLoadPages = null;   // async () => array of page objects
let fnLoadMdFiles = null; // async () => array of file objects
let fnGetPageContent = null; // async (pageId) => html string

// Table tokens discovered
let sPagesTableToken = '';
let sDocsTableToken = '';

// ── State ────────────────────────────────────────────────
let bRunning = false;
let bStopRequested = false;
let aExistingFiles = [];

// ── DOM refs ─────────────────────────────────────────────
const elSiteUrlInput = document.getElementById('siteUrlInput');
const elBtnConnect = document.getElementById('btnConnect');
const elSiteStatus = document.getElementById('siteStatus');
const elCurrentSite = document.getElementById('currentSite');
const elBtnStart = document.getElementById('btnStart');
const elBtnStop = document.getElementById('btnStop');
const elBtnRefresh = document.getElementById('btnRefresh');
const elExcludeFilter = document.getElementById('excludeFilter');
const elProgressSection = document.getElementById('progressSection');
const elProgressTitle = document.getElementById('progressTitle');
const elProgressStats = document.getElementById('progressStats');
const elProgressFill = document.getElementById('progressFill');
const elProgressLog = document.getElementById('progressLog');
const elFileListContainer = document.getElementById('fileListContainer');
const elFileCount = document.getElementById('fileCount');
const elToast = document.getElementById('toast');

// ── Toast helper ─────────────────────────────────────────
function showToast(sMessage, sType) {
  elToast.textContent = sMessage;
  elToast.className = 'toast visible' + (sType ? ' ' + sType : '');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    elToast.className = 'toast';
  }, 4000);
}

function setSiteStatus(sMessage, sType) {
  elSiteStatus.textContent = sMessage;
  elSiteStatus.className = 'site-status' + (sType ? ' ' + sType : '');
}

function setCurrentSiteLabel(sSiteUrl) {
  elCurrentSite.textContent = sSiteUrl || 'Not connected';
}

function resetSiteState() {
  activeSiteUrl = '';
  activeSiteOrigin = '';
  activeSiteRelative = '';
  activeMdFolderRelative = '';
  activeMdFolderServerRelative = '';
  fnLoadPages = null;
  fnLoadMdFiles = null;
  fnGetPageContent = null;
  sPagesTableToken = '';
  sDocsTableToken = '';
}

function normalizeSiteUrl(sInput) {
  const sValue = (sInput || '').trim();

  if (!sValue) {
    throw new Error('Enter a SharePoint site URL before continuing.');
  }

  const oUrl = new URL(sValue);
  return oUrl.origin + (oUrl.pathname === '/' ? '' : oUrl.pathname.replace(/\/$/, ''));
}

function renderFileListPlaceholder(sTitle, sBody) {
  elFileListContainer.innerHTML =
    '<div class="empty-state">' +
    '<div>' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
    '<p><strong>' + escapeHtml(sTitle) + '</strong></p>' +
    '<p>' + escapeHtml(sBody) + '</p>' +
    '</div>' +
    '</div>';
}

function handleSiteUrlInput() {
  const sValue = elSiteUrlInput.value.trim();

  if (!sValue) {
    setSiteStatus('Enter a SharePoint site URL to get started.');
    setCurrentSiteLabel('');
    return;
  }

  try {
    const sNormalized = normalizeSiteUrl(sValue);
    setCurrentSiteLabel(sNormalized);
    if (sNormalized === activeSiteUrl) {
      setSiteStatus('Connected and ready to convert.', 'success');
    } else {
      setSiteStatus('Ready to connect to this SharePoint site.');
    }
  } catch (_e) {
    setCurrentSiteLabel('');
    setSiteStatus('Enter a valid absolute SharePoint site URL.', 'error');
  }
}

// ── Progress helpers ─────────────────────────────────────
function showProgress() {
  elProgressSection.classList.add('active');
}

function hideProgress() {
  elProgressSection.classList.remove('active');
}

function updateProgress(iDone, iTotal, sCurrentPage) {
  const iPct = iTotal > 0 ? Math.round((iDone / iTotal) * 100) : 0;
  elProgressStats.textContent = iDone + ' / ' + iTotal;
  elProgressFill.style.width = iPct + '%';
  if (iDone === iTotal && iTotal > 0) {
    elProgressFill.classList.add('complete');
    elProgressTitle.textContent = 'Conversion complete';
  } else {
    elProgressFill.classList.remove('complete');
    elProgressTitle.textContent = 'Converting: ' + (sCurrentPage || '…');
  }
}

function addLogEntry(sText, bIsError) {
  const el = document.createElement('div');
  el.className = 'log-entry' + (bIsError ? ' error' : '');
  el.textContent = sText;
  elProgressLog.prepend(el);
}

// ── File list rendering ──────────────────────────────────
function renderFileList(aFiles, aNewNames) {
  aExistingFiles = aFiles;
  const aNewSet = new Set(aNewNames || []);
  elFileCount.textContent = String(aFiles.length);

  if (aFiles.length === 0) {
    elFileListContainer.innerHTML =
      '<div class="empty-state">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
      '<p>No Markdown files yet. Click <strong>Start Conversion</strong> to begin.</p>' +
      '</div>';
    return;
  }

  let sHtml =
    '<table class="file-table"><thead><tr>' +
    '<th>Name</th><th>Modified</th><th>Size</th><th></th>' +
    '</tr></thead><tbody>';

  for (const oFile of aFiles) {
    const bNew = aNewSet.has(oFile.Name);
    const sSize = formatFileSize(oFile.Length || 0);
    const sDate = oFile.TimeLastModified ? formatDate(oFile.TimeLastModified) : '—';
    sHtml +=
      '<tr class="' + (bNew ? 'new-row' : '') + '">' +
      '<td><div class="file-name">' +
      '<svg class="file-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6l-4-4z"/><polyline points="12 2 12 6 16 6"/></svg>' +
      escapeHtml(oFile.Name) +
      '</div></td>' +
      '<td class="file-date">' + escapeHtml(sDate) + '</td>' +
      '<td class="file-size">' + escapeHtml(sSize) + '</td>' +
      '<td>' + (bNew ? '<span class="status-badge new">New</span>' : '') + '</td>' +
      '</tr>';
  }

  sHtml += '</tbody></table>';
  elFileListContainer.innerHTML = sHtml;
}

function formatFileSize(iBytes) {
  if (iBytes < 1024) return iBytes + ' B';
  if (iBytes < 1048576) return (iBytes / 1024).toFixed(1) + ' KB';
  return (iBytes / 1048576).toFixed(1) + ' MB';
}

function formatDate(sIso) {
  try {
    const d = new Date(sIso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch (_e) {
    return sIso;
  }
}

function escapeHtml(s) {
  const el = document.createElement('span');
  el.textContent = s;
  return el.innerHTML;
}

// ── SharePoint helpers ───────────────────────────────────
function normalizeCollection(oPayload) {
  if (Array.isArray(oPayload)) return oPayload;
  const aCandidates = [
    oPayload && oPayload.value,
    oPayload && oPayload.items,
    oPayload && oPayload.results,
    oPayload && oPayload.body,
    oPayload && oPayload.data,
    oPayload && oPayload.d && oPayload.d.results,
  ];
  return aCandidates.find(Array.isArray) || [];
}

// ── Multi-strategy site discovery ────────────────────────
async function initSite(sSiteUrl) {
  const sNormalizedSiteUrl = normalizeSiteUrl(sSiteUrl);

  await listTables(sNormalizedSiteUrl);

  const oUrlObj = new URL(sNormalizedSiteUrl);
  activeSiteUrl = sNormalizedSiteUrl;
  activeSiteOrigin = oUrlObj.origin;
  activeSiteRelative = oUrlObj.pathname === '/' ? '' : oUrlObj.pathname.replace(/\/$/, '');
  activeMdFolderRelative = 'Shared Documents/' + MD_FOLDER_NAME;
  activeMdFolderServerRelative =
    (activeSiteRelative ? activeSiteRelative : '') + '/Shared Documents/' + MD_FOLDER_NAME;
  console.log('[SP2MD] Connected site:', activeSiteUrl);

  // Step 2: Discover how to read Site Pages (try multiple strategies)
  await discoverPageAccess();

  // Step 3: Discover how to list files in the md folder
  await discoverFileAccess();
}

// ── Strategy: discover page access ───────────────────────
async function discoverPageAccess() {
  const aErrors = [];

  // Strategy A: Try getItems with various table identifiers for Site Pages
  // The connector may accept GUID-less identifiers for well-known libraries
  const aTableIds = [
    'SitePages',
    'Site Pages',
    '{SitePages}',
  ];
  for (const sTableId of aTableIds) {
    try {
      console.log('[SP2MD] Trying getItems with table:', sTableId);
      const oResult = await getItems(activeSiteUrl, sTableId, { top: 1 });
      const aTest = normalizeCollection(oResult);
      console.log('[SP2MD] SUCCESS with getItems table:', sTableId, '| rows:', aTest.length);
      sPagesTableToken = sTableId;
      fnLoadPages = async function () {
        const r = await getItems(activeSiteUrl, sPagesTableToken, { top: 5000 });
        return normalizeCollection(r);
      };
      fnGetPageContent = async function (iPageId) {
        // Connector GetItem/GetItems don't return CanvasContent1.
        // Use the SharePoint REST API via sendHttpRequest instead.
        var sRestUri = "_api/web/lists/getByTitle('Site Pages')/items(" + iPageId + ")?$select=CanvasContent1";
        var oResult = await sendHttpRequest(activeSiteUrl, {
          method: 'GET',
          uri: sRestUri,
          headers: { 'Accept': 'application/json;odata=nometadata' },
        });
        var oData = (oResult && oResult.d) || oResult || {};
        var sContent = oData.CanvasContent1 || oData.OData__CanvasContent1 || '';
        if (!sContent) {
          console.warn('[SP2MD] No CanvasContent1 for page', iPageId, 'Keys:', Object.keys(oData).join(', '));
        }
        return sContent;
      };
      return;
    } catch (e) {
      aErrors.push('getItems(' + sTableId + '): ' + (e.message || e));
      console.warn('[SP2MD] getItems failed for table', sTableId, e.message || e);
    }
  }

  // All strategies failed — show diagnostics
  throw new Error(
    'Could not access Site Pages library.\n\nStrategies tried:\n' +
    aErrors.map(function (s, i) { return (i + 1) + '. ' + s; }).join('\n')
  );
}

// ── Strategy: discover file (md folder) access ───────────
async function discoverFileAccess() {
  // The SharePoint connector hides document libraries from listTables and
  // getItems by display name. Try GUIDs and known identifiers quickly.
  const aDocTableIds = [
    'ecf7e0c2-b862-469a-9eee-8a4aba5395ba',
    '{ecf7e0c2-b862-469a-9eee-8a4aba5395ba}',
    'Shared Documents',
    'Documents',
  ];

  for (const sTableId of aDocTableIds) {
    try {
      console.log('[SP2MD] Trying doc library:', sTableId);
      const oResult = await getItems(activeSiteUrl, sTableId, { top: 1 });
      normalizeCollection(oResult);
      sDocsTableToken = sTableId;
      console.log('[SP2MD] SUCCESS doc library:', sTableId);
      fnLoadMdFiles = buildFileLoader(sTableId);
      return;
    } catch (e) {
      console.warn('[SP2MD] doc library failed:', sTableId, e.message || e);
    }
  }

  // All table strategies failed — use local-only tracking.
  // createFile still works (folder-path based, not table based).
  console.warn('[SP2MD] Cannot list doc library files. Using local tracking.');
  addLogEntry('Note: Cannot list existing files (connector limitation). New files will appear as created.');
  fnLoadMdFiles = async function () { return []; };
}

function buildFileLoader(sTableToken) {
  return async function () {
    const r = await getItems(activeSiteUrl, sTableToken, {
      filter: "startswith(FileRef,'" + activeMdFolderServerRelative + "/')",
      top: 5000,
    });
    return normalizeCollection(r)
      .filter(function (o) {
        const sName = o['{FilenameWithExtension}'] || o.FileLeafRef || '';
        return sName.toLowerCase().endsWith('.md');
      })
      .map(function (o) {
        return {
          Name: o['{FilenameWithExtension}'] || o.FileLeafRef || '',
          TimeLastModified: o.Modified || '',
          Length: o.File_x0020_Size || o.FileSizeDisplay || 0,
        };
      });
  };
}

// Wrappers used by the rest of the app
async function loadMdFiles() {
  if (!fnLoadMdFiles) return [];
  try { return await fnLoadMdFiles(); } catch (e) {
    console.warn('[SP2MD] loadMdFiles error:', e);
    return [];
  }
}

async function loadSitePages() {
  if (!fnLoadPages) throw new Error('Site Pages access not discovered. Run initSite() first.');
  return await fnLoadPages();
}

// ── HTML-to-Markdown converter ───────────────────────────
function htmlToMarkdown(sHtml) {
  if (!sHtml) return '';

  // Pre-process: clean up SharePoint canvas JSON wrapper if present
  let sContent = sHtml;

  // If the content is JSON (SharePoint canvas format), extract HTML from it
  if (sContent.trim().startsWith('[')) {
    try {
      const aCanvas = JSON.parse(sContent);
      sContent = aCanvas
        .map(function (oSection) {
          // Each section may have innerHTML or webPartData
          if (oSection.innerHTML) return oSection.innerHTML;
          if (oSection.webPartData) {
            return extractWebPartContent(oSection.webPartData);
          }
          return '';
        })
        .join('\n');
    } catch (_e) {
      // Not valid JSON; treat as raw HTML
    }
  }

  // Create a temporary DOM to parse HTML
  const oParser = new DOMParser();
  const oDoc = oParser.parseFromString('<div>' + sContent + '</div>', 'text/html');
  const elRoot = oDoc.body.firstChild;

  return convertNode(elRoot).trim() + '\n';
}

function extractWebPartContent(oData) {
  if (!oData) return '';
  // Try to get title and description from web part
  let sParts = '';
  if (oData.title) sParts += '<h3>' + oData.title + '</h3>';
  if (oData.description) sParts += '<p>' + oData.description + '</p>';
  if (oData.properties) {
    // Image web part
    if (oData.properties.imageSourceType !== undefined && oData.properties.imgSrc) {
      sParts += '<img src="' + oData.properties.imgSrc + '" alt="' + (oData.properties.altText || oData.title || '') + '">';
    }
    // Text/content
    if (oData.properties.content) sParts += oData.properties.content;
    if (oData.properties.html) sParts += oData.properties.html;
  }
  // ServerProcessedContent may contain links and images
  if (oData.serverProcessedContent) {
    const oSpc = oData.serverProcessedContent;
    if (oSpc.htmlStrings) {
      Object.values(oSpc.htmlStrings).forEach(function (sVal) {
        sParts += sVal;
      });
    }
    if (oSpc.imageSources) {
      Object.entries(oSpc.imageSources).forEach(function ([sKey, sUrl]) {
        sParts += '<img src="' + sUrl + '" alt="' + sKey + '">';
      });
    }
    if (oSpc.links) {
      Object.entries(oSpc.links).forEach(function ([sKey, sUrl]) {
        sParts += '<a href="' + sUrl + '">' + sKey + '</a> ';
      });
    }
  }
  return sParts;
}

function convertNode(oNode) {
  if (!oNode) return '';

  // Text node
  if (oNode.nodeType === 3) {
    return oNode.textContent || '';
  }

  // Element node
  if (oNode.nodeType !== 1) return '';

  const sTag = oNode.tagName.toLowerCase();
  const aChildren = Array.from(oNode.childNodes);
  const sChildContent = aChildren.map(convertNode).join('');

  switch (sTag) {
    // Headings
    case 'h1': return '\n# ' + sChildContent.trim() + '\n\n';
    case 'h2': return '\n## ' + sChildContent.trim() + '\n\n';
    case 'h3': return '\n### ' + sChildContent.trim() + '\n\n';
    case 'h4': return '\n#### ' + sChildContent.trim() + '\n\n';
    case 'h5': return '\n##### ' + sChildContent.trim() + '\n\n';
    case 'h6': return '\n###### ' + sChildContent.trim() + '\n\n';

    // Paragraphs and divs
    case 'p': return '\n' + sChildContent.trim() + '\n\n';
    case 'div': return sChildContent + '\n';

    // Line break
    case 'br': return '\n';

    // Bold
    case 'b':
    case 'strong': return '***' + sChildContent.trim() + '***';

    // Italic
    case 'i':
    case 'em': return '*' + sChildContent + '*';

    // Underline (no native MD – use HTML)
    case 'u': return '<u>' + sChildContent + '</u>';

    // Strikethrough
    case 's':
    case 'del':
    case 'strike': return '~~' + sChildContent + '~~';

    // Superscript / subscript
    case 'sup': return '<sup>' + sChildContent + '</sup>';
    case 'sub': return '<sub>' + sChildContent + '</sub>';

    // Code
    case 'code': return '`' + sChildContent + '`';
    case 'pre': return '\n```\n' + (oNode.textContent || '') + '\n```\n\n';

    // Links
    case 'a': {
      const sHref = oNode.getAttribute('href') || '';
      const sText = sChildContent.trim() || sHref;
      if (!sHref) return sText;
      return '[' + sText + '](' + resolveSharePointUrl(sHref) + ')';
    }

    // Images
    case 'img': {
      const sSrc = oNode.getAttribute('src') || '';
      const sAlt = oNode.getAttribute('alt') || oNode.getAttribute('title') || '';
      if (!sSrc) return '';
      return '![' + sAlt + '](' + resolveSharePointUrl(sSrc) + ')';
    }

    // Lists
    case 'ul': return '\n' + convertListItems(oNode, false) + '\n';
    case 'ol': return '\n' + convertListItems(oNode, true) + '\n';
    case 'li': return sChildContent;

    // Table
    case 'table': return '\n' + convertTable(oNode) + '\n';
    case 'thead':
    case 'tbody':
    case 'tfoot':
    case 'tr':
    case 'th':
    case 'td':
      return sChildContent;

    // Blockquote
    case 'blockquote': {
      const sLines = sChildContent.trim().split('\n').map(function (sLine) {
        return '> ' + sLine;
      }).join('\n');
      return '\n' + sLines + '\n\n';
    }

    // Horizontal rule
    case 'hr': return '\n---\n\n';

    // Figure (may contain images with captions)
    case 'figure': return sChildContent;
    case 'figcaption': return '\n*' + sChildContent.trim() + '*\n';

    // Span and other inline elements
    case 'span':
    case 'font':
      return sChildContent;

    // IFrame (embedded content)
    case 'iframe': {
      const sIframeSrc = oNode.getAttribute('src') || '';
      if (sIframeSrc) return '\n[Embedded content](' + sIframeSrc + ')\n\n';
      return '';
    }

    // Video
    case 'video': {
      const sVideoSrc = oNode.getAttribute('src') || (oNode.querySelector('source') && oNode.querySelector('source').getAttribute('src')) || '';
      if (sVideoSrc) return '\n[Video](' + resolveSharePointUrl(sVideoSrc) + ')\n\n';
      return sChildContent;
    }

    default:
      return sChildContent;
  }
}

function convertListItems(oListEl, bOrdered) {
  const aItems = Array.from(oListEl.children).filter(function (el) {
    return el.tagName.toLowerCase() === 'li';
  });
  return aItems.map(function (oLi, iIdx) {
    const sPrefix = bOrdered ? (iIdx + 1) + '. ' : '- ';
    const sContent = convertLiContent(oLi);
    return sPrefix + sContent.trim();
  }).join('\n');
}

function convertLiContent(oLi) {
  let sResult = '';
  for (const oChild of oLi.childNodes) {
    if (oChild.nodeType === 1 && (oChild.tagName === 'UL' || oChild.tagName === 'OL')) {
      // Nested list – indent
      const bOrd = oChild.tagName === 'OL';
      const sNested = convertListItems(oChild, bOrd);
      sResult += '\n' + sNested.split('\n').map(function (sLine) { return '  ' + sLine; }).join('\n');
    } else {
      sResult += convertNode(oChild);
    }
  }
  return sResult;
}

function convertTable(oTableEl) {
  const aRows = Array.from(oTableEl.querySelectorAll('tr'));
  if (aRows.length === 0) return '';

  const aMatrix = [];
  for (const oRow of aRows) {
    const aCells = Array.from(oRow.querySelectorAll('th, td'));
    aMatrix.push(aCells.map(function (oCell) {
      return convertNode(oCell).replace(/\|/g, '\\|').replace(/\n/g, ' ').trim();
    }));
  }

  // Determine max columns
  const iMaxCols = Math.max(...aMatrix.map(function (r) { return r.length; }));

  // Normalize rows
  const aNormalized = aMatrix.map(function (r) {
    while (r.length < iMaxCols) r.push('');
    return r;
  });

  // Build MD table
  let sTable = '| ' + aNormalized[0].join(' | ') + ' |\n';
  sTable += '| ' + aNormalized[0].map(function () { return '---'; }).join(' | ') + ' |\n';
  for (let i = 1; i < aNormalized.length; i++) {
    sTable += '| ' + aNormalized[i].join(' | ') + ' |\n';
  }
  return sTable;
}

function resolveSharePointUrl(sUrl) {
  if (!sUrl) return '';
  try {
    return new URL(sUrl, activeSiteUrl || activeSiteOrigin || DEFAULT_SITE_URL).toString();
  } catch (_e) {
    if (sUrl.startsWith('/')) {
      return activeSiteOrigin + sUrl;
    }
    return sUrl;
  }
}

// ── File naming helper ───────────────────────────────────
function sanitizeFileName(sTitle) {
  // Remove invalid file chars, keep it readable
  return sTitle
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200);
}

function getTimestamp() {
  const d = new Date();
  return d.getFullYear() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0') + '-' +
    String(d.getHours()).padStart(2, '0') +
    String(d.getMinutes()).padStart(2, '0') +
    String(d.getSeconds()).padStart(2, '0');
}

// power-apps-data.js always calls JSON.stringify on the body parameter,
// which escapes newlines. Intercept that single call so raw text passes through.
async function createFileRaw(siteUrl, folderPath, fileName, content) {
  var origStringify = JSON.stringify;
  var intercepted = false;
  JSON.stringify = function (val) {
    if (!intercepted && val === content) {
      intercepted = true;
      return val;
    }
    return origStringify.apply(this, arguments);
  };
  try {
    return await createFile(siteUrl, folderPath, fileName, content);
  } finally {
    JSON.stringify = origStringify;
  }
}

function resolveFileName(sTitle, aExisting) {
  const sBase = sanitizeFileName(sTitle);
  const sFileName = sBase + '.md';
  const aNames = aExisting.map(function (f) { return f.Name.toLowerCase(); });
  if (aNames.indexOf(sFileName.toLowerCase()) === -1) {
    return sFileName;
  }
  // File exists – append timestamp
  return sBase + '-' + getTimestamp() + '.md';
}

async function loadAndRenderFileList() {
  elFileListContainer.innerHTML =
    '<div class="loading-state"><div><div class="spinner"></div><p>Loading files…</p></div></div>';
  const aFiles = await loadMdFiles();
  renderFileList(aFiles);
}

async function connectSite(bRefreshFileList) {
  const sRequestedSiteUrl = normalizeSiteUrl(elSiteUrlInput.value);
  const bNeedsInit =
    sRequestedSiteUrl !== activeSiteUrl ||
    !fnLoadPages ||
    !fnLoadMdFiles;

  setCurrentSiteLabel(sRequestedSiteUrl);

  if (!bNeedsInit) {
    setSiteStatus('Connected and ready to convert.', 'success');
    if (bRefreshFileList) {
      await loadAndRenderFileList();
    }
    return;
  }

  resetSiteState();
  setSiteStatus('Connecting to SharePoint…', 'loading');
  elBtnConnect.disabled = true;

  try {
    await initSite(sRequestedSiteUrl);
    setCurrentSiteLabel(activeSiteUrl);
    setSiteStatus('Connected and ready to convert.', 'success');
    if (bRefreshFileList) {
      await loadAndRenderFileList();
    }
  } catch (oError) {
    resetSiteState();
    renderFileListPlaceholder('Connection failed', String(oError.message || oError));
    setSiteStatus(String(oError.message || oError), 'error');
    throw oError;
  } finally {
    elBtnConnect.disabled = false;
  }
}

// ── Core: conversion loop ────────────────────────────────
async function startConversion() {
  if (bRunning) return;
  bRunning = true;
  bStopRequested = false;

  elBtnStart.disabled = true;
  elBtnStop.disabled = false;
  elProgressLog.innerHTML = '';
  showProgress();
  updateProgress(0, 0, 'Loading pages…');

  try {
    addLogEntry('Connecting to SharePoint…');
    await connectSite(false);

    // 1. Load site pages
    addLogEntry('Fetching site pages…');
    const aPages = await loadSitePages();
    addLogEntry('Found ' + aPages.length + ' site pages');

    // 2. Apply exclude filter
    const sExclude = elExcludeFilter.value.trim();
    let aFiltered = aPages;
    if (sExclude) {
      const sLower = sExclude.toLowerCase();
      aFiltered = aPages.filter(function (oPage) {
        const sTitle = (oPage.Title || oPage['{Name}'] || oPage['{FilenameWithExtension}'] || '').toLowerCase();
        return sTitle.indexOf(sLower) === -1;
      });
      addLogEntry('After filter: ' + aFiltered.length + ' pages (excluded "' + sExclude + '")');
    }

    if (aFiltered.length === 0) {
      addLogEntry('No pages to convert.');
      updateProgress(0, 0, 'No pages');
      showToast('No pages found to convert', 'error');
      bRunning = false;
      elBtnStart.disabled = false;
      elBtnStop.disabled = true;
      return;
    }

    // 3. Load existing MD files
    let aCurrentFiles = await loadMdFiles();
    renderFileList(aCurrentFiles);

    const iTotal = aFiltered.length;
    let iDone = 0;
    const aNewFileNames = [];

    // 4. Loop through pages and convert
    for (const oPage of aFiltered) {
      if (bStopRequested) {
        addLogEntry('Stopped by user.');
        break;
      }

      const sTitle = oPage.Title || oPage['{Name}'] || oPage['{FilenameWithExtension}'] || 'Untitled-' + (oPage.ID || oPage.Id);
      updateProgress(iDone, iTotal, sTitle);

      try {
        // CanvasContent1 is not returned by GetItems – fetch individual item
        let sHtmlContent = oPage.CanvasContent1 || '';
        const iPageId = oPage.ID || oPage.Id || oPage.ItemInternalId;

        if (!sHtmlContent && iPageId && fnGetPageContent) {
          try {
            sHtmlContent = await fnGetPageContent(iPageId);
          } catch (_e) {
            console.warn('[SP2MD] getPageContent failed for', iPageId, _e.message || _e);
          }
        }

        // Build Markdown
        let sMd = '# ' + sTitle + '\n\n';

        if (oPage.Description) {
          sMd += '> ' + oPage.Description + '\n\n';
        }

        // Metadata
        sMd += '---\n';
        const sPageLink = oPage['{Link}'] || oPage.FileRef || '';
        sMd += '- **Source:** [' + sTitle + '](' + resolveSharePointUrl(sPageLink) + ')\n';
        if (oPage.Modified) {
          sMd += '- **Last Modified:** ' + formatDate(oPage.Modified) + '\n';
        }
        if (oPage.BannerImageUrl) {
          const sBannerUrl = typeof oPage.BannerImageUrl === 'object' ? oPage.BannerImageUrl.Url || '' : oPage.BannerImageUrl;
          if (sBannerUrl) {
            sMd += '\n![Banner](' + resolveSharePointUrl(sBannerUrl) + ')\n';
          }
        }
        sMd += '---\n\n';

        // Convert HTML content to Markdown
        if (sHtmlContent) {
          sMd += htmlToMarkdown(sHtmlContent);
        } else {
          sMd += '*No page content available.*\n';
        }

        // Determine file name
        const sFileName = resolveFileName(sTitle, aCurrentFiles);

        // Save to SharePoint — bypass SDK's JSON.stringify on body
        addLogEntry('Saving: ' + sFileName);
        await createFileRaw(activeSiteUrl, activeMdFolderRelative, sFileName, sMd);
        aNewFileNames.push(sFileName);

        // Add to our tracking array
        aCurrentFiles.push({
          Name: sFileName,
          TimeLastModified: new Date().toISOString(),
          Length: new Blob([sMd]).size,
        });

        // Update file list in real-time
        renderFileList(aCurrentFiles, aNewFileNames);

        iDone++;
        updateProgress(iDone, iTotal, sTitle);
        addLogEntry('✓ ' + sFileName);

      } catch (oPageError) {
        iDone++;
        addLogEntry('✗ Error: ' + sTitle + ' – ' + String(oPageError.message || oPageError), true);
        updateProgress(iDone, iTotal, sTitle);
      }
    }

    // Final update
    updateProgress(iDone, iTotal, '');
    if (bStopRequested) {
      showToast('Conversion stopped. ' + iDone + ' of ' + iTotal + ' pages processed.', 'error');
    } else {
      showToast('Conversion complete! ' + iDone + ' pages converted.', 'success');
    }

    // Refresh file list from server
    const aFinalFiles = await loadMdFiles();
    renderFileList(aFinalFiles, aNewFileNames);

  } catch (oError) {
    addLogEntry('Fatal error: ' + String(oError.message || oError), true);
    showToast('Error: ' + String(oError.message || oError), 'error');
  }

  bRunning = false;
  elBtnStart.disabled = false;
  elBtnStop.disabled = true;
}

function stopConversion() {
  bStopRequested = true;
  elBtnStop.disabled = true;
  addLogEntry('Stop requested – finishing current page…');
}

// ── Refresh file list ────────────────────────────────────
async function refreshFileList() {
  try {
    await connectSite(true);
  } catch (oError) {
    showToast('Failed to load files', 'error');
  }
}

// ── Boot ─────────────────────────────────────────────────
async function boot() {
  enableDebugger();

  elSiteUrlInput.value = DEFAULT_SITE_URL;
  handleSiteUrlInput();

  // Wire up buttons
  elBtnConnect.addEventListener('click', async function () {
    try {
      await connectSite(true);
      showToast('SharePoint site connected.', 'success');
    } catch (oError) {
      showToast(String(oError.message || oError), 'error');
    }
  });
  elBtnStart.addEventListener('click', startConversion);
  elBtnStop.addEventListener('click', stopConversion);
  elBtnRefresh.addEventListener('click', refreshFileList);
  elSiteUrlInput.addEventListener('input', handleSiteUrlInput);
  elSiteUrlInput.addEventListener('keydown', function (oEvent) {
    if (oEvent.key === 'Enter') {
      oEvent.preventDefault();
      elBtnConnect.click();
    }
  });

  renderFileListPlaceholder(
    'Connect to load files',
    'Enter the SharePoint site URL above, then connect to load the current Markdown files.'
  );
}

boot();
