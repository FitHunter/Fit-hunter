import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

const UA = "NextFit/1.0 (nextfit.app)";

const STATE_NAME_TO_ABBR: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA",
  hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA",
  kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
  massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS",
  missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV",
  "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
  "north carolina": "NC", "north dakota": "ND", ohio: "OH", oklahoma: "OK",
  oregon: "OR", pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
  virginia: "VA", washington: "WA", "west virginia": "WV", wisconsin: "WI",
  wyoming: "WY", "district of columbia": "DC",
};

interface NominatimResult {
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    state?: string;
  };
}

export async function GET(req: NextRequest) {
  const limited = await enforceRateLimit("public", getClientIp(req));
  if (limited) return limited;

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const params = new URLSearchParams({
      q,
      format: "json",
      addressdetails: "1",
      countrycodes: "us",
      limit: "5",
    });
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { "User-Agent": UA },
      next: { revalidate: 86400 },
    });
    const data: NominatimResult[] = await res.json();

    const seen = new Set<string>();
    const results = [];
    for (const item of Array.isArray(data) ? data : []) {
      const city = item.address?.city ?? item.address?.town ?? item.address?.village ?? item.address?.hamlet;
      const stateName = item.address?.state;
      if (!city || !stateName) continue;

      const state = STATE_NAME_TO_ABBR[stateName.toLowerCase()] ?? stateName;
      const key = `${city}, ${state}`;
      if (seen.has(key)) continue;
      seen.add(key);

      results.push({
        city,
        state,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        label: key,
      });
    }

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
