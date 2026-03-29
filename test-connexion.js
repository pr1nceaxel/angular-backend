require('dotenv').config();
const mongoose = require('mongoose');

console.log('URI utilisée :', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connexion MongoDB réussie !');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Erreur :', err.message);
  });