import React, { useState } from 'react';
import { Terminal, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

const SuperAdminLogs = () => {
  const [logs] = useState([
    { id: 1, type: 'info', message: 'System boot sequence completed', time: '10:45 AM', user: 'SYSTEM' },
    { id: 2, type: 'warning', message: 'High CPU usage detected on Node 3', time: '10:30 AM', user: 'SYSTEM' },
    { id: 3, type: 'success', message: 'New Hospital Registered: City Care Clinic', time: '09:15 AM', user: 'superadmin' },
    { id: 4, type: 'error', message: 'Failed authentication attempt', time: '08:45 AM', user: 'unknown' },
    { id: 5, type: 'info', message: 'Database backup completed', time: '01:00 AM', user: 'SYSTEM' },
    { id: 6, type: 'success', message: 'AI Risk Model weights updated', time: 'Yesterday', user: 'SYSTEM' },
  ]);

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-8 font-sans bg-[#f4fafe] min-h-screen rounded-[32px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 bg-white p-5 rounded-2xl shadow-sm border border-[#e6f4fc]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-sm">
            <Terminal size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">System Logs</h1>
            <p className="text-sm text-gray-500 font-medium">Global platform audit trails and server telemetry</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User/Source</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-gray-50 hover:bg-[#f9fcff] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600 flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" /> {log.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.type === 'info' && <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold">INFO</span>}
                    {log.type === 'warning' && <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded text-xs font-bold">WARN</span>}
                    {log.type === 'error' && <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-bold">ERROR</span>}
                    {log.type === 'success' && <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-xs font-bold">SUCCESS</span>}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">
                    {log.message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-500 font-mono">
                    {log.user}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogs;
