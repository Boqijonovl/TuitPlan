"use client";

import { useState, useEffect } from "react";
import { Plus, Building2, Trash2, X, GraduationCap, Shield, UserPlus, Edit2 } from "lucide-react";
import toast from "react-hot-toast";

export default function FacultiesPage() {
  const [faculties, setFaculties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDepModalOpen, setIsDepModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [facultyName, setFacultyName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [editTarget, setEditTarget] = useState({ id: "", name: "", type: "FACULTY" });
  
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "TEACHER", facultyId: "", departmentId: "" });

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setCurrentUser(JSON.parse(user));
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/faculties");
      const data = await res.json();
      setFaculties(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/faculties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: facultyName })
      });
      if (res.ok) {
        setFacultyName("");
        setIsModalOpen(false);
        toast.success("Fakultet muvaffaqiyatli qo'shildi!");
        fetchFaculties();
      } else {
        const d = await res.json();
        toast.error(d.error || "Xatolik yuz berdi");
      }
    } catch (e: any) {
      toast.error(e.message || "Xatolik yuz berdi");
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: departmentName, facultyId: selectedFacultyId })
      });
      if (res.ok) {
        setDepartmentName("");
        setIsDepModalOpen(false);
        toast.success("Kafedra muvaffaqiyatli qo'shildi!");
        fetchFaculties();
      } else {
        const d = await res.json();
        toast.error(d.error || "Saqlashda xatolik yuz berdi");
      }
    } catch(e: any) { 
      toast.error(e.message || "Saqlashda xatolik yuz berdi");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm)
      });
      if (res.ok) {
        setUserForm({ name: "", email: "", password: "", role: "TEACHER", facultyId: "", departmentId: "" });
        setIsUserModalOpen(false);
        toast.success("Xodim muvaffaqiyatli ro'yxatga olindi!");
      } else {
        const d = await res.json();
        toast.error(d.error || "Xatolik yuz berdi");
      }
    } catch(e: any) { 
      toast.error(e.message || "Xatolik yuz berdi");
    }
  };

  const handleDeleteDepartment = async (id: string, name: string) => {
    if(!confirm(`Haqiqatan ham "${name}" nomli kafedrani butunlay o'chirmoqchimisiz?`)) return;
    try {
      const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
      if(res.ok) {
        toast.success("Kafedra o'chirildi!");
        fetchFaculties();
      } else {
        toast.error((await res.json()).error || "Kafedrani o'chirishda xatolik");
      }
    } catch(e: any) { 
      toast.error(e.message || "Xatolik yuz berdi");
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    if (!confirm("Fakultetni o'chirsangiz, ichidagi barcha kafedralar ham o'chib ketadi. Rostdan ham o'chirasizmi?")) return;
    try {
      const res = await fetch(`/api/faculties/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Fakultet o'chirildi!");
        fetchFaculties();
      } else {
        toast.error((await res.json()).error || "Fakultetni o'chirishda xatolik");
      }
    } catch (e: any) {
      toast.error(e.message || "Xatolik yuz berdi");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = editTarget.type === "FACULTY" ? `/api/faculties/${editTarget.id}` : `/api/departments/${editTarget.id}`;
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editTarget.name })
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        toast.success("Muvaffaqiyatli tahrirlandi!");
        fetchFaculties();
      } else {
        toast.error((await res.json()).error || "Xatolik yuz berdi");
      }
    } catch (e: any) {
      toast.error(e.message || "Xatolik yuz berdi");
    }
  };

  if (currentUser?.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4"><Shield className="w-8 h-8" /></div>
        <h2 className="text-2xl font-bold text-slate-800">Ruxsat etilmagan hudud</h2>
        <p className="text-slate-500 mt-2">Tuzilmalarni boshqarish bo'limi faqatgina Bosh Admin uchun ochiq.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">Tuzilma va Fakultetlar</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Oliy ta'lim muassasasining to'liq ierarxiyasini boshqarish</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-2xl font-bold shadow-xl shadow-blue-500/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 shadow-sm" />
          Yangi Fakultet
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>)
        ) : (
          faculties.map((faculty: any) => (
            <div key={faculty.id} className="bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden flex flex-col group/card relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50/20 opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none"></div>
              
              <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-900 flex justify-between items-start relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-blue-100 shadow-inner border border-white/20">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-xl tracking-tight leading-tight drop-shadow-sm line-clamp-2 pr-2">{faculty.name}</h3>
                    <div className="flex items-center gap-3 mt-2">
                       <span className="text-blue-200 text-xs font-semibold opacity-90">{faculty.departments?.length || 0} ta kafedra • {faculty._count?.users || 0} xodim</span>
                       <button 
                         onClick={(e) => {
                            e.stopPropagation();
                            setUserForm({ name: "", email: "", password: "", role: "DEAN", facultyId: faculty.id, departmentId: "" });
                            setIsUserModalOpen(true);
                         }}
                         className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors"
                       >
                         <UserPlus className="w-3 h-3" /> Dekan
                       </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 relative z-10 shrink-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditTarget({ id: faculty.id, name: faculty.name, type: "FACULTY" }); setIsEditModalOpen(true); }}
                    className="text-white/40 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all"
                    title="Nomini tahrirlash"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteFaculty(faculty.id)}
                    className="text-white/40 hover:text-red-400 hover:bg-white/10 p-2 rounded-xl transition-all"
                    title="Fakultetni o'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 flex-1 space-y-4 relative z-10">
                <div className="flex items-center justify-between mb-4 mt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">Kafedralar ro'yxati</span>
                  <button 
                    onClick={() => {
                      setSelectedFacultyId(faculty.id);
                      setIsDepModalOpen(true);
                    }}
                    className="text-xs font-extrabold text-indigo-600 hover:text-white hover:bg-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-indigo-100 hover:border-indigo-600 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> QO'SHISH
                  </button>
                </div>
                
                {faculty.departments?.length > 0 ? (
                  <ul className="space-y-3">
                    {faculty.departments.map((dep: any) => (
                      <li key={dep.id} className="group/item flex items-center justify-between gap-3 text-sm bg-white px-4 py-3.5 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all cursor-default relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-colors duration-300">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-slate-800 tracking-tight line-clamp-1 group-hover/item:text-indigo-900 transition-colors" title={dep.name}>{dep.name}</span>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full whitespace-nowrap border border-slate-200">{dep._count?.users || 0} xodim</span>
                        </div>
                        <div className="flex items-center gap-1 relative z-10 opacity-60 group-hover/item:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { 
                               e.stopPropagation(); 
                               setUserForm({ name: "", email: "", password: "", role: "HOD", facultyId: faculty.id, departmentId: dep.id });
                               setIsUserModalOpen(true);
                            }}
                            className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors title='Kafedra Mudiri yoki O`qituvchi qo`shish'"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditTarget({ id: dep.id, name: dep.name, type: "DEPARTMENT" }); setIsEditModalOpen(true); }}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-all" title="Nomini tahrirlash"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteDepartment(dep.id, dep.name); }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all" title="Kafedrani o'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                      <GraduationCap className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-sm font-semibold text-slate-400">Hozircha bo'sh</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Faculty Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-white/50">
             <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm"><Building2 className="w-5 h-5"/></div>
                 <h2 className="font-bold text-lg tracking-wide">Yangi Fakultet</h2>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all"><X className="w-5 h-5"/></button>
             </div>
             <form onSubmit={handleAddFaculty} className="p-8 space-y-6">
               <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700">Fakultet Nomi</label>
                 <input type="text" required value={facultyName} onChange={e => setFacultyName(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all shadow-inner" placeholder="Masalan: Axborot Texnologiyalari Fakulteti" />
               </div>
               <div className="flex justify-end gap-3 pt-2">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 hover:bg-slate-100 rounded-2xl text-slate-600 font-bold text-sm transition-colors">Bekor qilish</button>
                 <button type="submit" className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-sm shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)] hover:shadow-[0_8px_25px_-6px_rgba(79,70,229,0.6)] transform hover:-translate-y-0.5 transition-all">Saqlash</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {isDepModalOpen && (
        <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-white/50">
             <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm"><GraduationCap className="w-5 h-5"/></div>
                 <h2 className="font-bold text-lg tracking-wide">Yangi Kafedra Qo'shish</h2>
               </div>
               <button onClick={() => setIsDepModalOpen(false)} className="text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all"><X className="w-5 h-5"/></button>
             </div>
             <form onSubmit={handleAddDepartment} className="p-8 space-y-6">
               <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700">Kafedra Nomi</label>
                 <input type="text" required value={departmentName} onChange={e => setDepartmentName(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all shadow-inner" placeholder="Masalan: Dasturiy Injiniring Kafedrasi" />
               </div>
               <div className="flex justify-end gap-3 pt-2">
                 <button type="button" onClick={() => setIsDepModalOpen(false)} className="px-6 py-3 hover:bg-slate-100 rounded-2xl text-slate-600 font-bold text-sm transition-colors">Bekor qilish</button>
                 <button type="submit" className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-sm shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)] hover:shadow-[0_8px_25px_-6px_rgba(79,70,229,0.6)] transform hover:-translate-y-0.5 transition-all">Saqlash</button>
               </div>
             </form>
           </div>
        </div>
      )}

      {/* Add User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-white/50">
             <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm"><UserPlus className="w-5 h-5"/></div>
                 <h2 className="font-bold text-lg tracking-wide">Yangi Xodim Qo'shish</h2>
               </div>
               <button onClick={() => setIsUserModalOpen(false)} className="text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all"><X className="w-5 h-5"/></button>
             </div>
             <form onSubmit={handleAddUser} className="p-8 space-y-4">
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1.5">F.I.SH (Ism Familiya)</label>
                 <input type="text" required value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="Masalan: Aliyev Vali" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1.5">Mavqei (Role)</label>
                   <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold">
                     {userForm.departmentId === "" && <option value="DEAN">Dekan</option>}
                     {userForm.departmentId !== "" && <option value="HOD">Kafedra Mudiri</option>}
                     {userForm.departmentId !== "" && <option value="TEACHER">O'qituvchi</option>}
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1.5">Tizimga Kirish (Login)</label>
                   <input type="text" required value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="johndoe12" />
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1.5">Parol</label>
                 <input type="text" required value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="Maxfiy kod..." />
               </div>
               <div className="flex justify-end gap-3 pt-4">
                 <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-6 py-2.5 hover:bg-slate-100 rounded-xl text-slate-600 font-bold text-sm transition-colors">Bekor qilish</button>
                 <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all">Ro'yxatdan o'tkazish</button>
               </div>
              </form>
           </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-white/50">
             <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm"><Edit2 className="w-5 h-5"/></div>
                 <h2 className="font-bold text-lg tracking-wide">Nomini O'zgartirish</h2>
               </div>
               <button onClick={() => setIsEditModalOpen(false)} className="text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all"><X className="w-5 h-5"/></button>
             </div>
             <form onSubmit={handleEdit} className="p-8 space-y-6">
               <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700">{editTarget.type === "FACULTY" ? "Fakultet Nomi" : "Kafedra Nomi"}</label>
                 <input type="text" required value={editTarget.name} onChange={e => setEditTarget({...editTarget, name: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all shadow-inner" />
               </div>
               <div className="flex justify-end gap-3 pt-2">
                 <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 hover:bg-slate-100 rounded-2xl text-slate-600 font-bold text-sm transition-colors">Bekor qilish</button>
                 <button type="submit" className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold text-sm shadow-[0_8px_20px_-6px_rgba(245,158,11,0.5)] hover:shadow-[0_8px_25px_-6px_rgba(245,158,11,0.6)] transform hover:-translate-y-0.5 transition-all">Saqlash</button>
               </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
}
