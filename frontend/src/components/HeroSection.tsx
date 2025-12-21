import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Users, Monitor, AlertCircle } from 'lucide-react'

export function HeroSection() {


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

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const features = [
    { 
      icon: Users, 
      title: 'Gestion des utilisateurs', 
      desc: 'Création et gestion complète des comptes avec attribution de rôles (Administrateur, Technicien, Employé).',
      gradient: 'from-blue-500 to-cyan-400'
    },
    { 
      icon: Monitor, 
      title: 'Gestion des équipements', 
      desc: "Suivi complet de votre parc informatique avec affectation aux utilisateurs et suivi d'état en temps réel.",
      gradient: 'from-green-500 to-emerald-400'
    },
    { 
      icon: AlertCircle, 
      title: 'Gestion des incidents', 
      desc: 'Déclaration et suivi des incidents avec système de tickets et attribution automatique aux techniciens.',
      gradient: 'from-purple-500 to-violet-400'
    }
  ]

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-blue-900 text-white min-h-screen flex items-center">
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

      <div className="absolute inset-0">
        {[...Array(25)].map((_, i) => (
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

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div 
            className="opacity-0 transform translate-y-10 transition-all duration-1000 ease-out"
            style={{ 
              opacity: visibleSections.has('hero-content') ? 1 : 0,
              transform: visibleSections.has('hero-content') ? 'translateY(0)' : 'translateY(40px)'
            }}
            data-animate
            id="hero-content"
          >
            <div className="inline-block px-4 py-2 bg-blue-600/20 rounded-full text-blue-200 text-sm font-semibold mb-8 backdrop-blur-sm border border-blue-500/20">
              Solution de gestion de parc informatique
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black mb-8 leading-tight bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
              Gérez votre parc informatique 
              <span className="block text-blue-400">en toute simplicité</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-2xl">
              Une solution complète pour la gestion des utilisateurs, équipements et incidents de votre parc informatique avec
              <span className="text-blue-400 font-semibold"> tableaux de bord, rapports et QR codes</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <button 
                onClick={scrollToFeatures}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-full hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
              >
                <span className="flex items-center justify-center gap-2">
                  Découvrir les fonctionnalités
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
             <Link to="/register">
              <button
                className="group px-8 py-4 bg-transparent border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
              >
                <span className="flex items-center justify-center gap-2">
                  S'inscrire
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>
            </div>
          </div>

          <div 
            className="relative opacity-0 transform translate-y-10 transition-all duration-1000 ease-out"
            style={{ 
              opacity: visibleSections.has('hero-image') ? 1 : 0,
              transform: visibleSections.has('hero-image') ? 'translateY(0)' : 'translateY(40px)',
              transitionDelay: '300ms'
            }}
            data-animate
            id="hero-image"
          >
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
                alt="Tableau de bord GPIT"
                className="relative rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-500 w-full"
              />
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-gray-700/50 group-hover:scale-110 transition-transform duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-green-500 animate-pulse" />
                  <span className="font-semibold text-white">Gestion optimisée</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div 
          id="features-section" 
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`opacity-0 transform translate-y-10 transition-all duration-700 ease-out`}
              style={{ 
                opacity: visibleSections.has(`feature-card-${index}`) ? 1 : 0,
                transform: visibleSections.has(`feature-card-${index}`) ? 'translateY(0)' : 'translateY(40px)',
                transitionDelay: `${600 + index * 150}ms`
              }}
              data-animate
              id={`feature-card-${index}`}
            >
              <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-500 hover:scale-105">
                <div className={`bg-gradient-to-r ${feature.gradient} rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}