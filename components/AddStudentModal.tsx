import React, { useState } from 'react';
import { X, User, Mail, Hash, Building, ChevronRight, Check } from 'lucide-react';
import WebcamCapture from './WebcamCapture';
import { api } from '../services/mockBackend';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    department: 'Computer Science'
  });

  if (!isOpen) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.studentId) {
      setStep(2);
    }
  };

  const handleFaceCapture = async (imageSrc: string) => {
    setIsLoading(true);
    try {
      await api.addStudent({
        ...formData,
        faceImage: imageSrc
      });
      onSuccess();
      onClose();
      // Reset state
      setStep(1);
      setFormData({ name: '', email: '', studentId: '', department: 'Computer Science' });
    } catch (error) {
      console.error(error);
      alert("Failed to add student. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Add New Student</h2>
            <p className="text-xs text-slate-500">Step {step} of 2: {step === 1 ? 'Personal Details' : 'Face Enrollment'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="Enter student name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="student@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Student ID</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      required
                      type="text"
                      value={formData.studentId}
                      onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="ST-2024-XXX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Department</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <select
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none appearance-none bg-white"
                    >
                      <option>Computer Science</option>
                      <option>Engineering</option>
                      <option>Mathematics</option>
                      <option>Physics</option>
                      <option>Business</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-4">
                 <h3 className="font-semibold text-slate-800">Capture Face Biometrics</h3>
                 <p className="text-sm text-slate-500">Ensure the student is looking directly at the camera.</p>
              </div>
              
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-black max-h-[300px] flex items-center justify-center">
                 <WebcamCapture onCapture={handleFaceCapture} isLoading={isLoading} />
              </div>

              <div className="flex justify-between items-center pt-2">
                 <button 
                   onClick={() => setStep(1)}
                   className="text-slate-500 hover:text-slate-800 text-sm font-medium px-2"
                   disabled={isLoading}
                 >
                   Back to details
                 </button>
                 {isLoading && <span className="text-sm text-brand-600 animate-pulse font-medium">Registering Profile...</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddStudentModal;