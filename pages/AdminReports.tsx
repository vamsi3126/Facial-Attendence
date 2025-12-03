import React, { useEffect, useState } from 'react';
import { api } from '../services/mockBackend';
import { AttendanceRecord, AttendanceStatus } from '../types';
import { Download, Filter, Calendar } from 'lucide-react';

const AdminReports: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const data = await api.getAllAttendance();
      // Sort by date desc, time desc
      const sorted = data.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
      setRecords(sorted);
      setFilteredRecords(sorted);
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!dateFilter) {
      setFilteredRecords(records);
    } else {
      setFilteredRecords(records.filter(r => r.date === dateFilter));
    }
  }, [dateFilter, records]);

  const exportToCSV = () => {
    const headers = ["Record ID", "Student ID", "Name", "Date", "Check In Time", "Status", "Confidence"];
    const rows = filteredRecords.map(r => [
      r.id,
      r.userId,
      r.userName,
      r.date,
      r.checkInTime,
      r.status,
      r.confidenceScore
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Attendance Log</h1>
          <p className="text-slate-500">View and export daily attendance records.</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
        >
          <Download className="w-5 h-5" />
          <span>Export Excel/CSV</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-slate-500">
                <Filter className="w-5 h-5" />
                <span className="text-sm font-medium">Filter by Date:</span>
            </div>
            <div className="relative">
                <Calendar className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
                <input 
                    type="date" 
                    className="pl-10 pr-4 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                />
            </div>
            {dateFilter && (
                <button 
                    onClick={() => setDateFilter('')}
                    className="text-sm text-brand-600 hover:underline"
                >
                    Clear
                </button>
            )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{r.userName}</td>
                  <td className="px-6 py-4">{r.date}</td>
                  <td className="px-6 py-4 font-mono">
                      {r.checkInTime !== '-' ? new Date(r.checkInTime).toLocaleTimeString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${r.status === AttendanceStatus.PRESENT ? 'bg-green-100 text-green-800' : 
                        r.status === 'LATE' ? 'bg-orange-100 text-orange-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {r.confidenceScore > 0 ? `${(r.confidenceScore * 100).toFixed(2)}%` : 'N/A'}
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                  <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                          No records found.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;