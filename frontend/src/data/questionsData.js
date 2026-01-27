// nLPD Questionnaire Data - All 15 questions with enriched content
export const sections = [
  {
    id: 'access',
    title: 'Accès aux données',
    icon: 'Lock',
    description: 'Qui peut consulter vos données sensibles et comment pouvez-vous le prouver?',
    weight: 0.30, // 30% weight
  },
  {
    id: 'protection',
    title: 'Protection des données',
    icon: 'Shield',
    description: 'Comment protégez-vous physiquement vos données contre le vol, la perte, la corruption?',
    weight: 0.25, // 25% weight
  },
  {
    id: 'subcontractors',
    title: 'Sous-traitants',
    icon: 'Link',
    description: 'Vos prestataires sont-ils conformes nLPD? Savez-vous où vos données vont?',
    weight: 0.20, // 20% weight
  },
  {
    id: 'rights',
    title: 'Droits des personnes',
    icon: 'Users',
    description: 'Respectez-vous les droits fondamentaux des patients/clients sous nLPD?',
    weight: 0.15, // 15% weight
  },
  {
    id: 'incidents',
    title: 'Gestion des incidents',
    icon: 'AlertTriangle',
    description: 'Êtes-vous prêts en cas de violation de données? Savez-vous qui appeler?',
    weight: 0.10, // 10% weight
  },
];

