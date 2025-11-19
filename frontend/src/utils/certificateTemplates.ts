import { CertificateTemplate } from '../types';

export const bimadesGoldTemplate: CertificateTemplate = {
  id: 'bimades-gold',
  name: 'BIMADES Gold Certificate',
  type: 'bimades-gold',
  backgroundColor: '#FFFFFF',
  width: 1200,
  height: 850,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  editableAfterSave: true,
  elements: [
    // Background decorative elements
    {
      id: 'bg-decoration-left',
      type: 'shape',
      x: 0,
      y: 0,
      width: 300,
      height: 850,
      backgroundColor: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #92400E 100%)',
      zIndex: 1
    },
    {
      id: 'bg-decoration-right',
      type: 'shape',
      x: 900,
      y: 0,
      width: 300,
      height: 850,
      backgroundColor: 'linear-gradient(225deg, #1E40AF 0%, #1E3A8A 50%, #1E293B 100%)',
      zIndex: 1
    },
    // Gold seal
    {
      id: 'gold-seal',
      type: 'shape',
      x: 50,
      y: 200,
      width: 200,
      height: 200,
      backgroundColor: '#F59E0B',
      borderRadius: 50,
      zIndex: 2
    },
    // Ribbon
    {
      id: 'ribbon',
      type: 'shape',
      x: 120,
      y: 380,
      width: 60,
      height: 150,
      backgroundColor: '#059669',
      zIndex: 3
    },
    // Main title
    {
      id: 'main-title',
      type: 'text',
      x: 350,
      y: 150,
      width: 500,
      height: 80,
      content: 'CERTIFICAT DE FORMATION',
      fontSize: 36,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#1E40AF',
      textAlign: 'center',
      zIndex: 4
    },
    // Certification text
    {
      id: 'certification-text',
      type: 'text',
      x: 350,
      y: 250,
      width: 500,
      height: 40,
      content: 'Par la présente, nous certifions que',
      fontSize: 16,
      fontFamily: 'serif',
      color: '#374151',
      textAlign: 'center',
      zIndex: 4
    },
    // Participant name (dynamic)
    {
      id: 'participant-name',
      type: 'text',
      x: 350,
      y: 300,
      width: 500,
      height: 60,
      content: '{{participantName}}',
      fontSize: 32,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#1E40AF',
      textAlign: 'center',
      zIndex: 4
    },
    // Training title placeholder for quick approval
    {
      id: 'training-title-placeholder',
      type: 'text',
      x: 300,
      y: 420,
      width: 600,
      height: 80,
      content: '{{trainingTitle}}',
      fontSize: 18,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#1E40AF',
      textAlign: 'center',
      zIndex: 4
    },
    // Training description
    {
      id: 'training-description',
      type: 'text',
      x: 350,
      y: 380,
      width: 500,
      height: 40,
      content: 'A participé à la session de formation en',
      fontSize: 14,
      fontFamily: 'serif',
      color: '#374151',
      textAlign: 'center',
      zIndex: 4
    },
    // Training title (dynamic)
    {
      id: 'training-title',
      type: 'text',
      x: 300,
      y: 420,
      width: 600,
      height: 80,
      content: '« {{trainingTitle}} »',
      fontSize: 18,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#1E40AF',
      textAlign: 'center',
      zIndex: 4
    },
    // Training details (dynamic)
    {
      id: 'training-details',
      type: 'text',
      x: 300,
      y: 520,
      width: 600,
      height: 60,
      content: 'Organisée à {{trainingLocation}} du {{trainingDate}} ({{trainingDuration}})',
      fontSize: 14,
      fontFamily: 'serif',
      color: '#374151',
      textAlign: 'center',
      zIndex: 4
    },
    // Certificate validity text
    {
      id: 'validity-text',
      type: 'text',
      x: 300,
      y: 600,
      width: 600,
      height: 40,
      content: 'En foi de quoi le présent certificat lui est délivré pour servir et valoir ce que de droit.',
      fontSize: 14,
      fontFamily: 'serif',
      color: '#374151',
      textAlign: 'center',
      zIndex: 4
    },
    // Issue date (dynamic)
    {
      id: 'issue-date',
      type: 'text',
      x: 300,
      y: 650,
      width: 600,
      height: 40,
      content: 'Fait à {{trainingLocation}} le {{issueDate}}',
      fontSize: 16,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#1E40AF',
      textAlign: 'center',
      zIndex: 4
    },
    // Certificate number
    {
      id: 'certificate-number',
      type: 'text',
      x: 50,
      y: 750,
      width: 200,
      height: 40,
      content: 'N° {{certificateNumber}}',
      fontSize: 14,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#1E40AF',
      textAlign: 'left',
      zIndex: 4
    },
    // Instructor signature
    {
      id: 'instructor-signature',
      type: 'text',
      x: 750,
      y: 720,
      width: 200,
      height: 60,
      content: '{{instructor}}\nConsultant Formateur',
      fontSize: 14,
      fontFamily: 'serif',
      color: '#374151',
      textAlign: 'center',
      zIndex: 4
    }
  ]
};

