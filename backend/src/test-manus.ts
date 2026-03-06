import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

import { callAI, AIMessage } from './utils/aiConfig';

async function testManus() {
    console.log('🧪 Testing Manus AI Integration...');
    console.log('Provider:', process.env.AI_PROVIDER);
    console.log('Model:', process.env.MANUS_MODEL);

    const messages: AIMessage[] = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "Manus AI is working!" if you can read this.' }
    ];

    try {
        const response = await callAI(messages);
        console.log('✅ Response from AI:');
        console.log('---');
        console.log(response);
        console.log('---');

        if (response.includes('Manus AI is working')) {
            console.log('🎉 SUCCESS: Integration is functional!');
        } else {
            console.log('⚠️ Partial success: Got a response but not the expected one.');
        }
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testManus();
