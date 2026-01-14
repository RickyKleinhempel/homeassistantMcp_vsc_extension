/**
 * Tool: ha_get_components
 * Get loaded Home Assistant components
 */

import * as vscode from 'vscode';
import { HomeAssistantClient } from '../../api/client';
import { ToolDefinition, ToolResult, formatJsonResult, formatErrorResult } from './base';

export const getComponentsTool: ToolDefinition = {
  name: 'ha_get_components',
  displayName: 'Home Assistant: Get Components',
  description: 'Get a list of all loaded Home Assistant components and integrations. Useful for checking which integrations are available.',
  
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
      const components = await client.getComponents();
      return formatJsonResult({
        count: components.length,
        components: components.sort(),
      });
    } catch (error) {
      return formatErrorResult(error);
    }
  },
};
