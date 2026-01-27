import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Database, LineChart, ShieldCheck, Sparkles, Check, Loader2 } from 'lucide-react';

const steps = [
  {
    id: 'sending',
    icon: Database,
    title: 'Analyse de vos réponses...',
    description: 'Envoi des données pour analyse',
    color: 'bg-success/10 text-success border-success/20',
    iconBg: 'bg-success/20',
  },
  {
    id: 'scoring',
    icon: LineChart,
    title: 'Calcul du score de conformité...',
    description: 'Évaluation de votre niveau de conformité',
    color: 'bg-success/10 text-success border-success/20',
    iconBg: 'bg-success/20',
  },
  {
    id: 'risk',
    icon: ShieldCheck,
    title: 'Évaluation des risques...',
    description: 'Identification des points critiques',
    color: 'bg-success/10 text-success border-success/20',
    iconBg: 'bg-success/20',
  },
  {
    id: 'generating',
    icon: Sparkles,
    title: 'Génération des recommandations...',
    description: 'Préparation de votre diagnostic personnalisé',
    color: 'bg-primary/10 text-primary border-primary/20',
    iconBg: 'bg-primary/20',
  },
];

export const AnalysisLoadingScreen = ({ currentStatus, statusMessage }) => {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  
  // Map external status to internal steps
  useEffect(() => {
    const statusToStep = {
      'creating_thread': 0,
      'sending_data': 0,
      'analyzing': 1,
      'generating': 3,
      'complete': 4,
      'error': 4,
    };
    
    const stepIndex = statusToStep[currentStatus] ?? 0;
    
    // Mark steps as completed
    const newCompleted = [];
    for (let i = 0; i < stepIndex; i++) {
      newCompleted.push(steps[i]?.id);
    }
    setCompletedSteps(newCompleted);
    setActiveStep(Math.min(stepIndex, steps.length - 1));
  }, [currentStatus]);

  // Auto-progress animation for visual effect
  useEffect(() => {
    if (currentStatus === 'analyzing') {
      const timer1 = setTimeout(() => {
        setCompletedSteps(prev => [...prev, 'sending']);
        setActiveStep(1);
      }, 1500);
      
      const timer2 = setTimeout(() => {
        setCompletedSteps(prev => [...prev, 'scoring']);
        setActiveStep(2);
      }, 3000);
      
      const timer3 = setTimeout(() => {
        setCompletedSteps(prev => [...prev, 'risk']);
        setActiveStep(3);
      }, 4500);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [currentStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >
          {/* Header with Shield Icon */}
          <div className="text-center mb-10">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 relative">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute inset-0 rounded-full bg-primary/20"
              />
              <Shield className="w-12 h-12 text-primary relative z-10" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Analyse en cours
            </h1>
            <p className="text-muted-foreground">
              Nous analysons vos réponses pour établir votre diagnostic nLPD
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {steps.map((step, index) => {
                const isCompleted = completedSteps.includes(step.id);
                const isActive = activeStep === index && !isCompleted;
                const StepIcon = step.icon;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15, duration: 0.3 }}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300
                      ${isCompleted ? 'bg-success/5 border-success/30' : ''}
                      ${isActive ? step.color + ' border-2' : ''}
                      ${!isCompleted && !isActive ? 'bg-muted/30 border-muted/50 opacity-60' : ''}
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                      ${isCompleted ? 'bg-success/20' : ''}
                      ${isActive ? step.iconBg : ''}
                      ${!isCompleted && !isActive ? 'bg-muted/50' : ''}
                    `}>
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-success" />
                      ) : isActive ? (
                        <Loader2 className="w-5 h-5 animate-spin text-current" />
                      ) : (
                        <StepIcon className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`
                        font-medium truncate
                        ${isCompleted ? 'text-success' : ''}
                        ${isActive ? 'text-foreground' : ''}
                        ${!isCompleted && !isActive ? 'text-muted-foreground' : ''}
                      `}>
                        {step.title}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-primary"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalysisLoadingScreen;
