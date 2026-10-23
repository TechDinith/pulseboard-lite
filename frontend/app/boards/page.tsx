"use client";

import Link from "next/link";
import { useState } from "react";
import { useListBoardsQuery, useCreateBoardMutation } from "@/lib/features/api/apiSlice";

export default function BoardsPage() {
  const { data: boards, isLoading, isError, refetch } = useListBoardsQuery();
  const [createBoard, { isLoading: isCreating }] = useCreateBoardMutation();
  const [name, setName] = useState("");

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await createBoard({ name }).unwrap();
    setName("");
  }

  if (isLoading) return <main className="p-6">Loading...</main>;

  return (
    <main className="mx-auto w-full max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Boards</h1>
      <form onSubmit={onCreate} className="mb-6 flex gap-2">
        <input
          className="flex-1 rounded border p-2"
          placeholder="new board name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          disabled={isCreating}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          Create
        </button>
      </form>
      {isError ? (
        <button className="underline" onClick={() => refetch()}>
          Retry
        </button>
      ) : (
        <ul className="flex flex-col gap-2">
          {(boards ?? []).map((b) => (
            <li key={b.id}>
              <Link className="underline" href={`/boards/${b.id}`}>
                {b.name}
              </Link>
            </li>
          ))}
          {(boards ?? []).length === 0 ? (
            <li className="text-sm text-zinc-500">No boards yet.</li>
          ) : null}
        </ul>
      )}
    </main>
  );
}
