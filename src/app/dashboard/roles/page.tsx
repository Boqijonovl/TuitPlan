"use client";

import { useState, useEffect } from "react";
import { Shield, Plus, Edit2, Trash2, X, Check, Save } from "lucide-react";
import toast from "react-hot-toast";

const AVAILABLE_PERMISSIONS = [
  { id: "VIEW_MONITORING", name: "Monitoring G/K", desc: "Statistik grafikalar va ko'rsatkichlarni ko'rish" },
  { id: "VIEW_FACULTIES", name: "Fakultetlarni ko'rish", desc: "Tuzilma sahifasiga kirish" },
  { id: "VIEW_USERS", name: "Xodimlarni ko'rish", desc: "Foydalanuvchilar ro'yxatini va sahifasini ko'rish" },
  { id: "EDIT_USERS", name: "Xodimlarni tahrirlash", desc: "Yangi xodim qo'shish yoki o'chirish" },
  { id: "VIEW_ARCHIVE", name: "Fayllar arxivi", desc: "Arxivdagi hujjatlarni o'qish" },
  { id: "VIEW_CHAT", name: "Xabarlashish", desc: "Ichki Chat tizimiga kirish" },
  { id: "VIEW_HISTORY", name: "Tarix va Jurnallar", desc: "Super Admin xavfsizlik audit jurnallariga kirish" },
  { id: "VIEW_SETTINGS", name: "Tizim sozlamalari", desc: "Global sozlamalarga kirish (Faqat uqish)" },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  
  const [roleForm, setRoleForm] = useState({ name: "", permissions: [] as string[] });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
      if (res.ok) setRoles(await res.json());
    } catch (e) {
      toast.error("Rollarni yuklashda xato");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = (id: string) => {
    setRoleForm(prev => {
      const isSelected = prev.permissions.includes(id);
      return {
        ...prev,
        permissions: isSelected ? prev.permissions.filter(p => p !== id) : [...prev.permissions, id]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name) return toast.error("Rol nomini kiriting");
    setLoading(true);

    try {
      const API_URL = editingRole ? `/api/roles/${editingRole.id}` : "/api/roles";
      const METHOD = editingRole ? "PUT" : "POST";

      const res = await fetch(API_URL, {
        method: METHOD,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleForm)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(editingRole ? "Muvaffaqiyatli saqlandi!" : "Yangi rol yaratildi!");
      setIsModalOpen(false);
      fetchRoles();
    } catch (e: any) {
      toast.error(e.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Haqiqatdan ham "${name}" rolini butunlay o'chirasizmi? (Ushbu roldagi xodimlar parcha ruxsatdan ayriladi)`)) return;
    try {
       const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
       if (res.ok) {
         toast.success("Muvaffaqiyatli o'chirildi");
         fetchRoles();
       } else toast.error("Xatolik");
    } catch (e) {
       toast.error("Tizimda xatolik");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
             <div className="p-2 bg-blue-100 rounded-xl text-blue-600 shadow-inner">
               <Shield className="w-6 h-6" />
             </div>
             Rollar va Huquqlar (RBAC)
           </h1>
           <p className="text-sm font-medium text-slate-500 mt-2">Maxsus rollar yaratish va tizim vidjetlariga cheklovlar qo'yish paneli</p>
        </div>
        <button 
          onClick={() => { setEditingRole(null); setRoleForm({ name: "", permissions: [] }); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-sm flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> Yangi Korporativ Rol
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
         {loading && roles.length === 0 ? (
           [1,2].map(i => <div key={i} className="h-48 bg-white border border-slate-100 animate-pulse rounded-xl"></div>)
         ) : (
           roles.map(r => (
             <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-blue-300 transition-colors group relative overflow-hidden flex flex-col justify-between">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
               <div>
                 <div className="flex items-center justify-between mb-4 relative z-10">
                   <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold shadow-inner">
                     <Shield className="w-5 h-5" />
                   </div>
                   <span className="text-xs font-bold tracking-widest text-slate-400">{r.permissions.length} TA HUQUQ</span>
                 </div>
                 <h3 className="text-xl font-extrabold text-slate-900 tracking-tight relative z-10">{r.name}</h3>
                 <div className="mt-4 flex flex-wrap gap-1 relative z-10">
                   {r.permissions.slice(0, 4).map((p: string) => (
                      <span key={p} className="text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-100/50">{p}</span>
                   ))}
                   {r.permissions.length > 4 && <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded">+{r.permissions.length - 4} YANA</span>}
                 </div>
               </div>
               
               <div className="mt-6 flex items-center gap-2 relative z-10 border-t border-slate-100 pt-4">
                 <button onClick={() => { setEditingRole(r); setRoleForm({ name: r.name, permissions: r.permissions }); setIsModalOpen(true); }} className="flex-1 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-bold text-xs py-2 rounded-lg transition-colors border border-transparent hover:border-blue-100 flex items-center justify-center gap-1.5"><Edit2 className="w-3.5 h-3.5"/> Tahrirlash</button>
                 {["ADMIN", "DEKAN", "MUDIR", "OQITUVCHI"].includes(r.name) ? (
                   <div className="px-3 bg-slate-50 text-slate-300 font-bold text-xs py-2 rounded-lg border border-transparent cursor-not-allowed" title="Tizim asosiy rolini o'chirib bo'lmaydi"><Trash2 className="w-3.5 h-3.5"/></div>
                 ) : (
                   <button onClick={() => handleDelete(r.id, r.name)} className="px-3 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 font-bold text-xs py-2 rounded-lg transition-colors border border-transparent hover:border-red-100"><Trash2 className="w-3.5 h-3.5"/></button>
                 )}
               </div>
             </div>
           ))
         )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-blue-600 p-6 flex justify-between items-center shrink-0">
                 <div className="text-white flex items-center gap-3">
                   <div className="p-2 bg-white/20 rounded-xl"><Shield className="w-5 h-5"/></div>
                   <h2 className="font-bold text-lg">{editingRole ? "Rolni Tahrirlash" : "Yangi Rol Qo'shish"}</h2>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="text-white/60 hover:text-white"><X className="w-6 h-6"/></button>
              </div>

              <div className="p-8 overflow-y-auto flex-1 space-y-8">
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700 flex justify-between">
                     Korporativ Rol Nomi
                     {["ADMIN", "DEKAN", "MUDIR", "OQITUVCHI"].includes(roleForm.name) && (
                       <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Ismi qulflangan</span>
                     )}
                   </label>
                   <input 
                     required 
                     disabled={["ADMIN", "DEKAN", "MUDIR", "OQITUVCHI"].includes(roleForm.name)}
                     value={roleForm.name} 
                     onChange={e => setRoleForm({...roleForm, name: e.target.value})} 
                     className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-semibold px-4 py-3 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                     placeholder="Masalan: Moliya Auditori, Inspektor..." 
                   />
                 </div>

                 <div className="space-y-4">
                   <label className="text-sm font-bold text-slate-700 flex justify-between items-center">
                     Ruxsatnomalar Matritsasi
                     <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded font-semibold">{roleForm.permissions.length}/{AVAILABLE_PERMISSIONS.length} YOQILDI</span>
                   </label>
                   <div className="space-y-2">
                      {AVAILABLE_PERMISSIONS.map(p => {
                        const isChecked = roleForm.permissions.includes(p.id);
                        return (
                          <div key={p.id} onClick={() => handleTogglePermission(p.id)} className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${isChecked ? 'bg-blue-50/50 border-blue-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-transparent'}`}>
                               <Check className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1">
                               <p className={`text-sm font-black tracking-tight ${isChecked ? 'text-blue-900' : 'text-slate-700'}`}>{p.name}</p>
                               <p className="text-xs text-slate-500 font-medium mt-0.5">{p.desc}</p>
                            </div>
                          </div>
                        )
                      })}
                   </div>
                 </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                 <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors">Bekor qilish</button>
                 <button onClick={handleSubmit} disabled={loading} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-transform transform hover:-translate-y-0.5 flex items-center gap-2">
                   {loading ? "Saqlanmoqda..." : <><Save className="w-4 h-4"/> Saqlash</>}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
