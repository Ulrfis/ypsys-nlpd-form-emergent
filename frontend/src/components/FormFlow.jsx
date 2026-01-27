import React, { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { questions, sections, calculateScore, getTopPriorities } from '@/data/questionsData';
import { LandingPage } from '@/components/LandingPage';
import { ProgressBar } from '@/components/ProgressBar';
import { QuestionCard } from '@/components/QuestionCard';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ThankYouPage } from '@/components/ThankYouPage';
import { ThemeToggle } from '@/components/ThemeToggle';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Steps in the form flow
const STEPS = {
  LANDING: 'landing',
  QUESTIONS: 'questions',
  LEAD_CAPTURE: 'lead_capture',
  LOADING: 'loading',
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
  const [submissionId, setSubmissionId] = useState(null);

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

  // Submit the form
  const handleSubmit = useCallback(async (formData) => {
    setIsSubmitting(true);
    setUserData(formData);
    setCurrentStep(STEPS.LOADING);

    // Calculate score
    const calculatedScore = calculateScore(answers);
    const topPriorities = getTopPriorities(answers);
    
    setScore(calculatedScore);
    setPriorities(topPriorities);

    try {
      // Submit to backend
      const response = await axios.post(`${API}/submissions`, {
        user_email: formData.email,
        user_first_name: formData.firstName,
        user_last_name: formData.lastName,
        company_name: formData.companyName,
        company_size: formData.companySize || null,
        industry: formData.industry || null,
        canton: formData.canton || null,
        answers: answers,
        score_raw: calculatedScore.raw,
        score_normalized: calculatedScore.normalized,
        risk_level: calculatedScore.riskLevel,
        consent_marketing: formData.consentMarketing,
      });

      setSubmissionId(response.data.id);
      
      // Generate teaser based on score and priorities
      const priorityTexts = topPriorities.slice(0, 3).map((p, i) => `${i + 1}) ${p.question}`).join(' ');
      const generatedTeaser = `Votre score est de ${calculatedScore.normalized}/10. ${
        calculatedScore.riskLevel === 'green' 
          ? 'Vous êtes sur la bonne voie!' 
          : calculatedScore.riskLevel === 'orange'
          ? 'Des améliorations sont nécessaires.'
          : 'Action urgente requise.'
      } ${topPriorities.length > 0 ? `Vos priorités: ${priorityTexts}.` : ''} Consultez votre email pour le rapport complet.`;
      
      setTeaser(generatedTeaser);

      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentStep(STEPS.THANK_YOU);
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Still show results even if backend fails
      const generatedTeaser = `Votre score est de ${calculatedScore.normalized}/10. ${
        calculatedScore.riskLevel === 'green' 
          ? 'Vous êtes sur la bonne voie!' 
          : calculatedScore.riskLevel === 'orange'
          ? 'Des améliorations sont nécessaires.'
          : 'Action urgente requise.'
      }`;
      setTeaser(generatedTeaser);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStep(STEPS.THANK_YOU);
    } finally {
      setIsSubmitting(false);
    }
  }, [answers]);

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

        {currentStep === STEPS.LOADING && (
          <LoadingScreen key="loading" />
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
