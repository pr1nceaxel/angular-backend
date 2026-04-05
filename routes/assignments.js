const express = require('express');
const Assignment = require('../models/Assignment');
const { authRequired, adminOnly } = require('../middleware/auth');
const { toApiShape, bodyToSchemaFields } = require('../utils/assignmentNormalize');
const { buildListFilter } = require('../utils/assignmentQuery');

const router = express.Router();

router.get('/', authRequired, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = buildListFilter(req.query);
    // Plus récent en haut : ObjectId reflète l’ordre d’insertion (nouveaux devoirs d’abord)
    const sort = { _id: -1 };

    const [items, total] = await Promise.all([
      Assignment.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Assignment.countDocuments(filter),
    ]);

    res.json({
      data: items.map((doc) => toApiShape(doc)),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/:id', authRequired, async (req, res) => {
  try {
    const doc = await Assignment.findById(req.params.id).lean();
    if (!doc) {
      return res.status(404).json({ message: 'Assignment introuvable' });
    }
    res.json(toApiShape(doc));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/', authRequired, async (req, res) => {
  try {
    const body = bodyToSchemaFields(req.body);
    const assignment = new Assignment(body);
    await assignment.save();
    res.status(201).json(toApiShape(assignment.toObject()));
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message, errors: err.errors });
    }
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/:id', authRequired, adminOnly, async (req, res) => {
  try {
    const body = bodyToSchemaFields(req.body);
    const updated = await Assignment.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ message: 'Assignment introuvable' });
    }
    res.json(toApiShape(updated.toObject()));
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message, errors: err.errors });
    }
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.delete('/:id', authRequired, adminOnly, async (req, res) => {
  try {
    const deleted = await Assignment.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Assignment introuvable' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
