import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String },
  college: { type: String },
  degree: { type: String },
  skills: [{ type: String }],
  interests: [{ type: String }],
  role: { type: String, enum: ['student', 'admin'], default: 'student' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
