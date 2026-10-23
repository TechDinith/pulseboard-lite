"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegisterMutation } from "@/lib/features/api/apiSlice";

export default function RegisterPage() {
  const router = useRouter();
  const [tenantName, setTenantName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [register, { isLoading, isError }] = useRegisterMutation();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await register({ tenantName, displayName, email, password }).unwrap();
      localStorage.setItem("pulseboard_token", res.token);
      router.push("/boards");
    } catch {
      // error state rendered below
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-semibold">Register</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input className="rounded border p-2" placeholder="workspace name" value={tenantName} onChange={(e) => setTenantName(e.target.value)} />
        <input className="rounded border p-2" placeholder="display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <input className="rounded border p-2" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="rounded border p-2" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button disabled={isLoading} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">Register</button>
        {isError ? <p className="text-sm text-red-600">Could not register. Check your details.</p> : null}
      </form>
    </main>
  );
}
