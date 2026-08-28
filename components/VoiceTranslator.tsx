import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ArrowLeftRight, 
  Copy, 
  Check, 
  Share2, 
  Trash2, 
  Sparkles, 
  Send, 
  Languages, 
  Headphones, 
  Radio, 
  MessageSquare, 
  AlertCircle,
  Construction,
  ShieldCheck,
  Clock,
  QrCode,
  Link,
  ExternalLink,
  Smartphone,
  CheckCircle2,
  X,
  RefreshCw,
  Users,
  ChevronDown,
  Info
} from 'lucide-react';
import { Locale } from '../translations';
import { Company } from '../types';
import { generateQrCodeForUrl } from '../services/qrcode';
import { saveTranslationMessage } from '../services/supabase';
import { playTTSAudio, stopAllAudio } from '../services/ttsAudio';

// Tipagem para mensagens da conversa
export interface TranslationMessage {
  id: string;
  sender: 'user' | 'client';
  senderName?: string;
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: string;
  audioPlayed?: boolean;
}

// Lista rica de idiomas suportados com voz e transcrição
export interface SupportedLanguage {
  code: string;       // Código para SpeechRecognition e TTS (ex: pt-PT, en-US)
  shortCode: string;  // Código para API de tradução (ex: pt, en)
  name: string;
  flag: string;
  ttsVoiceLang: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'pt-PT', shortCode: 'pt', name: 'Português (Portugal)', flag: '🇵🇹', ttsVoiceLang: 'pt-PT' },
  { code: 'pt-BR', shortCode: 'pt', name: 'Português (Brasil)', flag: '🇧🇷', ttsVoiceLang: 'pt-BR' },
  { code: 'en-US', shortCode: 'en', name: 'Inglês (English)', flag: '🇬🇧', ttsVoiceLang: 'en-US' },
  { code: 'fr-FR', shortCode: 'fr', name: 'Francês (Français)', flag: '🇫🇷', ttsVoiceLang: 'fr-FR' },
  { code: 'es-ES', shortCode: 'es', name: 'Espanhol (Español)', flag: '🇪🇸', ttsVoiceLang: 'es-ES' },
  { code: 'uk-UA', shortCode: 'uk', name: 'Ucraniano (Українська)', flag: '🇺🇦', ttsVoiceLang: 'uk-UA' },
  { code: 'ro-RO', shortCode: 'ro', name: 'Romeno (Română)', flag: '🇷🇴', ttsVoiceLang: 'ro-RO' },
  { code: 'de-DE', shortCode: 'de', name: 'Alemão (Deutsch)', flag: '🇩🇪', ttsVoiceLang: 'de-DE' },
  { code: 'it-IT', shortCode: 'it', name: 'Italiano (Italiano)', flag: '🇮🇹', ttsVoiceLang: 'it-IT' },
  { code: 'pl-PL', shortCode: 'pl', name: 'Polaco (Polski)', flag: '🇵🇱', ttsVoiceLang: 'pl-PL' },
  { code: 'ru-RU', shortCode: 'ru', name: 'Russo (Русский)', flag: '🇷🇺', ttsVoiceLang: 'ru-RU' },
  { code: 'ar-SA', shortCode: 'ar', name: 'Árabe (العربية)', flag: '🇸🇦', ttsVoiceLang: 'ar-SA' },
  { code: 'hi-IN', shortCode: 'hi', name: 'Hindi (हिन्दी)', flag: '🇮🇳', ttsVoiceLang: 'hi-IN' },
  { code: 'bn-BD', shortCode: 'bn', name: 'Bengali (বাংলা)', flag: '🇧🇩', ttsVoiceLang: 'bn-BD' },
  { code: 'nl-NL', shortCode: 'nl', name: 'Holandês (Nederlands)', flag: '🇳🇱', ttsVoiceLang: 'nl-NL' },
  { code: 'zh-CN', shortCode: 'zh', name: 'Mandarim (中文)', flag: '🇨🇳', ttsVoiceLang: 'zh-CN' },
];

const POPULAR_LANG_CODES = ['pt-PT', 'en-US', 'fr-FR', 'es-ES', 'uk-UA', 'de-DE'];

// Frases rápidas para canteiro de obras e comunicação profissional
const QUICK_CONSTRUCTION_PHRASES = [
  {
    category: 'Segurança & Acesso ao Local',
    icon: ShieldCheck,
    phrases: [
      'Por favor, utilize o capacete, colete e botas de segurança no canteiro de obras.',
      'Onde se encontra o quadro elétrico geral e a chave de corte de água?',
      'Qual é o código do portão ou como acedemos ao local da obra?'
    ]
  },
  {
    category: 'Prazos, Medidas & Materiais',
    icon: Construction,
    phrases: [
      'A entrega dos materiais e tintas está agendada para amanhã às 08:00.',
      'Precisamos de validar as medidas antes de aplicar o revestimento.',
      'O trabalho nesta área foi concluído com sucesso e está pronto para verificação.'
    ]
  },
  {
    category: 'Orçamentos & Validação Técnica',
    icon: Clock,
    phrases: [
      'Enviei o orçamento detalhado. Pode confirmar a aprovação?',
      'Podemos agendar a visita técnica para amanhã de tarde?',
      'Ficou alguma dúvida sobre os valores ou materiais incluídos no projeto?'
    ]
  }
];

