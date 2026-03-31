"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Map, Users, CheckSquare, X, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const storedUser = localStorage.getItem("user");
        let url = `/api/search?q=${encodeURIComponent(query)}`;
        if (storedUser) {
          const u = JSON.parse(storedUser);
          url += `&userId=${u.id}&role=${u.role}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        setResults(data.results || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100/50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-500 transition-colors w-64"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm font-medium flex-1 text-left">Qidirish...</span>
        <kbd className="hidden sm:inline-block px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-400">Ctrl K</kbd>
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh] px-4" onClick={() => setIsOpen(false)}>
        <div 
          className="bg-white rounded-xl shadow-sm w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center px-4 py-3 border-b border-slate-100">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Foydalanuvchi, Reja yoki Vazifa izlang..."
              className="flex-1 bg-transparent px-4 py-2 outline-none text-slate-900 placeholder:text-slate-400"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {loading ? (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
            ) : (
              <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors shrink-0">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 p-2">
            {query.trim().length === 0 && (
              <div className="px-4 py-12 text-center text-slate-500">
                 <p className="text-sm">Nimadir qidirishni boshlang...</p>
              </div>
            )}
            
            {query.trim().length >= 2 && results.length === 0 && !loading && (
              <div className="px-4 py-10 text-center text-slate-500">
                 <p className="text-sm">Hech narsa topilmadi</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-1 pb-2">
                <h3 className="px-3 md:px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Natijalar</h3>
                {results.map((res, i) => (
                  <button 
                    key={res.type + res.id} 
                    onClick={() => {
                      setIsOpen(false);
                      router.push(`${res.link}?search=${encodeURIComponent(res.title)}`);
                    }}
                    className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 text-left transition-colors group"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${res.type === 'USER' ? 'bg-blue-100 text-blue-600' : res.type === 'PLAN' ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-600'}`}>
                      {res.type === 'USER' ? <Users className="w-4 h-4" /> : res.type === 'PLAN' ? <Map className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold text-sm text-slate-900 group-hover:text-blue-700 truncate">{res.title}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{res.subtitle}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t border-slate-100 bg-slate-50/50 p-3 flex items-center justify-between text-[11px] text-slate-400 font-medium">
             <span>Tizim bo'ylab tezkor qidiruv</span>
             <span className="hidden sm:inline-block">Yopish uchun <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] mx-1">ESC</kbd> bosing</span>
          </div>
        </div>
      </div>
    </>
  );
}
