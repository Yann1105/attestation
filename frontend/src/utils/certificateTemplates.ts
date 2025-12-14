import { CertificateTemplate } from '../types';

export const bimadesGoldTemplate: CertificateTemplate = {
  id: 'bimades-gold',
  name: 'BIMADES Gold Certificate',
  type: 'bimades-gold',
  backgroundColor: '#F8FAFC',
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
      backgroundColor: 'linear-gradient(135deg, #0B4FA8 0%, #24A346 100%)',
      zIndex: 1
    },
    {
      id: 'bg-decoration-right',
      type: 'shape',
      x: 900,
      y: 0,
      width: 300,
      height: 850,
      backgroundColor: 'linear-gradient(225deg, #24A346 0%, #0B4FA8 100%)',
      zIndex: 1
    },
    // Premium seal
    {
      id: 'gold-seal',
      type: 'shape',
      x: 50,
      y: 200,
      width: 200,
      height: 200,
      backgroundColor: '#24A346',
      borderRadius: 50,
      zIndex: 2
    },
    // Premium ribbon
    {
      id: 'ribbon',
      type: 'shape',
      x: 120,
      y: 380,
      width: 60,
      height: 150,
      backgroundColor: '#0B4FA8',
      zIndex: 3
    },
    // Top border accent
    {
      id: 'top-border',
      type: 'shape',
      x: 0,
      y: 0,
      width: 1200,
      height: 8,
      backgroundColor: '#24A346',
      zIndex: 5
    },
    // Bottom border accent
    {
      id: 'bottom-border',
      type: 'shape',
      x: 0,
      y: 842,
      width: 1200,
      height: 8,
      backgroundColor: '#0B4FA8',
      zIndex: 5
    },
    // Main title
    {
      id: 'main-title',
      type: 'text',
      x: 320,
      y: 120,
      width: 560,
      height: 80,
      content: 'CERTIFICAT DE FORMATION',
      fontSize: 42,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#0B4FA8',
      textAlign: 'center',
      zIndex: 4
    },
    // Certification text
    {
      id: 'certification-text',
      type: 'text',
      x: 320,
      y: 210,
      width: 560,
      height: 35,
      content: 'Par la présente, nous certifions que',
      fontSize: 16,
      fontFamily: 'serif',
      color: '#555555',
      textAlign: 'center',
      zIndex: 4
    },
    // Participant name (dynamic)
    {
      id: 'participant-name',
      type: 'text',
      x: 320,
      y: 260,
      width: 560,
      height: 60,
      content: '{{participantName}}',
      fontSize: 36,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#24A346',
      textAlign: 'center',
      zIndex: 4
    },
    // Training description
    {
      id: 'training-description',
      type: 'text',
      x: 320,
      y: 335,
      width: 560,
      height: 35,
      content: 'A participé à la session de formation en',
      fontSize: 14,
      fontFamily: 'serif',
      color: '#555555',
      textAlign: 'center',
      zIndex: 4
    },
    // Training title (dynamic)
    {
      id: 'training-title',
      type: 'text',
      x: 320,
      y: 385,
      width: 560,
      height: 70,
      content: '« {{trainingTitle}} »',
      fontSize: 20,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#0B4FA8',
      textAlign: 'center',
      zIndex: 4
    },
    // Training details (dynamic)
    {
      id: 'training-details',
      type: 'text',
      x: 320,
      y: 475,
      width: 560,
      height: 50,
      content: 'Organisée à {{trainingLocation}} du {{trainingDate}} ({{trainingDuration}})',
      fontSize: 14,
      fontFamily: 'serif',
      color: '#555555',
      textAlign: 'center',
      zIndex: 4
    },
    // Certificate validity text
    {
      id: 'validity-text',
      type: 'text',
      x: 320,
      y: 545,
      width: 560,
      height: 50,
      content: 'En foi de quoi le présent certificat lui est délivré pour servir et valoir ce que de droit.',
      fontSize: 14,
      fontFamily: 'serif',
      color: '#555555',
      textAlign: 'center',
      zIndex: 4
    },
    // Issue date (dynamic)
    {
      id: 'issue-date',
      type: 'text',
      x: 320,
      y: 610,
      width: 560,
      height: 40,
      content: 'Fait à {{trainingLocation}} le {{issueDate}}',
      fontSize: 16,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#0B4FA8',
      textAlign: 'center',
      zIndex: 4
    },
    // Certificate number
    {
      id: 'certificate-number',
      type: 'text',
      x: 320,
      y: 680,
      width: 560,
      height: 35,
      content: 'N° {{certificateNumber}}',
      fontSize: 14,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#24A346',
      textAlign: 'center',
      zIndex: 4
    },
    // Instructor signature
    {
      id: 'instructor-signature',
      type: 'text',
      x: 320,
      y: 730,
      width: 560,
      height: 60,
      content: '{{instructor}}\nConsultant Formateur',
      fontSize: 14,
      fontFamily: 'serif',
      color: '#555555',
      textAlign: 'center',
      zIndex: 4
    }
  ]
};

