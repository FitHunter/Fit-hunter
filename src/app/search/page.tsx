import { Suspense } from "react";
import { SearchResults } from "@/components/search/search-results";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Trainers & Gyms",
  description: "Browse and filter certified personal trainers, fitness coaches, and gyms near you.",
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
