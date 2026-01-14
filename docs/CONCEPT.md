# Konzept: Home Assistant MCP Tools für GitHub Copilot

## Übersicht

Diese VS Code Extension stellt MCP (Model Context Protocol) Tools bereit, die GitHub Copilot Zugriff auf die Home Assistant REST API ermöglichen. Dadurch kann der AI-Assistent direkt auf Entity-IDs, Zustände, Services und andere Home Assistant Daten zugreifen.

---

## Architektur

```
┌─────────────────────────────────────────────────────────────────┐
│                      VS Code Extension                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐     ┌─────────────────────────────────┐   │
│  │  Extension Host │     │      MCP Tool Provider          │   │
│  │                 │────▶│                                 │   │
│  │  - Activation   │     │  - Tool Registration            │   │
│  │  - Config       │     │  - Request Handling             │   │
│  └─────────────────┘     └───────────────┬─────────────────┘   │
│                                          │                      │
│                                          ▼                      │
│                          ┌───────────────────────────────────┐  │
│                          │   Home Assistant API Client       │  │
│                          │                                   │  │
│                          │  - Authentication (Bearer Token)  │  │
│                          │  - HTTP GET Requests              │  │
│                          │  - Response Parsing               │  │
│                          └───────────────┬───────────────────┘  │
│                                          │                      │
└──────────────────────────────────────────┼──────────────────────┘
                                           │
                                           ▼
                              ┌────────────────────────┐
                              │   Home Assistant       │
                              │   REST API             │
                              │   (Port 8123)          │
                              └────────────────────────┘
```

---

## MCP Tools Definition (Phase 1: GET Methods)

### 1. `ha_check_api` - API Availability Check
**Endpoint:** `GET /api/`

**Description:** Checks if the Home Assistant API is reachable.

**Parameters:** None

**Response:**
```json
{
  "message": "API running."
}
```

**Use Case:** Connection test, health check

---

### 2. `ha_get_config` - Get Configuration
**Endpoint:** `GET /api/config`

**Description:** Retrieves the current Home Assistant configuration.

**Parameters:** None

**Response:**
```json
{
  "components": ["sensor", "light", "automation"],
  "config_dir": "/config",
  "elevation": 0,
  "latitude": 52.52,
  "longitude": 13.405,
  "location_name": "Home",
  "time_zone": "Europe/Berlin",
  "unit_system": {
    "length": "km",
    "mass": "kg",
    "temperature": "°C",
    "volume": "L"
  },
  "version": "2024.1.0"
}
```

**Use Case:** System info, location data, installed components

---

### 3. `ha_get_components` - Get Loaded Components
**Endpoint:** `GET /api/components`

**Description:** Lists all loaded Home Assistant components/integrations.

**Parameters:** None

**Response:**
```json
["automation", "binary_sensor", "climate", "cover", "device_tracker", "light", "sensor", "switch"]
```

**Use Case:** Determine available integrations

---

### 4. `ha_get_states` - Get All Entity States
**Endpoint:** `GET /api/states`

**Description:** Retrieves all entity states. This is the **most important tool** for accessing entity IDs.

**Parameters:** 
- `domain` (optional): Filter by domain (e.g., "light", "sensor", "switch")
- `search` (optional): Search in entity_id or friendly_name

**Response:**
```json
[
  {
    "entity_id": "light.living_room",
    "state": "on",
    "attributes": {
      "friendly_name": "Living Room Light",
      "brightness": 255,
      "supported_features": 1
    },
    "last_changed": "2024-01-01T12:00:00+00:00",
    "last_updated": "2024-01-01T12:00:00+00:00"
  }
]
```

**Use Case:** Find entity IDs, query current states, determine attributes

---

### 5. `ha_get_state` - Get Single Entity State
**Endpoint:** `GET /api/states/<entity_id>`

**Description:** Retrieves the state of a specific entity.

**Parameters:**
- `entity_id` (required): The entity ID (e.g., "light.living_room")

**Response:**
```json
{
  "entity_id": "light.living_room",
  "state": "on",
  "attributes": {
    "friendly_name": "Living Room Light",
    "brightness": 255
  },
  "last_changed": "2024-01-01T12:00:00+00:00",
  "last_updated": "2024-01-01T12:00:00+00:00"
}
```

**Use Case:** Detailed info about a specific entity

---

### 6. `ha_get_services` - Get Available Services
**Endpoint:** `GET /api/services`

