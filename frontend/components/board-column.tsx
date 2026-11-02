import { useState } from "react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
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
  const { setNodeRef: setDroppableRef } = useDroppable({ id: column.id });

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {column.name}
          <span className="rounded-full bg-zinc-100 px-1.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {column.cards.length}
          </span>
        </h3>
      </div>

      <SortableContext
        id={column.id}
        items={column.cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setDroppableRef}
          className="flex flex-1 flex-col gap-3 rounded-xl bg-zinc-100/70 p-2 dark:bg-zinc-900/50"
        >
          {column.cards.map((card) => (
            <SortableCard
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
      </SortableContext>
    </div>
  );
}

function SortableCard({
  card,
  assignee,
}: {
  card: ColumnWithCards["cards"][number];
  assignee?: Member;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard card={card} assignee={assignee} />
    </div>
  );
}
