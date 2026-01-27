import React, { useState } from 'react';
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
  isFirst,
  isLast 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const IconComponent = iconMap[question.icon] || HelpCircle;
  
  const selectedOption = selectedAnswer 
    ? question.options.find(opt => opt.value === selectedAnswer)
    : null;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto"
    >
      {/* Section Header */}
      <div className="mb-6">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
          {section?.title}
        </span>
      </div>

      {/* Question Card */}
      <Card className="border-2 border-border shadow-elegant overflow-hidden">
        <CardContent className="p-6 md:p-8">
          {/* Question Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <IconComponent className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2 leading-tight">
                {question.question}
              </h2>
              
              {/* Tooltip Trigger */}
              <TooltipProvider delayDuration={0}>
                <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
                  <TooltipTrigger asChild>
                    <button 
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
                      onClick={() => setShowTooltip(!showTooltip)}
                    >
                      <HelpCircle className="w-4 h-4" />
                      Pourquoi c'est important?
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

          {/* Warning Example */}
          {question.warningExample && (
            <div className="mb-6 p-4 rounded-lg bg-warning/5 border border-warning/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-sm text-warning-foreground dark:text-warning">
                  {question.warningExample}
                </p>
              </div>
            </div>
          )}

          {/* Answer Options */}
          <div className="space-y-3">
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
                    "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
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
                    <div className="flex-1">
                      <p className={cn(
                        "font-medium",
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
                            className="mt-3 pt-3 border-t border-border/50"
                          >
                            <div className={cn(
                              "flex items-center gap-2 text-sm font-medium mb-2",
                              option.feedback.type === 'success' && "text-success",
                              option.feedback.type === 'warning' && "text-warning",
                              option.feedback.type === 'danger' && "text-danger"
                            )}>
                              <FeedbackIcon className="w-4 h-4" />
                              {option.feedback.message}
                            </div>
                            <p className="text-sm text-muted-foreground">
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

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="ghost"
          onClick={onPrevious}
          disabled={isFirst}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Précédent
        </Button>
        
        <Button
          variant={selectedAnswer ? "premium" : "outline"}
          onClick={onNext}
          disabled={!selectedAnswer}
          className="gap-2"
        >
          {isLast ? 'Terminer' : 'Suivant'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default QuestionCard;
