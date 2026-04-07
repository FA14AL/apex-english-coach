import { useState, useEffect } from 'react';
import axios from 'axios';
import AlexAvatar from './components/AlexAvatar';
import Dashboard from './pages/Dashboard';
import SmallTalk from './pages/SmallTalk';
import AccentSpeaking from './pages/AccentSpeaking';
import AccentListening from './pages/AccentListening';
import EmailCoach from './pages/EmailCoach';
import ConsultingLanguage from './pages/ConsultingLanguage';
import KPMGSimulation from './pages/KPMGSimulation';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'smalltalk', label: 'Small Talk', icon: '💬' },
  { id: 'accent-speaking', label: 'Accent Speaking', icon: '🎙' },
  { id: 'accent-listening', label: 'Accent Listening', icon: '👂' },
  { id: 'email-coach', label: 'Email Coach', icon: '✉' },
  { id: 'consulting', label: 'Consulting + OT', icon: '📋' },
  { id: 'kpmg', label: 'KPMG Simulation', icon: '🏢' },
];

function getReadinessColor(score) {
  if (score >= 70) return 'text-emerald-600';
  if (score >= 40) return 'text-amber-500';
  return 'text-red-500';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    axios
      .get('/api/profile')
      .then((res) => setUserProfile(res.data))
      .catch(() =>
        setUserProfile({
          sessions_completed: 0,
          avg_wpm: 0,
          top_fillers: [],
          weak_areas: [],
          improving: [],
          readiness_score: 0,
          last_session: null,
          module_scores: {},
        })
      )
      .finally(() => setLoadingProfile(false));
  }, []);

  const navigate = (page) => {
    setCurrentPage(page);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const readiness = userProfile?.readiness_score ?? 0;

  const renderPage = () => {
    const props = { userProfile, setUserProfile, navigate };
    switch (currentPage) {
      case 'dashboard': return <Dashboard {...props} />;
      case 'smalltalk': return <SmallTalk {...props} />;
      case 'accent-speaking': return <AccentSpeaking {...props} />;
      case 'accent-listening': return <AccentListening {...props} />;
      case 'email-coach': return <EmailCoach {...props} />;
      case 'consulting': return <ConsultingLanguage {...props} />;
      case 'kpmg': return <KPMGSimulation {...props} />;
      default: return <Dashboard {...props} />;
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 animate-pulse">
            AX
          </div>
          <p className="text-gray-500">Loading APEX English Coach...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 fixed top-0 left-0 h-full z-30">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">AX</span>
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm leading-none">APEX English</p>
              <p className="text-xs text-gray-400 leading-none mt-0.5">Coach</p>
            </div>
          </div>
        </div>

        {/* Alex avatar + readiness */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <AlexAvatar state="idle" size="sm" />
            <div>
              <p className="text-xs text-gray-400">Your Coach</p>
              <p className="text-sm font-semibold text-gray-700">Alex</p>
            </div>
          </div>
          <div className="mt-3 bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400">KPMG Readiness</p>
            <p className={`text-xl font-bold ${getReadinessColor(readiness)}`}>
              {readiness}%
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map((item) => {
            const isLocked = item.id === 'kpmg' && readiness < 70;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {isLocked && <span className="text-gray-400 text-xs">🔒</span>}
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Hi Faisal 👋</p>
          <p className="text-xs text-gray-400">Lancaster → KPMG OT Synapse</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">AX</span>
          </div>
          <span className="font-bold text-gray-800 text-sm">APEX English</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold ${getReadinessColor(readiness)}`}>
            {readiness}% ready
          </span>
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileNavOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/30" onClick={() => setMobileNavOpen(false)}>
          <div
            className="bg-white w-64 h-full overflow-y-auto py-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 pb-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800">Navigation</p>
            </div>
            {NAV_ITEMS.map((item) => {
              const isLocked = item.id === 'kpmg' && readiness < 70;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left ${
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {isLocked && <span className="text-gray-400 text-xs">🔒</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-60 pt-16 md:pt-0 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-6">{renderPage()}</div>
      </main>
    </div>
  );
}
