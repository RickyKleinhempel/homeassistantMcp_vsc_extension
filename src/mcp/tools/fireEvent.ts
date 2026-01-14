/**
 * Tool: ha_fire_event
 * Fire a custom event in Home Assistant
 */

import * as vscode from 'vscode';
import { HomeAssistantClient } from '../../api/client';
import { ToolDefinition, ToolResult, formatErrorResult, validateRequiredParam } from './base';

export const fireEventTool: ToolDefinition = {
  name: 'ha_fire_event',
  displayName: 'Home Assistant: Fire Event',
  description: 'Fire a custom event in Home Assistant',
  inputSchema: {
    type: 'object',
    properties: {
      event_type: {
        type: 'string',
        description: 'Event type name (e.g., "my_custom_event")'
      },
      event_data: {
        type: 'object',
        description: 'Event data payload'
      }
    },
    required: ['event_type']
  },
  invoke: async (
    client: HomeAssistantClient,
    params: Record<string, unknown>,
    _token: vscode.CancellationToken
  ): Promise<ToolResult> => {
    try {
      validateRequiredParam(params, 'event_type', 'string');

      const eventType = params.event_type as string;
      const eventData = params.event_data as Record<string, unknown> | undefined;

      const result = await client.fireEvent(eventType, eventData);

      return {
        'text/plain': `## Event Fired Successfully 🎯\n\n**Event Type:** \`${eventType}\`\n\n**Event Data:**\n\`\`\`json\n${JSON.stringify(eventData || {}, null, 2)}\n\`\`\`\n\n**Response:** ${result.message || 'Event fired successfully'}\n`
      };
    } catch (error) {
      return formatErrorResult(error);
    }
  }
};
