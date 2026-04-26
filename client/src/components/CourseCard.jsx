import React from 'react';
import { Star, BookOpen } from 'lucide-react';

const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl border border-dark-200 transition-all duration-300 flex flex-col h-full hover:-translate-y-1 group">
      <div className="relative h-[180px] overflow-hidden">
        <img 
          src={course.imageUrl} 
          alt={course.title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
        />
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-bold mb-2 flex items-start gap-1 text-dark-900">
          <BookOpen size={20} className="text-accent shrink-0 mt-1" />
          {course.title}
        </h3>
        <p className="text-dark-600 text-sm mb-6 flex-1">{course.description}</p>
        
        <div className="flex justify-between items-center mb-6">
          <span className="text-xl font-bold text-accent">Rs{course.price}</span>
          <span className="flex items-center gap-1 text-sm text-dark-600">
            <Star size={16} fill="#fbbf24" className="text-[#fbbf24]" />
            {course.rating.toFixed(1)}
          </span>
        </div>

        <button className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-md font-semibold flex items-center justify-center gap-2 transition-colors duration-150">
          <Star size={18} /> Show Interest
        </button>
        <p className="text-center text-xs text-danger mt-2">Batch is full - Enrollment closed</p>
      </div>
    </div>
  );
};

export default CourseCard;
