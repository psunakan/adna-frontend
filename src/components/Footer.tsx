import { Link } from '@tanstack/react-router'
import { useContactDrawer } from './ContactDrawer'
import { SocialLinks } from './SocialLinks'
import { useMemberAuth } from '../lib/MemberAuthProvider'
import { PORTAL_LOGIN_PATH, PORTAL_PATH } from '../lib/memberAuth'

export function Footer() {
  const { open: openContactDrawer } = useContactDrawer()
  const { isAuthenticated } = useMemberAuth()
  const portalTo = isAuthenticated ? PORTAL_PATH : PORTAL_LOGIN_PATH

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-pcna-green text-white py-3 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.2)] border-t-4 border-pcna-red">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-6">
            <Link
              to={portalTo}
              className="text-sm font-extrabold uppercase tracking-widest hover:text-pcna-red transition-colors"
            >
              Member Portal
            </Link>
            <button
              onClick={openContactDrawer}
              className="text-sm font-extrabold uppercase tracking-widest hover:text-pcna-red transition-colors bg-transparent border-0 cursor-pointer text-white p-0"
            >
              Contact Us
            </button>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <span className="text-[10px] opacity-75 uppercase">Follow us:</span>
            <SocialLinks iconClassName="hover:text-pcna-red" />
          </div>
        </div>
        <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="text-center w-full mt-2 opacity-60 text-[10px] uppercase tracking-widest">
            &copy; 2026 A-DNA. Designed by Forge Sync
          </div>
        </div>
      </div>
    </footer>
  )
}
