import React from "react";

interface CalendarProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  submissions: { [date: string]: number };
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  submissions,
}: CalendarProps) {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // October 2025 calendar data
  const calendarDays = [
    // Week 1 (Sept 28 - Oct 4)
    { date: null, day: null },
    { date: null, day: null },
    { date: null, day: null },
    { date: "2025-10-01", day: 1 },
    { date: "2025-10-02", day: 2 },
    { date: "2025-10-03", day: 3 },
    { date: "2025-10-04", day: 4 },
    // Week 2 (Oct 5-11)
    { date: "2025-10-05", day: 5 },
    { date: "2025-10-06", day: 6 },
    { date: "2025-10-07", day: 7 },
    { date: "2025-10-08", day: 8 },
    { date: "2025-10-09", day: 9 },
    { date: "2025-10-10", day: 10 },
    { date: "2025-10-11", day: 11 },
    // Week 3 (Oct 12-18)
    { date: "2025-10-12", day: 12 },
    { date: "2025-10-13", day: 13 },
    { date: "2025-10-14", day: 14 },
    { date: "2025-10-15", day: 15 },
    { date: "2025-10-16", day: 16 },
    { date: "2025-10-17", day: 17 },
    { date: "2025-10-18", day: 18 },
    // Week 4 (Oct 19-25)
    { date: "2025-10-19", day: 19 },
    { date: "2025-10-20", day: 20 },
    { date: "2025-10-21", day: 21 },
    { date: "2025-10-22", day: 22 },
    { date: "2025-10-23", day: 23 },
    { date: "2025-10-24", day: 24 },
    { date: "2025-10-25", day: 25 },
    // Week 5 (Oct 26 - Nov 1)
    { date: "2025-10-26", day: 26 },
    { date: "2025-10-27", day: 27 },
    { date: "2025-10-28", day: 28 },
    { date: "2025-10-29", day: 29 },
    { date: "2025-10-30", day: 30 },
    { date: "2025-10-31", day: 31 },
    { date: null, day: null },
  ];

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-neutral-800 dark:text-white [font-variation-settings:'wght'_500]">
          October 2025
        </h2>
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

          return (
            <button
              key={item.date}
              onClick={() => onDateSelect(item.date!)}
              className={`
                relative min-h-[80px] rounded-lg border p-2 text-center transition-all
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950"
                    : "border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600"
                }
              `}
            >
              <div className="text-sm font-medium text-neutral-800 dark:text-white">
                {item.day}
              </div>
              {hasSubmissions && (
                <div className="mt-1">
                  <span className="badge">{submissionCount} pending</span>
                </div>
              )}
              {isSelected && (
                <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  Selected!
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
