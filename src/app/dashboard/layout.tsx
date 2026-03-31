"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Users, LogOut, CheckSquare, Menu, BookOpen, Bell, BarChart2, Calendar, Clock, History, FolderOpen, Search, MessageSquare, ShieldAlert, Settings } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlobalSearch } from "@/components/GlobalSearch";
import { AnimatePresence, motion } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) {
      router.push("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  useEffect(() => {
    if (user?.id) {
      const fetchNotifs = () => {
        fetch(`/api/notifications?userId=${user.id}&role=${user.role}`)
          .then(res => res.json())
          .then(data => { if (Array.isArray(data)) setNotifications(data); })
          .catch(console.error);
      };
      fetchNotifs();
      const intervalId = setInterval(fetchNotifs, 60000); // 60s ye uzaytiramiz tezlik qotmasligi uchun
      return () => clearInterval(intervalId);
    }
  }, [user]);

  const handleLogout = async () => {
    if (user?.id) {
      try {
        await fetch("/api/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, action: "Tizimdan chiqdi" })
        });
      } catch (e) {
        console.error("Logout log error", e);
      }
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return <div className="min-h-screen bg-slate-50"></div>;

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - Blue Theme */}
      <aside className={`fixed lg:static top-0 left-0 bg-blue-900 text-white h-screen transition-all z-40 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-0 lg:w-20'} overflow-hidden shadow-sm lg:shadow-none print:hidden`}>
        <div className="py-2 px-1 border-b border-blue-800/50 flex items-center justify-center shrink-0 h-24 transition-all cursor-pointer hover:bg-white/5 group">
          <img src="/logo.png" alt="TUIT" className={`h-full w-auto object-contain transition-all duration-300 ${!isSidebarOpen && !isMobile ? 'scale-75 w-12' : 'scale-[1.15] w-auto group-hover:scale-[1.2]'}`} />
        </div>
        
        <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {user.role !== "ADMIN" && (
            <NavItem href="/dashboard" icon={<LayoutDashboard />} label="Dashboard" isOpen={isSidebarOpen} active={pathname === "/dashboard"} isMobile={isMobile} />
          )}
          {user.role !== "ADMIN" && (
            <NavItem href="/dashboard/monitoring" icon={<BarChart2 />} label="Monitoring" isOpen={isSidebarOpen} active={pathname.includes("/monitoring")} isMobile={isMobile} />
          )}
          
          {user.role !== "TEACHER" && user.role !== "ADMIN" && (
            <NavItem href="/dashboard/plans" icon={<CalendarDays />} label="Rejalar" isOpen={isSidebarOpen} active={pathname.includes("/plans")} isMobile={isMobile} />
          )}

          {user.role !== "ADMIN" && (
            <>
              <NavItem href="/dashboard/tasks" icon={<CheckSquare />} label="Vazifalar" isOpen={isSidebarOpen} active={pathname.includes("/tasks")} isMobile={isMobile} />
              <NavItem href="/dashboard/calendar" icon={<Calendar />} label="Kalendar" isOpen={isSidebarOpen} active={pathname.includes("/calendar")} isMobile={isMobile} />
              <NavItem href="/dashboard/chat" icon={<MessageSquare />} label="Chat" isOpen={isSidebarOpen} active={pathname.includes("/chat")} isMobile={isMobile} />
            </>
          )}
          
          {user.role === "ADMIN" && (
            <>
              <NavItem href="/dashboard/admin-monitoring" icon={<LayoutDashboard />} label="Admin kuzatuv paneli" isOpen={isSidebarOpen} active={pathname.includes("/admin-monitoring")} isMobile={isMobile} />
              <NavItem href="/dashboard/faculties" icon={<BookOpen />} label="Fakultetlar" isOpen={isSidebarOpen} active={pathname.includes("/faculties")} isMobile={isMobile} />
              <NavItem href="/dashboard/users" icon={<Users />} label="Foydalanuvchilar" isOpen={isSidebarOpen} active={pathname.includes("/users")} isMobile={isMobile} />
              <NavItem href="/dashboard/security-logs" icon={<ShieldAlert />} label="Xavfsizlik Jurnali" isOpen={isSidebarOpen} active={pathname.includes("/security-logs")} isMobile={isMobile} />
              <NavItem href="/dashboard/settings" icon={<Settings />} label="Sozlamalar" isOpen={isSidebarOpen} active={pathname.includes("/settings")} isMobile={isMobile} />
              <NavItem href="/dashboard/chat" icon={<MessageSquare />} label="Chat" isOpen={isSidebarOpen} active={pathname.includes("/chat")} isMobile={isMobile} />
            </>
          )}
          {user.role === "DEAN" && (
             <NavItem href="/dashboard/archive" icon={<FolderOpen />} label="Fayllar arxivi" isOpen={isSidebarOpen} active={pathname.includes("/archive")} isMobile={isMobile} />
          )}
        </div>

        <div className="p-3 border-t border-blue-800 shrink-0 bg-blue-950/20">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-3 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition-colors group"
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
            <span className={`ml-3 font-medium whitespace-nowrap transition-opacity duration-200 ${!isSidebarOpen && !isMobile ? 'opacity-0 lg:hidden' : 'opacity-100'}`}>Chiqish</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen w-full relative overflow-hidden transition-all duration-300 print:bg-white print:overflow-visible">
        {/* Header - White */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-20 sticky top-0 shadow-sm print:hidden">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors focus:outline-none shrink-0 md:mr-4">
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex-1 flex justify-start pl-2 md:pl-0">
            {user.role !== "ADMIN" && <GlobalSearch />}
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            
            {user.role !== "ADMIN" && (
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors"
                  title="Bildirishnomalar"
                >
                  <Bell className="w-6 h-6" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-slate-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-sm border border-slate-100 p-4 z-50">
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2"><Bell className="w-4 h-4 text-blue-500"/> Bildirishnomalar</span>
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs">Jami: {notifications.length} ta yuborilmagan</span>
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                         <p className="text-sm text-slate-500 text-center py-4">Sizda yangi xabarlar yo'q</p>
                       ) : notifications.map(notif => (
                         <button 
                           key={notif.id} 
                           onClick={() => {
                             setShowNotifications(false);
                             router.push(notif.link || `/dashboard/tasks?search=${encodeURIComponent(notif.title)}`);
                           }}
                           className="w-full text-left text-sm p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition-colors shadow-sm cursor-pointer"
                         >
                           <p className="font-medium text-slate-900 line-clamp-1 group-hover:text-blue-700">{notif.title}</p>
                           {notif.type === "TASK_REMINDER" ? (
                             <>
                               <p className="text-[11px] text-slate-500 mt-1 font-semibold line-clamp-1">{notif.plan?.title || ""}</p>
                               <p className="text-xs text-slate-600 mt-1.5 flex items-center gap-1">Muddat: {notif.timeframe || notif.deadline || "Muddatsiz"}</p>
                             </>
                           ) : (
                             <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{notif.message}</p>
                           )}
                         </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <ThemeToggle />

            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-900">{user.name}</span>
              <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full mt-0.5 self-end tracking-wider">{user.role}</span>
            </div>
            <Link 
              href="/dashboard/profile"
              title="Akkaunt sozlamalari"
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-blue-100 cursor-pointer overflow-hidden border border-blue-200"
            >
              {(user as any).avatarUrl ? (
                <img src={(user as any).avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                <>{user.name?.charAt(0).toUpperCase()}</>
              )}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 lg:p-8 print:p-0 print:overflow-visible transition-colors duration-300">
          <div className="max-w-7xl mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, isOpen, active, isMobile }: { href: string, icon: React.ReactNode, label: string, isOpen: boolean, active: boolean, isMobile: boolean }) {
  return (
    <Link href={href} className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${active ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}>
      <span className={`shrink-0 transition-transform group-hover:scale-110`}>{icon}</span>
      <span className={`ml-3 font-medium whitespace-nowrap transition-opacity duration-200 ${!isOpen && !isMobile ? 'opacity-0 lg:hidden' : 'opacity-100'}`}>{label}</span>
      {active && isOpen && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
    </Link>
  );
}
