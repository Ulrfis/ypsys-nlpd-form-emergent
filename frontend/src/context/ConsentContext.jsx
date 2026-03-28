import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CONSENT_STORAGE_KEY = 'nlpd_consent_v1';

const ConsentContext = createContext(null);

function parseStoredConsent(rawValue) {
  if (!rawValue) return null;
  try {
    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== 'object') return null;
    const analytics = Boolean(parsed?.preferences?.analytics);
    return {
      decidedAt: parsed.decidedAt || null,
      source: parsed.source || 'popup',
      preferences: {
        necessary: true,
        analytics,
      },
    };
  } catch {
    return null;
  }
}

export function ConsentProvider({ children }) {
  const [consent, setConsent] = useState(() => {
    if (typeof window === 'undefined') return null;
    return parseStoredConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!consent) {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  }, [consent]);

  const decideConsent = useCallback((preferences, source = 'popup') => {
    setConsent({
      decidedAt: new Date().toISOString(),
      source,
      preferences: {
        necessary: true,
        analytics: Boolean(preferences?.analytics),
      },
    });
  }, []);

  const acceptAll = useCallback(() => decideConsent({ analytics: true }, 'accept_all'), [decideConsent]);
  const refuseOptional = useCallback(() => decideConsent({ analytics: false }, 'refuse_optional'), [decideConsent]);
  const saveCustom = useCallback((preferences) => decideConsent(preferences, 'customize'), [decideConsent]);
  const resetConsentChoice = useCallback(() => setConsent(null), []);

  const value = useMemo(() => ({
    consent,
    hasDecidedConsent: Boolean(consent),
    hasConsentedToAnalytics: Boolean(consent?.preferences?.analytics),
    acceptAll,
    refuseOptional,
    saveCustom,
    resetConsentChoice,
  }), [consent, acceptAll, refuseOptional, saveCustom, resetConsentChoice]);

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return context;
}

export default ConsentContext;
