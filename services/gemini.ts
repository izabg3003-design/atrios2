import { GoogleGenAI } from "@google/genai";

const LANGUAGE_NAME_MAP: Record<string, string> = {
  'pt-BR': 'Português do Brasil',
  'pt-PT': 'Português de Portugal',
  'en-US': 'Inglês',
  'fr-FR': 'Francês',
  'it-IT': 'Italiano',
  'es-ES': 'Espanhol',
  'ru-RU': 'Russo',
  'hi-IN': 'Hindi',
  'bn-BD': 'Bengali'
};

export const translateMessage = async (text: string, targetLocale: string): Promise<string> => {
  const targetLanguage = LANGUAGE_NAME_MAP[targetLocale] || 'Português de Portugal';
  
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key não configurada.");
    return text;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Traduza o seguinte texto para ${targetLanguage}. Retorne APENAS o texto traduzido, sem explicações, sem aspas e sem comentários extras: "${text}"`,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Erro na tradução Gemini:", error);
    return text; // Fallback para o texto original em caso de erro
  }
};