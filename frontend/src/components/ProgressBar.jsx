import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { sections } from '@/data/questionsData';
import { cn } from '@/lib/utils';
import { 
  Lock, 
  Shield, 
  Link, 
  Users, 
  AlertTriangle,
  Check
} from 'lucide-react';

const iconMap = {
  Lock,
  Shield,
  Link,
  Users,
  AlertTriangle,
};

export const ProgressBar = ({ currentQuestion, totalQuestions, answers }) => {
  const progress = (currentQuestion / totalQuestions) * 100;
  
  // Calculate section progress
  const getSectionProgress = (sectionId) => {
    const sectionQuestions = Array.from({ length: totalQuestions }, (_, i) => i + 1)
      .filter((_, index) => {
        if (sectionId === 'access') return index < 3;
        if (sectionId === 'protection') return index >= 3 && index < 6;
        if (sectionId === 'subcontractors') return index >= 6 && index < 8;
        if (sectionId === 'rights') return index >= 8 && index < 11;
        if (sectionId === 'incidents') return index >= 11;
        return false;
      });
    
    const answeredInSection = sectionQuestions.filter(
      (_, index) => answers[`q${sectionQuestions[index]}`]
    ).length;
    
    return {
      total: sectionQuestions.length,
      answered: answeredInSection,
      isComplete: answeredInSection === sectionQuestions.length,
      isCurrent: currentQuestion > 0 && 
        currentQuestion <= (sectionId === 'access' ? 3 : 
          sectionId === 'protection' ? 6 : 
          sectionId === 'subcontractors' ? 8 : 
          sectionId === 'rights' ? 11 : 15) &&
        currentQuestion > (sectionId === 'access' ? 0 : 
          sectionId === 'protection' ? 3 : 
          sectionId === 'subcontractors' ? 6 : 
          sectionId === 'rights' ? 8 : 11),
    };
  };

  return (
    <div className="w-full bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-4">
        {/* Main progress bar - plus compacte sur mobile */}
        <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
          <div className="flex-1 min-w-0">
            <Progress value={progress} className="h-1.5 sm:h-2" />
          </div>
          <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap shrink-0">
            {currentQuestion}/{totalQuestions}
          </span>
        </div>

        {/* Section indicators - plus compacts */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-2 scrollbar-hide">
          {sections.map((section, index) => {
            const sectionProgress = getSectionProgress(section.id);
            const IconComponent = iconMap[section.icon] || Shield;
            
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors min-w-fit",
                  sectionProgress.isCurrent && "bg-primary/10 border border-primary/20",
                  sectionProgress.isComplete && "bg-success/10 border border-success/20",
                  !sectionProgress.isCurrent && !sectionProgress.isComplete && "bg-muted/50"
                )}
              >
                <div className={cn(
                  "w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0",
                  sectionProgress.isComplete && "bg-success text-success-foreground",
                  sectionProgress.isCurrent && !sectionProgress.isComplete && "bg-primary text-primary-foreground",
                  !sectionProgress.isCurrent && !sectionProgress.isComplete && "bg-muted text-muted-foreground"
                )}>
                  {sectionProgress.isComplete ? (
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className={cn(
                    "text-xs font-medium",
                    sectionProgress.isCurrent && "text-primary",
                    sectionProgress.isComplete && "text-success",
                    !sectionProgress.isCurrent && !sectionProgress.isComplete && "text-muted-foreground"
                  )}>
                    {section.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sectionProgress.answered}/{sectionProgress.total}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
