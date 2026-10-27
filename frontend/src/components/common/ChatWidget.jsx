import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import MascotAvatar from '../chat/MascotAvatar';
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

const getInitialGreeting = (mascot = 'kuntur') => ({
  sender: 'bot',
  text:
    mascot === 'zeo'
      ? `👋 ¡Hola! Soy **Zeo**, tu cebra educadora y embajador ciudadano de HALO La Paz.\n\nPuedo ayudarte a reportar incidentes viales, emergencias y baches, consultar teléfonos de auxilio o dar seguimiento a tus reportes en la ciudad con educación ciudadana.\n\n¿En qué te puedo colaborar hoy?`
      : `👋 ¡Hola! Soy **Kuntur**, tu guardián ciudadano de HALO La Paz.\n\nPuedo ayudarte a reportar emergencias, consultar teléfonos de auxilio o dar seguimiento a tus casos en la ciudad.\n\n¿En qué te puedo colaborar hoy?`,
  state: 'GREETING',
  suggestedActions: ['Reportar incidente', 'Números de emergencia', 'Estado de mi reporte'],
});

export default function ChatWidget() {
  const [selectedMascot, setSelectedMascot] = useState(() => {
    return localStorage.getItem('halo_mascot') || 'kuntur';
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isOpeningTransition, setIsOpeningTransition] = useState(false);
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState(() => [getInitialGreeting(selectedMascot)]);
  const [fsmState, setFsmState] = useState('GREETING');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  // Proactive speech bubble state
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [speechBubbleText, setSpeechBubbleText] = useState(() =>
    selectedMascot === 'zeo'
      ? '👋 ¡Hola! Soy Zeo, tu cebra de La Paz. Haz clic en mí si necesitas reportar un incidente.'
      : '👋 ¡Hola! Soy Kuntur. Haz clic en mí si necesitas reportar un incidente.'
  );
  const [showEmergencyMenu, setShowEmergencyMenu] = useState(false);

  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
  const token = localStorage.getItem('token') || 'demo-citizen-token';

  const { isConnected, sendMessage, lastMessage } = useWebSocket(isOpen ? wsUrl : null, token);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectMascot = (mascotKey) => {
    if (mascotKey === selectedMascot) return;
    setSelectedMascot(mascotKey);
    localStorage.setItem('halo_mascot', mascotKey);

    const mascotName = mascotKey === 'zeo' ? 'Zeo (Cebra)' : 'Kuntur (Cóndor)';
    setSpeechBubbleText(
      mascotKey === 'zeo'
        ? '👋 ¡Hola! Soy Zeo, tu cebra de La Paz. Haz clic en mí si necesitas reportar un incidente.'
        : '👋 ¡Hola! Soy Kuntur. Haz clic en mí si necesitas reportar un incidente.'
    );

    // If chat only has initial greeting, replace it with the new mascot greeting
    if (chatHistory.length <= 1 && chatHistory[0]?.sender === 'bot') {
      setChatHistory([getInitialGreeting(mascotKey)]);
    } else {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'system',
          text: `✨ Has seleccionado a ${mascotName} como tu asistente de HALO La Paz.`,
        },
      ]);
    }
  };

  // Proactive greeting bubble after 3.5s
  useEffect(() => {
    if (isOpen) return;

    const timer = setTimeout(() => {
      setShowSpeechBubble(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, [isOpen]);

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

  // Handle open chat with graceful wing/ear spread
  const handleOpenChat = () => {
    setShowSpeechBubble(false);
    setIsOpeningTransition(true);
    setTimeout(() => {
      setIsOpen(true);
      setIsOpeningTransition(false);
    }, 280);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
  };

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
        const mascotName = selectedMascot === 'zeo' ? 'Zeo' : 'Kuntur';
        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: `ℹ️ (Modo desconectado) Mensaje recibido: "${text}". ${mascotName} se reconectará automáticamente al servicio.`,
            suggestedActions: ['Reportar incidente', 'Menú principal'],
          },
        ]);
      }, 500);
    }
  };

  const handleResetChat = () => {
    setChatHistory([getInitialGreeting(selectedMascot)]);
    setFsmState('GREETING');
    setIsProcessing(false);
  };

  // Dynamic context placeholder for input
  const placeholderText = useMemo(() => {
    const name = selectedMascot === 'zeo' ? 'Zeo' : 'Kuntur';
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
        return 'Escribe "sí" para registrar o "cancelar"...';
      default:
        return `Escribe tu mensaje a ${name}...`;
    }
  }, [fsmState, selectedMascot]);

  // Gaze tracking
  const lookDirection = isInputFocused || inputText.length > 0 ? 'down' : 'center';

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50 font-sans">
      {/* 1. STANDALONE RESPONSIVE MASCOT LAUNCHER (ADAPTIVE SIZE) */}
      {!isOpen && (
        <div className="relative flex flex-col items-end group">
          {/* Proactive Speech Bubble with Tail */}
          {showSpeechBubble && (
            <div className="mb-2 sm:mb-3 max-w-[240px] sm:max-w-[280px] p-2.5 px-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 text-xs font-medium shadow-xl border border-slate-200/80 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-300 relative group/bubble">
              <div className="flex items-start justify-between gap-1.5">
                <p
                  onClick={handleOpenChat}
                  className="cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors leading-relaxed"
                >
                  {speechBubbleText}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSpeechBubble(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md"
                  title="Cerrar mensaje"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Bubble Triangle Tail pointing to Mascot */}
              <div className="absolute top-full right-8 -mt-1 border-6 border-transparent border-t-white dark:border-t-slate-900 drop-shadow-2xs" />
            </div>
          )}

          {/* Quick Switch Mascot Pill Button on Floating Hover */}
          <div className="mb-1.5 flex items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full shadow-md border border-slate-200/80 dark:border-slate-800 p-0.5 opacity-90 hover:opacity-100 transition-all">
            <button
              type="button"
              onClick={() => handleSelectMascot('kuntur')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition ${
                selectedMascot === 'kuntur'
                  ? 'bg-teal-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-teal-600'
              }`}
              title="Seleccionar a Kuntur (Cóndor)"
            >
              🦅 Kuntur
            </button>
            <button
              type="button"
              onClick={() => handleSelectMascot('zeo')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition ${
                selectedMascot === 'zeo'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
              title="Seleccionar a Zeo (Cebra de La Paz)"
            >
              🦓 Zeo
            </button>
          </div>

          {/* Standalone Mascot with Responsive Size */}
          <button
            type="button"
            onClick={handleOpenChat}
            onMouseEnter={() => {
              setSpeechBubbleText(
                selectedMascot === 'zeo'
                  ? '✨ ¡Haz clic aquí para mover mis orejitas y chatear!'
                  : '✨ ¡Haz clic aquí para desplegar mis alas y chatear!'
              );
              setShowSpeechBubble(true);
            }}
            onMouseLeave={() => {
              setSpeechBubbleText(
                selectedMascot === 'zeo'
                  ? '👋 ¡Hola! Soy Zeo, tu cebra de La Paz. Haz clic en mí si necesitas reportar un incidente.'
                  : '👋 ¡Hola! Soy Kuntur. Haz clic en mí si necesitas reportar un incidente.'
              );
            }}
            className="relative flex items-center justify-center p-1 rounded-full focus:outline-none transition-transform duration-300 hover:scale-110 active:scale-95"
            style={{
              animation: 'mascotFloat 3.8s ease-in-out infinite',
            }}
            aria-label={`Hablar con ${selectedMascot === 'zeo' ? 'Zeo' : 'Kuntur'}`}
          >
            {/* Ambient Reactive Glow Halo */}
            <div
              className={`absolute inset-0 rounded-full blur-lg transition-all duration-300 animate-pulse ${
                selectedMascot === 'zeo'
                  ? 'bg-zinc-500/25 group-hover:bg-zinc-400/40'
                  : 'bg-teal-500/25 group-hover:bg-teal-400/40'
              }`}
            />

            {/* Mascot Avatar with Global Mouse Cursor Eye Tracking & Responsive Sizing */}
            <MascotAvatar
              mascot={selectedMascot}
              state="idle"
              trackCursor={!isOpen}
              wingsOpen={isOpeningTransition}
              size="responsive-fab"
              interactive={true}
            />

            {/* Status Live Indicator Badge */}
            <span
              title={
                isConnected
                  ? `${selectedMascot === 'zeo' ? 'Zeo' : 'Kuntur'} en línea`
                  : `Conectando con ${selectedMascot === 'zeo' ? 'Zeo' : 'Kuntur'}...`
              }
              className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm transition-colors duration-300 ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </button>
        </div>
      )}

      {/* 2. CHATBOT WINDOW (Clean, Minimalist Grok/ChatGPT Layout) */}
      {isOpen && (
        <div className="w-[94vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col border border-slate-200/90 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-bottom-right">
          
          {/* HEADER */}
          <div className="p-3 px-4 bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200/70 dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* Mascot in Header with Real-time State */}
              <div className="relative">
                <MascotAvatar
                  mascot={selectedMascot}
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
                    {selectedMascot === 'zeo' ? 'Zeo' : 'Kuntur'}
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md font-semibold ${
                      selectedMascot === 'zeo'
                        ? 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                        : 'bg-teal-100/80 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300'
                    }`}
                  >
                    HALO LPZ
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isProcessing
                    ? 'Pensando...'
                    : isConnected
                    ? selectedMascot === 'zeo'
                      ? 'Cebra Educadora en línea'
                      : 'Guardián en línea en La Paz'
                    : 'Conectando...'}
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1">
              {/* Mascot Selector Pills */}
              <div className="flex items-center bg-slate-200/60 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-300/40 dark:border-slate-700/50 mr-1">
                <button
                  type="button"
                  onClick={() => handleSelectMascot('kuntur')}
                  className={`px-1.5 py-0.5 rounded-lg text-[11px] font-medium transition ${
                    selectedMascot === 'kuntur'
                      ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                  title="Cambiar a Kuntur (Cóndor)"
                >
                  🦅
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectMascot('zeo')}
                  className={`px-1.5 py-0.5 rounded-lg text-[11px] font-medium transition ${
                    selectedMascot === 'zeo'
                      ? 'bg-white dark:bg-slate-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                  title="Cambiar a Zeo (Cebra de La Paz)"
                >
                  🦓
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetChat}
                title="Reiniciar conversación"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              {/* Emergency Direct-Dial Popover */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmergencyMenu(!showEmergencyMenu)}
                  title="Líneas telefónicas de emergencia en La Paz"
                  className="text-rose-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center justify-center"
                >
                  <PhoneCall className="w-4 h-4" />
                </button>

                {showEmergencyMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
                      Llamar a Emergencias:
                    </p>
                    <a
                      href="tel:110"
                      onClick={() => setShowEmergencyMenu(false)}
                      className="flex items-center justify-between p-1.5 px-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition text-xs font-medium"
                    >
                      <span>110 - Radio Patrulla</span>
                      <PhoneCall className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="tel:119"
                      onClick={() => setShowEmergencyMenu(false)}
                      className="flex items-center justify-between p-1.5 px-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 transition text-xs font-medium"
                    >
                      <span>119 - Bomberos LPZ</span>
                      <PhoneCall className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="tel:114"
                      onClick={() => setShowEmergencyMenu(false)}
                      className="flex items-center justify-between p-1.5 px-2 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/40 text-teal-600 dark:text-teal-400 transition text-xs font-medium"
                    >
                      <span>114 - Red GAMLP</span>
                      <PhoneCall className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleCloseChat}
                title="Cerrar chat"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition ml-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MESSAGE STREAM */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/40 dark:bg-slate-950/40">
            {chatHistory.map((msg, idx) => {
              const isLastBotMessage = msg.sender === 'bot' && idx === chatHistory.length - 1;

              if (msg.sender === 'user') {
                return (
                  <div key={idx} className="flex justify-end animate-in fade-in duration-150">
                    <div
                      className={`max-w-[85%] rounded-2xl rounded-br-xs px-3.5 py-2.5 text-white shadow-2xs text-sm transition-colors ${
                        selectedMascot === 'zeo' ? 'bg-zinc-800' : 'bg-teal-700'
                      }`}
                    >
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

              // Bot Message with Mini-Mascot Avatar
              return (
                <div key={idx} className="flex items-start gap-2.5 animate-in fade-in duration-200">
                  <div className="shrink-0 mt-0.5">
                    <MascotAvatar
                      mascot={selectedMascot}
                      state={msg.state || 'idle'}
                      size="sm"
                      interactive={false}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="rounded-2xl rounded-bl-xs p-3.5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs text-slate-800 dark:text-slate-100">
                      {/* Rich Formatted Markdown (NO ASTERISKS!) */}
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
                            className={`text-xs bg-white dark:bg-slate-800 px-3 py-1 rounded-full active:scale-95 transition font-medium shadow-2xs ${
                              selectedMascot === 'zeo'
                                ? 'hover:bg-zinc-100 dark:hover:bg-slate-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700'
                                : 'hover:bg-teal-50 dark:hover:bg-slate-700 text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-teal-700/60'
                            }`}
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

            {/* MASCOT THINKING INDICATOR */}
            {isProcessing && (
              <div
                className={`flex items-center gap-2 text-xs p-2 px-3 rounded-2xl border w-fit animate-pulse ${
                  selectedMascot === 'zeo'
                    ? 'text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-slate-800 border-zinc-200 dark:border-zinc-700'
                    : 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-slate-800 border-teal-100 dark:border-teal-900/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>
                  {selectedMascot === 'zeo' ? 'Zeo está pensando...' : 'Kuntur está pensando...'}
                </span>
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
              className={`flex-1 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 transition ${
                selectedMascot === 'zeo'
                  ? 'focus:ring-zinc-400/30 focus:border-zinc-500'
                  : 'focus:ring-teal-500/30 focus:border-teal-600'
              }`}
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className={`disabled:opacity-40 text-white p-2.5 rounded-xl transition shadow-xs flex items-center justify-center shrink-0 active:scale-95 ${
                selectedMascot === 'zeo'
                  ? 'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600'
                  : 'bg-teal-700 hover:bg-teal-800'
              }`}
              title={`Enviar mensaje a ${selectedMascot === 'zeo' ? 'Zeo' : 'Kuntur'}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Sway Keyframes */}
      <style>{`
        @keyframes mascotFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
      `}</style>
    </div>
  );
}
