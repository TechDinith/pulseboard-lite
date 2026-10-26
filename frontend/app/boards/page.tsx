"use client";

import Link from "next/link";
import { useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { useListBoardsQuery, useCreateBoardMutation } from "@/lib/features/api/apiSlice";

function BoardsContent() {
  const { data: boards, isLoading, isError, refetch } = useListBoardsQuery();
  const [createBoard, { isLoading: isCreating }] = useCreateBoardMutation();
  const [name, setName] = useState("");

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await createBoard({ name }).unwrap();
    setName("");
  }

  if (isLoading) return <div className="p-6 text-zinc-500">Loading boards...</div>;

  return (
    <main className="mx-auto w-full max-w-4xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Your Boards
        </h1>
        <Link href="/exports" className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-300">
          Export history
        </Link>
      </div>

      <form onSubmit={onCreate} className="mb-10 flex gap-3">
        <input
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          placeholder="Enter new board name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          disabled={isCreating}
          className="rounded-lg bg-zinc-900 px-6 py-2.5 font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isCreating ? "Creating..." : "Create Board"}
        </button>
      </form>

      {isError ? (
        <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          Failed to load boards.{" "}
          <button className="underline font-medium" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {(boards ?? []).map((b) => (
            <li key={b.id}>
              <Link
                href={`/boards/${b.id}`}
                className="block rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{b.name}</h2>
                <p className="mt-2 text-sm text-zinc-500">View board tasks</p>
              </Link>
            </li>
          ))}
          {(boards ?? []).length === 0 ? (
            <li className="col-span-full py-12 text-center text-zinc-500">
              No boards yet. Create your first one above.
            </li>
          ) : null}
        </ul>
      )}
    </main>
  );
}

export default function BoardsPage() {
  return (
    <ProtectedRoute>
      <BoardsContent />
    </ProtectedRoute>
  );
}

