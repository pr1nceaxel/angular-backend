const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { login: payload.login, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Action réservée aux administrateurs' });
  }
  next();
}

module.exports = { authRequired, adminOnly };
