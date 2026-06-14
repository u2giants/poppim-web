export function NotesPage() {
  return (
    <div className="h-full overflow-y-auto px-8 py-7">
      <h2 className="font-extrabold" style={{ fontSize: 21, color: '#1B2840', letterSpacing: '-0.02em' }}>
        Notes
      </h2>
      <p className="mt-1 max-w-3xl text-[13.5px] leading-relaxed" style={{ color: '#5A6883' }}>
        Notes will be implemented as project, product, design, buyer-feedback, licensor-response, and factory-context records. A generic mock notebook was removed to avoid creating another disconnected silo.
      </p>
    </div>
  )
}
