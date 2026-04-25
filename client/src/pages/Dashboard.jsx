import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot as BotIcon, 
  Settings, 
  LogOut, 
  Plus, 
  Play, 
  Square, 
  RefreshCw, 
  Terminal, 
  Cpu, 
  Database, 
  Activity,
  X,
  Search,
  FileCode,
  Save,
  Trash2,
  HardDrive,
  ChevronRight,
  MoreVertical,
  ExternalLink,
  Zap
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [newBotToken, setNewBotToken] = useState('');
  const [showConsole, setShowConsole] = useState(null); // Bot ID for console
  const [showEditor, setShowEditor] = useState(null); // Bot ID for editor
  const [logs, setLogs] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState('index.js');
  const [code, setCode] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [botData, setBotData] = useState([]);
  const [selectedBotForDb, setSelectedBotForDb] = useState(null);
  const [selectedBotDetail, setSelectedBotDetail] = useState(null);
  const [showDataModal, setShowDataModal] = useState(false);
  const [newDataKey, setNewDataKey] = useState('');
  const [newDataValue, setNewDataValue] = useState('');
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [activeTab, setActiveTab] = useState('overview'); // overview, bots, settings, database
  const navigate = useNavigate();

  // Fake stats data for charts
  const [statsData, setStatsData] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      time: i,
      cpu: Math.floor(Math.random() * 5) + 2,
      ram: Math.floor(Math.random() * 10) + 40
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
        setStatsData(prev => [
            ...prev.slice(1),
            { 
                time: prev[prev.length-1].time + 1,
                cpu: Math.floor(Math.random() * 5) + 2,
                ram: Math.floor(Math.random() * 5) + 42
            }
        ]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    fetchBots();
    
    // Setup Socket.io
    const newSocket = io(API_URL);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket && showConsole) {
      socket.emit('join-bot-logs', showConsole);
      socket.on('bot-log', (log) => {
        setLogs(prev => [...prev.slice(-49), log]); // Keep last 50 logs
      });
    } else if (socket) {
      socket.off('bot-log');
    }
  }, [showConsole, socket]);

  const fetchBots = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/bots`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBots(res.data);
    } catch (err) {
      console.error('Error fetching bots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (botId, action) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/bots/${botId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mock log for UI feedback
      if (socket) {
        setLogs(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          message: `Bot ${action}é par l'utilisateur.`,
          type: 'info'
        }]);
      }
      
      fetchBots(); // Refresh list
    } catch (err) {
      alert('Erreur lors de l\'action sur le bot.');
    }
  };

  const handleAddBot = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/bots`, 
        { name: newBotName, token: newBotToken },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowAddModal(false);
      setNewBotName('');
      setNewBotToken('');
      fetchBots();
    } catch (err) {
      alert('Erreur lors de l\'ajout du bot.');
    }
  };

  const handleDeleteBot = async (botId, botName) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement le bot "${botName}" ?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/bots/${botId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBots();
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la suppression du bot.';
      alert(message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const openConsole = (bot) => {
    setShowConsole(bot._id);
    setLogs([
      { timestamp: new Date().toLocaleTimeString(), message: `Connexion à la console de ${bot.name}...`, type: 'system' },
      { timestamp: new Date().toLocaleTimeString(), message: `Bot est actuellement ${bot.status === 'online' ? 'en ligne' : 'hors ligne'}.`, type: 'info' }
    ]);
  };

  const openEditor = async (bot) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/files/${bot._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(res.data);
      const indexFile = res.data.find(f => f.name === 'index.js') || res.data[0];
      setCurrentFile(indexFile.name);
      setCode(indexFile.content);
      setShowEditor(bot);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la récupération des fichiers.');
    }
  };

  const handleFileChange = (fileName) => {
    // Save current file locally in the list before switching
    setFiles(prev => prev.map(f => f.name === currentFile ? { ...f, content: code } : f));
    
    // Switch to new file
    const file = files.find(f => f.name === fileName);
    setCurrentFile(fileName);
    setCode(file.content);
  };

  const addFile = async () => {
    const fileName = prompt('Nom du nouveau fichier (ex: config.json) :');
    if (!fileName) return;
    if (files.some(f => f.name === fileName)) return alert('Ce fichier existe déjà !');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/files/${showEditor._id}`, 
        { name: fileName, content: '// Nouveau fichier' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFiles(res.data.files);
      setCurrentFile(fileName);
      setCode('// Nouveau fichier');
    } catch (err) {
      alert('Erreur lors de la création du fichier.');
    }
  };

  const deleteFile = async (fileName) => {
    if (fileName === 'index.js') return alert('Impossible de supprimer le fichier principal.');
    if (!confirm(`Supprimer ${fileName} ?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`${API_URL}/api/files/${showEditor._id}/${fileName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(res.data.files);
      if (currentFile === fileName) {
        const indexFile = res.data.files.find(f => f.name === 'index.js');
        setCurrentFile('index.js');
        setCode(indexFile.content);
      }
    } catch (err) {
      alert('Erreur lors de la suppression.');
    }
  };

  const saveCode = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/files/${showEditor._id}`, 
        { name: currentFile, content: code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state
      setFiles(prev => prev.map(f => f.name === currentFile ? { ...f, content: code } : f));
      alert('Fichier sauvegardé !');
    } catch (err) {
      alert('Erreur lors de la sauvegarde.');
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    if (!items) return;

    const filesToUpload = [];

    const traverseFileTree = (item, path = '') => {
      return new Promise((resolve) => {
        if (item.isFile) {
          item.file(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
              filesToUpload.push({
                name: path + file.name,
                content: e.target.result
              });
              resolve();
            };
            reader.readAsText(file);
          });
        } else if (item.isDirectory) {
          if (item.name === 'node_modules' || item.name === '.git') {
            resolve();
            return;
          }
          const dirReader = item.createReader();
          dirReader.readEntries(async entries => {
            for (let i = 0; i < entries.length; i++) {
              await traverseFileTree(entries[i], path + item.name + '/');
            }
            resolve();
          });
        }
      });
    };

    const promises = [];
    if (items.length === 1) {
      const item = items[0].webkitGetAsEntry();
      if (item && item.isDirectory) {
        // Mode "FileZilla" : Si on glisse un seul dossier, on importe son contenu à la racine
        const dirReader = item.createReader();
        promises.push(new Promise((resolve) => {
          dirReader.readEntries(async entries => {
            for (let i = 0; i < entries.length; i++) {
              await traverseFileTree(entries[i]);
            }
            resolve();
          });
        }));
      } else if (item) {
        promises.push(traverseFileTree(item));
      }
    } else {
      for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry();
        if (item) {
          promises.push(traverseFileTree(item));
        }
      }
    }

    await Promise.all(promises);

    if (filesToUpload.length > 0) {
      try {
        const token = localStorage.getItem('token');
        for (let f of filesToUpload) {
          await axios.post(`${API_URL}/api/files/${showEditor._id}`, 
            { name: f.name, content: f.content },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        // Refresh files list
        const res = await axios.get(`${API_URL}/api/files/${showEditor._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFiles(res.data);
        alert(`${filesToUpload.length} fichier(s) importé(s) avec succès !`);
      } catch (err) {
        alert("Erreur lors de l'importation.");
      }
    }
  };

  const fetchBotData = async (botId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/data/${botId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBotData(res.data);
      setSelectedBotForDb(botId);
      setActiveTab('database');
    } catch (err) {
      alert('Erreur lors de la récupération des données.');
    }
  };

  const handleSaveData = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/data/${selectedBotForDb}`, 
        { key: newDataKey, value: newDataValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewDataKey('');
      setNewDataValue('');
      setShowDataModal(false);
      fetchBotData(selectedBotForDb);
    } catch (err) {
      alert('Erreur lors de la sauvegarde de la donnée.');
    }
  };

  const handleDeleteData = async (key) => {
    if (!confirm(`Supprimer la clé "${key}" ?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/data/${selectedBotForDb}/${key}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBotData(selectedBotForDb);
    } catch (err) {
      alert('Erreur lors de la suppression.');
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0a0a0f] flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-discord to-purple-500 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold">NovaHost</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'overview' ? 'bg-discord/10 text-discord font-medium' : 'hover:bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('bots')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'bots' ? 'bg-discord/10 text-discord font-medium' : 'hover:bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <BotIcon className="w-5 h-5" /> Mes Bots
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'settings' ? 'bg-discord/10 text-discord font-medium' : 'hover:bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" /> Paramètres
          </button>
          <button 
            onClick={() => {
                if (bots.length > 0) fetchBotData(bots[0]._id);
                else setActiveTab('database');
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'database' ? 'bg-discord/10 text-discord font-medium' : 'hover:bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <Database className="w-5 h-5" /> NovaDB
          </button>
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all mt-auto"
        >
          <LogOut className="w-5 h-5" /> Déconnexion
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        <>
        {/* Expiration Banner for Free Users */}
        {user.plan === 'Free' && (
          <div className="mb-8 p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-bold text-orange-500">Période d'essai Free active</p>
                <p className="text-sm text-gray-400">Il vous reste environ <span className="text-white font-bold">{Math.max(0, 7 - Math.ceil((Math.abs(new Date() - new Date(user.createdAt || new Date())) / (1000 * 60 * 60 * 24))))} jours</span> avant expiration.</p>
              </div>
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
              Passer en PRO
            </button>
          </div>
        )}

        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">
              {activeTab === 'overview' && `Bonjour, ${user.username} 👋`}
              {activeTab === 'bots' && 'Mes Instances'}
              {activeTab === 'settings' && 'Paramètres du Compte'}
              {activeTab === 'database' && 'NovaDB Manager'}
            </h1>
            <p className="text-gray-400 mt-1">
              {activeTab === 'overview' && 'Gérez vos instances et surveillez leurs performances.'}
              {activeTab === 'bots' && 'Liste complète de vos bots Discord hébergés.'}
              {activeTab === 'settings' && 'Gérez vos informations et votre abonnement.'}
              {activeTab === 'database' && 'Gérez les données persistantes de vos bots (Style phpMyAdmin).'}
            </p>
          </div>
          {activeTab !== 'settings' && activeTab !== 'database' && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white"
            >
              <Plus className="w-5 h-5" /> Ajouter un Bot
            </button>
          )}
          {activeTab === 'database' && selectedBotForDb && (
            <button 
              onClick={() => setShowDataModal(true)}
              className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white"
            >
              <Plus className="w-5 h-5" /> Ajouter une Donnée
            </button>
          )}
        </header>

        {activeTab === 'overview' && !selectedBotDetail && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map(bot => (
              <div 
                key={bot._id} 
                className="glass group hover:border-discord/30 transition-all cursor-pointer overflow-hidden rounded-3xl"
                onClick={() => setSelectedBotDetail(bot)}
              >
                <div className="p-6 border-b border-white/5 bg-white/2 flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-discord/20 flex items-center justify-center text-discord">
                      <BotIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-discord transition-colors">{bot.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${bot.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">{bot.status}</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 text-gray-500 hover:text-white"><MoreVertical className="w-5 h-5" /></button>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2"><Cpu className="w-4 h-4" /> CPU</span>
                    <span className="font-mono text-discord">2.4%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-discord h-full w-[20%]" />
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2"><Activity className="w-4 h-4" /> RAM</span>
                    <span className="font-mono text-discord">128 MB</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-discord h-full w-[15%]" />
                  </div>
                </div>

                <div className="px-6 py-4 bg-white/2 border-t border-white/5 flex justify-between items-center">
                   <span className="text-xs text-gray-600 font-mono">{bot._id.substring(0, 10)}...</span>
                   <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-discord transform group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
            
            {/* Add Bot Card */}
            <div 
              onClick={() => setShowAddModal(true)}
              className="border-2 border-dashed border-white/5 hover:border-discord/30 hover:bg-discord/5 transition-all rounded-3xl flex flex-col items-center justify-center p-12 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-discord/20 flex items-center justify-center text-gray-500 group-hover:text-discord transition-all mb-4">
                <Plus className="w-8 h-8" />
              </div>
              <span className="font-bold text-gray-500 group-hover:text-white transition-colors">Ajouter un nouveau Bot</span>
            </div>
          </div>
        )}

        {/* Detailed Server View (Pterodactyl Style) */}
        {selectedBotDetail && activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Bar for Bot Detail */}
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setSelectedBotDetail(null)}
                className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-discord/20 flex items-center justify-center text-discord">
                <BotIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{selectedBotDetail.name}</h2>
                <p className="text-xs text-gray-500 font-mono">{selectedBotDetail._id}</p>
              </div>
              
              <div className="ml-auto flex gap-3">
                <button 
                  onClick={() => handleAction(selectedBotDetail._id, 'start')}
                  className="flex items-center gap-2 px-6 py-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-xl font-bold transition-all border border-green-500/20"
                >
                  <Play className="w-4 h-4" /> START
                </button>
                <button 
                  onClick={() => handleAction(selectedBotDetail._id, 'restart')}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl font-bold transition-all border border-blue-500/20"
                >
                  <RefreshCw className="w-4 h-4" /> RESTART
                </button>
                <button 
                  onClick={() => handleAction(selectedBotDetail._id, 'stop')}
                  className="flex items-center gap-2 px-6 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-all border border-red-500/20"
                >
                  <Square className="w-4 h-4" /> STOP
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Console Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass rounded-3xl overflow-hidden flex flex-col h-[500px]">
                  <div className="p-4 border-b border-white/5 bg-white/2 flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold text-sm text-gray-400">
                      <Terminal className="w-4 h-4" /> CONSOLE
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${selectedBotDetail.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-xs font-bold text-gray-500 uppercase">{selectedBotDetail.status}</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-black/40 p-6 font-mono text-sm overflow-y-auto space-y-2">
                    <div className="text-gray-500">[SYSTEM] Node.js v24.14.0 container starting...</div>
                    <div className="text-gray-500">[SYSTEM] Mounting bot files from MongoDB...</div>
                    <div className="text-green-500">[START] Starting node index.js</div>
                    <div className="text-white">🚀 Bot {selectedBotDetail.name} est prêt !</div>
                    <div className="text-white">Connecté en tant que {selectedBotDetail.name}#1234</div>
                    <div className="text-gray-400">&gt; Commande 'ping' reçue de Defouloy</div>
                    <div className="text-blue-400">&gt; Réponse envoyée (42ms)</div>
                    <div className="text-discord mt-4 animate-pulse">_</div>
                  </div>
                  <div className="p-4 bg-white/2 border-t border-white/5 flex gap-4">
                     <div className="text-gray-500 py-2 px-1">/</div>
                     <input 
                      type="text" 
                      placeholder="Tapez une commande ici..."
                      className="flex-1 bg-transparent border-none outline-none text-sm font-mono text-white"
                     />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="glass p-6 rounded-3xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-discord/10 flex items-center justify-center text-discord">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Utilisation CPU</div>
                      <div className="text-xl font-mono font-bold">2.41%</div>
                    </div>
                  </div>
                  <div className="glass p-6 rounded-3xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Mémoire RAM</div>
                      <div className="text-xl font-mono font-bold">128.4 MB</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Stats & Info */}
              <div className="space-y-6">
                <div className="glass rounded-3xl p-6">
                  <h3 className="font-bold text-sm text-gray-400 mb-6 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> PERFORMANCE (LIVE)
                  </h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={statsData}>
                        <defs>
                          <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#5865F2" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#5865F2" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '12px' }}
                          itemStyle={{ color: '#5865F2' }}
                        />
                        <Area type="monotone" dataKey="cpu" stroke="#5865F2" fillOpacity={1} fill="url(#colorCpu)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass rounded-3xl p-6">
                   <h3 className="font-bold text-sm text-gray-400 mb-6 flex items-center gap-2">
                    <HardDrive className="w-4 h-4" /> INFORMATION SERVEUR
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Adresse IP</span>
                      <span className="text-white text-sm font-mono">192.168.1.42</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Port</span>
                      <span className="text-white text-sm font-mono">5001</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">OS</span>
                      <span className="text-white text-sm">Ubuntu 22.04</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Propriétaire</span>
                      <span className="text-white text-sm">{user.username}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <button 
                      onClick={() => openConsole(selectedBotDetail)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all"
                    >
                      <Terminal className="w-4 h-4" /> Ouvrir la Console
                    </button>
                    <button 
                      onClick={() => openEditor(selectedBotDetail)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-discord/10 hover:bg-discord/20 text-discord rounded-xl text-sm font-bold transition-all"
                    >
                      <FileCode className="w-4 h-4" /> Gérer les Fichiers
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bots' && (
          <div className="glass rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
              <h2 className="text-xl font-bold">Liste des Bots</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Rechercher un bot..." 
                  className="bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-discord/50"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 text-sm border-b border-white/5">
                    <th className="px-8 py-4 font-medium">Nom du Bot</th>
                    <th className="px-8 py-4 font-medium">Statut</th>
                    <th className="px-8 py-4 font-medium">RAM / CPU</th>
                    <th className="px-8 py-4 font-medium">Uptime</th>
                    <th className="px-8 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bots.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center text-gray-500">
                        Vous n'avez pas encore de bot. Cliquez sur "Ajouter un Bot" pour commencer.
                      </td>
                    </tr>
                  ) : (
                    bots.map(bot => (
                      <tr key={bot._id} className="hover:bg-white/2 transition-all">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                              <BotIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <p className="font-bold">{bot.name}</p>
                              <p className="text-xs text-gray-500 font-mono">ID: {bot._id.substring(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            bot.status === 'online' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${bot.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {bot.status === 'online' ? 'En ligne' : 'Hors ligne'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm">128 MB / 2%</p>
                        </td>
                        <td className="px-8 py-6 text-sm text-gray-400">
                          {bot.status === 'online' ? '24j 12h 05m' : '-'}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleAction(bot._id, bot.status === 'online' ? 'stop' : 'start')}
                              className={`p-2 rounded-lg transition-all ${
                                bot.status === 'online' ? 'hover:bg-red-500/10 text-red-500' : 'hover:bg-green-500/10 text-green-500'
                              }`}
                              title={bot.status === 'online' ? 'Arrêter' : 'Démarrer'}
                            >
                              {bot.status === 'online' ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            </button>
                            <button 
                              onClick={() => handleAction(bot._id, 'restart')}
                              className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-all"
                              title="Redémarrer"
                            >
                              <RefreshCw className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => openConsole(bot)}
                              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 transition-all" 
                              title="Console"
                            >
                              <Terminal className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => openEditor(bot)}
                              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 transition-all" 
                              title="Fichiers"
                            >
                              <FileCode className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteBot(bot._id, bot.name)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-all" 
                              title="Supprimer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <div className="glass p-8 rounded-3xl">
              <h3 className="text-xl font-bold mb-6">Profil Utilisateur</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nom d'utilisateur</label>
                  <p className="text-lg font-medium">{user.username}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Adresse Email</label>
                  <p className="text-lg font-medium">{user.email}</p>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <button className="text-discord text-sm font-bold hover:underline">Changer le mot de passe</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-6">
            {/* Bot Selector for DB */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              {bots.map(bot => (
                <button 
                  key={bot._id}
                  onClick={() => fetchBotData(bot._id)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                    selectedBotForDb === bot._id ? 'bg-discord text-white' : 'glass text-gray-400 hover:text-white'
                  }`}
                >
                  {bot.name}
                </button>
              ))}
            </div>

            <div className="glass rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                   <Database className="w-5 h-5 text-discord" /> Table des Données
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-500 text-sm border-b border-white/5">
                      <th className="px-8 py-4 font-medium">Clé (Key)</th>
                      <th className="px-8 py-4 font-medium">Valeur (Value)</th>
                      <th className="px-8 py-4 font-medium">Dernière modification</th>
                      <th className="px-8 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {botData.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-8 py-20 text-center text-gray-500">
                          {selectedBotForDb ? "Aucune donnée enregistrée pour ce bot." : "Veuillez sélectionner un bot pour voir ses données."}
                        </td>
                      </tr>
                    ) : (
                      botData.map(entry => (
                        <tr key={entry.key} className="hover:bg-white/2 transition-all group">
                          <td className="px-8 py-6">
                            <code className="bg-white/5 px-2 py-1 rounded text-discord text-sm font-bold">{entry.key}</code>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-gray-300 font-mono text-sm">{JSON.stringify(entry.value)}</span>
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-500">
                            {new Date(entry.updatedAt).toLocaleString()}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => {
                                setNewDataKey(entry.key);
                                setNewDataValue(typeof entry.value === 'object' ? JSON.stringify(entry.value) : entry.value);
                                setShowDataModal(true);
                              }}
                              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                              title="Modifier"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteData(entry.key)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-all" 
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        </>
      </main>

      {/* Add/Edit Data Modal */}
      <AnimatePresence>
        {showDataModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowDataModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg glass p-8 rounded-3xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Gérer une Donnée</h2>
                <button onClick={() => setShowDataModal(false)} className="p-2 hover:bg-white/5 rounded-lg transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveData} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Clé (Key)</label>
                  <input 
                    type="text" 
                    required
                    value={newDataKey}
                    onChange={(e) => setNewDataKey(e.target.value)}
                    placeholder="Ex: money_user_123"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-discord/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Valeur (Value)</label>
                  <textarea 
                    required
                    value={newDataValue}
                    onChange={(e) => setNewDataValue(e.target.value)}
                    placeholder="Ex: 500 ou { 'level': 1 }"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 h-32 focus:border-discord/50 outline-none font-mono"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowDataModal(false)}
                    className="flex-1 glass py-3 rounded-xl font-bold"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 btn-primary py-3 rounded-xl font-bold text-white"
                  >
                    Sauvegarder
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Bot Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg glass p-8 rounded-3xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Ajouter un nouveau Bot</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-lg transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddBot} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Nom du Bot</label>
                  <input 
                    type="text" 
                    required
                    value={newBotName}
                    onChange={(e) => setNewBotName(e.target.value)}
                    placeholder="Ex: MonBotMusique"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-discord/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Token du Bot</label>
                  <input 
                    type="password" 
                    required
                    value={newBotToken}
                    onChange={(e) => setNewBotToken(e.target.value)}
                    placeholder="OTI3..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-discord/50 outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-2 italic">
                    Note: Votre token est crypté et sécurisé.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 glass py-3 rounded-xl font-bold"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 btn-primary py-3 rounded-xl font-bold text-white"
                  >
                    Ajouter le Bot
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Console Modal */}
      <AnimatePresence>
        {showConsole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowConsole(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl h-[600px] glass overflow-hidden rounded-3xl flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-discord" />
                  <h2 className="text-xl font-bold">Console du Bot</h2>
                </div>
                <button onClick={() => setShowConsole(null)} className="p-2 hover:bg-white/5 rounded-lg transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 p-6 font-mono text-sm overflow-y-auto bg-black/40 space-y-2">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-gray-500 whitespace-nowrap">[{log.timestamp}]</span>
                    <span className={
                      log.type === 'error' ? 'text-red-400' : 
                      log.type === 'system' ? 'text-discord' : 
                      'text-gray-300'
                    }>
                      {log.message}
                    </span>
                  </div>
                ))}
                <div id="logs-end"></div>
              </div>

              <div className="p-4 border-t border-white/5 bg-white/2 flex gap-3">
                <span className="text-discord font-bold self-center">$</span>
                <input 
                  type="text" 
                  placeholder="Envoyer une commande au bot..."
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowEditor(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative w-full max-w-5xl h-[700px] glass overflow-hidden rounded-3xl flex flex-col transition-all ${isDragging ? 'border-discord border-4 scale-[1.02]' : ''}`}
              onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={handleDrop}
            >
              {isDragging && (
                <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none bg-black/80 backdrop-blur-md text-discord font-bold text-3xl">
                  Lâchez les fichiers ici ! 🚀
                </div>
              )}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                <div className="flex items-center gap-3">
                  <FileCode className="w-5 h-5 text-discord" />
                  <h2 className="text-xl font-bold">Explorateur de fichiers ({showEditor.name})</h2>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={saveCode}
                    className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                  >
                    <Save className="w-4 h-4" /> Sauvegarder
                  </button>
                  <button onClick={() => setShowEditor(null)} className="p-2 hover:bg-white/5 rounded-lg transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* File Sidebar */}
                <div className="w-64 border-r border-white/5 bg-black/40 flex flex-col">
                  <div className="p-4 flex justify-between items-center border-b border-white/5">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Fichiers</span>
                    <button 
                      onClick={addFile}
                      className="p-1 hover:bg-white/10 rounded-md text-discord transition-all"
                      title="Nouveau fichier"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {files.map(file => (
                      <div 
                        key={file.name}
                        onClick={() => handleFileChange(file.name)}
                        className={`group flex justify-between items-center px-3 py-2 rounded-lg cursor-pointer transition-all ${
                          currentFile === file.name ? 'bg-discord/20 text-discord' : 'hover:bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-sm overflow-hidden">
                          <FileCode className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        {file.name !== 'index.js' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteFile(file.name); }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Editor Content */}
                <div className="flex-1 flex flex-col">
                  <div className="px-6 py-2 bg-white/2 border-b border-white/5 flex items-center">
                    <span className="text-xs text-gray-500">Edition : </span>
                    <span className="ml-2 text-xs font-mono text-discord">{currentFile}</span>
                  </div>
                  <textarea 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full bg-black/20 p-8 font-mono text-sm outline-none resize-none text-gray-300"
                    spellCheck="false"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
