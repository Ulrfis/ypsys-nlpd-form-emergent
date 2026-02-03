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

/** Champs considérés comme données personnelles : ne pas persister en clair dans les logs (RGPD/nLPD). */
const SENSITIVE_PAYLOAD_KEYS = [
  'apiKey', 'token', 'password',
  'user_email', 'email', 'user_first_name', 'user_last_name', 'first_name', 'last_name',
  'company_name', 'company', 'industry', 'canton', 'size',
  'answers', 'answers_detailed',
  'email_user_subject', 'email_user_markdown', 'email_sales_subject', 'email_sales_markdown',
  'body_markdown', 'subject',
];

function redactPayload(obj, depth = 0) {
  if (depth > 5) return '[MAX_DEPTH]';
  if (obj === null || typeof obj !== 'object') return obj;
  const out = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    const keyLower = key.toLowerCase();
    const isSensitive = SENSITIVE_PAYLOAD_KEYS.some(k => keyLower === k.toLowerCase() || keyLower.includes(k.toLowerCase()));
    if (isSensitive && value != null) {
      out[key] = Array.isArray(value) ? '[REDACTED_ARRAY]' : '[REDACTED]';
    } else {
      out[key] = typeof value === 'object' && value !== null ? redactPayload(value, depth + 1) : value;
    }
  }
  return out;
}

/**
 * Sanitize request to remove sensitive data (API keys, tokens, personal data for RGPD/nLPD).
 */
function sanitizeRequest(request) {
  const sanitized = { ...request };

  if (sanitized.payload) {
    sanitized.payload = redactPayload(sanitized.payload);
    delete sanitized.payload.apiKey;
    delete sanitized.payload.token;
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
 * Create response update for a log (response.data may contain sensitive content; redact for RGPD/nLPD).
 */
export function createLogUpdate(response, duration, status = 'success') {
  const data = response.data != null ? redactPayload(response.data) : null;
  return {
    status,
    duration,
    response: {
      status: response.status || null,
      data,
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
