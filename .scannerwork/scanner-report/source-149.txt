import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'

export function TestimonialSection() {
  const [visibleSections, setVisibleSections] = useState(new Set())
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(entry.target.id))
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el)
    })

    const handleMouseMove =(e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      observer.disconnect()
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const testimonials = [
    {
      content: 'GPIT a complètement transformé notre façon de gérer notre parc informatique. Nous avons réduit notre temps de résolution des problèmes de 70% et amélioré la satisfaction de nos utilisateurs.',
      author: 'Marie Dupont',
      position: 'Directrice IT, TechCorp',
      avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
      rating: 5,
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      content: "La plateforme est incroyablement intuitive et puissante. La surveillance en temps réel nous permet d'anticiper les problèmes avant qu'ils n'affectent nos utilisateurs.",
      author: 'Thomas Martin',
      position: 'Administrateur Système, InnoTech',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      rating: 5,
      gradient: 'from-green-600 to-teal-600'
    },
    {
      content: "L'automatisation des mises à jour nous a fait gagner des heures chaque semaine. Notre équipe peut désormais se concentrer sur des projets à plus forte valeur ajoutée.",
      author: 'Sophie Leclerc',
      position: 'Responsable Infrastructure, DataSphere',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      rating: 5,
      gradient: 'from-orange-600 to-red-600'
    }
  ]

  return (
    <div className="relative py-32 bg-gradient-to-b from-black to-gray-900 overflow-hidden">
      {/* Cursor effect */}
      <div 
        className="fixed w-6 h-6 rounded-full bg-blue-500/30 pointer-events-none z-50 transition-transform duration-100 ease-out"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          transform: 'scale(1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.5)'
        }}
      />

      {/* Animated background */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div 
          className="text-center mb-20 opacity-0 transform translate-y-10 transition-all duration-1000 ease-out"
          style={{ 
            opacity: visibleSections.has('testimonials-title') ? 1 : 0,
            transform: visibleSections.has('testimonials-title') ? 'translateY(0)' : 'translateY(40px)'
          }}
          data-animate
          id="testimonials-title"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
            Ce que nos clients disent
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Découvrez comment GPIT aide les professionnels IT à transformer leur gestion de parc informatique
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className={`opacity-0 transform translate-y-10 transition-all duration-700 ease-out`}
              style={{ 
                opacity: visibleSections.has(`testimonial-${index}`) ? 1 : 0,
                transform: visibleSections.has(`testimonial-${index}`) ? 'translateY(0)' : 'translateY(40px)',
                transitionDelay: `${index * 150}ms`
              }}
              data-animate
              id={`testimonial-${index}`}
            >
              <div className="group h-full bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-500 hover:scale-105">
                {/* Stars */}
                <div className="flex mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-500'} group-hover:scale-110 transition-transform duration-300`}
                      style={{ transitionDelay: `${i * 50}ms` }}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-300 mb-8 italic text-lg leading-relaxed group-hover:text-gray-200 transition-colors">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center">
                  <div className="relative">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="w-14 h-14 rounded-full mr-4 object-cover border-2 border-gray-600 group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${testimonial.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">
                      {testimonial.author}
                    </h4>
                    <p className="text-blue-400 font-medium">
                      {testimonial.position}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        {/* <div 
          className="opacity-0 transform translate-y-10 transition-all duration-1000 ease-out"
          style={{ 
            opacity: visibleSections.has('testimonials-cta') ? 1 : 0,
            transform: visibleSections.has('testimonials-cta') ? 'translateY(0)' : 'translateY(40px)'
          }}
          data-animate
          id="testimonials-cta"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-center shadow-2xl border border-blue-500/20">
            <h3 className="text-3xl md:text-4xl font-black mb-6 text-white">
              Prêt à transformer votre gestion IT ?
            </h3>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Rejoignez les centaines d'entreprises qui font confiance à GPIT pour 
              <span className="font-bold text-white"> optimiser leur infrastructure</span> informatique.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <button className="group px-10 py-5 bg-white text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-lg">
                <span className="flex items-center justify-center gap-2">
                  Commencer l'essai gratuit
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <button className="group px-10 py-5 bg-transparent border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm text-lg">
                <span className="flex items-center justify-center gap-2">
                  <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  Demander une démo
                </span>
              </button>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  )
}