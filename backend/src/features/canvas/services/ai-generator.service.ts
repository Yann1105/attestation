import { CanvasTemplate, AIGenerateRequest, KonvaJSON } from '../types';
import { callAI, AIMessage } from '../../../utils/aiConfig';

export class AIGeneratorService {
    constructor() { }


    /**
     * Generate a certificate/attestation/poster template from a text prompt
     */
    async generateTemplate(request: AIGenerateRequest): Promise<CanvasTemplate> {
        return this.generateFlexibleTemplate(request);
    }

    private async generateFlexibleTemplate(request: AIGenerateRequest): Promise<CanvasTemplate> {
        const { prompt, category = 'certificate', style = 'modern', colorScheme, width = 1200, height = 800 } = request;

        const systemPrompt = this.buildFlexibleSystemPrompt(category, style, colorScheme, width, height);
        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: `DEMANDE : "${prompt}"` }
        ];

        try {
            console.log('Attempting Flexible AI generation...');
            let text = await callAI(messages as AIMessage[], 0.2);
            console.log('✅ Success with AI AI');

            // 1. Clean up repeated prompts (some models repeat the full conversation)
            if (text.includes('USER:')) {
                const parts = text.split(/USER:|DEMANDE\s*:/i);
                text = parts[parts.length - 1].trim();
            }

            // 2. Extract from code blocks if present
            const codeBlockMatch = text.match(/```(?:html|latex|markdown|json)?\s*([\s\S]*?)\s*```/i);
            const rawContent = codeBlockMatch ? codeBlockMatch[1].trim() : text.trim();

            // 3. Detect format and further refine extraction
            let content = rawContent;
            let format = 'html';

            const lowerText = rawContent.toLowerCase();

            // Detect LaTeX
            if (lowerText.includes('\\documentclass') || lowerText.includes('\\begin{document}')) {
                format = 'latex';
                const latexMatch = rawContent.match(/\\documentclass[\s\S]*\\end{document}/i);
                if (latexMatch) content = latexMatch[0];
            }
            // Detect HTML
            else if (lowerText.includes('<html') || lowerText.includes('<!doctype') || lowerText.includes('<div')) {
                format = 'html';
                // Try to find full HTML doc
                const htmlMatch = rawContent.match(/<html[\s\S]*<\/html>/i);
                const docTypeMatch = rawContent.match(/<!DOCTYPE html[\s\S]*<\/html>/i);

                if (docTypeMatch) {
                    content = docTypeMatch[0];
                } else if (htmlMatch) {
                    content = htmlMatch[0];
                } else if (!lowerText.includes('<html')) {
                    // It's a fragment but requested as HTML, wrap it
                    content = `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body>${rawContent}</body></html>`;
                }
            }
            // Fallback to Markdown
            else {
                format = 'markdown';
            }

            return {
                name: this.extractTemplateName(prompt, category),
                description: `Generated ${format} from: ${prompt}`,
                category,
                canvasData: { content, format },
                html: format === 'html' ? content : undefined,
                variables: this.extractVariablesFromText(content, format),
                width,
                height,
                backgroundColor: '#FFFFFF',
                version: 1,
                isPublic: false,
                aiPrompt: prompt,
                outputFormat: format
            };

        } catch (error) {
            console.error('AI Processing Error:', error);
            throw new Error(`AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private extractVariablesFromText(text: string, format: string): any[] {
        const variables = new Set<string>();
        const variableRegex = /\{\{(\w+)\}\}/g;
        const matches = text.matchAll(variableRegex);
        for (const match of matches) {
            variables.add(match[1]);
        }
        return Array.from(variables).map(name => ({
            name,
            type: 'text',
            required: true
        }));
    }

    private buildFlexibleSystemPrompt(
        category: string,
        style: string,
        colorScheme?: string[],
        width: number = 1200,
        height: number = 800
    ): string {
        return `Tu es un expert en design graphique de classe mondiale, spécialisé dans la création de documents officiels (certificats, attestations, diplômes) élégants et modernes.

OBJECTIF :
Générer un template de document visuellement impressionnant basé sur la demande de l'utilisateur.

CHOIX DU FORMAT (CRITIQUE) :
Tu dois choisir le format le plus adapté pour que l'utilisateur puisse VOIR le résultat :
1. HTML + Tailwind CSS (PRÉFÉRÉ) : Utilise ce format pour 90% des demandes, surtout si un design visuel, des couleurs, ou un aspect moderne sont demandés. Utilise le CDN Tailwind : <script src="https://cdn.tailwindcss.com"></script>.
2. HTML/CSS Classique : Si Tailwind n'est pas adapté.
3. LaTeX : UNIQUEMENT si l'utilisateur demande explicitement "LaTeX" ou pour des documents académiques extrêmement formels et sobres (noir et blanc).
4. Markdown : Pour des brouillons ou du contenu purement textuel.

RÈGLES DE GÉNÉRATION :
- Ne renvoie QUE le code source complet. AUCUN texte explicatif avant ou après.
- Le design doit être "Premium", "Wowed", "Visual Excellence". Utilise des polices Google Fonts, des dégradés subtils, et des bordures élégantes.
- Utilise des variables entre doubles accolades {{variable}} pour les champs dynamiques.

VARIABLES STANDARDS :
- {{participantName}} : Nom du récipiendaire.
- {{trainingTitle}} : Nom de la formation ou de l'événement.
- {{issueDate}} : Date d'émission.
- {{organization}} : Nom de l'organisme.
- {{instructor}} : Nom du signataire/formateur.

STRUCTURE DU CODE :
- Si HTML : Doit être un document complet (<!DOCTYPE html>, <html>, <head>, <body>). Ajoute contenteditable="true" sur les éléments textuels pour permettre l'édition.
- Si LaTeX : Doit être compilable (\\documentclass{article}, \\usepackage[utf8]{inputenc}, etc.).

IMPORTANT : 
Si l'utilisateur demande "une affiche" ou "un certificat" sans préciser le format, utilise HTML + Tailwind CSS pour garantir un rendu visuel immédiat dans l'interface.`;
    }

    private extractJSON(text: string): string | null {
        // Try to find JSON in code blocks first
        const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
            return codeBlockMatch[1].trim();
        }

        // Try to find the first '{' and last '}'
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            return text.substring(firstBrace, lastBrace + 1);
        }

        return null;
    }

    /**
     * Generate text content for a specific context
     */
    async generateText(context: string): Promise<string> {
        const messages: AIMessage[] = [
            { role: "system", content: "You are a professional copywriter. Output only the requested text, no introspection." },
            { role: "user", content: `Generate professional text for the following context: ${context}. Keep it concise and formal.` }
        ];

        try {
            return await callAI(messages, 0.5);
        } catch (error) {
            console.error('Text Generation Error:', error);
            throw new Error('Failed to generate text');
        }
    }

    /**
     * Build system prompt for template generation
     */
    private buildSystemPrompt(
        category: string,
        style: string,
        colorScheme?: string[],
        width: number = 1200,
        height: number = 800
    ): string {
        const colors = colorScheme?.join(', ') || '#1A1A1A, #D4AF37, #FFFFFF';

        return `You are an expert graphic designer specializing in ${category} design. Generate a Konva.js JSON template.

REQUIREMENTS:
- Category: ${category}
- Style: ${style}
- Dimensions: ${width}x${height}px
- Color Scheme: ${colors}
- Must include: border/frame, title, content area, signature area
- Use variables like {{participantName}}, {{date}}, {{organization}}, {{trainingTitle}}
- Professional, print-ready design

OUTPUT FORMAT (JSON only):
{
  "attrs": {
    "width": ${width},
    "height": ${height}
  },
  "className": "Stage",
  "children": [
    {
      "attrs": {
        "name": "background"
      },
      "className": "Layer",
      "children": [
        {
          "attrs": {
            "x": 0,
            "y": 0,
            "width": ${width},
            "height": ${height},
            "fill": "#FFFFFF"
          },
          "className": "Rect"
        }
      ]
    },
    {
      "attrs": {
        "name": "content"
      },
      "className": "Layer",
      "children": [
        // Add Text, Rect, Image, Line elements here
        // Use className: "Text", "Rect", "Image", "Line", "Circle"
        // For text with variables: "text": "{{variableName}}"
      ]
    }
  ]
}

IMPORTANT:
- Return ONLY valid JSON
- Use proper Konva.js structure
- Include x, y, width, height for all shapes
- Use fontSize, fontFamily, fill for text
- Add decorative elements (borders, lines, shapes)`;
    }

    /**
     * Normalize canvas data to ensure proper structure
     */
    private normalizeCanvasData(data: any, width: number, height: number): KonvaJSON {
        // Ensure root structure
        const sanitized = this.sanitizeCanvasData(data);

        return {
            attrs: {
                width,
                height,
                ...sanitized.attrs
            },
            className: sanitized.className || 'Stage',
            children: sanitized.children || []
        };
    }

    /**
     * Sanitize canvas data to prevent frontend crashes
     */
    private sanitizeCanvasData(data: any): any {
        if (!data || typeof data !== 'object') {
            return { attrs: {}, className: 'Stage', children: [] };
        }

        // Deep clone to avoid mutation issues
        const clean = { ...data };

        // Ensure attrs is object
        if (!clean.attrs || typeof clean.attrs !== 'object') {
            clean.attrs = {};
        }

        // Ensure children is array
        if (!clean.children || !Array.isArray(clean.children)) {
            clean.children = [];
        }

        // Recursively sanitize children
        clean.children = clean.children.map((child: any) => {
            if (!child || typeof child !== 'object') {
                return null;
            }

            // Fix common Llama structure errors (e.g. using 'items' instead of 'children')
            if (child.items && !child.children) {
                child.children = child.items;
            }

            // Ensure children is array for layers/groups
            if (child.children && !Array.isArray(child.children)) {
                child.children = [];
            } else if (!child.children && (child.className === 'Layer' || child.className === 'Group')) {
                child.children = [];
            }

            // Sanitize attributes
            if (child.attrs) {
                // Convert string numbers to real numbers for x, y, width, height, radius, fontSize
                ['x', 'y', 'width', 'height', 'radius', 'fontSize', 'strokeWidth'].forEach(prop => {
                    if (child.attrs[prop] && typeof child.attrs[prop] === 'string') {
                        const num = parseFloat(child.attrs[prop]);
                        if (!isNaN(num)) child.attrs[prop] = num;
                    }
                });
            }

            // Recurse
            if (child.children) {
                child.children = this.sanitizeCanvasData({ children: child.children }).children;
            }

            return child;
        }).filter((child: any) => child !== null);

        return clean;
    }

    /**
     * Extract variables from canvas data
     */
    private extractVariables(canvasData: KonvaJSON): any[] {
        const variables = new Set<string>();
        const variableRegex = /\{\{(\w+)\}\}/g;

        const extractFromNode = (node: any) => {
            if (node.attrs?.text) {
                const matches = node.attrs.text.matchAll(variableRegex);
                for (const match of matches) {
                    variables.add(match[1]);
                }
            }
            if (node.children) {
                node.children.forEach(extractFromNode);
            }
        };

        canvasData.children?.forEach(extractFromNode);

        return Array.from(variables).map(name => ({
            name,
            type: this.guessVariableType(name),
            required: true
        }));
    }

    /**
     * Guess variable type from name
     */
    private guessVariableType(name: string): 'text' | 'date' | 'number' | 'image' {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('date') || lowerName.includes('day')) return 'date';
        if (lowerName.includes('number') || lowerName.includes('count')) return 'number';
        if (lowerName.includes('image') || lowerName.includes('logo') || lowerName.includes('photo')) return 'image';
        return 'text';
    }

    /**
     * Extract background color from canvas data
     */
    private extractBackgroundColor(canvasData: KonvaJSON): string {
        const backgroundLayer = canvasData.children?.find(
            (child: any) => child.attrs?.name === 'background'
        );
        const bgRect = backgroundLayer?.children?.[0];
        return bgRect?.attrs?.fill || '#FFFFFF';
    }

    /**
     * Extract template name from prompt
     */
    private extractTemplateName(prompt: string, category: string): string {
        // Simple extraction - take first few words
        const words = prompt.split(' ').slice(0, 5).join(' ');
        return `${category.charAt(0).toUpperCase() + category.slice(1)} - ${words}`;
    }
}

export const aiGeneratorService = new AIGeneratorService();
