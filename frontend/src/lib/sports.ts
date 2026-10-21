export type SportKey = "cricket" | "high-jump";

export const sports = [
  {
    key: "cricket",
    name: "Cricket",
    category: "TEAM SPORT",
    type: "team",
    description: "Manage cricket tournaments, teams, players, matches and results.",
    image: "/images/cricket-card.webp",
    icon: "🏏",
    route: "/sports/cricket",
  },
  {
    key: "high-jump",
    name: "High Jump",
    category: "INDIVIDUAL EVENT",
    type: "individual",
    description: "Manage high jump competitions, athletes, attempts and results.",
    image: "/images/high-jump-card.webp",
    icon: "↗",
    route: "/sports/high-jump",
  },
] as const;

export function isSportKey(value: string): value is SportKey {
  return sports.some((sport) => sport.key === value);
}

export function getSport(value: string) {
  return sports.find((sport) => sport.key === value);
}
