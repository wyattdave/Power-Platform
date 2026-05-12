/* power-apps-data.js - Standalone Power Apps SDK for Code Apps
   Converted from @microsoft/power-apps v1.0.4
   Zero dependencies - all code is self-contained
   Version 2.0.2: outlook fix
   sdk v1.0.17*/
   
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

const BRIDGE_INIT_TIMEOUT_MS = 8000;
const PLUGIN_CALL_TIMEOUT_MS = 30000;

var DefaultPowerAppsBridge = class {
  constructor() {
    __publicField(this, "_antiCSRFToken");
    __publicField(this, "_callbacks", {});
    __publicField(this, "_currentCallbackId", 0);
    __publicField(this, "_instanceId", Date.now().toString());
    __publicField(this, "_messageChannel", new window.MessageChannel());
    __publicField(this, "_postMessageQueue", []);
    __publicField(this, "_postMessageSource");
    __publicField(this, "_initializePromise");
    __publicField(this, "_handleMessageEvent", (messageEvent) => {
      const message = messageEvent.data;
      if (message && typeof message.isPluginCall === "boolean") {
        if (message.isPluginCall) {
          const callbackId = message.callbackId;
          const status = message.status;
          const args = message.args;
          const keepCallback = message.keepCallback;
          try {
            const callback = this._callbacks[callbackId];
            if (keepCallback) {
              if (callback && callback.onUpdate) {
                callback.onUpdate(message.args?.[0]);
              }
            } else {
              if (callback) {
                if (status === 1) {
                  callback.resolve(args[0]);
                } else if (status !== 0) {
                  callback.reject(args);
                }
              }
              if (!keepCallback) {
                delete this._callbacks[callbackId];
              }
            }
          } catch (error) {
            console.error(error);
          }
        }
      } else if (message && message.messageType === "initCommunication") {
        this._antiCSRFToken = message.antiCSRFToken;
        this._postMessageSource = this._messageChannel.port1;
        if (this._postMessageSource) {
          for (let i = 0; i < this._postMessageQueue.length; i++) {
            this._postMessageQueue[i].antiCSRFToken = this._antiCSRFToken;
            this._postMessageSource.postMessage(this._postMessageQueue[i]);
          }
          this._postMessageQueue = [];
        }
      }
    });
  }
  async initialize() {
    if (this._initializePromise) {
      return this._initializePromise;
    }
    this._initializePromise = new Promise((resolve, reject) => {
      if (window.parent === window) {
        reject(new Error("Power Apps host was not detected. Open this app from the Power Apps Code Apps host instead of a standalone browser tab."));
        return;
      }
      this._messageChannel.port1.onmessage = (messageEvent) => {
        this._handleMessageEvent(messageEvent);
        if (this._postMessageSource) {
          clearTimeout(timeoutId);
          resolve();
        }
      };
      const timeoutId = window.setTimeout(() => {
        reject(new Error("Timed out waiting for the Power Apps host to initialize the message bridge."));
      }, BRIDGE_INIT_TIMEOUT_MS);
      window.parent.postMessage({
        messageType: "initCommunicationWithPort",
        instanceId: this._instanceId
      }, "*", [this._messageChannel.port2]);
    });
    return this._initializePromise;
  }
  async executePluginAsync(pluginName, pluginAction, params = [], onUpdate) {
    return new Promise((resolve, reject) => {
      const callbackId = this._getCallbackId(pluginName);
      const timeoutId = window.setTimeout(() => {
        delete this._callbacks[callbackId];
        reject(new Error(`Timed out waiting for ${pluginName}.${pluginAction} to return from the Power Apps host.`));
      }, PLUGIN_CALL_TIMEOUT_MS);
      this._callbacks[callbackId] = {
        resolve: (value) => {
          clearTimeout(timeoutId);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
        onUpdate
      };
      this._sendMessage({
        isPluginCall: true,
        callbackId,
        service: pluginName,
        action: pluginAction,
        actionArgs: params,
        antiCSRFToken: this._antiCSRFToken
      });
    });
  }
  _sendMessage(message) {
    if (!this._postMessageSource) {
      this._postMessageQueue.push(message);
    } else {
      this._postMessageSource.postMessage(message);
    }
  }
  _getCallbackId(pluginName) {
    return "instanceId=" + this._instanceId + "_" + pluginName + this._currentCallbackId++;
  }
};

var bridgePromise;
async function executePluginAsync(pluginName, pluginAction, params = [], update) {
  const powerAppsBridge = await getBridge();
  return powerAppsBridge.executePluginAsync(pluginName, pluginAction, params, update);
}
async function getBridge() {
  if (!bridgePromise) {
    bridgePromise = new Promise(async (resolve, reject) => {
      try {
        const bridge = window && window.powerAppsBridge ? window.powerAppsBridge : new DefaultPowerAppsBridge();
        await bridge.initialize();
        resolve(bridge);
      } catch (error) {
        bridgePromise = void 0;
        reject(error);
      }
    });
  }
  return bridgePromise;
}

var context;
async function getContext() {
  if (context) {
    return context;
  }
  context = await executePluginAsync("AppLifecycle", "getContext");
  return context;
}

var IncompatibleMessageReceiver = class {
  constructor(versionInfo, incompatibilityDescription) {
    __publicField(this, "versionInfo");
    __publicField(this, "incompatibilityDescription");
    __publicField(this, "isCompatible", false);
    this.versionInfo = versionInfo;
    this.incompatibilityDescription = incompatibilityDescription;
  }
};

var SendMessageOperation = class {
  constructor(resultPromise, sendUpdate) {
    __publicField(this, "resultPromise");
    __publicField(this, "sendUpdate");
    /**
     * When completed is false onMessageReceived and sendUpdate will be visible.
     * When completed is true then these are hidden.
     */
    __publicField(this, "completed", false);
    __publicField(this, "onMessageReceived");
    this.resultPromise = resultPromise;
    this.sendUpdate = sendUpdate;
  }
};

var CompatibleMessageReceiver = class {
  constructor(_receiverName, versionInfo) {
    __publicField(this, "_receiverName");
    __publicField(this, "versionInfo");
    __publicField(this, "isCompatible", true);
    this._receiverName = _receiverName;
    this.versionInfo = versionInfo;
  }
  async sendMessage(message, onMessageReceived) {
    let resolveOperationPromise;
    let rejectOperationPromise;
    const operationPromise = new Promise((resolve, reject) => {
      resolveOperationPromise = resolve;
      rejectOperationPromise = reject;
    });
    const correlationId = crypto.randomUUID();
    const handleMessage = (compatibleReceiverMessage) => {
      try {
        if (sendMessageOperation.completed) {
          return;
        }
        if (compatibleReceiverMessage) {
          if (compatibleReceiverMessage.isUpdate) {
            if (sendMessageOperation.onMessageReceived) {
              try {
                sendMessageOperation.onMessageReceived(compatibleReceiverMessage.message);
              } catch (error) {
                sendMessageOperation.completed = true;
                rejectOperationPromise(error);
              }
            } else {
              sendMessageOperation.completed = true;
              rejectOperationPromise(new Error(`Native receiver expected a message handler, but no handler was supplied. Message: ${compatibleReceiverMessage.message}`));
            }
          } else {
            sendMessageOperation.completed = true;
            resolveOperationPromise(compatibleReceiverMessage.message);
          }
          return;
        }
      } catch {
      }
      sendMessageOperation.completed = true;
      resolveOperationPromise(compatibleReceiverMessage.message);
    };
    const handleError = (error) => {
      sendMessageOperation.completed = true;
      rejectOperationPromise(error);
    };
    const sendUpdate = (updateMessage) => {
      if (sendMessageOperation.completed) {
        throw new Error("Tried to send update for completed operation.");
      }
      executePluginAsync("SendMessagePlugin", "sendMessage", [
        this._receiverName,
        updateMessage,
        correlationId
      ]);
    };
    const sendMessageOperation = new SendMessageOperation(operationPromise, sendUpdate);
    sendMessageOperation.onMessageReceived = onMessageReceived;
    try {
      await executePluginAsync("SendMessagePlugin", "sendMessage", [this._receiverName, message, correlationId], (response) => {
        handleMessage(response);
      });
    } catch (error) {
      handleError(error);
    }
    return sendMessageOperation;
  }
};

var SendMessage = class _SendMessage {
  static createInstanceAsync() {
    return Promise.resolve(new _SendMessage());
  }
  async getMessageReceiverAsync(receiverName, isCompatibleChecker) {
    const versionInfo = await this._getVersionInfo(receiverName);
    if (versionInfo) {
      const compatibilityCheckerResult = isCompatibleChecker(versionInfo);
      if (compatibilityCheckerResult.isCompatible === false) {
        return new IncompatibleMessageReceiver(versionInfo, compatibilityCheckerResult.incompatibilityDescription || "");
      } else {
        return new CompatibleMessageReceiver(receiverName, versionInfo);
      }
    } else {
      return new IncompatibleMessageReceiver(void 0, `No receiver ${receiverName} registered.`);
    }
  }
  async _getVersionInfo(receiverName) {
    const result = await executePluginAsync("SendMessagePlugin", "getVersionInfo", [receiverName]);
    return result;
  }
};

var loggerInstance;
async function initializeLogger(logger) {
  loggerInstance = logger;
  const sendMessagePlugin = await SendMessage.createInstanceAsync();
  const receiver = await sendMessagePlugin.getMessageReceiverAsync("PowerApps.AppMonitorReceiver", (versionInfo) => {
    let isCompatible = false;
    if (versionInfo === "1.0.0") {
      isCompatible = true;
    }
    return { isCompatible };
  });
  if (receiver.isCompatible) {
    await receiver.sendMessage("initialize", (message) => {
      const parsedMessage = JSON.parse(message);
      if (parsedMessage.metrics) {
        for (const metric of parsedMessage.metrics) {
          loggerInstance.logMetric?.(metric);
        }
      }
    });
  }
}

function getAppLoadedPerformanceData() {
  const performanceApi = new PerformanceApi();
  const perfData = {
    appTimeOrigin: performanceApi.timeOrigin
  };
  const navigationTimingEntries = performanceApi.getEntriesByType("navigation");
  const navigationTiming = navigationTimingEntries[0];
  if (navigationTiming) {
    perfData.appNavigateType = navigationTiming.type;
    perfData.appNavigationStart = navigationTiming.startTime;
    perfData.appNavigationDuration = navigationTiming.duration;
    perfData.appEncodedBodySize = navigationTiming.encodedBodySize;
    perfData.appNextHopProtocol = navigationTiming.nextHopProtocol;
    perfData.appDomainLookupStart = navigationTiming.domainLookupStart;
    perfData.appDomainLookupEnd = navigationTiming.domainLookupEnd;
    perfData.appConnectStart = navigationTiming.connectStart;
    perfData.appConnectEnd = navigationTiming.connectEnd;
    perfData.appSecureConnectionStart = navigationTiming.secureConnectionStart;
    perfData.appFetchStart = navigationTiming.fetchStart;
    perfData.appRequestStart = navigationTiming.requestStart;
    perfData.appResponseStart = navigationTiming.responseStart;
    perfData.appResponseEnd = navigationTiming.responseEnd;
    perfData.appLoadEventEnd = navigationTiming.loadEventEnd;
    perfData.appDomInteractive = navigationTiming.domInteractive;
    perfData.appDomContentLoadedEventStart = navigationTiming.domContentLoadedEventStart;
  }
  return perfData;
}
var PerformanceApi = class {
  constructor(targetWindow = window) {
    __publicField(this, "_performance");
    this._performance = targetWindow.performance;
  }
  get timeOrigin() {
    return this._performance?.timeOrigin;
  }
  getEntriesByType(type) {
    if (!this._performance?.getEntriesByType) {
      return [];
    }
    return this._performance.getEntriesByType(type);
  }
};

executePluginAsync("AppLifecycle", "notifyAppSdkLoaded", [getAppLoadedPerformanceData()]);

function setConfig(config) {
  if (config.logger) {
    initializeLogger(config.logger);
  }
}

var HttpMethod;
(function(HttpMethod2) {
  HttpMethod2["GET"] = "GET";
  HttpMethod2["POST"] = "POST";
  HttpMethod2["PUT"] = "PUT";
  HttpMethod2["DELETE"] = "DELETE";
  HttpMethod2["PATCH"] = "PATCH";
})(HttpMethod || (HttpMethod = {}));
var DataSources;
(function(DataSources2) {
  DataSources2["Dataverse"] = "Dataverse";
  DataSources2["Connector"] = "Connector";
})(DataSources || (DataSources = {}));

var ErrorCodes;
(function(ErrorCodes2) {
  ErrorCodes2["InitializationFailed"] = "PDR_INIT_FAILED";
  ErrorCodes2["InvalidXrmInfo"] = "INVALID_XRM_INFO";
  ErrorCodes2["OperationsNotInitialized"] = "OPS_NOT_INITIALIZED";
  ErrorCodes2["InvalidOperationExecutor"] = "INVALID_OPERATION_EXECUTOR";
  ErrorCodes2["DataSourceNotFound"] = "CONNECTION_NOT_FOUND";
  ErrorCodes2["DuplicateDataSource"] = "DUPLICATE_DATA_SOURCE";
  ErrorCodes2["InitializationError"] = "RDSS_INIT_ERROR";
  ErrorCodes2["InvalidDataSource"] = "INVALID_DATA_SOURCE";
  ErrorCodes2["DataSourcesInfoNotFound"] = "DATA_SOURCES_INFO_NOT_FOUND";
  ErrorCodes2["DataClientInitFailed"] = "DATA_CLIENT_INIT_FAILED";
  ErrorCodes2["DataClientNotInitialized"] = "DATA_CLIENT_NOT_INITIALIZED";
  ErrorCodes2["MetadataClientInitFailed"] = "METADATA_CLIENT_INIT_FAILED";
  ErrorCodes2["MetadataClientNotInitialized"] = "METADATA_CLIENT_NOT_INITIALIZED";
  ErrorCodes2["ClientProviderNotAvailable"] = "CLIENT_PROVIDER_NOT_AVAILABLE";
  ErrorCodes2["ConnectionReferenceNotFound"] = "CONNECTION_REFERENCE_NOT_FOUND";
  ErrorCodes2["DataClientNotAvailable"] = "DATA_CLIENT_NOT_AVAILABLE";
  ErrorCodes2["DataSourceServiceNotAvailable"] = "DATA_SOURCE_SERVICE_NOT_AVAILABLE";
  ErrorCodes2["MetadataClientNotAvailable"] = "METADATA_CLIENT_NOT_AVAILABLE";
  ErrorCodes2["ConnectionConfigFetchFailed"] = "CONNECTION_CONFIG_FETCH_FAILED";
  ErrorCodes2["DataSourceConfigFetchFailed"] = "DATA_SOURCE_CONFIG_FETCH_FAILED";
  ErrorCodes2["InvalidMetadataResponse"] = "INVALID_METADATA_RESPONSE";
  ErrorCodes2["TokenAcquisitionFailed"] = "TOKEN_ACQUISITION_FAILED";
})(ErrorCodes || (ErrorCodes = {}));

var UnknownErrorMessage = "An unknown error occurred";
var ErrorMessages = {
  // PowerDataRuntime specific errors
  [ErrorCodes.InitializationFailed]: "Failed to initialize PowerDataRuntime",
  [ErrorCodes.InvalidXrmInfo]: "Xrm info is required",
  [ErrorCodes.OperationsNotInitialized]: "PowerDataRuntime is not initialized",
  // RuntimeDataSourceService specific errors
  [ErrorCodes.DataSourceNotFound]: "Data source not found",
  [ErrorCodes.DuplicateDataSource]: "Duplicate data source",
  [ErrorCodes.InitializationError]: "Failed to initialize RuntimeDataSourceService",
  [ErrorCodes.InvalidDataSource]: "Invalid data source",
  // PowerDataSourcesInfoProvider specific errors
  [ErrorCodes.DataSourcesInfoNotFound]: "DataSourcesInfo must be provided to initialize the singleton instance.",
  // DataClientProvider specific errors
  [ErrorCodes.DataClientInitFailed]: "Failed to initialize PowerDataClient",
  [ErrorCodes.DataClientNotInitialized]: "PowerDataClient is not initialized",
  [ErrorCodes.MetadataClientInitFailed]: "Failed to initialize PowerMetadataClient",
  [ErrorCodes.MetadataClientNotInitialized]: "PowerMetadataClient is not initialized",
  // DataOperation specific errors
  [ErrorCodes.ClientProviderNotAvailable]: "Client provider is not available",
  [ErrorCodes.ConnectionReferenceNotFound]: "Connection reference not found",
  [ErrorCodes.DataClientNotAvailable]: "PowerDataClient is not available",
  [ErrorCodes.DataSourceServiceNotAvailable]: "Data source service is not available",
  [ErrorCodes.MetadataClientNotAvailable]: "PowerMetadataClient is not available",
  // MetadataClient specific errors
  [ErrorCodes.ConnectionConfigFetchFailed]: "Failed to fetch connection configurations",
  [ErrorCodes.DataSourceConfigFetchFailed]: "Failed to fetch data source configurations",
  [ErrorCodes.InvalidMetadataResponse]: "Invalid metadata response format",
  // RuntimeDataClient specific errors
  [ErrorCodes.TokenAcquisitionFailed]: "Failed to acquire access token"
};
var DataOperationErrorMessages;
(function(DataOperationErrorMessages2) {
  DataOperationErrorMessages2["CreateFailed"] = "Create operation failure";
  DataOperationErrorMessages2["DeleteFailed"] = "Delete operation failure";
  DataOperationErrorMessages2["ExecuteFailed"] = "Execute operation failure";
  DataOperationErrorMessages2["InvalidOperationParameters"] = "Invalid operation parameters";
  DataOperationErrorMessages2["InvalidRequest"] = "Invalid request";
  DataOperationErrorMessages2["InvalidResponse"] = "Invalid response format";
  DataOperationErrorMessages2["MissingConnectorOperation"] = "Connector operation is required";
  DataOperationErrorMessages2["MissingDataverseRequest"] = "Dataverse request is required";
  DataOperationErrorMessages2["MissingOperationName"] = "Operation name is required";
  DataOperationErrorMessages2["MissingRequestBody"] = "Request body is required";
  DataOperationErrorMessages2["RetrieveFailed"] = "Retrieve operation failure";
  DataOperationErrorMessages2["RetrieveMultipleFailed"] = "Retrieve multiple records operation failure";
  DataOperationErrorMessages2["UpdateFailed"] = "Update operation failure";
})(DataOperationErrorMessages || (DataOperationErrorMessages = {}));

function isOperationResult(result) {
  return result?.success !== void 0;
}

var ServiceName = "PublishedAppTelemetry";
var TelemetryActionNames;
(function(TelemetryActionNames2) {
  TelemetryActionNames2["trackEvent"] = "trackEvent";
  TelemetryActionNames2["trackException"] = "trackException";
  TelemetryActionNames2["trackMetric"] = "trackMetric";
  TelemetryActionNames2["startScenario"] = "startScenario";
  TelemetryActionNames2["endScenario"] = "endScenario";
  TelemetryActionNames2["setDefaultProperties"] = "setDefaultProperties";
})(TelemetryActionNames || (TelemetryActionNames = {}));
var _Log = class _Log {
  constructor(_powerOperationExecutor) {
    __publicField(this, "_powerOperationExecutor");
    this._powerOperationExecutor = _powerOperationExecutor;
  }
  static createInstance(powerOperationExecutor) {
    if (!_Log._instance) {
      _Log._instance = new _Log(powerOperationExecutor);
    } else {
      _Log.trackEvent("TelemetryLogger", {
        message: "Attempted to create an instance when instance is already created."
      });
    }
    return _Log._instance;
  }
  // Since powerDataRuntime can be reset, we need to be able to reset the instance of Log as well.
  static resetInstance() {
    _Log._instance = null;
  }
  static async _sendMessage(actionName, ...args) {
    try {
      const instance = _Log._getInstance();
      const result = await instance._powerOperationExecutor.execute(ServiceName, actionName, args);
      if (!result.success) {
        console.error({
          message: `PowerDataRuntime.TelemetryLogger: Failed to send telemetry message.`,
          error: result.error,
          telemetryArgs: args
        });
      }
    } catch (error) {
      console.error({
        message: `PowerDataRuntime.TelemetryLogger: Failed to send telemetry message.`,
        error,
        telemetryArgs: args
      });
    }
  }
  static trackEvent(eventName, eventData) {
    const serializedData = eventData ? _Log._serializeErrors(eventData) : eventData;
    return _Log._sendMessage(TelemetryActionNames.trackEvent, `PowerDataRuntime.${eventName}`, serializedData);
  }
  static trackException(exception) {
    return _Log._sendMessage(TelemetryActionNames.trackException, exception);
  }
  static trackMetric(metricName, value) {
    return _Log._sendMessage(TelemetryActionNames.trackMetric, `PowerDataRuntime.${metricName}`, value);
  }
  static startScenario(scenarioName) {
    return _Log._sendMessage(TelemetryActionNames.startScenario, `PowerDataRuntime.${scenarioName}`);
  }
  static endScenario(scenarioName) {
    return _Log._sendMessage(TelemetryActionNames.endScenario, `PowerDataRuntime.${scenarioName}`);
  }
  static setDefaultProperties(properties) {
    return _Log._sendMessage(TelemetryActionNames.setDefaultProperties, properties);
  }
  static _getInstance() {
    if (!_Log._instance) {
      throw new Error("PowerDataRuntime.TelemetryLogger: Attempted to log telemetry prior to instantiation.");
    }
    return _Log._instance;
  }
  /**
   * Recursively serializes Error objects in an object to prevent empty object serialization
   * when passed through postMessage's structured clone algorithm.
   * @param obj - The object to process
   * @returns A new object with Error instances replaced by serializable objects
   */
  static _serializeErrors(obj) {
    if (obj === null || obj === void 0) {
      return obj;
    }
    if (obj instanceof Error) {
      return {
        errorMessage: obj.message,
        errorStack: obj.stack,
        errorType: obj.name
      };
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => _Log._serializeErrors(item));
    }
    if (typeof obj === "object" && obj !== null && Object.getPrototypeOf(obj) === Object.prototype) {
      const serialized = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          serialized[key] = _Log._serializeErrors(obj[key]);
        }
      }
      return serialized;
    }
    return obj;
  }
};
__publicField(_Log, "_instance", null);
var Log = _Log;

