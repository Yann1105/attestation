import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';

export interface CertificateData {
  participantName: string;
  trainingTitle: string;
  trainingDate: string;
  trainingLocation: string;
  trainingDuration: string;
  instructor: string;
  certificateNumber: string;
  organization: string;
  issueDate: string;
  projectInfo?: string;
  customFields?: Record<string, string>;
  // Support des templates Canvas
  canvasData?: any;
}

export interface BatchCertificateData {
  participantName: string;
  trainingTitle: string;
  trainingDate: string;
  trainingLocation: string;
  trainingDuration: string;
  instructor: string;
  certificateNumber: string;
  organization: string;
  issueDate: string;
}

export interface GenerationOptions {
  format?: 'html' | 'pdf' | 'png';
  quality?: 'low' | 'medium' | 'high';
  outputDir?: string;
  enableRollback?: boolean;
  // Options avancées pour PDF
  pdfOptions?: {
    format?: 'A4' | 'A3' | 'Letter' | 'Legal';
    orientation?: 'portrait' | 'landscape';
    margin?: {
      top?: string | number;
      right?: string | number;
      bottom?: string | number;
      left?: string | number;
    };
    printBackground?: boolean;
    scale?: number;
  };
  // Options avancées pour PNG
  pngOptions?: {
    width?: number;
    height?: number;
    deviceScaleFactor?: number;
    fullPage?: boolean;
    clip?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  // Options avancées pour HTML
  htmlOptions?: {
    inlineStyles?: boolean;
    minify?: boolean;
    includeMeta?: boolean;
  };
}

export interface RollbackInfo {
  files: string[];
  timestamp: number;
  operation: string;
}

export class CertificateGenerator {
  private rollbackStack: RollbackInfo[] = [];
  private maxRollbackHistory: number = 10;

  constructor() {
    // No default template path needed
  }

  /**
   * Valide les données du certificat
   */
  validateCertificateData(data: CertificateData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Champs obligatoires
    const requiredFields = [
      'participantName', 'trainingTitle', 'trainingDate',
      'trainingLocation', 'trainingDuration', 'instructor',
      'certificateNumber', 'organization', 'issueDate'
    ];

    requiredFields.forEach(field => {
      const value = data[field as keyof CertificateData];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push(`Le champ ${field} est obligatoire`);
      }
    });

    // Validation spécifique du format de date
    if (data.trainingDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.trainingDate)) {
      errors.push('Le format de la date de formation doit être YYYY-MM-DD');
    }

