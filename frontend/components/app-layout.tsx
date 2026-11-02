"use client";

import { ReactNode } from "react";
import { AppHeader } from "./app-header";
import { ProtectedRoute } from "./protected-route";
import { SearchProvider } from "@/lib/search-context";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <SearchProvider>
        <div className="flex h-screen flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
          <AppHeader />
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </SearchProvider>
    </ProtectedRoute>
  );
}
