import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Toaster } from 'react-hot-toast'
import { ContactDrawerProvider } from '../components/ContactDrawer'
import { TopBar, MainNav } from '../components/Header'
import { Footer } from '../components/Footer'
import { MemberAuthProvider } from '../lib/MemberAuthProvider'
import { HelpScoutBeacon } from '../components/HelpScoutBeacon'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <MemberAuthProvider>
      <HelpScoutBeacon />
      <ContactDrawerProvider>
        <Toaster
          position="top-center"
          containerStyle={{
            zIndex: 10000000,
            top: 56,
          }}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              fontSize: '0.95rem',
              borderRadius: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            },
            error: {
              style: { border: '1px solid #fecaca' },
              iconTheme: { primary: '#cc0000', secondary: '#fff' },
            },
            success: {
              style: { border: '1px solid #bbf7d0' },
              iconTheme: { primary: '#0D3D2B', secondary: '#fff' },
            },
          }}
        />
        <TopBar />
        <MainNav />
        <main>
          <Outlet />
        </main>
        <Footer />
      </ContactDrawerProvider>
    </MemberAuthProvider>
  )
}
