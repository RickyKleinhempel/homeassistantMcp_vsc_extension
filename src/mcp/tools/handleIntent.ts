/**
 * Tool: ha_handle_intent
 * Handle a conversation intent in Home Assistant
 */

import * as vscode from 'vscode';
import { HomeAssistantClient } from '../../api/client';
import { ToolDefinition, ToolResult, formatErrorResult, validateRequiredParam } from './base';
import { IntentSlotValue } from '../../api/types';

export const handleIntentTool: ToolDefinition = {
  name: 'ha_handle_intent',
  displayName: 'Home Assistant: Handle Intent',
  description: 'Handle a conversation intent in Home Assistant',
  requiresConfirmation: true,
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Intent name (e.g., "HassTurnOn", "HassTurnOff")'
      },
      data: {
        type: 'object',
        description: 'Intent slot values'
      }
    },
    required: ['name']
  },
  invoke: async (
    client: HomeAssistantClient,
    params: Record<string, unknown>,
    _token: vscode.CancellationToken
  ): Promise<ToolResult> => {
    try {
      validateRequiredParam(params, 'name', 'string');

      const name = params.name as string;
      const data = params.data as Record<string, IntentSlotValue> | undefined;

      const result = await client.handleIntent(name, data);

      const speechText = result.speech?.plain?.speech || 'No speech response';
      const dataSection = data
        ? `**Intent Data:**\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\n`
        : '';

      let response = `## Intent Handled 🗣️\n\n**Intent Name:** \`${name}\`\n\n${dataSection}**Response Type:** ${result.response_type || 'unknown'}\n\n**Speech Response:**\n> ${speechText}\n\n**Language:** ${result.language || 'unknown'}\n`;

      if (result.data?.targets?.length) {
        response += `\n**Targets:** ${JSON.stringify(result.data.targets)}`;
      }
      if (result.data?.success?.length) {
        response += `\n**Successful:** ${JSON.stringify(result.data.success)}`;
      }
      if (result.data?.failed?.length) {
        response += `\n**Failed:** ${JSON.stringify(result.data.failed)}`;
      }

      return {
        'text/plain': response
      };
    } catch (error) {
      return formatErrorResult(error);
    }
  }
};
