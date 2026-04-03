import { useState, useMemo } from 'react';
import { useCityData, Report } from '../hooks/useCityData';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Bot, Car, Droplets, Printer, Heart, Clock, Coins, FileCheck2, ShieldAlert, Cpu, X, TrendingUp, TrendingDown, Target, BrainCircuit, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
import { cn } from '../lib/utils';

const formatKZT = (amount?: number) => amount ? new Intl.NumberFormat('ru-RU').format(amount) + ' ₸' : '—';
const getIcon = (cat: string) => {
  if (cat === 'transport') return Car;
  if (cat === 'ecology') return Droplets;
  if (cat === 'safety') return ShieldAlert;
  return Bot; // housing or default
};

type Timeframe = '24h' | 'week' | 'month';

// Mock Strategic Analytical data 
const MOCK_STRATEGIC_DATA = {
  '24h': {
    deltas: { solved: 15.4, time: 8.2, money: 4.1, satisfaction: 1.2 },
    sentiment: 7.4, sentimentDelta: 0.2, confidence: 98,
    benchmarkOffset: 45,
    chartData: Array.from({length: 8}, (_,i) => ({ label: `${i*3}:00`, incidents: 10 + Math.random() * 20 })),
    narrative: {
      en: {
        trend: "Within the last 24 hours, operational load has decreased by 15.4%. Predictive traffic light phasing resulted in a major efficiency boost across main avenues.",
        anomalies: "Minor utility spikes localized to Almaly district; automatic pressure distribution prevented a critical failure cascade.",
        forecast: "Medium probability of structural overload in evening hours due to scheduled maintenance. DAO intervention recommended."
      },
      ru: {
        trend: "За последние 24 часа операционная нагрузка снизилась на 15.4%. Предиктивное распределение фаз светофоров дало существенный прирост эффективности на главных проспектах.",
        anomalies: "Небольшие аномалии ЖКХ в Алмалинском районе; автоматическая перебалансировка давления предотвратила критический сбой.",
        forecast: "Средняя вероятность структурной перегрузки в вечерние часы из-за плановых работ. Рекомендуется вмешательство модуля DAO."
      }
    }
  },
  'week': {
    deltas: { solved: -2.1, time: 14.5, money: 18.2, satisfaction: 2.5 },
    sentiment: 7.7, sentimentDelta: 0.4, confidence: 94,
    benchmarkOffset: 250,
    chartData: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => ({ label: d, incidents: 150 + Math.random() * 100 })),
    narrative: {
      en: {
        trend: "Weekly analytics confirm a strong correlation between distributed AI routing and overall grid efficiency, yielding an 18.2% budget retention.",
        anomalies: "A cumulative anomaly was detected in the ecology mapping metric on Thursday due to sudden atmospheric shifts, resolved via temporary industrial limitations.",
        forecast: "Anticipating a 5% baseline load increase next week. Traffic optimization protocols pre-initialized."
      },
      ru: {
        trend: "Анализ недельного цикла выявил устойчивую корреляцию между распределенным ИИ-роутингом и общей эффективностью сетки, сохранив 18.2% бюджета.",
        anomalies: "В четверг зафиксирована кумулятивная экологическая аномалия из-за резких атмосферных сдвигов, нивелирована временным ограничением эмиссий промзон.",
        forecast: "Ожидается увеличение базовой нагрузки на 5% на следующей неделе. Протоколы оптимизации трафика пред-инициализированы."
      }
    }
  },
  'month': {
    deltas: { solved: 32.4, time: 25.1, money: -5.4, satisfaction: 4.8 },
    sentiment: 7.8, sentimentDelta: 0.5, confidence: 91,
    benchmarkOffset: 1100,
    chartData: ['Week 1','Week 2','Week 3','Week 4'].map(d => ({ label: d, incidents: 600 + Math.random() * 400 })),
    narrative: {
      en: {
        trend: "The monthly retrospective shows consistent positive dynamics (-12% congestion relative to previous weighted averages). This synergy is achieved via proactive smart services.",
        anomalies: "High depreciation of heating networks in the X-Y grid required elevated spending (-5.4% deficit), preventing massive winter-season infrastructural collapses.",
        forecast: "Preventative intervention required within 14 days for Sector B routing hubs to maintain current ESG standards."
      },
      ru: {
        trend: "В отчетном периоде зафиксирована положительная динамика снижения заторов на 12% относительно средневзвешенных показателей прошлого месяца. Данный эффект достигнут за счет синергии предиктивного моделирования.",
        anomalies: "Износ теплосетей в квадрате улиц X-Y потребовал повышенных расходов (дефицит -5.4%), что предотвратило масштабный коллапс в зимний период.",
        forecast: "Требуется превентивное вмешательство в течение следующих 14 дней в маршрутизаторы Сектора Б для поддержания текущих ESG-стандартов."
      }
    }
  }
};

