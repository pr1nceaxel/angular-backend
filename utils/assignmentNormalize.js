/**
 * Normalise les documents assignments (schéma Mongoose) et les jeux importés
 * (Mockaroo / cours : matiere, note, auteur, prof, remarques, imageMatiere, rendu string).
 */

const SUBJECTS_CATALOG = require('../config/subjectsCatalog');

function isHttpUrl(s) {
  if (s == null || typeof s !== 'string') return false;
  return /^https?:\/\//i.test(s.trim());
}

/** Si la matière est dans le catalogue et les URLs sont absentes ou type « nodejs.png », on applique les mêmes URLs que le front. */
function enrichImagesFromCatalog(o) {
  const label = String(o.subject || o.matiere || '').trim();
  if (!label) return;
  const cat = SUBJECTS_CATALOG.find((s) => s.label.toLowerCase() === label.toLowerCase());
  if (!cat) return;

  if (!isHttpUrl(o.subjectImageUrl)) {
    o.subjectImageUrl = cat.subjectImageUrl;
  }
  if (!isHttpUrl(o.teacherPhotoUrl)) {
    o.teacherName = cat.teacherName;
    o.teacherPhotoUrl = cat.teacherPhotoUrl;
  }
}

/** Avatar élève : si pas d’URL valide (import Mockaroo sans photo), pravatar stable selon le nom. */
function enrichAuthorPhotoIfNeeded(o) {
  if (isHttpUrl(o.authorPhoto)) return;
  const name = String(o.authorName || o.auteur || '').trim();
  if (!name) return;
  let h = 0;
  for (let i = 0; i < name.length; i += 1) {
    h = (h + name.charCodeAt(i) * (i + 1)) % 69;
  }
  o.authorPhoto = `https://i.pravatar.cc/150?img=${h + 1}`;
}

function coerceRendu(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const s = value.trim().toLowerCase();
    return s === 'true' || s === '1' || s === 'oui' || s === 'yes';
  }
  return Boolean(value);
}

/** Parse "2027/11/03", ISO, ou Date */
function parseDateDeRendu(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const s = String(value).trim();
  const m = /^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/.exec(s);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const dt = new Date(y, mo - 1, d);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  const dt = new Date(s);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

/**
 * Forme attendue par le front Angular : subject, grade, remarks, rendu boolean, dateDeRendu ISO.
 */
function toApiShape(doc) {
  if (!doc || typeof doc !== 'object') return doc;

  const o = { ...doc };

  if (o.subject == null || String(o.subject).trim() === '') {
    if (o.matiere != null && String(o.matiere).trim() !== '') {
      o.subject = String(o.matiere).trim();
    }
  }

  if ((o.grade === null || o.grade === undefined) && o.note != null && o.note !== '') {
    const n = Number(o.note);
    o.grade = Number.isFinite(n) ? n : null;
  }

  if (!o.authorName && o.auteur != null) {
    o.authorName = String(o.auteur).trim();
  }

  if (!o.subjectImageUrl && o.imageMatiere != null) {
    const img = String(o.imageMatiere).trim();
    o.subjectImageUrl = img.startsWith('http') ? img : img;
  }

  if (!o.teacherName && o.prof != null) {
    o.teacherName = String(o.prof).trim();
  }

  if (o.remarks === undefined || o.remarks === null || o.remarks === '') {
    if (o.remarques != null) {
      o.remarks = String(o.remarques);
    }
  }

  o.rendu = coerceRendu(o.rendu);

  const parsed = parseDateDeRendu(o.dateDeRendu);
  if (parsed) {
    o.dateDeRendu = parsed.toISOString();
  }

  enrichImagesFromCatalog(o);
  enrichAuthorPhotoIfNeeded(o);

  return o;
}

/**
 * Corps requête → champs schéma Mongoose (aliases import inclus).
 */
function bodyToSchemaFields(body) {
  const gradeRaw = body.grade ?? body.note;
  const grade =
    gradeRaw === '' || gradeRaw === undefined || gradeRaw === null
      ? null
      : Number(gradeRaw);

  const subject = (body.subject ?? body.matiere ?? '').trim();
  const dateSrc = body.dateDeRendu;
  let dateDeRendu;
  if (dateSrc) {
    dateDeRendu = parseDateDeRendu(dateSrc);
    if (!dateDeRendu) {
      const d = new Date(dateSrc);
      dateDeRendu = Number.isNaN(d.getTime()) ? undefined : d;
    }
  }

  return {
    nom: body.nom,
    dateDeRendu,
    rendu: coerceRendu(body.rendu),
    authorName: (body.authorName ?? body.auteur ?? '').trim(),
    authorPhoto: (body.authorPhoto ?? '').trim(),
    subject,
    subjectImageUrl: (body.subjectImageUrl ?? body.imageMatiere ?? '').trim(),
    teacherName: (body.teacherName ?? body.prof ?? '').trim(),
    teacherPhotoUrl: (body.teacherPhotoUrl ?? '').trim(),
    grade: Number.isFinite(grade) ? grade : null,
    remarks: (body.remarks ?? body.remarques ?? '').trim(),
  };
}

module.exports = {
  toApiShape,
  bodyToSchemaFields,
  coerceRendu,
  parseDateDeRendu,
};
