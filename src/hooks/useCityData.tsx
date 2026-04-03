import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';

export type AlertSeverity = 'НОРМА' | 'ВНИМАНИЕ' | 'КРИТИЧНО';
export type ModuleType = 'transport' | 'ecology' | 'safety' | 'housing' | 'reports';
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
  module: Omit<ModuleType, 'reports'>;
}

export interface ImpactMetrics {
  timeSavedMinutes?: number;
  moneySavedKZT?: number;
  co2Reduction?: number;
  citizenSatisfactionBoost?: number;
}

export interface Report {
  id: string;
  date: string;
  title: string;
  category: 'transport' | 'ecology' | 'housing' | 'safety';
  status: 'done' | 'processing' | 'archived';
  impact_metrics: ImpactMetrics;
  ai_summary: {
    incident: string;
    action: string;
    result: string;
  };
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
  isAdvisorOpen: boolean;
  setIsAdvisorOpen: (v: boolean) => void;
  problemZone: [number, number] | null;
  setProblemZone: (coords: [number, number] | null) => void;
  applyScenario: (query: string) => void;
  reports: Report[];
  addReport: (report: Report) => void;
}

const generateMockTransport = (lang: string = 'ru'): TransportData => {
  const isEn = lang === 'en';
  return {
    avgSpeed: 24,
    congestionIndex: 72,
    incidentCount: 4,
    publicTransportDelay: 8,
    trafficZones: [
      { name: isEn ? 'Almaly' : 'Алмалы', load: 85 },
      { name: isEn ? 'Bostandyk' : 'Бостандык', load: 62 },
      { name: isEn ? 'Medeu' : 'Медеу', load: 45 },
      { name: isEn ? 'Auezov' : 'Ауэзов', load: 78 },
      { name: isEn ? 'Zhetysu' : 'Жетысу', load: 55 },
      { name: isEn ? 'Turksib' : 'Турксиб', load: 40 },
    ],
    hourlySpeed: [],
  };
};

const generateMockEcology = (lang: string = 'ru'): EcologyData => {
  const isEn = lang === 'en';
  return {
    aqi: 156,
    pm25: 68,
    pm10: 112,
    no2: 48,
    co: 3.2,
    windSpeed: 2.1,
    windDir: isEn ? 'NE' : 'СВ',
    humidity: 42,
    temperature: -3,
    aqiHistory: (isEn ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']).map(day => ({
      day,
      aqi: 90 + Math.floor(Math.random() * 80)
    })),
    stationReadings: [
      { name: isEn ? 'Station 1' : 'Станция 1', lat: 43.222, lng: 76.851, aqi: 156 },
      { name: isEn ? 'Station 2' : 'Станция 2', lat: 43.238, lng: 76.928, aqi: 142 },
    ],
  };
};

const generateMockSafety = (lang: string = 'ru'): SafetyData => {
  const isEn = lang === 'en';
  const hourlyIncidents = Array.from({ length: 24 }, (_, i) => {
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
      { type: isEn ? "Car accident" : "ДТП", count: 3 },
      { type: isEn ? "Theft" : "Кража", count: 2 },
      { type: isEn ? "Traffic rules" : "Нарушение ПДД", count: 8 },
      { type: isEn ? "Fight" : "Драка", count: 1 },
      { type: isEn ? "Fire" : "Пожар", count: 1 },
    ],
    incidentsByDistrict: [
      { district: isEn ? 'Almaly' : 'Алмалы', count: 4 },
      { district: isEn ? 'Bostandyk' : 'Бостандык', count: 2 },
      { district: isEn ? 'Medeu' : 'Медеу', count: 1 },
      { district: isEn ? 'Auezov' : 'Ауэзов', count: 5 },
      { district: isEn ? 'Zhetysu' : 'Жетысу', count: 3 },
      { district: isEn ? 'Turksib' : 'Турксиб', count: 2 },
    ],
    hourlyIncidents
  };
};

