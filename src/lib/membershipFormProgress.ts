import {
  membershipFormDefaults,
  type MembershipFormValues,
} from './membershipFormSchema'

const STORAGE_KEY = 'adna_membership_form_draft'
const DRAFT_VERSION = 1
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000

export type SavedMembershipFormValues = Omit<
  MembershipFormValues,
  'password' | 'confirmPassword'
>

export type MembershipFormDraft = {
  version: number
  savedAt: string
  step: number
  completed: number[]
  values: SavedMembershipFormValues
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function stripSensitiveFormValues(
  values: MembershipFormValues,
): SavedMembershipFormValues {
  const { password: _password, confirmPassword: _confirmPassword, ...rest } = values
  return rest
}

export function hasResumeableDraft(draft: MembershipFormDraft): boolean {
  const { values } = draft
  return (
    values.title !== '' ||
    values.firstName.trim() !== '' ||
    values.lastName.trim() !== '' ||
    values.email.trim() !== '' ||
    values.countryResidence !== '' ||
    values.phone.trim() !== '' ||
    values.isStudent !== '' ||
    values.education !== '' ||
    values.licences.length > 0 ||
    values.membershipType !== '' ||
    draft.step > 1 ||
    draft.completed.length > 0
  )
}

export function loadMembershipFormDraft(): MembershipFormDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || parsed.version !== DRAFT_VERSION) {
      clearMembershipFormDraft()
      return null
    }

    const savedAt = typeof parsed.savedAt === 'string' ? parsed.savedAt : ''
    if (!savedAt || Date.now() - Date.parse(savedAt) > MAX_AGE_MS) {
      clearMembershipFormDraft()
      return null
    }

    const values = parsed.values
    if (!isRecord(values)) {
      clearMembershipFormDraft()
      return null
    }

    const draft: MembershipFormDraft = {
      version: DRAFT_VERSION,
      savedAt,
      step: typeof parsed.step === 'number' ? parsed.step : 1,
      completed: Array.isArray(parsed.completed)
        ? parsed.completed.filter((item): item is number => typeof item === 'number')
        : [],
      values: {
        ...membershipFormDefaults,
        ...values,
        password: '',
        confirmPassword: '',
      },
    }

    if (!hasResumeableDraft(draft)) {
      clearMembershipFormDraft()
      return null
    }

    return draft
  } catch {
    clearMembershipFormDraft()
    return null
  }
}

export function saveMembershipFormDraft(input: {
  step: number
  completed: number[]
  values: SavedMembershipFormValues
}) {
  const draft: MembershipFormDraft = {
    version: DRAFT_VERSION,
    savedAt: new Date().toISOString(),
    step: input.step,
    completed: input.completed,
    values: input.values,
  }

  if (!hasResumeableDraft(draft)) {
    clearMembershipFormDraft()
    return
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
}

export function clearMembershipFormDraft() {
  localStorage.removeItem(STORAGE_KEY)
}

export function formatDraftSavedAt(savedAt: string): string {
  const date = new Date(savedAt)
  if (Number.isNaN(date.getTime())) return 'recently'
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
