import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, Search, Download, Eye, Send, Calendar, User, Mail, FileText, XCircle, CheckCircle } from 'lucide-react';
import { participantsApi, templatesApi, authApi, emailApi } from '../utils/api';
import { Participant, CertificateTemplate } from '../types';

// --- INTERFACES POUR TYPAGE ---

interface CertificateTemplate {
  id: string;
  name: string;
  type: 'Formation' | 'Événement' | 'Achèvement' | string;
}

interface Participant {
  id: string;
  participantName: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string; // ISO date string
  approvalDate?: string; // ISO date string
  certificateNumber?: string;
  templateId: string;
  rejectionReason?: string;
}

// --- UTILITY COMPONENTS ---

const Notification: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
  if (!message) return null;

  const baseClasses = "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl flex items-center max-w-sm transition-opacity duration-300";
  const colorClasses = type === 'success' ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200";
  const icon = type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />;

  return (
    <div className={`${baseClasses} ${colorClasses}`} role="alert">
      {icon}
      <div className="ml-3 text-sm font-medium text-gray-800 flex-grow">
        {message}
      </div>
      <button onClick={onClose} className="ml-4 p-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  );
};

// --- MAIN COMPONENT ---

interface HistoryPageProps {
  onBack: () => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onBack }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);

  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. BACKEND AUTHENTICATION & INITIALIZATION
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Verify authentication with backend
        const authResponse = await authApi.verify();
        if (authResponse.success && authResponse.data?.user) {
          setUserId(authResponse.data.user.id.toString());
          setIsAuthReady(true);
        } else {
          // If not authenticated, redirect to login or handle accordingly
          console.error("User not authenticated");
          showNotification("Veuillez vous connecter pour accéder à cette page.", 'error');
          // For now, we'll set a default user ID for demo purposes
          setUserId('demo-user');
          setIsAuthReady(true);
        }
      } catch (error) {
        console.error("Erreur d'authentification:", error);
        showNotification("Erreur d'authentification.", 'error');
        // For demo purposes, continue with anonymous user
        setUserId('anonymous-user');
        setIsAuthReady(true);
      }
    };

    initializeAuth();
  }, []);

  // 2. DATA LOADING (Templates and Participants)
  useEffect(() => {
    if (!isAuthReady) return;

    const loadData = async () => {
      try {
        // A. Fetch Templates
        const templatesData = await templatesApi.getAll();
        setTemplates(templatesData);

        // B. Fetch Participants
        const participantsData = await participantsApi.getAll();
        // Filter participants by user if needed, or show all for admin view
        // For now, we'll show all participants since this is an admin history page
        // Tri par date de demande (plus récent en premier)
        participantsData.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
        setParticipants(participantsData);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur de récupération des données:", error);
        showNotification("Erreur de récupération des données.", 'error');
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthReady]);

  // 3. Filtering Logic (Memoized for performance)
  const filteredParticipants = useMemo(() => {
    return participants.filter(participant => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearch = participant.participantName.toLowerCase().includes(lowerSearchTerm) ||
        participant.email.toLowerCase().includes(lowerSearchTerm) ||
        (participant.certificateNumber && participant.certificateNumber.toLowerCase().includes(lowerSearchTerm));

      const matchesStatus = statusFilter === 'all' || participant.status === statusFilter;

      let matchesDate = true;
      if (dateFilter !== 'all') {
        const participantDate = new Date(participant.requestDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        switch (dateFilter) {
          case 'today':
            matchesDate = participantDate.toDateString() === new Date().toDateString();
            break;
          case 'week':
            const weekAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = participantDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = participantDate >= monthAgo;
            break;
          default:
            matchesDate = true;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [participants, searchTerm, statusFilter, dateFilter]);

  // 4. Action Handlers (Resend Certificate)
  const handleResendCertificate = useCallback(async (participant: Participant) => {
    if (!userId || participant.status !== 'approved') return;

    showNotification(`Envoi du certificat à ${participant.email}...`, 'success');

    try {
      // Use the email API to resend certificate
      await emailApi.sendCertificate(participant.email, {
        participantName: participant.participantName,
        certificateNumber: participant.certificateNumber,
        template: templates.find(t => t.id === participant.templateId),
        formData: participant
      });
      showNotification(`Certificat renvoyé avec succès à ${participant.participantName}.`, 'success');
    } catch (error) {
      console.error('Failed to resend certificate:', error);
      showNotification('Erreur lors du renvoi du certificat.', 'error');
    }
  }, [userId, templates]);


  // 5. Export CSV
  const exportFilteredCSV = () => {
    const csvContent = [
      ['Nom', 'Email', 'Statut', 'Date demande', 'Date approbation', 'N° Certificat', 'Template', 'Raison rejet'],
      ...filteredParticipants.map(p => {
        const templateName = templates.find(t => t.id === p.templateId)?.name || 'Template supprimé';
        const statusText = p.status === 'approved' ? 'Approuvé' : p.status === 'rejected' ? 'Rejeté' : 'En attente';
        return [
          p.participantName,
          p.email,
          statusText,
          new Date(p.requestDate).toLocaleDateString('fr-FR'),
          p.approvalDate ? new Date(p.approvalDate).toLocaleDateString('fr-FR') : '',
          p.certificateNumber || '',
          templateName,
          p.rejectionReason || ''
        ];
      })
    ].map(row => row.map(cell => `"${(cell as string).replace(/"/g, '""')}"`).join(';')).join('\n'); // Utilisation de ";" pour le format CSV français

    const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historique_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification(`${filteredParticipants.length} ligne(s) exportée(s).`, 'success');
  };

  // 6. UI Helpers
  const getStatusBadge = (status: Participant['status']) => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case 'approved':
        return <span className={`${base} bg-green-100 text-green-700`}>Approuvé</span>;
      case 'rejected':
        return <span className={`${base} bg-red-100 text-red-700`}>Rejeté</span>;
      default:
        return <span className={`${base} bg-yellow-100 text-yellow-700`}>En attente</span>;
    }
  };

  const CardView: React.FC<{ participant: Participant }> = ({ participant }) => {
    const template = templates.find(t => t.id === participant.templateId);
    return (
      <div className="bg-white p-4 shadow-lg rounded-xl border border-gray-100 transition-shadow hover:shadow-md mb-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-gray-900 truncate">{participant.participantName}</h3>
          {getStatusBadge(participant.status)}
        </div>

        <div className="text-sm space-y-2 text-gray-700 border-t pt-3">
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2 text-indigo-500" />
            <span className="truncate">{participant.email}</span>
          </div>
          <div className="flex items-center">
            <FileText className="w-4 h-4 mr-2 text-gray-500" />
            <span className="font-mono text-xs text-gray-600">{participant.certificateNumber || 'N°: -'}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-xs">Demande: {new Date(participant.requestDate).toLocaleDateString('fr-FR')}</span>
          </div>
          {participant.approvalDate && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="text-xs">Approuvé: {new Date(participant.approvalDate).toLocaleDateString('fr-FR')}</span>
            </div>
          )}
          {participant.status === 'rejected' && participant.rejectionReason && (
            <p className="text-xs text-red-600 pt-1 border-t border-red-100 mt-2">
              Raison: <span className="font-medium">{participant.rejectionReason}</span>
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t flex justify-end space-x-2">
          {participant.status === 'approved' && (
            <button
              onClick={() => handleResendCertificate(participant)}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium shadow-md"
              title="Renvoyer le certificat"
            >
              <Send className="w-3 h-3 mr-1" />
              Renvoyer
            </button>
          )}
          <button
            className="flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs font-medium"
            title="Voir les détails"
            disabled // Ajouté pour la démo
          >
            <Eye className="w-3 h-3 mr-1" />
            Détails
          </button>
        </div>
      </div>
    );
  };


  if (isLoading || !isAuthReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-indigo-600 font-semibold">Chargement des données...</p>
          <p className="text-xs text-gray-400 mt-2">Authentification en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Notification {...notification} onClose={() => setNotification(null)} />

      {/* Header */}
      <div className="bg-white shadow-lg sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="flex items-center text-gray-500 hover:text-indigo-600 mr-4 transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Historique des Demandes</h1>
          </div>
          <button
            onClick={exportFilteredCSV}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-medium shadow-md shadow-indigo-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter ({filteredParticipants.length})
          </button>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Affichage de l'ID utilisateur pour la collaboration/débuggage (MANDATORY) */}
        <div className="text-xs text-gray-500 mb-4 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
          ID Utilisateur: <span className="font-mono text-gray-700 break-all">{userId}</span>
        </div>


         {/* Summary Stats */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Approuvé"
            value={filteredParticipants.filter(p => p.status === 'approved').length}
            color="green"
          />
          <StatCard
            title="Total Rejeté"
            value={filteredParticipants.filter(p => p.status === 'rejected').length}
            color="red"
          />
          <StatCard
            title="En Attente"
            value={filteredParticipants.filter(p => p.status === 'pending').length}
            color="yellow"
          />
        </div> <br /> <br />

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6 items-end">
            {/* Search */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-xs font-medium text-gray-500 uppercase mb-1">Recherche Globale</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Nom, email, ou n° certificat..."
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-xs font-medium text-gray-500 uppercase mb-1">Statut</label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvées</option>
                <option value="rejected">Rejetées</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex justify-between items-center md:items-end">
              <div className="flex-grow">
                <label htmlFor="period" className="block text-xs font-medium text-gray-500 uppercase mb-1">Période</label>
                <select
                  id="period"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none"
                >
                  <option value="all">Toutes les dates</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                </select>
              </div>
              <div className="hidden md:block ml-4 text-sm font-semibold text-indigo-600 whitespace-nowrap p-3 rounded-xl bg-indigo-50">
                {filteredParticipants.length} Résultat(s)
              </div>
            </div>
          </div>
          <div className="md:hidden mt-4 text-center text-sm font-semibold text-indigo-600 p-2 rounded-lg bg-indigo-50">
            {filteredParticipants.length} Résultat(s)
          </div>
        </div>

        {/* Results */}
        <div className="w-full">
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-100">
              <FileText className="w-20 h-20 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune Demande Trouvée</h3>
              <p className="text-gray-500">Ajustez vos filtres ou effectuez une nouvelle recherche.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-x-auto border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Participant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Dates</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Certificat</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Template</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredParticipants.map((participant) => {
                      const template = templates.find(t => t.id === participant.templateId);
                      return (
                        <tr key={participant.id} className="hover:bg-indigo-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <User className="h-5 w-5 text-indigo-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">{participant.participantName}</div>
                                <div className="text-xs text-gray-500 flex items-center mt-1">
                                  <Mail className="w-3 h-3 mr-1" />
                                  {participant.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              {getStatusBadge(participant.status)}
                              {participant.status === 'rejected' && participant.rejectionReason && (
                                <div className="text-xs text-red-600 pt-1 max-w-[150px] truncate" title={participant.rejectionReason}>
                                  Raison: {participant.rejectionReason}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                Demande: {new Date(participant.requestDate).toLocaleDateString('fr-FR')}
                              </div>
                              {participant.approvalDate && (
                                <div className="flex items-center text-green-600">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Approuvé: {new Date(participant.approvalDate).toLocaleDateString('fr-FR')}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {participant.certificateNumber ? (
                              <div className="text-sm">
                                <div className="font-mono text-gray-900 font-medium">{participant.certificateNumber}</div>
                                <div className="text-xs text-gray-500">Généré</div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {template ? (
                              <div>
                                <div className="font-medium text-gray-800">{template.name}</div>
                                <div className="text-xs text-indigo-500">{template.type}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {participant.status === 'approved' && (
                                <button
                                  onClick={() => handleResendCertificate(participant)}
                                  className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium"
                                  title="Renvoyer le certificat"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                className="flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs font-medium"
                                title="Voir les détails"
                                disabled // Ajouté pour la démo
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredParticipants.map(participant => (
                  <CardView key={participant.id} participant={participant} />
                ))}
              </div>
            </>
          )}
        </div>

       
      </div>
    </div>
  );
};

// Helper component for statistics cards
const StatCard: React.FC<{ title: string, value: number, color: 'green' | 'red' | 'yellow' }> = ({ title, value, color }) => {
  const colorMap = {
    green: { bg: 'bg-green-100', text: 'text-green-600', shadow: 'shadow-green-100' },
    red: { bg: 'bg-red-100', text: 'text-red-600', shadow: 'shadow-red-100' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', shadow: 'shadow-yellow-100' },
  };
  const colors = colorMap[color];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transition-all hover:shadow-xl">
      <div className="flex items-center">
        <div className={`p-3 ${colors.bg} rounded-full`}>
          <FileText className={`w-6 h-6 ${colors.text}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;