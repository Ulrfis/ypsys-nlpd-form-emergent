import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Calendar, ArrowRight } from 'lucide-react';

export const FinalThankYouPage = ({ userEmail, onBookConsultation }) => {
  return (
    <div className="min-h-screen bg-gradient-hero py-4 sm:py-12 w-full max-w-[100vw] overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-[100vw]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-6 sm:mb-10">
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Merci pour votre confiance
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Votre demande a bien été enregistrée.
            </p>
          </div>

          <Card className="border-2 border-primary/20 bg-primary/5 mb-6 sm:mb-8">
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
                    Un rapport détaillé a été envoyé à{' '}
                    <span className="font-medium text-foreground break-all">{userEmail || 'votre adresse email'}</span>.
                    Vérifiez votre boîte de réception (et vos spams).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              variant="premium"
              size="lg"
              onClick={onBookConsultation}
              className="group w-full max-w-full text-xs sm:text-base px-3 sm:px-6 min-w-0 h-auto py-3"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="text-center whitespace-normal leading-tight">PRENDRE RENDEZ-VOUS - 30 MIN</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FinalThankYouPage;
