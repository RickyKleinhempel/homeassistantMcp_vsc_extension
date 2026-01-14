/**
 * Home Assistant REST API Client
 * Handles all HTTP communication with the Home Assistant instance
 */

import {
  EntityState,
  ServiceDomain,
  EventType,
  LogbookEntry,
  CalendarEntity,
  CalendarEvent,
  HomeAssistantConfig,
  ApiCheckResponse,
  HistoryEntry,
  ServiceCallTarget,
  ServiceCallResponse,
  FireEventResponse,
  CheckConfigResponse,
  HandleIntentResponse,
  IntentSlotValue,
} from './types';

/**
 * Options for creating a Home Assistant client
 */
export interface HomeAssistantClientOptions {
  baseUrl: string;
  token: string;
  timeout?: number;
  validateSsl?: boolean;
}

/**
 * Home Assistant API Client
 */
export class HomeAssistantClient {
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly timeout: number;

  constructor(options: HomeAssistantClientOptions) {
    // Remove trailing slash from base URL
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.token = options.token;
    this.timeout = options.timeout ?? 10000;
    // Note: validateSsl is available in options but not used with native fetch
    // Could be used with a custom HTTPS agent if needed
  }

  /**
   * Make an authenticated GET request to the Home Assistant API
   */
  private async request<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          url.searchParams.append(key, value);
        }
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new HomeAssistantApiError(
          `API request failed: ${response.status} ${response.statusText}`,
          response.status,
          errorText
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof HomeAssistantApiError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new HomeAssistantApiError(
            `Request timeout after ${this.timeout}ms`,
            408,
            'Request timed out'
          );
        }
        throw new HomeAssistantApiError(
          `Network error: ${error.message}`,
          0,
          error.message
        );
      }
      throw new HomeAssistantApiError('Unknown error occurred', 0, String(error));
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Make a request expecting plain text response
   */
  private async requestText(endpoint: string): Promise<string> {
    const url = `${this.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new HomeAssistantApiError(
          `API request failed: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      return await response.text();
    } catch (error) {
      if (error instanceof HomeAssistantApiError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new HomeAssistantApiError(
            `Request timeout after ${this.timeout}ms`,
            408
          );
        }
        throw new HomeAssistantApiError(`Network error: ${error.message}`, 0);
      }
      throw new HomeAssistantApiError('Unknown error occurred', 0);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Make an authenticated POST request to the Home Assistant API
   */
  private async postRequest<T>(
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new HomeAssistantApiError(
          `API request failed: ${response.status} ${response.statusText}`,
          response.status,
          errorText
        );
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return (await response.json()) as T;
      }
      
      // For empty or non-JSON responses
      const text = await response.text();
      return (text ? JSON.parse(text) : {}) as T;
    } catch (error) {
      if (error instanceof HomeAssistantApiError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new HomeAssistantApiError(
            `Request timeout after ${this.timeout}ms`,
            408,
            'Request timed out'
          );
        }
        throw new HomeAssistantApiError(
          `Network error: ${error.message}`,
          0,
          error.message
        );
      }
      throw new HomeAssistantApiError('Unknown error occurred', 0, String(error));
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Make an authenticated DELETE request to the Home Assistant API
   */
  private async deleteRequest<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new HomeAssistantApiError(
          `API request failed: ${response.status} ${response.statusText}`,
          response.status,
          errorText
        );
      }

      const text = await response.text();
      return (text ? JSON.parse(text) : { message: 'Deleted successfully' }) as T;
    } catch (error) {
      if (error instanceof HomeAssistantApiError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new HomeAssistantApiError(
            `Request timeout after ${this.timeout}ms`,
            408,
            'Request timed out'
          );
        }
        throw new HomeAssistantApiError(
          `Network error: ${error.message}`,
          0,
          error.message
        );
      }
      throw new HomeAssistantApiError('Unknown error occurred', 0, String(error));
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Check if the API is running
   * GET /api/
   */
  async checkApi(): Promise<ApiCheckResponse> {
    return this.request<ApiCheckResponse>('/api/');
  }

  /**
   * Get Home Assistant configuration
   * GET /api/config
   */
  async getConfig(): Promise<HomeAssistantConfig> {
    return this.request<HomeAssistantConfig>('/api/config');
  }

  /**
   * Get list of loaded components
   * GET /api/components
   */
  async getComponents(): Promise<string[]> {
    return this.request<string[]>('/api/components');
  }

  /**
   * Get all entity states
   * GET /api/states
   */
  async getStates(): Promise<EntityState[]> {
    return this.request<EntityState[]>('/api/states');
  }

  /**
   * Get state of a specific entity
   * GET /api/states/<entity_id>
   */
  async getState(entityId: string): Promise<EntityState> {
    return this.request<EntityState>(`/api/states/${encodeURIComponent(entityId)}`);
  }

  /**
   * Get all available services
   * GET /api/services
   */
  async getServices(): Promise<ServiceDomain[]> {
    return this.request<ServiceDomain[]>('/api/services');
  }

  /**
   * Get all event types
   * GET /api/events
   */
  async getEvents(): Promise<EventType[]> {
    return this.request<EventType[]>('/api/events');
  }

  /**
   * Get history for entities
   * GET /api/history/period/<timestamp>
   */
  async getHistory(options?: {
    timestamp?: string;
    endTime?: string;
    entityId?: string;
    minimalResponse?: boolean;
    significantChangesOnly?: boolean;
    noAttributes?: boolean;
  }): Promise<HistoryEntry[][]> {
    const timestamp = options?.timestamp ?? '';
    const endpoint = `/api/history/period/${timestamp}`;

    const params: Record<string, string> = {};
    if (options?.endTime) {
      params['end_time'] = options.endTime;
    }
    if (options?.entityId) {
      params['filter_entity_id'] = options.entityId;
    }
    if (options?.minimalResponse) {
      params['minimal_response'] = 'true';
    }
    if (options?.significantChangesOnly) {
      params['significant_changes_only'] = 'true';
    }
    if (options?.noAttributes) {
      params['no_attributes'] = 'true';
    }

    return this.request<HistoryEntry[][]>(endpoint, params);
  }

  /**
   * Get logbook entries
   * GET /api/logbook/<timestamp>
   */
  async getLogbook(options?: {
    timestamp?: string;
    endTime?: string;
    entityId?: string;
  }): Promise<LogbookEntry[]> {
    const timestamp = options?.timestamp ?? '';
    const endpoint = `/api/logbook/${timestamp}`;

    const params: Record<string, string> = {};
    if (options?.endTime) {
      params['end_time'] = options.endTime;
    }
    if (options?.entityId) {
      params['entity'] = options.entityId;
    }

    return this.request<LogbookEntry[]>(endpoint, params);
  }

  /**
   * Get error log
   * GET /api/error_log
   */
  async getErrorLog(): Promise<string> {
    return this.requestText('/api/error_log');
  }

  /**
   * Get all calendars
   * GET /api/calendars
   */
  async getCalendars(): Promise<CalendarEntity[]> {
    return this.request<CalendarEntity[]>('/api/calendars');
  }

  /**
   * Get calendar events
   * GET /api/calendars/<calendar_entity_id>
   */
  async getCalendarEvents(
    calendarEntityId: string,
    start: string,
    end: string
  ): Promise<CalendarEvent[]> {
    const endpoint = `/api/calendars/${encodeURIComponent(calendarEntityId)}`;
    return this.request<CalendarEvent[]>(endpoint, { start, end });
  }

  // ============================================================
  // POST Methods (Phase 2)
  // ============================================================

  /**
   * Call a service
   * POST /api/services/<domain>/<service>
   */
  async callService(
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>,
    target?: ServiceCallTarget
  ): Promise<ServiceCallResponse> {
    const endpoint = `/api/services/${encodeURIComponent(domain)}/${encodeURIComponent(service)}`;
    const body: Record<string, unknown> = {};

    if (serviceData) {
      Object.assign(body, serviceData);
    }

    if (target) {
      if (target.entity_id) {
        body['entity_id'] = target.entity_id;
      }
      if (target.device_id) {
        body['device_id'] = target.device_id;
      }
      if (target.area_id) {
        body['area_id'] = target.area_id;
      }
    }

    // The API returns an array of changed states
    const result = await this.postRequest<EntityState[]>(endpoint, body);
    return {
      response: { changed_states: result }
    };
  }

  /**
   * Fire an event
   * POST /api/events/<event_type>
   */
  async fireEvent(
    eventType: string,
    eventData?: Record<string, unknown>
  ): Promise<FireEventResponse> {
    const endpoint = `/api/events/${encodeURIComponent(eventType)}`;
    return this.postRequest<FireEventResponse>(endpoint, eventData);
  }

  /**
   * Set entity state (creates or updates)
   * POST /api/states/<entity_id>
   */
  async setState(
    entityId: string,
    state: string,
    attributes?: Record<string, unknown>
  ): Promise<EntityState> {
    const endpoint = `/api/states/${encodeURIComponent(entityId)}`;
    const body: Record<string, unknown> = { state };

    if (attributes) {
      body['attributes'] = attributes;
    }

    return this.postRequest<EntityState>(endpoint, body);
  }

  /**
   * Render a Jinja2 template
   * POST /api/template
   */
  async renderTemplate(
    template: string,
    variables?: Record<string, unknown>
  ): Promise<string> {
    const body: Record<string, unknown> = { template };

    if (variables) {
      body['variables'] = variables;
    }

    // Template endpoint returns plain text
    const url = `${this.baseUrl}/api/template`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new HomeAssistantApiError(
          `Template render failed: ${response.status} ${response.statusText}`,
          response.status,
          errorText
        );
      }

      return await response.text();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Check Home Assistant configuration
   * POST /api/config/core/check_config
   */
  async checkConfig(): Promise<CheckConfigResponse> {
    return this.postRequest<CheckConfigResponse>('/api/config/core/check_config');
  }

  /**
   * Handle a conversation intent
   * POST /api/intent/handle
   */
  async handleIntent(
    name: string,
    data?: Record<string, IntentSlotValue>
  ): Promise<HandleIntentResponse> {
    const body: Record<string, unknown> = { name };

    if (data) {
      body['data'] = data;
    }

    return this.postRequest<HandleIntentResponse>('/api/intent/handle', body);
  }

  /**
   * Delete an entity state
   * DELETE /api/states/<entity_id>
   */
  async deleteState(entityId: string): Promise<{ message: string }> {
    const endpoint = `/api/states/${encodeURIComponent(entityId)}`;
    return this.deleteRequest<{ message: string }>(endpoint);
  }
}

/**
 * Custom error class for Home Assistant API errors
 */
export class HomeAssistantApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: string;

  constructor(message: string, statusCode: number, details?: string) {
    super(message);
    this.name = 'HomeAssistantApiError';
    this.statusCode = statusCode;
    this.details = details;
  }

  /**
   * Check if the error is an authentication error
   */
  isAuthError(): boolean {
    return this.statusCode === 401;
  }

  /**
   * Check if the error is a not found error
   */
  isNotFoundError(): boolean {
    return this.statusCode === 404;
  }

  /**
   * Check if the error is a timeout error
   */
  isTimeoutError(): boolean {
    return this.statusCode === 408;
  }

  /**
   * Check if the error is a network error
   */
  isNetworkError(): boolean {
    return this.statusCode === 0;
  }
}
