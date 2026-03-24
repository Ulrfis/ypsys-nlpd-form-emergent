import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sparkles,
  CheckCircle,
  FileText
} from 'lucide-react';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';

export const ResultsPreview = ({
  score100,
  prefilledEmail,
  isLoading,
  onSubmitLead,
  onSendPrefilledReport,
}) => {
  const safeScore = Math.min(Math.max(Math.round(score100 ?? 0), 0), 100);

  return (
    <div className="min-h-screen bg-gradient-hero py-4 sm:py-12 w-full max-w-[100vw] overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-[100vw]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header - compact sur mobile */}
          <div className="text-center mb-4 sm:mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 sm:mb-6"
            >
              <Sparkles className="w-7 h-7 sm:w-10 sm:h-10 text-primary-foreground" />
            </motion.div>
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 sm:mb-3">
              Votre analyse est terminée
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Découvrez vos axes prioritaires : Nous avons évalué 15 critères de conformité nLPD.
              Des failles ont été détectées dans votre infrastructure.
            </p>
          </div>

          <Card className="border-2 border-primary/20 bg-card mb-4 sm:mb-6">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold mb-1 text-foreground">
                    Votre rapport détaillé révèle :
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold text-primary">
                    Score : {safeScore}/100
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border bg-card mb-4 sm:mb-8">
            <CardContent className="p-3 sm:p-5">
              <h3 className="text-sm sm:text-base font-semibold text-foreground mb-3 sm:mb-5">
                Vous allez obtenir :
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {[
                  "Votre score de conformité /100: Etes-vous a 25/100 ou 85/100 ?",
                  "Vos failles identifiées par priorité: lesquelles sont critiques, urgentes, moyennes ?",
                  "L'impact financier estimé: combien peut coûter une non-conformité lors d'un contrôle ?",
                  "Une analyse de votre situation et des propositions d'amélioration: que faire en priorité ?",
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-2 sm:gap-3"
                  >
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-foreground/80">{item}</span>
                  </motion.div>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-foreground/80 mt-4">
                Ne découvrez pas vos failles le jour de l'audit.
              </p>
            </CardContent>
          </Card>

          <LeadCaptureForm
            onSubmit={onSubmitLead}
            isLoading={isLoading}
            prefilledEmail={prefilledEmail}
            onSendPrefilledReport={onSendPrefilledReport}
            submitLabel="Recevoir mon diagnostic prioritaire"
            hideFooterNote={true}
          />
          <p className="text-center text-xs italic text-muted-foreground mt-3">
            Valeur du diagnostic de 650 CHF = offert
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsPreview;
