import { isValidPhoneNumber, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js'
import { callingCodeForIso } from '../data/phoneCodeOptions'
import { getCountryIsoCode } from '../data/countryIsoCodes'

function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

function buildInternationalNumber(phoneCode: string, phone: string) {
  const codeDigits = digitsOnly(phoneCode)
  const nationalDigits = digitsOnly(phone)
  if (!codeDigits || !nationalDigits) return ''
  return `+${codeDigits}${nationalDigits}`
}

function resolveDefaultCountry(
  phoneCountryIso: string,
  countryResidence?: string,
): CountryCode | undefined {
  if (phoneCountryIso) return phoneCountryIso as CountryCode
  return countryResidence ? getCountryIsoCode(countryResidence) : undefined
}

export function isValidMemberPhone(
  phone: string,
  phoneCountryIso: string,
  countryResidence?: string,
): boolean {
  const nationalNumber = phone.trim()
  if (!nationalNumber || !phoneCountryIso) return false

  const callingCode = callingCodeForIso(phoneCountryIso)
  if (!callingCode) return false

  const internationalNumber = buildInternationalNumber(callingCode, nationalNumber)
  if (!internationalNumber) return false

  const defaultCountry = resolveDefaultCountry(phoneCountryIso, countryResidence)

  if (defaultCountry && isValidPhoneNumber(internationalNumber, defaultCountry)) {
    return true
  }

  return isValidPhoneNumber(internationalNumber)
}

export function formatMemberPhoneE164(
  phone: string,
  phoneCountryIso: string,
  countryResidence?: string,
): string | null {
  const callingCode = callingCodeForIso(phoneCountryIso)
  if (!callingCode) return null

  const internationalNumber = buildInternationalNumber(callingCode, phone)
  if (!internationalNumber) return null

  const defaultCountry = resolveDefaultCountry(phoneCountryIso, countryResidence)

  const parsed =
    (defaultCountry ? parsePhoneNumberFromString(internationalNumber, defaultCountry) : null) ??
    parsePhoneNumberFromString(internationalNumber)

  if (!parsed?.isValid()) return null
  return parsed.format('E.164')
}
