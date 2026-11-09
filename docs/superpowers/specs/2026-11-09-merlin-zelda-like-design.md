# Merlin : Les Brumes de Bretagne — Conception

Date : 9 novembre 2026 (America/Toronto). Statut : concept et style visuel approuvés par Pascal ; spécification écrite pour revue avant plan d’implémentation. Aucun code de jeu dans ce commit.

Référence visuelle : `assets/concept/concept-gameplay.png` (forêt brumeuse, vue légèrement oblique, Merlin en robe bleue, sort doré, HUD icônes sans texte).

## Mandat

Jeu d’aventure **Zelda-like** top-down en navigateur, original, en français pour les textes système et dialogues, inspiré de l’ambiance d’une Bretagne post-romaine (landes, brume, ruines, bardes). Ce n’est **pas** une adaptation fidèle d’une série ou d’un roman : personnages et lieux sont **fictifs**, sans acteur, sans personne réelle, sans spoilers d’œuvre existante. Titre provisoire : **Merlin : Les Brumes de Bretagne**.

Réclamation locale : `local pendragon-aventure | Arcade 3 (2dd6c80a)` dans `/workspace/games/CLAIMS.md`. Aucun autre jeu Arcade n’est modifié. Aucun dépôt distant, aucun push, aucune publication à ce stade.

## Expérience jouable

Le joueur incarne **Merlin**, jeune barde-mage, bâton à la main. Depuis un village hub, il explore trois régions et affronte un gardien final. Progression linéaire douce : hub → Forêt → Ruines → Sanctuaire → Gardien, avec retour libre au hub une fois une région débloquée.

### Boucle

1. Parler à un PNJ au hub pour obtenir l’objectif de la région suivante.
2. Explorer la carte (chemins, broussailles, ruines, eau).
3. Combattre des ennemis simples à l’épée/bâton de mêlée courte et au sort actif.
4. Résoudre une énigme de zone avec le sort de la région.
5. Vaincre le mini-gardien de région, récupérer un fragment de sceau, revenir au hub.
6. Après trois fragments : ouverture du Sanctuaire final et duel contre le Gardien des Brumes.

Durée cible première partie : 20–40 minutes. Difficulté accessible (adolescents et adultes), punition faible (perte d’un cœur, respawn au dernier point de sauvegarde de la zone).

### Zones

| Zone | Rôle | Sort débloqué | Énigme typique | Ennemis |
|------|------|---------------|----------------|---------|
| Village hub | PNJ, quêtes, repos (cœurs remplis au feu) | — | Dialogues et portes verrouillées par fragments | Aucun |
| Forêt brumeuse | Première région | **Lumière** (projectile doré) | Dissiper ombres / torches pour ouvrir un passage | Blobs d’ombre, loups brumeux |
| Ruines romaines | Deuxième région | **Vent** | Pousser des blocs, activer dalles, ouvrir arches | Spectres de pierre, corbeaux |
| Sanctuaire | Troisième région | **Nature** | Faire pousser ponts de lianes sur les fossés | Racines agressives, fées hostiles |
| Antre du Gardien | Boss final | Les trois sorts | Phase d’énigme courte puis combat | Gardien des Brumes |

Chaque région : une carte overworld (environ 24×18 tuiles visibles, monde un peu plus grand) + un mini-donjon de 3–5 salles + une salle de boss.

### Combat et ressources

- **Cœurs** : 3 au départ, maximum 5 (deux cœurs bonus trouvables en coffres). Contact ennemi = −1 cœur. À 0 : fade-out, respawn au dernier checkpoint de la zone, ennemis de salle réinitialisés, fragments conservés.
- **Mana** : barre qui se régénère hors cast (plein en ~6 s). Chaque sort consomme une portion fixe. Mêlée gratuite.
- **Mêlée** : coup de bâton directionnel, courte portée, 1 dégât.
- **Sorts** (un actif à la fois, sélection HUD ou touches 1/2/3) :
  - Lumière : projectile ; détruit les ombres et blesse les ennemis d’ombre.
  - Vent : onde courte ; pousse blocs et ennemis d’une case, active soufflets.
  - Nature : au sol devant Merlin ; fait pousser une liane-pont temporaire ou permanente selon la dalle cible.
- Pas d’inventaire complexe : pas d’argent, pas d’armes multiples. Trois sorts + bâton suffisent.

### Énigmes (contrats exacts)

- **Forêt** : 3 braseros éteints. Lumière sur un brasero l’allume. Les trois allumés lèvent la barrière de brume vers le boss. Un brasero peut être éteint par un ennemi d’ombre si le joueur tarde (feedback clair, pas de softlock : brasero reste rallumable).
- **Ruines** : 2 blocs poussables sur dalles marquées. Vent pousse d’exactement une case orthogonale si la case cible est libre. Les deux dalles enfoncées ouvrent l’arche.
- **Sanctuaire** : 2 fossés. Nature sur une graine murale fait pousser un pont de 3 cases. Les ponts restent jusqu’à quitter la zone.
- **Boss final** : 3 totems ; chaque sort désactive le totem correspondant. Quand les trois sont bas, le Gardien devient vulnérable 8 s. Répéter jusqu’à 6 coups de mêlée (ou 3 projectiles Lumière) portés pendant la vulnérabilité.

