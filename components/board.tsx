import { board, members } from "@/data/mock-data";
import { Avatar } from "./avatar";
import { BoardColumn } from "./board-column";

export function Board() {
  const totalCards = board.columns.reduce(
    (sum, column) => sum + column.cards.length,
    0,
  );

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
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            {board.columns.length} columns · {totalCards} cards
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden -space-x-2 sm:flex">
            {members.map((member) => (
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
          <BoardColumn key={column.id} column={column} />
        ))}
      </div>
    </section>
  );
}
