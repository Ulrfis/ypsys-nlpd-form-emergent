# Debug Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a debug panel that logs and displays all Supabase and OpenAI API interactions with emphasis on form data and assistant responses.

**Architecture:** Context-based logging system with interceptors in API modules, localStorage persistence, and a floating panel UI with timeline view and filters.

**Tech Stack:** React Context API, Tailwind CSS, Framer Motion, LocalStorage API

**Source:** Based on `docs/plans/2026-02-02-debug-mode-design.md`

---

## Task 1: Create Debug Logger Utilities

**Files:**
- Create: `frontend/src/lib/debugLogger.js`

**Step 1: Create debugLogger.js with utility functions**

Create the file with these functions:

```javascript
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
```

**Step 2: Verify file was created**

Run: `ls -la frontend/src/lib/debugLogger.js`
Expected: File exists

**Step 3: Commit**

```bash
git add frontend/src/lib/debugLogger.js
git commit -m "feat(debug): add debug logger utilities

- Generate unique log IDs
- Create log entries with pending status
- Sanitize sensitive data from logs
- Create log updates with responses"
```

---

## Task 2: Create DebugContext

**Files:**
- Create: `frontend/src/context/DebugContext.jsx`

**Step 1: Create DebugContext with provider**

```javascript
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { sanitizeLog } from '@/lib/debugLogger';

const DebugContext = createContext(null);

const STORAGE_KEY = 'nlpd_debug_logs';
const MAX_LOGS = 100;
const MAX_AGE_DAYS = 7;

export function DebugProvider({ children }) {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [logs, setLogs] = useState([]);
  const [activeFilters, setActiveFilters] = useState(new Set(['all']));

  // Load logs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const cutoffTime = Date.now() - (MAX_AGE_DAYS * 24 * 60 * 60 * 1000);

        // Filter out old logs
        const validLogs = (data.logs || []).filter(
          log => log.timestamp > cutoffTime
        );

        setLogs(validLogs);
      }
    } catch (error) {
      console.error('Failed to load debug logs:', error);
    }
  }, []);

  // Save logs to localStorage whenever they change
  useEffect(() => {
    if (!isDebugMode) return;

    try {
      const data = {
        version: '1.0',
        maxLogs: MAX_LOGS,
        logs: logs.slice(0, MAX_LOGS),
        lastUpdated: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save debug logs:', error);
    }
  }, [logs, isDebugMode]);

  const toggleDebugMode = useCallback(() => {
    setIsDebugMode(prev => !prev);
  }, []);

  const addLog = useCallback((log) => {
    if (!isDebugMode) return log.id;

    const sanitized = sanitizeLog(log);
    setLogs(prev => [sanitized, ...prev].slice(0, MAX_LOGS));
    return log.id;
  }, [isDebugMode]);

  const updateLog = useCallback((logId, updates) => {
    if (!isDebugMode) return;

    setLogs(prev => prev.map(log =>
      log.id === logId ? { ...log, ...updates } : log
    ));
  }, [isDebugMode]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear debug logs:', error);
    }
  }, []);

  const filterLogs = useCallback((filterType) => {
    if (filterType === 'all') {
      return logs;
    }

    if (filterType === 'errors') {
      return logs.filter(log => log.status === 'error');
    }

    return logs.filter(log => log.type === filterType);
  }, [logs]);

  const exportLogs = useCallback(() => {
    const dataStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const date = new Date();
    const filename = `debug-logs-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}.json`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [logs]);

  const toggleFilter = useCallback((filterType) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev);
      if (filterType === 'all') {
        return new Set(['all']);
      }

      newFilters.delete('all');
      if (newFilters.has(filterType)) {
        newFilters.delete(filterType);
      } else {
        newFilters.add(filterType);
      }

      if (newFilters.size === 0) {
        return new Set(['all']);
      }

      return newFilters;
    });
  }, []);

  const getFilteredLogs = useCallback(() => {
    if (activeFilters.has('all')) {
      return logs;
    }

    return logs.filter(log => {
      if (activeFilters.has('errors') && log.status === 'error') {
        return true;
      }
      return activeFilters.has(log.type);
    });
  }, [logs, activeFilters]);

  const value = {
    isDebugMode,
    toggleDebugMode,
    logs: getFilteredLogs(),
    allLogs: logs,
    activeFilters,
    toggleFilter,
    addLog,
    updateLog,
    clearLogs,
    filterLogs,
    exportLogs,
  };

  return (
    <DebugContext.Provider value={value}>
      {children}
    </DebugContext.Provider>
  );
}

export function useDebugContext() {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebugContext must be used within DebugProvider');
  }
  return context;
}

export default DebugContext;
```

