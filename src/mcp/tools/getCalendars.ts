/**
 * Tool: ha_get_calendars
 * Get available calendars
 */

import * as vscode from 'vscode';
import { HomeAssistantClient } from '../../api/client';
import { ToolDefinition, ToolResult, formatJsonResult, formatErrorResult } from './base';

export const getCalendarsTool: ToolDefinition = {
  name: 'ha_get_calendars',
  displayName: 'Home Assistant: Get Calendars',
  description:
    'Get all calendar entities in Home Assistant. Use this to find calendar entity IDs before querying calendar events.',

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
      const calendars = await client.getCalendars();

      // Sort by entity_id
      calendars.sort((a, b) => a.entity_id.localeCompare(b.entity_id));

      return formatJsonResult({
        count: calendars.length,
        calendars: calendars,
      });
    } catch (error) {
      return formatErrorResult(error);
    }
  },
};
