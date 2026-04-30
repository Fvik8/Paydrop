/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-black transition-colors duration-500">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
          
          <footer className="py-24 border-t border-white/5 mt-24">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12">
              <div className="col-span-2">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-6 h-6 bg-brand rounded flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-sm" />
                  </div>
                  <span className="font-bold text-lg">Paydrop</span>
                </div>
                <p className="text-white/40 max-w-xs text-sm leading-relaxed">
                  Building the infrastructure for the next generation of digital exclusivity.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-6 text-sm">Product</h4>
                <ul className="space-y-4 text-sm text-white/40">
                  <li><a href="#" className="hover:text-brand transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-brand transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-brand transition-colors">Vault</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-6 text-sm">Legal</h4>
                <ul className="space-y-4 text-sm text-white/40">
                  <li><a href="#" className="hover:text-brand transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-brand transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-white/20">© 2026 Paydrop Technologies. All rights reserved.</p>
              <div className="flex space-x-6">
                <a href="#" className="text-white/20 hover:text-white transition-colors text-xs font-medium">Twitter</a>
                <a href="#" className="text-white/20 hover:text-white transition-colors text-xs font-medium">Discord</a>
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}
