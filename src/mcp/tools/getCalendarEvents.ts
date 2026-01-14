/**
 * Tool: ha_get_calendar_events
 * Get events from a specific calendar
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

export const getCalendarEventsTool: ToolDefinition = {
  name: 'ha_get_calendar_events',
  displayName: 'Home Assistant: Get Calendar Events',
  description:
    'Get events from a specific calendar within a time range. Requires calendar entity ID and start/end times.',

  inputSchema: {
    type: 'object',
    properties: {
      calendar_entity_id: {
        type: 'string',
        description:
          'The calendar entity ID (e.g., "calendar.personal"). Use ha_get_calendars to find available calendars.',
      },
      start: {
        type: 'string',
        description:
          'Start time in ISO 8601 format (e.g., "2024-01-01T00:00:00")',
      },
      end: {
        type: 'string',
        description: 'End time in ISO 8601 format (e.g., "2024-01-31T23:59:59")',
      },
    },
    required: ['calendar_entity_id', 'start', 'end'],
  },

  async invoke(
    client: HomeAssistantClient,
    params: Record<string, unknown>,
    _token: vscode.CancellationToken
  ): Promise<ToolResult> {
    try {
      validateRequiredParam(params, 'calendar_entity_id', 'string');
      validateRequiredParam(params, 'start', 'string');
      validateRequiredParam(params, 'end', 'string');

      const calendarEntityId = params.calendar_entity_id as string;
      const start = params.start as string;
      const end = params.end as string;

      const events = await client.getCalendarEvents(calendarEntityId, start, end);

      return formatJsonResult({
        calendar: calendarEntityId,
        time_range: {
          start,
          end,
        },
        count: events.length,
        events: events,
      });
    } catch (error) {
      return formatErrorResult(error);
    }
  },
};
