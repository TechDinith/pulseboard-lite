"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/lib/features/api/apiSlice";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap() as { token: string };
      if (typeof window !== "undefined") {
        localStorage.setItem("pulseboard_token", res.token);
      }
      router.push("/");
    } catch {
      // ignore
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-semibold">Login</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input className="rounded border p-2" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="rounded border p-2" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button disabled={isLoading} className="rounded bg-black px-4 py-2 text-white">Login</button>
      </form>
    </main>
  );
}
