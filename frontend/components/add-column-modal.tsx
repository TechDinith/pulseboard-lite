"use client";

import { useState } from "react";
import { useAddColumnMutation } from "@/lib/features/api/apiSlice";

export function AddColumnModal({
  boardId,
  onClose,
}: {
  boardId: string;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [addColumn, { isLoading, isError, error }] = useAddColumnMutation();

  const errorMessage = isError
    ? (error as any)?.data?.message || "Failed to add column."
    : null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await addColumn({ boardId, name: name.trim() }).unwrap();
      onClose();
    } catch {
      // error shown below
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Add Column
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Column Name
            </label>
            <input
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              placeholder="e.g., To Do, In Progress, Done"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          {errorMessage ? (
            <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
          ) : null}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {isLoading ? "Adding..." : "Add Column"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
