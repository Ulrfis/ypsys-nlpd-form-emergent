import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCookieConsent } from '@/context/CookieConsentContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const POLICY_COOKIES_URL = 'https://www.ypsys.com/politique-de-cookies-ue/';

export function CookieBanner() {
  const { bannerVisible, acceptAll, acceptEssentialOnly } = useCookieConsent();
  const [showDetails, setShowDetails] = useState(false);

  if (!bannerVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-card border-t-2 border-border shadow-lg"
      >
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground mb-1">
                Nous utilisons des cookies pour améliorer l’expérience du site et des statistiques
                d’utilisation (PostHog). En acceptant, vous consentez à ces usages conformément à notre{' '}
                <a
                  href={POLICY_COOKIES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:no-underline"
                >
                  politique de cookies
                </a>
                .
              </p>
              {showDetails && (
                <p className="text-xs text-muted-foreground mt-2">
                  Cookies essentiels : nécessaires au fonctionnement du formulaire.
                  Cookies statistiques : nous demandons votre permission pour les activer.
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => setShowDetails((v) => !v)}
              >
                {showDetails ? 'Moins' : 'En savoir plus'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={acceptEssentialOnly}
              >
                Refuser les statistiques
              </Button>
              <Button
                variant="premium"
                size="sm"
                onClick={acceptAll}
              >
                Tout accepter
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CookieBanner;
