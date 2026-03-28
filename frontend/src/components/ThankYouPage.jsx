import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { BOOKING_EMBED_URL, BOOKING_MEETING_PAGE_URL } from '@/lib/booking';
const RESULT_COPY = {
  good: {
    title: 'Exemplaire',
    intro: [
      'Votre conformité nLPD est bien organisée. Vous etes mieux préparé que la majorité des PME suisses.',
      "Vous avez fait le plus dur.",
      "Si un contrôle PFPDT arrivait demain, vous pourriez fournir presque l'essentiel de la documentation demandée, mais pas tout.",
      'En cas de contrôle, suite à un incident, vous ne pourrez pas prouver les failles critiques, les preuves manquantes, les procédures non formalisées et les tests non documentés.',
    ],
    listTitle: 'Voici ce qui reste à prendre en considération :',
    diagnostic: [
      'Gérer les derniers risques identifiés',
      'Définir les objectifs à améliorer',
      "Obtenir une roadmap d'action personnalisée",
    ],
    diagnosticIntro: 'Pour atteindre le score de 100%, je vous propose un entretien de 30 minutes pour :',
  },
  vigilance: {
    title: 'Risque modéré',
    intro: [
      'Votre conformité nLPD est plus ou moins bien organisée.',
      'Vos procédures commencent a se rapprocher des standards demandés de la nLPD.',
      'Cependant, des ajustements restent nécessaires si un contrôle PFPDT arrivait demain.',
    ],
    listTitle: 'Voici les trois points qui peuvent vous exposer :',
    diagnostic: [
      'Traiter vos risques identifiés',
      'Définir les objectifs à prioriser',
      'Prendre en compte les risques financiers',
      "Obtenir une roadmap d'action personnalisée",
    ],
    diagnosticIntro: 'Pour finaliser la sécurisation de votre entreprise, je vous propose un entretien de 30 minutes pour :',
  },
  critical: {
    title: 'Risque élevé',
    intro: [
      'Votre score révèle des failles majeures dans votre infrastructure.',
      "Ces failles ne se voient pas au quotidien. Et c'est exactement le problème.",
      "Sans mesure, sans vérification, sans tests, tout parait en ordre. Jusqu'au jour ou un ransomware frappe ou qu'un audit PFPDT vous demande des preuves.",
      "A ce moment-là, vous ne pouvez plus corriger. Vous pouvez juste gérer les conséquences: amende pouvant atteindre CHF 250'000, fermeture administrative possible, responsabilité personnelle du dirigeant devant la loi.",
      'Votre score ne ment pas. Vos failles non plus.',
    ],
    listTitle: 'Voici les trois points qui peuvent vous exposer :',
    diagnostic: [
      'Traiter vos trois risques majeurs',
      'Définir les objectifs à prioriser',
      'Prendre en compte les risques financiers',
      "Obtenir une roadmap d'action personnalisée",
    ],
    diagnosticIntro: 'Pour rapidement sécuriser votre entreprise, je vous propose un entretien de 30 minutes pour :',
  },
};

export const ThankYouPage = ({
  score100,
  severityBand,
  topIssues,
  resultSummary,
  resultFocusPoints,
  onBookConsultation,
}) => {
  const safeScore = Math.min(Math.max(Math.round(score100 ?? 0), 0), 100);
  const band = RESULT_COPY[severityBand] ? severityBand : safeScore < 60 ? 'critical' : safeScore < 90 ? 'vigilance' : 'good';
  const copy = RESULT_COPY[band];
  const fallbackPoints = [
    "Formaliser les accès aux données sensibles et leur traçabilité",
    "Sécuriser la documentation nLPD (procédures, rôles, conservation)",
    "Structurer un plan d'action priorisé avec échéances",
  ];
  const points = Array.isArray(resultFocusPoints) && resultFocusPoints.length
    ? resultFocusPoints.slice(0, 4)
    : Array.isArray(topIssues) && topIssues.length
      ? topIssues.slice(0, 3)
      : fallbackPoints;

  return (
    <div className="min-h-screen bg-gradient-hero py-4 sm:py-12 w-full max-w-[100vw] overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-[100vw]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-6 sm:mb-10">
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              {copy.title}
            </h1>
            <p className="text-3xl sm:text-5xl font-bold text-primary">
              Score : {safeScore}/100
            </p>
          </div>

          <Card className="border-2 border-primary/20 bg-card mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-5">
              {copy.intro.map((paragraph, index) => (
                <p key={`intro-${index}`} className="text-sm sm:text-base text-foreground/90 leading-relaxed">
                  {paragraph}
                </p>
              ))}
              {resultSummary ? (
                <div className="border-t border-border pt-5">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3">
                    Résumé de la situation
                  </h3>
                  <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
                    {resultSummary}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-2 border-border bg-card mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3">
                {copy.listTitle}
              </h3>
              <div className="space-y-2">
                {points.map((point, idx) => (
                  <p key={`point-${idx}`} className="text-sm sm:text-base text-foreground/90 leading-relaxed">
                    - {point}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/30 bg-card mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">
                Diagnostic NLPD prioritaire offert :
              </h3>
              <p className="text-sm sm:text-base text-foreground/90 mb-3 leading-relaxed">
                {copy.diagnosticIntro}
              </p>
              <div className="space-y-1 text-sm sm:text-base text-foreground/90 mb-5 leading-relaxed">
                {copy.diagnostic.map((item, idx) => (
                  <p key={`diag-${idx}`}>- {item}</p>
                ))}
              </div>
              <div className="space-y-4">
                <h4 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                  Réservez votre créneau (entretien de 30 minutes)
                </h4>
                <div className="relative w-full overflow-hidden rounded-xl border border-border bg-background shadow-sm min-h-[720px] sm:min-h-[800px]">
                  <iframe
                    title="Réserver un entretien de 30 minutes — calendrier TidyCal"
                    src={BOOKING_EMBED_URL}
                    className="block w-full min-h-[720px] sm:min-h-[800px] lg:min-h-[880px] h-[82vh] sm:h-[80vh] max-h-[1280px] border-0"
                    allow="payment *; clipboard-write"
                  />
                </div>
                <a
                  href={BOOKING_MEETING_PAGE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onBookConsultation?.()}
                  className="inline-block text-sm text-primary underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  Ouvrir le calendrier dans un nouvel onglet
                </a>
              </div>
              <p className="text-xs italic text-muted-foreground mt-4">
                Les disponibilités réelles sont celles affichées dans le calendrier ci-dessus.
              </p>
            </CardContent>
          </Card>

          <div className="mt-8 sm:mt-12 pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground/70 text-center max-w-2xl mx-auto">
              YPSYS ne s'engage en aucun cas sur l'exhaustivité ou l'exactitude des résultats fournis par cette application, qui reste un outil d'aide à la conformité nLPD. L'utilisateur final conserve l'entière responsabilité de la vérification et du respect de la réglementation en vigueur.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ThankYouPage;
