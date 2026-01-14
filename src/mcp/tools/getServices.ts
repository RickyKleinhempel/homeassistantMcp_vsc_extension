/**
 * Tool: ha_get_services
 * Get available services with optional domain filter
 */

import * as vscode from 'vscode';
import { HomeAssistantClient } from '../../api/client';
import { ServiceDomain } from '../../api/types';
import {
  ToolDefinition,
  ToolResult,
  formatJsonResult,
  formatErrorResult,
  getOptionalString,
} from './base';

export const getServicesTool: ToolDefinition = {
  name: 'ha_get_services',
  displayName: 'Home Assistant: Get Services',
  description:
    'Get all available services and their parameters. Services are actions you can call (e.g., light.turn_on, switch.toggle). Can filter by domain to see services for a specific entity type.',

  inputSchema: {
    type: 'object',
    properties: {
      domain: {
        type: 'string',
        description:
          'Filter services by domain (e.g., "light", "switch", "climate", "automation")',
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
      const domain = getOptionalString(params, 'domain')?.toLowerCase();

      const services = await client.getServices();

      let filtered: ServiceDomain[] = services;

      // Filter by domain if specified
      if (domain) {
        filtered = filtered.filter((s) => s.domain.toLowerCase() === domain);
      }

      // Sort by domain
      filtered.sort((a, b) => a.domain.localeCompare(b.domain));

      // Create a more readable output
      const output = filtered.map((domainServices) => ({
        domain: domainServices.domain,
        services: Object.entries(domainServices.services).map(([name, def]) => ({
          service: `${domainServices.domain}.${name}`,
          name: def.name || name,
          description: def.description,
          fields: def.fields
            ? Object.entries(def.fields).map(([fieldName, field]) => ({
                name: fieldName,
                description: field.description,
                required: field.required || false,
                example: field.example,
              }))
            : [],
        })),
      }));

      return formatJsonResult({
        count: output.reduce((sum, d) => sum + d.services.length, 0),
        domains: output.length,
        filter: domain || null,
        services: output,
      });
    } catch (error) {
      return formatErrorResult(error);
    }
  },
};
