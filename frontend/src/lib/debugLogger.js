/**
 * Generate a unique log ID
 */
export function generateLogId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `log_${timestamp}_${random}`;
}

/**
 * Create a new log entry (status: pending)
 * @param {string} type - 'supabase' | 'openai'
 * @param {string} operation - Operation name
 * @param {object} request - Request details
 * @returns {object} Log object
 */
export function createLog(type, operation, request = {}) {
  return {
    id: generateLogId(),
    timestamp: Date.now(),
    type,
    operation,
    status: 'pending',
    duration: null,
    request: {
      endpoint: request.endpoint || '',
      method: request.method || '',
      payload: request.payload || null,
    },
    response: null,
    isHighlighted: request.isHighlighted || false,
    highlightReason: request.highlightReason || null,
  };
}

/**
 * Sanitize request to remove sensitive data
 */
function sanitizeRequest(request) {
  const sanitized = { ...request };

  // Remove API keys and tokens
  if (sanitized.payload) {
    const payload = { ...sanitized.payload };
    // Don't log these sensitive fields
    delete payload.apiKey;
    delete payload.token;
    sanitized.payload = payload;
  }

  if (sanitized.headers) {
    const headers = { ...sanitized.headers };
    if (headers.Authorization) {
      headers.Authorization = '[REDACTED]';
    }
    sanitized.headers = headers;
  }

  return sanitized;
}

/**
 * Create response update for a log
 */
export function createLogUpdate(response, duration, status = 'success') {
  return {
    status,
    duration,
    response: {
      status: response.status || null,
      data: response.data || null,
      error: response.error || null,
    },
  };
}

/**
 * Format log for storage (sanitize sensitive data)
 */
export function sanitizeLog(log) {
  return {
    ...log,
    request: sanitizeRequest(log.request),
  };
}
