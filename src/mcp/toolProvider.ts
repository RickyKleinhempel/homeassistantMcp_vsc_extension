/**
 * MCP Tool Provider
 * Registers all Home Assistant MCP tools with VS Code
 */

import * as vscode from 'vscode';
import { HomeAssistantClient } from '../api/client';
import { SettingsManager } from '../config/settings';
import { allTools, ToolDefinition } from './tools';

/**
 * Tool Provider manages the registration and lifecycle of MCP tools
 */
export class ToolProvider {
  private readonly settingsManager: SettingsManager;
  private client: HomeAssistantClient | null = null;
  private registeredTools: vscode.Disposable[] = [];
  private outputChannel: vscode.OutputChannel;

  constructor(
    context: vscode.ExtensionContext,
    settingsManager: SettingsManager
  ) {
    this.settingsManager = settingsManager;
    this.outputChannel = vscode.window.createOutputChannel('Home Assistant MCP');
    context.subscriptions.push(this.outputChannel);
  }

  /**
   * Initialize the tool provider
   */
  async initialize(): Promise<boolean> {
    this.log('Initializing Home Assistant MCP Tool Provider...');

    // Validate configuration
    const validation = this.settingsManager.validateConfiguration();
    if (!validation.valid) {
      this.log(`Configuration errors: ${validation.errors.join(', ')}`);
      void vscode.window.showErrorMessage(
        `Home Assistant MCP: Configuration error - ${validation.errors.join(', ')}`
      );
      return false;
    }

    // Check for token
    const hasToken = await this.settingsManager.hasToken();
    if (!hasToken) {
      this.log('No access token configured');
      const action = await vscode.window.showWarningMessage(
        'Home Assistant MCP: No access token configured. Would you like to set one now?',
        'Set Token',
        'Later'
      );

      if (action === 'Set Token') {
        const token = await this.settingsManager.promptForToken();
        if (!token) {
          this.log('Token setup cancelled');
          return false;
        }
      } else {
        return false;
      }
    }

    // Create client and register tools
    return this.createClientAndRegisterTools();
  }

  /**
   * Create the API client and register all tools
   */
  private async createClientAndRegisterTools(): Promise<boolean> {
    try {
      const settings = this.settingsManager.getSettings();
      const token = await this.settingsManager.getToken();

      if (!token) {
        this.log('No token available');
        return false;
      }

      // Create client
      this.client = new HomeAssistantClient({
        baseUrl: settings.url,
        token,
        timeout: settings.requestTimeout,
        validateSsl: settings.validateSsl,
      });

      // Test connection
      this.log(`Testing connection to ${settings.url}...`);
      try {
        await this.client.checkApi();
        this.log('Connection successful!');
      } catch (error) {
        this.log(`Connection failed: ${error instanceof Error ? error.message : String(error)}`);
        void vscode.window.showErrorMessage(
          `Home Assistant MCP: Failed to connect to Home Assistant. Check your URL and token.`
        );
        return false;
      }

      // Register all tools
      this.registerTools();

      this.log(`Successfully registered ${this.registeredTools.length} MCP tools`);
      return true;
    } catch (error) {
      this.log(`Error during initialization: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Register all MCP tools with VS Code
   */
  private registerTools(): void {
    // Dispose existing tools
    this.disposeTools();

    if (!this.client) {
      this.log('Cannot register tools: client not initialized');
      return;
    }

    const client = this.client;

    for (const toolDef of allTools) {
      try {
        const tool = this.createTool(toolDef, client);
        this.registeredTools.push(tool);
        this.log(`Registered tool: ${toolDef.name}`);
      } catch (error) {
        this.log(`Failed to register tool ${toolDef.name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Create a single MCP tool
   */
  private createTool(
    toolDef: ToolDefinition,
    client: HomeAssistantClient
  ): vscode.Disposable {
    // Create a tool implementation that only has the invoke method
    // The metadata (description, inputSchema) comes from package.json languageModelTools
    const tool: vscode.LanguageModelTool<Record<string, unknown>> = {
      invoke: async (
        options: vscode.LanguageModelToolInvocationOptions<Record<string, unknown>>,
        token: vscode.CancellationToken
      ): Promise<vscode.LanguageModelToolResult> => {
        this.log(`Invoking tool: ${toolDef.name}`);

        try {
          const params = options.input ?? {};
          const result = await toolDef.invoke(client, params, token);

          // Convert our result to VS Code's expected format
          const content = result['text/plain'] || '';

          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(content),
          ]);
        } catch (error) {
          this.log(`Tool ${toolDef.name} error: ${error instanceof Error ? error.message : String(error)}`);

          const errorResult = {
            error: true,
            message: error instanceof Error ? error.message : String(error),
          };

          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(JSON.stringify(errorResult, null, 2)),
          ]);
        }
      },
    };

    return vscode.lm.registerTool(toolDef.name, tool);
  }

  /**
   * Dispose all registered tools
   */
  private disposeTools(): void {
    for (const tool of this.registeredTools) {
      tool.dispose();
    }
    this.registeredTools = [];
  }

  /**
   * Refresh tools (re-register with new settings)
   */
  async refresh(): Promise<void> {
    this.log('Refreshing tools...');
    this.disposeTools();
    await this.createClientAndRegisterTools();
  }

  /**
   * Test the connection to Home Assistant
   */
  async testConnection(): Promise<boolean> {
    if (!this.client) {
      const settings = this.settingsManager.getSettings();
      const token = await this.settingsManager.getToken();

      if (!token) {
        void vscode.window.showErrorMessage('Home Assistant MCP: No access token configured');
        return false;
      }

      this.client = new HomeAssistantClient({
        baseUrl: settings.url,
        token,
        timeout: settings.requestTimeout,
        validateSsl: settings.validateSsl,
      });
    }

    try {
      const result = await this.client.checkApi();
      void vscode.window.showInformationMessage(
        `Home Assistant MCP: Connection successful! ${result.message}`
      );
      return true;
    } catch (error) {
      void vscode.window.showErrorMessage(
        `Home Assistant MCP: Connection failed - ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  }

  /**
   * Log a message to the output channel
   */
  private log(message: string): void {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] ${message}`);
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    this.disposeTools();
    this.outputChannel.dispose();
  }
}