export const bimadesGreenTemplate: CertificateTemplate = {
  id: 'bimades-green',
  name: 'BIMADES Green Certificate',
  type: 'bimades-green',
  backgroundColor: '#F0F9F6',
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
      backgroundColor: 'linear-gradient(135deg, #F0F9F6 0%, #E8F8F3 100%)',
      zIndex: 1
    },
    // Premium accent shape - right side
    {
      id: 'green-accent',
      type: 'shape',
      x: 900,
      y: 0,
      width: 300,
      height: 850,
      backgroundColor: 'linear-gradient(225deg, #24A346 0%, #0B4FA8 100%)',
      zIndex: 2
    },
    // Premium accent shape - top right corner
    {
      id: 'navy-accent',
      type: 'shape',
      x: 1000,
      y: 0,
      width: 200,
      height: 850,
      backgroundColor: '#0B4FA8',
      zIndex: 3
    },
    // Decorative top bar
    {
      id: 'top-bar',
      type: 'shape',
      x: 0,
      y: 0,
      width: 900,
      height: 6,
      backgroundColor: '#24A346',
      zIndex: 5
    },
    // BIMADES logo area
    {
      id: 'logo-area',
      type: 'text',
      x: 330,
      y: 80,
      width: 540,
      height: 80,
      content: 'BIMADES\nConsulting',
      fontSize: 28,
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      color: '#0B4FA8',
      textAlign: 'center',
      zIndex: 4
    },
    // Certificate number (top right)
    {
      id: 'certificate-number-top',
      type: 'text',
      x: 330,
      y: 50,
      width: 540,
      height: 25,
      content: 'N°{{certificateNumber}}',
      fontSize: 14,
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      color: '#0B4FA8',
      textAlign: 'right',
      zIndex: 5
    },
    // Main title
    {
      id: 'main-title',
      type: 'text',
      x: 330,
      y: 180,
      width: 540,
      height: 100,
      content: 'CERTIFICAT\nDE FORMATION',
      fontSize: 48,
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      color: '#0B4FA8',
      textAlign: 'center',
      zIndex: 4
    },
    // Certification text
    {
      id: 'certification-text',
      type: 'text',
      x: 330,
      y: 295,
      width: 540,
      height: 30,
      content: 'Par la présente, nous certifions que:',
      fontSize: 16,
      fontFamily: 'sans-serif',
      color: '#555555',
      textAlign: 'center',
      zIndex: 4
    },
    // Participant name (dynamic)
    {
      id: 'participant-name',
      type: 'text',
      x: 330,
      y: 345,
      width: 540,
      height: 50,
      content: '{{participantName}}',
      fontSize: 36,
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      color: '#24A346',
      textAlign: 'center',
      zIndex: 4
    },
    // Training description
    {
      id: 'training-description',
      type: 'text',
      x: 330,
      y: 410,
      width: 540,
      height: 40,
      content: 'a participé avec succès au séminaire international de formation en',
      fontSize: 14,
      fontFamily: 'sans-serif',
      color: '#555555',
      textAlign: 'center',
      zIndex: 4
    },
    // Training title (dynamic)
    {
      id: 'training-title',
      type: 'text',
      x: 330,
      y: 465,
      width: 540,
      height: 50,
      content: '«{{trainingTitle}}»',
      fontSize: 18,
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      color: '#0B4FA8',
      textAlign: 'center',
      zIndex: 4
    },
    // Training details (dynamic)
    {
      id: 'training-details',
      type: 'text',
      x: 330,
      y: 530,
      width: 540,
      height: 35,
      content: 'tenu à {{trainingLocation}} du {{trainingDate}}.',
      fontSize: 14,
      fontFamily: 'sans-serif',
      color: '#555555',
      textAlign: 'center',
      zIndex: 4
    },
    // Certificate validity text
    {
      id: 'validity-text',
      type: 'text',
      x: 330,
      y: 580,
      width: 540,
      height: 50,
      content: 'En foi de quoi le présent certificat lui est délivré pour servir et valoir ce que de droit.',
      fontSize: 13,
      fontFamily: 'sans-serif',
      color: '#555555',
      textAlign: 'center',
      zIndex: 4
    },
    // Issue date (dynamic)
    {
      id: 'issue-date',
      type: 'text',
      x: 330,
      y: 645,
      width: 540,
      height: 35,
      content: 'Fait à {{trainingLocation}} le {{issueDate}}',
      fontSize: 14,
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      color: '#24A346',
      textAlign: 'center',
      zIndex: 4
    },
    // Organization name
    {
      id: 'organization-name',
      type: 'text',
      x: 330,
      y: 700,
      width: 540,
      height: 35,
      content: 'BIMADES Consulting',
      fontSize: 14,
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      color: '#0B4FA8',
      textAlign: 'center',
      zIndex: 4
    },
    // Instructor signature
    {
      id: 'instructor-signature',
      type: 'text',
      x: 330,
      y: 745,
      width: 540,
      height: 60,
      content: '{{instructor}}\nEconomiste-Planificateur\nConsultant Formateur',
      fontSize: 11,
      fontFamily: 'sans-serif',
      color: '#555555',
      textAlign: 'center',
      zIndex: 4
    }
  ]
};