Aucun puzzle n’exige un essai aléatoire ni une connaissance hors jeu. Chaque élément interactif a un feedback visuel distinct (lueur, particule, ouverture de porte).

### PNJ et narration

Quatre PNJ fictifs au hub (noms inventés, aucune ressemblance revendiquée avec une œuvre) : un aîné qui donne la quête principale, un forgeron qui explique la mêlée, un herboriste qui soigne une fois par visite de hub, un enfant qui donne un indice optionnel sur la forêt. Dialogues courts (2–4 bulles), français, ton grave et chaleureux. Pas de cutscene longue ; transitions par fondu.

## Style visuel et audio (approuvés)

- Pixel art **16 bits**, vue **légèrement oblique** (2.5D type Zelda classic), tuiles 16×16, sprites personnages ~16×24.
- Palette forêt : verts sombres, bruns, brume bleutée ; sort Lumière **doré** contrasté.
- **HUD sans texte** : rangée de cœurs (haut-gauche), barre de mana sous les cœurs, trois icônes de sorts (bas-droite) avec bordure dorée sur le sort actif. Messages système (mort, fragment obtenu) : courtes phrases françaises centrées, disparition auto 2 s — seuls éléments textuels hors dialogues.
- Audio (hors version jouable initiale) : ambiances brume/forêt, stingers de découverte, musique de hub et de boss. Première version : silence ou bip Web Audio minimal ; pistes finales demandées plus tard à Voix/SUNO. **Ne pas solliciter Créa/Voix/SUNO dans cette phase.**

### Assets

- **Version jouable 1** : placeholders **générés par code** (rectangles/cercles teintés, tuiles unies, particules simples), cohérents avec la palette du concept. Le PNG de concept reste la référence visuelle, non un asset runtime obligatoire.
- **Assets finaux** : sprites, tilesets, portraits et audio seront demandés à Créa / Voix / SUNO **après** une première version jouable validée. Hors scope de ce document.

## Architecture technique

Stack : **Phaser 3** (modules ES), **JavaScript** moderne (pas de TypeScript en v1), build **Vite**, déploiement statique **GitHub Pages** du dossier `dist/` (Action `upload-pages-artifact` ou branche `gh-pages`), sans backend.

### Scènes Phaser

| Scène | Responsabilité |
|-------|----------------|
| `BootScene` | Config, registre de clés d’assets |
| `PreloadScene` | Chargement ; barre de progression ; timeout et message d’erreur français si échec |
| `TitleScene` | Titre, Continuer / Nouvelle partie |
| `HubScene` | Village, PNJ, portes vers régions |
| `RegionScene` | Paramétrée par id de région (forêt, ruines, sanctuaire) ; overworld + entrée donjon |
| `DungeonScene` | Salles du mini-donjon courant |
| `BossScene` | Combat de boss de région ou final |
| `UIScene` | HUD parallèle (cœurs, mana, sorts, messages) ; ne possède pas l’état de combat |

Transitions : `this.scene.start` avec data `{ regionId, spawnId, saveSlot }`. Une seule scène monde active à la fois + `UIScene` en parallèle.

### Données de niveaux

Fichiers JSON sous `src/data/` (ex. `hub.json`, `forest.json`, `ruins.json`, `sanctuary.json`, `boss-final.json`) :

```json
{
  "id": "forest",
  "tilemap": "forest-map",
  "spawn": { "x": 5, "y": 10 },
  "exits": [{ "to": "hub", "tile": [2, 8], "spawnId": "from-forest" }],
  "enemies": [{ "type": "shadow-blob", "x": 12, "y": 7 }],
  "puzzles": [{ "type": "braziers", "count": 3, "unlock": "fog-gate" }],
  "chests": [],
  "checkpoints": [{ "id": "forest-entry", "x": 5, "y": 10 }]
}
```

Le code de scène lit ces données ; aucun layout hardcodé dans la logique de combat. Tuiles collision / trigger via calques Tiled exportés en JSON, ou grille simple générée si Tiled non utilisé en v1 (grille éditable dans les JSON suffit pour la v1).

### État et sauvegarde

Objet `GameState` sérialisable :

- `version: 1`
- `hearts`, `heartsMax`, `mana`
- `spellsUnlocked: ("light"|"wind"|"nature")[]`
- `activeSpell`
- `fragments: ("forest"|"ruins"|"sanctuary")[]`
- `flags: Record<string, boolean>` (portes, coffres, dialogues vus)
- `position: { scene, regionId?, x, y }`
- `checkpoints`

