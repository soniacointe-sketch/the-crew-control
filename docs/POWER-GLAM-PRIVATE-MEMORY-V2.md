# Power & Glam Intelligence — mémoire privée V2

15 octobre 2026. La mémoire n'est pas stockée dans ce dépôt.

## Fonctionnement

Le module existant reçoit une mémoire éditoriale depuis `public.eloah_editorial_memory`, après vérification de la session fondatrice existante. La table comporte des fiches datées, des sources initiales, un niveau de confidentialité, un état activé/désactivé et une révision. La première base contient 36 fiches : 33 professionnelles/de référence et 3 repères personnels minimisés. Les contenus des fiches et leur import ne figurent dans aucun fichier du site.

L'accès anonyme à la table est révoqué. RLS est activé et forcé ; SELECT et UPDATE sont limités au propriétaire `auth.uid() = owner_id`. Le navigateur peut modifier seulement le titre, le corps et l'activation d'une fiche. Il ne peut ni changer son propriétaire ni insérer des fiches. Une correction utilise la révision précédente pour éviter un écrasement concurrent.

La mémoire est chargée dans l'onglet après connexion. Les repères personnels ne sont pas chargés sans option explicite. Aucun contenu n'est enregistré dans localStorage/sessionStorage par le nouveau module. Déconnexion et changement de compte effacent les fiches de l'écran. Les modèles reçoivent seulement les fiches sélectionnées et le message volontairement envoyé ; la passerelle IA et ses clés restent inchangées. Il ne s'agit pas d'un entraînement du modèle ou d'une synchronisation automatique de toutes les conversations ChatGPT.

Le classement utilise les fiches de base, les mots de la demande et l'univers choisi. Les fiches entières sont sélectionnées sous un budget de contexte ; ce n'est ni une recherche vectorielle ni un envoi de la totalité de la base à chaque requête. Les dates périssables sont marquées à revérifier. L'aperçu contient le texte exact envoyé. Les textes restent susceptibles de contenir des omissions ou des erreurs et sont modifiables par la fondatrice.

## Contrôles

42 assertions locales réussies : interface sur 320/390/768/1440 pixels, lecture sur consentement, séparation des repères personnels, aperçu exact, contexte borné, corrections, désactivation, déconnexion et indisponibilité. Données et services simulés, aucune requête IA réelle. Les scripts exécutés correspondaient aux blobs publiés, à un saut de ligne terminal près.

Dans Supabase, existence du compte destinataire, insertion et comptage, activation/forçage RLS, politiques et privilèges ont été inspectés. Le test SQL de changement de rôle a été bloqué par l'outil et n'a pas été exécuté. La lecture et la correction depuis une véritable session navigateur, puis une réponse effective d'un fournisseur IA, restent à confirmer par la fondatrice. Aucun jeton utilisateur n'a été fabriqué.

Le contrôle global Supabase comporte des avertissements préexistants hors du périmètre de cette mémoire ; ce travail ne certifie pas l'ensemble de la plateforme.

Contrôle statique : `python tests/power-glam-intelligence-check.py` (Python 3 et Node.js). Ce script ne relance pas la suite navigateur.

Les fichiers ELOAH 2040, les fiches métier, les comptes clientes et leurs autorisations existantes ne sont pas modifiés. La création de cette table isolée ne synchronise aucun document, email, contact, calendrier ou paiement.
