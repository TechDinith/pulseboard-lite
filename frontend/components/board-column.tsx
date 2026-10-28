import { useState } from "react";
import type { ColumnWithCards } from "@/lib/features/api/apiSlice";
import type { Member } from "@/types";
import { TaskCard } from "./task-card";
import { AddCardModal } from "./add-card-modal";

export function BoardColumn({
  column,
  membersById,
}: {
  column: ColumnWithCards;
  membersById: Record<string, Member>;
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {column.name}
          <span className="rounded-full bg-zinc-100 px-1.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {column.cards.length}
          </span>
        </h3>
        <button
          type="button"
          aria-label={`Add card to ${column.name}`}
          className="grid h-6 w-6 place-items-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          +
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 rounded-xl bg-zinc-100/70 p-2 dark:bg-zinc-900/50">
        {column.cards.map((card) => (
          <TaskCard
            key={card.id}
            card={card}
            assignee={card.assigneeId ? membersById[card.assigneeId] : undefined}
          />
        ))}
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-500 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
        >
          + Add a card
        </button>
        {showModal ? (
          <AddCardModal columnId={column.id} onClose={() => setShowModal(false)} />
        ) : null}
      </div>
    </div>
  );
}
