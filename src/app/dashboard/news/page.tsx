"use client";

import { useEffect, useState } from "react";
import { Megaphone, Search } from "lucide-react";

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news?limit=100");
      const data = await res.json();
      if (Array.isArray(data)) setNews(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter(n => {
    const matchesType = filterType === "ALL" || n.type === filterType;
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-500" /> Barcha yangiliklar
          </h1>
          <p className="text-sm text-slate-500 mt-1">Universitet va ta'lim sohasiga oid barcha xabarlar tarixi.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Yangilik qidirish..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setFilterType("ALL")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filterType === 'ALL' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Barchasi
            </button>
            <button 
              onClick={() => setFilterType("UNIVERSITET")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filterType === 'UNIVERSITET' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Universitet
            </button>
            <button 
              onClick={() => setFilterType("TALIM")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filterType === 'TALIM' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Ta'lim
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-xl"></div>)}
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-12 text-slate-500">Hech qanday yangilik topilmadi.</div>
          ) : (
            <div className="space-y-4">
              {filteredNews.map(n => (
                <div key={n.id} className="p-5 bg-slate-50 border border-slate-100 rounded-xl relative hover:border-blue-200 transition-colors">
                  <span className={`absolute top-5 right-5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${n.type === 'UNIVERSITET' ? 'bg-blue-100 text-blue-700' : 'bg-blue-100 text-blue-700'}`}>
                    {n.type}
                  </span>
                  <h3 className="font-bold text-lg text-slate-900 pr-24 leading-tight">{n.title}</h3>
                  <p className="text-slate-600 mt-3 whitespace-pre-wrap">{n.content}</p>
                  <div className="mt-4 pt-4 border-t border-slate-200/60 text-xs text-slate-500 font-medium flex items-center gap-2">
                    <span className="bg-white px-2 py-1 rounded border border-slate-100 shadow-sm">Muallif: {n.author?.name || "Noma'lum"}</span>
                    <span>&bull;</span>
                    <span>{new Date(n.createdAt).toLocaleString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
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
