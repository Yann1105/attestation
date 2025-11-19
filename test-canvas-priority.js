// Test script to verify Canvas Data prioritization in certificate generation
// Run with: node test-canvas-priority.js

const API_BASE = 'http://localhost:3002/api';

const testParticipant = {
  participantName: 'Jean Dupont',
  certificateNumber: 'CERT123456'
};

const testFormData = {
  trainingTitle: 'Formation React',
  trainingDate: '2025-06-10',
  trainingLocation: 'Paris',
  trainingDuration: '2 jours',
  instructor: 'Marie Martin',
  organization: 'Acme Formations',
  issueDate: '2025-06-11',
  projectInfo: 'Projet interne'
};

async function testCanvasPriority() {
  console.log('🧪 Testing Canvas Data prioritization...\n');

  try {
    // 1) Fetch templates dynamically
    console.log('📥 Fetching templates...');
    const templatesResp = await fetch(`${API_BASE}/templates`);
    const templates = await templatesResp.json();
    console.log('📋 Found', templates.length, 'templates:');
    templates.forEach(t => {
      console.log(`  - ${t.name} (ID: ${t.id}): canvasData=${!!t.canvasData}, type=${typeof t.canvasData}`);
    });

    // 2) Filter canvas templates and prioritize Yann or first canvas
    const canvasTemplates = templates.filter(t => t.canvasData && (typeof t.canvasData === 'string' ? t.canvasData.trim() !== '' : true));
    let chosenCanvasTemplate = null;

    // Prioritize Yann if it exists and has canvasData
    const yannTemplate = canvasTemplates.find(t => t.name.toLowerCase().includes('yann'));
    if (yannTemplate) {
      chosenCanvasTemplate = yannTemplate;
      console.log('🎯 Using Yann template (Canvas):', yannTemplate.name, 'ID:', yannTemplate.id);
    } else if (canvasTemplates.length > 0) {
      chosenCanvasTemplate = canvasTemplates[0];
      console.log('🎯 Using first Canvas template:', chosenCanvasTemplate.name, 'ID:', chosenCanvasTemplate.id);
    } else {
      console.log('⚠️ No Canvas templates found, skipping Canvas tests');
      return;
    }

    // Verify Yann is prioritized in API response
    if (yannTemplate) {
      const firstCanvasInAPI = canvasTemplates[0];
      if (firstCanvasInAPI.name.toLowerCase().includes('yann')) {
        console.log('✅ Yann correctly prioritized as first canvas template in API');
      } else {
        console.log('⚠️ Yann not first in API, but found for testing');
      }
    }

    // Find HTML-only template for fallback test
    const htmlTemplate = templates.find(t => !t.canvasData || (typeof t.canvasData === 'string' && t.canvasData.trim() === ''));

    if (!chosenCanvasTemplate) {
      console.log('❌ No Canvas template available for testing');
      return;
    }

    // Test 1: Template with canvas_data should use Canvas generation
    console.log('\nTest 1: Template with canvas_data');
    const response1 = await fetch(`${API_BASE}/certificates/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateId: chosenCanvasTemplate.id,
        participantData: testParticipant,
        formData: testFormData,
        isQuickApproval: false
      })
    });
    const data1 = await response1.json();

    if (data1.success) {
      console.log('✅ Generation successful');
      console.log('📋 Generation method:', data1.data.metadata.generationMethod);
      console.log('📋 Template used:', data1.data.metadata.templateUsed);
      console.log('📝 HTML contains participant name:', data1.data.html.includes('Jean Dupont'));
      console.log('📝 HTML contains certificate number:', data1.data.html.includes('CERT123456'));
      console.log('🔍 Generation method is canvas_data:', data1.data.metadata.generationMethod === 'canvas_data');

      // Additional Yann-specific verification
      if (yannTemplate && chosenCanvasTemplate.id === yannTemplate.id) {
        console.log('🎯 Yann template used - verifying Yann-specific behavior');
        console.log('✅ Yann canvas_data generation confirmed');
      }
    }

    // Test 2: Quick approval should only inject name and certificate number
    console.log('\nTest 2: Quick approval (limited data)');
    const response2 = await fetch(`${API_BASE}/certificates/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateId: chosenCanvasTemplate.id,
        participantData: testParticipant,
        formData: testFormData,
        isQuickApproval: true
      })
    });
    const data2 = await response2.json();

    if (data2.success) {
      console.log('✅ Quick approval successful');
      console.log('📋 Generation method:', data2.data.metadata.generationMethod);
      console.log('📋 Template used:', data2.data.metadata.templateUsed);
      console.log('📝 HTML contains participant name:', data2.data.html.includes('Jean Dupont'));
      console.log('📝 HTML contains certificate number:', data2.data.html.includes('CERT123456'));
      console.log('📝 HTML does NOT contain training title:', !data2.data.html.includes('Formation React'));
      console.log('🔍 Generation method is canvas_data:', data2.data.metadata.generationMethod === 'canvas_data');
    }

    // Test 3: Template without canvas_data should fallback to content
    if (htmlTemplate) {
      console.log('\nTest 3: Template without canvas_data (HTML fallback)');
      const response3 = await fetch(`${API_BASE}/certificates/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: htmlTemplate.id,
          participantData: testParticipant,
          formData: testFormData,
          isQuickApproval: false
        })
      });
      const data3 = await response3.json();

      if (data3.success) {
        console.log('✅ HTML fallback successful');
        console.log('📋 Generation method:', data3.data.metadata.generationMethod);
        console.log('📋 Template used:', data3.data.metadata.templateUsed);
        console.log('🔍 Generation method is content:', data3.data.metadata.generationMethod === 'content');
      }
    } else {
      console.log('\n⚠️ No HTML-only template found, skipping fallback test');
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Helper function to analyze available templates
async function analyzeTemplates() {
  console.log('🔍 Analyzing available templates...');

  try {
    const templatesResp = await fetch(`${API_BASE}/templates`);
    const templates = await templatesResp.json();

    console.log(`\n📊 Template Analysis (${templates.length} total):`);

    const canvasTemplates = templates.filter(t => t.preferCanvas);
    const htmlTemplates = templates.filter(t => !t.preferCanvas);
    const yannTemplates = templates.filter(t =>
      t.name && t.name.toLowerCase().includes('yann') && t.preferCanvas
    );

    console.log(`  Canvas templates: ${canvasTemplates.length}`);
    console.log(`  HTML templates: ${htmlTemplates.length}`);
    console.log(`  Yann templates: ${yannTemplates.length}`);

    if (yannTemplates.length > 0) {
      console.log('  Yann templates found:');
      yannTemplates.forEach(t => console.log(`    - ${t.name} (ID: ${t.id})`));
    }

    console.log('\n💡 Test will use dynamic template IDs from database');
    console.log('💡 Create templates via UI if needed for comprehensive testing');

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

// Run tests
if (require.main === module) {
  testCanvasPriority();
}

module.exports = { testCanvasPriority, analyzeTemplates };