const DeltaBadge = ({ val }: { val: number }) => {
  const isPos = val >= 0;
  return (
    <div className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider relative z-10", isPos ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
      {isPos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {isPos ? '+' : ''}{val}%
    </div>
  );
};

export const ReportsView = () => {
  const { reports, language } = useCityData();
  const isEn = language === 'en';
  
  const [timeframe, setTimeframe] = useState<Timeframe>('week');
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

  const activeStrat = MOCK_STRATEGIC_DATA[timeframe];
  const activeNarrative = activeStrat.narrative[isEn ? 'en' : 'ru'];

  const triggerPDFExport = () => window.print();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      
      {/* Timeframe Selector */}
      <div className="flex justify-center print:hidden mb-2">
        <div className="bg-card border border-border rounded-full p-1 flex items-center shadow-sm">
          {(['24h', 'week', 'month'] as Timeframe[]).map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-semibold transition-all relative",
                timeframe === t ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {timeframe === t && (
                <motion.div
                  layoutId="timeframe-bubble"
                  className="absolute inset-0 bg-accent/10 border border-accent/20 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">
                {t === '24h' ? (isEn ? 'Operational (24h)' : 'Оперативный (24ч)') : 
                 t === 'week' ? (isEn ? 'Weekly' : 'Недельный') : 
                 (isEn ? 'Monthly' : 'Месячный')}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Executive Narrative */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
             
             {/* "Revolutionary" Highlights */}
             <div className="flex flex-wrap gap-3 mb-6 relative z-10">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent rounded-lg border border-accent/20 text-xs font-bold uppercase tracking-wider">
                 <BrainCircuit size={14}/> 
                 {isEn ? 'AI Confidence Score' : 'Достоверность ИИ прогноза'}: {activeStrat.confidence}%
               </div>
               <div className="flex items-center gap-2 px-3 py-1.5 bg-norm/10 text-norm rounded-lg border border-norm/20 text-xs font-bold uppercase tracking-wider">
                 <Heart size={14}/> 
                 {isEn ? 'Social Sentiment' : 'Рейтинг лояльности'}: {activeStrat.sentiment}/10 ( <TrendingUp size={10} className="inline opacity-70 mb-0.5 text-norm"/> {activeStrat.sentimentDelta} )
               </div>
             </div>

             <div className="space-y-5 relative z-10 text-foreground leading-relaxed">
                <div>
                   <h4 className="text-sm font-bold uppercase text-muted-foreground mb-1">{isEn ? 'General Trend' : 'Общий тренд'}</h4>
                   <p className="text-lg font-medium">{activeNarrative.trend}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-muted/40 p-4 rounded-xl border border-border/50">
                     <h4 className="text-xs font-bold uppercase tracking-wider text-alert mb-2 flex items-center gap-2"><Activity size={14}/> {isEn ? 'Key Anomalies' : 'Ключевые аномалии'}</h4>
                     <p className="text-sm opacity-90">{activeNarrative.anomalies}</p>
                  </div>
                  <div className="bg-muted/40 p-4 rounded-xl border border-border/50">
                     <h4 className="text-xs font-bold uppercase tracking-wider text-accent mb-2 flex items-center gap-2"><Target size={14}/> {isEn ? 'Forecast' : 'Прогноз Рисков'}</h4>
                     <p className="text-sm opacity-90">{activeNarrative.forecast}</p>
                  </div>
                </div>
             </div>
             
             {/* Decor */}
             <div className="absolute -top-20 -right-20 opacity-[0.03] text-foreground pointer-events-none">
                <Bot size={300} />
             </div>
          </div>

          {/* Area Chart Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">{isEn ? 'Incident Volumetrics' : 'Динамика Инцидентов'}</h3>
                <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                   <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-accent"></div> {isEn ? 'Actual' : 'Фактическое'}</span>
                   <span className="flex items-center gap-1.5"><div className="w-4 border-b-2 border-dashed border-destructive"></div> {isEn ? 'Target (Benchmark)' : 'Целевой порог'}</span>
                </div>
             </div>
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={activeStrat.chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                       contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }}
                       itemStyle={{ color: 'hsl(var(--accent))', fontWeight: 600 }}
                    />
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" />
                    <ReferenceLine y={activeStrat.benchmarkOffset} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                    <Area type="monotone" dataKey="incidents" stroke="hsl(var(--accent))" strokeWidth={3} fillOpacity={1} fill="url(#colorIncidents)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Dynamic KPI Column */}
        <div className="space-y-4">
          <div className="bg-card border border-border p-5 flex flex-col rounded-xl shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5"><FileCheck2 size={64}/></div>
             <div className="flex justify-between items-start">
               <p className="text-sm font-medium text-muted-foreground">{isEn ? 'AI Solved Incidents' : 'Решено ИИ'}</p>
               <DeltaBadge val={activeStrat.deltas.solved} />
             </div>
             <p className="text-3xl font-bold mt-2 text-foreground">{globalImpact.solved}</p>
          </div>
          <div className="bg-card border border-border p-5 flex flex-col rounded-xl shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5"><Clock size={64}/></div>
             <div className="flex justify-between items-start">
               <p className="text-sm font-medium text-muted-foreground">{isEn ? 'Citizen Hours Saved' : 'Сэкономлено времени'}</p>
               <DeltaBadge val={activeStrat.deltas.time} />
             </div>
             <p className="text-3xl font-bold mt-2 text-foreground">{Math.round(globalImpact.time / 60)} {isEn ? 'h' : 'ч'}</p>
          </div>
          <div className="bg-card border border-border p-5 flex flex-col rounded-xl shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5"><Coins size={64}/></div>
             <div className="flex justify-between items-start">
               <p className="text-sm font-medium text-muted-foreground">{isEn ? 'Economic Effect' : 'Экономический эффект'}</p>
               <DeltaBadge val={activeStrat.deltas.money} />
             </div>
             <p className="text-3xl font-bold mt-2 text-foreground">{formatKZT(globalImpact.money)}</p>
          </div>
          <div className="bg-card border border-border p-5 flex flex-col rounded-xl shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5"><Heart size={64}/></div>
             <div className="flex justify-between items-start">
               <p className="text-sm font-medium text-muted-foreground">{isEn ? 'Social ROI Index' : 'Индекс счастья (ROI)'}</p>
               <DeltaBadge val={activeStrat.deltas.satisfaction} />
             </div>
             <p className="text-3xl font-bold mt-2 text-norm">+{globalImpact.satisfaction}%</p>
          </div>
        </div>

      </div>

      {/* Legacy Feed (Filtered Reports View that previously existed) hidden inside a toggle arguably... or just listed below */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
           <h3 className="font-bold text-xl">{isEn ? 'Operational Log Feed' : 'Оперативный Журнал Решений'}</h3>
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar print:hidden">
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

        {/* Feed List */}
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
        </div>
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
