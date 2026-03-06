const options = {
    method: 'POST',
    headers: {
        API_KEY: 'sk-bxqJc74IXVBcjDYOg5d1Ad6Q_uNhPVmcV6w9YTX04NHJeyBUHhsIr0IR_MEXH4nZsG-55Co_DY4qRiD9qxlMn97DAu52',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        prompt: 'Je veux un certificat pour une formation que j ai fait en full stack. Qui etait le 12 au 18 decembre 2025 a ouaga avec l entreprise silma sas. le formateur est Yann Boris OUEDRAOGO Expert en data/IA en code latex',
        agentProfile: 'manus-1.6-lite'
    })
};

console.log("🚀 Testing Manus AI Tasks API with user snippet...");

fetch('https://api.manus.ai/v1/tasks', options)
    .then(res => {
        console.log(`📡 Status: ${res.status} ${res.statusText}`);
        return res.json();
    })
    .then(res => {
        console.log("✅ Response received:");
        console.log(JSON.stringify(res, null, 2));
    })
    .catch(err => {
        console.error("❌ Error:");
        console.error(err);
    });
