import React, { useState } from 'react';
import { Star, BookOpen, CheckCircle, CreditCard } from 'lucide-react';
import api from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course, isEnrolled }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEnroll = async () => {
    if (isEnrolled) {
      navigate(`/learn/${course._id}`);
      return;
    }

    if (course.isFree) {
      handleFreeEnroll();
    } else {
      handleRazorpayPayment();
    }
  };

  const handleFreeEnroll = async () => {
    setLoading(true);
    try {
      await api.post('/api/enrollment/enroll', { courseId: course._id });
      alert('Enrolled successfully! A confirmation email has been sent.');
      navigate(`/learn/${course._id}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to enroll');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      // 1. Create Order
      const orderRes = await api.post('/api/payment/order', { courseId: course._id });
      const { order, key_id } = orderRes.data;

      // 2. Open Razorpay
      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Eduscale",
        description: `Course: ${course.title.substring(0, 30)}`,
        image: course.imageUrl || "https://eduscale.com/logo.png", // Ensure absolute URL
        order_id: order.id,
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        },
        handler: async (response) => {
          try {
            // 3. Verify Payment
            const verifyRes = await api.post('/api/payment/verify', {
              ...response,
              courseId: course._id
            });
            alert("Payment successful! Welcome to the course.");
            navigate(`/learn/${course._id}`);
          } catch (error) {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "", // Will be filled by Razorpay or can be passed from auth context
          email: "",
          contact: ""
        },
        theme: {
          color: "#f97316"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-dark-200 transition-all duration-300 flex flex-col h-full hover:-translate-y-1 group">
      <div className="relative h-[180px] overflow-hidden">
        <img 
          src={course.imageUrl} 
          alt={course.title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
        />
        {course.isFree && (
          <div className="absolute top-4 left-4 bg-success text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            FREE
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-bold mb-2 flex items-start gap-1 text-dark-900">
          <BookOpen size={20} className="text-primary shrink-0 mt-1" />
          {course.title}
        </h3>
        <p className="text-dark-500 text-sm mb-6 flex-1 line-clamp-3">{course.description}</p>
        
        <div className="flex justify-between items-center mb-6">
          <span className="text-xl font-bold text-dark-900">
            {course.isFree ? 'Free' : `₹${course.price}`}
          </span>
          <span className="flex items-center gap-1 text-sm text-dark-600 bg-dark-50 px-2 py-1 rounded-lg">
            <Star size={16} fill="#fbbf24" className="text-[#fbbf24]" />
            {course.rating?.toFixed(1) || '0.0'}
          </span>
        </div>

        <button 
          onClick={handleEnroll}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-sm active:scale-[0.98] ${
            isEnrolled 
              ? 'bg-success/10 text-success border border-success/20 hover:bg-success/20' 
              : 'bg-primary text-white hover:bg-primary-hover shadow-primary/20 hover:shadow-primary/30'
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isEnrolled ? (
            <>
              <CheckCircle size={20} /> Continue Learning
            </>
          ) : (
            <>
              {course.isFree ? <BookOpen size={20} /> : <CreditCard size={20} />}
              {course.isFree ? 'Enroll Now' : 'Buy Course'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
