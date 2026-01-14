/**
 * Tool: ha_get_config
 * Get Home Assistant configuration
 */

import * as vscode from 'vscode';
import { HomeAssistantClient } from '../../api/client';
import { ToolDefinition, ToolResult, formatJsonResult, formatErrorResult } from './base';

export const getConfigTool: ToolDefinition = {
  name: 'ha_get_config',
  displayName: 'Home Assistant: Get Configuration',
  description: 'Get Home Assistant configuration including location, timezone, version, and unit system. Useful for understanding the system setup.',
  
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
      const config = await client.getConfig();
      return formatJsonResult(config);
    } catch (error) {
      return formatErrorResult(error);
    }
  },
};
