# Home Assistant MCP Tools for GitHub Copilot

A VS Code extension that provides MCP (Model Context Protocol) tools for GitHub Copilot to access your Home Assistant instance via the REST API.

## Features

- 🏠 **Direct Home Assistant Access**: GitHub Copilot can query your Home Assistant directly
- 🔍 **Entity Discovery**: Find entity IDs, states, and attributes
- 📋 **Service Information**: Get available services and their parameters
- 📊 **History & Logbook**: Access historical data and activity logs
- 📅 **Calendar Integration**: Query calendar events
- ⚡ **Service Control**: Call services to control devices (lights, switches, scenes, etc.)
- 🎯 **Event System**: Fire custom events and handle intents
- 📝 **Template Rendering**: Render Jinja2 templates for complex calculations
- 🔒 **Secure Token Storage**: Access tokens stored in VS Code's secure storage

## Available Tools

### Read Operations (GET)

| Tool | Description |
|------|-------------|
| `ha_check_api` | Check if Home Assistant API is accessible |
| `ha_get_config` | Get Home Assistant configuration |
| `ha_get_components` | List loaded integrations |
| `ha_get_states` | Get all entity states (with filtering) |
| `ha_get_state` | Get state of a specific entity |
| `ha_get_services` | List available services |
| `ha_get_events` | List available event types |
| `ha_get_history` | Get historical state changes |
| `ha_get_logbook` | Get logbook entries |
| `ha_get_error_log` | Get error log |
| `ha_get_calendars` | List calendar entities |
| `ha_get_calendar_events` | Get calendar events |

### Write Operations (POST/DELETE)

| Tool | Description |
|------|-------------|
| `ha_call_service` | Call a Home Assistant service (e.g., turn on lights, activate scenes) |
| `ha_fire_event` | Fire a custom event to trigger automations |
| `ha_set_state` | Set or create an entity state |
| `ha_render_template` | Render a Jinja2 template |
| `ha_check_config` | Validate Home Assistant configuration files |
| `ha_handle_intent` | Handle conversation/voice intents |
| `ha_delete_state` | Delete an entity state |

## Installation

### 1. Install the Extension

**From VS Code Marketplace:**
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "Home Assistant MCP"
4. Click "Install"

### 2. Configure Home Assistant URL

1. Open VS Code Settings (`Ctrl+,`)
2. Search for "homeassistant-mcp"
3. Set **URL** to your Home Assistant address:
   - Local: `http://homeassistant.local:8123`
   - IP-based: `http://192.168.1.100:8123`
   - Nabu Casa: `https://your-instance.ui.nabu.casa`

### 3. Set Your Access Token

1. Open the Command Palette (`Ctrl+Shift+P`)
2. Run: **Home Assistant MCP: Set Access Token**
3. Paste your Long-Lived Access Token
4. Test the connection: **Home Assistant MCP: Test Connection**

### Getting a Long-Lived Access Token

1. Open your Home Assistant instance
2. Go to your profile (click on your username in the sidebar)
3. Scroll down to "Long-Lived Access Tokens"
4. Click "Create Token"
5. Give it a name (e.g., "VS Code Copilot")
6. Copy the token (you'll only see it once!)

## Configuration

### VS Code Settings

```json
{
  "homeassistant-mcp.url": "http://homeassistant.local:8123",
  "homeassistant-mcp.validateSsl": true,
  "homeassistant-mcp.requestTimeout": 10000
}
```

### Commands

- **Home Assistant MCP: Set Access Token** - Set your Home Assistant access token
- **Home Assistant MCP: Test Connection** - Test the connection to Home Assistant
- **Home Assistant MCP: Clear Access Token** - Remove the stored access token

## Usage Examples

Once configured, you can ask GitHub Copilot questions like:

### Querying Data
- "What lights do I have in my home?"
- "What's the current temperature sensor reading?"
- "What services are available for the light domain?"
- "Show me the history of my living room temperature sensor"

### Controlling Devices
- "Turn on the living room lights"
- "Set the bedroom light brightness to 50%"
- "Activate the 'Movie Night' scene"
- "Turn off all lights in the kitchen"

### Advanced Operations
- "Fire a custom event called 'guest_arrived'"
- "Render a template that shows the average temperature"
- "Check if my Home Assistant configuration is valid"

Copilot will use the appropriate MCP tools to fetch data or control your Home Assistant instance.

## Development

### Prerequisites

- Node.js 18+
- VS Code 1.95+

### Build

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Lint code
npm run lint
```

### Debug

1. Open the project in VS Code
2. Press `F5` to start debugging
3. A new VS Code window will open with the extension loaded

## Security

- Access tokens are stored in VS Code's secure secret storage
- Tokens are never logged or exposed
- SSL certificate validation is enabled by default

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or pull request on [GitHub](https://github.com/RickyKleinhempel/homeassistantMcp_vsc_extension).
