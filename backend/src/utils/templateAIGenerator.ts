import { callAI, AIMessage } from './aiConfig';

export interface TemplateGenerationRequest {
    type: 'attestation' | 'certificat' | 'affiche';
    customPrompt?: string;
}

export interface TemplateGenerationResponse {
    type: string;
    html: string;
    variables: string[];
    description: string;
    width?: number;
    height?: number;
}

export class TemplateAIGenerator {
    constructor() { }

    /**
     * Build system prompt for template generation
     */
    private buildSystemPrompt(): string {
        return `Tu es un expert mondial en design de documents officiels (attestations, diplômes, affiches).
Ton objectif est de produire des templates HTML + Tailwind CSS qui ont **la même qualité typographique et visuelle que LaTeX**.

### REFERENCE DE STYLE (Inspired by LaTeX) :
Tu dois t'inspirer de la rigueur et de l'élégance de ce code LaTeX (mais tu dois générer du HTML) :
- **Couleurs** : Navy Blue (#1a3668) et Or (#b8860b).
- **Structure** : Double bordure (une épaisse bleue externe, une fine dorée interne).
- **Typographie** : "Noto Sans", "Playfair Display" ou polices Serif élégantes.
- **Rendu** : Centré, aéré, minimaliste mais prestigieux.

### RÈGLES DE GÉNÉRATION (CRITIQUE) :
1. **Qualité d'Imprimerie** : Utilise des marges généreuses (p-10 ou p-16), des espacements précis.
2. **Double Bordure** : Crée un effet de cadre sophistiqué (ex: une div relative avec une bordure, contenant une autre div avec une autre bordure).
3. **Tailwind CSS** : Utilise \`border-[color]\`, \`shadow-2xl\`, \`bg-white\`, \`font-serif\`.
4. **Dimensions Dynamiques** :
   - DÉCIDE du format : A4 Paysage (1123x794), A4 Portrait (794x1123), A3, etc.
   - Adapte le CSS au format choisi.

### CONTRAINTES TECHNIQUES :
1. Code **100% HTML + Tailwind CSS** (CDN).
2. **Aucun JS externe**.
3. Ajoute \`data-editable="true"\` sur CHAQUE texte modifiable.
4. Variables : {{nom}}, {{date}}, {{titre}}, {{description}}.
5. Variables CSS de base :
   - Primary: #1a3668 (Bleu Silma)
   - Accent: #b8860b (Or Prestige)

### FORMAT DE SORTIE (JSON) :
{
  "type": "attestation | certificat | affiche",
  "html": "<html>...</html>",
  "width": 1123,
  "height": 794,
  "variables": ["nom", "date"],
  "description": "Design style LaTeX, cadre double bordure or/bleu, format paysage"
}

### EXEMPLE HTML (Structure Type LaTeX) :
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
  <style>
    body { margin: 0; background: #e5e7eb; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .page { width: {{width}}px; height: {{height}}px; background: white; position: relative; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
  </style>
</head>
<body>
  <div class="page p-8 flex flex-col items-center justify-center text-center">
    <!-- Cadre Externe -->
    <div class="absolute inset-4 border-[3px] border-[#1a3668] pointer-events-none"></div>
    <!-- Cadre Interne -->
    <div class="absolute inset-8 border border-[#b8860b] pointer-events-none"></div>
    
    <!-- Contenu -->
    <div class="z-10 w-full max-w-4xl space-y-8">
       <div data-editable="true" class="text-[#1a3668] font-bold text-xl tracking-wider">SILMA SAS</div>
       
       <div data-editable="true" class="text-6xl font-['Playfair_Display'] text-[#1a3668] font-bold mt-8 mb-4">
         Certificat de Réussite
       </div>
       
       <div class="w-32 h-1 bg-[#b8860b] mx-auto rounded-full"></div>
       
       <div data-editable="true" class="text-xl text-gray-600 italic">Décerné à</div>
       
       <div data-editable="true" class="text-5xl font-bold text-gray-900 py-4">{{nom}}</div>
       
       <div data-editable="true" class="text-lg text-gray-700">
         Pour avoir complété avec succès la formation<br>
         <span class="font-bold text-[#1a3668]">Développement Full Stack</span>
       </div>
       
       <div class="flex justify-between w-full px-20 pt-16">
          <div class="text-center">
             <div class="font-bold text-[#1a3668]">Le Formateur</div>
             <div class="text-sm text-gray-500 mt-12">Signature</div>
          </div>
          <div class="text-center">
             <div class="font-bold text-[#1a3668]">La Direction</div>
             <div class="text-sm text-gray-500 mt-12">Cachet</div>
          </div>
       </div>
    </div>
  </div>
</body>
</html>`;
    }

    /**
     * Build user prompt based on type and custom prompt
     */
    private buildUserPrompt(type: string, customPrompt?: string): string {
        const typeDescriptions = {
            'attestation': 'une attestation de formation professionnelle, sobre et formelle',
            'certificat': 'un certificat de réussite élégant et prestigieux',
            'affiche': 'une affiche événementielle moderne et attractive'
        };

        const basePrompt = `Génère ${typeDescriptions[type as keyof typeof typeDescriptions] || 'un document professionnel'}.`;

        if (customPrompt) {
            return `${basePrompt}\n\nDemande spécifique : ${customPrompt}`;
        }

        return basePrompt;
    }

    /**
     * Extract JSON from AI response
     */
    private extractJSON(text: string): any {
        // Try to find JSON in code blocks first
        const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
            try {
                return JSON.parse(codeBlockMatch[1].trim());
            } catch (e) {
                console.warn('Failed to parse JSON from code block');
            }
        }

        // Try to find the first '{' and last '}'
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            try {
                return JSON.parse(text.substring(firstBrace, lastBrace + 1));
            } catch (e) {
                console.warn('Failed to parse JSON from braces');
            }
        }

        throw new Error('No valid JSON found in AI response');
    }

    /**
     * Validate generated template response
     */
    private validateResponse(response: any): TemplateGenerationResponse {
        if (!response.type || !response.html || !response.variables || !response.description) {
            throw new Error('Invalid template response: missing required fields');
        }

        if (!['attestation', 'certificat', 'affiche'].includes(response.type)) {
            throw new Error('Invalid template type');
        }

        if (!Array.isArray(response.variables)) {
            throw new Error('Variables must be an array');
        }

        return {
            ...response,
            width: response.width || 794,
            height: response.height || 1123
        } as TemplateGenerationResponse;
    }

    /**
     * Generate a professional HTML template
     */
    async generateTemplate(request: TemplateGenerationRequest): Promise<TemplateGenerationResponse> {
        const { type, customPrompt } = request;

        const systemPrompt = this.buildSystemPrompt();
        const userPrompt = this.buildUserPrompt(type, customPrompt);

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ];

        try {
            console.log(`🎨 Generating ${type} template...`);
            const aiResponse = await callAI(messages as AIMessage[], 0.7);
            console.log('✅ AI response received');

            // Extract and parse JSON
            const jsonResponse = this.extractJSON(aiResponse);

            // Validate response
            const validatedResponse = this.validateResponse(jsonResponse);

            console.log(`✅ Template generated successfully with ${validatedResponse.variables.length} variables`);
            return validatedResponse;

        } catch (error) {
            console.error('❌ Template generation failed:', error);
            throw new Error(`Template generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

export const templateAIGenerator = new TemplateAIGenerator();