interface VoiceTranslatorProps {
  currentLocale?: Locale;
  currentUser?: Company | null;
}

export const VoiceTranslator: React.FC<VoiceTranslatorProps> = ({ 
  currentLocale = 'pt-PT',
  currentUser 
}) => {
  // Identificador do utilizador logado para isolamento estrito de histórico e sala
  const userId = currentUser?.id || currentUser?.email || 'guest';
  const userHistoryKey = `atrios_voice_history_${userId}`;
  const userRoomKey = `atrios_active_room_${userId}`;
  const userLangAKey = `atrios_langA_${userId}`;
  const userLangBKey = `atrios_langB_${userId}`;

  // ID padrão exclusivo do utilizador baseado no ID da conta
  const defaultRoomId = currentUser?.id 
    ? `SAL_${currentUser.id.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toUpperCase()}` 
    : (currentUser?.email ? `SAL_${currentUser.email.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toUpperCase()}` : 'SALA_ATRIOS');

  // Idiomas selecionados: Lado A (Meu Idioma) e Lado B (Idioma do Interlocutor / Cliente)
  const [langA, setLangA] = useState<string>(() => {
    try {
      const savedLangA = localStorage.getItem(userLangAKey);
      if (savedLangA) return savedLangA;
    } catch (e) {}
    const matched = SUPPORTED_LANGUAGES.find(l => l.code === currentLocale);
    return matched ? matched.code : 'pt-PT';
  });

  const [langB, setLangB] = useState<string>(() => {
    try {
      const savedLangB = localStorage.getItem(userLangBKey);
      if (savedLangB) return savedLangB;
    } catch (e) {}
    return 'en-US';
  });

  // Modo de visualização: 'conversation' (Duplo Mic) | 'quick_phrases' (Frases Rápidas)
  const [activeMode, setActiveMode] = useState<'conversation' | 'quick_phrases'>('conversation');

  // Sala de Chat Ao Vivo exclusiva deste utilizador
  const [activeRoomId, setActiveRoomId] = useState<string>(() => {
    try {
      return localStorage.getItem(userRoomKey) || defaultRoomId;
    } catch (e) {
      return defaultRoomId;
    }
  });

  const [customRoomInput, setCustomRoomInput] = useState<string>(activeRoomId);
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);
  const [clientConnected, setClientConnected] = useState<boolean>(false);
  const [remoteClientName, setRemoteClientName] = useState<string>('');

  // Histórico de conversação estritamente isolado por utilizador logado
  const [messages, setMessages] = useState<TranslationMessage[]>(() => {
    try {
      const saved = localStorage.getItem(userHistoryKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Reagir a mudanças de login/utilizador e carregar os dados próprios do utilizador ativo
  useEffect(() => {
    try {
      const savedRoom = localStorage.getItem(userRoomKey) || defaultRoomId;
      setActiveRoomId(savedRoom);
      setCustomRoomInput(savedRoom);

      const savedMsgs = localStorage.getItem(userHistoryKey);
      const parsedMsgs: TranslationMessage[] = savedMsgs ? JSON.parse(savedMsgs) : [];
      setMessages(parsedMsgs);
      knownMsgIdsRef.current = new Set(parsedMsgs.map(m => m.id));

      const savedLangA = localStorage.getItem(userLangAKey);
      if (savedLangA) setLangA(savedLangA);

      const savedLangB = localStorage.getItem(userLangBKey);
      if (savedLangB) setLangB(savedLangB);
    } catch (e) {}
  }, [userId, defaultRoomId]);

  // Estado de gravação de voz
  const [recordingSide, setRecordingSide] = useState<'A' | 'B' | null>(null);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [textInputA, setTextInputA] = useState<string>('');
  const [textInputB, setTextInputB] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const knownMsgIdsRef = useRef<Set<string>>(new Set(messages.map(m => m.id)));

  // URL compartilhável para o cliente entrar na conversa traduzida
  const clientChatUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?room=${encodeURIComponent(activeRoomId)}${currentUser?.id ? `&companyId=${encodeURIComponent(currentUser.id)}` : ''}`
    : '';

  // Gerar QR Code quando a URL mudar
  useEffect(() => {
    if (clientChatUrl) {
      generateQrCodeForUrl(clientChatUrl).then(url => {
        if (url) setQrCodeDataUrl(url);
      });
    }
  }, [clientChatUrl, activeRoomId]);

  // Salvar histórico no LocalStorage estritamente por utilizador
  useEffect(() => {
    try {
      localStorage.setItem(userHistoryKey, JSON.stringify(messages));
    } catch (e) {}
  }, [messages, userHistoryKey]);

  // Salvar idioma selecionado por utilizador
  useEffect(() => {
    try {
      localStorage.setItem(userLangAKey, langA);
    } catch (e) {}
  }, [langA, userLangAKey]);

  useEffect(() => {
    try {
      localStorage.setItem(userLangBKey, langB);
    } catch (e) {}
  }, [langB, userLangBKey]);

  // Rolar suavemente para a última mensagem
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript, isTranslating]);

  // Verificar suporte a Web Speech API no navegador
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // Obter detalhes de idioma por código
  const getLangDetails = (code: string): SupportedLanguage => {
    return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
  };

  const selectedLangA = getLangDetails(langA);
  const selectedLangB = getLangDetails(langB);

  // Inverter idiomas de conversa (A ⇄ B)
  const handleSwapLanguages = () => {
    const prevA = langA;
    const prevB = langB;
    setLangA(prevB);
    setLangB(prevA);
  };

  // Reproduzir texto por voz (Text-To-Speech Universal com Fallback)
  const speakText = (text: string, langCode: string, messageId?: string) => {
    if (!text || !text.trim()) return;

    if (messageId && playingAudioId === messageId) {
      // Se já está a tocar a mesma mensagem, parar
      stopAllAudio();
      setPlayingAudioId(null);
      return;
    }

    if (messageId) {
      setPlayingAudioId(messageId);
    }

    playTTSAudio(text, langCode, {
      onStart: () => {
        if (messageId) setPlayingAudioId(messageId);
      },
      onEnd: () => {
        setPlayingAudioId(null);
      },
      onError: () => {
        setPlayingAudioId(null);
      }
    });
  };

  // Sincronizar em tempo real com a sala (Polling a cada 2.5s)
  useEffect(() => {
    if (!activeRoomId) return;

    const syncRoom = async () => {
      try {
        const res = await fetch(`/api/chat-room/${encodeURIComponent(activeRoomId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            // Sincronizar automaticamente o idioma selecionado pelo cliente no Lado B
            if (data.clientLang) {
              const matchedLang = SUPPORTED_LANGUAGES.find(l => l.code === data.clientLang || l.shortCode === data.clientLang);
              if (matchedLang) {
                setLangB(prev => {
                  if (prev !== matchedLang.code) {
                    return matchedLang.code;
                  }
                  return prev;
                });
                setClientConnected(true);
              }
            }

            if (data.clientName) {
              setRemoteClientName(data.clientName);
              setClientConnected(true);
            }

            if (Array.isArray(data.messages)) {
              const serverMsgs: any[] = data.messages;
              let hasNewClientMsg = false;
              let lastClientMsgText = '';
              let lastClientMsgId = '';

              setMessages(prev => {
                const currentMap = new Map(prev.map(m => [m.id, m]));
                let changed = false;

                serverMsgs.forEach(sMsg => {
                  if (!currentMap.has(sMsg.id)) {
                    changed = true;
                    const newM: TranslationMessage = {
                      id: sMsg.id,
                      sender: sMsg.sender,
                      senderName: sMsg.senderName,
                      originalText: sMsg.originalText,
                      translatedText: sMsg.translatedText,
                      sourceLang: sMsg.sourceLang,
                      targetLang: sMsg.targetLang,
                      timestamp: sMsg.timeStr || new Date(sMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    currentMap.set(sMsg.id, newM);

                    if (sMsg.sender === 'client' && !knownMsgIdsRef.current.has(sMsg.id)) {
                      hasNewClientMsg = true;
                      lastClientMsgText = sMsg.translatedText || sMsg.originalText;
                      lastClientMsgId = sMsg.id;
                      setClientConnected(true);
                    }
                    knownMsgIdsRef.current.add(sMsg.id);
                  }
                });

                if (changed) {
                  return Array.from(currentMap.values());
                }
                return prev;
              });

              // Se o cliente enviou mensagem nova enquanto o profissional estava ouvindo, falar em voz alta!
              if (hasNewClientMsg && autoSpeakEnabled && lastClientMsgText) {
                speakText(lastClientMsgText, selectedLangA.ttsVoiceLang, lastClientMsgId);
              }
            }
          }
        }
      } catch (e) {
        // Silencioso
      }
    };

    syncRoom();
    const interval = setInterval(syncRoom, 2500);
    return () => clearInterval(interval);
  }, [activeRoomId, autoSpeakEnabled, selectedLangA.ttsVoiceLang]);

  // Enviar texto para tradução e opcionalmente sincronizar na sala
  const handleTranslateAndSend = async (
    textToTranslate: string,
    sender: 'user' | 'client',
    srcLangObj: SupportedLanguage,
    tgtLangObj: SupportedLanguage
  ) => {
    if (!textToTranslate.trim() || isTranslating) return;

    setIsTranslating(true);
    setMicPermissionError(null);

    try {
      // 1. Enviar mensagem para a API da sala se houver sala ativa
      if (activeRoomId) {
        const roomRes = await fetch(`/api/chat-room/${encodeURIComponent(activeRoomId)}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender,
            senderName: sender === 'user' ? (currentUser?.name || 'Profissional') : 'Cliente',
            text: textToTranslate.trim(),
            sourceLang: srcLangObj.shortCode,
            targetLang: tgtLangObj.shortCode,
            userLang: langA,
            clientLang: langB,
            companyId: currentUser?.id
          })
        });

        if (roomRes.ok) {
          const roomData = await roomRes.json();
          if (roomData.success && roomData.message) {
            const sMsg = roomData.message;
            const newMsg: TranslationMessage = {
              id: sMsg.id,
              sender,
              senderName: sMsg.senderName,
              originalText: sMsg.originalText,
              translatedText: sMsg.translatedText,
              sourceLang: srcLangObj.code,
              targetLang: tgtLangObj.code,
              timestamp: sMsg.timeStr || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            knownMsgIdsRef.current.add(newMsg.id);
            setMessages(prev => [...prev.filter(m => m.id !== newMsg.id), newMsg]);

            if (autoSpeakEnabled && newMsg.translatedText) {
              const voiceLang = sender === 'user' ? tgtLangObj.ttsVoiceLang : srcLangObj.ttsVoiceLang;
              speakText(newMsg.translatedText, voiceLang, newMsg.id);
            }

            if (sender === 'user') setTextInputA('');
            else setTextInputB('');
            return;
          }
        }
      }

      // Fallback padrão se não usar sala
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToTranslate.trim(),
          sourceLang: srcLangObj.shortCode,
          targetLang: tgtLangObj.shortCode,
          context: 'construction'
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao traduzir mensagem');
      }

      const newMsg: TranslationMessage = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        sender,
        senderName: sender === 'user' ? (currentUser?.name || 'Profissional') : 'Cliente',
        originalText: textToTranslate.trim(),
        translatedText: data.translatedText,
        sourceLang: srcLangObj.code,
        targetLang: tgtLangObj.code,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      knownMsgIdsRef.current.add(newMsg.id);
      setMessages(prev => [...prev, newMsg]);

      // Sincronizar no Supabase
      saveTranslationMessage({
        id: newMsg.id,
        roomId: activeRoomId || 'SALA_ATRIOS',
        companyId: currentUser?.id,
        sender: newMsg.sender,
        senderName: newMsg.senderName,
        originalText: newMsg.originalText,
        translatedText: newMsg.translatedText,
        sourceLang: newMsg.sourceLang,
        targetLang: newMsg.targetLang
      }).catch(() => {});

      // Falar a tradução automaticamente se a opção estiver ativada
      if (autoSpeakEnabled && data.translatedText) {
        const voiceLang = sender === 'user' ? tgtLangObj.ttsVoiceLang : srcLangObj.ttsVoiceLang;
        speakText(data.translatedText, voiceLang, newMsg.id);
      }

      // Limpar campos de texto
      if (sender === 'user') setTextInputA('');
      else setTextInputB('');
    } catch (err: any) {
      console.error('Erro na tradução:', err);
      alert('Não foi possível traduzir a mensagem. Verifique a ligação à internet: ' + (err.message || 'Erro de rede'));
    } finally {
      setIsTranslating(false);
    }
  };

  // Iniciar captura de áudio com SpeechRecognition
  const startRecording = (side: 'A' | 'B') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('O seu navegador não suporta reconhecimento de voz direto. Pode digitar a mensagem no campo de texto abaixo.');
      return;
    }

    // Se já estiver gravando, para primeiro
    if (recordingSide) {
      stopRecording();
      return;
    }

    setMicPermissionError(null);
    const activeLang = side === 'A' ? selectedLangA : selectedLangB;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = activeLang.code;
      recognition.continuous = false; // Parar após frase
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setRecordingSide(side);
        setInterimTranscript('');
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

        setInterimTranscript(interimTrans || finalTrans);

        if (finalTrans) {
          const srcLang = side === 'A' ? selectedLangA : selectedLangB;
          const tgtLang = side === 'A' ? selectedLangB : selectedLangA;
          const sender = side === 'A' ? 'user' : 'client';
          handleTranslateAndSend(finalTrans, sender, srcLang, tgtLang);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setMicPermissionError('Permissão do microfone negada. Clique no cadeado do navegador para permitir o microfone.');
        }
        setRecordingSide(null);
        setInterimTranscript('');
      };

      recognition.onend = () => {
        setRecordingSide(null);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Falha ao iniciar microfone:', err);
      setMicPermissionError('Não foi possível aceder ao microfone. Pode digitar a mensagem no campo de texto.');
      setRecordingSide(null);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setRecordingSide(null);
  };

  // Copiar tradução para a área de transferência
  const copyTranslation = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Partilhar tradução via WhatsApp
  const shareWhatsApp = (msg: TranslationMessage) => {
    const src = getLangDetails(msg.sourceLang);
    const tgt = getLangDetails(msg.targetLang);
    const text = `*ÁTRIOS Intérprete*\n🗣️ _${src.name}_: "${msg.originalText}"\n🌐 _${tgt.name}_: "${msg.translatedText}"`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Partilhar link da sala ao cliente via WhatsApp
  const shareRoomViaWhatsApp = () => {
    const companyTitle = currentUser?.name || 'Átrios';
    const message = `Olá! Aceda ao nosso Tradutor e Chat Ao Vivo em Tempo Real da *${companyTitle}* através deste link:\n\n${clientChatUrl}\n\nFale ou escreva no seu próprio idioma e conversaremos traduzido instantaneamente! 🌍💬`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Copiar Link da Sala
  const copyClientLink = () => {
    navigator.clipboard.writeText(clientChatUrl);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2500);
  };

  // Alterar Sala de Chat personalizada para este utilizador
  const handleUpdateRoom = (newRoom: string) => {
    const trimmed = newRoom.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (trimmed) {
      setActiveRoomId(trimmed);
      try {
        localStorage.setItem(userRoomKey, trimmed);
      } catch (e) {}
    }
  };

  // Limpar todo o histórico de conversação deste utilizador
  const clearHistory = () => {
    if (window.confirm('Tem a certeza que deseja limpar o seu histórico de conversação?')) {
      setMessages([]);
      knownMsgIdsRef.current.clear();
      try {
        localStorage.removeItem(userHistoryKey);
      } catch (e) {}
      if (activeRoomId) {
        fetch(`/api/chat-room/${encodeURIComponent(activeRoomId)}/clear`, { method: 'POST' }).catch(() => {});
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-5 animate-in fade-in duration-300 pb-12">
      
      {/* MODAL DE CONEXÃO COM CLIENTE (LINK & QR CODE) */}
      {showConnectModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 relative text-slate-100 no-scrollbar">
            
            {/* Fechar */}
            <button
              onClick={() => setShowConnectModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Cabeçalho do Modal */}
            <div className="text-center space-y-1.5 pt-0.5">
              <div className="inline-flex w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 items-center justify-center shadow-md shadow-amber-500/20 mb-0.5">
                <QrCode size={22} />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Conectar com o Cliente
              </h2>
              <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
                Aponte a câmara do telemóvel para aceder à conversa com tradução em tempo real.
              </p>
            </div>

            {/* QR CODE DISPLAY */}
            <div className="bg-slate-950/80 border border-white/10 rounded-xl sm:rounded-2xl p-4 flex flex-col items-center justify-center space-y-3 shadow-inner">
              {qrCodeDataUrl ? (
                <div className="bg-white p-3 rounded-xl shadow-lg flex flex-col items-center">
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code da Sala de Chat"
                    className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded-md"
                  />
                  <span className="text-[10px] font-black text-slate-800 mt-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone size={11} className="text-amber-500" />
                    Aponte a câmara do telemóvel
                  </span>
                </div>
              ) : (
                <div className="w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center text-slate-400">
                  <RefreshCw size={22} className="animate-spin text-amber-400" />
                </div>
              )}

              {/* Informação da Sala */}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-900 px-3 py-1 rounded-full border border-white/10 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Sala Ativa: <strong className="font-mono text-amber-400">{activeRoomId}</strong></span>
              </div>
            </div>

            {/* LINK COMPARTILHÁVEL & BOTÕES DE AÇÃO */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 p-1.5 bg-slate-950 border border-white/10 rounded-xl">
                <input
                  type="text"
                  readOnly
                  value={clientChatUrl}
                  className="bg-transparent text-[11px] sm:text-xs font-mono text-slate-300 flex-1 px-2 outline-none select-all truncate"
                />
                <button
                  onClick={copyClientLink}
                  className={`px-3 py-2 rounded-lg text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    copiedShareLink
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  {copiedShareLink ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedShareLink ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              {/* Botão de Envio WhatsApp & Abrir Nova Aba */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={shareRoomViaWhatsApp}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Share2 size={15} />
                  <span>WhatsApp</span>
                </button>

                <a
                  href={clientChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-white/10 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer"
                >
                  <ExternalLink size={15} />
                  <span>Abrir Tela Cliente</span>
                </a>
              </div>
            </div>

            {/* Opção para Personalizar Código da Sala */}
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px]">Sala:</span>
                <input
                  type="text"
                  value={customRoomInput}
                  onChange={e => setCustomRoomInput(e.target.value)}
                  placeholder="ex: SALA_1"
                  className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-bold text-amber-300 uppercase outline-none focus:border-amber-500 w-24"
                />
                <button
                  onClick={() => handleUpdateRoom(customRoomInput)}
                  className="px-2 py-1 bg-amber-500 text-slate-950 font-black rounded-lg text-[10px] uppercase hover:bg-amber-400 cursor-pointer"
                >
                  Mudar
                </button>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-slate-400 font-bold hover:text-white text-xs cursor-pointer ml-auto"
              >
                Concluir
              </button>
            </div>

          </div>
        </div>
      )}

      {/* HEADER HERO STUDIO CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-white/10 relative overflow-hidden">
        {/* Glow lights */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          {/* Top Bar: Badges & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
                <Sparkles size={13} className="text-amber-400" />
                <span>Intérprete Simultâneo AI</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Sala: {activeRoomId}</span>
              </div>

              {clientConnected && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                  <span>{remoteClientName ? `Interlocutor: ${remoteClientName}` : 'Cliente Conectado'}</span>
                </div>
              )}
            </div>

            {/* Quick Actions Header */}
            <div className="flex items-center gap-2 shrink-0">
              
              {/* Botão de Conectar Cliente */}
              <button
                onClick={() => setShowConnectModal(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                title="Abrir Link e QR Code da Sala para o Cliente"
              >
                <QrCode size={16} />
                <span>Link & QR Code</span>
              </button>

              {/* Botão de Áudio Automático */}
              <button
                onClick={() => setAutoSpeakEnabled(!autoSpeakEnabled)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  autoSpeakEnabled 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
                title={autoSpeakEnabled ? 'Voz de leitura ativada' : 'Voz de leitura desativada'}
              >
                {autoSpeakEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              {/* Limpar Histórico */}
              {messages.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 transition-all cursor-pointer"
                  title="Limpar histórico da conversa"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

          </div>

          {/* Title and Short Description */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Languages className="text-amber-400" size={28} />
              <span>Tradutor & Intérprete de Voz</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-2xl leading-relaxed">
              Comunique sem barreiras linguísticas na obra ou reuniões. Fale no seu idioma e o cliente ouve e lê a tradução imediata.
            </p>
          </div>

          {/* BENTO DOCK DE IDIOMAS (LADO A & LADO B) */}
          <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-inner">
            <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 sm:gap-4 items-center">
              
              {/* LADO A: VOCÊ */}
              <div className="sm:col-span-5 bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/60 rounded-xl p-3.5 space-y-2 transition-all shadow-sm">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-amber-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>Seu Idioma (Você)</span>
                  </span>
                  <span className="text-base">{selectedLangA.flag}</span>
                </div>

                <div className="relative">
                  <select
                    value={langA}
                    onChange={e => setLangA(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-lg py-2 px-3 text-sm font-bold text-white outline-none cursor-pointer focus:border-amber-500 appearance-none pr-8"
                  >
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <option key={`a_${lang.code}`} value={lang.code} className="bg-slate-900 text-white">
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>

                {/* Quick Switch Pills */}
                <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto no-scrollbar">
                  {SUPPORTED_LANGUAGES.filter(l => POPULAR_LANG_CODES.includes(l.code)).map(l => (
                    <button
                      key={`quick_a_${l.code}`}
                      type="button"
                      onClick={() => setLangA(l.code)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        langA === l.code
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {l.flag} {l.shortCode.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* BOTAO CENTRAL DE TROCA / SWAP */}
              <div className="sm:col-span-1 flex justify-center py-1 sm:py-0">
                <button
                  type="button"
                  onClick={handleSwapLanguages}
                  className="p-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer font-black flex items-center justify-center"
                  title="Inverter Idiomas (A ⇄ B)"
                >
                  <ArrowLeftRight size={18} />
                </button>
              </div>

              {/* LADO B: CLIENTE / INTERLOCUTOR */}
              <div className={`sm:col-span-5 bg-slate-900/90 border ${clientConnected ? 'border-emerald-500/40' : 'border-blue-500/30'} hover:border-blue-500/60 rounded-xl p-3.5 space-y-2 transition-all shadow-sm`}>
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-blue-400">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className={`w-2 h-2 rounded-full ${clientConnected ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`}></span>
                    <span>{remoteClientName ? `Interlocutor (${remoteClientName})` : 'Cliente / Interlocutor'}</span>
                    {clientConnected && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Sincronizado
                      </span>
                    )}
                  </span>
                  <span className="text-base">{selectedLangB.flag}</span>
                </div>

                <div className="relative">
                  <select
                    value={langB}
                    onChange={e => setLangB(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-lg py-2 px-3 text-sm font-bold text-white outline-none cursor-pointer focus:border-blue-400 appearance-none pr-8"
                  >
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <option key={`b_${lang.code}`} value={lang.code} className="bg-slate-900 text-white">
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>

                {/* Quick Switch Pills */}
                <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto no-scrollbar">
                  {SUPPORTED_LANGUAGES.filter(l => POPULAR_LANG_CODES.includes(l.code)).map(l => (
                    <button
                      key={`quick_b_${l.code}`}
                      type="button"
                      onClick={() => setLangB(l.code)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        langB === l.code
                          ? 'bg-blue-500 text-white border-blue-400 font-black'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {l.flag} {l.shortCode.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Abas: Conversa ao Vivo vs Frases Rápidas de Obra */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveMode('conversation')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                  activeMode === 'conversation'
                    ? 'bg-white text-slate-950 shadow-md scale-102'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <MessageSquare size={14} />
                <span>Conversa Ao Vivo</span>
              </button>

              <button
                onClick={() => setActiveMode('quick_phrases')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                  activeMode === 'quick_phrases'
                    ? 'bg-white text-slate-950 shadow-md scale-102'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Construction size={14} />
                <span>Frases Rápidas de Obra</span>
              </button>
            </div>

            <button
              onClick={() => setShowConnectModal(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer"
            >
              <Link size={13} />
              <span>Conectar Cliente via QR Code</span>
            </button>
          </div>

        </div>
      </div>

      {/* AVISO DE PERMISSÃO DE MICROFONE SE HOUVER */}
      {micPermissionError && (
        <div className="p-4 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-300 text-xs font-bold flex items-center gap-3 animate-in fade-in">
          <AlertCircle size={18} className="text-amber-400 shrink-0" />
          <span>{micPermissionError}</span>
        </div>
      )}

      {/* ÁREA PRINCIPAL: MODO CONVERSA */}
      {activeMode === 'conversation' && (
        <div className="space-y-4">

          {/* STREAM DE CONVERSA */}
          <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-4 sm:p-6 shadow-xl min-h-[380px] max-h-[540px] flex flex-col justify-between overflow-hidden">
            
            <div className="overflow-y-auto no-scrollbar space-y-4 pr-1 flex-1">
              {messages.length === 0 ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl">
                      <Headphones size={30} className="animate-pulse" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-slate-950">
                      <Sparkles size={10} className="stroke-[3]" />
                    </div>
                  </div>

                  <div className="space-y-1 max-w-md">
                    <h3 className="text-base sm:text-lg font-black text-white">Canal de Tradução Pronto</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Fale pelo microfone abaixo ou escreva a sua mensagem em <strong>{selectedLangA.name}</strong>. Ela será traduzida e falada instantaneamente em <strong>{selectedLangB.name}</strong>!
                    </p>
                  </div>

                  <button
                    onClick={() => setShowConnectModal(true)}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <QrCode size={15} />
                    <span>Conectar Telemóvel do Cliente</span>
                  </button>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  const srcLang = getLangDetails(msg.sourceLang);
                  const tgtLang = getLangDetails(msg.targetLang);
                  const isPlaying = playingAudioId === msg.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-start' : 'items-end'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
                    >
                      {/* Subcabeçalho de quem enviou */}
                      <div className="flex items-center gap-2 mb-1 px-1 text-[10px] text-slate-400 font-medium">
                        <span className="font-bold text-slate-300">
                          {isUser ? `Você (${currentUser?.name || 'Profissional'})` : (remoteClientName || 'Cliente')}
                        </span>
                        <span>•</span>
                        <span>{srcLang.flag} ➔ {tgtLang.flag}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-500">{msg.timestamp}</span>
                      </div>

                      <div
                        className={`max-w-[92%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 shadow-lg space-y-2.5 relative border ${
                          isUser
                            ? 'bg-slate-950 border-amber-500/30 text-white rounded-tl-sm'
                            : 'bg-gradient-to-br from-amber-500 to-amber-400 border-amber-400 text-slate-950 rounded-tr-sm font-medium'
                        }`}
                      >
                        {/* Texto Traduzido (Destaque Principal) */}
                        <div className="space-y-0.5">
                          <div className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                            isUser ? 'text-amber-400' : 'text-slate-900/80'
                          }`}>
                            <Sparkles size={11} />
                            <span>Tradução ({tgtLang.name}):</span>
                          </div>
                          <p className="text-base sm:text-lg font-black leading-snug">
                            {msg.translatedText || msg.originalText}
                          </p>
                        </div>

                        {/* Texto Original */}
                        {msg.originalText && msg.originalText !== msg.translatedText && (
                          <div className={`pt-2 border-t text-xs leading-relaxed ${
                            isUser ? 'border-white/10 text-slate-400' : 'border-slate-900/15 text-slate-900/90'
                          }`}>
                            <span className="text-[9px] uppercase font-bold tracking-wider block opacity-75">
                              Original ({srcLang.name}):
                            </span>
                            <span className="italic font-medium">"{msg.originalText}"</span>
                          </div>
                        )}

                        {/* Botões de Ação na Mensagem */}
                        <div className={`flex items-center justify-end gap-2 pt-1 border-t ${
                          isUser ? 'border-white/5' : 'border-slate-900/10'
                        }`}>
                          
                          {/* Ouvir Áudio */}
                          <button
                            onClick={() => speakText(msg.translatedText, isUser ? tgtLang.ttsVoiceLang : srcLang.ttsVoiceLang, msg.id)}
                            className={`p-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isUser 
                                ? (isPlaying ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 hover:bg-slate-700 text-amber-300')
                                : (isPlaying ? 'bg-slate-900 text-white font-black' : 'bg-slate-950/20 hover:bg-slate-950/30 text-slate-950')
                            }`}
                            title="Ouvir Tradução por Voz"
                          >
                            <Volume2 size={14} className={isPlaying ? 'animate-bounce' : ''} />
                            <span className="text-[10px] uppercase tracking-wider">{isPlaying ? 'A Falar...' : 'Ouvir'}</span>
                          </button>

                          {/* Copiar */}
                          <button
                            onClick={() => copyTranslation(msg.translatedText, msg.id)}
                            className={`p-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isUser ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-950/20 hover:bg-slate-950/30 text-slate-950'
                            }`}
                            title="Copiar Tradução"
                          >
                            {copiedId === msg.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>

                          {/* WhatsApp */}
                          <button
                            onClick={() => shareWhatsApp(msg)}
                            className={`p-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isUser ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-950/20 hover:bg-slate-950/30 text-slate-950'
                            }`}
                            title="Partilhar no WhatsApp"
                          >
                            <Share2 size={14} />
                          </button>

                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Indicador de Transcrição Ao Vivo enquanto fala */}
              {recordingSide && (
                <div className={`flex flex-col ${recordingSide === 'A' ? 'items-start' : 'items-end'} animate-in fade-in`}>
                  <div className="max-w-[85%] rounded-2xl p-4 bg-slate-950 border border-amber-500/50 text-slate-200 space-y-1.5 shadow-lg">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                      <span>A escutar {recordingSide === 'A' ? selectedLangA.name : selectedLangB.name}...</span>
                    </div>
                    <p className="text-sm font-medium italic text-slate-300">
                      {interimTranscript || 'Pode falar para o microfone...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Indicador de processamento */}
              {isTranslating && (
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 py-1 animate-pulse">
                  <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>A traduzir em tempo real...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

          </div>

          {/* DOCK DE COMANDO & ENTRADA DE VOZ/TEXTO */}
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-3 sm:p-4 shadow-xl">
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Botão de Gravação de Voz Principal */}
              <button
                type="button"
                onClick={() => recordingSide === 'A' ? stopRecording() : startRecording('A')}
                disabled={isTranslating}
                className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all cursor-pointer font-black shadow-lg ${
                  recordingSide === 'A'
                    ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30 scale-105'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:scale-105 active:scale-95'
                } ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={recordingSide === 'A' ? 'Parar gravação' : `Falar em ${selectedLangA.name}`}
              >
                {recordingSide === 'A' ? <MicOff size={24} /> : <Mic size={24} />}
              </button>

              {/* Campo de Entrada de Texto */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleTranslateAndSend(textInputA, 'user', selectedLangA, selectedLangB);
                }}
                className="flex-1 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={textInputA}
                  onChange={e => setTextInputA(e.target.value)}
                  placeholder={`Fale no microfone ou digite em ${selectedLangA.name.split('(')[0]}...`}
                  disabled={isTranslating || recordingSide !== null}
                  className="flex-1 px-4 py-3.5 bg-slate-950 border border-slate-700/80 focus:border-amber-500 rounded-xl text-sm font-medium text-white placeholder-slate-500 outline-none transition-all shadow-inner"
                />

                <button
                  type="submit"
                  disabled={!textInputA.trim() || isTranslating}
                  className="px-4 sm:px-5 py-3.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-md active:scale-95"
                  title="Enviar e Traduzir"
                >
                  <Send size={15} />
                  <span className="hidden sm:inline">Enviar</span>
                </button>
              </form>

            </div>
          </div>

        </div>
      )}

      {/* ÁREA: MODO FRASES RÁPIDAS DE OBRA */}
      {activeMode === 'quick_phrases' && (
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <Construction size={22} className="text-amber-400" />
                <span>Frases Rápidas & Instruções de Obra</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Toque em qualquer instrução para traduzir e transmitir instantaneamente em <strong>{selectedLangB.name}</strong>.
              </p>
            </div>
            <button
              onClick={() => setActiveMode('conversation')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 self-start cursor-pointer"
            >
              <MessageSquare size={14} />
              <span>Voltar ao Chat</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {QUICK_CONSTRUCTION_PHRASES.map((group, idx) => {
              const IconComp = group.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-white/10 space-y-4 flex flex-col justify-between shadow-inner">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <IconComp size={16} />
                      </div>
                      <span>{group.category}</span>
                    </div>

                    <div className="space-y-2">
                      {group.phrases.map((phrase, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => {
                            setActiveMode('conversation');
                            handleTranslateAndSend(phrase, 'user', selectedLangA, selectedLangB);
                          }}
                          disabled={isTranslating}
                          className="w-full text-left p-3.5 rounded-xl bg-slate-900 hover:bg-amber-500/15 border border-slate-800 hover:border-amber-500/40 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer shadow-xs active:scale-98 flex items-start justify-between gap-2 group"
                        >
                          <span className="leading-relaxed">"{phrase}"</span>
                          <Send size={13} className="text-slate-600 group-hover:text-amber-400 shrink-0 mt-0.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DICA INFORMATIVA INFERIOR */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-slate-300 text-xs font-medium flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5">
          <Info size={18} className="text-amber-400 shrink-0" />
          <span>
            <strong>Dica de Tradução:</strong> Abra o Link/QR Code no telemóvel do cliente para que ele converse em tempo real no idioma dele sem precisar instalar nada!
          </span>
        </div>
        <button
          onClick={() => setShowConnectModal(true)}
          className="font-bold text-amber-400 hover:text-amber-300 shrink-0 underline decoration-amber-400/40 underline-offset-4 cursor-pointer"
        >
          Ver QR Code
        </button>
      </div>

    </div>
  );
};

export default VoiceTranslator;
