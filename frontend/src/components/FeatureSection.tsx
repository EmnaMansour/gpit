import { useState, useEffect } from 'react'
import { Monitor, Server, RefreshCw, Shield, BarChart2, Clock, Zap, Users, Check } from 'lucide-react'

export function FeatureSection() {
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

  const features = [
    {
      icon: Monitor,
      title: 'Gestion à distance',
      description: 'Accédez à distance aux ordinateurs et périphériques pour un dépannage instantané sans déplacement sur site.',
      color: 'from-blue-500 to-cyan-400'
    },
    {
      icon: Server,
      title: 'Surveillance en temps réel',
      description: "Surveillez l'état de santé de vos appareils avec des alertes instantanées en cas de problèmes détectés.",
      color: 'from-green-500 to-emerald-400'
    },
    {
      icon: RefreshCw,
      title: 'Gestion des mises à jour',
      description: "Déployez et gérez automatiquement les mises à jour logicielles et de sécurité sur l'ensemble du parc.",
      color: 'from-purple-500 to-violet-400'
    },
    {
      icon: Zap,
      title: 'Automatisation des tâches',
      description: "Automatisez les tâches répétitives comme l'installation de logiciels ou les configurations système.",
      color: 'from-orange-500 to-amber-400'
    },
    {
      icon: BarChart2,
      title: 'Rapports et analyses',
      description: "Générez des rapports détaillés sur l'état de votre parc pour une prise de décision éclairée.",
      color: 'from-indigo-500 to-blue-400'
    },
    {
      icon: Shield,
      title: 'Sécurité renforcée',
      description: 'Protégez votre infrastructure avec des fonctionnalités de sécurité avancées et une surveillance des vulnérabilités.',
      color: 'from-red-500 to-pink-400'
    },
    {
      icon: Clock,
      title: 'Planification des tâches',
      description: 'Planifiez des tâches de maintenance en dehors des heures de travail pour minimiser les perturbations.',
      color: 'from-teal-500 to-cyan-400'
    },
    {
      icon: Users,
      title: 'Gestion des utilisateurs',
      description: "Gérez facilement les droits d'accès et les permissions pour chaque membre de votre équipe IT.",
      color: 'from-pink-500 to-rose-400'
    }
  ]

  const dashboardFeatures = [
    'Tableaux de bord personnalisables',
    'Vues multiples selon les rôles',
    'Alertes configurables',
    'Interface responsive pour mobile et tablette'
  ]

  return (
    <div className="py-32 bg-gradient-to-b from-black to-gray-900">
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

      <div className="container mx-auto px-4">
        {/* Dashboard Showcase */}
        <div 
          className="mb-32 opacity-0 transform translate-y-10 transition-all duration-1000 ease-out"
          style={{ 
            opacity: visibleSections.has('dashboard-showcase') ? 1 : 0,
            transform: visibleSections.has('dashboard-showcase') ? 'translateY(0)' : 'translateY(40px)'
          }}
          data-animate
          id="dashboard-showcase"
        >
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl rounded-3xl p-12 border border-gray-700/30">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl md:text-4xl font-black mb-6 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                  Interface intuitive et tableau de bord personnalisable
                </h3>
                <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                  Notre interface utilisateur moderne et intuitive vous permet de visualiser rapidement l'état de votre parc informatique.
                  Personnalisez votre tableau de bord selon vos besoins spécifiques pour accéder aux informations les plus importantes en un coup d'œil.
                </p>
                <ul className="space-y-4">
                  {dashboardFeatures.map((item, index) => (
                    <li 
                      key={index} 
                      className="flex items-start group hover:translate-x-2 transition-transform duration-300"
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <Check className="h-6 w-6 text-green-400 mr-3 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="text-gray-200 group-hover:text-white transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2070&q=80"
                  alt="Tableau de bord GPIT"
                  className="relative rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500 w-full"
                />
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-gray-700/50 group-hover:scale-110 transition-transform duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-green-500 animate-pulse" />
                    <span className="font-semibold text-white">98% des appareils en ligne</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Title */}
        <div 
          className="text-center mb-20 opacity-0 transform translate-y-10 transition-all duration-1000 ease-out"
          style={{ 
            opacity: visibleSections.has('features-title') ? 1 : 0,
            transform: visibleSections.has('features-title') ? 'translateY(0)' : 'translateY(40px)'
          }}
          data-animate
          id="features-title"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
            Fonctionnalités complètes
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Notre plateforme offre tous les outils dont vous avez besoin pour gérer efficacement votre infrastructure informatique
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`opacity-0 transform translate-y-10 transition-all duration-700 ease-out`}
              style={{ 
                opacity: visibleSections.has(`feature-${index}`) ? 1 : 0,
                transform: visibleSections.has(`feature-${index}`) ? 'translateY(0)' : 'translateY(40px)',
                transitionDelay: `${index * 100}ms`
              }}
              data-animate
              id={`feature-${index}`}
            >
              <div className="group h-full bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-500 hover:scale-105">
                <div className={`bg-gradient-to-r ${feature.color} rounded-xl w-14 h-14 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}