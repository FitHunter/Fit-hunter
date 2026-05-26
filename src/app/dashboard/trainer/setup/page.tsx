import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TrainerSetupWizard } from "@/components/trainer/setup-wizard";

export const metadata = { title: "Create Your Trainer Profile" };

export default async function TrainerSetupPage() {
  const session = await auth();
  if (!session || session.user.accountType !== "TRAINER") redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <TrainerSetupWizard />
    </div>
  );
}