var PowerDataRuntimeError = class extends Error {
  /**
   * Creates an instance of PowerDataRuntimeError.
   * @param code - The error code associated with the error.
   * @param additionalInfo - Optional additional information to include in the error message.
   * @param messageOverride - Optional override for the default error message.
   */
  constructor(code, additionalInfo, messageOverride) {
    let message = messageOverride || ErrorMessages[code] || UnknownErrorMessage;
    if (additionalInfo) {
      message += `: ${additionalInfo}`;
    }
    super(message);
    __publicField(this, "code");
    this.code = code;
    this.name = "PowerDataRuntimeError";
    Log.trackException(this);
  }
};

var HeaderNames;
(function(HeaderNames2) {
  HeaderNames2["RequestId"] = "x-ms-client-request-id";
})(HeaderNames || (HeaderNames = {}));
var DataverseOperationName;
(function(DataverseOperationName2) {
  DataverseOperationName2["CreateRecord"] = "dataverseDataOperation.createRecordAsync";
  DataverseOperationName2["UpdateRecord"] = "dataverseDataOperation.updateRecordAsync";
  DataverseOperationName2["DeleteRecord"] = "dataverseDataOperation.deleteRecordAsync";
  DataverseOperationName2["RetrieveRecord"] = "dataverseDataOperation.retrieveRecordAsync";
  DataverseOperationName2["RetrieveMultipleRecords"] = "dataverseDataOperation.retrieveMultipleRecordsAsync";
})(DataverseOperationName || (DataverseOperationName = {}));
var ConnectorOperationName;
(function(ConnectorOperationName2) {
  ConnectorOperationName2["CreateRecord"] = "connectorDataOperation.createRecordAsync";
  ConnectorOperationName2["UpdateRecord"] = "connectorDataOperation.updateRecordAsync";
  ConnectorOperationName2["DeleteRecord"] = "connectorDataOperation.deleteRecordAsync";
  ConnectorOperationName2["RetrieveRecord"] = "connectorDataOperation.retrieveRecordAsync";
  ConnectorOperationName2["RetrieveMultipleRecords"] = "connectorDataOperation.retrieveMultipleRecordsAsync";
})(ConnectorOperationName || (ConnectorOperationName = {}));

function getErrorMessage(error) {
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error || error instanceof PowerDataRuntimeError) {
    return error.message || UnknownErrorMessage;
  }
  if (isOperationResult(error)) {
    return error.error?.message || UnknownErrorMessage;
  }
  if (typeof error === "object") {
    return JSON.stringify(error);
  }
  return UnknownErrorMessage;
}
function createErrorResponse(error, friendlyMessage) {
  const message = getErrorMessage(error);
  let data;
  if (isOperationResult(error)) {
    data = error.data;
  }
  const errorData = new Error(`${friendlyMessage}: ${message}`);
  if (error instanceof Error) {
    errorData.stack = error.stack;
  }
  return {
    success: false,
    error: errorData,
    data
  };
}
function parseHttpPluginError(error) {
  let message = UnknownErrorMessage;
  let response;
  if (Array.isArray(error)) {
    if (Array.isArray(error[0])) {
      message = error[0][0] || UnknownErrorMessage;
      response = error[0][2];
    }
  }
  const status = response?.status;
  const requestId = response?.headers?.[HeaderNames.RequestId];
  return {
    message,
    status,
    requestId
  };
}

