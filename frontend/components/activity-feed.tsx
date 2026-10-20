"use client";

import { useMemo } from "react";
import {
  useGetActivityQuery,
  useGetMembersQuery,
} from "@/lib/features/api/apiSlice";
import type { ActivityKind, Member } from "@/types";
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
  timeZone: "UTC",
});

function formatAt(iso: string) {
  const date = new Date(iso);
  return `${dateFormatter.format(date)} · ${timeFormatter.format(date)}`;
}

export function ActivityFeed() {
  const { data: events, isLoading, isError, refetch } = useGetActivityQuery();
  const { data: members } = useGetMembersQuery();

  const membersById = useMemo(() => {
    const map: Record<string, Member> = {};
    for (const member of members ?? []) {
      map[member.id] = member;
    }
    return map;
  }, [members]);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-semibold">Activity</h2>
        <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live
        </span>
      </header>

      {isLoading ? (
        <div className="space-y-4 p-4" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex animate-pulse gap-3">
              <div className="h-6 w-6 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-4/5 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-1/3 rounded bg-zinc-100 dark:bg-zinc-800/60" />
              </div>
            </div>
          ))}
        </div>
      ) : isError || !events ? (
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Couldn&apos;t load activity.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            Retry
          </button>
        </div>
      ) : (
        <ol className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {events.map((event) => {
            const actor = membersById[event.actorId];
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
      )}
    </section>
  );
}
