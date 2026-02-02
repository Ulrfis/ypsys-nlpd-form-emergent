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
    <div className="min-h-screen bg-gradient-hero py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-6"
            >
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Votre analyse est prête !
            </h1>
            <p className="text-muted-foreground">
              Voici un aperçu de votre diagnostic nLPD
            </p>
          </div>

          {/* Score Gauge */}
          <div className="mb-6">
            <ScoreGauge score={score.normalized * 10} size={220} animated={true} />
          </div>

          {/* Risk Level Card */}
          <Card className={cn(
            "border-2 mb-6",
            config.borderColor,
            config.bgColor
          )}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  config.bgColor
                )}>
                  <ScoreIcon className={cn("w-5 h-5", config.textColor)} />
                </div>
                <div>
                  <h3 className={cn("font-semibold mb-1", config.textColor)}>
                    {config.title}
                  </h3>
                  <p className="text-sm text-foreground/80">
                    {getScoreMessage(score, firstName)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teaser Card - AI Generated */}
          <Card className="border-2 border-primary/20 bg-primary/5 mb-6">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-2">
                    Aperçu de vos priorités
                  </h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {teaser || "Votre diagnostic révèle plusieurs points d'attention. La bonne nouvelle : des solutions existent pour sécuriser votre conformité nLPD."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Report Card */}
          <Card className="border-2 border-border bg-card mb-8">
            <CardContent className="p-5">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Obtenez votre rapport complet par email
                  </h3>
                </div>
              </div>
              
              <div className="space-y-3 ml-14">
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
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="text-sm text-foreground/80">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              variant="premium"
              size="xl"
              onClick={onRequestReport}
              className="w-full group"
            >
              Recevoir mon rapport complet gratuit
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsPreview;
