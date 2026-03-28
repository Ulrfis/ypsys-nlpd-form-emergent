import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useConsent } from '@/context/ConsentContext';

export const ConsentPopup = () => {
  const { hasDecidedConsent, acceptAll, refuseOptional, saveCustom, resetConsentChoice } = useConsent();
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  if (hasDecidedConsent) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-3 left-3 right-3 z-[90] md:left-auto md:right-4 md:max-w-2xl"
      >
        <Card className="border border-border shadow-elegant">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cookies & confidentialité</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Les cookies nécessaires sont toujours actifs. Sans action de votre part, les analytics restent désactivés.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {isCustomizeOpen && (
              <div className="rounded-md border border-border p-3 space-y-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="analytics-consent"
                    checked={analyticsEnabled}
                    onCheckedChange={(checked) => setAnalyticsEnabled(Boolean(checked))}
                  />
                  <div>
                    <Label htmlFor="analytics-consent" className="text-sm font-medium cursor-pointer">
                      Mesure d&apos;audience (optionnel)
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Autorise les outils analytics pour comprendre l&apos;usage et améliorer le formulaire.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Voir notre{' '}
              <Link to="/politique-confidentialite" className="text-primary underline hover:no-underline">
                politique de confidentialité
              </Link>
              .
            </p>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={refuseOptional}>
                Continuer sans analytics
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsCustomizeOpen((prev) => !prev)}>
                {isCustomizeOpen ? 'Masquer' : 'Personnaliser'}
              </Button>
              <Button
                type="button"
                variant="premium"
                className="ml-auto"
                onClick={() => {
                  if (isCustomizeOpen) {
                    saveCustom({ analytics: analyticsEnabled });
                    return;
                  }
                  acceptAll();
                }}
              >
                {isCustomizeOpen ? 'Enregistrer' : 'Accepter'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export const CookiePreferencesButton = () => {
  const { resetConsentChoice } = useConsent();

  return (
    <button
      type="button"
      onClick={resetConsentChoice}
      className="fixed bottom-3 right-3 z-[80] text-xs px-3 py-1.5 rounded-full border border-border bg-background/95 backdrop-blur text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
      title="Modifier vos préférences cookies"
    >
      Préférences cookies
    </button>
  );
};

export default ConsentPopup;
