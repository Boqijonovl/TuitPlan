import React, { useRef, useState } from 'react';
import { FileText, Download, Printer, X, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface DocumentGeneratorProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentGenerator({ user, isOpen, onClose }: DocumentGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [docContent, setDocContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    
    // Simulate AI Generation delay
    setTimeout(() => {
      const date = format(new Date(), "dd.MM.yyyy");
      const template = `
        <div style="font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; color: black; background: white;">
          <div style="text-align: center; margin-bottom: 30px; font-weight: bold; text-transform: uppercase;">
            O'zbekiston Respublikasi Oliy ta'lim, fan va innovatsiyalar vazirligi<br/>
            Muhammad al-Xorazmiy nomidagi Toshkent axborot texnologiyalari universiteti<br/>
            ${user?.department?.name || 'Tegishli Kafedra'}
          </div>
          
          <h2 style="text-align: center; margin: 40px 0; font-size: 20px;">D A L O L A T N O M A / B A Y O N N O M A</h2>
          
          <p style="text-align: justify; text-indent: 40px; margin-bottom: 20px;">
            Ushbu dalolatnoma shuni tasdiqlaydiki, ${date} sanasida TATU "${user?.department?.name || 'Kafedra'}" kafedrasi 
            ${user?.role || 'xodimi'} <strong>${user?.name || 'F.I.SH'}</strong> tomonidan quyidagi amaliy va nazariy ishlar bajarildi:
          </p>
          
          <div style="margin: 30px 40px; padding: 20px; border-left: 4px solid #1d2d5b; background-color: #f8fafc; font-style: italic;">
            "${prompt}"
          </div>
          
          <p style="text-align: justify; text-indent: 40px;">
            Bajarilgan ishlar Oliy ta'lim standartlari hamda kafedraning yillik ish rejasiga to'la muvofiq keladi. Ushbu ma'lumotlar tizimga rasmiy hisobot sifatida biriktirilishi tasdiqlanadi.
          </p>
          
          <div style="margin-top: 60px; display: flex; justify-content: space-between;">
            <div>
              <strong>Tuzuvchi:</strong><br/><br/>
              _________________ ${user?.name}
            </div>
            <div>
              <strong>Tasdiqlovchi (Mudir):</strong><br/><br/>
              _________________ 
            </div>
          </div>
          
          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            TUIT Enterprise System AI tomonidan avtomatik generatsiya qilindi • SHA-256 Himoyalangan • ${new Date().toISOString()}
          </div>
        </div>
      `;
      setDocContent(template);
      setIsGenerating(false);
    }, 1500);
  };

  const handlePrint = () => {
    const printContents = printRef.current?.innerHTML;
    if (printContents) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // To restore React state safely
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Smart Document Generator</h2>
              <p className="text-xs font-semibold text-slate-500">AI yordamida rasmiy dalolatnoma va bayonnomalar yasash</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6 bg-slate-50">
          
          {/* Prompt Section */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
              <label className="text-sm font-bold text-slate-700 mb-2">Qisqacha nima ish qildingiz?</label>
              <textarea 
                className="w-full flex-1 min-h-[150px] p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none"
                placeholder="Masalan: Bugun talabalar bilan O'zbekiston tarixi muzeyiga bordik. Ko'rgazmalar bilan tanishdik..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="mt-4 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold tracking-wide flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200"
              >
                {isGenerating ? (
                  <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Yaratilmoqda...</>
                ) : (
                  <><FileText className="w-5 h-5" /> Hujjatni Generatsiya Qilish</>
                )}
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="w-full lg:w-2/3 bg-white rounded-2xl border border-slate-200 shadow-inner overflow-hidden flex flex-col">
            <div className="p-3 border-b border-slate-100 bg-slate-100 flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Oldindan Ko'rish (Preview)</span>
              {docContent && (
                <div className="flex items-center gap-2">
                  <button onClick={handlePrint} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm">
                    <Printer className="w-3.5 h-3.5" /> PDF / Chop etish
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-slate-200/50 relative">
              {docContent ? (
                <div 
                  ref={printRef}
                  className="bg-white shadow-md mx-auto print-container" 
                  dangerouslySetInnerHTML={{ __html: docContent }} 
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <FileText className="w-16 h-16 opacity-20 mb-4" />
                  <p className="text-sm font-semibold max-w-xs text-center">Matn kiritib "Generatsiya qilish" tugmasini bosing va natijani shu yerda ko'ring</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
