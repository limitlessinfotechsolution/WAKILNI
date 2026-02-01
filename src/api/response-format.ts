/**
 * Standardized API Response Format
 * Consistent response structure across all API operations
 */

import { ErrorCode, ERROR_MESSAGES, getHttpStatusForError } from './errors';

// =============================================================================
// API VERSION
// =============================================================================

export const API_VERSION = '2026-02-01';
export const MINIMUM_SUPPORTED_VERSION = '2026-01-01';

// =============================================================================
// RESPONSE INTERFACES
// =============================================================================

export interface ApiMeta {
  timestamp: string;
  version: string;
  request_id: string;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  description?: string;
  details?: Record<string, string[]>;
}

export interface StandardResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiErrorResponse | null;
  meta: ApiMeta;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export type PaginatedResponse<T> = StandardResponse<PaginatedData<T>>;

// =============================================================================
// REQUEST ID GENERATOR
// =============================================================================

export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `req_${timestamp}_${random}`;
}

// =============================================================================
// RESPONSE BUILDERS
// =============================================================================

export function createSuccessResponse<T>(
  data: T,
  requestId?: string
): StandardResponse<T> {
  return {
    success: true,
    data,
    error: null,
    meta: {
      timestamp: new Date().toISOString(),
      version: API_VERSION,
      request_id: requestId || generateRequestId(),
    },
  };
}

export function createErrorResponse(
  code: ErrorCode | string,
  details?: Record<string, string[]>,
  requestId?: string
): StandardResponse<null> {
  const errorInfo = ERROR_MESSAGES[code as ErrorCode] || {
    message: 'Unknown error',
    description: 'An unexpected error occurred',
  };

  return {
    success: false,
    data: null,
    error: {
      code,
      message: errorInfo.message,
      description: errorInfo.description,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: API_VERSION,
      request_id: requestId || generateRequestId(),
    },
  };
}

export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
  requestId?: string
): PaginatedResponse<T> {
  return {
    success: true,
    data: {
      items,
      total,
      page,
      page_size: pageSize,
      has_more: total > page * pageSize,
    },
    error: null,
    meta: {
      timestamp: new Date().toISOString(),
      version: API_VERSION,
      request_id: requestId || generateRequestId(),
    },
  };
}

// =============================================================================
// EDGE FUNCTION HELPERS
// =============================================================================

export function jsonResponse<T>(
  data: StandardResponse<T>,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Version': API_VERSION,
    },
  });
}

export function successResponse<T>(data: T, requestId?: string): Response {
  return jsonResponse(createSuccessResponse(data, requestId), 200);
}

export function errorResponse(
  code: ErrorCode,
  details?: Record<string, string[]>,
  requestId?: string
): Response {
  const status = getHttpStatusForError(code);
  return jsonResponse(createErrorResponse(code, details, requestId), status);
}

export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
  requestId?: string
): Response {
  return jsonResponse(
    createPaginatedResponse(items, total, page, pageSize, requestId),
    200
  );
}

// =============================================================================
// VERSION VALIDATION
// =============================================================================

export function isVersionSupported(clientVersion: string | null): boolean {
  if (!clientVersion) return true; // No version header = use latest
  return clientVersion >= MINIMUM_SUPPORTED_VERSION;
}

export function versionDeprecatedResponse(): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: 'API_VERSION_DEPRECATED',
        message: 'API version no longer supported',
        description: `Please upgrade to API version ${MINIMUM_SUPPORTED_VERSION} or later`,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: API_VERSION,
        minimum_supported: MINIMUM_SUPPORTED_VERSION,
        request_id: generateRequestId(),
      },
    }),
    {
      status: 426,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': API_VERSION,
      },
    }
  );
}
