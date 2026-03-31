"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Activity, Monitor, Search, RefreshCw, Calendar } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("Avtorizatsiya mavjud emas");
      const user = JSON.parse(userStr);
      
      if (user.role !== "ADMIN") {
        toast.error("Ruxsat etilmagan");
        setTimeout(() => window.location.href = "/dashboard", 1000);
        return;
      }

      const res = await fetch(`/api/logs?role=${user.role}`);
      if (res.ok) setLogs(await res.json());
      else toast.error("Loglarni yuklashda xatolik");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.action.toLowerCase().includes(search.toLowerCase()) || 
                          (l.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
                          (l.details || "").toLowerCase().includes(search.toLowerCase());
    
    if (activeTab === "IMPERSONATION") return matchesSearch && l.action === "Impersonation";
    if (activeTab === "LOGIN") return matchesSearch && l.action.includes("kirdi");
    if (activeTab === "DELETED") return matchesSearch && l.action.toLowerCase().includes("o'chirdi");
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
             <div className="p-2 bg-red-100 rounded-xl text-red-600 shadow-inner">
               <ShieldAlert className="w-6 h-6" />
             </div>
             Xavfsizlik Jurnali
           </h1>
           <p className="text-sm font-medium text-slate-500 mt-2">Tizimdagi huquqiy va ma'muriy aralashuvlar tarixi (Super Admin paneli)</p>
        </div>
        <button onClick={fetchLogs} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm">
           <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Yangilash
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-6 justify-between bg-slate-50/50">
            <div className="relative max-w-sm w-full">
              <input 
                type="text" 
                placeholder="Xodim yoki xarakat izlash..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-slate-500/10 shadow-sm"
              />
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            </div>
            
            <div className="flex bg-slate-200/50 p-1 rounded-xl">
               <button onClick={() => setActiveTab("ALL")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "ALL" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>Barchasi</button>
               <button onClick={() => setActiveTab("IMPERSONATION")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "IMPERSONATION" ? "bg-red-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>Impersonatsiyalar</button>
               <button onClick={() => setActiveTab("LOGIN")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "LOGIN" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>Kirishlar</button>
               <button onClick={() => setActiveTab("DELETED")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "DELETED" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>O'chirilganlar</button>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-400 uppercase text-[10px] sm:text-xs font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-5">Sana va Vaqt</th>
                <th className="px-6 py-5">Xodim</th>
                <th className="px-6 py-5">Harakat</th>
                <th className="px-6 py-5">Tafsilot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1,2,3,4,5].map(i => (
                   <tr key={i}><td colSpan={4} className="p-6"><div className="h-10 bg-slate-100 animate-pulse rounded-xl"></div></td></tr>
                ))
              ) : (
                filteredLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-slate-500 font-bold whitespace-nowrap text-xs">
                       <div className="flex items-center gap-2">
                         <Calendar className="w-4 h-4 text-slate-400" />
                         {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm")}
                       </div>
                    </td>
                    <td className="px-6 py-4 font-black tracking-tight text-slate-900 border-l border-slate-100">
                       <span className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[11px] text-slate-600 border border-slate-200 shadow-inner">{log.user?.name?.charAt(0) || '?'}</div>
                         <div>
                           {log.user?.name || "Tizim / Noma'lum"}
                           <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">{log.user?.role || "AUTO"}</div>
                         </div>
                       </span>
                    </td>
                    <td className="px-6 py-4 border-l border-slate-100">
                       <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${log.action === 'Impersonation' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                         {log.action}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-semibold leading-relaxed border-l border-slate-100">
                       {log.details || "-"}
                    </td>
                  </tr>
                ))
              )}
              {!loading && filteredLogs.length === 0 && (
                <tr><td colSpan={4} className="py-16 text-center text-slate-400 font-bold">Hech qanday jurnal qaydi topilmadi.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
