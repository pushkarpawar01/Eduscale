import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Content from './src/models/Content.js';
import User from './src/models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const courses = [
  {
    title: 'MERN Stack Development',
    description: 'Master full-stack web development with the MERN Stack (MongoDB, Express.js, React.js & Node.js). Learn to build real-world web applications from scratch.',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
    price: 2800,
    isFree: false,
    rating: 4.8,
    modules: [
      { title: 'Introduction to MERN', duration: '15:00', isPreview: true },
      { title: 'MongoDB Deep Dive', duration: '45:00' }
    ]
  },
  {
    title: 'Python for Beginners',
    description: 'Start your coding journey with Python. Perfect for absolute beginners who want to learn automation, web dev, or data science.',
    imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=2069&auto=format&fit=crop',
    price: 0,
    isFree: true,
    rating: 4.5,
    modules: [
      { title: 'Python Setup', duration: '10:00', isPreview: true },
      { title: 'Variables & Types', duration: '20:00' }
    ]
  }
];

const seedDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eduscale';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected for Seeding');

    await Content.deleteMany();
    await User.deleteMany();
    console.log('Cleared existing data');

    // Seed Courses
    await Content.insertMany(courses);
    console.log('Database seeded with courses');

    // Seed Admin
    const salt = await bcrypt.genSalt(10);
    const plainPassword = 'admin';
    const adminPassword = await bcrypt.hash(plainPassword, salt);
    
    const admin = new User({
      name: 'Super Admin',
      email: 'admin@eduscale.com',
      password: adminPassword,
      role: 'admin'
    });
    
    await admin.save();
    console.log(`Admin user created: admin@eduscale.com / ${plainPassword}`);

    process.exit();
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