var DefaultDataOperationOrchestrator = class {
  // Static identifiers for services and actions
  // Used to identify specific services and actions within the PowerApps environment
  constructor(_dataverseOperation, _connectorOperation, _connectionsService) {
    __publicField(this, "_dataverseOperation");
    __publicField(this, "_connectorOperation");
    __publicField(this, "_connectionsService");
    this._dataverseOperation = _dataverseOperation;
    this._connectorOperation = _connectorOperation;
    this._connectionsService = _connectionsService;
  }
  /**
   * Creates a new record in the specified data source.
   * @param tableName - The name of the table.
   * @param data - The record data to create.
   * @returns A promise that resolves to the operation result.
   * @throws DataOperationError if the operation fails.
   */
  async createRecordAsync(tableName, data) {
    try {
      this._validateParams({ tableName, data });
      const executor = await this._getExecutor(tableName);
      return await executor.createRecordAsync(tableName, data);
    } catch (error) {
      return createErrorResponse(error, "Create record operation failed");
    }
  }
  /**
   * Updates an existing record in the specified data source.
   * @param tableName - The name of the table.
   * @param id - The ID of the record to update.
   * @param data - The updated record data.
   * @returns A promise that resolves to the operation result.
   * @throws DataOperationError if the operation fails.
   */
  async updateRecordAsync(tableName, id, data) {
    try {
      this._validateParams({ tableName, id, data });
      const executor = await this._getExecutor(tableName);
      return await executor.updateRecordAsync(tableName, id, data);
    } catch (error) {
      return createErrorResponse(error, "Update record operation failed");
    }
  }
  /**
   * Deletes a record from the specified data source.
   * @param tableName - The name of the table.
   * @param id - The ID of the record to delete.
   * @returns A promise that resolves to the operation result.
   * @throws DataOperationError if the operation fails.
   */
  async deleteRecordAsync(tableName, id) {
    try {
      this._validateParams({ tableName, id });
      const executor = await this._getExecutor(tableName);
      return await executor.deleteRecordAsync(tableName, id);
    } catch (error) {
      return createErrorResponse(error, "Delete record operation failed");
    }
  }
  /**
   * Retrieves a record from the specified data source.
   * @param tableName - The name of the table.
   * @param id - The ID of the record to retrieve.
   * @param options - Optional operation options.
   * @returns A promise that resolves to the operation result.
   * @throws DataOperationError if the operation fails.
   */
  async retrieveRecordAsync(tableName, id, options) {
    try {
      this._validateParams({ tableName, id });
      const executor = await this._getExecutor(tableName);
      this._validateOptions(options);
      return await executor.retrieveRecordAsync(tableName, id, options);
    } catch (error) {
      return createErrorResponse(error, "Retrieve record operation failed");
    }
  }
  /**
   * Retrieves multiple records from the specified data source.
   * @param tableName - The name of the table.
   * @param options - Optional operation options.
   * @returns A promise that resolves to the operation result.
   * @throws DataOperationError if the operation fails.
   */
  async retrieveMultipleRecordsAsync(tableName, options) {
    try {
      this._validateParams({ tableName });
      const executor = await this._getExecutor(tableName);
      this._validateOptions(options);
      return await executor.retrieveMultipleRecordsAsync(tableName, options);
    } catch (error) {
      return createErrorResponse(error, "Retrieve multiple records operation failed");
    }
  }
  /**
   * Executes a data operation on the specified data source.
   * @param operation - The operation to execute
   * @returns A promise that resolves to the operation result.
   * @throws DataOperationError if the operation fails.
   */
  async executeAsync(operation) {
    try {
      this._validateParams({ operation });
      const executor = await this._getExecutor("", operation.connectorOperation ? DataSources.Connector : DataSources.Dataverse);
      return await executor.executeAsync(operation);
    } catch (error) {
      return createErrorResponse(error, "Execute operation failed");
    }
  }
  /**
   * Retrieves the appropriate executor based on the data source.
   * @param dataSource - The data source to retrieve the executor for.
   * @returns The corresponding executor instance.
   * @throws DataOperationError if the data source is invalid.
   * // TODO: Add Dataverse support
   */
  async _getExecutor(tableName, dataSource) {
    const dataOperationExecutorOverride = getDataOperationExecutor();
    if (dataOperationExecutorOverride) {
      return dataOperationExecutorOverride;
    }
    const dataSourceType = dataSource || (await this._connectionsService.getDataSource(tableName)).dataSourceType;
    switch (dataSourceType) {
      case DataSources.Dataverse:
        return this._dataverseOperation;
      case DataSources.Connector:
        return this._connectorOperation;
      default:
        return this._connectorOperation;
    }
  }
  /**
   * Validates the input parameters for data operations.
   * @param params - The parameters to validate.
   * @throws DataOperationError if validation fails.
   */
  _validateParams(params) {
    for (const [key, value] of Object.entries(params)) {
      if (!value) {
        throw new Error(`${DataOperationErrorMessages.InvalidOperationParameters}: ${key} is required`);
      }
    }
  }
  /**
   * Validates the operation options.
   * @param options - The operation options to validate.
   * @throws Error if validation fails.
   */
  _validateOptions(options) {
    if (!options) {
      return;
    }
    if (options.maxPageSize && typeof options.maxPageSize !== "number") {
      throw new Error(`${DataOperationErrorMessages.InvalidOperationParameters}: maxPageSize must be a number`);
    }
    if (options.select) {
      if (!Array.isArray(options.select)) {
        throw new Error(`${DataOperationErrorMessages.InvalidOperationParameters}: select must be an array of strings`);
      }
      if (options.select.some((s) => typeof s !== "string" || s.trim() === "")) {
        throw new Error(`${DataOperationErrorMessages.InvalidOperationParameters}: select must contain only non-empty strings`);
      }
    }
    if (options.filter && typeof options.filter !== "string") {
      throw new Error(`${DataOperationErrorMessages.InvalidOperationParameters}: filter must be a string`);
    }
    if (options.orderBy) {
      if (!Array.isArray(options.orderBy)) {
        throw new Error(`${DataOperationErrorMessages.InvalidOperationParameters}: orderBy must be an array of strings`);
      }
      if (options.orderBy.some((s) => typeof s !== "string" || s.trim() === "")) {
        throw new Error(`${DataOperationErrorMessages.InvalidOperationParameters}: orderBy must contain only non-empty strings`);
      }
    }
    if (options.top && typeof options.top !== "number") {
      throw new Error(`${DataOperationErrorMessages.InvalidOperationParameters}: top must be a number`);
    }
    if (options.skip && typeof options.skip !== "number") {
      throw new Error(`${DataOperationErrorMessages.InvalidOperationParameters}: skip must be a number`);
    }
    if (options.count && typeof options.count !== "boolean") {
      throw new Error(`${DataOperationErrorMessages.InvalidOperationParameters}: count must be a boolean`);
    }
  }
};

var RuntimeMetadataOperations = class {
  // Static identifiers for services and actions
  // Used to identify specific services and actions within the PowerApps environment
  constructor(_clientProvider) {
    __publicField(this, "_clientProvider");
    this._clientProvider = _clientProvider;
  }
  async getConnections(context2) {
    const client = await this._clientProvider.getMetadataClientAsync();
    const response = await client.getAppConnectionConfigsAsync(context2);
    return {
      success: response.success,
      data: response.data ? [response.data] : [],
      error: response.error
    };
  }
  async getConnectionApis(_connectionId, context2) {
    const client = await this._clientProvider.getMetadataClientAsync();
    const response = await client.getAppDataSourceConfigsAsync(context2);
    return {
      success: response.success,
      data: response.data ? [response.data] : [],
      error: response.error
    };
  }
};

function arrayBufferToBase64(buffer) {
  return window.btoa(convertArrayBufferToString(buffer));
}
function convertArrayBufferToString(buf) {
  if (buf.byteLength <= 65535) {
    return String.fromCharCode(...new Uint8Array(buf));
  }
  let binary = "";
  for (let i = 0, bytes = new Uint8Array(buf); i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return binary;
}
function strictEncode(str) {
  return encodeURIComponent(str).replace(/\(/g, "%28").replace(/\)/g, "%29");
}
function extractDataverseUrlParts(url) {
  const baseUrlMatch = url.match(/^(https?:\/\/[^/]+\/api\/data\/v9\.0)/);
  const baseUrl = baseUrlMatch ? baseUrlMatch[1] : "";
  const pathMatch = url.match(/\/api\/data\/v9\.0\/(.+)$/);
  const encodedPath = pathMatch ? strictEncode(pathMatch[1]) : "";
  return { baseUrl, encodedPath };
}

var _RuntimeDataClient = class _RuntimeDataClient {
  // Constructor for RuntimeDataClient
  // Accepts an IPowerOperationExecutor instance for executing operations
  constructor(_powerOperationExecutor) {
    __publicField(this, "_powerOperationExecutor");
    this._powerOperationExecutor = _powerOperationExecutor;
  }
  /**
   * Creates a new instance of RuntimeDataClient
   */
  static createInstanceAsync(powerOperationExecutor) {
    return Promise.resolve(new _RuntimeDataClient(powerOperationExecutor));
  }
  /**
   * Creates data using POST method
   * @param url - The URL for the request
   * @param apiId - The API ID for authentication
   * @param tableName - The name of the table to access
   * @param body - The request body for the POST method
   * @param operationName - Optional operation name for telemetry
   * @return Promise resolving to the response data
   * @throws Error if the request fails or the response is invalid
   * @throws Error if the request body is invalid
   */
  async createDataAsync(url, apiId, tableName, body, context2) {
    try {
      if (!body) {
        throw new Error(`${DataOperationErrorMessages.InvalidRequest}: ${DataOperationErrorMessages.MissingRequestBody}`);
      }
      const config = {
        url,
        method: HttpMethod.POST,
        apiId,
        tableName,
        body: JSON.stringify(body)
      };
      context2 = this._ensureContext(context2, "runtimeDataClient.createDataAsync");
      return await this._executeRequest(config, context2);
    } catch (error) {
      if (isOperationResult(error)) {
        return error;
      } else {
        return createErrorResponse(error, DataOperationErrorMessages.CreateFailed);
      }
    }
  }
  /**
   * Updates data using PATCH method
   * @param url - The URL for the request
   * @param apiId - The API ID for authentication
   * @param tableName - The name of the table to access
   * @param body - The request body for the PATCH method
   * @param operationName - Optional operation name for telemetry
   * @return Promise resolving to the response data
   * @throws Error if the request fails or the response is invalid
   * @throws Error if the request body is invalid
   */
  async updateDataAsync(url, apiId, tableName, body, context2) {
    try {
      if (!body) {
        throw new Error(`${DataOperationErrorMessages.InvalidRequest}: ${DataOperationErrorMessages.MissingRequestBody}`);
      }
      const config = {
        url,
        method: HttpMethod.PATCH,
        apiId,
        tableName,
        body: JSON.stringify(body)
      };
      context2 = this._ensureContext(context2, "runtimeDataClient.updateDataAsync");
      return await this._executeRequest(config, context2);
    } catch (error) {
      if (isOperationResult(error)) {
        return error;
      } else {
        return createErrorResponse(error, DataOperationErrorMessages.UpdateFailed);
      }
    }
  }
  /**
   * Deletes data using DELETE method
   * @param url - The URL for the request
   * @param connectionApi - The API ID for authentication
   * @param serviceNamespace - The name of the service namespace
   * @param operationName - Optional operation name for telemetry
   * @return Promise resolving to the response data
   * @throws Error if the request fails or the response is invalid
   */
  async deleteDataAsync(url, connectionApi, serviceNamespace, context2) {
    try {
      const config = {
        url,
        method: HttpMethod.DELETE,
        apiId: connectionApi,
        tableName: serviceNamespace
      };
      context2 = this._ensureContext(context2, "runtimeDataClient.deleteDataAsync");
      return await this._executeRequest(config, context2);
    } catch (error) {
      if (isOperationResult(error)) {
        return error;
      } else {
        return createErrorResponse(error, DataOperationErrorMessages.DeleteFailed);
      }
    }
  }
  /**
   * Retrieves data using GET or POST method
   * @param url - The URL for the request
   * @param apiId - The API ID for authentication
   * @param tableName - The name of the table to access
   * @param method - The HTTP method
   * @param body - Optional request body for POST method
   * @param context - Optional operation context
   * @param operationName - Optional operation name for telemetry
   * @return Promise resolving to the response data
   * @throws Error if the request fails or the response is invalid
   */
  async retrieveDataAsync(url, apiId, tableName, method, headers, body, context2) {
    try {
      const config = {
        url,
        method,
        apiId,
        tableName,
        headers,
        body: body ? typeof body === "string" ? body : JSON.stringify(body) : void 0
      };
      context2 = this._ensureContext(context2, "runtimeDataClient.retrieveDataAsync");
      return await this._executeRequest(config, context2);
    } catch (error) {
      if (isOperationResult(error)) {
        return error;
      } else {
        return createErrorResponse(error, DataOperationErrorMessages.RetrieveFailed);
      }
    }
  }
  /**
   * Gets an access token for the specified API.
   * If the API is Dataverse, retrieves a dynamic resource token; otherwise, retrieves a standard appservice API token.
   * @param apiId - The API ID for authentication
   * @param datasetName - Optional dataset name for Dataverse
   * @returns Promise resolving to the access token
   * @throws Error if token acquisition fails
   */
  async _getAccessToken(apiId, datasetName) {
    try {
      let result;
      if (apiId === DataSources.Dataverse) {
        result = await this._powerOperationExecutor.execute(_RuntimeDataClient.SERVICES.identityService, _RuntimeDataClient.ACTIONS.getDynamicToken, [datasetName]);
      } else {
        result = await this._powerOperationExecutor.execute(_RuntimeDataClient.SERVICES.identityService, _RuntimeDataClient.ACTIONS.getToken, [apiId]);
      }
      return result.data;
    } catch (error) {
      throw new PowerDataRuntimeError(ErrorCodes.TokenAcquisitionFailed, getErrorMessage(error));
    }
  }
  // Merge Prefer headers for Dataverse batch payloads
  _mergePreferHeaders(configHeaders, method) {
    let preferHeader = "";
    if (configHeaders?.Prefer) {
      preferHeader += configHeaders.Prefer;
    }
    if (method === HttpMethod.POST || method === HttpMethod.PATCH) {
      const defaultPrefer = "return=representation,odata.include-annotations=*";
      if (preferHeader) {
        if (!preferHeader.includes("return=representation")) {
          preferHeader += (preferHeader ? "," : "") + defaultPrefer;
        }
      } else {
        preferHeader = defaultPrefer;
      }
    }
    return preferHeader;
  }
  /**
   * Creates headers for the HTTP request.
   * Combines default headers with any custom headers provided in the config.
   * Custom headers are optional and take precedence over default headers.
   * @param token - The access token for authentication
   * @param config - The HTTP request configuration
   * @return The headers for the request
   * @throws Error if header creation fails
   */
  _createHeaders(token, config, context2) {
    const baseHeaders = {
      Accept: "application/json",
      "x-ms-protocol-semantics": "cdp",
      ServiceNamespace: config.tableName,
      Authorization: `paauth ${token}`,
      "x-ms-pa-client-custom-headers-options": '{"addCustomHeaders":true}',
      "x-ms-enable-selects": "true",
      "x-ms-pa-client-telemetry-options": `paclient-telemetry {"operationName":"${context2?.operationName ?? "runtimeDataClient.executeRequest"}"}`,
      "x-ms-pa-client-telemetry-additional-data": `{"apiId":"${config.apiId}"}`
    };
    if (config.apiId === DataSources.Dataverse) {
      baseHeaders["x-ms-protocol-semantics"] = DataSources.Dataverse;
      baseHeaders.Authorization = `dynamicauth ${token}`;
      const { baseUrl, encodedPath } = extractDataverseUrlParts(config.url);
      const batchId = context2?.batchId || "";
      const preferHeader = this._mergePreferHeaders(config.headers, config.method);
      baseHeaders.BatchInfo = JSON.stringify({
        baseUrl,
        encodedPath,
        headers: {
          Accept: "application/json",
          ...preferHeader ? { Prefer: preferHeader } : {},
          ...config.method === HttpMethod.POST || config.method === HttpMethod.PATCH ? { "Content-Type": "application/json" } : {}
        },
        batchId
      });
    }
    if (config.headers) {
      return { ...baseHeaders, ...config.headers };
    }
    return baseHeaders;
  }
  /**
   * Executes an HTTP request with the given configuration
   * @param config - The HTTP request configuration
   * @param context - Optional operation context
   * @return Promise resolving to the response data
   * @throws Error if the request fails or the response is invalid
   * @throws Error if the response content type is invalid
   */
  async _executeRequest(config, context2) {
    const token = await this._getAccessToken(config.apiId, context2?.datasetName);
    const headers = this._createHeaders(token, config, context2);
    const requestBody = config.body ? new Blob([config.body], { type: "application/json" }) : "";
    let result;
    try {
      result = await this._powerOperationExecutor.execute(_RuntimeDataClient.SERVICES.dataClient, _RuntimeDataClient.ACTIONS.sendHttp, [
        {
          url: config.url,
          method: config.method,
          requestSource: _RuntimeDataClient.REQUEST_SOURCE,
          allowSessionStorage: true,
          returnDirectResponse: true,
          headers
        },
        requestBody,
        "arraybuffer"
      ]);
    } catch (error) {
      return {
        success: false,
        error: parseHttpPluginError(error),
        data: void 0
      };
    }
    const responseData = result.data;
    const responseHeaders = responseData[0].headers;
    const contentType = responseHeaders["Content-Type"];
    if (!contentType) {
      return {
        success: true,
        data: void 0
      };
    } else if (contentType.indexOf("application/json") !== -1) {
      const data = result.data[1];
      let text = this._decodeArrayBuffer(data);
      if (!text) {
        text = "{}";
      }
      const parsedResult = JSON.parse(text);
      if (context2?.isDataVerseOperation || this._isDataverseCall(config.url)) {
        return {
          success: true,
          data: parsedResult
        };
      } else if (!context2?.isExecuteAsync && "value" in parsedResult && Array.isArray(parsedResult.value)) {
        return {
          success: true,
          data: parsedResult.value,
          count: parsedResult["@odata.count"]
        };
      } else {
        return {
          success: true,
          data: parsedResult
        };
      }
    } else if (contentType.indexOf("image/") !== -1) {
      const buffer = result.data[1];
      if (buffer instanceof ArrayBuffer) {
        const value = arrayBufferToBase64(buffer);
        return {
          success: true,
          data: value
        };
      }
      return {
        success: true,
        data: buffer
      };
    } else {
      const buffer = result.data[1];
      if (buffer instanceof ArrayBuffer) {
        const value = convertArrayBufferToString(buffer);
        const status = responseData[0].status;
        const responseType = context2?.responseInfo?.[status];
        if (responseType) {
          let parsedValue;
          try {
            parsedValue = JSON.parse(value);
          } catch (err) {
            return {
              success: false,
              data: void 0,
              error: new Error(DataOperationErrorMessages.InvalidResponse)
            };
          }
          if (responseType.type === "array" && !Array.isArray(parsedValue)) {
            return {
              success: false,
              data: void 0,
              error: new Error(DataOperationErrorMessages.InvalidResponse)
            };
          }
          if (responseType.type === "object" && (typeof parsedValue !== "object" || Array.isArray(parsedValue) || parsedValue === null)) {
            return {
              success: false,
              data: void 0,
              error: new Error(DataOperationErrorMessages.InvalidResponse)
            };
          }
          return {
            success: true,
            data: parsedValue
          };
        } else {
          return {
            success: true,
            data: value
          };
        }
      }
      return {
        success: false,
        data: responseData,
        error: new Error(DataOperationErrorMessages.InvalidResponse)
      };
    }
  }
  _ensureContext(context2, defaultOperationName) {
    if (!context2) {
      context2 = {};
    }
    if (!context2.operationName) {
      context2.operationName = defaultOperationName;
    }
    return context2;
  }
  /**
   * Checks if the given URL is a Dataverse API call
   * @param url - The URL to check
   * @returns True if the URL is a Dataverse API call, false otherwise
   */
  _isDataverseCall(url) {
    if (!url) {
      return false;
    }
    const urlLower = decodeURIComponent(url).toLowerCase();
    return urlLower.includes("/api/data/") && !urlLower.includes("/apim");
  }
  /**
   * Decodes ArrayBuffer to string, handling both browser and Node.js environments
   * @param buffer - The ArrayBuffer to decode
   * @returns The decoded string
   */
  _decodeArrayBuffer(buffer) {
    if (typeof TextDecoder !== "undefined") {
      return new TextDecoder().decode(buffer);
    }
    const uint8Array = new Uint8Array(buffer);
    const results = [];
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      results.push(String.fromCharCode.apply(null, Array.from(chunk)));
    }
    try {
      return results.join("");
    } catch {
      return results.join("");
    }
  }
};
// Static identifiers for services
// Used to identify specific services within the PowerApps environment
__publicField(_RuntimeDataClient, "SERVICES", {
  dataClient: "AppHttpClientPlugin",
  identityService: "AppIdentityServicePlugin"
});
// Static identifiers for service actions
// Used to identify specific actions within the service
// These actions are used to send HTTP requests and get access tokens
__publicField(_RuntimeDataClient, "ACTIONS", {
  sendHttp: "sendHttpAsync",
  getToken: "getAppAccessTokenAsync",
  getDynamicToken: "getAppDynamicResourceAccessTokenAsync"
});
// Request source identifier for telemetry
// Used to identify the source of the request in telemetry data
__publicField(_RuntimeDataClient, "REQUEST_SOURCE", "PublishedApp");
var RuntimeDataClient = _RuntimeDataClient;

