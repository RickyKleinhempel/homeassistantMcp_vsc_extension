/**
 * Tool: ha_get_states
 * Get all entity states with optional filtering
 */

import * as vscode from 'vscode';
import { HomeAssistantClient } from '../../api/client';
import { EntityState } from '../../api/types';
import {
  ToolDefinition,
  ToolResult,
  formatJsonResult,
  formatErrorResult,
  getOptionalString,
} from './base';

export const getStatesTool: ToolDefinition = {
  name: 'ha_get_states',
  displayName: 'Home Assistant: Get States',
  description:
    'Get all entity states from Home Assistant. This is the main tool for finding entity IDs and their current states. Can filter by domain (e.g., "light", "sensor", "switch") or search in entity_id and friendly_name.',

  inputSchema: {
    type: 'object',
    properties: {
      domain: {
        type: 'string',
        description:
          'Filter entities by domain (e.g., "light", "sensor", "switch", "binary_sensor", "climate", "cover")',
      },
      search: {
        type: 'string',
        description:
          'Search term to filter entities by entity_id or friendly_name (case-insensitive)',
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
      const domain = getOptionalString(params, 'domain');
      const search = getOptionalString(params, 'search')?.toLowerCase();

      const states = await client.getStates();

      let filtered: EntityState[] = states;

      // Filter by domain
      if (domain) {
        const normalizedDomain = domain.toLowerCase().replace(/\.$/, '');
        filtered = filtered.filter((s) =>
          s.entity_id.toLowerCase().startsWith(normalizedDomain + '.')
        );
      }

      // Filter by search term
      if (search) {
        filtered = filtered.filter((s) => {
          const entityIdMatch = s.entity_id.toLowerCase().includes(search);
          const friendlyNameMatch = s.attributes.friendly_name
            ?.toLowerCase()
            .includes(search);
          return entityIdMatch || friendlyNameMatch;
        });
      }

      // Sort by entity_id for consistent output
      filtered.sort((a, b) => a.entity_id.localeCompare(b.entity_id));

      // Create a summary for easier consumption
      const summary = filtered.map((s) => ({
        entity_id: s.entity_id,
        state: s.state,
        friendly_name: s.attributes.friendly_name,
        last_changed: s.last_changed,
      }));

      return formatJsonResult({
        count: filtered.length,
        total_entities: states.length,
        filters: {
          domain: domain || null,
          search: search || null,
        },
        entities: summary,
      });
    } catch (error) {
      return formatErrorResult(error);
    }
  },
};
