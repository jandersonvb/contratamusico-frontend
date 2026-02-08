"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUserStore } from "@/lib/stores/userStore";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Singleton — apenas uma conexão WebSocket por aplicação
let socketInstance: Socket | null = null;
let connectionCount = 0;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isLoggedIn } = useUserStore();

  useEffect(() => {
    if (!isLoggedIn) {
      // Se deslogou, desconecta
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        connectionCount = 0;
      }
      setIsConnected(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    // Reutiliza a mesma conexão se já existir e estiver conectada
    if (!socketInstance || socketInstance.disconnected) {
      socketInstance = io(`${SOCKET_URL}/chat`, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      socketInstance.on("connect", () => {
        console.log("[Socket] Conectado:", socketInstance?.id);
        setIsConnected(true);
      });

      socketInstance.on("disconnect", (reason) => {
        console.log("[Socket] Desconectado:", reason);
        setIsConnected(false);
      });

      socketInstance.on("connect_error", (err) => {
        console.error("[Socket] Erro de conexão:", err.message);
        setIsConnected(false);
      });
    } else {
      setIsConnected(socketInstance.connected);
    }

    socketRef.current = socketInstance;
    connectionCount++;

    return () => {
      connectionCount--;
      if (connectionCount <= 0 && socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        connectionCount = 0;
        setIsConnected(false);
      }
    };
  }, [isLoggedIn]);

  // Sincroniza ref quando o singleton muda
  useEffect(() => {
    socketRef.current = socketInstance;
  });

  const emit = useCallback(
    <T = unknown>(event: string, data?: T, callback?: (response: unknown) => void) => {
      if (socketRef.current?.connected) {
        if (callback) {
          socketRef.current.emit(event, data, callback);
        } else {
          socketRef.current.emit(event, data);
        }
      }
    },
    []
  );

  const on = useCallback(
    (event: string, handler: (...args: unknown[]) => void) => {
      socketRef.current?.on(event, handler);
      return () => {
        socketRef.current?.off(event, handler);
      };
    },
    []
  );

  return {
    socket: socketRef.current,
    emit,
    on,
    isConnected,
  };
}
