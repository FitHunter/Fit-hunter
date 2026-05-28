"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ChevronLeft, Camera, Plus, X, Loader2, CheckCircle, Trash2, Upload,
} from "lucide-react";

const SPECIALTIES = [
  "Weight Loss", "Strength Training", "HIIT / Cardio", "Yoga / Flexibility",
  "Sports Performance", "Nutrition Coaching", "Senior Fitness", "Pre/Post Natal",
  "Bodybuilding", "Rehabilitation",
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

interface Photo { id: string; url: string; publicId: string; caption?: string | null }

interface TrainerData {
  displayName: string;
  headline: string;
  bio: string;
  experience: string;
  whoIWorkWith: string;
  yearsExperience: string;
  photoUrl: string;
  phone: string;
  city: string;
  state: string;
  virtualAvailable: boolean;
  bookingUrl: string;
  gymName: string;
  specialties: string[];
  certifications: string[];
  photos: Photo[];
}

const empty: TrainerData = {
  displayName: "", headline: "", bio: "", experience: "", whoIWorkWith: "",
  yearsExperience: "", photoUrl: "", phone: "", city: "", state: "",
  virtualAvailable: false, bookingUrl: "", gymName: "", specialties: [], certifications: [], photos: [],
};

export default function TrainerEditPage() {
  const router = useRouter();
  const [data, setData] = useState<TrainerData>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [certInput, setCertInput] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/trainer/profile")
      .then((r) => r.json())
      .then((json) => {
        if (!json.trainer) { router.replace("/dashboard/trainer/setup"); return; }
        const t = json.trainer;
        setData({
          displayName: t.displayName ?? "",
          headline: t.headline ?? "",
          bio: t.bio ?? "",
          experience: t.experience ?? "",
          whoIWorkWith: t.whoIWorkWith ?? "",
          yearsExperience: t.yearsExperience != null ? String(t.yearsExperience) : "",
          photoUrl: t.photoUrl ?? "",
          phone: t.phone ?? "",
          city: t.city ?? "",
          state: t.state ?? "",
          virtualAvailable: t.virtualAvailable ?? false,
          bookingUrl: t.bookingUrl ?? "",
          gymName: t.gymName ?? "",
          specialties: t.specialties?.map((s: { specialty: string }) => s.specialty) ?? [],
          certifications: t.certifications?.map((c: { name: string }) => c.name) ?? [],
          photos: t.photos ?? [],
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  function update<K extends keyof TrainerData>(key: K, value: TrainerData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function toggleSpecialty(s: string) {
    setData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(s)
        ? prev.specialties.filter((x) => x !== s)
        : [...prev.specialties, s],
    }));
    setSaved(false);
  }

  function addCert() {
    const trimmed = certInput.trim();
    if (!trimmed || data.certifications.includes(trimmed)) return;
    update("certifications", [...data.certifications, trimmed]);
    setCertInput("");
  }

  function removeCert(i: number) {
    update("certifications", data.certifications.filter((_, idx) => idx !== i));
  }

  async function uploadImage(file: File, folder: string): Promise<{ url: string; publicId: string }> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/upload/image", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { url } = await uploadImage(file, "fithunter/trainer-avatars");
      update("photoUrl", url);
    } catch {
      setError("Failed to upload photo. Try again.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (data.photos.length + files.length > 12) {
      setError("Maximum 12 gallery photos allowed.");
      return;
    }
    setUploadingGallery(true);
    try {
      for (const file of files) {
        const { url, publicId } = await uploadImage(file, "fithunter/trainer-gallery");
        const res = await fetch("/api/trainer/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, publicId }),
        });
        if (!res.ok) throw new Error("Failed to save photo");
        const { photo } = await res.json();
        setData((prev) => ({ ...prev, photos: [...prev.photos, photo] }));
      }
    } catch {
      setError("Failed to upload gallery photo. Try again.");
    } finally {
      setUploadingGallery(false);
      if (galleryRef.current) galleryRef.current.value = "";
    }
  }

  async function deleteGalleryPhoto(photoId: string) {
    const res = await fetch("/api/trainer/photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId }),
    });
    if (res.ok) {
      setData((prev) => ({ ...prev, photos: prev.photos.filter((p) => p.id !== photoId) }));
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/trainer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          yearsExperience: data.yearsExperience ? parseInt(data.yearsExperience) : null,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Failed to save.");
      } else {
        setSaved(true);
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/trainer" className="text-gray-400 hover:text-gray-600">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <CheckCircle className="h-4 w-4" /> Saved
            </span>
          )}
          <Button onClick={handleSave} loading={saving}>Save changes</Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Profile photo ── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Profile photo</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
              {data.photoUrl ? (
                <Image src={data.photoUrl} alt="Profile" fill className="object-cover" sizes="96px" />
              ) : (
                <span className="text-4xl">💪</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute -bottom-1 -right-1 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50"
            >
              {uploadingPhoto ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5 text-gray-600" />}
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="text-sm text-gray-700 font-medium">Upload a professional headshot</p>
            <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or WebP · Max 10MB</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => avatarRef.current?.click()}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? "Uploading…" : "Choose photo"}
            </Button>
          </div>
        </div>
      </section>

      {/* ── Basic info ── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Basic info</h2>

        <div className="space-y-1.5">
          <Label>Display name</Label>
          <Input value={data.displayName} onChange={(e) => update("displayName", e.target.value)} placeholder="Your full name" />
        </div>

        <div className="space-y-1.5">
          <Label>Headline <span className="text-gray-400 font-normal text-xs">(short tagline)</span></Label>
          <Input
            value={data.headline}
            onChange={(e) => update("headline", e.target.value)}
            placeholder="e.g. NASM-Certified Strength Coach · 10+ years experience"
            maxLength={120}
          />
          <p className="text-xs text-gray-400 text-right">{data.headline.length}/120</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input value={data.city} onChange={(e) => update("city", e.target.value)} placeholder="Los Angeles" />
          </div>
          <div className="space-y-1.5">
            <Label>State</Label>
            <select
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={data.state}
              onChange={(e) => update("state", e.target.value)}
            >
              <option value="">Select state</option>
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Phone <span className="text-gray-400 font-normal text-xs">(optional)</span></Label>
            <Input type="tel" value={data.phone} onChange={(e) => update("phone", e.target.value)} placeholder="(555) 000-0000" />
          </div>
          <div className="space-y-1.5">
            <Label>Years of experience</Label>
            <Input
              type="number"
              min={0}
              max={60}
              value={data.yearsExperience}
              onChange={(e) => update("yearsExperience", e.target.value)}
              placeholder="e.g. 8"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>How do you work with clients?</Label>
          <div className="flex gap-2">
            {[
              { label: "In-Person", value: false },
              { label: "Virtual", value: true },
            ].map(({ label, value }) => (
              <button
                key={label}
                type="button"
                onClick={() => update("virtualAvailable", value)}
                className={cn(
                  "flex-1 py-2 rounded-lg border text-sm font-medium transition-colors",
                  data.virtualAvailable === value
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => update("virtualAvailable", true)}
              className={cn(
                "flex-1 py-2 rounded-lg border text-sm font-medium transition-colors",
                data.virtualAvailable
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              Both
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Booking link <span className="text-gray-400 font-normal text-xs">(optional)</span></Label>
          <Input value={data.bookingUrl} onChange={(e) => update("bookingUrl", e.target.value)} placeholder="https://calendly.com/yourname" />
        </div>

        <div className="space-y-1.5">
          <Label>Gym / Club / Studio <span className="text-gray-400 font-normal text-xs">(optional)</span></Label>
          <Input
            value={data.gymName}
            onChange={(e) => update("gymName", e.target.value)}
            placeholder="e.g. Equinox West Hollywood, CrossFit Mayhem"
            maxLength={120}
          />
          <p className="text-xs text-gray-400">Where you currently train or are based out of.</p>
        </div>
      </section>

      {/* ── About ── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">About you</h2>

        <div className="space-y-1.5">
          <Label>Bio <span className="text-gray-400 font-normal text-xs">(shown at top of profile)</span></Label>
          <textarea
            className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            value={data.bio}
            onChange={(e) => update("bio", e.target.value)}
            placeholder="A short summary of who you are and what you do…"
            maxLength={2000}
            rows={4}
          />
          <p className="text-xs text-gray-400 text-right">{data.bio.length}/2000</p>
        </div>

        <div className="space-y-1.5">
          <Label>My experience & background</Label>
          <textarea
            className="flex min-h-[120px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            value={data.experience}
            onChange={(e) => update("experience", e.target.value)}
            placeholder="Share your fitness journey, education, professional background, and what drives you as a trainer…"
            maxLength={2000}
            rows={5}
          />
          <p className="text-xs text-gray-400 text-right">{data.experience.length}/2000</p>
        </div>

        <div className="space-y-1.5">
          <Label>Who I work with</Label>
          <textarea
            className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            value={data.whoIWorkWith}
            onChange={(e) => update("whoIWorkWith", e.target.value)}
            placeholder="Describe your ideal client — their goals, fitness level, age range, or anything that helps people know if you're a great fit…"
            maxLength={1000}
            rows={4}
          />
          <p className="text-xs text-gray-400 text-right">{data.whoIWorkWith.length}/1000</p>
        </div>
      </section>

      {/* ── Specialties ── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-semibold text-gray-900">Specialties</h2>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSpecialty(s)}
              className={cn(
                "px-3 py-1.5 rounded-full border text-sm transition-colors",
                data.specialties.includes(s)
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* ── Certifications ── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-semibold text-gray-900">Certifications</h2>
        <div className="flex gap-2">
          <Input
            value={certInput}
            onChange={(e) => setCertInput(e.target.value)}
            placeholder="e.g. NASM CPT, ACE, CSCS"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCert(); } }}
          />
          <Button type="button" variant="outline" size="icon" onClick={addCert}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {data.certifications.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.certifications.map((c, i) => (
              <Badge key={i} variant="secondary" className="gap-1.5 pr-1">
                {c}
                <button type="button" onClick={() => removeCert(i)} className="hover:text-red-500 ml-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400">Certifications are reviewed by our team within 48 hours.</p>
      </section>

      {/* ── Photo gallery ── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Photo gallery</h2>
            <p className="text-xs text-gray-400 mt-0.5">Add photos of your training sessions, client transformations, and facilities · Max 12</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => galleryRef.current?.click()}
            disabled={uploadingGallery || data.photos.length >= 12}
          >
            {uploadingGallery ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
            ) : (
              <><Upload className="h-4 w-4" /> Add photos</>
            )}
          </Button>
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleGalleryChange}
          />
        </div>

        {data.photos.length === 0 ? (
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            disabled={uploadingGallery}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl py-10 flex flex-col items-center gap-2 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
          >
            <Camera className="h-8 w-8" />
            <span className="text-sm">Click to upload photos</span>
            <span className="text-xs">JPG, PNG or WebP · Max 10MB each</span>
          </button>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {data.photos.map((photo) => (
              <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image src={photo.url} alt={photo.caption ?? "Gallery photo"} fill className="object-cover" sizes="150px" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => deleteGalleryPhoto(photo.id)}
                    className="opacity-0 group-hover:opacity-100 bg-white rounded-full p-1.5 shadow text-red-500 hover:text-red-700 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {data.photos.length < 12 && (
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                disabled={uploadingGallery}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
              >
                <Plus className="h-6 w-6" />
              </button>
            )}
          </div>
        )}
      </section>

      {/* Save footer */}
      <div className="flex items-center justify-between pb-8">
        <Link href="/dashboard/trainer">
          <Button variant="outline">Back to dashboard</Button>
        </Link>
        <Button onClick={handleSave} loading={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
