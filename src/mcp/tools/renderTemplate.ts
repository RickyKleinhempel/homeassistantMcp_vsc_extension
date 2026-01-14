/**
 * Tool: ha_render_template
 * Render a Jinja2 template in Home Assistant
 */

import * as vscode from 'vscode';
import { HomeAssistantClient } from '../../api/client';
import { ToolDefinition, ToolResult, formatErrorResult, validateRequiredParam } from './base';

export const renderTemplateTool: ToolDefinition = {
  name: 'ha_render_template',
  displayName: 'Home Assistant: Render Template',
  description: 'Render a Jinja2 template in Home Assistant',
  inputSchema: {
    type: 'object',
    properties: {
      template: {
        type: 'string',
        description: 'Jinja2 template string (e.g., "{{ states.sensor.temperature.state }}")'
      },
      variables: {
        type: 'object',
        description: 'Variables to pass to the template'
      }
    },
    required: ['template']
  },
  invoke: async (
    client: HomeAssistantClient,
    params: Record<string, unknown>,
    _token: vscode.CancellationToken
  ): Promise<ToolResult> => {
    try {
      validateRequiredParam(params, 'template', 'string');

      const template = params.template as string;
      const variables = params.variables as Record<string, unknown> | undefined;

      const result = await client.renderTemplate(template, variables);

      const variablesSection = variables
        ? `**Variables:**\n\`\`\`json\n${JSON.stringify(variables, null, 2)}\n\`\`\`\n\n`
        : '';

      return {
        'text/plain': `## Template Rendered 📝\n\n**Template:**\n\`\`\`jinja2\n${template}\n\`\`\`\n\n${variablesSection}**Result:**\n\`\`\`\n${result}\n\`\`\`\n`
      };
    } catch (error) {
      return formatErrorResult(error);
    }
  }
};