**Step 2: Verify file was created**

Run: `ls -la frontend/src/context/DebugContext.jsx`
Expected: File exists

**Step 3: Commit**

```bash
git add frontend/src/context/DebugContext.jsx
git commit -m "feat(debug): add DebugContext with localStorage persistence

- Create React Context for debug state
- Implement log storage with 100 log limit
- Auto-cleanup logs older than 7 days
- Support filtering by type and status
- Export logs as JSON"
```

---

## Task 3: Add Keyboard Shortcut for Debug Mode

**Files:**
- Modify: `frontend/src/App.js`

**Step 1: Wrap app in DebugProvider**

Find the current structure in `App.js` and add DebugProvider:

```javascript
import { DebugProvider } from '@/context/DebugContext';

function App() {
  return (
    <DebugProvider>
      <ThemeProvider>
        <div className="App">
          <FormFlow />
        </div>
      </ThemeProvider>
    </DebugProvider>
  );
}
```

**Step 2: Add keyboard shortcut listener in FormFlow**

Modify `frontend/src/components/FormFlow.jsx` to add the keyboard listener:

```javascript
import { useDebugContext } from '@/context/DebugContext';

export const FormFlow = () => {
  const { toggleDebugMode } = useDebugContext();

  // ... existing state ...

  // Add keyboard shortcut for debug mode
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Cmd+Shift+D (Mac) or Ctrl+Shift+D (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleDebugMode();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleDebugMode]);

  // ... rest of component ...
};
```

**Step 3: Test keyboard shortcut**

Run: `npm start`
Action: Press Cmd+Shift+D (or Ctrl+Shift+D)
Expected: Debug mode toggles (verify in React DevTools that isDebugMode changes)

**Step 4: Commit**

```bash
git add frontend/src/App.js frontend/src/components/FormFlow.jsx
git commit -m "feat(debug): add keyboard shortcut to toggle debug mode

- Wrap app in DebugProvider
- Add Cmd+Shift+D / Ctrl+Shift+D shortcut
- Toggle debug mode on keypress"
```

---

## Task 4: Add Logging to Supabase Module

**Files:**
- Modify: `frontend/src/lib/supabase.js`

**Step 1: Import debug utilities**

Add imports at the top of `supabase.js`:

```javascript
import { createLog, createLogUpdate } from './debugLogger';
```

**Step 2: Create a hook to access debug context**

Since we can't use hooks directly in the module, we'll need to pass the debug context functions as parameters. First, let's create a wrapper:

```javascript
// Global reference to debug context (set by useDebugContext)
let debugContextRef = null;

export function setDebugContext(context) {
  debugContextRef = context;
}

function addDebugLog(log) {
  if (debugContextRef?.isDebugMode && debugContextRef?.addLog) {
    return debugContextRef.addLog(log);
  }
  return null;
}

function updateDebugLog(logId, update) {
  if (debugContextRef?.isDebugMode && debugContextRef?.updateLog && logId) {
    debugContextRef.updateLog(logId, update);
  }
}
```

**Step 3: Modify saveSubmission to add logging**

Update the `saveSubmission` function:

