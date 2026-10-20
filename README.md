<p align="center">
  <img src="apps/web/public/kola-mark.svg" width="72" alt="Logo Kola UI" />
</p>

<h1 align="center">Kola UI</h1>

<p align="center">
  <strong>Des composants Flutter, React, Vue et HTML prêts à copier. Rien à installer.</strong><br />
  Pensés pour nos usages : numéros +237, montants en FCFA, paiement Mobile Money.
</p>

<p align="center">
  <a href="https://kola-ui-five.vercel.app">Voir le site</a> ·
  <a href="https://kola-ui-five.vercel.app/composants">Catalogue</a> ·
  <a href="https://kola-ui-five.vercel.app/demarrer">Démarrer</a>
</p>

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
| **Code OTP** | Les cases du code SMS, collage du SMS entier, compte à rebours « Renvoyer le code » |
| **Recherche** | Suggestions pendant la frappe, sans accents, au clavier |
| **Téléversement de fichier** | Glisser-déposer, aperçu, taille et format vérifiés, progression |
| **Formulaire Mobile Money** | MTN MoMo et Orange Money : saisie, attente, succès, échec |
| **Date picker** | Une date ou une période, en français, semaine qui commence le lundi |
| **Sélecteur avec recherche** | Liste filtrable, recherche sans accents |
| **Carte** | Carte produit et carte statistique |
| **Tableau de données** | Tri, pagination, cartes automatiques sur mobile |
| **Onglets** | Onglets en haut de page et barre d'onglets en bas d'une app mobile, avec compteurs |
| **Confirmation** | Boîte de dialogue ou panneau du bas, en une ligne |
| **Notifications** | Succès, erreur, info, avertissement |
| **États vides et chargement** | Écran vide ou d'erreur avec action, squelettes de chargement |

## Blocs

Des écrans entiers, assemblés avec les composants. Tu copies le bloc et les composants qu'il utilise,
tu branches ton serveur, et l'écran est prêt.

| Bloc | Ce qu'il fait |
| --- | --- |
| **Connexion par téléphone** | Numéro +237, code reçu par SMS, puis « Bienvenue » |
| **Paiement de commande** | Récapitulatif du panier en FCFA, puis paiement MTN MoMo ou Orange Money |
| **Tableau de bord boutique** | Chiffres clés, commandes par statut, tri, pagination, état vide |
| **Liste avec recherche** | Recherche sans accents, squelettes de chargement, « aucun résultat » |

Chaque composant existe en **Flutter**, **React**, **Vue** et **HTML**, avec le même comportement.
Aucun n'ajoute de dépendance :

| Langage | Ce qu'il faut |
| --- | --- |
| Flutter | Flutter, c'est tout |
| React | React 18+ et Tailwind CSS v4 |
| Vue | Vue 3.5+ et Tailwind CSS v4 (Vite, Laravel + Inertia…) |
| HTML | Rien : HTML, CSS et un peu de JavaScript (Blade, PHP, Django, WordPress…) |

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

3. Copie le composant dont tu as besoin depuis le [catalogue](https://kola-ui-five.vercel.app/composants).

### React

Prérequis : React 18 ou plus et Tailwind CSS v4.

1. Copie le thème [`kola-theme.css`](packages/kola-react/src/kola-theme.css) dans `src/components/kola/`.
2. Importe-le dans ton CSS global, juste après Tailwind :

   ```css
   @import "tailwindcss";
   @import "./components/kola/kola-theme.css";
   ```

3. Copie le composant dont tu as besoin (fichier `.tsx`) dans `src/components/kola/`.

### Vue

Même principe que React : copie [`kola-theme.css`](packages/kola-vue/src/kola-theme.css), importe-le après Tailwind,
puis copie les fichiers `.vue` dans `src/components/kola/`. Les champs s'utilisent avec `v-model`.

### HTML

1. Copie [`kola-theme.css`](packages/kola-html/src/kola-theme.css) dans un dossier `kola/` de ton site.
2. Charge-le dans le `<head>`, puis le `.css` (et le `.js`) de chaque composant :

   ```html
   <link rel="stylesheet" href="kola/kola-theme.css">
   <link rel="stylesheet" href="kola/kola-text-field.css">
   <link rel="stylesheet" href="kola/kola-phone-field.css">
   <script src="kola/kola-phone-field.js" defer></script>
   ```

3. Colle le code HTML du composant (donné sur sa page) là où tu le veux.

## Structure du dépôt

```
kola-ui/
├── packages/kola_flutter/   ← les composants Flutter
├── packages/kola-react/     ← les composants React (Tailwind CSS v4)
├── packages/kola-vue/       ← les composants Vue (Tailwind CSS v4)
├── packages/kola-html/      ← les composants HTML (CSS + JavaScript, sans dépendance)
├── apps/preview/            ← la vitrine Flutter Web (aperçus en direct)
├── apps/preview-vue/        ← la vitrine Vue (aperçus en direct)
├── apps/web/                ← le site Next.js
├── scripts/build-preview.sh     ← compile la vitrine Flutter et la place dans le site
└── scripts/build-preview-vue.sh ← compile la vitrine Vue et la place dans le site
```

## Développer en local

```bash
# Tests des composants
cd packages/kola_flutter && flutter test

# Compiler la vitrine dans le site, puis lancer le site
bash scripts/build-preview.sh
bash scripts/build-preview-vue.sh
cd apps/web && npm install && npm run build && npm start
```

## Licence

[MIT](LICENSE) : tu peux utiliser, copier et modifier les composants librement, y compris dans des projets
payants. Garde simplement la mention de la licence.

## Contribuer

Un bug, une idée de composant ? Ouvre une [issue](https://github.com/suzuki233788gfjf/kola-ui/issues).
Et si Kola UI t'aide, une ⭐ sur GitHub fait toujours plaisir.

---

<p align="center">Fait avec soin à Yaoundé 🇨🇲</p>
