import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'bot',
      text: '👋 ¡Hola! Soy el asistente virtual de HALO La Paz. Puedo ayudarte a reportar incidentes, consultar teléfonos de emergencia o resolver dudas de seguridad ciudadana mediante nuestro motor RAG.',
    },
  ]);

  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
  const token = localStorage.getItem('token') || 'demo-citizen-token';

  const { isConnected, sendMessage, lastMessage } = useWebSocket(isOpen ? wsUrl : null, token);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'message' || lastMessage.type === 'response') {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: lastMessage.text || lastMessage.message || JSON.stringify(lastMessage),
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
  }, [chatHistory]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    setChatHistory((prev) => [...prev, { sender: 'user', text }]);

    if (isConnected) {
      sendMessage({
        action: 'sendMessage',
        text,
      });
    } else {
      setTimeout(() => {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: 'ℹ️ (Modo desconectado) Mensaje recibido: "' + text + '". El motor WebSocket está iniciando.',
          },
        ]);
      }, 500);
    }

    setInputText('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-[#2F5D50] hover:bg-[#224840] text-white font-medium px-4.5 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 border border-white/20"
        >
          <svg className="w-5 h-5 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="text-sm font-semibold tracking-wide">Asistente HALO</span>
        </button>
      )}

      {isOpen && (
        <div className="w-96 h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col border border-border-light overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#22483E] via-[#2F5D50] to-[#3A7060] text-white p-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'} animate-pulse`} />
              <div>
                <h3 className="font-semibold text-sm text-white">HALO Assistant (RAG + FSM)</h3>
                <p className="text-[11px] text-emerald-100/90">{isConnected ? 'Conectado en vivo' : 'Conectando...'}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-emerald-100 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
            >
              ✕
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8F6F1] text-sm">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-[#2F5D50] text-white rounded-br-none shadow-sm'
                      : msg.sender === 'system'
                      ? 'bg-amber-50 text-amber-900 border border-amber-200 text-xs'
                      : 'bg-white text-gray-800 border border-border-light rounded-bl-none'
                  }`}
                >
                  {msg.text}
                  {msg.engine && (
                    <div className="mt-1 text-[10px] text-gray-400 text-right uppercase tracking-wider font-mono">
                      Motor: {msg.engine}
                    </div>
                  )}
                </div>

                {/* Suggested Actions Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.suggestedActions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSend(action)}
                        className="text-xs bg-white text-[#2F5D50] border border-[#9FBAAF]/60 px-2.5 py-1 rounded-full hover:bg-emerald-50/70 transition font-medium shadow-xs"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-border-light flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe tu mensaje o consulta..."
              className="flex-1 text-sm bg-[#F8F6F1] border border-border-light rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/30 focus:border-[#2F5D50] text-text-primary placeholder:text-text-muted"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-[#2F5D50] hover:bg-[#224840] disabled:opacity-50 text-white px-3.5 py-2.5 rounded-xl transition shadow-xs"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
