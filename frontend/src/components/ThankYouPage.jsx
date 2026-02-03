import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  Mail, 
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { BOOKING_CALENDAR_URL } from '@/lib/booking';

export const ThankYouPage = ({ score, priorities, userEmail, onBookConsultation }) => {
  return (
    <div className="min-h-screen bg-gradient-hero py-4 sm:py-12 w-full max-w-[100vw] overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-[100vw]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header avec logo */}
          <div className="text-center mb-6 sm:mb-10">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <img
                src="/logo-ypsys.png"
                alt="Ypsys - time for real performance"
                className="h-12 sm:h-16 md:h-20 w-auto"
              />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Votre diagnostic nLPD
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Merci d'avoir complété l'évaluation. Voici vos résultats.
            </p>
          </div>

          {/* Email Confirmation - compact */}
          <Card className="border-2 border-primary/20 bg-primary/5 mb-4 sm:mb-8">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Rapport complet envoyé par email
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Un rapport détaillé avec des recommandations personnalisées a été envoyé à{' '}
                    <span className="font-medium text-foreground">{userEmail}</span>.
                    Vérifiez votre boîte de réception (et vos spams).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Calendar Section - compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="border-2 border-primary/20 shadow-elegant mb-4 sm:mb-8">
              <CardHeader className="text-center p-4 sm:p-6">
                <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-2xl">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  Réservez votre consultation gratuite
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Discutez de vos résultats avec un expert nLPD et obtenez des conseils personnalisés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <iframe
                    src={BOOKING_CALENDAR_URL}
                    title="Réserver une consultation"
                    className="w-full border-0 rounded-lg"
                    style={{ height: '600px', minHeight: '600px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      document.getElementById('booking-fallback').style.display = 'block';
                    }}
                  />
                  <div
                    id="booking-fallback"
                    style={{ display: 'none' }}
                    className="text-center py-12"
                  >
                    <p className="text-muted-foreground mb-4">
                      Le calendrier ne peut pas être chargé pour le moment.
                    </p>
                    <Button
                      variant="premium"
                      size="lg"
                      onClick={() => window.open(BOOKING_CALENDAR_URL, '_blank')}
                    >
                      Ouvrir le calendrier dans un nouvel onglet
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-center text-muted-foreground">
                    <strong>Nos experts sont disponibles</strong> pour répondre à vos questions
                    et vous accompagner dans votre mise en conformité nLPD.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA - bouton tient sur une ligne mobile */}
          <div className="text-center px-0">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">
              Besoin d'aide pour mettre en place les actions?
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-lg mx-auto">
              Nos experts peuvent vous accompagner dans la mise en conformité nLPD
              et la sécurisation de vos données.
            </p>
            <Button
              variant="premium"
              size="lg"
              onClick={onBookConsultation}
              className="group w-full max-w-full text-xs sm:text-base px-3 sm:px-6 min-w-0"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="truncate">Réserver une consultation gratuite</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform group-hover:translate-x-1" />
            </Button>
            <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4">
              30 minutes • Sans engagement • Experts certifiés
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ThankYouPage;
