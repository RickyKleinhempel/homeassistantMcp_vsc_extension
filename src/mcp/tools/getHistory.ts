/**
 * Tool: ha_get_history
 * Get historical state changes
 */

import * as vscode from 'vscode';
import { HomeAssistantClient } from '../../api/client';
import {
  ToolDefinition,
  ToolResult,
  formatJsonResult,
  formatErrorResult,
  getOptionalString,
  getOptionalBoolean,
} from './base';

export const getHistoryTool: ToolDefinition = {
  name: 'ha_get_history',
  displayName: 'Home Assistant: Get History',
  description:
    'Get historical state changes for entities. Useful for analyzing trends and past states. Can filter by entity ID and time range.',

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
        description:
          'Filter by entity ID. Can be a single entity or comma-separated list.',
      },
      minimal_response: {
        type: 'boolean',
        description:
          'Return minimal data (only state and last_changed). Recommended for large time ranges.',
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
      const minimalResponse = getOptionalBoolean(params, 'minimal_response');

      const history = await client.getHistory({
        timestamp,
        endTime,
        entityId,
        minimalResponse,
      });

      // Calculate some statistics
      const totalEntries = history.reduce((sum, entityHistory) => sum + entityHistory.length, 0);
      const entitiesWithHistory = history.length;

      return formatJsonResult({
        entities_with_history: entitiesWithHistory,
        total_entries: totalEntries,
        filters: {
          timestamp: timestamp || 'last 24 hours',
          end_time: endTime || 'now',
          entity_id: entityId || null,
          minimal_response: minimalResponse || false,
        },
        history: history,
      });
    } catch (error) {
      return formatErrorResult(error);
    }
  },
};
