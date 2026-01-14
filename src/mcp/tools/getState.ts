/**
 * Tool: ha_get_state
 * Get state of a specific entity
 */

import * as vscode from 'vscode';
import { HomeAssistantClient } from '../../api/client';
import {
  ToolDefinition,
  ToolResult,
  formatJsonResult,
  formatErrorResult,
  validateRequiredParam,
} from './base';

export const getStateTool: ToolDefinition = {
  name: 'ha_get_state',
  displayName: 'Home Assistant: Get Entity State',
  description:
    'Get the current state and attributes of a specific entity. Returns detailed information including all attributes, last changed time, and context.',

  inputSchema: {
    type: 'object',
    properties: {
      entity_id: {
        type: 'string',
        description:
          'The entity ID to get state for (e.g., "light.living_room", "sensor.temperature")',
      },
    },
    required: ['entity_id'],
  },

  async invoke(
    client: HomeAssistantClient,
    params: Record<string, unknown>,
    _token: vscode.CancellationToken
  ): Promise<ToolResult> {
    try {
      validateRequiredParam(params, 'entity_id', 'string');
      const entityId = params.entity_id as string;

      const state = await client.getState(entityId);

      return formatJsonResult(state);
    } catch (error) {
      return formatErrorResult(error);
    }
  },
};
