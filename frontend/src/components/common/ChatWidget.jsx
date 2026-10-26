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
        message: text,
      });
    } else {
      setTimeout(() => {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: '⚠️ [Modo Offline]: El backend WebSocket no está conectado en este momento. Verifique que LocalStack o el servidor de desarrollo esté activo.',
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
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-full shadow-lg transition-transform hover:scale-105"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span>Asistente HALO</span>
        </button>
      )}

      {isOpen && (
        <div className="w-96 h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-amber-400'} animate-pulse`} />
              <div>
                <h3 className="font-semibold text-sm">HALO Assistant (RAG + FSM)</h3>
                <p className="text-xs text-blue-200">{isConnected ? 'Conectado en vivo' : 'Conectando...'}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 p-1 rounded-lg hover:bg-blue-800 transition"
            >
              ✕
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 text-sm">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : msg.sender === 'system'
                      ? 'bg-amber-50 text-amber-900 border border-amber-200 text-xs'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                  {msg.engine && (
                    <div className="mt-1 text-[10px] text-gray-400 text-right uppercase tracking-wider">
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
                        className="text-xs bg-white text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full hover:bg-blue-50 transition"
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
            className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe tu mensaje o consulta..."
              className="flex-1 text-sm bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3.5 py-2.5 rounded-xl transition"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
