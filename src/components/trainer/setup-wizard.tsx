"use client";

import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CERTIFICATIONS, SPECIALTIES, PROFILE_TYPES } from "@/lib/constants";
import { Dumbbell, ChevronRight, ChevronLeft } from "lucide-react";

const STEPS = [
  "Basic Info",
  "Certifications & Specialties",
  "Location",
  "Video",
];

const step1Schema = z.object({
  displayName: z.string().min(1, "Full name is required"),
  profileType: z.enum(["PERSONAL_TRAINER", "GROUP_FITNESS", "NUTRITIONIST", "WELLNESS_COACH", "PHYSICAL_THERAPIST"]),
  bio: z.string().max(500).optional(),
  photoUrl: z.string().url("Enter a valid image URL").optional().or(z.literal("")),
});
type Step1Values = z.infer<typeof step1Schema>;

const step3Schema = z.object({
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  virtualAvailable: z.boolean(),
  bookingUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});
type Step3Values = z.infer<typeof step3Schema>;

const step4Schema = z.object({
  vslUrl: z.string().url("Enter a valid YouTube or Vimeo URL").optional().or(z.literal("")),
});
type Step4Values = z.infer<typeof step4Schema>;

async function saveStep(payload: object) {
  const res = await fetch("/api/trainer/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export function TrainerSetupWizard() {

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  const form1 = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { profileType: "PERSONAL_TRAINER" },
  });

  const form3 = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: { virtualAvailable: false },
  });

  const form4 = useForm<Step4Values>({ resolver: zodResolver(step4Schema) });

  function toggleCert(cert: string) {
    setSelectedCerts((prev) => prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]);
  }

  function toggleSpecialty(specialty: string) {
    setSelectedSpecialties((prev) => {
      if (prev.includes(specialty)) return prev.filter((s) => s !== specialty);
      if (prev.length >= 5) return prev;
      return [...prev, specialty];
    });
  }

  async function handleStep1(data: Step1Values) {
    setSaving(true);
    setError("");
    const result = await saveStep({ step: 1, ...data });
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setStep(2);
  }

  async function handleStep2() {
    setSaving(true);
    const result = await saveStep({ step: 2, certifications: selectedCerts, specialties: selectedSpecialties });
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setStep(3);
  }

  async function handleStep3(data: Step3Values) {
    setSaving(true);
    const result = await saveStep({ step: 3, ...data });
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setStep(4);
  }

  async function handleStep4(data: Step4Values) {
    setSaving(true);
    setError("");
    const result = await saveStep({ step: 4, ...data, complete: true });
    if (result.error) { setError(result.error); setSaving(false); return; }

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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-8 text-emerald-700 font-bold text-xl">
        <Dumbbell className="h-6 w-6" />
        FitHunter — Create Your Profile
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
          {step === 2 && <CardDescription>Highlight your credentials and focus areas</CardDescription>}
          {step === 3 && <CardDescription>Let clients know where to find you</CardDescription>}
          {step === 4 && <CardDescription>Add a video to introduce yourself (optional)</CardDescription>}
          {step === 5 && <CardDescription>Choose the plan that fits your goals</CardDescription>}
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          {step === 1 && (
            <form onSubmit={form1.handleSubmit(handleStep1)} className="space-y-5">
              <div className="space-y-1.5">
                <Label>Profile type</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PROFILE_TYPES.map((pt) => {
                    const selected = form1.watch("profileType") === pt.value;
                    return (
                      <button
                        key={pt.value}
                        type="button"
                        onClick={() => form1.setValue("profileType", pt.value)}
                        className={`p-3 rounded-lg border text-sm text-left transition-colors ${selected ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        {pt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="displayName">Full name *</Label>
                <Input id="displayName" {...form1.register("displayName")} placeholder="Marcus Johnson" />
                {form1.formState.errors.displayName && <p className="text-xs text-red-600">{form1.formState.errors.displayName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio <span className="text-gray-400 font-normal">(up to 500 chars)</span></Label>
                <Textarea id="bio" {...form1.register("bio")} rows={4} placeholder="Tell potential clients about your background, training philosophy, and what makes you unique..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="photoUrl">Profile photo URL</Label>
                <Input id="photoUrl" {...form1.register("photoUrl")} placeholder="https://..." />
                {form1.formState.errors.photoUrl && <p className="text-xs text-red-600">{form1.formState.errors.photoUrl.message}</p>}
              </div>
              <Button type="submit" className="w-full" loading={saving}>
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Certifications</Label>
                <div className="flex flex-wrap gap-2">
                  {CERTIFICATIONS.map((cert) => (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => toggleCert(cert)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${selectedCerts.includes(cert) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-gray-300 hover:border-emerald-400"}`}
                    >
                      {cert}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-1 block">Specialties <span className="text-gray-400 font-normal">(up to 5)</span></Label>
                <p className="text-xs text-gray-500 mb-3">{selectedSpecialties.length}/5 selected</p>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpecialty(s)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${selectedSpecialties.includes(s) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-gray-300 hover:border-emerald-400"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1"><ChevronLeft className="h-4 w-4" />Back</Button>
                <Button onClick={handleStep2} loading={saving} className="flex-1">Continue <ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={form3.handleSubmit(handleStep3)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" {...form3.register("city")} placeholder="Austin" />
                  {form3.formState.errors.city && <p className="text-xs text-red-600">{form3.formState.errors.city.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" {...form3.register("state")} placeholder="TX" maxLength={2} />
                  {form3.formState.errors.state && <p className="text-xs text-red-600">{form3.formState.errors.state.message}</p>}
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...form3.register("virtualAvailable")} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                <span className="text-sm">I offer virtual sessions</span>
              </label>
              <div className="space-y-1.5">
                <Label htmlFor="bookingUrl">Booking link (optional)</Label>
                <Input id="bookingUrl" {...form3.register("bookingUrl")} placeholder="https://calendly.com/..." />
                {form3.formState.errors.bookingUrl && <p className="text-xs text-red-600">{form3.formState.errors.bookingUrl.message}</p>}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1"><ChevronLeft className="h-4 w-4" />Back</Button>
                <Button type="submit" loading={saving} className="flex-1">Continue <ChevronRight className="h-4 w-4" /></Button>
              </div>
            </form>
          )}

          {step === 4 && (
            <form onSubmit={form4.handleSubmit(handleStep4)} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="vslUrl">YouTube or Vimeo URL (optional)</Label>
                <Input id="vslUrl" {...form4.register("vslUrl")} placeholder="https://youtube.com/watch?v=..." />
                {form4.formState.errors.vslUrl && <p className="text-xs text-red-600">{form4.formState.errors.vslUrl.message}</p>}
                <p className="text-xs text-gray-400">A 1–2 min intro video helps you stand out and get more contact requests.</p>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(3)} className="flex-1"><ChevronLeft className="h-4 w-4" />Back</Button>
                <Button type="submit" loading={saving} className="flex-1">Continue to Payment <ChevronRight className="h-4 w-4" /></Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
