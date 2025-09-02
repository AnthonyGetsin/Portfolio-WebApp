
import React from 'react';
import { LogoIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="flex flex-col items-center mb-8">
      <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-md mb-4">
         <LogoIcon className="w-8 h-8 text-gray-800" />
      </div>
      <p className="text-gray-600 text-lg mb-2 animate-fade-in-down">Hey, I'm Anthony 👋</p>
      <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-gray-900 mb-6 animate-fade-in-down">AI Portfolio</h1>
      <img
        src="https://raw.githubusercontent.com/AnthonyGetsin/Portfolio-WebApp/e8d7e688098030ed40b93d77e92bceb75b3db095/image.jpg"
        alt="Anthony's Memoji"
        className="w-40 h-40 rounded-full object-cover fat-glass-shadow"
      />
    </header>
  );
};

export default Header;