// last update v1.1.1
import { getClient, getContext, callActionAsync } from "./power-apps-data.js";

// ── Initialize SDK & Client ────────────────────────────────────
let oSharedClient = null;
let oInitialDataSources = {};

// ── Set initial data sources (call before any API calls) ───────
export function initDataSources(oSources) {
  return _dbgWrap('initDataSources', [oSources], function() {
    oInitialDataSources = oSources || {};
    oSharedClient = null;
  });
}

function getSharedClient() {
  if (!oSharedClient) {
    oSharedClient = getClient(Object.assign({}, oInitialDataSources, oDataSources));
  }
  return oSharedClient;
}

// ── Unwrap SDK response ────────────────────────────────────────
export function unwrapResult(result) {
  if (result && result.success === false) {
    let sMsg = result.error ? (result.error.message || JSON.stringify(result.error)) : 'Operation failed';
    throw new Error(sMsg);
  }
  return result && 'data' in result ? result.data : result;
}

function stringifyConnectorError(oError) {
  if (!oError) return 'Unknown error';
  if (typeof oError === 'string') return oError;
  if (typeof oError.message === 'string' && oError.message) return oError.message;

  try {
    return JSON.stringify(oError);
  } catch (oErr) {
    return String(oError);
  }
}

// ── Debugger ───────────────────────────────────────────────────
let _bDebugActive = false;
let _aDebugEntries = [];
let _eDebugPanel = null;
let _eDebugIcon = null;
let _eDebugList = null;
let _iDebugCounter = 0;

export function _dbgWrap(sName, aArgs, fnBody) {
  if (!_bDebugActive) return fnBody();
  let oEntry = { iId: ++_iDebugCounter, sName: sName, aArgs: _dbgClone(aArgs), iTime: Date.now() };
  _aDebugEntries.unshift(oEntry);
  _dbgRenderEntry(oEntry, true);
  let oResult;
  try {
    oResult = fnBody();
  } catch (oErr) {
    oEntry.oError = oErr && oErr.message ? oErr.message : String(oErr);
    oEntry.iDuration = Date.now() - oEntry.iTime;
    _dbgRenderEntry(oEntry, false);
    throw oErr;
  }
  if (oResult && typeof oResult.then === 'function') {
    return oResult.then(function(oVal) {
      oEntry.oResult = _dbgClone(oVal);
      oEntry.iDuration = Date.now() - oEntry.iTime;
      _dbgRenderEntry(oEntry, false);
      return oVal;
    }, function(oErr) {
      oEntry.oError = oErr && oErr.message ? oErr.message : String(oErr);
      oEntry.iDuration = Date.now() - oEntry.iTime;
      _dbgRenderEntry(oEntry, false);
      throw oErr;
    });
  }
  oEntry.oResult = _dbgClone(oResult);
  oEntry.iDuration = Date.now() - oEntry.iTime;
  _dbgRenderEntry(oEntry, false);
  return oResult;
}

function _dbgClone(oVal) {
  try { return JSON.parse(JSON.stringify(oVal)); }
  catch (oErr) { return String(oVal); }
}

function _dbgFormatTime(iTimestamp) {
  let oDate = new Date(iTimestamp);
  let sH = String(oDate.getHours()).padStart(2, '0');
  let sM = String(oDate.getMinutes()).padStart(2, '0');
  let sS = String(oDate.getSeconds()).padStart(2, '0');
  let sMs = String(oDate.getMilliseconds()).padStart(3, '0');
  return sH + ':' + sM + ':' + sS + '.' + sMs;
}

function _dbgEscapeHtml(sStr) {
  if (typeof sStr !== 'string') sStr = String(sStr);
  return sStr.replace(new RegExp('&', 'g'), '&amp;').replace(new RegExp('<', 'g'), '&lt;').replace(new RegExp('>', 'g'), '&gt;');
}

