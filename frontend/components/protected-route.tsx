"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetMeQuery } from "@/lib/features/api/apiSlice";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = useGetMeQuery(undefined, {
    // Skip if no token exists in localStorage to avoid unnecessary request
    skip: typeof window !== "undefined" && !localStorage.getItem("pulseboard_token"),
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("pulseboard_token");
    if (!token || (!isLoading && isError)) {
      router.push("/login");
    }
  }, [isLoading, isError, router]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!data) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
