"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

export function BillingButton({ label = "Manage Billing" }: { label?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  }

  return (
    <Button variant="outline" onClick={handleClick} loading={loading}>
      <CreditCard className="h-4 w-4" />
      {label}
    </Button>
  );
}
