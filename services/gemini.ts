const LANGUAGE_CODE_MAP: Record<string, string> = {
  'pt-BR': 'pt',
  'pt-PT': 'pt',
  'en-US': 'en',
  'fr-FR': 'fr',
  'it-IT': 'it',
  'es-ES': 'es',
  'ru-RU': 'ru',
  'uk-UA': 'uk',
  'de-DE': 'de',
  'ro-RO': 'ro',
  'hi-IN': 'hi',
  'bn-BD': 'bn'
};

export const translateMessage = async (text: string, targetLocale: string, sourceLocale: string = 'auto'): Promise<string> => {
  if (!text || !text.trim()) return text;

  const targetShort = LANGUAGE_CODE_MAP[targetLocale] || targetLocale.split('-')[0] || 'pt';
  const sourceShort = sourceLocale === 'auto' ? 'auto' : (LANGUAGE_CODE_MAP[sourceLocale] || sourceLocale.split('-')[0] || 'auto');

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text.trim(),
        sourceLang: sourceShort,
        targetLang: targetShort,
        context: 'construction'
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.translatedText) {
        return data.translatedText;
      }
    }
  } catch (error) {
    console.warn('[translateMessage Error] Falha ao traduzir via API, usando texto original:', error);
  }

  return text;
};