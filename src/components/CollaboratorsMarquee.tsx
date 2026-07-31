import { COLLABORATOR_LOGOS } from '../data/collaborators'

export function CollaboratorsMarquee() {
  const logos = [
    ...COLLABORATOR_LOGOS.map((logo) => ({ ...logo, pass: 'a' as const })),
    ...COLLABORATOR_LOGOS.map((logo) => ({ ...logo, pass: 'b' as const })),
  ]

  return (
    <div className="overflow-hidden">
      <div className="bg-pcna-green py-5 px-8">
        <h2 className="font-heading text-white text-2xl md:text-3xl font-extrabold uppercase tracking-widest text-center">
          Global Collaborators
        </h2>
      </div>

      <div className="bg-white py-8 relative overflow-hidden border-b border-gray-100">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
        <div className="marquee-track items-center gap-12 px-8">
          {logos.map((logo) => (
            <div
              key={`${logo.src}-${logo.pass}`}
              className="flex items-center justify-center px-5"
              style={{ minWidth: logo.minW, minHeight: 80 }}
            >
              <img src={logo.src} alt={logo.alt} className={`${logo.h} w-auto object-contain`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