export const bimadesBlueTemplate: CertificateTemplate = {
  id: 'bimades-blue',
  name: 'BIMADES Blue Certificate',
  type: 'bimades-blue',
  backgroundColor: '#F0F7FF',
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
      backgroundColor: 'linear-gradient(135deg, #0B4FA8 0%, #24A346 100%)',
      zIndex: 1
    },
    {
      id: 'bg-decoration-right',
      type: 'shape',
      x: 900,
      y: 0,
      width: 300,
      height: 850,
      backgroundColor: 'linear-gradient(225deg, #24A346 0%, #0B4FA8 100%)',
      zIndex: 1
    },
    // Premium seal
    {
      id: 'blue-seal',
      type: 'shape',
      x: 50,
      y: 200,
      width: 200,
      height: 200,
      backgroundColor: '#0B4FA8',
      borderRadius: 50,
      zIndex: 2
    },
    // Premium ribbon
    {
      id: 'ribbon',
      type: 'shape',
      x: 120,
      y: 380,
      width: 60,
      height: 150,
      backgroundColor: '#24A346',
      zIndex: 3
    },
    // Top border accent
    {
      id: 'top-border',
      type: 'shape',
      x: 0,
      y: 0,
      width: 1200,
      height: 8,
      backgroundColor: 'linear-gradient(90deg, #0B4FA8 0%, #24A346 100%)',
      zIndex: 5
    },
    // Bottom border accent
    {
      id: 'bottom-border',
      type: 'shape',
      x: 0,
      y: 842,
      width: 1200,
      height: 8,
      backgroundColor: 'linear-gradient(90deg, #24A346 0%, #0B4FA8 100%)',
      zIndex: 5
    },
    // Main title
    {
      id: 'main-title',
      type: 'text',
      x: 320,
      y: 120,
      width: 560,
      height: 80,
      content: 'CERTIFICAT DE FORMATION',
      fontSize: 42,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#0B4FA8',
      textAlign: 'center',
      zIndex: 4
    },
    // Certification text
    {
      id: 'certification-text',
      type: 'text',
      x: 320,
      y: 210,
      width: 560,
      height: 35,
      content: 'Par la présente, nous certifions que',
      fontSize: 16,
      fontFamily: 'serif',
      color: '#555555',
      textAlign: 'center',
      zIndex: 4
    },
    // Participant name (dynamic)
    {
      id: 'participant-name',
      type: 'text',
      x: 320,
      y: 260,
      width: 560,
      height: 60,
      content: '{{participantName}}',
      fontSize: 36,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#24A346',
      textAlign: 'center',
      zIndex: 4
    },
    // Training description
    {
      id: 'training-description',
      type: 'text',
      x: 320,
      y: 335,
      width: 560,
      height: 35,
      content: 'A participé à la session de formation en',
      fontSize: 14,
      fontFamily: 'serif',
      color: '#555555',
      textAlign: 'center',
      zIndex: 4
    },
    // Training title (dynamic)
    {
      id: 'training-title',
      type: 'text',
      x: 320,
      y: 385,
      width: 560,
      height: 70,
      content: '« {{trainingTitle}} »',
      fontSize: 20,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#0B4FA8',
      textAlign: 'center',
      zIndex: 4
    },
    // Training details (dynamic)
    {
      id: 'training-details',
      type: 'text',
      x: 320,
      y: 475,
      width: 560,
      height: 50,
      content: 'Organisée à {{trainingLocation}} du {{trainingDate}} ({{trainingDuration}})',
      fontSize: 14,
      fontFamily: 'serif',
      color: '#555555',
      textAlign: 'center',
      zIndex: 4
    },
    // Certificate validity text
    {
      id: 'validity-text',
      type: 'text',
      x: 320,
      y: 545,
      width: 560,
      height: 50,
      content: 'En foi de quoi le présent certificat lui est délivré pour servir et valoir ce que de droit.',
      fontSize: 14,
      fontFamily: 'serif',
      color: '#555555',
      textAlign: 'center',
      zIndex: 4
    },
    // Issue date (dynamic)
    {
      id: 'issue-date',
      type: 'text',
      x: 320,
      y: 610,
      width: 560,
      height: 40,
      content: 'Fait à {{trainingLocation}} le {{issueDate}}',
      fontSize: 16,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#0B4FA8',
      textAlign: 'center',
      zIndex: 4
    },
    // Certificate number
    {
      id: 'certificate-number',
      type: 'text',
      x: 320,
      y: 680,
      width: 560,
      height: 35,
      content: 'N° {{certificateNumber}}',
      fontSize: 14,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#24A346',
      textAlign: 'center',
      zIndex: 4
    },
    // Instructor signature
    {
      id: 'instructor-signature',
      type: 'text',
      x: 320,
      y: 730,
      width: 560,
      height: 60,
      content: '{{instructor}}\nConsultant Formateur',
      fontSize: 14,
      fontFamily: 'serif',
      color: '#555555',
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
  backgroundColor: '#FAFBFC',
  width: 1200,
  height: 850,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  editableAfterSave: true,
  elements: [
    // Top decorative bar
    {
      id: 'top-bar',
      type: 'shape',
      x: 0,
      y: 0,
      width: 1200,
      height: 12,
      backgroundColor: 'linear-gradient(90deg, #0B4FA8 0%, #24A346 100%)',
      zIndex: 5
    },
    // Left accent
    {
      id: 'left-accent',
      type: 'shape',
      x: 0,
      y: 0,
      width: 8,
      height: 850,
      backgroundColor: '#24A346',
      zIndex: 5
    },
    // Right accent
    {
      id: 'right-accent',
      type: 'shape',
      x: 1192,
      y: 0,
      width: 8,
      height: 850,
      backgroundColor: '#0B4FA8',
      zIndex: 5
    },
    // Main title
    {
      id: 'main-title',
      type: 'text',
      x: 400,
      y: 150,
      width: 400,
      height: 60,
      content: 'CERTIFICAT DE FORMATION',
      fontSize: 32,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#0B4FA8',
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
      fontSize: 28,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#24A346',
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
      fontWeight: 'bold',
      color: '#0B4FA8',
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
      color: '#555555',
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
      color: '#24A346',
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
      color: '#555555',
      textAlign: 'right',
      zIndex: 4
    }
  ]
};

