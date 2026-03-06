const key = 'sk-bxqJc74IXVBcjDYOg5d1Ad6Q_uNhPVmcV6w9YTX04NHJeyBUHhsIr0IR_MEXH4nZsG-55Co_DY4qRiD9qxlMn97DAu52';
const model = 'manus-1.6-lite';

async function testChatCompletion() {
    console.log("🚀 Testing Manus AI Chat Completions API...");

    try {
        const response = await fetch('https://api.manus.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: 'Hello, respond with only the word SUCCESS if you receive this.' }
                ]
            })
        });

        console.log(`📡 Status: ${response.status} ${response.statusText}`);
        const data = await response.json();
        console.log("✅ Response received:");
        console.log(JSON.stringify(data, null, 2));
    } catch (e: any) {
        console.error("🔥 Error during fetch:");
        console.error(e.message);
    }
}

testChatCompletion();
