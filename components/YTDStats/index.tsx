import React, { useEffect, useState } from "react";
import { FadeInText } from "../TextAnimation";

interface YTDStatsData {
  totalViews: number;
  uniqueCountries: number;
  uniqueCities: number;
  topPages: { path: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  viewsByMonth: { month: string; count: number }[];
  deviceBreakdown: { mobile: number; desktop: number; tablet: number };
  lastUpdated: string;
}

export default function YTDStats() {
  const [data, setData] = useState<YTDStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchYTDStats = async () => {
      try {
        const response = await fetch("/api/analytics-ytd");
        if (!response.ok) {
          throw new Error("Failed to fetch YTD stats");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchYTDStats();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
        <FadeInText delay={0}>
          <h3 className="mb-4 text-lg font-semibold text-neutral-800 dark:text-white">
            📊 Year-to-Date Stats
          </h3>
        </FadeInText>
        <div className="flex items-center justify-center py-8">
          <div className="text-neutral-500 dark:text-neutral-400">
            Loading stats...
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
            📊 Year-to-Date Stats
          </h3>
        </FadeInText>
        <div className="flex items-center justify-center py-8">
          <div className="text-neutral-500 dark:text-neutral-400">
            {error || "No data available yet"}
          </div>
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const totalDevices =
    data.deviceBreakdown.mobile +
    data.deviceBreakdown.desktop +
    data.deviceBreakdown.tablet;

  const getDevicePercentage = (count: number) => {
    return totalDevices > 0 ? ((count / totalDevices) * 100).toFixed(1) : "0";
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
      <FadeInText delay={0}>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-white">
            📊 Year-to-Date Stats {currentYear}
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Website analytics from January 1st to today
          </p>
        </div>
      </FadeInText>

      {/* Key Metrics Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <FadeInText delay={200}>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-600 dark:bg-neutral-700">
            <div className="text-2xl font-bold text-neutral-800 dark:text-white">
              {data.totalViews.toLocaleString()}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Total Views
            </div>
          </div>
        </FadeInText>

        <FadeInText delay={300}>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-600 dark:bg-neutral-700">
            <div className="text-2xl font-bold text-neutral-800 dark:text-white">
              {data.uniqueCountries}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Countries
            </div>
          </div>
        </FadeInText>

        <FadeInText delay={400}>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-600 dark:bg-neutral-700">
            <div className="text-2xl font-bold text-neutral-800 dark:text-white">
              {data.uniqueCities}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Cities
            </div>
          </div>
        </FadeInText>

        <FadeInText delay={500}>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-600 dark:bg-neutral-700">
            <div className="text-2xl font-bold text-neutral-800 dark:text-white">
              {data.viewsByMonth.length}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Active Months
            </div>
          </div>
        </FadeInText>
      </div>

      {/* Device Breakdown */}
      {totalDevices > 0 && (
        <FadeInText delay={600}>
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              📱 Device Breakdown
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">
                  🖥️ Desktop
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-600">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${getDevicePercentage(data.deviceBreakdown.desktop)}%`,
                      }}
                    />
                  </div>
                  <span className="w-12 text-right text-neutral-700 dark:text-neutral-300">
                    {getDevicePercentage(data.deviceBreakdown.desktop)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">
                  📱 Mobile
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-600">
                    <div
                      className="h-full bg-green-500"
                      style={{
                        width: `${getDevicePercentage(data.deviceBreakdown.mobile)}%`,
                      }}
                    />
                  </div>
                  <span className="w-12 text-right text-neutral-700 dark:text-neutral-300">
                    {getDevicePercentage(data.deviceBreakdown.mobile)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">
                  📲 Tablet
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-600">
                    <div
                      className="h-full bg-purple-500"
                      style={{
                        width: `${getDevicePercentage(data.deviceBreakdown.tablet)}%`,
                      }}
                    />
                  </div>
                  <span className="w-12 text-right text-neutral-700 dark:text-neutral-300">
                    {getDevicePercentage(data.deviceBreakdown.tablet)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </FadeInText>
      )}

      {/* Top Pages and Referrers */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Top Pages */}
        {data.topPages.length > 0 && (
          <FadeInText delay={700}>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                📄 Top Pages
              </h4>
              <div className="space-y-2">
                {data.topPages.map((page, index) => (
                  <div
                    key={page.path}
                    className="flex items-center justify-between rounded-md border border-neutral-200 bg-white p-2 text-xs dark:border-neutral-600 dark:bg-neutral-700"
                  >
                    <span className="truncate text-neutral-600 dark:text-neutral-400">
                      {index + 1}. {page.path || "/"}
                    </span>
                    <span className="ml-2 font-medium text-neutral-800 dark:text-white">
                      {page.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeInText>
        )}

        {/* Top Referrers */}
        {data.topReferrers.length > 0 && (
          <FadeInText delay={800}>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                🔗 Top Referrers
              </h4>
              <div className="space-y-2">
                {data.topReferrers.map((referrer, index) => (
                  <div
                    key={referrer.referrer}
                    className="flex items-center justify-between rounded-md border border-neutral-200 bg-white p-2 text-xs dark:border-neutral-600 dark:bg-neutral-700"
                  >
                    <span className="truncate text-neutral-600 dark:text-neutral-400">
                      {index + 1}. {referrer.referrer}
                    </span>
                    <span className="ml-2 font-medium text-neutral-800 dark:text-white">
                      {referrer.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeInText>
        )}
      </div>

      {/* Views by Month */}
      {data.viewsByMonth.length > 0 && (
        <FadeInText delay={900}>
          <div className="mt-6">
            <h4 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              📈 Monthly Trends
            </h4>
            <div className="space-y-2">
              {data.viewsByMonth.map((month) => {
                const maxViews = Math.max(
                  ...data.viewsByMonth.map((m) => m.count),
                );
                const percentage = (month.count / maxViews) * 100;

                return (
                  <div
                    key={month.month}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="w-20 text-neutral-600 dark:text-neutral-400">
                      {month.month}
                    </span>
                    <div className="flex-1">
                      <div className="h-6 overflow-hidden rounded-md bg-neutral-200 dark:bg-neutral-600">
                        <div
                          className="flex h-full items-center justify-end bg-gradient-to-r from-blue-400 to-blue-600 px-2 text-xs font-medium text-white transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        >
                          {month.count}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeInText>
      )}

      {/* Last Updated */}
      <FadeInText delay={1000}>
        <div className="mt-6 border-t border-neutral-200 pt-4 text-xs text-neutral-500 dark:border-neutral-600 dark:text-neutral-400">
          Last updated: {new Date(data.lastUpdated).toLocaleString()}
        </div>
      </FadeInText>
    </div>
  );
}

