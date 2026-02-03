import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'nlpd_cookie_consent';
const CONSENT_VERSION = 1;

const defaultConsent = {
  version: CONSENT_VERSION,
  statistics: false,
  timestamp: null,
};

const CookieConsentContext = createContext(null);

export function CookieConsentProvider({ children }) {
  const [consent, setConsentState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.version === CONSENT_VERSION) {
          return {
            ...defaultConsent,
            ...parsed,
          };
        }
      }
    } catch (e) {
      console.warn('Cookie consent parse error:', e);
    }
    return defaultConsent;
  });

  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    const hasAnswered = consent.timestamp != null;
    setBannerVisible(!hasAnswered);
  }, [consent.timestamp]);

  const setConsent = useCallback((choices) => {
    const next = {
      ...defaultConsent,
      ...consent,
      ...choices,
      version: CONSENT_VERSION,
      timestamp: Date.now(),
    };
    setConsentState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Cookie consent save error:', e);
    }
    setBannerVisible(false);
  }, [consent]);

  const acceptAll = useCallback(() => {
    setConsent({ statistics: true });
  }, [setConsent]);

  const acceptEssentialOnly = useCallback(() => {
    setConsent({ statistics: false });
  }, [setConsent]);

  const value = {
    consent,
    setConsent,
    acceptAll,
    acceptEssentialOnly,
    bannerVisible,
    setBannerVisible,
    hasStatisticsConsent: consent.statistics === true,
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider');
  }
  return ctx;
}

export default CookieConsentContext;
