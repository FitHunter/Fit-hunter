"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Dumbbell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const dashboardHref =
    session?.user.accountType === "TRAINER"
      ? "/dashboard/trainer"
      : session?.user.accountType === "GYM"
      ? "/dashboard/gym"
      : session?.user.isAdmin
      ? "/admin"
      : null; // consumers have no dashboard — don't show a dead link

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-heading font-extrabold uppercase tracking-wide text-xl text-ink-950">
            <Dumbbell className="h-6 w-6" />
            NextFit
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-heading text-xs font-bold uppercase tracking-wider">
            <Link href="/search?type=PERSONAL_TRAINER" className="text-ink-500 hover:text-ink-950 transition-colors">
              Find Trainers
            </Link>
            <Link href="/search?type=GYM" className="text-ink-500 hover:text-ink-950 transition-colors">
              Find Gyms
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  {session.user.name?.split(" ")[0] ?? "Account"}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-lg border border-gray-200 bg-white shadow-lg py-1 z-50">
                    {dashboardHref && (
                      <Link
                        href={dashboardHref}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        My Dashboard
                      </Link>
                    )}
                    {session.user.accountType === "TRAINER" && (
                      <Link
                        href="/dashboard/trainer/edit"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        Edit My Profile
                      </Link>
                    )}
                    {session.user.accountType === "GYM" && (
                      <Link
                        href="/dashboard/gym"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        Edit My Profile
                      </Link>
                    )}
                    {session.user.isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link
            href="/search?type=PERSONAL_TRAINER"
            className="block text-sm font-medium text-gray-700"
            onClick={() => setMobileOpen(false)}
          >
            Find Trainers
          </Link>
          <Link
            href="/search?type=GYM"
            className="block text-sm font-medium text-gray-700"
            onClick={() => setMobileOpen(false)}
          >
            Find Gyms
          </Link>
          {session ? (
            <>
              {dashboardHref && (
                <Link href={dashboardHref} className="block text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>
                  My Dashboard
                </Link>
              )}
              {session.user.accountType === "TRAINER" && (
                <Link href="/dashboard/trainer/edit" className="block text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>
                  Edit My Profile
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="block text-sm font-medium text-red-600"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">Log in</Button>
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                <Button className="w-full">Get started</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
