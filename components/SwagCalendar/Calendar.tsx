import React, { useState } from "react";

interface Submission {
  date: string;
  companyName: string;
  companyEmail: string;
  swagDescription: string;
  submittedAt: string;
}

interface CalendarProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  submissions: { [date: string]: number };
  submissionDetails?: { [date: string]: Submission[] };
}

// Helper function to generate calendar days for a given month/year
function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

  const days: Array<{
    date: string | null;
    day: number | null;
    isPast: boolean;
  }> = [];

  // Add empty cells for days before the month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push({ date: null, day: null, isPast: false });
  }

  // Add days of the month
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isPast = date < today;
    days.push({ date: dateStr, day, isPast });
  }

  return days;
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  submissions,
  submissionDetails = {},
}: CalendarProps) {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const calendarDays = generateCalendarDays(currentYear, currentMonth);

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Check if we can go back (don't allow going before current month)
  const canGoBack =
    currentYear > now.getFullYear() ||
    (currentYear === now.getFullYear() && currentMonth > now.getMonth());

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-neutral-800 dark:text-white [font-variation-settings:'wght'_500]">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={goToPreviousMonth}
            disabled={!canGoBack}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-neutral-800 dark:hover:bg-neutral-800"
            aria-label="Previous month"
          >
            ←
          </button>
          <button
            onClick={goToNextMonth}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-800"
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-xs font-medium text-neutral-500 dark:text-silver-dark"
          >
            {day}
          </div>
        ))}

        {calendarDays.map((item, index) => {
          if (!item.date) {
            return <div key={`empty-${index}`} className="p-2" />;
          }

          const isSelected = selectedDate === item.date;
          const submissionCount = submissions[item.date] || 0;
          const hasSubmissions = submissionCount > 0;
          const isPast = item.isPast;
          const dateSubmissions = submissionDetails[item.date] || [];
          const isHovered = hoveredDate === item.date;

          return (
            <div key={item.date} className="relative">
              <button
                onClick={() => !isPast && onDateSelect(item.date!)}
                onMouseEnter={() => setHoveredDate(item.date!)}
                onMouseLeave={() => setHoveredDate(null)}
                disabled={isPast}
                className={`
                  relative w-full min-h-[80px] rounded-lg border p-2 text-center transition-all
                  ${
                    isPast
                      ? "cursor-not-allowed border-neutral-100 bg-neutral-50 text-neutral-300 dark:border-neutral-900 dark:bg-neutral-950 dark:text-neutral-700"
                      : isSelected
                        ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950"
                        : "border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600"
                  }
                `}
              >
                <div
                  className={`text-sm font-medium ${isPast ? "" : "text-neutral-800 dark:text-white"}`}
                >
                  {item.day}
                </div>
                {hasSubmissions && !isPast && (
                  <div className="mt-1">
                    <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      {submissionCount} submitted
                    </span>
                  </div>
                )}
                {isSelected && !isPast && (
                  <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                    Selected!
                  </div>
                )}
                {isPast && <div className="mt-1 text-xs">Past</div>}
              </button>

              {/* Popup showing submission details */}
              {isHovered && hasSubmissions && dateSubmissions.length > 0 && (
                <div className="absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 transform">
                  {/* Arrow pointer */}
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full">
                    <div className="h-0 w-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-neutral-200 dark:border-b-neutral-700"></div>
                    <div className="absolute left-1/2 top-0.5 -translate-x-1/2">
                      <div className="h-0 w-0 border-l-[7px] border-r-[7px] border-b-[7px] border-l-transparent border-r-transparent border-b-white dark:border-b-neutral-800"></div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-xs font-medium text-neutral-500 dark:text-silver-dark">
                        {item.date}
                      </div>
                      <div className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        {dateSubmissions.length}{" "}
                        {dateSubmissions.length === 1
                          ? "submission"
                          : "submissions"}
                      </div>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {dateSubmissions.map((submission, idx) => (
                        <div
                          key={idx}
                          className="rounded-md border-l-2 border-green-500 bg-neutral-50 p-2 dark:bg-neutral-900/50"
                        >
                          <div className="text-sm font-medium text-neutral-800 dark:text-white [font-variation-settings:'wght'_500]">
                            {submission.companyName}
                          </div>
                          <div className="mt-1 text-xs text-neutral-600 dark:text-silver-dark line-clamp-2">
                            {submission.swagDescription}
                          </div>
                          <div className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                            📅{" "}
                            {new Date(
                              submission.submittedAt,
                            ).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(
                              submission.submittedAt,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
