"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUserStore } from "@/lib/stores/userStore";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Singleton — apenas uma conexão WebSocket por aplicação
let socketInstance: Socket | null = null;
let activeToken: string | null = null;

function getAuthToken() {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isLoggedIn } = useUserStore();

  useEffect(() => {
    if (!isLoggedIn) {
      // Se deslogou, desconecta e limpa singleton
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
      activeToken = null;
      socketRef.current = null;
      setIsConnected(false);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setIsConnected(false);
      return;
    }

    if (!socketInstance) {
      socketInstance = io(`${SOCKET_URL}/chat`, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        autoConnect: true,
      });
      activeToken = token;
    }

    // Token mudou durante a sessão: força reconnect com novo auth.
    if (activeToken !== token && socketInstance) {
      activeToken = token;
      socketInstance.auth = { token };
      if (socketInstance.connected) {
        socketInstance.disconnect();
      }
      socketInstance.connect();
    } else if (socketInstance && socketInstance.disconnected) {
      socketInstance.connect();
    }

    socketRef.current = socketInstance;
    setIsConnected(socketInstance.connected);

    const currentSocket = socketInstance;
    const handleConnect = () => {
      setIsConnected(true);
    };
    const handleDisconnect = () => {
      setIsConnected(false);
    };
    const handleConnectError = (err: Error) => {
      console.error("[Socket] Erro de conexão:", err.message);
      setIsConnected(false);
    };

    currentSocket.on("connect", handleConnect);
    currentSocket.on("disconnect", handleDisconnect);
    currentSocket.on("connect_error", handleConnectError);

    return () => {
      currentSocket.off("connect", handleConnect);
      currentSocket.off("disconnect", handleDisconnect);
      currentSocket.off("connect_error", handleConnectError);
    };
  }, [isLoggedIn]);

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
