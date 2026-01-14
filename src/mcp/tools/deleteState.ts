/**
 * Tool: ha_delete_state
 * Delete an entity state from Home Assistant
 */

import * as vscode from 'vscode';
import { HomeAssistantClient } from '../../api/client';
import { ToolDefinition, ToolResult, formatErrorResult, validateRequiredParam } from './base';

export const deleteStateTool: ToolDefinition = {
  name: 'ha_delete_state',
  displayName: 'Home Assistant: Delete State',
  description: 'Delete an entity state from Home Assistant',
  inputSchema: {
    type: 'object',
    properties: {
      entity_id: {
        type: 'string',
        description: 'Entity ID to delete (e.g., "sensor.custom_sensor")'
      }
    },
    required: ['entity_id']
  },
  invoke: async (
    client: HomeAssistantClient,
    params: Record<string, unknown>,
    _token: vscode.CancellationToken
  ): Promise<ToolResult> => {
    try {
      validateRequiredParam(params, 'entity_id', 'string');

      const entityId = params.entity_id as string;

      const result = await client.deleteState(entityId);

      return {
        'text/plain': `## Entity State Deleted 🗑️\n\n**Entity ID:** \`${entityId}\`\n\n**Result:** ${result.message || 'Entity state deleted successfully'}\n\n> **Note:** This removes the entity state from Home Assistant's state machine.\n> If the entity is provided by an integration, it will be recreated on the next update.\n`
      };
    } catch (error) {
      return formatErrorResult(error);
    }
  }
};
