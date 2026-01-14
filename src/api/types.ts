/**
 * TypeScript interfaces for Home Assistant REST API responses
 */

/**
 * Entity state object returned by /api/states
 */
export interface EntityState {
  entity_id: string;
  state: string;
  attributes: EntityAttributes;
  last_changed: string;
  last_updated: string;
  context?: EntityContext;
}

/**
 * Entity attributes - varies by entity type
 */
export interface EntityAttributes {
  friendly_name?: string;
  icon?: string;
  unit_of_measurement?: string;
  device_class?: string;
  supported_features?: number;
  [key: string]: unknown;
}

/**
 * Context information for state changes
 */
export interface EntityContext {
  id: string;
  parent_id: string | null;
  user_id: string | null;
}

/**
 * Service domain with available services
 */
export interface ServiceDomain {
  domain: string;
  services: Record<string, ServiceDefinition>;
}

/**
 * Service definition with fields and target info
 */
export interface ServiceDefinition {
  name?: string;
  description?: string;
  fields?: Record<string, ServiceField>;
  target?: ServiceTarget;
}

/**
 * Service field definition
 */
export interface ServiceField {
  name?: string;
  description?: string;
  required?: boolean;
  example?: unknown;
  default?: unknown;
  selector?: Record<string, unknown>;
}

/**
 * Service target selectors
 */
export interface ServiceTarget {
  entity?: EntitySelector[];
  device?: DeviceSelector[];
  area?: AreaSelector[];
}

/**
 * Entity selector for service targets
 */
export interface EntitySelector {
  domain?: string | string[];
  device_class?: string | string[];
  integration?: string;
  supported_features?: number[];
}

/**
 * Device selector for service targets
 */
export interface DeviceSelector {
  integration?: string;
  manufacturer?: string;
  model?: string;
}

/**
 * Area selector for service targets
 */
export interface AreaSelector {
  entity?: EntitySelector;
  device?: DeviceSelector;
}

/**
 * Event type with listener count
 */
export interface EventType {
  event: string;
  listener_count: number;
}

/**
 * Logbook entry
 */
export interface LogbookEntry {
  when: string;
  name: string;
  entity_id?: string;
  state?: string;
  message?: string;
  domain?: string;
  context_id?: string;
  context_user_id?: string;
}

/**
 * Calendar entity info
 */
export interface CalendarEntity {
  entity_id: string;
  name: string;
}

/**
 * Calendar event
 */
export interface CalendarEvent {
  summary: string;
  start: string | DateTimeObject;
  end: string | DateTimeObject;
  description?: string;
  location?: string;
  uid?: string;
  recurrence_id?: string;
  rrule?: string;
}

/**
 * DateTime object for all-day events
 */
export interface DateTimeObject {
  date?: string;
  dateTime?: string;
}

/**
 * Home Assistant configuration
 */
export interface HomeAssistantConfig {
  latitude: number;
  longitude: number;
  elevation: number;
  unit_system: UnitSystem;
  location_name: string;
  time_zone: string;
  components: string[];
  config_dir: string;
  allowlist_external_dirs: string[];
  allowlist_external_urls: string[];
  version: string;
  config_source: string;
  recovery_mode: boolean;
  state: string;
  external_url: string | null;
  internal_url: string | null;
  currency: string;
  country: string | null;
  language: string;
}

/**
 * Unit system configuration
 */
export interface UnitSystem {
  length: string;
  accumulated_precipitation: string;
  mass: string;
  pressure: string;
  temperature: string;
  volume: string;
  wind_speed: string;
}

/**
 * API check response
 */
export interface ApiCheckResponse {
  message: string;
}

/**
 * History entry (minimal response)
 */
export interface HistoryEntry {
  entity_id: string;
  state: string;
  last_changed: string;
  last_updated?: string;
  attributes?: EntityAttributes;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  message: string;
  code?: string;
}

/**
 * Tool input parameters for ha_get_states
 */
export interface GetStatesParams {
  domain?: string;
  search?: string;
}

/**
 * Tool input parameters for ha_get_state
 */
export interface GetStateParams {
  entity_id: string;
}

/**
 * Tool input parameters for ha_get_services
 */
export interface GetServicesParams {
  domain?: string;
}

/**
 * Tool input parameters for ha_get_history
 */
export interface GetHistoryParams {
  timestamp?: string;
  end_time?: string;
  entity_id?: string;
  minimal_response?: boolean;
}

/**
 * Tool input parameters for ha_get_logbook
 */
export interface GetLogbookParams {
  timestamp?: string;
  end_time?: string;
  entity_id?: string;
}

/**
 * Tool input parameters for ha_get_calendar_events
 */
export interface GetCalendarEventsParams {
  calendar_entity_id: string;
  start: string;
  end: string;
}

// ============================================================
// POST Method Types (Phase 2)
// ============================================================

/**
 * Tool input parameters for ha_call_service
 */
export interface CallServiceParams {
  domain: string;
  service: string;
  service_data?: Record<string, unknown>;
  target?: ServiceCallTarget;
}

/**
 * Target for service calls
 */
export interface ServiceCallTarget {
  entity_id?: string | string[];
  device_id?: string | string[];
  area_id?: string | string[];
}

/**
 * Response from calling a service
 */
export interface ServiceCallResponse {
  context?: EntityContext;
  response?: Record<string, unknown>;
}

/**
 * Tool input parameters for ha_fire_event
 */
export interface FireEventParams {
  event_type: string;
  event_data?: Record<string, unknown>;
}

/**
 * Response from firing an event
 */
export interface FireEventResponse {
  message: string;
}

/**
 * Tool input parameters for ha_set_state
 */
export interface SetStateParams {
  entity_id: string;
  state: string;
  attributes?: Record<string, unknown>;
}

/**
 * Tool input parameters for ha_render_template
 */
export interface RenderTemplateParams {
  template: string;
  variables?: Record<string, unknown>;
}

/**
 * Response from rendering a template
 */
export interface RenderTemplateResponse {
  result: string;
}

/**
 * Tool input parameters for ha_check_config
 */
export interface CheckConfigParams {
  // No parameters needed
}

/**
 * Response from checking configuration
 */
export interface CheckConfigResponse {
  errors: string | null;
  result: 'valid' | 'invalid';
}

/**
 * Tool input parameters for ha_handle_intent
 */
export interface HandleIntentParams {
  name: string;
  data?: Record<string, IntentSlotValue>;
}

/**
 * Intent slot value
 */
export interface IntentSlotValue {
  value: unknown;
}

/**
 * Response from handling an intent
 */
export interface HandleIntentResponse {
  speech: {
    plain: {
      speech: string;
      extra_data: unknown;
    };
  };
  card: Record<string, unknown>;
  language: string;
  response_type: string;
  data: {
    targets: unknown[];
    success: unknown[];
    failed: unknown[];
  };
}

/**
 * Tool input parameters for ha_delete_state
 */
export interface DeleteStateParams {
  entity_id: string;
}

/**
 * Response from deleting a state
 */
export interface DeleteStateResponse {
  message: string;
}
