import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft,
  Send,
  Lock,
  FileSearch,
  Smartphone,
  Laptop,
  HardDrive,
  FileText,
  Link,
  Globe,
  Pen,
  Clock,
  Archive,
  AlertTriangle,
  GraduationCap,
  UserCheck,
  Filter,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

const iconMap = {
  Lock,
  FileSearch,
  Smartphone,
  Laptop,
  HardDrive,
  FileText,
  Link,
  Globe,
  Pen,
  Clock,
  Archive,
  AlertTriangle,
  GraduationCap,
  UserCheck,
  Filter,
};

const feedbackIcons = {
  success: CheckCircle,
  warning: AlertCircle,
  danger: XCircle,
};

export const QuestionCard = ({ 
  question, 
  section,
  selectedAnswer, 
  onAnswer, 
  onNext, 
  onPrevious,
  onSubmit,
  isFirst,
  isLast,
  hideNav = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const IconComponent = iconMap[question.icon] || HelpCircle;
  
  const selectedOption = selectedAnswer 
    ? question.options.find(opt => opt.value === selectedAnswer)
    : null;

  // Valider avec Entrée une fois une réponse sélectionnée (pas dans un champ de saisie)
  const handleKeyDown = useCallback((e) => {
    if (e.key !== 'Enter' || !selectedAnswer) return;
    const target = e.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
    e.preventDefault();
    if (isLast) onSubmit();
    else onNext();
  }, [selectedAnswer, isLast, onSubmit, onNext]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto w-full min-w-0"
    >
      {/* Question Card - plus de capsule chapitre (déjà dans la barre de progression) */}
      <Card className="border-2 border-border shadow-elegant overflow-hidden">
        <CardContent className="p-4 sm:p-6 md:p-8">
          {/* Question Header - compact sur mobile */}
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <IconComponent className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-xl md:text-2xl font-semibold text-foreground mb-1 sm:mb-2 leading-tight">
                {question.question}
              </h2>
              
              {/* Tooltip Trigger */}
              <TooltipProvider delayDuration={0}>
                <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
                  <TooltipTrigger asChild>
                    <button 
                      className="inline-flex items-center gap-1 text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors"
                      onClick={() => setShowTooltip(!showTooltip)}
                    >
                      <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Pourquoi c&apos;est important?
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="bottom" 
                    align="start"
                    className="max-w-md p-4 bg-popover text-popover-foreground border border-border shadow-lg"
                  >
                    <div className="space-y-3">
                      <p className="font-medium text-foreground">{question.tooltip.title}</p>
                      <p className="text-sm text-muted-foreground">{question.tooltip.content}</p>
                      {question.tooltip.risk && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20">
                          <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-danger">{question.tooltip.risk}</p>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Warning Example - compact sur mobile */}
          {question.warningExample && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-warning/10 border border-warning/30">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-foreground/80">
                  {question.warningExample}
                </p>
              </div>
            </div>
          )}

          {/* Answer Options - compact sur mobile */}
          <div className="space-y-2 sm:space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === option.value;
              const FeedbackIcon = feedbackIcons[option.feedback.type];
              
              return (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onAnswer(option.value)}
                  className={cn(
                    "w-full p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-200",
                    "hover:border-primary/50 hover:bg-primary/5",
                    isSelected && option.feedback.type === 'success' && "border-success bg-success/5",
                    isSelected && option.feedback.type === 'warning' && "border-warning bg-warning/5",
                    isSelected && option.feedback.type === 'danger' && "border-danger bg-danger/5",
                    !isSelected && "border-border bg-card"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                      isSelected && option.feedback.type === 'success' && "border-success bg-success",
                      isSelected && option.feedback.type === 'warning' && "border-warning bg-warning",
                      isSelected && option.feedback.type === 'danger' && "border-danger bg-danger",
                      !isSelected && "border-muted-foreground"
                    )}>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-card"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm sm:text-base font-medium",
                        isSelected ? "text-foreground" : "text-foreground/80"
                      )}>
                        {option.label}
                      </p>
                      
                      {/* Show feedback when selected */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border/50"
                          >
                            <div className={cn(
                              "flex items-center gap-2 text-xs sm:text-sm font-medium mb-1 sm:mb-2",
                              option.feedback.type === 'success' && "text-success",
                              option.feedback.type === 'warning' && "text-warning",
                              option.feedback.type === 'danger' && "text-danger"
                            )}>
                              <FeedbackIcon className="w-4 h-4" />
                              {option.feedback.message}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {option.explanation}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons - masqués si rendus en barre sticky (FormFlow) */}
      {!hideNav && (
        <div className="flex items-center justify-between gap-2 mt-4 sm:mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevious}
            disabled={isFirst}
            className="gap-1.5 text-xs sm:text-sm shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Précédent
          </Button>
          
          {isLast ? (
            <Button
              variant="premium"
              size="sm"
              onClick={onSubmit}
              disabled={!selectedAnswer}
              className="gap-1.5 text-xs sm:text-sm min-w-0 px-2 sm:px-4"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Envoyer les réponses</span>
            </Button>
          ) : (
            <Button
              variant={selectedAnswer ? "premium" : "outline"}
              size="sm"
              onClick={onNext}
              disabled={!selectedAnswer}
              className="gap-1.5 text-xs sm:text-sm min-w-0 px-2 sm:px-4"
            >
              <span className="truncate">Suivant</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default QuestionCard;
