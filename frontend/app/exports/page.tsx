"use client";

import { useState } from "react";
import { useListBoardsQuery, useRequestExportMutation, useListExportsQuery } from "@/lib/features/api/apiSlice";
import { AppLayout } from "@/components/app-layout";

function ExportsContent() {
  const { data: boards } = useListBoardsQuery();
  const [requestExport, { isLoading, isError: exportError, error: exportErr }] = useRequestExportMutation();
  const exportErrorMessage = exportError ? (exportErr as any)?.data?.message || "Failed to request export." : null;
  const { data: exports, isLoading: loadingExports, refetch } = useListExportsQuery();
  const [boardId, setBoardId] = useState("");

  async function onRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!boardId) return;
    await requestExport({ boardId }).unwrap();
    refetch();
  }

  return (
    <div className="mx-auto h-full w-full max-w-4xl overflow-y-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Data Exports
        </h1>
        <p className="text-sm text-zinc-500">
          Request and track board CSV exports.
        </p>
      </div>

      <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Request New Export</h2>
        <form onSubmit={onRequest} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="board-select" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Select Board
            </label>
            <select
              id="board-select"
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              value={boardId}
              onChange={(e) => setBoardId(e.target.value)}
            >
              <option value="">Choose a board...</option>
              {(boards ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <button
            disabled={isLoading || !boardId}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {isLoading ? "Requesting..." : "Request Export"}
          </button>
        </form>
        {exportErrorMessage ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{exportErrorMessage}</p>
        ) : null}
      </div>

      <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Export History</h2>
      {loadingExports ? (
        <div className="text-zinc-500">Loading history...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {(exports ?? []).length === 0 && (
              <li className="p-6 text-center text-zinc-500">No exports requested yet.</li>
            )}
            {(exports ?? []).map((e) => (
              <li key={e.id} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    Export {e.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(e.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      e.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : e.status === "FAILED"
                        ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                    }`}
                  >
                    {e.status}
                  </span>
                  {e.status === "COMPLETED" ? (
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem("pulseboard_token");
                        const res = await fetch(
                          `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api"}/exports/${e.id}/download`,
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `export-${e.id}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500"
                    >
                      Download CSV
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ExportsPage() {
  return (
    <AppLayout>
      <ExportsContent />
    </AppLayout>
  );
}
