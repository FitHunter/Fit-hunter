"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export function UpgradeButton({ tier, profileType }: { tier: "STARTER" | "PRO"; profileType: "trainer" | "gym" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier, profileType }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div>
      <Button onClick={handleClick} loading={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
        <Zap className="h-4 w-4" />
        Upgrade to {tier === "STARTER" ? "Starter — $19/mo" : "Pro — $39/mo"}
      </Button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
