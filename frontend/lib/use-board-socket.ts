"use client";

import { useEffect, useRef } from "react";

export function useBoardSocket(boardId: string | undefined, onEvent: (event: MessageEvent) => void) {
  const handlerRef = useRef(onEvent);

  useEffect(() => {
    handlerRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!boardId || typeof window === "undefined") return;

    const token = localStorage.getItem("pulseboard_token");
    if (!token) return;

    let socket: WebSocket | null = null;
    let closed = false;
    let retry = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      const base = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws";
      socket = new WebSocket(`${base}?token=${encodeURIComponent(token)}`);

      socket.onopen = () => {
        retry = 0;
        socket?.send(JSON.stringify({ type: "subscribe", boardId }));
      };

      socket.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data) as { type?: string };
          if (data.type === "board:update") {
            handlerRef.current(event);
          }
        } catch {
          // ignore malformed frames
        }
      };

      socket.onclose = () => {
        if (closed) return;
        const delay = Math.min(30000, 1000 * 2 ** retry);
        retry += 1;
        timer = setTimeout(connect, delay);
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      closed = true;
      if (timer) clearTimeout(timer);
      socket?.close();
    };
  }, [boardId]);
}
