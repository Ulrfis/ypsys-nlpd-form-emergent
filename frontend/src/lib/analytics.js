import posthog from 'posthog-js';
import grain from '@/lib/grain';

const POSTHOG_KEY = process.env.REACT_APP_POSTHOG_KEY;
const POSTHOG_HOST = process.env.REACT_APP_POSTHOG_HOST || 'https://eu.i.posthog.com';

let isInitialized = false;

export const initAnalytics = () => {
  if (isInitialized || typeof window === 'undefined') return;
  const hasPosthogKey = Boolean(POSTHOG_KEY && POSTHOG_KEY.trim());

  if (!hasPosthogKey) {
    console.warn('[Analytics] REACT_APP_POSTHOG_KEY is missing: PostHog disabled, Grain remains active.');
    isInitialized = true;
    return;
  }

  try {
    posthog.init(POSTHOG_KEY.trim(), {
      api_host: POSTHOG_HOST,
      capture_pageview: false,
      autocapture: true,
      person_profiles: 'identified_only',
    });
    isInitialized = true;
  } catch (error) {
    console.error('[Analytics] PostHog init failed:', error);
  }
};

export const trackEvent = (eventName, properties = {}) => {
  if (!isInitialized) return;

  try {
    grain.track(eventName, properties);
  } catch (error) {
    console.error(`[Analytics] Grain capture failed for ${eventName}:`, error);
  }

  try {
    posthog.capture(eventName, properties);
  } catch (error) {
    console.error(`[Analytics] capture failed for ${eventName}:`, error);
  }
};

export const trackPageView = (pathname, search = '') => {
  trackEvent('page_view', {
    pathname,
    search,
  });
};

export const identifyUser = (distinctId, properties = {}) => {
  if (!isInitialized || !distinctId) return;

  try {
    grain.setUserId(distinctId);
  } catch (error) {
    console.error('[Analytics] Grain identify failed:', error);
  }

  try {
    posthog.identify(distinctId, properties);
  } catch (error) {
    console.error('[Analytics] identify failed:', error);
  }
};
