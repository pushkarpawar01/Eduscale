import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Content from './src/models/Content.js';

dotenv.config();

const courses = [
  {
    title: 'MERN Stack Development',
    description: 'Master full-stack web development with the MERN Stack (MongoDB, Express.js, React.js & Node.js). Learn to build real-world web applications from scratch.',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
    price: 2800,
    rating: 4.8,
    enrollmentStatus: 'closed'
  },
  {
    title: 'Web development using Flask',
    description: 'Learn to build powerful and scalable web applications using Flask (Python). This hands-on course covers routing, templates, databases, APIs, authentication.',
    imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=2069&auto=format&fit=crop',
    price: 2800,
    rating: 4.5,
    enrollmentStatus: 'closed'
  },
  {
    title: 'Android Development using Flutter',
    description: 'Learn to build modern Android & iOS mobile apps using Flutter & Dart. Create beautiful UI, connect APIs, and deploy real applications. Perfect for beginners.',
    imageUrl: 'https://images.unsplash.com/photo-1607453998774-a53665f58566?q=80&w=1974&auto=format&fit=crop',
    price: 2800,
    rating: 4.7,
    enrollmentStatus: 'closed'
  },
  {
    title: 'Artificial Intelligence & Machine Learning',
    description: 'Dive deep into AI/ML concepts. Learn Python, Data Science libraries, Supervised/Unsupervised learning, Neural Networks, and deploy machine learning models.',
    imageUrl: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?q=80&w=2062&auto=format&fit=crop',
    price: 3500,
    rating: 4.9,
    enrollmentStatus: 'open'
  }
];

const seedDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eduscale';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected for Seeding');

    await Content.deleteMany();
    console.log('Cleared existing content');

    await Content.insertMany(courses);
    console.log('Database seeded with courses');

    process.exit();
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