function _dbgRenderEntry(oEntry, bPending) {
  if (!_eDebugList) return;
  let sId = 'dbg-' + oEntry.iId;
  let eRow = _eDebugList.querySelector('[data-dbg-id="' + sId + '"]');
  if (!eRow) {
    eRow = document.createElement('div');
    eRow.setAttribute('data-dbg-id', sId);
    eRow.style.cssText = 'border-bottom:1px solid #333;padding:6px 8px;font-size:12px;cursor:pointer;';
    _eDebugList.prepend(eRow);
  }
  let sStatus = bPending ? '\u23F3' : (oEntry.oError ? '\u274C' : '\u2705');
  let sDuration = bPending ? '\u2026' : oEntry.iDuration + 'ms';
  eRow.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">'
    + '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;"><strong>' + sStatus + ' ' + _dbgEscapeHtml(oEntry.sName) + '</strong></span>'
    + '<span style="color:#888;font-size:11px;white-space:nowrap;">' + _dbgFormatTime(oEntry.iTime) + ' | ' + sDuration + '</span>'
    + '<button class="dbg-copy" style="background:#333;color:#e0e0e0;border:1px solid #555;border-radius:3px;padding:1px 6px;cursor:pointer;font-size:11px;white-space:nowrap;" title="Copy to clipboard">⎘</button>'
    + '</div>';
  eRow.querySelector('.dbg-copy').onclick = function(e) {
    e.stopPropagation();
    let oData = { name: oEntry.sName, args: oEntry.aArgs, time: _dbgFormatTime(oEntry.iTime) };
    if (oEntry.oError) { oData.error = oEntry.oError; }
    else if (oEntry.oResult !== undefined) { oData.result = oEntry.oResult; }
    if (oEntry.iDuration !== undefined) { oData.duration = oEntry.iDuration + 'ms'; }
    navigator.clipboard.writeText(JSON.stringify(oData, null, 2)).then(function() {
      let eBtn = eRow.querySelector('.dbg-copy');
      eBtn.textContent = '\u2713';
      setTimeout(function() { eBtn.textContent = '\u2398'; }, 1000);
    });
  };
  eRow.onclick = function() {
    let eDetail = eRow.querySelector('.dbg-detail');
    if (eDetail) { eDetail.remove(); return; }
    eDetail = document.createElement('div');
    eDetail.className = 'dbg-detail';
    eDetail.style.cssText = 'margin-top:4px;padding:4px;background:#1a1a2e;border-radius:4px;font-size:11px;overflow:auto;max-height:300px;';
    let sArgsHtml = '<div style="color:#61dafb;margin-bottom:4px;"><b>Args:</b> <pre style="margin:2px 0;white-space:pre-wrap;word-break:break-all;">' + _dbgEscapeHtml(JSON.stringify(oEntry.aArgs, null, 2)) + '</pre></div>';
    let sResultHtml = '';
    if (oEntry.oError) {
      sResultHtml = '<div style="color:#ff6b6b;"><b>Error:</b> <pre style="margin:2px 0;white-space:pre-wrap;word-break:break-all;">' + _dbgEscapeHtml(oEntry.oError) + '</pre></div>';
    } else if (!bPending) {
      sResultHtml = '<div style="color:#a8e6cf;"><b>Result:</b> <pre style="margin:2px 0;white-space:pre-wrap;word-break:break-all;">' + _dbgEscapeHtml(JSON.stringify(oEntry.oResult, null, 2)) + '</pre></div>';
    }
    eDetail.innerHTML = sArgsHtml + sResultHtml;
    eRow.appendChild(eDetail);
  };
  if (_eDebugIcon) {
    let eBadge = _eDebugIcon.querySelector('.dbg-badge');
    if (eBadge) eBadge.textContent = String(_aDebugEntries.length);
  }
}

