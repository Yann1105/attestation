// Diagnostic script for robust template validation and Canvas-first verification
// Run with: node diagnostic-script.js

const API_BASE = 'http://localhost:3002/api';

async function runDiagnostics() {
  console.log('🔍 Running comprehensive template diagnostics...\n');

  try {
    // 1. Fetch templates dynamically
    console.log('📥 Fetching templates from API...');
    const templatesResp = await fetch(`${API_BASE}/templates`);
    if (!templatesResp.ok) {
      throw new Error(`Failed to fetch templates: ${templatesResp.status}`);
    }
    const templates = await templatesResp.json();
    console.log(`✅ Found ${templates.length} templates\n`);

    // 2. Analyze templates
    console.log('📊 Template Analysis:');
    const canvasTemplates = [];
    const htmlTemplates = [];
    let yannTemplate = null;

    templates.forEach(template => {
      const hasCanvasData = template.canvasData &&
        (typeof template.canvasData === 'object' ||
         (typeof template.canvasData === 'string' && template.canvasData.trim().length > 0));

      const isYann = template.name && template.name.toLowerCase().includes('yann');

      console.log(`  - ${template.name} (ID: ${template.id})`);
      console.log(`    Canvas Data: ${hasCanvasData ? '✅' : '❌'}`);
      console.log(`    Is Yann: ${isYann ? '✅' : '❌'}`);
      console.log(`    Type: ${hasCanvasData ? 'Canvas' : 'HTML'}`);

      if (hasCanvasData) {
        canvasTemplates.push(template);
        if (isYann) yannTemplate = template;
      } else {
        htmlTemplates.push(template);
      }
      console.log('');
    });

    // 3. Determine canvas-first and Yann candidate
    console.log('🎯 Canvas-first Strategy:');
    const canvasFirstTemplate = yannTemplate || (canvasTemplates.length > 0 ? canvasTemplates[0] : null);
    console.log(`  Canvas-first template: ${canvasFirstTemplate ? canvasFirstTemplate.name : 'None'}`);
    console.log(`  Yann template: ${yannTemplate ? yannTemplate.name : 'Not found'}`);
    console.log(`  Total Canvas templates: ${canvasTemplates.length}`);
    console.log(`  Total HTML templates: ${htmlTemplates.length}\n`);

    if (!canvasFirstTemplate) {
      console.log('⚠️  No Canvas templates available for testing\n');
      return;
    }

    // 4. Test generation with canvas-first template
    console.log('🧪 Testing Canvas-first generation:');
    const testData = {
      participantData: {
        participantName: 'Test User',
        certificateNumber: 'CERT_DIAG_001'
      },
      formData: {
        trainingTitle: 'Diagnostic Test',
        trainingDate: '2025-01-01',
        trainingLocation: 'Test Location',
        trainingDuration: '1 day',
        instructor: 'Test Instructor',
        organization: 'Test Org'
      }
    };

    const genResp = await fetch(`${API_BASE}/certificates/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: canvasFirstTemplate.id,
        ...testData
      })
    });

    if (!genResp.ok) {
      throw new Error(`Generation failed: ${genResp.status}`);
    }

    const genResult = await genResp.json();

    if (genResult.success) {
      console.log('✅ Generation successful');
      console.log(`  Generation method: ${genResult.data.metadata.generationMethod}`);
      console.log(`  Expected: canvas_data`);
      console.log(`  Match: ${genResult.data.metadata.generationMethod === 'canvas_data' ? '✅' : '❌'}`);

      // Verify content injection
      const html = genResult.data.html;
      const hasName = html.includes('Test User');
      const hasNumber = html.includes('CERT_DIAG_001');

      console.log(`  Name injection: ${hasName ? '✅' : '❌'}`);
      console.log(`  Number injection: ${hasNumber ? '✅' : '❌'}`);

      if (!hasName || !hasNumber) {
        console.log('❌ Content injection failed');
        console.log('  HTML preview:', html.substring(0, 200) + '...');
      }
    } else {
      console.log('❌ Generation failed:', genResult.error);
    }

    // 5. Test fallback to HTML if no canvas data
    if (htmlTemplates.length > 0) {
      console.log('\n🧪 Testing HTML fallback:');
      const htmlTemplate = htmlTemplates[0];

      const fallbackResp = await fetch(`${API_BASE}/certificates/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: htmlTemplate.id,
          ...testData
        })
      });

      if (fallbackResp.ok) {
        const fallbackResult = await fallbackResp.json();
        if (fallbackResult.success) {
          console.log('✅ HTML fallback successful');
          console.log(`  Generation method: ${fallbackResult.data.metadata.generationMethod}`);
          console.log(`  Expected: content`);
          console.log(`  Match: ${fallbackResult.data.metadata.generationMethod === 'content' ? '✅' : '❌'}`);
        } else {
          console.log('❌ HTML fallback failed:', fallbackResult.error);
        }
      } else {
        console.log('❌ HTML fallback request failed');
      }
    }

    // 6. Verify template structure
    console.log('\n🔍 Template Structure Verification:');
    templates.forEach(template => {
      const issues = [];

      if (!template.name || template.name.trim() === '') {
        issues.push('Missing name');
      }

      if (!template.id) {
        issues.push('Missing ID');
      }

      const hasCanvas = template.canvasData &&
        (typeof template.canvasData === 'object' ||
         (typeof template.canvasData === 'string' && template.canvasData.trim().length > 0));

      const hasContent = template.content && template.content.trim().length > 50;
      const hasElements = template.elements && Array.isArray(template.elements) && template.elements.length > 0;

      if (!hasCanvas && !hasContent && !hasElements) {
        issues.push('No content (canvasData, content, or elements)');
      }

      if (hasCanvas && typeof template.canvasData === 'string') {
        try {
          JSON.parse(template.canvasData);
          console.log(`  ✅ ${template.name}: Valid JSON canvasData`);
        } catch (e) {
          issues.push('Invalid JSON in canvasData');
        }
      }

      if (issues.length > 0) {
        console.log(`  ❌ ${template.name}: ${issues.join(', ')}`);
      } else {
        console.log(`  ✅ ${template.name}: Structure OK`);
      }
    });

    console.log('\n🎉 Diagnostics completed!');

  } catch (error) {
    console.error('❌ Diagnostics failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runDiagnostics();
}

module.exports = { runDiagnostics };