import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const check = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eduscale';
    await mongoose.connect(mongoURI);
    console.log('Connected to DB');

    const users = await User.find({});
    console.log('Total users:', users.length);
    users.forEach(u => {
      console.log(`- ${u.email} (Role: ${u.role})`);
    });

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

check();
