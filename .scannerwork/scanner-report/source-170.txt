import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart, 
  AlertCircle, 
  Monitor, 
  RefreshCw,
  XIcon,
  CheckCircleIcon,
  AlertTriangleIcon
} from 'lucide-react';

const Reports = () => {
  const [reportType, setReportType] = useState('incidents');
  const [dateRange, setDateRange] = useState('month');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Fonction utilitaire pour récupérer le token
  const getAuthToken = () => {
    // Vérifier plusieurs clés possibles dans localStorage
    const possibleKeys = ['token', 'authToken', 'accessToken', 'jwt', 'Token'];
    
    for (const key of possibleKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        console.log(`Token trouvé avec la clé: ${key}`);
        return token;
      }
    }
    
    // Vérifier aussi sessionStorage
    for (const key of possibleKeys) {
      const token = sessionStorage.getItem(key);
      if (token) {
        console.log(`Token trouvé dans sessionStorage avec la clé: ${key}`);
        return token;
      }
    }
    
    return null;
  };

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Récupérer le token avec la fonction utilitaire
      const token = getAuthToken();
      
      console.log('Token récupéré:', token ? 'Oui' : 'Non');
      console.log('Type de rapport:', reportType);
      console.log('Période:', dateRange);
      
      if (!token) {
        // Afficher toutes les clés du localStorage pour debug
        console.log('Clés disponibles dans localStorage:', Object.keys(localStorage));
        setError("Vous devez être connecté pour générer un rapport. Veuillez vous reconnecter.");
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportType,
          dateRange
        })
      });

      console.log('Status de la réponse:', response.status);
      console.log('Content-Type:', response.headers.get('Content-Type'));

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('Erreur du serveur:', errorData);
        } catch (e) {
          const text = await response.text();
          console.error('Réponse brute:', text);
        }
        
        throw new Error(errorMessage);
      }

      // Vérifier le type de contenu de la réponse
      const contentType = response.headers.get('Content-Type');
      
      if (contentType && contentType.includes('application/pdf')) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${reportType}_report_${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        // Nettoyage
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
        
        setSuccess(' Rapport généré et téléchargé avec succès !');
      } else {
        const data = await response.json();
        setSuccess(`Rapport généré: ${data.message || 'PDF créé'}`);
      }
      
    } catch (error) {
      console.error('Erreur complète:', error);

      let message = 'Une erreur inconnue est survenue.';
      if (error instanceof Error) {
        message = error.message;
      }

      if (message.includes('403') || message.includes('Forbidden')) {
        setError(" Vous n'avez pas les permissions nécessaires. Vérifiez votre rôle utilisateur.");
      } else if (message.includes('401') || message.includes('Unauthorized')) {
        setError(" Session expirée. Veuillez vous reconnecter.");
      } else if (message.includes('400')) {
        setError(" Paramètres invalides. Veuillez vérifier vos sélections.");
      } else if (message.includes('NetworkError') || message.includes('fetch')) {
        setError(" Erreur de connexion. Vérifiez que le serveur est accessible sur http://localhost:8000");
      } else {
        setError(` Erreur: ${message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const reportOptions = [
    {
      type: 'incidents',
      title: 'Rapport d\'incidents',
      description: 'Statistiques sur les incidents déclarés, leur résolution et leur durée moyenne de traitement.',
      icon: AlertCircle,
      gradient: 'from-red-500/20 to-orange-500/20',
      border: 'border-red-500/30',
      iconColor: 'text-red-400'
    },
    {
      type: 'equipment',
      title: 'Rapport d\'équipements',
      description: 'Inventaire des équipements, leur état, leur attribution et leur taux d\'utilisation.',
      icon: Monitor,
      gradient: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/30',
      iconColor: 'text-blue-400'
    },
  ];

  const dateRangeLabels: { [key: string]: string } = {
    week: 'Semaine dernière',
    month: 'Mois dernier',
    quarter: 'Trimestre dernier',
    year: 'Année dernière'
  };

  const selectedReport = reportOptions.find(opt => opt.type === reportType);

  return (
    <div className="min-h-screen bg-black text-white pt-20 px-6 relative overflow-hidden">
      {/* Animated cursor */}
      <div 
        className="fixed w-6 h-6 rounded-full bg-blue-500/20 pointer-events-none z-50 transition-transform duration-100 ease-out hidden md:block"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}
      />

      {/* Animated background */}
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

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
          <div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent mb-2">
              Rapports Analytics
            </h2>
            <p className="text-gray-400">
              Générez des rapports détaillés sur votre parc informatique
            </p>
          </div>
          
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <button
              onClick={() => {
                setError(null);
                setSuccess(null);
              }}
              className="flex items-center space-x-2 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl transition-all duration-200 border border-gray-600"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Réinitialiser</span>
            </button>
          </div>
        </div>

        {/* Messages d'alerte */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center animate-pulse">
            <AlertTriangleIcon className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-300 font-medium">Erreur</p>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-gray-400 hover:text-gray-300"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center animate-pulse">
            <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-green-300 font-medium">Succès</p>
              <p className="text-green-400 text-sm">{success}</p>
            </div>
            <button 
              onClick={() => setSuccess(null)}
              className="ml-auto text-gray-400 hover:text-gray-300"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Sélection du type de rapport */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {reportOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = reportType === option.type;
            
            return (
              <div
                key={option.type}
                className={`relative bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-xl rounded-2xl p-6 cursor-pointer transition-all duration-300 transform border-2 ${
                  isSelected 
                    ? `${option.gradient} ${option.border} scale-105 shadow-2xl` 
                    : 'border-gray-700/30 hover:scale-105 hover:shadow-2xl'
                } group overflow-hidden`}
                onClick={() => setReportType(option.type)}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${option.gradient.split('/')[0].replace('20', '500')} shadow-lg`}>
                      <IconComponent className={`h-6 w-6 ${option.iconColor}`} />
                    </div>
                    <h3 className={`text-xl font-semibold ${
                      isSelected ? 'text-white' : 'text-gray-300'
                    }`}>
                      {option.title}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {option.description}
                  </p>
                  
                  {isSelected && (
                    <div className="absolute top-4 right-4">
                      <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Configuration du rapport */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-gray-700/30">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-semibold text-white">
              Configuration du rapport
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-400" />
                Type de rapport
              </label>
              <div className="relative">
                <select 
                  value={reportType} 
                  onChange={(e) => setReportType(e.target.value)} 
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none"
                >
                  {reportOptions.map(option => (
                    <option key={option.type} value={option.type}>{option.title}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400 transform rotate-45"></div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-400" />
                Période d'analyse
              </label>
              <div className="relative">
                <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)} 
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none"
                >
                  <option value="week">Semaine dernière</option>
                  <option value="month">Mois dernier</option>
                  <option value="quarter">Trimestre dernier</option>
                  <option value="year">Année dernière</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400 transform rotate-45"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-700/50">
            <button 
              onClick={handleGenerateReport}
              disabled={isLoading}
              className={`relative overflow-hidden group w-full md:w-auto min-w-[200px] ${
                isLoading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
              } text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg`}
            >
              <div className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Générer le rapport PDF
                  </>
                )}
              </div>
              
              {!isLoading && (
                <div className="absolute inset-0 flex justify-center overflow-hidden">
                  <div className="w-20 h-full bg-white/20 skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[500%] transition-transform duration-1000"></div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Aperçu des données */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <BarChart className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Aperçu du rapport
              </h3>
            </div>
            <div className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700/50">
              {dateRangeLabels[dateRange]}
            </div>
          </div>
          
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-800/50 to-blue-900/20 border-2 border-dashed border-gray-700/50 rounded-2xl">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700/50">
                {selectedReport && (
                  <selectedReport.icon className={`h-8 w-8 ${selectedReport.iconColor}`} />
                )}
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                {selectedReport?.title}
              </h4>
              <p className="text-gray-400 text-sm max-w-md">
                Rapport préconfiguré pour la période sélectionnée. 
                Cliquez sur "Générer le rapport PDF" pour créer un document détaillé 
                avec toutes les statistiques et analyses.
              </p>
              <div className="mt-4 flex gap-2 justify-center">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium border border-blue-500/30">
                  {reportType === 'incidents' ? 'Statistiques' : ' Inventaire'}
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium border border-green-500/30">
                   Analytics
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
            <div className="text-2xl font-bold text-blue-400">PDF</div>
            <div className="text-sm text-gray-400">Format de sortie</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
            <div className="text-2xl font-bold text-green-400">100%</div>
            <div className="text-sm text-gray-400">Données actualisées</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
            <div className="text-2xl font-bold text-purple-400">Auto</div>
            <div className="text-sm text-gray-400">Génération automatique</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;