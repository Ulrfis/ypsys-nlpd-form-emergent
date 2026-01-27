import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const LandingPage = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Logo/Brand */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-elegant">
              <Shield className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Ypsys</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Conformité nLPD:
            <br />
            <span className="text-gradient-primary">Où en êtes-vous vraiment?</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Depuis septembre 2023, la nouvelle Loi fédérale sur la protection des données 
            renforce les obligations de tous les cabinets médicaux, laboratoires et fiduciaires en Suisse.
          </p>

          {/* Statistics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto"
          >
            <Card className="border-2 border-warning/20 bg-warning/5">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-warning mb-2">90%</div>
                <p className="text-sm text-muted-foreground">
                  des PME suisses pensent être conformes
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-danger/20 bg-danger/5">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-danger mb-2">70%</div>
                <p className="text-sm text-muted-foreground">
                  ne le sont pas réellement
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Warning Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-card border border-border rounded-xl p-6 mb-10 max-w-2xl mx-auto"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div className="text-left">
                <p className="text-foreground font-medium mb-2">La différence?</p>
                <p className="text-sm text-muted-foreground">
                  Elles découvrent leurs failles trop tard: pendant un <strong>audit du PFPDT</strong>, 
                  après un <strong>incident de sécurité</strong>, ou lors d&apos;une <strong>réclamation d&apos;un patient/client</strong>.
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button 
              variant="premium" 
              size="xl" 
              onClick={onStart}
              className="group"
            >
              Commencer l&apos;évaluation
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              5 minutes • 15 questions • Résultats personnalisés
            </p>
          </motion.div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-4xl mx-auto mt-16"
        >
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <CheckCircle className="w-6 h-6" />,
                title: "Pas de jugement",
                description: "L'objectif est d'y voir clair sur votre situation réelle"
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Confidentiel",
                description: "Vos données ne sont jamais partagées avec des tiers"
              },
              {
                icon: <AlertTriangle className="w-6 h-6" />,
                title: "Actionnable",
                description: "Recevez vos 3 priorités pour sécuriser votre conformité"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-xl bg-card/50 border border-border/50"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
