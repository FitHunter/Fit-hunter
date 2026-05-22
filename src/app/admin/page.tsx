import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Star, Building2, Dumbbell } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — FitHunter" };

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
    pendingCerts,
    pendingClaims,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.review.count({ where: { status: "APPROVED" } }),
    prisma.trainerProfile.count(),
    prisma.gymProfile.count(),
    prisma.gymProfile.count({ where: { isClaimed: true } }),
    prisma.trainerCertification.count({ where: { certDocUrl: { not: null }, isVerified: false } }),
    prisma.gymClaim.count({ where: { status: "PENDING" } }),
  ]);

  const adminSections = [
    { href: "/admin/reviews", label: "Review Queue", count: pendingReviews, urgent: pendingReviews > 0 },
    { href: "/admin/certifications", label: "Cert Verification", count: pendingCerts, urgent: pendingCerts > 0 },
    { href: "/admin/claims", label: "Gym Claims", count: pendingClaims, urgent: pendingClaims > 0 },
    { href: "/admin/users", label: "Users", count: totalUsers, urgent: false },
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
    </div>
  );
}
