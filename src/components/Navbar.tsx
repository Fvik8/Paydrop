import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { LogOut, User, Activity, Shield } from 'lucide-react';
import { motion } from 'motion/react';

export const Navbar = () => {
  const { user, profile, signIn, logOut } = useAuth();
  const location = useLocation();

  const scrollToSection = (id: string) => {
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="glass-header">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <Shield className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">Paydrop</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => scrollToSection('platform')}
            className="text-sm text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            Platform
          </button>
          <button 
            onClick={() => scrollToSection('marketplace')}
            className="text-sm text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            Marketplace
          </button>
          <button 
            onClick={() => scrollToSection('pricing')}
            className="text-sm text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            Pricing
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <button 
                onClick={logOut}
                className="text-white/40 hover:text-white transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Button onClick={signIn} size="sm">
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
