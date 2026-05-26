import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const addSchema = z.object({
  url: z.string().url(),
  publicId: z.string(),
  caption: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.accountType !== "TRAINER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } });
  if (!trainer) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const existing = await prisma.trainerPhoto.count({ where: { trainerProfileId: trainer.id } });
  if (existing >= 12) {
    return NextResponse.json({ error: "Maximum 12 photos allowed" }, { status: 400 });
  }

  const data = addSchema.parse(await req.json());
  const photo = await prisma.trainerPhoto.create({
    data: { trainerProfileId: trainer.id, url: data.url, publicId: data.publicId, caption: data.caption, sortOrder: existing },
  });

  return NextResponse.json({ photo });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.accountType !== "TRAINER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { photoId } = await req.json();
  const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id } });
  if (!trainer) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const photo = await prisma.trainerPhoto.findFirst({
    where: { id: photoId, trainerProfileId: trainer.id },
  });
  if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

  await cloudinary.uploader.destroy(photo.publicId).catch(() => {});
  await prisma.trainerPhoto.delete({ where: { id: photo.id } });

  return NextResponse.json({ success: true });
}
