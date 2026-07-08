import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { randomBytes } from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function generateUniqueSlug(base: string, suffix?: string): string {
  const baseSlug = slugify(base);
  return suffix ? `${baseSlug}-${suffix}` : baseSlug;
}

export function formatRating(rating: number | null | undefined): string {
  if (!rating) return "No ratings";
  return rating.toFixed(1);
}

export function formatReviewerName(firstName: string, lastName?: string | null): string {
  if (!lastName) return firstName;
  return `${firstName} ${lastName.charAt(0)}.`;
}

// Non-security use only (e.g. slug suffixes). Do NOT use for tokens.
export function generateRandomCode(length = 6): string {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

// Cryptographically secure token for email verification, password resets, etc.
// Returns a URL-safe hex string of `bytes * 2` characters.
export function generateSecureToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isYoutubeOrVimeoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.includes("youtube.com") ||
      parsed.hostname.includes("youtu.be") ||
      parsed.hostname.includes("vimeo.com")
    );
  } catch {
    return false;
  }
}

export function getVslEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (parsed.hostname === "youtu.be") {
      const videoId = parsed.pathname.slice(1);
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const videoId = parsed.pathname.split("/").filter(Boolean).pop();
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
}
