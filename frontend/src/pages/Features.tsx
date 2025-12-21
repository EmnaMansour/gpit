import { useState, useEffect } from 'react'
import {
  Monitor,
  Users,
  AlertCircle,
  Shield,
  BarChart2,
  QrCode,
  FileText,
  Bell,
  Database,
  Settings,
  MessageSquare,
  Lock,
  Check,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'

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
      icon: <Users className="h-12 w-12" />,
      title: "Gestion des utilisateurs",
      description: "Système complet de gestion des utilisateurs avec authentification sécurisée et attribution de rôles.",
      features: [
        'Authentification sécurisée (connexion/déconnexion)',
        'Création, modification et suppression de comptes',
        'Attribution de rôles (Administrateur, Technicien, Employé)',
        'Gestion des droits et privilèges',
        'Notification automatique à l\'administrateur lors des inscriptions'
      ],
      gradient: "from-blue-600 to-cyan-500"
    },
    {
      icon: <Monitor className="h-12 w-12" />,
      title: "Gestion des équipements",
      description: "Gérez l'ensemble de votre parc informatique avec suivi en temps réel et affectation automatisée.",
      features: [
        'Ajout, mise à jour et suppression d\'équipements',
        'Affectation d\'équipements aux utilisateurs',
        'Suivi des états (disponible, en panne, maintenance)',
        'Génération automatique de QR codes',
        'Historique complet de maintenance'
      ],
      gradient: "from-purple-600 to-pink-500"
    },
    {
      icon: <AlertCircle className="h-12 w-12" />,
      title: "Gestion des incidents",
      description: "Système de tickets pour la déclaration et le suivi des incidents avec attribution automatique.",
      features: [
        'Déclaration d\'incidents par les employés',
        'Attribution automatique ou manuelle aux techniciens',
        'Suivi de l\'évolution (ouvert, en cours, résolu)',
        'Système de notifications en temps réel',
        'Historique complet des interventions'
      ],
      gradient: "from-green-600 to-teal-500"
    },
    {
      icon: <BarChart2 className="h-12 w-12" />,
      title: "Tableau de bord",
      description: "Visualisation synthétique avec graphiques et statistiques en temps réel pour tous les acteurs.",
      features: [
        'Vue d\'ensemble globale du parc',
        'Graphiques et statistiques dynamiques',
        'Filtres personnalisables',
        'Indicateurs de performance (KPI)',
        'Accès selon les droits utilisateur'
      ],
      gradient: "from-orange-600 to-red-500"
    }
  ]

  const advancedFeatures = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: 'Rapports et export PDF',
      description: "Génération de rapports détaillés avec exportation PDF pour archivage et partage.",
      color: 'from-blue-500 to-cyan-400'
    },
    {
      icon: <QrCode className="h-8 w-8" />,
      title: 'QR Code intelligent',
      description: 'Génération et consultation rapide via QR code pour chaque équipement.',
      color: 'from-green-500 to-emerald-400'
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: 'Assistante IA intégrée',
      description: 'Chatbot intelligent pour guider les utilisateurs et répondre aux questions.',
      color: 'from-purple-500 to-violet-400'
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: 'Notifications automatiques',
      description: "Système d'alertes pour les administrateurs sur les événements importants.",
      color: 'from-orange-500 to-amber-400'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Sécurité renforcée',
      description: 'Authentification sécurisée avec gestion des sessions et droits d\'accès.',
      color: 'from-red-500 to-pink-400'
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: 'Base de données centralisée',
      description: 'Stockage sécurisé et organisé de toutes les données du parc.',
      color: 'from-indigo-500 to-blue-400'
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: 'Configuration flexible',
      description: 'Personnalisez la plateforme selon vos besoins spécifiques.',
      color: 'from-teal-500 to-cyan-400'
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: 'Gestion des permissions',
      description: "Contrôle précis des droits d'accès pour chaque utilisateur.",
      color: 'from-pink-500 to-rose-400'
    },
    {
      icon: <BarChart2 className="h-8 w-8" />,
      title: 'Analytiques avancées',
      description: "Suivez les performances et l'utilisation avec des métriques détaillées.",
      color: 'from-yellow-500 to-orange-400'
    }
  ]

  const userRoles = [
    {
      title: 'Administrateur',
      description: 'Contrôle total sur la plateforme',
      features: [
        'Création et gestion des utilisateurs',
        'Attribution des rôles et permissions',
        'Gestion complète des équipements',
        'Attribution des incidents aux techniciens',
        'Génération de rapports complets',
        'Accès à toutes les fonctionnalités'
      ],
      color: 'from-blue-600 to-cyan-500'
    },
    {
      title: 'Technicien',
      description: 'Gestion des incidents et maintenance',
      features: [
        'Consultation des équipements',
        'Mise à jour des états d\'équipements',
        'Traitement des tickets d\'incidents',
        'Modification du statut des incidents',
        'Génération de rapports techniques',
        'Accès aux QR codes'
      ],
      color: 'from-purple-600 to-pink-500'
    },
    {
      title: 'Employé',
      description: 'Consultation et déclaration',
      features: [
        'Consultation des équipements affectés',
        'Déclaration d\'incidents',
        'Suivi des tickets personnels',
        'Consultation des états',
        'Scan de QR codes',
        'Accès au support via chatbot'
      ],
      color: 'from-green-600 to-teal-500'
    }
  ]

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
                <span className="block text-blue-400">Complètes</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
                Tous les outils nécessaires pour une 
                <span className="text-blue-400 font-semibold"> gestion optimale</span> de votre parc informatique
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <button className="group px-8 py-4 bg-transparent border-2 border-white/20 text-white font-semibold rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm">
                  <span className="flex items-center justify-center gap-2">
                    Découvrir
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

      {/* User Roles Section */}
      <div className="py-32 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div 
            className="text-center mb-20 opacity-0 transform translate-y-10 transition-all duration-1000 ease-out"
            style={{ 
              opacity: visibleSections.has('roles-title') ? 1 : 0,
              transform: visibleSections.has('roles-title') ? 'translateY(0)' : 'translateY(40px)'
            }}
            data-animate
            id="roles-title"
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              Rôles et Permissions
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Chaque utilisateur dispose de droits adaptés à son rôle dans l'organisation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {userRoles.map((role, index) => (
              <div 
                key={index}
                className={`opacity-0 transform translate-y-10 transition-all duration-700 ease-out`}
                style={{ 
                  opacity: visibleSections.has(`role-${index}`) ? 1 : 0,
                  transform: visibleSections.has(`role-${index}`) ? 'translateY(0)' : 'translateY(40px)',
                  transitionDelay: `${index * 150}ms`
                }}
                data-animate
                id={`role-${index}`}
              >
                <div className="group h-full bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl rounded-3xl p-8 hover:from-gray-800/90 hover:to-gray-700/50 transition-all duration-500 border border-gray-700/30 hover:border-gray-600/50 hover:scale-105">
                  <div className={`bg-gradient-to-br ${role.color} rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors">
                    {role.title}
                  </h3>
                  <p className="text-gray-400 mb-6 text-sm">
                    {role.description}
                  </p>
                  <ul className="space-y-3">
                    {role.features.map((feature, idx) => (
                      <li 
                        key={idx}
                        className="flex items-start text-sm"
                      >
                        <Check className="h-4 w-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
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
              Fonctionnalités Additionnelles
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Des outils supplémentaires pour optimiser votre gestion IT
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
            Prêt à découvrir GPIT ?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
            Contactez-nous pour une démonstration personnalisée et découvrez comment GPIT 
            peut <span className="font-bold text-white">transformer</span> votre gestion IT.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/contact">
            <button className="group px-10 py-5 bg-white text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-lg">
              <span className="flex items-center justify-center gap-2">
                Nous contacter
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}