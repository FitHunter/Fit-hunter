"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";
import { CheckCircle, XCircle } from "lucide-react";

interface Props {
  reviewId: string;
  reviewerEmail: string;
}

export function ReviewModerationActions({ reviewId }: Props) {
  const router = useRouter();
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function moderate(action: "approve" | "reject") {
    setLoading(action);
    const res = await fetch("/api/admin/review/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, action, reason: action === "reject" ? reason : undefined }),
    });
    const json = await res.json();
    setLoading(null);

    if (res.ok) {
      toast({ title: action === "approve" ? "Review approved" : "Review rejected" });
      router.refresh();
    } else {
      toast({ title: "Error", description: json.error, variant: "destructive" });
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap pt-2">
      {showRejectInput ? (
        <>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Rejection reason (shown to reviewer)"
            className="flex-1"
          />
          <Button
            variant="destructive"
            size="sm"
            onClick={() => moderate("reject")}
            loading={loading === "reject"}
            disabled={!reason.trim()}
          >
            <XCircle className="h-4 w-4" />
            Confirm Reject
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowRejectInput(false)}>Cancel</Button>
        </>
      ) : (
        <>
          <Button
            size="sm"
            onClick={() => moderate("approve")}
            loading={loading === "approve"}
          >
            <CheckCircle className="h-4 w-4" />
            Approve
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowRejectInput(true)}
          >
            <XCircle className="h-4 w-4" />
            Reject
          </Button>
        </>
      )}
    </div>
  );
}
