import React from 'react';
import { Truck, Leaf, Shield, Building2, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { useCityData, ModuleType } from '../hooks/useCityData';

interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule: (m: ModuleType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
  const { language } = useCityData();
  const isEn = language === 'en';

  const navItems = [
    { id: 'transport' as ModuleType, label: isEn ? 'Transport' : 'Транспорт', icon: <Truck size={20} /> },
    { id: 'ecology' as ModuleType, label: isEn ? 'Ecology' : 'Экология', icon: <Leaf size={20} /> },
    { id: 'safety' as ModuleType, label: isEn ? 'Safety' : 'Безопасность', icon: <Shield size={20} /> },
    { id: 'housing' as ModuleType, label: isEn ? 'Housing & Utilities' : 'ЖКХ', icon: <Building2 size={20} /> },
    { id: 'reports' as ModuleType, label: isEn ? 'Reports' : 'Отчеты', icon: <FileText size={20} /> },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card hidden md:block">
      <div className="p-4">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-3">
          {isEn ? 'Modules' : 'Модули'}
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-accent text-white" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  );
};
