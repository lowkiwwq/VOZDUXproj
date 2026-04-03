import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Map as MapIcon } from 'lucide-react';
import { useCityData, ModuleType, TransportData, EcologyData, SafetyData, HousingData } from '../hooks/useCityData';

// --- Types ---
interface CityMapProps {
  activeModule: ModuleType;
  data: {
    transport: TransportData;
    ecology: EcologyData;
    safety: SafetyData;
    housing: HousingData;
    lastUpdated: Date | null;
    problemZone?: [number, number] | null;
  };
}

// Custom dark mode tile layer handling
const ThemeAwareTileLayer = () => {
  return (
    <div className="map-tiles-container">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        minZoom={10}
        maxZoom={17}
      />
    </div>
  );
};

// Legends
const TransportLegend = ({ isEn }: { isEn: boolean }) => (
  <div className="flex gap-4 text-xs text-muted-foreground mt-3 items-center flex-wrap">
    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-norm"></span> {isEn ? 'Clear (<50%)' : 'Свободно (<50%)'}</div>
    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-alert"></span> {isEn ? 'Busy (50-79%)' : 'Загружено (50-79%)'}</div>
    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-critical"></span> {isEn ? 'Traffic Jam (≥80%)' : 'Пробки (≥80%)'}</div>
  </div>
);

const EcologyLegend = ({ isEn }: { isEn: boolean }) => (
  <div className="flex gap-4 text-xs text-muted-foreground mt-3 items-center flex-wrap">
    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span> {isEn ? 'Good (<50)' : 'Хорошо (<50)'}</div>
    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span> {isEn ? 'Moderate (50-100)' : 'Умеренно (50-100)'}</div>
    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span> {isEn ? 'Unhealthy (>100)' : 'Вредно (>100)'}</div>
    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]"></span> {isEn ? 'Hazardous (>200)' : 'Опасно (>200)'}</div>
  </div>
);

const SafetyLegend = ({ isEn }: { isEn: boolean }) => (
  <div className="flex gap-4 text-xs text-muted-foreground mt-3 items-center flex-wrap">
    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span> {isEn ? 'Calm (<2)' : 'Спокойно (<2)'}</div>
    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span> {isEn ? 'Warning (2-4)' : 'Внимание (2-4)'}</div>
    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span> {isEn ? 'Critical (>4)' : 'Критично (>4)'}</div>
  </div>
);

const HousingLegend = ({ isEn }: { isEn: boolean }) => (
  <div className="flex gap-4 text-xs text-muted-foreground mt-3 items-center flex-wrap">
    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span> {isEn ? 'Normal' : 'Норма'}</div>
    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span> {isEn ? 'Warning' : 'Внимание'}</div>
    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span> {isEn ? 'Critical' : 'Критично'}</div>
  </div>
);


// Map Resizer hook to prevent initial grey rendering issue when map is initially hidden
const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    // Delay ensures parent has time to calculate dimensions
    setTimeout(() => {
      map.invalidateSize();
    }, 250);
  }, [map]);
  return null;
}


// --- Modules ---
// 1. Transport Map
const TransportView = ({ tomtomKey }: { tomtomKey?: string }) => {


  return (
    <>
      {tomtomKey && tomtomKey.length > 5 && (
         <TileLayer 
            url={`https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key=${tomtomKey}`} 
            opacity={0.8} 
            zIndex={10} 
         />
      )}
    </>
  );
};


// 2. Ecology Map
const EcologyView = ({ data }: { data: EcologyData }) => {
  const stations = [
    { name: 'Бостандыкский', coords: [43.2489, 76.8982] as [number, number] },
    { name: 'Алмалинский', coords: [43.2712, 76.9387] as [number, number] },
    { name: 'Медеуский', coords: [43.1968, 77.0012] as [number, number] },
    { name: 'Ауэзовский', coords: [43.2834, 76.8654] as [number, number] },
    { name: 'Жетысуский', coords: [43.3021, 76.9876] as [number, number] }
  ];

  const getColor = (aqi: number) => {
    if (aqi < 50) return '#10B981';
    if (aqi <= 100) return '#F59E0B';
    if (aqi <= 200) return '#EF4444';
    return '#7C3AED';
  };

  return (
    <>
      {stations.map((station, idx) => {
        // Vary AQI slightly based on station index for mock visual variance
        const stationAqi = Math.max(0, data.aqi + (idx * 15 - 30));
        
        return (
          <React.Fragment key={station.name}>
             <Circle 
               center={station.coords} 
               radius={1500} 
               pathOptions={{ color: 'transparent', fillColor: getColor(stationAqi), fillOpacity: 0.15 }}
             />
             <CircleMarker
                center={station.coords}
                radius={12}
                pathOptions={{ color: 'white', weight: 2, fillColor: getColor(stationAqi), fillOpacity: 1 }}
              >
                <Popup>
                  <div className="p-1 min-w-[140px]">
                    <div className="font-bold mb-1 pb-1 border-b text-sm">{station.name}</div>
                    <div className="text-xs space-y-1 mt-2">
                       <div className="flex items-center justify-between">
                         <span>AQI:</span> 
                         <span className="font-bold text-sm" style={{color: getColor(stationAqi)}}>{Math.round(stationAqi)}</span>
                       </div>
                       <div className="flex justify-between"><span>PM2.5:</span> <span>{Math.round(data.pm25)}</span></div>
                       <div className="flex justify-between"><span>PM10:</span> <span>{Math.round(data.pm10)}</span></div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
          </React.Fragment>
        );
      })}
    </>
  );
};


