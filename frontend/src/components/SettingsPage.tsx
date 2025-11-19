import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Save, User, Mail, Phone, MapPin, Building, FileText, Image, FileSignature as Signature } from 'lucide-react';

interface SettingsPageProps {
  onBack: () => void;
}

interface AppSettings {
  organizationName: string;
  organizationFullName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  rccm: string;
  ifu: string;
  adminName: string;
  adminTitle: string;
  adminSignature: string | null;
  organizationLogo: string | null;
  emailTemplate: string;
  certificateValidityPeriod: string;
  autoApproval: boolean;
  emailNotifications: boolean;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<AppSettings>({
    organizationName: 'BIMADES Consulting',
    organizationFullName: 'Bureau International de Management et d\'Appui au Développement Economique et Social',
    address: '10 BP 13122 Ouaga 10',
    phone: '+226 67 10 20 20',
    email: 'formation@bimades.com',
    website: 'www.bimades.com',
    rccm: 'BF OUA 2018 B 0254',
    ifu: '00099754T',
    adminName: 'Aimé SAWADO',
    adminTitle: 'Consultant Formateur',
    adminSignature: null as string | null,
    organizationLogo: null as string | null,
    emailTemplate: 'Bonjour [[participantName]],\n\nNous avons le plaisir de vous informer que votre demande d\'attestation de formation a été approuvée.\n\nVous trouverez en pièce jointe votre certificat de formation officiel.\n\nCordialement,\nL\'équipe BIMADES Consulting',
    certificateValidityPeriod: '5 ans',
    autoApproval: false,
    emailNotifications: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = localStorage.getItem('app_settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Sauvegarder dans localStorage
      localStorage.setItem('app_settings', JSON.stringify(settings));
      
      // Simulation d'une API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Notification de succès
      showNotification('Paramètres sauvegardés avec succès !', 'success');
    } catch (error) {
      console.error('Failed to save settings:', error);
      showNotification('Erreur lors de la sauvegarde', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl z-50 max-w-md`;
    notification.innerHTML = `
      <div class="flex items-center">
        <div class="flex-1">
          <div class="font-semibold text-sm">${message}</div>
          <div class="text-xs mt-1 opacity-90">${new Date().toLocaleTimeString('fr-FR')}</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-suppression après 4 secondes
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.transform = 'translateX(100%)';
        notification.style.transition = 'transform 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
      }
    }, 4000);
  };

  const handleFileUpload = (type: 'signature' | 'logo', file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showNotification('Le fichier est trop volumineux (max 5MB)', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'signature') {
        setSettings(prev => ({ ...prev, adminSignature: result }));
        showNotification('Signature uploadée avec succès', 'success');
      } else {
        setSettings(prev => ({ ...prev, organizationLogo: result }));
        showNotification('Logo uploadé avec succès', 'success');
      }
    };
    reader.onerror = () => {
      showNotification('Erreur lors du téléchargement du fichier', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotification('Veuillez sélectionner un fichier image', 'error');
        return;
      }
      handleFileUpload('signature', file);
    }
    // Reset input
    e.target.value = '';
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotification('Veuillez sélectionner un fichier image', 'error');
        return;
      }
      handleFileUpload('logo', file);
    }
    // Reset input
    e.target.value = '';
  };

  const resetSettings = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
      localStorage.removeItem('app_settings');
      loadSettings();
      showNotification('Paramètres réinitialisés', 'success');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            <button
              onClick={resetSettings}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Organization Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Building className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Informations de l'Organisation</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'organisation
                </label>
                <input
                  type="text"
                  value={settings.organizationName}
                  onChange={(e) => setSettings(prev => ({ ...prev, organizationName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={settings.organizationFullName}
                  onChange={(e) => setSettings(prev => ({ ...prev, organizationFullName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site web
                </label>
                <input
                  type="url"
                  value={settings.website}
                  onChange={(e) => setSettings(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RCCM
                </label>
                <input
                  type="text"
                  value={settings.rccm}
                  onChange={(e) => setSettings(prev => ({ ...prev, rccm: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IFU
                </label>
                <input
                  type="text"
                  value={settings.ifu}
                  onChange={(e) => setSettings(prev => ({ ...prev, ifu: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo de l'organisation
              </label>
              <div className="flex items-center space-x-4">
                {settings.organizationLogo && (
                  <img
                    src={settings.organizationLogo}
                    alt="Logo"
                    className="w-16 h-16 object-contain border border-gray-300 rounded-lg"
                  />
                )}
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Télécharger le logo
                </button>
              </div>
            </div>
          </div>

          {/* Admin Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <User className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Informations Administrateur</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'administrateur
                </label>
                <input
                  type="text"
                  value={settings.adminName}
                  onChange={(e) => setSettings(prev => ({ ...prev, adminName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre/Fonction
                </label>
                <input
                  type="text"
                  value={settings.adminTitle}
                  onChange={(e) => setSettings(prev => ({ ...prev, adminTitle: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Signature Upload */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Signature numérique
              </label>
              <div className="flex items-center space-x-4">
                {settings.adminSignature && (
                  <img
                    src={settings.adminSignature}
                    alt="Signature"
                    className="w-32 h-16 object-contain border border-gray-300 rounded-lg bg-white"
                  />
                )}
                <input
                  type="file"
                  ref={signatureInputRef}
                  onChange={handleSignatureUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => signatureInputRef.current?.click()}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Signature className="w-4 h-4 mr-2" />
                  Télécharger la signature
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Formats acceptés: PNG, JPG, GIF. Taille max: 5MB. Recommandé: 300x100px sur fond transparent.
              </p>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Mail className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Paramètres Email</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template d'email pour l'envoi des certificats
                </label>
                <textarea
                  value={settings.emailTemplate}
                  onChange={(e) => setSettings(prev => ({ ...prev, emailTemplate: e.target.value }))}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Utilisez {{participantName}} pour insérer le nom du participant"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Variables disponibles: [[participantName]], [[certificateNumber]], [[organizationName]], [[trainingTitle]], [[issueDate]]
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                  Activer les notifications email
                </label>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Configuration Email</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Les emails sont envoyés automatiquement lors de l'approbation des certificats.
                </p>
                <div className="space-y-2 text-xs text-blue-600">
                  <div>• Expéditeur: {settings.email}</div>
                  <div>• Template personnalisable avec variables</div>
                  <div>• Certificat PDF en pièce jointe</div>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <FileText className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Paramètres des Certificats</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Période de validité des certificats
                </label>
                <select
                  value={settings.certificateValidityPeriod}
                  onChange={(e) => setSettings(prev => ({ ...prev, certificateValidityPeriod: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1 an">1 an</option>
                  <option value="2 ans">2 ans</option>
                  <option value="3 ans">3 ans</option>
                  <option value="5 ans">5 ans</option>
                  <option value="Illimitée">Illimitée</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoApproval"
                  checked={settings.autoApproval}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoApproval: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoApproval" className="ml-2 block text-sm text-gray-900">
                  Approbation automatique des demandes
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;