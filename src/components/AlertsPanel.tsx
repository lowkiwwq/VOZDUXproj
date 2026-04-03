import React from 'react';
import { useCityData, ModuleType } from '../hooks/useCityData';
import { Plane, Leaf, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const AlertsPanel: React.FC = () => {
  const { alerts, dismissAlert, language } = useCityData();

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Activity size={18} className="text-muted-foreground" />
          {language === 'ru' ? 'Активные Уведомления' : 'Active Alerts'}
        </h3>
        <span className="text-xs font-medium bg-muted px-2 py-1 rounded-full">
          {alerts.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        <AnimatePresence>
          {alerts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center text-muted-foreground text-sm py-10"
            >
              {language === 'ru' ? 'Нет активных уведомлений. Все системы в норме.' : 'No active alerts. All systems normal.'}
            </motion.div>
          ) : (
            alerts.map(alert => (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                className={cn(
                  "p-3 rounded-lg border text-sm flex flex-col gap-2 relative",
                  alert.severity === 'КРИТИЧНО' ? 'bg-destructive/10 border-destructive/30' :
                  alert.severity === 'ВНИМАНИЕ' ? 'bg-alert/10 border-alert/30' :
                  'bg-norm/10 border-norm/30'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      alert.severity === 'КРИТИЧНО' ? 'bg-destructive animate-pulse' :
                      alert.severity === 'ВНИМАНИЕ' ? 'bg-alert' : 'bg-norm'
                    )} />
                    <span className={cn(
                      "font-semibold text-xs",
                      alert.severity === 'КРИТИЧНО' ? 'text-destructive' :
                      alert.severity === 'ВНИМАНИЕ' ? 'text-alert' : 'text-norm'
                    )}>
                      {alert.severity}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                </div>
                
                <p className="font-medium">{alert.message}</p>
                
                <button 
                  onClick={() => dismissAlert(alert.id)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground opacity-0 hover:opacity-100 transition-opacity"
                  title="Dismiss"
                >
                  ✕
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
