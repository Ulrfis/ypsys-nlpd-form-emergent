import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Mail, Globe } from 'lucide-react';

const POLICY_COOKIES_URL = 'https://www.ypsys.com/politique-de-cookies-ue/';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-hero py-6 sm:py-12 w-full max-w-[100vw] overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au formulaire
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <img
              src="/logo-ypsys.png"
              alt="Ypsys"
              className="h-10 sm:h-12 w-auto"
            />
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Politique de confidentialité
            </h1>
          </div>

          <p className="text-sm text-muted-foreground mb-8">
            Cette politique de confidentialité a été mise à jour le 3 février 2026 et s’applique
            aux utilisateurs du formulaire d’évaluation nLPD (ci-après : « le formulaire »)
            proposé par YPSYS. Pour les cookies et traceurs sur le site ypsys.com, voir la{' '}
            <a
              href={POLICY_COOKIES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              politique de cookies
            </a>
            .
          </p>

          <Card className="border-2 border-border mb-6">
            <CardContent className="p-6 sm:p-8 space-y-6 text-sm sm:text-base text-foreground/90">
                <section>
                  <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    1. Introduction
                  </h2>
                  <p>
                    Le formulaire d’évaluation de conformité nLPD collecte des données personnelles
                    afin de fournir un diagnostic personnalisé et d’envoyer un rapport par email.
                    Le responsable du traitement est YPSYS (Route de Pré-Bois 14, 1216 Meyrin, Suisse).
                  </p>
                </section>

                <section>
                  <h2 className="font-semibold text-foreground mb-2">2. Données collectées</h2>
                  <p>
                    Nous collectons : nom, prénom, adresse email professionnelle, nom et taille de l’entreprise,
                    secteur d’activité, canton (optionnel), réponses aux questions du questionnaire nLPD,
                    score de conformité, consentement au traitement et horodatage du consentement.
                  </p>
                </section>

                <section>
                  <h2 className="font-semibold text-foreground mb-2">3. Finalités</h2>
                  <p>
                    Les données sont traitées pour : (1) calculer et afficher votre score de conformité nLPD ;
                    (2) générer un rapport personnalisé et vous l’envoyer par email ; (3) vous contacter
                    dans le cadre des services YPSYS si vous y avez consenti.
                  </p>
                </section>

                <section>
                  <h2 className="font-semibold text-foreground mb-2">4. Destinataires et transferts</h2>
                  <p>
                    Les données sont enregistrées dans une base de données hébergée par Supabase (UE/suisse selon projet).
                    L’analyse des réponses et la génération du rapport sont effectuées via OpenAI (États-Unis) ;
                    des garanties appropriées (clauses types ou équivalent) sont mises en œuvre pour ce transfert.
                    Si vous acceptez les cookies statistiques, des données de navigation peuvent être envoyées
                    à PostHog (États-Unis) ; voir la{' '}
                    <a
                      href={POLICY_COOKIES_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:no-underline"
                    >
                      politique de cookies
                    </a>
                    .
                  </p>
                </section>

                <section>
                  <h2 className="font-semibold text-foreground mb-2">5. Durée de conservation</h2>
                  <p>
                    Les données de soumission sont conservées pendant la durée nécessaire à la fourniture
                    du service et au suivi commercial consenti, puis archivées ou supprimées conformément
                    à notre politique interne et aux obligations légales.
                  </p>
                </section>

                <section>
                  <h2 className="font-semibold text-foreground mb-2">6. Vos droits</h2>
                  <p>
                    Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation du traitement,
                    de portabilité et d’opposition. Si vous avez consenti au traitement, vous pouvez révoquer
                    ce consentement à tout moment. Vous avez le droit de introduire une réclamation auprès
                    de l’autorité de contrôle (PFPDT en Suisse, CNIL en France).
                  </p>
                </section>

                <section>
                  <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    7. Contact
                  </h2>
                  <p>
                    Pour toute question relative à cette politique ou à vos données personnelles :
                  </p>
                  <p className="mt-2">
                    <strong>YPSYS</strong><br />
                    Route de Pré-Bois 14<br />
                    1216 Meyrin, Suisse<br />
                    Site web :{' '}
                    <a
                      href="https://www.ypsys.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:no-underline"
                    >
                      https://www.ypsys.com
                    </a>
                    <br />
                    E-mail : contact@ypsys.com<br />
                    Téléphone : +41 22 544 14 40
                  </p>
                </section>
              </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link to="/" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Retour au formulaire
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a
                href={POLICY_COOKIES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <Globe className="w-4 h-4" />
                Politique de cookies (ypsys.com)
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
