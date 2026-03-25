"use client";

import { useState, useEffect } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { uz } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Calendar as CalendarIcon, CheckSquare, Clock, X, Info, Shield, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

// Setup localizer for 🗓
const locales = {
  "uz": uz,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const parseUzbekDate = (timeframe: string | null, fallbackDate: Date, planYear?: number): Date => {
  if (!timeframe) return fallbackDate;
  
  const text = timeframe.toLowerCase().trim();
  
  // 1. Check for numerical date formats like DD.MM.YYYY, DD-MM-YYYY, DD/MM/YYYY
  const dateMatch = text.match(/\b(\d{1,2})[\.\-\/](\d{1,2})[\.\-\/](\d{2,4})\b/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1; // JS months are 0-11
    let year = parseInt(dateMatch[3]);
    if (year < 100) year += 2000; // handle 24 as 2024
    
    if (day >= 1 && day <= 31 && month >= 0 && month <= 11) {
      return new Date(year, month, day, 12, 0, 0);
    }
  }

  // 2. Parse text formats (e.g. "15-sentyabr, 2026")
  const yearMatch = text.match(/\b(20\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1]) : (planYear || fallbackDate.getFullYear());

  const months = [
    { name: "yanvar", num: 0 }, { name: "fevral", num: 1 }, { name: "mart", num: 2 },
    { name: "aprel", num: 3 }, { name: "may", num: 4 }, { name: "iyun", num: 5 },
    { name: "iyul", num: 6 }, { name: "avgust", num: 7 }, { name: "sentabr", num: 8 },
    { name: "sentyabr", num: 8 }, { name: "oktabr", num: 9 }, { name: "oktyabr", num: 9 },
    { name: "noyabr", num: 10 }, { name: "dekabr", num: 11 }
  ];

  let monthNum = -1;
  for (const m of months) {
    if (text.includes(m.name)) {
      monthNum = m.num;
      break;
    }
  }

  // Find specifically numbered days before months (e.g. 15-sentyabr)
  const dayMatch = text.match(/\b([1-9]|[12]\d|3[01])\b(?:-|-chi|\s)?(?=yanv|fev|mar|apr|may|iyun|iyul|avg|sen|okt|noy|dek|gacha)/);
  let dayNum = 15; // default to middle of month if only month is specified
  
  if (dayMatch) {
    dayNum = parseInt(dayMatch[1]);
  }

  if (monthNum === -1) {
    // If we couldn't parse the month at all, use fallback date
    return fallbackDate;
  }

  return new Date(year, monthNum, dayNum, 12, 0, 0); // Noon
};

export default function CalendarPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Calendar state
  const [view, setView] = useState<any>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  
  // Modal state
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  // Stats state
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      let url = "/api/tasks";
      if (storedUser) {
        const u = JSON.parse(storedUser);
        url = `/api/tasks?userId=${u.id}&role=${u.role}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setTasks(data);
      
      // Convert tasks to BigCalendar events
      const mappedEvents = data.map((task: any) => {
        // Fallback to createdAt if parser fails
        const fallback = task.deadline ? new Date(task.deadline) : new Date(task.createdAt);
        const eventDate = parseUzbekDate(task.timeframe, fallback, task.plan?.year);
        
        return {
          id: task.id,
          title: task.title,
          start: eventDate,
          end: eventDate,
          allDay: true,
          resource: task
        };
      });
      setEvents(mappedEvents);
      
      // Calculate stats
      const total = data.length;
      const completed = data.filter((t: any) => t.submissions && t.submissions.length > 0).length;
      setStats({ total, completed, pending: total - completed });
      
    } catch (error) {
      console.error("Xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event: any, start: Date, end: Date, isSelected: boolean) => {
    const task = event.resource;
    let backgroundColor = '#3b82f6'; // blue default
    let borderColor = '#2563eb';
    
    // Determine color by status
    if (task.submissions && task.submissions.length > 0) {
      backgroundColor = '#10b981'; // emerald for finished
      borderColor = '#059669';
    } else if (task.status === "JARAYONDA") {
      backgroundColor = '#f59e0b'; // amber for in-progress
      borderColor = '#d97706';
    }
    
    const style = {
      backgroundColor,
      borderRadius: '6px',
      opacity: 0.9,
      color: 'white',
      border: `1px solid ${borderColor}`,
      display: 'block',
      fontSize: '11px',
      padding: '3px 8px',
      fontWeight: '600',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      textShadow: '0 1px 1px rgba(0,0,0,0.1)'
    };
    return { style };
  };

  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => { toolbar.onNavigate('PREV'); };
    const goToNext = () => { toolbar.onNavigate('NEXT'); };
    const goToCurrent = () => { toolbar.onNavigate('TODAY'); };
    
    // Dynamic Header based on view
    let headerText = format(toolbar.date, 'MMMM yyyy', { locale: uz });
    if (toolbar.view === 'day') {
      headerText = format(toolbar.date, 'd MMMM yyyy, EEEE', { locale: uz });
    } else if (toolbar.view === 'week') {
      const start = startOfWeek(toolbar.date, { weekStartsOn: 1 });
      const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
      headerText = `${format(start, 'd MMM')} - ${format(end, 'd MMM yyyy', { locale: uz })}`;
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 mb-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2 mb-4 sm:mb-0">
          <button onClick={goToBack} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 hover:text-indigo-600 transition-colors shadow-sm"><ChevronLeft className="w-5 h-5"/></button>
          <button onClick={goToCurrent} className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 font-semibold text-slate-700 text-sm shadow-sm transition-colors">Bugun</button>
          <button onClick={goToNext} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 hover:text-indigo-600 transition-colors shadow-sm"><ChevronRight className="w-5 h-5"/></button>
        </div>
        <h2 className="text-xl font-bold text-slate-800 capitalize">{headerText}</h2>
        <div className="flex items-center gap-2 mt-4 sm:mt-0 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button onClick={() => toolbar.onView('month')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${toolbar.view === 'month' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>Oy</button>
          <button onClick={() => toolbar.onView('week')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${toolbar.view === 'week' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>Hafta</button>
          <button onClick={() => toolbar.onView('day')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${toolbar.view === 'day' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>Kun</button>
          <button onClick={() => toolbar.onView('agenda')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${toolbar.view === 'agenda' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>Ro'yxat</button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 h-[calc(100vh-7rem)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-indigo-600" />
            Vazifalar Taqivimi
          </h1>
          <p className="text-sm text-slate-500 mt-1">Rejadagi vazifalarning belgilangan muddatlari bo'yicha ko'rinishi.</p>
        </div>
        {/* Stats Row */}
        <div className="hidden md:flex gap-4">
           <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm text-center">
             <div className="text-xs font-semibold text-slate-500 uppercase">Jami</div>
             <div className="text-xl font-bold text-slate-800">{stats.total}</div>
           </div>
           <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm text-center">
             <div className="text-xs font-semibold text-emerald-500 uppercase">Bajarilgan</div>
             <div className="text-xl font-bold text-emerald-600">{stats.completed}</div>
           </div>
           <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm text-center">
             <div className="text-xs font-semibold text-amber-500 uppercase">Kutilayotgan</div>
             <div className="text-xl font-bold text-amber-600">{stats.pending}</div>
           </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-end gap-4 shrink-0 px-2">
         <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
           <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm border border-blue-600"></div> Yangi
         </div>
         <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
           <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm border border-amber-600"></div> Jarayonda
         </div>
         <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
           <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm border border-emerald-600"></div> Bajarilgan
         </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex-1 p-4 sm:p-6 relative">
        {loading && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm flex items-center justify-center">
             <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
          </div>
        )}
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%', minHeight: '400px' }}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: CustomToolbar
          }}
          onSelectEvent={(event: any) => setSelectedEvent(event.resource)}
          culture="uz"
          messages={{
            next: "Keyingi",
            previous: "Oldingi",
            today: "Bugun",
            month: "Oy",
            week: "Hafta",
            day: "Kun",
            agenda: "Ro'yxat",
            noEventsInRange: "Ushbu muddatda vazifalar yo'q",
            showMore: (total: number) => `+${total} ta yana`
          }}
        />
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/80">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <Info className="w-5 h-5 text-indigo-500" /> Vazifa Ma'lumotlari
               </h3>
               <button onClick={() => setSelectedEvent(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="p-5 space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 leading-tight">{selectedEvent.title}</h4>
                  {selectedEvent.plan?.title && (
                    <p className="text-sm text-indigo-600 font-medium mt-1 inline-flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-md">
                      <CalendarDays className="w-3.5 h-3.5" /> {selectedEvent.plan.title}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Biriktirilgan Rol</p>
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-amber-500" />
                      {selectedEvent.assignedRole || "Hamma"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Muddati</p>
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-500" />
                      {selectedEvent.timeframe || "Muddatsiz"}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Holati va Hisobotlar</p>
                   <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                        selectedEvent.submissions?.length > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        selectedEvent.status === 'JARAYONDA' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {selectedEvent.submissions?.length > 0 ? '✓ BAJARILGAN' : selectedEvent.status || 'YANGI'}
                      </span>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                        {selectedEvent.submissions?.length || 0} ta fayl/izoh
                      </span>
                   </div>
                   
                   {selectedEvent.note && (
                     <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <p className="text-xs font-medium text-slate-700 italic">"{selectedEvent.note}"</p>
                     </div>
                   )}
                </div>
             </div>
             
             <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
               <button onClick={() => setSelectedEvent(null)} className="px-5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-100 transition-colors">
                 Yopish
               </button>
               <button 
                 onClick={() => router.push(`/dashboard/tasks?search=${encodeURIComponent(selectedEvent.title)}`)} 
                 className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
               >
                 Vazifaga o'tish
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
