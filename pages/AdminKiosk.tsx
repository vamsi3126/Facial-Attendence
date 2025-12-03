import React, { useState, useEffect } from 'react';
import WebcamCapture from '../components/WebcamCapture';
import { api } from '../services/mockBackend';
import { User, AttendanceRecord } from '../types';
import { CheckCircle, AlertCircle, ScanFace, Clock, UserCheck } from 'lucide-react';

const AdminKiosk: React.FC = () => {
  const [lastRecord, setLastRecord] = useState<{user: User, record: AttendanceRecord} | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMsg, setErrorMsg] = useState('');
  const [recentScans, setRecentScans] = useState<{user: User, time: string}[]>([]);

  // Auto-reset success state to allow next student to scan
  useEffect(() => {
    if (status === 'SUCCESS') {
      const timer = setTimeout(() => {
        setStatus('IDLE');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleCapture = async (imageSrc: string) => {
    setStatus('PROCESSING');
    try {
      const result = await api.identifyAndMarkAttendance(imageSrc);
      setLastRecord(result);
      setStatus('SUCCESS');
      
      // Add to local recent scans list
      setRecentScans(prev => [
        { user: result.user, time: new Date().toLocaleTimeString() },
        ...prev
      ].slice(0, 5));

    } catch (err: any) {
      setStatus('ERROR');
      setErrorMsg(err.message || "Identification failed. Please try again.");
    }
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] bg-slate-900 overflow-hidden">
      {/* Main Scanning Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-6 left-6 text-white z-10">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <ScanFace className="text-cyan-400" />
                Attendance Kiosk
            </h1>
            <p className="text-slate-400 text-sm">Face Recognition Active • Secure Mode</p>
        </div>

        <div className="w-full max-w-2xl">
            {/* Success Overlay Card */}
            {status === 'SUCCESS' && lastRecord && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center transform scale-110">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Welcome, {lastRecord.user.name.split(' ')[0]}!</h2>
                        <p className="text-slate-500 mb-6">Attendance Marked Successfully</p>
                        
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-left space-y-2">
                            <div className="flex justify-between">
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Time</span>
                                <span className="font-mono font-medium text-slate-800">
                                    {new Date(lastRecord.record.checkInTime).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Status</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                    lastRecord.record.status === 'LATE' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                }`}>
                                    {lastRecord.record.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Overlay */}
            {status === 'ERROR' && (
                 <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-red-100 text-red-700 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
                    <AlertCircle className="w-5 h-5" />
                    {errorMsg}
                    <button onClick={() => setStatus('IDLE')} className="ml-2 text-red-900 font-bold hover:underline">Retry</button>
                 </div>
            )}

            {/* Camera Frame */}
            <div className={`relative rounded-2xl overflow-hidden shadow-2xl border-4 ${status === 'SUCCESS' ? 'border-green-500' : 'border-slate-700'} bg-black transition-colors duration-300`}>
                <WebcamCapture onCapture={handleCapture} isLoading={status === 'PROCESSING'} />
                
                {/* Visual Guidelines */}
                {status === 'IDLE' && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                        <div className="w-64 h-64 border-2 border-dashed border-white rounded-full"></div>
                    </div>
                )}
            </div>
            
            <p className="text-center text-slate-500 mt-6 animate-pulse">
                {status === 'PROCESSING' ? 'Identifying User...' : 'Look at the camera to mark attendance'}
            </p>
        </div>
      </div>

      {/* Sidebar: Recent Activity */}
      <div className="w-80 bg-slate-800 border-l border-slate-700 p-6 hidden lg:flex flex-col">
        <h3 className="text-slate-300 font-semibold mb-6 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Recent Scans
        </h3>

        <div className="space-y-4">
            {recentScans.length === 0 ? (
                <div className="text-center text-slate-600 py-10">
                    <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No scans yet today</p>
                </div>
            ) : (
                recentScans.map((scan, idx) => (
                    <div key={idx} className="bg-slate-700/50 p-3 rounded-xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-right-2">
                        <img src={scan.user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover bg-slate-600" />
                        <div className="overflow-hidden">
                            <p className="text-white font-medium text-sm truncate">{scan.user.name}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="text-green-400">● Present</span>
                                <span>{scan.time}</span>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-700">
            <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-900/50">
                <h4 className="text-blue-200 font-semibold text-sm mb-1">System Status</h4>
                <div className="flex items-center gap-2 text-xs text-blue-300">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Face Recognition Active
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminKiosk;