"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Shield, UserX, Edit2, Key, CheckCircle, Mail, Briefcase, GraduationCap, X, Search, UserCheck, Trash2, Building2, ChevronLeft, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // activeView: null (Grid), "ADMIN" (Admin guruh), yoki facultyId (Fakultet guruhi)
  const [activeView, setActiveView] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "TEACHER",
    facultyId: "",
    departmentId: ""
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
    
    fetchUsers();
    fetchFaculties();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await fetch("/api/faculties");
      const data = await res.json();
      setFaculties(data);
    } catch (error) {
      console.error(error);
    }
  };

  const selectedFaculty = faculties.find(f => f.id === activeView);
  const departmentsForFaculty = selectedFaculty ? selectedFaculty.departments : [];

  const handleRoleChange = (role: string) => {
    setNewUser(prev => ({
      ...prev, 
      role,
      departmentId: (role === "ADMIN" || role === "DEAN") ? "" : prev.departmentId
    }));
  };

  const openModalForCurrentView = () => {
    setNewUser({
      name: "", email: "", password: "",
      role: activeView === "ADMIN" ? "ADMIN" : "TEACHER",
      facultyId: activeView === "ADMIN" ? "" : (activeView || ""),
      departmentId: ""
    });
    setIsModalOpen(true);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...newUser };
      if (!payload.departmentId) payload.departmentId = undefined as any;
      if (!payload.facultyId) payload.facultyId = undefined as any;

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        toast.success(activeView === "ADMIN" ? "Yangi Bosh admin qo'shildi!" : "Xodim muvaffaqiyatli qo'shildi!");
        fetchUsers();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Xatolik yuz berdi");
      }
    } catch (error: any) {
      toast.error(error.message || "Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Haqiqatan ham "${name}" ismli foydalanuvchini butunlay o'chirmoqchimisiz?`)) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Foydalanuvchi o'chirildi!");
        fetchUsers();
      }
      else toast.error((await res.json()).error || "O'chirishda xatolik yuz berdi");
    } catch (e: any) {
      toast.error(e.message || "Tizimda xatolik yuz berdi");
    }
  };

  const handleHemisSync = async () => {
    setIsSyncing(true);
    const toastId = toast.loading("HEMIS API tarmog'iga ulanmoqda...");
    try {
      const res = await fetch("/api/hemis/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "MOCK_TOKEN_123", hemisUrl: "https://hemis.uz" })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message, { id: toastId });
        fetchUsers();
      } else {
        toast.error(data.error, { id: toastId });
      }
    } catch (e) {
      toast.error("Tarmoq xatosi", { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  };

  if (currentUser && currentUser.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4"><Shield className="w-8 h-8" /></div>
        <h2 className="text-2xl font-bold text-slate-800">Ruxsat etilmagan hudud</h2>
        <p className="text-slate-500 mt-2">Kechirasiz, foydalanuvchilarni boshqarish bo'limi faqatgina Tizim Administratori uchun ochiq.</p>
      </div>
    );
  }

  // Filter users based on view
  let viewUsers = [];
  let viewTitle = "";
  let viewSubtitle = "";

  if (activeView === "ADMIN") {
    viewUsers = users.filter(u => u.role === "ADMIN");
    viewTitle = "Oliy Tuzilma (Adminlar)";
    viewSubtitle = "Tizimni to'liq boshqaruvchi shaxslar";
  } else if (activeView) {
    viewUsers = users.filter(u => u.facultyId === activeView);
    viewTitle = selectedFaculty?.name || "Noma'lum Fakultet";
    viewSubtitle = "Fakultet dekani, mudirlari va o'qituvchilari";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {activeView && (
            <button 
              onClick={() => setActiveView(null)}
              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-all hover:-translate-x-1"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {activeView ? viewTitle : "Xodimlar Boshqaruvi"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {activeView ? viewSubtitle : "Fakultetlar bo'yicha guruhlangan tizim foydalanuvchilari."}
            </p>
          </div>
        </div>
        
        {activeView && (
          <div className="flex items-center gap-2">
            <button 
              onClick={handleHemisSync}
              disabled={isSyncing}
              className="bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 shrink-0 text-sm shadow-sm"
              title="Kadrlar bazasini HEMIS dan tortib olish"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} /> 
              {isSyncing ? "Sinxronlanmoqda" : "HEMIS"}
            </button>
            <button 
              onClick={openModalForCurrentView}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-colors shrink-0 text-sm"
            >
              <Plus className="w-5 h-5" /> 
              {activeView === "ADMIN" ? "Admin Qo'shish" : "Xodim Qo'shish"}
            </button>
          </div>
        )}
      </div>

      {!activeView && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Adminlar Kartochkasi */}
          <div 
            onClick={() => setActiveView("ADMIN")}
            className="group cursor-pointer bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center text-center overflow-hidden relative"
          >
            <Shield className="w-24 h-24 text-white/5 absolute -bottom-4 -right-4 blur-sm group-hover:scale-125 transition-transform duration-500" />
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-white border border-white/20">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Oliy Tuzilma</h3>
            <p className="text-slate-400 text-sm mb-4">Tizim administratorlari (Boshqaruv)</p>
            <div className="mt-auto inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-white font-bold text-sm">
              <UserCheck className="w-4 h-4" /> {users.filter(u => u.role === "ADMIN").length} xodim
            </div>
          </div>

          {/* Fakultetlar Kartochkalari */}
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-[250px] bg-white border border-slate-200 animate-pulse rounded-2xl"></div>)
          ) : (
            faculties.map(faculty => {
              const facUsersCount = users.filter(u => u.facultyId === faculty.id).length;
              return (
                <div 
                  key={faculty.id}
                  onClick={() => setActiveView(faculty.id)}
                  className="group cursor-pointer bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 p-6 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-blue-100">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{faculty.name}</h3>
                  <div className="flex items-center gap-1 text-slate-500 text-xs mb-4 font-medium px-3 py-1 bg-slate-50 rounded-lg">
                    <GraduationCap className="w-4 h-4" /> {faculty.departments?.length || 0} Kafedra
                  </div>
                  <div className="mt-auto inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full font-bold text-sm group-hover:bg-blue-100 transition-colors">
                    <UserCheck className="w-4 h-4 text-blue-500" /> Jami: {facUsersCount} xodim
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tanlangan Guruh (Table View) */}
      {activeView && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px] animate-in slide-in-from-bottom-4 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Foydalanuvchi</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Rol</th>
                  {activeView !== "ADMIN" && <th className="px-6 py-4">Kafedrasi</th>}
                  <th className="px-6 py-4 text-right">Harakatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {viewUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${activeView === "ADMIN" ? 'bg-slate-800 text-white' : 'bg-blue-100 text-blue-600'}`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      {u.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" /> {u.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.role === "ADMIN" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 tracking-wider">ADMIN</span>}
                      {u.role === "DEAN" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100/50 tracking-wider">DEKAN</span>}
                      {u.role === "HOD" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/50 tracking-wider">MUDIR</span>}
                      {u.role === "TEACHER" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/50 tracking-wider">O'QITUVCHI</span>}
                    </td>
                    {activeView !== "ADMIN" && (
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {u.role === "DEAN" ? (
                          <span className="text-xs text-slate-400">Umumiy Fakultet Boshqaruvi</span>
                        ) : (
                          u.department?.name || "Biriktirilmagan"
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button 
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors title='Ochirish'"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {viewUsers.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-500">Foydalanuvchilar topilmadi</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Yangi Xodim Qo'shish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-500"/> 
                {activeView === "ADMIN" ? "Yangi Admin Yaratish" : `${viewTitle} - Xodim Qo'shish`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-200 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ism Familiya</label>
                  <input 
                    type="text" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Logini (Email)</label>
                  <input 
                    type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tizimga kirish paroli</label>
                <input 
                  type="text" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                />
              </div>

              {activeView !== "ADMIN" && (
                <div className="pt-2 border-t border-slate-50">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Vazifasi (Roli)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["TEACHER", "HOD", "DEAN"].map(r => (
                       <button
                         key={r} type="button" onClick={() => handleRoleChange(r)}
                         className={`px-3 py-2 border rounded-xl text-xs font-bold tracking-wide transition-colors ${newUser.role === r ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                       >
                         {r === "TEACHER" ? "Kafedra O'qituvchisi" : r === "HOD" ? "Kafedra Mudiri" : "Fakultet Dekani"}
                       </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Kafedrani tanlash (faqat HOD va TEACHER uchun) */}
              {activeView !== "ADMIN" && (newUser.role === "HOD" || newUser.role === "TEACHER") && (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                    Biriktiriladigan Kafedra
                  </label>
                  <select 
                    required value={newUser.departmentId} onChange={e => setNewUser({...newUser, departmentId: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all text-sm font-medium text-slate-700"
                  >
                    <option value="">Kafedrani tanlang...</option>
                    {departmentsForFaculty.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white border-t border-slate-50 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors text-sm"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md transition-colors disabled:opacity-70 text-sm"
                >
                  {isSubmitting ? "Saqlanmoqda..." : "Tasdiqlash va Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
