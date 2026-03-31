"use client";

import { useEffect, useState } from "react";
import { Users, Activity, Shield, Database, LayoutDashboard, Clock, UserCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";

export default function AdminMonitoringPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
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

  if (loading) return <div className="p-8 text-slate-500 animate-pulse">Yuklanmoqda...</div>;

  const activityData = [
    { name: "Dushanba", logs: 120 },
    { name: "Seshanba", logs: 210 },
    { name: "Chorshanba", logs: 180 },
    { name: "Payshanba", logs: 240 },
    { name: "Juma", logs: 290 },
    { name: "Shanba", logs: 95 },
    { name: "Yakshanba", logs: 40 },
  ]; // Mock until we build a log aggregator endpoint

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
             <Shield className="w-7 h-7 text-blue-600" />
             Admin kuzatuv paneli
           </h1>
           <p className="text-sm text-slate-500 mt-1">Tizim holati va foydalanuvchilar oqimining markaziy monitoringi.</p>
        </div>
        <Link 
          href="/dashboard/history" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm shadow-blue-600/20 transition-all flex items-center gap-2"
        >
          <Clock className="w-5 h-5" /> Tizim tarixiga o'tish
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-sm font-semibold text-slate-500">Jami tizim foydalanuvchilari</p>
             <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.totalUsers || 0}</p>
           </div>
           <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
             <Users className="w-6 h-6" />
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-sm font-semibold text-slate-500">Tizim holati</p>
             <p className="text-xl font-bold text-emerald-500 mt-2">100% Barqaror</p>
           </div>
           <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
             <Shield className="w-6 h-6" />
           </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
         <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 shadow-sm flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                 <p className="text-sm font-semibold text-slate-500">Dekanlar soni</p>
                 <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.totalDeans || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                 <UserCheck className="w-6 h-6" />
              </div>
            </div>
            <Link href="/dashboard/users" className="mt-6 text-sm font-bold text-amber-600 hover:text-amber-700 w-max">
               Batafsil ro'yxat &rarr;
            </Link>
         </div>

         <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 shadow-sm flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                 <p className="text-sm font-semibold text-slate-500">Kafedra mudirlari soni</p>
                 <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.totalHODs || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                 <Shield className="w-6 h-6" />
              </div>
            </div>
            <Link href="/dashboard/users" className="mt-6 text-sm font-bold text-purple-600 hover:text-purple-700 w-max">
               Batafsil ro'yxat &rarr;
            </Link>
         </div>

         <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200 shadow-sm flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                 <p className="text-sm font-semibold text-slate-500">Tizim o'qituvchilari soni</p>
                 <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.totalTeachers || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                 <Users className="w-6 h-6" />
              </div>
            </div>
            <Link href="/dashboard/users" className="mt-6 text-sm font-bold text-emerald-600 hover:text-emerald-700 w-max">
               Batafsil ro'yxat &rarr;
            </Link>
         </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
         <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-sm">Haftalik tizimga kirishlar faolligi</h3>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                 <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={{stroke: '#e2e8f0'}} />
                   <YAxis tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                   <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                   <Bar dataKey="logs" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-blue-600 rounded-xl p-6 text-white flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl -ml-20 -mb-20"></div>
            
            <LayoutDashboard className="w-12 h-12 text-blue-300 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Maxsus kuzatuv</h2>
            <p className="text-blue-200 text-sm mb-6 leading-relaxed">Siz tizimning barcha harakatlarini kuzatib boruvchi markaziy paneldasiz. Tizimdagi xatoliklarni, yuklanishlarni va foydalanuvchilar oqimini doimiy nazorat qilish tavsiya etiladi.</p>
            
            <Link href="/dashboard/history" className="bg-white text-blue-700 py-3 rounded-xl font-bold text-center hover:bg-slate-50 transition-colors shadow-sm shadow-black/10">
              Harakatlar jurnalini ko'rish
            </Link>
         </div>
      </div>
    </div>
  );
}
