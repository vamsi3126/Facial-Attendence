import React, { useEffect, useState } from 'react';
import { api } from '../services/mockBackend';
import { AttendanceRecord, AttendanceStatus, User } from '../types';
import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const allRecords = await api.getAllAttendance();
      const students = await api.getAllStudents();
      
      const today = new Date().toISOString().split('T')[0];
      const todaysRecords = allRecords.filter(r => r.date === today);

      setStats({
        totalStudents: students.length,
        presentToday: todaysRecords.filter(r => r.status === AttendanceStatus.PRESENT).length,
        lateToday: todaysRecords.filter(r => r.status === AttendanceStatus.LATE).length,
        absentToday: students.length - todaysRecords.length // Simplified logic
      });

      // Prepare chart data (Last 5 days)
      const last5Days = [...Array(5)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const data = last5Days.map(date => {
        const dayRecords = allRecords.filter(r => r.date === date);
        return {
          name: date.slice(5), // MM-DD
          present: dayRecords.filter(r => r.status === AttendanceStatus.PRESENT).length,
          late: dayRecords.filter(r => r.status === AttendanceStatus.LATE).length,
          absent: dayRecords.filter(r => r.status === AttendanceStatus.ABSENT).length,
        };
      });
      setChartData(data);
    };
    fetchData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${bg}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500">Overview of organization attendance metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="text-blue-600" bg="bg-blue-100" />
        <StatCard title="Present Today" value={stats.presentToday} icon={CheckCircle} color="text-green-600" bg="bg-green-100" />
        <StatCard title="Late Today" value={stats.lateToday} icon={Clock} color="text-orange-600" bg="bg-orange-100" />
        <StatCard title="Absent Today" value={stats.absentToday} icon={AlertCircle} color="text-red-600" bg="bg-red-100" />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="font-bold text-slate-800 text-lg mb-6">Attendance Trends (Last 5 Days)</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{fill: '#f1f5f9'}}
              />
              <Bar dataKey="present" name="Present" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="late" name="Late" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;