// 3. Safety Map
const SafetyView = ({ data }: { data: SafetyData }) => {
  const incidents = [
    { name: 'Алмалинский', coords: [43.2712, 76.9387] as [number, number], count: 4 },
    { name: 'Бостандыкский', coords: [43.2489, 76.8982] as [number, number], count: 2 },
    { name: 'Медеуский', coords: [43.1968, 77.0012] as [number, number], count: 1 },
    { name: 'Ауэзовский', coords: [43.2834, 76.8654] as [number, number], count: 5 },
    { name: 'Жетысуский', coords: [43.3021, 76.9876] as [number, number], count: 3 },
    { name: 'Турксибский', coords: [43.3198, 76.9543] as [number, number], count: 2 }
  ];

  const policeStations = [
    { name: 'Центральный РОВД', coords: [43.2598, 76.9421] as [number, number] },
    { name: 'РОВД Бостандык', coords: [43.2401, 76.8876] as [number, number] }
  ];

  const getIncidentColor = (count: number) => {
    if (count < 2) return '#10B981';
    if (count <= 4) return '#F59E0B';
    return '#EF4444';
  };

  const createIncidentIcon = (count: number, color: string) => {
    return L.divIcon({
      className: 'custom-incident-icon',
      html: `<div style="background-color: ${color}; color: white; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid white; font-weight: bold; font-size: 13px;">${count}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  };

  const shieldIcon = L.divIcon({
    className: 'police-station-icon',
    html: `<div style="font-size: 24px;">🏛️</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const patrolIcon = L.divIcon({
    className: 'patrol-icon',
    html: `<div style="font-size: 20px;">🚔</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  // some hardcoded patrols relative to stations
  const patrols = [
    { name: 'Патруль 1', coords: [43.2620, 76.9450] as [number, number] },
    { name: 'Патруль 2', coords: [43.2380, 76.8900] as [number, number] }
  ];

  return (
    <>
      {incidents.map(inc => (
         <Marker key={inc.name} position={inc.coords} icon={createIncidentIcon(inc.count, getIncidentColor(inc.count))}>
           <Popup>
             <div className="p-1 min-w-[140px]">
                <div className="font-bold mb-1 pb-1 border-b text-sm">{inc.name}</div>
                <div className="text-xs space-y-1 mt-2">
                   <div className="flex justify-between text-muted-foreground mb-2">
                     <span>Всего происшествий:</span> 
                     <span className="font-bold text-foreground">{inc.count}</span>
                   </div>
                   <div className="pl-2 border-l-2 border-muted space-y-1 mb-2">
                     {data.incidentsByType.slice(0, 2).map(t => (
                       <div key={t.type} className="flex justify-between opacity-80">
                         <span>{t.type}</span><span>{Math.ceil(t.count / 3)}</span>
                       </div>
                     ))}
                   </div>
                   <div className="flex justify-between pt-1 border-t text-[10px]">
                     <span>Ближайший патруль:</span> <span className="font-medium text-blue-500">3 мин</span>
                   </div>
                </div>
             </div>
           </Popup>
         </Marker>
      ))}

      {policeStations.map(ps => (
        <Marker key={ps.name} position={ps.coords} icon={shieldIcon}>
          <Popup><div className="text-sm font-bold text-center px-2">{ps.name}</div></Popup>
        </Marker>
      ))}

      {patrols.map(pt => (
        <Marker key={pt.name} position={pt.coords} icon={patrolIcon}>
          <Popup><div className="text-xs font-bold text-center">{pt.name}</div></Popup>
        </Marker>
      ))}
    </>
  );
};


// 4. Housing Map
const HousingView = ({ data }: { data: HousingData }) => {
  const districts = [
    { name: 'Алмалинский', coords: [43.2712, 76.9387] as [number, number], worstStatus: 'внимание' },
    { name: 'Бостандыкский', coords: [43.2489, 76.8982] as [number, number], worstStatus: 'норма' },
    { name: 'Медеуский', coords: [43.1968, 77.0012] as [number, number], worstStatus: 'норма' },
    { name: 'Ауэзовский', coords: [43.2834, 76.8654] as [number, number], worstStatus: 'критично' },
    { name: 'Жетысуский', coords: [43.3021, 76.9876] as [number, number], worstStatus: 'внимание' },
    { name: 'Турксибский', coords: [43.3198, 76.9543] as [number, number], worstStatus: 'норма' }
  ];

  const objects = [
    { name: 'ТЭЦ-2', coords: [43.2134, 76.8932] as [number, number], icon: '🔥' },
    { name: 'Водоканал', coords: [43.3087, 76.9234] as [number, number], icon: '💧' },
    { name: 'Подстанция ГЭС', coords: [43.2756, 77.0123] as [number, number], icon: '⚡' }
  ];

  const getDistrictColor = (status: string) => {
    if (status === 'норма') return '#10B981';
    if (status === 'внимание') return '#F59E0B';
    return '#EF4444';
  };

  const createSquareIcon = (color: string) => {
    return L.divIcon({
      className: 'district-status-icon',
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 4px; border: 2px solid white; opacity: 0.9;"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  const createEmojiIcon = (emoji: string) => {
    return L.divIcon({
      className: 'facility-icon',
      html: `<div style="font-size: 20px;">${emoji}</div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  return (
    <>
      {districts.map(dst => (
        <Marker key={dst.name} position={dst.coords} icon={createSquareIcon(getDistrictColor(dst.worstStatus))}>
          <Popup>
             <div className="p-1 min-w-[140px]">
                <div className="font-bold mb-1 pb-1 border-b text-sm">{dst.name}</div>
                <div className="text-xs space-y-1 mt-2">
                   <div className="flex justify-between"><span>Давление воды:</span> <span className="font-medium">{data.waterPressure.toFixed(1)} бар</span></div>
                   <div className="flex justify-between"><span>Нагрузка сети:</span> <span className="font-medium">{Math.round(data.electricityLoad)}%</span></div>
                   <div className="flex justify-between"><span>Жалоб сегодня:</span> <span className="font-medium">{Math.floor(data.activeComplaints / 6)}</span></div>
                   <div className="flex justify-between"><span>Отопление:</span> <span className="font-medium">{Math.round(data.heatingTemp)}°C</span></div>
                </div>
             </div>
          </Popup>
        </Marker>
      ))}

      {objects.map(obj => (
        <Marker key={obj.name} position={obj.coords} icon={createEmojiIcon(obj.icon)}>
          <Popup><div className="text-xs font-bold text-center px-1">{obj.name}</div></Popup>
        </Marker>
      ))}
    </>
  );
};


// --- Main Component ---
const ProblemZoneMarker = ({ coords, isEn }: { coords: [number, number], isEn: boolean }) => {
  return (
    <CircleMarker 
      center={coords} 
      radius={25} 
      pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.4 }}
      className="animate-pulse-slow"
    >
      <Popup>{isEn ? 'Priority response zone / Problem area' : 'Зона приоритетного реагирования / Проблемный участок'}</Popup>
    </CircleMarker>
  );
};

export const CityMap = ({ activeModule, data }: CityMapProps) => {
  const { tomtomKey, language } = useCityData();
  const isEn = language === 'en';

  return (
    <div className="mt-6 bg-card border border-border rounded-md p-5 overflow-hidden flex flex-col">
       <div className="flex items-center gap-2 mb-4">
         <MapIcon size={20} className="text-primary" />
         <h2 className="text-lg font-bold">{isEn ? 'City Map' : 'Карта города'}</h2>
       </div>

       {/* Map Container wrapper */}
       <div className="h-[420px] w-full relative rounded-md overflow-hidden border border-border z-0">
          {/* We add map theme styling using CSS classes. In standard tailwind dark mode, 
              we can use a wrapper class to apply a CSS filter to the tile layer.
              To make it work reliably we inject a local style tag or rely on global CSS. 
              Here we use inline style or class for the map tiles container. */}
          <style>{`
            .dark .map-tiles-container .leaflet-tile-pane {
               filter: invert(100%) hue-rotate(180deg) brightness(0.85);
            }
            .leaflet-popup-content-wrapper {
              background-color: hsl(var(--card));
              color: hsl(var(--foreground));
              border: 1px solid hsl(var(--border));
              border-radius: 8px;
            }
            .leaflet-popup-tip {
              background-color: hsl(var(--card));
            }
          `}</style>
          
          <MapContainer 
            center={[43.2567, 76.9286]} 
            zoom={12} 
            scrollWheelZoom={true}
            style={{ height: '420px', width: '100%', borderRadius: '12px', zIndex: 0 }}
            zoomControl={false}
          >
            <ThemeAwareTileLayer />
            <MapResizer />
            
            {/* We render exactly one view based on module */}
            {activeModule === 'transport' && <TransportView tomtomKey={tomtomKey} />}
            {activeModule === 'ecology' && <EcologyView data={data.ecology} />}
            {activeModule === 'safety' && <SafetyView data={data.safety} />}
            {activeModule === 'housing' && <HousingView data={data.housing} />}
            
            {data.problemZone && <ProblemZoneMarker coords={data.problemZone} isEn={isEn} />}
          </MapContainer>
       </div>

       {/* Legend */}
       <div className="mt-1">
         {activeModule === 'transport' && <TransportLegend isEn={isEn} />}
         {activeModule === 'ecology' && <EcologyLegend isEn={isEn} />}
         {activeModule === 'safety' && <SafetyLegend isEn={isEn} />}
         {activeModule === 'housing' && <HousingLegend isEn={isEn} />}
       </div>
    </div>
  );
};
