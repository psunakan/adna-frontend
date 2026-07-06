/** Constant-time string comparison for shared secrets. */
export function timingSafeEqualString(a: string, b: string): boolean {
  const encoder = new TextEncoder()
  const aa = encoder.encode(a)
  const bb = encoder.encode(b)

  if (aa.length !== bb.length) return false

  let diff = 0
  for (let i = 0; i < aa.length; i += 1) {
    diff |= aa[i] ^ bb[i]
  }

  return diff === 0
}

export function verifySharedSecret(provided: string, expected: string | undefined): boolean {
  if (!expected?.trim()) return false
  return timingSafeEqualString(provided.trim(), expected.trim())
}
