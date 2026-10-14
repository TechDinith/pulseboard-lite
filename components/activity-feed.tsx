import { activity, getMember } from "@/data/mock-data";
import type { ActivityKind } from "@/types";
import { Avatar } from "./avatar";

const verbs: Record<ActivityKind, string> = {
  created: "created",
  moved: "moved",
  commented: "commented on",
  assigned: "updated",
  completed: "completed",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

function formatAt(iso: string) {
  const at = new Date(iso);
  return `${dateFormatter.format(at)} · ${timeFormatter.format(at)} UTC`;
}

export function ActivityFeed() {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-semibold">Activity</h2>
        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live
        </span>
      </header>

      <ol className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {activity.map((event) => {
          const actor = getMember(event.actorId);
          return (
            <li key={event.id} className="flex gap-3 px-4 py-3">
              {actor ? <Avatar member={actor} size="sm" /> : null}
              <div className="min-w-0">
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {actor?.name ?? "Someone"}
                  </span>{" "}
                  {verbs[event.kind]}{" "}
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {event.cardTitle}
                  </span>
                </p>
                {event.detail ? (
                  <p className="mt-0.5 text-xs text-zinc-400">{event.detail}</p>
                ) : null}
                <time
                  dateTime={event.at}
                  className="mt-0.5 block text-[11px] text-zinc-400"
                >
                  {formatAt(event.at)}
                </time>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
