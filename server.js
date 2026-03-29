require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const assignmentRoutes = require('./routes/assignments');

const app = express();
const PORT = process.env.PORT || 8010;

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:4200')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route inconnue' });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI manquant. Copiez .env.example vers .env.');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET manquant dans .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connecté');

  app.listen(PORT, () => {
    console.log(`API sur le port ${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