export const bimadesGreenTemplate: CertificateTemplate = {
  id: 'bimades-green',
  name: 'BIMADES Green Certificate',
  type: 'bimades-green',
  backgroundColor: '#FFFFFF',
  width: 1200,
  height: 850,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  editableAfterSave: true,
  elements: [
    // Background gradient
    {
      id: 'bg-gradient',
      type: 'shape',
      x: 0,
      y: 0,
      width: 1200,
      height: 850,
      backgroundColor: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
      zIndex: 1
    },
    // Green accent shape
    {
      id: 'green-accent',
      type: 'shape',
      x: 900,
      y: 0,
      width: 300,
      height: 850,
      backgroundColor: 'linear-gradient(225deg, #059669 0%, #047857 50%, #065F46 100%)',
      zIndex: 2
    },
    // Navy accent shape
    {
      id: 'navy-accent',
      type: 'shape',
      x: 1000,
      y: 0,
      width: 200,
      height: 850,
      backgroundColor: 'linear-gradient(225deg, #1E40AF 0%, #1E3A8A 100%)',
      zIndex: 3
    },
    // BIMADES logo area
    {
      id: 'logo-area',
      type: 'text',
      x: 100,
      y: 80,
      width: 300,
      height: 120,
      content: 'BIMADES\nConsulting',
      fontSize: 32,
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      color: '#1E40AF',
      textAlign: 'left',
      zIndex: 4
    },
    // Certificate number (top right)
    {
      id: 'certificate-number-top',
      type: 'text',
      x: 950,
      y: 50,
      width: 200,
      height: 40,
      content: 'N°{{certificateNumber}}',
      fontSize: 16,
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      color: '#FFFFFF',
      textAlign: 'center',
      zIndex: 5
    },
    // Main title
    {
      id: 'main-title',
      type: 'text',
      x: 100,
      y: 280,
      width: 700,
      height: 120,
      content: 'CERTIFICAT\nDE FORMATION',
      fontSize: 48,
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      color: '#1E40AF',
      textAlign: 'left',
      zIndex: 4
    },
    // Certification text
    {
      id: 'certification-text',
      type: 'text',
      x: 100,
      y: 420,
      width: 700,
      height: 40,
      content: 'Par la présente, nous certifions que:',
      fontSize: 16,
      fontFamily: 'sans-serif',
      color: '#374151',
      textAlign: 'left',
      zIndex: 4
    },
    // Participant name (dynamic)
    {
      id: 'participant-name',
      type: 'text',
      x: 100,
      y: 470,
      width: 700,
      height: 60,
      content: '{{participantName}}',
      fontSize: 36,
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      color: '#059669',
      textAlign: 'left',
      zIndex: 4
    },
    // Training title placeholder for quick approval
    {
      id: 'training-title-placeholder-green',
      type: 'text',
      x: 100,
      y: 580,
      width: 700,
      height: 40,
      content: '{{trainingTitle}}',
      fontSize: 18,
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      color: '#1E40AF',
      textAlign: 'left',
      zIndex: 4
    },
    // Training description
    {
      id: 'training-description',
      type: 'text',
      x: 100,
      y: 540,
      width: 700,
      height: 40,
      content: 'a participé avec succès au séminaire international de formation en',
      fontSize: 16,
      fontFamily: 'sans-serif',
      color: '#374151',
      textAlign: 'left',
      zIndex: 4
    },
    // Training title (dynamic)
    {
      id: 'training-title',
      type: 'text',
      x: 100,
      y: 580,
      width: 700,
      height: 40,
      content: '«{{trainingTitle}}»',
      fontSize: 18,
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      color: '#1E40AF',
      textAlign: 'left',
      zIndex: 4
    },
    // Training details (dynamic)
    {
      id: 'training-details',
      type: 'text',
      x: 100,
      y: 620,
      width: 700,
      height: 40,
      content: 'tenu à {{trainingLocation}} du {{trainingDate}}.',
      fontSize: 16,
      fontFamily: 'sans-serif',
      color: '#374151',
      textAlign: 'left',
      zIndex: 4
    },
    // Certificate validity text
    {
      id: 'validity-text',
      type: 'text',
      x: 100,
      y: 680,
      width: 700,
      height: 60,
      content: 'En foi de quoi le présent certificat lui est délivré pour servir et valoir ce que de droit.',
      fontSize: 14,
      fontFamily: 'sans-serif',
      color: '#374151',
      textAlign: 'left',
      zIndex: 4
    },
    // Issue date (dynamic)
    {
      id: 'issue-date',
      type: 'text',
      x: 100,
      y: 740,
      width: 400,
      height: 40,
      content: 'Fait à {{trainingLocation}} le {{issueDate}}',
      fontSize: 16,
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      color: '#1E40AF',
      textAlign: 'left',
      zIndex: 4
    },
    // Organization name
    {
      id: 'organization-name',
      type: 'text',
      x: 600,
      y: 720,
      width: 250,
      height: 40,
      content: 'BIMADES Consulting',
      fontSize: 16,
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      color: '#1E40AF',
      textAlign: 'center',
      zIndex: 4
    },
    // Instructor signature
    {
      id: 'instructor-signature',
      type: 'text',
      x: 600,
      y: 760,
      width: 250,
      height: 60,
      content: '{{instructor}}\nEconomiste-Planificateur\nConsultant Formateur',
      fontSize: 12,
      fontFamily: 'sans-serif',
      color: '#374151',
      textAlign: 'center',
      zIndex: 4
    }
  ]
};

