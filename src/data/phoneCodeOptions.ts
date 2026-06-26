import { getCountryCallingCode, type CountryCode } from 'libphonenumber-js'
import { COUNTRIES } from './countries'
import { getCountryIsoCode } from './countryIsoCodes'

const PRIORITY_COUNTRIES: ReadonlySet<(typeof COUNTRIES)[number]> = new Set([
  'United States',
  'Ghana',
  'Nigeria',
  'United Kingdom',
  'Canada',
])

export type PhoneCodeOption = {
  /** ISO 3166-1 alpha-2 country code (unique per option). */
  value: string
  label: string
  searchText: string
  callingCode: string
}

export const PHONE_CODE_OPTIONS: PhoneCodeOption[] = (() => {
  const items: PhoneCodeOption[] = []

  for (const country of COUNTRIES) {
    const iso = getCountryIsoCode(country)
    if (!iso) continue

    try {
      const callingCode = `+${getCountryCallingCode(iso)}`
      items.push({
        value: iso,
        label: `${country} (${callingCode})`,
        searchText: `${country} ${callingCode} ${iso}`.toLowerCase(),
        callingCode,
      })
    } catch {
      // Some territories may not expose a calling code in metadata.
    }
  }

  items.sort((a, b) => {
    const aCountry = a.label.replace(/\s\([^)]+\)$/, '')
    const bCountry = b.label.replace(/\s\([^)]+\)$/, '')
    const aPriority = PRIORITY_COUNTRIES.has(aCountry as (typeof COUNTRIES)[number]) ? 0 : 1
    const bPriority = PRIORITY_COUNTRIES.has(bCountry as (typeof COUNTRIES)[number]) ? 0 : 1
    if (aPriority !== bPriority) return aPriority - bPriority
    return a.label.localeCompare(b.label)
  })

  return items
})()

const phoneCodeByIso = new Map(PHONE_CODE_OPTIONS.map((option) => [option.value, option]))

export function callingCodeForIso(iso: string): string {
  return phoneCodeByIso.get(iso)?.callingCode ?? ''
}

export function phoneCodeLabelForIso(iso: string): string {
  return phoneCodeByIso.get(iso)?.label ?? iso
}

export function defaultPhoneCodeIsoForCountry(countryName: string): CountryCode | undefined {
  return getCountryIsoCode(countryName)
}
