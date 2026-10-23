"use client";

import { useState } from "react";
import { useListBoardsQuery, useRequestExportMutation, useListExportsQuery } from "@/lib/features/api/apiSlice";

export default function ExportsPage() {
  const { data: boards } = useListBoardsQuery();
  const [requestExport, { isLoading }] = useRequestExportMutation();
  const { data: exports, isLoading: loadingExports, refetch } = useListExportsQuery();
  const [boardId, setBoardId] = useState("");

  async function onRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!boardId) return;
    await requestExport({ boardId }).unwrap();
    refetch();
  }

  return (
    <main className="mx-auto w-full max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Exports</h1>
      <form onSubmit={onRequest} className="mb-6 flex gap-2">
        <select className="rounded border p-2" value={boardId} onChange={(e) => setBoardId(e.target.value)}>
          <option value="">Select board</option>
          {(boards ?? []).map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <button disabled={isLoading || !boardId} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">Request export</button>
      </form>
      <h2 className="mb-2 text-lg font-medium">History</h2>
      {loadingExports ? <div>Loading...</div> : (
        <ul className="flex flex-col gap-1">
          {(exports ?? []).map((e) => (
            <li key={e.id} className="text-sm">{e.id.slice(0, 8)}... - {e.status} ({new Date(e.createdAt).toLocaleString()})</li>
          ))}
        </ul>
      )}
    </main>
  );
}
