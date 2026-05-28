"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

export function BillingButton({ label = "Manage Billing", profileType = "trainer" }: { label?: string; profileType?: "trainer" | "gym" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");

    // Try the portal first (existing subscribers)
    const portalRes = await fetch("/api/stripe/portal", { method: "POST" });
    const portalData = await portalRes.json();
    if (portalData.url) {
      window.location.href = portalData.url;
      return;
    }

    // No portal session means no existing subscription — send to checkout
    const checkoutRes = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileType }),
    });
    const checkoutData = await checkoutRes.json();
    if (checkoutData.url) {
      window.location.href = checkoutData.url;
    } else {
      setError(checkoutData.error ?? "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div>
      <Button onClick={handleClick} loading={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap">
        <CreditCard className="h-4 w-4" />
        {label}
      </Button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
