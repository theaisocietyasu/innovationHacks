export const TRACKS = ["Anton RX", "Google", "Amazon", "Statefarm"] as const;
export type Track = (typeof TRACKS)[number];