var _RuntimeMetadataClient = class _RuntimeMetadataClient {
  // Private member for the PowerOperationExecutor
  // The PowerOperationExecutor is used to execute operations on the clients
  constructor(_powerOperationExecutor) {
    __publicField(this, "_powerOperationExecutor");
    this._powerOperationExecutor = _powerOperationExecutor;
  }
  /**
   * Creates a new instance of RuntimeMetadataClient
   * @param powerOperationExecutor - The powerOperationExecutor instance
   * @returns Promise resolving to IRuntimeMetadataClient
   */
  static createInstanceAsync(powerOperationExecutor) {
    return Promise.resolve(new _RuntimeMetadataClient(powerOperationExecutor));
  }
  /**
   * Fetches app connection configurations
   * @returns Promise resolving to connection reference details
   * @throws Error if the operation fails
   */
  async getAppConnectionConfigsAsync() {
    try {
      const config = {
        service: _RuntimeMetadataClient.SERVICES.powerAppsClient,
        action: _RuntimeMetadataClient.ACTIONS.getConnectionConfigs,
        params: []
      };
      const result = await this._executeOperation(config);
      return { success: true, data: result };
    } catch (error) {
      throw new PowerDataRuntimeError(ErrorCodes.ConnectionConfigFetchFailed, getErrorMessage(error));
    }
  }
  /**
   * Fetches app data source configurations
   * @returns Promise resolving to connection reference details
   * @throws Error if the operation fails
   */
  async getAppDataSourceConfigsAsync() {
    try {
      const config = {
        service: _RuntimeMetadataClient.SERVICES.powerAppsClient,
        action: _RuntimeMetadataClient.ACTIONS.getDataSourceConfigs,
        params: []
      };
      const result = await this._executeOperation(config);
      return { success: true, data: result };
    } catch (error) {
      throw new PowerDataRuntimeError(ErrorCodes.DataSourceConfigFetchFailed, getErrorMessage(error));
    }
  }
  /**
   * Executes a metadata operation with the given configuration
   * @param config - The operation configuration
   * @returns Promise resolving to the operation result
   * @throws Error if the operation fails
   */
  async _executeOperation(config) {
    try {
      const result = await this._powerOperationExecutor.execute(config.service, config.action, config.params || []);
      const rawResult = result && typeof result === "object" && "data" in result ? result.data : result;
      const normalizedResult = Array.isArray(rawResult) && rawResult.length === 1 && rawResult[0] && typeof rawResult[0] === "object"
        ? rawResult[0]
        : rawResult;
      if (!normalizedResult || typeof normalizedResult !== "object" || Array.isArray(normalizedResult)) {
        throw new PowerDataRuntimeError(ErrorCodes.InvalidMetadataResponse, JSON.stringify(rawResult));
      }
      const lowerCaseResult = Object.keys(normalizedResult).reduce((acc, key) => {
        acc[key.toLowerCase()] = normalizedResult[key];
        return acc;
      }, {});
      return lowerCaseResult;
    } catch (error) {
      if (error instanceof PowerDataRuntimeError) {
        throw error;
      }
      throw new PowerDataRuntimeError(ErrorCodes.InvalidMetadataResponse, getErrorMessage(error));
    }
  }
};
// Static identifiers for services and actions
// Used to identify specific services and actions within the PowerApps environment
// These identifiers are used to execute operations through the PowerOperationExecutor
// The services provide the functionality for the operations
__publicField(_RuntimeMetadataClient, "SERVICES", {
  powerAppsClient: "AppPowerAppsClientPlugin"
});
// The actions define the specific operations to be performed
__publicField(_RuntimeMetadataClient, "ACTIONS", {
  getConnectionConfigs: "loadAppConnectionsAsync_v2",
  getDataSourceConfigs: "getAppCdsDataSourceConfigsAsync"
});
var RuntimeMetadataClient = _RuntimeMetadataClient;

var RuntimeClientProvider = class {
  // Constructor for RuntimeClientProvider
  // Accepts an optional IPowerOperationExecutor instance for executing operations
  // If not provided, uses the default PowerOperationExecutor instance
  constructor(powerOperationExecutor) {
    // Private members for data and metadata clients
    // The data client is responsible for handling data operations
    __publicField(this, "_dataClient");
    // The metadata client is responsible for handling metadata operations
    __publicField(this, "_metadataClient");
    // The operation executor is used to execute operations on the clients
    // It is an instance of IPowerOperationExecutor, which provides the necessary methods for executing operations
    __publicField(this, "_operationExecutor");
    this._operationExecutor = powerOperationExecutor;
  }
  /**
   * Gets or initializes the data client
   * @throws Error if client initialization fails
   * @returns Promise resolving to IRuntimeDataClient
   */
  async getDataClientAsync() {
    try {
      if (!this._dataClient) {
        this._dataClient = await this._initializeDataClient();
      }
      if (!this._dataClient) {
        throw new PowerDataRuntimeError(ErrorCodes.DataClientNotInitialized);
      }
      return this._dataClient;
    } catch (error) {
      throw new PowerDataRuntimeError(ErrorCodes.DataClientInitFailed, getErrorMessage(error));
    }
  }
  /**
   * Gets or initializes the metadata client
   * @throws Error if client initialization fails
   * @returns Promise resolving to IRuntimeMetadataClient
   */
  async getMetadataClientAsync() {
    try {
      if (!this._metadataClient) {
        this._metadataClient = await this._initializeMetadataClient();
      }
      if (!this._metadataClient) {
        throw new PowerDataRuntimeError(ErrorCodes.MetadataClientNotInitialized);
      }
      return this._metadataClient;
    } catch (error) {
      throw new PowerDataRuntimeError(ErrorCodes.MetadataClientInitFailed, getErrorMessage(error));
    }
  }
  /**
   * Initializes the data client
   * @returns Promise resolving to IRuntimeDataClient
   */
  async _initializeDataClient() {
    return RuntimeDataClient.createInstanceAsync(this._operationExecutor);
  }
  /**
   * Initializes the metadata client
   * @returns Promise resolving to IRuntimeMetadataClient
   */
  async _initializeMetadataClient() {
    return RuntimeMetadataClient.createInstanceAsync(this._operationExecutor);
  }
  /**
   * Resets both clients, forcing re-initialization on next use
   * Useful for testing or recovering from error states
   */
  reset() {
    this._dataClient = void 0;
    this._metadataClient = void 0;
  }
};

