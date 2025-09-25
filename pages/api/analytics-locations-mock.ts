import type { NextApiRequest, NextApiResponse } from "next";

// Mock data for demonstration purposes
const mockLocations = [
  { country: "US", region: "CA", city: "San Francisco", count: 45 },
  { country: "US", region: "NY", city: "New York", count: 38 },
  { country: "GB", region: "England", city: "London", count: 22 },
  { country: "AU", region: "NSW", city: "Sydney", count: 18 },
  { country: "CA", region: "ON", city: "Toronto", count: 15 },
  { country: "DE", region: "Berlin", city: "Berlin", count: 12 },
  { country: "NL", region: "North Holland", city: "Amsterdam", count: 10 },
  { country: "SG", region: "Singapore", city: "Singapore", count: 8 },
  { country: "JP", region: "Tokyo", city: "Tokyo", count: 7 },
  { country: "FR", region: "Île-de-France", city: "Paris", count: 6 },
  { country: "IN", region: "Maharashtra", city: "Mumbai", count: 5 },
  { country: "BR", region: "São Paulo", city: "São Paulo", count: 4 },
  { country: "ES", region: "Madrid", city: "Madrid", count: 3 },
  { country: "IT", region: "Lazio", city: "Rome", count: 3 },
  { country: "SE", region: "Stockholm", city: "Stockholm", count: 2 },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  // Set cache headers for 5 minutes
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=600",
  );

  return res.status(200).json({
    locations: mockLocations,
    totalEvents: 247,
    lastUpdated: new Date().toISOString(),
  });
}