**Description:** Lists all available services per domain.

**Parameters:**
- `domain` (optional): Filter by domain (e.g., "light", "switch")

**Response:**
```json
[
  {
    "domain": "light",
    "services": {
      "turn_on": {
        "name": "Turn on",
        "description": "Turn on a light.",
        "fields": {
          "brightness": {
            "description": "Brightness level",
            "example": 255
          }
        }
      },
      "turn_off": {},
      "toggle": {}
    }
  }
]
```

**Use Case:** Determine available actions, find service parameters

---

### 7. `ha_get_events` - Get Available Event Types
**Endpoint:** `GET /api/events`

**Description:** Lists all available event types.

**Parameters:** None

**Response:**
```json
[
  {"event": "state_changed", "listener_count": 5},
  {"event": "call_service", "listener_count": 2},
  {"event": "automation_triggered", "listener_count": 1}
]
```

**Use Case:** Plan event-based automations

---

### 8. `ha_get_history` - Get Historical Data
**Endpoint:** `GET /api/history/period/<timestamp>`

**Description:** Retrieves historical state changes.

**Parameters:**
- `timestamp` (optional): Start time (ISO 8601 format), default: 1 day ago
- `end_time` (optional): End time (ISO 8601 format)
- `entity_id` (optional): Filter by entity ID
- `minimal_response` (optional): Reduced response (only state, last_changed)

**Response:**
```json
[
  [
    {
      "entity_id": "sensor.temperature",
      "state": "21.5",
      "last_changed": "2024-01-01T10:00:00+00:00"
    },
    {
      "entity_id": "sensor.temperature",
      "state": "22.0",
      "last_changed": "2024-01-01T11:00:00+00:00"
    }
  ]
]
```

**Use Case:** Analyze historical data, identify trends

---

### 9. `ha_get_logbook` - Get Logbook Entries
**Endpoint:** `GET /api/logbook/<timestamp>`

**Description:** Retrieves logbook entries.

**Parameters:**
- `timestamp` (optional): Start time (ISO 8601 format)
- `end_time` (optional): End time
- `entity_id` (optional): Filter by entity ID

**Response:**
```json
[
  {
    "when": "2024-01-01T12:00:00+00:00",
    "name": "Living Room Light",
    "entity_id": "light.living_room",
    "state": "on",
    "message": "turned on"
  }
]
```

**Use Case:** Activity log, debugging

---

### 10. `ha_get_error_log` - Get Error Log
**Endpoint:** `GET /api/error_log`

**Description:** Retrieves the Home Assistant error log.

**Parameters:** None

**Response:** Plaintext log

**Use Case:** Error diagnosis, troubleshooting

---

### 11. `ha_get_calendars` - List Calendars
**Endpoint:** `GET /api/calendars`

**Description:** Lists all calendar entities.

**Parameters:** None

**Response:**
```json
[
  {
    "entity_id": "calendar.personal",
    "name": "Personal Calendar"
  }
]
```

**Use Case:** Calendar integration

---

### 12. `ha_get_calendar_events` - Get Calendar Events
**Endpoint:** `GET /api/calendars/<calendar_entity_id>`

**Description:** Retrieves events from a calendar.

**Parameters:**
- `calendar_entity_id` (required): Calendar entity ID
- `start` (required): Start time (ISO 8601)
- `end` (required): End time (ISO 8601)

**Response:**
```json
[
  {
    "summary": "Meeting",
    "start": "2024-01-01T10:00:00",
    "end": "2024-01-01T11:00:00",
    "description": "Team Meeting"
  }
]
```

**Use Case:** Query appointments

---

## Configuration

### VS Code Settings

```json
{
  "homeassistant-mcp.url": "http://192.168.1.100:8123",
  "homeassistant-mcp.token": "<Long-Lived Access Token>"
}
```

### Secure Token Storage

Der Access Token wird im **VS Code SecretStorage** gespeichert, nicht in den Settings:

```typescript
// Store token
await context.secrets.store('homeassistant-token', token);

// Retrieve token
const token = await context.secrets.get('homeassistant-token');
```

---

## Extension Structure