export const questions = [
  // SECTION 1: ACCÈS AUX DONNÉES (Q1-Q3)
  {
    id: 'q1',
    sectionId: 'access',
    number: 1,
    question: 'Qui peut consulter les dossiers sensibles?',
    icon: 'Lock',
    tooltip: {
      title: 'Pourquoi c\'est important?',
      content: 'La nLPD exige que vous contrôliez précisément qui accède à quelles données. Cela signifie: liste à jour des personnes autorisées, droits spécifiques (accès complet, lecture seule, secteur limité), et révocation rapide quand quelqu\'un part ou change de rôle.',
      risk: 'Si le PFPDT audite votre structure et trouve que "toute l\'équipe peut tout voir", c\'est une non-conformité critique.',
    },
    warningExample: 'Un collaborateur parti il y a 6 mois qui a encore accès = faille nLPD.',
    options: [
      {
        value: 'controlled',
        label: 'Seulement les personnes autorisées (avec contrôle)',
        score: 0,
        feedback: { type: 'success', message: 'Vous maîtrisez cet aspect' },
        explanation: 'C\'est la réponse conforme. Vous avez une liste à jour des rôles + accès, et vous pouvez prouver qui a accès à quoi.',
      },
      {
        value: 'everyone',
        label: 'Toute l\'équipe peut tout voir',
        score: 3,
        feedback: { type: 'danger', message: 'Violation nLPD grave' },
        explanation: 'Réceptionniste voit dossiers patients, comptable voit données sensibles. Risque d\'amende jusqu\'à CHF 250\'000.',
      },
      {
        value: 'no_control',
        label: 'Je ne contrôle pas vraiment',
        score: 2,
        feedback: { type: 'warning', message: 'Point à améliorer rapidement' },
        explanation: 'Honnête, mais problématique. Courant quand la structure a grandi progressivement sans formaliser les droits.',
      },
    ],
  },
  {
    id: 'q2',
    sectionId: 'access',
    number: 2,
    question: 'Pouvez-vous prouver qui a consulté quels dossiers?',
    icon: 'FileSearch',
    tooltip: {
      title: 'Pourquoi c\'est important?',
      content: 'Un patient vous appelle: "Quelqu\'un a consulté mon dossier sans raison médicale!" Avec un audit log, vous pouvez prouver exactement qui a accédé à quoi et quand. Sans historique, impossible de prouver votre innocence.',
      risk: 'Sans historique, violation grave + perte de confiance + risque d\'amende.',
    },
    warningExample: 'Sans historique, impossible de prouver votre innocence en cas d\'incident.',
    options: [
      {
        value: 'complete',
        label: 'Oui, j\'ai un historique complet',
        score: 0,
        feedback: { type: 'success', message: 'Conforme & rassurant' },
        explanation: 'Votre système enregistre qui, quand, quoi pour chaque consultation. En cas d\'audit ou réclamation, vous avez des preuves.',
      },
      {
        value: 'partial',
        label: 'Partiellement',
        score: 2,
        feedback: { type: 'warning', message: 'Lacune à combler' },
        explanation: 'Logs pour certaines actions mais pas toutes. Le PFPDT voit des trous → scepticisme sur votre contrôle réel.',
      },
      {
        value: 'none',
        label: 'Non, aucune trace',
        score: 3,
        feedback: { type: 'danger', message: 'Violation critique' },
        explanation: 'Comment prouvez-vous qu\'une violation n\'a pas eu lieu? PFPDT doit vous notifier: "Non-conforme. Sanctions possibles."',
      },
    ],
  },
  {
    id: 'q3',
    sectionId: 'access',
    number: 3,
    question: 'Les dossiers peuvent-ils être consultés depuis des appareils personnels?',
    icon: 'Smartphone',
    tooltip: {
      title: 'Pourquoi c\'est important?',
      content: 'Un médecin consulte un dossier patient sur son iPhone personnel non chiffré. Le lendemain, il le perd au café. Quelqu\'un y trouve les données patientes. Qui est responsable? Vous.',
      risk: 'Données pro sur smartphone perso non sécurisé = faille nLPD garantie.',
    },
    warningExample: 'Données pro sur smartphone perso non sécurisé = faille nLPD garantie.',
    options: [
      {
        value: 'professional_only',
        label: 'Non, uniquement matériel professionnel sécurisé',
        score: 0,
        feedback: { type: 'success', message: 'Conforme & sécurisé' },
        explanation: 'Les données sensibles ne sont accessibles que depuis des appareils professionnels chiffrés, avec MdP fort et mises à jour de sécurité.',
      },
      {
        value: 'with_rules',
        label: 'Oui, avec règles strictes et sécurité renforcée',
        score: 1,
        feedback: { type: 'warning', message: 'Acceptable mais fragile' },
        explanation: 'Les règles doivent être appliquées ET auditées. Sinon c\'est juste du papier.',
      },
      {
        value: 'no_framework',
        label: 'Oui, sans cadre précis',
        score: 3,
        feedback: { type: 'danger', message: 'Risque critique identifié' },
        explanation: 'Une simple perte/vol d\'appareil = breach PFPDT-signalable. Données patientes exposées.',
      },
    ],
  },
  
  // SECTION 2: PROTECTION DES DONNÉES (Q4-Q6)
  {
    id: 'q4',
    sectionId: 'protection',
    number: 4,
    question: 'Si un laptop est volé, les données dedans sont-elles lisibles?',
    icon: 'Laptop',
    tooltip: {
      title: 'Pourquoi c\'est important?',
      content: 'Cas réel: Un cabinet médical en Valais perd un laptop contenant 500 dossiers patients non chiffré. Résultat: Breach PFPDT signalé, 500 patients notifiés, amende CHF 150\'000, réputation perdue.',
      risk: 'Avec chiffrement, le même laptop volé aurait été complètement inutilisable. Juste un morceau de plastique.',
    },
    warningExample: 'Un laptop volé avec données lisibles = amende + perte de crédibilité.',
    options: [
      {
        value: 'protected',
        label: 'Non, protégées',
        score: 0,
        feedback: { type: 'success', message: 'Conforme & protégé' },
        explanation: 'Chiffrement full-disk activé (BitLocker/FileVault). Les données sont transformées en code indéchiffrable.',
      },
      {
        value: 'readable',
        label: 'Oui, lisibles directement',
        score: 3,
        feedback: { type: 'danger', message: 'Violation grave' },
        explanation: 'Quelqu\'un qui prend votre laptop peut accéder directement aux fichiers. Une simple perte = breach PFPDT-signalable.',
      },
      {
        value: 'unknown',
        label: 'Je ne sais pas',
        score: 2,
        feedback: { type: 'warning', message: 'Urgent à vérifier' },
        explanation: 'Demandez à votre IT ou à Ypsys de vérifier immédiatement l\'état d\'activation du chiffrement.',
      },
    ],
  },
  {
    id: 'q5',
    sectionId: 'protection',
    number: 5,
    question: 'Vos sauvegardes fonctionnent-elles vraiment?',
    icon: 'HardDrive',
    tooltip: {
      title: 'Pourquoi c\'est important?',
      content: '60% des entreprises qui ont une sauvegarde ne l\'ont jamais testée. Quand une vraie catastrophe arrive (ransomware), ils découvrent que la sauvegarde est corrompue. Résultat: perte totale des données.',
      risk: 'Une sauvegarde non testée n\'existe pas. C\'est du jeu de rôle.',
    },
    warningExample: 'Une sauvegarde non testée n\'existe pas.',
    options: [
      {
        value: 'tested_quarterly',
        label: 'Testées tous les 3 mois',
        score: 0,
        feedback: { type: 'success', message: 'Excellent' },
        explanation: 'Vous pratiquez régulièrement une restauration. Vous savez que ça marche. En cas de crise, zéro stress.',
      },
      {
        value: 'tested_yearly',
        label: 'Testées une fois par an',
        score: 1,
        feedback: { type: 'warning', message: 'Acceptable, mais risqué' },
        explanation: 'La sauvegarde peut être cassée 90% du temps sans que vous le sachiez.',
      },
      {
        value: 'never_tested',
        label: 'Jamais testées',
        score: 2,
        feedback: { type: 'danger', message: 'Très risqué' },
        explanation: '70% des premières restaurations révèlent des problèmes. En cas de crise réelle, découverte tardive.',
      },
      {
        value: 'no_backup',
        label: 'Pas de sauvegarde',
        score: 3,
        feedback: { type: 'danger', message: 'Violation critique' },
        explanation: 'Si vos données sont perdues (ransomware, incendie, vol), elles sont définitivement perdues.',
      },
    ],
  },
  {
    id: 'q6',
    sectionId: 'protection',
    number: 6,
    question: 'Avez-vous un document qui liste qui peut accéder à quoi et comment?',
    icon: 'FileText',
    tooltip: {
      title: 'Pourquoi c\'est important?',
      content: 'Scénario audit PFPDT: "Montrez-moi votre politique d\'accès aux données." Avec documentation: "Voilà les rôles et accès." Sans: "C\'est géré par chacun." La documentation n\'est pas du luxe, c\'est une obligation légale.',
      risk: 'Sans documentation, impossible de prouver votre conformité lors d\'un audit.',
    },
    warningExample: 'Sans documentation, impossible de prouver votre conformité lors d\'un audit.',
    options: [
      {
        value: 'documented',
        label: 'Oui, document à jour',
        score: 0,
        feedback: { type: 'success', message: 'Conforme' },
        explanation: 'Matrice d\'accès documentée avec liste des rôles, données accessibles par rôle, conditions d\'accès.',
      },
      {
        value: 'partial',
        label: 'Partiellement',
        score: 2,
        feedback: { type: 'warning', message: 'Lacune' },
        explanation: 'Politique incomplète, obsolète, vague ou informelle. Le PFPDT demandera clarifications.',
      },
      {
        value: 'none',
        label: 'Non, rien d\'écrit',
        score: 3,
        feedback: { type: 'danger', message: 'Violation grave' },
        explanation: 'Gestion des accès "par habitude". Impossible de prouver la conformité. PFPDT notifie une non-conformité.',
      },
    ],
  },
  
  // SECTION 3: SOUS-TRAITANTS (Q7-Q8)
  {
    id: 'q7',
    sectionId: 'subcontractors',
    number: 7,
    question: 'Vos prestataires (cloud, logiciels, hébergeurs) sont-ils conformes à la nLPD?',
    icon: 'Link',
    tooltip: {
      title: 'Pourquoi c\'est important?',
      content: 'Règle d\'or nLPD: Vous êtes responsable de ce que font vos sous-traitants avec vos données. Si votre fournisseur cloud se fait hacker, c\'est VOTRE responsabilité de notifier le PFPDT et les patients.',
      risk: 'Leur faille = votre responsabilité. Et votre amende.',
    },
    warningExample: 'Leur faille = votre responsabilité. Et votre amende.',
    options: [
      {
        value: 'contract_signed',
        label: 'Oui, avec contrat signé',
        score: 0,
        feedback: { type: 'success', message: 'Conforme' },
        explanation: 'Chaque fournisseur critique a signé un Accord de Traitement des Données (DPA) stipulant le respect de la nLPD.',
      },
      {
        value: 'trust',
        label: 'Je leur fais confiance',
        score: 2,
        feedback: { type: 'warning', message: 'Juridiquement insuffisant' },
        explanation: 'La confiance ≠ protection légale. En cas de problème, vous avez zéro recours. Demandez un DPA à tous vos fournisseurs.',
      },
      {
        value: 'unknown',
        label: 'Je ne sais pas',
        score: 3,
        feedback: { type: 'danger', message: 'Dangereux' },
        explanation: 'Vous ne savez même pas qui a accès à vos données. Urgent: Audit des fournisseurs + mapping des données.',
      },
    ],
  },
  {
    id: 'q8',
    sectionId: 'subcontractors',
    number: 8,
    question: 'Où sont stockées vos données sensibles?',
    icon: 'Globe',
    tooltip: {
      title: 'Pourquoi c\'est important?',
      content: 'Hypothèse nLPD: Vos données sensibles restent en Suisse/EU. Si données aux USA, le gouvernement US peut forcer l\'accès (CLOUD Act). nLPD exige des mesures de protection renforcées.',
      risk: 'Données hors Suisse/UE = obligations nLPD renforcées. Souvent ignorées.',
    },
    warningExample: 'Données hors Suisse/UE = obligations nLPD renforcées. Souvent ignorées.',
    options: [
      {
        value: 'switzerland',
        label: 'En Suisse uniquement',
        score: 0,
        feedback: { type: 'success', message: 'Optimal' },
        explanation: 'Maximum de conformité nLPD. Zéro complications légales. Droit suisse s\'applique complètement.',
      },
      {
        value: 'europe',
        label: 'En Europe',
        score: 0,
        feedback: { type: 'success', message: 'Acceptable' },
        explanation: 'EU a règlements similaires (RGPD compatible). Légalement acceptable sous nLPD.',
      },
      {
        value: 'outside_europe',
        label: 'Hors Europe (USA, autre)',
        score: 2,
        feedback: { type: 'warning', message: 'Compliqué légalement' },
        explanation: 'Accès potentiel par gouvernement USA. nLPD demande consentement explicite et mesures renforcées.',
      },
      {
        value: 'unknown',
        label: 'Aucune idée',
        score: 3,
        feedback: { type: 'danger', message: 'Très dangereux' },
        explanation: 'Urgent: Demander immédiatement à votre fournisseur/IT où vos données sont stockées.',
      },
    ],
  },
  
  // SECTION 4: DROITS DES PERSONNES (Q9-Q11)
  {
    id: 'q9',
    sectionId: 'rights',
    number: 9,
    question: 'Vos patients/clients signent-ils un document sur l\'utilisation de leurs données?',
    icon: 'Pen',
    tooltip: {
      title: 'Pourquoi c\'est important?',
      content: 'Vous devez informer explicitement chaque patient: quelles données vous collectez, pourquoi, qui y accède, combien de temps, quels sont leurs droits. Et obtenir leur consentement écrit.',
      risk: 'Sans consentement documenté, vous ne pouvez pas prouver que la personne était d\'accord. Le PFPDT ne l\'accepte pas.',
    },
    warningExample: 'Sans consentement documenté, vous ne pouvez pas prouver que la personne était d\'accord. Et ça, le PFPDT ne l\'accepte pas.',
    options: [
      {
        value: 'systematic',
        label: 'Oui, systématiquement dès le début',
        score: 0,
        feedback: { type: 'success', message: 'Conforme' },
        explanation: 'À chaque nouveau patient: document expliquant l\'usage des données, signature ou case cochée, document conservé comme preuve.',
      },
      {
        value: 'sometimes',
        label: 'Parfois, quand on y pense',
        score: 2,
        feedback: { type: 'warning', message: 'Lacune' },
        explanation: 'Impossible de prouver pour tous les patients. Implémenter systématiquement pour tous les types.',
      },
      {
        value: 'never',
        label: 'Non, jamais',
        score: 3,
        feedback: { type: 'danger', message: 'Violation grave' },
        explanation: 'Aucune preuve légale que le patient acceptait le traitement de ses données. PFPDT demande mise en conformité + notification rétroactive.',
      },
      {
        value: 'unknown_obligation',
        label: 'Je ne sais pas si c\'est obligatoire',
        score: 2,
        feedback: { type: 'warning', message: 'Urgent à clarifier' },
        explanation: 'Oui, c\'est obligatoire sous nLPD (Article 12). À implémenter immédiatement.',
      },
    ],
  },
  {
    id: 'q10',
    sectionId: 'rights',
    number: 10,
    question: 'Un patient/client demande ses données. Pouvez-vous les lui fournir en 48h?',
    icon: 'Clock',
    tooltip: {
      title: 'Pourquoi c\'est important?',
      content: 'Loi nLPD Article 23: Chaque personne a le droit de demander ses données et les recevoir sous 30 jours. 48h est un test de faisabilité réelle. Si vous ne pouvez pas, vous avez un problème de maîtrise.',
      risk: 'Délai légal nLPD: 30 jours. Mais 48h = test réaliste de maîtrise.',
    },
    warningExample: 'Délai légal nLPD: 30 jours. Mais 48h = test réaliste de maîtrise.',
    options: [
      {
        value: 'easily',
        label: 'Oui, facilement',
        score: 0,
        feedback: { type: 'success', message: 'Excellent' },
        explanation: 'Système organisé pour l\'accès rapide. Dossiers centralisés, processus clair, personnel formé.',
      },
      {
        value: 'several_days',
        label: 'Ça prendrait plusieurs jours',
        score: 1,
        feedback: { type: 'warning', message: 'Acceptable mais fragile' },
        explanation: 'Dossiers papier à numériser, systèmes multiples à combiner. Si demandes augmentent, vous saturez.',
      },
      {
        value: 'impossible',
        label: 'Compliqué, voire impossible',
        score: 3,
        feedback: { type: 'danger', message: 'Violation de droits' },
        explanation: 'Données trop dispersées. Impossible de répondre en délai légal. PFPDT demande mise en conformité urgent.',
      },
    ],
  },
  {
    id: 'q11',
    sectionId: 'rights',
    number: 11,
    question: 'Combien de temps conservez-vous les dossiers?',
    icon: 'Archive',
    tooltip: {
      title: 'Pourquoi c\'est important?',
      content: 'Dilemme: Trop court = violation légale. Trop long = violation nLPD. La nLPD demande: "Ne gardez que ce qui est nécessaire. Supprimez dès que le besoin est fini."',
      risk: 'Garder trop longtemps = violation nLPD. Détruire trop tôt = violation légale.',
    },
    warningExample: 'Garder trop longtemps = violation nLPD. Détruire trop tôt = violation légale.',
    options: [
      {
        value: 'legal_with_destruction',
        label: 'Durée légale respectée + destruction sécurisée',
        score: 0,
        feedback: { type: 'success', message: 'Conforme' },
        explanation: 'Vous connaissez la durée légale (10 ans pour données médicales), vous gardez jusqu\'à ce moment, puis destruction certifiée.',
      },
      {
        value: 'keep_everything',
        label: 'On garde tout, au cas où',
        score: 3,
        feedback: { type: 'danger', message: 'Violation nLPD' },
        explanation: 'Accumuler sans jamais supprimer viole le principe de minimisation. PFPDT demande nettoyage urgent.',
      },
      {
        value: 'unknown',
        label: 'Je ne sais pas',
        score: 2,
        feedback: { type: 'warning', message: 'Urgent à clarifier' },
        explanation: 'Pas de politique documentée. Définir durées légales + établir plan de suppression.',
      },
    ],
  },
  
  // SECTION 5: GESTION DES INCIDENTS (Q12-Q15)
  {
    id: 'q12',
    sectionId: 'incidents',
    number: 12,
    question: 'En cas de violation de données, savez-vous qui prévenir et dans quel délai?',
    icon: 'AlertTriangle',
    tooltip: {
      title: 'Pourquoi c\'est important?',
      content: 'Scénario: Ransomware attaque votre lab. Vous avez 72 heures pour détecter, évaluer, notifier le PFPDT et les patients. Passé 72h? Sanction pour non-notification tardive. CHF 250\'000 amende.',
      risk: '72h pour notifier le PFPDT. Après, c\'est trop tard.',
    },
    warningExample: '72h pour notifier le PFPDT. Après, c\'est trop tard.',
    options: [
      {
        value: 'clear_procedure',
        label: 'Oui, procédure claire (PFPDT sous 72h)',
        score: 0,
        feedback: { type: 'success', message: 'Conforme & préparé' },
        explanation: 'Incident response plan écrit: qui notifier, contacts, timeline, formulaire PFPDT, documentation.',
      },
      {
        value: 'should_search',
        label: 'Je devrais chercher',
        score: 2,
        feedback: { type: 'warning', message: 'Pas prêt' },
        explanation: 'Pas de procédure. En cas d\'incident réel, panique = erreurs. Erreurs = sanctions PFPDT. Urgent: développer procédure.',
      },
      {
        value: 'no_idea',
        label: 'Aucune idée',
        score: 3,
        feedback: { type: 'danger', message: 'Dangereux' },
        explanation: 'En cas de violation, vous seriez complètement perdus. Risque très élevé de non-notification. Créer incident response plan MAINTENANT.',
      },
    ],
  },
  {
    id: 'q13',
    sectionId: 'incidents',
    number: 13,
    question: 'Votre équipe connaît-elle les règles de base nLPD?',
    icon: 'GraduationCap',
    tooltip: {
      title: 'Pourquoi c\'est important?',
      content: 'Statistique PFPDT: 70% des violations sont dues à l\'erreur humaine, pas au hacking. Email envoyé au mauvais destinataire, dossier laissé ouvert, password sur post-it, clic sur phishing...',
      risk: 'Votre plus gros risque nLPD? Un collaborateur qui ne sait pas qu\'il fait une erreur.',
    },
    warningExample: 'Votre plus gros risque nLPD? Un collaborateur qui ne sait pas qu\'il fait une erreur.',
    options: [
      {
        value: 'regular_training',
        label: 'Formation régulière',
        score: 0,
        feedback: { type: 'success', message: 'Excellent' },
        explanation: 'Formation équipe régulière (annuel minimum): règles nLPD, risques, bonnes pratiques, procédures.',
      },
      {
        value: 'initial_only',
        label: 'Sensibilisation initiale uniquement',
        score: 2,
        feedback: { type: 'warning', message: 'Fragile' },
        explanation: 'Formation à l\'embauche, puis plus rien. Après 6 mois, la plupart oublient. Risque d\'erreur humaine.',
      },
      {
        value: 'never',
        label: 'Jamais formés',
        score: 3,
        feedback: { type: 'danger', message: 'Très risqué' },
        explanation: 'Équipe ne connaît pas les obligations nLPD. Violations accidentelles fréquentes, risque très élevé.',
      },
    ],
  },
  {
    id: 'q14',
    sectionId: 'incidents',
    number: 14,
    question: 'Qui est responsable de la protection des données chez vous?',
    icon: 'UserCheck',
    tooltip: {
      title: 'Pourquoi c\'est important?',
      content: 'Principe nLPD: Quelqu\'un doit être clairement responsable de la conformité. Si PFPDT audite et demande "Qui est responsable?" et que Directeur dit IT, IT dit Directeur... Non-conforme.',
      risk: 'Quand personne n\'est responsable, tout le monde est coupable. Surtout vous.',
    },
    warningExample: 'Quand personne n\'est responsable, tout le monde est coupable. Surtout vous.',
    options: [
      {
        value: 'designated',
        label: 'Une personne clairement désignée',
        score: 0,
        feedback: { type: 'success', message: 'Conforme' },
        explanation: 'Une personne nommée "Responsable Protection Données" avec formation, budget, autorité, et rôle reconnu.',
      },
      {
        value: 'distributed',
        label: 'C\'est réparti, mais pas formalisé',
        score: 2,
        feedback: { type: 'warning', message: 'Fragile' },
        explanation: 'Plusieurs personnes gèrent la sécurité mais pas de responsabilité claire. Trous et chevauchements possibles.',
      },
      {
        value: 'nobody',
        label: 'Personne en particulier',
        score: 3,
        feedback: { type: 'danger', message: 'Violation grave' },
        explanation: 'Aucune responsabilité assignée. Pas de suivi, pas d\'amélioration, pas de conformité. Assigner ASAP.',
      },
    ],
  },
  {
    id: 'q15',
    sectionId: 'incidents',
    number: 15,
    question: 'Collectez-vous uniquement les données dont vous avez vraiment besoin?',
    icon: 'Filter',
    tooltip: {
      title: 'Pourquoi c\'est important?',
      content: 'Principe nLPD fondamental: Data minimization. Collectez uniquement les données dont vous avez besoin réel. Plus vous collectez, plus vous vous exposez en cas de breach.',
      risk: 'Plus vous collectez, plus vous vous exposez.',
    },
    warningExample: 'Plus vous collectez, plus vous vous exposez.',
    options: [
      {
        value: 'essential_only',
        label: 'Oui, uniquement l\'essentiel',
        score: 0,
        feedback: { type: 'success', message: 'Conforme' },
        explanation: 'Documenté: pour chaque donnée, quelle est la raison de collecte? Vous ne collectez que ce qui passe ce test.',
      },
      {
        value: 'probably_too_much',
        label: 'Probablement trop, par habitude',
        score: 2,
        feedback: { type: 'warning', message: 'Exposition élevée' },
        explanation: 'Collecte "par habitude". Plus de données = plus de risque si breach. Audit de collecte recommandé.',
      },
      {
        value: 'never_thought',
        label: 'Je n\'y ai jamais réfléchi',
        score: 3,
        feedback: { type: 'danger', message: 'Opportunité manquée' },
        explanation: 'Collecte par inertie. Passer en revue chaque champ: "On utilise ça?" Supprimer l\'inutile.',
      },
    ],
  },
];