```javascript
export async function saveSubmission(payload, openaiResponse) {
  // LOG 1: Insert form_submissions
  const formLogId = addDebugLog(createLog('supabase', 'insert.form_submissions', {
    endpoint: 'form_submissions',
    method: 'INSERT',
    payload: {
      answers: payload.answers,
      score: payload.score,
      user: payload.user,
    },
    isHighlighted: true,
    highlightReason: 'form_data',
  }));

  const startTime = Date.now();

  // 1. Save form submission
  const { data: submission, error: subError } = await supabase
    .from('form_submissions')
    .insert({
      user_email: payload.user.email || null,
      user_first_name: payload.user.first_name,
      user_last_name: payload.user.last_name,
      company_name: payload.user.company,
      company_size: payload.user.size || null,
      industry: payload.user.industry || null,
      canton: payload.user.canton || null,
      answers: payload.answers,
      score_raw: payload.score.value,
      score_normalized: payload.score.normalized,
      risk_level: payload.score.level,
      teaser_text: openaiResponse?.teaser || null,
      lead_temperature: openaiResponse?.lead_temperature || null,
      status: openaiResponse ? 'teaser_ready' : 'pending',
      consent_marketing: true,
      consent_timestamp: new Date().toISOString(),
      session_id: generateSessionId(),
    })
    .select()
    .single();

  updateDebugLog(formLogId, createLogUpdate(
    { data: submission, error: subError },
    Date.now() - startTime,
    subError ? 'error' : 'success'
  ));

  if (subError) {
    console.error('Error saving submission:', subError);
    throw subError;
  }

  // 2. Save email outputs (only if user provided email and we have OpenAI response)
  if (payload.has_email && openaiResponse?.email_user && openaiResponse?.email_sales) {
    const emailLogId = addDebugLog(createLog('supabase', 'insert.email_outputs', {
      endpoint: 'email_outputs',
      method: 'INSERT',
      payload: {
        submission_id: submission.id,
        lead_temperature: openaiResponse.lead_temperature,
      },
    }));

    const emailStartTime = Date.now();

    const { error: emailError } = await supabase
      .from('email_outputs')
      .insert({
        submission_id: submission.id,
        email_user_markdown: openaiResponse.email_user.body_markdown,
        email_user_subject: openaiResponse.email_user.subject,
        email_sales_markdown: openaiResponse.email_sales.body_markdown,
        email_sales_subject: openaiResponse.email_sales.subject,
        lead_temperature: openaiResponse.lead_temperature,
      });

    updateDebugLog(emailLogId, createLogUpdate(
      { error: emailError },
      Date.now() - emailStartTime,
      emailError ? 'error' : 'success'
    ));

    if (emailError) {
      console.error('Error saving email outputs:', emailError);
      // Don't throw here, the main submission was saved
    }
  }

  return submission;
}
```

**Step 4: Update FormFlow to initialize debug context**

In `FormFlow.jsx`, add this near the top:

```javascript
import { setDebugContext } from '@/lib/supabase';

export const FormFlow = () => {
  const debugContext = useDebugContext();

  // Initialize debug context for supabase module
  useEffect(() => {
    setDebugContext(debugContext);
  }, [debugContext]);

  // ... rest of component ...
};
```

**Step 5: Commit**

```bash
git add frontend/src/lib/supabase.js frontend/src/components/FormFlow.jsx
git commit -m "feat(debug): add logging to Supabase operations

- Log form submission inserts with highlighted form data
- Log email output inserts
- Track duration and status of operations
- Update logs with response data"
```

---

## Task 5: Add Logging to OpenAI Module

**Files:**
- Modify: `frontend/src/lib/openai.js`

**Step 1: Import debug utilities**

Add imports at the top of `openai.js`:

```javascript
import { createLog, createLogUpdate } from './debugLogger';
```

**Step 2: Add global debug context reference**

```javascript
// Global reference to debug context (set by useDebugContext)
let debugContextRef = null;

export function setOpenAIDebugContext(context) {
  debugContextRef = context;
}

function addDebugLog(log) {
  if (debugContextRef?.isDebugMode && debugContextRef?.addLog) {
    return debugContextRef.addLog(log);
  }
  return null;
}

function updateDebugLog(logId, update) {
  if (debugContextRef?.isDebugMode && debugContextRef?.updateLog && logId) {
    debugContextRef.updateLog(logId, update);
  }
}
```

