import { useState, useEffect } from 'react';
import ParticipantForm from './components/ParticipantForm';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import CertificateTemplates from './components/CertificateTemplates';
import Editor from './components/editor/Editor';
import Statistics from './components/Statistics';
import TrainingManagement from './components/TrainingManagement';
import HistoryPage from './components/HistoryPage';
import SettingsPage from './components/SettingsPage';
import ChatBot from './components/ChatBot';
import { authApi, getAuthToken } from './utils/api';

type AppState = 'participant' | 'admin-login' | 'admin-dashboard' | 'admin-templates' | 'admin-history' | 'admin-trainings' | 'admin-statistics' | 'admin-settings' | 'admin-editor';

interface EditingTemplate {
  template: any;
  isEditing: boolean;
}

function App() {
  const [currentView, setCurrentView] = useState<AppState>('participant');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  // Check for existing auth token on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      authApi.verify()
        .then(() => {
          setIsAdminLoggedIn(true);
        })
        .catch(() => {
          authApi.logout();
          setIsAdminLoggedIn(false);
        });
    }
  }, []);

  const handleParticipantSubmit = (data: { participantName: string; email: string }) => {
    // Data is already sent to API in ParticipantForm component
    console.log('Participant submitted:', data);
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    setCurrentView('admin-dashboard');
  };

  const handleAdminLogout = () => {
    authApi.logout();
    setIsAdminLoggedIn(false);
    setCurrentView('participant');
  };

  const handleAdminNavigation = (page: string) => {
    switch (page) {
      case 'dashboard':
        setCurrentView('admin-dashboard');
        break;
      case 'templates':
        setCurrentView('admin-templates');
        break;
      case 'history':
        setCurrentView('admin-history');
        break;
      case 'trainings':
        setCurrentView('admin-trainings');
        break;
      case 'statistics':
        setCurrentView('admin-statistics');
        break;
      case 'settings':
        setCurrentView('admin-settings');
        break;
    }
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setCurrentView('admin-editor');
  };

  // Navigation buttons for switching between participant and admin views
  const NavigationButtons = () => (
    <div className="fixed top-4 right-4 z-50 flex space-x-2">
      <button
        onClick={() => setCurrentView('participant')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          currentView === 'participant'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        Participant
      </button>
      <button
        onClick={() => setCurrentView(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          currentView.startsWith('admin')
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        Admin
      </button>
    </div>
  );

  return (
    <div className="relative">
      {/* Show navigation only on main views */}
      {(currentView === 'participant' || currentView === 'admin-login' || currentView === 'admin-dashboard') && (
        <NavigationButtons />
      )}

      {currentView === 'participant' && (
        <ParticipantForm onSubmit={handleParticipantSubmit} />
      )}

      {currentView === 'admin-login' && (
        <Login onLogin={handleAdminLogin} />
      )}

      {currentView === 'admin-dashboard' && isAdminLoggedIn && (
        <AdminDashboard
          onLogout={handleAdminLogout}
          onNavigate={handleAdminNavigation}
          onGoToParticipant={() => setCurrentView('participant')}
        />
      )}

      {currentView === 'admin-templates' && isAdminLoggedIn && (
        <CertificateTemplates
          onBack={() => setCurrentView('admin-dashboard')}
          onNewTemplate={() => {
            setEditingTemplate(null);
            setCurrentView('admin-editor');
          }}
          onEditTemplate={(template) => {
            console.log('🎨 App: onEditTemplate callback triggered for template:', template?.name, template?.id);
            handleEditTemplate(template);
          }}
        />
      )}

      {currentView === 'admin-statistics' && isAdminLoggedIn && (
        <Statistics onBack={() => setCurrentView('admin-dashboard')} />
      )}

      {currentView === 'admin-trainings' && isAdminLoggedIn && (
        <TrainingManagement onBack={() => setCurrentView('admin-dashboard')} />
      )}

      {/* Placeholder for other admin views */}
      {currentView === 'admin-history' && isAdminLoggedIn && (
        <HistoryPage onBack={() => setCurrentView('admin-dashboard')} />
      )}

      {currentView === 'admin-settings' && isAdminLoggedIn && (
        <SettingsPage onBack={() => setCurrentView('admin-dashboard')} />
      )}

      {currentView === 'admin-editor' && isAdminLoggedIn && (
        <Editor
          onBack={() => {
            console.log('🔙 App: Going back from editor to templates');
            setEditingTemplate(null);
            setCurrentView('admin-templates');
          }}
          initialTemplate={editingTemplate}
        />
      )}

      {/* ChatBot disponible partout */}
      <ChatBot 
        isOpen={showChatBot} 
        onToggle={() => setShowChatBot(!showChatBot)} 
      />
    </div>
  );
}

export default App;