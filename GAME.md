# Merlin : Les Brumes de Bretagne — suivi

## Concept

Zelda-like top-down : hub villageois → forêt (Lumière) → ruines (Vent) → sanctuaire (Nature) → Gardien des Brumes. Personnages fictifs ; ambiance Bretagne post-romaine.

## Contrôles

| Entrée | Action |
|--------|--------|
| Flèches / WASD | Déplacement |
| Espace | Mêlée |
| E | Interagir / dialogue |
| 1 / 2 / 3 | Lumière / Vent / Nature |
| F | Lancer le sort |
| Échap | Pause |
| Tactile | Pad + A / F / cycle |

## État

**Publié sur GitHub Pages** (prototype jouable, placeholders code).  
URL : https://passcool17.github.io/pendragon-aventure/  
Repo : https://github.com/passcool17/pendragon-aventure  

Vérification Chrome manuelle : à faire par Pascal (contrôles + captures). Tests Vitest + build Vite verts en CI/local.

## Instructions de test rapide

1. Ouvrir l’URL Pages (ou `?level=hub`).
2. **Nouvelle partie** → parler à **Branoc** (E) → sortir au sud vers la forêt.
3. **Lumière** : touche `1`, viser un brasero, `F`. Allumer les 3. Entrée nord du donjon → boss → fragment.
4. Retour hub. Sortie **est** → ruines. **Vent** (`2`+`F`) pousse les blocs sur les dalles. Donjon → boss → fragment.
5. Hub **ouest** → sanctuaire. Près d’une graine, **Nature** (`3`+`F`) pour ponts. Donjon → boss → fragment.
6. Hub **nord** → gardien final : `F` avec chaque sort sur les totems, puis mêlée pendant la vulnérabilité.

### Raccourcis debug

- `?level=forest` — tester Lumière / braseros
- `?level=ruins` — tester Vent / blocs
- `?level=sanctuary` — tester Nature / ponts
- `?level=boss-final` — combat final
- `?spells=all&fragments=all` — tout débloqué au hub

## Prochaines idées

- Sprites / tileset Créa ; musique SUNO ; voix courte.
- Polish boss de région (motifs télégraphiés).
- Cœur bonus mur cassable à la Lumière.
