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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Mail } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { CONTACT_SUBJECTS } from "@/lib/constants";
import { Controller } from "react-hook-form";

const schema = z.object({
  subject: z.enum(CONTACT_SUBJECTS as unknown as [string, ...string[]]),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  gymId: string;
  gymName: string;
  isLoggedIn: boolean;
}

export function ContactGymModal({ gymId, gymName, isLoggedIn }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { subject: CONTACT_SUBJECTS[0] },
  });

  function handleOpenChange(val: boolean) {
    if (val && !isLoggedIn) {
      router.push(`/login?next=/gym/${gymId}`);
      return;
    }
    setOpen(val);
  }

  async function onSubmit(data: FormValues) {
    const res = await fetch("/api/contact/gym", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gymProfileId: gymId, ...data }),
    });
    if (res.ok) {
      toast({ title: "Message sent!", description: `${gymName} will be in touch soon.` });
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
        <Button className="w-full"><Mail className="h-4 w-4" />Contact Gym</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-xl z-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="font-semibold text-lg">Contact {gymName}</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Controller
                control={control}
                name="subject"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CONTACT_SUBJECTS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" {...register("message")} rows={5} placeholder="Your message..." />
              {errors.message && <p className="text-xs text-red-600">{errors.message.message}</p>}
            </div>
            <Button type="submit" className="w-full" loading={isSubmitting}>Send message</Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
