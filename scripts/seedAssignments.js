/**
 * Insère des devoirs d'exemple si la collection est vide.
 * Usage : npm run seed:assignments
 * Nécessite .env avec MONGODB_URI.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');

const samples = [
  {
    nom: 'Modèle E/A + script SQL',
    dateDeRendu: new Date('2026-04-15'),
    rendu: true,
    authorName: 'Alice',
    authorPhoto: '',
    subject: 'Base de données',
    subjectImageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&q=80',
    teacherName: 'Dr. Martin',
    teacherPhotoUrl: 'https://i.pravatar.cc/150?img=12',
    grade: 16,
    remarks: 'Bon schéma, quelques cardinalités à revoir.',
  },
  {
    nom: 'TP REST + Angular',
    dateDeRendu: new Date('2026-04-22'),
    rendu: false,
    authorName: 'Bob',
    authorPhoto: '',
    subject: 'Technologies Web',
    subjectImageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80',
    teacherName: 'M. Leroy',
    teacherPhotoUrl: 'https://i.pravatar.cc/150?img=33',
    grade: null,
    remarks: '',
  },
  {
    nom: 'Contrôleur Grails — CRUD assignments',
    dateDeRendu: new Date('2026-05-01'),
    rendu: false,
    authorName: 'Chloé',
    authorPhoto: '',
    subject: 'Grails',
    subjectImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
    teacherName: 'Mme Dubois',
    teacherPhotoUrl: 'https://i.pravatar.cc/150?img=45',
    grade: null,
    remarks: '',
  },
  {
    nom: 'Composants & routing',
    dateDeRendu: new Date('2026-04-08'),
    rendu: true,
    authorName: 'David',
    authorPhoto: '',
    subject: 'Angular',
    subjectImageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&q=80',
    teacherName: 'M. Buffa',
    teacherPhotoUrl: 'https://i.pravatar.cc/150?img=8',
    grade: 14,
    remarks: '',
  },
  {
    nom: 'Collections et génériques',
    dateDeRendu: new Date('2026-04-28'),
    rendu: false,
    authorName: 'Emma',
    authorPhoto: '',
    subject: 'Java',
    subjectImageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&q=80',
    teacherName: 'M. Chen',
    teacherPhotoUrl: 'https://i.pravatar.cc/150?img=15',
    grade: null,
    remarks: '',
  },
];

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('Définissez MONGODB_URI dans .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await Assignment.countDocuments();
  if (existing > 0) {
    console.log(
      `La collection contient déjà ${existing} devoir(s). Rien n'a été ajouté (supprimez les documents ou la collection pour re-seeder).`
    );
    await mongoose.disconnect();
    return;
  }

  await Assignment.insertMany(samples);
  console.log(`${samples.length} devoirs d'exemple insérés.`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
