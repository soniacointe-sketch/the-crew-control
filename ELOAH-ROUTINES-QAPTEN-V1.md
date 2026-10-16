# ELOAH — Sept routines professionnelles · 16 octobre 2026

## Objectif
Créer une bibliothèque de sept routines inspirées des fonctions d'assistant personnel décrites par Qapten, sans copier les promesses de connexions ou d'autonomie non vérifiées.

## Accès
- https://soniacointe-sketch.github.io/the-crew-control/eloah-routines.html
- ELOAH 2040 : navigation « Mes routines ».
- ELOAH Passerelles : carte « Routines · 7 compétences ».
- Routeur ELOAH Intelligence : « Mes 7 routines ELOAH ».

## Fonctions livrées
1. 📋 Messages et tâches prioritaires.
2. ⚠️ Priorité du jour.
3. 🗓️ Préparation des rendez-vous.
4. 🗓️ Bilan hebdomadaire.
5. ✉️ E-mails prioritaires.
6. 🔔 Sujets d'actualité à surveiller.
7. 🛫 Heure théorique de départ, calculée à partir des durées saisies.

Chaque fiche peut être sélectionnée et copiée sous forme de consigne réutilisable. L'atelier permet de produire un brief, de l'enrichir de notes manuelles, puis de le copier ou de le transmettre volontairement à l'interface ELOAH Intelligence. **La transmission préremplit la demande ; elle ne l'envoie pas.**

## Sources disponibles
- Avec une session fondatrice vérifiée : lecture des tâches SONIA OS, missions SONIA OS et rendez-vous ELOAH, uniquement si la fondatrice coche leur inclusion dans le brief.
- Aucun contenu Gmail ou Google Agenda externe n'est lu par cette page. Les statuts déclarés dans un registre SONIA OS ne prouvent pas une connexion valide.
- Aucune recherche web ou donnée de circulation en direct n'est obtenue ici.
- Le calcul de départ se fonde uniquement sur l'horaire du rendez-vous et les durées saisies ; le résultat est théorique.

## Préférences et planification
- Table Supabase : `public.eloah_routine_settings`, clé par compte et routine.
- Enregistre la cadence **souhaitée**, l'heure optionnelle et les sujets de veille optionnels.
- RLS activé, accès anonyme refusé, lecture et écriture autorisées uniquement à la session fondatrice.
- **Aucun scheduler automatique n'est activé** par la sauvegarde de ces préférences. Les notifications récurrentes et les exécutions autonomes exigent un processus serveur distinct, des autorisations vérifiées et des tests.

## Sécurité
- Les messages, notes ou informations du brief restent dans le navigateur jusqu'à une action explicite de transmission.
- Le transfert du brief à ELOAH Intelligence utilise une entrée `sessionStorage` courte (moins de dix minutes) supprimée dès sa lecture. Le formulaire IA reste à confirmer manuellement.
- La mémoire cloud ELOAH par univers reste indépendante ; le brief n'est pas automatiquement stocké en mémoire.
- Ne pas mettre de secrets, mots de passe ou données sur des tiers dans les consignes.
- Le simple fait d'enregistrer une préférence ne lance aucune routine.

## Tests réalisés
- Syntaxe de `eloah-routines.js`, `eloah-routines-catalogue.js` et `eloah-2040-ai.js` vérifiée.
- Les 23 identifiants DOM utilisés par les routines sont présents dans le HTML.
- Catalogue contenant sept routines distinctes.
- Contrôles de sécurité Supabase : RLS actif, quatre politiques, aucun SELECT anonyme.
- Essai de préférence cloud effectuée dans une transaction SQL ensuite annulée : aucune préférence fictive conservée.
- Workflow GitHub ELOAH UI quality : réussite sur la version qui intègre le JavaScript des routines.
- À tester sur appareils réels : parcours ELOAH Fondatrice, navigation mobile 320/390 px, connexion/auth et copie via presse-papiers.

## Limites restantes
À développer et tester séparément : gestion de véritables schedules, lecture Gmail autorisée depuis l'application ELOAH, calendrier Google synchronisé, calcul de trajet avec source cartographique, veille web programmée, bot Telegram personnel. Ne pas afficher ces fonctions comme activées avant validation.
