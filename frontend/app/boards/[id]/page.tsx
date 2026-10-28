"use client";

import { useCallback } from "react";
import { useParams } from "next/navigation";
import { useGetBoardDetailQuery } from "@/lib/features/api/apiSlice";
import { useBoardSocket } from "@/lib/use-board-socket";
import { Board } from "@/components/board";
import { ProtectedRoute } from "@/components/protected-route";
import { AppLayout } from "@/components/app-layout";

function BoardDetailContent() {
  const params = useParams();
  const id = params?.id as string;
  const { data, isLoading, error, refetch, isFetching } = useGetBoardDetailQuery(id, {
    skip: !id,
    pollingInterval: 30000,
  });

  const onEvent = useCallback(() => {
    refetch();
  }, [refetch]);

  useBoardSocket(id, onEvent);

  if (isLoading) return <main className="p-6">Loading board...</main>;
  if (error || !data) return <main className="p-6">Error loading board.</main>;

  return (
    <div className="flex h-full flex-col overflow-hidden p-6">
      <Board board={data} isFetching={isFetching} refetch={refetch} />
    </div>
  );
}

export default function BoardDetailPage() {
  return (
    <AppLayout>
      <BoardDetailContent />
    </AppLayout>
  );
}
