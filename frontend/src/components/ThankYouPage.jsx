import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight } from 'lucide-react';
import ScoreGauge from './ScoreGauge';

const RESULT_COPY = {
  critical: {
    title: "ATTENTION : Votre conformité nLPD est critique",
    listTitle: "VOS 3 FAILLES CRITIQUES",
    intro: [
      "Votre infrastructure présente des failles majeures.",
      "Le genre de failles qu'on ne voit pas. Jusqu'au ransomware. Ou l'audit PFPDT.",
      "À ce moment-là, il est trop tard pour corriger. On peut juste compter les dégâts.",
      "Amende. Fermeture possible. Responsabilité personnelle.",
      "Ce n'est pas théorique. C'est ce qui arrive quand personne ne mesure rien.",
    ],
    outro: [
      "Votre score ne ment pas. Vos failles non plus.",
      "La question n'est plus \"suis-je conforme\". C'est \"combien de temps avant le problème\".",
    ],
    ctaIntro: "Votre score révèle une urgence réelle.",
  },
  vigilance: {
    title: "Vigilance requise : des corrections sont nécessaires",
    listTitle: "VOS 3 PRIORITÉS",
    intro: [
      "Votre infrastructure fonctionne.",
      "Mais elle présente des failles que vous ne voyez pas tant qu'il n'y a pas d'incident.",
      "Le problème avec les failles invisibles, c'est qu'elles deviennent très visibles le jour où quelqu'un les cherche.",
      "Un auditeur étatique qui vérifie votre conformité. Un client qui exige une attestation. Un assureur qui vérifie après sinistre.",
      "Impossible de les corriger ce jour-là. On peut juste constater qu'elles existent.",
    ],
    outro: [
      "Vous n'êtes pas en zone rouge. Mais vous n'êtes pas à l'abri non plus.",
      "Vous savez où vous en êtes. Vous savez ce qui manque. Ce qui manque ne disparaîtra pas tout seul.",
    ],
    ctaIntro: "Discutons de vos résultats pour prioriser les actions à impact immédiat.",
  },
  good: {
    title: "Bonne conformité détectée",
    listTitle: "POINTS À FINALISER",
    intro: [
      "Votre infrastructure est mieux organisée que la majorité des PME suisses.",
      "Vous avez fait le plus dur.",
      "Quelques points restent à finaliser. Pas des failles majeures. Des étapes de documentation.",
      "Le genre de détails qui ne pose aucun problème... jusqu'au jour où un auditeur PFPDT les cherche.",
      "Entre \"bien préparé\" et \"irréprochable\", il reste ces quelques points.",
    ],
    outro: [
      "Vous avez fait une grande partie du travail.",
      "Ce qui reste, ce sont les preuves qui font la différence lors d'un contrôle.",
      "Vous êtes proche. Terminons le travail.",
    ],
    ctaIntro: "Discutons de vos résultats pour sécuriser les derniers points critiques.",
  },
};

export const ThankYouPage = ({ score100, severityBand, topIssues, onBookConsultation }) => {
  const safeScore = Math.min(Math.max(Math.round(score100 ?? 0), 0), 100);
  const band = RESULT_COPY[severityBand] ? severityBand : safeScore < 40 ? 'critical' : safeScore < 80 ? 'vigilance' : 'good';
  const copy = RESULT_COPY[band];
  const sectionTitle = band === 'critical' ? 'CRITIQUE' : band === 'vigilance' ? 'VIGILANCE REQUISE' : 'BON NIVEAU';
  const fallbackIssues = [
    "Formaliser les accès aux données sensibles et leur traçabilité",
    "Sécuriser la documentation nLPD (procédures, rôles, conservation)",
    "Structurer un plan d'action priorisé avec échéances",
  ];
  const issues = Array.isArray(topIssues) && topIssues.length ? topIssues.slice(0, 3) : fallbackIssues;

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
              VOTRE SCORE CONFORMITÉ nLPD
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {sectionTitle}
            </p>
          </div>

          <div className="mb-6 sm:mb-8 flex justify-center">
            <ScoreGauge score={safeScore} size={190} animated={true} format="outOf100" />
          </div>

          <Card className="border-2 border-primary/20 bg-card mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-5">
              <h2 className="text-lg sm:text-2xl font-bold text-foreground leading-tight">
                {copy.title}
              </h2>
              <p className="text-base sm:text-lg font-semibold text-foreground">
                Score : {safeScore}/100
              </p>
              {copy.intro.map((paragraph, index) => (
                <p key={`intro-${index}`} className="text-sm sm:text-base text-foreground/90 leading-relaxed">
                  {paragraph}
                </p>
              ))}

              <div className="border-t border-border pt-5">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3">
                  {copy.listTitle}
                </h3>
                <div className="space-y-2">
                  {issues.map((issue, idx) => (
                    <p key={`issue-${idx}`} className="text-sm sm:text-base text-foreground/90 leading-relaxed">
                      - {issue}
                    </p>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-5 space-y-3">
                {copy.outro.map((paragraph, index) => (
                  <p key={`outro-${index}`} className="text-sm sm:text-base text-foreground/90 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border bg-card mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">
                VOUS VOULEZ EN DISCUTER ?
              </h3>
              <p className="text-sm sm:text-base text-foreground/90 mb-4 leading-relaxed">
                {copy.ctaIntro}
              </p>
              <div className="space-y-1 text-sm sm:text-base text-foreground/90 mb-4 leading-relaxed">
                <p>- Comprendre votre contexte précis</p>
                <p>- Identifier ce qui est bloquant immédiatement</p>
                <p>- Vous donner les priorités d'action</p>
                <p>- Évaluer ensemble les options</p>
              </div>
              <p className="text-sm sm:text-base text-foreground/90 mb-2 leading-relaxed">
                Pas de diagnostic gratuit miracle.
              </p>
              <p className="text-sm sm:text-base text-foreground/90 mb-2 leading-relaxed">
                Juste une conversation claire sur vos priorités, vos contraintes et ce qui bloque vraiment.
              </p>
              <p className="text-sm sm:text-base text-foreground/90 mb-5 leading-relaxed">
                Sans engagement.
              </p>
              <Button
                variant="premium"
                size="lg"
                onClick={onBookConsultation}
                className="group w-full max-w-full text-xs sm:text-base px-3 sm:px-6 min-w-0 h-auto py-3"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="text-center whitespace-normal leading-tight">PRENDRE RENDEZ-VOUS - 30 MIN</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform group-hover:translate-x-1" />
              </Button>
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
