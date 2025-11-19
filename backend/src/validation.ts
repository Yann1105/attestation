import { z } from 'zod';

// Participant validation schemas
export const createParticipantSchema = z.object({
  participantName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(255),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  organization: z.string().optional(),
  trainingTitle: z.string().optional(),
  trainingDate: z.string().optional(),
  trainingLocation: z.string().optional(),
  trainingDuration: z.string().optional(),
  instructor: z.string().optional()
});

export const updateParticipantSchema = z.object({
  participantName: z.string().min(2).max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  organization: z.string().optional(),
  trainingTitle: z.string().optional(),
  trainingDate: z.string().optional(),
  trainingLocation: z.string().optional(),
  trainingDuration: z.string().optional(),
  instructor: z.string().optional(),
  certificateNumber: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  approvalDate: z.string().optional(),
  rejectionReason: z.string().optional()
});

// Training validation schemas
export const createTrainingSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(255),
  description: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  duration: z.string().optional(),
  instructor: z.string().optional(),
  organization: z.string().optional()
});

export const updateTrainingSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  duration: z.string().optional(),
  instructor: z.string().optional(),
  organization: z.string().optional()
});

// Liste des variables autorisées dans les templates
const allowedVariables = [
  'participantName', 'certificateNumber', 'trainingTitle', 'trainingDate',
  'trainingLocation', 'trainingDuration', 'instructor', 'organization', 'issueDate', 'projectInfo'
];

// Validation d'un élément de template
const templateElementSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'image', 'shape', 'logo']),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  content: z.string().optional(),
  fontSize: z.number().optional(),
  fontFamily: z.string().optional(),
  fontWeight: z.string().optional(),
  color: z.string().optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  backgroundColor: z.string().optional(),
  borderRadius: z.number().optional(),
  rotation: z.number().optional(),
  opacity: z.number().optional(),
  imageUrl: z.string().optional(),
  zIndex: z.number(),
  isPlaceholder: z.boolean().optional(),
  variableName: z.string().optional()
}).refine((element) => {
  // Validation des variables dans le contenu texte
  if (element.type === 'text' && element.content) {
    const variablesInContent = element.content.match(/\{\{([^}]+)\}\}/g);
    if (variablesInContent) {
      for (const variable of variablesInContent) {
        const varName = variable.replace(/\{\{|\}\}/g, '');
        if (!allowedVariables.includes(varName)) {
          return false;
        }
      }
    }
  }
  return true;
}, {
  message: "Variable non autorisée dans le contenu du template"
});

// Template validation schemas
export const createTemplateSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(255),
  description: z.string().optional(),
  type: z.enum(['bimades-gold', 'bimades-green', 'custom']).optional(),
  elements: z.array(templateElementSchema).default([]),
  canvasData: z.any().optional(),
  backgroundColor: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  editableAfterSave: z.boolean().optional()
});

export const updateTemplateSchema = z.object({
   name: z.string().min(2).max(255).optional(),
   description: z.string().optional(),
   type: z.enum(['bimades-gold', 'bimades-green', 'custom']).optional(),
   elements: z.array(templateElementSchema).optional(),
   canvasData: z.any().optional(),
   backgroundColor: z.string().optional(),
   width: z.number().optional(),
   height: z.number().optional(),
   editableAfterSave: z.boolean().optional()
 });

// Certificate generation schema
export const generateCertificateSchema = z.object({
  templateId: z.string().or(z.number()),
  participantData: z.object({
    participantName: z.string(),
    certificateNumber: z.string()
  }),
  formData: z.object({
    trainingTitle: z.string().optional(),
    trainingDate: z.string().optional(),
    trainingLocation: z.string().optional(),
    trainingDuration: z.string().optional(),
    instructor: z.string().optional(),
    organization: z.string().optional()
  }).optional(),
  isQuickApproval: z.boolean().optional()
});

// Email validation schema
export const sendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  html: z.string().optional(),
  text: z.string().optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(),
    encoding: z.string().optional()
  })).optional()
});

// Admin login schema
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
});

// Validation middleware
export const validate = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

export type CreateParticipantInput = z.infer<typeof createParticipantSchema>;
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;
export type CreateTrainingInput = z.infer<typeof createTrainingSchema>;
export type UpdateTrainingInput = z.infer<typeof updateTrainingSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type GenerateCertificateInput = z.infer<typeof generateCertificateSchema>;
export type SendEmailInput = z.infer<typeof sendEmailSchema>;