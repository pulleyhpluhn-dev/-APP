import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const HomeButton: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show on the home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/')}
      className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center"
      title="回到首页"
    >
      <Home size={24} />
    </button>
  );
};

export default HomeButton;
