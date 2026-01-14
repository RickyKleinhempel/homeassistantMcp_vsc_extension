/**
 * Export all MCP tools
 */

// GET Tools (Phase 1)
export { checkApiTool } from './checkApi';
export { getConfigTool } from './getConfig';
export { getComponentsTool } from './getComponents';
export { getStatesTool } from './getStates';
export { getStateTool } from './getState';
export { getServicesTool } from './getServices';
export { getEventsTool } from './getEvents';
export { getHistoryTool } from './getHistory';
export { getLogbookTool } from './getLogbook';
export { getErrorLogTool } from './getErrorLog';
export { getCalendarsTool } from './getCalendars';
export { getCalendarEventsTool } from './getCalendarEvents';

// POST Tools (Phase 2)
export { callServiceTool } from './callService';
export { fireEventTool } from './fireEvent';
export { setStateTool } from './setState';
export { renderTemplateTool } from './renderTemplate';
export { checkConfigTool } from './checkConfig';
export { handleIntentTool } from './handleIntent';
export { deleteStateTool } from './deleteState';

export { ToolDefinition, ToolResult } from './base';

import { ToolDefinition } from './base';
// GET Tools
import { checkApiTool } from './checkApi';
import { getConfigTool } from './getConfig';
import { getComponentsTool } from './getComponents';
import { getStatesTool } from './getStates';
import { getStateTool } from './getState';
import { getServicesTool } from './getServices';
import { getEventsTool } from './getEvents';
import { getHistoryTool } from './getHistory';
import { getLogbookTool } from './getLogbook';
import { getErrorLogTool } from './getErrorLog';
import { getCalendarsTool } from './getCalendars';
import { getCalendarEventsTool } from './getCalendarEvents';
// POST Tools
import { callServiceTool } from './callService';
import { fireEventTool } from './fireEvent';
import { setStateTool } from './setState';
import { renderTemplateTool } from './renderTemplate';
import { checkConfigTool } from './checkConfig';
import { handleIntentTool } from './handleIntent';
import { deleteStateTool } from './deleteState';

/**
 * All available tools
 */
export const allTools: ToolDefinition[] = [
  // GET Tools (Phase 1)
  checkApiTool,
  getConfigTool,
  getComponentsTool,
  getStatesTool,
  getStateTool,
  getServicesTool,
  getEventsTool,
  getHistoryTool,
  getLogbookTool,
  getErrorLogTool,
  getCalendarsTool,
  getCalendarEventsTool,
  // POST Tools (Phase 2)
  callServiceTool,
  fireEventTool,
  setStateTool,
  renderTemplateTool,
  checkConfigTool,
  handleIntentTool,
  deleteStateTool,
];
