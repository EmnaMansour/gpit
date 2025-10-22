import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, ArrowLeftIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Token de vérification manquant');
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/api/users/verify-email?token=${token}`);
        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage(data.message);
          
          // Redirection automatique après 3 secondes
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Erreur lors de la vérification de l\'email');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-indigo-900 flex justify-center items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-700/50 p-8 text-center"
      >
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>

        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white">Vérification de votre email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Email vérifié !</h2>
            <p className="text-blue-200 mb-6">{message}</p>
            <p className="text-sm text-gray-400">Redirection vers la page de connexion...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Erreur de vérification</h2>
            <p className="text-red-200 mb-6">{message}</p>
            <Link 
              to="/login" 
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Retour à la connexion
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;