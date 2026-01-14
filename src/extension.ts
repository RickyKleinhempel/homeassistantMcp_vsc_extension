/**
 * Home Assistant MCP Extension
 * Provides MCP tools for GitHub Copilot to access Home Assistant REST API
 */

import * as vscode from 'vscode';
import { SettingsManager } from './config/settings';
import { ToolProvider } from './mcp/toolProvider';

let toolProvider: ToolProvider | undefined;

/**
 * Extension activation
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  console.log('Home Assistant MCP extension is activating...');

  // Initialize settings manager
  const settingsManager = new SettingsManager(context);

  // Initialize tool provider
  toolProvider = new ToolProvider(context, settingsManager);

  // Register commands
  registerCommands(context, settingsManager, toolProvider);

  // Listen for configuration changes
  context.subscriptions.push(
    settingsManager.onConfigurationChanged(() => {
      console.log('Configuration changed, refreshing tools...');
      void toolProvider?.refresh();
    })
  );

  // Initialize tools
  const initialized = await toolProvider.initialize();

  if (initialized) {
    void vscode.window.showInformationMessage(
      'Home Assistant MCP: Tools registered successfully!'
    );
  }
}

/**
 * Register extension commands
 */
function registerCommands(
  context: vscode.ExtensionContext,
  settingsManager: SettingsManager,
  toolProvider: ToolProvider
): void {
  // Command: Set Access Token
  context.subscriptions.push(
    vscode.commands.registerCommand('homeassistant-mcp.setToken', async () => {
      const token = await settingsManager.promptForToken();
      if (token) {
        void vscode.window.showInformationMessage(
          'Home Assistant MCP: Access token saved successfully!'
        );
        await toolProvider.refresh();
      }
    })
  );

  // Command: Test Connection
  context.subscriptions.push(
    vscode.commands.registerCommand('homeassistant-mcp.testConnection', async () => {
      await toolProvider.testConnection();
    })
  );

  // Command: Clear Token
  context.subscriptions.push(
    vscode.commands.registerCommand('homeassistant-mcp.clearToken', async () => {
      const confirm = await vscode.window.showWarningMessage(
        'Are you sure you want to clear the Home Assistant access token?',
        'Yes',
        'No'
      );

      if (confirm === 'Yes') {
        await settingsManager.clearToken();
        void vscode.window.showInformationMessage(
          'Home Assistant MCP: Access token cleared'
        );
      }
    })
  );
}

/**
 * Extension deactivation
 */
export function deactivate(): void {
  console.log('Home Assistant MCP extension is deactivating...');
  toolProvider?.dispose();
}
