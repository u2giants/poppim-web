import { toast } from 'sonner'

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

export function reportUiError(operation: string, failureMessage: string, error: unknown): void {
  console.error({ operation, message: errorMessage(error, failureMessage) })
  toast.error(failureMessage)
}

export function reportOptionalDataError(operation: string, label: string, error: unknown): void {
  console.warn({ operation, message: errorMessage(error, `Unable to load ${label}`) })
  toast.warning(`${label} could not be loaded. The rest of the page is still available.`)
}

export function pageLoadFailure(
  operation: string,
  label: string,
  cursor: string,
  restoreCursor: (cursor: string) => void,
): (error: unknown) => void {
  return (error) => {
    restoreCursor(cursor)
    reportUiError(operation, `${label} could not be loaded. Try again.`, error)
  }
}
