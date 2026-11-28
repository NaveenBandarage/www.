const newYorkMonth = new Intl.DateTimeFormat("en-US", {
  month: "numeric",
  timeZone: "America/New_York",
});

const palettes = {
  spring: {
    name: "Spring",
    dark: [0.31, 0.54, 0.16],
    light: [0.85, 0.94, 0.45],
    amount: 0.94,
  },
  summer: {
    name: "Summer",
    dark: [0.39, 0.67, 0.04],
    light: [0.87, 0.98, 0.12],
    amount: 0,
  },
  autumn: {
    name: "Autumn",
    dark: [0.6, 0.2, 0.08],
    light: [1, 0.77, 0.27],
    amount: 1,
  },
  winter: {
    name: "Winter",
    dark: [0.33, 0.46, 0.53],
    light: [0.79, 0.88, 0.91],
    amount: 1,
  },
};

export function memorySeason(asOf = Infinity, now = Date.now()) {
  const date = asOf === Infinity ? now : asOf;
  // Published date-only records are stored at UTC midnight. Keep the same
  // calendar day as the scrubber instead of shifting them back to New York time.
  const month =
    asOf !== Infinity && date % 86_400_000 === 0
      ? new Date(date).getUTCMonth() + 1
      : Number(newYorkMonth.format(date));
  if (month < 3 || month === 12) return palettes.winter;
  if (month < 6) return palettes.spring;
  if (month < 9) return palettes.summer;
  return palettes.autumn;
}
