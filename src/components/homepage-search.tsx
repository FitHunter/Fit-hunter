"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomepageSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    router.push(`/search?${params.toString()}`);
  }

  function handleNearMe() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const params = new URLSearchParams({
          lat: pos.coords.latitude.toString(),
          lng: pos.coords.longitude.toString(),
        });
        router.push(`/search?${params.toString()}`);
      },
      () => setLocating(false)
    );
  }

  return (
    <div className="flex flex-col gap-3 max-w-2xl mx-auto w-full">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search trainers, gyms, or specialties..."
            className="w-full h-12 pl-10 pr-4 rounded-xl border-0 text-gray-900 shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400 text-base"
          />
        </div>
        <Button type="submit" size="lg" className="bg-emerald-500 hover:bg-emerald-400 h-12 px-6 text-base">
          Search
        </Button>
      </form>
      <button
        type="button"
        onClick={handleNearMe}
        disabled={locating}
        className="flex items-center justify-center gap-2 text-emerald-100 hover:text-white text-sm font-medium transition-colors disabled:opacity-50"
      >
        <MapPin className="h-4 w-4" />
        {locating ? "Getting your location..." : "Use my location"}
      </button>
    </div>
  );
}
