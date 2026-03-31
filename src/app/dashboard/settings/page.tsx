"use client";

import { useState, useEffect } from "react";
import { Settings, DownloadCloud, AlertTriangle, ShieldCheck, Database, HardDrive, RefreshCcw, CheckSquare } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [maintenance, setMaintenance] = useState(false); // Bu joyda lokal konfiguratsiyaga simulyatsiya qilinmoqda

  const handleMaintenanceToggle = () => {
    // Kelajakda global middleware/server state lari yozilishi mumkin
    setMaintenance(!maintenance);
    toast.success(maintenance ? "Tizim barqaror holatga qaytdi" : "Tizim Texnik xizmat ko'rsatish rejimiga o'tkazildi!");
  };

  const handleDownloadBackup = async () => {
    setLoading(true);
    const toastId = toast.loading("Baza yig'ilmoqda...");
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("Avtorizatsiya mavjud emas");
      const user = JSON.parse(userStr);

      if (user.role !== "ADMIN") {
        toast.error("Ruxsat etilmagan");
        return;
      }

      window.location.href = `/api/backup/download?role=${user.role}`;
      toast.success("Yuklab olish boshlandi!", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "Xatolik yuz berdi", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
             <div className="p-2 bg-slate-100 rounded-xl text-slate-600 shadow-inner">
               <Settings className="w-6 h-6" />
             </div>
             Global Sozlamalar
           </h1>
           <p className="text-sm font-medium text-slate-500 mt-2">Dastur versiyasi, arxivlar va ruxsatlar boshqaruvi</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Xizmat Ko'rsatish Blok */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
             <AlertTriangle className="w-5 h-5 text-amber-500" />
             <h3 className="font-bold text-slate-900">Texnik xizmat rejimi</h3>
           </div>
           <div className="p-6 space-y-4">
             <p className="text-sm text-slate-600">
               Agar tizimda muhim yangilanishlar bo'layotgan bo'lsa, ushbu tugmani yoqish orqali barcha oddiy foydalanuvchilarning kirishini vaqtinchalik cheklashingiz mumkin. Faqat Bosh Adminlar kira oladi.
             </p>
             <div className="flex items-center gap-4 pt-2">
               <div className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${maintenance ? 'bg-red-500' : 'bg-slate-200'}`} onClick={handleMaintenanceToggle}>
                 <div className={`bg-white w-6 h-6 rounded-full shadow-sm transform transition-transform ${maintenance ? 'translate-x-6' : 'translate-x-0'}`}></div>
               </div>
               <span className={`font-bold text-sm ${maintenance ? 'text-red-500' : 'text-slate-400'}`}>
                 {maintenance ? "FAOL (Boshqalar kirolmaydi)" : "O'CHIRILGAN (Barqaror)"}
               </span>
             </div>
           </div>
        </div>

        {/* Database Backup */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
             <Database className="w-5 h-5 text-blue-500" />
             <h3 className="font-bold text-slate-900">Ma'lumotlar arxivini yuklash (Backup/JSON)</h3>
           </div>
           <div className="p-6 space-y-4">
             <p className="text-sm text-slate-600">
               Joriy o'quv yili yakunlanganda yoki xavfsizlik maqsadida butun tizimdagi (Foydalanuvchilar, Rejalar, Tasdiqlar) o'chib ketish ehtimoliga qarshi barcha kodlar jamlanmasini saqlab qo'yish.
             </p>
             <button 
               onClick={handleDownloadBackup}
               disabled={loading}
               className="mt-4 px-6 py-3 w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
             >
               {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <HardDrive className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />}
               Tizim nusxasini yaratish (Download)
             </button>
           </div>
        </div>

        {/* Security Summary Cards */}
        <div className="lg:col-span-2 grid sm:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><ShieldCheck className="w-6 h-6"/></div>
            <div>
              <p className="font-extrabold text-blue-900 text-xl tracking-tight">Vercel</p>
              <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">Server holati</p>
            </div>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600"><CheckSquare className="w-6 h-6"/></div>
            <div>
              <p className="font-extrabold text-emerald-900 text-xl tracking-tight">Avtomatik</p>
              <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Bazani tozalash</p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100 text-slate-600"><DownloadCloud className="w-6 h-6"/></div>
            <div>
              <p className="font-extrabold text-slate-800 text-xl tracking-tight">JSON Dump</p>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Zaxira tili</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
