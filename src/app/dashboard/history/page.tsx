"use client";

import { useEffect, useState } from "react";
import { Search, History, ChevronRight, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HistoryUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Check role, admin only
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      if (u.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }
    }
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-slate-500 animate-pulse">Ma'lumotlar olinmoqda...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
             <History className="w-7 h-7 text-blue-600" />
             Tizim tarixi (kuzatuv)
           </h1>
           <p className="text-sm text-slate-500 mt-1">Siz xodimlarning akkauntiga qachon kirib nima amallar bajarganini kuzatishingiz mumkin.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Foydalanuvchi ismini qidiring..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 p-0">
          {filteredUsers.length === 0 ? (
            <div className="p-10 text-center text-slate-500">Foydalanuvchilar topilmadi</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredUsers.map(user => (
                <Link 
                  href={`/dashboard/history/${user.id}`} 
                  key={user.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                      <User className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{user.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{user.email} &bull; <span className="uppercase font-semibold text-blue-500">{user.role}</span></p>
                    </div>
                  </div>
                  <div className="text-slate-400 group-hover:text-blue-600 transition-colors pr-4">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
