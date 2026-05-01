import Log from '../models/Log.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import Content from '../models/Content.js';

export const getSystemStats = async (req, res) => {
  try {
    const recentLogs = await Log.find().sort({ timestamp: -1 }).limit(100).populate('user', 'name');
    
    // Performance Stats
    const avgResponseTime = await Log.aggregate([
      { $group: { _id: null, avg: { $avg: "$responseTime" } } }
    ]);

    const statusCounts = await Log.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Business Stats
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalEnrollments = await Enrollment.countDocuments();
    const totalCourses = await Content.countDocuments();
    const completedCourses = await Enrollment.countDocuments({ completed: true });

    // Time-based log data for chart
    const timelineData = await Log.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d %H:00", date: "$timestamp" }
          },
          requests: { $sum: 1 },
          avgResponse: { $avg: "$responseTime" }
        }
      },
      { $sort: { "_id": 1 } },
      { $limit: 24 }
    ]);

    res.json({
      recentLogs,
      metrics: {
        avgResponseTime: Math.round(avgResponseTime[0]?.avg || 0),
        statusCounts,
        totalUsers,
        totalEnrollments,
        totalCourses,
        completionRate: totalEnrollments > 0 ? Math.round((completedCourses / totalEnrollments) * 100) : 0
      },
      timelineData
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};
