import  { useState, useEffect } from 'react'
import {
  Monitor,
  Server,
  RefreshCw,
  Shield,
  BarChart2,
  Clock,
  Zap,
  Users,
  AlertTriangle,
  Database,
  Settings,
  Tablet,
  Check,
  ArrowRight,
  
} from 'lucide-react'

export default function Features() {
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

  const mainFeatures = [
    {
      icon: <Monitor className="h-12 w-12" />,
      title: "Gestion à distance",
      description: "Accédez et contrôlez vos appareils à distance pour résoudre rapidement les problèmes sans avoir à vous déplacer.",
      features: [
        'Prise de contrôle à distance sécurisée',
        'Transfert de fichiers bidirectionnel',
        "Chat intégré avec l'utilisateur",
        'Sessions multiples simultanées',
        'Enregistrement des sessions pour audit'
      ],
      gradient: "from-blue-600 to-cyan-500"
    },
    {
      icon: <Server className="h-12 w-12" />,
      title: "Surveillance en temps réel",
      description: "Surveillez l'état de santé de vos appareils en temps réel et détectez les problèmes avant qu'ils n'affectent vos utilisateurs.",
      features: [
        'Surveillance CPU, mémoire et disque',
        'Suivi des services et processus',
        'Alertes personnalisables',
        'Tableaux de bord en temps réel',
        'Historique des performances'
      ],
      gradient: "from-purple-600 to-pink-500"
    },
    {
      icon: <RefreshCw className="h-12 w-12" />,
      title: "Gestion des mises à jour",
      description: "Automatisez la gestion des mises à jour logicielles et de sécurité pour maintenir votre parc à jour et sécurisé.",
      features: [
        'Déploiement centralisé des mises à jour',
        'Planification des mises à jour',
        'Rapports de conformité',
        'Rollback en cas de problème',
        'Support pour Windows, Mac et Linux'
      ],
      gradient: "from-green-600 to-teal-500"
    },
    {
      icon: <Zap className="h-12 w-12" />,
      title: "Automatisation des tâches",
      description: "Automatisez les tâches répétitives comme l'installation de logiciels, les configurations système ou les maintenances régulières.",
      features: [
        'Scripts personnalisés',
        'Déploiement de logiciels en masse',
        "Workflows d'automatisation",
        'Tâches planifiées',
        'Intégration avec PowerShell et Bash'
      ],
      gradient: "from-orange-600 to-red-500"
    }
  ]

  const advancedFeatures = [
    {
      icon: <BarChart2 className="h-8 w-8" />,
      title: 'Rapports et analyses',
      description: "Générez des rapports détaillés sur l'état de votre parc pour une prise de décision éclairée.",
      color: 'from-blue-500 to-cyan-400'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Sécurité renforcée',
      description: 'Protégez votre infrastructure avec des fonctionnalités de sécurité avancées.',
      color: 'from-green-500 to-emerald-400'
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Planification des tâches',
      description: 'Planifiez des tâches de maintenance en dehors des heures de travail.',
      color: 'from-purple-500 to-violet-400'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Gestion des utilisateurs',
      description: "Gérez facilement les droits d'accès et les permissions pour votre équipe IT.",
      color: 'from-orange-500 to-amber-400'
    },
    {
      icon: <AlertTriangle className="h-8 w-8" />,
      title: "Système d'alerte avancé",
      description: 'Recevez des alertes personnalisées par email, SMS ou notification push.',
      color: 'from-red-500 to-pink-400'
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: 'Inventaire automatisé',
      description: 'Maintenez un inventaire à jour avec découverte automatique.',
      color: 'from-indigo-500 to-blue-400'
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: 'Configuration à distance',
      description: 'Configurez et personnalisez les paramètres de vos appareils à distance.',
      color: 'from-teal-500 to-cyan-400'
    },
    {
      icon: <Tablet className="h-8 w-8" />,
      title: 'Application mobile',
      description: "Accédez à votre tableau de bord depuis n'importe où.",
      color: 'from-pink-500 to-rose-400'
    },
    {
      icon: <Server className="h-8 w-8" />,
      title: 'Surveillance réseau',
      description: "Surveillez les performances de votre réseau et optimisez le trafic.",
      color: 'from-yellow-500 to-orange-400'
    }
  ]

  // const dashboardFeatures = [
  //   "Vue d'ensemble en temps réel",
  //   'Tableaux de bord personnalisables',
  //   'Alertes et notifications',
  //   'Rapports détaillés',
  //   'Accès mobile'
  // ]

  return (
    <div className="w-full bg-black text-white overflow-hidden">
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

      {/* Hero Section */}
      <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900 flex items-center overflow-hidden">
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
        
        <div className="container mx-auto px-4 z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div 
              className="opacity-0 transform translate-y-10 transition-all duration-1000 ease-out"
              style={{ 
                opacity: visibleSections.has('hero') ? 1 : 0,
                transform: visibleSections.has('hero') ? 'translateY(0)' : 'translateY(40px)'
              }}
              data-animate
              id="hero"
            >
              <h1 className="text-6xl md:text-8xl font-black mb-8 bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent leading-tight">
                Fonctionnalités
                <span className="block text-blue-400">Révolutionnaires</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
                Découvrez comment GPIT transforme votre gestion IT avec des outils 
                <span className="text-blue-400 font-semibold"> puissants et intuitifs</span>
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                {/* <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-full hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
                  <span className="flex items-center justify-center gap-2">
                    <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Voir la démo
                  </span>
                </button> */}
                <button className="group px-8 py-4 bg-transparent border-2 border-white/20 text-white font-semibold rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm">
                  <span className="flex items-center justify-center gap-2">
                    Explorer les fonctionnalités
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Features */}
      <div className="py-32 bg-gradient-to-b from-black to-gray-900 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {mainFeatures.map((feature, index) => (
              <div 
                key={index}
                className={`opacity-0 transform translate-y-10 transition-all duration-1000 ease-out`}
                style={{ 
                  opacity: visibleSections.has(`feature-${index}`) ? 1 : 0,
                  transform: visibleSections.has(`feature-${index}`) ? 'translateY(0)' : 'translateY(40px)',
                  transitionDelay: `${index * 200}ms`
                }}
                data-animate
                id={`feature-${index}`}
              >
                <div className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-3xl p-8 hover:from-gray-800/60 hover:to-gray-700/40 transition-all duration-500 border border-gray-700/30 hover:border-gray-600/50">
                  <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className={`bg-gradient-to-br ${feature.gradient} rounded-2xl p-6 flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-2xl`}>
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold mb-4 group-hover:text-blue-400 transition-colors">
                        {feature.title}
                      </h2>
                      <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                        {feature.description}
                      </p>
                      <ul className="space-y-4">
                        {feature.features.map((item, idx) => (
                          <li 
                            key={idx} 
                            className="flex items-start group-hover:translate-x-2 transition-transform duration-300"
                            style={{ transitionDelay: `${idx * 50}ms` }}
                          >
                            <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-full p-1 mr-4 flex-shrink-0 mt-1">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-gray-200">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Features Grid */}
      <div className="py-32 bg-gradient-to-br from-gray-900 via-black to-blue-900 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
        
        <div className="container mx-auto px-4 relative">
          <div 
            className="text-center mb-20 opacity-0 transform translate-y-10 transition-all duration-1000 ease-out"
            style={{ 
              opacity: visibleSections.has('advanced-title') ? 1 : 0,
              transform: visibleSections.has('advanced-title') ? 'translateY(0)' : 'translateY(40px)'
            }}
            data-animate
            id="advanced-title"
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              Fonctionnalités Avancées
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Les outils qui font de GPIT la solution la plus complète 
              pour la gestion de votre parc informatique
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedFeatures.map((feature, index) => (
              <div 
                key={index}
                className={`opacity-0 transform translate-y-10 transition-all duration-700 ease-out`}
                style={{ 
                  opacity: visibleSections.has(`advanced-${index}`) ? 1 : 0,
                  transform: visibleSections.has(`advanced-${index}`) ? 'translateY(0)' : 'translateY(40px)',
                  transitionDelay: `${index * 100}ms`
                }}
                data-animate
                id={`advanced-${index}`}
              >
                <div className="group relative h-full bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl rounded-2xl p-8 hover:from-gray-800/90 hover:to-gray-700/50 transition-all duration-500 border border-gray-700/30 hover:border-gray-600/50 hover:scale-105">
                  <div className={`bg-gradient-to-br ${feature.color} rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard Preview */}
      {/* <div className="py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center opacity-0 transform translate-y-10 transition-all duration-1000 ease-out"
            style={{ 
              opacity: visibleSections.has('dashboard') ? 1 : 0,
              transform: visibleSections.has('dashboard') ? 'translateY(0)' : 'translateY(40px)'
            }}
            data-animate
            id="dashboard"
          >
            <div>
              <h2 className="text-5xl font-black mb-8 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                Tableau de bord intuitif
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Notre tableau de bord moderne vous donne une vue d'ensemble claire de votre infrastructure IT. 
                Personnalisez l'affichage selon vos besoins pour accéder rapidement aux informations critiques.
              </p>
              <ul className="space-y-6 mb-10">
                {dashboardFeatures.map((item, index) => (
                  <li key={index} className="flex items-start group">
                    <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-full p-1 mr-4 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg text-gray-200 group-hover:text-white transition-colors">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-full hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
                <span className="flex items-center justify-center gap-2">
                  Demander une démo
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Tableau de bord"
                className="relative rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-gray-700/50 group-hover:scale-110 transition-transform duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-green-500 animate-pulse" />
                  <span className="font-semibold text-white">
                    Tous les systèmes opérationnels
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-white/10 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
        
        <div 
          className="container mx-auto px-4 text-center relative z-10 opacity-0 transform translate-y-10 transition-all duration-1000 ease-out"
          style={{ 
            opacity: visibleSections.has('cta') ? 1 : 0,
            transform: visibleSections.has('cta') ? 'translateY(0)' : 'translateY(40px)'
          }}
          data-animate
          id="cta"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-8 text-white">
            Prêt à essayer GPIT ?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
            Commencez votre essai gratuit de 14 jours et découvrez comment GPIT 
            peut <span className="font-bold text-white">révolutionner</span> votre gestion IT.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button className="group px-10 py-5 bg-white text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-lg">
              <span className="flex items-center justify-center gap-2">
                Commencer l'essai gratuit
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            {/* <button className="group px-10 py-5 bg-transparent border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm text-lg">
              <span className="flex items-center justify-center gap-2">
                <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Voir une démo
              </span>
            </button> */}
          </div>
        </div>
      </div>
    </div>
  )
}