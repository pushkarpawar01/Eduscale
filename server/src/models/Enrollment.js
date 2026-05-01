import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'free'],
    default: 'pending'
  },
  paymentId: {
    type: String // Transaction ID
  },
  progress: {
    type: Number,
    default: 0 // Percentage
  },
  completedModules: [{
    type: String // IDs or Titles of completed modules
  }],
  completed: {
    type: Boolean,
    default: false
  },
  completionDate: {
    type: Date
  }
}, { timestamps: true });

// Ensure a user can't enroll in the same course twice
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;
