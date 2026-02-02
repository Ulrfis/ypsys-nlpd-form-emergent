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

    // Clean up blob URL after a short delay to ensure download starts
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
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
    getFilteredLogs,
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
