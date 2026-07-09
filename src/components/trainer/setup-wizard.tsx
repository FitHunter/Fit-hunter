"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import {
  CERTIFICATIONS, TRAINING_STYLES, CLIENT_FOCUS_AREAS, SESSION_TYPES,
  TRAINING_LOCATIONS, SESSION_LENGTHS, LANGUAGES, PRICING_MODELS,
  AVAILABILITY_TYPES, DAYS_OF_WEEK, PROFILE_TYPES, FREE_LAUNCH,
} from "@/lib/constants";
import { Dumbbell, ChevronRight, ChevronLeft, Camera, Plus, X, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Basics", "Credentials", "What You Do", "Logistics", "Social Proof", "Personality & Fit"];

type Certification = { name: string; certDocUrl?: string };
type Photo = { id: string; url: string };

interface FormState {
  profileType: string;
  displayName: string;
  bio: string;
  photoUrl: string;
  city: string;
  state: string;
  virtualAvailable: boolean;
  yearsExperience: string;

  certifications: Certification[];
  education: string;

  trainingStyles: string[];
  clientFocus: string[];
  sessionTypes: string[];
  trainingLocations: string[];

  bookingUrl: string;
  pricingModel: string;
  priceMin: string;
  priceMax: string;
  availabilityType: string;
  availabilityDays: string[];
  sessionLengths: number[];

  vslUrl: string;
  instagramHandle: string;
  youtubeHandle: string;

  philosophy: string;
  whoIWorkWith: string;
  languages: string[];
}

const initialForm: FormState = {
  profileType: "PERSONAL_TRAINER",
  displayName: "",
  bio: "",
  photoUrl: "",
  city: "",
  state: "",
  virtualAvailable: false,
  yearsExperience: "",

  certifications: [],
  education: "",

  trainingStyles: [],
  clientFocus: [],
  sessionTypes: [],
  trainingLocations: [],

  bookingUrl: "",
  pricingModel: "",
  priceMin: "",
  priceMax: "",
  availabilityType: "",
  availabilityDays: [],
  sessionLengths: [],

  vslUrl: "",
  instagramHandle: "",
  youtubeHandle: "",

  philosophy: "",
  whoIWorkWith: "",
  languages: [],
};

async function saveStep(payload: object) {
  const res = await fetch("/api/trainer/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

async function uploadImage(file: File, folder: string): Promise<{ url: string; publicId: string }> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  const res = await fetch("/api/upload/image", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

function toggleInArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export function TrainerSetupWizard() {
  const { data: session } = useSession();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [certInput, setCertInput] = useState("");
  const [uploadingCertName, setUploadingCertName] = useState<string | null>(null);
  const [languageInput, setLanguageInput] = useState("");

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [transformationPhotos, setTransformationPhotos] = useState<Photo[]>([]);
  const [uploadingTransformation, setUploadingTransformation] = useState(false);

  const avatarRef = useRef<HTMLInputElement>(null);
  const certProofRef = useRef<HTMLInputElement>(null);
  const certUploadTarget = useRef<string | null>(null);
  const transformationRef = useRef<HTMLInputElement>(null);

  // Prefill from any progress already saved server-side (e.g. a trainer who
  // partially completed the wizard in an earlier session), so re-saving a
  // later step doesn't wipe out earlier answers with empty defaults.
  useEffect(() => {
    fetch("/api/trainer/profile")
      .then((r) => r.json())
      .then((json) => {
        const t = json.trainer;
        if (!t) {
          if (session?.user?.name) update("displayName", session.user.name);
          return;
        }
        setForm({
          profileType: t.profileType ?? "PERSONAL_TRAINER",
          displayName: t.displayName ?? session?.user?.name ?? "",
          bio: t.bio ?? "",
          photoUrl: t.photoUrl ?? "",
          city: t.city ?? "",
          state: t.state ?? "",
          virtualAvailable: t.virtualAvailable ?? false,
          yearsExperience: t.yearsExperience != null ? String(t.yearsExperience) : "",
          certifications: (t.certifications ?? []).map((c: { name: string; certDocUrl?: string }) => ({ name: c.name, certDocUrl: c.certDocUrl })),
          education: t.education ?? "",
          trainingStyles: (t.specialties ?? []).filter((s: { category: string }) => s.category === "STYLE").map((s: { specialty: string }) => s.specialty),
          clientFocus: (t.specialties ?? []).filter((s: { category: string }) => s.category !== "STYLE").map((s: { specialty: string }) => s.specialty),
          sessionTypes: t.sessionTypes ?? [],
          trainingLocations: t.trainingLocations ?? [],
          bookingUrl: t.bookingUrl ?? "",
          pricingModel: t.pricingModel ?? "",
          priceMin: t.priceMin != null ? String(t.priceMin) : "",
          priceMax: t.priceMax != null ? String(t.priceMax) : "",
          availabilityType: t.availabilityType ?? "",
          availabilityDays: t.availabilityDays ?? [],
          sessionLengths: t.sessionLengths ?? [],
          vslUrl: t.vslUrl ?? "",
          instagramHandle: t.instagramHandle ?? "",
          youtubeHandle: t.youtubeHandle ?? "",
          philosophy: t.philosophy ?? "",
          whoIWorkWith: t.whoIWorkWith ?? "",
          languages: t.languages ?? [],
        });
        setTransformationPhotos((t.photos ?? []).filter((p: { category?: string }) => p.category === "transformation"));
      })
      .catch(() => {
        if (session?.user?.name) update("displayName", session.user.name);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.name]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  }

  // ── Certifications ──
  function toggleCert(name: string) {
    setForm((prev) => {
      const exists = prev.certifications.some((c) => c.name === name);
      return {
        ...prev,
        certifications: exists
          ? prev.certifications.filter((c) => c.name !== name)
          : [...prev.certifications, { name }],
      };
    });
  }

  function addCustomCert() {
    const trimmed = certInput.trim();
    if (!trimmed) return;
    if (form.certifications.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setCertInput("");
      return;
    }
    setForm((prev) => ({ ...prev, certifications: [...prev.certifications, { name: trimmed }] }));
    setCertInput("");
  }

  function removeCert(name: string) {
    setForm((prev) => ({ ...prev, certifications: prev.certifications.filter((c) => c.name !== name) }));
  }

  function requestCertProofUpload(name: string) {
    certUploadTarget.current = name;
    certProofRef.current?.click();
  }

  async function handleCertProofChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const name = certUploadTarget.current;
    if (!file || !name) return;
    setUploadingCertName(name);
    try {
      const { url } = await uploadImage(file, "nextfit/trainer-cert-proofs");
      setForm((prev) => ({
        ...prev,
        certifications: prev.certifications.map((c) => (c.name === name ? { ...c, certDocUrl: url } : c)),
      }));
    } catch {
      setError("Failed to upload certificate proof. Try again.");
    } finally {
      setUploadingCertName(null);
      if (certProofRef.current) certProofRef.current.value = "";
    }
  }

  // ── Avatar ──
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { url } = await uploadImage(file, "nextfit/trainer-avatars");
      update("photoUrl", url);
    } catch {
      setError("Failed to upload photo. Try again.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  // ── Languages ──
  function addLanguage(lang: string) {
    const trimmed = lang.trim();
    if (!trimmed || form.languages.includes(trimmed)) return;
    update("languages", [...form.languages, trimmed]);
    setLanguageInput("");
  }

  function removeLanguage(lang: string) {
    update("languages", form.languages.filter((l) => l !== lang));
  }

  // ── Transformation photos ──
  async function handleTransformationChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (!consentConfirmed) {
      setError("Please confirm consent before uploading transformation photos.");
      return;
    }
    setUploadingTransformation(true);
    try {
      for (const file of files) {
        const { url, publicId } = await uploadImage(file, "nextfit/trainer-transformations");
        const res = await fetch("/api/trainer/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, publicId, category: "transformation", consentConfirmed: true }),
        });
        if (!res.ok) throw new Error("Failed to save photo");
        const { photo } = await res.json();
        setTransformationPhotos((prev) => [...prev, photo]);
      }
    } catch {
      setError("Failed to upload photo. Try again.");
    } finally {
      setUploadingTransformation(false);
      if (transformationRef.current) transformationRef.current.value = "";
    }
  }

  // ── Step handlers ──
  function validateStep1() {
    const errs: Record<string, string> = {};
    if (!form.displayName.trim()) errs.displayName = "Full name is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.state.trim()) errs.state = "State is required";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleStep1() {
    if (!validateStep1()) return;
    setSaving(true);
    setError("");
    const result = await saveStep({
      step: 1,
      profileType: form.profileType,
      displayName: form.displayName,
      bio: form.bio,
      photoUrl: form.photoUrl,
      city: form.city,
      state: form.state,
      virtualAvailable: form.virtualAvailable,
      yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : undefined,
    });
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setStep(2);
  }

  async function handleStep2() {
    setSaving(true);
    setError("");
    const result = await saveStep({ step: 2, certifications: form.certifications, education: form.education });
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setStep(3);
  }

  async function handleStep3() {
    setSaving(true);
    setError("");
    const specialties = [
      ...form.trainingStyles.map((specialty) => ({ specialty, category: "STYLE" as const })),
      ...form.clientFocus.map((specialty) => ({ specialty, category: "FOCUS" as const })),
    ];
    const result = await saveStep({
      step: 3,
      specialties,
      sessionTypes: form.sessionTypes,
      trainingLocations: form.trainingLocations,
    });
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setStep(4);
  }

  async function handleStep4() {
    setSaving(true);
    setError("");
    const result = await saveStep({
      step: 4,
      bookingUrl: form.bookingUrl,
      pricingModel: form.pricingModel || undefined,
      priceMin: form.priceMin ? parseInt(form.priceMin) : undefined,
      priceMax: form.priceMax ? parseInt(form.priceMax) : undefined,
      availabilityType: form.availabilityType || undefined,
      availabilityDays: form.availabilityType === "limited" ? form.availabilityDays : [],
      sessionLengths: form.sessionLengths,
    });
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setStep(5);
  }

  async function handleStep5() {
    setSaving(true);
    setError("");
    const result = await saveStep({
      step: 5,
      vslUrl: form.vslUrl,
      instagramHandle: form.instagramHandle,
      youtubeHandle: form.youtubeHandle,
    });
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setStep(6);
  }

  async function handleStep6() {
    setSaving(true);
    setError("");
    const result = await saveStep({
      step: 6,
      philosophy: form.philosophy,
      whoIWorkWith: form.whoIWorkWith,
      languages: form.languages,
      complete: true,
    });
    if (result.error) { setError(result.error); setSaving(false); return; }

    if (FREE_LAUNCH) {
      // Free-launch phase: profile goes live immediately, no checkout.
      window.location.href = "/dashboard/trainer?published=1";
      return;
    }

    const checkoutRes = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileType: "trainer" }),
    });
    const { url, error: checkoutError } = await checkoutRes.json();
    if (checkoutError) { setError(checkoutError); setSaving(false); return; }
    window.location.href = url;
  }

  const progress = ((step - 1) / STEPS.length) * 100;

  function Chips({ options, selected, onToggle }: { options: readonly string[]; selected: string[]; onToggle: (v: string) => void }) {
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm border transition-colors",
              selected.includes(opt) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-gray-300 hover:border-emerald-400"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-8 font-heading text-emerald-700 font-bold text-xl">
        <Dumbbell className="h-6 w-6" />
        NextFit — Create Your Profile
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>Step {step} of {STEPS.length}</span>
          <span>{STEPS[step - 1]}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step - 1]}</CardTitle>
          {step === 1 && <CardDescription>Tell clients who you are</CardDescription>}
          {step === 2 && <CardDescription>Highlight your credentials and education</CardDescription>}
          {step === 3 && <CardDescription>How you train, and who you train</CardDescription>}
          {step === 4 && <CardDescription>Pricing, availability, and session length</CardDescription>}
          {step === 5 && <CardDescription>Show clients real results and where to find you online</CardDescription>}
          {step === 6 && <CardDescription>What makes you, you</CardDescription>}
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          {/* ── Step 1: Basics ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {form.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">💪</span>
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
                  <p className="text-sm text-gray-700 font-medium">Profile photo</p>
                  <p className="text-xs text-gray-400 mt-0.5">A clear headshot helps clients trust you</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Profile type</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PROFILE_TYPES.map((pt) => (
                    <button
                      key={pt.value}
                      type="button"
                      onClick={() => update("profileType", pt.value)}
                      className={cn(
                        "p-3 rounded-lg border text-sm text-left transition-colors",
                        form.profileType === pt.value ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      {pt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="displayName">Full name *</Label>
                <Input id="displayName" value={form.displayName} onChange={(e) => update("displayName", e.target.value)} placeholder="Marcus Johnson" />
                {fieldErrors.displayName && <p className="text-xs text-red-600">{fieldErrors.displayName}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio <span className="text-gray-400 font-normal">(2-3 punchy sentences)</span></Label>
                <Textarea id="bio" value={form.bio} onChange={(e) => update("bio", e.target.value)} rows={3} maxLength={500} placeholder="Tell potential clients about your background, training philosophy, and what makes you unique..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>City *</Label>
                  <CityAutocomplete
                    cityValue={form.city}
                    onCityChange={(v) => update("city", v)}
                    onSelect={({ city, state }) => {
                      update("city", city);
                      update("state", state);
                    }}
                    placeholder="Austin"
                  />
                  {fieldErrors.city && <p className="text-xs text-red-600">{fieldErrors.city}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" value={form.state} onChange={(e) => update("state", e.target.value.toUpperCase())} placeholder="TX" maxLength={2} />
                  {fieldErrors.state && <p className="text-xs text-red-600">{fieldErrors.state}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="yearsExperience">Years of experience</Label>
                <Input id="yearsExperience" type="number" min={0} max={60} value={form.yearsExperience} onChange={(e) => update("yearsExperience", e.target.value)} placeholder="e.g. 8" />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.virtualAvailable}
                  onChange={(e) => update("virtualAvailable", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm">I also offer virtual sessions</span>
              </label>

              <Button className="w-full" onClick={handleStep1} loading={saving}>
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* ── Step 2: Credentials ── */}
          {step === 2 && (
            <div className="space-y-6">
              <input ref={certProofRef} type="file" accept="image/*" className="hidden" onChange={handleCertProofChange} />

              <div>
                <Label className="mb-3 block">Certifications</Label>
                <div className="flex flex-wrap gap-2">
                  {CERTIFICATIONS.map((cert) => (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => toggleCert(cert)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm border transition-colors",
                        form.certifications.some((c) => c.name === cert) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-gray-300 hover:border-emerald-400"
                      )}
                    >
                      {cert}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 mt-3">
                  <Input
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    placeholder="Add another certification…"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomCert(); } }}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addCustomCert}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {form.certifications.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {form.certifications.map((c) => (
                      <div key={c.name} className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-sm text-gray-700">{c.name}</span>
                        <div className="flex items-center gap-2">
                          {c.certDocUrl ? (
                            <span className="text-xs text-emerald-600 font-medium">✓ Proof added</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => requestCertProofUpload(c.name)}
                              disabled={uploadingCertName === c.name}
                              className="text-xs text-gray-500 hover:text-emerald-600 flex items-center gap-1"
                            >
                              {uploadingCertName === c.name ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                              Add proof
                            </button>
                          )}
                          <button type="button" onClick={() => removeCert(c.name)} className="text-gray-400 hover:text-red-500">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">Certifications are reviewed by our team within 48 hours. Uploading proof speeds up verification.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="education">Education <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Textarea id="education" value={form.education} onChange={(e) => update("education", e.target.value)} rows={3} placeholder="e.g. BS Exercise Science, University of Texas" />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1"><ChevronLeft className="h-4 w-4" />Back</Button>
                <Button onClick={handleStep2} loading={saving} className="flex-1">Continue <ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}

          {/* ── Step 3: What You Do ── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block">Training styles</Label>
                <Chips options={TRAINING_STYLES} selected={form.trainingStyles} onToggle={(v) => update("trainingStyles", toggleInArray(form.trainingStyles, v))} />
              </div>
              <div>
                <Label className="mb-2 block">Client focus <span className="text-gray-400 font-normal text-xs">who you work best with</span></Label>
                <Chips options={CLIENT_FOCUS_AREAS} selected={form.clientFocus} onToggle={(v) => update("clientFocus", toggleInArray(form.clientFocus, v))} />
              </div>
              <div>
                <Label className="mb-2 block">Session types offered</Label>
                <Chips options={SESSION_TYPES} selected={form.sessionTypes} onToggle={(v) => update("sessionTypes", toggleInArray(form.sessionTypes, v))} />
              </div>
              <div>
                <Label className="mb-2 block">Where you train</Label>
                <Chips options={TRAINING_LOCATIONS} selected={form.trainingLocations} onToggle={(v) => update("trainingLocations", toggleInArray(form.trainingLocations, v))} />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1"><ChevronLeft className="h-4 w-4" />Back</Button>
                <Button onClick={handleStep3} loading={saving} className="flex-1">Continue <ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}

          {/* ── Step 4: Logistics ── */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block">Pricing model <span className="text-gray-400 font-normal text-xs">(optional)</span></Label>
                <div className="grid grid-cols-3 gap-2">
                  {PRICING_MODELS.map((pm) => (
                    <button
                      key={pm.value}
                      type="button"
                      onClick={() => update("pricingModel", form.pricingModel === pm.value ? "" : pm.value)}
                      className={cn(
                        "py-2 px-2 rounded-lg border text-sm font-medium transition-colors",
                        form.pricingModel === pm.value ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-gray-200 text-gray-600 hover:border-gray-300"
                      )}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="priceMin">Price min ($)</Label>
                    <Input id="priceMin" type="number" min={0} value={form.priceMin} onChange={(e) => update("priceMin", e.target.value)} placeholder="50" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="priceMax">Price max ($)</Label>
                    <Input id="priceMax" type="number" min={0} value={form.priceMax} onChange={(e) => update("priceMax", e.target.value)} placeholder="100" />
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Availability</Label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABILITY_TYPES.map((a) => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => update("availabilityType", form.availabilityType === a.value ? "" : a.value)}
                      className={cn(
                        "py-2 px-2 rounded-lg border text-sm font-medium transition-colors",
                        form.availabilityType === a.value ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-gray-200 text-gray-600 hover:border-gray-300"
                      )}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
                {form.availabilityType === "limited" && (
                  <div className="mt-3">
                    <Chips options={DAYS_OF_WEEK} selected={form.availabilityDays} onToggle={(v) => update("availabilityDays", toggleInArray(form.availabilityDays, v))} />
                  </div>
                )}
              </div>

              <div>
                <Label className="mb-2 block">Session length options <span className="text-gray-400 font-normal text-xs">(minutes)</span></Label>
                <div className="flex flex-wrap gap-2">
                  {SESSION_LENGTHS.map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => update("sessionLengths", form.sessionLengths.includes(len) ? form.sessionLengths.filter((l) => l !== len) : [...form.sessionLengths, len])}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm border transition-colors",
                        form.sessionLengths.includes(len) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-gray-300 hover:border-emerald-400"
                      )}
                    >
                      {len} min
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bookingUrl">Booking link <span className="text-gray-400 font-normal text-xs">(optional)</span></Label>
                <Input id="bookingUrl" value={form.bookingUrl} onChange={(e) => update("bookingUrl", e.target.value)} placeholder="https://calendly.com/yourname" />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1"><ChevronLeft className="h-4 w-4" />Back</Button>
                <Button onClick={handleStep4} loading={saving} className="flex-1">Continue <ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}

          {/* ── Step 5: Social Proof ── */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-sm text-emerald-800">
                Your verified client reviews will appear on your profile automatically — no need to add testimonials here.
              </div>

              <div>
                <Label className="mb-2 block">Transformation photos <span className="text-gray-400 font-normal text-xs">(before/after — optional)</span></Label>
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input type="checkbox" checked={consentConfirmed} onChange={(e) => setConsentConfirmed(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-sm text-gray-700">I have consent to share these photos publicly</span>
                </label>
                <input ref={transformationRef} type="file" accept="image/*" multiple className="hidden" onChange={handleTransformationChange} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => transformationRef.current?.click()}
                  disabled={!consentConfirmed || uploadingTransformation}
                >
                  {uploadingTransformation ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</> : <><Upload className="h-4 w-4" /> Add photos</>}
                </Button>
                {transformationPhotos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {transformationPhotos.map((p) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={p.id} src={p.url} alt="Transformation" className="aspect-square rounded-lg object-cover" />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="vslUrl">Intro video <span className="text-gray-400 font-normal">(YouTube or Vimeo, optional)</span></Label>
                <Input id="vslUrl" value={form.vslUrl} onChange={(e) => update("vslUrl", e.target.value)} placeholder="https://youtube.com/watch?v=..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="instagramHandle">Instagram <span className="text-gray-400 font-normal text-xs">(optional)</span></Label>
                  <Input id="instagramHandle" value={form.instagramHandle} onChange={(e) => update("instagramHandle", e.target.value)} placeholder="@yourhandle" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="youtubeHandle">YouTube <span className="text-gray-400 font-normal text-xs">(optional)</span></Label>
                  <Input id="youtubeHandle" value={form.youtubeHandle} onChange={(e) => update("youtubeHandle", e.target.value)} placeholder="@yourchannel" />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(4)} className="flex-1"><ChevronLeft className="h-4 w-4" />Back</Button>
                <Button onClick={handleStep5} loading={saving} className="flex-1">Continue <ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}

          {/* ── Step 6: Personality & Fit ── */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="philosophy">Training philosophy <span className="text-gray-400 font-normal text-xs">(1-2 sentences)</span></Label>
                <Textarea id="philosophy" value={form.philosophy} onChange={(e) => update("philosophy", e.target.value)} rows={2} maxLength={300} placeholder="e.g. I believe sustainable results come from consistency, not intensity." />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="whoIWorkWith">Who you work best with</Label>
                <Textarea id="whoIWorkWith" value={form.whoIWorkWith} onChange={(e) => update("whoIWorkWith", e.target.value)} rows={3} maxLength={1000} placeholder="Describe your ideal client — their goals, fitness level, age range, or anything that helps people know if you're a great fit…" />
              </div>

              <div className="space-y-2">
                <Label>Languages spoken</Label>
                <div className="flex gap-2">
                  <Input
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    placeholder="e.g. English"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLanguage(languageInput); } }}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => addLanguage(languageInput)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.filter((l) => !form.languages.includes(l)).slice(0, 6).map((l) => (
                    <button key={l} type="button" onClick={() => addLanguage(l)} className="px-2.5 py-1 rounded-full text-xs border border-gray-300 text-gray-500 hover:border-emerald-400">
                      + {l}
                    </button>
                  ))}
                </div>
                {form.languages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {form.languages.map((l) => (
                      <span key={l} className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                        {l}
                        <button type="button" onClick={() => removeLanguage(l)} className="text-gray-400 hover:text-gray-600">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(5)} className="flex-1"><ChevronLeft className="h-4 w-4" />Back</Button>
                <Button onClick={handleStep6} loading={saving} className="flex-1">Start Getting Clients Now <ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
