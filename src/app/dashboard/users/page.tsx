"use client";

import { useState, useEffect, useRef } from "react";
import { Users, User as UserIcon, Plus, Shield, UserX, Edit2, Key, CheckCircle, Mail, Briefcase, GraduationCap, X, Search, UserCheck, Trash2, Building2, ChevronLeft, RefreshCw, FileText, Upload, Download } from "lucide-react";
import toast from "react-hot-toast";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // 3-Level Navigation States
  const [activeFacultyId, setActiveFacultyId] = useState<string | "ADMIN" | "ALL_DEANS" | "UNASSIGNED" | null>(null);
  const [activeDepartmentId, setActiveDepartmentId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const selectedFaculty = faculties.find(f => f.id === activeFacultyId);
  const departmentsForFaculty = selectedFaculty ? selectedFaculty.departments : [];
  const selectedDepartment = departmentsForFaculty?.find((d: any) => d.id === activeDepartmentId);

  const handleBackNavigation = () => {
    if (activeDepartmentId) {
      setActiveDepartmentId(null);
    } else if (activeFacultyId) {
      setActiveFacultyId(null);
    }
  };

  const handleRoleChange = (role: string) => {
    setNewUser(prev => ({
      ...prev, 
      role,
      departmentId: (role === "ADMIN" || role === "DEAN") ? "" : prev.departmentId
    }));
  };

  const openModalForCurrentView = () => {
    setEditingUserId(null);
    // Determine target role and faculty mapping intelligently based on virtual active states
    const targetRole = activeFacultyId === "ADMIN" ? "ADMIN" : activeFacultyId === "ALL_DEANS" ? "DEAN" : "TEACHER";
    const targetFaculty = ["ADMIN", "ALL_DEANS", "UNASSIGNED"].includes(activeFacultyId as string) ? "" : (activeFacultyId || "");

    setNewUser({
      name: "", email: "", password: "",
      role: targetRole,
      facultyId: targetFaculty,
      departmentId: activeDepartmentId || "" // Avtomatik Kafedrani tanlab ketish
    });
    setIsModalOpen(true);
  };

  const openEditModal = (u: any) => {
    setEditingUserId(u.id);
    setNewUser({
      name: u.name, 
      email: u.email, 
      password: "", // Optional during edit
      role: u.role,
      facultyId: u.facultyId || "",
      departmentId: u.departmentId || ""
    });
    setIsModalOpen(true);
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...newUser };
      if (!payload.departmentId) payload.departmentId = undefined as any;
      if (!payload.facultyId) payload.facultyId = undefined as any;

      const url = editingUserId ? `/api/users/${editingUserId}` : "/api/users";
      const method = editingUserId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        toast.success(editingUserId ? "Foydalanuvchi ma'lumotlari yangilandi!" : (activeFacultyId === "ADMIN" ? "Yangi Bosh admin qo'shildi!" : "Xodim muvaffaqiyatli qo'shildi!"));
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

  const handleWordUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeFacultyId || !activeDepartmentId) return;

    if (!file.name.endsWith(".doc") && !file.name.endsWith(".docx")) {
       toast.error("Iltimos, faqat .doc yoki .docx fayl ishlating!");
       return;
    }

    const toastId = toast.loading("Hujjat tahlil qilinmoqda...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("facultyId", activeFacultyId);
    formData.append("departmentId", activeDepartmentId);

    try {
        const res = await fetch("/api/users/import-word", { 
           method: "POST", 
           body: formData 
        });
        
        let data;
        try {
           data = await res.json();
        } catch (jsonErr) {
           throw new Error(`Server butunlay qotdi yohud Hali yangilanmadi! Xato kodi: ${res.status}`);
        }

        if (res.ok) {
            toast.success(data.message, { id: toastId });
            fetchUsers();
        } else {
            toast.error(data.error || "Noma'lum server xatosi", { id: toastId });
        }
    } catch(err: any) {
        toast.error(`Aloqa xatosi: ${err.message}`, { id: toastId });
    }
    
    if (fileInputRef.current) fileInputRef.current.value = ""; // Inputni tozalash
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

  // Sahifa Strukturasi Title lari
  let viewTitle = "Xodimlar Boshqaruvi";
  let viewSubtitle = "Fakultetlar va Kafedralar bo'ylab ko'rish rejimidasiz.";
  let filteredUsers: any[] = [];

  if (activeFacultyId === "ADMIN") {
     viewTitle = "Oliy Tuzilma (Adminlar)";
     viewSubtitle = "Tizimni to'liq boshqaruvchi shaxslar";
     filteredUsers = users.filter((u: any) => u.role === "ADMIN");
  } else if (activeFacultyId === "ALL_DEANS") {
     viewTitle = "Fakultet Dekanlari";
     viewSubtitle = "Tizimdagi barcha ta'lim fakultetlari rahbarlari ro'yxati";
     filteredUsers = users.filter((u: any) => u.role === "DEAN");
  } else if (activeFacultyId === "UNASSIGNED") {
     viewTitle = "Biriktirilmagan Kadrlar";
     viewSubtitle = "Fakulteti yoki kafedrasi noma'lum izolyatsiyadagi xodimlar";
     filteredUsers = users.filter((u: any) => u.role !== "ADMIN" && !u.facultyId);
  } else if (activeFacultyId && !activeDepartmentId) {
     viewTitle = selectedFaculty?.name || "Kafedralar ro'yxati";
     viewSubtitle = "Iltimos, tarkibiy Kafedrani tanlang.";
  } else if (activeFacultyId && activeDepartmentId) {
     viewTitle = selectedDepartment?.name || "Kafedra";
     viewSubtitle = `${selectedFaculty?.name || "Fakultet"} tarkibidagi kadrlar ro'yxati`;
     filteredUsers = users.filter((u: any) => u.departmentId === activeDepartmentId);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {activeFacultyId && (
            <button 
              onClick={handleBackNavigation}
              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-all hover:-translate-x-1"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
              {viewTitle}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {viewSubtitle}
            </p>
          </div>
        </div>
        
        {/* Yuqori O'ng Tugmalar: Faqat 3-bosqich (yoki Adminlar/Virtual kategoriyalar) ga yetgandagina asosiylar chiqadi */}
        {activeFacultyId && (activeDepartmentId || ["ADMIN", "ALL_DEANS", "UNASSIGNED"].includes(activeFacultyId)) && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            
            {/* Ommaviy Export Word Tugmasi */}
            <button 
                onClick={() => {
                   let url = `/api/users/export-word?`;
                   if (activeFacultyId === "ADMIN" || activeFacultyId === "ALL_DEANS" || activeFacultyId === "UNASSIGNED") {
                      url += `role=${activeFacultyId}`;
                   } else if (activeDepartmentId) {
                      url += `departmentId=${activeDepartmentId}`;
                   } else if (activeFacultyId) {
                      url += `facultyId=${activeFacultyId}`;
                   }
                   window.location.href = url;
                }}
                className="bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm shrink-0 text-sm"
                title="Barcha xodimlarni Word formatida chaqirib olish"
              >
                <Download className="w-4 h-4 text-purple-500" />
                <span className="hidden sm:inline">Word-ga Olish</span>
            </button>

            {/* Word fayl orqali Ommaviy Import Kafedralar darajasida (3-qavat) ishlaydi */}
            {activeDepartmentId && (
              <>
                <input 
                   type="file" 
                   accept=".doc,.docx"
                   ref={fileInputRef} 
                   onChange={handleWordUpload} 
                   className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm shrink-0 text-sm"
                  title="Word ro'yxatni kiritish"
                >
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span className="hidden sm:inline">Word.docx Import</span>
                </button>
              </>
            )}

            <button 
              onClick={openModalForCurrentView}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-colors shrink-0 text-sm"
            >
              <Plus className="w-5 h-5" /> 
              {activeFacultyId === "ADMIN" ? "Admin Qo'shish" : activeFacultyId === "ALL_DEANS" ? "Dekan Qo'shish" : "Xodim Qo'shish"}
            </button>
          </div>
        )}
      </div>

      {/* 1-QAVAT: FAKULTETLAR VA ASOSIY MENU KO'RINISHI */}
      {!activeFacultyId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-300">
          
          {/* Adminlar Kartochkasi */}
          <div 
            onClick={() => setActiveFacultyId("ADMIN")}
            className="group cursor-pointer bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center text-center overflow-hidden relative"
          >
            <Shield className="w-24 h-24 text-white/5 absolute -bottom-4 -right-4 blur-sm group-hover:scale-125 transition-transform duration-500" />
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-white border border-white/20">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Oliy Tuzilma</h3>
            <p className="text-slate-400 text-sm mb-4">Tizim administratorlari (Boshqaruvchi guruh)</p>
            <div className="mt-auto inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-white font-bold text-sm">
              <UserCheck className="w-4 h-4" /> {users.filter((u: any) => u.role === "ADMIN").length} xodim
            </div>
          </div>

          {/* Dekanlar Kartochkasi */}
          <div 
            onClick={() => setActiveFacultyId("ALL_DEANS")}
            className="group cursor-pointer bg-gradient-to-br from-amber-500 to-orange-600 border border-amber-600 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center text-center overflow-hidden relative"
          >
            <Users className="w-24 h-24 text-white/5 absolute -top-4 -right-4 blur-sm group-hover:scale-125 transition-transform duration-500" />
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <Briefcase className="w-8 h-8 drop-shadow-md" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 leading-tight">Yig'ma Dekanlar</h3>
            <p className="text-amber-100 text-xs mb-4">Mavjud barcha fakultet dekanlari ro'yxati</p>
            <div className="mt-auto inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-white font-bold text-sm border border-white/10">
              {users.filter((u: any) => u.role === "DEAN").length} ta dekan
            </div>
          </div>

          {/* Fakultetsiz Xodimlar Kartochkasi */}
          <div 
            onClick={() => setActiveFacultyId("UNASSIGNED")}
            className="group cursor-pointer bg-gradient-to-br from-rose-500 to-red-600 border border-red-600 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center text-center overflow-hidden relative"
          >
            <UserX className="w-24 h-24 text-white/5 absolute -bottom-4 -left-4 blur-sm group-hover:scale-125 transition-transform duration-500" />
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-white border border-white/20">
              <UserX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 leading-tight">Bo'sh Kadrlar</h3>
            <p className="text-rose-100 text-xs mb-4">Hech bir kafedraga kirmagan izolyatsiya ro'yxati</p>
            <div className="mt-auto inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-white font-bold text-sm">
              {users.filter((u: any) => u.role !== "ADMIN" && !u.facultyId).length} tasdiqsiz xodim
            </div>
          </div>

          {/* Fakultetlar Kartochkalari */}
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-[250px] bg-white border border-slate-200 animate-pulse rounded-2xl"></div>)
          ) : (
            faculties.map((faculty: any) => {
              const facUsersCount = users.filter((u: any) => u.facultyId === faculty.id).length;
              return (
                <div 
                  key={faculty.id}
                  onClick={() => setActiveFacultyId(faculty.id)}
                  className="group cursor-pointer bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 p-6 flex flex-col items-center text-center relative overflow-hidden"
                >
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-blue-100 relative z-10">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors relative z-10">{faculty.name}</h3>
                  <div className="flex items-center gap-1 text-slate-500 text-xs mb-4 font-medium px-3 py-1 bg-slate-50 rounded-lg relative z-10">
                    <GraduationCap className="w-4 h-4" /> {faculty.departments?.length || 0} Ta Kiruvchi Kafedra
                  </div>
                  <div className="mt-auto inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full font-bold text-sm group-hover:bg-blue-100 transition-colors relative z-10">
                    <UserCheck className="w-4 h-4 text-blue-500" /> Jami: {facUsersCount} kadr
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2-QAVAT: TANLANGAN FAKULTETNING KAFEDRALARI */}
      {activeFacultyId && !["ADMIN", "ALL_DEANS", "UNASSIGNED"].includes(activeFacultyId) && !activeDepartmentId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-4 duration-300">
           {departmentsForFaculty.map((dept: any) => {
              const deptUsersCount = users.filter((u: any) => u.departmentId === dept.id).length;
              return (
                <div 
                  key={dept.id}
                  onClick={() => setActiveDepartmentId(dept.id)}
                  className="group cursor-pointer bg-indigo-50 border border-indigo-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-300 p-6 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                     <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                          <Briefcase className="w-6 h-6" />
                        </div>
                     </div>
                     <h3 className="text-base font-bold text-indigo-900 leading-snug mb-2">{dept.name}</h3>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-indigo-200/50 pt-4">
                     <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Bo'lim</span>
                     <div className="inline-flex items-center gap-1.5 text-xs text-indigo-700 font-bold bg-indigo-100 px-3 py-1 rounded-full">
                       <UserIcon className="w-3.5 h-3.5" /> {deptUsersCount} mavjud kadr
                     </div>
                  </div>
                </div>
              );
           })}
           {departmentsForFaculty.length === 0 && (
             <div className="col-span-full py-12 text-center text-slate-400 font-medium">Bu fakultetda bironta ham Kafedra ochilmagan! Avval Kafedralar bo'limidan kafedra yarating.</div>
           )}
        </div>
      )}

      {/* 3-QAVAT: TANLANGAN KAFEDRAGI (Yoki maxsus guruhlardagi) XODIMLAR JADVALI */}
      {activeFacultyId && (activeDepartmentId || ["ADMIN", "ALL_DEANS", "UNASSIGNED"].includes(activeFacultyId)) && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px] animate-in slide-in-from-bottom-4 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Foydalanuvchi</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Rol (Vazifa)</th>
                  <th className="px-6 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold relative ${activeFacultyId === "ADMIN" ? 'bg-slate-800 text-white' : 'bg-blue-100 text-blue-600'}`}>
                        {u.name.charAt(0).toUpperCase()}
                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${u.isDeleted ? 'bg-red-500' : 'bg-green-500'}`}></div>
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
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button 
                        onClick={() => openEditModal(u)}
                        className="text-slate-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition-colors title='Tahrirlash'"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors title='Ochirish'"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-slate-500">Hech qanday xodim topilmadi. Word orqali yoki qo'lda qo'shing.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL - Yangi Xodim Qo'shish & Tahrirlash */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-500"/> 
                {editingUserId 
                  ? "Xodimni Tahrirlash" 
                  : (activeFacultyId === "ADMIN" ? "Yangi Admin Yaratish" : activeFacultyId === "ALL_DEANS" ? "Yangi Dekan Yaratish" : `Yangi Xodim Qo'shish`)}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-200 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitUser} className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ism Familiya</label>
                  <input 
                    type="text" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Masalan: Boqijonov Boburjon"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Logini (Email)</label>
                  <input 
                    type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                    placeholder="boburjon@tuit.uz"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex justify-between">
                   Tizimga kirish paroli
                   {editingUserId && <span className="text-xs font-normal text-slate-400 italic">O'zgartirish ixtiyoriy</span>}
                </label>
                <input 
                  type="text" required={!editingUserId} value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                  placeholder={editingUserId ? "Yangi parol (bo'sh qolsa eski qoladi)" : "Qilish qiyin parol kiriting 123456..."}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                />
              </div>

              {activeFacultyId !== "ADMIN" && (
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

              {/* Tahrirlanayotganda yoki Majburiy rejimda Kafedrani o'zgartirish imkoniyati (O'qituvchi va Mudirlar uchun) */}
              {editingUserId && (newUser.role === "HOD" || newUser.role === "TEACHER") && activeFacultyId !== "ADMIN" && (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                    Biriktirilgan Kafedrani Yangilash
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
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md transition-colors disabled:opacity-70 text-sm flex items-center gap-2"
                >
                  {isSubmitting ? <span className="animate-spin w-4 h-4 rounded-full border-2 border-white/50 border-t-white"></span> : <CheckCircle className="w-4 h-4" />}
                  {isSubmitting ? "Saqlanmoqda..." : (editingUserId ? "O'zgarishlarni Saqlash" : "Xodimni Yaratish (Qo'shish)")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
