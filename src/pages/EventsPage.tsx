import { useState } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { RegistrationModal } from '../components/RegistrationModal'
import { ProgramModal } from '../components/ProgramModal'

export function EventsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [regOpen, setRegOpen] = useState(false)
  const programOpen = location.pathname === '/events/agenda'

  const openProgram = () => navigate({ to: '/events/agenda' })
  const closeProgram = () => navigate({ to: '/events' })

  const promptNotifyMe = () => {
    const email = prompt(
      "Enter your email address to receive a calendar invite (.ics) or 'Add to Calendar' link:",
    )
    if (email?.trim()) {
      alert(`Thank you! A calendar invite for Accra 2027 has been sent to ${email}`)
    }
  }

  return (
    <section id="events">
      <div className="py-20 bg-pcna-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="font-heading text-4xl sm:text-5xl md:text-6xl font-black tracking-widest uppercase mb-4"
              style={{ color: '#0a3d2e' }}
            >
              Upcoming Events &amp; Summits
            </h2>
            <div className="w-16 h-1 bg-pcna-red mx-auto mt-4" />
            <p className="text-gray-600 mt-6 text-base sm:text-lg md:text-xl font-bold max-w-2xl mx-auto">
              Join us at our major global gatherings as we drive innovation and leadership in the
              African nursing diaspora.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
                <div className="bg-pcna-green relative overflow-hidden">
                  <img
                    src="/Pictures/eventaug.jpeg"
                    alt="2026 US Global Conference"
                    className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-pcna-light rounded-lg flex flex-col items-center justify-center border border-pcna-green/20 shadow-sm">
                      <span className="text-pcna-green font-bold text-xl leading-none">21-22</span>
                      <span className="text-pcna-green text-xs font-bold uppercase mt-1">AUG</span>
                    </div>
                    <div>
                      <p className="text-pcna-green font-bold text-base sm:text-lg md:text-xl">
                        Baltimore, Maryland
                      </p>
                      <p className="text-base sm:text-lg md:text-xl text-gray-500 font-bold">
                        Johns Hopkins Medical Campus
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6 text-base sm:text-lg md:text-xl font-bold">
                    Join a prestigious gathering of nursing leaders and innovators to explore new
                    frontiers in global healthcare delivery.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => setRegOpen(true)}
                      className="inline-block px-8 py-3 bg-pcna-green text-white font-bold rounded-md hover:bg-green-800 transition-all text-sm uppercase tracking-wider shadow-md hover:shadow-lg cursor-pointer"
                    >
                      Register
                    </button>
                    <button
                      type="button"
                      onClick={openProgram}
                      className="inline-block px-8 py-3 border-2 border-pcna-green text-pcna-green font-bold rounded-md hover:bg-pcna-green hover:text-white transition-all text-sm uppercase tracking-wider shadow-sm hover:shadow-md cursor-pointer"
                    >
                      Program
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
                <div className="bg-pcna-green relative overflow-hidden">
                  <img
                    src="/Pictures/eventupcomingjan.jpg"
                    alt="G-DNA Global Health Conference Accra"
                    className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="px-3 py-1 bg-pcna-red text-xs font-bold uppercase rounded-full shadow-sm">
                      Coming Soon
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-pcna-light rounded-lg flex flex-col items-center justify-center border border-pcna-green/20 shadow-sm">
                      <span className="text-pcna-green font-bold text-xl leading-none">07-09</span>
                      <span className="text-pcna-green text-xs font-bold uppercase mt-1">JAN</span>
                    </div>
                    <div>
                      <p className="text-pcna-green font-bold text-base sm:text-lg md:text-xl">
                        Accra, Ghana
                      </p>
                      <p className="text-base sm:text-lg md:text-xl text-gray-500 font-bold">
                        Flagstaff House Area
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6 text-base sm:text-lg md:text-xl font-bold">
                    A transformative summit connecting African nurses across the diaspora and the
                    continent for a healthier future.
                  </p>
                  <button
                    type="button"
                    onClick={promptNotifyMe}
                    className="inline-block px-8 py-3 border-2 border-pcna-green text-pcna-green font-bold rounded-md hover:bg-pcna-green hover:text-white transition-all text-sm uppercase tracking-wider shadow-sm hover:shadow-md cursor-pointer"
                  >
                    NOTIFY ME
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-10">
                <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-pcna-green">
                  <h3 className="font-heading text-xl font-bold text-gray-800 mb-6 uppercase tracking-wider border-b pb-3">
                    Upcoming Events
                  </h3>
                  <ul className="space-y-6">
                    <li>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 text-center pt-1">
                          <span className="block text-xl font-bold text-pcna-green leading-none">
                            21
                          </span>
                          <span className="block text-[10px] uppercase font-bold text-gray-500 mt-1">
                            AUG 26
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-base sm:text-lg md:text-xl text-gray-800 leading-snug">
                            Baltimore 2026 US Global Conference
                          </h4>
                          <p className="text-base sm:text-lg md:text-xl text-gray-500 mt-1 font-bold">
                            Baltimore, MD
                          </p>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 text-center pt-1">
                          <span className="block text-xl font-bold text-pcna-green leading-none">
                            07
                          </span>
                          <span className="block text-[10px] uppercase font-bold text-gray-500 mt-1">
                            JAN 27
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-base sm:text-lg md:text-xl text-gray-800 leading-snug">
                            Accra 2027 G-DNA Global Health Conference
                          </h4>
                          <p className="text-base sm:text-lg md:text-xl text-gray-500 mt-1 font-bold">
                            Accra, Ghana
                          </p>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-gray-400">
                  <h3 className="font-heading text-xl font-bold text-gray-500 mb-6 uppercase tracking-wider border-b pb-3">
                    Past Events
                  </h3>
                  <ul className="space-y-6 opacity-75 hover:opacity-100 transition-opacity">
                    <li>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 text-center pt-1">
                          <span className="block text-xl font-bold text-gray-500 leading-none">
                            01
                          </span>
                          <span className="block text-[10px] uppercase font-bold text-gray-400 mt-1">
                            JAN 26
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-base sm:text-lg md:text-xl text-gray-600 leading-snug">
                            Global Health Conference (January 2026)
                          </h4>
                          <p className="text-base sm:text-lg md:text-xl text-gray-400 mt-1 font-bold">
                            Past Archive
                          </p>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RegistrationModal open={regOpen} onClose={() => setRegOpen(false)} />
      <ProgramModal open={programOpen} onClose={closeProgram} />
    </section>
  )
}
