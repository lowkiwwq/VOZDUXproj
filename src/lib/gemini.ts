import { GoogleGenerativeAI } from '@google/generative-ai';
import { TransportData, EcologyData, SafetyData, HousingData, Language } from '../hooks/useCityData';

export interface AIResponse {
  situation: string;
  severity: 'НОРМА' | 'ВНИМАНИЕ' | 'КРИТИЧНО' | 'NORMAL' | 'WARNING' | 'CRITICAL';
  severityReason: string;
  recommendations: string[];
  forecast: string;
  priority: string;
}

export const generateAIAnalysis = async (
  geminiKey: string,
  transport: TransportData,
  ecology: EcologyData,
  safety: SafetyData,
  housing: HousingData,
  lang: Language
): Promise<AIResponse> => {
  const isEn = lang === 'en';

  const promptRu = `
Ты — аналитическая система управления городом Алматы.
Проанализируй текущие данные по всем 4 направлениям и ответь СТРОГО в формате JSON.
Никаких других символов, маркдауна или текста вне JSON.
Формат ответа:
{
  "situation": "Краткое описание текущей обстановки по всем модулям",
  "severity": "НОРМА" или "ВНИМАНИЕ" или "КРИТИЧНО",
  "severityReason": "Почему выбран такой статус (1 короткое предложение)",
  "recommendations": ["Рекомендация 1", "Рекомендация 2", "Рекомендация 3"],
  "forecast": "Краткосрочный прогноз на ближайшие часы",
  "priority": "Главный приоритет действий для мэрии прямо сейчас"
}

Данные:
Транспорт: скорость ${transport.avgSpeed.toFixed(1)} км/ч, загруженность ${transport.congestionIndex.toFixed(1)}%, инциденты: ${transport.incidentCount}
Экология: AQI ${ecology.aqi.toFixed(0)}, PM2.5 ${ecology.pm25.toFixed(1)} мкг/м³
Безопасность: активных инцидентов ${safety.activeIncidents}, время реагирования ${safety.responseTime.toFixed(1)} мин, камеры онлайн ${safety.cameraOnline.toFixed(0)}%
ЖКХ: нагрузка сети ${housing.electricityLoad.toFixed(1)}%, жалоб ${housing.activeComplaints}, давление воды ${housing.waterPressure.toFixed(1)} бар, отопление ${housing.heatingTemp.toFixed(1)}°C
`;

  const promptEn = `
You are the analytical management system for Almaty city.
Analyze the current data for all 4 sectors and respond STRICTLY in JSON format.
No markdown or text outside JSON.
Format:
{
  "situation": "Brief description of the current situation across modules",
  "severity": "NORMAL" or "WARNING" or "CRITICAL",
  "severityReason": "Why this status was chosen (1 short sentence)",
  "recommendations": ["Rec 1", "Rec 2", "Rec 3"],
  "forecast": "Short-term forecast for the next hours",
  "priority": "Top priority action for the city administration right now"
}

Data:
Transport: speed ${transport.avgSpeed.toFixed(1)} km/h, congestion ${transport.congestionIndex.toFixed(1)}%, incidents: ${transport.incidentCount}
Ecology: AQI ${ecology.aqi.toFixed(0)}, PM2.5 ${ecology.pm25.toFixed(1)} µg/m³
Safety: active incidents ${safety.activeIncidents}, response time ${safety.responseTime.toFixed(1)} min, cameras online ${safety.cameraOnline.toFixed(0)}%
Housing: electric load ${housing.electricityLoad.toFixed(1)}%, complaints ${housing.activeComplaints}, water pressure ${housing.waterPressure.toFixed(1)} bar, heating ${housing.heatingTemp.toFixed(1)}°C
`;

  const prompt = isEn ? promptEn : promptRu;

  if (!geminiKey) {
    return new Promise(resolve => {
       setTimeout(() => {
          let sev: 'НОРМА' | 'ВНИМАНИЕ' | 'КРИТИЧНО' | 'NORMAL' | 'WARNING' | 'CRITICAL' = isEn ? 'NORMAL' : 'НОРМА';
          if (transport.congestionIndex > 80 || ecology.aqi > 200 || safety.activeIncidents > 15 || housing.electricityLoad > 90) sev = isEn ? 'CRITICAL' : 'КРИТИЧНО';
          else if (transport.congestionIndex > 50 || ecology.aqi > 100 || safety.activeIncidents > 5 || housing.activeComplaints > 30) sev = isEn ? 'WARNING' : 'ВНИМАНИЕ';

          resolve({
            situation: isEn 
              ? `Demonstration mode activated. Data processed locally. Traffic congestion is ${transport.congestionIndex.toFixed(0)}%, AQI is ${ecology.aqi.toFixed(0)}, Safety incidents at ${safety.activeIncidents}, Housing load at ${housing.electricityLoad.toFixed(0)}%.`
              : `Активирован демо-режим. Загруженность дорог ${transport.congestionIndex.toFixed(0)}%, AQI составляет ${ecology.aqi.toFixed(0)}. Инцидентов: ${safety.activeIncidents}. Нагрузка ЖКХ: ${housing.electricityLoad.toFixed(0)}%.`,
            severity: sev,
            severityReason: isEn ? "Evaluated via local mock data engine" : "Оценка произведена локальным генератором",
            recommendations: isEn 
              ? ["Set up live API key for live analysis", "Monitor metric anomalies across modules"]
              : ["Добавьте Gemini API ключ для живого анализа текста", "Продолжайте мониторинг четырех модулей"],
            forecast: isEn ? "Stable operation within expected limits." : "Стабильное функционирование в заданных лимитах (заглушка).",
            priority: isEn ? "Add an API key" : "Указать API ключ в настройках"
          });
       }, 1500);
    });
  }

  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    let text = result.response.text();
    text = text.replace(/```(?:json)?\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text) as AIResponse;
  } catch (error: any) {
    throw new Error('Gemini API Error: ' + error.message);
  }
};
