import React, { useState } from 'react';
import WebcamCapture from '../components/WebcamCapture';
import { api } from '../services/mockBackend';
import { User, AttendanceRecord } from '../types';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface MarkAttendanceProps {
  user: User;
}

const MarkAttendance: React.FC<MarkAttendanceProps> = ({ user }) => {
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCapture = async (imageSrc: string) => {
    setStatus('PROCESSING');
    try {
      const result = await api.markAttendance(user.id, imageSrc);
      setRecord(result);
      setStatus('SUCCESS');
    } catch (err: any) {
      setStatus('ERROR');
      setErrorMsg(err.message || "Face verification failed. Please try again.");
    }
  };

  const reset = () => {
    setStatus('IDLE');
    setRecord(null);
    setErrorMsg('');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Mark Attendance</h1>
        <p className="text-slate-500">Align your face within the frame to verify identity.</p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 flex flex-col items-center">
        {status === 'IDLE' || status === 'PROCESSING' ? (
          <WebcamCapture onCapture={handleCapture} isLoading={status === 'PROCESSING'} />
        ) : status === 'SUCCESS' ? (
          <div className="text-center space-y-6 py-8 animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Attendance Marked!</h2>
              <p className="text-slate-500 mt-2">Verified with {Math.round((record?.confidenceScore || 0) * 100)}% confidence.</p>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-xl text-left max-w-sm mx-auto border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500 text-sm">Date</span>
                    <span className="font-semibold text-slate-800">{record?.date}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500 text-sm">Time</span>
                    <div className="flex items-center text-brand-600 font-bold">
                        <Clock className="w-4 h-4 mr-1" />
                        {record?.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : ''}
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                        record?.status === 'LATE' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                    }`}>
                        {record?.status}
                    </span>
                </div>
            </div>

            <button onClick={reset} className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
              Done
            </button>
          </div>
        ) : (
          <div className="text-center space-y-6 py-8">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Verification Failed</h2>
              <p className="text-red-500 mt-2">{errorMsg}</p>
            </div>
            <button onClick={reset} className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start space-x-3">
              <div className="bg-blue-200 p-2 rounded-lg text-blue-700">🔍</div>
              <div>
                  <h3 className="font-semibold text-blue-900">Anti-Spoofing</h3>
                  <p className="text-sm text-blue-700 mt-1">Liveness detection active to prevent photo misuse.</p>
              </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-start space-x-3">
              <div className="bg-purple-200 p-2 rounded-lg text-purple-700">⚡</div>
              <div>
                  <h3 className="font-semibold text-purple-900">Fast & Secure</h3>
                  <p className="text-sm text-purple-700 mt-1">MediaPipe Mesh ensures high accuracy identification.</p>
              </div>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-start space-x-3">
              <div className="bg-emerald-200 p-2 rounded-lg text-emerald-700">📍</div>
              <div>
                  <h3 className="font-semibold text-emerald-900">Geo-Tagging</h3>
                  <p className="text-sm text-emerald-700 mt-1">Location recorded for audit compliance.</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default MarkAttendance;
