
const https = require('https');

// Simple fetch polyfill/wrapper if needed, but Node 18 has fetch
// We'll use the class structure but in JS

class AIGeneratorService {
    constructor() {
        this.apiKey = process.env.GROQ_API_KEY;
        this.apiUrl = "https://api.groq.com/openai/v1/chat/completions";

        if (!this.apiKey) {
            console.warn('GROQ_API_KEY is not set. Env vars:', Object.keys(process.env));
        }
    }

    async callGroq(messages, temperature = 0.2, model = "llama-3.3-70b-versatile") {
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

        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    }

    async generateTemplate(prompt) {
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

            const canvasData = JSON.parse(jsonText);

            // Validate structure
            if (!canvasData.children || !Array.isArray(canvasData.children)) {
                console.error('!!! CANVAS DATA CHILDREN IS NOT ARRAY:', typeof canvasData.children);
                if (typeof canvasData.children === 'object') {
                    console.error('It is an object:', JSON.stringify(canvasData.children, null, 2));
                }
            } else {
                canvasData.children.forEach((layer, i) => {
                    if (!layer.children || !Array.isArray(layer.children)) {
                        console.error(`!!! LAYER ${i} CHILDREN IS NOT ARRAY:`, typeof layer.children);
                    }
                });
            }

            return {
                result: 'ok',
                canvasData: this.normalizeCanvasData(canvasData, width, height)
            };
        } catch (error) {
            console.error('AI Processing Error:', error);
            throw error;
        }
    }

    extractJSON(text) {
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

    buildSystemPrompt(category, style, colorScheme, width, height) {
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

    normalizeCanvasData(data, width, height) {
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
