import React, { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { questions, sections, calculateScore, getTopPriorities } from '@/data/questionsData';
import { LandingPage } from '@/components/LandingPage';
import { ProgressBar } from '@/components/ProgressBar';
import { QuestionCard } from '@/components/QuestionCard';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { AnalysisLoadingScreen } from '@/components/AnalysisLoadingScreen';
import { ThankYouPage } from '@/components/ThankYouPage';
import { ThemeToggle } from '@/components/ThemeToggle';
import { generateAnalysis } from '@/lib/openai';
import { saveSubmission } from '@/lib/supabase';

// Steps in the form flow
const STEPS = {
  LANDING: 'landing',
  QUESTIONS: 'questions',
  LEAD_CAPTURE: 'lead_capture',
  ANALYZING: 'analyzing',
  THANK_YOU: 'thank_you',
};

export const FormFlow = () => {
  const [currentStep, setCurrentStep] = useState(STEPS.LANDING);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [userData, setUserData] = useState(null);
  const [score, setScore] = useState(null);
  const [priorities, setPriorities] = useState([]);
  const [teaser, setTeaser] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('creating_thread');
  const [analysisMessage, setAnalysisMessage] = useState('');

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
    } else {
      // All questions answered, go to lead capture
      setCurrentStep(STEPS.LEAD_CAPTURE);
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

  // Build the answer texts for OpenAI
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

  // Submit the form with OpenAI analysis
  const handleSubmit = useCallback(async (formData) => {
    setIsSubmitting(true);
    setUserData(formData);
    setCurrentStep(STEPS.ANALYZING);
    setAnalysisStatus('creating_thread');
    setAnalysisMessage('');

    // Calculate score
    const calculatedScore = calculateScore(answers);
    const topPriorities = getTopPriorities(answers);
    
    setScore(calculatedScore);
    setPriorities(topPriorities);

    // Build payload for OpenAI
    const payload = {
      user: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email || null,
        company: formData.companyName,
        size: formData.companySize || null,
        industry: formData.industry || null,
        canton: formData.canton || null,
      },
      answers: buildAnswerTexts(),
      score: {
        value: calculatedScore.raw,
        normalized: calculatedScore.normalized,
        level: calculatedScore.riskLevel,
      },
      has_email: Boolean(formData.email),
    };

    try {
      // Status update callback
      const onStatusUpdate = (status, message) => {
        setAnalysisStatus(status);
        setAnalysisMessage(message);
      };

      // Call OpenAI Assistant
      const openaiResponse = await generateAnalysis(payload, onStatusUpdate);
      
      // Set teaser from OpenAI response
      setTeaser(openaiResponse.teaser);

      // Save to Supabase
      try {
        await saveSubmission(payload, openaiResponse);
        console.log('Submission saved to Supabase');
      } catch (supabaseError) {
        console.error('Error saving to Supabase:', supabaseError);
        // Continue even if Supabase fails
      }

      // Small delay to show completion state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentStep(STEPS.THANK_YOU);
    } catch (error) {
      console.error('Error during analysis:', error);
      
      // Fallback teaser
      const fallbackTeaser = `Votre score est de ${calculatedScore.normalized}/10. ${
        calculatedScore.riskLevel === 'green' 
          ? 'Vous êtes sur la bonne voie!' 
          : calculatedScore.riskLevel === 'orange'
          ? 'Des améliorations sont nécessaires.'
          : 'Action urgente requise.'
      } Consultez votre email pour le rapport complet.`;
      
      setTeaser(fallbackTeaser);
      setAnalysisStatus('complete');
      
      // Try to save anyway
      try {
        await saveSubmission(payload, { teaser: fallbackTeaser, lead_temperature: 'WARM' });
      } catch (e) {
        console.error('Fallback save failed:', e);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentStep(STEPS.THANK_YOU);
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, buildAnswerTexts]);

  // Book consultation
  const handleBookConsultation = useCallback(() => {
    // For now, just show an alert. Will be replaced with actual calendar booking
    alert('Fonctionnalité de réservation à venir!');
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
          <div key="questions" className="min-h-screen">
            <ProgressBar 
              currentQuestion={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              answers={answers}
            />
            <div className="container mx-auto px-4 py-8">
              <QuestionCard
                question={currentQuestion}
                section={currentSection}
                selectedAnswer={answers[currentQuestion.id]}
                onAnswer={(value) => handleAnswer(currentQuestion.id, value)}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isFirst={currentQuestionIndex === 0}
                isLast={currentQuestionIndex === questions.length - 1}
              />
            </div>
          </div>
        )}

        {currentStep === STEPS.LEAD_CAPTURE && (
          <div key="lead-capture" className="min-h-screen bg-gradient-hero py-12">
            <div className="container mx-auto px-4">
              <LeadCaptureForm 
                onSubmit={handleSubmit}
                isLoading={isSubmitting}
              />
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
    </div>
  );
};

export default FormFlow;
