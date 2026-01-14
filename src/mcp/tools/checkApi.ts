/**
 * Tool: ha_check_api
 * Check if the Home Assistant API is running
 */

import * as vscode from 'vscode';
import { HomeAssistantClient } from '../../api/client';
import { ToolDefinition, ToolResult, formatJsonResult, formatErrorResult } from './base';

export const checkApiTool: ToolDefinition = {
  name: 'ha_check_api',
  displayName: 'Home Assistant: Check API',
  description: 'Check if the Home Assistant API is running and accessible. Returns API status message.',
  
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },

  async invoke(
    client: HomeAssistantClient,
    _params: Record<string, unknown>,
    _token: vscode.CancellationToken
  ): Promise<ToolResult> {
    try {
      const result = await client.checkApi();
      return formatJsonResult({
        success: true,
        ...result,
      });
    } catch (error) {
      return formatErrorResult(error);
    }
  },
};
