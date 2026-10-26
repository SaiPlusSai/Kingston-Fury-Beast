import { useState, useEffect, useRef, useCallback } from 'react';

const PING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos (Keepalive / Heartbeat para RISK-03)
const INITIAL_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30000;

/**
 * Custom Hook para conexion WebSocket bidireccional con reconexion automatica
 * y mecanismo de keepalive cada 5 minutos para mitigar timeout de inactividad de AWS (RISK-03).
 *
 * @param {string} url - URL del endpoint WSS
 * @param {string} token - JWT token de autenticacion
 */
export function useWebSocket(url, token) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const pingTimerRef = useRef(null);
  const backoffRef = useRef(INITIAL_BACKOFF_MS);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    if (!url || !token) return;

    try {
      const fullUrl = `${url}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(fullUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Conectado exitosamente');
        setIsConnected(true);
        setError(null);
        backoffRef.current = INITIAL_BACKOFF_MS; // reset backoff

        // Iniciar Heartbeat Keepalive cada 5 minutos (mitigacion timeout 10 min de API Gateway)
        if (pingTimerRef.current) clearInterval(pingTimerRef.current);
        pingTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            console.log('[WebSocket] Enviando ping de keepalive...');
            ws.send(JSON.stringify({ action: 'ping' }));
          }
        }, PING_INTERVAL_MS);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'pong') {
            console.log('[WebSocket] Pong recibido (keepalive confirmado):', data);
            return;
          }
          setLastMessage(data);
          setMessages((prev) => [...prev, data]);
        } catch {
          setLastMessage(event.data);
          setMessages((prev) => [...prev, event.data]);
        }
      };

      ws.onclose = (event) => {
        console.warn(`[WebSocket] Desconectado (codigo: ${event.code})`);
        setIsConnected(false);
        if (pingTimerRef.current) clearInterval(pingTimerRef.current);

        // Reconexion automatica con backoff exponencial
        const delay = backoffRef.current;
        console.log(`[WebSocket] Reintentando conexion en ${delay} ms...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          backoffRef.current = Math.min(backoffRef.current * 1.5, MAX_BACKOFF_MS);
          connect();
        }, delay);
      };

      ws.onerror = (err) => {
        console.error('[WebSocket] Error en socket:', err);
        setError(err);
      };
    } catch (err) {
      console.error('[WebSocket] Error instanciando WebSocket:', err);
      setError(err);
    }
  }, [url, token]);

  useEffect(() => {
    connect();
    return () => {
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((payload) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
      wsRef.current.send(data);
      return true;
    }
    console.warn('[WebSocket] No se pudo enviar mensaje: socket no esta abierto');
    return false;
  }, []);

  return { isConnected, messages, lastMessage, sendMessage, error };
}

export default useWebSocket;
