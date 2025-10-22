import Header from './Header';
import { Outlet } from 'react-router-dom';

const Layout = ({
  userRole,
  onLogout
}) => {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated background similar to dashboard */}
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

      <Header userRole={userRole} onLogout={onLogout} />
      
      <main className="relative z-10 pt-20">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;