"use client";

import { useEffect, useRef } from "react";

export function useBoardEvents(boardId: string | undefined, onEvent: (event: MessageEvent) => void) {
  const handlerRef = useRef(onEvent);

  useEffect(() => {
    handlerRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!boardId || typeof window === "undefined") return;
    const base = process.env.NEXT_PUBLIC_SSE_URL ?? "http://localhost:4000";
    const source = new EventSource(`${base}/events?boardId=${encodeURIComponent(boardId)}`);
    const handler = (event: MessageEvent) => handlerRef.current(event);
    source.addEventListener("board:update", handler as EventListener);
    return () => {
      source.removeEventListener("board:update", handler as EventListener);
      source.close();
    };
  }, [boardId]);
}
