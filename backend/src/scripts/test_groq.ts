
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Mock types
interface CanvasTemplate {
    name: string;
    description: string;
    category: string;
    canvasData: any;
    variables: any[];
    width: number;
    height: number;
    backgroundColor: string;
    version: number;
    isPublic: boolean;
}

interface KonvaJSON {
    attrs: any;
    className: string;
    children?: any[];
}

class AIGeneratorService {
    private apiKey: string;
    private apiUrl = "https://api.groq.com/openai/v1/chat/completions";

    constructor() {
        // In docker, use process.env directly if dotenv fails
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.warn('GROQ_API_KEY is not set. AI features will fail.');
        }
        this.apiKey = apiKey || '';
    }

    private async callGroq(messages: any[], temperature: number = 0.2, model: string = "llama-3.3-70b-versatile"): Promise<string> {
        if (!this.apiKey) throw new Error('GROQ_API_KEY not configured');

        console.log('Fetching from:', this.apiUrl);
        console.log('Model:', model);

        const response = await fetch(this.apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model,
                messages,
                temperature
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API Error: ${response.status} - ${errorText}`);
        }

        const data: any = await response.json();
        return data.choices?.[0]?.message?.content || '';
    }

    async generateTemplate(prompt: string): Promise<CanvasTemplate> {
        const category = 'certificate';
        const style = 'modern';
        const width = 1200;
        const height = 800;

        const systemPrompt = this.buildSystemPrompt(category, style, undefined, width, height);

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: `User Request: ${prompt}\n\nGenerate a complete Konva.js JSON template.` }
        ];

        try {
            console.log('Attempting AI generation with Groq (Llama 3.3)...');
            const text = await this.callGroq(messages);
            console.log('✅ Success with Groq');
            console.log('--- Raw AI Response ---');
            console.log(text);
            console.log('-----------------------');

            const jsonText = this.extractJSON(text);
            if (!jsonText) {
                console.error('Failed to extract JSON. Raw text:', text);
                throw new Error('Failed to extract valid JSON from AI response');
            }
            console.log('--- Extracted JSON ---');
            console.log(jsonText);
            console.log('----------------------');

            const canvasData: KonvaJSON = JSON.parse(jsonText);

            // Validate structure
            if (!canvasData.children || !Array.isArray(canvasData.children)) {
                console.error('!!! CANVAS DATA CHILDREN IS NOT ARRAY:', canvasData.children);
            } else {
                canvasData.children.forEach((layer, i) => {
                    if (!layer.children || !Array.isArray(layer.children)) {
                        console.error(`!!! LAYER ${i} CHILDREN IS NOT ARRAY:`, layer.children);
                    }
                });
            }

            const template: CanvasTemplate = {
                name: "Test Template",
                description: `Generated from: ${prompt}`,
                category,
                canvasData: this.normalizeCanvasData(canvasData, width, height),
                variables: [],
                width,
                height,
                backgroundColor: '#FFFFFF',
                version: 1,
                isPublic: false
            };

            return template;
        } catch (error) {
            console.error('AI Processing Error:', error);
            throw error;
        }
    }

    private extractJSON(text: string): string | null {
        const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
            return codeBlockMatch[1].trim();
        }
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            return text.substring(firstBrace, lastBrace + 1);
        }
        return null;
    }

    private buildSystemPrompt(category: string, style: string, colorScheme: string[] | undefined, width: number, height: number): string {
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

    private normalizeCanvasData(data: any, width: number, height: number): KonvaJSON {
        return {
            attrs: {
                width,
                height,
                ...data.attrs
            },
            className: data.className || 'Stage',
            children: data.children || []
        };
    }
}

async function run() {
    const service = new AIGeneratorService();
    try {
        await service.generateTemplate("Create a modern certificate for a Hackathon winner");
    } catch (e) {
        console.error("Run failed", e);
    }
}

run();
