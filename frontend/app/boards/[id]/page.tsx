"use client";

import { useParams } from "next/navigation";
import { useGetBoardDetailQuery } from "@/lib/features/api/apiSlice";

interface CardSummary {
  id: string;
  title: string;
  description?: string | null;
}

interface ColumnWithCards {
  id: string;
  name: string;
  cards?: CardSummary[];
}

interface BoardDetail {
  name: string;
  columns?: ColumnWithCards[];
}

export default function BoardDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data, isLoading, error } = useGetBoardDetailQuery(id, { skip: !id, pollingInterval: 5000 });

  if (isLoading) return <main className="p-6">Loading...</main>;
  if (error) return <main className="p-6">Error</main>;

  const detail = data as BoardDetail | undefined;

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">{detail?.name} (polling 5s)</h1>
      <div className="flex gap-4 overflow-x-auto">
        {(detail?.columns || []).map((col) => (
          <div key={col.id} className="w-72 flex-shrink-0 rounded border p-3">
            <div className="mb-2 font-medium">{col.name}</div>
            <div className="flex flex-col gap-2">
              {(col.cards || []).map((card) => (
                <div key={card.id} className="rounded border p-2">
                  <div className="font-medium">{card.title}</div>
                  {card.description ? <div className="text-sm text-gray-600">{card.description}</div> : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}