import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';

export type AlertSeverity = 'НОРМА' | 'ВНИМАНИЕ' | 'КРИТИЧНО';
export type ModuleType = 'transport' | 'ecology' | 'safety' | 'housing';
export type Language = 'ru' | 'en';

export interface TransportData {
  avgSpeed: number; // km/h
  congestionIndex: number; // %
  incidentCount: number;
  publicTransportDelay: number; // min
  trafficZones: { name: string; load: number }[];
  hourlySpeed: { time: string; speed: number }[];
}

export interface EcologyData {
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  co: number;
  windSpeed: number;
  windDir: string;
  humidity: number;
  temperature: number;
  aqiHistory: { day: string; aqi: number }[];
  stationReadings: { name: string; lat: number; lng: number; aqi: number }[];
}

export interface SafetyData {
  activeIncidents: number;
  responseTime: number;
  cameraOnline: number;
  patrolCoverage: number;
  incidentsByType: { type: string; count: number }[];
  incidentsByDistrict: { district: string; count: number }[];
  hourlyIncidents: { time: string; count: number }[];
  emergencyCallsToday: number;
  resolvedToday: number;
}

export interface HousingData {
  waterPressure: number;
  waterQuality: number;
  electricityLoad: number;
  heatingTemp: number;
  activeComplaints: number;
  resolvedToday: number;
  plannedWorks: number;
  emergencyWorks: number;
  servicesByType: { service: string; complaints: number; status: string }[];
  districtLoad: { district: string; waterPressure: number; electricLoad: number }[];
  weeklyComplaints: { day: string; complaints: number }[];
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  module: ModuleType;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'error' | 'info' | 'warning';
}

interface CityDataState {
  transport: TransportData;
  ecology: EcologyData;
  safety: SafetyData;
  housing: HousingData;
  alerts: Alert[];
  globalStatus: AlertSeverity;
  language: Language;
  setLanguage: (lang: Language) => void;
  geminiKey: string;
  setGeminiKey: (key: string) => void;
  waqiKey: string;
  setWaqiKey: (key: string) => void;
  tomtomKey: string;
  setTomtomKey: (key: string) => void;
  dismissAlert: (id: string) => void;
  toasts: ToastMessage[];
  addToast: (message: string, type: 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  isInitialLoading: boolean;
  isMockEcology: boolean;
  isMockTransport: boolean;
  lastUpdated: Date | null;
}

// ----- MOCK GENERATORS FOR FALLBACKS -----
const generateMockTransport = (): TransportData => ({
  avgSpeed: 24,
  congestionIndex: 72,
  incidentCount: 4,
  publicTransportDelay: 8,
  trafficZones: [
    { name: 'Алмалы', load: 85 },
    { name: 'Бостандык', load: 62 },
    { name: 'Медеу', load: 45 },
    { name: 'Ауэзов', load: 78 },
    { name: 'Жетысу', load: 55 },
    { name: 'Турксиб', load: 40 },
  ],
  hourlySpeed: [],
});

const generateMockEcology = (): EcologyData => ({
  aqi: 156,
  pm25: 68,
  pm10: 112,
  no2: 48,
  co: 3.2,
  windSpeed: 2.1,
  windDir: 'СВ',
  humidity: 42,
  temperature: -3,
  aqiHistory: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => ({
    day,
    aqi: 90 + Math.floor(Math.random() * 80)
  })),
  stationReadings: [
    { name: 'Станция 1', lat: 43.222, lng: 76.851, aqi: 156 },
    { name: 'Станция 2', lat: 43.238, lng: 76.928, aqi: 142 },
  ],
});

const generateMockSafety = (): SafetyData => {
  const hourlyIncidents = Array.from({ length: 24 }, (_, i) => {
    // peaks at 02:00-04:00 and 18:00-22:00
    let count = 2 + Math.floor(Math.random() * 3);
    if ((i >= 2 && i <= 4) || (i >= 18 && i <= 22)) count += 5 + Math.floor(Math.random() * 4);
    return { time: `${i.toString().padStart(2, '0')}:00`, count };
  });

  return {
    activeIncidents: 7,
    responseTime: 8.4,
    cameraOnline: 87,
    patrolCoverage: 74,
    emergencyCallsToday: 134,
    resolvedToday: 127,
    incidentsByType: [
      { type: "ДТП", count: 3 },
      { type: "Кража", count: 2 },
      { type: "Нарушение ПДД", count: 8 },
      { type: "Драка", count: 1 },
      { type: "Пожар", count: 1 },
    ],
    incidentsByDistrict: [
      { district: "Алмалы", count: 4 },
      { district: "Бостандык", count: 2 },
      { district: "Медеу", count: 1 },
      { district: "Ауэзов", count: 5 },
      { district: "Жетысу", count: 3 },
      { district: "Турксиб", count: 2 },
    ],
    hourlyIncidents
  };
};

