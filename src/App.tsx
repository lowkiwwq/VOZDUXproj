import React, { useState } from 'react';
import { CityDataProvider, ModuleType, useCityData } from './hooks/useCityData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { KPICards } from './components/KPICards';
import { Charts } from './components/Charts';
import { AlertsPanel } from './components/AlertsPanel';
import { AIAnalysis } from './components/AIAnalysis';
import { Loader2, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from './lib/utils';

const ToastManager = () => {
  const { toasts, removeToast } = useCityData();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={cn(
               "p-4 rounded-xl shadow-lg border flex items-start gap-3",
               toast.type === 'error' ? 'bg-destructive/10 border-destructive text-destructive' :
               toast.type === 'warning' ? 'bg-alert/10 border-alert text-alert' :
               'bg-card border-border text-foreground'
            )}
          >
            {toast.type === 'error' && <AlertCircle size={20} className="shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle size={20} className="shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info size={20} className="shrink-0 mt-0.5" />}
            
            <p className="flex-1 text-sm font-medium leading-tight">{toast.message}</p>
            
            <button onClick={() => removeToast(toast.id)} className="shrink-0 opacity-70 hover:opacity-100">
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const LoadingLayout = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-accent text-white px-4 py-3 rounded-xl flex justify-center items-center gap-3 animate-pulse shadow-md">
         <Loader2 className="animate-spin" size={20} />
         <span className="font-medium text-sm">Загрузка данных города Алматы...</span>
      </div>

      {/* KPI Cards Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-36 rounded-xl bg-card border border-border p-5 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-muted rounded-md animate-pulse"></div>
              <div className="h-5 w-16 bg-muted rounded-full animate-pulse"></div>
            </div>
            <div className="h-10 w-20 bg-muted rounded-md animate-pulse mt-4"></div>
            <div className="h-3 w-32 bg-muted rounded-md animate-pulse mt-auto"></div>
          </div>
        ))}
      </div>

      {/* Main Grid Skeletons */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="h-80 bg-card border border-border rounded-xl animate-pulse"></div>
             <div className="h-80 bg-card border border-border rounded-xl animate-pulse"></div>
          </div>
          <div className="h-64 bg-card border border-border rounded-xl animate-pulse"></div>
        </div>
        <div className="xl:col-span-1 h-[600px] xl:h-auto bg-card border border-border rounded-xl animate-pulse"></div>
      </div>
    </div>
  );
};

const DashboardContent = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>('transport');
  const { isInitialLoading } = useCityData();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {isInitialLoading ? (
            <LoadingLayout />
          ) : (
            <div className="max-w-7xl mx-auto">
              <div className="md:hidden flex gap-2 mb-4 overflow-x-auto pb-2">
                 <button 
                   onClick={() => setActiveModule('transport')}
                   className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeModule === 'transport' ? 'bg-accent text-white' : 'bg-muted'}`}
                 >
                   Транспорт
                 </button>
                 <button 
                   onClick={() => setActiveModule('ecology')}
                   className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeModule === 'ecology' ? 'bg-accent text-white' : 'bg-muted'}`}
                 >
                   Экология
                 </button>
              </div>

              <KPICards activeModule={activeModule} />
              
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-3">
                  <Charts activeModule={activeModule} />
                  <AIAnalysis />
                </div>
                
                <div className="xl:col-span-1 h-[600px] xl:h-auto">
                  <AlertsPanel />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <ToastManager />
    </div>
  );
};

function App() {
  return (
    <CityDataProvider>
      <DashboardContent />
    </CityDataProvider>
  );
}

export default App;
