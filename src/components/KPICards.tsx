import React, { useEffect, useState, useRef } from 'react';
import { useCityData, ModuleType, EcologyData, TransportData, SafetyData, HousingData } from '../hooks/useCityData';
import { motion } from 'framer-motion';
import { 
  Car, CarFront, AlertTriangle, Clock, 
  Wind, Thermometer, CloudFog, Factory,
  Camera, Shield, Droplets, Zap, MessageSquare
} from 'lucide-react';
import { cn } from '../lib/utils';

interface CardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  status: 'НОРМА' | 'ВНИМАНИЕ' | 'КРИТИЧНО';
  trend: number; // positive = up, negative = down
  isMock: boolean;
  lastUpdated: Date | null;
}

const KPICard = ({ title, value, unit, icon, status, trend, isMock, lastUpdated }: CardProps) => {
  const { language } = useCityData();
  const isCritical = status === 'КРИТИЧНО';
  
  const statusColors = {
    'НОРМА': 'border-l-norm text-norm',
    'ВНИМАНИЕ': 'border-l-alert text-alert',
    'КРИТИЧНО': 'border-l-destructive text-destructive'
  };

  const bgPulse = isCritical ? 'bg-destructive/5 animate-pulse-fast' : 'bg-card';
  const timeStr = lastUpdated ? lastUpdated.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border p-5 shadow-sm flex flex-col justify-between h-36 border-l-4",
        statusColors[status].split(' ')[0],
        bgPulse
      )}
    >
      {isMock && (
        <div className="absolute top-0 right-0 bg-alert text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg shadow-sm z-10 flex gap-1 items-center">
          ⚠ {language === 'ru' ? 'Демо-режим' : 'Mock data'}
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium text-muted-foreground flex gap-2 items-center">
          {icon} {title}
        </span>
        <span className={cn("text-xs font-bold px-2 py-1 rounded-full mt-1 sm:mt-0",
          status === 'КРИТИЧНО' ? 'bg-destructive/10 text-destructive' :
          status === 'ВНИМАНИЕ' ? 'bg-alert/10 text-alert' :
          'bg-norm/10 text-norm'
        )}>
          {status}
        </span>
      </div>
      
      <div className="flex flex-col mt-2">
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
          <span className="text-sm font-medium text-muted-foreground">{unit}</span>
        </div>
        <span className="text-[10px] text-muted-foreground opacity-50 font-medium mt-1">
          {language === 'ru' ? 'обновлено' : 'updated'} {timeStr}
        </span>
      </div>

      {trend !== 0 && (
        <div className="absolute bottom-4 right-6 text-xs font-semibold flex items-center gap-1">
          <span className={trend > 0 ? (status === 'КРИТИЧНО' ? 'text-destructive' : 'text-alert') : 'text-norm'}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </span>
        </div>
      )}
    </motion.div>
  );
};

