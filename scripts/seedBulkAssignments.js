/**
 * Insère des devoirs en masse (défaut 1000) avec URLs HTTPS complètes :
 * - matière / image matière / prof : comme le formulaire Angular (subjectsCatalog)
 * - photo auteur : pravatar aléatoire par ligne
 *
 * Usage :
 *   npm run seed:bulk
 *   BULK_TARGET=1200 npm run seed:bulk
 *   FORCE_BULK=1 npm run seed:bulk   # ajoute même si la base a déjà >= BULK_TARGET
 *
 * Nécessite .env avec MONGODB_URI.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');
const SUBJECTS = require('../config/subjectsCatalog');

const FIRST = [
  'Emma',
  'Lucas',
  'Léa',
  'Hugo',
  'Chloé',
  'Nathan',
  'Manon',
  'Louis',
  'Camille',
  'Thomas',
  'Sarah',
  'Julien',
  'Inès',
  'Maxime',
  'Zoé',
  'Antoine',
  'Clara',
  'Paul',
  'Julie',
  'Alexandre',
];
const LAST = [
  'Martin',
  'Bernard',
  'Dubois',
  'Thomas',
  'Robert',
  'Petit',
  'Durand',
  'Leroy',
  'Moreau',
  'Simon',
  'Laurent',
  'Lefebvre',
  'Michel',
  'Garcia',
  'David',
  'Bertrand',
  'Roux',
  'Vincent',
  'Fournier',
  'Girard',
];
const TP_LABELS = [
  'TP',
  'Devoir maison',
  'Projet',
  'Contrôle continu',
  'Mini-projet',
  'Étude de cas',
  'Rendu intermédiaire',
  'Sprint',
];

function rnd(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pick(arr) {
  return arr[rnd(0, arr.length - 1)];
}

function randomDate() {
  const start = new Date(2024, 0, 1).getTime();
  const end = new Date(2027, 11, 31).getTime();
  return new Date(start + Math.random() * (end - start));
}

function randomGrade() {
  const g = rnd(0, 40) / 2;
  return g;
}

function buildOne(index) {
  const sub = pick(SUBJECTS);
  const rendu = Math.random() < 0.42;
  const grade = rendu ? randomGrade() : null;

  const authorPhoto = `https://i.pravatar.cc/150?img=${rnd(1, 70)}`;

  return {
    nom: `${pick(TP_LABELS)} ${sub.label.split(' ')[0]} #${index + 1}`,
    dateDeRendu: randomDate(),
    rendu,
    authorName: `${pick(FIRST)} ${pick(LAST)}`,
    authorPhoto,
    subject: sub.label,
    subjectImageUrl: sub.subjectImageUrl,
    teacherName: sub.teacherName,
    teacherPhotoUrl: sub.teacherPhotoUrl,
    grade,
    remarks: rendu && Math.random() < 0.3 ? 'Bon travail.' : '',
  };
}

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('Définissez MONGODB_URI dans .env');
    process.exit(1);
  }

  const target = Math.max(1, parseInt(process.env.BULK_TARGET || '1000', 10) || 1000);
  const force = process.env.FORCE_BULK === '1' || process.env.FORCE_BULK === 'true';

  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await Assignment.countDocuments();

  let toInsert = target;
  if (!force) {
    if (existing >= target) {
      console.log(
        `La collection contient déjà ${existing} devoir(s) (objectif ${target}). Rien à faire.`
      );
      console.log('Pour forcer l’ajout de ' + target + ' devoirs supplémentaires : FORCE_BULK=1 npm run seed:bulk');
      await mongoose.disconnect();
      return;
    }
    toInsert = target - existing;
  } else {
    toInsert = target;
  }

  const batchSize = 250;
  let inserted = 0;
  const baseIndex = existing;

  for (let offset = 0; offset < toInsert; offset += batchSize) {
    const chunk = [];
    const n = Math.min(batchSize, toInsert - offset);
    for (let i = 0; i < n; i += 1) {
      chunk.push(buildOne(baseIndex + offset + i));
    }
    await Assignment.insertMany(chunk, { ordered: false });
    inserted += chunk.length;
    process.stdout.write(`\rInsérés : ${inserted} / ${toInsert}`);
  }

  console.log(`\nTerminé : +${inserted} devoir(s) (URLs matière/prof = catalogue ; photo élève = pravatar aléatoire).`);
  const total = await Assignment.countDocuments();
  console.log(`Total dans la collection : ${total}`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
