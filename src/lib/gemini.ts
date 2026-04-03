import { GoogleGenerativeAI } from '@google/generative-ai';
import { TransportData, EcologyData } from '../hooks/useCityData';

export interface AIResponse {
  situation: string;
  severity: string;
  severityReason: string;
  recommendations: string[];
  forecast: string;
  priority: string;
}

export const generateAIAnalysis = async (
  apiKey: string,
  transport: TransportData,
  ecology: EcologyData,
  language: 'ru' | 'en'
): Promise<AIResponse> => {
  if (!apiKey) {
    return generateMockAIResponse(transport, ecology, language);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", 
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const langStr = language === 'ru' ? 'по-русски' : 'in English';
    
    // Convert current data to a readable string for the prompt
    const avgSpeed = transport.avgSpeed.toFixed(1);
    const congestion = transport.congestionIndex.toFixed(0);
    const incidentCount = transport.incidentCount;
    const aqi = ecology.aqi.toFixed(0);
    const pm25 = ecology.pm25.toFixed(1);
    const windSpeed = ecology.windSpeed.toFixed(1);
    
    const criticalZones = transport.trafficZones
      .filter(z => z.load > 80)
      .map(z => z.name)
      .join(', ') || (language === 'ru' ? 'Нет' : 'None');

    const prompt = `You are an analytical city management system for Almaty. 
You must respond STRICTLY in JSON format without any markdown wrappers.
Language of the response must be ${langStr}.

JSON Structure:
{
  "situation": "Short description of what is happening (2-3 sentences)",
  "severity": "НОРМА | ВНИМАНИЕ | КРИТИЧНО" (or "NORMAL | WARNING | CRITICAL" in English),
  "severityReason": "Why this level was chosen (1 sentence)",
  "recommendations": [
    "Specific action 1",
    "Specific action 2",
    "Specific action 3"
  ],
  "forecast": "Forecast for the next 2 hours (1-2 sentences)",
  "priority": "The most important action to take right now"
}

Current Data:
Transport: average speed ${avgSpeed} km/h, congestion ${congestion}%, incidents: ${incidentCount}
Ecology: AQI ${aqi}, PM2.5 ${pm25} µg/m³, wind speed ${windSpeed} m/s
Critical Zones: ${criticalZones}`;

    const result = await model.generateContent(prompt);
    const content = result.response.text();
    
    // Attempt to parse the raw text back to JSON.
    const cleanContent = content.replace(/^```json\n/, '').replace(/\n```$/, '').trim();
    return JSON.parse(cleanContent) as AIResponse;
    
  } catch (error) {
    console.error("AI API Error:", error);
    return generateMockAIResponse(transport, ecology, language);
  }
};

const generateMockAIResponse = (t: TransportData, e: EcologyData, lang: 'ru' | 'en'): AIResponse => {
  const isCritical = e.aqi > 200 || t.congestionIndex > 80;
  const isWarning = !isCritical && (e.aqi > 100 || t.congestionIndex > 50 || t.avgSpeed < 35);
  
  if (lang === 'en') {
    return {
      situation: isCritical 
        ? "City is experiencing severe strain on both transport and air quality networks." 
        : isWarning 
          ? "There are moderate traffic jams and slightly elevated pollution levels in central areas." 
          : "All city systems are operating normally. Traffic flows steadily and air quality is within acceptable limits.",
      severity: isCritical ? "CRITICAL" : isWarning ? "WARNING" : "NORMAL",
      severityReason: "Based on algorithmic fallback due to missing API key.",
      recommendations: [
        "Monitor the situation via visual dashboards.",
        "Ensure emergency services are routed through less congested zones.",
        "Prepare dynamic road signs for real-time adjustments."
      ],
      forecast: "Expect conditions to stabilize within the next 2 hours as peak time passes.",
      priority: isCritical ? "Dispatch traffic officers to critical intersections." : "Maintain normal monitoring state."
    };
  }

  // Russian fallback
  return {
    situation: isCritical 
      ? "В городе наблюдается критическая нагрузка на транспортные сети и высокие уровни загрязнения воздуха." 
      : isWarning 
        ? "Наблюдаются умеренные заторы и повышенный уровень загрязнения в некоторых районах." 
        : "Все системы города функционируют в штатном режиме. Движение стабильное, экология в норме.",
    severity: isCritical ? "КРИТИЧНО" : isWarning ? "ВНИМАНИЕ" : "НОРМА",
    severityReason: "Резервный ИИ (ключ API не предоставлен).",
    recommendations: [
      "Продолжать мониторинг через визуальные дашборды.",
      "Обеспечить маршрутизацию экстренных служб в обход заторов.",
      "Настроить динамические знаки на дорогах для перераспределения потока."
    ],
    forecast: "Ожидается стабилизация ситуации в течение ближайших 2 часов.",
    priority: isCritical ? "Отправить экипажи полиции на ключевые перекрестки." : "Продолжать фоновый мониторинг."
  };
};