export const KPICards: React.FC<{ activeModule: ModuleType }> = ({ activeModule }) => {
  const { transport, ecology, safety, housing, language, isMockEcology, isMockTransport, lastUpdated } = useCityData();
  
  const [prevT, setPrevT] = useState<TransportData>(transport);
  const [prevE, setPrevE] = useState<EcologyData>(ecology);
  const [prevS, setPrevS] = useState<SafetyData>(safety);
  const [prevH, setPrevH] = useState<HousingData>(housing);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setInterval(() => {
      setPrevT(transport);
      setPrevE(ecology);
      setPrevS(safety);
      setPrevH(housing);
    }, 60000); // 1 min previous window comparison
    return () => clearInterval(timer);
  }, [transport, ecology, safety, housing]);

  const calcTrend = (curr: number, prev: number) => {
    if (prev === 0) return 0;
    return ((curr - prev) / prev) * 100;
  };

  const getTransportCards = (): CardProps[] => {
    return [
      {
        title: language === 'ru' ? 'Средняя скорость' : 'Avg Speed',
        value: transport.avgSpeed.toFixed(0),
        unit: language === 'ru' ? 'км/ч' : 'km/h',
        icon: <Car size={16} />,
        status: transport.avgSpeed > 0 && transport.avgSpeed < 20 ? 'КРИТИЧНО' : transport.avgSpeed > 0 && transport.avgSpeed < 35 ? 'ВНИМАНИЕ' : 'НОРМА',
        trend: calcTrend(transport.avgSpeed, prevT.avgSpeed),
        isMock: isMockTransport,
        lastUpdated
      },
      {
        title: language === 'ru' ? 'Загруженность' : 'Congestion',
        value: transport.congestionIndex.toFixed(0),
        unit: '%',
        icon: <CarFront size={16} />,
        status: transport.congestionIndex > 80 ? 'КРИТИЧНО' : transport.congestionIndex > 50 ? 'ВНИМАНИЕ' : 'НОРМА',
        trend: calcTrend(transport.congestionIndex, prevT.congestionIndex),
        isMock: isMockTransport,
        lastUpdated
      },
      {
        title: language === 'ru' ? 'Инциденты' : 'Incidents',
        value: transport.incidentCount,
        unit: language === 'ru' ? 'акт.' : 'act.',
        icon: <AlertTriangle size={16} />,
        status: transport.incidentCount > 5 ? 'КРИТИЧНО' : transport.incidentCount > 2 ? 'ВНИМАНИЕ' : 'НОРМА',
        trend: calcTrend(transport.incidentCount, prevT.incidentCount),
        isMock: isMockTransport,
        lastUpdated
      },
      {
        title: language === 'ru' ? 'Задержка ОТ' : 'PT Delay',
        value: transport.publicTransportDelay.toFixed(0),
        unit: language === 'ru' ? 'мин' : 'min',
        icon: <Clock size={16} />,
        status: transport.publicTransportDelay > 15 ? 'КРИТИЧНО' : transport.publicTransportDelay > 5 ? 'ВНИМАНИЕ' : 'НОРМА',
        trend: calcTrend(transport.publicTransportDelay, prevT.publicTransportDelay),
        isMock: isMockTransport,
        lastUpdated
      }
    ];
  };

  const getEcologyCards = (): CardProps[] => {
    return [
      {
        title: 'Индекс AQI',
        value: ecology.aqi.toFixed(0),
        unit: '',
        icon: <Wind size={16} />,
        status: ecology.aqi > 200 ? 'КРИТИЧНО' : ecology.aqi > 100 ? 'ВНИМАНИЕ' : 'НОРМА',
        trend: calcTrend(ecology.aqi, prevE.aqi),
        isMock: isMockEcology,
        lastUpdated
      },
      {
        title: 'PM2.5',
        value: ecology.pm25.toFixed(1),
        unit: 'мкг/м³',
        icon: <CloudFog size={16} />,
        status: ecology.pm25 > 50 ? 'КРИТИЧНО' : ecology.pm25 > 25 ? 'ВНИМАНИЕ' : 'НОРМА',
        trend: calcTrend(ecology.pm25, prevE.pm25),
        isMock: isMockEcology,
        lastUpdated
      },
      {
        title: 'NO₂',
        value: ecology.no2.toFixed(1),
        unit: 'мкг/м³',
        icon: <Factory size={16} />,
        status: ecology.no2 > 40 ? 'ВНИМАНИЕ' : 'НОРМА',
        trend: calcTrend(ecology.no2, prevE.no2),
        isMock: isMockEcology,
        lastUpdated
      },
      {
        title: language === 'ru' ? 'Температура' : 'Temperature',
        value: ecology.temperature.toFixed(1),
        unit: '°C',
        icon: <Thermometer size={16} />,
        status: 'НОРМА',
        trend: calcTrend(ecology.temperature, prevE.temperature),
        isMock: isMockEcology, // Since temperature can fall back from meteo
        lastUpdated
      }
    ];
  };

  const getSafetyCards = (): CardProps[] => {
    return [
      {
        title: language === 'ru' ? 'Активные инциденты' : 'Active Incidents',
        value: safety.activeIncidents,
        unit: language === 'ru' ? 'шт.' : 'qty',
        icon: <AlertTriangle size={16} />,
        status: safety.activeIncidents > 15 ? 'КРИТИЧНО' : safety.activeIncidents >= 5 ? 'ВНИМАНИЕ' : 'НОРМА',
        trend: calcTrend(safety.activeIncidents, prevS.activeIncidents),
        isMock: true,
        lastUpdated
      },
      {
        title: language === 'ru' ? 'Реагирование' : 'Response Time',
        value: safety.responseTime.toFixed(1),
        unit: language === 'ru' ? 'мин' : 'min',
        icon: <Clock size={16} />,
        status: safety.responseTime > 20 ? 'КРИТИЧНО' : safety.responseTime > 10 ? 'ВНИМАНИЕ' : 'НОРМА',
        trend: calcTrend(safety.responseTime, prevS.responseTime),
        isMock: true,
        lastUpdated
      },
      {
        title: language === 'ru' ? 'Камеры онлайн' : 'Cameras Online',
        value: safety.cameraOnline.toFixed(0),
        unit: '%',
        icon: <Camera size={16} />,
        status: safety.cameraOnline < 70 ? 'КРИТИЧНО' : safety.cameraOnline < 90 ? 'ВНИМАНИЕ' : 'НОРМА',
        trend: calcTrend(safety.cameraOnline, prevS.cameraOnline),
        isMock: true,
        lastUpdated
      },
      {
        title: language === 'ru' ? 'Зона патрулей' : 'Patrol Coverage',
        value: safety.patrolCoverage.toFixed(0),
        unit: '%',
        icon: <Shield size={16} />,
        status: safety.patrolCoverage < 60 ? 'КРИТИЧНО' : safety.patrolCoverage < 80 ? 'ВНИМАНИЕ' : 'НОРМА',
        trend: calcTrend(safety.patrolCoverage, prevS.patrolCoverage),
        isMock: true,
        lastUpdated
      }
    ];
  };

  const getHousingCards = (): CardProps[] => {
    return [
      {
        title: language === 'ru' ? 'Давление воды' : 'Water Pressure',
        value: housing.waterPressure.toFixed(1),
        unit: language === 'ru' ? 'бар' : 'bar',
        icon: <Droplets size={16} />,
        status: (housing.waterPressure < 1.5 || housing.waterPressure > 6) ? 'КРИТИЧНО' : (housing.waterPressure < 2.5 || housing.waterPressure > 4.5) ? 'ВНИМАНИЕ' : 'НОРМА',
        trend: calcTrend(housing.waterPressure, prevH.waterPressure),
        isMock: true,
        lastUpdated
      },
      {
        title: language === 'ru' ? 'Нагрузка на сеть' : 'Electric Load',
        value: housing.electricityLoad.toFixed(0),
        unit: '%',
        icon: <Zap size={16} />,
        status: housing.electricityLoad > 90 ? 'КРИТИЧНО' : housing.electricityLoad > 75 ? 'ВНИМАНИЕ' : 'НОРМА',
        trend: calcTrend(housing.electricityLoad, prevH.electricityLoad),
        isMock: true,
        lastUpdated
      },
      {
        title: language === 'ru' ? 'Активные жалобы' : 'Complaints',
        value: housing.activeComplaints,
        unit: language === 'ru' ? 'заявок' : 'req',
        icon: <MessageSquare size={16} />,
        status: housing.activeComplaints > 60 ? 'КРИТИЧНО' : housing.activeComplaints > 30 ? 'ВНИМАНИЕ' : 'НОРМА',
        trend: calcTrend(housing.activeComplaints, prevH.activeComplaints),
        isMock: true,
        lastUpdated
      },
      {
        title: language === 'ru' ? 'Теплоноситель' : 'Heating Temp',
        value: housing.heatingTemp.toFixed(1),
        unit: '°C',
        icon: <Thermometer size={16} />,
        status: housing.heatingTemp < 55 ? 'КРИТИЧНО' : housing.heatingTemp < 65 ? 'ВНИМАНИЕ' : 'НОРМА',
        trend: calcTrend(housing.heatingTemp, prevH.heatingTemp),
        isMock: true,
        lastUpdated
      }
    ];
  };

  const renderCards = () => {
    switch (activeModule) {
      case 'safety': return getSafetyCards();
      case 'housing': return getHousingCards();
      case 'ecology': return getEcologyCards();
      case 'transport':
      default: return getTransportCards();
    }
  }

  const cards = renderCards();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => (
        <KPICard key={`${activeModule}-${idx}`} {...card} />
      ))}
    </div>
  );
};
