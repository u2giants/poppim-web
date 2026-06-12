const rawGitSha = import.meta.env.VITE_BUILD_GIT_SHA || 'local'
const rawCommitDate = import.meta.env.VITE_BUILD_COMMIT_DATE || ''

export const buildInfo = {
  gitSha: rawGitSha,
  shortGitSha: rawGitSha.length >= 8 ? rawGitSha.slice(0, 8) : rawGitSha,
  commitDateIso: rawCommitDate,
  buildRun: import.meta.env.VITE_BUILD_RUN || 'local',
}

export function formatCommitDateInNewYork(isoDate: string) {
  if (!isoDate || isoDate === 'unknown') return 'local time unknown'

  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return 'local time unknown'

  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date)
}
