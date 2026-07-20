"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useMemo } from 'react';

const COLORS = ['#1C2439', '#E76257', '#0EA5E9', '#F59E0B', '#10B981', '#8B5CF6'];

export function DashboardCharts({ vendors = [] }: { vendors: any[] }) {
  
  const categoryData = useMemo(() => {
    const counts = vendors.reduce((acc, v) => {
      acc[v.category] = (acc[v.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [vendors]);

  const slaData = useMemo(() => {
    // Return real vendor promise vs actual
    return vendors.slice(0, 10).map(v => ({
      name: v.name.substring(0, 8) + (v.name.length > 8 ? '...' : ''),
      Promise: Number(v.sla_uptime_promise || 0),
      Actual: Number(v.actual_sla || v.sla_uptime_promise || 0) // fallback to promise if actual missing
    }));
  }, [vendors]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
      <div className="bg-white border border-slate-200 rounded-md shadow-sm p-5">
        <h3 className="font-semibold text-[#1C2439] mb-6">Realtime SLA Performance (Top 10)</h3>
        <div className="h-[300px] w-full">
          {slaData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={slaData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 11}} dy={10} />
                <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 11}} dx={-10} />
                <RechartsTooltip 
                  wrapperStyle={{ zIndex: 100 }}
                  contentStyle={{ borderRadius: '6px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                  itemStyle={{ fontWeight: 500 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Promise" stroke="#1C2439" strokeWidth={2} dot={{r: 3}} activeDot={{r: 5}} />
                <Line type="monotone" dataKey="Actual" stroke="#E76257" strokeWidth={2} dot={{r: 3}} activeDot={{r: 5}} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
             <div className="text-sm text-slate-500 font-medium h-full flex items-center justify-center">No SLA data available.</div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-sm p-5">
        <h3 className="font-semibold text-[#1C2439] mb-6">Vendor Distribution by Category</h3>
        <div className="h-[300px] w-full flex items-center justify-center relative">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  wrapperStyle={{ zIndex: 100 }}
                  contentStyle={{ borderRadius: '6px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                  itemStyle={{ color: '#1C2439', fontWeight: 500 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="text-sm text-slate-500 font-medium">No vendors found.</div>
          )}
          {/* Inner Text */}
          {categoryData.length > 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
              <span className="text-3xl font-bold text-[#1C2439]">{categoryData.length}</span>
              <span className="text-xs text-slate-500 font-medium">Categories</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
