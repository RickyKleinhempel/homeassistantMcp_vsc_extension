/**
 * Base tool interface and utilities for MCP tools
 */

import * as vscode from 'vscode';
import { HomeAssistantClient, HomeAssistantApiError } from '../../api/client';

/**
 * Tool result with content
 */
export interface ToolResult {
  [mimeType: string]: string;
}

/**
 * Format a successful result as JSON
 */
export function formatJsonResult(data: unknown): ToolResult {
  return {
    'text/plain': JSON.stringify(data, null, 2),
  };
}

/**
 * Format an error result
 */
export function formatErrorResult(error: unknown): ToolResult {
  if (error instanceof HomeAssistantApiError) {
    const errorInfo = {
      error: true,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      suggestions: getSuggestionsForError(error),
    };
    return {
      'text/plain': JSON.stringify(errorInfo, null, 2),
    };
  }

  if (error instanceof Error) {
    return {
      'text/plain': JSON.stringify(
        {
          error: true,
          message: error.message,
        },
        null,
        2
      ),
    };
  }

  return {
    'text/plain': JSON.stringify(
      {
        error: true,
        message: String(error),
      },
      null,
      2
    ),
  };
}

/**
 * Get suggestions based on error type
 */
function getSuggestionsForError(error: HomeAssistantApiError): string[] {
  const suggestions: string[] = [];

  if (error.isAuthError()) {
    suggestions.push('Check if your access token is valid');
    suggestions.push('Generate a new Long-Lived Access Token in Home Assistant');
    suggestions.push('Run "Home Assistant MCP: Set Access Token" command');
  } else if (error.isNotFoundError()) {
    suggestions.push('Verify the entity ID exists');
    suggestions.push('Use ha_get_states to list all available entities');
  } else if (error.isTimeoutError()) {
    suggestions.push('Check if Home Assistant is running');
    suggestions.push('Verify the URL in settings');
    suggestions.push('Increase the request timeout in settings');
  } else if (error.isNetworkError()) {
    suggestions.push('Check your network connection');
    suggestions.push('Verify the Home Assistant URL is correct');
    suggestions.push('Ensure Home Assistant is accessible from this machine');
  }

  return suggestions;
}

/**
 * Base class for tool parameters validation
 */
export function validateRequiredParam(
  params: Record<string, unknown>,
  paramName: string,
  paramType: 'string' | 'number' | 'boolean'
): void {
  const value = params[paramName];

  if (value === undefined || value === null) {
    throw new Error(`Required parameter '${paramName}' is missing`);
  }

  if (paramType === 'string' && typeof value !== 'string') {
    throw new Error(`Parameter '${paramName}' must be a string`);
  }

  if (paramType === 'number' && typeof value !== 'number') {
    throw new Error(`Parameter '${paramName}' must be a number`);
  }

  if (paramType === 'boolean' && typeof value !== 'boolean') {
    throw new Error(`Parameter '${paramName}' must be a boolean`);
  }
}

/**
 * Get optional string parameter
 */
export function getOptionalString(
  params: Record<string, unknown>,
  paramName: string
): string | undefined {
  const value = params[paramName];
  if (value === undefined || value === null) {
    return undefined;
  }
  return String(value);
}

/**
 * Get optional boolean parameter
 */
export function getOptionalBoolean(
  params: Record<string, unknown>,
  paramName: string
): boolean | undefined {
  const value = params[paramName];
  if (value === undefined || value === null) {
    return undefined;
  }
  return Boolean(value);
}

/**
 * Tool definition interface
 */
export interface ToolDefinition {
  name: string;
  displayName: string;
  description: string;
  inputSchema: object;
  invoke: (
    client: HomeAssistantClient,
    params: Record<string, unknown>,
    token: vscode.CancellationToken
  ) => Promise<ToolResult>;
}
