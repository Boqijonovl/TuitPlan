"use client";

import { useState, useEffect } from "react";
import { User, Lock, Mail, Shield, Save, Camera, Upload } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setName(parsed.name || "");
      setAvatarUrl(parsed.avatarUrl || "");
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setMessage({ text: "", type: "" });

    try {
      let finalAvatarUrl = avatarUrl;
      
      // Upload new avatar if selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        
        try {
          const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            finalAvatarUrl = uploadData.fileUrl;
            setAvatarUrl(finalAvatarUrl);
          }
        } catch (e) {
          console.error("Avatar yuklanmadi", e);
        }
      }

      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password: password ? password : undefined, avatarUrl: finalAvatarUrl })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ text: "Profil muvaffaqiyatli saqlandi", type: "success" });
        const updatedUser = { ...user, name: data.name, avatarUrl: finalAvatarUrl };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setPassword(""); // clear password field
        setAvatarFile(null); // clear file
      } else {
        setMessage({ text: data.error || "Xatolik yuz berdi", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Tarmoq xatosi", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return <div>Profil yuklanmoqda...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Akkaunt sozlamalari</h1>
        <p className="text-sm text-slate-500 mt-1">Shaxsiy ma'lumotlaringizni va parolingizni o'zgartirishingiz mumkin.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6">
          
          {message.text && (
            <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="w-5 h-5 text-blue-500" />
              Asosiy ma'lumotlar
            </h3>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar Uploader UI */}
              <div className="flex flex-col items-center gap-3 shrink-0 mx-auto md:mx-0">
                <div className="relative group cursor-pointer">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 shadow-sm bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-4xl">
                    {avatarFile ? (
                      <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="w-full h-full object-cover" />
                    ) : avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <>{name.charAt(0).toUpperCase()}</>
                    )}
                  </div>
                  <label className="absolute inset-0 bg-slate-900/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer backdrop-blur-[2px]">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">O'zgartirish</span>
                    <input 
                      type="file" className="hidden" accept="image/*"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setAvatarFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
                {avatarFile && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Yangi rasm tanlandi</span>}
              </div>

              <div className="grid gap-4 w-full md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">To'liq ism</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Mail className="w-3.5 h-3.5"/> Email (O'zgartirib bo'lmaydi)</label>
                <input 
                  type="text" 
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Shield className="w-3.5 h-3.5"/> Rol</label>
                <input 
                  type="text" 
                  value={user.role}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl cursor-not-allowed uppercase text-sm font-bold tracking-wider"
                />
              </div>
            </div>
          </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Lock className="w-5 h-5 text-blue-500" />
              Xavfsizlik
            </h3>
            
            <div className="max-w-md">
              <label className="block text-sm font-medium text-slate-700 mb-1">Yangi parol</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Bo'sh qoldirsangiz, o'zgarmaydi"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={isSaving}
              className="bg-blue-600 py-2.5 px-6 rounded-xl hover:bg-blue-700 text-white font-medium shadow-sm shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-70"
            >
              <Save className="w-5 h-5" />
              {isSaving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
