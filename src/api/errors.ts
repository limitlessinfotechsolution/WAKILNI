/**
 * Centralized API Error Codes
 * Standardized error taxonomy for consistent error handling
 */

// =============================================================================
// ERROR CODE DEFINITIONS
// =============================================================================

export const ERROR_CODES = {
  // Authentication Errors (AUTH_XXX)
  AUTH_001: 'AUTH_001',
  AUTH_002: 'AUTH_002',
  AUTH_003: 'AUTH_003',
  AUTH_004: 'AUTH_004',
  
  // Validation Errors (VALIDATION_XXX)
  VALIDATION_001: 'VALIDATION_001',
  VALIDATION_002: 'VALIDATION_002',
  VALIDATION_003: 'VALIDATION_003',
  
  // Booking Errors (BOOKING_XXX)
  BOOKING_001: 'BOOKING_001',
  BOOKING_002: 'BOOKING_002',
  BOOKING_003: 'BOOKING_003',
  BOOKING_004: 'BOOKING_004',
  
  // Payment Errors (PAYMENT_XXX)
  PAYMENT_001: 'PAYMENT_001',
  PAYMENT_002: 'PAYMENT_002',
  PAYMENT_003: 'PAYMENT_003',
  PAYMENT_004: 'PAYMENT_004',
  PAYMENT_005: 'PAYMENT_005',
  
  // Provider Errors (PROVIDER_XXX)
  PROVIDER_001: 'PROVIDER_001',
  PROVIDER_002: 'PROVIDER_002',
  PROVIDER_003: 'PROVIDER_003',
  
  // Service Errors (SERVICE_XXX)
  SERVICE_001: 'SERVICE_001',
  SERVICE_002: 'SERVICE_002',
  SERVICE_003: 'SERVICE_003',
  SERVICE_004: 'SERVICE_004',
  SERVICE_005: 'SERVICE_005',
  SERVICE_006: 'SERVICE_006',
  
  // Resource Errors (RESOURCE_XXX)
  RESOURCE_001: 'RESOURCE_001',
  RESOURCE_002: 'RESOURCE_002',
  
  // System Errors (SYSTEM_XXX)
  SYSTEM_001: 'SYSTEM_001',
  SYSTEM_002: 'SYSTEM_002',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// =============================================================================
// ERROR MESSAGES
// =============================================================================

export const ERROR_MESSAGES: Record<ErrorCode, { message: string; description: string }> = {
  // Authentication
  [ERROR_CODES.AUTH_001]: {
    message: 'Authentication required',
    description: 'You must be logged in to perform this action',
  },
  [ERROR_CODES.AUTH_002]: {
    message: 'Insufficient permissions',
    description: 'You do not have permission to perform this action',
  },
  [ERROR_CODES.AUTH_003]: {
    message: 'Session expired',
    description: 'Your session has expired. Please log in again',
  },
  [ERROR_CODES.AUTH_004]: {
    message: 'Invalid credentials',
    description: 'The provided credentials are invalid',
  },
  
  // Validation
  [ERROR_CODES.VALIDATION_001]: {
    message: 'Invalid input',
    description: 'The provided input data is invalid',
  },
  [ERROR_CODES.VALIDATION_002]: {
    message: 'Missing required fields',
    description: 'One or more required fields are missing',
  },
  [ERROR_CODES.VALIDATION_003]: {
    message: 'Invalid format',
    description: 'The data format is incorrect',
  },
  
  // Booking
  [ERROR_CODES.BOOKING_001]: {
    message: 'Service unavailable',
    description: 'The requested service is not available',
  },
  [ERROR_CODES.BOOKING_002]: {
    message: 'Provider not available',
    description: 'The selected provider is not available for this date',
  },
  [ERROR_CODES.BOOKING_003]: {
    message: 'Booking not found',
    description: 'The requested booking could not be found',
  },
  [ERROR_CODES.BOOKING_004]: {
    message: 'Invalid booking status transition',
    description: 'This status change is not allowed',
  },
  
  // Payment
  [ERROR_CODES.PAYMENT_001]: {
    message: 'Payment failed',
    description: 'The payment could not be processed',
  },
  [ERROR_CODES.PAYMENT_002]: {
    message: 'Payment already processed',
    description: 'This payment has already been processed',
  },
  [ERROR_CODES.PAYMENT_003]: {
    message: 'Invalid payment method',
    description: 'The selected payment method is not valid',
  },
  [ERROR_CODES.PAYMENT_004]: {
    message: 'Insufficient funds',
    description: 'The payment could not be completed due to insufficient funds',
  },
  [ERROR_CODES.PAYMENT_005]: {
    message: 'Payment pending',
    description: 'A payment is already being processed for this request',
  },
  
  // Provider
  [ERROR_CODES.PROVIDER_001]: {
    message: 'Provider not found',
    description: 'The requested provider could not be found',
  },
  [ERROR_CODES.PROVIDER_002]: {
    message: 'Provider not verified',
    description: 'The provider has not completed verification',
  },
  [ERROR_CODES.PROVIDER_003]: {
    message: 'Provider suspended',
    description: 'This provider account has been suspended',
  },
  
  // Service
  [ERROR_CODES.SERVICE_001]: {
    message: 'Service not found',
    description: 'The requested service could not be found',
  },
  [ERROR_CODES.SERVICE_002]: {
    message: 'Service is inactive',
    description: 'This service is currently not available',
  },
  [ERROR_CODES.SERVICE_003]: {
    message: 'Not authorized to modify this service',
    description: 'You do not have permission to modify this service',
  },
  [ERROR_CODES.SERVICE_004]: {
    message: 'Cannot delete service with active bookings',
    description: 'This service has active bookings and cannot be deleted',
  },
  [ERROR_CODES.SERVICE_005]: {
    message: 'Provider KYC not approved',
    description: 'Your KYC verification must be approved to create services',
  },
  [ERROR_CODES.SERVICE_006]: {
    message: 'Invalid service data',
    description: 'The service data provided is invalid',
  },
  
  // Resource
  [ERROR_CODES.RESOURCE_001]: {
    message: 'Resource not found',
    description: 'The requested resource could not be found',
  },
  [ERROR_CODES.RESOURCE_002]: {
    message: 'Resource already exists',
    description: 'A resource with this identifier already exists',
  },
  
  // System
  [ERROR_CODES.SYSTEM_001]: {
    message: 'Internal server error',
    description: 'An unexpected error occurred. Please try again later',
  },
  [ERROR_CODES.SYSTEM_002]: {
    message: 'Service temporarily unavailable',
    description: 'The service is temporarily unavailable. Please try again later',
  },
};

// =============================================================================
// ERROR FACTORY
// =============================================================================

export interface ApiErrorDetail {
  code: ErrorCode;
  message: string;
  description: string;
  details?: Record<string, string[]>;
  timestamp: string;
}

export function createApiError(
  code: ErrorCode,
  details?: Record<string, string[]>
): ApiErrorDetail {
  const errorInfo = ERROR_MESSAGES[code];
  return {
    code,
    message: errorInfo.message,
    description: errorInfo.description,
    details,
    timestamp: new Date().toISOString(),
  };
}

export function isKnownErrorCode(code: string): code is ErrorCode {
  return Object.values(ERROR_CODES).includes(code as ErrorCode);
}

// =============================================================================
// HTTP STATUS MAPPING
// =============================================================================

export const ERROR_HTTP_STATUS: Record<ErrorCode, number> = {
  [ERROR_CODES.AUTH_001]: 401,
  [ERROR_CODES.AUTH_002]: 403,
  [ERROR_CODES.AUTH_003]: 401,
  [ERROR_CODES.AUTH_004]: 401,
  
  [ERROR_CODES.VALIDATION_001]: 400,
  [ERROR_CODES.VALIDATION_002]: 400,
  [ERROR_CODES.VALIDATION_003]: 400,
  
  [ERROR_CODES.BOOKING_001]: 404,
  [ERROR_CODES.BOOKING_002]: 409,
  [ERROR_CODES.BOOKING_003]: 404,
  [ERROR_CODES.BOOKING_004]: 409,
  
  [ERROR_CODES.PAYMENT_001]: 402,
  [ERROR_CODES.PAYMENT_002]: 409,
  [ERROR_CODES.PAYMENT_003]: 400,
  [ERROR_CODES.PAYMENT_004]: 402,
  [ERROR_CODES.PAYMENT_005]: 409,
  
  [ERROR_CODES.PROVIDER_001]: 404,
  [ERROR_CODES.PROVIDER_002]: 403,
  [ERROR_CODES.PROVIDER_003]: 403,
  
  [ERROR_CODES.RESOURCE_001]: 404,
  [ERROR_CODES.RESOURCE_002]: 409,
  
  [ERROR_CODES.SERVICE_001]: 404,
  [ERROR_CODES.SERVICE_002]: 400,
  [ERROR_CODES.SERVICE_003]: 403,
  [ERROR_CODES.SERVICE_004]: 400,
  [ERROR_CODES.SERVICE_005]: 403,
  [ERROR_CODES.SERVICE_006]: 400,
  
  [ERROR_CODES.SYSTEM_001]: 500,
  [ERROR_CODES.SYSTEM_002]: 503,
};

export function getHttpStatusForError(code: ErrorCode): number {
  return ERROR_HTTP_STATUS[code] || 500;
}
