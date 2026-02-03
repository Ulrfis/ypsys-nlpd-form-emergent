import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ScoreGauge from './ScoreGauge';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Mail,
  ArrowRight,
  FileText,
  Target,
  Users
} from 'lucide-react';

// Function to generate personalized score messages
const getScoreMessage = (score, firstName = '') => {
  const percentage = Math.round(score.normalized * 10);
  const name = firstName ? ` ${firstName}` : '';

  if (percentage >= 70) {
    return `Bravo${name}! Votre organisation obtient un score de ${percentage}%, ce qui indique une bonne maîtrise des aspects fondamentaux de la protection des données. Toutefois, quelques améliorations peuvent encore être apportées pour atteindre une conformité optimale.`;
  } else if (percentage >= 31) {
    return `Votre organisation obtient un score de ${percentage}%. Des lacunes significatives ont été identifiées dans votre dispositif de conformité nLPD. Des mesures correctives prioritaires sont nécessaires pour réduire les risques juridiques et protéger vos données sensibles.`;
  } else {
    return `Attention${name}! Votre organisation présente un score de ${percentage}%, révélant des failles critiques dans votre conformité nLPD. Sans action rapide, vous vous exposez à des sanctions pouvant atteindre CHF 250'000, ainsi qu'à des risques majeurs pour vos données et votre réputation.`;
  }
};

const scoreConfig = {
  green: {
    color: 'success',
    icon: CheckCircle,
    title: 'Bonne conformité',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    textColor: 'text-success',
  },
  orange: {
    color: 'warning',
    icon: AlertTriangle,
    title: 'Vigilance requise',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    textColor: 'text-warning',
  },
  red: {
    color: 'danger',
    icon: XCircle,
    title: 'Attention requise',
    bgColor: 'bg-danger/10',
    borderColor: 'border-danger/30',
    textColor: 'text-danger',
  },
};

export const ResultsPreview = ({ score, teaser, onRequestReport, firstName = '' }) => {
  const config = scoreConfig[score.riskLevel] || scoreConfig.orange;
  const ScoreIcon = config.icon;

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
              Votre analyse est prête !
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Voici un aperçu de votre diagnostic nLPD
            </p>
          </div>

          {/* Score Gauge - plus petit sur mobile */}
          <div className="mb-4 sm:mb-6 flex justify-center">
            <ScoreGauge score={score.normalized * 10} size={180} animated={true} />
          </div>

          {/* Risk Level Card - compact */}
          <Card className={cn(
            "border-2 mb-4 sm:mb-6",
            config.borderColor,
            config.bgColor
          )}>
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  config.bgColor
                )}>
                  <ScoreIcon className={cn("w-4 h-4 sm:w-5 sm:h-5", config.textColor)} />
                </div>
                <div className="min-w-0">
                  <h3 className={cn("text-sm sm:text-base font-semibold mb-1", config.textColor)}>
                    {config.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-foreground/80">
                    {getScoreMessage(score, firstName)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teaser Card - compact */}
          <Card className="border-2 border-primary/20 bg-primary/5 mb-4 sm:mb-6">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-primary mb-1 sm:mb-2">
                    Aperçu de vos priorités
                  </h3>
                  <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                    {teaser || "Votre diagnostic révèle plusieurs points d'attention. La bonne nouvelle : des solutions existent pour sécuriser votre conformité nLPD."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Report Card - compact */}
          <Card className="border-2 border-border bg-card mb-4 sm:mb-8">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">
                    Obtenez votre rapport complet par email
                  </h3>
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3 ml-0 sm:ml-14">
                {[
                  { icon: FileText, text: "Diagnostic complet de votre conformité nLPD" },
                  { icon: Target, text: "Recommandations personnalisées et plan d'action" },
                  { icon: Users, text: "Conseils d'experts adaptés à votre secteur" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-2 sm:gap-3"
                  >
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-foreground/80">{item.text}</span>
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
              className="w-full max-w-full group text-xs sm:text-base px-3 sm:px-6 min-w-0"
            >
              <span className="truncate">Recevoir mon rapport complet gratuit</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsPreview;
