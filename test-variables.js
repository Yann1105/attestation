// test-variables.js
const { CertificateGenerator } = require('./backend/dist/utils/certificateGenerator');
const fs = require('fs');

async function testVariables() {
  console.log('🧪 Test de visibilité et injection des variables\n');

  const generator = new CertificateGenerator();

  // Données de test
  const testData = {
    participantName: 'Jean Dupont',
    certificateNumber: 'CERT123456',
    trainingTitle: 'Formation React Avancé',
    trainingDate: '2024-01-15',
    trainingLocation: 'Paris',
    trainingDuration: '40 heures',
    instructor: 'Marie Martin',
    organization: 'Tech Corp',
    issueDate: '2024-01-20'
  };

  // Template Canvas simulé avec variables
  const mockCanvasData = {
    width: 1200,
    height: 850,
    backgroundColor: '#ffffff',
    objects: [
      {
        type: 'textbox',
        text: '{{participantName}}',
        left: 100,
        top: 100,
        width: 300,
        fontSize: 20,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        fill: '#2563eb'
      },
      {
        type: 'textbox',
        text: 'Certificat pour {{trainingTitle}}',
        left: 100,
        top: 150,
        width: 400,
        fontSize: 16,
        fontFamily: 'Arial',
        fill: '#000000'
      }
    ]
  };

  try {
    // Test génération HTML avec Canvas
    const html = generator.generateHTMLFromCanvasWithData(mockCanvasData, testData, {});
    console.log('✅ HTML généré avec succès');

    // Vérifier que les variables sont injectées
    const checks = [
      { variable: 'participantName', expected: 'Jean Dupont' },
      { variable: 'trainingTitle', expected: 'Formation React Avancé' },
      { variable: 'certificateNumber', expected: 'CERT123456' }
    ];

    let allPassed = true;
    checks.forEach(check => {
      if (html.includes(check.expected)) {
        console.log(`✅ Variable {{${check.variable}}} correctement injectée: "${check.expected}"`);
      } else {
        console.log(`❌ Variable {{${check.variable}}} NON trouvée dans le HTML`);
        allPassed = false;
      }
    });

    // Vérifier l'absence de syntaxe ancienne
    if (html.includes('[[') || html.includes(']]')) {
      console.log('❌ Syntaxe ancienne [[variable]] détectée dans le HTML');
      allPassed = false;
    } else {
      console.log('✅ Aucune syntaxe ancienne [[variable]] détectée');
    }

    // Sauvegarder le HTML pour inspection visuelle
    fs.writeFileSync('./test-output.html', html);
    console.log('📄 HTML de test sauvegardé dans test-output.html');

    if (allPassed) {
      console.log('\n🎉 Tous les tests sont passés ! Les variables sont correctement visibles et injectées.');
    } else {
      console.log('\n⚠️ Certains tests ont échoué. Vérifiez les logs ci-dessus.');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testVariables();