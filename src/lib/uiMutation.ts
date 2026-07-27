import { toast } from 'sonner'
import { reportUiError } from './uiError'

interface UiMutationOptions<T> {
  operation: string
  optimistic: () => void
  execute: () => Promise<T>
  rollback: () => void
  failureMessage: string
  successMessage?: string
}

export async function runUiMutation<T>({
  operation,
  optimistic,
  execute,
  rollback,
  failureMessage,
  successMessage,
}: UiMutationOptions<T>): Promise<T | null> {
  optimistic()
  try {
    const result = await execute()
    if (successMessage) toast.success(successMessage)
    return result
  } catch (error) {
    rollback()
    reportUiError(operation, failureMessage, error)
    return null
  }
}
