/**
 * Tool: ha_call_service
 * Call a Home Assistant service/action
 */

import * as vscode from 'vscode';
import { HomeAssistantClient } from '../../api/client';
import { ToolDefinition, ToolResult, formatErrorResult, validateRequiredParam } from './base';
import { ServiceCallTarget } from '../../api/types';

export const callServiceTool: ToolDefinition = {
  name: 'ha_call_service',
  displayName: 'Home Assistant: Call Service',
  description: 'Call a Home Assistant service/action to control devices',
  requiresConfirmation: true,
  inputSchema: {
    type: 'object',
    properties: {
      domain: {
        type: 'string',
        description: 'Service domain (e.g., "light", "switch", "climate")'
      },
      service: {
        type: 'string',
        description: 'Service name (e.g., "turn_on", "turn_off", "toggle")'
      },
      service_data: {
        type: 'object',
        description: 'Additional service data (e.g., brightness, color)'
      },
      target: {
        type: 'object',
        description: 'Target entities, devices, or areas',
        properties: {
          entity_id: { type: ['string', 'array'] },
          device_id: { type: ['string', 'array'] },
          area_id: { type: ['string', 'array'] }
        }
      }
    },
    required: ['domain', 'service']
  },
  invoke: async (
    client: HomeAssistantClient,
    params: Record<string, unknown>,
    _token: vscode.CancellationToken
  ): Promise<ToolResult> => {
    try {
      validateRequiredParam(params, 'domain', 'string');
      validateRequiredParam(params, 'service', 'string');

      const domain = params.domain as string;
      const service = params.service as string;
      const serviceData = params.service_data as Record<string, unknown> | undefined;
      const target = params.target as ServiceCallTarget | undefined;

      const result = await client.callService(domain, service, serviceData, target);

      const response = {
        success: true,
        action: `${domain}.${service}`,
        target: target || 'none specified',
        service_data: serviceData || {},
        result: result.response || 'Service called successfully'
      };

      return {
        'text/plain': `## Service Call Result ✅\n\n**Action:** \`${domain}.${service}\`\n\n**Target:** ${JSON.stringify(target || 'all', null, 2)}\n\n**Service Data:**\n\`\`\`json\n${JSON.stringify(serviceData || {}, null, 2)}\n\`\`\`\n\n**Result:**\n\`\`\`json\n${JSON.stringify(response.result, null, 2)}\n\`\`\`\n`
      };
    } catch (error) {
      return formatErrorResult(error);
    }
  }
};