const generateMockHousing = (): HousingData => ({
  waterPressure: 3.2,
  waterQuality: 94,
  electricityLoad: 68,
  heatingTemp: 71,
  activeComplaints: 23,
  resolvedToday: 41,
  plannedWorks: 5,
  emergencyWorks: 2,
  servicesByType: [
    { service: "Водоснабжение", complaints: 8, status: "норма" },
    { service: "Электроснабжение", complaints: 3, status: "норма" },
    { service: "Отопление", complaints: 6, status: "внимание" },
    { service: "Канализация", complaints: 4, status: "норма" },
    { service: "Лифты", complaints: 2, status: "норма" },
  ],
  districtLoad: [
    { district: "Алмалы", waterPressure: 3.1, electricLoad: 72 },
    { district: "Бостандык", waterPressure: 3.4, electricLoad: 65 },
    { district: "Медеу", waterPressure: 2.8, electricLoad: 58 },
    { district: "Ауэзов", waterPressure: 3.6, electricLoad: 78 },
    { district: "Жетысу", waterPressure: 3.2, electricLoad: 69 },
    { district: "Турксиб", waterPressure: 2.9, electricLoad: 74 },
  ],
  weeklyComplaints: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, i) => ({
    day,
    complaints: i === 0 ? 45 : 15 + Math.floor(Math.random() * 20),
  })),
});

// History Tracking
const MAX_HISTORY_POINTS = 288; // 24h at 5-min intervals
const getLocalHistory = <T,>(key: string): T[] => {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
};

const CityDataContext = createContext<CityDataState | null>(null);

