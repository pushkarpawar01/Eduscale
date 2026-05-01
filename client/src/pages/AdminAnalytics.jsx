import React, { useState, useEffect } from 'react';
import api from '../utils/axiosInstance';
import Sidebar from '../components/Sidebar';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Activity, Zap, AlertTriangle, Users, BookOpen, Clock, 
  Terminal, Shield, Globe, RefreshCcw 
} from 'lucide-react';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('performance'); // 'performance', 'logs', 'business'

  const fetchData = async () => {
    try {
      const res = await api.get('/api/analytics/stats');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-dark-950 items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary shadow-[0_0_20px_rgba(249,115,22,0.4)]"></div>
      </div>
    );
  }

  const COLORS = ['#f97316', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white text-dark-900 selection:bg-primary/30">
      <Sidebar />
      
      <main className="flex-1 p-6 sm:p-10 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 shrink-0">
          <div>
            <h1 className="text-4xl font-black tracking-tighter flex items-center gap-4 text-black">
              <Activity className="text-primary" size={36} />
              System Nexus
            </h1>
            <p className="text-dark-600 font-bold mt-1">Real-time infrastructure & behavioral analytics</p>
          </div>
          
          <div className="flex bg-dark-50 p-1 rounded-2xl border border-dark-200 backdrop-blur-xl">
            {['performance', 'business', 'logs'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-dark-500 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
            <button onClick={fetchData} className="p-2.5 text-dark-500 hover:text-primary transition-colors">
               <RefreshCcw size={18} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-8">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Zap />} label="Avg Response Time" value={`${data.metrics.avgResponseTime}ms`} color="text-primary" />
            <StatCard icon={<Users />} label="Active Students" value={data.metrics.totalUsers} color="text-accent" />
            <StatCard icon={<BookOpen />} label="Course Enrollments" value={data.metrics.totalEnrollments} color="text-success" />
            <StatCard icon={<Shield />} label="Completion Rate" value={`${data.metrics.completionRate}%`} color="text-blue-500" />
          </div>

          {activeTab === 'performance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-[2.5rem] p-10 border border-dark-200 shadow-xl">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-dark-900">
                  <Clock className="text-primary" /> Traffic & Latency (24h)
                </h3>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.timelineData}>
                      <defs>
                        <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#00000010" vertical={false} />
                      <XAxis dataKey="_id" stroke="#00000060" fontSize={10} tickFormatter={(val) => val.split(' ')[1]} />
                      <YAxis stroke="#00000060" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #00000010', borderRadius: '16px' }} />
                      <Area type="monotone" dataKey="requests" stroke="#f97316" fillOpacity={1} fill="url(#colorReq)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-10 border border-dark-200 shadow-xl">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-dark-900">
                   <Globe className="text-accent" /> API Health Distribution
                </h3>
                <div className="h-[350px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.metrics.statusCounts}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={10}
                        dataKey="count"
                        nameKey="_id"
                      >
                        {data.metrics.statusCounts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '16px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                   {data.metrics.statusCounts.map((s, i) => (
                     <div key={i} className="flex items-center gap-2 text-xs font-bold">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-dark-600">Status {s._id}</span>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-white rounded-[3rem] border border-dark-200 overflow-hidden shadow-xl flex flex-col max-h-[600px]">
              <div className="p-8 border-b border-dark-200 flex items-center justify-between bg-dark-50">
                <h3 className="text-xl font-black flex items-center gap-3 text-dark-900">
                  <Terminal className="text-primary" /> Live Request Stream
                </h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-dark-500">Last 100 entries</span>
              </div>
              <div className="overflow-x-auto overflow-y-auto no-scrollbar font-mono text-sm bg-white">
                <table className="w-full text-left">
                  <thead className="bg-dark-50 sticky top-0 z-10">
                    <tr className="border-b border-dark-200">
                      <th className="px-8 py-4 text-dark-500 font-black uppercase text-[10px] tracking-widest">Method</th>
                      <th className="px-8 py-4 text-dark-500 font-black uppercase text-[10px] tracking-widest">Endpoint</th>
                      <th className="px-8 py-4 text-dark-500 font-black uppercase text-[10px] tracking-widest">Status</th>
                      <th className="px-8 py-4 text-dark-500 font-black uppercase text-[10px] tracking-widest">Latency</th>
                      <th className="px-8 py-4 text-dark-500 font-black uppercase text-[10px] tracking-widest">User</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-100">
                    {data.recentLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-dark-50 transition-colors group">
                        <td className="px-8 py-4">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                            log.method === 'GET' ? 'bg-blue-500/10 text-blue-600' : 
                            log.method === 'POST' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                          }`}>
                            {log.method}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-dark-700 truncate max-w-xs">{log.url}</td>
                        <td className="px-8 py-4">
                          <span className={`font-black ${log.status >= 400 ? 'text-danger' : 'text-success'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-dark-500 font-medium">{log.responseTime}ms</td>
                        <td className="px-8 py-4">
                          <span className="text-dark-900 font-bold">{log.user?.name || 'Guest'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'business' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-dark-200 shadow-xl">
                   <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-dark-900">
                      <Users className="text-accent" /> Student Growth Pattern
                   </h3>
                   <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={data.timelineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#00000010" vertical={false} />
                            <XAxis dataKey="_id" stroke="#00000060" fontSize={10} tickFormatter={(val) => val.split(' ')[1]} />
                            <YAxis stroke="#00000060" fontSize={10} />
                            <Tooltip cursor={{fill: '#00000005'}} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #00000010', borderRadius: '16px' }} />
                            <Bar dataKey="requests" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
                <div className="bg-white rounded-[2.5rem] p-10 border border-dark-200 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden group">
                   <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <AlertTriangle className="text-primary mb-6 animate-bounce" size={48} />
                   <h4 className="text-2xl font-black mb-3 text-dark-900">Health Alert</h4>
                   <p className="text-dark-500 text-sm font-medium mb-8">All systems operational. Performance within 98th percentile of baseline.</p>
                   <button className="px-8 py-3 bg-primary text-white font-black rounded-2xl hover:scale-105 transition-transform shadow-xl">
                      View incidents
                   </button>
                </div>
             </div>
          )}

        </div>
      </main>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-[2rem] p-8 border border-dark-200 hover:border-primary transition-all shadow-xl group">
    <div className={`w-12 h-12 rounded-2xl bg-dark-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${color}`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <p className="text-dark-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-black text-dark-900">{value}</p>
  </div>
);

export default AdminAnalytics;