function _dbgInjectUI() {
  _eDebugIcon = document.createElement('div');
  _eDebugIcon.id = 'codeapp-debug-icon';
  _eDebugIcon.innerHTML = '<span style="font-size:18px;">\uD83D\uDC1B</span>'
    + '<span class="dbg-badge" style="position:absolute;top:-4px;right:-4px;background:#ff6b6b;color:#fff;font-size:10px;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;">0</span>';
  _eDebugIcon.style.cssText = 'position:fixed;top:10px;right:70px;z-index:999999;width:36px;height:36px;background:#1e1e2e;border:1px solid #444;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.4);user-select:none;';
  _eDebugIcon.onclick = function() {
    _eDebugPanel.style.display = _eDebugPanel.style.display === 'none' ? 'flex' : 'none';
  };
  document.body.appendChild(_eDebugIcon);

  _eDebugPanel = document.createElement('div');
  _eDebugPanel.id = 'codeapp-debug-panel';
  _eDebugPanel.style.cssText = 'position:fixed;top:0;right:0;z-index:999998;width:420px;height:100vh;background:#16161e;color:#e0e0e0;font-family:monospace;display:none;flex-direction:column;box-shadow:-4px 0 16px rgba(0,0,0,0.5);';

  let eHeader = document.createElement('div');
  eHeader.style.cssText = 'padding:10px 12px;background:#1e1e2e;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;';
  eHeader.innerHTML = '<span style="font-weight:bold;font-size:14px;">\uD83D\uDC1B codeapp.js Debugger</span>';
  let eClear = document.createElement('button');
  eClear.textContent = 'Clear';
  eClear.style.cssText = 'background:#333;color:#e0e0e0;border:1px solid #555;border-radius:4px;padding:3px 10px;cursor:pointer;font-size:12px;';
  eClear.onclick = function() {
    _aDebugEntries = [];
    _eDebugList.innerHTML = '';
    let eBadge = _eDebugIcon.querySelector('.dbg-badge');
    if (eBadge) eBadge.textContent = '0';
  };
  eHeader.appendChild(eClear);
  _eDebugPanel.appendChild(eHeader);

  _eDebugList = document.createElement('div');
  _eDebugList.style.cssText = 'flex:1;overflow-y:auto;';
  _eDebugPanel.appendChild(_eDebugList);
  document.body.appendChild(_eDebugPanel);

  // Render entries logged before UI was ready
  _aDebugEntries.slice().reverse().forEach(function(oEntry) {
    _dbgRenderEntry(oEntry, false);
  });
}

export function enableDebugger() {
  console.warn('Debug mode enabled: all API calls will be logged in the debug panel. Call enableDebugger() only in development environments.');
  if (_bDebugActive) return;
  _bDebugActive = true;
  if (document.body) {
    _dbgInjectUI();
  } else {
    document.addEventListener('DOMContentLoaded', _dbgInjectUI);
  }
}

// ── Get Environment Variable (single query with expand) ────────
export async function getEnvironmentVariable(sSchemaName) {
  return _dbgWrap('getEnvironmentVariable', [sSchemaName], async function() {
    let client = getSharedClient();

    // Try single query: filter values by expanded definition schema name
    let valResult = await client.retrieveMultipleRecordsAsync('environmentvariablevalues', {
      filter: "EnvironmentVariableDefinitionId/schemaname eq '" + sSchemaName + "'",
      select: ['value'],
      expand: [{ name: 'EnvironmentVariableDefinitionId', select: ['defaultvalue', 'schemaname'] }],
    });
    let aVals = unwrapResult(valResult);

    // If value record exists, return it
    if (Array.isArray(aVals) && aVals.length > 0 && aVals[0].value) {
      return aVals[0].value;
    }

    // No value record — fall back to definition default value
    let defResult = await client.retrieveMultipleRecordsAsync('environmentvariabledefinitions', {
      filter: "schemaname eq '" + sSchemaName + "'",
      select: ['defaultvalue'],
    });
    let aDefs = unwrapResult(defResult);
    if (!Array.isArray(aDefs) || aDefs.length === 0) {
      throw new Error('Environment variable not found: ' + sSchemaName);
    }
    return aDefs[0].defaultvalue || '';
  });
}

// ────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────── Dataverse ──────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────

// ── Table Registry (populated at runtime via registerTable) ────
let oDataSources = {};

