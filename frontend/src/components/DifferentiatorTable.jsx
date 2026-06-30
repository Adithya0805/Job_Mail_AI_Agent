import React from 'react';

export default function DifferentiatorTable() {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-900 bg-slate-950">
      <table className="w-full text-left border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-slate-900 bg-slate-900/30 text-slate-400 font-semibold">
            <th className="p-4 sm:p-5">Feature</th>
            <th className="p-4 sm:p-5 text-indigo-400 font-bold">Job Mail AI</th>
            <th className="p-4 sm:p-5">Generic AI Chat</th>
            <th className="p-4 sm:p-5">Old Templates</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900 text-slate-300">
          <tr>
            <td className="p-4 sm:p-5 font-medium text-white">Remembers background</td>
            <td className="p-4 sm:p-5 text-indigo-300 font-semibold bg-indigo-500/5">Yes (once)</td>
            <td className="p-4 sm:p-5 text-slate-500">No (re-explain every time)</td>
            <td className="p-4 sm:p-5 text-slate-500">N/A static</td>
          </tr>
          <tr>
            <td className="p-4 sm:p-5 font-medium text-white">Reads the actual JD</td>
            <td className="p-4 sm:p-5 text-indigo-300 font-semibold bg-indigo-500/5">Yes (extracts requirements)</td>
            <td className="p-4 sm:p-5 text-slate-500">Only if you paste it well</td>
            <td className="p-4 sm:p-5 text-slate-500">No</td>
          </tr>
          <tr>
            <td className="p-4 sm:p-5 font-medium text-white">Application tracking</td>
            <td className="p-4 sm:p-5 text-indigo-300 font-semibold bg-indigo-500/5">Built-in dashboard</td>
            <td className="p-4 sm:p-5 text-slate-500">None</td>
            <td className="p-4 sm:p-5 text-slate-500">None</td>
          </tr>
          <tr>
            <td className="p-4 sm:p-5 font-medium text-white">Bulk apply</td>
            <td className="p-4 sm:p-5 text-indigo-300 font-semibold bg-indigo-500/5">25 jobs at once</td>
            <td className="p-4 sm:p-5 text-slate-500">One at a time</td>
            <td className="p-4 sm:p-5 text-slate-500">Manual copy-paste</td>
          </tr>
          <tr>
            <td className="p-4 sm:p-5 font-medium text-white">Signup required</td>
            <td className="p-4 sm:p-5 text-indigo-300 font-semibold bg-indigo-500/5">None</td>
            <td className="p-4 sm:p-5 text-slate-500">Account needed</td>
            <td className="p-4 sm:p-5 text-slate-500">N/A</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