export const attestationTemplate: CertificateTemplate = {
  id: 'attestation-template',
  name: 'Template Attestation',
  type: 'custom',
  backgroundColor: '#F8FAFC',
  width: 900,
  height: 600,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  editableAfterSave: true,
  elements: [
    // Top border accent
    {
      id: 'top-border',
      type: 'shape',
      x: 0,
      y: 0,
      width: 900,
      height: 6,
      backgroundColor: 'linear-gradient(90deg, #0B4FA8 0%, #24A346 100%)',
      zIndex: 3
    },
    // Header - Organization
    {
      id: 'organization-header',
      type: 'text',
      x: 50,
      y: 30,
      width: 800,
      height: 40,
      content: '{{organization}}',
      fontSize: 14,
      fontFamily: 'serif',
      fontWeight: 'normal',
      color: '#555555',
      textAlign: 'center',
      textTransform: 'uppercase',
      zIndex: 2
    },
    // Main title
    {
      id: 'main-title',
      type: 'text',
      x: 50,
      y: 80,
      width: 800,
      height: 80,
      content: 'Attestation',
      fontSize: 52,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#0B4FA8',
      textAlign: 'center',
      zIndex: 2
    },
    // Decorative line under title
    {
      id: 'title-decoration',
      type: 'shape',
      x: 300,
      y: 160,
      width: 300,
      height: 3,
      backgroundColor: '#24A346',
      zIndex: 2
    },
    // Certification text
    {
      id: 'certification-text',
      type: 'text',
      x: 50,
      y: 180,
      width: 800,
      height: 40,
      content: 'Certifie l\'achèvement réussi par',
      fontSize: 18,
      fontFamily: 'serif',
      color: '#555555',
      textAlign: 'center',
      zIndex: 2
    },
    // Participant name
    {
      id: 'participant-name',
      type: 'text',
      x: 50,
      y: 230,
      width: 800,
      height: 60,
      content: '{{participantName}}',
      fontSize: 40,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#24A346',
      textAlign: 'center',
      zIndex: 2
    },
    // Training description
    {
      id: 'training-description',
      type: 'text',
      x: 50,
      y: 310,
      width: 800,
      height: 40,
      content: 'du programme de {{trainingDuration}} intitulé',
      fontSize: 18,
      fontFamily: 'serif',
      color: '#555555',
      textAlign: 'center',
      zIndex: 2
    },
    // Training title
    {
      id: 'training-title',
      type: 'text',
      x: 50,
      y: 360,
      width: 800,
      height: 60,
      content: '{{trainingTitle}}',
      fontSize: 28,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#0B4FA8',
      textAlign: 'center',
      zIndex: 2
    },
    // Training details grid
    {
      id: 'training-details-label',
      type: 'text',
      x: 50,
      y: 450,
      width: 350,
      height: 30,
      content: 'Date et Lieu',
      fontSize: 12,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#0B4FA8',
      textAlign: 'left',
      textTransform: 'uppercase',
      zIndex: 2
    },
    {
      id: 'training-date',
      type: 'text',
      x: 50,
      y: 475,
      width: 350,
      height: 30,
      content: '{{trainingDate}}',
      fontSize: 16,
      fontFamily: 'serif',
      fontWeight: 'normal',
      color: '#333333',
      textAlign: 'left',
      zIndex: 2
    },
    {
      id: 'training-location',
      type: 'text',
      x: 50,
      y: 500,
      width: 350,
      height: 30,
      content: '{{trainingLocation}}',
      fontSize: 16,
      fontFamily: 'serif',
      fontWeight: 'normal',
      color: '#333333',
      textAlign: 'left',
      zIndex: 2
    },
    {
      id: 'instructor-label',
      type: 'text',
      x: 500,
      y: 450,
      width: 350,
      height: 30,
      content: 'Formateur',
      fontSize: 12,
      fontFamily: 'serif',
      fontWeight: 'bold',
      color: '#0B4FA8',
      textAlign: 'left',
      textTransform: 'uppercase',
      zIndex: 2
    },
    {
      id: 'instructor-name',
      type: 'text',
      x: 500,
      y: 475,
      width: 350,
      height: 30,
      content: '{{instructor}}',
      fontSize: 16,
      fontFamily: 'serif',
      fontWeight: 'normal',
      color: '#333333',
      textAlign: 'left',
      zIndex: 2
    },
    {
      id: 'certificate-number',
      type: 'text',
      x: 500,
      y: 500,
      width: 350,
      height: 30,
      content: 'Cert. # {{certificateNumber}}',
      fontSize: 12,
      fontFamily: 'serif',
      fontWeight: 'normal',
      color: '#24A346',
      textAlign: 'right',
      zIndex: 2
    },
    // Footer - Issue date
    {
      id: 'issue-date',
      type: 'text',
      x: 50,
      y: 550,
      width: 400,
      height: 30,
      content: 'Émis le : {{issueDate}}',
      fontSize: 12,
      fontFamily: 'serif',
      fontWeight: 'normal',
      color: '#555555',
      textAlign: 'left',
      zIndex: 2
    },
    // Signature line
    {
      id: 'signature-line',
      type: 'shape',
      x: 600,
      y: 545,
      width: 200,
      height: 2,
      backgroundColor: '#24A346',
      zIndex: 2
    },
    // Signature title
    {
      id: 'signature-title',
      type: 'text',
      x: 600,
      y: 555,
      width: 200,
      height: 30,
      content: 'Directeur de l\'Organisation',
      fontSize: 12,
      fontFamily: 'serif',
      fontWeight: 'normal',
      color: '#0B4FA8',
      textAlign: 'center',
      zIndex: 2
    }
  ]
};

export const defaultTemplates = [bimadesGoldTemplate, bimadesGreenTemplate, bimadesBlueTemplate, simpleEditorTemplate, attestationTemplate];
