/**
 * Tool: ha_check_config
 * Check Home Assistant configuration for errors
 */

import * as vscode from 'vscode';
import { HomeAssistantClient } from '../../api/client';
import { ToolDefinition, ToolResult, formatErrorResult } from './base';

export const checkConfigTool: ToolDefinition = {
  name: 'ha_check_config',
  displayName: 'Home Assistant: Check Configuration',
  description: 'Check Home Assistant configuration for errors',
  inputSchema: {
    type: 'object',
    properties: {}
  },
  invoke: async (
    client: HomeAssistantClient,
    _params: Record<string, unknown>,
    _token: vscode.CancellationToken
  ): Promise<ToolResult> => {
    try {
      const result = await client.checkConfig();

      const statusIcon = result.result === 'valid' ? '✅' : '❌';
      const statusText = result.result === 'valid' ? 'Valid' : 'Invalid';

      let response = `## Configuration Check ${statusIcon}\n\n**Status:** ${statusText}\n`;

      if (result.errors) {
        response += `\n**Errors:**\n\`\`\`\n${result.errors}\n\`\`\`\n`;
      } else {
        response += `\nNo configuration errors found. Your configuration is valid!\n`;
      }

      return {
        'text/plain': response
      };
    } catch (error) {
      return formatErrorResult(error);
    }
  }
};
