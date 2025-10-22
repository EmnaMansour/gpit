import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';
const NotFound = () => {
  return <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mt-4">
          Page non trouvée
        </h2>
        <p className="text-gray-600 mt-2">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link to="/dashboard" className="inline-flex items-center mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
          <HomeIcon className="h-5 w-5 mr-2" />
          Retour au tableau de bord
        </Link>
      </div>
    </div>;
};
export default NotFound;