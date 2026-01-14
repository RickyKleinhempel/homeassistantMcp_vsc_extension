/**
 * Tool: ha_get_error_log
 * Get Home Assistant error log
 */

import * as vscode from 'vscode';
import { HomeAssistantClient } from '../../api/client';
import { ToolDefinition, ToolResult, formatErrorResult } from './base';

export const getErrorLogTool: ToolDefinition = {
  name: 'ha_get_error_log',
  displayName: 'Home Assistant: Get Error Log',
  description:
    'Get the Home Assistant error log. Useful for troubleshooting issues and identifying problems with integrations or configurations.',

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
      const errorLog = await client.getErrorLog();

      // Split into lines and get last N lines for summary
      const lines = errorLog.split('\n').filter((line) => line.trim().length > 0);
      const recentLines = lines.slice(-100); // Last 100 lines

      // Try to identify error patterns
      const errorCount = lines.filter(
        (line) =>
          line.toLowerCase().includes('error') ||
          line.toLowerCase().includes('exception')
      ).length;

      const warningCount = lines.filter((line) =>
        line.toLowerCase().includes('warning')
      ).length;

      return {
        'text/plain': JSON.stringify(
          {
            total_lines: lines.length,
            error_count: errorCount,
            warning_count: warningCount,
            recent_entries: recentLines.length,
            log: recentLines.join('\n'),
          },
          null,
          2
        ),
      };
    } catch (error) {
      return formatErrorResult(error);
    }
  },
};
