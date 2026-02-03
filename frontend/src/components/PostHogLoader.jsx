import React, { useEffect } from 'react';
import { useCookieConsent } from '@/context/CookieConsentContext';
import { loadPostHog } from '@/lib/posthog-loader';

/**
 * Loads PostHog analytics only when user has consented to statistics (RGPD/nLPD).
 */
export function PostHogLoader() {
  const { hasStatisticsConsent } = useCookieConsent();

  useEffect(() => {
    if (hasStatisticsConsent) {
      loadPostHog();
    }
  }, [hasStatisticsConsent]);

  return null;
}

export default PostHogLoader;
