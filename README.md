# API Assignments — Back-end (Express + MongoDB + JWT)

API REST pour le mini-projet **Assignments** : authentification par login / mot de passe, JWT, CRUD des devoirs avec règles métier (note obligatoire si « rendu ») et droits **admin** pour modification / suppression.

Ce dépôt correspond au **back-end**. L’application Angular se trouve dans le dépôt / dossier **assignment-app** associé (voir son README).

---

## Binôme et contributions

| Étudiant(e) | Rôle sur ce dépôt |
|-------------|-------------------|
| **Hien Yao Axel Vianney** | **Back-end** : serveur Express, MongoDB (Mongoose), schémas `User` et `Assignment`, routes `/api/auth` et `/api/assignments`, bcrypt, **JWT**, contrôle **admin** sur `PUT` / `DELETE`, **CORS**, seeds (`seed:users`, `seed:assignments`, **`seed:bulk`** pour 1000+ devoirs avec URLs), fichier **`subjectsCatalog`** aligné au front, **normalisation** des réponses API (imports Mockaroo, images type `nodejs.png`, photo auteur), filtres recherche/matière côté liste, documentation et déploiement Render. |
| **Yao Gnamien Emmanuella** | **Front-end** (autre dépôt) : application Angular, interface utilisateur, appels HTTP vers cette API, guards et expérience de connexion. |

Les deux membres ont pu se coordonner sur le **format des requêtes / réponses JSON** et les scénarios de test (connexion, liste, création, édition admin).

---

## Liens utiles (à compléter pour le rendu)

- Dépôt GitHub **front** : git@github.com:pr1nceaxel/angular-frontend.git
- Dépôt GitHub **back** : git@github.com:pr1nceaxel/angular-backend.git
- Application déployée  : https://angular-frontend-7fkd.onrender.com/login
- Vidéo de démo YouTube : 

---

## Prérequis

- **Node.js** 18 ou plus récent  
- Un cluster **MongoDB Atlas** (ou instance MongoDB) — **votre propre base**, pas celle du cours

---

## Configuration

1. Copier `.env.example` vers `.env`.
2. Renseigner au minimum :

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | Chaîne de connexion (Atlas : *Database* → *Connect* → *Drivers*) |
| `JWT_SECRET` | Secret long et aléatoire pour signer les tokens |
| `PORT` | Port d’écoute (ex. `8010` en local ; Render fournit souvent `PORT`) |
| `CORS_ORIGINS` | Origines autorisées, séparées par des virgules : `http://localhost:4200` + URL du front déployé |

---

## Installation et démarrage

```bash
git clone <URL-du-depot-back>
cd back-end
npm install
npm start
```

Vérification : `GET http://localhost:8010/api/health` doit renvoyer `{ "ok": true, ... }`.

---

## Utilisateurs de test

Après un `.env` valide :

```bash
npm run seed:users
```

| Login | Mot de passe | Rôle |
|-------|----------------|------|
| user  | demo123        | user |
| admin | demo123        | admin |

**Important :** les comptes sont dans la collection **`users`**. Si vous changez de base dans `MONGODB_URI`, relancez `npm run seed:users`. Si la connexion renvoie **401**, vérifiez que les utilisateurs existent dans la bonne base.

Seul le rôle **admin** peut **modifier** ou **supprimer** des assignments (`PUT` / `DELETE`).

---

## Données de devoirs (liste non vide)

Si la collection **`assignments`** est vide, la liste côté Angular le sera aussi. Après `seed:users`, vous pouvez lancer :

```bash
npm run seed:assignments
```

(insère quelques devoirs si la collection est vide). Sinon : formulaire **Nouveau devoir** dans l’app, ou import **≥ 1000** enregistrements avec **Mockaroo** (voir ci-dessous).

### Générer ~1000 devoirs avec URLs (comme le formulaire)

Le script **`seed:bulk`** insère des documents avec les **mêmes URLs** que l’app Angular pour chaque matière (`config/subjectsCatalog.js`, aligné sur `subjects.ts`), et une **photo élève aléatoire** (`pravatar`) par ligne.

```bash
npm run seed:bulk
```

- Comportement par défaut : si la collection a **moins de 1000** documents, le script **complète** jusqu’à 1000. Si vous avez déjà ≥ 1000, il ne fait rien.
- `BULK_TARGET=1500 npm run seed:bulk` — autre objectif.
- `FORCE_BULK=1 npm run seed:bulk` — ajoute **BULK_TARGET** devoirs en plus, même si le total dépasse déjà l’objectif.

Les réponses JSON de l’API **complètent aussi** les anciens imports : si `imageMatiere` vaut par ex. `nodejs.png` mais que la **matière** correspond au catalogue (ex. « Technologies Web »), les champs `subjectImageUrl` / `teacherPhotoUrl` renvoyés au front utilisent les **URLs HTTPS** du catalogue. Idem pour une **photo auteur** absente ou non-URL : avatar pravatar cohérent avec le nom.

---

## API principale

| Méthode | Route | Accès |
|---------|--------|--------|
| POST | `/api/auth/login` | Public — body `{ "login", "password" }` → `{ token, user }` |
| GET | `/api/assignments?page=&limit=&q=&subject=&rendu=` | JWT — liste triée par **plus récent d’abord** (`_id` desc.). **q** : recherche (nom, matière, auteur). **subject** : matière exacte (libellé). **rendu** : `true` / `false` |
| GET | `/api/assignments/:id` | JWT |
| POST | `/api/assignments` | JWT (utilisateur connecté) |
| PUT | `/api/assignments/:id` | JWT + **admin** |
| DELETE | `/api/assignments/:id` | JWT + **admin** |

---

## Import de 1000+ devoirs (Mockaroo — consigne mini-projet)

1. Sur [mockaroo.com](https://www.mockaroo.com/), définir un schéma aligné avec [models/Assignment.js](models/Assignment.js) (`nom`, `dateDeRendu`, `rendu`, `authorName`, `subject`, `subjectImageUrl`, `teacherName`, `teacherPhotoUrl`, `grade`, `remarks`, etc.).
2. Exporter au moins **1000** lignes (JSON ou CSV).
3. Importer dans Atlas : **Compass** → collection `assignments` → *Import*, ou **mongoimport** avec la même URI que dans `.env`.

Les dates au format ISO sont recommandées. L’API peut normaliser certains anciens noms de champs (voir commentaires dans le code si présents).

---

## Guide rapide pour faire tourner le projet sur une autre machine

1. Cloner ce dépôt et configurer `.env` (MongoDB + JWT + CORS).
2. `npm install` → `npm run seed:users` → `npm start`.
3. Cloner le **front** (`assignment-app`), `npm install`, pointer `environment.ts` vers `http://localhost:8010/api`, puis `npm start`.
4. Ouvrir **http://localhost:4200** et tester avec `user` / `admin`.

---

