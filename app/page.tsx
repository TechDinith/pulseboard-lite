import { ActivityFeed } from "@/components/activity-feed";
import { AppHeader } from "@/components/app-header";
import { Board } from "@/components/board";

export default function Home() {
  return (
    <>
      <AppHeader />
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 gap-6 px-4 py-6">
        <main className="flex min-w-0 flex-1 flex-col">
          <Board />
        </main>
        <aside className="hidden w-80 shrink-0 xl:block">
          <ActivityFeed />
        </aside>
      </div>
    </>
  );
}