// Swiss Cantons for the form
export const swissCantons = [
  { value: 'AG', label: 'Argovie (AG)' },
  { value: 'AI', label: 'Appenzell Rhodes-Intérieures (AI)' },
  { value: 'AR', label: 'Appenzell Rhodes-Extérieures (AR)' },
  { value: 'BE', label: 'Berne (BE)' },
  { value: 'BL', label: 'Bâle-Campagne (BL)' },
  { value: 'BS', label: 'Bâle-Ville (BS)' },
  { value: 'FR', label: 'Fribourg (FR)' },
  { value: 'GE', label: 'Genève (GE)' },
  { value: 'GL', label: 'Glaris (GL)' },
  { value: 'GR', label: 'Grisons (GR)' },
  { value: 'JU', label: 'Jura (JU)' },
  { value: 'LU', label: 'Lucerne (LU)' },
  { value: 'NE', label: 'Neuchâtel (NE)' },
  { value: 'NW', label: 'Nidwald (NW)' },
  { value: 'OW', label: 'Obwald (OW)' },
  { value: 'SG', label: 'Saint-Gall (SG)' },
  { value: 'SH', label: 'Schaffhouse (SH)' },
  { value: 'SO', label: 'Soleure (SO)' },
  { value: 'SZ', label: 'Schwytz (SZ)' },
  { value: 'TG', label: 'Thurgovie (TG)' },
  { value: 'TI', label: 'Tessin (TI)' },
  { value: 'UR', label: 'Uri (UR)' },
  { value: 'VD', label: 'Vaud (VD)' },
  { value: 'VS', label: 'Valais (VS)' },
  { value: 'ZG', label: 'Zoug (ZG)' },
  { value: 'ZH', label: 'Zurich (ZH)' },
];

