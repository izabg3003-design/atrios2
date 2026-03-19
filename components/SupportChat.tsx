import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, Headphones, Loader2 } from 'lucide-react';
import { SupportMessage, Company } from '../types';
import { getMessages, saveMessage, markMessagesAsRead } from '../services/storage';
import { supabase } from '../services/supabase';
import { Locale, translations } from '../translations';
import { translateMessage } from '../services/gemini';

interface SupportChatProps {
  company: Company;
  locale: Locale;
  onClose: () => void;
}

const SupportChat: React.FC<SupportChatProps> = ({ company, locale, onClose }) => {
  const t = translations[locale];
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMsgs = () => {
      setMessages(getMessages(company.id));
    };

    fetchMsgs();
    
    // Subscrição em tempo real para novas mensagens
    const channel = supabase
      .channel(`chat-${company.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `companyId=eq.${company.id}`
        },
        (payload) => {
          const newMessage = payload['new'] as SupportMessage;
          if (!newMessage || !newMessage.id) return;

          setMessages(prev => {
            if (prev.find(m => m.id === newMessage.id)) {
              // Se já existe, apenas atualizamos o estado de leitura se necessário
              return prev.map(m => m.id === newMessage.id ? { ...m, ...newMessage } : m);
            }
            
            // Atualizar localStorage para manter consistência
            const allMsgs = getMessages();
            if (!allMsgs.find(m => m.id === newMessage.id)) {
              allMsgs.push(newMessage);
              localStorage.setItem('atrios_messages', JSON.stringify(allMsgs));
            }
            
            return [...prev, newMessage];
          });
        }
      )
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          console.warn("Realtime não disponível, usando fallback...");
        }
      });

    // Fallback: Busca a cada 10 segundos caso o Realtime falhe
    const fallbackInterval = setInterval(fetchMsgs, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(fallbackInterval);
    };
  }, [company.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isTranslating) return;

    setIsTranslating(true);
    
    // Se o idioma não for PT-PT, traduzir para PT-PT antes de enviar para o Master
    let translated = newMessage;
    if (locale !== 'pt-PT') {
      translated = await translateMessage(newMessage, 'pt-PT');
    }

    const msg: SupportMessage = {
      id: Math.random().toString(36).substr(2, 9),
      companyId: company.id,
      senderRole: 'user',
      content: newMessage, // Original em qualquer idioma
      translatedContent: translated, // Sempre em PT-PT para o Master
      timestamp: new Date().toISOString(),
      read: false
    };

    saveMessage(msg);
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
    setIsTranslating(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-32 sm:right-8 w-full sm:w-96 h-[100dvh] sm:h-[500px] bg-white sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500 z-[9999] border-t sm:border border-slate-100">
      <div className="p-4 lg:p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 text-slate-900 rounded-full flex items-center justify-center">
            <Headphones size={20} />
          </div>
          <h3 className="font-black italic text-lg">{t.supportChatTitle}</h3>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 no-scrollbar bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-3xl flex items-center justify-center">
               <MessageSquare size={32} />
             </div>
             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-8">
               {t.supportNoMessages}
             </p>
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} className={`flex ${m.senderRole === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[80%] p-4 rounded-[1.5rem] text-sm font-bold shadow-sm ${
                m.senderRole === 'user' 
                ? 'bg-slate-900 text-white rounded-tr-none' 
                : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
              }`}>
                {/* Se for mensagem do Master para o Usuário, o Usuário vê a tradução se disponível */}
                {m.senderRole === 'master' ? (m.translatedContent || m.content) : m.content}
                <div className={`text-[8px] mt-2 font-black uppercase opacity-40 ${m.senderRole === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 lg:p-6 bg-white border-t border-slate-100 flex gap-3 shrink-0 pb-8 sm:pb-6">
        <input 
          disabled={isTranslating}
          type="text" 
          value={newMessage} 
          onChange={e => setNewMessage(e.target.value)} 
          placeholder={t.supportChatPlaceholder} 
          className="flex-1 px-4 lg:px-5 py-3 lg:py-3.5 rounded-xl lg:rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none font-bold text-sm focus:border-slate-900 transition-all disabled:opacity-50"
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim() || isTranslating}
          className="bg-slate-900 text-white p-3 lg:p-3.5 rounded-xl lg:rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-30 disabled:scale-100"
        >
          {isTranslating ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </form>
    </div>
  );
};

export default SupportChat;