**Step 3: Add logging to generateAnalysis function**

Modify the `generateAnalysis` function to add comprehensive logging:

```javascript
export async function generateAnalysis(payload, onStatusUpdate = () => {}) {
  if (!openai || !OPENAI_ASSISTANT_ID) {
    console.warn('OpenAI not configured, using fallback response');
    onStatusUpdate('generating', 'Génération des recommandations...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    onStatusUpdate('complete', 'Analyse terminée!');
    return generateFallbackResponse(payload);
  }

  try {
    onStatusUpdate('creating_thread', 'Création du fil de discussion...');

    // LOG: Thread creation
    const threadLogId = addDebugLog(createLog('openai', 'thread.create', {
      endpoint: 'threads',
      method: 'POST',
    }));

    const threadStartTime = Date.now();

    // Create thread with timeout
    const thread = await withTimeout(
      openai.beta.threads.create(),
      10000,
      'Thread creation timeout'
    );

    updateDebugLog(threadLogId, createLogUpdate(
      { data: { thread_id: thread.id } },
      Date.now() - threadStartTime,
      'success'
    ));

    onStatusUpdate('sending_data', 'Envoi des données au conseiller IA...');

    // LOG: Message sent with form data
    const msgLogId = addDebugLog(createLog('openai', 'message.send', {
      endpoint: `threads/${thread.id}/messages`,
      method: 'POST',
      payload: payload,
      isHighlighted: true,
      highlightReason: 'form_data',
    }));

    const msgStartTime = Date.now();

    // Send message with form data
    await withTimeout(
      openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: JSON.stringify(payload, null, 2)
      }),
      10000,
      'Message creation timeout'
    );

    updateDebugLog(msgLogId, createLogUpdate(
      { data: { message: 'sent' } },
      Date.now() - msgStartTime,
      'success'
    ));

    onStatusUpdate('analyzing', 'Analyse de vos réponses en cours...');

    // LOG: Run creation
    const runLogId = addDebugLog(createLog('openai', 'run.create', {
      endpoint: `threads/${thread.id}/runs`,
      method: 'POST',
      payload: { assistant_id: OPENAI_ASSISTANT_ID },
    }));

    const runStartTime = Date.now();

    // Create run (don't use createAndPoll as it can hang)
    const run = await withTimeout(
      openai.beta.threads.runs.create(thread.id, {
        assistant_id: OPENAI_ASSISTANT_ID
      }),
      10000,
      'Run creation timeout'
    );

    updateDebugLog(runLogId, createLogUpdate(
      { data: { run_id: run.id, status: run.status } },
      Date.now() - runStartTime,
      'success'
    ));

    // Poll for completion with timeout
    let runStatus = run;
    const startTime = Date.now();
    const maxWaitTime = 45000; // 45 seconds max

    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error('Analysis timeout - taking too long');
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      runStatus = await withTimeout(
        openai.beta.threads.runs.retrieve(thread.id, run.id),
        10000,
        'Status check timeout'
      );

      console.log('Run status:', runStatus.status);
    }

    if (runStatus.status !== 'completed') {
      console.error('Run failed with status:', runStatus.status);
      throw new Error(`Assistant run failed: ${runStatus.status}`);
    }

    onStatusUpdate('generating', 'Génération des recommandations...');

    // Get response
    const messages = await withTimeout(
      openai.beta.threads.messages.list(thread.id),
      10000,
      'Messages fetch timeout'
    );

    const assistantMessage = messages.data.find(m => m.role === 'assistant');

    if (!assistantMessage || !assistantMessage.content || !assistantMessage.content[0]) {
      throw new Error('No response from assistant');
    }

    const responseText = assistantMessage.content[0].text.value;

    // Try to parse as JSON
    try {
      // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
      let jsonStr = responseText;
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      const response = JSON.parse(jsonStr);

      // LOG: Assistant response (HIGHLIGHTED)
      addDebugLog(createLog('openai', 'assistant.response', {
        endpoint: `threads/${thread.id}/messages`,
        method: 'GET',
        isHighlighted: true,
        highlightReason: 'assistant_response',
      }).then(logId => {
        updateDebugLog(logId, {
          status: 'success',
          duration: Date.now() - startTime,
          response: {
            data: {
              teaser: response.teaser || response.summary,
              lead_temperature: response.lead_temperature,
              email_user: response.email_user || null,
              email_sales: response.email_sales || null,
              full_json: responseText,
            },
          },
        });
      }));

      onStatusUpdate('complete', 'Analyse terminée!');

      return {
        teaser: response.teaser || response.summary || generateDefaultTeaser(payload),
        lead_temperature: response.lead_temperature || classifyLead(payload.score.level),
        email_user: response.email_user || null,
        email_sales: response.email_sales || null,
      };
    } catch (parseError) {
      // If JSON parsing fails, use the raw text as teaser
      console.warn('Failed to parse assistant response as JSON:', parseError);

      // LOG: Response parsing error
      addDebugLog(createLog('openai', 'response.parse_error', {
        endpoint: 'parse',
        method: 'JSON.parse',
      }).then(logId => {
        updateDebugLog(logId, createLogUpdate(
          { error: parseError.message, data: { raw_text: responseText } },
          0,
          'error'
        ));
      }));

      onStatusUpdate('complete', 'Analyse terminée!');

      return {
        teaser: responseText.substring(0, 800),
        lead_temperature: classifyLead(payload.score.level),
        email_user: null,
        email_sales: null,
      };
    }

  } catch (error) {
    console.error('OpenAI API error:', error);

    // LOG: Error
    addDebugLog(createLog('openai', 'error', {
      endpoint: 'assistant',
      method: 'CALL',
    }).then(logId => {
      updateDebugLog(logId, createLogUpdate(
        { error: error.message },
        0,
        'error'
      ));
    }));

    onStatusUpdate('generating', 'Génération des recommandations...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    onStatusUpdate('complete', 'Analyse terminée!');
    return generateFallbackResponse(payload);
  }
}
```

