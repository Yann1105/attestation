// Script de test pour vérifier la configuration email
// Usage: node test-email.js

const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  try {
    console.log('🔧 Test de configuration email...\n');

    // Vérifier les variables d'environnement
    console.log('📧 Configuration SMTP:');
    console.log(`   Host: ${process.env.SMTP_HOST}`);
    console.log(`   Port: ${process.env.SMTP_PORT}`);
    console.log(`   User: ${process.env.SMTP_USER}`);
    console.log(`   Pass: ${process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-3) : 'NON DÉFINI'}\n`);

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('❌ Configuration SMTP incomplète. Vérifiez votre fichier .env');
      return;
    }

    // Créer le transporteur
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Tester la connexion
    console.log('🔗 Test de connexion SMTP...');
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie!\n');

    // Envoyer un email de test
    console.log('📤 Envoi d\'un email de test...');
    const info = await transporter.sendMail({
      from: `"Test BIMADES" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // S'envoyer à soi-même
      subject: 'Test Configuration Email BIMADES',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>✅ Configuration Email Réussie!</h2>
          <p>Votre configuration SMTP fonctionne correctement.</p>
          <p>Les certificats peuvent maintenant être envoyés aux participants.</p>
          <hr>
          <small>Test envoyé le ${new Date().toLocaleString('fr-FR')}</small>
        </div>
      `
    });

    console.log('✅ Email de test envoyé avec succès!');
    console.log(`   Message ID: ${info.messageId}`);

    if (process.env.NODE_ENV === 'development') {
      console.log(`   Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

  } catch (error) {
    console.log('❌ Erreur lors du test email:');
    console.log(error.message);

    if (error.code === 'EAUTH') {
      console.log('\n💡 Conseils:');
      console.log('   - Vérifiez votre nom d\'utilisateur et mot de passe');
      console.log('   - Pour Gmail: utilisez un mot de passe d\'application');
      console.log('   - Activez l\'authentification 2 facteurs si nécessaire');
    }
  }
}

testEmail();