// Company size options
export const companySizes = [
  { value: '1-10', label: '1-10 employés' },
  { value: '11-25', label: '11-25 employés' },
  { value: '26-50', label: '26-50 employés' },
  { value: '51-100', label: '51-100 employés' },
  { value: '100+', label: 'Plus de 100 employés' },
];

// Industry options
export const industries = [
  { value: 'lab', label: 'Laboratoire' },
  { value: 'cabinet_medical', label: 'Cabinet médical' },
  { value: 'fiduciaire', label: 'Fiduciaire' },
  { value: 'autre', label: 'Autre' },
];

// Calculate score from answers
export function calculateScore(answers) {
  let totalScore = 0;
  let maxScore = 0;
  
  questions.forEach((question) => {
    const answer = answers[question.id];
    if (answer) {
      const selectedOption = question.options.find(opt => opt.value === answer);
      if (selectedOption) {
        totalScore += selectedOption.score;
      }
    }
    // Max score per question is 3
    maxScore += 3;
  });
  
  // Normalize to 0-10 scale (invert so lower is better)
  const normalizedScore = ((maxScore - totalScore) / maxScore) * 10;
  
  // Determine risk level
  let riskLevel = 'green';
  if (normalizedScore < 4) {
    riskLevel = 'red';
  } else if (normalizedScore < 7) {
    riskLevel = 'orange';
  }
  
  return {
    raw: totalScore,
    normalized: Math.round(normalizedScore * 10) / 10,
    riskLevel,
  };
}

// Get top priorities based on answers
export function getTopPriorities(answers) {
  const priorities = [];
  
  questions.forEach((question) => {
    const answer = answers[question.id];
    if (answer) {
      const selectedOption = question.options.find(opt => opt.value === answer);
      if (selectedOption && selectedOption.score >= 2) {
        priorities.push({
          question: question.question,
          section: sections.find(s => s.id === question.sectionId)?.title,
          score: selectedOption.score,
          feedback: selectedOption.feedback,
        });
      }
    }
  });
  
  // Sort by score (highest first) and return top 3
  return priorities.sort((a, b) => b.score - a.score).slice(0, 3);
}
