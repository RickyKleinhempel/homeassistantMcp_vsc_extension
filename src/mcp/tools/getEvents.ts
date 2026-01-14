/**
 * Tool: ha_get_events
 * Get available event types
 */

import * as vscode from 'vscode';
import { HomeAssistantClient } from '../../api/client';
import { ToolDefinition, ToolResult, formatJsonResult, formatErrorResult } from './base';

export const getEventsTool: ToolDefinition = {
  name: 'ha_get_events',
  displayName: 'Home Assistant: Get Events',
  description:
    'Get all available event types in Home Assistant. Events are used for automation triggers (e.g., state_changed, call_service, automation_triggered).',

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
      const events = await client.getEvents();

      // Sort by event name
      events.sort((a, b) => a.event.localeCompare(b.event));

      return formatJsonResult({
        count: events.length,
        events: events,
      });
    } catch (error) {
      return formatErrorResult(error);
    }
  },
};