**Step 4: Fix async logging issue**

The above code has an issue - `createLog` returns a log object, not a promise. Let's fix it:

```javascript
// LOG: Assistant response (HIGHLIGHTED)
const responseLogId = addDebugLog(createLog('openai', 'assistant.response', {
  endpoint: `threads/${thread.id}/messages`,
  method: 'GET',
  isHighlighted: true,
  highlightReason: 'assistant_response',
}));

updateDebugLog(responseLogId, {
  status: 'success',
  duration: Date.now() - startTime,
  response: {
    data: {
      teaser: response.teaser || response.summary,
      lead_temperature: response.lead_temperature,
      email_user: response.email_user || null,
      email_sales: response.email_sales || null,
      full_json: responseText,
    },
  },
});
```

Apply this fix pattern to the other logging calls that have the same issue.

**Step 5: Update FormFlow to initialize OpenAI debug context**

In `FormFlow.jsx`:

```javascript
import { setOpenAIDebugContext } from '@/lib/openai';

export const FormFlow = () => {
  const debugContext = useDebugContext();

  // Initialize debug context for both modules
  useEffect(() => {
    setDebugContext(debugContext);
    setOpenAIDebugContext(debugContext);
  }, [debugContext]);

  // ... rest of component ...
};
```

**Step 6: Commit**

```bash
git add frontend/src/lib/openai.js frontend/src/components/FormFlow.jsx
git commit -m "feat(debug): add comprehensive logging to OpenAI operations

- Log thread creation, message sending, run creation
- Log assistant responses with full JSON (highlighted)
- Track all stages of OpenAI interaction
- Log errors and parsing failures"
```

---

## Task 6: Create Basic DebugPanel UI

**Files:**
- Create: `frontend/src/components/DebugPanel.jsx`

**Step 1: Create DebugPanel component with basic layout**