```
homeassistant-mcp-extension/
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript configuration
├── src/
│   ├── extension.ts          # Extension entry point
│   ├── mcp/
│   │   ├── toolProvider.ts   # MCP tool registration
│   │   └── tools/            # Individual tool implementations
│   │       ├── checkApi.ts
│   │       ├── getConfig.ts
│   │       ├── getStates.ts
│   │       ├── getState.ts
│   │       ├── getServices.ts
│   │       ├── getEvents.ts
│   │       ├── getHistory.ts
│   │       ├── getLogbook.ts
│   │       ├── getErrorLog.ts
│   │       ├── getCalendars.ts
│   │       └── getCalendarEvents.ts
│   ├── api/
│   │   ├── client.ts         # Home Assistant API client
│   │   └── types.ts          # TypeScript interfaces
│   └── config/
│       └── settings.ts       # Configuration management
├── test/
│   └── ...                   # Unit tests
└── docs/
    └── CONCEPT.md            # This document
```

---

## MCP Tool Registration (VS Code API)

```typescript
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  // Register MCP Tool Provider
  const toolProvider = vscode.lm.registerTool('ha_get_states', {
    // Tool metadata
    displayName: 'Home Assistant: Get States',
    description: 'Retrieves all entity states from Home Assistant. Can be filtered by domain or search term.',
    
    // Input schema (JSON Schema)
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
          description: 'Filter by domain (e.g., "light", "sensor", "switch")'
        },
        search: {
          type: 'string',
          description: 'Search in entity_id or friendly_name'
        }
      }
    },
    
    // Tool handler
    async invoke(options, token) {
      const { domain, search } = options.parameters;
      
      // API call
      const states = await haClient.getStates();
      
      // Apply filters
      let filtered = states;
      if (domain) {
        filtered = filtered.filter(s => s.entity_id.startsWith(domain + '.'));
      }
      if (search) {
        filtered = filtered.filter(s => 
          s.entity_id.includes(search) || 
          s.attributes.friendly_name?.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      return {
        'text/plain': JSON.stringify(filtered, null, 2)
      };
    }
  });
  
  context.subscriptions.push(toolProvider);
}
```

---

## TypeScript Interfaces

```typescript
// src/api/types.ts

export interface EntityState {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
  context?: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

export interface ServiceDomain {
  domain: string;
  services: Record<string, ServiceDefinition>;
}

export interface ServiceDefinition {
  name: string;
  description: string;
  fields: Record<string, ServiceField>;
  target?: {
    entity?: EntitySelector[];
    device?: DeviceSelector[];
    area?: AreaSelector[];
  };
}

export interface ServiceField {
  name?: string;
  description: string;
  required?: boolean;
  example?: unknown;
  selector?: Record<string, unknown>;
}

export interface EventType {
  event: string;
  listener_count: number;
}

export interface LogbookEntry {
  when: string;
  name: string;
  entity_id: string;
  state: string;
  message?: string;
}

export interface CalendarEvent {
  summary: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
}

export interface HomeAssistantConfig {
  components: string[];
  config_dir: string;
  elevation: number;
  latitude: number;
  longitude: number;
  location_name: string;
  time_zone: string;
  unit_system: {
    length: string;
    mass: string;
    temperature: string;
    volume: string;
  };
  version: string;
}
```

---

## API Client Implementation

