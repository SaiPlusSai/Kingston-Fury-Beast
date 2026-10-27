import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import KunturBlob from '../chat/KunturBlob';
import FormattedMessage from '../chat/FormattedMessage';
import QuickCategoryChips from '../chat/components/QuickCategoryChips';
import LocationActionCard from '../chat/components/LocationActionCard';
import MediaDropzone from '../chat/components/MediaDropzone';
import ReportSummaryCard from '../chat/components/ReportSummaryCard';
import {
  Send,
  X,
  RotateCcw,
  PhoneCall,
  Sparkles,
} from 'lucide-react';

const INITIAL_GREETING = {
  sender: 'bot',
  text: `👋 ¡Hola! Soy **Kuntur**, tu asistente ciudadano de HALO La Paz.\n\nPuedo ayudarte a reportar emergencias, consultar números de auxilio o hacer seguimiento a tus casos en la ciudad.\n\n¿En qué te puedo colaborar hoy?`,
  state: 'GREETING',
  suggestedActions: ['Reportar incidente', 'Números de emergencia', 'Estado de mi reporte'],
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState([INITIAL_GREETING]);
  const [fsmState, setFsmState] = useState('GREETING');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
  const token = localStorage.getItem('token') || 'demo-citizen-token';

  const { isConnected, sendMessage, lastMessage } = useWebSocket(isOpen ? wsUrl : null, token);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Sync incoming WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      setIsProcessing(false);

      if (lastMessage.type === 'message' || lastMessage.type === 'response') {
        const nextState = lastMessage.state || (lastMessage.intent === 'create' ? 'ASK_CATEGORY' : 'idle');
        setFsmState(nextState);

        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: lastMessage.text || lastMessage.message || JSON.stringify(lastMessage),
            state: lastMessage.state,
            reportId: lastMessage.reportId,
            engine: lastMessage.engine,
            suggestedActions: lastMessage.suggestedActions,
          },
        ]);
      } else if (lastMessage.type === 'notification') {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'system',
            text: lastMessage.data?.message || '🔔 Notificación de actualización de reporte',
          },
        ]);
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isProcessing]);

  const handleSend = (textToSend) => {
    const text = (textToSend || inputText || '').trim();
    if (!text) return;

    setChatHistory((prev) => [...prev, { sender: 'user', text }]);
    setInputText('');
    setIsProcessing(true);

    if (/incendio|robo|accidente|asalto|fuego|herido|peligro/i.test(text)) {
      setFsmState('EMERGENCY_ALERT');
    }

    if (isConnected) {
      sendMessage({
        action: 'sendMessage',
        text,
      });
    } else {
      setTimeout(() => {
        setIsProcessing(false);
        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: `ℹ️ (Modo desconectado) Mensaje recibido: "${text}". Kuntur se reconectará automáticamente al servicio.`,
            suggestedActions: ['Reportar incidente', 'Menú principal'],
          },
        ]);
      }, 500);
    }
  };

  const handleResetChat = () => {
    setChatHistory([INITIAL_GREETING]);
    setFsmState('GREETING');
    setIsProcessing(false);
  };

  // Dynamic context placeholder for input
  const placeholderText = useMemo(() => {
    switch (fsmState) {
      case 'ASK_CATEGORY':
        return 'Elige una categoría arriba o escribe el número...';
      case 'ASK_DESCRIPTION':
        return 'Describe brevemente qué está pasando...';
      case 'ASK_LOCATION':
        return 'Indica la calle, esquina o Macrodistrito...';
      case 'ASK_PHOTO':
        return 'Escribe "1" para omitir o sube una foto...';
      case 'CONFIRM':
        return 'Escribe "sí" para confirmar o "cancelar"...';
      default:
        return 'Escribe tu mensaje a Kuntur...';
    }
  }, [fsmState]);

  // Determine Kuntur's gaze and expressions
  const lookDirection = isInputFocused || inputText.length > 0 ? 'down' : 'center';

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* 1. MINIMALIST FLOATING ACTION BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 p-2 pr-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Abrir asistente Kuntur"
        >
          <div className="relative flex items-center justify-center">
            <KunturBlob state="idle" size="sm" interactive={false} />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                isConnected ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
            />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 transition-colors">
                Kuntur
              </span>
              <span className="text-[10px] text-teal-700 dark:text-teal-300 font-mono font-medium">
                LPZ
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              Asistente Ciudadano
            </p>
          </div>
        </button>
      )}

      {/* 2. CHATBOT WINDOW (Grok / ChatGPT Minimalist Style) */}
      {isOpen && (
        <div className="w-[94vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col border border-slate-200/90 dark:border-slate-800 overflow-hidden animate-in fade-in duration-200">
          
          {/* MINIMALIST HEADER */}
          <div className="p-3.5 px-4 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/70 dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* Interactive Kuntur Mascot */}
              <div className="relative">
                <KunturBlob
                  state={isProcessing ? 'PROCESSING' : fsmState}
                  lookAt={lookDirection}
                  isSpeaking={isProcessing}
                  size="md"
                />
                <span
                  title={isConnected ? 'Conectado en vivo' : 'Conectando...'}
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                    isConnected ? 'bg-emerald-500' : 'bg-amber-400'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Kuntur
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-teal-100/80 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-semibold">
                    HALO LPZ
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span>{isProcessing ? 'Pensando...' : isConnected ? 'En línea en La Paz' : 'Conectando...'}</span>
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Reiniciar conversación"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <a
                href="tel:110"
                title="Llamar a Radio Patrulla 110"
                className="text-rose-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Cerrar chat"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition ml-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MESSAGE STREAM */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-slate-50/40 dark:bg-slate-950/40">
            {chatHistory.map((msg, idx) => {
              const isLastBotMessage = msg.sender === 'bot' && idx === chatHistory.length - 1;

              if (msg.sender === 'user') {
                return (
                  <div key={idx} className="flex justify-end animate-in fade-in duration-150">
                    <div className="max-w-[85%] rounded-2xl rounded-br-xs px-3.5 py-2.5 bg-teal-700 text-white shadow-2xs text-sm">
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                );
              }

              if (msg.sender === 'system') {
                return (
                  <div key={idx} className="flex justify-center my-1">
                    <div className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300">
                      {msg.text}
                    </div>
                  </div>
                );
              }

              // Bot Message with Mini-Kuntur
              return (
                <div key={idx} className="flex items-start gap-2.5 animate-in fade-in duration-200">
                  <div className="shrink-0 mt-0.5">
                    <KunturBlob
                      state={msg.state || 'idle'}
                      size="sm"
                      interactive={false}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="rounded-2xl rounded-bl-xs p-3.5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs text-slate-800 dark:text-slate-100">
                      {/* Rich Formatted Markdown Text (NO ASTERISKS!) */}
                      <FormattedMessage text={msg.text} />

                      {msg.engine && (
                        <div className="mt-1.5 text-[9px] text-slate-400 font-mono text-right">
                          Motor: {msg.engine}
                        </div>
                      )}
                    </div>

                    {/* Gen UI: Step 1 Category Chips */}
                    {isLastBotMessage && msg.state === 'ASK_CATEGORY' && (
                      <QuickCategoryChips onSelect={(cat) => handleSend(cat)} />
                    )}

                    {/* Gen UI: Step 3 Location Picker */}
                    {isLastBotMessage && msg.state === 'ASK_LOCATION' && (
                      <LocationActionCard onSelectLocation={(loc) => handleSend(loc)} />
                    )}

                    {/* Gen UI: Step 4 Media Dropzone */}
                    {isLastBotMessage && msg.state === 'ASK_PHOTO' && (
                      <MediaDropzone
                        onAttachPhoto={(url) => handleSend(url)}
                        onSkip={() => handleSend('1')}
                      />
                    )}

                    {/* Gen UI: Step 5 / Done Report Card */}
                    {msg.reportId && (
                      <ReportSummaryCard
                        reportId={msg.reportId}
                        onNewReport={() => handleSend('reportar')}
                      />
                    )}

                    {/* Suggested Action Chips */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && isLastBotMessage && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.suggestedActions.map((action, aIdx) => (
                          <button
                            key={aIdx}
                            type="button"
                            onClick={() => handleSend(action)}
                            className="text-xs bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-teal-700/60 px-3 py-1 rounded-full active:scale-95 transition font-medium shadow-2xs"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* KUNTUR SPEAKING / TYPING INDICATOR */}
            {isProcessing && (
              <div className="flex items-center gap-2 text-xs text-teal-700 dark:text-teal-300 p-2 px-3 rounded-2xl bg-teal-50 dark:bg-slate-800 border border-teal-100 dark:border-teal-900/40 w-fit animate-pulse">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Kuntur está pensando...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT BAR */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputText}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={placeholderText}
              className="flex-1 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white p-2.5 rounded-xl transition shadow-xs flex items-center justify-center shrink-0 active:scale-95"
              title="Enviar mensaje a Kuntur"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
