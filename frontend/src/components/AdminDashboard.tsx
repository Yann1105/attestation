import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  Send,
  Eye,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  FileText,
  X,
  Mail,
  Award,
  User,
  Building,
  MapPin,
  Clock as ClockIcon,
  Share
} from 'lucide-react';
import { Participant, CertificateTemplate } from '../types';
import { participantsApi, emailApi, generateCertificateNumber, templatesApi, certificateApi, getAuthToken } from '../utils/api';
import { notifications } from '../utils/notifications';

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigate: (page: string) => void;
  onGoToParticipant?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onNavigate, onGoToParticipant }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showQuickApprovalModal, setShowQuickApprovalModal] = useState(false);
  const [trainingData, setTrainingData] = useState({
    organization: '',
    trainingTitle: '',
    trainingDate: '',
    trainingLocation: '',
    trainingDuration: '',
    instructor: ''
  });
  const [filter, setFilter] = useState({
    status: 'all',
    dateRange: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateData, setCertificateData] = useState<any>(null);
  const [isLoadingCertificate, setIsLoadingCertificate] = useState(false);

  const itemsPerPage = 6;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [participantsData, templatesData] = await Promise.all([
        participantsApi.getAll(),
        templatesApi.getAll()
      ]);
      setParticipants(participantsData);

      // Sort templates: Canvas first, then HTML
      const sortedTemplates = templatesData.sort((a, b) => {
        const aHasCanvas = !!a.canvasData;
        const bHasCanvas = !!b.canvasData;

        if (aHasCanvas && !bHasCanvas) return -1;
        if (!aHasCanvas && bHasCanvas) return 1;
        return 0; // Maintain original order for same type
      });

      setTemplates(sortedTemplates);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredParticipants = participants.filter(participant => {
    if (filter.status !== 'all' && participant.status !== filter.status) return false;
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedParticipants = filteredParticipants.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleApproveClick = (participant: Participant) => {
    setSelectedParticipant(participant);
    setTrainingData({
      organization: participant.organization || '',
      trainingTitle: participant.trainingTitle || '',
      trainingDate: participant.trainingDate || '',
      trainingLocation: participant.trainingLocation || '',
      trainingDuration: participant.trainingDuration || '',
      instructor: participant.instructor || ''
    });
    setShowApprovalModal(true);
  };

  const handleQuickApproveClick = (participant: Participant) => {
    setSelectedParticipant(participant);
    setShowQuickApprovalModal(true);
  };

  const handleApprove = async () => {
    if (!selectedParticipant || !selectedTemplate) return;

    // Validate that all required training data is provided
    if (!trainingData.trainingTitle || !trainingData.trainingDate || !trainingData.trainingLocation ||
        !trainingData.trainingDuration || !trainingData.instructor || !trainingData.organization) {
      notifications.warning('Informations manquantes', 'Veuillez remplir tous les champs obligatoires de formation avant de procéder à l\'approbation.');
      return;
    }

    setIsProcessing(true);
    try {
      // Use the new approve endpoint that handles everything
      const response = await fetch(`/api/participants/${selectedParticipant.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          templateId: selectedTemplate,
          trainingData: trainingData
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update the participant in the local state
        const updatedParticipant: Participant = {
          ...selectedParticipant,
          status: 'approved' as const,
          certificateNumber: result.certificateNumber,
          approvalDate: new Date().toISOString().split('T')[0],
          templateId: selectedTemplate
        };

        setParticipants(prev => prev.map(p =>
          p.id === selectedParticipant.id ? updatedParticipant : p
        ));

        // Show success notification
        showNotification(
          `✅ Certificat généré et envoyé à ${selectedParticipant.participantName}!`,
          'success',
          `📧 Email: ${selectedParticipant.email}\n📄 Certificat généré et envoyé\n🎨 Template utilisé\n✉️ Email envoyé avec pièce jointe PDF`
        );
      } else {
        throw new Error(result.error || 'Erreur lors de l\'approbation');
      }
    } catch (error) {
      console.error('Failed to approve participant:', error);
      showNotification(
        `❌ Erreur lors de l'approbation de ${selectedParticipant.participantName}`,
        'error',
        'Veuillez réessayer ou contacter le support technique'
      );
    } finally {
      setIsProcessing(false);
      setShowApprovalModal(false);
      setSelectedParticipant(null);
      setSelectedTemplate('');
      setTrainingData({
        organization: '',
        trainingTitle: '',
        trainingDate: '',
        trainingLocation: '',
        trainingDuration: '',
        instructor: ''
      });
    }
  };

  const handleQuickApprove = async () => {
    if (!selectedParticipant || !selectedTemplate) return;

    setIsProcessing(true);
    try {
      // Use the new approve endpoint that handles everything
      const response = await fetch(`/api/participants/${selectedParticipant.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          templateId: selectedTemplate,
          // Use participant data for quick approval
          trainingData: {
            trainingTitle: selectedParticipant.trainingTitle || 'Formation Professionnelle',
            trainingDate: selectedParticipant.trainingDate || new Date().toISOString().split('T')[0],
            trainingLocation: selectedParticipant.trainingLocation || 'BIMADES Consulting',
            trainingDuration: selectedParticipant.trainingDuration || '1 jour',
            instructor: 'Aimé SAWADO',
            organization: selectedParticipant.organization || 'BIMADES Consulting'
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update the participant in the local state
        const updatedParticipant: Participant = {
          ...selectedParticipant,
          status: 'approved' as const,
          certificateNumber: result.certificateNumber,
          approvalDate: new Date().toISOString().split('T')[0],
          templateId: selectedTemplate
        };

        setParticipants(prev => prev.map(p =>
          p.id === selectedParticipant.id ? updatedParticipant : p
        ));

        // Show success notification
        showNotification(
          `⚡ Approbation rapide réussie pour ${selectedParticipant.participantName}!`,
          'success',
          `📧 Email: ${selectedParticipant.email}\n📄 Certificat généré et envoyé\n🎨 Template utilisé\n✉️ Email envoyé avec pièce jointe PDF`
        );
      } else {
        throw new Error(result.error || 'Erreur lors de l\'approbation');
      }
    } catch (error) {
      console.error('Failed to approve participant:', error);
      showNotification(
        `❌ Erreur lors de l'approbation rapide de ${selectedParticipant.participantName}`,
        'error',
        'Veuillez réessayer ou contacter le support technique'
      );
    } finally {
      setIsProcessing(false);
      setShowQuickApprovalModal(false);
      setSelectedParticipant(null);
      setSelectedTemplate('');
    }
  };

  // Fonction pour afficher des notifications améliorées
  const showNotification = (message: string, type: 'success' | 'error' | 'warning', details?: string) => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-600' : type === 'warning' ? 'bg-yellow-600' : 'bg-red-600';
    const icon = type === 'success'
      ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'
      : type === 'warning'
      ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>'
      : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
    
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl z-50 max-w-md`;
    notification.innerHTML = `
      <div class="flex items-start">
        <svg class="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${icon}
        </svg>
        <div class="flex-1">
          <div class="font-semibold text-sm">${message}</div>
          ${details ? `<div class="text-xs mt-2 opacity-90 whitespace-pre-line">${details}</div>` : ''}
          <div class="text-xs mt-2 opacity-75">${new Date().toLocaleTimeString('fr-FR')}</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    notification.style.transform = 'translateX(100%)';
    notification.style.transition = 'transform 0.3s ease-out';
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto-suppression après 8 secondes
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
      }
    }, 8000);
  };

  const handleRejectClick = (participant: Participant) => {
    setSelectedParticipant(participant);
    setShowRejectionModal(true);
  };

  const handleReject = async () => {
    if (!selectedParticipant) return;

    setIsProcessing(true);
    try {
      const updates = {
        status: 'rejected' as const,
        rejectionReason: rejectionReason || 'Raison non spécifiée'
      };
      
      const updatedParticipant = await participantsApi.update(selectedParticipant.id, updates);
      setParticipants(prev => prev.map(p => 
        p.id === selectedParticipant.id ? updatedParticipant : p
      ));

      notifications.success(`Demande rejetée`, `La demande de ${selectedParticipant.participantName} a été rejetée avec succès.`);
    } catch (error) {
      console.error('Failed to reject participant:', error);
      notifications.error('Erreur lors du rejet', 'Une erreur s\'est produite lors du rejet de la demande. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
      setShowRejectionModal(false);
      setSelectedParticipant(null);
      setRejectionReason('');
    }
  };

  const handleResendCertificate = async (participant: Participant) => {
    if (participant.status !== 'approved') return;

    try {
      const template = templates.find(t => t.id === participant.templateId);
      if (template) {
        const certificateData = {
          participantName: participant.participantName,
          certificateNumber: participant.certificateNumber,
          template
        };

        await emailApi.sendCertificate(participant.email, certificateData);
        notifications.success(`Certificat renvoyé !`, `Le certificat a été envoyé avec succès à ${participant.participantName} (${participant.email}).`);
      }
    } catch (error) {
      console.error('Failed to resend certificate:', error);
      notifications.error('Erreur lors du renvoi', 'Une erreur s\'est produite lors de l\'envoi du certificat. Veuillez réessayer.');
    }
  };

  const handleViewCertificate = async (participant: Participant) => {
    if (participant.status !== 'approved') return;

    setIsLoadingCertificate(true);
    setShowCertificateModal(true);

    try {
      const result = await certificateApi.viewCertificate(participant.id);
      if (result.success) {
        setCertificateData(result.data);
      } else {
        showNotification(
          `❌ Erreur lors du chargement du certificat`,
          'error',
          'Veuillez réessayer ou contacter le support technique'
        );
        setShowCertificateModal(false);
      }
    } catch (error) {
      console.error('Failed to view certificate:', error);
      showNotification(
        `❌ Erreur lors du chargement du certificat`,
        'error',
        'Veuillez réessayer ou contacter le support technique'
      );
      setShowCertificateModal(false);
    } finally {
      setIsLoadingCertificate(false);
    }
  };

  const exportCSV = () => {
    const csvContent = [
      ['Nom', 'Email', 'Statut', 'Date demande', 'N° Certificat', 'Template'],
      ...filteredParticipants.map(p => [
        p.participantName,
        p.email,
        p.status === 'approved' ? 'Approuvé' : p.status === 'rejected' ? 'Rejeté' : 'En attente',
        p.requestDate,
        p.certificateNumber || '',
        p.templateId ? templates.find(t => t.id === p.templateId)?.name || '' : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'participants.csv';
    link.click();
  };

  const shareParticipantFormLink = async () => {
    const participantFormUrl = window.location.origin + window.location.pathname.replace(/\/admin.*$/, '');

    try {
      await navigator.clipboard.writeText(participantFormUrl);
      showNotification(
        `✅ Lien du formulaire participant copié !`,
        'success',
        `📋 URL: ${participantFormUrl}\n🔗 Vous pouvez maintenant partager ce lien avec les participants`
      );
    } catch (_error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = participantFormUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      showNotification(
        `✅ Lien du formulaire participant copié !`,
        'success',
        `📋 URL: ${participantFormUrl}\n🔗 Vous pouvez maintenant partager ce lien avec les participants`
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Approuvé</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Rejeté</span>;
      default:
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">En attente</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h2 className="text-xl font-bold text-white">Administration</h2>
          <p className="text-blue-100 text-sm">Gestion des attestations</p>
        </div>
        
        <nav className="mt-6">
          <div className="px-6 space-y-2">
            {onGoToParticipant && (
              <button
                onClick={onGoToParticipant}
                className="w-full flex items-center px-4 py-3 text-left hover:bg-green-50 rounded-lg transition-colors text-green-600 bg-green-50"
              >
                <User className="w-5 h-5 mr-3" />
                Formulaire Participant
              </button>
            )}
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full flex items-center px-4 py-3 text-left hover:bg-blue-50 rounded-lg transition-colors text-blue-600 bg-blue-50"
            >
              <Users className="w-5 h-5 mr-3" />
              Demandes
            </button>
            <button
              onClick={() => onNavigate('templates')}
              className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
            >
              <FileText className="w-5 h-5 mr-3" />
              Templates
            </button>
            <button
              onClick={() => onNavigate('history')}
              className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
            >
              <Clock className="w-5 h-5 mr-3" />
              Historique
            </button>
            <button
              onClick={() => onNavigate('trainings')}
              className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
            >
              <Calendar className="w-5 h-5 mr-3" />
              Formations
            </button>
            <button
              onClick={() => onNavigate('statistics')}
              className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
            >
              <BarChart3 className="w-5 h-5 mr-3" />
              Statistiques
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
            >
              <Settings className="w-5 h-5 mr-3" />
              Paramètres
            </button>
          </div>
          
          <div className="mt-8 px-6">
            <button
              onClick={onLogout}
              className="w-full flex items-center px-4 py-3 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Déconnexion
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
              <p className="text-gray-600">Gérez les demandes d'attestations de formation</p>
            </div>
            <button
              onClick={shareParticipantFormLink}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Share className="w-4 h-4 mr-2" />
              Partager le formulaire
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {participants.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approuvées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {participants.filter(p => p.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejetées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {participants.filter(p => p.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{participants.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <Filter className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">Filtres:</span>
            </div>
            
            <select
              value={filter.status}
              onChange={(e) => {
                setFilter({ ...filter, status: e.target.value });
                setCurrentPage(1); // Reset to first page when filter changes
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvées</option>
              <option value="rejected">Rejetées</option>
            </select>
            
            <button
              onClick={exportCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Participants table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date demande
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Certificat
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedParticipants.map((participant) => (
                  <tr key={participant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{participant.participantName}</div>
                        <div className="text-sm text-gray-500">{participant.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(participant.requestDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(participant.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                      {participant.certificateNumber || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {participant.templateId ? 
                        templates.find(t => t.id === participant.templateId)?.name || 'Template supprimé'
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {participant.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveClick(participant)}
                              className="flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-xs"
                            >
                              <Award className="w-3 h-3 mr-1" />
                              Complet
                            </button>
                            <button
                              onClick={() => handleQuickApproveClick(participant)}
                              className="flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Rapide
                            </button>
                            <button
                              onClick={() => handleRejectClick(participant)}
                              className="flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-xs"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Rejeter
                            </button>
                          </>
                        )}
                        {participant.status === 'approved' && (
                          <button 
                            onClick={() => handleResendCertificate(participant)}
                            className="flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Renvoyer
                          </button>
                        )}
                        <button
                          onClick={() => handleViewCertificate(participant)}
                          className="flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-xs"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Voir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredParticipants.length)} sur {filteredParticipants.length} résultats
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Approuver la Demande d'Attestation</h3>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setTrainingData({
                    organization: '',
                    trainingTitle: '',
                    trainingDate: '',
                    trainingLocation: '',
                    trainingDuration: '',
                    instructor: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Participant Info */}
            <div className="bg-white border-2 border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-center mb-3">
                <User className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-semibold text-blue-900">Informations du Participant</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Nom complet</label>
                  <p className="text-blue-900 font-semibold">{selectedParticipant.participantName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Email</label>
                  <p className="text-blue-900">{selectedParticipant.email}</p>
                </div>
              </div>
            </div>

            {/* Certificate Information Form */}
            <div className="bg-white space-y-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Informations de Formation *</h4>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organisation *</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={trainingData.organization}
                      onChange={(e) => setTrainingData({ ...trainingData, organization: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nom de l'organisation"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titre de la formation *</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={trainingData.trainingTitle}
                      onChange={(e) => setTrainingData({ ...trainingData, trainingTitle: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Titre de la formation"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de formation *</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      value={trainingData.trainingDate}
                      onChange={(e) => setTrainingData({ ...trainingData, trainingDate: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lieu de formation *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={trainingData.trainingLocation}
                      onChange={(e) => setTrainingData({ ...trainingData, trainingLocation: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Lieu de la formation"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Durée *</label>
                  <div className="relative">
                    <ClockIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={trainingData.trainingDuration}
                      onChange={(e) => setTrainingData({ ...trainingData, trainingDuration: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Durée de la formation (ex: 2 jours)"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Formateur *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={trainingData.instructor}
                      onChange={(e) => setTrainingData({ ...trainingData, instructor: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nom du formateur"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template de certificat *
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choisir un template...</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white border-2 border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-green-800 font-medium">Génération et envoi automatiques</p>
                  <p className="text-xs text-green-600 mt-1">
                    • Le nom "{selectedParticipant.participantName}" sera automatiquement inséré dans le certificat<br />
                    • Toutes les informations de formation fournies par le participant seront intégrées dans le template choisi<br />
                    • Le certificat sera généré et envoyé par email après approbation
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setTrainingData({
                    organization: '',
                    trainingTitle: '',
                    trainingDate: '',
                    trainingLocation: '',
                    trainingDuration: '',
                    instructor: ''
                  });
                }}
                className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleApprove}
                disabled={!selectedTemplate || isProcessing}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isProcessing ? 'Traitement...' : 'Approuver et Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Approval Modal */}
      {showQuickApprovalModal && selectedParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Approbation Rapide</h3>
              <button
                onClick={() => setShowQuickApprovalModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Participant: <strong>{selectedParticipant.participantName}</strong>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Email: <strong>{selectedParticipant.email}</strong>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner un template de certificat *
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choisir un template...</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Approbation rapide</p>
                  <p className="text-xs text-blue-600">
                    Le nom "{selectedParticipant.participantName}" sera automatiquement ajouté au template sélectionné 
                    et le certificat sera envoyé par email.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowQuickApprovalModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleQuickApprove}
                disabled={!selectedTemplate || isProcessing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Traitement...' : 'Approuver et Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Rejeter la demande</h3>
              <button
                onClick={() => setShowRejectionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Participant: <strong>{selectedParticipant.participantName}</strong>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison du rejet (optionnel)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Expliquez la raison du rejet..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Traitement...' : 'Rejeter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate View Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Visualisation du Certificat</h3>
              <button
                onClick={() => {
                  setShowCertificateModal(false);
                  setCertificateData(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingCertificate ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement du certificat...</p>
                </div>
              </div>
            ) : certificateData ? (
              <div className="space-y-4">
                {/* Certificate Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Informations du certificat</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Participant:</span>
                      <span className="ml-2 text-gray-900">{certificateData.participant.participantName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">N° Certificat:</span>
                      <span className="ml-2 text-gray-900 font-mono">{certificateData.participant.certificateNumber}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="ml-2 text-gray-900">{certificateData.participant.email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Date d'approbation:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(certificateData.participant.approvalDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Certificate Preview */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-900">Aperçu du certificat</h4>
                  </div>
                  <div className="p-4 max-h-96 overflow-y-auto">
                    <div
                      className="bg-white border border-gray-300 rounded-lg p-4"
                      dangerouslySetInnerHTML={{ __html: certificateData.html }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Certificat - ${certificateData.participant.certificateNumber}</title>
                              <style>
                                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                                .print-button { display: none; }
                              </style>
                            </head>
                            <body>
                              ${certificateData.html}
                              <script>
                                window.onload = function() {
                                  window.print();
                                  window.close();
                                }
                              </script>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                      }
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Imprimer
                  </button>
                  <button
                    onClick={() => {
                      setShowCertificateModal(false);
                      setCertificateData(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Erreur lors du chargement du certificat</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;