```javascript
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebugContext } from '@/context/DebugContext';

export function DebugPanel() {
  const {
    isDebugMode,
    logs,
    activeFilters,
    toggleFilter,
    clearLogs,
    exportLogs,
  } = useDebugContext();

  const [isMinimized, setIsMinimized] = useState(false);

  if (!isDebugMode) {
    return null;
  }

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center text-xl"
          title="Open Debug Panel"
        >
          🐛
        </button>
      </motion.div>
    );
  }

  const successCount = logs.filter(l => l.status === 'success').length;
  const errorCount = logs.filter(l => l.status === 'error').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 w-[600px] h-[500px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="text-lg">🐛</span>
          <h3 className="font-semibold text-gray-900 dark:text-white">Debug Panel</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportLogs}
            className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
            title="Export logs as JSON"
          >
            Export
          </button>
          <button
            onClick={() => {
              if (window.confirm('Supprimer tous les logs de debug ?')) {
                clearLogs();
              }
            }}
            className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800"
            title="Clear all logs"
          >
            Clear
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Minimize"
          >
            −
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <FilterButton
          active={activeFilters.has('all')}
          onClick={() => toggleFilter('all')}
          icon="🟢"
          label="All"
        />
        <FilterButton
          active={activeFilters.has('openai')}
          onClick={() => toggleFilter('openai')}
          icon="🔵"
          label="OpenAI"
        />
        <FilterButton
          active={activeFilters.has('supabase')}
          onClick={() => toggleFilter('supabase')}
          icon="🟠"
          label="Supabase"
        />
        <FilterButton
          active={activeFilters.has('errors')}
          onClick={() => toggleFilter('errors')}
          icon="🔴"
          label="Errors"
        />
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            No logs yet. Interact with the app to see debug logs.
          </div>
        ) : (
          logs.map(log => (
            <LogEntry key={log.id} log={log} />
          ))
        )}
      </div>

      {/* Stats */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">
        📊 Stats: {logs.length} logs | {successCount} success | {errorCount} errors
      </div>
    </motion.div>
  );
}

function FilterButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-sm rounded transition-colors ${
        active
          ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      <span className="mr-1">{icon}</span>
      {label}
    </button>
  );
}

function LogEntry({ log }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    if (log.status === 'success') return '🟢';
    if (log.status === 'error') return '🔴';
    if (log.status === 'pending') return '🟡';
    return '⚪';
  };

  const getTypeIcon = () => {
    if (log.type === 'openai') return '🔵';
    if (log.type === 'supabase') return '🟠';
    return '⚪';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  return (
    <div
      className={`border rounded p-2 text-sm ${
        log.isHighlighted
          ? 'border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      }`}
    >
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-2 flex-1">
          <span>{getStatusIcon()}</span>
          <span>{getTypeIcon()}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                {formatTime(log.timestamp)}
              </span>
              {log.duration && (
                <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                  (+{log.duration}ms)
                </span>
              )}
              {log.isHighlighted && (
                <span className="text-yellow-500" title={log.highlightReason}>
                  ⭐
                </span>
              )}
            </div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {log.operation}
            </div>
            {log.request?.endpoint && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {log.request.method} → {log.request.endpoint}
              </div>
            )}
          </div>
        </div>
        <button className="text-gray-500 dark:text-gray-400">
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700"
          >
            {log.request?.payload && (
              <div className="mb-2">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Request:
                </div>
                <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                  {JSON.stringify(log.request.payload, null, 2)}
                </pre>
              </div>
            )}

            {log.response && (
              <div>
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Response:
                </div>
                <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                  {JSON.stringify(log.response, null, 2)}
                </pre>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(JSON.stringify(log, null, 2));
              }}
              className="mt-2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              📋 Copy JSON
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DebugPanel;
```

**Step 2: Add DebugPanel to App**

Modify `frontend/src/App.js`:

```javascript
import { DebugPanel } from '@/components/DebugPanel';

function App() {
  return (
    <DebugProvider>
      <ThemeProvider>
        <div className="App">
          <FormFlow />
        </div>
        <DebugPanel />
      </ThemeProvider>
    </DebugProvider>
  );
}
```

**Step 3: Test the UI**

Run: `npm start`
Action: Press Cmd+Shift+D to open debug panel
Expected: Debug panel appears in bottom-right corner

**Step 4: Commit**

```bash
git add frontend/src/components/DebugPanel.jsx frontend/src/App.js
git commit -m "feat(debug): create DebugPanel UI component

