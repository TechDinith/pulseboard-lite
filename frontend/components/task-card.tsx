import type { Card, Member } from "@/types";
import { Avatar } from "./avatar";
import { PriorityBadge } from "./priority-badge";

export function TaskCard({
  card,
  assignee,
}: {
  card: Card;
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

      {card.labels.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-1">
          {card.labels.map((label) => (
            <li
              key={label}
              className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {label}
            </li>
          ))}
        </ul>
      ) : null}

      <footer className="mt-3 flex items-center justify-between">
        <PriorityBadge priority={card.priority} />
        <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path
              d="M2.5 3.5h11v7h-6l-3 2.5V10.5h-2z"
              strokeLinejoin="round"
            />
          </svg>
          {card.commentCount}
        </span>
      </footer>
    </article>
  );
}
