import { PEOPLE } from '@/lib/mockData'

export function PeoplePage() {
  return (
    <div className="h-full overflow-y-auto px-8 py-7">
      {/* Header */}
      <div className="mb-7">
        <h2
          className="font-extrabold"
          style={{ fontSize: 21, color: '#1B2840', letterSpacing: '-0.02em' }}
        >
          People
        </h2>
        <p className="mt-1 text-[13.5px]" style={{ color: '#5A6883' }}>
          Everyone in the POP Creations workspace · {PEOPLE.length} members.
        </p>
      </div>

      {/* Grid */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(264px, 1fr))' }}
      >
        {PEOPLE.map((person) => (
          <div
            key={person.id}
            className="rounded-xl p-5 transition-all"
            style={{
              border: '1px solid #EAEEF5',
              background: '#fff',
              boxShadow: '0 1px 3px rgba(20,40,80,0.04)',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px -8px rgba(20,40,80,0.18)'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(20,40,80,0.04)'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
            }}
          >
            {/* Avatar */}
            <div
              className="flex size-[46px] items-center justify-center rounded-full text-[16px] font-bold text-white mb-3"
              style={{ background: person.color }}
            >
              {person.initials}
            </div>

            {/* Name + role */}
            <p className="text-[15px] font-bold" style={{ color: '#1B2840' }}>{person.name}</p>
            <p className="text-[12.5px] font-semibold" style={{ color: '#0094FF' }}>{person.role}</p>
            <p className="mt-1 text-[12.5px]" style={{ color: '#94A0B5' }}>{person.email}</p>

            {/* Active tasks chip */}
            <div className="mt-3">
              <span
                className="rounded-full px-3 py-1 text-[12px] font-semibold"
                style={{ background: '#F6F8FC', color: '#5A6883' }}
              >
                {person.activeTasks} active tasks
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
