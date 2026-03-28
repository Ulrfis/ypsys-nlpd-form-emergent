import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useConsent } from '@/context/ConsentContext';

export const ConsentPopup = () => {
  const { hasDecidedConsent, acceptAll, refuseOptional, saveCustom } = useConsent();
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  if (hasDecidedConsent) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-sm p-4 flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-xl"
        >
          <Card className="border-2 border-border shadow-elegant">
            <CardHeader>
              <CardTitle>Paramètres de confidentialité</CardTitle>
              <CardDescription>
                Nous utilisons des cookies strictement nécessaires pour le fonctionnement du questionnaire.
                Vous pouvez activer en plus la mesure d&apos;audience pour améliorer l&apos;expérience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border border-border p-3">
                <p className="text-sm font-medium">Cookies nécessaires</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Toujours actifs. Requis pour la sécurité et le bon fonctionnement.
                </p>
              </div>

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
                Vous pouvez consulter notre{' '}
                <Link to="/politique-confidentialite" className="text-primary underline hover:no-underline">
                  politique de confidentialité
                </Link>
                {' '}pour plus de détails.
              </p>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={refuseOptional}>
                  Tout refuser
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
                  {isCustomizeOpen ? 'Enregistrer mes choix' : 'Tout accepter'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConsentPopup;
