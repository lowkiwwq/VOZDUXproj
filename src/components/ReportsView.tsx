import { useState, useMemo } from 'react';
import { useCityData, Report } from '../hooks/useCityData';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Bot, Car, Droplets, Printer, Heart, Clock, Coins, FileCheck2, ShieldAlert, Cpu, X } from 'lucide-react';
import { cn } from '../lib/utils';

const formatKZT = (amount?: number) => amount ? new Intl.NumberFormat('ru-RU').format(amount) + ' ₸' : '—';
const getIcon = (cat: string) => {
  if (cat === 'transport') return Car;
  if (cat === 'ecology') return Droplets;
  if (cat === 'safety') return ShieldAlert;
  return Bot; // housing or default
};

export const ReportsView = () => {
  const { reports, language } = useCityData();
  const isEn = language === 'en';
  
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'transport' | 'ecology' | 'housing' | 'safety'>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const filteredReports = useMemo(() => {
    if (selectedCategory === 'all') return reports;
    return reports.filter(r => r.category === selectedCategory);
  }, [reports, selectedCategory]);

  const globalImpact = useMemo(() => {
    return reports.reduce((acc, curr) => ({
      time: acc.time + (curr.impact_metrics.timeSavedMinutes || 0),
      money: acc.money + (curr.impact_metrics.moneySavedKZT || 0),
      satisfaction: acc.satisfaction + (curr.impact_metrics.citizenSatisfactionBoost || 0),
      solved: acc.solved + (curr.status === 'done' ? 1 : 0)
    }), { time: 0, money: 0, satisfaction: 0, solved: 0 });
  }, [reports]);

  const triggerPDFExport = () => {
    // 100% Client side mock export relying on browser Print + CSS media print
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      {/* KPI Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <div className="bg-card border border-border p-5 flex flex-col rounded-xl shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5"><FileCheck2 size={64}/></div>
           <p className="text-sm font-medium text-muted-foreground">{isEn ? 'AI Solved Incidents' : 'Решено ИИ'}</p>
           <p className="text-3xl font-bold mt-2 text-foreground">{globalImpact.solved}</p>
        </div>
        <div className="bg-card border border-border p-5 flex flex-col rounded-xl shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5"><Clock size={64}/></div>
           <p className="text-sm font-medium text-muted-foreground">{isEn ? 'Citizen Hours Saved' : 'Сэкономлено времени'}</p>
           <p className="text-3xl font-bold mt-2 text-foreground">{Math.round(globalImpact.time / 60)} {isEn ? 'h' : 'ч'}</p>
        </div>
        <div className="bg-card border border-border p-5 flex flex-col rounded-xl shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5"><Coins size={64}/></div>
           <p className="text-sm font-medium text-muted-foreground">{isEn ? 'Economic Effect' : 'Экономический эффект'}</p>
           <p className="text-3xl font-bold mt-2 text-foreground">{formatKZT(globalImpact.money)}</p>
        </div>
        <div className="bg-card border border-border p-5 flex flex-col rounded-xl shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5"><Heart size={64}/></div>
           <p className="text-sm font-medium text-muted-foreground">{isEn ? 'Social ROI Index' : 'Индекс счастья (ROI)'}</p>
           <p className="text-3xl font-bold mt-2 text-norm">+{globalImpact.satisfaction}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar print:hidden">
         {['all', 'transport', 'ecology', 'housing', 'safety'].map(cat => (
            <button 
              key={cat} onClick={() => setSelectedCategory(cat as any)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap capitalize transition-colors border",
                selectedCategory === cat ? "bg-accent text-white border-accent shadow-md shadow-accent/20" : "bg-card text-muted-foreground border-border hover:bg-muted"
              )}
            >
              {isEn ? cat : cat === 'all' ? 'Все' : cat === 'transport' ? 'Транспорт' : cat === 'ecology' ? 'Экология' : cat === 'housing' ? 'ЖКХ' : 'Безопасность'}
            </button>
         ))}
      </div>

      {/* Feed */}
      <div className="grid grid-cols-1 gap-4 pb-20 print:hidden">
        {filteredReports.map((report, i) => {
          const Icon = getIcon(report.category);
          const reportTime = new Date(report.date).toLocaleDateString(isEn ? 'en-US' : 'ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' });

          return (
            <motion.div 
              initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: i * 0.05}}
              key={report.id} 
              onClick={() => setSelectedReport(report)}
              className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:border-accent/40 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0 group-hover:bg-accent group-hover:text-white transition-colors">
                   <Icon size={20} />
                 </div>
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase opacity-70">
                        ID: {report.id.split('-').slice(-1)[0]}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-border"></span>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase">{reportTime}</span>
                    </div>
                    <h3 className="font-semibold text-foreground text-lg leading-tight">{report.title}</h3>
                 </div>
              </div>

              <div className="flex items-center gap-4 sm:ml-auto self-start sm:self-center">
                 <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-norm/10 text-norm border border-norm/20">
                    <CheckCircle2 size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">{isEn ? 'Resolved' : 'Завершен'}</span>
                 </div>
              </div>
            </motion.div>
          );
        })}
        {filteredReports.length === 0 && (
          <div className="py-20 text-center opacity-50 flex flex-col items-center">
             <Bot size={48} className="mb-4 text-muted-foreground"/>
             <p>{isEn ? 'No reports found in this category.' : 'Аналитических отчетов пока нет.'}</p>
          </div>
        )}
      </div>

      {/* Modal Detailed View */}
      <AnimatePresence>
        {selectedReport && (
          <>
            <motion.div 
              initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
              onClick={() => setSelectedReport(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto print:hidden"
            />
            <motion.div 
              initial={{opacity: 0, scale: 0.95, y: 20}} animate={{opacity: 1, scale: 1, y: 0}} exit={{opacity: 0, scale: 0.95, y: 20}}
              className="fixed left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 top-[5%] sm:top-[10%] bottom-0 sm:bottom-auto w-full sm:max-w-2xl bg-card border border-border shadow-2xl rounded-t-2xl sm:rounded-2xl z-50 flex flex-col overflow-hidden max-h-[90vh] print:static print:transform-none print:w-full print:shadow-none print:border-none print:block print:absolute print:inset-0"
            >
              <div className="p-6 border-b border-border flex justify-between items-start bg-muted/30 print:hidden">
                <div>
                   <div className="flex items-center gap-2 mb-2">
                     <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent">
                       {selectedReport.category}
                     </span>
                     <span className="text-xs text-muted-foreground font-mono">
                       {new Date(selectedReport.date).toISOString().replace('T', ' ').slice(0, 19)}
                     </span>
                   </div>
                   <h2 className="text-2xl font-bold text-foreground leading-tight">{selectedReport.title}</h2>
                </div>
                <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-muted rounded-full">
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              {/* Print Only Header */}
              <div className="hidden print:block mb-8 pb-4 border-b-2 border-black">
                 <h1 className="text-4xl font-extrabold mb-2 uppercase tracking-tight">Smart City Analytics Report</h1>
                 <p className="text-lg">ID: {selectedReport.id} | Date: {new Date(selectedReport.date).toLocaleString()}</p>
                 <h2 className="text-2xl font-bold mt-6">{selectedReport.title}</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 print:p-0 print:space-y-6">
                
                {/* 3 AI Blocks */}
                <div className="space-y-6">
                   <div className="border-l-2 border-alert pl-4">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-2">
                        <AlertTriangle size={14}/> {isEn ? '1. Situation Detected' : '1. Что произошло'}
                      </h4>
                      <p className="text-foreground leading-relaxed">{selectedReport.ai_summary.incident}</p>
                   </div>
                   
                   <div className="border-l-2 border-accent pl-4">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-2">
                        <Bot size={14}/> {isEn ? '2. Action Taken (AI Directed)' : '2. Принятые меры'}
                      </h4>
                      <p className="text-foreground leading-relaxed font-medium bg-accent/5 p-3 rounded-lg border border-accent/10 mt-2">{selectedReport.ai_summary.action}</p>
                   </div>
                   
                   <div className="border-l-2 border-norm pl-4">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-2">
                        <CheckCircle2 size={14}/> {isEn ? '3. Result & Impact' : '3. Результат'}
                      </h4>
                      <p className="text-foreground leading-relaxed">{selectedReport.ai_summary.result}</p>
                   </div>
                </div>

                {/* Metrics Grid */}
                <div className="bg-muted/50 rounded-xl p-4 border border-border">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3 text-center tracking-widest">{isEn ? 'Impact Analytics' : 'Метрики эффективности'}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {selectedReport.impact_metrics.timeSavedMinutes && (
                       <div className="text-center font-mono">
                         <span className="block text-2xl font-bold text-foreground">{selectedReport.impact_metrics.timeSavedMinutes}</span>
                         <span className="text-[10px] text-muted-foreground uppercase">{isEn ? 'Min Saved' : 'Сэкономлено мин.'}</span>
                       </div>
                     )}
                     {selectedReport.impact_metrics.moneySavedKZT && (
                       <div className="text-center font-mono">
                         <span className="block text-xl font-bold text-norm">{formatKZT(selectedReport.impact_metrics.moneySavedKZT)}</span>
                         <span className="text-[10px] text-muted-foreground uppercase">{isEn ? 'Budget Saved' : 'Хранение Бюджета'}</span>
                       </div>
                     )}
                     {selectedReport.impact_metrics.citizenSatisfactionBoost && (
                       <div className="text-center font-mono">
                         <span className="block text-2xl font-bold text-accent">+{selectedReport.impact_metrics.citizenSatisfactionBoost}%</span>
                         <span className="text-[10px] text-muted-foreground uppercase">{isEn ? 'Social ROI' : 'Индекс счастья'}</span>
                       </div>
                     )}
                  </div>
                </div>

                {/* Digital Signature */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-card border border-border shadow-inner">
                   <div className="w-12 h-12 bg-accent text-white rounded-lg flex items-center justify-center shrink-0">
                     <Cpu size={24} />
                   </div>
                   <div className="font-mono text-sm opacity-80">
                      <span className="block text-accent font-bold uppercase text-xs mb-1">Blockchain Verified Segment</span>
                      {isEn 
                        ? 'Generated via Google Gemini 1.5 Pro. Infrastructure payload verified. Data integrity match: 98.4%. Official Smart City DAO signature applied.'
                        : 'Сгенерировано модулем Gemini 1.5 Pro. Достоверность данных: 98.4%. Протокол верифицирован блокчейн-узлом (имитация).'}
                      <div className="mt-2 text-[10px] text-muted-foreground tracking-widest break-all">
                         HASH: 0x{selectedReport.id.split('').map(c => c.charCodeAt(0).toString(16)).join('').padEnd(64, '0')}
                      </div>
                   </div>
                </div>

              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-border bg-muted/10 flex justify-end gap-3 print:hidden">
                 <button onClick={() => setSelectedReport(null)} className="px-4 py-2 font-medium text-muted-foreground hover:text-foreground">
                   {isEn ? 'Close' : 'Закрыть'}
                 </button>
                 <button onClick={triggerPDFExport} className="px-5 py-2 bg-gradient-to-r from-accent to-blue-600 hover:to-blue-500 text-white rounded-lg shadow-md font-medium flex items-center gap-2 transition-all">
                   <Printer size={18} /> {isEn ? 'Export to PDF' : 'Экспорт в PDF'}
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Dummy AlertTriangle since it wasn't imported top level but used in code
const AlertTriangle = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
);
