import Link from "next/link";
import { MapPin, Star, Shield, Dumbbell, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomepageSearch } from "@/components/homepage-search";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            Find the Right Trainer or Gym — Verified by Real People
          </h1>
          <p className="text-emerald-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
            Browse certified personal trainers, fitness coaches, and gyms near you. Read honest reviews and connect directly.
          </p>
          <HomepageSearch />
        </div>
      </section>

      {/* 3 CTAs */}
      <section className="bg-white py-12 px-4 border-b border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/search?type=PERSONAL_TRAINER"
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all text-center"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <Dumbbell className="h-6 w-6 text-emerald-700" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Find a Trainer</h2>
              <p className="text-sm text-gray-500 mt-1">Certified professionals near you</p>
            </div>
          </Link>

          <Link
            href="/search?type=GYM"
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all text-center"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <Building2 className="h-6 w-6 text-emerald-700" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Find a Gym</h2>
              <p className="text-sm text-gray-500 mt-1">Studios and gyms with real reviews</p>
            </div>
          </Link>

          <Link
            href="/register?type=TRAINER"
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all text-center"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <Users className="h-6 w-6 text-emerald-700" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">I&apos;m a Fitness Pro</h2>
              <p className="text-sm text-gray-500 mt-1">Build your profile, get discovered</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Value props */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Why FitHunter?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center gap-3">
              <Shield className="h-8 w-8 text-emerald-600" />
              <h3 className="font-semibold text-gray-900">Verified Credentials</h3>
              <p className="text-sm text-gray-500">Trainer certifications reviewed and verified by our team so you know you&apos;re in good hands.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <Star className="h-8 w-8 text-emerald-600" />
              <h3 className="font-semibold text-gray-900">Real Reviews</h3>
              <p className="text-sm text-gray-500">Every review is moderated and written by real clients — no fake stars, no paid promotions.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <MapPin className="h-8 w-8 text-emerald-600" />
              <h3 className="font-semibold text-gray-900">Local & Virtual</h3>
              <p className="text-sm text-gray-500">Search near your location or find trainers who offer virtual sessions nationwide.</p>
            </div>
          </div>
        </div>
      </section>

      {/* For professionals CTA */}
      <section className="bg-emerald-700 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">Are you a fitness professional?</h2>
          <p className="text-emerald-100 mb-8">
            Build a profile that showcases your certifications, collects client reviews, and gets you discovered by people in your area.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 w-full sm:w-auto">
                Create your free profile
              </Button>
            </Link>
            <Link href="/search?type=PERSONAL_TRAINER">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-emerald-800 w-full sm:w-auto">
                See example profiles
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4 text-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Dumbbell className="h-5 w-5 text-emerald-400" />
            FitHunter
          </div>
          <div className="flex gap-6">
            <Link href="/search" className="hover:text-white">Browse</Link>
            <Link href="/register" className="hover:text-white">Sign up</Link>
            <Link href="/login" className="hover:text-white">Log in</Link>
          </div>
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} FitHunter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
