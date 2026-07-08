"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { Loader2, MapPin } from "lucide-react";

interface CitySuggestion {
  city: string;
  state: string;
  lat: number;
  lng: number;
  label: string;
}

interface CityAutocompleteProps {
  cityValue: string;
  onCityChange: (city: string) => void;
  onSelect: (result: CitySuggestion) => void;
  placeholder?: string;
  id?: string;
}

export function CityAutocomplete({ cityValue, onCityChange, onSelect, placeholder, id }: CityAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedCity = useDebounce(cityValue, 300);

  useEffect(() => {
    if (debouncedCity.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/geocode/city-search?q=${encodeURIComponent(debouncedCity)}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setSuggestions(json.results ?? []);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedCity]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          id={id}
          value={cityValue}
          onChange={(e) => {
            onCityChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder={placeholder ?? "Start typing a city…"}
          autoComplete="off"
          className="pr-8"
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto">
          {suggestions.map((s, i) => (
            <li key={`${s.label}-${i}`}>
              <button
                type="button"
                onClick={() => {
                  onSelect(s);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-gray-700 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
