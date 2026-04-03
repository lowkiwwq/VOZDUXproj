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
          <svg className="w-9 h-9 text-accent shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Wi-Fi lines */}
            <path d="M35 18C35 18 42.5 12 50 12C57.5 12 65 18 65 18" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
            <path d="M42 24C42 24 46 20 50 20C54 20 58 24 58 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="50" cy="31" r="3" fill="currentColor"/>
            {/* Buildings */}
            <rect x="28" y="55" width="12" height="35" fill="currentColor"/>
            <rect x="42" y="40" width="16" height="50" fill="currentColor"/>
            <rect x="60" y="50" width="12" height="40" fill="currentColor"/>
            {/* Overlay line and accent block */}
            <rect x="60" y="38" width="6" height="10" fill="#3b82f6"/>
            <path d="M42 45 L60 45" stroke="hsl(var(--card))" strokeWidth="3"/>
            <path d="M50 45 L50 90" stroke="hsl(var(--card))" strokeWidth="3"/>
          </svg>
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
