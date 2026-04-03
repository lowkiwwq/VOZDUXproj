import React from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useCityData, ModuleType } from '../hooks/useCityData';
import { motion } from 'framer-motion';

export const Charts: React.FC<{ activeModule: ModuleType }> = ({ activeModule }) => {
  const { transport, ecology, safety, housing, language } = useCityData();

  if (activeModule === 'transport') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border p-5 rounded-xl shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-6 flex justify-between items-center">
            {language === 'ru' ? 'Загруженность районов' : 'District Load'}
            <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-md">Live</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transport.trafficZones} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} angle={-35} textAnchor="end" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", dy: 10 }} height={50} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip 
                  cursor={{fill: 'hsl(var(--accent)/0.1)'}}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="load" radius={[4, 4, 0, 0]}>
                  {transport.trafficZones.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.load > 75 ? '#ef4444' : entry.load > 50 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border p-5 rounded-xl shadow-sm"
        >
           <h3 className="text-lg font-semibold mb-6 flex justify-between items-center">
            {language === 'ru' ? 'Средняя скорость 24ч' : 'Avg Speed 24h'}
            <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-md">TomTom Histo</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={transport.hourlySpeed} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} interval="preserveStartEnd" minTickGap={20} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} domain={['dataMin - 5', 'dataMax + 5']} tickFormatter={(value) => Math.round(value).toString()} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="speed" stroke="hsl(var(--accent))" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "hsl(var(--accent))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    );
  }

  if (activeModule === 'ecology') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border p-5 rounded-xl shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-6">
            {language === 'ru' ? 'Динамика AQI (7 дней)' : 'AQI Trend (7 days)'}
          </h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ecology.aqiHistory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="aqi" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorAqi)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col"
        >
          <h3 className="text-lg font-semibold mb-6">
            {language === 'ru' ? 'Концентрация поллютантов' : 'Pollutant Levels'}
          </h3>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { name: 'PM2.5', value: ecology.pm25, max: 25 },
                { name: 'PM10', value: ecology.pm10, max: 50 },
                { name: 'NO2', value: ecology.no2, max: 40 },
                { name: 'CO', value: ecology.co * 10, max: 40 }, // scaled for visibility
              ]} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={60} tick={{ fontSize: 12, fill: "hsl(var(--foreground))", fontWeight: 500 }} />
                <Tooltip 
                  cursor={{fill: 'hsl(var(--accent)/0.05)'}}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {
                     [
                      { name: 'PM2.5', value: ecology.pm25, max: 25 },
                      { name: 'PM10', value: ecology.pm10, max: 50 },
                      { name: 'NO2', value: ecology.no2, max: 40 },
                      { name: 'CO', value: ecology.co * 10, max: 40 }
                     ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value > entry.max * 1.5 ? '#ef4444' : entry.value > entry.max ? '#f59e0b' : '#10b981'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    );
  }

  if (activeModule === 'safety') {
    const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex justify-between">
            {language === 'ru' ? 'Пики инцидентов (24ч)' : 'Incident Peaks (24h)'}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={safety.hourlyIncidents} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} minTickGap={20} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "#8b5cf6" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-6">{language === 'ru' ? 'Типы правонарушений' : 'Incidents by Type'}</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={safety.incidentsByType} nameKey="type" dataKey="count" cx="50%" cy="50%" innerRadius={50} outerRadius={85} stroke="none" paddingAngle={2}>
                    {safety.incidentsByType.map((_, index) => <Cell key={`pie-${index}`} fill={COLORS[index % COLORS.length]} stroke="hsl(var(--card))" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
             </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-card border border-border p-5 rounded-xl shadow-sm col-span-1 lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-6">{language === 'ru' ? 'Инциденты по районам' : 'Incidents by District'}</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={safety.incidentsByDistrict} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="district" type="category" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
                        <Tooltip cursor={{fill: 'hsl(var(--accent)/0.05)'}} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                          {safety.incidentsByDistrict.map((entry, index) => (
                            <Cell key={`bar-${index}`} fill={entry.count > 4 ? '#ef4444' : entry.count > 2 ? '#f59e0b' : '#3b82f6'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
               <div className="md:col-span-1 flex flex-col justify-center border-l border-border pl-6">
                  <h4 className="text-sm font-medium text-muted-foreground">{language === 'ru' ? 'Звонков в 112' : '112 Calls'}</h4>
                  <p className="text-4xl font-bold mt-1 text-foreground">{safety.emergencyCallsToday}</p>
                  
                  <h4 className="text-sm font-medium text-muted-foreground mt-6">{language === 'ru' ? 'Успешно решено' : 'Resolved'}</h4>
                  <p className="text-4xl font-bold mt-1 text-norm flex items-baseline gap-2">
                    {safety.resolvedToday}
                    <span className="text-sm font-medium opacity-50">/{safety.emergencyCallsToday}</span>
                  </p>
               </div>
            </div>
        </motion.div>
      </div>
    );
  }

  if (activeModule === 'housing') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-6">
            {language === 'ru' ? 'Давление и нагрузка по районам' : 'District Overloads'}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={housing.districtLoad}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="district" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Electricity Load (%)" dataKey="electricLoad" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                <Radar name="Water Pressure (bar * 10)" dataKey={(d) => d.waterPressure * 10} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }} className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-6">
            {language === 'ru' ? 'Жалобы по типам услуг' : 'Complaints by Service'}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={housing.servicesByType} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                <XAxis type="number" hide />
                <YAxis dataKey="service" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} />
                <Tooltip cursor={{fill: 'hsl(var(--accent)/0.05)'}} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="complaints" radius={[0, 4, 4, 0]} barSize={20}>
                  {housing.servicesByType.map((entry, index) => (
                    <Cell key={`bar-srv-${index}`} fill={entry.status === 'критично' ? '#ef4444' : entry.status === 'внимание' ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-6">
            {language === 'ru' ? 'Динамика жалоб ЖКХ' : 'Complaints History'}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={housing.weeklyComplaints} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorComps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="complaints" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorComps)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-card border border-border p-5 rounded-xl shadow-sm col-span-1 lg:col-span-2">
           <h3 className="text-lg font-semibold mb-4">{language === 'ru' ? 'Статус услуг ЖКХ' : 'Housing Services Status'}</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm whitespace-nowrap">
               <thead>
                 <tr className="border-b border-border text-muted-foreground">
                   <th className="py-3 px-2 font-medium">{language === 'ru' ? 'Услуга' : 'Service Type'}</th>
                   <th className="py-3 px-2 font-medium">{language === 'ru' ? 'Активных заявок' : 'Complaints'}</th>
                   <th className="py-3 px-2 font-medium">{language === 'ru' ? 'Статус' : 'Status'}</th>
                 </tr>
               </thead>
               <tbody>
                 {housing.servicesByType.map((srv, idx) => (
                   <tr key={idx} className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors">
                     <td className="py-3 px-2 font-medium">{srv.service}</td>
                     <td className="py-3 px-2 font-mono text-muted-foreground">{srv.complaints}</td>
                     <td className="py-3 px-2">
                       <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                         srv.status === 'критично' ? 'bg-destructive/10 text-destructive' :
                         srv.status === 'внимание' ? 'bg-alert/10 text-alert' :
                         'bg-norm/10 text-norm'
                       }`}>
                         {srv.status === 'внимание' && language === 'en' ? 'warning' : srv.status === 'критично' && language === 'en' ? 'critical' : language === 'en' ? 'ok' : srv.status}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </motion.div>
      </div>
    );
  }

  return null;
};
