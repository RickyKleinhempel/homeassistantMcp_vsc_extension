/**
 * Tool: ha_set_state
 * Set or update an entity state in Home Assistant
 */

import * as vscode from 'vscode';
import { HomeAssistantClient } from '../../api/client';
import { ToolDefinition, ToolResult, formatErrorResult, validateRequiredParam } from './base';

export const setStateTool: ToolDefinition = {
  name: 'ha_set_state',
  displayName: 'Home Assistant: Set State',
  description: 'Set or update an entity state in Home Assistant',
  requiresConfirmation: true,
  inputSchema: {
    type: 'object',
    properties: {
      entity_id: {
        type: 'string',
        description: 'Entity ID (e.g., "sensor.custom_sensor")'
      },
      state: {
        type: 'string',
        description: 'New state value'
      },
      attributes: {
        type: 'object',
        description: 'Entity attributes to set'
      }
    },
    required: ['entity_id', 'state']
  },
  invoke: async (
    client: HomeAssistantClient,
    params: Record<string, unknown>,
    _token: vscode.CancellationToken
  ): Promise<ToolResult> => {
    try {
      validateRequiredParam(params, 'entity_id', 'string');
      validateRequiredParam(params, 'state', 'string');

      const entityId = params.entity_id as string;
      const state = params.state as string;
      const attributes = params.attributes as Record<string, unknown> | undefined;

      const result = await client.setState(entityId, state, attributes);

      return {
        'text/plain': `## Entity State Updated ✏️\n\n**Entity ID:** \`${result.entity_id}\`\n\n**New State:** \`${result.state}\`\n\n**Attributes:**\n\`\`\`json\n${JSON.stringify(result.attributes, null, 2)}\n\`\`\`\n\n**Last Changed:** ${result.last_changed}\n**Last Updated:** ${result.last_updated}\n`
      };
    } catch (error) {
      return formatErrorResult(error);
    }
  }
};
