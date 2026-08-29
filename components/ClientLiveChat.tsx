import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  Languages, 
  Sparkles, 
  Check, 
  Copy, 
  Share2, 
  Headphones, 
  MessageSquare, 
  ShieldCheck, 
  ArrowLeft,
  Building,
  RefreshCw,
  Globe2,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { generateQrCodeForUrl } from '../services/qrcode';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from './VoiceTranslator';
import { playTTSAudio, stopAllAudio } from '../services/ttsAudio';

interface ClientLiveChatProps {
  roomId: string;
  companyName?: string;
  companyPhone?: string;
  companyId?: string;
  onClose?: () => void;
}

interface RoomMessage {
  id: string;
  sender: 'user' | 'client';
  senderName: string;
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: string;
  timeStr: string;
}

export const ClientLiveChat: React.FC<ClientLiveChatProps> = ({
  roomId,
  companyName = 'Profissional / Construtora',
  companyPhone,
  companyId,
  onClose
}) => {
  // Idioma do Cliente (Lado do Cliente)
  const [clientLangCode, setClientLangCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang') || params.get('client_lang');
      if (urlLang) {
        const found = SUPPORTED_LANGUAGES.find(l => l.code === urlLang || l.shortCode === urlLang);
        if (found) return found.code;
      }
      const browserLang = navigator.language;
      const matched = SUPPORTED_LANGUAGES.find(l => l.code === browserLang || l.shortCode === browserLang.split('-')[0]);
      if (matched) return matched.code;
    }
    return 'en-US';
  });

  const [clientName, setClientName] = useState<string>(() => {
    return localStorage.getItem('atrios_client_chat_name') || '';
  });
  const [isNameSet, setIsNameSet] = useState<boolean>(() => {
    return !!localStorage.getItem('atrios_client_chat_name');
  });

  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [interimText, setInterimText] = useState<string>('');
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const lastMsgCountRef = useRef<number>(0);

  const selectedClientLang = SUPPORTED_LANGUAGES.find(l => l.code === clientLangCode) || SUPPORTED_LANGUAGES[2]; // Default English

  const shareableUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?room=${encodeURIComponent(roomId)}${companyId ? `&companyId=${encodeURIComponent(companyId)}` : ''}`
    : '';

  // Sincronizar o idioma do cliente e presença com a sala em tempo real
  useEffect(() => {
    if (!roomId) return;
    const syncPresence = async () => {
      try {
        await fetch(`/api/chat-room/${encodeURIComponent(roomId)}/presence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientLang: clientLangCode,
            clientName: clientName || 'Cliente',
            sender: 'client'
          })
        });
      } catch (e) {}
    };
    syncPresence();
  }, [roomId, clientLangCode, clientName]);

  // Gerar QR code para a sala
  useEffect(() => {
    if (shareableUrl) {
      generateQrCodeForUrl(shareableUrl).then(setQrCodeDataUrl);
    }
  }, [shareableUrl]);

  // Salvar nome do cliente
  const handleSaveName = (name: string) => {
    const trimmed = name.trim();
    if (trimmed) {
      setClientName(trimmed);
      setIsNameSet(true);
      try {
        localStorage.setItem('atrios_client_chat_name', trimmed);
      } catch (e) {}
      // Atualizar presença com o novo nome
      fetch(`/api/chat-room/${encodeURIComponent(roomId)}/presence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientLang: clientLangCode,
          clientName: trimmed,
          sender: 'client'
        })
      }).catch(() => {});
    }
  };

  // Reprodução de áudio (TTS Universal com Fallback)
  const speak = (text: string, lang: string, msgId?: string) => {
    if (!text || !text.trim()) return;

    if (msgId && playingMsgId === msgId) {
      stopAllAudio();
      setPlayingMsgId(null);
      return;
    }

    if (msgId) {
      setPlayingMsgId(msgId);
    }

    playTTSAudio(text, lang, {
      onStart: () => {
        if (msgId) setPlayingMsgId(msgId);
      },
      onEnd: () => {
        setPlayingMsgId(null);
      },
      onError: () => {
        setPlayingMsgId(null);
      }
    });
  };

  // Buscar mensagens da sala periodicamente (Polling a cada 2.5s)
  const fetchRoomMessages = async () => {
    try {
      const res = await fetch(`/api/chat-room/${encodeURIComponent(roomId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          const newMsgs: RoomMessage[] = data.messages;
          
          // Se chegou nova mensagem do profissional, falar automaticamente no idioma do cliente
          if (newMsgs.length > lastMsgCountRef.current && lastMsgCountRef.current > 0) {
            const latest = newMsgs[newMsgs.length - 1];
            if (latest.sender === 'user' && autoSpeak) {
              speak(latest.translatedText || latest.originalText, selectedClientLang.ttsVoiceLang, latest.id);
            }
          }
          
          lastMsgCountRef.current = newMsgs.length;
          setMessages(newMsgs);
        }
      }
    } catch (e) {
      // Falha de rede silenciosa
    }
  };

  useEffect(() => {
    fetchRoomMessages();
    const interval = setInterval(fetchRoomMessages, 2500);
    return () => clearInterval(interval);
  }, [roomId, autoSpeak, selectedClientLang.ttsVoiceLang]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimText]);

  // Enviar mensagem
  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setInputText('');
    setInterimText('');

    try {
      const response = await fetch(`/api/chat-room/${encodeURIComponent(roomId)}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'client',
          senderName: clientName || 'Cliente',
          text,
          sourceLang: selectedClientLang.shortCode,
          targetLang: 'pt',
          clientLang: clientLangCode,
          companyId
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.message) {
          setMessages(prev => [...prev, data.message]);
          lastMsgCountRef.current += 1;
        }
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem na sala:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Reconhecimento de Voz (Microfone)
  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz direto. Por favor, digite a mensagem.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedClientLang.code;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
        setInterimText('');
      };

      recognition.onresult = (event: any) => {
        let finalTrans = '';
        let interimTrans = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            interimTrans += event.results[i][0].transcript;
          }
        }
        if (finalTrans) {
          handleSendMessage(finalTrans);
          setIsRecording(false);
        } else {
          setInterimText(interimTrans);
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsRecording(false);
    }
  };

  // Frases rápidas para o cliente
  const CLIENT_QUICK_PHRASES: Record<string, string[]> = {
    'en-US': [
      'Hello! I would like to request a quote for my project.',
      'Can we schedule a technical visit to the property?',
      'When can you start the work?',
      'Could you please clarify the payment terms?'
    ],
    'fr-FR': [
      'Bonjour! Je souhaite demander un devis pour mes travaux.',
      'Pouvons-nous planifier une visite technique?',
      'Quand pouvez-vous commencer les travaux?',
      'Pourriez-vous me préciser les délais?'
    ],
    'es-ES': [
      '¡Hola! Me gustaría solicitar un presupuesto para mi obra.',
      '¿Podemos agendar una visita técnica al local?',
      '¿Cuándo podrían comenzar con los trabajos?',
      '¿Cuáles son las formas de pago?'
    ],
    'uk-UA': [
      'Доброго дня! Я хочу отримати кошторис на ремонтні роботи.',
      'Чи можемо ми домовитися про зустріч на об\'єкті?',
      'Коли ви зможете розпочати виконання робіт?'
    ],
    'de-DE': [
      'Guten Tag! Ich möchte ein Angebot für mein Projekt anfordern.',
      'Können wir einen Vor-Ort-Termin vereinbaren?',
      'Wann können Sie mit den Arbeiten beginnen?'
    ],
    'pt-PT': [
      'Olá! Gostaria de pedir um orçamento para a minha obra.',
      'Podemos agendar uma visita técnica no local?',
      'Qual é o prazo estimado para o início dos trabalhos?',
      'Pode enviar-me o detalhe dos valores e materiais?'
    ]
  };

  const quickPhrases = CLIENT_QUICK_PHRASES[clientLangCode] || CLIENT_QUICK_PHRASES['en-US'];

  // Idiomas em destaque rápido
  const POPULAR_LANG_CODES = ['en-US', 'fr-FR', 'es-ES', 'uk-UA', 'de-DE', 'pt-PT'];

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col justify-between font-sans overflow-hidden">
      
      {/* Header Superior Fixo e Elegante */}
      <header className="shrink-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-white/10 px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Voltar"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black shadow-inner shrink-0">
            <Building size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black text-white leading-tight truncate">
                {companyName}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                AO VIVO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate mt-0.5">
              <span>Tradução Simultânea Bilíngue</span>
              <span>•</span>
              <span className="text-amber-400 font-mono font-bold">Sala: {roomId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Seletor Compacto no Header (para quando já houver mensagens) */}
          {messages.length > 0 && (
            <div className="relative flex items-center bg-slate-800/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs font-semibold shadow-xs">
              <span className="text-sm mr-1.5">{selectedClientLang.flag}</span>
              <select
                value={clientLangCode}
                onChange={(e) => setClientLangCode(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer pr-1 appearance-none"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                    {lang.flag} {lang.name.split('(')[0].trim()}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="text-slate-400 pointer-events-none" />
            </div>
          )}

          {/* Botão de Áudio Automático */}
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              autoSpeak 
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            title={autoSpeak ? 'Áudio automático ativado' : 'Áudio desativado'}
          >
            {autoSpeak ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>

          {/* Botão de Partilhar / QR Code */}
          <button
            onClick={() => setShowShareModal(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
            title="Ver QR Code & Link da Sala"
          >
            <Share2 size={17} />
          </button>
        </div>
      </header>

      {/* Identificação do Cliente caso ainda não tenha definido o nome */}
      {!isNameSet && (
        <div className="shrink-0 bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/15 border-b border-amber-500/20 py-2 px-4 flex items-center justify-between gap-3 z-20">
          <div className="flex items-center gap-2 text-xs text-amber-200">
            <Sparkles size={14} className="text-amber-400 shrink-0" />
            <span>Como deseja ser identificado na conversa?</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Seu Nome..."
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName(clientName)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500 w-28 sm:w-36"
            />
            <button
              onClick={() => handleSaveName(clientName)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Área de Mensagens com rolagem suave contida na tela */}
      <main className="flex-1 overflow-y-auto min-h-0 p-3.5 sm:p-5 max-w-4xl w-full mx-auto space-y-4">
        {messages.length === 0 ? (
          <div className="min-h-full flex flex-col items-center justify-center text-center py-4 px-2 space-y-5">
            
            {/* ÍCONE DE CONEXÃO MODERNO */}
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-2xl">
                <Headphones size={32} className="text-amber-400 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-slate-950">
                <Sparkles size={12} className="stroke-[3]" />
              </div>
            </div>

            {/* TÍTULO PRINCIPAL: CONVERSA BILÍNGUE INICIADA */}
            <div className="max-w-md space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 mb-1">
                <ShieldCheck size={12} className="text-amber-400" />
                <span>Canal Criptografado & Simultâneo</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Conversa Bilíngue Iniciada!
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                Fale ou escreva livremente. Suas mensagens são traduzidas em tempo real para a equipa da obra e vice-versa.
              </p>
            </div>

            {/* SELETOR DE IDIOMA EM DESTAQUE LOGO ABAIXO DE CONVERSA BILÍNGUE INICIADA */}
            <div className="w-full max-w-lg bg-slate-900/90 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl space-y-3.5 text-left">
              
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <Globe2 size={16} className="text-amber-400 shrink-0" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Seu Idioma de Conversa / Your Language
                  </span>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {selectedClientLang.name.split('(')[0]}
                </span>
              </div>

              {/* Botões Rápidos dos Principais Idiomas */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SUPPORTED_LANGUAGES.filter(l => POPULAR_LANG_CODES.includes(l.code)).map((lang) => {
                  const isSelected = clientLangCode === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setClientLangCode(lang.code)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20 scale-[1.02]'
                          : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <span className="text-lg shrink-0">{lang.flag}</span>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold truncate block">
                          {lang.name.split('(')[0].trim()}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 size={14} className="text-slate-950 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Dropdown Completo para outros idiomas */}
              <div className="relative pt-1">
                <label className="text-[10px] font-bold text-slate-400 block mb-1">
                  Mais Idiomas / All Languages:
                </label>
                <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                  <Languages size={15} className="text-amber-400 mr-2 shrink-0" />
                  <select
                    value={clientLangCode}
                    onChange={(e) => setClientLangCode(e.target.value)}
                    className="w-full bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer pr-6 appearance-none"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="text-slate-400 pointer-events-none absolute right-3" />
                </div>
              </div>
            </div>

            {/* SUGESTÕES RÁPIDAS DE INÍCIO */}
            <div className="w-full max-w-lg space-y-2 text-left">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-amber-400" />
                <span>Toque para enviar uma frase rápida:</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickPhrases.map((phrase, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(phrase)}
                    className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-2xl text-xs text-slate-300 hover:text-white text-left transition-all flex items-center justify-between group shadow-sm cursor-pointer active:scale-98"
                  >
                    <span className="leading-snug">"{phrase}"</span>
                    <Send size={13} className="text-slate-600 group-hover:text-amber-400 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="space-y-3.5 pb-2">
            {messages.map((msg) => {
              const isMe = msg.sender === 'client';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400 font-medium">
                    <span className="font-bold text-slate-300">
                      {isMe ? (clientName || 'Você') : companyName}
                    </span>
                    <span>•</span>
                    <span>{msg.timeStr || 'Agora'}</span>
                  </div>

                  <div
                    className={`max-w-[88%] sm:max-w-[75%] rounded-2xl p-3.5 sm:p-4 shadow-md ${
                      isMe
                        ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                        : 'bg-slate-900 text-white border border-white/10 rounded-tl-none'
                    }`}
                  >
                    {/* Texto Traduzido */}
                    <div className="text-sm sm:text-base font-bold leading-relaxed">
                      {isMe ? msg.originalText : (msg.translatedText || msg.originalText)}
                    </div>

                    {/* Subtexto Original se for do profissional */}
                    {!isMe && msg.translatedText && msg.translatedText !== msg.originalText && (
                      <div className="mt-2 pt-2 border-t border-white/10 text-xs text-slate-300 italic">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold not-italic">Original (PT):</span>
                        "{msg.originalText}"
                      </div>
                    )}

                    {/* Subtexto Traduzido se for enviado por mim */}
                    {isMe && msg.translatedText && msg.translatedText !== msg.originalText && (
                      <div className="mt-2 pt-2 border-t border-amber-600/30 text-xs text-slate-900/80 italic font-normal">
                        <span className="text-[9px] uppercase tracking-wider block font-bold not-italic text-slate-950/70">Traduzido para Profissional (PT):</span>
                        "{msg.translatedText}"
                      </div>
                    )}

                    {/* Botão de Ouvir Voz */}
                    <div className="mt-2 flex items-center justify-end">
                      <button
                        onClick={() => speak(
                          isMe ? msg.originalText : (msg.translatedText || msg.originalText),
                          selectedClientLang.ttsVoiceLang,
                          msg.id
                        )}
                        className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isMe 
                            ? 'text-slate-900 hover:bg-amber-600/30' 
                            : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                        } ${playingMsgId === msg.id ? 'animate-pulse bg-white/20' : ''}`}
                        title="Ouvir pronúncia"
                      >
                        <Volume2 size={14} />
                        <span className="text-[10px]">Ouvir</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Prévia de Transcrição enquanto fala */}
            {isRecording && interimText && (
              <div className="flex flex-col items-end animate-pulse">
                <div className="max-w-[80%] rounded-2xl rounded-tr-none p-3 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm">
                  <span>{interimText}...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>
        )}
      </main>

      {/* Barra de Entrada de Mensagem Fixa no Rodapé */}
      <footer className="shrink-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-white/10 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          {/* Botão do Microfone */}
          <button
            onClick={toggleRecording}
            className={`p-3.5 rounded-2xl font-bold flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              isRecording
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse scale-105'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 hover:border-amber-500/50'
            }`}
            title={isRecording ? 'Parar gravação' : 'Falar por voz'}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Campo de Texto */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }
              }}
              placeholder={`Fale ou escreva em ${selectedClientLang.name.split('(')[0]}...`}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/70 rounded-2xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
            />
          </div>

          {/* Botão de Enviar */}
          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim() || isSending}
            className={`p-3.5 rounded-2xl font-bold flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              inputText.trim() && !isSending
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95'
                : 'bg-slate-800 text-slate-600 border border-slate-800 cursor-not-allowed'
            }`}
            title="Enviar mensagem"
          >
            {isSending ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </footer>

      {/* Modal de Compartilhamento / QR Code */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-5 max-w-xs sm:max-w-sm w-full max-h-[88vh] sm:max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 my-auto">
            <div className="text-center space-y-1 pb-1">
              <h3 className="text-base sm:text-lg font-black text-white">QR Code & Link da Sala</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Aponte a câmara do telemóvel para aceder a esta conversa
              </p>
            </div>

            {/* Imagem do QR Code */}
            <div className="bg-white p-2.5 rounded-xl flex items-center justify-center shadow-inner mx-auto my-2 w-fit">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="QR Code da Sala" className="w-32 h-32 sm:w-36 sm:h-36 max-w-[45vw] max-h-[45vw] object-contain rounded-md" />
              ) : (
                <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center text-slate-400 text-xs">
                  A gerar QR Code...
                </div>
              )}
            </div>

            <div className="space-y-2 mt-auto">
              <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono truncate">
                <span className="truncate flex-1">{shareableUrl}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareableUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-amber-400 shrink-0 transition-all cursor-pointer"
                  title="Copiar"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const text = encodeURIComponent(`Olá! Aceda à nossa sala de conversa ao vivo e tradução simultânea pelo link: ${shareableUrl}`);
                    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  WhatsApp
                </button>

                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer active:scale-95"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
