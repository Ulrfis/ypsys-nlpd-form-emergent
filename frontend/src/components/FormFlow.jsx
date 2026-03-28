import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { questions, sections, calculateScore, getTopPriorities } from '@/data/questionsData';
import { LandingPage } from '@/components/LandingPage';
import { ProgressBar } from '@/components/ProgressBar';
import { QuestionCard } from '@/components/QuestionCard';
import { Button } from '@/components/ui/button';
import { AnalysisLoadingScreen } from '@/components/AnalysisLoadingScreen';
import { ResultsPreview } from '@/components/ResultsPreview';
import { ThankYouPage } from '@/components/ThankYouPage';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DebugPanel } from '@/components/DebugPanel';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { generateAnalysis, setOpenAIDebugContext } from '@/lib/openai';
import {
  saveSubmission,
  insertFormSubmissionAfterAnalysis,
  finalizeFormSubmissionLead,
  setDebugContext,
} from '@/lib/supabase';
import { BOOKING_CALENDAR_URL } from '@/lib/booking';
import { trackEvent, identifyUser } from '@/lib/analytics';
import { useDebugContext } from '@/context/DebugContext';
import { useConsent } from '@/context/ConsentContext';

// Steps in the form flow
const STEPS = {
  LANDING: 'landing',
  QUESTIONS: 'questions',
  ANALYZING: 'analyzing',
  RESULTS_PREVIEW: 'results_preview',
  RESULTS_FINAL: 'results_final',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONSENT_POLICY_VERSION = '2026-03-28';

export const FormFlow = () => {
  const debugContext = useDebugContext();
  const { toggleDebugMode, setDebugMode } = debugContext;
  const { hasConsentedToAnalytics } = useConsent();
  const [currentStep, setCurrentStep] = useState(STEPS.LANDING);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [userData, setUserData] = useState(null);
  const [score, setScore] = useState(null);
  const [score100, setScore100] = useState(null);
  const [severityBand, setSeverityBand] = useState('vigilance');
  const [priorities, setPriorities] = useState([]);
  const [topIssues, setTopIssues] = useState([]);
  const [teaser, setTeaser] = useState('');
  const [resultSummary, setResultSummary] = useState('');
  const [resultFocusPoints, setResultFocusPoints] = useState([]);
  const [openaiResponse, setOpenaiResponse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('creating_thread');
  const [analysisMessage, setAnalysisMessage] = useState('');
  const [prefilledEmail, setPrefilledEmail] = useState(null);
  /** Supabase row id after post-analysis insert; used to UPDATE on lead submit instead of duplicating rows */
  const [submissionId, setSubmissionId] = useState(null);
  const [submissionSessionId, setSubmissionSessionId] = useState(null);

  useEffect(() => {
    trackEvent('form_step_viewed', {
      step: currentStep,
      current_question_index: currentQuestionIndex + 1,
      answered_count: Object.keys(answers).length,
    });
  }, [currentStep, currentQuestionIndex, answers]);

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

  // Activate prefilled email flow when ?email= is present and valid
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (!emailParam) return;

    const sanitizedEmail = emailParam.trim().replace(/\s/g, '+').toLowerCase();
    if (EMAIL_REGEX.test(sanitizedEmail)) {
      setPrefilledEmail(sanitizedEmail);
      trackEvent('prefill_email_detected', {
        has_prefill_email: true,
      });
    }
  }, []);

  // Start the questionnaire
  const handleStart = useCallback(() => {
    trackEvent('questionnaire_started', {
      total_questions: questions.length,
    });
    setSubmissionId(null);
    setSubmissionSessionId(null);
    setCurrentStep(STEPS.QUESTIONS);
    setCurrentQuestionIndex(0);
  }, []);

  // Handle answer selection
  const handleAnswer = useCallback((questionId, value) => {
    const questionMeta = questions.find((q) => q.id === questionId);
    trackEvent('question_answered', {
      question_id: questionId,
      section_id: questionMeta?.sectionId || null,
      question_number: questionMeta?.number || null,
      selected_value: value,
      answered_count_after: Object.keys({ ...answers, [questionId]: value }).length,
    });
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  }, [answers]);

  // Navigate to next question
  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      trackEvent('question_navigated_next', {
        from_question_index: currentQuestionIndex + 1,
        to_question_index: currentQuestionIndex + 2,
      });
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex]);

  // Navigate to previous question
  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      trackEvent('question_navigated_previous', {
        from_question_index: currentQuestionIndex + 1,
        to_question_index: currentQuestionIndex,
      });
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      // Go back to landing
      trackEvent('questionnaire_back_to_landing');
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
    const localScore100 = Math.round(calculatedScore.normalized * 10);
    trackEvent('questionnaire_submitted_for_analysis', {
      answered_count: Object.keys(answers).length,
      local_score_100: localScore100,
      local_risk_level: calculatedScore.riskLevel,
    });
    
    setScore(calculatedScore);
    setScore100(localScore100);
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
      const normalizedTopIssues = Array.isArray(response.top_issues) && response.top_issues.length
        ? response.top_issues.slice(0, 3).map((item) => String(item))
        : topPriorities.map((p) => p.question).slice(0, 3);
      // Score /100 and severity band come only from questionnaire math (see openai.js / backend); never from the model.
      const resolvedBand =
        localScore100 < 60 ? 'critical' : localScore100 < 90 ? 'vigilance' : 'good';
      setScore100(localScore100);
      setSeverityBand(resolvedBand);
      setTopIssues(normalizedTopIssues);
      setResultSummary(typeof response.result_summary === 'string' ? response.result_summary : '');
      setResultFocusPoints(
        Array.isArray(response.result_focus_points)
          ? response.result_focus_points.slice(0, 4).map((item) => String(item))
          : []
      );
      trackEvent('analysis_completed', {
        assistant_score_100_raw: response.score_100_assistant_raw ?? null,
        resolved_score_100: localScore100,
        severity_band: resolvedBand,
        top_issues_count: normalizedTopIssues.length,
      });

      try {
        const submission = await insertFormSubmissionAfterAnalysis(payload, response);
        setSubmissionId(submission.id);
        setSubmissionSessionId(submission.session_id || null);
        trackEvent('analysis_saved_to_supabase_success', { submission_id: submission.id });
      } catch (supaErr) {
        console.error('Post-analysis Supabase insert failed:', supaErr);
        trackEvent('analysis_saved_to_supabase_failed', {
          error_message: supaErr?.message || 'unknown_error',
        });
      }

      // Small delay to show completion state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Go to results preview
      setCurrentStep(STEPS.RESULTS_PREVIEW);
    } catch (error) {
      console.error('Error during analysis:', error);
      trackEvent('analysis_failed', {
        error_message: error?.message || 'unknown_error',
      });
      
      // Fallback teaser
      const fallbackTeaser = `Votre score de conformité est de ${calculatedScore.normalized}/10. ${
        calculatedScore.riskLevel === 'green' 
          ? 'Votre organisation maîtrise les bases de la nLPD.' 
          : calculatedScore.riskLevel === 'orange'
          ? 'Des lacunes ont été identifiées dans votre conformité nLPD.'
          : 'Des failles critiques nécessitent une action immédiate.'
      } Recevez votre rapport complet pour découvrir vos priorités d'action.`;
      
      const fallbackTopIssues = topPriorities.map((p) => p.question).slice(0, 3);
      const fallbackBand = localScore100 < 60 ? 'critical' : localScore100 < 90 ? 'vigilance' : 'good';
      const fallbackOpenaiResponse = {
        teaser: fallbackTeaser,
        lead_temperature: 'WARM',
        score_100: localScore100,
        severity_band: fallbackBand,
        top_issues: fallbackTopIssues,
        email_user: null,
        email_sales: null,
        result_summary: '',
        result_focus_points: [],
      };

      try {
        const submission = await insertFormSubmissionAfterAnalysis(payload, fallbackOpenaiResponse);
        setSubmissionId(submission.id);
        setSubmissionSessionId(submission.session_id || null);
        trackEvent('analysis_saved_to_supabase_success', { submission_id: submission.id });
      } catch (supaErr) {
        console.error('Post-analysis Supabase insert failed (fallback path):', supaErr);
        trackEvent('analysis_saved_to_supabase_failed', {
          error_message: supaErr?.message || 'unknown_error',
        });
      }

      setTeaser(fallbackTeaser);
      setTopIssues(fallbackTopIssues);
      setSeverityBand(fallbackBand);
      setScore100(localScore100);
      setResultSummary('');
      setResultFocusPoints([]);
      setOpenaiResponse(fallbackOpenaiResponse);
      setAnalysisStatus('complete');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentStep(STEPS.RESULTS_PREVIEW);
    }
  }, [answers, buildAnswerTexts, buildAnswersDetailed]);

  const persistLeadAndShowResults = useCallback(async (formData, source = 'standard_form') => {
    setIsSubmitting(true);
    setUserData(formData);
    if (source === 'prefilled_email') {
      trackEvent('prefilled_report_requested', {
        score_100: score100 ?? null,
        severity_band: severityBand,
      });
    } else {
      trackEvent('lead_form_submitted', {
        has_first_name: Boolean(formData.firstName),
        has_last_name: Boolean(formData.lastName),
        has_company_name: Boolean(formData.companyName),
        has_company_size: Boolean(formData.companySize),
        has_industry: Boolean(formData.industry),
        has_canton: Boolean(formData.canton),
        consent_marketing: Boolean(formData.consentMarketing),
        score_100: score100 ?? null,
        severity_band: severityBand,
      });
    }

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
      consent: {
        marketing: Boolean(formData.consentMarketing),
        analytics: Boolean(hasConsentedToAnalytics),
        policy_version: CONSENT_POLICY_VERSION,
        source,
      },
    };

    try {
      if (hasConsentedToAnalytics) {
        identifyUser(formData.email, {
          company_name: formData.companyName || null,
          company_size: formData.companySize || null,
          industry: formData.industry || null,
          canton: formData.canton || null,
        });
      }
      if (submissionId && submissionSessionId) {
        try {
          await finalizeFormSubmissionLead(submissionId, submissionSessionId, payload, openaiResponse);
          console.log('Submission lead finalized in Supabase');
        } catch (finalizeErr) {
          // If RPC is missing/misconfigured, fallback keeps lead capture operational.
          console.warn('finalizeFormSubmissionLead RPC failed, falling back to saveSubmission:', finalizeErr);
          await saveSubmission(payload, openaiResponse);
          trackEvent('lead_saved_to_supabase_fallback_full_insert', {
            reason: finalizeErr?.message?.slice(0, 200) || 'unknown',
          });
        }
      } else {
        await saveSubmission(payload, openaiResponse);
        console.log('Submission saved to Supabase (full insert, no prior analysis row)');
      }
      trackEvent('lead_saved_to_supabase_success');
      
      setCurrentStep(STEPS.RESULTS_FINAL);
    } catch (error) {
      console.error('Error saving submission:', error);
      trackEvent('lead_saved_to_supabase_failed', {
        error_message: error?.message || 'unknown_error',
      });
      // Still go to thank you page even if save fails
      setCurrentStep(STEPS.RESULTS_FINAL);
    } finally {
      setIsSubmitting(false);
    }
  }, [buildAnswerTexts, buildAnswersDetailed, score, openaiResponse, score100, severityBand, submissionId, submissionSessionId, hasConsentedToAnalytics]);

  // Submit lead capture form
  const handleSubmitLead = useCallback(async (formData) => {
    await persistLeadAndShowResults(formData, 'standard_form');
  }, [persistLeadAndShowResults]);

  const handleSendPrefilledReport = useCallback(async ({ consentMarketing } = {}) => {
    if (!prefilledEmail) return;
    if (!consentMarketing) return;

    const prefilledData = {
      firstName: '',
      lastName: 'Prérempli URL',
      email: prefilledEmail,
      companyName: 'Non renseigné',
      companySize: '',
      industry: '',
      canton: '',
      consentMarketing: Boolean(consentMarketing),
    };

    await persistLeadAndShowResults(prefilledData, 'prefilled_email');
  }, [prefilledEmail, persistLeadAndShowResults]);

  // Book consultation (Outlook Book With Me)
  const handleBookConsultation = useCallback(() => {
    trackEvent('booking_cta_clicked', {
      from_step: currentStep,
      score_100: score100 ?? null,
      severity_band: severityBand,
    });
    window.open(BOOKING_CALENDAR_URL, '_blank');
  }, [currentStep, score100, severityBand]);

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
          <div key="questions" className="h-dynamic-screen flex flex-col w-full max-w-[100vw] overflow-x-hidden">
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
            score100={score100 ?? Math.round(score.normalized * 10)}
            prefilledEmail={prefilledEmail}
            isLoading={isSubmitting}
            onSubmitLead={handleSubmitLead}
            onSendPrefilledReport={handleSendPrefilledReport}
          />
        )}

        {currentStep === STEPS.RESULTS_FINAL && score && (
          <ThankYouPage
            key="results-final"
            score100={score100 ?? Math.round(score.normalized * 10)}
            severityBand={severityBand}
            topIssues={topIssues.length ? topIssues : priorities.map((p) => p.question).slice(0, 3)}
            resultSummary={resultSummary}
            resultFocusPoints={resultFocusPoints}
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
