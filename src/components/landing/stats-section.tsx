export function StatsSection() {
  const stats = [
    { value: "50K+", label: "Radio Stations" },
    { value: "200+", label: "Countries" },
    { value: "1M+", label: "Active Users" },
  ];

  return (
    <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto pt-12 px-6">
      {stats.map((stat, index) => (
        <div key={index} className="space-y-1 text-center">
          <div className="text-3xl sm:text-4xl font-semibold tracking-tight">
            {stat.value}
          </div>
          <div className="text-xs text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

