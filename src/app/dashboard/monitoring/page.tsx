"use client";

import { useEffect, useState } from "react";
import { Activity, BarChart2, TrendingUp, Users, Download, PieChart as PieChartIcon, Trophy, Medal, FileText, LayoutTemplate, RotateCcw, Grid } from "lucide-react";
import * as XLSX from "xlsx";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Responsive, WidthProvider, Layout } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function MonitoringPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  
  const defaultLayout = [
    { i: 'general', x: 0, y: 0, w: 6, h: 2, minW: 3 },
    { i: 'stats', x: 6, y: 0, w: 6, h: 2, minW: 3 },
    { i: 'bar', x: 0, y: 2, w: 6, h: 3, minW: 4, minH: 3 },
    { i: 'pie', x: 6, y: 2, w: 6, h: 3, minW: 4, minH: 3 },
    { i: 'leaderboard', x: 0, y: 5, w: 12, h: 4, minW: 6 },
    { i: 'table', x: 0, y: 9, w: 12, h: 4, minW: 6 },
  ];
  
  const [layouts, setLayouts] = useState<any>({ lg: defaultLayout });
  const [isClient, setIsClient] = useState(false); // Prevents hydration mismatch
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
    
    const savedLayout = localStorage.getItem("tuitplan_monitoring_layout");
    if (savedLayout) {
      setLayouts(JSON.parse(savedLayout));
    }
    
    fetchPlans();
    fetchLeaderboard();
  }, []);

  const onLayoutChange = (layout: any, allLayouts: any) => {
    setLayouts(allLayouts);
    localStorage.setItem("tuitplan_monitoring_layout", JSON.stringify(allLayouts));
  };

  const resetLayout = () => {
    setLayouts({ lg: defaultLayout });
    localStorage.removeItem("tuitplan_monitoring_layout");
  };

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
    let completedTasks = 0; 
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
        "Bajarilgan vazifalar": done,
        "Yuklangan Hisobotlar": planSubmissions,
        "Bajarilish Ko'rsatkichi (%)": progress
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monitoring");
    XLSX.writeFile(workbook, "FKYRM_Monitoring_Hisobot.xlsx");
  };

  const handleExportPDF = async () => {
    window.print();
  };

  if (loading || !isClient) return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><Skeleton className="h-8 w-48" /><Skeleton className="h-10 w-32" /></div>
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
      <Skeleton className="h-[400px] w-full rounded-xl mt-6" />
    </div>
  );

  if (currentUser?.role === "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <h2 className="text-2xl font-bold text-slate-900">Ruxsat etilmagan sahifa</h2>
        <p className="text-slate-500 mt-2">Bosh admin xodimlarning ko'rsatkichlarini o'lchamaydi, bu panel hisobotlar monitoringi uchun.</p>
      </div>
    );
  }

  const overallProgress = getOverallProgress();
  const totalSubmissions = plans.reduce((acc, p) => acc + (p.tasks?.reduce((sum: number, t: any) => sum + (t.submissions?.length || 0), 0) || 0), 0);

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
    { name: "Bajarilgan vazifalar", value: totalCompletedGlobal },
    { name: "Qolib ketgan Vazifalar", value: totalTasksGlobal - totalCompletedGlobal }
  ];
  const COLORS = ['#2563eb', '#cbd5e1'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
           <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              Monitoring <span className="bg-blue-100 text-blue-600 text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider hidden sm:block">Widget mode</span>
           </h1>
           <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
             <button onClick={() => setIsLocked(!isLocked)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${isLocked ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`} title="Panel bloklarini qulflash">
                {isLocked ? "Qulflangan" : "Ochiq"}
             </button>
             <button onClick={resetLayout} disabled={isLocked} className="px-3 py-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-white text-xs font-bold transition-all disabled:opacity-30 disabled:hover:bg-transparent" title="Joylashuvlarni asliga qaytarish">
                Qayta tiklash
             </button>
           </div>
        </div>
        {plans.length > 0 && (
          <div className="flex items-center gap-3 print:hidden">
            <button 
               onClick={handleExportExcel}
               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm shadow-blue-500/30 transition-all shrink-0 text-sm"
            >
               <Download className="w-4 h-4" />
               Excel yuklash
            </button>
            <button 
               onClick={handleExportPDF}
               className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm shadow-slate-500/30 transition-all shrink-0 text-sm"
            >
               <FileText className="w-4 h-4" />
               PDF yuklash
            </button>
          </div>
        )}
      </div>

      <div id="pdf-export-content" className="bg-slate-50 dark:bg-slate-900 print:bg-white print:p-0">
        
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={120}
          onLayoutChange={onLayoutChange}
          draggableHandle=".drag-handle"
          isDraggable={!isLocked}
          isResizable={!isLocked}
          margin={[24, 24]}
        >
          {/* Umumiy Monitoring */}
          <div key="general" className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden bg-white/80 backdrop-blur-sm group hover:ring-2 ring-blue-500/50 transition-shadow">
             <div className="drag-handle w-full h-8 bg-slate-100/50 flex items-center justify-center cursor-move opacity-0 group-hover:opacity-100 transition-opacity border-b border-transparent hover:border-blue-100 z-10 shrink-0">
               <Grid className="w-4 h-4 text-slate-400" />
             </div>
             <div className="flex flex-col items-center justify-center p-6 flex-1 text-center -mt-4">
                <div className="w-32 h-32 rounded-full border-4 border-slate-100 flex items-center justify-center relative mb-4">
                   <div 
                     className="absolute inset-0 rounded-full border-4 border-blue-500 transition-all duration-1000"
                     style={{ clipPath: `polygon(0 0, 100% 0, 100% ${overallProgress}%, 0 ${overallProgress}%)` }}
                   ></div>
                   <span className="text-2xl font-bold text-slate-900 z-10">{overallProgress}%</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" /> Umumiy bajarilish
                </h2>
             </div>
          </div>

          {/* Tezkor reyting kabi */}
          <div key="stats" className="rounded-xl border border-slate-200 bg-blue-600 text-white shadow-sm flex flex-col overflow-hidden group hover:ring-2 ring-blue-400 transition-shadow">
             <div className="drag-handle w-full h-8 bg-blue-700/50 flex items-center justify-center cursor-move opacity-0 group-hover:opacity-100 transition-opacity border-b border-transparent z-10 shrink-0">
               <Grid className="w-4 h-4 text-blue-300" />
             </div>
             <div className="flex flex-col justify-center p-6 flex-1 text-left -mt-4">
                <h2 className="text-xl font-bold mb-2">Tizim unumdorligi</h2>
                <div className="space-y-3 relative z-0">
                  <div className="bg-white/10 p-3 rounded-xl flex items-center gap-4">
                    <TrendingUp className="w-6 h-6 text-blue-300" />
                    <div>
                      <p className="text-xs font-medium text-blue-100">Jami rejalar</p>
                      <p className="text-xl font-bold">{plans.length}</p>
                    </div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl flex items-center gap-4">
                    <Users className="w-6 h-6 text-slate-300" />
                    <div>
                      <p className="text-xs font-medium text-blue-100">Topshirilgan hisobotlar</p>
                      <p className="text-xl font-bold">{totalSubmissions} ta fayl</p>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          {/* BarChart */}
          <div key="bar" className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col group hover:ring-2 ring-blue-500/50 transition-shadow overflow-hidden">
             <div className="drag-handle w-full p-3 bg-slate-50/80 flex items-center justify-between cursor-move opacity-80 group-hover:opacity-100 transition-opacity border-b border-slate-100 z-10 shrink-0">
               <h3 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">Bo'linmalar faolligi</h3>
               <Grid className="w-4 h-4 text-slate-400" />
             </div>
             <div className="flex-1 w-full h-full p-4 relative z-0">
                 {plans.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={barData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={{stroke: '#e2e8f0'}} />
                       <YAxis allowDecimals={false} tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} />
                       <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px'}} />
                       <Legend wrapperStyle={{fontSize: '11px', paddingTop: '5px'}} />
                       <Bar dataKey="Bajarilgan" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                       <Bar dataKey="Qolib ketgan" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                     </BarChart>
                   </ResponsiveContainer>
                 ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">Ma'lumot kam</div>
                 )}
             </div>
          </div>
            
          {/* PieChart */}
          <div key="pie" className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col group hover:ring-2 ring-blue-500/50 transition-shadow overflow-hidden">
             <div className="drag-handle w-full p-3 bg-slate-50/80 flex items-center justify-between cursor-move opacity-80 group-hover:opacity-100 transition-opacity border-b border-slate-100 z-10 shrink-0">
               <h3 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider flex items-center gap-1">
                 <PieChartIcon className="w-3.5 h-3.5" /> Umumiy vazifalar holati
               </h3>
               <Grid className="w-4 h-4 text-slate-400" />
             </div>
             <div className="flex-1 w-full h-full p-2 relative z-0">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                       paddingAngle={5} dataKey="value" stroke="none"
                     >
                       {pieData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <RechartsTooltip contentStyle={{borderRadius: '12px', fontSize: '11px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                     <Legend verticalAlign="bottom" height={20} wrapperStyle={{fontSize: '11px'}} />
                   </PieChart>
                 </ResponsiveContainer>
             </div>
          </div>

          {/* 🏆 KPI Liderlar Doskasi */}
          <div key="leaderboard" className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col group hover:ring-2 ring-blue-500/50 transition-shadow overflow-hidden">
            <div className="drag-handle p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between cursor-move opacity-90 group-hover:opacity-100 transition-opacity z-10 shrink-0">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-slate-500" />
                <div>
                   <h2 className="text-sm font-bold text-slate-900">Liderlar doskasi (KPI)</h2>
                </div>
              </div>
              <Grid className="w-4 h-4 text-slate-300" />
            </div>
            
            <div className="flex-1 overflow-y-auto relative z-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 sticky top-0 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider z-10">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">O'rin</th>
                    <th className="px-4 py-3">Xodim</th>
                    <th className="px-4 py-3">Kafedra</th>
                    <th className="px-4 py-3 text-center">Topshiriqlar</th>
                    <th className="px-4 py-3 text-right">Reyting ball (KPI)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leaderboard.slice(0, 10).map((u, idx) => (
                    <tr key={u.id} className={`hover:bg-slate-50/30 transition-colors ${currentUser?.id === u.id ? 'bg-blue-50/50' : ''}`}>
                      <td className="px-4 py-3 text-center font-bold">
                        {idx === 0 ? <Medal className="w-5 h-5 text-slate-500 mx-auto" strokeWidth={2.5}/> : 
                         idx === 1 ? <Medal className="w-5 h-5 text-slate-400 mx-auto" strokeWidth={2.5}/> : 
                         idx === 2 ? <Medal className="w-5 h-5 text-slate-600 mx-auto" strokeWidth={2.5}/> : 
                         <span className="text-slate-400">#{u.rank}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-blue-100 border border-slate-50 shrink-0 flex items-center justify-center text-blue-500 font-bold text-[10px]">
                             {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" /> : u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs">{u.name} {currentUser?.id === u.id && <span className="bg-blue-100 text-blue-700 text-[8px] px-1 ml-1 rounded-sm">Siz</span>}</span>
                            <span className="text-[9px] text-slate-400 font-normal">{u.role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs truncate max-w-[120px]">{u.department}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">{u.submissionsCount} ta</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1 bg-slate-500 text-white px-2 py-1 rounded text-xs font-black shadow-sm">
                          {u.points} <span className="text-[8px] font-medium opacity-80">ball</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">Hech qanday ko'rsatkich yo'q. Dastlabki hisobotlarni yuklang!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kengaytirilgan Yakuniy Monitoring */}
          <div key="table" className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col group hover:ring-2 ring-blue-500/50 transition-shadow overflow-hidden">
             <div className="drag-handle w-full p-4 bg-slate-50 flex items-center justify-between cursor-move opacity-90 group-hover:opacity-100 transition-opacity border-b border-slate-100 z-10 shrink-0">
               <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                 <BarChart2 className="w-4 h-4 text-blue-500" />
                 Kengaytirilgan yakuniy monitoring
               </h2>
               <Grid className="w-4 h-4 text-slate-400" />
             </div>
             
             <div className="flex-1 overflow-x-auto overflow-y-auto relative z-0">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-xs">Reja nomi</th>
                    <th className="px-6 py-3 text-xs">Kaferdasi</th>
                    <th className="px-6 py-3 text-center text-xs">Tasdiqlangan vazifalar</th>
                    <th className="px-6 py-3 text-center text-xs">Umumiy hisobotlar</th>
                    <th className="px-6 py-3 text-right text-xs">Bajarilish foizi</th>
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
                        <td className="px-6 py-3 font-medium text-slate-900 w-1/3 truncate max-w-[200px]">{plan.title}</td>
                        <td className="px-6 py-3 text-slate-600 text-xs">{plan.department?.name || "Noma'lum"}</td>
                        <td className="px-6 py-3 text-center">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded text-xs font-bold">
                            <span className="text-blue-600">{done}</span>
                            <span className="text-slate-400">/</span>
                            <span className="text-slate-600">{total}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-center">
                           <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">
                             {planSubmissions} ta
                           </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-end gap-3 text-xs">
                            <div className="w-full bg-slate-100 rounded-full h-1.5 max-w-[60px]">
                              <div className={`h-1.5 rounded-full ${progress >= 80 ? 'bg-blue-500' : progress >= 40 ? 'bg-slate-500' : 'bg-slate-500'}`} style={{ width: `${progress}%` }}></div>
                            </div>
                            <span className="font-bold text-slate-700 w-8 text-right">{progress}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {plans.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-xs">Hech qanday ma'lumot yo'q</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </ResponsiveGridLayout>
      </div>
    </div>
  );
}
