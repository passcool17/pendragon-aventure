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

Ajouter à l’URL Pages ou locale :

- `?level=forest` — démarre en forêt (quête + sorts utiles)
- `?level=ruins` — ruines avec fragment forêt
- `?level=sanctuary` — sanctuaire
- `?level=boss-final` — gardien final (3 fragments + 3 sorts)
- `?level=hub&spells=all&fragments=all` — hub tout débloqué
- `?god=1` — cœurs max

Exemples :

- https://passcool17.github.io/pendragon-aventure/?level=forest
- https://passcool17.github.io/pendragon-aventure/?level=boss-final

## Dev local

```bash
npm install
npm test
npm run dev
npm run build
```

Base Vite : `/pendragon-aventure/` (GitHub Pages projet).

## Docs

- Spec : `docs/superpowers/specs/2026-11-09-merlin-zelda-like-design.md`
- Plan : `docs/superpowers/plans/2026-11-09-merlin-les-brumes-de-bretagne.md`
- Suivi : `GAME.md`

Placeholders graphiques générés en code. Assets finaux / audio : plus tard (Créa / Voix / SUNO). Personnages fictifs.
