import React from 'react';
import { useCityData, ModuleType } from '../hooks/useCityData';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell
} from 'recharts';

export const Charts: React.FC<{ activeModule: ModuleType }> = ({ activeModule }) => {
  const { transport, ecology, language } = useCityData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderTransportCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm h-80">
        <h3 className="font-semibold text-sm text-muted-foreground mb-4">
          {language === 'ru' ? 'Средняя скорость (24ч)' : 'Avg Speed (24h)'}
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={transport.hourlySpeed}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis dataKey="time" strokeOpacity={0.5} fontSize={12} tickMargin={10} />
            <YAxis strokeOpacity={0.5} fontSize={12} domain={[0, 60]} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              name={language === 'ru' ? 'Скорость' : 'Speed'}
              dataKey="speed" 
              stroke="#6366F1" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 shadow-sm h-80">
        <h3 className="font-semibold text-sm text-muted-foreground mb-4">
          {language === 'ru' ? 'Загруженность по районам' : 'Congestion by District'}
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={transport.trafficZones} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} horizontal={true} vertical={false} />
            <XAxis type="number" domain={[0, 100]} strokeOpacity={0.5} fontSize={12} />
            <YAxis dataKey="name" type="category" strokeOpacity={0.5} fontSize={12} width={80} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="load" name={language === 'ru' ? 'Загрузка (%)' : 'Load (%)'} radius={[0, 4, 4, 0]}>
              {transport.trafficZones.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.load > 80 ? '#EF4444' : entry.load > 50 ? '#F59E0B' : '#10B981'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderEcologyCharts = () => {
    const pollutants = [
      { subject: 'PM2.5', A: ecology.pm25, fullMark: 100 },
      { subject: 'PM10', A: ecology.pm10, fullMark: 150 },
      { subject: 'NO2', A: ecology.no2, fullMark: 100 },
      { subject: 'CO', A: ecology.co * 10, fullMark: 50 }, // Scaled for visual
    ];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm h-80">
          <h3 className="font-semibold text-sm text-muted-foreground mb-4">
            {language === 'ru' ? 'Индекс AQI (7 дней)' : 'AQI Index (7 days)'}
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ecology.aqiHistory}>
              <defs>
                <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis dataKey="day" strokeOpacity={0.5} fontSize={12} tickMargin={10} />
              <YAxis strokeOpacity={0.5} fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="aqi" 
                name="AQI"
                stroke="#10B981" 
                fillOpacity={1} 
                fill="url(#colorAqi)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm h-80">
          <h3 className="font-semibold text-sm text-muted-foreground mb-4">
            {language === 'ru' ? 'Текущие загрязнители' : 'Current Pollutants'}
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={pollutants}>
              <PolarGrid strokeOpacity={0.2} />
              <PolarAngleAxis dataKey="subject" fontSize={12} strokeOpacity={0.6} />
              <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 10']} strokeOpacity={0.2} />
              <Radar 
                name={language === 'ru' ? 'Уровень' : 'Level'} 
                dataKey="A" 
                stroke="#F59E0B" 
                fill="#F59E0B" 
                fillOpacity={0.5} 
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return activeModule === 'transport' ? renderTransportCharts() : renderEcologyCharts();
};
