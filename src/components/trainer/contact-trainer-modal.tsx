"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, MessageSquare } from "lucide-react";
import { toast } from "@/components/ui/toaster";

const schema = z.object({
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  trainerId: string;
  trainerName: string;
  isLoggedIn: boolean;
}

export function ContactTrainerModal({ trainerId, trainerName, isLoggedIn }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      message: `Hi ${trainerName}, I'm interested in learning more about your training services.`,
    },
  });

  function handleOpenChange(val: boolean) {
    if (val && !isLoggedIn) {
      router.push(`/login?next=/trainer/${trainerId}`);
      return;
    }
    setOpen(val);
  }

  async function onSubmit(data: FormValues) {
    const res = await fetch("/api/contact/trainer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trainerProfileId: trainerId, message: data.message }),
    });

    if (res.ok) {
      toast({ title: "Message sent!", description: `${trainerName} will be in touch soon.` });
      reset();
      setOpen(false);
    } else {
      const json = await res.json();
      toast({ title: "Error", description: json.error ?? "Could not send message.", variant: "destructive" });
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <Button className="w-full">
          <MessageSquare className="h-4 w-4" />
          Request a Free Consult
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-xl z-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="font-semibold text-lg">Contact {trainerName}</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="message">Your message</Label>
              <Textarea
                id="message"
                {...register("message")}
                rows={5}
                placeholder="Introduce yourself and describe what you're looking for..."
              />
              {errors.message && <p className="text-xs text-red-600">{errors.message.message}</p>}
            </div>
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Send message
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
