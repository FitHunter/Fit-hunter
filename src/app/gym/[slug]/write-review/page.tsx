import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { WriteReviewForm } from "@/components/reviews/write-review-form";
import { GYM_REVIEW_CATEGORIES } from "@/lib/constants";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props) {
  const gym = await prisma.gymProfile.findUnique({ where: { slug: params.slug }, select: { name: true } });
  return { title: gym ? `Review ${gym.name}` : "Write a Review" };
}

export default async function WriteGymReviewPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect(`/login?next=/gym/${params.slug}/write-review`);

  const gym = await prisma.gymProfile.findUnique({
    where: { slug: params.slug },
    select: { id: true, name: true },
  });
  if (!gym) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <WriteReviewForm
        profileId={gym.id}
        profileName={gym.name}
        profileType="gym"
        profileSlug={params.slug}
        categories={[...GYM_REVIEW_CATEGORIES]}
      />
    </div>
  );
}
