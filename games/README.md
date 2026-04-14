# Structure des jeux

Chaque jeu enregistre dans l'application vit dans son propre dossier sous `games/`.

Convention recommandee pour un nouveau jeu :

- `games/<slug>/index.ts`
  - exporte une `RegisteredGameDefinition`
  - declare le `slug`, le nom, le chemin API et l'adaptateur de persistance
- `types/<slug>-*.ts`
  - types specifiques au jeu
- `lib/<slug>-*.ts`
  - logique metier et persistance specifiques
- `components/<slug>/`
  - feuille de score, resume final et composants UI du jeu

Pour ajouter un deuxieme jeu :

1. creer `games/<slug>/index.ts`
2. brancher ce jeu dans `lib/games/registry.ts`
3. creer la page ou le container UI du jeu
4. reutiliser les routes generiques `/api/game-sessions/<slug>`

Les routes historiques specifiques a `Flowers` restent en place pour compatibilite,
mais les nouveaux jeux doivent s'appuyer sur les routes generiques.
