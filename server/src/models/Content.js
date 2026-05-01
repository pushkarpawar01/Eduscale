import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String }, // S3 Link
  pdfUrl: { type: String },   // S3 Link
  duration: { type: String }, // e.g., "10:30"
  isPreview: { type: Boolean, default: false }
});

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  price: { type: Number, default: 0 },
  isFree: { type: Boolean, default: false },
  category: { type: String },
  rating: { type: Number, default: 0 },
  enrollmentStatus: { type: String, enum: ['open', 'closed'], default: 'open' },
  modules: [moduleSchema],
  instructor: { type: String, default: 'Admin' }
}, { timestamps: true });

const Content = mongoose.model('Content', contentSchema);
export default Content;
