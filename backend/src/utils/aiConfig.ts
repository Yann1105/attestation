/**
 * AI Configuration Utility
 * Exclusively handles Manus AI
 */

export interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface AIConfig {
    apiKey: string;
    apiUrl: string;
    model: string;
}

export const getAIConfig = (): AIConfig => {
    return {
        apiKey: process.env.MANUS_API_KEY || 'sk-bxqJc74IXVBcjDYOg5d1Ad6Q_uNhPVmcV6w9YTX04NHJeyBUHhsIr0IR_MEXH4nZsG-55Co_DY4qRiD9qxlMn97DAu52',
        apiUrl: 'https://api.manus.ai/v1/tasks',
        model: process.env.MANUS_MODEL || 'manus-1.6-lite'
    };
};

/**
 * Call AI API based on current configuration (Manus AI only)
 */
export const callAI = async (messages: AIMessage[], temperature: number = 0.7): Promise<string> => {
    const config = getAIConfig();

    if (!config.apiKey) {
        throw new Error(`Manus AI API Key is not configured`);
    }

    console.log(`🤖 Calling AI Provider: Manus AI (${config.model})`);

    // --- Manus AI Task-based Flow ---

    // 1. Create the task
    const prompt = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

    const createResponse = await fetch(config.apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "API_KEY": config.apiKey
        },
        body: JSON.stringify({
            prompt,
            agentProfile: config.model,
            taskMode: 'chat',
            hideFromDashboard: true,
            createShareableLink: false
        })
    });

    if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`Manus Create Task Error: ${createResponse.status} - ${errorText}`);
    }

    const createData: any = await createResponse.json();
    const taskId = createData.task_id;

    if (!taskId) {
        throw new Error('Manus API did not return a task_id');
    }

    console.log(`⏳ Manus Task Created: ${taskId}. Polling for results...`);

    // 2. Poll for the result
    const pollUrl = `https://api.manus.ai/v1/tasks/${taskId}`;
    let attempts = 0;
    const maxAttempts = 90; // 90 * 2s = 180s (3 minutes) timeout

    while (attempts < maxAttempts) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));

        const pollResponse = await fetch(pollUrl, {
            headers: { "API_KEY": config.apiKey }
        });

        if (!pollResponse.ok) {
            console.error(`Polling error (${pollResponse.status}). Continuing...`);
            continue;
        }

        const pollData: any = await pollResponse.json();
        console.log(`   - Status: ${pollData.status} (Attempt ${attempts})`);

        if (pollData.status === 'completed') {
            // Extract result from output
            const output = pollData.output || [];
            let finalResult = '';

            for (const item of output) {
                if (item.content && Array.isArray(item.content)) {
                    for (const contentItem of item.content) {
                        if (contentItem.type === 'output_text') {
                            finalResult += contentItem.text;
                        }
                    }
                }
            }

            return finalResult || 'No text output found in Manus result.';
        }

        if (pollData.status === 'failed') {
            throw new Error(`Manus task failed: ${pollData.error_message || 'Unknown error'}`);
        }
    }

    throw new Error('Manus task timed out after 60 seconds.');
};
