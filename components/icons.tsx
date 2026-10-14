export function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const paths: Record<string, string> = {
    home: "M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
    lab: "M9 3h6M10 3v6L4 19a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2L14 9V3M7 15h10",
    learn:
      "M3 4h6a4 4 0 0 1 3 2 4 4 0 0 1 3-2h6v15h-6a4 4 0 0 0-3 2 4 4 0 0 0-3-2H3Z M12 6v15",
    library: "M5 3h14v18l-7-4-7 4Z",
    settings: "M4 7h16M4 17h16M8 4v6M16 14v6",
    privacy: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z M9 12l2 2 4-4",
    arrow: "M4 12h16m-6-6 6 6-6 6",
    leaf: "M20 3C10 3 3 8 5 16c7 4 15-3 15-13ZM4 21 15 10",
    check: "m5 12 4 4L19 6",
    plus: "M12 5v14M5 12h14",
    sun: "M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 1.4 1.4M17 17l1.4 1.4M5.6 18.4 1.4-1.4M17 7l1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
    wifi: "M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0M9 16a5 5 0 0 1 6 0M12 20h.01",
    heart: "M12 20S2 14 2 8a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 6-10 12-10 12Z",
    volume: "M4 9h4l5-4v14l-5-4H4ZM17 8a6 6 0 0 1 0 8",
    close: "m6 6 12 12M6 18 18 6",
    clock: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
    spark: "m12 3 2 7 7 2-7 2-2 7-2-7-7-2 7-2Z",
    download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] ?? paths.spark} />
    </svg>
  );
}
