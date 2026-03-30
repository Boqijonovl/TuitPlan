"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User as UserIcon, MessageSquare, Loader2, Paperclip, MoreVertical, Edit2, Trash2, X, File as FileIcon, FileText, Image as ImageIcon, ArrowLeft, Search } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@supabase/supabase-js";

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeContact, setActiveContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  
  const [text, setText] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // File & Edit states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Search logic
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      fetchContacts(u);
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (activeContact && user) {
      fetchMessages().then((success) => {
         if (success !== false) {
           interval = setInterval(async () => {
             const ok = await fetchMessages(false);
             if (ok === false) clearInterval(interval);
           }, 3000);
         }
      });
    }
    return () => clearInterval(interval);
  }, [activeContact]);

  const fetchContacts = async (u: any) => {
    try {
      const res = await fetch(`/api/chat/users?userId=${u.id}&role=${u.role}`);
      const data = await res.json();
      setContacts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setContacts([]);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchMessages = async (showLoad = true) => {
    if (!activeContact || !user) return;
    if (showLoad) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/chat/messages?userId=${user.id}&contactId=${activeContact.id}`);
      if (!res.ok) return false;
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      if (showLoad) setLoadingMessages(false);
    }
  };

  const handleUploadAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !selectedFile) || !activeContact || !user) return;
    
    if (editingMessage) {
      await saveEdit();
      return;
    }

    setUploading(true);
    let finalFileUrl = null;
    let fileType = null;
    let fileName = null;

    try {
      // 1. Upload File (Direct to Supabase bypassing Vercel 4.5MB API limits)
      if (selectedFile) {
        toast.loading("Fayl serverga yozib olinmoqda...", { id: "attach" });
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tzlzxxaskazzvtzetvbk.supabase.co";
        // To'g'ridan-to'g'ri cloud'ga ulanish
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "sb_publishable_WpnUu0-1kHxN3jD-BFs8jw_gXfPzvd_";
        const supabase = createClient(supabaseUrl, supabaseKey);

        const safeName = selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const filename = `${Date.now()}-${safeName}`;

        const { data: uploadData, error } = await supabase.storage
          .from('uploads')
          .upload(filename, selectedFile, {
            upsert: false
          });

        if (error) {
           toast.dismiss("attach");
           throw new Error("Cloud uzatish xatosi: " + error.message);
        }

        const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(filename);
        
        toast.dismiss("attach");
        finalFileUrl = publicUrl;
        fileType = selectedFile.type;
        fileName = selectedFile.name;
      }

      // 2. Send Message
      const newMsgObj = { 
         senderId: user.id, 
         receiverId: activeContact.id, 
         text: text.trim(),
         fileUrl: finalFileUrl,
         fileType,
         fileName
      };

      // Optimistic locally
      setMessages([...messages, { id: Date.now().toString(), ...newMsgObj, createdAt: new Date() }]);
      setText("");
      setSelectedFile(null);

      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsgObj)
      });
      
      if (!res.ok) {
         toast.error("Xabar jo'natilmadi (Ba'za ulanmagan yoki xato)");
      } else {
         fetchMessages(false);
      }
    } catch (e) {
      console.error(e);
      toast.error("Xatolik yuz berdi!");
    } finally {
      setUploading(false);
    }
  };

  const saveEdit = async () => {
    if (!editingMessage) return;
    if (!text.trim() && !editingMessage.fileUrl) return; // Yozuv ham, fayl ham yo'q bo'lishi mumkin emas
    
    // Optimistic Edit
    setMessages(messages.map(m => m.id === editingMessage.id ? { 
      ...m, 
      text, 
      isEdited: true,
      fileUrl: editingMessage.removeFile ? null : m.fileUrl,
      fileName: editingMessage.removeFile ? null : m.fileName,
      fileType: editingMessage.removeFile ? null : m.fileType
    } : m));
    
    const removingFile = editingMessage.removeFile;
    setText("");
    setEditingMessage(null);

    try {
      await fetch("/api/chat/messages", {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ id: editingMessage.id, action: "EDIT", text, removeFile: removingFile })
      });
      fetchMessages(false);
    } catch (e) {
      toast.error("Tahrirlashda xatolik");
    }
  };

  const handleDelete = async (id: string) => {
    // Optimistic Delete
    setMessages(messages.map(m => m.id === id ? { ...m, isDeleted: true } : m));
    setActiveDropdown(null);

    try {
      await fetch("/api/chat/messages", {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ id, action: "DELETE" })
      });
      fetchMessages(false);
    } catch (e) {
      toast.error("O'chirishda xatolik");
    }
  };

  // Utilities
  const isOnline = (lastSeen: string | null) => {
     if (!lastSeen) return false;
     return (Date.now() - new Date(lastSeen).getTime()) < 60000; // 60 sek real-vaqt
  };

  useEffect(() => {
    const chatContainer = document.getElementById("chat-messages-container");
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
  }, [messages]);

  return (
    <div className="h-[80vh] min-h-[600px] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
      {/* Sidebar Contacts */}
      <div className={`w-full md:w-80 border-r border-slate-100 bg-slate-50 flex-col shrink-0 ${activeContact ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="font-bold text-slate-800 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-indigo-500" /> Xodimlar (Chat)</span>
          </h2>
          <div className="relative mt-3 group">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Qidirish... (Ctrl+K)" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingContacts ? (
             <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-500"/></div>
          ) : contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => {
            const online = isOnline(c.lastSeen);
            return (
            <button 
              key={c.id} 
              onClick={() => { setActiveContact(c); setEditingMessage(null); setText(""); setSelectedFile(null); }}
              className={`w-full text-left p-4 border-b border-slate-100 hover:bg-indigo-50 transition-colors flex items-center gap-3 ${activeContact?.id === c.id ? 'bg-indigo-50' : ''}`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden border border-indigo-200">
                  {c.avatarUrl ? <img src={c.avatarUrl} className="w-full h-full object-cover"/> : <UserIcon className="w-5 h-5 text-indigo-500" />}
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${online ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
              </div>
              <div className="overflow-hidden flex-1">
                <div className="font-bold text-slate-800 truncate leading-tight">{c.name}</div>
                <div className="text-[10px] text-slate-500 truncate uppercase mt-0.5">
                  {c.role === "ADMIN" ? "Admnistrator" : c.role === "DEAN" ? "Dekan" : c.role === "HOD" ? "Mudir" : "O'qituvchi"} {c.department ? `- ${c.department}` : ''}
                </div>
              </div>
            </button>
          )})}
          {!loadingContacts && contacts.length === 0 && (
             <div className="p-6 text-center text-sm text-slate-400">Hech qanday kontakt topilmadi.</div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 bg-slate-50 flex-col relative min-w-0 ${!activeContact ? 'hidden md:flex' : 'flex'}`} onClick={() => setActiveDropdown(null)}>
        {!activeContact ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center p-8">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20 text-indigo-500" />
            <h3 className="text-xl font-bold text-slate-700 mb-1">Xavfsiz Birlashtirilgan Chat</h3>
            <p className="text-sm">Xodimlar bilan xabarlar va hujjatlar almashish uchun kontaktni tanlang.</p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col bg-white">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between shadow-[0_4px_20px_-15px_rgba(0,0,0,0.1)] z-10 shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveContact(null)} className="md:hidden p-1.5 -ml-1.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden border border-indigo-100">
                  {activeContact.avatarUrl ? <img src={activeContact.avatarUrl} className="w-full h-full object-cover"/> : <UserIcon className="w-5 h-5 text-indigo-500" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{activeContact.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${isOnline(activeContact.lastSeen) ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {isOnline(activeContact.lastSeen) ? 
                         <span className="text-emerald-500">Tarmoqda</span> : 
                         <span className="text-slate-400">Offline {activeContact.lastSeen ? `(${new Date(activeContact.lastSeen).toLocaleTimeString('uz-UZ', {hour:'2-digit', minute:'2-digit'})})` : ''}</span>
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div id="chat-messages-container" className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/80">
              {loadingMessages ? (
                <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-indigo-500"/></div>
              ) : messages.length === 0 ? (
                 <div className="h-full flex items-center justify-center text-sm text-slate-400">Hozircha xabarlar yo'q. Birinchi bo'lib yozing!</div>
              ) : messages.map((m: any) => {
                 if (m.isDeleted) return null; // Soft delete qilingan xabarni ko'rsatmaslik

                 const isMe = m.senderId === user?.id;
                 return (
                   <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative`}>
                     <div className={`max-w-[80%] md:max-w-[65%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                       
                       {/* Xabar Matni */}
                       {m.text && <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>}
                       
                       {/* Fayl Biriktirilgan bo'lsa */}
                       {m.fileUrl && (
                         <div className={`mt-2 mb-1 p-2 rounded-xl border flex items-center gap-3 ${isMe ? 'bg-indigo-700 border-indigo-500' : 'bg-slate-50 border-slate-200'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isMe ? 'bg-indigo-500' : 'bg-slate-200'}`}>
                               {String(m.fileType).includes('image') ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            </div>
                            <div className="overflow-hidden flex-1">
                               <a href={m.fileUrl} target="_blank" className={`truncate block text-xs font-semibold hover:underline ${isMe ? 'text-indigo-100' : 'text-indigo-600'}`}>{m.fileName || "Fayl"}</a>
                               <span className={`text-[9px] ${isMe ? 'text-indigo-300' : 'text-slate-400'}`}>Biriktirilgan hujjat</span>
                            </div>
                         </div>
                       )}

                        {/* Vaqt va Edit status */}
                       <div className={`flex items-center justify-end gap-1.5 mt-1.5 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                         {m.isEdited && <span className="text-[9px] italic">Tahrirlangan</span>}
                         <span className="text-[10px] font-medium block">
                           {new Date(m.createdAt).toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'})}
                         </span>
                         
                         {/* 3 nuqtali Edit/Delete menyusi (Xabar ichiga ko'chirdik) */}
                         {isMe && !m.isDeleted && (
                           <div className="relative ml-1 flex items-center">
                              <button 
                                 onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === m.id ? null : m.id); }}
                                 className={`p-1 rounded-full transition-colors ${isMe ? 'hover:bg-indigo-500 text-indigo-100' : 'hover:bg-slate-200 text-slate-400'}`}
                              >
                                 <MoreVertical className="w-4 h-4" />
                              </button>
                              {activeDropdown === m.id && (
                                 <div className="absolute right-0 bottom-6 w-32 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden z-20 py-1" onClick={e => e.stopPropagation()}>
                                    <button 
                                      onClick={() => { setEditingMessage(m); setText(m.text || ""); setActiveDropdown(null); }}
                                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-2"
                                    >
                                       <Edit2 className="w-3.5 h-3.5" /> Tahrirlash
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(m.id)}
                                      className="w-full text-left px-3 py-2 hover:bg-red-50 text-xs font-medium text-red-600 flex items-center gap-2"
                                    >
                                       <Trash2 className="w-3.5 h-3.5" /> O'chirish
                                    </button>
                                 </div>
                              )}
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                 );
              })}
            </div>

            {/* Editing UI Indicator */}
            {editingMessage && (
               <div className="w-full bg-amber-50 border-t border-amber-100 flex flex-col">
                  <div className="px-4 py-2 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-amber-700 text-xs">
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Xabarni tahrirlash: <span className="font-semibold">{editingMessage.text?.substring(0,20) || "Fayl biriktirma"}...</span></span>
                     </div>
                     <button onClick={() => {setEditingMessage(null); setText("");}} className="p-1 hover:bg-amber-100 rounded-full text-amber-500">
                        <X className="w-4 h-4" />
                     </button>
                  </div>
                  {/* Agar xabarda fayl bo'lsa va hali o'chirilmagan bo'lsa */}
                  {editingMessage.fileUrl && !editingMessage.removeFile && (
                     <div className="px-4 py-1.5 bg-amber-100/50 flex items-center justify-between text-xs text-amber-800 border-t border-amber-100/50">
                        <span className="truncate max-w-[200px] flex items-center gap-1"><FileIcon className="w-3 h-3"/> {editingMessage.fileName || "Biriktirilgan fayl"}</span>
                        <button 
                          type="button"
                          onClick={() => setEditingMessage({...editingMessage, removeFile: true})} 
                          className="text-red-500 hover:underline flex items-center gap-1 font-medium bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-md transition-colors"
                        >
                           <Trash2 className="w-3 h-3" /> Rekvizitni uzish (Faylni o'chirish)
                        </button>
                     </div>
                  )}
               </div>
            )}

            {/* Selected File UI Indicator */}
            {selectedFile && !editingMessage && (
               <div className="w-full bg-indigo-50 border-t border-indigo-100 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-700 text-xs">
                     <FileIcon className="w-3.5 h-3.5" />
                     <span className="font-semibold truncate max-w-[200px]">{selectedFile.name}</span>
                     <span className="text-indigo-400">({Math.round(selectedFile.size / 1024)} KB)</span>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-indigo-100 rounded-full text-indigo-500">
                     <X className="w-4 h-4" />
                  </button>
               </div>
            )}

            {/* Input Form */}
            <div className="p-3 bg-white border-t border-slate-200">
              <form onSubmit={handleUploadAndSend} className="flex items-end gap-2">
                
                {/* File Input Trigger */}
                {!editingMessage && (
                  <>
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                    />
                    <button 
                       type="button"
                       onClick={() => fileInputRef.current?.click()}
                       className="w-12 h-12 shrink-0 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-slate-100 transition-colors border border-slate-200 hover:text-indigo-600"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                  </>
                )}

                <textarea 
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleUploadAndSend(e as any);
                     }
                  }}
                  placeholder={editingMessage ? "Yangi matnni kiriting..." : "Xabaringizni yozing... (Enter yuborish)"} 
                  className="flex-1 px-5 py-3.5 min-h-[48px] max-h-[120px] bg-slate-50 border border-slate-200 rounded-2xl md:rounded-full focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all shadow-inner resize-none"
                  rows={1}
                />

                <button 
                  type="submit" 
                  disabled={(!text.trim() && !selectedFile) || uploading} 
                  className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shrink-0 shadow-md shadow-indigo-600/20"
                >
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 -ml-0.5" />}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
