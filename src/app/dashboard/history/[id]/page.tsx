"use client";

import { useEffect, useState } from "react";
import { History, ArrowLeft, Clock, Shield, CheckCircle2, User } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

export default function UserHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    // Check role
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      if (u.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }
    }
    fetchLogs();
    fetchUser();
  }, [id, router]);

  const fetchLogs = async () => {
    try {
      // Pass role=ADMIN to bypass restrictions
      const res = await fetch(`/api/logs?userId=${id}&role=ADMIN`);
      const data = await res.json();
      if(Array.isArray(data)) {
        setLogs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/users");
      const users = await res.json();
      const user = users.find((u: any) => u.id === id);
      if (user) setUserInfo(user);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-slate-500 animate-pulse">Tarix yuklanmoqda...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/history" 
          className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
             <History className="w-7 h-7 text-blue-600" />
             Xodimning Harakatlar Tarixi
           </h1>
           {userInfo && (
             <p className="text-sm font-semibold text-slate-500 mt-1 flex items-center gap-2">
               <User className="w-4 h-4"/> {userInfo.name} &bull; <span className="text-blue-500 uppercase">{userInfo.role}</span>
             </p>
           )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative p-8">
        
        {logs.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Bu foydalanuvchi hali tizimda hech qanday amal bajarmagan.</div>
        ) : (
          <div className="relative border-l-2 border-blue-100 ml-4 md:ml-6 space-y-8 pb-4">
            {logs.map(log => {
               const date = new Date(log.createdAt);
               const formattedDate = date.toLocaleDateString("ru-RU", { day: '2-digit', month: '2-digit', year: 'numeric' });
               const formattedTime = date.toLocaleTimeString("ru-RU", { hour: '2-digit', minute: '2-digit' });

               let icon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
               let bgClass = "bg-emerald-100 border-emerald-200";
               
               if (log.action.includes("Tizimga kirdi")) {
                 icon = <Shield className="w-4 h-4 text-blue-600" />;
                 bgClass = "bg-blue-100 border-blue-200";
               } else if (log.action.includes("Tizimdan chiqdi")) {
                 icon = <Clock className="w-4 h-4 text-amber-600" />;
                 bgClass = "bg-amber-100 border-amber-200";
               }

               return (
                 <div key={log.id} className="relative pl-8 md:pl-10">
                   <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${bgClass}`}>
                     {icon}
                   </div>
                   
                   <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl hover:border-blue-100 transition-colors hover:shadow-sm">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                       <h3 className="font-bold text-slate-900">{log.action}</h3>
                       <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm flex items-center gap-1.5 w-fit">
                         <Clock className="w-3.5 h-3.5 text-blue-400" />
                         {formattedDate} <span className="text-slate-300">|</span> {formattedTime}
                       </span>
                     </div>
                     {log.details && (
                       <p className="text-sm text-slate-600 mt-2 bg-white p-3 rounded-xl border border-slate-100 italic">
                         {log.details}
                       </p>
                     )}
                   </div>
                 </div>
               );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
