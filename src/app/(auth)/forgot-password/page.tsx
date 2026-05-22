"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <Link href="/" className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-xl mb-4">
            <Dumbbell className="h-6 w-6" />
            FitHunter
          </Link>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>Enter your email to receive a reset link</CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">📬</div>
              <p className="text-sm text-gray-600">
                If that email is associated with a FitHunter account, you&apos;ll receive a reset link within a few minutes.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full">Back to login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" {...register("email")} placeholder="you@example.com" />
                {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
              </div>
              <Button type="submit" className="w-full" loading={isSubmitting}>
                Send reset link
              </Button>
              <Link href="/login" className="block text-center text-sm text-gray-500 hover:text-gray-700">
                Back to login
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