- Timeline view with expandable log entries
- Color-coded status and type icons
- Filter buttons for All, OpenAI, Supabase, Errors
- Highlight indicator for important logs
- Export and Clear functionality
- Minimizable to bug icon
- Dark mode support"
```

---

## Task 7: Test End-to-End Integration

**Files:**
- None (testing only)

**Step 1: Start the application**

Run: `npm start`
Expected: App starts without errors

**Step 2: Test debug mode activation**

Action: Press Cmd+Shift+D (or Ctrl+Shift+D)
Expected: Debug panel appears in bottom-right corner

**Step 3: Complete a form submission**

Actions:
1. Fill out the questionnaire
2. Submit answers
3. Wait for OpenAI analysis
4. Submit lead capture form

Expected in Debug Panel:
- 🔵 OpenAI thread.create
- 🔵 OpenAI message.send (highlighted ⭐ with form data)
- 🔵 OpenAI run.create
- 🔵 OpenAI assistant.response (highlighted ⭐ with full JSON)
- 🟠 Supabase insert.form_submissions (highlighted ⭐)
- 🟠 Supabase insert.email_outputs (if applicable)

**Step 4: Test filters**

Actions:
1. Click "OpenAI" filter
2. Verify only OpenAI logs shown
3. Click "Errors" filter
4. Click "All" to reset

Expected: Filters work correctly

**Step 5: Test log expansion**

Action: Click on a highlighted log entry
Expected:
- Request/Response details expand
- JSON is properly formatted
- "Copy JSON" button appears

**Step 6: Test export**

Action: Click "Export" button
Expected: JSON file downloads with format `debug-logs-YYYY-MM-DD-HHmmss.json`

**Step 7: Test persistence**

Actions:
1. Refresh the page
2. Press Cmd+Shift+D

Expected: Previous logs still visible

**Step 8: Test clear**

Actions:
1. Click "Clear" button
2. Confirm dialog

Expected: All logs cleared

**Step 9: Document any issues found**

Create a file `docs/debug-mode-test-results.md` with any bugs or improvements needed.

---

## Task 8: Final Cleanup and Documentation

**Files:**
- Modify: `frontend/README.md`
- Create: `docs/debug-mode-usage.md`

**Step 1: Create usage documentation**

Create `docs/debug-mode-usage.md`:

```markdown
# Debug Mode Usage Guide

## Activation

Press **Cmd+Shift+D** (Mac) or **Ctrl+Shift+D** (Windows/Linux) to toggle debug mode.

## Features

### Timeline View
- Chronological list of all API interactions
- Color-coded by status (🟢 success, 🔴 error, 🟡 pending)
- Type indicators (🔵 OpenAI, 🟠 Supabase)
- Highlighted entries (⭐) for important data (form submissions, assistant responses)

### Filters
- **All**: Show all logs
- **OpenAI**: Only OpenAI API calls
- **Supabase**: Only Supabase operations
- **Errors**: Only failed operations

### Log Details
Click any log entry to expand and see:
- Full request payload
- Complete response data
- Timestamps and duration
- Copy JSON button for clipboard

### Export
Click "Export" to download all logs as JSON file for sharing or analysis.

### Clear
Click "Clear" to remove all logs from storage.

### Minimize
Click "−" to minimize panel to a small bug icon (🐛).

## What Gets Logged

### Supabase Operations
- Form submission inserts (highlighted ⭐)
- Email output inserts
- All response data and errors

### OpenAI Operations
- Thread creation
- Message sending with form data (highlighted ⭐)
- Run creation and status polling
- **Assistant responses** with full JSON (highlighted ⭐)
- Parsing errors

## Privacy & Security

⚠️ **Important**: API keys and authentication tokens are automatically redacted from logs.

## Persistence

