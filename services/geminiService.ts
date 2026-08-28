import { GoogleGenAI } from "@google/genai";

let genAIClient: GoogleGenAI | null = null;
let geminiQuotaExhaustedUntil = 0;

function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  // Se a cota estiver esgotada recentemente (429/RESOURCE_EXHAUSTED), pular Gemini temporariamente para velocidade máxima
  if (Date.now() < geminiQuotaExhaustedUntil) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return genAIClient;
}

export interface TranslateRequest {
  text: string;
  sourceLang: string; // e.g. "pt", "en", "fr", "es", "uk", "de", "it", "ro", "ru", "auto"
  targetLang: string; // e.g. "en", "pt", "fr", "es", "uk", "de", "it", "ro", "ru"
  context?: string;   // e.g. "construction", "general"
}

export interface TranslateResponse {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  engine: 'gemini' | 'google-translate' | 'mymemory' | 'fallback';
}

function normalizeLangCode(lang: string): string {
  if (!lang || lang === 'auto') return 'auto';
  const clean = lang.trim().toLowerCase();
  if (clean.startsWith('pt')) return 'pt';
  if (clean.startsWith('en')) return 'en';
  if (clean.startsWith('fr')) return 'fr';
  if (clean.startsWith('es')) return 'es';
  if (clean.startsWith('de')) return 'de';
  if (clean.startsWith('it')) return 'it';
  if (clean.startsWith('ro')) return 'ro';
  if (clean.startsWith('ru')) return 'ru';
  if (clean.startsWith('uk')) return 'uk';
  if (clean.startsWith('hi')) return 'hi';
  if (clean.startsWith('bn')) return 'bn';
  if (clean.startsWith('zh')) return 'zh-CN';
  return clean.split('-')[0];
}

/**
 * Fallback 1: Google Translate public GTX endpoint with high speed & accuracy
 */
async function translateWithGooglePublic(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const sl = normalizeLangCode(sourceLang);
  const tl = normalizeLangCode(targetLang);

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
    sl
  )}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': '*/*'
    }
  });
  if (!response.ok) {
    throw new Error(`Google Translate endpoint retornou HTTP ${response.status}`);
  }

  const data = await response.json();
  if (Array.isArray(data) && Array.isArray(data[0])) {
    const translatedParts = data[0].map((item: any) => item[0]).filter(Boolean);
    const result = translatedParts.join('');
    if (result && result.trim()) return result.trim();
  }

  throw new Error('Formato de resposta inesperado do Google Tradutor');
}

/**
 * Fallback 2: MyMemory Translation API (Free, high quality, no key required)
 */
async function translateWithMyMemory(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const sl = sourceLang === 'auto' ? 'pt' : normalizeLangCode(sourceLang);
  const tl = normalizeLangCode(targetLang);
  const langPair = `${sl}|${tl}`;

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`MyMemory retornou HTTP ${response.status}`);
  }

  const data = await response.json();
  if (data?.responseData?.translatedText) {
    return data.responseData.translatedText;
  }

  throw new Error('MyMemory translation empty');
}

/**
 * High quality bidirectional translation tailored for construction, site management, clients, and workers.
 */
export async function translateText({
  text,
  sourceLang,
  targetLang,
  context = 'construction'
}: TranslateRequest): Promise<TranslateResponse> {
  if (!text || !text.trim()) {
    return {
      translatedText: '',
      sourceLang,
      targetLang,
      engine: 'google-translate'
    };
  }

  const cleanText = text.trim();

  // If source and target are the same language, return immediately
  const slCode = normalizeLangCode(sourceLang);
  const tlCode = normalizeLangCode(targetLang);
  if (slCode !== 'auto' && slCode === tlCode) {
    return {
      translatedText: cleanText,
      sourceLang,
      targetLang,
      engine: 'google-translate'
    };
  }

  const ai = getGenAI();

  // 1. Try Gemini if credits/quota are available
  if (ai) {
    try {
      const prompt = `You are a professional, real-time voice interpreter and translator for a construction, renovation, and contracting company ("Átrios").
Translate the following spoken message accurately between people who do not speak the same language.

Source language: ${sourceLang || 'auto-detect'}
Target language: ${targetLang}
Domain context: ${context === 'construction' ? 'Construction, Civil Engineering, Renovation, Safety, Tools, Materials, Client Communication, Quotes & Payments' : 'General conversation'}

Text to translate:
"""
${cleanText}
"""

Rules:
1. Provide ONLY the direct translation in the target language.
2. Do not include quotes, explanatory notes, introductions, or markdown prefixes.
3. Preserve numbers, measurements, dates, currencies, and technical construction terminology accurately (e.g., drywall, concrete, scaffolding, circuit breaker, plomberie, maçonnerie, etc.).
4. Use natural, clear phrasing suitable for text-to-speech audio playback.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt
      });

      const candidateText = response.text ? response.text.trim() : '';
      if (candidateText) {
        return {
          translatedText: candidateText,
          sourceLang,
          targetLang,
          engine: 'gemini'
        };
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isQuotaError = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("prepayment credits") || errMsg.includes("404") || errMsg.includes("NOT_FOUND");
      
      if (isQuotaError) {
        // Pausar Gemini temporariamente e alternar diretamente para o fallback instantâneo de alta performance
        geminiQuotaExhaustedUntil = Date.now() + 15 * 60 * 1000;
        console.log('[Gemini Translation] Serviço Gemini indisponível ou limite atingido. Usando motor de tradução de alta velocidade (Google GTX).');
      } else {
        console.warn('[Gemini Translation Fallback] Erro Gemini, usando fallback:', errMsg);
      }
    }
  }

  // 2. Fallback to Google Translate public endpoint (Fast <100ms)
  try {
    const googleTrans = await translateWithGooglePublic(cleanText, sourceLang, targetLang);
    return {
      translatedText: googleTrans,
      sourceLang,
      targetLang,
      engine: 'google-translate'
    };
  } catch (googleErr: any) {
    // console.warn('[Google Translate Fallback]', googleErr?.message || googleErr);
  }

  // 3. Fallback to MyMemory
  try {
    const myMemoryTrans = await translateWithMyMemory(cleanText, sourceLang, targetLang);
    return {
      translatedText: myMemoryTrans,
      sourceLang,
      targetLang,
      engine: 'mymemory'
    };
  } catch (memErr: any) {
    // console.warn('[MyMemory Fallback]', memErr?.message || memErr);
  }

  // 4. Safe fallback: return original text without crashing
  return {
    translatedText: cleanText,
    sourceLang,
    targetLang,
    engine: 'fallback'
  };
}