// ── Register a Dataverse table for use by the library ──────────
export function registerTable(sTableName, sPrimaryKey) {
  return _dbgWrap('registerTable', [sTableName, sPrimaryKey], function() {
    oDataSources[sTableName] = {
      tableId: '',
      version: '',
      primaryKey: sPrimaryKey,
      dataSourceType: 'Dataverse',
      apis: {},
    };
    // reset client so it picks up the new table on next call
    oSharedClient = null;
  });
}

// ── Ensure value is an array (accepts array or comma-separated string)
function ensureArray(value) {
  if (!value) return value;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map(function(s) { return s.trim(); });
  return value;
}

// ── Create ─────────────────────────────────────────────────────
export async function createItem(tableName, primaryKey, record) {
  return _dbgWrap('createItem', [tableName, primaryKey, record], async function() {
    const client = getSharedClient();
    const result = await client.createRecordAsync(tableName, record);
    return unwrapResult(result);
  });
}

// ── Read (single) ──────────────────────────────────────────────
export async function getItem(tableName, primaryKey, id, select) {
  return _dbgWrap('getItem', [tableName, primaryKey, id, select], async function() {
    const client = getSharedClient();
    select = ensureArray(select);
    const options = select ? { select } : undefined;
    const result = await client.retrieveRecordAsync(tableName, id, options);
    return unwrapResult(result);
  });
}

// ── List (multiple) ────────────────────────────────────────────
export async function listItems(tableName, primaryKey, { filter, select, orderBy, top, skip } = {}) {
  return _dbgWrap('listItems', [tableName, primaryKey, { filter, select, orderBy, top, skip }], async function() {
    const client = getSharedClient();
    select = ensureArray(select);
    orderBy = ensureArray(orderBy);
    const result = await client.retrieveMultipleRecordsAsync(tableName, {
      filter,
      select,
      orderBy,
      top,
      skip,
    });
    let oUnwrapped = unwrapResult(result);
    return { entities: Array.isArray(oUnwrapped) ? oUnwrapped : [] };
  });
}

// ── Update ─────────────────────────────────────────────────────
export async function updateItem(tableName, primaryKey, id, changedFields) {
  return _dbgWrap('updateItem', [tableName, primaryKey, id, changedFields], async function() {
    const client = getSharedClient();
    const result = await client.updateRecordAsync(tableName, id, changedFields);
    return unwrapResult(result);
  });
}

// ── Delete ─────────────────────────────────────────────────────
export async function deleteItem(tableName, primaryKey, id) {
  return _dbgWrap('deleteItem', [tableName, primaryKey, id], async function() {
    const client = getSharedClient();
    const result = await client.deleteRecordAsync(tableName, id);
    return unwrapResult(result);
  });
}

// ── Unbound Action ─────────────────────────────────────────────
// Calls an unbound Dataverse action by POSTing to the action endpoint.
// Do NOT add action names to power.config.json dataSources — they are
// not entities and will cause deploy errors.
export async function callUnboundAction(tableName, primaryKey, actionName, params) {
  return _dbgWrap('callUnboundAction', [tableName, primaryKey, actionName, params], async function() {
    let oAllSources = Object.assign({}, oInitialDataSources, oDataSources);
    let result = await callActionAsync(oAllSources, actionName, params || {});
    return unwrapResult(result);
  });
}

// ── WhoAmI ─────────────────────────────────────────────────────
export async function whoAmI() {
  return _dbgWrap('whoAmI', [], async function() {
    let oCtx = await getContext();
    let sId = oCtx.UserId || oCtx.userId || oCtx.systemuserid;
    if (sId) return sId;
    if (oCtx.userSettings && oCtx.userSettings.userId) return oCtx.userSettings.userId;
    return oCtx;
  });
}

// ────────────────────────────────────────────────────────────────────────────
// ───────────────────────── Connector Helpers ────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────

function initConnectorClientWithCandidates(aDataSourceCandidates, oApis) {
  const dataSourcesInfo = {};

  aDataSourceCandidates.forEach(function(sDataSourceName) {
    dataSourcesInfo[sDataSourceName] = {
      tableId: '',
      version: '',
      primaryKey: '',
      dataSourceType: 'Connector',
      apis: oApis,
    };
  });

  return getClient(dataSourcesInfo);
}

