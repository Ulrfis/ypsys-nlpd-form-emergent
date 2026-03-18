import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  CheckCircle,
  ArrowRight,
  FileText
} from 'lucide-react';

const levelMessages = {
  critical: 'Des actions prioritaires ont été repérées pour renforcer rapidement votre conformité.',
  vigilance: 'Des points de vigilance ont été identifiés pour consolider votre conformité.',
  good: 'Votre base est solide, avec quelques améliorations ciblées pour aller plus loin.',
};

export const ResultsPreview = ({ teaser, severityBand = 'vigilance', onRequestReport }) => {
  const summaryMessage = levelMessages[severityBand] || levelMessages.vigilance;
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
            {teaser ? (
              <p className="text-sm sm:text-base text-muted-foreground">{teaser}</p>
            ) : (
              <p className="text-sm sm:text-base text-muted-foreground">
                Nous avons évalué 15 critères techniques de conformité nLPD.
              </p>
            )}
          </div>

          <Card className="border-2 border-primary/20 bg-card mb-4 sm:mb-6">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold mb-1 text-foreground">
                    {summaryMessage}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border bg-card mb-4 sm:mb-8">
            <CardContent className="p-3 sm:p-5">
              <h3 className="text-sm sm:text-base font-semibold text-foreground mb-3 sm:mb-5">
                Votre rapport détaillé vous indique:
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {[
                  "Votre score de conformité /100",
                  "Les 3 failles prioritaires à corriger",
                  "La roadmap d'action par urgence",
                  "Les risques juridiques encourus",
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
            </CardContent>
          </Card>

          {/* CTA Button - tient sur une ligne mobile, marges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="px-0 sm:px-0"
          >
            <Button
              variant="premium"
              size="lg"
              onClick={onRequestReport}
              className="w-full max-w-full group text-xs sm:text-base px-3 sm:px-6 min-w-0 h-auto py-3"
            >
              <span className="text-center whitespace-normal leading-tight">Recevoir mon résultat complet</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsPreview;
