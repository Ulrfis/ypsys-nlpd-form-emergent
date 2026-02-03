/**
 * Load PostHog only after user has consented to statistics (RGPD/nLPD).
 * Called from PostHogLoader component when consent.statistics is true.
 */
const POSTHOG_KEY = 'phc_xAvL2Iq4tFmANRE7kzbKwaSqp1HJjN7x48s3vr0CMjs';
const POSTHOG_HOST = 'https://us.i.posthog.com';

let loaded = false;

export function loadPostHog() {
  if (typeof window === 'undefined' || loaded) return;
  if (window.posthog && window.posthog.__loaded) return;

  loaded = true;

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.crossOrigin = 'anonymous';
  script.async = true;
  script.src = POSTHOG_HOST.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js';
  script.onload = () => {
    if (window.posthog && typeof window.posthog.init === 'function') {
      window.posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: 'identified_only',
        session_recording: {
          recordCrossOriginIframes: true,
        },
      });
    }
  };
  document.head.appendChild(script);
}

export default loadPostHog;
