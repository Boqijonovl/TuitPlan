"use client";

import { useEffect, useState } from "react";
import { Users, BookOpen, CheckCircle, Clock, Send, Megaphone, FileText, Trash2, Shield, UserCheck, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardHome() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Yangilik qo'shish state
  const [newNewsTitle, setNewNewsTitle] = useState("");
  const [newNewsContent, setNewNewsContent] = useState("");
  const [newNewsType, setNewNewsType] = useState("UNIVERSITET");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      
      // ADMIN can now access the dashboard
    }
    
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      let statsUrl = "/api/dashboard/stats";
      if (storedUser) {
        const u = JSON.parse(storedUser);
        statsUrl += `?userId=${u.id}&role=${u.role}`;
      }
      
      const statsRes = await fetch(statsUrl);
      const newsRes = await fetch("/api/news");
      
      const statsData = await statsRes.json();
      const newsData = await newsRes.json();
      
      setStats(statsData);
      if (Array.isArray(newsData)) {
        setNews(newsData);
      } else {
        console.error("API error for news:", newsData);
        setNews([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNewsTitle || !newNewsContent) return;

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newNewsTitle,
          content: newNewsContent,
          type: newNewsType,
          authorId: user.id
        })
      });

      if (res.ok) {
        setNewNewsTitle("");
        setNewNewsContent("");
        fetchData(); // yangiliklarni yangilash
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm("Ushbu yangilikni o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/news/${id}?userId=${user?.id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch(e) { console.error(e); }
  };

  const todaysNews = news.filter((n: any) => new Date(n.createdAt).toDateString() === new Date().toDateString());

  if (!user) return <div className="p-8 text-center text-slate-500">Iltimos, kuting...</div>;
  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mt-8">
        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-[500px] w-full rounded-2xl" />)}
      </div>
    </div>
  );



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-2">
        <StatCard 
          href="/dashboard/users" title="Jami Foydalanuvchilar" value={stats?.totalUsers || 0} 
          icon={<Users className="h-6 w-6 text-blue-500" />} color="bg-blue-500/10 hover:border-blue-300" 
        />
        <StatCard href="/dashboard/plans" title="Faol Rejalar" value={stats?.activePlans || 0} icon={<BookOpen className="h-6 w-6 text-indigo-500" />} color="bg-indigo-500/10 hover:border-indigo-300" />
        <StatCard href="/dashboard/tasks" title="Bajarilgan Vazifalar" value={stats?.completedTasks || 0} icon={<CheckCircle className="h-6 w-6 text-emerald-500" />} color="bg-emerald-500/10 hover:border-emerald-300" />
        <StatCard href="/dashboard/tasks" title="Jarayondagi Vazifalar" value={stats?.inProgressTasks || 0} icon={<Clock className="h-6 w-6 text-amber-500" />} color="bg-amber-500/10 hover:border-amber-300" />
      </div>

      {/* Admin uchun alohida 3 ta Kadrlar Statistikasi */}
      {user?.role === "ADMIN" && (
        <div className="grid gap-6 md:grid-cols-3 mt-4">
           <StatCard 
              title="Dekanlar Soni" value={stats?.totalDeans || 0} 
              icon={<UserCheck className="w-5 h-5 text-amber-600" />} color="bg-amber-50 border-amber-200 shadow-sm" href="/dashboard/users" 
           />
           <StatCard 
              title="Kafedra Mudirlari Soni" value={stats?.totalHODs || 0} 
              icon={<Shield className="w-5 h-5 text-purple-600" />} color="bg-purple-50 border-purple-200 shadow-sm" href="/dashboard/users" 
           />
           <StatCard 
              title="Tizim O'qituvchilari Soni" value={stats?.totalTeachers || 0} 
              icon={<UserIcon className="w-5 h-5 text-emerald-600" />} color="bg-emerald-50 border-emerald-200 shadow-sm" href="/dashboard/users" 
           />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mt-8">
        
        {/* So'nggi 5 ta reja */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Yangi Qo'shilgan Rejalar
            </h2>
            <Link href="/dashboard/plans" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
              Barchasi
            </Link>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1 pr-2 mb-4">
            {stats?.recentPlans?.map((plan: any) => (
              <Link href="/dashboard/plans" key={plan.id} className="block hover:bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 line-clamp-1">{plan.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{plan.department?.name || "Kafedra yo'q"} - {plan.year}-yil</p>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs text-slate-600 font-medium">
                    <FileText className="w-3.5 h-3.5" />
                    {plan.tasks?.length || 0} tag
                  </div>
                </div>
              </Link>
            ))}
            {(!stats?.recentPlans || stats.recentPlans.length === 0) && (
              <p className="text-sm text-slate-500 text-center py-4">Bazada reja topilmadi.</p>
            )}
          </div>
        </div>

        {/* Yangiliklar qismi */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-500" />
              Bugungi Yangiliklar
            </h2>
            <Link href="/dashboard/news" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
              Barchasi
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
            {todaysNews.map(n => (
              <div key={n.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative hover:border-blue-200 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-800 pr-10">{n.title}</h3>
                  <div className="flex items-center gap-2">
                    {user?.id === n.authorId && (
                      <button onClick={() => handleDeleteNews(n.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="O'chirish">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${n.type === 'UNIVERSITET' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {n.type}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-1">{n.content}</p>
                <div className="mt-3 text-xs text-slate-400 font-medium flex items-center gap-2">
                  <span>Mualif: {n.author?.name || "Noma'lum"}</span>
                  <span>&bull;</span>
                  <span>{new Date(n.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
            {todaysNews.length === 0 && (
              <div className="text-center text-slate-500 py-8 text-sm">Bugun uchun yangiliklar mavjud emas.</div>
            )}
          </div>

          {(user.role === "DEAN" || user.role === "HOD") && (
            <form onSubmit={handleAddNews} className="pt-4 border-t border-slate-100 shrink-0 space-y-3">
              <input 
                type="text" 
                placeholder="Yangilik sarlavhasi" 
                value={newNewsTitle}
                onChange={e => setNewNewsTitle(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea 
                placeholder="Yangilik matni..." 
                value={newNewsContent}
                onChange={e => setNewNewsContent(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 resize-none h-16"
                required
              />
              <div className="flex items-center gap-2">
                <select 
                  value={newNewsType}
                  onChange={e => setNewNewsType(e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white flex-1"
                >
                  <option value="UNIVERSITET">Universitet</option>
                  <option value="T'ALIM">Ta'lim</option>
                </select>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Yuborish
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, href, subtext }: any) {
  return (
    <Link href={href || "#"} className={`block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-white/50 border border-slate-100`}>
          {icon}
        </div>
      </div>
      {subtext && <div className="mt-4 pt-4 border-t border-slate-200/50">{subtext}</div>}
    </Link>
  );
}
