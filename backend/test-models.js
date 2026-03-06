const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY not found');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log('Listing available models...');
        // The SDK doesn't have a direct listModels, we might need to use the REST API
        // or try common variations
        const models = [
            'gemini-1.5-flash',
            'gemini-1.5-flash-latest',
            'gemini-1.5-pro',
            'gemini-1.5-pro-latest',
            'gemini-pro',
            'gemini-pro-vision'
        ];

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                await model.generateContent('Hi');
                console.log(`✅ ${modelName} is available`);
            } catch (err) {
                console.log(`❌ ${modelName} failed: ${err.message}`);
            }
        }
    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();