export const CityDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [transport, setTransport] = useState<TransportData>(generateMockTransport());
  const [ecology, setEcology] = useState<EcologyData>(generateMockEcology());
  const [safety, setSafety] = useState<SafetyData>(generateMockSafety());
  const [housing, setHousing] = useState<HousingData>(generateMockHousing());

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [globalStatus, setGlobalStatus] = useState<AlertSeverity>('НОРМА');
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMockEcology, setIsMockEcology] = useState(false);
  const [isMockTransport, setIsMockTransport] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('almaty-pulse-lang') as Language) || 'ru');
  const [geminiKey, setGeminiKey] = useState<string>(() => localStorage.getItem('almaty-pulse-gemini-key') || import.meta.env.VITE_GEMINI_KEY || '');
  const [waqiKey, setWaqiKey] = useState<string>(() => localStorage.getItem('almaty-pulse-waqi-key') || import.meta.env.VITE_WAQI_TOKEN || '');
  const [tomtomKey, setTomtomKey] = useState<string>(() => localStorage.getItem('almaty-pulse-tomtom-key') || import.meta.env.VITE_TOMTOM_KEY || '');

  // Persist keys
  useEffect(() => { localStorage.setItem('almaty-pulse-lang', language); }, [language]);
  useEffect(() => { localStorage.setItem('almaty-pulse-gemini-key', geminiKey); }, [geminiKey]);
  useEffect(() => { localStorage.setItem('almaty-pulse-waqi-key', waqiKey); }, [waqiKey]);
  useEffect(() => { localStorage.setItem('almaty-pulse-tomtom-key', tomtomKey); }, [tomtomKey]);

  const addToast = useCallback((message: string, type: 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Histories
  const tomtomHistory = useRef<{time: string, speed: number, timestamp: number}[]>(getLocalHistory('tomtom_history_almaty'));

  if (tomtomHistory.current.length === 0) {
    const nowTm = Date.now();
    for (let i = 24; i >= 0; i--) {
      tomtomHistory.current.push({
        time: new Date(nowTm - i * 3600000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        speed: 20 + Math.random() * 15,
        timestamp: nowTm - i * 3600000
      });
    }
    try { localStorage.setItem('tomtom_history_almaty', JSON.stringify(tomtomHistory.current)); } catch {}
  }
  
  const downsampleHistoryLog = (arr: any[], maxPoints: number) => {
    if (arr.length <= maxPoints) return arr;
    const step = Math.ceil(arr.length / maxPoints);
    return arr.filter((_, idx) => idx % step === 0);
  };

  // ----- NOISE GENERATORS -----
  const applyNoise = (val: number, rangePercent = 0.05) => {
    const variation = val * (Math.random() * rangePercent * 2 - rangePercent);
    return Math.max(0, val + variation);
  };

  // ----- ALL MOCK TICK ENGINE (10s) -----
  const tickLocalMocks = useCallback(() => {
    // Ecology Mock
    setEcology(prev => ({
      ...prev,
      aqi: Math.min(300, applyNoise(prev.aqi, 0.05)),
      pm25: Math.min(150, applyNoise(prev.pm25, 0.05)),
      no2: Math.min(100, applyNoise(prev.no2, 0.05)),
      temperature: applyNoise(prev.temperature, 0.03) // slight temp change
    }));

    // Transport Mock
    setTransport(prev => {
      const baseSpeed = applyNoise(prev.avgSpeed, 0.05);
      const newCongestion = applyNoise(prev.congestionIndex, 0.05);
      
      const now = Date.now();
      const lastHist = tomtomHistory.current.length > 0 ? tomtomHistory.current[tomtomHistory.current.length-1].timestamp : 0;
      if (now - lastHist > 1000 * 60 * 5 || tomtomHistory.current.length === 0) {
         tomtomHistory.current.push({
           time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
           speed: baseSpeed,
           timestamp: now
         });
         if (tomtomHistory.current.length > MAX_HISTORY_POINTS) tomtomHistory.current.shift();
         localStorage.setItem('tomtom_history_almaty', JSON.stringify(tomtomHistory.current));
      }

      return {
        ...prev,
        avgSpeed: baseSpeed,
        congestionIndex: newCongestion,
        incidentCount: Math.max(0, Math.floor(newCongestion / 20) + (Math.random() > 0.8 ? 1 : 0)), // Add slight random incidents
        hourlySpeed: downsampleHistoryLog([...tomtomHistory.current], 24)
      };
    });

    // Safety Mock
    setSafety(prev => {
      const isSpike = Math.random() < 0.05; // 5% chance
      let newIncidents = prev.activeIncidents + (Math.random() > 0.5 ? 1 : -1);
      newIncidents = Math.max(0, newIncidents);
      
      let newResponseTime = applyNoise(prev.responseTime, 0.05);
      
      if (isSpike) {
        newIncidents = 20 + Math.floor(Math.random() * 5);
        newResponseTime = 25 + Math.random() * 5;
      }

      return {
        ...prev,
        activeIncidents: newIncidents,
        responseTime: newResponseTime,
        cameraOnline: Math.min(100, Math.max(0, applyNoise(prev.cameraOnline, 0.03))),
        patrolCoverage: Math.min(100, Math.max(0, applyNoise(prev.patrolCoverage, 0.03)))
      };
    });

    // Housing Mock
    setHousing(prev => {
      const isSpike = Math.random() < 0.05; // 5%
      let newLoad = applyNoise(prev.electricityLoad, 0.04);
      let newComplaints = prev.activeComplaints + (Math.random() > 0.5 ? Math.floor(Math.random() * 3) : -Math.floor(Math.random() * 3));
      newComplaints = Math.max(0, newComplaints);

      if (isSpike) {
        newLoad = 95 + Math.random() * 4;
        newComplaints = 70 + Math.floor(Math.random() * 15);
      }

      return {
        ...prev,
        waterPressure: Math.max(0, applyNoise(prev.waterPressure, 0.05)),
        electricityLoad: Math.min(100, Math.max(0, newLoad)),
        activeComplaints: newComplaints,
        heatingTemp: Math.max(0, applyNoise(prev.heatingTemp, 0.03)),
      };
    });

    setLastUpdated(new Date());
    setIsInitialLoading(false);
  }, []);

  // Interval execution logic
  useEffect(() => {
    tickLocalMocks(); // initialize
    setIsMockEcology(true);
    setIsMockTransport(true);
    const mockInterval = setInterval(tickLocalMocks, 10000); // 10s local ticks
    return () => clearInterval(mockInterval);
  }, [tickLocalMocks]);

  // Evaluate alerts universally
  useEffect(() => {
    const newAlerts: Alert[] = [];
    
    // Transport
    if (transport.avgSpeed > 0 && transport.avgSpeed < 20) newAlerts.push({ id: `t-speed-${Date.now()}`, severity: 'КРИТИЧНО', message: `Средняя скорость < 20 км/ч`, timestamp: new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}), module: 'transport' });
    else if (transport.avgSpeed > 0 && transport.avgSpeed < 35) newAlerts.push({ id: `t-speed-${Date.now()}`, severity: 'ВНИМАНИЕ', message: `Средняя скорость снижена`, timestamp: new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}), module: 'transport' });

    if (transport.congestionIndex > 80) newAlerts.push({ id: `t-cong-${Date.now()}`, severity: 'КРИТИЧНО', message: `Дорожная загруженность ${transport.congestionIndex.toFixed(0)}%`, timestamp: new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}), module: 'transport' });

    // Ecology
    if (ecology.aqi > 200) newAlerts.push({ id: `e-aqi-${Date.now()}`, severity: 'КРИТИЧНО', message: `Критический уровень качества воздуха`, timestamp: new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}), module: 'ecology' });
    else if (ecology.aqi > 100) newAlerts.push({ id: `e-aqi-${Date.now()}`, severity: 'ВНИМАНИЕ', message: `Воздух загрязнен (AQI > 100)`, timestamp: new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}), module: 'ecology' });

    // Safety
    if (safety.activeIncidents > 15) newAlerts.push({ id: `s-inc-c-${Date.now()}`, severity: 'КРИТИЧНО', message: `Множественные инциденты безопасности: ${safety.activeIncidents}`, timestamp: new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}), module: 'safety' });
    else if (safety.activeIncidents > 5) newAlerts.push({ id: `s-inc-w-${Date.now()}`, severity: 'ВНИМАНИЕ', message: `Повышенное кол-во инцидентов: ${safety.activeIncidents}`, timestamp: new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}), module: 'safety' });

    if (safety.responseTime > 20) newAlerts.push({ id: `s-rep-c-${Date.now()}`, severity: 'КРИТИЧНО', message: `Среднее время реагирования экстренных служб > 20 мин`, timestamp: new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}), module: 'safety' });
    
    if (safety.cameraOnline < 70) newAlerts.push({ id: `s-cam-c-${Date.now()}`, severity: 'КРИТИЧНО', message: `Онлайн камер наблюдения < 70%`, timestamp: new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}), module: 'safety' });

    // Housing
    if (housing.waterPressure < 1.5 || housing.waterPressure > 6) newAlerts.push({ id: `h-wat-c-${Date.now()}`, severity: 'КРИТИЧНО', message: `Давление воды вне нормы: ${housing.waterPressure.toFixed(1)} бар`, timestamp: new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}), module: 'housing' });
    
    if (housing.electricityLoad > 90) newAlerts.push({ id: `h-el-c-${Date.now()}`, severity: 'КРИТИЧНО', message: `Риск веерных отключений, нагрузка электросети ${housing.electricityLoad.toFixed(1)}%`, timestamp: new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}), module: 'housing' });
    
    if (housing.activeComplaints > 60) newAlerts.push({ id: `h-com-c-${Date.now()}`, severity: 'КРИТИЧНО', message: `Массовые жалобы ЖКХ: ${housing.activeComplaints}`, timestamp: new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}), module: 'housing' });
    else if (housing.activeComplaints > 30) newAlerts.push({ id: `h-com-w-${Date.now()}`, severity: 'ВНИМАНИЕ', message: `Повышенные жалобы жителей: ${housing.activeComplaints}`, timestamp: new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}), module: 'housing' });

    if (housing.heatingTemp < 55) newAlerts.push({ id: `h-heat-c-${Date.now()}`, severity: 'КРИТИЧНО', message: `Отказ системы теплоснабжения: ${housing.heatingTemp.toFixed(1)}°C`, timestamp: new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'}), module: 'housing' });

    setAlerts(newAlerts);

    if (newAlerts.some(a => a.severity === 'КРИТИЧНО')) setGlobalStatus('КРИТИЧНО');
    else if (newAlerts.some(a => a.severity === 'ВНИМАНИЕ')) setGlobalStatus('ВНИМАНИЕ');
    else setGlobalStatus('НОРМА');

  }, [transport, ecology, safety, housing]);

  const dismissAlert = (id: string) => setAlerts(prev => prev.filter(a => a.id !== id));

  return (
    <CityDataContext.Provider value={{
      transport, ecology, safety, housing, alerts, globalStatus, language, setLanguage,
      geminiKey, setGeminiKey, waqiKey, setWaqiKey, tomtomKey, setTomtomKey,
      dismissAlert, toasts, addToast, removeToast,
      isInitialLoading, isMockEcology, isMockTransport, lastUpdated
    }}>
      {children}
    </CityDataContext.Provider>
  );
};

export const useCityData = () => {
  const context = useContext(CityDataContext);
  if (!context) throw new Error('useCityData must be used within CityDataProvider');
  return context;
};
