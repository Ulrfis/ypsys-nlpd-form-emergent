import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
    title: 'Attention requise',
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

export const ResultsPreview = ({ score, teaser, onRequestReport }) => {
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

          {/* Score Card */}
          <Card className="border-2 border-border shadow-md mb-6">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2 text-center">
                Votre score de conformité
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-foreground">
                  {score.normalized}
                </span>
                <span className="text-2xl text-muted-foreground">/10</span>
              </div>
            </CardContent>
          </Card>

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
                    {score.riskLevel === 'green' 
                      ? "Votre conformité est globalement bonne. Quelques ajustements pourraient la renforcer."
                      : "Plusieurs points critiques nécessitent une action immédiate."}
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
