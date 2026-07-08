import Link from "next/link";
import { ArrowRight, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomepageSearch } from "@/components/homepage-search";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  // Pro CTAs adapt to who's looking: existing pros go to their dashboard,
  // everyone else goes to trainer signup (preselected via ?type=).
  const accountType = session?.user?.accountType;
  const isPro = accountType === "TRAINER" || accountType === "GYM";
  const proHref = isPro
    ? accountType === "TRAINER"
      ? "/dashboard/trainer"
      : "/dashboard/gym"
    : "/register?type=TRAINER";

  return (
    <div className="flex flex-col">
      {/* ============ Hero ============ */}
      <section className="relative min-h-[85vh] flex items-end text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://res.cloudinary.com/dja1qlwmq/image/upload/v1779986312/hero_g4lxrj.png')",
          }}
          aria-hidden
        />
        {/* Intentional grade: ink wash anchored to the text edges (bottom + left) */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/20" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/70 via-ink-950/25 to-transparent" aria-hidden />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-40 md:pb-24">
          <div className="max-w-3xl">
            <p className="kicker mb-5 text-ink-100 [text-shadow:0_1px_8px_rgba(10,11,13,0.55)]">
              Trainers · Gyms · Real reviews
            </p>
            <h1 className="font-heading text-display uppercase text-white mb-6">
              Find your
              <br />
              next coach<span className="text-accent">.</span>
            </h1>
            <p className="text-lg md:text-xl text-ink-200 max-w-xl mb-10">
              Search verified trainers and gyms near you. Filter by specialty,
              read reviews from real clients, and reach out — before you commit
              to a single session.
            </p>
            <HomepageSearch />
          </div>
        </div>
      </section>

      {/* ============ Primary paths — asymmetric split ============ */}
      <section className="section-pad px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Dominant panel */}
            <Link
              href="/search?type=PERSONAL_TRAINER"
              className="group lg:col-span-7 flex flex-col justify-between bg-ink-950 text-white rounded-card p-8 md:p-12 min-h-[320px] transition-colors hover:bg-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2"
            >
              <span className="kicker text-ink-300">01 — Most popular</span>
              <div>
                <h2 className="font-heading text-headline uppercase mb-3">
                  Find a trainer
                </h2>
                <p className="text-ink-300 max-w-md mb-6">
                  Certified professionals near you — strength, conditioning,
                  nutrition, rehab. Every credential reviewed by our team.
                </p>
                <span className="inline-flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider text-accent">
                  Start searching
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            {/* Two stacked secondary panels */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <Link
                href="/search?type=GYM"
                className="group flex-1 flex flex-col justify-between border border-border bg-surface rounded-card p-8 transition-all hover:border-ink-900 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2"
              >
                <span className="kicker">02</span>
                <div className="mt-6">
                  <h2 className="font-heading text-title uppercase text-ink-950 mb-1">
                    Find a gym
                  </h2>
                  <p className="text-sm text-muted mb-4">
                    Studios and gyms with real member reviews.
                  </p>
                  <span className="inline-flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-ink-950">
                    Browse gyms
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>

              <Link
                href={proHref}
                className="group flex-1 flex flex-col justify-between border border-border bg-surface rounded-card p-8 transition-all hover:border-ink-900 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2"
              >
                <span className="kicker">03</span>
                <div className="mt-6">
                  <h2 className="font-heading text-title uppercase text-ink-950 mb-1">
                    I&apos;m a fitness pro
                  </h2>
                  <p className="text-sm text-muted mb-4">
                    {isPro
                      ? "Manage your profile, reviews, and billing."
                      : "Build your profile, collect reviews, get discovered."}
                  </p>
                  <span className="inline-flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-ink-950">
                    {isPro ? "Open your dashboard" : "Claim your spot"}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Why NextFit — editorial list, no cards ============ */}
      <section className="section-pad px-4 sm:px-6 lg:px-8 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <p className="kicker mb-4">Why NextFit</p>
            <h2 className="font-heading text-headline uppercase text-ink-950 text-balance">
              Built on proof, not promises
            </h2>
          </div>
          <div className="lg:col-span-8 flex flex-col">
            {[
              {
                n: "01",
                title: "Verified credentials",
                body: "Trainer certifications are reviewed and verified by our team before the badge goes up. No badge, no claim.",
              },
              {
                n: "02",
                title: "Moderated reviews",
                body: "Every review is written by a real client and moderated by a human. No fake stars, no paid placements.",
              },
              {
                n: "03",
                title: "Local and virtual",
                body: "Search by your location for in-person coaching, or widen the net to trainers running virtual sessions nationwide.",
              },
            ].map((item) => (
              <div
                key={item.n}
                className="grid grid-cols-[3rem_1fr] md:grid-cols-[6rem_1fr] gap-4 py-8 border-t border-border first:border-t-0 first:pt-0 last:pb-0"
              >
                <span className="font-heading text-2xl md:text-4xl font-black text-ink-200 leading-none">
                  {item.n}
                </span>
                <div>
                  <h3 className="font-heading text-title uppercase text-ink-950 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted max-w-lg">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Pro CTA — dark, one accent ============ */}
      <section className="section-pad px-4 sm:px-6 lg:px-8 bg-ink-950 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <p className="kicker text-ink-400 mb-4">For fitness professionals</p>
            <h2 className="font-heading text-display uppercase text-balance">
              You train clients.
              <br />
              We&apos;ll fill your roster<span className="text-accent">.</span>
            </h2>
          </div>
          <div className="lg:col-span-4">
            <p className="text-ink-300 mb-8">
              A profile that shows your certifications, collects client
              reviews, and puts you in front of people searching your area.
            </p>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link href={proHref}>
                <Button variant="accent" size="lg" className="w-full">
                  {isPro ? "Go to your dashboard" : "Create your free profile"}
                </Button>
              </Link>
              <Link href="/search?type=PERSONAL_TRAINER">
                <Button
                  size="lg"
                  className="w-full bg-transparent border border-ink-600 text-white hover:bg-ink-800 hover:border-ink-500"
                >
                  See example profiles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Footer ============ */}
      <footer className="bg-ink-950 border-t border-ink-800 text-ink-400 py-12 px-4 sm:px-6 lg:px-8 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-heading font-extrabold uppercase tracking-wide text-white">
            <Dumbbell className="h-5 w-5 text-accent" />
            NextFit
          </div>
          <nav className="flex gap-8 font-heading text-xs font-bold uppercase tracking-wider">
            <Link href="/search" className="hover:text-white transition-colors">
              Browse
            </Link>
            <Link href="/register" className="hover:text-white transition-colors">
              Sign up
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Log in
            </Link>
          </nav>
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} NextFit. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
