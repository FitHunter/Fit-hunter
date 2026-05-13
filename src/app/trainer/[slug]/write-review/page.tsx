import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { WriteReviewForm } from "@/components/reviews/write-review-form";
import { TRAINER_REVIEW_CATEGORIES } from "@/lib/constants";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props) {
  const trainer = await prisma.trainerProfile.findUnique({ where: { slug: params.slug }, select: { displayName: true } });
  return { title: trainer ? `Review ${trainer.displayName}` : "Write a Review" };
}

export default async function WriteTrainerReviewPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect(`/login?next=/trainer/${params.slug}/write-review`);

  const trainer = await prisma.trainerProfile.findUnique({
    where: { slug: params.slug },
    select: { id: true, displayName: true },
  });
  if (!trainer) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <WriteReviewForm
        profileId={trainer.id}
        profileName={trainer.displayName}
        profileType="trainer"
        profileSlug={params.slug}
        categories={[...TRAINER_REVIEW_CATEGORIES]}
      />
    </div>
  );
}
