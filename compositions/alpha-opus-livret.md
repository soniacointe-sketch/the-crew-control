# ALPHA OPUS — De la lettre à la voix
**ELOAH NUMERA × PARISIS ENGINE · 15 octobre 2026**

**Œuvre instrumentale originale générative en douze tableaux.**

[Ouvrir le lecteur interactif dans ELOAH](../eloah-alpha-opus.html) · [Partition numérique complète](eloah-alpha-opus-partition.json) · [Studio NUMERA](../eloah-numera.html)

## L'intention
Créer une expérience *à entendre*, à partir de tout ce que nous avons étudié dans la série ALPHA. Les textes antiques sont la matière de la composition ; **les notes, rythmes, gammes et timbres sont des choix artistiques contemporains**. Aucune fréquence utilisée ne prétend venir d'un rituel authentique de Marcus ou du Jésus historique.

## Les douze mouvements et leurs règles

| Tableau | Titre | Matériau de l'enquête | Transformation musicale créée |
|---|---|---|---|
| **I** | **Le Silence** | ALPHA-014, quatre émissions **4+4+10+12=30** | Quatre notes émergent après un silence initial, sur un tapis harmonique sombre. |
| **II** | **Le corps d'Alètheia** | ALPHA-010, **12 paires** ΑΩ…ΜΝ, 24 lettres | Douze interrogations en notes hautes et douze réponses plus graves, une par paire du corps. |
| **III** | **Les Éons** | ALPHA-016, trois classes **9, 8, 7** | Trois cellules rythmiques successives comportant 9, 8 puis 7 attaques. |
| **IV** | **Les Trois Ogdoades** | ALPHA-016, **8+8+8=24** | Trois périodes identiques de huit impulsions, avec un changement progressif de registre. |
| **V** | **La lettre qui engendre** | ALPHA-014, **Δ→ΔΕΛΤΑ**, noms des lettres | Motif original développé à partir des lettres du nom de Delta, jusqu'au deuxième niveau de la simulation. |
| **VI** | **Les Sept Cieux** | ALPHA-011, sept voyelles **Α Ε Η Ι Ο Υ Ω** | Sept notes ascendantes selon une gamme dorienne, avec des échos dans le grave. |
| **VII** | **La Colombe** | ALPHA-016, **ΑΩ = ΠΕΡΙΣΤΕΡΑ = 801** | Deux notes extrêmes et une mélodie pentatonique lumineuse. |
| **VIII** | **Le Nom** | ALPHA-017, **ΙΗΣΟΥΣ = 888**, 8+80+800 | Trois séries de huit notes et un motif de type fanfare. |
| **IX** | **La Vérité** | ALPHA-013, **ΑΛΗΘΕΙΑ = 64**, six régions du corps | Les sept lettres du mot forment une phrase plus fragile et expressive. |
| **X** | **L'Appel et la Réponse** | ALPHA-020, trois voix dans certaines formules de rédemption | Répliques mélodiques et réponses à l'octave ; **aucune formule rituelle ancienne enregistrée**. |
| **XI** | **Les Lettres de la Vérité** | ALPHA-018/019/021, témoins, reprises, écrits coptes de Nag Hammadi | Répétitions et échos représentant la transmission textuelle ; le nombre **21** sert de graine, **sans rétro-traduire les manuscrits coptes en grec**. |
| **XII** | **Une seule voix** | ALPHA-014, la réunion des voix autour de l'**Amen** | Une courte réponse de six notes, puis un accord harmonique et un retour au silence. |

## Composition et jouabilité
Le moteur [eloah-alpha-oratorio-engine.js](../eloah-alpha-oratorio-engine.js) utilise réellement :
- les douze couples documentaires fournis par **PARISIS_ALPHA_READER** ;
- la distinction rang / valeur et le développement de Δ dans **PARISIS_ALPHA_MARCUS** ;
- la classification **9 / 8 / 7**, les trois Ogdoades, la colombe **801** et le nom de Jésus **888**, issus de **PARISIS_ALPHA_CHAINE** ;
- les extraits évangéliques indexés dans **PARISIS_ALPHA_PAROLES** ;
- la composition et la synthèse **ELOAH_NUMERA_ENGINE + ELOAH_NUMERA_AUDIO**.

Le programme assemble les 12 scènes en une seule partition, avec début et fin mesurés, notes, rythmes et accords. Il permet d'écouter toute l'œuvre ou chacun des tableaux, de modifier **tempo, tonalité, densité, percussion et harmonies**, puis d'exporter WAV, MIDI, JSON ou PNG.

**Format essentiel :** 12 tableaux × 2 mesures = 24 mesures ; tempo initial 106 BPM ; environ **54,3 secondes** pour la partition synthétisée avant la queue de réverbération.

**Format développé :** 12 tableaux × 4 mesures = 48 mesures ; au même tempo, environ **108,7 secondes**.

La [partition initiale enregistrée](eloah-alpha-opus-partition.json) fournit les événements MIDI et la provenance des motifs. Le fichier permet de reproduire et d'auditer la création, et ne contient aucune donnée de compte ELOAH.

## À propos du mix d'écoute
Une pré-écoute stéréo a également été rendue et remise directement dans la conversation ChatGPT sous forme de **MP3 et WAV**. Elle suit la même structure narrative et les mêmes chiffres que l'œuvre du site, mais utilise un moteur de mixage hors navigateur ; **elle n'est pas un rendu bit-à-bit identique** au synthétiseur Web Audio du site.

## Attribution et précautions historiques
1. La méthode des lettres et le corps de la Vérité sont principalement connus par **Irénée de Lyon**, adversaire de Marcus.
2. Les énoncés **801, 888, 24, 30** sont des données numériques ou des associations rapportées ; **leur passage à la musique est une convention créative nouvelle**.
3. Les sept cieux ne fournissent pas de fréquences acoustiques mesurables dans ces sources.
4. Les **Évangiles grecs** et les **codices coptes** ne deviennent pas des partitions antiques par substitution automatique.
5. Les études sur l'initiation, le Nom et la chambre nuptiale ont donné une **inspiration dramaturgique**, non des paroles sacrées reconstruites.

### Références historiques
- [Irénée, *Contre les hérésies* I,14](https://www.newadvent.org/fathers/0103114.htm)
- [Irénée I,15](https://www.newadvent.org/fathers/0103115.htm)
- [Irénée I,21](https://www.newadvent.org/fathers/0103121.htm)
- [Gospel of Truth, Nag Hammadi I,3](https://www.gospels.net/truth)
- [Gospel of Philip, Nag Hammadi II,3](https://www.gospels.net/philip)
- [Dossiers PARISIS ENGINE ALPHA-010 à ALPHA-021](../eloah-parisis.html)

**Édition :** œuvre créée dans ELOAH NUMERA, préservant les enquêtes précédentes et tous les espaces personnels. Aucun accès client ou secret n'est utilisé pour composer.
