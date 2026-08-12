import { createContext, useContext } from 'react'

export const ContactDrawerContext = createContext<{ open: () => void }>({ open: () => {} })

export function useContactDrawer() {
  return useContext(ContactDrawerContext)
}
