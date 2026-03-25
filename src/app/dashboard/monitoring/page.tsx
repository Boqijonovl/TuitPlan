"use client";

import { useEffect, useState } from "react";
import { Activity, BarChart2, TrendingUp, Users, Download, PieChart as PieChartIcon, Trophy, Medal, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

export default function MonitoringPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
    fetchPlans();
    fetchLeaderboard();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      let url = "/api/plans?status=APPROVED";
      if (storedUser) {
        const u = JSON.parse(storedUser);
        url += `&userId=${u.id}&role=${u.role}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      let url = "/api/leaderboard";
      if (storedUser) {
        const u = JSON.parse(storedUser);
        url += `?userId=${u.id}&role=${u.role}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const getOverallProgress = () => {
    if (!plans || plans.length === 0) return 0;
    let totalTasks = 0;
    let completedTasks = 0; // A task is completed if it has at least 1 submission

    plans.forEach(p => {
      totalTasks += p.tasks?.length || 0;
      completedTasks += p.tasks?.filter((t: any) => t.submissions?.length > 0).length || 0;
    });

    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  };

  const handleExportExcel = () => {
    const data = plans.map(plan => {
      const total = plan.tasks?.length || 0;
      const done = plan.tasks?.filter((t: any) => t.submissions?.length > 0).length || 0;
      const progress = total > 0 ? Math.round((done / total) * 100) : 0;
      const planSubmissions = plan.tasks?.reduce((sum: number, t: any) => sum + (t.submissions?.length || 0), 0) || 0;
      return {
        "Reja Nomi": plan.title,
        "Kafedrasi": plan.department?.name || "Umumiy",
        "Jami Vazifalar": total,
        "Bajarilgan Vazifalar": done,
        "Yuklangan Hisobotlar": planSubmissions,
        "Bajarilish Ko'rsatkichi (%)": progress
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monitoring");
    
    XLSX.writeFile(workbook, "TuitPlan_Monitoring_Hisobot.xlsx");
  };

  const handleExportPDF = async () => {
    // html2canvas kutubxonasi Tailwind V4 ning yangi oklch/lab ranglarini
    // o'qiy olmasligi sababli, eng kuchli va xatosiz usul - brauzerning
    // o'z PDF generatsiyasidan (Print API) foydalanamiz.
    window.print();
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><Skeleton className="h-8 w-48" /><Skeleton className="h-10 w-32" /></div>
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-80 w-full rounded-2xl mt-6" />
    </div>
  );

  if (currentUser?.role === "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <h2 className="text-2xl font-bold text-slate-800">Ruxsat etilmagan sahifa</h2>
        <p className="text-slate-500 mt-2">Bosh admin xodimlarning ko'rsatkichlarini o'lchamaydi, bu panel hisobotlar monitoringi uchun.</p>
      </div>
    );
  }

  const overallProgress = getOverallProgress();
  
  const totalSubmissions = plans.reduce((acc, p) => acc + (p.tasks?.reduce((sum: number, t: any) => sum + (t.submissions?.length || 0), 0) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Monitoring</h1>
        {plans.length > 0 && (
          <div className="flex items-center gap-3 print:hidden">
            <button 
               onClick={handleExportExcel}
               className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all shrink-0 text-sm"
            >
               <Download className="w-4 h-4" />
               Excel yuklash
            </button>
            <button 
               onClick={handleExportPDF}
               className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-rose-500/30 transition-all shrink-0 text-sm"
            >
               <FileText className="w-4 h-4" />
               PDF yuklash
            </button>
          </div>
        )}
      </div>

      <div id="pdf-export-content" className="space-y-6 pt-2 bg-slate-50 dark:bg-slate-900 print:bg-white print:p-0">
        <div className="hidden print:block mb-6 text-center">
           <img src="/logo.png" alt="TuitPlan Logo" className="h-16 w-auto mx-auto mb-2 opacity-90 object-contain" />
           <h1 className="text-3xl font-black text-slate-800">TuitPlan Tizimi - Umumiy Hisobot</h1>
           <p className="text-slate-500 mt-2" suppressHydrationWarning>Chop etilgan sana: {new Date().toLocaleDateString('uz-UZ')}</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
        {/* Umumiy Monitoring */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-40 h-40 rounded-full border-8 border-slate-100 flex items-center justify-center relative mb-4">
             <div 
               className="absolute inset-0 rounded-full border-8 border-indigo-500 transition-all duration-1000"
               style={{ clipPath: `polygon(0 0, 100% 0, 100% ${overallProgress}%, 0 ${overallProgress}%)` }}
             ></div>
             <span className="text-3xl font-bold text-slate-800 z-10">{overallProgress}%</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-500" />
            Umumiy Bajarilish
          </h2>
          <p className="text-sm text-slate-500 mt-2">Barcha rejalarga topshirilgan hisobotlarning o'rtacha ko'rsatkichi (kamida 1 kishi topshirgan bo'lsa vazifa qabul qilinadi)</p>
        </div>

        {/* Tezkor reyting kabi */}
        <div className="rounded-2xl border border-slate-200 bg-indigo-600 text-white p-6 shadow-sm flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-2">Tizim Unumdorligi</h2>
          <p className="text-indigo-100 mb-6">Xodimlar faolligi va yuklanayotgan hisobotlar jadalligi yig'indisi.</p>
          
          <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <TrendingUp className="w-8 h-8 text-emerald-300" />
                <div>
                  <p className="text-sm font-medium text-indigo-100">Jami Rejalar</p>
                  <p className="text-2xl font-bold">{plans.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 p-4 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Users className="w-8 h-8 text-amber-300" />
                <div>
                  <p className="text-sm font-medium text-indigo-100">Jami Topshirilgan Hisobotlar</p>
                  <p className="text-2xl font-bold">{totalSubmissions} ta fayl/izoh</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      {plans.length > 0 && (() => {
        const barData = plans.map(p => {
          const tTasks = p.tasks?.length || 0;
          const dTasks = p.tasks?.filter((t: any) => t.submissions?.length > 0).length || 0;
          return {
            name: p.department?.name || p.title.substring(0, 15),
            "Bajarilgan": dTasks,
            "Qolib ketgan": tTasks - dTasks,
          };
        });

        const totalTasksGlobal = plans.reduce((acc, p) => acc + (p.tasks?.length || 0), 0);
        const totalCompletedGlobal = plans.reduce((acc, p) => acc + (p.tasks?.filter((t: any) => t.submissions?.length > 0).length || 0), 0);
        
        const pieData = [
          { name: "Bajarilgan Vazifalar", value: totalCompletedGlobal },
          { name: "Qolib ketgan Vazifalar", value: totalTasksGlobal - totalCompletedGlobal }
        ];
        const COLORS = ['#10b981', '#f43f5e'];

        return (
          <div className="grid gap-6 lg:grid-cols-2 mt-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <h3 className="font-bold text-slate-800 mb-6 text-center text-sm uppercase tracking-wider">Bo'linmalar Faolligi (Vazifalar kesimida)</h3>
               <div className="h-[280px]">
                 <ResponsiveContainer width="100%" height="100%" minHeight={280}>
                   <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b'}} tickLine={false} axisLine={{stroke: '#e2e8f0'}} />
                     <YAxis allowDecimals={false} tick={{fontSize: 11, fill: '#64748b'}} tickLine={false} axisLine={false} />
                     <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                     <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                     <Bar dataKey="Bajarilgan" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} barSize={40} />
                     <Bar dataKey="Qolib ketgan" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={40} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <h3 className="font-bold text-slate-800 mb-6 text-center text-sm uppercase tracking-wider flex items-center justify-center gap-2">
                 <PieChartIcon className="w-4 h-4 text-slate-400" />
                 Umumiy Vazifalar Holati
               </h3>
               <div className="h-[280px]">
                 <ResponsiveContainer width="100%" height="100%" minHeight={280}>
                   <PieChart>
                     <Pie
                       data={pieData}
                       cx="50%"
                       cy="50%"
                       innerRadius={70}
                       outerRadius={100}
                       paddingAngle={5}
                       dataKey="value"
                       stroke="none"
                     >
                       {pieData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                     <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '12px'}} />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>
        );
      })()}

      {/* 🏆 KPI Liderlar Doskasi */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              Liderlar Doskasi (KPI)
            </h2>
            <p className="text-sm text-slate-600 mt-1">Xodimlarning tizimdagi tahliliy reytingi (Topshirilgan hisobotlar bo'yicha)</p>
          </div>
          {currentUser && (
            <div className="bg-white p-3 rounded-xl shadow-sm border border-amber-100 flex flex-col items-center justify-center shrink-0">
               <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Mening O'rnim</span>
               <span className="text-2xl font-black text-slate-800 mt-0.5">#{leaderboard.find(l => l.id === currentUser?.id)?.rank || "-"}</span>
            </div>
          )}
        </div>
        
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">O'rin</th>
                  <th className="px-6 py-4">Xodim</th>
                  <th className="px-6 py-4">Kafedra</th>
                  <th className="px-6 py-4 text-center">Topshiriqlar</th>
                  <th className="px-6 py-4 text-right">Reyting Ball (KPI)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leaderboard.slice(0, 10).map((u, idx) => (
                  <tr key={u.id} className={`hover:bg-amber-50/30 transition-colors ${currentUser?.id === u.id ? 'bg-indigo-50/50' : ''}`}>
                    <td className="px-6 py-4 text-center font-bold">
                      {idx === 0 ? <Medal className="w-6 h-6 text-yellow-500 mx-auto" strokeWidth={2.5}/> : 
                       idx === 1 ? <Medal className="w-6 h-6 text-slate-400 mx-auto" strokeWidth={2.5}/> : 
                       idx === 2 ? <Medal className="w-6 h-6 text-amber-600 mx-auto" strokeWidth={2.5}/> : 
                       <span className="text-slate-400">#{u.rank}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-100 border-2 border-slate-50 shadow-sm shrink-0 flex items-center justify-center text-indigo-500 font-bold">
                           {u.avatarUrl ? (
                             <img src={u.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                           ) : (
                             u.name.charAt(0).toUpperCase()
                           )}
                        </div>
                        <div className="flex items-center gap-2">
                          {u.name} 
                          {currentUser?.id === u.id && <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full">Siz</span>}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 capitalize pl-11">{u.role.toLowerCase()}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{u.department}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold">{u.submissionsCount} ta</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-lg font-black shadow-md shadow-amber-500/20">
                        {u.points} <span className="text-[10px] font-medium opacity-80">ball</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Hech qanday ko'rsatkich yo'q. Dastlabki hisobotlarni yuklang!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Kengaytirilgan Monitoring */}
      <h2 className="text-xl font-bold text-slate-800 pt-6 flex items-center gap-2">
        <BarChart2 className="w-6 h-6 text-blue-500" />
        Kengaytirilgan Yakuniy Monitoring
      </h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Reja Nomi</th>
                <th className="px-6 py-4">Kaferdasi</th>
                <th className="px-6 py-4 text-center">Tasdiqlangan Vazifalar</th>
                <th className="px-6 py-4 text-center">Umumiy Hisobotlar</th>
                <th className="px-6 py-4 text-right">Bajarilish Foizi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map(plan => {
                const total = plan.tasks?.length || 0;
                const done = plan.tasks?.filter((t: any) => t.submissions?.length > 0).length || 0;
                const progress = total > 0 ? Math.round((done / total) * 100) : 0;
                const planSubmissions = plan.tasks?.reduce((sum: number, t: any) => sum + (t.submissions?.length || 0), 0) || 0;
                
                return (
                  <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 w-1/3 text-wrap leading-tight">{plan.title}</td>
                    <td className="px-6 py-4 text-slate-600">{plan.department?.name || "Noma'lum"}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full font-bold">
                        <span className="text-emerald-600">{done}</span>
                        <span className="text-slate-400">/</span>
                        <span className="text-slate-600">{total}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-md text-xs font-bold border border-indigo-100">
                         {planSubmissions} ta
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-full bg-slate-100 rounded-full h-2 max-w-[80px]">
                          <div className={`h-2 rounded-full ${progress >= 80 ? 'bg-emerald-500' : progress >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="font-bold text-slate-700 w-10 text-right">{progress}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {plans.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Hech qanday ma'lumot yo'q</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}
