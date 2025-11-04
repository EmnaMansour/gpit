import { useState, useEffect } from 'react'
import { ArrowRight, Users, Monitor, AlertCircle, QrCode, FileText, MessageSquare, BarChart2, Server, Shield, Star, Mail, Phone, MapPin, Send } from 'lucide-react'

export function FeatureSection() {
  const [visibleSections, setVisibleSections] = useState(new Set())

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
    
    return () => observer.disconnect()
  }, [])

  const features = [
    {
      icon: Users,
      title: 'Authentification sécurisée',
      description: 'Connexion sécurisée avec gestion des rôles (Administrateur, Technicien, Employé) et attribution de droits personnalisés.',
      color: 'from-blue-500 to-cyan-400'
    },
    {
      icon: Monitor,
      title: 'Gestion des équipements',
      description: "Ajout, mise à jour et suivi complet des équipements avec affectation aux utilisateurs et états (disponible, en panne, maintenance).",
      color: 'from-green-500 to-emerald-400'
    },
    {
      icon: AlertCircle,
      title: 'Gestion des incidents',
      description: "Déclaration, attribution et suivi des tickets d'incidents avec système de notification automatique aux techniciens.",
      color: 'from-purple-500 to-violet-400'
    },
    {
      icon: BarChart2,
      title: 'Tableau de bord',
      description: "Visualisation synthétique avec graphiques et statistiques en temps réel pour tous les acteurs selon leurs droits.",
      color: 'from-orange-500 to-amber-400'
    },
    {
      icon: FileText,
      title: 'Rapports et export PDF',
      description: "Génération de rapports détaillés sur les équipements et incidents avec exportation PDF pour archivage.",
      color: 'from-indigo-500 to-blue-400'
    },
    {
      icon: QrCode,
      title: 'QR Code intelligent',
      description: 'Génération automatique de QR codes pour chaque équipement permettant un accès rapide aux informations et historiques.',
      color: 'from-red-500 to-pink-400'
    },
    {
      icon: MessageSquare,
      title: 'Assistante IA intégrée',
      description: 'Chatbot intelligent pour aider les visiteurs dans la navigation et répondre aux questions fréquentes.',
      color: 'from-teal-500 to-cyan-400'
    },
    {
      icon: Shield,
      title: 'Notifications automatiques',
      description: "Système d'alertes pour les administrateurs lors des inscriptions et des déclarations d'incidents importantes.",
      color: 'from-pink-500 to-rose-400'
    }
  ]

  return (
    <div className="py-32 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4">
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
            Tous les outils nécessaires pour une gestion efficace de votre parc informatique
          </p>
        </div>

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