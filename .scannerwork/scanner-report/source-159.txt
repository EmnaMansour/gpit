import React, { useState, useEffect } from 'react'
import { HelpCircle, MapPin, Plus, Minus, Mail, Phone, MessageSquare, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'
// Service contact corrigé pour React
const sendContactMessage = async (formData: {
  name: string;
  email: string;
  company: string;
  message: string;
}) => {
  console.log('📨 Envoi des données:', formData);
  
  try {
    // Configuration de l'URL API
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const url = `${API_BASE}/api/contacts`; // Note: /contacts pas /contact
    
    console.log('🌐 URL de la requête:', url);
    
  
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    console.log('📡 Status de la réponse:', response.status, response.statusText);

    const data = await response.json();
    console.log('📬 Données reçues:', data);

    if (!response.ok) {
      throw new Error(data.message || `Erreur HTTP: ${response.status}`);
    }

    return {
      success: true,
      message: data.message || 'Message envoyé avec succès',
      data: data.data
    };
    
  } catch (error) {
    console.error('❌ Erreur complète:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        message: 'Erreur de réseau. Vérifiez que le serveur backend est démarré sur http://localhost:8000'
      };
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'envoi'
    };
  }
};

export default function Contact() {
  const [visibleSections, setVisibleSections] = useState(new Set())
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' })
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  })

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

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Fonction handleSubmit corrigée
  const handleSubmit = async () => {
    console.log('📤 Début de l\'envoi du formulaire...');
    
    // Validation des champs requis
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus({
        type: 'error',
        message: 'Veuillez remplir tous les champs obligatoires (*)'
      });
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus({
        type: 'error',
        message: 'Veuillez entrer une adresse email valide'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      console.log('📨 Données envoyées:', formData);
      
      const result = await sendContactMessage(formData);
      console.log('✅ Réponse serveur:', result);

      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: result.message || 'Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.'
        });
        
        // Réinitialiser le formulaire
        setFormData({
          name: '',
          email: '',
          company: '',
          message: ''
        });
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.message || 'Erreur lors de l\'envoi du message. Veuillez réessayer.'
        });
      }
    } catch (error) {
      console.error('🚨 Erreur lors de l\'envoi:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqData = [
    {
      question: "Comment fonctionne l'essai gratuit ?",
      answer: "Notre essai gratuit vous donne accès à toutes les fonctionnalités de la plateforme pendant 14 jours, sans engagement. Vous pouvez connecter jusqu'à 10 appareils pendant cette période pour tester pleinement les capacités de GPIT."
    },
    {
      question: "Combien d'appareils puis-je surveiller ?",
      answer: "Le nombre d'appareils que vous pouvez surveiller dépend du plan que vous choisissez. Notre plan Essentiel permet de surveiller jusqu'à 25 appareils, le plan Professionnel jusqu'à 100 appareils, et notre plan Entreprise offre une capacité illimitée."
    },
    {
      question: "Quels types d'appareils puis-je surveiller ?",
      answer: "GPIT prend en charge une large gamme d'appareils, y compris les ordinateurs Windows, Mac et Linux, les serveurs, les équipements réseau, les imprimantes et certains appareils IoT. Contactez-nous pour vérifier la compatibilité avec vos équipements spécifiques."
    },
    {
      question: "La plateforme est-elle sécurisée ?",
      answer: "Absolument. La sécurité est notre priorité. Toutes les données sont chiffrées en transit et au repos, et nous utilisons l'authentification multifacteur. Nos centres de données sont certifiés ISO 27001 et nous effectuons des audits de sécurité réguliers."
    },
    {
      question: "Puis-je intégrer GPIT avec mes outils existants ?",
      answer: "Oui, GPIT s'intègre avec de nombreux outils tiers, notamment les systèmes de ticketing comme Zendesk et ServiceNow, les outils de communication comme Slack et Microsoft Teams, et diverses solutions de sécurité et de gestion IT."
    },
    {
      question: "Quel type de support est inclus ?",
      answer: "Tous nos plans incluent un support par email. Les plans Professionnel et Entreprise bénéficient d'un support prioritaire, et le plan Entreprise inclut un support 24/7 ainsi qu'un gestionnaire de compte dédié."
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
                Contactez-nous
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
                Notre équipe dédiée est là pour vous guider vers la solution parfaite. 
                <span className="text-blue-400 font-semibold"> Posez vos questions</span> et transformez vos besoins en réalité
              </p>
              <button 
                onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-full hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
              >
                <span className="flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Discutons de votre projet
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div id="contact-form" className="py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div 
            className="opacity-0 transform translate-y-10 transition-all duration-1000 ease-out"
            style={{ 
              opacity: visibleSections.has('form-section') ? 1 : 0,
              transform: visibleSections.has('form-section') ? 'translateY(0)' : 'translateY(40px)'
            }}
            data-animate
            id="form-section"
          >
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                Prenez contact dès maintenant
              </h2>
              <p className="text-xl text-gray-400">
                Remplissez le formulaire ci-dessous pour une réponse rapide
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              {/* Messages de statut */}
              {submitStatus.type && (
                <div className={`mb-6 p-4 rounded-xl border ${
                  submitStatus.type === 'success' 
                    ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                    : 'bg-red-500/10 border-red-500/50 text-red-400'
                }`}>
                  <div className="flex items-center gap-3">
                    {submitStatus.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <p className="text-sm font-medium">{submitStatus.message}</p>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Votre nom complet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Nom de votre entreprise"
                  />
                </div>
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Parlez-nous de votre projet et de vos besoins..."
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`group w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        Envoyer le message
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
                
                {/* Informations de débogage (visible seulement en développement) */}
                {/* {import.meta.env.DEV && (
                  <div className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-600/50">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Debug Info:</h4>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>• API URL: {import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}</p>
                      <p>• Mode: {import.meta.env.MODE}</p>
                      <p>• Submitting: {isSubmitting ? 'Oui' : 'Non'}</p>
                      <p>• Champs remplis: {Object.values(formData).filter(Boolean).length}/4</p>
                    </div>
                  </div>
                )} */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-32 bg-gradient-to-br from-gray-900 via-black to-blue-900 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
        
        <div className="container mx-auto px-4 relative">
          <div 
            className="text-center mb-20 opacity-0 transform translate-y-10 transition-all duration-1000 ease-out"
            style={{ 
              opacity: visibleSections.has('faq-title') ? 1 : 0,
              transform: visibleSections.has('faq-title') ? 'translateY(0)' : 'translateY(40px)'
            }}
            data-animate
            id="faq-title"
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              Questions Fréquentes
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto flex items-center justify-center gap-2">
              Des réponses claires à vos interrogations les plus courantes
              <HelpCircle className="text-blue-400 animate-pulse" />
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqData.map((faq, index) => (
              <div 
                key={index}
                className={`opacity-0 transform translate-y-10 transition-all duration-700 ease-out`}
                style={{ 
                  opacity: visibleSections.has(`faq-${index}`) ? 1 : 0,
                  transform: visibleSections.has(`faq-${index}`) ? 'translateY(0)' : 'translateY(40px)',
                  transitionDelay: `${index * 100}ms`
                }}
                data-animate
                id={`faq-${index}`}
              >
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-800/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <h3 className="text-lg font-semibold text-white flex-1 pr-4">
                      {faq.question}
                    </h3>
                    <div 
                      className="text-blue-400 text-xl transition-transform duration-300"
                      style={{ transform: openFaq === index ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      {openFaq === index ? <Minus /> : <Plus />}
                    </div>
                  </button>
                  
                  <div 
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ 
                      maxHeight: openFaq === index ? '200px' : '0px',
                      opacity: openFaq === index ? 1 : 0
                    }}
                  >
                    <div className="px-6 pb-6 bg-gray-800/10">
                      <p className="text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div 
            className="opacity-0 transform translate-y-10 transition-all duration-1000 ease-out"
            style={{ 
              opacity: visibleSections.has('map-section') ? 1 : 0,
              transform: visibleSections.has('map-section') ? 'translateY(0)' : 'translateY(40px)'
            }}
            data-animate
            id="map-section"
          >
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                Nos Bureaux
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto flex items-center justify-center gap-2">
                Trouvez-nous facilement pour une rencontre en personne
                <MapPin className="text-blue-400 animate-bounce" />
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/30">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="text-6xl text-blue-400 mx-auto mb-4 animate-bounce" />
                    <p className="text-lg font-semibold mb-2">Carte interactive</p>
                    <p className="text-blue-400 font-medium">Sousse, Tunisie - 4000</p>
                    <p className="text-sm text-gray-400 mt-2">Intégration Google Maps disponible</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 hover:scale-105">
                  <MapPin className="text-3xl text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-gray-300 font-medium">Adresse</p>
                  <p className="text-white text-sm">123 Rue de la Paix</p>
                  <p className="text-white text-sm">Sousse, Tunisie</p>
                </div>
                <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 hover:scale-105">
                  <Phone className="text-3xl text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-gray-300 font-medium">Téléphone</p>
                  <p className="text-white">+216 12 345 678</p>
                </div>
                <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 hover:scale-105">
                  <Mail className="text-3xl text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-gray-300 font-medium">Email</p>
                  <p className="text-white">contact@GPIT.tn</p>
                </div>
              </div>
            </div>
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
            Prêt à démarrer ?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
            Lancez votre transformation IT dès aujourd'hui avec GPIT et 
            <span className="font-bold text-white"> révolutionnez</span> votre gestion informatique
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button className="group px-10 py-5 bg-white text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-lg">
              <span className="flex items-center justify-center gap-2">
                Commencer l'essai gratuit
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Debug Section (masqué en production) */}
      {/* {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg border border-gray-700 text-xs max-w-xs">
          <h4 className="font-bold mb-2">Debug Info:</h4>
          <div className="space-y-1">
            <p>• API URL: {import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}</p>
            <p>• Mode: {import.meta.env.MODE}</p>
            <p>• Submitting: {isSubmitting ? 'Oui' : 'Non'}</p>
          </div>
        </div>
      )} */}
    </div>
  )
}