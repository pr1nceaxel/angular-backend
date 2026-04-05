const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    dateDeRendu: { type: Date, required: true },
    rendu: { type: Boolean, default: false },

    authorName: { type: String, trim: true, default: '' },
    authorPhoto: { type: String, trim: true, default: '' },

    subject: { type: String, required: true, trim: true },
    subjectImageUrl: { type: String, trim: true, default: '' },
    teacherName: { type: String, trim: true, default: '' },
    teacherPhotoUrl: { type: String, trim: true, default: '' },

    /** Note sur 20 ; obligatoire si rendu === true */
    grade: { type: Number, min: 0, max: 20, default: null },
    remarks: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

assignmentSchema.pre('validate', function (next) {
  if (this.rendu === true && (this.grade === null || this.grade === undefined)) {
    this.invalidate('grade', 'Une note est requise pour marquer le devoir comme rendu.');
  }
  next();
});

module.exports = mongoose.model('Assignment', assignmentSchema);
