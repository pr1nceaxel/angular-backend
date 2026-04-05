/** Échappe les métacaractères pour une utilisation sûre dans RegExp */
function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Construit le filtre MongoDB pour GET /assignments (recherche + filtres).
 * Prend en charge les champs importés (matiere, auteur, etc.).
 */
function buildListFilter(query) {
  const clauses = [];

  const q = String(query.q ?? '').trim();
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    clauses.push({
      $or: [
        { nom: rx },
        { subject: rx },
        { matiere: rx },
        { authorName: rx },
        { auteur: rx },
      ],
    });
  }

  const subject = String(query.subject ?? '').trim();
  if (subject) {
    const rx = new RegExp(`^${escapeRegex(subject)}$`, 'i');
    clauses.push({
      $or: [{ subject: rx }, { matiere: rx }],
    });
  }

  const rendu = String(query.rendu ?? '').toLowerCase();
  if (rendu === 'true' || rendu === '1' || rendu === 'oui') {
    clauses.push({ $or: [{ rendu: true }, { rendu: 'true' }] });
  } else if (rendu === 'false' || rendu === '0' || rendu === 'non') {
    clauses.push({ $nor: [{ rendu: true }, { rendu: 'true' }] });
  }

  if (clauses.length === 0) return {};
  if (clauses.length === 1) return clauses[0];
  return { $and: clauses };
}

module.exports = { buildListFilter, escapeRegex };
