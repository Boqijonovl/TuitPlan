"use client";

import { useEffect, useState } from "react";
import { Folder, FileText, Download, Calendar, Search, Filter, Archive } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";

export default function ArchivePage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isZipping, setIsZipping] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchArchive();
  }, []);

  const fetchArchive = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      let url = "/api/tasks"; // We will filter submissions from tasks, or we can use a dedicated api. For now we will fetch all tasks and extract submissions with files.
      if (storedUser) {
        const u = JSON.parse(storedUser);
        url += `?userId=${u.id}&role=${u.role}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      
      const files: any[] = [];
      data.forEach((task: any) => {
        if (task.submissions && task.submissions.length > 0) {
          task.submissions.forEach((sub: any) => {
            if (sub.fileUrl) {
              files.push({
                ...sub,
                taskTitle: task.title,
                planTitle: task.plan?.title || "Umumiy",
                department: task.plan?.department?.name || "Kafedrasiz"
              });
            }
          });
        }
      });
      
      // Sort by newest
      files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSubmissions(files);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = submissions.filter((s: any) => 
    s.taskTitle.toLowerCase().includes(search.toLowerCase()) || 
    (s.user?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleBulkDownload = async () => {
    if (filteredDocs.length === 0) return toast.error("Yuklash uchun fayllar yo'q!");
    setIsZipping(true);
    
    try {
      const zip = new JSZip();
      const folder = zip.folder("TuitPlan_Arxiv");
      
      const promises = filteredDocs.map(async (doc: any, i: number) => {
        if (!doc.fileUrl) return;
        try {
          const res = await fetch(doc.fileUrl);
          const blob = await res.blob();
          
          // Try to safely retrieve the extension from the URL if possible
          const urlParts = doc.fileUrl.split('.');
          let ext = urlParts.length > 1 ? urlParts.pop() : "unknown";
          if (ext?.includes('?')) ext = ext.split('?')[0]; // strip query params
          
          // Generate safe filename
          const cleanName = (doc.user?.name || "Xodim").replace(/[^a-z0-9]/gi, '_');
          const cleanTask = doc.taskTitle.slice(0, 20).replace(/[^a-z0-9]/gi, '_');
          const filename = `${cleanName}_${cleanTask}_${i}.${ext}`;
          
          folder?.file(filename, blob);
        } catch (e) {
          console.error("Fayl topilmadi:", doc.fileUrl);
        }
      });
      
      await Promise.all(promises);
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `Fakultet_Arxivi_${new Date().getTime()}.zip`);
      toast.success("Arxiv muvaffaqiyatli yuklandi!");
    } catch (e) {
      toast.error("ZIP yaratishda xatolik yuz berdi");
    } finally {
      setIsZipping(false);
    }
  };

  if (user?.role === "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <h2 className="text-2xl font-bold text-slate-800">Ruxsat etilmagan sahifa</h2>
        <p className="text-slate-500 mt-2">Bosh admin xodimlarning fayllar arhivini bevosita ko'ra olmaydi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Folder className="w-7 h-7 text-indigo-500" /> Fakultet Hujjatlar Arxivi
          </h1>
          <p className="text-sm text-slate-500 mt-1">Barcha xodimlar tomonidan tizimga yuklangan hisobot fayllari yagona bazasi.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-sm shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Fayl yoki xodim nomi orqali qidirish..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              Jami hujjatlar: {filteredDocs.length} ta
            </span>
            <button 
              onClick={handleBulkDownload}
              disabled={isZipping || filteredDocs.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-sm font-bold shadow-md transition-all"
            >
              {isZipping ? (
                 <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
              ) : (
                 <Archive className="w-4 h-4" />
              )}
              {isZipping ? "ZIP Yaratilmoqda..." : "Barchasini ZIP yuklash"}
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
               {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
             </div>
          ) : filteredDocs.length === 0 ? (
             <div className="py-20 text-center">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                 <FileText className="w-8 h-8" />
               </div>
               <h3 className="text-lg font-medium text-slate-900">Fayllar topilmadi</h3>
               <p className="text-slate-500 mt-1">Hozircha tizimga hech qanday hujjat yuklanmagan.</p>
             </div>
          ) : (
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
               {filteredDocs.map((doc: any, idx: number) => (
                 <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group flex flex-col justify-between">
                   <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                       <FileText className="w-6 h-6" />
                     </div>
                     <div className="flex-1 overflow-hidden">
                       <h4 className="font-semibold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors" title={doc.taskTitle}>
                         {doc.taskTitle}
                       </h4>
                       <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                         <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {doc.user?.name || "Noma'lum"}
                       </p>
                     </div>
                   </div>
                   
                   <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                     <div className="text-[10px] text-slate-400 font-medium">
                       <Calendar className="w-3 h-3 inline mr-1" />
                       {new Date(doc.createdAt).toLocaleDateString("uz-UZ")}
                     </div>
                     <a href={doc.fileUrl} download target="_blank" className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                       <Download className="w-3.5 h-3.5" /> Yuklab olish
                     </a>
                   </div>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