    if (data.issueDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.issueDate)) {
      errors.push('Le format de la date d\'émission doit être YYYY-MM-DD');
    }

    // Validation du numéro de certificat
    if (data.certificateNumber && !/^CERT\d+/.test(data.certificateNumber)) {
      errors.push('Le numéro de certificat doit commencer par CERT suivi de chiffres');
    }

    return { valid: errors.length === 0, errors };
  }



  /**
   * Enregistre une opération pour rollback
   */
  private recordForRollback(files: string[], operation: string): void {
    this.rollbackStack.push({
      files: [...files],
      timestamp: Date.now(),
      operation
    });

    // Limiter la taille de l'historique
    if (this.rollbackStack.length > this.maxRollbackHistory) {
      this.rollbackStack.shift();
    }
  }

  /**
   * Effectue un rollback de la dernière opération
   */
  rollbackLastOperation(): { success: boolean; deletedFiles: string[]; error?: string } {
    if (this.rollbackStack.length === 0) {
      return { success: false, deletedFiles: [], error: 'Aucune opération à annuler' };
    }

    const lastOperation = this.rollbackStack.pop()!;
    const deletedFiles: string[] = [];

    try {
      for (const filePath of lastOperation.files) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          deletedFiles.push(filePath);
        }
      }

      return { success: true, deletedFiles };
    } catch (error) {
      return {
        success: false,
        deletedFiles,
        error: error instanceof Error ? error.message : 'Erreur lors du rollback'
      };
    }
  }

  /**
   * Nettoie les fichiers temporaires anciens
   */
  cleanupOldFiles(maxAgeHours: number = 24): { deletedFiles: string[]; error?: string } {
    const deletedFiles: string[] = [];
    const maxAge = maxAgeHours * 60 * 60 * 1000; // convertir en millisecondes
    const now = Date.now();

    try {
      // Nettoyer tous les fichiers de rollback plus anciens que maxAge
      this.rollbackStack = this.rollbackStack.filter(operation => {
        if (now - operation.timestamp > maxAge) {
          for (const filePath of operation.files) {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              deletedFiles.push(filePath);
            }
          }
          return false;
        }
        return true;
      });

      return { deletedFiles };
    } catch (error) {
      return {
        deletedFiles,
        error: error instanceof Error ? error.message : 'Erreur lors du nettoyage'
      };
    }
  }

  /**
   * Génère un certificat HTML avec les variables remplacées
   */
  generateCertificateHTML(data: CertificateData, customTemplate?: string, options: GenerationOptions = {}): string {
    // Validation des données
    const validation = this.validateCertificateData(data);
    if (!validation.valid) {
      throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
    }

    let template: string;

    // Si template personnalisé fourni, l'utiliser directement
    if (customTemplate) {
      template = customTemplate;
    } else if (data.canvasData) {
      // Générer HTML depuis Canvas Data (Fabric.js)
      template = this.generateHTMLFromCanvas(data.canvasData);
    } else {
      // Aucun template disponible
      throw new Error('Aucun template valide fourni. Utilisez un template créé avec l\'éditeur.');
    }

    // Remplacement des variables standard
    let result = template
      .replace(/\{\{participantName\}\}/g, this.escapeHtml(data.participantName))
      .replace(/\{\{trainingTitle\}\}/g, this.escapeHtml(data.trainingTitle))
      .replace(/\{\{trainingDate\}\}/g, this.formatDate(data.trainingDate))
      .replace(/\{\{trainingLocation\}\}/g, this.escapeHtml(data.trainingLocation))
      .replace(/\{\{trainingDuration\}\}/g, this.escapeHtml(data.trainingDuration))
      .replace(/\{\{instructor\}\}/g, this.escapeHtml(data.instructor))
      .replace(/\{\{certificateNumber\}\}/g, this.escapeHtml(data.certificateNumber))
      .replace(/\{\{organization\}\}/g, this.escapeHtml(data.organization))
      .replace(/\{\{issueDate\}\}/g, this.formatDate(data.issueDate))
      .replace(/\{\{projectInfo\}\}/g, data.projectInfo ? this.escapeHtml(data.projectInfo) : '');

    // Support pour les champs personnalisés
    if (data.customFields) {
      Object.entries(data.customFields).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        result = result.replace(new RegExp(placeholder, 'g'), this.escapeHtml(value));
      });
    }

    // Nettoyer les placeholders non remplacés
    result = result.replace(/\{\{[^}]+\}\}/g, '');

    // Appliquer les options HTML avancées
    const htmlOptions = options.htmlOptions;
    if (htmlOptions) {
      if (htmlOptions.includeMeta !== false) {
        // Ajouter des métadonnées si demandé
        const metaTags = `
          <meta name="generator" content="Certificate Generator">
          <meta name="created" content="${new Date().toISOString()}">
          <meta name="certificate-number" content="${data.certificateNumber}">
        `;
        result = result.replace('<head>', `<head>${metaTags}`);
      }

      if (htmlOptions.minify) {
        // Minifier le HTML (suppression des espaces et sauts de ligne inutiles)
        result = result.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
      }
    }

    return result;
  }

  /**
   * Génère HTML depuis les éléments de l'éditeur (Photoshop-style)
   */
  generateHTMLFromElements(elements: any[], template: any): string {
    const width = template.width || 800;
    const height = template.height || 600;
    const backgroundColor = template.backgroundColor || '#ffffff';

    let html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Template</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        .template-container {
            position: relative;
            width: ${width}px;
            height: ${height}px;
            background-color: ${backgroundColor};
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            overflow: hidden;
        }
        .template-element {
            position: absolute;
        }
        .text-element {
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        @media print {
            body { background: white; padding: 0; }
            .template-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="template-container">
`;

    // Convertir chaque élément en HTML
    elements.forEach((element: any) => {
      const style = `
        left: ${element.x || 0}px;
        top: ${element.y || 0}px;
        width: ${element.width || 100}px;
        height: ${element.height || 100}px;
        ${element.rotation ? `transform: rotate(${element.rotation}deg);` : ''}
        ${element.opacity !== undefined ? `opacity: ${element.opacity};` : ''}
        z-index: ${element.zIndex || 0};
      `;

      if (element.type === 'text') {
        html += `
        <div class="template-element text-element" style="
            ${style}
            font-size: ${element.fontSize || 16}px;
            font-family: ${element.fontFamily || 'Arial'};
            font-weight: ${element.fontWeight || 'normal'};
            color: ${element.color || '#000000'};
            text-align: ${element.textAlign || 'left'};
            background-color: ${element.backgroundColor || 'transparent'};
            border-radius: ${element.borderRadius || 0}px;
            line-height: 1.2;
        ">${element.content || ''}</div>
`;
      } else if (element.type === 'shape') {
        html += `
        <div class="template-element" style="
            ${style}
            background-color: ${element.backgroundColor || '#cccccc'};
            border-radius: ${element.borderRadius || 0}px;
        "></div>
`;
      } else if (element.type === 'image' && element.imageUrl) {
        html += `
        <img class="template-element" src="${element.imageUrl}" style="
            ${style}
            object-fit: cover;
            border-radius: ${element.borderRadius || 0}px;
        " />
`;
      }
    });

    html += `
    </div>
</body>
</html>
`;

    return html;
  }

  /**
   * Génère HTML depuis Canvas Data (pour l'éditeur Canvas)
   */
  generateHTMLFromCanvas(canvasData: any): string {
    const { width, height, backgroundColor, objects } = canvasData;

    let html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificat</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        .certificate-container {
            position: relative;
            width: ${width}px;
            height: ${height}px;
            background-color: ${backgroundColor || '#ffffff'};
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            overflow: hidden;
        }
        .canvas-element {
            position: absolute;
        }
        @media print {
            body { background: white; padding: 0; }
            .certificate-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="certificate-container">
`;

    // Convertir chaque objet Fabric.js en HTML
    objects.forEach((obj: any) => {
      const left = obj.left || 0;
      const top = obj.top || 0;
      const scaleX = obj.scaleX || 1;
      const scaleY = obj.scaleY || 1;
      const angle = obj.angle || 0;
      const opacity = obj.opacity || 1;

      const transform = `translate(${left}px, ${top}px) rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;

      if (obj.type === 'textbox' || obj.type === 'text') {
        html += `
        <div class="canvas-element" style="
            left: 0;
            top: 0;
            width: ${obj.width * scaleX}px;
            font-size: ${obj.fontSize}px;
            font-family: ${obj.fontFamily || 'Arial'};
            font-weight: ${obj.fontWeight || 'normal'};
            color: ${obj.fill || '#000000'};
            text-align: ${obj.textAlign || 'left'};
            opacity: ${opacity};
            transform: ${transform};
            transform-origin: 0 0;
        ">${obj.text || ''}</div>
`;
      } else if (obj.type === 'rect') {
        html += `
        <div class="canvas-element" style="
            left: 0;
            top: 0;
            width: ${obj.width * scaleX}px;
            height: ${obj.height * scaleY}px;
            background-color: ${obj.fill || 'transparent'};
            border: ${obj.strokeWidth || 0}px solid ${obj.stroke || 'transparent'};
            opacity: ${opacity};
            transform: ${transform};
            transform-origin: 0 0;
        "></div>
`;
      } else if (obj.type === 'circle') {
        html += `
        <div class="canvas-element" style="
            left: 0;
            top: 0;
            width: ${obj.radius * 2 * scaleX}px;
            height: ${obj.radius * 2 * scaleY}px;
            border-radius: 50%;
            background-color: ${obj.fill || 'transparent'};
            border: ${obj.strokeWidth || 0}px solid ${obj.stroke || 'transparent'};
            opacity: ${opacity};
            transform: ${transform};
            transform-origin: 0 0;
        "></div>
`;
      } else if (obj.type === 'image') {
        html += `
        <img class="canvas-element" src="${obj.src}" style="
            left: 0;
            top: 0;
            width: ${(obj.width || 100) * scaleX}px;
            height: ${(obj.height || 100) * scaleY}px;
            opacity: ${opacity};
            transform: ${transform};
            transform-origin: 0 0;
        " />
`;
      }
    });

    html += `
    </div>
</body>
</html>
`;

    return html;
  }

  /**
   * Génère HTML depuis Canvas Data en CONSERVANT LE DESIGN et en injectant les données
   */
  generateHTMLFromCanvasWithData(
    canvasData: any,
    certificateData: CertificateData,
    template: any
  ): string {
    console.log('🎨🎨🎨 generateHTMLFromCanvasWithData START');
    console.log('🎨 generateHTMLFromCanvasWithData called with canvasData:', !!canvasData, 'certificateData:', !!certificateData);
    const width = template.width || canvasData.width || 1200;
    const height = template.height || canvasData.height || 850;
    const backgroundColor = canvasData.background || canvasData.backgroundColor || template.backgroundColor || '#ffffff';
    const objects = canvasData.objects || [];
    console.log('📐 Dimensions:', width, 'x', height, 'Background:', backgroundColor, 'Objects count:', objects.length);

    let html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificat - ${certificateData.certificateNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        .certificate-container {
            position: relative;
            width: ${width}px;
            height: ${height}px;
            background-color: ${backgroundColor || '#ffffff'};
            background-image: ${template.background_image ? `url('${template.background_image}')` : 'none'};
            background-size: cover;
            background-position: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        .canvas-element {
            position: absolute;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        @media print {
            body { background: white; padding: 0; }
            .certificate-container {
                box-shadow: none;
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="certificate-container">
`;

    // Parcourir tous les objets du canvas et injecter les données
    console.log('Processing', objects.length, 'canvas objects');
    console.log('Objects array:', objects);
    objects.forEach((obj: any, index: number) => {
      console.log(`Processing object ${index}:`, obj.type, obj.text);
      const left = obj.left || 0;
      const top = obj.top || 0;
      const scaleX = obj.scaleX || 1;
      const scaleY = obj.scaleY || 1;
      const angle = obj.angle || 0;
      const opacity = obj.opacity || 1;

      const transform = `translate(${left}px, ${top}px) rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;

      console.log('Checking obj.type:', obj.type, 'against textbox/text/Textbox');
      if (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'Textbox') {
        console.log('ENTERED TEXT OBJECT BLOCK');
        // Récupérer le texte original
        let text = obj.text || '';
        console.log('Original text:', text);

        console.log('Checking for variableName:', (obj as any).variableName);
        // SI LE TEXTE CONTIENT UNE VARIABLE, LA REMPLACER
        if ((obj as any).variableName) {
          console.log('Using variableName path');
          const variableName = (obj as any).variableName;
          text = this.replaceVariable(variableName, certificateData);
        } else {
          console.log('Using placeholder path');
          // Remplacer les placeholders {{variable}} dans le texte
          console.log('Before replacePlaceholders:', text, 'certificateData.participantName:', certificateData.participantName);
          text = this.replacePlaceholders(text, certificateData);
          console.log('After replacePlaceholders:', text);
        }
        console.log('Final processed text:', text);

        // Simple test: just add the text directly
        console.log('About to add HTML element, current html length:', html.length);
        html += `<div style="position: absolute; left: ${left}px; top: ${top}px; color: blue; font-size: 20px;">${this.escapeHtml(text)}</div>`;
        console.log('Added simple element, HTML length now:', html.length);
        console.log('HTML ends with:', html.slice(-100));
      } else if (obj.type === 'rect') {
        html += `
        <div class="canvas-element" style="
            left: 0;
            top: 0;
            width: ${obj.width * scaleX}px;
            height: ${obj.height * scaleY}px;
            background-color: ${obj.fill || 'transparent'};
            border: ${obj.strokeWidth || 0}px solid ${obj.stroke || 'transparent'};
            border-radius: ${obj.rx || 0}px;
            opacity: ${opacity};
            transform: ${transform};
            transform-origin: 0 0;
        "></div>
`;
      } else if (obj.type === 'circle') {
        html += `
        <div class="canvas-element" style="
            left: 0;
            top: 0;
            width: ${obj.radius * 2 * scaleX}px;
            height: ${obj.radius * 2 * scaleY}px;
            border-radius: 50%;
            background-color: ${obj.fill || 'transparent'};
            border: ${obj.strokeWidth || 0}px solid ${obj.stroke || 'transparent'};
            opacity: ${opacity};
            transform: ${transform};
            transform-origin: 0 0;
        "></div>
`;
      } else if (obj.type === 'image') {
        html += `
        <img class="canvas-element" src="${obj.src}" style="
            left: 0;
            top: 0;
            width: ${(obj.width || 100) * scaleX}px;
            height: ${(obj.height || 100) * scaleY}px;
            opacity: ${opacity};
            transform: ${transform};
            transform-origin: 0 0;
            object-fit: ${obj.cropX ? 'cover' : 'contain'};
        " crossorigin="anonymous" />
`;
      } else if (obj.type === 'polygon' || obj.type === 'path') {
        // Pour les formes complexes (étoiles, cœurs, etc.)
        html += `
        <div class="canvas-element" style="
            left: 0;
            top: 0;
            width: ${(obj.width || 100) * scaleX}px;
            height: ${(obj.height || 100) * scaleY}px;
            opacity: ${opacity};
            transform: ${transform};
            transform-origin: 0 0;
        ">
            <svg width="${(obj.width || 100) * scaleX}" height="${(obj.height || 100) * scaleY}" viewBox="0 0 ${obj.width || 100} ${obj.height || 100}">
                ${obj.type === 'polygon'
                  ? `<polygon points="${obj.points?.map((p: any) => `${p.x},${p.y}`).join(' ')}" fill="${obj.fill || '#000'}" />`
                  : `<path d="${obj.path}" fill="${obj.fill || '#000'}" />`
                }
            </svg>
        </div>
`;
      }
    });

    html += `
    </div>
</body>
</html>
`;

    console.log('Final HTML length:', html.length);
    console.log('Final HTML ends with:', html.slice(-200));
    return html;
  }

  /**
   * Injecte les données dans un template HTML en conservant le design
   */
  injectDataIntoTemplate(
    templateContent: string,
    certificateData: CertificateData,
    template: any
  ): string {
    let html = templateContent;

    // Remplacer toutes les variables {{variable}}
    html = html
      .replace(/\{\{participantName\}\}/g, this.escapeHtml(certificateData.participantName))
      .replace(/\{\{certificateNumber\}\}/g, this.escapeHtml(certificateData.certificateNumber))
      .replace(/\{\{trainingTitle\}\}/g, this.escapeHtml(certificateData.trainingTitle))
      .replace(/\{\{trainingDate\}\}/g, this.formatDate(certificateData.trainingDate))
      .replace(/\{\{trainingLocation\}\}/g, this.escapeHtml(certificateData.trainingLocation))
      .replace(/\{\{trainingDuration\}\}/g, this.escapeHtml(certificateData.trainingDuration))
      .replace(/\{\{instructor\}\}/g, this.escapeHtml(certificateData.instructor))
      .replace(/\{\{organization\}\}/g, this.escapeHtml(certificateData.organization))
      .replace(/\{\{issueDate\}\}/g, this.formatDate(certificateData.issueDate))
      .replace(/\{\{projectInfo\}\}/g, certificateData.projectInfo ? this.escapeHtml(certificateData.projectInfo) : '');

    // Ajouter les métadonnées du template si nécessaires
    if (template.width && template.height) {
      html = html.replace(
        /<body/,
        `<body style="margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5;"`
      );
    }

    return html;
  }

  /**
   * Remplace une variable par sa valeur dans certificateData
   */
  private replaceVariable(variableName: string, data: CertificateData): string {
    const map: { [key: string]: string } = {
      'participantName': data.participantName,
      'certificateNumber': data.certificateNumber,
      'trainingTitle': data.trainingTitle,
      'trainingDate': this.formatDate(data.trainingDate),
      'trainingLocation': data.trainingLocation,
      'trainingDuration': data.trainingDuration,
      'instructor': data.instructor,
      'organization': data.organization,
      'issueDate': this.formatDate(data.issueDate),
      'projectInfo': data.projectInfo || ''
    };

    return map[variableName] || `{{${variableName}}}`;
  }

  /**
   * Remplace tous les placeholders dans un texte
   */
  private replacePlaceholders(text: string, data: CertificateData): string {
    return text
      .replace(/\{\{participantName\}\}/g, data.participantName)
      .replace(/\{\{certificateNumber\}\}/g, data.certificateNumber)
      .replace(/\{\{trainingTitle\}\}/g, data.trainingTitle)
      .replace(/\{\{trainingDate\}\}/g, this.formatDate(data.trainingDate))
      .replace(/\{\{trainingLocation\}\}/g, data.trainingLocation)
      .replace(/\{\{trainingDuration\}\}/g, data.trainingDuration)
      .replace(/\{\{instructor\}\}/g, data.instructor)
      .replace(/\{\{organization\}\}/g, data.organization)
      .replace(/\{\{issueDate\}\}/g, this.formatDate(data.issueDate))
      .replace(/\{\{projectInfo\}\}/g, data.projectInfo || '');
  }

  /**
   * Génère un certificat en PDF
   */
  async generateCertificatePDF(
    data: CertificateData,
    outputPath?: string,
    customTemplate?: string,
    options: GenerationOptions = {}
  ): Promise<{ success: boolean; path?: string; error?: string }> {
    let browser;
    try {
      const html = this.generateCertificateHTML(data, customTemplate, options);

      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const finalPath = outputPath || path.join(
        './certificates',
        `certificate_${data.certificateNumber}_${Date.now()}.pdf`
      );

      // Créer le dossier si nécessaire
      const dir = path.dirname(finalPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const pdfOptions = options.pdfOptions || {};
      await page.pdf({
        path: finalPath,
        format: pdfOptions.format || 'A4',
        landscape: pdfOptions.orientation === 'landscape',
        printBackground: pdfOptions.printBackground !== false,
        margin: pdfOptions.margin || { top: 0, right: 0, bottom: 0, left: 0 },
        scale: pdfOptions.scale
      });

      await browser.close();

      return { success: true, path: finalPath };
    } catch (error) {
      if (browser) await browser.close();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Génère un certificat en PNG
   */
  async generateCertificatePNG(
    data: CertificateData,
    outputPath?: string,
    customTemplate?: string,
    options: GenerationOptions = {}
  ): Promise<{ success: boolean; path?: string; error?: string }> {
    let browser;
    try {
      const html = this.generateCertificateHTML(data, customTemplate, options);

      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();

      const pngOptions = options.pngOptions || {};
      const quality = options.quality || 'high';

      // Définir la taille selon la qualité et les options
      const deviceScaleFactor = pngOptions.deviceScaleFactor ||
        (quality === 'high' ? 2 : quality === 'medium' ? 1.5 : 1);

      await page.setViewport({
        width: pngOptions.width || 1200,
        height: pngOptions.height || 850,
        deviceScaleFactor
      });

      await page.setContent(html, { waitUntil: 'networkidle0' });

      const finalPath = outputPath || path.join(
        './certificates',
        `certificate_${data.certificateNumber}_${Date.now()}.png`
      );

      const dir = path.dirname(finalPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      await page.screenshot({
        path: finalPath as any,
        fullPage: pngOptions.fullPage !== false,
        clip: pngOptions.clip,
        type: 'png'
      });

      await browser.close();

      return { success: true, path: finalPath };
    } catch (error) {
      if (browser) await browser.close();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Échappe les caractères HTML pour éviter les injections XSS
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&',
      '<': '<',
      '>': '>',
      '"': '"',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    return text.replace(/[&<>"'/]/g, (char) => map[char]);
  }

  /**
   * Formate une date pour l'affichage
   */
  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Génère plusieurs certificats à partir de données CSV
   */
  async generateBatchCertificates(
    csvData: string,
    outputDir: string = './certificates',
    format: 'html' | 'pdf' | 'png' = 'pdf',
    customTemplate?: string,
    onProgress?: (progress: {
      current: number;
      total: number;
      success: number;
      errors: number;
      currentFile?: string;
    }) => void,
    options: GenerationOptions = {}
  ): Promise<{
    files: string[];
    errors: Array<{ row: number; error: string; participantName?: string }>
  }> {
    // Créer le dossier de sortie s'il n'existe pas
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('Données CSV invalides: au moins un en-tête et une ligne de données requis');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1);
    const generatedFiles: string[] = [];
    const errors: Array<{ row: number; error: string; participantName?: string }> = [];
    const enableRollback = options.enableRollback !== false; // activé par défaut

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        const values = row.split(',').map(v => v.trim());
        const data: CertificateData = {
          participantName: values[headers.indexOf('participantName')] || '',
          trainingTitle: values[headers.indexOf('trainingTitle')] || '',
          trainingDate: values[headers.indexOf('trainingDate')] || '',
          trainingLocation: values[headers.indexOf('trainingLocation')] || '',
          trainingDuration: values[headers.indexOf('trainingDuration')] || '',
          instructor: values[headers.indexOf('instructor')] || '',
          certificateNumber: values[headers.indexOf('certificateNumber')] || `CERT${Date.now()}${i}`,
          organization: values[headers.indexOf('organization')] || '',
          issueDate: values[headers.indexOf('issueDate')] || new Date().toISOString().split('T')[0],
          projectInfo: values[headers.indexOf('projectInfo')] || ''
        };

        const safeName = data.participantName.replace(/[^a-zA-Z0-9\s\-_]/g, '').replace(/\s+/g, '_');
        const filename = `certificate_${safeName}_${i + 1}`;
        const filepath = path.join(outputDir, `${filename}.${format}`);

        if (format === 'html') {
          const htmlContent = this.generateCertificateHTML(data, customTemplate, options);
          fs.writeFileSync(filepath, htmlContent, 'utf-8');
          generatedFiles.push(filepath);
          successCount++;
        } else if (format === 'pdf') {
          const result = await this.generateCertificatePDF(data, filepath, customTemplate, options);
          if (result.success && result.path) {
            generatedFiles.push(result.path);
            successCount++;
          } else {
            throw new Error(result.error || 'Erreur PDF');
          }
        } else if (format === 'png') {
          const result = await this.generateCertificatePNG(data, filepath, customTemplate, options);
          if (result.success && result.path) {
            generatedFiles.push(result.path);
            successCount++;
          } else {
            throw new Error(result.error || 'Erreur PNG');
          }
        }

        // Rapporter la progression
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: rows.length,
            success: successCount,
            errors: errorCount,
            currentFile: filename
          });
        }

      } catch (rowError) {
        const values = row.split(',').map(v => v.trim());
        const participantName = values[headers.indexOf('participantName')] || 'Inconnu';
        const errorMsg = rowError instanceof Error ? rowError.message : 'Erreur inconnue';
        errors.push({
          row: i + 2, // +2 car ligne 1 = header et index commence à 0
          error: errorMsg,
          participantName
        });
        errorCount++;
      }
    }

    // Enregistrer pour rollback si activé et qu'il y a des fichiers générés
    if (enableRollback && generatedFiles.length > 0) {
      this.recordForRollback(generatedFiles, `batch_generation_${Date.now()}`);
    }

    return { files: generatedFiles, errors };
  }

  /**
   * Extrait tous les placeholders d'un template
   */
  extractPlaceholders(templateContent: string): string[] {
    if (!templateContent) {
      return [];
    }

    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    const placeholders: string[] = [];
    let match;

    while ((match = placeholderRegex.exec(templateContent)) !== null) {
      const placeholder = match[1].trim();
      if (!placeholders.includes(placeholder)) {
        placeholders.push(placeholder);
      }
    }

    return placeholders;
  }

  /**
   * Valide qu'un template contient tous les placeholders requis
   */
  validateTemplate(templateContent?: string): {
    valid: boolean;
    errors: string[];
    placeholders: string[];
    missingRequired?: string[];
  } {
    const errors: string[] = [];

    if (!templateContent) {
      errors.push('Aucun contenu de template fourni');
      return {
        valid: false,
        errors,
        placeholders: [],
        missingRequired: []
      };
    }

    const placeholders = this.extractPlaceholders(templateContent);

    const requiredPlaceholders = [
      'participantName', 'certificateNumber', 'trainingTitle',
      'trainingDate', 'organization'
    ];

    const missingPlaceholders = requiredPlaceholders.filter(p => !placeholders.includes(p));
    if (missingPlaceholders.length > 0) {
      errors.push(`Placeholders requis manquants: ${missingPlaceholders.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      placeholders,
      missingRequired: missingPlaceholders
    };
  }

  /**
   * Valide les données CSV
   */
  validateCSV(csvData: string): { valid: boolean; errors: string[]; rowCount?: number } {
    const errors: string[] = [];
    const lines = csvData.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      errors.push('Le fichier CSV doit contenir au moins un en-tête et une ligne de données');
      return { valid: false, errors };
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const requiredHeaders = [
      'participantName', 'trainingTitle', 'certificateNumber'
    ];

    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      errors.push(`En-têtes obligatoires manquants: ${missingHeaders.join(', ')}`);
    }

    // Vérifier que chaque ligne a le bon nombre de colonnes
    const rows = lines.slice(1);
    rows.forEach((line, index) => {
      const columns = line.split(',');
      if (columns.length !== headers.length) {
        errors.push(`Ligne ${index + 2}: ${columns.length} colonnes trouvées, ${headers.length} attendues`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      rowCount: rows.length
    };
  }
}