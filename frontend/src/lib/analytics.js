import posthog from 'posthog-js';

const POSTHOG_KEY = process.env.REACT_APP_POSTHOG_KEY;
const POSTHOG_HOST = process.env.REACT_APP_POSTHOG_HOST || 'https://eu.i.posthog.com';
const SITEBEHAVIOUR_SECRET = process.env.REACT_APP_SITEBEHAVIOUR_SECRET || '9fe58556-e103-4c79-a1b1-5495fe92d011';

let isInitialized = false;

const injectSiteBehaviourScript = () => {
  if (typeof window === 'undefined' || window.__siteBehaviourInjected) return;

  try {
    if (window.location?.search?.indexOf('capture-sitebehaviour-heatmap') !== -1) {
      sessionStorage.setItem('capture-sitebehaviour-heatmap', '_');
    }

    window.sitebehaviourTrackingSecret = SITEBEHAVIOUR_SECRET;
    const scriptElement = document.createElement('script');
    scriptElement.defer = true;
    scriptElement.id = 'site-behaviour-script-v2';
    scriptElement.src = `https://sitebehaviour-cdn.fra1.cdn.digitaloceanspaces.com/index.min.js?sitebehaviour-secret=${SITEBEHAVIOUR_SECRET}`;
    document.head.appendChild(scriptElement);
    window.__siteBehaviourInjected = true;
  } catch (error) {
    console.error('[Analytics] SiteBehaviour init failed:', error);
  }
};

export const initAnalytics = () => {
  if (isInitialized || typeof window === 'undefined') return;
  if (!POSTHOG_KEY || !POSTHOG_KEY.trim()) return;

  try {
    posthog.init(POSTHOG_KEY.trim(), {
      api_host: POSTHOG_HOST,
      capture_pageview: false,
      autocapture: true,
      person_profiles: 'identified_only',
    });
    injectSiteBehaviourScript();
    isInitialized = true;
  } catch (error) {
    console.error('[Analytics] PostHog init failed:', error);
  }
};

export const trackEvent = (eventName, properties = {}) => {
  if (!isInitialized) return;
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
    posthog.identify(distinctId, properties);
  } catch (error) {
    console.error('[Analytics] identify failed:', error);
  }
};
