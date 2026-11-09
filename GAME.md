# Merlin : Les Brumes de Bretagne — suivi

## Concept

Zelda-like 32px : hub → forêt (Lumière / rayon doré) → ruines (Vent) → sanctuaire (Nature) → Gardien.  
Cible finale : concept Pascal (chemin en croix, ruisseau + pont, ruines/colonnes, brume douce).

## Contrôles

| Entrée | Action |
|--------|--------|
| Flèches / WASD | Déplacement |
| Espace | Mêlée (arc visible ~250 ms) |
| E | Interagir |
| 1 / 2 / 3 | Lumière / Vent / Nature (🔒 si verrouillé) |
| F | Lancer le sort |
| Entrée / Espace | Nouvelle partie (titre) |
| Échap | Pause |

## État

**Publié — hotfix boot** (`updateCanopyFade` manquait → TypeError chaque frame).

**Correctifs forêt 32px**  
- HUD dans 640×360 ; niveaux paddés ≥20×12 (plus de bande vide)  
- Cimes semi-transparentes sous Merlin ; FX mêlée/vent depth 12000  
- Ruisseau large + chemin 2–3 tuiles ; ombres loin du spawn, invuln 1 s  
URL : https://passcool17.github.io/pendragon-aventure/  
Debug forêt : https://passcool17.github.io/pendragon-aventure/?level=forest  

Crédits : **Créa** (`sprites32` + manifest). Concept cible : Pascal.

## Prochaines idées

- Coins intérieurs autotile plus fins ; audio SUNO ; polish boss.

## Hotfix polish (Vent / ruisseau / favicon)

- Vent : rafale large, hold ~180 ms puis fade (total ≥300 ms), depth 12000
- Autotile eau : orientation berge/coins corrigée + coins intérieurs diagonaux
- Favicon : `favicon.png` / `favicon.ico` (sprite icon-lumiere)

## Sol lisse (anti-régression wang)

Chemin / ruisseau : **blobs** cercle+capsule (`smoothGround`) + tampon texture masqué — plus d’autotile 47 cases.
Vent : rafale voyage ~700 ms (hold+fade+trail).

Chemin : terre unie bruitée (`drawDirtPath`), plus de tampon `chemin-terre` (touffe centrale).
