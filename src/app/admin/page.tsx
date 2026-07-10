import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Star, Building2, Dumbbell } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — NextFit" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user.isAdmin) redirect("/");

  const [
    totalUsers,
    pendingReviews,
    publishedReviews,
    totalTrainers,
    totalGyms,
    claimedGyms,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.review.count({ where: { status: "APPROVED" } }),
    prisma.trainerProfile.count(),
    prisma.gymProfile.count(),
    prisma.gymProfile.count({ where: { isClaimed: true } }),
  ]);

  // Only surface admin sections whose pages actually exist. Cert verification,
  // gym claims, and user management are not built yet — linking to them 404s.
  const adminSections = [
    { href: "/admin/reviews", label: "Review Queue", count: pendingReviews, urgent: pendingReviews > 0 },
  ];

  // QA site map: every page on the site, for manual click-through testing.
  // note = login/role needed to see the page as intended.
  const siteMap: { group: string; links: { href: string; label: string; note?: string }[] }[] = [
    {
      group: "Public",
      links: [
        { href: "/", label: "Homepage" },
        { href: "/search", label: "Search — all" },
        { href: "/search?type=PERSONAL_TRAINER", label: "Search — trainers" },
        { href: "/search?type=GYM", label: "Search — gyms" },
        { href: "/trainer/alex-rivera-example", label: "Example trainer profile" },
        { href: "/gym/coastal-strength-club-example", label: "Example gym profile" },
        { href: "/trainer/alex-rivera-example/write-review", label: "Write trainer review", note: "any login" },
        { href: "/gym/coastal-strength-club-example/write-review", label: "Write gym review", note: "any login" },
      ],
    },
    {
      group: "Auth",
      links: [
        { href: "/register", label: "Register — chooser", note: "sign out first to see all states" },
        { href: "/register?type=TRAINER", label: "Register — trainer preselected" },
        { href: "/register?type=GYM", label: "Register — gym preselected" },
        { href: "/login", label: "Login" },
        { href: "/forgot-password", label: "Forgot password", note: "email sending requires Resend key" },
        { href: "/account", label: "Account settings", note: "any login" },
      ],
    },
    {
      group: "Trainer",
      links: [
        { href: "/dashboard/trainer", label: "Trainer dashboard", note: "trainer login" },
        { href: "/dashboard/trainer/setup", label: "Setup wizard", note: "trainer login" },
        { href: "/dashboard/trainer/edit", label: "Edit profile", note: "trainer login" },
      ],
    },
    {
      group: "Gym",
      links: [{ href: "/dashboard/gym", label: "Gym dashboard", note: "gym login" }],
    },
    {
      group: "Admin",
      links: [
        { href: "/admin", label: "Admin panel", note: "admin login" },
        { href: "/admin/reviews", label: "Review moderation", note: "admin login" },
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Users className="h-4 w-4" />Total Users</div>
          <p className="text-2xl font-bold">{totalUsers}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Dumbbell className="h-4 w-4" />Trainers</div>
          <p className="text-2xl font-bold">{totalTrainers}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Building2 className="h-4 w-4" />Gyms</div>
          <p className="text-2xl font-bold">{totalGyms} <span className="text-sm text-gray-400">({claimedGyms} claimed)</span></p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Star className="h-4 w-4" />Reviews</div>
          <p className="text-2xl font-bold">{publishedReviews} <span className="text-sm text-gray-400">({pendingReviews} pending)</span></p>
        </CardContent></Card>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {adminSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className={`hover:shadow-md transition-shadow cursor-pointer ${section.urgent ? "border-amber-300" : ""}`}>
              <CardContent className="pt-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{section.label}</p>
                  <p className="text-2xl font-bold mt-1">{section.count}</p>
                </div>
                {section.urgent && section.count > 0 && (
                  <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* QA site map — every page, for manual click-through testing */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">QA Site Map</h2>
          <p className="text-sm text-gray-500">
            Every page on the site. Pages marked with a role need you to be signed in with that
            account type to see the real experience.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {siteMap.map((section) => (
            <Card key={section.group}>
              <CardContent className="pt-5">
                <p className="font-semibold text-gray-900 mb-3">{section.group}</p>
                <ul className="space-y-2">
                  {section.links.map((l) => (
                    <li key={l.href} className="text-sm">
                      <Link href={l.href} className="text-ink-900 font-medium hover:underline">
                        {l.label}
                      </Link>
                      {l.note && <span className="text-gray-400"> — {l.note}</span>}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
