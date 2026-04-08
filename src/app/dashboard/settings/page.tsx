"use client";

import { useState, useEffect } from "react";
import { Settings, DownloadCloud, AlertTriangle, ShieldCheck, Database, HardDrive, RefreshCcw, CheckSquare, MessageSquare, Send, Calendar, Lock } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Real database states
  const [maintenance, setMaintenance] = useState(false);
  const [broadcastActive, setBroadcastActive] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [lockStructure, setLockStructure] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
         if (data && !data.error) {
           setMaintenance(data.maintenanceMode);
           setBroadcastActive(data.broadcastActive);
           setBroadcastMessage(data.broadcastMessage || "");
           if (data.academicYear) setAcademicYear(data.academicYear);
           if (data.lockStructure !== undefined) setLockStructure(data.lockStructure);
         }
      })
      .catch(console.error);
  }, []);

  const handleSaveSettings = async (updates: any) => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenanceMode: maintenance,
          broadcastActive: broadcastActive,
          broadcastMessage: broadcastMessage,
          academicYear: academicYear,
          lockStructure: lockStructure,
          ...updates
        })
      });
      if (!res.ok) throw new Error("Saqlashda xatolik");
      return true;
    } catch (e: any) {
      toast.error(e.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleMaintenanceToggle = async () => {
    if (saving) return; // Prevent spam
    const newState = !maintenance;
    setMaintenance(newState);
    const success = await handleSaveSettings({ maintenanceMode: newState });
    if (success) {
      toast.success(newState ? "Tizim Texnik xizmat ko'rsatish rejimiga o'tkazildi!" : "Tizim barqaror holatga qaytdi");
    } else {
      setMaintenance(!newState); // revert
    }
  };

  const handleBroadcastToggle = async () => {
    if (saving) return;
    const newState = !broadcastActive;
    setBroadcastActive(newState);
    const success = await handleSaveSettings({ broadcastActive: newState });
    if (success) {
      toast.success(newState ? "Ommaviy e'lon faollashdi!" : "Ommaviy e'lon o'chirildi");
    } else {
      setBroadcastActive(!newState);
    }
  };

  const handleLockToggle = async () => {
    if (saving) return;
    const newState = !lockStructure;
    setLockStructure(newState);
    const success = await handleSaveSettings({ lockStructure: newState });
    if (success) {
      toast.success(newState ? "Tizim Strukturasi Qulflab qo'yildi!" : "Struktura blokirovka qulfdan yechildi");
    } else {
      setLockStructure(!newState);
    }
  };

  const handleSaveAcademicYear = async () => {
    const success = await handleSaveSettings({ academicYear });
    if (success) toast.success("Standart O'quv yili saqlandi!");
  };

  const handleSaveMessage = async () => {
    const success = await handleSaveSettings({ broadcastMessage });
    if (success) toast.success("E'lon matni saqlandi!");
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

        {/* System Broadcast Blok */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
             <MessageSquare className="w-5 h-5 text-red-500" />
             <h3 className="font-bold text-slate-900">Ommaviy Qizil E'lon (Broadcast)</h3>
           </div>
           <div className="p-6 space-y-4">
             <p className="text-sm text-slate-600">
               Joriy qilingan xabar tizimdagi barcha xodimlarning ekranining eng yuqorisida qip-qizil banner bo'lib chiquvchi ommaviy signaldik namoyish qilinadi.
             </p>
             <div className="flex flex-col gap-3">
               <textarea 
                 value={broadcastMessage}
                 onChange={e => setBroadcastMessage(e.target.value)}
                 rows={2}
                 placeholder="Barcha dekanlar diqqatiga: Soat 12 dan keyin..."
                 className="w-full text-sm bg-white border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#309F4C] transition-all resize-none"
               />
               <button onClick={handleSaveMessage} disabled={saving} className="bg-[#309F4C] hover:bg-[#25823c] text-white font-bold px-5 py-2.5 rounded-xl shadow-sm shadow-emerald-600/20 text-sm transition-colors self-end flex items-center gap-2">
                  <Send className="w-4 h-4"/> Matnni Saqlash
               </button>
             </div>
             <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
               <div className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${broadcastActive ? 'bg-red-500' : 'bg-slate-200'}`} onClick={handleBroadcastToggle}>
                 <div className={`bg-white w-6 h-6 rounded-full shadow-sm transform transition-transform ${broadcastActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
               </div>
               <span className={`font-bold text-sm ${broadcastActive ? 'text-red-500' : 'text-slate-400'}`}>
                 {broadcastActive ? "Barchaga Ko'rsatilmoqda" : "O'chirilgan"}
               </span>
             </div>
           </div>
        </div>

        {/* Academic Year Blok */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
             <Calendar className="w-5 h-5 text-indigo-500" />
             <h3 className="font-bold text-slate-900">Standart O'quv Yili Boshqaruvi</h3>
           </div>
           <div className="p-6 space-y-4">
             <p className="text-sm text-slate-600">
               Har yili Dekan/Mudirlar yangi reja yaratganda u avvalambor Global o'quv yiliga bog'lanadi. Yoz oylarida buni kelasi yilga yangilab qo'ying.
             </p>
             <div className="flex flex-col gap-3">
               <input 
                 value={academicYear}
                 onChange={e => setAcademicYear(e.target.value)}
                 placeholder="Masalan: 2026-2027"
                 className="w-full text-base font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center"
               />
               <button onClick={handleSaveAcademicYear} disabled={saving} className="bg-[#309F4C] hover:bg-[#25823c] text-white font-bold px-5 py-2.5 rounded-xl shadow-sm shadow-emerald-600/20 text-sm transition-colors w-full flex items-center justify-center gap-2">
                  <CheckSquare className="w-4 h-4"/> Yilni Tasdiqlash
               </button>
             </div>
           </div>
        </div>

        {/* Structure Lock Blok */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
             <Lock className="w-5 h-5 text-orange-500" />
             <h3 className="font-bold text-slate-900">Enterprise Tizim Olib qochishiga (Qulflash)</h3>
           </div>
           <div className="p-6 space-y-4">
             <p className="text-sm text-slate-600">
               G'arazli hujumlar yoki bilmasdan nimanidir o'chirib yuborishdan mudofaa qiling. "Qulflash" yoqilganda hech bir kafedra yoki fakultet yaratilishi va o'chib ketishiga yo'l qo'yilmaydi.
             </p>
             <div className="flex items-center gap-4 pt-2">
               <div className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${lockStructure ? 'bg-orange-500' : 'bg-slate-200'}`} onClick={handleLockToggle}>
                 <div className={`bg-white w-6 h-6 rounded-full shadow-sm transform transition-transform ${lockStructure ? 'translate-x-6' : 'translate-x-0'}`}></div>
               </div>
               <span className={`font-bold text-sm ${lockStructure ? 'text-orange-500' : 'text-slate-400'}`}>
                 {lockStructure ? "QULFLANGAN (Fakultet va Kafedra maxfiy saqlanmoqda)" : "Ochiq arxitektura (O'zgartirishlar faol)"}
               </span>
             </div>
           </div>
        </div>

        {/* Database Backup */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
             <Database className="w-5 h-5 text-blue-500" />
             <h3 className="font-bold text-slate-900">Ma'lumotlar arxivini yuklash (Backup)</h3>
           </div>
           <div className="p-6 space-y-4">
             <p className="text-sm text-slate-600">
               Joriy o'quv yili yakunlanganda yoki xavfsizlik maqsadida butun tizimdagi ma'lumotlar jamlanmasini saqlab qo'yish (JSON Local File).
             </p>
             <button 
               onClick={handleDownloadBackup}
               disabled={loading}
               className="mt-4 px-6 py-3 w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
             >
               {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <HardDrive className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />}
               Tizim nusxasini yaratish
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
