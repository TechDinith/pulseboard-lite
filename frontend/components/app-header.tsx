"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useGetMeQuery, useGetMembersQuery } from "@/lib/features/api/apiSlice";
import { Avatar } from "./avatar";

export function AppHeader() {
  const { data: user } = useGetMeQuery();
  const { data: members } = useGetMembersQuery();
  const router = useRouter();
  const pathname = usePathname();

  function logout() {
    localStorage.removeItem("pulseboard_token");
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
          P
        </span>
        <span className="text-sm font-semibold tracking-tight">PulseBoard</span>
      </div>

      <span className="mx-1 hidden h-5 w-px bg-zinc-200 dark:bg-zinc-800 sm:block" />

      <div className="hidden items-center gap-2 sm:flex">
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          {user?.tenantName ?? "Workspace"}
        </span>
      </div>

      <div className="flex-1" />

      <nav className="flex items-center gap-1 md:hidden">
        <Link
          href="/boards"
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            pathname.startsWith("/boards")
              ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Boards
        </Link>
        <Link
          href="/exports"
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            pathname.startsWith("/exports")
              ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Exports
        </Link>
      </nav>

      <nav className="hidden items-center gap-1 md:flex">
        <Link
          href="/boards"
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            pathname.startsWith("/boards")
              ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Boards
        </Link>
        <Link
          href="/exports"
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            pathname.startsWith("/exports")
              ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Exports
        </Link>
      </nav>

      <div className="relative hidden md:block">
        <label htmlFor="card-search" className="sr-only">
          Search cards
        </label>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
        >
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5 14 14" strokeLinecap="round" />
        </svg>
        <input
          id="card-search"
          type="search"
          placeholder="Search cards…"
          className="w-56 rounded-md border border-zinc-200 bg-zinc-50 py-1.5 pl-8 pr-3 text-sm outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:focus:bg-zinc-900"
        />
      </div>

      <div className="hidden -space-x-2 lg:flex">
        {(members ?? []).slice(0, 5).map((member) => (
          <span
            key={member.id}
            className="rounded-full ring-2 ring-white dark:ring-zinc-950"
          >
            <Avatar member={member} size="sm" />
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {user && (
          <span className="hidden text-sm font-medium text-zinc-700 dark:text-zinc-300 sm:inline-block">
            {user.displayName}
          </span>
        )}
        {user ? (
          <Avatar
            member={{
              id: user.id,
              name: user.displayName,
              initials: user.displayName.charAt(0).toUpperCase(),
              color: "#6366f1", // Default indigo for current user
            }}
          />
        ) : null}
        <button
          onClick={logout}
          className="ml-2 rounded-md px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
