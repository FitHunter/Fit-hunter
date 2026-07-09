"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toaster";
import { ExternalLink } from "lucide-react";

interface Props {
  name: string;
  email: string;
  accountType: string;
  hasPassword: boolean;
  dashboardHref: string | null;
}

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CONSUMER: "Member",
  TRAINER: "Fitness Professional",
  GYM: "Gym / Studio",
};

export function AccountSettings({ name: initialName, email, accountType, hasPassword, dashboardHref }: Props) {
  const { update } = useSession();
  const [name, setName] = useState(initialName);
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setSavingName(true);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    setSavingName(false);
    if (!res.ok) {
      toast({ title: "Error", description: json.error ?? "Could not save.", variant: "destructive" });
      return;
    }
    await update({ name });
    toast({ title: "Name updated" });
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    setSavingPassword(true);
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const json = await res.json();
    setSavingPassword(false);
    if (!res.ok) {
      toast({ title: "Error", description: json.error ?? "Could not change password.", variant: "destructive" });
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast({ title: "Password changed" });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage how you sign in to NextFit.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Your name and account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={saveName} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={email} disabled />
              <p className="text-xs text-gray-400">Email changes aren&apos;t supported yet — contact us if you need this.</p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Badge variant="secondary">{ACCOUNT_TYPE_LABELS[accountType] ?? accountType}</Badge>
              <Button type="submit" loading={savingName} disabled={!name.trim() || name === initialName}>
                Save name
              </Button>
            </div>
          </form>
          {dashboardHref && (
            <div className="border-t border-gray-100 pt-4">
              <Link href={dashboardHref} className="inline-flex items-center gap-2 text-sm font-medium text-ink-900 hover:underline">
                Manage your public profile in the dashboard
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Password</CardTitle>
          <CardDescription>
            {hasPassword
              ? "Use a strong password you don't use anywhere else."
              : "This account signs in with Google, so there's no password to manage."}
          </CardDescription>
        </CardHeader>
        {hasPassword && (
          <CardContent>
            <form onSubmit={savePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="current">Current password</Label>
                <Input id="current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new">New password</Label>
                <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" placeholder="Min. 8 characters" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
              </div>
              <div className="flex justify-end">
                <Button type="submit" loading={savingPassword} disabled={!currentPassword || !newPassword || !confirmPassword}>
                  Change password
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
