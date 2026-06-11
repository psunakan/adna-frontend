export function getMemberInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0)
  const last = lastName.trim().charAt(0)
  const initials = `${first}${last}`.toUpperCase()
  return initials || '?'
}
