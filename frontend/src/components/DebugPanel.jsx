import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebugContext } from '@/context/DebugContext';
import { X, ChevronDown, ChevronUp, Download, Trash2, Database, Cpu, List } from 'lucide-react';

/**
 * Filter buttons for log types
 */
const FilterButtons = ({ activeFilters, toggleFilter }) => {
  const filters = [
    { id: 'all', label: 'Tous', icon: List, color: 'bg-gray-500' },
    { id: 'supabase', label: 'Supabase', icon: Database, color: 'bg-green-500' },
    { id: 'openai', label: 'OpenAI', icon: Cpu, color: 'bg-blue-500' },
  ];

  return (
    <div className="flex gap-2 mb-4">
      {filters.map(filter => {
        const Icon = filter.icon;
        const isActive = activeFilters.has('all') || activeFilters.has(filter.id);

        return (
          <button
            key={filter.id}
            onClick={() => toggleFilter(filter.id)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
              transition-all duration-200
              ${isActive
                ? `${filter.color} text-white`
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }
            `}
          >
            <Icon size={16} />
            {filter.label}
          </button>
        );
      })}
    </div>
  );
};

/**
 * Individual log entry component
 */
const LogEntry = ({ log, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 dark:text-green-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'supabase': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'openai': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-CH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`
        border rounded-lg p-3 mb-2
        ${log.isHighlighted
          ? 'border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(log.type)}`}>
              {log.type}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTimestamp(log.timestamp)}
            </span>
            {log.duration !== null && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {log.duration}ms
              </span>
            )}
            {log.isHighlighted && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
                ⭐ {log.highlightReason === 'form_data' ? 'Form Data' : 'OpenAI Response'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
              {log.operation}
            </span>
            <span className={`text-sm font-medium ${getStatusColor(log.status)}`}>
              {log.status.toUpperCase()}
            </span>
          </div>
          {log.request.method && (
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {log.request.method} {log.request.endpoint}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
          >
            {/* Request */}
            {log.request.payload && (
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Request:
                </div>
                <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                  {JSON.stringify(log.request.payload, null, 2)}
                </pre>
              </div>
            )}

            {/* Response */}
            {log.response && (
              <div>
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Response:
                </div>
                {log.response.error ? (
                  <pre className="text-xs bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-2 rounded overflow-x-auto">
                    {JSON.stringify(log.response.error, null, 2)}
                  </pre>
                ) : (
                  <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                    {JSON.stringify(log.response.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Side tab to open the debug panel (visible when debug mode is on and panel is closed)
 */
const DebugTab = ({ onClick, logCount }) => (
  <button
    type="button"
    onClick={onClick}
    className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-1 py-2 pl-3 pr-2 rounded-l-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:pl-4 transition-all"
    title="Ouvrir le panneau Debug"
  >
    <span className="text-sm font-medium whitespace-nowrap">Debug</span>
    {logCount > 0 && (
      <span className="px-1.5 py-0.5 rounded bg-white/20 text-xs font-medium">
        {logCount}
      </span>
    )}
  </button>
);

/**
 * Main Debug Panel Component
 */
export const DebugPanel = () => {
  const {
    isDebugMode,
    isPanelOpen,
    openPanel,
    closePanel,
    getFilteredLogs,
    clearLogs,
    exportLogs,
    activeFilters,
    toggleFilter,
    allLogs,
  } = useDebugContext();

  const logs = getFilteredLogs();

  if (!isDebugMode) return null;

  return (
    <>
      {/* Side tab: visible when panel is closed, click to open */}
      {!isPanelOpen && (
        <DebugTab onClick={openPanel} logCount={allLogs?.length ?? 0} />
      )}

      {/* Full panel: overlay + drawer, close via X or overlay click */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={closePanel}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">Debug Panel</h2>
                    <span className="px-2 py-1 bg-white/20 rounded text-sm">
                      {logs.length} logs
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={closePanel}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    title="Fermer le panneau"
                  >
                    <X size={24} />
                  </button>
                </div>
                <p className="text-sm text-white/80">
                  Cliquez sur ❌ ou sur le fond pour fermer · Réouvrir via l’onglet « Debug »
                </p>
              </div>

              {/* Toolbar */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <FilterButtons activeFilters={activeFilters} toggleFilter={toggleFilter} />
                <div className="flex gap-2">
                  <button
                    onClick={exportLogs}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Download size={16} />
                    Exporter JSON
                  </button>
                  <button
                    onClick={clearLogs}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    <Trash2 size={16} />
                    Effacer
                  </button>
                </div>
              </div>

              {/* Logs list */}
              <div className="flex-1 overflow-y-auto p-4">
                {logs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Database size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Aucun log disponible</p>
                    <p className="text-sm mt-2">
                      Les logs apparaîtront ici au fur et à mesure des interactions avec Supabase et OpenAI
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {logs.map((log, index) => (
                      <LogEntry key={log.id} log={log} index={index} />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DebugPanel;
