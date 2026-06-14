export function PeoplePage() {
  return (
    <div className="h-full overflow-y-auto px-8 py-7">
      <h2 className="font-extrabold" style={{ fontSize: 21, color: '#1B2840', letterSpacing: '-0.02em' }}>
        People
      </h2>
      <p className="mt-1 max-w-3xl text-[13.5px] leading-relaxed" style={{ color: '#5A6883' }}>
        The people/workload view will use real Directus users, roles, assignments, and queue ownership. Mock staff cards have been removed from the application.
      </p>
    </div>
  )
}
