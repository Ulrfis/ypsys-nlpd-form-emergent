import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Brain, Database, Mail, CheckCircle, Loader2 } from 'lucide-react';

const steps = [
  {
    id: 'creating_thread',
    icon: Brain,
    title: 'Connexion au conseiller IA',
    description: 'Établissement de la connexion sécurisée...',
  },
  {
    id: 'sending_data',
    icon: Database,
    title: 'Transmission des données',
    description: 'Envoi de vos réponses pour analyse...',
  },
  {
    id: 'analyzing',
    icon: Shield,
    title: 'Analyse en cours',
    description: 'Évaluation de votre conformité nLPD...',
  },
  {
    id: 'generating',
    icon: Mail,
    title: 'Génération des recommandations',
    description: 'Préparation de votre rapport personnalisé...',
  },
  {
    id: 'complete',
    icon: CheckCircle,
    title: 'Analyse terminée',
    description: 'Vos résultats sont prêts!',
  },
];

export const AnalysisLoadingScreen = ({ currentStatus, statusMessage }) => {
  const [visibleSteps, setVisibleSteps] = useState([]);
  
  // Find current step index
  const currentStepIndex = steps.findIndex(s => s.id === currentStatus);
  
  useEffect(() => {
    // Show steps progressively
    const newVisibleSteps = steps.slice(0, currentStepIndex + 1).map(s => s.id);
    setVisibleSteps(newVisibleSteps);
  }, [currentStepIndex]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-2xl border-2 border-primary/20 border-t-primary"
              />
              <Brain className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Analyse de vos réponses
            </h1>
            <p className="text-muted-foreground">
              Notre conseiller IA analyse votre situation pour générer des recommandations personnalisées.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {steps.map((step, index) => {
                const isVisible = visibleSteps.includes(step.id);
                const isCurrent = step.id === currentStatus;
                const isComplete = currentStepIndex > index;
                const StepIcon = step.icon;

                if (!isVisible) return null;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border-2 transition-all
                      ${isCurrent ? 'bg-primary/5 border-primary/30' : ''}
                      ${isComplete ? 'bg-success/5 border-success/30' : ''}
                      ${!isCurrent && !isComplete ? 'bg-card border-border' : ''}
                    `}
                  >
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                      ${isCurrent ? 'bg-primary/10' : ''}
                      ${isComplete ? 'bg-success/10' : ''}
                      ${!isCurrent && !isComplete ? 'bg-muted' : ''}
                    `}>
                      {isCurrent ? (
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      ) : isComplete ? (
                        <CheckCircle className="w-6 h-6 text-success" />
                      ) : (
                        <StepIcon className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`
                        font-medium
                        ${isCurrent ? 'text-primary' : ''}
                        ${isComplete ? 'text-success' : ''}
                        ${!isCurrent && !isComplete ? 'text-foreground' : ''}
                      `}>
                        {step.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isCurrent && statusMessage ? statusMessage : step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Estimated time */}
          {currentStatus !== 'complete' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center text-sm text-muted-foreground mt-8"
            >
              Temps estimé: 10-15 secondes
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AnalysisLoadingScreen;
