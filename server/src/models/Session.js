import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date }
});

const Session = mongoose.model('Session', sessionSchema);
export default Session;
