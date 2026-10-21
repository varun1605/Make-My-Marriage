const paths = {
  arrow: "M4 12h16m-6-6 6 6-6 6",
  check: "m6 12 4 4 8-8",
  chevron: "m9 5 7 7-7 7",
  calendar: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2ZM8 14h2m4 0h2m-8 3h2",
  people: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-7.87a4 4 0 0 1 0 7.75",
  heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  tasks: "m3 6 1.5 1.5L7 5m-4 7 1.5 1.5L7 11m-4 7 1.5 1.5L7 17M11 6h10m-10 6h10m-10 6h10",
  vendor: "M3 10h18L19 3H5l-2 7Zm1 0v11h16V10M9 21v-7h6v7M3 10a3 3 0 0 0 4.5 2.6 3 3 0 0 0 4.5 0 3 3 0 0 0 4.5 0A3 3 0 0 0 21 10",
  rupee: "M5 4h14M5 9h14M7 4c9 0 9 9 0 9H5l10 8",
  photos: "M4 3h16v18H4V3Zm0 13 5-5 4 4 3-3 4 4M15 7h.01",
  mail: "M3 5h18v14H3V5Zm0 0 9 8 9-8",
  lock: "M5 10h14v11H5V10Zm3 0V6a4 4 0 0 1 8 0v4m-4 5v2",
  flower: "M12 12c-8-1-8-10-3-10 3 0 3 6 3 10Zm0 0c1-8 10-8 10-3 0 3-6 3-10 3Zm0 0c8 1 8 10 3 10-3 0-3-6-3-10Zm0 0C11 20 2 20 2 15c0-3 6-3 10-3Z",
  globe: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z",
  play: "m9 5 11 7-11 7V5Z",
  qr: "M3 3h6v6H3V3Zm12 0h6v6h-6V3ZM3 15h6v6H3v-6Zm12 0h2v2h-2v-2Zm6-2v4m-8 4h4m4-1v1",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "m6 6 12 12M6 18 18 6",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}
