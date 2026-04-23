"use client";

import { useState, useEffect } from "react";
import { BookOpen, Plus, FileEdit, Trash2, CheckCircle, Clock, Eye, AlertCircle, Copy, Edit3, X, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const defaultPlanState = {
    id: null as string | null,
    title: "",
    year: new Date().getFullYear(),
    departmentId: "",
    status: "DRAFT",
    bulkDistribute: false,
    tasks: [] as { id?: string, title: string, timeframe: string, assignedRole: string, status?: string }[]
  };

  const [user, setUser] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState(defaultPlanState);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      // Silent sync to self-heal stale login session data for active DEKAN profiles
      if (parsed.role === "DEKAN" && !parsed.facultyId) {
         fetch("/api/users").then(res=>res.json()).then(users => {
            if(Array.isArray(users)) {
               const me = users.find((u: any) => u.id === parsed.id);
               if (me && me.facultyId) {
                  const updated = { ...parsed, facultyId: me.facultyId };
                  localStorage.setItem("user", JSON.stringify(updated));
                  setUser(updated);
               }
            }
         }).catch(()=>{});
      }
    }
    fetchPlans();
    fetchDepartments();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      let url = "/api/plans";
      if (storedUser) {
        const u = JSON.parse(storedUser);
        url = `/api/plans?userId=${u.id}&role=${u.role}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setPlans(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments");
      const data = await res.json();
      setDepartments(data);
    } catch (error) {
      console.error(error);
    }
  };

  const openNewPlanModal = () => {
    setCurrentPlan({
      ...defaultPlanState,
      departmentId: user?.role === "MUDIR" ? (user?.departmentId || "") : ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (plan: any) => {
    setCurrentPlan({
      id: plan.id,
      title: plan.title,
      year: plan.year,
      departmentId: plan.departmentId || "",
      status: plan.status || "DRAFT",
      bulkDistribute: false,
      tasks: plan.tasks ? plan.tasks.map((t: any) => ({
        id: t.id, title: t.title, timeframe: t.timeframe || "", assignedRole: t.assignedRole || "", status: t.status
      })) : []
    });
    setIsModalOpen(true);
  };

  const handleTaskChange = (index: number, field: string, value: string) => {
    const updatedTasks = [...currentPlan.tasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setCurrentPlan({ ...currentPlan, tasks: updatedTasks });
  };

  const addTaskRow = () => {
    setCurrentPlan({
      ...currentPlan,
      tasks: [...currentPlan.tasks, { title: "", timeframe: "", assignedRole: "" }]
    });
  };

  const removeTaskRow = (index: number) => {
    const updatedTasks = [...currentPlan.tasks];
    updatedTasks.splice(index, 1);
    setCurrentPlan({ ...currentPlan, tasks: updatedTasks });
  };

  const loadTemplateTasks = () => {
    const templateTasks = [
      { title: "Ochiq dars o'tish (Ma'ruza yoki Amaliyot)", timeframe: "Sentyabr-Dekabr", assignedRole: "PROFESSOR" },
      { title: "Xalqaro Scopus/Web of Science jurnalida maqola", timeframe: "Oktabr-May", assignedRole: "DOTSENT" },
      { title: "Kafedra ilmiy-uslubiy yig'ilishlarida qatnashish", timeframe: "Har oy", assignedRole: "KATTA_OQITUVCHI" },
      { title: "Iqtidorli talabalar bilan ishlash va to'garak mashg'ulotlari", timeframe: "Muntazam", assignedRole: "ASSISTENT" },
      { title: "Yangi avlod o'quv adabiyotlarini (Darslik/Qo'llanma) yaratish", timeframe: "Aprel-May", assignedRole: "PROFESSOR" }
    ];
    setCurrentPlan({
      ...currentPlan,
      tasks: [...currentPlan.tasks, ...templateTasks]
    });
    toast.success("Shablon vazifalar muvaffaqiyatli qo'shildi!");
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = currentPlan.id ? "PUT" : "POST";
      const url = currentPlan.id ? `/api/plans/${currentPlan.id}` : "/api/plans";
      
      const payload = currentPlan.id 
        ? currentPlan 
        : { ...currentPlan, userId: user?.id };
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchPlans();
        toast.success("Reja va uning vazifalari muvaffaqiyatli saqlandi!");
      } else {
        toast.error("Saqlashda xatolik yuz berdi!");
      }
    } catch (error: any) {
      toast.error(error.message || "Tizimda xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Haqiqatan ham bu rejani o'chirmoqchimisiz? Reja ichidagi barcha vazifalar qo'shib o'chiriladi!")) return;
    try {
      const res = await fetch(`/api/plans/${id}?userId=${user?.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Reja o'chirildi!");
        fetchPlans();
      } else {
        toast.error("O'chirishda xatolik yuz berdi.");
      }
    } catch (e: any) {
      toast.error(e.message || "Tizimda xatolik yuz berdi.");
    }
  };

  const handleExportWord = (plan: any) => {
    const subtitle = plan.department?.name || plan.faculty?.name || "Umumiy Muassasa";
    
    let tasksHtml = `
      <table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%; border: 1px solid black; font-family: Arial, sans-serif;">
        <thead>
          <tr style="background-color: #f2f2f2; font-weight: bold;">
            <th>Tartib</th>
            <th>Vazifa nomi</th>
            <th>Bajarish muddati</th>
            <th>Kimga biriktirilgan</th>
          </tr>
        </thead>
        <tbody>
    `;

    if (plan.tasks && plan.tasks.length > 0) {
      plan.tasks.forEach((t: any, idx: number) => {
        const roleNames: Record<string, string> = { "PROFESSOR": "Professor", "DOTSENT": "Dotsent", "KATTA_OQITUVCHI": "Katta o'qituvchi", "ASSISTENT": "Assistent", "MUDIR": "Kafedra mudiri", "DEKAN": "Fakultet dekani" };
        const rName = t.assignedRole ? (roleNames[t.assignedRole] || t.assignedRole) : "Hamma uchun";
        tasksHtml += `
          <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td>${t.title}</td>
            <td style="text-align: center;">${t.timeframe || "Muddatsiz"}</td>
            <td style="text-align: center;">${rName}</td>
          </tr>
        `;
      });
    } else {
      tasksHtml += `<tr><td colspan="4" style="text-align: center;">Vazifalar mavjud emas.</td></tr>`;
    }
    tasksHtml += `</tbody></table>`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 24px;">${plan.title}</h1>
        <h3 style="font-size: 16px; color: #555;">Yil: ${plan.year} | Bo'linma: ${subtitle}</h3>
        <hr style="margin-top: 20px; margin-bottom: 20px;"/>
      </div>
      ${tasksHtml}
    `;

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Doc</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + htmlBody + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = plan.title.replace(/\s+/g, '_') + '.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const handleOpenPlanFiles = (planBody: any) => {
    // Generate word file logic ...
  }

  if (["PROFESSOR", "DOTSENT", "KATTA_OQITUVCHI", "ASSISTENT"].includes(user?.role || "") || user?.role === "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mb-4"><AlertCircle className="w-8 h-8" /></div>
        <h2 className="text-2xl font-bold text-slate-900">Ruxsat etilmagan sahifa</h2>
        <p className="text-slate-500 mt-2">Kechirasiz, ushbu sahifaga kirish sizning rolingiz uchun yopilgan.</p>
      </div>
    );
  }

  if (loading) return (
    <div className="space-y-6">
       <div className="flex justify-between items-center"><Skeleton className="h-8 w-48" /><Skeleton className="h-10 w-32" /></div>
       <Skeleton className="h-[600px] w-full rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Yillik rejalar</h1>
          <p className="text-sm text-slate-500 mt-1">Fakultet va kafedralar kesimida tasdiqlangan va loyiha holatidagi rejalar.</p>
        </div>
        {user?.role !== "ADMIN" && (
          <button 
            onClick={openNewPlanModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors shrink-0"
          >
            <Plus className="w-5 h-5" />
            Yangi reja
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <div key={plan.id} className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-6 shadow-sm hover:shadow-sm transition-all group relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:bg-blue-600 transition-colors"></div>
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                
                <div className="flex gap-2">
                  <button onClick={() => handleExportWord(plan)} className="text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 p-2 rounded-lg transition-colors border border-slate-100 title='Word fayl sifatida yuklab olish'">
                    <Eye className="w-4 h-4" />
                  </button>
                  {(user?.role !== "ADMIN" && (!plan.userId || plan.userId === user?.id)) && (
                    <>
                      <button onClick={() => openEditModal(plan)} className="text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 p-2 rounded-lg transition-colors border border-slate-100 title='Tahrirlash'">
                        <FileEdit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeletePlan(plan.id)} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-50 p-2 rounded-lg transition-colors border border-slate-100 title='O`chirish'">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <h3 className="font-semibold text-lg text-slate-900 mb-1 leading-tight">{plan.title}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 font-medium">
                <Clock className="w-4 h-4 text-blue-400" />
                {plan.year}-yil
                <span className="text-slate-300">|</span>
                <span className="truncate">{plan.department?.name || "Umumiy reja"}</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
              <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                plan.status === 'APPROVED' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                plan.status === 'DRAFT' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                'bg-slate-50 text-slate-600 border border-slate-100'
              }`}>
                {plan.status}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                <CheckCircle className="w-3.5 h-3.5"/> {plan.tasks?.length || 0} Vazifalar
              </div>
            </div>
          </div>
        ))}
        {plans?.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <div className="mx-auto w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Rejalar yo'q</h3>
            <p className="text-sm text-slate-500 mt-1">Hozircha tizimga hech qanday reja kiritilmagan.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {currentPlan.id ? <Edit3 className="w-5 h-5 text-blue-500"/> : <Plus className="w-5 h-5 text-blue-500"/>}
                {currentPlan.id ? "Rejani tahrirlash" : "Yangi reja yaratish"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500 transition-colors p-1 rounded-md hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSavePlan} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                {/* Basic Info */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Asosiy ma'lumotlar</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Reja sarlavhasi</label>
                    <input 
                      type="text" required
                      value={currentPlan.title}
                      onChange={e => setCurrentPlan({...currentPlan, title: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Masalan: 2024-yilgi o'quv ishlari bo'yicha reja"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Qaysi yil uchun?</label>
                      <input 
                        type="number" required
                        value={currentPlan.year}
                        onChange={e => setCurrentPlan({...currentPlan, year: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Holati</label>
                      <select 
                        value={currentPlan.status}
                        onChange={e => setCurrentPlan({...currentPlan, status: e.target.value})}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-blue-600 outline-none transition-all"
                      >
                        <option value="DRAFT">Loyiha (Qoralama)</option>
                        <option value="APPROVED">Tasdiqlangan (Faol)</option>
                      </select>
                    </div>
                    {user?.role !== "MUDIR" && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Bo'linma (Kafedra)</label>
                        <select 
                          value={currentPlan.departmentId}
                          onChange={e => setCurrentPlan({...currentPlan, departmentId: e.target.value})}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
                        >
                          <option value="">Fakultet bo'yicha umumiy</option>
                          {departments
                            .filter(dep => user?.role === "DEKAN" ? dep.facultyId === user.facultyId : true)
                            .map(dep => (
                            <option key={dep.id} value={dep.id}>{dep.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {user?.role === "MUDIR" && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Bo'linma (Kafedra)</label>
                        <div className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-semibold cursor-not-allowed">
                          Faoliyatingizdagi kafedra uchun qulflangan
                        </div>
                      </div>
                    )}
                    {user?.role !== "MUDIR" && !currentPlan.id && (
                      <div className="col-span-full pt-2">
                        <label className="flex items-center gap-2 cursor-pointer bg-blue-50/50 p-3 rounded-xl border border-blue-100 transition-colors hover:bg-blue-50">
                          <input type="checkbox" checked={currentPlan.bulkDistribute} onChange={e => setCurrentPlan({...currentPlan, bulkDistribute: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                          <div>
                            <span className="text-sm font-bold text-blue-700 block">Shablonlarni barcha kafedralarga tarqatish (smart distributor)</span>
                            <span className="text-xs text-blue-400 font-medium">Belgilansa, ushbu reja fakultetdagi barcha kafedralar uchun alohida avtomatik ravishda yaratiladi.</span>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Rejadagi vazifalar ({currentPlan.tasks.length})</h3>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={loadTemplateTasks} className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                        <Copy className="w-4 h-4"/> Shablonlarni yuklash
                      </button>
                      <button type="button" onClick={addTaskRow} className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                        <Plus className="w-4 h-4"/> Qator qo'shish
                      </button>
                    </div>
                  </div>
                  
                  {currentPlan.tasks.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      Vazifalar qo'shilmagan. Yuqoridagi tugmani bosing.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentPlan.tasks.map((task, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
                          <div className="flex-1 w-full">
                            <input 
                              type="text" required placeholder="Vazifa nomi..." 
                              value={task.title} onChange={e => handleTaskChange(index, "title", e.target.value)}
                              className="w-full text-sm font-medium px-3 py-2 border-b border-transparent hover:border-slate-200 focus:border-blue-500 bg-transparent outline-none transition-colors"
                            />
                          </div>
                          <div className="w-full sm:w-40 shrink-0">
                            <input 
                              type="text" placeholder="Muddat (Masalan: Avgust, 2024)" 
                              value={task.timeframe} onChange={e => handleTaskChange(index, "timeframe", e.target.value)}
                              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          </div>
                          <div className="w-full sm:w-40 shrink-0 flex items-center gap-2">
                             <Shield className="w-4 h-4 text-slate-400 hidden lg:block" />
                             <select
                               value={task.assignedRole} onChange={e => handleTaskChange(index, "assignedRole", e.target.value)}
                               className="w-full text-xs px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-slate-700 font-medium"
                             >
                                <option value="">Hamma uchun</option>
                                <option value="PROFESSOR">Professorlar</option>
                                <option value="DOTSENT">Dotsentlar</option>
                                <option value="KATTA_OQITUVCHI">Katta o'qituvchilar</option>
                                <option value="ASSISTENT">Assistentlar</option>
                                {user?.role !== "MUDIR" && <option value="MUDIR">Kafedra mudirlari</option>}
                                {(user?.role === "ADMIN" || !user?.role) && <option value="DEKAN">Dekanlar</option>}
                             </select>
                          </div>
                          
                          <button type="button" onClick={() => removeTaskRow(index)} className="p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-50 rounded-lg shrink-0 transition-colors self-start mt-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
              
              <div className="p-5 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end gap-3 z-10">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl font-medium transition-colors"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  disabled={saving || currentPlan.title.trim() === ""}
                  className="px-6 py-2.5 bg-[#309F4C] hover:bg-[#25823c] text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? "Saqlanmoqda..." : "Saqlash va Tasdiqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
