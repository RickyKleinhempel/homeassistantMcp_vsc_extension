/**
 * Configuration and settings management
 * Handles VS Code settings and secure token storage
 */

import * as vscode from 'vscode';

const CONFIG_SECTION = 'homeassistant-mcp';
const TOKEN_SECRET_KEY = 'homeassistant-access-token';

/**
 * Extension settings interface
 */
export interface ExtensionSettings {
  url: string;
  validateSsl: boolean;
  requestTimeout: number;
}

/**
 * Settings manager for Home Assistant MCP extension
 */
export class SettingsManager {
  private readonly context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  /**
   * Get all extension settings
   */
  getSettings(): ExtensionSettings {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);

    return {
      url: config.get<string>('url', 'http://homeassistant.local:8123'),
      validateSsl: config.get<boolean>('validateSsl', true),
      requestTimeout: config.get<number>('requestTimeout', 10000),
    };
  }

  /**
   * Get the Home Assistant URL
   */
  getUrl(): string {
    return this.getSettings().url;
  }

  /**
   * Store the access token securely
   */
  async storeToken(token: string): Promise<void> {
    await this.context.secrets.store(TOKEN_SECRET_KEY, token);
  }

  /**
   * Retrieve the access token
   */
  async getToken(): Promise<string | undefined> {
    return this.context.secrets.get(TOKEN_SECRET_KEY);
  }

  /**
   * Clear the stored access token
   */
  async clearToken(): Promise<void> {
    await this.context.secrets.delete(TOKEN_SECRET_KEY);
  }

  /**
   * Check if a token is configured
   */
  async hasToken(): Promise<boolean> {
    const token = await this.getToken();
    return token !== undefined && token.length > 0;
  }

  /**
   * Prompt user to enter access token
   */
  async promptForToken(): Promise<string | undefined> {
    const token = await vscode.window.showInputBox({
      prompt: 'Enter your Home Assistant Long-Lived Access Token',
      placeHolder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      password: true,
      ignoreFocusOut: true,
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Token cannot be empty';
        }
        if (value.trim().length < 10) {
          return 'Token seems too short';
        }
        return null;
      },
    });

    if (token) {
      await this.storeToken(token.trim());
      return token.trim();
    }

    return undefined;
  }

  /**
   * Listen for configuration changes
   */
  onConfigurationChanged(
    callback: (e: vscode.ConfigurationChangeEvent) => void
  ): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(CONFIG_SECTION)) {
        callback(e);
      }
    });
  }

  /**
   * Validate the current configuration
   */
  validateConfiguration(): { valid: boolean; errors: string[] } {
    const settings = this.getSettings();
    const errors: string[] = [];

    // Validate URL
    try {
      const url = new URL(settings.url);
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.push('URL must use http or https protocol');
      }
    } catch {
      errors.push('Invalid URL format');
    }

    // Validate timeout
    if (settings.requestTimeout < 1000) {
      errors.push('Request timeout should be at least 1000ms');
    }
    if (settings.requestTimeout > 60000) {
      errors.push('Request timeout should not exceed 60000ms');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
