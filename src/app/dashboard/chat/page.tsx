"use client";

import { useState, useEffect } from "react";
import { Send, User as UserIcon, MessageSquare, Loader2 } from "lucide-react";

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeContact, setActiveContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

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
      fetchMessages();
      // Short Polling
      interval = setInterval(() => {
         fetchMessages(false);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeContact]);

  const fetchContacts = async (u: any) => {
    try {
      const res = await fetch(`/api/chat/users?userId=${u.id}&role=${u.role}`);
      const data = await res.json();
      setContacts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchMessages = async (showLoad = true) => {
    if (!activeContact || !user) return;
    if (showLoad) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/chat/messages?userId=${user.id}&contactId=${activeContact.id}`);
      const data = await res.json();
      setMessages(data);
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoad) setLoadingMessages(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeContact || !user) return;
    
    // Optimistic UI update
    const newMsg = { id: Date.now().toString(), senderId: user.id, receiverId: activeContact.id, text, createdAt: new Date() };
    setMessages([...messages, newMsg]);
    setText("");

    try {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: user.id, receiverId: activeContact.id, text })
      });
      fetchMessages(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    const chatContainer = document.getElementById("chat-messages-container");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-[80vh] min-h-[600px] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
      {/* Sidebar Contacts */}
      <div className="w-full md:w-80 border-r border-slate-100 bg-slate-50 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500" /> Aloqa
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingContacts ? (
             <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-500"/></div>
          ) : contacts.map(c => (
            <button 
              key={c.id} 
              onClick={() => setActiveContact(c)}
              className={`w-full text-left p-4 border-b border-slate-100 hover:bg-indigo-50 transition-colors flex items-center gap-3 ${activeContact?.id === c.id ? 'bg-indigo-50' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden border border-indigo-200">
                {c.avatarUrl ? <img src={c.avatarUrl} className="w-full h-full object-cover"/> : <UserIcon className="w-5 h-5 text-indigo-500" />}
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-slate-800 truncate">{c.name}</div>
                <div className="text-[10px] text-slate-500 truncate uppercase mt-0.5">{c.role} {c.department ? `- ${c.department}` : ''}</div>
              </div>
            </button>
          ))}
          {!loadingContacts && contacts.length === 0 && (
             <div className="p-6 text-center text-sm text-slate-400">Hech qanday kontakt topilmadi.</div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-slate-50 flex flex-col relative min-w-0">
        {!activeContact ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center p-8">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20 text-indigo-500" />
            <h3 className="text-xl font-bold text-slate-700 mb-1">Jonli Xabarlar</h3>
            <p className="text-sm">Muloqotni boshlash uchun chap tomondan kontaktni tanlang.</p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col bg-white">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 bg-white flex items-center gap-3 shadow-[0_4px_20px_-15px_rgba(0,0,0,0.1)] z-10">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden border border-indigo-100">
                {activeContact.avatarUrl ? <img src={activeContact.avatarUrl} className="w-full h-full object-cover"/> : <UserIcon className="w-5 h-5 text-indigo-500" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{activeContact.name}</h3>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                   <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span> Online (Polling)
                </p>
              </div>
            </div>

            {/* Chat Messages */}
            <div id="chat-messages-container" className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/80">
              {loadingMessages ? (
                <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-indigo-500"/></div>
              ) : messages.length === 0 ? (
                 <div className="h-full flex items-center justify-center text-sm text-slate-400">Hozircha xabarlar yo'q. Birinchi bo'lib yozing!</div>
              ) : messages.map((m: any, idx: number) => {
                 const isMe = m.senderId === user?.id;
                 return (
                   <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                       <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                       <span className={`text-[10px] block mt-1.5 font-medium text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                         {new Date(m.createdAt).toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'})}
                       </span>
                     </div>
                   </div>
                 );
              })}
            </div>

            {/* Input Form */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Xabaringizni yozing..." 
                  className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all shadow-inner"
                />
                <button type="submit" disabled={!text.trim()} className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shrink-0">
                  <Send className="w-5 h-5 -ml-1" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
