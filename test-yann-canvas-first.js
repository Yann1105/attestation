// Dedicated test for Yann Canvas-first behavior
// Run with: node test-yann-canvas-first.js

const API_BASE = 'http://localhost:3002/api';

async function testYannCanvasFirst() {
  console.log('🧪 Testing Yann Canvas-first behavior...\n');

  try {
    // 1. Fetch templates dynamically
    console.log('📥 Fetching templates...');
    const templatesResp = await fetch(`${API_BASE}/templates`);
    const templates = await templatesResp.json();
    console.log(`Found ${templates.length} templates\n`);

    // 2. Find Yann template with canvasData
    const yannTemplate = templates.find(t =>
      t.name && t.name.toLowerCase().includes('yann') && t.canvasData &&
      (typeof t.canvasData === 'object' ||
       (typeof t.canvasData === 'string' && t.canvasData.trim().length > 0))
    );

    if (!yannTemplate) {
      console.log('⚠️  Yann template with canvasData not found. Available templates:');
      templates.forEach(t => {
        const hasCanvas = t.canvasData &&
          (typeof t.canvasData === 'object' ||
           (typeof t.canvasData === 'string' && t.canvasData.trim().length > 0));
        console.log(`  - ${t.name}: canvasData=${hasCanvas}, isYann=${t.name && t.name.toLowerCase().includes('yann')}`);
      });
      console.log('\n❌ Yann Canvas-first test cannot proceed without Yann template');
      return;
    }

    console.log(`✅ Found Yann template: ${yannTemplate.name} (ID: ${yannTemplate.id})\n`);

    // 3. Test Yann generation
    console.log('Test 1: Yann Canvas-first generation');
    const testData = {
      participantData: {
        participantName: 'Yann Test User',
        certificateNumber: 'CERT_YANN_001'
      },
      formData: {
        trainingTitle: 'Formation Yann',
        trainingDate: '2025-01-01',
        trainingLocation: 'Paris',
        trainingDuration: '2 jours',
        instructor: 'Formateur Yann',
        organization: 'Entreprise Yann'
      }
    };

    const response = await fetch(`${API_BASE}/certificates/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: yannTemplate.id,
        ...testData
      })
    });

    if (!response.ok) {
      throw new Error(`Generation failed: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log('✅ Yann generation successful');
      console.log(`  Generation method: ${result.data.metadata.generationMethod}`);
      console.log(`  Expected: canvas_data`);
      console.log(`  ✅ Method correct: ${result.data.metadata.generationMethod === 'canvas_data'}`);

      // Verify content injection
      const html = result.data.html;
      const hasName = html.includes('Yann Test User');
      const hasNumber = html.includes('CERT_YANN_001');

      console.log(`  ✅ Name injected: ${hasName}`);
      console.log(`  ✅ Number injected: ${hasNumber}`);

      if (!hasName || !hasNumber) {
        console.log('❌ Content injection verification failed');
        console.log('  HTML preview:', html.substring(0, 300) + '...');
      } else {
        console.log('✅ Content injection verified');
      }
    } else {
      console.log('❌ Yann generation failed:', result.error);
      return;
    }

    // 4. Test Yann fallback (force no canvas data)
    console.log('\nTest 2: Yann fallback when canvas data empty');

    // Find a template without canvas data for fallback test
    const htmlTemplate = templates.find(t => !t.canvasData ||
      (typeof t.canvasData === 'string' && t.canvasData.trim() === ''));

    if (!htmlTemplate) {
      console.log('⚠️  No HTML template found for fallback test');
    } else {
      console.log(`Using HTML template for fallback: ${htmlTemplate.name}`);

      const fallbackResponse = await fetch(`${API_BASE}/certificates/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: htmlTemplate.id,
          ...testData
        })
      });

      if (fallbackResponse.ok) {
        const fallbackResult = await fallbackResponse.json();
        if (fallbackResult.success) {
          console.log('✅ HTML fallback successful');
          console.log(`  Generation method: ${fallbackResult.data.metadata.generationMethod}`);
          console.log(`  Expected: content`);
          console.log(`  ✅ Method correct: ${fallbackResult.data.metadata.generationMethod === 'content'}`);
        } else {
          console.log('❌ HTML fallback failed:', fallbackResult.error);
        }
      } else {
        console.log('❌ HTML fallback request failed');
      }
    }

    // 5. Verify Yann is canvas-first in template list
    console.log('\nTest 3: Yann canvas-first priority in API');
    const canvasTemplates = templates.filter(t => t.preferCanvas);
    const firstCanvasTemplate = canvasTemplates[0];

    if (firstCanvasTemplate && firstCanvasTemplate.name.toLowerCase().includes('yann')) {
      console.log('✅ Yann is correctly prioritized as first canvas template');
    } else {
      console.log('⚠️  Yann is not the first canvas template');
      console.log('  First canvas template:', firstCanvasTemplate ? firstCanvasTemplate.name : 'None');
    }

    console.log('\n🎉 Yann Canvas-first tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testYannCanvasFirst();
}

module.exports = { testYannCanvasFirst };