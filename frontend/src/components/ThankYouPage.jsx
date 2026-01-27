import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Mail, 
  Calendar,
  ArrowRight,
  Shield,
  TrendingUp,
  FileText
} from 'lucide-react';

const scoreConfig = {
  green: {
    color: 'success',
    icon: CheckCircle,
    title: 'En bonne position',
    description: 'Votre organisation maîtrise les bases de la conformité nLPD.',
  },
  orange: {
    color: 'warning',
    icon: AlertTriangle,
    title: 'Gaps significatifs',
    description: 'Des actions prioritaires sont nécessaires pour sécuriser votre conformité.',
  },
  red: {
    color: 'danger',
    icon: XCircle,
    title: 'Risque critique',
    description: 'Un audit PFPDT révélerait des failles importantes. Action urgente requise.',
  },
};

export const ThankYouPage = ({ score, priorities, teaser, userEmail, onBookConsultation }) => {
  const config = scoreConfig[score.riskLevel];
  const ScoreIcon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-hero py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-elegant">
                <Shield className="w-7 h-7 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">Ypsys</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Votre diagnostic nLPD
            </h1>
            <p className="text-muted-foreground">
              Merci d'avoir complété l'évaluation. Voici vos résultats.
            </p>
          </div>

          {/* Score Card */}
          <Card className={cn(
            "border-2 shadow-elegant mb-8",
            config.color === 'success' && "border-success/30 bg-success/5",
            config.color === 'warning' && "border-warning/30 bg-warning/5",
            config.color === 'danger' && "border-danger/30 bg-danger/5"
          )}>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Score Display */}
                <div className="flex-shrink-0">
                  <div className={cn(
                    "w-32 h-32 rounded-full flex items-center justify-center relative",
                    config.color === 'success' && "bg-success/10",
                    config.color === 'warning' && "bg-warning/10",
                    config.color === 'danger' && "bg-danger/10"
                  )}>
                    <div className={cn(
                      "absolute inset-2 rounded-full border-4",
                      config.color === 'success' && "border-success",
                      config.color === 'warning' && "border-warning",
                      config.color === 'danger' && "border-danger"
                    )} />
                    <div className="text-center">
                      <span className={cn(
                        "text-4xl font-bold",
                        config.color === 'success' && "text-success",
                        config.color === 'warning' && "text-warning",
                        config.color === 'danger' && "text-danger"
                      )}>
                        {score.normalized}
                      </span>
                      <span className="text-lg text-muted-foreground">/10</span>
                    </div>
                  </div>
                </div>

                {/* Score Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-3",
                    config.color === 'success' && "bg-success/10 text-success",
                    config.color === 'warning' && "bg-warning/10 text-warning",
                    config.color === 'danger' && "bg-danger/10 text-danger"
                  )}>
                    <ScoreIcon className="w-4 h-4" />
                    {config.title}
                  </div>
                  <p className="text-foreground/80">
                    {config.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teaser / AI Summary */}
          {teaser && (
            <Card className="border-2 border-border shadow-md mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Analyse personnalisée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/90 leading-relaxed">{teaser}</p>
              </CardContent>
            </Card>
          )}

          {/* Top 3 Priorities */}
          {priorities && priorities.length > 0 && (
            <Card className="border-2 border-border shadow-md mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Vos 3 priorités
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {priorities.map((priority, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-lg border",
                        priority.feedback.type === 'danger' && "bg-danger/5 border-danger/20",
                        priority.feedback.type === 'warning' && "bg-warning/5 border-warning/20"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold",
                        priority.feedback.type === 'danger' && "bg-danger/10 text-danger",
                        priority.feedback.type === 'warning' && "bg-warning/10 text-warning"
                      )}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground mb-1">
                          {priority.question}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Section: {priority.section}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email Confirmation */}
          <Card className="border-2 border-primary/20 bg-primary/5 mb-8">
            <CardContent className="p-6">
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

          {/* CTA */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Besoin d'aide pour mettre en place les actions?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Nos experts peuvent vous accompagner dans la mise en conformité nLPD 
              et la sécurisation de vos données.
            </p>
            <Button 
              variant="premium" 
              size="xl" 
              onClick={onBookConsultation}
              className="group"
            >
              <Calendar className="w-5 h-5" />
              Réserver une consultation gratuite
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              30 minutes • Sans engagement • Experts certifiés
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ThankYouPage;
