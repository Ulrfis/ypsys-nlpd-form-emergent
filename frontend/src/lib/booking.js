/**
 * Calendrier de réservation — TidyCal (Lionel Dumas)
 * Page « Meeting 30 minutes nLPD » : embed iframe sur ThankYouPage, lien direct pour fallback / window.open.
 */
export const BOOKING_MEETING_PAGE_URL = 'https://tidycal.com/ldumas/30-minute-meeting';

/** Query `embed=1` requise par TidyCal pour l’affichage en iframe */
export const BOOKING_EMBED_URL = `${BOOKING_MEETING_PAGE_URL}?embed=1`;

/** Lien pleine page (sans embed) — ex. ouverture dans un nouvel onglet */
export const BOOKING_CALENDAR_URL = BOOKING_MEETING_PAGE_URL;
