import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountSettings } from "@/components/account/account-settings";

export const metadata = { title: "Account Settings" };

export default async function AccountPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, accountType: true, password: true },
  });
  if (!user) redirect("/login");

  const dashboardHref =
    user.accountType === "TRAINER"
      ? "/dashboard/trainer"
      : user.accountType === "GYM"
      ? "/dashboard/gym"
      : null;

  return (
    <AccountSettings
      name={user.name ?? ""}
      email={user.email}
      accountType={user.accountType}
      hasPassword={!!user.password}
      dashboardHref={dashboardHref}
    />
  );
}
