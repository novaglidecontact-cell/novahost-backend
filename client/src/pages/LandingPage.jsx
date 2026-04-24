import React from 'react';
import { Rocket, Zap, ShieldCheck, Terminal, Check, X } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center glass rounded-2xl px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-discord to-purple-500 rounded-lg flex items-center justify-center">
              <Zap className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">Nova<span className="text-discord">Host</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
            <a href="#status" className="hover:text-white transition-colors">Statut</a>
          </div>

          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm font-medium hover:text-white transition-colors">Connexion</a>
            <a href="/register" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-white">Commencer</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-discord opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-discord"></span>
            </span>
            <span className="text-xs font-semibold text-gray-300">Nouveau : Processeurs Ryzen 9 7950X disponibles</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Propulsez votre Bot <br/>
            <span className="text-gradient">Vers le Futur.</span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Hébergement haute performance conçu spécifiquement pour les bots Discord. Uptime 99.9%, protection DDoS avancée et déploiement instantané.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button className="btn-primary px-8 py-4 rounded-2xl text-lg font-bold w-full md:w-auto flex items-center justify-center gap-2 text-white">
              <Rocket className="w-5 h-5" />
              Démarrer gratuitement
            </button>
            <a href="#features" className="glass px-8 py-4 rounded-2xl text-lg font-bold w-full md:w-auto hover:bg-white/5 transition-all flex items-center justify-center">
              Voir les fonctionnalités
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass p-8 rounded-3xl hover:translate-y-[-10px] transition-all duration-300">
            <div className="w-12 h-12 bg-discord/10 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="text-discord w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Vitesse Éclair</h3>
            <p className="text-gray-400">Processeurs NVMe SSD et DDR5 pour une latence minimale et une réponse instantanée.</p>
          </div>
          <div className="glass p-8 rounded-3xl hover:translate-y-[-10px] transition-all duration-300">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="text-purple-500 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Sécurité Totale</h3>
            <p className="text-gray-400">Protection DDoS de niveau entreprise incluse sur tous les plans sans surcoût.</p>
          </div>
          <div className="glass p-8 rounded-3xl hover:translate-y-[-10px] transition-all duration-300">
            <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Terminal className="text-green-500 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Console Temps Réel</h3>
            <p className="text-gray-400">Accédez aux logs de votre bot en temps réel et gérez vos fichiers via notre éditeur web.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cards would go here, simplified for now */}
            <div className="glass p-10 rounded-3xl border-white/5">
                <h3 className="text-xl font-bold mb-2">Gratuit</h3>
                <div className="text-4xl font-bold mb-6">0€<span className="text-lg text-gray-400">/mois</span></div>
                <ul className="space-y-4 mb-10 text-gray-400">
                    <li className="flex items-center gap-2"><Check className="text-discord w-4 h-4"/> 1 Bot Discord</li>
                    <li className="flex items-center gap-2"><Check className="text-discord w-4 h-4"/> 256 MB RAM</li>
                    <li className="flex items-center gap-2"><X className="text-red-500 w-4 h-4"/> Uptime 24/7</li>
                </ul>
                <button className="w-full glass py-3 rounded-xl font-semibold">Choisir</button>
            </div>
            <div className="glass p-10 rounded-3xl border-discord/30 scale-105 shadow-2xl shadow-discord/10">
                <h3 className="text-xl font-bold mb-2 text-gradient">Pro</h3>
                <div className="text-4xl font-bold mb-6">4.99€<span className="text-lg text-gray-400">/mois</span></div>
                <ul className="space-y-4 mb-10 text-gray-400">
                    <li className="flex items-center gap-2"><Check className="text-discord w-4 h-4"/> 3 Bots Discord</li>
                    <li className="flex items-center gap-2"><Check className="text-discord w-4 h-4"/> 512 MB RAM</li>
                    <li className="flex items-center gap-2"><Check className="text-discord w-4 h-4"/> Uptime 24/7</li>
                </ul>
                <button className="w-full btn-primary py-3 rounded-xl font-semibold text-white">Choisir</button>
            </div>
            <div className="glass p-10 rounded-3xl border-white/5">
                <h3 className="text-xl font-bold mb-2">Premium</h3>
                <div className="text-4xl font-bold mb-6">9.99€<span className="text-lg text-gray-400">/mois</span></div>
                <ul className="space-y-4 mb-10 text-gray-400">
                    <li className="flex items-center gap-2"><Check className="text-discord w-4 h-4"/> Bots Illimités</li>
                    <li className="flex items-center gap-2"><Check className="text-discord w-4 h-4"/> 2 GB RAM</li>
                    <li className="flex items-center gap-2"><Check className="text-discord w-4 h-4"/> Support 24/7</li>
                </ul>
                <button className="w-full glass py-3 rounded-xl font-semibold">Choisir</button>
            </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
