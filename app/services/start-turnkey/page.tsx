"use client";

import { useRouter } from "next/navigation";

export default function StartTurnkeyPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Start your turnkey project</h1>

      <p className="text-sm opacity-70 mb-6">
        Tell us about your home and we’ll arrange a free consultation with our
        interior project team.
      </p>

      <button
        onClick={() => router.push("/checkout?type=service")}
        className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold"
      >
        Book consultation
      </button>
    </div>
  );
}
