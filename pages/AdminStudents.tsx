import React, { useEffect, useState } from 'react';
import { api } from '../services/mockBackend';
import { User } from '../types';
import { Plus, Search, MoreVertical, Edit, Trash } from 'lucide-react';
import AddStudentModal from '../components/AddStudentModal';

const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStudents = async () => {
    const data = await api.getAllStudents();
    setStudents(data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.studentId && s.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Students</h1>
          <p className="text-slate-500">Register new faces and update profiles.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Add Student</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search by name, ID or email..." 
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="text-sm text-slate-500">
                Showing {filteredStudents.length} students
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <img src={student.avatarUrl} alt="" className="w-10 h-10 rounded-full bg-slate-200 object-cover" />
                        <div>
                            <p className="font-semibold text-slate-900">{student.name}</p>
                            <p className="text-xs text-slate-500">{student.email}</p>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">{student.studentId}</td>
                  <td className="px-6 py-4">{student.department}</td>
                  <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                      </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-slate-200 rounded text-slate-500 hover:text-brand-600" title="Edit">
                            <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded text-slate-500 hover:text-red-600" title="Delete">
                            <Trash className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                  <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                          No students found matching your search.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddStudentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchStudents} 
      />
    </div>
  );
};

export default AdminStudents;