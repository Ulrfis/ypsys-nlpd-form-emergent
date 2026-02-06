import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { questions, sections, calculateScore, getTopPriorities } from '@/data/questionsData';
import { LandingPage } from '@/components/LandingPage';
import { ProgressBar } from '@/components/ProgressBar';
import { QuestionCard } from '@/components/QuestionCard';
import { Button } from '@/components/ui/button';
import { AnalysisLoadingScreen } from '@/components/AnalysisLoadingScreen';
import { ResultsPreview } from '@/components/ResultsPreview';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { ThankYouPage } from '@/components/ThankYouPage';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DebugPanel } from '@/components/DebugPanel';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { generateAnalysis, setOpenAIDebugContext } from '@/lib/openai';
import { saveSubmission, setDebugContext } from '@/lib/supabase';
import { BOOKING_CALENDAR_URL } from '@/lib/booking';
import { useDebugContext } from '@/context/DebugContext';

// Steps in the form flow
const STEPS = {
  LANDING: 'landing',
  QUESTIONS: 'questions',
  ANALYZING: 'analyzing',
  RESULTS_PREVIEW: 'results_preview',
  LEAD_CAPTURE: 'lead_capture',
  THANK_YOU: 'thank_you',
};

export const FormFlow = () => {
  const debugContext = useDebugContext();
  const { toggleDebugMode, setDebugMode } = debugContext;
  const [currentStep, setCurrentStep] = useState(STEPS.LANDING);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [userData, setUserData] = useState(null);
  const [score, setScore] = useState(null);
  const [priorities, setPriorities] = useState([]);
  const [teaser, setTeaser] = useState('');
  const [openaiResponse, setOpenaiResponse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('creating_thread');
  const [analysisMessage, setAnalysisMessage] = useState('');

  // Initialize debug context for supabase and openai modules
  useEffect(() => {
    setDebugContext(debugContext);
    setOpenAIDebugContext(debugContext);
  }, [debugContext]);

  // Activate debug mode if ?debug=true is in URL (set explicitly so panel opens)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const debugParam = urlParams.get('debug');
    if (debugParam === 'true') {
      setDebugMode(true);
    }
  }, [setDebugMode]);

  // Start the questionnaire
  const handleStart = useCallback(() => {
    setCurrentStep(STEPS.QUESTIONS);
    setCurrentQuestionIndex(0);
  }, []);

  // Handle answer selection
  const handleAnswer = useCallback((questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  }, []);

  // Navigate to next question
  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex]);

  // Navigate to previous question
  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      // Go back to landing
      setCurrentStep(STEPS.LANDING);
    }
  }, [currentQuestionIndex]);

  // Build the answer texts for OpenAI (flat dict q1 -> label)
  const buildAnswerTexts = useCallback(() => {
    const answerTexts = {};
    questions.forEach(question => {
      const selectedValue = answers[question.id];
      if (selectedValue) {
        const selectedOption = question.options.find(opt => opt.value === selectedValue);
        answerTexts[question.id] = selectedOption ? selectedOption.label : selectedValue;
      }
    });
    return answerTexts;
  }, [answers]);

  // Build detailed answers (question + answer) so the assistant has full context for analysis
  const buildAnswersDetailed = useCallback(() => {
    return questions
      .filter(q => answers[q.id])
      .map(question => {
        const selectedValue = answers[question.id];
        const selectedOption = question.options.find(opt => opt.value === selectedValue);
        const answerLabel = selectedOption ? selectedOption.label : selectedValue;
        return {
          question_id: question.id,
          question: question.question,
          answer: answerLabel,
        };
      });
  }, [answers]);

  // Submit answers and run OpenAI analysis
  const handleSubmitAnswers = useCallback(async () => {
    setCurrentStep(STEPS.ANALYZING);
    setAnalysisStatus('creating_thread');
    setAnalysisMessage('');

    // Calculate score
    const calculatedScore = calculateScore(answers);
    const topPriorities = getTopPriorities(answers);
    
    setScore(calculatedScore);
    setPriorities(topPriorities);

    // Build payload for OpenAI: all answers + detailed (question + answer) so the assistant can analyze in detail
    const payload = {
      user: {
        first_name: 'Utilisateur',
        last_name: '',
        email: null,
        company: 'Votre organisation',
        size: null,
        industry: null,
        canton: null,
      },
      answers: buildAnswerTexts(),
      answers_detailed: buildAnswersDetailed(),
      score: {
        value: calculatedScore.raw,
        normalized: calculatedScore.normalized,
        level: calculatedScore.riskLevel,
      },
      has_email: false,
    };

    try {
      // Status update callback
      const onStatusUpdate = (status, message) => {
        setAnalysisStatus(status);
        setAnalysisMessage(message);
      };

      // Call OpenAI Assistant
      const response = await generateAnalysis(payload, onStatusUpdate);
      
      // Store response and teaser
      setOpenaiResponse(response);
      setTeaser(response.teaser);

      // Small delay to show completion state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Go to results preview
      setCurrentStep(STEPS.RESULTS_PREVIEW);
    } catch (error) {
      console.error('Error during analysis:', error);
      
      // Fallback teaser
      const fallbackTeaser = `Votre score de conformité est de ${calculatedScore.normalized}/10. ${
        calculatedScore.riskLevel === 'green' 
          ? 'Votre organisation maîtrise les bases de la nLPD.' 
          : calculatedScore.riskLevel === 'orange'
          ? 'Des lacunes ont été identifiées dans votre conformité nLPD.'
          : 'Des failles critiques nécessitent une action immédiate.'
      } Recevez votre rapport complet pour découvrir vos priorités d'action.`;
      
      setTeaser(fallbackTeaser);
      setOpenaiResponse({ teaser: fallbackTeaser, lead_temperature: 'WARM' });
      setAnalysisStatus('complete');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentStep(STEPS.RESULTS_PREVIEW);
    }
  }, [answers, buildAnswerTexts, buildAnswersDetailed]);

  // Request full report (go to lead capture)
  const handleRequestReport = useCallback(() => {
    setCurrentStep(STEPS.LEAD_CAPTURE);
  }, []);

  // Submit lead capture form
  const handleSubmitLead = useCallback(async (formData) => {
    setIsSubmitting(true);
    setUserData(formData);

    // Build complete payload with user data (answers_detailed not needed for Supabase but kept for consistency)
    const payload = {
      user: {
        first_name: formData.firstName,
        last_name: formData.lastName || '',
        email: formData.email,
        company: formData.companyName || 'Non renseigné',
        size: formData.companySize || null,
        industry: formData.industry || null,
        canton: formData.canton || null,
      },
      answers: buildAnswerTexts(),
      answers_detailed: buildAnswersDetailed(),
      score: {
        value: score.raw,
        normalized: score.normalized,
        level: score.riskLevel,
      },
      has_email: true,
    };

    try {
      // Save to Supabase with the previously generated OpenAI response
      await saveSubmission(payload, openaiResponse);
      console.log('Submission saved to Supabase');
      
      setCurrentStep(STEPS.THANK_YOU);
    } catch (error) {
      console.error('Error saving submission:', error);
      // Still go to thank you page even if save fails
      setCurrentStep(STEPS.THANK_YOU);
    } finally {
      setIsSubmitting(false);
    }
  }, [buildAnswerTexts, buildAnswersDetailed, score, openaiResponse]);

  // Book consultation (Outlook Book With Me)
  const handleBookConsultation = useCallback(() => {
    window.open(BOOKING_CALENDAR_URL, '_blank');
  }, []);

  // Get current question and section
  const currentQuestion = questions[currentQuestionIndex];
  const currentSection = currentQuestion 
    ? sections.find(s => s.id === currentQuestion.sectionId) 
    : null;

  return (
    <div className="min-h-screen bg-background">
      <ThemeToggle />
      
      <AnimatePresence mode="wait">
        {currentStep === STEPS.LANDING && (
          <LandingPage key="landing" onStart={handleStart} />
        )}

        {currentStep === STEPS.QUESTIONS && currentQuestion && (
          <div key="questions" className="h-screen flex flex-col w-full max-w-[100vw] overflow-x-hidden">
            <ProgressBar 
              currentQuestion={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              answers={answers}
            />
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
              <div className="container mx-auto px-4 py-4 sm:py-8">
                <QuestionCard
                  question={currentQuestion}
                  section={currentSection}
                  selectedAnswer={answers[currentQuestion.id]}
                  onAnswer={(value) => handleAnswer(currentQuestion.id, value)}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  onSubmit={handleSubmitAnswers}
                  isFirst={currentQuestionIndex === 0}
                  isLast={currentQuestionIndex === questions.length - 1}
                  hideNav
                />
              </div>
            </div>
            {/* Barre de navigation fixe en bas (comme une barre de menu) */}
            <div className="flex-shrink-0 border-t border-border bg-card/95 backdrop-blur-sm sticky bottom-0 safe-area-bottom" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
              <div className="container mx-auto px-4 py-3 max-w-3xl">
                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="gap-1.5 text-xs sm:text-sm shrink-0"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Précédent
                  </Button>
                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button
                      variant="premium"
                      size="sm"
                      onClick={handleSubmitAnswers}
                      disabled={!answers[currentQuestion.id]}
                      className="gap-1.5 text-xs sm:text-sm min-w-0 px-2 sm:px-4"
                    >
                      <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span className="truncate">Envoyer les réponses</span>
                    </Button>
                  ) : (
                    <Button
                      variant={answers[currentQuestion.id] ? "premium" : "outline"}
                      size="sm"
                      onClick={handleNext}
                      disabled={!answers[currentQuestion.id]}
                      className="gap-1.5 text-xs sm:text-sm min-w-0 px-2 sm:px-4"
                    >
                      <span className="truncate">Suivant</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === STEPS.ANALYZING && (
          <AnalysisLoadingScreen 
            key="analyzing"
            currentStatus={analysisStatus}
            statusMessage={analysisMessage}
          />
        )}

        {currentStep === STEPS.RESULTS_PREVIEW && score && (
          <ResultsPreview
            key="results-preview"
            score={score}
            teaser={teaser}
            onRequestReport={handleRequestReport}
          />
        )}

        {currentStep === STEPS.LEAD_CAPTURE && (
          <div key="lead-capture" className="min-h-screen bg-gradient-hero py-4 sm:py-12 w-full max-w-[100vw] overflow-x-hidden">
            <div className="container mx-auto px-4 max-w-[100vw]">
              <LeadCaptureForm 
                onSubmit={handleSubmitLead}
                isLoading={isSubmitting}
                score={score}
              />
            </div>
          </div>
        )}

        {currentStep === STEPS.THANK_YOU && score && (
          <ThankYouPage
            key="thank-you"
            score={score}
            priorities={priorities}
            teaser={teaser}
            userEmail={userData?.email}
            onBookConsultation={handleBookConsultation}
          />
        )}
      </AnimatePresence>

      {/* Debug Panel */}
      <DebugPanel />
    </div>
  );
};

export default FormFlow;
