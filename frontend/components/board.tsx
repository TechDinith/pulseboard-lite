"use client";

import { useMemo, useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useGetMembersQuery, useMoveCardMutation } from "@/lib/features/api/apiSlice";
import { Avatar } from "./avatar";
import { BoardColumn } from "./board-column";
import { BoardDetail, ColumnWithCards } from "@/lib/features/api/apiSlice";
import type { Member } from "@/types";
import { AddColumnModal } from "./add-column-modal";
import { useSearch } from "@/lib/search-context";
import { TaskCard } from "./task-card";

export function Board({
  board,
  isFetching,
  refetch,
}: {
  board: BoardDetail;
  isFetching?: boolean;
  refetch?: () => void;
}) {
  const { data: members } = useGetMembersQuery();

  const membersById = useMemo(() => {
    const map: Record<string, Member> = {};
    for (const member of members ?? []) {
      map[member.id] = member;
    }
    return map;
  }, [members]);

  const totalCards = board.columns.reduce(
    (sum, column) => sum + column.cards.length,
    0,
  );
  const team = members ?? [];
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [activeCard, setActiveCard] = useState<ColumnWithCards["cards"][number] | null>(null);
  const { query } = useSearch();
  const [moveCard] = useMoveCardMutation();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const filteredColumns = useMemo(() => {
    if (!query.trim()) return board.columns;
    const q = query.toLowerCase();
    return board.columns
      .map((col) => ({
        ...col,
        cards: col.cards.filter(
          (card) =>
            card.title.toLowerCase().includes(q) ||
            (card.description?.toLowerCase().includes(q) ?? false) ||
            (card.labels?.toLowerCase().includes(q) ?? false)
        ),
      }))
      .filter((col) => col.cards.length > 0);
  }, [board.columns, query]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const card = board.columns
        .flatMap((c) => c.cards)
        .find((c) => c.id === event.active.id);
      setActiveCard(card ?? null);
    },
    [board.columns]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveCard(null);
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Find source column
      const sourceColumn = board.columns.find((c) =>
        c.cards.some((card) => card.id === activeId)
      );
      if (!sourceColumn) return;

      // Determine target column and position
      let targetColumnId = overId;
      let targetPosition = 0;

      // Check if dropped on a card
      const targetColumn = board.columns.find((c) =>
        c.cards.some((card) => card.id === overId)
      );
      if (targetColumn) {
        targetColumnId = targetColumn.id;
        targetPosition = targetColumn.cards.findIndex((c) => c.id === overId);
      } else {
        // Dropped on a column (empty area)
        const col = board.columns.find((c) => c.id === overId);
        if (col) {
          targetColumnId = col.id;
          targetPosition = col.cards.length;
        }
      }

      if (targetColumnId && sourceColumn.id !== targetColumnId || targetPosition !== sourceColumn.cards.findIndex((c) => c.id === activeId)) {
        moveCard({ id: activeId, body: { columnId: targetColumnId, position: targetPosition } });
      }
    },
    [board.columns, moveCard]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
              onClick={() => setShowColumnModal(true)}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
              + Add column
            </button>
            {showColumnModal ? (
              <AddColumnModal boardId={board.id} onClose={() => setShowColumnModal(false)} />
            ) : null}
          </div>
        </header>

        <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
          {filteredColumns.map((column: ColumnWithCards) => (
            <BoardColumn
              key={column.id}
              column={column}
              membersById={membersById}
            />
          ))}
          {filteredColumns.length === 0 && query.trim() ? (
            <div className="flex flex-1 items-center justify-center text-zinc-500">
              No cards match &quot;{query}&quot;
            </div>
          ) : null}
        </div>
      </section>
      <DragOverlay>
        {activeCard ? <TaskCard card={activeCard} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
