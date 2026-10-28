import type { CardSummary } from "@/lib/features/api/apiSlice";
import type { Member } from "@/types";
import { Avatar } from "./avatar";
import { PriorityBadge } from "./priority-badge";

export function TaskCard({
  card,
  assignee,
}: {
  card: CardSummary;
  assignee?: Member;
}) {
  return (
    <article className="cursor-grab rounded-lg border border-zinc-200 bg-white p-3 shadow-sm transition-colors hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500/40">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-100">
          {card.title}
        </h4>
        {assignee ? <Avatar member={assignee} size="sm" /> : null}
      </div>

      {card.description ? (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {card.description}
        </p>
      ) : null}

      {card.labels ? (
        <ul className="mt-2 flex flex-wrap gap-1">
          {card.labels.split(",").map((label) => (
            <li
              key={label}
              className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {label.trim()}
            </li>
          ))}
        </ul>
      ) : null}

      <footer className="mt-3 flex items-center justify-between">
        <PriorityBadge priority={card.priority} />
        {card.dueAt && (
          <span className="text-[11px] text-zinc-400">
            {new Date(card.dueAt).toLocaleDateString()}
          </span>
        )}
      </footer>
    </article>
  );
}
