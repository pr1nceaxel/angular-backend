/**
 * Crée un utilisateur normal et un admin (mot de passe hashé).
 * Usage : npm run seed:users
 * Nécessite .env avec MONGODB_URI et JWT_SECRET.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

const DEFAULT_PASSWORD = 'demo123';

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('Définissez MONGODB_URI dans .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  await User.deleteMany({ login: { $in: ['user', 'admin'] } });

  await User.create([
    { login: 'user', passwordHash: hash, role: 'user' },
    { login: 'admin', passwordHash: hash, role: 'admin' },
  ]);

  console.log('Utilisateurs créés : user / admin (mot de passe : demo123)');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