Clé `localStorage` : `merlin-brumes-bretagne:v1`. Sauvegarde **automatique** à chaque : entrée/sortie de scène, fragment obtenu, mort/respawn, fin de dialogue de quête. Pas de bouton Sauver obligatoire.

Erreurs stockage : si `localStorage` indisponible ou quota dépassé → jouer en mémoire + message unique « Reprise indisponible sur cet appareil ». Sauvegarde corrompue / mauvaise version → message + proposition Nouvelle partie ; ne jamais boucler ni écraser silencieusement une autre clé.

### Entrées

- **Clavier** : flèches / WASD déplacement ; Espace mêlée ; E interagir / dialoguer ; 1/2/3 ou molette sélection sort ; F (ou clic icône) lancer sort ; Échap pause.
- **Tactile** : pad virtuel bas-gauche (déplacement), boutons bas-droite (mêlée, sort, cycle sort), zone tap sur PNJ pour interagir. Cibles ≥ 48 CSS px. Pad et boutons masqués sur desktop (détection fine pointer).
- Pause : menu Reprendre / Nouvelle partie (confirmée) / Son muet.

### Chargement et erreurs

- Preload avec timeout 15 s : échec → écran « Chargement impossible » + bouton Réessayer (relance Preload).
- Asset manquant : log console + placeholder couleur ; le jeu ne plante pas.
- Onglet caché : pause logique (timers ennemis / regen mana suspendus).
- Pas de dépendance CDN runtime obligatoire : Phaser et assets vendored ou bundlés ; le build Pages doit fonctionner hors ligne une fois chargé.

## Tests et vérification

### Automatisés (obligatoires avant claim « jouable »)

- Tests unitaires Node avec **Vitest** : dégâts/cœurs/mort, regen mana, consommation sort, poussée Vent (case libre / bloquée), allumage braseros, croissance pont Nature, sérialisation / migration `GameState`, refus sauvegarde corrompue.
- Tests de contrats de données : chaque JSON de région a spawn, exits valides, puzzles au schéma attendu.
- Parcours headless minimal : nouvelle partie → débloquer lumière (flag simulé) → fragment forêt → sauvegarde → reload state → fragment présent.

### Vérification GitHub Pages (quand publication autorisée)

1. Build `vite build` ; déployer `dist/` sur Pages.
2. Ouvrir l’URL publique ; DevTools : aucun 404 sur JS/CSS/assets critiques, aucune exception console au Title.
3. Parcours manuel bureau : hub → forêt → braseros → boss région → retour hub avec fragment.
4. Émulation 360×800 : pad tactile visible, cœurs lisibles, pas de HUD hors écran.
5. Recharge milieu de forêt : reprise à checkpoint, pas de reset de fragment.
6. Comparer hash des artefacts build locaux et fichiers servis si script de vérif disponible.

Les tests Node ne prouvent pas le rendu ni le tactile réel. Ne pas affirmer validation mobile matérielle sans essai appareil.

## Critères de réussite

- Partie complète jouable clavier : hub → 3 régions → gardien final → écran de fin.
- Les trois sorts changent concrètement le niveau (ombre / bloc / pont), pas seulement des dégâts cosmétiques.
- Softlock impossible sur les trois énigmes documentées.
- Sauvegarde auto + reprise après F5 conserve fragments et sorts.
- HUD conforme au concept (cœurs, mana, 3 icônes, pas de texte permanent).
- Suite de tests automatisés verte en CI ou en local `npm test`.
- Build Pages accessible en HTTPS public sans étape manuelle serveur.

## Hors scope (v1)

- Multijoueur, crafting, montures, arbre de talents, plus de trois sorts.
- Voix off, cinématiques vidéo, localisation autre que français.
- Fidélité à une série / roman / casting réel ; noms et intrigues d’œuvres protégées.
- Demande d’assets à Créa / Voix / SUNO (phase ultérieure).
- Physique réaliste, éclairage dynamique WebGL avancé, pathfinding complexe.
- Achats intégrés, comptes, analytics, backend.
- Plan d’implémentation détaillé (document séparé, après approbation de **cette** spec).

## Auto-revue de spécification

1. **Placeholders** : aucun TBD/TODO ; contrats d’énigmes, clé de sauvegarde, scènes et critères sont explicites.
2. **Cohérence** : structure hub → 3 régions → boss = sorts Lumière / Vent / Nature = icônes du concept art ; HUD sans texte aligné sur l’image de référence.
3. **Ambiguïté** : poussée Vent = une case orthogonale ; ponts Nature = 3 cases ; boss final = 3 totems + dégâts pendant vulnérabilité ; stack figée JS + Vite + Vitest + Pages sur `dist/` — une seule lecture possible.
4. **Portée** : un seul jeu navigateur Phaser, une campagne courte ; assets finaux et plan d’implémentation exclus volontairement.

Prochaine porte : revue humaine de ce fichier, puis seulement plan d’implémentation (`docs/superpowers/plans/…`), puis code.
