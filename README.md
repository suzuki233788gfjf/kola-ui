<p align="center">
  <img src="apps/web/public/kola-mark.svg" width="72" alt="Logo Kola UI" />
</p>

<h1 align="center">Kola UI</h1>

<p align="center">
  <strong>Des composants Flutter et React prêts à copier. Rien à installer.</strong><br />
  Pensés pour nos usages : numéros +237, montants en FCFA, paiement Mobile Money.
</p>

<!-- Les liens vers le site seront ajoutés quand l'adresse publique sera choisie (kolaui.dev). -->

---

## L'idée

Kola UI n'est pas un paquet à installer. Tu choisis un composant sur le site, tu l'ajustes,
puis tu **copies son fichier dans ton projet**. Le code t'appartient : pas de dépendance,
pas de mise à jour qui casse tout.

## Composants

| Composant | Ce qu'il fait |
| --- | --- |
| **Bouton** | 4 variantes, chargement, icône |
| **Champ de texte** | Label, aide, erreur, validation, mot de passe masquable |
| **Téléphone +237** | Formatage `6 77 12 34 56`, détection MTN / Orange |
| **Montant FCFA** | Séparateur de milliers à la saisie, valeur entière |
| **Formulaire Mobile Money** | MTN MoMo et Orange Money : saisie, attente, succès, échec |
| **Date picker** | Une date ou une période, en français, semaine qui commence le lundi |
| **Sélecteur avec recherche** | Liste filtrable, recherche sans accents |
| **Carte** | Carte produit et carte statistique |
| **Tableau de données** | Tri, pagination, cartes automatiques sur mobile |
| **Confirmation** | Boîte de dialogue ou panneau du bas, en une ligne |
| **Notifications** | Succès, erreur, info, avertissement |

Chaque composant existe en **Flutter** et en **React** (Tailwind CSS v4), avec le même comportement.
Aucun n'ajoute de dépendance : seulement Flutter, ou seulement React + Tailwind.

## Démarrer en 2 minutes

### Flutter

1. Copie le thème [`kola_theme.dart`](packages/kola_flutter/lib/src/kola_theme.dart) dans `lib/kola/`.
2. Branche-le dans ton application :

   ```dart
   MaterialApp(
     theme: KolaTheme.light(),
     darkTheme: KolaTheme.dark(),
     home: const MonEcran(),
   );
   ```

3. Copie le composant dont tu as besoin depuis le catalogue du site (`/composants`).

### React

Prérequis : React 18 ou plus et Tailwind CSS v4.

1. Copie le thème [`kola-theme.css`](packages/kola-react/src/kola-theme.css) dans `src/components/kola/`.
2. Importe-le dans ton CSS global, juste après Tailwind :

   ```css
   @import "tailwindcss";
   @import "./components/kola/kola-theme.css";
   ```

3. Copie le composant dont tu as besoin (fichier `.tsx`) dans `src/components/kola/`.

## Structure du dépôt

```
kola-ui/
├── packages/kola_flutter/   ← les composants Flutter
├── packages/kola-react/     ← les composants React (Tailwind CSS v4)
├── apps/preview/            ← la vitrine Flutter Web (aperçus en direct)
├── apps/web/                ← le site Next.js
└── scripts/build-preview.sh ← compile la vitrine et la place dans le site
```

## Développer en local

```bash
# Tests des composants
cd packages/kola_flutter && flutter test

# Compiler la vitrine dans le site, puis lancer le site
bash scripts/build-preview.sh
cd apps/web && npm install && npm run build && npm start
```

---

<p align="center">Fait avec soin à Yaoundé 🇨🇲</p>