async function execConnectorOpWithCandidates(aDataSourceCandidates, oApis, sConnectorName, operationName, parameters) {
  const client = await initConnectorClientWithCandidates(aDataSourceCandidates, oApis);
  const aErrors = [];

  for (let iIndex = 0; iIndex < aDataSourceCandidates.length; iIndex += 1) {
    const sDataSourceName = aDataSourceCandidates[iIndex];

    try {
      const result = await client.executeAsync({
        connectorOperation: {
          tableName: sDataSourceName,
          operationName,
          parameters,
        },
      });

      return unwrapResult(result);
    } catch (oErr) {
      const sMessage = stringifyConnectorError(oErr);
      aErrors.push(sDataSourceName + ': ' + sMessage);

      if (sMessage.indexOf('Connection reference not found') === -1) {
        throw oErr;
      }
    }
  }

  throw new Error('No ' + sConnectorName + ' connection reference matched. Tried: ' + aErrors.join(' || '));
}

const FLOW_APIS = {
  Run: {
    path: '/{connectionId}/triggers/manual/run',
    method: 'POST',
    parameters: [
      { name: 'connectionId', in: 'path', required: true },
      { name: 'input', in: 'body', required: false },
      { name: 'api-version', in: 'query', required: true },
    ],
  },
};

function uniqueNonEmptyStrings(aValues) {
  const aSeen = [];

  (aValues || []).forEach(function(value) {
    if (typeof value !== 'string') return;

    const sValue = value.trim();
    if (!sValue || aSeen.indexOf(sValue) !== -1) return;

    aSeen.push(sValue);
  });

  return aSeen;
}

function normalizeFlowDataSourceCandidates(flowTarget) {
  if (typeof flowTarget === 'string') {
    return uniqueNonEmptyStrings([flowTarget]);
  }

  if (Array.isArray(flowTarget)) {
    return uniqueNonEmptyStrings(flowTarget);
  }

  if (!flowTarget || typeof flowTarget !== 'object') {
    return [];
  }

  return uniqueNonEmptyStrings([
    flowTarget.dataSourceName,
    flowTarget.flowName,
  ].concat(Array.isArray(flowTarget.dataSourceCandidates) ? flowTarget.dataSourceCandidates : []));
}

function buildFlowRunParameters(input, options) {
  const oOptions = options || {};
  const oParameters = Object.assign({}, oOptions.parameters);

  if (!oParameters['api-version']) {
    oParameters['api-version'] = oOptions.apiVersion || '2015-02-01-preview';
  }

  if (input !== undefined) {
    oParameters.input = input;
  }

  return oParameters;
}

// ── Logic Flows ───────────────────────────────────────────────
// Use the flow data source name from power.config.json connectionReferences.*.dataSources[0].
// Generated flow services call the same Run operation; this helper is the handwritten equivalent.
export async function callFlow(flowTarget, input, options = {}) {
  return _dbgWrap('callFlow', [flowTarget, input, options], async function() {
    const aDataSourceCandidates = normalizeFlowDataSourceCandidates(flowTarget);

    if (aDataSourceCandidates.length === 0) {
      throw new Error('callFlow requires a flow data source name. Use power.config.json connectionReferences.<key>.dataSources[0].');
    }

    try {
      return await execConnectorOpWithCandidates(
        aDataSourceCandidates,
        FLOW_APIS,
        'Logic flow',
        'Run',
        buildFlowRunParameters(input, options)
      );
    } catch (oErr) {
      const sMessage = stringifyConnectorError(oErr);

      if (sMessage.indexOf('No Logic flow connection reference matched.') === 0 || sMessage.indexOf('Connection reference not found') !== -1) {
        throw new Error(sMessage + ' Use the flow data source name from power.config.json connectionReferences.<key>.dataSources[0], not the connection reference UUID key or the display name.');
      }

      throw oErr;
    }
  });
}