export const bimadesBlueTemplate: CertificateTemplate = {
  id: 'bimades-blue',
  name: 'BIMADES Blue Certificate',
  type: 'bimades-blue',
  backgroundColor: '#FFFFFF',
  width: 1200,
  height: 850,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  editableAfterSave: true,
  elements: [
    // Background decorative elements
    {
      id: 'bg-decoration-left',
      type: 'shape',
      x: 0,
      y: 0,
      width: 300,
      height: 850,
      backgroundColor: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 50%, #1E3A8A 100%)',
      zIndex: 1
    },
    {
      id: 'bg-decoration-right',
      type: 'shape',
      x: 900,
      y: 0,
      width: 300,
      height: 850,
      backgroundColor: 'linear-gradient(225deg, #1E40AF 0%, #1E3A8A 50%, #0F172A 100%)',
      zIndex: 1
    },
    // Blue seal
    {
      id: 'blue-seal',
      type: 'shape',
      x: 50,
      y: 200,
      width: 200,
      height: 200,
      backgroundColor: '#3B82F6',
      borderRadius: 50,
      zIndex: 2
    },
    // Ribbon
    {
      id: 'ribbon',
      type: 'shape',
      x: 120,
      y: 380,
      width: 60,
      height: 150,
      backgroundColor: '#1D4ED8',
      zIndex: 3
    },
    // Main title
    {
      id: 'main-title',
      type: 'text',
      x: 350,
      y: 150,
      width: 500,
      height: 80,
      content: 'CERTIFICAT DE FORMATION',
      fontSize: 36,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#1E40AF',
      textAlign: 'center',
      zIndex: 4
    },
    // Certification text
    {
      id: 'certification-text',
      type: 'text',
      x: 350,
      y: 250,
      width: 500,
      height: 40,
      content: 'Par la présente, nous certifions que',
      fontSize: 16,
      fontFamily: 'serif',
      color: '#374151',
      textAlign: 'center',
      zIndex: 4
    },
    // Participant name (dynamic)
    {
      id: 'participant-name',
      type: 'text',
      x: 350,
      y: 300,
      width: 500,
      height: 60,
      content: '{{participantName}}',
      fontSize: 32,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#1E40AF',
      textAlign: 'center',
      zIndex: 4
    },
    // Training title placeholder for quick approval
    {
      id: 'training-title-placeholder',
      type: 'text',
      x: 300,
      y: 420,
      width: 600,
      height: 80,
      content: '{{trainingTitle}}',
      fontSize: 18,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#1E40AF',
      textAlign: 'center',
      zIndex: 4
    },
    // Training description
    {
      id: 'training-description',
      type: 'text',
      x: 350,
      y: 380,
      width: 500,
      height: 40,
      content: 'A participé à la session de formation en',
      fontSize: 14,
      fontFamily: 'serif',
      color: '#374151',
      textAlign: 'center',
      zIndex: 4
    },
    // Training title (dynamic)
    {
      id: 'training-title',
      type: 'text',
      x: 300,
      y: 420,
      width: 600,
      height: 80,
      content: '« {{trainingTitle}} »',
      fontSize: 18,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#1E40AF',
      textAlign: 'center',
      zIndex: 4
    },
    // Training details (dynamic)
    {
      id: 'training-details',
      type: 'text',
      x: 300,
      y: 520,
      width: 600,
      height: 60,
      content: 'Organisée à {{trainingLocation}} du {{trainingDate}} ({{trainingDuration}})',
      fontSize: 14,
      fontFamily: 'serif',
      color: '#374151',
      textAlign: 'center',
      zIndex: 4
    },
    // Certificate validity text
    {
      id: 'validity-text',
      type: 'text',
      x: 300,
      y: 600,
      width: 600,
      height: 40,
      content: 'En foi de quoi le présent certificat lui est délivré pour servir et valoir ce que de droit.',
      fontSize: 14,
      fontFamily: 'serif',
      color: '#374151',
      textAlign: 'center',
      zIndex: 4
    },
    // Issue date (dynamic)
    {
      id: 'issue-date',
      type: 'text',
      x: 300,
      y: 650,
      width: 600,
      height: 40,
      content: 'Fait à {{trainingLocation}} le {{issueDate}}',
      fontSize: 16,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#1E40AF',
      textAlign: 'center',
      zIndex: 4
    },
    // Certificate number
    {
      id: 'certificate-number',
      type: 'text',
      x: 50,
      y: 750,
      width: 200,
      height: 40,
      content: 'N° {{certificateNumber}}',
      fontSize: 14,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#1E40AF',
      textAlign: 'left',
      zIndex: 4
    },
    // Instructor signature
    {
      id: 'instructor-signature',
      type: 'text',
      x: 750,
      y: 720,
      width: 200,
      height: 60,
      content: '{{instructor}}\nConsultant Formateur',
      fontSize: 14,
      fontFamily: 'serif',
      color: '#374151',
      textAlign: 'center',
      zIndex: 4
    }
  ]
};

