import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const LandingPage = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-hero w-full max-w-[100vw] overflow-x-hidden">
      {/* Hero Section - compact on mobile so CTA visible without scroll */}
      <div className="container mx-auto px-4 py-4 sm:py-8 md:py-20 max-w-[100vw]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Logo/Brand */}
          <div className="flex items-center justify-center mb-3 sm:mb-6">
            <img
              src="/logo-ypsys.png"
              alt="Ypsys - time for real performance"
              className="h-14 sm:h-[74px] md:h-[92px] w-auto"
            />
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-2xl sm:text-4xl lg:text-6xl font-bold text-foreground mb-3 sm:mb-6 leading-tight">
            Conformité nLPD:
            <br />
            <span className="text-gradient-primary">Où en êtes-vous vraiment?</span>
          </h1>

          {/* Subheadline */}
          <p className="text-sm sm:text-lg md:text-xl text-muted-foreground mb-4 sm:mb-6 md:mb-10 max-w-2xl mx-auto leading-snug">
            Depuis septembre 2023, la nouvelle Loi fédérale sur la protection des données 
            renforce les obligations de tous les cabinets médicaux, laboratoires et fiduciaires en Suisse.
          </p>

          {/* Statistics - Narrative Format */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-4 sm:mb-6 md:mb-10 max-w-3xl mx-auto"
          >
            <p className="text-base sm:text-xl md:text-2xl text-foreground leading-relaxed">
              <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-warning">90%</span>{' '}
              des PME suisses pensent être conformes, mais{' '}
              <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-danger">70%</span>{' '}
              ne le sont pas réellement
            </p>
          </motion.div>

          {/* Warning Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-card border border-border rounded-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-10 max-w-2xl mx-auto"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Elles découvrent leurs failles trop tard : après un{' '}
                  <strong>incident de sécurité</strong>, ou lors d&apos;une{' '}
                  <strong>réclamation d&apos;un patient/client</strong>.
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA Button - toujours visible sans scroll */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-4 sm:mb-6 md:mb-10"
          >
            <Button 
              variant="premium" 
              size="xl" 
              onClick={onStart}
              className="group w-full max-w-md mx-auto px-4"
            >
              Commencer l&apos;évaluation
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1 shrink-0" />
            </Button>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-4">
              5 minutes • 15 questions • Résultats personnalisés
            </p>
          </motion.div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-4xl mx-auto mt-6 sm:mt-10 md:mt-16"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
            {[
              {
                icon: <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
                title: "Pas de jugement",
                description: "L'objectif est d'y voir clair sur votre situation réelle"
              },
              {
                icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6" />,
                title: "Confidentiel",
                description: "Vos données ne sont jamais partagées avec des tiers"
              },
              {
                icon: <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />,
                title: "Actionnable",
                description: "Recevez vos 3 priorités pour sécuriser votre conformité"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="text-center p-3 sm:p-6 rounded-xl bg-card/50 border border-border/50"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 sm:mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