function convertOptionsToQueryString(options) {
  if (!options) {
    return "";
  }
  const parts = [];
  if (options.select && options.select.length > 0) {
    parts.push(`$select=${encodeURIComponent(options.select.map((s) => s.trim().replace(/%20/g, "+").replace(/'/g, "%27")).join(","))}`);
  }
  if (options.filter) {
    const encodedFilter = encodeURIComponent(options.filter.trim()).replace(/%20/g, "+").replace(/'/g, "%27");
    parts.push(`$filter=${encodedFilter}`);
  }
  if (options.orderBy && options.orderBy.length > 0) {
    parts.push(`$orderby=${encodeURIComponent(options.orderBy.map((s) => s.trim().replace(/%20/g, "+").replace(/'/g, "%27")).join(","))}`);
  }
  if (options.top !== void 0 && options.top !== null) {
    parts.push(`$top=${options.top}`);
  }
  if (options.skip !== void 0 && options.skip !== null) {
    parts.push(`$skip=${options.skip}`);
  }
  if (options.count !== void 0 && options.count !== null) {
    parts.push(`$count=${options.count}`);
  }
  if (options.skipToken && options.skipToken.trim() !== "") {
    parts.push(`$skiptoken=${encodeURIComponent(options.skipToken.trim())}`);
  }
  return parts.length ? `?${parts.join("&")}` : "";
}

var ODATA_NEXT_LINK = "@odata.nextLink";
var DataverseDataOperationExecutor = class {
  constructor(clientProvider) {
    // Static identifiers for services and actions
    // Used to identify specific services and actions within the PowerApps environment
    __publicField(this, "_clientProvider");
    __publicField(this, "_databaseReferences");
    this._clientProvider = clientProvider;
  }
  /**
   * Creates a new record in Dataverse
   * @param tableName - The name of the table
   * @param data - The record data to create
   * @returns Promise resolving to operation result
   */
  async createRecordAsync(tableName, data) {
    return this._executeNativeDataverseOperation(tableName, (dataSourceInfo, tblName) => this._getDataverseRequestUrl(dataSourceInfo, tblName), async (dataClient, requestUrl, dataSourceInfo) => {
      const dataverseResponse = await dataClient.createDataAsync(
        requestUrl,
        DataSources.Dataverse,
        // Use environment name for Dataverse authentication
        tableName,
        data,
        {
          operationName: DataverseOperationName.CreateRecord,
          datasetName: dataSourceInfo.datasetName,
          isDataVerseOperation: true
        }
      );
      const returnValue = {
        success: dataverseResponse.success,
        data: dataverseResponse.data,
        error: dataverseResponse.error
      };
      return returnValue;
    }, DataOperationErrorMessages.CreateFailed);
  }
  /**
   * Updates an existing record in Dataverse
   * @param tableName - The name of the table
   * @param id - The record identifier
   * @param data - The updated record data
   * @returns Promise resolving to operation result
   */
  async updateRecordAsync(tableName, id, data) {
    return this._executeNativeDataverseOperation(tableName, (dataSourceInfo, tblName) => this._getDataverseRequestUrl(dataSourceInfo, tblName, `(${id})`), async (dataClient, requestUrl, dataSourceInfo) => {
      const dataverseResponse = await dataClient.updateDataAsync(requestUrl, DataSources.Dataverse, tableName, data, {
        operationName: DataverseOperationName.UpdateRecord,
        datasetName: dataSourceInfo.datasetName,
        isDataVerseOperation: true
      });
      const returnValue = {
        success: dataverseResponse.success,
        data: dataverseResponse.data,
        error: dataverseResponse.error
      };
      return returnValue;
    }, DataOperationErrorMessages.UpdateFailed);
  }
  /**
   * Deletes a record from Dataverse
   * @param tableName - The name of the table
   * @param id - The record identifier
   * @returns Promise resolving to operation result
   */
  async deleteRecordAsync(tableName, id) {
    return this._executeNativeDataverseOperation(tableName, (dataSourceInfo, tblName) => this._getDataverseRequestUrl(dataSourceInfo, tblName, `(${id})`), async (dataClient, requestUrl, dataSourceInfo) => {
      const dataverseResponse = await dataClient.deleteDataAsync(requestUrl, DataSources.Dataverse, tableName, {
        operationName: DataverseOperationName.DeleteRecord,
        datasetName: dataSourceInfo.datasetName,
        isDataVerseOperation: true
      });
      const returnValue = {
        success: dataverseResponse.success,
        data: dataverseResponse.data,
        error: dataverseResponse.error
      };
      return returnValue;
    }, DataOperationErrorMessages.DeleteFailed);
  }
  /**
   * Retrieves a single record from Dataverse
   * @param tableName - The name of the table
   * @param id - The record identifier
   * @param options - The retrieval options
   * @returns Promise resolving to operation result
   */
  async retrieveRecordAsync(tableName, id, options) {
    const { maxPageSize = 500, ...rest } = options || {};
    const optionsString = convertOptionsToQueryString(rest);
    const headers = { Prefer: `odata.maxpagesize=${maxPageSize},odata.include-annotations=*` };
    return this._executeNativeDataverseOperation(tableName, (dataSourceInfo, tblName) => this._getDataverseRequestUrl(dataSourceInfo, tblName, `(${id})${optionsString}`), async (dataClient, requestUrl, dataSourceInfo) => {
      const dataverseResponse = await dataClient.retrieveDataAsync(
        requestUrl,
        DataSources.Dataverse,
        tableName,
        HttpMethod.GET,
        headers,
        void 0,
        // No body for GET requests
        {
          operationName: DataverseOperationName.RetrieveRecord,
          datasetName: dataSourceInfo.datasetName,
          isDataVerseOperation: true
        }
      );
      const returnValue = {
        success: dataverseResponse.success,
        data: dataverseResponse.data,
        error: dataverseResponse.error
      };
      return returnValue;
    }, DataOperationErrorMessages.RetrieveFailed);
  }
  /**
   * Retrieves multiple records from Dataverse
   * @param tableName - The name of the table
   * @param options - The retrieval options
   * @param maxPageSize - Optional maximum page size
   * @returns Promise resolving to operation result
   */
  async retrieveMultipleRecordsAsync(tableName, options) {
    const { maxPageSize = 500, ...rest } = options || {};
    const optionsString = convertOptionsToQueryString(rest);
    const headers = { Prefer: `odata.maxpagesize=${maxPageSize},odata.include-annotations=*` };
    return this._executeNativeDataverseOperation(tableName, (dataSourceInfo, tblName) => this._getDataverseRequestUrl(dataSourceInfo, tblName, optionsString), async (dataClient, requestUrl, dataSourceInfo) => {
      const dataverseResponse = await dataClient.retrieveDataAsync(
        requestUrl,
        DataSources.Dataverse,
        tableName,
        HttpMethod.GET,
        headers,
        void 0,
        // No body for GET requests
        {
          operationName: DataverseOperationName.RetrieveMultipleRecords,
          datasetName: dataSourceInfo.datasetName,
          isDataVerseOperation: true
        }
      );
      const returnValue = {
        success: dataverseResponse.success,
        data: dataverseResponse?.data?.value || [],
        skipToken: extractSkipToken(dataverseResponse?.data?.[ODATA_NEXT_LINK]),
        error: dataverseResponse.error
      };
      return returnValue;
    }, DataOperationErrorMessages.RetrieveMultipleFailed);
  }
  /**
   * Executes a custom Dataverse operation
   * @param operation - The operation to execute
   * @returns Promise resolving to operation result
   */
  async executeAsync(operation) {
    const { dataverseRequest } = operation;
    if (!dataverseRequest) {
      return {
        success: false,
        data: null,
        error: { message: "Dataverse request details are required for Dataverse operations." }
      };
    }
    const { action, parameters } = dataverseRequest;
    switch (action) {
      // Future custom actions can be handled here
      case "getEntityMetadata":
        const { tableName, options } = parameters;
        if (!tableName) {
          return {
            success: false,
            data: null,
            error: { message: "Table name is required for getEntityMetadata action." }
          };
        }
        return this._getEntityMetadata(tableName, options ?? {});
      default:
        Log.trackEvent("DataverseDataOperation.UnsupportedAction", {
          message: `Unsupported Dataverse action: ${action}`
        });
        return {
          success: false,
          data: null,
          error: { message: `Unsupported Dataverse action: "${action}"` }
        };
    }
  }
  async _getEntityMetadata(tableName, options) {
    const client = await this._getDataClient();
    const dataSourceInfo = await this._getDataverseDataSourceInfo(tableName);
    const url = this._generateMetadataRequestUrl(dataSourceInfo, options);
    return client.retrieveDataAsync(url, DataSources.Dataverse, "EntityDefinitions", HttpMethod.GET, {
      Consistency: "Strong"
      // Force CDS to return latest metadata
    }, void 0, {
      operationName: DataverseOperationName.RetrieveRecord,
      datasetName: dataSourceInfo.datasetName,
      isDataVerseOperation: true
    });
  }
  /**
   * Returns the database references for Dataverse, grouped by environment/database.
   * These come from the launch app response via runtime metadata client.
   */
  async getDatabaseReferences() {
    if (this._databaseReferences) {
      return this._databaseReferences;
    }
    const runtimeDatabaseReferences = await this._loadDatabaseReferencesFromRuntime();
    if (runtimeDatabaseReferences && Object.keys(runtimeDatabaseReferences).length > 0) {
      this._databaseReferences = runtimeDatabaseReferences;
      return this._databaseReferences;
    }
    throw new PowerDataRuntimeError(ErrorCodes.DataSourceNotFound, "Failed to load Dataverse database references from runtime.");
  }
  /**
   * Loads database references from runtime metadata client (launch app response).
   */
  async _loadDatabaseReferencesFromRuntime() {
    try {
      const metadataClient = await this._getMetadataClient();
      const response = await metadataClient.getAppDataSourceConfigsAsync();
      if (!response.success || !response.data) {
        return void 0;
      }
      const cdsDataSources = Object.values(response.data);
      if (cdsDataSources.length === 0) {
        return void 0;
      }
      const databaseReferences = {};
      for (const cdsDataSource of cdsDataSources) {
        const cdsConfig = cdsDataSource;
        const instanceUrl = this._extractInstanceUrlFromRuntimeUrl(cdsConfig.runtimeUrl);
        const envName = "default.cds";
        if (!databaseReferences[envName]) {
          databaseReferences[envName] = {
            databaseDetails: {
              referenceType: "Environmental",
              environmentName: envName,
              overrideValues: {
                status: "NotSpecified",
                environmentVariableName: ""
              },
              linkedEnvironmentMetadata: {
                resourceId: "",
                friendlyName: "",
                uniqueName: "",
                domainName: "",
                version: cdsConfig.version || "9.2",
                instanceUrl,
                instanceApiUrl: cdsConfig.runtimeUrl,
                baseLanguage: 1033,
                instanceState: "Ready",
                createdTime: "",
                platformSku: ""
              }
            },
            dataSources: {}
          };
        }
        const dataSourceName = cdsConfig.entitySetName || cdsConfig.logicalName;
        databaseReferences[envName].dataSources[dataSourceName] = {
          entitySetName: cdsConfig.entitySetName,
          logicalName: cdsConfig.logicalName,
          isHidden: false
        };
      }
      return databaseReferences;
    } catch (error) {
      Log.trackEvent("DataverseDataOperation.FailedToLoadDatabaseReferences", {
        message: "[DataverseDataOperation] Failed to load database references from runtime",
        error
      });
      return void 0;
    }
  }
  _extractInstanceUrlFromRuntimeUrl(runtimeUrl) {
    try {
      const matches = runtimeUrl.match(/^(https?:\/\/[^\/]+)/);
      return matches ? matches[1] : runtimeUrl;
    } catch (error) {
      Log.trackEvent("DataverseDataOperation.FailedToExtractInstanceUrl", {
        message: "[DataverseDataOperation] Failed to extract instance URL from runtime URL",
        error
      });
      return runtimeUrl;
    }
  }
  /**
   * Helper to get a native data client and database reference
   */
  async _getDataClient() {
    const dataClient = await this._clientProvider.getDataClientAsync();
    if (!dataClient) {
      Log.trackEvent("DataverseDataOperation.DataClientNotAvailable", {
        message: "[DataverseDataOperation] Data client is not available"
      });
      throw new PowerDataRuntimeError(ErrorCodes.DataClientNotAvailable, "Data client is not available.");
    }
    return dataClient;
  }
  /**
   * Gets the metadata client instance
   */
  async _getMetadataClient() {
    const metadataClient = await this._clientProvider.getMetadataClientAsync();
    if (!metadataClient) {
      Log.trackEvent("DataverseDataOperation.MetadataClientNotAvailable", {
        message: "[DataverseDataOperation] Metadata client is not available"
      });
      throw new PowerDataRuntimeError(ErrorCodes.MetadataClientNotAvailable);
    }
    return metadataClient;
  }
  /**
   * Template method for connector-style CRUD operations to reduce duplication.
   * Handles client, dataSourceInfo, requestUrl, and error handling.
   */
  async _executeNativeDataverseOperation(tableName, buildUrl, operation, errorMessage) {
    try {
      const dataClient = await this._getDataClient();
      const dataSourceInfo = await this._getDataverseDataSourceInfo(tableName);
      const requestUrl = buildUrl(dataSourceInfo, tableName);
      return operation(dataClient, requestUrl, dataSourceInfo);
    } catch (error) {
      return createErrorResponse(error, errorMessage);
    }
  }
  /**
   * Helper to get the Dataverse datasourceinfo from databaseReferences
   */
  async _getDataverseDataSourceInfo(tableName) {
    let dbRefs;
    try {
      dbRefs = await this.getDatabaseReferences();
    } catch (error) {
      Log.trackEvent("DataverseDataOperation.GetDataSourceInfoFailed", {
        message: "[DataverseDataOperation] Failed to get database references",
        tableName,
        error
      });
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new PowerDataRuntimeError(ErrorCodes.DataSourceNotFound, `Failed to get Dataverse data source info for table '${tableName}': ${errorMessage}`);
    }
    for (const dbKey of Object.keys(dbRefs)) {
      const db = dbRefs[dbKey];
      if (db.dataSources[tableName]) {
        const ds = db.dataSources[tableName];
        return {
          datasetName: db.databaseDetails?.environmentName,
          referenceType: db.databaseDetails?.referenceType,
          linkedEnvironmentMetadata: db.databaseDetails?.linkedEnvironmentMetadata,
          entitySetName: ds?.entitySetName,
          logicalName: ds?.logicalName,
          isHidden: ds?.isHidden,
          tableId: ds?.logicalName,
          apis: {}
        };
      }
    }
    const notFoundMsg = `No Dataverse data source found for table: ${tableName}`;
    Log.trackEvent("DataverseDataOperation.DataSourceNotFound", {
      message: notFoundMsg,
      tableName
    });
    throw new PowerDataRuntimeError(ErrorCodes.DataSourceNotFound, notFoundMsg);
  }
  /**
   * Helper to construct the Dataverse API URL using instanceUrl if available, otherwise fallback to runtimeUrl.
   */
  _getInstanceUrl(dataSourceInfo) {
    const instanceUrl = dataSourceInfo.linkedEnvironmentMetadata?.instanceUrl;
    if (!instanceUrl) {
      throw new PowerDataRuntimeError(ErrorCodes.DataClientInitFailed, "No instanceUrl found for Dataverse table.");
    }
    const baseUrl = instanceUrl.endsWith("/") ? instanceUrl : `${instanceUrl}/`;
    return baseUrl;
  }
  /**
   * Helper to construct the Dataverse API URL using instanceUrl if available, otherwise fallback to runtimeUrl.
   */
  _getDataverseRequestUrl(dataSourceInfo, tableName, urlPath = "") {
    const baseUrl = this._getInstanceUrl(dataSourceInfo);
    return `${baseUrl}api/data/v9.0/${tableName}${urlPath}`;
  }
  /**
   * Constructs GET request URL for fetching metadata using options object.
   * @param dataSourceInfo - The data source information for the Dataverse table.
   * @param options - The options for the metadata request.
   * @returns The constructed metadata request URL.
   */
  _generateMetadataRequestUrl(dataSourceInfo, options) {
    const { logicalName } = dataSourceInfo;
    if (!logicalName) {
      throw new PowerDataRuntimeError(ErrorCodes.DataClientInitFailed, "No logicalName found for Dataverse table.");
    }
    const url = new URL(`${this._getInstanceUrl(dataSourceInfo)}api/data/v9.0/EntityDefinitions(LogicalName='${logicalName}')`);
    const { metadata, schema } = options;
    const selects = new Set(Array.isArray(metadata) ? metadata : []);
    selects.add("LogicalName");
    const expands = [];
    if (schema?.manyToOne) {
      expands.push("ManyToOneRelationships");
    }
    if (schema?.oneToMany) {
      expands.push("OneToManyRelationships");
    }
    if (schema?.manyToMany) {
      expands.push("ManyToManyRelationships");
    }
    if (schema?.columns === "all") {
      expands.push("Attributes");
    } else if (schema && Array.isArray(schema.columns) && schema.columns.length > 0) {
      const attributesCollection = schema.columns.map((a) => `'${a}'`).join(",");
      expands.push(`Attributes($filter=Microsoft.Dynamics.CRM.In(PropertyName='LogicalName',PropertyValues=[${attributesCollection}]))`);
    }
    url.search = new URLSearchParams({
      $select: [...selects].join(","),
      $expand: expands.join(",")
    }).toString();
    return url.toString();
  }
};
function extractSkipToken(nextLink) {
  if (!nextLink?.trim()) {
    return void 0;
  }
  const match = nextLink.match(/[\?&]\$?skiptoken=([^&#]+)/i);
  return match ? decodeURIComponent(match[1]) : void 0;
}

var ConnectorDataOperationExecutor = class {
  // =====================================
  // Constructor
  // =====================================
  constructor(clientProvider, connectionsService) {
    // =====================================
    // Private Members
    // =====================================
    __publicField(this, "_clientProvider");
    __publicField(this, "_connectionsService");
    __publicField(this, "_databaseReferences");
    __publicField(this, "_connectionReferences");
    this._validateConstructorParams(clientProvider, connectionsService);
    this._clientProvider = clientProvider;
    this._connectionsService = connectionsService;
  }
  // =====================================
  // Public Methods
  // =====================================
  /**
   * Creates a new record in the specified table
   */
  async createRecordAsync(tableName, data) {
    try {
      const { dataClient, connectionReference } = await this._getClientsAndConnection(tableName);
      const requestUrl = await this._buildTableUrl(tableName, connectionReference);
      const result = await dataClient.createDataAsync(requestUrl, connectionReference.apiId, tableName, data, { operationName: ConnectorOperationName.CreateRecord });
      return result;
    } catch (error) {
      return createErrorResponse(error, DataOperationErrorMessages.CreateFailed);
    }
  }
  /**
   * Updates an existing record in the specified table
   */
  async updateRecordAsync(tableName, id, data) {
    try {
      const { dataClient, connectionReference } = await this._getClientsAndConnection(tableName);
      const requestUrl = await this._buildTableUrl(tableName, connectionReference, `/${id}`);
      const result = await dataClient.updateDataAsync(requestUrl, connectionReference.apiId, tableName, data, { operationName: ConnectorOperationName.UpdateRecord });
      return result;
    } catch (error) {
      return createErrorResponse(error, DataOperationErrorMessages.UpdateFailed);
    }
  }
  /**
   * Deletes a record from the specified table
   */
  async deleteRecordAsync(tableName, id) {
    try {
      const { dataClient, connectionReference } = await this._getClientsAndConnection(tableName);
      const requestUrl = await this._buildTableUrl(tableName, connectionReference, `/${id}`);
      const result = await dataClient.deleteDataAsync(requestUrl, connectionReference.apiId, tableName, { operationName: ConnectorOperationName.DeleteRecord });
      return result;
    } catch (error) {
      return createErrorResponse(error, DataOperationErrorMessages.DeleteFailed);
    }
  }
  /**
   * Retrieves a single record from the specified table
   */
  async retrieveRecordAsync(tableName, id, options) {
    try {
      const { dataClient, connectionReference } = await this._getClientsAndConnection(tableName);
      const requestUrl = await this._buildTableUrl(tableName, connectionReference, `/${id}${convertOptionsToQueryString(options)}`);
      const result = await dataClient.retrieveDataAsync(
        requestUrl,
        connectionReference.apiId,
        tableName,
        HttpMethod.GET,
        void 0,
        // body
        { operationName: ConnectorOperationName.RetrieveRecord }
      );
      return result;
    } catch (error) {
      return createErrorResponse(error, DataOperationErrorMessages.RetrieveFailed);
    }
  }
  /**
   * Retrieves multiple records from the specified table
   */
  async retrieveMultipleRecordsAsync(tableName, options) {
    try {
      const { dataClient, connectionReference } = await this._getClientsAndConnection(tableName);
      const requestUrl = await this._buildTableUrl(tableName, connectionReference, convertOptionsToQueryString(options), false);
      const result = await dataClient.retrieveDataAsync(
        requestUrl,
        connectionReference.apiId,
        tableName,
        HttpMethod.GET,
        void 0,
        // body
        { operationName: ConnectorOperationName.RetrieveMultipleRecords }
      );
      return result;
    } catch (error) {
      return createErrorResponse(error, DataOperationErrorMessages.RetrieveMultipleFailed);
    }
  }
  /**
   * Executes a custom operation on the data source
   */
  async executeAsync(operation) {
    try {
      if (!operation?.connectorOperation) {
        throw new Error(`${DataOperationErrorMessages.InvalidRequest}: ${DataOperationErrorMessages.MissingConnectorOperation}`);
      }
      const tableName = operation.connectorOperation.tableName;
      const dataSourceInfo = await this._connectionsService.getDataSource(tableName);
      const { dataClient, connectionReference } = await this._getClientsAndConnection(tableName);
      const config = await this._getOperationConfig(operation, connectionReference, tableName);
      const requestUrl = await this._buildOperationUrl(operation, config);
      const bodyParam = await this._buildOperationBody(operation, tableName);
      const headers = await this._buildOperationHeader(operation, tableName);
      const httpMethod = this._getHttpMethod(requestUrl, dataSourceInfo, operation.connectorOperation.operationName);
      const responseInfo = dataSourceInfo.apis[operation.connectorOperation.operationName]?.responseInfo;
      const result = await dataClient.retrieveDataAsync(requestUrl, config.apiId, tableName, httpMethod, headers, bodyParam, {
        isExecuteAsync: true,
        // Use the connector operation name for telemetry, may be a better idea to use executeAsync
        // here and just log the connector operation name in the custom dimensions leaving comment for PR.
        operationName: `connectorDataOperation.${operation.connectorOperation.operationName}`,
        responseInfo
      });
      return result;
    } catch (error) {
      return createErrorResponse(error, DataOperationErrorMessages.ExecuteFailed);
    }
  }
  // =====================================
  // Private Methods
  // =====================================
  /**
   * Determines the appropriate HTTP method for a request
   * @param requestUrl - The URL for the request
   * @param dataSourceInfo - The data source information
   * @param operation - The operation name
   * @returns The HTTP method to use
   */
  _getHttpMethod(requestUrl, dataSourceInfo, operation) {
    const isSqlStoredProcedure = requestUrl.indexOf("apim/sql") > -1;
    if (isSqlStoredProcedure) {
      return HttpMethod.POST;
    }
    const method = dataSourceInfo.apis[operation]?.method;
    if (method) {
      return method;
    }
    return HttpMethod.GET;
  }
  /**
   * Builds the operation body parameters
   */
  async _buildOperationBody(operation, tableName) {
    const operationName = operation?.connectorOperation?.operationName;
    if (operationName) {
      const dataSourceInfo = await this._connectionsService.getDataSource(tableName);
      const hasBodyParameter = dataSourceInfo?.apis?.[operationName]?.parameters?.some((param) => param.in === "body");
      if (hasBodyParameter) {
        return await this._buildOperationBodyParam(operation, tableName);
      }
    }
    return void 0;
  }
  /**
   * Builds operation body parameters from the operation and data source info
   */
  async _buildOperationBodyParam(operation, tableName) {
    const operationName = operation.connectorOperation?.operationName;
    if (!operationName) {
      return "{}";
    }
    const dataSourceInfo = await this._connectionsService.getDataSource(tableName);
    const apiParams = dataSourceInfo?.apis?.[operationName]?.parameters || [];
    const rawParams = operation.connectorOperation?.parameters || [];
    if (typeof rawParams !== "object" || rawParams === null) {
      return "{}";
    }
    const bodyParam = apiParams.find((param) => param.in === "body");
    if (bodyParam) {
      const value = rawParams[bodyParam.name];
      if (value !== void 0 && value !== null) {
        return JSON.stringify(value);
      }
    }
    return "{}";
  }
  /**
   * Builds the operation header for a given data operation if required.
   *
   * @template TRequest - The type of the request payload for the data operation.
   * @param dataOperationRequest - The data operation containing details about the connector operation.
   * @param tableName - The name of the table associated with the data operation.
   * @returns A promise that resolves to the operation header as a string if a header parameter is required,
   *          or `undefined` if no header parameter is needed.
   */
  async _buildOperationHeader(dataOperationRequest, tableName) {
    const operationName = dataOperationRequest.connectorOperation?.operationName;
    if (operationName) {
      const dataSourceInfo = await this._connectionsService.getDataSource(tableName);
      const hasHeaderParameter = dataSourceInfo?.apis?.[operationName]?.parameters?.some((param) => param.in === "header");
      if (hasHeaderParameter) {
        return await this._buildOperationHeaderParam(dataOperationRequest, tableName);
      }
    }
    return void 0;
  }
  /**
   * Builds the operation header parameters as a JSON string for a given data operation.
   *
   * @template TRequest - The type of the request object for the data operation.
   * @param dataOperationRequest - The data operation containing connector operation details and parameters.
   * @param tableName - The name of the table associated with the data operation.
   * @returns A promise that resolves to a JSON string representing the header parameters,
   *          or `undefined` if no `header` parameters are available.
   */
  async _buildOperationHeaderParam(dataOperationRequest, tableName) {
    const operationName = dataOperationRequest.connectorOperation?.operationName;
    if (!operationName) {
      return {};
    }
    const dataSourceInfo = await this._connectionsService.getDataSource(tableName);
    const apiParamSpec = dataSourceInfo?.apis?.[operationName]?.parameters || [];
    const inputParams = dataOperationRequest.connectorOperation?.parameters;
    const headers = {};
    if (!inputParams) {
      return void 0;
    }
    if (typeof inputParams === "string") {
      if (apiParamSpec.length === 1 && apiParamSpec[0].in === "header") {
        headers[apiParamSpec[0].name] = inputParams;
      }
    }
    if (typeof inputParams === "object" && !Array.isArray(inputParams)) {
      apiParamSpec.forEach((param) => {
        if (param.in === "header" && param.name in inputParams) {
          headers[param.name] = inputParams[param.name];
        }
      });
    }
    if (Array.isArray(inputParams)) {
      apiParamSpec.forEach((param, index) => {
        if (param.in === "header" && inputParams[index] !== void 0) {
          headers[param.name] = inputParams[index];
        }
      });
    }
    return headers;
  }
  /**
   * Constructs the request URL for table operations
   * @param tableName - The name of the table
   * @param connectionReference - The connection reference
   * @param options - Optional URL parameters
   * @param encodeOptions - Whether to encode the options
   * @returns The constructed URL
   */
  async _buildTableUrl(tableName, connectionReference, options = "", encodeOptions = true) {
    const dataSourceInfo = await this._connectionsService.getDataSource(tableName);
    const isSharedSql = (connectionReference.apiId ?? "").indexOf("shared_sql") > -1;
    const isSharePoint = (connectionReference.apiId ?? "").indexOf("shared_sharepointonline") > -1;
    const urlBuilder = {
      runtimeUrl: connectionReference.runtimeUrl ?? "",
      connectionName: connectionReference.connectionName ?? "",
      datasetName: connectionReference.datasetName ? isSharedSql ? connectionReference.datasetNameOverride : isSharePoint ? encodeURIComponent(encodeURIComponent(connectionReference.datasetName)) : encodeURIComponent(connectionReference.datasetName) : "",
      tableId: isSharedSql ? encodeURIComponent(encodeURIComponent(dataSourceInfo.tableId)) : dataSourceInfo.tableId,
      version: dataSourceInfo.version,
      isSharedSql
    };
    return this._constructUrl(urlBuilder, options, encodeOptions);
  }
  /**
   * Builds the operation URL
   */
  async _buildOperationUrl(operation, config) {
    const operationName = operation.connectorOperation?.operationName;
    if (!operationName) {
      throw new Error(`${DataOperationErrorMessages.InvalidOperationParameters}: ${DataOperationErrorMessages.MissingOperationName}`);
    }
    const dataSourceInfo = await this._connectionsService.getDataSource(config.tableName);
    const isSharedSql = (config.apiId ?? "").indexOf("shared_sql") > -1;
    const path = dataSourceInfo.apis[operationName].path;
    if (isSharedSql) {
      return this._buildSharedSqlOperationUrl(config, path);
    }
    return this._buildStandardOperationUrl(operation, config, operationName, path);
  }
  /**
   * Gets the connection references
   */
  async _getConnectionReferencesAsync() {
    if (this._connectionReferences) {
      return this._connectionReferences;
    }
    const metadataClient = await this._getMetadataClient();
    const response = await metadataClient.getAppConnectionConfigsAsync();
    this._connectionReferences = response.data;
    return this._connectionReferences;
  }
  /**
   * Gets the database references
   */
  async _getDatabaseReferencesAsync() {
    if (this._databaseReferences) {
      return this._databaseReferences;
    }
    const metadataClient = await this._getMetadataClient();
    const response = await metadataClient.getAppDataSourceConfigsAsync();
    this._databaseReferences = response.data;
    return this._databaseReferences;
  }
  /**
   * Gets the metadata client instance
   */
  async _getMetadataClient() {
    const metadataClient = await this._clientProvider.getMetadataClientAsync();
    if (!metadataClient) {
      throw new PowerDataRuntimeError(ErrorCodes.MetadataClientNotAvailable);
    }
    return metadataClient;
  }
  /**
   * Gets the connection reference for a table
   */
  _getConnectionReference(tableName) {
    const connectionReference = this._connectionReferences?.[tableName];
    if (!connectionReference) {
      throw new PowerDataRuntimeError(ErrorCodes.ConnectionReferenceNotFound, tableName);
    }
    return connectionReference;
  }
  /**
   * Gets both the data client and connection reference
   */
  async _getClientsAndConnection(tableName) {
    await this._getReferences();
    const dataClient = await this._clientProvider.getDataClientAsync();
    if (!dataClient) {
      throw new PowerDataRuntimeError(ErrorCodes.DataClientNotAvailable);
    }
    const connectionReference = this._getConnectionReference(tableName);
    return { dataClient, connectionReference };
  }
  /**
   * Builds the URL for shared SQL operations
   */
  _buildSharedSqlOperationUrl(config, path) {
    const version = config.version ? `/${config.version}/` : "/";
    return `${config.runtimeUrl}/${config.connectionName}${version}datasets/${config.datasetName}/procedures${path}`;
  }
  /**
   * Builds the URL for standard operations
   * Assumptions / Invariants:
   *  - The connector always defines a required path parameter for the connection id named 'connectionId'.
   *  - When a dataset is applicable, the parameter name is 'dataset'.
   *  - When a table is applicable, the parameter name is 'tableName'.
   *  - A lone string parameter maps to the first remaining (non-synthetic) required API parameter.
   *  - Array parameters map positionally to the remaining API parameters after filtering.
   *  - Object parameters map by (case-insensitive, hyphen/underscore agnostic) key.
   * @param operation - The data operation containing connector operation details from runtime
   * @param config - The connector operation configuration
   * @param operationName - The name of the operation to be performed
   * @param path - The path template for the operation
   */
  async _buildStandardOperationUrl(operation, config, operationName, path) {
    const dataSourceInfo = await this._connectionsService.getDataSource(config.tableName);
    let apiParams = dataSourceInfo.apis[operationName]?.parameters || [];
    if (apiParams.length > 0) {
      apiParams = apiParams.filter((param) => param.name !== "connectionId" && param.name !== "dataset" && param.name !== "tableName");
    }
    const operationParams = operation.connectorOperation?.parameters;
    const rawParamValues = {
      connectionId: config.connectionName,
      dataset: (
        // The dataset name needs to be double encoded for sharepoint, once here and then once in the HTTP pipeline
        // CRUD operations already handle this, so we need to do the same here
        config.apiId.indexOf("shared_sharepointonline") !== -1 && config.datasetName ? encodeURIComponent(config.datasetName) : config.datasetName
      ),
      tableName: config.tableName
    };
    if (operationParams !== void 0) {
      if (typeof operationParams === "string") {
        if (apiParams.length > 0) {
          const requiredParams = apiParams.filter((param) => param.required);
          rawParamValues[requiredParams?.[0]?.name ?? apiParams[0].name] = operationParams;
        }
      } else if (typeof operationParams === "object" && !Array.isArray(operationParams)) {
        apiParams.forEach((param) => {
          if (operationParams) {
            const value = this._getNormalizedParamValue(operationParams, param.name);
            if (value !== void 0) {
              rawParamValues[param.name] = value;
            }
          }
        });
      } else if (Array.isArray(operationParams)) {
        apiParams.forEach((param, index) => {
          rawParamValues[param.name] = operationParams[index];
        });
      }
    }
    const { processedPath, queryParams } = this._processParameters(
      // deliberately pass the unfiltered list to _processParameters so path placeholders still see synthetic params.
      dataSourceInfo.apis[operationName]?.parameters || [],
      rawParamValues,
      path
    );
    const separator = queryParams ? processedPath.includes("?") ? "&" : "?" : "";
    return `${config.runtimeUrl}${processedPath}${separator}${queryParams}`;
  }
  /**
   * Normalizes the parameter name by replacing hyphens with underscores and performs case-insensitive matching
   */
  _getNormalizedParamValue(obj, paramName) {
    const normalizedParamName = paramName.replace(/-/g, "_").toLowerCase();
    const foundKey = Object.keys(obj).find((key) => key.replace(/-/g, "_").toLowerCase() === normalizedParamName);
    return foundKey !== void 0 ? obj[foundKey] : void 0;
  }
  /**
   * Processes operation parameters into path and query parameters
   * @param apiParams - The API parameter specifications from the data source info
   * @param rawParamValues - The raw parameter values provided in the operation at runtime
   * @param path - The initial path template
   * @returns An object containing the processed path and query parameters
   */
  _processParameters(apiParams, rawParamValues, path) {
    const usedParams = /* @__PURE__ */ new Set();
    let processedPath = path;
    const queryParams = [];
    apiParams.forEach((param, index) => {
      const paramValue = rawParamValues[param.name];
      if (paramValue === void 0) {
        return;
      }
      if (param.in === "path") {
        const placeholder = `{${param.name}}`;
        if (processedPath.includes(placeholder)) {
          processedPath = processedPath.replace(placeholder, encodeURIComponent(String(paramValue)));
          usedParams.add(param.name);
        }
      } else if (param.in === "query") {
        queryParams.push(`${encodeURIComponent(param.name)}=${encodeURIComponent(String(paramValue))}`);
        usedParams.add(param.name);
      }
    });
    return {
      processedPath,
      queryParams: queryParams.join("&")
    };
  }
  /**
   * Gets the operation configuration
   */
  async _getOperationConfig(operation, connectionReference, tableName) {
    if (!operation.connectorOperation) {
      throw new Error(`${DataOperationErrorMessages.InvalidRequest}: ${DataOperationErrorMessages.MissingConnectorOperation}`);
    }
    const dataSourceInfo = await this._connectionsService.getDataSource(tableName);
    const config = {
      tableName,
      apiId: connectionReference.apiId ?? "",
      runtimeUrl: connectionReference.runtimeUrl ?? "",
      connectionName: connectionReference.connectionName ?? "",
      datasetName: connectionReference.datasetName ?? "",
      tableId: dataSourceInfo.tableId,
      version: dataSourceInfo.version
    };
    return config;
  }
  /**
   * Initializes the clients
   */
  async _getReferences() {
    await this._getConnectionReferencesAsync();
    await this._getDatabaseReferencesAsync();
  }
  /**
   * Validates constructor parameters
   */
  _validateConstructorParams(clientProvider, connectionsService) {
    if (!clientProvider) {
      throw new PowerDataRuntimeError(ErrorCodes.ClientProviderNotAvailable);
    }
    if (!connectionsService) {
      throw new PowerDataRuntimeError(ErrorCodes.DataSourceServiceNotAvailable);
    }
  }
  /**
   * Constructs the final URL
   */
  _constructUrl(urlBuilder, options = "", encodeOptions = true) {
    const apiVersion = urlBuilder.version ? `/${urlBuilder.version}/` : "/";
    const encodedOptions = encodeOptions && options ? options.charAt(0) + encodeURIComponent(options.slice(1)) : options;
    if (urlBuilder.datasetName) {
      return `${urlBuilder.runtimeUrl}/${urlBuilder.connectionName}${apiVersion}datasets/${urlBuilder.datasetName}/tables/${urlBuilder.tableId}/items${encodedOptions}`;
    }
    return `${urlBuilder.runtimeUrl}/${urlBuilder.connectionName}/tables/${urlBuilder.tableId}/items${encodedOptions}`;
  }
};

var DataSourceServiceError;
/* @__PURE__ */ (function(DataSourceServiceError2) {
})(DataSourceServiceError || (DataSourceServiceError = {}));
var RuntimeDataSourceService = class {
  /**
   * Creates a new instance of RuntimeDataSourceService
   */
  constructor(_powerDataSourcesInfoProvider) {
    __publicField(this, "_powerDataSourcesInfoProvider");
    /**
     * Data source information
     */
    __publicField(this, "_dataSourcesInfo");
    /**
     * Indicates whether the service has been initialized
     */
    __publicField(this, "_isInitialized");
    this._powerDataSourcesInfoProvider = _powerDataSourcesInfoProvider;
    this._dataSourcesInfo = {};
    this._isInitialized = false;
  }
  /**
   * Initializes the service by loading user data sources
   * @throws PowerDataRuntimeError if initialization fails
   */
  async initialize() {
    try {
      const userDataSources = await this._getUserDataSources();
      this._dataSourcesInfo = {};
      Object.keys(userDataSources).forEach((key) => {
        this._dataSourcesInfo[key] = userDataSources[key];
      });
      this._isInitialized = true;
    } catch (error) {
      throw new PowerDataRuntimeError(ErrorCodes.InitializationError, getErrorMessage(error));
    }
  }
  /**
   * Gets all user data sources
   * @returns Array of data source information
   * @throws PowerDataRuntimeError if service is not initialized
   */
  async getUserDataSources() {
    await this._ensureInitialized();
    return this._dataSourcesInfo;
  }
  /**
   * Gets information for a specific data source
   * @param dataSource - The ID of the data source
   * @returns Data source information
   * @throws PowerDataRuntimeError if data source is not found or service is not initialized
   */
  async getDataSource(dataSource) {
    await this._ensureInitialized();
    const dataSourceInfo = this._dataSourcesInfo[dataSource];
    if (!dataSourceInfo) {
      const errorMessage = `Unable to find data source: ${dataSource} in data sources info.`;
      throw new PowerDataRuntimeError(ErrorCodes.DataSourceNotFound, errorMessage);
    }
    return dataSourceInfo;
  }
  /**
   * Checks if a data source exists
   * @param dataSourceId - The ID of the data source to check
   * @returns True if the data source exists, false otherwise
   * @throws PowerDataRuntimeError if service is not initialized
   */
  async hasDataSource(dataSource) {
    await this._ensureInitialized();
    return dataSource in this._dataSourcesInfo;
  }
  /**
   * Ensures the service is initialized
   * @throws PowerDataRuntimeError if service is not initialized
   */
  async _ensureInitialized() {
    if (!this._isInitialized) {
      await this.initialize();
    }
  }
  /**
   * Gets user data sources from the provided data source schemas
   * @returns Promise resolving to array of data source information
   */
  async _getUserDataSources() {
    const dataSourcesInfo = await this._powerDataSourcesInfoProvider.getDataSourcesInfo();
    return Promise.resolve(dataSourcesInfo);
  }
};

var PowerDataRuntime = class {
  /**
   * Creates a new instance of PowerDataRuntime
   * @param params - Initialization parameters
   * @throws DataRuntimeError if initialization fails
   */
  constructor(params) {
    __publicField(this, "_clientProvider");
    __publicField(this, "_dataSourceService");
    __publicField(this, "_dataOperations");
    __publicField(this, "_metadataOperations");
    __publicField(this, "_isInitialized");
    try {
      Log.createInstance(params.powerOperationExecutor);
      this._clientProvider = new RuntimeClientProvider(params.powerOperationExecutor);
      this._dataSourceService = new RuntimeDataSourceService(params.powerDataSourcesInfoProvider);
      this._isInitialized = false;
      this._initialize();
    } catch (error) {
      if (error instanceof Error) {
        Log.trackException(error);
      }
      throw error;
    }
  }
  /**
   * Gets the Data operations interface
   * @throws PowerDataRuntimeError if operations are not initialized
   */
  get Data() {
    this._ensureInitialized();
    if (!this._dataOperations) {
      this._dataOperations = this._createDataOperations();
    }
    return this._dataOperations;
  }
  /**
   * Gets the Metadata operations interface
   * @throws PowerDataRuntimeError if operations are not initialized
   */
  get Metadata() {
    this._ensureInitialized();
    if (!this._metadataOperations) {
      this._metadataOperations = this._createMetadataOperations();
    }
    return this._metadataOperations;
  }
  /**
   * Ensures the PowerDataRuntime is initialized
   * @throws PowerDataRuntimeError if not initialized
   */
  _ensureInitialized() {
    if (!this._isInitialized) {
      throw new PowerDataRuntimeError(ErrorCodes.OperationsNotInitialized);
    }
  }
  /**
   * Initializes the PowerDataRuntime components
   * @throws PowerDataRuntimeError if initialization fails
   */
  _initialize() {
    try {
      this._dataOperations = this._createDataOperations();
      this._metadataOperations = this._createMetadataOperations();
      this._isInitialized = true;
    } catch (error) {
      throw new PowerDataRuntimeError(ErrorCodes.InitializationFailed, getErrorMessage(error));
    }
  }
  /**
   * Creates a new instance of DataOperations
   */
  _createDataOperations() {
    const dataverseOperation = new DataverseDataOperationExecutor(this._clientProvider);
    const connectorOperation = new ConnectorDataOperationExecutor(this._clientProvider, this._dataSourceService);
    return new DefaultDataOperationOrchestrator(dataverseOperation, connectorOperation, this._dataSourceService);
  }
  /**
   * Creates a new instance of MetadataOperations
   */
  _createMetadataOperations() {
    return new RuntimeMetadataOperations(this._clientProvider);
  }
};

var powerDataRuntimeInstance;
function getPowerDataRuntime(powerDataSourcesInfoProvider, powerOperationExecutor) {
  if (!powerDataRuntimeInstance) {
    powerDataRuntimeInstance = new PowerDataRuntime({
      powerDataSourcesInfoProvider,
      powerOperationExecutor
    });
  }
  return powerDataRuntimeInstance;
}

var _PowerDataSourcesInfoProvider = class _PowerDataSourcesInfoProvider {
  /**
   * Private constructor to enforce the singleton pattern.
   * @param dataSourcesInfo The data sources information to initialize the provider with.
   */
  constructor(dataSourcesInfo) {
    __publicField(this, "dataSourcesInfo");
    this.dataSourcesInfo = dataSourcesInfo;
  }
  /**
   * Retrieves the singleton instance of PowerDataSourcesInfoProvider.
   * If the instance does not exist, it initializes it with the provided data sources info.
   *
   * @param dataSourcesInfo Optional parameter to initialize the instance if it doesn't exist.
   * @returns The singleton instance of PowerDataSourcesInfoProvider.
   * @throws Error if the instance is not initialized and no dataSourcesInfo is provided.
   */
  static getInstance(dataSourcesInfo) {
    if (!this.instance) {
      if (!dataSourcesInfo) {
        throw new PowerDataRuntimeError(ErrorCodes.DataSourcesInfoNotFound);
      }
      this.instance = new _PowerDataSourcesInfoProvider(dataSourcesInfo);
    }
    return this.instance;
  }
  /**
   * Retrieves the data sources information.
   *
   * @returns A promise resolving to the data sources information.
   */
  async getDataSourcesInfo() {
    return this.dataSourcesInfo;
  }
};
__publicField(_PowerDataSourcesInfoProvider, "instance", null);
var PowerDataSourcesInfoProvider = _PowerDataSourcesInfoProvider;
var powerDataSourcesInfoProvider_default = PowerDataSourcesInfoProvider;

var connectionsLoaded = false;
async function loadConnections() {
  if (connectionsLoaded) {
    return;
  }
  connectionsLoaded = true;
  try {
    await loadNonCompositeConnectionsAsync();
  } catch (error) {
    console.warn("Power Apps connection preload failed; continuing with runtime metadata fetch.", error);
  }
  try {
    await resolveCompositeConnectionsAsync();
  } catch (error) {
    console.warn("Power Apps composite connection resolution failed; continuing with runtime metadata fetch.", error);
  }
}
async function loadNonCompositeConnectionsAsync() {
  return executePluginAsync("AppPowerAppsClientPlugin", "loadNonCompositeConnectionsAsync", []);
}
async function resolveCompositeConnectionsAsync() {
  return executePluginAsync("AppPowerAppsClientPlugin", "resolveCompositeConnectionsAsync", []);
}

var loadConnectionsPromise;
var OperationExecutor = class {
  /**
   * Executes an operation using the plugin.
   * @param operationName The name of the operation.
   * @param action The action to perform.
   * @param params The parameters for the operation.
   * @returns A promise resolving to the operation result.
   */
  async execute(operationName, action, params) {
    try {
      if (!loadConnectionsPromise) {
        loadConnectionsPromise = loadConnections();
      }
      await loadConnectionsPromise;
      const result = await executePluginAsync(operationName, action, params);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      throw error;
    }
  }
};

var _executor;
function getExecutor() {
  if (!_executor) {
    _executor = new OperationExecutor();
  }
  return _executor;
}
function mergeDataSourcesInfo(existingDataSourcesInfo, nextDataSourcesInfo) {
  return Object.assign({}, existingDataSourcesInfo || {}, nextDataSourcesInfo || {});
}

async function getPowerSdkInstance(dataSourcesInfo) {
  const executor = getExecutor();
  const existingProvider = powerDataSourcesInfoProvider_default.instance;
  if (existingProvider) {
    existingProvider.dataSourcesInfo = mergeDataSourcesInfo(existingProvider.dataSourcesInfo, dataSourcesInfo);
  }
  const provider = powerDataSourcesInfoProvider_default.getInstance(dataSourcesInfo);
  if (powerDataRuntimeInstance?._dataSourceService) {
    powerDataRuntimeInstance._dataSourceService._powerDataSourcesInfoProvider = provider;
    powerDataRuntimeInstance._dataSourceService._dataSourcesInfo = mergeDataSourcesInfo(
      powerDataRuntimeInstance._dataSourceService._dataSourcesInfo,
      provider.dataSourcesInfo
    );
  }
  return getPowerDataRuntime(provider, executor);
}

async function createRecordAsync(dataSourcesInfo, tableName, record) {
  return await (await getPowerSdkInstance(dataSourcesInfo)).Data.createRecordAsync(tableName, record);
}

async function updateRecordAsync(dataSourcesInfo, tableName, recordId, changes) {
  return await (await getPowerSdkInstance(dataSourcesInfo)).Data.updateRecordAsync(tableName, recordId, changes);
}

async function deleteRecordAsync(dataSourcesInfo, tableName, recordId) {
  return await (await getPowerSdkInstance(dataSourcesInfo)).Data.deleteRecordAsync(tableName, recordId);
}

async function retrieveRecordAsync(dataSourcesInfo, tableName, recordId, options) {
  return await (await getPowerSdkInstance(dataSourcesInfo)).Data.retrieveRecordAsync(tableName, recordId, options);
}

async function retrieveMultipleRecordsAsync(dataSourcesInfo, tableName, options) {
  return await (await getPowerSdkInstance(dataSourcesInfo)).Data.retrieveMultipleRecordsAsync(tableName, options);
}

async function executeAsync(dataSourcesInfo, operation) {
  return await (await getPowerSdkInstance(dataSourcesInfo)).Data.executeAsync(operation);
}

async function callActionAsync(dataSourcesInfo, actionName, params) {
  var sdkInstance = await getPowerSdkInstance(dataSourcesInfo);
  var dvExecutor = sdkInstance.Data._dataverseOperation;
  var dataClient = await dvExecutor._getDataClient();
  var dbRefs = await dvExecutor.getDatabaseReferences();
  var sInstanceUrl = null;
  var sDatasetName = null;
  for (var sDbKey of Object.keys(dbRefs)) {
    var oDb = dbRefs[sDbKey];
    if (oDb.databaseDetails && oDb.databaseDetails.linkedEnvironmentMetadata) {
      sInstanceUrl = oDb.databaseDetails.linkedEnvironmentMetadata.instanceUrl;
      sDatasetName = oDb.databaseDetails.environmentName;
      break;
    }
  }
  if (!sInstanceUrl) {
    throw new Error("Cannot call unbound action: no Dataverse instance URL found. Ensure at least one Dataverse table is registered.");
  }
  var sBaseUrl = sInstanceUrl.endsWith("/") ? sInstanceUrl : sInstanceUrl + "/";
  var sRequestUrl = sBaseUrl + "api/data/v9.0/" + actionName;
  var oContext = {
    operationName: DataverseOperationName.CreateRecord,
    datasetName: sDatasetName,
    isDataVerseOperation: true
  };
  var sToken = await dataClient._getAccessToken(DataSources.Dataverse, sDatasetName);
  var oHeaders = dataClient._createHeaders(sToken, {
    url: sRequestUrl,
    method: HttpMethod.POST,
    apiId: DataSources.Dataverse,
    tableName: actionName,
    body: JSON.stringify(params || {})
  }, oContext);
  var oRequestBody = new Blob([JSON.stringify(params || {})], { type: "application/json" });
  var oRawResult;
  try {
    oRawResult = await dataClient._powerOperationExecutor.execute(
      "AppHttpClientPlugin", "sendHttpAsync",
      [
        {
          url: sRequestUrl,
          method: HttpMethod.POST,
          requestSource: "PublishedApp",
          allowSessionStorage: true,
          returnDirectResponse: true,
          headers: oHeaders
        },
        oRequestBody,
        "arraybuffer"
      ]
    );
  } catch (oErr) {
    return { success: false, data: null, error: oErr };
  }
  var aResponseData = oRawResult.data;
  var oRespHeaders = aResponseData[0] ? aResponseData[0].headers || {} : {};
  var iStatus = aResponseData[0] ? aResponseData[0].status : 0;
  var sContentType = oRespHeaders["Content-Type"] || "";
  // HTTP 2xx with no body or no parseable content = success (void actions like GrantAccess)
  if (iStatus >= 200 && iStatus < 300 && (!sContentType || !aResponseData[1])) {
    return { success: true, data: null, error: null };
  }
  // Try to parse JSON response
  if (sContentType.indexOf("application/json") !== -1 && aResponseData[1]) {
    try {
      var sText = "";
      if (aResponseData[1] instanceof ArrayBuffer) {
        sText = new TextDecoder().decode(aResponseData[1]);
      } else if (typeof aResponseData[1] === "string") {
        sText = aResponseData[1];
      }
      if (!sText) sText = "{}";
      var oParsed = JSON.parse(sText);
      if (iStatus >= 200 && iStatus < 300) {
        return { success: true, data: oParsed, error: null };
      }
      // Error response from server
      var sErrMsg = oParsed.error ? (oParsed.error.message || JSON.stringify(oParsed.error)) : JSON.stringify(oParsed);
      return { success: false, data: null, error: { message: sErrMsg } };
    } catch (oParseErr) {
      if (iStatus >= 200 && iStatus < 300) {
        return { success: true, data: null, error: null };
      }
      return { success: false, data: null, error: { message: "Failed to parse action response" } };
    }
  }
  // Any other 2xx = success
  if (iStatus >= 200 && iStatus < 300) {
    return { success: true, data: null, error: null };
  }
  // Non-2xx with non-JSON body
  return { success: false, data: null, error: { message: "Action failed with status " + iStatus } };
}

var _dataOperationExecutor;
function getDataOperationExecutor() {
  return _dataOperationExecutor;
}
function setDataOperationExecutor(dataOperationExecutorOverride) {
  _dataOperationExecutor = dataOperationExecutorOverride;
}
function getClient(dataSourcesInfo) {
  return {
    createRecordAsync: (tableName, record) => {
      return createRecordAsync(dataSourcesInfo, tableName, record);
    },
    deleteRecordAsync: (tableName, recordId) => {
      return deleteRecordAsync(dataSourcesInfo, tableName, recordId);
    },
    executeAsync: (operation) => {
      return executeAsync(dataSourcesInfo, operation);
    },
    retrieveMultipleRecordsAsync: (tableName, options) => {
      return retrieveMultipleRecordsAsync(dataSourcesInfo, tableName, options);
    },
    retrieveRecordAsync: (tableName, recordId, options) => {
      return retrieveRecordAsync(dataSourcesInfo, tableName, recordId, options);
    },
    updateRecordAsync: (tableName, recordId, changes) => {
      return updateRecordAsync(dataSourcesInfo, tableName, recordId, changes);
    }
  };
}

var MockDataOperationExecutor = class {
  constructor(data) {
    __publicField(this, "_dataStore");
    this._dataStore = data;
  }
  async createRecordAsync(tableName, data) {
    return {
      success: false,
      error: { message: "createRecordAsync is not supported by MockDataOperationExecutor" },
      data: null
    };
  }
  async updateRecordAsync(tableName, id, data) {
    return {
      success: false,
      error: { message: "updateRecordAsync is not supported by MockDataOperationExecutor" },
      data: null
    };
  }
  async deleteRecordAsync(tableName, id) {
    return {
      success: false,
      error: { message: "deleteRecordAsync is not supported by MockDataOperationExecutor" },
      data: void 0
    };
  }
  async retrieveRecordAsync(tableName, id, options) {
    if (!this._dataStore[tableName]) {
      return {
        success: false,
        error: { message: `table <${tableName}> not found` },
        data: null
      };
    }
    const record = this._dataStore[tableName][id];
    if (!record) {
      return {
        success: false,
        error: { message: `record with id "${id}" not found in table <${tableName}>` },
        data: null
      };
    }
    return {
      success: true,
      data: record
    };
  }
  async retrieveMultipleRecordsAsync(tableName, options) {
    if (!this._dataStore[tableName]) {
      return {
        success: false,
        error: { message: `table <${tableName}> not found` },
        data: []
      };
    }
    return {
      success: true,
      data: Object.values(this._dataStore[tableName])
    };
  }
  async executeAsync(operation) {
    return {
      success: false,
      error: { message: "executeAsync is not supported by MockDataOperationExecutor" },
      data: null
    };
  }
};
function createMockDataExecutor(data) {
  return new MockDataOperationExecutor(data);
}

var entityClusterModeEnum = {
  0: "Partitioned",
  1: "Replicated",
  2: "Local"
};
function getEntityClusterModeName(value) {
  return entityClusterModeEnum[value];
}
var ownershipTypeEnum = {
  0: "None",
  1: "UserOwned",
  2: "TeamOwned",
  4: "BusinessOwned",
  8: "OrganizationOwned",
  16: "BusinessParented",
  32: "Filtered"
};
function getOwnershipTypeName(value) {
  return ownershipTypeEnum[value];
}
var privilegeTypeEnum = {
  0: "None",
  1: "Create",
  2: "Read",
  3: "Write",
  4: "Delete",
  5: "Assign",
  6: "Share",
  7: "Append",
  8: "AppendTo"
};
function getPrivilegeTypeName(value) {
  return privilegeTypeEnum[value];
}
var attributeTypeCodeEnum = {
  0: "Boolean",
  1: "Customer",
  2: "DateTime",
  3: "Decimal",
  4: "Double",
  5: "Integer",
  6: "Lookup",
  7: "Memo",
  8: "Money",
  9: "Owner",
  10: "PartyList",
  11: "Picklist",
  12: "State",
  13: "Status",
  14: "String",
  15: "Uniqueidentifier",
  16: "CalendarRules",
  17: "Virtual",
  18: "BigInt",
  19: "ManagedProperty",
  20: "EntityName"
};
function getAttributeTypeCodeName(value) {
  return attributeTypeCodeEnum[value];
}
var attributeRequiredLevelEnum = {
  0: "None",
  1: "SystemRequired",
  2: "ApplicationRequired",
  3: "Recommended"
};
function getAttributeRequiredLevelName(value) {
  return attributeRequiredLevelEnum[value];
}
var relationshipTypeEnum = {
  0: "OneToManyRelationship",
  1: "ManyToManyRelationship"
};
function getRelationshipTypeName(value) {
  return relationshipTypeEnum[value];
}
var securityTypesEnum = {
  0: "None",
  1: "Append",
  2: "ParentChild",
  8: "Pointer",
  16: "Inheritance"
  // The referencing entity record inherits security from the referenced security record.
};
function getSecurityTypesName(value) {
  return securityTypesEnum[value];
}
var associatedMenuBehaviorEnum = {
  0: "UseCollectionName",
  1: "UseLabel",
  2: "DoNotDisplay"
};
function getAssociatedMenuBehaviorName(value) {
  return associatedMenuBehaviorEnum[value];
}
var associatedMenuGroupEnum = {
  0: "Details",
  1: "Sales",
  2: "Service",
  3: "Marketing"
};
function getAssociatedMenuGroupName(value) {
  return associatedMenuGroupEnum[value];
}
var cascadeTypeEnum = {
  0: "NoCascade",
  1: "Cascade",
  2: "Active",
  3: "UserOwned",
  4: "RemoveLink",
  5: "Restrict"
  // Prevent the Referenced entity record from being deleted when referencing entities exist.
};
function getCascadeTypeName(value) {
  return cascadeTypeEnum[value];
}
export {
  callActionAsync,
  createMockDataExecutor,
  getAssociatedMenuBehaviorName,
  getAssociatedMenuGroupName,
  getAttributeRequiredLevelName,
  getAttributeTypeCodeName,
  getCascadeTypeName,
  getClient,
  getContext,
  getEntityClusterModeName,
  getOwnershipTypeName,
  getPrivilegeTypeName,
  getRelationshipTypeName,
  getSecurityTypesName,
  initializeLogger,
  setConfig,
  setDataOperationExecutor
};