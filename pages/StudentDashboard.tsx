import React, { useEffect, useState } from 'react';
import { User, AttendanceRecord, AttendanceStatus } from '../types';
import { api } from '../services/mockBackend';
import { Calendar, Check, Clock, X, PieChart as PieIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface StudentDashboardProps {
  user: User;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, rate: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const data = await api.getStudentAttendance(user.id);
      setRecords(data);
      
      const present = data.filter(r => r.status === AttendanceStatus.PRESENT).length;
      const late = data.filter(r => r.status === AttendanceStatus.LATE).length;
      const absent = data.filter(r => r.status === AttendanceStatus.ABSENT).length;
      const total = data.length || 1;
      
      setStats({
        present,
        late,
        absent,
        rate: Math.round(((present + late) / total) * 100) || 0
      });
    };
    fetchData();
  }, [user.id]);

  const chartData = [
    { name: 'Present', value: stats.present, color: '#22c55e' },
    { name: 'Late', value: stats.late, color: '#f97316' },
    { name: 'Absent', value: stats.absent, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Hello, {user.name}</h1>
            <p className="text-slate-500">Student ID: {user.studentId} • {user.department}</p>
          </div>
          <div className="mt-4 md:mt-0 bg-brand-50 text-brand-700 px-4 py-2 rounded-lg border border-brand-100 font-medium flex items-center">
             <Calendar className="w-4 h-4 mr-2" />
             {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">Attendance Rate</p>
          <div className="flex items-end space-x-2 mt-2">
            <h3 className="text-4xl font-bold text-brand-600">{stats.rate}%</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-2">
             <div className="p-2 bg-green-100 rounded-lg"><Check className="w-5 h-5 text-green-600" /></div>
             <p className="text-slate-500 text-sm font-medium">Total Present</p>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mt-2 ml-1">{stats.present} Days</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="flex items-center space-x-2">
             <div className="p-2 bg-orange-100 rounded-lg"><Clock className="w-5 h-5 text-orange-600" /></div>
             <p className="text-slate-500 text-sm font-medium">Total Late</p>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mt-2 ml-1">{stats.late} Days</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="flex items-center space-x-2">
             <div className="p-2 bg-red-100 rounded-lg"><X className="w-5 h-5 text-red-600" /></div>
             <p className="text-slate-500 text-sm font-medium">Total Absent</p>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mt-2 ml-1">{stats.absent} Days</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent History */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 text-lg">Recent History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Check In</th>
                  <th className="px-6 py-4">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  records.slice(0, 5).map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{record.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${record.status === 'PRESENT' ? 'bg-green-100 text-green-800' : 
                            record.status === 'LATE' ? 'bg-orange-100 text-orange-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono">
                        {record.checkInTime !== '-' ? new Date(record.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {record.confidenceScore > 0 ? `${(record.confidenceScore * 100).toFixed(1)}%` : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <h2 className="font-bold text-slate-800 text-lg mb-4">Overview</h2>
          <div className="flex-1 min-h-[250px] relative">
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                    No data to display
                </div>
            )}
            {/* Center Text Overlay */}
            {chartData.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                   <div className="text-center">
                       <span className="block text-3xl font-bold text-slate-800">{records.length}</span>
                       <span className="text-xs text-slate-400 uppercase">Total</span>
                   </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;