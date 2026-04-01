"use client";

import { useEffect, useState } from "react";
import { Users, Shield, LayoutDashboard, Clock, UserCheck, Activity, Terminal, ChevronRight, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";
import { format } from "date-fns";

export default function AdminMonitoringPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    fetchRecentHistory();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentHistory = async () => {
    try {
      // Fetch history or use dynamic simulation if not ready
      const res = await fetch("/api/logs?limit=5");
      if (res.ok) {
        const data = await res.json();
        setHistory(Array.isArray(data) ? data.slice(0, 5) : []);
      }
    } catch (e) {
      console.error("History fetch error:", e);
    }
  };

  if (loading) return <div className="p-8 text-slate-500 animate-pulse">Yuklanmoqda...</div>;

  // Suyuqli area chart uchun faollik (AreaChart simulyatsiyasi)
  const activityData = [
    { name: "Du", faollik: 12 },
    { name: "Se", faollik: 45 },
    { name: "Cho", faollik: 28 },
    { name: "Pay", faollik: 80 },
    { name: "Ju", faollik: 95 },
    { name: "Sha", faollik: 40 },
    { name: "Yak", faollik: 15 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
             <div className="p-2 bg-blue-100 rounded-xl text-blue-600 shadow-inner">
               <Activity className="w-6 h-6" />
             </div>
             Admin Monitoring
           </h1>
           <p className="text-sm font-medium text-slate-500 mt-2">Tizim holati, real vaqt faolligi va foydalanuvchilar harakatini tahlil qilish paneli.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-colors">
           <div className="flex justify-between items-start mb-4">
             <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
               <Users className="w-5 h-5" />
             </div>
             <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"><TrendingUp className="w-3 h-3"/> +12%</span>
           </div>
           <div>
             <p className="text-3xl font-black text-slate-900 tracking-tight">{stats?.totalUsers || 0}</p>
             <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Jami foydalanuvchi</p>
           </div>
        </div>

        {/* Faculties/Deans */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-colors">
           <div className="flex justify-between items-start mb-4">
             <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
               <UserCheck className="w-5 h-5" />
             </div>
             <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">Barqaror</span>
           </div>
           <div>
             <p className="text-3xl font-black text-slate-900 tracking-tight">{stats?.totalDeans || 0}</p>
             <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Dekanlar</p>
           </div>
        </div>

        {/* Departments/HODs */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-colors">
           <div className="flex justify-between items-start mb-4">
             <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
               <Shield className="w-5 h-5" />
             </div>
             <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full"><TrendingUp className="w-3 h-3"/> +5%</span>
           </div>
           <div>
             <p className="text-3xl font-black text-slate-900 tracking-tight">{stats?.totalHODs || 0}</p>
             <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Kafedra Mudirlari</p>
           </div>
        </div>

        {/* Teachers */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-colors">
           <div className="flex justify-between items-start mb-4">
             <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
               <Users className="w-5 h-5" />
             </div>
             <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full"><TrendingUp className="w-3 h-3"/> +18%</span>
           </div>
           <div>
             <p className="text-3xl font-black text-slate-900 tracking-tight">{stats?.totalTeachers || 0}</p>
             <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">O'qituvchilar</p>
           </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
         {/* Main Analytic Area Chart */}
         <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Tizimdagi faollik qatori (Real-time Area)</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Jonli rejim</span>
              </div>
            </div>
            
            <div className="flex-1 h-[300px] min-h-[300px] -ml-4">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} tickLine={false} axisLine={false} />
                   <YAxis tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                   <Tooltip cursor={{stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4'}} contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px', fontWeight: 'bold'}} />
                   <Area type="monotone" dataKey="faollik" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorBlue)" activeDot={{r: 8, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 3}} />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Mini History Feed Component */}
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[11px] flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" /> Oxirgi harakatlar
              </h3>
            </div>
            <div className="p-5 flex-1 flex flex-col gap-4 overflow-y-auto max-h-[320px]">
              {history.length > 0 ? (
                history.map((log: any) => (
                  <div key={log.id} className="flex gap-4 group cursor-default">
                    <div className="relative flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-100 border-2 border-blue-500 z-10"></div>
                      <div className="w-px h-full bg-slate-100 absolute top-2.5 group-last:hidden"></div>
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-semibold text-slate-700 line-clamp-2">{log.action}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">{log.createdAt ? format(new Date(log.createdAt), "dd MMM HH:mm") : "Hozirgina"}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                   <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3"><Activity className="w-6 h-6" /></div>
                   <p className="text-sm text-slate-500 font-medium">Monitoring jurnali faol ishlamoqda.</p>
                   <p className="text-[10px] text-slate-400 mt-1">Bu yerda tizimdagi oxirgi voqealar ketma-ket chiqadi.</p>
                </div>
              )}
            </div>
            <Link href="/dashboard/history" className="p-3 text-center border-t border-slate-100 text-xs font-bold text-blue-600 hover:bg-slate-50 transition-colors uppercase tracking-widest flex items-center justify-center gap-1 group">
               Barchasini ko'rish <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
         </div>
      </div>
    </div>
  );
}
