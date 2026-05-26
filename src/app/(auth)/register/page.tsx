"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dumbbell, Plus, X, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type AccountTypeChoice = "CONSUMER" | "TRAINER" | "GYM";
type TrainingMode = "in-person" | "virtual" | "both";

interface FormData {
  accountType: AccountTypeChoice;
  name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  state: string;
  trainingMode: TrainingMode;
  specialties: string[];
  certifications: string[];
  gymName: string;
  addressLine1: string;
  zip: string;
  knownFor: string;
  amenities: string[];
}

const TRAINER_SPECIALTIES = [
  "Weight Loss", "Strength Training", "HIIT / Cardio", "Yoga / Flexibility",
  "Sports Performance", "Nutrition Coaching", "Senior Fitness", "Pre/Post Natal",
  "Bodybuilding", "Rehabilitation",
];

const GYM_AMENITIES = [
  "Free Weights", "Cardio Equipment", "Swimming Pool", "Group Classes",
  "Sauna / Steam Room", "Locker Rooms", "Personal Training", "Parking",
  "Childcare", "24/7 Access",
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

const accountTypes = [
  {
    value: "CONSUMER" as const,
    label: "I'm looking for a trainer or gym",
    desc: "Find top-rated trainers and gyms near you",
    icon: "🔍",
  },
  {
    value: "TRAINER" as const,
    label: "I'm a fitness professional",
    desc: "Build your profile and get discovered by clients",
    icon: "💪",
  },
  {
    value: "GYM" as const,
    label: "I represent a gym or studio",
    desc: "Showcase your gym and attract new members",
    icon: "🏋️",
  },
];

const initialData: FormData = {
  accountType: "CONSUMER",
  name: "",
  email: "",
  password: "",
  phone: "",
  city: "",
  state: "",
  trainingMode: "in-person",
  specialties: [],
  certifications: [],
  gymName: "",
  addressLine1: "",
  zip: "",
  knownFor: "",
  amenities: [],
};

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialData);
  const [certInput, setCertInput] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const totalSteps = formData.accountType === "CONSUMER" ? 2 : 3;

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function toggleSpecialty(s: string) {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(s)
        ? prev.specialties.filter((x) => x !== s)
        : [...prev.specialties, s],
    }));
  }

  function toggleAmenity(a: string) {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }));
  }

  function addCert() {
    const trimmed = certInput.trim();
    if (!trimmed) return;
    setFormData((prev) => ({ ...prev, certifications: [...prev.certifications, trimmed] }));
    setCertInput("");
  }

  function removeCert(i: number) {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, idx) => idx !== i),
    }));
  }

  function validateStep2() {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Full name is required";
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email))
      errs.email = "Valid email is required";
    if (formData.password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (formData.accountType === "GYM" && !formData.gymName.trim())
      errs.gymName = "Gym name is required";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep3() {
    const errs: Record<string, string> = {};
    if (formData.accountType === "GYM") {
      if (!formData.addressLine1.trim()) errs.addressLine1 = "Street address is required";
      if (!formData.city.trim()) errs.city = "City is required";
      if (!formData.state) errs.state = "State is required";
      if (!formData.zip.trim()) errs.zip = "ZIP code is required";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setServerError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    setIsSubmitting(false);
    if (!res.ok) {
      setServerError(json.error ?? "Registration failed.");
      return;
    }
    setSuccess(true);
  }

  function goNext() {
    if (step === 2) {
      if (!validateStep2()) return;
      if (formData.accountType === "CONSUMER") {
        handleSubmit();
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!validateStep3()) return;
      handleSubmit();
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="text-5xl mb-4">📬</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h2>
            <p className="text-gray-500 text-sm">
              We sent a verification link to your email. Click it to activate your account.
            </p>
            <Link href="/login" className="mt-6 block">
              <Button variant="outline" className="w-full">Back to login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="pb-2">
          <Link href="/" className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-xl mb-4">
            <Dumbbell className="h-6 w-6" />
            FitHunter
          </Link>

          {step === 1 ? (
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">Create your account</h1>
              <p className="text-sm text-gray-500 mt-1">Choose how you&apos;ll use FitHunter</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
                <span className="text-xs text-gray-400 font-medium">Step {step} of {totalSteps}</span>
                <div className="w-14" />
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full">
                <div
                  className="h-1.5 bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* ── Step 1: Account type ── */}
          {step === 1 && (
            <div className="space-y-3">
              {accountTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    update("accountType", type.value);
                    setStep(2);
                  }}
                  className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-gray-200 text-left transition-colors hover:border-emerald-400 hover:bg-emerald-50"
                >
                  <span className="text-2xl mt-0.5">{type.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{type.label}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{type.desc}</p>
                  </div>
                </button>
              ))}

              <div className="relative mt-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">or</div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => signIn("google", { callbackUrl: "/" })}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>

              <p className="text-center text-sm text-gray-500 pt-1">
                Already have an account?{" "}
                <Link href="/login" className="text-emerald-600 font-medium hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          )}

          {/* ── Step 2: Account credentials ── */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900 text-lg">
                {formData.accountType === "GYM" ? "Your account details" : "Your account details"}
              </h2>

              {formData.accountType === "GYM" && (
                <div className="space-y-1.5">
                  <Label>Gym / Studio name</Label>
                  <Input
                    value={formData.gymName}
                    onChange={(e) => update("gymName", e.target.value)}
                    placeholder="Gold's Gym Downtown"
                  />
                  {fieldErrors.gymName && (
                    <p className="text-xs text-red-600">{fieldErrors.gymName}</p>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <Label>
                  {formData.accountType === "GYM" ? "Your name (owner / manager)" : "Full name"}
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Jordan Smith"
                />
                {fieldErrors.name && <p className="text-xs text-red-600">{fieldErrors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Email address</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@example.com"
                />
                {fieldErrors.email && <p className="text-xs text-red-600">{fieldErrors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Min. 8 characters"
                />
                {fieldErrors.password && (
                  <p className="text-xs text-red-600">{fieldErrors.password}</p>
                )}
              </div>

              {serverError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {serverError}
                </div>
              )}

              <Button className="w-full" onClick={goNext} loading={isSubmitting}>
                {formData.accountType === "CONSUMER" ? "Create account" : "Continue"}
              </Button>
            </div>
          )}

          {/* ── Step 3: Trainer details ── */}
          {step === 3 && formData.accountType === "TRAINER" && (
            <div className="space-y-5">
              <h2 className="font-semibold text-gray-900 text-lg">Tell us how you train</h2>

              <div className="space-y-2">
                <Label>How do you work with clients?</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["in-person", "virtual", "both"] as TrainingMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => update("trainingMode", mode)}
                      className={cn(
                        "py-2.5 px-2 rounded-lg border text-sm font-medium transition-colors",
                        formData.trainingMode === mode
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      )}
                    >
                      {mode === "in-person" ? "In-Person" : mode === "virtual" ? "Virtual" : "Both"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>City <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="Los Angeles"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>State <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    value={formData.state}
                    onChange={(e) => update("state", e.target.value)}
                  >
                    <option value="">Select...</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Phone number <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="(555) 000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Your specialties{" "}
                  <span className="text-gray-400 font-normal">(optional — select all that apply)</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {TRAINER_SPECIALTIES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpecialty(s)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border text-sm transition-colors",
                        formData.specialties.includes(s)
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Certifications{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    placeholder="e.g. NASM CPT, ACE, CSCS"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCert();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addCert}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.certifications.map((c, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                      >
                        {c}
                        <button
                          type="button"
                          onClick={() => removeCert(i)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {serverError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {serverError}
                </div>
              )}

              <Button className="w-full" onClick={goNext} loading={isSubmitting}>
                Create account
              </Button>
            </div>
          )}

          {/* ── Step 3: Gym details ── */}
          {step === 3 && formData.accountType === "GYM" && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900 text-lg">Tell us about your gym</h2>

              <div className="space-y-1.5">
                <Label>Street address</Label>
                <Input
                  value={formData.addressLine1}
                  onChange={(e) => update("addressLine1", e.target.value)}
                  placeholder="123 Main St"
                />
                {fieldErrors.addressLine1 && (
                  <p className="text-xs text-red-600">{fieldErrors.addressLine1}</p>
                )}
              </div>

              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label>City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="Chicago"
                  />
                  {fieldErrors.city && <p className="text-xs text-red-600">{fieldErrors.city}</p>}
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>State</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    value={formData.state}
                    onChange={(e) => update("state", e.target.value)}
                  >
                    <option value="">Select...</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {fieldErrors.state && <p className="text-xs text-red-600">{fieldErrors.state}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>ZIP</Label>
                  <Input
                    value={formData.zip}
                    onChange={(e) => update("zip", e.target.value)}
                    placeholder="60601"
                  />
                  {fieldErrors.zip && <p className="text-xs text-red-600">{fieldErrors.zip}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Phone <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="(555) 000-0000"
                />
              </div>

              <div className="space-y-1.5">
                <Label>
                  What is your gym known for?{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Input
                  value={formData.knownFor}
                  onChange={(e) => update("knownFor", e.target.value)}
                  placeholder="e.g. CrossFit, strength training, boxing"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Amenities{" "}
                  <span className="text-gray-400 font-normal">(optional — select all that apply)</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {GYM_AMENITIES.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border text-sm transition-colors",
                        formData.amenities.includes(a)
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {serverError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {serverError}
                </div>
              )}

              <Button className="w-full" onClick={goNext} loading={isSubmitting}>
                Create account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
