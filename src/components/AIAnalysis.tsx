import React, { useState } from 'react';
import { useCityData } from '../hooks/useCityData';
import { generateAIAnalysis, AIResponse } from '../lib/gemini';
import { BrainCircuit, Loader2, Target, Clock, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const AIAnalysis: React.FC = () => {
  const { transport, ecology, safety, housing, geminiKey, language, addToast } = useCityData();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIResponse | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await generateAIAnalysis(geminiKey, transport, ecology, safety, housing, language);
      setAnalysis(result);
    } catch (e: any) {
      console.error('AI ERROR:', e);
      addToast(e.message || 'Error running AI analysis', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-md p-6 mb-6 relative overflow-hidden">


      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BrainCircuit className="text-accent" />
          {language === 'ru' ? 'Анализ ситуации (ИИ)' : 'AI Situation Analysis'}
        </h2>
        
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-accent hover:bg-accent/90 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
          {language === 'ru' ? 'Обновить анализ' : 'Refresh Analysis'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!analysis && !loading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-12 text-muted-foreground bg-muted/50 rounded-md border border-dashed border-border"
          >
            <BrainCircuit size={48} className="mx-auto mb-4 opacity-50" />
            <p>{language === 'ru' ? 'Нажмите "Обновить анализ" для формирования ИИ-отчета по текущим данным.' : 'Click "Refresh Analysis" to generate AI report based on current data.'}</p>
          </motion.div>
        )}

        {loading && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-4">
              <div className="h-24 bg-muted animate-pulse rounded-md" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6">
                <div className="h-32 bg-muted animate-pulse rounded-md" />
                <div className="h-32 bg-muted animate-pulse rounded-md" />
                <div className="h-32 bg-muted animate-pulse rounded-md" />
              </div>
            </div>
            <div className="space-y-4">
               <div className="h-16 bg-muted animate-pulse rounded-md" />
               <div className="h-32 bg-muted animate-pulse rounded-md border-l-4 border-accent" />
            </div>
          </motion.div>
        )}

        {analysis && !loading && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Column: Situation & Recommendations */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-muted/30 border border-border p-4 rounded-md relative overflow-hidden">
                <div className="flex gap-2 items-center mb-2">
                   <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                      analysis.severity === 'КРИТИЧНО' || analysis.severity === 'CRITICAL' ? 'bg-destructive/20 text-destructive border border-destructive' :
                      analysis.severity === 'ВНИМАНИЕ' || analysis.severity === 'WARNING' ? 'bg-alert/20 text-alert border border-alert' :
                      'bg-norm/20 text-norm border border-norm'
                    )}>
                      {analysis.severity}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2 italic">
                      {analysis.severityReason}
                    </span>
                </div>
                <p className="text-foreground leading-relaxed">
                  {analysis.situation}
                </p>
              </div>

              <div>
                 <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider ml-1">
                   {language === 'ru' ? 'Рекомендации по действиям' : 'Actionable Recommendations'}
                 </h4>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {analysis.recommendations.map((rec, idx) => (
                      <div key={idx} className="bg-card border border-border p-4 rounded-md flex flex-col gap-2">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                          {idx + 1}
                        </div>
                        <p className="text-sm font-medium">{rec}</p>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Right Column: Forecast & Priority */}
            <div className="space-y-4 lg:pl-4 lg:border-l border-border">
              <div className="bg-card border border-border p-4 rounded-md">
                 <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                   <Clock size={16} className="text-muted-foreground" />
                   {language === 'ru' ? 'Краткосрочный прогноз' : 'Short-term Forecast'}
                 </h4>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                   {analysis.forecast}
                 </p>
              </div>

              <div className="bg-accent/5 border-l-4 border-accent p-4 rounded-md relative overflow-hidden">
                 <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-accent">
                   <Target size={16} />
                   {language === 'ru' ? 'Наивысший приоритет' : 'Top Priority Action'}
                 </h4>
                 <p className="text-lg font-medium leading-tight">
                   {analysis.priority}
                 </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
