/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * This file is auto-generated. Do not modify it manually.
 * Changes to this file may be overwritten.
 */

export const dataSourcesInfo = {
  "jira": {
    "tableId": "",
    "version": "",
    "primaryKey": "",
    "dataSourceType": "Connector",
    "apis": {
      "EditIssue": {
        "path": "/{connectionId}/3/issue/{issueIdOrKey}",
        "method": "PUT",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "issueIdOrKey",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "notifyUsers",
            "in": "query",
            "required": false,
            "type": "boolean"
          },
          {
            "name": "overrideScreenSecurity",
            "in": "query",
            "required": false,
            "type": "boolean"
          },
          {
            "name": "overrideEditableFlag",
            "in": "query",
            "required": false,
            "type": "boolean"
          },
          {
            "name": "body",
            "in": "body",
            "required": false,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          },
          "204": {
            "type": "object"
          },
          "400": {
            "type": "void"
          },
          "401": {
            "type": "void"
          },
          "403": {
            "type": "void"
          },
          "404": {
            "type": "void"
          }
        }
      },
      "EditIssue_V2": {
        "path": "/{connectionId}/v2/3/issue/{issueIdOrKey}",
        "method": "PUT",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "issueIdOrKey",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "notifyUsers",
            "in": "query",
            "required": false,
            "type": "boolean"
          },
          {
            "name": "overrideScreenSecurity",
            "in": "query",
            "required": false,
            "type": "boolean"
          },
          {
            "name": "overrideEditableFlag",
            "in": "query",
            "required": false,
            "type": "boolean"
          },
          {
            "name": "body",
            "in": "body",
            "required": false,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          },
          "204": {
            "type": "object"
          },
          "400": {
            "type": "void"
          },
          "401": {
            "type": "void"
          },
          "403": {
            "type": "void"
          },
          "404": {
            "type": "void"
          }
        }
      },
      "DeleteProject": {
        "path": "/{connectionId}/3/project/{projectIdOrKey}",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectIdOrKey",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "enableUndo",
            "in": "query",
            "required": false,
            "type": "boolean"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          },
          "401": {
            "type": "void"
          },
          "404": {
            "type": "void"
          }
        }
      },
      "UpdateProject": {
        "path": "/{connectionId}/3/project/{projectIdOrKey}",
        "method": "PUT",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectIdOrKey",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": false,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "400": {
            "type": "void"
          },
          "401": {
            "type": "void"
          },
          "403": {
            "type": "void"
          },
          "404": {
            "type": "void"
          }
        }
      },
      "DeleteProject_V2": {
        "path": "/{connectionId}/v2/project/{projectIdOrKey}",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectIdOrKey",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "enableUndo",
            "in": "query",
            "required": false,
            "type": "boolean"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          },
          "401": {
            "type": "void"
          },
          "404": {
            "type": "void"
          }
        }
      },
      "UpdateProject_V2": {
        "path": "/{connectionId}/v2/project/{projectIdOrKey}",
        "method": "PUT",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectIdOrKey",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": false,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "400": {
            "type": "void"
          },
          "401": {
            "type": "void"
          },
          "403": {
            "type": "void"
          },
          "404": {
            "type": "void"
          }
        }
      },
      "GetAllProjectCategories": {
        "path": "/{connectionId}/3/projectCategory",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          },
          "401": {
            "type": "void"
          }
        }
      },
      "CreateProjectCategory": {
        "path": "/{connectionId}/3/projectCategory",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": false,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          },
          "400": {
            "type": "void"
          },
          "401": {
            "type": "void"
          },
          "403": {
            "type": "void"
          },
          "409": {
            "type": "void"
          }
        }
      },
      "GetAllProjectCategories_V2": {
        "path": "/{connectionId}/v2/projectCategory",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          },
          "401": {
            "type": "void"
          }
        }
      },
      "CreateProjectCategory_V2": {
        "path": "/{connectionId}/v2/projectCategory",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": false,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          },
          "400": {
            "type": "void"
          },
          "401": {
            "type": "void"
          },
          "403": {
            "type": "void"
          },
          "409": {
            "type": "void"
          }
        }
      },
      "RemoveProjectCategory": {
        "path": "/{connectionId}/3/projectCategory/{id}",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "integer"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          },
          "401": {
            "type": "void"
          },
          "403": {
            "type": "void"
          },
          "404": {
            "type": "void"
          }
        }
      },
      "RemoveProjectCategory_V2": {
        "path": "/{connectionId}/v2/projectCategory/{id}",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "type": "integer"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          },
          "401": {
            "type": "void"
          },
          "403": {
            "type": "void"
          },
          "404": {
            "type": "void"
          }
        }
      },
      "GetTask": {
        "path": "/{connectionId}/3/task/{taskId}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "taskId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "401": {
            "type": "void"
          },
          "403": {
            "type": "void"
          },
          "404": {
            "type": "void"
          }
        }
      },
      "GetTask_V2": {
        "path": "/{connectionId}/v2/task/{taskId}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "taskId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "401": {
            "type": "void"
          },
          "403": {
            "type": "void"
          },
          "404": {
            "type": "void"
          }
        }
      },
      "CancelTask": {
        "path": "/{connectionId}/3/task/{taskId}/cancel",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "taskId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Atlassian-Token",
            "in": "header",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          },
          "202": {
            "type": "object"
          },
          "400": {
            "type": "array"
          },
          "401": {
            "type": "array"
          },
          "403": {
            "type": "array"
          },
          "404": {
            "type": "array"
          }
        }
      },
      "CancelTask_V2": {
        "path": "/{connectionId}/v2/task/{taskId}/cancel",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "taskId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Atlassian-Token",
            "in": "header",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          },
          "202": {
            "type": "object"
          },
          "400": {
            "type": "array"
          },
          "401": {
            "type": "array"
          },
          "403": {
            "type": "array"
          },
          "404": {
            "type": "array"
          }
        }
      },
      "GetUser": {
        "path": "/{connectionId}/3/user",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "accountId",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "expand",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "401": {
            "type": "void"
          },
          "403": {
            "type": "void"
          },
          "404": {
            "type": "void"
          }
        }
      },
      "GetUser_V2": {
        "path": "/{connectionId}/v2/user",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "accountId",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "expand",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "401": {
            "type": "void"
          },
          "403": {
            "type": "void"
          },
          "404": {
            "type": "void"
          }
        }
      },
      "CreateIssue": {
        "path": "/{connectionId}/issue",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectKey",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          }
        }
      },
      "CreateIssueV2": {
        "path": "/{connectionId}/v2/issue",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectKey",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "issueTypeIds",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "item",
            "in": "body",
            "required": false,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          }
        }
      },
      "CreateIssue_V3": {
        "path": "/{connectionId}/v3/issue",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectKey",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "issueTypeIds",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "item",
            "in": "body",
            "required": false,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          }
        }
      },
      "GetIssue": {
        "path": "/{connectionId}/issue/{issueKey}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "issueKey",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "UpdateIssue": {
        "path": "/{connectionId}/issue/{issueKey}",
        "method": "PUT",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "issueKey",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "string"
          }
        }
      },
      "GetIssue_V2": {
        "path": "/{connectionId}/v2/issue/{issueKey}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "issueKey",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "UpdateIssue_V2": {
        "path": "/{connectionId}/v2/issue/{issueKey}",
        "method": "PUT",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "issueKey",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "string"
          }
        }
      },
      "AddComment": {
        "path": "/{connectionId}/issue/{issueKey}/comment",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "issueKey",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          }
        }
      },
      "AddComment_V2": {
        "path": "/{connectionId}/v2/issue/{issueKey}/comment",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "issueKey",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          }
        }
      },
      "ListIssueTypes": {
        "path": "/{connectionId}/issue/createmeta",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectKey",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "ListIssueTypes_V2": {
        "path": "/{connectionId}/v2/types/issue/createmeta",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectKey",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "ListIssueTypesFields": {
        "path": "/{connectionId}/v2/issue/createmeta",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectKey",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "issuetypeIds",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "ListIssueTypesFields_V2": {
        "path": "/{connectionId}/v3/issue/createmeta",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectKey",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "issuetypeIds",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "ListProjects": {
        "path": "/{connectionId}/project",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "CreateProject": {
        "path": "/{connectionId}/project",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Project",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          }
        }
      },
      "CreateProject_V2": {
        "path": "/{connectionId}/v2/project",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "Project",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          }
        }
      },
      "ListProjects_V2": {
        "path": "/{connectionId}/project/search",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "ListProjects_V3": {
        "path": "/{connectionId}/v2/project/search",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "ListStatuses": {
        "path": "/{connectionId}/project/{projectId}/statuses",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "issueType",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "ListStatuses_V2": {
        "path": "/{connectionId}/v2/project/{projectId}/statuses",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "issueType",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "ListProjectUsers": {
        "path": "/{connectionId}/user/permission/search",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectKey",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "ListProjectUsers_V2": {
        "path": "/{connectionId}/v2/user/permission/search",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectKey",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "ListAssignableUsers": {
        "path": "/{connectionId}/user/assignable/search",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectKey",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "ListAssignableUsers_V2": {
        "path": "/{connectionId}/v2/user/assignable/search",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectKey",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "ListPriorityTypes": {
        "path": "/{connectionId}/priority",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "ListPriorityTypes_V2": {
        "path": "/{connectionId}/v2/priority",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "ListFilters": {
        "path": "/{connectionId}/2/filter/search",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "ListFilters_V2": {
        "path": "/{connectionId}/v2/filter/search",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "ListResources": {
        "path": "/{connectionId}/oauth/token/accessible-resources",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "ListIssues": {
        "path": "/{connectionId}/2/search",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "jql",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "expand",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "fields",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "400": {
            "type": "void"
          },
          "401": {
            "type": "void"
          }
        }
      },
      "ListIssues_Datacenter": {
        "path": "/{connectionId}/datacenter/search",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "400": {
            "type": "void"
          },
          "401": {
            "type": "void"
          }
        }
      },
      "ListTransitions": {
        "path": "/{connectionId}/3/issue/{issueIdOrKey}/transitions",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "issueIdOrKey",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "401": {
            "type": "void"
          },
          "404": {
            "type": "void"
          }
        }
      },
      "UpdateTransition": {
        "path": "/{connectionId}/3/issue/{issueIdOrKey}/transitions",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "issueIdOrKey",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "object"
          },
          "400": {
            "type": "void"
          },
          "401": {
            "type": "void"
          },
          "403": {
            "type": "void"
          },
          "404": {
            "type": "void"
          }
        }
      },
      "GetCurrentUser": {
        "path": "/{connectionId}/3/myself",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "expand",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "401": {
            "type": "void"
          }
        }
      },
      "OnNewIssue": {
        "path": "/{connectionId}/new_issue_trigger/search",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectKey",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "OnNewIssue_V2": {
        "path": "/{connectionId}/v2/new_issue_trigger/search",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectKey",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "OnNewIssue_Datacenter": {
        "path": "/{connectionId}/datacenter/new_issue_trigger/search",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectKey",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "OnCloseIssue": {
        "path": "/{connectionId}/close_issue_trigger/search",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectKey",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "OnCloseIssue_V2": {
        "path": "/{connectionId}/v2/close_issue_trigger/search",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectKey",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "OnCloseIssue_Datacenter": {
        "path": "/{connectionId}/datacenter/close_issue_trigger/search",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectKey",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "OnUpdateIssue": {
        "path": "/{connectionId}/update_issue_trigger/search",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectKey",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "OnUpdateIssue_V2": {
        "path": "/{connectionId}/v2/update_issue_trigger/search",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectKey",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "OnUpdateIssue_Datacenter": {
        "path": "/{connectionId}/datacenter/update_issue_trigger/search",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "projectKey",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "OnNewIssueJQL": {
        "path": "/{connectionId}/new_issue_jql_trigger/search",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "jql",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "OnNewIssueJQL_V2": {
        "path": "/{connectionId}/v2/new_issue_jql_trigger/search",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "jql",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "OnNewIssueJQL_Datacenter": {
        "path": "/{connectionId}/datacenter/new_issue_jql_trigger/search",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "jql",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "X-Request-Jirainstance",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "mcp_JiraIssueManagement": {
        "path": "/{connectionId}/mcp/JiraIssueManagement",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "queryRequest",
            "in": "body",
            "required": false,
            "type": "object"
          },
          {
            "name": "sessionId",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      }
    }
  },
  "keyvault": {
    "tableId": "",
    "version": "",
    "primaryKey": "",
    "dataSourceType": "Connector",
    "apis": {
      "ListKeys": {
        "path": "/{connectionId}/keys",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "ListKeyVersions": {
        "path": "/{connectionId}/keys/{keyName}/versions",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "keyName",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetKeyMetadata": {
        "path": "/{connectionId}/keys/{keyName}/metadata",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "keyName",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetKeyVersionMetadata": {
        "path": "/{connectionId}/keys/{keyName}/versions/{keyVersion}/metadata",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "keyName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "keyVersion",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "EncryptData": {
        "path": "/{connectionId}/keys/{keyName}/encrypt",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "keyName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "operationInput",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "EncryptDataWithVersion": {
        "path": "/{connectionId}/keys/{keyName}/versions/{keyVersion}/encrypt",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "keyName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "keyVersion",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "operationInput",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "DecryptData": {
        "path": "/{connectionId}/keys/{keyName}/decrypt",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "keyName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "operationInput",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "DecryptDataWithVersion": {
        "path": "/{connectionId}/keys/{keyName}/versions/{keyVersion}/decrypt",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "keyName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "keyVersion",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "operationInput",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "ListSecrets": {
        "path": "/{connectionId}/secrets",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "ListSecretVersions": {
        "path": "/{connectionId}/secrets/{secretName}/versions",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "secretName",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetSecretMetadata": {
        "path": "/{connectionId}/secrets/{secretName}/metadata",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "secretName",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetSecretVersionMetadata": {
        "path": "/{connectionId}/secrets/{secretName}/versions/{secretVersion}/metadata",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "secretName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "secretVersion",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetSecret": {
        "path": "/{connectionId}/secrets/{secretName}/value",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "secretName",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetSecretVersion": {
        "path": "/{connectionId}/secrets/{secretName}/versions/{secretVersion}/value",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "secretName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "secretVersion",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      }
    }
  },
  "teams": {
    "tableId": "",
    "version": "",
    "primaryKey": "",
    "dataSourceType": "Connector",
    "apis": {
      "CreateTeamsMeeting": {
        "path": "/{connectionId}/v1.0/me/calendars/{calendarid}/events",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "calendarid",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "item",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          }
        }
      },
      "GetSupportedTimeZones": {
        "path": "/{connectionId}/v1.0/me/outlook/supportedTimeZones",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "GetAllTeams": {
        "path": "/{connectionId}/beta/me/joinedTeams",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "GetAllAssociatedTeams": {
        "path": "/{connectionId}/v1.0/me/teamwork/associatedTeams",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "GetTeamwork": {
        "path": "/{connectionId}/beta/me/teamwork",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "GetChannelsForGroup": {
        "path": "/{connectionId}/beta/groups/{groupId}/channels",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$filter",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "$orderby",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "CreateChannel": {
        "path": "/{connectionId}/beta/groups/{groupId}/channels",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          }
        }
      },
      "GetChannel": {
        "path": "/{connectionId}/beta/teams/{groupId}/channels/{channelId}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "channelId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "GetAllChannelsForTeam": {
        "path": "/{connectionId}/beta/teams/{groupId}/allChannels",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$filter",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "$orderby",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "GetChats": {
        "path": "/{connectionId}/flowbot/actions/listchats/chattypes/{chatType}/topic/{topic}/expandmembers/false",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "chatType",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "topic",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "GetTags": {
        "path": "/{connectionId}/beta/teams/{groupId}/tags",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "CreateTag": {
        "path": "/{connectionId}/beta/teams/{groupId}/tags",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "AddMemberToTag": {
        "path": "/{connectionId}/beta/teams/{groupId}/tags/{tagId}/members",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "tagId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetTagMembers": {
        "path": "/{connectionId}/beta/teams/{groupId}/tags/{tagId}/members",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "tagId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "DeleteTagMember": {
        "path": "/{connectionId}/beta/teams/{groupId}/tags/{tagId}/members/{tagMemberId}",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "tagId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "tagMemberId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "PostFeedNotification": {
        "path": "/{connectionId}/flowbot/feednotification/poster/{poster}/notificationType/{notificationType}",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "poster",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "notificationType",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "AtMentionTag": {
        "path": "/{connectionId}/beta/teams/{groupId}/tags/{tagId}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "tagId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "DeleteTag": {
        "path": "/{connectionId}/beta/teams/{groupId}/tags/{tagId}",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "tagId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "PostMessageToChannelV2": {
        "path": "/{connectionId}/beta/teams/{groupId}/channels/{channelId}/messages",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "channelId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "void"
          }
        }
      },
      "GetMessagesFromChannel": {
        "path": "/{connectionId}/beta/teams/{groupId}/channels/{channelId}/messages",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "channelId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "GetMessageDetails": {
        "path": "/{connectionId}/beta/teams/messages/{messageId}/messageType/{threadType}",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "messageId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "threadType",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "ListRepliesToMessage": {
        "path": "/{connectionId}/v1.0/teams/{groupId}/channels/{channelId}/messages/{messageId}/replies",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "channelId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "messageId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$top",
            "in": "query",
            "required": false,
            "type": "integer"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "ListMembers": {
        "path": "/{connectionId}/v1.0/teams/listmembers/threadType/{threadType}",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "threadType",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          },
          {
            "name": "$filter",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "PostMessageToChannelV3": {
        "path": "/{connectionId}/v3/beta/teams/{groupId}/channels/{channelId}/messages",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "channelId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          }
        }
      },
      "PostReplyToMessage": {
        "path": "/{connectionId}/beta/teams/{groupId}/channels/{channelId}/messages/{messageId}/replies",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "channelId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "messageId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "void"
          }
        }
      },
      "PostReplyToMessageV2": {
        "path": "/{connectionId}/v2/beta/teams/{groupId}/channels/{channelId}/messages/{messageId}/replies",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "channelId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "messageId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "void"
          }
        }
      },
      "OnNewChannelMessage": {
        "path": "/{connectionId}/trigger/beta/teams/{groupId}/channels/{channelId}/messages",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "channelId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$top",
            "in": "query",
            "required": false,
            "type": "integer"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "OnNewChannelMessageMentioningMe": {
        "path": "/{connectionId}/trigger/beta/teams/{groupId}/channels/{channelId}/messages_mentioningme",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "channelId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$top",
            "in": "query",
            "required": false,
            "type": "integer"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "WebhookAtMentionTrigger": {
        "path": "/{connectionId}/beta/subscriptions/atmentiontrigger/threadType/{threadType}",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "threadType",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "requestBody",
            "in": "body",
            "required": false,
            "type": "object"
          }
        ],
        "responseInfo": {
          "default": {
            "type": "object"
          }
        }
      },
      "WebhookMessageReactionTrigger": {
        "path": "/{connectionId}/beta/subscriptions/messagereactiontrigger/threadType/{threadType}",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "reactionKey",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "frequency",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "runningPolicy",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "threadType",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "requestBody",
            "in": "body",
            "required": false,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "void"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "WebhookChatMessageTrigger": {
        "path": "/{connectionId}/beta/subscriptions/chatmessagetrigger",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "ChatMessageSubscriptionRequest",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "void"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "WebhookKeywordTrigger": {
        "path": "/{connectionId}/beta/subscriptions/keywordtrigger/threadType/{threadType}",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "threadType",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$search",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "requestBody",
            "in": "body",
            "required": false,
            "type": "object"
          }
        ],
        "responseInfo": {
          "default": {
            "type": "object"
          }
        }
      },
      "WebhookNewMessageTrigger": {
        "path": "/{connectionId}/beta/subscriptions/newmessagetrigger/threadType/{threadType}",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "threadType",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "requestBody",
            "in": "body",
            "required": false,
            "type": "object"
          }
        ],
        "responseInfo": {
          "default": {
            "type": "object"
          }
        }
      },
      "DeleteWorkflowsMiddleTierSubscriptions": {
        "path": "/{connectionId}/workflows/graphsubscriptions/{subscriptionIds}",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionIds",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "RenewWorkflowsMiddleTierSubscriptions": {
        "path": "/{connectionId}/workflows/graphsubscriptions/{subscriptionIds}",
        "method": "PATCH",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionIds",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "renewEncryptionCert",
            "in": "query",
            "required": false,
            "type": "boolean"
          },
          {
            "name": "body",
            "in": "body",
            "required": false,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "DeleteWebHookSubscription": {
        "path": "/{connectionId}/beta/subscriptions/{subscriptionIds}",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionIds",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "RenewWebHookSubscription": {
        "path": "/{connectionId}/beta/subscriptions/{subscriptionIds}",
        "method": "PATCH",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionIds",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": false,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "PostMessageToChannel": {
        "path": "/{connectionId}/beta/groups/{groupId}/channels/{channelId}/chatThreads",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "channelId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "void"
          }
        }
      },
      "PostUserNotification": {
        "path": "/{connectionId}/flowbot/actions/notification/recipienttypes/user",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "PostNotificationRequest",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "void"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "PostChannelNotification": {
        "path": "/{connectionId}/flowbot/actions/notification/recipienttypes/channel",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "PostNotificationRequest",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "void"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "PostUserAdaptiveCard": {
        "path": "/{connectionId}/flowbot/actions/adaptivecard/recipienttypes/user",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "PostAdaptiveCardRequest",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "PostChannelAdaptiveCard": {
        "path": "/{connectionId}/flowbot/actions/adaptivecard/recipienttypes/channel",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "PostAdaptiveCardRequest",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "GetUnifiedActionSchema": {
        "path": "/{connectionId}/flowbot/actions/{actionType}/posters/{poster}/recipienttypes/{recipientType}/schema",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "actionType",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "poster",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recipientType",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetPostToConversationResponseSchema": {
        "path": "/{connectionId}/flowbot/actions/{actionType}/posters/{poster}/recipienttypes/{recipientType}/response/schema",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "actionType",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "poster",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recipientType",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetAdaptiveCardInputMetadata": {
        "path": "/{connectionId}/flowbot/actions/adaptivecard/recipienttypes/{recipientType}/$metadata.json/inputs",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recipientType",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "GetNotificationInputMetadata": {
        "path": "/{connectionId}/flowbot/actions/notification/recipienttypes/{recipientType}/$metadata.json/inputs",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recipientType",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "SubscribeUserMessageWithOptions": {
        "path": "/{connectionId}/flowbot/actions/messagewithoptions/recipienttypes/user/$subscriptions",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "UserMessageWithOptionsSubscriptionRequest",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "void"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "SubscribeUserFlowContinuation": {
        "path": "/{connectionId}/flowbot/actions/flowcontinuation/recipienttypes/user/$subscriptions",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "UserFlowContinuationSubscriptionRequest",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "void"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "SubscribeChannelFlowContinuation": {
        "path": "/{connectionId}/flowbot/actions/flowcontinuation/recipienttypes/channel/$subscriptions",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "ChannelFlowContinuationSubscriptionRequest",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "void"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "UnsubscribeMessageWithOptions": {
        "path": "/{connectionId}/flowbot/actions/messagewithoptions/recipienttypes/{recipientType}/$subscriptions/{subscriptionId}",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recipientType",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "204": {
            "type": "void"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "UnsubscribeFlowContinuation": {
        "path": "/{connectionId}/flowbot/actions/flowcontinuation/recipienttypes/{recipientType}/$subscriptions/{subscriptionId}",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recipientType",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "subscriptionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "204": {
            "type": "void"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "GetMessageWithOptionsInputMetadata": {
        "path": "/{connectionId}/flowbot/actions/messagewithoptions/recipienttypes/{recipientType}/$metadata.json/inputs",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recipientType",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "GetFlowContinuationInputMetadata": {
        "path": "/{connectionId}/flowbot/actions/flowcontinuation/recipienttypes/{recipientType}/$metadata.json/inputs",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recipientType",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "GetMessageWithOptionsSubscriptionInputMetadata": {
        "path": "/{connectionId}/flowbot/actions/messagewithoptions/recipienttypes/{recipientType}/$metadata.json/subscriptioninputs",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recipientType",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "GetFlowContinuationSubscriptionInputMetadata": {
        "path": "/{connectionId}/flowbot/actions/flowcontinuation/recipienttypes/{recipientType}/$metadata.json/subscriptioninputs",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recipientType",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "GetMessageWithOptionsSubscriptionOutputMetadata": {
        "path": "/{connectionId}/flowbot/actions/messagewithoptions/recipienttypes/{recipientType}/$metadata.json/subscriptionoutputs",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recipientType",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "GetFlowContinuationSubscriptionOutputMetadata": {
        "path": "/{connectionId}/flowbot/actions/flowcontinuation/recipienttypes/{recipientType}/$metadata.json/subscriptionoutputs",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recipientType",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "GetFlowContinuationSubscriptionWithPosterOutputMetadata": {
        "path": "/{connectionId}/flowbot/actions/flowcontinuation/posters/{poster}/recipienttypes/{recipientType}/$metadata.json/subscriptionoutputs",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "poster",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "recipientType",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "GetSelectedMessageTriggerOutputsMetadata": {
        "path": "/{connectionId}/flowbot/triggers/selectedmessage/$metadata.json/selectedmessageoutputs",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "GetComposeMessageTriggerOutputsMetadata": {
        "path": "/{connectionId}/flowbot/triggers/composemessage/$metadata.json/composemessageoutputs",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "GetCardResponseTriggerOutputsMetadata": {
        "path": "/{connectionId}/flowbot/triggers/cardresponse/$metadata.json/cardresponseoutputs",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "GetTeam": {
        "path": "/{connectionId}/beta/teams/{teamId}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "AtMentionUser": {
        "path": "/{connectionId}/v1.0/users/{userId}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "AtMentionBot": {
        "path": "/{connectionId}/custom/teams/bots",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "botMention",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "ListTimeOffReasons": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/timeOffReasons",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$top",
            "in": "query",
            "required": false,
            "type": "integer"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "ListShifts": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/shifts",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "startTime",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "endTime",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "$top",
            "in": "query",
            "required": false,
            "type": "integer"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "GetShift": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/shifts/{shiftId}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "shiftId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "DeleteShift": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/shifts/{shiftId}",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "shiftId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "204": {
            "type": "void"
          }
        }
      },
      "ListOpenShifts": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/openShifts",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "startTime",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "endTime",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "$top",
            "in": "query",
            "required": false,
            "type": "integer"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "CreateOpenShift": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/openShifts",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "request",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "GetOpenShift": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/openShifts/{openShiftId}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "openShiftId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "UpdateOpenShift": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/openShifts/{openShiftId}",
        "method": "PUT",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "openShiftId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "request",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "DeleteOpenShift": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/openShifts/{openShiftId}",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "openShiftId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "void"
          },
          "204": {
            "type": "void"
          }
        }
      },
      "ListSchedulingGroups": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/schedulinggroups",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$top",
            "in": "query",
            "required": false,
            "type": "integer"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "GetSchedulingGroup": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/schedulinggroups/{schedulingGroupId}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "schedulingGroupId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "ListTimeOffRequests": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/timeOffRequests",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$top",
            "in": "query",
            "required": false,
            "type": "integer"
          },
          {
            "name": "state",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "TimeOffRequestApprove": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/timeOffRequests/{timeOffRequestId}/approve",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "timeOffRequestId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "request",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "TimeOffRequestDecline": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/timeOffRequests/{timeOffRequestId}/decline",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "timeOffRequestId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "request",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "ListOfferShiftRequests": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/offerShiftRequests",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$top",
            "in": "query",
            "required": false,
            "type": "integer"
          },
          {
            "name": "state",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "OfferShiftRequestApprove": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/offerShiftRequests/{offerShiftRequestId}/approve",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "offerShiftRequestId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "request",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "OfferShiftRequestDecline": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/offerShiftRequests/{offerShiftRequestId}/decline",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "offerShiftRequestId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "request",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "ListSwapShiftsChangeRequests": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/swapShiftsChangeRequests",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$top",
            "in": "query",
            "required": false,
            "type": "integer"
          },
          {
            "name": "state",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "SwapShiftsChangeRequestApprove": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/swapShiftsChangeRequests/{swapShiftsChangeRequestId}/approve",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "swapShiftsChangeRequestId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "request",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "SwapShiftsChangeRequestDecline": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/swapShiftsChangeRequests/{swapShiftsChangeRequestId}/decline",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "swapShiftsChangeRequestId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "request",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "ListOpenShiftChangeRequests": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/openShiftChangeRequests",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$top",
            "in": "query",
            "required": false,
            "type": "integer"
          },
          {
            "name": "state",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "OpenShiftChangeRequestApprove": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/openShiftChangeRequests/{openShiftChangeRequestId}/approve",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "openShiftChangeRequestId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "request",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "OpenShiftChangeRequestDecline": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule/openShiftChangeRequests/{openShiftChangeRequestId}/decline",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "openShiftChangeRequestId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "request",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "GetSchedule": {
        "path": "/{connectionId}/beta/teams/{teamId}/schedule",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "ForASelectedMessage": {
        "path": "/{connectionId}/hybridtriggers/onselectedmessage",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "inputsAdaptiveCard",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "taskModuleWidth",
            "in": "query",
            "required": false,
            "type": "integer"
          },
          {
            "name": "taskModuleHeight",
            "in": "query",
            "required": false,
            "type": "integer"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "ForASelectedMessageV2": {
        "path": "/{connectionId}/hybridtriggers/onselectedmessagev2",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "inputsAdaptiveCard",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "taskModuleWidth",
            "in": "query",
            "required": false,
            "type": "integer"
          },
          {
            "name": "taskModuleHeight",
            "in": "query",
            "required": false,
            "type": "integer"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "ComposeAMessage": {
        "path": "/{connectionId}/hybridtriggers/oncomposemessage",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "inputsAdaptiveCard",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "taskModuleWidth",
            "in": "query",
            "required": false,
            "type": "integer"
          },
          {
            "name": "taskModuleHeight",
            "in": "query",
            "required": false,
            "type": "integer"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "ComposeAMessageV2": {
        "path": "/{connectionId}/hybridtriggers/composeamessagev2",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "inputsAdaptiveCard",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "taskModuleWidth",
            "in": "query",
            "required": false,
            "type": "integer"
          },
          {
            "name": "taskModuleHeight",
            "in": "query",
            "required": false,
            "type": "integer"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "TeamsCardTrigger": {
        "path": "/{connectionId}/hybridtriggers/teamscardtrigger",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "inputsAdaptiveCard",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "CardTypeId",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "OnGroupMembershipRemoval": {
        "path": "/{connectionId}/trigger/v1.0/groups/removal",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "$select",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "OnGroupMembershipAdd": {
        "path": "/{connectionId}/trigger/v1.0/groups/delta",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "$select",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "CreateChat": {
        "path": "/{connectionId}/beta/chats",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "item",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          }
        }
      },
      "GetMessagesFromChat": {
        "path": "/{connectionId}/beta/chats/{chatId}/messages",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "chatId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "$filter",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "$orderby",
            "in": "query",
            "required": false,
            "type": "string"
          },
          {
            "name": "$top",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "CreateATeam": {
        "path": "/{connectionId}/beta/teams",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          }
        }
      },
      "GetTeamsAsyncResult": {
        "path": "/{connectionId}/beta/teamsasyncresult",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "AddMemberToTeam": {
        "path": "/{connectionId}/beta/teams/{teamId}/members",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          }
        }
      },
      "AddMemberToChannel": {
        "path": "/{connectionId}/v1.0/teams/{groupId}/channels/{channelId}/members",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "channelId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "void"
          }
        }
      },
      "RemoveMemberFromChannel": {
        "path": "/{connectionId}/v1.0/teams/{groupId}/channels/{channelId}/members/{membershipId}",
        "method": "DELETE",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "channelId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "membershipId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "204": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "PostMessageToConversation": {
        "path": "/{connectionId}/beta/teams/conversation/message/poster/{poster}/location/{location}",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "poster",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "location",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "ReplyWithMessageToConversation": {
        "path": "/{connectionId}/v1.0/teams/conversation/replyWithMessage/poster/{poster}/location/{location}",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "poster",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "location",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "PostCardToConversation": {
        "path": "/{connectionId}/v1.0/teams/conversation/adaptivecard/poster/{poster}/location/{location}",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "poster",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "location",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "PostCardAndWaitForResponse": {
        "path": "/{connectionId}/v1.0/teams/conversation/gatherinput/poster/{poster}/location/{location}/$subscriptions",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "poster",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "location",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "ReplyWithCardToConversation": {
        "path": "/{connectionId}/v1.0/teams/conversation/replyWithAdaptivecard/poster/{poster}/location/{location}",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "poster",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "location",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "UpdateCardInConversation": {
        "path": "/{connectionId}/v1.0/teams/conversation/updateAdaptivecard/poster/{poster}/location/{location}",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "poster",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "location",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "required": true,
            "type": "object"
          }
        ],
        "responseInfo": {
          "201": {
            "type": "object"
          },
          "204": {
            "type": "void"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetMessageDetailsInputSchema": {
        "path": "/{connectionId}/flowbot/getmessagedetailsinputschema/threadType/{threadType}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "threadType",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "GetMessageDetailsResponseSchema": {
        "path": "/{connectionId}/flowbot/getmessagedetailsresponseschema/threadType/{threadType}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "threadType",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "ListMembersInputSchema": {
        "path": "/{connectionId}/flowbot/listmembersinputschema/threadType/{threadType}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "threadType",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "GetWebhookTriggerRequestSchema": {
        "path": "/{connectionId}/flowbot/webhookTrigger/inputSchema/threadType/{threadType}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "threadType",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "GetWebhookTriggerResponseSchema": {
        "path": "/{connectionId}/flowbot/webhookTrigger/triggerType/{triggerType}/responseSchema/threadType/{threadType}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "triggerType",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "threadType",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "GetMessageLocations": {
        "path": "/{connectionId}/flowbot/messageType/{messageType}/poster/{poster}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "messageType",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "poster",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetFeedNotificationInputSchema": {
        "path": "/{connectionId}/flowbot/getfeednotificationinputschema/poster/{poster}/notificationType/{notificationType}",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "poster",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "notificationType",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "object"
          }
        }
      },
      "GetVirtualAgentBots": {
        "path": "/{connectionId}/teams/proxy/pva/bots",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "HttpRequest": {
        "path": "/{connectionId}/httprequest",
        "method": "POST",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "Uri",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "Method",
            "in": "header",
            "required": true,
            "type": "string"
          },
          {
            "name": "Body",
            "in": "body",
            "required": false,
            "type": "object"
          },
          {
            "name": "ContentType",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "CustomHeader1",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "CustomHeader2",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "CustomHeader3",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "CustomHeader4",
            "in": "header",
            "required": false,
            "type": "string"
          },
          {
            "name": "CustomHeader5",
            "in": "header",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          },
          "default": {
            "type": "void"
          }
        }
      },
      "GetInstalledAppsForChat": {
        "path": "/{connectionId}/v1.0/chats/{chatId}/installedApps",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "chatId",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      },
      "WebhookResponse": {
        "path": "/whr",
        "method": "POST",
        "parameters": [],
        "responseInfo": {
          "default": {
            "type": "void"
          }
        }
      },
      "WebhookLifecycleNotification": {
        "path": "/whlifecycle",
        "method": "POST",
        "parameters": [],
        "responseInfo": {
          "default": {
            "type": "void"
          }
        }
      }
    }
  }
};
