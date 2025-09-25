import React, { useEffect, useState } from "react";
import { FadeInText } from "../TextAnimation";

interface LocationData {
  country: string;
  region: string;
  city: string;
  count: number;
}

interface AnalyticsData {
  locations: LocationData[];
  totalEvents: number;
  lastUpdated: string;
}

// Country code to emoji flag mapping for visual appeal
const getCountryFlag = (countryCode: string): string => {
  const flags: { [key: string]: string } = {
    US: "🇺🇸",
    CA: "🇨🇦",
    GB: "🇬🇧",
    AU: "🇦🇺",
    DE: "🇩🇪",
    FR: "🇫🇷",
    JP: "🇯🇵",
    IN: "🇮🇳",
    BR: "🇧🇷",
    CN: "🇨🇳",
    NL: "🇳🇱",
    SE: "🇸🇪",
    NO: "🇳🇴",
    ES: "🇪🇸",
    IT: "🇮🇹",
    MX: "🇲🇽",
    AR: "🇦🇷",
    CL: "🇨🇱",
    NZ: "🇳🇿",
    SG: "🇸🇬",
    KR: "🇰🇷",
    TH: "🇹🇭",
    VN: "🇻🇳",
    ID: "🇮🇩",
    MY: "🇲🇾",
    PH: "🇵🇭",
    TW: "🇹🇼",
    HK: "🇭🇰",
    ZA: "🇿🇦",
    NG: "🇳🇬",
    EG: "🇪🇬",
    IL: "🇮🇱",
    AE: "🇦🇪",
    SA: "🇸🇦",
    TR: "🇹🇷",
    RU: "🇷🇺",
    UA: "🇺🇦",
    PL: "🇵🇱",
    CZ: "🇨🇿",
    AT: "🇦🇹",
    CH: "🇨🇭",
    BE: "🇧🇪",
    DK: "🇩🇰",
    FI: "🇫🇮",
    PT: "🇵🇹",
    GR: "🇬🇷",
    IE: "🇮🇪",
    IS: "🇮🇸",
  };
  return flags[countryCode] || "🌍";
};

// Get a fun color based on visit count
const getLocationColor = (count: number, maxCount: number): string => {
  const intensity = count / maxCount;
  if (intensity > 0.7) return "text-red-500 dark:text-red-400";
  if (intensity > 0.4) return "text-orange-500 dark:text-orange-400";
  if (intensity > 0.2) return "text-yellow-500 dark:text-yellow-400";
  return "text-green-500 dark:text-green-400";
};

const getLocationSize = (count: number, maxCount: number): string => {
  const intensity = count / maxCount;
  if (intensity > 0.7) return "text-lg font-bold";
  if (intensity > 0.4) return "text-base font-semibold";
  if (intensity > 0.2) return "text-sm font-medium";
  return "text-xs";
};

export default function WorldMap() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        // Try real analytics first, fall back to mock for demonstration in fun page
        let response = await fetch("/api/analytics-locations");
        if (!response.ok) {
          throw new Error("Failed to fetch location data");
        }
        let result = await response.json();

        // If no locations, use mock data for demonstration
        if (result.locations.length === 0) {
          response = await fetch("/api/analytics-locations-mock");
          if (response.ok) {
            result = await response.json();
          }
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
        <FadeInText delay={0}>
          <h3 className="mb-4 text-lg font-semibold text-neutral-800 dark:text-white">
            🌍 Visitor Locations
          </h3>
        </FadeInText>
        <div className="flex items-center justify-center py-8">
          <div className="text-neutral-500 dark:text-neutral-400">
            Loading visitor data...
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
        <FadeInText delay={0}>
          <h3 className="mb-4 text-lg font-semibold text-neutral-800 dark:text-white">
            🌍 Visitor Locations
          </h3>
        </FadeInText>
        <div className="flex items-center justify-center py-8">
          <div className="text-neutral-500 dark:text-neutral-400">
            {error || "No location data available yet"}
          </div>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.locations.map((loc) => loc.count));
  const totalVisitors = data.locations.reduce((sum, loc) => sum + loc.count, 0);

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
      <FadeInText delay={0}>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-white">
            🌍 Visitor Locations
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {totalVisitors} visitors from {data.locations.length} unique
            locations
          </p>
        </div>
      </FadeInText>

      {data.locations.length === 0 ? (
        <FadeInText delay={300}>
          <div className="py-8 text-center">
            <div className="text-neutral-500 dark:text-neutral-400">
              No visitors yet - be the first! 👋
            </div>
          </div>
        </FadeInText>
      ) : (
        <div className="space-y-4">
          <FadeInText delay={300}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.locations.slice(0, 12).map((location, index) => (
                <div
                  key={`${location.country}-${location.region}-${location.city}`}
                  className={`flex items-center justify-between rounded-md border border-neutral-200 bg-white p-3 transition-all duration-200 hover:shadow-sm dark:border-neutral-600 dark:bg-neutral-700 ${getLocationColor(location.count, maxCount)}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className="text-lg"
                      role="img"
                      aria-label={`${location.country} flag`}
                    >
                      {getCountryFlag(location.country)}
                    </span>
                    <div>
                      <div
                        className={`${getLocationSize(location.count, maxCount)} text-neutral-800 dark:text-white`}
                      >
                        {location.city}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {location.region}, {location.country}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`${getLocationSize(location.count, maxCount)} ${getLocationColor(location.count, maxCount)}`}
                  >
                    {location.count}
                  </div>
                </div>
              ))}
            </div>
          </FadeInText>

          {data.locations.length > 12 && (
            <FadeInText delay={600}>
              <div className="mt-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                And {data.locations.length - 12} more locations...
              </div>
            </FadeInText>
          )}

          <FadeInText delay={800}>
            <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-600">
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span>
                  Last updated: {new Date(data.lastUpdated).toLocaleString()}
                </span>
                <span>{data.totalEvents} total page views</span>
              </div>
            </div>
          </FadeInText>
        </div>
      )}
    </div>
  );
}
