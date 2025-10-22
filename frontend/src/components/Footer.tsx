import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ArrowUpRight
} from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white overflow-hidden">
      {/* Effets de fond animés */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Grille de points décorative */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>

      <div className="relative container mx-auto px-6 pt-20 pb-8">
        {/* Section principale */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Colonne Logo et Description */}
          <div className="lg:col-span-5">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50"></div>
                
                </div>
                <span className="text-4xl font-black bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
                  GPIT
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed text-base mb-6">
                Solution complète de surveillance et gestion de parc informatique via le cloud. 
                <span className="block mt-2 text-blue-300 font-medium">
                  Sécurisez, optimisez et contrôlez votre infrastructure IT en temps réel.
                </span>
              </p>
            </div>

            {/* Informations de contact */}
            <div className="space-y-3 mb-8">
              <a href="mailto:contact@gpit.com" className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition-colors group">
                <div className="bg-blue-900/30 p-2 rounded-lg group-hover:bg-blue-600/30 transition-all">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="text-sm">contact@gpit.com</span>
              </a>
              <a href="tel:+33123456789" className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition-colors group">
                <div className="bg-blue-900/30 p-2 rounded-lg group-hover:bg-blue-600/30 transition-all">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="text-sm">+216 23 45 67 89</span>
              </a>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="bg-blue-900/30 p-2 rounded-lg">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="text-sm">Tunis, sousse</span>
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div>
              <p className="text-sm text-gray-400 mb-3 font-medium">Suivez-nous</p>
              <div className="flex space-x-3">
                {[
                  { icon: Facebook, href: "#", color: "hover:bg-blue-600" },
                  { icon: Twitter, href: "#", color: "hover:bg-sky-500" },
                  { icon: Instagram, href: "#", color: "hover:bg-pink-600" },
                  { icon: Linkedin, href: "#", color: "hover:bg-blue-700" }
                ].map(({ icon: Icon, href, color }, index) => (
                  <a
                    key={index}
                    href={href}
                    className={`bg-white/5 backdrop-blur-sm p-3 rounded-xl text-gray-300 hover:text-white ${color} transition-all duration-300 hover:scale-110 hover:-translate-y-1 border border-white/10 hover:border-transparent shadow-lg hover:shadow-xl`}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Colonnes de liens */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            
            {/* Colonne Produit */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-white relative inline-block">
                Produit
                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-transparent rounded-full"></div>
              </h3>
              <ul className="space-y-3">
                {[
                  { label: "Fonctionnalités" },
                  { label: "Tarifs" },
                  { label: "Témoignages" },
                  { label: "Guide d'utilisation" },
                  { label: "Mises à jour" }
                ].map((item, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group text-sm"
                    >
                      <ArrowUpRight className="h-0 w-0 group-hover:h-4 group-hover:w-4 mr-0 group-hover:mr-1 transition-all duration-300 opacity-0 group-hover:opacity-100" />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colonne Entreprise */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-white relative inline-block">
                Entreprise
                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-transparent rounded-full"></div>
              </h3>
              <ul className="space-y-3">
                {[
                  { label: "À propos" },
                  { label: "Carrières" },
                  { label: "Contact" },
                  { label: "Partenaires" },
                  { label: "Blog" }
                ].map((item, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group text-sm"
                    >
                      <ArrowUpRight className="h-0 w-0 group-hover:h-4 group-hover:w-4 mr-0 group-hover:mr-1 transition-all duration-300 opacity-0 group-hover:opacity-100" />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colonne Support */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-white relative inline-block">
                Support
                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-transparent rounded-full"></div>
              </h3>
              <ul className="space-y-3">
                {[
                  { label: "Centre d'aide" },
                  { label: "Documentation" },
                  { label: "Status" },
                  { label: "API" },
                  { label: "Communauté" }
                ].map((item, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group text-sm"
                    >
                      <ArrowUpRight className="h-0 w-0 group-hover:h-4 group-hover:w-4 mr-0 group-hover:mr-1 transition-all duration-300 opacity-0 group-hover:opacity-100" />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        {/* <div className="border-t border-white/10 pt-12 pb-8 mb-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Restez informé
            </h3>
            <p className="text-gray-400 mb-6">Recevez les dernières actualités et mises à jour de GPIT</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="votre@email.com"
                className="flex-1 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50">
                S'abonner
              </button>
            </div>
          </div>
        </div> */}

        {/* Section Copyright */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 <span className="text-blue-400 font-semibold">GPIT</span>. Tous droits réservés.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { label: "Conditions d'utilisation" },
                { label: "Politique de confidentialité" },
                { label: "Cookies" }
              ].map((item, index) => (
                <a
                  key={index}
                  href="#"
                  className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-300 relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}