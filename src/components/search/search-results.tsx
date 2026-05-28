"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Shield, Wifi, SlidersHorizontal, X, LocateFixed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SPECIALTIES, PROFILE_TYPES } from "@/lib/constants";
import { formatRating } from "@/lib/utils";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

interface SearchResult {
  id: string;
  kind: "trainer" | "gym";
  name: string;
  slug: string;
  photoUrl: string | null;
  city: string | null;
  state: string | null;
  profileType: string | null;
  topSpecialty: string | null;
  averageRating: number | null;
  reviewCount: number;
  isVerified: boolean;
  virtualAvailable: boolean;
}

interface FilterPanelProps {
  hasCoords: boolean;
  cityParam: string;
  stateParam: string;
  locating: boolean;
  cityInput: string;
  setCityInput: (v: string) => void;
  clearLocation: () => void;
  handleNearMe: () => void;
  handleCitySearch: (e: React.FormEvent) => void;
  type: string;
  specialty: string;
  minRating: string;
  availability: string;
  verified: string;
  updateFilter: (key: string, value: string) => void;
}

function FilterPanel({
  hasCoords, cityParam, stateParam, locating, cityInput, setCityInput,
  clearLocation, handleNearMe, handleCitySearch, type, specialty,
  minRating, availability, verified, updateFilter,
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      {/* Location */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Location</h3>
        <div className="space-y-2">
          {(hasCoords || cityParam || stateParam) && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 rounded-lg px-2.5 py-1.5">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">
                {hasCoords ? "Near your location" : [cityParam, stateParam].filter(Boolean).join(", ")}
              </span>
              <button onClick={clearLocation} className="ml-auto hover:text-red-500">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={handleNearMe}
            disabled={locating}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
            {locating ? "Getting location…" : "Near me"}
          </button>
          <form onSubmit={handleCitySearch} className="flex gap-1.5">
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="City (e.g. Austin)"
              className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition-colors"
            >
              Go
            </button>
          </form>
          <select
            value={stateParam}
            onChange={(e) => updateFilter("state", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Any state</option>
            {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Type</h3>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" name="type" value="" checked={!type} onChange={() => updateFilter("type", "")} />
            All
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" name="type" value="GYM" checked={type === "GYM"} onChange={() => updateFilter("type", "GYM")} />
            Gyms & Studios
          </label>
          {PROFILE_TYPES.map((pt) => (
            <label key={pt.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="type" value={pt.value} checked={type === pt.value} onChange={() => updateFilter("type", pt.value)} />
              {pt.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Specialty</h3>
        <select
          value={specialty}
          onChange={(e) => updateFilter("specialty", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Any specialty</option>
          {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Minimum rating</h3>
        <div className="space-y-1.5">
          {[["", "Any"], ["3", "3+ stars"], ["4", "4+ stars"], ["4.5", "4.5+ stars"]].map(([val, label]) => (
            <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="minRating" value={val} checked={minRating === val} onChange={() => updateFilter("minRating", val)} />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Availability</h3>
        <div className="space-y-1.5">
          {[["", "Any"], ["In-Person", "In-Person"], ["Virtual", "Virtual"]].map(([val, label]) => (
            <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="availability" value={val} checked={availability === val} onChange={() => updateFilter("availability", val)} />
              {label}
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={verified === "1"}
          onChange={(e) => updateFilter("verified", e.target.checked ? "1" : "")}
        />
        <span className="font-medium">Verified only</span>
      </label>
    </div>
  );
}

export function SearchResults() {
  const router = useRouter();
  const sp = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [cityInput, setCityInput] = useState("");

  const q = sp.get("q") ?? "";
  const type = sp.get("type") ?? "";
  const specialty = sp.get("specialty") ?? "";
  const minRating = sp.get("minRating") ?? "";
  const availability = sp.get("availability") ?? "";
  const sort = sp.get("sort") ?? "rating";
  const verified = sp.get("verified") ?? "";
  const cityParam = sp.get("city") ?? "";
  const stateParam = sp.get("state") ?? "";
  const hasCoords = !!(sp.get("lat") && sp.get("lng"));

  const fetchResults = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    if (specialty) params.set("specialty", specialty);
    if (minRating) params.set("minRating", minRating);
    if (availability) params.set("availability", availability);
    if (sort) params.set("sort", sort);
    if (verified) params.set("verified", verified);

    const lat = sp.get("lat");
    const lng = sp.get("lng");
    if (lat) params.set("lat", lat);
    if (lng) params.set("lng", lng);
    if (cityParam) params.set("city", cityParam);
    if (stateParam) params.set("state", stateParam);

    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } finally {
      setLoading(false);
    }
  }, [q, type, specialty, minRating, availability, sort, verified, cityParam, stateParam, sp]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/search?${params.toString()}`);
  }

  function handleCitySearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(sp.toString());
    params.delete("lat");
    params.delete("lng");
    if (cityInput.trim()) {
      params.set("city", cityInput.trim());
    } else {
      params.delete("city");
    }
    router.push(`/search?${params.toString()}`);
  }

  function clearLocation() {
    const params = new URLSearchParams(sp.toString());
    params.delete("lat");
    params.delete("lng");
    params.delete("city");
    params.delete("state");
    setCityInput("");
    router.push(`/search?${params.toString()}`);
  }

  function handleNearMe() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const params = new URLSearchParams(sp.toString());
        params.set("lat", pos.coords.latitude.toString());
        params.set("lng", pos.coords.longitude.toString());
        params.delete("city");
        router.push(`/search?${params.toString()}`);
        setLocating(false);
      },
      () => setLocating(false)
    );
  }

  const filterPanelProps: FilterPanelProps = {
    hasCoords, cityParam, stateParam, locating, cityInput, setCityInput,
    clearLocation, handleNearMe, handleCitySearch, type, specialty,
    minRating, availability, verified, updateFilter,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {q ? `Results for "${q}"` : "Browse all listings"}
          </h1>
          {!loading && (
            <p className="text-sm text-gray-500">{results.length} results</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="rating">Top Rated</option>
            <option value="reviews">Most Reviewed</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4 mr-1" />
            Filters
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <FilterPanel {...filterPanelProps} />
          </div>
        </aside>

        {/* Mobile filter drawer */}
        {filtersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-72 bg-white p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Filters</h2>
                <button onClick={() => setFiltersOpen(false)}><X className="h-5 w-5" /></button>
              </div>
              <FilterPanel {...filterPanelProps} />
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 h-40 animate-pulse" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🔍</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">No results found</h2>
              <p className="text-gray-500 text-sm">Try adjusting your filters or searching in a different area.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.map((result) => (
                <ResultCard key={result.id} result={result} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: SearchResult }) {
  const href = result.kind === "trainer" ? `/trainer/${result.slug}` : `/gym/${result.slug}`;
  const profileLabel = result.kind === "gym"
    ? "Gym"
    : PROFILE_TYPES.find((p) => p.value === result.profileType)?.label ?? "Fitness Pro";

  return (
    <Link href={href} className="group">
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all flex gap-4">
        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
          {result.photoUrl ? (
            <Image src={result.photoUrl} alt={result.name} fill className="object-cover" sizes="64px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">
              {result.kind === "gym" ? "🏋️" : "💪"}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate group-hover:text-emerald-700">
              {result.name}
            </h3>
            {result.isVerified && (
              <Shield className="h-4 w-4 text-blue-500 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <Badge variant="secondary" className="text-xs">{profileLabel}</Badge>
            {result.topSpecialty && (
              <Badge variant="outline" className="text-xs">{result.topSpecialty}</Badge>
            )}
            {result.virtualAvailable && (
              <Badge variant="default" className="text-xs">
                <Wifi className="h-3 w-3" />
                Virtual
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            {result.averageRating ? (
              <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                <Star className="h-3.5 w-3.5 fill-current" />
                {formatRating(result.averageRating)}
                <span className="text-gray-400 font-normal">({result.reviewCount})</span>
              </span>
            ) : (
              <span className="text-gray-400">No reviews yet</span>
            )}
            {(result.city || result.state) && (
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {[result.city, result.state].filter(Boolean).join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