export const simpleEditorTemplate: CertificateTemplate = {
  id: 'simple-editor',
  name: 'Ajoute Éditeur Simple',
  type: 'custom',
  editorType: 'simple',
  backgroundColor: '#FFFFFF',
  width: 1200,
  height: 850,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  editableAfterSave: true,
  elements: [
    // Main title
    {
      id: 'main-title',
      type: 'text',
      x: 400,
      y: 150,
      width: 400,
      height: 60,
      content: 'CERTIFICAT DE FORMATION',
      fontSize: 28,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#1E40AF',
      textAlign: 'center',
      zIndex: 4
    },
    // Participant name
    {
      id: 'participant-name',
      type: 'text',
      x: 400,
      y: 250,
      width: 400,
      height: 50,
      content: '{{participantName}}',
      fontSize: 24,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#1E40AF',
      textAlign: 'center',
      zIndex: 4
    },
    // Training title
    {
      id: 'training-title',
      type: 'text',
      x: 400,
      y: 350,
      width: 400,
      height: 40,
      content: '{{trainingTitle}}',
      fontSize: 18,
      fontFamily: 'serif',
      color: '#374151',
      textAlign: 'center',
      zIndex: 4
    },
    // Training details
    {
      id: 'training-details',
      type: 'text',
      x: 400,
      y: 420,
      width: 400,
      height: 40,
      content: '{{trainingLocation}} - {{trainingDate}}',
      fontSize: 14,
      fontFamily: 'serif',
      color: '#374151',
      textAlign: 'center',
      zIndex: 4
    },
    // Certificate number
    {
      id: 'certificate-number',
      type: 'text',
      x: 50,
      y: 750,
      width: 200,
      height: 40,
      content: 'N° {{certificateNumber}}',
      fontSize: 14,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#1E40AF',
      textAlign: 'left',
      zIndex: 4
    },
    // Issue date
    {
      id: 'issue-date',
      type: 'text',
      x: 750,
      y: 750,
      width: 400,
      height: 40,
      content: 'Fait le {{issueDate}}',
      fontSize: 14,
      fontFamily: 'serif',
      color: '#374151',
      textAlign: 'right',
      zIndex: 4
    }
  ]
};

export const defaultTemplates = [bimadesGoldTemplate, bimadesGreenTemplate, bimadesBlueTemplate, simpleEditorTemplate];
