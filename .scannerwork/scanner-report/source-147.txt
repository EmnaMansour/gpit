import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'

export function PricingSection() {
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

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      observer.disconnect()
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // const plans = [
  //   {
  //     name: 'Essentiel',
  //     price: '29',
  //     description: 'Pour les petites entreprises avec un parc informatique limité',
  //     features: ['Jusqu\'à 25 appareils', 'Surveillance en temps réel', 'Gestion à distance basique', 'Rapports mensuels', 'Support par email'],
  //     notIncluded: ['Automatisation avancée', 'Intégration avec les outils tiers', 'Support 24/7'],
  //     cta: "Commencer l'essai gratuit",
  //     popular: false,
  //     gradient: 'from-gray-700 to-gray-800'
  //   },
  //   {
  //     name: 'Professionnel',
  //     price: '79',
  //     description: 'Pour les entreprises en croissance avec des besoins IT avancés',
  //     features: [
  //       'Jusqu\'à 100 appareils',
  //       'Surveillance en temps réel',
  //       'Gestion à distance complète',
  //       'Automatisation des tâches',
  //       'Rapports personnalisés',
  //       'Intégration avec les outils tiers',
  //       'Support prioritaire',
  //     ],
  //     notIncluded: ['Support 24/7'],
  //     cta: "Commencer l'essai gratuit",
  //     popular: true,
  //     gradient: 'from-blue-600 to-blue-700'
  //   },
  //   {
  //     name: 'Entreprise',
  //     price: '199',
  //     description: 'Pour les grandes entreprises avec des infrastructures complexes',
  //     features: [
  //       'Appareils illimités',
  //       'Surveillance en temps réel',
  //       'Gestion à distance complète',
  //       'Automatisation avancée',
  //       'Rapports personnalisés',
  //       'Intégration API complète',
  //       'Support 24/7',
  //       'Gestionnaire de compte dédié',
  //     ],
  //     notIncluded: [],
  //     cta: 'Contacter les ventes',
  //     popular: false,
  //     gradient: 'from-purple-600 to-purple-700'
  //   }
  // ]

  return (
    <div className="py-32 bg-gradient-to-br from-gray-900 via-black to-blue-900 relative overflow-hidden">
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
      {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
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
            opacity: visibleSections.has('pricing-title') ? 1 : 0,
            transform: visibleSections.has('pricing-title') ? 'translateY(0)' : 'translateY(40px)'
          }}
          data-animate
          id="pricing-title"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
            Tarifs simples et transparents
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Choisissez le plan qui correspond le mieux aux besoins de votre entreprise
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`opacity-0 transform translate-y-10 transition-all duration-700 ease-out`}
              style={{ 
                opacity: visibleSections.has(`plan-${index}`) ? 1 : 0,
                transform: visibleSections.has(`plan-${index}`) ? 'translateY(0)' : 'translateY(40px)',
                transitionDelay: `${index * 150}ms`
              }}
              data-animate
              id={`plan-${index}`}
            >
              <div className={`group h-full rounded-3xl overflow-hidden border transition-all duration-500 ${
                plan.popular
                  ? 'border-blue-500 shadow-2xl scale-105 bg-gradient-to-br from-blue-900/90 to-blue-800/80 backdrop-blur-xl'
                  : 'border-gray-700/50 bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl hover:border-gray-600/50 hover:scale-105'
              }`}>
                {plan.popular && (
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 text-center font-bold relative">
                    <div className="absolute inset-0 bg-white/10 animate-pulse" />
                    <span className="relative z-10">Le plus populaire</span>
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className={`text-3xl font-black mb-3 ${plan.popular ? 'text-white' : 'text-blue-400'}`}>
                    {plan.name}
                  </h3>
                  <p className={`mb-8 ${plan.popular ? 'text-blue-100' : 'text-gray-400'}`}>
                    {plan.description}
                  </p>
                  
                  <div className="mb-8 relative">
                    <span className="text-5xl font-black text-blue-400">{plan.price}€</span>
                    <span className="block text-gray-400 mt-1">/mois par appareil</span>
                  </div>
                  
                  <button className={`group w-full py-4 rounded-xl font-bold mb-8 transition-all duration-300 transform hover:scale-105 ${
                    plan.popular
                      ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl hover:shadow-white/25'
                      : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-xl hover:shadow-2xl hover:shadow-blue-500/25'
                  }`}>
                    <span className="flex items-center justify-center gap-2">
                      {plan.cta}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                  
                  <div>
                    <p className={`font-semibold mb-6 ${plan.popular ? 'text-white' : 'text-blue-300'}`}>
                      Fonctionnalités incluses :
                    </p>
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, i) => (
                        <li 
                          key={i}
                          className="flex items-start group-hover:translate-x-1 transition-transform duration-300"
                          style={{ transitionDelay: `${i * 50}ms` }}
                        >
                          <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                          <span className={plan.popular ? 'text-blue-100' : 'text-gray-300'}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    {plan.notIncluded.length > 0 && (
                      <div>
                        <p className={`font-semibold mb-4 ${plan.popular ? 'text-gray-300' : 'text-blue-400'}`}>
                          Non inclus :
                        </p>
                        <ul className="space-y-3">
                          {plan.notIncluded.map((feature, i) => (
                            <li 
                              key={i}
                              className="flex items-start"
                            >
                              <X className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-400">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Solutions CTA */}
        <div 
          className="text-center opacity-0 transform translate-y-10 transition-all duration-1000 ease-out"
          style={{ 
            opacity: visibleSections.has('custom-cta') ? 1 : 0,
            transform: visibleSections.has('custom-cta') ? 'translateY(0)' : 'translateY(40px)'
          }}
          data-animate
          id="custom-cta"
        >
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl rounded-3xl p-12 border border-gray-700/30">
            <h3 className="text-3xl font-black mb-6 text-white">
              Vous avez des besoins spécifiques ?
            </h3>
            <p className="mb-10 max-w-2xl mx-auto text-gray-300 text-lg">
              Nous proposons également des solutions personnalisées pour répondre aux exigences uniques de votre entreprise.
            </p>
            <button className="group px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-full hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
              <span className="flex items-center justify-center gap-2">
                Contacter notre équipe commerciale
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>

    </div>
  )
}