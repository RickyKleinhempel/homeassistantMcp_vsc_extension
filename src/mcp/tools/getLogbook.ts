/**
 * Tool: ha_get_logbook
 * Get logbook entries
 */

import * as vscode from 'vscode';
import { HomeAssistantClient } from '../../api/client';
import {
  ToolDefinition,
  ToolResult,
  formatJsonResult,
  formatErrorResult,
  getOptionalString,
} from './base';

export const getLogbookTool: ToolDefinition = {
  name: 'ha_get_logbook',
  displayName: 'Home Assistant: Get Logbook',
  description:
    'Get logbook entries showing what happened in Home Assistant. Useful for debugging and understanding system activity.',

  inputSchema: {
    type: 'object',
    properties: {
      timestamp: {
        type: 'string',
        description:
          'Start time in ISO 8601 format (e.g., "2024-01-01T00:00:00"). Defaults to 1 day ago.',
      },
      end_time: {
        type: 'string',
        description: 'End time in ISO 8601 format. Defaults to now.',
      },
      entity_id: {
        type: 'string',
        description: 'Filter by entity ID to see activity for a specific entity.',
      },
    },
    required: [],
  },

  async invoke(
    client: HomeAssistantClient,
    params: Record<string, unknown>,
    _token: vscode.CancellationToken
  ): Promise<ToolResult> {
    try {
      const timestamp = getOptionalString(params, 'timestamp');
      const endTime = getOptionalString(params, 'end_time');
      const entityId = getOptionalString(params, 'entity_id');

      const logbook = await client.getLogbook({
        timestamp,
        endTime,
        entityId,
      });

      return formatJsonResult({
        count: logbook.length,
        filters: {
          timestamp: timestamp || 'last 24 hours',
          end_time: endTime || 'now',
          entity_id: entityId || null,
        },
        entries: logbook,
      });
    } catch (error) {
      return formatErrorResult(error);
    }
  },
};
