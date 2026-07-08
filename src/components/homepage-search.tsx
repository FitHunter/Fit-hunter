"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomepageSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    router.push(`/search?${params.toString()}`);
  }

  function handleNearMe() {
    setGeoError(null);
    if (!("geolocation" in navigator)) {
      setGeoError("Location isn't supported by this browser — try searching by city instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const params = new URLSearchParams({
          lat: pos.coords.latitude.toString(),
          lng: pos.coords.longitude.toString(),
        });
        router.push(`/search?${params.toString()}`);
      },
      (err) => {
        setLocating(false);
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Location access was denied — allow it in your browser, or search by city instead."
            : "We couldn't get your location — try again, or search by city instead."
        );
      },
      { timeout: 10000 }
    );
  }

  return (
    <div className="flex flex-col gap-3 max-w-2xl w-full">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Trainer, gym, or specialty..."
            className="w-full h-14 pl-12 pr-4 rounded-control border-0 bg-white text-ink-950 placeholder:text-ink-400 text-base focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <Button type="submit" variant="accent" size="lg" className="h-14 px-8">
          Search
        </Button>
      </form>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleNearMe}
          disabled={locating}
          className="self-start inline-flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-ink-200 hover:text-white transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-control px-1 py-1"
        >
          <MapPin className="h-4 w-4" />
          {locating ? "Getting your location..." : "Use my location"}
        </button>
        {geoError && (
          <p role="alert" className="inline-flex items-start gap-2 text-sm text-ink-200 bg-ink-900/80 border border-ink-700 rounded-control px-3 py-2 max-w-md">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
            {geoError}
          </p>
        )}
      </div>
    </div>
  );
}
