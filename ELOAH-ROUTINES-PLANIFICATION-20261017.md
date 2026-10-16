# ELOAH — Programmation réelle des routines (17 octobre 2026)

Les sept routines sont préparables manuellement. Un moteur de rappels internes a été installé dans Supabase.

**Programmation.** Le job `eloah-routines-5min` passe toutes les cinq minutes. Chaque routine reste désactivée tant que la fondatrice n'a pas enregistré une fréquence quotidienne ou hebdomadaire, choisi une heure, puis cliqué séparément sur « Activer ce rappel ». La semaine signifie le lundi, fuseau Europe/Paris. Le choix « Avant un rendez-vous » reste manuel.

**Boîte de réception privée.** La table `eloah_routine_runs` conserve une ligne unique par routine et créneau, avec un petit état des registres existants. RLS activée ; accès anonyme interdit ; le navigateur peut uniquement lire le contenu ou renseigner `seen_at`. Ces résultats ne sont pas des réponses produites par une IA et ne partent ni par mail ni en notification push.

**Nouvelles sources facultatives.** Les courriers déjà indexés dans `eloah_mail_items` peuvent enrichir le brief après choix explicite. La lecture de Google Agenda est possible via le jeton OAuth existant de ce navigateur, en cliquant sur « Lire Google Agenda », puis avec une deuxième case pour transmettre ces événements à l'IA. Cette lecture ne prouve pas que Gmail est synchronisé.

**Sécurité et tests.** Test du déclenchement SQL puis du refus d'un doublon, dans une transaction annulée ; contrôle des droits RLS et de l'absence de droit anonyme ou de modification de la charge utile ; vérification syntaxique JavaScript et présence des éléments de page. À vérifier sur mobile avec la véritable session : lecture des événements Google, sauvegarde des préférences, déclenchement à l'heure, ouverture des rappels.

**Limites.** Pas de push système, pas de veille web autonome, pas de trajet réel, pas d'automatisation Gmail/Telegram, et pas de garantie de récupération si le serveur rate un créneau pendant plus de deux heures. Aucune programmation personnelle n'a été activée d'office.