const generateMockHousing = (lang: string = 'ru'): HousingData => {
  const isEn = lang === 'en';
  return {
    waterPressure: 3.2,
    waterQuality: 94,
    electricityLoad: 68,
    heatingTemp: 71,
    activeComplaints: 23,
    resolvedToday: 41,
    plannedWorks: 5,
    emergencyWorks: 2,
    servicesByType: [
      { service: isEn ? "Water supply" : "Водоснабжение", complaints: 8, status: isEn ? "ok" : "норма" },
      { service: isEn ? "Electricity" : "Электроснабжение", complaints: 3, status: isEn ? "ok" : "норма" },
      { service: isEn ? "Heating" : "Отопление", complaints: 6, status: isEn ? "warning" : "внимание" },
      { service: isEn ? "Sewerage" : "Канализация", complaints: 4, status: isEn ? "ok" : "норма" },
      { service: isEn ? "Elevators" : "Лифты", complaints: 2, status: isEn ? "ok" : "норма" },
    ],
    districtLoad: [
      { district: isEn ? 'Almaly' : 'Алмалы', waterPressure: 3.1, electricLoad: 72 },
      { district: isEn ? 'Bostandyk' : 'Бостандык', waterPressure: 3.4, electricLoad: 65 },
      { district: isEn ? 'Medeu' : 'Медеу', waterPressure: 2.8, electricLoad: 58 },
      { district: isEn ? 'Auezov' : 'Ауэзов', waterPressure: 3.6, electricLoad: 78 },
      { district: isEn ? 'Zhetysu' : 'Жетысу', waterPressure: 3.2, electricLoad: 69 },
      { district: isEn ? 'Turksib' : 'Турксиб', waterPressure: 2.9, electricLoad: 74 },
    ],
    weeklyComplaints: (isEn ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']).map((day, i) => ({
      day,
      complaints: i === 0 ? 45 : 15 + Math.floor(Math.random() * 20),
    })),
  };
};

const generateMockReports = (lang: string = 'ru'): Report[] => {
  const isEn = lang === 'en';
  return [
    {
      id: `rep-1-${Date.now()}`,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      title: isEn ? "Elimination of congestion on Al-Farabi Ave" : "Ликвидация затора на Аль-Фараби",
      category: 'transport',
      status: 'done',
      impact_metrics: { timeSavedMinutes: 45, moneySavedKZT: 1250000, citizenSatisfactionBoost: 8 },
      ai_summary: {
        incident: isEn ? "Accident blocked 2 lanes triggering 5km traffic jam." : "ДТП заблокировало 2 полосы, вызвав пробку 5 км.",
        action: isEn ? "Redirected traffic via alternative routes, adjusted smart traffic lights." : "Перенаправление потока через альт. маршруты, корректировка умных светофоров.",
        result: isEn ? "-35% congestion index within 20 mins." : "Снижение затора на 35% в течение 20 минут."
      }
    },
    {
      id: `rep-2-${Date.now()}`,
      date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      title: isEn ? "Optimized Heat Distribution" : "Оптимизация подачи тепла в Алмалинском",
      category: 'housing',
      status: 'done',
      impact_metrics: { moneySavedKZT: 450000, citizenSatisfactionBoost: 12 },
      ai_summary: {
        incident: isEn ? "Massive temperature drops reported." : "Массовые жалобы на снижение температуры в домах.",
        action: isEn ? "Increased boiler output and equalized pressure automatically." : "Увеличение мощности котельной и эквализация давления.",
        result: isEn ? "150 complaints resolved automatically." : "150 жалоб закрыто автоматически."
      }
    }
  ];
}

// History Tracking
const MAX_HISTORY_POINTS = 288; // 24h at 5-min intervals
const getLocalHistory = <T,>(key: string): T[] => {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
};

const CityDataContext = createContext<CityDataState | null>(null);

