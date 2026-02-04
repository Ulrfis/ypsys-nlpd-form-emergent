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
      risk: 'Lors d\'un audit de votre structure, si l\'auditeur constate que « toute l\'équipe peut tout voir », c\'est une non-conformité critique.',
    },
    warningExample: 'Un collaborateur parti depuis 6 mois avec encore des accès actifs = non-conformité LPD.',
    options: [
      {
        value: 'everyone',
        label: 'Toute l\'équipe peut tout voir',
        score: 3,
        feedback: { type: 'danger', message: 'Violation nLPD grave' },
        explanation: 'La réceptionniste accède aux dossiers patients. Le comptable aux données sensibles. C\'est un risque de sanction immédiat.',
      },
      {
        value: 'no_control',
        label: 'Je ne contrôle pas vraiment',
        score: 2,
        feedback: { type: 'warning', message: 'Point à améliorer rapidement' },
        explanation: 'Honnête, mais problématique. Tout le monde a accès aux données sensibles patients/clients. Classique quand une structure grandit sans jamais formaliser les droits.',
      },
      {
        value: 'controlled',
        label: 'Seules les personnes autorisées',
        score: 0,
        feedback: { type: 'success', message: 'Vous maîtrisez cet aspect' },
        explanation: 'C\'est la réponse conforme. Vous avez une liste à jour des rôles + accès, et vous pouvez prouver qui a accès à quoi.',
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
        value: 'none',
        label: 'Non, aucune trace',
        score: 3,
        feedback: { type: 'danger', message: 'Violation critique' },
        explanation: 'Comment prouvez-vous qu\'une violation n\'a pas eu lieu?',
      },
      {
        value: 'partial',
        label: 'Partiellement',
        score: 2,
        feedback: { type: 'warning', message: 'Lacune à combler' },
        explanation: 'Logs pour certaines actions mais pas toutes = scepticisme sur votre contrôle réel.',
      },
      {
        value: 'complete',
        label: 'Oui, j\'ai un historique complet',
        score: 0,
        feedback: { type: 'success', message: 'Conforme & rassurant' },
        explanation: 'Votre système enregistre qui, quand, quoi pour chaque consultation. En cas d\'audit ou réclamation, vous avez des preuves.',
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
      content: 'Un dossier client ou patient est consulté sur un mobile personnel non chiffré. Le lendemain, le téléphone est perdu au café. Les données sont accessibles. Qui est responsable? Vous.',
      risk: 'Données professionnelles sur smartphone personnel non sécurisé = faille nLPD garantie',
    },
    warningExample: 'Données professionnelles sur smartphone personnel non sécurisé = faille nLPD garantie',
    options: [
      {
        value: 'no_framework',
        label: 'Oui, sans cadre précis',
        score: 3,
        feedback: { type: 'danger', message: 'Risque critique identifié' },
        explanation: 'Une simple perte/vol d\'appareil = données clients/patients exposées.',
      },
      {
        value: 'with_rules',
        label: 'Oui, avec règles strictes et sécurité renforcée',
        score: 1,
        feedback: { type: 'warning', message: 'Acceptable mais fragile' },
        explanation: 'Les règles doivent être appliquées ET auditées. Sinon c\'est juste du papier.',
      },
      {
        value: 'professional_only',
        label: 'Non, uniquement matériel professionnel sécurisé',
        score: 0,
        feedback: { type: 'success', message: 'Conforme & sécurisé' },
        explanation: 'Les données sensibles ne sont accessibles que depuis des appareils professionnels chiffrés, avec mot de passe fort et mises à jour de sécurité.',
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
      content: 'Vous ou un collaborateur perdez un PC ou un téléphone professionnel voire personnel sur lequel des données sensibles (fichiers clients, accès internes, etc.) ne sont pas chiffrées.',
      risk: 'Avec chiffrement, le même laptop volé aurait été complètement inutilisable. Juste un morceau de plastique.',
    },
    warningExample: 'Un laptop volé avec données lisibles = amende + perte de crédibilité.',
    options: [
      {
        value: 'readable',
        label: 'Oui, lisibles directement',
        score: 3,
        feedback: { type: 'danger', message: 'Violation grave' },
        explanation: 'Quelqu\'un qui prend votre laptop peut accéder directement aux fichiers. Une simple perte = non conformité sur le stockage des données',
      },
      {
        value: 'unknown',
        label: 'Je ne sais pas',
        score: 2,
        feedback: { type: 'warning', message: 'Urgent à vérifier' },
        explanation: 'Demandez à votre IT ou à Ypsys de vérifier immédiatement l\'état d\'activation du chiffrement. Point de vigilance: gardez bien vos PC professionnels dans leur environnement de travail',
      },
      {
        value: 'protected',
        label: 'Protégées',
        score: 0,
        feedback: { type: 'success', message: 'Conforme & protégé' },
        explanation: 'Cryptage des données activées sur le disque',
      },
    ],
  },
  {
    id: 'q5',
    sectionId: 'protection',
    number: 5,
    question: 'Comment est organisée la sauvegarde des données sensibles?',
    icon: 'HardDrive',
    tooltip: {
      title: 'Pourquoi c\'est important?',
      content: '60% des entreprises qui ont une sauvegarde ne l\'ont jamais testée. Quand une vraie catastrophe arrive (ransomware), ils découvrent que la sauvegarde est corrompue et accessible par le hacker. Résultat: perte totale des données.',
      risk: 'Une sauvegarde non testée c\'est comme jouer à la roulette russe',
    },
    warningExample: 'Votre sauvegarde doit être organisée pour respecter les règles de la nLPD.',
    options: [
      {
        value: 'no_backup',
        label: 'Je ne sais pas',
        score: 3,
        feedback: { type: 'danger', message: 'Violation critique' },
        explanation: 'Si vos données sont perdues (ransomware, incendie, vol), elles sont définitivement perdues.',
      },
      {
        value: 'never_tested',
        label: 'Jamais testées',
        score: 2,
        feedback: { type: 'danger', message: 'Très risqué' },
        explanation: '70% des premières restaurations révèlent des problèmes. En cas de cyberattaque, vos données risquent d\'être irrécupérables.',
      },
      {
        value: 'tested_yearly',
        label: 'Testées une fois par an',
        score: 1,
        feedback: { type: 'warning', message: 'Acceptable, mais risqué' },
        explanation: 'La sauvegarde de vos données sensibles peut être cassée sans que vous ne le sachiez.',
      },
      {
        value: 'tested_quarterly',
        label: 'Organisées et testées tous les 3 mois',
        score: 0,
        feedback: { type: 'success', message: 'Excellent' },
        explanation: 'Votre sauvegarde est organisée et testée, vous respectez donc la conformité nLPD.',
      },
    ],
  },
  {
    id: 'q6',
    sectionId: 'protection',
    number: 6,
    question: 'Avez-vous un document listant les accès à quoi et comment ?',
    icon: 'FileText',
    tooltip: {
      title: 'Pourquoi c\'est important?',
      content: 'En cas d\'audit, vous devez montrer votre politique d\'accès aux données et la documenter.',
      risk: 'Sans documentation, impossible de prouver votre conformité lors d\'un audit.',
    },
    warningExample: 'Sans documentation, impossible de prouver votre conformité lors d\'un audit.',
    options: [
      {
        value: 'none',
        label: 'Non, rien d\'écrit',
        score: 3,
        feedback: { type: 'danger', message: 'Violation grave' },
        explanation: 'Gestion des accès "par habitude". Impossible de prouver la conformité.',
      },
      {
        value: 'partial',
        label: 'Partiellement',
        score: 2,
        feedback: { type: 'warning', message: 'Lacune' },
        explanation: 'Un début de document existe, mais il est incomplet, vague ou informel',
      },
      {
        value: 'documented',
        label: 'Oui, document à jour',
        score: 0,
        feedback: { type: 'success', message: 'Conforme' },
        explanation: 'Matrice d\'accès documentée avec liste des rôles, données accessibles par rôle, conditions d\'accès.',
      },
    ],
  },
  
  // SECTION 3: SOUS-TRAITANTS (Q7-Q8)
  {
    id: 'q7',
    sectionId: 'subcontractors',
    number: 7,
    question: 'Vos prestataires (cloud, logiciels, hébergeurs, société informatique) sont-ils conformes à la nLPD ?',
    icon: 'Link',
    tooltip: {
      title: 'Pourquoi c\'est important?',
      content: 'Règle d\'or nLPD: Vous êtes responsable de ce que font vos sous-traitants avec vos données. Si votre prestataire se fait hacker, c\'est VOTRE responsabilité de notifier le PFPDT et les patients.',
      risk: 'Leur faille = votre responsabilité.',
    },
    warningExample: 'Leur faille = votre responsabilité.',
    options: [
      {
        value: 'unknown',
        label: 'Je ne sais pas',
        score: 3,
        feedback: { type: 'danger', message: 'Dangereux' },
        explanation: 'Vous ne savez même pas qui a accès à vos données sensibles. Il faut agir rapidement',
      },
      {
        value: 'trust',
        label: 'Je leur fais confiance',
        score: 2,
        feedback: { type: 'warning', message: 'Juridiquement insuffisant' },
        explanation: 'La confiance ≠ protection légale. En cas de problème, vous avez zéro recours.',
      },
      {
        value: 'contract_signed',
        label: 'Oui, avec contrat signé',
        score: 0,
        feedback: { type: 'success', message: 'Conforme' },
        explanation: 'Chaque fournisseur critique a signé un accord stipulant le respect de la nLPD',
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
      content: 'Vos données sensibles doivent être stockées en Suisse, voire UE (si elles respectent les règles définies par la nLPD).',
      risk: 'Données hors Suisse/UE = obligations nLPD non-respectées',
    },
    warningExample: 'Données hors Suisse/UE = obligations nLPD non-respectées',
    options: [
      {
        value: 'unknown',
        label: 'Aucune idée',
        score: 3,
        feedback: { type: 'danger', message: 'Très dangereux' },
        explanation: 'Urgent: vérifier où sont stockées vos données sensibles',
      },
      {
        value: 'outside_europe',
        label: 'Hors Europe',
        score: 3,
        feedback: { type: 'danger', message: 'Compliqué légalement' },
        explanation: 'Il faut rapatrier vos données sensibles',
      },
      {
        value: 'europe',
        label: 'En Europe',
        score: 1,
        feedback: { type: 'warning', message: 'Acceptable' },
        explanation: 'Légalement acceptable sous les règles nLPD. Pour le secteur financier, la FINMA impose des exigences strictes pour la gestion des données sensibles en Europe. Et certaines données peuvent nécessiter un stockage exclusif en Suisse.',
      },
      {
        value: 'switzerland',
        label: 'En Suisse',
        score: 0,
        feedback: { type: 'success', message: 'Optimal' },
        explanation: 'Maximum de conformité nLPD. Zéro complications légales. Droit suisse s\'applique complètement si la sauvegarde et le stockage répond aux normes nLPD',
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
      content: 'Vous devez informer vos patients/clients sur les données collectées, le but du traitement, la durée de conservation et quels sont leurs droits de modification.',
      risk: 'Sans consentement documenté, vous ne pouvez pas prouver que la personne était d\'accord.',
    },
    warningExample: 'Sans consentement documenté, vous ne pouvez pas prouver que la personne était d\'accord.',
    options: [
      {
        value: 'never',
        label: 'Non, jamais',
        score: 3,
        feedback: { type: 'danger', message: 'Violation grave' },
        explanation: 'Aucune preuve légale que le patient acceptait le traitement de ses données. Il est impératif de vous mettre en conformité et de façon rétroactive.',
      },
      {
        value: 'sometimes',
        label: 'Parfois, quand on y pense',
        score: 2,
        feedback: { type: 'warning', message: 'Lacune' },
        explanation: 'Impossible de prouver pour tous les patients/clients. Implémenter systématiquement pour tous les types.',
      },
      {
        value: 'systematic',
        label: 'Oui, systématiquement dès le début',
        score: 0,
        feedback: { type: 'success', message: 'Conforme' },
        explanation: 'À chaque nouveau patient/client: document expliquant l\'usage des données, signature ou case cochée, document conservé comme preuve.',
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
        value: 'impossible',
        label: 'Compliqué, voire impossible',
        score: 3,
        feedback: { type: 'danger', message: 'Violation de droits' },
        explanation: 'Données trop dispersées. Impossible de répondre en délai légal. Besoin de mise en conformité urgente.',
      },
      {
        value: 'several_days',
        label: 'Ça prendrait plusieurs jours',
        score: 1,
        feedback: { type: 'warning', message: 'Acceptable mais fragile' },
        explanation: 'Dossiers papier à numériser, systèmes multiples à combiner. Si demandes augmentent, vous saturez.',
      },
      {
        value: 'easily',
        label: 'Oui, facilement',
        score: 0,
        feedback: { type: 'success', message: 'Excellent' },
        explanation: 'Système organisé pour l\'accès rapide. Dossiers centralisés, processus clair, personnel formé.',
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
      content: 'Trop court = violation légale. Trop long = violation nLPD. Ne gardez que les données utiles et supprimez-les dès qu\'elles ne servent plus.',
      risk: 'Ne gardez que les données utiles et supprimez-les dès qu\'elles ne servent plus.',
    },
    warningExample: 'Ne gardez que les données utiles et supprimez-les dès qu\'elles ne servent plus.',
    options: [
      {
        value: 'keep_everything',
        label: 'On garde tout',
        score: 3,
        feedback: { type: 'danger', message: 'Violation nLPD' },
        explanation: 'Accumuler sans jamais supprimer viole le principe de minimisation et de durée.',
      },
      {
        value: 'unknown',
        label: 'Je ne sais pas',
        score: 2,
        feedback: { type: 'warning', message: 'Urgent à clarifier' },
        explanation: 'Pas de suivi. Obligation de mise en place d\'un plan de suppression.',
      },
      {
        value: 'legal_with_destruction',
        label: 'Durée légale respectée + destruction sécurisée',
        score: 0,
        feedback: { type: 'success', message: 'Conforme' },
        explanation: 'Vous connaissez la durée légale, vous gardez jusqu\'à ce moment puis destruction certifiée.',
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
      content: 'Attaque d\'un ransomware, vous avez 72 heures pour détecter, évaluer, notifier le service administratif compétent, les patients/clients. Passé 72h = sanction pour non-notification tardive.',
      risk: '72h pour notifier, après c\'est trop tard.',
    },
    warningExample: '72h pour notifier, après c\'est trop tard.',
    options: [
      {
        value: 'no_idea',
        label: 'Aucune idée',
        score: 3,
        feedback: { type: 'danger', message: 'Dangereux' },
        explanation: 'En cas de violation, vous seriez complètement perdus. Risque très élevé de non-notification. Créer incident response plan MAINTENANT.',
      },
      {
        value: 'should_search',
        label: 'Je trouverai le moment venu',
        score: 2,
        feedback: { type: 'warning', message: 'Pas prêt' },
        explanation: 'Vous avez uniquement 72h pour réaliser l\'ensemble des déclaratifs. Risque d\'erreurs sanctionnables pour non-respect de la nLPD.',
      },
      {
        value: 'clear_procedure',
        label: 'Oui, procédure claire',
        score: 0,
        feedback: { type: 'success', message: 'Conforme & préparé' },
        explanation: 'Plan de réponse d\'incident défini et écrit: qui notifier, contacts, timeline, formulaire PFPDT, documentation.',
      },
    ],
  },
  {
    id: 'q13',
    sectionId: 'incidents',
    number: 13,
    question: 'Votre équipe est-elle sensibilisée aux risques de cyberattaque ?',
    icon: 'GraduationCap',
    tooltip: {
      title: 'Pourquoi c\'est important?',
      content: 'Statistique PFPDT: 70% des violations sont dues à l\'erreur humaine, pas au hacking. Email envoyé au mauvais destinataire, dossier laissé ouvert, password sur post-it, clic sur phishing...',
      risk: 'Votre plus gros risque nLPD? Un collaborateur qui ne sait pas qu\'il fait une erreur.',
    },
    warningExample: 'Votre plus gros risque nLPD? Un collaborateur qui ne sait pas qu\'il fait une erreur.',
    options: [
      {
        value: 'never',
        label: 'Jamais formés',
        score: 3,
        feedback: { type: 'danger', message: 'Très risqué' },
        explanation: 'Équipe ne connaît pas les risques de cyberattaque. Erreur = risque d\'attaque = risque de piratage des données sensibles.',
      },
      {
        value: 'initial_only',
        label: 'Sensibilisation initiale uniquement',
        score: 2,
        feedback: { type: 'warning', message: 'Fragile' },
        explanation: 'Formation à l\'embauche, puis plus rien. Après 6 mois, la plupart oublient. Risque d\'erreur humaine.',
      },
      {
        value: 'regular_training',
        label: 'Formation régulière',
        score: 0,
        feedback: { type: 'success', message: 'Excellent' },
        explanation: 'Formation équipe régulière (annuel minimum): risques, bonnes pratiques, procédures.',
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
      content: 'Principe nLPD: Quelqu\'un doit être clairement responsable de la conformité, sauf le Directeur IT.',
      risk: 'Quand personne n\'est responsable, vous êtes coupable.',
    },
    warningExample: 'Quand personne n\'est responsable, vous êtes coupable.',
    options: [
      {
        value: 'nobody',
        label: 'Aucune personne en particulier',
        score: 3,
        feedback: { type: 'danger', message: 'Violation grave' },
        explanation: 'Aucune responsabilité assignée. Pas de suivi, pas d\'amélioration, pas de conformité.',
      },
      {
        value: 'designated',
        label: 'Une personne clairement désignée',
        score: 0,
        feedback: { type: 'success', message: 'Conforme' },
        explanation: 'Une personne nommée "Responsable Protection Données" avec formation, budget, autorité',
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
      content: 'Principe nLPD fondamental: Data minimization. Collectez uniquement les données dont vous avez besoin',
      risk: 'Collectez uniquement les données nécessaires.',
    },
    warningExample: 'Collectez uniquement les données nécessaires.',
    options: [
      {
        value: 'never_thought',
        label: 'Je n\'y ai jamais réfléchi',
        score: 3,
        feedback: { type: 'danger', message: 'Opportunité manquée' },
        explanation: 'Collecte par inertie. Passer en revue chaque champ: "On utilise ça?" Supprimer l\'inutile.',
      },
      {
        value: 'probably_too_much',
        label: 'Probablement trop, par habitude',
        score: 2,
        feedback: { type: 'warning', message: 'Exposition élevée' },
        explanation: 'Collecte "par habitude". Plus de données = plus de risque de principe nLPD',
      },
      {
        value: 'essential_only',
        label: 'Oui, uniquement l\'essentiel',
        score: 0,
        feedback: { type: 'success', message: 'Conforme' },
        explanation: 'Documenté: pour chaque donnée, quelle est la raison de collecte? Vous ne collectez que le nécessaire.',
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
