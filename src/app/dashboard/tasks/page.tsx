"use client";

import { useState, useEffect } from "react";
import { CheckSquare, Clock, AlertCircle, Search, MessageSquare, Send, X, FileUp, Paperclip, Check, Shield, Calendar, CheckCircle2, PlayCircle, User, FileText, Upload, LayoutList, LayoutGrid } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL"); 
  const [viewMode, setViewMode] = useState<"LIST" | "BOARD">("BOARD");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const limit = 10;

  // Comments state
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  // Modal states
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    
    // Removed search param handling as per instruction, assuming it's replaced by filter
    
    fetchTasks(1, false);
  }, []);

  const fetchTasks = async (pageNum = 1, append = false) => {
    if (!append) setLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      let url = `/api/tasks?page=${pageNum}&limit=${limit}`;
      if (storedUser) {
        const u = JSON.parse(storedUser);
        url += `&userId=${u.id}&role=${u.role}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.data) {
         setTasks(prev => append ? [...prev, ...data.data] : data.data);
         setHasMore(data.meta.hasMore);
      } else {
         // fallback if it returned flat array for some reason
         setTasks(data);
         setHasMore(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchTasks(next, true);
  };

  const handleStartTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "JARAYONDA", userId: user?.id })
      });
      if (res.ok) {
        toast.success("Vazifa jarayoni boshlandi!");
        fetchTasks(1, false);
      }
    } catch (error: any) {
      toast.error(error.message || "Xatolik yuz berdi");
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !user) return;
    setSubmitting(true);

    try {
      let fileUrl = null;
      
      // Upload file if selected
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });
        
        if (!uploadRes.ok) throw new Error("Fayl yuklashda xatolik");
        const uploadData = await uploadRes.json();
        fileUrl = uploadData.fileUrl;
      }

      // Create TaskSubmission
      const res = await fetch(`/api/tasks/${selectedTask.id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user.id,
          note: note,
          fileUrl: fileUrl 
        })
      });

      if (res.ok) {
        setSelectedTask(null);
        setNote("");
        setFile(null);
        toast.success("Hisobot muvaffaqiyatli saqlandi!");
        fetchTasks(1, false);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Saqlashda xatolik yuz berdi.");
      }
    } catch (err: any) {
      toast.error(err.message || "Tizimda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleComments = (taskId: string) => {
    setShowComments(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handlePostComment = async (taskId: string) => {
    const text = commentText[taskId];
    if (!text || !text.trim() || !user) return;
    
    setSubmittingComment(prev => ({ ...prev, [taskId]: true }));
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, userId: user.id })
      });
      if (res.ok) {
        setCommentText(prev => ({ ...prev, [taskId]: "" }));
        fetchTasks(1, false);
      } else {
        toast.error("Xabarni yuborishda xatolik yuz berdi");
      }
    } catch (err: any) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setSubmittingComment(prev => ({ ...prev, [taskId]: false }));
    }
  };

  // Filter qilish
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title?.toLowerCase().includes(search.toLowerCase()) || 
                          t.plan?.title?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === "BAJARILGAN") return t.status === "BAJARILGAN";
    if (filter === "BAJARILMAGAN") return t.status !== "BAJARILGAN";
    return true;
  });

  if (!user) return null;
  
  if (loading) return (
    <div className="space-y-6">
       <Skeleton className="h-8 w-48" />
       <div className="flex items-center gap-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-10 w-48" /></div>
       <div className="space-y-4">
         {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
       </div>
    </div>
  );

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    
    // Optimistic UI Update
    setTasks(prev => prev.map(t => t.id === draggableId ? { ...t, status: newStatus } : t));

    try {
      const res = await fetch(`/api/tasks/${draggableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, userId: user?.id })
      });
      if (res.ok) {
        toast.success("Vazifa holati yangilandi");
        // Refetch silently to ensure relations are correct
        fetchTasks(1, false);
      } else {
        const d = await res.json();
        toast.error(d.error || "Ruxsat etilmagan");
        fetchTasks(1, false); // revert optimistic
      }
    } catch (err: any) {
      toast.error("Tarmoq xatosi");
      fetchTasks(1, false); // revert optimistic
    }
  };

  const renderTaskCard = (task: any, draggableProvided?: any) => {
    const isBoard = !!draggableProvided;
    const isForMe = user?.role !== "ADMIN" && (!task.assignedRole || task.assignedRole === "" || task.assignedRole === user?.role);
    const globalStatus = task.status || "BAJARILMAGAN";
    const submissions = task.submissions || [];
    const comments = task.comments || [];
    const hasSubmitted = submissions.some((s: any) => s.userId === user?.id);

    return (
      <div 
        key={task.id} 
        ref={draggableProvided?.innerRef}
        {...draggableProvided?.draggableProps}
        {...draggableProvided?.dragHandleProps}
        style={{
          ...draggableProvided?.draggableProps.style,
        }}
        className={`p-4 rounded-xl border transition-colors flex flex-col gap-4 overflow-hidden ${
          hasSubmitted ? 'bg-blue-50/30 border-blue-100' :
          globalStatus === 'JARAYONDA' ? 'bg-slate-50/30 border-slate-200 shadow-sm' :
          'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
        }`}>
        
        {/* Header */}
        <div className={`flex flex-col items-start justify-between gap-4 ${!isBoard ? 'md:flex-row md:items-center' : ''}`}>
                      <div className="flex gap-3 w-full">
                        <div className="mt-1">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            hasSubmitted ? 'bg-blue-500 border-blue-500 text-white' : 
                            globalStatus === 'JARAYONDA' ? 'border-slate-500' :
                            'border-slate-300'
                          }`}>
                            {hasSubmitted && <CheckSquare className="w-3.5 h-3.5" />}
                            {!hasSubmitted && globalStatus === 'JARAYONDA' && <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-slate-900 mb-1 leading-snug break-words ${isBoard ? 'text-sm' : 'text-base'}`}>{task.title}</h4>
                          <div className={`flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500 font-medium ${isBoard ? 'flex-col items-start gap-1.5' : ''}`}>
                            <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1.5 rounded-md text-slate-600">
                              <Shield className="w-3.5 h-3.5 text-blue-400" />
                              {task.assignedRole ? task.assignedRole : "Hamma uchun"}
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1.5 rounded-md text-slate-700">
                              <Calendar className="w-3.5 h-3.5" />
                              {task.timeframe || "Muddatsiz"}
                            </div>
                            
                            {hasSubmitted && (
                              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-blue-100 text-blue-700">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Siz Bazardiz
                              </div>
                            )}

                            {task.plan?.title && (
                               <div className="flex items-center gap-1 text-slate-400 max-w-xs truncate" title={task.plan.title}>
                                 &bull; {task.plan.title}
                               </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {isForMe && !hasSubmitted ? (
                        <div className={`shrink-0 flex items-center gap-2 w-full pt-3 border-t border-slate-100 ${!isBoard ? 'md:w-auto md:mt-0 md:pt-0 md:border-0' : 'flex-col mt-2'}`}>
                          {(globalStatus === 'NEW' || globalStatus === 'BAJARILMAGAN') && (
                            <button 
                              onClick={() => handleStartTask(task.id)}
                              className={`w-full bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${!isBoard ? 'md:w-auto' : ''}`}
                            >
                              <PlayCircle className="w-4 h-4" /> Ishni Boshlash
                            </button>
                          )}
                          
                          {globalStatus === 'JARAYONDA' && (
                            <button 
                              onClick={() => {
                                setSelectedTask(task);
                                setNote("");
                                setFile(null);
                              }}
                              className={`w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm shadow-blue-500/20 transition-colors flex items-center justify-center gap-2 ${!isBoard ? 'md:w-auto' : ''}`}
                            >
                              <CheckCircle2 className="w-4 h-4" /> Yakunlash
                            </button>
                          )}
                        </div>
                      ) : (
                        !isForMe && <div className={`shrink-0 text-xs text-slate-400 italic bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100 ${isBoard ? 'w-full text-center mt-2' : ''}`}>Sizga biriktirilmagan</div>
                      )}
                    </div>
                    
                    {/* Submissions List */}
                    {submissions.length > 0 && (
                      <div className="mt-2 pl-4 md:pl-10 pt-3 border-t border-slate-100">
                        <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Topshirilgan hisobotlar ({submissions.length})</h5>
                        <div className="space-y-3">
                          {submissions.map((sub: any, i: number) => (
                            <div key={sub.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <User className="w-3.5 h-3.5" />
                                  </div>
                                  {sub.user?.name || "Noma'lum Xodim"}
                                  <span className="text-[10px] text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full ml-2">
                                    {sub.user?.role}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {new Date(sub.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                              
                              {sub.note && (
                                <p className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                                  {sub.note}
                                </p>
                              )}
                              
                              {sub.fileUrl && (
                                <div>
                                  <a href={sub.fileUrl} download target="_blank" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors font-medium text-[11px]">
                                    <FileText className="w-3.5 h-3.5" /> Yuklangan Hujjat
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Discussion Toggle Button */}
                    <div className="mt-2 pt-3 border-t border-slate-100 flex justify-end">
                       <button 
                         onClick={() => toggleComments(task.id)}
                         className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                       >
                         {showComments[task.id] ? "Muhokamani bekitish" : `Muhokama (${comments.length})`}
                       </button>
                    </div>

                    {/* Comments Section */}
                    {showComments[task.id] && (
                      <div className="mt-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Muhokama va Savollar</h5>
                        
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          {comments.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center italic py-2">Hali hech qanday xabar yozilmadi.</p>
                          ) : comments.map((c: any) => {
                            const isMe = c.user?.id === user?.id;
                            return (
                              <div key={c.id} className={`flex gap-3 text-sm ${isMe ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center font-bold text-white ${isMe ? 'bg-blue-500' : 'bg-slate-400'}`}>
                                  {c.user?.name?.charAt(0)}
                                </div>
                                <div className={`max-w-[80%] rounded-xl px-4 py-2.5 ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}>
                                  <div className={`text-[10px] font-bold mb-1 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                                    {c.user?.name}
                                  </div>
                                  <p className="leading-snug break-words">{c.text}</p>
                                  <div className={`text-[9px] text-right mt-1.5 ${isMe ? 'text-blue-300' : 'text-slate-400'}`}>
                                    {new Date(c.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Add Comment Input */}
                        <div className="mt-4 flex gap-2">
                           <input 
                             type="text"
                             value={commentText[task.id] || ""}
                             onChange={(e) => setCommentText(prev => ({ ...prev, [task.id]: e.target.value }))}
                             placeholder="Xabar yozing..."
                             className="flex-1 text-sm bg-white border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                             onKeyDown={(e) => {
                               if (e.key === 'Enter') handlePostComment(task.id);
                             }}
                           />
                           <button 
                             onClick={() => handlePostComment(task.id)}
                             disabled={submittingComment[task.id] || !(commentText[task.id]?.trim())}
                             className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors"
                           >
                             Yuborish
                           </button>
                        </div>
                      </div>
                    )}

                  </div>
    );
  };

  // Filter out ADMIN entirely
  if (user?.role === "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Ruxsat etilmagan sahifa</h2>
        <p className="text-slate-500 mt-2">Bosh admin vazifalar qatoriga aralashmasligi kerak.</p>
      </div>
    );
  }

  const cols = [
    { id: "NEW", title: "Yangi (Bajarilmagan)", items: filteredTasks.filter(t => !t.status || t.status === "NEW" || t.status === "BAJARILMAGAN") },
    { id: "JARAYONDA", title: "Jarayonda", items: filteredTasks.filter(t => t.status === "JARAYONDA") },
    { id: "BAJARILGAN", title: "Bajarilgan", items: filteredTasks.filter(t => t.status === "BAJARILGAN") }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mening vazifalarim</h1>
          <p className="text-sm text-slate-500 mt-1">Rejalarga kiritilgan va bajarilishi kutilayotgan barcha vazifalar ro'yxati.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
           <button 
             onClick={() => setViewMode("LIST")}
             className={`px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-semibold transition-all ${viewMode === "LIST" ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <LayoutList className="w-4 h-4" /> Ro'yxat
           </button>
           <button 
             onClick={() => setViewMode("BOARD")}
             className={`px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-semibold transition-all ${viewMode === "BOARD" ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <LayoutGrid className="w-4 h-4" /> Doska
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Vazifa yoki reja nomini qidirish..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-xl"></div>)}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                <CheckSquare className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Vazifalar yo'q</h3>
              <p className="text-sm text-slate-500 mt-1">Hozircha tizimga vazifalar kiritilmagan.</p>
            </div>
          ) : viewMode === "LIST" ? (
            <div className="divide-y divide-slate-100 p-4 space-y-4">
              {filteredTasks.map(task => renderTaskCard(task))}
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
               <div className="flex gap-6 p-6 overflow-x-auto items-start min-h-[500px] bg-slate-50/30">
                 {cols.map((col) => (
                   <Droppable key={col.id} droppableId={col.id}>
                     {(provided, snapshot) => (
                       <div 
                         ref={provided.innerRef}
                         {...provided.droppableProps}
                         className={`flex flex-col gap-4 flex-1 min-w-[320px] max-w-[420px] w-full bg-slate-100/50 p-4 rounded-xl border ${snapshot.isDraggingOver ? 'border-blue-300 ring-2 ring-blue-500/20' : 'border-slate-200'}`}
                       >
                         <h3 className="font-bold text-slate-700 flex items-center justify-between pb-2 border-b border-slate-200/50">
                            {col.title} <span className="bg-white px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm text-slate-500">{col.items.length}</span>
                         </h3>
                         <div className="flex flex-col gap-3 min-h-[150px]">
                           {col.items.map((task, index) => (
                             <Draggable key={task.id} draggableId={task.id} index={index}>
                               {(dragProvided) => renderTaskCard(task, dragProvided)}
                             </Draggable>
                           ))}
                           {provided.placeholder}
                         </div>
                       </div>
                     )}
                   </Droppable>
                 ))}
               </div>
            </DragDropContext>
          )}
          
          {hasMore && !loading && (
            <div className="p-6 pt-2 flex justify-center border-t border-slate-100">
              <button 
                onClick={handleLoadMore}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold px-6 py-2.5 rounded-xl transition-colors text-sm shadow-sm"
              >
                Yana yuklash
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Completion Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-sm w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-blue-500"/> Vazifani yakunlash
              </h2>
              <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-500 transition-colors bg-white hover:bg-slate-50 p-1.5 rounded-lg border border-transparent hover:border-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCompleteSubmit} className="p-6 space-y-5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                 <p className="text-sm font-semibold text-slate-900">{selectedTask.title}</p>
                 <p className="text-xs text-slate-500 mt-1">Sizning ismingiz va profilingiz ostida barcha uchun ko'rinadigan qilib hisobot saqlanadi.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bajarilgan ish bo'yicha izoh (majburiy)</label>
                <textarea 
                  required
                  rows={4}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm"
                  placeholder="Xulosa va natijalar..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Hujjat faylini yuklash (ixtiyoriy)</label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-slate-400" />
                          <p className="mb-1 text-sm text-slate-500 font-medium">
                            {file ? <span className="text-blue-600 font-bold">{file.name}</span> : "Faylni tanlash uchun bosing"}
                          </p>
                          <p className="text-xs text-slate-400">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (MAX. 10MB)</p>
                      </div>
                      <input 
                        id="dropzone-file" 
                        type="file" 
                        className="hidden" 
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={e => {
                          if (e.target.files && e.target.files.length > 0) {
                            setFile(e.target.files[0]);
                          }
                        }}
                      />
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setSelectedTask(null)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors text-sm"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  disabled={submitting || !note.trim()}
                  className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold shadow-sm shadow-blue-500/20 transition-colors disabled:opacity-50 text-sm flex items-center gap-2"
                >
                  {submitting ? "Yuklanmoqda..." : "Tasdiqlash va Yuborish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
