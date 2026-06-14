export function SchedulePage() {
  return (
    <div className="h-full overflow-y-auto px-8 py-7">
      <h2 className="font-extrabold" style={{ fontSize: 21, color: '#1B2840', letterSpacing: '-0.02em' }}>
        Schedule
      </h2>
      <p className="mt-1 max-w-3xl text-[13.5px] leading-relaxed" style={{ color: '#5A6883' }}>
        The tailored schedule will use real shelf dates, PPS dates, sample deadlines, factory deadlines, buyer follow-ups, and stage SLA due dates. The previous mock calendar has been removed so users do not mistake demo data for live deadlines.
      </p>
    </div>
  )
}
