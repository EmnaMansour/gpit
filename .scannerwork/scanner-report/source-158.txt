import { useState, useEffect } from 'react'
import { Users, Award, BarChart2, Globe, Target, Heart, Lightbulb, Shield, Handshake, Star,Play } from 'lucide-react'

export function About() {
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

  const stats = [
    {
      icon: <Users className="h-10 w-10" />,
      value: '1000+',
      label: 'Clients satisfaits',
      color: 'from-blue-500 to-cyan-400'
    },
    {
      icon: <Globe className="h-10 w-10" />,
      value: '30+',
      label: 'Pays',
      color: 'from-green-500 to-emerald-400'
    },
    {
      icon: <BarChart2 className="h-10 w-10" />,
      value: '5M+',
      label: 'Appareils surveillés',
      color: 'from-purple-500 to-violet-400'
    },
    {
      icon: <Award className="h-10 w-10" />,
      value: '99.9%',
      label: 'Disponibilité',
      color: 'from-orange-500 to-amber-400'
    }
  ]

  const teamMembers = [
    {
      name: 'Jean Dupont',
      position: 'Fondateur & CEO',
      bio: "Plus de 15 ans d'expérience dans la gestion d'infrastructures IT. Passionné par l'innovation technologique.",
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      name: 'Marie Laurent',
      position: 'CTO',
      bio: 'Experte en architecture cloud et développement logiciel. Anciennement chez Microsoft et AWS.',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      name: 'Thomas Bernard',
      position: 'Directeur Commercial',
      bio: 'Spécialiste des ventes B2B avec une expérience dans les solutions SaaS pour entreprises.',
      image: 'https://randomuser.me/api/portraits/men/62.jpg',
      gradient: 'from-green-600 to-teal-600'
    },
    {
      name: 'Sophie Moreau',
      position: 'Directrice Produit',
      bio: "Passionnée par l'expérience utilisateur et l'innovation produit dans le secteur IT.",
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
      gradient: 'from-orange-600 to-red-600'
    },
    {
      name: 'Pierre Martin',
      position: 'Directeur des Opérations',
      bio: "Expert en optimisation des processus et en gestion d'équipes techniques internationales.",
      image: 'https://randomuser.me/api/portraits/men/41.jpg',
      gradient: 'from-indigo-600 to-blue-600'
    },
    {
      name: 'Julie Petit',
      position: 'Responsable Support Client',
      bio: 'Dévouée à fournir une expérience client exceptionnelle et des solutions rapides aux problèmes.',
      image: 'https://randomuser.me/api/portraits/women/33.jpg',
      gradient: 'from-pink-600 to-rose-600'
    }
  ]

  const values = [
    {
      icon: <Lightbulb className="h-8 w-8" />,
      title: 'Innovation',
      description: 'Nous repoussons constamment les limites de ce qui est possible pour offrir des solutions toujours plus performantes.',
      color: 'from-yellow-500 to-orange-400'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Fiabilité',
      description: 'Nos clients dépendent de nous pour gérer leurs infrastructures critiques. Nous prenons cette responsabilité très au sérieux.',
      color: 'from-green-500 to-emerald-400'
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Simplicité',
      description: 'Nous croyons que les meilleures solutions sont celles qui sont faciles à utiliser, même pour les tâches complexes.',
      color: 'from-blue-500 to-cyan-400'
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Transparence',
      description: 'Nous communiquons ouvertement avec nos clients et partenaires, en partageant à la fois nos succès et nos défis.',
      color: 'from-red-500 to-pink-400'
    },
    {
      icon: <Handshake className="h-8 w-8" />,
      title: 'Collaboration',
      description: 'Nous travaillons en étroite collaboration avec nos clients pour comprendre leurs besoins et développer des solutions adaptées.',
      color: 'from-purple-500 to-violet-400'
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: 'Excellence',
      description: "Nous visons l'excellence dans tout ce que nous faisons, de la qualité de notre code à notre service client.",
      color: 'from-indigo-500 to-blue-400'
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
        {/* Animated background */}
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
                À propos de
                <span className="block text-blue-400">GPIT</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
                Nous aidons les professionnels IT à 
                <span className="text-blue-400 font-semibold"> surveiller, gérer et optimiser</span>
                <br />leur infrastructure informatique
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center opacity-0 transform translate-y-10 transition-all duration-1000 ease-out"
            style={{ 
              opacity: visibleSections.has('mission') ? 1 : 0,
              transform: visibleSections.has('mission') ? 'translateY(0)' : 'translateY(40px)'
            }}
            data-animate
            id="mission"
          >
            <div>
              <h2 className="text-5xl font-black mb-8 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                Notre mission
              </h2>
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                <p>
                  Chez GPIT, notre mission est de <span className="text-blue-400 font-semibold">simplifier la gestion</span> des infrastructures informatiques pour les professionnels IT. Nous croyons que la technologie devrait être un facilitateur et non un obstacle pour les entreprises.
                </p>
                <p>
                  Fondée en 2015 par une équipe d'experts en IT, GPIT est née de la frustration face aux solutions de surveillance existantes qui étaient soit <span className="text-blue-400 font-semibold">trop complexes, soit trop limitées</span>.
                </p>
                <p>
                  Aujourd'hui, nous servons plus de <span className="text-blue-400 font-semibold">1000 entreprises dans 30 pays</span>, aidant les équipes IT à gagner du temps, à réduire les coûts et à améliorer la fiabilité de leurs systèmes.
                </p>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Notre équipe"
                className="relative rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute -bottom-8 -right-8 bg-gradient-to-br from-blue-600 to-blue-500 text-white p-8 rounded-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <p className="text-3xl font-black">8+ ans</p>
                <p className="text-blue-100">d'excellence</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-32 bg-gradient-to-br from-gray-900 via-black to-blue-900 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
        
        <div className="container mx-auto px-4 relative">
          <div 
            className="text-center mb-20 opacity-0 transform translate-y-10 transition-all duration-1000 ease-out"
            style={{ 
              opacity: visibleSections.has('stats-title') ? 1 : 0,
              transform: visibleSections.has('stats-title') ? 'translateY(0)' : 'translateY(40px)'
            }}
            data-animate
            id="stats-title"
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              Nos Chiffres Clés
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Des résultats qui témoignent de notre engagement envers l'excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`opacity-0 transform translate-y-10 transition-all duration-700 ease-out`}
                style={{ 
                  opacity: visibleSections.has(`stat-${index}`) ? 1 : 0,
                  transform: visibleSections.has(`stat-${index}`) ? 'translateY(0)' : 'translateY(40px)',
                  transitionDelay: `${index * 150}ms`
                }}
                data-animate
                id={`stat-${index}`}
              >
                <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl rounded-2xl p-8 text-center hover:from-gray-800/90 hover:to-gray-700/50 transition-all duration-500 border border-gray-700/30 hover:border-gray-600/50 hover:scale-105">
                  <div className={`bg-gradient-to-br ${stat.color} rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                    <div className="text-white">
                      {stat.icon}
                    </div>
                  </div>
                  <p className="text-4xl font-black text-white mb-3 group-hover:text-blue-400 transition-colors">
                    {stat.value}
                  </p>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors font-medium">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div 
            className="text-center mb-20 opacity-0 transform translate-y-10 transition-all duration-1000 ease-out"
            style={{ 
              opacity: visibleSections.has('team-title') ? 1 : 0,
              transform: visibleSections.has('team-title') ? 'translateY(0)' : 'translateY(40px)'
            }}
            data-animate
            id="team-title"
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              Notre Équipe de Direction
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Des experts passionnés par la technologie et déterminés à résoudre 
              les défis informatiques des entreprises
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div 
                key={index}
                className={`opacity-0 transform translate-y-10 transition-all duration-700 ease-out`}
                style={{ 
                  opacity: visibleSections.has(`member-${index}`) ? 1 : 0,
                  transform: visibleSections.has(`member-${index}`) ? 'translateY(0)' : 'translateY(40px)',
                  transitionDelay: `${index * 100}ms`
                }}
                data-animate
                id={`member-${index}`}
              >
                <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl rounded-3xl overflow-hidden hover:from-gray-800/90 hover:to-gray-700/50 transition-all duration-500 border border-gray-700/30 hover:border-gray-600/50 hover:scale-105">
                  <div className="relative overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-80 object-cover object-center group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${member.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-blue-400 font-semibold mb-4 text-lg">
                      {member.position}
                    </p>
                    <p className="text-gray-300 group-hover:text-gray-200 transition-colors leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-32 bg-gradient-to-br from-gray-900 via-black to-blue-900 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
        
        <div className="container mx-auto px-4 relative">
          <div 
            className="text-center mb-20 opacity-0 transform translate-y-10 transition-all duration-1000 ease-out"
            style={{ 
              opacity: visibleSections.has('values-title') ? 1 : 0,
              transform: visibleSections.has('values-title') ? 'translateY(0)' : 'translateY(40px)'
            }}
            data-animate
            id="values-title"
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              Nos Valeurs
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Les principes qui guident nos décisions et façonnent notre culture d'entreprise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className={`opacity-0 transform translate-y-10 transition-all duration-700 ease-out`}
                style={{ 
                  opacity: visibleSections.has(`value-${index}`) ? 1 : 0,
                  transform: visibleSections.has(`value-${index}`) ? 'translateY(0)' : 'translateY(40px)',
                  transitionDelay: `${index * 100}ms`
                }}
                data-animate
                id={`value-${index}`}
              >
                <div className="group h-full bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl rounded-2xl p-8 hover:from-gray-800/90 hover:to-gray-700/50 transition-all duration-500 border border-gray-700/30 hover:border-gray-600/50 hover:scale-105">
                  <div className={`bg-gradient-to-br ${value.color} rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                    <div className="text-white">
                      {value.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-gray-300 group-hover:text-gray-200 transition-colors leading-relaxed">
                    {value.description}
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
          {[...Array(20)].map((_, i) => (
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
            Prêt à transformer votre gestion IT ?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
            Rejoignez les entreprises qui font confiance à GPIT pour 
            <span className="font-bold text-white"> optimiser leur infrastructure</span> informatique.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            {/* <button className="group px-10 py-5 bg-white text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-lg">
              <span className="flex items-center justify-center gap-2">
                Commencer l'essai gratuit
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </button> */}
            <button className="group px-10 py-5 bg-transparent border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm text-lg">
              <span className="flex items-center justify-center gap-2">
                <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Nous contacter
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}