```typescript
// src/api/client.ts

import * as vscode from 'vscode';
import { EntityState, ServiceDomain, HomeAssistantConfig } from './types';

export class HomeAssistantClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = token;
  }

  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async checkApi(): Promise<{ message: string }> {
    return this.request('/api/');
  }

  async getConfig(): Promise<HomeAssistantConfig> {
    return this.request('/api/config');
  }

  async getComponents(): Promise<string[]> {
    return this.request('/api/components');
  }

  async getStates(): Promise<EntityState[]> {
    return this.request('/api/states');
  }

  async getState(entityId: string): Promise<EntityState> {
    return this.request(`/api/states/${entityId}`);
  }

  async getServices(): Promise<ServiceDomain[]> {
    return this.request('/api/services');
  }

  async getEvents(): Promise<{ event: string; listener_count: number }[]> {
    return this.request('/api/events');
  }

  async getHistory(options?: {
    timestamp?: string;
    endTime?: string;
    entityId?: string;
    minimalResponse?: boolean;
  }): Promise<EntityState[][]> {
    const endpoint = `/api/history/period/${options?.timestamp || ''}`;
    const params: Record<string, string> = {};
    
    if (options?.endTime) params.end_time = options.endTime;
    if (options?.entityId) params.filter_entity_id = options.entityId;
    if (options?.minimalResponse) params.minimal_response = 'true';
    
    return this.request(endpoint, params);
  }

  async getLogbook(options?: {
    timestamp?: string;
    endTime?: string;
    entityId?: string;
  }): Promise<unknown[]> {
    const endpoint = `/api/logbook/${options?.timestamp || ''}`;
    const params: Record<string, string> = {};
    
    if (options?.endTime) params.end_time = options.endTime;
    if (options?.entityId) params.entity = options.entityId;
    
    return this.request(endpoint, params);
  }

  async getErrorLog(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/error_log`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.text();
  }

  async getCalendars(): Promise<{ entity_id: string; name: string }[]> {
    return this.request('/api/calendars');
  }

  async getCalendarEvents(
    calendarEntityId: string,
    start: string,
    end: string
  ): Promise<unknown[]> {
    return this.request(`/api/calendars/${calendarEntityId}`, { start, end });
  }
}
```

---

## Typische GitHub Copilot Interaktionen

### Beispiel 1: Entity-ID finden
**User:** "Wie heißt die Entity für mein Wohnzimmer-Licht?"

**Copilot verwendet:** `ha_get_states` mit `search: "living_room"`

**Antwort:** "Die Entity-ID für dein Wohnzimmer-Licht ist `light.living_room_ceiling`."

---

### Beispiel 2: Alle Sensoren auflisten
**User:** "Welche Temperatur-Sensoren habe ich?"

**Copilot verwendet:** `ha_get_states` mit `domain: "sensor"` und `search: "temperature"`

**Antwort:** "Du hast folgende Temperatur-Sensoren:
- `sensor.living_room_temperature` (22.5°C)
- `sensor.bedroom_temperature` (19.2°C)
- `sensor.outdoor_temperature` (5.1°C)"

---

### Beispiel 3: Service-Parameter ermitteln
**User:** "Welche Parameter brauche ich, um ein Licht zu dimmen?"

**Copilot verwendet:** `ha_get_services` mit `domain: "light"`

**Antwort:** "Um ein Licht zu dimmen, verwende den Service `light.turn_on` mit dem Parameter `brightness` (0-255) oder `brightness_pct` (0-100)."

---

### Beispiel 4: Automation schreiben
**User:** "Schreibe mir eine Automation, die mein Wohnzimmerlicht um 18 Uhr einschaltet."

**Copilot verwendet:** 
1. `ha_get_states` mit `search: "living_room light"` → findet `light.living_room`
2. `ha_get_services` mit `domain: "light"` → findet `light.turn_on`

**Antwort:**
```yaml
automation:
  - alias: "Turn on living room light at 6 PM"
    trigger:
      - platform: time
        at: "18:00:00"
    action:
      - service: light.turn_on
        target:
          entity_id: light.living_room
```

---

## Sicherheitsüberlegungen

1. **Token Security:** Long-Lived Access Token wird in VS Code SecretStorage gespeichert
2. **Local Network:** Standardmäßig nur lokale IPs erlauben
3. **GET Methods Only:** Phase 1 erlaubt keine Zustandsänderungen
4. **Rate Limiting:** Optional implementieren, um API nicht zu überlasten
5. **Connection Validation:** Token wird validiert bevor Tools registriert werden

---

## Nächste Schritte (Roadmap)

### Phase 1 (Aktuell)
- [x] Konzept erstellen
- [ ] Extension Grundstruktur
- [ ] MCP Tool Registration
- [ ] GET Methods implementieren
- [ ] Basis-Tests

### Phase 2
- [ ] POST Methods (Services aufrufen)
- [ ] Template Rendering (`POST /api/template`)
- [ ] Configuration Validation

### Phase 3
- [ ] WebSocket Support für Real-Time Updates
- [ ] Entity Completion Provider
- [ ] Inline Hints für Entity-IDs

---

## Zusammenfassung

Diese Extension ermöglicht GitHub Copilot den direkten Zugriff auf Home Assistant Daten durch MCP Tools. Die wichtigsten Tools für den täglichen Gebrauch sind:

| Tool | Hauptnutzen |
|------|-------------|
| `ha_get_states` | Entity-IDs finden, aktuelle Zustände |
| `ha_get_state` | Details zu einer Entity |
| `ha_get_services` | Verfügbare Aktionen & Parameter |
| `ha_get_config` | Systeminfo, Standort |
| `ha_get_history` | Verlaufsdaten |

Mit diesen Tools kann Copilot präzise Automationen, Dashboards und Konfigurationen erstellen, ohne dass der Benutzer manuell nach Entity-IDs suchen muss.
