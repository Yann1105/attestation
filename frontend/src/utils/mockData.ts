import type { Participant, Training, Statistics } from '../types';

// Participants fictifs
export const mockParticipants: Participant[] = [
  {
    id: '1',
    participantName: 'Alice Traoré',
    email: 'alice@example.com',
    phone: '+226 70 12 34 56',
    organization: 'Ministère de la Santé',
    trainingTitle: 'Planification Opérationnelle avec MS Project Professional 2019',
    trainingDate: '2024-02-15',
    trainingLocation: 'Ouagadougou',
    trainingDuration: '30 heures',
    instructor: 'Aimé SAWADO',
    requestDate: '2024-02-01',
    status: 'approved',
    certificateNumber: 'CERT-2024-001',
    approvalDate: '2024-02-02'
  },
  {
    id: '2',
    participantName: 'Moussa Ouédraogo',
    email: 'moussa@example.com',
    phone: '+226 70 23 45 67',
    organization: 'ONG Développement Durable',
    trainingTitle: 'Gestion de Projet Agile',
    trainingDate: '2024-03-10',
    trainingLocation: 'Tenkodogo',
    trainingDuration: '25 heures',
    instructor: 'Judith SOMDA',
    requestDate: '2024-03-05',
    status: 'pending'
  },
  {
    id: '3',
    participantName: 'Fatou Kaboré',
    email: 'fatou@example.com',
    phone: '+226 70 34 56 78',
    organization: 'Banque Centrale',
    trainingTitle: 'Leadership et Management',
    trainingDate: '2024-03-25',
    trainingLocation: 'Bobo-Dioulasso',
    trainingDuration: '20 heures',
    instructor: 'Aimé SAWADO',
    requestDate: '2024-03-20',
    status: 'approved',
    certificateNumber: 'CERT-2024-002',
    approvalDate: '2024-03-21'
  }
];

// Formations fictives
export const mockTrainings: Training[] = [
  {
    id: '1',
    title: 'Planification Opérationnelle avec MS Project Professional 2019',
    date: '2024-02-15',
    location: 'Ouagadougou',
    duration: '30 heures',
    instructor: 'Aimé SAWADO',
    description: 'Formation complète sur la planification de projets avec MS Project',
    organization: "BIMADES Consulting - Bureau International de Management et d'Appui au Développement Economique et Social"
  },
  {
    id: '2',
    title: 'Gestion de Projet Agile',
    date: '2024-03-10',
    location: 'Tenkodogo',
    duration: '25 heures',
    instructor: 'Judith SOMDA',
    description: 'Méthodologies agiles pour la gestion de projet',
    organization: 'BIMADES Consulting'
  },
  {
    id: '3',
    title: 'Leadership et Management',
    date: '2024-03-25',
    location: 'Bobo-Dioulasso',
    duration: '20 heures',
    instructor: 'Aimé SAWADO',
    description: 'Développement des compétences en leadership',
    organization: 'BIMADES Consulting'
  }
];

// Statistiques fictives
export const mockStatistics: Statistics = {
  totalCertified: 125,
  pendingRequests: 8,
  totalTrainings: 12,
  certifiedByTraining: {
    'Planification Opérationnelle avec MS Project Professional 2019': 45,
    'Gestion de Projet Agile': 32,
    'Leadership et Management': 28,
    'Autres': 20
  },
  monthlyStats: {
    'Jan 2024': 15,
    'Fév 2024': 22,
    'Mar 2024': 18,
    'Avr 2024': 25,
    'Mai 2024': 30,
    'Jun 2024': 15
  }
};

// Générateur de numéro de certificat
export function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CERT-${year}-${random}`;
}