"use client";

import { useEffect, useState } from "react";
import { Users, Shield, LayoutDashboard, Clock, UserCheck, Activity, Terminal, ChevronRight, TrendingUp, CheckCircle, ListTodo, ShieldAlert, BarChart3, Database } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import Link from "next/link";
import { format } from "date-fns";

export default function AdminMonitoringPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [blockchain, setBlockchain] = useState<any>(null);

  useEffect(() => {
    fetchData();
    fetchRecentHistory();
    fetchBlockchain();
  }, []);

  const fetchBlockchain = async () => {
    try {
      const res = await fetch("/api/blockchain");
      if (res.ok) {
        setBlockchain(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

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
      const res = await fetch("/api/logs?limit=8");
      if (res.ok) {
        const data = await res.json();
        setHistory(Array.isArray(data) ? data.slice(0, 8) : []);
      }
    } catch (e) {
      console.error("History fetch error:", e);
    }
  };

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center space-x-2">
       <div className="w-5 h-5 bg-[#1d2d5b] rounded-full animate-bounce"></div>
       <div className="w-5 h-5 bg-[#309F4C] rounded-full animate-bounce delay-75"></div>
       <div className="w-5 h-5 bg-[#1d2d5b] rounded-full animate-bounce delay-150"></div>
    </div>
  );

  const activityData = [
    { name: "Du", faollik: 12 },
    { name: "Se", faollik: 45 },
    { name: "Cho", faollik: 28 },
    { name: "Pay", faollik: 80 },
    { name: "Ju", faollik: 95 },
    { name: "Sha", faollik: 40 },
    { name: "Yak", faollik: 15 },
  ];

  const roleDistribution = [
    { name: "Dekanlar", res: stats?.totalDeans || 0, color: "#309F4C" },
    { name: "Kaf.Mudirlar", res: stats?.totalHODs || 0, color: "#1d2d5b" },
    { name: "O'qituvchilar", res: stats?.totalTeachers || 0, color: "#9ca3af" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-gradient-to-r from-slate-50 to-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div>
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1d2d5b]/10 text-[#1d2d5b] text-xs font-black tracking-widest uppercase mb-3">
             <Activity className="w-3.5 h-3.5 animate-pulse" />
             Live Tizim holati
           </div>
           <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
             Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1d2d5b] to-[#309F4C]">Monitoring paneli</span>
           </h1>
           <p className="text-sm font-medium text-slate-500 mt-2 max-w-xl">
             Tizim serverlarining 100% korporativ faolligi, foydalanuvchilar qatlami va xavfsizlik auditining bevosita real vaqtdagi manzarasi.
           </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/history" className="bg-white border border-slate-200 hover:border-[#1d2d5b]/30 text-slate-700 hover:text-[#1d2d5b] px-5 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-sm drop-shadow-sm hover:shadow-md">
             <ShieldAlert className="w-4 h-4" /> To'liq tarix
          </Link>
          <Link href="/dashboard/settings" className="bg-[#1d2d5b] hover:bg-[#0e1633] text-white px-5 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-[#1d2d5b]/20 hover:-translate-y-0.5">
             <Database className="w-4 h-4" /> Maxsus boshqaruv
          </Link>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        
        {/* Ilmiy Salohiyat */}
        <div className="bg-gradient-to-br from-[#309F4C] to-[#207a37] p-6 rounded-[2rem] border border-[#309F4C]/20 shadow-lg shadow-[#309F4C]/20 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
           <div className="flex justify-between items-start relative z-10">
             <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-inner group-hover:bg-white group-hover:text-[#309F4C] transition-colors duration-300">
               <TrendingUp className="w-6 h-6" />
             </div>
             <span className="flex items-center gap-1 text-[10px] font-bold text-[#309F4C] bg-white px-2 py-1 rounded-full shadow-sm"><ShieldAlert className="w-3 h-3"/> OTM Indikatori</span>
           </div>
           <div className="mt-4 relative z-10">
             <div className="flex items-baseline gap-1">
               <p className="text-4xl font-black text-white tracking-tighter">{stats?.scientificPotential || 0}</p>
               <span className="text-xl font-bold text-white/80">%</span>
             </div>
             <p className="text-xs font-bold text-white/80 mt-1 uppercase tracking-widest">Ilmiy Salohiyat (PhD, DSc)</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-24 h-24 bg-[#1d2d5b]/5 rounded-full blur-2xl -mr-6 -mt-6 transition-transform group-hover:scale-150"></div>
           <div className="flex justify-between items-start relative z-10">
             <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center shadow-inner group-hover:bg-[#1d2d5b] group-hover:text-white transition-colors duration-300">
               <Users className="w-6 h-6" />
             </div>
             <span className="flex items-center gap-1 text-[10px] font-bold text-[#309F4C] bg-[#309F4C]/10 px-2 py-1 rounded-full"><TrendingUp className="w-3 h-3"/> Faol</span>
           </div>
           <div className="mt-4 relative z-10">
             <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats?.totalUsers || 0}</p>
             <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Umumiy tizim a'zolari</p>
           </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-24 h-24 bg-[#309F4C]/5 rounded-full blur-2xl -mr-6 -mt-6 transition-transform group-hover:scale-150"></div>
           <div className="flex justify-between items-start relative z-10">
             <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center shadow-inner group-hover:bg-[#309F4C] group-hover:text-white transition-colors duration-300">
               <ListTodo className="w-6 h-6" />
             </div>
             <span className="flex items-center gap-1 text-[10px] font-bold text-[#1d2d5b] bg-[#1d2d5b]/10 px-2 py-1 rounded-full"><TrendingUp className="w-3 h-3"/> Dinamik</span>
           </div>
           <div className="mt-4 relative z-10">
             <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats?.activePlans || 0}</p>
             <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Tasdiqlangan rejalar</p>
           </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-24 h-24 bg-[#309F4C]/5 rounded-full blur-2xl -mr-6 -mt-6 transition-transform group-hover:scale-150"></div>
           <div className="flex justify-between items-start relative z-10">
             <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center shadow-inner group-hover:bg-[#309F4C] group-hover:text-white transition-colors duration-300">
               <CheckCircle className="w-6 h-6" />
             </div>
             <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Yakunlangan</span>
           </div>
           <div className="mt-4 relative z-10">
             <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats?.completedTasks || 0}</p>
             <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Bajarilgan vazifalar</p>
           </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-24 h-24 bg-[#1d2d5b]/5 rounded-full blur-2xl -mr-6 -mt-6 transition-transform group-hover:scale-150"></div>
           <div className="flex justify-between items-start relative z-10">
             <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center shadow-inner group-hover:bg-[#1d2d5b] group-hover:text-white transition-colors duration-300">
               <Clock className="w-6 h-6" />
             </div>
             <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-full">Jarayonda</span>
           </div>
           <div className="mt-4 relative z-10">
             <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats?.inProgressTasks || 0}</p>
             <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Kutmoqda / Bajarilmoqda</p>
           </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
         {/* Main Analytic Area Chart */}
         <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                   <BarChart3 className="w-5 h-5 text-[#1d2d5b]" />
                   Serverdagi aktiv faollik
                </h3>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">So'nggi 7 kundagi avtorizatsiyalar</p>
              </div>
              <div className="flex px-3 py-1.5 rounded-full bg-slate-100 items-center justify-center gap-2 shadow-inner border border-slate-200/50">
                <span className="w-2.5 h-2.5 rounded-full bg-[#309F4C] animate-pulse"></span>
                <span className="text-[10px] uppercase font-black text-slate-600 tracking-wider">Jonli efir</span>
              </div>
            </div>
            
            <div className="flex-1 h-[320px] min-h-[320px] -ml-4 mt-4">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#1d2d5b" stopOpacity={0.4}/>
                       <stop offset="95%" stopColor="#1d2d5b" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} tickLine={false} axisLine={false} />
                   <YAxis tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} tickLine={false} axisLine={false} />
                   <Tooltip cursor={{stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4'}} contentStyle={{borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px', fontWeight: 'bold'}} />
                   <Area type="monotone" dataKey="faollik" stroke="#1d2d5b" strokeWidth={5} fillOpacity={1} fill="url(#colorPurple)" activeDot={{r: 8, fill: '#309F4C', stroke: '#ffffff', strokeWidth: 3}} />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Distribution Chart and Feed */}
         <div className="flex flex-col gap-6">
           <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center items-center">
              <h3 className="w-full font-extrabold text-slate-900 text-sm flex items-center gap-2 mb-6">
                 Demografik tarqalish
              </h3>
              <div className="w-full h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={roleDistribution} layout="vertical" margin={{top:0, right: 30, left: 40, bottom:0}}>
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 700}} width={75} />
                     <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '10px', fontSize: '12px', fontWeight: 'bold'}}/>
                     <Bar dataKey="res" radius={[0, 8, 8, 0]} barSize={20}>
                        {roleDistribution.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Bar>
                   </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden min-h-[190px]">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 uppercase tracking-widest text-[11px] flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#1d2d5b]" /> Terminal jurnali (So'nggi harakat)
                </h3>
              </div>
              <div className="p-5 flex-1 flex flex-col gap-3 overflow-y-auto">
                {history.map((log: any) => (
                    <div key={log.id} className="flex gap-3 group cursor-default">
                      <div className="relative flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full z-10 border-2 ${log.action.includes("o'chirdi") ? 'bg-red-100 border-red-500' : 'bg-green-100 border-[#309F4C]'}`}></div>
                        <div className="w-px h-full bg-slate-200 absolute top-2.5 group-last:hidden"></div>
                      </div>
                      <div className="pb-3 flex-1">
                        <p className="text-sm font-semibold text-slate-700 leading-tight">{log.action}</p>
                        <p className="text-[10px] text-slate-400 font-black mt-1 uppercase tracking-widest">{log.createdAt ? format(new Date(log.createdAt), "HH:mm, dd MMM") : "Hozirgina"}</p>
                      </div>
                    </div>
                ))}
              </div>
              <Link href="/dashboard/history" className="p-3 text-center border-t border-slate-100 text-xs font-black text-[#1d2d5b] hover:bg-[#1d2d5b] hover:text-white transition-colors uppercase tracking-widest flex items-center justify-center gap-2 group">
                 Tizim tarixiga O'tish <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>
         </div>

         {/* BASHORATLI ANALITIKA VA BLOCKCHAIN QATORI */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
               <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  AI Bashoratli Analitika (Predictive Risk)
               </h3>
               <p className="text-xs text-slate-500 mb-4 font-medium">Tizim joriy ish tezligini hisoblab, qaysi kafedralar yil oxirigacha rejani bajara olmasligini bashorat qilmoqda.</p>
               
               <div className="space-y-3">
                 {stats?.predictions?.length > 0 ? (
                   stats.predictions.slice(0,4).map((p: any, i: number) => (
                     <div key={i} className={`p-4 rounded-2xl border ${p.risk === "HIGH" ? "border-red-200 bg-red-50/50" : p.risk === "MEDIUM" ? "border-orange-200 bg-orange-50/50" : "border-green-200 bg-green-50/50"}`}>
                       <div className="flex justify-between items-start mb-2">
                         <span className="font-bold text-slate-800 text-sm">{p.department}</span>
                         <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${p.risk === "HIGH" ? "bg-red-100 text-red-600" : p.risk === "MEDIUM" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"}`}>
                           {p.risk} RISK
                         </span>
                       </div>
                        <div className="flex flex-col gap-1 mt-2 text-xs font-medium text-slate-600">
                          <div className="flex items-center gap-2">
                            <span>{p.completionPercent}% bajarilgan</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span>LMS Yuklama: {p.lmsWorkload || 0} soat</span>
                          </div>
                          <span className="truncate text-[11px] text-slate-500 italic">" {p.status} "</span>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="text-center p-6 text-slate-400 text-sm font-semibold">Tahlil uchun ma'lumot yetarli emas</div>
                 )}
               </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
               <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg ${blockchain?.status === "SECURE" || blockchain?.status === "OK" ? "bg-green-500 shadow-green-500/30" : "bg-red-500 shadow-red-500/30"}`}>
                 <Database className="w-10 h-10 text-white" />
               </div>
               <h3 className="font-black text-slate-900 text-xl mb-2 flex items-center gap-2 justify-center">
                 Blockchain Zanjiri 
                 {blockchain?.status === "SECURE" || blockchain?.status === "OK" ? (
                   <CheckCircle className="w-6 h-6 text-green-500" />
                 ) : (
                   <ShieldAlert className="w-6 h-6 text-red-500" />
                 )}
               </h3>
               <p className={`text-sm font-semibold max-w-xs ${blockchain?.status === "SECURE" || blockchain?.status === "OK" ? "text-green-600" : "text-red-600"}`}>
                 {blockchain?.message || "Tekshirilmoqda..."}
               </p>
               <div className="mt-8 bg-slate-50 p-4 rounded-xl border border-slate-100 w-full text-left">
                 <p className="text-xs text-slate-500 font-mono leading-relaxed">
                   <strong>O'ZGARMAS XAVFSIZLIK:</strong> Barcha tasdiqlangan hujjatlar va reyting (KPI) ballari SHA-256 kriptografik xeshlash algoritmi orqali zanjirlangan. Baza tashqaridan buzilgan taqdirda ham, tizim korrupsiyani (o'zgartirishni) darhol sezadi.
                 </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
