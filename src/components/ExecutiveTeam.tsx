import { EXECUTIVE_TEAM } from '../data/team'
import { Reveal } from './Reveal'

export function ExecutiveTeam() {
  return (
    <section id="executive-team" className="py-20 bg-pcna-green animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-widest">
            Global Executive Team
          </h2>
          <div className="w-24 h-1 bg-yellow-500 mx-auto mt-6" />
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {EXECUTIVE_TEAM.map((member) => (
            <Reveal
              key={member.name + member.role}
              delay={member.revealDelay}
              className="team-card bg-transparent text-center"
            >
              <div className="overflow-hidden mb-5 border-2 border-yellow-500 inline-block p-1 bg-white">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-60 h-72 object-cover object-top team-avatar border border-gray-200"
                  style={
                    member.objectPosition ? { objectPosition: member.objectPosition } : undefined
                  }
                />
              </div>
              <h4 className="text-white font-bold text-lg leading-tight mb-1">
                {member.name}
                <br />
                <span
                  className={`text-sm font-normal ${member.name === 'Vacant' ? 'invisible' : ''}`}
                >
                  {member.credentials}
                </span>
              </h4>
              <p className="text-yellow-500 font-bold text-sm tracking-wide">{member.role}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
