import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectName: { type: String, required: true },
  totalClasses: { type: Number, default: 0 },
  attendedClasses: { type: Number, default: 0 },
  color: { type: String, default: '#3525cd' }, // For visual identity
}, { timestamps: true });

export const Subject = mongoose.model('Subject', subjectSchema);
