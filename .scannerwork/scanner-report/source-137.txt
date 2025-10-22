import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return <Outlet />; // juste le contenu, pas de header/footer
};

export default AuthLayout;
