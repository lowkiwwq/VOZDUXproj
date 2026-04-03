import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Loader2, Sparkles } from 'lucide-react';
import { useCityData, Report } from '../hooks/useCityData';
import { generateAdvisorResponse, AdvisorResponse } from '../lib/gemini';

interface ChatMessage {
  id: string;
  role: 'user' | 'advisor';
  content?: string;
  response?: AdvisorResponse;
  isSimulating?: boolean;
}

export const SmartAdvisor = () => {
  const { isAdvisorOpen, setIsAdvisorOpen, language, geminiKey, transport, ecology, applyScenario, addReport, addToast } = useCityData();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [appliedActions, setAppliedActions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isEn = language === 'en';

  const defaultPrompts = isEn 
    ? ["What if we close Abay ave?", "Forecast smog for tonight", "Emergency protocol: Fire in Almaly"]
    : ["Что если перекрыть Абая?", "Прогноз смога на вечер", "ЧС: Пожар в Алмалинском"];

  const loadingPhasesText = isEn 
    ? ["Analyzing traffic data...", "Calculating CO2 impact...", "Formulating recommendations..."]
    : ["Анализирую трафик...", "Расчет выбросов CO2...", "Формирую рекомендации..."];

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading, loadingPhase]);

  // Loading phase sequencer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      setLoadingPhase(0);
      interval = setInterval(() => {
        setLoadingPhase(prev => Math.min(prev + 1, loadingPhasesText.length - 1));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async (text: string) => {
    if (!text.trim()) return;
    
    // Add User Message
    const newMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: newMsgId, role: 'user', content: text }]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await generateAdvisorResponse(geminiKey, text, transport, ecology, language);
      
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'advisor', response }]);
      
      // Trigger side-effects visually dynamically
      applyScenario(text);

    } catch (e: any) {
      console.error(e);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'advisor', 
        response: {
           situation: isEn ? "Connection error evaluating scenario." : "Ошибка связи при оценке сценария.",
           criticality: isEn ? "Low" : "Низкий",
           recommendations: [e.message || "Unknown error"]
        }
      } as ChatMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const mapCriticalityColor = (crit: string) => {
    const cc = crit.toLowerCase();
    if (cc.includes('high') || cc.includes('высок') || cc.includes('критич')) return 'text-destructive border-destructive bg-destructive/10';
    if (cc.includes('med') || cc.includes('сред')) return 'text-alert border-alert bg-alert/10';
    return 'text-norm border-norm bg-norm/10';
  };

  const handleApplySolution = (msgId: string, response: AdvisorResponse) => {
    setAppliedActions(prev => [...prev, msgId]);
    applyScenario("Automated Action");
    addToast(isEn ? "Scenario applied successfully" : "Сценарий успешно применен", "info");
    
    // Create new analytical report
    const newReport: Report = {
      id: `rep-${Date.now()}`,
      date: new Date().toISOString(),
      title: isEn ? "AI Automated Structural Adjustment" : "Корректировка Инфраструктуры (ИИ)",
      category: 'transport', // By default mapping to transport since it impacts traffic mostly 
      status: 'done',
      impact_metrics: {
         timeSavedMinutes: Math.floor(Math.random() * 40) + 15,
         moneySavedKZT: Math.floor(Math.random() * 200000) + 50000,
         citizenSatisfactionBoost: Math.floor(Math.random() * 15) + 5
      },
      ai_summary: {
         incident: response.situation,
         action: response.recommendations.join('; '),
         result: isEn ? "Successfully mitigated primary threat envelope" : "Снижена прогнозируемая нагрузка и исправлены проблемы затора"
      }
    };
    addReport(newReport);
  };

  return (
    <AnimatePresence>
      {isAdvisorOpen && (
        <>
          {/* Overlay mask for mobile layout primarily */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsAdvisorOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 sm:hidden"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[40%] bg-background/85 backdrop-blur-xl border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0 bg-card/50">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bot size={24} className="text-accent" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-norm rounded-full border-2 border-background"></span>
                </div>
                <div>
                  <h2 className="font-bold text-foreground leading-tight">Smart Advisor</h2>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Sparkles size={10} className="text-accent"/> AI Online
                  </p>
                </div>
              </div>
              <button onClick={() => setIsAdvisorOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-2 bg-muted/50 rounded-full hover:bg-muted">
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              
              {messages.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                    <Bot size={48} className="text-muted-foreground mb-4" />
                    <p className="text-sm font-medium mb-2">{isEn ? 'Scenario Simulation Engine' : 'Движок моделирования сценариев'}</p>
                    <p className="text-xs text-muted-foreground max-w-[80%]">
                      {isEn ? 'Ask a "What IF" question to dynamically evaluate structural responses.' : 'Задайте вопрос "Что, если?", чтобы динамически оценить реакцию инфраструктуры.'}
                    </p>
                 </div>
              )}

              {messages.map(msg => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 ${
                    msg.role === 'user' 
                      ? 'bg-accent text-white rounded-tr-sm' 
                      : 'bg-card border border-border shadow-sm rounded-tl-sm'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="text-sm font-medium">{msg.content}</p>
                    ) : (
                      msg.response && (
                        <div className="space-y-4">
                           <div>
                              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                                {isEn ? 'Situation' : 'Что происходит'}
                              </span>
                              <p className="text-sm leading-relaxed">{msg.response.situation}</p>
                           </div>
                           
                           <div className="flex items-center gap-2">
                             <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                {isEn ? 'Criticality:' : 'Критичность:'}
                             </span>
                             <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${mapCriticalityColor(msg.response.criticality)}`}>
                               {msg.response.criticality}
                             </span>
                           </div>

                             {msg.response.recommendations?.length > 0 && (
                               <div>
                                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                                    {isEn ? 'Recommendations' : 'Рекомендации'}
                                  </span>
                                  <ul className="space-y-2">
                                    {msg.response.recommendations.map((rec, idx) => (
                                      <li key={idx} className="flex gap-2 text-sm items-start">
                                        <div className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                          {idx + 1}
                                        </div>
                                        <span className="leading-snug text-muted-foreground">{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                               </div>
                             )}

                             <div className="pt-2">
                               {appliedActions.includes(msg.id) ? (
                                  <div className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-norm bg-norm/10 text-norm rounded-xl transition-all duration-500">
                                     <Sparkles size={16} /> 
                                     <span className="text-sm font-semibold">{isEn ? 'Solution Applied' : 'Решение применено'}</span>
                                  </div>
                               ) : (
                                  <button 
                                    onClick={() => handleApplySolution(msg.id, msg.response!)}
                                    className="w-full relative shadow-md group hover:-translate-y-0.5 hover:shadow-lg transition-all flex justify-center items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-accent to-blue-500 text-white rounded-xl overflow-hidden font-semibold"
                                  >
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    <Sparkles size={16} />
                                    <span className="text-sm">{isEn ? 'Apply Solution' : 'Применить решение'}</span>
                                  </button>
                               )}
                             </div>
                          </div>
                        )
                      )}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-card border border-border shadow-sm rounded-2xl rounded-tl-sm p-4 flex items-center gap-3 w-3/4">
                     <Loader2 size={18} className="animate-spin text-accent shrink-0" />
                     <span className="text-sm font-medium text-muted-foreground truncate transition-all duration-300">
                       {loadingPhasesText[loadingPhase]}
                     </span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background border-t border-border shrink-0">
               {messages.length === 0 && !isLoading && (
                 <div className="flex gap-2 overflow-x-auto pb-3 mb-1 w-full hide-scrollbar">
                   {defaultPrompts.map((p, i) => (
                     <button 
                       key={i} 
                       onClick={() => handleSubmit(p)}
                       className="shrink-0 px-3 py-1.5 bg-muted hover:bg-muted/80 border border-border rounded-full text-xs font-medium text-foreground transition-colors"
                     >
                       {p}
                     </button>
                   ))}
                 </div>
               )}
               
               <form 
                 onSubmit={(e) => { e.preventDefault(); handleSubmit(query); }}
                 className="relative flex items-center"
               >
                 <input 
                   disabled={isLoading}
                   value={query}
                   onChange={e => setQuery(e.target.value)}
                   type="text" 
                   placeholder={isEn ? "Ask a scenario..." : "Задайте сценарий..."}
                   className="w-full bg-muted border border-border focus:border-accent outline-none ring-0 rounded-full pl-5 pr-12 py-3 text-sm font-medium transition-colors disabled:opacity-50"
                 />
                 <button 
                   disabled={isLoading || !query.trim()}
                   type="submit"
                   className="absolute right-1.5 top-1.5 w-9 h-9 bg-accent hover:bg-accent/90 disabled:bg-muted disabled:text-muted-foreground text-white rounded-full flex items-center justify-center transition-colors"
                 >
                   <Send size={16} className="ml-0.5" />
                 </button>
               </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