export const CityDataProvider = ({ children }: { children: React.ReactNode }) => {
  const defaultLang = (localStorage.getItem('almaty-pulse-lang') as Language) || 'ru';
  const [language, setLanguage] = useState<Language>(defaultLang);
  
  const [transport, setTransport] = useState<TransportData>(generateMockTransport(defaultLang));
  const [ecology, setEcology] = useState<EcologyData>(generateMockEcology(defaultLang));
  const [safety, setSafety] = useState<SafetyData>(generateMockSafety(defaultLang));
  const [housing, setHousing] = useState<HousingData>(generateMockHousing(defaultLang));
  const [reports, setReports] = useState<Report[]>(() => {
    try {
      const stored = localStorage.getItem('almaty-pulse-reports');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return generateMockReports(defaultLang);
  });

  useEffect(() => {
    localStorage.setItem('almaty-pulse-reports', JSON.stringify(reports));
  }, [reports]);

  const addReport = useCallback((report: Report) => {
    setReports(prev => [report, ...prev]);
  }, []);

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [globalStatus, setGlobalStatus] = useState<AlertSeverity>('НОРМА');
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMockEcology, setIsMockEcology] = useState(false);
  const [isMockTransport, setIsMockTransport] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [problemZone, setProblemZone] = useState<[number, number] | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [geminiKey, setGeminiKey] = useState<string>(() => localStorage.getItem('almaty-pulse-gemini-key') || import.meta.env.VITE_GEMINI_KEY || '');
  const [waqiKey, setWaqiKey] = useState<string>(() => localStorage.getItem('almaty-pulse-waqi-key') || import.meta.env.VITE_WAQI_TOKEN || '');
  const [tomtomKey, setTomtomKey] = useState<string>(() => localStorage.getItem('almaty-pulse-tomtom-key') || import.meta.env.VITE_TOMTOM_KEY || '');

  // Persist keys and regenerate mock dependencies dynamically
  useEffect(() => { 
    localStorage.setItem('almaty-pulse-lang', language); 
    // Translate mock states on the fly if user clicks language switcher
    setTransport(prev => ({...generateMockTransport(language), ...prev, trafficZones: generateMockTransport(language).trafficZones }));
    setEcology(prev => ({...generateMockEcology(language), ...prev, aqiHistory: generateMockEcology(language).aqiHistory }));
    setSafety(prev => ({...generateMockSafety(language), ...prev, incidentsByType: generateMockSafety(language).incidentsByType, incidentsByDistrict: generateMockSafety(language).incidentsByDistrict }));
    setHousing(prev => ({...generateMockHousing(language), ...prev, servicesByType: generateMockHousing(language).servicesByType, districtLoad: generateMockHousing(language).districtLoad, weeklyComplaints: generateMockHousing(language).weeklyComplaints }));
  }, [language]);
  
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

  const applyScenario = useCallback((query: string) => {
    if (query.toLowerCase().includes('абая')) {
      setProblemZone([43.238, 76.928]);
      addToast(language === 'ru' ? 'Применен сценарий: Ограничения на Абая' : 'Scenario applied: Abay ave restrictions', 'warning');
      setTransport(prev => ({
        ...prev,
        congestionIndex: Math.min(100, prev.congestionIndex + 25),
        avgSpeed: Math.max(5, prev.avgSpeed - 10)
      }));
    } else if (query.toLowerCase().includes('смог')) {
      addToast(language === 'ru' ? 'Изменение метеоусловий активировано' : 'Weather simulation activated', 'warning');
      setEcology(prev => ({ ...prev, aqi: Math.min(300, prev.aqi + 80), pm25: prev.pm25 + 40 }));
    } else {
      setProblemZone(null);
      addToast(language === 'ru' ? `Сценарий обновления среды запущен` : `Environment update triggered`, 'info');
    }
  }, [addToast, language]);

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
    // OpenWeatherMap Fetch
    if (waqiKey && waqiKey.length > 5) {
      fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=43.2567&lon=76.9286&appid=${waqiKey}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.list && data.list.length > 0) {
            const main = data.list[0].main;
            const components = data.list[0].components;
            const aqiMap: Record<number, number> = { 1: 30, 2: 70, 3: 130, 4: 180, 5: 250 };
            setEcology(prev => ({
              ...prev,
              aqi: aqiMap[main.aqi] || 50,
              pm25: components.pm2_5,
              pm10: components.pm10,
              no2: components.no2,
              co: components.co
            }));
            setIsMockEcology(false);
          }
        })
        .catch(console.error);
    } else {
      setIsMockEcology(true);
    }
  }, [waqiKey]);

  useEffect(() => {
    const newAlerts: Alert[] = [];
    const isEn = language === 'en';
    const tsFormat = isEn ? 'en-US' : 'ru-RU';
    const timeStr = new Date().toLocaleTimeString(tsFormat, {hour: '2-digit', minute: '2-digit'});
    
    // Transport
    if (transport.avgSpeed > 0 && transport.avgSpeed < 20) newAlerts.push({ id: `t-speed-${Date.now()}`, severity: 'КРИТИЧНО', message: isEn ? `Average speed < 20 km/h` : `Средняя скорость < 20 км/ч`, timestamp: timeStr, module: 'transport' });
    else if (transport.avgSpeed > 0 && transport.avgSpeed < 35) newAlerts.push({ id: `t-speed-${Date.now()}`, severity: 'ВНИМАНИЕ', message: isEn ? `Slow traffic flow` : `Средняя скорость снижена`, timestamp: timeStr, module: 'transport' });

    if (transport.congestionIndex > 80) newAlerts.push({ id: `t-cong-${Date.now()}`, severity: 'КРИТИЧНО', message: isEn ? `Traffic congestion ${transport.congestionIndex.toFixed(0)}%` : `Дорожная загруженность ${transport.congestionIndex.toFixed(0)}%`, timestamp: timeStr, module: 'transport' });

    // Ecology
    if (ecology.aqi > 200) newAlerts.push({ id: `e-aqi-${Date.now()}`, severity: 'КРИТИЧНО', message: isEn ? `Hazardous air quality levels` : `Критический уровень качества воздуха`, timestamp: timeStr, module: 'ecology' });
    else if (ecology.aqi > 100) newAlerts.push({ id: `e-aqi-${Date.now()}`, severity: 'ВНИМАНИЕ', message: isEn ? `Poor air quality (AQI > 100)` : `Воздух загрязнен (AQI > 100)`, timestamp: timeStr, module: 'ecology' });

    // Safety
    if (safety.activeIncidents > 15) newAlerts.push({ id: `s-inc-c-${Date.now()}`, severity: 'КРИТИЧНО', message: isEn ? `Multiple ongoing security incidents: ${safety.activeIncidents}` : `Множественные инциденты безопасности: ${safety.activeIncidents}`, timestamp: timeStr, module: 'safety' });
    else if (safety.activeIncidents > 5) newAlerts.push({ id: `s-inc-w-${Date.now()}`, severity: 'ВНИМАНИЕ', message: isEn ? `Elevated incident count: ${safety.activeIncidents}` : `Повышенное кол-во инцидентов: ${safety.activeIncidents}`, timestamp: timeStr, module: 'safety' });

    if (safety.responseTime > 20) newAlerts.push({ id: `s-rep-c-${Date.now()}`, severity: 'КРИТИЧНО', message: isEn ? `High emergency response delay > 20 min` : `Среднее время реагирования экстренных служб > 20 мин`, timestamp: timeStr, module: 'safety' });
    
    if (safety.cameraOnline < 70) newAlerts.push({ id: `s-cam-c-${Date.now()}`, severity: 'КРИТИЧНО', message: isEn ? `CCTV online status < 70%` : `Онлайн камер наблюдения < 70%`, timestamp: timeStr, module: 'safety' });

    // Housing
    if (housing.waterPressure < 1.5 || housing.waterPressure > 6) newAlerts.push({ id: `h-wat-c-${Date.now()}`, severity: 'КРИТИЧНО', message: isEn ? `Abnormal water pressure: ${housing.waterPressure.toFixed(1)} bar` : `Давление воды вне нормы: ${housing.waterPressure.toFixed(1)} бар`, timestamp: timeStr, module: 'housing' });
    
    if (housing.electricityLoad > 90) newAlerts.push({ id: `h-el-c-${Date.now()}`, severity: 'КРИТИЧНО', message: isEn ? `High power grid load ${housing.electricityLoad.toFixed(1)}%` : `Риск веерных отключений, нагрузка электросети ${housing.electricityLoad.toFixed(1)}%`, timestamp: timeStr, module: 'housing' });
    
    if (housing.activeComplaints > 60) newAlerts.push({ id: `h-com-c-${Date.now()}`, severity: 'КРИТИЧНО', message: isEn ? `Mass utility complaints spike: ${housing.activeComplaints}` : `Массовые жалобы ЖКХ: ${housing.activeComplaints}`, timestamp: timeStr, module: 'housing' });
    else if (housing.activeComplaints > 30) newAlerts.push({ id: `h-com-w-${Date.now()}`, severity: 'ВНИМАНИЕ', message: isEn ? `Elevated utility complaints: ${housing.activeComplaints}` : `Повышенные жалобы жителей: ${housing.activeComplaints}`, timestamp: timeStr, module: 'housing' });

    if (housing.heatingTemp < 55) newAlerts.push({ id: `h-heat-c-${Date.now()}`, severity: 'КРИТИЧНО', message: isEn ? `Central heating supply failure: ${housing.heatingTemp.toFixed(1)}°C` : `Отказ системы теплоснабжения: ${housing.heatingTemp.toFixed(1)}°C`, timestamp: timeStr, module: 'housing' });

    setAlerts(newAlerts);

    if (newAlerts.some(a => a.severity === 'КРИТИЧНО')) setGlobalStatus('КРИТИЧНО');
    else if (newAlerts.some(a => a.severity === 'ВНИМАНИЕ')) setGlobalStatus('ВНИМАНИЕ');
    else setGlobalStatus('НОРМА');

  }, [transport, ecology, safety, housing, language]);

  const dismissAlert = (id: string) => setAlerts(prev => prev.filter(a => a.id !== id));

  return (
    <CityDataContext.Provider value={{
      transport, ecology, safety, housing, alerts, globalStatus, language, setLanguage,
      geminiKey, setGeminiKey, waqiKey, setWaqiKey, tomtomKey, setTomtomKey,
      dismissAlert, toasts, addToast, removeToast,
      isInitialLoading, isMockEcology, isMockTransport, lastUpdated,
      isAdvisorOpen, setIsAdvisorOpen, problemZone, setProblemZone, applyScenario,
      reports, addReport
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
