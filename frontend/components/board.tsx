"use client";

import { useMemo } from "react";
import {
  useGetBoardQuery,
  useGetMembersQuery,
} from "@/lib/features/api/apiSlice";
import type { Member } from "@/types";
import { Avatar } from "./avatar";
import { BoardColumn } from "./board-column";

function BoardSkeleton() {
  return (
    <div className="flex flex-1 gap-4" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="w-72 shrink-0 animate-pulse space-y-3">
          <div className="h-5 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-28 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
          <div className="h-28 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
        </div>
      ))}
    </div>
  );
}

export function Board() {
  const { data: board, isLoading, isError, refetch, isFetching } =
    useGetBoardQuery();
  const { data: members } = useGetMembersQuery();

  const membersById = useMemo(() => {
    const map: Record<string, Member> = {};
    for (const member of members ?? []) {
      map[member.id] = member;
    }
    return map;
  }, [members]);

  if (isLoading) {
    return <BoardSkeleton />;
  }

  if (isError || !board) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Couldn&apos;t load the board.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Retry
        </button>
      </div>
    );
  }

  const totalCards = board.columns.reduce(
    (sum, column) => sum + column.cards.length,
    0,
  );
  const team = members ?? [];

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight">
              {board.name}
            </h2>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              Active
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {board.columns.length} columns · {totalCards} cards
            {isFetching ? " · syncing…" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden -space-x-2 sm:flex">
            {team.map((member) => (
              <span
                key={member.id}
                className="rounded-full ring-2 ring-white dark:ring-zinc-950"
              >
                <Avatar member={member} size="sm" />
              </span>
            ))}
          </div>
          <button
            type="button"
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            New card
          </button>
        </div>
      </header>

      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {board.columns.map((column) => (
          <BoardColumn
            key={column.id}
            column={column}
            membersById={membersById}
          />
        ))}
      </div>
    </section>
  );
}
