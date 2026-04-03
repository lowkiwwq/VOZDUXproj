import React, { useState, useEffect } from 'react';
import { useCityData } from '../hooks/useCityData';
import { Settings, Moon, Sun, Activity, Bot } from 'lucide-react';
import { SettingsModal } from './SettingsModal';

export const Header: React.FC = () => {
  const { globalStatus, language, isAdvisorOpen, setIsAdvisorOpen } = useCityData();
  const [time, setTime] = useState(new Date());
  const [isDark, setIsDark] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const getStatusBadge = () => {
    switch(globalStatus) {
      case 'КРИТИЧНО':
        return <div className="animate-pulse bg-destructive/20 text-destructive border border-destructive px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"><Activity size={16}/> {language === 'ru'? 'КРИТИЧНО' : 'CRITICAL'}</div>;
      case 'ВНИМАНИЕ':
        return <div className="bg-alert/20 text-alert border border-alert px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"><Activity size={16}/> {language === 'ru'? 'ВНИМАНИЕ' : 'WARNING'}</div>;
      default:
        return <div className="bg-norm/20 text-norm border border-norm px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"><Activity size={16}/> {language === 'ru'? 'НОРМА' : 'NORMAL'}</div>;
    }
  };

  return (
    <>
      <header className="h-16 px-6 border-b border-border bg-card flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">
            P
          </div>
          <h1 className="text-xl font-bold tracking-tight hidden sm:block">
            SmartCity KZ
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:block text-sm font-medium text-muted-foreground mr-4">
            {time.toLocaleDateString(language === 'en' ? 'en-US' : 'ru-RU')} • {time.toLocaleTimeString(language === 'en' ? 'en-US' : 'ru-RU')}
          </div>
          
          {getStatusBadge()}

          <div className="w-px h-6 bg-border mx-2"></div>

          <button onClick={toggleTheme} className="text-muted-foreground hover:text-foreground transition-colors mr-2">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button 
            onClick={() => setIsAdvisorOpen(!isAdvisorOpen)} 
            className={`transition-colors relative p-2 rounded-full ${isAdvisorOpen ? 'bg-accent/20 text-accent' : 'bg-muted/50 text-foreground hover:bg-accent/10 hover:text-accent'}`}
          >
            <Bot size={20} />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-accent rounded-full border-2 border-card animate-pulse-fast"></span>
          </button>
          <div className="w-px h-6 bg-border mx-2"></div>
          
          <button onClick={() => setIsSettingsOpen(true)} className="text-muted-foreground hover:text-foreground transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
