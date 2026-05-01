import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
  method: String,
  url: String,
  status: Number,
  responseTime: Number, // in ms
  ip: String,
  userAgent: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Log', LogSchema);
