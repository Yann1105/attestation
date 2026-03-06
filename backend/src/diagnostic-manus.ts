import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const key = process.env.MANUS_API_KEY || '';
const model = process.env.MANUS_MODEL || 'manus-1.6-lite';

async function testEndpoint(url: string, headers: any) {
    console.log(`\nTesting: ${url}`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify({
                model,
                messages: [{ role: 'user', content: 'hi' }]
            })
        });
        console.log(`Status: ${response.status} ${response.statusText}`);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Success!');
            return true;
        } else {
            const text = await response.text();
            console.log(`❌ Failed: ${text}`);
        }
    } catch (e: any) {
        console.log(`🔥 Error: ${e.message}`);
    }
    return false;
}

async function runTests() {
    console.log('🧪 DIAGNOSTIC TEST FOR MANUS AI API');
    console.log('Key length:', key.length);

    const endpoints = [
        'https://api.manus-ai.com/v1/chat/completions',
        'https://api.manus.ai/v1/tasks',
        'https://api.manus.im/api/llm-proxy/v1/chat/completions',
        'https://api.manus.im/v1/chat/completions',
        'https://api.manus.im/chat/completions',
        'https://api.manus.ai/v1/chat/completions',
        'https://api.manus.ai/chat/completions'
    ];

    const headerConfigs = [
        { "API_KEY": key },
        { "Authorization": `Bearer ${key}` },
        { "x-api-key": key }
    ];

    for (const url of endpoints) {
        for (const headers of headerConfigs) {
            const hStr = Object.keys(headers)[0];
            console.log(`--- Using header: ${hStr} ---`);
            const ok = await testEndpoint(url, headers);
            if (ok) process.exit(0);
        }
    }
}

runTests();