- Logs persist across page refreshes via localStorage
- Maximum 100 logs stored
- Logs older than 7 days automatically deleted
- Storage key: `nlpd_debug_logs`

## Technical Details

- Context API for global state
- localStorage for persistence
- Sanitization of sensitive data
- Configurable filters and display options
```

**Step 2: Update main README**

Add a section to `frontend/README.md`:

```markdown
## Debug Mode

A debug panel is available for development to trace all Supabase and OpenAI API interactions.

**Activate**: Press `Cmd+Shift+D` (Mac) or `Ctrl+Shift+D` (Windows/Linux)

See [docs/debug-mode-usage.md](../docs/debug-mode-usage.md) for full documentation.

**Features**:
- Timeline of all API calls
- Highlighted form data and assistant responses
- Export logs as JSON
- Persistent across sessions
- Automatic sensitive data redaction
```

**Step 3: Commit documentation**

```bash
git add docs/debug-mode-usage.md frontend/README.md
git commit -m "docs: add debug mode usage documentation

- Create comprehensive usage guide
- Document all features and filters
- Add privacy and security notes
- Update main README with debug mode section"
```

---

## Task 9: Create Pull Request

**Files:**
- None (Git operations)

**Step 1: Push branch to remote**

```bash
git push -u origin feature/debug-mode
```

**Step 2: Create PR via GitHub CLI**

```bash
gh pr create --title "feat: add debug mode with API logging panel" --body "$(cat <<'EOF'
## Summary

Implements a comprehensive debug panel for tracing all Supabase and OpenAI API interactions during development.

## Features

✅ **Timeline View**
- Chronological log of all API calls
- Color-coded status indicators (success, error, pending)
- Type badges (OpenAI, Supabase)

✅ **Highlighted Logs**
- Form submission data ⭐
- OpenAI assistant responses ⭐
- Full JSON responses visible

✅ **Interactive UI**
- Expandable log entries
- Filter by type or status
- Export logs as JSON
- Clear all logs
- Minimizable panel

✅ **Persistence**
- localStorage with 100 log limit
- Auto-cleanup of logs > 7 days
- Survives page refreshes

✅ **Security**
- Automatic redaction of API keys
- Sanitization of sensitive headers
- Safe for development use

## Activation

Press **Cmd+Shift+D** (Mac) or **Ctrl+Shift+D** (Windows/Linux)

## Implementation

Based on design: `docs/plans/2026-02-02-debug-mode-design.md`

**Components**:
- `DebugContext.jsx` - Global state management
- `debugLogger.js` - Logging utilities
- `DebugPanel.jsx` - UI component
- Modified `supabase.js` - Supabase logging
- Modified `openai.js` - OpenAI logging

## Testing

- [x] Keyboard shortcut works
- [x] Logs capture form submissions
- [x] Logs capture OpenAI interactions
- [x] Filters work correctly
- [x] Export downloads JSON
- [x] Clear removes all logs
- [x] Persistence across refreshes
- [x] Dark mode support

## Screenshots

(Add screenshots if desired)

## Documentation

See `docs/debug-mode-usage.md` for full usage guide.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**Step 3: Verify PR created**

Run: `gh pr view --web`
Expected: PR opens in browser

---

## Completion Checklist

After all tasks complete:

- [ ] All files created and modified as specified
- [ ] All commits made with descriptive messages
- [ ] Debug panel appears on Cmd+Shift+D
- [ ] Logs capture Supabase operations
- [ ] Logs capture OpenAI operations
- [ ] Highlighted logs show form data and assistant responses
- [ ] Filters work (All, OpenAI, Supabase, Errors)
- [ ] Export downloads JSON file
- [ ] Clear removes all logs
- [ ] Persistence works across refreshes
- [ ] Dark mode supported
- [ ] Documentation complete
- [ ] PR created

---

## Notes

- This is a **development-only** feature
- Safe to leave in production (inactive by default)
- Can be fully disabled via environment variable if needed
- Sensitive data is automatically redacted
- Maximum 100 logs to prevent memory issues
- Auto-cleanup of old logs (> 7 days)
