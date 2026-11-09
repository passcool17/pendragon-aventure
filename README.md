# Merlin : Les Brumes de Bretagne

Aventure Zelda-like top-down (Phaser 3), originale, ambiance Bretagne post-romaine brumeuse.

**Jouer :** https://passcool17.github.io/pendragon-aventure/

**Dépôt :** https://github.com/passcool17/pendragon-aventure

## Contrôles

| Entrée | Action |
|--------|--------|
| Flèches / WASD | Déplacement |
| Espace | Mêlée (bâton) |
| E | Interagir / avancer le dialogue |
| 1 / 2 / 3 | Sort Lumière / Vent / Nature |
| F | Lancer le sort actif |
| Échap | Pause |
| Tactile | Pad + boutons A / F / cycle |

## Debug (saut de niveau)

- `?level=forest` / `ruins` / `sanctuary` / `boss-final`
- `?spells=all&fragments=all` · `?god=1`

Ex. : https://passcool17.github.io/pendragon-aventure/?level=forest

## Visuels

Sprites pixel art **Créa** (`public/assets/sprites/`, clés = noms de fichiers).  
Effets FX (arc, orbe, vent, brume) encore générés en code tant que non livrés.  
Aperçu source : `/workspace/crea/merlin-foret-bretonne/sprites/`.

## Dev local

```bash
npm install
npm test
npm run dev
npm run build
```

Base Vite : `/pendragon-aventure/` (GitHub Pages projet). Scale entier pour pixels nets.

## Docs

- Spec : `docs/superpowers/specs/2026-11-09-merlin-zelda-like-design.md`
- Plan : `docs/superpowers/plans/2026-11-09-merlin-les-brumes-de-bretagne.md`
- Suivi : `GAME.md`
