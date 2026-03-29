# API Assignments (Express + MongoDB + JWT)

## Prérequis

- Node.js 18+
- Un cluster **MongoDB Atlas** (votre propre base, pas celle du cours)

## Configuration

1. Copiez `.env.example` vers `.env`.
2. Renseignez :
   - `MONGODB_URI` : chaîne de connexion Atlas (Database → Connect → Drivers).
   - `JWT_SECRET` : chaîne longue et secrète (générez-en une au hasard).
   - `PORT` : par défaut `8010` en local.
   - `CORS_ORIGINS` : `http://localhost:4200` en dev ; ajoutez l’URL de votre front déployé (Render/Vercel), séparée par des virgules.

## Installation et démarrage

```bash
npm install
npm start
```

Healthcheck : `GET http://localhost:8010/api/health`

## Utilisateurs de test

Après configuration de `.env` :

```bash
npm run seed:users
```

Comptes créés :

| Login | Mot de passe | Rôle  |
|-------|----------------|-------|
| user  | demo123        | user  |
| admin | demo123        | admin |

Seul **admin** peut **modifier** ou **supprimer** des assignments (routes `PUT` / `DELETE`).

## Devoirs d’exemple (tableau non vide en local)

Si la liste Angular est vide alors que l’API répond correctement, la collection MongoDB `assignments` ne contient souvent **aucun document** (seuls les comptes utilisateurs sont créés par `seed:users`).

Après `npm run seed:users`, exécutez :

```bash
npm run seed:assignments
```

Cela insère quelques devoirs **uniquement si** la collection est vide. Sinon le message indique combien de documents existent déjà (vous pouvez aussi ajouter des devoirs via **Nouveau devoir** dans l’app).

## API utile

- `POST /api/auth/login` — body JSON `{ "login", "password" }` → `{ token, user }`
- `GET /api/assignments?page=1&limit=15` — JWT requis
- `GET /api/assignments/:id` — JWT requis
- `POST /api/assignments` — JWT requis (tout utilisateur connecté)
- `PUT /api/assignments/:id` — JWT + rôle **admin**
- `DELETE /api/assignments/:id` — JWT + rôle **admin**

## Import de 1000+ devoirs (Mockaroo)

1. Sur [mockaroo.com](https://www.mockaroo.com/), créez un schéma aligné avec le modèle Mongoose (`nom`, `dateDeRendu`, `rendu`, `authorName`, `subject`, `subjectImageUrl`, `teacherName`, `teacherPhotoUrl`, `grade`, `remarks`, etc.).
2. Exportez au moins **1000** lignes en **JSON** (tableau) ou **CSV**.
3. Import dans MongoDB Atlas :
   - **Compass** : connectez-vous à la base → collection `assignments` → *Add Data* → *Import JSON or CSV file*.
   - Ou **mongoimport** (CLI) en pointant vers votre URI et la collection `assignments`.

Adaptez les noms de champs pour qu’ils correspondent au schéma ([models/Assignment.js](models/Assignment.js)). Les dates doivent être au format ISO si possible.

## Déploiement Render (Web Service)

1. Nouveau **Web Service** depuis votre dépôt Git du back-end.
2. Build : `npm install` (ou laissez vide si détection auto).
3. Start : `npm start` ou `node server.js`.
4. Variables d’environnement sur Render : `MONGODB_URI`, `JWT_SECRET`, `PORT` (souvent injecté par Render), `CORS_ORIGINS` = URL publique de votre front.

---

*Ajoutez ici la section « Contributions du binôme » pour le rendu.*
