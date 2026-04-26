import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  enrollmentStatus: { type: String, enum: ['open', 'closed'], default: 'open' }
}, { timestamps: true });

const Content = mongoose.model('Content', contentSchema);
export default Content;
