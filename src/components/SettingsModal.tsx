import React from 'react';
import { useCityData } from '../hooks/useCityData';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const KeyStatus = ({ value }: { value: string }) => {
  if (value.trim().length > 0) {
    return <CheckCircle2 size={16} className="text-norm absolute right-3 top-3" />;
  }
  return <XCircle size={16} className="text-destructive absolute right-3 top-3 opacity-50" />;
};

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { 
    geminiKey, setGeminiKey, 
    waqiKey, setWaqiKey, 
    tomtomKey, setTomtomKey, 
    language, setLanguage 
  } = useCityData();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card w-full max-w-md rounded-xl shadow-2xl p-6 relative border border-border"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
          
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            {language === 'ru' ? 'Настройки Системы' : 'System Settings'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Gemini API Key
              </label>
              <div className="relative">
                <input 
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-background border border-border text-foreground text-sm rounded-lg pr-10 focus:ring-accent focus:border-accent block p-2.5"
                />
                <KeyStatus value={geminiKey} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-accent hover:underline">Get Token</a>
              </p>
            </div>

            <div className="pt-2 border-t border-border">
              <label className="block text-sm font-medium mb-1">
                WAQI Token (Экология)
              </label>
              <div className="relative">
                <input 
                  type="password"
                  value={waqiKey}
                  onChange={(e) => setWaqiKey(e.target.value)}
                  placeholder="xxxxxxxxx"
                  className="w-full bg-background border border-border text-foreground text-sm rounded-lg pr-10 focus:ring-accent focus:border-accent block p-2.5"
                />
                <KeyStatus value={waqiKey} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                <a href="https://aqicn.org/data-platform/token/" target="_blank" rel="noreferrer" className="text-accent hover:underline">Get Token</a>
              </p>
            </div>

            <div className="pt-2 border-t border-border">
              <label className="block text-sm font-medium mb-1">
                TomTom API Key (Транспорт)
              </label>
              <div className="relative">
                <input 
                  type="password"
                  value={tomtomKey}
                  onChange={(e) => setTomtomKey(e.target.value)}
                  placeholder="xxxxxxxxx"
                  className="w-full bg-background border border-border text-foreground text-sm rounded-lg pr-10 focus:ring-accent focus:border-accent block p-2.5"
                />
                <KeyStatus value={tomtomKey} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 mb-2">
                <a href="https://developer.tomtom.com/" target="_blank" rel="noreferrer" className="text-accent hover:underline">Get Token</a>
              </p>
            </div>

            <div className="pt-2 border-t border-border">
              <label className="block text-sm font-medium mb-1">
                {language === 'ru' ? 'Язык интерфейса' : 'Interface Language'}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'ru' | 'en')}
                className="bg-background border border-border text-foreground text-sm rounded-lg focus:ring-accent focus:border-accent block w-full p-2.5"
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>

          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={onClose}
              className="bg-accent hover:bg-accent/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {language === 'ru' ? 'Закрыть' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
