import { PillarsSection } from '../components/PillarsSection'
import { ExecutiveTeam } from '../components/ExecutiveTeam'
import { Reveal } from '../components/Reveal'

const CORE_VALUES = ['Collaboration', 'Integrity', 'Resilience', 'Perseverance', 'Excellence']

export function AboutPage() {
  return (
    <section id="about" className="animate-fade-in">
      <div className="py-16 bg-pcna-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-2/5">
              <h3
                className="font-heading text-4xl sm:text-5xl md:text-6xl font-black tracking-widest uppercase mb-8"
                style={{ color: '#0a3d2e' }}
              >
                Mission
              </h3>
              <p className="text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-2xl text-black">
                We exist to bridge the gap between African nurses at home and abroad, building
                lasting partnerships that strengthen nursing education across Africa and deliver
                better health outcomes for African people everywhere.
              </p>
            </div>
            <div className="lg:w-3/5 flex justify-center lg:justify-end">
              <img
                src="/Pictures/WhatsApp_Image_2026-04-26_at_9.34.32_PM__3_.jpeg"
                alt="A-DNA Mission Team"
                className="rounded-xl shadow-lg w-full object-cover border border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-pcna-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="lg:w-2/5">
              <h3 className="font-heading text-white text-4xl sm:text-5xl md:text-6xl font-black tracking-widest uppercase mb-8">
                Vision
              </h3>
              <p className="text-white opacity-95 text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-2xl">
                We envision an Africa that shapes the future of global nursing, cultivating a
                world-class workforce of nurses whose expertise transforms health outcomes for
                communities everywhere.
              </p>
            </div>
            <div className="lg:w-3/5 flex justify-center lg:justify-end">
              <img
                src="/Pictures/bannerv.jpg"
                alt="A-DNA Vision"
                className="rounded-xl shadow-lg w-full object-cover border-2 border-white/20"
              />
            </div>
          </div>
        </div>
      </div>

      <div id="core-values-parallax" className="py-24">
        <div className="parallax-bg" />
        <div className="parallax-overlay" />
        <div className="parallax-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal className="mb-16">
            <h3
              className="font-heading text-4xl sm:text-5xl md:text-6xl font-black tracking-widest uppercase mb-8"
              style={{ color: '#0a3d2e', textShadow: '0 2px 10px rgba(255,255,255,0.8)' }}
            >
              Core Values
            </h3>
            <div className="w-20 h-1.5 bg-pcna-red mx-auto rounded-full" />
          </Reveal>
          <div className="flex flex-wrap justify-center gap-6">
            {CORE_VALUES.map((value) => (
              <div
                key={value}
                className="px-10 py-4 bg-white/90 text-pcna-green font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-500 border border-pcna-green/10 flex items-center gap-4 text-lg backdrop-blur-md group"
              >
                <span className="w-3 h-3 bg-pcna-red rounded-full group-hover:scale-125 transition-transform" />
                {value}
              </div>
            ))}
          </div>
        </div>
      </div>

      <PillarsSection />
      <ExecutiveTeam />
    </section>
  )
}
